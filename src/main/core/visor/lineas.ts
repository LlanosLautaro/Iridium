// Copiado de la app anterior de proyectos (D-026).
// Recorrido de un Markdown por líneas, sin entrar en bloques de código (``` o ~~~).
// Lo usan el índice de códigos, las preguntas y las secciones: así todos ven los mismos títulos que markdown-it.

export interface Linea {
  /** Número de línea, desde 0 (el mismo que `token.map[0]` de markdown-it). */
  n: number
  texto: string
}

const APERTURA = /^ {0,3}(`{3,}|~{3,})/

/** Parte el texto en líneas (acepta `\r\n`). */
export function partirLineas(texto: string): string[] {
  return texto.replace(/^﻿/, '').split(/\r?\n/)
}

/** Líneas que no están dentro de un bloque de código cercado. Las líneas de las cercas tampoco se devuelven. */
export function lineasFueraDeCodigo(lineas: readonly string[]): Linea[] {
  const fuera: Linea[] = []
  let cerca: string | null = null
  lineas.forEach((texto, n) => {
    const m = APERTURA.exec(texto)
    if (cerca !== null) {
      if (m?.[1] && m[1][0] === cerca[0] && m[1].length >= cerca.length && texto.trim() === m[1]) cerca = null
      return
    }
    if (m?.[1]) {
      cerca = m[1]
      return
    }
    fuera.push({ n, texto })
  })
  return fuera
}

export interface Titulo {
  n: number
  nivel: number
  /** Texto del título sin marcas de Markdown. */
  texto: string
}

const TITULO = /^ {0,3}(#{1,6})[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/

/** Títulos ATX (`## Título`) fuera de los bloques de código. */
export function titulos(lineas: readonly string[]): Titulo[] {
  const r: Titulo[] = []
  for (const { n, texto } of lineasFueraDeCodigo(lineas)) {
    const m = TITULO.exec(texto)
    if (m?.[1] && m[2] !== undefined) r.push({ n, nivel: m[1].length, texto: textoPlano(m[2]) })
  }
  return r
}

/** Quita las marcas de Markdown en línea: negritas, cursivas, código y enlaces (queda su texto). */
export function textoPlano(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(^|[^\w*])[*_]([^*_]+)[*_](?=$|[^\w*])/g, '$1$2')
    .replace(/\\([\\`*_{}[\]()#+\-.!|>~])/g, '$1')
    .trim()
}

/** Ancla al estilo de GitHub: minúsculas, sin signos, espacios como guiones. */
export function slug(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')
}
