// Copiado de la app anterior de proyectos (D-026).
// Escritura del `.proyecto.json` (RNF-4) y de las respuestas del visor en `docs/respuestas/` (D-030).
// Atómica (RNF-3): se escribe un temporal en la misma carpeta y se renombra encima; nunca queda un archivo a medias.
import { randomBytes } from 'node:crypto'
import { copyFile, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NOMBRE_ARCHIVO_METADATOS } from '../core/metadatos'

/** Texto actual del archivo de metadatos; null si no existe. */
export async function leerTextoMetadatos(rutaProyecto: string): Promise<string | null> {
  try {
    return await readFile(join(rutaProyecto, NOMBRE_ARCHIVO_METADATOS), 'utf8')
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw e
  }
}

const REINTENTOS = 5
const ESPERA_MS = 60

/** Escribe el archivo de metadatos de forma atómica. */
export async function escribirMetadatos(rutaProyecto: string, texto: string): Promise<void> {
  await escribirAtomico(join(rutaProyecto, NOMBRE_ARCHIVO_METADATOS), texto)
}

/** Escribe un archivo (texto o binario, como una captura) de forma atómica. Reintenta si Windows lo tiene tomado un instante (antivirus, indexador). */
export async function escribirAtomico(destino: string, texto: string | Uint8Array): Promise<void> {
  const temporal = `${destino}.${randomBytes(4).toString('hex')}.tmp`
  await writeFile(temporal, texto, { encoding: 'utf8', flag: 'wx' })
  try {
    for (let intento = 1; ; intento++) {
      try {
        await rename(temporal, destino)
        return
      } catch (e) {
        const codigo = (e as NodeJS.ErrnoException).code
        if (intento >= REINTENTOS || (codigo !== 'EPERM' && codigo !== 'EBUSY' && codigo !== 'EACCES'))
          throw e
        await new Promise((r) => setTimeout(r, ESPERA_MS * intento))
      }
    }
  } catch (e) {
    await rm(temporal, { force: true })
    throw e
  }
}

/**
 * Lee un archivo de datos de Iridium (hito 8): null si no existe. Si existe pero `interpretar` falla, guarda una copia
 * en `<archivo>.roto` antes de devolver null, para que el próximo guardado no pierda lo que tenía.
 */
export async function leerDatos<T>(archivo: string, interpretar: (texto: string) => T): Promise<T | null> {
  let texto: string
  try {
    texto = await readFile(archivo, 'utf8')
  } catch {
    return null
  }
  try {
    return interpretar(texto)
  } catch {
    await copyFile(archivo, `${archivo}.roto`).catch(() => {})
    return null
  }
}
