// Los comandos con «/» en el compositor (frente Paridad, PA-1 y PA-6; maquetas `paridad-comandos.html` y
// `paridad-escondido.html`): la lista arriba del compositor, de su mismo ancho (PZ-8 en lista, `.arriba.ancho`), y la
// línea de un comando escondido escrito a mano. El foco se queda en el cuadro: las flechas las maneja la conversación.
import { Fragment, useEffect, useState } from 'react'
import {
  type CapacidadesMotor,
  type ComandoMotor,
  type GrupoComandos,
  lineaDeEscondido,
  type Pisa,
} from '../../../compartido/comandos'
import { Icono } from '../../ui/Icono'

/** Lo que sabe hacer el motor no cambia mientras Iridium está abierto: se pide una vez. */
let capacidades: Promise<CapacidadesMotor> | null = null

export function useCapacidades(): CapacidadesMotor | null {
  const [c, setC] = useState<CapacidadesMotor | null>(null)
  useEffect(() => {
    let vigente = true
    capacidades ??= window.iridium.capacidadesMotor().catch((e) => {
      capacidades = null
      throw e
    })
    void capacidades.then((r) => vigente && setC(r)).catch(() => {})
    return () => {
      vigente = false
    }
  }, [])
  return c
}

export type EstadoLista =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'lista'; comandos: ComandoMotor[]; recientes: string[] }

/**
 * La lista de «/» del proyecto, pedida al abrirse (la app la recuerda 10 minutos: abrirla de nuevo no cuesta). Si una
 * sesión descubre skills mientras trabaja, se pone al día sin cerrarse.
 */
export function useListaComandos(ruta: string, abierta: boolean): EstadoLista {
  const [estado, setEstado] = useState<EstadoLista>({ tipo: 'cargando' })
  useEffect(() => {
    if (!abierta) return
    let vigente = true
    void window.iridium
      .comandos(ruta)
      .then((r) => {
        if (!vigente) return
        setEstado(
          r.comandos ? { tipo: 'lista', comandos: r.comandos, recientes: r.recientes } : { tipo: 'error' },
        )
      })
      .catch(() => vigente && setEstado({ tipo: 'error' }))
    return () => {
      vigente = false
    }
  }, [ruta, abierta])
  useEffect(
    () =>
      window.iridium.alCambiarComandos((c) => {
        if (c.ruta !== ruta) return
        setEstado((antes) => ({
          tipo: 'lista',
          comandos: c.comandos,
          recientes: antes.tipo === 'lista' ? antes.recientes : [],
        }))
      }),
    [ruta],
  )
  return estado
}

/** El id de cada opción, para que el lector de pantalla siga la marcada sin sacar el foco del cuadro. */
export const idOpcion = (nombre: string) => `cmd-${nombre.replace(/[^\w-]/g, '_')}`

/** La lista de «/» abierta: los grupos ya filtrados, la opción marcada y qué hacer al elegir. */
export function ListaComandos({
  estado,
  grupos,
  consulta,
  marcado,
  alElegir,
  alMarcar,
}: {
  estado: EstadoLista
  grupos: GrupoComandos[]
  consulta: string
  marcado: string | null
  alElegir: (c: ComandoMotor) => void
  alMarcar: (nombre: string) => void
}) {
  // La marcada se ve aunque se haya bajado con las flechas más allá de los ocho renglones.
  useEffect(() => {
    if (marcado) document.getElementById(idOpcion(marcado))?.scrollIntoView({ block: 'nearest' })
  }, [marcado])
  const vacia =
    estado.tipo === 'cargando'
      ? 'Buscando los comandos…'
      : estado.tipo === 'error'
        ? 'No se pudieron leer los comandos'
        : grupos.every((g) => g.comandos.length === 0)
          ? `Ningún comando empieza con /${consulta}`
          : null
  return (
    <div
      id="lista-comandos"
      className="menu lista-menu comandos arriba ancho abierto"
      role="listbox"
      aria-label="Comandos"
    >
      {vacia ? (
        <p className="vacia">{vacia}</p>
      ) : (
        grupos.map((g) => (
          <Fragment key={g.titulo ?? 'todos'}>
            {g.titulo && <p className="titulo-menu">{g.titulo}</p>}
            {g.comandos.map((c) => (
              <button
                key={c.nombre}
                id={idOpcion(c.nombre)}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={c.nombre === marcado}
                className={c.nombre === marcado ? 'elegida' : undefined}
                // El foco se queda en el cuadro: el clic elige sin sacarlo.
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => c.nombre !== marcado && alMarcar(c.nombre)}
                onClick={() => alElegir(c)}
              >
                <span className="principal-fila">
                  <span className="titulo-fila">
                    <span className="nombre-cmd">/{c.nombre}</span>
                    {c.argumentos && <span className="arg">{c.argumentos}</span>}
                  </span>
                  <span className="detalle" title={c.descripcion}>
                    {c.descripcion}
                  </span>
                </span>
                {c.complemento && <span className="meta">{c.complemento}</span>}
              </button>
            ))}
          </Fragment>
        ))
      )}
    </div>
  )
}

/** La línea de un comando escondido escrito a mano (Q-246, D-168): dónde está eso en Iridium y su botón, si hay. */
export function LineaEscondido({
  nombre,
  pisa,
  nueva,
}: {
  nombre: string
  pisa: Pisa
  nueva: (() => void) | null
}) {
  const linea = lineaDeEscondido(pisa)
  return (
    <div className="linea-cmd" role="note">
      <Icono nombre="info" />
      <span>
        <code>/{nombre}</code>: {linea.texto}
        {linea.boton === 'nueva' && !nueva && ' Nueva'}
      </span>
      {linea.boton === 'nueva' && nueva && (
        <button type="button" className="boton sin-fondo chico" onClick={nueva}>
          Nueva
        </button>
      )}
    </div>
  )
}
