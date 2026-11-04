// El modo comentar (modulos/revision/ux.md › W-R1 y W-R2; D-049): F8 lo prende y lo apaga, el mouse resalta, Alt+↑/↓
// cambian de caja, un clic elige sin tocar la app y la tarjeta deja el comentario. Corre en el mundo aislado y dibuja
// todo en un Shadow DOM cerrado: la página no lo ve ni lo afecta, y no se le agrega ninguna barra.
import {
  ATRIBUTO_MARCA,
  CANAL_PAGINA,
  type Estado,
  type Pedido,
  type PedidoComentario,
  type PistaReact,
  type ResultadoDejar,
} from '../comun'
import { ESTILOS, FAMILIA_MONO, FAMILIA_UI } from './estilos'

const TECLA = 'F8'

const ICONOS = {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  espera: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5"/><path d="M12 16h.01"/>',
  enviar: '<path d="M5 12h13M13 6l6 6-6 6"/>',
}
const ic = (n: keyof typeof ICONOS) =>
  `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n]}</svg>`

const esc = (t: string) =>
  t.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  )

function pedir<T>(p: Pedido): Promise<T> {
  return chrome.runtime.sendMessage<T>(p)
}

const esperarCuadro = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

// ---------- Letras de Iridium, sin tocar la página: se suman al conjunto de fuentes del documento ----------

/**
 * De dónde sale cada letra: de la extensión o, metida por el ayudante en una interfaz propia (`inyectado.ts`), los bytes
 * que le pasa el ayudante (la política de contenido de esas apps no deja cargar letras de otro lado).
 */
const fuenteDe = (archivo: string): Promise<string | BufferSource> =>
  (globalThis as { iridiumFuente?: (a: string) => Promise<BufferSource> }).iridiumFuente?.(archivo) ??
  Promise.resolve(`url(${chrome.runtime.getURL(`fuentes/${archivo}`)})`)

let letras: Promise<void> | null = null
function cargarLetras(): Promise<void> {
  letras ??= (async () => {
    const caras: [string, string, string][] = [
      [FAMILIA_UI, 'chakra-petch-400.woff2', '400'],
      [FAMILIA_UI, 'chakra-petch-600.woff2', '500 700'],
      [FAMILIA_MONO, 'jetbrains-mono-100-800.woff2', '100 800'],
    ]
    await Promise.all(
      caras.map(async ([familia, archivo, weight]) => {
        try {
          document.fonts.add(await new FontFace(familia, await fuenteDe(archivo), { weight }).load())
        } catch {
          // Sin la letra se usa Segoe UI: se ve un poco distinto, nada más.
        }
      }),
    )
  })()
  return letras
}

// ---------- La capa: un elemento propio con un Shadow DOM cerrado ----------

const anfitrion = document.createElement('iridium-revision')
anfitrion.setAttribute(
  'style',
  'all: initial !important; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; pointer-events: none !important; display: block !important;',
)
const sombra = anfitrion.attachShadow({ mode: 'closed' })
sombra.innerHTML = `<style>${ESTILOS}</style><div class="capa"></div>`
const capa = sombra.querySelector('.capa') as HTMLDivElement
const resalte = document.createElement('div')
const etiqueta = document.createElement('div')
resalte.className = 'resalte'
etiqueta.className = 'etiqueta'

// Lo que pasa adentro de la capa no le llega a la página (clics, teclas, lo que se escribe).
for (const tipo of [
  'click',
  'mousedown',
  'mouseup',
  'pointerdown',
  'pointerup',
  'keydown',
  'keyup',
  'keypress',
  'input',
  'beforeinput',
  'wheel',
  'dblclick',
  'contextmenu',
  'focusin',
  'focusout',
])
  sombra.addEventListener(tipo, (e) => e.stopPropagation())

// ---------- Estado ----------

let activo = false
let actual: Element | null = null
let pilaCajas: Element[] = []
let elegido: Element | null = null
let tarjeta: HTMLDivElement | null = null
let estado: Estado = { tipo: 'cerrado' }
let proyecto: string | null = null
let preguntando = false
let pistas = new Map<Element, PistaReact>()
/** Lo que se espera a que la página diga el componente y la pila; pasado eso se sigue sin ellos. */
const ESPERA_PISTA_MS = 1500
let marcas = 0

