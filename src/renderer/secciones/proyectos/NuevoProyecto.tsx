// Nuevo proyecto (R-7, C-10, D-089): el nombre de la carpeta y, si se quiere, la idea. Iridium crea la carpeta, la
// abre y le pide a la IA que la arranque con la guía de hitos y que haga la ficha y el ícono.
import { useEffect, useRef, useState } from 'react'

export function NuevoProyecto({
  cerrar,
  listo,
}: {
  cerrar: () => void
  listo: (ruta: string, aviso: string | null) => void
}) {
  const [nombre, setNombre] = useState('')
  const [idea, setIdea] = useState('')
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const campo = useRef<HTMLInputElement>(null)

  useEffect(() => campo.current?.focus(), [])
  useEffect(() => {
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !creando) {
        e.preventDefault()
        cerrar()
      }
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [cerrar, creando])

  const crear = async () => {
    setCreando(true)
    setError(null)
    try {
      const r = await window.iridium.nuevoProyecto(nombre, idea)
      if (r.tipo === 'error') {
        setError(r.mensaje)
        campo.current?.focus()
        return
      }
      listo(r.ruta, r.aviso)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreando(false)
    }
  }

  return (
    <div className="velo">
      <form
        className="dialogo nuevo-proyecto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nuevo-t"
        aria-describedby="nuevo-d"
        onSubmit={(e) => {
          e.preventDefault()
          if (nombre.trim() && !creando) void crear()
        }}
      >
        <h2 id="nuevo-t">Nuevo proyecto</h2>
        <p id="nuevo-d">
          Se crea la carpeta en tu carpeta de proyectos y la IA lo arranca con la guía: la idea, la ficha y el
          ícono.
        </p>
        <label className="campo-nuevo">
          <span>Nombre</span>
          <input
            ref={campo}
            className="campo"
            value={nombre}
            maxLength={80}
            spellCheck={false}
            aria-invalid={error !== null}
            aria-describedby={error ? 'nuevo-error' : undefined}
            onChange={(e) => {
              setNombre(e.target.value)
              setError(null)
            }}
          />
        </label>
        <label className="campo-nuevo">
          <span>
            La idea <small>(opcional; si no, la IA te la pregunta en Pendientes)</small>
          </span>
          <textarea
            className="campo"
            rows={5}
            value={idea}
            placeholder="Qué querés hacer, para quién, qué te gustaría que tenga…"
            onChange={(e) => setIdea(e.target.value)}
          />
        </label>
        {error && (
          <p id="nuevo-error" className="error-nuevo" role="alert">
            {error}
          </p>
        )}
        <div className="acc">
          <button type="button" className="btn secundario" disabled={creando} onClick={cerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn primario" disabled={!nombre.trim() || creando}>
            {creando ? 'Creando…' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}
