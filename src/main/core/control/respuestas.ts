// Cada respuesta de una pregunta que ya salió de «Preguntas abiertas» deja su rastro (A-17):
// `> Procesada el AAAA-MM-DD → D-n`.
import { leerPreguntas } from '../visor/preguntas'
import type { Regla } from './tipos'

export const reglaRespuestas: Regla = (a) => {
  const abiertas = new Set(a.estados.flatMap((e) => leerPreguntas(e.texto).map((q) => q.codigo)))
  const avisos = []
  for (const [codigo, texto] of a.respuestas) {
    if (abiertas.has(codigo) || /^\s*>\s*Procesada\b/im.test(texto)) continue
    avisos.push({
      regla: 'respuestas',
      archivo: `docs/respuestas/${codigo}.md`,
      linea: null,
      texto: `${codigo} ya no está en «Preguntas abiertas» y su respuesta no tiene la línea «> Procesada el AAAA-MM-DD → …»`,
    })
  }
  return avisos
}
