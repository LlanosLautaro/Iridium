// Copiado de la app anterior de proyectos (D-026).
// Casos de uso con carpetas temporales falsas. Nunca sobre los proyectos reales (05-arquitectura.md).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { abrirProyecto, type Entorno, listarProyectos } from '../../src/main/app/casos'

let raiz: string

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'gestor-'))
  await mkdir(join(raiz, 'Alfa'))
  await mkdir(join(raiz, 'beta'))
  await mkdir(join(raiz, '.oculta'))
  await writeFile(join(raiz, 'suelto.txt'), 'no es un proyecto')
})

afterEach(async () => {
  await rm(raiz, { recursive: true, force: true })
})

function entorno(extra: Partial<Entorno> = {}): Entorno {
  return { raiz, rutaAbierta: undefined, abrirCarpeta: vi.fn(async () => {}), ...extra }
}

describe('listarProyectos', () => {
  it('lista solo las carpetas hijas, sin las ocultas ni los archivos sueltos', async () => {
    const vista = await listarProyectos(entorno({ rutaAbierta: join(raiz, 'beta') }))
    expect(vista.tipo).toBe('lista')
    if (vista.tipo !== 'lista') return
    const proyectos = vista.secciones.flatMap((s) => s.proyectos)
    expect(proyectos.map((p) => p.nombre)).toEqual(['Alfa', 'beta'])
    expect(proyectos.find((p) => p.nombre === 'beta')?.activo).toBe(true)
  })

  it('una carpeta nueva aparece al volver a listar', async () => {
    await mkdir(join(raiz, 'Gamma'))
    const vista = await listarProyectos(entorno())
    expect(vista.tipo === 'lista' && vista.total).toBe(3)
  })

  it('lee el .proyecto.json de cada carpeta y descarta el ícono que no existe', async () => {
    await writeFile(
      join(raiz, 'Alfa', '.proyecto.json'),
      JSON.stringify({ version: 1, estado: 'idea', descripcion: 'Una idea', icono: 'no-esta.png' }),
    )
    await writeFile(join(raiz, 'beta', 'icono.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>')
    await writeFile(
      join(raiz, 'beta', '.proyecto.json'),
      JSON.stringify({ version: 1, estado: 'en-uso', icono: 'icono.svg' }),
    )
    const vista = await listarProyectos(entorno())
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    const alfa = vista.secciones.find((s) => s.id === 'idea')?.proyectos[0]
    const beta = vista.secciones.find((s) => s.id === 'en-uso')?.proyectos[0]
    expect(alfa).toMatchObject({ nombre: 'Alfa', descripcion: 'Una idea', icono: null })
    expect(beta?.icono).toBe(`${join(raiz, 'beta')}/icono.svg`)
  })

  it('un .proyecto.json dañado no frena a los demás proyectos', async () => {
    await writeFile(join(raiz, 'Alfa', '.proyecto.json'), '{ roto')
    const vista = await listarProyectos(entorno())
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    const sin = vista.secciones.find((s) => s.id === 'sin-clasificar')?.proyectos ?? []
    expect(sin.map((p) => [p.nombre, p.problema])).toEqual([
      ['Alfa', 'no es un JSON válido'],
      ['beta', null],
    ])
  })

  it('si la raíz no existe devuelve la vista de error, sin lanzar', async () => {
    const vista = await listarProyectos(entorno({ raiz: join(raiz, 'no-existe') }))
    expect(vista.tipo).toBe('error')
  })
})

describe('abrirProyecto', () => {
  it('abre la carpeta pedida', async () => {
    const e = entorno()
    expect(await abrirProyecto(e, join(raiz, 'Alfa'))).toEqual({ ok: true })
    expect(e.abrirCarpeta).toHaveBeenCalledWith(join(raiz, 'Alfa'))
  })

  it('no reabre el proyecto activo', async () => {
    const e = entorno({ rutaAbierta: join(raiz, 'Alfa') })
    const r = await abrirProyecto(e, join(raiz, 'alfa'))
    expect(r.ok).toBe(false)
    expect(e.abrirCarpeta).not.toHaveBeenCalled()
  })

  it('si la carpeta ya no existe avisa y no intenta abrirla', async () => {
    const e = entorno()
    await rm(join(raiz, 'beta'), { recursive: true })
    const r = await abrirProyecto(e, join(raiz, 'beta'))
    expect(r.ok).toBe(false)
    expect(e.abrirCarpeta).not.toHaveBeenCalled()
  })
})
