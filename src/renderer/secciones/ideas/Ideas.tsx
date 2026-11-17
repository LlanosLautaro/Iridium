// Ideas del inicio como bloc de notas (D-112, D-126; la maqueta `docs/diseno/pantallas/ideas.html`): una sola hoja
// libre, sin estados ni destinos. Se escribe, se pegan enlaces e imágenes y se guarda solo en `notas.md` de la carpeta
// Ideas. Lo que se quiera hacer se le pide a la IA en el chat general, al lado.
//
// La hoja es un `contenteditable` que React no toca por dentro: se arma desde el texto al abrir (o cuando cambia afuera
// sin estar escribiendo) y, en cada cambio, se lee de vuelta a texto y se guarda un momento después.
import {
  type ClipboardEvent,
  type CSSProperties,
  type DragEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  type Bloque,
  conHoy,
  escribirNotas,
  type HojaNotas,
  leerNotas,
  nombreDelDia,
} from '../../../compartido/notas'
import { CARPETA_GENERAL } from '../../../compartido/puente'
import { tamanoLegible } from '../../../compartido/tamanos'
import { rutaGeneral, usarEstado } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Divisor, useAnchoConversacion } from '../../ui/Divisor'
import {
  abrirEnlace,
  base64De,
  bloqueDelCursor,
  bloquesDe,
  cursorAlFinal,
  enlaceTocado,
  imagenesDe,
  nodoImagen,
  nodoParrafo,
  pegarTexto,
} from '../../ui/hoja'
import { Icono } from '../../ui/Icono'
import { AbrirComoProyecto } from '../inicio/AbrirComoProyecto'
import { ChatGeneral } from '../inicio/ChatGeneral'
import { mismaRuta } from '../proyecto/enlaces'

/** Cuánto se espera después de la última tecla para guardar. */
const ESPERA_GUARDAR = 600

function nodos(bloques: readonly Bloque[], imagenes: Record<string, string>, icono: Element | null): Node[] {
  const hoy = new Date()
  return bloques.map((b) => {
    if (b.tipo === 'imagen') return nodoImagen(b.ruta, imagenes[b.ruta])
    if (b.tipo === 'parrafo') return nodoParrafo(b.partes, icono)
    const p = document.createElement('p')
    p.className = 'fecha'
    p.contentEditable = 'false'
    p.dataset.fecha = b.fecha
    p.textContent = nombreDelDia(b.fecha, hoy)
    return p
  })
}

// ── La sección ──

