// La sincronización con GitHub y Commit y subir (D-159), con el `git` del sistema: traer lo del remoto (sola, cada
// tanto, solo si se puede poner encima sin juntar nada), hacer un commit y subirlo, y Sincronizar (traer, juntar y
// subir). Lo que hace sola no abre ventanas: sin sesión de GitHub, lo dice. Lo que pide el usuario sí puede abrir la
// del Administrador de credenciales, como Publicar (D-081). Nunca pasa por una consola: los argumentos van tal cual.
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ResultadoGit, SincroniaGit } from '../../compartido/puente'
import { mensajeSugerido } from '../../compartido/sincronia'
import { ladosDe, motivoAlGuardar, motivoAlJuntar, motivoDeRed, queTraer } from '../core/sincronia'
import { tieneRepo } from './git'

/** Lo que puede tardar traer o subir (un repositorio grande, la ventana para iniciar sesión). */
const ESPERA_MS = 3 * 60_000
/** Lo que espera lo que hace sola: si el remoto no contesta, la próxima vuelta. */
const ESPERA_SOLA_MS = 60_000

interface Salida {
  codigo: number
  texto: string
  error: string
}

class SinPrograma extends Error {}

/** Corre `git` y devuelve el código, la salida y el error (no falla por un código distinto de 0). */
function correr(carpeta: string, args: string[], interactivo: boolean): Promise<Salida> {
  return new Promise((listo, fallo) => {
    execFile(
      'git',
      ['-c', 'core.quotepath=off', '-c', 'color.ui=never', '--no-pager', ...args],
      {
        cwd: carpeta,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        windowsHide: true,
        timeout: interactivo ? ESPERA_MS : ESPERA_SOLA_MS,
        env: {
          ...process.env,
          LC_ALL: 'C',
          LANGUAGE: 'C',
          GIT_TERMINAL_PROMPT: '0',
          // Lo que hace sola no puede abrir la ventana para iniciar sesión.
          ...(interactivo ? {} : { GCM_INTERACTIVE: 'never' }),
          // Un merge no abre el editor para el mensaje.
          GIT_MERGE_AUTOEDIT: 'no',
          GIT_EDITOR: 'true',
        },
      },
      (e, texto, error) => {
        if (!e) return listo({ codigo: 0, texto, error })
        const codigo = (e as NodeJS.ErrnoException).code
        if (codigo === 'ENOENT') return fallo(new SinPrograma())
        listo({ codigo: typeof codigo === 'number' ? codigo : -1, texto, error: error || e.message })
      },
    )
  })
}

/** Lo de esta PC y lo del remoto, según la última vez que se trajo; null sin rama que siga a una del remoto. */
async function lados(ruta: string): Promise<{ adelante: number; atras: number } | null> {
  const r = await correr(ruta, ['rev-list', '--left-right', '--count', 'HEAD...@{u}'], false)
  return r.codigo === 0 ? ladosDe(r.texto) : null
}

/** ¿La rama de ahora sigue a una del remoto? */
async function sigueAlRemoto(ruta: string): Promise<boolean> {
  const r = await correr(ruta, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], false)
  return r.codigo === 0 && r.texto.trim() !== ''
}

/** `git fetch` del remoto de la rama; null si salió bien. */
async function fetch(ruta: string, interactivo: boolean): Promise<Salida | null> {
  const r = await correr(ruta, ['fetch', '--quiet', '--no-tags'], interactivo)
  return r.codigo === 0 ? null : r
}

/**
 * Lo que hace sola cada tanto (D-159): si la rama sigue a una del remoto, trae sus commits y, si esta PC no tiene
 * commits propios, los pone encima (`merge --ff-only`, que no toca nada si chocan con cambios sin guardar). Null si
 * el proyecto no tiene repositorio o su rama no está en un remoto.
 */
export async function traerDelRemoto(ruta: string, ahora = Date.now()): Promise<SincroniaGit | null> {
  try {
    if (!(await tieneRepo(ruta)) || !(await sigueAlRemoto(ruta))) return null
    const fallo = await fetch(ruta, false)
    if (fallo) return { cuando: ahora, bajados: 0, ...motivoDeRed(fallo.error) }
    const l = await lados(ruta)
    if (!l) return null
    const que = queTraer(l.adelante, l.atras)
    if (que !== 'traer') return { cuando: ahora, resultado: que, bajados: 0, motivo: null }
    const r = await correr(ruta, ['merge', '--ff-only', '--quiet', '@{u}'], false)
    if (r.codigo !== 0)
      return { cuando: ahora, resultado: 'choca', bajados: 0, motivo: motivoAlJuntar(r.error) }
    return { cuando: ahora, resultado: 'bajado', bajados: l.atras, motivo: null }
  } catch (e) {
    if (e instanceof SinPrograma) return null
    return {
      cuando: ahora,
      resultado: 'error',
      bajados: 0,
      motivo: e instanceof Error ? e.message : String(e),
    }
  }
}

