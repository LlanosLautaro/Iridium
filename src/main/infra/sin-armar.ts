// Los cambios sin armar (CO-I6, modulos/compartir/diseno-tecnico.md › Cambios sin armar): Iridium compara el último
// commit de su código con `main` (lo que está en la app de uso diario, D-070) y con la versión lista; si hay commits
// que la app no tiene, ofrece Armar. Armar corre `pnpm actualizar` en una consola a la vista, como desde Scripts, y
// `tools/actualizar.ps1` deja `release/armando.json` mientras arma.
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { SinArmar } from '../../compartido/puente'
import { ejecutarPlan } from './ejecutar'
import { leerVersionNueva } from './version-nueva'

/** Cada cuánto se mira: dos `git rev-parse` y un archivo. */
const CADA_MS = 10_000
/** Después de tocar Armar, «armando» aunque el script todavía no haya escrito su marca. */
const ARRANQUE_MS = 30_000
/** El comando de Armar; las pruebas ponen otro (IRIDIUM_ARMAR) para no armar de verdad. */
const COMANDO = 'pnpm actualizar'

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

/** Si `actualizar.ps1` está armando: dejó su marca y su proceso sigue vivo (si se cortó, la marca no cuenta). */
export async function armandoAhora(release: string): Promise<boolean> {
  try {
    const { pid } = JSON.parse((await readFile(join(release, 'armando.json'), 'utf8')).replace(/^﻿/, ''))
    if (typeof pid !== 'number') return false
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

/**
 * Lo que falta armar: el último commit de `codigo` si no es el de `main` ni el de la versión lista. Sin git o fuera
 * de un repositorio, nada.
 */
export async function leerSinArmar(codigo: string, release: string): Promise<Omit<SinArmar, 'armando'>> {
  const ultimo = await git(codigo, ['log', '-1', '--format=%h%n%s'])
  const main = await git(codigo, ['rev-parse', '--short', 'main'])
  if (!ultimo || !main) return { carpeta: codigo, pendiente: null }
  const [commit = '', mensaje = ''] = ultimo.split('\n')
  const lista = await leerVersionNueva(release)
  const armado = commit === main || lista?.commit === commit
  return { carpeta: codigo, pendiente: armado ? null : { commit, mensaje } }
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
    this.actual = { carpeta: codigo, pendiente: null, armando: false }
  }

  ultimo(): SinArmar {
    return this.actual
  }

  async mirar(): Promise<void> {
    const leido = await leerSinArmar(this.codigo, this.release)
    const armando = (await armandoAhora(this.release)) || Date.now() - this.lanzado < ARRANQUE_MS
    const s: SinArmar = { ...leido, armando }
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

  /** Corre «Armar la última versión» en una consola a la vista; si ya está armando, no hace nada. */
  async armar(): Promise<{ tipo: 'ok'; mensaje: string } | { tipo: 'error'; mensaje: string }> {
    if (this.actual.armando || (await armandoAhora(this.release)))
      return { tipo: 'ok', mensaje: 'Ya se está armando.' }
    const r = await ejecutarPlan(
      { tipo: 'terminal', nombre: 'Armar la última versión', cwd: this.codigo, comando: this.comando },
      async () => '',
    )
    if (r.tipo === 'ok') this.lanzado = Date.now()
    await this.mirar()
    return r
  }
}
