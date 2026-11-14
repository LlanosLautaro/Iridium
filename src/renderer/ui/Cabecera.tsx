// La cabecera de una sección (04-ux.md › W-9, A-8): la misma en todas. Título y cuenta a la izquierda, una o dos
// acciones a la derecha y, en la segunda fila, los filtros como píldoras con su cuenta. La misma altura en todas las
// secciones. Vacía, debajo, una línea de para qué es la sección con su acción principal.
import type { ReactNode } from 'react'

export type Filtro = { clave: string; nombre: string; n?: number; titulo?: string }

/** Los filtros de una sección: el elegido con el fondo de selección (W-9). */
export function Filtros({
  filtros,
  elegido,
  elegir,
  etiqueta,
}: {
  filtros: readonly Filtro[]
  elegido: string
  elegir: (clave: string) => void
  /** Para el lector de pantalla: «Filtrar por frente». */
  etiqueta: string
}) {
  return (
    <fieldset className="cab-filtros" aria-label={etiqueta}>
      {filtros.map((f) => (
        <button
          key={f.clave}
          type="button"
          className={f.clave === elegido ? 'cab-filtro sel' : 'cab-filtro'}
          aria-pressed={f.clave === elegido}
          title={f.titulo}
          onClick={() => elegir(f.clave)}
        >
          {f.nombre}
          {f.n !== undefined && (
            <>
              {' '}
              <span className="n">{f.n}</span>
            </>
          )}
        </button>
      ))}
    </fieldset>
  )
}

export function Cabecera({
  titulo,
  cuenta,
  sub,
  icono,
  acciones,
  filtros,
  vacia,
  nivel = 2,
}: {
  titulo: string
  /** Un número en mono gris, o la pieza Cuenta de la bandeja. */
  cuenta?: ReactNode
  /** Un dato que acompaña al título, en gris (el hito, la carpeta de proyectos). */
  sub?: ReactNode
  icono?: ReactNode
  acciones?: ReactNode
  /** La segunda fila: los filtros (y, a la derecha, un menú como «Frente ▾»). */
  filtros?: ReactNode
  /** Sin contenido: para qué es la sección y su acción principal. */
  vacia?: ReactNode
  /** h1 en el inicio, h2 dentro de un proyecto (debajo de su nombre). */
  nivel?: 1 | 2
}) {
  const H = nivel === 1 ? 'h1' : 'h2'
  return (
    <>
      <header className="cab-seccion">
        <div className="cab-1">
          {icono}
          <H title={titulo}>{titulo}</H>
          {typeof cuenta === 'number' ? <span className="n">{cuenta}</span> : cuenta}
          {sub && <span className="sub">{sub}</span>}
          {acciones && <div className="der">{acciones}</div>}
        </div>
        {filtros && <div className="cab-2">{filtros}</div>}
      </header>
      {vacia && <p className="cab-vacia">{vacia}</p>}
    </>
  )
}