const mal = (mensaje: string): ResultadoGit => ({ tipo: 'error', mensaje })
const bien = (aviso: string | null = null): ResultadoGit => ({ tipo: 'ok', aviso, web: null })

/** El remoto de donde se baja (el de `origin`, o el primero); null si no hay. */
async function remoto(ruta: string): Promise<string | null> {
  const r = await correr(ruta, ['remote'], false)
  const nombres = r.texto.split(/\s+/).filter(Boolean)
  return nombres.includes('origin') ? 'origin' : (nombres[0] ?? null)
}

/**
 * Sincronizar (D-159), como en VS Code: trae lo del remoto, lo junta con lo de esta PC (si chocan, no deja nada a
 * medias) y sube lo que falta. Si la rama todavía no está en el remoto, la sube y la deja siguiéndolo.
 */
export async function sincronizar(ruta: string): Promise<ResultadoGit> {
  try {
    if (!(await tieneRepo(ruta))) return mal('El proyecto no tiene git.')
    const nombre = await remoto(ruta)
    if (!nombre) return mal('El proyecto no está en GitHub ni en otro remoto.')
    const rama = (await correr(ruta, ['branch', '--show-current'], false)).texto.trim()
    if (!rama)
      return mal('No hay una rama elegida (se está mirando un commit suelto): pídele a la IA que lo arregle.')
    if (!(await sigueAlRemoto(ruta))) {
      const r = await correr(ruta, ['push', '--quiet', '-u', nombre, `HEAD:refs/heads/${rama}`], true)
      return r.codigo === 0 ? bien(`La rama ${rama} quedó subida.`) : mal(motivoDeRed(r.error).motivo)
    }
    const fallo = await fetch(ruta, true)
    if (fallo) return mal(motivoDeRed(fallo.error).motivo)
    let l = await lados(ruta)
    if (!l) return mal('No se pudo comparar con el remoto.')
    let trajo = 0
    if (l.atras > 0) {
      const r = await correr(ruta, ['merge', '--no-edit', '--quiet', '@{u}'], true)
      if (r.codigo !== 0) {
        // Si quedó a medio juntar, se deshace: el proyecto queda como estaba.
        await correr(ruta, ['merge', '--abort'], false)
        return mal(motivoAlJuntar(`${r.error}\n${r.texto}`))
      }
      trajo = l.atras
      l = (await lados(ruta)) ?? { adelante: 0, atras: 0 }
    }
    if (l.adelante > 0) {
      const r = await correr(ruta, ['push', '--quiet'], true)
      if (r.codigo !== 0) return mal(motivoDeRed(r.error).motivo)
    }
    const partes = [
      trajo > 0 ? `trajo ${trajo === 1 ? '1 commit' : `${trajo} commits`}` : '',
      l.adelante > 0 ? `subió ${l.adelante === 1 ? '1 commit' : `${l.adelante} commits`}` : '',
    ].filter(Boolean)
    // Si ya estaba al día no hay aviso: lo dice «Revisado recién» (R-96).
    return bien(partes.length ? `Sincronizado: ${partes.join(' y ')}.` : null)
  } catch (e) {
    if (e instanceof SinPrograma) return mal('No se encontró git en la PC.')
    return mal(e instanceof Error ? e.message : String(e))
  }
}

/**
 * Commit y subir (D-159): guarda en un commit los cambios preparados o, si no hay ninguno, todos (como VS Code) y,
 * con `subir`, sincroniza. Si el commit sale y subir no, el commit queda (dice qué falló).
 */
export async function guardarYSubir(ruta: string, mensaje: string, subir: boolean): Promise<ResultadoGit> {
  try {
    if (!(await tieneRepo(ruta))) return mal('El proyecto no tiene git.')
    const texto = mensaje.trim()
    if (!texto) return mal('Escribe qué cambió.')
    const preparados = await correr(ruta, ['diff', '--cached', '--quiet'], false)
    if (preparados.codigo === 0) {
      const todo = await correr(ruta, ['add', '--all'], false)
      if (todo.codigo !== 0) return mal(motivoAlGuardar(todo.error))
    }
    const r = await correr(ruta, ['commit', '--quiet', '--no-edit', '-m', texto], false)
    if (r.codigo !== 0) return mal(motivoAlGuardar(`${r.error}\n${r.texto}`))
    if (!subir) return bien('Commit hecho.')
    const s = await sincronizar(ruta)
    if (s.tipo === 'error') return mal(`El commit se hizo, pero no se pudo subir: ${s.mensaje}`)
    return bien(`Commit hecho. ${s.aviso ?? ''}`.trim())
  } catch (e) {
    if (e instanceof SinPrograma) return mal('No se encontró git en la PC.')
    return mal(e instanceof Error ? e.message : String(e))
  }
}

