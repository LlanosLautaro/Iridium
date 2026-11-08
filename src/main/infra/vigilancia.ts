// Vigila la carpeta de proyectos con `fs.watch` recursivo (D-028) y avisa qué proyectos cambiaron.
// Los cambios llegan de a ráfagas (la IA escribe varios archivos seguidos): se juntan y se avisa una vez.
import { type FSWatcher, watch } from 'node:fs'
import { cambianSkills, disenoAfectado, documentoAfectado, proyectoAfectado } from '../core/vigilancia'

export interface Vigilancia {
  cerrar(): void
}

export function vigilar(
  raiz: string,
  alCambiar: (proyectos: ReadonlySet<string>) => void,
  esperaMs = 250,
  /** Los proyectos a los que les cambió un documento (Docs y el Mapa se releen). */
  alCambiarDocs?: (proyectos: ReadonlySet<string>) => void,
  /** Cambió una skill propia o el formato de un proyecto (la sección Skills se relee). */
  alCambiarSkills?: () => void,
  /** Los archivos de `docs/diseno/` que cambiaron, por proyecto (la sección Diseño redibuja esas maquetas). */
  alCambiarDiseno?: (cambios: ReadonlyMap<string, ReadonlySet<string>>) => void,
): Vigilancia {
  let pendientes = new Set<string>()
  let diseno = new Map<string, Set<string>>()
  let docs = new Set<string>()
  let skills = false
  let temporizador: NodeJS.Timeout | null = null
  let observador: FSWatcher | null = null

  const avisar = () => {
    temporizador = null
    const lote = pendientes
    const loteDocs = docs
    pendientes = new Set()
    docs = new Set()
    const conSkills = skills
    skills = false
    const loteDiseno = diseno
    diseno = new Map()
    if (lote.size > 0) alCambiar(lote)
    if (loteDocs.size > 0) alCambiarDocs?.(loteDocs)
    if (conSkills) alCambiarSkills?.()
    if (loteDiseno.size > 0) alCambiarDiseno?.(loteDiseno)
  }

  try {
    observador = watch(raiz, { recursive: true }, (_evento, nombre) => {
      // Sin nombre no se sabe qué cambió: se relee todo ('*').
      const proyecto = nombre === null ? '*' : proyectoAfectado(nombre.toString())
      const doc = nombre === null ? null : documentoAfectado(nombre.toString())
      const deSkills = nombre === null || cambianSkills(nombre.toString())
      const deDiseno = nombre === null ? null : disenoAfectado(nombre.toString())
      if (proyecto === null && doc === null && !deSkills && !deDiseno) return
      if (deDiseno) {
        const archivos = diseno.get(deDiseno.proyecto) ?? new Set<string>()
        archivos.add(deDiseno.archivo)
        diseno.set(deDiseno.proyecto, archivos)
      }
      if (proyecto !== null) pendientes.add(proyecto)
      if (doc !== null) docs.add(doc)
      if (deSkills) skills = true
      if (temporizador) clearTimeout(temporizador)
      temporizador = setTimeout(avisar, esperaMs)
    })
    // Si la carpeta desaparece (un disco que se desconecta), la vigilancia termina; la grilla lo muestra al releer.
    observador.on('error', () => {
      observador?.close()
      alCambiar(new Set(['*']))
    })
  } catch {
    // La carpeta no existe o no se puede vigilar: la grilla ya muestra el error.
  }

  return {
    cerrar() {
      if (temporizador) clearTimeout(temporizador)
      observador?.close()
    },
  }
}
