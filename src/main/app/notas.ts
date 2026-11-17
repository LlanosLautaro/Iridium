// El bloc de notas de Ideas (D-112, D-126): `notas.md` y sus imágenes en `notas/`, dentro de la carpeta Ideas. La
// ventana manda el texto entero cada vez que se guarda; las imágenes llegan como `data:` (la ventana no lee el disco).
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  ARCHIVO_NOTAS,
  CARPETA_IMAGENES_NOTAS,
  diaDe,
  type HojaNotas,
  type ImagenPegada,
  leerNotas,
  type ResultadoNotas,
} from '../../compartido/notas'
import { LIMITE_IMAGEN_BYTES, TIPOS_IMAGEN } from '../../compartido/visor'
import { escribirAtomico } from '../infra/escritura'
import { LIMITE_DOCUMENTO_BYTES, motivo } from './visor'

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

/** Una imagen de la hoja: solo `notas/<archivo>` con una extensión de imagen, sin salir de la carpeta. */
export function esImagenDeNotas(ruta: string): boolean {
  return esImagenEn(CARPETA_IMAGENES_NOTAS, ruta)
}

async function existe(carpeta: string): Promise<boolean> {
  try {
    return (await stat(carpeta)).isDirectory()
  } catch {
    return false
  }
}

export async function leerHoja(carpeta: string): Promise<HojaNotas> {
  if (!(await existe(carpeta))) return { tipo: 'sin-carpeta' }
  const archivo = join(carpeta, ARCHIVO_NOTAS)
  let texto = ''
  try {
    const s = await stat(archivo)
    if (s.size > LIMITE_DOCUMENTO_BYTES) return { tipo: 'grande', bytes: s.size }
    texto = await readFile(archivo, 'utf8')
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') return { tipo: 'error', mensaje: motivo(e) }
  }
  return { tipo: 'ok', texto, imagenes: await imagenesDe(carpeta, texto, esImagenDeNotas) }
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

export async function guardarHoja(carpeta: string, texto: string): Promise<ResultadoNotas> {
  if (!(await existe(carpeta))) return { tipo: 'error', mensaje: 'no está la carpeta Ideas' }
  try {
    await escribirAtomico(join(carpeta, ARCHIVO_NOTAS), texto)
    return { tipo: 'ok' }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** Guarda una imagen pegada como `notas/AAAA-MM-DD-n.<ext>`, sin pisar ninguna. */
export async function pegarImagenEnHoja(
  carpeta: string,
  mime: string,
  base64: string,
  hoy = new Date(),
): Promise<ImagenPegada> {
  if (!(await existe(carpeta))) return { tipo: 'error', mensaje: 'no está la carpeta Ideas' }
  return guardarImagenPegada(carpeta, CARPETA_IMAGENES_NOTAS, mime, base64, hoy)
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
