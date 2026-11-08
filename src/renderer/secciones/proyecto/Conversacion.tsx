// La conversación con la IA del proyecto (04-ux.md › W-3; H-4, H-5, H-14, H-17), siempre a la derecha (D-041): en su
// barra, las conversaciones anteriores, Nueva y Seguí; la última conversación (también la de VS Code), el campo de
// texto y Detener. Los códigos y las citas de la IA abren Docs (F-4). Cada proyecto guarda la suya y su posición (H-6).
import {
  type KeyboardEvent,
  memo,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { leerMensaje } from '../../../compartido/mensaje-revision'
import {
  CONTEXTO_ALTO,
  type ConversacionAnterior,
  type Entrada,
  type FichaSesion,
  type TarjetaProyecto,
} from '../../../compartido/puente'
import { type ConversacionVista, fichaDe, usarEstado, vistaDe } from '../../estado'
import { useAltoDelTexto } from '../../ui/altoDelTexto'
import { Icono } from '../../ui/Icono'
import { Menu } from '../../ui/Menu'
import { cuandoSera, pc } from '../../ui/tiempo'
import { MedidorContexto, ModeloYEsfuerzo } from './AjustesIa'
import { tocarEnlace } from './enlaces'
import { Captura } from './Revision'

/** Dónde quedó cada conversación: la posición y si estaba pegada al final (para seguir lo que llega). */
const posiciones = new Map<string, { arriba: number; alFinal: boolean }>()

const hora = (ms: number) =>
  new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** El título de una conversación que Claude Code todavía no nombró: su primer mensaje, como hace él. */
function primerMensaje(entradas: readonly Entrada[]): string | null {
  const e = entradas.find((x) => x.tipo === 'usuario')
  if (e?.tipo !== 'usuario') return null
  const com = leerMensaje(e.texto)
  const texto = com ? `${com.codigo}: ${com.texto}` : e.texto
  return texto.replace(/\s+/g, ' ').trim().slice(0, 120) || null
}

/** Para la lista de anteriores: «hoy 09:50», «ayer 20:47», «25/10 09:50». */
function fechaCorta(ms: number): string {
  const d = new Date(ms)
  const hoy = new Date()
  const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1)
  if (d.toDateString() === hoy.toDateString()) return `hoy ${hora(ms)}`
  if (d.toDateString() === ayer.toDateString()) return `ayer ${hora(ms)}`
  return `${d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} ${hora(ms)}`
}

function cuandoFue(ms: number): string {
  const d = new Date(ms)
  const hoy = new Date()
  const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1)
  const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (mismoDia(d, hoy)) return `hoy a las ${hora(ms)}`
  if (mismoDia(d, ayer)) return `ayer a las ${hora(ms)}`
  return `el ${d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} a las ${hora(ms)}`
}

type Turno =
  | { quien: 'usuario'; clave: string; entrada: Extract<Entrada, { tipo: 'usuario' }> }
  | { quien: 'ia'; clave: string; entradas: Exclude<Entrada, { tipo: 'usuario' }>[] }

/**
 * Junta las entradas en turnos: lo que escribió el usuario y, después, todo lo que hizo la IA. La entrada del control
 * cierra el turno de la IA: lo que corrige después es otro turno (W-12).
 */
function enTurnos(entradas: readonly Entrada[]): Turno[] {
  const turnos: Turno[] = []
  let cortar = false
  for (const e of entradas) {
    if (e.tipo === 'usuario') {
      turnos.push({ quien: 'usuario', clave: e.id, entrada: e })
      continue
    }
    const ultimo = turnos.at(-1)
    if (ultimo?.quien === 'ia' && !cortar) ultimo.entradas.push(e)
    else turnos.push({ quien: 'ia', clave: e.id, entradas: [e] })
    cortar = e.tipo === 'control'
  }
  return turnos
}

