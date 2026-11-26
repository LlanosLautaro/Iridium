// Skills › Framework (04-ux.md › W-13, H-20): qué proyectos siguen el framework. Los de afuera primero (framework
// viejo o con avisos del control), después las carpetas simples y al final los que están al día. Cada uno de afuera
// (y cada carpeta) con **Actualizar** (F-9, OR-8), que abre el proyecto con el pedido citado en una conversación nueva,
// sin enviar (D-196, T-139); mientras trabaja, «Actualizando…» y Ver la conversación. Los avisos de uno se despliegan en su fila (T-48).
// DI-I3, tanda 9: cada proyecto es una Fila con su acción a la vista y la que tiene avisos se abre en su lugar (PZ-13).
import { type ReactNode, useState } from 'react'
import { type EstadoFramework, fueraDelFramework, type ProyectoFramework } from '../../../compartido/skills'
import { fichaDe, usarEstado } from '../../estado'
import { Cabecera, Filtros } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'

type Filtro = 'todos' | 'fuera' | 'carpetas'

/** Lo que antes era la nota fija debajo de la lista, como Información a pedido (R-41). */
const AYUDA =
  'Actualizar abre el proyecto con el pedido citado en una conversación nueva: lo mandas tú. Las carpetas simples no ' +
  'cuentan como fuera: se ven y se conversan igual.'

function IconoProyecto({ p }: { p: ProyectoFramework }) {
  return (
    <span className="icono-fila" aria-hidden="true">
      {p.icono ? <img src={p.icono} alt="" /> : p.inicial}
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
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const citarPasarAlFramework = usarEstado((s) => s.citarPasarAlFramework)
  const trabajando = ficha?.estado === 'trabajando'
  const loMande = vista.enviados.includes(p.ruta)
  const e = p.estado
  const abierto = e.tipo === 'avisos' && vista.avisosDe === p.ruta

  let accion: ReactNode = null
  if (e.tipo === 'al-dia') accion = null
  else if (trabajando && loMande)
    accion = (
      <>
        <span className="senal">
          <Icono nombre="sync" gira />
          Actualizando…
        </span>
        <button type="button" className="boton sin-fondo chico" onClick={() => abrirProyecto(p.ruta)}>
          Ver la conversación
        </button>
      </>
    )
  else if (trabajando)
    accion = (
      <button type="button" className="boton sin-fondo chico" disabled title="Su IA está trabajando">
        Actualizar
      </button>
    )
  else
    accion = (
      <>
        {loMande && ficha?.estado === 'error' && (
          <button type="button" className="boton sin-fondo chico" onClick={() => abrirProyecto(p.ruta)}>
            <Icono nombre="error" />
            Ver el error
          </button>
        )}
        <button
          type="button"
          className="boton sin-fondo chico"
          title="Abre el proyecto con el pedido citado en una conversación nueva, sin enviar (D-196)"
          onClick={() => citarPasarAlFramework(p.ruta)}
        >
          Actualizar
        </button>
      </>
    )

  return (
    <>
      <li className={abierto ? 'fila con-detalle abierta' : 'fila con-detalle'} data-proyecto={p.nombre}>
        <IconoProyecto p={p} />
        <span className="principal-fila">
          <span className="titulo-fila" title={p.nombre}>
            {p.nombre}
          </span>
          <span className="detalle">
            {e.tipo === 'avisos' ? (
              <button
                type="button"
                className="sk-ver-avisos senal rojo"
                aria-expanded={abierto}
                onClick={() => cambiarSkills({ avisosDe: abierto ? null : p.ruta })}
              >
                {textoEstado(e)}
              </button>
            ) : (
              textoEstado(e)
            )}
          </span>
        </span>
        {accion && <span className="acciones siempre">{accion}</span>}
      </li>
      {abierto && (
        <li className="cuerpo-fila">
          <ul className="sk-lista-avisos">
            {e.avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </li>
      )}
    </>
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
    <section className="sk-detalle" aria-label="Framework">
      <Cabecera
        titulo="Framework"
        acciones={
          lista.length > 0 && (
            <button type="button" className="info" aria-label={AYUDA}>
              <Icono nombre="duda" />
              <span className="globo" aria-hidden="true">
                {AYUDA}
              </span>
            </button>
          )
        }
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
      <div className="sk-cuerpo">
        {proyectos !== null && fuera.length === 0 && (
          <p className="senal sk-todos">
            <Icono nombre="check" />
            Todos los proyectos siguen el framework.
          </p>
        )}
        {vistos.length > 0 && (
          <ul className="filas con-lineas sk-proyectos" aria-label="Proyectos">
            {vistos.map((p) => (
              <Fila key={p.ruta} p={p} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
