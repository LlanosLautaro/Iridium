// Skills › Framework (04-ux.md › W-13, H-20): qué proyectos siguen el framework. Los de afuera primero (framework
// viejo o con avisos del control), después las carpetas simples y al final los que están al día. Cada uno de afuera
// (y cada carpeta) con **Pasar al framework** (F-9, OR-8), que manda el pedido a su conversación sin salir de acá;
// mientras trabaja, «Pasando al framework…» y Ver la conversación. Los avisos de uno se despliegan en su fila (T-48).
import { type ReactNode, useState } from 'react'
import {
  type EstadoFramework,
  fueraDelFramework,
  MENSAJE_PASAR_AL_FRAMEWORK,
  type ProyectoFramework,
} from '../../../compartido/skills'
import { fichaDe, usarEstado } from '../../estado'
import { Cabecera, Filtros } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'

type Filtro = 'todos' | 'fuera' | 'carpetas'

function IconoProyecto({ p }: { p: ProyectoFramework }) {
  if (p.icono) return <img className="ico-proy" src={p.icono} alt="" />
  return (
    <span className="ico-proy sin-icono" aria-hidden="true">
      {p.inicial}
    </span>
  )
}

/** Cómo está, en palabras (W-13): «framework viejo · 2026-10-20», «2 avisos del framework», «al día · 2026-11-06». */
export function textoEstado(e: EstadoFramework): string {
  if (e.tipo === 'carpeta') return 'carpeta simple'
  if (e.tipo === 'viejo') return `framework viejo · ${e.fecha ?? 'sin fecha'}`
  if (e.tipo === 'avisos')
    return e.avisos.length === 1 ? '1 aviso del framework' : `${e.avisos.length} avisos del framework`
  return `al día${e.fecha ? ` · ${e.fecha}` : ''}`
}

function Fila({ p }: { p: ProyectoFramework }) {
  const ficha = usarEstado((s) => fichaDe(s.fichas, p.ruta))
  const vista = usarEstado((s) => s.skills)
  const cambiarSkills = usarEstado((s) => s.cambiarSkills)
  const motor = usarEstado((s) => s.motor)
  const escribir = usarEstado((s) => s.escribir)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const [mandando, setMandando] = useState(false)
  const [nota, setNota] = useState<string | null>(null)
  const trabajando = ficha?.estado === 'trabajando'
  const loMande = vista.enviados.includes(p.ruta)
  const e = p.estado
  const abierto = e.tipo === 'avisos' && vista.avisosDe === p.ruta

  const pasar = async () => {
    setNota(null)
    // Sin Claude Code (F-5) el pedido no sale: queda escrito en el cuadro de su conversación para mandarlo después.
    if (motor.tipo === 'sin-sesion' || motor.tipo === 'falla') {
      escribir(p.ruta, MENSAJE_PASAR_AL_FRAMEWORK)
      setNota('Claude no está disponible: el pedido quedó escrito en su conversación.')
      return
    }
    setMandando(true)
    try {
      await window.iridium.pasarAlFramework(p.ruta)
      cambiarSkills({ enviados: [...vista.enviados.filter((r) => r !== p.ruta), p.ruta] })
    } catch {
      setNota('No se pudo mandar el pedido.')
    } finally {
      setMandando(false)
    }
  }

  let accion: ReactNode = null
  if (e.tipo === 'al-dia') accion = null
  else if (trabajando && (loMande || mandando))
    accion = (
      <>
        <span className="chip trab">
          <Icono nombre="sync" gira />
          Pasando al framework…
        </span>
        <button type="button" className="boton secundario chico" onClick={() => abrirProyecto(p.ruta)}>
          Ver la conversación
        </button>
      </>
    )
  else if (trabajando)
    accion = (
      <button type="button" className="boton secundario chico" disabled title="Su IA está trabajando">
        Pasar al framework
      </button>
    )
  else
    accion = (
      <>
        {loMande && ficha?.estado === 'error' && (
          <button type="button" className="boton secundario chico" onClick={() => abrirProyecto(p.ruta)}>
            <Icono nombre="error" />
            Ver el error
          </button>
        )}
        <button
          type="button"
          className="boton secundario chico"
          disabled={mandando}
          title="Le manda el pedido a la IA de este proyecto: gasta uso"
          onClick={() => void pasar()}
        >
          Pasar al framework
        </button>
      </>
    )

  return (
    <li className="sk-proy" data-proyecto={p.nombre}>
      <div className="sk-proy-fila">
        <IconoProyecto p={p} />
        <div className="datos">
          <b title={p.nombre}>{p.nombre}</b>
          {e.tipo === 'avisos' ? (
            <button
              type="button"
              className="sk-avisos"
              aria-expanded={abierto}
              onClick={() => cambiarSkills({ avisosDe: abierto ? null : p.ruta })}
            >
              <span className="aviso-punto" aria-hidden="true">
                !
              </span>
              {textoEstado(e)}
            </button>
          ) : (
            <span className={`sk-estado ${e.tipo}`}>{textoEstado(e)}</span>
          )}
          {nota && (
            <span className="sk-falla" role="status">
              {nota}
            </span>
          )}
        </div>
        <div className="acc">{accion}</div>
      </div>
      {abierto && (
        <ul className="sk-lista-avisos">
          {e.avisos.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function Framework({ proyectos }: { proyectos: ProyectoFramework[] | null }) {
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const lista = proyectos ?? []
  const fuera = lista.filter((p) => fueraDelFramework(p.estado))
  const carpetas = lista.filter((p) => p.estado.tipo === 'carpeta')
  const filtros = [
    { clave: 'todos', nombre: 'Todos', n: lista.length },
    ...(fuera.length > 0 ? [{ clave: 'fuera', nombre: 'Fuera del framework', n: fuera.length }] : []),
    ...(carpetas.length > 0 ? [{ clave: 'carpetas', nombre: 'Carpetas', n: carpetas.length }] : []),
  ]
  // Si el filtro elegido se quedó sin nada (se pasaron todos), se vuelve a Todos.
  const elegido = filtros.some((f) => f.clave === filtro) ? filtro : 'todos'
  const vistos = elegido === 'fuera' ? fuera : elegido === 'carpetas' ? carpetas : lista
  return (
    <section className="sk-detalle sk-framework-detalle" aria-label="Framework">
      <Cabecera
        titulo="Framework"
        sub={
          proyectos === null ? 'Leyendo los proyectos…' : fuera.length > 0 ? `${fuera.length} fuera` : null
        }
        filtros={
          lista.length > 0 && (
            <Filtros
              filtros={filtros}
              elegido={elegido}
              elegir={(c) => setFiltro(c as Filtro)}
              etiqueta="Filtrar los proyectos"
            />
          )
        }
      />
      <div className="cuerpo">
        {proyectos !== null && fuera.length === 0 && (
          <p className="sk-todos">
            <Icono nombre="check" />
            Todos los proyectos siguen el framework.
          </p>
        )}
        {vistos.length > 0 && (
          <>
            <ul className="sk-proyectos">
              {vistos.map((p) => (
                <Fila key={p.ruta} p={p} />
              ))}
            </ul>
            <p className="sk-nota">
              Pasar al framework manda el pedido a la conversación de cada proyecto; seguís acá. Las carpetas
              simples no cuentan como fuera: se ven y se conversan igual.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
