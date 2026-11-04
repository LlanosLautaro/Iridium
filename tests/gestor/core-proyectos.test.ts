// Copiado de la app anterior de proyectos (D-026).
import { describe, expect, it } from 'vitest'
import { leerMetadatos } from '../../src/main/core/metadatos'
import {
  armarVista,
  type CarpetaProyecto,
  esCarpetaDeProyecto,
  esMismaRuta,
  inicialDe,
} from '../../src/main/core/proyectos'

const RAIZ = 'D:/PROYECTOS'
const carpeta = (nombre: string, json?: object | string): CarpetaProyecto => ({
  nombre,
  ruta: `D:\\PROYECTOS\\${nombre}`,
  metadatos:
    json === undefined ? null : leerMetadatos(typeof json === 'string' ? json : JSON.stringify(json)),
  guia: null,
  ultimaActividad: null,
})
const con = (estado: string, extra: object = {}) => ({ version: 1, estado, ...extra })

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

describe('armarVista', () => {
  it('sin metadatos, todo va a Sin clasificar ordenado por nombre, y marca la activa', () => {
    const vista = armarVista(
      RAIZ,
      [carpeta('recuperador de tabs'), carpeta('Gamma'), carpeta('.git'), carpeta('Iota')],
      'd:/proyectos/iota',
    )
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    expect(vista.total).toBe(3)
    const sin = vista.secciones.find((s) => s.id === 'sin-clasificar')
    expect(sin?.proyectos.map((p) => p.nombre)).toEqual(['Gamma', 'Iota', 'recuperador de tabs'])
    expect(sin?.proyectos.map((p) => p.activo)).toEqual([false, true, false])
  })

  it('arma las secciones en el orden de 04-ux.md; las abiertas vacías no aparecen y las plegadas siempre', () => {
    const vista = armarVista(
      RAIZ,
      [
        carpeta('Viejo', con('en-rescate')),
        carpeta('Nuevo'),
        carpeta('Skills y Claude', con('idea')),
        carpeta('Gamma', con('en-desarrollo')),
        carpeta('Oculto', con('en-uso', { archivado: true })),
      ],
      undefined,
    )
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    expect(vista.secciones.map((s) => [s.id, s.proyectos.length])).toEqual([
      ['sin-clasificar', 1],
      ['en-desarrollo', 1],
      ['idea', 1],
      ['descontinuado', 0],
      ['en-rescate', 1],
      ['para-eliminar', 0],
      ['archivados', 1],
    ])
    expect(vista.secciones.map((s) => s.titulo)).toEqual([
      'Sin clasificar',
      'En desarrollo',
      'Idea',
      'Descontinuado',
      'En rescate',
      'Para eliminar',
      'Archivados',
    ])
    expect(vista.secciones.filter((s) => s.plegadaPorDefecto).map((s) => s.id)).toEqual([
      'descontinuado',
      'en-rescate',
      'para-eliminar',
      'archivados',
    ])
  })

  it('pasa descripción, etiquetas y la ruta absoluta del ícono', () => {
    const vista = armarVista(
      RAIZ,
      [
        carpeta(
          'Gamma',
          con('en-desarrollo', { descripcion: 'Packs', etiquetas: ['electron'], icono: 'docs/ui/icono.png' }),
        ),
      ],
      undefined,
    )
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    expect(vista.secciones[0]?.proyectos[0]).toMatchObject({
      estado: 'en-desarrollo',
      descripcion: 'Packs',
      etiquetas: ['electron'],
      icono: 'D:\\PROYECTOS\\Gamma/docs/ui/icono.png',
      problema: null,
    })
  })

  it('un ícono fuera del proyecto se ignora', () => {
    const vista = armarVista(RAIZ, [carpeta('A', con('idea', { icono: '../B/icono.png' }))], undefined)
    expect(vista.tipo === 'lista' && vista.secciones[0]?.proyectos[0]?.icono).toBeNull()
  })

  it('los datos dañados quedan con los sin clasificar, con el motivo', () => {
    const vista = armarVista(RAIZ, [carpeta('Roto', '{ esto no es json')], undefined)
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    expect(vista.secciones[0]?.id).toBe('sin-clasificar')
    expect(vista.secciones[0]?.proyectos[0]).toMatchObject({ estado: null, problema: 'no es un JSON válido' })
  })

  it('sin carpetas solo quedan las secciones plegadas, vacías', () => {
    const vista = armarVista(RAIZ, [], undefined)
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    expect(vista.total).toBe(0)
    expect(vista.secciones.every((s) => s.plegadaPorDefecto && s.proyectos.length === 0)).toBe(true)
  })
})

describe('orden y herencia', () => {
  const conFecha = (c: CarpetaProyecto, ultimaActividad: number | null): CarpetaProyecto => ({
    ...c,
    ultimaActividad,
  })

  it('dentro de una sección, la actividad más reciente primero; sin fecha al final y por nombre', () => {
    const vista = armarVista(
      RAIZ,
      [
        conFecha(carpeta('Zeta', con('en-uso')), null),
        conFecha(carpeta('Viejo', con('en-uso')), 1_000),
        conFecha(carpeta('Alfa', con('en-uso')), null),
        conFecha(carpeta('Nuevo', con('en-uso')), 5_000),
      ],
      undefined,
    )
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    expect(vista.secciones[0]?.proyectos.map((p) => p.nombre)).toEqual(['Nuevo', 'Viejo', 'Alfa', 'Zeta'])
  })

  it('el proyecto nuevo sabe de cuál hereda; reemplazadoPor solo cuenta En rescate', () => {
    const vista = armarVista(
      RAIZ,
      [
        carpeta('Epsilon', con('en-rescate', { reemplazadoPor: 'gamma' })),
        carpeta('Otro', con('descontinuado', { reemplazadoPor: 'Gamma' })),
        carpeta('Gamma', con('en-desarrollo')),
      ],
      undefined,
    )
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    const todos = vista.secciones.flatMap((s) => s.proyectos)
    expect(todos.find((p) => p.nombre === 'Gamma')?.heredaDe).toEqual(['Epsilon'])
    expect(todos.find((p) => p.nombre === 'Epsilon')?.reemplazadoPor).toBe('gamma')
    expect(todos.find((p) => p.nombre === 'Otro')?.reemplazadoPor).toBeNull()
  })

  it('la tarjeta muestra el nombre de la ficha si trae uno; reemplazadoPor sigue usando la carpeta', () => {
    const vista = armarVista(
      RAIZ,
      [
        carpeta('Centro de Desarrollo', con('en-desarrollo', { nombre: ' Iridium ' })),
        carpeta('Iota', con('en-rescate', { reemplazadoPor: 'Centro de Desarrollo' })),
        carpeta('Sin nombre', con('en-uso', { nombre: '' })),
      ],
      undefined,
    )
    if (vista.tipo !== 'lista') throw new Error('se esperaba una lista')
    const todos = vista.secciones.flatMap((s) => s.proyectos)
    const iridium = todos.find((p) => p.ruta.endsWith('Centro de Desarrollo'))
    expect(iridium?.nombre).toBe('Iridium')
    expect(iridium?.inicial).toBe('I')
    expect(iridium?.heredaDe).toEqual(['Iota'])
    expect(todos.find((p) => p.ruta.endsWith('Sin nombre'))?.nombre).toBe('Sin nombre')
  })
})
