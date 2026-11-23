// D-171 (CO-I10) — Iridium instalado: el número de cada versión, lo que `tools/publicar.ts` le escribe a la copia y a
// `latest.yml`, y el actualizador de la copia instalada con un electron-updater falso. Lo de punta a punta (instalar,
// bajar la versión nueva y ponerla al cerrar) lo prueba `tools/probar-instalador.ts` con instaladores de verdad.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createPackage } from '@electron/asar'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { appUpdateYml, completarLatest, numeroDeVersion } from '../src/compartido/versiones'
import {
  type Actualizable,
  Actualizador,
  type InfoBajada,
  versionDeInfo,
} from '../src/main/infra/actualizador'
import { versionDeApp } from '../tools/instalador'

describe('el número de la versión (Q-269, D-182)', () => {
  it('son los dos primeros números del package.json y los commits desde que cambiaron', () => {
    expect(numeroDeVersion('1.0.0', 12)).toBe('1.0.12')
    expect(numeroDeVersion('1.1.0', 0)).toBe('1.1.0')
    expect(numeroDeVersion('2.3.7', 4)).toBe('2.3.4')
  })

  it('crece con cada commit y al subir el del medio, comparado como lo compara electron-updater', () => {
    const partes = (v: string) => v.split('.').map(Number)
    const mayor = (a: string, b: string) => {
      const [x, y] = [partes(a), partes(b)]
      for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return (x[i] ?? 0) > (y[i] ?? 0)
      return false
    }
    const versiones = [
      numeroDeVersion('1.0.0', 0),
      numeroDeVersion('1.0.0', 9),
      numeroDeVersion('1.0.0', 10),
      numeroDeVersion('1.1.0', 0),
      numeroDeVersion('2.0.0', 0),
    ]
    for (let i = 1; i < versiones.length; i++)
      expect(mayor(versiones[i] ?? '', versiones[i - 1] ?? '')).toBe(true)
  })
})

describe('lo que publicar escribe', () => {
  it('app-update.yml dice de qué repositorio baja y en qué carpeta guarda lo bajado', () => {
    expect(appUpdateYml('Dueño/Iridium')).toBe(
      'owner: Dueño\nrepo: Iridium\nprovider: github\nupdaterCacheDirName: iridium-updater\n',
    )
    expect(appUpdateYml('a/b', 'iridium-prueba')).toContain('updaterCacheDirName: iridium-prueba-updater')
  })

  it('latest.yml suma el commit y su primera línea, y no los repite si ya estaban', () => {
    const latest =
      "version: 2026.1122.1700\npath: Iridium-Setup-2026.1122.1700.exe\nreleaseDate: '2026-11-22'\n"
    const una = completarLatest(latest, 'abc1234', 'CO-I10: «el instalador»')
    expect(una).toBe(`${latest}commit: "abc1234"\nreleaseNotes: "CO-I10: «el instalador»"\n`)
    expect(completarLatest(una, 'def5678', 'otra')).toBe(`${latest}commit: "def5678"\nreleaseNotes: "otra"\n`)
  })

  describe('el número de una app armada', () => {
    let carpeta: string
    afterEach(() => rm(carpeta, { recursive: true, force: true }))

    it('sale del package.json de su app.asar', async () => {
      carpeta = await mkdtemp(join(tmpdir(), 'iridium-d171-'))
      const fuente = join(carpeta, 'fuente')
      await mkdir(fuente)
      await writeFile(
        join(fuente, 'package.json'),
        JSON.stringify({ name: 'iridium', version: '2026.1122.1700' }),
      )
      await mkdir(join(carpeta, 'app', 'resources'), { recursive: true })
      await createPackage(fuente, join(carpeta, 'app', 'resources', 'app.asar'))
      expect(versionDeApp(join(carpeta, 'app'))).toBe('2026.1122.1700')
    })
  })
})