function Herramientas({ lista }: { lista: Extract<Entrada, { tipo: 'herramienta' }>[] }) {
  const [abierta, setAbierta] = useState(false)
  const n = lista.length
  return (
    <div className="herramientas" data-abierta={abierta || undefined}>
      <button type="button" aria-expanded={abierta} onClick={() => setAbierta(!abierta)}>
        <Icono nombre="chev" />
        {n === 1 ? `${lista[0]?.accion} ${lista[0]?.objeto ?? ''}`.trim() : `Usó ${n} herramientas`}
      </button>
      {abierta && n > 1 && (
        <ul>
          {lista.map((h) => (
            <li key={h.id}>
              {h.accion}
              {h.objeto && <span className="cod">{h.objeto}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Preguntas({ entrada, ruta }: { entrada: Extract<Entrada, { tipo: 'preguntas' }>; ruta: string }) {
  const n = entrada.preguntas.length
  return (
    <div className="pedido">
      <div className="meta">
        <span className="chip espera">
          <Icono nombre="espera" />
          Dejó {n} {n === 1 ? 'pregunta' : 'preguntas'}
        </span>
      </div>
      <ul className="lista-q">
        {entrada.preguntas.map((q) => (
          <li key={q.codigo} className="fila-q">
            <span className="q">{q.codigo}</span>
            <span className="tipo">
              {q.tipo}
              {q.frena && ' · frena'}
            </span>
            <span className="texto">{q.pregunta}</span>
          </li>
        ))}
      </ul>
      <div className="acc">
        <button
          type="button"
          className="btn primario"
          onClick={() => usarEstado.getState().responderEn(ruta)}
        >
          Responder
        </button>
      </div>
    </div>
  )
}

/**
 * F-5: Claude Code sin sesión iniciada. Iniciar sesión abre el navegador (CO-I1); Reintentar vuelve a mandar lo que
 * no se envió (o Seguí).
 */
function SinSesion({ entrada, ruta }: { entrada: Extract<Entrada, { tipo: 'sin-sesion' }>; ruta: string }) {
  const trabajando = usarEstado((s) => fichaDe(s.fichas, ruta)?.estado === 'trabajando')
  const conSesion = usarEstado((s) => s.motor.tipo === 'listo' || s.motor.tipo === 'clave-api')
  const iniciando = usarEstado((s) => s.iniciandoSesion)
  const iniciarSesion = usarEstado((s) => s.iniciarSesion)
  const [reintentando, setReintentando] = useState(false)
  return (
    <div className="falla-motor" data-tipo={conSesion ? 'resuelta' : undefined} role="alert">
      <p className="tit">
        <Icono nombre={conSesion ? 'check' : 'error'} />
        {conSesion ? 'Ya tenés sesión en Claude' : 'Claude Code no tiene sesión iniciada'}
      </p>
      <p>
        {entrada.enviado
          ? 'La sesión se cortó porque Claude Code perdió el inicio de sesión. '
          : 'No se envió nada. '}
        {conSesion
          ? 'Tocá Reintentar para seguir.'
          : iniciando
            ? 'Terminá de entrar en el navegador; si Claude pide un código, pegalo en la ventana que se abrió. Iridium lo nota solo.'
            : 'Iniciá sesión con tu cuenta de Claude: se abre el navegador, como desde la extensión de VS Code.'}
      </p>
      {entrada.reintentar && <p className="nota">Lo que escribiste: «{entrada.reintentar}»</p>}
      <div className="acc">
        {!conSesion && (
          <button type="button" className="btn primario chico" disabled={iniciando} onClick={iniciarSesion}>
            <Icono nombre={iniciando ? 'sync' : 'abrir'} gira={iniciando} />
            {iniciando ? 'Esperando el navegador…' : 'Iniciar sesión'}
          </button>
        )}
        <button
          type="button"
          className={`btn ${conSesion ? 'primario' : 'secundario'} chico`}
          disabled={reintentando || trabajando}
          onClick={() => {
            setReintentando(true)
            void window.iridium
              .seguir(ruta, entrada.reintentar ? { texto: entrada.reintentar } : {})
              .finally(() => setReintentando(false))
          }}
        >
          <Icono nombre="reintentar" />
          {reintentando ? 'Verificando…' : 'Reintentar'}
        </button>
      </div>
    </div>
  )
}

/** F-5: se agotó el uso; dice cuándo se libera. La conversación queda para Seguí. */
function UsoAgotado({ entrada }: { entrada: Extract<Entrada, { tipo: 'uso-agotado' }> }) {
  return (
    <div className="falla-motor" data-tipo="uso" role="alert">
      <p className="tit">
        <Icono nombre="espera" />
        Se agotó el uso de tu suscripción
      </p>
      <p>
        {entrada.libera !== null ? `Se libera ${cuandoSera(entrada.libera)}. ` : ''}
        La conversación queda guardada: cuando se libere, tocá Seguí y retoma desde acá.
      </p>
    </div>
  )
}

type EntradaIa = Exclude<Entrada, { tipo: 'usuario' }>
type Paso = Extract<Entrada, { tipo: 'ia' | 'herramienta' }>

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

/** Lo que la IA escribe y usa en el camino: las herramientas juntas y sus notas, en el riel del proceso. */
function Pasos({ pasos }: { pasos: Paso[] }) {
  const partes: ReactNode[] = []
  let herramientas: Extract<Entrada, { tipo: 'herramienta' }>[] = []
  const soltarHerramientas = () => {
    const primera = herramientas[0]
    if (primera) partes.push(<Herramientas key={primera.id} lista={herramientas} />)
    herramientas = []
  }
  for (const e of pasos) {
    if (e.tipo === 'herramienta') {
      herramientas.push(e)
      continue
    }
    soltarHerramientas()
    // biome-ignore lint/security/noDangerouslySetInnerHtml: lo arma markdown-it en el proceso principal, sin HTML crudo.
    partes.push(<div key={e.id} className="md nota-ia" dangerouslySetInnerHTML={{ __html: e.html }} />)
  }
  soltarHerramientas()
  return <>{partes}</>
}

/**
 * El proceso de un turno (D-061): lo que la IA hizo y fue contando hasta su última herramienta, atenuado y sobre un
 * riel. Mientras trabaja se ve entero; al terminar con una respuesta queda plegado en una línea.
 */
function Proceso({ pasos, plegable }: { pasos: Paso[]; plegable: boolean }) {
  const [abierto, setAbierto] = useState(false)
  const h = pasos.filter((e) => e.tipo === 'herramienta').length
  const n = pasos.length - h
  const resumen = [h > 0 && plural(h, 'herramienta', 'herramientas'), n > 0 && plural(n, 'nota', 'notas')]
    .filter(Boolean)
    .join(' · ')
  if (!plegable)
    return (
      <div className="proceso-ia">
        <Pasos pasos={pasos} />
      </div>
    )
  return (
    <div className="proceso-ia plegado" data-abierto={abierto || undefined}>
      <button
        type="button"
        className="proceso-cab"
        aria-expanded={abierto}
        onClick={() => setAbierto(!abierto)}
      >
        <Icono nombre="chev" />
        Proceso
        <span className="proceso-n">{resumen}</span>
      </button>
      {abierto && <Pasos pasos={pasos} />}
    </div>
  )
}

function Final({ e, ruta }: { e: Exclude<EntradaIa, Paso>; ruta: string }) {
  if (e.tipo === 'aviso')
    return (
      <p className={`linea-aviso ${e.clase}`} role={e.clase === 'error' ? 'alert' : undefined}>
        <Icono nombre={e.clase === 'error' ? 'error' : 'cuadro'} />
        {e.texto}
      </p>
    )
  if (e.tipo === 'sin-sesion') return <SinSesion entrada={e} ruta={ruta} />
  if (e.tipo === 'uso-agotado') return <UsoAgotado entrada={e} />
  if (e.tipo === 'control') return <Control entrada={e} />
  return <Preguntas entrada={e} ruta={ruta} />
}

/**
 * Lo que el control de Iridium le devolvió a la IA (W-12): plegado, en gris (le habla a la IA, no al usuario). Mientras
 * corrige, el ícono que gira; al terminar, ✓ por lo corregido y «!» por lo que quedó como aviso del framework.
 */
function Control({ entrada }: { entrada: Extract<Entrada, { tipo: 'control' }> }) {
  const [abierto, setAbierto] = useState(entrada.corrigiendo)
  const n = entrada.avisos.length
  const quedan = entrada.avisos.filter((a) => a.quedo === true).length
  const sabido = !entrada.corrigiendo && entrada.avisos.every((a) => a.quedo !== null)
  const cosas = n === 1 ? '1 cosa mal escrita' : `${n} cosas mal escritas`
  const titulo = !sabido
    ? `El control encontró ${cosas}; la IA ${entrada.corrigiendo ? 'las corrige' : 'las corrigió'}`
    : quedan === 0
      ? `El control encontró ${cosas}; la IA ${n === 1 ? 'la corrigió' : 'las corrigió'}`
      : `Corrigió ${n - quedan} de ${n}; ${quedan === 1 ? 'queda 1 aviso' : `quedan ${quedan} avisos`} del framework`
  return (
    <div className={`control-ia${sabido && quedan === 0 ? ' ok' : ''}`} data-abierto={abierto || undefined}>
      <button type="button" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
        <Icono nombre={entrada.corrigiendo ? 'sync' : 'check'} gira={entrada.corrigiendo} />
        {titulo}
        <Icono nombre="chev" />
      </button>
      {abierto && (
        <ul>
          {entrada.avisos.map((a) => (
            <li
              key={`${a.donde} ${a.texto}`}
              className={a.quedo === true ? 'queda' : a.quedo === false ? 'hecho' : undefined}
            >
              {a.texto}
              <span className="donde">{a.donde}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** El nombre de quien habla (AJ-2): el que se eligió en Ajustes o «Vos» e «IA»; largo, se corta y se ve entero al pasar. */
function Quien({ ia = false }: { ia?: boolean }) {
  const nombre = usarEstado((s) => (ia ? s.preferencias.nombreIa : s.preferencias.nombreUsuario))
  const texto = nombre || (ia ? 'IA' : 'Vos')
  return (
    <span className="nombre" title={nombre ? texto : undefined}>
      {texto}
    </span>
  )
}

/**
 * Un turno de la IA (D-061): arriba el proceso (hasta la última herramienta) y después la respuesta, en letra de
 * lectura. Los avisos, errores y preguntas nunca quedan plegados. Mientras trabaja, todo es proceso.
 */
function TurnoIa({
  turno,
  ruta,
  enCurso,
}: {
  turno: Extract<Turno, { quien: 'ia' }>
  ruta: string
  enCurso: boolean
}) {
  const cuando = turno.entradas.find((e) => e.tipo === 'ia' && e.cuando !== null)
  const ultima = turno.entradas.findLastIndex((e) => e.tipo === 'herramienta')
  const corte = enCurso ? turno.entradas.length : ultima + 1
  const pasos: Paso[] = []
  const sueltas: Exclude<EntradaIa, Paso>[] = []
  for (const e of turno.entradas.slice(0, corte)) {
    if (e.tipo === 'ia' || e.tipo === 'herramienta') pasos.push(e)
    else sueltas.push(e)
  }
  const respuesta = turno.entradas.slice(corte)
  const hayRespuesta = respuesta.some((e) => e.tipo === 'ia')
  return (
    <div className="turno ia">
      <div className="quien ia">
        <Quien ia />
        {cuando?.tipo === 'ia' && cuando.cuando !== null && <time>{hora(cuando.cuando)}</time>}
      </div>
      {pasos.length > 0 && <Proceso pasos={pasos} plegable={!enCurso && hayRespuesta} />}
      {sueltas.map((e) => (
        <Final key={e.id} e={e} ruta={ruta} />
      ))}
      {respuesta.map((e) =>
        e.tipo === 'ia' ? (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: lo arma markdown-it en el proceso principal, sin HTML crudo.
          <div key={e.id} className="md respuesta-ia" dangerouslySetInnerHTML={{ __html: e.html }} />
        ) : e.tipo === 'herramienta' ? null : (
          <Final key={e.id} e={e} ruta={ruta} />
        ),
      )}
    </div>
  )
}

/** Lo que escribió el usuario; un comentario de la Revisión enviado se ve como tarjeta que lo abre (W-R4). */
function MensajePropio({ ruta, texto }: { ruta: string; texto: string }) {
  const abrirComentario = usarEstado((s) => s.abrirComentario)
  const com = leerMensaje(texto)
  if (!com) return <p className="propio">{texto}</p>
  return (
    <button
      type="button"
      className="msg-com"
      title={`Abrir ${com.codigo} en Revisión`}
      onClick={() => abrirComentario(ruta, com.codigo)}
    >
      <span className="cab">
        <Icono nombre="revision" />
        <b>Comentario {com.codigo}</b>
        {com.archivo && ` · ${com.archivo.ruta.split('/').at(-1)}:${com.archivo.linea}`}
        <span className="ir" aria-hidden="true">
          <Icono nombre="chev" />
        </span>
      </span>
      <span className="cuerpo">
        <Captura ruta={ruta} codigo={com.codigo} conCaptura />
        <span className="txt">{com.texto}</span>
      </span>
    </button>
  )
}

/**
 * Los mensajes del hilo. Aparte y memorizados: si no, cada letra del campo redibujaba toda la conversación (con 500
 * mensajes, 51 ms por tecla; hito 8, Defecto 11).
 */
const Turnos = memo(function Turnos({
  turnos,
  ruta,
  trabajando,
}: {
  turnos: Turno[]
  ruta: string
  trabajando: boolean
}) {
  return (
    <>
      {turnos.map((t, i) =>
        t.quien === 'usuario' ? (
          <div key={t.clave} className="turno usuario">
            <div className="quien">
              <Quien />
              {t.entrada.cuando !== null && <time>{hora(t.entrada.cuando)}</time>}
            </div>
            <MensajePropio ruta={ruta} texto={t.entrada.texto} />
          </div>
        ) : (
          <TurnoIa key={t.clave} turno={t} ruta={ruta} enCurso={trabajando && i === turnos.length - 1} />
        ),
      )}
    </>
  )
})

function Hilo({
  c,
  ficha,
  ruta,
  vacio,
}: {
  c: ConversacionVista
  ficha: FichaSesion | null
  ruta: string
  vacio: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const sumarAnteriores = usarEstado((s) => s.sumarAnteriores)
  const trabajando = ficha?.estado === 'trabajando'
  const turnos = useMemo(() => enTurnos(c.entradas), [c.entradas])
  const ultimaHerramienta = c.entradas.at(-1)?.tipo === 'herramienta' ? c.entradas.at(-1) : null

  // Al volver al proyecto, la conversación está donde quedó (H-6); lo nuevo se sigue si estaba al final.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const pos = posiciones.get(ruta)
    if (!pos || pos.alFinal) el.scrollTop = el.scrollHeight
    else el.scrollTop = pos.arriba
  })

  const alDesplazar = () => {
    const el = ref.current
    if (!el) return
    posiciones.set(ruta, {
      arriba: el.scrollTop,
      alFinal: el.scrollHeight - el.scrollTop - el.clientHeight < 40,
    })
  }

  const verAnteriores = async () => {
    const el = ref.current
    const desdeAbajo = el ? el.scrollHeight - el.scrollTop : 0
    sumarAnteriores(ruta, await window.iridium.anteriores(ruta, c.entradas.length))
    requestAnimationFrame(() => {
      if (!el) return
      el.scrollTop = el.scrollHeight - desdeAbajo
      alDesplazar()
    })
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: solo delega los clics de los enlaces de adentro, que ya son enfocables.
    <section
      ref={ref}
      className="hilo"
      aria-label="Conversación con la IA"
      aria-live="polite"
      onScroll={alDesplazar}
      onClick={(e) => tocarEnlace(e, ruta)}
    >
      {c.anteriores > 0 && (
        <div className="mas-arriba">
          <button type="button" className="btn secundario" onClick={() => void verAnteriores()}>
            Ver mensajes anteriores ({c.anteriores})
          </button>
        </div>
      )}
      {turnos.length === 0 && !trabajando && vacio}
      <Turnos turnos={turnos} ruta={ruta} trabajando={trabajando} />
      {trabajando && !ficha?.reintento && (
        <div className="ahora" role="status">
          <Icono nombre="sync" gira />
          Trabajando
          {ultimaHerramienta?.tipo === 'herramienta' &&
            ` · ${ultimaHerramienta.accion}${ultimaHerramienta.objeto ? ` ${ultimaHerramienta.objeto}` : ''}`}
        </div>
      )}
      {trabajando && ficha?.reintento && (
        // Claude Code no llega a Claude y reintenta solo (Defecto 10): que no parezca que trabaja.
        <div className="ahora reintentando" role="status">
          <Icono nombre="espera" />
          {ficha.reintento.causa === 'conexion' ? 'Sin conexión con Claude' : 'Claude no responde'}: reintento{' '}
          {ficha.reintento.intento} de {ficha.reintento.maximo}. Podés esperar o detenerla.
        </div>
      )}
    </section>
  )
}

/** Las conversaciones anteriores del proyecto (H-17): la más nueva arriba; elegir una la muestra y se continúa. */
function Anteriores({
  ruta,
  actual,
  trabajando,
}: {
  ruta: string
  actual: string | null
  trabajando: boolean
}) {
  const [lista, setLista] = useState<ConversacionAnterior[] | null>(null)
  const ponerConversacion = usarEstado((s) => s.ponerConversacion)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const nombre = usarEstado(
    (s) => s.lista?.tipo === 'lista' && s.lista.proyectos.find((x) => x.ruta === ruta)?.nombre,
  )
  const elegir = async (id: string) => {
    const r = await window.iridium.elegirConversacion(ruta, id)
    posiciones.delete(ruta)
    cambiarVista(ruta, { enBlanco: false })
    ponerConversacion(r)
  }
  return (
    <Menu
      clase="anteriores"
      titulo={
        trabajando
          ? 'Mientras la IA trabaja no se cambia de conversación'
          : 'Conversaciones anteriores de este proyecto'
      }
      deshabilitado={trabajando}
      alAbrir={() => {
        setLista(null)
        void window.iridium.conversacionesAnteriores(ruta).then(setLista)
      }}
      boton={<Icono nombre="reloj" etiqueta="Conversaciones anteriores" />}
    >
      {(cerrar) => (
        <>
          <h3>Conversaciones{nombre ? ` de ${nombre}` : ''}</h3>
          {!lista && <p className="nota">Buscando…</p>}
          {lista?.length === 0 && <p className="nota">Este proyecto todavía no tiene conversaciones.</p>}
          {lista?.map((c) => (
            <button
              key={c.id}
              type="button"
              role="menuitem"
              className={c.id === actual ? 'conv actual' : 'conv'}
              aria-current={c.id === actual}
              onClick={() => {
                cerrar()
                if (c.id !== actual) void elegir(c.id)
              }}
            >
              <b title={c.titulo}>{c.titulo}</b>
              <time>{fechaCorta(c.modificada)}</time>
              <small>
                {c.origen === 'vscode' ? 'VS Code' : 'Iridium'}
                {c.id === actual && ' · la que está abierta'}
              </small>
            </button>
          ))}
        </>
      )}
    </Menu>
  )
}

/** De qué se habla en el chat (SK-3, IN-2): una skill (lo de siempre) o una idea. */
export interface Sobre {
  nombre: string
  que?: 'skill' | 'idea'
  quitar: () => void
}

/** Lo que va al principio del mensaje: `Sobre la skill X` o `Sobre la idea «X»`. */
function sobreQue(s: Sobre): string {
  return s.que === 'idea' ? `Sobre la idea «${s.nombre}»` : `Sobre la skill ${s.nombre}`
}

/**
 * La conversación de un proyecto o un chat que se mira, sin Seguí (no tiene próximo paso) y con su propia bienvenida:
 * `ideas`, el de la vista de Proyectos (D-060, la carpeta Ideas); `skills`, el de la sección Skills (D-068, la carpeta
 * Skills). Con `sobre`, arriba del cuadro dice de qué skill o idea se habla y el mensaje sale con ese nombre
 * (SK-3, IN-2).
 */
export function Conversacion({
  p,
  chat,
  sobre = null,
}: {
  p: TarjetaProyecto
  chat?: 'ideas' | 'skills'
  sobre?: Sobre | null
}) {
  const general = chat !== undefined
  // Una carpeta simple (W-3, D-095) no tiene `estado.md`: no hay próximo paso que seguir, solo lo que se le pida.
  const simple = !general && p.framework === null
  const ruta = p.ruta
  const c = usarEstado((s) => s.conversaciones[ruta])
  const ficha = usarEstado((s) => fichaDe(s.fichas, ruta))
  const ponerConversacion = usarEstado((s) => s.ponerConversacion)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const pidioEnBlanco = usarEstado((s) => vistaDe(s.vistas, ruta).enBlanco)
  // Lo escrito y no enviado queda guardado: al cambiar de proyecto y al cerrar Iridium (D-060).
  const texto = usarEstado((s) => s.escritos[ruta] ?? '')
  const escribir = usarEstado((s) => s.escribir)
  const setTexto = (t: string) => escribir(ruta, t)
  const [enviando, setEnviando] = useState(false)
  const paraElCampo = usarEstado((s) => s.paraElCampo[ruta])
  const soltarCampo = usarEstado((s) => s.soltarCampo)
  // El cuadro crece con lo que se escribe (hasta un tope, después se desplaza) y vuelve a una línea al enviar.
  const caja = useRef<HTMLTextAreaElement>(null)
  useAltoDelTexto(caja, texto, 0)
  const trabajando = ficha?.estado === 'trabajando'
  const enBlanco = pidioEnBlanco && !trabajando

  // Otra sección dejó un pedido para la IA (Pedírselo a la IA, H-R7): queda escrito, sin enviar.
  useEffect(() => {
    if (paraElCampo === undefined) return
    escribir(ruta, paraElCampo)
    soltarCampo(ruta)
    requestAnimationFrame(() => caja.current?.focus())
  }, [paraElCampo, soltarCampo, escribir, ruta])

  // Cada vez que se abre el proyecto se mira si la conversación cambió afuera; no manda nada al modelo.
  useEffect(() => {
    let vigente = true
    void window.iridium.abrirConversacion(ruta).then((r) => {
      if (!vigente) return
      const actual = usarEstado.getState().conversaciones[ruta]
      const igual =
        actual &&
        actual.id === r.id &&
        actual.modificada === r.modificada &&
        actual.entradas.length >= r.entradas.length
      if (!igual || actual.usadaAfuera !== r.usadaAfuera)
        ponerConversacion(igual ? { ...r, entradas: actual.entradas, anteriores: actual.anteriores } : r)
    })
    return () => {
      vigente = false
    }
  }, [ruta, ponerConversacion])

  const seguir = async (pedido: { texto?: string; nueva?: boolean }) => {
    setEnviando(true)
    try {
      await window.iridium.seguir(ruta, enBlanco ? { ...pedido, nueva: true } : pedido)
      setTexto('')
      if (enBlanco) cambiarVista(ruta, { enBlanco: false })
    } finally {
      setEnviando(false)
    }
  }
  const enviar = () => {
    if (texto.trim() === '' || enviando) return
    void seguir({ texto: sobre ? `${sobreQue(sobre)}: ${texto}` : texto })
  }
  const alTeclado = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      enviar()
    }
  }

  const paso = p.hito?.proximoPaso
  const hayConversacion = !enBlanco && ((c?.entradas.length ?? 0) > 0 || (c?.anteriores ?? 0) > 0)

  const vacio = general ? (
    <div className="sin-conversacion">
      <div className="quien">
        <Quien ia />
        {enBlanco && ' · conversación nueva'}
      </div>
      {chat === 'skills' ? (
        <p>
          Preguntame por una skill o pedime que la cambie: elegila a la izquierda y lo que escribas va sobre
          ella. Los cambios quedan en la carpeta <code>{p.nombre}</code>, con git, y se pueden deshacer.
        </p>
      ) : (
        <p>
          Contame una idea que todavía no sabés dónde va, pedime que cree un proyecto o preguntame por varios
          a la vez. Las ideas quedan anotadas en <code>{p.nombre}/ideas.md</code> hasta que decidamos dónde
          van.
        </p>
      )}
      {enBlanco && (
        <div className="acc">
          <button
            type="button"
            className="btn secundario"
            disabled={enviando}
            onClick={() => cambiarVista(ruta, { enBlanco: false })}
          >
            Volver a la anterior
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className="sin-conversacion">
      <div className="quien">
        <Quien ia />
        {enBlanco && ' · conversación nueva'}
      </div>
      {simple ? (
        <p>
          Esta carpeta no sigue el framework: no hay un próximo paso. Escribime abajo lo que quieras que haga.
        </p>
      ) : (
        <p>
          Con <b>Seguí</b> voy a leer <code>docs/estado.md</code> y hacer el próximo paso{paso ? ':' : '.'}
        </p>
      )}
      {paso && <p className="paso">{paso}</p>}
      <div className="acc">
        {!simple && <span className="nota">O escribile abajo lo que quieras que haga.</span>}
        {enBlanco && (
          <button
            type="button"
            className="btn secundario"
            disabled={enviando}
            onClick={() => cambiarVista(ruta, { enBlanco: false })}
          >
            Volver a la anterior
          </button>
        )}
      </div>
    </div>
  )

  const titulo = enBlanco
    ? 'Conversación nueva'
    : hayConversacion
      ? (c?.titulo ??
        primerMensaje(c?.entradas ?? []) ??
        (c?.modificada ? `Conversación de ${cuandoFue(c.modificada)}` : 'Conversación de hoy'))
      : chat === 'skills'
        ? 'Skills y configuración de Claude'
        : general
          ? 'Ideas y proyectos'
          : 'Sin conversación todavía'
  const subtitulo = enBlanco
    ? general
      ? 'En blanco: empieza con lo que escribas'
      : 'En blanco: empieza con lo que escribas o con Seguí'
    : hayConversacion && c
      ? `${c.modificada !== null ? cuandoFue(c.modificada) : 'hoy'} · empezada en ${c.origen === 'vscode' ? 'VS Code' : 'Iridium'}`
      : chat === 'skills'
        ? `El chat de Skills: trabaja en la carpeta ${p.nombre}`
        : general
          ? `El chat general: trabaja en la carpeta ${p.nombre}`
          : simple
            ? 'Escribile lo que quieras que haga'
            : 'Seguí lee estado.md y hace el próximo paso'

  return (
    <>
      <div className="chat-cab">
        <div className="tit">
          <b title={titulo}>{titulo}</b>
          <small title={subtitulo}>{subtitulo}</small>
        </div>
        <Anteriores ruta={ruta} actual={enBlanco ? null : (c?.id ?? null)} trabajando={trabajando} />
        <button
          type="button"
          className="btn secundario chico"
          disabled={enviando || trabajando || enBlanco}
          title={
            general
              ? 'Abrir una conversación en blanco: empieza con lo que le escribas'
              : 'Abrir una conversación en blanco: empieza con lo que le escribas, o con Seguí'
          }
          onClick={() => cambiarVista(ruta, { enBlanco: true })}
        >
          <Icono nombre="mas" />
          Nueva
        </button>
        {!general && !simple && (
          <button
            type="button"
            className="btn secundario chico sigue"
            disabled={enviando || trabajando}
            title={
              trabajando
                ? 'La IA está trabajando'
                : hayConversacion
                  ? 'Retomar esta conversación: lee docs/estado.md y sigue el próximo paso'
                  : 'La IA lee docs/estado.md y hace el próximo paso'
            }
            onClick={() => void seguir(texto.trim() ? { texto } : {})}
          >
            <Icono nombre="play" />
            Seguí
          </button>
        )}
      </div>
      {c ? (
        <Hilo
          c={enBlanco ? { ...c, entradas: [], anteriores: 0 } : c}
          ficha={ficha}
          ruta={ruta}
          vacio={vacio}
        />
      ) : (
        <section className="hilo" aria-label="Conversación con la IA" aria-busy="true">
          <p className="nota cargando">Leyendo la última conversación…</p>
        </section>
      )}

      {c && hayConversacion && !trabajando && (c.contexto?.porcentaje ?? 0) >= CONTEXTO_ALTO && (
        <div className="retomar">
          <p className="aviso-afuera contexto-alto" role="note">
            <Icono nombre="espera" />
            <span>
              Esta conversación lleva {pc(c.contexto?.porcentaje ?? 0)} del contexto: la IA empieza a resumir
              y olvidar detalles. Conviene seguir en una <b>Nueva</b>; el estado del proyecto queda en sus
              documentos.
            </span>
            <button
              type="button"
              className="btn secundario chico"
              onClick={() => cambiarVista(ruta, { enBlanco: true })}
            >
              Nueva
            </button>
          </p>
        </div>
      )}

      {c && hayConversacion && !trabajando && c.usadaAfuera !== null && (
        <div className="retomar">
          <p className="aviso-afuera" role="note">
            <Icono nombre="espera" />
            <span>
              Esta conversación se usó fuera de Iridium {cuandoFue(c.usadaAfuera)}: puede estar abierta en VS
              Code. Si la seguís acá, las dos escriben en la misma; con <b>Nueva</b> no se pisan.
            </span>
          </p>
        </div>
      )}

      <div className="compositor">
        <div className="caja">
          {sobre && (
            <div className="sobre-skill">
              <span title={`El mensaje sale con «${sobreQue(sobre)}:» al principio`}>
                {sobre.que === 'idea' ? (
                  <>
                    Sobre la idea <b>«{sobre.nombre}»</b>
                  </>
                ) : (
                  <>
                    Sobre la skill <b>{sobre.nombre}</b>
                  </>
                )}
              </span>
              <button
                type="button"
                className="quitar"
                aria-label={`Que el mensaje no sea sobre esa ${sobre.que ?? 'skill'}`}
                title={`Que el mensaje no sea sobre esa ${sobre.que ?? 'skill'}`}
                onClick={sobre.quitar}
              >
                <Icono nombre="x" />
              </button>
            </div>
          )}
          <div className="prompt">
            <span className="sig" aria-hidden="true">
              &gt;
            </span>
            <textarea
              ref={caja}
              placeholder={trabajando ? 'Sumale algo a lo que está haciendo…' : 'Escribile a la IA…'}
              aria-label="Mensaje para la IA"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={alTeclado}
            />
          </div>
          <div className="fila">
            <ModeloYEsfuerzo ruta={ruta} />
            {hayConversacion && c?.contexto && <MedidorContexto contexto={c.contexto} />}
            <div className="der">
              {trabajando && (
                <button
                  type="button"
                  className="btn secundario detener"
                  title="Detener a la IA en el acto (se retoma con Seguí)"
                  onClick={() => void window.iridium.detener(ruta)}
                >
                  <Icono nombre="cuadro" />
                  Detener
                </button>
              )}
              <button
                type="button"
                className="btn-ic"
                title="Enviar (Enter; Shift+Enter, salto de línea)"
                aria-label="Enviar"
                disabled={texto.trim() === '' || enviando}
                onClick={enviar}
              >
                <Icono nombre="flecha" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
