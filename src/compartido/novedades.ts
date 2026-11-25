// Lo nuevo de una versión (Q-290, D-192): la primera vez que se abre una versión, un aviso dice qué trae desde la que se
// usaba antes en esa PC. Lo que trae son sus commits: la versión lleva los últimos (`__ARMADO__.cambios`), así la copia
// instalada de la otra PC, sin el repositorio, también lo sabe.

/** Un commit de la versión armada. `fecha` en ms. */
export interface CambioArmado {
  commit: string
  fecha: number
  mensaje: string
}

/** El último commit que se vio en esta PC (`novedades.json`). */
export interface Visto {
  commit: string
  fecha: number
}

export interface Novedades {
  version: string
  /** Del más nuevo al más viejo. */
  cambios: CambioArmado[]
  /** Hay más viejos que la versión no trae en su lista. */
  mas: boolean
}

/** Dos códigos cortos del mismo commit pueden tener distinto largo. */
const mismo = (a: string, b: string) => a.length > 0 && b.length > 0 && (a.startsWith(b) || b.startsWith(a))

/**
 * Lo que trae la versión desde `visto`: sus commits más nuevos que él. Sin `visto` (la primera vez en esta PC), nada:
 * no hay con qué comparar. Si `visto` no está en la lista (pasaron más commits de los que trae), los más nuevos que su
 * fecha; una versión más vieja (`pnpm volver`) no trae nada nuevo.
 */
export function novedadesDesde(o: {
  version: string
  cambios: CambioArmado[]
  visto: Visto | null
}): Novedades | null {
  if (!o.visto) return null
  const visto = o.visto
  const i = o.cambios.findIndex((c) => mismo(c.commit, visto.commit))
  const cambios = i >= 0 ? o.cambios.slice(0, i) : o.cambios.filter((c) => c.fecha > visto.fecha)
  if (cambios.length === 0) return null
  // Si no estaba en la lista y entraron todos, puede haber más viejos.
  return { version: o.version, cambios, mas: i < 0 && cambios.length === o.cambios.length }
}
