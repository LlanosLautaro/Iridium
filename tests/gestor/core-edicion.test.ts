// Copiado de la app anterior de proyectos (D-026).
import { describe, expect, it } from 'vitest'
import {
  cambiarArchivado,
  cambiarEstado,
  cambiarIcono,
  serializarMetadatos,
} from '../../src/main/core/edicion'
import { leerMetadatos } from '../../src/main/core/metadatos'

describe('serializarMetadatos', () => {
  it('conserva archivado y los campos desconocidos (RNF-3), en orden fijo', () => {
    const leida = leerMetadatos(
      JSON.stringify({ version: 1, estado: 'idea', archivado: true, grupo: 'scripts' }),
    )
    if (leida.tipo !== 'ok') throw new Error('se esperaba una ficha')
    const guardado = JSON.parse(serializarMetadatos(leida.metadatos))
    expect(Object.keys(guardado)).toEqual([
      'version',
      'descripcion',
      'estado',
      'etiquetas',
      'icono',
      'archivado',
      'reemplazadoPor',
      'grupo',
    ])
    expect(guardado).toMatchObject({ archivado: true, grupo: 'scripts' })
  })

  it('el texto es JSON legible con salto de línea final', () => {
    const m = cambiarEstado(null, 'idea')
    if (typeof m === 'string') throw new Error(m)
    const t = serializarMetadatos(m)
    expect(t.endsWith('}\n')).toBe(true)
    expect(t).toContain('\n  "estado": "idea",')
  })
})

describe('cambiarEstado (menú)', () => {
  const ok = leerMetadatos(
    JSON.stringify({ version: 1, estado: 'en-rescate', reemplazadoPor: 'Gamma', descripcion: 'x' }),
  )

  it('cambia el estado y quita el reemplazo', () => {
    expect(cambiarEstado(ok, 'pausado')).toMatchObject({
      estado: 'pausado',
      reemplazadoPor: null,
      descripcion: 'x',
    })
  })

  it('sin ficha, la estrena con ese estado (R-7, D-089)', () => {
    expect(cambiarEstado(null, 'pausado')).toEqual({
      version: 1,
      descripcion: '',
      estado: 'pausado',
      etiquetas: [],
      icono: null,
      archivado: false,
      reemplazadoPor: null,
      otros: {},
    })
  })

  it('no sirve con la ficha dañada ni para En rescate', () => {
    expect(typeof cambiarEstado(leerMetadatos('{ roto'), 'pausado')).toBe('string')
    expect(typeof cambiarEstado(null, 'en-rescate')).toBe('string')
    expect(typeof cambiarEstado(ok, 'en-rescate')).toBe('string')
  })
})

describe('cambiarArchivado (D-004)', () => {
  it('solo cambia archivado y conserva el resto', () => {
    const actual = leerMetadatos(JSON.stringify({ version: 1, estado: 'en-uso', descripcion: 'x', extra: 1 }))
    expect(cambiarArchivado(actual, true, '2026-11-21')).toMatchObject({
      archivado: true,
      archivadoEl: '2026-11-21',
      estado: 'en-uso',
      descripcion: 'x',
      otros: { extra: 1 },
    })
  })

  it('guarda el día al archivar y lo saca al desarchivar; la ficha sin archivar no lo escribe (T-58)', () => {
    const archivada = cambiarArchivado(leerMetadatos('{"version":1,"estado":"idea"}'), true, '2026-10-12')
    if (typeof archivada === 'string') throw new Error(archivada)
    const texto = serializarMetadatos(archivada)
    expect(JSON.parse(texto)).toMatchObject({ archivado: true, archivadoEl: '2026-10-12' })
    expect(leerMetadatos(texto)).toMatchObject({ tipo: 'ok', metadatos: { archivadoEl: '2026-10-12' } })
    const vuelta = cambiarArchivado(leerMetadatos(texto), false, '2026-11-21')
    if (typeof vuelta === 'string') throw new Error(vuelta)
    expect(vuelta.archivadoEl).toBeNull()
    expect(serializarMetadatos(vuelta)).not.toContain('archivadoEl')
  })

  it('una fecha mal escrita se ignora sin dañar la ficha', () => {
    const l = leerMetadatos('{"version":1,"estado":"idea","archivado":true,"archivadoEl":"ayer"}')
    expect(l).toMatchObject({ tipo: 'ok', metadatos: { archivado: true, archivadoEl: null } })
  })

  it('un proyecto sin datos válidos se clasifica primero', () => {
    expect(typeof cambiarArchivado(null, true, '2026-11-21')).toBe('string')
    expect(typeof cambiarArchivado(leerMetadatos('{ roto'), true, '2026-11-21')).toBe('string')
  })
})

describe('cambiarIcono (R-7)', () => {
  const actual = leerMetadatos(JSON.stringify({ version: 1, estado: 'en-uso', descripcion: 'x', extra: 1 }))

  it('pone la ruta relativa con «/» y conserva el resto', () => {
    expect(cambiarIcono(actual, 'img\\logo.svg')).toMatchObject({
      icono: 'img/logo.svg',
      estado: 'en-uso',
      otros: { extra: 1 },
    })
  })

  it('no acepta lo que no es una imagen del proyecto ni un proyecto sin ficha usable', () => {
    expect(typeof cambiarIcono(actual, '../afuera.svg')).toBe('string')
    expect(typeof cambiarIcono(actual, 'notas.txt')).toBe('string')
    expect(typeof cambiarIcono(null, 'logo.svg')).toBe('string')
    expect(typeof cambiarIcono(leerMetadatos('{ roto'), 'logo.svg')).toBe('string')
  })
})
