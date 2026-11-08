// Lo que está siempre (04-ux.md › W-1, D-041): la barra de título con el inicio y las sesiones, la barra de íconos
// (cambia entre el inicio y el proyecto abierto) y la de estado.
import { type ReactNode, useEffect, useState } from 'react'
import { estadoActualizar, tiempoArmando } from '../../compartido/actualizar'
import { textoDeCuenta } from '../../compartido/cuentas'
import type { EstadoMotor, FichaSesion } from '../../compartido/puente'
import { tarjetaDe, totalBandeja, usarEstado, vistaDe } from '../estado'
import { SECCIONES, SECCIONES_PROYECTO, type SeccionDeProyecto } from '../secciones'
import { mismaRuta } from '../secciones/proyecto/enlaces'
import { Cuenta } from '../ui/Cuenta'
import { Icono, type NombreIcono } from '../ui/Icono'
import { Ajustes } from './Ajustes'
import { Avisos, ConfirmarCierre } from './Avisos'
import { UsoEnLaBarra } from './Uso'

const SIN_PREGUNTAS = { sinResponder: 0, frenan: 0 }

function BotonActividad({
  activa,
  nombre,
  detalle,
  icono,
  n,
  queCuenta = 'abiertos',
  alTocar,
}: {
  activa: boolean
  nombre: string
  detalle: string
  icono: NombreIcono
  n: number
  /** Qué cuenta el número, para el lector de pantalla. */
  queCuenta?: string
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
      {/* Solo los comentarios abiertos de la Revisión, en gris: esperan a la IA, no al usuario. La bandeja no lleva
      número en su ícono: el total está en el botón de inicio y el de cada proyecto, en su pestaña. */}
      {n > 0 && <span className="badge neutro">{n > 99 ? '99+' : n}</span>}
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
  const revision = tarjeta?.revision ?? 0
  if (seccion === 'proyecto' && ruta) {
    const boton = (s: SeccionDeProyecto) => (
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
        n={s.id === 'revision' ? revision : 0}
        queCuenta={revision === 1 ? 'abierto' : 'abiertos'}
        alTocar={() => irASeccion(ruta, s.id)}
      />
    )
    const visibles = SECCIONES_PROYECTO.filter((s) => !s.soloSi || (tarjeta && s.soloSi(tarjeta)))
    // Dos grupos (W-3): lo que se sigue y, debajo de una línea, el proyecto por dentro.
    return (
      <nav className="actividad" aria-label="Secciones del proyecto">
        {visibles.filter((s) => s.grupo === 'sigue').map(boton)}
        {visibles.some((s) => s.grupo === 'sigue') && <hr className="act-linea" />}
        {visibles.filter((s) => s.grupo === 'dentro').map(boton)}
        <BotonAjustes />
      </nav>
    )
  }
  return (
    <nav className="actividad" aria-label="Secciones">
      {SECCIONES.map((s) => (
        <BotonActividad
          key={s.id}
          activa={seccion === s.id}
          nombre={s.nombre}
          detalle={` (Ctrl+${s.atajo})`}
          icono={s.icono}
          n={0}
          alTocar={() => irA(s.id)}
        />
      ))}
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

/**
 * El botón de arriba a la izquierda (D-041): el inicio, con el único total de la bandeja de la app (04-ux.md › Un
 * número que manda); gris, o amarillo con «!» si algo frena.
 */
function BotonInicio() {
  const seccion = usarEstado((s) => s.seccion)
  const lista = usarEstado((s) => s.lista)
  const irAlInicio = usarEstado((s) => s.irAlInicio)
  const { n, frenan } = totalBandeja(lista)
  const detalle = n > 0 ? `, ${textoDeCuenta(n, frenan)}` : ''
  return (
    <button
      type="button"
      className={seccion === 'proyecto' ? 'inicio' : 'inicio activo'}
      title={`Proyectos y Bandeja de entrada${detalle}`}
      aria-label={`Inicio${detalle}`}
      onClick={irAlInicio}
    >
      <Icono nombre="marca" />
      <Cuenta n={n} frenan={frenan} clase="en-inicio" />
    </button>
  )
}

/**
 * El estado de un proyecto en su pestaña (D-043, W-4): trabajando o con error; si no, su cuenta de la bandeja (la
 * misma regla de color que el inicio) o, sin nada, terminada si todavía no se vio. Si no hay nada de eso, solo el
 * nombre.
 */
function EstadoPestana({
  ficha,
  preguntas,
}: {
  ficha: FichaSesion | null
  preguntas: { sinResponder: number; frenan: number }
}) {
  if (ficha?.estado === 'trabajando' || ficha?.estado === 'error') return <ChipSesion ficha={ficha} />
  if (preguntas.sinResponder > 0) return <Cuenta n={preguntas.sinResponder} frenan={preguntas.frenan} />
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
                <EstadoPestana ficha={ficha} preguntas={tarjeta?.preguntas ?? SIN_PREGUNTAS} />
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

/**
 * Actualizar (R-12, T-46, 04-ux.md › W-1 y F-7): un solo botón junta «Armar» y «Reiniciar ahora». Con una versión
 * lista, reinicia (con F-6 si hay sesiones trabajando); sin ella, arma sin consola a la vista y reinicia sola al
 * terminar. Mientras la IA del código de Iridium trabaja, no arma: tomaría su trabajo a mitad de camino.
 */
function Actualizar() {
  const sinArmar = usarEstado((s) => s.sinArmar)
  const version = usarEstado((s) => s.versionNueva)
  const iaTrabajando = usarEstado((s) =>
    s.fichas.some(
      (f) => sinArmar !== null && f.estado === 'trabajando' && mismaRuta(f.ruta, sinArmar.carpeta),
    ),
  )
  const algunaTrabajando = usarEstado((s) => s.fichas.some((f) => f.estado === 'trabajando'))
  const reiniciando = usarEstado((s) => s.reiniciando)
  const reiniciarAhora = usarEstado((s) => s.reiniciarAhora)
  const pedido = usarEstado((s) => s.actualizarPedido)
  const ponerPedido = usarEstado((s) => s.ponerActualizarPedido)
  const alTerminar = usarEstado((s) => s.reiniciarAlTerminar)
  const [error, setError] = useState<string | null>(null)
  const [ahora, setAhora] = useState(() => Date.now())
  const estado = estadoActualizar({ sinArmar, version, iaTrabajando })

  // Pedido con Actualizar: apareció la versión que se armó (una lista distinta de la que había) y el script terminó
  // (después de dejar la versión lista todavía sube `main`), se reinicia.
  useEffect(() => {
    if (!pedido) return
    if (version && version.fecha !== pedido.antes && estado.tipo !== 'armando') {
      ponerPedido(null)
      reiniciarAhora()
    } else if (estado.tipo === 'fallo') ponerPedido(null)
  }, [pedido, version, estado.tipo, ponerPedido, reiniciarAhora])
  // «Esperar» en F-6: reinicia cuando ninguna sesión trabaja.
  useEffect(() => {
    if (alTerminar && !algunaTrabajando && version) reiniciarAhora()
  }, [alTerminar, algunaTrabajando, version, reiniciarAhora])
  useEffect(() => {
    if (estado.tipo !== 'armando') return
    const t = setInterval(() => setAhora(Date.now()), 15_000)
    return () => clearInterval(t)
  }, [estado.tipo])

  const armar = async () => {
    setError(null)
    ponerPedido({ antes: version?.fecha ?? null })
    const r = await window.iridium.armar()
    if (r.tipo === 'error') {
      setError(r.mensaje)
      ponerPedido(null)
    }
  }
  const actualizar = () => {
    if (estado.tipo === 'disponible' && estado.lista) reiniciarAhora()
    else void armar()
  }
  const cancelar = () => {
    ponerPedido(null)
    void window.iridium.cancelarArmado()
  }
  const verConsola = async () => {
    const r = await window.iridium.verConsolaArmado()
    setError(r.tipo === 'error' ? r.mensaje : null)
  }

  if (error || estado.tipo === 'fallo')
    return (
      <span className="it actualizar-it">
        <span className="chip error" title={error ?? (estado.tipo === 'fallo' ? estado.motivo : undefined)}>
          <Icono nombre="error" />
          No se pudo actualizar
        </span>
        <button type="button" className="enlace" onClick={() => void armar()}>
          Reintentar
        </button>
        <button type="button" className="enlace" onClick={() => void verConsola()}>
          Ver la consola
        </button>
      </span>
    )
  if (estado.tipo === 'armando')
    return (
      <span className="it actualizar-it" title="La app se sigue usando; al terminar, se reinicia sola">
        <span className="armando">
          <Icono nombre="sync" gira />
          Actualizando…
          {estado.desde !== null && <span className="t">{tiempoArmando(estado.desde, ahora)}</span>}
        </span>
        <button type="button" className="enlace" onClick={cancelar}>
          Cancelar
        </button>
      </span>
    )
  if (estado.tipo === 'al-dia') return null
  const bloqueado = estado.tipo === 'bloqueado'
  return (
    <span className="it actualizar-it">
      <button
        type="button"
        className="actualizar"
        disabled={bloqueado || reiniciando}
        title={bloqueado ? 'Espera a que la IA de Iridium termine' : estado.detalle}
        onClick={actualizar}
      >
        <Icono nombre={reiniciando ? 'sync' : 'bajar'} gira={reiniciando} />
        {reiniciando ? 'Reiniciando…' : 'Actualizar'}
      </button>
      {bloqueado && <span className="motivo">espera a que la IA de Iridium termine</span>}
      {alTerminar && <span className="motivo">se reinicia cuando terminen las sesiones</span>}
    </span>
  )
}

/**
 * Una copia compartida que no ve las versiones de GitHub (Q-123): sin sesión, Iniciar sesión abre la ventana de git;
 * con una cuenta sin invitación, se dice a quién pedírsela.
 */
function AccesoVersionesGithub() {
  const a = usarEstado((s) => s.accesoVersiones)
  const [entrando, setEntrando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (!a || a === 'ok') return null
  const entrar = async () => {
    setEntrando(true)
    const r = await window.iridium.entrarGithub()
    setEntrando(false)
    setError(r.tipo === 'error' ? r.mensaje : null)
  }
  const sinPermiso = a === 'sin-permiso'
  const ayuda = sinPermiso
    ? 'Tu cuenta de GitHub no tiene acceso a Iridium: pedile a quien te lo pasó que te invite, aceptá la invitación y tocá Probar de nuevo.'
    : 'Iridium baja sus versiones nuevas de GitHub: iniciá sesión una vez con la cuenta que invitaron.'
  return (
    <span className="it acceso-versiones" title={error ?? ayuda}>
      <span className={`chip ${error ? 'error' : 'espera'}`}>
        <Icono nombre={error ? 'error' : 'espera'} />
        {sinPermiso
          ? 'Sin acceso a las versiones nuevas'
          : 'Para recibir versiones nuevas, iniciá sesión en GitHub'}
      </span>
      <button
        type="button"
        className="chip neutro"
        disabled={entrando}
        title={ayuda}
        onClick={() => void entrar()}
      >
        <Icono nombre={entrando ? 'sync' : 'reintentar'} gira={entrando} />
        {entrando ? 'Esperando a GitHub…' : sinPermiso ? 'Probar de nuevo' : 'Iniciar sesión'}
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
      {children}
      <Actualizar />
      <AccesoVersionesGithub />
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