export function Ideas() {
  const lista = usarEstado((s) => s.lista)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const ancho = useAnchoConversacion('general')
  const rutaIdeas = rutaGeneral(lista)
  const [hoja, setHoja] = useState<HojaNotas | null>(null)
  const [fallo, setFallo] = useState<string | null>(null)
  const editor = useRef<HTMLDivElement>(null)
  const molde = useRef<HTMLSpanElement>(null)
  const imagenes = useRef<Record<string, string>>({})
  /** Lo último que se leyó o se guardó: lo que está en el disco. */
  const enDisco = useRef<string | null>(null)
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pintar = useCallback((texto: string) => {
    const h = editor.current
    if (!h) return
    enDisco.current = texto
    const icono = molde.current?.firstElementChild ?? null
    h.replaceChildren(...nodos(conHoy(leerNotas(texto), new Date()), imagenes.current, icono))
  }, [])

  const leer = useCallback(() => {
    void window.iridium.notas().then(
      (r) => {
        if (r.tipo === 'ok') imagenes.current = { ...imagenes.current, ...r.imagenes }
        setHoja(r)
      },
      (e: unknown) => setHoja({ tipo: 'error', mensaje: e instanceof Error ? e.message : String(e) }),
    )
  }, [])

  const guardar = useCallback(async () => {
    if (espera.current) clearTimeout(espera.current)
    espera.current = null
    const h = editor.current
    if (!h) return
    const texto = escribirNotas(bloquesDe(h))
    if (texto === enDisco.current) return
    const r = await window.iridium.guardarNotas(texto).catch((e: unknown) => ({
      tipo: 'error' as const,
      mensaje: e instanceof Error ? e.message : String(e),
    }))
    if (r.tipo === 'ok') {
      enDisco.current = texto
      setFallo(null)
    } else setFallo(r.mensaje)
  }, [])

  const programar = useCallback(() => {
    if (espera.current) clearTimeout(espera.current)
    espera.current = setTimeout(() => void guardar(), ESPERA_GUARDAR)
  }, [guardar])

  // Al entrar se lee; cuando cambia algo de la carpeta Ideas (la IA, VS Code), se relee. Al salir, se guarda lo que falte.
  useEffect(() => {
    leer()
    const dejar = window.iridium.alCambiarDocs((r) => {
      if (rutaIdeas ? mismaRuta(r, rutaIdeas) : r.split(/[\\/]/).pop() === CARPETA_GENERAL) leer()
    })
    return () => {
      dejar()
      if (espera.current) void guardar()
    }
  }, [leer, guardar, rutaIdeas])

  // Lo leído se pinta si es distinto de lo que hay y no se está escribiendo (con el foco, espera a que se vaya).
  useEffect(() => {
    if (hoja?.tipo !== 'ok' || hoja.texto === enDisco.current) return
    if (editor.current && document.activeElement === editor.current && enDisco.current !== null) return
    pintar(hoja.texto)
  }, [hoja, pintar])

  const alSalir = () => {
    void guardar().then(() => {
      if (hoja?.tipo === 'ok' && hoja.texto !== enDisco.current && espera.current === null) pintar(hoja.texto)
    })
  }

  const pegarImagenes = async (archivos: File[]) => {
    const h = editor.current
    if (!h) return
    let despues = bloqueDelCursor(h)
    for (const a of archivos) {
      const r = await window.iridium.pegarImagenNotas(a.type, await base64De(a)).catch((e: unknown) => ({
        tipo: 'error' as const,
        mensaje: e instanceof Error ? e.message : String(e),
      }))
      if (r.tipo === 'error') {
        setFallo(`No se pegó la imagen: ${r.mensaje}`)
        continue
      }
      imagenes.current[r.ruta] = r.url
      const nodo = nodoImagen(r.ruta, r.url)
      if (despues) despues.after(nodo)
      else h.append(nodo)
      despues = nodo
    }
    // Debajo de la imagen, un párrafo para seguir escribiendo.
    const sigue = nodoParrafo([], null)
    if (despues) despues.after(sigue)
    else h.append(sigue)
    cursorAlFinal(sigue)
    void guardar()
  }

  const alPegar = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const archivos = imagenesDe(e.clipboardData.files)
    if (archivos.length) return void pegarImagenes(archivos)
    if (pegarTexto(e, molde.current?.firstElementChild ?? null)) programar()
  }

  const alSoltar = (e: DragEvent<HTMLDivElement>) => {
    const archivos = imagenesDe(e.dataTransfer.files)
    if (!e.dataTransfer.files.length) return
    e.preventDefault()
    if (archivos.length) void pegarImagenes(archivos)
  }

  // Un enlace se abre en el navegador; no se edita (para cambiarlo, se borra y se pega otro). Apretarlo no mueve el
  // cursor: si lo moviera, la hoja se corre bajo el mouse y el clic no llega al enlace.
  const alApretar = (e: MouseEvent<HTMLDivElement>) => {
    if (enlaceTocado(e.target)) e.preventDefault()
  }
  const alTocar = (e: MouseEvent<HTMLDivElement>) => {
    const a = enlaceTocado(e.target)
    if (!a) return
    e.preventDefault()
    abrirEnlace(a)
  }

  return (
    <main className="trabajo proyecto" style={{ '--ancho-chat': `${ancho}px` } as CSSProperties}>
      <section className="zona-principal ideas-inicio" aria-label="Ideas">
        <Cabecera
          nivel={1}
          titulo="Ideas"
          acciones={rutaIdeas && <AbrirComoProyecto abrir={() => abrirProyecto(rutaIdeas)} carpeta="Ideas" />}
        />
        <div className="id-cuerpo">
          <div className="id-col">
            <span hidden ref={molde}>
              <Icono nombre="abrir" />
            </span>
            {fallo && (
              <div className="recuadro error" role="alert">
                <Icono nombre="error" />
                <div className="cuerpo-recuadro">
                  <strong>No se guardó lo último</strong>
                  <span>{fallo}</span>
                  <div className="acciones-recuadro">
                    <button type="button" className="boton secundario chico" onClick={() => void guardar()}>
                      <Icono nombre="reintentar" />
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            )}
            <AvisoHoja hoja={hoja} reintentar={leer} />
            {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/useSemanticElements: una hoja con enlaces e imágenes no entra en un textarea; el clic solo abre los enlaces de adentro. */}
            <div
              ref={editor}
              className="hoja-notas texto-doc"
              contentEditable={hoja?.tipo === 'ok'}
              suppressContentEditableWarning
              spellCheck={false}
              role="textbox"
              aria-multiline="true"
              aria-label="Ideas"
              tabIndex={0}
              hidden={hoja?.tipo !== 'ok'}
              onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')}
              onInput={programar}
              onBlur={alSalir}
              onPaste={alPegar}
              onDrop={alSoltar}
              onMouseDown={alApretar}
              onClick={alTocar}
            />
          </div>
        </div>
      </section>
      <Divisor vista="general" ancho={ancho} />
      <aside className="chat" aria-label="Chat general">
        <ChatGeneral />
      </aside>
    </main>
  )
}

/** Lo que pasa cuando no hay una hoja para escribir. */
function AvisoHoja({ hoja, reintentar }: { hoja: HojaNotas | null; reintentar: () => void }) {
  if (hoja === null || hoja.tipo === 'ok') return null
  if (hoja.tipo === 'sin-carpeta')
    return (
      <div className="recuadro error" role="alert">
        <Icono nombre="error" />
        <div className="cuerpo-recuadro">
          <strong>No está la carpeta Ideas</strong>
          <span>
            Iridium guarda la hoja en la carpeta <code>{CARPETA_GENERAL}</code> de <code>.iridium</code>, en
            tu carpeta de proyectos, y no pudo crearla. Revisa esa carpeta en Ajustes › Proyectos.
          </span>
        </div>
      </div>
    )
  if (hoja.tipo === 'grande')
    return (
      <div className="recuadro aviso" role="note">
        <Icono nombre="error" />
        <div className="cuerpo-recuadro">
          <strong>La hoja es muy grande para abrirla aquí</strong>
          <span>
            <code>notas.md</code> pesa {tamanoLegible(hoja.bytes)}. Ábrela con Abrir como proyecto.
          </span>
        </div>
      </div>
    )
  return (
    <div className="recuadro error" role="alert">
      <Icono nombre="error" />
      <div className="cuerpo-recuadro">
        <strong>No se pudo leer la hoja</strong>
        <span>{hoja.mensaje}</span>
        <div className="acciones-recuadro">
          <button type="button" className="boton secundario chico" onClick={reintentar}>
            <Icono nombre="reintentar" />
            Reintentar
          </button>
        </div>
      </div>
    </div>
  )
}
