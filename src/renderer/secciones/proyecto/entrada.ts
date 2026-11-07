// Por dónde se entra a un proyecto (04-ux.md › W-3), aparte para probarlo sin la ventana.
import type { TarjetaProyecto } from '../../../compartido/puente'

/**
 * Por dónde se entra a un proyecto la primera vez (W-3): a la Bandeja de entrada si hay algo (sin responder o
 * respondido sin procesar) y, si no, al Mapa. Una carpeta sin `docs/estado.md` (carpeta simple, D-095), a Archivos.
 */
export function seccionDeEntrada(p: TarjetaProyecto | null): 'pendientes' | 'mapa' | 'archivos' {
  if (!p) return 'pendientes'
  if (p.hito === null) return 'archivos'
  const { sinResponder, respondidas } = p.preguntas
  return sinResponder + respondidas > 0 ? 'pendientes' : 'mapa'
}
