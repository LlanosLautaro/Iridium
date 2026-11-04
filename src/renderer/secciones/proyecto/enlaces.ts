// Lo que comparten las secciones del proyecto: los enlaces del HTML de los documentos y de la conversación (F-4) y
// el aviso de que cambió un documento del proyecto (para releer sin perder la posición).
import { type MouseEvent, useEffect } from 'react'
import { usarEstado } from '../../estado'

/** Las rutas de Windows llegan con `\` o `/` y con otra caja: se comparan iguales. */
export function mismaRuta(a: string, b: string): boolean {
  const n = (r: string) =>
    r
      .replace(/[\\/]+/g, '\\')
      .replace(/\\$/, '')
      .toLowerCase()
  return n(a) === n(b)
}

/**
 * Un clic en un enlace: un código o una cita abren Docs en su sección; un archivo del proyecto, Archivos; uno de
 * internet, el navegador. `arriba`: dónde estaba lo que se lee, para volver ahí con Atrás.
 */
export function tocarEnlace(e: MouseEvent, ruta: string, arriba?: () => number): void {
  const a = (e.target as HTMLElement).closest('a')
  if (!a) return
  e.preventDefault()
  const estado = usarEstado.getState()
  const doc = a.getAttribute('data-doc')
  const archivo = a.getAttribute('data-archivo')
  const externo = a.getAttribute('data-externo') ?? a.getAttribute('href')
  if (doc) estado.abrirDoc(ruta, { documento: doc, ancla: a.getAttribute('data-ancla') ?? '' }, arriba?.())
  else if (archivo) estado.abrirArchivo(ruta, archivo)
  else if (externo && /^https?:\/\//i.test(externo)) window.open(externo)
}

/** Llama a `alCambiar` cada vez que cambia un `.md` del proyecto. */
export function useDocsCambian(ruta: string, alCambiar: () => void): void {
  useEffect(() => window.iridium.alCambiarDocs((r) => mismaRuta(r, ruta) && alCambiar()), [ruta, alCambiar])
}

/** El nombre corto de un documento: sin `docs/`. */
export function nombreDoc(documento: string): string {
  return documento.replace(/^docs\//, '')
}
