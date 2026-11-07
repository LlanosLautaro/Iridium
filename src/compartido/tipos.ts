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

/** Descripción corta: entra en 3 líneas de la tarjeta (D-010). */
export const LIMITE_DESCRIPCION = 180
export const LIMITE_ETIQUETA = 24

/** Lo que edita el formulario "Editar proyecto" (historia 4). */
export interface DatosEdicion {
  descripcion: string
  estado: Estado
  etiquetas: string[]
  /** Ruta relativa a la carpeta del proyecto; null = sin ícono. */
  icono: string | null
  /** Solo con En rescate. */
  reemplazadoPor: string | null
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

/** Lo que la pestaña necesita saber de un proyecto para dibujar su tarjeta. */
export interface ProyectoVista {
  nombre: string
  ruta: string
  /** Letra que se muestra cuando el proyecto no tiene ícono. */
  inicial: string
  /** Es la carpeta abierta en esta ventana: muestra "Abierto" en lugar de "Abrir". */
  activo: boolean
  /** null = Sin clasificar (no tiene `.proyecto.json`) o datos dañados. */
  estado: Estado | null
  descripcion: string
  etiquetas: string[]
  archivado: boolean
  /** Ícono tal como está en el JSON (relativo), aunque el archivo no exista: lo usa el formulario. */
  iconoConfigurado: string | null
  /** Ruta absoluta del ícono en disco; la extensión la convierte en `iconoUri` antes de mandarla. */
  icono: string | null
  /** Dirección que la pestaña puede mostrar. */
  iconoUri: string | null
  /** Si el `.proyecto.json` existe pero no se puede usar: por qué. */
  problema: string | null
  /** null si el proyecto no tiene `docs/estado.md`. */
  guia: Guia | null
  /** Fecha (ms) del archivo modificado más reciente (D-013); null mientras se calcula. */
  ultimaActividad: number | null
  /** Proyecto que lo reemplaza (solo En rescate). */
  reemplazadoPor: string | null
  /** Proyectos En rescate cuyo reemplazo es este. */
  heredaDe: string[]
}

export type IdSeccion = 'sin-clasificar' | Estado | 'archivados'

export interface Seccion {
  id: IdSeccion
  titulo: string
  /** Plegada por defecto: se muestra siempre con su cantidad, aunque sea 0. Las abiertas vacías no se muestran. */
  plegadaPorDefecto: boolean
  proyectos: ProyectoVista[]
}

/** La lista completa, ya armada: la pestaña no decide nada, solo dibuja. */
export type Vista =
  | {
      tipo: 'lista'
      raiz: string
      /** La carpeta raíz es la abierta en esta ventana (D-020). */
      raizAbierta: boolean
      total: number
      secciones: Seccion[]
    }
  | { tipo: 'error'; raiz: string; mensaje: string }

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

export type ErroresFormulario = Partial<Record<keyof DatosEdicion, string>>

export type MensajeAPestana =
  | { tipo: 'vista'; vista: Vista }
  | { tipo: 'resultado'; ok: boolean; mensaje: string }
  | { tipo: 'guardado'; id: number; ok: true }
  | { tipo: 'guardado'; id: number; ok: false; mensaje: string | null; errores: ErroresFormulario }
  | { tipo: 'iconoElegido'; id: number; icono: string; iconoUri: string }
  | { tipo: 'iconoElegido'; id: number; icono: null; mensaje: string | null }
  | { tipo: 'archivado'; ruta: string; nombre: string; archivado: boolean }
  | { tipo: 'planEliminacion'; id: number; ok: true; plan: PlanEliminacion }
  | { tipo: 'planEliminacion'; id: number; ok: false; mensaje: string }
  | { tipo: 'eliminado'; id: number; ok: true; nombre: string }
  | { tipo: 'eliminado'; id: number; ok: false; mensaje: string }
  | { tipo: 'creado'; ruta: string; nombre: string }

export type MensajeAExtension =
  | { tipo: 'listo' }
  | { tipo: 'actualizar' }
  | { tipo: 'abrir'; ruta: string }
  | { tipo: 'guardar'; id: number; ruta: string; datos: DatosEdicion }
  | { tipo: 'cambiarEstado'; ruta: string; estado: Estado }
  | { tipo: 'elegirIcono'; id: number; ruta: string }
  | { tipo: 'archivar'; ruta: string; nombre: string; archivado: boolean }
  | { tipo: 'elegirRaiz' }
  /** Analiza la carpeta y responde con el plan; nada se borra todavía. */
  | { tipo: 'prepararEliminacion'; id: number; ruta: string }
  /** Ejecuta el plan preparado con ese id (la extensión lo guarda: la pestaña no elige qué se borra). */
  | { tipo: 'eliminar'; id: number }
  /** Pide el nombre (cuadro nativo) y crea la carpeta del proyecto nuevo (D-020). */
  | { tipo: 'nuevoProyecto' }
  /** Abre la carpeta raíz en esta ventana (D-020). */
  | { tipo: 'abrirRaiz' }
