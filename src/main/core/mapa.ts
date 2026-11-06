// Reglas del Mapa (H-7, D-035, 04-ux.md › W-7): la línea de hitos de `estado.md`, los pasos de cada hito (su
// portón, D-019, o sus iteraciones en el hito 7) y su estado en palabras. Se lee con tolerancia, como el Gestor:
// por títulos y nombres de columna; lo que no se entiende se muestra tal cual. Sin disco.
import type { EstadoHito, EstadoPaso } from '../../compartido/puente'
import { lineasFueraDeCodigo, partirLineas, textoPlano } from './visor/lineas'

function sinAcentos(t: string): string {
  return t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

/** Las líneas de la sección `## <titulo>` (cualquier nivel) hasta el próximo título de su nivel o uno mayor. */
export function seccionDeTitulo(texto: string, titulo: string): string[] {
  const lineas = partirLineas(texto)
  const buscado = sinAcentos(titulo)
  const fuera = lineasFueraDeCodigo(lineas)
  const inicio = fuera.find((l) => {
    const m = /^ {0,3}(#{1,6})\s+(.*)$/.exec(l.texto)
    return m?.[2] !== undefined && sinAcentos(textoPlano(m[2])) === buscado
  })
  if (!inicio) return []
  const nivel = /^ {0,3}(#{1,6})/.exec(inicio.texto)?.[1]?.length ?? 2
  const fin = fuera.find((l) => {
    if (l.n <= inicio.n) return false
    const m = /^ {0,3}(#{1,6})\s/.exec(l.texto)
    return m?.[1] !== undefined && m[1].length <= nivel
  })
  return lineas.slice(inicio.n + 1, fin?.n ?? lineas.length)
}

/** Las celdas de una fila de tabla Markdown (`| a | b |`). Las barras dentro de código no parten la celda. */
export function celdas(linea: string): string[] {
  const t = linea.trim().replace(/^\|/, '').replace(/\|$/, '')
  const r: string[] = []
  let actual = ''
  let enCodigo = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (c === '\\' && t[i + 1] === '|') {
      actual += '|'
      i++
    } else if (c === '`') {
      enCodigo = !enCodigo
      actual += c
    } else if (c === '|' && !enCodigo) {
      r.push(actual.trim())
      actual = ''
    } else actual += c
  }
  r.push(actual.trim())
  return r
}

/** Las tablas de unas líneas: encabezado (en minúsculas y sin acentos) y filas. */
export function tablas(lineas: readonly string[]): { columnas: string[]; filas: string[][] }[] {
  const r: { columnas: string[]; filas: string[][] }[] = []
  for (let i = 0; i < lineas.length; i++) {
    const cab = lineas[i] ?? ''
    const sep = lineas[i + 1] ?? ''
    if (!cab.trim().startsWith('|') || !/^\s*\|?\s*:?-{2,}/.test(sep)) continue
    const filas: string[][] = []
    let j = i + 2
    for (; j < lineas.length && (lineas[j] ?? '').trim().startsWith('|'); j++)
      filas.push(celdas(lineas[j] ?? ''))
    r.push({ columnas: celdas(cab).map((c) => sinAcentos(textoPlano(c))), filas })
    i = j - 1
  }
  return r
}

/** Un estado de la guía en palabras fijas (D-019): pendiente, en curso, completo… Lo demás, `otro`. */
export function clasificarHito(texto: string): EstadoHito {
  const t = sinAcentos(textoPlano(texto))
  if (/^(completo|validado|aprobad[oa])/.test(t)) return 'completo'
  if (/^en curso/.test(t)) return 'en-curso'
  if (/^pendiente/.test(t)) return 'pendiente'
  if (/^reabierto/.test(t)) return 'reabierto'
  if (/^saltado/.test(t)) return 'saltado'
  if (/^bloqueado/.test(t)) return 'bloqueado'
  return 'otro'
}

export interface HitoLeido {
  numero: number
  nombre: string
  /** El estado tal como está escrito. */
  estadoTexto: string
  estado: EstadoHito
  /** El documento como está en la tabla (`04-ux.md`); null si no tiene. */
  documento: string | null
}

/** La tabla «Progreso de hitos» de `estado.md` (columnas #, Hito, Estado y Documento, en cualquier orden). */
export function leerHitos(estado: string): HitoLeido[] {
  const tabla = tablas(seccionDeTitulo(estado, 'Progreso de hitos')).find(
    (t) => t.columnas.includes('hito') && t.columnas.includes('estado'),
  )
  if (!tabla) return []
  const col = (nombre: string) => tabla.columnas.indexOf(nombre)
  const iNum = col('#') >= 0 ? col('#') : 0
  const iHito = col('hito')
  const iEstado = col('estado')
  const iDoc = col('documento')
  const r: HitoLeido[] = []
  for (const f of tabla.filas) {
    const numero = Number(/\d+/.exec(f[iNum] ?? '')?.[0])
    if (!Number.isFinite(numero)) continue
    const estadoTexto = textoPlano(f[iEstado] ?? '')
    const doc = iDoc >= 0 ? /`?([^`\s]+\.md)`?/.exec(f[iDoc] ?? '')?.[1] : undefined
    r.push({
      numero,
      nombre: textoPlano(f[iHito] ?? ''),
      estadoTexto,
      estado: clasificarHito(estadoTexto),
      documento: doc ?? null,
    })
  }
  return r
}

export interface PasoLeido {
  texto: string
  estado: EstadoPaso
  /** Tal como está escrito (la columna Estado de una iteración); vacío en el portón. */
  estadoTexto: string
  /** El código de la iteración (`I-4`), para enlazar a su sección; null en el portón. */
  codigo: string | null
}

/** El portón de un documento de hito (D-019): `- [x] hecho` y `- [ ] pendiente`. */
export function leerPorton(texto: string): PasoLeido[] {
  const r: PasoLeido[] = []
  for (const l of seccionDeTitulo(texto, 'Portón')) {
    const m = /^\s*[-*]\s+\[([ xX])\]\s+(.*)$/.exec(l)
    if (m?.[2])
      r.push({
        texto: textoPlano(m[2]),
        estado: m[1] === ' ' ? 'pendiente' : 'hecho',
        estadoTexto: '',
        codigo: null,
      })
  }
  return r
}

/** El estado de una iteración en palabras: aprobada → hecha; «espera la prueba» → espera al usuario. */
export function clasificarIteracion(texto: string): EstadoPaso {
  const t = sinAcentos(textoPlano(texto))
  if (/^(aprobad|complet|hech|validad|cerrad|terminad)/.test(t)) return 'hecho'
  // «construida; espera la prueba del usuario (Q-62)»: lo que falta es del usuario.
  if (/espera (la|tu) prueba|falta (la|tu) prueba/.test(t)) return 'espera'
  if (/^en curso/.test(t)) return 'en-curso'
  if (/^(probad|en prueba|espera|falta probar|lista para probar)/.test(t)) return 'espera'
  if (/^(pendiente|por empezar)/.test(t)) return 'pendiente'
  if (/^saltad/.test(t)) return 'saltado'
  if (/^reabiert/.test(t)) return 'reabierto'
  return 'otro'
}

/** El código de una iteración: `I-4`, o la de un módulo con su prefijo (`R-I2`, sin guion antes del número). */
const ITERACION = /^(?:I-\d+|[A-Z]{1,3}-I\d+)$/

/**
 * Las iteraciones del plan (la tabla con una columna ID y filas `I-n`). `actual`: lo que dice «Hito actual»; la
 * iteración que nombra y todavía no empezó en la tabla se muestra en curso.
 */
export function leerIteraciones(texto: string, actual: string | null): PasoLeido[] {
  const lineas = partirLineas(texto)
  const tabla = tablas(lineas).find(
    (t) => t.columnas[0] === 'id' && t.filas.some((f) => ITERACION.test(f[0] ?? '')),
  )
  if (!tabla) return []
  const iObjetivo = Math.max(1, tabla.columnas.indexOf('objetivo'))
  const iEstado = tabla.columnas.indexOf('estado')
  const enCurso = actual ? new Set([...actual.matchAll(/\bI-\d+\b/g)].map((m) => m[0])) : new Set<string>()
  const r: PasoLeido[] = []
  for (const f of tabla.filas) {
    const codigo = f[0] ?? ''
    if (!ITERACION.test(codigo)) continue
    const estadoTexto = iEstado >= 0 ? textoPlano(f[iEstado] ?? '') : ''
    let estado = clasificarIteracion(estadoTexto)
    if (enCurso.has(codigo) && (estado === 'pendiente' || estado === 'otro')) estado = 'en-curso'
    r.push({ texto: `${codigo} — ${textoPlano(f[iObjetivo] ?? '')}`, estado, estadoTexto, codigo })
  }
  return r
}

/** El Próximo paso de `estado.md`, como Markdown (todas sus líneas). */
export function proximoPaso(estado: string): string {
  return seccionDeTitulo(estado, 'Próximo paso').join('\n').trim()
}

/** El frente de un `estado.md` (D-063): la carpeta del módulo, o null si es el del núcleo (`docs/estado.md`). */
export function frenteDeEstado(ruta: string): string | null {
  return /^docs\/modulos\/([^/]+)\/estado\.md$/.exec(ruta)?.[1] ?? null
}

/** El nombre de un módulo: lo que sigue a «Estado del módulo:» en su título; si no, el de su carpeta. */
export function nombreDeModulo(estado: string, carpeta: string): string {
  const titulo = partirLineas(estado).find((l) => /^#\s/.test(l))
  const m = titulo ? /^#\s+(?:estado del m[oó]dulo\s*:\s*)(.+)$/i.exec(titulo.trim()) : null
  return m?.[1] ? textoPlano(m[1]).trim() : carpeta
}

/**
 * Los pasos del ciclo reducido de un módulo: la tabla «Progreso» de su `estado.md` (columnas Paso y Estado; Documento,
 * si está). Se leen con las palabras de las iteraciones: «completo» y «aprobada provisional» están hechos.
 */
export function leerPasosDeModulo(estado: string): (PasoLeido & { documento: string | null })[] {
  const tabla = tablas(seccionDeTitulo(estado, 'Progreso')).find(
    (t) => t.columnas.includes('paso') && t.columnas.includes('estado'),
  )
  if (!tabla) return []
  const iPaso = tabla.columnas.indexOf('paso')
  const iEstado = tabla.columnas.indexOf('estado')
  const iDoc = tabla.columnas.indexOf('documento')
  return tabla.filas
    .filter((f) => textoPlano(f[iPaso] ?? '') !== '')
    .map((f) => {
      const estadoTexto = textoPlano(f[iEstado] ?? '')
      const doc = iDoc >= 0 ? /`([^`\s]+\.(?:md|html))`/.exec(f[iDoc] ?? '')?.[1] : undefined
      return {
        texto: textoPlano(f[iPaso] ?? ''),
        estado: clasificarIteracion(estadoTexto),
        estadoTexto,
        codigo: null,
        documento: doc ?? null,
      }
    })
}
