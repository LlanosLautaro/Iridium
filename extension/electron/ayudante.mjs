// Ayudante de la Revisión de Iridium para apps Electron en modo desarrollo (modulos/revision/diseno-tecnico.md ›
// Ayudante de Electron). Lo carga la línea que va en el proceso principal de cada app (guía hitos-desarrollo-app › hito 7 ›
// Antes de empezar): carga la extensión, le da la captura con `capturePage` y le dice la carpeta de la app. Corre en
// modo desarrollo y en la versión armada (D-052); en la armada, la interfaz es `file://`.
// Con `esquemas`, también en una interfaz propia (`mi-app://`, D-073), donde la extensión no entra: el ayudante mete
// el selector él mismo y habla con Iridium desde el proceso principal. Con `captura: false` y `textoElemento: false` el
// comentario sale sin captura y sin el texto del elemento, aunque la página los mande.
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, ipcMain, session, webContents } from 'electron'

const CARPETA = join(dirname(fileURLToPath(import.meta.url)), '..')
const ID_EXTENSION = 'lnjpddimnapkmhoggokbjkoleaanbfhd'
const ANCHO_MAXIMO = 1600
const LOCAL = /^(https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\/|file:\/\/)/
/** El mundo aislado donde corre el selector que mete el ayudante (el mismo número en `preload-marco.cjs`). */
const MUNDO = 1047
const IRIDIUM = `http://127.0.0.1:${Number(process.env.IRIDIUM_REVISION_PUERTO) || 47321}`
/** Lo que no se pudo entregar con Iridium cerrado, fuera de la app: se manda cuando Iridium esté. */
const COLA = join(CARPETA, '..', 'revision-cola-electron.json')

/**
 * Lo que sabe hacer este ayudante. Una app lo lee de `capacidades.json` (al lado de este archivo) antes de cargarlo, sin
 * ejecutar nada; si a una versión vieja le falta algo, no la carga.
 */
export const capacidades = ['esquemas', 'sin-captura', 'sin-texto', 'detener']

const opciones = { captura: true, textoElemento: true }

/** La captura del rectángulo (en px de la página) de la ventana donde se comentó. */
async function capturar(idPestana, rect) {
  const wc =
    (typeof idPestana === 'number' ? webContents.fromId(idPestana) : null) ??
    BrowserWindow.getFocusedWindow()?.webContents
  if (!wc || !rect || !opciones.captura) return null
  const zoom = wc.getZoomFactor()
  const r = {
    x: Math.max(0, Math.round(rect.x * zoom)),
    y: Math.max(0, Math.round(rect.y * zoom)),
    width: Math.max(1, Math.round(rect.w * zoom)),
    height: Math.max(1, Math.round(rect.h * zoom)),
  }
  let imagen = await wc.capturePage(r)
  if (imagen.isEmpty()) return null
  if (imagen.getSize().width > ANCHO_MAXIMO) imagen = imagen.resize({ width: ANCHO_MAXIMO })
  return imagen.toDataURL()
}

/** Atiende al service worker de la extensión (y a ningún otro) cuando arranca. */
function atender(s) {
  const preparar = (versionId) => {
    const w = s.serviceWorkers.getWorkerFromVersionID(versionId)
    if (!w?.scope.startsWith(`chrome-extension://${ID_EXTENSION}/`)) return
    // El worker se duerme y se despierta: se vuelve a atender cada vez, sin duplicar.
    for (const canal of ['iridium-revision:capturar', 'iridium-revision:carpeta']) w.ipc.removeHandler(canal)
    w.ipc.handle('iridium-revision:capturar', (_e, idPestana, rect) => capturar(idPestana, rect))
    w.ipc.handle('iridium-revision:carpeta', () => app.getAppPath())
  }
  s.serviceWorkers.on('running-status-changed', ({ versionId, runningStatus }) => {
    if (runningStatus === 'starting' || runningStatus === 'running') preparar(versionId)
  })
  for (const id of Object.keys(s.serviceWorkers.getAllRunning())) preparar(Number(id))
}

// ---------- Interfaz propia: el selector lo mete el ayudante ----------

/** null mientras nadie pidió `esquemas`. */
let propia = null
const recargadas = new Set()
const metiendo = new Map()
/** Lo escrito a medias en cada tarjeta (como `chrome.storage` de la extensión), mientras la app esté abierta. */
const borradores = new Map()
let version = null

const deLaApp = (url) => !!propia && propia.esquemas.some((e) => url.startsWith(e))

async function leerVersion() {
  version ??= JSON.parse(await readFile(join(CARPETA, 'manifest.json'), 'utf8')).version
  return version
}

/** Un pedido al receptor de Iridium como lo hace la extensión: con su origen, que es lo que el receptor acepta. */
function aIridium(ruta, cuerpo, esperaMs = 1500) {
  return fetch(`${IRIDIUM}${ruta}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: `chrome-extension://${ID_EXTENSION}` },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(esperaMs),
  })
}

