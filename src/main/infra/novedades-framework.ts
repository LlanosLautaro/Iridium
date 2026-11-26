// Las novedades del framework (T-64, D-118) desde el disco: `novedades.md` de la skill `iridium` que trae Iridium (en la
// app armada, en sus recursos). Se relee solo si cambió.
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { NovedadFramework } from '../../compartido/skills'
import { ARCHIVO_NOVEDADES, leerNovedades } from '../core/novedades-framework'

let carpeta: string | null = null
let guardadas: { cambio: number; novedades: NovedadFramework[] } | null = null

/** La carpeta de la skill `iridium` (la que tiene `SKILL.md`); la fija el arranque. */
export function fijarCarpetaFramework(c: string | null): void {
  carpeta = c
  guardadas = null
}

/** Las novedades del framework; vacío si no se fijó la carpeta o no hay `novedades.md`. */
export async function novedadesDelFramework(): Promise<NovedadFramework[]> {
  if (carpeta === null) return []
  const ruta = join(carpeta, ARCHIVO_NOVEDADES)
  try {
    const cambio = (await stat(ruta)).mtimeMs
    if (guardadas?.cambio === cambio) return guardadas.novedades
    const { novedades } = leerNovedades(await readFile(ruta, 'utf8'))
    guardadas = { cambio, novedades }
    return novedades
  } catch {
    return []
  }
}
