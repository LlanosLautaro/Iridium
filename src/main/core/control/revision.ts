// Los comentarios de la Revisión anotados (D-088): cada uno apunta a su `T-n` y, cuando ese `T-n` está hecho, se
// cierra. Sin esto un comentario resuelto queda en «Anotados» para siempre (R-12 con T-46 hecho).
import { leerComentario } from '../revision/comentario'
import { leerTrabajo } from '../trabajo'
import type { Aviso, Regla } from './tipos'

const RUTA = /^docs\/revision\/(R-\d+\.md)$/i

export const reglaRevision: Regla = (a) => {
  const items = a.trabajo === null ? [] : leerTrabajo(a.trabajo).items
  const porCodigo = new Map(items.map((i) => [i.codigo, i]))
  const avisos: Aviso[] = []
  for (const d of a.documentos) {
    const nombre = RUTA.exec(d.ruta)?.[1]
    const c = nombre ? leerComentario(nombre, d.texto) : null
    if (c?.estado !== 'anotado') continue
    // Su T-n: el que cita la última línea «anotado por la IA: …», o un T-n cuyo Origen es este R-n.
    const anotado = c.historia.findLast((h) => /^anotado por la IA\b/i.test(h.texto))
    const citados = new Set(
      [...(anotado?.texto.matchAll(/\bT-0*(\d+)\b/g) ?? [])].map((m) => `T-${Number(m[1])}`),
    )
    const deOrigen = items.filter((i) => new RegExp(`\\b${c.codigo}\\b`).test(i.origen ?? ''))
    const suyos = [...[...citados].flatMap((t) => porCodigo.get(t) ?? []), ...deOrigen]
    const av = (texto: string) =>
      avisos.push({ regla: 'revision', archivo: d.ruta, linea: null, texto: `${c.codigo}: ${texto}` })
    if (suyos.length === 0) {
      av('está anotado sin su `T-n`: «- AAAA-MM-DD HH:MM — anotado por la IA: T-n (por qué después)»')
      continue
    }
    const hecho = suyos.find((i) => i.estado === 'hecho')
    if (hecho)
      av(
        `${hecho.codigo} ya está hecho: cerralo (Estado \`cerrado\` y «- AAAA-MM-DD HH:MM — cerrado por la IA: qué se hizo»)`,
      )
  }
  return avisos
}
