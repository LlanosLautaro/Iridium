// CO-I2 — Versión nueva lista: la lectura de `release/nueva/lista.json` y el ayudante que cambia las carpetas
// (`tools/cambiar-version.ps1`), de verdad, en una carpeta `release` de muestra.
import { execFileSync, spawn } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { leerVersionNueva, VigiaVersionNueva } from '../src/main/infra/version-nueva'

let release: string
const lista = { fecha: '2026-11-01T14:05:00', commit: 'abc1234', mensaje: 'CO-I2', sinGuardar: false }

async function armar(carpeta: string, archivo: string) {
  await mkdir(carpeta, { recursive: true })
  await writeFile(join(carpeta, 'Iridium.exe'), '')
  await writeFile(join(carpeta, archivo), archivo)
}

function cambiar() {
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      join(import.meta.dirname, '..', 'tools', 'cambiar-version.ps1'),
      '-Release',
      release,
    ],
    { windowsHide: true },
  )
}

beforeEach(async () => {
  release = await mkdtemp(join(tmpdir(), 'iridium-release-'))
  await armar(join(release, 'win-unpacked'), 'vieja.txt')
})
afterEach(async () => {
  await rm(release, { recursive: true, force: true })
})

describe('leer la versión nueva', () => {
  it('no hay mientras no exista `nueva` o le falte `lista.json` (está armándose)', async () => {
    expect(await leerVersionNueva(release)).toBeNull()
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    expect(await leerVersionNueva(release)).toBeNull()
  })

  it('con `lista.json` (aunque traiga BOM) devuelve cuándo y qué se armó', async () => {
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    await writeFile(join(release, 'nueva', 'lista.json'), `﻿${JSON.stringify(lista)}`)
    expect(await leerVersionNueva(release)).toEqual({ ...lista, noEntro: null })
  })

  it('un `lista.json` roto o sin el ejecutable no cuenta', async () => {
    await mkdir(join(release, 'nueva'), { recursive: true })
    await writeFile(join(release, 'nueva', 'lista.json'), JSON.stringify(lista))
    expect(await leerVersionNueva(release)).toBeNull()
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    await writeFile(join(release, 'nueva', 'lista.json'), '{ roto')
    expect(await leerVersionNueva(release)).toBeNull()
  })
})

// Corre PowerShell de verdad: con todas las pruebas en paralelo puede pasar los 5 s de Vitest (Defecto 12).
describe('el ayudante que la pone', { timeout: 30_000 }, () => {
  it('cambia la app por la nueva, borra lo demás y lo anota', async () => {
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    await writeFile(join(release, 'nueva', 'lista.json'), JSON.stringify(lista))
    cambiar()
    expect((await readdir(join(release, 'win-unpacked'))).sort()).toEqual(['Iridium.exe', 'nueva.txt'])
    expect((await readdir(release)).sort()).toEqual(['actualizacion.log', 'win-unpacked'])
    expect(await readFile(join(release, 'actualizacion.log'), 'utf8')).toContain(
      'Versión nueva puesta: abc1234 del 2026-11-01T14:05:00.',
    )
  })

  it('sin `lista.json` no toca nada', async () => {
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    cambiar()
    expect((await readdir(join(release, 'win-unpacked'))).sort()).toEqual(['Iridium.exe', 'vieja.txt'])
    expect(await readFile(join(release, 'actualizacion.log'), 'utf8')).toContain(
      'No hay una versión nueva lista',
    )
  })
})

