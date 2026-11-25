// AR-I2: contar lo que hizo el arranque (frente Arranque, D-149 › 7 y 8). Qué entra al aviso al volver, lo que se
// manda a la ventana (la semana, el aviso y cómo va cada conversación), Listo, y la marca de la conversación arrancada.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CambioConversacion, UsoSuscripcion } from '../src/compartido/puente'
import { Arranque, type ConversacionArrancada, type DependenciasArranque } from '../src/main/app/arranque'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { paraElAviso, SIN_USAR_PARA_EL_AVISO_S } from '../src/main/core/arranque'
import { ArchivoArranques, type RenglonArranque } from '../src/main/infra/arranques'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { crearMotorFalso } from '../src/main/motor/motor'

const MIN = 60_000
const HORA = 60 * MIN
const A_LAS_3 = new Date(2026, 10, 19, 3, 2).getTime()
const ALFA = 'C:\\P\\Alfa'
const BETA = 'C:\\P\\Beta'

const renglon = (cuando: number, cambio: Partial<RenglonArranque> = {}): RenglonArranque => ({
  cuando,
  momento: 'hora',
  resultado: 'nada-listo',
  sinUsarIridium: 4 * 3600,
  ...cambio,
})
const arranco = (cuando: number, ruta: string, nombre: string, sinUsar = 4 * 3600): RenglonArranque =>
  renglon(cuando, {
    resultado: 'arranco',
    proyecto: { ruta, nombre, preguntas: ['Q-1'] },
    sinUsarIridium: sinUsar,
  })

describe('lo que entra al aviso al volver', () => {
  it('lo que arrancó o no pudo, con Iridium sin usar hace 5 minutos o más, que no se mostró, del más viejo al más nuevo', () => {
    const momentos = [
      arranco(A_LAS_3 + 5 * HORA, BETA, 'Beta'),
      arranco(A_LAS_3, ALFA, 'Alfa'),
      // El usuario estaba delante: lo vio en la pestaña.
      arranco(A_LAS_3 + 6 * HORA, ALFA, 'Alfa', 60),
      // «Nada listo» y «período abierto» van solo al detalle del uso.
      renglon(A_LAS_3 + HORA, { resultado: 'nada-listo' }),
      renglon(A_LAS_3 + 2 * HORA, { resultado: 'periodo-abierto' }),
      renglon(A_LAS_3 + 3 * HORA, { resultado: 'semana' }),
      renglon(A_LAS_3 + 4 * HORA, { resultado: 'sin-sesion', sinUsarIridium: SIN_USAR_PARA_EL_AVISO_S }),
    ]
    expect(paraElAviso(momentos, null).map((m) => m.cuando)).toEqual([
      A_LAS_3,
      A_LAS_3 + 3 * HORA,
      A_LAS_3 + 4 * HORA,
      A_LAS_3 + 5 * HORA,
    ])
    // Listo hasta las 7:02: queda lo de después.
    expect(paraElAviso(momentos, A_LAS_3 + 4 * HORA).map((m) => m.cuando)).toEqual([A_LAS_3 + 5 * HORA])
  })
})

