// Revisión (modulos/revision/ux.md › W-R3, H-R5, H-R7; DI-I3, tanda 10: las maquetas revision.html y
// revision-vacia.html): los comentarios que el usuario dejó sobre la app, en Nuevos, Anotados (R-9: quedaron en un plan,
// sin hacer), Hechos y Todos, del más nuevo al más viejo. Cada uno es una Fila con su captura; uno nuevo o anotado se
// puede mandar a la IA desde la fila. Uno elegido se ve entero: la captura grande, el texto, las pistas y su historia;
// uno hecho se puede Reabrir con una nota. La lista se relee sola cuando la IA cierra uno.
// Nada se borra desde acá.
import { useCallback, useEffect, useState } from 'react'
import type { ListaComentarios, ResultadoEnvio, VistaComentario } from '../../../compartido/puente'
import { usarEstado, vistaDe } from '../../estado'
import { Cabecera, Filtros } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { useDocsCambian } from './enlaces'
import { BotonAtras } from './Lector'

/** Lo ya leído de cada proyecto: se muestra en el acto y se relee al entrar. */
const leidas = new Map<string, ListaComentarios>()
/** Las capturas ya pedidas (`ruta|R-n`): no cambian. */
const capturas = new Map<string, Promise<string | null>>()

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']

/** «2026-10-28 14:32» → «hoy 14:32», «ayer 14:32» o «28 oct». */
export function fechaComentario(f: string | null, conHora = false): string {
  const m = f ? /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{2}))?/.exec(f) : null
  if (!m) return f ?? ''
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const hoy = new Date()
  const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1)
  const hora = m[4] ? `${m[4].padStart(2, '0')}:${m[5]}` : ''
  if (d.toDateString() === hoy.toDateString()) return hora ? `hoy ${hora}` : 'hoy'
  if (d.toDateString() === ayer.toDateString()) return hora ? `ayer ${hora}` : 'ayer'
  const dia = `${d.getDate()} ${MESES[d.getMonth()]}${d.getFullYear() === hoy.getFullYear() ? '' : ` ${d.getFullYear()}`}`
  return conHora && hora ? `${dia} ${hora}` : dia
}

function fechaConexion(iso: string | null): string {
  if (!iso) return 'nunca se conectó'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'nunca se conectó'
  const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `conectada por última vez ${fechaComentario(local, true)}`
}

/** El archivo sin carpetas, para la fila: `Tarjeta.jsx:6`. */
const corto = (a: { ruta: string; linea: number }) => `${a.ruta.split('/').at(-1)}:${a.linea}`

/** La maqueta como la nombra la sección Diseño: `pantallas/mapa.html` → `mapa.html`. */
const maquetaCorta = (ruta: string) => ruta.replace(/^docs\/diseno\//, '').replace(/^pantallas\//, '')

export function useCaptura(ruta: string, codigo: string, conCaptura: boolean): string | null | undefined {
  const clave = `${ruta}|${codigo}`
  const [url, setUrl] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    if (!conCaptura) return
    let vigente = true
    let p = capturas.get(clave)
    if (!p) {
      p = window.iridium.capturaComentario(ruta, codigo).catch(() => null)
      capturas.set(clave, p)
    }
    void p.then((u) => vigente && setUrl(u))
    return () => {
      vigente = false
    }
  }, [ruta, codigo, clave, conCaptura])
  return conCaptura ? url : null
}

/** La captura del comentario; si no tiene, el recuadro punteado «sin captura». */
export function Captura({
  ruta,
  codigo,
  conCaptura,
  clase = '',
}: {
  ruta: string
  codigo: string
  conCaptura: boolean
  clase?: string
}) {
  const url = useCaptura(ruta, codigo, conCaptura)
  if (url === null)
    return (
      <span className={`cap falta ${clase}`}>
        <span>
          <Icono nombre="imagen" />
          sin captura
        </span>
      </span>
    )
  return (
    <span className={`cap ${clase}`} aria-busy={url === undefined}>
      {url && <img src={url} alt={`Captura de ${codigo}`} />}
    </span>
  )
}

