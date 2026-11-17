// Git del proyecto (H-16): corre el `git` del sistema en la carpeta del proyecto, solo con comandos que leen. Nunca
// pasa por una consola (los argumentos van tal cual), no toma el candado del índice (GIT_OPTIONAL_LOCKS=0: la IA
// puede estar trabajando en el mismo repo) y la ventana solo puede pedir archivos que git nombró en ese commit.
import { execFile } from 'node:child_process'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type {
  ArchivoGit,
  DetalleCommit,
  DiferenciaGit,
  GitProyecto,
  RemotoGit,
} from '../../compartido/puente'
import { esBinario, LIMITE_TEXTO_BYTES, MUESTRA_BINARIO_BYTES } from '../core/archivos'
import {
  ARBOL_VACIO,
  archivosDe,
  diferenciaDe,
  diferenciaDeNuevo,
  dondeEsta,
  esHashValido,
  estadoDe,
  FORMATO_LOG,
  historialDe,
  LIMITE_HISTORIAL,
  lineasDeTexto,
  numerosDe,
  remotoElegido,
  SIN_GUARDAR,
} from '../core/git'

/** Más que esto de salida y git se corta (un diff enorme no traba la app). */
const LIMITE_SALIDA = 32 * 1024 * 1024
/** Los archivos nuevos sin seguir a los que se les cuentan las líneas (más, sin número). */
const NUEVOS_CONTADOS = 300

class SinPrograma extends Error {}

interface Salida {
  texto: string
  codigo: number
  error: string
}

/** Corre `git` con esos argumentos en la carpeta. `aceptar`: los códigos de salida que no son error. */
function correr(carpeta: string, args: string[], aceptar: number[] = [0]): Promise<string> {
  return new Promise((listo, fallo) => {
    execFile(
      'git',
      ['-c', 'core.quotepath=off', '-c', 'color.ui=never', '-c', 'core.pager=cat', '--no-pager', ...args],
      {
        cwd: carpeta,
        encoding: 'utf8',
        maxBuffer: LIMITE_SALIDA,
        windowsHide: true,
        // En inglés, para entender «files changed»; sin preguntar nada ni tomar candados.
        env: {
          ...process.env,
          LC_ALL: 'C',
          LANGUAGE: 'C',
          GIT_OPTIONAL_LOCKS: '0',
          GIT_TERMINAL_PROMPT: '0',
        },
      },
      (e, texto, error) => {
        const s: Salida = { texto, codigo: 0, error }
        if (e) {
          const codigo = (e as NodeJS.ErrnoException).code
          if (codigo === 'ENOENT') return fallo(new SinPrograma())
          if (typeof codigo === 'number') s.codigo = codigo
          else return fallo(new Error(error.trim() || e.message))
        }
        if (aceptar.includes(s.codigo)) listo(s.texto)
        else fallo(new Error(s.error.trim() || `git terminó con el código ${s.codigo}`))
      },
    )
  })
}

export function motivo(e: unknown): string {
  const t = e instanceof Error ? e.message : String(e)
  return t.replace(/^(fatal|error): /i, '').split('\n')[0] ?? t
}

/** ¿La carpeta tiene su propio repositorio? (Uno de una carpeta de más arriba no cuenta: sería otro proyecto.) */
export async function tieneRepo(proyecto: string): Promise<boolean> {
  try {
    await stat(join(proyecto, '.git'))
    return true
  } catch {
    return false
  }
}

/** La fecha (ms) del último commit del proyecto; null sin repositorio, sin commits o sin git (D-136). */
export async function fechaUltimoCommit(proyecto: string): Promise<number | null> {
  if (!(await tieneRepo(proyecto))) return null
  try {
    const s = Number((await correr(proyecto, ['log', '-1', '--format=%ct'])).trim())
    return s > 0 ? s * 1000 : null
  } catch {
    return null
  }
}

/** HEAD, o null si el repositorio todavía no tiene commits. */
async function cabeza(proyecto: string): Promise<string | null> {
  const h = (await correr(proyecto, ['rev-parse', '--verify', '-q', 'HEAD'], [0, 1])).trim()
  return h || null
}

