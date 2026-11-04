// Copiado de la app anterior de proyectos (D-026).
// Casos de uso: orquestan core/ e infra/. Reciben sus dependencias para poder probarse con carpetas temporales.

import type { Vista } from '../../compartido/tipos'
import { armarVista, esMismaRuta } from '../core/proyectos'
import { existeArchivo, existeCarpeta, leerCarpetas, RaizNoEncontrada } from '../infra/raiz'

export interface Entorno {
  raiz: string
  rutaAbierta: string | undefined
  abrirCarpeta: (ruta: string) => Promise<void>
  /** Últimas actividades ya calculadas, por ruta (se calculan aparte porque son lentas, RNF-1). */
  actividades?: ReadonlyMap<string, number | null>
}

export async function listarProyectos(entorno: Entorno): Promise<Vista> {
  try {
    const carpetas = await leerCarpetas(entorno.raiz)
    for (const c of carpetas) c.ultimaActividad = entorno.actividades?.get(c.ruta) ?? null
    const vista = armarVista(entorno.raiz, carpetas, entorno.rutaAbierta)
    await descartarIconosInexistentes(vista)
    return vista
  } catch (e) {
    if (e instanceof RaizNoEncontrada) return { tipo: 'error', raiz: entorno.raiz, mensaje: e.message }
    throw e
  }
}

/** Un ícono que no existe en disco se reemplaza por el genérico (04-ux.md, Extremos). */
async function descartarIconosInexistentes(vista: Vista): Promise<void> {
  if (vista.tipo !== 'lista') return
  const proyectos = vista.secciones.flatMap((s) => s.proyectos).filter((p) => p.icono !== null)
  await Promise.all(
    proyectos.map(async (p) => {
      if (p.icono !== null && !(await existeArchivo(p.icono))) p.icono = null
    }),
  )
}

/**
 * Calcula la última actividad de cada proyecto de la vista y la guarda en `memoria`.
 * Devuelve true si alguna fecha cambió (hay que volver a mandar la vista).
 */
export async function actualizarActividades(
  vista: Vista,
  memoria: Map<string, number | null>,
  calcular: (ruta: string) => Promise<number | null>,
): Promise<boolean> {
  if (vista.tipo !== 'lista') return false
  let cambio = false
  for (const p of vista.secciones.flatMap((s) => s.proyectos)) {
    const fecha = await calcular(p.ruta)
    if (!memoria.has(p.ruta) || memoria.get(p.ruta) !== fecha) cambio = true
    memoria.set(p.ruta, fecha)
  }
  return cambio
}

export type ResultadoAbrir = { ok: true } | { ok: false; mensaje: string }

export async function abrirProyecto(entorno: Entorno, ruta: string): Promise<ResultadoAbrir> {
  if (esMismaRuta(ruta, entorno.rutaAbierta)) return { ok: false, mensaje: 'Ese proyecto ya está abierto.' }
  if (!(await existeCarpeta(ruta))) {
    return { ok: false, mensaje: 'El proyecto ya no está en la carpeta raíz. Se actualizó la lista.' }
  }
  await entorno.abrirCarpeta(ruta)
  return { ok: true }
}
