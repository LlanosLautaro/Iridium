// Copiado de la app anterior de proyectos (D-026).
// Tamaños para mostrar en la confirmación de Eliminar: "820 bytes", "4,2 KB", "312 MB", "1,5 GB".

const UNIDADES = ['KB', 'MB', 'GB', 'TB']

export function tamanoLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} ${bytes === 1 ? 'byte' : 'bytes'}`
  let valor = bytes
  let unidad = -1
  while (valor >= 1024 && unidad < UNIDADES.length - 1) {
    valor /= 1024
    unidad++
  }
  const numero = valor.toLocaleString('es-AR', { maximumFractionDigits: valor < 10 ? 1 : 0 })
  return `${numero} ${UNIDADES[unidad]}`
}

/** "1 archivo", "1.234 archivos". */
export function cantidadArchivos(n: number): string {
  return `${n.toLocaleString('es-AR')} ${n === 1 ? 'archivo' : 'archivos'}`
}
