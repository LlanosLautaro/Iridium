// FS-I2: el motor del avance solo (frente Frentes, D-176, D-178). Las reglas (lo disponible, el horario, la fila), los
// pasos que salen de las rutas de un proyecto, y `AvanceSolo` con un reloj falso y `arranques.json` en una carpeta
// temporal: toma de a uno, en orden, no se pisa con nadie, no repite en 12 horas y anota lo gastado.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { AjusteAvance, UsoSuscripcion } from '../src/compartido/puente'
import { Arranque } from '../src/main/app/arranque'
import { AvanceSolo, type DependenciasAvance } from '../src/main/app/avance'
import { Documentos } from '../src/main/app/documentos'
import { pasosSolos } from '../src/main/app/mapa'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { paraElAviso } from '../src/main/core/arranque'
import {
  AJUSTE_AVANCE_INICIAL,
  cabe,
  disponible,
  elegirPaso,
  enHorario,
  NO_REPETIR_MS,
  type PasoSolo,
  puedeMirar,
  type RespuestasSolas,
  textoDe,
} from '../src/main/core/avance'
import { MENSAJE_SEGUI } from '../src/main/core/sesiones'
import { ArchivoArranques } from '../src/main/infra/arranques'

const MIN = 60_000
const HORA = 60 * MIN
const A_LAS_3 = new Date(2026, 10, 23, 3, 0).getTime()
const prendido: AjusteAvance = { ...AJUSTE_AVANCE_INICIAL, prendido: true }

const uso = (periodo: number | null, semana = 30): UsoSuscripcion => ({
  cincoHoras: {
    usado: periodo ?? 0,
    libera: periodo === null ? null : A_LAS_3 + 2 * HORA,
    agotada: false,
  },
  semana: { usado: semana, libera: null, agotada: false },
  ritmo: null,
  leido: A_LAS_3,
})

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
const respuestas = (cambio: Partial<RespuestasSolas> = {}): RespuestasSolas => ({
  ruta: 'C:\\P\\Beta',
  nombre: 'Beta',
  preguntas: ['Q-4'],
  desde: A_LAS_3 - HORA,
  ...cambio,
})

describe('cuánto puede usar (D-178 › 3)', () => {
  it('con el período abierto, lo que queda menos lo que deja libre; cerrado, todo', () => {
    expect(disponible(uso(25), prendido, A_LAS_3)).toBe(75)
    expect(disponible(uso(25), { ...prendido, libre: 20 }, A_LAS_3)).toBe(55)
    expect(disponible(uso(null), prendido, A_LAS_3)).toBe(100)
    // El vencimiento ya pasó: el período está cerrado aunque el uso viejo diga 80.
    expect(disponible(uso(80), prendido, A_LAS_3 + 3 * HORA)).toBe(100)
  })

  it('nada sin uso, con una ventana agotada o con la semana en su tope', () => {
    expect(disponible(null, prendido, A_LAS_3)).toBeNull()
    expect(
      disponible({ ...uso(10), semana: { usado: 50, libera: null, agotada: true } }, prendido, A_LAS_3),
    ).toBeNull()
    expect(disponible(uso(10, 80), { ...prendido, semana: 80 }, A_LAS_3)).toBeNull()
    expect(disponible(uso(10, 79), { ...prendido, semana: 80 }, A_LAS_3)).toBe(90)
  })

  it('lo grande con más de 70, lo mediano con más de 40, lo chico con algo; y solo los tamaños elegidos', () => {
    expect(cabe('grande', 71, prendido)).toBe(true)
    expect(cabe('grande', 70, prendido)).toBe(false)
    expect(cabe('mediano', 41, prendido)).toBe(true)
    expect(cabe('mediano', 40, prendido)).toBe(false)
    expect(cabe('chico', 1, prendido)).toBe(true)
    expect(cabe('chico', 0, prendido)).toBe(false)
    expect(cabe('grande', 100, { ...prendido, tamanos: ['chico'] })).toBe(false)
  })
})

