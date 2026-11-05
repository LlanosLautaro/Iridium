// Las ideas sueltas de un proyecto (R-8, D-089): las secciones de la guía donde se anotan las ideas que no entran en
// lo que se está haciendo. Reglas puras: reciben el texto del documento.
import { lineasFueraDeCodigo, partirLineas, titulos } from './visor/lineas'

/** Dónde anota la guía las ideas: después del hito 2, en la construcción; antes, en la idea. En ese orden. */
export const SECCIONES_IDEAS: readonly { documento: string; prefijo: string }[] = [
  { documento: 'docs/07-construccion.md', prefijo: 'ideas nuevas' },
  { documento: 'docs/00-idea.md', prefijo: 'ideas para después' },
]

export interface SeccionIdeasLeida {
  /** El título tal cual, sin marcas (`Ideas nuevas (pendientes de evaluar en la definición)`). */
  titulo: string
  /** Lo que hay debajo del título hasta el siguiente del mismo nivel o uno mayor. */
  cuerpo: string
  /** Los puntos de primer nivel de la lista (cada uno, una idea). */
  cantidad: number
}

/** La primera sección `## ` cuyo título empieza con `prefijo` (sin distinguir mayúsculas); null si no está. */
export function seccionDeIdeas(texto: string, prefijo: string): SeccionIdeasLeida | null {
  const lineas = partirLineas(texto)
  const todos = titulos(lineas)
  const i = todos.findIndex((t) => t.nivel === 2 && t.texto.toLowerCase().startsWith(prefijo))
  const titulo = todos[i]
  if (!titulo) return null
  const fin = todos.slice(i + 1).find((t) => t.nivel <= 2)?.n ?? lineas.length
  const cuerpo = lineas.slice(titulo.n + 1, fin)
  return {
    titulo: titulo.texto,
    cuerpo: cuerpo.join('\n').trim(),
    cantidad: lineasFueraDeCodigo(cuerpo).filter(({ texto: l }) => /^(?:[-*+]|\d+[.)])[ \t]+\S/.test(l))
      .length,
  }
}
