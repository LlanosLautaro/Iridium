// El comentario de la Revisión como archivo: `docs/revision/R-n.md` (modulos/revision/diseno-tecnico.md › Datos).
// Se escribe con un formato fijo y se lee con tolerancia, como el resto de `docs/` (D-019).

/**
 * `anotado` (R-9): la IA no lo resolvió todavía, lo dejó anotado en un plan (el Backlog, una iteración). No espera a
 * la IA en cada sesión como un abierto, pero tampoco cuenta como cerrado: se cierra cuando se hace de verdad.
 */
export type EstadoComentario = 'abierto' | 'anotado' | 'cerrado'

export interface DatosComentario {
  numero: number
  /** El id que puso la extensión: va escrito como comentario HTML para reconocer un envío repetido. */
  id: string
  texto: string
  /** Archivo relativo a la carpeta del proyecto, con barras `/`, y su línea. */
  archivo: { ruta: string; linea: number } | null
  componentes: string[]
  url: string
  elemento: { etiqueta: string; texto: string; selector: string }
  conCaptura: boolean
  /** Cuándo se dejó, en la hora local. */
  fecha: Date
}

export interface Comentario {
  codigo: string
  numero: number
  id: string | null
  titulo: string
  estado: EstadoComentario
  texto: string
  archivo: { ruta: string; linea: number } | null
  componentes: string[]
  pagina: string | null
  elemento: string | null
  captura: string | null
  historia: { fecha: string; texto: string }[]
}

export const CARPETA_REVISION = ['docs', 'revision'] as const

const LARGO_TITULO = 60

/** «2026-10-28 14:32», en la hora local. */
export function fechaComentario(f: Date): string {
  const d = (n: number) => String(n).padStart(2, '0')
  return `${f.getFullYear()}-${d(f.getMonth() + 1)}-${d(f.getDate())} ${d(f.getHours())}:${d(f.getMinutes())}`
}

/** Las primeras palabras del comentario, en una línea y hasta 60 caracteres, sin cortar una palabra. */
export function tituloDe(texto: string): string {
  const linea = texto.replace(/\s+/g, ' ').trim()
  if (linea.length <= LARGO_TITULO) return linea
  const corte = linea.slice(0, LARGO_TITULO + 1)
  const espacio = corte.lastIndexOf(' ')
  return `${(espacio > 20 ? corte.slice(0, espacio) : corte.slice(0, LARGO_TITULO)).replace(/[\s,;:.]+$/, '')}…`
}

/** Un texto entre comillas angulares, sin saltos de línea. */
const enLinea = (t: string) => t.replace(/\s+/g, ' ').trim()

/** El código entre comillas invertidas, sin romperlas si el texto ya trae alguna. */
function codigo(t: string): string {
  const limpio = enLinea(t)
  return limpio.includes('`') ? `\`\` ${limpio} \`\`` : `\`${limpio}\``
}

/**
 * Un renglón del comentario que empieza con `#` se escribe con `\` adelante (Markdown lo muestra igual): si no, un
 * «## Historia» escrito por el usuario cortaría el comentario y pasaría por la historia del archivo (hito 8, Defecto 9).
 */
