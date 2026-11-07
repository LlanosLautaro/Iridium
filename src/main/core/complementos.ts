// Los complementos que Iridium carga en sus conversaciones (D-086): el framework (la skill de Iridium, D-092). La guía
// de hitos ya no se carga: el framework la reemplaza (frente Orden, OR-1).
import { join } from 'node:path'

/**
 * @param base la carpeta `plugins` (en la app armada, la de sus recursos).
 * @param existe si un archivo está.
 */
export function elegirComplementos(base: string, existe: (ruta: string) => boolean): string[] {
  const iridium = join(base, 'iridium')
  return existe(join(iridium, '.claude-plugin', 'plugin.json')) ? [iridium] : []
}
