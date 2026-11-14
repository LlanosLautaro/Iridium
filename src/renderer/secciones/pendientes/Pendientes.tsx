// Los pendientes de un proyecto (H-9, F-3, 04-ux.md › W-5), en su Bandeja de entrada (D-043): todas sus preguntas con
// lo que citan, filtros por frente y las en pausa al final. Sin la Bandeja de todos (D-111): lo que espera de cada
// proyecto se ve en el suyo y, desde la grilla, en la cuenta de su tarjeta. Lo escrito vive en el estado de la ventana
// (no se pierde al cambiar de proyecto ni de filtro) y se guarda a medias solo (R-3). El frente elegido se recuerda
// por proyecto en `config.json`: queda al cambiar de proyecto y al cerrar Iridium (R-55).
import type { ReactNode } from 'react'
import {
  type Destino,
  type PendienteVista,
  PROYECTOS_CON_FILTRO,
  type TarjetaProyecto,
} from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import { Cabecera, Filtros } from '../../ui/Cabecera'
import { Cuenta } from '../../ui/Cuenta'
import { Icono } from '../../ui/Icono'
import { enPausa, filtrosPorFrente, NUCLEO, TODOS } from './filtros'
import { Pendiente } from './Pendiente'

const GRUPOS: { titulo: string; de: (p: PendienteVista) => boolean }[] = [
  { titulo: 'Frenan el proyecto', de: (p) => p.estado === 'sin-responder' && p.frena },
  { titulo: 'Sin responder', de: (p) => p.estado === 'sin-responder' && !p.frena },
  { titulo: 'A medias', de: (p) => p.estado === 'a-medias' },
  { titulo: 'Respondidas, sin procesar', de: (p) => p.estado === 'respondida' },
]

function Siluetas() {
  return (
    <div className="pendientes carga" role="status" aria-busy="true" aria-label="Cargando pendientes">
      {[1, 2].map((n) => (
        <div key={n} className="pend silueta-pend">
          <span className="linea-silueta" style={{ width: '30%' }} />
          <span className="linea-silueta" style={{ width: '80%', height: 14 }} />
          <span className="linea-silueta" style={{ height: 48, borderRadius: 8 }} />
          <span className="linea-silueta" style={{ height: 34, borderRadius: 8 }} />
        </div>
      ))}
    </div>
  )
}

/** Los pendientes de un proyecto en los grupos de W-5; también dentro del proyecto (D-043). */
export function ListaPendientes({
  p,
  abrirDoc,
  pie,
  cabecera,
}: {
  p: TarjetaProyecto
  abrirDoc: (d: Destino) => void
  /** La cabecera de la sección (W-9): la cuenta y los filtros por frente los pone la lista. */
  cabecera: { titulo: string; icono?: ReactNode; sub?: ReactNode; acciones?: ReactNode }
  /** Lo que va después de los pendientes, en el mismo desplazamiento (los scripts, en la vista de entrada). */
  pie?: ReactNode
}) {
  const datos = usarEstado((s) => s.pendientes[p.ruta])
  const ponerPendientes = usarEstado((s) => s.ponerPendientes)
  const filtro = usarEstado((s) => s.preferencias.filtrosBandeja[p.ruta]) ?? TODOS
  const guardarPreferencias = usarEstado((s) => s.guardarPreferencias)
  const setFiltro = (clave: string) => {
    // Todos no se guarda: es lo de siempre. El último elegido va al final, y se olvidan los más viejos.
    const { [p.ruta]: _, ...otros } = usarEstado.getState().preferencias.filtrosBandeja
    const filas = Object.entries(clave === TODOS ? otros : { ...otros, [p.ruta]: clave })
    guardarPreferencias({ filtrosBandeja: Object.fromEntries(filas.slice(-PROYECTOS_CON_FILTRO)) })
  }
  const cuenta = <Cuenta n={p.preguntas.sinResponder} frenan={p.preguntas.frenan} />
  if (!datos)
    return (
      <>
        <Cabecera {...cabecera} cuenta={cuenta} />
        <Siluetas />
      </>
    )
  if (datos.tipo === 'error')
    return (
      <>
        <Cabecera {...cabecera} cuenta={cuenta} />
        <div className="pendientes">
          <div className="mensaje error" role="alert">
            <span className="senal rojo">
              <Icono nombre="error" />
              No se pudo leer
            </span>
            <h2>No puedo ver la bandeja de {p.nombre}</h2>
            <p>{datos.mensaje}</p>
            <div className="acc">
              <button
                type="button"
                className="boton secundario"
                onClick={() => void window.iridium.pendientes(p.ruta).then(ponerPendientes)}
              >
                <Icono nombre="reintentar" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </>
    )
  const filtros = filtrosPorFrente(datos.pendientes)
  // Si el frente elegido ya no tiene preguntas, vuelve a Todos.
  const elegido = filtros.some((f) => f.clave === filtro) ? filtro : TODOS
  const delFiltro = (x: PendienteVista) => elegido === TODOS || (x.frente ?? NUCLEO) === elegido
  const activas = datos.pendientes.filter((x) => !enPausa(x) && delFiltro(x))
  const pausadas = datos.pendientes.filter(enPausa)
  const vacia = datos.pendientes.length === pausadas.length
  return (
    <>
      <Cabecera
        {...cabecera}
        cuenta={cuenta}
        filtros={
          filtros.length > 0 && (
            <Filtros filtros={filtros} elegido={elegido} elegir={setFiltro} etiqueta="Filtrar por frente" />
          )
        }
        vacia={vacia && 'Nada en tu bandeja. Cuando la IA necesite algo de vos, aparece acá.'}
      />
      <div className="pendientes">
        {GRUPOS.map((g) => {
          const ps = activas.filter(g.de)
          if (ps.length === 0) return null
          return (
            <div key={g.titulo} className="grupo-pend">
              <h3 className="grupo">{g.titulo}</h3>
              {ps.map((x) => (
                <Pendiente key={x.codigo} ruta={p.ruta} p={x} abrirDoc={abrirDoc} />
              ))}
            </div>
          )
        })}
        {pausadas.length > 0 && (
          <details className="grupo-pend en-pausa">
            <summary className="grupo">
              En pausa <span className="n">{pausadas.length}</span>
            </summary>
            {pausadas.map((x) => (
              <Pendiente key={x.codigo} ruta={p.ruta} p={x} abrirDoc={abrirDoc} />
            ))}
          </details>
        )}
        {pie}
      </div>
    </>
  )
}