const direccion = () => location.host

function dentroDeLaCapa(e: Event): boolean {
  return e.composedPath().includes(anfitrion)
}

// ---------- Pistas del elemento ----------

function pistaReact(el: Element): Promise<PistaReact> {
  const ya = pistas.get(el)
  if (ya) return Promise.resolve(ya)
  const marca = `m${++marcas}`
  el.setAttribute(ATRIBUTO_MARCA, marca)
  return new Promise((listo) => {
    let hecho = false
    // Lo que llega primero gana: la respuesta de la página o, si no contesta, la espera vacía (no se pisan). La vacía
    // no se recuerda: con la PC ocupada la página puede tardar, y el próximo pedido (el clic) vuelve a preguntar
    // (Defecto 7: sin esto, el comentario salía sin «Dónde» ni componentes).
    const terminar = (p: PistaReact, respondio: boolean) => {
      if (hecho) return
      hecho = true
      window.removeEventListener('message', oir)
      el.removeAttribute(ATRIBUTO_MARCA)
      if (respondio) pistas.set(el, p)
      listo(p)
    }
    const oir = (e: MessageEvent) => {
      if (
        e.source !== window ||
        e.data?.canal !== CANAL_PAGINA ||
        e.data?.tipo !== 'pista' ||
        e.data.marca !== marca
      )
        return
      terminar({ componentes: (e.data.componentes ?? []).map(String), pila: e.data.pila ?? null }, true)
    }
    window.addEventListener('message', oir)
    window.postMessage({ canal: CANAL_PAGINA, tipo: 'pedir', marca }, '*')
    setTimeout(() => terminar({ componentes: [], pila: null }, false), ESPERA_PISTA_MS)
  })
}

/** Un selector corto: desde el ancestro con id más cercano, con etiqueta, hasta dos clases legibles y su posición. */
function selectorDe(el: Element): string {
  const partes: string[] = []
  for (
    let e: Element | null = el;
    e && e !== document.documentElement && partes.length < 6;
    e = e.parentElement
  ) {
    if (
      e.id &&
      /^[A-Za-z][\w-]*$/.test(e.id) &&
      document.querySelectorAll(`#${CSS.escape(e.id)}`).length === 1
    ) {
      partes.unshift(`#${e.id}`)
      break
    }
    let parte = e.tagName.toLowerCase()
    const clases = [...e.classList].filter(
      (c) => /^[A-Za-z][\w-]{1,30}$/.test(c) && !/\d{3}|[a-z]{2,}_[a-z0-9]{5}/i.test(c),
    )
    if (clases.length)
      parte += `.${clases
        .slice(0, 2)
        .map((c) => CSS.escape(c))
        .join('.')}`
    const hermanos = e.parentElement
      ? [...e.parentElement.children].filter((h) => h.tagName === e?.tagName)
      : []
    if (hermanos.length > 1) parte += `:nth-of-type(${hermanos.indexOf(e) + 1})`
    partes.unshift(parte)
  }
  return partes.join(' > ')
}

function textoVisible(el: Element): string {
  const t = ((el as HTMLElement).innerText ?? el.textContent ?? '').replace(/\s+/g, ' ').trim()
  return t.length > 120 ? `${t.slice(0, 119)}…` : t
}

function nombreHtml(el: Element, p?: PistaReact): string {
  const tag = `<b>${esc(el.tagName.toLowerCase())}</b>`
  const comp = p?.componentes[0]
  return comp ? `${esc(comp)} <span class="sep">›</span> ${tag}` : tag
}

// ---------- Dibujo ----------

function pintarResalte(): void {
  const el = elegido ?? actual
  if (!activo || !el?.isConnected) {
    resalte.remove()
    etiqueta.remove()
    return
  }
  const r = el.getBoundingClientRect()
  Object.assign(resalte.style, {
    left: `${r.left - 3}px`,
    top: `${r.top - 3}px`,
    width: `${r.width + 6}px`,
    height: `${r.height + 6}px`,
  })
  resalte.classList.toggle('elegido', Boolean(elegido))
  if (!resalte.isConnected) capa.prepend(resalte)
  if (elegido) {
    etiqueta.remove()
    return
  }
  etiqueta.innerHTML = nombreHtml(el, pistas.get(el))
  const arriba = r.top - 28 > 4
  Object.assign(etiqueta.style, {
    left: `${Math.max(4, r.left - 3)}px`,
    top: `${arriba ? r.top - 28 : r.bottom + 6}px`,
  })
  if (!etiqueta.isConnected) capa.append(etiqueta)
}

