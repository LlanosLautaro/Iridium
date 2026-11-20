// Commit y subir, y la sincronización con GitHub (D-159): lo que usan la ventana y el proceso principal.
import type { ArchivoGit, SincroniaGit } from './puente'

/** Lo más largo que se acepta como mensaje de un commit. */
export const LARGO_MENSAJE = 5000

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

/** `Q-12` de `docs/respuestas/Q-12.md` (o de su carpeta de adjuntos). */
function respuestaDe(ruta: string): string | null {
  return /^docs\/respuestas\/(Q-\d+)(?:\.md$|\/)/.exec(ruta)?.[1] ?? null
}

/**
 * El mensaje que se propone si no se escribe otro: las respuestas que se guardan («Respuestas a Q-3 y Q-4»), o los
 * archivos («Cambios en estado.md y trabajo.md», «Cambios en 7 archivos»).
 */
export function mensajeSugerido(archivos: readonly Pick<ArchivoGit, 'ruta'>[]): string {
  if (archivos.length === 0) return ''
  const qs = archivos.map((a) => respuestaDe(a.ruta))
  if (qs.every((q) => q !== null)) {
    const unicas = [...new Set(qs as string[])].sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)))
    return `${unicas.length === 1 ? 'Respuesta a' : 'Respuestas a'} ${lista(unicas)}`
  }
  if (archivos.length <= 3) {
    const nombres = [...new Set(archivos.map((a) => a.ruta.split('/').at(-1) ?? a.ruta))]
    return `Cambios en ${lista(nombres)}`
  }
  return `Cambios en ${plural(archivos.length, 'archivo', 'archivos')}`
}

function lista(xs: readonly string[]): string {
  if (xs.length <= 1) return xs[0] ?? ''
  return `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`
}

/** La línea de la sección Git con la última vez que se miró el remoto; `hace`: «hace 2 min», «recién». */
export function textoDeSincronia(s: SincroniaGit, donde: string, hace: string): string {
  switch (s.resultado) {
    case 'al-dia':
      return `Revisado ${hace}`
    case 'bajado':
      return `Trajo ${plural(s.bajados, 'commit', 'commits')} ${donde.startsWith('el ') ? `del ${donde.slice(3)}` : `de ${donde}`} ${hace}`
    case 'separada':
      return `Esta PC y ${donde} tienen commits distintos: Sincronizar los junta`
    case 'choca':
      return s.motivo ?? 'Hay cambios sin guardar en los mismos archivos que trae el remoto'
    case 'sin-conexion':
    case 'error':
      return s.motivo ?? `No se pudo revisar ${donde}`
  }
}
