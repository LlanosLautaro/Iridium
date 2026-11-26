// FS-I4 (D-193): el avance solo revisa ideas y frentes, toma los trabajos del Núcleo con `Tamaño: …, sola` y no toca
// un frente en pausa. Las reglas de la fila, lo que se lee de un proyecto en disco, el control de `Tamaño:` y
// `AvanceSolo` con un reloj falso: la revisión va después de la Bandeja, una por día y proyecto.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { AjusteAvance, UsoSuscripcion } from '../src/compartido/puente'
import { AvanceSolo } from '../src/main/app/avance'
import { Documentos } from '../src/main/app/documentos'
import { pasosSolos, revisionDe } from '../src/main/app/mapa'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import {
  AJUSTE_AVANCE_INICIAL,
  elegirPaso,
  type PasoSolo,
  type RespuestasSolas,
  type RevisionSola,
  TEXTO_REVISION,
  textoDe,
} from '../src/main/core/avance'
import { reglaTrabajo } from '../src/main/core/control/trabajo'
import { leerTrabajo } from '../src/main/core/trabajo'
import { ArchivoArranques } from '../src/main/infra/arranques'

const MIN = 60_000
const HORA = 60 * MIN
const A_LAS_3 = new Date(2026, 10, 25, 3, 0).getTime()
const prendido: AjusteAvance = { ...AJUSTE_AVANCE_INICIAL, prendido: true }

const uso: UsoSuscripcion = {
  cincoHoras: { usado: 10, libera: A_LAS_3 + 2 * HORA, agotada: false },
  semana: { usado: 30, libera: null, agotada: false },
  ritmo: null,
  leido: A_LAS_3,
}

const paso = (cambio: Partial<PasoSolo> = {}): PasoSolo => ({
  ruta: 'C:\\P\\Alfa',
  proyecto: 'Alfa',
  frente: 'Apariencia',
  carpeta: 'apariencia',
  texto: 'Cargar el tema propio',
  tamano: 'chico',
  linea: 20,
  enCurso: false,
  actualizado: A_LAS_3 - 24 * HORA,
  ...cambio,
})
const revision = (cambio: Partial<RevisionSola> = {}): RevisionSola => ({
  ruta: 'C:\\P\\Alfa',
  nombre: 'Alfa',
  ideas: ['T-7'],
  pasos: [],
  nucleo: [],
  sinPasos: [],
  ...cambio,
})
const respuestas: RespuestasSolas = {
  ruta: 'C:\\P\\Beta',
  nombre: 'Beta',
  preguntas: ['Q-4'],
  desde: A_LAS_3 - HORA,
}

describe('`Tamaño:` en los trabajos del Núcleo', () => {
  const trabajo =
    '# Trabajo\n\n' +
    '## T-1 — Algo chico\nEstado: pendiente · Fecha: 2026-11-20 · Tamaño: chico, sola\n\n' +
    '## T-2 — Algo mediano\nEstado: pendiente · Fecha: 2026-11-20 · Tamaño: mediano\n\n' +
    '## T-3 — Mal escrito\nEstado: pendiente · Fecha: 2026-11-20 · Tamaño: chica\n\n' +
    '## T-4 — De un frente\nEstado: pendiente · Frente: Apariencia · Fecha: 2026-11-20 · Tamaño: chico\n'

  it('se lee el tamaño y si va sola', () => {
    const items = leerTrabajo(trabajo).items
    expect(items.map((i) => [i.codigo, i.tamano, i.sola])).toEqual([
      ['T-1', 'chico', true],
      ['T-2', 'mediano', false],
      ['T-3', null, false],
      ['T-4', 'chico', false],
    ])
  })

  it('el control avisa uno mal escrito y uno de un frente (va en su ruta)', () => {
    const avisos = reglaTrabajo({
      estados: [],
      trabajo,
      respuestas: new Map(),
      documentos: [],
      frentes: [{ carpeta: 'apariencia', nombre: 'Apariencia' }],
    }).map((a) => a.texto)
    expect(avisos).toEqual([
      expect.stringContaining('T-3: «Tamaño: chica» no se entiende'),
      expect.stringContaining('T-4: el tamaño de un trabajo de un frente va en la ruta de su frente'),
    ])
  })
})

