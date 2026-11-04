// Copiado de la app anterior de proyectos (D-026).
// Última actividad de un proyecto: la fecha del archivo modificado más reciente (D-013),
// sin entrar en .git, en carpetas regenerables (RNF-2) ni en las que ignora el .gitignore (D-022).
import type { Dirent } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import {
  archivoCuentaParaActividad,
  cuentaParaActividad,
  estaIgnorada,
  type Gitignore,
} from '../core/regenerables'
import { recorrer } from './recorrido'

/** Devuelve la fecha (ms) o null si la carpeta no tiene archivos o no se puede leer. Lee varias carpetas a la vez. */
export async function calcularUltimaActividad(carpeta: string): Promise<number | null> {
  let maxima: number | null = null
  const gitignores: Gitignore[] = []
  await recorrer({ ruta: carpeta, relativa: '' }, async (actual) => {
    let entradas: Dirent[]
    try {
      entradas = await readdir(actual.ruta, { withFileTypes: true })
    } catch {
      return []
    }
    // Como en Eliminar: el .gitignore de una carpeta se lee antes de decidir sobre sus hijas.
    if (entradas.some((e) => e.isFile() && e.name === '.gitignore')) {
      const texto = await readFile(join(actual.ruta, '.gitignore'), 'utf8').catch(() => '')
      gitignores.push({ carpeta: actual.relativa, texto })
    }
    const hijas: { ruta: string; relativa: string }[] = []
    const archivos: string[] = []
    for (const e of entradas) {
      if (e.isDirectory()) {
        const relativa = actual.relativa ? `${actual.relativa}/${e.name}` : e.name
        if (cuentaParaActividad(e.name) && !estaIgnorada(relativa, gitignores)) {
          hijas.push({ ruta: join(actual.ruta, e.name), relativa })
        }
      } else if (e.isFile() && archivoCuentaParaActividad(e.name)) {
        archivos.push(join(actual.ruta, e.name))
      }
    }
    const fechas = await Promise.all(
      archivos.map((a) =>
        stat(a).then(
          (s) => s.mtimeMs,
          () => null,
        ),
      ),
    )
    for (const f of fechas) if (f !== null && (maxima === null || f > maxima)) maxima = f
    return hijas
  })
  return maxima === null ? null : Math.round(maxima)
}