async function leerCola() {
  try {
    const cola = JSON.parse(await readFile(COLA, 'utf8'))
    return Array.isArray(cola) ? cola : []
  } catch {
    return []
  }
}

let vaciando = null
/** Manda la cola de a uno y en orden; sale solo lo que Iridium guardó (sw.ts › vaciarCola). */
function vaciarCola() {
  vaciando ??= (async () => {
    try {
      for (const p of await leerCola()) {
        let r
        try {
          const res = await aIridium('/comentarios', { ...p, enviar: false }, 10_000)
          if (!res.ok) continue
          r = await res.json()
        } catch {
          return // Iridium sigue cerrado: se reintenta después.
        }
        if (r.tipo !== 'guardado') continue
        await writeFile(COLA, JSON.stringify((await leerCola()).filter((x) => x.id !== p.id)))
      }
    } catch {
      // Sin la cola en el disco: se reintenta después.
    } finally {
      vaciando = null
    }
  })()
  return vaciando
}

/** Lo que sale de la app: la carpeta la pone el ayudante; la captura y el texto, solo si la app los permite. */
function limpiar(pedido) {
  const c = { ...pedido, elemento: { ...pedido.elemento }, carpeta: app.getAppPath() }
  if (!opciones.captura) c.captura = null
  if (!opciones.textoElemento) c.elemento.texto = ''
  return c
}

/** Lo mismo que atiende el service worker de la extensión (sw.ts › atender), desde el proceso principal. */
async function atenderPedido(p, wc) {
  if (p?.tipo === 'estado') {
    try {
      const res = await aIridium('/estado', {
        direccion: String(p.direccion),
        version: await leerVersion(),
        carpeta: app.getAppPath(),
      })
      if (!res.ok) return { tipo: 'cerrado' }
      const estado = await res.json()
      void vaciarCola()
      return { tipo: 'abierto', ...estado }
    } catch {
      return { tipo: 'cerrado' }
    }
  }
  if (p?.tipo === 'capturar') return capturar(wc.id, p.rect).catch(() => null)
  if (p?.tipo === 'direccion') {
    await aIridium('/direcciones', {
      direccion: String(p.direccion),
      proyecto: String(p.proyecto),
      carpeta: app.getAppPath(),
    }).catch(() => {})
    return null
  }
  if (p?.tipo === 'dejar' && p.pedido && typeof p.pedido === 'object') {
    const pedido = limpiar(p.pedido)
    let res
    try {
      res = await aIridium('/comentarios', pedido, 10_000)
    } catch {
      const cola = (await leerCola()).filter((x) => x.id !== pedido.id)
      cola.push({ ...pedido, enviar: false })
      await writeFile(COLA, JSON.stringify(cola))
      return { tipo: 'en-cola', esperando: cola.length }
    }
    if (!res.ok) return { tipo: 'error', mensaje: `Iridium no lo pudo guardar (${res.status})` }
    return res.json()
  }
  return null
}

/** Solo contesta a las páginas de la app, con la Revisión prendida. */
function atenderPuente() {
  const de = (e) =>
    !!propia && !propia.apagada && e.sender.session === propia.sesion && deLaApp(e.senderFrame?.url ?? '')
  ipcMain.handle('iridium-revision:pedir', (e, p) => (de(e) ? atenderPedido(p, e.sender) : null))
  ipcMain.handle('iridium-revision:leer', (e, clave) =>
    de(e) ? (borradores.get(String(clave)) ?? null) : null,
  )
  ipcMain.handle('iridium-revision:guardar', (e, datos) => {
    if (de(e) && datos && typeof datos === 'object')
      for (const [k, v] of Object.entries(datos)) borradores.set(k, String(v).slice(0, 20_000))
  })
  ipcMain.handle('iridium-revision:borrar', (e, clave) => {
    if (de(e)) borradores.delete(String(clave))
  })
  ipcMain.handle('iridium-revision:fuente', async (e, archivo) => {
    if (!de(e) || !/^[\w-]+\.woff2$/.test(String(archivo))) return null
    return readFile(join(CARPETA, 'fuentes', String(archivo))).catch(() => null)
  })
}