/**
 * Cómo terminó subir solas unas respuestas (T-89): `subida` (commit hecho y subido), `nada` (no había nada que
 * guardar: ya estaban en un commit), `sin-remoto` (sin git o con la rama fuera de un remoto: no se hace nada),
 * `esperar` (sin conexión, GitHub con commits que no se pueden poner encima, cambios que chocan: no se tocó nada y se
 * reintenta) y `sin-subir` (el commit se hizo pero no subió: queda para Sincronizar).
 */
export interface SubidaRespuestas {
  resultado: 'subida' | 'nada' | 'sin-remoto' | 'esperar' | 'sin-subir'
  motivo: string | null
  /** El mensaje del commit, si se hizo. */
  mensaje?: string
}

/**
 * Sube solas las respuestas que se guardaron desde Iridium (T-89), para que la otra PC las vea sin Commit y subir.
 * El commit lleva solo esas respuestas y sus imágenes, nunca otros cambios (ni los preparados). Antes trae lo del
 * remoto, como la vigía (solo si se pone encima); si no se puede dejar al día, no hace el commit, para no separar
 * las dos PC. Nunca abre la ventana para iniciar sesión.
 */
export async function subirRespuestas(ruta: string, codigos: readonly string[]): Promise<SubidaRespuestas> {
  const asi = (resultado: SubidaRespuestas['resultado'], motivo: string | null = null): SubidaRespuestas => ({
    resultado,
    motivo,
  })
  try {
    if (!(await tieneRepo(ruta)) || !(await sigueAlRemoto(ruta))) return asi('sin-remoto')
    const rama = (await correr(ruta, ['branch', '--show-current'], false)).texto.trim()
    if (!rama) return asi('sin-remoto')
    const rutas = codigos
      .flatMap((q) => [`docs/respuestas/${q}.md`, `docs/respuestas/${q}`])
      .filter((r) => existsSync(join(ruta, ...r.split('/'))))
    if (rutas.length === 0) return asi('nada')
    const cambios = await correr(
      ruta,
      ['status', '--porcelain', '--untracked-files=all', '--', ...rutas],
      false,
    )
    if (cambios.codigo !== 0) return asi('esperar', motivoAlGuardar(cambios.error))
    const archivos = cambios.texto
      .split('\n')
      .filter((l) => l.trim() !== '')
      .map((l) => ({ ruta: l.slice(3).replace(/^"|"$/g, '') }))
    if (archivos.length === 0) return asi('nada')

    const fallo = await fetch(ruta, false)
    if (fallo) return asi('esperar', motivoDeRed(fallo.error).motivo)
    const l = await lados(ruta)
    if (!l) return asi('esperar', 'No se pudo comparar con el remoto.')
    const que = queTraer(l.adelante, l.atras)
    if (que === 'separada')
      return asi('esperar', 'Esta PC y GitHub tienen commits distintos: Sincronizar, en Git, los junta.')
    if (que === 'traer') {
      const r = await correr(ruta, ['merge', '--ff-only', '--quiet', '@{u}'], false)
      if (r.codigo !== 0) return asi('esperar', motivoAlJuntar(r.error))
    }

    const mensaje = mensajeSugerido(archivos) || 'Respuestas'
    const add = await correr(ruta, ['add', '--', ...rutas], false)
    if (add.codigo !== 0) return asi('esperar', motivoAlGuardar(add.error))
    // Con las rutas, el commit lleva solo esas: lo que estaba preparado de otra cosa sigue preparado.
    const c = await correr(ruta, ['commit', '--quiet', '--no-edit', '-m', mensaje, '--', ...rutas], false)
    if (c.codigo !== 0) return asi('esperar', motivoAlGuardar(`${c.error}\n${c.texto}`))
    const p = await correr(ruta, ['push', '--quiet'], false)
    if (p.codigo !== 0) return { resultado: 'sin-subir', motivo: motivoDeRed(p.error).motivo, mensaje }
    return { resultado: 'subida', motivo: null, mensaje }
  } catch (e) {
    if (e instanceof SinPrograma) return asi('sin-remoto')
    return asi('esperar', e instanceof Error ? e.message : String(e))
  }
}
