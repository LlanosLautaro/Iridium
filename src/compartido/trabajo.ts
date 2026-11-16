// Lo que la sección Trabajo de un proyecto (frente Orden, 04-ux.md › W-11) recibe del proceso principal: los `T-n` de
// `docs/trabajo.md` con el texto ya pintado.
import type { IdeasProyecto } from './ideas'

/** El vocabulario único (frente Orden, OR-5); el mismo de `core/estados.ts`. */
export type EstadoTrabajo = 'pendiente' | 'en curso' | 'en pausa' | 'hecho' | 'descartado' | 'nueva'

export interface ItemTrabajoVista {
  /** `T-12` */
  codigo: string
  titulo: string
  /** null: falta o no es del vocabulario (va a «Sin estado», con el aviso). */
  estado: EstadoTrabajo | null
  estadoTexto: string
  /** null es del núcleo. */
  frente: string | null
  fecha: string | null
  /** El origen con sus códigos como enlaces (HTML en línea); null si no tiene. */
  origenHtml: string | null
  /** El texto como HTML (el render de Docs); '' si no tiene. */
  html: string
}

export type TrabajoProyecto =
  | { tipo: 'trabajo'; items: ItemTrabajoVista[]; existe: boolean }
  /** No pasó al framework: sus ideas siguen en las secciones de la guía (R-8). */
  | { tipo: 'viejo'; ideas: IdeasProyecto }
  /** Sin `docs/estado.md` (carpeta simple, D-095). */
  | { tipo: 'sin-docs' }
