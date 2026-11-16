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
