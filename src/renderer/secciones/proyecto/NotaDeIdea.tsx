// La nota de una idea abierta (ID-2, ID-I3): la hoja del bloc (`ui/hoja.ts`) con el título en el primer párrafo y la
// nota debajo. Pegar una dirección la vuelve una Etiqueta de enlace (PZ-14), pegar o soltar una imagen la guarda en
// `docs/ideas/T-n/` y el texto con formato se pega como texto. Se pinta una vez al abrir; cada cambio sube como el
// texto que guarda Iridium (el título en la primera línea), y quien la usa lo guarda un momento después.
import { type ClipboardEvent, type DragEvent, type MouseEvent, useLayoutEffect, useRef } from 'react'
import { bloquesDeIdea, escritoDeIdea } from '../../../compartido/ideas'
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

interface Props {
  ruta: string
  codigo: string
  titulo: string
  /** La nota como está en el disco (sin el título). */
  nota: string
  /** Sus imágenes, por ruta (`T-n/archivo`), como `data:`. */
  imagenes: Record<string, string>
  alCambiar: (escrito: string) => void
  alFallo: (mensaje: string) => void
}

export function NotaDeIdea({ ruta, codigo, titulo, nota, imagenes, alCambiar, alFallo }: Props) {
  const editor = useRef<HTMLDivElement>(null)
  const molde = useRef<HTMLSpanElement>(null)
  const inicial = useRef({ titulo, nota, imagenes })

  // Se pinta al abrir, con el cursor al final del título; después la hoja es del usuario (React no la toca).
  useLayoutEffect(() => {
    const h = editor.current
    if (!h) return
    const { titulo: t, nota: n, imagenes: im } = inicial.current
    const icono = molde.current?.firstElementChild ?? null
    h.replaceChildren(
      ...bloquesDeIdea(t, n).map((b) =>
        b.tipo === 'imagen'
          ? nodoImagen(b.ruta, im[b.ruta])
          : nodoParrafo(b.tipo === 'parrafo' ? b.partes : [], icono),
      ),
    )
    h.focus()
    if (h.firstChild) cursorAlFinal(h.firstChild)
  }, [])

  const avisar = () => {
    if (editor.current) alCambiar(escritoDeIdea(bloquesDe(editor.current)))
  }

  const pegarImagenes = async (archivos: File[]) => {
    const h = editor.current
    if (!h) return
    let despues = bloqueDelCursor(h)
    for (const a of archivos) {
      const r = await window.iridium
        .pegarImagenIdea(ruta, codigo, a.type, await base64De(a))
        .catch((e: unknown) => ({
          tipo: 'error' as const,
          mensaje: e instanceof Error ? e.message : String(e),
        }))
      if (r.tipo === 'error') {
        alFallo(r.mensaje)
        continue
      }
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
    avisar()
  }

  const alPegar = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const archivos = imagenesDe(e.clipboardData.files)
    if (archivos.length) return void pegarImagenes(archivos)
    if (pegarTexto(e, molde.current?.firstElementChild ?? null)) avisar()
  }

  const alSoltar = (e: DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.files.length) return
    e.preventDefault()
    const archivos = imagenesDe(e.dataTransfer.files)
    if (archivos.length) void pegarImagenes(archivos)
  }

  // Apretar un enlace no mueve el cursor (la hoja se correría bajo el mouse); un clic lo abre en el navegador.
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
    <>
      <span hidden ref={molde}>
        <Icono nombre="abrir" />
      </span>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/useSemanticElements: una nota con enlaces e imágenes no entra en un textarea; el clic solo abre los enlaces de adentro. */}
      <div
        ref={editor}
        className="texto-doc idp-nota"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        aria-multiline="true"
        aria-label={`Idea ${titulo}: la primera línea es el título`}
        tabIndex={0}
        onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')}
        onInput={avisar}
        onPaste={alPegar}
        onDrop={alSoltar}
        onMouseDown={alApretar}
        onClick={alTocar}
      />
    </>
  )
}
