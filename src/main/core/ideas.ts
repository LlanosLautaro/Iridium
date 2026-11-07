// Lee `Ideas/ideas.md` (modulos/inicio/diseno-tecnico.md › Estructura interna), con el formato de `Ideas/CLAUDE.md`:
// cada `## ` es una sección, con la línea que la explica; cada `### `, una idea con su fecha al final del título,
// la frase `Toca a:` con los proyectos entre comillas invertidas y, si ya pasó a un proyecto, una línea `→`. Sin disco.

export interface IdeaLeida {
  titulo: string
  fecha: string | null
  /** El cuerpo tal cual, sin la frase `Toca a:` ni las líneas `→`. */
  cuerpo: string
  toca: string[]
  /** Lo que sigue a `→`; null si no tiene. */
  destino: string | null
}

export interface SeccionLeida {
  titulo: string
  explicacion: string | null
  integradas: boolean
  ideas: IdeaLeida[]
}

export type IdeasLeidas = { tipo: 'secciones'; secciones: SeccionLeida[] } | { tipo: 'sin-secciones' }

/** La fecha al final del título: `— 2026-10-30`, con raya, guion o sin espacios. */
const FECHA_TITULO = /\s*[—–-]\s*(\d{4}-\d{2}-\d{2})\s*$/
const TOCA = /\bToca a:\s*(.*)$/
const CERCO = /^\s*(```|~~~)/

/** El título sin la fecha, y la fecha. */
export function tituloYFecha(linea: string): { titulo: string; fecha: string | null } {
  const m = FECHA_TITULO.exec(linea)
  if (!m || m.index === 0) return { titulo: linea.trim(), fecha: null }
  return { titulo: linea.slice(0, m.index).trim(), fecha: m[1] ?? null }
}

/** ¿Es la sección de las ideas que ya pasaron a un proyecto? */
function esDeIntegradas(titulo: string): boolean {
  return /^integrad/i.test(titulo.trim())
}

function idea(titulo: string, lineas: string[]): IdeaLeida {
  const { titulo: t, fecha } = tituloYFecha(titulo)
  const toca: string[] = []
  const destinos: string[] = []
  const cuerpo: string[] = []
  for (const linea of lineas) {
    const flecha = /^\s*→\s*(.*)$/.exec(linea)
    if (flecha) {
      destinos.push((flecha[1] ?? '').trim())
      continue
    }
    const m = TOCA.exec(linea)
    if (m) {
      for (const n of (m[1] ?? '').matchAll(/`([^`]+)`/g)) if (n[1] && !toca.includes(n[1])) toca.push(n[1])
      const resto = linea.slice(0, m.index).trimEnd()
      if (resto !== '') cuerpo.push(resto)
      continue
    }
    cuerpo.push(linea)
  }
  return {
    titulo: t,
    fecha,
    cuerpo: cuerpo.join('\n').trim(),
    toca,
    destino: destinos.length > 0 ? destinos.join('\n') : null,
  }
}

export function leerIdeas(texto: string): IdeasLeidas {
  const secciones: SeccionLeida[] = []
  let seccion: SeccionLeida | null = null
  let actual: { titulo: string; lineas: string[] } | null = null
  /** Lo que hay entre el título de la sección y su primera idea. */
  let antes: string[] = []
  let enCerco = false

  const cerrarIdea = () => {
    if (actual && seccion) seccion.ideas.push(idea(actual.titulo, actual.lineas))
    actual = null
  }
  const cerrarSeccion = () => {
    cerrarIdea()
    if (seccion && seccion.explicacion === null) seccion.explicacion = explicacionDe(antes)
    antes = []
  }

  for (const linea of texto.replace(/\r\n?/g, '\n').split('\n')) {
    if (CERCO.test(linea)) enCerco = !enCerco
    const h2 = enCerco ? null : /^##\s+(.+?)\s*#*\s*$/.exec(linea)
    const h3 = enCerco ? null : /^###\s+(.+?)\s*#*\s*$/.exec(linea)
    if (h2 && !linea.startsWith('###')) {
      cerrarSeccion()
      const titulo = h2[1] ?? ''
      seccion = { titulo, explicacion: null, integradas: esDeIntegradas(titulo), ideas: [] }
      secciones.push(seccion)
      continue
    }
    if (h3) {
      if (!seccion) {
        seccion = { titulo: 'Ideas', explicacion: null, integradas: false, ideas: [] }
        secciones.push(seccion)
      }
      if (actual === null && seccion.explicacion === null) seccion.explicacion = explicacionDe(antes)
      cerrarIdea()
      actual = { titulo: h3[1] ?? '', lineas: [] }
      continue
    }
    if (actual) (actual as { lineas: string[] }).lineas.push(linea)
    else if (seccion) antes.push(linea)
  }
  cerrarSeccion()

  if (secciones.length === 0) return { tipo: 'sin-secciones' }
  return { tipo: 'secciones', secciones }
}

/** La primera línea con texto debajo del título de la sección. */
function explicacionDe(lineas: string[]): string | null {
  const l = lineas.map((x) => x.trim()).find((x) => x !== '')
  return l ?? null
}

/** El `ideas.md` con que nace la carpeta Ideas, para cuando se anota la primera suelta sin él. */
const IDEAS_VACIO = '# Ideas\n\n## Sueltas\nIdeas que todavía no tienen proyecto.\n'

/**
 * `ideas.md` con una idea suelta nueva (W-10): arriba de la sección Sueltas, debajo de la línea que la explica, como
 * pide `Ideas/CLAUDE.md` («la más nueva arriba»). Sin esa sección, la crea debajo del título del archivo.
 */
export function conIdeaSuelta(texto: string | null, titulo: string, fecha: string): string {
  const idea = `### ${titulo.trim().replace(/\s+/g, ' ')} — ${fecha}`
  const lineas = (texto ?? IDEAS_VACIO).replace(/\r\n?/g, '\n').split('\n')
  const i = lineas.findIndex((l) => /^##\s+sueltas\b/i.test(l))
  if (i === -1) {
    const h1 = lineas.findIndex((l) => /^#\s/.test(l))
    // Después del título y de la línea que lo acompaña (la cita de cómo se usa), antes de la primera sección.
    const primera = lineas.findIndex((l, n) => n > h1 && /^##?\s/.test(l))
    const donde = primera === -1 ? lineas.length : primera
    const antes = lineas.slice(0, donde)
    while (antes.length > 0 && antes.at(-1)?.trim() === '') antes.pop()
    const nueva = ['## Sueltas', 'Ideas que todavía no tienen proyecto.', '', idea, '']
    return [...antes, ...(antes.length ? [''] : []), ...nueva, ...lineas.slice(donde)].join('\n')
  }
  // La línea que explica la sección queda arriba; la idea, después.
  let donde = i + 1
  while (donde < lineas.length && lineas[donde]?.trim() === '') donde++
  const explica = lineas[donde]
  if (explica !== undefined && explica.trim() !== '' && !/^#{1,6}\s/.test(explica)) donde++
  const resto = lineas.slice(donde)
  while (resto.length > 0 && resto[0]?.trim() === '') resto.shift()
  return [...lineas.slice(0, donde), '', idea, '', ...resto].join('\n')
}
