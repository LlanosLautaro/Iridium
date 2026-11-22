// Docs (H-8, W-8, D-035), como la maqueta desde DI-I3, tanda 11 (docs/diseno/pantallas/docs.html): la Cabecera con el
// documento, «En esta página», el ancho del texto, Atrás y Abrir en Archivos; a la izquierda el Árbol de los documentos
// y a la derecha el Texto de documento centrado, con los códigos y las citas como enlaces. Las tablas de más de seis
// filas empiezan plegadas. Si el documento cambia mientras se lee, se actualiza sin perder la posición.
import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { AnchoHoja } from '../../../compartido/puente'
import type { ContenidoDocumento } from '../../../compartido/visor'
import { type LugarDoc, usarEstado, vistaDe } from '../../estado'
import { Cabecera, Filtros } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { Menu } from '../../ui/Menu'
import { arbolDeDocs, contiene, type NodoDoc } from './arbolDocs'
import { nombreDoc, tocarEnlace, useDocsCambian } from './enlaces'

export const ANCHOS: { id: AnchoHoja; nombre: string }[] = [
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
          pendientes: 'la Bandeja de entrada',
          mapa: 'Frentes',
          ideas: 'Ideas',
          docs: 'Docs',
          archivos: 'Archivos',
          revision: paso.comentario ? paso.comentario : 'Revisión',
          git: 'Git',
          scripts: 'Scripts',
          skills: 'las Skills',
          diseno: 'Diseño',
        }[paso.seccion]
  return (
    <button
      type="button"
      className="boton sin-fondo chico"
      disabled={!paso}
      title={paso ? `Volver a ${adonde} (Alt+←)` : 'Volver a donde estabas (Alt+←)'}
      onClick={() => volver(ruta)}
    >
      <Icono nombre="atras" />
      Atrás
    </button>
  )
}

