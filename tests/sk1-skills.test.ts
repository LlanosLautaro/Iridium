// SK-I1 (modulos/skills/diseno-tecnico.md › Pruebas): el SKILL.md, los cuatro orígenes con enlaces reales, las copias
// dobles, el formato vigente y los proyectos atrasados.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { OrigenSkill, Skill } from '../src/compartido/skills'
import { listarProyectos } from '../src/main/app/proyectos'
import { leerSeccionSkills, proyectosAtrasados } from '../src/main/app/skills'
import {
  formatoAtrasado,
  formatoDelProyecto,
  formatoVigente,
  leerEncabezado,
  marcarDobles,
} from '../src/main/core/skills'
import { cambianSkills } from '../src/main/core/vigilancia'
import { generacionesNuevas } from '../src/main/infra/skills'
import { armarCarpetaClaude, GUIA, VIGENTE } from './muestras/carpeta-claude'

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

describe('formato de la guía (D-068)', () => {
  it('el vigente sale de la línea fija o, si no, de la frase de la guía', () => {
    expect(formatoVigente('**Formato vigente:** 2026-10-29\n')).toBe('2026-10-29')
    expect(formatoVigente('El formato vigente de esta guía es el del **2026-10-29**: la línea…')).toBe(
      '2026-10-29',
    )
    expect(formatoVigente('# Una guía sin fecha')).toBeNull()
  })
  it('el de un proyecto, con la lectura tolerante de estado.md', () => {
    expect(formatoDelProyecto('# Docs\n\n**Formato de la guía:** 2026-10-16\n')).toBe('2026-10-16')
    expect(formatoDelProyecto('**Formato de la guia**: 2026-10-16')).toBe('2026-10-16')
    expect(formatoDelProyecto('# Docs')).toBeNull()
  })
  const base = {
    tieneEstado: true,
    archivado: false,
    estado: 'en-desarrollo' as const,
    reemplazadoPor: null,
    readme: '**Formato de la guía:** 2026-10-16',
    claudeMd: null,
  }
  it('atrasado: fecha vieja, sin fecha o marcado a mano (gana el bloque)', () => {
    expect(formatoAtrasado(base, VIGENTE)).toEqual({ tipo: 'fecha', fecha: '2026-10-16' })
    expect(formatoAtrasado({ ...base, readme: null }, VIGENTE)).toEqual({ tipo: 'sin-formato' })
    expect(
      formatoAtrasado({ ...base, claudeMd: '## Actualización de formato pendiente\nSeguí…' }, VIGENTE),
    ).toEqual({ tipo: 'marcado' })
  })
  it('no cuentan: al día, sin estado.md, archivado, descontinuado, reemplazado o sin vigente', () => {
    expect(formatoAtrasado({ ...base, readme: `**Formato de la guía:** ${VIGENTE}` }, VIGENTE)).toBeNull()
    expect(formatoAtrasado({ ...base, tieneEstado: false }, VIGENTE)).toBeNull()
    expect(formatoAtrasado({ ...base, archivado: true }, VIGENTE)).toBeNull()
    expect(formatoAtrasado({ ...base, estado: 'descontinuado' }, VIGENTE)).toBeNull()
    expect(formatoAtrasado({ ...base, reemplazadoPor: 'Otro' }, VIGENTE)).toBeNull()
    expect(formatoAtrasado(base, null)).toBeNull()
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

describe('leerSeccionSkills y proyectosAtrasados (disco)', () => {
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
    const { lista, vigente } = await leerSeccionSkills(claude, carpetaSkills)
    expect(vigente).toBe(VIGENTE)
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
    const { lista, vigente } = await leerSeccionSkills(claude, carpetaSkills)
    expect(lista.errores).toEqual([{ origenes: ['propia', 'tercero'], carpeta: join(claude, 'skills') }])
    expect(lista.skills.map((s) => s.origen)).toEqual(['complemento', 'complemento', 'complemento'])
    expect(vigente).toBeNull()
  })

  it('lista los atrasados con su formato y deja afuera los que no cuentan', async () => {
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
    const estado = '# Estado\n\n## Hito actual\n7 — Construcción\n'
    const readme = (f: string) => `# Docs\n\n**Formato de la guía:** ${f}\n`
    await proyecto('Viejo', {
      '.proyecto.json': ficha(),
      'docs/estado.md': estado,
      'docs/README.md': readme('2026-10-16'),
    })
    await proyecto('SinFecha', { '.proyecto.json': ficha(), 'docs/estado.md': estado })
    await proyecto('Marcado', {
      '.proyecto.json': ficha(),
      'docs/estado.md': estado,
      'docs/README.md': readme(VIGENTE),
      'CLAUDE.md': '# Instrucciones\n\n## Actualización de formato pendiente\n',
    })
    await proyecto('AlDia', {
      '.proyecto.json': ficha(),
      'docs/estado.md': estado,
      'docs/README.md': readme(VIGENTE),
    })
    await proyecto('Archivado', { '.proyecto.json': ficha({ archivado: true }), 'docs/estado.md': estado })
    await proyecto('Reemplazado', {
      '.proyecto.json': ficha({ estado: 'en-rescate', reemplazadoPor: 'AlDia' }),
      'docs/estado.md': estado,
    })
    await proyecto('SinEstado', { '.proyecto.json': ficha() })
    const lista = await listarProyectos(raiz)
    if (lista.tipo !== 'lista') throw new Error('debería ser una lista')
    const r = await proyectosAtrasados(lista.proyectos, VIGENTE)
    expect(Object.fromEntries(r.proyectos.map((p) => [p.nombre, p.formato]))).toEqual({
      Viejo: { tipo: 'fecha', fecha: '2026-10-16' },
      SinFecha: { tipo: 'sin-formato' },
      Marcado: { tipo: 'marcado' },
    })
    expect((await proyectosAtrasados(lista.proyectos, null)).proyectos).toEqual([])
  })
})
