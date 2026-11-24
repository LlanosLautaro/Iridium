// PA-I4 (frente Paridad, Capacidades, T-28; D-189): las reglas de la sección, la frontera (el estado de cada conector,
// los apagados por sesión y Conectar), los complementos en disco, la app y `config.json`. Sin abrir Claude Code.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  accionDe,
  cambiarApagado,
  deDonde,
  detalleComplemento,
  estadoEnPalabras,
  NOMBRE_CONECTOR,
  nombreVisible,
  ordenarComplementos,
  ordenarConectores,
} from '../src/compartido/capacidades'
import { Capacidades } from '../src/main/app/capacidades'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { archivoCapacidades } from '../src/main/infra/capacidades'
import { ArchivoConfig, preferenciasDe } from '../src/main/infra/config'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { leerComplementos } from '../src/main/infra/skills'
import { CambioPreferencias, NombreConector } from '../src/main/ipc/esquemas'
import { crearMotorFalso } from '../src/main/motor/motor'
import { apagadosDeSesion, capacidadesDe, conectorDe, crearMotorSdk } from '../src/main/motor/sdk'

let raiz: string
beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-pa4-'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

describe('las reglas de Capacidades (ux.md › PA-7 a PA-9)', () => {
  it('el nombre sin de dónde sale, con mayúsculas, y de dónde sale en palabras', () => {
    expect(nombreVisible('plugin:design:figma')).toBe('Figma')
    expect(nombreVisible('plugin:engineering:google calendar')).toBe('Google Calendar')
    expect(nombreVisible('claude.ai Claude Docs')).toBe('Claude Docs')
    expect(nombreVisible('mio')).toBe('Mio')
    expect(deDonde('plugin:design:figma')).toBe('de design')
    expect(deDonde('claude.ai Gmail')).toBe('de claude.ai')
    expect(deDonde('mio')).toBe('agregado en Claude Code')
  })

  it('el estado en palabras y su botón: verde lo que anda, rojo lo que falla, Conectar lo que pide sesión', () => {
    expect(estadoEnPalabras('conectado', false)).toEqual({ texto: 'conectado', tono: 'verde' })
    expect(estadoEnPalabras('falta-sesion', false)).toEqual({ texto: 'falta iniciar sesión', tono: null })
    expect(estadoEnPalabras('falla', false)).toEqual({ texto: 'no anda', tono: 'rojo' })
    expect(estadoEnPalabras('sin-configurar', false).texto).toBe('sin configurar')
    expect(estadoEnPalabras('falla', true)).toEqual({ texto: 'apagado', tono: null })
    expect(accionDe('falta-sesion', false)).toBe('conectar')
    expect(accionDe('falla', false)).toBe('reintentar')
    expect(accionDe('falta-sesion', true)).toBeNull()
    expect(accionDe('conectado', false)).toBeNull()
    expect(accionDe('sin-configurar', false)).toBeNull()
  })

  it('los que fallan primero, después los que piden sesión y los que andan; los apagados al final', () => {
    const lista = ordenarConectores([
      { nombre: 'claude.ai Gmail', estado: 'conectado', apagado: false },
      { nombre: 'plugin:design:figma', estado: 'falta-sesion', apagado: false },
      { nombre: 'plugin:engineering:linear', estado: 'falla', apagado: true },
      { nombre: 'plugin:engineering:datadog', estado: 'falla', apagado: false },
      { nombre: 'plugin:engineering:asana', estado: 'falta-sesion', apagado: false },
    ])
    expect(lista.map((c) => nombreVisible(c.nombre))).toEqual([
      'Datadog',
      'Asana',
      'Figma',
      'Gmail',
      'Linear',
    ])
  })

  it('los complementos: los de la cuenta primero, con quién los hace, sus skills y sus conectores', () => {
    const lista = ordenarComplementos([
      { nombre: 'iridium', autor: null, origen: 'iridium', skills: 1, conectores: 0 },
      { nombre: 'engineering', autor: 'Anthropic', origen: 'cuenta', skills: 10, conectores: 7 },
    ])
    expect(lista.map(detalleComplemento)).toEqual([
      'Anthropic · 10 skills · 7 conectores',
      'Iridium · 1 skill',
    ])
  })

  it('apagar suma una sola vez y prender saca', () => {
    expect(cambiarApagado([], 'a', false)).toEqual(['a'])
    expect(cambiarApagado(['a'], 'a', false)).toEqual(['a'])
    expect(cambiarApagado(['a', 'b'], 'a', true)).toEqual(['b'])
  })

  it('un nombre que podría romper la línea de la consola no pasa (D-189 › Seguridad)', () => {
    for (const bien of ['plugin:design:figma', 'claude.ai Google Calendar', 'plugin:x:mi-servidor_2'])
      expect(NOMBRE_CONECTOR.test(bien)).toBe(true)
    for (const mal of ['a" & del *', 'a%PATH%', 'a^b', 'a|b', 'a\nb', ''])
      expect(NOMBRE_CONECTOR.test(mal)).toBe(false)
    expect(() => NombreConector.parse('x" && calc')).toThrow()
  })
})