function avisar(titulo: string, detalle: string, gris = false): void {
  sombra.querySelector('.aviso')?.remove()
  const a = document.createElement('div')
  a.className = `aviso${gris ? ' gris' : ''}`
  a.setAttribute('role', 'status')
  a.innerHTML = `<span class="faro"></span><div><b>${esc(titulo)}</b><small>${esc(detalle)}</small></div>`
  a.addEventListener('animationend', () => a.remove())
  capa.append(a)
}

function ubicarTarjeta(): void {
  if (!tarjeta || !elegido) return
  const r = elegido.getBoundingClientRect()
  const ancho = tarjeta.offsetWidth || 380
  const alto = tarjeta.offsetHeight || 140
  const vw = window.innerWidth
  const vh = window.innerHeight
  let left: number
  let top: number
  if (vw - r.right > ancho + 24) {
    left = r.right + 14
    top = Math.max(12, Math.min(r.top - 8, vh - alto - 12))
  } else {
    left = Math.max(12, Math.min(r.left, vw - ancho - 12))
    top = r.bottom + 12 + alto < vh ? r.bottom + 12 : Math.max(12, r.top - alto - 12)
  }
  Object.assign(tarjeta.style, { left: `${left}px`, top: `${top}px` })
}

// ---------- Borradores: lo escrito queda si se cierra la tarjeta (H-R4) ----------

const claveBorrador = (el: Element) => `borrador:${location.origin}${location.pathname}|${selectorDe(el)}`

async function leerBorrador(el: Element): Promise<string> {
  const clave = claveBorrador(el)
  const r = await chrome.storage.local.get(clave)
  return typeof r[clave] === 'string' ? (r[clave] as string) : ''
}

let guardarBorrador: ReturnType<typeof setTimeout> | undefined
let borradorPendiente: { clave: string; texto: string } | null = null

/** Escribe ya el borrador que esperaba (al cerrar la tarjeta no se pierde lo último que se tecleó). */
function guardarBorradorYa(): Promise<void> {
  clearTimeout(guardarBorrador)
  const p = borradorPendiente
  borradorPendiente = null
  if (!p) return Promise.resolve()
  return p.texto.trim()
    ? chrome.storage.local.set({ [p.clave]: p.texto })
    : chrome.storage.local.remove(p.clave)
}

function anotarBorrador(el: Element, texto: string): void {
  clearTimeout(guardarBorrador)
  borradorPendiente = { clave: claveBorrador(el), texto }
  guardarBorrador = setTimeout(() => void guardarBorradorYa(), 250)
}

// ---------- Tarjeta ----------

function cerrarTarjeta(): void {
  void guardarBorradorYa()
  tarjeta?.remove()
  tarjeta = null
  elegido = null
  preguntando = false
  pintarResalte()
}

function cabecera(el: Element): string {
  const quien =
    preguntando || !proyecto
      ? ''
      : `<button class="proy" data-accion="cambiar" title="Va a ${esc(proyecto)}. Tocá para elegir otro proyecto">${esc(proyecto)}${ic('chev')}</button>`
  return `<div class="cab"><span class="que">${nombreHtml(el, pistas.get(el)).replace('<span class="sep">›</span>', '›')}</span>${quien}<button class="x" data-accion="cerrar" title="Cerrar (Esc); lo escrito queda">${ic('x')}</button></div>`
}

