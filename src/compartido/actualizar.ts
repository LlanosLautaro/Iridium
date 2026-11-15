// Actualizar (R-12, T-46, 04-ux.md › W-1 y F-7): un solo botón en la barra de estado junta «Armar» y «Reiniciar
// ahora». El estado sale de lo que ven las dos vigías (los cambios sin armar y la versión lista) y de si la IA del
// código de Iridium está trabajando (modulos/orden/diseno-tecnico.md › Actualizar).
import { fechaExacta } from './fechas'
import type { ActualizarSolo, SinArmar, VersionNueva } from './puente'

export type EstadoActualizar =
  | { tipo: 'al-dia' }
  /** `lista`: ya hay una versión armada (o bajada de GitHub), Actualizar solo reinicia; si no, arma antes. */
  | { tipo: 'disponible'; lista: boolean; detalle: string }
  | { tipo: 'armando'; desde: number | null }
  | { tipo: 'fallo'; motivo: string }
  /** La IA de Iridium está trabajando: armar ahora tomaría su trabajo a mitad de camino. */
  | { tipo: 'bloqueado'; detalle: string }

export interface DatosActualizar {
  sinArmar: SinArmar | null
  version: VersionNueva | null
  /** La IA del proyecto del código de Iridium está trabajando. */
  iaTrabajando: boolean
}

export function estadoActualizar({ sinArmar, version, iaTrabajando }: DatosActualizar): EstadoActualizar {
  if (sinArmar?.armando) return { tipo: 'armando', desde: sinArmar.desde }
  const pendiente = sinArmar?.pendiente ?? null
  if (pendiente) {
    const detalle = `Trae «${pendiente.mensaje}» (${pendiente.commit}) y lo anterior que falte`
    if (iaTrabajando) return { tipo: 'bloqueado', detalle }
    if (sinArmar?.fallo) return { tipo: 'fallo', motivo: sinArmar.fallo.motivo }
    return { tipo: 'disponible', lista: false, detalle }
  }
  if (version) {
    const armada = `Trae «${version.mensaje}» (${version.commit}), armada el ${fechaExacta(Date.parse(version.fecha))}${version.sinGuardar ? ' con cambios sin commitear' : ''}`
    // Ya se intentó y no entró (Defecto 3): se dice, con el motivo; se reintenta al reiniciar o al cerrar.
    const noEntro = version.noEntro
      ? `. El ${fechaExacta(Date.parse(version.noEntro.fecha))} no entró: ${version.noEntro.motivo}`
      : ''
    return { tipo: 'disponible', lista: true, detalle: armada + noEntro }
  }
  return { tipo: 'al-dia' }
}

/** «1 min», «12 min», «menos de un minuto»: cuánto lleva armando. */
export function tiempoArmando(desde: number | null, ahora: number): string {
  if (desde === null) return ''
  const min = Math.floor((ahora - desde) / 60_000)
  return min < 1 ? 'menos de un minuto' : `${min} min`
}

/**
 * Actualizar solo (T-67): con los cambios commiteados y la IA de Iridium libre un rato, arma; con la versión lista,
 * reinicia cuando ninguna IA trabaja ni espera lo que dejó de fondo y la PC lleva unos minutos sin usarse. El botón
 * sigue para hacerlo ya. Las pruebas lo apagan (`IRIDIUM_ACTUALIZAR_SOLO=no`) o lo aceleran (un número: la espera en
 * ms, y reinicia sin esperar a que la PC quede quieta).
 */
export const SOLO: ActualizarSolo = { esperaMs: 60_000, quietoSeg: 180 }

export function actualizarSolo(variable: string | undefined): ActualizarSolo | null {
  if (variable === 'no') return null
  const ms = Number(variable)
  return variable && Number.isFinite(ms) && ms >= 0 ? { esperaMs: ms, quietoSeg: 0 } : SOLO
}

export interface DatosSolo {
  sinArmar: SinArmar | null
  version: VersionNueva | null
  /** La IA del código de Iridium trabaja o espera lo que dejó de fondo: sus cambios pueden estar a medias. */
  iaIridiumOcupada: boolean
  /** Alguna IA trabaja o espera lo de fondo: reiniciar la cortaría. */
  algunaOcupada: boolean
  /** El commit que ya se armó solo y falló: no se reintenta hasta que haya otro. */
  fallido: string | null
}

/**
 * Qué toca hacer solo, si algo: `armar` (hay commits sin armar, sin cambios a medias, nada armándose y la IA de Iridium
 * libre, y no es lo que `pnpm volver` dejó afuera) o `reiniciar` (hay una versión lista que no falló al ponerse, nada nuevo por armar y ninguna IA ocupada). Las esperas (que siga así un
 * rato, que la PC esté quieta) las pone quien llama.
 */
export function queHacerSolo(d: DatosSolo): 'armar' | 'reiniciar' | null {
  const s = d.sinArmar
  if (s?.armando) return null
  if (s?.pendiente) {
    const commit = s.pendiente.commit
    if (!s.limpio || d.iaIridiumOcupada || commit === d.fallido || commit === s.retenido) return null
    return 'armar'
  }
  // Una versión que ya no entró (Defecto 3) no se reintenta sola: reiniciaría cada vez que la PC quede quieta.
  if (d.version && !d.version.noEntro && !d.algunaOcupada) return 'reiniciar'
  return null
}
