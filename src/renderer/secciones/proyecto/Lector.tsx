// Docs (H-8, W-8, D-035): el lector liviano. Arriba, el documento y «En esta página» como menús, el ancho del texto y
// Atrás; la hoja centrada con los códigos y las citas como enlaces. Las tablas de más de seis filas empiezan plegadas.
// Si el documento cambia mientras se lee, se actualiza sin perder la posición. Sin lista de documentos, muestra uno fijo.
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { AnchoHoja } from '../../../compartido/puente'
import type { ContenidoDocumento } from '../../../compartido/visor'
import { type LugarDoc, usarEstado, vistaDe } from '../../estado'
import { Icono } from '../../ui/Icono'
import { Menu } from '../../ui/Menu'
import { nombreDoc, tocarEnlace, useDocsCambian } from './enlaces'

const ANCHOS: { id: AnchoHoja; nombre: string }[] = [
  { id: 'angosto', nombre: 'Angosto' },
  { id: 'normal', nombre: 'Normal' },
  { id: 'ancho', nombre: 'Ancho' },
]
const FILAS_PLEGADA = 5

/** Las tablas largas muestran cinco filas y «Ver las N filas» (D-035). */
function plegarTablas(el: HTMLElement): void {
  for (const caja of el.querySelectorAll<HTMLElement>('.gp-tabla-caja:not([data-plegable])')) {
    const n = caja.querySelectorAll('tbody tr').length
    if (n <= FILAS_PLEGADA + 1) continue
    caja.dataset.plegable = String(n)
    caja.classList.add('plegada')
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'ver-filas'
    b.textContent = `Ver las ${n} filas`
    b.setAttribute('aria-expanded', 'false')
    caja.after(b)
  }
}

function alternarTabla(b: HTMLElement): void {
  const caja = b.previousElementSibling as HTMLElement | null
  if (!caja?.dataset.plegable) return
  const abierta = caja.classList.toggle('plegada') === false
  b.setAttribute('aria-expanded', String(abierta))
  b.textContent = abierta ? 'Mostrar menos filas' : `Ver las ${caja.dataset.plegable} filas`
}

interface Titulo {
  id: string
  texto: string
  nivel: number
}

export function useDocumentos(ruta: string): string[] | null {
  const [lista, setLista] = useState<string[] | null>(null)
  const leer = useCallback(() => {
    void window.iridium.documentos(ruta).then(setLista)
  }, [ruta])
  useEffect(leer, [leer])
  useDocsCambian(ruta, leer)
  return lista
}

/** Atrás (F-4): vuelve a la sección, el documento o el archivo de antes. */
export function BotonAtras({ ruta }: { ruta: string }) {
  const atras = usarEstado((s) => vistaDe(s.vistas, ruta).atras)
  const volver = usarEstado((s) => s.volver)
  const paso = atras.at(-1)
  const adonde = !paso
    ? ''
    : paso.seccion === 'docs' && paso.doc
      ? nombreDoc(paso.doc.documento)
      : {
          pendientes: 'Pendientes',
          mapa: 'el Mapa',
          docs: 'Docs',
          archivos: 'Archivos',
          revision: paso.comentario ? paso.comentario : 'Revisión',
          git: 'Git',
          scripts: 'Scripts',
        }[paso.seccion]
  return (
    <button
      type="button"
      className="atras"
      disabled={!paso}
      title={paso ? `Volver a ${adonde} (Alt+←)` : 'Volver a donde estabas (Alt+←)'}
      onClick={() => volver(ruta)}
    >
      <Icono nombre="atras" />
      Atrás
    </button>
  )
}