/** Cómo está un comentario, con las palabras de los filtros. */
function Estado({ c, conFecha = false }: { c: VistaComentario; conFecha?: boolean }) {
  if (c.estado === 'cerrado')
    return (
      <span className="senal verde">
        <Icono nombre="check" />
        hecho{conFecha && c.cierre ? ` ${fechaComentario(c.cierre.fecha)}` : ''}
      </span>
    )
  if (c.estado === 'anotado')
    return (
      <span className="senal" title="Quedó en un plan: se cierra cuando esté hecho">
        <Icono nombre="docs" />
        anotado{conFecha && c.anotacion ? ` ${fechaComentario(c.anotacion.fecha)}` : ''}
      </span>
    )
  return (
    <span className="senal">
      <Icono nombre="circulo" />
      nuevo
    </span>
  )
}

/** Mandar el comentario a la sesión del proyecto: si la IA trabaja, entra en su turno. */
function useMandar(ruta: string, codigo: string) {
  const [envio, setEnvio] = useState<ResultadoEnvio | 'enviando' | null>(null)
  const mandar = async () => {
    setEnvio('enviando')
    setEnvio(await window.iridium.enviarComentario(ruta, codigo).catch(() => 'no-existe' as const))
  }
  return { envio, mandar, reiniciar: () => setEnvio(null) }
}

/** Lo que pasó al mandarlo, como señal; o el botón, si todavía no se mandó (o falló). */
function Mandar({
  envio,
  mandar,
  nombre,
}: {
  envio: ResultadoEnvio | 'enviando' | null
  mandar: () => void
  nombre: string
}) {
  if (envio === 'enviado')
    return (
      <span className="senal verde" role="status">
        <Icono nombre="check" />
        enviado a la sesión de {nombre}
      </span>
    )
  if (envio === 'sin-sesion')
    return (
      <span className="senal" role="status">
        <Icono nombre="espera" />
        sin sesión abierta: la IA lo ve al empezar
      </span>
    )
  return (
    <>
      {envio === 'no-existe' && (
        <span className="senal rojo" role="alert">
          <Icono nombre="error" />
          no se pudo enviar
        </span>
      )}
      <button
        type="button"
        className="boton sin-fondo chico"
        disabled={envio === 'enviando'}
        title="Mandarlo a la sesión de este proyecto: si la IA trabaja, entra en su turno"
        onClick={mandar}
      >
        Mandar a la IA
      </button>
    </>
  )
}

function Fila({
  ruta,
  c,
  nombre,
  conEstado,
}: {
  ruta: string
  c: VistaComentario
  nombre: string
  conEstado: boolean
}) {
  const abrirComentario = usarEstado((s) => s.abrirComentario)
  const { envio, mandar } = useMandar(ruta, c.codigo)
  const cerrado = c.estado === 'cerrado'
  return (
    <li className="fila se-abre rv-fila" data-codigo={c.codigo}>
      <button type="button" className="rv-abrir" onClick={() => abrirComentario(ruta, c.codigo)}>
        <Captura ruta={ruta} codigo={c.codigo} conCaptura={c.conCaptura} />
        <span className="rv-texto">
          <span className="cuenta">
            {c.codigo} · {fechaComentario(c.dejado, true)}
            {c.reabierto && <span className="rv-reabierto"> · reabierto</span>}
          </span>
          <span className="rv-dicho">{c.texto}</span>
          <span className="rv-donde">
            {c.maqueta ? (
              <>
                la maqueta <code>{maquetaCorta(c.maqueta.ruta)}</code>
                {!c.maqueta.existe && ' · ya no está'}
              </>
            ) : c.archivo ? (
              <>
                <code>{corto(c.archivo)}</code>
                {!c.archivo.existe && ' · el archivo ya no está'}
              </>
            ) : (
              (c.pagina ?? 'sin archivo ni página')
            )}
          </span>
          {c.cierre?.que && <span className="rv-hizo">{c.cierre.que.replace(/`/g, '')}</span>}
          {c.anotacion?.que && <span className="rv-hizo anotado">{c.anotacion.que.replace(/`/g, '')}</span>}
        </span>
      </button>
      {conEstado && <Estado c={c} />}
      {!cerrado && (
        <span className={envio ? 'acciones siempre' : 'acciones'}>
          <Mandar envio={envio} mandar={() => void mandar()} nombre={nombre} />
        </span>
      )}
    </li>
  )
}

