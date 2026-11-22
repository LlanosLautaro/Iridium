// Lo que lee el tablero Frentes de un camino, sin la interfaz (D-181): para la tarjeta y sus pruebas.
import type { PasoCamino } from '../../../compartido/puente'

/** Todos los pasos de un camino, con sus ramas, en el orden en que se leen. */
export const enOrden = (pasos: PasoCamino[]): PasoCamino[] => pasos.flatMap((p) => [p, ...enOrden(p.ramas)])

/** Lo que sigue (FS-6): el primero sin hacer que la IA puede hacer; si no hay, el que te espera; si no queda nada, null. */
export function queSigue(pasos: PasoCamino[]): PasoCamino | null {
  const vienen = enOrden(pasos).filter((p) => p.marca === 'viene')
  return vienen.find((p) => p.espera === null) ?? vienen[0] ?? null
}