/** El Árbol de los documentos (PZ-11). */
function ArbolDocs({
  nodos,
  actual,
  abrir,
  abiertas,
  alternar,
  nivel = 0,
}: {
  nodos: NodoDoc[]
  actual: string
  abrir: (documento: string) => void
  abiertas: Set<string>
  alternar: (clave: string) => void
  nivel?: number
}) {
  const sangria = nivel > 0 ? ({ '--nivel': nivel } as CSSProperties) : undefined
  return (
    <>
      {nodos.map((n) => {
        if (n.tipo === 'doc')
          return (
            <button
              key={n.ruta}
              type="button"
              className={n.ruta === actual ? 'nodo elegido' : 'nodo'}
              style={sangria}
              title={n.ruta}
              aria-current={n.ruta === actual ? 'page' : undefined}
              onClick={() => abrir(n.ruta)}
            >
              <Icono nombre="archivo" />
              <span className="docs-nombre">{n.nombre}</span>
            </button>
          )
        const abierta = abiertas.has(n.clave)
        return (
          <div key={n.clave} className="docs-carpeta">
            <button
              type="button"
              className="nodo carpeta"
              style={sangria}
              aria-expanded={abierta}
              onClick={() => alternar(n.clave)}
            >
              <Icono nombre="chev" />
              <span className="docs-nombre">{n.nombre}</span>
            </button>
            {abierta && (
              <ArbolDocs
                nodos={n.hijos}
                actual={actual}
                abrir={abrir}
                abiertas={abiertas}
                alternar={alternar}
                nivel={nivel + 1}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

/** Las carpetas abiertas: las que se abrieron a mano y, si nadie las tocó, las del documento que se lee. */
function useCarpetasAbiertas(arbol: NodoDoc[], actual: string) {
  const [tocadas, setTocadas] = useState<Map<string, boolean>>(() => new Map())
  const abiertas = useMemo(() => {
    const r = new Set<string>()
    const recorrer = (nodos: NodoDoc[]) => {
      for (const n of nodos) {
        if (n.tipo !== 'carpeta') continue
        if (tocadas.get(n.clave) ?? contiene(n, actual)) r.add(n.clave)
        recorrer(n.hijos)
      }
    }
    recorrer(arbol)
    return r
  }, [arbol, actual, tocadas])
  // Al pasar a otro documento, su carpeta se abre aunque se la haya cerrado antes.
  useEffect(() => {
    const delActual = new Set<string>()
    const recorrer = (nodos: NodoDoc[]) => {
      for (const n of nodos)
        if (n.tipo === 'carpeta' && contiene(n, actual)) {
          delActual.add(n.clave)
          recorrer(n.hijos)
        }
    }
    recorrer(arbol)
    setTocadas((m) => {
      const quedan = [...m].filter(([clave]) => !delActual.has(clave))
      return quedan.length === m.size ? m : new Map(quedan)
    })
  }, [arbol, actual])
  const alternar = (clave: string) => setTocadas((m) => new Map(m).set(clave, !abiertas.has(clave)))
  return { abiertas, alternar }
}

export function Lector({ ruta, lugar, documentos }: { ruta: string; lugar: LugarDoc; documentos: string[] }) {
  const [contenido, setContenido] = useState<{ documento: string; c: ContenidoDocumento } | null>(null)
  const [titulos, setTitulos] = useState<Titulo[]>([])
  const [sinSeccion, setSinSeccion] = useState<string | null>(null)
  const ancho = usarEstado((s) => s.preferencias.anchoHoja)
  const guardarPreferencias = usarEstado((s) => s.guardarPreferencias)
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const abrirArchivo = usarEstado((s) => s.abrirArchivo)
  const lectura = useRef<HTMLDivElement>(null)
  const hoja = useRef<HTMLDivElement>(null)
  const ultimo = useRef<LugarDoc | null>(null)
  const arriba = useRef(0)
  const arbol = useMemo(() => arbolDeDocs(documentos), [documentos])
  const { abiertas, alternar } = useCarpetasAbiertas(arbol, lugar.documento)

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

  const ir = (d: { documento: string; ancla: string }) => abrirDoc(ruta, d, lectura.current?.scrollTop ?? 0)
  const anchoHoja = useMemo(() => ({ angosto: '60ch', normal: '72ch', ancho: '100ch' })[ancho], [ancho])

  return (
    <>
      <Cabecera
        titulo="Docs"
        sub={<span className="docs-ruta">{nombreDoc(lugar.documento)}</span>}
        acciones={
          <>
            {titulos.length > 0 && (
              <Menu
                clase="en-pagina"
                titulo="Ir a una sección de este documento"
                claseBoton="boton sin-fondo chico docs-en-pagina"
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
            <span className="docs-anchos">
              <Filtros
                etiqueta="Ancho del texto"
                elegido={ancho}
                elegir={(a) => guardarPreferencias({ anchoHoja: a as AnchoHoja })}
                filtros={ANCHOS.map((a) => ({ clave: a.id, nombre: a.nombre }))}
              />
            </span>
            <BotonAtras ruta={ruta} />
            <button
              type="button"
              className="boton sin-fondo solo-icono"
              aria-label="Abrir en Archivos"
              title="Abrir en Archivos"
              onClick={() => abrirArchivo(ruta, lugar.documento)}
            >
              <Icono nombre="abrir" />
            </button>
          </>
        }
      />
      <div className="docs-cols">
        <nav className="arbol" aria-label="Documentos">
          <ArbolDocs
            nodos={arbol}
            actual={lugar.documento}
            abrir={(d) => ir({ documento: d, ancla: '' })}
            abiertas={abiertas}
            alternar={alternar}
          />
        </nav>
        <div
          ref={lectura}
          className="docs-lectura"
          onScroll={(e) => {
            arriba.current = e.currentTarget.scrollTop
          }}
        >
          <div className="docs-hoja" style={{ maxWidth: anchoHoja }}>
            {sinSeccion !== null && (
              <div className="recuadro aviso" role="note">
                <Icono nombre="busca" />
                <span>No se encontró la sección «{sinSeccion}»: el documento se abre al principio.</span>
              </div>
            )}
            {!c && <div className="docs-carga" aria-busy="true" />}
            {c?.tipo === 'noExiste' && (
              <div className="recuadro aviso" role="note">
                <Icono nombre="busca" />
                <span>
                  {nombreDoc(lugar.documento)} no existe. Elige otro documento a la izquierda o vuelve con
                  Atrás.
                </span>
              </div>
            )}
            {c?.tipo === 'error' && (
              <div className="recuadro error" role="alert">
                <Icono nombre="error" />
                <span>
                  No se pudo leer {nombreDoc(lugar.documento)}: {c.mensaje}
                </span>
              </div>
            )}
            {html !== null && (
              // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: solo delega los clics de los enlaces y botones de adentro, que ya son enfocables.
              <div
                ref={hoja}
                className="texto-doc docs-texto"
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
    </>
  )
}
