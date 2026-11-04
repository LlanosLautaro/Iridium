// Revisión (modulos/revision/ux.md › W-R3, H-R5, H-R7): los comentarios que el usuario dejó sobre la app, en Abiertos y
// Cerrados, del más nuevo al más viejo. Uno elegido se ve entero: la captura grande, el texto, las pistas y su historia;
// un abierto se puede Enviar ahora y un cerrado, Reabrir con una nota. La lista se relee sola cuando la IA cierra uno.
// Nada se borra desde acá.
import { useCallback, useEffect, useState } from 'react'
import type { ListaComentarios, ResultadoEnvio, VistaComentario } from '../../../compartido/puente'
import { usarEstado, vistaDe } from '../../estado'
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
  if (!iso) return 'nunca conectada'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'nunca conectada'
  const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `conectada por última vez ${fechaComentario(local, true)}`
}

/** El archivo sin carpetas, para la fila: `Tarjeta.jsx:6`. */
const corto = (a: { ruta: string; linea: number }) => `${a.ruta.split('/').at(-1)}:${a.linea}`

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

function Fila({ ruta, c }: { ruta: string; c: VistaComentario }) {
  const abrirComentario = usarEstado((s) => s.abrirComentario)
  const cerrado = c.estado === 'cerrado'
  return (
    <button type="button" className="fila-com" onClick={() => abrirComentario(ruta, c.codigo)}>
      <Captura ruta={ruta} codigo={c.codigo} conCaptura={c.conCaptura} />
      <div>
        <div className="txt">{c.texto}</div>
        <div className="donde">
          {c.archivo ? (
            <>
              <code>{corto(c.archivo)}</code>
              {!c.archivo.existe && <span>· el archivo ya no está</span>}
            </>
          ) : (
            <span>{c.pagina ?? 'sin archivo ni página'}</span>
          )}
          {cerrado && c.dejado && <span>· dejado {fechaComentario(c.dejado)}</span>}
        </div>
        {c.cierre?.que && (
          <div className="hizo">
            <Icono nombre="check" />
            <span>{c.cierre.que}</span>
          </div>
        )}
      </div>
      <div className="meta-der">
        {cerrado ? (
          <span className="chip ok">
            <Icono nombre="check" />
            cerrado{c.cierre ? ` ${fechaComentario(c.cierre.fecha)}` : ''}
          </span>
        ) : (
          <time>{fechaComentario(c.dejado)}</time>
        )}
        <span className="cod-r">{c.codigo}</span>
        {c.reabierto && (
          <span className="reab">
            <Icono nombre="reabrir" />
            reabierto
          </span>
        )}
      </div>
    </button>
  )
}

function Ilegible({ nombre }: { nombre: string }) {
  return (
    <div className="fila-com rota">
      <div>
        <b>
          <Icono nombre="espera" />
          No se pudo leer este comentario
        </b>{' '}
        · <code>docs/revision/{nombre}</code>: le falta el título o la línea del estado. El resto se muestra
        igual.
      </div>
    </div>
  )
}

/** H-R7: el proyecto es Electron y todavía no carga la línea. Pedírselo a la IA escribe el pedido, sin enviarlo. */
function AvisoElectron({ ruta }: { ruta: string }) {
  const escribirEnCampo = usarEstado((s) => s.escribirEnCampo)
  return (
    <div className="electron">
      <Icono nombre="atomo" />
      <div>
        <b>Esta app es Electron y todavía no carga la extensión.</b>
        <p>
          Hace falta una línea en el arranque de la app. Si Iridium no está instalado, la línea no hace nada.
        </p>
      </div>
      <button
        type="button"
        className="btn secundario chico sigue"
        title="Escribe el pedido en la conversación, sin enviarlo"
        onClick={() =>
          escribirEnCampo(
            ruta,
            'Agregá al proceso principal de la app la línea de la Revisión de Iridium, como pide la guía hitos-desarrollo-app (references/07-construccion.md › Revisión de Iridium).',
          )
        }
      >
        Pedírselo a la IA
      </button>
    </div>
  )
}

