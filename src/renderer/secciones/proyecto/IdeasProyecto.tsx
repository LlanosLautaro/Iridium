// Las ideas del proyecto (R-8, D-089): lo que la guía anota para después, sin buscarlo en Docs. Las ideas nuevas de la
// construcción y las de la idea inicial, cada una con su documento; se releen cuando cambian.
import { useCallback, useEffect, useState } from 'react'
import type { IdeasProyecto as Ideas } from '../../../compartido/ideas'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import { nombreDoc, tocarEnlace, useDocsCambian } from './enlaces'

export function IdeasProyecto({ ruta }: { ruta: string }) {
  const [ideas, setIdeas] = useState<Ideas | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const leer = useCallback(() => {
    void window.iridium.ideasProyecto(ruta).then(
      (i) => {
        setIdeas(i)
        setError(null)
      },
      (e: unknown) => setError(e instanceof Error ? e.message : String(e)),
    )
  }, [ruta])
  useEffect(leer, [leer])
  useDocsCambian(ruta, leer)

  return (
    <div className="scripts ideas-proyecto">
      <div className="scripts-col">
        <div className="cab-scripts">
          <h2>Ideas del proyecto</h2>
        </div>
        <p className="nota">
          Lo que la IA anota para más adelante: las ideas nuevas de <code>07-construccion.md</code> y las de
          la idea inicial, en <code>00-idea.md</code>. Para sumar una, contásela en la conversación.
        </p>
        {error && (
          <p className="script-msg error" role="alert">
            <Icono nombre="error" />
            No se pudieron leer: {error}
          </p>
        )}
        {!ideas && !error && <p className="nota">Leyendo…</p>}
        {ideas?.secciones.length === 0 && (
          <p className="nota">
            Este proyecto todavía no tiene una sección de ideas. La guía la arma en <code>00-idea.md</code>{' '}
            (Ideas para después) y, desde la construcción, en <code>07-construccion.md</code> (Ideas nuevas).
          </p>
        )}
        {ideas?.secciones.map((s) => (
          <section key={s.documento} className="script seccion-ideas" aria-label={s.titulo}>
            <div className="script-cab">
              <h4>
                {s.titulo} {s.cantidad > 0 && <span className="n">{s.cantidad}</span>}
              </h4>
              <button
                type="button"
                className="btn secundario chico"
                title={`Abrir ${nombreDoc(s.documento)} en Docs`}
                onClick={() => abrirDoc(ruta, { documento: s.documento, ancla: s.ancla ?? '' })}
              >
                <Icono nombre="docs" />
                {nombreDoc(s.documento)}
              </button>
            </div>
            {s.html ? (
              // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces de adentro, que ya son enfocables.
              <div
                className="doc-texto"
                onClick={(e) => tocarEnlace(e, ruta)}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
                dangerouslySetInnerHTML={{ __html: s.html }}
              />
            ) : (
              <p className="nota">Vacía por ahora.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
