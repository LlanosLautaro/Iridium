// Git (H-16, D-041, Q-75): como el control de código de VS Code. A la izquierda, la rama, si está solo en la PC o
// también en GitHub, y secciones que se pliegan: Cambios (lo sin guardar, archivo por archivo) e Historial (con los
// commits sin subir marcados). A la derecha, lo elegido: un archivo con su antes y después, o un commit con sus
// archivos, que muestran el antes y después al abrirlos (Q-61). Además de mirar: crear el repositorio y publicarlo
// en GitHub (D-081), y Commit y subir y Sincronizar (D-159); se relee sola mientras se mira.
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { fechaExacta, fechaRelativa } from '../../../compartido/fechas'
import type {
  ArchivoGit,
  CambioArchivoGit,
  CommitGit,
  DetalleCommit,
  DiferenciaGit,
  GitProyecto,
  RemotoGit,
  ResultadoGit,
} from '../../../compartido/puente'
import { LARGO_MENSAJE, mensajeSugerido, textoDeSincronia } from '../../../compartido/sincronia'
import { usarEstado, vistaDe } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { useDocsCambian } from './enlaces'
import { PublicarGithub, SinRepositorio } from './PublicarGithub'

const SIN_GUARDAR = 'sin-guardar'
/** Mientras se mira, cada cuánto se relee (la IA puede estar guardando commits). */
const RELEER_MS = 4000

/** Lo ya leído de cada proyecto: se muestra en el acto y se relee al entrar. */
const leidos = new Map<string, GitProyecto>()

