// Las etiquetas de las versiones publicadas en GitHub (D-085): las escribe `tools/publicar.ts` y las lee la copia
// compartida para saber qué commit es.

/** La etiqueta de una versión publicada: `iridium-AAAA-MM-DD-HHMM-<commit>`. */
export function etiquetaVersion(fecha: Date, commit: string): string {
  const d = (n: number) => String(n).padStart(2, '0')
  return `iridium-${fecha.getFullYear()}-${d(fecha.getMonth() + 1)}-${d(fecha.getDate())}-${d(fecha.getHours())}${d(fecha.getMinutes())}-${commit}`
}

/** El commit de una etiqueta de versión; null si no es una. */
export function commitDeEtiqueta(etiqueta: string): string | null {
  return /^iridium-\d{4}-\d{2}-\d{2}-\d{4}-([0-9a-f]{7,40})$/.exec(etiqueta)?.[1] ?? null
}
