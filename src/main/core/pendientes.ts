// Lo que espera del usuario en un proyecto: sus `Q-n` sin responder y cuáles frenan (D-010, D-019).
// La primera línea del contexto puede decir el tipo y si frena: `Tipo: prueba · frena`
// (research/formato-documentacion.md › 3). Sin esa línea, es una consulta que no frena.
import type { PreguntaNueva } from '../../compartido/puente'
import { leerPreguntas } from './visor/preguntas'
import { estadoDe, leerRespuestaDe } from './visor/respuestas'

export const TIPOS_PREGUNTA = ['decisión', 'consulta', 'prueba', 'tarea', 'formulario'] as const
export type TipoPregunta = (typeof TIPOS_PREGUNTA)[number]

function sinAcentos(t: string): string {
  return t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/** Lee la línea `Tipo:` del principio del contexto. Un tipo que no se entiende queda como consulta. */
export function leerTipo(contexto: string): { tipo: TipoPregunta; frena: boolean } {
  const primera = contexto.split('\n', 1)[0] ?? ''
  const m = /^\s*Tipo:\s*(.+)$/i.exec(primera)
  if (!m?.[1]) return { tipo: 'consulta', frena: false }
  const partes = m[1].split(/\s*·\s*/).map((p) => sinAcentos(p.replace(/[.*_]/g, '').trim()))
  const tipo = TIPOS_PREGUNTA.find((t) => sinAcentos(t) === partes[0]) ?? 'consulta'
  // «frena» puede llevar el motivo al lado: `frena (el diseño técnico)`.
  return { tipo, frena: partes.slice(1).some((p) => /^frena(\s|\(|$)/.test(p)) }
}

/**
 * Las preguntas sin responder de los `estado.md` del proyecto (el general y los de sus módulos).
 * `respuestaDe` da el texto de `docs/respuestas/Q-n.md`, o null si no existe. Un código repetido cuenta una vez.
 */
export function preguntasSinResponder(
  estados: readonly string[],
  respuestaDe: (codigo: string) => string | null,
): PreguntaNueva[] {
  const vistas = new Set<string>()
  const salida: PreguntaNueva[] = []
  for (const texto of estados) {
    for (const q of leerPreguntas(texto)) {
      if (vistas.has(q.codigo)) continue
      vistas.add(q.codigo)
      const respuesta = leerRespuestaDe(respuestaDe(q.codigo), q.codigo, q.pregunta)
      if (estadoDe(respuesta) !== 'sin-responder') continue
      salida.push({ codigo: q.codigo, pregunta: q.pregunta, ...leerTipo(q.contexto) })
    }
  }
  return salida
}

/**
 * Cuántas preguntas sin responder hay y cuántas frenan (el número de la tarjeta, H-1), y cuántas están respondidas
 * pero la IA todavía no las procesó (la sección «Respondidas» de Pendientes, W-5).
 */
export function contarPendientes(
  estados: readonly string[],
  respuestaDe: (codigo: string) => string | null,
): { sinResponder: number; frenan: number; respondidas: number } {
  const qs = preguntasSinResponder(estados, respuestaDe)
  const vistas = new Set<string>()
  let respondidas = 0
  for (const texto of estados) {
    for (const q of leerPreguntas(texto)) {
      if (vistas.has(q.codigo)) continue
      vistas.add(q.codigo)
      if (estadoDe(leerRespuestaDe(respuestaDe(q.codigo), q.codigo, q.pregunta)) === 'respondida')
        respondidas++
    }
  }
  return { sinResponder: qs.length, frenan: qs.filter((q) => q.frena).length, respondidas }
}