const LETRA: Record<CambioArchivoGit, { letra: string; titulo: string }> = {
  nuevo: { letra: 'A', titulo: 'Nuevo' },
  modificado: { letra: 'M', titulo: 'Modificado' },
  borrado: { letra: 'D', titulo: 'Borrado' },
  otro: { letra: '!', titulo: 'En conflicto u otro cambio' },
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

function autores(c: CommitGit): string {
  return c.coautores.length ? `${c.autor} con ${c.coautores.join(', ')}` : c.autor
}

function useGit(ruta: string, visible: boolean): [GitProyecto | null, () => void] {
  const [g, setG] = useState<GitProyecto | null>(() => leidos.get(ruta) ?? null)
  const trabaja = usarEstado((s) => s.fichas.find((f) => f.ruta === ruta)?.estado ?? null)
  const leer = useCallback(() => {
    void window.iridium.git(ruta).then((r) => {
      leidos.set(ruta, r)
      setG(r)
    })
  }, [ruta])
  // Al mostrarse, cuando la sesión cambia de estado y, mientras se mira, cada tanto.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `trabaja` solo dispara la relectura.
  useEffect(() => {
    if (!visible) return
    leer()
    const t = window.setInterval(() => document.hasFocus() && leer(), RELEER_MS)
    return () => window.clearInterval(t)
  }, [visible, leer, trabaja])
  useDocsCambian(
    ruta,
    useCallback(() => visible && leer(), [visible, leer]),
  )
  return [g, leer]
}

function Numeros({ a }: { a: ArchivoGit }) {
  if (a.mas === null && a.menos === null)
    return <span className="git-cuenta">{a.cambio === 'borrado' ? '' : 'binario'}</span>
  return (
    <span className="git-cuenta">
      <span className="mas" title={`${a.mas ?? 0} líneas agregadas`}>
        +{a.mas ?? 0}
      </span>
      <span className="menos" title={`${a.menos ?? 0} líneas quitadas`}>
        −{a.menos ?? 0}
      </span>
    </span>
  )
}

function Letra({ cambio }: { cambio: CambioArchivoGit }) {
  const l = LETRA[cambio]
  return (
    <span className={`letra ${cambio}`} title={l.titulo}>
      {l.letra}
    </span>
  )
}

function Diferencia({ ruta, commit, archivo }: { ruta: string; commit: string; archivo: string }) {
  const [d, setD] = useState<DiferenciaGit | null>(null)
  useEffect(() => {
    let vigente = true
    void window.iridium.diferencia(ruta, commit, archivo).then((r) => vigente && setD(r))
    return () => {
      vigente = false
    }
  }, [ruta, commit, archivo])
  if (!d) return <div className="dif-msg" aria-busy="true" />
  if (d.tipo === 'binario')
    return <p className="dif-msg">No es texto: no se puede mostrar el antes y después.</p>
  if (d.tipo === 'vacia') return <p className="dif-msg">Sin líneas cambiadas.</p>
  if (d.tipo === 'error')
    return (
      <p className="dif-msg" role="alert">
        {d.mensaje}
      </p>
    )
  return (
    <div className="dif">
      <table>
        <tbody>
          {d.lineas.map((l, i) =>
            l.tipo === 'tramo' ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: las líneas no cambian de lugar.
              <tr key={i} className="tramo">
                <td colSpan={4}>{l.texto ? `… ${l.texto}` : '…'}</td>
              </tr>
            ) : (
              // biome-ignore lint/suspicious/noArrayIndexKey: las líneas no cambian de lugar.
              <tr key={i} className={l.tipo}>
                <td className="num">{l.viejo ?? ''}</td>
                <td className="num">{l.nuevo ?? ''}</td>
                <td className="signo" aria-hidden="true">
                  {l.tipo === 'agregada' ? '+' : l.tipo === 'quitada' ? '−' : ''}
                </td>
                <td className="txt">
                  {l.tipo === 'agregada' && <span className="solo-lector">agregada: </span>}
                  {l.tipo === 'quitada' && <span className="solo-lector">quitada: </span>}
                  {l.texto}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
      {d.cortada && <p className="dif-msg">Es muy largo: se muestra solo el comienzo.</p>}
    </div>
  )
}

/** Los archivos de lo elegido; cada uno se abre para ver su antes y después. */
function ListaArchivos({ ruta, commit, archivos }: { ruta: string; commit: string; archivos: ArchivoGit[] }) {
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set())
  // Al cambiar de commit se cierran los archivos abiertos.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `commit` solo dispara el reinicio.
  useEffect(() => setAbiertos(new Set()), [commit])
  const alternar = (r: string) =>
    setAbiertos((a) => {
      const n = new Set(a)
      if (n.has(r)) n.delete(r)
      else n.add(r)
      return n
    })
  return (
    <ul className="archivos-git">
      {archivos.map((a) => {
        const abierto = abiertos.has(a.ruta)
        return (
          <li key={a.ruta} className="arch">
            <button type="button" aria-expanded={abierto} onClick={() => alternar(a.ruta)}>
              <span className="chev">
                <Icono nombre="chev" />
              </span>
              <Letra cambio={a.cambio} />
              <span className="ruta" title={a.ruta}>
                {a.ruta}
              </span>
              <Numeros a={a} />
            </button>
            {abierto && <Diferencia ruta={ruta} commit={commit} archivo={a.ruta} />}
          </li>
        )
      })}
    </ul>
  )
}

function DetalleSinGuardar({ ruta, cambios }: { ruta: string; cambios: ArchivoGit[] }) {
  return (
    <div className="git-det">
      <h2>Cambios sin guardar</h2>
      <div className="meta">
        {plural(cambios.length, 'archivo', 'archivos')} distintos del último commit. La IA los guarda en un
        commit al cerrar su trabajo; lo tuyo, con Commit a la izquierda. Abrí uno para ver qué cambió.
      </div>
      <ListaArchivos ruta={ruta} commit={SIN_GUARDAR} archivos={cambios} />
    </div>
  )
}

/** Un archivo sin guardar elegido en el panel: su antes y después a la vista, como en VS Code. */
function DetalleArchivo({ ruta, a, todos }: { ruta: string; a: ArchivoGit; todos: () => void }) {
  const partes = a.ruta.split('/')
  return (
    <div className="git-det">
      <h2>{partes.at(-1)}</h2>
      <div className="meta">
        {partes.length > 1 && <code>{partes.slice(0, -1).join('/')}/ · </code>}
        {LETRA[a.cambio].titulo}, {a.preparado ? 'preparado para el commit' : 'sin guardar'} ·{' '}
        <button type="button" className="enlace" onClick={todos}>
          Ver todos los cambios
        </button>
      </div>
      <div className="arch">
        <div className="arch-cab">
          <Letra cambio={a.cambio} />
          <span className="ruta" title={a.ruta}>
            {a.ruta}
          </span>
          <Numeros a={a} />
        </div>
        <Diferencia ruta={ruta} commit={SIN_GUARDAR} archivo={a.ruta} />
      </div>
    </div>
  )
}

function DetalleDeCommit({ ruta, c }: { ruta: string; c: CommitGit }) {
  const [d, setD] = useState<{ hash: string; d: DetalleCommit } | null>(null)
  useEffect(() => {
    let vigente = true
    void window.iridium.commit(ruta, c.hash).then((r) => vigente && setD({ hash: c.hash, d: r }))
    return () => {
      vigente = false
    }
  }, [ruta, c.hash])
  const actual = d?.hash === c.hash ? d.d : null
  // El resto del mensaje, sin los coautores (ya están arriba).
  const cuerpo =
    actual?.tipo === 'ok'
      ? actual.mensajeCompleto
          .split('\n')
          .slice(1)
          .filter((l) => !/^co-authored-by:/i.test(l.trim()))
          .join('\n')
          .trim()
      : ''
  return (
    <div className="git-det">
      <h2>{c.mensaje}</h2>
      <div className="meta">
        <code>{c.corto}</code> · <span title={fechaExacta(c.fecha)}>{fechaExacta(c.fecha)}</span> ·{' '}
        {autores(c)} · {plural(c.archivos, 'archivo', 'archivos')}
      </div>
      {cuerpo && <pre className="cuerpo">{cuerpo}</pre>}
      {!actual && <div className="dif-msg" aria-busy="true" />}
      {actual?.tipo === 'no-esta' && <p className="dif-msg">Este commit ya no está en el repositorio.</p>}
      {actual?.tipo === 'error' && (
        <p className="dif-msg" role="alert">
          No se pudo leer: {actual.mensaje}
        </p>
      )}
      {actual?.tipo === 'ok' && actual.archivos.length === 0 && (
        <p className="dif-msg">Este commit no cambió archivos.</p>
      )}
      {actual?.tipo === 'ok' && actual.archivos.length > 0 && (
        <ListaArchivos ruta={ruta} commit={c.hash} archivos={actual.archivos} />
      )}
    </div>
  )
}

function Vacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="vacia">
      <div>
        <b>{titulo}</b>
        {texto}
      </div>
    </div>
  )
}

