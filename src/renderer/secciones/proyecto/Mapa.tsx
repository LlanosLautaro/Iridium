// El Mapa (H-7, D-035, 04-ux.md › W-7): ¿en qué va y qué sigue? Arriba, la fila de hitos (tocar uno muestra su
// detalle). Con un frente en curso manda el bloque de frentes (frente Orden, A-5): el activo con su paso, su Próximo
// paso, su trabajo en curso y sus preguntas, y debajo los que esperan y los que están en operación, cada uno a su
// `estado.md`. Sin frente en curso, el detalle del hito actual. Al pie, lo último de la IA. Tocar un paso abre su
// sección en Docs (F-4). Se relee solo cuando cambia un documento del proyecto.
import { type MouseEvent, useCallback, useEffect, useState } from 'react'
import type {
  EstadoHito,
  EstadoPaso,
  FrenteMapa,
  HitoMapa,
  MapaProyecto,
  PasoMapa,
  PreguntaNueva,
} from '../../../compartido/puente'
import { fichaDe, usarEstado } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Icono, type NombreIcono } from '../../ui/Icono'
import { nombreDoc, tocarEnlace, useDocsCambian } from './enlaces'

/** Cuántos pasos se ven de entrada (W-7 › Extremos: «se ven las últimas y +12 anteriores»). */
const PASOS_VISIBLES = 8

const HITO: Record<EstadoHito, { icono: NombreIcono; palabra: string }> = {
  completo: { icono: 'check', palabra: 'hecho' },
  'en-curso': { icono: 'sync', palabra: 'en curso' },
  pendiente: { icono: 'circulo', palabra: 'pendiente' },
  reabierto: { icono: 'reintentar', palabra: 'reabierto' },
  saltado: { icono: 'x', palabra: 'descartado' },
  bloqueado: { icono: 'error', palabra: 'bloqueado' },
  'en-pausa': { icono: 'pausa', palabra: 'en pausa' },
  otro: { icono: 'duda', palabra: '' },
}

const PASO: Record<EstadoPaso, { icono: NombreIcono; palabra: string }> = {
  hecho: { icono: 'check', palabra: 'hecho' },
  'en-curso': { icono: 'sync', palabra: 'en curso' },
  espera: { icono: 'espera', palabra: 'espera tu prueba' },
  pendiente: { icono: 'circulo', palabra: 'pendiente' },
  saltado: { icono: 'x', palabra: 'descartado' },
  reabierto: { icono: 'reintentar', palabra: 'reabierto' },
  'en-pausa': { icono: 'pausa', palabra: 'en pausa' },
  otro: { icono: 'duda', palabra: '' },
}

function ChipHito({ h }: { h: HitoMapa }) {
  const e = HITO[h.estado]
  return (
    <span
      className={`chip hito-${h.estado}`}
      title={h.estado === 'otro' ? 'Se muestra tal cual: no es un estado del framework' : h.estadoTexto}
    >
      <Icono nombre={e.icono} />
      {e.palabra || h.estadoTexto}
    </span>
  )
}

function Paso({ ruta, paso }: { ruta: string; paso: PasoMapa }) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const e = PASO[paso.estado]
  const palabra = e.palabra || paso.estadoTexto
  const contenido = (
    <>
      <span className="t">{paso.texto}</span>
      <span className={`est paso-${paso.estado}`}>
        {palabra}
        <Icono nombre={e.icono} gira={paso.estado === 'en-curso'} />
      </span>
    </>
  )
  const destino = paso.destino
  if (!destino)
    return (
      <div className="fila" title={`${paso.texto} · ${palabra}`}>
        {contenido}
      </div>
    )
  return (
    <button
      type="button"
      className={paso.estado === 'en-curso' ? 'fila sel' : 'fila'}
      title={`${paso.texto} · ${palabra} · abrir su sección`}
      onClick={() => abrirDoc(ruta, destino)}
    >
      {contenido}
    </button>
  )
}

