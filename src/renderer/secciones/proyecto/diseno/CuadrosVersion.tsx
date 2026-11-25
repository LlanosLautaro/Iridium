// Los cuadros de las versiones (DS-5, DS-9): Otra versión pide una frase y dice que gasta uso antes de mandarla;
// Quedarme con esta dice qué se reemplaza y qué va a la papelera antes de hacerlo.
import { useEffect, useRef, useState } from 'react'
import { Icono } from '../../../ui/Icono'

/** Lo más largo de la frase (el puente lo vuelve a mirar). */
const LIMITE_FRASE = 500

export function OtraVersion({
  nombre,
  pedir,
  cerrar,
}: {
  nombre: string
  /** Manda el pedido; si falla, el motivo vuelve al cuadro. */
  pedir: (frase: string) => Promise<void>
  cerrar: () => void
}) {
  const [frase, setFrase] = useState('')
  const [mandando, setMandando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const campo = useRef<HTMLTextAreaElement>(null)
  useEffect(() => campo.current?.focus(), [])

  const mandar = async () => {
    setMandando(true)
    setError(null)
    try {
      await pedir(frase.trim())
      cerrar()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setMandando(false)
      campo.current?.focus()
    }
  }

  return (
    <div className="velo capa-cuadro">
      <form
        className="cuadro"
        role="dialog"
        aria-modal="true"
        aria-labelledby="di-version-t"
        aria-describedby="di-version-d"
        onKeyDown={(e) => {
          // Esc cierra el cuadro y nada más: no llega a la grande ni a las versiones de abajo.
          if (e.key !== 'Escape') return
          e.stopPropagation()
          if (!mandando) cerrar()
        }}
        onSubmit={(e) => {
          e.preventDefault()
          if (frase.trim() && !mandando) void mandar()
        }}
      >
        <h2 id="di-version-t">Otra versión de {nombre}</h2>
        <p id="di-version-d">
          La IA escribe otra versión de esta pantalla, sin tocar la de hoy, y las ves lado a lado. Gasta uso
          de tu suscripción.
        </p>
        <label className="etiqueta-campo">
          Qué probar
          <textarea
            ref={campo}
            className="campo"
            rows={3}
            value={frase}
            maxLength={LIMITE_FRASE}
            placeholder="la bandeja como una sola lista"
            aria-invalid={error !== null}
            aria-describedby={error ? 'di-version-error' : undefined}
            onChange={(e) => {
              setFrase(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              // Enter manda; Shift+Enter baja de línea.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
        </label>
        {error && (
          <div id="di-version-error" className="recuadro error" role="alert">
            <Icono nombre="error" />
            <div className="cuerpo-recuadro">{error}</div>
          </div>
        )}
        <div className="pie">
          <button type="button" className="boton sin-fondo" disabled={mandando} onClick={cerrar}>
            Cancelar
          </button>
          <button type="submit" className="boton principal" disabled={!frase.trim() || mandando}>
            {mandando ? 'Mandando…' : 'Pedírsela'}
          </button>
        </div>
      </form>
    </div>
  )
}

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
