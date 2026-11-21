// La cabecera de una sección (04-ux.md › W-9, A-8), con la Cabecera de sección (PZ-9) de las piezas: la misma en todas.
// Título y cuenta a la izquierda, la ruta en gris, una o dos acciones a la derecha y, debajo, los Filtros (PZ-6) con su
// cuenta. Vacía, debajo, una línea de para qué es la sección con su acción principal.
import type { ReactNode } from 'react'

export type Filtro = { clave: string; nombre: string; n?: number; titulo?: string }

/** Los filtros de una sección (PZ-6): el elegido, subrayado (W-9). */
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
    <fieldset className="grupo-filtros" aria-label={etiqueta}>
      {filtros.map((f) => (
        <button
          key={f.clave}
          type="button"
          className={f.clave === elegido ? 'filtro elegido' : 'filtro'}
          aria-pressed={f.clave === elegido}
          title={f.titulo}
          onClick={() => elegir(f.clave)}
        >
          {f.nombre}
          {f.n !== undefined && (
            <>
              {' '}
              <span className="cuenta">{f.n}</span>
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
  // La pieza escribe el título como h1; dentro de un proyecto (debajo de su nombre) se lee como de segundo nivel.
  return (
    <>
      <header className="cabecera">
        <div className="fila-cab">
          {icono}
          <h1 title={titulo} aria-level={nivel === 1 ? undefined : 2}>
            {titulo}
            {typeof cuenta === 'number' ? <span className="cuenta">{cuenta}</span> : cuenta}
          </h1>
          {sub && <span className="ruta">{sub}</span>}
          {acciones && <span className="acciones-cab">{acciones}</span>}
        </div>
        {filtros && <div className="filtros">{filtros}</div>}
      </header>
      {vacia && <p className="cab-vacia">{vacia}</p>}
    </>
  )
}
