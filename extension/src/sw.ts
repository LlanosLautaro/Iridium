// Service worker de la extensión (diseno-tecnico.md › Procesos centrales): habla con Iridium en 127.0.0.1, toma y
// recorta la captura, y guarda en una cola lo que no se pudo entregar para mandarlo cuando Iridium esté.
import type {
  Estado,
  Pedido,
  PedidoComentario,
  RespuestaComentario,
  RespuestaEstado,
  ResultadoDejar,
} from './comun'

// Las pruebas cambian este número al copiar la extensión (tests/e2e), para no chocar con la app de uso diario.
const PUERTO = 47321
const IRIDIUM = `http://127.0.0.1:${PUERTO}`
const VERSION = chrome.runtime.getManifest().version
/** La captura no pasa de este ancho: alcanza para ver el detalle y no pesa. */
const ANCHO_MAXIMO = 1600

/**
 * En una app Electron, lo que da el ayudante (`extension/electron/`): la captura con `capturePage` y la carpeta de la
 * app. Electron no tiene `captureVisibleTab`, ni el botón de la extensión, ni alarmas (research/revision-extension.md ›
 * 3): lo que los usa se saltea.
 */
interface AyudanteElectron {
  capturar(
    idPestana: number | null,
    rect: { x: number; y: number; w: number; h: number },
  ): Promise<string | null>
  carpeta(): Promise<string>
}
const electron = (globalThis as { iridiumElectron?: AyudanteElectron }).iridiumElectron
const boton = chrome.action as typeof chrome.action | undefined
const alarmas = chrome.alarms as typeof chrome.alarms | undefined
let carpetaApp: Promise<string | undefined> | null = null
const carpetaDeLaApp = () => {
  carpetaApp ??= electron ? electron.carpeta().catch(() => undefined) : Promise.resolve(undefined)
  return carpetaApp
}

async function pedir(ruta: string, cuerpo?: unknown, esperaMs = 1500): Promise<Response> {
  return fetch(`${IRIDIUM}${ruta}`, {
    method: cuerpo === undefined ? 'GET' : 'POST',
    headers: cuerpo === undefined ? {} : { 'content-type': 'application/json' },
    body: cuerpo === undefined ? null : JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(esperaMs),
  })
}

// ---------- Cola ----------

async function leerCola(): Promise<PedidoComentario[]> {
  const { cola } = await chrome.storage.local.get('cola')
  return Array.isArray(cola) ? (cola as PedidoComentario[]) : []
}

async function mostrarCola(n: number): Promise<void> {
  if (!boton) return
  await boton.setBadgeText({ text: n ? String(n) : '' })
  await boton.setBadgeBackgroundColor({ color: '#a3b8b0' })
  await boton.setBadgeTextColor?.({ color: '#0a0d0b' })
  await boton.setTitle({
    title: n
      ? `Revisión de Iridium: ${n === 1 ? '1 comentario espera' : `${n} comentarios esperan`} a que se abra Iridium`
      : 'Revisión de Iridium: comentar esta app (F8)',
  })
}

async function encolar(p: PedidoComentario): Promise<number> {
  const cola = (await leerCola()).filter((x) => x.id !== p.id)
  // Lo que sale de la cola no se manda a la sesión: llega cuando sea, quizás a una conversación que ya es otra.
  cola.push({ ...p, enviar: false })
  await chrome.storage.local.set({ cola })
  await mostrarCola(cola.length)
  return cola.length
}

let vaciando: Promise<void> | null = null

/** Manda la cola de a uno y en orden; sale solo lo que Iridium confirmó. */
function vaciarCola(): Promise<void> {
  vaciando ??= (async () => {
    try {
      for (const p of await leerCola()) {
        let r: RespuestaComentario
        try {
          const res = await pedir('/comentarios', { ...p, enviar: false }, 10_000)
          if (!res.ok) continue
          r = (await res.json()) as RespuestaComentario
        } catch {
          return // Iridium sigue cerrado: se reintenta después.
        }
        if (r.tipo !== 'guardado') continue // No sabe el proyecto: espera a que el usuario lo elija.
        const resto = (await leerCola()).filter((x) => x.id !== p.id)
        await chrome.storage.local.set({ cola: resto })
      }
    } finally {
      await mostrarCola((await leerCola()).length)
      vaciando = null
    }
  })()
  return vaciando
}

