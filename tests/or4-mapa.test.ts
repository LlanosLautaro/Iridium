// OR-I4: el Mapa con frentes (W-7, A-5), al día con MA-I2 (D-145). Los frentes salen de la tabla «Módulos» de
// `estado.md` y de los módulos con carpeta que la tabla no nombra; los que esperan sin carpeta van a «Por empezar».
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { controlarProyecto } from '../src/main/app/control'
import { Documentos } from '../src/main/app/documentos'
import { mapaDe } from '../src/main/app/mapa'
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
      {
        nombre: 'Pagos',
        carpeta: 'pagos',
        paso: '4. UX',
        estado: 'en curso',
        estadoTexto: 'en curso',
        trabajo: [],
      },
      // El trabajo que nombra la fila es el frente mismo (D-145).
      {
        nombre: 'Diseño',
        carpeta: null,
        paso: null,
        estado: 'pendiente',
        estadoTexto: 'pendiente',
        trabajo: ['T-5'],
      },
      {
        nombre: 'Skills',
        carpeta: null,
        paso: 'en operación',
        estado: 'hecho',
        estadoTexto: 'hecho',
        trabajo: [],
      },
      {
        nombre: 'Avisos',
        carpeta: null,
        paso: '2. Definición',
        estado: 'en pausa',
        estadoTexto: 'en pausa',
        trabajo: [],
      },
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

describe('Los frentes del Mapa (W-7, D-145)', () => {
  it('los que tienen carpeta, el activo primero; los que esperan sin carpeta y lo de nadie, en «Por empezar»', async () => {
    await escribir('docs/estado.md', ESTADO(TABLA))
    await escribir('docs/README.md', '# Docs\n\n**Framework:** 2026-11-06\n')
    await escribir(
      'docs/trabajo.md',
      `${TRABAJO}
## T-5 — El diseño entero
Estado: pendiente · Fecha: 2026-11-06

## T-6 — Paleta nueva
Estado: pendiente · Frente: Diseño · Fecha: 2026-11-06

## T-7 — Una idea sin evaluar
Estado: nueva · Fecha: 2026-11-06

## T-8 — Ya hecho
Estado: hecho · Fecha: 2026-11-06

## T-9 — De un frente que no existe
Estado: pendiente · Frente: Nadie · Fecha: 2026-11-06
`,
    )
    await escribir('docs/modulos/skills/estado.md', SKILLS)
    await escribir('docs/modulos/pagos/estado.md', PAGOS)
    const m = mapaDe(await new Documentos().de(raiz), [])
    if (m.tipo !== 'mapa') throw new Error('sin mapa')
    // En operación, con frentes: no hay hitos (D-142).
    expect(m.hitos).toBeNull()
    expect(m.hito).toEqual({ numero: 10, nombre: 'Operación' })
    expect(m.frentes.map((f) => [f.clave, f.nombre, f.estado, f.documento])).toEqual([
      ['pagos', 'Pagos', 'en curso', 'docs/modulos/pagos/estado.md'],
      // Skills no cita su carpeta en la tabla, pero un módulo se llama igual.
      ['skills', 'Skills', 'en uso', 'docs/modulos/skills/estado.md'],
    ])
    // Sin ruta, todo su trabajo abierto (el nombre sin importar mayúsculas) está sin lugar.
    expect(m.frentes[0]?.sinLugar.map((t) => t.codigo)).toEqual(['T-1', 'T-2', 'T-4'])
    // Diseño espera sin carpeta: T-5 es el frente mismo; T-6, su paso. Avisos (en pausa, sin carpeta) no espera.
    expect(m.porEmpezar.frentes).toEqual([
      { nombre: 'Diseño', pasos: [{ codigo: 'T-6', titulo: 'Paleta nueva' }] },
    ])
    // Sin frente: lo abierto de nadie (o de un frente que no está), lo en curso primero; ni lo nuevo ni lo hecho.
    expect(m.porEmpezar.sinFrente).toEqual([
      { codigo: 'T-3', titulo: 'Del núcleo', enCurso: true },
      { codigo: 'T-9', titulo: 'De un frente que no existe', enCurso: false },
    ])
  })

  it('un módulo con carpeta que la tabla no nombra va al final, con el estado de sus pasos', async () => {
    await escribir('docs/estado.md', ESTADO('(ninguno)'))
    await escribir('docs/modulos/skills/estado.md', SKILLS)
    await escribir('docs/modulos/pagos/estado.md', PAGOS)
    const m = mapaDe(await new Documentos().de(raiz), [])
    if (m.tipo !== 'mapa') throw new Error('sin mapa')
    expect(m.frentes.map((f) => [f.clave, f.estado])).toEqual([
      ['pagos', 'en curso'],
      ['skills', 'en uso'],
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
