// PA-I1 (frente Paridad): los comandos con «/». Las reglas de la lista y de los escondidos, la frontera real con
// muestras del SDK y de un historial real (sin datos del usuario), la memoria de la lista y la conversación con el
// motor falso (no abre Claude Code ni gasta uso).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { SessionMessage, SlashCommand } from '@anthropic-ai/claude-agent-sdk'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  type ComandoMotor,
  comandoDe,
  comandoPrimero,
  conComando,
  consultaDe,
  escondidoDe,
  filtrarComandos,
  lineaDeEscondido,
  sumarReciente,
} from '../src/compartido/comandos'
import type { CambioConversacion } from '../src/compartido/puente'
import { Comandos, VIGENCIA_COMANDOS_MS } from '../src/main/app/comandos'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { AVISO_DETENIDA } from '../src/main/core/sesiones'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import {
  COMANDOS_FALSOS,
  crearMotorFalso,
  crearMotorQueFalla,
  escondidosDe,
  type Motor,
  SKILL_NUEVA_FALSA,
} from '../src/main/motor/motor'
import {
  comandoGuardado,
  comandosDe,
  ESCONDIDOS,
  mensajesDeHistorial,
  salidasDeComandos,
  textoDeUsuario,
} from '../src/main/motor/sdk'

const ESCONDIDOS_FALSOS = escondidosDe(COMANDOS_FALSOS)

