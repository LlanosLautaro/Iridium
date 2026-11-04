// Copiado de la app anterior de proyectos (D-026).
// Fechas para mostrar (design system, Voz y textos): relativa en la vista, exacta en el detalle o el tooltip.

const MINUTO = 60_000
const HORA = 60 * MINUTO
const DIA = 24 * HORA

/** "recién", "hace 5 min", "hace 2 h", "ayer", "hace 3 días", "hace 2 semanas", "hace 4 meses", "hace 1 año". */
export function fechaRelativa(ms: number, ahora: number): string {
  const d = Math.max(0, ahora - ms)
  if (d < MINUTO) return 'recién'
  if (d < HORA) return `hace ${Math.floor(d / MINUTO)} min`
  if (d < DIA) return `hace ${Math.floor(d / HORA)} h`
  const dias = Math.floor(d / DIA)
  if (dias === 1) return 'ayer'
  if (dias < 14) return `hace ${dias} días`
  if (dias < 60) return `hace ${Math.floor(dias / 7)} semanas`
  if (dias < 365) return `hace ${Math.floor(dias / 30)} meses`
  const anios = Math.floor(dias / 365)
  return anios === 1 ? 'hace 1 año' : `hace ${anios} años`
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']

/** "2 oct 2026, 22:17", en la hora local. */
export function fechaExacta(ms: number): string {
  const f = new Date(ms)
  const hh = String(f.getHours()).padStart(2, '0')
  const mm = String(f.getMinutes()).padStart(2, '0')
  return `${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}, ${hh}:${mm}`
}
