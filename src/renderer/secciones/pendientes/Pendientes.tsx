// La Bandeja de entrada (H-9, F-3, 04-ux.md › W-5): la columna de proyectos que esperan algo, todas las preguntas del
// elegido con lo que citan, filtros por frente y las en pausa al final y, con «Ver entero», el documento en un panel a
// la derecha. Lo escrito vive en el estado de la ventana (no se pierde al cambiar de proyecto ni de filtro); se guarda
// en el disco solo con Enviar o Guardar a medias.
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import type { PendienteVista, TarjetaProyecto } from '../../../compartido/puente'
import { columnaPendientes, fichaDe, usarEstado } from '../../estado'
import { Cuenta } from '../../ui/Cuenta'
import { Icono } from '../../ui/Icono'
import { textoHito } from '../proyectos/Tarjeta'
import { enPausa, filtrosPorFrente, NUCLEO, TODOS } from './filtros'
import { type Destino, PanelDocumento } from './PanelDocumento'
import { Pendiente } from './Pendiente'

function IconoProyecto({ p }: { p: TarjetaProyecto }) {
  if (p.icono) return <img className="ico-proy" src={p.icono} alt="" />
  return (
    <span className="ico-proy sin-icono" aria-hidden="true">
      {p.inicial}
    </span>
  )
}

function Columna({
  actual,
  elegir,
  conError,
}: {
  actual: string | null
  elegir: (ruta: string) => void
  conError: ReadonlySet<string>
}) {
  const lista = usarEstado((s) => s.lista)
  const { conPendientes, respondidas } = columnaPendientes(lista)
  const total = conPendientes.reduce((n, p) => n + p.preguntas.sinResponder, 0)
  const fila = (p: TarjetaProyecto, tipo: 'pendientes' | 'respondidas') => {
    const { sinResponder, frenan, respondidas: r } = p.preguntas
    let cuenta: ReactNode = <Cuenta n={sinResponder} frenan={frenan} />
    if (conError.has(p.ruta))
      cuenta = (
        <span className="cuenta error">
          <Icono nombre="error" />
          Error
        </span>
      )
    else if (tipo === 'respondidas')
      cuenta = (
        <span className="cuenta ok" title="Respondidas, sin procesar">
          <Icono nombre="check" />
          {r}
        </span>
      )
    return (
      <button
        key={p.ruta}
        type="button"
        className="proy"
        aria-current={p.ruta === actual}
        onClick={() => elegir(p.ruta)}
      >
        <IconoProyecto p={p} />
        <span className="nom" title={p.nombre}>
          {p.nombre}
        </span>
        {cuenta}
      </button>
    )
  }
  return (
    <nav className="columna" aria-label="Proyectos con algo en la bandeja">
      <div className="titulo">
        <h1>Bandeja de entrada</h1>
        <span className="n">{total}</span>
      </div>
      <div className="lista">
        {conPendientes.map((p) => fila(p, 'pendientes'))}
        {respondidas.length > 0 && (
          <>
            <div className="seccion">Respondidas, sin procesar</div>
            {respondidas.map((p) => fila(p, 'respondidas'))}
          </>
        )}
      </div>
      <div className="leyenda">
        <span className="frena">
          <span className="cuenta-bandeja frena" aria-hidden="true" />
          <span>frena el proyecto</span>
        </span>
        <span className="ok">
          <Icono nombre="check" />
          <span>respondidas; la IA todavía no las leyó</span>
        </span>
      </div>
    </nav>
  )
}

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

function Proyecto({ p, abrirDoc }: { p: TarjetaProyecto; abrirDoc: (d: Destino) => void }) {
  const ficha = usarEstado((s) => fichaDe(s.fichas, p.ruta))
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const n = p.preguntas.sinResponder
  const cabecera = (
    <div className="cab-proy">
      <IconoProyecto p={p} />
      <h2 title={p.nombre}>{p.nombre}</h2>
      <Cuenta n={n} frenan={p.preguntas.frenan} />
      {p.hito && <span className="hito">{textoHito(p.hito)}</span>}
      <div className="der">
        <button type="button" className="btn secundario" onClick={() => abrirProyecto(p.ruta)}>
          <Icono nombre="abrir" />
          Abrir
        </button>
        {ficha?.estado === 'trabajando' ? (
          <span className="chip trab">
            <Icono nombre="sync" gira />
            La IA trabaja
          </span>
        ) : (
          <button
            type="button"
            className={n === 0 ? 'btn secundario resaltado' : 'btn secundario'}
            title="Arranca la sesión del proyecto sin abrirlo"
            onClick={() => void window.iridium.seguir(p.ruta, {})}
          >
            <Icono nombre="play" />
            Seguí
          </button>
        )}
      </div>
    </div>
  )

  return (
    <section className="principal-pend">
      {cabecera}
      <ListaPendientes p={p} abrirDoc={abrirDoc} />
    </section>
  )
}

