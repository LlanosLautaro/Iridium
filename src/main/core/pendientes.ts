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

export interface TipoLeido {
  tipo: TipoPregunta
  frena: boolean
  /** `en pausa` en la línea `Tipo:` (OR-6, A-15): se muestra aparte y no cuenta en ningún total ni aviso. */
  enPausa: boolean
  /** `Frente: Compartir` en la línea `Tipo:` o en una propia debajo (OR-3); null es del núcleo. */
  frente: string | null
}

/**
 * Lee la línea `Tipo:` del principio del contexto (`Tipo: tarea · frena · Frente: Compartir`) y, si el frente no está
 * ahí, una línea `Frente:` debajo. Un tipo que no se entiende queda como consulta.
 */
export function leerTipo(contexto: string): TipoLeido {
  const [primera = '', segunda = ''] = contexto.split('\n', 2)
  const m = /^\s*Tipo:\s*(.+)$/i.exec(primera)
  const propia = /^\s*Frente:\s*(.+?)\s*$/i.exec(m ? segunda : primera)?.[1] ?? null
  if (!m?.[1]) return { tipo: 'consulta', frena: false, enPausa: false, frente: limpiarFrente(propia) }
  const crudas = m[1].split(/\s*·\s*/)
  const partes = crudas.map((p) => sinAcentos(p.replace(/[.*_]/g, '').trim()))
  const tipo = TIPOS_PREGUNTA.find((t) => sinAcentos(t) === partes[0]) ?? 'consulta'
  const enLinea = crudas.map((p) => /^\s*Frente:\s*(.+?)\s*$/i.exec(p)?.[1]).find((f) => f) ?? null
  return {
    tipo,
    // «frena» puede llevar el motivo al lado: `frena (el diseño técnico)`.
    frena: partes.slice(1).some((p) => /^frena(\s|\(|$)/.test(p)),
    enPausa: partes.slice(1).some((p) => /^en pausa\b/.test(p)),
    frente: limpiarFrente(enLinea ?? propia),
  }
}

function limpiarFrente(f: string | null): string | null {
  const t = f?.replace(/[*_`.]/g, '').trim()
  return t ? t : null
}

/**
 * Las preguntas sin responder de los `estado.md` del proyecto (el general y los de sus módulos), sin las que están en
 * pausa: no cuentan ni avisan.
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
      const tipo = leerTipo(q.contexto)
      if (tipo.enPausa) continue
      salida.push({ codigo: q.codigo, pregunta: q.pregunta, ...tipo })
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
