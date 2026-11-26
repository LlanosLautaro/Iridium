// La actualización automática de las apps de escritorio (frente Abrir, AB-I2, D-156 › 3, 4 y 6;
// `modulos/abrir/diseno-tecnico.md` › Datos): `armados.json` en los datos de Iridium, si la app está abierta (su `.exe`
// trabado), el último commit de un proyecto y el armado escondido, con su log y su marca de fin en `armados/`.
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, open, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { z } from 'zod'
import { escribirAtomico, leerDatos } from './escritura'

const Ultimo = z.object({
  cuando: z.number(),
  commit: z.string().nullable(),
  resultado: z.enum(['ok', 'falla', 'ocupada']),
  motivo: z.string().optional(),
  /** Se cortó sin que fuera culpa del script (la PC se apagó a mitad): se vuelve a intentar una vez. */
  reintentar: z.boolean().optional(),
})
export type UltimoArmado = z.infer<typeof Ultimo>

const EnCurso = z.object({ pid: z.number().int(), desde: z.number(), commit: z.string().nullable() })
export type ArmadoEnCurso = z.infer<typeof EnCurso>

const Proyecto = z.object({
  /** El commit del último armado que salió bien. */
  commit: z.string().nullable().catch(null),
  ultimo: Ultimo.nullable().catch(null),
  enCurso: EnCurso.nullable().catch(null),
})
export type ArmadoProyecto = z.infer<typeof Proyecto>

const Archivo = z.object({
  version: z.literal(1),
  proyectos: z.record(z.string(), Proyecto.optional().catch(undefined)).catch({}),
})

export const SIN_ARMADO: ArmadoProyecto = { commit: null, ultimo: null, enCurso: null }

/** `armados.json`: se puede rehacer; si falta o está roto, vacío (y vuelve la regla del `.exe` más nuevo). */
export class ArchivoArmados {
  private actual: Record<string, ArmadoProyecto> | null = null

  constructor(private readonly archivo: string) {}

  async todos(): Promise<Record<string, ArmadoProyecto>> {
    if (!this.actual) {
      const leido = await leerDatos(this.archivo, (t) => Archivo.parse(JSON.parse(t)))
      this.actual = Object.fromEntries(
        Object.entries(leido?.proyectos ?? {}).filter(
          (e): e is [string, ArmadoProyecto] => e[1] !== undefined,
        ),
      )
    }
    return this.actual
  }

  async de(ruta: string): Promise<ArmadoProyecto> {
    return (await this.todos())[ruta] ?? SIN_ARMADO
  }

  async cambiar(ruta: string, cambio: Partial<ArmadoProyecto>): Promise<ArmadoProyecto> {
    const todos = await this.todos()
    const nuevo = { ...(todos[ruta] ?? SIN_ARMADO), ...cambio }
    this.actual = { ...todos, [ruta]: nuevo }
    await mkdir(dirname(this.archivo), { recursive: true })
    await escribirAtomico(
      this.archivo,
      `${JSON.stringify({ version: 1, proyectos: this.actual }, null, 2)}\n`,
    )
    return nuevo
  }
}

/** La carpeta del log y la marca de fin de un proyecto: `armados/<carpeta>-<hash corto de la ruta>`. */
export function carpetaDeArmado(datos: string, ruta: string): string {
  const hash = createHash('sha1').update(ruta.toLowerCase()).digest('hex').slice(0, 8)
  const nombre = basename(ruta).replace(/[^\p{L}\p{N}._-]+/gu, '-') || 'proyecto'
  return join(datos, 'armados', `${nombre}-${hash}`)
}

export const LOG_ARMADO = 'armado.log'
const FIN = 'fin'
const LANZADOR = 'armar.cmd'
const COMANDO = 'comando.cmd'

/**
 * Si la app está abierta (D-156 › 3): un programa que corre tiene su `.exe` trabado. Se abre para escribir sin
 * cambiar nada; si Windows dice que está en uso (EBUSY), está abierta. Sin el archivo, cerrada. Un `.exe` sin permiso
 * de escritura (de solo lectura o instalado en Archivos de programa) da EPERM: eso no es estar abierta, y tomarlo así
 * dejaba la app sin actualizar nunca y sin avisar; se intenta el armado y, si no puede, falla con su log (paso 8).
 */
export async function abiertaAhora(exe: string): Promise<boolean> {
  try {
    const f = await open(exe, 'r+')
    await f.close()
    return false
  } catch (e) {
    const codigo = (e as NodeJS.ErrnoException).code
    return codigo === 'EBUSY'
  }
}

/** La fecha del `.exe` (ms), o null si no existe. */
export async function fechaDe(archivo: string): Promise<number | null> {
  return stat(archivo).then(
    (s) => s.mtimeMs,
    () => null,
  )
}

function correr(programa: string, args: string[], cwd?: string): Promise<string | null> {
  return new Promise((listo) => {
    execFile(
      programa,
      args,
      { cwd, encoding: 'utf8', windowsHide: true, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } },
      (e, texto) => listo(e ? null : texto.trim()),
    )
  })
}

