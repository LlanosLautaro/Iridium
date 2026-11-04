// Reglas de Archivos (H-15, D-041): qué carpetas no se muestran, en qué orden va el árbol, qué archivo es una imagen,
// un texto o algo que no se puede mostrar, y los colores del texto. Sin disco: el HTML de cada línea se arma acá y
// se escapa; la ventana solo lo inserta.

/** No se muestran: lo instala pnpm y lo maneja git (H-15). */
export const CARPETAS_OCULTAS = new Set(['node_modules', '.git'])

/** Más que esto no se muestra como texto (H-15: «un archivo muy grande lo dice»). */
export const LIMITE_TEXTO_BYTES = 1024 * 1024
export const LIMITE_IMAGEN_BYTES = 15 * 1024 * 1024
/** Lo que se mira para saber si un archivo es binario. */
export const MUESTRA_BINARIO_BYTES = 8000

export const TIPOS_IMAGEN: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
}

export function extension(nombre: string): string {
  const i = nombre.lastIndexOf('.')
  return i <= 0 ? '' : nombre.slice(i + 1).toLowerCase()
}

export function tipoImagen(nombre: string): string | null {
  return TIPOS_IMAGEN[extension(nombre)] ?? null
}

/** Carpetas antes que archivos; dentro de cada grupo, orden natural sin distinguir mayúsculas. */
export function ordenarNodos<T extends { nombre: string; tipo: 'carpeta' | 'archivo' }>(nodos: T[]): T[] {
  return [...nodos].sort((a, b) =>
    a.tipo !== b.tipo
      ? a.tipo === 'carpeta'
        ? -1
        : 1
      : a.nombre.localeCompare(b.nombre, 'es', { numeric: true, sensitivity: 'base' }),
  )
}

/** Ruta de un archivo del proyecto pedida por la ventana: relativa, con `/`, sin subir ni entrar a lo oculto. */
export function rutaDeArchivoValida(ruta: string): boolean {
  if (ruta === '') return true
  if (ruta.startsWith('/') || /^[a-z]:/i.test(ruta) || ruta.includes('\\') || ruta.includes('\0'))
    return false
  return ruta.split('/').every((p) => p !== '' && p !== '.' && p !== '..' && !CARPETAS_OCULTAS.has(p))
}

/** ¿Parece binario? Un byte nulo en la muestra alcanza (como git). */
export function esBinario(muestra: Uint8Array): boolean {
  return muestra.includes(0)
}

// ---------- Colores ----------

export type Lenguaje = 'js' | 'json' | 'css' | 'html' | 'md' | 'numeral' | 'texto'

const LENGUAJES: Record<string, Lenguaje> = {
  ts: 'js',
  tsx: 'js',
  js: 'js',
  jsx: 'js',
  mjs: 'js',
  cjs: 'js',
  mts: 'js',
  cts: 'js',
  java: 'js',
  c: 'js',
  h: 'js',
  cpp: 'js',
  cs: 'js',
  go: 'js',
  rs: 'js',
  kt: 'js',
  swift: 'js',
  json: 'json',
  jsonc: 'json',
  css: 'css',
  scss: 'css',
  less: 'css',
  html: 'html',
  htm: 'html',
  xml: 'html',
  svg: 'html',
  vue: 'html',
  md: 'md',
  markdown: 'md',
  py: 'numeral',
  sh: 'numeral',
  bash: 'numeral',
  ps1: 'numeral',
  psm1: 'numeral',
  yml: 'numeral',
  yaml: 'numeral',
  toml: 'numeral',
  ini: 'numeral',
  cfg: 'numeral',
  conf: 'numeral',
  rb: 'numeral',
  r: 'numeral',
}

const SIN_EXTENSION: Record<string, Lenguaje> = {
  dockerfile: 'numeral',
  makefile: 'numeral',
  '.gitignore': 'numeral',
  '.gitattributes': 'numeral',
  '.npmrc': 'numeral',
  '.editorconfig': 'numeral',
  '.env': 'numeral',
}

export function lenguajeDe(nombre: string): Lenguaje {
  return SIN_EXTENSION[nombre.toLowerCase()] ?? LENGUAJES[extension(nombre)] ?? 'texto'
}

const PALABRAS: Partial<Record<Lenguaje, Set<string>>> = {
  js: new Set(
    'abstract as async await boolean break case catch class const continue declare default delete do else enum export extends false finally for from function get if implements import in instanceof interface let new null number of private protected public readonly return satisfies set static string super switch this throw true try type typeof undefined var void while yield fn pub impl struct mut use mod match self func package int float double char long'.split(
      ' ',
    ),
  ),
  json: new Set(['true', 'false', 'null']),
  numeral: new Set(
    'and as assert break class continue def del elif else except false finally for from function global if import in is lambda none not or pass raise return true try while with yield then fi do done esac case echo param foreach'.split(
      ' ',
    ),
  ),
}

type Clase = 'c' | 'k' | 's' | 'n' | null

