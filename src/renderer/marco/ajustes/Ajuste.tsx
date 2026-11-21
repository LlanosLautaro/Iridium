// Una fila de Ajustes, como la maqueta (docs/diseno/pantallas/ajustes.html): a la izquierda qué es y para qué, en
// gris; a la derecha el control, con lo que haga falta explicar debajo. Las filas se separan con una línea.
import type { ReactNode } from 'react'

export function Ajuste({
  titulo,
  detalle,
  id,
  campo,
  clase,
  atributos,
  children,
}: {
  titulo: string
  detalle?: ReactNode
  /** El id del título, para nombrar el control (`aria-labelledby`). */
  id?: string
  /** El id del campo que nombra el título, si es un texto: el título es su `<label>`. */
  campo?: string
  clase?: string
  atributos?: Record<`data-${string}`, string | undefined>
  children?: ReactNode
}) {
  return (
    <div className={clase ? `ajuste ${clase}` : 'ajuste'} {...atributos}>
      <div className="que">
        {campo ? (
          <label id={id} htmlFor={campo}>
            {titulo}
          </label>
        ) : (
          <span id={id}>{titulo}</span>
        )}
        {detalle && (
          <span className="expl" id={id ? `${id}-d` : undefined}>
            {detalle}
          </span>
        )}
      </div>
      <div className="control">{children}</div>
    </div>
  )
}
