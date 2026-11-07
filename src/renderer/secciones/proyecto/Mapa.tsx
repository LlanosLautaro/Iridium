// El Mapa (H-7, D-035, 04-ux.md › W-7): ¿en qué va y qué sigue? La línea de hitos (tocar uno lo muestra) y, debajo,
// el hito: en el actual, el próximo paso, los pasos, lo que te espera y lo último de la IA. Tocar un paso abre su
// sección en Docs (F-4). Arriba, los frentes (D-063): el núcleo y cada módulo con su propia tarjeta. Se relee solo
// cuando cambia un documento del proyecto.
import { useCallback, useEffect, useState } from 'react'
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
  completo: { icono: 'check', palabra: 'completo' },
  'en-curso': { icono: 'sync', palabra: 'en curso' },
  pendiente: { icono: 'circulo', palabra: 'pendiente' },
  reabierto: { icono: 'reintentar', palabra: 'reabierto' },
  saltado: { icono: 'x', palabra: 'saltado' },
  bloqueado: { icono: 'error', palabra: 'bloqueado' },
  'en-pausa': { icono: 'pausa', palabra: 'en pausa' },
  otro: { icono: 'duda', palabra: '' },
}

const PASO: Record<EstadoPaso, { icono: NombreIcono; palabra: string }> = {
  hecho: { icono: 'check', palabra: 'hecho' },
  'en-curso': { icono: 'sync', palabra: 'en curso' },
  espera: { icono: 'espera', palabra: 'espera tu prueba' },
  pendiente: { icono: 'circulo', palabra: 'pendiente' },
  saltado: { icono: 'x', palabra: 'saltado' },
  reabierto: { icono: 'reintentar', palabra: 'reabierto' },
  'en-pausa': { icono: 'pausa', palabra: 'en pausa' },
  otro: { icono: 'duda', palabra: '' },
}

