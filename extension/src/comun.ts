// Lo que comparten las piezas de la extensión: los mensajes entre el selector y el service worker. La forma del
// comentario es la misma que valida Iridium (`src/compartido/revision.ts`).
import type { PedidoComentario, RespuestaComentario, RespuestaEstado } from '../../src/compartido/revision'

export type { PedidoComentario, RespuestaComentario, RespuestaEstado }

/** Lo que el selector le pide al service worker. */
export type Pedido =
  | { tipo: 'estado'; direccion: string }
  | { tipo: 'capturar'; rect: { x: number; y: number; w: number; h: number }; ancho: number }
  | { tipo: 'dejar'; pedido: PedidoComentario }
  | { tipo: 'direccion'; direccion: string; proyecto: string }

export type Estado = ({ tipo: 'abierto' } & RespuestaEstado) | { tipo: 'cerrado' }

export type ResultadoDejar =
  | RespuestaComentario
  | { tipo: 'en-cola'; esperando: number }
  | { tipo: 'error'; mensaje: string }

/** Entre el selector (mundo aislado) y el script de la página (mundo MAIN), por `postMessage`. */
export const CANAL_PAGINA = 'iridium-revision'
export const ATRIBUTO_MARCA = 'data-iridium-revision'

export interface PistaReact {
  /** Los componentes que contienen al elemento, del más cercano al más lejano. */
  componentes: string[]
  pila: string | null
}
