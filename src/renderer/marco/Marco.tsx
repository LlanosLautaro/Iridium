// Lo que está siempre (04-ux.md › W-1, D-041), como el marco de las maquetas (DI-I3, tanda 4): arriba el inicio y la
// barra de proyectos, a la izquierda la de secciones (cambia entre el inicio y el proyecto abierto) y abajo la de estado.
import { type ReactNode, useEffect, useState } from 'react'
import { estadoActualizar, queHacerSolo, tiempoArmando } from '../../compartido/actualizar'
import { textoDeCuenta } from '../../compartido/cuentas'
import type { ActualizarSolo, EstadoMotor, FichaSesion } from '../../compartido/puente'
import { tarjetaDe, totalBandeja, usarEstado, vistaDe } from '../estado'
import { SECCIONES, SECCIONES_PROYECTO, type SeccionDeProyecto } from '../secciones'
import { ejecutarProyecto, nombreEjecutar } from '../secciones/proyecto/ejecutar'
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
      className={activa ? 'act elegida' : 'act'}
      title={`${nombre}${detalle}${n > 0 ? ` · ${n} ${queCuenta}` : ''}`}
      aria-label={`${nombre}${n > 0 ? `, ${n} ${queCuenta}` : ''}`}
      aria-current={activa ? 'page' : undefined}
      onClick={alTocar}
    >
      <Icono nombre={icono} />
      {/* Solo los comentarios abiertos de la Revisión, un punto gris: esperan a la IA, no al usuario (R-50); el número
      está en el nombre. La bandeja no lleva marca en su ícono: lo de cada proyecto está en su pestaña. */}
      {n > 0 && <span className="punto" />}
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
      className={abierta ? 'act elegida boton-ajustes' : 'act boton-ajustes'}
      title="Ajustes (Ctrl+,)"
      aria-label="Ajustes"
      aria-haspopup="dialog"
      onClick={() => abrirAjustes()}
    >
      <Icono nombre="ajustes" />
    </button>
  )
}

/** La barra de secciones (D-041): en el inicio, Proyectos, Skills e Ideas (D-111); dentro de un proyecto, las suyas. */
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
        {visibles.some((s) => s.grupo === 'sigue') && <div className="sep" />}
        {visibles.filter((s) => s.grupo === 'dentro').map(boton)}
        {/* Ejecutar Alfa (frente Abrir, AB-1): abajo, encima de los ajustes, si el proyecto marca lo que abre. */}
        {tarjeta?.ejecutar && (
          <button
            type="button"
            className="act boton-ejecutar"
            title={`${nombreEjecutar(tarjeta)} · ${tarjeta.ejecutar.detalle}`}
            aria-label={nombreEjecutar(tarjeta)}
            onClick={() => void ejecutarProyecto(tarjeta)}
          >
            <Icono nombre="play" />
          </button>
        )}
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

/**
 * El estado de una sesión con ícono y palabra (H-2), como Señal (PZ-7): trabajando · esperando lo que dejó de fondo
 * (T-65) · terminada (con sus preguntas, en ámbar) · error (en rojo).
 */
export function SenalSesion({ ficha }: { ficha: FichaSesion }) {
  if (ficha.estado === 'trabajando')
    return (
      <span className="senal verde">
        <Icono nombre="sync" gira />
        Trabajando
      </span>
    )
  if (ficha.estado === 'error')
    return (
      <span className="senal rojo" title={ficha.motivo ?? undefined}>
        <Icono nombre="error" />
        Error
      </span>
    )
  if (ficha.fondo?.length)
    return (
      <span className="senal" title={`Esperando lo que dejó de fondo: ${ficha.fondo.join(' · ')}`}>
        <Icono nombre="sync" gira />
        Esperando
      </span>
    )
  const n = ficha.preguntas.length
  if (n > 0)
    return (
      <span className="senal ambar">
        <Icono nombre="espera" />
        {n} {n === 1 ? 'pregunta' : 'preguntas'}
      </span>
    )
  return (
    <span className="senal">
      <Icono nombre="check" />
      Terminada
    </span>
  )
}

