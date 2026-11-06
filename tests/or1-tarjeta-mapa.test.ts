// OR-I1: los avisos del framework en la tarjeta (W-2; el texto se prueba con Playwright) y el Mapa con el vocabulario único (OR-5, A-5, A-21).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Documentos } from '../src/main/app/documentos'
import { mapaDe } from '../src/main/app/mapa'
import { leerPreguntasAbiertas, listarProyectos } from '../src/main/app/proyectos'
import { clasificarHito, clasificarIteracion } from '../src/main/core/mapa'

let raiz: string

async function escribir(proyecto: string, ruta: string, texto: string) {
  await mkdir(join(raiz, proyecto, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, proyecto, ruta), texto)
}

const ESTADO = (preguntas: string) => `# Estado del proyecto

**Última actualización:** 2026-11-06

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | hecho | \`00-idea.md\` |
| 9 | Lanzamiento | completo | \`09-lanzamiento.md\` |
| 10 | Operación | en curso | \`10-operacion.md\` |

## Preguntas abiertas
${preguntas}

## Próximo paso
Seguir.
`

const MODULO = `# Estado del módulo: Orden

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho | \`propuesta.md\` |
| 2. Definición | pendiente | |
| 3. UX | en curso | |
`

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-tarjeta-'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

describe('La tarjeta: el framework y sus avisos (W-2)', () => {
  it('con framework, los avisos del control; sin él, «framework viejo»; sin estado.md, nada', async () => {
    // Con framework, la tabla de hitos ya va con el vocabulario y el proyecto tiene `trabajo.md`.
    const nuevo = (preguntas: string) => ESTADO(preguntas).replace('| completo |', '| hecho |')
    for (const n of ['Alfa', 'Gamma']) {
      await escribir(n, 'docs/README.md', '# Docs\n\n**Framework:** 2026-11-06\n')
      await escribir(n, 'docs/trabajo.md', '# Trabajo\n')
    }
    await escribir(
      'Alfa',
      'docs/estado.md',
      nuevo('- **Q-1 — Una pregunta sin tipo**\n  Contexto: falta la línea.'),
    )
    await escribir('Gamma', 'docs/estado.md', nuevo('(ninguna)'))
    await escribir('Beta', 'docs/estado.md', ESTADO('(ninguna)'))
    await mkdir(join(raiz, 'Delta'))
    const lista = await listarProyectos(raiz)
    if (lista.tipo !== 'lista') throw new Error('sin lista')
    const de = (n: string) => lista.proyectos.find((p) => p.nombre === n)?.framework
    const alfa = de('Alfa')
    expect(alfa).toMatchObject({ avisos: [expect.stringMatching(/^docs\/estado\.md:\d+ — .*Q-1/)] })
    expect(de('Beta')).toBe('viejo')
    expect(de('Gamma')).toEqual({ avisos: [] })
    expect(de('Delta')).toBeNull()
  })
})

describe('El Mapa con el vocabulario único', () => {
  it('framework viejo: las palabras de antes se traducen; las nuevas también se entienden', () => {
    expect(clasificarHito('completo')).toBe('completo')
    expect(clasificarHito('hecho')).toBe('completo')
    expect(clasificarHito('descartado: no hacía falta')).toBe('saltado')
    expect(clasificarHito('en pausa')).toBe('en-pausa')
    expect(clasificarHito('reabierto')).toBe('reabierto')
    expect(clasificarIteracion('hecha')).toBe('hecho')
    expect(clasificarIteracion('en pausa hasta Q-9')).toBe('en-pausa')
    expect(clasificarIteracion('probada; espera la prueba')).toBe('espera')
  })

  it('con framework: solo el vocabulario; lo de afuera se muestra tal cual', () => {
    expect(clasificarHito('hecho', true)).toBe('completo')
    expect(clasificarHito('completo', true)).toBe('otro')
    expect(clasificarHito('reabierto', true)).toBe('otro')
    expect(clasificarIteracion('aprobada', true)).toBe('otro')
    expect(clasificarIteracion('en curso', true)).toBe('en-curso')
  })

  it('el paso del frente es el que está en curso, no el primero sin hacer (A-5)', async () => {
    await escribir('Alfa', 'docs/estado.md', ESTADO('(ninguna)'))
    await escribir('Alfa', 'docs/modulos/orden/estado.md', MODULO)
    const m = mapaDe(await new Documentos().de(join(raiz, 'Alfa')), [])
    if (m.tipo !== 'mapa') throw new Error('sin mapa')
    expect(m.frentes[0]?.paso).toBe('3. UX')
    expect(m.hitos.map((h) => h.estado)).toEqual(['completo', 'completo', 'en-curso'])
  })

  it('con framework, «completo» en la tabla de hitos ya no es un estado', async () => {
    await escribir('Alfa', 'docs/estado.md', ESTADO('(ninguna)'))
    await escribir('Alfa', 'docs/README.md', '# Docs\n\n**Framework:** 2026-11-06\n')
    const m = mapaDe(await new Documentos().de(join(raiz, 'Alfa')), [])
    if (m.tipo !== 'mapa') throw new Error('sin mapa')
    expect(m.hitos.map((h) => h.estado)).toEqual(['completo', 'otro', 'en-curso'])
  })

  it('una pregunta va al frente de su línea «Frente:», aunque esté escrita en el estado.md general (OR-3)', async () => {
    await escribir(
      'Alfa',
      'docs/estado.md',
      ESTADO(
        `- **Q-1 — Del núcleo**
  Tipo: consulta
- **Q-2 — De Orden**
  Tipo: tarea · Frente: Orden
- **Q-3 — De otro**
  Tipo: consulta · Frente: Nadie`,
      ),
    )
    await escribir('Alfa', 'docs/modulos/orden/estado.md', MODULO)
    const carpeta = join(raiz, 'Alfa')
    const m = mapaDe(await new Documentos().de(carpeta), await leerPreguntasAbiertas(carpeta))
    if (m.tipo !== 'mapa') throw new Error('sin mapa')
    expect(m.frentes[0]?.preguntas.map((q) => q.codigo)).toEqual(['Q-2'])
    // Un frente que no existe queda en el núcleo, a la vista.
    expect(m.preguntas.map((q) => q.codigo)).toEqual(['Q-1', 'Q-3'])
  })
})
