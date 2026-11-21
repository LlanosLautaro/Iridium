// Ajustes › Apariencia (AJ-1): hay un solo tema, el negro (D-104), así que acá queda el ancho de lectura de Docs, el
// mismo que se elige arriba del documento, con los Filtros (PZ-6) de la maqueta. Cambia en el momento.
import { usarEstado } from '../../estado'
import { ANCHOS } from '../../secciones/proyecto/Lector'
import type { PropsSeccion } from '../Ajustes'
import { Ajuste } from './Ajuste'

export function Apariencia({ cambiar }: PropsSeccion) {
  const ancho = usarEstado((s) => s.preferencias.anchoHoja)
  return (
    <Ajuste titulo="Ancho de lectura" detalle="Lo ancho del texto en Docs" id="ajuste-ancho">
      <fieldset
        className="filtros grupo-ancho"
        aria-labelledby="ajuste-ancho"
        aria-describedby="ajuste-ancho-d"
      >
        {ANCHOS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={ancho === a.id ? 'filtro elegido' : 'filtro'}
            aria-pressed={ancho === a.id}
            onClick={() => {
              if (ancho !== a.id) void cambiar({ anchoHoja: a.id })
            }}
          >
            {a.nombre}
          </button>
        ))}
      </fieldset>
    </Ajuste>
  )
}