describe('la versión bajada, para el aviso', () => {
  it('lleva la fecha local, el commit y la primera línea', () => {
    const v = versionDeInfo({
      version: '2026.1122.1700',
      releaseDate: new Date(2026, 10, 22, 17, 5, 9).toISOString(),
      commit: 'abc1234',
      releaseNotes: 'CO-I10\nmás',
    })
    expect(v).toEqual({
      fecha: '2026-11-22T17:05:09',
      commit: 'abc1234',
      mensaje: 'CO-I10',
      sinGuardar: false,
      noEntro: null,
    })
  })

  it('sin commit (un latest.yml sin completar), el número', () => {
    expect(versionDeInfo({ version: '2026.1122.1700' })).toMatchObject({
      commit: 'v2026.1122.1700',
      mensaje: '',
    })
  })
})

describe('el actualizador de la copia instalada', () => {
  function falso(buscar: () => Promise<void> = async () => {}) {
    let bajada: ((info: InfoBajada) => void) | null = null
    const updater = {
      buscar: vi.fn(buscar),
      instalarYSalir: vi.fn(),
      alBajar: (f: (info: InfoBajada) => void) => {
        bajada = f
      },
    } satisfies Actualizable
    return { updater, bajar: (info: InfoBajada) => bajada?.(info) }
  }
  let actualizador: Actualizador | null = null
  afterEach(() => {
    actualizador?.cerrar()
    vi.useRealTimers()
  })

  it('mira un rato después de abrir y después cada tanto', async () => {
    vi.useFakeTimers()
    const { updater } = falso()
    actualizador = new Actualizador({ updater, anotar: () => {}, primeraMs: 1000, cadaMs: 60_000 })
    actualizador.vigilar(() => {})
    expect(updater.buscar).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1000)
    expect(updater.buscar).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(updater.buscar).toHaveBeenCalledTimes(2)
  })

  it('con una versión bajada avisa a la ventana, la anota y deja de mirar', async () => {
    const { updater, bajar } = falso()
    const anotar = vi.fn()
    const avisos: unknown[] = []
    actualizador = new Actualizador({ updater, anotar, primeraMs: 60_000 })
    actualizador.vigilar((v) => avisos.push(v))
    expect(actualizador.ultima()).toBeNull()
    bajar({ version: '2026.1122.1700', commit: 'abc1234', releaseNotes: 'CO-I10' })
    expect(avisos).toEqual([expect.objectContaining({ commit: 'abc1234', mensaje: 'CO-I10' })])
    expect(actualizador.ultima()?.commit).toBe('abc1234')
    expect(anotar).toHaveBeenCalledWith('Actualizaciones: bajada la versión 2026.1122.1700 (abc1234)')
    await actualizador.mirar()
    expect(updater.buscar).not.toHaveBeenCalled()
  })

  it('sin internet lo anota y no rompe', async () => {
    const { updater } = falso(async () => {
      throw new Error('net::ERR_INTERNET_DISCONNECTED\nmás detalle')
    })
    const anotar = vi.fn()
    actualizador = new Actualizador({ updater, anotar })
    await actualizador.mirar()
    expect(anotar).toHaveBeenCalledWith('Actualizaciones: no se pudo mirar (net::ERR_INTERNET_DISCONNECTED)')
  })

  it('al cerrar: sin versión bajada no hace nada; con Reiniciar ahora la pone y la abre; si no, la deja para el final', async () => {
    const { updater, bajar } = falso()
    actualizador = new Actualizador({ updater, anotar: () => {} })
    expect(await actualizador.ponerAlCerrar(true)).toBe(false)
    expect(updater.instalarYSalir).not.toHaveBeenCalled()
    bajar({ version: '2026.1122.1700' })
    expect(await actualizador.ponerAlCerrar(false)).toBe(true)
    expect(updater.instalarYSalir).not.toHaveBeenCalled()
    expect(await actualizador.ponerAlCerrar(true)).toBe(true)
    expect(updater.instalarYSalir).toHaveBeenCalledWith(true)
  })
})
