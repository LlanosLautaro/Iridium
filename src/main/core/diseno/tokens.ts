// Los tokens de las maquetas (frente Diseño, DS-13): las variables del primer bloque `:root` de `docs/diseno/tokens.css`,
// agrupadas para dibujarlas en Sistema (`modulos/diseno/diseno-tecnico.md` › Sistema). Cada token lleva su uso: el
// comentario que lo sigue en la misma línea (`--principal: #3ccf7f; /* el botón principal, uno por pantalla */`, D-114).
// Un estilo de texto es un `--estilo-*` con el atajo `font` de CSS: `peso tamaño/interlineado letra` (T-61, D-116). Una
// medida fija es un `--alto-*` o un `--ancho-*` con una sola medida: la barra, un control, una fila, un panel (T-63, D-119).

export type GrupoToken =
  | 'colores'
  | 'letra'
  | 'estilos'
  | 'tamanos'
  | 'espacios'
  | 'medidas'
  | 'sombras'
  | 'otras'

export interface Token {
  nombre: string
  valor: string
  grupo: GrupoToken
  /** Desde 1. */
  linea: number
  /** Para qué se usa: el comentario después del `;` en la misma línea, o null. */
  uso: string | null
  /** Solo en los estilos de texto: el valor con los `var(--…)` reemplazados, para dibujarlo; null si no se pudo. */
  muestra?: string | null
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
  if (/^estilo-/.test(n)) return 'estilos'
  if (/^(tam|tamano|tamaño)-/.test(n)) return 'tamanos'
  if (/^(espacio|esp|radio)-/.test(n)) return 'espacios'
  if (/^(alto|ancho)-/.test(n)) return 'medidas'
  if (/^sombra-/.test(n)) return 'sombras'
  if (esColor(valor)) return 'colores'
  if (/(^|-)(ui|fuente|letra|mono)(-|$)/.test(n) || (/,/.test(valor) && !/\(/.test(valor))) return 'letra'
  return 'otras'
}

/** Reemplaza los `var(--x)` (y `var(--x, otro)`) por el valor del token, hasta cinco vueltas; null si queda uno que no está. */
export function resolver(valor: string, valores: ReadonlyMap<string, string>): string | null {
  let v = valor
  for (let i = 0; i < 5 && /var\(/.test(v); i++) {
    let falta = false
    v = v.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (_, n: string, otro?: string) => {
      const x = valores.get(n) ?? otro?.trim()
      if (x === undefined) falta = true
      return x ?? ''
    })
    if (falta) return null
  }
  return /var\(/.test(v) ? null : v.replace(/\s+/g, ' ').trim()
}

const MEDIDA = /^\d*\.?\d+(px|rem|em|vh|vw|%)$/

/** Una medida fija se escribe como una sola medida (`36px`), sin cuentas ni otros tokens. */
export function esMedida(valor: string): boolean {
  return MEDIDA.test(valor.trim())
}

export interface EstiloTexto {
  peso: string
  tamano: string
  interlineado: string | null
  letra: string
}

const TAMANO = /^\d*\.?\d+(px|rem|em|pt|%)$/

/** El atajo `font` de un estilo de texto ya resuelto: `[italic] [peso] tamaño[/interlineado] letra`; null si no lo es. */
export function leerEstilo(valor: string): EstiloTexto | null {
  const m =
    /^(?:(?:italic|oblique)\s+)?(?:(normal|bold|[1-9]00)\s+)?(\S+?)(?:\s*\/\s*(\S+))?\s+(\S.*)$/i.exec(
      valor.trim(),
    )
  if (!m?.[2] || !m[4] || !TAMANO.test(m[2])) return null
  if (m[3] && !/^(normal|\d*\.?\d+(px|rem|em|%)?)$/.test(m[3])) return null
  return { peso: m[1] ?? '400', tamano: m[2], interlineado: m[3] ?? null, letra: m[4] }
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
  const valores = new Map(tokens.map((t) => [t.nombre, t.valor]))
  for (const t of tokens) {
    if (t.grupo !== 'estilos') continue
    const r = resolver(t.valor, valores)
    t.muestra = r && leerEstilo(r) ? r : null
  }
  return { tieneRaiz: true, tokens, errores }
}
