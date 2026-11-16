// Las ideas de un proyecto con framework viejo (R-8): las secciones de la guía, pintadas como en Docs. Solo lee.
import type { IdeasProyecto } from '../../compartido/ideas'
import { SECCIONES_IDEAS, seccionDeIdeas } from '../core/ideas-proyecto'
import type { DocumentosProyecto } from './visor'

/** Las ideas sueltas de un proyecto (R-8): las secciones de la guía, pintadas como en Docs. Solo lee. */
export function ideasDelProyecto(d: DocumentosProyecto): IdeasProyecto {
  const secciones = SECCIONES_IDEAS.flatMap(({ documento, prefijo }) => {
    const texto = d.texto(documento)
    const s = texto === null ? null : seccionDeIdeas(texto, prefijo)
    if (!s) return []
    return [
      {
        documento,
        titulo: s.titulo,
        ancla: d.anclaDeTitulo(documento, s.titulo),
        html: d.html(s.cuerpo, documento),
        cantidad: s.cantidad,
      },
    ]
  })
  return { secciones }
}
