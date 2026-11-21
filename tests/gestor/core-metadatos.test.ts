// Copiado de la app anterior de proyectos (D-026).
import { describe, expect, it } from 'vitest'
import { leerMetadatos, limpiarEtiquetas, rutaIconoSegura } from '../../src/main/core/metadatos'

const completo = {
  version: 1,
  descripcion: 'App para explorar paquetes de un juego.',
  estado: 'en-desarrollo',
  etiquetas: ['electron', 'juegos'],
  icono: 'docs/ui/icono.png',
  archivado: false,
  reemplazadoPor: null,
}

describe('leerMetadatos', () => {
  it('lee el ejemplo de 05-arquitectura.md', () => {
    const r = leerMetadatos(JSON.stringify(completo))
    expect(r).toEqual({ tipo: 'ok', metadatos: { ...completo, archivadoEl: null, otros: {} } })
  })

  it('acepta los siete estados, incluido Idea (D-017)', () => {
    for (const estado of [
      'idea',
      'en-desarrollo',
      'en-uso',
      'pausado',
      'descontinuado',
      'en-rescate',
      'para-eliminar',
    ]) {
      expect(leerMetadatos(JSON.stringify({ version: 1, estado })).tipo).toBe('ok')
    }
  })

  it('con solo versión y estado, el resto toma su valor vacío', () => {
    const r = leerMetadatos('{"version":1,"estado":"idea"}')
    expect(r).toEqual({
      tipo: 'ok',
      metadatos: {
        version: 1,
        descripcion: '',
        estado: 'idea',
        etiquetas: [],
        icono: null,
        archivado: false,
        archivadoEl: null,
        reemplazadoPor: null,
        otros: {},
      },
    })
  })

  it('conserva los campos que no conoce (RNF-3)', () => {
    const r = leerMetadatos(JSON.stringify({ ...completo, grupo: 'scripts', futuro: { a: 1 } }))
    expect(r.tipo === 'ok' && r.metadatos.otros).toEqual({ grupo: 'scripts', futuro: { a: 1 } })
  })

  it('tolera la marca BOM que agregan algunos editores de Windows', () => {
    expect(leerMetadatos(`\uFEFF${JSON.stringify(completo)}`).tipo).toBe('ok')
  })

  it('limpia espacios, etiquetas vacías o repetidas e ícono vacío', () => {
    const r = leerMetadatos(
      JSON.stringify({
        version: 1,
        estado: 'en-uso',
        descripcion: '  hola  ',
        etiquetas: [' a ', '', 'A', 'b'],
        icono: ' ',
      }),
    )
    expect(r.tipo === 'ok' && r.metadatos).toMatchObject({
      descripcion: 'hola',
      etiquetas: ['a', 'b'],
      icono: null,
    })
  })

  it.each([
    ['texto que no es JSON', '{version: 1', 'no es un JSON válido'],
    ['una lista', '[]', 'no es un objeto JSON'],
    ['sin versión', '{"estado":"idea"}', 'falta la versión del esquema'],
    ['versión más nueva', '{"version":2,"estado":"idea"}', 'es de una versión más nueva de la ficha (2)'],
    ['estado inventado', '{"version":1,"estado":"terminado"}', 'el estado falta o no es válido'],
    [
      'etiquetas que no son lista',
      '{"version":1,"estado":"idea","etiquetas":"a,b"}',
      'las etiquetas no son una lista de textos',
    ],
    [
      'archivado como texto',
      '{"version":1,"estado":"idea","archivado":"si"}',
      '"archivado" no es verdadero o falso',
    ],
  ])('marca como dañado: %s', (_caso, texto, motivo) => {
    expect(leerMetadatos(texto)).toEqual({ tipo: 'danado', motivo })
  })
})

describe('limpiarEtiquetas', () => {
  it('respeta el orden en que se escribieron', () => {
    expect(limpiarEtiquetas(['vscode', 'extensión', 'VSCode'])).toEqual(['vscode', 'extensión'])
  })
})

describe('rutaIconoSegura', () => {
  it('acepta imágenes dentro del proyecto y unifica las barras', () => {
    expect(rutaIconoSegura('docs\\ui\\icono.png')).toBe('docs/ui/icono.png')
    expect(rutaIconoSegura('./icono.svg')).toBe('icono.svg')
  })
  it('rechaza rutas que salen del proyecto, absolutas o que no son imágenes', () => {
    expect(rutaIconoSegura('../otro/icono.png')).toBeNull()
    expect(rutaIconoSegura('C:\\Windows\\icono.png')).toBeNull()
    expect(rutaIconoSegura('/etc/icono.png')).toBeNull()
    expect(rutaIconoSegura('docs/estado.md')).toBeNull()
  })
})
