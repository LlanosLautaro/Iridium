// El avance solo (frente Frentes, D-176, D-178; `modulos/frentes/diseno-tecnico.md`): sus ajustes y las reglas con
// que decide si toma un paso y cuál. Sin disco, motor ni temporizadores.
import type { AjusteAvance, AvanceApagado, TamanoPaso, UsoSuscripcion } from '../../compartido/puente'
import { MENSAJE_SEGUI } from './sesiones'

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

// Las reglas con que decide (D-178 › 3 y 4).

/** Lo que tiene que quedar del período para cada tamaño (D-178 › 3): lo grande, con el período casi entero. */
const HACE_FALTA: Record<TamanoPaso, number> = { chico: 0, mediano: 40, grande: 70 }

/** Un paso que se tomó y sigue sin hacer no se vuelve a tomar en este tiempo: algo lo frenó (D-178 › 4). */
export const NO_REPETIR_MS = 12 * 3_600_000

/**
 * Cuánto del período de 5 horas puede usar (D-178 › 3): lo que queda (cerrado, todo: arrancar lo abre) menos lo que
 * deja libre. null si no se puede: el uso no se conoce, alguna ventana está agotada o la semana llegó a su tope.
 */
export function disponible(uso: UsoSuscripcion | null, ajuste: AjusteAvance, ahora: number): number | null {
  if (!uso) return null
  if (uso.cincoHoras?.agotada || uso.semana?.agotada) return null
  if ((uso.semana?.usado ?? 0) >= ajuste.semana) return null
  const libera = uso.cincoHoras?.libera
  const abierto = typeof libera === 'number' && libera > ahora
  const queda = abierto ? 100 - (uso.cincoHoras?.usado ?? 0) : 100
  return queda - ajuste.libre
}

/** Si un paso de ese tamaño cabe en lo disponible y el ajuste acepta ese tamaño. */
export function cabe(tamano: TamanoPaso, libre: number, ajuste: AjusteAvance): boolean {
  return ajuste.tamanos.includes(tamano) && libre > HACE_FALTA[tamano]
}

