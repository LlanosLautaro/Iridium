// Copiado de la app anterior de proyectos (D-026).
// Reglas de edición de los metadatos (historia 4): los cambios del menú de la tarjeta y el JSON a guardar.
// Puro: el disco lo maneja infra/.
import type { Estado } from '../../compartido/tipos'
import { type LecturaMetadatos, type Metadatos, rutaIconoSegura, VERSION_ESQUEMA } from './metadatos'

/** Por qué no se puede tocar la ficha desde el menú de la tarjeta; null si se puede. */
function sinFichaUsable(actual: LecturaMetadatos | null): string | null {
  if (actual === null) return 'Primero elige un estado: así se crea la ficha.'
  if (actual.tipo === 'danado') return 'La ficha está dañada: pídele a la IA que la arregle.'
  return null
}

/**
 * Cambio rápido de estado desde el menú de la tarjeta (R-7, D-089). Un proyecto sin ficha la estrena con ese estado;
 * una dañada no se toca. En rescate no: necesita decir qué proyecto lo reemplaza (se le pide a la IA).
 */
export function cambiarEstado(actual: LecturaMetadatos | null, estado: Estado): Metadatos | string {
  if (estado === 'en-rescate') return 'En rescate necesita decir qué proyecto lo reemplaza: pídeselo a la IA.'
  if (actual === null)
    return {
      version: VERSION_ESQUEMA,
      descripcion: '',
      estado,
      etiquetas: [],
      icono: null,
      archivado: false,
      reemplazadoPor: null,
      otros: {},
    }
  if (actual.tipo !== 'ok') return sinFichaUsable(actual) ?? ''
  return { ...actual.metadatos, estado, reemplazadoPor: null }
}

/**
 * Archivar o restaurar (D-004, historia 6): solo cambia `archivado` y el día en que se archivó (`hoy`, AAAA-MM-DD,
 * T-58), no toca la carpeta ni el resto de los datos. Un proyecto sin ficha elige primero su estado.
 */
export function cambiarArchivado(
  actual: LecturaMetadatos | null,
  archivado: boolean,
  hoy: string,
): Metadatos | string {
  if (actual?.tipo !== 'ok') return sinFichaUsable(actual) ?? ''
  return { ...actual.metadatos, archivado, archivadoEl: archivado ? hoy : null }
}

/** El ícono de la ficha (R-7): una imagen de la carpeta del proyecto, ya convertida en ruta relativa (D-009). */
export function cambiarIcono(actual: LecturaMetadatos | null, icono: string): Metadatos | string {
  if (actual?.tipo !== 'ok') return sinFichaUsable(actual) ?? ''
  const seguro = rutaIconoSegura(icono)
  if (seguro === null) return 'El ícono tiene que ser una imagen dentro de la carpeta del proyecto.'
  return { ...actual.metadatos, icono: seguro }
}

/** Texto del archivo: campos conocidos en orden fijo y después los desconocidos, con 2 espacios y salto final. */
export function serializarMetadatos(m: Metadatos): string {
  const { otros, ...conocidos } = m
  const objeto = {
    version: conocidos.version,
    descripcion: conocidos.descripcion,
    estado: conocidos.estado,
    etiquetas: conocidos.etiquetas,
    icono: conocidos.icono,
    archivado: conocidos.archivado,
    // Solo en un archivado con fecha: las fichas de siempre no cambian.
    ...(conocidos.archivado && conocidos.archivadoEl ? { archivadoEl: conocidos.archivadoEl } : {}),
    reemplazadoPor: conocidos.reemplazadoPor,
    ...otros,
  }
  return `${JSON.stringify(objeto, null, 2)}\n`
}
