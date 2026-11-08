// Lo que usa cada maqueta (frente Diseño, D-105): sus referencias (`href`, `src`, `url()`, `@import`), si alguna sale
// a la red o fuera de `docs/diseno/`, y los colores escritos (`modulos/diseno/diseno-tecnico.md` › Las maquetas).

export interface Referencia {
  valor: string
  /** Desde 1. */
  linea: number
}

function lineaDe(texto: string, indice: number): number {
  let n = 1
  for (let i = 0; i < indice; i++) if (texto.charCodeAt(i) === 10) n++
  return n
}

function sinComentariosCss(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
}

function sinComentariosHtml(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '))
}

/** Las referencias de una maqueta (`.html`) o de una hoja (`.css`). Un `.js` no se mira: lo frena la política. */
export function referenciasDe(texto: string, tipo: 'html' | 'css'): Referencia[] {
  const limpio = tipo === 'html' ? sinComentariosHtml(texto) : sinComentariosCss(texto)
  const r: Referencia[] = []
  const sumar = (valor: string | undefined, i: number) => {
    const v = valor?.trim()
    if (v) r.push({ valor: v, linea: lineaDe(limpio, i) })
  }
  if (tipo === 'html')
    for (const m of limpio.matchAll(/\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi))
      sumar(m[1] ?? m[2], m.index)
  for (const m of limpio.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]*))\s*\)/gi))
    sumar(m[1] ?? m[2] ?? m[3], m.index)
  for (const m of limpio.matchAll(/@import\s+(?:"([^"]*)"|'([^']*)')/gi)) sumar(m[1] ?? m[2], m.index)
  return r
}

/** Lo que no se busca como archivo: un ancla, un `data:` o un `javascript:` de un clic. */
export function noEsArchivo(ref: string): boolean {
  return /^(#|data:|javascript:)/i.test(ref)
}

export function esDeLaRed(ref: string): boolean {
  return /^(https?:)?\/\//i.test(ref)
}

/**
 * La ruta, relativa a `docs/diseno/`, a la que apunta una referencia hecha desde `desde` (también relativa a
 * `docs/diseno/`), sin `?…` ni `#…`. Null si sale de `docs/diseno/`, es absoluta o tiene otro esquema (`file:`, `mailto:`).
 */
export function resolverReferencia(desde: string, ref: string): string | null {
  const limpia = ref.replace(/[?#].*$/, '')
  if (/^[a-z][a-z0-9+.-]*:/i.test(limpia) || limpia.startsWith('/') || limpia.startsWith('\\')) return null
  const partes = desde.split('/').slice(0, -1)
  for (const p of decodeURI(limpia).split(/[\\/]/)) {
    if (p === '' || p === '.') continue
    if (p === '..') {
      if (partes.length === 0) return null
      partes.pop()
    } else partes.push(p)
  }
  return partes.join('/')
}

/** Los `<style>` de una maqueta, con la línea donde empieza cada uno. */
export function estilosDe(html: string): { css: string; linea: number }[] {
  const limpio = sinComentariosHtml(html)
  return [...limpio.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => ({
    css: m[1] ?? '',
    linea: lineaDe(limpio, m.index + m[0].indexOf('>') + 1),
  }))
}

const COLOR_ESCRITO = /(#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\s*\()/i

/** Los colores escritos en los valores de una hoja (no en los selectores: `#menu` no es un color). */
export function coloresEscritos(css: string, primeraLinea = 1): Referencia[] {
  const limpio = sinComentariosCss(css)
  const r: Referencia[] = []
  for (const m of limpio.matchAll(/([\w-]+)\s*:([^;{}]*)(?=[;}])/g)) {
    const c = COLOR_ESCRITO.exec(m[2] ?? '')
    if (c)
      r.push({
        valor: c[1]?.replace(/\s*\($/, '()') ?? '',
        linea: primeraLinea - 1 + lineaDe(limpio, m.index),
      })
  }
  return r
}

/** El `<title>` de una maqueta, o null. */
export function tituloDe(html: string): string | null {
  return /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() || null
}

/** La frase con que se pidió una versión: `<meta name="descripcion" content="…">`. */
export function descripcionDe(html: string): string | null {
  const m =
    /<meta\s+name\s*=\s*["']descripcion["']\s+content\s*=\s*"([^"]*)"/i.exec(html) ??
    /<meta\s+content\s*=\s*"([^"]*)"\s+name\s*=\s*["']descripcion["']/i.exec(html)
  return m?.[1]?.trim() || null
}
