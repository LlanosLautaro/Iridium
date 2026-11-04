// Los proyectos con un formato viejo de la guía (SK-4, D-068): cada uno con Poner al día, que manda el pedido a su
// conversación sin salir de Skills; mientras trabaja, ● trabajando y Ver la conversación.
import { useState } from 'react'
import {
  type Atrasados as DatosAtrasados,
  MENSAJE_PONER_AL_DIA,
  type ProyectoAtrasado,
} from '../../../compartido/skills'
import { fichaDe, usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import { fechaLarga, textoFormato } from './textos'

function IconoProyecto({ p }: { p: ProyectoAtrasado }) {
  if (p.icono) return <img className="ico-proy" src={p.icono} alt="" />
  return (
    <span className="ico-proy sin-icono" aria-hidden="true">
      {p.inicial}
    </span>
  )
}

function Fila({ p }: { p: ProyectoAtrasado }) {
  const ficha = usarEstado((s) => fichaDe(s.fichas, p.ruta))
  const enviados = usarEstado((s) => s.skills.enviados)
  const cambiarSkills = usarEstado((s) => s.cambiarSkills)
  const motor = usarEstado((s) => s.motor)
  const escribir = usarEstado((s) => s.escribir)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const [mandando, setMandando] = useState(false)
  const [nota, setNota] = useState<string | null>(null)
  const trabajando = ficha?.estado === 'trabajando'
  const loMande = enviados.includes(p.ruta)

  const ponerAlDia = async () => {
    setNota(null)
    // Sin Claude Code (F-5) el pedido no sale: queda escrito en el cuadro de su conversación para mandarlo después.
    if (motor.tipo === 'sin-sesion' || motor.tipo === 'falla') {
      escribir(p.ruta, MENSAJE_PONER_AL_DIA)
      setNota('Claude no está disponible: el pedido quedó escrito en su conversación.')
      return
    }
    setMandando(true)
    try {
      await window.iridium.ponerAlDia(p.ruta)
      cambiarSkills({ enviados: [...enviados.filter((r) => r !== p.ruta), p.ruta] })
    } catch {
      setNota('No se pudo mandar el pedido.')
    } finally {
      setMandando(false)
    }
  }

  let estado: React.ReactNode
  if (trabajando && (loMande || mandando))
    estado = (
      <>
        <span className="chip trab">
          <Icono nombre="punto" />
          trabajando
        </span>
        <button type="button" className="btn secundario chico" onClick={() => abrirProyecto(p.ruta)}>
          Ver la conversación
        </button>
      </>
    )
  else if (trabajando)
    estado = (
      <button type="button" className="btn secundario chico" disabled title="Su IA está con otra cosa">
        Trabajando en otra cosa
      </button>
    )
  else
    estado = (
      <>
        {loMande && ficha?.estado === 'error' && (
          <button type="button" className="btn secundario chico" onClick={() => abrirProyecto(p.ruta)}>
            <Icono nombre="error" />
            Ver el error
          </button>
        )}
        <button
          type="button"
          className="btn secundario chico"
          disabled={mandando}
          title="Manda a su conversación el pedido de actualizar el formato (gasta uso)"
          onClick={() => void ponerAlDia()}
        >
          Poner al día
        </button>
      </>
    )

  return (
    <li className="sk-proy">
      <IconoProyecto p={p} />
      <div className="datos">
        <b title={p.nombre}>{p.nombre}</b>
        <span>{textoFormato(p.formato)}</span>
        {nota && (
          <span className="sk-falla" role="status">
            {nota}
          </span>
        )}
      </div>
      <div className="acc">{estado}</div>
    </li>
  )
}

export function Atrasados({ datos }: { datos: DatosAtrasados | null }) {
  const n = datos?.proyectos.length ?? 0
  return (
    <section className="sk-detalle" aria-label="Proyectos atrasados">
      <div className="cab">
        <h2>Proyectos atrasados{datos?.vigente ? <span className="n"> · {n}</span> : null}</h2>
        {datos === null ? (
          <span className="origen">Leyendo los proyectos…</span>
        ) : datos.vigente === null ? (
          <span className="origen">No sé qué formato pide la guía: su SKILL.md no lo dice.</span>
        ) : (
          <span className="origen">La guía va por el formato del {fechaLarga(datos.vigente)}</span>
        )}
      </div>
      <div className="cuerpo">
        {datos?.vigente && n === 0 && (
          <p className="sk-todos">
            <Icono nombre="check" />
            Ningún proyecto tiene un formato viejo de la guía.
          </p>
        )}
        {datos && n > 0 && (
          <>
            <ul className="sk-proyectos">
              {datos.proyectos.map((p) => (
                <Fila key={p.ruta} p={p} />
              ))}
            </ul>
            <p className="sk-nota">El pedido sale en la conversación de cada proyecto; seguís acá.</p>
          </>
        )}
      </div>
    </section>
  )
}
