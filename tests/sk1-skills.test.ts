// SK-I1 (modulos/skills/diseno-tecnico.md › Pruebas): el SKILL.md, los cuatro orígenes con enlaces reales y las copias
// dobles; y Skills › Framework (frente Orden, W-13): cómo está cada proyecto con el framework.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { OrigenSkill, Skill } from '../src/compartido/skills'
import { listarProyectos } from '../src/main/app/proyectos'
import { leerSeccionSkills, proyectosConFramework } from '../src/main/app/skills'
import {
  estadoConFramework,
  fechaDelFramework,
  formatoDelProyecto,
  leerEncabezado,
  marcarDobles,
} from '../src/main/core/skills'
import { cambianSkills } from '../src/main/core/vigilancia'
import { generacionesNuevas } from '../src/main/infra/skills'
import { armarCarpetaClaude, GUIA } from './muestras/carpeta-claude'

describe('leerEncabezado (SKILL.md)', () => {
  it('lee name y description en una línea, con y sin comillas', () => {
    expect(leerEncabezado('---\nname: debug\ndescription: Structured debugging.\n---\n# x')).toEqual({
      name: 'debug',
      description: 'Structured debugging.',
    })
    expect(leerEncabezado(`---\nname: "hitos"\ndescription: 'Guía: de "hitos"; it''s ok'\n---`)).toEqual({
      name: 'hitos',
      description: `Guía: de "hitos"; it's ok`,
    })
  })
  it('lee la descripción en varias líneas: en bloque y con sangría', () => {
    expect(leerEncabezado(GUIA).description).toBe(
      'Guía de hitos para llevar una app desde la idea vaga hasta el lanzamiento.',
    )
    expect(
      leerEncabezado('---\r\nname: x\r\ndescription: Una\r\n  que sigue\r\nversion: 1\r\n---\r\n')
        .description,
    ).toBe('Una que sigue')
    expect(leerEncabezado('---\nname: x\ndescription: |\n  uno\n  dos\n---').description).toBe('uno\ndos')
  })
  it('un SKILL.md roto no falla: lo que falta vuelve null', () => {
    expect(leerEncabezado('# Sin encabezado')).toEqual({ name: null, description: null })
    expect(leerEncabezado('---\nname: x\n')).toEqual({ name: null, description: null })
    expect(leerEncabezado('---\nname: x\ndescription:\n---')).toEqual({ name: 'x', description: null })
  })
})

describe('cómo está un proyecto con el framework (W-13)', () => {
  it('las fechas: la del framework y la del formato viejo de la guía', () => {
    expect(fechaDelFramework('# Docs\n\n**Framework:** 2026-11-06\n')).toBe('2026-11-06')
    expect(fechaDelFramework('# Docs')).toBeNull()
    expect(formatoDelProyecto('# Docs\n\n**Formato de la guía:** 2026-10-16\n')).toBe('2026-10-16')
    expect(formatoDelProyecto('**Formato de la guia**: 2026-10-16')).toBe('2026-10-16')
    expect(formatoDelProyecto('# Docs')).toBeNull()
  })
  const base = {
    tieneEstado: true,
    archivado: false,
    estado: 'en-desarrollo' as const,
    reemplazadoPor: null,
    readme: '**Framework:** 2026-11-06',
    avisos: [] as string[],
  }
  it('al día, con avisos, de framework viejo o carpeta simple', () => {
    expect(estadoConFramework(base)).toEqual({ tipo: 'al-dia', fecha: '2026-11-06' })
    expect(estadoConFramework({ ...base, avisos: ['docs/estado.md:3 — falta el tipo'] })).toEqual({
      tipo: 'avisos',
      fecha: '2026-11-06',
      avisos: ['docs/estado.md:3 — falta el tipo'],
    })
    expect(
      estadoConFramework({ ...base, readme: '**Formato de la guía:** 2026-10-16', avisos: null }),
    ).toEqual({
      tipo: 'viejo',
      fecha: '2026-10-16',
    })
    expect(estadoConFramework({ ...base, readme: null, avisos: null })).toEqual({
      tipo: 'viejo',
      fecha: null,
    })
    expect(estadoConFramework({ ...base, tieneEstado: false, readme: null })).toEqual({ tipo: 'carpeta' })
  })
  it('no cuentan: archivado, descontinuado o reemplazado', () => {
    expect(estadoConFramework({ ...base, archivado: true })).toBeNull()
    expect(estadoConFramework({ ...base, estado: 'descontinuado' })).toBeNull()
    expect(estadoConFramework({ ...base, reemplazadoPor: 'Otro' })).toBeNull()
  })
})

