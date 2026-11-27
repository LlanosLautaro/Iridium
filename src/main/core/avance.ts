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

/**
 * Lo que tiene que quedar del período para cada tamaño (D-178 › 3): lo grande, con el período casi entero. Lo chico
 * gastó de 3 a 13 % (D-194): con menos de 10 libre, se queda sin uso a mitad de camino.
 */
const HACE_FALTA: Record<TamanoPaso, number> = { chico: 10, mediano: 40, grande: 70 }

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
  /** Desde 1, en `docs/modulos/<carpeta>/estado.md` (en `docs/trabajo.md`, los del Núcleo). */
  linea: number
  /** Su frente está en curso: va antes que los demás para lo mediano y lo grande. */
  enCurso: boolean
  /** Un `T-n` del Núcleo (D-193): sin frente, con su `Tamaño:` en `docs/trabajo.md`; la carpeta va vacía. */
  codigo?: string
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

/**
 * Lo que un proyecto tiene para revisar (D-193): sus ideas `nueva` sin evaluar, los pasos sin tamaño de los frentes que
 * no están en pausa ni hechos (cuántos por frente) y los `T-n` del Núcleo pendientes sin tamaño.
 */
export interface RevisionSola {
  ruta: string
  nombre: string
  ideas: string[]
  pasos: { frente: string; cuantos: number }[]
  nucleo: string[]
  /** Los frentes que no están en pausa ni hechos y no tienen nada por hacer en su ruta. */
  sinPasos: string[]
  /** El trabajo aprobado de un frente que su ruta no nombra: la IA lo ubica en la ruta, con su tamaño. */
  sinLugar: { frente: string; codigos: string[] }[]
}

export type Eleccion =
  | { tipo: 'bandeja'; candidato: RespuestasSolas }
  | { tipo: 'revision'; revision: RevisionSola }
  | { tipo: 'paso'; paso: PasoSolo }

/** El texto con que se anota la revisión en `arranques.json` y se ve en el aviso al volver. */
export const TEXTO_REVISION = 'Revisar las ideas y los frentes'

/** Una revisión por proyecto y por día, como mucho (D-193). */
export const REVISAR_CADA_MS = 24 * 3_600_000

/** Si hay algo para revisar: los frentes sin pasos solos no la piden (si la IA no pudo sumarles, se repetiría cada día). */
export const hayQueRevisar = (r: RevisionSola): boolean =>
  r.ideas.length > 0 || r.pasos.length > 0 || r.nucleo.length > 0 || r.sinLugar.length > 0

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

/** La clave de la revisión de un proyecto: la de un paso sin carpeta con `TEXTO_REVISION`. */
export const claveRevision = (ruta: string): string => clave(ruta, { carpeta: '', texto: TEXTO_REVISION }, [])

export function claveDe(e: Eleccion): string {
  return e.tipo === 'bandeja'
    ? clave(e.candidato.ruta, null, e.candidato.preguntas)
    : e.tipo === 'revision'
      ? claveRevision(e.revision.ruta)
      : clave(e.paso.ruta, e.paso, [])
}

/**
 * Qué toma (D-176, D-178 › 4, D-193), en orden: las respuestas de la Bandeja (como un paso chico), la que espera hace
 * más; después la revisión de un proyecto con algo para revisar (también chica); después el paso chico del frente que
 * hace más que no se toca; después el primer paso que cabe, del frente en curso primero y de los demás (y del Núcleo)
 * después. Lo apagado y lo en pausa ya vienen sacados; `tomados`, las claves de lo que se tomó hace menos de 12 horas
 * (las revisiones, de un día).
 */
export function elegirPaso(
  bandeja: readonly RespuestasSolas[],
  pasos: readonly PasoSolo[],
  libre: number,
  ajuste: AjusteAvance,
  tomados: ReadonlySet<string>,
  revisiones: readonly RevisionSola[] = [],
): Eleccion | null {
  const nuevo = (e: Eleccion) => !tomados.has(claveDe(e))
  if (cabe('chico', libre, ajuste)) {
    const respuestas = [...bandeja]
      .sort((a, b) => a.desde - b.desde || a.nombre.localeCompare(b.nombre, 'es'))
      .map((candidato): Eleccion => ({ tipo: 'bandeja', candidato }))
      .find(nuevo)
    if (respuestas) return respuestas
    const revision = revisiones
      .filter(hayQueRevisar)
      .map((revision): Eleccion => ({ tipo: 'revision', revision }))
      .find(nuevo)
    if (revision) return revision
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
    [...pasos.filter((p) => p.enCurso), ...pasos.filter((p) => !p.enCurso)]
      .filter((p) => cabe(p.tamano, libre, ajuste))
      .map((paso): Eleccion => ({ tipo: 'paso', paso }))
      .find(nuevo) ?? null
  )
}

/** El primer mensaje de la conversación (FS-4): nombra el paso, su frente y dónde está; las respuestas, como el Arranque. */
export function textoDe(e: Eleccion): string {
  if (e.tipo === 'bandeja') return MENSAJE_SEGUI
  if (e.tipo === 'revision') {
    const r = e.revision
    const partes = [
      r.ideas.length ? `ideas nuevas sin evaluar: ${r.ideas.join(', ')}` : null,
      r.pasos.length
        ? `pasos sin tamaño en ${r.pasos.map((p) => `${p.frente} (${p.cuantos})`).join(', ')}`
        : null,
      r.nucleo.length ? `trabajos del Núcleo sin tamaño: ${r.nucleo.join(', ')}` : null,
      r.sinPasos.length ? `frentes sin nada por hacer en su ruta: ${r.sinPasos.join(', ')}` : null,
      r.sinLugar.length
        ? `trabajo aprobado sin lugar en la ruta de su frente: ${r.sinLugar.map((f) => `${f.frente} (${f.codigos.join(', ')})`).join(', ')}`
        : null,
    ].filter(Boolean)
    return `Avance solo: revisión. Revisá, sin hacer el trabajo, ${partes.join('; ')}.`
  }
  const p = e.paso
  if (p.codigo)
    return `Avance solo: seguí con ${p.codigo} «${p.texto}» del Núcleo (\`docs/trabajo.md\`, ${p.tamano}).`
  return (
    `Avance solo: seguí con «${p.texto}» del frente ${p.frente} ` +
    `(\`docs/modulos/${p.carpeta}/estado.md\`, línea ${p.linea}, ${p.tamano}).`
  )
}