/** Las líneas de un archivo nuevo sin seguir; null si es binario, muy grande o no se puede leer. */
async function contarNuevo(proyecto: string, ruta: string): Promise<number | null> {
  try {
    const real = join(proyecto, ...ruta.split('/'))
    const s = await stat(real)
    if (!s.isFile() || s.size > LIMITE_TEXTO_BYTES) return null
    const datos = await readFile(real)
    if (esBinario(datos.subarray(0, MUESTRA_BINARIO_BYTES))) return null
    return lineasDeTexto(datos.toString('utf8'))
  } catch {
    return null
  }
}

/** Los cambios sin guardar: lo que git ve distinto de HEAD (preparado o no) y los archivos nuevos. */
async function cambiosSinGuardar(proyecto: string, base: string): Promise<ArchivoGit[]> {
  const [estado, numeros] = await Promise.all([
    correr(proyecto, ['status', '--porcelain=v1', '-z', '--no-renames', '--untracked-files=all']),
    correr(proyecto, ['diff', base, '--numstat', '-z', '--no-renames', '--']),
  ])
  const n = numerosDe(numeros)
  let contados = 0
  const archivos: ArchivoGit[] = []
  for (const a of estadoDe(estado)) {
    let cuenta = n.get(a.ruta) ?? { mas: null, menos: null }
    if (a.sinSeguir) {
      const lineas = contados++ < NUEVOS_CONTADOS ? await contarNuevo(proyecto, a.ruta) : null
      cuenta = { mas: lineas, menos: lineas === null ? null : 0 }
    }
    archivos.push({ ruta: a.ruta, cambio: a.cambio, ...cuenta, preparado: a.preparado })
  }
  return archivos
}

/** Más que esto de commits sin subir no se cuentan uno por uno (se muestra «1000+»). */
const LIMITE_SIN_SUBIR = 1000

/**
 * Si el repositorio tiene un remoto y qué commits no están en él. No se conecta a internet: es lo que git sabe desde
 * la última vez que se sincronizó (`fetch`, `pull` o `push`).
 */
async function remotoDe(
  proyecto: string,
  head: string | null,
): Promise<{ remoto: RemotoGit; sinSubir: Set<string> }> {
  const elegido = remotoElegido(await correr(proyecto, ['remote', '-v']))
  if (!elegido) return { remoto: { tipo: 'local' }, sinSubir: new Set() }
  const [sigue, sinSubir] = await Promise.all([
    correr(proyecto, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], [0, 128]),
    head
      ? correr(proyecto, ['rev-list', `-n${LIMITE_SIN_SUBIR}`, head, '--not', '--remotes'])
      : Promise.resolve(''),
  ])
  const rama = sigue.trim() || null
  const sinBajar = rama
    ? Number((await correr(proyecto, ['rev-list', '--count', 'HEAD..@{u}'], [0, 128])).trim())
    : 0
  const hashes = new Set(sinSubir.split(/\s+/).filter(Boolean))
  return {
    remoto: {
      tipo: 'remoto',
      ...dondeEsta(elegido.url),
      sigue: rama,
      sinSubir: hashes.size,
      sinBajar: Number.isFinite(sinBajar) ? sinBajar : 0,
    },
    sinSubir: hashes,
  }
}

