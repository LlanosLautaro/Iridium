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

/** La primera frase del mensaje de un commit, para mostrarla sola (T-104): hasta el primer punto seguido y, si es
 * muy larga, cortada en una palabra. El mensaje entero va al pasar el mouse. */
export function primeraFrase(mensaje: string, largo = 140): string {
  const texto = mensaje.replace(/\s+/g, ' ').trim()
  const fin = /[.!?](?=\s|$)/.exec(texto)
  const frase = fin ? texto.slice(0, fin.index + 1) : texto
  if (frase.length <= largo) return frase
  const corte = frase.lastIndexOf(' ', largo - 1)
  return `${frase.slice(0, corte > 0 ? corte : largo - 1).replace(/[,;:]$/, '')}…`
}
