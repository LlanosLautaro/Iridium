// I-6: el uso y su ritmo (H-12, R-1), el contexto, el modelo y el esfuerzo (C-58), los errores del motor (F-5),
// cerrar con sesiones trabajando (F-6) y el registro del día. Con el motor falso: no abre Claude Code ni gasta uso.
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { AjusteIa, CambioConversacion, EstadoMotor, UsoSuscripcion } from '../src/compartido/puente'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { UsoDeLaSuscripcion } from '../src/main/app/uso'
import {
  proximaLectura,
  RELEER_USO_MS,
  ritmoSemana,
  USO_VIEJO_MS,
  usoSuscripcion,
  usoViejo,
} from '../src/main/core/uso'
import { ArchivoConfig, preferenciasDe } from '../src/main/infra/config'
import { lineaDeRegistro, nombreDelDia, Registro } from '../src/main/infra/registro'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { CambioPreferencias } from '../src/main/ipc/esquemas'
import { crearMotorFalso, type EventoMotor, type Motor, type UsoMotor } from '../src/main/motor/motor'
import {
  CACHE_1_H,
  CACHE_5_MIN,
  cacheDe,
  contextoDe,
  esfuerzosGuardados,
  esSinConexion,
  modelosDe,
  RELEER_USO_TURNO_MS,
  reintentoDe,
  tokensDeHistorial,
  usoDe,
} from '../src/main/motor/sdk'

const HORA = 3_600_000
const DIA = 24 * HORA
const AHORA = new Date(2026, 9, 29, 12, 0).getTime()

describe('ritmo de la semana (R-1)', () => {
  it('alcanza: usado al ritmo parejo, llega al reinicio', () => {
    // Pasaron 4 días de 7 y se usó 40 %: 10 % por día; quedan 60 % para 3 días.
    const r = ritmoSemana({ usado: 40, libera: AHORA + 3 * DIA, agotada: false }, AHORA)
    expect(r?.diasQuedan).toBeCloseTo(3)
    expect(r?.porDia).toBeCloseTo(10)
    expect(r?.alcanzaPorDia).toBeCloseTo(20)
    expect(r?.parejo).toBeCloseTo(14.29, 1)
    expect(r?.agotaria).toBeNull()
  })

  it('no alcanza: dice cuándo se agotaría a este ritmo', () => {
    // Pasaron 2 días y se usó 60 %: 30 % por día; el 40 % que queda se va en 1,33 días, antes del reinicio (5 días).
    const r = ritmoSemana({ usado: 60, libera: AHORA + 5 * DIA, agotada: false }, AHORA)
    expect(r?.porDia).toBeCloseTo(30)
    expect(r?.alcanzaPorDia).toBeCloseTo(8)
    expect(r?.agotaria).toBeCloseTo(AHORA + (40 / 30) * DIA, -3)
  })

  it('agotada: ya se agotó; sin fecha de reinicio no hay ritmo', () => {
    expect(ritmoSemana({ usado: 100, libera: AHORA + DIA, agotada: true }, AHORA)?.agotaria).toBe(AHORA)
    expect(ritmoSemana({ usado: 50, libera: null, agotada: false }, AHORA)).toBeNull()
    expect(ritmoSemana(null, AHORA)).toBeNull()
  })

  it('recién empezada la semana, un poco de uso no parece enorme', () => {
    const r = ritmoSemana({ usado: 2, libera: AHORA + 7 * DIA - 60_000, agotada: false }, AHORA)
    expect(r?.porDia).toBeLessThanOrEqual(8)
  })
})

