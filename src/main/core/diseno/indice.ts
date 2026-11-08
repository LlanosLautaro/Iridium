// El índice de las maquetas (frente Diseño, D-105): la tabla `## Pantallas` de `docs/diseno/README.md`
// (`modulos/diseno/diseno-tecnico.md` › El índice). Iridium solo lee la tabla; lo demás del archivo es libre.

import { sinAcentos } from '../control/tipos'
import { celdas } from '../mapa'
import { lineasFueraDeCodigo, partirLineas, textoPlano } from '../visor/lineas'

export interface PantallaIndice {
  nombre: string
  /** El grupo: el título sobre cada fila de miniaturas. */
  seccion: string
  /** Relativo a `docs/diseno/`: `pantallas/bandeja.html`. */
  archivo: string
  /** `AAAA-MM-DD HH:MM` cuando se pasó al código; null si todavía no (`—`). */
  enLaApp: string | null
  /** La celda «En la app» tal como está, para el control. */
  enLaAppTexto: string
  /** Desde 1. */
  linea: number
}

export interface Indice {
  /** Si el archivo tiene `## Pantallas` con su tabla. */
  tieneTabla: boolean
  /** Las columnas que faltan (Pantalla, Sección, Archivo, En la app). */
  faltan: string[]
  pantallas: PantallaIndice[]
}

export const COLUMNAS_INDICE = ['Pantalla', 'Sección', 'Archivo', 'En la app'] as const
export const FECHA_EN_LA_APP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/

/** «—», «-» o vacío: todavía no está en la app. */
export function esSinPasar(celda: string): boolean {
  return /^[—–-]?$/.test(celda.trim())
}

export function leerIndice(texto: string): Indice {
  const fuera = lineasFueraDeCodigo(partirLineas(texto))
  const titulo = fuera.findIndex((l) => {
    const m = /^ {0,3}##\s+(.*)$/.exec(l.texto)
    return m?.[1] !== undefined && sinAcentos(textoPlano(m[1])) === 'pantallas'
  })
  const vacio: Indice = { tieneTabla: false, faltan: [...COLUMNAS_INDICE], pantallas: [] }
  if (titulo < 0) return vacio
  let i = titulo + 1
  for (; i < fuera.length; i++) {
    const t = fuera[i]?.texto ?? ''
    if (/^ {0,3}#{1,2}\s/.test(t)) return vacio
    if (t.trim().startsWith('|')) break
  }
  const cab = fuera[i]
  const sep = fuera[i + 1]
  if (!cab || !sep || !/^\s*\|?\s*:?-{2,}/.test(sep.texto)) return vacio
  const nombres = celdas(cab.texto).map((c) => sinAcentos(textoPlano(c)))
  const col = (n: string) => nombres.indexOf(sinAcentos(n))
  const faltan = COLUMNAS_INDICE.filter((c) => col(c) < 0)
  const pantallas: PantallaIndice[] = []
  for (let j = i + 2; j < fuera.length; j++) {
    const fila = fuera[j]
    if (!fila?.texto.trim().startsWith('|')) break
    const crudas = celdas(fila.texto)
    const c = crudas.map((x) => textoPlano(x).trim())
    const de = (n: string) => c[col(n)] ?? ''
    // El archivo, tal cual (un `_` no es cursiva); de un enlace, su dirección.
    const archivo = (crudas[col('Archivo')] ?? '').trim()
    const enlace = /^\[[^\]]*\]\(([^)]*)\)$/.exec(archivo)?.[1]
    const enLaAppTexto = de('En la app')
    pantallas.push({
      nombre: de('Pantalla'),
      seccion: de('Sección'),
      archivo: (enlace ?? archivo.replaceAll('`', '')).trim().replace(/^\.?\//, ''),
      enLaApp: FECHA_EN_LA_APP.test(enLaAppTexto) ? enLaAppTexto : null,
      enLaAppTexto,
      linea: fila.n + 1,
    })
  }
  return { tieneTabla: true, faltan, pantallas }
}
