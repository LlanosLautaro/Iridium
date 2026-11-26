// Lo que lee el control y lo que devuelve (frente Orden, OR-2; `modulos/orden/diseno-tecnico.md` › El control).

export interface ArchivoLeido {
  /** Relativa al proyecto, con `/`: `docs/estado.md`. */
  ruta: string
  texto: string
}

export interface ArchivosControl {
  /** `docs/estado.md` primero y después los `docs/modulos/<m>/estado.md`. */
  estados: ArchivoLeido[]
  /** `docs/trabajo.md`, o null si no existe. */
  trabajo: string | null
  /** El texto de cada `docs/respuestas/Q-n.md`, por código (`Q-7`). */
  respuestas: ReadonlyMap<string, string>
  /** Todos los `docs/**\/*.md` (para los dibujos en texto). */
  documentos: ArchivoLeido[]
  /** Los frentes que existen: la carpeta y el nombre de cada módulo, y los de la tabla «Módulos» sin carpeta todavía. */
  frentes: readonly { carpeta: string; nombre: string }[]
  /** `docs/diseno/` (frente Diseño, D-105), o null/ausente si el proyecto no lo tiene. */
  diseno?: ArchivosDiseno | null
  /** `novedades.md` del framework, solo en el repo que lo trae (T-64); null/ausente en los demás. */
  novedades?: string | null
}

export interface ArchivosDiseno {
  /** Los `.html`, `.css`, `.js` y `.md` de `docs/diseno/`, con la ruta relativa a esa carpeta: `pantallas/bandeja.html`. */
  textos: ArchivoLeido[]
  /** Todos los archivos de `docs/diseno/` (también imágenes y letras), relativos a esa carpeta. */
  existentes: ReadonlySet<string>
}

export interface Aviso {
  /** La regla que lo encontró (`preguntas`, `respuestas`…). */
  regla: string
  archivo: string
  /** Desde 1; null si es del archivo entero. */
  linea: number | null
  /** Qué arreglar, en una línea, para la IA. */
  texto: string
}

export type Regla = (archivos: ArchivosControl) => Aviso[]

export function sinAcentos(t: string): string {
  return t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}
