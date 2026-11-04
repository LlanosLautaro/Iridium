// Cuándo pasa algo que todavía no pasó (cuándo se libera el uso, H-12): «en 25 min», «hoy a las 18:40», «mañana a
// las 09:00», «el lunes a las 09:00», «el 5 nov a las 09:00».

const MINUTO = 60_000
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']

export const hora = (ms: number) =>
  new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export function cuandoSera(ms: number, ahora = Date.now()): string {
  const falta = ms - ahora
  if (falta <= MINUTO) return 'en un momento'
  if (falta < 60 * MINUTO) return `en ${Math.round(falta / MINUTO)} min`
  const d = new Date(ms)
  const hoy = new Date(ahora)
  const dia = (n: number) => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + n).toDateString()
  if (d.toDateString() === dia(0)) return `hoy a las ${hora(ms)}`
  if (d.toDateString() === dia(1)) return `mañana a las ${hora(ms)}`
  if (falta < 6 * 24 * 60 * MINUTO) return `el ${DIAS[d.getDay()]} a las ${hora(ms)}`
  return `el ${d.getDate()} ${MESES[d.getMonth()]} a las ${hora(ms)}`
}

/** «2,5 días», «1 día», «18 h». */
export function duracionDias(dias: number): string {
  if (dias < 1) return `${Math.max(1, Math.round(dias * 24))} h`
  const r = Math.round(dias * 10) / 10
  return r === 1 ? '1 día' : `${String(r).replace('.', ',')} días`
}

/** Un porcentaje redondeado para leer: «14 %», sin cortarse entre el número y el signo. */
export const pc = (n: number) => `${Math.round(n)} %`