describe('copias dobles (SK-2, D-014)', () => {
  const s = (id: string, nombre: string, origen: OrigenSkill): Skill => ({
    id,
    nombre,
    descripcion: null,
    origen,
    complemento: origen === 'complemento' ? (nombre.split(':')[0] ?? null) : null,
    destino: null,
    problema: null,
    doble: null,
  })
  it('la carpeta suelta sobra frente a un complemento, con el nombre sin el complemento', () => {
    const suelta = s('a', 'impeccable', 'tercero')
    const comp = s('b', 'impeccable:impeccable', 'complemento')
    expect(marcarDobles([suelta, comp, s('c', 'otra', 'cuenta')])).toBe(1)
    expect(suelta.doble).toMatchObject({ otra: 'b', sobra: 'esta', otraOrigen: 'complemento' })
    expect(suelta.doble?.motivo).toMatch(/^Sobra esta carpeta: la del complemento se actualiza sola/)
    expect(comp.doble).toMatchObject({ otra: 'a', sobra: 'otra' })
  })
  it('entre dos que se actualizan solas no se elige', () => {
    const a = s('a', 'pdf', 'cuenta')
    const b = s('b', 'docs:pdf', 'complemento')
    marcarDobles([a, b])
    expect(a.doble?.sobra).toBeNull()
    expect(b.doble?.sobra).toBeNull()
  })
})

describe('generacionesNuevas (complementos)', () => {
  it('de cada complemento queda la generación más nueva', () => {
    expect(generacionesNuevas(['impeccable', 'impeccable~g3', 'impeccable~g2', '2da0']).sort()).toEqual([
      '2da0',
      'impeccable~g3',
    ])
  })
})

describe('cambianSkills (vigilancia)', () => {
  it('una skill propia o el formato de un proyecto', () => {
    expect(cambianSkills('Skills\\skills\\hitos-desarrollo-app\\SKILL.md')).toBe(true)
    expect(cambianSkills('Alfa\\docs\\README.md')).toBe(true)
    expect(cambianSkills('Alfa\\CLAUDE.md')).toBe(true)
    expect(cambianSkills('Alfa\\docs\\estado.md')).toBe(false)
    expect(cambianSkills('Alfa\\src\\CLAUDE.md')).toBe(false)
    expect(cambianSkills('Skills\\docs\\estado.md')).toBe(false)
  })
})

