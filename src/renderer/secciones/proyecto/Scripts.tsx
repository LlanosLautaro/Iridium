// Los scripts del proyecto (C-11, D-043): un botón por cada script de `docs/scripts.md`. Un comando corre en una
// ventana de consola; un archivo o una carpeta se abre con Windows. Van en dos lugares (D-044, Q-63): en lista después
// de los pendientes de la vista de entrada, y en su sección, cada uno con su descripción entera.
import { useCallback, useEffect, useState } from 'react'
import type { ResultadoScript, ScriptsProyecto } from '../../../compartido/puente'
import type { ScriptVista } from '../../../compartido/visor'
import { usarEstado, vistaDe } from '../../estado'
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

function Boton({
  s,
  corriendo,
  correr,
  conNombre,
}: {
  s: ScriptVista
  corriendo: boolean
  correr: () => void
  conNombre: boolean
}) {
  const abrir = s.modo === 'abrir'
  const accion = abrir ? 'Abrir' : 'Ejecutar'
  const que = s.modo === 'comando' ? `Corre «${s.valor}» en una ventana de consola` : s.valor
  return (
    <button
      type="button"
      className="btn secundario chico"
      disabled={s.falta !== null || corriendo}
      title={s.falta ?? (conNombre ? `${s.nombre}: ${que}` : que)}
      onClick={correr}
    >
      <Icono nombre={abrir ? 'abrir' : 'play'} />
      {conNombre ? s.nombre : accion}
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

/** Los scripts en la vista de entrada, en lista después de los pendientes: el botón con el nombre y la descripción en una línea (R-2). */
export function ListaScripts({ ruta }: { ruta: string }) {
  const { datos, ultima, correr } = useScripts(ruta)
  const abrirSeccion = usarEstado((s) => s.abrirSeccion)
  if (!datos?.existe || datos.scripts.length === 0) return null
  return (
    <section className="lista-scripts" aria-label="Scripts">
      <div className="cab-scripts">
        <h3 className="grupo">Scripts</h3>
        <button type="button" className="enlace" onClick={() => abrirSeccion(ruta, 'scripts')}>
          Ver con detalles
        </button>
      </div>
      {datos.scripts.map((s) => {
        const mia = ultima?.id === s.id ? ultima.estado : null
        return (
          <div key={s.id} className="script-fila" data-script={s.id}>
            <Boton s={s} conNombre corriendo={mia === 'corriendo'} correr={() => void correr(s.id)} />
            <span
              className="desc"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
              dangerouslySetInnerHTML={{ __html: s.descripcionHtml }}
            />
            {mia && mia !== 'corriendo' && <Mensaje r={mia} />}
          </div>
        )
      })}
    </section>
  )
}

/** La sección Scripts: cada script con su descripción y su botón. */
export function Scripts({ ruta }: { ruta: string }) {
  const { datos, ultima, correr } = useScripts(ruta)
  const atras = usarEstado((s) => vistaDe(s.vistas, ruta).atras.length)
  return (
    <div className="scripts">
      <div className="scripts-col">
        <div className="cab-scripts">
          <h2>Scripts</h2>
          {atras > 0 && <BotonAtras ruta={ruta} />}
        </div>
        <p className="nota">
          Lo que anota la IA en <code>docs/scripts.md</code>: <b>Ejecutar</b> abre una consola con el comando,
          que queda abierta para ver qué pasó; <b>Abrir</b> lo abre con Windows.
        </p>
        {!datos && <p className="nota">Leyendo…</p>}
        {datos && !datos.existe && (
          <p className="nota">
            Este proyecto no tiene <code>docs/scripts.md</code>. Ahí la IA anota lo que vos ejecutás a mano
            (abrir la app, armarla, instalarla) y acá aparece como botones.
          </p>
        )}
        {datos?.existe && datos.scripts.length === 0 && (
          <p className="nota">
            <code>docs/scripts.md</code> no tiene scripts con una línea <b>Ejecutar:</b> o <b>Abrir:</b>.
          </p>
        )}
        {datos?.scripts.map((s) => {
          const mia = ultima?.id === s.id ? ultima.estado : null
          return (
            <div key={s.id} className="script" data-script={s.id}>
              <div className="script-cab">
                <h4>{s.nombre}</h4>
                <Boton
                  s={s}
                  conNombre={false}
                  corriendo={mia === 'corriendo'}
                  correr={() => void correr(s.id)}
                />
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
  )
}