/**
 * El botón de arriba a la izquierda (D-041, R-22): el inicio, con un punto si algo espera en algún proyecto (04-ux.md ›
 * Un número que manda); gris, o ámbar si algo frena. El número, al pasar el mouse (R-50).
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
      className="boton-menu"
      title={`Inicio${detalle}`}
      aria-label={`Inicio${detalle}`}
      aria-current={seccion === 'proyectos' ? 'page' : undefined}
      onClick={irAlInicio}
    >
      <Icono nombre="inicio" />
      {n > 0 && <span className={frenan > 0 ? 'punto ambar' : 'punto'} />}
    </button>
  )
}

/**
 * El estado de un proyecto en su pestaña (D-043, W-4): trabajando, esperando lo de fondo o con error; si no, su cuenta de la bandeja (la
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
  if (ficha?.estado === 'trabajando' || ficha?.estado === 'error' || ficha?.fondo?.length)
    return <SenalSesion ficha={ficha} />
  if (preguntas.sinResponder > 0) return <Cuenta n={preguntas.sinResponder} frenan={preguntas.frenan} />
  if (ficha) return <SenalSesion ficha={ficha} />
  return null
}

/**
 * La barra de título propia (D-041): el inicio y la barra de proyectos, una pestaña por cada proyecto abierto, con su
 * ícono (Q-62), que queda aunque no trabaje (D-043); tocar una abre el proyecto y × la cierra (salvo mientras la IA
 * trabaja). Se arrastra desde el espacio libre; los tres botones de la derecha los dibuja Windows.
 */
