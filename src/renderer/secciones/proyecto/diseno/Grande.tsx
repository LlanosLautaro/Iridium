// Una maqueta grande (DS-12, S-4): a todo el lienzo, viva, en un `<webview>` con `file://` donde entra la extensión de
// la Revisión (F8). Arriba, Volver, el nombre, el número y Comentar; a los costados (y con ← →, también comentando), la
// anterior y la siguiente; Esc vuelve. Si un enlace de la maqueta lleva a otra, la cabecera la sigue. Una pantalla del
// índice ofrece Otra versión y, si tiene, Versiones · N, que las pone lado a lado (DI-I4). Con una dirección puesta, sus
// tokens van encima de los de la maqueta (`insertCSS`) y la cabecera lo dice.
import { useEffect, useRef, useState } from 'react'
import type { MaquetaVista } from '../../../../compartido/diseno'
import { Icono } from '../../../ui/Icono'

interface Webview extends HTMLElement {
  reload(): void
  getURL(): string
  insertCSS(css: string): Promise<string>
  removeInsertedCSS(clave: string): Promise<void>
  sendInputEvent(e: { type: 'keyDown' | 'keyUp'; keyCode: string }): void
}

/** Si la tecla viene de un lugar donde se escribe (ahí las flechas mueven el cursor). */
function escribiendo(e: KeyboardEvent): boolean {
  const t = e.target
  return t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
}

