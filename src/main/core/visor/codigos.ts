// Copiado de la app anterior de proyectos (D-026).
// Índice de códigos del proyecto (D-028, D-033; research/codigos-de-la-guia.md).
// Reglas: (1) un código nace en un título que empieza por él o en la primera celda de una tabla, y las `Q-n` en su
// ítem de "Preguntas abiertas"; (2) guion y ceros a la izquierda opcionales (H15 = H-15, D-001 = D-1);
// (3) si nace en un título, gana el título; (4) si solo nace en varias filas de tabla, es una categoría y no se
// enlaza; (5) P1–P5 no son códigos; (6) una cita solo es enlace si el código nace en el proyecto.
import { lineasFueraDeCodigo, partirLineas, slug, titulos } from './lineas'
import { esDocumentoDeEstado, leerPreguntas, type PreguntaLeida } from './preguntas'

export interface DocumentoFuente {
  /** Relativa a la carpeta abierta, con `/`. */
  ruta: string
  texto: string
}

export interface Encabezado {
  n: number
  nivel: number
  texto: string
  /** `id` del título en el HTML. */
  ancla: string
  /** Ancla al estilo de GitHub, para los enlaces `archivo.md#seccion` escritos a mano. */
  slug: string
  /** Código con el que empieza el título, normalizado. */
  codigo: string | null
}

export type Nacimiento = 'titulo' | 'tabla' | 'pregunta'

export interface EntradaCodigo {
  codigo: string
  ruta: string
  nace: Nacimiento
  /** Línea donde nace (desde 0). */
  n: number
  ancla: string
  /** Texto del título, de la fila o de la pregunta. */
  titulo: string
}

export interface Indice {
  /** Código normalizado → dónde nace (varios si el mismo código titula secciones de distintos documentos). */
  codigos: Map<string, EntradaCodigo[]>
  encabezados: Map<string, Encabezado[]>
  /** Por documento: línea de la fila donde nace un código → su ancla. */
  filas: Map<string, Map<number, string>>
  /** Por documento (`estado.md`): las preguntas abiertas. */
  preguntas: Map<string, PreguntaLeida[]>
}

const COD = String.raw`([A-Z]{1,4})-?(\d{1,4})`
const AL_INICIO = new RegExp(String.raw`^${COD}(?=[\s:.,;—–\-)]|$)`)
const EN_TABLA = new RegExp(String.raw`^\s*\|\s*(?:\*\*|__)?\`?${COD}\`?(?:\*\*|__)?\s*\|`)
/** Un código citado en el texto. */
export const CITA = new RegExp(String.raw`(?<![\w/.#-])${COD}(?![\w-])`, 'g')

export function normalizarCodigo(prefijo: string, numero: string): string {
  return `${prefijo}-${Number(numero)}`
}

/** Código con el que empieza un texto (`D-025 — …` → `D-25`), o null. P1–P5 no cuentan. */
export function codigoAlInicio(texto: string): string | null {
  const m = AL_INICIO.exec(texto)
  if (!m?.[1] || !m[2]) return null
  const c = normalizarCodigo(m[1], m[2])
  return esNivelDeProteccion(c) ? null : c
}

function esNivelDeProteccion(codigo: string): boolean {
  return /^P-[1-5]$/.test(codigo)
}

/** Títulos de un documento con su ancla: el código si empieza por uno; si no, el estilo de GitHub, sin repetir. */
export function encabezadosDe(texto: string): Encabezado[] {
  const usados = new Set<string>()
  const unico = (base: string) => {
    let a = base || 'seccion'
    for (let i = 1; usados.has(a); i++) a = `${base}-${i}`
    usados.add(a)
    return a
  }
  return titulos(partirLineas(texto)).map((t) => {
    const codigo = codigoAlInicio(t.texto)
    const s = slug(t.texto)
    const ancla = codigo && !usados.has(codigo.toLowerCase()) ? unico(codigo.toLowerCase()) : unico(s)
    return { ...t, ancla, slug: s, codigo }
  })
}

