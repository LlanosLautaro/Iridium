// T-128 (D-186, D-187) — La ventanita «Actualizando Iridium…»: la de verdad (`tools/ventana-actualizando.ps1`), fuera
// de la pantalla, anotando lo que muestra. En la app de uso diario los pasos se los escribe el ayudante; en una copia
// instalada los saca de mirar el Iridium que se cierra y el instalador.
import { spawn } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Actualizador } from '../src/main/infra/actualizador'
import { carpetaDelActualizador, lanzarVentana } from '../src/main/infra/ventana-actualizando'
import { VigiaVersionNueva } from '../src/main/infra/version-nueva'

const tools = join(import.meta.dirname, '..', 'tools')
const POWERSHELL = String.raw`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
let trabajo: string
let registro: string

beforeEach(async () => {
  trabajo = await mkdtemp(join(tmpdir(), 'iridium-t128-'))
  registro = join(trabajo, 'ventana.log')
})
afterEach(async () => {
  await rm(trabajo, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 })
})

const ventana = () => ({ script: join(tools, 'ventana-actualizando.ps1'), afuera: true, registro })

/** Lo que mostró la ventanita, sin la hora: «paso | título | detalle». */
async function mostrado(): Promise<string[]> {
  const texto = await readFile(registro, 'utf8').catch(() => '')
  return texto
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => l.replace(/^\S+\s+/, ''))
}

async function hastaQueCierre(ms = 90_000): Promise<string[]> {
  await vi.waitFor(async () => expect((await mostrado()).at(-1)).toBe('cierra'), {
    timeout: ms,
    interval: 300,
  })
  return mostrado()
}

describe('en la app de uso diario', { timeout: 120_000 }, () => {
  let release: string
  const lista = {
    fecha: '2026-11-24T10:00:00',
    commit: 'abc1234',
    mensaje: 'T-128',
    sinGuardar: false,
    version: '1.0.42',
  }

  async function armar(carpeta: string, archivo: string) {
    await mkdir(carpeta, { recursive: true })
    await writeFile(join(carpeta, 'Iridium.exe'), '')
    await writeFile(join(carpeta, archivo), archivo)
  }

  beforeEach(async () => {
    release = join(trabajo, 'release')
    await armar(join(release, 'win-unpacked'), 'vieja.txt')
    await armar(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
    await writeFile(join(release, 'nueva', 'lista.json'), JSON.stringify(lista))
  })

  it('al cerrar con la X: cerrando, poniendo con el número, y termina en «Lista: se abre la próxima vez» (Q-280)', async () => {
    const vigia = new VigiaVersionNueva(release, join(tools, 'cambiar-version.ps1'), trabajo, ventana())
    expect(await vigia.ponerAlCerrar(false)).toBe(true)
    const vistos = await hastaQueCierre()
    expect(vistos[0]).toBe('cerrando | Actualizando Iridium… | Cerrando la versión de antes')
    expect(vistos).toContain('lista | Iridium está actualizado | Lista: se abre la próxima vez.')
    // El paso del medio puede pasar más rápido que lo que la ventanita mira: si se vio, con el número.
    const poniendo = vistos.find((l) => l.startsWith('poniendo'))
    if (poniendo) expect(poniendo).toContain('Poniendo la versión nueva · 1.0.42')
    expect(vistos.some((l) => l.startsWith('fallo') || l.startsWith('tope'))).toBe(false)
  })

  it('con Reiniciar ahora y una Iridium ya abierta, se cierra sin quedarse en «Abriendo»', async () => {
    await copyFile(POWERSHELL, join(release, 'win-unpacked', 'Iridium.exe'))
    await rm(join(release, 'win-unpacked', 'vieja.txt'))
    const abierto = spawn(
      join(release, 'win-unpacked', 'Iridium.exe'),
      ['-NoProfile', '-Command', 'Start-Sleep 60'],
      {
        stdio: 'ignore',
        windowsHide: true,
      },
    )
    try {
      await new Promise((r) => setTimeout(r, 1500))
      // Sin `nueva`: nada que cambiar; con Iridium abierto, no abre otro y lo da por abierto.
      // (`ponerAlCerrar` no lanza nada sin versión lista: se lanzan como lo haría con una.)
      await rm(join(release, 'nueva'), { recursive: true })
      await lanzarVentana(ventana(), {
        temporal: trabajo,
        carpeta: join(release, 'win-unpacked'),
        abrir: true,
        estado: join(trabajo, 'estado.json'),
      })
      const p = spawn(
        'powershell.exe',
        [
          '-NoProfile',
          '-ExecutionPolicy',
          'Bypass',
          '-File',
          join(tools, 'cambiar-version.ps1'),
          '-Release',
          release,
          '-Abrir',
          '-Estado',
          join(trabajo, 'estado.json'),
        ],
        { stdio: 'ignore', windowsHide: true },
      )
      await new Promise((r) => p.once('exit', r))
      const vistos = await hastaQueCierre()
      expect(vistos.at(-2)).toMatch(/^abierta \|/)
    } finally {
      abierto.kill()
      if (abierto.exitCode === null) await new Promise((r) => abierto.once('exit', r))
    }
  })

  it('si Windows no suelta la app, lo dice con el motivo y se cierra sola', async () => {
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
      const vigia = new VigiaVersionNueva(release, join(tools, 'cambiar-version.ps1'), trabajo, ventana())
      expect(await vigia.ponerAlCerrar(false)).toBe(true)
      const vistos = await hastaQueCierre()
      expect(vistos).toContainEqual(
        expect.stringMatching(/^fallo \| La versión nueva no entró \| Windows no soltó/),
      )
      expect(vistos.some((l) => l.startsWith('lista'))).toBe(false)
    } finally {
      traba.kill()
      await new Promise((r) => traba.once('exit', r))
    }
  })
})

describe('en una copia instalada', { timeout: 120_000 }, () => {
  let carpeta: string
  let pendiente: string

  beforeEach(async () => {
    carpeta = join(trabajo, 'instalada')
    pendiente = join(trabajo, 'iridium-updater')
    await mkdir(carpeta, { recursive: true })
    await mkdir(join(pendiente, 'pending'), { recursive: true })
    await writeFile(join(carpeta, 'Iridium.exe'), 'vieja')
    await utimes(join(carpeta, 'Iridium.exe'), new Date('2026-01-01'), new Date('2026-01-01'))
    await copyFile(POWERSHELL, join(pendiente, 'pending', 'Iridium-Setup-1.0.43.exe'))
  })

  /** Un proceso que hace de Iridium cerrándose: termina a los `ms`. */
  function iridiumQueSeCierra(ms: number) {
    return spawn('powershell.exe', ['-NoProfile', '-Command', `Start-Sleep -Milliseconds ${ms}`], {
      stdio: 'ignore',
      windowsHide: true,
    })
  }

  /** El instalador: corre desde la carpeta del actualizador y, si `pone`, cambia Iridium.exe. */
  function instalador(pone: boolean) {
    const exe = join(carpeta, 'Iridium.exe')
    return spawn(
      join(pendiente, 'pending', 'Iridium-Setup-1.0.43.exe'),
      ['-NoProfile', '-Command', `Start-Sleep 3; ${pone ? `Set-Content -LiteralPath '${exe}' 'nueva'` : ''}`],
      { stdio: 'ignore', windowsHide: true },
    )
  }

  it('mira el Iridium que se cierra y el instalador, y al terminar dice que quedó lista', async () => {
    const iridium = iridiumQueSeCierra(1500)
    await lanzarVentana(ventana(), {
      temporal: trabajo,
      carpeta,
      abrir: false,
      version: '1.0.43',
      instalada: { iridium: iridium.pid ?? 0, pendiente },
    })
    await new Promise((r) => iridium.once('exit', r))
    const inst = instalador(true)
    await new Promise((r) => inst.once('exit', r))
    const vistos = await hastaQueCierre()
    expect(vistos[0]).toMatch(/^cerrando/)
    expect(vistos).toContain('poniendo | Actualizando Iridium… | Poniendo la versión nueva · 1.0.43')
    expect(vistos).toContain('lista | Iridium está actualizado | Lista: se abre la próxima vez.')
  })

  it('si el instalador termina sin cambiar Iridium.exe, dice que no entró', async () => {
    const iridium = iridiumQueSeCierra(1000)
    await lanzarVentana(ventana(), {
      temporal: trabajo,
      carpeta,
      abrir: false,
      instalada: { iridium: iridium.pid ?? 0, pendiente },
    })
    await new Promise((r) => iridium.once('exit', r))
    const inst = instalador(false)
    await new Promise((r) => inst.once('exit', r))
    const vistos = await hastaQueCierre()
    expect(vistos).toContainEqual(
      expect.stringMatching(/^fallo \| La versión nueva no entró \| Se va a probar de nuevo/),
    )
  })

  it('la carpeta del actualizador sale de `app-update.yml`', async () => {
    const yml = join(trabajo, 'app-update.yml')
    await writeFile(
      yml,
      'owner: prueba\nrepo: iridium\nprovider: github\nupdaterCacheDirName: iridium-prueba-updater\n',
    )
    expect(await carpetaDelActualizador(yml, 'C:\\Local')).toBe(join('C:\\Local', 'iridium-prueba-updater'))
    expect(await carpetaDelActualizador(join(trabajo, 'no-esta.yml'), 'C:\\Local')).toBe(
      join('C:\\Local', 'iridium-updater'),
    )
  })

  it('si la ventanita no arranca, la versión entra igual', async () => {
    const anotado: string[] = []
    let bajada: ((i: { version: string }) => void) | null = null
    const updater = {
      buscar: async () => {},
      instalarYSalir: vi.fn(),
      alBajar: (f: (i: { version: string }) => void) => {
        bajada = f
      },
    }
    const actualizador = new Actualizador({
      updater,
      anotar: (t) => anotado.push(t),
      ventana: { script: join(trabajo, 'no-esta.ps1'), carpeta, pendiente, temporal: trabajo },
    })
    ;(bajada as unknown as (i: { version: string }) => void)({ version: '1.0.43' })
    expect(await actualizador.ponerAlCerrar(true)).toBe(true)
    expect(updater.instalarYSalir).toHaveBeenCalledWith(true)
    expect(anotado.some((t) => t.includes('no se pudo mostrar la ventanita'))).toBe(true)
  })
})
