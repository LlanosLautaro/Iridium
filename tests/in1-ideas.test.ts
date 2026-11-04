// IN-I1 (modulos/inicio/diseno-tecnico.md › Pruebas): leer `ideas.md` con el formato de `Ideas/CLAUDE.md` (inventado,
// con su mismo formato) y sus casos raros, y el caso de uso sin carpeta, sin archivo, grande y con los proyectos.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { TarjetaProyecto } from '../src/compartido/puente'
import { leerSeccionIdeas } from '../src/main/app/ideas'
import { LIMITE_DOCUMENTO_BYTES } from '../src/main/app/visor'
import { leerIdeas, tituloYFecha } from '../src/main/core/ideas'

const muestra = () => readFile(join(__dirname, 'muestras', 'ideas.md'), 'utf8')

describe('leerIdeas', () => {
  it('lee un ideas.md de muestra: tres secciones en su orden, con su explicación', async () => {
    const r = leerIdeas(await muestra())
    if (r.tipo !== 'secciones') throw new Error(r.tipo)
    expect(r.secciones.map((s) => [s.titulo, s.ideas.length, s.integradas])).toEqual([
      ['Sueltas', 3, false],
      ['Para proyectos existentes', 4, false],
      ['Integradas', 5, true],
    ])
    expect(r.secciones[0]?.explicacion).toBe('Ideas que todavía no tienen proyecto.')
  })

  it('cada idea con su título sin la fecha, la fecha, Toca a y a dónde fue', async () => {
    const r = leerIdeas(await muestra())
    if (r.tipo !== 'secciones') throw new Error(r.tipo)
    const [sueltas, para, integradas] = r.secciones
    const arq = sueltas?.ideas[0]
    expect(arq?.titulo).toBe('Planificador de comidas de la semana')
    expect(arq?.fecha).toBe('2026-10-30')
    expect(arq?.toca).toEqual([])
    expect(arq?.cuerpo).toMatch(/^Para más adelante\./)
    const alfa = para?.ideas[0]
    expect(alfa?.toca).toEqual(['Delta', 'Beta'])
    // La frase Toca a sale del cuerpo: se muestra aparte.
    expect(alfa?.cuerpo).not.toContain('Toca a')
    expect(alfa?.cuerpo).toMatch(/D-022\)\.$/)
    const puente = integradas?.ideas[0]
    expect(puente?.destino).toMatch(/^2026-10-21: pasó al proyecto nuevo `Omega`/)
    expect(puente?.cuerpo).not.toContain('→')
    expect(puente?.toca).toEqual(['Beta', 'Delta'])
  })

  it('la fecha con raya, con guion, sin espacios o sin fecha', () => {
    expect(tituloYFecha('Una idea — 2026-10-30')).toEqual({ titulo: 'Una idea', fecha: '2026-10-30' })
    expect(tituloYFecha('Una idea - 2026-10-30')).toEqual({ titulo: 'Una idea', fecha: '2026-10-30' })
    expect(tituloYFecha('Una idea—2026-10-30')).toEqual({ titulo: 'Una idea', fecha: '2026-10-30' })
    expect(tituloYFecha('Una idea sin fecha')).toEqual({ titulo: 'Una idea sin fecha', fecha: null })
    expect(tituloYFecha('Del 2026-10-30 en adelante')).toEqual({
      titulo: 'Del 2026-10-30 en adelante',
      fecha: null,
    })
  })

  it('una línea Toca a sola sale del cuerpo; un ### dentro de un bloque de código no es una idea', () => {
    const r = leerIdeas(
      '# Ideas\n\n## Sueltas\n\n### Una — 2026-11-01\nQué es.\nToca a: `Beta`.\n\n```\n### no\n```\n',
    )
    if (r.tipo !== 'secciones') throw new Error(r.tipo)
    expect(r.secciones[0]?.ideas).toHaveLength(1)
    expect(r.secciones[0]?.ideas[0]).toMatchObject({ toca: ['Beta'], destino: null })
    expect(r.secciones[0]?.ideas[0]?.cuerpo).toBe('Qué es.\n\n```\n### no\n```')
    expect(r.secciones[0]?.explicacion).toBeNull()
  })

  it('sin secciones o vacío: «sin secciones»; ideas sin sección van a una', () => {
    expect(leerIdeas('# Ideas\n\nUna lista suelta:\n- algo\n')).toEqual({ tipo: 'sin-secciones' })
    expect(leerIdeas('')).toEqual({ tipo: 'sin-secciones' })
    const r = leerIdeas('### Una\nTexto\n')
    expect(r.tipo === 'secciones' && r.secciones[0]?.titulo).toBe('Ideas')
  })
})

describe('leerSeccionIdeas', () => {
  let base: string
  const tarjeta = (nombre: string): TarjetaProyecto =>
    ({ nombre, ruta: join(base, nombre) }) as unknown as TarjetaProyecto
  const html = async (t: string) => `<p>${t}</p>`

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-ideas-'))
  })
  afterEach(async () => {
    await rm(base, { recursive: true, force: true })
  })

  it('sin la carpeta Ideas y sin ideas.md', async () => {
    const carpeta = join(base, 'Ideas')
    expect(await leerSeccionIdeas({ carpeta, proyectos: [], html })).toEqual({ tipo: 'sin-carpeta' })
    await mkdir(carpeta)
    expect(await leerSeccionIdeas({ carpeta, proyectos: [], html })).toEqual({ tipo: 'sin-archivo' })
  })

  it('un ideas.md de más de 2 MB no se lee', async () => {
    const carpeta = join(base, 'Ideas')
    await mkdir(carpeta)
    await writeFile(join(carpeta, 'ideas.md'), 'x'.repeat(LIMITE_DOCUMENTO_BYTES + 1))
    expect(await leerSeccionIdeas({ carpeta, proyectos: [], html })).toEqual({
      tipo: 'grande',
      bytes: LIMITE_DOCUMENTO_BYTES + 1,
    })
  })

  it('pinta cada idea y marca qué proyectos que toca existen', async () => {
    const carpeta = join(base, 'Ideas')
    await mkdir(carpeta)
    await writeFile(join(carpeta, 'ideas.md'), await muestra())
    const r = await leerSeccionIdeas({ carpeta, proyectos: [tarjeta('Beta')], html })
    if (r.tipo !== 'ideas') throw new Error(r.tipo)
    const alfa = r.secciones[1]?.ideas[0]
    expect(alfa?.toca).toEqual([
      { nombre: 'Delta', ruta: null },
      { nombre: 'Beta', ruta: join(base, 'Beta') },
    ])
    expect(alfa?.html).toMatch(/^<p>Que Alfa/)
    expect(alfa?.integrada).toBe(false)
    expect(r.secciones[2]?.ideas.every((i) => i.integrada && i.destinoHtml !== null)).toBe(true)
  })

  it('sin el formato: el texto entero pintado', async () => {
    const carpeta = join(base, 'Ideas')
    await mkdir(carpeta)
    await writeFile(join(carpeta, 'ideas.md'), 'Notas sueltas')
    expect(await leerSeccionIdeas({ carpeta, proyectos: [], html })).toEqual({
      tipo: 'sin-secciones',
      html: '<p>Notas sueltas</p>',
    })
  })
})
