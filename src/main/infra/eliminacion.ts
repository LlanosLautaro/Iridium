// Copiado de la app anterior de proyectos (D-026).
// Eliminar un proyecto en disco (D-006): analizar qué es regenerable y borrarlo definitivamente.
// Mandar a la papelera lo hace VS Code (extension/), que es quien tiene acceso a ella.
import { lstat, readdir, readFile, rm, rmdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { PlanEliminacion } from '../../compartido/tipos'
import { esRegenerable, estaIgnorada, type Gitignore, NOMBRES_REGENERABLES } from '../core/regenerables'
import { recorrer } from './recorrido'

interface Entrada {
  name: string
  isDirectory(): boolean
  isFile(): boolean
}

async function listar(carpeta: string): Promise<Entrada[]> {
  return readdir(carpeta, { withFileTypes: true })
}

async function tamanos(archivos: string[]): Promise<number[]> {
  return Promise.all(
    archivos.map((a) =>
      lstat(a).then(
        (s) => s.size,
        () => 0,
      ),
    ),
  )
}

/**
 * Recorre todo el proyecto (sin entrar en `.git` ni en las regenerables, RNF-2) y arma el plan, sin tamaños:
 * solo lee carpetas, que es rápido. Medir cada archivo es lo lento (tamanoCarpeta).
 */
export async function analizarCarpeta(rutaProyecto: string): Promise<PlanEliminacion> {
  const plan: PlanEliminacion = { regenerables: [], papelera: { archivos: 0, conGit: false } }
  const gitignores: Gitignore[] = []

  // `enPaquete`: está dentro de un node_modules que no se borra (por ejemplo, el de una app ya empaquetada).
  // Ahí todo es contenido de terceros: no se buscan regenerables, va entero a la papelera.
  await recorrer({ ruta: rutaProyecto, relativa: '', enPaquete: false }, async (actual) => {
    const entradas = await listar(actual.ruta)
    const archivos = entradas.filter((e) => e.isFile()).map((e) => e.name)

    // El .gitignore de esta carpeta vale para sus hijas: se lee antes de decidir sobre ellas
    // (una carpeta siempre se procesa antes que sus hijas).
    if (archivos.includes('.gitignore')) {
      const texto = await readFile(join(actual.ruta, '.gitignore'), 'utf8').catch(() => '')
      gitignores.push({ carpeta: actual.relativa, texto })
    }

    plan.papelera.archivos += archivos.length

    const hijas: { ruta: string; relativa: string; enPaquete: boolean }[] = []
    for (const e of entradas) {
      if (!e.isDirectory()) {
        // Accesos directos y enlaces: van a la papelera como un elemento más; no se siguen.
        if (!e.isFile()) plan.papelera.archivos += 1
        continue
      }
      const ruta = join(actual.ruta, e.name)
      const relativa = actual.relativa ? `${actual.relativa}/${e.name}` : e.name
      if (e.name === '.git') {
        plan.papelera.conGit = true
        continue
      }
      if (!actual.enPaquete && NOMBRES_REGENERABLES.has(e.name)) {
        const propios = await listar(ruta).then(
          (l) => l.filter((x) => x.isFile()).map((x) => x.name),
          () => [],
        )
        const regenerable = esRegenerable({
          nombre: e.name,
          archivosDelPadre: archivos,
          archivosPropios: propios,
          ignoradaPorGit: estaIgnorada(relativa, gitignores),
        })
        if (regenerable) {
          plan.regenerables.push({ relativa, bytes: null })
          continue
        }
      }
      hijas.push({ ruta, relativa, enPaquete: actual.enPaquete || e.name === 'node_modules' })
    }
    return hijas
  })
  plan.regenerables.sort((a, b) => a.relativa.localeCompare(b.relativa, 'es'))
  return plan
}

/** Suma de los archivos de la carpeta y sus subcarpetas, sin seguir enlaces. */
export async function tamanoCarpeta(carpeta: string): Promise<number> {
  let total = 0
  await recorrer(carpeta, async (actual) => {
    const entradas = await listar(actual).catch(() => [] as Entrada[])
    const hijas: string[] = []
    const archivos: string[] = []
    for (const e of entradas) {
      if (e.isDirectory()) hijas.push(join(actual, e.name))
      else archivos.push(join(actual, e.name))
    }
    for (const b of await tamanos(archivos)) total += b
    return hijas
  })
  return total
}

/** Borrado definitivo, solo para carpetas regenerables (D-006). Reintenta si Windows tiene algo tomado. */
export async function borrarDefinitivamente(carpeta: string): Promise<void> {
  await rm(carpeta, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}

/** Nombres de lo que hay en la carpeta (primer nivel). */
export async function contenido(carpeta: string): Promise<string[]> {
  return readdir(carpeta)
}

/** Quita una carpeta solo si está vacía (si no, falla y no borra nada). */
export async function quitarCarpetaVacia(carpeta: string): Promise<void> {
  await rmdir(carpeta)
}
