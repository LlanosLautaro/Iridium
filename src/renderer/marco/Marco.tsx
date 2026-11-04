// Lo que está siempre (04-ux.md › W-1, D-041): la barra de título con el inicio y las sesiones, la barra de íconos
// (cambia entre el inicio y el proyecto abierto) y la de estado.
import { type ReactNode, useEffect, useState } from 'react'
import { fechaExacta } from '../../compartido/fechas'
import type { EstadoMotor, FichaSesion } from '../../compartido/puente'
import { tarjetaDe, totalSinResponder, usarEstado, vistaDe } from '../estado'
import { SECCIONES, SECCIONES_PROYECTO } from '../secciones'
import { mismaRuta } from '../secciones/proyecto/enlaces'
import { Icono, type NombreIcono } from '../ui/Icono'
import { Ajustes } from './Ajustes'
import { Avisos, ConfirmarCierre } from './Avisos'
import { UsoEnLaBarra } from './Uso'

function BotonActividad({
  activa,
  nombre,
  detalle,
  icono,
  n,
  queCuenta = 'sin responder',
  neutro = false,
  alTocar,
}: {
  activa: boolean
  nombre: string
  detalle: string
  icono: NombreIcono
  n: number
  /** Qué cuenta el número, para el lector de pantalla. */
  queCuenta?: string
  /** El número en gris: espera a la IA, no al usuario (los comentarios abiertos de la Revisión). */
  neutro?: boolean
  alTocar: () => void
}) {
  return (
    <button
      type="button"
      className={activa ? 'act activo' : 'act'}
      title={`${nombre}${detalle}`}
      aria-label={`${nombre}${n > 0 ? `, ${n} ${queCuenta}` : ''}`}
      aria-current={activa ? 'page' : undefined}
      onClick={alTocar}
    >
      <Icono nombre={icono} />
      {n > 0 && <span className={neutro ? 'badge neutro' : 'badge'}>{n > 99 ? '99+' : n}</span>}
    </button>
  )
}

/** El ⚙ abajo en la barra de íconos, en cualquier pantalla: abre la ventana de Ajustes (AJ-W1). */
function BotonAjustes() {
  const abierta = usarEstado((s) => s.ajustes.abierta)
  const abrirAjustes = usarEstado((s) => s.abrirAjustes)
  return (
    <button
      type="button"
      className={abierta ? 'act activo boton-ajustes' : 'act boton-ajustes'}
      title="Ajustes (Ctrl+,)"
      aria-label="Ajustes"
      aria-haspopup="dialog"
      onClick={() => abrirAjustes()}
    >
      <Icono nombre="ajustes" />
    </button>
  )
}

/** La barra de íconos (D-041): en el inicio, Proyectos y Pendientes; dentro de un proyecto, sus secciones. */
function BarraActividad() {
  const seccion = usarEstado((s) => s.seccion)
  const lista = usarEstado((s) => s.lista)
  const ruta = usarEstado((s) => s.proyectoAbierto)
  const seccionProyecto = usarEstado((s) => (ruta ? vistaDe(s.vistas, ruta).seccion : null))
  const irA = usarEstado((s) => s.irA)
  const irASeccion = usarEstado((s) => s.irASeccion)
  const tarjeta = tarjetaDe(lista, ruta)
  const sinResponder = tarjeta?.preguntas.sinResponder ?? 0
  const revision = tarjeta?.revision ?? 0
  if (seccion === 'proyecto' && ruta)
    return (
      <nav className="actividad" aria-label="Secciones del proyecto">
        {SECCIONES_PROYECTO.map((s) => (
          <BotonActividad
            key={s.id}
            activa={seccionProyecto === s.id}
            nombre={s.nombre}
            detalle={
              s.id === 'revision' && revision > 0
                ? ` · ${revision} ${revision === 1 ? 'abierto, espera' : 'abiertos, esperan'} a la IA`
                : ''
            }
            icono={s.icono}
            n={s.id === 'pendientes' ? sinResponder : s.id === 'revision' ? revision : 0}
            queCuenta={s.id === 'revision' ? (revision === 1 ? 'abierto' : 'abiertos') : 'sin responder'}
            neutro={s.id === 'revision'}
            alTocar={() => irASeccion(ruta, s.id)}
          />
        ))}
        <BotonAjustes />
      </nav>
    )
  return (
    <nav className="actividad" aria-label="Secciones">
      {SECCIONES.map((s) => {
        const n = s.contador(lista)
        return (
          <BotonActividad
            key={s.id}
            activa={seccion === s.id}
            nombre={s.nombre}
            detalle={` (Ctrl+${s.atajo})${n > 0 ? ` · ${n} sin responder` : ''}`}
            icono={s.icono}
            n={n}
            alTocar={() => irA(s.id)}
          />
        )
      })}
      <BotonAjustes />
    </nav>
  )
}

