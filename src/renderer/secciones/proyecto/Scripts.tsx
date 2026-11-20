// Los scripts del proyecto (C-11, D-043): uno por cada script de `docs/scripts.md`. Un comando corre en una ventana de
// consola; un archivo o una carpeta se abre con Windows. Como la maqueta (DI-I3, tanda 14): cada script es una Fila con
// Ejecutar a la izquierda (R-45), en verde (R-58), y debajo lo que corre y para qué; tocándola se abre con su
// descripción entera (R-70), que suele decir cuándo usarlo.
import type { ReactNode } from 'react'
import { Fragment, useCallback, useEffect, useState } from 'react'
import type { ResultadoScript, ScriptsProyecto } from '../../../compartido/puente'
import type { ScriptVista } from '../../../compartido/visor'
import { usarEstado, vistaDe } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { tocarEnlace, useDocsCambian } from './enlaces'
import { BotonAtras } from './Lector'

/** Cuánto queda a la vista lo que pasó al tocar un botón (un error queda hasta volver a tocarlo). */
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
    if (!ultima || ultima.estado === 'corriendo' || ultima.estado.tipo === 'error') return
    const t = setTimeout(() => setUltima(null), AVISO_MS)
    return () => clearTimeout(t)
  }, [ultima])
  const correr = async (id: string) => {
    setUltima({ id, estado: 'corriendo' })
    setUltima({ id, estado: await window.iridium.correrScript(ruta, id) })
  }
  return { datos, ultima, correr }
}

/** El texto de la descripción, sin las marcas: el renglón de detalle y lo que se lee al pasar el mouse. */
function textoDe(html: string): string {
  return (new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Ejecutar (o Abrir) donde iba el ícono, que era igual en todos (R-45); en verde, lo que se viene a hacer (R-58). */
function Ejecutar({ s, corriendo, correr }: { s: ScriptVista; corriendo: boolean; correr: () => void }) {
  const abrir = s.modo === 'abrir'
  const accion = abrir ? 'Abrir' : 'Ejecutar'
  const que = s.modo === 'comando' ? `Corre «${s.valor}» en una ventana de consola` : `Abre ${s.valor}`
  return (
    <button
      type="button"
      className="boton solo-icono ejecutar"
      disabled={s.falta !== null || corriendo}
      title={s.falta ?? que}
      aria-label={`${accion} «${s.nombre}»`}
      onClick={correr}
    >
      <Icono nombre={abrir ? 'abrir' : 'play'} />
    </button>
  )
}

/** A la derecha de la fila: lo que falta, que está corriendo o cómo salió (un error abre la fila y va adentro). */
function Meta({ s, corrida }: { s: ScriptVista; corrida: Corrida['estado'] | null }) {
  if (s.falta)
    return (
      <span className="senal rojo" title={s.falta}>
        <Icono nombre="error" />
        No se encuentra
      </span>
    )
  if (corrida === 'corriendo')
    return <span className="senal">{s.modo === 'abrir' ? 'Abriendo…' : 'Ejecutando…'}</span>
  if (corrida?.tipo === 'ok')
    return (
      <span className="senal verde" role="status">
        <Icono nombre="check" />
        {corrida.mensaje.replace(/\.$/, '')}
      </span>
    )
  return null
}

/** La sección Scripts: una Fila por script, que se abre con su descripción. */
export function Scripts({ ruta }: { ruta: string }) {
  const { datos, ultima, correr } = useScripts(ruta)
  const [abiertos, setAbiertos] = useState<string[]>([])
  const atras = usarEstado((s) => vistaDe(s.vistas, ruta).atras.length)
  const alternar = (id: string) =>
    setAbiertos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))
  let vacia: ReactNode = null
  if (datos && !datos.existe)
    vacia = (
      <>
        Este proyecto no tiene <code>docs/scripts.md</code>. Ahí la IA anota lo que ejecutas a mano (abrir la
        app, armarla, instalarla) y aquí aparece para ejecutarlo.
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
        {datos && datos.scripts.length > 0 && (
          <div className="scripts-col filas con-lineas">
            {datos.scripts.map((s) => {
              const corrida = ultima?.id === s.id ? ultima.estado : null
              const error =
                corrida !== null && corrida !== 'corriendo' && corrida.tipo === 'error' ? corrida : null
              const descripcion = textoDe(s.descripcionHtml)
              const comando = s.carpeta ? `${s.valor} en ${s.carpeta}` : s.valor
              const detalle = [comando, descripcion].filter(Boolean).join(' · ')
              const conCuerpo = descripcion !== '' || s.falta !== null
              const abierta = (conCuerpo && abiertos.includes(s.id)) || error !== null
              const cuerpo = `script-${s.id}`
              return (
                <Fragment key={s.id}>
                  <div
                    className={abierta ? 'fila con-detalle abierta' : 'fila con-detalle'}
                    data-script={s.id}
                  >
                    <Ejecutar s={s} corriendo={corrida === 'corriendo'} correr={() => void correr(s.id)} />
                    <button
                      type="button"
                      className="abrir-script"
                      aria-expanded={conCuerpo ? abierta : undefined}
                      aria-controls={abierta ? cuerpo : undefined}
                      title={detalle}
                      disabled={!conCuerpo}
                      onClick={() => alternar(s.id)}
                    >
                      <span className="principal-fila">
                        <span className="titulo-fila">{s.nombre}</span>
                        {/* Abierta, la descripción ya está entera debajo: el renglón queda con lo que corre. */}
                        <span className="detalle">{abierta ? comando : detalle}</span>
                      </span>
                      <Meta s={s} corrida={corrida} />
                    </button>
                  </div>
                  {abierta && (
                    <div className="cuerpo-fila cuerpo-script" id={cuerpo}>
                      {error && (
                        <div className="recuadro error" role="alert">
                          <Icono nombre="error" />
                          <span>{error.mensaje}</span>
                        </div>
                      )}
                      {s.falta && (
                        <div className="recuadro error" role="note">
                          <Icono nombre="error" />
                          <span>{s.falta}</span>
                        </div>
                      )}
                      {s.descripcionHtml && (
                        // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces de adentro, que ya son enfocables.
                        <div
                          className="texto-doc conversacion"
                          onClick={(e) => tocarEnlace(e, ruta)}
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
                          dangerouslySetInnerHTML={{ __html: s.descripcionHtml }}
                        />
                      )}
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