export async function leerGit(proyecto: string): Promise<GitProyecto> {
  try {
    if (!(await tieneRepo(proyecto))) return { tipo: 'sin-git' }
    const head = await cabeza(proyecto)
    const [rama, cambios, log, r] = await Promise.all([
      correr(proyecto, ['branch', '--show-current']),
      cambiosSinGuardar(proyecto, head ?? ARBOL_VACIO),
      head
        ? correr(proyecto, [
            'log',
            `-n${LIMITE_HISTORIAL + 1}`,
            `--format=${FORMATO_LOG}`,
            '--shortstat',
            '--no-renames',
            '--diff-merges=first-parent',
          ])
        : Promise.resolve(''),
      remotoDe(proyecto, head),
    ])
    const local = r.remoto.tipo === 'local'
    const historial = historialDe(log).map((c) => ({ ...c, subido: local ? null : !r.sinSubir.has(c.hash) }))
    const nombre = rama.trim()
    return {
      tipo: 'ok',
      rama: nombre || (head ? head.slice(0, 7) : ''),
      sinRama: !nombre && head !== null,
      remoto: r.remoto,
      cambios,
      historial: historial.slice(0, LIMITE_HISTORIAL),
      hayMas: historial.length > LIMITE_HISTORIAL,
    }
  } catch (e) {
    if (e instanceof SinPrograma) return { tipo: 'sin-programa' }
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** ¿Es un commit de este repositorio? */
async function existeCommit(proyecto: string, hash: string): Promise<boolean> {
  const r = await correr(proyecto, ['rev-parse', '--verify', '-q', `${hash}^{commit}`], [0, 1])
  return r.trim() !== ''
}

const SHOW = ['show', '--format=', '--no-renames', '--diff-merges=first-parent']

async function archivosDeCommit(proyecto: string, hash: string): Promise<ArchivoGit[]> {
  const [letras, numeros] = await Promise.all([
    correr(proyecto, [...SHOW, '--name-status', '-z', hash, '--']),
    correr(proyecto, [...SHOW, '--numstat', '-z', hash, '--']),
  ])
  return archivosDe(letras, numeros)
}

export async function leerCommit(proyecto: string, hash: string): Promise<DetalleCommit> {
  try {
    if (!esHashValido(hash) || !(await tieneRepo(proyecto))) return { tipo: 'no-esta' }
    if (!(await existeCommit(proyecto, hash))) return { tipo: 'no-esta' }
    const [mensaje, archivos] = await Promise.all([
      correr(proyecto, ['show', '-s', '--format=%B', hash, '--']),
      archivosDeCommit(proyecto, hash),
    ])
    return { tipo: 'ok', mensajeCompleto: mensaje.trimEnd(), archivos }
  } catch (e) {
    if (e instanceof SinPrograma) return { tipo: 'error', mensaje: 'No se encontró git en la PC.' }
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** Una ruta como pathspec literal: sin comodines ni nada mágico. */
const literal = (ruta: string) => `:(literal)${ruta}`

export async function leerDiferencia(
  proyecto: string,
  commit: string,
  archivo: string,
): Promise<DiferenciaGit> {
  try {
    if (!(await tieneRepo(proyecto))) return { tipo: 'error', mensaje: 'El proyecto no tiene git.' }
    if (commit === SIN_GUARDAR) {
      const head = await cabeza(proyecto)
      const estado = estadoDe(
        await correr(proyecto, ['status', '--porcelain=v1', '-z', '--no-renames', '--untracked-files=all']),
      )
      const a = estado.find((x) => x.ruta === archivo)
      if (!a) return { tipo: 'error', mensaje: 'Ese archivo ya no tiene cambios sin guardar.' }
      if (a.sinSeguir) {
        const real = join(proyecto, ...archivo.split('/'))
        const s = await stat(real)
        if (s.size > LIMITE_TEXTO_BYTES)
          return { tipo: 'error', mensaje: 'Es muy grande para mostrarlo acá.' }
        const datos = await readFile(real)
        if (esBinario(datos.subarray(0, MUESTRA_BINARIO_BYTES))) return { tipo: 'binario' }
        return diferenciaDeNuevo(datos.toString('utf8'))
      }
      return diferenciaDe(
        await correr(proyecto, ['diff', head ?? ARBOL_VACIO, '--no-renames', '-U3', '--', literal(archivo)]),
      )
    }
    if (!esHashValido(commit) || !(await existeCommit(proyecto, commit)))
      return { tipo: 'error', mensaje: 'Ese commit ya no está.' }
    // Solo un archivo que git nombra en ese commit (la ventana no elige rutas libres).
    const archivos = await archivosDeCommit(proyecto, commit)
    if (!archivos.some((x) => x.ruta === archivo))
      return { tipo: 'error', mensaje: 'Ese archivo no está en el commit.' }
    return diferenciaDe(await correr(proyecto, [...SHOW, '-U3', commit, '--', literal(archivo)]))
  } catch (e) {
    if (e instanceof SinPrograma) return { tipo: 'error', mensaje: 'No se encontró git en la PC.' }
    return { tipo: 'error', mensaje: motivo(e) }
  }
}
