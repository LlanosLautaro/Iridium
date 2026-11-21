// AR-I1: el motor del arranque del período de 5 horas (frente Arranque, D-149). Las reglas con fechas fijas; el caso de
// uso con un reloj falso y lo de afuera de mentira; `arranques.json`, el ajuste en `config.json` y la marca en
// `sesiones.json` con carpetas temporales y el motor falso.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AjusteArranque,
  PendienteVista,
  TarjetaProyecto,
  UsoSuscripcion,
} from '../src/compartido/puente'
import { Arranque, candidatosDe, type DependenciasArranque } from '../src/main/app/arranque'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import {
  bloqueo,
  type Candidato,
  DESPUES_DEL_VENCIMIENTO_MS,
  elegir,
  pendienteAlAbrir,
  proximaHora,
  proximoMomento,
} from '../src/main/core/arranque'
import { ArchivoArranques } from '../src/main/infra/arranques'
import { ArchivoConfig, preferenciasDe } from '../src/main/infra/config'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { CambioPreferencias } from '../src/main/ipc/esquemas'
import { crearMotorFalso } from '../src/main/motor/motor'

const MIN = 60_000
const HORA = 60 * MIN
const DIA = 24 * HORA
/** Un miércoles a las 22:00, hora local. */
const NOCHE = new Date(2026, 10, 18, 22, 0).getTime()
const A_LAS_3 = new Date(2026, 10, 19, 3, 0).getTime()
const PRENDIDO: AjusteArranque = { prendido: true, hora: '03:00' }

const uso = (cinco: number | null, semana = 40, leido = NOCHE): UsoSuscripcion => ({
  cincoHoras: { usado: cinco === null ? 0 : 50, libera: cinco, agotada: false },
  semana: { usado: semana, libera: NOCHE + 3 * DIA, agotada: false },
  ritmo: null,
  leido,
})
const cand = (nombre: string, desde: number): Candidato => ({
  ruta: `C:\\P\\${nombre}`,
  nombre,
  preguntas: ['Q-1'],
  desde,
})

describe('las reglas del arranque', () => {
  it('la próxima hora elegida es hoy si no pasó y mañana si ya pasó (o es justo ahora)', () => {
    expect(proximaHora('23:30', NOCHE)).toBe(new Date(2026, 10, 18, 23, 30).getTime())
    expect(proximaHora('03:00', NOCHE)).toBe(A_LAS_3)
    expect(proximaHora('22:00', NOCHE)).toBe(new Date(2026, 10, 19, 22, 0).getTime())
  })

  it('apagado no hay momento; sin período abierto, la hora elegida', () => {
    expect(proximoMomento({ ...PRENDIDO, prendido: false }, uso(null), NOCHE)).toBeNull()
    expect(proximoMomento(PRENDIDO, uso(null), NOCHE)).toEqual({ cuando: A_LAS_3, momento: 'hora' })
    expect(proximoMomento(PRENDIDO, null, NOCHE)).toEqual({ cuando: A_LAS_3, momento: 'hora' })
  })

  it('si el período vence antes de la hora, 5 minutos después del vencimiento', () => {
    const vence = NOCHE + HORA
    expect(proximoMomento(PRENDIDO, uso(vence), NOCHE)).toEqual({
      cuando: vence + DESPUES_DEL_VENCIMIENTO_MS,
      momento: 'vencimiento',
    })
    // Vence después de las 3: primero la hora.
    expect(proximoMomento(PRENDIDO, uso(A_LAS_3 + HORA), NOCHE)?.momento).toBe('hora')
    // Venció hace rato (nadie lo abrió de nuevo): la hora.
    expect(proximoMomento(PRENDIDO, uso(NOCHE - HORA), NOCHE)?.momento).toBe('hora')
  })

  it('un momento ya hecho no se repite', () => {
    const vence = NOCHE + HORA + DESPUES_DEL_VENCIMIENTO_MS
    expect(proximoMomento(PRENDIDO, uso(NOCHE + HORA), NOCHE, vence)).toEqual({
      cuando: A_LAS_3,
      momento: 'hora',
    })
    expect(proximoMomento(PRENDIDO, uso(null), NOCHE, A_LAS_3)?.cuando).toBe(A_LAS_3 + DIA)
  })

  it('no arranca sin uso, con el período abierto o con la semana en 90 %', () => {
    expect(bloqueo(null, NOCHE)).toBe('sin-uso')
    expect(bloqueo(uso(NOCHE + MIN), NOCHE)).toBe('periodo-abierto')
    expect(bloqueo(uso(null, 90), NOCHE)).toBe('semana')
    expect(bloqueo(uso(NOCHE - MIN, 89), NOCHE)).toBeNull()
    expect(bloqueo(uso(null), NOCHE)).toBeNull()
  })

  it('elige el que espera hace más; a igual fecha, por nombre', () => {
    expect(elegir([])).toBeNull()
    expect(elegir([cand('Beta', 2), cand('Alfa', 5), cand('Gamma', 1)])?.nombre).toBe('Gamma')
    expect(elegir([cand('Beta', 1), cand('Alfa', 1)])?.nombre).toBe('Alfa')
  })

  it('al abrir se hace el momento que cayó en el reinicio de Actualizar solo, no uno viejo', () => {
    expect(pendienteAlAbrir(null, A_LAS_3)).toBe(false)
    expect(pendienteAlAbrir(A_LAS_3 - 3 * MIN, A_LAS_3)).toBe(true)
    expect(pendienteAlAbrir(A_LAS_3 - HORA, A_LAS_3)).toBe(false)
    expect(pendienteAlAbrir(A_LAS_3 + MIN, A_LAS_3)).toBe(false)
  })
})