describe('el ayudante con la versión anterior trabada (Q-101, reporte)', () => {
  /** Lo que queda de la vez anterior: `anterior` con su Iridium.exe. */
  async function conAnterior() {
    await armar(join(release, 'anterior'), 'muy-vieja.txt')
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    await writeFile(join(release, 'nueva', 'lista.json'), JSON.stringify(lista))
  }

  it('cierra un proceso suelto de esa versión (un `--type=` sin su Iridium) y la pone igual', async () => {
    await conAnterior()
    // Un «Iridium.exe» de la versión anterior que sigue vivo, como el servicio de red que quedó el 1 nov.
    await copyFile(
      String.raw`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`,
      join(release, 'anterior', 'Iridium.exe'),
    )
    const suelto = spawn(
      join(release, 'anterior', 'Iridium.exe'),
      ['-NoProfile', '-Command', 'Start-Sleep 60 # --type=utility'],
      {
        stdio: 'ignore',
        windowsHide: true,
      },
    )
    await new Promise((r) => setTimeout(r, 1500))
    try {
      cambiar()
      expect((await readdir(join(release, 'win-unpacked'))).sort()).toEqual(['Iridium.exe', 'nueva.txt'])
      const log = await readFile(join(release, 'actualizacion.log'), 'utf8')
      expect(log).toContain('Cierra un proceso suelto de una versión anterior')
      expect(log).toContain('Versión nueva puesta: abc1234')
    } finally {
      suelto.kill()
      if (suelto.exitCode === null) await new Promise((r) => suelto.once('exit', r))
    }
  }, 30_000)

  it('si algo de afuera la traba, la deja para la próxima y la pone igual', async () => {
    await conAnterior()
    // Otro programa tiene el archivo abierto sin compartir: no se puede borrar.
    const archivo = join(release, 'anterior', 'muy-vieja.txt')
    const traba = spawn(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        `$f=[IO.File]::Open('${archivo}','Open','Read','None'); 'ok'; Start-Sleep 60`,
      ],
      { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true },
    )
    await new Promise((r) => traba.stdout?.once('data', r))
    try {
      cambiar()
      expect((await readdir(join(release, 'win-unpacked'))).sort()).toEqual(['Iridium.exe', 'nueva.txt'])
      // La trabada sigue; la que se acaba de sacar se pudo borrar.
      expect((await readdir(release)).filter((c) => c.startsWith('anterior'))).toEqual(['anterior'])
      const log = await readFile(join(release, 'actualizacion.log'), 'utf8')
      expect(log).toContain('anterior sigue trabada')
      expect(log).toContain('Versión nueva puesta: abc1234')
    } finally {
      traba.kill()
      await new Promise((r) => traba.once('exit', r))
    }
  }, 30_000)
})

describe('la versión que no entró (Defecto 3)', () => {
  it('si Windows no suelta la app, sigue la de antes, lo deja escrito y Iridium lo lee al abrir', async () => {
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    await writeFile(join(release, 'nueva', 'lista.json'), JSON.stringify(lista))
    // Otro programa tiene abierto un archivo de la app sin compartir: la carpeta no se puede mover.
    const archivo = join(release, 'win-unpacked', 'vieja.txt')
    const traba = spawn(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        `$f=[IO.File]::Open('${archivo}','Open','Read','None'); 'ok'; Start-Sleep 60`,
      ],
      { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true },
    )
    await new Promise((r) => traba.stdout?.once('data', r))
    try {
      expect(() => cambiar()).toThrow()
    } finally {
      traba.kill()
      await new Promise((r) => traba.once('exit', r))
    }
    expect((await readdir(join(release, 'win-unpacked'))).sort()).toEqual(['Iridium.exe', 'vieja.txt'])
    const v = await leerVersionNueva(release)
    expect(v?.commit).toBe('abc1234')
    expect(v?.noEntro).toEqual({
      fecha: expect.stringMatching(/^\d{4}-\d\d-\d\dT/),
      motivo: expect.stringContaining('Windows no soltó'),
    })

    // Al próximo cierre entra y el aviso se va con la carpeta `nueva`.
    cambiar()
    expect((await readdir(join(release, 'win-unpacked'))).sort()).toEqual(['Iridium.exe', 'nueva.txt'])
    expect(await leerVersionNueva(release)).toBeNull()
  }, 60_000)

  it('un `no-entro.json` roto no esconde la versión lista', async () => {
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    await writeFile(join(release, 'nueva', 'lista.json'), JSON.stringify(lista))
    await writeFile(join(release, 'nueva', 'no-entro.json'), '{ roto')
    expect(await leerVersionNueva(release)).toEqual({ ...lista, noEntro: null })
  })
})

describe('Iridium al cerrarse', () => {
  it('lanza el ayudante suelto desde una copia y la versión nueva queda puesta', async () => {
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    await writeFile(join(release, 'nueva', 'lista.json'), JSON.stringify(lista))
    const temporal = await mkdtemp(join(tmpdir(), 'iridium-temporal-'))
    const vigia = new VigiaVersionNueva(
      release,
      join(import.meta.dirname, '..', 'tools', 'cambiar-version.ps1'),
      temporal,
    )
    expect(await vigia.ponerAlCerrar(false)).toBe(true)
    await vi.waitFor(
      async () =>
        expect((await readdir(join(release, 'win-unpacked'))).sort()).toEqual(['Iridium.exe', 'nueva.txt']),
      { timeout: 15_000, interval: 300 },
    )
    // El ayudante corre desde esa carpeta y sigue unos segundos después de cambiar las carpetas: se espera a poder borrarla.
    await rm(temporal, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 })
  }, 30_000)

  it('sin versión lista no lanza nada', async () => {
    const vigia = new VigiaVersionNueva(release, 'no-existe.ps1', tmpdir())
    expect(await vigia.ponerAlCerrar(true)).toBe(false)
  })
})
