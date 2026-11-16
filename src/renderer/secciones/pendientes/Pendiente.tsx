// Un pendiente de W-5 con las piezas (DI-I3, tanda 6; `docs/diseno/pantallas/bandeja.html`): código, tipo y si frena
// como Señales; la pregunta, que se pliega desde su título (R-39); y el formulario para responder (H-10: opciones, Otro
// y nota; H-11 y W-6: una fila por casilla con su nota). El contexto y lo que cita van plegados en «Mostrar detalles»
// (Q-62). Lo escrito se guarda solo (R-3), sin «Guardar a medias» (T-58). Las respondidas sin procesar muestran lo
// elegido y se pueden corregir hasta que la IA las procesa.
import { type MouseEvent, useId, useLayoutEffect, useRef, useState } from 'react'
import type { CitaVista, Destino, PendienteVista } from '../../../compartido/puente'
import { type Borrador, OTRO, puedeEnviar } from '../../../compartido/respuestas'
import { claveBorrador, usarEstado } from '../../estado'
import { useAltoDelTexto } from '../../ui/altoDelTexto'
import { guardarLuego, noGuardar } from '../../ui/guardarLuego'
import { Icono } from '../../ui/Icono'

/** Un Campo (PZ-5) de una línea que crece hacia abajo con lo que se escribe, para leerlo entero. */
function CampoCrece({
  valor,
  alCambiar,
  clase,
  ...resto
}: {
  valor: string
  alCambiar: (v: string) => void
  clase: string
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
      className={`campo chico crece ${clase}`}
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

/** El texto de una cita (Texto de documento, PZ-12), plegado si es largo, con «Mostrar todo». */
function TextoPlegable({ html }: { html: string }) {
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
        className={`texto-doc conversacion texto-cita${abierto ? '' : largo ? ' plegado largo' : ' plegado'}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {(largo || abierto) && (
        <button
          type="button"
          className="boton sin-fondo chico plegar-cita"
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
        <div className="cab-cita">
          <span className="ref">{c.etiqueta}</span>
        </div>
        <span className="senal">
          <Icono nombre="busca" />
          No se encontró la sección: puede que haya cambiado de nombre.
        </span>
      </div>
    )
  const ver = (
    <button
      type="button"
      className="boton sin-fondo chico ver-cita"
      onClick={() => abrirDoc({ documento: c.ruta, ancla: c.tipo === 'seccion' ? c.ancla : '' })}
    >
      Ver entero
    </button>
  )
  if (c.tipo === 'documento')
    return (
      <div className="cita">
        <div className="cab-cita">
          <span className="ref">{c.etiqueta}</span>
          {ver}
        </div>
      </div>
    )
  // El nombre de la sección, sin el código que ya dice la etiqueta.
  const nombre = c.titulo.replace(/^[A-Z]{1,4}-?\d{1,4}\s*[—–:-]\s*/, '')
  return (
    <div className="cita">
      <div className="cab-cita">
        <span className="ref">{c.etiqueta}</span>
        {nombre !== '' && !c.etiqueta.endsWith(c.titulo) && <span className="nombre">{nombre}</span>}
        {ver}
      </div>
      {c.html !== '' && <TextoPlegable html={c.html} />}
    </div>
  )
}

/** Las casillas y las opciones (Campo, PZ-5, en Filas, PZ-2), o el área de texto libre. La nota general va al pie. */
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
  if (p.puntos.length > 0)
    return (
      <div className="filas con-lineas puntos-q">
        {p.puntos.map((punto, i) => (
          <div key={punto} className="fila punto-q">
            {/* La casilla marca; el texto no (puede tener enlaces): por eso no es un label. */}
            <span className="casilla texto-punto">
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
                // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
                dangerouslySetInnerHTML={{ __html: p.puntosHtml[i] ?? '' }}
              />
            </span>
            <CampoCrece
              clase="nota-punto"
              valor={b.notas[i] ?? ''}
              placeholder="Nota, si falló"
              aria-label={`Nota de: ${punto}`}
              alCambiar={(v) => cambiar({ notas: b.notas.map((n, j) => (j === i ? v : n)) })}
            />
          </div>
        ))}
      </div>
    )
  if (p.opciones.length > 0)
    return (
      <div className="filas con-lineas opciones-q" role="radiogroup" aria-label={`Opciones de ${p.codigo}`}>
        {p.opciones.map((o) => (
          <label key={o.letra} className="fila opcion-q">
            <span className="opcion">
              <input
                type="radio"
                name={id}
                value={o.letra}
                checked={b.opcion === o.letra}
                onChange={() => cambiar({ opcion: o.letra })}
              />
            </span>
            <span className="letra">{o.letra})</span>
            <span className="texto-opcion">{o.texto}</span>
            {o.recomendada && (
              <span className="senal recomendada">
                <Icono nombre="estrella" />
                recomendada
              </span>
            )}
          </label>
        ))}
        <label className="fila opcion-q otro">
          <span className="opcion">
            <input
              type="radio"
              name={id}
              value={OTRO}
              checked={b.opcion === OTRO}
              onChange={() => cambiar({ opcion: OTRO })}
            />
          </span>
          <span className="letra">Otro</span>
          <CampoCrece
            clase="campo-otro"
            valor={b.otro}
            placeholder="Cuéntalo con tus palabras"
            aria-label="Otra respuesta"
            alCambiar={(v) => cambiar({ otro: v, opcion: OTRO })}
          />
        </label>
      </div>
    )
  return (
    <textarea
      className="area"
      value={b.nota}
      aria-label={`Tu respuesta a ${p.codigo}`}
      placeholder="Tu respuesta"
      onChange={(e) => cambiar({ nota: e.target.value })}
    />
  )
}

/** Lo que quedó respondido, para leerlo de un vistazo. */
function Resumen({ p }: { p: PendienteVista }) {
  const b = p.borrador
  const elegida = p.opciones.find((o) => o.letra === b.opcion)
  return (
    <div className="resumen-q">
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
  primera = false,
}: {
  ruta: string
  p: PendienteVista
  abrirDoc: (d: Destino) => void
  /** La primera de la lista: va abierta. */
  primera?: boolean
}) {
  const enMemoria = usarEstado((s) => s.borradores[claveBorrador(ruta, p.codigo)])
  const escribirBorrador = usarEstado((s) => s.escribirBorrador)
  const soltarBorrador = usarEstado((s) => s.soltarBorrador)
  const ponerPendiente = usarEstado((s) => s.ponerPendiente)
  const [envio, setEnvio] = useState<Envio>({ tipo: 'quieto' })
  // R-39: la primera (la que frena, si hay) y lo que se está escribiendo quedan abiertos; las demás, plegadas.
  const [abierta, setAbierta] = useState(primera || p.estado === 'a-medias' || enMemoria !== undefined)
  const [detalles, setDetalles] = useState(false)
  const cuerpo = useId()
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

  const usarLaDeAfuera = (afuera: PendienteVista) => {
    soltarBorrador(ruta, p.codigo)
    ponerPendiente(ruta, afuera)
    setEnvio({ tipo: 'quieto' })
  }

  const guardando = envio.tipo === 'guardando'
  const mostrarFormulario = p.estado !== 'respondida' || corrigiendo
  const frena = p.frena && p.estado !== 'respondida' && !p.enPausa
  const conNota = p.opciones.length > 0 || p.puntos.length > 0

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: solo delega los clics de los enlaces de adentro, que ya son enfocables.
    <article
      className={`pregunta${frena ? ' frena' : ''}`}
      data-q={p.codigo}
      aria-label={`${p.codigo}: ${p.pregunta}`}
      onClick={(e) => alTocarEnlace(e, abrirDoc)}
    >
      <div className="cab-q">
        <span className="cuenta">{p.codigo}</span>
        <span className="senal">{p.tipo}</span>
        {frena && (
          <span className="senal ambar">
            <Icono nombre="espera" />
            Frena
          </span>
        )}
        {p.estado === 'respondida' && (
          <span className="senal">
            <Icono nombre="check" />
            {p.postergada ? 'Postergada, sin procesar' : 'Respondida, sin procesar'}
          </span>
        )}
        {p.estado === 'a-medias' && <span className="senal">A medias</span>}
        {p.frente && (
          <span className="senal frente-pregunta" title={`Es del frente ${p.frente}`}>
            {p.frente}
          </span>
        )}
      </div>
      <h3>
        <button
          type="button"
          className="titulo-q"
          aria-expanded={abierta}
          aria-controls={cuerpo}
          onClick={() => setAbierta(!abierta)}
        >
          <Icono nombre="chev" />
          {p.pregunta}
        </button>
      </h3>
      {abierta && (
        <div className="cuerpo-q" id={cuerpo}>
          {hayDetalles && (
            <button
              type="button"
              className="boton sin-fondo chico detalles-q"
              aria-expanded={detalles}
              onClick={() => setDetalles(!detalles)}
            >
              <Icono nombre="chev" />
              {detalles ? 'Ocultar detalles' : `Mostrar detalles · ${queHay(p)}`}
            </button>
          )}
          {detalles && (
            <div className="detalles">
              {p.contextoHtml !== '' && (
                <div
                  className="texto-doc conversacion contexto"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
                  dangerouslySetInnerHTML={{ __html: p.contextoHtml }}
                />
              )}
              {p.citas.map((c) => (
                <Cita key={c.etiqueta} c={c} abrirDoc={abrirDoc} />
              ))}
            </div>
          )}

          {mostrarFormulario ? <Formulario p={p} b={b} cambiar={cambiar} /> : <Resumen p={p} />}

          {envio.tipo === 'error' && (
            <div className="recuadro error" role="alert">
              <Icono nombre="error" />
              <div className="cuerpo-recuadro">
                <strong>No se guardó</strong>
                <span>{envio.mensaje} Lo que escribiste sigue aquí.</span>
                <div className="acciones-recuadro">
                  <button type="button" className="boton secundario chico" onClick={() => void enviar()}>
                    <Icono nombre="reintentar" />
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}
          {envio.tipo === 'aviso' && (
            <div className="recuadro" role="status">
              <span>{envio.mensaje}</span>
            </div>
          )}
          {envio.tipo === 'cambio' && (
            <div className="recuadro aviso" role="alert">
              <Icono nombre="espera" />
              <div className="cuerpo-recuadro">
                <span>
                  <strong>La respuesta cambió fuera de Iridium.</strong> Alguien la escribió mientras
                  respondías (por ejemplo, desde el Gestor). Esto es lo que dice ahora:
                </span>
                <Resumen p={envio.afuera} />
                <div className="acciones-recuadro">
                  <button
                    type="button"
                    className="boton secundario chico"
                    onClick={() => usarLaDeAfuera(envio.afuera)}
                  >
                    Dejar la de afuera
                  </button>
                  <button type="button" className="boton secundario chico" onClick={() => void enviar(true)}>
                    Reemplazar con la mía
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pie-q">
            {mostrarFormulario ? (
              <>
                {conNota && (
                  <CampoCrece
                    clase="nota-q"
                    valor={b.nota}
                    placeholder={p.puntos.length > 0 ? 'Nota general (opcional)' : 'Nota (opcional)'}
                    aria-label={p.puntos.length > 0 ? 'Nota general' : 'Nota'}
                    alCambiar={(v) => cambiar({ nota: v })}
                  />
                )}
                {p.tipo === 'prueba' && !corrigiendo && (
                  <button
                    type="button"
                    className="boton sin-fondo"
                    disabled={guardando}
                    title="La deja para después como aprobada provisional, con lo que marcaste: la IA la anota con dónde mirar si falla"
                    onClick={() => void enviar(false, true)}
                  >
                    Postergar
                  </button>
                )}
                {corrigiendo && (
                  <button
                    type="button"
                    className="boton secundario"
                    disabled={guardando}
                    onClick={() => soltarBorrador(ruta, p.codigo)}
                  >
                    Cancelar
                  </button>
                )}
                {/* R-73: el Enviar de cada pregunta es principal (verde): es lo que cierra esa pregunta. */}
                <button
                  type="button"
                  className="boton principal"
                  disabled={guardando || !puedeEnviar(b, p)}
                  onClick={() => void enviar()}
                >
                  {guardando ? 'Guardando…' : 'Enviar'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="boton secundario"
                title="Se puede corregir hasta que la IA la lea, cuando retome el proyecto"
                onClick={() => escribirBorrador(ruta, p.codigo, p.borrador)}
              >
                Corregir
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