function Reloj() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 15_000)
    return () => clearInterval(t)
  }, [])
  const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  return <time>{hora}</time>
}

/** El estado de una sesión con ícono y palabra (H-2): trabajando · terminada (con sus preguntas) · error. */
export function ChipSesion({ ficha }: { ficha: FichaSesion }) {
  if (ficha.estado === 'trabajando')
    return (
      <span className="chip trab">
        <Icono nombre="sync" gira />
        Trabajando
      </span>
    )
  if (ficha.estado === 'error')
    return (
      <span className="chip error" title={ficha.motivo ?? undefined}>
        <Icono nombre="error" />
        Error
      </span>
    )
  const n = ficha.preguntas.length
  if (n > 0)
    return (
      <span className="chip espera">
        <Icono nombre="espera" />
        {n} {n === 1 ? 'pregunta' : 'preguntas'}
      </span>
    )
  return (
    <span className="chip ok">
      <Icono nombre="check" />
      Terminada
    </span>
  )
}

/** El botón de arriba a la izquierda (D-041): el inicio, con las preguntas sin responder en ámbar. */
function BotonInicio() {
  const seccion = usarEstado((s) => s.seccion)
  const lista = usarEstado((s) => s.lista)
  const irAlInicio = usarEstado((s) => s.irAlInicio)
  const n = totalSinResponder(lista)
  return (
    <button
      type="button"
      className={seccion === 'proyecto' ? 'inicio' : 'inicio activo'}
      title={`Proyectos y Pendientes${n > 0 ? ` (${n} ${n === 1 ? 'pregunta' : 'preguntas'} sin responder)` : ''}`}
      aria-label={`Inicio${n > 0 ? `, ${n} sin responder` : ''}`}
      onClick={irAlInicio}
    >
      <Icono nombre="marca" />
      {n > 0 && <span className="badge">{n > 99 ? '99+' : n}</span>}
    </button>
  )
}

/**
 * El estado de un proyecto en su pestaña (D-043): trabajando, con error, con preguntas que esperan al usuario, o
 * terminada si todavía no se vio. Si no hay nada de eso, solo el nombre.
 */
function EstadoPestana({ ficha, preguntas }: { ficha: FichaSesion | null; preguntas: number }) {
  if (ficha?.estado === 'trabajando' || ficha?.estado === 'error') return <ChipSesion ficha={ficha} />
  if (preguntas > 0)
    return (
      <span className="chip espera">
        <Icono nombre="espera" />
        {preguntas} {preguntas === 1 ? 'pregunta' : 'preguntas'}
      </span>
    )
  if (ficha) return <ChipSesion ficha={ficha} />
  return null
}

/**
 * La barra de título propia (D-041): el inicio y una pestaña por cada proyecto abierto, con su ícono (Q-62), que
 * queda aunque no trabaje (D-043); tocar una abre el proyecto y × la cierra (salvo mientras la IA trabaja). Se
 * arrastra desde el espacio libre; los tres botones de la derecha los dibuja Windows.
 */