function Vacio({ ruta, l }: { ruta: string; l: Extract<ListaComentarios, { tipo: 'ok' }> }) {
  return (
    <div className="rev-vacio">
      {l.electron.esElectron && !l.electron.cargaLinea && <AvisoElectron ruta={ruta} />}
      <h2>Todavía no hay comentarios</h2>
      <p>
        Abrí la app en modo desarrollo y apretá <kbd>F8</kbd>. Señalás una parte, escribís qué le pasa y llega
        acá.
      </p>
      <ol className="pasos">
        <li>
          <span>1</span>
          <div>
            Instalá la extensión una vez en Chrome o Edge: en el <code>scripts.md</code> de Iridium, «Instalar
            la extensión de Revisión».
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            Abrí la app en modo desarrollo (<code>localhost</code>, o la app Electron con la línea).
          </div>
        </li>
        <li>
          <span>3</span>
          <div>Con Iridium abierto, apretá F8 o el botón de la extensión.</div>
        </li>
      </ol>
      <div className="conexion">
        <Icono nombre="enchufe" />
        Extensión: {fechaConexion(l.extension)}
      </div>
    </div>
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
    <div className="reabrir">
      <label htmlFor={`nota-${codigo}`}>
        ¿Qué falta? <span className="opc">(opcional)</span>
      </label>
      <textarea
        id={`nota-${codigo}`}
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
      {error && (
        <p className="mal" role="alert">
          No se pudo reabrir: {error}
        </p>
      )}
      <div className="pie">
        <button type="button" className="btn secundario chico" onClick={cerrar}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn secundario chico sigue"
          disabled={enviando}
          onClick={() => void confirmar()}
        >
          <Icono nombre="reabrir" />
          Reabrir
        </button>
      </div>
    </div>
  )
}

const ICONO_HISTORIA = (t: string) =>
  /^cerrad/i.test(t) ? 'check' : /^reabiert/i.test(t) ? 'reabrir' : /^enviad/i.test(t) ? 'enviar' : 'circulo'

