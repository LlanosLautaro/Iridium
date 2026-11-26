// Copiado de la app anterior de proyectos (D-026).
// Nuevo proyecto (D-020): reglas del nombre y creación con carpetas temporales. Nunca sobre los proyectos reales.
import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { crearProyecto } from '../../src/main/app/creacion'
import { listarProyectos } from '../../src/main/app/proyectos'
import { problemaNombreProyecto } from '../../src/main/core/creacion'

describe('problemaNombreProyecto', () => {
  it('acepta nombres comunes, con espacios, acentos y guiones', () => {
    for (const n of ['Mi app', 'Ñandú 2', 'bot-discord', 'v1.2 final', '  con espacios afuera  ']) {
      expect(problemaNombreProyecto(n, [])).toBeNull()
    }
  })

  it('rechaza el nombre vacío', () => {
    expect(problemaNombreProyecto('   ', [])).toBe('Escribe un nombre.')
  })

  it('rechaza los caracteres que Windows no permite', () => {
    for (const n of ['a/b', 'a\\b', 'a:b', 'a*b', 'a?b', 'a"b', 'a<b', 'a>b', 'a|b']) {
      expect(problemaNombreProyecto(n, [])).toMatch(/caracteres/)
    }
  })

  it('rechaza los nombres que empiezan o terminan en punto', () => {
    expect(problemaNombreProyecto('.oculto', [])).toMatch(/empezar con punto/)
    expect(problemaNombreProyecto('final.', [])).toMatch(/terminar en punto/)
  })

  it('rechaza los nombres reservados de Windows', () => {
    for (const n of ['CON', 'nul', 'com1', 'LPT9', 'aux.txt']) {
      expect(problemaNombreProyecto(n, [])).toBe('Windows reserva ese nombre.')
    }
    expect(problemaNombreProyecto('Consola', [])).toBeNull()
  })

  it('rechaza un nombre que ya existe, sin distinguir mayúsculas', () => {
    expect(problemaNombreProyecto('ALFA', ['Alfa', 'Beta'])).toBe('Ya hay una carpeta con ese nombre.')
  })

  it('rechaza los nombres demasiado largos', () => {
    expect(problemaNombreProyecto('x'.repeat(81), [])).toMatch(/80/)
    expect(problemaNombreProyecto('x'.repeat(80), [])).toBeNull()
  })
})

describe('crearProyecto', () => {
  let raiz: string

  beforeEach(async () => {
    raiz = await mkdtemp(join(tmpdir(), 'gestor-'))
    await mkdir(join(raiz, 'Alfa'))
    await writeFile(join(raiz, 'notas.txt'), 'archivo suelto')
  })

  afterEach(async () => {
    await rm(raiz, { recursive: true, force: true })
  })

  it('crea una carpeta vacía con el nombre sin espacios afuera, y aparece en Sin clasificar', async () => {
    const r = await crearProyecto(raiz, '  Mi idea  ')
    expect(r).toEqual({ ok: true, ruta: join(raiz, 'Mi idea'), nombre: 'Mi idea' })
    expect((await stat(join(raiz, 'Mi idea'))).isDirectory()).toBe(true)
    expect(await readdir(join(raiz, 'Mi idea'))).toEqual([])
    const lista = await listarProyectos(raiz)
    if (lista.tipo !== 'lista') throw new Error('se esperaba la lista')
    expect(lista.proyectos.find((p) => p.nombre === 'Mi idea')?.estado).toBeNull()
  })

  it('no pisa una carpeta ni un archivo que ya existen', async () => {
    expect(await crearProyecto(raiz, 'alfa')).toEqual({
      ok: false,
      mensaje: 'Ya hay una carpeta con ese nombre.',
    })
    expect(await crearProyecto(raiz, 'NOTAS.TXT')).toMatchObject({ ok: false })
    expect((await readdir(raiz)).sort()).toEqual(['Alfa', 'notas.txt'])
  })

  it('no crea nada con un nombre inválido', async () => {
    expect(await crearProyecto(raiz, '../afuera')).toMatchObject({ ok: false })
    expect(await crearProyecto(raiz, 'a/b')).toMatchObject({ ok: false })
    expect((await readdir(raiz)).sort()).toEqual(['Alfa', 'notas.txt'])
  })

  it('avisa si la raíz no existe', async () => {
    const r = await crearProyecto(join(raiz, 'no-existe'), 'Nuevo')
    expect(r).toMatchObject({
      ok: false,
      mensaje: expect.stringContaining('No se pudo leer la carpeta raíz'),
    })
  })
})
