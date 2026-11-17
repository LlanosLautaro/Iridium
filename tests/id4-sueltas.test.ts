// ID-I4: las ideas sueltas del inicio (`modulos/ideas/diseno-tecnico.md` › Ideas sueltas). Anotar en `sueltas.md` de la
// carpeta Ideas sin el framework, con su nota en `sueltas/`; Mover a un proyecto con la nota y las imágenes (el número
// nuevo en las rutas) y, si algo falla a mitad de camino, la idea queda en los dos lados, nunca en ninguno.
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  anotarIdea,
  guardarIdea,
  ideasDeProyecto,
  leerNotaIdea,
  lugarDeSueltas,
  moverIdea,
  pegarImagenIdea,
} from '../src/main/app/ideas'
import { agregarIdea, notaConOtroCodigo } from '../src/main/core/ideas'

const README = '# Documentación\n\n**Framework:** 2026-11-01\n'
const HOY = new Date(2026, 10, 17)
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
).toString('base64')

describe('las reglas', () => {
  it('un archivo nuevo de sueltas lleva su propio título', () => {
    expect(
      agregarIdea('', { titulo: 'Dictado', de: 'usuario', fecha: '2026-11-17' }, '# Ideas sueltas').texto,
    ).toBe('# Ideas sueltas\n\n## T-1 — Dictado\nEstado: nueva · Idea: usuario · Fecha: 2026-11-17\n')
  })

  it('al cambiar de número, las imágenes de la nota pasan a la carpeta nueva y el resto no se toca', () => {
    const nota =
      'Ver T-3/ en el texto.\n\n![](T-3/2026-11-17-1.png)\n\n![captura](<T-3/2026-11-17-2.png>)\n\n![](T-30/x.png)'
    expect(notaConOtroCodigo(nota, 'T-3', 'T-12')).toBe(
      'Ver T-3/ en el texto.\n\n![](T-12/2026-11-17-1.png)\n\n![captura](<T-12/2026-11-17-2.png>)\n\n![](T-30/x.png)',
    )
  })
})