/** Una sección del panel que se pliega, como las de VS Code. */
function Plegable({
  titulo,
  cuenta,
  plegada,
  alternar,
  alPie = false,
  children,
}: {
  titulo: string
  cuenta: number
  plegada: boolean
  alternar: () => void
  /** Pegada al pie del panel, como la línea de tiempo de VS Code (R-94). */
  alPie?: boolean
  children: ReactNode
}) {
  return (
    <section className={alPie ? 'plegable al-pie' : 'plegable'} aria-label={titulo}>
      <h3>
        <button type="button" aria-expanded={!plegada} onClick={alternar}>
          <span className="chev">
            <Icono nombre="chev" />
          </span>
          <span className="t">{titulo}</span>
          <span className="n">{cuenta}</span>
        </button>
      </h3>
      {!plegada && children}
    </section>
  )
}

/** Si está solo en la PC o también en GitHub, qué falta subir o bajar, y Sincronizar (D-159). */
function Remoto({
  r,
  publicar,
  sincronizar,
}: {
  r: RemotoGit
  publicar: (() => void) | null
  sincronizar: { hacer: () => void; enCurso: boolean; porQueNo: string | null }
}) {
  if (r.tipo === 'local')
    return (
      <div className="remoto" title="El repositorio no tiene ningún remoto: no está en GitHub.">
        <Icono nombre="pc" />
        <div>
          <b>Solo en esta PC</b>
          <small>No está en GitHub.</small>
          <button
            type="button"
            className="boton secundario chico publicar"
            disabled={!publicar}
            title={publicar ? undefined : 'Todavía no tiene commits: no hay nada para publicar.'}
            onClick={publicar ?? undefined}
          >
            <Icono nombre="nube" />
            Publicar en GitHub
          </button>
        </div>
      </div>
    )
  const donde = r.github ? 'GitHub' : 'el remoto'
  const estado: { texto: string; clase: string }[] = []
  if (!r.sigue) estado.push({ texto: `Esta rama no está en ${donde}`, clase: 'espera' })
  if (r.sinSubir > 0)
    estado.push({
      texto: `${r.sinSubir >= 1000 ? '1000+' : r.sinSubir} ${r.sinSubir === 1 ? 'commit' : 'commits'} sin subir`,
      clase: 'espera',
    })
  if (r.sinBajar > 0)
    estado.push({ texto: `${plural(r.sinBajar, 'commit', 'commits')} para bajar`, clase: '' })
  if (estado.length === 0) estado.push({ texto: `Al día con ${donde}`, clase: 'ok' })
  const s = r.sincronia
  const problema =
    s !== null && (s.resultado === 'separada' || s.resultado === 'choca' || s.resultado === 'error')
  const flechas = `${r.sinBajar > 0 ? ` ↓${r.sinBajar}` : ''}${r.sinSubir > 0 ? ` ↑${r.sinSubir >= 1000 ? '1000+' : r.sinSubir}` : ''}`
  return (
    <div
      className="remoto"
      title={`Según la última vez que esta PC se sincronizó con ${donde}${r.sigue ? ` (${r.sigue})` : ''}.`}
    >
      <Icono nombre="nube" />
      <div>
        <b>
          {r.github ? 'En GitHub' : 'En otro servidor'}
          {' · '}
          {r.web ? (
            <a href={r.web} target="_blank" rel="noreferrer">
              {r.nombre}
            </a>
          ) : (
            <span className="nombre">{r.nombre}</span>
          )}
        </b>
        <small>
          {estado.map((e, i) => (
            <span key={e.texto} className={e.clase}>
              {i > 0 ? ' · ' : ''}
              {e.texto}
            </span>
          ))}
        </small>
        {s && (
          <small className={problema ? 'sincronia espera' : 'sincronia'} title={fechaExacta(s.cuando)}>
            {textoDeSincronia(s, donde, fechaRelativa(s.cuando, Date.now()))}
          </small>
        )}
        <button
          type="button"
          className="boton secundario chico publicar"
          disabled={sincronizar.enCurso || sincronizar.porQueNo !== null}
          aria-busy={sincronizar.enCurso}
          title={
            sincronizar.porQueNo ??
            `Trae lo nuevo de ${donde}, lo junta con lo de esta PC y sube los commits que faltan.`
          }
          onClick={sincronizar.hacer}
        >
          <Icono nombre="sync" />
          {sincronizar.enCurso ? 'Sincronizando…' : `Sincronizar${flechas}`}
        </button>
      </div>
    </div>
  )
}

