// Qué cambios de la carpeta de proyectos le importan a la grilla (H-1: se actualiza sola). Reglas puras.
import { CARPETA_SKILLS } from '../../compartido/puente'
import { NOMBRE_ARCHIVO_METADATOS } from './metadatos'
import { esCarpetaDeProyecto } from './proyectos'

/**
 * Dada una ruta relativa a la raíz (como la informa la vigilancia del disco), devuelve el proyecto afectado o
 * null si el cambio no cambia ninguna tarjeta. Cuentan: la carpeta del proyecto, su ficha y su ícono, su
 * `docs/estado.md`, los de sus módulos, sus respuestas y los comentarios de la Revisión (el contador de abiertos).
 */
export function proyectoAfectado(relativa: string): string | null {
  const partes = relativa.split(/[\\/]+/).filter((p) => p !== '')
  const [proyecto, ...resto] = partes
  if (!proyecto || !esCarpetaDeProyecto(proyecto)) return null
  if (resto.length === 0) return proyecto
  const [primera, segunda, tercera, cuarta] = resto
  if (resto.length === 1 && primera !== undefined) {
    return primera === NOMBRE_ARCHIVO_METADATOS || /\.(svg|png|jpe?g|webp|ico)$/i.test(primera)
      ? proyecto
      : null
  }
  if (primera !== 'docs') return null
  if (resto.length === 2 && (segunda === 'estado.md' || segunda === 'respuestas')) return proyecto
  if (segunda === 'respuestas' && resto.length >= 3) return proyecto
  if (segunda === 'revision' && resto.length === 3 && /^R-\d+\.md$/i.test(tercera ?? '')) return proyecto
  if (segunda === 'modulos' && resto.length === 4 && cuarta === 'estado.md' && tercera) return proyecto
  return null
}

/**
 * El proyecto cuyo documento cambió (un `.md` de su raíz o de `docs/`, como los que lee Docs), o null. Docs y el
 * Mapa se releen con esto sin perder la posición (W-8 › Estados).
 */
export function documentoAfectado(relativa: string): string | null {
  const partes = relativa.split(/[\\/]+/).filter((p) => p !== '')
  const [proyecto, ...resto] = partes
  if (!proyecto || !esCarpetaDeProyecto(proyecto) || resto.length === 0) return null
  if (!/\.md$/i.test(resto.at(-1) ?? '')) return null
  if (resto.length === 1) return proyecto
  if (resto[0] !== 'docs') return null
  return resto.slice(1, -1).some((p) => p.startsWith('.') || p === 'node_modules') ? null : proyecto
}

/**
 * ¿El cambio le importa a la sección Skills (modulos/skills/diseno-tecnico.md › Actualizar lo que se ve)? Una skill
 * propia (`Skills/skills/…` en la carpeta Iridium) o el formato de un proyecto (`docs/README.md`, `CLAUDE.md`).
 */
export function cambianSkills(relativa: string): boolean {
  const partes = relativa.split(/[\\/]+/).filter((p) => p !== '')
  const [proyecto, ...resto] = partes
  if (!proyecto || !esCarpetaDeProyecto(proyecto)) return false
  if (proyecto === CARPETA_SKILLS && resto[0] === 'skills') return true
  if (resto.length === 1) return resto[0] === 'CLAUDE.md'
  return resto.length === 2 && resto[0] === 'docs' && resto[1] === 'README.md'
}
