// Una maqueta viva y achicada en el lienzo (DS-3, S-4): un `iframe` aislado (sin `allow-same-origin`) que carga por
// `maqueta://` y no recibe el ratón: tocarla la agranda. Solo carga cuando está a la vista. Rota, muestra el motivo.
import { useEffect, useRef, useState } from 'react'
import type { MaquetaVista } from '../../../../compartido/diseno'

/** Para qué tamaño se dibujan las maquetas (`diseno-tecnico.md` › Las maquetas). */
export const ANCHO_MAQUETA = 1440
export const ALTO_MAQUETA = 900

export function Miniatura({
  base,
  maqueta,
  ancho,
  agrandar,
  boton,
}: {
  base: string
  maqueta: MaquetaVista
  ancho: number
  agrandar: () => void
  /** Para moverse con las flechas del teclado entre miniaturas. */
  boton?: (el: HTMLButtonElement | null) => void
}) {
  const marco = useRef<HTMLDivElement>(null)
  const [aLaVista, setALaVista] = useState(false)
  const escala = ancho / ANCHO_MAQUETA

  useEffect(() => {
    const el = marco.current
    if (!el) return
    const o = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setALaVista(true)
        o.disconnect()
      }
    })
    o.observe(el)
    return () => o.disconnect()
  }, [])

  const etiqueta = `${maqueta.nombre}${maqueta.cambiada ? ' (cambió)' : ''}${maqueta.rota ? `: ${maqueta.rota}` : ''}`
  return (
    <button
      ref={boton}
      type="button"
      className="di-mini"
      data-archivo={maqueta.archivo}
      aria-label={etiqueta}
      title={maqueta.archivo}
      onClick={agrandar}
    >
      <div
        ref={marco}
        className={maqueta.rota ? 'di-marco rota' : 'di-marco'}
        style={{ width: ancho, height: ALTO_MAQUETA * escala }}
      >
        {maqueta.rota ? (
          <span className="di-motivo">{maqueta.rota}</span>
        ) : (
          aLaVista && (
            <iframe
              key={maqueta.huella}
              title={maqueta.nombre}
              src={`${base}${maqueta.archivo}?v=${maqueta.huella}`}
              sandbox="allow-scripts"
              tabIndex={-1}
              aria-hidden="true"
              style={{ width: ANCHO_MAQUETA, height: ALTO_MAQUETA, transform: `scale(${escala})` }}
            />
          )
        )}
      </div>
      <span className="di-nombre">
        {maqueta.nombre}
        {maqueta.cambiada && <span className="di-punto" aria-hidden="true" />}
      </span>
    </button>
  )
}
