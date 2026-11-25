// La conversación con la IA del proyecto (04-ux.md › W-3; H-4, H-5, H-14, H-17), siempre a la derecha (D-041): en su
// barra, las conversaciones anteriores, Nueva y Continuar; la última conversación (también la de VS Code), el campo de
// texto y Detener. Los códigos y las citas de la IA abren Docs (F-4). Cada proyecto guarda la suya y su posición (H-6).
// Con las piezas de las maquetas (docs/diseno/piezas.css › La conversación; DI-I3, tanda 5) y en español neutro (D-110).
import {
  type ClipboardEvent,
  type KeyboardEvent,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  type AdjuntoPedido,
  type AdjuntoVista,
  adjuntoDeRuta,
  esPegadoLargo,
  LARGO_ESCRITO,
  MAX_ADJUNTOS,
  PEGADO_MAXIMO,
  sumarAdjuntos,
} from '../../../compartido/adjuntos'
import { type Cita, leerCitas, mensajeConCitas } from '../../../compartido/citas'
import {
  type ComandoMotor,
  comandoDe,
  comandoPrimero,
  conComando,
  consultaDe,
  escondidoDe,
  filtrarComandos,
} from '../../../compartido/comandos'
import { leerMensaje, type MensajeComentario } from '../../../compartido/mensaje-revision'
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
import { cuandoFue, cuandoSera, hora, pc } from '../../ui/tiempo'
import { type EnVisor, FichaCita, FichasCompositor, FichasEnviadas, Visor } from './Adjuntos'
import { MedidorContexto, ModeloYEsfuerzo } from './AjustesIa'
import { idOpcion, LineaEscondido, ListaComandos, useCapacidades, useListaComandos } from './Comandos'
import { tocarEnlace } from './enlaces'
import { Captura } from './Revision'

/** Dónde quedó cada conversación: la posición y si estaba pegada al final (para seguir lo que llega). */
const posiciones = new Map<string, { arriba: number; alFinal: boolean }>()

