// Archivos: buscar un archivo del proyecto por su nombre (T-90). Lo usa la ventana sobre la lista que junta el disco.
/** Para comparar sin mayúsculas ni tildes. */
function plano(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Buscar un archivo por su nombre (T-90, como la lupa de la maqueta de Archivos): cada palabra de lo escrito tiene que
 * estar en la ruta, sin mayúsculas ni tildes. Primero los que empiezan con lo escrito en el nombre, después los que lo
 * tienen en el nombre y al final los que solo lo tienen en la ruta; en cada grupo, las rutas más cortas.
 */
export function buscarArchivos(rutas: readonly string[], texto: string, max = 50): string[] {
  const palabras = plano(texto).split(/\s+/).filter(Boolean)
  if (palabras.length === 0) return []
  const junto = palabras.join(' ')
  const hallados: { ruta: string; grupo: number }[] = []
  for (const ruta of rutas) {
    const r = plano(ruta)
    if (!palabras.every((p) => r.includes(p))) continue
    const nombre = r.slice(r.lastIndexOf('/') + 1)
    const grupo = nombre.startsWith(junto) ? 0 : palabras.every((p) => nombre.includes(p)) ? 1 : 2
    hallados.push({ ruta, grupo })
  }
  hallados.sort((a, b) => a.grupo - b.grupo || a.ruta.length - b.ruta.length || a.ruta.localeCompare(b.ruta))
  return hallados.slice(0, max).map((h) => h.ruta)
}
