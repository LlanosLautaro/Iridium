// La sección Ideas (frente Ideas, D-128 a D-130; `modulos/ideas/diseno-tecnico.md`): de los `T-n` de `trabajo.md` a
// la lista, y los cambios que hace Iridium en el texto de `trabajo.md`. Reglas puras: reciben y devuelven texto.
import type { EstadoIdea, FiltroIdeas, IdeaVista } from '../../compartido/ideas'
import type { Estado } from './estados'
import { type ItemTrabajo, leerTrabajo, type TipoIdea } from './trabajo'
import { partirLineas } from './visor/lineas'

/** Lo que se escribe al rechazar sin motivo (D-129: el framework pide uno en `descartado`). */
export const MOTIVO_RECHAZO = 'Rechazada por el usuario.'

const ESTADO_IDEA: Record<Estado, EstadoIdea> = {
  nueva: 'sin-evaluar',
  pendiente: 'aprobada',
  'en curso': 'aprobada',
  'en pausa': 'aprobada',
  descartado: 'rechazada',
  hecho: 'hecha',
}

/**
 * Los `T-n` que son ideas: los que tienen `Idea:` y los `nueva` sin él (se leen como de la IA, D-130). Lo más nuevo
 * primero: por fecha y, el mismo día, por código.
 */
export function ideasDe(
  items: readonly ItemTrabajo[],
  conNota: ReadonlySet<string> = new Set(),
): IdeaVista[] {
  const ideas: IdeaVista[] = []
  for (const i of items) {
    const de = i.idea ?? (i.ideaTexto === null && i.estado === 'nueva' ? 'IA' : null)
    if (!de) continue
    ideas.push({
      codigo: i.codigo,
      titulo: i.titulo,
      de,
      estado: i.estado ? ESTADO_IDEA[i.estado] : 'sin-evaluar',
      fecha: i.fecha,
      enlace: de === 'enlace' ? i.enlace : null,
      texto: i.texto,
      conNota: de === 'usuario' && conNota.has(i.codigo),
    })
  }
  const numero = (c: string) => Number(c.slice(2))
  return ideas.sort(
    (a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? '') || numero(b.codigo) - numero(a.codigo),
  )
}

/** Si la idea entra en el filtro (ID-3): «Todo» no muestra las hechas; un enlace revisado es una hecha. */
export function entraEnFiltro(idea: IdeaVista, filtro: FiltroIdeas): boolean {
  const enlace = idea.de === 'enlace'
  switch (filtro) {
    case 'todo':
      return idea.estado !== 'hecha'
    case 'para-revisar':
      return enlace && idea.estado !== 'hecha'
    case 'sin-evaluar':
      return !enlace && idea.estado === 'sin-evaluar'
    case 'aprobadas':
      return !enlace && idea.estado === 'aprobada'
    case 'rechazadas':
      return !enlace && idea.estado === 'rechazada'
    case 'hechas':
      return idea.estado === 'hecha'
  }
}

export function contarPorFiltro(ideas: readonly IdeaVista[]): Record<FiltroIdeas, number> {
  const r = { todo: 0, 'para-revisar': 0, 'sin-evaluar': 0, aprobadas: 0, rechazadas: 0, hechas: 0 }
  for (const i of ideas) for (const f of Object.keys(r) as FiltroIdeas[]) if (entraEnFiltro(i, f)) r[f]++
  return r
}

/** Lo que se escribió en el campo de arriba (ID-1, ID-4). */
export type Anotado =
  | { tipo: 'idea'; titulo: string; nota: string }
  | { tipo: 'enlace'; url: string; descripcion: string }

const DIRECCION = /^<?(https?:\/\/[^\s<>]+?)>?$/i

/**
 * Una línea que es solo una dirección, si es la única dirección de lo escrito, lo vuelve un enlace para revisar (lo
 * demás es su descripción). Si no, la primera línea es el título y el resto, la nota. null si no hay nada.
 */
