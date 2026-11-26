// Copiado de la app anterior de proyectos (D-026).
// Casos límite del hito 8 (08-calidad.md): nombres raros, archivos rotos o enormes, enlaces y raíces extrañas.
// Siempre con carpetas temporales; nunca sobre los proyectos reales.
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ListaProyectos } from '../../src/compartido/puente'
import { crearProyecto } from '../../src/main/app/creacion'
import { cambiarEstadoProyecto } from '../../src/main/app/edicion'
import { ejecutarEliminacion, prepararEliminacion } from '../../src/main/app/eliminacion'
import { listarProyectos } from '../../src/main/app/proyectos'
import { leerGuia } from '../../src/main/core/guia'
import { leerMetadatos } from '../../src/main/core/metadatos'
import { borrarDefinitivamente } from '../../src/main/infra/eliminacion'

let base: string
let raiz: string

const proyectos = (v: ListaProyectos) => (v.tipo === 'lista' ? v.proyectos : [])

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'gestor-limite-'))
  raiz = join(base, 'PROYECTOS')
  await mkdir(raiz)
})
afterEach(async () => {
  await rm(base, { recursive: true, force: true })
})

describe('nombres de carpeta', () => {
  const nombres = [
    'Ñandú con tildes áéíóú',
    'emoji 🚀 cohete',
    "símbolos #%&()[]{}'+,;=@!$^~`",
    'espacios   múltiples',
    'x'.repeat(200),
    '中文 日本語',
  ]

  it('lista, clasifica y guarda proyectos con nombres raros', async () => {
    for (const n of nombres) await mkdir(join(raiz, n))
    const v = await listarProyectos(raiz)
    expect(
      proyectos(v)
        .map((p) => p.nombre)
        .sort(),
    ).toEqual([...nombres].sort())
    for (const n of nombres)
      expect(await cambiarEstadoProyecto(raiz, join(raiz, n), 'idea')).toEqual({ ok: true })
    const v2 = await listarProyectos(raiz)
    expect(proyectos(v2).every((p) => p.estado === 'idea')).toBe(true)
  })

  it('crea un proyecto nuevo con acentos y emoji', async () => {
    expect(await crearProyecto(raiz, '  Ñoño 🚀  ')).toMatchObject({ ok: true, nombre: 'Ñoño 🚀' })
    expect(await readdir(raiz)).toEqual(['Ñoño 🚀'])
  })
})

describe('.proyecto.json roto o extraño', () => {
  const casos: [string, string][] = [
    ['vacío', ''],
    ['solo espacios', '   \n'],
    ['null', 'null'],
    ['lista', '[]'],
    ['número', '42'],
    ['cortado a la mitad', '{"version":1,"estado":"id'],
    ['estado desconocido', '{"version":1,"estado":"terminado"}'],
    ['versión como texto', '{"version":"1","estado":"idea"}'],
    ['versión futura', '{"version":99,"estado":"idea"}'],
    ['etiquetas como texto', '{"version":1,"estado":"idea","etiquetas":"a,b"}'],
    ['binario', '\u0000\u0001\u0002PNG'],
  ]
  for (const [nombre, texto] of casos) {
    it(`${nombre}: cuenta como dañado, sin lanzar`, () => {
      expect(leerMetadatos(texto).tipo).toBe('danado')
    })
  }

  it('una descripción enorme (1 MB) se lee igual', () => {
    const enorme = 'a'.repeat(1_000_000)
    expect(leerMetadatos(JSON.stringify({ version: 1, estado: 'idea', descripcion: enorme })).tipo).toBe('ok')
  })

  it('un .proyecto.json que es una carpeta no rompe la lista', async () => {
    await mkdir(join(raiz, 'Alfa', '.proyecto.json'), { recursive: true })
    await mkdir(join(raiz, 'Beta'))
    const v = await listarProyectos(raiz)
    expect(proyectos(v)).toHaveLength(2)
    expect(proyectos(v).find((p) => p.nombre === 'Alfa')?.problema).toBe('no se pudo leer el archivo')
  })

  it('listar no reescribe un archivo dañado', async () => {
    await mkdir(join(raiz, 'Alfa'))
    await writeFile(join(raiz, 'Alfa', '.proyecto.json'), '{roto')
    await listarProyectos(raiz)
    expect(await readFile(join(raiz, 'Alfa', '.proyecto.json'), 'utf8')).toBe('{roto')
  })
})

