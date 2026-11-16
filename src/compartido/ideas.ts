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
