// S-4 (frente Diseño, paso 5): ¿una maqueta HTML de docs/diseno/ se ve viva dentro de Electron y F8 anda en ella?
// 1) miniatura: <iframe sandbox> con un protocolo propio (maqueta://) que sirve solo docs/diseno/;
// 2) grande: <webview> con file:// en la sesión de siempre, donde el ayudante de la Revisión carga la extensión.
import { readFile } from 'node:fs/promises'
import { join, dirname, normalize, extname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { app, BrowserWindow, protocol, net } from 'electron'

const AQUI = dirname(fileURLToPath(import.meta.url))
const DISENO = join(AQUI, 'diseno')
const r = {}
protocol.registerSchemesAsPrivileged([{ scheme: 'maqueta', privileges: { standard: true, supportFetchAPI: false } }])

app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')
app.setPath('userData', join(process.env.TEMP, 's4-maquetas-' + process.pid))
app.whenReady().then(async () => {
  protocol.handle('maqueta', async (req) => {
    const ruta = normalize(join(DISENO, decodeURIComponent(new URL(req.url).pathname)))
    if (!ruta.startsWith(DISENO)) return new Response('no', { status: 403 })
    const tipo = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }[extname(ruta)] ?? 'application/octet-stream'
    r.servidos = [...(r.servidos ?? []), ruta.slice(DISENO.length)]
    return new Response(await readFile(ruta), { headers: { 'content-type': tipo,
      'content-security-policy': "default-src 'none'; style-src maqueta: 'unsafe-inline'; script-src maqueta: 'unsafe-inline'; img-src maqueta: data:; font-src maqueta: data:" } })
  })
  const m = await import(pathToFileURL(join(process.env.APPDATA, 'Centro de Desarrollo', 'extension', 'electron', 'ayudante.mjs')).href)
  await m.revision()
  const w = new BrowserWindow({ x: -20000, y: -20000, skipTaskbar: true, width: 1300, height: 900, show: true, webPreferences: { webviewTag: true, contextIsolation: true, sandbox: true } })
  w.webContents.on('will-attach-webview', (_e, prefs) => { delete prefs.preload; prefs.nodeIntegration = false; prefs.contextIsolation = true; prefs.sandbox = true })
  w.webContents.on('did-attach-webview', (_e, wc) => {
    wc.on('did-finish-load', async () => {
      if (r.grande) { r.navego = wc.getURL(); return }
      await new Promise((ok) => setTimeout(ok, 1500))
      r.grande = wc.getURL()
      r.marcaExtension = await wc.executeJavaScript(`!!window[Symbol.for('iridium-revision')]`)
      r.clic = await wc.executeJavaScript(`document.getElementById('b').click(), document.getElementById('b').textContent`)
      r.fondo = await wc.executeJavaScript(`getComputedStyle(document.body).backgroundColor`)
      try { const img = await wc.capturePage({ x: 0, y: 0, width: 200, height: 100 })
      r.captura = img.isEmpty() ? 'vacía' : `${img.getSize().width}x${img.getSize().height}` } catch (e) { r.captura = 'error ' + e.message }
      try { const img2 = await w.webContents.capturePage(); r.capturaAnfitrion = img2.isEmpty() ? 'vacía' : 'ok' } catch (e) { r.capturaAnfitrion = 'error ' + e.message }
      wc.sendInputEvent({ type: 'keyDown', keyCode: 'F8' }); wc.sendInputEvent({ type: 'keyUp', keyCode: 'F8' })
      await new Promise((ok) => setTimeout(ok, 800))
      r.f8HijosNuevos = await wc.executeJavaScript(`[...document.documentElement.children].map(e=>e.tagName).join(',')`)
      wc.sendInputEvent({ type: 'keyDown', keyCode: 'F8' }); wc.sendInputEvent({ type: 'keyUp', keyCode: 'F8' })
      await new Promise((ok) => setTimeout(ok, 500))
      r.f8Apagado = await wc.executeJavaScript(`[...document.documentElement.children].map(e=>e.tagName).join(',')`)
      wc.on('did-navigate', (_e, url) => { r.didNavigate = url })
      await wc.executeJavaScript(`document.getElementById('a').click()`)
      setTimeout(async () => {
        r.tituloDespues = await wc.executeJavaScript('document.title').catch(() => '?')
        r.marcaExtensionDespues = await wc.executeJavaScript(`!!window[Symbol.for('iridium-revision')]`).catch(() => '?')
        const mini = w.webContents.mainFrame.frames[0]
        r.miniatura = mini ? await mini.executeJavaScript(`document.title + ' / ' + getComputedStyle(document.body).backgroundColor`).catch((e) => 'error ' + e.message) : 'sin frame'
        r.miniaturaVeAlPadre = mini ? await mini.executeJavaScript(`(()=>{try{return String(parent.document.title)}catch(e){return 'bloqueado'}})()`).catch((e)=>'error') : '-'
        console.log(JSON.stringify(r, null, 2)); app.quit()
      }, 1500)
    })
  })
  const html = (await readFile(join(AQUI, 'anfitrion.html'), 'utf8')).replace('WEBVIEW_SRC', pathToFileURL(join(DISENO, 'pantallas', 'bandeja.html')).href)
  await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
})
setTimeout(() => { console.log('TIEMPO', JSON.stringify(r)); app.exit(1) }, 25000)