// ---------- Captura ----------

function aBase64(datos: ArrayBuffer): string {
  const bytes = new Uint8Array(datos)
  let texto = ''
  for (let i = 0; i < bytes.length; i += 0x8000)
    texto += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(texto)
}

/** Captura la pestaña y recorta el rectángulo (en px de la página); la escala sale del ancho real de la imagen. */
async function capturar(
  pestana: chrome.runtime.MessageSender['tab'],
  rect: Pedido & { tipo: 'capturar' },
): Promise<string | null> {
  if (electron) return electron.capturar(pestana?.id ?? null, rect.rect).catch(() => null)
  if (!pestana) return null
  const idVentana = pestana.windowId
  try {
    const completa = await chrome.tabs.captureVisibleTab(idVentana, { format: 'png' })
    const imagen = await createImageBitmap(await (await fetch(completa)).blob())
    const escala = imagen.width / rect.ancho
    const x = Math.max(0, Math.round(rect.rect.x * escala))
    const y = Math.max(0, Math.round(rect.rect.y * escala))
    const w = Math.min(imagen.width - x, Math.round(rect.rect.w * escala))
    const h = Math.min(imagen.height - y, Math.round(rect.rect.h * escala))
    if (w < 1 || h < 1) return null
    const reduccion = Math.min(1, ANCHO_MAXIMO / w)
    const lienzo = new OffscreenCanvas(Math.round(w * reduccion), Math.round(h * reduccion))
    lienzo.getContext('2d')?.drawImage(imagen, x, y, w, h, 0, 0, lienzo.width, lienzo.height)
    const png = await lienzo.convertToBlob({ type: 'image/png' })
    return `data:image/png;base64,${aBase64(await png.arrayBuffer())}`
  } catch {
    return null // Sin captura, el comentario se guarda igual (H-R4).
  }
}

// ---------- Mensajes del selector ----------

async function atender(p: Pedido, remitente: chrome.runtime.MessageSender): Promise<unknown> {
  if (p.tipo === 'estado') {
    try {
      const res = await pedir('/estado', {
        direccion: p.direccion,
        version: VERSION,
        carpeta: await carpetaDeLaApp(),
      })
      if (!res.ok) return { tipo: 'cerrado' } satisfies Estado
      const estado = (await res.json()) as RespuestaEstado
      void vaciarCola()
      return { tipo: 'abierto', ...estado } satisfies Estado
    } catch {
      return { tipo: 'cerrado' } satisfies Estado
    }
  }
  if (p.tipo === 'capturar') return capturar(remitente.tab, p)
  if (p.tipo === 'direccion') {
    try {
      await pedir('/direcciones', {
        direccion: p.direccion,
        proyecto: p.proyecto,
        carpeta: await carpetaDeLaApp(),
      })
    } catch {
      // Sin Iridium: se elige de nuevo la próxima vez.
    }
    return null
  }
  if (p.tipo === 'dejar') {
    const carpeta = await carpetaDeLaApp()
    if (carpeta) p.pedido.carpeta = carpeta
    let res: Response
    try {
      res = await pedir('/comentarios', p.pedido, 10_000)
    } catch {
      return { tipo: 'en-cola', esperando: await encolar(p.pedido) } satisfies ResultadoDejar
    }
    if (!res.ok)
      return { tipo: 'error', mensaje: `Iridium no lo pudo guardar (${res.status})` } satisfies ResultadoDejar
    return (await res.json()) as ResultadoDejar
  }
  return null
}

chrome.runtime.onMessage.addListener((mensaje, remitente, responder) => {
  void atender(mensaje as Pedido, remitente).then(responder)
  return true
})

// El botón de la extensión hace lo mismo que F8 en la pestaña.
boton?.onClicked.addListener((pestana) => {
  if (pestana.id !== undefined) void chrome.tabs.sendMessage(pestana.id, { tipo: 'alternar' }).catch(() => {})
})

alarmas?.create('cola', { periodInMinutes: 1 })
alarmas?.onAlarm.addListener((a) => {
  if (a.name === 'cola') void vaciarCola()
})
const { onStartup, onInstalled } = chrome.runtime as Partial<typeof chrome.runtime>
onStartup?.addListener(() => void vaciarCola())
onInstalled?.addListener(() => void vaciarCola())
