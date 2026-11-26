// Ajustes › Apariencia (AJ-1): hay un solo tema, el negro (D-104). Arriba el acento, el color de lo activo (Pulido,
// D-197), con su muestra en cada opción; debajo el ancho de lectura de Docs, el mismo que se elige arriba del documento.
// Los dos con los Filtros (PZ-6) de la maqueta y cambian en el momento.
import type { Acento } from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import { ANCHOS } from '../../secciones/proyecto/Lector'
import type { PropsSeccion } from '../Ajustes'
import { Ajuste } from './Ajuste'

export const ACENTOS: { id: Acento; nombre: string }[] = [
  { id: 'cian', nombre: 'Cian' },
  { id: 'verde', nombre: 'Verde' },
  { id: 'azul', nombre: 'Azul' },
  { id: 'violeta', nombre: 'Violeta' },
]

export function Apariencia({ cambiar }: PropsSeccion) {
  const ancho = usarEstado((s) => s.preferencias.anchoHoja)
  const acento = usarEstado((s) => s.preferencias.acento)
  return (
    <>
      <Ajuste
        titulo="Acento"
        detalle="El color de lo activo: la sección elegida, lo que espera, lo que corre"
        id="ajuste-acento"
      >
        <fieldset className="filtros" aria-labelledby="ajuste-acento" aria-describedby="ajuste-acento-d">
          {ACENTOS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={acento === a.id ? 'filtro elegido' : 'filtro'}
              aria-pressed={acento === a.id}
              onClick={() => {
                if (acento !== a.id) void cambiar({ acento: a.id })
              }}
            >
              <span className="muestra-color" style={{ background: `var(--acento-${a.id})` }} />
              {a.nombre}
            </button>
          ))}
        </fieldset>
      </Ajuste>
      <Ajuste titulo="Ancho de lectura" detalle="Lo ancho del texto en Docs" id="ajuste-ancho">
        <fieldset className="filtros" aria-labelledby="ajuste-ancho" aria-describedby="ajuste-ancho-d">
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
    </>
  )
}
