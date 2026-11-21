// Copiado de la app anterior de proyectos (D-026).
// Reglas de edición de los metadatos (historia 4): validar lo que llega del formulario y armar el JSON a guardar.
// Puro: el disco lo maneja infra/.
import {
  type DatosEdicion,
  type ErroresFormulario,
  ESTADOS,
  type Estado,
  LIMITE_DESCRIPCION,
  LIMITE_ETIQUETA,
} from '../../compartido/tipos'
import {
  type LecturaMetadatos,
  limpiarEtiquetas,
  type Metadatos,
  rutaIconoSegura,
  VERSION_ESQUEMA,
} from './metadatos'

export type ErroresEdicion = ErroresFormulario

const mismoNombre = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' }) === 0

/**
 * Valida los datos del formulario. `nombre` es el proyecto que se edita y `otros` los nombres de los demás
 * proyectos de la raíz (para "Reemplazado por"). Devuelve los datos limpios o los errores por campo.
 */
export function validarEdicion(
  datos: DatosEdicion,
  nombre: string,
  otros: string[],
): { ok: true; datos: DatosEdicion } | { ok: false; errores: ErroresEdicion } {
  const errores: ErroresEdicion = {}

  const descripcion = datos.descripcion.trim().replace(/\s+/g, ' ')
  if (descripcion === '') errores.descripcion = 'Escribí una descripción corta.'
  else if ([...descripcion].length > LIMITE_DESCRIPCION) {
    errores.descripcion = `Tiene que entrar en ${LIMITE_DESCRIPCION} caracteres.`
  }

  if (!(ESTADOS as readonly string[]).includes(datos.estado)) errores.estado = 'Elegí un estado.'

  let reemplazadoPor: string | null = null
  if (datos.estado === 'en-rescate') {
    const elegido = datos.reemplazadoPor?.trim() ?? ''
    const existente = otros.find((o) => mismoNombre(o, elegido))
    if (elegido === '') errores.reemplazadoPor = 'Elegí qué proyecto lo reemplaza.'
    else if (mismoNombre(elegido, nombre)) errores.reemplazadoPor = 'No puede reemplazarse a sí mismo.'
    else if (!existente) errores.reemplazadoPor = 'Ese proyecto no está en la carpeta raíz.'
    else reemplazadoPor = existente
  }

  const etiquetas = limpiarEtiquetas(datos.etiquetas)
  if (etiquetas.some((e) => [...e].length > LIMITE_ETIQUETA)) {
    errores.etiquetas = `Cada etiqueta puede tener hasta ${LIMITE_ETIQUETA} caracteres.`
  }

  let icono: string | null = null
  if (datos.icono !== null && datos.icono.trim() !== '') {
    icono = rutaIconoSegura(datos.icono)
    if (icono === null) errores.icono = 'El ícono tiene que ser una imagen dentro de la carpeta del proyecto.'
  }

  if (Object.keys(errores).length > 0) return { ok: false, errores }
  return { ok: true, datos: { descripcion, estado: datos.estado, etiquetas, icono, reemplazadoPor } }
}

/** Campos de un JSON (aunque esté dañado) que esta versión no conoce: se conservan al guardar (RNF-3). */
export function camposDesconocidos(texto: string | null): Record<string, unknown> {
  if (texto === null) return {}
  try {
    const json: unknown = JSON.parse(texto.replace(/^﻿/, ''))
    if (typeof json !== 'object' || json === null || Array.isArray(json)) return {}
    const conocidos = new Set([
      'version',
      'descripcion',
      'estado',
      'etiquetas',
      'icono',
      'archivado',
      'reemplazadoPor',
    ])
    return Object.fromEntries(Object.entries(json).filter(([k]) => !conocidos.has(k)))
  } catch {
    return {}
  }
}

/**
 * Metadatos a guardar: lo del formulario sobre lo que ya había. Se conservan `archivado` y los campos
 * desconocidos; si el archivo estaba dañado, se rescata lo desconocido que se pueda leer.
 */
export function mezclarEdicion(
  actual: LecturaMetadatos | null,
  textoActual: string | null,
  datos: DatosEdicion,
): Metadatos {
  const previos = actual?.tipo === 'ok' ? actual.metadatos : null
  return {
    version: VERSION_ESQUEMA,
    descripcion: datos.descripcion,
    estado: datos.estado,
    etiquetas: datos.etiquetas,
    icono: datos.icono,
    archivado: previos?.archivado ?? false,
    reemplazadoPor: datos.estado === 'en-rescate' ? datos.reemplazadoPor : null,
    otros: previos ? previos.otros : camposDesconocidos(textoActual),
  }
}

/** Por qué no se puede tocar la ficha desde el menú de la tarjeta; null si se puede. */
function sinFichaUsable(actual: LecturaMetadatos | null): string | null {
  if (actual === null) return 'Primero elige un estado: así se crea la ficha.'
  if (actual.tipo === 'danado') return 'La ficha está dañada: pedile a la IA que la arregle.'
  return null
}

/**
 * Cambio rápido de estado desde el menú de la tarjeta (R-7, D-089). Un proyecto sin ficha la estrena con ese estado;
 * una dañada no se toca. En rescate no: necesita decir qué proyecto lo reemplaza (se le pide a la IA).
 */
export function cambiarEstado(actual: LecturaMetadatos | null, estado: Estado): Metadatos | string {
  if (estado === 'en-rescate') return 'En rescate necesita decir qué proyecto lo reemplaza: pedíselo a la IA.'
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
 * Archivar o restaurar (D-004, historia 6): solo cambia `archivado`, no toca la carpeta ni el resto de los datos.
 * Un proyecto sin ficha elige primero su estado.
 */
export function cambiarArchivado(actual: LecturaMetadatos | null, archivado: boolean): Metadatos | string {
  if (actual?.tipo !== 'ok') return sinFichaUsable(actual) ?? ''
  return { ...actual.metadatos, archivado }
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
    reemplazadoPor: conocidos.reemplazadoPor,
    ...otros,
  }
  return `${JSON.stringify(objeto, null, 2)}\n`
}