describe('el horario', () => {
  const a = (h: number, m = 0) => new Date(2026, 10, 23, h, m).getTime()
  it('siempre, o de una hora a otra', () => {
    expect(enHorario(prendido, a(15))).toBe(true)
    const tarde = { ...prendido, horario: { desde: '14:00', hasta: '18:30' } }
    expect(enHorario(tarde, a(14))).toBe(true)
    expect(enHorario(tarde, a(18, 29))).toBe(true)
    expect(enHorario(tarde, a(18, 30))).toBe(false)
    expect(enHorario(tarde, a(9))).toBe(false)
  })
  it('cruzando la medianoche: de 23:00 a 7:00', () => {
    const noche = { ...prendido, horario: { desde: '23:00', hasta: '07:00' } }
    expect(enHorario(noche, a(23, 30))).toBe(true)
    expect(enHorario(noche, a(3))).toBe(true)
    expect(enHorario(noche, a(7))).toBe(false)
    expect(enHorario(noche, a(12))).toBe(false)
  })
})

describe('las condiciones baratas', () => {
  const base = { ajuste: prendido, ahora: A_LAS_3, segundosSinUsar: 11 * 60, trabajando: 0, uso: uso(10) }
  it('prendido, sin usar los minutos elegidos, nadie trabajando y con lugar', () => {
    expect(puedeMirar(base)).toBe(true)
    expect(puedeMirar({ ...base, ajuste: AJUSTE_AVANCE_INICIAL })).toBe(false)
    expect(puedeMirar({ ...base, segundosSinUsar: 9 * 60 })).toBe(false)
    expect(puedeMirar({ ...base, trabajando: 1 })).toBe(false)
    expect(puedeMirar({ ...base, ajuste: { ...prendido, libre: 90 } })).toBe(false)
    expect(puedeMirar({ ...base, ajuste: { ...prendido, tamanos: [] } })).toBe(false)
    // Sin el uso conocido, se mira igual: lo lee después.
    expect(puedeMirar({ ...base, uso: null })).toBe(true)
    // Las pruebas cambian los minutos por segundos.
    expect(puedeMirar({ ...base, segundosSinUsar: 3, sinUsarS: 2 })).toBe(true)
  })
})

describe('la fila (D-176, D-178 › 4)', () => {
  it('primero las respuestas de la Bandeja, la más vieja', () => {
    const e = elegirPaso(
      [respuestas(), respuestas({ ruta: 'C:\\P\\Gamma', nombre: 'Gamma', desde: A_LAS_3 - 5 * HORA })],
      [paso()],
      100,
      prendido,
      new Set(),
    )
    expect(e).toEqual({ tipo: 'bandeja', candidato: expect.objectContaining({ nombre: 'Gamma' }) })
    expect(textoDe(e as NonNullable<typeof e>)).toBe(MENSAJE_SEGUI)
  })

  it('después, el paso chico del frente que hace más que no se toca', () => {
    const viejo = paso({
      frente: 'Ideas',
      carpeta: 'ideas',
      texto: 'Ordenar',
      actualizado: A_LAS_3 - 9 * 24 * HORA,
    })
    const e = elegirPaso(
      [],
      [paso(), viejo, paso({ tamano: 'mediano', enCurso: true, texto: 'Otro' })],
      100,
      prendido,
      new Set(),
    )
    expect(e).toEqual({ tipo: 'paso', paso: viejo })
    expect(textoDe(e as NonNullable<typeof e>)).toBe(
      'Avance solo: seguí con «Ordenar» del frente Ideas (`docs/modulos/ideas/estado.md`, línea 20, chico).',
    )
  })

  it('después, del frente en curso, el primer paso que cabe', () => {
    const grande = paso({ tamano: 'grande', enCurso: true, texto: 'El motor' })
    const mediano = paso({ tamano: 'mediano', enCurso: true, texto: 'El aviso' })
    // Un mediano de un frente que no está en curso no entra.
    const otro = paso({ tamano: 'mediano', texto: 'Lejos' })
    expect(elegirPaso([], [otro, grande, mediano], 100, prendido, new Set())).toEqual({
      tipo: 'paso',
      paso: grande,
    })
    expect(elegirPaso([], [otro, grande, mediano], 60, prendido, new Set())).toEqual({
      tipo: 'paso',
      paso: mediano,
    })
    expect(elegirPaso([], [otro, grande, mediano], 30, prendido, new Set())).toBeNull()
  })

  it('no repite lo que tomó hace poco: pasa al siguiente', () => {
    const r = respuestas()
    const e = elegirPaso([r], [paso()], 100, prendido, new Set([`${r.ruta}|bandeja|Q-4`]))
    expect(e).toEqual({ tipo: 'paso', paso: paso() })
    // Una respuesta nueva en el mismo proyecto es trabajo nuevo.
    expect(
      elegirPaso(
        [respuestas({ preguntas: ['Q-4', 'Q-5'] })],
        [],
        100,
        prendido,
        new Set([`${r.ruta}|bandeja|Q-4`]),
      ),
    ).toEqual({ tipo: 'bandeja', candidato: expect.anything() })
  })

  it('sin chicos elegidos, ni la Bandeja ni lo chico', () => {
    const solo = { ...prendido, tamanos: ['grande' as const] }
    expect(elegirPaso([respuestas()], [paso(), paso({ enCurso: true })], 100, solo, new Set())).toBeNull()
  })
})

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'iridium-fs2-'))
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