async function abrirTarjeta(el: Element, mensaje?: { texto: string; mal?: boolean }): Promise<void> {
  const previo = tarjeta?.querySelector('textarea')?.value
  tarjeta?.remove()
  elegido = el
  pintarResalte()
  await pistaReact(el)
  await guardarBorradorYa()
  // Si al entrar Iridium no respondió (estaba cerrado o tardó), se le vuelve a preguntar: puede haberse abierto.
  if (estado.tipo === 'cerrado') {
    estado = await pedir<Estado>({ tipo: 'estado', direccion: direccion() }).catch(
      () => ({ tipo: 'cerrado' }) as Estado,
    )
    if (estado.tipo === 'abierto') proyecto ??= estado.proyecto
  }
  const borrador = previo ?? (await leerBorrador(el))
  const cerrado = estado.tipo === 'cerrado'
  const lista = estado.tipo === 'abierto' ? estado.proyectos : []
  preguntando = !cerrado && !proyecto
  const t = document.createElement('div')
  t.className = 'tarjeta'
  t.setAttribute('role', 'dialog')
  t.setAttribute('aria-label', 'Comentario')
  t.innerHTML =
    cabecera(el) +
    (preguntando
      ? `<div class="elegir"><p>¿De qué proyecto es <code>${esc(direccion())}</code>?</p><div class="opciones" title="Si no elegís, Iridium lo busca por el código">${lista
          .map((p) => `<button data-proyecto="${esc(p)}">${esc(p)}</button>`)
          .join('')}</div></div>`
      : '') +
    `<div class="cuerpo"><textarea rows="2" placeholder="Qué le pasa a esto…" aria-label="Comentario"></textarea></div>` +
    (cerrado
      ? `<div class="linea">${ic('espera')}<span>Iridium está cerrado: queda acá y se manda al abrirlo.</span></div>`
      : '') +
    (mensaje
      ? `<div class="linea${mensaje.mal ? ' mal' : ''}">${ic('espera')}<span>${esc(mensaje.texto)}</span></div>`
      : '') +
    `<div class="pie"><span class="ayuda">Enter deja · Ctrl+Enter envía</span><button class="btn sec" data-accion="enviar"${
      cerrado
        ? ' disabled title="Con Iridium cerrado no se puede mandar a la sesión: Dejar lo guarda y se manda al abrirlo"'
        : ' title="Guardarlo y mandarlo ya a la sesión del proyecto en Iridium (Ctrl+Enter)"'
    }>Enviar ahora${ic('enviar')}</button><button class="btn" data-accion="dejar" title="Guardarlo en el proyecto: la IA lo ve al empezar (Enter)">Dejar</button></div>`
  tarjeta = t
  capa.append(t)
  const campo = t.querySelector('textarea') as HTMLTextAreaElement
  campo.value = borrador
  const ajustar = () => {
    campo.style.height = 'auto'
    campo.style.height = `${Math.min(campo.scrollHeight, window.innerHeight / 2)}px`
    ubicarTarjeta()
  }
  campo.addEventListener('input', () => {
    anotarBorrador(el, campo.value)
    ajustar()
  })
  campo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault()
      // Ctrl+Enter, Enviar ahora; con Iridium cerrado, deja (se manda al abrirlo, sin ir a la sesión).
      void dejar(el, campo.value, (e.ctrlKey || e.metaKey) && !cerrado)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cerrarTarjeta()
    }
  })
  t.addEventListener('click', (e) => {
    const b = (e.target as Element).closest('button')
    if (!b) return
    const accion = b.getAttribute('data-accion')
    if (accion === 'cerrar') cerrarTarjeta()
    else if (accion === 'dejar') void dejar(el, campo.value)
    else if (accion === 'enviar') void dejar(el, campo.value, true)
    else if (accion === 'cambiar') {
      proyecto = null
      void abrirTarjeta(el)
    } else if (b.hasAttribute('data-proyecto')) {
      proyecto = b.getAttribute('data-proyecto')
      if (proyecto) void pedir({ tipo: 'direccion', direccion: direccion(), proyecto })
      void abrirTarjeta(el)
    }
  })
  ajustar()
  campo.focus()
  campo.setSelectionRange(campo.value.length, campo.value.length)
}

