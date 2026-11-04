// Un pendiente de W-5: código, tipo y si frena; la pregunta; y el formulario para responder (H-10: opciones, Otro y
// nota; H-11 y W-6: un punto por casilla con su nota). El contexto y lo que cita, con su texto, van plegados en
// «Mostrar detalles» (Q-62): lo que se lee siempre es la pregunta y lo que hay que marcar. Las respondidas sin
// procesar muestran lo elegido y se pueden corregir hasta que la IA las procesa.
import { type MouseEvent, useLayoutEffect, useRef, useState } from 'react'
import type { CitaVista, PendienteVista } from '../../../compartido/puente'
import { type Borrador, OTRO, puedeEnviar, tieneAlgo } from '../../../compartido/respuestas'
import { claveBorrador, usarEstado } from '../../estado'
import { useAltoDelTexto } from '../../ui/altoDelTexto'
import { guardarLuego, noGuardar } from '../../ui/guardarLuego'
import { Icono } from '../../ui/Icono'
import type { Destino } from './PanelDocumento'

/** Un campo de una línea que crece hacia abajo con lo que se escribe, para leerlo entero. */
function CampoCrece({
  valor,
  alCambiar,
  ...resto
}: {
  valor: string
  alCambiar: (v: string) => void
  id?: string
  placeholder?: string
  'aria-label'?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useAltoDelTexto(ref, valor)
  return (
    <textarea
      ref={ref}
      rows={1}
      className="campo crece"
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
      {...resto}
    />
  )
}

/** Un enlace del HTML de los documentos: a otro documento abre el panel; a internet, el navegador. */
export function alTocarEnlace(e: MouseEvent, abrirDoc: (d: Destino) => void): void {
  const a = (e.target as HTMLElement).closest('a')
  if (!a) return
  e.preventDefault()
  const doc = a.getAttribute('data-doc')
  const externo = a.getAttribute('data-externo')
  if (doc) abrirDoc({ documento: doc, ancla: a.getAttribute('data-ancla') ?? '' })
  else if (externo) window.open(externo)
}

/** Un bloque que empieza plegado si es largo, con «Mostrar todo». */
function Plegable({ html, clase }: { html: string; clase: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [largo, setLargo] = useState(false)
  const [abierto, setAbierto] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (el && !abierto) setLargo(el.scrollHeight > el.clientHeight + 2)
  }, [abierto])
  return (
    <>
      <div
        ref={ref}
        className={abierto ? clase : largo ? `${clase} plegada larga` : `${clase} plegada`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {(largo || abierto) && (
        <button
          type="button"
          className="enlace plegar"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          {abierto ? 'Plegar' : 'Mostrar todo'}
        </button>
      )}
    </>
  )
}

function Cita({ c, abrirDoc }: { c: CitaVista; abrirDoc: (d: Destino) => void }) {
  if (c.tipo === 'falta')
    return (
      <div className="cita falta">
        <div className="cab">
          <span className="ref">{c.etiqueta}</span>
        </div>
        <p>
          <Icono nombre="busca" />
          No se encontró la sección: puede que haya cambiado de nombre.
        </p>
      </div>
    )
  const ver = (
    <button
      type="button"
      className="enlace"
      onClick={() => abrirDoc({ documento: c.ruta, ancla: c.tipo === 'seccion' ? c.ancla : '' })}
    >
      Ver entero
    </button>
  )
  if (c.tipo === 'documento')
    return (
      <div className="cita">
        <div className="cab">
          <span className="ref">{c.etiqueta}</span>
          {ver}
        </div>
      </div>
    )
  // El nombre de la sección, sin el código que ya dice la etiqueta.
  const nombre = c.titulo.replace(/^[A-Z]{1,4}-?\d{1,4}\s*[—–:-]\s*/, '')
  return (
    <div className="cita">
      <div className="cab">
        <span className="ref">{c.etiqueta}</span>
        {nombre !== '' && !c.etiqueta.endsWith(c.titulo) && <span className="nombre">{nombre}</span>}
        {ver}
      </div>
      {c.html !== '' && <Plegable html={c.html} clase="doc-texto" />}
    </div>
  )
}

function Formulario({
  p,
  b,
  cambiar,
}: {
  p: PendienteVista
  b: Borrador
  cambiar: (cambio: Partial<Borrador>) => void
}) {
  const id = p.codigo.toLowerCase()
  const conOpciones = p.opciones.length > 0
  const conPuntos = p.puntos.length > 0
  return (
    <div className="responder">
      {conPuntos && (
        <div className="puntos">
          {p.puntos.map((punto, i) => (
            <div key={punto} className="punto">
              <input
                type="checkbox"
                aria-labelledby={`${id}-p${i}`}
                checked={b.marcas[i] ?? false}
                onChange={(e) =>
                  cambiar({ marcas: b.marcas.map((m, j) => (j === i ? e.target.checked : m)) })
                }
              />
              <span
                id={`${id}-p${i}`}
                className="texto-punto"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
                dangerouslySetInnerHTML={{ __html: p.puntosHtml[i] ?? '' }}
              />
              <CampoCrece
                valor={b.notas[i] ?? ''}
                placeholder="Nota, si falló"
                aria-label={`Nota de: ${punto}`}
                alCambiar={(v) => cambiar({ notas: b.notas.map((n, j) => (j === i ? v : n)) })}
              />
            </div>
          ))}
        </div>
      )}
      {conOpciones && (
        <div className="opciones" role="radiogroup" aria-label={`Opciones de ${p.codigo}`}>
          {p.opciones.map((o) => (
            <label key={o.letra} className="opcion">
              <input
                type="radio"
                name={id}
                value={o.letra}
                checked={b.opcion === o.letra}
                onChange={() => cambiar({ opcion: o.letra })}
              />
              <span className="l">{o.letra})</span>
              <span className="t">{o.texto}</span>
              {o.recomendada && (
                <span className="rec">
                  <Icono nombre="estrella" />
                  recomendada
                </span>
              )}
            </label>
          ))}
          <label className="opcion otro">
            <input
              type="radio"
              name={id}
              value={OTRO}
              checked={b.opcion === OTRO}
              onChange={() => cambiar({ opcion: OTRO })}
            />
            <span className="l">Otro</span>
            <CampoCrece
              valor={b.otro}
              placeholder="Contalo con tus palabras"
              aria-label="Otra respuesta"
              alCambiar={(v) => cambiar({ otro: v, opcion: OTRO })}
            />
          </label>
        </div>
      )}
      {conOpciones || conPuntos ? (
        <div className="fila-nota">
          <label htmlFor={`${id}-nota`}>{conPuntos ? 'Nota general' : 'Nota'}</label>
          <CampoCrece
            id={`${id}-nota`}
            valor={b.nota}
            placeholder="Opcional"
            alCambiar={(v) => cambiar({ nota: v })}
          />
        </div>
      ) : (
        <textarea
          className="campo"
          value={b.nota}
          aria-label={`Tu respuesta a ${p.codigo}`}
          placeholder="Tu respuesta"
          onChange={(e) => cambiar({ nota: e.target.value })}
        />
      )}
    </div>
  )
}

