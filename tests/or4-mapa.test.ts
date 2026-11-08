// OR-I4: el Mapa con frentes (W-7, A-5). Los frentes salen de la tabla «Módulos» de `estado.md` (con o sin carpeta
// propia) y de los módulos con carpeta que la tabla no nombra; el activo lleva su trabajo en curso y sus preguntas.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { controlarProyecto } from '../src/main/app/control'
import { Documentos } from '../src/main/app/documentos'
import { mapaDe } from '../src/main/app/mapa'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { leerFrentes } from '../src/main/core/mapa'

let raiz: string

async function escribir(ruta: string, texto: string) {
  await mkdir(join(raiz, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, ruta), texto)
}

const ESTADO = (modulos: string, preguntas = '(ninguna)') => `# Estado del proyecto

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 9 | Lanzamiento | hecho | \`09-lanzamiento.md\` |
| 10 | Operación | en curso | \`10-operacion.md\` |

## Módulos
${modulos}

## Preguntas abiertas
${preguntas}

## Próximo paso
Seguir.
`

const TABLA = `| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Pagos (\`modulos/pagos/estado.md\`) | sección | 4. UX (con Q-3) | en curso |
| Diseño (T-5) | sección | — | pendiente |
| Skills | sección | en operación | hecho |
| Avisos | sección | 2. Definición | en pausa |`

const PAGOS = `# Estado del módulo: Pagos

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho | |
| 4. UX | en curso | |

## Próximo paso
Dibujar la pantalla de cobro.
`

const SKILLS = `# Estado del módulo: Skills

## Progreso
| Paso | Estado |
|---|---|
| 1. Propuesta | hecho |
`

const TRABAJO = `# Trabajo

## T-1 — Cobro con tarjeta
Estado: en curso · Frente: Pagos · Fecha: 2026-11-06

## T-2 — Cobro en efectivo
Estado: pendiente · Frente: Pagos · Fecha: 2026-11-06

## T-3 — Del núcleo
Estado: en curso · Fecha: 2026-11-06

## T-4 — Otra cosa de pagos
Estado: en curso · Frente: pagos · Fecha: 2026-11-07
`

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-or4-mapa-'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

describe('La tabla de frentes (A-5)', () => {
  it('cada fila con su nombre corto, su carpeta si la cita, su paso y su estado', () => {
    expect(leerFrentes(ESTADO(TABLA), true)).toEqual([
      { nombre: 'Pagos', carpeta: 'pagos', paso: '4. UX', estado: 'en curso', estadoTexto: 'en curso' },
      { nombre: 'Diseño', carpeta: null, paso: null, estado: 'pendiente', estadoTexto: 'pendiente' },
      { nombre: 'Skills', carpeta: null, paso: 'en operación', estado: 'hecho', estadoTexto: 'hecho' },
      { nombre: 'Avisos', carpeta: null, paso: '2. Definición', estado: 'en pausa', estadoTexto: 'en pausa' },
    ])
  })

  it('con framework viejo, las columnas y las palabras de antes', () => {
    const viejo = `| Módulo | Paso actual | Estado |
|---|---|---|
| Pagos | 3. Investigación | reabierto |
| Skills | — | completo |`
    expect(leerFrentes(ESTADO(viejo)).map((f) => [f.nombre, f.paso, f.estado])).toEqual([
      ['Pagos', '3. Investigación', 'en curso'],
      ['Skills', null, 'hecho'],
    ])
    // Con framework, lo de afuera no se traduce.
    expect(leerFrentes(ESTADO(viejo), true).map((f) => f.estado)).toEqual([null, null])
  })

  it('sin la tabla, ninguno', () => {
    expect(leerFrentes(ESTADO('(ninguno)'))).toEqual([])
  })
})