/**
 * Commit y subir (D-159), como el cuadro de VS Code: el mensaje (si queda vacío, el que se propone) y un botón que
 * guarda en un commit los preparados o, si no hay, todos los cambios, y lo sube si el repositorio está en un remoto.
 */
function CajaCommit({
  ruta,
  archivos,
  preparados,
  subir,
  porQueNo,
  terminar,
}: {
  ruta: string
  archivos: ArchivoGit[]
  preparados: boolean
  subir: boolean
  porQueNo: string | null
  terminar: (r: ResultadoGit) => void
}) {
  const [mensaje, setMensaje] = useState('')
  const [enCurso, setEnCurso] = useState(false)
  const sugerido = mensajeSugerido(archivos)
  const que = preparados
    ? plural(archivos.length, 'archivo preparado', 'archivos preparados')
    : plural(archivos.length, 'cambio', 'cambios')
  const hacer = () => {
    if (enCurso || porQueNo) return
    setEnCurso(true)
    void window.iridium
      .guardarGit(ruta, mensaje.trim() || sugerido, subir)
      .then((r) => {
        if (r.tipo === 'ok') setMensaje('')
        terminar(r)
      })
      .finally(() => setEnCurso(false))
  }
  return (
    <div className="caja-commit">
      <textarea
        className="area"
        rows={2}
        maxLength={LARGO_MENSAJE}
        aria-label="Mensaje del commit"
        placeholder={sugerido}
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault()
            hacer()
          }
        }}
      />
      <button
        type="button"
        className="boton principal chico"
        disabled={enCurso || porQueNo !== null}
        aria-busy={enCurso}
        title={
          porQueNo ??
          `Guarda en un commit los ${que}${subir ? ' y lo sube' : ''}. Sin mensaje, va «${sugerido}». (Ctrl+Enter)`
        }
        onClick={hacer}
      >
        <Icono nombre={subir ? 'nube' : 'tilde'} />
        {enCurso ? (subir ? 'Subiendo…' : 'Guardando…') : subir ? 'Commit y subir' : 'Commit'}
      </button>
    </div>
  )
}

