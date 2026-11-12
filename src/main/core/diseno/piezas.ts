// Las fichas de las piezas (frente Diseño, T-62, D-117): el comentario que encabeza cada pieza en `docs/diseno/piezas.css`
// dice su grupo, para qué sirve y sus estados; los tokens que usa salen de sus reglas, hasta el próximo comentario que
// empieza una línea. Un comentario es ficha si tiene la línea «Para qué:».
//
//   /* ───────── PZ-1 · Botón ─────────
//      Grupo: Acciones
//      Para qué: lo que se hace en una pantalla; un principal como mucho.
//      Estados: principal, secundario, sin fondo, peligroso, chico, apagado. */

export interface Ficha {
  /** `PZ-1`, si el título lo trae. */
  codigo: string | null
  nombre: string
  grupo: string | null
  paraQue: string
  estados: string[]
  /** Los `var(--…)` de sus reglas, sin repetir y en el orden en que aparecen; los que traen otro valor (`var(--x, 0)`) no. */
  tokens: string[]
  /** Desde 1: donde empieza el comentario. */
  linea: number
}

const CAMPO = /^(grupo|para qu[eé]|estados)\s*:\s*(.*)$/i

function campo(nombre: string): 'grupo' | 'paraQue' | 'estados' {
  const n = nombre.toLowerCase()
  return n === 'grupo' ? 'grupo' : n === 'estados' ? 'estados' : 'paraQue'
}

/** El título sin los adornos (`─`, `-`, `=`, `*`) de los costados. */
function titulo(linea: string): { codigo: string | null; nombre: string } {
  const t = linea.replace(/^[\s─—–=*#-]+|[\s─—–=*#-]+$/g, '')
  const m = /^([A-Z]{1,4}-\d+)\s*[·:—–-]\s*(.+)$/.exec(t)
  return m?.[1] && m[2] ? { codigo: m[1], nombre: m[2].trim() } : { codigo: null, nombre: t }
}

function leerComentario(texto: string): Omit<Ficha, 'tokens' | 'linea'> | null {
  const lineas = texto.split('\n').map((l) => l.trim())
  if (!lineas.some((l) => /^para qu[eé]\s*:/i.test(l))) return null
  const t = titulo(lineas.find((l) => l && !CAMPO.test(l)) ?? '')
  const valores = { grupo: '', paraQue: '', estados: '' }
  let actual: keyof typeof valores | null = null
  for (const l of lineas) {
    const m = CAMPO.exec(l)
    if (m?.[1]) {
      actual = campo(m[1])
      valores[actual] = m[2] ?? ''
    } else if (actual && l) valores[actual] += ` ${l}`
  }
  const limpio = (s: string) => s.replace(/\s+/g, ' ').trim()
  return {
    ...t,
    grupo: limpio(valores.grupo) || null,
    paraQue: limpio(valores.paraQue),
    estados: limpio(valores.estados)
      .replace(/\.$/, '')
      .split(/\s*[,·]\s*/)
      .filter(Boolean),
  }
}

/** Los `var(--x)` de un trozo de CSS sin comentarios. */
export function tokensUsados(css: string): string[] {
  const vistos = new Set<string>()
  for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) if (m[1] && m[2] === ')') vistos.add(m[1])
  return [...vistos]
}

/** Las variables que la misma hoja define (`--nivel: 2`), que no son tokens que falten. */
export function variablesPropias(css: string): Set<string> {
  return new Set([...css.matchAll(/(?:^|[;{\s])(--[\w-]+)\s*:/g)].flatMap((m) => (m[1] ? [m[1]] : [])))
}

export function leerFichas(css: string): Ficha[] {
  const texto = css.replace(/\r\n?/g, '\n')
  const comentarios = [...texto.matchAll(/\/\*([\s\S]*?)\*\//g)].map((m) => ({
    desde: m.index,
    hasta: m.index + m[0].length,
    cuerpo: m[1] ?? '',
    // Empieza una línea: corta las reglas de la pieza de arriba.
    corta: /(^|\n)[ \t]*$/.test(texto.slice(0, m.index)),
  }))
  const fichas: Ficha[] = []
  comentarios.forEach((c, i) => {
    const f = leerComentario(c.cuerpo)
    if (!f) return
    const siguiente = comentarios.slice(i + 1).find((x) => x.corta)
    const reglas = texto.slice(c.hasta, siguiente?.desde ?? texto.length).replace(/\/\*[\s\S]*?\*\//g, '')
    fichas.push({ ...f, tokens: tokensUsados(reglas), linea: texto.slice(0, c.desde).split('\n').length })
  })
  return fichas
}
