// Las ideas de un proyecto con framework viejo (R-8), como las recibe la ventana.

/** Una sección de ideas de un proyecto (R-8): `07-construccion.md` › Ideas nuevas o `00-idea.md` › Ideas para después. */
export interface SeccionIdeasProyecto {
  documento: string
  titulo: string
  /** Para abrirla en Docs; null si el índice no la encuentra. */
  ancla: string | null
  /** El cuerpo como HTML (el render de Docs); '' si está vacía. */
  html: string
  cantidad: number
}

/** Las ideas del proyecto, en el orden de `SECCIONES_IDEAS`; sin secciones si no tiene ninguna de las dos. */
export interface IdeasProyecto {
  secciones: SeccionIdeasProyecto[]
}

// La sección Ideas (frente Ideas, D-128 a D-130; `modulos/ideas/diseno-tecnico.md`): cada idea es un `T-n` de
// `trabajo.md` con `Idea:`; la ventana la ve con las palabras del usuario.

/** De quién es: la anotó el usuario, la IA, o es un enlace para revisar. */
export type DeQuienIdea = 'usuario' | 'IA' | 'enlace'

/** Los estados como los ve el usuario (D-129): `nueva`, `pendiente`/`en curso`/`en pausa`, `descartado`, `hecho`. */
export type EstadoIdea = 'sin-evaluar' | 'aprobada' | 'rechazada' | 'hecha'

export interface IdeaVista {
  /** `T-12` */
  codigo: string
  titulo: string
  de: DeQuienIdea
  estado: EstadoIdea
  fecha: string | null
  /** La dirección de un enlace para revisar; null en las ideas. */
  enlace: string | null
  /** El texto de `trabajo.md`: la idea de la IA o la descripción de un enlace (Markdown). */
  texto: string
  /** Si tiene nota en `docs/ideas/T-n.md` (solo las del usuario). */
  conNota: boolean
}

export const FILTROS_IDEAS = [
  'todo',
  'para-revisar',
  'sin-evaluar',
  'aprobadas',
  'rechazadas',
  'hechas',
] as const
export type FiltroIdeas = (typeof FILTROS_IDEAS)[number]

/** Las ideas de un proyecto: solo los que siguen el framework tienen `trabajo.md`. */
export type IdeasDeProyecto =
  | { tipo: 'ok'; ideas: IdeaVista[] }
  | { tipo: 'sin-framework' }
  | { tipo: 'error'; mensaje: string }

/** Lo que devuelve un cambio: el código de la idea, o por qué no se pudo (la pantalla no pierde lo escrito, ID-11). */
export type ResultadoIdea = { tipo: 'ok'; codigo: string } | { tipo: 'error'; mensaje: string }

/** La nota de una idea, sin el título; '' si no tiene. */
export type NotaIdea = { tipo: 'ok'; texto: string } | { tipo: 'error'; mensaje: string }

/** Los estados a los que la pasa Iridium (ID-3): aprobar, rechazar, volver a sin evaluar y marcar revisado. */
export const ESTADOS_DESDE_IDEAS = ['nueva', 'pendiente', 'descartado', 'hecho'] as const
export type EstadoDesdeIdeas = (typeof ESTADOS_DESDE_IDEAS)[number]

/** Si la idea entra en el filtro (ID-3): «Todo» no muestra las hechas; un enlace revisado es una hecha. */
export function entraEnFiltro(idea: IdeaVista, filtro: FiltroIdeas): boolean {
  const enlace = idea.de === 'enlace'
  switch (filtro) {
    case 'todo':
      return idea.estado !== 'hecha'
    case 'para-revisar':
      return enlace && idea.estado !== 'hecha'
    case 'sin-evaluar':
      return !enlace && idea.estado === 'sin-evaluar'
    case 'aprobadas':
      return !enlace && idea.estado === 'aprobada'
    case 'rechazadas':
      return !enlace && idea.estado === 'rechazada'
    case 'hechas':
      return idea.estado === 'hecha'
  }
}

export function contarPorFiltro(ideas: readonly IdeaVista[]): Record<FiltroIdeas, number> {
  const r = { todo: 0, 'para-revisar': 0, 'sin-evaluar': 0, aprobadas: 0, rechazadas: 0, hechas: 0 }
  for (const i of ideas) for (const f of Object.keys(r) as FiltroIdeas[]) if (entraEnFiltro(i, f)) r[f]++
  return r
}

/**
 * El nombre de un enlace, de su dirección y sin leer la página (D-130): en GitHub, `dueño/repo`; si no, el último
 * tramo de la dirección o el sitio. Una dirección que no se entiende, entera.
 */
export function nombreDeEnlace(url: string): { nombre: string; sitio: string | null } {
  try {
    const u = new URL(url)
    const sitio = u.hostname.replace(/^www\./, '')
    const tramos = u.pathname
      .split('/')
      .filter(Boolean)
      .map((t) => {
        try {
          return decodeURIComponent(t)
        } catch {
          return t
        }
      })
    if (sitio === 'github.com' && tramos.length >= 2)
      return { nombre: `${tramos[0]}/${tramos[1]?.replace(/\.git$/, '')}`, sitio }
    const ultimo = tramos.at(-1)?.replace(/\.(html?|php|aspx?)$/i, '')
    return ultimo ? { nombre: ultimo, sitio } : { nombre: sitio, sitio: null }
  } catch {
    return { nombre: url, sitio: null }
  }
}
