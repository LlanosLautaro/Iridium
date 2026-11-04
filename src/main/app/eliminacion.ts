// Copiado de la app anterior de proyectos (D-026).
// Caso de uso Eliminar (D-006, D-019): primero se arma el plan y se muestra; solo con la confirmación se borra.
// Las carpetas regenerables se borran definitivamente; todo lo demás va a la papelera de Windows.
import { join } from 'node:path'
import type { PlanEliminacion } from '../../compartido/tipos'
import { normalizarRuta } from '../core/proyectos'
import { esRutaInterna } from '../core/regenerables'
import {
  analizarCarpeta,
  borrarDefinitivamente,
  contenido,
  quitarCarpetaVacia,
  tamanoCarpeta,
} from '../infra/eliminacion'
import { proyectosDeLaRaiz, type ResultadoSimple } from './edicion'

export type ResultadoPlan =
  | { ok: true; nombre: string; ruta: string; plan: PlanEliminacion }
  | { ok: false; mensaje: string }

/** La ventana tiene abierto ese proyecto (o una carpeta dentro de él): sus archivos pueden estar en uso. */
function estaAbierto(rutaProyecto: string, rutaAbierta: string | undefined): boolean {
  if (rutaAbierta === undefined) return false
  const proyecto = normalizarRuta(rutaProyecto)
  const abierta = normalizarRuta(rutaAbierta)
  return abierta === proyecto || abierta.startsWith(`${proyecto}/`)
}

async function validar(raiz: string, ruta: string, rutaAbierta: string | undefined) {
  const { proyecto } = await proyectosDeLaRaiz(raiz, ruta)
  if (!proyecto) return { ok: false as const, mensaje: 'El proyecto ya no está en la carpeta raíz.' }
  if (estaAbierto(proyecto.ruta, rutaAbierta)) {
    return {
      ok: false as const,
      mensaje: 'No se puede eliminar el proyecto abierto en esta ventana. Abrí otro y volvé a intentarlo.',
    }
  }
  return { ok: true as const, proyecto }
}

/** Analiza la carpeta: qué se borra definitivamente y qué va a la papelera. No toca nada. */
export async function prepararEliminacion(
  raiz: string,
  ruta: string,
  rutaAbierta: string | undefined,
): Promise<ResultadoPlan> {
  const v = await validar(raiz, ruta, rutaAbierta)
  if (!v.ok) return v
  try {
    const plan = await analizarCarpeta(v.proyecto.ruta)
    return { ok: true, nombre: v.proyecto.nombre, ruta: v.proyecto.ruta, plan }
  } catch {
    return { ok: false, mensaje: 'No se pudo leer la carpeta del proyecto.' }
  }
}

/** Completa el tamaño de cada carpeta regenerable (es lo lento: se muestra después del plan). */
export async function medirRegenerables(
  rutaProyecto: string,
  plan: PlanEliminacion,
): Promise<PlanEliminacion> {
  const regenerables = await Promise.all(
    plan.regenerables.map(async (r) => ({
      relativa: r.relativa,
      bytes: esRutaInterna(r.relativa) ? await tamanoCarpeta(join(rutaProyecto, r.relativa)) : null,
    })),
  )
  return { ...plan, regenerables }
}

/**
 * Ejecuta un plan ya confirmado. `papelera` manda una ruta a la papelera (la da VS Code; en los tests, un falso).
 * Primero intenta mandar la carpeta entera (queda como un solo elemento en la papelera); si Windows no lo
 * permite, manda su contenido elemento por elemento y después la carpeta vacía (07-construccion.md, iteración 2).
 */
export async function ejecutarEliminacion(
  raiz: string,
  ruta: string,
  plan: PlanEliminacion,
  rutaAbierta: string | undefined,
  papelera: (ruta: string) => Promise<void>,
): Promise<ResultadoSimple> {
  const v = await validar(raiz, ruta, rutaAbierta)
  if (!v.ok) return v
  const carpeta = v.proyecto.ruta

  try {
    for (const r of plan.regenerables) {
      if (esRutaInterna(r.relativa)) await borrarDefinitivamente(join(carpeta, r.relativa))
    }
  } catch {
    return {
      ok: false,
      mensaje:
        'No se pudieron borrar las carpetas regenerables (puede haber archivos en uso). No se mandó nada a la papelera.',
    }
  }

  try {
    await papelera(carpeta)
    return { ok: true }
  } catch {
    // Sigue elemento por elemento.
  }
  try {
    for (const nombre of await contenido(carpeta)) await papelera(join(carpeta, nombre))
  } catch {
    return {
      ok: false,
      mensaje:
        'Se eliminó solo una parte: algunos archivos están en uso. Lo que se movió está en la papelera; el resto sigue en la carpeta.',
    }
  }
  try {
    await papelera(carpeta)
  } catch {
    // Si quedó vacía, quitarla no pierde nada (y si no está vacía, no se quita).
    try {
      await quitarCarpetaVacia(carpeta)
    } catch {
      return { ok: false, mensaje: 'Todo está en la papelera, pero la carpeta vacía no se pudo quitar.' }
    }
  }
  return { ok: true }
}
