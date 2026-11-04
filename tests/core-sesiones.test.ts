// I-2: reglas de las sesiones (core) y la traducción de lo que dice Claude Code (motor), sin abrir nada.
import { describe, expect, it } from 'vitest'
import {
  AVISO_DETENIDA,
  htmlDeMensaje,
  mensajeParaLaIa,
  preguntasNuevas,
  RECIENTE_AFUERA_MS,
  usadaAfuera,
} from '../src/main/core/sesiones'
import { describirHerramienta, mensajesDeHistorial, textoDeUsuario } from '../src/main/motor/sdk'

const MIN = 60_000

describe('usadaAfuera (D-027)', () => {
  const ahora = 1_000 * MIN
  it('avisa si se tocó afuera hace menos de 10 minutos', () => {
    expect(usadaAfuera(ahora - 3 * MIN, null, ahora)).toBe(ahora - 3 * MIN)
    expect(usadaAfuera(ahora - 3 * MIN, ahora - 30 * MIN, ahora)).toBe(ahora - 3 * MIN)
  })
  it('no avisa si pasó más tiempo o si la última escritura fue del Centro', () => {
    expect(usadaAfuera(ahora - RECIENTE_AFUERA_MS - 1, null, ahora)).toBeNull()
    // El Centro terminó el turno y Claude Code terminó de escribir el historial unos segundos después.
    expect(usadaAfuera(ahora - 2 * MIN, ahora - 2 * MIN - 5_000, ahora)).toBeNull()
  })
})

describe('preguntasNuevas (H-5)', () => {
  it('son las sin responder que no estaban al empezar', () => {
    const q = (codigo: string) => ({ codigo, pregunta: '¿?', tipo: 'decisión', frena: false })
    expect(preguntasNuevas(new Set(['Q-1']), [q('Q-1'), q('Q-2')])).toEqual([q('Q-2')])
    expect(preguntasNuevas(new Set(['Q-1']), [])).toEqual([])
  })
})

describe('mensajeParaLaIa (Detener, S-2)', () => {
  it('después de Detener, le avisa a la IA que fue el usuario', () => {
    expect(mensajeParaLaIa('Seguí con el proyecto.', false)).toBe('Seguí con el proyecto.')
    expect(mensajeParaLaIa('Seguí con el proyecto.', true)).toBe(
      `${AVISO_DETENIDA}\n\nSeguí con el proyecto.`,
    )
  })
})

describe('htmlDeMensaje', () => {
  it('convierte el Markdown de la IA sin dejar pasar HTML ni enlaces que no sean de la web', () => {
    expect(htmlDeMensaje('Leí `estado.md` y **sigo**.')).toBe(
      '<p>Leí <code>estado.md</code> y <strong>sigo</strong>.</p>\n',
    )
    expect(htmlDeMensaje('<script>alert(1)</script>')).not.toContain('<script>')
    expect(htmlDeMensaje('[x](javascript:alert(1))')).not.toContain('href')
    expect(htmlDeMensaje('[x](https://ejemplo.com)')).toContain('href="https://ejemplo.com"')
  })
})

describe('describirHerramienta', () => {
  const carpeta = 'D:\\PROYECTOS\\Alfa'
  it('dice qué hizo, con la ruta relativa al proyecto', () => {
    expect(
      describirHerramienta('Read', { file_path: 'D:\\PROYECTOS\\Alfa\\docs\\estado.md' }, carpeta),
    ).toEqual({
      accion: 'Leyó',
      objeto: 'docs/estado.md',
    })
    expect(describirHerramienta('Edit', { file_path: 'D:\\Otro\\x.md' }, carpeta).objeto).toBe('D:/Otro/x.md')
    expect(
      describirHerramienta('Bash', { command: 'pnpm test', description: 'Corre las pruebas' }, carpeta),
    ).toEqual({ accion: 'Ejecutó', objeto: 'Corre las pruebas' })
    expect(describirHerramienta('mcp__docs__leer', {}, carpeta)).toEqual({
      accion: 'Usó',
      objeto: 'docs · leer',
    })
  })
})

describe('textoDeUsuario y mensajesDeHistorial', () => {
  it('quita lo que agrega Claude Code y reconoce cuando se detuvo', () => {
    expect(textoDeUsuario('<system-reminder>x</system-reminder>Seguí')).toEqual({
      tipo: 'usuario',
      texto: 'Seguí',
      cuando: null,
    })
    expect(textoDeUsuario([{ type: 'tool_result', content: 'ok' }])).toBeNull()
    expect(textoDeUsuario('<ide_opened_file>a.ts</ide_opened_file>')).toBeNull()
    expect(textoDeUsuario([{ type: 'text', text: '[Request interrupted by user]' }])).toEqual({
      tipo: 'detenida',
    })
  })

  it('arma la conversación guardada sin lo de los agentes', () => {
    const m = (type: 'user' | 'assistant', content: unknown, padre: string | null = null) => ({
      type,
      uuid: 'u',
      session_id: 's',
      message: { role: type, content },
      parent_tool_use_id: padre,
      parent_agent_id: null,
    })
    const historial = [
      m('user', 'Seguí con el proyecto.'),
      m('assistant', [
        { type: 'thinking', thinking: '…' },
        { type: 'text', text: 'Leo el estado.' },
        { type: 'tool_use', name: 'Read', input: { file_path: 'docs/estado.md' } },
      ]),
      m('user', [{ type: 'tool_result', content: '# Estado' }]),
      m('assistant', [{ type: 'text', text: 'Soy un agente.' }], 'toolu_1'),
      m('assistant', [{ type: 'text', text: 'Listo.' }]),
    ]
    expect(mensajesDeHistorial(historial, 'D:\\Alfa')).toEqual([
      { tipo: 'usuario', texto: 'Seguí con el proyecto.', cuando: null },
      { tipo: 'ia', texto: 'Leo el estado.', cuando: null },
      { tipo: 'herramienta', accion: 'Leyó', objeto: 'docs/estado.md' },
      { tipo: 'ia', texto: 'Listo.', cuando: null },
    ])
  })
})
