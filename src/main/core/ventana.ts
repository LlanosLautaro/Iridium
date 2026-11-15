// La ventana como quedó (T-66): al cerrar se guardan su lugar, su tamaño y si estaba maximizada; al abrir vuelve así.
// Si el lugar guardado ya no se ve (se sacó un monitor, cambió la resolución), abre con el tamaño de siempre.

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface VentanaGuardada extends Rect {
  maximizada: boolean
}

/** Cuánto de la barra de arriba tiene que quedar en una pantalla para poder agarrarla. */
const VISIBLE = { ancho: 120, alto: 36 }

/** Si la barra de arriba de `r` cae lo bastante dentro de alguna pantalla (su zona sin la barra de tareas). */
export function seVe(r: Rect, pantallas: Rect[]): boolean {
  return pantallas.some((p) => {
    const ancho = Math.min(r.x + r.width, p.x + p.width) - Math.max(r.x, p.x)
    const alto = Math.min(r.y + VISIBLE.alto, p.y + p.height) - Math.max(r.y, p.y)
    return ancho >= VISIBLE.ancho && alto >= VISIBLE.alto
  })
}

/**
 * Cómo abrir: el lugar y el tamaño guardados si se ven (achicados al mínimo de la ventana, nunca menos), y si va
 * maximizada. Sin nada guardado, o fuera de las pantallas, el tamaño de siempre centrado por Windows (maximizada si lo
 * estaba: se maximiza en la pantalla principal).
 */
export function comoAbrir(
  guardada: VentanaGuardada | null,
  pantallas: Rect[],
  minimo: { width: number; height: number },
): { rect: Rect | null; maximizada: boolean } {
  if (!guardada) return { rect: null, maximizada: false }
  const rect = {
    x: Math.round(guardada.x),
    y: Math.round(guardada.y),
    width: Math.max(minimo.width, Math.round(guardada.width)),
    height: Math.max(minimo.height, Math.round(guardada.height)),
  }
  return { rect: seVe(rect, pantallas) ? rect : null, maximizada: guardada.maximizada }
}