describe('docs/estado.md raro', () => {
  it('vacío, binario o enorme no lanza', () => {
    expect(leerGuia('')).toBeNull()
    expect(() => leerGuia('\u0000\u0001\u0002')).not.toThrow()
    const enorme = `## Hito actual\n3 — Investigación\n${'texto '.repeat(500_000)}`
    const inicio = performance.now()
    expect(() => leerGuia(enorme)).not.toThrow()
    expect(performance.now() - inicio).toBeLessThan(1000)
  })
})

describe('enlaces y junctions de Windows', () => {
  it('borrar un node_modules con un enlace adentro no borra el destino del enlace', async () => {
    const afuera = join(base, 'afuera')
    await mkdir(afuera)
    await writeFile(join(afuera, 'importante.txt'), 'no tocar')
    const nm = join(raiz, 'Alfa', 'node_modules')
    await mkdir(nm, { recursive: true })
    await symlink(afuera, join(nm, 'enlace'), 'junction')
    await borrarDefinitivamente(nm)
    expect(await readFile(join(afuera, 'importante.txt'), 'utf8')).toBe('no tocar')
  })

  it('eliminar un proyecto con un enlace hacia afuera no manda el destino a la papelera', async () => {
    const afuera = join(base, 'afuera')
    await mkdir(afuera)
    await writeFile(join(afuera, 'importante.txt'), 'no tocar')
    const p = join(raiz, 'Alfa')
    await mkdir(p)
    await writeFile(join(p, 'package.json'), '{}')
    await mkdir(join(p, 'node_modules'))
    await symlink(afuera, join(p, 'node_modules', 'enlace'), 'junction')
    await symlink(afuera, join(p, 'enlace-suelto'), 'junction')

    const plan = await prepararEliminacion(raiz, p, undefined)
    if (!plan.ok) throw new Error(plan.mensaje)
    expect(plan.plan.regenerables.map((r) => r.relativa)).toEqual(['node_modules'])

    const recibidos: string[] = []
    const r = await ejecutarEliminacion(raiz, p, plan.plan, undefined, async (ruta) => {
      recibidos.push(ruta)
      await rm(ruta, { recursive: true, force: true })
    })
    expect(r).toEqual({ ok: true })
    expect(recibidos).toEqual([p])
    expect(await readFile(join(afuera, 'importante.txt'), 'utf8')).toBe('no tocar')
  })
})

describe('raíces extrañas', () => {
  it('una raíz que es un archivo muestra el error, sin lanzar', async () => {
    const archivo = join(base, 'no-es-carpeta.txt')
    await writeFile(archivo, 'x')
    expect(await listarProyectos(archivo)).toMatchObject({ tipo: 'error' })
  })

  it('una raíz vacía da una lista sin proyectos', async () => {
    const v = await listarProyectos(raiz)
    expect(v.tipo).toBe('lista')
    expect(proyectos(v)).toHaveLength(0)
  })

  it('una raíz con barra final o barras invertidas funciona igual', async () => {
    await mkdir(join(raiz, 'Alfa'))
    const v = await listarProyectos(`${raiz.replace(/\//g, '\\')}\\`)
    expect(proyectos(v).map((p) => p.nombre)).toEqual(['Alfa'])
  })
})

describe('volumen', () => {
  it('lista 300 proyectos con datos en menos de 2 segundos', { timeout: 30_000 }, async () => {
    for (let i = 0; i < 300; i++) {
      const p = join(raiz, `Proyecto ${i}`)
      await mkdir(join(p, 'docs'), { recursive: true })
      await writeFile(join(p, '.proyecto.json'), JSON.stringify({ version: 1, estado: 'en-uso' }))
      await writeFile(join(p, 'docs', 'estado.md'), '## Hito actual\n7 — Construcción — en curso\n')
    }
    // La mejor de tres: con todas las pruebas en paralelo, una sola lectura mide la competencia por el disco
    // más que a Iridium (hito 8, Defecto 12).
    let ms = Number.POSITIVE_INFINITY
    for (let i = 0; i < 3; i++) {
      const inicio = performance.now()
      const v = await listarProyectos(raiz)
      ms = Math.min(ms, performance.now() - inicio)
      expect(proyectos(v)).toHaveLength(300)
    }
    expect(ms).toBeLessThan(2000)
  })
})