function mostrarHecho(el: Element, titulo: string, detalle: string, gris = false, queda = false): void {
  if (!tarjeta) return
  tarjeta.innerHTML = `${cabecera(el)}<div class="hecho${gris ? ' gris' : ''}">${ic(gris ? 'espera' : 'check')}<div><b>${titulo}</b>${
    detalle ? `<small>${detalle}</small>` : ''
  }</div></div>`
  tarjeta.querySelector('[data-accion="cerrar"]')?.addEventListener('click', cerrarTarjeta)
  tarjeta.querySelector('[data-accion="cambiar"]')?.remove()
  ubicarTarjeta()
  if (!queda) {
    const esta = tarjeta
    setTimeout(() => {
      if (tarjeta === esta) cerrarTarjeta()
    }, 1100)
  }
}

let dejando = false
async function dejar(el: Element, texto: string, enviar = false): Promise<void> {
  if (dejando || !texto.trim()) return
  dejando = true
  try {
    const pista = await pistaReact(el)
    const r = el.getBoundingClientRect()
    // La captura: un poco de aire alrededor del elemento, sin la capa de la extensión (diseno-tecnico.md › Dejar).
    const aire = 24
    const rect = {
      x: Math.max(0, r.left - aire),
      y: Math.max(0, r.top - aire),
      w: Math.min(window.innerWidth, r.right + aire) - Math.max(0, r.left - aire),
      h: Math.min(window.innerHeight, r.bottom + aire) - Math.max(0, r.top - aire),
    }
    anfitrion.style.setProperty('visibility', 'hidden', 'important')
    await esperarCuadro()
    await esperarCuadro()
    let captura: string | null = null
    try {
      captura = await pedir<string | null>({ tipo: 'capturar', rect, ancho: window.innerWidth })
    } finally {
      anfitrion.style.setProperty('visibility', 'visible', 'important')
    }
    const pedido: PedidoComentario = {
      id: crypto.randomUUID(),
      url: location.href,
      texto: texto.trim(),
      elemento: {
        etiqueta: el.tagName.toLowerCase(),
        texto: textoVisible(el),
        selector: selectorDe(el),
        rect: {
          x: Math.round(r.left),
          y: Math.round(r.top),
          w: Math.round(r.width),
          h: Math.round(r.height),
        },
      },
      componentes: pista.componentes,
      pila: pista.pila,
      ventana: { ancho: window.innerWidth, alto: window.innerHeight },
      captura,
      ...(proyecto ? { proyecto } : {}),
      creado: new Date().toISOString(),
      enviar,
    }
    const res = await pedir<ResultadoDejar>({ tipo: 'dejar', pedido })
    if (res.tipo === 'guardado' || res.tipo === 'en-cola') {
      clearTimeout(guardarBorrador)
      borradorPendiente = null
      await chrome.storage.local.remove(claveBorrador(el))
    }
    if (res.tipo === 'guardado') {
      proyecto = res.proyecto
      if (res.envio === 'enviado')
        mostrarHecho(
          el,
          `Enviado a la sesión de ${esc(res.proyecto)}`,
          `<code>${esc(res.codigo)}</code> · la IA lo ve ahora`,
        )
      else if (res.envio === 'sin-sesion')
        mostrarHecho(
          el,
          `Guardado como <code>${esc(res.codigo)}</code>`,
          `No hay una sesión abierta en ${esc(res.proyecto)}: la IA lo va a ver al empezar.`,
          true,
          true,
        )
      else
        mostrarHecho(
          el,
          `Guardado en ${esc(res.proyecto)}`,
          `<code>${esc(res.codigo)}</code> · docs/revision/${esc(res.codigo)}.md`,
        )
    } else if (res.tipo === 'en-cola') {
      estado = { tipo: 'cerrado' }
      mostrarHecho(el, 'Queda acá', 'Iridium está cerrado: se manda al abrirlo.', true)
    } else if (res.tipo === 'sin-proyecto') {
      estado = { tipo: 'abierto', version: '', proyecto: null, proyectos: res.proyectos }
      proyecto = null
      await abrirTarjeta(el, {
        texto: 'Iridium no sabe de qué proyecto es: elegilo y volvé a apretar Dejar.',
      })
    } else {
      await abrirTarjeta(el, { texto: `${res.mensaje}. Lo escrito sigue acá.`, mal: true })
    }
  } finally {
    dejando = false
  }
}

// ---------- Entrar y salir ----------

