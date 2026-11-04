// Electron 44: carga la extensión en modo desarrollo (la «línea» que se agregaría a cada app) y abre la app de prueba.
const { app, BrowserWindow, session } = require('electron')
const path = require('node:path')
const url = process.env.S3_URL
app.whenReady().then(async () => {
  const salida = {}
  try {
    const ext = await session.defaultSession.extensions.loadExtension(path.join(__dirname, 'extension'))
    salida.extensionCargada = { id: ext.id, nombre: ext.name }
  } catch (e) { salida.extensionCargada = { error: String(e) } }
  const win = new BrowserWindow({ width: 800, height: 600, show: true })
  win.webContents.on('console-message', async (ev) => {
    const msg = ev.message ?? ev
    if (typeof msg === 'string' && msg.startsWith('S3-RESULTADO')) {
      salida.respuestaSw = JSON.parse(msg.slice(13))
      // Alternativa de captura desde el proceso principal de la app (sin la extensión).
      try {
        const rect = await win.webContents.executeJavaScript('(() => { const r = document.querySelector("#objetivo").getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) } })()')
        const img = await win.webContents.capturePage(rect)
        salida.capturePageRecortada = { ok: !img.isEmpty(), tamano: img.getSize() }
      } catch (e) { salida.capturePageRecortada = { error: String(e) } }
      console.log('S3-ELECTRON ' + JSON.stringify(salida))
      app.quit()
    }
  })
  setTimeout(() => { console.log('S3-ELECTRON ' + JSON.stringify({ ...salida, tiempoAgotado: true })); app.quit() }, 20000)
  await win.loadURL(url)
})