describe('la fila con la revisión (D-193)', () => {
  it('después de la Bandeja y antes de lo chico', () => {
    const r = revision()
    const p = paso()
    expect(elegirPaso([respuestas], [p], 50, prendido, new Set(), [r])).toMatchObject({ tipo: 'bandeja' })
    expect(elegirPaso([], [p], 50, prendido, new Set(), [r])).toEqual({ tipo: 'revision', revision: r })
    // Ya revisado (en el día): sigue con el paso.
    expect(elegirPaso([], [p], 50, prendido, new Set([`C:\\P\\Alfa||${TEXTO_REVISION}`]), [r])).toEqual({
      tipo: 'paso',
      paso: p,
    })
  })

  it('sin nada para revisar no revisa: un frente sin pasos solo no la pide', () => {
    const vacia = revision({ ideas: [], sinPasos: ['Diseño'] })
    expect(elegirPaso([], [], 50, prendido, new Set(), [vacia])).toBeNull()
  })

  it('sin chicos elegidos en Ajustes, no revisa', () => {
    expect(elegirPaso([], [], 100, { ...prendido, tamanos: ['grande'] }, new Set(), [revision()])).toBeNull()
  })

  it('el mensaje nombra lo que hay para revisar; el de un trabajo del Núcleo, su código', () => {
    const texto = textoDe({
      tipo: 'revision',
      revision: revision({
        ideas: ['T-7', 'T-8'],
        pasos: [{ frente: 'Orden', cuantos: 2 }],
        nucleo: ['T-3'],
        sinPasos: ['Diseño'],
      }),
    })
    expect(texto).toBe(
      'Avance solo: revisión. Revisá, sin hacer el trabajo, ideas nuevas sin evaluar: T-7, T-8; pasos sin tamaño ' +
        'en Orden (2); trabajos del Núcleo sin tamaño: T-3; frentes sin nada por hacer en su ruta: Diseño.',
    )
    expect(
      textoDe({ tipo: 'paso', paso: paso({ frente: 'Núcleo', carpeta: '', codigo: 'T-1', texto: 'Algo' }) }),
    ).toBe('Avance solo: seguí con T-1 «Algo» del Núcleo (`docs/trabajo.md`, chico).')
  })
})

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'iridium-fs4-'))
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

const escribir = async (relativa: string, texto: string) => {
  const archivo = join(dir, relativa)
  await mkdir(dirname(archivo), { recursive: true })
  await writeFile(archivo, texto)
}

describe('lo que se lee de un proyecto', () => {
  beforeEach(async () => {
    await escribir('docs/README.md', '# Docs\n\n**Framework:** 2026-11-17\n')
    await escribir(
      'docs/estado.md',
      '# Estado\n\n## Hito actual\n10 — Operación — en curso\n\n## Módulos\n| Frente | Tipo | Paso | Estado |\n|---|---|---|---|\n' +
        '| Apariencia (`modulos/apariencia/estado.md`) | sección | 7 | en curso |\n' +
        '| Orden (`modulos/orden/estado.md`) | sección | 8 | pendiente |\n' +
        '| Diseño (`modulos/diseno/estado.md`) | sección | 7 | en curso |\n' +
        '| Abrir (`modulos/abrir/estado.md`) | sección | 7 | en pausa |\n' +
        '| Skills (`modulos/skills/estado.md`) | sección | 9 | hecho |\n' +
        '| Notas (`modulos/notas/estado.md`) | sección | 9 | hecho |\n\n' +
        '## Preguntas abiertas\nNinguna.\n\n## Próximo paso\nSeguir.\n',
    )
    await escribir(
      'docs/modulos/apariencia/estado.md',
      '# Estado del módulo: Apariencia\n\n**Última actualización:** 2026-11-20\n\n## Ruta\n' +
        '- [x] Elegir los colores (chico, sola)\n' +
        '- [ ] Cargar el tema propio (T-75, mediano, sola)\n' +
        '- [ ] Medir su calidad\n',
    )
    await escribir(
      'docs/modulos/orden/estado.md',
      '# Estado del módulo: Orden\n\n## Ruta\n- [ ] Medir Orden\n  - [ ] Los tiempos\n- [ ] La corrida (chico, sola)\n',
    )
    await escribir(
      'docs/modulos/diseno/estado.md',
      '# Estado del módulo: Diseño\n\n## Ruta\n- [x] Todo lo de antes\n',
    )
    await escribir(
      'docs/modulos/abrir/estado.md',
      '# Estado del módulo: Abrir\n\n## Ruta\n- [ ] Revisar Ejecutar\n- [ ] Lo de la otra PC (chico, sola)\n',
    )
    await escribir(
      'docs/modulos/skills/estado.md',
      '# Estado del módulo: Skills\n\n## Ruta\n- [x] Lo hecho\n- [ ] Traer las skills (T-44)\n',
    )
    await escribir('docs/modulos/notas/estado.md', '# Estado del módulo: Notas\n\n## Ruta\n- [x] Todo\n')
    await escribir(
      'docs/trabajo.md',
      '# Trabajo\n\n' +
        '## T-1 — Pruebas lentas\nEstado: pendiente · Fecha: 2026-11-20 · Tamaño: chico, sola\nDarles más tiempo.\n\n' +
        '## T-2 — Parches\nEstado: pendiente · Fecha: 2026-11-19\n\n' +
        '## T-3 — Una idea\nEstado: nueva · Idea: usuario · Fecha: 2026-11-24\n\n' +
        '## T-4 — Otra idea\nEstado: nueva · Idea: usuario · Fecha: 2026-11-24\nEvaluada el 2026-11-25: chica, de Apariencia.\n\n' +
        '## T-5 — Hecha\nEstado: hecho · Fecha: 2026-11-01 · Tamaño: chico, sola\n\n' +
        '## T-6 — Del frente\nEstado: pendiente · Frente: Orden · Fecha: 2026-11-19\n',
    )
  })

  it('para revisar: las ideas sin evaluar, los pasos sin tamaño, el Núcleo sin tamaño y los frentes vacíos; nada de lo en pausa', async () => {
    expect(revisionDe(await new Documentos().de(dir), { ruta: dir, nombre: 'Alfa' })).toEqual({
      ruta: dir,
      nombre: 'Alfa',
      ideas: ['T-3'],
      pasos: [
        { frente: 'Apariencia', cuantos: 1 },
        { frente: 'Orden', cuantos: 2 },
        // Un frente hecho con algo por hacer también; uno hecho sin nada, no es un frente vacío.
        { frente: 'Skills', cuantos: 1 },
      ],
      nucleo: ['T-2'],
      sinPasos: ['Diseño'],
    })
  })

  it('de a 10 ideas y 10 trabajos del Núcleo por vez, los más viejos', async () => {
    const muchas = Array.from(
      { length: 12 },
      (_, i) =>
        `## T-${i + 10} — Idea ${i}\nEstado: nueva · Fecha: 2026-11-24\n\n` +
        `## T-${i + 30} — Trabajo ${i}\nEstado: pendiente · Fecha: 2026-11-24\n`,
    )
    await escribir('docs/trabajo.md', `# Trabajo\n\n${muchas.join('\n')}`)
    const r = revisionDe(await new Documentos().de(dir), { ruta: dir, nombre: 'Alfa' })
    expect(r.ideas).toEqual(Array.from({ length: 10 }, (_, i) => `T-${i + 10}`))
    expect(r.nucleo).toEqual(Array.from({ length: 10 }, (_, i) => `T-${i + 30}`))
  })

  it('los pasos que toma: los de los frentes que no están en pausa (también por empezar) y los del Núcleo con `sola`', async () => {
    const pasos = pasosSolos(await new Documentos().de(dir), await leerPreguntasAbiertas(dir), {
      ruta: dir,
      nombre: 'Alfa',
    })
    expect(pasos.map((p) => [p.frente, p.texto, p.tamano, p.enCurso, p.codigo])).toEqual([
      ['Apariencia', 'Cargar el tema propio', 'mediano', true, undefined],
      ['Orden', 'La corrida', 'chico', false, undefined],
      ['Núcleo', 'Pruebas lentas', 'chico', false, 'T-1'],
    ])
    expect(pasos[2]).toMatchObject({ carpeta: '', linea: 3, actualizado: new Date(2026, 10, 20).getTime() })
  })
})