function BarraTitulo() {
  const fichas = usarEstado((s) => s.fichas)
  const lista = usarEstado((s) => s.lista)
  const guardadas = usarEstado((s) => s.preferencias.pestanas)
  const seccion = usarEstado((s) => s.seccion)
  const abierto = usarEstado((s) => s.proyectoAbierto)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const cerrarPestana = usarEstado((s) => s.cerrarPestana)
  // Las guardadas que siguen en la carpeta, más las sesiones que arrancaron sin abrir el proyecto (Seguí desde
  // Pendientes) y el abierto.
  const rutas = guardadas.filter((r) => lista?.tipo !== 'lista' || tarjetaDe(lista, r))
  for (const r of [...fichas.map((f) => f.ruta), ...(abierto ? [abierto] : [])])
    if (!rutas.includes(r)) rutas.push(r)
  return (
    <header className="titulo">
      <BotonInicio />
      <div className="sesiones" role="tablist" aria-label="Proyectos abiertos">
        {rutas.map((ruta) => {
          const tarjeta = tarjetaDe(lista, ruta)
          const ficha = fichas.find((f) => f.ruta === ruta) ?? null
          const nombre = tarjeta?.nombre ?? ruta.split(/[\\/]/).pop() ?? ruta
          const activa = seccion === 'proyecto' && abierto === ruta
          return (
            <div key={ruta} className={activa ? 'ses activa' : 'ses'}>
              <button
                type="button"
                className="pestana"
                role="tab"
                aria-selected={activa}
                title={`Abrir ${nombre}`}
                onClick={() => abrirProyecto(ruta)}
              >
                <span className="ico-proy" aria-hidden="true">
                  {tarjeta?.icono ? <img src={tarjeta.icono} alt="" /> : (tarjeta?.inicial ?? nombre[0])}
                </span>
                <span className="nom">{nombre}</span>
                <EstadoPestana ficha={ficha} preguntas={tarjeta?.preguntas.sinResponder ?? 0} />
              </button>
              {ficha?.estado !== 'trabajando' && (
                <button
                  type="button"
                  className="cerrar"
                  title="Cerrar la pestaña (la conversación queda para Seguí)"
                  aria-label={`Cerrar ${nombre}`}
                  onClick={() => cerrarPestana(ruta)}
                >
                  <Icono nombre="x" />
                </button>
              )}
            </div>
          )
        })}
      </div>
      <div className="arrastre" />
      <div className="botones-ventana" aria-hidden="true" />
    </header>
  )
}

function ChipMotor({ motor }: { motor: EstadoMotor }) {
  const iniciando = usarEstado((s) => s.iniciandoSesion)
  const iniciarSesion = usarEstado((s) => s.iniciarSesion)
  switch (motor.tipo) {
    case 'verificando':
      return (
        <span className="chip neutro" title="Comprobando que Claude Code tenga sesión iniciada">
          <Icono nombre="sync" gira />
          Verificando Claude
        </span>
      )
    case 'listo':
      return (
        <span className="chip ok" title="Claude Code tiene sesión iniciada y usa tu suscripción">
          <Icono nombre="check" />
          Claude{motor.suscripcion ? ` · ${motor.suscripcion.replace(/^Claude\s+/i, '')}` : ''}
        </span>
      )
    case 'sin-sesion':
      // CO-I1: el chip mismo inicia sesión (abre el navegador).
      return (
        <button
          type="button"
          className="chip error"
          disabled={iniciando}
          title="Abre el navegador para entrar con tu cuenta de Claude, como desde VS Code"
          onClick={iniciarSesion}
        >
          <Icono nombre={iniciando ? 'sync' : 'error'} gira={iniciando} />
          {iniciando ? 'Esperando el navegador…' : 'Sin sesión de Claude · Iniciar sesión'}
        </button>
      )
    case 'clave-api':
      return (
        <span
          className="chip espera"
          title={`Claude Code usa una clave de API (${motor.origen}) en vez de tu suscripción: gastaría por uso`}
        >
          <Icono nombre="espera" />
          Clave de API, no la suscripción
        </span>
      )
    case 'falla':
      return (
        <span className="chip error" title={motor.motivo}>
          <Icono nombre="error" />
          Claude no arranca
        </span>
      )
  }
}

