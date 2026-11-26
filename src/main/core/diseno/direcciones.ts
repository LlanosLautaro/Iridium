// Las direcciones (frente Diseño, DI-I4; `modulos/diseno/diseno-tecnico.md` › El formato): otro `tokens.css` entero en
// `direcciones/<nombre>.css`, con las mismas variables y otros valores, que se prueba sobre todas las maquetas a la vez
// y se elige o se descarta. Puro: los textos y la lista de archivos entran de afuera.
import { leerTokens } from './tokens'

const DIRECCION = /^direcciones\/([^/]+)\.css$/i

/** Si el archivo (relativo a `docs/diseno/`) es una dirección. */
export function esDireccion(archivo: string): boolean {
  return DIRECCION.test(archivo)
}

/** Las direcciones que hay en la carpeta, en orden. */
export function direccionesDe(existentes: Iterable<string>): string[] {
  return [...existentes].filter(esDireccion).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

/** El nombre de una dirección: `direcciones/azul-apagado.css` → `azul-apagado`. */
export function nombreDireccion(archivo: string): string {
  return DIRECCION.exec(archivo)?.[1] ?? archivo
}

/** Cómo se muestra el nombre: `azul-apagado` → `azul apagado`; las fechas quedan con sus guiones. */
export function nombreVisible(nombre: string): string {
  return nombre.replace(/(?<!\d)[-_]+|[-_]+(?!\d)/g, ' ').trim() || nombre
}

/** La frase de una dirección: el comentario con que empieza el archivo (antes de `:root`), en una línea; o null. */
export function descripcionDireccion(css: string): string | null {
  const m = /^\s*\/\*([\s\S]*?)\*\//.exec(css)
  if (!m?.[1]) return null
  return m[1].replace(/\s+/g, ' ').trim() || null
}

/** Lo que no coincide entre las variables de `tokens.css` y las de una dirección, o null si son las mismas. */
export function diferenciaVariables(
  nombresTokens: ReadonlySet<string>,
  css: string,
): { faltan: string[]; sobran: string[] } | null {
  const otra = new Set(leerTokens(css).tokens.map((x) => x.nombre))
  const faltan = [...nombresTokens].filter((n) => !otra.has(n))
  const sobran = [...otra].filter((n) => !nombresTokens.has(n))
  return faltan.length || sobran.length ? { faltan, sobran } : null
}

/** El problema de una dirección para mostrarlo («le faltan --borde, --texto»), o null. */
export function problemaDireccion(nombresTokens: ReadonlySet<string>, css: string): string | null {
  if (!leerTokens(css).tieneRaiz) return 'no tiene un bloque :root con variables'
  const d = diferenciaVariables(nombresTokens, css)
  if (!d) return null
  const lista = (xs: string[]) =>
    `${xs.slice(0, 3).join(', ')}${xs.length > 3 ? ` y ${xs.length - 3} más` : ''}`
  return [
    d.faltan.length ? `le faltan ${lista(d.faltan)}` : '',
    d.sobran.length ? `sobran ${lista(d.sobran)}` : '',
  ]
    .filter(Boolean)
    .join('; ')
}

/** La marca con que empieza la dirección que guarda los tokens de antes al elegir otra. */
const MARCA_ANTERIOR = /^\s*\/\*\s*La de antes de elegir «[^»]*»[^*]*\*\/[ \t]*\r?\n?/

/** `AAAA-MM-DD` de una fecha, en la hora de la PC. */
function dia(fecha: Date): string {
  const d = (n: number) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${d(fecha.getMonth() + 1)}-${d(fecha.getDate())}`
}

/** Dónde se guardan los tokens de hoy al elegir otra dirección: `direcciones/anterior-AAAA-MM-DD.css`, o con `-2`… */
export function archivoAnterior(fecha: Date, existentes: Iterable<string>): string {
  const hay = new Set([...existentes].map((e) => e.toLowerCase()))
  const base = `direcciones/anterior-${dia(fecha)}`
  if (!hay.has(`${base}.css`)) return `${base}.css`
  let n = 2
  while (hay.has(`${base}-${n}.css`)) n++
  return `${base}-${n}.css`
}

/** Los tokens de hoy, listos para guardarse como dirección: con una frase que dice de dónde salieron. */
export function comoAnterior(tokens: string, elegida: string, fecha: Date): string {
  const limpio = tokens.replace(MARCA_ANTERIOR, '')
  return `/* La de antes de elegir «${nombreVisible(elegida)}» (${dia(fecha)}). */\n${limpio}`
}

/** Una dirección, lista para ser `tokens.css`: sin la marca de «la de antes», si la tenía. */
export function comoTokens(direccion: string): string {
  return direccion.replace(MARCA_ANTERIOR, '')
}

/**
 * La dirección para ponerla encima de una maqueta que ya cargó sus tokens (la grande, con `insertCSS`): el mismo
 * texto con `:root` más fuerte, para que gane sin importar el orden de las hojas.
 */
export function paraEncima(css: string): string {
  return css.replace(/:root\b/g, ':root:root:root')
}
