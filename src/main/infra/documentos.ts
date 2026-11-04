// Copiado de la app anterior de proyectos (D-026).
// Disco del visor: listar y leer los `.md` de la carpeta abierta (`docs/**` y la raíz), y leer y escribir las
// respuestas en `docs/respuestas/` (la única escritura del visor, D-021, D-030).
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CARPETAS_SIN_ACTIVIDAD } from '../core/regenerables'
import { CARPETA_RESPUESTAS } from '../core/visor/respuestas'
import { escribirAtomico } from './escritura'

export interface ArchivoListado {
  /** Relativa a la carpeta, con `/`. */
  ruta: string
  /** Fecha de modificación (ms). */
  modificado: number
  bytes: number
}

const esMd = (nombre: string) => /\.md$/i.test(nombre)

/** Los `.md` de la raíz y de `docs/` con sus subcarpetas (sin carpetas regenerables ni ocultas). */
export async function listarDocumentos(carpeta: string): Promise<ArchivoListado[]> {
  const encontrados: ArchivoListado[] = []
  const anotar = async (relativa: string) => {
    try {
      const s = await stat(join(carpeta, relativa))
      if (s.isFile()) encontrados.push({ ruta: relativa, modificado: s.mtimeMs, bytes: s.size })
    } catch {
      // Se borró mientras se listaba: no está.
    }
  }
  const entradas = await readdir(carpeta, { withFileTypes: true })
  await Promise.all(entradas.filter((e) => e.isFile() && esMd(e.name)).map((e) => anotar(e.name)))
  const recorrer = async (relativa: string): Promise<void> => {
    let hijos: import('node:fs').Dirent[]
    try {
      hijos = await readdir(join(carpeta, relativa), { withFileTypes: true })
    } catch {
      return
    }
    await Promise.all(
      hijos.map((h) => {
        const r = `${relativa}/${h.name}`
        if (h.isDirectory()) {
          if (h.name.startsWith('.') || CARPETAS_SIN_ACTIVIDAD.has(h.name)) return Promise.resolve()
          return recorrer(r)
        }
        return h.isFile() && esMd(h.name) ? anotar(r) : Promise.resolve()
      }),
    )
  }
  if (entradas.some((e) => e.isDirectory() && e.name === 'docs')) await recorrer('docs')
  return encontrados
}

/** ¿Tiene la carpeta una subcarpeta `docs/`? */
export async function tieneDocs(carpeta: string): Promise<boolean> {
  try {
    return (await stat(join(carpeta, 'docs'))).isDirectory()
  } catch {
    return false
  }
}

export async function leerDocumento(carpeta: string, ruta: string): Promise<string> {
  return readFile(join(carpeta, ...ruta.split('/')), 'utf8')
}

/** Texto y fecha de un archivo de la carpeta; null si no existe. */
export async function leerSiExiste(
  carpeta: string,
  ruta: string,
): Promise<{ texto: string; modificado: number } | null> {
  const absoluta = join(carpeta, ...ruta.split('/'))
  try {
    const [texto, s] = await Promise.all([readFile(absoluta, 'utf8'), stat(absoluta)])
    return { texto, modificado: s.mtimeMs }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw e
  }
}

/** Escribe `docs/respuestas/<codigo>.md` de forma atómica. Devuelve la fecha de modificación. */
export async function escribirRespuesta(carpeta: string, codigo: string, texto: string): Promise<number> {
  const dir = join(carpeta, ...CARPETA_RESPUESTAS.split('/'))
  await mkdir(dir, { recursive: true })
  const destino = join(dir, `${codigo}.md`)
  await escribirAtomico(destino, texto)
  return (await stat(destino)).mtimeMs
}

/** Carpeta de las imágenes de una respuesta (`docs/respuestas/Q-n/`). */
export function carpetaImagenes(carpeta: string, codigo: string): string {
  return join(carpeta, ...CARPETA_RESPUESTAS.split('/'), codigo)
}

export async function listarImagenes(carpeta: string, codigo: string): Promise<string[]> {
  try {
    return await readdir(carpetaImagenes(carpeta, codigo))
  } catch {
    return []
  }
}

/** Escribe una imagen nueva sin pisar nada: si el nombre ya existe, falla con EEXIST. */
export async function escribirImagenNueva(
  carpeta: string,
  codigo: string,
  nombre: string,
  datos: Uint8Array,
): Promise<string> {
  const dir = carpetaImagenes(carpeta, codigo)
  await mkdir(dir, { recursive: true })
  const destino = join(dir, nombre)
  await writeFile(destino, datos, { flag: 'wx' })
  return destino
}

/** ¿Qué hay en esta ruta de la carpeta (para los scripts, D-039)? */
export async function tipoDeRuta(carpeta: string, ruta: string): Promise<'archivo' | 'carpeta' | null> {
  try {
    const s = await stat(join(carpeta, ...ruta.split('/')))
    return s.isFile() ? 'archivo' : s.isDirectory() ? 'carpeta' : null
  } catch {
    return null
  }
}
