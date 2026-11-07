// Actualizar (R-12, T-46, 04-ux.md › W-1 y F-7): un solo botón en la barra de estado junta «Armar» y «Reiniciar
// ahora». El estado sale de lo que ven las dos vigías (los cambios sin armar y la versión lista) y de si la IA del
// código de Iridium está trabajando (modulos/orden/diseno-tecnico.md › Actualizar).
import { fechaExacta } from './fechas'
import type { SinArmar, VersionNueva } from './puente'

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
