// Las versiones de una maqueta (frente Diseño, DI-I4; `modulos/diseno/diseno-tecnico.md` › El formato): otra forma de
// la misma pantalla en `versiones/<maqueta>/<letra>.html`, que se mira lado a lado con la de hoy. Puro: la lista de
// archivos entra de afuera.
import { esDeLaRed, noEsArchivo } from './maquetas'

/** La carpeta de las versiones de una maqueta (`pantallas/bandeja.html` → `versiones/bandeja/`), o null si no tiene. */
export function carpetaVersiones(maqueta: string): string | null {
  const m = /^pantallas\/([^/]+)\.html?$/i.exec(maqueta)
  return m?.[1] ? `versiones/${m[1]}/` : null
}

/** Las versiones de una maqueta que hay en la carpeta, en orden (`a.html`, `b.html`…). */
export function versionesDe(maqueta: string, existentes: Iterable<string>): string[] {
  const carpeta = carpetaVersiones(maqueta)
  if (!carpeta) return []
  return [...existentes]
    .filter(
      (f) =>
        f.toLowerCase().startsWith(carpeta.toLowerCase()) && /^[^/]+\.html?$/i.test(f.slice(carpeta.length)),
    )
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

/** La letra de una versión, como se muestra: `versiones/bandeja/b.html` → `B`. */
export function letraDe(version: string): string {
  return (version.split('/').pop() ?? version).replace(/\.html?$/i, '').toUpperCase()
}

/** La primera letra libre (a…z) para una versión nueva, o null si ya están todas. */
export function proximaLetra(versiones: readonly string[]): string | null {
  const usadas = new Set(versiones.map((v) => letraDe(v).toLowerCase()))
  for (let c = 97; c <= 122; c++) {
    const l = String.fromCharCode(c)
    if (!usadas.has(l)) return l
  }
  return null
}

/** La frase de un pedido en una línea, sin espacios de más. */
export function fraseLimpia(frase: string): string {
  return frase.replace(/\s+/g, ' ').trim()
}

/** La ruta de `destino` vista desde el archivo `desde` (los dos relativos a `docs/diseno/`, con `/`). */
function relativa(desde: string, destino: string): string {
  const de = desde.split('/').slice(0, -1)
  const a = destino.split('/')
  let i = 0
  while (i < de.length && i < a.length - 1 && de[i] === a[i]) i++
  return [...de.slice(i).map(() => '..'), ...a.slice(i)].join('/')
}

/** Lo que apunta `ref` desde `desde`, relativo a `docs/diseno/` y sin decodificar; null si sale de la carpeta. */
function destinoCrudo(desde: string, ref: string): string | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('/') || ref.startsWith('\\')) return null
  const partes = desde.split('/').slice(0, -1)
  for (const p of ref.split(/[\\/]/)) {
    if (p === '' || p === '.') continue
    if (p === '..') {
      if (partes.length === 0) return null
      partes.pop()
    } else partes.push(p)
  }
  return partes.join('/')
}

/**
 * La maqueta `html`, escrita en `desde`, lista para guardarse en `hacia`: cada referencia local (`href`, `src`, `url()`,
 * `@import`) se reescribe para que siga apuntando al mismo archivo. Lo de la red, las anclas y lo que sale de la
 * carpeta quedan como están (el control ya lo marca).
 */
export function reubicar(html: string, desde: string, hacia: string): string {
  const mover = (valor: string): string => {
    const v = valor.trim()
    if (!v || noEsArchivo(v) || esDeLaRed(v)) return valor
    const corte = v.search(/[?#]/)
    const ruta = corte < 0 ? v : v.slice(0, corte)
    const resto = corte < 0 ? '' : v.slice(corte)
    if (!ruta) return valor
    const destino = destinoCrudo(desde, ruta)
    return destino === null ? valor : `${relativa(hacia, destino)}${resto}`
  }
  return html
    .replace(
      /(\s(?:href|src)\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi,
      (_, antes: string, doble?: string, simple?: string) =>
        doble !== undefined ? `${antes}"${mover(doble)}"` : `${antes}'${mover(simple ?? '')}'`,
    )
    .replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]*))\s*\)/gi, (_, d?: string, s?: string, n?: string) =>
      d !== undefined
        ? `url("${mover(d)}")`
        : s !== undefined
          ? `url('${mover(s)}')`
          : `url(${mover(n ?? '')})`,
    )
    .replace(/(@import\s+)(?:"([^"]*)"|'([^']*)')/gi, (_, antes: string, d?: string, s?: string) =>
      d !== undefined ? `${antes}"${mover(d)}"` : `${antes}'${mover(s ?? '')}'`,
    )
}

/** Sin el `<meta name="descripcion">`: al quedarse con una versión, ya es la maqueta, no una versión pedida. */
export function sinDescripcion(html: string): string {
  return html.replace(
    /[ \t]*<meta\s+(?:name\s*=\s*["']descripcion["']\s+content\s*=\s*"[^"]*"|content\s*=\s*"[^"]*"\s+name\s*=\s*["']descripcion["'])\s*\/?>[ \t]*\r?\n?/i,
    '',
  )
}
