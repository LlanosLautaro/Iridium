// Los textos de la sección Ideas: las fechas y cómo se nombra la sección de una idea.
import { fechaLarga } from '../skills/textos'

const MESES_CORTOS = [
  'ene.',
  'feb.',
  'mar.',
  'abr.',
  'may.',
  'jun.',
  'jul.',
  'ago.',
  'sept.',
  'oct.',
  'nov.',
  'dic.',
]

/** `2026-10-30` → `30 oct.` (la lista). */
export function fechaCorta(fecha: string): string {
  const [, mes, dia] = fecha.split('-').map(Number)
  const nombre = MESES_CORTOS[(mes ?? 1) - 1]
  return nombre && dia ? `${dia} ${nombre}` : fecha
}

/** `2026-10-30` → `30 de octubre de 2026` (el detalle). */
export function fechaDeIdea(fecha: string): string {
  const largo = fechaLarga(fecha)
  return largo === fecha ? fecha : `${largo} de ${fecha.slice(0, 4)}`
}

/** La sección de una idea en singular, para el detalle: «Suelta», «Para un proyecto existente», «Integrada». */
export function tipoDeIdea(seccion: string): string {
  const s = seccion.trim().toLowerCase()
  if (s === 'sueltas') return 'Suelta'
  if (s === 'para proyectos existentes') return 'Para un proyecto existente'
  if (s === 'integradas') return 'Integrada'
  return seccion
}