/** Mete el selector en una página de la app (una vez por carga); si la página cargó antes que el puente, la recarga. */
function meter(wc) {
  if (!propia || propia.apagada || wc.isDestroyed() || wc.session !== propia.sesion || !deLaApp(wc.getURL()))
    return Promise.resolve()
  if (metiendo.has(wc.id)) return metiendo.get(wc.id)
  const hecho = (async () => {
    const hay = await wc
      .executeJavaScriptInIsolatedWorld(MUNDO, [
        { code: 'typeof iridiumPuente + " " + typeof iridiumPrender' },
      ])
      .catch(() => null)
    if (hay === 'object function') {
      await wc.executeJavaScriptInIsolatedWorld(MUNDO, [{ code: 'iridiumPrender()' }])
      return
    }
    if (hay !== 'object undefined') {
      if (!recargadas.has(wc.id)) {
        recargadas.add(wc.id)
        wc.reload()
      }
      return
    }
    const [pagina, selector] = await Promise.all(
      ['pagina', 'inyectado'].map((n) => readFile(join(CARPETA, 'js', `${n}.js`), 'utf8')),
    )
    // Los componentes de React se leen en el mundo de la página, como con `pagina.js` de la extensión.
    await wc.executeJavaScript(pagina)
    await wc.executeJavaScriptInIsolatedWorld(MUNDO, [
      { code: `globalThis.iridiumOpciones = ${JSON.stringify({ version: await leerVersion() })}` },
      { code: selector },
    ])
  })()
    .catch((e) => console.warn('Revisión de Iridium: no se pudo meter en la página', e))
    .finally(() => metiendo.delete(wc.id))
  metiendo.set(wc.id, hecho)
  return hecho
}

function vigilar(wc) {
  wc.on('did-finish-load', () => void meter(wc))
}

async function prenderPropia(s, esquemas) {
  const primera = !propia
  propia = { sesion: s, esquemas: esquemas.map((e) => (e.endsWith(':') ? e : `${e}:`)), apagada: false }
  if (primera) {
    s.registerPreloadScript({
      id: 'iridium-revision-marco',
      type: 'frame',
      filePath: join(CARPETA, 'electron', 'preload-marco.cjs'),
    })
    atenderPuente()
    app.on('web-contents-created', (_e, wc) => vigilar(wc))
    for (const wc of webContents.getAllWebContents()) vigilar(wc)
    setInterval(() => void vaciarCola(), 60_000).unref?.()
    void vaciarCola()
  }
  await Promise.all(webContents.getAllWebContents().map((wc) => meter(wc)))
}

/** Apaga la Revisión sin cerrar la app: F8 deja de andar y nada más llega a Iridium. */
function detener(s, extensionCargada) {
  if (extensionCargada) {
    try {
      ;(s.extensions ?? s).removeExtension(ID_EXTENSION)
    } catch {
      // Ya no estaba.
    }
  }
  if (!propia) return
  propia.apagada = true
  for (const wc of webContents.getAllWebContents())
    if (!wc.isDestroyed() && deLaApp(wc.getURL()))
      void wc
        .executeJavaScriptInIsolatedWorld(MUNDO, [{ code: 'globalThis.iridiumApagar?.()' }])
        .catch(() => {})
}

/**
 * Prende la Revisión en la app. `sesion`: la sesión de las ventanas, si no es la de siempre. Si algo falla, la app sigue
 * como si nada (solo lo dice en la consola). Con `IRIDIUM_REVISION=no` no hace nada.
 * - `esquemas` (p. ej. `['mi-app']`): la interfaz propia de la app, donde el ayudante mete el selector.
 * - `captura: false`: sin captura. `textoElemento: false`: sin el texto del elemento (solo en `esquemas`).
 * - `extension: false`: no carga la extensión (con `esquemas` no hace falta).
 * Devuelve `detener()`, que la apaga sin cerrar la app; otra llamada a `revision` la vuelve a prender.
 */
export async function revision({
  sesion,
  esquemas = [],
  captura = true,
  textoElemento = true,
  extension = true,
} = {}) {
  if (process.env.IRIDIUM_REVISION === 'no') return { detener() {} }
  await app.whenReady()
  const s = sesion ?? session.defaultSession
  opciones.captura = captura !== false
  opciones.textoElemento = textoElemento !== false
  let cargada = false
  if (extension) {
    try {
      s.registerPreloadScript({
        id: 'iridium-revision',
        type: 'service-worker',
        filePath: join(CARPETA, 'electron', 'preload-sw.cjs'),
      })
      atender(s)
      // `allowFileAccess`: la versión armada carga la interfaz desde `file://`.
      await (s.extensions ?? s).loadExtension(CARPETA, { allowFileAccess: true })
      cargada = true
      // Una ventana que cargó antes que la extensión no tiene sus scripts (falta la marca de `pagina.js`): se recarga
      // una vez. Las que todavía cargan los reciben solas.
      for (const wc of webContents.getAllWebContents()) {
        if (wc.session !== s || !LOCAL.test(wc.getURL()) || wc.isLoading()) continue
        const tiene = await wc.executeJavaScript(`!!window[Symbol.for('iridium-revision')]`).catch(() => true)
        if (!tiene) wc.reload()
      }
    } catch (e) {
      console.warn('Revisión de Iridium: no se pudo cargar la extensión', e)
    }
  }
  if (esquemas.length) {
    try {
      await prenderPropia(s, esquemas)
    } catch (e) {
      console.warn('Revisión de Iridium: no se pudo prender en la interfaz de la app', e)
    }
  }
  return { detener: () => detener(s, cargada) }
}
