// Ajustes › Apariencia (AJ-1): hay un solo tema, el negro (D-104), y el acento, el color de lo activo (Pulido, D-197),
// con su muestra en cada opción, con los Filtros (PZ-6) de la maqueta; cambia en el momento. El ancho de lectura se
// elige solo arriba del documento en Docs, donde se usa (T-102, Q-317).
import type { Acento } from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import type { PropsSeccion } from '../Ajustes'
import { Ajuste } from './Ajuste'

export const ACENTOS: { id: Acento; nombre: string }[] = [
  { id: 'cian', nombre: 'Cian' },
  { id: 'verde', nombre: 'Verde' },
  { id: 'azul', nombre: 'Azul' },
  { id: 'violeta', nombre: 'Violeta' },
]

export function Apariencia({ cambiar }: PropsSeccion) {
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
    </>
  )
}
