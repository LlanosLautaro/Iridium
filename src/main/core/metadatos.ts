// Copiado de la app anterior de proyectos (D-026).
// Archivo de metadatos `.proyecto.json` (D-003, D-012): validación y migración. Puro: recibe texto, devuelve datos.
import { ESTADOS, type Estado } from '../../compartido/tipos'

export const NOMBRE_ARCHIVO_METADATOS = '.proyecto.json'
export const VERSION_ESQUEMA = 1

export interface Metadatos {
  version: number
  descripcion: string
  estado: Estado
  etiquetas: string[]
  /** Ruta relativa a la carpeta del proyecto; null = ícono genérico. */
  icono: string | null
  archivado: boolean
  reemplazadoPor: string | null
  /** Campos que esta versión no conoce: se conservan tal cual al guardar (RNF-3). */
  otros: Record<string, unknown>
}

export type LecturaMetadatos = { tipo: 'ok'; metadatos: Metadatos } | { tipo: 'danado'; motivo: string }

const CAMPOS_CONOCIDOS = new Set([
  'version',
  'descripcion',
  'estado',
  'etiquetas',
  'icono',
  'archivado',
  'reemplazadoPor',
])

function esEstado(v: unknown): v is Estado {
  return typeof v === 'string' && (ESTADOS as readonly string[]).includes(v)
}

const danado = (motivo: string): LecturaMetadatos => ({ tipo: 'danado', motivo })

/**
 * Interpreta el contenido de `.proyecto.json`. Obligatorios: `version` y `estado`.
 * Los demás campos, si faltan, toman su valor vacío; si están con un tipo equivocado, el archivo cuenta como dañado.
 */
export function leerMetadatos(texto: string): LecturaMetadatos {
  let json: unknown
  try {
    json = JSON.parse(texto.replace(/^﻿/, ''))
  } catch {
    return danado('no es un JSON válido')
  }
  if (typeof json !== 'object' || json === null || Array.isArray(json)) return danado('no es un objeto JSON')
  const o = json as Record<string, unknown>

  if (typeof o.version !== 'number') return danado('falta la versión del esquema')
  if (o.version > VERSION_ESQUEMA) return danado(`es de una versión más nueva de la ficha (${o.version})`)
  if (!esEstado(o.estado)) return danado('el estado falta o no es válido')

  const descripcion = o.descripcion ?? ''
  if (typeof descripcion !== 'string') return danado('la descripción no es texto')

  const etiquetas = o.etiquetas ?? []
  if (!Array.isArray(etiquetas) || !etiquetas.every((e) => typeof e === 'string')) {
    return danado('las etiquetas no son una lista de textos')
  }

  const icono = o.icono ?? null
  if (icono !== null && typeof icono !== 'string') return danado('el ícono no es una ruta')

  const archivado = o.archivado ?? false
  if (typeof archivado !== 'boolean') return danado('"archivado" no es verdadero o falso')

  const reemplazadoPor = o.reemplazadoPor ?? null
  if (reemplazadoPor !== null && typeof reemplazadoPor !== 'string')
    return danado('"reemplazadoPor" no es texto')

  const otros: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) if (!CAMPOS_CONOCIDOS.has(k)) otros[k] = v

  return {
    tipo: 'ok',
    metadatos: {
      version: VERSION_ESQUEMA,
      descripcion: descripcion.trim(),
      estado: o.estado,
      etiquetas: limpiarEtiquetas(etiquetas),
      icono: icono === null || icono.trim() === '' ? null : icono.trim(),
      archivado,
      reemplazadoPor: reemplazadoPor === null || reemplazadoPor.trim() === '' ? null : reemplazadoPor.trim(),
      otros,
    },
  }
}

/** Sin vacías ni repetidas (sin distinguir mayúsculas), en el orden en que se escribieron. */
export function limpiarEtiquetas(etiquetas: string[]): string[] {
  const vistas = new Set<string>()
  const resultado: string[] = []
  for (const e of etiquetas) {
    const limpia = e.trim()
    const clave = limpia.toLocaleLowerCase('es')
    if (limpia && !vistas.has(clave)) {
      vistas.add(clave)
      resultado.push(limpia)
    }
  }
  return resultado
}

/**
 * Ruta del ícono dentro de la carpeta del proyecto, normalizada con "/".
 * Devuelve null si es absoluta o sale de la carpeta (".."): el gestor solo muestra imágenes del propio proyecto (D-009).
 */
export function rutaIconoSegura(icono: string): string | null {
  const r = icono.replace(/\\/g, '/')
  if (r.startsWith('/') || /^[a-zA-Z]:/.test(r)) return null
  const partes = r.split('/').filter((p) => p !== '' && p !== '.')
  if (partes.length === 0 || partes.includes('..')) return null
  if (!/\.(png|svg|jpe?g|webp|gif|ico)$/i.test(r)) return null
  return partes.join('/')
}
