// App Electron de prueba de la Revisión (tests/e2e/r3-electron.spec.ts): carga la app de React con Vite y tiene la
// línea de la Revisión, con la ruta del ayudante que le da la prueba en vez de la de %APPDATA%. Con LUNA_ARCHIVO hace de
// versión armada. Con LUNA_PROPIA, la versión armada se sirve desde `luna-app://` con una política de contenido estricta
// (como Alfa instalada) y la Revisión va sin captura ni texto del elemento.
import { readFile } from 'node:fs/promises'
import { dirname, join, normalize } from 'node:path'
import { pathToFileURL } from 'node:url'
import { app, BrowserWindow, protocol } from 'electron'

const propia = process.env.LUNA_PROPIA
if (propia)
  protocol.registerSchemesAsPrivileged([
    { scheme: 'luna-app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
  ])

if (!app.isPackaged)
  import(pathToFileURL(process.env.IRIDIUM_AYUDANTE ?? '').href)
    .then(async (m) => {
      // La prueba la apaga con `detener` desde el proceso principal.
      globalThis.revisionLuna = await m.revision(
        propia
          ? { esquemas: ['luna-app'], captura: false, textoElemento: false, extension: false }
          : undefined,
      )
    })
    .catch(() => {})

// Fuera de la pantalla mientras corren las pruebas, como Iridium con IRIDIUM_OCULTA (D-072).
const oculta = process.env.IRIDIUM_OCULTA === '1'
if (oculta) app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }

app.whenReady().then(() => {
  if (propia) {
    const raiz = dirname(propia)
    protocol.handle('luna-app', async (pedido) => {
      const ruta = normalize(join(raiz, decodeURIComponent(new URL(pedido.url).pathname)))
      if (!ruta.startsWith(raiz)) return new Response(null, { status: 404 })
      const datos = await readFile(ruta).catch(() => null)
      if (!datos) return new Response(null, { status: 404 })
      return new Response(datos, {
        headers: {
          'content-type': TIPOS[ruta.slice(ruta.lastIndexOf('.'))] ?? 'application/octet-stream',
          'content-security-policy':
            "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'",
        },
      })
    })
  }
  const v = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    ...(oculta ? { x: -20_000, y: -20_000, skipTaskbar: true } : {}),
    webPreferences: { contextIsolation: true, sandbox: true, backgroundThrottling: !oculta },
  })
  v.once('ready-to-show', () => v.showInactive())
  if (propia) void v.loadURL('luna-app://interfaz/index.html')
  // Como una versión armada: la interfaz compilada, desde un archivo.
  else if (process.env.LUNA_ARCHIVO) void v.loadFile(process.env.LUNA_ARCHIVO)
  else void v.loadURL(process.env.LUNA_URL ?? 'about:blank')
})
