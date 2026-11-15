// Los cambios sin armar (CO-I6, modulos/compartir/diseno-tecnico.md › Cambios sin armar): Iridium compara el último
// commit de su código con `main` (lo que está en la app de uso diario, D-070) y con la versión lista; si hay commits
// que la app no tiene, Actualizar arma (R-12, modulos/orden/diseno-tecnico.md › Actualizar). Corre
// `tools/actualizar.ps1` con la consola escondida: el script anota lo que pasa en `release/armado.log` (Ver la
// consola), deja `release/armando.json` mientras arma y `release/armado-fallo.json` si no pudo.
import { execFile, spawn } from 'node:child_process'
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import type { SinArmar } from '../../compartido/puente'
import { leerVersionNueva } from './version-nueva'

/** Cada cuánto se mira: dos `git rev-parse` y un archivo. */
const CADA_MS = 10_000
/** Después de tocar Actualizar, «armando» aunque el script todavía no haya escrito su marca. */
const ARRANQUE_MS = 30_000
/**
 * El comando que arma (el de `pnpm actualizar`, escondido); las pruebas ponen otro (IRIDIUM_ARMAR) para no armar de
 * verdad. Corre con `start /min`: lanzado suelto desde Iridium, cada programa de consola abriría su ventana a la vista.
 */
const COMANDO =
  'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File tools/actualizar.ps1'

function git(carpeta: string, args: string[]): Promise<string | null> {
  return new Promise((listo) => {
    execFile(
      'git',
      ['--no-pager', ...args],
      { cwd: carpeta, encoding: 'utf8', windowsHide: true, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } },
      (e, texto) => listo(e ? null : texto.trim()),
    )
  })
}

async function leerJson(archivo: string): Promise<Record<string, unknown> | null> {
  try {
    const d = JSON.parse((await readFile(archivo, 'utf8')).replace(/^﻿/, ''))
    return d && typeof d === 'object' ? d : null
  } catch {
    return null
  }
}