/** El título de una conversación que Claude Code todavía no nombró: su primer mensaje, como hace él. */
function primerMensaje(entradas: readonly Entrada[]): string | null {
  const e = entradas.find((x) => x.tipo === 'usuario')
  if (e?.tipo !== 'usuario') return null
  const sinCitas = leerCitas(e.texto)
  const com = leerMensaje(e.texto) ?? (sinCitas.citas[0] ? leerMensaje(sinCitas.citas[0]) : null)
  const texto = com
    ? `${com.codigo}: ${com.texto}`
    : sinCitas.texto.trim() || sinCitas.citas.join(' ') || e.texto
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

const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

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
    <div className="recuadro aviso pedido">
      <Icono nombre="espera" />
      <div className="cuerpo-recuadro">
        <strong>Dejó {n === 1 ? '1 pregunta' : `${n} preguntas`}</strong>
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
        <div className="acciones-recuadro">
          <button
            type="button"
            className="boton secundario chico"
            onClick={() => usarEstado.getState().responderEn(ruta)}
          >
            Responder
          </button>
        </div>
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
    <div
      className={`recuadro falla-ia${conSesion ? '' : ' error'}`}
      data-tipo={conSesion ? 'resuelta' : 'sin-sesion'}
      role="alert"
    >
      <Icono nombre={conSesion ? 'check' : 'error'} />
      <div className="cuerpo-recuadro">
        <strong>{conSesion ? 'Ya tienes sesión en Claude' : 'Claude Code no tiene sesión iniciada'}</strong>
        <span>
          {entrada.enviado
            ? 'La sesión se cortó porque Claude Code perdió el inicio de sesión. '
            : 'No se envió nada. '}
          {conSesion
            ? 'Toca Reintentar para seguir.'
            : iniciando
              ? 'Termina de entrar en el navegador; si Claude pide un código, pégalo en la ventana que se abrió. Iridium lo nota solo.'
              : 'Inicia sesión con tu cuenta de Claude: se abre el navegador, como desde la extensión de VS Code.'}
        </span>
        {entrada.reintentar && <span className="nota">Lo que escribiste: «{entrada.reintentar}»</span>}
        <div className="acciones-recuadro">
          {!conSesion && (
            <button
              type="button"
              className="boton secundario chico"
              disabled={iniciando}
              onClick={iniciarSesion}
            >
              <Icono nombre={iniciando ? 'sync' : 'abrir'} gira={iniciando} />
              {iniciando ? 'Esperando el navegador…' : 'Iniciar sesión'}
            </button>
          )}
          <button
            type="button"
            className={`boton ${conSesion ? 'secundario' : 'sin-fondo'} chico`}
            disabled={reintentando || trabajando}
            onClick={() => {
              setReintentando(true)
              void window.iridium
                .seguir(ruta, {
                  ...(entrada.reintentar ? { texto: entrada.reintentar } : {}),
                  ...(entrada.adjuntos?.length ? { adjuntos: entrada.adjuntos } : {}),
                })
                .finally(() => setReintentando(false))
            }}
          >
            <Icono nombre="reintentar" />
            {reintentando ? 'Verificando…' : 'Reintentar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** F-5: se agotó el uso; dice cuándo se libera. La conversación queda para Continuar. */
function UsoAgotado({ entrada }: { entrada: Extract<Entrada, { tipo: 'uso-agotado' }> }) {
  return (
    <div className="recuadro aviso falla-ia" data-tipo="uso" role="alert">
      <Icono nombre="espera" />
      <div className="cuerpo-recuadro">
        <strong>Se agotó el uso de tu suscripción</strong>
        <span>
          {entrada.libera !== null ? `Se libera ${cuandoSera(entrada.libera)}. ` : ''}
          La conversación queda guardada: cuando se libere, toca Continuar y retoma desde aquí.
        </span>
      </div>
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
    partes.push(
      <div
        key={e.id}
        className="texto-doc conversacion nota-ia"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: lo arma markdown-it en el proceso principal, sin HTML crudo.
        dangerouslySetInnerHTML={{ __html: e.html }}
      />,
    )
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

/** El nombre de quien habla (AJ-2): el que se eligió en Ajustes o «Tú» e «IA». */
function usarNombre(ia: boolean): string {
  const nombre = usarEstado((s) => (ia ? s.preferencias.nombreIa : s.preferencias.nombreUsuario))
  return nombre || (ia ? 'IA' : 'Tú')
}

/** El nombre de la IA arriba de lo suyo; largo, se corta y se ve entero al pasar. */
function Quien({ ia = false }: { ia?: boolean }) {
  const texto = usarNombre(ia)
  return (
    <span className="nombre" title={texto}>
      {texto}
    </span>
  )
}

/**
 * Un turno de la IA (D-061): arriba el proceso (hasta la última herramienta) y después la respuesta, en letra de
 * lectura. Los avisos, errores y preguntas nunca quedan plegados. Mientras trabaja, todo es proceso.
 * Si la IA respondió y después siguió (un hook de fin de turno le pidió algo más), cada respuesta cierra su tramo, con
 * su proceso plegado arriba (R-72).
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
  const tramos = tramosDe(turno.entradas)
  return (
    <div className="turno ia mensaje-ia">
      {/* Sin ruido (D-108): la hora, al pasar el mouse. */}
      <div
        className="quien"
        title={cuando?.tipo === 'ia' && cuando.cuando !== null ? hora(cuando.cuando) : undefined}
      >
        <Quien ia />
      </div>
      {tramos.map((entradas, i) => (
        <Tramo
          key={entradas[0]?.id ?? i}
          entradas={entradas}
          ruta={ruta}
          enCurso={enCurso && i === tramos.length - 1}
        />
      ))}
    </div>
  )
}

/** Corta el turno después de cada respuesta final (`final`) que tiene herramientas más adelante (R-72). */
function tramosDe(entradas: EntradaIa[]): EntradaIa[][] {
  const tramos: EntradaIa[][] = []
  let desde = 0
  const ultimaHerramienta = entradas.findLastIndex((e) => e.tipo === 'herramienta')
  for (let i = 0; i < ultimaHerramienta; i++) {
    const e = entradas[i]
    const siguiente = entradas[i + 1]
    if (e?.tipo === 'ia' && e.final && !(siguiente?.tipo === 'ia' && siguiente.final)) {
      tramos.push(entradas.slice(desde, i + 1))
      desde = i + 1
    }
  }
  tramos.push(entradas.slice(desde))
  return tramos
}

function Tramo({ entradas, ruta, enCurso }: { entradas: EntradaIa[]; ruta: string; enCurso: boolean }) {
  const ultima = entradas.findLastIndex((e) => e.tipo === 'herramienta')
  const corte = enCurso ? entradas.length : ultima + 1
  const pasos: Paso[] = []
  const sueltas: Exclude<EntradaIa, Paso>[] = []
  for (const e of entradas.slice(0, corte)) {
    if (e.tipo === 'ia' || e.tipo === 'herramienta') pasos.push(e)
    else sueltas.push(e)
  }
  const respuesta = entradas.slice(corte)
  const hayRespuesta = respuesta.some((e) => e.tipo === 'ia')
  return (
    <>
      {pasos.length > 0 && <Proceso pasos={pasos} plegable={!enCurso && hayRespuesta} />}
      {sueltas.map((e) => (
        <Final key={e.id} e={e} ruta={ruta} />
      ))}
      {respuesta.map((e) =>
        e.tipo === 'ia' ? (
          <div
            key={e.id}
            className="texto-doc conversacion respuesta-ia"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: lo arma markdown-it en el proceso principal, sin HTML crudo.
            dangerouslySetInnerHTML={{ __html: e.html }}
          />
        ) : e.tipo === 'herramienta' ? null : (
          <Final key={e.id} e={e} ruta={ruta} />
        ),
      )}
    </>
  )
}

/** Un comentario de la Revisión en el hilo: una tarjeta que lo abre (W-R4). */
function TarjetaComentario({ ruta, com }: { ruta: string; com: MensajeComentario }) {
  const abrirComentario = usarEstado((s) => s.abrirComentario)
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
 * Lo que escribió el usuario. Un comentario de la Revisión, enviado desde la extensión o citado desde la sección
 * (R-101), se ve como tarjeta; lo demás citado, como cita arriba de lo escrito.
 */
function MensajePropio({
  ruta,
  texto,
  quien,
  adjuntos,
}: {
  ruta: string
  texto: string
  quien: string
  adjuntos?: AdjuntoVista[] | undefined
}) {
  const com = leerMensaje(texto)
  if (com) return <TarjetaComentario ruta={ruta} com={com} />
  // Lo que fue con el mensaje (PA-5): las fichas arriba del texto, sin ✕.
  const fichas = adjuntos?.length ? <FichasEnviadas ruta={ruta} adjuntos={adjuntos} /> : null
  // Un comando (PA-5): el comando en la letra de los códigos, lo que se le escribió y, después, lo citado.
  if (comandoDe(texto)) {
    const [linea = '', ...resto] = texto.trim().split(/\n{2,}/)
    const cmd = comandoDe(linea)
    const { citas: citadas, texto: escrito } = leerCitas(resto.join('\n\n'))
    return (
      <div className="mensaje-yo con-citas" title={quien}>
        {fichas}
        <p>
          <code className="cmd">/{cmd?.nombre}</code>
          {cmd?.resto && ` ${cmd.resto}`}
        </p>
        {citadas.map((c, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: las citas de un mensaje enviado no cambian de orden.
          <p key={i} className="citado-en-mensaje">
            {c}
          </p>
        ))}
        {escrito.trim() && <p>{escrito}</p>}
      </div>
    )
  }
  // Lo citado al enviar (Q-182) se ve como cita, arriba de lo escrito.
  const { citas, texto: escrito } = leerCitas(texto)
  if (!citas.length)
    return fichas ? (
      <div className="mensaje-yo con-citas" title={quien}>
        {fichas}
        {texto.trim() && <p>{texto}</p>}
      </div>
    ) : (
      <p className="mensaje-yo" title={quien}>
        {texto}
      </p>
    )
  const comentarios = citas.map((c) => leerMensaje(c))
  const otras = citas.filter((_, i) => !comentarios[i])
  return (
    <>
      {comentarios.map((c) => c && <TarjetaComentario key={c.codigo} ruta={ruta} com={c} />)}
      {otras.length > 0 || fichas ? (
        <div className="mensaje-yo con-citas" title={quien}>
          {fichas}
          {otras.map((c, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: las citas de un mensaje enviado no cambian de orden.
            <p key={i} className="citado-en-mensaje">
              {c}
            </p>
          ))}
          {escrito.trim() && <p>{escrito}</p>}
        </div>
      ) : (
        escrito.trim() && (
          <p className="mensaje-yo" title={quien}>
            {escrito}
          </p>
        )
      )}
    </>
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
  // Lo propio va sin nombre arriba, como en las maquetas: el nombre (AJ-2) y la hora, al pasar el mouse.
  const yo = usarNombre(false)
  return (
    <>
      {turnos.map((t, i) =>
        t.quien === 'usuario' ? (
          <div key={t.clave} className="turno usuario">
            <MensajePropio
              ruta={ruta}
              texto={t.entrada.texto}
              adjuntos={t.entrada.adjuntos}
              quien={t.entrada.cuando !== null ? `${yo} · ${hora(t.entrada.cuando)}` : yo}
            />
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
          <button type="button" className="boton secundario" onClick={() => void verAnteriores()}>
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
          {ficha.reintento.intento} de {ficha.reintento.maximo}. Puedes esperar o detenerla.
        </div>
      )}
      {!trabajando && ficha?.fondo && ficha.fondo.length > 0 && (
        // Terminó el turno pero dejó algo corriendo (T-65): cuando termine, sigue sola.
        <div className="ahora esperando" role="status">
          <Icono nombre="sync" gira />
          Esperando lo que dejó de fondo · {ficha.fondo.join(' · ')}
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
      claseBoton="boton solo-icono"
      enLista
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
          <h4 className="titulo-menu">Conversaciones{nombre ? ` de ${nombre}` : ''}</h4>
          {!lista && <p className="nota">Buscando…</p>}
          {lista?.length === 0 && <p className="nota">Este proyecto todavía no tiene conversaciones.</p>}
          {lista?.map((c) => (
            <button
              key={c.id}
              type="button"
              role="menuitem"
              className={c.id === actual ? 'actual' : undefined}
              aria-current={c.id === actual}
              onClick={() => {
                cerrar()
                if (c.id !== actual) void elegir(c.id)
              }}
            >
              <span className="principal-fila">
                <span className="titulo-fila" title={c.titulo}>
                  {c.titulo}
                </span>
                <span className="detalle">
                  {c.origen === 'vscode' ? 'VS Code' : 'Iridium'}
                  {c.id === actual && ' · abierta'}
                </span>
              </span>
              <time className="meta">{fechaCorta(c.modificada)}</time>
            </button>
          ))}
        </>
      )}
    </Menu>
  )
}

/** De qué se habla en el chat (SK-3): una skill. */
export interface Sobre {
  nombre: string
  quitar: () => void
}

/** Sin citas: siempre el mismo arreglo, para que el estado no cambie de balde. */
const SIN_CITAS: Cita[] = []
/** Sin adjuntos: siempre el mismo arreglo. */
const SIN_ADJUNTOS: AdjuntoPedido[] = []

/** El ícono de la ficha de una cita, por lo que cita (Revisar, Idea, Comentario, Frente). */
/**
 * Apagar al terminar (T-134, D-195): con el ajuste prendido, un botón al lado de Enviar. Armado, Iridium apaga la PC
 * cuando ninguna IA trabaja ni espera lo de fondo, sin pasar por la IA ni gastar uso; tocarlo de nuevo lo desarma.
 */
function BotonApagar() {
  const visible = usarEstado((s) => s.preferencias.botonApagar)
  const armado = usarEstado((s) => s.apagar.armado)
  if (!visible && !armado) return null
  const poner = (si: boolean) => void window.iridium.ponerApagar(si)
  if (armado)
    return (
      <button
        type="button"
        className="boton secundario chico apagar"
        aria-pressed="true"
        title="Iridium apaga la PC cuando la IA termine. Tocalo para que no la apague."
        onClick={() => poner(false)}
      >
        <Icono nombre="apagar" />
        Se apaga al terminar
      </button>
    )
  return (
    <button
      type="button"
      className="boton solo-icono chico apagar"
      aria-pressed="false"
      aria-label="Apagar la PC al terminar"
      title="Apagar la PC cuando la IA termine (no gasta uso)"
      onClick={() => poner(true)}
    >
      <Icono nombre="apagar" />
    </button>
  )
}

function iconoDeCita(tipo: string): 'revision' | 'idea' | 'comentar' | 'mapa' | 'ficha' {
  return tipo === 'Revisar'
    ? 'revision'
    : tipo === 'Idea'
      ? 'idea'
      : tipo === 'Comentario'
        ? 'comentar'
        : tipo === 'Frente'
          ? 'mapa'
          : 'ficha'
}

/** Lo que va al principio del mensaje: `Sobre la skill X`. */
function sobreQue(s: Sobre): string {
  return `Sobre la skill ${s.nombre}`
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
  const citas = usarEstado((s) => s.citas[ruta]) ?? SIN_CITAS
  const quitarCita = usarEstado((s) => s.quitarCita)
  // Los adjuntos sin mandar (PA-2, PA-3): se guardan con lo escrito y no se pierden al cambiar de proyecto ni al cerrar.
  const adjuntos = usarEstado((s) => s.adjuntos[ruta]) ?? SIN_ADJUNTOS
  const adjuntar = usarEstado((s) => s.adjuntar)
  /** Las fotos que no se pueden mandar (borde rojo): el mensaje no sale hasta sacarlas. */
  const [noVan, setNoVan] = useState<ReadonlySet<string>>(new Set())
  const alNoVa = useCallback(
    (r: string, noVa: boolean) =>
      setNoVan((antes) => {
        if (antes.has(r) === noVa) return antes
        const despues = new Set(antes)
        if (noVa) despues.add(r)
        else despues.delete(r)
        return despues
      }),
    [],
  )
  /** Una línea arriba del cuadro sobre los adjuntos (los que no entraron, la foto pegada sin fotos en el motor). */
  const [lineaAdjuntos, setLineaAdjuntos] = useState<string | null>(null)
  const [enVisor, setEnVisor] = useState<EnVisor | null>(null)
  const [soltando, setSoltando] = useState(false)
  // La línea de los adjuntos se va al cambiar lo escrito, como la de un comando escondido.
  // biome-ignore lint/correctness/useExhaustiveDependencies: solo cuando cambia lo escrito.
  useEffect(() => setLineaAdjuntos(null), [texto])
  // Antes de mandar, el proyecto se pone al día con GitHub (D-172): lo escrito queda en el cuadro con esta línea y sale
  // solo al terminar. Si no se pudo, se manda igual y la línea dice por qué, hasta que se escriba otra cosa.
  const [lineaGit, setLineaGit] = useState<'esperando' | string | null>(null)
  useEffect(() => {
    if (texto !== '') setLineaGit((l) => (l === 'esperando' ? l : null))
  }, [texto])
  // El cuadro crece con lo que se escribe (hasta un tope, después se desplaza) y vuelve a una línea al enviar.
  const caja = useRef<HTMLTextAreaElement>(null)
  useAltoDelTexto(caja, texto, 0)
  // Los comandos con «/» (PA-1): la lista va mientras el cursor está en el comando del principio; Esc la cierra hasta
  // que cambie lo escrito. Un comando escondido escrito a mano no se manda y dice dónde está eso (D-168).
  const capacidades = useCapacidades()
  const [cursor, setCursor] = useState<number | null>(null)
  const [cerradaCon, setCerradaCon] = useState<string | null>(null)
  const escondido = capacidades ? escondidoDe(texto, capacidades.escondidos) : null
  const consulta =
    capacidades?.comandos && !escondido && cerradaCon !== texto
      ? consultaDe(texto, cursor ?? texto.length)
      : null
  // Un comando con adjuntos: la lista dice si es de Claude Code, que no los lleva (D-169 › 7).
  const comandoEscrito = capacidades?.comandos ? comandoDe(texto) : null
  const estadoComandos = useListaComandos(
    ruta,
    consulta !== null || (comandoEscrito !== null && adjuntos.length > 0),
  )
  const comandoSinAdjuntos =
    comandoEscrito && adjuntos.length > 0 && estadoComandos.tipo === 'lista'
      ? (estadoComandos.comandos.find(
          (c) =>
            c.origen === 'motor' &&
            [c.nombre, ...c.otrosNombres].some(
              (n) => n.toLowerCase() === comandoEscrito.nombre.toLowerCase(),
            ),
        ) ?? null)
      : null
  const grupos = useMemo(
    () =>
      estadoComandos.tipo === 'lista'
        ? filtrarComandos(estadoComandos.comandos, consulta ?? '', estadoComandos.recientes)
        : [],
    [estadoComandos, consulta],
  )
  const opciones = useMemo(() => grupos.flatMap((g) => g.comandos), [grupos])
  const [marcado, setMarcado] = useState<string | null>(null)
  // Al abrir o al cambiar lo que se busca, la primera marcada; si la lista se puso al día, la marcada sigue si está.
  const marcada = opciones.some((c) => c.nombre === marcado) ? marcado : (opciones[0]?.nombre ?? null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: lo que se busca cambió: la marca vuelve a la primera.
  useEffect(() => setMarcado(null), [consulta])
  const listaAbierta = consulta !== null
  const trabajando = ficha?.estado === 'trabajando'
  const esperandoFondo = !trabajando && (ficha?.fondo?.length ?? 0) > 0
  const enBlanco = pidioEnBlanco && !trabajando

  // Otra sección dejó un pedido para la IA (Pedírselo a la IA, H-R7): queda escrito, sin enviar.
  useEffect(() => {
    if (paraElCampo === undefined) return
    escribir(ruta, paraElCampo)
    soltarCampo(ruta)
    requestAnimationFrame(() => caja.current?.focus())
  }, [paraElCampo, soltarCampo, escribir, ruta])

  // Otra sección citó algo (Revisar con la IA, Hablar de esta idea; Q-182), aunque ya estuviera: el cursor va al campo
  // para escribir. Al quitar una cita, no.
  const antes = useRef(citas)
  useEffect(() => {
    if (citas !== antes.current && citas.length > 0 && citas.length >= antes.current.length)
      requestAnimationFrame(() => caja.current?.focus())
    antes.current = citas
  }, [citas])

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

  const seguir = async (pedido: { texto?: string; nueva?: boolean; adjuntos?: AdjuntoPedido[] }) => {
    setEnviando(true)
    setLineaGit(null)
    // La línea sale solo si la espera se nota: lo ya mirado contesta enseguida.
    const reloj = setTimeout(() => setLineaGit('esperando'), 200)
    try {
      const alDia = await window.iridium.ponerseAlDia(ruta).catch(() => null)
      clearTimeout(reloj)
      setLineaGit(alDia?.aviso ? `Se mandó sin estar al día con GitHub: ${alDia.aviso}` : null)
      await window.iridium.seguir(ruta, enBlanco ? { ...pedido, nueva: true } : pedido)
      setTexto('')
      quitarCita(ruta)
      // Al mandar, las fichas se van con el mensaje (la foto pegada queda en los datos hasta el próximo arranque).
      if (pedido.adjuntos?.length) adjuntar(ruta, [])
      setLineaAdjuntos(null)
      if (enBlanco) cambiarVista(ruta, { enBlanco: false })
    } finally {
      clearTimeout(reloj)
      setLineaGit((l) => (l === 'esperando' ? null : l))
      setEnviando(false)
    }
  }
  // Nueva deja el cursor en el campo para escribir de una (R-52).
  const nueva = () => {
    cambiarVista(ruta, { enBlanco: true })
    requestAnimationFrame(() => caja.current?.focus())
  }
  // Las citas van al principio del mensaje (Q-182); sin nada escrito, salen solas.
  // Se puede mandar solo con adjuntos, sin texto (PA-2).
  const sinNada = texto.trim() === '' && citas.length === 0 && adjuntos.length === 0
  /** Lo que frena el envío además de un escondido: una foto que no va o un comando de Claude Code con adjuntos. */
  const frenado = noVan.size > 0 || comandoSinAdjuntos !== null
  // Con un comando, el comando va primero y lo citado y «Sobre la skill…» después (D-169 › 7).
  const mensaje = () =>
    comandoPrimero(texto, mensajeConCitas(citas, sobre ? sobreQue(sobre) : ''), () =>
      mensajeConCitas(citas, sobre && texto.trim() ? `${sobreQue(sobre)}: ${texto}` : texto),
    )
  /** El pedido con lo escrito y los adjuntos; sin nada, Seguí. */
  const pedido = () => (sinNada ? {} : { texto: mensaje(), ...(adjuntos.length ? { adjuntos } : {}) })
  const enviar = () => {
    if (sinNada || enviando || escondido || frenado) return
    void seguir(pedido())
  }
  /** Suma adjuntos a los del cuadro: sin fotos en el motor, una foto va como archivo (PA-6); hasta 20. */
  const sumar = (nuevos: AdjuntoPedido[]) => {
    if (nuevos.length === 0) return
    const tipados = capacidades?.fotos
      ? nuevos
      : nuevos.map((a) => (a.tipo === 'foto' ? { tipo: 'archivo' as const, ruta: a.ruta } : a))
    const r = sumarAdjuntos(usarEstado.getState().adjuntos[ruta] ?? [], tipados)
    adjuntar(ruta, r.adjuntos)
    setLineaAdjuntos(
      r.sobran > 0
        ? `Entran hasta ${MAX_ADJUNTOS} adjuntos por mensaje: ${r.sobran === 1 ? 'uno quedó' : `${r.sobran} quedaron`} afuera.`
        : null,
    )
    requestAnimationFrame(() => caja.current?.focus())
  }
  const quitarAdjunto = (i: number) => {
    const quitado = adjuntos[i]
    adjuntar(
      ruta,
      adjuntos.filter((_, j) => j !== i),
    )
    if (quitado && quitado.tipo !== 'pegado') alNoVa(quitado.ruta, false)
    setLineaAdjuntos(null)
  }
  /** El + › Agregar archivos o fotos y Ctrl+U: el selector de Windows, con varios a la vez (PA-2). */
  const elegirAdjuntos = async () => {
    const rutas = await window.iridium.elegirAdjuntos().catch(() => [])
    sumar(rutas.map(adjuntoDeRuta))
  }
  /**
   * El último texto largo pegado como ficha, mientras no se escribió otra cosa: `Ctrl+Z` lo vuelve texto en el cuadro,
   * donde se pegó (PA-4). `antes`, lo escrito en ese momento; `desde` y `hasta`, lo que estaba elegido.
   */
  const ultimoPegado = useRef<{ pegado: AdjuntoPedido; antes: string; desde: number; hasta: number } | null>(
    null,
  )
  const deshacerPegado = (): boolean => {
    const u = ultimoPegado.current
    ultimoPegado.current = null
    const lista = usarEstado.getState().adjuntos[ruta] ?? []
    const i = u ? lista.lastIndexOf(u.pegado) : -1
    if (!u || i === -1 || texto !== u.antes || u.pegado.tipo !== 'pegado') return false
    const nuevo = u.antes.slice(0, u.desde) + u.pegado.texto + u.antes.slice(u.hasta)
    // Más largo de lo que entra en el cuadro: queda como ficha, que se manda igual.
    if (nuevo.length > LARGO_ESCRITO) {
      setLineaAdjuntos('Es demasiado largo para el cuadro: queda como texto pegado.')
      return true
    }
    adjuntar(
      ruta,
      lista.filter((_, j) => j !== i),
    )
    setTexto(nuevo)
    const fin = u.desde + u.pegado.texto.length
    requestAnimationFrame(() => {
      caja.current?.setSelectionRange(fin, fin)
      setCursor(fin)
    })
    return true
  }
  /**
   * Ctrl+V: un texto largo (más de 40 líneas o 2.000 caracteres) es una ficha «Texto pegado» (PA-4); una imagen sin
   * texto, una ficha de foto (PA-3).
   */
  const alPegar = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const datos = e.clipboardData
    const pegadoTexto = datos.getData('text/plain')
    if (pegadoTexto && esPegadoLargo(pegadoTexto)) {
      e.preventDefault()
      if (pegadoTexto.length > PEGADO_MAXIMO) {
        setLineaAdjuntos(
          'Pasa de 1 MB y no entra como texto pegado: guárdalo en un archivo y súmalo con el +.',
        )
        return
      }
      const pegado: AdjuntoPedido = { tipo: 'pegado', texto: pegadoTexto.replace(/\r\n/g, '\n') }
      const c = e.currentTarget
      sumar([pegado])
      if ((usarEstado.getState().adjuntos[ruta] ?? []).includes(pegado))
        ultimoPegado.current = { pegado, antes: texto, desde: c.selectionStart, hasta: c.selectionEnd }
      return
    }
    if (pegadoTexto) return
    const imagen = [...datos.files].find((f) => f.type.startsWith('image/'))
    if (!imagen) return
    e.preventDefault()
    if (!capacidades?.fotos) {
      setLineaAdjuntos('Este motor no recibe fotos pegadas.')
      return
    }
    void imagen
      .arrayBuffer()
      .then((b) => window.iridium.guardarPegada(new Uint8Array(b)))
      .then((r) =>
        r ? sumar([{ tipo: 'foto', ruta: r }]) : setLineaAdjuntos('Eso no es una imagen que se pueda pegar.'),
      )
      .catch(() => setLineaAdjuntos('No se pudo pegar la imagen.'))
  }
  // Arrastrar archivos sobre la conversación (PA-2): el borde punteado y «Suelta para adjuntar»; soltar los suma. Se
  // escucha en el panel entero (el `aside` que la contiene), no solo en el cuadro.
  const cabecera = useRef<HTMLDivElement>(null)
  const sumarSueltos = useRef(sumar)
  sumarSueltos.current = sumar
  useEffect(() => {
    const panel = cabecera.current?.parentElement
    if (!panel) return
    const conArchivos = (e: DragEvent) => e.dataTransfer?.types.includes('Files') ?? false
    const encima = (e: DragEvent) => {
      if (!conArchivos(e)) return
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
      setSoltando(true)
    }
    const sale = (e: DragEvent) => {
      if (!(e.relatedTarget instanceof Node && panel.contains(e.relatedTarget))) setSoltando(false)
    }
    const suelta = (e: DragEvent) => {
      if (!conArchivos(e)) return
      e.preventDefault()
      setSoltando(false)
      const rutas = [...(e.dataTransfer?.files ?? [])]
        .map((f) => window.iridium.rutaDeArchivo(f))
        .filter((r) => r !== '')
      sumarSueltos.current(rutas.map(adjuntoDeRuta))
    }
    panel.addEventListener('dragenter', encima)
    panel.addEventListener('dragover', encima)
    panel.addEventListener('dragleave', sale)
    panel.addEventListener('drop', suelta)
    return () => {
      panel.removeEventListener('dragenter', encima)
      panel.removeEventListener('dragover', encima)
      panel.removeEventListener('dragleave', sale)
      panel.removeEventListener('drop', suelta)
    }
  }, [])
  useEffect(() => {
    cabecera.current?.parentElement?.classList.toggle('soltando', soltando)
  }, [soltando])
  /** Elegir un comando no lo manda: queda «/nombre » con el cursor para escribirle lo que pida (PA-1). */
  const elegirComando = (c: ComandoMotor) => {
    const nuevo = conComando(texto, c.nombre)
    setTexto(nuevo.texto)
    setCursor(nuevo.cursor)
    requestAnimationFrame(() => {
      caja.current?.focus()
      caja.current?.setSelectionRange(nuevo.cursor, nuevo.cursor)
    })
  }
  /** El + › Comandos: la «/» al principio y la lista abierta. */
  const abrirComandos = () => {
    const nuevo = texto.startsWith('/') ? texto : `/${texto ? ` ${texto}` : ''}`
    setTexto(nuevo)
    setCursor(1)
    setCerradaCon(null)
    requestAnimationFrame(() => {
      caja.current?.focus()
      caja.current?.setSelectionRange(1, 1)
    })
  }
  const alTeclado = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (listaAbierta && !e.nativeEvent.isComposing) {
      const i = opciones.findIndex((c) => c.nombre === marcada)
      const n = opciones.length
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && n > 0) {
        e.preventDefault()
        const j = e.key === 'ArrowDown' ? (i + 1) % n : (i - 1 + n) % n
        setMarcado(opciones[j]?.nombre ?? null)
        return
      }
      const elegida = opciones[i]
      if (((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') && elegida) {
        e.preventDefault()
        elegirComando(elegida)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setCerradaCon(texto)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      enviar()
      return
    }
    // Ctrl+Z justo después de pegar un texto largo: vuelve al cuadro como texto (PA-4).
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'z' && ultimoPegado.current) {
      if (deshacerPegado()) {
        e.preventDefault()
        return
      }
    }
    // Ctrl+U: agregar archivos o fotos (PA-2).
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      void elegirAdjuntos()
    }
  }

  const paso = p.hito?.proximoPaso
  const hayConversacion = !enBlanco && ((c?.entradas.length ?? 0) > 0 || (c?.anteriores ?? 0) > 0)

  const vacio = general ? (
    <div className="sin-conversacion mensaje-ia">
      <div className="quien">
        <Quien ia />
        {enBlanco && ' · conversación nueva'}
      </div>
      {chat === 'skills' ? (
        <p className="texto-doc conversacion">
          Pregúntame por una skill o pídeme que la cambie: elígela a la izquierda y lo que escribas va sobre
          ella. Los cambios quedan en la carpeta <code>{p.nombre}</code>, con git, y se pueden deshacer.
        </p>
      ) : (
        <p className="texto-doc conversacion">
          Cuéntame una idea que todavía no sabes dónde va, pídeme que cree un proyecto o pregúntame por varios
          a la vez. Las ideas sueltas quedan en Ideas (<code>{p.nombre}/sueltas.md</code>) hasta que decidamos
          dónde van.
        </p>
      )}
      {enBlanco && (
        <div className="acc">
          <button
            type="button"
            className="boton secundario"
            disabled={enviando}
            onClick={() => cambiarVista(ruta, { enBlanco: false })}
          >
            Volver a la anterior
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className="sin-conversacion mensaje-ia">
      <div className="quien">
        <Quien ia />
        {enBlanco && ' · conversación nueva'}
      </div>
      {simple ? (
        <p className="texto-doc conversacion">
          Esta carpeta no sigue el framework: no hay un próximo paso. Escríbeme abajo lo que quieras que haga.
        </p>
      ) : (
        <p className="texto-doc conversacion">
          Con <b>Continuar</b> voy a leer <code>docs/estado.md</code> y hacer el próximo paso
          {paso ? ':' : '.'}
        </p>
      )}
      {paso && <p className="texto-doc conversacion paso-siguiente">{paso}</p>}
      <div className="acc">
        {!simple && <span className="nota">O escríbeme abajo lo que quieras que haga.</span>}
        {enBlanco && (
          <button
            type="button"
            className="boton secundario"
            disabled={enviando}
            onClick={() => cambiarVista(ruta, { enBlanco: false })}
          >
            Volver a la anterior
          </button>
        )}
      </div>
    </div>
  )

  // Un proyecto sin conversación ya está en blanco: Nueva no haría nada, y sin él el título entra entero (Q-248).
  const sinConversacion = !enBlanco && !hayConversacion && chat !== 'skills' && !general
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
          : // Sin conversación (T-101, Q-248): un título corto; «Sin conversación todavía» quedaba cortado.
            'Nueva conversación'
  // Sin ruido (D-108): debajo del título, cuándo fue y si se empezó en VS Code o la empezó Iridium, para abrir el
  // período (AR-2) o para avanzar sola (FS-4); lo demás lo dice la conversación.
  const subtitulo =
    !enBlanco && hayConversacion && c
      ? `${mayuscula(c.modificada !== null ? cuandoFue(c.modificada) : 'hoy')}${
          c.arrancada !== null
            ? ` · la empezó Iridium a las ${hora(c.arrancada)} ${c.avance ? 'para avanzar sola' : 'para abrir el período'}`
            : c.origen === 'vscode'
              ? ' · empezada en VS Code'
              : ''
        }`
      : null

  return (
    <>
      <div ref={cabecera} className="cab-conv">
        <div className="nombre-conv">
          {titulo && <b title={titulo}>{titulo}</b>}
          {subtitulo && <span title={subtitulo}>{subtitulo}</span>}
        </div>
        <Anteriores ruta={ruta} actual={enBlanco ? null : (c?.id ?? null)} trabajando={trabajando} />
        {!sinConversacion && (
          <button
            type="button"
            className="boton sin-fondo chico"
            disabled={enviando || trabajando || enBlanco}
            title={
              general
                ? 'Abrir una conversación en blanco: empieza con lo que le escribas'
                : 'Abrir una conversación en blanco: empieza con lo que le escribas, o con Continuar'
            }
            onClick={nueva}
          >
            <Icono nombre="mas" />
            Nueva
          </button>
        )}
        {!general && !simple && (
          <button
            type="button"
            className="boton principal chico"
            disabled={enviando || trabajando || frenado}
            title={
              trabajando
                ? 'La IA está trabajando'
                : hayConversacion
                  ? 'Retomar esta conversación: lee docs/estado.md y sigue el próximo paso'
                  : 'La IA lee docs/estado.md y hace el próximo paso'
            }
            onClick={() => void seguir(pedido())}
          >
            <Icono nombre="play" />
            Continuar
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
        <div className="recuadro aviso retomar contexto-alto" role="note">
          <Icono nombre="espera" />
          <span className="cuerpo-recuadro">
            Esta conversación lleva {pc(c.contexto?.porcentaje ?? 0)} del contexto: la IA empieza a resumir y
            olvidar detalles. Conviene seguir en una <b>Nueva</b>; el estado del proyecto queda en sus
            documentos.
          </span>
          <button type="button" className="boton sin-fondo chico" onClick={nueva}>
            Nueva
          </button>
        </div>
      )}

      {c && hayConversacion && !trabajando && c.usadaAfuera !== null && (
        <div className="recuadro aviso retomar usada-afuera" role="note">
          <Icono nombre="espera" />
          <span className="cuerpo-recuadro">
            Esta conversación se usó fuera de Iridium {cuandoFue(c.usadaAfuera)}: puede estar abierta en VS
            Code. Si la sigues aquí, las dos escriben en la misma; con <b>Nueva</b> no se pisan.
          </span>
        </div>
      )}

      {/* Una sola línea alrededor (la pieza de las maquetas): lo escrito arriba, el pie abajo. */}
      <div className="compositor">
        {listaAbierta && (
          <ListaComandos
            estado={estadoComandos}
            grupos={grupos}
            consulta={consulta ?? ''}
            marcado={marcada}
            alElegir={elegirComando}
            alMarcar={setMarcado}
          />
        )}
        {escondido && (
          <LineaEscondido
            nombre={escondido.nombre}
            pisa={escondido.pisa}
            nueva={
              enviando || trabajando
                ? null
                : () => {
                    setTexto('')
                    nueva()
                  }
            }
          />
        )}
        {comandoSinAdjuntos && (
          <div className="linea-cmd" role="note">
            <Icono nombre="info" />
            <span>
              <code>/{comandoSinAdjuntos.nombre}</code>: los comandos de Claude Code no llevan adjuntos.
              Sácalos o mándalos en otro mensaje.
            </span>
          </div>
        )}
        {lineaGit === 'esperando' ? (
          <div className="linea-cmd" role="status">
            <Icono nombre="sync" gira />
            <span>Poniéndose al día con GitHub…</span>
          </div>
        ) : (
          lineaGit && (
            <div className="linea-cmd" role="note">
              <Icono nombre="info" />
              <span>{lineaGit}</span>
            </div>
          )
        )}
        {lineaAdjuntos && (
          <div className="linea-cmd" role="note">
            <Icono nombre="info" />
            <span>{lineaAdjuntos}</span>
          </div>
        )}
        {(sobre || citas.length > 0 || adjuntos.length > 0) && (
          <FichasCompositor
            adjuntos={adjuntos}
            quitar={quitarAdjunto}
            ver={setEnVisor}
            alNoVa={alNoVa}
            antes={
              <>
                {sobre && (
                  <FichaCita
                    icono="skills"
                    clase="sobre-skill"
                    titulo={`El mensaje sale con «${sobreQue(sobre)}:» al principio`}
                    quitar={sobre.quitar}
                    textoQuitar="Que el mensaje no sea sobre esa skill"
                  >
                    Sobre la skill <b>{sobre.nombre}</b>
                  </FichaCita>
                )}
                {citas.map((c) => (
                  <FichaCita
                    key={c.clave}
                    icono={iconoDeCita(c.tipo)}
                    clase="citado"
                    titulo={c.texto}
                    quitar={() => quitarCita(ruta, c.clave)}
                    textoQuitar={`Quitar la cita ${c.nombre}`}
                  >
                    {c.tipo} <b>{c.nombre}</b>
                  </FichaCita>
                ))}
              </>
            }
          />
        )}
        <textarea
          ref={caja}
          placeholder={trabajando ? 'Suma algo a lo que está haciendo…' : 'Escribe a la IA…'}
          aria-label="Mensaje para la IA"
          value={texto}
          onChange={(e) => {
            ultimoPegado.current = null
            setTexto(e.target.value)
            setCursor(e.target.selectionStart)
          }}
          onSelect={(e) => setCursor(e.currentTarget.selectionStart)}
          onKeyDown={alTeclado}
          onPaste={alPegar}
          {...(listaAbierta
            ? {
                'aria-controls': 'lista-comandos',
                ...(marcada ? { 'aria-activedescendant': idOpcion(marcada) } : {}),
              }
            : {})}
        />
        {/* El pie se parte en dos renglones si no entra: Detener nunca tapa el medidor del contexto. */}
        <div className="pie-comp">
          {capacidades && (
            <Menu
              boton={<Icono nombre="mas" />}
              titulo={
                capacidades.comandos
                  ? `Agregar ${capacidades.fotos ? 'archivos, fotos' : 'archivos'} o comandos`
                  : `Agregar ${capacidades.fotos ? 'archivos o fotos' : 'archivos'}`
              }
              claseBoton="boton solo-icono chico"
              clase="del-compositor"
              claseLista="arriba"
            >
              {(cerrar) => (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      cerrar()
                      void elegirAdjuntos()
                    }}
                  >
                    <Icono nombre="clip" />
                    {capacidades.fotos ? 'Agregar archivos o fotos' : 'Agregar archivos'}
                    <span className="atajo">Ctrl+U</span>
                  </button>
                  {capacidades.comandos && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        cerrar()
                        abrirComandos()
                      }}
                    >
                      <span className="barra-cmd">/</span>
                      Comandos
                      <span className="atajo">/</span>
                    </button>
                  )}
                </>
              )}
            </Menu>
          )}
          <ModeloYEsfuerzo ruta={ruta} />
          {hayConversacion && c?.contexto && <MedidorContexto contexto={c.contexto} />}
          <div className="enviar">
            <BotonApagar />
            {(trabajando || esperandoFondo) && (
              <button
                type="button"
                className="boton secundario chico detener"
                title={
                  trabajando
                    ? 'Detener a la IA en el acto (se retoma con Continuar)'
                    : 'Cortar lo que dejó de fondo (se retoma con Continuar)'
                }
                onClick={() => void window.iridium.detener(ruta)}
              >
                <Icono nombre="cuadro" />
                Detener
              </button>
            )}
            <button
              type="button"
              className="boton solo-icono chico"
              title="Enviar (Enter; Shift+Enter, salto de línea)"
              aria-label="Enviar"
              disabled={sinNada || enviando || escondido !== null || frenado}
              onClick={enviar}
            >
              <Icono nombre="flecha" />
            </button>
          </div>
        </div>
      </div>
      <div className="soltar" aria-hidden="true">
        Suelta para adjuntar
      </div>
      {enVisor && <Visor que={enVisor} cerrar={() => setEnVisor(null)} />}
    </>
  )
}