/** Arma el índice de todos los documentos. Se rearma entero en cada cambio (D-028). */
export function construirIndice(documentos: readonly DocumentoFuente[]): Indice {
  const encabezados = new Map<string, Encabezado[]>()
  const enTitulos = new Map<string, EntradaCodigo[]>()
  const enFilas = new Map<string, EntradaCodigo[]>()
  const enPreguntas = new Map<string, EntradaCodigo>()
  const preguntas = new Map<string, PreguntaLeida[]>()

  for (const doc of documentos) {
    const es = encabezadosDe(doc.texto)
    encabezados.set(doc.ruta, es)
    for (const e of es) {
      if (!e.codigo || e.ancla !== e.codigo.toLowerCase()) continue
      // Las Q-n nacen en su pregunta; el título de su respuesta (`# Q-7 — …`) solo cuenta si la pregunta ya no está.
      const lista = enTitulos.get(e.codigo) ?? []
      lista.push({
        codigo: e.codigo,
        ruta: doc.ruta,
        nace: 'titulo',
        n: e.n,
        ancla: e.ancla,
        titulo: e.texto,
      })
      enTitulos.set(e.codigo, lista)
    }
    for (const { n, texto } of lineasFueraDeCodigo(partirLineas(doc.texto))) {
      const m = EN_TABLA.exec(texto)
      if (!m?.[1] || !m[2]) continue
      const codigo = normalizarCodigo(m[1], m[2])
      if (esNivelDeProteccion(codigo)) continue
      const celdas = texto
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => c.trim())
      const lista = enFilas.get(codigo) ?? []
      lista.push({
        codigo,
        ruta: doc.ruta,
        nace: 'tabla',
        n,
        ancla: codigo.toLowerCase(),
        titulo: celdas.slice(0, 2).join(' — '),
      })
      enFilas.set(codigo, lista)
    }
    if (esDocumentoDeEstado(doc.ruta)) {
      const qs = leerPreguntas(doc.texto)
      preguntas.set(doc.ruta, qs)
      for (const q of qs) {
        if (enPreguntas.has(q.codigo)) continue
        enPreguntas.set(q.codigo, {
          codigo: q.codigo,
          ruta: doc.ruta,
          nace: 'pregunta',
          n: q.linea,
          ancla: q.codigo.toLowerCase(),
          titulo: `${q.codigo} — ${q.pregunta}`,
        })
      }
    }
  }

  const codigos = new Map<string, EntradaCodigo[]>()
  for (const [c, e] of enPreguntas) codigos.set(c, [e])
  for (const [c, lista] of enTitulos) if (!codigos.has(c)) codigos.set(c, lista)
  const filas = new Map<string, Map<number, string>>()
  for (const [c, lista] of enFilas) {
    // Gana el título; repetido en varias filas es una categoría (P0, P1…): no se enlaza.
    if (codigos.has(c) || lista.length !== 1 || !lista[0]) continue
    const e = lista[0]
    if (encabezados.get(e.ruta)?.some((x) => x.ancla === e.ancla)) continue
    codigos.set(c, [e])
    const porLinea = filas.get(e.ruta) ?? new Map<number, string>()
    porLinea.set(e.n, e.ancla)
    filas.set(e.ruta, porLinea)
  }
  return { codigos, encabezados, filas, preguntas }
}

/**
 * Dónde nace un código citado desde un documento. Si el mismo código titula secciones de varios documentos,
 * gana el mismo documento y después el más cercano (por ejemplo, el del mismo módulo).
 */
export function resolverCodigo(indice: Indice, codigo: string, desde: string): EntradaCodigo | null {
  const lista = indice.codigos.get(codigo)
  if (!lista || lista.length === 0) return null
  if (lista.length === 1) return lista[0] ?? null
  const comun = (a: string, b: string) => {
    const x = a.split('/')
    const y = b.split('/')
    let i = 0
    while (i < x.length - 1 && i < y.length - 1 && x[i] === y[i]) i++
    return i
  }
  let mejor = lista[0] ?? null
  let puntos = -1
  for (const e of lista) {
    const p = e.ruta === desde ? 1000 : comun(e.ruta, desde)
    if (p > puntos) {
      mejor = e
      puntos = p
    }
  }
  return mejor
}

/** Entrada del índice que corresponde a una sección (documento + ancla), para la vista previa. */
export function entradaPorAncla(indice: Indice, ruta: string, ancla: string): EntradaCodigo | null {
  for (const lista of indice.codigos.values())
    for (const e of lista) if (e.ruta === ruta && e.ancla === ancla) return e
  return null
}
