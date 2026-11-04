// Copiado de la app anterior de proyectos (D-026).
// Carpetas regenerables (D-006, D-013, research/carpetas-regenerables.md).
// Para la última actividad alcanza con el nombre: solo se leen fechas, no se borra nada.
// Para eliminar hace falta además el archivo marcador de cada ecosistema (esRegenerable).
export const CARPETAS_SIN_ACTIVIDAD = new Set([
  '.git',
  'node_modules',
  'dist',
  'out',
  'build',
  '.next',
  '.turbo',
  '.vite',
  'coverage',
  '.cache',
  'target',
  '__pycache__',
  '.pytest_cache',
  '.mypy_cache',
  '.ruff_cache',
  '.venv',
  'venv',
  '.vs',
])

/**
 * Archivos que tampoco cuentan: los de la ficha (`.proyecto.json`, `.proyecto-icono.svg`…).
 * Editar la ficha no es trabajar en el proyecto.
 */
export function archivoCuentaParaActividad(nombreArchivo: string): boolean {
  return !nombreArchivo.startsWith('.proyecto')
}

export function cuentaParaActividad(nombreCarpeta: string): boolean {
  return !CARPETAS_SIN_ACTIVIDAD.has(nombreCarpeta)
}

/** Lo que se averiguó en disco de una carpeta cuyo nombre está en la lista cerrada. */
export interface HechosCarpeta {
  nombre: string
  /** Nombres de los archivos de la carpeta padre. */
  archivosDelPadre: string[]
  /** Nombres de los archivos de primer nivel de la propia carpeta. */
  archivosPropios: string[]
  /** Algún `.gitignore` del proyecto la ignora. */
  ignoradaPorGit: boolean
}

const SALIDAS_NODE = new Set(['dist', 'out', 'build', '.next', '.turbo', '.vite', 'coverage', '.cache'])
const CACHES_PYTHON = new Set(['__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache'])
const SALIDAS_CPP = new Set(['Debug', 'Release', 'x64', 'build', '.vs'])

/** Nombres que pueden ser regenerables; cualquier otro nombre nunca lo es. */
export const NOMBRES_REGENERABLES = new Set([
  'node_modules',
  'target',
  '.venv',
  'venv',
  ...SALIDAS_NODE,
  ...CACHES_PYTHON,
  ...SALIDAS_CPP,
])

/**
 * Al eliminar, ¿esta carpeta se borra definitivamente en lugar de ir a la papelera? (D-006)
 * Solo si su nombre está en la lista cerrada **y** existe el marcador de su ecosistema. Ante la duda, no.
 */
export function esRegenerable(h: HechosCarpeta): boolean {
  const padre = new Set(h.archivosDelPadre.map((a) => a.toLowerCase()))
  const propios = new Set(h.archivosPropios.map((a) => a.toLowerCase()))
  const node = padre.has('package.json')
  const cpp =
    padre.has('cmakelists.txt') || [...padre].some((a) => a.endsWith('.sln') || a.endsWith('.vcxproj'))

  if (h.nombre === 'node_modules') return node
  if (h.nombre === 'target') return padre.has('cargo.toml')
  if (h.nombre === '.venv' || h.nombre === 'venv') return propios.has('pyvenv.cfg')
  if (CACHES_PYTHON.has(h.nombre)) return true
  if (SALIDAS_NODE.has(h.nombre) && node && h.ignoradaPorGit) return true
  if (SALIDAS_CPP.has(h.nombre) && cpp) return true
  return false
}

/** Un `.gitignore` del proyecto: la carpeta donde está (relativa al proyecto, "" = raíz) y su texto. */
export interface Gitignore {
  carpeta: string
  texto: string
}

/**
 * ¿Algún `.gitignore` ignora la carpeta (o una carpeta que la contiene)? `relativa` es la ruta
 * de la carpeta dentro del proyecto, con "/". Interpreta lo común (nombres, rutas, `*`, `**`, `!`);
 * lo que no entiende no coincide, así que la carpeta va a la papelera.
 */
export function estaIgnorada(relativa: string, gitignores: Gitignore[]): boolean {
  const partes = relativa.split('/').filter(Boolean)
  for (let n = 1; n <= partes.length; n++) {
    const prefijo = partes.slice(0, n).join('/')
    if (gitignores.some((g) => ignoraRuta(g, prefijo))) return true
  }
  return false
}

function ignoraRuta(g: Gitignore, ruta: string): boolean {
  const base = g.carpeta.replace(/^\/+|\/+$/g, '')
  if (base && !ruta.startsWith(`${base}/`)) return false
  const propia = base ? ruta.slice(base.length + 1) : ruta
  const nombre = propia.slice(propia.lastIndexOf('/') + 1)
  let ignorada = false
  for (const bruta of g.texto.split(/\r?\n/)) {
    let linea = bruta.trim()
    if (!linea || linea.startsWith('#')) continue
    const niega = linea.startsWith('!')
    if (niega) linea = linea.slice(1)
    linea = linea.replace(/\/\*\*$/, '').replace(/\/+$/, '')
    if (linea.startsWith('**/')) linea = linea.slice(3)
    else if (linea.includes('/')) linea = `/${linea.replace(/^\/+/, '')}`
    if (!linea) continue
    const anclada = linea.startsWith('/')
    const patron = anclada ? linea.slice(1) : linea
    if (aRegex(patron).test(anclada ? propia : nombre)) ignorada = !niega
  }
  return ignorada
}

function aRegex(patron: string): RegExp {
  let r = ''
  for (let i = 0; i < patron.length; i++) {
    const c = patron[i] as string
    if (c === '*' && patron[i + 1] === '*') {
      r += '.*'
      i++
    } else if (c === '*') r += '[^/]*'
    else if (c === '?') r += '[^/]'
    else r += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${r}$`)
}

/** La ruta relativa no puede salir del proyecto (la pestaña nunca elige qué se borra, pero se verifica igual). */
export function esRutaInterna(relativa: string): boolean {
  const partes = relativa.split(/[\\/]/)
  return (
    relativa.length > 0 && !/^[a-zA-Z]:/.test(relativa) && !relativa.startsWith('/') && !partes.includes('..')
  )
}
