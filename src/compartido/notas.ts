// El bloc de notas de Ideas (D-112, D-126): una sola hoja, `notas.md` en la carpeta Ideas. Lo de cada día va debajo de
// su fecha (`## AAAA-MM-DD`), el día más nuevo arriba; cada párrafo, separado por una línea en blanco. Los enlaces son
// `[texto](url)` o la dirección suelta; las imágenes pegadas, `![](notas/archivo.png)` en su propio párrafo. Lo mismo
// lee y escribe la ventana y lo lee la IA del chat general.

export const ARCHIVO_NOTAS = 'notas.md'
/** La carpeta de las imágenes pegadas, al lado de `notas.md`. */
export const CARPETA_IMAGENES_NOTAS = 'notas'

export type Parte =
  | { tipo: 'texto'; texto: string }
  /** `texto` null: se escribió la dirección suelta. */
  | { tipo: 'enlace'; texto: string | null; url: string }

export type Bloque =
  | { tipo: 'fecha'; fecha: string }
  | { tipo: 'parrafo'; partes: Parte[] }
  /** Relativa a la carpeta Ideas, con `/`. */
  | { tipo: 'imagen'; ruta: string }

/** Lo que la ventana recibe para armar la hoja. */
export type HojaNotas =
  /** `imagenes`: por ruta, la imagen como `data:` (la ventana no lee el disco); falta la que no está o no se pudo leer. */
  | { tipo: 'ok'; texto: string; imagenes: Record<string, string> }
  | { tipo: 'sin-carpeta' }
  | { tipo: 'grande'; bytes: number }
  | { tipo: 'error'; mensaje: string }

export type ResultadoNotas = { tipo: 'ok' } | { tipo: 'error'; mensaje: string }
export type ImagenPegada = { tipo: 'ok'; ruta: string; url: string } | { tipo: 'error'; mensaje: string }

const FECHA = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/
const IMAGEN = /^!\[[^\]]*\]\(<?([^)\s>]+)>?\)$/
// Un enlace `[texto](url)` o una dirección suelta (sin el punto o la coma que la cierran).
const ENLACE = /\[([^\]\n]+)\]\(<?(https?:\/\/[^)\s>]+)>?\)|<?(https?:\/\/[^\s<>]*[^\s<>.,;:!?)'"»])>?/g

function partesDe(texto: string): Parte[] {
  const partes: Parte[] = []
  let desde = 0
  for (const m of texto.matchAll(ENLACE)) {
    const i = m.index ?? 0
    if (i > desde) partes.push({ tipo: 'texto', texto: texto.slice(desde, i) })
    partes.push(
      m[2]
        ? { tipo: 'enlace', texto: m[1] ?? null, url: m[2] }
        : { tipo: 'enlace', texto: null, url: m[3] ?? '' },
    )
    desde = i + m[0].length
  }
  if (desde < texto.length) partes.push({ tipo: 'texto', texto: texto.slice(desde) })
  return partes
}

/** Lee `notas.md`: las fechas, los párrafos (las líneas seguidas, unidas con un salto) y las imágenes. */
export function leerNotas(texto: string): Bloque[] {
  const bloques: Bloque[] = []
  let parrafo: string[] = []
  const cerrar = () => {
    if (parrafo.length) bloques.push({ tipo: 'parrafo', partes: partesDe(parrafo.join('\n')) })
    parrafo = []
  }
  for (const linea of texto.replace(/\r\n?/g, '\n').split('\n')) {
    const fecha = FECHA.exec(linea)
    const imagen = IMAGEN.exec(linea.trim())
    if (fecha?.[1]) {
      cerrar()
      bloques.push({ tipo: 'fecha', fecha: fecha[1] })
    } else if (imagen?.[1]) {
      cerrar()
      bloques.push({ tipo: 'imagen', ruta: imagen[1] })
    } else if (linea.trim() === '') cerrar()
    else parrafo.push(linea)
  }
  cerrar()
  return bloques
}

const textoDe = (partes: readonly Parte[]) =>
  partes
    .map((p) =>
      p.tipo === 'texto' ? p.texto : p.texto && p.texto !== p.url ? `[${p.texto}](${p.url})` : p.url,
    )
    .join('')

/**
 * Escribe la hoja: sin párrafos vacíos ni fechas que se quedaron sin nada (el «Hoy» que se ofrece y no se usó), y
 * sin las líneas en blanco de más dentro de un párrafo.
 */
export function escribirNotas(bloques: readonly Bloque[]): string {
  const salida: string[] = []
  let fecha: string | null = null
  for (const b of bloques) {
    if (b.tipo === 'fecha') {
      fecha = `## ${b.fecha}`
      continue
    }
    const texto =
      b.tipo === 'imagen'
        ? `![](${b.ruta})`
        : textoDe(b.partes)
            .split('\n')
            .map((l) => l.replace(/\s+$/, ''))
            .filter((l) => l.trim() !== '')
            .join('\n')
    if (texto.trim() === '') continue
    if (fecha) {
      salida.push(fecha)
      fecha = null
    }
    salida.push(texto)
  }
  return salida.length ? `${salida.join('\n\n')}\n` : ''
}

/** AAAA-MM-DD de ese día, en la hora de la PC. */
export function diaDe(d: Date): string {
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}

/** «Hoy», «Ayer» o la fecha tal cual. */
export function nombreDelDia(fecha: string, hoy: Date): string {
  if (fecha === diaDe(hoy)) return 'Hoy'
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  return fecha === diaDe(ayer) ? 'Ayer' : fecha
}

/**
 * La hoja como se abre: si arriba no está el día de hoy, se suma su fecha con un párrafo vacío para escribir (se
 * guarda recién cuando tiene algo). Lo que no tiene fecha arriba de todo queda debajo de hoy.
 */
export function conHoy(bloques: readonly Bloque[], hoy: Date): Bloque[] {
  const primero = bloques[0]
  if (primero?.tipo === 'fecha' && primero.fecha === diaDe(hoy)) return [...bloques]
  return [{ tipo: 'fecha', fecha: diaDe(hoy) }, { tipo: 'parrafo', partes: [] }, ...bloques]
}

/** Lo que se ve de un enlace: su texto o, de una dirección suelta, el último tramo; y el sitio. */
export function verEnlace(p: { texto: string | null; url: string }): {
  nombre: string
  sitio: string | null
} {
  let sitio: string | null = null
  let tramo: string | null = null
  try {
    const u = new URL(p.url)
    sitio = u.hostname.replace(/^www\./, '')
    tramo = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() ?? '') || null
  } catch {
    // Una dirección que no se entiende se muestra entera.
  }
  const nombre = p.texto && p.texto !== p.url ? p.texto : (tramo ?? sitio ?? p.url)
  return { nombre, sitio: sitio && sitio !== nombre ? sitio : null }
}

/** Una sola dirección de internet, sin nada más (al pegar). */
export function esDireccion(texto: string): boolean {
  return /^https?:\/\/\S+$/i.test(texto.trim())
}
