// Receptor de la extensión de la Revisión (diseno-tecnico.md › Seguridad): escucha solo en 127.0.0.1, acepta solo el
// origen de la extensión y el `Host` exacto, con pedidos de tamaño acotado. Lo que pasa adentro lo deciden los casos
// de uso; acá solo se valida la forma.
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import {
  ID_EXTENSION,
  LIMITE_PEDIDO_BYTES,
  PedidoComentario,
  PedidoDireccion,
  PedidoEstado,
  type RespuestaComentario,
  type RespuestaEstado,
} from '../../../compartido/revision'

export interface AtencionRevision {
  estado(direccion: string, version: string | null, carpeta?: string): Promise<RespuestaEstado>
  comentario(pedido: PedidoComentario): Promise<RespuestaComentario>
  direccion(pedido: PedidoDireccion): Promise<void>
}

export interface Receptor {
  /** null si escucha; el motivo si no pudo (el puerto ocupado). */
  error: string | null
  /** El puerto en el que escucha: el pedido o, con 0, el que eligió Windows (las pruebas). */
  puerto: number
  cerrar(): Promise<void>
}

class Rechazo extends Error {
  constructor(
    readonly codigo: number,
    mensaje: string,
  ) {
    super(mensaje)
  }
}

async function leerCuerpo(req: IncomingMessage): Promise<unknown> {
  let total = 0
  const partes: Buffer[] = []
  for await (const parte of req) {
    total += (parte as Buffer).length
    if (total > LIMITE_PEDIDO_BYTES) throw new Rechazo(413, 'demasiado grande')
    partes.push(parte as Buffer)
  }
  try {
    return JSON.parse(Buffer.concat(partes).toString('utf8'))
  } catch {
    throw new Rechazo(400, 'no es JSON')
  }
}

function responder(res: ServerResponse, codigo: number, cuerpo?: unknown): void {
  if (cuerpo === undefined) {
    res.writeHead(codigo).end()
    return
  }
  res.writeHead(codigo, { 'content-type': 'application/json; charset=utf-8' }).end(JSON.stringify(cuerpo))
}

export function arrancarReceptor(
  atencion: AtencionRevision,
  opciones: { puerto: number; origen?: string; alError?: (e: unknown) => void },
): Promise<Receptor> {
  const origenValido = opciones.origen ?? `chrome-extension://${ID_EXTENSION}`
  // Con el puerto 0 se sabe recién al escuchar.
  let hostValido = `127.0.0.1:${opciones.puerto}`

  const atender = async (req: IncomingMessage, res: ServerResponse) => {
    // Una página web no puede falsear el origen; un nombre de dominio que apunte a la PC no pasa el `Host`.
    // Sin el origen o el `Host` justos: 403 sin cuerpo.
    if (req.headers.origin !== origenValido || req.headers.host !== hostValido) return responder(res, 403)
    if (req.method === 'OPTIONS') return responder(res, 204)
    const url = new URL(req.url ?? '/', `http://${hostValido}`)
    try {
      // `POST` aunque solo consulte: Chrome y Edge no mandan el origen de la extensión en un `GET`.
      if (req.method === 'POST' && url.pathname === '/estado') {
        const pedido = PedidoEstado.safeParse(await leerCuerpo(req))
        if (!pedido.success) throw new Rechazo(400, 'consulta mal formada')
        return responder(
          res,
          200,
          await atencion.estado(pedido.data.direccion, pedido.data.version ?? null, pedido.data.carpeta),
        )
      }
      if (req.method === 'POST' && url.pathname === '/comentarios') {
        const pedido = PedidoComentario.safeParse(await leerCuerpo(req))
        if (!pedido.success) throw new Rechazo(400, 'comentario mal formado')
        return responder(res, 200, await atencion.comentario(pedido.data))
      }
      if (req.method === 'POST' && url.pathname === '/direcciones') {
        const pedido = PedidoDireccion.safeParse(await leerCuerpo(req))
        if (!pedido.success) throw new Rechazo(400, 'dirección mal formada')
        await atencion.direccion(pedido.data)
        return responder(res, 204)
      }
      return responder(res, 404)
    } catch (e) {
      if (e instanceof Rechazo) return responder(res, e.codigo, { error: e.message })
      opciones.alError?.(e)
      return responder(res, 500, { error: 'no se pudo guardar' })
    }
  }

  const servidor: Server = createServer((req, res) => {
    void atender(req, res)
  })
  servidor.requestTimeout = 30_000

  return new Promise((listo) => {
    const receptor: Receptor = {
      error: null,
      puerto: opciones.puerto,
      cerrar: () => new Promise((fin) => servidor.close(() => fin())),
    }
    servidor.once('error', (e: NodeJS.ErrnoException) => {
      receptor.error =
        e.code === 'EADDRINUSE'
          ? `El puerto ${opciones.puerto} está ocupado (¿hay otro Iridium abierto?)`
          : `No se pudo escuchar en el puerto ${opciones.puerto}: ${e.message}`
      receptor.cerrar = async () => {}
      listo(receptor)
    })
    servidor.listen(opciones.puerto, '127.0.0.1', () => {
      const direccion = servidor.address()
      if (direccion && typeof direccion === 'object') receptor.puerto = direccion.port
      hostValido = `127.0.0.1:${receptor.puerto}`
      listo(receptor)
    })
  })
}
