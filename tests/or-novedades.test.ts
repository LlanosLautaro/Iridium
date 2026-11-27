// T-64 (frente Orden, D-118, Q-311): las novedades del framework. El lector de `novedades.md`, cuáles le tocan a un
// proyecto, la regla del control, la tarjeta y Skills › Framework con ellas, y el pedido de Ponerse al día.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  citaPonerseAlDia,
  mensajePonerseAlDia,
  type NovedadFramework,
  novedadesDe,
  textoParaMirar,
} from '../src/compartido/skills'
import { listarProyectos } from '../src/main/app/proyectos'
import { proyectosConFramework } from '../src/main/app/skills'
import { correrControl } from '../src/main/core/control'
import {
  leerNovedades,
  novedadesDelProyecto,
  RUTA_NOVEDADES_EN_REPO,
} from '../src/main/core/novedades-framework'
import { estadoConFramework } from '../src/main/core/skills'
import { fijarCarpetaFramework } from '../src/main/infra/novedades-framework'

const MUESTRA = [
  '# Novedades del framework',
  '',
  'Lo de arriba no es una novedad.',
  '',
  '## 2026-11-12 — Las piezas llevan ficha',
  'Solo si: docs/diseno/piezas.css',
  'Cada pieza empieza con su `Grupo:`.',
  '',
  '## 2026-11-20 — Cada proyecto dice cómo se abre',
  'La marca en `docs/scripts.md`.',
  'En dos líneas.',
  '',
].join('\r\n')

describe('el lector de novedades.md', () => {
  it('lee la fecha, qué cambió, a quién le toca y qué pide', () => {
    const { novedades, problemas } = leerNovedades(`﻿${MUESTRA}`)
    expect(problemas).toEqual([])
    expect(novedades).toEqual([
      {
        fecha: '2026-11-12',
        titulo: 'Las piezas llevan ficha',
        texto: 'Cada pieza empieza con su `Grupo:`.',
        soloSi: 'docs/diseno/piezas.css',
      },
      {
        fecha: '2026-11-20',
        titulo: 'Cada proyecto dice cómo se abre',
        texto: 'La marca en `docs/scripts.md`.\nEn dos líneas.',
        soloSi: null,
      },
    ])
  })

  it('marca un título sin fecha, el desorden, un Solo si que sale del proyecto y una sin texto', () => {
    const { problemas } = leerNovedades(
      [
        '## Sin fecha',
        'Algo.',
        '## 2026-11-20 — La nueva',
        'Algo.',
        '## 2026-11-10 — La vieja, después',
        'Solo si: ../otro',
        'Algo.',
        '## 2026-11-21 — Vacía',
        '',
      ].join('\n'),
    )
    expect(problemas.map((p) => p.linea)).toEqual([1, 5, 6, 8])
  })

  it('el novedades.md del framework se lee sin problemas y trae las de D-117, D-119 y D-200', async () => {
    const texto = await readFile(RUTA_NOVEDADES_EN_REPO, 'utf8')
    const { novedades, problemas } = leerNovedades(texto)
    expect(problemas).toEqual([])
    expect(novedades.map((n) => n.titulo)).toEqual([
      'Las piezas del design system llevan ficha',
      'Las medidas fijas son tokens',
      'Lo aprobado de un frente va en su ruta',
    ])
  })
})

describe('las novedades de un proyecto', () => {
  const { novedades } = leerNovedades(MUESTRA)
  it('solo las de después de su fecha y las que le tocan', () => {
    const conDiseno = () => true
    const sinDiseno = () => false
    expect(novedadesDelProyecto(novedades, '2026-11-08', conDiseno)).toHaveLength(2)
    expect(novedadesDelProyecto(novedades, '2026-11-08', sinDiseno).map((n) => n.fecha)).toEqual([
      '2026-11-20',
    ])
    // La misma fecha ya está al día.
    expect(novedadesDelProyecto(novedades, '2026-11-12', conDiseno).map((n) => n.fecha)).toEqual([
      '2026-11-20',
    ])
    expect(novedadesDelProyecto(novedades, '2026-11-26', conDiseno)).toEqual([])
    expect(novedadesDelProyecto(novedades, null, conDiseno)).toHaveLength(2)
  })

  it('Skills › Framework las lleva solo si hay', () => {
    const base = {
      tieneEstado: true,
      archivado: false,
      estado: 'en-desarrollo' as const,
      reemplazadoPor: null,
      readme: '**Framework:** 2026-11-06',
      avisos: [] as string[],
    }
    expect(estadoConFramework({ ...base, novedades: [] })).toEqual({ tipo: 'al-dia', fecha: '2026-11-06' })
    const e = estadoConFramework({ ...base, novedades })
    expect(e && novedadesDe(e)).toHaveLength(2)
    expect(novedadesDe({ tipo: 'carpeta' })).toEqual([])
  })
})

