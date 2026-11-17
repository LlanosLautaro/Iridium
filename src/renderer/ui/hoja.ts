// La hoja que se escribe libre (el bloc de Ideas, D-112, y la nota de una idea abierta, ID-2): un `contenteditable` que
// React no toca por dentro. Se arma desde los bloques de `compartido/notas.ts` y, en cada cambio, se lee de vuelta.
// Pegar una dirección la vuelve una Etiqueta de enlace (PZ-14), pegar una imagen la guarda quien la usa, y el texto con
// formato se pega como texto.
import type { ClipboardEvent } from 'react'
import { type Bloque, esDireccion, type Parte, verEnlace } from '../../compartido/notas'
import { TIPOS_IMAGEN } from '../../compartido/visor'

export function nodoEnlace(p: { texto: string | null; url: string }, icono: Element | null): HTMLElement {
  const a = document.createElement('a')
  const { nombre, sitio } = verEnlace(p)
  a.className = 'nota-enlace'
  a.href = p.url
  a.title = p.url
  a.contentEditable = 'false'
  a.dataset.url = p.url
  if (p.texto) a.dataset.texto = p.texto
  if (icono) a.append(icono.cloneNode(true))
  a.append(nombre)
  if (sitio) {
    const s = document.createElement('span')
    s.className = 'sitio'
    s.textContent = sitio
    a.append(s)
  }
  return a
}

export function nodoParrafo(partes: readonly Parte[], icono: Element | null): HTMLElement {
  const p = document.createElement('p')
  for (const parte of partes) {
    if (parte.tipo === 'enlace') p.append(nodoEnlace(parte, icono))
    else
      parte.texto.split('\n').forEach((linea, i) => {
        if (i > 0) p.append(document.createElement('br'))
        if (linea) p.append(linea)
      })
  }
  // Un párrafo vacío necesita algo para que se pueda poner el cursor.
  if (!p.textContent && !p.querySelector('a')) p.append(document.createElement('br'))
  return p
}

export function nodoImagen(ruta: string, url: string | undefined): HTMLElement {
  const p = document.createElement('p')
  p.className = url ? 'nota-imagen' : 'nota-imagen falta'
  p.contentEditable = 'false'
  p.dataset.ruta = ruta
  if (url) {
    const img = document.createElement('img')
    img.src = url
    img.alt = 'Imagen pegada'
    p.append(img)
  } else p.textContent = `No se encuentra la imagen ${ruta}`
  return p
}

/** Las partes de un párrafo de la página: el texto, los saltos y los enlaces (lo demás, como su texto). */
function partesDeNodo(nodo: Node, partes: Parte[]): void {
  for (const n of nodo.childNodes) {
    if (n.nodeType === Node.TEXT_NODE)
      partes.push({ tipo: 'texto', texto: (n.textContent ?? '').replace(/ /g, ' ') })
    else if (n instanceof HTMLBRElement) partes.push({ tipo: 'texto', texto: '\n' })
    else if (n instanceof HTMLElement && n.dataset.url)
      partes.push({ tipo: 'enlace', texto: n.dataset.texto ?? null, url: n.dataset.url })
    else if (n instanceof HTMLElement && /^(P|DIV)$/.test(n.tagName)) {
      partes.push({ tipo: 'texto', texto: '\n' })
      partesDeNodo(n, partes)
    } else partesDeNodo(n, partes)
  }
}

export function bloquesDe(hoja: HTMLElement): Bloque[] {
  const bloques: Bloque[] = []
  for (const n of hoja.childNodes) {
    if (n instanceof HTMLElement && n.dataset.fecha) bloques.push({ tipo: 'fecha', fecha: n.dataset.fecha })
    else if (n instanceof HTMLElement && n.dataset.ruta)
      bloques.push({ tipo: 'imagen', ruta: n.dataset.ruta })
    else {
      const partes: Parte[] = []
      if (n.nodeType === Node.TEXT_NODE) partes.push({ tipo: 'texto', texto: n.textContent ?? '' })
      else partesDeNodo(n, partes)
      bloques.push({ tipo: 'parrafo', partes })
    }
  }
  return bloques
}

/** El hijo directo de la hoja donde está el cursor (o el último, si el cursor no está adentro). */
export function bloqueDelCursor(hoja: HTMLElement): ChildNode | null {
  const sel = getSelection()
  let n: Node | null = sel?.rangeCount ? sel.getRangeAt(0).startContainer : null
  if (!n || !hoja.contains(n)) return hoja.lastChild
  while (n && n.parentNode !== hoja) n = n.parentNode
  return (n as ChildNode | null) ?? hoja.lastChild
}

export function cursorAlFinal(nodo: Node): void {
  const r = document.createRange()
  r.selectNodeContents(nodo)
  r.collapse(false)
  const sel = getSelection()
  sel?.removeAllRanges()
  sel?.addRange(r)
}

export function base64De(archivo: File): Promise<string> {
  return new Promise((listo, falla) => {
    const lector = new FileReader()
    lector.onload = () => listo(String(lector.result).replace(/^data:[^,]*,/, ''))
    lector.onerror = () => falla(lector.error)
    lector.readAsDataURL(archivo)
  })
}

/** Las imágenes de lo que se pega o se suelta (solo las que se pueden guardar). */
export const imagenesDe = (archivos: FileList | null) =>
  [...(archivos ?? [])].filter((a) => TIPOS_IMAGEN[a.type])

/**
 * Pega en la hoja lo que no es una imagen: una dirección sola, como Etiqueta de enlace; lo demás, solo su texto (sin el
 * formato de donde vino), cada línea un párrafo. Devuelve si pegó algo. Las imágenes las pega quien usa la hoja.
 */
export function pegarTexto(e: ClipboardEvent<HTMLElement>, icono: Element | null): boolean {
  const html = e.clipboardData.getData('text/html')
  // Sin los renglones vacíos de los extremos (Windows los suma alrededor de lo copiado con formato).
  const texto = (
    e.clipboardData.getData('text/plain') ||
    (html ? (new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '') : '')
  ).replace(/^(?:[ \t]*\r?\n)+|(?:\r?\n[ \t]*)+$/g, '')
  if (!texto) return false
  if (esDireccion(texto)) {
    const sel = getSelection()
    if (!sel?.rangeCount) return false
    const r = sel.getRangeAt(0)
    r.deleteContents()
    const a = nodoEnlace({ texto: null, url: texto.trim() }, icono)
    const espacio = document.createTextNode(' ')
    r.insertNode(espacio)
    r.insertNode(a)
    r.setStartAfter(espacio)
    r.collapse(true)
    sel.removeAllRanges()
    sel.addRange(r)
  } else
    texto.split(/\r?\n/).forEach((linea, i) => {
      if (i > 0) document.execCommand('insertParagraph')
      if (linea) document.execCommand('insertText', false, linea)
    })
  return true
}

/** Un enlace de la hoja se abre en el navegador; no se edita (para cambiarlo, se borra y se pega otro). */
export function enlaceTocado(destino: EventTarget): HTMLElement | null {
  return (destino as HTMLElement).closest<HTMLElement>('a[data-url]')
}

export function abrirEnlace(a: HTMLElement): void {
  if (a.dataset.url && /^https?:\/\//i.test(a.dataset.url)) window.open(a.dataset.url)
}
