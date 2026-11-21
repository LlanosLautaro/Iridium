// Eliminar un proyecto desde el menú de la tarjeta (R-10, D-090), con confirmación: primero se mira la carpeta y se
// muestra qué pasa con ella; solo con Eliminar se toca. Lo regenerable (node_modules, out…) se borra; el resto va a la
// papelera de Windows, de donde se puede recuperar.
import { useEffect, useRef, useState } from 'react'
import type { ListaProyectos, TarjetaProyecto } from '../../../compartido/puente'
import { cantidadArchivos, tamanoLegible } from '../../../compartido/tamanos'
import type { PlanEliminacion } from '../../../compartido/tipos'
import { Icono } from '../../ui/Icono'

export function EliminarProyecto({
  p,
  cerrar,
  listo,
}: {
  p: TarjetaProyecto
  cerrar: () => void
  listo: (lista: ListaProyectos) => void
}) {
  const [plan, setPlan] = useState<PlanEliminacion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const cancelar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let vigente = true
    void window.iridium.planEliminarProyecto(p.ruta).then(
      (r) => {
        if (!vigente) return
        if (r.tipo === 'ok') setPlan(r.plan)
        else setError(r.mensaje)
      },
      (e: unknown) => vigente && setError(e instanceof Error ? e.message : String(e)),
    )
    return () => {
      vigente = false
    }
  }, [p.ruta])
  // El foco empieza en Cancelar: Enter no borra nada.
  useEffect(() => cancelar.current?.focus(), [])
  useEffect(() => {
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !eliminando) {
        e.preventDefault()
        cerrar()
      }
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [cerrar, eliminando])

  const eliminar = async () => {
    setEliminando(true)
    setError(null)
    try {
      const r = await window.iridium.eliminarProyecto(p.ruta)
      if (r.tipo === 'ok') listo(r.lista)
      else if (r.tipo === 'error') setError(r.mensaje)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setEliminando(false)
    }
  }

  const regenerables = plan?.regenerables ?? []
  return (
    <div className="velo capa-cuadro">
      <div
        className="cuadro eliminar-proyecto"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="eliminar-t"
        aria-describedby="eliminar-d"
      >
        <h2 id="eliminar-t">¿Eliminar «{p.nombre}»?</h2>
        <div id="eliminar-d">
          {!plan && !error && <p>Revisando la carpeta…</p>}
          {plan && (
            <>
              <p>
                La carpeta va a la papelera de Windows ({cantidadArchivos(plan.papelera.archivos)}
                {plan.papelera.conGit ? ', con su historial de Git' : ''}): desde ahí se puede recuperar.
              </p>
              {regenerables.length > 0 && (
                <>
                  <p>Se borra definitivamente lo que se vuelve a generar:</p>
                  <ul className="regenerables">
                    {regenerables.map((r) => (
                      <li key={r.relativa}>
                        <code>{r.relativa}</code>
                        {r.bytes !== null && <span className="tam">{tamanoLegible(r.bytes)}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
        {error && (
          <div className="recuadro error" role="alert">
            <Icono nombre="error" />
            <div className="cuerpo-recuadro">{error}</div>
          </div>
        )}
        <div className="pie">
          <button
            ref={cancelar}
            type="button"
            className="boton sin-fondo"
            disabled={eliminando}
            onClick={cerrar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="boton principal peligroso"
            disabled={!plan || eliminando}
            onClick={() => void eliminar()}
          >
            {eliminando ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