const tarjeta = (nombre: string, cambio: Partial<TarjetaProyecto> = {}): TarjetaProyecto => ({
  nombre,
  ruta: `C:\\P\\${nombre}`,
  inicial: nombre[0] ?? '?',
  estado: 'en-desarrollo',
  descripcion: '',
  archivado: false,
  reemplazadoPor: null,
  icono: null,
  problema: null,
  hito: null,
  preguntas: { sinResponder: 0, frenan: 0, respondidas: 1 },
  revision: 0,
  skills: 0,
  framework: { avisos: [] },
  ultimoCambio: null,
  ...cambio,
})
const pendiente = (codigo: string, cambio: Partial<PendienteVista> = {}) =>
  ({ codigo, estado: 'respondida', postergada: false, ...cambio }) as PendienteVista

describe('los proyectos con trabajo listo', () => {
  it('solo los del framework, sin archivar, sin trabajar ni usarse en VS Code, con respuestas que no son «Más tarde»', async () => {
    const tarjetas = [
      tarjeta('Alfa'),
      tarjeta('Beta'),
      tarjeta('Gamma', { archivado: true }),
      tarjeta('Delta', { framework: 'viejo' }),
      tarjeta('Epsilon', { preguntas: { sinResponder: 2, frenan: 0, respondidas: 0 } }),
      tarjeta('Zeta'),
      tarjeta('Eta'),
      tarjeta('Theta'),
    ]
    const pendientes: Record<string, PendienteVista[]> = {
      Alfa: [pendiente('Q-3'), pendiente('Q-4', { estado: 'sin-responder' }), pendiente('Q-5')],
      Beta: [pendiente('Q-1')],
      Gamma: [pendiente('Q-1')],
      Delta: [pendiente('Q-1')],
      Zeta: [pendiente('Q-1', { postergada: true })],
      Eta: [pendiente('Q-1')],
      Theta: [pendiente('Q-1')],
    }
    const fechas: Record<string, number> = { 'Alfa/Q-3': 300, 'Alfa/Q-5': 100, 'Beta/Q-1': 200 }
    const nombre = (ruta: string) => ruta.split('\\').at(-1) ?? ''
    const c = await candidatosDe(tarjetas, {
      enMarcha: () => ['C:\\P\\Theta'],
      usadaAfuera: async (ruta) => nombre(ruta) === 'Eta',
      pendientes: async (ruta) => pendientes[nombre(ruta)] ?? null,
      fechaRespuesta: async (ruta, codigo) => fechas[`${nombre(ruta)}/${codigo}`] ?? null,
    })
    expect(c).toEqual([
      { ruta: 'C:\\P\\Alfa', nombre: 'Alfa', preguntas: ['Q-3', 'Q-5'], desde: 100 },
      { ruta: 'C:\\P\\Beta', nombre: 'Beta', preguntas: ['Q-1'], desde: 200 },
    ])
  })
})

