// Copiado de la app anterior de proyectos (D-026).
import { describe, expect, it } from 'vitest'
import { fechaExacta, fechaRelativa } from '../../src/compartido/fechas'

const MIN = 60_000
const H = 60 * MIN
const D = 24 * H

describe('fechaRelativa', () => {
  it.each([
    [10_000, 'recién'],
    [5 * MIN, 'hace 5 min'],
    [2 * H, 'hace 2 h'],
    [D + H, 'ayer'],
    [3 * D, 'hace 3 días'],
    [20 * D, 'hace 2 semanas'],
    [120 * D, 'hace 4 meses'],
    [400 * D, 'hace 1 año'],
    [800 * D, 'hace 2 años'],
  ])('%i ms atrás → %s', (atras, texto) => {
    const ahora = Date.UTC(2026, 9, 3)
    expect(fechaRelativa(ahora - atras, ahora)).toBe(texto)
  })
})

describe('fechaExacta', () => {
  it('día, mes corto, año y hora local', () => {
    expect(fechaExacta(new Date(2026, 9, 2, 22, 17).getTime())).toBe('2 oct 2026, 22:17')
  })
})
