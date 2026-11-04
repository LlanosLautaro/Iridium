// Casos de uso de la Revisión con carpetas temporales (diseno-tecnico.md › Pruebas): resolver el proyecto, el archivo y
// la línea, numerar, no duplicar, y guardar con lo que haya.
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import type { PedidoComentario } from '../src/compartido/revision'
import { VERSION_EXTENSION } from '../src/compartido/revision'
import { Revision } from '../src/main/app/revision/recibir'
import { ArchivoRevision } from '../src/main/infra/revision/datos'

let raiz: string
let datos: string
let lineasPuerto: string[]
let consultasPuerto: number
let bajados: string[]

// Un PNG de 1 × 1.
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

/** Codifica un número en VLQ base64, como los mapas de fuentes. */
function vlq(n: number): string {
  const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let v = n < 0 ? (-n << 1) | 1 : n << 1
  let s = ''
  do {
    let d = v & 31
    v >>>= 5
    if (v > 0) d |= 32
    s += b64[d]
  } while (v > 0)
  return s
}

/** El módulo que sirve Vite: la línea 9, columna 21 viene de `Tarjeta.jsx`, línea 6, columna 6 (S-3). */
function moduloConMapa(fuente: string): string {
  const mapa = {
    version: 3,
    sources: [fuente],
    names: [],
    mappings: `${';'.repeat(8)}${vlq(20)}${vlq(0)}${vlq(5)}${vlq(6)}`,
  }
  return `// transformado\n${'\n'.repeat(8)}\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(mapa)).toString('base64')}\n`
}

const PILA =
  'Error\n    at jsxDEV (http://localhost:5199/node_modules/.vite/deps/react.js:1:1)\n    at Tarjeta (http://localhost:5199/src/Tarjeta.jsx:9:21)'

function pedido(cambios: Partial<PedidoComentario> = {}): PedidoComentario {
  return {
    id: `id-${Math.random().toString(36).slice(2, 12)}`,
    url: 'http://localhost:5199/ajustes',
    texto: 'el botón queda muy pegado al título',
    elemento: {
      etiqueta: 'button',
      texto: 'Guardar',
      selector: 'main > button',
      rect: { x: 0, y: 0, w: 10, h: 10 },
    },
    componentes: ['Tarjeta', 'App'],
    pila: PILA,
    ventana: { ancho: 800, alto: 600 },
    captura: `data:image/png;base64,${PNG}`,
    creado: '2026-10-28T17:32:00.000Z',
    enviar: false,
    ...cambios,
  }
}

function revision(proyectos = ['Alfa', 'Beta']): Revision {
  return new Revision({
    proyectos: async () => proyectos.map((n) => ({ nombre: n, ruta: join(raiz, n) })),
    datos: new ArchivoRevision(join(datos, 'revision.json')),
    lineasDelPuerto: async () => {
      consultasPuerto++
      return lineasPuerto
    },
    bajar: async (url) => {
      bajados.push(url)
      return moduloConMapa('Tarjeta.jsx')
    },
    ahora: () => new Date(2026, 9, 28, 15, 0),
  })
}

async function escribir(ruta: string, texto: string) {
  await mkdir(join(raiz, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, ruta), texto)
}

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-revision-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-revision-datos-'))
  lineasPuerto = []
  consultasPuerto = 0
  bajados = []
  await escribir('Alfa/src/Tarjeta.jsx', 'export function Tarjeta() {}\n')
  await escribir('Beta/src/otro.ts', '')
})

afterEach(async () => {
  await rm(raiz, { recursive: true, force: true })
  await rm(datos, { recursive: true, force: true })
})

