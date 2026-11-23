// La ventana de Ajustes (modulos/apariencia/ux.md › AJ-W1; maqueta docs/diseno/pantallas/ajustes.html): la Ventana
// (PZ-8) sobre el velo, con las Pestañas (PZ-10) a la izquierda. Se abre con el ⚙ o Ctrl+, y se cierra con Esc, la ✕
// o un clic afuera; lo de atrás queda como estaba.
import { type ComponentType, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import type { Preferencias } from '../../compartido/puente'
import { type SeccionAjustes, usarEstado } from '../estado'
import { Icono } from '../ui/Icono'
import { AcercaDe } from './ajustes/AcercaDe'
import { Apariencia } from './ajustes/Apariencia'
import { EsteProyecto } from './ajustes/EsteProyecto'
import { Ia } from './ajustes/Ia'
import { Notificaciones } from './ajustes/Notificaciones'
import { Perfil } from './ajustes/Perfil'
import { Proyectos } from './ajustes/Proyectos'

/** Lo que recibe cada sección: guardar un cambio (avisa abajo si no se pudo). */
export interface PropsSeccion {
  cambiar(cambio: Partial<Preferencias>): Promise<boolean>
}

/**
 * Las secciones, en orden: el frente Compartir suma las suyas acá sin tocar las demás. «Este proyecto» (Ajustes del
 * proyecto, W-3; frente Abrir, AB-4) va primero y solo dentro de un proyecto.
 */
const SECCIONES_AJUSTES: {
  id: SeccionAjustes
  nombre: string
  Vista: ComponentType<PropsSeccion>
  soloEnProyecto?: boolean
}[] = [
  { id: 'proyecto', nombre: 'Este proyecto', Vista: EsteProyecto, soloEnProyecto: true },
  { id: 'perfil', nombre: 'Perfil', Vista: Perfil },
  { id: 'ia', nombre: 'IA', Vista: Ia },
  { id: 'apariencia', nombre: 'Apariencia', Vista: Apariencia },
  { id: 'notificaciones', nombre: 'Notificaciones', Vista: Notificaciones },
  { id: 'proyectos', nombre: 'Proyectos', Vista: Proyectos },
  { id: 'acerca', nombre: 'Acerca de', Vista: AcercaDe },
]

const ENFOCABLES = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Ajustes() {
  const { abierta, seccion } = usarEstado((s) => s.ajustes)
  const abrirAjustes = usarEstado((s) => s.abrirAjustes)
  const cerrarAjustes = usarEstado((s) => s.cerrarAjustes)
  const cambiarAjustes = usarEstado((s) => s.cambiarAjustes)
  const ventana = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const enProyecto = usarEstado((s) => s.seccion === 'proyecto' && s.proyectoAbierto !== null)
  const secciones = SECCIONES_AJUSTES.filter((s) => !s.soloEnProyecto || enProyecto)

  // Al abrir, el foco entra a la ventana; al cerrar, vuelve a donde estaba (el chat sigue con lo escrito).
  useEffect(() => {
    if (!abierta) return
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null
    ventana.current?.querySelector<HTMLElement>('nav [aria-current="page"]')?.focus()
    return () => {
      setError(false)
      antes?.focus()
    }
  }, [abierta])

  if (!abierta) return null
  const actual = secciones.find((s) => s.id === seccion) ?? secciones.find((s) => !s.soloEnProyecto)
  if (!actual) return null
  const Vista = actual.Vista

  const cambiar = async (cambio: Partial<Preferencias>) => {
    const ok = await cambiarAjustes(cambio)
    setError(!ok)
    return ok
  }

  // El foco no sale de la ventana: Tab desde el último vuelve al primero, y al revés.
  const alTeclado = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      cerrarAjustes()
      return
    }
    if (e.key !== 'Tab' || !ventana.current) return
    const todos = [...ventana.current.querySelectorAll<HTMLElement>(ENFOCABLES)]
    const primero = todos[0]
    const ultimo = todos.at(-1)
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault()
      ultimo?.focus()
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault()
      primero?.focus()
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: el clic en el fondo cierra, como Esc (que sí es del teclado).
    <div
      className="velo capa-ajustes"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cerrarAjustes()
      }}
    >
      <div
        ref={ventana}
        className="ventana ventana-ajustes"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ajustes-t"
        onKeyDown={alTeclado}
      >
        <nav aria-label="Secciones de Ajustes">
          <h2>Ajustes</h2>
          <div className="pestanas vertical">
            {secciones.map((s) => (
              <button
                key={s.id}
                type="button"
                className={s.id === actual.id ? 'pestana elegida' : 'pestana'}
                aria-current={s.id === actual.id ? 'page' : undefined}
                onClick={() => abrirAjustes(s.id)}
              >
                {s.nombre}
              </button>
            ))}
          </div>
        </nav>
        <div className="cuerpo-ventana">
          <button
            type="button"
            className="boton solo-icono cerrar-ventana"
            title="Cerrar (Esc)"
            aria-label="Cerrar"
            onClick={cerrarAjustes}
          >
            <Icono nombre="x" />
          </button>
          <h3 id="ajustes-t">{actual.nombre}</h3>
          <Vista cambiar={cambiar} />
          {error && (
            <div className="recuadro error aviso-guardar" role="alert">
              <Icono nombre="error" />
              <div className="cuerpo-recuadro">No se pudo guardar; sigue como antes.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