function vivo(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

/**
 * La marca de `actualizar.ps1`: `vivo` si su proceso sigue (está armando), `cortado` si quedó y el proceso no (se
 * cerró la consola o se cortó a mitad de camino), null si no hay marca.
 */
export async function marcaDeArmado(
  release: string,
): Promise<{ estado: 'vivo' | 'cortado'; pid: number; desde: number | null } | null> {
  const d = await leerJson(join(release, 'armando.json'))
  if (!d || typeof d.pid !== 'number') return null
  const desde = typeof d.desde === 'string' && !Number.isNaN(Date.parse(d.desde)) ? Date.parse(d.desde) : null
  return { estado: vivo(d.pid) ? 'vivo' : 'cortado', pid: d.pid, desde }
}

/** Si `actualizar.ps1` está armando: dejó su marca y su proceso sigue vivo (si se cortó, la marca no cuenta). */
export async function armandoAhora(release: string): Promise<boolean> {
  return (await marcaDeArmado(release))?.estado === 'vivo'
}

/** Por qué no terminó el último armado: `armado-fallo.json`, o la marca que quedó sin su proceso. */
export async function leerFalloArmado(release: string): Promise<SinArmar['fallo']> {
  const d = await leerJson(join(release, 'armado-fallo.json'))
  if (d && typeof d.fecha === 'string' && typeof d.motivo === 'string')
    return { fecha: d.fecha, motivo: d.motivo }
  if ((await marcaDeArmado(release))?.estado === 'cortado')
    return { fecha: '', motivo: 'El armado se cortó antes de terminar.' }
  return null
}

/**
 * Lo que falta armar: el último commit de `codigo` si no es el de `main` ni el de la versión lista. Sin git o fuera
 * de un repositorio, nada.
 */
export async function leerSinArmar(
  codigo: string,
  release: string,
): Promise<Omit<SinArmar, 'armando' | 'desde' | 'fallo' | 'retenido'>> {
  const ultimo = await git(codigo, ['log', '-1', '--format=%h%n%s'])
  const main = await git(codigo, ['rev-parse', '--short', 'main'])
  if (!ultimo || !main) return { carpeta: codigo, pendiente: null, limpio: false }
  const limpio = (await git(codigo, ['status', '--porcelain', '--untracked-files=no'])) === ''
  const [commit = '', mensaje = ''] = ultimo.split('\n')
  const lista = await leerVersionNueva(release)
  const armado = commit === main || lista?.commit === commit
  return { carpeta: codigo, pendiente: armado ? null : { commit, mensaje }, limpio }
}

export class VigiaSinArmar {
  private actual: SinArmar
  private reloj: ReturnType<typeof setInterval> | null = null
  private alCambiar: ((s: SinArmar) => void) | null = null
  private lanzado = 0

  /**
   * @param codigo la carpeta del código de Iridium (la que tiene `release`).
   * @param release la carpeta `release` de la app de uso diario.
   */
  constructor(
    private readonly codigo: string,
    private readonly release: string,
    private readonly comando: string = process.env.IRIDIUM_ARMAR ?? COMANDO,
  ) {
    this.actual = {
      carpeta: codigo,
      pendiente: null,
      armando: false,
      desde: null,
      fallo: null,
      limpio: false,
      retenido: null,
    }
  }

  ultimo(): SinArmar {
    return this.actual
  }

  async mirar(): Promise<void> {
    const leido = await leerSinArmar(this.codigo, this.release)
    const marca = await marcaDeArmado(this.release)
    const armando = marca?.estado === 'vivo' || Date.now() - this.lanzado < ARRANQUE_MS
    const retenido = (await leerJson(join(this.release, 'retenido.json')))?.commit
    const s: SinArmar = {
      ...leido,
      retenido: typeof retenido === 'string' ? retenido : null,
      armando,
      desde: armando ? ((marca?.estado === 'vivo' ? marca.desde : null) ?? this.lanzado) : null,
      fallo: armando ? null : await leerFalloArmado(this.release),
    }
    if (JSON.stringify(s) === JSON.stringify(this.actual)) return
    this.actual = s
    this.alCambiar?.(s)
  }

  /** Mira ya y después cada pocos segundos; avisa solo cuando cambia. */
  vigilar(alCambiar: (s: SinArmar) => void): void {
    this.alCambiar = alCambiar
    void this.mirar()
    this.reloj = setInterval(() => void this.mirar(), CADA_MS)
  }

  cerrar(): void {
    if (this.reloj) clearInterval(this.reloj)
    this.reloj = null
  }

  /** Arma la última versión con la consola escondida (Actualizar, R-12). Si ya está armando, no hace nada. */
  async armar(): Promise<{ tipo: 'ok'; mensaje: string } | { tipo: 'error'; mensaje: string }> {
    if (this.actual.armando || (await armandoAhora(this.release)))
      return { tipo: 'ok', mensaje: 'Ya se está armando.' }
    // El fallo anterior y una marca cortada no son de este armado.
    await rm(join(this.release, 'armado-fallo.json'), { force: true }).catch(() => {})
    if ((await marcaDeArmado(this.release))?.estado === 'cortado')
      await rm(join(this.release, 'armando.json'), { force: true }).catch(() => {})
    // Hereda el entorno de Iridium menos lo de Electron, y sin colores: el log se lee como texto.
    const env: NodeJS.ProcessEnv = { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' }
    delete env.ELECTRON_RUN_AS_NODE
    try {
      await new Promise<void>((listo, fallo) => {
        // Suelto (sigue si Iridium se cierra o se reinicia). `/s /c "…"`: cmd quita solo las comillas de afuera.
        const p = spawn('cmd.exe', ['/d', '/s', '/c', `"start "" /min ${this.comando}"`], {
          cwd: this.codigo,
          env,
          detached: true,
          stdio: 'ignore',
          windowsHide: true,
          windowsVerbatimArguments: true,
        })
        p.once('error', fallo)
        p.once('spawn', () => {
          p.unref()
          listo()
        })
      })
      this.lanzado = Date.now()
      await this.mirar()
      return { tipo: 'ok', mensaje: 'Armando.' }
    } catch (e) {
      return {
        tipo: 'error',
        mensaje: `No se pudo empezar a armar: ${e instanceof Error ? e.message : String(e)}`,
      }
    }
  }

  /** Cancelar (W-1): corta el armado con todo lo que lanzó y borra su marca; la app que se usa sigue igual. */
  async cancelar(): Promise<void> {
    const marca = await marcaDeArmado(this.release)
    if (marca?.estado === 'vivo')
      await new Promise<void>((listo) =>
        execFile('taskkill', ['/PID', String(marca.pid), '/T', '/F'], { windowsHide: true }, () => listo()),
      )
    await rm(join(this.release, 'armando.json'), { force: true }).catch(() => {})
    this.lanzado = 0
    await this.mirar()
  }

  /** Lo que escribió el último armado (Ver la consola). */
  consola(): string {
    return join(this.release, 'armado.log')
  }
}
