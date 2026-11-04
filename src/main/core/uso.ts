// El uso de la suscripción (H-12, D-045, R-1): el ritmo de la semana y cuándo volver a leerlo. Sin disco ni motor.
import type { RitmoSemana, UsoSuscripcion, VentanaUso } from '../../compartido/puente'

const HORA = 3_600_000
const DIA = 24 * HORA
const SEMANA_DIAS = 7

/**
 * Cada cuánto se vuelve a leer el uso con la app abierta, aunque no haya sesiones: lo gastan también Claude Code en
 * VS Code y claude.ai, y las ventanas avanzan solas (Defecto 16).
 */
export const RELEER_USO_MS = 5 * 60_000

/** Al volver a la ventana, el uso se relee si tiene más que esto (Claude Code guarda el suyo un minuto). */
export const USO_VIEJO_MS = 60_000

/** Lo mínimo transcurrido de la semana para calcular el ritmo: recién empezada, cualquier uso parecería enorme. */
const TRANSCURRIDO_MINIMO_DIAS = 0.25

/**
 * Si el ritmo de la semana alcanza hasta que se libera (R-1): lo usado por día hasta ahora, lo que se puede usar por
 * día de acá al reinicio y, al ritmo de hasta ahora, cuándo se agotaría. null si no se sabe cuándo se libera.
 */
export function ritmoSemana(semana: VentanaUso | null, ahora: number): RitmoSemana | null {
  if (!semana || semana.libera === null) return null
  const diasQuedan = Math.max(0, (semana.libera - ahora) / DIA)
  const transcurridos = Math.max(TRANSCURRIDO_MINIMO_DIAS, SEMANA_DIAS - diasQuedan)
  const porDia = semana.usado / transcurridos
  const queda = Math.max(0, 100 - semana.usado)
  const alcanzaPorDia = diasQuedan > 0 ? queda / diasQuedan : queda
  let agotaria: number | null = null
  if (semana.agotada || queda === 0) agotaria = ahora
  else if (porDia > 0) {
    const diasHastaAgotar = queda / porDia
    if (diasHastaAgotar < diasQuedan) agotaria = ahora + diasHastaAgotar * DIA
  }
  return { diasQuedan, porDia, alcanzaPorDia, parejo: 100 / SEMANA_DIAS, agotaria }
}

export function usoSuscripcion(
  uso: { cincoHoras: VentanaUso | null; semana: VentanaUso | null },
  ahora: number,
): UsoSuscripcion {
  return { ...uso, ritmo: ritmoSemana(uso.semana, ahora), leido: ahora }
}

/** Si conviene releer el uso al volver a la ventana: no hay o tiene más de un minuto. */
export function usoViejo(uso: UsoSuscripcion | null, ahora: number): boolean {
  return !uso || ahora - uso.leido > USO_VIEJO_MS
}

/**
 * Cuándo volver a leer el uso: a los 5 minutos o un poco después de que se libere una ventana, lo que pase antes
 * (así una ventana agotada vuelve a estar disponible sin esperar). En ms desde `ahora`.
 */
export function proximaLectura(uso: UsoSuscripcion | null, ahora: number): number {
  const liberaciones = [uso?.cincoHoras?.libera, uso?.semana?.libera].filter(
    (l): l is number => typeof l === 'number' && l > ahora,
  )
  const margen = 30_000
  return Math.min(RELEER_USO_MS, ...liberaciones.map((l) => l - ahora + margen))
}
