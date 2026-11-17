// Las imágenes de las notas de las ideas (D-130; nacieron con el bloc de notas de Ideas, D-112, que ID-I4 sacó): se
// guardan al pegarlas y se leen como `data:` (la ventana no lee el disco).
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { diaDe, type ImagenPegada, leerNotas } from '../../compartido/notas'
import { LIMITE_IMAGEN_BYTES, TIPOS_IMAGEN } from '../../compartido/visor'
import { motivo } from './visor'

const MIME_DE: Record<string, string> = Object.fromEntries(
  Object.entries(TIPOS_IMAGEN).map(([mime, ext]) => [ext, mime]),
)

/** Una imagen en una subcarpeta: `<sub>/<archivo>` con una extensión de imagen, sin salir de ella. */
export function esImagenEn(sub: string, ruta: string): boolean {
  if (!ruta.startsWith(`${sub}/`)) return false
  const resto = ruta.slice(sub.length + 1)
  return (
    new RegExp(`^[^/\\\\:]+\\.(${Object.keys(MIME_DE).join('|')})$`, 'i').test(resto) && !resto.includes('..')
  )
}

/**
 * Las imágenes de un texto con el formato del bloc, como `data:` (la ventana no lee el disco), relativas a `carpeta`.
 * Solo las que acepta `valida`; la que no está, pesa demasiado o no se lee, falta (se muestra como faltante).
 */
export async function imagenesDe(
  carpeta: string,
  texto: string,
  valida: (ruta: string) => boolean,
): Promise<Record<string, string>> {
  const imagenes: Record<string, string> = {}
  for (const b of leerNotas(texto)) {
    if (b.tipo !== 'imagen' || !valida(b.ruta) || imagenes[b.ruta]) continue
    try {
      const ruta = join(carpeta, ...b.ruta.split('/'))
      if ((await stat(ruta)).size > LIMITE_IMAGEN_BYTES) continue
      const mime = MIME_DE[b.ruta.split('.').pop()?.toLowerCase() ?? '']
      imagenes[b.ruta] = `data:${mime};base64,${(await readFile(ruta)).toString('base64')}`
    } catch {
      // La que no está o no se lee se muestra como faltante.
    }
  }
  return imagenes
}

/**
 * Guarda una imagen pegada en `<carpeta>/<sub>/AAAA-MM-DD-n.<ext>`, sin pisar ninguna, y devuelve su ruta relativa a
 * `carpeta` (`<sub>/archivo`, como va en el texto). La subcarpeta se crea si falta.
 */
export async function guardarImagenPegada(
  carpeta: string,
  sub: string,
  mime: string,
  base64: string,
  hoy = new Date(),
): Promise<ImagenPegada> {
  const extension = TIPOS_IMAGEN[mime]
  if (!extension) return { tipo: 'error', mensaje: 'por ahora solo se pueden pegar imágenes' }
  const datos = Buffer.from(base64, 'base64')
  if (datos.length === 0) return { tipo: 'error', mensaje: 'la imagen está vacía' }
  if (datos.length > LIMITE_IMAGEN_BYTES) return { tipo: 'error', mensaje: 'la imagen pesa más de 20 MB' }
  try {
    const dir = join(carpeta, ...sub.split('/'))
    await mkdir(dir, { recursive: true })
    const usados = new Set((await readdir(dir)).map((n) => n.toLowerCase()))
    const dia = diaDe(hoy)
    for (let n = 1; n < 1000; n++) {
      const nombre = `${dia}-${n}.${extension}`
      if (usados.has(nombre)) continue
      try {
        await writeFile(join(dir, nombre), datos, { flag: 'wx' })
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'EEXIST') continue
        throw e
      }
      return { tipo: 'ok', ruta: `${sub}/${nombre}`, url: `data:${mime};base64,${base64}` }
    }
    return { tipo: 'error', mensaje: 'no se encontró un nombre libre para la imagen' }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}
