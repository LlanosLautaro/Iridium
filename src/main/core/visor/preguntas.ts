// Copiado de la app anterior de proyectos (D-026).
// Preguntas abiertas `Q-n` (D-033, D-035): nacen en un ítem de la lista de "Preguntas abiertas" de un `estado.md`
// (o en un título dentro de esa sección, como las escribió alguna IA: Defecto 13).
//   - **Q-7 — ¿La miniatura muestra el modelo 3D o la textura plana?**
//     Contexto: D-032 (…), `04-ux.md` › W-14. Opciones: A) 3D (recomendada) · B) plana.
// Las mismas reglas están en el framework (`SKILL.md` › Las preguntas) y las revisa el control (D-092): si
// cambian acá, cambian allá en el mismo cambio.
import type { OpcionPregunta } from '../../../compartido/visor'
import { lineasFueraDeCodigo, partirLineas, titulos } from './lineas'

export interface PreguntaLeida {
  /** `Q-7` */
  codigo: string
  /** Línea del ítem (desde 0). */
  linea: number
  /** Última línea del ítem. */
  hasta: number
  pregunta: string
  /** Markdown del contexto, sin el tramo `Opciones:` cuando se pudo leer como opciones. */
  contexto: string
  opciones: OpcionPregunta[]
}

const SECCION = /^preguntas abiertas\b/i
const ITEM = /^ {0,1}[-*+][ \t]+(.*)$/
const TITULO_MD = /^ {0,3}#{1,6}\s/
const CABEZA = /^(?:\*\*|__)?\s*Q-?0*(\d{1,4})\s*(?:—|–|-|:)\s*(.+?)\s*$/

/** `docs/estado.md` o `docs/modulos/<m>/estado.md`. */
export function esDocumentoDeEstado(ruta: string): boolean {
  return ruta === 'docs/estado.md' || /^docs\/modulos\/[^/]+\/estado\.md$/.test(ruta)
}

/** Lee las preguntas de la sección "Preguntas abiertas" (cualquier nivel de título). */
export function leerPreguntas(texto: string): PreguntaLeida[] {
  const lineas = partirLineas(texto)
  const ts = titulos(lineas)
  const preguntas: PreguntaLeida[] = []
  for (const [i, t] of ts.entries()) {
    if (!SECCION.test(t.texto)) continue
    const fin = ts.slice(i + 1).find((x) => x.nivel <= t.nivel)?.n ?? lineas.length
    const dentro = lineasFueraDeCodigo(lineas).filter((l) => l.n > t.n && l.n < fin)
    for (const [j, l] of dentro.entries()) {
      const titulo = ts.find((x) => x.n === l.n)
      if (titulo) {
        // También como título (`### Q-14 — …`): el contexto es el bloque que sigue, hasta un renglón vacío.
        const cabeza = CABEZA.exec(titulo.texto)
        if (!cabeza?.[1] || !cabeza[2]) continue
        const contexto: string[] = []
        let hasta = l.n
        for (const s of dentro.slice(j + 1)) {
          if (s.n !== hasta + 1 || TITULO_MD.test(s.texto)) break
          if (s.texto.trim() === '') {
            if (contexto.length) break
            hasta = s.n
            continue
          }
          contexto.push(s.texto.trim())
          hasta = s.n
        }
        preguntas.push({
          codigo: `Q-${Number(cabeza[1])}`,
          linea: l.n,
          hasta,
          pregunta: cabeza[2].trim(),
          ...separarOpciones(contexto.join('\n')),
        })
        continue
      }
      const item = ITEM.exec(l.texto)
      const cabeza = item?.[1] ? CABEZA.exec(item[1]) : null
      if (!cabeza?.[1] || !cabeza[2]) continue
      // El contexto son las líneas sangradas que siguen, hasta el próximo ítem o un texto sin sangría.
      const contexto: string[] = []
      let hasta = l.n
      for (const s of dentro.slice(j + 1)) {
        if (s.n !== hasta + 1 && s.texto.trim() !== '') break
        if (s.texto.trim() === '') {
          hasta = s.n
          continue
        }
        if (!/^\s/.test(s.texto)) break
        contexto.push(s.texto.trim())
        hasta = s.n
      }
      while (hasta > l.n && (lineas[hasta] ?? '').trim() === '') hasta--
      preguntas.push({
        codigo: `Q-${Number(cabeza[1])}`,
        linea: l.n,
        hasta,
        pregunta: cabeza[2].replace(/(\*\*|__)\s*$/, '').trim(),
        ...separarOpciones(contexto.join('\n')),
      })
    }
  }
  return preguntas
}

/**
 * Separa el tramo `Opciones: A) … · B) …` del contexto. Una sola opción también vale (una prueba con «A) Funciona»;
 * lo demás va en Otro, Q-70). Si no se entiende, el contexto queda entero.
 */
export function separarOpciones(contexto: string): { contexto: string; opciones: OpcionPregunta[] } {
  const m = /(^|[\s.;,])Opciones:\s*/.exec(contexto)
  if (!m) return { contexto, opciones: [] }
  const opciones = leerOpciones(contexto.slice(m.index + m[0].length))
  if (opciones.length === 0) return { contexto, opciones: [] }
  return { contexto: contexto.slice(0, m.index + (m[1]?.length ?? 0)).trim(), opciones }
}

/**
 * `A) 3D (recomendada) · B) plana.` → dos opciones, la primera recomendada. Si una parte no se entiende, ninguna.
 * También acepta una opción por línea (`Opciones:` y debajo `A) …`, `B) …`) y `(recomendada: motivo)`, que deja el motivo.
 */
export function leerOpciones(tramo: string): OpcionPregunta[] {
  const partes = tramo
    .trim()
    .replace(/\.$/, '')
    .split(/\s+·\s+|\n(?=\s*[A-Z]\)\s)/)
  const opciones: OpcionPregunta[] = []
  for (const parte of partes) {
    const m = /^([A-Z])\)\s*([\s\S]+)$/.exec(parte.trim())
    if (!m?.[1] || !m[2]) return []
    let texto = m[2]
      .trim()
      .replace(/\s*\n\s*/g, ' ')
      .replace(/\.$/, '')
    const marca = /\s*\(recomendad[ao](?:\s*[:,—–-]\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/i.exec(texto)
    const recomendada = marca !== null
    if (marca) {
      const motivo = marca[1]?.trim().replace(/\.$/, '')
      texto = (texto.slice(0, marca.index) + texto.slice(marca.index + marca[0].length))
        .trim()
        .replace(/\.$/, '')
      if (motivo) texto += ` (${motivo})`
    }
    opciones.push({ letra: m[1], texto, recomendada })
  }
  return opciones
}
