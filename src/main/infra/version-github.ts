// Las versiones nuevas de una copia compartida (D-085): `tools/publicar.ts` sube la app de uso diario a GitHub como
// versión («release») y le pone `resources/actualizaciones.json` con el repositorio y el commit. La copia que lo
// trae mira esa versión al abrir y cada unas horas; si es otra, la baja y la deja en `release/nueva` como lo hace
// `tools/actualizar.ps1` (con `lista.json`), y entra al cerrar Iridium con el mismo ayudante (CO-I2). La copia de
// quien desarrolla no trae ese archivo: se arma en su PC (D-070).
import { execFile } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream } from 'node:stream/web'
import type { AccesoVersiones } from '../../compartido/puente'
import { commitDeEtiqueta } from '../../compartido/versiones'
import { leerVersionNueva } from './version-nueva'

/** Cada cuánto se mira si hay una versión nueva en GitHub. */
const CADA_MS = 6 * 60 * 60 * 1000
/** La primera vez, un rato después de abrir: que no compita con el arranque. */
const PRIMERA_MS = 20_000

/** `resources/actualizaciones.json`: de dónde se actualiza esta copia y qué versión es. */
export interface Actualizaciones {
  /** `dueño/nombre` del repositorio de GitHub. */
  repo: string
  /** El commit (corto) de esta versión. */
  commit: string
}

export async function leerActualizaciones(archivo: string): Promise<Actualizaciones | null> {
  try {
    const d = JSON.parse((await readFile(archivo, 'utf8')).replace(/^﻿/, ''))
    return typeof d.repo === 'string' && /^[\w.-]+\/[\w.-]+$/.test(d.repo) && typeof d.commit === 'string'
      ? { repo: d.repo, commit: d.commit }
      : null
  } catch {
    return null
  }
}

/** Lo que importa de la última versión publicada. */
export interface Publicada {
  commit: string
  /** La primera línea del commit (el nombre de la versión en GitHub). */
  mensaje: string
  fecha: string
  /** La dirección para bajar el `.zip` por la API. */
  zip: string
}

/** Lee la respuesta de `releases/latest`; null si no es una versión de Iridium con su `.zip`. */
export function leerPublicada(datos: unknown): Publicada | null {
  if (typeof datos !== 'object' || datos === null) return null
  const d = datos as { tag_name?: unknown; body?: unknown; published_at?: unknown; assets?: unknown }
  const commit = typeof d.tag_name === 'string' ? commitDeEtiqueta(d.tag_name) : null
  const zip = Array.isArray(d.assets)
    ? (d.assets as { name?: unknown; url?: unknown }[]).find(
        (a) => typeof a.name === 'string' && a.name.endsWith('.zip') && typeof a.url === 'string',
      )
    : undefined
  if (!commit || !zip) return null
  return {
    commit,
    mensaje: typeof d.body === 'string' ? (d.body.split('\n')[0] ?? '').trim() : '',
    fecha: typeof d.published_at === 'string' ? d.published_at : '',
    zip: zip.url as string,
  }
}

/** La clave de GitHub que ya tiene git, sin abrir ninguna ventana; null si no hay (o no hay git). */
export function claveGuardada(): Promise<string | null> {
  return new Promise((listo) => {
    const p = execFile(
      'git',
      ['credential', 'fill'],
      {
        encoding: 'utf8',
        windowsHide: true,
        timeout: 15_000,
        cwd: tmpdir(),
        env: { ...process.env, GCM_INTERACTIVE: 'never', GIT_TERMINAL_PROMPT: '0' },
      },
      (e, salida) => listo(e ? null : (/^password=(.+)$/m.exec(salida)?.[1]?.trim() ?? null)),
    )
    p.stdin?.end('protocol=https\nhost=github.com\n\n')
  })
}

export interface OpcionesVigia {
  /** La carpeta `release` (la de `win-unpacked`). */
  release: string
  actualizaciones: Actualizaciones
  anotar: (texto: string) => void
  /** La API de GitHub; las pruebas ponen un servidor local. */
  api?: string
  clave?: () => Promise<string | null>
  /** Cuánto espera para mirar la primera vez (las pruebas, menos). */
  primeraMs?: number
}

export class VigiaVersionGithub {
  private reloj: ReturnType<typeof setTimeout> | null = null
  private mirando = false
  /** Si el último pedido fue con la clave de git (para saber si falta la sesión o falta la invitación). */
  private conClave = false
  private acceso: AccesoVersiones = 'ok'
  private alCambiarAcceso: ((a: AccesoVersiones) => void) | null = null
  private readonly api: string
  private readonly clave: () => Promise<string | null>

  constructor(private readonly o: OpcionesVigia) {
    this.api = o.api ?? 'https://api.github.com'
    this.clave = o.clave ?? claveGuardada
  }

  vigilar(): void {
    const vuelta = (ms: number) => {
      this.reloj = setTimeout(() => {
        void this.mirar().finally(() => vuelta(CADA_MS))
      }, ms)
    }
    vuelta(this.o.primeraMs ?? PRIMERA_MS)
  }

  cerrar(): void {
    if (this.reloj) clearTimeout(this.reloj)
    this.reloj = null
  }

  /** Si esta copia puede ver las versiones (Q-123): sin sesión de GitHub, o con una cuenta sin invitación. */
  ultimoAcceso(): AccesoVersiones {
    return this.acceso
  }

