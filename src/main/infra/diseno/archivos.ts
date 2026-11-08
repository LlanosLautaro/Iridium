// Leer `docs/diseno/` de un proyecto (frente Diseño, D-105): los archivos de texto y la lista de todos, relativos a
// esa carpeta. Lo usan el control y la sección.
import type { Dirent } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { ArchivosDiseno } from '../../core/control/tipos'

const DE_TEXTO = /\.(html?|css|js|md)$/i
/** Cuántos archivos se leen como mucho: una carpeta enorme no frena el control. */
const MAXIMO = 2000

export function carpetaDiseno(proyecto: string): string {
  return join(proyecto, 'docs', 'diseno')
}

/** Todos los archivos de `docs/diseno/`, relativos a esa carpeta con `/`. */
export async function listarDiseno(proyecto: string): Promise<string[] | null> {
  const base = carpetaDiseno(proyecto)
  try {
    if (!(await stat(base)).isDirectory()) return null
  } catch {
    return null
  }
  const r: string[] = []
  const recorrer = async (rel: string) => {
    let entradas: Dirent[]
    try {
      entradas = await readdir(join(base, rel), { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entradas) {
      if (r.length >= MAXIMO) return
      const hijo = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) await recorrer(hijo)
      else if (e.isFile()) r.push(hijo)
    }
  }
  await recorrer('')
  return r
}

/** Lo que lee el control de `docs/diseno/`, o null si el proyecto no la tiene. */
export async function leerArchivosDiseno(proyecto: string): Promise<ArchivosDiseno | null> {
  const lista = await listarDiseno(proyecto)
  if (!lista) return null
  const base = carpetaDiseno(proyecto)
  const textos = []
  for (const ruta of lista.filter((f) => DE_TEXTO.test(f)))
    try {
      textos.push({ ruta, texto: await readFile(join(base, ruta), 'utf8') })
    } catch {
      // Se borró mientras se leía.
    }
  return { textos, existentes: new Set(lista) }
}
