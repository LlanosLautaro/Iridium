// Probar una dirección (DS-5, DS-9, DS-11; DI-I4): otro `tokens.css` sobre todas las maquetas a la vez. El menú de la
// cabecera ofrece las guardadas en `direcciones/` y una nueva, que queda citada en la conversación (D-196). Con una
// puesta, una línea arriba del lienzo dice cuál es, alterna Hoy · Dirección · Lado a lado, y ofrece Elegir (con su
// cuadro: cambia todas las maquetas) y Descartar (a la papelera).
import { useEffect, useRef } from 'react'
import type { DireccionVista } from '../../../../compartido/diseno'
import { Filtros } from '../../../ui/Cabecera'
import { Icono } from '../../../ui/Icono'
import { Menu } from '../../../ui/Menu'

/** Cómo se ve el lienzo con una dirección puesta: solo con ella, como hoy, o las dos lado a lado. */
export type ModoDireccion = 'direccion' | 'hoy' | 'lado'

/** El nombre como se muestra: `azul-apagado` → `azul apagado`; las fechas quedan con sus guiones. */
export function nombreDe(d: { nombre: string }): string {
  return d.nombre.replace(/(?<!\d)[-_]+|[-_]+(?!\d)/g, ' ').trim() || d.nombre
}

export function MenuDirecciones({
  direcciones,
  probando,
  trabajando,
  probar,
  pedirNueva,
}: {
  direcciones: readonly DireccionVista[]
  /** La que está puesta, o null. */
  probando: string | null
  trabajando: boolean
  probar: (archivo: string) => void
  pedirNueva: () => void
}) {
  return (
    <Menu
      enLista
      clase="di-menu-direcciones"
      titulo="Cambiar los tokens de todas las maquetas a la vez, para mirar cómo quedan"
      boton={
        <>
          <Icono nombre="diseno" />
          Probar una dirección
        </>
      }
    >
      {(cerrar) => (
        <>
          <h4 className="titulo-menu">Direcciones guardadas</h4>
          {direcciones.length === 0 && <p className="di-menu-vacio">Todavía no hay: pedile una a la IA.</p>}
          {direcciones.map((d) => (
            <button
              key={d.archivo}
              type="button"
              role="menuitemradio"
              aria-checked={d.archivo === probando}
              className={d.archivo === probando ? 'actual' : undefined}
              onClick={() => {
                cerrar()
                probar(d.archivo)
              }}
            >
              <span className="principal-fila">
                <span className="titulo-fila">{nombreDe(d)}</span>
                <span className="detalle">{d.descripcion ?? d.archivo}</span>
              </span>
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            disabled={trabajando}
            title={trabajando ? 'Su IA está trabajando' : undefined}
            onClick={() => {
              cerrar()
              pedirNueva()
            }}
          >
            <span className="principal-fila">
              <span className="titulo-fila">Una nueva…</span>
              <span className="detalle">
                Queda citada en la conversación: escribís qué probar y la mandás
              </span>
            </span>
          </button>
        </>
      )}
    </Menu>
  )
}

/** La línea arriba del lienzo con una dirección puesta (DS-11: «Probando: negro con azul · Hoy · Elegir · Descartar»). */
export function Probando({
  direccion,
  modo,
  cambiarModo,
  trabajando,
  elegir,
  descartar,
  dejar,
}: {
  direccion: DireccionVista
  modo: ModoDireccion
  cambiarModo: (m: ModoDireccion) => void
  trabajando: boolean
  elegir: () => void
  descartar: () => void
  /** Dejar de probarla: vuelve a como está hoy, sin tocar nada. */
  dejar: () => void
}) {
  const ocupado = trabajando ? 'Su IA está trabajando' : null
  return (
    <div className="di-probando" role="status" aria-label={`Probando la dirección ${nombreDe(direccion)}`}>
      <span className="di-probando-t">
        Probando: <b>{nombreDe(direccion)}</b>
        {direccion.descripcion && (
          <span className="sub" title={direccion.descripcion}>
            {' '}
            · {direccion.descripcion}
          </span>
        )}
      </span>
      <Filtros
        filtros={[
          { clave: 'hoy', nombre: 'Hoy', titulo: 'Las maquetas como están' },
          { clave: 'direccion', nombre: 'Dirección', titulo: 'Las maquetas con la dirección' },
          { clave: 'lado', nombre: 'Lado a lado', titulo: 'Cada maqueta como está y con la dirección' },
        ]}
        elegido={modo}
        elegir={(c) => cambiarModo(c as ModoDireccion)}
        etiqueta="Cómo ver la dirección"
      />
      {direccion.problema && (
        <span className="di-probando-problema">
          <Icono nombre="espera" />
          {direccion.problema}
        </span>
      )}
      <span className="di-probando-acciones">
        <button
          type="button"
          className="boton secundario chico"
          disabled={trabajando || direccion.problema !== null}
          title={
            ocupado ??
            (direccion.problema
              ? `No se puede elegir: ${direccion.problema}. Pedile a la IA que la corrija.`
              : 'Sus tokens pasan a ser los de todas las maquetas')
          }
          onClick={elegir}
        >
          Elegir
        </button>
        <button
          type="button"
          className="boton sin-fondo chico"
          disabled={trabajando}
          title={ocupado ?? 'Su archivo va a la papelera y las maquetas quedan como están'}
          onClick={descartar}
        >
          Descartar
        </button>
        <button
          type="button"
          className="boton sin-fondo chico solo-icono"
          aria-label="Dejar de probarla"
          title="Dejar de probarla: queda guardada y las maquetas, como están"
          onClick={dejar}
        >
          <Icono nombre="x" />
        </button>
      </span>
    </div>
  )
}

/** El cuadro de Elegir (DS-9): dice qué cambia antes de hacerlo. */
export function ConfirmarElegir({
  direccion,
  elegir,
  cerrar,
}: {
  direccion: DireccionVista
  elegir: () => void
  cerrar: () => void
}) {
  const primero = useRef<HTMLButtonElement>(null)
  useEffect(() => primero.current?.focus(), [])
  return (
    <div className="velo capa-cuadro">
      <div
        className="cuadro"
        role="dialog"
        aria-modal="true"
        aria-labelledby="di-elegir-t"
        aria-describedby="di-elegir-d"
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          e.stopPropagation()
          cerrar()
        }}
      >
        <h2 id="di-elegir-t">Elegir «{nombreDe(direccion)}»</h2>
        <p id="di-elegir-d">
          Cambia los colores, las letras y las medidas de todas las maquetas: sus tokens pasan a ser los de{' '}
          <code>tokens.css</code>. Los de hoy quedan guardados como una dirección más («anterior», con la
          fecha), y se puede volver eligiéndola. La app no cambia hasta que la pases al código.
        </p>
        <div className="pie">
          <button ref={primero} type="button" className="boton sin-fondo" onClick={cerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton principal"
            onClick={() => {
              elegir()
              cerrar()
            }}
          >
            Elegir
          </button>
        </div>
      </div>
    </div>
  )
}
