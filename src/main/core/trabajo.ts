// `docs/trabajo.md` (frente Orden, D-094; `modulos/orden/diseno-tecnico.md` › trabajo.md): las ideas y los
// pendientes de un proyecto en una sola lista, un ítem por `## T-n — título`. Sin disco.
//   ## T-12 — Bandeja agrupada por frente
//   Estado: pendiente · Frente: Orden · Fecha: 2026-11-05 · Origen: D-091
//   Con filtros arriba, no una pestaña por frente.
import { type Estado, leerEstado } from './estados'
import { partirLineas, titulos } from './visor/lineas'

export interface ItemTrabajo {
  /** `T-12` */
  codigo: string
  titulo: string
  /** Del vocabulario; null si falta o no se entiende (el control lo marca). */
  estado: Estado | null
  /** Tal como está escrito. */
  estadoTexto: string
  /** null es del núcleo. */
  frente: string | null
  fecha: string | null
  origen: string | null
  texto: string
  /** Línea del título (desde 0). */
  linea: number
}

export interface TrabajoLeido {
  items: ItemTrabajo[]
  /** Lo que no se pudo leer: la línea (desde 0) y qué le falta, para el control. */
  problemas: { linea: number; texto: string }[]
}

const CABEZA = /^T-0*(\d{1,4})\s*(?:—|–|-|:)\s*(.+)$/

/** Lee los ítems `## T-n — título` con su línea de datos y su texto. */
export function leerTrabajo(texto: string): TrabajoLeido {
  const lineas = partirLineas(texto)
  const ts = titulos(lineas)
  const items: ItemTrabajo[] = []
  const problemas: TrabajoLeido['problemas'] = []
  for (const [i, t] of ts.entries()) {
    if (t.nivel !== 2) continue
    const m = CABEZA.exec(t.texto)
    if (!m?.[1] || !m[2]) {
      problemas.push({ linea: t.n, texto: 'el título no empieza con `T-n — `' })
      continue
    }
    const fin = ts[i + 1]?.n ?? lineas.length
    const cuerpo = lineas.slice(t.n + 1, fin)
    const iDatos = cuerpo.findIndex((l) => l.trim() !== '')
    const datos = leerDatos(iDatos >= 0 ? (cuerpo[iDatos] ?? '') : '')
    const codigo = `T-${Number(m[1])}`
    if (!datos.has('estado')) problemas.push({ linea: t.n, texto: `${codigo} no tiene la línea «Estado: …»` })
    const estadoTexto = datos.get('estado') ?? ''
    items.push({
      codigo,
      titulo: m[2].trim(),
      estado: leerEstado(estadoTexto),
      estadoTexto,
      frente: datos.get('frente') || null,
      fecha: datos.get('fecha') || null,
      origen: datos.get('origen') || null,
      texto: (datos.size ? cuerpo.slice(iDatos + 1) : cuerpo).join('\n').trim(),
      linea: t.n,
    })
  }
  return { items, problemas }
}

/** `Estado: pendiente · Frente: Orden` → { estado, frente }. Sin `Clave:` al principio, vacío. */
function leerDatos(linea: string): Map<string, string> {
  const r = new Map<string, string>()
  if (!/^\s*[\p{L}]+:/u.test(linea)) return r
  for (const parte of linea.split(/\s*·\s*/)) {
    const m = /^\s*([\p{L}]+):\s*(.*?)\s*$/u.exec(parte.replace(/[*_]/g, ''))
    if (m?.[1]) r.set(m[1].normalize('NFD').replace(/\p{M}/gu, '').toLowerCase(), m[2] ?? '')
  }
  return r
}
