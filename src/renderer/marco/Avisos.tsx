// Los avisos de H-13 (abajo a la derecha, W-4), el aviso al volver del arranque (AR-4) y la confirmación de cerrar con
// sesiones trabajando (F-6).
import { useEffect, useRef, useState } from 'react'
import { textoDeCierre } from '../../compartido/consolas'
import type { Novedades } from '../../compartido/novedades'
import type { RenglonArranqueVista } from '../../compartido/puente'
import { primeraFrase } from '../../compartido/versiones'
import { type AvisoEjecutar, type AvisoSesion, tarjetaDe, usarEstado } from '../estado'
import { armarProyecto } from '../secciones/proyecto/ejecutar'
import { useAnchoConversacion } from '../ui/Divisor'
import { Icono } from '../ui/Icono'
import { horaCorta, porQueNo, queDejo } from './arranque'

/**
 * Cuánto queda un aviso a la vista (no mientras el mouse está encima): «terminó» se va rápido (R-106); si dejó
 * preguntas o falló, queda más para leerlo.
 */
const DURA_MS = { ok: 4000, otro: 5000 }

/** Si la ventana de Iridium está en uso: fuera de ella, los avisos esperan a que vuelvas (R-106). */
function useVentanaEnUso(): boolean {
  const [enUso, setEnUso] = useState(() => document.hasFocus())
  useEffect(() => {
    const si = () => setEnUso(true)
    const no = () => setEnUso(false)
    window.addEventListener('focus', si)
    window.addEventListener('blur', no)
    return () => {
      window.removeEventListener('focus', si)
      window.removeEventListener('blur', no)
    }
  }, [])
  return enUso
}

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
  const enUso = useVentanaEnUso()
  const espera = a.estado === 'terminada' && a.preguntas > 0
  const dura = a.estado === 'error' || espera ? DURA_MS.otro : DURA_MS.ok
  // Se va solo mientras usás Iridium; el tiempo vuelve a empezar al sacar el mouse, al volver a la ventana o al llegar
  // las preguntas.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `a.preguntas` reinicia la cuenta a propósito.
  useEffect(() => {
    if (encima || !enUso) return
    const t = setTimeout(() => quitar(a.id), dura)
    return () => clearTimeout(t)
  }, [encima, enUso, dura, quitar, a.id, a.preguntas])
  const { titulo, detalle } = textoDe(a, nombre)
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

/**
 * Un renglón del aviso al volver: «Alfa  03:02  dejó 2 preguntas  Abrir», «Alfa  03:40  avanzó «Cargar el tema
 * propio» · terminó  Abrir» o «13:10 no arrancó: …».
 */
function FilaArranque({ r }: { r: RenglonArranqueVista }) {
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  if (!r.proyecto)
    return (
      <li className="sin-arrancar">
        <span className="cuando">{horaCorta(r.cuando)}</span> {porQueNo(r)}
      </li>
    )
  const p = r.proyecto
  // Se cortó por el uso (D-194): no falló el trabajo, se retoma cuando se libera.
  const sinUso = r.agotado && p.estado === 'error'
  return (
    <li>
      <b>{p.nombre}</b>
      <span className="cuando">{horaCorta(r.cuando)}</span>
      <span>
        {/* Lo que tomó el avance solo (FS-5): el paso; sus respuestas de la Bandeja, como el Arranque. */}
        {r.avance && <>avanzó «{r.avance.texto}» · </>}
        <span
          className={
            sinUso ? 'sin-uso' : p.frenan > 0 ? 'cuenta frena' : p.estado === 'error' ? 'fallo' : undefined
          }
        >
          {sinUso ? 'se quedó sin uso, sigue cuando se libere' : queDejo(p)}
        </span>
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
  const falla = filas.some((r) => r.proyecto?.estado === 'error' && !r.agotado)
  const espera = filas.some((r) => !r.proyecto || r.proyecto.preguntas > 0 || r.agotado)
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

/** Lo que trae esta versión (Q-290), una vez: la primera vez que se abre. Esta PC lo pide al arrancar. */
function useNovedades(): [Novedades | null, () => void] {
  const [novedades, setNovedades] = useState<Novedades | null>(null)
  useEffect(() => {
    void window.iridium.novedades().then(setNovedades, () => {})
  }, [])
  const vistas = () => {
    setNovedades(null)
    void window.iridium.novedadesVistas()
  }
  return [novedades, vistas]
}

/**
 * «Iridium se actualizó a 1.0.26» con lo que trae: la primera frase de cada cambio (el mensaje entero al pasar el
 * mouse), del más nuevo al más viejo. Como el aviso al volver, no se va solo: Listo lo cierra hasta la próxima versión.
 */
function AvisoNovedades({ n, listo }: { n: Novedades; listo: () => void }) {
  const [todas, setTodas] = useState(false)
  const mostradas = todas ? n.cambios : n.cambios.slice(0, FILAS_ARRANQUE)
  const resto = n.cambios.length - mostradas.length
  return (
    <div className="aviso-flotante fijo" data-estado="ok" role="status" aria-label="Lo nuevo de Iridium">
      <Icono nombre="check" />
      <b className="t">Iridium se actualizó a {n.version}</b>
      <ul className="renglones-arranque">
        {mostradas.map((c) => (
          <li key={c.commit} className="novedad" title={c.mensaje}>
            {primeraFrase(c.mensaje)}
          </li>
        ))}
        {todas && n.mas && <li className="novedad">Y cambios anteriores.</li>}
      </ul>
      <div className="pie">
        {resto > 0 && !todas && (
          <button type="button" className="boton sin-fondo chico" onClick={() => setTodas(true)}>
            y {resto} más
          </button>
        )}
        <button type="button" className="boton principal chico" onClick={listo}>
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
  const [novedades, novedadesVistas] = useNovedades()
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
  if (avisos.length === 0 && delArranque.length === 0 && !deEjecutar && !novedades) return null
  return (
    <section className="avisos" aria-label="Avisos de las sesiones" style={{ right: ancho + 12 }}>
      {novedades && <AvisoNovedades n={novedades} listo={novedadesVistas} />}
      {delArranque.length > 0 && <AvisoArranque filas={delArranque} />}
      {avisos.map((a) => (
        <Aviso key={a.id} a={a} />
      ))}
      {deEjecutar && <AvisoDeEjecutar a={deEjecutar} />}
    </section>
  )
}

/** F-6: «Alfa y Beta están trabajando. Cerrar las frena.» (y las consolas corriendo, I-10). Cancelar tiene el foco. */
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
  const nombres = cierre.trabajando.map((r) => tarjetaDe(lista, r)?.nombre ?? r.split(/[\\/]/).pop() ?? r)
  const { titulo, texto } = textoDeCierre(nombres, cierre.consolas, reiniciando)
  return (
    <div className="velo capa-cuadro">
      <div
        className="cuadro"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cierre-t"
        aria-describedby="cierre-d"
      >
        <h2 id="cierre-t">{titulo}</h2>
        <p id="cierre-d">{texto}</p>
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
          {/* Esperar espera a las sesiones: con solo consolas (que pueden no terminar nunca), no va. */}
          {reiniciando && nombres.length > 0 && (
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
            {cerrando
              ? nombres.length > 0
                ? 'Frenando…'
                : 'Cerrando…'
              : reiniciando
                ? 'Reiniciar igual'
                : 'Cerrar igual'}
          </button>
        </div>
      </div>
    </div>
  )
}
