// Copiado de la app anterior de proyectos (D-026).
// Tipos compartidos por la extensión y la pestaña. Se definen una sola vez (05-arquitectura.md).

/** Estados del ciclo de vida, en el orden del ciclo (02-definicion.md, D-017). Son los valores del JSON. */
export const ESTADOS = [
  'idea',
  'en-desarrollo',
  'en-uso',
  'pausado',
  'descontinuado',
  'en-rescate',
  'para-eliminar',
] as const

export type Estado = (typeof ESTADOS)[number]

/** Nombres escritos exactamente como en el design system. */
export const NOMBRE_ESTADO: Record<Estado, string> = {
  idea: 'Idea',
  'en-desarrollo': 'En desarrollo',
  'en-uso': 'En uso',
  pausado: 'Pausado',
  descontinuado: 'Descontinuado',
  'en-rescate': 'En rescate',
  'para-eliminar': 'Para eliminar',
}

/** Lo que se lee de `docs/estado.md` (guía de hitos). Cada dato puede faltar. */
export interface Guia {
  hito: number | null
  nombreHito: string | null
  /** "en curso", "en revisión"… */
  estadoHito: string | null
  proximoPaso: string | null
  /** El frente en curso de la tabla «Módulos» y su paso (W-2); null si no hay. */
  frente?: { nombre: string; paso: string | null } | null
  /** AAAA-MM-DD */
  actualizado: string | null
}

/** Lo que muestra la confirmación de Eliminar (D-006): qué se borra definitivamente y qué va a la papelera. */
export interface PlanEliminacion {
  /** Carpetas regenerables, relativas al proyecto, con su tamaño en bytes (null = todavía se está midiendo). */
  regenerables: { relativa: string; bytes: number | null }[]
  /**
   * Todo lo demás: cuántos archivos (sin medir su tamaño: con decenas de miles de archivos tardaría
   * medio minuto). `conGit`: también va el historial de Git (no se recorre, RNF-2).
   */
  papelera: { archivos: number; conGit: boolean }
}