const escribir = async (relativa: string, texto: string) => {
  const archivo = join(dir, relativa)
  await mkdir(dirname(archivo), { recursive: true })
  await writeFile(archivo, texto)
}

describe('los pasos de un proyecto', () => {
  it('los `[ ]` con `sola` y tamaño, también en ramas, sin preguntas abiertas ni frentes hechos', async () => {
    await escribir('docs/README.md', '# Docs\n\n**Framework:** 2026-11-17\n')
    await escribir(
      'docs/estado.md',
      '# Estado\n\n## Hito actual\n10 — Operación — en curso\n\n## Módulos\n| Frente | Tipo | Paso | Estado |\n|---|---|---|---|\n' +
        '| Apariencia (`modulos/apariencia/estado.md`) | sección | 7 | en curso |\n' +
        '| Notas (`modulos/notas/estado.md`) | sección | 9 | hecho |\n\n' +
        '## Preguntas abiertas\n- **Q-9 — ¿Cuál?**\n  Tipo: decisión\n  Opciones: A) Uno · B) Otro\n\n## Próximo paso\nSeguir.\n',
    )
    await escribir(
      'docs/modulos/apariencia/estado.md',
      '# Estado del módulo: Apariencia\n\n**Última actualización:** 2026-11-20\n\n## Ruta\n' +
        '- [x] Elegir los colores (chico, sola)\n' +
        '- [ ] Cargar el tema propio (T-75, mediano, sola)\n' +
        '  - [ ] Probarlo en el celular (chico, sola)\n' +
        '- [ ] Elegir la fuente (Q-9, chico, sola)\n' +
        '- [ ] Medir su calidad (mediano)\n',
    )
    await escribir(
      'docs/modulos/notas/estado.md',
      '# Estado del módulo: Notas\n\n## Ruta\n- [ ] Una más (chico, sola)\n',
    )
    const pasos = pasosSolos(await new Documentos().de(dir), await leerPreguntasAbiertas(dir), {
      ruta: dir,
      nombre: 'Alfa',
    })
    expect(pasos).toEqual([
      {
        ruta: dir,
        proyecto: 'Alfa',
        frente: 'Apariencia',
        carpeta: 'apariencia',
        texto: 'Cargar el tema propio',
        tamano: 'mediano',
        linea: 7,
        enCurso: true,
        actualizado: new Date(2026, 10, 20).getTime(),
      },
      expect.objectContaining({ texto: 'Probarlo en el celular', tamano: 'chico', linea: 8 }),
    ])
  })
})

