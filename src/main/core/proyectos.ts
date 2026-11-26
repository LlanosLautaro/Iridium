// Copiado de la app anterior de proyectos (D-026).
// Reglas puras sobre la lista de proyectos: sin disco ni VS Code.

import type { Guia } from '../../compartido/tipos'
import type { LecturaMetadatos } from './metadatos'

/** Una carpeta encontrada en la raíz, con lo que se leyó de su `.proyecto.json` (null = no tiene). */
export interface CarpetaProyecto {
  nombre: string
  ruta: string
  metadatos: LecturaMetadatos | null
  /** Lo leído de `docs/estado.md`; null si no existe. */
  guia: Guia | null
  /** Fecha (ms) de la última actividad, si ya se calculó. */
  ultimaActividad: number | null
}

/** Las carpetas que empiezan con "." no son proyectos (historia 2). */
export function esCarpetaDeProyecto(nombre: string): boolean {
  return nombre.length > 0 && !nombre.startsWith('.')
}

/** Ruta comparable en Windows: sin distinguir mayúsculas, barras unificadas y sin barra final. */
export function normalizarRuta(ruta: string): string {
  return ruta.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
}

export function esMismaRuta(a: string, b: string | undefined): boolean {
  return b !== undefined && normalizarRuta(a) === normalizarRuta(b)
}

export function inicialDe(nombre: string): string {
  const letra = nombre.trim().match(/\p{L}|\p{N}/u)?.[0]
  return letra ? letra.toLocaleUpperCase('es') : '?'
}
