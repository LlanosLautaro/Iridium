// Las novedades del framework (frente Orden, T-64, D-118): los cambios que les piden algo a los proyectos, con fecha, en
// `novedades.md` del framework. Un proyecto tiene las que son más nuevas que su `**Framework:**` y le tocan (`Solo si:`
// un archivo que tiene). Todo puro: leer el disco es de quien llama.
import type { NovedadFramework } from '../../compartido/skills'

/** Dónde está `novedades.md` dentro del framework (la carpeta de la skill `iridium`). */
export const ARCHIVO_NOVEDADES = 'novedades.md'

/** Dónde lo tiene el repo que trae el framework (el de Iridium): ahí lo revisa el control. */
export const RUTA_NOVEDADES_EN_REPO = 'recursos/plugins/iridium/skills/iridium/novedades.md'

export interface NovedadesLeidas {
  novedades: NovedadFramework[]
  /** Lo que no se entiende, con la línea (desde 1): lo devuelve el control. */
  problemas: { linea: number; texto: string }[]
}

const TITULO = /^##\s+(.*)$/
const CON_FECHA = /^(\d{4}-\d{2}-\d{2})\s+—\s+(\S.*)$/
const SOLO_SI = /^Solo si:\s*(.*)$/i

/** Una ruta de `Solo si:` que se puede buscar en un proyecto: relativa, sin `..`, con `/`. */
export function rutaSoloSiValida(r: string): boolean {
  return r.length > 0 && !/^[a-z]:|^[\\/]/i.test(r) && !r.split(/[\\/]/).includes('..')
}

/** Lee `novedades.md`: un `## AAAA-MM-DD — Qué cambió` por novedad, `Solo si: <ruta>` opcional y lo que pide. */
export function leerNovedades(texto: string): NovedadesLeidas {
  const lineas = texto.replace(/^﻿/, '').split(/\r?\n/)
  const novedades: NovedadFramework[] = []
  const problemas: NovedadesLeidas['problemas'] = []
  let actual: { n: NovedadFramework; linea: number; cuerpo: string[] } | null = null
  const cerrar = () => {
    if (!actual) return
    actual.n.texto = actual.cuerpo
      .join('\n')
      .trim()
      .replace(/\n{3,}/g, '\n\n')
    if (!actual.n.texto)
      problemas.push({ linea: actual.linea, texto: `«${actual.n.titulo}» no dice qué le pide al proyecto` })
    novedades.push(actual.n)
    actual = null
  }
  lineas.forEach((l, i) => {
    const t = TITULO.exec(l)
    if (t) {
      cerrar()
      const m = CON_FECHA.exec((t[1] ?? '').trim())
      if (!m?.[1] || !m[2]) {
        problemas.push({ linea: i + 1, texto: 'cada novedad empieza con `## AAAA-MM-DD — Qué cambió`' })
        return
      }
      const ultima = novedades.at(-1)
      if (ultima && m[1] < ultima.fecha)
        problemas.push({
          linea: i + 1,
          texto: `va del más viejo al más nuevo: ${m[1]} está después de ${ultima.fecha}`,
        })
      actual = { n: { fecha: m[1], titulo: m[2].trim(), texto: '', soloSi: null }, linea: i + 1, cuerpo: [] }
      return
    }
    if (!actual) return
    const s = SOLO_SI.exec(l.trim())
    if (s && actual.cuerpo.every((c) => c.trim() === '')) {
      const ruta = (s[1] ?? '').trim().replace(/^`|`$/g, '').replaceAll('\\', '/')
      if (rutaSoloSiValida(ruta)) actual.n.soloSi = ruta
      else
        problemas.push({
          linea: i + 1,
          texto: '`Solo si:` lleva un archivo o carpeta del proyecto, relativo: `docs/diseno/piezas.css`',
        })
      return
    }
    actual.cuerpo.push(l)
  })
  cerrar()
  return { novedades, problemas }
}

/**
 * Las novedades de un proyecto: las de después de su fecha `**Framework:**` (sin fecha, todas) que le tocan. `existe`
 * dice si el proyecto tiene una ruta (relativa, con `/`).
 */
export function novedadesDelProyecto(
  novedades: readonly NovedadFramework[],
  fecha: string | null,
  existe: (ruta: string) => boolean,
): NovedadFramework[] {
  return novedades.filter(
    (n) => (fecha === null || n.fecha > fecha) && (n.soloSi === null || existe(n.soloSi)),
  )
}
