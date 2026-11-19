// Abrir una dirección en el navegador: los enlaces de la ventana y las páginas de Scripts y de Ejecutar (D-156).
// Solo http y https. Con IRIDIUM_NAVEGADOR=falso (las pruebas) no se abre: se anota en `enlacesAfuera`, para que la
// prueba lo vea.
import { shell } from 'electron'

export async function abrirEnNavegador(url: string): Promise<void> {
  if (!/^https?:\/\//.test(url)) return
  if (process.env.IRIDIUM_NAVEGADOR === 'falso') {
    const g = globalThis as { enlacesAfuera?: string[] }
    g.enlacesAfuera = [...(g.enlacesAfuera ?? []), url]
  } else await shell.openExternal(url)
}
