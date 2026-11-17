// Pegar una imagen cuando la ventana no la ve (Q-189): Iridium la busca en el portapapeles de Windows. Estas reglas
// eligen qué tomar de lo que trae: una imagen (por su tipo o por el nombre de su formato en Windows) o un archivo de
// imagen copiado en el Explorador. Sin nada de eso, los nombres de lo que trae, para decirlo.
import { fileURLToPath } from 'node:url'
import { TIPOS_IMAGEN } from '../../compartido/visor'

const CRUDO = /^electron application\/osclipboard;format="(.*)"$/

/** Los formatos de Windows que ya son una imagen guardable, con su tipo. */
const FORMATOS_IMAGEN: Record<string, string> = {
  PNG: 'image/png',
  'image/png': 'image/png',
  JFIF: 'image/jpeg',
  'image/jpeg': 'image/jpeg',
  GIF: 'image/gif',
  'image/gif': 'image/gif',
  'image/webp': 'image/webp',
}

/** El nombre de un formato, sin el prefijo con que Electron muestra los de Windows. */
export const nombreDeFormato = (tipo: string) => CRUDO.exec(tipo)?.[1] ?? tipo

/** El tipo de imagen de un formato del portapapeles (`image/png`), o null si no es una imagen que se pueda guardar. */
export function imagenDelFormato(tipo: string): string | null {
  if (TIPOS_IMAGEN[tipo]) return tipo
  const crudo = CRUDO.exec(tipo)?.[1]
  return crudo ? (FORMATOS_IMAGEN[crudo] ?? null) : null
}

/** El primer archivo de imagen de una lista de direcciones (`text/uri-list`), como ruta del disco. */
export function archivoDeImagen(lista: string): { ruta: string; mime: string } | null {
  for (const linea of lista.split(/\r?\n/)) {
    const l = linea.trim()
    if (!l || l.startsWith('#') || !/^file:\/\//i.test(l)) continue
    const extension = /\.([a-z0-9]+)$/i.exec(l)?.[1]?.toLowerCase()
    const mime = Object.entries(TIPOS_IMAGEN).find(
      ([, e]) => e === extension || (e === 'jpg' && extension === 'jpeg'),
    )?.[0]
    if (!mime) continue
    try {
      return { ruta: fileURLToPath(l), mime }
    } catch {}
  }
  return null
}