describe('cuándo volver a leer el uso', () => {
  it('cada 5 minutos, o apenas se libera una ventana (Defecto 16: eran 15)', () => {
    expect(RELEER_USO_MS).toBe(5 * 60_000)
    expect(RELEER_USO_TURNO_MS).toBe(2 * 60_000)
    const uso = usoSuscripcion(
      {
        cincoHoras: { usado: 100, libera: AHORA + 2 * 60_000, agotada: true },
        semana: { usado: 50, libera: AHORA + 3 * DIA, agotada: false },
      },
      AHORA,
    )
    expect(proximaLectura(uso, AHORA)).toBe(2 * 60_000 + 30_000)
    expect(proximaLectura(null, AHORA)).toBe(RELEER_USO_MS)
  })

  it('el uso que llega se avisa con su ritmo, y se vuelve a leer sin mandar mensajes', async () => {
    const recibidos: UsoSuscripcion[] = []
    let lecturas = 0
    const motor: Pick<Motor, 'uso'> = {
      uso: async () => {
        lecturas++
        return { cincoHoras: { usado: 10, libera: AHORA + HORA, agotada: false }, semana: null }
      },
    }
    const u = new UsoDeLaSuscripcion({ motor, alCambio: (x) => recibidos.push(x), ahora: () => AHORA })
    u.poner({
      cincoHoras: { usado: 34, libera: AHORA + HORA, agotada: false },
      semana: { usado: 40, libera: AHORA + 3 * DIA, agotada: false },
    })
    expect(recibidos[0]?.ritmo?.porDia).toBeCloseTo(10)
    await u.leer()
    expect(lecturas).toBe(1)
    expect(u.get()?.cincoHoras?.usado).toBe(10)
    u.cerrar()
  })

  it('al volver a la ventana se relee solo si el uso tiene más de un minuto (Defecto 16)', async () => {
    let ahora = AHORA
    let lecturas = 0
    let usado = 30
    const motor: Pick<Motor, 'uso'> = {
      uso: async () => {
        lecturas++
        return { cincoHoras: { usado, libera: AHORA + HORA, agotada: false }, semana: null }
      },
    }
    const u = new UsoDeLaSuscripcion({ motor, alCambio: () => {}, ahora: () => ahora })
    expect(usoViejo(null, AHORA)).toBe(true)
    await u.alVolver()
    expect(lecturas).toBe(1)
    // Recién leído: volver a la ventana no lo vuelve a pedir.
    ahora += 30_000
    await u.alVolver()
    expect(lecturas).toBe(1)
    // Mientras tanto se gastó afuera (VS Code): pasado el minuto, se ve al volver.
    usado = 45
    ahora += USO_VIEJO_MS
    await u.alVolver()
    expect(lecturas).toBe(2)
    expect(u.get()?.cincoHoras?.usado).toBe(45)
    u.cerrar()
  })

  it('dos lecturas a la vez (volver a la ventana y la lectura periódica) piden el uso una sola vez', async () => {
    let lecturas = 0
    const motor: Pick<Motor, 'uso'> = {
      uso: async () => {
        lecturas++
        await new Promise((r) => setTimeout(r, 20))
        return { cincoHoras: null, semana: { usado: 50, libera: AHORA + DIA, agotada: false } }
      },
    }
    const u = new UsoDeLaSuscripcion({ motor, alCambio: () => {}, ahora: () => AHORA })
    await Promise.all([u.leer(), u.alVolver()])
    expect(lecturas).toBe(1)
    u.cerrar()
  })
})

