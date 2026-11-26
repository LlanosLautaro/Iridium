// Skills › Framework (04-ux.md › W-13, H-20): qué proyectos siguen el framework. Los de afuera primero (framework
// viejo o con avisos del control), después los que tienen novedades, las carpetas simples y al final los que están al
// día. Cada uno de afuera (y cada carpeta) con **Actualizar** (F-9, OR-8), que abre el proyecto con el pedido citado en
// una conversación nueva, sin enviar (D-196, T-139); mientras trabaja, «Actualizando…» y Ver la conversación. Los
// avisos de uno se despliegan en su fila (T-48).
// DI-I3, tanda 9: cada proyecto es una Fila con su acción a la vista y la que tiene avisos se abre en su lugar (PZ-13).
// T-64 (D-118, Q-311): «N novedades» junto a la fecha abre la lista (la fecha, qué cambió y qué le pide) y **Ponerse
// al día** cita el pedido como Actualizar; el filtro Con novedades.
import { type ReactNode, useState } from 'react'
import {
  cuentaNovedades,
  type EstadoFramework,
  fueraDelFramework,
  novedadesDe,
  type ProyectoFramework,
  textoParaMirar,
} from '../../../compartido/skills'
import { fichaDe, usarEstado } from '../../estado'
import { Cabecera, Filtros } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'

type Filtro = 'todos' | 'novedades' | 'fuera' | 'carpetas'

/** Lo que antes era la nota fija debajo de la lista, como Información a pedido (R-41). */
const AYUDA =
  'Actualizar y Ponerse al día abren el proyecto con el pedido citado en una conversación nueva: lo mandas tú. Las ' +
  'novedades son cambios del framework que le piden algo al proyecto desde su fecha. Las carpetas simples no cuentan ' +
  'como fuera: se ven y se conversan igual.'

function IconoProyecto({ p }: { p: ProyectoFramework }) {
  return (
    <span className="icono-fila" aria-hidden="true">
      {p.icono ? <img src={p.icono} alt="" /> : p.inicial}
    </span>
  )
}

/**
 * Cómo está, en palabras (W-13): «framework viejo · 2026-10-20», «2 avisos del framework», «al día · 2026-11-06»; con
 * novedades (T-64), «framework del 2026-11-08» (las novedades van al lado, en su botón).
 */
export function textoEstado(e: EstadoFramework): string {
  if (e.tipo === 'carpeta') return 'carpeta simple'
  if (e.tipo === 'viejo') return `framework viejo · ${e.fecha ?? 'sin fecha'}`
  if (e.tipo === 'avisos')
    return e.avisos.length === 1 ? '1 aviso del framework' : `${e.avisos.length} avisos del framework`
  if (novedadesDe(e).length > 0) return `framework del ${e.fecha ?? 'sin fecha'}`
  return `al día${e.fecha ? ` · ${e.fecha}` : ''}`
}

function Fila({ p }: { p: ProyectoFramework }) {
  const ficha = usarEstado((s) => fichaDe(s.fichas, p.ruta))
  const vista = usarEstado((s) => s.skills)
  const cambiarSkills = usarEstado((s) => s.cambiarSkills)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const citarPasarAlFramework = usarEstado((s) => s.citarPasarAlFramework)
  const citarPonerseAlDia = usarEstado((s) => s.citarPonerseAlDia)
  const trabajando = ficha?.estado === 'trabajando'
  const loMande = vista.enviados.includes(p.ruta)
  const e = p.estado
  const novedades = novedadesDe(e)
  const abierto = (e.tipo === 'avisos' || novedades.length > 0) && vista.avisosDe === p.ruta
  const alternar = () => cambiarSkills({ avisosDe: abierto ? null : p.ruta })

  let accion: ReactNode = null
  if (e.tipo === 'al-dia' && novedades.length === 0) accion = null
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
        {e.tipo === 'al-dia' ? 'Ponerse al día' : 'Actualizar'}
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
        {novedades.length > 0 && (
          <button
            type="button"
            className="boton sin-fondo chico"
            title="Abre el proyecto con el pedido citado en una conversación nueva, sin enviar (D-196)"
            onClick={() => citarPonerseAlDia(p.ruta, novedades)}
          >
            Ponerse al día
          </button>
        )}
        {e.tipo !== 'al-dia' && (
          <button
            type="button"
            className="boton sin-fondo chico"
            title="Abre el proyecto con el pedido citado en una conversación nueva, sin enviar (D-196)"
            onClick={() => citarPasarAlFramework(p.ruta)}
          >
            Actualizar
          </button>
        )}
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
                onClick={alternar}
              >
                {textoEstado(e)}
              </button>
            ) : (
              textoEstado(e)
            )}
            {novedades.length > 0 && (
              <>
                {' · '}
                <button
                  type="button"
                  className="sk-ver-avisos senal blanco"
                  aria-expanded={abierto}
                  onClick={alternar}
                >
                  {cuentaNovedades(novedades.length)}
                </button>
              </>
            )}
          </span>
        </span>
        {accion && <span className="acciones siempre">{accion}</span>}
      </li>
      {abierto && (
        <li className="cuerpo-fila">
          {e.tipo === 'avisos' && (
            <ul className="sk-lista-avisos">
              {e.avisos.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
          {novedades.length > 0 && (
            <ul className="sk-novedades" aria-label="Novedades del framework">
              {novedades.map((n) => (
                <li key={`${n.fecha} ${n.titulo}`}>
                  <span className="fecha">{n.fecha}</span>
                  <div className="que">{n.titulo}</div>
                  <p>{textoParaMirar(n.texto)}</p>
                </li>
              ))}
            </ul>
          )}
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
  const conNovedades = lista.filter((p) => novedadesDe(p.estado).length > 0)
  const filtros = [
    { clave: 'todos', nombre: 'Todos', n: lista.length },
    ...(conNovedades.length > 0
      ? [{ clave: 'novedades', nombre: 'Con novedades', n: conNovedades.length }]
      : []),
    ...(fuera.length > 0 ? [{ clave: 'fuera', nombre: 'Fuera del framework', n: fuera.length }] : []),
    ...(carpetas.length > 0 ? [{ clave: 'carpetas', nombre: 'Carpetas', n: carpetas.length }] : []),
  ]
  // Si el filtro elegido se quedó sin nada (se pasaron todos), se vuelve a Todos.
  const elegido = filtros.some((f) => f.clave === filtro) ? filtro : 'todos'
  const porFiltro: Record<Filtro, ProyectoFramework[]> = {
    todos: lista,
    novedades: conNovedades,
    fuera,
    carpetas,
  }
  const vistos = porFiltro[elegido as Filtro]
  const resumen = [
    fuera.length > 0 && `${fuera.length} fuera`,
    conNovedades.length > 0 && `${conNovedades.length} con novedades`,
  ]
    .filter(Boolean)
    .join(' · ')
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
        sub={proyectos === null ? 'Leyendo los proyectos…' : resumen || null}
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
