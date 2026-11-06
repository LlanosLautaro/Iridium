// El vocabulario único de estados (frente Orden, OR-5, A-21; `modulos/orden/definicion.md` › Un vocabulario de
// estados): las mismas palabras para hitos, pasos de un frente, iteraciones, frentes y trabajo. El Mapa, la tarjeta y
// el control leen con esto. Sin disco.

export const ESTADOS = ['pendiente', 'en curso', 'en pausa', 'hecho', 'descartado', 'nueva'] as const
export type Estado = (typeof ESTADOS)[number]

function normal(t: string): string {
  return t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[*_`]/g, '').trim()
}

/** Las palabras de cada estado, con las dos formas de género (hecho/hecha, descartado/descartada). */
const PALABRAS: readonly [RegExp, Estado][] = [
  [/^pendiente\b/, 'pendiente'],
  [/^en curso\b/, 'en curso'],
  [/^en pausa\b/, 'en pausa'],
  [/^hech[oa]s?\b/, 'hecho'],
  [/^descartad[oa]s?\b/, 'descartado'],
  [/^nuev[ao]s?\b/, 'nueva'],
]

/**
 * Las palabras de antes del framework (la guía de hitos) y su traducción, para los proyectos con framework viejo:
 * así su Mapa no se rompe hasta que pasen al framework. En uno con framework son un aviso del control.
 */
const TRANSICION: readonly [RegExp, Estado][] = [
  [/^(complet[oa]|validad[oa]|aprobad[oa]|cerrad[oa]|terminad[oa])\b/, 'hecho'],
  [/^saltad[oa]\b/, 'descartado'],
  [/^reabiert[oa]\b/, 'en curso'],
  [/^(bloquead[oa]|por empezar)\b/, 'pendiente'],
]

/**
 * Un estado del vocabulario, o null. Acepta mayúsculas, acentos, las marcas de Markdown y las dos formas de género;
 * una celda con más texto («en curso: la arquitectura aprobada…») se lee por su principio.
 */
export function leerEstado(texto: string): Estado | null {
  const t = normal(texto)
  return PALABRAS.find(([re]) => re.test(t))?.[1] ?? null
}

/** Como `leerEstado`, pero con las palabras de antes traducidas (framework viejo). */
export function leerEstadoViejo(texto: string): Estado | null {
  const t = normal(texto)
  return leerEstado(texto) ?? TRANSICION.find(([re]) => re.test(t))?.[1] ?? null
}
