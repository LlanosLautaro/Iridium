// Copiado de la app anterior de proyectos (D-026).
// Respuestas `docs/respuestas/Q-n.md` (D-030, D-033, D-035). Formato que escribe el visor:
//   # Q-7 — ¿La miniatura muestra el modelo 3D o la textura plana?
//
//   **Opción:** Otro            ← solo si la pregunta tiene opciones
//
//   Prefiero 3D, mirá la captura.
//
//   ![captura 1](Q-7/captura-1.png)
//
//   > Procesada el 2026-10-10 → D-33   ← la agrega la IA, nunca el visor
// La lectura es tolerante: el usuario también puede escribir el archivo a mano.

import { POSTERGADA } from '../../../compartido/respuestas'
import type { EstadoPregunta, OpcionPregunta } from '../../../compartido/visor'
import { partirLineas } from './lineas'

export interface RespuestaLeida {
  /** Letra de la opción, `Otro` o null. */
  opcion: string | null
  texto: string
  /** Relativas a `docs/respuestas/`. */
  imagenes: string[]
  procesada: { fecha: string; destino: string | null } | null
}

export const OTRO = 'Otro'
export const CARPETA_RESPUESTAS = 'docs/respuestas'

const PROCESADA = /^\s*>\s*Procesada el\s+(\d{4}-\d{2}-\d{2})\s*(?:(?:→|->)\s*(.*?))?\s*$/i
const OPCION = /^\s*\*\*Opción:\*\*\s*(.*?)\s*$/i

export function esCodigoDePregunta(codigo: string): boolean {
  return /^Q-[1-9]\d{0,3}$/.test(codigo)
}

export function rutaRespuesta(codigo: string): string {
  return `${CARPETA_RESPUESTAS}/${codigo}.md`
}

/** Una imagen de la respuesta: `Q-7/<nombre>` sin subir de carpeta. */
export function esImagenDe(codigo: string, ruta: string): boolean {
  const prefijo = `${codigo}/`
  if (!ruta.startsWith(prefijo)) return false
  const nombre = ruta.slice(prefijo.length)
  return nombre !== '' && !/[\\/]/.test(nombre) && nombre !== '.' && nombre !== '..'
}

export function leerRespuesta(texto: string, codigo: string): RespuestaLeida {
  const imagen = new RegExp(String.raw`^\s*!\[[^\]]*\]\(\s*<?(${codigo}/[^)>\s]+)>?\s*\)\s*$`)
  let procesada: RespuestaLeida['procesada'] = null
  let opcion: string | null = null
  const imagenes: string[] = []
  const resto: string[] = []
  let titulo = false
  for (const linea of partirLineas(texto)) {
    const p = PROCESADA.exec(linea)
    if (p?.[1]) {
      procesada = { fecha: p[1], destino: p[2] ? p[2] : null }
      continue
    }
    if (!titulo && /^\s*#\s/.test(linea)) {
      titulo = true
      continue
    }
    const o = OPCION.exec(linea)
    if (o && opcion === null) {
      opcion = leerOpcionElegida(o[1] ?? '')
      continue
    }
    const im = imagen.exec(linea)
    if (im?.[1] && esImagenDe(codigo, im[1])) {
      imagenes.push(im[1])
      continue
    }
    resto.push(linea)
  }
  return { opcion, texto: recortarLineasVacias(resto).join('\n'), imagenes, procesada }
}

/** `A) 3D` → `A`; `Otro` → `Otro`; `Postergada: …` → `Postergada` (D-063). */
function leerOpcionElegida(valor: string): string | null {
  if (/^otro\b/i.test(valor)) return OTRO
  if (/^postergad[ao]\b/i.test(valor)) return POSTERGADA
  const m = /^([A-Z])\)/.exec(valor)
  return m?.[1] ?? null
}

function recortarLineasVacias(lineas: string[]): string[] {
  let a = 0
  let b = lineas.length
  while (a < b && (lineas[a] ?? '').trim() === '') a++
  while (b > a && (lineas[b - 1] ?? '').trim() === '') b--
  return lineas.slice(a, b).map((l) => l.trimEnd())
}

/** ¿La respuesta dice algo? Una opción con letra cuenta; Otro, solo con texto o imágenes. */
export function tieneContenido(r: Pick<RespuestaLeida, 'opcion' | 'texto' | 'imagenes'>): boolean {
  if (r.opcion !== null && r.opcion !== OTRO) return true
  return r.texto.trim() !== '' || r.imagenes.length > 0
}