function ChipHito({ h }: { h: HitoMapa }) {
  const e = HITO[h.estado]
  return (
    <span
      className={`chip hito-${h.estado}`}
      title={h.estado === 'otro' ? 'Se muestra tal cual: no es un estado de la guía' : h.estadoTexto}
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

function TeEspera({ ruta, preguntas }: { ruta: string; preguntas: PreguntaNueva[] }) {
  const responderEn = usarEstado((s) => s.responderEn)
  return (
    <div>
      <h4>
        Te espera <span className="n">{preguntas.length}</span>
      </h4>
      {preguntas.length === 0 ? (
        <span className="vacio">Nada te espera.</span>
      ) : (
        <div className="filas">
          {preguntas.map((q) => (
            <button
              key={q.codigo}
              type="button"
              className="fila espera-fila"
              title="Responder en la Bandeja de entrada"
              onClick={() => responderEn(ruta)}
            >
              <span className="q">{q.codigo}</span>
              <span className="t">{q.pregunta}</span>
              <span className="est">
                {q.tipo}
                {q.frena && ' · frena'}
              </span>
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

function textoPlano(html: string): string {
  return (
    new DOMParser().parseFromString(html, 'text/html').body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  )
}

/** Lo último de la IA: lo que hace ahora, si trabaja, y sus últimos mensajes de la conversación abierta. */
function LoUltimo({ ruta }: { ruta: string }) {
  const c = usarEstado((s) => s.conversaciones[ruta])
  const ficha = usarEstado((s) => fichaDe(s.fichas, ruta))
  const entradas = c?.entradas ?? []
  const trabajando = ficha?.estado === 'trabajando'
  const herramienta = [...entradas].reverse().find((e) => e.tipo === 'herramienta')
  const ultimos = entradas
    .filter((e) => e.tipo === 'ia')
    .slice(-3)
    .reverse()
  return (
    <div>
      <h4>Lo último de la IA</h4>
      {!trabajando && ultimos.length === 0 ? (
        <span className="vacio">Todavía no hay conversación en este proyecto.</span>
      ) : (
        <div className="filas">
          {trabajando && (
            <div className="fila trabaja">
              <Icono nombre="sync" gira />
              <span className="t">
                Trabajando
                {herramienta?.tipo === 'herramienta' &&
                  ` · ${herramienta.accion}${herramienta.objeto ? ` ${herramienta.objeto}` : ''}`}
              </span>
              <span className="hora">ahora</span>
            </div>
          )}
          {ultimos.map(
            (e) =>
              e.tipo === 'ia' && (
                <div key={e.id} className="fila" title={textoPlano(e.html)}>
                  <span className="t tenue">{textoPlano(e.html)}</span>
                  {e.cuando !== null && <span className="hora">{hora(e.cuando)}</span>}
                </div>
              ),
          )}
        </div>
      )}
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
            <button type="button" className="btn secundario" onClick={volver}>
              Ver el hito actual
            </button>
          )}
          {documento && (
            <button
              type="button"
              className="btn secundario"
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
              // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces de adentro, que ya son enfocables.
              <div
                className="proximo doc-texto"
                onClick={(e) => tocarEnlace(e, ruta)}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
                dangerouslySetInnerHTML={{ __html: m.proximoHtml }}
              />
            ) : (
              <span className="vacio">
                <code>estado.md</code> no dice el próximo paso.
              </span>
            )}
          </div>
          <div className="dos">
            {pasos}
            <div className="columna-mapa">
              <TeEspera ruta={ruta} preguntas={m.preguntas} />
              <LoUltimo ruta={ruta} />
            </div>
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

/** Un módulo como frente (D-063): en qué está, qué sigue, sus pasos, sus iteraciones y lo que te espera. */
function TarjetaFrente({ ruta, f }: { ruta: string; f: FrenteMapa }) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  return (
    <section className="hito-card" aria-label={`Frente ${f.nombre}`}>
      <div className="cab">
        <span className="num">Módulo</span>
        <h3>{f.nombre}</h3>
        {f.paso ? (
          <span className="chip neutro">{f.paso}</span>
        ) : (
          <span className="chip ok">
            <Icono nombre="check" />
            todos los pasos hechos
          </span>
        )}
        <div className="der">
          <button
            type="button"
            className="btn secundario"
            onClick={() => abrirDoc(ruta, { documento: f.documento, ancla: '' })}
          >
            <Icono nombre="docs" />
            Abrir su estado
          </button>
        </div>
      </div>
      {f.enQueHtml && <TextoDoc ruta={ruta} html={f.enQueHtml} clase="detalle" />}
      <div>
        <h4>Próximo paso</h4>
        {f.proximoHtml ? (
          <TextoDoc ruta={ruta} html={f.proximoHtml} clase="proximo" />
        ) : (
          <span className="vacio">
            Su <code>estado.md</code> no dice el próximo paso.
          </span>
        )}
      </div>
      <div className="dos">
        <div className="columna-mapa">
          <ListaPasos
            ruta={ruta}
            titulo="Pasos del módulo"
            pasos={f.pasos}
            vacio="Su estado.md no tiene la tabla Progreso."
          />
          {f.iteraciones.length > 0 && (
            <ListaPasos ruta={ruta} titulo="Iteraciones" pasos={f.iteraciones} vacio="" />
          )}
        </div>
        <div className="columna-mapa">
          <TeEspera ruta={ruta} preguntas={f.preguntas} />
        </div>
      </div>
    </section>
  )
}

/** La fila de frentes (D-063): el núcleo y cada módulo, con en qué está y cuántas preguntas tiene. */
function Frentes({
  m,
  elegido,
  elegir,
}: {
  m: Extract<MapaProyecto, { tipo: 'mapa' }>
  elegido: string | null
  elegir: (carpeta: string | null) => void
}) {
  const actual = m.hitos.find((h) => h.numero === m.actual)
  const boton = (clave: string | null, nombre: string, detalle: string | null, qs: PreguntaNueva[]) => {
    const frena = qs.some((q) => q.frena)
    return (
      <button
        key={clave ?? ''}
        type="button"
        className="frente"
        aria-pressed={elegido === clave}
        title={`${nombre}${detalle ? ` · ${detalle}` : ''}${qs.length > 0 ? ` · ${qs.length} sin responder` : ''}`}
        onClick={() => elegir(clave)}
      >
        <span className="nom">{nombre}</span>
        {detalle && <span className="det">{detalle}</span>}
        {qs.length > 0 && (
          <span className={frena ? 'cuenta frena' : 'cuenta'}>
            {frena && <Icono nombre="espera" />}
            {qs.length}
          </span>
        )}
      </button>
    )
  }
  return (
    <nav className="frentes" aria-label="Frentes">
      {boton(
        null,
        'Núcleo',
        m.actual !== null ? `Hito ${m.actual}${actual ? ` · ${actual.nombre}` : ''}` : null,
        m.preguntas,
      )}
      {m.frentes.map((f) => boton(f.carpeta, f.nombre, f.paso ?? 'hecho', f.preguntas))}
    </nav>
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
  return (
    <>
      <Cabecera titulo="Mapa" />
      <CuerpoMapa ruta={ruta} />
    </>
  )
}

function CuerpoMapa({ ruta }: { ruta: string }) {
  const m = useMapa(ruta)
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const [mirado, setMirado] = useState<number | null>(null)
  const [frente, setFrente] = useState<string | null>(null)

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
          <h3>Este proyecto no sigue la guía todavía</h3>
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
          <p className="nota">
            Para ponerlo al día, pedile a la IA en la conversación que lo audite con la guía de hitos.
          </p>
        </div>
      </div>
    )

  const numero = mirado ?? m.actual ?? m.hitos[0]?.numero ?? null
  const h = m.hitos.find((x) => x.numero === numero) ?? null
  const completos = m.hitos.filter((x) => x.estado === 'completo').length
  const hay = (e: EstadoHito) => m.hitos.some((x) => x.estado === e)
  // El frente elegido; si ya no está (se borró su carpeta), se vuelve al núcleo.
  const f = m.frentes.find((x) => x.carpeta === frente) ?? null
  return (
    <div className="mapa">
      <div className="mapa-int">
        {m.frentes.length > 0 && <Frentes m={m} elegido={f?.carpeta ?? null} elegir={setFrente} />}
        {f && <TarjetaFrente ruta={ruta} f={f} />}
        {!f && m.hitos.length > 0 && (
          <div className="linea">
            <div className="cab">
              <h3>Plan</h3>
              <span className="cuenta">
                {completos} de {m.hitos.length} completos
              </span>
            </div>
            <div className="hitos">
              {m.hitos.map((x) => (
                <button
                  key={x.numero}
                  type="button"
                  className={`h h-${x.estado}`}
                  aria-current={x.numero === numero}
                  title={`Hito ${x.numero} · ${x.nombre} · ${x.estadoTexto}`}
                  aria-label={`Hito ${x.numero}, ${x.nombre}, ${x.estadoTexto}`}
                  onClick={() => setMirado(x.numero)}
                >
                  {x.numero}
                </button>
              ))}
            </div>
            <div className="leyenda-linea">
              <span>
                <i className="h-completo" />
                completo
              </span>
              <span>
                <i className="h-en-curso" />
                en curso
              </span>
              <span>
                <i />
                pendiente
              </span>
              {hay('reabierto') && (
                <span>
                  <i className="h-reabierto" />
                  reabierto
                </span>
              )}
              {hay('en-pausa') && (
                <span>
                  <i className="h-en-pausa" />
                  en pausa
                </span>
              )}
              {hay('saltado') && (
                <span>
                  <i className="h-saltado" />
                  saltado
                </span>
              )}
              {hay('otro') && (
                <span>
                  <i className="h-otro" />
                  no se entiende: se muestra tal cual
                </span>
              )}
            </div>
          </div>
        )}
        {!f && h && (
          <TarjetaHito
            ruta={ruta}
            m={m}
            h={h}
            volver={h.numero !== m.actual && m.actual !== null ? () => setMirado(null) : null}
          />
        )}
      </div>
    </div>
  )
}
