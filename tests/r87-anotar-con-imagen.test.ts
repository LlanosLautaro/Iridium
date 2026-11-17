// R-87, R-88: pegar una imagen en el campo de arriba de Ideas (en un proyecto y en el inicio). Al anotar, la imagen va a
// la carpeta de la nota y queda al final de la nota; sin nada escrito, la idea se llama «Imagen pegada»; un enlace no
// lleva imágenes y lo dice antes de anotar nada.
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { anotarIdea, ideasDeProyecto, leerNotaIdea, lugarDeSueltas } from '../src/main/app/ideas'

const README = '# Documentación\n\n**Framework:** 2026-11-01\n'
const HOY = new Date(2026, 10, 17)
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const imagen = { mime: 'image/png', base64: PNG }

let base: string
let alfa: string
const existe = (r: string) =>
  stat(r).then(
    () => true,
    () => false,
  )
const trabajo = () => readFile(join(alfa, 'docs', 'trabajo.md'), 'utf8')

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-r87-'))
  alfa = join(base, 'Alfa')
  await mkdir(join(alfa, 'docs'), { recursive: true })
  await writeFile(join(alfa, 'docs', 'README.md'), README)
  await writeFile(join(alfa, 'docs', 'trabajo.md'), '# Trabajo\n\n## T-1 — Lo de antes\nEstado: pendiente\n')
})
afterEach(async () => {
  await rm(base, { recursive: true, force: true })
})

describe('anotar con imágenes pegadas en el campo', () => {
  it('la imagen va a la carpeta de la idea y al final de su nota, después de lo escrito', async () => {
    expect(await anotarIdea(alfa, 'Un botón así\nComo en la captura', HOY, [imagen])).toEqual({
      tipo: 'ok',
      codigo: 'T-2',
    })
    expect(await readFile(join(alfa, 'docs', 'ideas', 'T-2.md'), 'utf8')).toBe(
      'Como en la captura\n\n![](T-2/2026-11-17-1.png)\n',
    )
    expect(await existe(join(alfa, 'docs', 'ideas', 'T-2', '2026-11-17-1.png'))).toBe(true)
    const nota = await leerNotaIdea(alfa, 'T-2')
    expect(nota.tipo === 'ok' && Object.keys(nota.imagenes)).toEqual(['T-2/2026-11-17-1.png'])
  })

  it('dos imágenes, cada una con su nombre, en el orden en que se pegaron', async () => {
    await anotarIdea(alfa, 'Dos capturas', HOY, [imagen, imagen])
    expect(await readFile(join(alfa, 'docs', 'ideas', 'T-2.md'), 'utf8')).toBe(
      '![](T-2/2026-11-17-1.png)\n\n![](T-2/2026-11-17-2.png)\n',
    )
  })

  it('sin nada escrito, la idea se llama «Imagen pegada»', async () => {
    await anotarIdea(alfa, '  ', HOY, [imagen])
    expect(await trabajo()).toContain('## T-2 — Imagen pegada\nEstado: nueva · Idea: usuario')
    const r = await ideasDeProyecto(alfa)
    expect(r.tipo === 'ok' && r.ideas.find((i) => i.codigo === 'T-2')?.conNota).toBe(true)
  })

  it('en el inicio, va a sueltas.md con la imagen en sueltas/', async () => {
    const ideas = join(base, 'Ideas')
    await mkdir(ideas)
    expect(await anotarIdea(lugarDeSueltas(ideas), 'Suelta con captura', HOY, [imagen])).toEqual({
      tipo: 'ok',
      codigo: 'T-1',
    })
    expect(await existe(join(ideas, 'sueltas', 'T-1', '2026-11-17-1.png'))).toBe(true)
    expect(await readFile(join(ideas, 'sueltas', 'T-1.md'), 'utf8')).toBe('![](T-1/2026-11-17-1.png)\n')
  })

  it('un enlace con una imagen no se anota, y lo dice', async () => {
    const antes = await trabajo()
    const r = await anotarIdea(alfa, 'https://github.com/alfa/beluga', HOY, [imagen])
    expect(r).toEqual({
      tipo: 'error',
      mensaje: 'un enlace no lleva imágenes: anotá el enlace solo y la imagen en una idea',
    })
    expect(await trabajo()).toBe(antes)
  })

  it('lo que no es una imagen no se anota, y lo dice', async () => {
    const antes = await trabajo()
    const r = await anotarIdea(alfa, 'Algo', HOY, [{ mime: 'application/pdf', base64: PNG }])
    expect(r.tipo).toBe('error')
    expect(await trabajo()).toBe(antes)
  })

  it('si una imagen no se puede guardar, la idea queda anotada y dice que faltó', async () => {
    const r = await anotarIdea(alfa, 'Con una vacía', HOY, [imagen, { mime: 'image/png', base64: '' }])
    expect(r).toEqual({
      tipo: 'error',
      mensaje: 'se anotó «Con una vacía», pero sin una imagen: la imagen está vacía',
    })
    expect(await trabajo()).toContain('## T-2 — Con una vacía')
    expect(await readFile(join(alfa, 'docs', 'ideas', 'T-2.md'), 'utf8')).toBe('![](T-2/2026-11-17-1.png)\n')
  })

  it('sin imágenes, anotar sigue igual', async () => {
    await anotarIdea(alfa, 'Solo texto', HOY)
    expect(await existe(join(alfa, 'docs', 'ideas', 'T-2.md'))).toBe(false)
  })
})