let datos: string
beforeEach(async () => {
  datos = await mkdtemp(join(tmpdir(), 'iridium-arranque2-'))
})
afterEach(async () => {
  vi.useRealTimers()
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

const sinPeriodo: UsoSuscripcion = {
  cincoHoras: { usado: 0, libera: null, agotada: false },
  semana: { usado: 40, libera: null, agotada: false },
  ritmo: null,
  leido: 0,
}

function armar(cambio: Partial<DependenciasArranque> = {}) {
  const archivo = new ArchivoArranques(join(datos, 'arranques.json'))
  const a = new Arranque({
    ajuste: async () => ({ prendido: true, hora: '03:00' }),
    usoActual: () => sinPeriodo,
    leerUso: async () => sinPeriodo,
    candidatos: async () => [],
    sesionLista: async () => true,
    arrancar: async () => {},
    archivo,
    segundosSinUsar: () => 4 * 3600,
    ...cambio,
  })
  return { a, archivo }
}

describe('lo que va a la ventana', () => {
  it('la semana, el más nuevo primero; el aviso, con cómo va cada conversación', async () => {
    const conversaciones: Record<string, ConversacionArrancada> = {
      [ALFA]: {
        estado: 'terminada',
        preguntas: ['Q-4', 'Q-5'],
        frenan: 1,
        trabajando: false,
        guardada: true,
      },
      [BETA]: { estado: null, preguntas: [], frenan: 0, trabajando: true, guardada: false },
    }
    const { a, archivo } = armar({
      conversacion: async (ruta) => conversaciones[ruta] as ConversacionArrancada,
    })
    await archivo.anotar(arranco(A_LAS_3, ALFA, 'Alfa'))
    await archivo.anotar(renglon(A_LAS_3 + HORA))
    await archivo.anotar(arranco(A_LAS_3 + 5 * HORA, BETA, 'Beta'))
    const e = await a.estado()
    expect(e.prendido).toBe(true)
    expect(e.semana.map((r) => r.cuando)).toEqual([A_LAS_3 + 5 * HORA, A_LAS_3 + HORA, A_LAS_3])
    expect(e.semana[1]).toEqual({ cuando: A_LAS_3 + HORA, resultado: 'nada-listo', proyecto: null })
    expect(e.aviso).toEqual([
      {
        cuando: A_LAS_3,
        resultado: 'arranco',
        proyecto: { ruta: ALFA, nombre: 'Alfa', estado: 'terminada', preguntas: 2, frenan: 1 },
      },
      {
        cuando: A_LAS_3 + 5 * HORA,
        resultado: 'arranco',
        proyecto: { ruta: BETA, nombre: 'Beta', estado: 'trabajando', preguntas: 0, frenan: 0 },
      },
    ])
    expect(await a.arrancoEn(ALFA)).toBe(true)
    expect(await a.arrancoEn('C:\\P\\Gamma')).toBe(false)
  })

  it('sin guardar ni trabajando, no llegó a empezar: falló; guardada sin terminar, se cortó', async () => {
    let c: ConversacionArrancada = {
      estado: null,
      preguntas: [],
      frenan: 0,
      trabajando: false,
      guardada: false,
    }
    const { a, archivo } = armar({ conversacion: async () => c })
    await archivo.anotar(arranco(A_LAS_3, ALFA, 'Alfa'))
    expect((await a.estado()).aviso[0]?.proyecto?.estado).toBe('error')
    c = { ...c, guardada: true }
    expect((await a.estado()).aviso[0]?.proyecto?.estado).toBe('detenida')
  })

  it('Listo: lo mostrado no vuelve, se avisa a la ventana y queda al volver a abrir', async () => {
    const alCambio = vi.fn()
    const { a, archivo } = armar({ alCambio })
    await archivo.anotar(renglon(A_LAS_3, { resultado: 'semana' }))
    expect((await a.estado()).aviso).toHaveLength(1)
    await a.visto(A_LAS_3)
    expect(alCambio).toHaveBeenCalledTimes(1)
    expect((await a.estado()).aviso).toEqual([])
    // Lo que pasa después sí entra.
    await archivo.anotar(renglon(A_LAS_3 + 5 * HORA, { resultado: 'semana' }))
    expect((await a.estado()).aviso.map((r) => r.cuando)).toEqual([A_LAS_3 + 5 * HORA])
    const otra = new ArchivoArranques(join(datos, 'arranques.json'))
    expect((await otra.leer()).vistoHasta).toBe(A_LAS_3)
  })

  it('apagado no dice el próximo; al hacer un momento se avisa a la ventana', async () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 18, 22, 0).getTime() })
    const alCambio = vi.fn()
    const { a } = armar({ alCambio })
    await a.iniciar()
    expect((await a.estado()).proximo).toBe(new Date(2026, 10, 19, 3, 0).getTime())
    alCambio.mockClear()
    await vi.advanceTimersByTimeAsync(5 * HORA)
    // El renglón se escribe en el disco: se espera a que esté.
    await vi.waitFor(async () => expect((await a.estado()).semana[0]?.resultado).toBe('nada-listo'))
    await vi.waitFor(() => expect(alCambio).toHaveBeenCalled())
    a.cerrar()
    const apagado = armar({ ajuste: async () => ({ prendido: false, hora: '03:00' }) }).a
    expect((await apagado.estado()).proximo).toBeNull()
  })
})

describe('la conversación arrancada', () => {
  it('dice cuándo la empezó Iridium, al arrancar y al volver a abrirla; las demás, no', async () => {
    const alfa = join(datos, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    const registro = new ArchivoSesiones(join(datos, 'sesiones.json'))
    const cambios: CambioConversacion[] = []
    const motor = crearMotorFalso({ pasoMs: 5 })
    const c = new Conversaciones({
      motor,
      registro,
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => cambios.push(x),
    })
    await c.seguir(alfa, { nueva: true }, { arranque: A_LAS_3 })
    expect(cambios.find((x) => x.reiniciar)?.arrancada).toBe(A_LAS_3)
    expect((await c.abrir(alfa)).arrancada).toBe(A_LAS_3)
    await vi.waitFor(async () => expect((await registro.deArranque(alfa, A_LAS_3))?.ruta).toBe(alfa), {
      timeout: 5000,
    })
    await vi.waitFor(async () => expect((await c.abrir(alfa)).ficha?.estado).not.toBe('trabajando'), {
      timeout: 5000,
    })
    c.cerrarTodo()
    // Otra vez abierta Iridium: sale de `sesiones.json`.
    const otra = new Conversaciones({
      motor,
      registro: new ArchivoSesiones(join(datos, 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: () => {},
    })
    expect((await otra.abrir(alfa)).arrancada).toBe(A_LAS_3)
    // Una Nueva del usuario no la lleva.
    cambios.length = 0
    await c.seguir(alfa, { nueva: true })
    expect(cambios.find((x) => x.reiniciar)?.arrancada).toBeNull()
    c.cerrarTodo()
    otra.cerrarTodo()
  })
})

describe('el registro de conversaciones al abrir', () => {
  it('las que se piden a la vez esperan la misma lectura: ninguna sale vacía (D-194)', async () => {
    const archivo = join(datos, 'sesiones.json')
    const conversaciones = Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [
        `conv-${i}`,
        {
          ruta: ALFA,
          empezadaEn: 'iridium',
          ultimoUso: A_LAS_3 + i * MIN + 30_000,
          detenida: false,
          ultimoEstado: 'terminada',
          preguntas: [],
          arranque: A_LAS_3 + i * MIN,
        },
      ]),
    )
    await writeFile(archivo, JSON.stringify({ version: 1, conversaciones }))
    const registro = new ArchivoSesiones(archivo)
    const halladas = await Promise.all(
      Array.from({ length: 8 }, (_, i) => registro.deArranque(ALFA, A_LAS_3 + i * MIN)),
    )
    expect(halladas.map((r) => r?.ultimoEstado)).toEqual(Array(8).fill('terminada'))
  })
})