/** El último commit (hash entero), su fecha (ms) y si no hay archivos con seguimiento a medio cambiar; null sin git. */
export async function gitDeArmado(
  ruta: string,
): Promise<{ commit: string; fecha: number; limpio: boolean } | null> {
  const ultimo = await correr('git', ['--no-pager', 'log', '-1', '--format=%H%n%ct'], ruta)
  if (!ultimo) return null
  const [commit = '', segundos = ''] = ultimo.split('\n')
  const estado = await correr('git', ['--no-pager', 'status', '--porcelain', '--untracked-files=no'], ruta)
  return { commit, fecha: Number(segundos) * 1000, limpio: estado === '' }
}

/**
 * Lanza el armado escondido y suelto (D-156 › 6): sigue si Iridium se cierra. Un `armar.cmd` en la carpeta del armado
 * corre el comando (con `call`, que vale para `npm` y para un `.exe`), escribe todo en `armado.log` y deja la marca de
 * fin (`ok` o `falla`). El comando va solo en `comando.cmd`: así el log junta la salida de todo lo encadenado con `&&`
 * (armar el instalador y correrlo, D-158), no solo la del último. Lo abre `Start-Process` con la ventana escondida:
 * lo que lance comparte esa consola escondida.
 * Devuelve el proceso, para cortarlo.
 */
export async function lanzarArmado(carpeta: string, comando: string, cwd: string): Promise<number> {
  await mkdir(carpeta, { recursive: true })
  await rm(join(carpeta, FIN), { force: true })
  const log = join(carpeta, LOG_ARMADO)
  const fin = join(carpeta, FIN)
  const lanzador = join(carpeta, LANZADOR)
  const soloComando = join(carpeta, COMANDO)
  await writeFile(soloComando, ['@echo off', `call ${comando}`, ''].join('\r\n'), 'utf8')
  await writeFile(log, `> ${comando}\r\n`, 'utf8')
  // El lanzador no lleva ninguna letra fuera del inglés: `chcp 65001` cambia a mitad de archivo cómo lee cmd el resto
  // y, con una eñe o un acento en una ruta (la del proyecto o la de su armado), leía las líneas corridas y el armado no
  // terminaba nunca (paso 8). Las rutas le llegan por variables.
  await writeFile(
    lanzador,
    [
      '@echo off',
      'chcp 65001 >nul',
      'cd /d "%IRIDIUM_ARMADO_CARPETA%"',
      'call "%IRIDIUM_ARMADO_COMANDO%" >> "%IRIDIUM_ARMADO_LOG%" 2>&1',
      'if errorlevel 1 (echo falla> "%IRIDIUM_ARMADO_FIN%") else (echo ok> "%IRIDIUM_ARMADO_FIN%")',
      '',
    ].join('\r\n'),
    'utf8',
  )
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    FORCE_COLOR: '0',
    NO_COLOR: '1',
    IRIDIUM_ARMADO_CARPETA: cwd,
    IRIDIUM_ARMADO_COMANDO: soloComando,
    IRIDIUM_ARMADO_LOG: log,
    IRIDIUM_ARMADO_FIN: fin,
  }
  delete env.ELECTRON_RUN_AS_NODE
  // Heredada (de una terminal o de Claude Code), impide correr un programa de la carpeta del proyecto por su nombre
  // solo («armar.cmd»), como lo escribe `scripts.md`.
  for (const k of Object.keys(env))
    if (k.toLowerCase() === 'nodefaultcurrentdirectoryinexepath') delete env[k]
  const pid = await new Promise<string>((listo, fallo) =>
    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `(Start-Process -FilePath '${lanzador.replace(/'/g, "''")}' -WindowStyle Hidden -PassThru).Id`,
      ],
      { cwd, env, windowsHide: true, encoding: 'utf8' },
      (e, texto) => (e ? fallo(e) : listo(texto.trim())),
    ),
  )
  const n = Number(pid)
  if (!Number.isInteger(n) || n <= 0) throw new Error('Windows no dijo qué proceso arma.')
  return n
}

/** Cómo terminó el armado de esa carpeta: `ok`, `falla`, o null si todavía no dejó la marca. */
export async function finDeArmado(carpeta: string): Promise<'ok' | 'falla' | null> {
  const t = await readFile(join(carpeta, FIN), 'utf8').catch(() => null)
  if (t === null) return null
  return t.trim() === 'ok' ? 'ok' : 'falla'
}

export function procesoVivo(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

/**
 * Cuándo arrancó un proceso (ms), para saber si ese número sigue siendo el del armado: después de reiniciar la PC,
 * Windows reparte los números de nuevo. null si no corre o no se pudo saber.
 */
export function inicioDeProceso(pid: number): Promise<number | null> {
  return new Promise((listo) =>
    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `[DateTimeOffset]::new((Get-Process -Id ${Math.trunc(pid)} -ErrorAction Stop).StartTime).ToUnixTimeMilliseconds()`,
      ],
      { windowsHide: true, encoding: 'utf8' },
      (e, texto) => {
        const n = Number(texto.trim())
        listo(e || !Number.isFinite(n) || n <= 0 ? null : n)
      },
    ),
  )
}

/** Corta el armado con todo lo que lanzó. */
export function cortarArmado(pid: number): Promise<void> {
  return new Promise((listo) =>
    execFile('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true }, () => listo()),
  )
}
