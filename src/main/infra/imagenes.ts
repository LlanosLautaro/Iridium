// Achicar una foto con Electron (`nativeImage`, D-169 › 9): sin dependencias nuevas. Aparte de `fotos.ts` para que las
// pruebas de ese archivo no carguen Electron.
import { nativeImage } from 'electron'
import type { Imagenes } from './fotos'

/** La calidad de una foto pasada a JPEG: se ve bien y pesa una fracción de la PNG. */
const CALIDAD_JPEG = 85

export const imagenesElectron: Imagenes = {
  achicar(bytes, lado, formato) {
    const imagen = nativeImage.createFromBuffer(bytes)
    if (imagen.isEmpty()) return null
    const { width, height } = imagen.getSize()
    const escala = Math.min(1, lado / Math.max(width, height))
    const chica =
      escala < 1
        ? imagen.resize({
            width: Math.max(1, Math.round(width * escala)),
            height: Math.max(1, Math.round(height * escala)),
            quality: 'best',
          })
        : imagen
    return formato === 'png' ? chica.toPNG() : chica.toJPEG(CALIDAD_JPEG)
  },
}
