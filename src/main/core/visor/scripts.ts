// Copiado de la app anterior de proyectos (D-026).
// Scripts del usuario (D-039): `docs/scripts.md`, con el formato del framework (`SKILL.md` › Los
// scripts). Cada script es un título `##`, una descripción y una línea de acción:
//   ## Instalar la última versión
//   Instala o actualiza la app. Cerrala antes.
//   **Ejecutar:** `dist/Instalador 1.2.0.exe`
// **Ejecutar:** es un comando (en una terminal) o un archivo del proyecto que se ejecuta con Windows (un
// instalador); **Abrir:** abre un archivo o una carpeta con su programa, o una dirección `http(s)://` en el navegador
// (D-156). **Carpeta:** cambia dónde corre el comando. **Marca:** (frente Abrir, D-156) dice que ese script es lo que
// abre el proyecto (`ejecutar · escritorio`, `página` o `consola`) o el que lo arma (`armar`); va sin comillas.
import { lineasFueraDeCodigo, partirLineas, titulos } from './lineas'

export const RUTA_SCRIPTS = 'docs/scripts.md'

export type AccionScript = 'ejecutar' | 'abrir'

export interface ScriptLeido {
  nombre: string
  /** Línea del título (desde 0). */
  linea: number
  /** Última línea de la sección. */
  hasta: number
  /** Markdown de la descripción: la sección sin las líneas de acción y de carpeta. */
  descripcion: string
  accion: AccionScript
  /** Comando o ruta (relativa a la raíz del proyecto). */
  valor: string
  /** Carpeta donde corre el comando, relativa a la raíz; null = la raíz. */
  carpeta: string | null
  /** La marca de Abrir (D-156), o null si no tiene o no se entiende (el control lo dice). */
  marca: MarcaScript | null
  /** La línea `**Marca:**` tal cual se escribió (desde 0) y su texto, para el control; null si no tiene. */
  marcaEscrita: MarcaEscrita | null
}

/** Cómo se abre lo que hace el proyecto (D-156): un programa, una página o una consola. */
export type ComoEjecuta = 'escritorio' | 'pagina' | 'consola'

export type MarcaScript = { tipo: 'ejecutar'; como: ComoEjecuta } | { tipo: 'armar' }

export interface MarcaEscrita {
  linea: number
  texto: string
}

/** La sección `##` de una marca que no está en un script (sin línea de acción): para el control. */
export interface MarcaSuelta extends MarcaEscrita {
  seccion: string
}

const LINEA =
  /^\s*(?:[-*+]\s+)?(?:\*\*|__)\s*(Ejecutar|Abrir|Carpeta)\s*:?\s*(?:\*\*|__)\s*:?\s*`([^`]+)`\s*\.?\s*$/i

/** `**Marca:** ejecutar · escritorio`: sin comillas (si las tiene, igual se lee). */
const LINEA_MARCA = /^\s*(?:[-*+]\s+)?(?:\*\*|__)\s*Marca\s*:?\s*(?:\*\*|__)\s*:?\s*(.*?)\s*\.?\s*$/i

const COMO: Record<string, ComoEjecuta> = { escritorio: 'escritorio', pagina: 'pagina', consola: 'consola' }

/** Lee el texto de una marca: `ejecutar · escritorio`, `armar`. null si no se entiende. */
export function leerMarca(texto: string): MarcaScript | null {
  const partes = texto
    .replace(/`/g, '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split('·')
    .map((p) => p.trim())
  if (partes.length === 1 && partes[0] === 'armar') return { tipo: 'armar' }
  const como = partes.length === 2 && partes[0] === 'ejecutar' ? COMO[partes[1] ?? ''] : undefined
  return como ? { tipo: 'ejecutar', como } : null
}

/** Lee los scripts de `docs/scripts.md`: las secciones `##` que tienen una línea **Ejecutar:** o **Abrir:**. */
export function leerScripts(texto: string): ScriptLeido[] {
  return leerScriptsYMarcas(texto).scripts
}

