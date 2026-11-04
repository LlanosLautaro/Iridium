// El receptor de la Revisión con pedidos reales a un puerto libre (diseno-tecnico.md › Seguridad y › Pruebas).
import { request } from 'node:http'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { ID_EXTENSION } from '../src/compartido/revision'
import { arrancarReceptor, type Receptor } from '../src/main/infra/revision/receptor'

const ORIGEN = `chrome-extension://${ID_EXTENSION}`
let puerto: number
let receptor: Receptor
const recibidos: unknown[] = []

function pedir(
  ruta: string,
  op: { metodo?: string; origen?: string | null; host?: string; cuerpo?: string } = {},
): Promise<{ estado: number; cuerpo: string }> {
  return new Promise((listo, fallo) => {
    const headers: Record<string, string> = { host: op.host ?? `127.0.0.1:${puerto}` }
    if (op.origen !== null) headers.origin = op.origen ?? ORIGEN
    if (op.cuerpo !== undefined) headers['content-type'] = 'application/json'
    const req = request(
      { host: '127.0.0.1', port: puerto, path: ruta, method: op.metodo ?? 'GET', headers },
      (res) => {
        let cuerpo = ''
        res.on('data', (c) => {
          cuerpo += c
        })
        res.on('end', () => listo({ estado: res.statusCode ?? 0, cuerpo }))
      },
    )
    req.on('error', fallo)
    if (op.cuerpo !== undefined) req.write(op.cuerpo)
    req.end()
  })
}

const comentario = {
  id: 'abcdef123456',
  url: 'http://localhost:5173/',
  texto: 'separalo',
  elemento: { etiqueta: 'button', texto: 'Guardar', selector: 'button', rect: { x: 1, y: 2, w: 3, h: 4 } },
  componentes: ['Tarjeta'],
  pila: null,
  ventana: { ancho: 800, alto: 600 },
  captura: null,
  creado: '2026-10-28T14:32:00.000Z',
}

beforeEach(async () => {
  recibidos.length = 0
  receptor = await arrancarReceptor(
    {
      estado: async (d) => ({
        version: '0.1.0',
        proyecto: d === 'localhost:5173' ? 'Alfa' : null,
        proyectos: ['Alfa'],
      }),
      comentario: async (p) => {
        recibidos.push(p)
        return { tipo: 'guardado', codigo: 'R-1', proyecto: 'Alfa', envio: null }
      },
      direccion: async (p) => {
        recibidos.push(p)
      },
    },
    // Puerto 0: Windows elige uno libre (un número al azar a veces chocaba, 08-calidad.md › Defectos 2).
    { puerto: 0 },
  )
  expect(receptor.error).toBeNull()
  puerto = receptor.puerto
  expect(puerto).toBeGreaterThan(0)
})

afterEach(async () => {
  await receptor.cerrar()
})

describe('quién le puede hablar', () => {
  test('la extensión, con su origen y el Host justo', async () => {
    const r = await pedir('/estado', {
      metodo: 'POST',
      cuerpo: JSON.stringify({ direccion: 'localhost:5173', version: '0.1.0' }),
    })
    expect(r.estado).toBe(200)
    expect(JSON.parse(r.cuerpo)).toEqual({ version: '0.1.0', proyecto: 'Alfa', proyectos: ['Alfa'] })
  })

  test('una página web (otro origen) o un pedido sin origen: 403 sin cuerpo', async () => {
    expect(await pedir('/estado', { origen: 'http://localhost:5173' })).toEqual({ estado: 403, cuerpo: '' })
    expect(await pedir('/estado', { origen: 'chrome-extension://otraextension' })).toEqual({
      estado: 403,
      cuerpo: '',
    })
    expect(await pedir('/estado', { origen: null })).toEqual({ estado: 403, cuerpo: '' })
    const post = await pedir('/comentarios', {
      metodo: 'POST',
      origen: 'https://malo.com',
      cuerpo: JSON.stringify(comentario),
    })
    expect(post.estado).toBe(403)
    expect(recibidos).toEqual([])
  })

  test('un nombre de dominio que apunta a la PC no pasa el Host', async () => {
    expect((await pedir('/estado', { host: `malo.com:${puerto}` })).estado).toBe(403)
    expect((await pedir('/estado', { host: `localhost:${puerto}` })).estado).toBe(403)
  })
})

describe('qué acepta', () => {
  test('un comentario con la forma conocida', async () => {
    const r = await pedir('/comentarios', { metodo: 'POST', cuerpo: JSON.stringify(comentario) })
    expect(r.estado).toBe(200)
    expect(JSON.parse(r.cuerpo)).toEqual({ tipo: 'guardado', codigo: 'R-1', proyecto: 'Alfa', envio: null })
    expect(recibidos).toHaveLength(1)
  })

  test('mal formado, sin texto o con una captura que no es PNG: 400 y no llega a los casos de uso', async () => {
    expect((await pedir('/comentarios', { metodo: 'POST', cuerpo: '{no es json' })).estado).toBe(400)
    expect(
      (
        await pedir('/comentarios', {
          metodo: 'POST',
          cuerpo: JSON.stringify({ ...comentario, texto: '  ' }),
        })
      ).estado,
    ).toBe(400)
    expect(
      (
        await pedir('/comentarios', {
          metodo: 'POST',
          cuerpo: JSON.stringify({ ...comentario, captura: 'data:text/html,<b>' }),
        })
      ).estado,
    ).toBe(400)
    expect(
      (
        await pedir('/comentarios', {
          metodo: 'POST',
          cuerpo: JSON.stringify({ ...comentario, id: '../../x' }),
        })
      ).estado,
    ).toBe(400)
    expect(recibidos).toEqual([])
  })

  test('más de 10 MB: 413', async () => {
    const grande = JSON.stringify({ ...comentario, texto: 'x'.repeat(11 * 1024 * 1024) })
    expect((await pedir('/comentarios', { metodo: 'POST', cuerpo: grande })).estado).toBe(413)
  })

  test('la consulta de estado es POST: un GET no está', async () => {
    expect((await pedir('/estado?direccion=localhost:5173')).estado).toBe(404)
  })

  test('recordar una dirección, y lo desconocido da 404', async () => {
    const r = await pedir('/direcciones', {
      metodo: 'POST',
      cuerpo: JSON.stringify({ direccion: 'localhost:5173', proyecto: 'Alfa' }),
    })
    expect(r.estado).toBe(204)
    expect(recibidos).toEqual([{ direccion: 'localhost:5173', proyecto: 'Alfa' }])
    expect((await pedir('/otra')).estado).toBe(404)
  })

  test('con el puerto ocupado no se cae: dice por qué', async () => {
    const otro = await arrancarReceptor(
      {
        estado: async () => ({ version: '', proyecto: null, proyectos: [] }),
        comentario: async () => ({ tipo: 'sin-proyecto', proyectos: [] }),
        direccion: async () => {},
      },
      { puerto },
    )
    expect(otro.error).toMatch(/ocupado/)
    await otro.cerrar()
  })
})
