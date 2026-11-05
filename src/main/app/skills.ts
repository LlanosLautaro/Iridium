// Casos de uso de la sección Skills (modulos/skills/diseno-tecnico.md): las skills por origen, los proyectos
// atrasados y Poner al día. Solo leen; Poner al día manda un mensaje a la conversación del proyecto.
import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { TarjetaProyecto } from '../../compartido/puente'
import type { Atrasados, ListaSkills, ProyectoAtrasado, SkillProyecto } from '../../compartido/skills'
import {
  formatoAtrasado,
  formatoVigente,
  leerEncabezado,
  marcarDobles,
  nombreBase,
  ordenarSkills,
  SKILL_GUIA,
  skillDe,
} from '../core/skills'
import { leerSkills, SKILLS_DEL_PROYECTO, skillsEnProyecto, textoSkillDelProyecto } from '../infra/skills'

async function textoSiExiste(ruta: string): Promise<string | null> {
  try {
    return await readFile(ruta, 'utf8')
  } catch {
    return null
  }
}

/** La lista de la sección y el formato vigente de la guía, leídos juntos (una sola pasada por el disco). */
export interface LecturaSkills {
  lista: ListaSkills
  vigente: string | null
}

/** Lee la carpeta de Claude; las propias son los enlaces a `skills` de la carpeta Skills (D-083). */
export async function leerSeccionSkills(
  carpetaClaude: string,
  carpetaSkills: string | null,
): Promise<LecturaSkills> {
  const propias = carpetaSkills === null ? null : join(carpetaSkills, 'skills')
  const crudas = await leerSkills(carpetaClaude)
  const skills = crudas.carpetas.map((c) => skillDe(c, propias)).filter((s) => s !== null)
  marcarDobles(skills)
  // La guía dice su formato vigente: la propia, si está; si no, la que haya con ese nombre.
  const guias = crudas.carpetas.flatMap((c) => {
    const s = skillDe(c, propias)
    return s && c.texto !== null && nombreBase(s.nombre) === SKILL_GUIA ? [{ texto: c.texto, s }] : []
  })
  const guia = guias.find((g) => g.s.origen === 'propia') ?? guias[0]
  return {
    lista: { carpetaClaude, skills: ordenarSkills(skills), errores: crudas.errores },
    vigente: guia ? formatoVigente(guia.texto) : null,
  }
}

/** Los proyectos con un formato viejo de la guía (SK-4, D-068), en el orden de la grilla. */
export async function proyectosAtrasados(
  proyectos: readonly TarjetaProyecto[],
  vigente: string | null,
): Promise<Atrasados> {
  if (vigente === null) return { vigente, proyectos: [] }
  const filas = await Promise.all(
    proyectos.map(async (p): Promise<ProyectoAtrasado | null> => {
      const [tieneEstado, readme, claudeMd] = await Promise.all([
        access(join(p.ruta, 'docs', 'estado.md')).then(
          () => true,
          () => false,
        ),
        textoSiExiste(join(p.ruta, 'docs', 'README.md')),
        textoSiExiste(join(p.ruta, 'CLAUDE.md')),
      ])
      const formato = formatoAtrasado(
        {
          tieneEstado,
          archivado: p.archivado,
          estado: p.estado,
          reemplazadoPor: p.reemplazadoPor,
          readme,
          claudeMd,
        },
        vigente,
      )
      return formato && { ruta: p.ruta, nombre: p.nombre, inicial: p.inicial, icono: p.icono, formato }
    }),
  )
  return { vigente, proyectos: filas.filter((f) => f !== null) }
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