/** Un archivo sin guardar en el panel: el nombre, su carpeta tenue y la letra, como en VS Code. */
function FilaArchivo({ a, sel, elegir }: { a: ArchivoGit; sel: boolean; elegir: () => void }) {
  const partes = a.ruta.split('/')
  return (
    <button
      type="button"
      className={sel ? 'arbol-nodo fila-git sel' : 'arbol-nodo fila-git'}
      aria-current={sel}
      title={`${a.ruta} · ${LETRA[a.cambio].titulo}`}
      onClick={elegir}
    >
      <Icono nombre="archivo" />
      <span className="nombre">{partes.at(-1)}</span>
      {partes.length > 1 && <span className="dir">{partes.slice(0, -1).join('/')}</span>}
      <Letra cambio={a.cambio} />
    </button>
  )
}

export function Git({ ruta }: { ruta: string }) {
  return (
    <>
      <Cabecera titulo="Git" />
      <CuerpoGit ruta={ruta} />
    </>
  )
}

function CuerpoGit({ ruta }: { ruta: string }) {
  const visible = usarEstado((s) => s.proyectoAbierto === ruta && vistaDe(s.vistas, ruta).seccion === 'git')
  const elegido = usarEstado((s) => vistaDe(s.vistas, ruta).commit)
  const archivoGit = usarEstado((s) => vistaDe(s.vistas, ruta).archivoGit)
  const plegadas = usarEstado((s) => vistaDe(s.vistas, ruta).gitPlegadas)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const [g, leer] = useGit(ruta, visible)
  const [publicando, setPublicando] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [aviso, setAviso] = useState<{ texto: string; error: boolean } | null>(null)
  const trabaja = usarEstado((s) => s.fichas.find((f) => f.ruta === ruta)?.estado === 'trabajando')
  const ahora = Date.now()
  const listo = (r: ResultadoGit) => {
    if (r.tipo === 'ok') setAviso(r.aviso ? { texto: r.aviso, error: false } : null)
    leer()
  }
  const terminar = (r: ResultadoGit) => {
    if (r.tipo === 'ok') setAviso(r.aviso ? { texto: r.aviso, error: false } : null)
    else setAviso({ texto: r.mensaje, error: true })
    leer()
  }
  const sincronizar = () => {
    setSincronizando(true)
    void window.iridium
      .sincronizarGit(ruta)
      .then(terminar)
      .finally(() => setSincronizando(false))
  }

  if (!g) return <div className="carga" aria-busy="true" />
  if (g.tipo === 'sin-git') return <SinRepositorio ruta={ruta} listo={listo} />
  if (g.tipo === 'sin-programa')
    return (
      <Vacio
        titulo="No se encontró git en la PC"
        texto="Iridium usa el git instalado en Windows para leer el historial. Instalalo (git-scm.com) y volvé a abrir esta sección."
      />
    )
  if (g.tipo === 'error') return <Vacio titulo="No se pudo leer el git del proyecto" texto={g.mensaje} />

  // Lo elegido; si no hay nada (o ya no está), los cambios sin guardar o el último commit.
  const hay = (x: string | null) =>
    x === SIN_GUARDAR ? g.cambios.length > 0 : g.historial.some((c) => c.hash === x)
  const sel =
    elegido && hay(elegido) ? elegido : g.cambios.length > 0 ? SIN_GUARDAR : (g.historial[0]?.hash ?? null)
  const commit = g.historial.find((c) => c.hash === sel) ?? null
  const archivo = sel === SIN_GUARDAR ? (g.cambios.find((a) => a.ruta === archivoGit) ?? null) : null
  const elegir = (x: string, a: string | null = null) => cambiarVista(ruta, { commit: x, archivoGit: a })
  const alternar = (id: string) =>
    cambiarVista(ruta, {
      gitPlegadas: plegadas.includes(id) ? plegadas.filter((x) => x !== id) : [...plegadas, id],
    })
  const preparados = g.cambios.filter((a) => a.preparado)
  const cambios = g.cambios.filter((a) => !a.preparado)
  const fila = (a: ArchivoGit) => (
    <FilaArchivo
      key={a.ruta}
      a={a}
      sel={archivo?.ruta === a.ruta}
      elegir={() => elegir(SIN_GUARDAR, a.ruta)}
    />
  )
  const donde = g.remoto.tipo === 'remoto' && g.remoto.github ? 'GitHub' : 'el remoto'
  // Commit y subir y Sincronizar esperan a la IA (guardarían su trabajo a medias) y necesitan una rama.
  const porQueNo = trabaja
    ? 'La IA está trabajando en este proyecto: esperá a que termine.'
    : g.sinRama
      ? 'No hay una rama elegida: se está mirando un commit suelto.'
      : null

  return (
    <div className="partida git">
      <nav className="arbol-lista" aria-label="Git del proyecto">
        <div
          className="rama"
          title={g.sinRama ? 'No hay una rama elegida: se mira un commit suelto' : 'La rama'}
        >
          <Icono nombre="git" />
          <b>{g.rama || 'sin commits'}</b>
          {g.sinRama && <span className="sub">sin rama</span>}
        </div>
        <Remoto
          r={g.remoto}
          publicar={g.historial.length > 0 ? () => setPublicando(true) : null}
          sincronizar={{ hacer: sincronizar, enCurso: sincronizando, porQueNo }}
        />
        {aviso && (
          <p
            className={aviso.error ? 'aviso-git error' : 'aviso-git'}
            role={aviso.error ? 'alert' : 'status'}
          >
            {aviso.texto}
          </p>
        )}
        {g.cambios.length > 0 && (
          <CajaCommit
            ruta={ruta}
            archivos={preparados.length > 0 ? preparados : g.cambios}
            preparados={preparados.length > 0}
            subir={g.remoto.tipo === 'remoto'}
            porQueNo={porQueNo}
            terminar={terminar}
          />
        )}
        {preparados.length > 0 && (
          <Plegable
            titulo="Preparados"
            cuenta={preparados.length}
            plegada={plegadas.includes('preparados')}
            alternar={() => alternar('preparados')}
          >
            {preparados.map(fila)}
          </Plegable>
        )}
        <Plegable
          titulo="Cambios"
          cuenta={cambios.length}
          plegada={plegadas.includes('cambios')}
          alternar={() => alternar('cambios')}
        >
          {g.cambios.length === 0 ? (
            <div className="arbol-nodo vacio">Nada sin guardar: todo está en commits.</div>
          ) : cambios.length === 0 ? (
            <div className="arbol-nodo vacio">Todo lo cambiado está preparado.</div>
          ) : (
            cambios.map(fila)
          )}
        </Plegable>
        <Plegable
          titulo="Historial"
          cuenta={g.historial.length}
          plegada={plegadas.includes('historial')}
          alternar={() => alternar('historial')}
          alPie
        >
          {g.historial.length === 0 && <div className="arbol-nodo vacio">Todavía no hay commits.</div>}
          {g.historial.map((c) => (
            <button
              key={c.hash}
              type="button"
              className={sel === c.hash ? 'commit sel' : 'commit'}
              aria-current={sel === c.hash}
              title={`${c.mensaje}\n${fechaExacta(c.fecha)} · ${autores(c)}${c.subido === false ? `\nTodavía no está en ${donde}` : ''}`}
              onClick={() => elegir(c.hash)}
            >
              <b>{c.mensaje}</b>
              <small>
                <code>{c.corto}</code> · {fechaRelativa(c.fecha, ahora)} ·{' '}
                {plural(c.archivos, 'archivo', 'archivos')}
                {c.subido === false && <span className="sin-subir"> · sin subir</span>}
              </small>
            </button>
          ))}
          {g.hayMas && <div className="arbol-nodo vacio">Se muestran los últimos {g.historial.length}.</div>}
        </Plegable>
      </nav>
      <div className="visor">
        {archivo && <DetalleArchivo ruta={ruta} a={archivo} todos={() => elegir(SIN_GUARDAR)} />}
        {sel === SIN_GUARDAR && !archivo && <DetalleSinGuardar ruta={ruta} cambios={g.cambios} />}
        {commit && <DetalleDeCommit key={commit.hash} ruta={ruta} c={commit} />}
        {!sel && (
          <Vacio
            titulo="El repositorio está vacío"
            texto="Todavía no tiene commits ni cambios. Cuando la IA guarde su trabajo, aparece acá."
          />
        )}
      </div>
      {publicando && <PublicarGithub ruta={ruta} cerrar={() => setPublicando(false)} listo={listo} />}
    </div>
  )
}
