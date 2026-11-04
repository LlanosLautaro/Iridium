// La extensión en una carpeta fija (diseno-tecnico.md › Estructura interna): Iridium la copia a
// `%APPDATA%\Centro de Desarrollo\extension\` cuando cambia. Es la carpeta que el usuario carga una vez en Chrome y Edge,
// y la que usa el ayudante de Electron; así no depende de dónde esté el repo ni de si se rearma.
import { cp, mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

const MARCA = 'compilacion.txt'

async function leer(ruta: string): Promise<string | null> {
  try {
    return await readFile(ruta, 'utf8')
  } catch {
    return null
  }
}

/**
 * Carga lo que usa la carpeta de la extensión (el ayudante de Electron) recién cuando terminó de copiarse, salió bien o
 * no. Si se cargara mientras se copia, encontraría la carpeta a medias: la primera vez que se abría una versión con la
 * extensión cambiada, F8 no andaba hasta volver a abrir Iridium.
 */
export async function despuesDeCopiar(
  copia: Promise<unknown>,
  cargar: () => Promise<unknown>,
): Promise<void> {
  await copia.catch(() => {})
  await cargar().catch(() => {})
}

/** Copia la extensión armada a su carpeta fija si la compilación cambió. Devuelve si copió. */
export async function instalarExtension(origen: string, destino: string): Promise<boolean> {
  const nueva = await leer(join(origen, MARCA))
  if (nueva === null) return false
  if ((await leer(join(destino, MARCA))) === nueva) return false
  await mkdir(destino, { recursive: true })
  // Se reemplaza el contenido, no la carpeta: Chrome y Edge la tienen registrada por su ruta.
  await rm(join(destino, 'js'), { recursive: true, force: true })
  await cp(origen, destino, { recursive: true, force: true })
  return true
}