export function leerAnotado(texto: string): Anotado | null {
  const lineas = partirLineas(texto.trim()).map((l) => l.trimEnd())
  if (!lineas.join('').trim()) return null
  const sola = lineas.findIndex((l) => DIRECCION.test(l.trim()))
  const direcciones = (texto.match(/https?:\/\//gi) ?? []).length
  if (sola >= 0 && direcciones === 1) {
    const url = DIRECCION.exec(lineas[sola]?.trim() ?? '')?.[1] ?? ''
    const descripcion = lineas
      .filter((_, n) => n !== sola)
      .join('\n')
      .trim()
    return { tipo: 'enlace', url, descripcion }
  }
  const [primera = '', ...resto] = lineas
  return { tipo: 'idea', titulo: limpiarTitulo(primera), nota: resto.join('\n').trim() }
}

/** Un título que no rompe la línea `## T-n — título`: sin saltos ni `#` al principio, con los espacios juntos. */
export function limpiarTitulo(texto: string): string {
  return texto
    .replace(/\s+/g, ' ')
    .replace(/^[#\s]+/, '')
    .trim()
}

/**
 * El nombre de un enlace, de su dirección y sin leer la página (D-130): en GitHub, `dueño/repo`; si no, el último
 * tramo de la dirección o el sitio. Una dirección que no se entiende, entera.
 */
export function nombreDeEnlace(url: string): { nombre: string; sitio: string | null } {
  try {
    const u = new URL(url)
    const sitio = u.hostname.replace(/^www\./, '')
    const tramos = u.pathname
      .split('/')
      .filter(Boolean)
      .map((t) => {
        try {
          return decodeURIComponent(t)
        } catch {
          return t
        }
      })
    if (sitio === 'github.com' && tramos.length >= 2)
      return { nombre: `${tramos[0]}/${tramos[1]?.replace(/\.git$/, '')}`, sitio }
    const ultimo = tramos.at(-1)?.replace(/\.(html?|php|aspx?)$/i, '')
    return ultimo ? { nombre: ultimo, sitio } : { nombre: sitio, sitio: null }
  } catch {
    return { nombre: url, sitio: null }
  }
}

/** El código que sigue: el más alto + 1 (también los que no se pudieron leer bien). */
export function siguienteCodigo(texto: string): string {
  let mayor = 0
  for (const m of texto.matchAll(/^##\s+T-0*(\d{1,4})\b/gm)) mayor = Math.max(mayor, Number(m[1]))
  return `T-${mayor + 1}`
}

export interface IdeaNueva {
  titulo: string
  de: TipoIdea
  fecha: string
  /** Solo en un enlace. */
  enlace?: string
  /** El texto debajo de la línea de datos (la descripción de un enlace); vacío en las del usuario. */
  texto?: string
}

function finDeLinea(texto: string): string {
  return texto.includes('\r\n') ? '\r\n' : '\n'
}

/** Agrega la idea al final de `trabajo.md` (o crea su título) y devuelve el texto nuevo con su código. */
export function agregarIdea(texto: string, idea: IdeaNueva): { texto: string; codigo: string } {
  const eol = finDeLinea(texto)
  const codigo = siguienteCodigo(texto)
  const datos = [
    'Estado: nueva',
    `Idea: ${idea.de}`,
    `Fecha: ${idea.fecha}`,
    ...(idea.enlace ? [`Enlace: ${idea.enlace}`] : []),
  ].join(' · ')
  const cuerpo = idea.texto?.trim() ? partirLineas(idea.texto.trim()) : []
  const bloque = [`## ${codigo} — ${limpiarTitulo(idea.titulo)}`, datos, ...cuerpo]
  const base = texto.trim() ? texto.replace(/\s+$/, '') : '# Trabajo'
  return { texto: `${base}${eol}${eol}${bloque.join(eol)}${eol}`, codigo }
}

const DATOS = /^\s*[*_]*\p{L}+[*_]*:/u

/** El ítem y dónde está su línea de datos (la primera no vacía después del título); null si no está. */
function ubicar(
  lineas: readonly string[],
  codigo: string,
): { item: ItemTrabajo; datos: number | null } | null {
  const item = leerTrabajo(lineas.join('\n')).items.find((i) => i.codigo === codigo)
  if (!item) return null
  for (let n = item.linea + 1; n < lineas.length; n++) {
    const l = lineas[n] ?? ''
    if (!l.trim()) continue
    return { item, datos: DATOS.test(l) && !l.startsWith('#') ? n : null }
  }
  return { item, datos: null }
}

/**
 * Cambia el estado de una idea (ID-3). Al pasarla a `descartado` sin texto, escribe `MOTIVO_RECHAZO`; al sacarla de
 * `descartado`, lo borra si es lo único que dice. A una idea sin `Idea:` le agrega `Idea: IA`, para que siga en Ideas
 * fuera de `nueva` (D-130). null si el código no está.
 */
export function cambiarEstado(texto: string, codigo: string, estado: Estado): string | null {
  const lineas = partirLineas(texto)
  const u = ubicar(lineas, codigo)
  if (!u) return null
  const nuevo = [`Estado: ${estado}`, ...(u.item.ideaTexto === null ? ['Idea: IA'] : [])]
  let n = u.datos
  if (n === null) {
    n = u.item.linea + 1
    lineas.splice(n, 0, nuevo.join(' · '))
  } else {
    const partes = (lineas[n] ?? '').split(/\s*·\s*/)
    const i = partes.findIndex((p) => /^\s*[*_]*estado[*_]*:/i.test(p))
    if (i >= 0) partes.splice(i, 1, ...nuevo)
    else partes.unshift(...nuevo)
    lineas[n] = partes.join(' · ')
  }
  if (estado === 'descartado' && !u.item.texto) lineas.splice(n + 1, 0, MOTIVO_RECHAZO)
  if (estado !== 'descartado' && u.item.texto === MOTIVO_RECHAZO) {
    const k = lineas.findIndex((l, j) => j > (n ?? 0) && l.trim() === MOTIVO_RECHAZO)
    if (k >= 0) lineas.splice(k, 1)
  }
  return lineas.join(finDeLinea(texto))
}

/** Cambia el título de una idea (ID-2: la primera línea de la nota). null si el código no está o queda vacío. */
export function cambiarTitulo(texto: string, codigo: string, titulo: string): string | null {
  const limpio = limpiarTitulo(titulo)
  const lineas = partirLineas(texto)
  const u = ubicar(lineas, codigo)
  if (!u || !limpio) return null
  lineas[u.item.linea] = `## ${codigo} — ${limpio}`
  return lineas.join(finDeLinea(texto))
}

/** Saca el ítem entero, hasta el título siguiente (ID-8; quién puede borrar lo decide quien llama). null si no está. */
export function quitarIdea(texto: string, codigo: string): string | null {
  const lineas = partirLineas(texto)
  const u = ubicar(lineas, codigo)
  if (!u) return null
  let fin = u.item.linea + 1
  while (fin < lineas.length && !/^#{1,2}\s/.test(lineas[fin] ?? '')) fin++
  lineas.splice(u.item.linea, fin - u.item.linea)
  while (lineas.length > 1 && !lineas.at(-1)?.trim() && !lineas.at(-2)?.trim()) lineas.pop()
  return lineas.join(finDeLinea(texto))
}
