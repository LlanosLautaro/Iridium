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
import { PanelConsolas, SenalConsolas } from './Consolas'
import { UsoEnLaBarra } from './Uso'

const SIN_PREGUNTAS = { sinResponder: 0, frenan: 0 }

function BotonActividad({
  activa,
  nombre,
  detalle,
  icono,
  n,
  queCuenta = 'abiertos',
  ambar = false,
  alTocar,
}: {
  activa: boolean
  nombre: string
  detalle: string
  icono: NombreIcono
  n: number
  /** Qué cuenta el número, para el lector de pantalla. */
  queCuenta?: string
  /** El punto en ámbar: algo frena el proyecto. */
  ambar?: boolean
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
      {/* Un punto, el número está en el nombre: la Bandeja, si algo espera al usuario (R-103; ámbar si frena, como el
      inicio), y los comentarios abiertos de la Revisión, gris: esperan a la IA, no al usuario (R-50). */}
      {n > 0 && <span className={ambar ? 'punto ambar' : 'punto'} />}
    </button>
  )
}

/** El ⚙ abajo en la barra de íconos, en cualquier pantalla: abre la ventana de Ajustes (AJ-W1). */
/** El ⚙ de abajo; dentro de un proyecto abre en «Este proyecto» (Ajustes del proyecto, W-3, AB-4). */
function BotonAjustes({ seccion }: { seccion?: 'proyecto' }) {
  const abierta = usarEstado((s) => s.ajustes.abierta)
  const abrirAjustes = usarEstado((s) => s.abrirAjustes)
  return (
    <button
      type="button"
      className={abierta ? 'act elegida boton-ajustes' : 'act boton-ajustes'}
      title="Ajustes (Ctrl+,)"
      aria-label="Ajustes"
      aria-haspopup="dialog"
      onClick={() => abrirAjustes(seccion)}
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
  const { sinResponder, frenan } = tarjeta?.preguntas ?? SIN_PREGUNTAS
  if (seccion === 'proyecto' && ruta) {
    const boton = (s: SeccionDeProyecto) => (
      <BotonActividad
        key={s.id}
        activa={seccionProyecto === s.id}
        nombre={s.nombre}
        detalle={
          s.id === 'revision' && revision > 0
            ? ` · ${revision} ${revision === 1 ? 'abierto, espera' : 'abiertos, esperan'} a la IA`
            : s.id === 'pendientes' && frenan > 0
              ? ` · ${frenan === 1 ? 'una frena' : `${frenan} frenan`} el proyecto`
              : ''
        }
        icono={s.icono}
        n={s.id === 'revision' ? revision : s.id === 'pendientes' ? sinResponder : 0}
        queCuenta={s.id === 'pendientes' ? 'sin responder' : revision === 1 ? 'abierto' : 'abiertos'}
        ambar={s.id === 'pendientes' && frenan > 0}
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
        <BotonAjustes seccion="proyecto" />
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
 * (T-65) · terminada (con sus preguntas, en ámbar) · error (en rojo). Las preguntas que dejó el turno cuentan mientras
 * sigan sin responder (R-98): con `sinResponder`, las que ya respondiste no se cuentan.
 */
export function SenalSesion({ ficha, sinResponder }: { ficha: FichaSesion; sinResponder?: number }) {
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
  const n = Math.min(ficha.preguntas.length, sinResponder ?? Number.POSITIVE_INFINITY)
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
  if (ficha) return <SenalSesion ficha={ficha} sinResponder={preguntas.sinResponder} />
  return null
}

/**
 * La barra de título propia (D-041): el inicio y la barra de proyectos, una pestaña por cada proyecto abierto, con su
 * ícono (Q-62), que queda aunque no trabaje (D-043); tocar una abre el proyecto y × la cierra (salvo mientras la IA
 * trabaja); arrastrar una pestaña la cambia de lugar, y el orden se recuerda (R-102). La ventana se arrastra desde el
 * espacio libre; los tres botones de la derecha los dibuja Windows.
 */
function BarraTitulo() {
  const fichas = usarEstado((s) => s.fichas)
  const lista = usarEstado((s) => s.lista)
  const guardadas = usarEstado((s) => s.preferencias.pestanas)
  const seccion = usarEstado((s) => s.seccion)
  const abierto = usarEstado((s) => s.proyectoAbierto)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const cerrarPestana = usarEstado((s) => s.cerrarPestana)
  const guardarPreferencias = usarEstado((s) => s.guardarPreferencias)
  const [arrastrada, setArrastrada] = useState<string | null>(null)
  const [destino, setDestino] = useState<{ ruta: string; despues: boolean } | null>(null)
  // Las guardadas que siguen en la carpeta, más las sesiones que arrancaron sin abrir el proyecto y el abierto.
  const rutas = guardadas.filter((r) => lista?.tipo !== 'lista' || tarjetaDe(lista, r))
  for (const r of [...fichas.map((f) => f.ruta), ...(abierto ? [abierto] : [])])
    if (!rutas.includes(r)) rutas.push(r)
  const soltar = () => {
    if (arrastrada && destino && arrastrada !== destino.ruta) {
      const sin = rutas.filter((r) => r !== arrastrada)
      const i = sin.indexOf(destino.ruta) + (destino.despues ? 1 : 0)
      guardarPreferencias({ pestanas: [...sin.slice(0, i), arrastrada, ...sin.slice(i)] })
    }
    setArrastrada(null)
    setDestino(null)
  }
  return (
    <header className="titulo">
      <BotonInicio />
      <div className="barra-proyectos" role="tablist" aria-label="Proyectos abiertos">
        {rutas.map((ruta) => {
          const tarjeta = tarjetaDe(lista, ruta)
          const ficha = fichas.find((f) => f.ruta === ruta) ?? null
          const nombre = tarjeta?.nombre ?? ruta.split(/[\\/]/).pop() ?? ruta
          const activa = seccion === 'proyecto' && abierto === ruta
          const marca =
            arrastrada && destino?.ruta === ruta && arrastrada !== ruta
              ? destino.despues
                ? ' soltar-despues'
                : ' soltar-antes'
              : ''
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: arrastrar para ordenar es del mouse; las pestañas de adentro son botones.
            <div
              key={ruta}
              className={`${activa ? 'proy elegido' : 'proy'}${arrastrada === ruta ? ' arrastrada' : ''}${marca}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', nombre)
                setArrastrada(ruta)
              }}
              onDragOver={(e) => {
                if (!arrastrada) return
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                const caja = e.currentTarget.getBoundingClientRect()
                const despues = e.clientX > caja.left + caja.width / 2
                if (destino?.ruta !== ruta || destino.despues !== despues) setDestino({ ruta, despues })
              }}
              onDrop={(e) => {
                e.preventDefault()
                soltar()
              }}
              onDragEnd={() => {
                setArrastrada(null)
                setDestino(null)
              }}
            >
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
  // Una consola corriendo (un `pnpm dev`) también: reiniciar solo la cortaría (I-10).
  const algunaOcupada = usarEstado(
    (s) => s.fichas.some(ocupada) || s.consolas.some((c) => c.estado === 'corriendo'),
  )
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
    const antes = version?.fecha ?? null
    // El pedido va después: con Reintentar, el fallo de la vez anterior todavía está y lo borraría en el acto. Cuando
    // `armar` responde, el estado nuevo (armando) ya llegó.
    const r = await window.iridium.armar()
    if (r.tipo === 'error') setError(r.mensaje)
    else ponerPedido({ antes })
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
  // «Actualizando…» solo cuando de verdad empezó: tocaste Actualizar o Iridium se está reiniciando. Mientras la versión
  // nueva se prepara sola, el botón sigue ahí: tocarlo la pone apenas esté.
  if (reiniciando)
    return (
      <span className="it actualizar-it">
        <span className="armando">
          <Icono nombre="sync" gira />
          Actualizando…
        </span>
      </span>
    )
  if (estado.tipo === 'armando' && !pedido)
    return (
      <span className="it actualizar-it">
        <button
          type="button"
          className="boton secundario chico"
          title={`Preparando la versión nueva (${tiempoArmando(estado.desde, ahora) || 'recién empieza'}); entra sola cuando ninguna IA trabaje y no uses Iridium un rato. Actualizar la pone apenas esté lista`}
          onClick={() => void armar()}
        >
          <Icono nombre="bajar" />
          Actualizar
        </button>
      </span>
    )
  if (estado.tipo === 'armando')
    return (
      <span
        className="it actualizar-it"
        title="La app se sigue usando; al terminar de prepararla, se reinicia sola"
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
        className="boton secundario chico"
        disabled={bloqueado}
        title={
          bloqueado
            ? 'Espera a que la IA de Iridium termine'
            : solo
              ? `${estado.detalle}. Entra sola cuando ninguna IA trabaje y no uses Iridium un rato; Actualizar la pone ya`
              : estado.detalle
        }
        onClick={actualizar}
      >
        <Icono nombre="bajar" />
        Actualizar
      </button>
      {bloqueado && <span className="motivo">espera a que la IA de Iridium termine</span>}
      {/* Ya se intentó y no entró: sin esto, el botón parece prometer algo que acaba de fallar. */}
      {estado.tipo === 'disponible' && version?.noEntro && !alTerminar && (
        <span className="motivo">la última vez no entró</span>
      )}
      {alTerminar && <span className="motivo">se reinicia cuando terminen las sesiones</span>}
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
      <SenalConsolas />
      <Actualizar />
      <span className="der">
        <UsoEnLaBarra />
      </span>
    </footer>
  )
}

/** Fuera de un proyecto, el panel de las consolas va abajo de toda la pantalla, con todas (T-116). */
function ConsolasDelInicio() {
  const seccion = usarEstado((s) => s.seccion)
  if (seccion === 'proyecto') return null
  return (
    <div className="consolas-inicio">
      <PanelConsolas lugar={null} />
    </div>
  )
}

export function Marco({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <BarraTitulo />
      <BarraActividad />
      {children}
      <ConsolasDelInicio />
      <BarraEstado />
      <Avisos />
      <Ajustes />
      <ConfirmarCierre />
    </div>
  )
}
