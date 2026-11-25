// T-132 — Ajustes de las actualizaciones: el puente del navegador que trababa la carpeta de la app (se cierra antes de
// poner la versión nueva), y la publicación sola de la versión en uso para la otra PC.
import { type ChildProcess, execFileSync, spawn } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { debePublicar, REINTENTO_PUBLICAR_MS } from '../src/compartido/actualizar'
import { type Actualizable, Actualizador } from '../src/main/infra/actualizador'
import { publicarSola } from '../src/main/infra/publicar-sola'
import { cerrarPuentesDelNavegador } from '../src/main/infra/puente-navegador'

const carpetas: string[] = []
const procesos: ChildProcess[] = []
afterEach(async () => {
  for (const p of procesos.splice(0)) p.kill()
  for (const c of carpetas.splice(0)) await rm(c, { recursive: true, force: true, maxRetries: 5 })
})

async function temporal(): Promise<string> {
  const c = await mkdtemp(join(tmpdir(), 'iridium-t132-'))
  carpetas.push(c)
  return c
}

/** Un «claude.exe --chrome-native-host» de mentira: un cmd con otro nombre que espera su entrada. */
async function puenteFalso(carpeta: string): Promise<ChildProcess> {
  await mkdir(carpeta, { recursive: true })
  const exe = join(carpeta, 'claude.exe')
  await copyFile('C:\\Windows\\System32\\cmd.exe', exe)
  const p = spawn(exe, ['/k', 'rem', '--chrome-native-host'], { stdio: 'pipe', windowsHide: true })
  procesos.push(p)
  await new Promise((listo) => p.once('spawn', listo))
  return p
}

const termino = (p: ChildProcess) =>
  p.exitCode !== null || p.signalCode !== null
    ? Promise.resolve()
    : new Promise<void>((listo) => p.once('exit', () => listo()))

describe('el puente del navegador (PA-I5)', () => {
  it('cierra el que corre desde la carpeta de la app y no toca el de otra carpeta', async () => {
    const raiz = await temporal()
    const app = join(raiz, 'Iridium')
    const deLaApp = await puenteFalso(join(app, 'resources', 'sdk'))
    const deOtra = await puenteFalso(join(raiz, 'otra'))
    expect(await cerrarPuentesDelNavegador(app)).toBe(1)
    await termino(deLaApp)
    expect(deLaApp.exitCode ?? deLaApp.signalCode).not.toBeNull()
    expect(deOtra.exitCode).toBeNull()
    // Una carpeta que empieza igual no es la de la app.
    expect(await cerrarPuentesDelNavegador(`${app}-vieja`)).toBe(0)
  }, 30_000)

  it('la copia instalada lo cierra antes de poner la versión bajada', async () => {
    const orden: string[] = []
    const updater: Actualizable = {
      buscar: async () => {},
      instalarYSalir: () => orden.push('instala'),
      alBajar: (f) => setTimeout(() => f({ version: '1.0.30' })),
    }
    const actualizador = new Actualizador({
      updater,
      anotar: () => {},
      antesDeInstalar: async () => {
        orden.push('cierra el puente')
      },
    })
    await vi.waitFor(() => expect(actualizador.ultima()).not.toBeNull())
    expect(await actualizador.ponerAlCerrar(true)).toBe(true)
    expect(orden).toEqual(['cierra el puente', 'instala'])
    actualizador.cerrar()
  })
})

