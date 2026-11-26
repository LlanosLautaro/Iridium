// D-198 (Q-304 A) — Iridium instalado también en la PC donde se arma: dónde está el código (`codigo.json`), la carpeta
// `release/instalador` servida en 127.0.0.1 como la sirve GitHub (con rangos, para bajar solo lo que cambió), el aviso
// de un armado nuevo, el actualizador que lo baja aunque ya tenga otro bajado, y que se publique solo lo que está en uso.
import { mkdir, mkdtemp, rm, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type Actualizable, Actualizador, type InfoBajada } from '../src/main/infra/actualizador'
import { comandoPublicar } from '../src/main/infra/publicar-sola'
import {
  exeInstalado,
  leerCodigoLocal,
  servirVersiones,
  vigilarArchivo,
} from '../src/main/infra/versiones-locales'

let carpeta = ''
beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'iridium-d198-'))
})
afterEach(async () => {
  vi.useRealTimers()
  await rm(carpeta, { recursive: true, force: true })
})

describe('dónde está el código', () => {
  it('sin codigo.json es otra PC', () => {
    expect(leerCodigoLocal(carpeta)).toBeNull()
  })

  it('con codigo.json y su release, es la carpeta del código', async () => {
    const codigo = join(carpeta, 'codigo')
    await mkdir(join(codigo, 'release'), { recursive: true })
    await writeFile(join(carpeta, 'codigo.json'), `\uFEFF${JSON.stringify({ carpeta: codigo })}`)
    expect(leerCodigoLocal(carpeta)).toBe(codigo)
  })

  it('si el código se movió o el archivo está roto, nada', async () => {
    await writeFile(join(carpeta, 'codigo.json'), JSON.stringify({ carpeta: join(carpeta, 'no-esta') }))
    expect(leerCodigoLocal(carpeta)).toBeNull()
    await writeFile(join(carpeta, 'codigo.json'), '{roto')
    expect(leerCodigoLocal(carpeta)).toBeNull()
  })

  it('el Iridium instalado va en Programs\\iridium', () => {
    expect(exeInstalado('C:\\Usuario\\AppData\\Local')).toBe(
      join('C:\\Usuario\\AppData\\Local', 'Programs', 'iridium', 'Iridium.exe'),
    )
  })
})

describe('release/instalador servida en 127.0.0.1', () => {
  it('da los archivos enteros y por rangos, y nada fuera de la carpeta', async () => {
    const instalador = join(carpeta, 'instalador')
    await mkdir(join(instalador, 'sub'), { recursive: true })
    await writeFile(join(instalador, 'latest.yml'), 'version: 1.1.20\n')
    await writeFile(join(instalador, 'Iridium-Setup-1.1.20.exe'), '0123456789')
    await writeFile(join(instalador, 'sub', 'x.txt'), 'no')
    await writeFile(join(carpeta, 'afuera.txt'), 'no')
    const s = await servirVersiones(instalador)
    try {
      expect(s.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/)
      const entero = await fetch(`${s.url}latest.yml?noCache=123`)
      expect(entero.status).toBe(200)
      expect(await entero.text()).toBe('version: 1.1.20\n')

      const parte = await fetch(`${s.url}Iridium-Setup-1.1.20.exe`, { headers: { Range: 'bytes=2-5' } })
      expect(parte.status).toBe(206)
      expect(parte.headers.get('content-range')).toBe('bytes 2-5/10')
      expect(await parte.text()).toBe('2345')

      const hastaElFinal = await fetch(`${s.url}Iridium-Setup-1.1.20.exe`, { headers: { Range: 'bytes=7-' } })
      expect(await hastaElFinal.text()).toBe('789')

      for (const malo of ['../afuera.txt', '..%2Fafuera.txt', 'sub', 'sub%2Fx.txt', 'no-esta.exe', ''])
        expect((await fetch(`${s.url}${malo}`)).status, malo).toBe(404)
    } finally {
      s.cerrar()
    }
  })
})

describe('un armado nuevo', () => {
  it('avisa cuando latest.yml aparece o cambia, no al empezar', async () => {
    const latest = join(carpeta, 'latest.yml')
    await writeFile(latest, 'version: 1.1.20\n')
    const avisos = vi.fn()
    const dejar = vigilarArchivo(latest, avisos, 30)
    try {
      await new Promise((r) => setTimeout(r, 120))
      expect(avisos).not.toHaveBeenCalled()
      await writeFile(latest, 'version: 1.1.21\n')
      await utimes(latest, new Date(), new Date(Date.now() + 5000))
      await vi.waitFor(() => expect(avisos).toHaveBeenCalledTimes(1))
    } finally {
      dejar()
    }
  })

  it('el actualizador lo baja aunque ya tenga otro bajado', async () => {
    const escucha: { bajada?: (info: InfoBajada) => void } = {}
    const updater = {
      buscar: vi.fn(async () => {}),
      instalarYSalir: vi.fn(),
      alBajar: (f: (info: InfoBajada) => void) => {
        escucha.bajada = f
      },
    } satisfies Actualizable
    const avisos: unknown[] = []
    const a = new Actualizador({ updater, anotar: () => {}, primeraMs: 60_000 })
    a.vigilar((v) => avisos.push(v))
    try {
      escucha.bajada?.({ version: '1.1.20', commit: 'aaa1111' })
      await a.mirar()
      expect(updater.buscar).not.toHaveBeenCalled()
      await a.mirar(true)
      expect(updater.buscar).toHaveBeenCalledTimes(1)
      escucha.bajada?.({ version: '1.1.21', commit: 'bbb2222' })
      expect(a.ultima()?.commit).toBe('bbb2222')
      expect(avisos).toHaveLength(2)
    } finally {
      a.cerrar()
    }
  })
})

describe('publicar sola', () => {
  it('pide publicar solo si lo armado es la versión en uso', () => {
    expect(comandoPublicar('abc1234', '1.1.20')).toContain('--commit abc1234 --version 1.1.20')
  })
})
