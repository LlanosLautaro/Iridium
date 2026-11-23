// Lo que lee el tablero Frentes de un camino, sin la interfaz (D-181): para la tarjeta y sus pruebas.
import type { PasoCamino, TamanoPaso } from '../../../compartido/puente'

/** Todos los pasos de un camino, con sus ramas, en el orden en que se leen. */
export const enOrden = (pasos: PasoCamino[]): PasoCamino[] => pasos.flatMap((p) => [p, ...enOrden(p.ramas)])

/** Lo que sigue (FS-6): el primero sin hacer que la IA puede hacer; si no hay, el que te espera; si no queda nada, null. */
export function queSigue(pasos: PasoCamino[]): PasoCamino | null {
  const vienen = enOrden(pasos).filter((p) => p.marca === 'viene')
  return vienen.find((p) => p.espera === null) ?? vienen[0] ?? null
}

/**
 * Si el avance solo va a tomar algo de este camino (D-181 › 4): un paso que viene, `sola`, con un tamaño de los que
 * permite Ajustes y sin una pregunta que lo frene; como el motor (`pasosSolos`), que sin tamaño no lo toma.
 */
export const tieneParaSola = (pasos: PasoCamino[], tamanos: readonly TamanoPaso[]): boolean =>
  enOrden(pasos).some(
    (p) =>
      p.marca === 'viene' &&
      p.espera === null &&
      !!p.marcas?.sola &&
      !!p.marcas.tamano &&
      tamanos.includes(p.marcas.tamano),
  )
