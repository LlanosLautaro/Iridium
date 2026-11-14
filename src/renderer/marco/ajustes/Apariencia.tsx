// Ajustes › Apariencia (AJ-1): hay un solo tema, el negro (D-104), así que acá queda el ancho de lectura de Docs, el
// mismo que se elige arriba del documento. Cambia en el momento.
import { usarEstado } from '../../estado'
import { ANCHOS } from '../../secciones/proyecto/Lector'
import type { PropsSeccion } from '../Ajustes'

export function Apariencia({ cambiar }: PropsSeccion) {
  const ancho = usarEstado((s) => s.preferencias.anchoHoja)
  return (
    <div className="campo-ajuste">
      <div>
        <div className="r" id="ajuste-ancho">
          Ancho de lectura
        </div>
        <div className="d" id="ajuste-ancho-d">
          Lo ancho del texto en Docs.
        </div>
      </div>
      <fieldset className="ancho-lectura" aria-labelledby="ajuste-ancho" aria-describedby="ajuste-ancho-d">
        {ANCHOS.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={ancho === a.id}
            onClick={() => {
              if (ancho !== a.id) void cambiar({ anchoHoja: a.id })
            }}
          >
            {a.nombre}
          </button>
        ))}
      </fieldset>
    </div>
  )
}
