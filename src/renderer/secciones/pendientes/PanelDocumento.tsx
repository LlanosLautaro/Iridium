// «Ver entero» (W-5 › Panel derecho): el documento citado, angosto, abierto en su sección. Los códigos de adentro
// también son enlaces y llevan a su documento en el mismo panel. Se cierra con × o Esc. El lector completo, con
// «En esta página» y volver en un paso, es Docs (I-4).
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Destino } from '../../../compartido/puente'
import type { ContenidoDocumento } from '../../../compartido/visor'
import { Icono } from '../../ui/Icono'
import { alTocarEnlace } from './Pendiente'

export type { Destino }

export function PanelDocumento({
  ruta,
  destino,
  navegar,
  cerrar,
}: {
  ruta: string
  destino: Destino
  navegar: (d: Destino) => void
  cerrar: () => void
}) {
  const [contenido, setContenido] = useState<{ documento: string; c: ContenidoDocumento } | null>(null)
  const cuerpo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let vigente = true
    void window.iridium.documento(ruta, destino.documento).then((c) => {
      if (vigente) setContenido({ documento: destino.documento, c })
    })
    return () => {
      vigente = false
    }
  }, [ruta, destino.documento])

  useEffect(() => {
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [cerrar])

  // Baja a la sección y la marca.
  useLayoutEffect(() => {
    const el = cuerpo.current
    if (!el || contenido?.documento !== destino.documento) return
    for (const m of el.querySelectorAll('.marcada')) m.classList.remove('marcada')
    const a = destino.ancla
    const seccion = a
      ? (el.querySelector(`[id="${CSS.escape(a)}"]`) ?? el.querySelector(`[data-slug="${CSS.escape(a)}"]`))
      : null
    if (seccion) {
      seccion.classList.add('marcada')
      el.scrollTop = (seccion as HTMLElement).offsetTop - 12
    } else el.scrollTop = 0
  }, [contenido, destino])

  const nombre = destino.documento.replace(/^docs\//, '')
  const c = contenido?.documento === destino.documento ? contenido.c : null
  return (
    <aside className="panel-doc" aria-label={`Documento ${nombre}`}>
      <div className="cab-panel">
        <span className="ruta" title={destino.documento}>
          {nombre}
        </span>
        <button
          type="button"
          className="btn-ic"
          title="Cerrar (Esc)"
          aria-label="Cerrar el documento"
          onClick={cerrar}
        >
          <Icono nombre="x" />
        </button>
      </div>
      {!c && <div className="doc carga" aria-busy="true" />}
      {c?.tipo === 'noExiste' && (
        <div className="doc">
          <p className="aviso-doc">El documento ya no existe.</p>
        </div>
      )}
      {c?.tipo === 'error' && (
        <div className="doc">
          <p className="aviso-doc">No se pudo leer: {c.mensaje}</p>
        </div>
      )}
      {c?.tipo === 'ok' && (
        // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces de adentro, que ya son enfocables.
        <div
          ref={cuerpo}
          className="doc doc-texto"
          onClick={(e) => alTocarEnlace(e, navegar)}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
          dangerouslySetInnerHTML={{ __html: c.html }}
        />
      )}
    </aside>
  )
}
