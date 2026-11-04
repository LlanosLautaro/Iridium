// Los cuadros de texto que crecen con lo que se escribe: las notas de Pendientes y el de la conversación.
import { type RefObject, useCallback, useEffect, useLayoutEffect } from 'react'

/**
 * Ajusta el alto de un campo a su texto: cuando cambia el texto y cuando cambia su ancho (al arrastrar el borde de la
 * conversación o cambiar el tamaño de la ventana, el texto se reacomoda y el alto tiene que acompañarlo). Oculto no
 * se mide: conserva el alto que tenía.
 */
export function useAltoDelTexto(ref: RefObject<HTMLTextAreaElement | null>, valor: string, extra = 2): void {
  const medir = useCallback(() => {
    const el = ref.current
    if (!el || el.offsetParent === null) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + extra}px`
  }, [ref, extra])
  // biome-ignore lint/correctness/useExhaustiveDependencies: se mide de nuevo cada vez que cambia el texto
  useLayoutEffect(medir, [valor, medir])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let ancho = el.clientWidth
    const obs = new ResizeObserver(() => {
      if (el.clientWidth === ancho) return
      ancho = el.clientWidth
      medir()
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, medir])
}