function BarraTitulo() {
  const fichas = usarEstado((s) => s.fichas)
  const lista = usarEstado((s) => s.lista)
  const guardadas = usarEstado((s) => s.preferencias.pestanas)
  const seccion = usarEstado((s) => s.seccion)
  const abierto = usarEstado((s) => s.proyectoAbierto)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const cerrarPestana = usarEstado((s) => s.cerrarPestana)
  // Las guardadas que siguen en la carpeta, más las sesiones que arrancaron sin abrir el proyecto y el abierto.
  const rutas = guardadas.filter((r) => lista?.tipo !== 'lista' || tarjetaDe(lista, r))
  for (const r of [...fichas.map((f) => f.ruta), ...(abierto ? [abierto] : [])])
    if (!rutas.includes(r)) rutas.push(r)
  return (
    <header className="titulo">
      <BotonInicio />
      <div className="barra-proyectos" role="tablist" aria-label="Proyectos abiertos">
        {rutas.map((ruta) => {
          const tarjeta = tarjetaDe(lista, ruta)
          const ficha = fichas.find((f) => f.ruta === ruta) ?? null
          const nombre = tarjeta?.nombre ?? ruta.split(/[\\/]/).pop() ?? ruta
          const activa = seccion === 'proyecto' && abierto === ruta
          return (
            <div key={ruta} className={activa ? 'proy elegido' : 'proy'}>
              <button
                type="button"
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
                  title="Cerrar la pestaña (la conversación queda para Continuar)"
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

/**
 * Claude abajo solo cuando falla (D-108, R-21): sin sesión, en rojo, y tocarlo inicia sesión (CO-I1); con una clave
 * de API en vez de la suscripción, en ámbar; si no arranca, en rojo. Verificando o listo, nada.
 */
function SenalClaude({ motor }: { motor: EstadoMotor }) {
  const iniciando = usarEstado((s) => s.iniciandoSesion)
  const iniciarSesion = usarEstado((s) => s.iniciarSesion)
  switch (motor.tipo) {
    case 'verificando':
    case 'listo':
      return null
    case 'sin-sesion':
      return (
        <button
          type="button"
          className="senal rojo"
          disabled={iniciando}
          title="Abre el navegador para entrar con tu cuenta de Claude, como desde VS Code"
          onClick={iniciarSesion}
        >
          <Icono nombre={iniciando ? 'sync' : 'error'} gira={iniciando} />
          {iniciando ? 'Esperando el navegador…' : 'Claude sin sesión · Iniciar sesión'}
        </button>
      )
    case 'clave-api':
      return (
        <span
          className="senal ambar"
          title={`Claude Code usa una clave de API (${motor.origen}) en vez de tu suscripción: gastaría por uso`}
        >
          <Icono nombre="espera" />
          Clave de API, no la suscripción
        </span>
      )
    case 'falla':
      return (
        <span className="senal rojo" title={motor.motivo}>
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
 * Además lo hace solo (T-67, `queHacerSolo`): arma cuando los cambios están commiteados y la IA de Iridium lleva un rato
 * libre, y reinicia cuando ninguna IA trabaja ni espera y nadie usa Iridium hace unos minutos (la PC puede seguir en uso).
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
  const ocupada = (f: FichaSesion) => f.estado === 'trabajando' || !!f.fondo?.length
  const iaIridiumOcupada = usarEstado((s) =>
    s.fichas.some((f) => sinArmar !== null && ocupada(f) && mismaRuta(f.ruta, sinArmar.carpeta)),
  )
  const algunaOcupada = usarEstado((s) => s.fichas.some(ocupada))
  const reiniciando = usarEstado((s) => s.reiniciando)
  const reiniciarAhora = usarEstado((s) => s.reiniciarAhora)
  const pedido = usarEstado((s) => s.actualizarPedido)
  const ponerPedido = usarEstado((s) => s.ponerActualizarPedido)
  const alTerminar = usarEstado((s) => s.reiniciarAlTerminar)
  const [error, setError] = useState<string | null>(null)
  const [ahora, setAhora] = useState(() => Date.now())
  const estado = estadoActualizar({ sinArmar, version, iaTrabajando })
  const [solo, setSolo] = useState<ActualizarSolo | null>(null)
  /** El commit que se armó solo: si falla, no se reintenta solo hasta que haya otro. */
  const [armadoSolo, setArmadoSolo] = useState<string | null>(null)
  const accion = solo
    ? queHacerSolo({
        sinArmar,
        version,
        iaIridiumOcupada,
        algunaOcupada,
        fallido: sinArmar?.fallo ? armadoSolo : null,
      })
    : null
  const pendienteCommit = sinArmar?.pendiente?.commit ?? null

  useEffect(() => {
    void window.iridium.actualizarSolo().then(setSolo)
  }, [])
  // Armar solo: si sigue así todo el rato de espera (la IA no vuelve a trabajar ni llega otro commit).
  useEffect(() => {
    if (accion !== 'armar' || !solo || pedido) return
    const t = setTimeout(() => {
      setArmadoSolo(pendienteCommit)
      void window.iridium.armar()
    }, solo.esperaMs)
    return () => clearTimeout(t)
  }, [accion, solo, pedido, pendienteCommit])
  // Reiniciar solo: se mira cada tanto si Iridium lleva el rato sin usarse; mientras se la usa, se espera.
  useEffect(() => {
    if (accion !== 'reiniciar' || !solo || reiniciando || alTerminar) return
    let vivo = true
    const mirar = async () => {
      const sinUsar = (await window.iridium.segundosSinUso()) >= solo.quietoSeg
      if (vivo && sinUsar) reiniciarAhora()
    }
    const t = setInterval(() => void mirar(), Math.min(15_000, Math.max(250, solo.esperaMs)))
    return () => {
      vivo = false
      clearInterval(t)
    }
  }, [accion, solo, reiniciando, alTerminar, reiniciarAhora])

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
        <span className="senal rojo" title={error ?? (estado.tipo === 'fallo' ? estado.motivo : undefined)}>
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
      <span
        className="it actualizar-it"
        title={
          pedido
            ? 'La app se sigue usando; al terminar, se reinicia sola'
            : 'La app se sigue usando; la versión nueva entra sola cuando ninguna IA trabaje y no uses Iridium un rato'
        }
      >
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
        title={
          bloqueado
            ? 'Espera a que la IA de Iridium termine'
            : solo
              ? `${estado.detalle}. Entra sola cuando ninguna IA trabaje y no uses Iridium un rato; Actualizar la pone ya`
              : estado.detalle
        }
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
      <span className={`senal ${error ? 'rojo' : 'ambar'}`}>
        <Icono nombre={error ? 'error' : 'espera'} />
        {sinPermiso
          ? 'Sin acceso a las versiones nuevas'
          : 'Para recibir versiones nuevas, iniciá sesión en GitHub'}
      </span>
      <button type="button" className="senal" disabled={entrando} title={ayuda} onClick={() => void entrar()}>
        <Icono nombre={entrando ? 'sync' : 'reintentar'} gira={entrando} />
        {entrando ? 'Esperando a GitHub…' : sinPermiso ? 'Probar de nuevo' : 'Iniciar sesión'}
      </button>
    </span>
  )
}

/**
 * La barra de abajo sin ruido (D-108): Claude solo cuando falla, lo de la sección, Actualizar y, a la derecha, el uso.
 * Sin las sesiones abiertas ni la hora: las pestañas ya dicen qué trabaja.
 */
function BarraEstado() {
  const motor = usarEstado((s) => s.motor)
  return (
    <footer className="estado-barra">
      <span className="it claude" data-motor={motor.tipo}>
        <SenalClaude motor={motor} />
      </span>
      <Actualizar />
      <AccesoVersionesGithub />
      <span className="der">
        <UsoEnLaBarra />
      </span>
    </footer>
  )
}

export function Marco({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <BarraTitulo />
      <BarraActividad />
      {children}
      <BarraEstado />
      <Avisos />
      <Ajustes />
      <ConfirmarCierre />
    </div>
  )
}