function Ilegible({ nombre }: { nombre: string }) {
  return (
    <li className="recuadro error rv-ilegible" role="alert">
      <Icono nombre="error" />
      <span className="cuerpo-recuadro">
        <strong>No se pudo leer este comentario</strong>
        <span>
          <code>docs/revision/{nombre}</code>: le falta el título o la línea del estado. El resto se muestra
          igual.
        </span>
      </span>
    </li>
  )
}

/** H-R7: el proyecto es Electron y todavía no carga la línea. Pedírselo a la IA escribe el pedido, sin enviarlo. */
function AvisoElectron({ ruta }: { ruta: string }) {
  const escribirEnCampo = usarEstado((s) => s.escribirEnCampo)
  return (
    <div className="recuadro aviso rv-electron" role="note">
      <Icono nombre="atomo" />
      <div className="cuerpo-recuadro">
        <strong>Esta app es Electron y todavía no carga la extensión</strong>
        <span>
          Hace falta una línea en el arranque de la app. Si Iridium no está instalado, la línea no hace nada.
        </span>
        <div className="acciones-recuadro">
          <button
            type="button"
            className="boton secundario chico"
            title="Escribe el pedido en la conversación, sin enviarlo"
            onClick={() =>
              escribirEnCampo(
                ruta,
                'Agrega al proceso principal de la app la línea de la Revisión de Iridium, como pide el framework (referencias/07-construccion.md › Antes de empezar).',
              )
            }
          >
            Pedírselo a la IA
          </button>
        </div>
      </div>
    </div>
  )
}

/** La «i» de la cabecera: cómo se comenta y cómo está la extensión (D-108: no ocupa lugar si anda). */
function Ayuda({ extension }: { extension: string | null }) {
  const ayuda = `F8 activa el modo comentar en cualquier pantalla de la app. Extensión: ${fechaConexion(extension)}.`
  return (
    <button type="button" className="info rv-ayuda" aria-label={ayuda}>
      <Icono nombre="duda" />
      <span className="globo" aria-hidden="true">
        {ayuda}
      </span>
    </button>
  )
}

function Vacio({ ruta, l }: { ruta: string; l: Extract<ListaComentarios, { tipo: 'ok' }> }) {
  return (
    <>
      <Cabecera titulo="Revisión" />
      <div className="rv-contenido">
        {l.electron.esElectron && !l.electron.cargaLinea && <AvisoElectron ruta={ruta} />}
        <div className="recuadro vacio rv-vacia">
          <strong>Sin comentarios</strong>
          <span>
            Pulsa <kbd>F8</kbd> en cualquier pantalla de la app y toca lo que quieras cambiar.
          </span>
          {l.extension ? (
            <span className="rv-extension">Extensión: {fechaConexion(l.extension)}</span>
          ) : (
            <ol className="rv-pasos">
              <li>
                Instala la extensión una vez en Chrome o Edge: en los Scripts de Iridium, «Instalar la
                extensión de Revisión».
              </li>
              <li>
                Abre la app en modo desarrollo (<code>localhost</code>, o la app Electron con la línea).
              </li>
              <li>Con Iridium abierto, pulsa F8 o el botón de la extensión.</li>
            </ol>
          )}
        </div>
      </div>
    </>
  )
}

function Reabrir({ ruta, codigo, cerrar }: { ruta: string; codigo: string; cerrar: () => void }) {
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirmar = async () => {
    setEnviando(true)
    try {
      await window.iridium.reabrirComentario(ruta, codigo, nota)
      cerrar()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setEnviando(false)
    }
  }
  return (
    <div className="recuadro rv-reabrir">
      <div className="cuerpo-recuadro">
        <label className="etiqueta-campo">
          <span>
            ¿Qué falta? <span className="rv-opcional">(opcional)</span>
          </span>
          <textarea
            className="area"
            // biome-ignore lint/a11y/noAutofocus: se abre al tocar Reabrir, para escribir enseguida.
            autoFocus
            placeholder="Por ejemplo: en el celular sigue chico"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) void confirmar()
              if (e.key === 'Escape') cerrar()
            }}
          />
        </label>
        {error && (
          <span className="senal rojo" role="alert">
            No se pudo reabrir: {error}
          </span>
        )}
        <div className="acciones-recuadro">
          <button type="button" className="boton sin-fondo chico" onClick={cerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton secundario chico"
            disabled={enviando}
            onClick={() => void confirmar()}
          >
            <Icono nombre="reabrir" />
            Reabrir
          </button>
        </div>
      </div>
    </div>
  )
}

