// Pegar una imagen que la ventana no ve (Q-189): qué toma Iridium del portapapeles de Windows.
import { describe, expect, it } from 'vitest'
import { archivoDeImagen, imagenDelFormato, nombreDeFormato } from '../src/main/core/portapapeles'

describe('el portapapeles de Windows', () => {
  it('una imagen por su tipo o por el nombre de su formato', () => {
    expect(imagenDelFormato('image/png')).toBe('image/png')
    expect(imagenDelFormato('electron application/osclipboard;format="PNG"')).toBe('image/png')
    expect(imagenDelFormato('electron application/osclipboard;format="JFIF"')).toBe('image/jpeg')
    expect(imagenDelFormato('image/bmp')).toBeNull()
    expect(imagenDelFormato('text/html')).toBeNull()
    expect(imagenDelFormato('electron application/osclipboard;format="DataObject"')).toBeNull()
  })

  it('el nombre de un formato, sin el prefijo de Electron', () => {
    expect(nombreDeFormato('electron application/osclipboard;format="Ole Private Data"')).toBe(
      'Ole Private Data',
    )
    expect(nombreDeFormato('text/html')).toBe('text/html')
  })

  it('un archivo de imagen copiado en el Explorador', () => {
    expect(archivoDeImagen('file:///C:/Capturas/Una%20captura.PNG')).toEqual({
      ruta: 'C:\\Capturas\\Una captura.PNG',
      mime: 'image/png',
    })
    expect(archivoDeImagen('# comentario\r\nfile:///C:/a.txt\r\nfile:///C:/b.jpeg')).toEqual({
      ruta: 'C:\\b.jpeg',
      mime: 'image/jpeg',
    })
    expect(archivoDeImagen('https://ejemplo.com/a.png')).toBeNull()
    expect(archivoDeImagen('file:///C:/a.bmp')).toBeNull()
  })
})