/** La pregunta que dice el título de la respuesta (`# Q-7 — ¿…?`), o null si no la dice (escrita a mano). */
export function preguntaRespondida(texto: string, codigo: string): string | null {
  const m = /^\s*#\s+(.*)$/m.exec(texto)
  if (!m?.[1]) return null
  const resto = m[1].trim()
  if (!resto.startsWith(codigo) || /^\d/.test(resto.slice(codigo.length))) return null
  const pregunta = resto
    .slice(codigo.length)
    .replace(/^\s*[—–:-]\s*/, '')
    .trim()
  return pregunta === '' ? null : pregunta
}

/** Para comparar preguntas: sin marcas de Markdown, espacios ni mayúsculas. */
function normalizar(pregunta: string): string {
  return pregunta
    .replace(/\*\*|__|`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * ¿El archivo responde a esta pregunta? Si la IA cambió la pregunta y dejó el mismo código, el título del archivo
 * dice la anterior: esa respuesta no es de la pregunta nueva. Sin título con pregunta (a mano), se toma como suya.
 */
export function esRespuestaDe(texto: string, codigo: string, pregunta: string): boolean {
  const respondida = preguntaRespondida(texto, codigo)
  return respondida === null || normalizar(respondida) === normalizar(pregunta)
}

/** La respuesta de esta pregunta, o null si no hay archivo o el archivo es de una pregunta anterior con el mismo código. */
export function leerRespuestaDe(
  texto: string | null,
  codigo: string,
  pregunta: string,
): RespuestaLeida | null {
  if (texto === null || !esRespuestaDe(texto, codigo, pregunta)) return null
  return leerRespuesta(texto, codigo)
}

export function estadoDe(r: RespuestaLeida | null): EstadoPregunta {
  if (!r) return 'sin-responder'
  if (r.procesada) return 'procesada'
  return tieneContenido(r) ? 'respondida' : 'sin-responder'
}

export interface DatosRespuesta {
  codigo: string
  pregunta: string
  opciones: OpcionPregunta[]
  opcion: string | null
  texto: string
  imagenes: string[]
}

/** Arma el archivo. Con una opción con letra, solo la opción (D-035): el texto y las capturas quedan fuera. */
export function armarRespuesta(d: DatosRespuesta): string {
  const partes = [`# ${d.codigo} — ${d.pregunta}`.trimEnd()]
  const elegida = d.opciones.find((o) => o.letra === d.opcion)
  const conOpciones = d.opciones.length > 0 && d.opcion !== null
  if (conOpciones && elegida) {
    partes.push(`**Opción:** ${elegida.letra}) ${elegida.texto}`)
    return `${partes.join('\n\n')}\n`
  }
  const cuerpo = recortarLineasVacias(d.texto.replace(/\r\n/g, '\n').split('\n')).join('\n')
  if (!tieneContenido({ opcion: null, texto: cuerpo, imagenes: d.imagenes })) return `${partes[0]}\n`
  if (conOpciones && d.opcion === OTRO) partes.push(`**Opción:** ${OTRO}`)
  if (cuerpo !== '') partes.push(cuerpo)
  if (d.imagenes.length > 0) partes.push(d.imagenes.map((ruta) => `![${altDe(ruta)}](${ruta})`).join('\n'))
  return `${partes.join('\n\n')}\n`
}

/** `Q-7/captura-1.png` → `captura 1`. */
function altDe(ruta: string): string {
  const nombre = ruta.slice(ruta.lastIndexOf('/') + 1)
  return nombre.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
}

/** Nombre de la próxima captura: `captura-<n>.<ext>` con el número siguiente al mayor que exista. */
export function siguienteCaptura(existentes: readonly string[], extension: string): string {
  let mayor = 0
  for (const e of existentes) {
    const m = /^captura-(\d+)\./i.exec(e)
    if (m?.[1]) mayor = Math.max(mayor, Number(m[1]))
  }
  return `captura-${mayor + 1}.${extension}`
}

/** Huella del contenido (FNV-1a de 32 bits): alcanza para saber si el archivo cambió. Vacía si no existe. */
export function huella(texto: string | null): string {
  if (texto === null) return ''
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return `${(h >>> 0).toString(16)}-${texto.length}`
}

/** Huella de la respuesta tal como la ve una pregunta: cambia si cambia el archivo o la pregunta. Vacía si no existe. */
export function huellaDe(texto: string | null, pregunta: string): string {
  return texto === null ? '' : huella(`${normalizar(pregunta)}\n${texto}`)
}
