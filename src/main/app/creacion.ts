// Copiado de la app anterior de proyectos (D-026).
// Caso de uso: crear la carpeta de un proyecto nuevo en la raíz (D-020) con la plantilla básica del framework (R-14,
// D-101). La IA no interviene: el resto se hace conversando.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  fechaDelDia,
  PLANTILLAS_PROYECTO_NUEVO,
  type PlantillasProyectoNuevo,
  plantillaProyectoNuevo,
  problemaNombreProyecto,
} from '../core/creacion'
import { crearCarpeta, leerNombres } from '../infra/raiz'

export type ResultadoCrear = { ok: true; ruta: string; nombre: string } | { ok: false; mensaje: string }

/** Lee las plantillas del framework de la carpeta `plantillas/` de la skill `iridium`. */
export async function leerPlantillas(carpeta: string): Promise<PlantillasProyectoNuevo> {
  const textos = await Promise.all(PLANTILLAS_PROYECTO_NUEVO.map((a) => readFile(join(carpeta, a), 'utf8')))
  return Object.fromEntries(
    PLANTILLAS_PROYECTO_NUEVO.map((a, i) => [a, textos[i]]),
  ) as PlantillasProyectoNuevo
}

/**
 * Crea la carpeta y, si se pasan las plantillas (`carpetaPlantillas`), la plantilla básica adentro. Sin plantillas,
 * solo la carpeta, vacía.
 */
export async function crearProyecto(
  raiz: string,
  nombre: string,
  carpetaPlantillas?: string,
  hoy: Date = new Date(),
): Promise<ResultadoCrear> {
  const n = nombre.trim()
  let existentes: string[]
  try {
    existentes = await leerNombres(raiz)
  } catch {
    return { ok: false, mensaje: `No se pudo leer la carpeta raíz: ${raiz}` }
  }
  const problema = problemaNombreProyecto(n, existentes)
  if (problema) return { ok: false, mensaje: problema }
  let plantillas: PlantillasProyectoNuevo | null = null
  if (carpetaPlantillas) {
    try {
      plantillas = await leerPlantillas(carpetaPlantillas)
    } catch {
      return {
        ok: false,
        mensaje: 'No encuentro las plantillas del framework: prueba armar Iridium de nuevo.',
      }
    }
  }
  const ruta = join(raiz, n)
  try {
    await crearCarpeta(ruta)
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'EEXIST') {
      return { ok: false, mensaje: 'Ya hay una carpeta con ese nombre.' }
    }
    return { ok: false, mensaje: `No se pudo crear la carpeta: ${String(e)}` }
  }
  if (plantillas) {
    try {
      for (const a of plantillaProyectoNuevo(n, fechaDelDia(hoy), plantillas)) {
        const destino = join(ruta, ...a.ruta.split('/'))
        await mkdir(dirname(destino), { recursive: true })
        await writeFile(destino, a.texto, { encoding: 'utf8', flag: 'wx' })
      }
    } catch (e) {
      return {
        ok: false,
        mensaje: `La carpeta está creada, pero no se pudo escribir la plantilla: ${String(e)}`,
      }
    }
  }
  return { ok: true, ruta, nombre: n }
}
