// Responder una `Q-n` desde Pendientes (H-10, H-11, 05-arquitectura.md › Responder una pregunta). Reglas puras:
// qué partes tiene el formulario de una pregunta, cómo queda el archivo `docs/respuestas/Q-n.md` y cómo se lee de
// vuelta para corregirla. El formato es el de la guía, con las casillas de D-019:
//   # Q-12 — ¿I-4 funciona como esperabas?
//
//   **Opción:** B) Encontré algo          ← con «Otro»: `**Opción:** Otro: <lo que escribió>`
//
//   - [x] Abre la app sin errores
//   - [ ] Clasifica en Pendientes — no aparece la tarjeta
//
//   La nota general.
import { type Borrador, borradorVacio, LINEA_POSTERGADA } from '../../compartido/respuestas'
import type { OpcionPregunta } from '../../compartido/visor'
import { leerRespuesta, OTRO } from './visor/respuestas'

const PUNTO = /^[-*+]\s+\[([ xX])\]\s+(.+)$/
/** En el contexto, un punto de la prueba es `- [ ] …` (D-019) o un paso numerado `1. …` (Q-70). */
const PASO = /^(?:[-*+]\s+\[[ xX]\]|\d{1,2}[.)])\s+(.+)$/

/**
 * Separa el contexto de una pregunta (ya sin el tramo `Opciones:`): quita la línea `Tipo:` y el rótulo
 * `Contexto:`, y saca los puntos `- [ ]` (o los pasos `1.`) de las pruebas y las tareas (D-019), que pasan a ser casillas.
 */
export function partesDelContexto(contexto: string): { texto: string; puntos: string[] } {
  const lineas = contexto.split('\n')
  if (/^\s*Tipo:/i.test(lineas[0] ?? '')) lineas.shift()
  const puntos: string[] = []
  const texto: string[] = []
  for (const l of lineas) {
    const p = PASO.exec(l.trim())
    if (p?.[1]) puntos.push(p[1].trim())
    else texto.push(l.replace(/^\s*Contexto:\s*/i, ''))
  }
  return { texto: texto.join('\n').trim(), puntos }
}

/** Una línea: lo que va en la línea de la opción o de un punto no puede partirla. */
function enUnaLinea(t: string): string {
  return t.replace(/\s*\r?\n\s*/g, ' ').trim()
}

export interface PreguntaParaResponder {
  codigo: string
  pregunta: string
  opciones: readonly OpcionPregunta[]
  puntos: readonly string[]
}

/** El archivo de la respuesta. `postergar`: la prueba queda para después (D-063), con lo marcado hasta ahora. */
export function armarRespuestaDe(q: PreguntaParaResponder, b: Borrador, postergar = false): string {
  const partes = [`# ${q.codigo} — ${q.pregunta}`.trimEnd()]
  const elegida = q.opciones.find((o) => o.letra === b.opcion)
  if (postergar) partes.push(LINEA_POSTERGADA)
  else if (elegida) partes.push(`**Opción:** ${elegida.letra}) ${elegida.texto}`)
  else if (q.opciones.length > 0 && b.opcion === OTRO) {
    const otro = enUnaLinea(b.otro)
    partes.push(otro === '' ? `**Opción:** ${OTRO}` : `**Opción:** ${OTRO}: ${otro}`)
  }
  if (q.puntos.length > 0)
    partes.push(
      q.puntos
        .map((p, i) => {
          const nota = enUnaLinea(b.notas[i] ?? '')
          return `- [${b.marcas[i] ? 'x' : ' '}] ${p}${nota === '' ? '' : ` — ${nota}`}`
        })
        .join('\n'),
    )
  const nota = b.nota.replace(/\r\n/g, '\n').trim()
  if (nota !== '') partes.push(nota)
  return `${partes.join('\n\n')}\n`
}

/** Lee una respuesta guardada como borrador del formulario (para Corregir). Tolera las escritas a mano. */
export function borradorDeRespuesta(texto: string, q: PreguntaParaResponder): Borrador {
  const leida = leerRespuesta(texto, q.codigo)
  const b = borradorVacio(q.puntos.length)
  const conLetra = q.opciones.some((o) => o.letra === leida.opcion)
  if (conLetra || (leida.opcion === OTRO && q.opciones.length > 0)) b.opcion = leida.opcion
  if (b.opcion === OTRO) b.otro = /^\s*\*\*Opción:\*\*\s*Otro\s*[:—–-]\s*(.+?)\s*$/im.exec(texto)?.[1] ?? ''

  const resto: string[] = []
  let siguiente = 0
  for (const linea of leida.texto.split('\n')) {
    const m = q.puntos.length > 0 ? PUNTO.exec(linea.trim()) : null
    if (!m?.[2]) {
      resto.push(linea)
      continue
    }
    const contenido = m[2].trim()
    // Se busca el punto por su texto; si la IA lo cambió, por su orden.
    let i = q.puntos.findIndex((p) => contenido === p || contenido.startsWith(`${p} — `))
    let nota = i >= 0 ? contenido.slice((q.puntos[i] ?? '').length).replace(/^\s*—\s*/, '') : ''
    if (i < 0 && siguiente < q.puntos.length) {
      i = siguiente
      nota = /\s—\s(.*)$/.exec(contenido)?.[1] ?? ''
    }
    if (i < 0) {
      resto.push(linea)
      continue
    }
    b.marcas[i] = m[1] !== ' '
    b.notas[i] = nota.trim()
    siguiente = i + 1
  }
  b.nota = resto.join('\n').trim()
  return b
}