/** Los scripts y, aparte, las marcas escritas en secciones que no son un script (el control las marca). */
export function leerScriptsYMarcas(texto: string): { scripts: ScriptLeido[]; sueltas: MarcaSuelta[] } {
  const lineas = partirLineas(texto)
  const ts = titulos(lineas)
  const fuera = lineasFueraDeCodigo(lineas)
  const scripts: ScriptLeido[] = []
  const sueltas: MarcaSuelta[] = []
  for (const [i, t] of ts.entries()) {
    if (t.nivel !== 2) continue
    const fin = ts.slice(i + 1).find((x) => x.nivel <= 2)?.n ?? lineas.length
    let accion: AccionScript | null = null
    let valor = ''
    let carpeta: string | null = null
    let marcaEscrita: MarcaEscrita | null = null
    const marcadas = new Set<number>()
    for (const l of fuera) {
      if (l.n <= t.n || l.n >= fin) continue
      const mm = LINEA_MARCA.exec(l.texto)
      if (mm) {
        marcaEscrita ??= { linea: l.n, texto: mm[1] ?? '' }
        marcadas.add(l.n)
        continue
      }
      const m = LINEA.exec(l.texto)
      if (!m?.[1] || !m[2]) continue
      const tipo = m[1].toLowerCase()
      if (tipo === 'carpeta') {
        carpeta ??= m[2].trim()
        marcadas.add(l.n)
      } else if (accion === null) {
        accion = tipo === 'ejecutar' ? 'ejecutar' : 'abrir'
        valor = m[2].trim()
        marcadas.add(l.n)
      }
    }
    if (accion === null || valor === '') {
      if (marcaEscrita) sueltas.push({ ...marcaEscrita, seccion: t.texto })
      continue
    }
    let hasta = fin - 1
    while (hasta > t.n && (lineas[hasta] ?? '').trim() === '') hasta--
    const descripcion = lineas
      .slice(t.n + 1, hasta + 1)
      .filter((_, j) => !marcadas.has(t.n + 1 + j))
      .join('\n')
      .trim()
    const marca = marcaEscrita ? leerMarca(marcaEscrita.texto) : null
    scripts.push({
      nombre: t.texto,
      linea: t.n,
      hasta,
      descripcion,
      accion,
      valor,
      carpeta,
      marca,
      marcaEscrita,
    })
  }
  return { scripts, sueltas }
}

/** Una dirección web para **Abrir:** (D-156): la abre el navegador. */
export function esDireccionWeb(valor: string): boolean {
  return /^https?:\/\/\S+$/i.test(valor.trim())
}

/**
 * Una ruta fuera del proyecto que empieza con una variable de Windows (`%LOCALAPPDATA%\Programs\Alfa\Alfa.exe`,
 * D-158): la de un programa instalado. La variable y lo que sigue (sin la barra), o null si no empieza así.
 */
export function rutaConVariable(valor: string): { variable: string; resto: string } | null {
  const m = /^%([A-Za-z_][A-Za-z0-9_]*)%(?:[\\/](.*))?$/.exec(valor.trim())
  return m?.[1] ? { variable: m[1], resto: m[2] ?? '' } : null
}

/** Una ruta fija de Windows (`C:\…`, `\\equipo\…`): no sirve en otra PC (D-158). */
export function esRutaFija(valor: string): boolean {
  return /^([a-z]:|[\\/])/i.test(valor.trim())
}

/** Archivos que Windows ejecuta al abrirlos: con **Ejecutar:**, una ruta así es un archivo aunque todavía no exista. */
const EJECUTABLE = /\.(exe|msi|msix|msixbundle|appx|appxbundle|bat|cmd|lnk|vsix)$/i

/**
 * Qué hace **Ejecutar:** con este valor. `lanzar`: es un archivo del proyecto y se ejecuta con Windows (un
 * instalador); `falta`: parece un archivo ejecutable pero no está; `comando`: se corre en una terminal.
 */
export function modoDeEjecutar(valor: string, esArchivo: boolean): 'lanzar' | 'falta' | 'comando' {
  if (esArchivo) return 'lanzar'
  return EJECUTABLE.test(valor.trim()) ? 'falta' : 'comando'
}
