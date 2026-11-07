// Los filtros de la Bandeja de entrada (W-5, H-9): por frente, con su cuenta, y las preguntas en pausa aparte.
import type { PendienteVista } from '../../../compartido/puente'

/** La clave del filtro «Todos». */
export const TODOS = '*'

/** En pausa (OR-6): al final, plegada y sin contar. Una ya respondida se ve con las respondidas. */
export const enPausa = (p: PendienteVista) => p.enPausa && p.estado !== 'respondida'

/** La clave del filtro del núcleo (las preguntas sin frente). */
export const NUCLEO = ''

/**
 * Los filtros por frente (H-9): solo si hay preguntas de más de uno, con lo que queda por responder de cada uno
 * («Todos 3 · Núcleo 2 · Compartir 1»). El núcleo va primero y los frentes, por nombre.
 */
export function filtrosPorFrente(
  ps: readonly PendienteVista[],
): { clave: string; nombre: string; n: number }[] {
  const activas = ps.filter((p) => !enPausa(p))
  const cuentas = new Map<string, number>()
  for (const p of activas) {
    const clave = p.frente ?? NUCLEO
    cuentas.set(clave, (cuentas.get(clave) ?? 0) + (p.estado === 'respondida' ? 0 : 1))
  }
  if (cuentas.size < 2) return []
  const claves = [...cuentas.keys()].sort((a, b) =>
    a === NUCLEO ? -1 : b === NUCLEO ? 1 : a.localeCompare(b, 'es'),
  )
  const sinResponder = activas.filter((p) => p.estado !== 'respondida').length
  return [
    { clave: TODOS, nombre: 'Todos', n: sinResponder },
    ...claves.map((c) => ({ clave: c, nombre: c === NUCLEO ? 'Núcleo' : c, n: cuentas.get(c) ?? 0 })),
  ]
}
