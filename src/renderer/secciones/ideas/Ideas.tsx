// Ideas del inicio (frente Orden, 04-ux.md › W-10, H-18): anotar una idea sin la IA, en un proyecto o suelta, y ver
// juntas las ideas `nueva` de todos los proyectos con framework (agrupadas por proyecto, el de la más reciente
// primero) y las sueltas de `Ideas/ideas.md` al final. Una de un proyecto abre su Trabajo en ese ítem; una suelta se
// despliega acá con Hablar de esta idea, que la pone arriba del cuadro del chat general.
import { type CSSProperties, type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import type { Idea, ListaIdeas } from '../../../compartido/ideas'
import { CARPETA_GENERAL, type TarjetaProyecto } from '../../../compartido/puente'
import { tamanoLegible } from '../../../compartido/tamanos'
import type { IdeasDelInicio, ItemTrabajoVista } from '../../../compartido/trabajo'
import { rutaGeneral, usarEstado } from '../../estado'
import { Anotar } from '../../ui/Anotar'
import { Cabecera } from '../../ui/Cabecera'
import { Divisor, useAnchoConversacion } from '../../ui/Divisor'
import { Icono } from '../../ui/Icono'
import { Menu } from '../../ui/Menu'
import { AbrirComoProyecto } from '../inicio/AbrirComoProyecto'
import { ChatGeneral } from '../inicio/ChatGeneral'
import { tocarEnlace } from '../proyecto/enlaces'

const SUELTA = 'suelta'

/** Los proyectos a los que se puede anotar (W-10): los que siguen el framework y no están archivados, por nombre. */
function destinosDe(proyectos: readonly TarjetaProyecto[]): TarjetaProyecto[] {
  return proyectos
    .filter((p) => !p.archivado && p.framework !== null && p.framework !== 'viejo')
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

/** Las sueltas que se muestran: las de `ideas.md` que todavía no pasaron a un proyecto, en el orden del archivo. */
function sueltasDe(lista: ListaIdeas | null): Idea[] {
  return lista?.tipo === 'ideas' ? lista.secciones.flatMap((s) => s.ideas.filter((i) => !i.integrada)) : []
}

/** El título como lo escribe Iridium (una línea, sin espacios de más), para encontrar la recién anotada. */
const enUnaLinea = (t: string) => t.replace(/\s+/g, ' ').trim()

export function Ideas() {
  const lista = usarEstado((s) => s.lista)
  const vista = usarEstado((s) => s.ideas)
  const cambiarIdeas = usarEstado((s) => s.cambiarIdeas)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const abrirTrabajo = usarEstado((s) => s.abrirTrabajo)
  const ancho = useAnchoConversacion('general')
  const [nuevas, setNuevas] = useState<IdeasDelInicio | null>(null)
  const [errorNuevas, setErrorNuevas] = useState<string | null>(null)
  const [sueltas, setSueltas] = useState<ListaIdeas | null>(null)
  /** La recién anotada, marcada un momento: `ruta|T-n` o `suelta|título`. */
  const [recien, setRecien] = useState<string | null>(null)
  const cuerpo = useRef<HTMLDivElement>(null)
  const rutaIdeas = rutaGeneral(lista)

  const leerNuevas = useCallback(() => {
    void window.iridium.ideasNuevas().then(
      (n) => {
        setNuevas(n)
        setErrorNuevas(null)
      },
      (e: unknown) => setErrorNuevas(e instanceof Error ? e.message : String(e)),
    )
  }, [])
  const leerSueltas = useCallback(() => {
    void window.iridium
      .ideas()
      .then(setSueltas, (e: unknown) =>
        setSueltas({ tipo: 'error', mensaje: e instanceof Error ? e.message : String(e) }),
      )
  }, [])

  // Al entrar se lee; cuando cambia un documento (la IA, VS Code, el celular o Anotar), se relee lo suyo.
  useEffect(() => {
    leerNuevas()
    leerSueltas()
    return window.iridium.alCambiarDocs((r) =>
      r.split(/[\\/]/).pop() === CARPETA_GENERAL ? leerSueltas() : leerNuevas(),
    )
  }, [leerNuevas, leerSueltas])
  // Un proyecto que pasa al framework, se archiva o aparece cambia la lista; la carpeta Ideas, lo mismo.
  const firma = (lista?.tipo === 'lista' ? lista.proyectos : [])
    .map((p) => `${p.ruta}:${p.archivado}:${p.framework === 'viejo' ? 'v' : p.framework ? 'f' : '-'}`)
    .join('|')
  const hayCarpeta = rutaIdeas !== null
  // biome-ignore lint/correctness/useExhaustiveDependencies: se relee solo cuando cambia lo que decide qué se ve.
  useEffect(() => {
    if (lista) leerNuevas()
  }, [firma, leerNuevas])
  // biome-ignore lint/correctness/useExhaustiveDependencies: se relee solo cuando aparece o se va la carpeta.
  useEffect(() => {
    if (lista) leerSueltas()
  }, [hayCarpeta, leerSueltas])

  const destinos = destinosDe(lista?.tipo === 'lista' ? lista.proyectos : [])
  const destino =
    vista.destino === SUELTA || destinos.some((p) => p.ruta === vista.destino)
      ? (vista.destino as string)
      : (destinos[0]?.ruta ?? SUELTA)
  const grupos = nuevas?.grupos ?? []
  const deSueltas = sueltasDe(sueltas)
  const total = grupos.reduce((n, g) => n + g.ideas.length, 0) + deSueltas.length
  const cargando = (nuevas === null && errorNuevas === null) || sueltas === null
  const vacia = !cargando && total === 0

  // La recién anotada: se ve y queda marcada un momento. Se busca otra vez cuando llega la lista nueva.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `nuevas` y `sueltas` son a propósito: la fila aparece al releer.
  useEffect(() => {
    if (!recien) return
    cuerpo.current
      ?.querySelector(`[data-clave="${CSS.escape(recien)}"]`)
      ?.scrollIntoView({ block: 'nearest' })
    const t = setTimeout(() => setRecien(null), 2500)
    return () => clearTimeout(t)
  }, [recien, nuevas, sueltas])

  const abrirEnTrabajo = (ruta: string, codigo: string) => {
    abrirProyecto(ruta, 'trabajo')
    abrirTrabajo(ruta, codigo)
  }
  const alternar = (titulo: string) =>
    cambiarIdeas({
      abiertas: vista.abiertas.includes(titulo)
        ? vista.abiertas.filter((t) => t !== titulo)
        : [...vista.abiertas, titulo],
    })
  const hablar = (titulo: string) => {
    cambiarIdeas({ sobre: titulo })
    requestAnimationFrame(() =>
      document.querySelector<HTMLTextAreaElement>('aside.chat textarea:not(:disabled)')?.focus(),
    )
  }
  const sobre =
    vista.sobre !== null && deSueltas.some((i) => i.titulo === vista.sobre)
      ? { nombre: vista.sobre, que: 'idea' as const, quitar: () => cambiarIdeas({ sobre: null }) }
      : null

  const viejos = nuevas?.viejos ?? []
  const elegido = destinos.find((p) => p.ruta === destino)

  return (
    <main className="trabajo proyecto" style={{ '--ancho-chat': `${ancho}px` } as CSSProperties}>
      <section className="principal ideas-inicio" aria-label="Ideas">
        <Cabecera
          nivel={1}
          titulo="Ideas"
          cuenta={!cargando && total > 0 ? total : undefined}
          acciones={rutaIdeas && <AbrirComoProyecto abrir={() => abrirProyecto(rutaIdeas)} carpeta="Ideas" />}
        />
        <div className="tb-cuerpo" ref={cuerpo}>
          <div className="tb-col">
            <Anotar
              anotar={(t) =>
                destino === SUELTA ? window.iridium.anotarSuelta(t) : window.iridium.anotarTrabajo(destino, t)
              }
              alAnotar={(codigo, texto) => {
                if (destino === SUELTA) {
                  setRecien(`${SUELTA}|${enUnaLinea(texto)}`)
                  leerSueltas()
                } else {
                  setRecien(`${destino}|${codigo}`)
                  leerNuevas()
                }
              }}
              etiqueta={`Anotar una idea ${elegido ? `en ${elegido.nombre}` : 'suelta'}`}
              selector={
                <Destino destinos={destinos} destino={destino} elegir={(d) => cambiarIdeas({ destino: d })} />
              }
            />
            {cargando && <Siluetas />}
            {vacia && (
              <p className="id-vacia">
                Todavía no hay ideas nuevas. Anotá una sin gastar uso: la IA la toma cuando trabaje en su
                proyecto.
              </p>
            )}
            {errorNuevas && (
              <p className="script-msg error" role="alert">
                <Icono nombre="error" />
                No se pudieron leer las ideas de los proyectos: {errorNuevas}
                <button type="button" className="btn secundario chico" onClick={leerNuevas}>
                  Reintentar
                </button>
              </p>
            )}
            {grupos.map((g) => (
              <section key={g.ruta} className="tb-grupo" aria-label={`${g.nombre}: ${g.ideas.length}`}>
                <h3 className="tb-grupo-t">
                  {g.nombre} <span className="n">{g.ideas.length}</span>
                </h3>
                <ul className="tb-lista">
                  {g.ideas.map((i) => (
                    <IdeaDeProyecto
                      key={i.codigo}
                      item={i}
                      nombre={g.nombre}
                      clave={`${g.ruta}|${i.codigo}`}
                      recien={recien === `${g.ruta}|${i.codigo}`}
                      abrir={() => abrirEnTrabajo(g.ruta, i.codigo)}
                    />
                  ))}
                </ul>
              </section>
            ))}
            {deSueltas.length > 0 && (
              <section className="tb-grupo" aria-label={`Sueltas: ${deSueltas.length}`}>
                <h3 className="tb-grupo-t">
                  Sueltas <span className="n">{deSueltas.length}</span>
                </h3>
                <ul className="tb-lista">
                  {deSueltas.map((i) => (
                    <Suelta
                      key={i.titulo}
                      idea={i}
                      rutaIdeas={rutaIdeas}
                      abierta={vista.abiertas.includes(i.titulo)}
                      recien={recien === `${SUELTA}|${i.titulo}`}
                      alternar={() => alternar(i.titulo)}
                      hablar={() => hablar(i.titulo)}
                    />
                  ))}
                </ul>
              </section>
            )}
            <AvisoSueltas lista={sueltas} reintentar={leerSueltas} />
            {viejos.length > 0 && (
              <p className="id-viejos" title={viejos.join(', ')}>
                {viejos.length === 1
                  ? `Las ideas de ${viejos[0]} no aparecen: todavía no pasó al framework.`
                  : `Las ideas de ${viejos.length} proyectos no aparecen: todavía no pasaron al framework.`}
              </p>
            )}
          </div>
        </div>
      </section>
      <Divisor vista="general" ancho={ancho} />
      <aside className="chat" aria-label="Chat general">
        <ChatGeneral sobre={sobre} />
      </aside>
    </main>
  )
}

/** A qué va lo que se anota (W-10): los proyectos con framework y, separada, Suelta. */
function Destino({
  destinos,
  destino,
  elegir,
}: {
  destinos: readonly TarjetaProyecto[]
  destino: string
  elegir: (d: string) => void
}) {
  const elegido = destinos.find((p) => p.ruta === destino)
  return (
    <Menu
      clase="destino"
      titulo={elegido ? `Se anota en el trabajo de ${elegido.nombre}` : 'Se anota como idea suelta'}
      boton={
        <>
          <Marca p={elegido ?? null} />
          <span className="nom">{elegido?.nombre ?? 'Suelta'}</span>
          <Icono nombre="chev" style={{ transform: 'rotate(90deg)' }} />
        </>
      }
    >
      {(cerrar) => (
        <>
          {destinos.map((p) => (
            <button
              key={p.ruta}
              type="button"
              role="menuitemradio"
              aria-checked={p.ruta === destino}
              className="op-destino"
              onClick={() => {
                cerrar()
                elegir(p.ruta)
              }}
            >
              <Marca p={p} />
              <span className="nom">{p.nombre}</span>
              {p.ruta === destino && <Icono nombre="check" />}
            </button>
          ))}
          {destinos.length > 0 && <hr />}
          <button
            type="button"
            role="menuitemradio"
            aria-checked={destino === SUELTA}
            className="op-destino"
            onClick={() => {
              cerrar()
              elegir(SUELTA)
            }}
          >
            <Marca p={null} />
            <span className="nom">Suelta</span>
            {destino === SUELTA && <Icono nombre="check" />}
          </button>
          <p className="nota">Solo los proyectos que siguen el framework</p>
        </>
      )}
    </Menu>
  )
}

/** El ícono del proyecto (o su inicial); el de Ideas para una suelta. */
function Marca({ p }: { p: TarjetaProyecto | null }) {
  if (!p) return <Icono nombre="ideas" />
  return p.icono ? (
    <img className="marca" src={p.icono} alt="" />
  ) : (
    <span className="marca inicial" aria-hidden="true">
      {p.inicial}
    </span>
  )
}

function IdeaDeProyecto({
  item: i,
  nombre,
  clave,
  recien,
  abrir,
}: {
  item: ItemTrabajoVista
  nombre: string
  clave: string
  recien: boolean
  abrir: () => void
}) {
  return (
    <li className={recien ? 'tb-item recien' : 'tb-item'} data-clave={clave}>
      <button type="button" className="tb-fila" title={`Abrir en el Trabajo de ${nombre}`} onClick={abrir}>
        <span className="t">{i.codigo}</span>
        <span className="tit">{i.titulo}</span>
        <span className="fr" />
        <span className="f">{i.fecha ?? ''}</span>
        <Icono nombre="chev" />
      </button>
    </li>
  )
}

function Suelta({
  idea: i,
  rutaIdeas,
  abierta,
  recien,
  alternar,
  hablar,
}: {
  idea: Idea
  rutaIdeas: string | null
  abierta: boolean
  recien: boolean
  alternar: () => void
  hablar: () => void
}) {
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const clase = ['tb-item', abierta && 'abierto', recien && 'recien'].filter(Boolean).join(' ')
  const alTocar = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a')
    if (!a) return
    if (!rutaIdeas) return e.preventDefault()
    tocarEnlace(e, rutaIdeas)
    if (a.hasAttribute('data-doc') || a.hasAttribute('data-archivo')) abrirProyecto(rutaIdeas)
  }
  return (
    <li className={clase} data-clave={`${SUELTA}|${i.titulo}`}>
      <button type="button" className="tb-fila" aria-expanded={abierta} onClick={alternar}>
        <span className="t" />
        <span className="tit" title={i.titulo}>
          {i.titulo}
        </span>
        <span className="fr" />
        <span className="f">{i.fecha ?? ''}</span>
        <Icono nombre="chev" style={{ transform: abierta ? 'rotate(90deg)' : undefined }} />
      </button>
      {abierta && (
        <div className="tb-detalle">
          {i.html ? (
            // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces de adentro, que ya son enfocables.
            <div
              className="doc-texto"
              onClick={alTocar}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
              dangerouslySetInnerHTML={{ __html: i.html }}
            />
          ) : (
            <p className="nota">Sin más texto que el título.</p>
          )}
          {i.toca.length > 0 && (
            <dl className="tb-datos">
              <div>
                <dt>Toca a</dt>
                <dd>
                  {i.toca.map((t, n) => (
                    <span key={t.nombre}>
                      {n > 0 && ' · '}
                      {t.ruta ? (
                        <button
                          type="button"
                          className="id-proyecto"
                          title={`Abrir ${t.nombre}`}
                          onClick={() => t.ruta && abrirProyecto(t.ruta)}
                        >
                          {t.nombre}
                        </button>
                      ) : (
                        <span title="No está en la carpeta de proyectos">{t.nombre}</span>
                      )}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          )}
          <div>
            <button type="button" className="btn secundario chico" onClick={hablar}>
              <Icono nombre="enviar" />
              Hablar de esta idea
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

/** Lo que pasa con `ideas.md` cuando no hay una lista para mostrar. */
function AvisoSueltas({ lista, reintentar }: { lista: ListaIdeas | null; reintentar: () => void }) {
  if (lista?.tipo === 'sin-carpeta')
    return (
      <p className="script-msg error" role="alert">
        <Icono nombre="error" />
        Iridium guarda las ideas sueltas en la carpeta <code>{CARPETA_GENERAL}</code> de <code>.iridium</code>
        , en tu carpeta de proyectos, y no pudo crearla. Revisá esa carpeta en Ajustes › Proyectos.
      </p>
    )
  if (lista?.tipo === 'grande')
    return (
      <p className="id-viejos">
        <code>ideas.md</code> pesa {tamanoLegible(lista.bytes)}: es muy grande para mostrar sus ideas sueltas
        acá.
      </p>
    )
  if (lista?.tipo === 'sin-secciones')
    return (
      <p className="id-viejos">
        <code>ideas.md</code> no tiene ideas con título (<code>### </code>): abrí Ideas como proyecto para
        verlo entero.
      </p>
    )
  if (lista?.tipo === 'error')
    return (
      <p className="script-msg error" role="alert">
        <Icono nombre="error" />
        No se pudo leer <code>ideas.md</code>: {lista.mensaje}
        <button type="button" className="btn secundario chico" onClick={reintentar}>
          Reintentar
        </button>
      </p>
    )
  return null
}

function Siluetas() {
  return (
    <div className="carga" role="status" aria-busy="true" aria-label="Leyendo las ideas">
      {[70, 55, 80, 60].map((w) => (
        <div key={w} className="proy-silueta">
          <span className="linea-silueta" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}
