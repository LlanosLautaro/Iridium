// Crear el repositorio y publicarlo en GitHub desde la sección Git (D-081). Lo único que cambia el repositorio desde
// Iridium. La sesión de GitHub es la de git (el Administrador de credenciales que trae Git para Windows): si no hay,
// git abre su ventana para iniciarla, y la misma sesión sirve después para los `push` de la IA. La clave solo pasa
// por el proceso principal, en memoria, y nunca se guarda ni se muestra.
import { execFile } from 'node:child_process'
import { readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { esNombreRepo } from '../../compartido/github'
import type { CuentaGithub, PedidoPublicar, ResultadoGit } from '../../compartido/puente'
import { agregarAGitignore, avisoDeAfuera, bloqueGitignore, tieneClaves } from '../core/github'
import { motivo, tieneRepo } from './git'

/** Lo que puede tardar el inicio de sesión en la ventana de git, o subir un repositorio grande. */
const ESPERA_MS = 5 * 60 * 1000
const API = 'https://api.github.com'

class SinPrograma extends Error {}

/** Corre `git` en la carpeta, sin consola. `entrada`: lo que se le escribe (para `git credential`). */
function git(carpeta: string, args: string[], entrada?: string): Promise<string> {
  return new Promise((listo, fallo) => {
    const p = execFile(
      'git',
      ['-c', 'core.quotepath=off', '--no-pager', ...args],
      {
        cwd: carpeta,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        windowsHide: true,
        timeout: ESPERA_MS,
        // Sin preguntas en una consola que no existe; la ventana del Administrador de credenciales sí puede abrirse.
        env: { ...process.env, LC_ALL: 'C', LANGUAGE: 'C', GIT_TERMINAL_PROMPT: '0' },
      },
      (e, texto, error) => {
        if (!e) return listo(texto)
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') return fallo(new SinPrograma())
        fallo(new Error(error.trim() || e.message))
      },
    )
    if (entrada !== undefined) p.stdin?.end(entrada)
  })
}

/** Lo que hace falta de GitHub: la cuenta y crear el repositorio. Hay uno de verdad y uno falso para las pruebas. */
export interface Github {
  cuenta(): Promise<CuentaGithub>
  /** Crea el repositorio. `reescribir`: adónde sube de verdad `clon` (solo el falso). */
  crear(pedido: PedidoPublicar): Promise<{ web: string; clon: string; reescribir: string | null }>
}

class ErrorGithub extends Error {}

const PEDIDO = 'protocol=https\nhost=github.com\n\n'

interface Credencial {
  usuario: string
  clave: string
}

/** La sesión de GitHub que tiene git; si no hay, el Administrador de credenciales abre su ventana. */
async function credencial(): Promise<Credencial> {
  let salida: string
  try {
    salida = await git(tmpdir(), ['credential', 'fill'], PEDIDO)
  } catch (e) {
    if (e instanceof SinPrograma) throw new ErrorGithub('No se encontró git en la PC.')
    throw new ErrorGithub(
      'No se pudo iniciar sesión en GitHub. Hace falta Git para Windows, que trae la ventana para iniciarla (git-scm.com).',
    )
  }
  const valor = (k: string) => salida.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1]?.trim() ?? ''
  const c = { usuario: valor('username'), clave: valor('password') }
  if (!c.clave) throw new ErrorGithub('No se inició la sesión en GitHub.')
  return c
}

const linea = (c: Credencial) =>
  `protocol=https\nhost=github.com\nusername=${c.usuario}\npassword=${c.clave}\n\n`

/** Guarda la sesión que funcionó (para los `push`) u olvida la que GitHub rechazó (la próxima vez se vuelve a pedir). */
async function recordar(c: Credencial, sirve: boolean): Promise<void> {
  try {
    await git(tmpdir(), ['credential', sirve ? 'approve' : 'reject'], linea(c))
  } catch {
    // Si no se puede, la próxima vez se vuelve a pedir: no cambia lo que se hizo.
  }
}

