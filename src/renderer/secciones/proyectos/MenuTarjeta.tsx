// El menú del clic derecho en una tarjeta (R-7, C-9, C-12, D-089): abrir el proyecto, en VS Code o su carpeta; pasarlo
// al framework o ver sus avisos (OR-8, T-48); y de la ficha, el estado, archivar y el ícono; y eliminarlo, con
// confirmación (R-10). Si el proyecto marca lo que abre, Ejecutar Alfa (frente Abrir, AB-1). En rescate no está: pide decir qué proyecto lo reemplaza (eso, con la IA).
import { diaDe } from '../../../compartido/notas'
import type { ListaProyectos, ResultadoFicha, TarjetaProyecto } from '../../../compartido/puente'
import { ESTADOS, type Estado, NOMBRE_ESTADO } from '../../../compartido/tipos'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import { MenuContextual, type Punto } from '../../ui/MenuContextual'
import { ejecutarProyecto, nombreEjecutar } from '../proyecto/ejecutar'

/** Lo que pasó, para el aviso de la grilla. */
export interface AvisoGrilla {
  texto: string
  error: boolean
}

type CambioTarjeta = Partial<Pick<TarjetaProyecto, 'estado' | 'archivado' | 'archivadoEl'>>

/** Le pone el cambio a la tarjeta de esa ruta en la grilla de ahora, sin esperar al disco. */
function tocarTarjeta(ponerLista: (l: ListaProyectos) => void, ruta: string, cambio: CambioTarjeta): void {
  const lista = usarEstado.getState().lista
  if (lista?.tipo !== 'lista') return
  ponerLista({ ...lista, proyectos: lista.proyectos.map((t) => (t.ruta === ruta ? { ...t, ...cambio } : t)) })
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
  const verFramework = usarEstado((s) => s.verFramework)
  const cambiarSkills = usarEstado((s) => s.cambiarSkills)
  const enviados = usarEstado((s) => s.skills.enviados)
  const danada = p.problema !== null
  // Actualizar al framework (OR-8): de framework viejo o una carpeta simple; la ventana del proceso principal lo vuelve a
  // comprobar (archivados y reemplazados no cuentan).
  const pasable = !danada && !p.archivado && (p.framework === 'viejo' || p.framework === null)
  const conAvisos = p.framework !== null && p.framework !== 'viejo' && p.framework.avisos.length > 0
  /** La ficha se toca desde acá solo si existe y está sana (el estado la crea). */
  const sinFicha = danada
    ? 'La ficha está dañada: pide a la IA que la arregle'
    : p.estado === null
      ? 'Primero elige un estado: así se crea la ficha'
      : null

  const hacer = (accion: () => Promise<void>) => () => {
    cerrar()
    avisar(null)
    void accion().catch((e: unknown) =>
      avisar({ texto: e instanceof Error ? e.message : String(e), error: true }),
    )
  }
  const conFicha = async (r: Promise<ResultadoFicha>) => {
    const res = await r
    if (res.tipo === 'ok') ponerLista(res.lista)
    else if (res.tipo === 'error') avisar({ texto: res.mensaje, error: true })
  }
  /**
   * El estado y archivar se ven en la tarjeta al instante (Q-240): la grilla cambia antes de escribir la ficha y vuelve
   * como estaba solo si no se pudo.
   */
  const optimista = async (cambio: CambioTarjeta, r: () => Promise<ResultadoFicha>) => {
    const antes: CambioTarjeta = {}
    for (const k of Object.keys(cambio) as (keyof CambioTarjeta)[])
      Object.assign(antes, { [k]: p[k] ?? null })
    tocarTarjeta(ponerLista, p.ruta, cambio)
    try {
      const res = await r()
      if (res.tipo === 'ok') return ponerLista(res.lista)
      tocarTarjeta(ponerLista, p.ruta, antes)
      if (res.tipo === 'error') avisar({ texto: res.mensaje, error: true })
    } catch (e) {
      tocarTarjeta(ponerLista, p.ruta, antes)
      throw e
    }
  }
  const archivar = (archivado: boolean): Promise<void> =>
    optimista({ archivado, archivadoEl: archivado ? diaDe(new Date()) : null }, () =>
      window.iridium.archivarProyecto(p.ruta, archivado),
    )
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
      {p.ejecutar && (
        <button
          type="button"
          role="menuitem"
          title={p.ejecutar.detalle}
          onClick={hacer(() => ejecutarProyecto(p))}
        >
          <Icono nombre="play" />
          {nombreEjecutar(p)}
        </button>
      )}
      {(pasable || conAvisos) && <hr />}
      {pasable && (
        <button
          type="button"
          role="menuitem"
          title="Le manda el pedido a la IA de este proyecto, en una conversación nueva: gasta uso"
          onClick={hacer(async () => {
            await window.iridium.pasarAlFramework(p.ruta)
            cambiarSkills({ enviados: [...enviados.filter((r) => r !== p.ruta), p.ruta] })
            avisar({ texto: `La IA de «${p.nombre}» lo está actualizando al framework.`, error: false })
          })}
        >
          <Icono nombre="marca" />
          Actualizar al framework
        </button>
      )}
      {conAvisos && (
        <button type="button" role="menuitem" onClick={hacer(async () => verFramework(p.ruta))}>
          <Icono nombre="espera" />
          Ver los avisos del framework
        </button>
      )}
      {!danada && (
        <>
          <hr />
          <p className="titulo-menu" id="menu-estado">
            Estado
          </p>
          {/* biome-ignore lint/a11y/useSemanticElements: un grupo de opciones de menú, no un formulario. */}
          <div role="group" aria-labelledby="menu-estado">
            {ELEGIBLES.map((e: Estado) => (
              <button
                key={e}
                type="button"
                role="menuitemradio"
                aria-checked={p.estado === e}
                onClick={hacer(() =>
                  optimista({ estado: e }, () => window.iridium.estadoProyecto(p.ruta, e)),
                )}
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
      <button type="button" role="menuitem" className="peligroso" onClick={hacer(async () => eliminar())}>
        <Icono nombre="eliminar" />
        Eliminar…
      </button>
    </MenuContextual>
  )
}
