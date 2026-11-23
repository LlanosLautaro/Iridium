// Los pendientes de un proyecto (H-9, F-3, 04-ux.md › W-5), en su Bandeja de entrada (D-043): todas sus preguntas con
// lo que citan, en Bloques (PZ-3) con su cuenta, la más nueva arriba (R-104), filtros por frente y las en pausa al final. Sin la Bandeja de todos (D-111): lo que espera de cada
// proyecto se ve en el suyo y, desde la grilla, en la cuenta de su tarjeta. Lo escrito vive en el estado de la ventana
// (no se pierde al cambiar de proyecto ni de filtro) y se guarda a medias solo (R-3). El frente elegido se recuerda
// por proyecto en `config.json`: queda al cambiar de proyecto y al cerrar Iridium (R-55).
import { type ReactNode, useEffect } from 'react'
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

const GRUPOS: { titulo: string; frenan?: boolean; de: (p: PendienteVista) => boolean }[] = [
  { titulo: 'Frenan el proyecto', frenan: true, de: (p) => p.estado === 'sin-responder' && p.frena },
  { titulo: 'Sin responder', de: (p) => p.estado === 'sin-responder' && !p.frena },
  { titulo: 'A medias', de: (p) => p.estado === 'a-medias' },
  { titulo: 'Respondidas, sin procesar', de: (p) => p.estado === 'respondida' },
]

function Siluetas() {
  return (
    <div className="pendientes carga" role="status" aria-busy="true" aria-label="Cargando pendientes">
      {[1, 2].map((n) => (
        <div key={n} className="silueta-pregunta">
          <span className="linea-silueta" style={{ width: '30%' }} />
          <span className="linea-silueta" style={{ width: '80%', height: 14 }} />
          <span className="linea-silueta" style={{ height: 48 }} />
        </div>
      ))}
    </div>
  )
}

/** El número de una pregunta, para poner la más nueva arriba (R-104). */
const numero = (x: PendienteVista) => Number(/\d+/.exec(x.codigo)?.[0] ?? 0)
const masNuevaPrimero = (a: PendienteVista, b: PendienteVista) => numero(b) - numero(a)

/**
 * Lee los pendientes de un proyecto y los vuelve a leer cada vez que cambia la lista: la vigilancia avisa cuando
 * cambia un `estado.md` o una respuesta. Los usan la Bandeja y Frentes (R-105).
 */
export function useLeerPendientes(ruta: string): void {
  const lista = usarEstado((s) => s.lista)
  const ponerPendientes = usarEstado((s) => s.ponerPendientes)
  useEffect(() => {
    if (!lista) return
    let vigente = true
    void window.iridium.pendientes(ruta).then((x) => {
      if (vigente) ponerPendientes(x)
    })
    return () => {
      vigente = false
    }
  }, [ruta, lista, ponerPendientes])
}

/** Los pendientes de un proyecto en los grupos de W-5; también dentro del proyecto (D-043). */
export function ListaPendientes({
  p,
  abrirDoc,
  cabecera,
}: {
  p: TarjetaProyecto
  abrirDoc: (d: Destino) => void
  /** La cabecera de la sección (W-9): la cuenta y los filtros por frente los pone la lista. */
  cabecera: { titulo: string; icono?: ReactNode; sub?: ReactNode; acciones?: ReactNode }
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
          <div className="recuadro error" role="alert">
            <Icono nombre="error" />
            <div className="cuerpo-recuadro">
              <strong>No se puede ver la bandeja de {p.nombre}</strong>
              <span>{datos.mensaje}</span>
              <div className="acciones-recuadro">
                <button
                  type="button"
                  className="boton secundario chico"
                  onClick={() => void window.iridium.pendientes(p.ruta).then(ponerPendientes)}
                >
                  <Icono nombre="reintentar" />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  const filtros = filtrosPorFrente(datos.pendientes)
  // Si el frente elegido ya no tiene preguntas, vuelve a Todos.
  const elegido = filtros.some((f) => f.clave === filtro) ? filtro : TODOS
  const delFiltro = (x: PendienteVista) => elegido === TODOS || (x.frente ?? NUCLEO) === elegido
  const activas = datos.pendientes.filter((x) => !enPausa(x) && delFiltro(x)).sort(masNuevaPrimero)
  const pausadas = datos.pendientes.filter(enPausa).sort(masNuevaPrimero)
  const vacia = datos.pendientes.length === pausadas.length
  const grupos = GRUPOS.map((g) => ({ ...g, ps: activas.filter(g.de) })).filter((g) => g.ps.length > 0)
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
      />
      <div className="pendientes">
        {/* Vacía, en la misma columna que las preguntas, como el vacío de Revisión (T-108) */}
        {vacia && (
          <div className="recuadro vacio">
            <strong>Nada en tu bandeja</strong>
            <span>Cuando la IA necesite algo de ti, aparece aquí.</span>
          </div>
        )}
        {grupos.map((g) => (
          <section key={g.titulo} className="bloque grupo-q" aria-label={g.titulo}>
            <h2 className="bloque-titulo">
              {g.titulo} <span className={g.frenan ? 'cuenta frena' : 'cuenta'}>{g.ps.length}</span>
            </h2>
            <div className="preguntas">
              {g.ps.map((x) => (
                <Pendiente key={x.codigo} ruta={p.ruta} p={x} abrirDoc={abrirDoc} />
              ))}
            </div>
          </section>
        ))}
        {pausadas.length > 0 && (
          <details className="grupo-q en-pausa">
            <summary className="bloque-titulo">
              <Icono nombre="chev" />
              En pausa <span className="cuenta">{pausadas.length}</span>
            </summary>
            <div className="preguntas">
              {pausadas.map((x) => (
                <Pendiente key={x.codigo} ruta={p.ruta} p={x} abrirDoc={abrirDoc} />
              ))}
            </div>
          </details>
        )}
      </div>
    </>
  )
}
