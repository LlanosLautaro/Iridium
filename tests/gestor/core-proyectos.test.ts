// Copiado de la app anterior de proyectos (D-026).
import { describe, expect, it } from 'vitest'
import { esCarpetaDeProyecto, esMismaRuta, inicialDe } from '../../src/main/core/proyectos'

describe('esCarpetaDeProyecto', () => {
  it('ignora las carpetas que empiezan con punto', () => {
    expect(esCarpetaDeProyecto('.git')).toBe(false)
    expect(esCarpetaDeProyecto('.vscode')).toBe(false)
    expect(esCarpetaDeProyecto('Gamma')).toBe(true)
  })
})

describe('esMismaRuta', () => {
  it('compara sin distinguir mayúsculas, barras ni barra final (Windows)', () => {
    expect(esMismaRuta('D:\\PROYECTOS\\Theta', 'd:/proyectos/theta/')).toBe(true)
    expect(esMismaRuta('D:\\PROYECTOS\\Theta', 'D:\\PROYECTOS\\ThetaMotor')).toBe(false)
  })
  it('sin carpeta abierta nunca coincide', () => {
    expect(esMismaRuta('D:\\PROYECTOS\\Theta', undefined)).toBe(false)
  })
})

describe('inicialDe', () => {
  it('toma la primera letra o número en mayúscula', () => {
    expect(inicialDe('omega')).toBe('O')
    expect(inicialDe('  ñandú')).toBe('Ñ')
    expect(inicialDe('_scripts')).toBe('S')
    expect(inicialDe('___')).toBe('?')
  })
})