/** Las alternativas de cada lenguaje, en orden de prioridad: comentario, cadena, número, palabra. */
const PATRONES: Record<Lenguaje, RegExp> = {
  js: /(\/\*[\s\S]*?(?:\*\/|$))|(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\[\s\S]|[^`\\])*`?)|(\b(?:0x[\da-f]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?)\b)|([A-Za-z_$][\w$]*)/giy,
  json: /(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"?)(\s*:)?|(-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|([a-z]+)/giy,
  css: /(\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(#[\da-f]{3,8}\b|-?\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|ch|s|ms|deg|fr)?\b)|(@[\w-]+|--[\w-]+)/giy,
  html: /(<!--[\s\S]*?(?:-->|$))|("[^"\n]*"?|'[^'\n]*'?)|(&\w+;)|(<\/?[\w:.-]+|\/?>)/giy,
  md: /(<!--[\s\S]*?(?:-->|$))|(^ {0,3}(?:`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:^ {0,3}(?:`{3,}|~{3,})[^\n]*$|(?![\s\S]))|`[^`\n]+`)|(^ {0,3}#{1,6}\s[^\n]*|\*\*[^*\n]+\*\*)|(^\s*(?:[-*+]|\d+\.)\s(?:\[[ xX]\]\s)?)/gimy,
  numeral: /(#[^\n]*)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w-]*)/giy,
  texto: /(?!)/y,
}

function claseDe(lenguaje: Lenguaje, m: RegExpExecArray): Clase {
  switch (lenguaje) {
    case 'js':
      if (m[1] || m[2]) return 'c'
      if (m[3]) return 's'
      if (m[4]) return 'n'
      return PALABRAS.js?.has(m[5] ?? '') ? 'k' : null
    case 'json':
      if (m[1]) return 'c'
      if (m[2]) return m[3] ? 'k' : 's'
      if (m[4]) return 'n'
      return PALABRAS.json?.has(m[5] ?? '') ? 'k' : null
    case 'css':
      if (m[1]) return 'c'
      if (m[2]) return 's'
      if (m[3]) return 'n'
      return 'k'
    case 'html':
      if (m[1]) return 'c'
      if (m[2]) return 's'
      if (m[3]) return 'n'
      return 'k'
    case 'md':
      if (m[1]) return 'c'
      if (m[2]) return 's'
      if (m[3]) return 'k'
      return 'n'
    case 'numeral':
      if (m[1]) return 'c'
      if (m[2]) return 's'
      if (m[3]) return 'n'
      return PALABRAS.numeral?.has((m[4] ?? '').toLowerCase()) ? 'k' : null
    case 'texto':
      return null
  }
}

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * El texto en líneas de HTML con sus colores: `c` comentario, `k` palabra clave o título, `s` cadena o código,
 * `n` número. Un comentario de varias líneas se colorea en cada una.
 */
export function colorear(texto: string, lenguaje: Lenguaje): string[] {
  const t = texto.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const tramos: { clase: Clase; texto: string }[] = []
  const patron = new RegExp(PATRONES[lenguaje].source, PATRONES[lenguaje].flags)
  let suelto = ''
  for (let i = 0; i < t.length; ) {
    patron.lastIndex = i
    const m = lenguaje === 'texto' ? null : patron.exec(t)
    if (!m || m[0] === '') {
      suelto += t[i]
      i++
      continue
    }
    const clase = claseDe(lenguaje, m)
    if (clase === null) suelto += m[0]
    else {
      if (suelto) tramos.push({ clase: null, texto: suelto })
      suelto = ''
      // En JSON, «"clave":» colorea solo la clave.
      if (lenguaje === 'json' && m[3]) {
        tramos.push({ clase, texto: m[2] ?? '' })
        suelto = m[3]
      } else tramos.push({ clase, texto: m[0] })
    }
    i += m[0].length
  }
  if (suelto) tramos.push({ clase: null, texto: suelto })

  const lineas: string[] = ['']
  for (const tramo of tramos) {
    tramo.texto.split('\n').forEach((parte, k) => {
      if (k > 0) lineas.push('')
      if (parte === '') return
      const html = tramo.clase ? `<span class="${tramo.clase}">${esc(parte)}</span>` : esc(parte)
      lineas[lineas.length - 1] += html
    })
  }
  // El salto final no abre una línea vacía más.
  if (lineas.length > 1 && lineas.at(-1) === '' && t.endsWith('\n')) lineas.pop()
  return lineas
}

/** Para la cabecera del visor: «48 líneas · TypeScript». */
export function nombreLenguaje(nombre: string): string {
  const e = extension(nombre)
  const conocidos: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    mjs: 'JavaScript',
    cjs: 'JavaScript',
    json: 'JSON',
    css: 'CSS',
    html: 'HTML',
    md: 'Markdown',
    py: 'Python',
    ps1: 'PowerShell',
    sh: 'Shell',
    yml: 'YAML',
    yaml: 'YAML',
    toml: 'TOML',
    svg: 'SVG',
    xml: 'XML',
  }
  return conocidos[e] ?? (e ? e.toUpperCase() : 'texto')
}