/** Lo que quedó respondido, para leerlo de un vistazo. */
function Resumen({ p }: { p: PendienteVista }) {
  const b = p.borrador
  const elegida = p.opciones.find((o) => o.letra === b.opcion)
  return (
    <div className="respuesta">
      {p.postergada && (
        <span className="r">
          <b>Postergada:</b>
          queda aprobada provisional; la IA la anota con dónde mirar si falla.
        </span>
      )}
      {elegida && (
        <span className="r">
          <b>{elegida.letra})</b>
          {elegida.texto}
        </span>
      )}
      {b.opcion === OTRO && (
        <span className="r">
          <b>Otro:</b>
          {b.otro}
        </span>
      )}
      {p.puntos.length > 0 && (
        <ul className="r-puntos">
          {p.puntos.map((punto, i) => (
            <li key={punto} className={b.marcas[i] ? 'r-punto si' : 'r-punto no'}>
              <Icono nombre={b.marcas[i] ? 'check' : 'error'} etiqueta={b.marcas[i] ? 'Funciona' : 'No'} />
              <span>
                {/* biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027). */}
                <span dangerouslySetInnerHTML={{ __html: p.puntosHtml[i] ?? '' }} />
                {b.notas[i] ? <span className="nota"> — {b.notas[i]}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
      {b.nota !== '' && (
        <span className="nota">{elegida || p.puntos.length > 0 ? `Nota: ${b.nota}` : b.nota}</span>
      )}
    </div>
  )
}

/** Lo que hay detrás de «Mostrar detalles», para saber si vale la pena abrirlo. */
function queHay(p: PendienteVista): string {
  const partes: string[] = []
  if (p.contextoHtml !== '') partes.push('contexto')
  if (p.citas.length > 0) partes.push(p.citas.length === 1 ? '1 cita' : `${p.citas.length} citas`)
  return partes.join(' y ')
}

type Envio =
  | { tipo: 'quieto' }
  | { tipo: 'guardando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'cambio'; afuera: PendienteVista }
  | { tipo: 'aviso'; mensaje: string }

export function Pendiente({
  ruta,
  p,
  abrirDoc,
}: {
  ruta: string
  p: PendienteVista
  abrirDoc: (d: Destino) => void
}) {
  const enMemoria = usarEstado((s) => s.borradores[claveBorrador(ruta, p.codigo)])
  const escribirBorrador = usarEstado((s) => s.escribirBorrador)
  const soltarBorrador = usarEstado((s) => s.soltarBorrador)
  const ponerPendiente = usarEstado((s) => s.ponerPendiente)
  const [envio, setEnvio] = useState<Envio>({ tipo: 'quieto' })
  const [preguntaEntera, setPreguntaEntera] = useState(false)
  const [detalles, setDetalles] = useState(false)
  const hayDetalles = p.contextoHtml !== '' || p.citas.length > 0

  // Una respondida se corrige cuando tiene algo escrito en memoria.
  const corrigiendo = p.estado === 'respondida' && enMemoria !== undefined
  const b = enMemoria ?? p.borrador
  const clave = `borrador|${claveBorrador(ruta, p.codigo)}`
  const cambiar = (cambio: Partial<Borrador>) => {
    const nuevo = { ...b, ...cambio }
    escribirBorrador(ruta, p.codigo, nuevo)
    // Lo que se escribe queda guardado a medias solo (R-3): no se pierde al cerrar Iridium. Una respondida que se
    // corrige no: su respuesta ya está en el proyecto.
    if (p.estado !== 'respondida')
      guardarLuego(clave, () => void window.iridium.aMedias(ruta, p.codigo, nuevo).catch(() => {}))
  }
  const larga = p.pregunta.length > 150

  const enviar = async (forzar = false, postergar = false) => {
    noGuardar(clave)
    setEnvio({ tipo: 'guardando' })
    const r = await window.iridium
      .responder(ruta, { codigo: p.codigo, borrador: b, huella: p.huella, forzar, postergar })
      .catch((e: unknown) => ({ tipo: 'error' as const, mensaje: String(e) }))
    switch (r.tipo) {
      case 'guardado':
        soltarBorrador(ruta, p.codigo)
        ponerPendiente(ruta, r.pendiente)
        setEnvio({ tipo: 'quieto' })
        return
      case 'cambio':
        setEnvio({ tipo: 'cambio', afuera: r.pendiente })
        return
      case 'procesada':
        soltarBorrador(ruta, p.codigo)
        setEnvio({ tipo: 'aviso', mensaje: 'La IA ya procesó esta respuesta: no se cambió.' })
        return
      case 'no-esta':
        setEnvio({ tipo: 'aviso', mensaje: 'Esta pregunta ya no está en el estado del proyecto.' })
        return
      case 'error':
        setEnvio({ tipo: 'error', mensaje: r.mensaje })
        return
    }
  }

  const aMedias = async () => {
    noGuardar(clave)
    setEnvio({ tipo: 'guardando' })
    const r = await window.iridium.aMedias(ruta, p.codigo, b).catch(() => null)
    if (!r) {
      setEnvio({ tipo: 'error', mensaje: 'No se pudo guardar a medias.' })
      return
    }
    soltarBorrador(ruta, p.codigo)
    ponerPendiente(ruta, r)
    setEnvio({ tipo: 'quieto' })
  }

  const usarLaDeAfuera = (afuera: PendienteVista) => {
    soltarBorrador(ruta, p.codigo)
    ponerPendiente(ruta, afuera)
    setEnvio({ tipo: 'quieto' })
  }

  const conMedias = p.puntos.length > 0 || p.tipo === 'prueba' || p.tipo === 'tarea'
  const guardando = envio.tipo === 'guardando'
  const mostrarFormulario = p.estado !== 'respondida' || corrigiendo

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: solo delega los clics de los enlaces de adentro, que ya son enfocables.
    <article
      className={p.estado === 'respondida' ? 'pend' : 'pend abierta'}
      data-q={p.codigo}
      aria-label={`${p.codigo}: ${p.pregunta}`}
      onClick={(e) => alTocarEnlace(e, abrirDoc)}
    >
      <div className="meta">
        <span className="q">{p.codigo}</span>
        <span className="tipo">{p.tipo}</span>
        {p.frena && p.estado !== 'respondida' && (
          <span className="chip espera">
            <Icono nombre="espera" />
            Frena
          </span>
        )}
        {p.estado === 'respondida' && (
          <span className="chip ok">
            <Icono nombre="check" />
            {p.postergada ? 'Postergada, sin procesar' : 'Respondida, sin procesar'}
          </span>
        )}
        {p.estado === 'a-medias' && <span className="chip neutro">A medias</span>}
        {p.frente && (
          <span className="frente-q" title={`Es del módulo ${p.frente}`}>
            {p.frente}
          </span>
        )}
      </div>
      <h3 className={larga && !preguntaEntera ? 'plegada' : undefined}>{p.pregunta}</h3>
      {larga && (
        <button
          type="button"
          className="enlace mas"
          aria-expanded={preguntaEntera}
          onClick={() => setPreguntaEntera(!preguntaEntera)}
        >
          {preguntaEntera ? 'Plegar la pregunta' : 'Ver la pregunta entera'}
        </button>
      )}
      {hayDetalles && (
        <button
          type="button"
          className="enlace detalles-btn"
          aria-expanded={detalles}
          onClick={() => setDetalles(!detalles)}
        >
          <Icono nombre="chev" />
          {detalles ? 'Ocultar detalles' : `Mostrar detalles (${queHay(p)})`}
        </button>
      )}
      {detalles && (
        <div className="detalles">
          {p.contextoHtml !== '' && (
            // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
            <div className="contexto" dangerouslySetInnerHTML={{ __html: p.contextoHtml }} />
          )}
          {p.citas.length > 0 && (
            <div className="citas">
              {p.citas.map((c) => (
                <Cita key={c.etiqueta} c={c} abrirDoc={abrirDoc} />
              ))}
            </div>
          )}
        </div>
      )}

      {mostrarFormulario ? <Formulario p={p} b={b} cambiar={cambiar} /> : <Resumen p={p} />}

      {envio.tipo === 'error' && (
        <div className="falla" role="alert">
          <span className="chip error">
            <Icono nombre="error" />
            No se guardó
          </span>
          <span>{envio.mensaje} Lo que escribiste sigue acá.</span>
          <button type="button" className="btn secundario acc" onClick={() => void enviar()}>
            <Icono nombre="reintentar" />
            Reintentar
          </button>
        </div>
      )}
      {envio.tipo === 'aviso' && (
        <div className="falla" role="status">
          <span>{envio.mensaje}</span>
        </div>
      )}
      {envio.tipo === 'cambio' && (
        <div className="falla cambio" role="alert">
          <div className="txt">
            <strong>La respuesta cambió fuera de Iridium.</strong> Alguien la escribió mientras respondías
            (por ejemplo, desde el Gestor). Esto es lo que dice ahora:
            <Resumen p={envio.afuera} />
          </div>
          <div className="acc">
            <button type="button" className="btn secundario" onClick={() => usarLaDeAfuera(envio.afuera)}>
              Dejar la de afuera
            </button>
            <button type="button" className="btn primario" onClick={() => void enviar(true)}>
              Reemplazar con la mía
            </button>
          </div>
        </div>
      )}

      <div className="acciones">
        {mostrarFormulario ? (
          <>
            <span className="ayuda">Se guarda en respuestas/{p.codigo}.md</span>
            {corrigiendo && (
              <button
                type="button"
                className="btn secundario"
                disabled={guardando}
                onClick={() => soltarBorrador(ruta, p.codigo)}
              >
                Cancelar
              </button>
            )}
            {conMedias && !corrigiendo && (
              <button
                type="button"
                className="btn secundario"
                disabled={guardando || (!tieneAlgo(b) && p.estado !== 'a-medias')}
                title="Guarda lo marcado sin enviarlo: la IA no lo ve"
                onClick={() => void aMedias()}
              >
                Guardar a medias
              </button>
            )}
            {p.tipo === 'prueba' && !corrigiendo && (
              <button
                type="button"
                className="btn secundario"
                disabled={guardando}
                title="La deja para después como aprobada provisional, con lo que marcaste: la IA la anota con dónde mirar si falla"
                onClick={() => void enviar(false, true)}
              >
                Postergar
              </button>
            )}
            <button
              type="button"
              className="btn primario"
              disabled={guardando || !puedeEnviar(b, p)}
              onClick={() => void enviar()}
            >
              {guardando ? 'Guardando…' : 'Enviar'}
            </button>
          </>
        ) : (
          <>
            <span className="ayuda">La IA la lee cuando retome el proyecto</span>
            <button
              type="button"
              className="btn secundario"
              onClick={() => escribirBorrador(ruta, p.codigo, p.borrador)}
            >
              Corregir
            </button>
          </>
        )}
      </div>
    </article>
  )
}
