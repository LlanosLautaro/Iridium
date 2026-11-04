// Reglas de Git (H-16, D-041): entender lo que devuelve el `git` del sistema (el estado, el historial, los archivos de
// un commit y el antes y después de un archivo). Sin disco ni procesos: `infra/git.ts` corre los comandos y le pasa
// el texto. Solo lectura: acá no se arma nada que cambie el repositorio.
import type {
  ArchivoGit,
  CambioArchivoGit,
  CommitGit,
  DiferenciaGit,
  LineaDif,
} from '../../compartido/puente'

/** Cuántos commits muestra el historial (el resto se avisa). */
export const LIMITE_HISTORIAL = 200
/** Más líneas que esto, el antes y después se corta (y lo dice). */
export const LIMITE_LINEAS_DIF = 4000
/** El árbol vacío de git: la base de los cambios sin guardar en un repo sin commits. */
export const ARBOL_VACIO = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
/** Lo que la ventana nombra como «los cambios sin guardar» en vez de un commit. */
export const SIN_GUARDAR = 'sin-guardar'

/** Un commit como lo puede nombrar la ventana: solo letras hexadecimales (nunca empieza con `-`). */
export function esHashValido(h: string): boolean {
  return /^[0-9a-f]{4,64}$/.test(h)
}

/** Separadores del formato del historial: no aparecen en un mensaje normal. */
const REGISTRO = '\x1e'
const CAMPO = '\x1f'
const COAUTOR = '\x1d'

/** El formato de `git log` que entiende `historialDe`. */
export const FORMATO_LOG = `${REGISTRO}%H${CAMPO}%h${CAMPO}%an${CAMPO}%at${CAMPO}%s${CAMPO}%(trailers:key=Co-authored-by,valueonly=true,separator=${COAUTOR})`

function sinCorreo(nombre: string): string {
  return nombre.replace(/<[^>]*>/g, '').trim()
}

/** `git log --format=FORMATO_LOG --shortstat`: un registro por commit, con «N files changed» en la línea de abajo. */
export function historialDe(salida: string): CommitGit[] {
  const commits: CommitGit[] = []
  for (const registro of salida.split(REGISTRO)) {
    if (!registro.trim()) continue
    const [cabeza = '', ...resto] = registro.split('\n')
    const [hash, corto, autor, cuando, mensaje, coautores] = cabeza.split(CAMPO)
    if (!hash || !corto) continue
    const stat = /(\d+) files? changed/.exec(resto.join('\n'))
    const otros = (coautores ?? '')
      .split(COAUTOR)
      .map(sinCorreo)
      .filter((n) => n && n !== autor)
    commits.push({
      hash,
      corto,
      mensaje: mensaje ?? '',
      autor: autor ?? '',
      coautores: [...new Set(otros)],
      fecha: Number(cuando) * 1000 || 0,
      archivos: stat ? Number(stat[1]) : 0,
      subido: null,
    })
  }
  return commits
}

function cambioDeLetra(letra: string): CambioArchivoGit {
  if (letra === 'A' || letra === '?') return 'nuevo'
  if (letra === 'D') return 'borrado'
  if (letra === 'M' || letra === 'T' || letra === 'R' || letra === 'C') return 'modificado'
  return 'otro'
}

/** `git status --porcelain=v1 -z --no-renames --untracked-files=all`: la ruta, si es nuevo, cambiado o borrado y si
 * ya está preparado para el commit. */
export function estadoDe(
  salida: string,
): { ruta: string; cambio: CambioArchivoGit; sinSeguir: boolean; preparado: boolean }[] {
  const archivos: { ruta: string; cambio: CambioArchivoGit; sinSeguir: boolean; preparado: boolean }[] = []
  for (const entrada of salida.split('\0')) {
    if (entrada.length < 4) continue
    const x = entrada[0] ?? ' '
    const y = entrada[1] ?? ' '
    const ruta = entrada.slice(3)
    if (x === '!') continue
    const sinSeguir = x === '?'
    // En conflicto (U en alguna de las dos): «otro». Si no, manda lo que pasó en la carpeta y, si no, lo preparado.
    const cambio =
      x === 'U' || y === 'U' ? 'otro' : x === 'D' || y === 'D' ? 'borrado' : cambioDeLetra(y !== ' ' ? y : x)
    // Preparado para el commit (con `git add`) y sin otros cambios encima.
    const preparado = x !== ' ' && x !== '?' && x !== 'U' && y === ' '
    archivos.push({ ruta, cambio, sinSeguir, preparado })
  }
  return archivos
}

/** `--numstat -z --no-renames`: lo agregado y lo quitado de cada archivo; null y null si es binario. */
export function numerosDe(salida: string): Map<string, { mas: number | null; menos: number | null }> {
  const numeros = new Map<string, { mas: number | null; menos: number | null }>()
  for (const entrada of salida.split('\0')) {
    const m = /^\s*(\d+|-)\t(\d+|-)\t(.+)$/s.exec(entrada)
    if (!m?.[3]) continue
    numeros.set(m[3], {
      mas: m[1] === '-' ? null : Number(m[1]),
      menos: m[2] === '-' ? null : Number(m[2]),
    })
  }
  return numeros
}