describe('AvanceSolo', () => {
  function armar(cambio: Partial<DependenciasAvance> = {}) {
    let ahora = A_LAS_3
    const trabajando = new Set<string>()
    const arrancados: { ruta: string; marca: number; texto: string | null }[] = []
    let usado = 10
    const archivo = new ArchivoArranques(join(dir, 'arranques.json'))
    const a = new AvanceSolo({
      ajuste: async () => prendido,
      apagados: async () => ({ proyectos: [], frentes: [] }),
      usoActual: () => uso(usado),
      leerUso: async () => uso(usado),
      bandeja: async () => [],
      pasos: async () => [paso(), paso({ texto: 'Segundo', linea: 21 })],
      enMarcha: () => [...trabajando],
      sesionLista: async () => true,
      arrancar: async (ruta, marca, texto) => {
        arrancados.push({ ruta, marca, texto })
        trabajando.add(ruta)
      },
      archivo,
      segundosSinUsar: () => 20 * 60,
      ahora: () => ahora,
      ...cambio,
    })
    return {
      a,
      archivo,
      arrancados,
      trabajando,
      pasar: (ms: number) => {
        ahora += ms
      },
      gastar: (n: number) => {
        usado += n
      },
    }
  }

  it('toma un paso, espera a que termine, anota lo gastado y sigue con el siguiente', async () => {
    const { a, archivo, arrancados, trabajando, pasar, gastar } = armar()
    await a.mirar()
    expect(arrancados).toEqual([
      {
        ruta: 'C:\\P\\Alfa',
        marca: A_LAS_3,
        texto: expect.stringContaining('«Cargar el tema propio» del frente Apariencia'),
      },
    ])
    let { momentos } = await archivo.leer()
    expect(momentos).toEqual([
      expect.objectContaining({
        cuando: A_LAS_3,
        momento: 'avance',
        resultado: 'arranco',
        proyecto: { ruta: 'C:\\P\\Alfa', nombre: 'Alfa', preguntas: [] },
        paso: {
          frente: 'Apariencia',
          carpeta: 'apariencia',
          texto: 'Cargar el tema propio',
          tamano: 'chico',
          linea: 20,
        },
        uso: { antes: { periodo: 10, semana: 30 }, despues: null },
      }),
    ])
    // Mientras trabaja, no toma otro: nunca dos a la vez.
    pasar(MIN)
    await a.mirar()
    expect(arrancados).toHaveLength(1)
    // Terminó: anota lo gastado y, con todo igual, sigue con el siguiente (el primero ya se tomó).
    gastar(12)
    trabajando.clear()
    pasar(MIN)
    await a.mirar()
    ;({ momentos } = await archivo.leer())
    expect(momentos[0]?.uso).toEqual({
      antes: { periodo: 10, semana: 30 },
      despues: { periodo: 22, semana: 30 },
    })
    expect(arrancados.map((x) => x.texto)).toEqual([
      expect.stringContaining('Cargar el tema propio'),
      expect.stringContaining('«Segundo»'),
    ])
  })

  it('con el usuario delante, otra IA trabajando o apagado, no toma nada', async () => {
    const delante = armar({ segundosSinUsar: () => 60 })
    await delante.a.mirar()
    expect(delante.arrancados).toEqual([])

    const ocupada = armar()
    ocupada.trabajando.add('C:\\P\\Gamma')
    await ocupada.a.mirar()
    expect(ocupada.arrancados).toEqual([])

    const apagado = armar({ ajuste: async () => AJUSTE_AVANCE_INICIAL })
    await apagado.a.mirar()
    expect(apagado.arrancados).toEqual([])

    const sinSesion = armar({ sesionLista: async () => false })
    await sinSesion.a.mirar()
    expect(sinSesion.arrancados).toEqual([])
    expect((await sinSesion.archivo.leer()).momentos).toEqual([])
  })

  it('no toma lo de un proyecto o un frente apagado', async () => {
    const { a, arrancados } = armar({
      apagados: async () => ({
        proyectos: ['C:\\P\\Beta'],
        frentes: [{ ruta: 'C:\\P\\Alfa', carpeta: 'apariencia' }],
      }),
      bandeja: async () => [respuestas()],
      pasos: async () => [paso(), paso({ frente: 'Ideas', carpeta: 'ideas', texto: 'Ordenar' })],
    })
    await a.mirar()
    expect(arrancados).toEqual([
      { ruta: 'C:\\P\\Alfa', marca: A_LAS_3, texto: expect.stringContaining('«Ordenar»') },
    ])
  })

  it('las respuestas de la Bandeja van con «Continúa con el proyecto.» (sin texto propio)', async () => {
    const { a, arrancados, archivo } = armar({ bandeja: async () => [respuestas()] })
    await a.mirar()
    expect(arrancados).toEqual([{ ruta: 'C:\\P\\Beta', marca: A_LAS_3, texto: null }])
    const [r] = (await archivo.leer()).momentos
    expect(r?.paso).toBeUndefined()
    expect(r?.proyecto).toEqual({ ruta: 'C:\\P\\Beta', nombre: 'Beta', preguntas: ['Q-4'] })
  })

  it('un paso que tomó y sigue sin hacer no se repite en 12 horas; después, sí', async () => {
    const { a, arrancados, trabajando, pasar } = armar({ pasos: async () => [paso()] })
    await a.mirar()
    trabajando.clear()
    pasar(HORA)
    await a.mirar()
    expect(arrancados).toHaveLength(1)
    pasar(NO_REPETIR_MS)
    await a.mirar()
    expect(arrancados).toHaveLength(2)
  })

  it('lo grande, solo con el período casi entero', async () => {
    const grande = paso({ tamano: 'grande', enCurso: true })
    const medio = armar({
      pasos: async () => [grande],
      usoActual: () => uso(50),
      leerUso: async () => uso(50),
    })
    await medio.a.mirar()
    expect(medio.arrancados).toEqual([])
    const cerrado = armar({
      pasos: async () => [grande],
      usoActual: () => uso(null),
      leerUso: async () => uso(null),
    })
    await cerrado.a.mirar()
    expect(cerrado.arrancados).toHaveLength(1)
  })

  describe('los casos raros (paso 8)', () => {
    it('sin nada para tomar, no lee el uso: leerlo abre Claude Code y miraría cada minuto toda la noche', async () => {
      let lecturas = 0
      const nada = armar({
        pasos: async () => [],
        leerUso: async () => {
          lecturas++
          return uso(10)
        },
      })
      for (let i = 0; i < 5; i++) {
        await nada.a.mirar()
        nada.pasar(MIN)
      }
      expect(lecturas).toBe(0)
      // Sin el uso conocido, con algo para tomar, lo lee una vez y arranca.
      const sinUso = armar({
        usoActual: () => null,
        leerUso: async () => {
          lecturas++
          return uso(10)
        },
      })
      await sinUso.a.mirar()
      expect(lecturas).toBe(1)
      expect(sinUso.arrancados).toHaveLength(1)
    })

    it('si el uso no se puede leer, no toma nada ni anota; al minuto siguiente, sí', async () => {
      let leido: UsoSuscripcion | null = null
      const { a, arrancados, archivo, pasar } = armar({ leerUso: async () => leido })
      await a.mirar()
      expect(arrancados).toEqual([])
      expect((await archivo.leer()).momentos).toEqual([])
      leido = uso(10)
      pasar(MIN)
      await a.mirar()
      expect(arrancados).toHaveLength(1)
    })

    it('el uso releído manda: con el período más gastado de lo que se sabía, lo mediano no arranca', async () => {
      const { a, arrancados } = armar({
        pasos: async () => [paso({ tamano: 'mediano', enCurso: true })],
        usoActual: () => uso(10),
        leerUso: async () => uso(70),
      })
      await a.mirar()
      expect(arrancados).toEqual([])
    })

    it('si el usuario vuelve mientras arma la fila, no arranca', async () => {
      let veces = 0
      const { a, arrancados } = armar({ segundosSinUsar: () => (veces++ === 0 ? 20 * 60 : 5) })
      await a.mirar()
      expect(arrancados).toEqual([])
    })

    it('dos miradas a la vez arrancan una sola conversación', async () => {
      const { a, arrancados } = armar()
      await Promise.all([a.mirar(), a.mirar(), a.mirar()])
      expect(arrancados).toHaveLength(1)
    })

    it('si abrir la conversación falla, lo dice el registro y no insiste con ese paso: sigue con otro', async () => {
      const registro: string[] = []
      const intentos: string[] = []
      const { a, archivo, pasar } = armar({
        arrancar: async (_ruta, _marca, texto) => {
          intentos.push(texto ?? '')
          throw new Error('sin red')
        },
        registrar: (t) => registro.push(t),
      })
      await a.mirar()
      expect(registro).toContainEqual(expect.stringContaining('no se pudo abrir la conversación: sin red'))
      pasar(MIN)
      await a.mirar()
      pasar(MIN)
      await a.mirar()
      expect(intentos).toEqual([
        expect.stringContaining('Cargar el tema propio'),
        expect.stringContaining('«Segundo»'),
      ])
      // Lo anotó igual: el aviso al volver lo cuenta (sin conversación guardada, «falló»).
      expect((await archivo.leer()).momentos).toHaveLength(2)
    })

    it('la semana que llega a su tope mientras trabaja frena el siguiente', async () => {
      let semana = 30
      const { a, arrancados, trabajando, pasar } = armar({
        ajuste: async () => ({ ...prendido, semana: 50 }),
        usoActual: () => uso(10, semana),
        leerUso: async () => uso(10, semana),
      })
      await a.mirar()
      semana = 50
      trabajando.clear()
      pasar(MIN)
      await a.mirar()
      expect(arrancados).toHaveLength(1)
    })

    it('con el horario de 23:00 a 7:00, a las 7 no toma el siguiente aunque haya lugar', async () => {
      const noche = { ...prendido, horario: { desde: '23:00', hasta: '07:00' } }
      const { a, arrancados, trabajando, pasar } = armar({ ajuste: async () => noche })
      await a.mirar()
      trabajando.clear()
      pasar(4 * HORA)
      await a.mirar()
      expect(arrancados).toHaveLength(1)
    })
  })
})

