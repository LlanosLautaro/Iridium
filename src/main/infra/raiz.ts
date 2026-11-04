// Copiado de la app anterior de proyectos (D-026).
// Lectura de la carpeta raíz en disco.
import { mkdir, readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { Guia } from '../../compartido/tipos'
import { leerGuia } from '../core/guia'
import { type LecturaMetadatos, leerMetadatos, NOMBRE_ARCHIVO_METADATOS } from '../core/metadatos'
import { type CarpetaProyecto, esCarpetaDeProyecto } from '../core/proyectos'

export class RaizNoEncontrada extends Error {}

/**
 * Devuelve las carpetas hijas directas de la raíz, cada una con su `.proyecto.json` ya interpretado.
 * Si la raíz no existe o no se puede leer, lanza RaizNoEncontrada. Un proyecto ilegible no frena a los demás.
 */
export async function leerCarpetas(raiz: string): Promise<CarpetaProyecto[]> {
  let entradas: { name: string; isDirectory(): boolean }[]
  try {
    entradas = await readdir(raiz, { withFileTypes: true })
  } catch (e) {
    throw new RaizNoEncontrada(`No se pudo leer la carpeta raíz: ${raiz}`, { cause: e })
  }
  const carpetas = entradas.filter((e) => e.isDirectory() && esCarpetaDeProyecto(e.name))
  return Promise.all(
    carpetas.map(async (e) => {
      const ruta = join(raiz, e.name)
      const [metadatos, guia] = await Promise.all([leerArchivoMetadatos(ruta), leerArchivoGuia(ruta)])
      return { nombre: e.name, ruta, metadatos, guia, ultimaActividad: null }
    }),
  )
}

/** null = el proyecto no tiene archivo de metadatos (Sin clasificar). */
export async function leerArchivoMetadatos(rutaProyecto: string): Promise<LecturaMetadatos | null> {
  let texto: string
  try {
    texto = await readFile(join(rutaProyecto, NOMBRE_ARCHIVO_METADATOS), 'utf8')
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null
    return { tipo: 'danado', motivo: 'no se pudo leer el archivo' }
  }
  return leerMetadatos(texto)
}

/** `docs/estado.md` de la guía de hitos; null si no existe o no se reconoce nada. Nunca se escribe. */
export async function leerArchivoGuia(rutaProyecto: string): Promise<Guia | null> {
  try {
    return leerGuia(await readFile(join(rutaProyecto, 'docs', 'estado.md'), 'utf8'))
  } catch {
    return null
  }
}

export async function existeCarpeta(ruta: string): Promise<boolean> {
  try {
    return (await stat(ruta)).isDirectory()
  } catch {
    return false
  }
}

export async function existeArchivo(ruta: string): Promise<boolean> {
  try {
    return (await stat(ruta)).isFile()
  } catch {
    return false
  }
}

/** Nombres de todo lo que hay en la raíz (carpetas y archivos). Lanza si no se puede leer. */
export async function leerNombres(raiz: string): Promise<string[]> {
  return readdir(raiz)
}

/** Crea una carpeta vacía (D-020). Falla con EEXIST si ya hay algo con ese nombre: nunca pisa nada. */
export async function crearCarpeta(ruta: string): Promise<void> {
  await mkdir(ruta)
}