describe('las reglas de la lista de «/» (PA-1)', () => {
  it('un mensaje empieza con un comando solo si arranca con «/nombre»; una ruta no lo es', () => {
    expect(comandoDe('/compact conserva lo del instalador')).toEqual({
      nombre: 'compact',
      resto: 'conserva lo del instalador',
    })
    expect(comandoDe('/recap')).toEqual({ nombre: 'recap', resto: '' })
    expect(comandoDe('/engineering:debug falla al armar')).toMatchObject({ nombre: 'engineering:debug' })
    expect(comandoDe('Usá /compact')).toBeNull()
    expect(comandoDe('/')).toBeNull()
    expect(comandoDe('/carpeta/archivo.txt')).toBeNull()
  })

  it('la lista va mientras el cursor está en el comando del principio; un espacio o borrar la «/» la cierran', () => {
    expect(consultaDe('/')).toBe('')
    expect(consultaDe('/re')).toBe('re')
    expect(consultaDe('/re ')).toBeNull()
    expect(consultaDe('re')).toBeNull()
    expect(consultaDe('hola /re')).toBeNull()
    // El + › Comandos con algo escrito: la «/» al principio y el cursor ahí.
    expect(consultaDe('/ ya escrito', 1)).toBe('')
    expect(consultaDe('/re algo', 3)).toBe('re')
    expect(consultaDe('/re algo', 6)).toBeNull()
  })

  it('elegir deja «/nombre » con el cursor al final y no pierde lo que ya estaba escrito', () => {
    expect(conComando('/re', 'recap')).toEqual({ texto: '/recap ', cursor: 7 })
    expect(conComando('/ ya escrito', 'compact')).toEqual({ texto: '/compact ya escrito', cursor: 9 })
  })

  it('filtra: primero los que empiezan así (por nombre, otro nombre o después del complemento), después los que lo tienen', () => {
    const nombres = (q: string) =>
      filtrarComandos(COMANDOS_FALSOS, q).flatMap((g) => g.comandos.map((c) => c.nombre))
    expect(nombres('re')).toEqual(['recap', 'rename', 'code-review'])
    expect(nombres('ux')).toEqual(['design:ux-copy'])
    expect(nombres('debug')).toEqual(['engineering:debug'])
    // `/name` es otro nombre de `/rename`.
    expect(nombres('name')).toEqual(['rename'])
    expect(nombres('xyz')).toEqual([])
  })

  it('no ofrece los escondidos, ni por su otro nombre', () => {
    const todos = filtrarComandos(COMANDOS_FALSOS, '').flatMap((g) => g.comandos.map((c) => c.nombre))
    for (const n of ['context', 'model', 'clear', 'usage', 'color']) expect(todos).not.toContain(n)
    expect(filtrarComandos(COMANDOS_FALSOS, 'cost')[0]?.comandos).toEqual([])
    expect(filtrarComandos(COMANDOS_FALSOS, 'new')[0]?.comandos).toEqual([])
  })

  it('sin nada escrito, los usados hace poco primero y después los demás por orden alfabético', () => {
    const grupos = filtrarComandos(COMANDOS_FALSOS, '', ['rename', 'model', 'no-existe', 'compact'])
    expect(grupos.map((g) => g.titulo)).toEqual(['Usados hace poco', 'Todos'])
    // Un escondido o uno que ya no está no se ofrece aunque se haya usado.
    expect(grupos[0]?.comandos.map((c) => c.nombre)).toEqual(['rename', 'compact'])
    expect(grupos[1]?.comandos.map((c) => c.nombre)).toEqual([
      'code-review',
      'design:ux-copy',
      'engineering:debug',
      'init',
      'mi-skill',
      'recap',
    ])
    expect(filtrarComandos(COMANDOS_FALSOS, '')[0]?.titulo).toBeNull()
  })

  it('los usados hace poco: el último primero, sin repetir y hasta cinco', () => {
    expect(sumarReciente(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c'])
    expect(sumarReciente(['a', 'b', 'c', 'd', 'e'], 'f')).toEqual(['f', 'a', 'b', 'c', 'd'])
  })

  it('un escondido escrito a mano se reconoce por su nombre u otro nombre y dice dónde está eso en Iridium', () => {
    expect(escondidoDe('/clear', ESCONDIDOS_FALSOS)).toEqual({ nombre: 'clear', pisa: 'conversacion' })
    expect(escondidoDe('/new', ESCONDIDOS_FALSOS)).toEqual({ nombre: 'new', pisa: 'conversacion' })
    expect(escondidoDe('/stats ahora', ESCONDIDOS_FALSOS)).toEqual({ nombre: 'stats', pisa: 'uso' })
    expect(escondidoDe('/compact', ESCONDIDOS_FALSOS)).toBeNull()
    expect(escondidoDe('el /clear', ESCONDIDOS_FALSOS)).toBeNull()
    expect(lineaDeEscondido('conversacion')).toEqual({
      texto: 'en Iridium, otra conversación se empieza con',
      boton: 'nueva',
    })
    expect(lineaDeEscondido('modelo').texto).toBe('en Iridium, el modelo se elige abajo')
    expect(lineaDeEscondido('terminal')).toEqual({ texto: 'solo sirve en la terminal', boton: null })
  })

  it('con un comando, el comando va primero y lo citado después; sin comando, como siempre', () => {
    const armar = () => '> cita\n\nhola'
    expect(comandoPrimero('/compact resumí', '> cita', armar)).toBe('/compact resumí\n\n> cita')
    expect(comandoPrimero('/recap', '', armar)).toBe('/recap')
    expect(comandoPrimero('hola', '> cita', armar)).toBe('> cita\n\nhola')
  })
})

/** Un comando como lo da el SDK (`supportedCommands`). */
const sdk = (name: string, extra: Partial<SlashCommand> = {}): SlashCommand => ({
  name,
  description: `Para ${name}`,
  argumentHint: '',
  ...extra,
})

describe('la frontera real (D-169 › 2, 3 y 6)', () => {
  it('traduce la lista del SDK: de dónde sale cada uno, el complemento aparte y qué esconde', () => {
    const lista = comandosDe([
      sdk('clear', { builtin: true, aliases: ['reset', 'new'], argumentHint: '[name]' }),
      sdk('compact', { builtin: true, argumentHint: ' <instrucciones> ' }),
      sdk('engineering:code-review', { description: '(engineering) Review code changes' }),
      sdk('mi-skill'),
      // Una skill propia que se llama como uno de Claude Code no se esconde.
      sdk('context'),
    ])
    expect(lista).toEqual<ComandoMotor[]>([
      {
        nombre: 'clear',
        otrosNombres: ['reset', 'new'],
        argumentos: '[name]',
        descripcion: 'Para clear',
        origen: 'motor',
        complemento: null,
        escondido: 'conversacion',
      },
      {
        nombre: 'compact',
        otrosNombres: [],
        argumentos: '<instrucciones>',
        descripcion: 'Para compact',
        origen: 'motor',
        complemento: null,
        escondido: null,
      },
      {
        nombre: 'engineering:code-review',
        otrosNombres: [],
        argumentos: null,
        descripcion: 'Review code changes',
        origen: 'complemento',
        complemento: 'engineering',
        escondido: null,
      },
      {
        nombre: 'mi-skill',
        otrosNombres: [],
        argumentos: null,
        descripcion: 'Para mi-skill',
        origen: 'skill',
        complemento: null,
        escondido: null,
      },
      {
        nombre: 'context',
        otrosNombres: [],
        argumentos: null,
        descripcion: 'Para context',
        origen: 'skill',
        complemento: null,
        escondido: null,
      },
    ])
  })

  it('la tabla de escondidos cubre lo que pisa a Iridium y lo de la terminal, también por otro nombre (D-167)', () => {
    expect(ESCONDIDOS).toMatchObject({
      model: 'modelo',
      effort: 'esfuerzo',
      'output-style': 'tono',
      clear: 'conversacion',
      context: 'contexto',
      usage: 'uso',
      cost: 'uso',
      stats: 'uso',
      color: 'terminal',
    })
    expect(ESCONDIDOS.compact).toBeUndefined()
  })

  // Muestras con la forma de un historial real de Claude Code (S-5), sin datos del usuario.
  const COMANDO_REAL =
    '<command-name>/compact</command-name>\n            <command-message>compact</command-message>\n            <command-args>conserva lo del instalador</command-args>'
  const AVISO_REAL =
    '<local-command-caveat>The command below was run directly in Claude Code, not sent to you.</local-command-caveat>'

  it('un comando del historial vuelve a ser lo que se escribió, y su respuesta un mensaje de la IA (PA-5)', () => {
    expect(comandoGuardado(COMANDO_REAL)).toBe('/compact conserva lo del instalador')
    expect(
      textoDeUsuario(
        '<command-name>/context</command-name>\n<command-message>context</command-message>\n<command-args></command-args>',
      ),
    ).toEqual({ tipo: 'usuario', texto: '/context', cuando: null })
    expect(textoDeUsuario(AVISO_REAL)).toBeNull()
    expect(textoDeUsuario('<local-command-stdout>## Context Usage</local-command-stdout>')).toEqual({
      tipo: 'ia',
      texto: '## Context Usage',
      cuando: null,
      final: true,
    })
    expect(textoDeUsuario('<local-command-stdout></local-command-stdout>')).toBeNull()
  })

  it('la respuesta guardada en una línea de sistema del .jsonl va después de su comando', () => {
    const jsonl = [
      JSON.stringify({ type: 'user', uuid: 'u1', message: { role: 'user', content: COMANDO_REAL } }),
      JSON.stringify({
        type: 'system',
        subtype: 'local_command',
        parentUuid: 'u1',
        content: '<local-command-stdout>Compacté la conversación.</local-command-stdout>',
      }),
      '{"type":"system","parentUuid":"u2","content":"<local-command-stdout>a medio escr',
    ].join('\n')
    const salidas = salidasDeComandos(jsonl)
    expect([...salidas]).toEqual([['u1', 'Compacté la conversación.']])
    const historial = [
      { type: 'user', uuid: 'u0', message: { content: AVISO_REAL }, parent_tool_use_id: null },
      { type: 'user', uuid: 'u1', message: { content: COMANDO_REAL }, parent_tool_use_id: null },
      {
        type: 'assistant',
        uuid: 'a1',
        message: { content: [{ type: 'text', text: 'Sigo.' }], stop_reason: 'end_turn' },
        parent_tool_use_id: null,
      },
    ] as unknown as SessionMessage[]
    expect(mensajesDeHistorial(historial, 'D:\\Alfa', salidas)).toEqual([
      { tipo: 'usuario', texto: '/compact conserva lo del instalador', cuando: null },
      { tipo: 'ia', texto: 'Compacté la conversación.', cuando: null, final: true },
      { tipo: 'ia', texto: 'Sigo.', cuando: null, final: true },
    ])
  })
})

describe('la lista de cada carpeta (D-169 › 2)', () => {
  it('se pide una vez, se recuerda 10 minutos y una sesión la pone al día', async () => {
    let ahora = 1_000
    let pedidos = 0
    const falso = crearMotorFalso({ pasoMs: 1 })
    const motor: Motor = {
      ...falso,
      comandos: async (carpeta) => {
        pedidos++
        return falso.comandos(carpeta)
      },
    }
    const avisos: string[] = []
    const lista = new Comandos({
      motor,
      recientes: async () => ['recap'],
      alCambio: (ruta, comandos) => avisos.push(`${ruta}:${comandos.length}`),
      ahora: () => ahora,
    })
    const [a, b] = await Promise.all([lista.de('D:\\Alfa'), lista.de('D:\\Alfa')])
    expect(pedidos).toBe(1)
    expect(a).toEqual(b)
    expect(a.recientes).toEqual(['recap'])
    expect(a.comandos?.length).toBe(COMANDOS_FALSOS.length)

    ahora += VIGENCIA_COMANDOS_MS - 1
    await lista.de('D:\\Alfa')
    expect(pedidos).toBe(1)
    ahora += 2
    await lista.de('D:\\Alfa')
    expect(pedidos).toBe(2)

    lista.poner('D:\\Alfa', [...COMANDOS_FALSOS, SKILL_NUEVA_FALSA])
    expect(avisos).toEqual([`D:\\Alfa:${COMANDOS_FALSOS.length + 1}`])
    expect((await lista.de('D:\\Alfa')).comandos).toContain(SKILL_NUEVA_FALSA)
    expect(pedidos).toBe(2)
  })

  it('si el motor no la puede dar, null (la ventana dice que no se pudieron leer); sin comandos, vacía', async () => {
    const falla = new Comandos({ motor: crearMotorQueFalla('no está'), recientes: async () => [] })
    // El motor que falla no tiene comandos: la lista es vacía, sin pedirla.
    expect((await falla.de('D:\\Alfa')).comandos).toEqual([])
    const falso = crearMotorFalso({ pasoMs: 1 })
    const roto = new Comandos({
      motor: {
        ...falso,
        comandos: async () => {
          throw new Error('Claude Code no respondió a tiempo')
        },
      },
      recientes: async () => {
        throw new Error('config rota')
      },
    })
    expect(await roto.de('D:\\Alfa')).toEqual({ comandos: null, recientes: [] })
    const sin = crearMotorFalso({ pasoMs: 1, comandos: false })
    expect(sin.capacidades()).toMatchObject({ comandos: false, escondidos: {} })
    expect((await new Comandos({ motor: sin, recientes: async () => [] }).de('D:\\Alfa')).comandos).toEqual(
      [],
    )
  })
})

describe('mandar un comando desde la conversación (D-168, D-169 › 4 y 7)', () => {
  let raiz: string
  let alfa: string
  let cambios: CambioConversacion[]
  beforeEach(async () => {
    raiz = await mkdtemp(join(tmpdir(), 'iridium-pa1-'))
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
  const ficha = () => cambios.filter((x) => x.ruta === alfa).at(-1)?.ficha ?? null

  function armar(motor: Motor = crearMotorFalso({ pasoMs: 5 })) {
    const usados: string[] = []
    const listas: string[] = []
    const c = new Conversaciones({
      motor,
      registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => cambios.push(x),
      alComando: (n) => usados.push(n),
      alComandos: (ruta, comandos) => listas.push(`${ruta}:${comandos.map((x) => x.nombre).at(-1)}`),
    })
    return { c, motor, usados, listas }
  }

  it('un escondido no se manda: no abre sesión ni aparece en la conversación', async () => {
    const { c } = armar()
    await c.seguir(alfa, { texto: '/clear' })
    await c.seguir(alfa, { texto: '/stats' })
    expect(cambios).toEqual([])
    expect(ficha()).toBeNull()
  })

  it('un comando se manda tal cual, va a los usados y la IA falsa dice cuál recibió', async () => {
    const { c, usados } = armar()
    await c.seguir(alfa, { texto: '/compact conserva lo del instalador\n\n> Revisar R-3' })
    await hasta(() => ficha()?.estado === 'terminada')
    expect(usados).toEqual(['compact'])
    const entradas = cambios.flatMap((x) => x.entradas)
    expect(entradas[0]).toMatchObject({
      tipo: 'usuario',
      texto: '/compact conserva lo del instalador\n\n> Revisar R-3',
    })
    expect(entradas.find((e) => e.tipo === 'ia')).toMatchObject({
      html: expect.stringContaining('<code>/compact</code>'),
    })
  })

  it('después de Detener, el aviso de «te detuve» no va con el comando sino con el próximo mensaje', async () => {
    const { c, motor } = armar()
    await c.seguir(alfa, { texto: 'Hacé algo lento' })
    await c.detener(alfa)
    await hasta(() => ficha()?.estado === 'terminada')
    const ias = () => cambios.flatMap((x) => x.entradas).filter((e) => e.tipo === 'ia').length
    await c.seguir(alfa, { texto: '/recap' })
    await hasta(() => ficha()?.estado === 'terminada' && ias() === 1)
    await c.seguir(alfa, { texto: 'Seguí' })
    await hasta(() => ficha()?.estado === 'terminada' && ias() === 3)
    const id = cambios.at(-1)?.id as string
    const enviados = (await motor.mensajes(alfa, id)).flatMap((m) => (m.tipo === 'usuario' ? [m.texto] : []))
    expect(enviados).toEqual(['Hacé algo lento', '/recap', `${AVISO_DETENIDA}\n\nSeguí`])
  })

  it('una sesión que descubre una skill avisa la lista nueva de su carpeta', async () => {
    const { c, listas } = armar()
    await c.seguir(alfa, { texto: 'Armá una skill nueva' })
    await hasta(() => ficha()?.estado === 'terminada')
    expect(listas).toEqual([`${alfa}:skill-nueva`])
  })

  it('un motor sin comandos manda «/algo» como texto, sin tratarlo como comando', async () => {
    const { c, usados } = armar(crearMotorFalso({ pasoMs: 5, comandos: false }))
    await c.seguir(alfa, { texto: '/clear' })
    await hasta(() => ficha()?.estado === 'terminada')
    expect(usados).toEqual([])
    expect(cambios.flatMap((x) => x.entradas).filter((e) => e.tipo === 'herramienta').length).toBeGreaterThan(
      0,
    )
  })
})