describe('publicar sola la versión en uso', () => {
  const base = { version: '1.0.24', commit: 'dcb2d29', sinGuardar: false, ultimo: null, ahora: 1_000_000 }

  it('publica una versión commiteada con número; no una armada con cambios sin commitear ni una sin número', () => {
    expect(debePublicar(base)).toBe(true)
    expect(debePublicar({ ...base, sinGuardar: true })).toBe(false)
    expect(debePublicar({ ...base, version: '0.1.0' })).toBe(false)
    expect(debePublicar({ ...base, commit: '' })).toBe(false)
    expect(debePublicar({ ...base, commit: 'x; rm' })).toBe(false)
  })

  it('la misma versión no se vuelve a mandar hasta un rato después; otra sí', () => {
    const ultimo = { version: '1.0.24', fecha: base.ahora - 60_000 }
    expect(debePublicar({ ...base, ultimo })).toBe(false)
    expect(debePublicar({ ...base, ultimo, ahora: ultimo.fecha + REINTENTO_PUBLICAR_MS })).toBe(true)
    expect(debePublicar({ ...base, ultimo, version: '1.0.25' })).toBe(true)
  })

  it('anota el intento, lanza la publicación desde la carpeta del código y no la repite', async () => {
    const datos = await temporal()
    const archivo = join(datos, 'publicar.json')
    const lanzar = vi.fn(async () => {})
    const o = {
      codigo: 'C:\\codigo',
      archivo,
      version: '1.0.24',
      commit: 'dcb2d29',
      sinGuardar: false,
      lanzar,
    }
    expect(await publicarSola({ ...o, ahora: 5000 })).toBe(true)
    expect(lanzar).toHaveBeenCalledWith(
      expect.stringContaining('tools/publicar.ts --commit dcb2d29'),
      'C:\\codigo',
    )
    expect(JSON.parse(await readFile(archivo, 'utf8'))).toEqual({ version: '1.0.24', fecha: 5000 })
    expect(await publicarSola({ ...o, ahora: 6000 })).toBe(false)
    expect(lanzar).toHaveBeenCalledTimes(1)
  })

  it('con el archivo roto, publica igual', async () => {
    const datos = await temporal()
    const archivo = join(datos, 'publicar.json')
    await writeFile(archivo, '{roto')
    const lanzar = vi.fn(async () => {})
    expect(
      await publicarSola({
        codigo: 'C:\\c',
        archivo,
        version: '1.0.2',
        commit: 'abc1234',
        sinGuardar: false,
        lanzar,
      }),
    ).toBe(true)
  })
})

describe('la app de uso diario con el puente del navegador abierto', () => {
  it('el ayudante lo cierra y pone la versión nueva (antes esperaba un minuto y decía «Iridium sigue abierto»)', async () => {
    const release = await temporal()
    const app = join(release, 'win-unpacked')
    await mkdir(join(release, 'nueva', 'win-unpacked'), { recursive: true })
    await writeFile(join(release, 'nueva', 'win-unpacked', 'Iridium.exe'), '')
    await writeFile(
      join(release, 'nueva', 'lista.json'),
      JSON.stringify({
        fecha: '2026-11-24T21:15:01',
        commit: 'abc1234',
        mensaje: 'T-132',
        sinGuardar: false,
      }),
    )
    await mkdir(app, { recursive: true })
    await writeFile(join(app, 'Iridium.exe'), '')
    const puente = await puenteFalso(join(app, 'resources', 'sdk'))
    const inicio = Date.now()
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
    await termino(puente)
    expect(Date.now() - inicio).toBeLessThan(30_000)
    const log = await readFile(join(release, 'actualizacion.log'), 'utf8')
    expect(log).toContain('Cierra el puente del navegador')
    expect(log).toContain('Versión nueva puesta: abc1234')
  }, 60_000)
})

describe('con una sola Iridium terminando de cerrarse', () => {
  it('el ayudante la espera y pone la versión nueva (antes la contaba como ninguna y «Windows no soltó la carpeta»)', async () => {
    const release = await temporal()
    const app = join(release, 'win-unpacked')
    await mkdir(join(release, 'nueva', 'win-unpacked'), { recursive: true })
    await writeFile(join(release, 'nueva', 'win-unpacked', 'Iridium.exe'), '')
    await writeFile(
      join(release, 'nueva', 'lista.json'),
      JSON.stringify({
        fecha: '2026-11-24T21:15:01',
        commit: 'abc1234',
        mensaje: 'T-132',
        sinGuardar: false,
      }),
    )
    await mkdir(app, { recursive: true })
    // Un «Iridium.exe» parado en su carpeta (como la app armada) que tarda más que los reintentos de mover en cerrarse.
    await copyFile(
      String.raw`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`,
      join(app, 'Iridium.exe'),
    )
    const iridium = spawn(join(app, 'Iridium.exe'), ['-NoProfile', '-Command', 'Start-Sleep 25'], {
      cwd: app,
      stdio: 'ignore',
      windowsHide: true,
    })
    procesos.push(iridium)
    await new Promise((r) => setTimeout(r, 1500))
    const ayudante = spawn(
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
      { stdio: 'ignore', windowsHide: true },
    )
    await termino(ayudante)
    const log = await readFile(join(release, 'actualizacion.log'), 'utf8')
    expect(log).not.toContain('Windows no soltó la carpeta')
    expect(log).toContain('Versión nueva puesta: abc1234')
  }, 90_000)
})
