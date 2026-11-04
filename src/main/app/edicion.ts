// Copiado de la app anterior de proyectos (D-026).
// Casos de uso de edición (historia 4): guardar el formulario y el cambio rápido de estado.

import type { DatosEdicion, ErroresFormulario, Estado } from '../../compartido/tipos'
import {
  cambiarArchivado,
  cambiarEstado,
  mezclarEdicion,
  serializarMetadatos,
  validarEdicion,
} from '../core/edicion'
import type { LecturaMetadatos, Metadatos } from '../core/metadatos'
import { leerMetadatos, rutaIconoSegura } from '../core/metadatos'
import { esMismaRuta } from '../core/proyectos'
import { escribirMetadatos, leerTextoMetadatos } from '../infra/escritura'
import { existeArchivo, leerCarpetas } from '../infra/raiz'

export type ResultadoGuardar =
  | { ok: true }
  | { ok: false; mensaje: string | null; errores: ErroresFormulario }

const fallo = (mensaje: string, errores: ErroresFormulario = {}): ResultadoGuardar => ({
  ok: false,
  mensaje,
  errores,
})

/** La ruta tiene que ser una carpeta hija de la raíz: la pestaña nunca puede hacer escribir en otro lado. */
export async function proyectosDeLaRaiz(raiz: string, ruta: string) {
  const carpetas = await leerCarpetas(raiz)
  const proyecto = carpetas.find((c) => esMismaRuta(c.ruta, ruta))
  return { proyecto, otros: carpetas.filter((c) => c !== proyecto).map((c) => c.nombre) }
}

function mensajeDeEscritura(e: unknown): string {
  const codigo = (e as NodeJS.ErrnoException).code
  if (codigo === 'EACCES' || codigo === 'EPERM' || codigo === 'EROFS') {
    return 'No se pudo guardar: la carpeta es de solo lectura o está en uso.'
  }
  return 'No se pudo guardar el archivo del proyecto.'
}

export async function guardarProyecto(
  raiz: string,
  ruta: string,
  datos: DatosEdicion,
): Promise<ResultadoGuardar> {
  const { proyecto, otros } = await proyectosDeLaRaiz(raiz, ruta)
  if (!proyecto) return fallo('El proyecto ya no está en la carpeta raíz.')

  const validacion = validarEdicion(datos, proyecto.nombre, otros)
  if (!validacion.ok) return { ok: false, mensaje: null, errores: validacion.errores }
  const limpios = validacion.datos
  if (limpios.icono !== null && !(await existeArchivo(`${proyecto.ruta}/${limpios.icono}`))) {
    return {
      ok: false,
      mensaje: null,
      errores: { icono: 'La imagen ya no existe en la carpeta del proyecto.' },
    }
  }

  try {
    const texto = await leerTextoMetadatos(proyecto.ruta)
    const actual = texto === null ? null : leerMetadatos(texto)
    await escribirMetadatos(proyecto.ruta, serializarMetadatos(mezclarEdicion(actual, texto, limpios)))
    return { ok: true }
  } catch (e) {
    return fallo(mensajeDeEscritura(e))
  }
}

export type ResultadoSimple = { ok: true } | { ok: false; mensaje: string }

/** Lee los metadatos del proyecto, aplica un cambio y los guarda (atómico, conservando campos). */
async function modificarProyecto(
  raiz: string,
  ruta: string,
  cambio: (actual: LecturaMetadatos | null) => Metadatos | string,
): Promise<ResultadoSimple> {
  const { proyecto } = await proyectosDeLaRaiz(raiz, ruta)
  if (!proyecto) return { ok: false, mensaje: 'El proyecto ya no está en la carpeta raíz.' }
  try {
    const texto = await leerTextoMetadatos(proyecto.ruta)
    const nuevo = cambio(texto === null ? null : leerMetadatos(texto))
    if (typeof nuevo === 'string') return { ok: false, mensaje: nuevo }
    await escribirMetadatos(proyecto.ruta, serializarMetadatos(nuevo))
    return { ok: true }
  } catch (e) {
    return { ok: false, mensaje: mensajeDeEscritura(e) }
  }
}

export function cambiarEstadoProyecto(raiz: string, ruta: string, estado: Estado): Promise<ResultadoSimple> {
  return modificarProyecto(raiz, ruta, (actual) => cambiarEstado(actual, estado))
}

/** Archivar (true) o restaurar / deshacer (false). La carpeta no se mueve (D-004). */
export function archivarProyecto(raiz: string, ruta: string, archivado: boolean): Promise<ResultadoSimple> {
  return modificarProyecto(raiz, ruta, (actual) => cambiarArchivado(actual, archivado))
}

/**
 * Convierte la imagen elegida en el diálogo en una ruta relativa al proyecto (D-009).
 * Devuelve null si está fuera de la carpeta del proyecto o no es una imagen.
 */
export function iconoRelativo(rutaProyecto: string, archivo: string): string | null {
  const base = `${rutaProyecto.replace(/\\/g, '/').replace(/\/+$/, '')}/`
  const elegido = archivo.replace(/\\/g, '/')
  if (!elegido.toLowerCase().startsWith(base.toLowerCase())) return null
  return rutaIconoSegura(elegido.slice(base.length))
}
