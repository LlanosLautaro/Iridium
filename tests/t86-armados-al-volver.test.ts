// T-86 (frente Abrir): el aviso «Mientras no estabas» cuenta las apps que se armaron solas. Qué armado entra, cómo
// queda en `arranques.json` (y los archivos de antes), lo que va a la ventana con Listo, y el vigía que avisa al terminar.
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Arranque } from '../src/main/app/arranque'
import { armadoParaElAviso, armadosParaElAviso, SIN_USAR_PARA_EL_AVISO_S } from '../src/main/core/arranque'
import { ArchivoArranques, type ArmadoSinUsar } from '../src/main/infra/arranques'

const HORA = 3_600_000
const A_LAS_4 = new Date(2026, 10, 26, 4, 10).getTime()
const ALFA = 'C:\\P\\Alfa'
const BETA = 'C:\\P\\Beta'

const armado = (cuando: number, ruta: string, resultado: 'ok' | 'falla' = 'ok'): ArmadoSinUsar => ({
  cuando,
  ruta,
  nombre: ruta === ALFA ? 'Alfa' : 'Beta',
  resultado,
  ...(resultado === 'falla' ? { motivo: 'El armado se cortó antes de terminar.' } : {}),
})

describe('qué armado va al aviso al volver', () => {
  it('el que salió bien o falló con Iridium sin usar 5 minutos o más; «ocupada» nunca', () => {
    expect(armadoParaElAviso('ok', SIN_USAR_PARA_EL_AVISO_S)).toBe(true)
    expect(armadoParaElAviso('falla', 4 * 3600)).toBe(true)
    // El usuario estaba delante: lo vio en la Señal de la tarjeta.
    expect(armadoParaElAviso('ok', SIN_USAR_PARA_EL_AVISO_S - 1)).toBe(false)
    expect(armadoParaElAviso('ocupada', 4 * 3600)).toBe(false)
  })

  it('los que no se mostraron, la última de cada app, del más viejo al más nuevo', () => {
    const armados = [
      armado(A_LAS_4 + 2 * HORA, BETA),
      armado(A_LAS_4, ALFA, 'falla'),
      armado(A_LAS_4 + HORA, ALFA),
      // Ya se vio con Listo.
      armado(A_LAS_4 - HORA, BETA, 'falla'),
    ]
    expect(armadosParaElAviso(armados, A_LAS_4 - HORA)).toEqual([
      armado(A_LAS_4 + HORA, ALFA),
      armado(A_LAS_4 + 2 * HORA, BETA),
    ])
    expect(armadosParaElAviso(armados, A_LAS_4 + 2 * HORA)).toEqual([])
  })
})

let datos: string
beforeEach(async () => {
  datos = await mkdtemp(join(tmpdir(), 'iridium-t86-'))
})
afterEach(async () => {
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

describe('arranques.json', () => {
  it('un archivo de antes, sin armados, se lee igual; uno roto se deja afuera', async () => {
    await writeFile(
      join(datos, 'arranques.json'),
      JSON.stringify({ version: 1, vistoHasta: 5, programado: null, momentos: [] }),
    )
    expect((await new ArchivoArranques(join(datos, 'arranques.json')).leer()).armados).toEqual([])
    await writeFile(
      join(datos, 'arranques.json'),
      JSON.stringify({
        version: 1,
        vistoHasta: 5,
        programado: null,
        momentos: [],
        armados: [{ cuando: 'roto' }, armado(A_LAS_4, ALFA)],
      }),
    )
    const d = await new ArchivoArranques(join(datos, 'arranques.json')).leer()
    expect(d.armados).toEqual([armado(A_LAS_4, ALFA)])
    expect(d.vistoHasta).toBe(5)
  })

  it('guarda solo los últimos 7 días', async () => {
    const archivo = new ArchivoArranques(join(datos, 'arranques.json'))
    await archivo.anotarArmado(armado(A_LAS_4 - 8 * 24 * HORA, BETA))
    await archivo.anotarArmado(armado(A_LAS_4, ALFA))
    const otra = new ArchivoArranques(join(datos, 'arranques.json'))
    expect((await otra.leer()).armados).toEqual([armado(A_LAS_4, ALFA)])
  })
})

describe('lo que va a la ventana', () => {
  it('los armados del aviso, con su motivo; Listo los da por vistos junto con lo demás', async () => {
    const archivo = new ArchivoArranques(join(datos, 'arranques.json'))
    const a = new Arranque({
      ajuste: async () => ({ prendido: false, hora: '03:00' }),
      usoActual: () => null,
      leerUso: async () => null,
      candidatos: async () => [],
      sesionLista: async () => true,
      arrancar: async () => {},
      archivo,
      segundosSinUsar: () => 4 * 3600,
    })
    await archivo.anotarArmado(armado(A_LAS_4, ALFA, 'falla'))
    await archivo.anotarArmado(armado(A_LAS_4 + HORA, BETA))
    const e = await a.estado()
    expect(e.aviso).toEqual([])
    expect(e.armados).toEqual([
      {
        cuando: A_LAS_4,
        ruta: ALFA,
        nombre: 'Alfa',
        resultado: 'falla',
        motivo: 'El armado se cortó antes de terminar.',
      },
      { cuando: A_LAS_4 + HORA, ruta: BETA, nombre: 'Beta', resultado: 'ok', motivo: null },
    ])
    await a.visto(A_LAS_4 + HORA)
    expect((await a.estado()).armados).toEqual([])
  })
})