describe('Los frentes del Mapa (W-7)', () => {
  it('las filas en su orden, cada una con su carpeta si tiene; el activo con su trabajo en curso y sus preguntas', async () => {
    await escribir(
      'docs/estado.md',
      ESTADO(
        TABLA,
        `- **Q-1 — Del núcleo**
  Tipo: consulta
- **Q-2 — ¿Cobro así?**
  Tipo: decisión · frena · Frente: Pagos
  Opciones: A) Sí · B) No
- **Q-3 — Del diseño**
  Tipo: consulta · Frente: Diseño`,
      ),
    )
    await escribir('docs/README.md', '# Docs\n\n**Framework:** 2026-11-06\n')
    await escribir('docs/trabajo.md', TRABAJO)
    await escribir('docs/modulos/pagos/estado.md', PAGOS)
    await escribir('docs/modulos/skills/estado.md', SKILLS)
    const m = mapaDe(await new Documentos().de(raiz), await leerPreguntasAbiertas(raiz))
    if (m.tipo !== 'mapa') throw new Error('sin mapa')
    expect(m.frentes.map((f) => [f.nombre, f.estado, f.documento])).toEqual([
      ['Pagos', 'en curso', 'docs/modulos/pagos/estado.md'],
      ['Diseño', 'pendiente', null],
      // Skills no cita su carpeta en la tabla, pero un módulo se llama igual.
      ['Skills', 'hecho', 'docs/modulos/skills/estado.md'],
      ['Avisos', 'en pausa', null],
    ])
    const pagos = m.frentes[0]
    expect(pagos?.paso).toBe('4. UX')
    expect(pagos?.proximoHtml).toContain('Dibujar la pantalla de cobro')
    // El trabajo en curso de su frente (el nombre sin importar mayúsculas), no el pendiente ni el del núcleo.
    expect(pagos?.trabajo).toEqual([
      { codigo: 'T-1', titulo: 'Cobro con tarjeta' },
      { codigo: 'T-4', titulo: 'Otra cosa de pagos' },
    ])
    expect(pagos?.preguntas.map((q) => q.codigo)).toEqual(['Q-2'])
    // Un frente sin carpeta también recibe sus preguntas; lo que no es de ninguno queda en el núcleo.
    expect(m.frentes[1]?.preguntas.map((q) => q.codigo)).toEqual(['Q-3'])
    expect(m.preguntas.map((q) => q.codigo)).toEqual(['Q-1'])
    // Sin carpeta, el paso es el de la tabla.
    expect(m.frentes[3]?.paso).toBe('2. Definición')
  })

  it('un módulo con carpeta que la tabla no nombra va al final, con el estado de sus pasos', async () => {
    await escribir('docs/estado.md', ESTADO('(ninguno)'))
    await escribir('docs/modulos/pagos/estado.md', PAGOS)
    await escribir('docs/modulos/skills/estado.md', SKILLS)
    const m = mapaDe(await new Documentos().de(raiz), [])
    if (m.tipo !== 'mapa') throw new Error('sin mapa')
    expect(m.frentes.map((f) => [f.carpeta, f.estado, f.paso])).toEqual([
      ['pagos', 'en curso', '4. UX'],
      ['skills', 'hecho', null],
    ])
  })
})

describe('El control con los frentes de la tabla (A-5)', () => {
  it('un frente de la tabla sin carpeta existe: su pregunta y su T-n no avisan; uno que no está, sí', async () => {
    await escribir(
      'docs/estado.md',
      ESTADO(
        TABLA,
        `- **Q-1 — ¿Qué biblioteca?**
  Tipo: consulta · Frente: Diseño
- **Q-2 — ¿Y esto?**
  Tipo: consulta · Frente: Nadie`,
      ).replace('# Estado del proyecto\n', '# Estado del proyecto\n\n**Última actualización:** 2026-11-07\n'),
    )
    await escribir('docs/README.md', '# Docs\n\n**Framework:** 2026-11-06\n')
    await escribir(
      'docs/trabajo.md',
      '# Trabajo\n\n## T-1 — Una biblioteca\nEstado: pendiente · Frente: Diseño · Fecha: 2026-11-07\n',
    )
    await escribir('docs/modulos/pagos/estado.md', PAGOS)
    const avisos = ((await controlarProyecto(raiz)) ?? []).map((a) => a.texto)
    expect(avisos.filter((t) => t.includes('Diseño'))).toEqual([])
    expect(avisos).toContainEqual(expect.stringContaining('«Nadie»'))
  })
})
