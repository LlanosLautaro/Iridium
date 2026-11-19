// Abrir (frente Abrir, D-156; `modulos/abrir/diseno-tecnico.md`): qué abre cada proyecto, según la marca de su
// `docs/scripts.md`, y si se puede armar solo. Reglas puras.
import type { ComoEjecuta, ScriptLeido } from './visor/scripts'

/** Lo que dice el botón al pasar el mouse, antes de la descripción del script (D-155). */
export const DETALLE_DE: Record<ComoEjecuta, string> = {
  escritorio: 'Abre la app.',
  pagina: 'Abre en el navegador.',
  consola: 'Corre en una consola.',
}

/** El script marcado `ejecutar` (el primero, si hay más: el control lo dice) y su tipo; null si no hay. */
export function scriptQueEjecuta(
  scripts: readonly ScriptLeido[],
): { script: ScriptLeido; como: ComoEjecuta } | null {
  for (const s of scripts) if (s.marca?.tipo === 'ejecutar') return { script: s, como: s.marca.como }
  return null
}

/** El script marcado `armar`, o null. */
export function scriptQueArma(scripts: readonly ScriptLeido[]): ScriptLeido | null {
  return scripts.find((s) => s.marca?.tipo === 'armar') ?? null
}

/** Qué ejecuta el proyecto, para la tarjeta: su tipo y el detalle del botón. null, sin marca (AB-1). */
export function queEjecuta(scripts: readonly ScriptLeido[]): { como: ComoEjecuta; detalle: string } | null {
  const e = scriptQueEjecuta(scripts)
  if (!e) return null
  const descripcion = textoPlano(e.script.descripcion)
  return { como: e.como, detalle: descripcion ? `${DETALLE_DE[e.como]} ${descripcion}` : DETALLE_DE[e.como] }
}

/** El par que pide la actualización automática: abre un programa (`ejecutar · escritorio`) y sabe armarse (`armar`). */
export function puedeArmarse(scripts: readonly ScriptLeido[]): boolean {
  return scriptQueEjecuta(scripts)?.como === 'escritorio' && scriptQueArma(scripts)?.accion === 'ejecutar'
}

/** La descripción de un script como texto de una línea: sin las marcas de Markdown. */
function textoPlano(md: string): string {
  return md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------- La actualización automática (AB-I2, D-156 › 4 y 5) ----------

/** Lo que se sabe de un proyecto para decidir si se arma solo; cada condición, un dato (para probarlas solas). */
export interface SituacionArmado {
  /** El último commit; null sin git o fuera de un repositorio. */
  commit: string | null
  /** El commit con que se armó la última vez que salió bien; null si no se sabe. */
  armado: string | null
  /** Sin archivos con seguimiento a medio cambiar. */
  limpio: boolean
  /** Una IA trabaja en el proyecto (una sesión de Iridium en marcha o VS Code hace poco). */
  iaTrabajando: boolean
  /** La app está abierta (Windows no deja escribir su `.exe`). */
  abierta: boolean
  /** La actualización automática está prendida en el proyecto (D-154). */
  prendida: boolean
  /** El commit con que falló el último armado; null si el último no falló. */
  fallo: string | null
}

export type PorQueNoArma = 'sin-git' | 'al-dia' | 'apagada' | 'ya-fallo' | 'a-medias' | 'ia' | 'abierta'

/** Por qué no se arma solo ahora (la decisión 5 de D-156), o null si toca armar. */
export function porQueNoArma(s: SituacionArmado): PorQueNoArma | null {
  if (s.commit === null) return 'sin-git'
  if (s.armado === s.commit) return 'al-dia'
  if (!s.prendida) return 'apagada'
  if (s.fallo === s.commit) return 'ya-fallo'
  if (!s.limpio) return 'a-medias'
  if (s.iaTrabajando) return 'ia'
  if (s.abierta) return 'abierta'
  return null
}

/**
 * La primera vez, sin nada anotado (D-156 › 4): la versión cuenta como armada con el último commit si el `.exe` es
 * más nuevo que ese commit. Fechas en ms; null si no se saben.
 */
export function armadoSupuesto(
  commit: string | null,
  fechaCommit: number | null,
  fechaExe: number | null,
): string | null {
  if (commit === null || fechaCommit === null || fechaExe === null) return null
  return fechaExe >= fechaCommit ? commit : null
}
