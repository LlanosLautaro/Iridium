// El menú del clic derecho (R-7): aparece donde está el mouse (o debajo del elemento, con la tecla de menú o Mayús+F10)
// y se ve como los menús de la app. Se cierra al elegir, al tocar afuera, con Esc, con Tab o si la ventana cambia de
// tamaño; al cerrarse, el foco vuelve a lo que lo abrió. Las flechas, Inicio y Fin recorren las opciones.
import {
  type ReactNode,
  type KeyboardEvent as TeclaReact,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

const OPCIONES = 'button:not(:disabled)'
/** Lo que se deja libre entre el menú y el borde de la ventana. */
const MARGEN = 8

export interface Punto {
  x: number
  y: number
}

/** Dónde abrir el menú para un evento `contextmenu`: el mouse, o abajo a la izquierda del elemento si vino del teclado. */
export function puntoDelMenu(e: { clientX: number; clientY: number; currentTarget: Element }): Punto {
  if (e.clientX !== 0 || e.clientY !== 0) return { x: e.clientX, y: e.clientY }
  const r = e.currentTarget.getBoundingClientRect()
  return { x: r.left + 12, y: r.top + Math.min(r.height, 40) }
}

export function MenuContextual({
  en,
  etiqueta,
  cerrar,
  children,
}: {
  en: Punto
  etiqueta: string
  cerrar: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(en)
  const antes = useRef<HTMLElement | null>(null)

  // Que entre en la ventana: si no cabe a la derecha o abajo, se abre hacia el otro lado.
  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const x = en.x + r.width + MARGEN > window.innerWidth ? Math.max(MARGEN, en.x - r.width) : en.x
    const y = en.y + r.height + MARGEN > window.innerHeight ? Math.max(MARGEN, en.y - r.height) : en.y
    setPos({ x, y })
  }, [en])

  useEffect(() => {
    antes.current = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>(OPCIONES)?.focus()
    const afuera = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) cerrar()
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cerrar()
      }
    }
    document.addEventListener('pointerdown', afuera, true)
    document.addEventListener('keydown', tecla)
    window.addEventListener('resize', cerrar)
    window.addEventListener('blur', cerrar)
    return () => {
      document.removeEventListener('pointerdown', afuera, true)
      document.removeEventListener('keydown', tecla)
      window.removeEventListener('resize', cerrar)
      window.removeEventListener('blur', cerrar)
      // Si el foco quedó en el aire (estaba en el menú), vuelve a lo que lo abrió.
      if (!document.activeElement || document.activeElement === document.body) antes.current?.focus()
    }
  }, [cerrar])

  const recorrer = (e: TeclaReact) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      cerrar()
      return
    }
    const ops = [...(ref.current?.querySelectorAll<HTMLElement>(OPCIONES) ?? [])]
    if (ops.length === 0) return
    const i = ops.indexOf(document.activeElement as HTMLElement)
    const ir: Record<string, number> = {
      ArrowDown: i < 0 ? 0 : (i + 1) % ops.length,
      ArrowUp: i < 0 ? ops.length - 1 : (i - 1 + ops.length) % ops.length,
      Home: 0,
      End: ops.length - 1,
    }
    if (!(e.key in ir)) return
    e.preventDefault()
    ops[ir[e.key] ?? 0]?.focus()
  }

  return (
    <div
      ref={ref}
      className="menu-lista menu-contextual"
      role="menu"
      aria-label={etiqueta}
      style={{ left: pos.x, top: pos.y }}
      onKeyDown={recorrer}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  )
}
