// Los tokens de las maquetas (frente Diseño, DS-13): las variables del primer bloque `:root` de `docs/diseno/tokens.css`,
// agrupadas para dibujarlas en Sistema (`modulos/diseno/diseno-tecnico.md` › Sistema). Cada token lleva su uso: el
// comentario que lo sigue en la misma línea (`--principal: #3ccf7f; /* el botón principal, uno por pantalla */`, D-114).

export type GrupoToken = 'colores' | 'letra' | 'tamanos' | 'espacios' | 'sombras' | 'otras'

export interface Token {
  nombre: string
  valor: string
  grupo: GrupoToken
  /** Desde 1. */
  linea: number
  /** Para qué se usa: el comentario después del `;` en la misma línea, o null. */
  uso: string | null
}

export interface Tokens {
  /** Si encontró un bloque `:root { … }`. */
  tieneRaiz: boolean
  tokens: Token[]
  /** Las líneas del bloque que no se entienden, con su número. */
  errores: { linea: number; texto: string }[]
}

const COLOR = /^(#[0-9a-f]{3,8}|(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(.*\)|transparent)$/i

export function esColor(valor: string): boolean {
  return COLOR.test(valor.trim())
}

export function grupoDe(nombre: string, valor: string): GrupoToken {
  const n = nombre.replace(/^--/, '').toLowerCase()
  if (/^(tam|tamano|tamaño)-/.test(n)) return 'tamanos'
  if (/^(espacio|esp|radio)-/.test(n)) return 'espacios'
  if (/^sombra-/.test(n)) return 'sombras'
  if (esColor(valor)) return 'colores'
  if (/(^|-)(ui|fuente|letra|mono)(-|$)/.test(n) || (/,/.test(valor) && !/\(/.test(valor)))
    return 'letra'
  return 'otras'
}

/** Saca los comentarios de CSS dejando los saltos de línea, para que los números de línea sigan siendo los del archivo. */
function sinComentarios(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
}

/** Los usos, por la posición del `;` que los precede en la misma línea (las mismas posiciones que `sinComentarios`). */
function usosDe(css: string): Map<number, string> {
  const usos = new Map<number, string>()
  for (const m of css.matchAll(/;[ \t]*\/\*([\s\S]*?)\*\//g)) {
    const texto = m[1]?.replace(/\s+/g, ' ').trim()
    if (texto) usos.set(m.index, texto)
  }
  return usos
}

export function leerTokens(css: string): Tokens {
  const normal = css.replace(/\r\n?/g, '\n')
  const limpio = sinComentarios(normal)
  const usos = usosDe(normal)
  // El primer bloque cuyo selector incluye `:root` (`:root, :root[data-tema] {` también).
  const m = /(?:^|[{}])([^{}]*:root(?![\w-])[^{}]*)\{/.exec(limpio)
  if (!m) return { tieneRaiz: false, tokens: [], errores: [] }
  const desde = m.index + m[0].length
  const hasta = limpio.indexOf('}', desde)
  const cuerpo = limpio.slice(desde, hasta < 0 ? undefined : hasta)
  const lineaInicial = limpio.slice(0, desde).split('\n').length
  const tokens: Token[] = []
  const errores: Tokens['errores'] = []
  // Las declaraciones, cada una con la línea donde empieza (un valor puede ocupar varias líneas).
  let offset = 0
  for (const decl of cuerpo.split(';')) {
    const antes = cuerpo.slice(0, offset)
    offset += decl.length + 1
    const texto = decl.trim()
    if (!texto) continue
    const saltosAntes = decl.length - decl.trimStart().length
    const linea = lineaInicial + (antes + decl.slice(0, saltosAntes)).split('\n').length - 1
    const d = /^(--[\w-]+)\s*:\s*([\s\S]+)$/.exec(texto)
    // Una declaración común (`color-scheme: dark`) no es un token, pero tampoco un error.
    if (!d && /^[a-z-]+\s*:\s*\S/i.test(texto)) continue
    if (!d?.[1] || !d[2]) {
      errores.push({ linea, texto: texto.split('\n')[0] ?? texto })
      continue
    }
    const valor = d[2].replace(/\s+/g, ' ').trim()
    // El `;` de esta declaración está justo antes de `offset` (relativo al cuerpo).
    const uso = usos.get(desde + offset - 1) ?? null
    tokens.push({ nombre: d[1], valor, grupo: grupoDe(d[1], valor), linea, uso })
  }
  return { tieneRaiz: true, tokens, errores }
}
