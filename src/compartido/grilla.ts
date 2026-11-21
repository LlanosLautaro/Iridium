// El orden de la grilla de Proyectos (H-1, D-136): lo usan el proceso principal al leer la carpeta y la ventana al
// cambiar una tarjeta sin esperar al disco (Q-241). Reglas puras.
import type { TarjetaProyecto } from './puente'

const porNombre = new Intl.Collator('es', { sensitivity: 'base', numeric: true })

/** Grupo de orden: todos juntos, sin agrupar por estado (D-136); después los archivados y al final las fichas dañadas. */
function grupo(t: TarjetaProyecto): number {
  if (t.problema !== null) return 2
  if (t.archivado) return 1
  return 0
}

/** Dentro de cada grupo, el último cambio primero (D-136, R-80); sin ninguno, al final; a la par, por nombre. */
export function ordenarTarjetas(tarjetas: readonly TarjetaProyecto[]): TarjetaProyecto[] {
  return [...tarjetas].sort(
    (a, b) =>
      grupo(a) - grupo(b) ||
      (b.ultimoCambio ?? -1) - (a.ultimoCambio ?? -1) ||
      porNombre.compare(a.nombre, b.nombre),
  )
}