const ICONO_HISTORIA = (t: string) =>
  /^cerrad/i.test(t)
    ? 'check'
    : /^anotad/i.test(t)
      ? 'docs'
      : /^reabiert/i.test(t)
        ? 'reabrir'
        : /^enviad/i.test(t)
          ? 'enviar'
          : 'circulo'

function Detalle({ ruta, c, nombre }: { ruta: string; c: VistaComentario; nombre: string }) {
  const abrirArchivo = usarEstado((s) => s.abrirArchivo)
  const abrirMaqueta = usarEstado((s) => s.abrirMaqueta)
  const [reabriendo, setReabriendo] = useState(false)
  const { envio, mandar, reiniciar } = useMandar(ruta, c.codigo)
  const cerrado = c.estado === 'cerrado'
  // Si cambia de estado (la IA lo cerró, o se reabrió), las acciones vuelven a empezar.
  // biome-ignore lint/correctness/useExhaustiveDependencies: se reinicia solo cuando cambia el estado.
  useEffect(() => {
    setReabriendo(false)
    reiniciar()
  }, [c.estado])
  return (
    <div className="rv-detalle">
      <div className="rv-barra">
        <BotonAtras ruta={ruta} />
        <span className="rv-codigo">{c.codigo}</span>
        <Estado c={c} />
        <div className="rv-acciones">
          {cerrado && !reabriendo && (
            <button type="button" className="boton secundario chico" onClick={() => setReabriendo(true)}>
              <Icono nombre="reabrir" />
              Reabrir
            </button>
          )}
          {!cerrado && <Mandar envio={envio} mandar={() => void mandar()} nombre={nombre} />}
        </div>
      </div>
      <div className="rv-cuerpo">
        <Captura ruta={ruta} codigo={c.codigo} conCaptura={c.conCaptura} clase="grande" />
        <div className="rv-lado">
          <p className="rv-comentario">{c.texto}</p>
          {reabriendo && <Reabrir ruta={ruta} codigo={c.codigo} cerrar={() => setReabriendo(false)} />}
        </div>
      </div>
      <dl className="rv-pistas">
        <dt>Dónde</dt>
        <dd>
          {c.maqueta ? (
            c.maqueta.existe ? (
              <button
                type="button"
                className="enlace-archivo"
                title="Abrirla grande en Diseño"
                onClick={() => c.maqueta && abrirMaqueta(ruta, c.maqueta.ruta.replace(/^docs\/diseno\//, ''))}
              >
                la maqueta {c.maqueta.ruta}
              </button>
            ) : (
              <>
                <span className="ya-no">la maqueta {c.maqueta.ruta}</span> · ya no está
              </>
            )
          ) : c.archivo ? (
            c.archivo.existe ? (
              <button
                type="button"
                className="enlace-archivo"
                title="Abrir en Archivos, en esa línea"
                onClick={() => c.archivo && abrirArchivo(ruta, c.archivo.ruta, c.archivo.linea)}
              >
                {c.archivo.ruta}, línea {c.archivo.linea}
              </button>
            ) : (
              <>
                <span className="ya-no">
                  {c.archivo.ruta}, línea {c.archivo.linea}
                </span>{' '}
                · ya no está
              </>
            )
          ) : (
            <span>sin archivo ni línea (la página no dio su código)</span>
          )}
          {c.componentes.length > 0 && (
            <>
              {' '}
              · <code>{c.componentes.join(' › ')}</code>
            </>
          )}
        </dd>
        {(c.pagina || c.elemento) && (
          <>
            <dt>Página</dt>
            <dd>
              {c.pagina && <code>{c.pagina}</code>}
              {c.pagina && c.elemento && ' · '}
              {c.elemento && <span>{c.elemento.replace(/`/g, '')}</span>}
            </dd>
          </>
        )}
        <dt>Historia</dt>
        <dd>
          <ul className="rv-historia">
            {c.historia.map((h, i) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: la historia solo crece al final.
                key={i}
                className={/^cerrad/i.test(h.texto) ? 'cerro' : ''}
              >
                <Icono nombre={ICONO_HISTORIA(h.texto)} />
                <span>
                  {h.texto} · <time>{fechaComentario(h.fecha, true)}</time>
                </span>
              </li>
            ))}
          </ul>
        </dd>
      </dl>
    </div>
  )
}

function Cargando() {
  return (
    <>
      <Cabecera titulo="Revisión" />
      <div className="rv-contenido" aria-busy="true">
        <ul className="filas con-lineas">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="fila rv-silueta">
              <i />
              <span>
                <i style={{ width: '80%' }} />
                <i style={{ width: '55%' }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export function Revision({ ruta }: { ruta: string }) {
  const elegido = usarEstado((s) => vistaDe(s.vistas, ruta).comentario)
  const nombre = usarEstado((s) =>
    s.lista?.tipo === 'lista' ? (s.lista.proyectos.find((p) => p.ruta === ruta)?.nombre ?? '') : '',
  )
  const [l, setL] = useState<ListaComentarios | null>(() => leidas.get(ruta) ?? null)
  const [grupo, setGrupo] = useState('nuevos')
  const leer = useCallback(() => {
    void window.iridium.comentarios(ruta).then((r) => {
      leidas.set(ruta, r)
      setL(r)
    })
  }, [ruta])
  useEffect(leer, [leer])
  // Cuando la IA cierra uno (o llega uno nuevo), la lista cambia sola.
  useDocsCambian(ruta, leer)

  if (!l) return <Cargando />
  if (l.tipo === 'error')
    return (
      <>
        <Cabecera titulo="Revisión" />
        <div className="rv-contenido">
          <div className="recuadro error" role="alert">
            <Icono nombre="error" />
            <div className="cuerpo-recuadro">
              <strong>No se pudieron leer los comentarios</strong>
              <span>{l.mensaje}</span>
            </div>
          </div>
        </div>
      </>
    )

  if (elegido) {
    const c = l.comentarios.find((x) => x.codigo === elegido)
    if (c) return <Detalle key={c.codigo} ruta={ruta} c={c} nombre={nombre} />
    return (
      <div className="rv-detalle">
        <div className="rv-barra">
          <BotonAtras ruta={ruta} />
          <span className="rv-codigo">{elegido}</span>
        </div>
        <div className="recuadro vacio">
          <span>Este comentario ya no está en docs/revision/.</span>
        </div>
      </div>
    )
  }

  if (l.comentarios.length === 0 && l.ilegibles.length === 0) return <Vacio ruta={ruta} l={l} />

  const nuevos = l.comentarios.filter((c) => c.estado === 'abierto')
  const anotados = l.comentarios.filter((c) => c.estado === 'anotado')
  const hechos = l.comentarios.filter((c) => c.estado === 'cerrado')
  const mostrar =
    grupo === 'nuevos'
      ? nuevos
      : grupo === 'anotados'
        ? anotados
        : grupo === 'hechos'
          ? hechos
          : l.comentarios
  return (
    <>
      <Cabecera
        titulo="Revisión"
        acciones={<Ayuda extension={l.extension} />}
        filtros={
          <Filtros
            etiqueta="Grupo"
            elegido={grupo}
            elegir={setGrupo}
            filtros={[
              { clave: 'nuevos', nombre: 'Nuevos', n: nuevos.length },
              {
                clave: 'anotados',
                nombre: 'Anotados',
                n: anotados.length,
                titulo: 'Quedaron en un plan: se cierran cuando estén hechos',
              },
              { clave: 'hechos', nombre: 'Hechos', n: hechos.length },
              { clave: 'todos', nombre: 'Todos', n: l.comentarios.length },
            ]}
          />
        }
      />
      <div className="rv-contenido">
        {l.electron.esElectron && !l.electron.cargaLinea && <AvisoElectron ruta={ruta} />}
        <ul className="filas con-lineas rv-filas">
          {mostrar.map((c) => (
            <Fila key={c.codigo} ruta={ruta} c={c} nombre={nombre} conEstado={grupo === 'todos'} />
          ))}
          {l.ilegibles.map((n) => (
            <Ilegible key={n} nombre={n} />
          ))}
        </ul>
        {mostrar.length === 0 && l.ilegibles.length === 0 && (
          <div className="recuadro vacio">
            <span>
              {grupo === 'nuevos'
                ? 'Nada nuevo: lo que comentes con F8 aparece aquí.'
                : grupo === 'anotados'
                  ? 'Ninguno anotado.'
                  : 'Ninguno hecho todavía.'}
            </span>
          </div>
        )}
      </div>
    </>
  )
}
