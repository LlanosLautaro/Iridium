// Copiado de la app anterior de proyectos (D-026).
// Scripts del usuario (D-039): `docs/scripts.md`, con el formato de la skill `hitos-desarrollo-app` › Scripts del
// usuario. Cada script es un título `##`, una descripción y una línea de acción:
//   ## Instalar la última versión
//   Instala o actualiza la app. Cerrala antes.
//   **Ejecutar:** `dist/Instalador 1.2.0.exe`
// **Ejecutar:** es un comando (en una terminal) o un archivo del proyecto que se ejecuta con Windows (un
// instalador); **Abrir:** abre un archivo o una carpeta con su programa. **Carpeta:** cambia dónde corre el comando.
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
}

const LINEA =
  /^\s*(?:[-*+]\s+)?(?:\*\*|__)\s*(Ejecutar|Abrir|Carpeta)\s*:?\s*(?:\*\*|__)\s*:?\s*`([^`]+)`\s*\.?\s*$/i

/** Lee los scripts de `docs/scripts.md`: las secciones `##` que tienen una línea **Ejecutar:** o **Abrir:**. */
export function leerScripts(texto: string): ScriptLeido[] {
  const lineas = partirLineas(texto)
  const ts = titulos(lineas)
  const fuera = lineasFueraDeCodigo(lineas)
  const scripts: ScriptLeido[] = []
  for (const [i, t] of ts.entries()) {
    if (t.nivel !== 2) continue
    const fin = ts.slice(i + 1).find((x) => x.nivel <= 2)?.n ?? lineas.length
    let accion: AccionScript | null = null
    let valor = ''
    let carpeta: string | null = null
    const marcadas = new Set<number>()
    for (const l of fuera) {
      if (l.n <= t.n || l.n >= fin) continue
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
    if (accion === null || valor === '') continue
    let hasta = fin - 1
    while (hasta > t.n && (lineas[hasta] ?? '').trim() === '') hasta--
    const descripcion = lineas
      .slice(t.n + 1, hasta + 1)
      .filter((_, j) => !marcadas.has(t.n + 1 + j))
      .join('\n')
      .trim()
    scripts.push({ nombre: t.texto, linea: t.n, hasta, descripcion, accion, valor, carpeta })
  }
  return scripts
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