async function entrar(): Promise<void> {
  if (activo) return
  activo = true
  if (!anfitrion.isConnected) document.documentElement.append(anfitrion)
  document.documentElement.style.setProperty('cursor', 'crosshair', 'important')
  void cargarLetras()
  estado = await pedir<Estado>({ tipo: 'estado', direccion: direccion() }).catch(
    () => ({ tipo: 'cerrado' }) as Estado,
  )
  if (!activo) return
  proyecto = estado.tipo === 'abierto' ? estado.proyecto : proyecto
  if (estado.tipo === 'cerrado')
    avisar(
      'Comentando · Iridium está cerrado',
      'Los comentarios quedan acá y se mandan al abrirlo. F8 o Esc para salir.',
      true,
    )
  else if (!proyecto)
    avisar('Comentando', '¿De qué proyecto es esta app? Lo elegís en la tarjeta. F8 o Esc para salir.', true)
  else if (estado.version && estado.version !== chrome.runtime.getManifest().version)
    avisar(
      `Comentando en ${proyecto}`,
      'Hay una versión nueva de la extensión: recargala en la página de extensiones.',
      true,
    )
  else avisar(`Comentando en ${proyecto}`, 'Alt+↑ elige la caja que lo contiene. F8 o Esc para salir.')
}

function salir(): void {
  activo = false
  cerrarTarjeta()
  actual = null
  pilaCajas = []
  pistas = new Map()
  sombra.querySelector('.aviso')?.remove()
  document.documentElement.style.removeProperty('cursor')
  anfitrion.remove()
}

const alternar = () => (activo ? salir() : void entrar())

// ---------- Eventos de la página (fase de captura: antes que la app) ----------

window.addEventListener(
  'keydown',
  (e) => {
    if (e.key === TECLA && !e.repeat) {
      e.preventDefault()
      e.stopImmediatePropagation()
      alternar()
      return
    }
    if (!activo || dentroDeLaCapa(e)) return
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopImmediatePropagation()
      if (tarjeta) cerrarTarjeta()
      else salir()
    } else if (e.altKey && !elegido && actual && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      e.stopImmediatePropagation()
      if (e.key === 'ArrowUp' && actual.parentElement && actual.parentElement !== document.documentElement) {
        pilaCajas.push(actual)
        actual = actual.parentElement
      } else if (e.key === 'ArrowDown') {
        actual = pilaCajas.pop() ?? actual
      }
      pintarResalte()
      void pistaReact(actual).then(pintarResalte)
    }
  },
  true,
)

window.addEventListener(
  'pointermove',
  (e) => {
    if (!activo || elegido || dentroDeLaCapa(e)) return
    const el = e.target instanceof Element ? e.target : null
    if (!el || el === actual || el === document.documentElement) return
    actual = el
    pilaCajas = []
    pintarResalte()
    void pistaReact(el).then(() => {
      if (actual === el) pintarResalte()
    })
  },
  { capture: true, passive: true },
)

// En modo comentar un clic elige y no le llega a la app (H-R1).
for (const tipo of [
  'pointerdown',
  'mousedown',
  'pointerup',
  'mouseup',
  'click',
  'dblclick',
  'auxclick',
  'contextmenu',
])
  window.addEventListener(
    tipo,
    (e) => {
      if (!activo || dentroDeLaCapa(e)) return
      e.preventDefault()
      e.stopImmediatePropagation()
      if (tipo !== 'click') return
      if (tarjeta) {
        cerrarTarjeta()
        return
      }
      const el = e.target instanceof Element ? e.target : actual
      if (el && el !== document.documentElement) void abrirTarjeta(actual?.contains(el) ? actual : el)
    },
    true,
  )

const reubicar = () => {
  if (!activo) return
  pintarResalte()
  ubicarTarjeta()
}
window.addEventListener('scroll', reubicar, { capture: true, passive: true })
window.addEventListener('resize', reubicar, { passive: true })

chrome.runtime.onMessage.addListener((mensaje) => {
  const tipo = (mensaje as { tipo?: string })?.tipo
  if (tipo === 'alternar') alternar()
  // La app apagó la Revisión (ayudante, `detener`): se sale del modo comentar si estaba.
  else if (tipo === 'salir' && activo) salir()
  return undefined
})
