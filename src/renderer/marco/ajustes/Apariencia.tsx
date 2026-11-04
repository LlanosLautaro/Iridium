// Ajustes › Apariencia (AJ-1): el tema, como tarjetas con una miniatura de la app. Cambia en el momento, también lo que
// está detrás de la ventana.
import type { Tema } from '../../../compartido/puente'
import carbon from '../../assets/temas/carbon.jpg'
import iridium from '../../assets/temas/iridium.jpg'
import { usarEstado } from '../../estado'
import type { PropsSeccion } from '../Ajustes'

const TEMAS_VISTA: { id: Tema; nombre: string; detalle: string; miniatura: string }[] = [
  { id: 'iridium', nombre: 'Iridium', detalle: 'verde, Chakra Petch', miniatura: iridium },
  { id: 'carbon', nombre: 'Carbón', detalle: 'gris oscuro, letra del sistema', miniatura: carbon },
]

export function Apariencia({ cambiar }: PropsSeccion) {
  const tema = usarEstado((s) => s.preferencias.tema)
  return (
    <>
      <div className="r" id="ajuste-tema">
        Tema
      </div>
      <div className="temas" role="radiogroup" aria-labelledby="ajuste-tema">
        {TEMAS_VISTA.map((t) => (
          // biome-ignore lint/a11y/useSemanticElements: una tarjeta con imagen; un input radio no la puede contener.
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={tema === t.id}
            className={tema === t.id ? 'tema sel' : 'tema'}
            onClick={() => {
              if (tema !== t.id) void cambiar({ tema: t.id })
            }}
          >
            <img src={t.miniatura} alt="" />
            <span className="n">
              {t.nombre} <span>{t.detalle}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="pie">El tema cambia en el momento, también lo que está detrás de esta ventana.</p>
    </>
  )
}