export function Lector({
  ruta,
  lugar,
  documentos,
  aviso,
  sinDocumento,
}: {
  ruta: string
  lugar: LugarDoc
  /** Los documentos para el menú; sin lista, no hay menú (un documento fijo). */
  documentos?: string[] | null
  /** Una línea arriba de la hoja (opcional). */
  aviso?: ReactNode
  /** Lo que se dice si el documento no existe. */
  sinDocumento?: ReactNode
}) {
  const [contenido, setContenido] = useState<{ documento: string; c: ContenidoDocumento } | null>(null)
  const [titulos, setTitulos] = useState<Titulo[]>([])
  const [sinSeccion, setSinSeccion] = useState<string | null>(null)
  const ancho = usarEstado((s) => s.preferencias.anchoHoja)
  const guardarPreferencias = usarEstado((s) => s.guardarPreferencias)
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const lectura = useRef<HTMLDivElement>(null)
  const hoja = useRef<HTMLDivElement>(null)
  const ultimo = useRef<LugarDoc | null>(null)
  const arriba = useRef(0)

  const leer = useCallback(() => {
    const documento = lugar.documento
    void window.iridium.documento(ruta, documento).then((c) => setContenido({ documento, c }))
  }, [ruta, lugar.documento])
  useEffect(leer, [leer])
  useDocsCambian(ruta, leer)

  const c = contenido?.documento === lugar.documento ? contenido.c : null
  const html = c?.tipo === 'ok' ? c.html : null

  // Con el HTML nuevo: tablas plegadas y los títulos para «En esta página».
  useLayoutEffect(() => {
    const el = hoja.current
    if (!el || html === null) {
      setTitulos([])
      return
    }
    plegarTablas(el)
    setTitulos(
      [...el.querySelectorAll<HTMLElement>('h2[id], h3[id]')].map((h) => ({
        id: h.id,
        texto: h.textContent ?? '',
        nivel: h.tagName === 'H2' ? 2 : 3,
      })),
    )
  }, [html])

  // Al llegar a un lugar nuevo, se baja a su sección (o a donde se lo dejó, al volver); si solo cambió el
  // documento en el disco, la posición se queda.
  useLayoutEffect(() => {
    const caja = lectura.current
    const el = hoja.current
    if (!caja || !c) return
    if (ultimo.current === lugar) {
      caja.scrollTop = arriba.current
      return
    }
    ultimo.current = lugar
    setSinSeccion(null)
    for (const m of el?.querySelectorAll('.marcada') ?? []) m.classList.remove('marcada')
    if (lugar.arriba !== undefined) caja.scrollTop = lugar.arriba
    else if (lugar.ancla && el) {
      const a = CSS.escape(lugar.ancla)
      const destino =
        el.querySelector<HTMLElement>(`[id="${a}"]`) ?? el.querySelector<HTMLElement>(`[data-slug="${a}"]`)
      if (destino) {
        destino.closest('.gp-tabla-caja.plegada')?.classList.remove('plegada')
        destino.classList.add('marcada')
        caja.scrollTop =
          destino.getBoundingClientRect().top - caja.getBoundingClientRect().top + caja.scrollTop - 18
      } else {
        setSinSeccion(lugar.ancla)
        caja.scrollTop = 0
      }
    } else caja.scrollTop = 0
    arriba.current = caja.scrollTop
  }, [c, lugar])

  const ir = (d: { documento: string; ancla: string }) => {
    // Sin menú de documentos, una sección del mismo documento se busca ahí mismo.
    const caja = lectura.current
    const destino = hoja.current?.querySelector<HTMLElement>(`[id="${CSS.escape(d.ancla)}"]`)
    if (!documentos && d.documento === lugar.documento && caja && destino) {
      caja.scrollTop =
        destino.getBoundingClientRect().top - caja.getBoundingClientRect().top + caja.scrollTop - 18
      return
    }
    abrirDoc(ruta, d, caja?.scrollTop ?? 0)
  }
  const anchoHoja = useMemo(() => ({ angosto: '60ch', normal: '72ch', ancho: '100ch' })[ancho], [ancho])

  return (
    <div className="lector">
      <div className="barra-doc">
        {documentos ? (
          <Menu
            titulo="Elegir otro documento"
            boton={
              <>
                <span className="nom">{nombreDoc(lugar.documento)}</span>
                <Icono nombre="chev" />
              </>
            }
          >
            {(cerrar) =>
              documentos.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="menuitem"
                  className="mono"
                  aria-current={d === lugar.documento}
                  onClick={() => {
                    cerrar()
                    ir({ documento: d, ancla: '' })
                  }}
                >
                  {nombreDoc(d)}
                </button>
              ))
            }
          </Menu>
        ) : (
          <span className="doc-fijo">{nombreDoc(lugar.documento)}</span>
        )}
        {titulos.length > 0 && (
          <Menu
            titulo="Ir a una sección de este documento"
            boton={
              <>
                En esta página
                <Icono nombre="chev" />
              </>
            }
          >
            {(cerrar) =>
              titulos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="menuitem"
                  className={t.nivel === 3 ? 'sub' : undefined}
                  title={t.texto}
                  onClick={() => {
                    cerrar()
                    ir({ documento: lugar.documento, ancla: t.id })
                  }}
                >
                  {t.texto}
                </button>
              ))
            }
          </Menu>
        )}
        <div className="der">
          <fieldset className="ancho-lectura">
            <legend>Ancho del texto</legend>
            {ANCHOS.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={ancho === a.id}
                onClick={() => guardarPreferencias({ anchoHoja: a.id })}
              >
                {a.nombre}
              </button>
            ))}
          </fieldset>
          <BotonAtras ruta={ruta} />
        </div>
      </div>
      <div
        ref={lectura}
        className="lectura"
        onScroll={(e) => {
          arriba.current = e.currentTarget.scrollTop
        }}
      >
        <div className="hoja" style={{ maxWidth: anchoHoja }}>
          {aviso}
          {sinSeccion !== null && (
            <p className="aviso-doc" role="note">
              <Icono nombre="busca" />
              No se encontró la sección «{sinSeccion}»: el documento se abre al principio.
            </p>
          )}
          {!c && <div className="doc-texto carga" aria-busy="true" />}
          {c?.tipo === 'noExiste' && (
            <p className="aviso-doc" role="note">
              <Icono nombre="busca" />
              {sinDocumento ?? (
                <>{nombreDoc(lugar.documento)} no existe. Elegí otro documento arriba, o volvé con Atrás.</>
              )}
            </p>
          )}
          {c?.tipo === 'error' && (
            <p className="aviso-doc" role="alert">
              <Icono nombre="error" />
              No se pudo leer {nombreDoc(lugar.documento)}: {c.mensaje}
            </p>
          )}
          {html !== null && (
            // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces y botones de adentro, que ya son enfocables.
            <div
              ref={hoja}
              className="doc-texto"
              onClick={(e) => {
                const b = (e.target as HTMLElement).closest<HTMLElement>('.ver-filas')
                if (b) alternarTabla(b)
                else tocarEnlace(e, ruta, () => lectura.current?.scrollTop ?? 0)
              }}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