describe('el aviso al volver (FS-5)', () => {
  it('lo del avance entra siempre, con el paso; lo de la Bandeja, como el Arranque', async () => {
    const archivo = new ArchivoArranques(join(dir, 'arranques.json'))
    const base = { resultado: 'arranco' as const, momento: 'avance' as const, sinUsarIridium: 60 }
    await archivo.anotar({
      ...base,
      cuando: A_LAS_3,
      proyecto: { ruta: 'C:\\P\\Alfa', nombre: 'Alfa', preguntas: [] },
      paso: {
        frente: 'Apariencia',
        carpeta: 'apariencia',
        texto: 'Cargar el tema propio',
        tamano: 'chico',
        linea: 20,
      },
      uso: { antes: { periodo: 10, semana: 30 }, despues: null },
    })
    await archivo.anotar({
      ...base,
      cuando: A_LAS_3 + HORA,
      proyecto: { ruta: 'C:\\P\\Beta', nombre: 'Beta', preguntas: ['Q-4'] },
    })
    expect(paraElAviso((await archivo.leer()).momentos, null)).toHaveLength(2)
    const arranque = new Arranque({
      ajuste: async () => ({ prendido: false, hora: '03:00' }),
      usoActual: () => null,
      leerUso: async () => null,
      candidatos: async () => [],
      sesionLista: async () => true,
      arrancar: async () => {},
      archivo,
      segundosSinUsar: () => 0,
      conversacion: async () => ({
        estado: 'terminada',
        preguntas: [],
        frenan: 0,
        trabajando: false,
        guardada: true,
      }),
    })
    const { aviso } = await arranque.estado()
    expect(aviso.map((r) => r.avance)).toEqual([
      { frente: 'Apariencia', texto: 'Cargar el tema propio' },
      null,
    ])
    expect(aviso[0]?.proyecto).toEqual(expect.objectContaining({ nombre: 'Alfa', estado: 'terminada' }))
  })
})
