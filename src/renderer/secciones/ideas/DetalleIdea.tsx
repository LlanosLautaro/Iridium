// El detalle de una idea (IN-1, IN-2): el título entero, de qué sección es y su fecha, el cuerpo como en Docs, los
// proyectos que toca como enlaces y, si está integrada, a dónde fue. Para integrarla se le pide al chat (Q-115).
import type { MouseEvent, ReactNode } from 'react'
import type { Idea } from '../../../compartido/ideas'
import { usarEstado } from '../../estado'
import { tocarEnlace } from '../proyecto/enlaces'
import { fechaDeIdea, tipoDeIdea } from './textos'

/**
 * Un clic en un enlace del cuerpo: los de internet, al navegador; un documento o un archivo de la carpeta Ideas, en su
 * vista de proyecto.
 */
function alTocar(e: MouseEvent, rutaIdeas: string | null): void {
  const a = (e.target as HTMLElement).closest('a')
  if (!a || !rutaIdeas) {
    if (a) e.preventDefault()
    return
  }
  tocarEnlace(e, rutaIdeas)
  if (a.hasAttribute('data-doc') || a.hasAttribute('data-archivo'))
    usarEstado.getState().abrirProyecto(rutaIdeas)
}

export function DetalleIdea({
  idea,
  seccion,
  rutaIdeas,
}: {
  idea: Idea
  seccion: string
  /** La carpeta Ideas (la del chat); null si no está en la lista de proyectos. */
  rutaIdeas: string | null
}) {
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  return (
    <section className="sk-detalle id-detalle" aria-label={`La idea ${idea.titulo}`}>
      <div className="cab">
        <h2>{idea.titulo}</h2>
        <div className="origen">
          <span>
            {[tipoDeIdea(seccion), idea.fecha && fechaDeIdea(idea.fecha)].filter(Boolean).join(' · ')}
          </span>
        </div>
      </div>
      <div className="cuerpo">
        {idea.html ? (
          // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: los enlaces de adentro ya se usan con el teclado.
          <div
            className="md"
            onClick={(e) => alTocar(e, rutaIdeas)}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
            dangerouslySetInnerHTML={{ __html: idea.html }}
          />
        ) : (
          <p className="desc vacia">Sin más texto que el título.</p>
        )}
        {idea.toca.length > 0 && (
          <Fila etiqueta="Toca a">
            {idea.toca.map((t) =>
              t.ruta ? (
                <button
                  key={t.nombre}
                  type="button"
                  className="id-proyecto"
                  title={`Abrir ${t.nombre}`}
                  onClick={() => t.ruta && abrirProyecto(t.ruta)}
                >
                  {t.nombre}
                </button>
              ) : (
                <span key={t.nombre} className="id-proyecto falta" title="No está en la carpeta de proyectos">
                  {t.nombre}
                </span>
              ),
            )}
          </Fila>
        )}
        {idea.destinoHtml !== null && (
          <Fila etiqueta="Fue a">
            {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: como el cuerpo. */}
            <span
              className="md id-destino"
              onClick={(e) => alTocar(e, rutaIdeas)}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
              dangerouslySetInnerHTML={{ __html: idea.destinoHtml }}
            />
          </Fila>
        )}
      </div>
    </section>
  )
}

function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="id-fila">
      <span className="et">{etiqueta}</span>
      <div className="valor">{children}</div>
    </div>
  )
}

/** Lo que va al medio cuando no hay una idea para mostrar: falta la carpeta, el archivo, pesa de más… */
export function MensajeIdeas({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="sk-detalle id-detalle" aria-label={titulo}>
      <div className="cuerpo">
        <div className="id-mensaje" role="status">
          <b>{titulo}</b>
          <p>{children}</p>
        </div>
      </div>
    </section>
  )
}