describe('lo que dice Claude Code, en palabras de la app', () => {
  it('el uso: las dos ventanas con cuándo se liberan; sin límites de plan, nada', () => {
    const u = usoDe({
      rate_limits_available: true,
      rate_limits: {
        five_hour: { utilization: 30, resets_at: '2026-10-29T15:20:00.409843+00:00' },
        seven_day: { utilization: 100, resets_at: null },
      },
    } as Parameters<typeof usoDe>[0])
    expect(u?.cincoHoras).toEqual({
      usado: 30,
      libera: Date.parse('2026-10-29T15:20:00.409Z'),
      agotada: false,
    })
    expect(u?.semana).toEqual({ usado: 100, libera: null, agotada: true })
    expect(
      usoDe({ rate_limits_available: false, rate_limits: null } as Parameters<typeof usoDe>[0]),
    ).toBeNull()
  })

  it('el contexto de una conversación guardada sale de su última respuesta, sin retomarla', () => {
    const respuesta = (
      usage: object | undefined,
      model = 'claude-opus-5-5',
      parent: string | null = null,
    ) => ({
      type: 'assistant' as const,
      uuid: 'u',
      session_id: 's',
      parent_tool_use_id: parent,
      parent_agent_id: null,
      message: { model, usage },
    })
    const historial = [
      respuesta({ input_tokens: 5, cache_creation_input_tokens: 100, cache_read_input_tokens: 1000 }),
      // La de un agente no cuenta; la que arma Claude Code al detener no trae tokens.
      respuesta({ input_tokens: 1, cache_read_input_tokens: 90_000 }, 'claude-haiku-5-5', 'tool-1'),
      respuesta({ input_tokens: 0, output_tokens: 0 }, '<synthetic>'),
      {
        type: 'user' as const,
        uuid: 'v',
        session_id: 's',
        parent_tool_use_id: null,
        parent_agent_id: null,
        message: {},
      },
    ]
    expect(tokensDeHistorial(historial)).toEqual({ usados: 1105, modelo: 'claude-opus-5-5', cacheMs: null })
    expect(tokensDeHistorial([])).toBeNull()
  })

  it('cuánto dura la caché lo dice la última respuesta que escribió en ella (Q-77)', () => {
    const respuesta = (usage: Record<string, unknown>) => ({
      type: 'assistant' as const,
      uuid: 'u',
      session_id: 's',
      parent_tool_use_id: null,
      parent_agent_id: null,
      message: { model: 'claude-opus-5-5', usage },
    })
    const una = (min5: number, h1: number) => ({
      input_tokens: 2,
      cache_creation_input_tokens: min5 + h1,
      cache_read_input_tokens: 5000,
      cache_creation: { ephemeral_5m_input_tokens: min5, ephemeral_1h_input_tokens: h1 },
    })
    // La última solo leyó de la caché: la anterior dice que dura una hora.
    expect(tokensDeHistorial([respuesta(una(0, 300)), respuesta(una(0, 0))])).toEqual({
      usados: 5002,
      modelo: 'claude-opus-5-5',
      cacheMs: CACHE_1_H,
    })
    expect(tokensDeHistorial([respuesta(una(200, 0))])?.cacheMs).toBe(CACHE_5_MIN)
    expect(cacheDe({ input_tokens: 1 })).toBeNull()
  })

  it('el contexto y los modelos con sus esfuerzos', () => {
    expect(contextoDe({ totalTokens: 42_255, maxTokens: 1_000_000, percentage: 4.2 })).toEqual({
      usados: 42_255,
      maximo: 1_000_000,
      porcentaje: 4,
      categorias: null,
      cacheMs: null,
      ultimoPedido: null,
    })
    // El desglose: lo que ocupa la ventana, lo libre y la reserva; lo que se carga solo si hace falta, no.
    const conDesglose = contextoDe(
      {
        totalTokens: 30_000,
        maxTokens: 200_000,
        percentage: 15,
        categories: [
          { id: 'messages', name: 'Messages', tokens: 25_000, color: '', kind: 'used' },
          { id: 'system_prompt', name: 'System prompt', tokens: 5_000, color: '', kind: 'used' },
          { id: 'mcp_tools_deferred', name: 'MCP', tokens: 9_000, color: '', kind: 'deferred' },
          { id: 'skills', name: 'Skills', tokens: 0, color: '', kind: 'used' },
          { id: 'free_space', name: 'Free space', tokens: 170_000, color: '', kind: 'free' },
        ],
      },
      { cacheMs: CACHE_1_H, ultimoPedido: 1000 },
    )
    expect(conDesglose.categorias?.map((c) => [c.id, c.clase])).toEqual([
      ['messages', 'usado'],
      ['system_prompt', 'usado'],
      ['free_space', 'libre'],
    ])
    expect(conDesglose).toMatchObject({ cacheMs: CACHE_1_H, ultimoPedido: 1000 })

    const lista = [
      {
        value: 'default',
        displayName: 'Default (recommended)',
        description: 'Opus 5.5',
        supportsEffort: true,
        supportedEffortLevels: ['low' as const, 'medium' as const, 'high' as const],
        resolvedModel: 'claude-opus-5-5',
      },
      { value: 'haiku', displayName: 'Haiku 5.5', description: 'Rápido', supportsEffort: false },
    ]
    expect(modelosDe(lista)).toEqual([
      {
        id: 'default',
        nombre: 'Default (recommended)',
        descripcion: 'Opus 5.5',
        esfuerzos: ['low', 'medium', 'high'],
        modeloReal: 'claude-opus-5-5',
        esfuerzoPredeterminado: null,
      },
      {
        id: 'haiku',
        nombre: 'Haiku 5.5',
        descripcion: 'Rápido',
        esfuerzos: [],
        modeloReal: null,
        esfuerzoPredeterminado: null,
      },
    ])
    // El esfuerzo que guardó /effort de Claude Code para ese modelo (Q-77: «Opus 5.5 · Medio»).
    const guardados = esfuerzosGuardados(
      JSON.stringify({ model: 'opus', modelSettings: { 'claude-opus-5-5': { effortLevel: 'medium' } } }),
    )
    expect(modelosDe(lista, guardados)[0]?.esfuerzoPredeterminado).toBe('medium')
    // Uno que el modelo no acepta, o un settings.json roto, no se usa.
    expect(
      modelosDe(lista, esfuerzosGuardados('{"effortLevel":"max"}'))[0]?.esfuerzoPredeterminado,
    ).toBeNull()
    expect(esfuerzosGuardados('{ roto')).toEqual({ todos: null, porModelo: {} })
  })
})

