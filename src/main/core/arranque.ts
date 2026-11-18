// El arranque del período de 5 horas (frente Arranque, D-135, D-146, D-149): cuándo es el próximo momento, si se
// arranca y qué proyecto. Sin disco, motor ni temporizadores.
import type { AjusteArranque, UsoSuscripcion } from '../../compartido/puente'

/** Cuánto después de que vence el período se arranca (D-146): el uso ya se liberó y lo vio el motor. */
export const DESPUES_DEL_VENCIMIENTO_MS = 5 * 60_000

/** Con la semana en esto o más no arranca (D-146): lo que queda es del usuario. */
export const TOPE_SEMANA = 90

/** Cuántos días se guardan en `arranques.json` (D-149). */
export const DIAS_GUARDADOS = 7

/**
 * Un momento que pasó con Iridium cerrada no se hace (D-146), salvo el reinicio de Actualizar solo (D-122), que dura
 * unos minutos: si al abrir el momento programado pasó hace menos de esto, se hace.
 */
export const HUECO_REINICIO_MS = 10 * 60_000

/** La hora del ajuste: `HH:MM`, de 00:00 a 23:59. */
export const HORA_ARRANQUE = /^([01]\d|2[0-3]):[0-5]\d$/

export const AJUSTE_INICIAL: AjusteArranque = { prendido: false, hora: '03:00' }

export type CualMomento = 'hora' | 'vencimiento'

export interface Momento {
  cuando: number
  momento: CualMomento
}

export type Resultado = 'arranco' | 'periodo-abierto' | 'nada-listo' | 'semana' | 'sin-uso' | 'sin-sesion'

/** Un proyecto con trabajo listo: respuestas del usuario esperando, la más vieja de `desde` (ms). */
export interface Candidato {
  ruta: string
  nombre: string
  preguntas: string[]
  desde: number
}

/** La próxima vez que el reloj marca esa hora (local) después de `ahora`: hoy o mañana, nunca sumando 24 horas. */
export function proximaHora(hora: string, ahora: number): number {
  const [h, m] = hora.split(':').map(Number) as [number, number]
  const d = new Date(ahora)
  d.setHours(h, m, 0, 0)
  if (d.getTime() <= ahora) {
    d.setDate(d.getDate() + 1)
    d.setHours(h, m, 0, 0)
  }
  return d.getTime()
}

/**
 * El próximo momento (D-149 › 1): la hora elegida o 5 minutos después de que venza el período, el que llegue antes.
 * Los momentos hasta `hecho` ya se hicieron. null si está apagado.
 */
export function proximoMomento(
  ajuste: AjusteArranque,
  uso: UsoSuscripcion | null,
  ahora: number,
  hecho: number | null = null,
): Momento | null {
  if (!ajuste.prendido) return null
  const desde = Math.max(ahora, hecho ?? Number.NEGATIVE_INFINITY)
  const hora: Momento = { cuando: proximaHora(ajuste.hora, desde), momento: 'hora' }
  const libera = uso?.cincoHoras?.libera
  if (typeof libera !== 'number') return hora
  const vence = libera + DESPUES_DEL_VENCIMIENTO_MS
  if (vence <= desde || vence >= hora.cuando) return hora
  return { cuando: vence, momento: 'vencimiento' }
}

/** El período de 5 horas está abierto: tiene un vencimiento por venir (D-149 › 3). */
export function periodoAbierto(uso: UsoSuscripcion, ahora: number): boolean {
  const libera = uso.cincoHoras?.libera
  return typeof libera === 'number' && libera > ahora
}

/** Por qué no se arranca antes de buscar trabajo; null si se puede buscar. */
export function bloqueo(uso: UsoSuscripcion | null, ahora: number): Resultado | null {
  if (!uso) return 'sin-uso'
  if (periodoAbierto(uso, ahora)) return 'periodo-abierto'
  if ((uso.semana?.usado ?? 0) >= TOPE_SEMANA) return 'semana'
  return null
}

/** El que espera hace más: la respuesta más vieja; a igual fecha, por nombre. */
export function elegir(candidatos: readonly Candidato[]): Candidato | null {
  return (
    [...candidatos].sort((a, b) => a.desde - b.desde || a.nombre.localeCompare(b.nombre, 'es'))[0] ?? null
  )
}

/** Si el momento programado que quedó al cerrar se hace al abrir (el reinicio de Actualizar solo, D-149 › 2). */
export function pendienteAlAbrir(programado: number | null, ahora: number): boolean {
  return programado !== null && programado <= ahora && ahora - programado < HUECO_REINICIO_MS
}
