// Trabajo de un proyecto (frente Orden, 04-ux.md › W-11, H-19): las ideas y lo que la IA va a hacer, está haciendo e
// hizo, de `docs/trabajo.md`. Filtros por estado y, con más de un frente, por frente; «Todos» muestra lo que falta y
// deja plegados al final los hechos y los descartados. Cada ítem se despliega con su texto y su origen. No se editan
// desde acá (los cambia la IA); se anota una idea sin la IA (H-18). Con framework viejo, sus ideas de la guía (R-8).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { IdeasProyecto } from '../../../compartido/ideas'
import type { EstadoTrabajo, ItemTrabajoVista, TrabajoProyecto } from '../../../compartido/trabajo'
import { usarEstado, vistaDe } from '../../estado'
import { Anotar } from '../../ui/Anotar'
import { Cabecera, Filtros } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { nombreDoc, tocarEnlace, useDocsCambian } from './enlaces'

/** Los grupos en el orden de «Todos» (W-11): lo que se está haciendo primero; los cerrados, plegados al final. */
const GRUPOS: readonly { estado: EstadoTrabajo; nombre: string; cerrado?: true }[] = [
  { estado: 'en curso', nombre: 'En curso' },
  { estado: 'pendiente', nombre: 'Pendientes' },
  { estado: 'nueva', nombre: 'Nuevas' },
  { estado: 'en pausa', nombre: 'En pausa' },
  { estado: 'hecho', nombre: 'Hechos', cerrado: true },
  { estado: 'descartado', nombre: 'Descartados', cerrado: true },
]
const SIN_ESTADO = 'sin-estado'
const NUCLEO = 'Núcleo'

/** Lo más nuevo arriba; sin fecha, por código. */
function orden(a: ItemTrabajoVista, b: ItemTrabajoVista): number {
  return (b.fecha ?? '').localeCompare(a.fecha ?? '') || Number(b.codigo.slice(2)) - Number(a.codigo.slice(2))
}

const claveGrupo = (i: ItemTrabajoVista): string => i.estado ?? SIN_ESTADO

