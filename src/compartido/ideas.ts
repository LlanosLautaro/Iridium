// Lo que la sección Ideas (modulos/inicio/) recibe del proceso principal: las ideas de `Ideas/ideas.md` por sección,
// con el cuerpo ya pintado y los proyectos que tocan.

/** Un proyecto que toca una idea: con su ruta si existe en la carpeta de proyectos (es un enlace); si no, texto. */
export interface ProyectoTocado {
  nombre: string
  ruta: string | null
}

export interface Idea {
  titulo: string
  /** AAAA-MM-DD; null si el título no la trae. */
  fecha: string | null
  /** El cuerpo, sin la frase `Toca a:` ni la línea `→`, como HTML (el render de Docs). */
  html: string
  toca: ProyectoTocado[]
  /** A dónde fue (la línea `→`), como HTML; null si no está integrada. */
  destinoHtml: string | null
  /** Está en Integradas o tiene su línea `→`. */
  integrada: boolean
}

export interface SeccionIdeas {
  titulo: string
  /** La línea que la explica, debajo del título; null si no hay. */
  explicacion: string | null
  /** Es la de las ideas que ya pasaron a un proyecto: empieza plegada. */
  integradas: boolean
  ideas: Idea[]
}

export type ListaIdeas =
  | { tipo: 'ideas'; secciones: SeccionIdeas[] }
  /** `ideas.md` sin `## ` ni `### `: se muestra entero, como en Docs. */
  | { tipo: 'sin-secciones'; html: string }
  | { tipo: 'sin-carpeta' }
  | { tipo: 'sin-archivo' }
  | { tipo: 'grande'; bytes: number }
  | { tipo: 'error'; mensaje: string }

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