/** El archivo relativo a `docs/diseno/` de una dirección `file://` de la carpeta, o null si es de afuera. */
function archivoDe(carpeta: string, url: string): string | null {
  const limpia = url.replace(/[?#].*$/, '')
  if (!limpia.toLowerCase().startsWith(carpeta.toLowerCase())) return null
  try {
    return decodeURIComponent(limpia.slice(carpeta.length))
  } catch {
    return null
  }
}

export function Grande({
  carpeta,
  maquetas,
  archivo,
  elegir,
  volver,
  quieto = false,
  versiones = 0,
  verVersiones = null,
  otraVersion = null,
  trabajando = false,
  direccion = null,
}: {
  /** La carpeta `docs/diseno/` como `file://…/`. */
  carpeta: string
  /** En el orden del lienzo, para las flechas y el número. */
  maquetas: readonly MaquetaVista[]
  archivo: string
  elegir: (archivo: string) => void
  volver: () => void
  /** Hay un cuadro abierto encima: Esc y las flechas son suyos. */
  quieto?: boolean
  /** Cuántas versiones tiene la pantalla que se ve. */
  versiones?: number
  verVersiones?: (() => void) | null
  /** Pedir otra versión; null si no se puede (no es una pantalla del índice). */
  otraVersion?: (() => void) | null
  /** La IA del proyecto está trabajando: Otra versión espera. */
  trabajando?: boolean
  /** La dirección puesta: su nombre y sus tokens, que van encima de los de la maqueta; o null. */
  direccion?: { nombre: string; css: string } | null
}) {
  const vista = useRef<Webview>(null)
  // La que se ve: cambia si un enlace de la maqueta lleva a otra (puede no estar en el índice).
  const [actual, setActual] = useState(archivo)
  const mostrada = useRef(archivo)
  const [src] = useState(`${carpeta}${archivo}`)
  const i = maquetas.findIndex((m) => m.archivo === actual)
  const m = maquetas[i]
  const huella = m?.huella
  const vistaHuella = useRef(`${actual}|${huella}`)

  // Elegir otra desde las flechas carga esa maqueta; si ya es la que se ve (vino de un enlace), nada.
  useEffect(() => {
    if (archivo === mostrada.current) return
    mostrada.current = archivo
    setActual(archivo)
    vista.current?.setAttribute('src', `${carpeta}${archivo}`)
  }, [archivo, carpeta])

  // La IA cambió la que se ve: se recarga en el lugar. Pasar a otra maqueta no es un cambio.
  useEffect(() => {
    const antes = vistaHuella.current
    vistaHuella.current = `${actual}|${huella}`
    if (huella && antes.startsWith(`${actual}|`) && antes !== vistaHuella.current) vista.current?.reload()
  }, [actual, huella])

  // La dirección, encima de los tokens de la maqueta: cada vez que carga una página y cuando cambia. Los métodos del
  // `webview` fallan en el acto si todavía no cargó o ya se cerró (al volver al lienzo): eso no es un error.
  const estilo = direccion?.css ?? null
  useEffect(() => {
    const w = vista.current
    if (!w) return
    let clave: string | null = null
    let vigente = true
    const sacar = (k: string) => {
      try {
        void w.removeInsertedCSS(k).catch(() => {})
      } catch {
        // Ya no está: se fue con la página.
      }
    }
    const poner = () => {
      if (clave) sacar(clave)
      clave = null
      if (!estilo) return
      try {
        void w.insertCSS(estilo).then(
          (k) => {
            if (vigente) clave = k
            else sacar(k)
          },
          () => {},
        )
      } catch {
        // Todavía no cargó: lo pone `dom-ready`.
      }
    }
    const alCargar = () => {
      clave = null
      poner()
    }
    w.addEventListener('dom-ready', alCargar)
    poner()
    return () => {
      vigente = false
      w.removeEventListener('dom-ready', alCargar)
      if (clave) sacar(clave)
    }
  }, [estilo])

  useEffect(() => {
    const w = vista.current
    if (!w) return
    const alNavegar = (e: Event) => {
      const a = archivoDe(carpeta, (e as Event & { url: string }).url)
      if (!a || a === mostrada.current) return
      mostrada.current = a
      setActual(a)
      if (maquetas.some((x) => x.archivo === a)) elegir(a)
    }
    w.addEventListener('did-navigate', alNavegar)
    return () => w.removeEventListener('did-navigate', alNavegar)
  }, [carpeta, maquetas, elegir])

  const ir = (paso: number) => {
    const otra = maquetas[(i + paso + maquetas.length) % maquetas.length]
    if (otra) elegir(otra.archivo)
  }
  const irA = useRef(ir)
  irA.current = ir

  // Las flechas del teclado pasan de maqueta con el foco en Iridium o adentro de la maqueta (R-24).
  useEffect(() => {
    if (quieto) return
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') volver()
      else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.altKey && !e.ctrlKey && !e.shiftKey) {
        if (escribiendo(e) || e.target === vista.current) return
        e.preventDefault()
        irA.current(e.key === 'ArrowRight' ? 1 : -1)
      }
    }
    window.addEventListener('keydown', alTeclado)
    const quitar = [
      window.iridium.alEscapeDiseno(volver),
      window.iridium.alFlechaDiseno((paso) => irA.current(paso)),
      window.iridium.alComentarDiseno(setComentando),
    ]
    return () => {
      window.removeEventListener('keydown', alTeclado)
      for (const q of quitar) q()
    }
  }, [volver, quieto])

  // Comentar es F8 con el foco en la maqueta: el botón lo pone ahí, para no comentar Iridium sin querer (Q-152).
  const [comentando, setComentando] = useState(false)
  const comentar = () => {
    const w = vista.current
    if (!w) return
    w.focus()
    w.sendInputEvent({ type: 'keyDown', keyCode: 'F8' })
    w.sendInputEvent({ type: 'keyUp', keyCode: 'F8' })
  }

  const nombre = m?.nombre ?? actual
  const numero = i >= 0 ? `${i + 1} de ${maquetas.length}` : null

  return (
    <div className="di-grande">
      <div className="di-grande-cab">
        <button
          type="button"
          className="boton sin-fondo chico"
          onClick={volver}
          title="Volver al lienzo (Esc)"
        >
          <Icono nombre="atras" />
          Volver
        </button>
        <span className="di-grande-t" aria-live="polite">
          <b>{nombre}</b>
          {numero && <span className="sub"> · {numero}</span>}
          {direccion && <span className="sub"> · con «{direccion.nombre}»</span>}
        </span>
        {verVersiones && versiones > 0 && (
          <button
            type="button"
            className="boton sin-fondo chico"
            title="La de hoy y sus versiones, lado a lado"
            onClick={verVersiones}
          >
            <Icono nombre="cuadro" />
            Versiones · {versiones}
          </button>
        )}
        {otraVersion && (
          <button
            type="button"
            className="boton sin-fondo chico"
            disabled={trabajando}
            title={
              trabajando
                ? 'Su IA está trabajando'
                : 'Deja el pedido citado en la conversación: lo mandás con lo que quieras probar'
            }
            onClick={otraVersion}
          >
            <Icono nombre="mas" />
            Otra versión
          </button>
        )}
        <button
          type="button"
          className="boton sin-fondo chico"
          aria-pressed={comentando}
          onClick={comentar}
          title="Comentar esta maqueta (F8 con el foco en ella)"
        >
          <Icono nombre="revision" />
          {comentando ? 'Comentando' : 'Comentar'}
        </button>
      </div>
      <div className="di-grande-cuerpo">
        {maquetas.length > 1 && (
          <button type="button" className="di-flecha" aria-label="Anterior" onClick={() => ir(-1)}>
            <Icono nombre="chev" style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
        <webview
          ref={vista}
          className="di-webview"
          src={src}
          aria-label={`${nombre}${numero ? `, ${numero}` : ''}`}
        />
        {maquetas.length > 1 && (
          <button type="button" className="di-flecha" aria-label="Siguiente" onClick={() => ir(1)}>
            <Icono nombre="chev" />
          </button>
        )}
      </div>
    </div>
  )
}
