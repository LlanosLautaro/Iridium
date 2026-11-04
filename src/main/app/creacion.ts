// Copiado de la app anterior de proyectos (D-026).
// Caso de uso: crear la carpeta de un proyecto nuevo en la raíz (D-020). Solo la carpeta, vacía.
import { join } from 'node:path'
import { problemaNombreProyecto } from '../core/creacion'
import { crearCarpeta, leerNombres } from '../infra/raiz'

export type ResultadoCrear = { ok: true; ruta: string; nombre: string } | { ok: false; mensaje: string }

export async function crearProyecto(raiz: string, nombre: string): Promise<ResultadoCrear> {
  const n = nombre.trim()
  let existentes: string[]
  try {
    existentes = await leerNombres(raiz)
  } catch {
    return { ok: false, mensaje: `No se pudo leer la carpeta raíz: ${raiz}` }
  }
  const problema = problemaNombreProyecto(n, existentes)
  if (problema) return { ok: false, mensaje: problema }
  const ruta = join(raiz, n)
  try {
    await crearCarpeta(ruta)
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'EEXIST') {
      return { ok: false, mensaje: 'Ya hay una carpeta con ese nombre.' }
    }
    return { ok: false, mensaje: `No se pudo crear la carpeta: ${String(e)}` }
  }
  return { ok: true, ruta, nombre: n }
}