/** Los pendientes de un proyecto en los grupos de W-5; también dentro del proyecto (D-043). */
export function ListaPendientes({
  p,
  abrirDoc,
  pie,
}: {
  p: TarjetaProyecto
  abrirDoc: (d: Destino) => void
  /** Lo que va después de los pendientes, en el mismo desplazamiento (los scripts, en la vista de entrada). */
  pie?: ReactNode
}) {
  const datos = usarEstado((s) => s.pendientes[p.ruta])
  const ponerPendientes = usarEstado((s) => s.ponerPendientes)
  const [filtro, setFiltro] = useState(TODOS)
  if (!datos) return <Siluetas />
  if (datos.tipo === 'error')
    return (
      <div className="pendientes">
        <div className="mensaje error" role="alert">
          <span className="chip error">
            <Icono nombre="error" />
            No se pudo leer
          </span>
          <h2>No puedo ver la bandeja de {p.nombre}</h2>
          <p>{datos.mensaje}</p>
          <div className="acc">
            <button
              type="button"
              className="btn secundario"
              onClick={() => void window.iridium.pendientes(p.ruta).then(ponerPendientes)}
            >
              <Icono nombre="reintentar" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  const filtros = filtrosPorFrente(datos.pendientes)
  // Si el frente elegido ya no tiene preguntas, vuelve a Todos.
  const elegido = filtros.some((f) => f.clave === filtro) ? filtro : TODOS
  const delFiltro = (x: PendienteVista) => elegido === TODOS || (x.frente ?? NUCLEO) === elegido
  const activas = datos.pendientes.filter((x) => !enPausa(x) && delFiltro(x))
  const pausadas = datos.pendientes.filter(enPausa)
  return (
    <div className="pendientes">
      {filtros.length > 0 && (
        <fieldset className="filtros" aria-label="Filtrar por frente">
          {filtros.map((f) => (
            <button
              key={f.clave}
              type="button"
              className={f.clave === elegido ? 'filtro sel' : 'filtro'}
              aria-pressed={f.clave === elegido}
              onClick={() => setFiltro(f.clave)}
            >
              {f.nombre} <span className="n">{f.n}</span>
            </button>
          ))}
        </fieldset>
      )}
      {datos.pendientes.length === pausadas.length && (
        <div className="mensaje" role="status">
          <h2>Nada en tu bandeja</h2>
          <p>Cuando la IA necesite algo de vos, aparece acá.</p>
        </div>
      )}
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
  )
}

export function Pendientes() {
  const lista = usarEstado((s) => s.lista)
  const elegido = usarEstado((s) => s.pendientesDe)
  const todos = usarEstado((s) => s.pendientes)
  const ponerPendientes = usarEstado((s) => s.ponerPendientes)
  const irAPendientes = usarEstado((s) => s.irAPendientes)
  const irA = usarEstado((s) => s.irA)
  const [doc, setDoc] = useState<Destino | null>(null)

  const { conPendientes, respondidas } = columnaPendientes(lista)
  const enColumna = [...conPendientes, ...respondidas]
  // El elegido, si sigue en la columna (o se llegó a él desde un proyecto); si no, el primero.
  const tarjeta =
    (lista?.tipo === 'lista' ? lista.proyectos.find((p) => p.ruta === elegido) : undefined) ?? enColumna[0]
  const actual = tarjeta?.ruta ?? null
  const conError = new Set(
    Object.values(todos)
      .filter((x) => x.tipo === 'error')
      .map((x) => x.ruta),
  )

  // El elegido queda fijo: al responder, la columna se reordena, pero la vista no salta a otro proyecto (F-3).
  useEffect(() => {
    if (actual && actual !== elegido) irAPendientes(actual)
  }, [actual, elegido, irAPendientes])

  // Se relee cada vez que cambia la lista: la vigilancia avisa cuando cambia un `estado.md` o una respuesta.
  useEffect(() => {
    if (!actual || !lista) return
    let vigente = true
    void window.iridium.pendientes(actual).then((p) => {
      if (vigente) ponerPendientes(p)
    })
    return () => {
      vigente = false
    }
  }, [actual, lista, ponerPendientes])

  const elegir = useCallback(
    (ruta: string) => {
      setDoc(null)
      irAPendientes(ruta)
    },
    [irAPendientes],
  )

  if (!lista)
    return (
      <main className="trabajo">
        <div className="pend-vista">
          <nav className="columna" aria-label="Proyectos con algo en la bandeja">
            <div className="titulo">
              <h1>Bandeja de entrada</h1>
            </div>
            <div className="lista carga" aria-busy="true">
              {[70, 55, 80].map((w) => (
                <div key={w} className="proy-silueta">
                  <span className="linea-silueta" style={{ width: 20, height: 20, borderRadius: 5 }} />
                  <span className="linea-silueta" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          </nav>
          <section className="principal-pend">
            <Siluetas />
          </section>
        </div>
      </main>
    )

  if (!tarjeta)
    return (
      <main className="trabajo">
        <div className="pendientes">
          <div className="mensaje" role="status">
            <span className="chip ok">
              <Icono nombre="check" />
              Al día
            </span>
            <h2>Nada en tu bandeja</h2>
            <p>Cuando la IA necesite algo de vos, aparece acá.</p>
            <div className="acc">
              <button type="button" className="btn secundario" onClick={() => irA('proyectos')}>
                <Icono nombre="proyectos" />
                Ir a Proyectos
              </button>
            </div>
          </div>
        </div>
      </main>
    )

  return (
    <main className="trabajo">
      <div className="pend-vista">
        <Columna actual={actual} elegir={elegir} conError={conError} />
        <Proyecto key={tarjeta.ruta} p={tarjeta} abrirDoc={setDoc} />
        {doc && (
          <PanelDocumento ruta={tarjeta.ruta} destino={doc} navegar={setDoc} cerrar={() => setDoc(null)} />
        )}
      </div>
    </main>
  )
}