describe('la frontera real (D-189 › 1 a 3)', () => {
  it('el estado de Claude Code en palabras de Iridium; uno sin dirección no es una falla', () => {
    expect(conectorDe({ name: 'a', status: 'connected' }).estado).toBe('conectado')
    expect(conectorDe({ name: 'a', status: 'needs-auth' }).estado).toBe('falta-sesion')
    expect(
      conectorDe({ name: 'a', status: 'failed', error: 'No URL configured for this server' }).estado,
    ).toBe('sin-configurar')
    expect(conectorDe({ name: 'a', status: 'failed', error: 'ECONNREFUSED' }).estado).toBe('falla')
    // Pasado el tope de espera, uno que sigue conectando cuenta como que no anda.
    expect(conectorDe({ name: 'a', status: 'pending' }).estado).toBe('falla')
    expect(conectorDe({ name: 'a', status: 'disabled' }).estado).toBe('apagado-afuera')
  })

  it('cada complemento suma los conectores que llevan su nombre (los de S-8)', () => {
    const c = capacidadesDe(
      [
        { name: 'plugin:design:figma', status: 'needs-auth' },
        { name: 'plugin:design:gmail', status: 'failed', error: 'No URL configured for this server' },
        { name: 'plugin:engineering:slack', status: 'needs-auth' },
        { name: 'claude.ai Claude Docs', status: 'connected' },
      ],
      [
        { nombre: 'design', autor: 'Anthropic', origen: 'cuenta', skills: 7 },
        { nombre: 'iridium', autor: null, origen: 'iridium', skills: 1 },
      ],
    )
    expect(c.complementos.map((x) => [x.nombre, x.conectores])).toEqual([
      ['design', 2],
      ['iridium', 0],
    ])
    expect(c.conectores).toHaveLength(4)
  })

  it('los apagados van como ajuste de la sesión, que no escribe nada (S-8); sin apagados, nada', () => {
    expect(apagadosDeSesion([])).toEqual({})
    expect(apagadosDeSesion()).toEqual({})
    expect(apagadosDeSesion(['plugin:design:figma', 'claude.ai Gmail'])).toEqual({
      managedSettings: {
        deniedMcpServers: [{ serverName: 'plugin:design:figma' }, { serverName: 'claude.ai Gmail' }],
      },
    })
  })

  it('Conectar corre `claude mcp login` en la consola de adentro, con el nombre entre comillas', async () => {
    const pedidos: string[][] = []
    const motor = crearMotorSdk({
      rutaClaude: 'C:\\Claude\\claude.exe',
      consola: async (nombre, comando) => {
        pedidos.push([nombre, comando])
      },
    })
    await motor.conectar('plugin:engineering:google calendar')
    expect(pedidos).toEqual([
      [
        'Conectar plugin:engineering:google calendar',
        '"C:\\Claude\\claude.exe" mcp login "plugin:engineering:google calendar"',
      ],
    ])
    await expect(motor.conectar('a" & calc')).rejects.toThrow()
    expect(pedidos).toHaveLength(1)
  })
})

describe('los complementos en disco', () => {
  it('los de la cuenta (la generación más nueva) y los de Iridium, con su autor y sus skills', async () => {
    const claude = join(raiz, '.claude')
    const cuenta = join(claude, 'plugins', 'synced', 'cuenta-1')
    const complemento = async (carpeta: string, json: object | null, skills: string[]) => {
      await mkdir(join(carpeta, '.claude-plugin'), { recursive: true })
      if (json) await writeFile(join(carpeta, '.claude-plugin', 'plugin.json'), JSON.stringify(json))
      for (const s of skills) await mkdir(join(carpeta, 'skills', s), { recursive: true })
    }
    await complemento(join(cuenta, 'uuid-1'), { name: 'engineering', author: { name: 'Anthropic' } }, [
      'a',
      'b',
    ])
    await complemento(join(cuenta, 'beta'), { name: 'beta', author: { name: 'Viejo' } }, ['a'])
    await complemento(join(cuenta, 'beta~g2'), { name: 'beta', author: { name: 'Nuevo' } }, ['a', 'b', 'c'])
    await complemento(join(cuenta, 'sin-json'), null, [])
    await complemento(join(raiz, 'iridium'), { name: 'iridium' }, ['iridium'])

    const lista = await leerComplementos(claude, [join(raiz, 'iridium')])
    expect(lista.sort((a, b) => a.nombre.localeCompare(b.nombre))).toEqual([
      { nombre: 'beta', autor: 'Nuevo', origen: 'cuenta', skills: 3 },
      { nombre: 'engineering', autor: 'Anthropic', origen: 'cuenta', skills: 2 },
      { nombre: 'iridium', autor: null, origen: 'iridium', skills: 1 },
      { nombre: 'sin-json', autor: null, origen: 'cuenta', skills: 0 },
    ])
  })

  it('sin carpeta de complementos, ninguno', async () => {
    expect(await leerComplementos(join(raiz, 'no-existe'), [])).toEqual([])
  })
})

