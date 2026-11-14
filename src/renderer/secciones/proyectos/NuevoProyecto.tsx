// Nuevo proyecto (R-7, C-10, D-089, R-14): solo el nombre. Iridium crea la carpeta con la plantilla básica del framework
// y la abre; la idea, la ficha y el ícono se hacen después, conversando con la IA (D-101).
import { useEffect, useRef, useState } from 'react'

export function NuevoProyecto({ cerrar, listo }: { cerrar: () => void; listo: (ruta: string) => void }) {
  const [nombre, setNombre] = useState('')
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
      const r = await window.iridium.nuevoProyecto(nombre)
      if (r.tipo === 'error') {
        setError(r.mensaje)
        campo.current?.focus()
        return
      }
      listo(r.ruta)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreando(false)
    }
  }

  return (
    <div className="velo-dialogo">
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
          Se crea la carpeta en tu carpeta de proyectos con la plantilla básica. Después le contás a la IA de
          qué se trata, en la conversación.
        </p>
        <label className="campo-nuevo">
          <span>Nombre</span>
          <input
            ref={campo}
            className="campo-texto"
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
        {error && (
          <p id="nuevo-error" className="error-nuevo" role="alert">
            {error}
          </p>
        )}
        <div className="acc">
          <button type="button" className="boton sin-fondo" disabled={creando} onClick={cerrar}>
            Cancelar
          </button>
          <button type="submit" className="boton principal" disabled={!nombre.trim() || creando}>
            {creando ? 'Creando…' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}