describe('en el disco', () => {
  let base: string
  let ideas: string
  let alfa: string
  const sueltas = () => lugarDeSueltas(ideas)
  const existe = (r: string) =>
    stat(r).then(
      () => true,
      () => false,
    )

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-sueltas-'))
    ideas = join(base, 'Ideas')
    alfa = join(base, 'Alfa')
    await mkdir(ideas)
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'README.md'), README)
    await writeFile(
      join(alfa, 'docs', 'trabajo.md'),
      '# Trabajo\n\n## T-1 — Lo de antes\nEstado: pendiente\n',
    )
  })
  afterEach(async () => {
    await rm(base, { recursive: true, force: true })
  })

  it('anota en sueltas.md sin el framework, con su nota en sueltas/', async () => {
    expect(await ideasDeProyecto(sueltas())).toEqual({ tipo: 'ok', ideas: [] })
    expect(await anotarIdea(sueltas(), 'Dictado\nPara anotar sin teclado', HOY)).toEqual({
      tipo: 'ok',
      codigo: 'T-1',
    })
    expect(await anotarIdea(sueltas(), 'https://github.com/alfa/beluga', HOY)).toEqual({
      tipo: 'ok',
      codigo: 'T-2',
    })
    expect(await readFile(join(ideas, 'sueltas.md'), 'utf8')).toBe(
      '# Ideas sueltas\n\n## T-1 — Dictado\nEstado: nueva · Idea: usuario · Fecha: 2026-11-17\n\n' +
        '## T-2 — alfa/beluga\nEstado: nueva · Idea: enlace · Fecha: 2026-11-17 · Enlace: https://github.com/alfa/beluga\n',
    )
    expect(await readFile(join(ideas, 'sueltas', 'T-1.md'), 'utf8')).toBe('Para anotar sin teclado\n')
    const l = await ideasDeProyecto(sueltas())
    // La más nueva primero.
    expect(l.tipo === 'ok' && l.ideas.map((i) => [i.codigo, i.de, i.conNota])).toEqual([
      ['T-2', 'enlace', false],
      ['T-1', 'usuario', true],
    ])
    // Sin README del framework no se mira: la carpeta Ideas no lo sigue.
    expect(await existe(join(ideas, 'docs'))).toBe(false)
  })

  it('anotar con un proyecto elegido escribe directo en su trabajo.md', async () => {
    expect(await anotarIdea(alfa, 'Sonar al terminar', HOY)).toEqual({ tipo: 'ok', codigo: 'T-2' })
    expect(await readFile(join(alfa, 'docs', 'trabajo.md'), 'utf8')).toContain('## T-2 — Sonar al terminar')
    expect(await existe(join(ideas, 'sueltas.md'))).toBe(false)
  })

  it('Mover a un proyecto: pasa sin evaluar, con su nota y sus imágenes, y sale de las sueltas', async () => {
    await anotarIdea(sueltas(), 'Otra suelta', HOY)
    await anotarIdea(sueltas(), 'Diagramas que dibuja la IA', HOY)
    const img = await pegarImagenIdea(sueltas(), 'T-2', 'image/png', PNG, HOY)
    expect(img).toMatchObject({ tipo: 'ok', ruta: 'T-2/2026-11-17-1.png' })
    await guardarIdea(
      sueltas(),
      'T-2',
      'Diagramas que dibuja la IA\nCon un dibujo paso a paso.\n\n![](T-2/2026-11-17-1.png)',
    )

    expect(await moverIdea(sueltas(), 'T-2', alfa)).toEqual({ tipo: 'ok', codigo: 'T-2' })

    const trabajo = await readFile(join(alfa, 'docs', 'trabajo.md'), 'utf8')
    expect(trabajo).toContain(
      '## T-2 — Diagramas que dibuja la IA\nEstado: nueva · Idea: usuario · Fecha: 2026-11-17\n',
    )
    const nota = await leerNotaIdea(alfa, 'T-2')
    expect(nota.tipo === 'ok' && nota.texto).toBe('Con un dibujo paso a paso.\n\n![](T-2/2026-11-17-1.png)')
    expect(nota.tipo === 'ok' && Object.keys(nota.imagenes)).toEqual(['T-2/2026-11-17-1.png'])
    // En las sueltas queda solo la otra, sin la nota ni las imágenes de la que se fue.
    const l = await ideasDeProyecto(sueltas())
    expect(l.tipo === 'ok' && l.ideas.map((i) => i.codigo)).toEqual(['T-1'])
    expect(await existe(join(ideas, 'sueltas', 'T-2.md'))).toBe(false)
    expect(await existe(join(ideas, 'sueltas', 'T-2'))).toBe(false)
  })

  it('con otro número allá, las rutas de las imágenes cambian', async () => {
    await writeFile(
      join(alfa, 'docs', 'trabajo.md'),
      '# Trabajo\n\n## T-1 — Uno\nEstado: pendiente\n\n## T-7 — Siete\nEstado: pendiente\n',
    )
    await anotarIdea(sueltas(), 'Con captura', HOY)
    await pegarImagenIdea(sueltas(), 'T-1', 'image/png', PNG, HOY)
    await guardarIdea(sueltas(), 'T-1', 'Con captura\n![](T-1/2026-11-17-1.png)')
    expect(await moverIdea(sueltas(), 'T-1', alfa)).toEqual({ tipo: 'ok', codigo: 'T-8' })
    expect(await readFile(join(alfa, 'docs', 'ideas', 'T-8.md'), 'utf8')).toBe('![](T-8/2026-11-17-1.png)\n')
    expect(await existe(join(alfa, 'docs', 'ideas', 'T-8', '2026-11-17-1.png'))).toBe(true)
  })

  it('si falla a mitad de camino, la idea queda en los dos lados, nunca en ninguno', async () => {
    await anotarIdea(sueltas(), 'No se pierde\nSu nota', HOY)
    // `docs/ideas` es un archivo: la nota no se puede copiar allá.
    await writeFile(join(alfa, 'docs', 'ideas'), 'no es una carpeta')
    const r = await moverIdea(sueltas(), 'T-1', alfa)
    expect(r).toMatchObject({ tipo: 'error', mensaje: expect.stringContaining('quedó en los dos lados') })
    expect(await readFile(join(alfa, 'docs', 'trabajo.md'), 'utf8')).toContain('## T-2 — No se pierde')
    const l = await ideasDeProyecto(sueltas())
    expect(l.tipo === 'ok' && l.ideas.map((i) => i.codigo)).toEqual(['T-1'])
    expect(await readFile(join(ideas, 'sueltas', 'T-1.md'), 'utf8')).toBe('Su nota\n')
  })

  it('no mueve a un proyecto sin el framework ni una idea que no está', async () => {
    await anotarIdea(sueltas(), 'Suelta', HOY)
    const beta = join(base, 'Beta')
    await mkdir(beta)
    expect(await moverIdea(sueltas(), 'T-1', beta)).toMatchObject({ tipo: 'error' })
    expect(await moverIdea(sueltas(), 'T-9', alfa)).toMatchObject({ tipo: 'error' })
    const l = await ideasDeProyecto(sueltas())
    expect(l.tipo === 'ok' && l.ideas.length).toBe(1)
  })
})
