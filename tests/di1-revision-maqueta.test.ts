// DI-I1: F8 sobre una maqueta (`modulos/diseno/diseno-tecnico.md` › F8 sobre una maqueta). El comentario va al
// proyecto de la maqueta aunque la app que la muestra (Iridium) sea otro proyecto, dice qué maqueta es, y el mensaje a
// la IA pide corregirla ahí. La tarjeta de la extensión dice ese proyecto si la maqueta tiene el foco.
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { armarMensaje, leerMensaje } from '../src/compartido/mensaje-revision'
import type { PedidoComentario } from '../src/compartido/revision'
import { Revision } from '../src/main/app/revision/recibir'
import { armarComentario, leerComentario } from '../src/main/core/revision/comentario'
import { proyectoDeMaqueta } from '../src/main/core/revision/proyecto'
import { ArchivoRevision } from '../src/main/infra/revision/datos'

let raiz: string
let datos: string
let enFoco: string | null

const proyectos = () => ['Iridium', 'Alfa'].map((n) => ({ nombre: n, ruta: join(raiz, n) }))
const maqueta = () => pathToFileURL(join(raiz, 'Alfa', 'docs', 'diseno', 'pantallas', 'lista.html')).href

function revision(): Revision {
  return new Revision({
    proyectos: async () => proyectos(),
    datos: new ArchivoRevision(join(datos, 'revision.json')),
    lineasDelPuerto: async () => [],
    ahora: () => new Date(2026, 10, 8, 10, 0),
    maquetaEnFoco: () => enFoco,
  })
}

function pedido(cambios: Partial<PedidoComentario> = {}): PedidoComentario {
  return {
    id: `id-${Math.random().toString(36).slice(2, 12)}`,
    url: maqueta(),
    texto: 'el botón de abrir queda muy chico',
    elemento: {
      etiqueta: 'a',
      texto: 'Abrir la primera',
      selector: '#abrir',
      rect: { x: 0, y: 0, w: 10, h: 10 },
    },
    componentes: [],
    pila: null,
    ventana: { ancho: 1440, alto: 900 },
    captura: null,
    creado: '2026-11-08T13:00:00.000Z',
    enviar: false,
    // El ayudante de Iridium dice su carpeta: sin el paso de la maqueta, el comentario iría a Iridium.
    carpeta: join(raiz, 'Iridium'),
    ...cambios,
  }
}

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-di1-rev-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-di1-rev-datos-'))
  enFoco = null
  await mkdir(join(raiz, 'Iridium'), { recursive: true })
  await mkdir(join(raiz, 'Alfa', 'docs', 'diseno', 'pantallas'), { recursive: true })
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true })
  await rm(datos, { recursive: true, force: true })
})

describe('es una maqueta', () => {
  test('una página file:// de docs/diseno/ es del proyecto que la tiene', () => {
    expect(proyectoDeMaqueta(maqueta(), proyectos())).toEqual({
      proyecto: { nombre: 'Alfa', ruta: join(raiz, 'Alfa') },
      maqueta: 'docs/diseno/pantallas/lista.html',
    })
    expect(
      proyectoDeMaqueta(pathToFileURL(join(raiz, 'Alfa', 'docs', 'estado.md')).href, proyectos()),
    ).toBeNull()
    expect(proyectoDeMaqueta('http://localhost:5173/', proyectos())).toBeNull()
  })

  test('el comentario va al proyecto de la maqueta, con el campo Maqueta, aunque lo diga la carpeta de Iridium', async () => {
    const r = await revision().comentario(pedido({ proyecto: 'Iridium' }))
    expect(r).toMatchObject({ tipo: 'guardado', codigo: 'R-1', proyecto: 'Alfa' })
    const texto = await readFile(join(raiz, 'Alfa', 'docs', 'revision', 'R-1.md'), 'utf8')
    expect(texto).toContain('**Maqueta:** `docs/diseno/pantallas/lista.html`')
    expect(texto).not.toContain('**Dónde:**')
    expect(leerComentario('R-1.md', texto)?.maqueta).toBe('docs/diseno/pantallas/lista.html')
    // No se recordó la carpeta de Iridium como si fuera de Alfa.
    expect((await new ArchivoRevision(join(datos, 'revision.json')).leer()).carpetas).toEqual({})
  })

  test('la tarjeta dice el proyecto de la maqueta con el foco; sin maqueta, el de la app', async () => {
    enFoco = maqueta()
    expect((await revision().estado('', '0.2.0', join(raiz, 'Iridium'))).proyecto).toBe('Alfa')
    enFoco = null
    expect((await revision().estado('', '0.2.0', join(raiz, 'Iridium'))).proyecto).toBe('Iridium')
  })

  test('el mensaje a la IA dice la maqueta y que se corrige ahí', () => {
    const m = armarMensaje({
      codigo: 'R-1',
      texto: 'más grande',
      archivo: null,
      pagina: maqueta(),
      captura: 'R-1.png',
      maqueta: 'docs/diseno/pantallas/lista.html',
    })
    expect(m).toContain('Dónde: la maqueta docs/diseno/pantallas/lista.html (corregila ahí, no en el código)')
    expect(leerMensaje(m)).toEqual({ codigo: 'R-1', texto: 'más grande', archivo: null })
  })

  test('un R-n sin maqueta no la tiene', () => {
    const t = armarComentario({
      numero: 2,
      id: 'id-12345678',
      texto: 'algo',
      archivo: null,
      componentes: [],
      url: 'http://localhost:5173/',
      elemento: { etiqueta: 'div', texto: '', selector: 'div' },
      conCaptura: false,
      fecha: new Date(2026, 10, 8),
    })
    expect(leerComentario('R-2.md', t)?.maqueta).toBeNull()
  })
})
