// La línea de en qué anda un proyecto en su tarjeta (04-ux.md › W-2). Sin React, para probarla sola.
import type { TarjetaProyecto } from './puente'

/**
 * La línea de en qué anda (W-2): el frente en curso y su paso («Orden · 4. UX») o, sin frentes, el Próximo paso
 * («Próximo: probar la I-3»). null si no hay ninguno de los dos.
 */
export function textoFrente(h: TarjetaProyecto['hito']): string | null {
  if (!h) return null
  if (h.frente) return h.frente.paso ? `${h.frente.nombre} · ${h.frente.paso}` : h.frente.nombre
  return h.proximoPaso ? `Próximo: ${h.proximoPaso}` : null
}