async function api(c: Credencial, ruta: string, cuerpo?: unknown): Promise<Response> {
  try {
    return await fetch(`${API}${ruta}`, {
      method: cuerpo === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: `Bearer ${c.clave}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Iridium',
        ...(cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: cuerpo === undefined ? null : JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    throw new ErrorGithub('No se pudo conectar con GitHub. ¿Hay internet?')
  }
}

async function rechazada(c: Credencial): Promise<never> {
  await recordar(c, false)
  throw new ErrorGithub(
    'GitHub no aceptó la sesión guardada. Prueba de nuevo: se abre la ventana para iniciarla.',
  )
}

export function githubReal(): Github {
  return {
    async cuenta() {
      try {
        const c = await credencial()
        const r = await api(c, '/user')
        if (r.status === 401) await rechazada(c)
        if (!r.ok) throw new ErrorGithub(`GitHub respondió con un error (${r.status}).`)
        await recordar(c, true)
        const { login } = (await r.json()) as { login?: unknown }
        return { tipo: 'ok', usuario: typeof login === 'string' ? login : c.usuario }
      } catch (e) {
        return { tipo: 'error', mensaje: e instanceof ErrorGithub ? e.message : motivo(e) }
      }
    },
    async crear(pedido) {
      const c = await credencial()
      const r = await api(c, '/user/repos', {
        name: pedido.nombre,
        private: pedido.privado,
        auto_init: false,
      })
      if (r.status === 401) await rechazada(c)
      if (r.status === 422)
        throw new ErrorGithub(`Ya tienes un repositorio que se llama «${pedido.nombre}» en GitHub.`)
      if (r.status === 403)
        throw new ErrorGithub('La sesión de GitHub no tiene permiso para crear repositorios.')
      if (!r.ok) throw new ErrorGithub(`GitHub respondió con un error (${r.status}).`)
      const d = (await r.json()) as { html_url?: unknown; clone_url?: unknown }
      if (typeof d.html_url !== 'string' || typeof d.clone_url !== 'string')
        throw new ErrorGithub('GitHub creó el repositorio pero no dijo su dirección.')
      return { web: d.html_url, clon: d.clone_url, reescribir: null }
    },
  }
}

/** Para las pruebas (`IRIDIUM_GITHUB=falso`): la cuenta «prueba» y repositorios en una carpeta temporal. */
export function githubFalso(carpeta = join(tmpdir(), 'iridium-github-falso')): Github {
  return {
    async cuenta() {
      return { tipo: 'ok', usuario: 'prueba' }
    },
    async crear(pedido) {
      if (pedido.nombre === 'existe')
        throw new ErrorGithub(`Ya tienes un repositorio que se llama «${pedido.nombre}» en GitHub.`)
      const destino = join(carpeta, `${pedido.nombre}.git`)
      await rm(destino, { recursive: true, force: true })
      await git(tmpdir(), ['init', '-q', '--bare', destino])
      const web = `https://github.com/prueba/${pedido.nombre}`
      return { web, clon: `${web}.git`, reescribir: destino }
    },
  }
}

async function existe(ruta: string): Promise<boolean> {
  try {
    await stat(ruta)
    return true
  } catch {
    return false
  }
}

/** ¿git ignora esa ruta? */
async function ignorada(proyecto: string, ruta: string): Promise<boolean> {
  try {
    await git(proyecto, ['check-ignore', '-q', ruta])
    return true
  } catch {
    return false
  }
}

const error = (mensaje: string): ResultadoGit => ({ tipo: 'error', mensaje })

/**
 * Crea el repositorio con la rama `main` y un primer commit con todo, menos las dependencias y los archivos con
 * claves, que van primero al `.gitignore`.
 */
export async function inicializarRepo(proyecto: string): Promise<ResultadoGit> {
  try {
    if (await tieneRepo(proyecto)) return error('El proyecto ya tiene su repositorio.')
    await git(proyecto, ['init', '-q', '-b', 'main'])
    const conDependencias =
      (await existe(join(proyecto, 'node_modules'))) && !(await ignorada(proyecto, 'node_modules/'))
    const sinSeguir = await git(proyecto, [
      'ls-files',
      '--others',
      '--exclude-standard',
      '-z',
      '--',
      '.',
      ':(exclude,glob)**/node_modules/**',
    ])
    const claves = sinSeguir.split('\0').filter((r) => r && tieneClaves(r))
    const bloque = bloqueGitignore(conDependencias, claves)
    if (bloque) {
      const ruta = join(proyecto, '.gitignore')
      const actual = (await existe(ruta)) ? await readFile(ruta, 'utf8') : ''
      await writeFile(ruta, agregarAGitignore(actual, bloque))
    }
    await git(proyecto, ['add', '-A'])
    try {
      await git(proyecto, ['commit', '-q', '--allow-empty', '-m', 'Primer commit'])
    } catch (e) {
      const m = motivo(e)
      if (/user\.(name|email)|identity|tell me who you are/i.test(m))
        return error(
          'El repositorio quedó creado, pero git no sabe con qué nombre firmar los commits. Pídele a Claude que lo configure y que haga el primer commit.',
        )
      return error(`El repositorio quedó creado, pero no se pudo hacer el primer commit: ${m}`)
    }
    return { tipo: 'ok', aviso: avisoDeAfuera(claves), web: null }
  } catch (e) {
    if (e instanceof SinPrograma) return error('No se encontró git en la PC.')
    return error(motivo(e))
  }
}

/** Crea el repositorio en GitHub, lo pone como `origin` y sube la rama. Solo si tiene commits y ningún remoto. */
export async function publicarRepo(
  proyecto: string,
  pedido: PedidoPublicar,
  github: Github,
): Promise<ResultadoGit> {
  try {
    if (!esNombreRepo(pedido.nombre))
      return error('El nombre solo puede tener letras sin acento, números, puntos, guiones y guiones bajos.')
    if (!(await tieneRepo(proyecto))) return error('El proyecto no tiene repositorio.')
    if ((await git(proyecto, ['remote'])).trim())
      return error('El repositorio ya está publicado en otro lado.')
    try {
      await git(proyecto, ['rev-parse', '--verify', '-q', 'HEAD'])
    } catch {
      return error('Todavía no tiene commits: no hay nada para publicar.')
    }
    const r = await github.crear(pedido)
    await git(proyecto, ['remote', 'add', 'origin', r.clon])
    try {
      const desvio = r.reescribir ? ['-c', `url.${r.reescribir}.insteadOf=${r.clon}`] : []
      await git(proyecto, [...desvio, 'push', '-q', '-u', 'origin', 'HEAD'])
    } catch (e) {
      return error(
        `El repositorio se creó en GitHub (${r.web}), pero no se pudo subir: ${motivo(e)}. Pídele a Claude que lo suba.`,
      )
    }
    return { tipo: 'ok', aviso: null, web: r.web }
  } catch (e) {
    if (e instanceof SinPrograma) return error('No se encontró git en la PC.')
    return error(e instanceof ErrorGithub ? e.message : motivo(e))
  }
}
