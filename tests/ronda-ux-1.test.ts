// La tanda de la ronda de UX 1 (T-100): lo que se prueba sin la app abierta.
import { describe, expect, it } from 'vitest'
import { primeraFrase } from '../src/compartido/versiones'

describe('Acerca de: la primera frase del commit (T-104)', () => {
  it('corta en el primer punto seguido', () => {
    expect(
      primeraFrase(
        'Paridad, paso 6: la Ficha (PZ-16) entra al design system (D-170). La Ficha en las dos hojas.',
      ),
    ).toBe('Paridad, paso 6: la Ficha (PZ-16) entra al design system (D-170).')
  })
  it('sin punto, el mensaje entero', () => {
    expect(primeraFrase('Arreglar el aviso de cerrar')).toBe('Arreglar el aviso de cerrar')
  })
  it('un número con punto no corta', () => {
    expect(primeraFrase('Subir a la 1.5 del SDK. Después, probar.')).toBe('Subir a la 1.5 del SDK.')
  })
  it('una frase muy larga se corta en una palabra, con puntos suspensivos', () => {
    const f = primeraFrase(`${'palabra '.repeat(40)}fin.`, 60)
    expect(f.length).toBeLessThanOrEqual(60)
    expect(f.endsWith('palabra…')).toBe(true)
  })
})
