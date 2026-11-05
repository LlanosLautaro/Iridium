// El menú del clic derecho en una tarjeta (R-7, C-9, C-12, D-089): abrir el proyecto, en VS Code o su carpeta; y de la
// ficha, el estado, archivar y el ícono; y eliminarlo, con confirmación (R-10). En rescate no está: pide decir qué proyecto lo reemplaza (eso, con la IA).
import type { ListaProyectos, ResultadoFicha, TarjetaProyecto } from '../../../compartido/puente'
import { ESTADOS, type Estado, NOMBRE_ESTADO } from '../../../compartido/tipos'
import { Icono } from '../../ui/Icono'
import { MenuContextual, type Punto } from '../../ui/MenuContextual'

/** Lo que pasó, para el aviso de la grilla; `deshacer` vuelve atrás (archivar). */
export interface AvisoGrilla {
  texto: string
  error: boolean
  deshacer?: () => void
}

const ELEGIBLES = ESTADOS.filter((e) => e !== 'en-rescate')

export function MenuTarjeta({
  p,
  en,
  cerrar,
  abrir,
  ponerLista,
  avisar,
  eliminar,
}: {
  p: TarjetaProyecto
  en: Punto
  cerrar: () => void
  abrir: () => void
  ponerLista: (l: ListaProyectos) => void
  avisar: (a: AvisoGrilla | null) => void
  /** Abre la confirmación de Eliminar (R-10). */
  eliminar: () => void
}) {
  const danada = p.problema !== null
  /** La ficha se toca desde acá solo si existe y está sana (el estado la crea). */
  const sinFicha = danada
    ? 'La ficha está dañada: pedile a la IA que la arregle'
    : p.estado === null
      ? 'Primero elegí un estado: así se crea la ficha'
      : null

  const hacer = (accion: () => Promise<void>) => () => {
    cerrar()
    avisar(null)
    void accion().catch((e: unknown) =>
      avisar({ texto: e instanceof Error ? e.message : String(e), error: true }),
    )
  }
  const conFicha = async (r: Promise<ResultadoFicha>, ok?: AvisoGrilla) => {
    const res = await r
    if (res.tipo === 'ok') {
      ponerLista(res.lista)
      if (ok) avisar(ok)
    } else if (res.tipo === 'error') avisar({ texto: res.mensaje, error: true })
  }
  const archivar = (archivado: boolean): Promise<void> =>
    conFicha(window.iridium.archivarProyecto(p.ruta, archivado), {
      texto: `«${p.nombre}» ${archivado ? 'archivado' : 'vuelve a la grilla'}.`,
      error: false,
      deshacer: () => void archivar(!archivado),
    })
  const abrirAfuera = async (r: Promise<{ tipo: 'ok' } | { tipo: 'error'; mensaje: string }>) => {
    const res = await r
    if (res.tipo === 'error') avisar({ texto: res.mensaje, error: true })
  }

  return (
    <MenuContextual en={en} etiqueta={`Acciones de ${p.nombre}`} cerrar={cerrar}>
      <button type="button" role="menuitem" onClick={hacer(async () => abrir())}>
        <Icono nombre="proyectos" />
        Abrir
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={hacer(() => abrirAfuera(window.iridium.abrirEnVsCode(p.ruta)))}
      >
        <Icono nombre="abrir" />
        Abrir en VS Code
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={hacer(() => abrirAfuera(window.iridium.abrirCarpetaProyecto(p.ruta)))}
      >
        <Icono nombre="carpeta" />
        Abrir la carpeta
      </button>
      {!danada && (
        <>
          <hr />
          <h3 id="menu-estado">Estado</h3>
          {/* biome-ignore lint/a11y/useSemanticElements: un grupo de opciones de menú, no un formulario. */}
          <div role="group" aria-labelledby="menu-estado">
            {ELEGIBLES.map((e: Estado) => (
              <button
                key={e}
                type="button"
                role="menuitemradio"
                aria-checked={p.estado === e}
                className="opcion-estado"
                onClick={hacer(() => conFicha(window.iridium.estadoProyecto(p.ruta, e)))}
              >
                <span className="marca">{p.estado === e && <Icono nombre="check" />}</span>
                {NOMBRE_ESTADO[e]}
              </button>
            ))}
          </div>
          <hr />
          <button
            type="button"
            role="menuitem"
            disabled={sinFicha !== null}
            title={sinFicha ?? undefined}
            onClick={hacer(() => archivar(!p.archivado))}
          >
            <Icono nombre="archivo" />
            {p.archivado ? 'Desarchivar' : 'Archivar'}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={sinFicha !== null}
            title={sinFicha ?? 'Una imagen de la carpeta del proyecto'}
            onClick={hacer(() => conFicha(window.iridium.iconoProyecto(p.ruta)))}
          >
            <Icono nombre="imagen" />
            Cambiar ícono…
          </button>
        </>
      )}
      <hr />
      <button type="button" role="menuitem" className="peligro" onClick={hacer(async () => eliminar())}>
        <Icono nombre="eliminar" />
        Eliminar…
      </button>
    </MenuContextual>
  )
}
