// Los avisos de H-13 (abajo a la derecha, W-4), el aviso al volver del arranque (AR-4) y la confirmación de cerrar con
// sesiones trabajando (F-6).
import { useEffect, useRef, useState } from 'react'
import type { RenglonArranqueVista } from '../../compartido/puente'
import { type AvisoEjecutar, type AvisoSesion, tarjetaDe, usarEstado } from '../estado'
import { armarProyecto } from '../secciones/proyecto/ejecutar'
import { useAnchoConversacion } from '../ui/Divisor'
import { Icono } from '../ui/Icono'
import { horaCorta, porQueNo, queDejo } from './arranque'

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
      className="aviso-flotante"
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
      <div className="pie">
        <button type="button" className="boton secundario chico" onClick={() => abrirProyecto(a.ruta)}>
          Abrir
        </button>
        {espera && (
          <button
            type="button"
            className="boton principal chico"
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

/** Con más de estos, el aviso al volver muestra los últimos y «y N más». */
const FILAS_ARRANQUE = 4

/** Un renglón del aviso al volver: «Alfa  03:02  dejó 2 preguntas  Abrir» o «13:10 no arrancó: …». */
function FilaArranque({ r }: { r: RenglonArranqueVista }) {
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  if (!r.proyecto)
    return (
      <li className="sin-arrancar">
        <span className="cuando">{horaCorta(r.cuando)}</span> {porQueNo(r)}
      </li>
    )
  const p = r.proyecto
  return (
    <li>
      <b>{p.nombre}</b>
      <span className="cuando">{horaCorta(r.cuando)}</span>
      <span className={p.frenan > 0 ? 'cuenta frena' : p.estado === 'error' ? 'fallo' : undefined}>
        {queDejo(p)}
      </span>
      <button
        type="button"
        className="boton sin-fondo chico"
        // Un Abrir por renglón: el lector de pantalla dice cuál.
        aria-label={`Abrir ${p.nombre}`}
        onClick={() => abrirProyecto(p.ruta)}
      >
        Abrir
      </button>
    </li>
  )
}

/**
 * AR-4: lo que hizo el arranque mientras no estaba el usuario. No se va solo: es lo primero que ve al volver; Listo lo
 * cierra y lo que mostró no vuelve a aparecer.
 */
function AvisoArranque({ filas }: { filas: RenglonArranqueVista[] }) {
  const [cerrado, setCerrado] = useState<number | null>(null)
  const [todas, setTodas] = useState(false)
  const ultimo = filas.at(-1)
  if (!ultimo || (cerrado !== null && cerrado >= ultimo.cuando)) return null
  const mostradas = todas ? filas : filas.slice(-FILAS_ARRANQUE)
  const resto = filas.length - mostradas.length
  // Rojo si una conversación falló; ámbar si dejó preguntas o algo no arrancó.
  const falla = filas.some((r) => r.proyecto?.estado === 'error')
  const espera = filas.some((r) => !r.proyecto || r.proyecto.preguntas > 0)
  return (
    <div
      className="aviso-flotante fijo"
      data-estado={falla ? 'error' : espera ? 'espera' : 'ok'}
      role="status"
      aria-label="Lo que hizo Iridium mientras no estabas"
    >
      <Icono nombre={falla ? 'error' : espera ? 'espera' : 'check'} />
      <b className="t">Mientras no estabas</b>
      <ul className="renglones-arranque">
        {mostradas.map((r) => (
          <FilaArranque key={r.cuando} r={r} />
        ))}
      </ul>
      <div className="pie">
        {resto > 0 && !todas && (
          <button
            type="button"
            className="boton sin-fondo chico"
            // R-99: los demás se despliegan en el mismo aviso (el detalle del uso ya no los tiene).
            onClick={() => setTodas(true)}
          >
            y {resto} más
          </button>
        )}
        <button
          type="button"
          className="boton principal chico"
          onClick={() => {
            setCerrado(ultimo.cuando)
            void window.iridium.arranqueVisto(ultimo.cuando)
          }}
        >
          Listo
        </button>
      </div>
    </div>
  )
}

/** Ejecutar Alfa no abrió (frente Abrir, AB-2): todavía no está armada, con Armar ahora, o un error. Se cierra a mano. */
function AvisoDeEjecutar({ a }: { a: AvisoEjecutar }) {
  const poner = usarEstado((s) => s.ponerAvisoEjecutar)
  const nombre = usarEstado((s) => tarjetaDe(s.lista, a.ruta)?.nombre) ?? nombreDe(a.ruta)
  // Esperando el armado (AB-2): cuando termina, la app se abre sola y el aviso se va.
  const armando = usarEstado((s) => s.actualizaciones[a.ruta]?.armando != null)
  const vioArmando = useRef(false)
  useEffect(() => {
    if (!a.esperaArmado) return
    if (armando) vioArmando.current = true
    else if (vioArmando.current) poner(null)
  }, [a.esperaArmado, armando, poner])
  return (
    <div
      className="aviso-flotante"
      data-estado={a.error ? 'error' : 'espera'}
      role={a.error ? 'alert' : 'status'}
    >
      <Icono nombre={a.error ? 'error' : 'espera'} />
      <b className="t">{a.titulo}</b>
      <button type="button" className="x" aria-label="Cerrar el aviso" onClick={() => poner(null)}>
        <Icono nombre="x" />
      </button>
      {a.detalle && <span className="d">{a.detalle}</span>}
      {a.armar && (
        <div className="pie">
          <button
            type="button"
            className="boton principal chico"
            title="La arma sin mostrar la consola y la abre al terminar"
            onClick={() => void armarProyecto({ ruta: a.ruta, nombre })}
          >
            Armar ahora
          </button>
        </div>
      )}
    </div>
  )
}

/** Abajo a la derecha, sobre todo lo demás; `Esc` cierra el último. */
export function Avisos() {
  const avisos = usarEstado((s) => s.avisos)
  const delArranque = usarEstado((s) => s.arranque?.aviso) ?? []
  const quitar = usarEstado((s) => s.quitarAviso)
  const deEjecutar = usarEstado((s) => s.avisoEjecutar)
  // A la izquierda de la conversación que esté a la vista (la del proyecto, la general o la de Skills): no tapa el
  // cuadro para escribir (D-032).
  const seccion = usarEstado((s) => s.seccion)
  const ruta = usarEstado((s) => (s.seccion === 'proyecto' ? s.proyectoAbierto : null))
  const ancho = useAnchoConversacion(
    ruta ? { proyecto: ruta } : seccion === 'skills' ? 'skills' : seccion === 'proyecto' ? null : 'general',
  )
  useEffect(() => {
    const ultimo = avisos.at(-1)
    if (!ultimo) return
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) quitar(ultimo.id)
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [avisos, quitar])
  if (avisos.length === 0 && delArranque.length === 0 && !deEjecutar) return null
  return (
    <section className="avisos" aria-label="Avisos de las sesiones" style={{ right: ancho + 12 }}>
      {delArranque.length > 0 && <AvisoArranque filas={delArranque} />}
      {avisos.map((a) => (
        <Aviso key={a.id} a={a} />
      ))}
      {deEjecutar && <AvisoDeEjecutar a={deEjecutar} />}
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
    <div className="velo capa-cuadro">
      <div
        className="cuadro"
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
          conversaciones quedan guardadas: con Continuar se retoman y la IA sabe que la detuviste.
        </p>
        <div className="pie">
          <button
            ref={cancelar}
            type="button"
            className="boton sin-fondo"
            disabled={cerrando}
            onClick={() => ponerCierre(null)}
          >
            Cancelar
          </button>
          {reiniciando && (
            <button
              type="button"
              className="boton secundario"
              disabled={cerrando}
              title="La versión nueva queda lista: Iridium se reinicia solo cuando terminen"
              onClick={esperar}
            >
              Esperar
            </button>
          )}
          <button
            type="button"
            className="boton principal peligroso"
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
