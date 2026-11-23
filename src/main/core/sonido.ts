// El sonido al terminar (T-52, D-183): suena cuando la IA terminó su trabajo de verdad, no en cada turno de Claude.
// Un turno que deja algo de fondo (las pruebas con la app abierta) no terminó: suena al final, cuando ya no espera
// nada y pasó el control. Sin disco ni ventana.
import type { AjusteSonido, SonidoFin } from '../../compartido/puente'

export const SONIDOS: readonly SonidoFin[] = ['campana', 'dos-notas', 'gota', 'acorde']

/** Prendido al principio, con la campana; con el avance solo, apagado (suele ser de noche). */
export const AJUSTE_SONIDO_INICIAL: AjusteSonido = { prendido: true, cual: 'campana', conAvance: false }

/** Cómo terminó la IA lo que estaba haciendo. */
export interface FinDeTrabajo {
  resultado: 'ok' | 'detenida' | 'error'
  /** Lo que sigue corriendo de fondo: con algo, la IA todavía espera y retoma sola. */
  fondo: number
  /** Lo tomó el avance solo (D-178). */
  avance: boolean
}

/** El sonido que toca, o null: solo cuando terminó bien, sin nada de fondo y si el ajuste lo deja. */
export function sonidoAlTerminar(ajuste: AjusteSonido, fin: FinDeTrabajo): SonidoFin | null {
  if (!ajuste.prendido || fin.resultado !== 'ok' || fin.fondo > 0) return null
  if (fin.avance && !ajuste.conAvance) return null
  return ajuste.cual
}
