// Lee una imagen del portapapeles de Windows (Q-189), para cuando la ventana no la ve al pegar. Solo lee.
import { readFile, stat } from 'node:fs/promises'
import { clipboard } from 'electron'
import type { ImagenDelPortapapeles } from '../../compartido/notas'
import { LIMITE_IMAGEN_BYTES } from '../../compartido/visor'
import { archivoDeImagen, imagenDelFormato, nombreDeFormato } from '../core/portapapeles'

export async function leerImagenDelPortapapeles(): Promise<ImagenDelPortapapeles> {
  const formatos: string[] = []
  for (const item of await clipboard.read()) {
    for (const tipo of item.types) {
      formatos.push(nombreDeFormato(tipo))
      const contenido = await item.getType(tipo)
      if (!(contenido instanceof Blob)) continue
      const mime = imagenDelFormato(tipo)
      if (mime) {
        const datos = Buffer.from(await contenido.arrayBuffer())
        if (datos.length > 0) return { tipo: 'imagen', mime, base64: datos.toString('base64') }
      }
      if (tipo === 'text/uri-list') {
        const archivo = archivoDeImagen(await contenido.text())
        if (archivo && (await stat(archivo.ruta)).size <= LIMITE_IMAGEN_BYTES)
          return {
            tipo: 'imagen',
            mime: archivo.mime,
            base64: (await readFile(archivo.ruta)).toString('base64'),
          }
      }
    }
  }
  return { tipo: 'nada', formatos: [...new Set(formatos)] }
}
