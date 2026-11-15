// Los scripts del proyecto (C-11, D-043): un botón por cada script de `docs/scripts.md`. Un comando corre en una
// ventana de consola; un archivo o una carpeta se abre con Windows. Van en dos lugares (D-044, Q-63): en lista después
// de los pendientes de la vista de entrada, y en su sección, cada uno con su descripción entera.
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { ResultadoScript, ScriptsProyecto } from '../../../compartido/puente'
import type { ScriptVista } from '../../../compartido/visor'
import { usarEstado, vistaDe } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { tocarEnlace, useDocsCambian } from './enlaces'
import { BotonAtras } from './Lector'

/** Cuánto queda a la vista lo que pasó al tocar un botón. */
const AVISO_MS = 8000

type Corrida = { id: string; estado: 'corriendo' | ResultadoScript }

/** Los scripts del proyecto, que se releen si cambia `scripts.md`, y lo último que se tocó. */
function useScripts(ruta: string) {
  const [datos, setDatos] = useState<ScriptsProyecto | null>(null)
  const [ultima, setUltima] = useState<Corrida | null>(null)
  const leer = useCallback(() => {
    void window.iridium.scripts(ruta).then(setDatos)
  }, [ruta])
  useEffect(leer, [leer])
  useDocsCambian(ruta, leer)
  useEffect(() => {
    if (!ultima || ultima.estado === 'corriendo') return
    const t = setTimeout(() => setUltima(null), AVISO_MS)
    return () => clearTimeout(t)
  }, [ultima])
  const correr = async (id: string) => {
    setUltima({ id, estado: 'corriendo' })
    setUltima({ id, estado: await window.iridium.correrScript(ruta, id) })
  }
  return { datos, ultima, correr }
}

/** Ejecutar va en verde (R-58): es lo que se viene a hacer; Abrir, como cualquier secundario. */
function Boton({ s, corriendo, correr }: { s: ScriptVista; corriendo: boolean; correr: () => void }) {
  const abrir = s.modo === 'abrir'
  const accion = abrir ? 'Abrir' : 'Ejecutar'
  const que = s.modo === 'comando' ? `Corre «${s.valor}» en una ventana de consola` : s.valor
  return (
    <button
      type="button"
      className={abrir ? 'boton secundario chico' : 'boton secundario chico correr'}
      disabled={s.falta !== null || corriendo}
      title={s.falta ?? que}
      aria-label={`${accion} «${s.nombre}»`}
      onClick={correr}
    >
      <Icono nombre={abrir ? 'abrir' : 'play'} />
      {accion}
    </button>
  )
}

function Mensaje({ r }: { r: ResultadoScript }) {
  return (
    <p className={`script-msg ${r.tipo}`} role={r.tipo === 'error' ? 'alert' : 'status'}>
      <Icono nombre={r.tipo === 'ok' ? 'check' : 'error'} />
      {r.mensaje}
    </p>
  )
}

/**
 * Los scripts en la vista de entrada, después de los pendientes: un Bloque con una Fila por script, su nombre, la
 * descripción en dos líneas y el botón a la derecha (R-58). La sección Scripts los muestra con la descripción entera.
 */
export function ListaScripts({ ruta }: { ruta: string }) {
  const { datos, ultima, correr } = useScripts(ruta)
  const abrirSeccion = usarEstado((s) => s.abrirSeccion)
  if (!datos?.existe || datos.scripts.length === 0) return null
  return (
    <section className="bloque lista-scripts" aria-label="Scripts">
      <h2 className="bloque-titulo">
        Scripts <span className="cuenta">{datos.scripts.length}</span>
        <button
          type="button"
          className="boton sin-fondo chico derecha"
          onClick={() => abrirSeccion(ruta, 'scripts')}
        >
          Ver con detalles
        </button>
      </h2>
      <div className="filas con-lineas">
        {datos.scripts.map((s) => {
          const mia = ultima?.id === s.id ? ultima.estado : null
          return (
            <div key={s.id} className="fila con-detalle" data-script={s.id}>
              <div className="principal-fila">
                <span className="titulo-fila">{s.nombre}</span>
                {s.descripcionHtml && (
                  <span
                    className="detalle desc-script"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
                    dangerouslySetInnerHTML={{ __html: s.descripcionHtml }}
                  />
                )}
                {s.falta && <span className="detalle falta-script">{s.falta}</span>}
                {mia && mia !== 'corriendo' && <Mensaje r={mia} />}
              </div>
              <Boton s={s} corriendo={mia === 'corriendo'} correr={() => void correr(s.id)} />
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** La sección Scripts: cada script con su descripción y su botón. */
export function Scripts({ ruta }: { ruta: string }) {
  const { datos, ultima, correr } = useScripts(ruta)
  const atras = usarEstado((s) => vistaDe(s.vistas, ruta).atras.length)
  let vacia: ReactNode = null
  if (datos && !datos.existe)
    vacia = (
      <>
        Este proyecto no tiene <code>docs/scripts.md</code>. Ahí la IA anota lo que vos ejecutás a mano (abrir
        la app, armarla, instalarla) y acá aparece como botones.
      </>
    )
  else if (datos?.scripts.length === 0)
    vacia = (
      <>
        <code>docs/scripts.md</code> no tiene scripts con una línea <b>Ejecutar:</b> o <b>Abrir:</b>.
      </>
    )
  return (
    <>
      <Cabecera
        titulo="Scripts"
        cuenta={datos?.existe && datos.scripts.length > 0 ? datos.scripts.length : undefined}
        acciones={atras > 0 && <BotonAtras ruta={ruta} />}
        vacia={vacia}
      />
      <div className="scripts">
        <div className="scripts-col">
          {!datos && <p className="nota">Leyendo…</p>}
          {datos?.scripts.map((s) => {
            const mia = ultima?.id === s.id ? ultima.estado : null
            return (
              <div key={s.id} className="script" data-script={s.id}>
                <div className="script-cab">
                  <h4>{s.nombre}</h4>
                  <Boton s={s} corriendo={mia === 'corriendo'} correr={() => void correr(s.id)} />
                </div>
                {s.descripcionHtml && (
                  // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces de adentro, que ya son enfocables.
                  <div
                    className="doc-texto script-desc"
                    onClick={(e) => tocarEnlace(e, ruta)}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
                    dangerouslySetInnerHTML={{ __html: s.descripcionHtml }}
                  />
                )}
                {s.falta && <p className="script-msg error">{s.falta}</p>}
                {mia && mia !== 'corriendo' && <Mensaje r={mia} />}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
