// Lee `ideas.md` de la carpeta Ideas (modulos/inicio/diseno-tecnico.md › Estructura interna), con el tope de Docs:
// uno de más de 2 MB no se lee (hito 8, Defecto 8).
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

export const ARCHIVO_IDEAS = 'ideas.md'

export type LecturaIdeas =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'sin-archivo' }
  | { tipo: 'grande'; bytes: number }

/** `limite`: el tope de Docs, en bytes. */
export async function leerArchivoIdeas(carpeta: string, limite: number): Promise<LecturaIdeas> {
  const ruta = join(carpeta, ARCHIVO_IDEAS)
  let bytes: number
  try {
    const s = await stat(ruta)
    if (!s.isFile()) return { tipo: 'sin-archivo' }
    bytes = s.size
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { tipo: 'sin-archivo' }
    throw e
  }
  if (bytes > limite) return { tipo: 'grande', bytes }
  return { tipo: 'texto', texto: await readFile(ruta, 'utf8') }
}
