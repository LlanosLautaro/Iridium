// Anotar una idea sin la IA (04-ux.md › W-10 y W-11, H-18): el campo en una línea, a qué va al lado (en Ideas) y
// **Anotar**. Iridium la escribe sin abrir una sesión; si no pudo, el texto queda en el campo con el motivo y Reintentar.
import { type ReactNode, type RefObject, useState } from 'react'
import type { ResultadoAnotar } from '../../compartido/trabajo'
import { Icono } from './Icono'

export function Anotar({
  anotar,
  alAnotar,
  selector,
  campo,
  alEscape,
  etiqueta = 'Anotar una idea',
}: {
  anotar: (texto: string) => Promise<ResultadoAnotar>
  /** Ya escrita: el código que le tocó (vacío si es suelta). */
  alAnotar?: (codigo: string) => void
  /** A qué va (W-10); en Trabajo, nada: es este proyecto. */
  selector?: ReactNode
  campo?: RefObject<HTMLInputElement | null>
  alEscape?: () => void
  etiqueta?: string
}) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async () => {
    const t = texto.trim()
    if (t === '' || enviando) return
    setEnviando(true)
    let r: ResultadoAnotar
    try {
      r = await anotar(t)
    } catch (e) {
      r = { tipo: 'error', mensaje: e instanceof Error ? e.message : String(e) }
    }
    setEnviando(false)
    if (r.tipo === 'error') return setError(r.mensaje)
    setError(null)
    setTexto('')
    alAnotar?.(r.codigo)
  }

  return (
    <div className="anotar-bloque">
      <form
        className={error ? 'anotar con-error' : 'anotar'}
        onSubmit={(e) => {
          e.preventDefault()
          void enviar()
        }}
      >
        <input
          ref={campo}
          value={texto}
          maxLength={500}
          placeholder="Una idea…"
          aria-label={etiqueta}
          aria-invalid={error ? true : undefined}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && alEscape) {
              e.preventDefault()
              alEscape()
            }
          }}
        />
        {selector}
        <button type="submit" className="btn secundario" disabled={texto.trim() === '' || enviando}>
          Anotar
        </button>
      </form>
      {error && (
        <p className="bajo-campo error" role="alert">
          <Icono nombre="x" />
          <span>{error.charAt(0).toUpperCase() + error.slice(1)}</span>
          <button type="button" className="btn secundario chico" onClick={() => void enviar()}>
            Reintentar
          </button>
        </p>
      )}
    </div>
  )
}