/** `--name-status -z --no-renames`: la letra y la ruta, alternadas. */
export function letrasDe(salida: string): { ruta: string; cambio: CambioArchivoGit }[] {
  const partes = salida.split('\0').map((p) => p.replace(/^\s+/, ''))
  const archivos: { ruta: string; cambio: CambioArchivoGit }[] = []
  for (let i = 0; i + 1 < partes.length; i += 2) {
    const letra = partes[i] ?? ''
    const ruta = partes[i + 1] ?? ''
    if (!letra || !ruta) continue
    archivos.push({ ruta, cambio: cambioDeLetra(letra[0] ?? '') })
  }
  return archivos
}

/** Los archivos de un commit, en el orden de git, con lo agregado y lo quitado. */
export function archivosDe(letras: string, numeros: string): ArchivoGit[] {
  const n = numerosDe(numeros)
  return letrasDe(letras).map((a) => ({ ...a, ...(n.get(a.ruta) ?? { mas: null, menos: null }) }))
}

/** La salida de `git diff` o `git show` de un solo archivo, en líneas con su número antes y después. */
export function diferenciaDe(salida: string): DiferenciaGit {
  const texto = salida.replace(/\r\n/g, '\n')
  const lineas: LineaDif[] = []
  let viejo = 0
  let nuevo = 0
  let adentro = false
  let cortada = false
  for (const l of texto.split('\n')) {
    if (!adentro) {
      if (/^Binary files .* differ$/.test(l) || l.startsWith('GIT binary patch')) return { tipo: 'binario' }
      if (!l.startsWith('@@')) continue
      adentro = true
    }
    if (lineas.length >= LIMITE_LINEAS_DIF) {
      cortada = true
      break
    }
    const h = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@ ?(.*)$/.exec(l)
    if (h) {
      viejo = Number(h[1])
      nuevo = Number(h[2])
      lineas.push({ tipo: 'tramo', texto: h[3] ?? '', viejo: null, nuevo: null })
      continue
    }
    // Un archivo nuevo de otro diff (no debería, se pide uno solo): se termina acá.
    if (l.startsWith('diff --git')) break
    const signo = l[0]
    const resto = l.slice(1)
    if (signo === '+') lineas.push({ tipo: 'agregada', texto: resto, viejo: null, nuevo: nuevo++ })
    else if (signo === '-') lineas.push({ tipo: 'quitada', texto: resto, viejo: viejo++, nuevo: null })
    else if (signo === ' ') lineas.push({ tipo: 'igual', texto: resto, viejo: viejo++, nuevo: nuevo++ })
    // «\ No newline at end of file» y la línea vacía del final no se muestran.
  }
  if (lineas.length === 0) return { tipo: 'vacia' }
  return { tipo: 'texto', lineas, cortada }
}

/** Cuenta las líneas de un archivo nuevo que git todavía no sigue (todas son agregadas). */
export function lineasDeTexto(texto: string): number {
  if (texto === '') return 0
  const n = texto.split(/\r\n|\n/).length
  return /\r?\n$/.test(texto) ? n - 1 : n
}

/** Un archivo nuevo sin seguir, como si fuera un diff de todo agregado. */
export function diferenciaDeNuevo(texto: string): DiferenciaGit {
  const filas = texto.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n')
  if (filas.at(-1) === '') filas.pop()
  if (filas.length === 0) return { tipo: 'vacia' }
  const lineas: LineaDif[] = [
    { tipo: 'tramo', texto: 'archivo nuevo', viejo: null, nuevo: null },
    ...filas
      .slice(0, LIMITE_LINEAS_DIF)
      .map((t, i): LineaDif => ({ tipo: 'agregada', texto: t, viejo: null, nuevo: i + 1 })),
  ]
  return { tipo: 'texto', lineas, cortada: filas.length > LIMITE_LINEAS_DIF }
}

/** `git remote -v`: el remoto de donde se baja, prefiriendo `origin`; null si no hay. */
export function remotoElegido(salida: string): { nombre: string; url: string } | null {
  const remotos: { nombre: string; url: string }[] = []
  for (const l of salida.split(/\r?\n/)) {
    const m = /^(\S+)\s+(\S+)\s+\(fetch\)$/.exec(l.trim())
    if (m?.[1] && m[2]) remotos.push({ nombre: m[1], url: m[2] })
  }
  return remotos.find((r) => r.nombre === 'origin') ?? remotos[0] ?? null
}

/** Dónde está el remoto, sin usuario ni clave: `owner/repo` en GitHub (con su página) o el servidor y la ruta. */
export function dondeEsta(url: string): { github: boolean; nombre: string; web: string | null } {
  const limpia = url.replace(/^([a-z+]+:\/\/)[^@/]*@/i, '$1').replace(/\.git\/?$/, '')
  const gh = /^(?:[a-z+]+:\/\/|git@)github\.com[:/]([^/\s]+)\/([^/\s]+)$/i.exec(limpia)
  if (gh) return { github: true, nombre: `${gh[1]}/${gh[2]}`, web: `https://github.com/${gh[1]}/${gh[2]}` }
  const otro = /^(?:[a-z+]+:\/\/)?(?:[^@/]+@)?([^/:]+)[:/](.+)$/i.exec(limpia)
  if (otro) return { github: false, nombre: `${otro[1]}/${otro[2]}`, web: null }
  // Una carpeta de la PC u otra cosa: solo el último nombre.
  return { github: false, nombre: limpia.split(/[/]/).filter(Boolean).at(-1) ?? 'otro remoto', web: null }
}