let datos: string
beforeEach(async () => {
  datos = await mkdtemp(join(tmpdir(), 'iridium-arranque-'))
})
afterEach(async () => {
  vi.useRealTimers()
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

/** El caso de uso con todo lo de afuera de mentira y el reloj falso en `NOCHE`. */
function armar(cambio: Partial<DependenciasArranque> = {}) {
  vi.useFakeTimers({ now: NOCHE })
  const arrancados: { ruta: string; marca: number }[] = []
  const archivo = new ArchivoArranques(join(datos, 'arranques.json'))
  let actual: UsoSuscripcion | null = uso(null)
  const a = new Arranque({
    ajuste: async () => PRENDIDO,
    usoActual: () => actual,
    leerUso: async () => actual,
    candidatos: async () => [cand('Beta', 200), cand('Alfa', 100)],
    sesionLista: async () => true,
    arrancar: async (ruta, marca) => {
      arrancados.push({ ruta, marca })
      // La conversación abre el período.
      actual = uso(Date.now() + 5 * HORA)
    },
    archivo,
    segundosSinUsar: () => 4 * 3600,
    ...cambio,
  })
  return { a, arrancados, archivo, ponerUso: (u: UsoSuscripcion | null) => (actual = u) }
}

/** Deja correr las promesas pendientes (el reloj falso no las espera). */
const correr = () => vi.advanceTimersByTimeAsync(0)

describe('el arranque', () => {
  it('a la hora elegida arranca el que espera hace más y lo anota; no lo repite', async () => {
    const { a, arrancados, archivo } = armar()
    await a.iniciar()
    expect(a.proximo()).toEqual({ cuando: A_LAS_3, momento: 'hora' })
    expect((await archivo.leer()).programado).toBe(A_LAS_3)
    await vi.advanceTimersByTimeAsync(A_LAS_3 - NOCHE - MIN)
    expect(arrancados).toEqual([])
    await vi.advanceTimersByTimeAsync(MIN)
    expect(arrancados).toEqual([{ ruta: 'C:\\P\\Alfa', marca: A_LAS_3 }])
    const { momentos } = await archivo.leer()
    expect(momentos).toEqual([
      {
        cuando: A_LAS_3,
        momento: 'hora',
        resultado: 'arranco',
        proyecto: { ruta: 'C:\\P\\Alfa', nombre: 'Alfa', preguntas: ['Q-1'] },
        sinUsarIridium: 4 * 3600,
      },
    ])
    // El siguiente: 5 minutos después de que venza el período que abrió (después de escribir arranques.json).
    await vi.waitFor(() => expect(a.proximo()?.momento).toBe('vencimiento'))
    expect(a.proximo()).toEqual({
      cuando: A_LAS_3 + 5 * HORA + DESPUES_DEL_VENCIMIENTO_MS,
      momento: 'vencimiento',
    })
    a.cerrar()
  })

  it('con el período abierto, sin nada listo, sin sesión o sin uso no arranca, y lo anota', async () => {
    const casos: [Partial<DependenciasArranque>, string][] = [
      [{ leerUso: async () => uso(A_LAS_3 + HORA) }, 'periodo-abierto'],
      [{ candidatos: async () => [] }, 'nada-listo'],
      [{ sesionLista: async () => false }, 'sin-sesion'],
      [{ leerUso: async () => null }, 'sin-uso'],
      [{ leerUso: async () => uso(null, 92) }, 'semana'],
    ]
    for (const [cambio, resultado] of casos) {
      const { a, arrancados, archivo } = armar(cambio)
      await a.iniciar()
      await vi.advanceTimersByTimeAsync(A_LAS_3 - NOCHE)
      expect(arrancados).toEqual([])
      expect((await archivo.leer()).momentos.at(-1)?.resultado).toBe(resultado)
      a.cerrar()
      vi.useRealTimers()
      await rm(join(datos, 'arranques.json'), { force: true })
    }
  })

  it('con el período abierto a la hora elegida, arranca al vencer aunque el uso releído ya no lo traiga (Q-210)', async () => {
    const vence = A_LAS_3 + 40 * MIN
    const { a, arrancados, archivo, ponerUso } = armar()
    ponerUso(uso(vence))
    await a.iniciar()
    await vi.advanceTimersByTimeAsync(A_LAS_3 - NOCHE)
    expect((await archivo.leer()).momentos.at(-1)?.resultado).toBe('periodo-abierto')
    await vi.waitFor(() => expect(a.proximo()?.momento).toBe('vencimiento'))
    // Al liberarse la ventana se relee el uso: el período cerrado ya no trae vencimiento.
    await vi.advanceTimersByTimeAsync(vence - A_LAS_3 + 30_000)
    ponerUso(uso(null))
    await a.recalcular()
    expect(a.proximo()).toEqual({ cuando: vence + DESPUES_DEL_VENCIMIENTO_MS, momento: 'vencimiento' })
    await vi.advanceTimersByTimeAsync(DESPUES_DEL_VENCIMIENTO_MS - 30_000)
    expect(arrancados).toEqual([{ ruta: 'C:\\P\\Alfa', marca: vence + DESPUES_DEL_VENCIMIENTO_MS }])
    a.cerrar()
  })

  it('apagado no programa nada; prenderlo programa la hora', async () => {
    let ajuste: AjusteArranque = { prendido: false, hora: '03:00' }
    const { a } = armar({ ajuste: async () => ajuste })
    await a.iniciar()
    expect(a.proximo()).toBeNull()
    ajuste = { prendido: true, hora: '01:15' }
    await a.recalcular()
    expect(a.proximo()?.cuando).toBe(new Date(2026, 10, 19, 1, 15).getTime())
    a.cerrar()
  })

  it('si el momento cayó con la PC dormida, se hace al despertar, una sola vez', async () => {
    const { a, arrancados } = armar()
    await a.iniciar()
    a.alSuspender()
    // Durante la suspensión no corre ningún temporizador: el reloj salta.
    vi.setSystemTime(A_LAS_3 + 2 * HORA)
    await correr()
    expect(arrancados).toEqual([])
    await a.alDespertar()
    expect(arrancados).toEqual([{ ruta: 'C:\\P\\Alfa', marca: A_LAS_3 + 2 * HORA }])
    await a.alDespertar()
    expect(arrancados).toHaveLength(1)
    a.cerrar()
  })

  it('el momento que cayó en el reinicio de Actualizar solo se hace al abrir; uno viejo, no', async () => {
    const { a, arrancados, archivo } = armar()
    await archivo.guardar({ programado: NOCHE - 2 * MIN })
    await a.iniciar()
    expect(arrancados).toHaveLength(1)
    a.cerrar()

    vi.useRealTimers()
    await rm(join(datos, 'arranques.json'), { force: true })
    const otro = armar()
    await otro.archivo.guardar({ programado: NOCHE - 3 * HORA })
    await otro.a.iniciar()
    expect(otro.arrancados).toEqual([])
    expect(otro.a.proximo()?.cuando).toBe(A_LAS_3)
    otro.a.cerrar()
  })

  it('para las pruebas, el primer momento a unos segundos de abrir', async () => {
    const { a, arrancados } = armar({ primeroEnSegundos: 3 })
    await a.iniciar()
    expect(a.proximo()?.cuando).toBe(NOCHE + 3000)
    await vi.advanceTimersByTimeAsync(3000)
    expect(arrancados).toHaveLength(1)
    await vi.waitFor(() => expect(a.proximo()?.cuando).toBe(A_LAS_3))
    a.cerrar()
  })
})

describe('los casos raros (paso 8)', () => {
  it('sin período: el uso sin ventana de 5 horas o con un vencimiento pasado arranca a la hora', async () => {
    const sinVentana: UsoSuscripcion = { ...uso(null), cincoHoras: null }
    expect(bloqueo(sinVentana, NOCHE)).toBeNull()
    expect(proximoMomento(PRENDIDO, sinVentana, NOCHE)).toEqual({ cuando: A_LAS_3, momento: 'hora' })
    const { a, arrancados } = armar({ usoActual: () => sinVentana, leerUso: async () => sinVentana })
    await a.iniciar()
    await vi.advanceTimersByTimeAsync(A_LAS_3 - NOCHE)
    expect(arrancados).toHaveLength(1)
    a.cerrar()
  })

  it('si no pudo, no reintenta en bucle: el próximo es el del día siguiente', async () => {
    let intentos = 0
    const { a, arrancados, archivo } = armar({
      sesionLista: async () => {
        intentos++
        return false
      },
    })
    await a.iniciar()
    await vi.advanceTimersByTimeAsync(A_LAS_3 - NOCHE)
    await vi.waitFor(() => expect(a.proximo()?.cuando).toBe(A_LAS_3 + DIA))
    await vi.advanceTimersByTimeAsync(6 * HORA)
    expect(intentos).toBe(1)
    expect(arrancados).toEqual([])
    expect((await archivo.leer()).momentos.map((m) => m.resultado)).toEqual(['sin-sesion'])
    a.cerrar()
  })

  it('dormida a la hora y al vencimiento: al despertar, uno solo', async () => {
    const { a, arrancados, ponerUso } = armar()
    ponerUso(uso(NOCHE + HORA))
    await a.iniciar()
    expect(a.proximo()?.momento).toBe('vencimiento')
    a.alSuspender()
    vi.setSystemTime(A_LAS_3 + 2 * HORA)
    ponerUso(uso(null))
    await Promise.all([a.alDespertar(), a.alDespertar()])
    expect(arrancados).toHaveLength(1)
    // El siguiente, al vencer el período que abrió; ni la hora ni el vencimiento perdidos se repiten.
    await vi.waitFor(() => expect(a.proximo()?.cuando).toBe(A_LAS_3 + 7 * HORA + DESPUES_DEL_VENCIMIENTO_MS))
    a.cerrar()
  })

  it('al despertar con un período abierto (lo abrió el usuario en otro lado) no arranca', async () => {
    const { a, arrancados, archivo, ponerUso } = armar()
    await a.iniciar()
    a.alSuspender()
    vi.setSystemTime(A_LAS_3 + HORA)
    ponerUso(uso(A_LAS_3 + 3 * HORA))
    await a.alDespertar()
    expect(arrancados).toEqual([])
    expect((await archivo.leer()).momentos.at(-1)?.resultado).toBe('periodo-abierto')
    a.cerrar()
  })

  it('una suspensión que Windows no avisó se nota en a lo sumo 15 minutos', async () => {
    const { a, arrancados } = armar()
    await a.iniciar()
    // El reloj salta sin que corra ningún temporizador (y sin alSuspender ni alDespertar).
    vi.setSystemTime(A_LAS_3 + HORA)
    await vi.advanceTimersByTimeAsync(15 * MIN)
    expect(arrancados).toHaveLength(1)
    a.cerrar()
  })
})

describe('arranques.json', () => {
  it('roto o sin archivo, vacío; guarda solo los últimos 7 días', async () => {
    const ruta = join(datos, 'arranques.json')
    await writeFile(ruta, '{ roto')
    const archivo = new ArchivoArranques(ruta)
    expect(await archivo.leer()).toEqual({ version: 1, vistoHasta: null, programado: null, momentos: [] })
    const renglon = (cuando: number) => ({
      cuando,
      momento: 'hora' as const,
      resultado: 'nada-listo' as const,
      sinUsarIridium: 0,
    })
    await archivo.anotar(renglon(NOCHE - 8 * DIA))
    await archivo.anotar(renglon(NOCHE - 2 * DIA))
    await archivo.anotar(renglon(NOCHE))
    const releido = await new ArchivoArranques(ruta).leer()
    expect(releido.momentos.map((m) => m.cuando)).toEqual([NOCHE - 2 * DIA, NOCHE])
  })
})

describe('el ajuste', () => {
  it('apagado a las 3:00 si falta o está roto; se guarda y queda al volver a abrir', async () => {
    const ruta = join(datos, 'config.json')
    await writeFile(ruta, JSON.stringify({ version: 1, arranque: { prendido: 'sí', hora: '27:00' } }))
    expect(preferenciasDe(await new ArchivoConfig(ruta).leer()).arranque).toEqual({
      prendido: false,
      hora: '03:00',
    })
    await new ArchivoConfig(ruta).guardar({ arranque: { prendido: true, hora: '04:30' } })
    expect(preferenciasDe(await new ArchivoConfig(ruta).leer()).arranque).toEqual({
      prendido: true,
      hora: '04:30',
    })
  })

  it('desde la ventana solo llega una hora válida', () => {
    expect(CambioPreferencias.safeParse({ arranque: { prendido: true, hora: '03:00' } }).success).toBe(true)
    expect(CambioPreferencias.safeParse({ arranque: { prendido: true, hora: '24:00' } }).success).toBe(false)
    expect(CambioPreferencias.safeParse({ arranque: { prendido: true } }).success).toBe(false)
  })
})

describe('la conversación que arranca', () => {
  it('es Nueva, con «Continúa con el proyecto.», y su resumen lleva la marca del arranque', async () => {
    const alfa = join(datos, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    const registro = new ArchivoSesiones(join(datos, 'sesiones.json'))
    const motor = crearMotorFalso({ pasoMs: 5 })
    const c = new Conversaciones({ motor, registro, preguntas: leerPreguntasAbiertas, alCambio: () => {} })
    await c.seguir(alfa, { nueva: true }, { arranque: A_LAS_3 })
    const fin = Date.now() + 5000
    let id: string | null = null
    while (!id && Date.now() < fin) {
      id = (await c.abrir(alfa)).id
      await new Promise((r) => setTimeout(r, 10))
    }
    expect(id).not.toBeNull()
    const v = await c.abrir(alfa)
    expect(v.entradas[0]).toMatchObject({ tipo: 'usuario', texto: 'Continúa con el proyecto.' })
    // El resumen se escribe aparte: se espera a que esté en el disco.
    await vi.waitFor(
      async () => {
        const json = JSON.parse(await readFile(join(datos, 'sesiones.json'), 'utf8'))
        expect(json.conversaciones[id as string]).toMatchObject({ empezadaEn: 'iridium', arranque: A_LAS_3 })
      },
      { timeout: 5000 },
    )
    c.cerrarTodo()
  })
})