function Detalle({ ruta, c, nombre }: { ruta: string; c: VistaComentario; nombre: string }) {
  const abrirArchivo = usarEstado((s) => s.abrirArchivo)
  const [reabriendo, setReabriendo] = useState(false)
  const [envio, setEnvio] = useState<ResultadoEnvio | 'enviando' | null>(null)
  const cerrado = c.estado === 'cerrado'
  // Si cambia de estado (la IA lo cerró, o se reabrió), las acciones vuelven a empezar.
  // biome-ignore lint/correctness/useExhaustiveDependencies: se reinicia solo cuando cambia el estado.
  useEffect(() => {
    setReabriendo(false)
    setEnvio(null)
  }, [c.estado])
  const enviar = async () => {
    setEnvio('enviando')
    setEnvio(await window.iridium.enviarComentario(ruta, c.codigo).catch(() => 'no-existe' as const))
  }
  return (
    <div className="rev-det">
      <div className="det-barra">
        <BotonAtras ruta={ruta} />
        <span className="cod-r">{c.codigo}</span>
        {cerrado ? (
          <span className="chip ok">
            <Icono nombre="check" />
            cerrado
          </span>
        ) : (
          <span className="chip neutro">
            <Icono nombre="circulo" />
            abierto
          </span>
        )}
        <div className="acc">
          {cerrado && !reabriendo && (
            <button type="button" className="btn secundario chico" onClick={() => setReabriendo(true)}>
              <Icono nombre="reabrir" />
              Reabrir
            </button>
          )}
          {!cerrado && envio === 'enviado' && (
            <span className="chip ok" role="status">
              <Icono nombre="check" />
              enviado a la sesión de {nombre}
            </span>
          )}
          {!cerrado && envio === 'sin-sesion' && (
            <span className="chip neutro" role="status">
              <Icono nombre="espera" />
              sin sesión abierta: la IA lo ve al empezar
            </span>
          )}
          {!cerrado && envio === 'no-existe' && (
            <span className="chip error" role="alert">
              <Icono nombre="error" />
              no se pudo enviar
            </span>
          )}
          {!cerrado && envio !== 'enviado' && envio !== 'sin-sesion' && (
            <button
              type="button"
              className="btn secundario chico"
              disabled={envio === 'enviando'}
              title="Mandarlo a la sesión de este proyecto: si la IA trabaja, entra en su turno"
              onClick={() => void enviar()}
            >
              <Icono nombre="enviar" />
              Enviar ahora
            </button>
          )}
        </div>
      </div>
      <div className="det-cuerpo">
        <Captura ruta={ruta} codigo={c.codigo} conCaptura={c.conCaptura} clase="grande" />
        <div>
          <p className="texto">{c.texto}</p>
          {reabriendo && <Reabrir ruta={ruta} codigo={c.codigo} cerrar={() => setReabriendo(false)} />}
        </div>
      </div>
      <dl className="pistas">
        <dt>Dónde</dt>
        <dd>
          {c.archivo ? (
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
          <ul className="historia">
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
    <div className="rev" aria-busy="true">
      <div className="rev-cab">
        <h2>Revisión</h2>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="silueta">
          <i />
          <div>
            <i style={{ width: '80%' }} />
            <i style={{ width: '55%' }} />
            <i style={{ width: '30%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Revision({ ruta }: { ruta: string }) {
  const elegido = usarEstado((s) => vistaDe(s.vistas, ruta).comentario)
  const nombre = usarEstado((s) =>
    s.lista?.tipo === 'lista' ? (s.lista.proyectos.find((p) => p.ruta === ruta)?.nombre ?? '') : '',
  )
  const [l, setL] = useState<ListaComentarios | null>(() => leidas.get(ruta) ?? null)
  const [grupo, setGrupo] = useState<'abiertos' | 'cerrados'>('abiertos')
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
      <div className="rev">
        <p className="mal" role="alert">
          No se pudieron leer los comentarios: {l.mensaje}
        </p>
      </div>
    )

  if (elegido) {
    const c = l.comentarios.find((x) => x.codigo === elegido)
    if (c) return <Detalle key={c.codigo} ruta={ruta} c={c} nombre={nombre} />
    return (
      <div className="rev-det">
        <div className="det-barra">
          <BotonAtras ruta={ruta} />
          <span className="cod-r">{elegido}</span>
        </div>
        <p className="ninguno">Este comentario ya no está en docs/revision/.</p>
      </div>
    )
  }

  if (l.comentarios.length === 0 && l.ilegibles.length === 0) return <Vacio ruta={ruta} l={l} />

  const abiertos = l.comentarios.filter((c) => c.estado === 'abierto')
  const cerrados = l.comentarios.filter((c) => c.estado === 'cerrado')
  const mostrar = grupo === 'abiertos' ? abiertos : cerrados
  return (
    <div className="rev">
      <div className="rev-cab">
        <h2>Revisión</h2>
        <fieldset className="grupos" aria-label="Grupo">
          <button type="button" aria-pressed={grupo === 'abiertos'} onClick={() => setGrupo('abiertos')}>
            Abiertos <span>{abiertos.length}</span>
          </button>
          <button type="button" aria-pressed={grupo === 'cerrados'} onClick={() => setGrupo('cerrados')}>
            Cerrados <span>{cerrados.length}</span>
          </button>
        </fieldset>
        <span className="ext-est">
          <Icono nombre="enchufe" />
          Extensión {fechaConexion(l.extension)}
        </span>
      </div>
      {l.electron.esElectron && !l.electron.cargaLinea && <AvisoElectron ruta={ruta} />}
      <div className="filas-com">
        {mostrar.length ? (
          mostrar.map((c) => <Fila key={c.codigo} ruta={ruta} c={c} />)
        ) : (
          <div className="ninguno">Ninguno.</div>
        )}
        {l.ilegibles.map((n) => (
          <Ilegible key={n} nombre={n} />
        ))}
      </div>
    </div>
  )
}