describe('la app (PA-7 a PA-9)', () => {
  it('la lista del motor con lo apagado en Iridium', async () => {
    const cap = new Capacidades({
      motor: crearMotorFalso({ pasoMs: 1 }),
      apagados: async () => ['plugin:engineering:linear'],
    })
    const v = await cap.vista()
    if (v.tipo !== 'ok') throw new Error('sin lista')
    expect(v.complementos.map((c) => c.nombre)).toEqual(['engineering', 'design'])
    expect(v.conectores.find((c) => c.nombre === 'plugin:engineering:linear')?.apagado).toBe(true)
    expect(v.conectores.find((c) => c.nombre === 'plugin:design:figma')?.apagado).toBe(false)
  })

  it('Conectar acepta solo uno de la lista y al terminar trae la lista de nuevo', async () => {
    const cap = new Capacidades({ motor: crearMotorFalso({ pasoMs: 1 }), apagados: async () => [] })
    await expect(cap.conectar('plugin:design:figma')).rejects.toThrow()
    await cap.vista()
    await expect(cap.conectar('plugin:otro:x')).rejects.toThrow()
    const v = await cap.conectar('plugin:design:figma')
    if (v.tipo !== 'ok') throw new Error('sin lista')
    expect(v.conectores.find((c) => c.nombre === 'plugin:design:figma')?.estado).toBe('conectado')
  })

  it('un motor sin capacidades: la sección no va; uno que falla: el error, sin romper', async () => {
    const sin = new Capacidades({ motor: crearMotorFalso({ capacidades: false }), apagados: async () => [] })
    expect(sin.disponible()).toBe(false)
    expect(await sin.vista()).toEqual({ tipo: 'error' })
    const anotado: string[] = []
    const motor = crearMotorFalso({ pasoMs: 1 })
    motor.capacidadesSesion = async () => {
      throw new Error('Claude Code no respondió a tiempo')
    }
    const falla = new Capacidades({ motor, apagados: async () => [], anotar: (t) => anotado.push(t) })
    expect(await falla.vista()).toEqual({ tipo: 'error' })
    expect(anotado[0]).toMatch(/no respondió/)
  })

  it('la última lista queda en capacidades.json y se ve al volver, con lo apagado de ahora (Q-287)', async () => {
    const archivo = join(raiz, 'datos', 'capacidades.json')
    let apagados: string[] = []
    const nueva = () =>
      new Capacidades({
        motor: crearMotorFalso({ pasoMs: 1 }),
        apagados: async () => apagados,
        guardada: archivoCapacidades(archivo),
      })
    expect(await nueva().guardada()).toBeNull()
    const vista = await nueva().vista()
    // Otra Iridium (cerrar y abrir): la lista guardada, sin pedirla al motor.
    apagados = ['plugin:engineering:linear']
    const guardada = await nueva().guardada()
    if (guardada?.tipo !== 'ok' || vista.tipo !== 'ok') throw new Error('sin lista')
    expect(guardada.complementos).toEqual(vista.complementos)
    expect(guardada.conectores.find((c) => c.nombre === 'plugin:engineering:linear')?.apagado).toBe(true)
    // Rota, es como si no estuviera.
    await writeFile(archivo, '{ "version": 1, "conectores": "x" }')
    expect(await nueva().guardada()).toBeNull()
  })

  it('las sesiones nuevas se abren sin los apagados (D-189 › 2)', async () => {
    const alfa = join(raiz, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    const vistos: string[][] = []
    const c = new Conversaciones({
      motor: crearMotorFalso({ pasoMs: 1, alApagados: (_, a) => vistos.push(a) }),
      registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: () => {},
      apagados: async () => ['plugin:design:figma'],
    })
    await c.seguir(alfa, { texto: 'hola' })
    expect(vistos).toEqual([['plugin:design:figma']])
  })
})

describe('config.json (D-189)', () => {
  it('de entrada todo apagado y ningún conector apagado; uno roto vuelve a eso', async () => {
    const archivo = join(raiz, 'config.json')
    expect(preferenciasDe(await new ArchivoConfig(archivo).leer()).capacidades).toEqual({
      navegador: false,
      pc: false,
      conectoresApagados: [],
    })
    await writeFile(archivo, JSON.stringify({ capacidades: { navegador: 'sí' } }))
    expect((await new ArchivoConfig(archivo).leer()).capacidades.conectoresApagados).toEqual([])
  })

  it('se guarda y se lee; la ventana no puede mandar otra cosa', async () => {
    const archivo = join(raiz, 'config.json')
    const capacidades = { navegador: false, pc: false, conectoresApagados: ['plugin:design:figma'] }
    await new ArchivoConfig(archivo).guardar({ capacidades })
    expect((await new ArchivoConfig(archivo).leer()).capacidades).toEqual(capacidades)
    expect(CambioPreferencias.safeParse({ capacidades }).success).toBe(true)
    expect(CambioPreferencias.safeParse({ capacidades: { ...capacidades, otra: 1 } }).success).toBe(false)
  })
})
