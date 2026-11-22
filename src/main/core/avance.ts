// El avance solo (frente Frentes, D-176, D-178; `modulos/frentes/diseno-tecnico.md`): sus ajustes y las reglas con
// que decide si toma un paso y cuál. Sin disco, motor ni temporizadores.
import type { AjusteAvance, AvanceApagado, TamanoPaso } from '../../compartido/puente'

export const TAMANOS: readonly TamanoPaso[] = ['chico', 'mediano', 'grande']

/** Los límites de los números de Ajustes › IA › Avance solo (FS-2). */
export const LIMITES_AVANCE = {
  minutosSinUsar: { minimo: 1, maximo: 240 },
  libre: { minimo: 0, maximo: 90 },
  semana: { minimo: 10, maximo: 100 },
} as const

/** Apagado al principio; prendido, de entrada drena todo (D-176). */
export const AJUSTE_AVANCE_INICIAL: AjusteAvance = {
  prendido: false,
  horario: null,
  minutosSinUsar: 10,
  libre: 0,
  semana: 100,
  tamanos: [...TAMANOS],
}

export const NINGUNO_APAGADO: AvanceApagado = { proyectos: [], frentes: [] }

/** Si el frente `carpeta` del proyecto `ruta` está apagado, o lo está su proyecto (FS-3). */
export function apagado(a: AvanceApagado, ruta: string, carpeta?: string): boolean {
  if (a.proyectos.includes(ruta)) return true
  return carpeta !== undefined && a.frentes.some((f) => f.ruta === ruta && f.carpeta === carpeta)
}

/** Prende o apaga un frente: lo que guarda `config.json` (solo los apagados). */
export function conFrente(a: AvanceApagado, ruta: string, carpeta: string, prendido: boolean): AvanceApagado {
  const otros = a.frentes.filter((f) => !(f.ruta === ruta && f.carpeta === carpeta))
  return { ...a, frentes: prendido ? otros : [...otros, { ruta, carpeta }] }
}

/** Prende o apaga un proyecto entero. */
export function conProyecto(a: AvanceApagado, ruta: string, prendido: boolean): AvanceApagado {
  const otros = a.proyectos.filter((r) => r !== ruta)
  return { ...a, proyectos: prendido ? otros : [...otros, ruta] }
}