export function Trabajo({ ruta }: { ruta: string }) {
  const [trabajo, setTrabajo] = useState<TrabajoProyecto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('todos')
  const [frente, setFrente] = useState('todos')
  const [abiertos, setAbiertos] = useState<ReadonlySet<string>>(new Set())
  const [desplegados, setDesplegados] = useState<ReadonlySet<string>>(new Set())
  const [anotando, setAnotando] = useState(false)
  const [recien, setRecien] = useState<string | null>(null)
  const item = usarEstado((s) => vistaDe(s.vistas, ruta).item)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const campo = useRef<HTMLInputElement>(null)
  const lista = useRef<HTMLDivElement>(null)

  const leer = useCallback(() => {
    void window.iridium.trabajoProyecto(ruta).then(
      (t) => {
        setTrabajo(t)
        setError(null)
      },
      (e: unknown) => setError(e instanceof Error ? e.message : String(e)),
    )
  }, [ruta])
  useEffect(leer, [leer])
  useDocsCambian(ruta, leer)

  const items = trabajo?.tipo === 'trabajo' ? trabajo.items : []
  const frentes = useMemo(
    () => [...new Set(items.map((i) => i.frente ?? NUCLEO))].sort((a, b) => a.localeCompare(b, 'es')),
    [items],
  )
  const delFrente = frente === 'todos' ? items : items.filter((i) => (i.frente ?? NUCLEO) === frente)
  const cuenta = (clave: string) => delFrente.filter((i) => claveGrupo(i) === clave).length
  const faltan = delFrente.filter((i) => !GRUPOS.find((g) => g.estado === i.estado)?.cerrado).length
  const sinEstado = cuenta(SIN_ESTADO)

  // Un `T-n` abierto desde un enlace (F-4): se ve aunque el filtro o su grupo lo escondan, desplegado.
  useEffect(() => {
    if (!item || !items.some((i) => i.codigo === item)) return
    const it = items.find((i) => i.codigo === item)
    if (!it) return
    setFiltro('todos')
    setFrente('todos')
    setAbiertos((a) => new Set(a).add(claveGrupo(it)))
    setDesplegados((d) => new Set(d).add(item))
    requestAnimationFrame(() =>
      lista.current?.querySelector(`[data-codigo="${item}"]`)?.scrollIntoView({ block: 'center' }),
    )
    cambiarVista(ruta, { item: null })
  }, [item, items, ruta, cambiarVista])

  // La recién anotada queda marcada un momento, arriba de las nuevas (W-10). Se busca otra vez cuando llega la lista.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `items` es a propósito: la fila aparece al releer.
  useEffect(() => {
    if (!recien) return
    const el = lista.current?.querySelector(`[data-codigo="${recien}"]`)
    el?.scrollIntoView({ block: 'nearest' })
    const t = setTimeout(() => setRecien(null), 2500)
    return () => clearTimeout(t)
  }, [recien, items])

  const alternar = (set: typeof setAbiertos, clave: string) =>
    set((a) => {
      const n = new Set(a)
      if (!n.delete(clave)) n.add(clave)
      return n
    })

  const abrirCampo = () => {
    setAnotando(true)
    requestAnimationFrame(() => campo.current?.focus())
  }

  if (trabajo?.tipo === 'viejo') return <TrabajoViejo ruta={ruta} ideas={trabajo.ideas} />
  if (trabajo?.tipo === 'sin-docs')
    return (
      <Cabecera
        titulo="Trabajo"
        vacia="Esta carpeta no sigue el framework: no tiene un plan ni trabajo anotado. Para empezar uno, contale a la IA qué querés hacer."
      />
    )

  const filtros = [
    {
      clave: 'todos',
      nombre: 'Todos',
      n: faltan,
      titulo: 'Lo que falta: en curso, pendientes, nuevas, en pausa y sin estado',
    },
    ...GRUPOS.filter((g) => cuenta(g.estado) > 0).map((g) => ({
      clave: g.estado,
      nombre: g.nombre,
      n: cuenta(g.estado),
    })),
    ...(sinEstado > 0 ? [{ clave: SIN_ESTADO, nombre: 'Sin estado', n: sinEstado }] : []),
  ]
  const vacio = trabajo !== null && items.length === 0
  const grupos = [
    ...GRUPOS.map((g) => ({ clave: g.estado as string, nombre: g.nombre, cerrado: g.cerrado === true })),
    { clave: SIN_ESTADO, nombre: 'Sin estado', cerrado: false },
  ].filter((g) => (filtro === 'todos' ? true : g.clave === filtro))

  return (
    <>
      <Cabecera
        titulo="Trabajo"
        cuenta={items.length > 0 ? items.length : undefined}
        acciones={
          !vacio && (
            <button type="button" className="boton secundario chico" onClick={abrirCampo}>
              <Icono nombre="mas" />
              Anotar una idea
            </button>
          )
        }
        filtros={
          items.length > 0 && (
            <>
              <Filtros filtros={filtros} elegido={filtro} elegir={setFiltro} etiqueta="Filtrar por estado" />
              {frentes.length > 1 && (
                <select
                  className="cab-filtro frentes"
                  aria-label="Filtrar por frente"
                  value={frente}
                  onChange={(e) => setFrente(e.target.value)}
                >
                  <option value="todos">Frente: todos</option>
                  {frentes.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              )}
            </>
          )
        }
        vacia={
          vacio && (
            <>
              Acá van las ideas y lo que la IA va a hacer, está haciendo e hizo. Anotá una idea sin gastar
              uso: la IA la toma cuando trabaje en el proyecto.
            </>
          )
        }
      />
      <div className="tb-cuerpo">
        <div className="tb-col" ref={lista}>
          {(anotando || vacio) && (
            <Anotar
              campo={campo}
              anotar={(t) => window.iridium.anotarTrabajo(ruta, t)}
              alAnotar={(codigo) => {
                setRecien(codigo)
                setFiltro((f) => (f === 'todos' || f === 'nueva' ? f : 'todos'))
                setFrente('todos')
                leer()
              }}
              alEscape={() => setAnotando(false)}
            />
          )}
          {error && (
            <p className="script-msg error" role="alert">
              <Icono nombre="error" />
              No se pudo leer: {error}
            </p>
          )}
          {!trabajo && !error && <p className="nota">Leyendo…</p>}
          {grupos.map((g) => {
            const del = delFrente.filter((i) => claveGrupo(i) === g.clave).sort(orden)
            if (del.length === 0) return null
            const plegado = filtro === 'todos' && g.cerrado && !abiertos.has(g.clave)
            return (
              <section key={g.clave} className="tb-grupo" aria-label={`${g.nombre}: ${del.length}`}>
                {g.cerrado && filtro === 'todos' ? (
                  <button
                    type="button"
                    className="tb-grupo-t plegable"
                    aria-expanded={!plegado}
                    onClick={() => alternar(setAbiertos, g.clave)}
                  >
                    <Icono nombre="chev" style={{ transform: plegado ? undefined : 'rotate(90deg)' }} />
                    {g.nombre} <span className="n">{del.length}</span>
                  </button>
                ) : (
                  <h3 className="tb-grupo-t">
                    {g.nombre} <span className="n">{del.length}</span>
                  </h3>
                )}
                {g.clave === SIN_ESTADO && (
                  <p className="tb-aviso">
                    Les falta la línea «Estado:» o dice una palabra que no es del framework: la IA los corrige
                    al terminar su próximo turno.
                  </p>
                )}
                {!plegado && (
                  <ul className="tb-lista">
                    {del.map((i) => (
                      <Item
                        key={i.codigo}
                        ruta={ruta}
                        item={i}
                        conFrente={frentes.length > 1}
                        abierto={desplegados.has(i.codigo)}
                        recien={recien === i.codigo}
                        alternar={() => alternar(setDesplegados, i.codigo)}
                      />
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}

function Item({
  ruta,
  item: i,
  conFrente,
  abierto,
  recien,
  alternar,
}: {
  ruta: string
  item: ItemTrabajoVista
  conFrente: boolean
  abierto: boolean
  recien: boolean
  alternar: () => void
}) {
  const clase = ['tb-item', abierto && 'abierto', recien && 'recien'].filter(Boolean).join(' ')
  return (
    <li className={clase} data-codigo={i.codigo}>
      <button type="button" className="tb-fila" aria-expanded={abierto} onClick={alternar}>
        <span className="t">{i.codigo}</span>
        <span className="tit" title={i.titulo}>
          {i.titulo}
        </span>
        <span className="fr">{conFrente ? (i.frente ?? NUCLEO) : ''}</span>
        <span className="f">{i.fecha ?? ''}</span>
        <Icono nombre="chev" style={{ transform: abierto ? 'rotate(90deg)' : undefined }} />
      </button>
      {abierto && (
        // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces de adentro, que ya son enfocables.
        <div className="tb-detalle" onClick={(e) => tocarEnlace(e, ruta)}>
          {i.html ? (
            <div
              className="doc-texto"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
              dangerouslySetInnerHTML={{ __html: i.html }}
            />
          ) : (
            <p className="nota">Sin más texto que el título.</p>
          )}
          <dl className="tb-datos">
            {i.estado === null && (
              <div>
                <dt>Estado</dt>
                <dd>{i.estadoTexto ? `«${i.estadoTexto}», no es del framework` : 'falta'}</dd>
              </div>
            )}
            {i.origenHtml && (
              <div>
                <dt>Origen</dt>
                {/* biome-ignore lint/security/noDangerouslySetInnerHtml: HTML en línea armado por el proceso principal (D-027). */}
                <dd className="doc-texto" dangerouslySetInnerHTML={{ __html: i.origenHtml }} />
              </div>
            )}
          </dl>
        </div>
      )}
    </li>
  )
}

/** Un proyecto que no pasó al framework: sus ideas siguen en las secciones de la guía (R-8, D-089). */
function TrabajoViejo({ ruta, ideas }: { ruta: string; ideas: IdeasProyecto }) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  return (
    <>
      <Cabecera
        titulo="Trabajo"
        vacia={
          <>
            Este proyecto todavía no pasó al framework: sus ideas y pendientes están repartidos en sus
            documentos.
            {ideas.secciones.length > 0 && ' Abajo, las ideas que anotó la guía.'}
          </>
        }
      />
      <div className="scripts ideas-proyecto">
        <div className="scripts-col">
          {ideas.secciones.map((s) => (
            <section key={s.documento} className="script seccion-ideas" aria-label={s.titulo}>
              <div className="script-cab">
                <h4>
                  {s.titulo} {s.cantidad > 0 && <span className="n">{s.cantidad}</span>}
                </h4>
                <button
                  type="button"
                  className="boton secundario chico"
                  title={`Abrir ${nombreDoc(s.documento)} en Docs`}
                  onClick={() => abrirDoc(ruta, { documento: s.documento, ancla: s.ancla ?? '' })}
                >
                  <Icono nombre="docs" />
                  {nombreDoc(s.documento)}
                </button>
              </div>
              {s.html ? (
                // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces de adentro, que ya son enfocables.
                <div
                  className="doc-texto"
                  onClick={(e) => tocarEnlace(e, ruta)}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
                  dangerouslySetInnerHTML={{ __html: s.html }}
                />
              ) : (
                <p className="nota">Vacía por ahora.</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
