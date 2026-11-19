// Ejecutar Alfa (frente Abrir, AB-1, AB-2; `modulos/abrir/ux.md`): lo que abre el proyecto, desde el menú de la tarjeta
// y desde la barra del proyecto. Si no abre, lo dice el aviso de abajo a la derecha.
import type { TarjetaProyecto } from '../../../compartido/puente'
import { usarEstado } from '../../estado'

type Proyecto = Pick<TarjetaProyecto, 'ruta' | 'nombre'>

/** El nombre del botón: «Ejecutar Alfa» (D-155). */
export function nombreEjecutar(p: Pick<TarjetaProyecto, 'nombre'>): string {
  return `Ejecutar ${p.nombre}`
}

function motivo(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

export async function ejecutarProyecto(p: Proyecto): Promise<void> {
  const poner = usarEstado.getState().ponerAvisoEjecutar
  poner(null)
  const error = (detalle: string) =>
    poner({ ruta: p.ruta, titulo: `${p.nombre} no se pudo ejecutar`, detalle, error: true, armar: false })
  try {
    const r = await window.iridium.ejecutarProyecto(p.ruta)
    if (r.tipo === 'error') error(r.mensaje)
    else if (r.tipo === 'sin-armar')
      poner({
        ruta: p.ruta,
        titulo: `${p.nombre} todavía no está armada`,
        detalle: r.armar ? null : 'Pedile a la IA del proyecto que la arme.',
        error: false,
        armar: r.armar,
      })
  } catch (e) {
    error(motivo(e))
  }
}

/** Armar ahora (AB-2): corre el script de armar a la vista, en una consola, como un botón de Scripts. */
export async function armarProyecto(p: Proyecto): Promise<void> {
  const poner = usarEstado.getState().ponerAvisoEjecutar
  poner(null)
  const fallo = (detalle: string) =>
    poner({ ruta: p.ruta, titulo: `${p.nombre} no se pudo armar`, detalle, error: true, armar: false })
  try {
    const r = await window.iridium.armarProyecto(p.ruta)
    if (r.tipo === 'error') fallo(r.mensaje)
    else
      poner({
        ruta: p.ruta,
        titulo: `${p.nombre} se está armando en una consola`,
        detalle: `Cuando termine, ${nombreEjecutar(p)} la abre.`,
        error: false,
        armar: false,
      })
  } catch (e) {
    fallo(motivo(e))
  }
}
