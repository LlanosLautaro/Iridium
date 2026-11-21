// Git (H-16, D-041, Q-75), como la maqueta (docs/diseno/pantallas/git.html, DI-I3 tanda 13): el panel de Control de
// código fuente de VS Code. La rama va en la Cabecera; a la izquierda, dónde está el repositorio (solo en la PC o en
// GitHub) con Sincronizar o Publicar, el mensaje y Commit y subir (D-159), los cambios con el Árbol (PZ-11) y la letra
// de cada archivo, y el Historial plegado al pie (R-94), donde cada commit se abre con sus archivos (R-95). A la
// derecha, solo el antes y después del archivo elegido; sin archivo elegido, el visor queda cerrado (R-97). Crear el
// repositorio y publicarlo en GitHub (D-081). Se relee sola mientras se mira.
import { Fragment, type ReactNode, useCallback, useEffect, useState } from 'react'
import { fechaExacta, fechaRelativa } from '../../../compartido/fechas'
import type {
  ArchivoGit,
  CambioArchivoGit,
  CommitGit,
  DetalleCommit,
  DiferenciaGit,
  GitProyecto,
  LineaDif,
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

export const LETRA: Record<CambioArchivoGit, { letra: string; titulo: string }> = {
  nuevo: { letra: 'A', titulo: 'Nuevo' },
  modificado: { letra: 'M', titulo: 'Modificado' },
  borrado: { letra: 'D', titulo: 'Borrado' },
  otro: { letra: '!', titulo: 'En conflicto u otro cambio' },
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

function autores(c: CommitGit): string {
  return c.coautores.length ? `${c.autor} con ${c.coautores.join(', ')}` : c.autor
}

export function useGit(ruta: string, visible: boolean): [GitProyecto | null, () => void] {
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
    return <span className="git-numeros">{a.cambio === 'borrado' ? '' : 'binario'}</span>
  return (
    <span className="git-numeros">
      <span className="mas" title={`${a.mas ?? 0} líneas agregadas`}>
        +{a.mas ?? 0}
      </span>
      <span className="menos" title={`${a.menos ?? 0} líneas quitadas`}>
        −{a.menos ?? 0}
      </span>
    </span>
  )
}

/** La letra de Git (A, M, D) con su color; en el Árbol va como su marca, a la derecha. */
function Letra({ cambio, marca = false }: { cambio: CambioArchivoGit; marca?: boolean }) {
  const l = LETRA[cambio]
  return (
    <span className={`${marca ? 'marca ' : ''}git-letra ${cambio}`} title={l.titulo}>
      {l.letra}
    </span>
  )
}

/** Dónde empieza un tramo: «línea 40» y lo que git encontró arriba (la función o el título). */
function zona(lineas: LineaDif[], i: number): string {
  const sig = lineas.slice(i + 1).find((l) => l.tipo !== 'tramo')
  const n = sig ? (sig.nuevo ?? sig.viejo) : null
  return [n !== null ? `línea ${n}` : '', lineas[i]?.texto ?? ''].filter(Boolean).join(' · ')
}

/** El antes y después de un archivo, como la maqueta: las líneas quitadas y agregadas con su fondo. */
function Diferencia({ ruta, commit, archivo }: { ruta: string; commit: string; archivo: string }) {
  const [d, setD] = useState<DiferenciaGit | null>(null)
  useEffect(() => {
    let vigente = true
    void window.iridium.diferencia(ruta, commit, archivo).then((r) => vigente && setD(r))
    return () => {
      vigente = false
    }
  }, [ruta, commit, archivo])
  if (!d) return <div className="git-nota" aria-busy="true" />
  if (d.tipo === 'binario')
    return <p className="git-nota">No es texto: no se puede mostrar el antes y después.</p>
  if (d.tipo === 'vacia') return <p className="git-nota">Sin líneas cambiadas.</p>
  if (d.tipo === 'error')
    return (
      <p className="git-nota error" role="alert">
        {d.mensaje}
      </p>
    )
  return (
    <div className="git-dif">
      {d.lineas.map((l, i) =>
        l.tipo === 'tramo' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: las líneas no cambian de lugar.
          <div key={i} className="zona">
            @@ {zona(d.lineas, i)} @@
          </div>
        ) : (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: las líneas no cambian de lugar.
            key={i}
            className={l.tipo}
            title={
              l.nuevo !== null ? `Línea ${l.nuevo}` : l.viejo !== null ? `Era la línea ${l.viejo}` : undefined
            }
          >
            <span className="signo" aria-hidden="true">
              {l.tipo === 'agregada' ? '+' : l.tipo === 'quitada' ? '−' : ' '}
            </span>
            {l.tipo === 'agregada' && <span className="solo-lector">agregada: </span>}
            {l.tipo === 'quitada' && <span className="solo-lector">quitada: </span>}
            {l.texto}
          </div>
        ),
      )}
      {d.cortada && <p className="git-nota">Es muy largo: se muestra solo el comienzo.</p>}
    </div>
  )
}

/** Los commits ya leídos con sus archivos: un commit no cambia, se lee una vez. */
const detalles = new Map<string, DetalleCommit>()

function useDetalleCommit(ruta: string, hash: string | null): DetalleCommit | null {
  const clave = `${ruta}\n${hash}`
  const [leido, setLeido] = useState<{ clave: string; d: DetalleCommit } | null>(null)
  useEffect(() => {
    if (!hash || detalles.has(clave)) return
    let vigente = true
    void window.iridium.commit(ruta, hash).then((r) => {
      if (r.tipo === 'ok') detalles.set(clave, r)
      if (vigente) setLeido({ clave, d: r })
    })
    return () => {
      vigente = false
    }
  }, [ruta, hash, clave])
  if (!hash) return null
  return detalles.get(clave) ?? (leido?.clave === clave ? leido.d : null)
}

/** El archivo elegido, a la derecha: su nombre, de dónde es y su antes y después, como en VS Code (R-95). */
function DetalleArchivo({ ruta, a, c }: { ruta: string; a: ArchivoGit; c: CommitGit | null }) {
  const partes = a.ruta.split('/')
  return (
    <section className="git-detalle">
      <h3 className="git-titulo">{partes.at(-1)}</h3>
      <div className="git-meta">
        {partes.length > 1 && <code>{partes.slice(0, -1).join('/')}/</code>}
        <Letra cambio={a.cambio} />
        {c ? (
          <span className="git-de" title={`${c.mensaje}\n${fechaExacta(c.fecha)} · ${autores(c)}`}>
            <code>{c.corto}</code> {c.mensaje}
          </span>
        ) : (
          <span>{a.preparado ? 'Preparado para el commit' : 'Sin guardar'}</span>
        )}
        <Numeros a={a} />
      </div>
      <Diferencia ruta={ruta} commit={c?.hash ?? SIN_GUARDAR} archivo={a.ruta} />
    </section>
  )
}

/** Los archivos de un commit abierto en el Historial, colgando de su punto en la vía (R-95). */
function ArchivosDeCommit({
  ruta,
  hash,
  elegido,
  elegir,
}: {
  ruta: string
  hash: string
  elegido: string | null
  elegir: (archivo: string) => void
}) {
  const d = useDetalleCommit(ruta, hash)
  return (
    <div className="git-commit-archivos" aria-busy={!d}>
      {d?.tipo === 'no-esta' && <p className="git-nada">Este commit ya no está en el repositorio.</p>}
      {d?.tipo === 'error' && <p className="git-nada">No se pudo leer: {d.mensaje}</p>}
      {d?.tipo === 'ok' && d.archivos.length === 0 && (
        <p className="git-nada">Este commit no cambió archivos.</p>
      )}
      {d?.tipo === 'ok' && d.archivos.length > 0 && (
        <div className="arbol git-arbol">
          {d.archivos.map((a) => (
            <NodoArchivo key={a.ruta} a={a} sel={elegido === a.ruta} elegir={() => elegir(a.ruta)} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * La derecha: el antes y después del archivo elegido. Sin archivo, o si el elegido ya no tiene cambios (se guardó en
 * un commit), el visor se cierra solo (R-97).
 */
function Visor({
  ruta,
  g,
  origen,
  archivo,
  cerrar,
}: {
  ruta: string
  g: Extract<GitProyecto, { tipo: 'ok' }>
  origen: string | null
  archivo: string | null
  cerrar: () => void
}) {
  const c = origen && origen !== SIN_GUARDAR ? (g.historial.find((x) => x.hash === origen) ?? null) : null
  const d = useDetalleCommit(ruta, c?.hash ?? null)
  const a = !archivo
    ? null
    : origen === SIN_GUARDAR
      ? (g.cambios.find((x) => x.ruta === archivo) ?? null)
      : d?.tipo === 'ok'
        ? (d.archivos.find((x) => x.ruta === archivo) ?? null)
        : null
  const leyendo = c !== null && d === null
  const vencido = archivo !== null && a === null && !leyendo
  useEffect(() => {
    if (vencido) cerrar()
  }, [vencido, cerrar])
  if (leyendo) return <div className="git-nota" aria-busy="true" />
  if (a) return <DetalleArchivo key={`${origen}\n${a.ruta}`} ruta={ruta} a={a} c={c} />
  if (g.cambios.length === 0 && g.historial.length === 0)
    return (
      <Vacio
        titulo="El repositorio está vacío"
        texto="Todavía no tiene commits ni cambios. Cuando la IA guarde su trabajo, aparece aquí."
      />
    )
  return null
}

/** Un aviso que ocupa la sección: el repositorio vacío (punteado) o git que no se puede leer (error). */
function Vacio({ titulo, texto, error = false }: { titulo: string; texto: string; error?: boolean }) {
  return (
    <div className="git-vacio">
      <div className={error ? 'recuadro error' : 'recuadro punteado'} role={error ? 'alert' : undefined}>
        <div className="cuerpo-recuadro">
          <strong>{titulo}</strong>
          {texto}
        </div>
      </div>
    </div>
  )
}

/** Un grupo del panel que se pliega, como los de VS Code: Preparados, Cambios e Historial. */
function Grupo({
  titulo,
  cuenta,
  plegado,
  alternar,
  alPie = false,
  children,
}: {
  titulo: string
  cuenta: number
  plegado: boolean
  alternar: () => void
  /** Pegado al pie del panel, como la línea de tiempo de VS Code (R-94). */
  alPie?: boolean
  children: ReactNode
}) {
  return (
    <section className={alPie ? 'git-grupo al-pie' : 'git-grupo'} aria-label={titulo}>
      <h3>
        <button type="button" className="git-pliega" aria-expanded={!plegado} onClick={alternar}>
          <Icono nombre="chev" />
          <span className="t">{titulo}</span>
          <span className="cuenta">{cuenta}</span>
        </button>
      </h3>
      {!plegado && children}
    </section>
  )
}

/** Mientras lee (T-103): la forma del panel, la rama, Cambios e Historial, como las siluetas de las demás secciones. */
function CargandoGit() {
  const lineas = (anchos: number[]) =>
    anchos.map((w, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: las siluetas no cambian de lugar
      <div key={i} className="git-silueta">
        <span className="linea-silueta" style={{ width: `${w}%` }} />
      </div>
    ))
  return (
    <div className="git-cols">
      <nav className="git-panel" aria-label="Git del proyecto" aria-busy="true">
        <div className="git-remoto">{lineas([45])}</div>
        {[
          { titulo: 'Cambios', anchos: [70, 55, 62] },
          { titulo: 'Historial', anchos: [85, 72, 90, 64, 78, 58] },
        ].map((x) => (
          <section key={x.titulo} className={x.titulo === 'Historial' ? 'git-grupo al-pie' : 'git-grupo'}>
            <h3>
              <span className="git-pliega">
                <Icono nombre="chev" />
                <span className="t">{x.titulo}</span>
              </span>
            </h3>
            {lineas(x.anchos)}
          </section>
        ))}
      </nav>
      <div className="git-visor" />
    </div>
  )
}

/** Arriba del panel: si está solo en la PC o también en GitHub, qué falta subir o bajar, y Sincronizar (D-159). */
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
      <div className="git-remoto" title="El repositorio no tiene ningún remoto: no está en GitHub.">
        <div className="git-donde">
          <Icono nombre="pc" />
          <span className="t">Solo en esta PC</span>
          <button
            type="button"
            className="boton sin-fondo chico"
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
  if (!r.sigue) estado.push({ texto: `Esta rama no está en ${donde}`, clase: 'ambar' })
  if (r.sinSubir > 0)
    estado.push({
      texto: `${r.sinSubir >= 1000 ? '1000+' : r.sinSubir} ${r.sinSubir === 1 ? 'commit' : 'commits'} sin subir`,
      clase: 'ambar',
    })
  if (r.sinBajar > 0)
    estado.push({ texto: `${plural(r.sinBajar, 'commit', 'commits')} para bajar`, clase: '' })
  const s = r.sincronia
  const problema =
    s !== null && (s.resultado === 'separada' || s.resultado === 'choca' || s.resultado === 'error')
  const flechas = `${r.sinBajar > 0 ? ` ↓${r.sinBajar}` : ''}${r.sinSubir > 0 ? ` ↑${r.sinSubir >= 1000 ? '1000+' : r.sinSubir}` : ''}`
  return (
    <div
      className="git-remoto"
      title={`Según la última vez que esta PC se sincronizó con ${donde}${r.sigue ? ` (${r.sigue})` : ''}.`}
    >
      <div className="git-donde">
        <Icono nombre="nube" />
        <span className="t">
          {r.github ? 'En GitHub' : 'En otro servidor'}
          {' · '}
          {r.web ? (
            <a href={r.web} target="_blank" rel="noreferrer">
              {r.nombre}
            </a>
          ) : (
            r.nombre
          )}
        </span>
        <button
          type="button"
          className="boton sin-fondo chico"
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
      {/* Al día no se dice: alcanza con «Revisado hace…» (R-96). */}
      {estado.length > 0 && (
        <p className="git-estado">
          {estado.map((e, i) => (
            <span key={e.texto} className={e.clase}>
              {i > 0 ? ' · ' : ''}
              {e.texto}
            </span>
          ))}
        </p>
      )}
      {s && (
        <p className={problema ? 'git-estado ambar' : 'git-estado'} title={fechaExacta(s.cuando)}>
          {textoDeSincronia(s, donde, fechaRelativa(s.cuando, Date.now()))}
        </p>
      )}
    </div>
  )
}

/**
 * Commit y subir (D-159), como el cuadro de VS Code: el mensaje (si queda vacío, el que se propone) y un botón que
 * guarda en un commit los preparados o, si no hay, todos los cambios, y lo sube si el repositorio está en un remoto.
 */
function MensajeCommit({
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
    <div className="git-mensaje">
      <textarea
        className="area"
        rows={1}
        maxLength={LARGO_MENSAJE}
        aria-label="Mensaje del commit"
        placeholder={sugerido}
        title="Sin mensaje, va el que se ve en gris. Ctrl+Enter hace el commit."
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
        className="boton secundario"
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

/** Un archivo sin guardar en el panel: un nodo del Árbol con el nombre, su carpeta tenue y la letra, como VS Code. */
function NodoArchivo({ a, sel, elegir }: { a: ArchivoGit; sel: boolean; elegir: () => void }) {
  const partes = a.ruta.split('/')
  return (
    <button
      type="button"
      className={sel ? 'nodo git-nodo elegido' : 'nodo git-nodo'}
      aria-current={sel}
      title={`${a.ruta} · ${LETRA[a.cambio].titulo}`}
      onClick={elegir}
    >
      <Icono nombre="archivo" />
      <span className="git-nombre">{partes.at(-1)}</span>
      {partes.length > 1 && <span className="git-carpeta">{partes.slice(0, -1).join('/')}</span>}
      <Letra cambio={a.cambio} marca />
    </button>
  )
}

/** La rama, en la Cabecera y en gris como la ruta de Archivos; en ámbar si se mira un commit suelto. */
function Rama({ g }: { g: GitProyecto | null }) {
  if (g?.tipo !== 'ok') return null
  return (
    <span
      className={g.sinRama ? 'git-rama ambar' : 'git-rama'}
      title={g.sinRama ? 'No hay una rama elegida: se mira un commit suelto' : 'La rama'}
    >
      {g.sinRama ? 'sin rama' : g.rama || 'sin commits'}
    </span>
  )
}

export function Git({ ruta }: { ruta: string }) {
  const visible = usarEstado((s) => s.proyectoAbierto === ruta && vistaDe(s.vistas, ruta).seccion === 'git')
  const [g, leer] = useGit(ruta, visible)
  return (
    <>
      <Cabecera titulo="Git" sub={g?.tipo === 'ok' ? <Rama g={g} /> : undefined} />
      <CuerpoGit ruta={ruta} g={g} leer={leer} />
    </>
  )
}

function CuerpoGit({ ruta, g, leer }: { ruta: string; g: GitProyecto | null; leer: () => void }) {
  const origen = usarEstado((s) => vistaDe(s.vistas, ruta).commit)
  const archivoGit = usarEstado((s) => vistaDe(s.vistas, ruta).archivoGit)
  const abiertos = usarEstado((s) => vistaDe(s.vistas, ruta).gitAbiertos)
  const plegadas = usarEstado((s) => vistaDe(s.vistas, ruta).gitPlegadas)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
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
  const cerrar = useCallback(
    () => cambiarVista(ruta, { commit: null, archivoGit: null }),
    [cambiarVista, ruta],
  )
  const sincronizar = () => {
    setSincronizando(true)
    void window.iridium
      .sincronizarGit(ruta)
      .then(terminar)
      .finally(() => setSincronizando(false))
  }

  if (!g) return <CargandoGit />
  if (g.tipo === 'sin-git') return <SinRepositorio ruta={ruta} listo={listo} />
  if (g.tipo === 'sin-programa')
    return (
      <Vacio
        error
        titulo="No se encontró git en la PC"
        texto="Iridium usa el git instalado en Windows para leer el historial. Instálalo (git-scm.com) y vuelve a abrir esta sección."
      />
    )
  if (g.tipo === 'error')
    return <Vacio error titulo="No se pudo leer el git del proyecto" texto={g.mensaje} />

  const elegir = (x: string, a: string) => cambiarVista(ruta, { commit: x, archivoGit: a })
  const abrirCommit = (h: string) =>
    cambiarVista(ruta, {
      gitAbiertos: abiertos.includes(h) ? abiertos.filter((x) => x !== h) : [...abiertos, h],
    })
  const alternar = (id: string) =>
    cambiarVista(ruta, {
      gitPlegadas: plegadas.includes(id) ? plegadas.filter((x) => x !== id) : [...plegadas, id],
    })
  const preparados = g.cambios.filter((a) => a.preparado)
  const cambios = g.cambios.filter((a) => !a.preparado)
  const nodo = (a: ArchivoGit) => (
    <NodoArchivo
      key={a.ruta}
      a={a}
      sel={origen === SIN_GUARDAR && archivoGit === a.ruta}
      elegir={() => elegir(SIN_GUARDAR, a.ruta)}
    />
  )
  const donde = g.remoto.tipo === 'remoto' && g.remoto.github ? 'GitHub' : 'el remoto'
  // Commit y subir y Sincronizar esperan a la IA (guardarían su trabajo a medias) y necesitan una rama.
  const porQueNo = trabaja
    ? 'La IA está trabajando en este proyecto: espera a que termine.'
    : g.sinRama
      ? 'No hay una rama elegida: se está mirando un commit suelto.'
      : null

  return (
    <div className="git-cols">
      <nav className="git-panel" aria-label="Git del proyecto">
        <Remoto
          r={g.remoto}
          publicar={g.historial.length > 0 ? () => setPublicando(true) : null}
          sincronizar={{ hacer: sincronizar, enCurso: sincronizando, porQueNo }}
        />
        {aviso && (
          <div className="git-aviso">
            <div
              className={aviso.error ? 'recuadro error' : 'recuadro'}
              role={aviso.error ? 'alert' : 'status'}
            >
              <div className="cuerpo-recuadro">{aviso.texto}</div>
            </div>
          </div>
        )}
        {g.cambios.length > 0 && (
          <MensajeCommit
            ruta={ruta}
            archivos={preparados.length > 0 ? preparados : g.cambios}
            preparados={preparados.length > 0}
            subir={g.remoto.tipo === 'remoto'}
            porQueNo={porQueNo}
            terminar={terminar}
          />
        )}
        {preparados.length > 0 && (
          <Grupo
            titulo="Preparados"
            cuenta={preparados.length}
            plegado={plegadas.includes('preparados')}
            alternar={() => alternar('preparados')}
          >
            <div className="arbol git-arbol">{preparados.map(nodo)}</div>
          </Grupo>
        )}
        <Grupo
          titulo="Cambios"
          cuenta={cambios.length}
          plegado={plegadas.includes('cambios')}
          alternar={() => alternar('cambios')}
        >
          {g.cambios.length === 0 ? (
            <p className="git-nada">Nada sin guardar: todo está en commits.</p>
          ) : cambios.length === 0 ? (
            <p className="git-nada">Todo lo cambiado está preparado.</p>
          ) : (
            <div className="arbol git-arbol">{cambios.map(nodo)}</div>
          )}
        </Grupo>
        <Grupo
          titulo="Historial"
          cuenta={g.historial.length}
          plegado={plegadas.includes('historial')}
          alternar={() => alternar('historial')}
          alPie
        >
          {g.historial.length === 0 && <p className="git-nada">Todavía no hay commits.</p>}
          <div className="git-historial">
            {g.historial.map((c) => {
              const abierto = abiertos.includes(c.hash)
              return (
                <Fragment key={c.hash}>
                  <button
                    type="button"
                    className="git-commit"
                    aria-expanded={abierto}
                    title={`${c.mensaje}\n${c.corto} · ${fechaExacta(c.fecha)} · ${autores(c)} · ${plural(c.archivos, 'archivo', 'archivos')}${c.subido === false ? `\nTodavía no está en ${donde}` : ''}`}
                    onClick={() => abrirCommit(c.hash)}
                  >
                    <span className="via" aria-hidden="true" />
                    <span className="msj">{c.mensaje}</span>
                    {c.subido === false && <span className="sin-subir">sin subir</span>}
                    <span className="cuando">{fechaRelativa(c.fecha, ahora)}</span>
                  </button>
                  {abierto && (
                    <ArchivosDeCommit
                      ruta={ruta}
                      hash={c.hash}
                      elegido={origen === c.hash ? archivoGit : null}
                      elegir={(a) => elegir(c.hash, a)}
                    />
                  )}
                </Fragment>
              )
            })}
          </div>
          {g.hayMas && <p className="git-nada">Se muestran los últimos {g.historial.length}.</p>}
        </Grupo>
      </nav>
      <div className="git-visor">
        <Visor ruta={ruta} g={g} origen={origen} archivo={archivoGit} cerrar={cerrar} />
      </div>
      {publicando && <PublicarGithub ruta={ruta} cerrar={() => setPublicando(false)} listo={listo} />}
    </div>
  )
}
