// Copiado de la app anterior de proyectos (D-026).
// Lectura tolerante de `docs/estado.md` de la guía de hitos (research/formato-estado-md.md).
// El archivo lo escribe la IA y puede variar: se buscan los encabezados por texto y nunca se falla.
import type { Guia } from '../../compartido/tipos'
import { frenteActivo } from './mapa'

const GUIONES = /\s+[—–-]\s+/

function sinAcentos(t: string): string {
  return t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/** Líneas de la sección `## <titulo>` hasta el próximo encabezado `#`. */
function seccion(lineas: string[], titulo: string): string[] {
  const buscado = sinAcentos(titulo)
  const inicio = lineas.findIndex(
    (l) => /^##\s/.test(l) && sinAcentos(l.replace(/^##\s+/, '')).trim() === buscado,
  )
  if (inicio === -1) return []
  const resto = lineas.slice(inicio + 1)
  const fin = resto.findIndex((l) => /^#{1,6}\s/.test(l))
  return fin === -1 ? resto : resto.slice(0, fin)
}

/** Valor de una línea `**Etiqueta:** valor`. */
export function campo(lineas: string[], etiqueta: string): string | null {
  const buscada = sinAcentos(etiqueta)
  for (const l of lineas) {
    const m = l.match(/^\s*\*\*([^*]+?):?\*\*:?\s*(.+)$/)
    if (m?.[1] && m[2] && sinAcentos(m[1]).replace(/:$/, '').trim() === buscada) return m[2].trim()
  }
  return null
}

/** Quita marcas simples de Markdown para mostrar el texto plano. */
function textoPlano(t: string): string {
  return t
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .trim()
}

/** Devuelve null si el texto no tiene nada reconocible de la guía. */
export function leerGuia(texto: string): Guia | null {
  const lineas = texto.replace(/^﻿/, '').split(/\r?\n/)

  let hito: number | null = null
  let nombreHito: string | null = null
  let estadoHito: string | null = null
  const lineaHito = seccion(lineas, 'Hito actual').find((l) => l.trim() !== '')
  if (lineaHito) {
    const partes = textoPlano(lineaHito).split(GUIONES)
    const numero = partes[0]?.match(/^\d+(?:[.,]\d+)?/)?.[0]
    if (numero) {
      hito = Number(numero.replace(',', '.'))
      nombreHito = partes[1]?.trim() || null
      estadoHito = partes.slice(2).join(' — ').trim() || null
    } else {
      nombreHito = partes.join(' — ').trim() || null
    }
  }

  const primerPaso = seccion(lineas, 'Próximo paso').find((l) => l.trim() !== '')
  const proximoPaso = primerPaso ? textoPlano(primerPaso.replace(/^\s*[-*]\s+(\[[ x]\]\s+)?/, '')) : null

  const actualizado = campo(lineas, 'Última actualización')?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null

  if (hito === null && nombreHito === null && proximoPaso === null && actualizado === null) return null
  const frente = frenteActivo(texto)
  return {
    hito,
    nombreHito,
    estadoHito,
    proximoPaso: proximoPaso || null,
    actualizado,
    ...(frente ? { frente } : {}),
  }
}
