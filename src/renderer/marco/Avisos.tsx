// Los avisos de H-13 (abajo a la derecha, W-4) y la confirmación de cerrar con sesiones trabajando (F-6).
import { useEffect, useRef, useState } from 'react'
import { type AvisoSesion, tarjetaDe, usarEstado } from '../estado'
import { Icono } from '../ui/Icono'

/** Cuánto queda un aviso a la vista (no mientras el mouse está encima). */
const DURA_MS = 8000

function nombreDe(ruta: string): string {
  const t = tarjetaDe(usarEstado.getState().lista, ruta)
  return t?.nombre ?? ruta.split(/[\\/]/).pop() ?? ruta
}

/** «Alfa terminó», «Alfa terminó y dejó 2 preguntas», «Alfa falló». */
function textoDe(a: AvisoSesion, nombre: string): { titulo: string; detalle: string | null } {
  if (a.estado === 'error') return { titulo: `${nombre} falló`, detalle: a.motivo }
  if (a.preguntas === 0) return { titulo: `${nombre} terminó`, detalle: null }
  const n = a.preguntas === 1 ? '1 pregunta' : `${a.preguntas} preguntas`
  const frenan =
    a.frenan === 0
      ? null
      : a.frenan === 1
        ? a.preguntas === 1
          ? 'frena'
          : 'una frena'
        : `${a.frenan} frenan`
  return {
    titulo: `${nombre} terminó y dejó ${n}`,
    detalle: frenan ? `${frenan[0]?.toUpperCase()}${frenan.slice(1)}.` : null,
  }
}

function Aviso({ a }: { a: AvisoSesion }) {
  const quitar = usarEstado((s) => s.quitarAviso)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const responderEn = usarEstado((s) => s.responderEn)
  const nombre = usarEstado((s) => tarjetaDe(s.lista, a.ruta)?.nombre) ?? nombreDe(a.ruta)
  const [encima, setEncima] = useState(false)
  // Se va solo; el tiempo vuelve a empezar al sacar el mouse o al llegar las preguntas.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `a.preguntas` reinicia la cuenta a propósito.
  useEffect(() => {
    if (encima) return
    const t = setTimeout(() => quitar(a.id), DURA_MS)
    return () => clearTimeout(t)
  }, [encima, quitar, a.id, a.preguntas])
  const { titulo, detalle } = textoDe(a, nombre)
  const espera = a.estado === 'terminada' && a.preguntas > 0
  return (
    <div
      className="aviso"
      data-estado={a.estado === 'error' ? 'error' : espera ? 'espera' : 'ok'}
      role={a.estado === 'error' ? 'alert' : 'status'}
      onPointerEnter={() => setEncima(true)}
      onPointerLeave={() => setEncima(false)}
    >
      <Icono nombre={a.estado === 'error' ? 'error' : espera ? 'espera' : 'check'} />
      <b className="t">{titulo}</b>
      <button type="button" className="x" aria-label="Cerrar el aviso" onClick={() => quitar(a.id)}>
        <Icono nombre="x" />
      </button>
      {detalle && <span className="d">{detalle}</span>}
      <div className="acc">
        <button type="button" className="btn secundario chico" onClick={() => abrirProyecto(a.ruta)}>
          Abrir
        </button>
        {espera && (
          <button
            type="button"
            className="btn primario chico"
            onClick={() => {
              quitar(a.id)
              responderEn(a.ruta)
            }}
          >
            Responder en {nombre}
          </button>
        )}
      </div>
    </div>
  )
}

/** Abajo a la derecha, sobre todo lo demás; `Esc` cierra el último. */
export function Avisos() {
  const avisos = usarEstado((s) => s.avisos)
  const quitar = usarEstado((s) => s.quitarAviso)
  // Dentro de un proyecto, a la izquierda de la conversación: no tapa el cuadro para escribir (D-032).
  const ancho = usarEstado((s) => (s.seccion === 'proyecto' ? s.preferencias.anchoConversacion : 0))
  useEffect(() => {
    const ultimo = avisos.at(-1)
    if (!ultimo) return
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) quitar(ultimo.id)
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [avisos, quitar])
  if (avisos.length === 0) return null
  return (
    <section className="avisos" aria-label="Avisos de las sesiones" style={{ right: ancho + 12 }}>
      {avisos.map((a) => (
        <Aviso key={a.id} a={a} />
      ))}
    </section>
  )
}

function enLista(nombres: string[]): string {
  if (nombres.length <= 1) return nombres[0] ?? ''
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
}

/** F-6: «Alfa y Beta están trabajando. Cerrar las frena.» Cancelar tiene el foco. */
export function ConfirmarCierre() {
  const cierre = usarEstado((s) => s.cierre)
  const ponerCierre = usarEstado((s) => s.ponerCierre)
  const lista = usarEstado((s) => s.lista)
  const reiniciando = usarEstado((s) => s.reiniciando)
  const esperar = usarEstado((s) => s.esperarParaReiniciar)
  const cancelar = useRef<HTMLButtonElement>(null)
  const [cerrando, setCerrando] = useState(false)
  useEffect(() => {
    if (!cierre) return
    cancelar.current?.focus()
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        ponerCierre(null)
      }
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [cierre, ponerCierre])
  if (!cierre) return null
  const nombres = cierre.map((r) => tarjetaDe(lista, r)?.nombre ?? r.split(/[\\/]/).pop() ?? r)
  return (
    <div className="velo">
      <div
        className="dialogo"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cierre-t"
        aria-describedby="cierre-d"
      >
        <h2 id="cierre-t">
          {enLista(nombres)} {nombres.length === 1 ? 'está trabajando' : 'están trabajando'}
        </h2>
        <p id="cierre-d">
          {reiniciando ? 'Reiniciar' : 'Cerrar'} {nombres.length === 1 ? 'la frena' : 'las frena'}. Las
          conversaciones quedan guardadas: con Seguí se retoman y la IA sabe que la detuviste.
        </p>
        <div className="acc">
          <button
            ref={cancelar}
            type="button"
            className="btn secundario"
            disabled={cerrando}
            onClick={() => ponerCierre(null)}
          >
            Cancelar
          </button>
          {reiniciando && (
            <button
              type="button"
              className="btn secundario"
              disabled={cerrando}
              title="La versión nueva queda lista: Iridium se reinicia solo cuando terminen"
              onClick={esperar}
            >
              Esperar
            </button>
          )}
          <button
            type="button"
            className="btn peligro"
            disabled={cerrando}
            onClick={() => {
              setCerrando(true)
              void window.iridium.cerrarIgual()
            }}
          >
            {cerrando ? 'Frenando…' : reiniciando ? 'Reiniciar igual' : 'Cerrar igual'}
          </button>
        </div>
      </div>
    </div>
  )
}
