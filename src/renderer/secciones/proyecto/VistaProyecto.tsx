// Vista de un proyecto (H-3, 04-ux.md › W-3, D-041): la sección elegida en la barra de íconos en el área grande y la
// conversación siempre a la derecha. Su borde se arrastra (o se mueve con las flechas) y el proyecto recuerda su ancho;
// doble clic vuelve al de entrada. Todo lo que se ve es del proyecto abierto. Cambiar de sección no recarga nada.
import { type CSSProperties, useEffect } from 'react'
import { type SeccionProyecto, tarjetaDe, usarEstado, vistaDe } from '../../estado'
import { Divisor, useAnchoConversacion } from '../../ui/Divisor'
import { SECCIONES_PROYECTO } from '..'
import { Archivos } from './Archivos'
import { Conversacion } from './Conversacion'
import { Docs } from './Docs'
import { Diseno } from './diseno/Diseno'
import { Git } from './Git'
import { IdeasProyecto } from './IdeasProyecto'
import { Mapa } from './Mapa'
import { Resumen } from './Resumen'
import { Revision } from './Revision'
import { Scripts } from './Scripts'
import { SkillsProyecto } from './SkillsProyecto'

/** Las secciones que ya se abrieron en cada proyecto: quedan montadas (ocultas) para no recargar al volver. */
const abiertas = new Map<string, Set<SeccionProyecto>>()

function Seccion({ ruta, id }: { ruta: string; id: SeccionProyecto }) {
  switch (id) {
    case 'pendientes':
      return <Resumen ruta={ruta} />
    case 'mapa':
      return <Mapa ruta={ruta} />
    case 'ideas':
      return <IdeasProyecto ruta={ruta} />
    case 'docs':
      return <Docs ruta={ruta} />
    case 'archivos':
      return <Archivos ruta={ruta} />
    case 'revision':
      return <Revision ruta={ruta} />
    case 'git':
      return <Git ruta={ruta} />
    case 'scripts':
      return <Scripts ruta={ruta} />
    case 'skills':
      return <SkillsProyecto ruta={ruta} />
    case 'diseno':
      return <Diseno ruta={ruta} />
  }
}

export function VistaProyecto() {
  const ruta = usarEstado((s) => s.proyectoAbierto)
  const lista = usarEstado((s) => s.lista)
  const seccion = usarEstado((s) => (ruta ? vistaDe(s.vistas, ruta).seccion : 'pendientes'))
  const ancho = useAnchoConversacion(ruta ? { proyecto: ruta } : null)
  const irA = usarEstado((s) => s.irA)
  const volver = usarEstado((s) => s.volver)
  const p = tarjetaDe(lista, ruta)

  // Alt+← y el botón lateral del mouse vuelven un paso (F-4, Q-63), en cualquier sección del proyecto.
  useEffect(() => {
    if (!ruta) return
    const alTeclado = (e: globalThis.KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        volver(ruta)
      }
    }
    // El botón «atrás» del mouse es el 3 (el 4 es «adelante», que no hay).
    const alMouse = (e: MouseEvent) => {
      if (e.button !== 3) return
      e.preventDefault()
      if (e.type === 'mouseup') volver(ruta)
    }
    window.addEventListener('keydown', alTeclado)
    window.addEventListener('mousedown', alMouse)
    window.addEventListener('mouseup', alMouse)
    return () => {
      window.removeEventListener('keydown', alTeclado)
      window.removeEventListener('mousedown', alMouse)
      window.removeEventListener('mouseup', alMouse)
    }
  }, [ruta, volver])

  if (!ruta) return null
  if (!p) {
    return (
      <main className="trabajo">
        <div className="lienzo">
          <div className="mensaje" role="status">
            <h2>Este proyecto ya no está en la carpeta de proyectos</h2>
            <span className="ruta">{ruta}</span>
            <div className="acc">
              <button type="button" className="boton secundario" onClick={() => irA('proyectos')}>
                Volver a Proyectos
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  let vistas = abiertas.get(ruta)
  if (!vistas) {
    vistas = new Set()
    abiertas.set(ruta, vistas)
  }
  vistas.add(seccion)

  return (
    <main className="trabajo proyecto" style={{ '--ancho-chat': `${ancho}px` } as CSSProperties}>
      <section className="zona-principal" aria-label={p.nombre}>
        {/* Sin cabecera a la vista (D-125): el nombre lo dice la pestaña; el título queda para el lector de pantalla. */}
        <h1 className="solo-lector">{p.nombre}</h1>
        <div className="vista">
          {SECCIONES_PROYECTO.filter((s) => vistas.has(s.id)).map((s) => (
            <div
              key={`${ruta}|${s.id}`}
              className="seccion-vista"
              data-seccion={s.id}
              hidden={s.id !== seccion}
            >
              <Seccion ruta={ruta} id={s.id} />
            </div>
          ))}
        </div>
      </section>
      <Divisor vista={{ proyecto: ruta }} ancho={ancho} />
      <aside className="chat" aria-label="Conversación">
        <Conversacion key={p.ruta} p={p} />
      </aside>
    </main>
  )
}