function ListaPasos({
  ruta,
  titulo,
  pasos,
  vacio,
}: {
  ruta: string
  titulo: string
  pasos: PasoMapa[]
  vacio: string
}) {
  const [todos, setTodos] = useState(false)
  const hechos = pasos.filter((p) => p.estado === 'hecho').length
  const ocultos = todos ? 0 : Math.max(0, pasos.length - PASOS_VISIBLES)
  return (
    <div>
      <h4>
        {titulo}
        {pasos.length > 0 && (
          <span className="n">
            {hechos} de {pasos.length}
          </span>
        )}
      </h4>
      {pasos.length === 0 ? (
        <span className="vacio">{vacio}</span>
      ) : (
        <div className="filas">
          {ocultos > 0 && (
            <button type="button" className="fila ver-mas" onClick={() => setTodos(true)}>
              +{ocultos} anteriores
            </button>
          )}
          {pasos.slice(ocultos).map((p, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: dos ítems del portón pueden decir lo mismo.
            <Paso key={`${i}-${p.texto}`} ruta={ruta} paso={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function Pasos({ ruta, h }: { ruta: string; h: HitoMapa }) {
  return (
    <ListaPasos
      ruta={ruta}
      titulo="Pasos"
      pasos={h.pasos}
      vacio={
        h.estado === 'pendiente'
          ? 'Todavía no empezó.'
          : h.documento
            ? 'Su documento no tiene portón ni plan de iteraciones.'
            : 'Sin documento todavía.'
      }
    />
  )
}

/** Las preguntas sin responder: cada una lleva a la Bandeja de entrada; la que frena, con el «!» ámbar (D-100). */
function EnTuBandeja({ ruta, preguntas }: { ruta: string; preguntas: PreguntaNueva[] }) {
  const responderEn = usarEstado((s) => s.responderEn)
  return (
    <div>
      <h4>
        En tu bandeja <span className="n">{preguntas.length}</span>
      </h4>
      {preguntas.length === 0 ? (
        <span className="vacio">Nada en tu bandeja.</span>
      ) : (
        <div className="filas">
          {preguntas.map((q) => (
            <button
              key={q.codigo}
              type="button"
              className="fila espera-fila"
              title={`Responder en la Bandeja de entrada${q.frena ? ' · frena el proyecto' : ''}`}
              onClick={() => responderEn(ruta)}
            >
              <span className="q">{q.codigo}</span>
              <span className="t">{q.pregunta}</span>
              {q.frena ? <span className="frena-punto">!</span> : <span className="est">{q.tipo}</span>}
              <Icono nombre="chev" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const hora = (ms: number) =>
  new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** La primera línea con texto de una respuesta, sin el formato. */
function primeraLinea(html: string): string {
  const cuerpo = new DOMParser().parseFromString(html, 'text/html').body
  const primero = [...cuerpo.children].find((n) => n.textContent?.trim()) ?? cuerpo
  return primero.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

/**
 * Lo último de la IA (W-7, D-035): lo que hace ahora, si trabaja, o la primera línea de su última respuesta, con
 * **Ver**, que lleva al final de la conversación. Sin conversación, nada.
 */
function LoUltimo({ ruta }: { ruta: string }) {
  const c = usarEstado((s) => s.conversaciones[ruta])
  const ficha = usarEstado((s) => fichaDe(s.fichas, ruta))
  const entradas = c?.entradas ?? []
  const trabajando = ficha?.estado === 'trabajando'
  const herramienta = [...entradas].reverse().find((e) => e.tipo === 'herramienta')
  const ultima = [...entradas].reverse().find((e) => e.tipo === 'ia')
  const ver = (e: MouseEvent<HTMLButtonElement>) => {
    const chat = e.currentTarget.closest('main')?.querySelector('aside.chat')
    const hilo = chat?.querySelector<HTMLElement>('.hilo')
    if (hilo) hilo.scrollTop = hilo.scrollHeight
    chat?.querySelector<HTMLTextAreaElement>('textarea:not(:disabled)')?.focus()
  }
  if (!trabajando && ultima?.tipo !== 'ia') return null
  const texto = ultima?.tipo === 'ia' ? primeraLinea(ultima.html) : ''
  return (
    <div className="ultimo-ia">
      {trabajando ? (
        <span className="trabaja">
          <Icono nombre="sync" gira />
          Trabajando
          {herramienta?.tipo === 'herramienta' &&
            ` · ${herramienta.accion}${herramienta.objeto ? ` ${herramienta.objeto}` : ''}`}
        </span>
      ) : (
        <>
          <span className="rot">Lo último de la IA:</span>
          <q title={texto}>{texto}</q>
          {ultima?.tipo === 'ia' && ultima.cuando !== null && <span>· {hora(ultima.cuando)}</span>}
        </>
      )}
      <button type="button" className="mini-link" onClick={ver}>
        Ver
      </button>
    </div>
  )
}

function TarjetaHito({
  ruta,
  m,
  h,
  volver,
}: {
  ruta: string
  m: Extract<MapaProyecto, { tipo: 'mapa' }>
  h: HitoMapa
  volver: (() => void) | null
}) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const actual = h.numero === m.actual
  const pasos = <Pasos key={h.numero} ruta={ruta} h={h} />
  const documento = h.documento
  return (
    <section className="hito-card" aria-label={`Hito ${h.numero}`}>
      <div className="cab">
        <span className="num">Hito {String(h.numero).padStart(2, '0')}</span>
        <h3>{h.nombre}</h3>
        <ChipHito h={h} />
        <div className="der">
          {volver && (
            <button type="button" className="btn secundario chico" onClick={volver}>
              Volver
            </button>
          )}
          {documento && !actual && (
            <button
              type="button"
              className="btn secundario chico"
              onClick={() => abrirDoc(ruta, { documento, ancla: '' })}
            >
              <Icono nombre="docs" />
              Abrir {nombreDoc(documento)}
            </button>
          )}
        </div>
      </div>
      {actual && m.detalleActual && <p className="detalle">{m.detalleActual}</p>}
      {h.estado === 'saltado' && h.estadoTexto && <p className="vacio">{h.estadoTexto}</p>}
      {actual ? (
        <>
          <div>
            <h4>Próximo paso</h4>
            {m.proximoHtml ? (
              <TextoDoc ruta={ruta} html={m.proximoHtml} clase="proximo" />
            ) : (
              <span className="vacio">
                <code>estado.md</code> no dice el próximo paso.
              </span>
            )}
          </div>
          <div className="dos">
            {pasos}
            <EnTuBandeja ruta={ruta} preguntas={m.preguntas} />
          </div>
        </>
      ) : (
        pasos
      )}
    </section>
  )
}

/** Un texto en HTML seguro del proceso principal, con sus enlaces a los documentos. */
function TextoDoc({ ruta, html, clase }: { ruta: string; html: string; clase: string }) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces de adentro, que ya son enfocables.
    <div
      className={`${clase} doc-texto`}
      onClick={(e) => tocarEnlace(e, ruta)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/** El nombre de un frente: con `estado.md`, un enlace a él; sin carpeta, el nombre solo. */
function NombreFrente({ ruta, f }: { ruta: string; f: FrenteMapa }) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const documento = f.documento
  if (!documento)
    return (
      <span className="sin-carpeta" title="Todavía no tiene su carpeta en docs/modulos">
        {f.nombre}
      </span>
    )
  return (
    <button
      type="button"
      className="enlace-frente"
      title={`${f.paso ? `${f.paso} · ` : ''}abrir ${documento}`}
      onClick={() => abrirDoc(ruta, { documento, ancla: '' })}
    >
      {f.nombre}
    </button>
  )
}

/** Los frentes en un estado, en una línea («En espera   Diseño · Capacidades»). */
function LineaFrentes({ ruta, rotulo, frentes }: { ruta: string; rotulo: string; frentes: FrenteMapa[] }) {
  if (frentes.length === 0) return null
  return (
    <>
      <span className="rot">{rotulo}</span>
      <span className="nombres">
        {frentes.map((f, i) => (
          <span key={f.clave}>
            {i > 0 && <span className="sep">·</span>}
            <NombreFrente ruta={ruta} f={f} />
          </span>
        ))}
      </span>
    </>
  )
}

/**
 * El bloque de frentes (W-7, A-5): el activo arriba, grande, con su paso, su Próximo paso, su trabajo en curso y sus
 * preguntas; debajo, una línea por estado (otros en curso, en espera, en pausa, en operación) y lo de la bandeja que no
 * es de ningún frente. Sin activo (se mira el hito actual), solo las líneas.
 */
function BloqueFrentes({
  ruta,
  m,
  activo,
}: {
  ruta: string
  m: Extract<MapaProyecto, { tipo: 'mapa' }>
  activo: FrenteMapa | null
}) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const abrirTrabajo = usarEstado((s) => s.abrirTrabajo)
  const responderEn = usarEstado((s) => s.responderEn)
  const con = (e: FrenteMapa['estado']) => m.frentes.filter((f) => f.estado === e && f !== activo)
  const documento = activo?.documento ?? null
  const sinFrente = m.preguntas
  return (
    <section className="bloque-frentes" aria-label="Frentes">
      {activo && (
        <div className="fr-activo">
          <div className="fr-cab">
            <span className="rot">Frente activo</span>
            <h3>{activo.nombre}</h3>
            {activo.paso && (
              <span className="fr-paso">
                <Icono nombre="cuadro" />
                {activo.paso} · en curso
              </span>
            )}
            {documento && (
              <button
                type="button"
                className="btn secundario chico"
                onClick={() => abrirDoc(ruta, { documento, ancla: '' })}
              >
                <Icono nombre="docs" />
                Abrir estado.md
              </button>
            )}
          </div>
          <div>
            <h4>Próximo paso</h4>
            {activo.proximoHtml ? (
              <TextoDoc ruta={ruta} html={activo.proximoHtml} clase="fr-texto" />
            ) : (
              <span className="vacio">
                {documento ? (
                  <>
                    Su <code>estado.md</code> no dice el próximo paso.
                  </>
                ) : (
                  'Todavía no tiene su carpeta en docs/modulos.'
                )}
              </span>
            )}
          </div>
          <div className="dos">
            <div>
              <h4>
                En curso <span className="n">{activo.trabajo.length}</span>
              </h4>
              {activo.trabajo.length === 0 ? (
                <span className="vacio">Ningún trabajo en curso.</span>
              ) : (
                <div className="filas">
                  {activo.trabajo.map((t) => (
                    <button
                      key={t.codigo}
                      type="button"
                      className="fila"
                      title="Abrir en Trabajo"
                      onClick={() => abrirTrabajo(ruta, t.codigo)}
                    >
                      <span className="q">{t.codigo}</span>
                      <span className="t">{t.titulo}</span>
                      <Icono nombre="chev" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <EnTuBandeja ruta={ruta} preguntas={activo.preguntas} />
          </div>
        </div>
      )}
      <div className="fr-otros">
        <LineaFrentes ruta={ruta} rotulo="También en curso" frentes={con('en curso')} />
        <LineaFrentes ruta={ruta} rotulo="En espera" frentes={[...con('pendiente'), ...con('nueva')]} />
        <LineaFrentes ruta={ruta} rotulo="En pausa" frentes={con('en pausa')} />
        <LineaFrentes ruta={ruta} rotulo="En operación" frentes={con('hecho')} />
        <LineaFrentes ruta={ruta} rotulo="Sin estado" frentes={con(null)} />
        {activo && sinFrente.length > 0 && (
          <>
            <span className="rot">Sin frente</span>
            <span className="nombres">
              <button
                type="button"
                className="enlace-frente"
                title={`Responder en la Bandeja de entrada: ${sinFrente.map((q) => q.codigo).join(', ')}`}
                onClick={() => responderEn(ruta)}
              >
                {sinFrente.length === 1
                  ? `${sinFrente[0]?.codigo} en tu bandeja`
                  : `${sinFrente.length} en tu bandeja`}
              </button>
              {sinFrente.some((q) => q.frena) && <span className="frena-punto">!</span>}
            </span>
          </>
        )}
      </div>
    </section>
  )
}

function useMapa(ruta: string): MapaProyecto | null {
  const [mapa, setMapa] = useState<MapaProyecto | null>(null)
  const leer = useCallback(() => {
    void window.iridium.mapa(ruta).then(setMapa)
  }, [ruta])
  useEffect(leer, [leer])
  useDocsCambian(ruta, leer)
  return mapa
}

export function Mapa({ ruta }: { ruta: string }) {
  const m = useMapa(ruta)
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const actual = m?.tipo === 'mapa' ? m.hitos.find((h) => h.numero === m.actual) : undefined
  const documento = actual?.documento ?? null
  return (
    <>
      <Cabecera
        titulo="Mapa"
        acciones={
          documento && (
            <button
              type="button"
              className="btn secundario chico"
              onClick={() => abrirDoc(ruta, { documento, ancla: '' })}
            >
              <Icono nombre="docs" />
              Abrir {nombreDoc(documento)}
            </button>
          )
        }
      />
      <CuerpoMapa ruta={ruta} m={m} />
    </>
  )
}

function CuerpoMapa({ ruta, m }: { ruta: string; m: MapaProyecto | null }) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const [mirado, setMirado] = useState<number | null>(null)

  if (!m) return <div className="mapa carga" aria-busy="true" />
  if (m.tipo === 'error')
    return (
      <div className="mapa">
        <p className="aviso-doc" role="alert">
          <Icono nombre="error" />
          {m.mensaje}
        </p>
      </div>
    )
  if (m.tipo === 'sin-guia')
    return (
      <div className="mapa">
        <div className="sin-guia">
          <h3>Este proyecto no sigue el framework todavía</h3>
          <p>
            No tiene <code>docs/estado.md</code>, así que no hay hitos para mostrar.
            {m.documentos.length > 0 ? ' Estos son los documentos que tiene:' : ' Tampoco tiene documentos.'}
          </p>
          {m.documentos.length > 0 && (
            <div className="filas">
              {m.documentos.map((d) => (
                <button
                  key={d}
                  type="button"
                  className="fila mono"
                  onClick={() => abrirDoc(ruta, { documento: d, ancla: '' })}
                >
                  <Icono nombre="docs" />
                  {nombreDoc(d)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )

  const h = m.hitos.find((x) => x.numero === (mirado ?? m.actual)) ?? null
  const hechos = m.hitos.filter((x) => x.estado === 'completo').length
  const activo = m.frentes.find((x) => x.estado === 'en curso') ?? null
  // Con un frente en curso manda el bloque; tocar un hito muestra su detalle en su lugar (Volver lo saca).
  const verHito = mirado !== null || !activo
  return (
    <div className="mapa">
      <div className="mapa-int">
        {m.hitos.length > 0 && (
          <fieldset className="hitos" aria-label="Hitos">
            <span className="rot">Hitos</span>
            {m.hitos.map((x) => (
              <button
                key={x.numero}
                type="button"
                className={`h h-${x.estado}`}
                aria-current={verHito && x.numero === h?.numero}
                title={`Hito ${x.numero} · ${x.nombre} · ${x.estadoTexto}`}
                aria-label={`Hito ${x.numero}, ${x.nombre}, ${x.estadoTexto}`}
                onClick={() => setMirado(x.numero === mirado ? null : x.numero)}
              >
                {x.numero}
              </button>
            ))}
            <span className="tot">
              {hechos} de {m.hitos.length} hechos
            </span>
          </fieldset>
        )}
        {verHito && h && (
          <TarjetaHito
            ruta={ruta}
            m={m}
            h={h}
            volver={mirado !== null && (activo || mirado !== m.actual) ? () => setMirado(null) : null}
          />
        )}
        {mirado === null && m.frentes.length > 0 && <BloqueFrentes ruta={ruta} m={m} activo={activo} />}
        <LoUltimo ruta={ruta} />
      </div>
    </div>
  )
}
