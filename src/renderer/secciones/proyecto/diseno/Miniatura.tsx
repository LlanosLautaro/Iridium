// Una maqueta viva y achicada en el lienzo (DS-3, S-4): un `iframe` aislado (sin `allow-same-origin`) que carga por
// `maqueta://` y no recibe el ratón: tocarla la agranda. Solo carga cuando está a la vista. Rota, muestra el motivo.
// Si tiene otras versiones (DI-I4), lo dice junto al nombre; una versión nueva sin mirar también lleva el punto.
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { MaquetaVista } from '../../../../compartido/diseno'

/** Para qué tamaño se dibujan las maquetas (`diseno-tecnico.md` › Las maquetas). */
export const ANCHO_MAQUETA = 1440
export const ALTO_MAQUETA = 900

/**
 * Si las maquetas pueden estar cargadas. Iridium deja montada la sección al salir de ella (para volver al instante), pero
 * las maquetas siguen vivas, con su memoria y sus animaciones: Diseño las descarga un rato después de salir (paso 8).
 */
export const MaquetasVivas = createContext(true)

export function Miniatura({
  base,
  maqueta,
  ancho,
  agrandar,
  boton,
  clave,
  enTab = true,
}: {
  base: string
  maqueta: MaquetaVista
  ancho: number
  agrandar: () => void
  /** Para moverse con las flechas del teclado entre miniaturas. */
  boton?: (el: HTMLButtonElement | null) => void
  /** En el lienzo: cómo la conoce el lienzo y si es la que recibe el Tab (las demás, con las flechas). */
  clave?: string
  enTab?: boolean
}) {
  const marco = useRef<HTMLDivElement>(null)
  const vivas = useContext(MaquetasVivas)
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

  const n = maqueta.versiones.length
  const versiones = n === 0 ? null : n === 1 ? '1 versión' : `${n} versiones`
  const cambio = maqueta.cambiada || maqueta.versiones.some((v) => v.cambiada)
  const etiqueta = `${maqueta.nombre}${versiones ? `, ${versiones}` : ''}${cambio ? ' (cambió)' : ''}${maqueta.rota ? `: ${maqueta.rota}` : ''}`
  return (
    <button
      ref={boton}
      type="button"
      className="di-mini"
      data-archivo={maqueta.archivo}
      data-clave={clave}
      tabIndex={enTab ? 0 : -1}
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
          aLaVista &&
          vivas && (
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
        {versiones && <span className="di-nversiones">{versiones}</span>}
        {cambio && <span className="di-punto" aria-hidden="true" />}
      </span>
    </button>
  )
}
