// Docs (W-8): abre el documento que se pidió (desde el Mapa, un enlace o su menú) o, la primera vez, `estado.md`.
import { useMemo } from 'react'
import { usarEstado, vistaDe } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Lector, useDocumentos } from './Lector'

function inicial(lista: string[]): string {
  return (
    lista.find((d) => d === 'docs/estado.md') ?? lista.find((d) => /^readme\.md$/i.test(d)) ?? lista[0] ?? ''
  )
}

export function Docs({ ruta }: { ruta: string }) {
  const doc = usarEstado((s) => vistaDe(s.vistas, ruta).doc)
  const lista = useDocumentos(ruta)
  const primero = lista ? inicial(lista) : null
  const lugar = useMemo(() => doc ?? (primero ? { documento: primero, ancla: '' } : null), [doc, primero])
  if (lista && lista.length === 0)
    return (
      <>
        <Cabecera titulo="Docs" />
        <div className="docs-vacia">
          <div className="recuadro vacio">
            <strong>Este proyecto no tiene documentos</strong>
            <span>
              No hay archivos <code>.md</code> en <code>docs/</code> ni en la carpeta del proyecto.
            </span>
          </div>
        </div>
      </>
    )
  if (!lista || !lugar) return <div className="docs-carga" aria-busy="true" />
  return <Lector ruta={ruta} lugar={lugar} documentos={lista} />
}
