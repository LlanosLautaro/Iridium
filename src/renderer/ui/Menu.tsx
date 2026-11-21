// Un menú que se despliega desde un botón (Docs: «En esta página»; la conversación: las anteriores, el modelo, el
// esfuerzo y el contexto; la barra de abajo: el uso). La lista es el Menú (PZ-8), o el menú en lista con `enLista`.
// Se cierra al elegir, al tocar afuera, con Esc o cuando el foco sale con Tab. Con el teclado (Defecto 18): al abrir,
// el foco va a la opción elegida (o a la primera); las flechas, Inicio y Fin recorren las opciones.
import { type ReactNode, type KeyboardEvent as TeclaReact, useEffect, useRef, useState } from 'react'

const OPCIONES = 'button:not(:disabled), a[href]'

/** Las opciones del menú abierto, en orden. */
function opcionesDe(lista: HTMLElement | null): HTMLElement[] {
  return lista ? [...lista.querySelectorAll<HTMLElement>(OPCIONES)] : []
}

export function Menu({
  boton,
  titulo,
  clase,
  claseBoton = 'boton sin-fondo chico',
  enLista = false,
  claseLista,
  deshabilitado,
  alAbrir,
  children,
}: {
  boton: ReactNode
  titulo: string
  /** Clases del contenedor (`con-menu`, más las que se pasen), para ubicar la lista. */
  clase?: string
  /** Las clases del botón que lo abre: la pieza Botón (`boton sin-fondo chico`, si no se dice otra). */
  claseBoton?: string
  /** El menú en lista (PZ-8): cada opción con título y detalle, como las conversaciones. */
  enLista?: boolean
  /** Más clases de la lista: `arriba`, para abrirla hacia arriba (el + del compositor, PZ-8). */
  claseLista?: string
  deshabilitado?: boolean
  alAbrir?: () => void
  children: (cerrar: () => void) => ReactNode
}) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const refBoton = useRef<HTMLButtonElement>(null)
  const lista = useRef<HTMLDivElement>(null)

  /** Cierra; si el foco estaba adentro, vuelve al botón (si no, quedaría en el aire). */
  const cerrar = () => {
    if (ref.current?.contains(document.activeElement)) refBoton.current?.focus()
    setAbierto(false)
  }

  useEffect(() => {
    if (!abierto) return
    const afuera = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAbierto(false)
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
    }
    document.addEventListener('pointerdown', afuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', afuera)
      document.removeEventListener('keydown', tecla)
    }
  })

  // Al abrir, el foco en la opción elegida o en la primera. Las listas que llegan después (las anteriores) se
  // alcanzan con las flechas.
  useEffect(() => {
    if (!abierto) return
    const ops = opcionesDe(lista.current)
    const elegida = ops.find(
      (o) => o.getAttribute('aria-checked') === 'true' || o.getAttribute('aria-current') === 'true',
    )
    ;(elegida ?? ops[0])?.focus()
  }, [abierto])

  const recorrer = (e: TeclaReact) => {
    const ops = opcionesDe(lista.current)
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
    // biome-ignore lint/a11y/noStaticElementInteractions: solo mira a dónde va el foco para cerrar el menú al salir con Tab.
    <div
      ref={ref}
      className={clase ? `con-menu ${clase}` : 'con-menu'}
      onBlur={(e) => {
        // Tab fuera del menú lo cierra; un clic adentro en algo que no toma el foco, no.
        if (abierto && e.relatedTarget && !ref.current?.contains(e.relatedTarget)) setAbierto(false)
      }}
    >
      <button
        ref={refBoton}
        type="button"
        className={claseBoton}
        aria-haspopup="menu"
        aria-expanded={abierto}
        title={titulo}
        disabled={deshabilitado}
        onClick={() => {
          if (!abierto) alAbrir?.()
          setAbierto(!abierto)
        }}
        onKeyDown={(e) => {
          if (abierto || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return
          e.preventDefault()
          alAbrir?.()
          setAbierto(true)
        }}
      >
        {boton}
      </button>
      {abierto && (
        <div
          ref={lista}
          className={['menu abierto', enLista && 'lista-menu', claseLista].filter(Boolean).join(' ')}
          role="menu"
          onKeyDown={recorrer}
        >
          {children(cerrar)}
        </div>
      )}
    </div>
  )
}