describe('el modelo y el esfuerzo de cada proyecto (C-58)', () => {
  it('se guardan por proyecto; uno roto se descarta sin perder los demás', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'iridium-cfg-'))
    try {
      const archivo = join(dir, 'config.json')
      await writeFile(
        archivo,
        JSON.stringify({
          ajustesIa: {
            'C:/Alfa': { modelo: 'opus', esfuerzo: 'high' },
            'C:/Roto': { esfuerzo: 'muchísimo' },
          },
        }),
      )
      const p = preferenciasDe(await new ArchivoConfig(archivo).leer())
      expect(p.ajustesIa).toEqual({ 'C:/Alfa': { modelo: 'opus', esfuerzo: 'high' } })
      expect(() =>
        CambioPreferencias.parse({ ajustesIa: { x: { modelo: null, esfuerzo: 'enorme' } } }),
      ).toThrow()
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('el frente elegido en la Bandeja de cada proyecto (R-55)', () => {
  it('se guarda por proyecto (el núcleo, vacío); uno roto se descarta sin perder los demás', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'iridium-cfg-'))
    try {
      const archivo = join(dir, 'config.json')
      await writeFile(
        archivo,
        JSON.stringify({ filtrosBandeja: { 'C:/Alfa': 'Compartir', 'C:/Beta': '', 'C:/Roto': 7 } }),
      )
      const p = preferenciasDe(await new ArchivoConfig(archivo).leer())
      expect(p.filtrosBandeja).toEqual({ 'C:/Alfa': 'Compartir', 'C:/Beta': '' })
      // Sin el campo (un config.json de antes), ninguno.
      await writeFile(archivo, JSON.stringify({ version: 1 }))
      expect(preferenciasDe(await new ArchivoConfig(archivo).leer()).filtrosBandeja).toEqual({})
      expect(() => CambioPreferencias.parse({ filtrosBandeja: { x: 'a'.repeat(201) } })).toThrow()
      const muchos = Object.fromEntries(Array.from({ length: 201 }, (_, i) => [`C:/P${i}`, 'Diseño']))
      expect(() => CambioPreferencias.parse({ filtrosBandeja: muchos })).toThrow()
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('el registro del día', () => {
  it('una línea por cosa, sin saltos; borra los de más de 14 días', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'iridium-reg-'))
    try {
      expect(nombreDelDia(AHORA)).toBe('2026-10-29.log')
      expect(lineaDeRegistro(AHORA, 'falló:\n  algo')).toBe('12:00:00 falló: · algo\n')
      await writeFile(join(dir, '2026-10-01.log'), 'viejo\n')
      await writeFile(join(dir, '2026-10-20.log'), 'reciente\n')
      await writeFile(join(dir, 'otro.txt'), 'no es un registro\n')
      const r = new Registro(dir, () => AHORA)
      r.escribir('Arranca Iridium')
      r.escribir('Error del motor en Alfa: falla')
      await r.listo()
      await r.limpiar()
      expect((await readdir(dir)).sort()).toEqual(['2026-10-20.log', '2026-10-29.log', 'otro.txt'])
      expect(await readFile(join(dir, '2026-10-29.log'), 'utf8')).toBe(
        '12:00:00 Arranca Iridium\n12:00:00 Error del motor en Alfa: falla\n',
      )
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('la conversación con el uso, el contexto y los errores (I-6)', () => {
  let raiz: string
  let alfa: string
  let cambios: CambioConversacion[]
  beforeEach(async () => {
    raiz = await mkdtemp(join(tmpdir(), 'iridium-i6-'))
    alfa = join(raiz, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    cambios = []
  })
  afterEach(async () => {
    await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
  })

  async function hasta(condicion: () => boolean, ms = 2_000): Promise<void> {
    const fin = Date.now() + ms
    while (!condicion()) {
      if (Date.now() > fin) throw new Error('No pasó a tiempo')
      await new Promise((r) => setTimeout(r, 5))
    }
  }

  function armar(o: { motor?: Motor; estado?: EstadoMotor; ajuste?: AjusteIa } = {}) {
    const usos: UsoMotor[] = []
    const lineas: string[] = []
    const registro = new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json'))
    const c = new Conversaciones({
      motor: o.motor ?? crearMotorFalso({ pasoMs: 5 }),
      registro,
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => cambios.push(x),
      ajuste: async () => o.ajuste ?? { modelo: null, esfuerzo: null },
      motorListo: async () => o.estado ?? { tipo: 'listo', suscripcion: 'max', modelos: [] },
      alUso: (u) => usos.push(u),
      registrar: (t) => lineas.push(t),
    })
    return { c, usos, lineas, registro }
  }
  const ultimo = () => cambios.at(-1)
  const entradas = () => cambios.flatMap((x) => x.entradas)

  it('al terminar un turno llegan el contexto de la conversación y el uso', async () => {
    const { c, usos } = armar()
    await c.seguir(alfa, {})
    await hasta(() => ultimo()?.contexto !== null && ultimo()?.ficha?.estado === 'terminada')
    expect(ultimo()?.contexto).toMatchObject({ usados: 50_000, maximo: 200_000, porcentaje: 25 })
    // Con la sesión: el desglose y desde cuándo corre la caché (Q-77).
    expect(ultimo()?.contexto?.categorias?.length).toBeGreaterThan(0)
    expect(ultimo()?.contexto?.ultimoPedido).toBeGreaterThan(0)
    expect(usos.at(-1)?.cincoHoras?.usado).toBe(36)
  })

  it('una conversación guardada lee su contexto al abrirla, sin mandar nada', async () => {
    const motor = crearMotorFalso({ pasoMs: 5 })
    const primero = armar({ motor })
    await primero.c.seguir(alfa, {})
    await hasta(() => ultimo()?.ficha?.estado === 'terminada')
    // Otra vez la app: no sabe el contexto hasta leerlo.
    cambios = []
    const { c } = armar({ motor })
    const v = await c.abrir(alfa)
    expect(v.contexto).toBeNull()
    await hasta(() => ultimo()?.contexto != null)
    expect(ultimo()?.contexto?.porcentaje).toBe(25)
    // Del historial no hay desglose; la caché corre desde la última vez que se escribió la conversación.
    expect(ultimo()?.contexto?.categorias).toBeNull()
    expect(ultimo()?.contexto?.ultimoPedido).toBe(v.modificada)
    expect(ultimo()?.entradas).toEqual([])
  })

  it('la sesión se abre con el modelo y el esfuerzo del proyecto, y se cambian mientras trabaja', async () => {
    const ajustes: AjusteIa[] = []
    const motor = crearMotorFalso({ pasoMs: 20, alAjuste: (_c, a) => ajustes.push(a) })
    const { c } = armar({ motor, ajuste: { modelo: 'opus', esfuerzo: 'high' } })
    await c.seguir(alfa, { texto: 'algo lento' })
    c.ajustar(alfa, { modelo: 'haiku', esfuerzo: null })
    expect(ajustes).toEqual([
      { modelo: 'opus', esfuerzo: 'high' },
      { modelo: 'haiku', esfuerzo: null },
    ])
    await c.detener(alfa)
  })

  it('sin sesión iniciada no abre nada: avisa cómo y deja Reintentar con lo que se escribió (F-5)', async () => {
    let abiertas = 0
    const falso = crearMotorFalso({ pasoMs: 5 })
    const motor: Motor = {
      ...falso,
      abrir: (o, f) => {
        abiertas++
        return falso.abrir(o, f)
      },
    }
    const { c } = armar({ motor, estado: { tipo: 'sin-sesion' } })
    await c.seguir(alfa, { texto: 'Hacé la grilla' })
    expect(abiertas).toBe(0)
    expect(entradas()).toEqual([
      { tipo: 'sin-sesion', id: expect.any(String), reintentar: 'Hacé la grilla', enviado: false },
    ])
    expect(ultimo()?.ficha).toBeNull()
  })

  it('el uso agotado avisa cuándo se libera; la ficha queda en error y se registra (F-5)', async () => {
    const { c, lineas, usos } = armar()
    await c.seguir(alfa, { texto: 'esto se va a quedar agotado' })
    await hasta(() => ultimo()?.ficha?.estado === 'error')
    const aviso = entradas().find((e) => e.tipo === 'uso-agotado')
    expect(aviso).toMatchObject({ tipo: 'uso-agotado', libera: expect.any(Number) })
    expect(ultimo()?.ficha?.motivo).toBe('Se agotó el uso de la suscripción')
    expect(usos.at(-1)?.cincoHoras).toMatchObject({ usado: 100, agotada: true })
    expect(lineas).toEqual([expect.stringMatching(/^Error del motor en Alfa: uso-agotado/)])
  })

  it('la sesión que pierde el inicio de sesión a mitad avisa como sin sesión; otra falla, con su motivo', async () => {
    const { c } = armar()
    await c.seguir(alfa, { texto: 'sin sesión' })
    await hasta(() => ultimo()?.ficha?.estado === 'error')
    expect(entradas().at(-1)).toMatchObject({ tipo: 'sin-sesion', reintentar: null, enviado: true })
    await c.seguir(alfa, { texto: 'una falla' })
    await hasta(() => entradas().filter((e) => e.tipo === 'aviso').length === 1)
    expect(entradas().at(-1)).toMatchObject({
      tipo: 'aviso',
      clase: 'error',
      texto: expect.stringContaining('error de prueba'),
    })
  })

  it('sin red avisa cada reintento mientras trabaja y termina en castellano, sin el error técnico (Defecto 10)', async () => {
    const { c, lineas } = armar()
    await c.seguir(alfa, { texto: 'sin red' })
    await hasta(() => ultimo()?.ficha?.reintento?.intento === 1)
    expect(ultimo()?.ficha).toMatchObject({
      estado: 'trabajando',
      reintento: { intento: 1, maximo: 3, causa: 'conexion' },
    })
    await hasta(() => ultimo()?.ficha?.estado === 'error')
    expect(cambios.map((x) => x.ficha?.reintento?.intento).filter(Boolean)).toEqual([1, 2, 3])
    expect(ultimo()?.ficha?.motivo).toBe('Sin conexión con Claude')
    const aviso = entradas().at(-1)
    expect(aviso).toMatchObject({
      tipo: 'aviso',
      clase: 'error',
      texto: expect.stringMatching(/^No hay conexión con Claude/),
    })
    expect(JSON.stringify(entradas())).not.toMatch(/API Error|Connection refused/)
    // El motivo técnico queda en el registro, para buscar la causa.
    expect(lineas).toEqual([
      expect.stringMatching(/^Error del motor en Alfa: sin-conexion — API Error: Connection refused/),
    ])
  })

  it('si vuelve la conexión, el aviso de reintento se va con lo próximo que llega', async () => {
    const eventos: ((e: EventoMotor) => void)[] = []
    const base = crearMotorFalso({ pasoMs: 5 })
    const motor: Motor = {
      ...base,
      abrir(o, alEvento) {
        eventos.push(alEvento)
        return base.abrir(o, alEvento)
      },
    }
    const { c } = armar({ motor })
    await c.seguir(alfa, { texto: 'algo' })
    await hasta(() => eventos.length === 1)
    eventos[0]?.({
      tipo: 'reintento',
      reintento: { intento: 2, maximo: 10, esperaMs: 1000, causa: 'servidor' },
    })
    expect(ultimo()?.ficha?.reintento).toMatchObject({ intento: 2, causa: 'servidor' })
    await hasta(() => ultimo()?.entradas.length === 1)
    expect(ultimo()?.ficha?.reintento).toBeNull()
  })

  it('el reintento y el error de Claude Code, en palabras de la app (Defecto 10)', () => {
    expect(reintentoDe({ attempt: 3, max_retries: 10, retry_delay_ms: 4000, error_status: null })).toEqual({
      intento: 3,
      maximo: 10,
      esperaMs: 4000,
      causa: 'conexion',
    })
    expect(reintentoDe({ attempt: 1, max_retries: 10, retry_delay_ms: 500, error_status: 529 }).causa).toBe(
      'servidor',
    )
    expect(esSinConexion('API Error: Connection refused. Retrying in 30 seconds…')).toBe(true)
    expect(esSinConexion('API Error: Unable to connect to API (ConnectionRefused)')).toBe(true)
    expect(esSinConexion('getaddrinfo ENOTFOUND api.anthropic.com')).toBe(true)
    expect(esSinConexion('Claude Code devolvió un error de prueba')).toBe(false)
  })

  it('cerrar igual frena las que trabajan y guarda que se las detuvo (F-6)', async () => {
    const { c, registro } = armar({ motor: crearMotorFalso({ pasoMs: 50 }) })
    await c.seguir(alfa, { texto: 'algo lento' })
    expect(c.enMarcha()).toEqual([alfa])
    await c.detenerTodo()
    expect(c.enMarcha()).toEqual([])
    const id = cambios.find((x) => x.id)?.id ?? ''
    expect((await registro.de(id))?.detenida).toBe(true)
  })
})
