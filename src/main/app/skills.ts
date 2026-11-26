// Casos de uso de la sección Skills (modulos/skills/diseno-tecnico.md): las skills por origen y cómo está cada
// proyecto con el framework (W-13). Solo leen; Pasar al framework se cita en la conversación del proyecto (D-196).
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { TarjetaProyecto } from '../../compartido/puente'
import {
  type EstadoFramework,
  type ListaSkills,
  novedadesDe,
  type ProyectoFramework,
  type SkillProyecto,
} from '../../compartido/skills'
import { estadoConFramework, leerEncabezado, marcarDobles, ordenarSkills, skillDe } from '../core/skills'
import { leerSkills, SKILLS_DEL_PROYECTO, skillsEnProyecto, textoSkillDelProyecto } from '../infra/skills'

async function textoSiExiste(ruta: string): Promise<string | null> {
  try {
    return await readFile(ruta, 'utf8')
  } catch {
    return null
  }
}

/** Lee la carpeta de Claude; las propias son los enlaces a `skills` de la carpeta Skills (D-083). */
export async function leerSeccionSkills(
  carpetaClaude: string,
  carpetaSkills: string | null,
): Promise<ListaSkills> {
  const propias = carpetaSkills === null ? null : join(carpetaSkills, 'skills')
  const crudas = await leerSkills(carpetaClaude)
  const skills = crudas.carpetas.map((c) => skillDe(c, propias)).filter((s) => s !== null)
  marcarDobles(skills)
  return { carpetaClaude, skills: ordenarSkills(skills), errores: crudas.errores }
}

/**
 * El orden de Skills › Framework (W-13): los de afuera primero, después los que tienen novedades (T-64), las carpetas y
 * al final los que están al día.
 */
function ordenFramework(e: EstadoFramework): number {
  if (e.tipo === 'viejo') return 0
  if (e.tipo === 'avisos') return 1
  if (novedadesDe(e).length > 0) return 2
  return e.tipo === 'carpeta' ? 3 : 4
}

/**
 * Cómo está cada proyecto con el framework (W-13), con los avisos que la tarjeta ya calculó: los que cuentan, en el
 * orden de la grilla dentro de cada grupo.
 */
export async function proyectosConFramework(
  proyectos: readonly TarjetaProyecto[],
): Promise<ProyectoFramework[]> {
  const filas = await Promise.all(
    proyectos.map(async (p): Promise<ProyectoFramework | null> => {
      const estado = estadoConFramework({
        tieneEstado: p.framework !== null,
        archivado: p.archivado,
        estado: p.estado,
        reemplazadoPor: p.reemplazadoPor,
        readme: p.framework === null ? null : await textoSiExiste(join(p.ruta, 'docs', 'README.md')),
        avisos: p.framework === null || p.framework === 'viejo' ? null : p.framework.avisos,
        novedades: p.framework === null || p.framework === 'viejo' ? [] : (p.framework.novedades ?? []),
      })
      return estado && { ruta: p.ruta, nombre: p.nombre, inicial: p.inicial, icono: p.icono, estado }
    }),
  )
  return filas
    .filter((f) => f !== null)
    .map((f, i) => ({ f, i }))
    .sort((a, b) => ordenFramework(a.f.estado) - ordenFramework(b.f.estado) || a.i - b.i)
    .map((x) => x.f)
}

/** Las skills del proyecto (R-8), con el nombre y la descripción de su `SKILL.md`. Solo lee. */
export async function skillsDelProyecto(proyecto: string): Promise<SkillProyecto[]> {
  const nombres = await skillsEnProyecto(proyecto)
  return Promise.all(
    nombres.map(async (carpeta) => {
      const texto = await textoSkillDelProyecto(proyecto, carpeta)
      const e = texto === null ? { name: null, description: null } : leerEncabezado(texto)
      return {
        nombre: e.name?.trim() || carpeta,
        descripcion: e.description?.trim() || null,
        archivo: [...SKILLS_DEL_PROYECTO, carpeta, 'SKILL.md'].join('/'),
      }
    }),
  )
}
