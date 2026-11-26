// Copiado de la app anterior de proyectos (D-026).
// El menú de la tarjeta con carpetas temporales falsas. Nunca sobre los proyectos reales (05-arquitectura.md).
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  archivarProyecto,
  cambiarEstadoProyecto,
  cambiarIconoProyecto,
  iconoRelativo,
} from '../../src/main/app/edicion'

let raiz: string
/** Una ficha ya escrita, como la deja la IA. */
const conFicha = (p: string) =>
  writeFile(
    join(raiz, p, '.proyecto.json'),
    JSON.stringify({ version: 1, descripcion: 'Una app.', estado: 'en-desarrollo', etiquetas: ['ts'] }),
  )
const leer = async (p: string) => JSON.parse(await readFile(join(raiz, p, '.proyecto.json'), 'utf8'))

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'gestor-edicion-'))
  await mkdir(join(raiz, 'Alfa'))
  await mkdir(join(raiz, 'Beta'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true })
})

describe('cambiarEstadoProyecto', () => {
  it('cambia solo el estado', async () => {
    await conFicha('Alfa')
    expect(await cambiarEstadoProyecto(raiz, join(raiz, 'Alfa'), 'en-uso')).toEqual({ ok: true })
    expect(await leer('Alfa')).toMatchObject({ estado: 'en-uso', descripcion: 'Una app.', etiquetas: ['ts'] })
  })

  it('un proyecto sin clasificar estrena la ficha con ese estado (R-7)', async () => {
    expect(await cambiarEstadoProyecto(raiz, join(raiz, 'Alfa'), 'en-uso')).toEqual({ ok: true })
    expect(await leer('Alfa')).toMatchObject({
      version: 1,
      estado: 'en-uso',
      descripcion: '',
      archivado: false,
    })
  })

  it('no escribe fuera de la carpeta de proyectos', async () => {
    const r = await cambiarEstadoProyecto(raiz, join(tmpdir(), 'Alfa'), 'en-uso')
    expect(r.ok).toBe(false)
  })
})

describe('cambiarIconoProyecto (R-7)', () => {
  it('guarda la imagen elegida como ruta relativa', async () => {
    await conFicha('Alfa')
    const r = await cambiarIconoProyecto(raiz, join(raiz, 'Alfa'), join(raiz, 'Alfa', 'img', 'logo.svg'))
    expect(r).toEqual({ ok: true })
    expect(await leer('Alfa')).toMatchObject({ icono: 'img/logo.svg', descripcion: 'Una app.' })
  })

  it('rechaza una imagen de otra carpeta o un proyecto sin ficha', async () => {
    await conFicha('Alfa')
    expect((await cambiarIconoProyecto(raiz, join(raiz, 'Alfa'), join(raiz, 'Beta', 'logo.svg'))).ok).toBe(
      false,
    )
    expect((await cambiarIconoProyecto(raiz, join(raiz, 'Beta'), join(raiz, 'Beta', 'logo.svg'))).ok).toBe(
      false,
    )
  })
})

describe('iconoRelativo', () => {
  it('acepta imágenes dentro del proyecto, sin distinguir mayúsculas en la ruta', () => {
    expect(iconoRelativo('D:\\PROYECTOS\\Alfa', 'd:\\proyectos\\alfa\\docs\\icono.png')).toBe(
      'docs/icono.png',
    )
  })
  it('rechaza imágenes de otra carpeta, aunque el nombre empiece igual', () => {
    expect(iconoRelativo('D:\\PROYECTOS\\Alfa', 'D:\\PROYECTOS\\Alfa2\\icono.png')).toBeNull()
    expect(iconoRelativo('D:\\PROYECTOS\\Alfa', 'C:\\Imagenes\\icono.png')).toBeNull()
  })
})

describe('archivarProyecto (historia 6)', () => {
  it('archiva, deshace y no toca la carpeta ni otros archivos', async () => {
    await writeFile(join(raiz, 'Alfa', 'notas.txt'), 'hola')
    await conFicha('Alfa')
    expect(await archivarProyecto(raiz, join(raiz, 'Alfa'), true)).toEqual({ ok: true })
    expect(await leer('Alfa')).toMatchObject({ archivado: true, estado: 'en-desarrollo' })
    expect((await readdir(join(raiz, 'Alfa'))).sort()).toEqual(['.proyecto.json', 'notas.txt'])
    expect(await archivarProyecto(raiz, join(raiz, 'Alfa'), false)).toEqual({ ok: true })
    expect(await leer('Alfa')).toMatchObject({ archivado: false })
  })

  it('un proyecto sin clasificar no se archiva', async () => {
    const r = await archivarProyecto(raiz, join(raiz, 'Alfa'), true)
    expect(r.ok).toBe(false)
    expect(await readdir(join(raiz, 'Alfa'))).toEqual([])
  })
})
