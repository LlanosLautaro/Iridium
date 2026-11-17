// El último cambio de un proyecto, que ordena la grilla (D-136, R-80): el último commit o lo último escrito en su
// `docs/` (lo que la IA toca en cada sesión, aunque no haya commiteado), lo más reciente de los dos. Solo lee.
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fechaUltimoCommit } from './git'

/** La fecha (ms) del archivo más reciente de `docs/` (con sus subcarpetas); null si no hay. */
async function ultimoEnDocs(proyecto: string): Promise<number | null> {
  const docs = join(proyecto, 'docs')
  let archivos: string[]
  try {
    archivos = (await readdir(docs, { recursive: true, withFileTypes: true }))
      .filter((e) => e.isFile())
      .map((e) => join(e.parentPath, e.name))
  } catch {
    return null
  }
  const fechas = await Promise.all(
    archivos.map((a) =>
      stat(a).then(
        (s) => s.mtimeMs,
        () => 0,
      ),
    ),
  )
  const maxima = Math.max(0, ...fechas)
  return maxima > 0 ? Math.round(maxima) : null
}

export async function leerUltimoCambio(proyecto: string): Promise<number | null> {
  const [commit, docs] = await Promise.all([fechaUltimoCommit(proyecto), ultimoEnDocs(proyecto)])
  if (commit === null) return docs
  if (docs === null) return commit
  return Math.max(commit, docs)
}