/** CO-I2: hay una versión armada esperando; entra al cerrar Iridium, o ya con Reiniciar ahora. */
function VersionNuevaLista() {
  const v = usarEstado((s) => s.versionNueva)
  const reiniciando = usarEstado((s) => s.reiniciando)
  const reiniciarAhora = usarEstado((s) => s.reiniciarAhora)
  if (!v) return null
  const armada = `Armada el ${fechaExacta(Date.parse(v.fecha))}, con «${v.mensaje}» (${v.commit})${v.sinGuardar ? ' y cambios sin commitear' : ''}.`
  // Ya se intentó y no entró (Defecto 3): se dice, con el motivo, y se reintenta en el próximo cierre.
  const noEntro = v.noEntro
    ? ` El ${fechaExacta(Date.parse(v.noEntro.fecha))} no entró: ${v.noEntro.motivo}`
    : ''
  return (
    <span className="it version-nueva" title={armada + noEntro}>
      {v.noEntro ? (
        <span className="chip espera">
          <Icono nombre="espera" />
          La versión nueva no entró · se reintenta al cerrar
        </span>
      ) : (
        <span className="chip ok">
          <Icono nombre="check" />
          Versión nueva lista · entra al cerrar
        </span>
      )}
      <button
        type="button"
        className="chip neutro"
        disabled={reiniciando}
        title="Cierra Iridium (pregunta si hay sesiones trabajando) y lo abre con la versión nueva"
        onClick={reiniciarAhora}
      >
        <Icono nombre={reiniciando ? 'sync' : 'reintentar'} gira={reiniciando} />
        {reiniciando ? 'Reiniciando…' : 'Reiniciar ahora'}
      </button>
    </span>
  )
}

/**
 * Hay commits de Iridium que la app de uso diario no tiene (CO-I6, Q-99 B): se ofrece Armar. Mientras la IA de ese
 * proyecto trabaja no se ofrece (armaría a mitad de camino).
 */
function CambiosSinArmar() {
  const a = usarEstado((s) => s.sinArmar)
  const trabajando = usarEstado((s) =>
    s.fichas.some((f) => a !== null && f.estado === 'trabajando' && mismaRuta(f.ruta, a.carpeta)),
  )
  const [error, setError] = useState<string | null>(null)
  if (!a?.pendiente || (trabajando && !a.armando)) return null
  if (a.armando)
    return (
      <span
        className="it sin-armar"
        title="«Armar la última versión» corre en su consola; al terminar aparece «Versión nueva lista»"
      >
        <span className="chip trab">
          <Icono nombre="sync" gira />
          Armando la versión nueva…
        </span>
      </span>
    )
  const armar = async () => {
    const r = await window.iridium.armar()
    setError(r.tipo === 'error' ? r.mensaje : null)
  }
  return (
    <span
      className="it sin-armar"
      title={`La app que usás no tiene «${a.pendiente.mensaje}» (${a.pendiente.commit}) ni lo anterior que falte.`}
    >
      <span className={`chip ${error ? 'error' : 'neutro'}`} title={error ?? undefined}>
        <Icono nombre={error ? 'error' : 'punto'} />
        {error ? 'No se pudo armar' : 'Hay cambios sin armar'}
      </span>
      <button
        type="button"
        className="chip neutro"
        title="Arma la última versión en una consola (un minuto); Iridium sigue abierto y la versión entra al cerrar"
        onClick={() => void armar()}
      >
        <Icono nombre="play" />
        Armar
      </button>
    </span>
  )
}

function BarraEstado({ children }: { children?: ReactNode }) {
  const motor = usarEstado((s) => s.motor)
  const n = usarEstado((s) => s.fichas.length)
  return (
    <footer className="estado-barra">
      <span className="it" data-motor={motor.tipo}>
        <ChipMotor motor={motor} />
      </span>
      <VersionNuevaLista />
      <CambiosSinArmar />
      {children}
      <span className="der">
        <UsoEnLaBarra />
      </span>
      <span className="it">
        {n === 0 ? 'Sin sesiones abiertas' : `${n} ${n === 1 ? 'sesión' : 'sesiones'}`} · <Reloj />
      </span>
    </footer>
  )
}

export function Marco({ children, estado }: { children: ReactNode; estado?: ReactNode }) {
  return (
    <div className="app">
      <BarraTitulo />
      <BarraActividad />
      {children}
      <BarraEstado>{estado}</BarraEstado>
      <Avisos />
      <Ajustes />
      <ConfirmarCierre />
    </div>
  )
}