describe('leerSeccionSkills y proyectosConFramework (disco)', () => {
  let base: string
  let claude: string
  let raiz: string
  let carpetaSkills: string
  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-skills-'))
    claude = join(base, '.claude')
    raiz = join(base, 'PROYECTOS')
    carpetaSkills = join(base, 'Iridium', 'Skills')
    await armarCarpetaClaude(claude, carpetaSkills, join(base, 'afuera'))
  })
  afterEach(async () => {
    await rm(base, { recursive: true, force: true, maxRetries: 5 })
  })

  it('agrupa por origen con enlaces reales y deja afuera lo que no es una skill', async () => {
    const lista = await leerSeccionSkills(claude, carpetaSkills)
    expect(lista.errores).toEqual([])
    const por = (o: string) => lista.skills.filter((s) => s.origen === o).map((s) => s.nombre)
    expect(por('propia')).toEqual(['gestor-proyectos', 'hitos-desarrollo-app', 'vieja'])
    expect(por('tercero')).toEqual(['ajena', 'impeccable', 'sin-descripcion'])
    expect(por('complemento')).toEqual(['engineering:debug', 'engineering:standup', 'impeccable:impeccable'])
    expect(por('cuenta')).toEqual(['docx', 'pdf'])
    const de = (n: string) => lista.skills.find((s) => s.nombre === n)
    expect(de('vieja')?.problema).toBe('enlace-roto')
    expect(de('sin-descripcion')?.problema).toBe('sin-descripcion')
    expect(de('gestor-proyectos')?.descripcion).toBe('Reglas para mantener la ficha de cada proyecto.')
    // La generación vieja del complemento no cuenta: impeccable está dos veces, no tres.
    expect(de('impeccable:impeccable')?.descripcion).toBe('Design fluency for frontend development.')
    expect(de('impeccable')?.doble?.sobra).toBe('esta')
    expect(lista.skills.filter((s) => s.doble)).toHaveLength(2)
  })

  it('sin la carpeta skills, ese grupo da error y los demás se ven igual', async () => {
    await rm(join(claude, 'skills'), { recursive: true })
    const lista = await leerSeccionSkills(claude, carpetaSkills)
    expect(lista.errores).toEqual([{ origenes: ['propia', 'tercero'], carpeta: join(claude, 'skills') }])
    expect(lista.skills.map((s) => s.origen)).toEqual(['complemento', 'complemento', 'complemento'])
  })

  it('cada proyecto con cómo está: los de afuera primero, después las carpetas y los que están al día', async () => {
    const proyecto = async (nombre: string, archivos: Record<string, string>) => {
      for (const [ruta, texto] of Object.entries(archivos)) {
        await mkdir(join(raiz, nombre, ruta, '..'), { recursive: true })
        await writeFile(join(raiz, nombre, ruta), texto)
      }
    }
    const ficha = (extra: Record<string, unknown> = {}) =>
      JSON.stringify({
        version: 1,
        descripcion: 'x',
        estado: 'en-desarrollo',
        etiquetas: [],
        icono: null,
        archivado: false,
        reemplazadoPor: null,
        ...extra,
      })
    const estado =
      '# Estado\n\n**Última actualización:** 2026-11-06\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'
    await proyecto('AlDia', {
      '.proyecto.json': ficha(),
      'docs/estado.md': estado,
      'docs/README.md': '# Docs\n\n**Framework:** 2026-11-06\n',
      'docs/trabajo.md': '# Trabajo\n',
    })
    await proyecto('ConAvisos', {
      '.proyecto.json': ficha(),
      'docs/estado.md': estado.replace('(ninguna)', '- **Q-1 — ¿Sin tipo?**\n  Contexto: falta el tipo.'),
      'docs/README.md': '# Docs\n\n**Framework:** 2026-11-05\n',
      'docs/trabajo.md': '# Trabajo\n',
    })
    await proyecto('Simple', { '.proyecto.json': ficha(), 'notas.txt': 'hola' })
    await proyecto('Viejo', {
      '.proyecto.json': ficha(),
      'docs/estado.md': estado,
      'docs/README.md': '# Docs\n\n**Formato de la guía:** 2026-10-16\n',
    })
    await proyecto('Archivado', { '.proyecto.json': ficha({ archivado: true }), 'docs/estado.md': estado })
    await proyecto('Reemplazado', {
      '.proyecto.json': ficha({ estado: 'en-rescate', reemplazadoPor: 'AlDia' }),
      'docs/estado.md': estado,
    })
    const lista = await listarProyectos(raiz)
    if (lista.tipo !== 'lista') throw new Error('debería ser una lista')
    const r = await proyectosConFramework(lista.proyectos)
    expect(r.map((p) => [p.nombre, p.estado.tipo])).toEqual([
      ['Viejo', 'viejo'],
      ['ConAvisos', 'avisos'],
      ['Simple', 'carpeta'],
      ['AlDia', 'al-dia'],
    ])
    expect(r[0]?.estado).toEqual({ tipo: 'viejo', fecha: '2026-10-16' })
    const avisos = r[1]?.estado
    expect(avisos?.tipo === 'avisos' && avisos.avisos.some((a) => a.includes('Q-1'))).toBe(true)
  })
})