const escaparTitulos = (t: string) => t.replace(/^(\s{0,3})#/gm, '$1\\#')
const desescaparTitulos = (t: string) => t.replace(/^(\s{0,3})\\#/gm, '$1#')

export function armarComentario(d: DatosComentario): string {
  const r = `R-${d.numero}`
  const lineas = [`# ${r} — ${tituloDe(d.texto)}`, `<!-- id: ${d.id} -->`, '', '**Estado:** abierto']
  if (d.archivo) lineas.push(`**Dónde:** \`${d.archivo.ruta}\`, línea ${d.archivo.linea}`)
  if (d.componentes.length) lineas.push(`**Componentes:** ${d.componentes.join(' › ')}`)
  lineas.push(`**Página:** ${d.url}`)
  const elemento = [codigo(d.elemento.etiqueta)]
  if (d.elemento.texto.trim()) elemento.push(`texto «${enLinea(d.elemento.texto)}»`)
  if (d.elemento.selector) elemento.push(`selector ${codigo(d.elemento.selector)}`)
  lineas.push(`**Elemento:** ${elemento.join(' · ')}`)
  if (d.conCaptura) lineas.push(`**Captura:** ![${r}](${r}.png)`)
  lineas.push(
    '',
    '## Comentario',
    escaparTitulos(d.texto.trim()),
    '',
    '## Historia',
    `- ${fechaComentario(d.fecha)} — dejado`,
    '',
  )
  return lineas.join('\n')
}

/** El próximo número: el mayor de la carpeta más uno (los huecos no se reusan). */
export function proximoNumero(nombres: string[]): number {
  let mayor = 0
  for (const n of nombres) {
    const m = /^R-(\d+)\.md$/i.exec(n)
    if (m) mayor = Math.max(mayor, Number(m[1]))
  }
  return mayor + 1
}

/** El id escrito en el archivo; null si no lo tiene. */
export function idDe(texto: string): string | null {
  return /<!--\s*id:\s*([\w-]+)\s*-->/.exec(texto)?.[1] ?? null
}

function campo(texto: string, nombre: string): string | null {
  const m = new RegExp(`^\\*\\*${nombre}:\\*\\*\\s*(.+)$`, 'mi').exec(texto)
  return m?.[1]?.trim() ?? null
}

function seccion(texto: string, nombre: string): string | null {
  const lineas = texto.split(/\r?\n/)
  const inicio = lineas.findIndex((l) => new RegExp(`^##\\s+${nombre}\\s*$`, 'i').test(l))
  if (inicio < 0) return null
  const fin = lineas.findIndex((l, i) => i > inicio && /^##\s/.test(l))
  return lineas
    .slice(inicio + 1, fin < 0 ? undefined : fin)
    .join('\n')
    .trim()
}

/**
 * Lee un `R-n.md` con tolerancia: lo que falte queda vacío. Devuelve null si no se puede saber ni el número ni el
 * estado (el archivo no es un comentario). Un estado que no es «cerrado» ni «anotado» cuenta como abierto: si la IA
 * escribió otra palabra, el comentario sigue a la vista.
 */
export function leerComentario(nombreArchivo: string, texto: string): Comentario | null {
  const numero = Number(/^R-(\d+)\.md$/i.exec(nombreArchivo)?.[1])
  const estadoTexto = campo(texto, 'Estado')
  if (!numero || estadoTexto === null) return null
  const codigoR = `R-${numero}`
  const titulo = /^#\s+R-\d+\s*[—-]\s*(.+)$/m.exec(texto)?.[1]?.trim() ?? ''
  const donde = campo(texto, 'Dónde')
  const archivoM = donde ? /`([^`]+)`\s*,\s*línea\s+(\d+)/i.exec(donde) : null
  const captura = campo(texto, 'Captura')
  const historia = (seccion(texto, 'Historia') ?? '')
    .split(/\r?\n/)
    .map((l) => /^[-*]\s*(\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?)\s*[—-]\s*(.+)$/.exec(l.trim()))
    .filter((m) => m !== null)
    .map((m) => ({ fecha: m[1] ?? '', texto: (m[2] ?? '').trim() }))
  return {
    codigo: codigoR,
    numero,
    id: idDe(texto),
    titulo,
    estado: estadoDe(estadoTexto),
    texto: desescaparTitulos(seccion(texto, 'Comentario') ?? titulo),
    archivo: archivoM ? { ruta: archivoM[1] ?? '', linea: Number(archivoM[2]) } : null,
    componentes: (campo(texto, 'Componentes') ?? '')
      .split('›')
      .map((c) => c.trim())
      .filter(Boolean),
    pagina: campo(texto, 'Página'),
    elemento: campo(texto, 'Elemento'),
    captura: captura ? (/\(([^)]+)\)/.exec(captura)?.[1] ?? null) : null,
    historia,
  }
}

function estadoDe(texto: string): EstadoComentario {
  const t = texto.replace(/[`*]/g, '').trim()
  return /^cerrad/i.test(t) ? 'cerrado' : /^anotad/i.test(t) ? 'anotado' : 'abierto'
}

/** Cambia la línea **Estado** (si falta, la agrega debajo del título). */
export function conEstado(texto: string, estado: EstadoComentario): string {
  const linea = /^\*\*Estado:\*\*.*$/m
  if (linea.test(texto)) return texto.replace(linea, `**Estado:** ${estado}`)
  return texto.replace(/^(#\s+R-\d+.*)$/m, `$1\n\n**Estado:** ${estado}`)
}

/** Suma una línea al final de **Historia** (si no hay sección, la crea al final). */
export function conHistoria(texto: string, fecha: Date, que: string): string {
  const item = `- ${fechaComentario(fecha)} — ${enLinea(que)}`
  const lineas = texto.replace(/\s+$/, '').split(/\r?\n/)
  const inicio = lineas.findIndex((l) => /^##\s+Historia\s*$/i.test(l))
  if (inicio < 0) return `${lineas.join('\n')}\n\n## Historia\n${item}\n`
  let fin = lineas.findIndex((l, i) => i > inicio && /^##\s/.test(l))
  if (fin < 0) fin = lineas.length
  // Después del último renglón con texto de la sección (no después de las líneas en blanco).
  let donde = fin
  while (donde > inicio + 1 && (lineas[donde - 1] ?? '').trim() === '') donde--
  lineas.splice(donde, 0, item)
  return `${lineas.join('\n')}\n`
}

/** Reabrir desde Iridium (H-R5): vuelve a abierto y la historia dice por qué. */
export function reabierto(texto: string, fecha: Date, nota: string): string {
  const limpia = enLinea(nota)
  return conHistoria(conEstado(texto, 'abierto'), fecha, limpia ? `reabierto: ${limpia}` : 'reabierto')
}

/** Lo que dice la historia del cierre: la última línea «cerrado…», con su fecha y lo que hizo la IA. */
export function cierreDe(c: Comentario): { fecha: string; que: string } | null {
  if (c.estado !== 'cerrado') return null
  const h = [...c.historia].reverse().find((x) => /^cerrad/i.test(x.texto))
  if (!h) return null
  return { fecha: h.fecha, que: h.texto.replace(/^cerrad[oa]\s*(por la IA)?\s*:?\s*/i, '').trim() }
}

/** Dónde quedó anotado (R-9): la última línea «anotado…» de la historia, con su fecha y lo que dice. */
export function anotacionDe(c: Comentario): { fecha: string; que: string } | null {
  if (c.estado !== 'anotado') return null
  const h = [...c.historia].reverse().find((x) => /^anotad/i.test(x.texto))
  if (!h) return null
  return { fecha: h.fecha, que: h.texto.replace(/^anotad[oa]\s*(por la IA)?\s*:?\s*/i, '').trim() }
}

/** ¿Se reabrió y sigue abierto? */
export function fueReabierto(c: Comentario): boolean {
  return c.estado === 'abierto' && c.historia.some((x) => /^reabierto/i.test(x.texto))
}