const minutos = (hora: string): number => {
  const [h, m] = hora.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Si `ahora` cae en el horario: siempre, o de una hora a otra (puede cruzar la medianoche: de 23:00 a 7:00). */
export function enHorario(ajuste: AjusteAvance, ahora: number): boolean {
  if (!ajuste.horario) return true
  const d = new Date(ahora)
  const ya = d.getHours() * 60 + d.getMinutes()
  const desde = minutos(ajuste.horario.desde)
  const hasta = minutos(ajuste.horario.hasta)
  if (desde === hasta) return true
  return desde < hasta ? ya >= desde && ya < hasta : ya >= desde || ya < hasta
}

/**
 * Las condiciones baratas, sin leer nada (D-178 › 2): prendido, en horario, Iridium sin usar los minutos elegidos,
 * ninguna IA trabajando y, si el uso ya se conoce, que alcance.
 */
export function puedeMirar(c: {
  ajuste: AjusteAvance
  ahora: number
  segundosSinUsar: number
  /** Si no es null, reemplaza los minutos sin usar del ajuste (solo pruebas, `IRIDIUM_AVANCE_SIN_USAR`). */
  sinUsarS?: number | null
  trabajando: number
  uso: UsoSuscripcion | null
}): boolean {
  if (!c.ajuste.prendido || c.ajuste.tamanos.length === 0) return false
  if (!enHorario(c.ajuste, c.ahora)) return false
  if (c.segundosSinUsar < (c.sinUsarS ?? c.ajuste.minutosSinUsar * 60)) return false
  if (c.trabajando > 0) return false
  if (c.uso) {
    const libre = disponible(c.uso, c.ajuste, c.ahora)
    if (libre === null || libre <= 0) return false
  }
  return true
}

/** Un paso marcado `sola` en la ruta de un frente, con lo que hace falta para elegirlo. */
export interface PasoSolo {
  ruta: string
  /** El nombre del proyecto. */
  proyecto: string
  frente: string
  carpeta: string
  texto: string
  tamano: TamanoPaso
  /** Desde 1, en `docs/modulos/<carpeta>/estado.md`. */
  linea: number
  /** Su frente está en curso. */
  enCurso: boolean
  /** La fecha de `**Última actualización:**` del `estado.md` del frente (ms); null si no la tiene. */
  actualizado: number | null
}

/** Un proyecto con respuestas del usuario sin procesar (la misma lectura del Arranque, `candidatosDe`). */
export interface RespuestasSolas {
  ruta: string
  nombre: string
  preguntas: string[]
  /** La respuesta más vieja (ms). */
  desde: number
}

export type Eleccion = { tipo: 'bandeja'; candidato: RespuestasSolas } | { tipo: 'paso'; paso: PasoSolo }

/**
 * La clave con que se recuerda lo que se tomó, para no repetirlo en 12 horas: el paso por su texto (la línea cambia
 * al editar la ruta); las respuestas, por cuáles son (si el usuario responde otra, es trabajo nuevo).
 */
export function clave(
  ruta: string,
  paso: { carpeta: string; texto: string } | null | undefined,
  preguntas: readonly string[],
): string {
  return paso ? `${ruta}|${paso.carpeta}|${paso.texto}` : `${ruta}|bandeja|${[...preguntas].sort().join(',')}`
}

export function claveDe(e: Eleccion): string {
  return e.tipo === 'bandeja'
    ? clave(e.candidato.ruta, null, e.candidato.preguntas)
    : clave(e.paso.ruta, e.paso, [])
}

/**
 * Qué toma (D-176, D-178 › 4), en orden: las respuestas de la Bandeja (como un paso chico), la que espera hace más;
 * después el paso chico del frente que hace más que no se toca; después, del frente en curso, el primer paso que
 * cabe. Lo apagado ya viene sacado; `tomados`, las claves de lo que se tomó hace menos de 12 horas.
 */
export function elegirPaso(
  bandeja: readonly RespuestasSolas[],
  pasos: readonly PasoSolo[],
  libre: number,
  ajuste: AjusteAvance,
  tomados: ReadonlySet<string>,
): Eleccion | null {
  const nuevo = (e: Eleccion) => !tomados.has(claveDe(e))
  if (cabe('chico', libre, ajuste)) {
    const respuestas = [...bandeja]
      .sort((a, b) => a.desde - b.desde || a.nombre.localeCompare(b.nombre, 'es'))
      .map((candidato): Eleccion => ({ tipo: 'bandeja', candidato }))
      .find(nuevo)
    if (respuestas) return respuestas
    const viejo = (p: PasoSolo) => p.actualizado ?? Number.NEGATIVE_INFINITY
    // Estable: a igual fecha, el orden de los proyectos y de la ruta.
    const chico = pasos
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.tamano === 'chico')
      .sort((a, b) => viejo(a.p) - viejo(b.p) || a.i - b.i)
      .map(({ p }): Eleccion => ({ tipo: 'paso', paso: p }))
      .find(nuevo)
    if (chico) return chico
  }
  return (
    pasos
      .filter((p) => p.enCurso && cabe(p.tamano, libre, ajuste))
      .map((paso): Eleccion => ({ tipo: 'paso', paso }))
      .find(nuevo) ?? null
  )
}

/** El primer mensaje de la conversación (FS-4): nombra el paso, su frente y dónde está; las respuestas, como el Arranque. */
export function textoDe(e: Eleccion): string {
  if (e.tipo === 'bandeja') return MENSAJE_SEGUI
  const p = e.paso
  return (
    `Avance solo: seguí con «${p.texto}» del frente ${p.frente} ` +
    `(\`docs/modulos/${p.carpeta}/estado.md\`, línea ${p.linea}, ${p.tamano}).`
  )
}
