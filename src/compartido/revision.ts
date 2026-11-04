// Lo que se hablan la extensión de la Revisión y el receptor de Iridium (modulos/revision/diseno-tecnico.md ›
// Contrato con el núcleo). Iridium valida con estos esquemas; la extensión importa solo los tipos.
import { z } from 'zod'

/** Puerto del receptor; las pruebas usan otro (IRIDIUM_REVISION_PUERTO) para no chocar con la app de uso diario. */
export const PUERTO_REVISION = 47321

/** Id fijo de la extensión: sale de la `key` de su manifiesto, igual en Chrome, Edge y Electron. */
export const ID_EXTENSION = 'lnjpddimnapkmhoggokbjkoleaanbfhd'

/** Versión del contrato y de la extensión: si la cargada es más vieja, se pide recargarla. */
export const VERSION_EXTENSION = '0.2.0'

/** Lo más grande que acepta el receptor (un comentario con su captura). */
export const LIMITE_PEDIDO_BYTES = 10 * 1024 * 1024

const Rect = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() })

export const PedidoComentario = z.object({
  /** Lo genera la extensión al crear el comentario: si llega dos veces (la cola), no se duplica. */
  id: z.string().regex(/^[\w-]{8,64}$/),
  /** Dirección completa de la página: `http://localhost:5173/ajustes`. */
  url: z.string().url().max(2000),
  texto: z.string().trim().min(1).max(20_000),
  elemento: z.object({
    etiqueta: z.string().max(40),
    texto: z.string().max(200).default(''),
    selector: z.string().max(1000),
    rect: Rect,
  }),
  componentes: z.array(z.string().max(120)).max(30).default([]),
  /** La pila del JSX que dibujó el elemento (`_debugStack` de React 19); null sin React o sin modo desarrollo. */
  pila: z.string().max(20_000).nullable().default(null),
  ventana: z.object({ ancho: z.number(), alto: z.number() }),
  /** PNG recortado, como `data:image/png;base64,…`; null si la captura falló. */
  captura: z
    .string()
    .regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/)
    .nullable()
    .default(null),
  /** El proyecto que eligió el usuario en la tarjeta, por nombre; si falta, lo resuelve Iridium. */
  proyecto: z.string().max(200).optional(),
  /** En una app Electron, la carpeta de la app (la dice el ayudante): el proyecto es el que la contiene. */
  carpeta: z.string().max(1000).optional(),
  /** Cuándo se dejó (ISO): con la cola puede llegar mucho después. */
  creado: z.string().datetime({ offset: true }),
  /** Enviar ahora (H-R2): además de guardarlo, mandarlo a la sesión del proyecto. La cola nunca lo pide. */
  enviar: z.boolean().default(false),
})
export type PedidoComentario = z.infer<typeof PedidoComentario>

export const PedidoDireccion = z.object({
  direccion: z.string().max(300),
  proyecto: z.string().min(1).max(200),
  carpeta: z.string().max(1000).optional(),
})
export type PedidoDireccion = z.infer<typeof PedidoDireccion>

export const PedidoEstado = z.object({
  direccion: z.string().max(300),
  version: z.string().max(40).optional(),
  carpeta: z.string().max(1000).optional(),
})
export type PedidoEstado = z.infer<typeof PedidoEstado>

/** `POST /estado`: si Iridium sabe de qué proyecto es la dirección y, si no, entre cuáles elegir. */
export interface RespuestaEstado {
  version: string
  proyecto: string | null
  proyectos: string[]
}

/** `POST /comentarios`. */
export type RespuestaComentario =
  | {
      tipo: 'guardado'
      codigo: string
      proyecto: string
      /** Solo con Enviar ahora: si entró a la sesión o el proyecto no está abierto en Iridium; null si no se pidió. */
      envio: 'enviado' | 'sin-sesion' | null
    }
  | { tipo: 'sin-proyecto'; proyectos: string[] }