describe('Ponerse al día', () => {
  const { novedades } = leerNovedades(MUESTRA)
  it('pide cada novedad y la fecha de la última', () => {
    const m = mensajePonerseAlDia(novedades)
    expect(m).toContain('**2026-11-12 — Las piezas llevan ficha.** Cada pieza empieza con su `Grupo:`.')
    expect(m).toContain('La marca en `docs/scripts.md`. En dos líneas.')
    expect(m).toContain('`**Framework:** 2026-11-20`')
    expect(m).toContain('cambiaron 2 cosas')
    const c = citaPonerseAlDia(novedades.slice(0, 1))
    expect(c).toMatchObject({ tipo: 'Framework', nombre: 'Ponerse al día · 1 novedad' })
    expect(c.texto).toContain('cambió una cosa')
  })
  it('para mirar, sin las comillas del código', () => {
    expect(textoParaMirar('Usá `--alto-control` y **no** el número')).toBe(
      'Usá --alto-control y no el número',
    )
  })
})

describe('el control', () => {
  const vacio = { estados: [], trabajo: null, respuestas: new Map(), documentos: [], frentes: [] }
  it('revisa novedades.md solo donde está (el repo de Iridium)', () => {
    expect(correrControl(vacio).filter((a) => a.regla === 'novedades')).toEqual([])
    expect(correrControl({ ...vacio, novedades: MUESTRA }).filter((a) => a.regla === 'novedades')).toEqual([])
    const avisos = correrControl({ ...vacio, novedades: '## 2026-11-12 Sin raya\nAlgo.' })
    expect(avisos.filter((a) => a.regla === 'novedades')).toEqual([
      expect.objectContaining({ regla: 'novedades', archivo: RUTA_NOVEDADES_EN_REPO, linea: 1 }),
    ])
  })
})

describe('la tarjeta y Skills › Framework, con el disco', () => {
  let raiz: string
  let framework: string
  beforeEach(async () => {
    raiz = await mkdtemp(join(tmpdir(), 'iridium-novedades-'))
    framework = join(raiz, '.framework')
    await mkdir(framework)
    // `Solo si:` una carpeta (`docs/ux`), para que los proyectos de muestra no tengan avisos del diseño.
    await writeFile(join(framework, 'novedades.md'), MUESTRA.replace('docs/diseno/piezas.css', 'docs/ux'))
    fijarCarpetaFramework(framework)
    const proyecto = async (nombre: string, fecha: string, ux: boolean) => {
      const docs = join(raiz, nombre, 'docs')
      await mkdir(docs, { recursive: true })
      await writeFile(
        join(docs, 'estado.md'),
        [
          '# Estado',
          '',
          '**Última actualización:** 2026-11-26',
          '',
          '## Hito actual',
          '10 — Operación — en curso',
          '',
          '## Preguntas abiertas',
          '(ninguna)',
          '',
          '## Próximo paso',
          'Seguir.',
          '',
        ].join('\n'),
      )
      await writeFile(join(docs, 'trabajo.md'), '# Trabajo\n')
      await writeFile(join(docs, 'README.md'), `# Docs\n\n**Framework:** ${fecha}\n`)
      if (ux) await mkdir(join(docs, 'ux'))
    }
    await proyecto('Alfa', '2026-11-08', true)
    await proyecto('Beta', '2026-11-08', false)
    await proyecto('Gamma', '2026-11-26', true)
  })
  afterEach(async () => {
    fijarCarpetaFramework(null)
    await rm(raiz, { recursive: true, force: true })
  })

  it('cada tarjeta trae las suyas y Skills › Framework las pone antes de los que están al día', async () => {
    const lista = await listarProyectos(raiz)
    if (lista.tipo !== 'lista') throw new Error(lista.mensaje)
    const de = (n: string) => {
      const f = lista.proyectos.find((p) => p.nombre === n)?.framework
      return f && f !== 'viejo' ? (f.novedades ?? []).map((x: NovedadFramework) => x.fecha) : null
    }
    expect(de('Alfa')).toEqual(['2026-11-12', '2026-11-20'])
    expect(de('Beta')).toEqual(['2026-11-20'])
    expect(de('Gamma')).toEqual([])
    expect(lista.proyectos.every((p) => p.framework !== 'viejo' && p.framework?.avisos.length === 0)).toBe(
      true,
    )
    const filas = await proyectosConFramework(lista.proyectos)
    expect(filas.at(-1)?.nombre).toBe('Gamma')
    expect(novedadesDe(filas.find((f) => f.nombre === 'Alfa')?.estado ?? { tipo: 'carpeta' })).toHaveLength(2)
  })
})