describe('guardar un comentario', () => {
  test('por el código: el archivo está solo en Alfa; queda R-1 con archivo, línea, captura y la dirección recordada', async () => {
    const r = revision()
    expect(await r.comentario(pedido())).toEqual({
      tipo: 'guardado',
      codigo: 'R-1',
      proyecto: 'Alfa',
      envio: null,
    })
    const md = await readFile(join(raiz, 'Alfa/docs/revision/R-1.md'), 'utf8')
    expect(md).toContain('**Dónde:** `src/Tarjeta.jsx`, línea 6')
    expect(md).toContain('**Captura:** ![R-1](R-1.png)')
    expect((await readFile(join(raiz, 'Alfa/docs/revision/R-1.png'))).subarray(1, 4).toString()).toBe('PNG')
    expect(bajados).toEqual(['http://localhost:5199/src/Tarjeta.jsx'])
    // Windows se consultó una vez (el proceso va antes que el código); la próxima, `/estado` ya lo sabe.
    expect(consultasPuerto).toBe(1)
    expect((await r.estado('localhost:5199', '0.1.0')).proyecto).toBe('Alfa')
    expect(consultasPuerto).toBe(1)
  })

  test('numera seguido y dos que llegan juntos no se pisan', async () => {
    const r = revision()
    const [a, b, c] = await Promise.all([
      r.comentario(pedido()),
      r.comentario(pedido()),
      r.comentario(pedido()),
    ])
    const codigos = [a, b, c].map((x) => (x.tipo === 'guardado' ? x.codigo : '')).sort()
    expect(codigos).toEqual(['R-1', 'R-2', 'R-3'])
    expect((await readdir(join(raiz, 'Alfa/docs/revision'))).filter((n) => n.endsWith('.md'))).toHaveLength(3)
  })

  test('el mismo comentario dos veces (la cola reintentó) no se duplica', async () => {
    const r = revision()
    const p = pedido()
    await r.comentario(p)
    expect(await r.comentario(p)).toEqual({ tipo: 'guardado', codigo: 'R-1', proyecto: 'Alfa', envio: null })
    expect(await readdir(join(raiz, 'Alfa/docs/revision'))).toEqual(['R-1.md', 'R-1.png'])
  })

  test('sin React, sin captura: se guarda igual con las pistas que hay', async () => {
    const r = revision()
    await r.direccion({ direccion: 'localhost:5199', proyecto: 'Beta' })
    expect(await r.comentario(pedido({ pila: null, captura: null, componentes: [] }))).toMatchObject({
      tipo: 'guardado',
      proyecto: 'Beta',
    })
    const md = await readFile(join(raiz, 'Beta/docs/revision/R-1.md'), 'utf8')
    expect(md).not.toContain('**Dónde:**')
    expect(md).not.toContain('**Captura:**')
    expect(md).toContain('**Elemento:** `button` · texto «Guardar»')
  })

  test('si nada dice el proyecto, devuelve la lista para preguntar; con el elegido, guarda y lo recuerda', async () => {
    await rm(join(raiz, 'Alfa/src'), { recursive: true })
    const r = revision()
    expect(await r.comentario(pedido())).toEqual({ tipo: 'sin-proyecto', proyectos: ['Alfa', 'Beta'] })
    expect(await r.comentario(pedido({ proyecto: 'Beta' }))).toMatchObject({
      tipo: 'guardado',
      proyecto: 'Beta',
    })
    expect((await r.estado('localhost:5199', null)).proyecto).toBe('Beta')
  })

  test('en Electron lo dice la carpeta de la app, sin preguntarle a Windows y sin recordar la dirección', async () => {
    // El código está en los dos: sin la carpeta, no se sabría.
    await escribir('Beta/src/Tarjeta.jsx', '')
    const r = revision()
    const carpeta = join(raiz, 'Beta')
    expect((await r.estado('localhost:5199', '0.1.0', carpeta)).proyecto).toBe('Beta')
    expect(await r.comentario(pedido({ carpeta }))).toMatchObject({ tipo: 'guardado', proyecto: 'Beta' })
    const md = await readFile(join(raiz, 'Beta/docs/revision/R-1.md'), 'utf8')
    expect(md).toContain('**Dónde:** `src/Tarjeta.jsx`, línea 6')
    expect(consultasPuerto).toBe(0)
    // Otra app (Electron o del navegador) en el mismo puerto no queda atada a Beta.
    expect((await r.estado('localhost:5199', '0.1.0', join(raiz, 'Alfa'))).proyecto).toBe('Alfa')
    expect((await new ArchivoRevision(join(datos, 'revision.json')).leer()).direcciones).toEqual({})
  })

  test('una app instalada fuera de los proyectos: pregunta una vez y recuerda la carpeta', async () => {
    const r = revision()
    const instalada = join(datos, 'Programs', 'Alfa', 'resources', 'app.asar')
    // Versión armada: sin pila de React ni dirección.
    const armada = {
      carpeta: instalada,
      pila: null,
      componentes: [],
      url: 'file:///C:/Programs/Alfa/index.html',
    }
    expect((await r.estado('', '0.1.0', instalada)).proyecto).toBeNull()
    expect(await r.comentario(pedido(armada))).toMatchObject({ tipo: 'sin-proyecto' })
    expect(await r.comentario(pedido({ ...armada, proyecto: 'Beta' }))).toMatchObject({
      tipo: 'guardado',
      proyecto: 'Beta',
    })
    expect((await r.estado('', '0.1.0', `${instalada.toUpperCase()}\\`)).proyecto).toBe('Beta')
    // Elegirlo desde la tarjeta también lo recuerda.
    await r.direccion({ direccion: '', proyecto: 'Alfa', carpeta: instalada })
    expect((await r.estado('', '0.1.0', instalada)).proyecto).toBe('Alfa')
    const md = await readFile(join(raiz, 'Beta/docs/revision/R-1.md'), 'utf8')
    expect(md).not.toContain('**Dónde:**')
    expect(md).toContain('**Captura:**')
  })

  test('el archivo más adentro (raíz de la app en src/renderer) se encuentra por el final de la ruta', async () => {
    await rm(join(raiz, 'Alfa/src'), { recursive: true })
    await escribir('Alfa/src/renderer/src/Tarjeta.jsx', '')
    await escribir('Alfa/node_modules/x/src/Tarjeta.jsx', '')
    const r = revision()
    await r.direccion({ direccion: 'localhost:5199', proyecto: 'Alfa' })
    await r.comentario(pedido())
    expect(await readFile(join(raiz, 'Alfa/docs/revision/R-1.md'), 'utf8')).toContain(
      '`src/renderer/src/Tarjeta.jsx`, línea 6',
    )
  })

  test('una pila que apunta afuera de la PC no se baja', async () => {
    const r = revision()
    await r.direccion({ direccion: 'localhost:5199', proyecto: 'Alfa' })
    await r.comentario(pedido({ pila: 'at X (https://cdn.ejemplo.com/src/Tarjeta.jsx:9:21)' }))
    expect(bajados).toEqual([])
  })
})

