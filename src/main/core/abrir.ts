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
