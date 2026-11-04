// Copiado de la app anterior de proyectos (D-026).
// Documentos del visor: árbol del explorador, documento inicial y sección para la vista previa de un código.
import type { NodoArbol } from '../../../compartido/visor'
import type { EntradaCodigo, Indice } from './codigos'
import { lineasFueraDeCodigo, partirLineas } from './lineas'

/** Primero los que más se leen (como en las pantallas aprobadas); después, orden natural (`00-`, `01-`, `10-`). */
const PRIMEROS = ['estado.md', 'perfil-proyecto.md', 'decisiones.md']

export function compararNombres(a: string, b: string): number {
  const pa = PRIMEROS.indexOf(a.toLowerCase())
  const pb = PRIMEROS.indexOf(b.toLowerCase())
  if (pa !== pb) return (pa < 0 ? PRIMEROS.length : pa) - (pb < 0 ? PRIMEROS.length : pb)
  return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })
}

/** ¿Es una ruta de documento que el visor puede abrir? Relativa, con `/`, sin subir de carpeta y terminada en `.md`. */
export function esRutaDeDocumento(ruta: string): boolean {
  if (!/\.md$/i.test(ruta) || ruta.startsWith('/') || /^[a-z]:/i.test(ruta) || ruta.includes('\\'))
    return false
  return ruta.split('/').every((p) => p !== '' && p !== '.' && p !== '..')
}

/** Arma el explorador: `docs/` (con subcarpetas) y los `.md` de la raíz. Archivos antes que carpetas. */
export function armarArbol(rutas: readonly string[]): { docs: NodoArbol[]; raiz: NodoArbol[] } {
  const raiz: NodoArbol = { tipo: 'carpeta', nombre: '', ruta: '', hijos: [] }
  for (const ruta of rutas) {
    const partes = ruta.split('/')
    let actual = raiz
    partes.forEach((nombre, i) => {
      const r = partes.slice(0, i + 1).join('/')
      if (i === partes.length - 1) {
        actual.hijos.push({ tipo: 'archivo', nombre, ruta: r, hijos: [] })
        return
      }
      let carpeta = actual.hijos.find((h) => h.tipo === 'carpeta' && h.nombre === nombre)
      if (!carpeta) {
        carpeta = { tipo: 'carpeta', nombre, ruta: r, hijos: [] }
        actual.hijos.push(carpeta)
      }
      actual = carpeta
    })
  }
  const ordenar = (n: NodoArbol) => {
    n.hijos.sort((a, b) =>
      a.tipo !== b.tipo ? (a.tipo === 'archivo' ? -1 : 1) : compararNombres(a.nombre, b.nombre),
    )
    for (const h of n.hijos) ordenar(h)
  }
  ordenar(raiz)
  const docs = raiz.hijos.find((h) => h.tipo === 'carpeta' && h.nombre === 'docs')
  return { docs: docs?.hijos ?? [], raiz: raiz.hijos.filter((h) => h.tipo === 'archivo') }
}

/** Primer archivo en el orden del explorador. */
function primero(nodos: readonly NodoArbol[]): string | null {
  for (const n of nodos) {
    if (n.tipo === 'archivo') return n.ruta
    const r = primero(n.hijos)
    if (r) return r
  }
  return null
}

/** `docs/estado.md` → `README.md` de la raíz → el primero del explorador (H-1). */
export function documentoInicial(rutas: readonly string[]): string | null {
  if (rutas.includes('docs/estado.md')) return 'docs/estado.md'
  const readme = rutas.find((r) => r.toLowerCase() === 'readme.md')
  if (readme) return readme
  const { docs, raiz } = armarArbol(rutas)
  return primero(docs) ?? primero(raiz)
}

export const LINEAS_VISTA_PREVIA = 12

export interface Seccion {
  titulo: string
  /** Markdown del comienzo de la sección. */
  markdown: string
  cortada: boolean
}

/** Comienzo de la sección donde nace un código: unas 12 líneas, la fila con sus encabezados o la pregunta. */
export function seccionDe(texto: string, entrada: EntradaCodigo, indice: Indice): Seccion | null {
  const lineas = partirLineas(texto)
  if (entrada.nace === 'tabla') return filaDe(lineas, entrada)
  if (entrada.nace === 'pregunta') {
    const q = indice.preguntas.get(entrada.ruta)?.find((x) => x.codigo === entrada.codigo)
    if (!q) return null
    return { titulo: entrada.titulo, markdown: q.contexto, cortada: false }
  }
  const e = indice.encabezados.get(entrada.ruta)?.find((x) => x.n === entrada.n)
  if (!e) return null
  return seccionDeTitulo(lineas, e.n, e.nivel, e.texto)
}

/** Sección de un título cualquiera (por ancla), para la vista previa de una cita `archivo.md › Sección`. */
export function seccionDeAncla(texto: string, ancla: string, indice: Indice, ruta: string): Seccion | null {
  const e = indice.encabezados.get(ruta)?.find((x) => x.ancla === ancla || x.slug === ancla)
  if (!e) return null
  return seccionDeTitulo(partirLineas(texto), e.n, e.nivel, e.texto)
}

function seccionDeTitulo(lineas: string[], n: number, nivel: number, titulo: string): Seccion {
  const fuera = new Set(lineasFueraDeCodigo(lineas).map((l) => l.n))
  let fin = lineas.length
  for (let i = n + 1; i < lineas.length; i++) {
    const m = /^ {0,3}(#{1,6})[ \t]/.exec(lineas[i] ?? '')
    if (m?.[1] && fuera.has(i) && m[1].length <= nivel) {
      fin = i
      break
    }
  }
  const cuerpo = lineas.slice(n + 1, fin)
  while (cuerpo.length && (cuerpo[0] ?? '').trim() === '') cuerpo.shift()
  while (cuerpo.length && (cuerpo[cuerpo.length - 1] ?? '').trim() === '') cuerpo.pop()
  const corte = cuerpo.slice(0, LINEAS_VISTA_PREVIA)
  // Si el corte deja un bloque de código abierto, se cierra.
  if (lineasFueraDeCodigo([...corte, '']).at(-1)?.n !== corte.length) {
    const cerca = corte
      .find((l) => /^ {0,3}(`{3,}|~{3,})/.test(l))
      ?.trim()
      .match(/^(`{3,}|~{3,})/)?.[1]
    corte.push(cerca ?? '```')
  }
  return { titulo, markdown: corte.join('\n'), cortada: cuerpo.length > LINEAS_VISTA_PREVIA }
}

/** La fila donde nace el código, con los encabezados de su tabla. */
function filaDe(lineas: string[], entrada: EntradaCodigo): Seccion | null {
  const fila = lineas[entrada.n]
  if (fila === undefined) return null
  let inicio = entrada.n
  while (inicio > 0 && /^\s*\|/.test(lineas[inicio - 1] ?? '')) inicio--
  const cabeza = lineas[inicio]
  const separador = lineas[inicio + 1]
  if (inicio === entrada.n || !cabeza || !separador || !/^[\s|:-]+$/.test(separador)) {
    return { titulo: entrada.titulo, markdown: fila, cortada: false }
  }
  return { titulo: entrada.titulo, markdown: [cabeza, separador, fila].join('\n'), cortada: false }
}