describe('de qué proyecto es una dirección', () => {
  test('por el proceso que atiende el puerto; se recuerda y no se vuelve a preguntar a Windows', async () => {
    lineasPuerto = [`node "${join(raiz, 'Beta')}\\node_modules\\vite\\bin\\vite.js"`]
    const r = revision()
    expect(await r.estado('localhost:5173', '0.1.0')).toEqual({
      version: VERSION_EXTENSION,
      proyecto: 'Beta',
      proyectos: ['Alfa', 'Beta'],
    })
    await r.estado('127.0.0.1:5173', '0.1.0')
    expect(consultasPuerto).toBe(1)
    const guardado = JSON.parse(await readFile(join(datos, 'revision.json'), 'utf8'))
    expect(guardado.direcciones['localhost:5173'].ruta).toBe(join(raiz, 'Beta'))
    expect(guardado.extension.version).toBe('0.1.0')
  })

  test('si Windows tarda, /estado responde sin proyecto y lo que encuentra queda para la próxima', async () => {
    lineasPuerto = [`node "${join(raiz, 'Alfa')}\node_modules\vite\bin\vite.js"`]
    const lenta = new Revision({
      proyectos: async () => ['Alfa', 'Beta'].map((n) => ({ nombre: n, ruta: join(raiz, n) })),
      datos: new ArchivoRevision(join(datos, 'revision.json')),
      lineasDelPuerto: () => new Promise((r) => setTimeout(() => r(lineasPuerto), 200)),
      esperaEstadoMs: 20,
    })
    expect((await lenta.estado('localhost:5173', null)).proyecto).toBeNull()
    await new Promise((r) => setTimeout(r, 300))
    expect((await lenta.estado('localhost:5173', null)).proyecto).toBe('Alfa')
  })

  test('sin respuesta del proceso: null, y no le pregunta a Windows en cada consulta', async () => {
    const r = revision()
    expect((await r.estado('localhost:5173', null)).proyecto).toBeNull()
    await r.estado('localhost:5173', null)
    expect(consultasPuerto).toBe(1)
  })

  test('una dirección recordada de un proyecto que ya no está se vuelve a resolver', async () => {
    const r = revision()
    await r.direccion({ direccion: 'localhost:5173', proyecto: 'Alfa' })
    expect((await revision(['Beta']).estado('localhost:5173', null)).proyecto).toBeNull()
  })
})
