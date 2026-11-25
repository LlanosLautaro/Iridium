// El cuadro de las versiones (DS-9): Quedarme con esta dice qué se reemplaza y qué va a la papelera antes de hacerlo.
// Otra versión no tiene cuadro: queda citada en la conversación (D-196).
import { useEffect, useRef } from 'react'

export function ConfirmarQuedarme({
  nombre,
  letra,
  cuantas,
  quedarme,
  cerrar,
}: {
  nombre: string
  /** La letra de la versión elegida, o null si es la de hoy. */
  letra: string | null
  /** Cuántas versiones tiene la maqueta. */
  cuantas: number
  quedarme: () => void
  cerrar: () => void
}) {
  const primero = useRef<HTMLButtonElement>(null)
  useEffect(() => primero.current?.focus(), [])
  const otras = cuantas - 1
  return (
    <div className="velo capa-cuadro">
      <div
        className="cuadro"
        role="dialog"
        aria-modal="true"
        aria-labelledby="di-quedarme-t"
        aria-describedby="di-quedarme-d"
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          e.stopPropagation()
          cerrar()
        }}
      >
        <h2 id="di-quedarme-t">{letra ? `Quedarme con la versión ${letra}` : 'Quedarme con la de hoy'}</h2>
        <p id="di-quedarme-d">
          {letra
            ? `La versión ${letra} pasa a ser la maqueta «${nombre}». La de antes${otras === 0 ? '' : otras === 1 ? ' y la otra versión' : ` y las otras ${otras} versiones`} van a la papelera de Windows, de donde se pueden recuperar.`
            : `La maqueta «${nombre}» queda como está y ${cuantas === 1 ? 'su versión va' : `sus ${cuantas} versiones van`} a la papelera de Windows, de donde se pueden recuperar.`}
        </p>
        <div className="pie">
          <button ref={primero} type="button" className="boton sin-fondo" onClick={cerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton principal"
            onClick={() => {
              quedarme()
              cerrar()
            }}
          >
            Quedarme con esta
          </button>
        </div>
      </div>
    </div>
  )
}