describe('AvanceSolo con la revisión', () => {
  function armar(revisiones: RevisionSola[], pasos: PasoSolo[] = []) {
    let ahora = A_LAS_3
    const trabajando = new Set<string>()
    const arrancados: (string | null)[] = []
    const archivo = new ArchivoArranques(join(dir, 'arranques.json'))
    const a = new AvanceSolo({
      ajuste: async () => prendido,
      apagados: async () => ({ proyectos: ['C:\\P\\Apagado'], frentes: [] }),
      usoActual: () => uso,
      leerUso: async () => uso,
      bandeja: async () => [],
      pasos: async () => pasos,
      revisiones: async () => revisiones,
      enMarcha: () => [...trabajando],
      sesionLista: async () => true,
      arrancar: async (ruta, _marca, texto) => {
        arrancados.push(texto)
        trabajando.add(ruta)
      },
      archivo,
      segundosSinUsar: () => 20 * 60,
      ahora: () => ahora,
    })
    return {
      a,
      archivo,
      arrancados,
      terminar: () => trabajando.clear(),
      pasar: (ms: number) => {
        ahora += ms
      },
    }
  }

  it('revisa, lo anota como un paso chico y no vuelve a revisar ese proyecto hasta el otro día', async () => {
    const { a, archivo, arrancados, terminar, pasar } = armar([revision()], [paso()])
    await a.mirar()
    expect(arrancados).toEqual([
      expect.stringContaining('Avance solo: revisión. Revisá, sin hacer el trabajo'),
    ])
    expect((await archivo.leer()).momentos[0]).toMatchObject({
      proyecto: { ruta: 'C:\\P\\Alfa', nombre: 'Alfa', preguntas: [] },
      paso: { frente: 'Revisión', carpeta: '', texto: TEXTO_REVISION, tamano: 'chico' },
    })
    // Terminó, pero la IA no evaluó la idea: a las 13 horas no revisa de nuevo, toma el paso.
    terminar()
    pasar(13 * HORA)
    await a.mirar()
    expect(arrancados[1]).toContain('«Cargar el tema propio»')
    // Al otro día, sí.
    terminar()
    pasar(12 * HORA)
    await a.mirar()
    expect(arrancados[2]).toContain('Avance solo: revisión')
  })

  it('no revisa un proyecto apagado', async () => {
    const { a, arrancados } = armar([revision({ ruta: 'C:\\P\\Apagado' })])
    await a.mirar()
    expect(arrancados).toEqual([])
  })
})
