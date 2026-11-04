// Los complementos que Iridium carga en sus conversaciones (D-086): la skill de Iridium siempre, y la guía de hitos
// solo si la PC no la tiene instalada (si la tiene, se usa esa, y no aparece dos veces).
import { join } from 'node:path'

/**
 * @param base la carpeta `plugins` (en la app armada, la de sus recursos).
 * @param carpetaClaude `%USERPROFILE%\.claude`, donde están las skills instaladas.
 * @param existe si un archivo está.
 */
export function elegirComplementos(
  base: string,
  carpetaClaude: string,
  existe: (ruta: string) => boolean,
): string[] {
  const elegidos: string[] = []
  const iridium = join(base, 'iridium')
  if (existe(join(iridium, '.claude-plugin', 'plugin.json'))) elegidos.push(iridium)
  const guia = join(base, 'guia')
  const instalada = existe(join(carpetaClaude, 'skills', 'hitos-desarrollo-app', 'SKILL.md'))
  if (!instalada && existe(join(guia, '.claude-plugin', 'plugin.json'))) elegidos.push(guia)
  return elegidos
}