  vigilarAcceso(alCambiar: (a: AccesoVersiones) => void): void {
    this.alCambiarAcceso = alCambiar
  }

  private ponerAcceso(a: AccesoVersiones): void {
    if (a === this.acceso) return
    this.acceso = a
    this.alCambiarAcceso?.(a)
  }

  /** Iniciar sesión en GitHub (con la ventana de git) y volver a mirar enseguida. */
  async iniciarSesion(
    entrar: () => Promise<{ tipo: 'ok' } | { tipo: 'error'; mensaje: string }>,
  ): Promise<{ tipo: 'ok' } | { tipo: 'error'; mensaje: string }> {
    const r = await entrar()
    if (r.tipo === 'error') return r
    await this.mirar()
    return this.acceso === 'ok'
      ? r
      : {
          tipo: 'error',
          mensaje:
            this.acceso === 'sin-permiso'
              ? 'Esa cuenta de GitHub no tiene acceso a Iridium: pedile a quien te lo pasó que te invite.'
              : 'No se inició la sesión en GitHub.',
        }
  }

  /** Un pedido a GitHub: primero sin clave (repositorio público); si no lo ve, con la de git (privado). */
  private async pedir(url: string, aceptar: string): Promise<Response> {
    const encabezados = { Accept: aceptar, 'User-Agent': 'Iridium', 'X-GitHub-Api-Version': '2022-11-28' }
    this.conClave = false
    const r = await fetch(url, { headers: encabezados })
    if (r.status !== 404 && r.status !== 401) return r
    const clave = await this.clave()
    if (!clave) return r
    this.conClave = true
    return fetch(url, { headers: { ...encabezados, Authorization: `Bearer ${clave}` } })
  }

  /**
   * Mira la última versión publicada y, si es otra, la baja y la deja lista. Devuelve qué hizo (para el registro y
   * las pruebas). Nunca tira: sin internet o sin acceso, lo intenta en la próxima vuelta.
   */
  async mirar(): Promise<'al-dia' | 'lista' | 'bajada' | 'sin-acceso' | 'falla'> {
    if (this.mirando) return 'al-dia'
    this.mirando = true
    try {
      const r = await this.pedir(
        `${this.api}/repos/${this.o.actualizaciones.repo}/releases/latest`,
        'application/vnd.github+json',
      )
      if (!r.ok) {
        this.o.anotar(`Versiones de GitHub: ${this.o.actualizaciones.repo} respondió ${r.status}`)
        if (r.status !== 404 && r.status !== 401 && r.status !== 403) return 'falla'
        this.ponerAcceso(this.conClave ? 'sin-permiso' : 'sin-sesion')
        return 'sin-acceso'
      }
      this.ponerAcceso('ok')
      const publicada = leerPublicada(await r.json())
      if (!publicada || publicada.commit === this.o.actualizaciones.commit) return 'al-dia'
      if ((await leerVersionNueva(this.o.release))?.commit === publicada.commit) return 'lista'
      await this.bajar(publicada)
      this.o.anotar(`Versiones de GitHub: bajada ${publicada.commit}; entra al cerrar`)
      return 'bajada'
    } catch (e) {
      this.o.anotar(`Versiones de GitHub: ${e instanceof Error ? e.message : String(e)}`)
      return 'falla'
    } finally {
      this.mirando = false
    }
  }

  /** Baja el `.zip`, lo abre en `release/bajando` y recién al final lo pasa a `release/nueva` con su `lista.json`. */
  private async bajar(p: Publicada): Promise<void> {
    const { release } = this.o
    const zip = join(release, 'bajando.zip')
    const carpeta = join(release, 'bajando')
    await rm(carpeta, { recursive: true, force: true })
    try {
      const r = await this.pedir(p.zip, 'application/octet-stream')
      if (!r.ok || !r.body) throw new Error(`no se pudo bajar la versión (${r.status})`)
      await pipeline(Readable.fromWeb(r.body as ReadableStream), createWriteStream(zip))
      await mkdir(carpeta, { recursive: true })
      await abrirZip(zip, carpeta)
      await stat(join(carpeta, 'win-unpacked', 'Iridium.exe'))
      const lista = { fecha: p.fecha.slice(0, 19), commit: p.commit, mensaje: p.mensaje, sinGuardar: false }
      await writeFile(join(carpeta, 'lista.json'), JSON.stringify(lista, null, 2))
      // Una versión anterior que estaba lista (y no entró) se reemplaza por esta.
      await rm(join(release, 'nueva'), { recursive: true, force: true })
      await rename(carpeta, join(release, 'nueva'))
    } finally {
      await rm(zip, { force: true })
      await rm(carpeta, { recursive: true, force: true })
    }
  }
}

/** Abre el `.zip` con el `tar` de Windows (el de Git no abre `.zip`). */
function abrirZip(zip: string, destino: string): Promise<void> {
  const tar =
    process.platform === 'win32'
      ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe')
      : 'tar'
  return new Promise((listo, fallo) => {
    execFile(
      tar,
      ['-xf', zip, '-C', destino],
      { windowsHide: true, timeout: 10 * 60 * 1000 },
      (e, _s, error) =>
        e ? fallo(new Error(`no se pudo abrir la versión bajada: ${error.trim() || e.message}`)) : listo(),
    )
  })
}
