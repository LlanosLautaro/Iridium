// La ventana de Ajustes (modulos/apariencia/ux.md › AJ-W1): flota sobre la app oscurecida, con las secciones a la
// izquierda. Se abre con el ⚙ o Ctrl+, y se cierra con Esc, la ✕ o un clic afuera; lo de atrás queda como estaba.
import { type ComponentType, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import type { Preferencias } from '../../compartido/puente'
import { type SeccionAjustes, usarEstado } from '../estado'
import { Icono } from '../ui/Icono'
import { AcercaDe } from './ajustes/AcercaDe'
import { Apariencia } from './ajustes/Apariencia'
import { Ia } from './ajustes/Ia'
import { Perfil } from './ajustes/Perfil'
import { Proyectos } from './ajustes/Proyectos'

/** Lo que recibe cada sección: guardar un cambio (avisa abajo si no se pudo). */
export interface PropsSeccion {
  cambiar(cambio: Partial<Preferencias>): Promise<boolean>
}

/** Las secciones, en orden: el frente Compartir suma las suyas acá sin tocar las demás. */
const SECCIONES_AJUSTES: { id: SeccionAjustes; nombre: string; Vista: ComponentType<PropsSeccion> }[] = [
  { id: 'perfil', nombre: 'Perfil', Vista: Perfil },
  { id: 'ia', nombre: 'IA', Vista: Ia },
  { id: 'apariencia', nombre: 'Apariencia', Vista: Apariencia },
  { id: 'proyectos', nombre: 'Proyectos', Vista: Proyectos },
  { id: 'acerca', nombre: 'Acerca de', Vista: AcercaDe },
]

/** Los íconos de la navegación, como en la maqueta (`docs/ui/vista-ajustes.html`). */
const ICONOS: Record<SeccionAjustes, ReactNode> = {
  perfil: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  ia: <path d="M12 3l2.2 5.3L20 9l-4.5 3.8L17 19l-5-3-5 3 1.5-6.2L4 9l5.8-.7z" />,
  apariencia: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" />
    </>
  ),
  proyectos: <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />,
  acerca: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 7.5v.5" />
    </>
  ),
}

const ENFOCABLES = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Ajustes() {
  const { abierta, seccion } = usarEstado((s) => s.ajustes)
  const abrirAjustes = usarEstado((s) => s.abrirAjustes)
  const cerrarAjustes = usarEstado((s) => s.cerrarAjustes)
  const cambiarAjustes = usarEstado((s) => s.cambiarAjustes)
  const ventana = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

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
  const actual = SECCIONES_AJUSTES.find((s) => s.id === seccion) ?? SECCIONES_AJUSTES[0]
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
      className="velo ajustes-velo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cerrarAjustes()
      }}
    >
      <div
        ref={ventana}
        className="ajustes"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ajustes-t"
        onKeyDown={alTeclado}
      >
        <nav aria-label="Secciones de Ajustes">
          <h2>Ajustes</h2>
          {SECCIONES_AJUSTES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-current={s.id === actual.id ? 'page' : undefined}
              onClick={() => abrirAjustes(s.id)}
            >
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                {ICONOS[s.id]}
              </svg>
              {s.nombre}
            </button>
          ))}
        </nav>
        <main>
          <button
            type="button"
            className="cerrar"
            title="Cerrar (Esc)"
            aria-label="Cerrar"
            onClick={cerrarAjustes}
          >
            <Icono nombre="x" />
          </button>
          <h1 id="ajustes-t">{actual.nombre}</h1>
          <Vista cambiar={cambiar} />
          {error && (
            <p className="ajustes-error" role="alert">
              <Icono nombre="error" />
              No se pudo guardar; sigue como antes.
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
