// Lo que pasó en un momento del arranque del período, en palabras (frente Arranque, AR-2 a AR-4): lo usan el detalle
// del uso y el aviso al volver.
import type { RenglonArranqueVista } from '../../compartido/puente'
import { cuandoFue, hora } from '../ui/tiempo'

/** Cómo va la conversación que abrió: «terminó», «dejó 2 preguntas», «trabajando», «falló», «se cortó». */
export function queDejo(p: NonNullable<RenglonArranqueVista['proyecto']>): string {
  if (p.estado === 'trabajando') return 'trabajando'
  if (p.estado === 'error') return 'falló'
  if (p.estado === 'detenida') return 'se cortó'
  if (p.preguntas === 0) return 'terminó'
  return p.preguntas === 1 ? 'dejó 1 pregunta' : `dejó ${p.preguntas} preguntas`
}

/** Por qué no arrancó, sin la hora (AR-3). */
export function porQueNo(r: RenglonArranqueVista): string {
  switch (r.resultado) {
    case 'semana':
      return 'no arrancó: la semana pasó el 90 %'
    case 'sin-sesion':
      return 'no arrancó: no había sesión de Claude'
    case 'sin-uso':
      return 'no arrancó: no se pudo leer el uso'
    case 'periodo-abierto':
      return 'el período ya estaba abierto'
    case 'nada-listo':
      return 'no había respuestas tuyas esperando'
    default:
      return 'arrancó'
  }
}

/**
 * La hora corta para el aviso: «03:02» si fue hoy; si no, «ayer 23:10» (sin «a las»: la columna de la hora no le quita
 * el ancho a lo que pasó).
 */
export function horaCorta(ms: number): string {
  return new Date(ms).toDateString() === new Date().toDateString()
    ? hora(ms)
    : cuandoFue(ms).replace(' a las ', ' ')
}
