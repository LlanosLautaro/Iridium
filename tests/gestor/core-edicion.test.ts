// Copiado de la app anterior de proyectos (D-026).
import { describe, expect, it } from 'vitest'
import type { DatosEdicion } from '../../src/compartido/tipos'
import {
  cambiarArchivado,
  cambiarEstado,
  camposDesconocidos,
  mezclarEdicion,
  serializarMetadatos,
  validarEdicion,
} from '../../src/main/core/edicion'
import { leerMetadatos } from '../../src/main/core/metadatos'

const datos = (extra: Partial<DatosEdicion> = {}): DatosEdicion => ({
  descripcion: 'Una app.',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  reemplazadoPor: null,
  ...extra,
})
const OTROS = ['Gamma', 'Eta']

describe('validarEdicion', () => {
  it('limpia espacios y etiquetas repetidas', () => {
    const r = validarEdicion(
      datos({ descripcion: '  Una   app.\n', etiquetas: ['a', ' A ', 'b'] }),
      'Nuevo',
      OTROS,
    )
    expect(r).toEqual({ ok: true, datos: datos({ descripcion: 'Una app.', etiquetas: ['a', 'b'] }) })
  })

  it('la descripción es obligatoria y entra en 180 caracteres (D-010)', () => {
    expect(validarEdicion(datos({ descripcion: '  ' }), 'Nuevo', OTROS)).toMatchObject({
      ok: false,
      errores: { descripcion: 'Escribí una descripción corta.' },
    })
    expect(validarEdicion(datos({ descripcion: 'x'.repeat(180) }), 'Nuevo', OTROS).ok).toBe(true)
    expect(validarEdicion(datos({ descripcion: 'x'.repeat(181) }), 'Nuevo', OTROS).ok).toBe(false)
  })

  it('En rescate pide un reemplazo que exista y no sea el mismo', () => {
    const rescate = (reemplazadoPor: string | null) =>
      validarEdicion(datos({ estado: 'en-rescate', reemplazadoPor }), 'Epsilon', [...OTROS, 'Epsilon'])
    expect(rescate(null)).toMatchObject({ ok: false, errores: { reemplazadoPor: expect.any(String) } })
    expect(rescate('Epsilon')).toMatchObject({ ok: false })
    expect(rescate('No Existe')).toMatchObject({ ok: false })
    // Sin distinguir mayúsculas; se guarda con el nombre real de la carpeta.
    expect(rescate('gamma')).toMatchObject({ ok: true, datos: { reemplazadoPor: 'Gamma' } })
  })

  it('fuera de En rescate, el reemplazo se descarta', () => {
    const r = validarEdicion(datos({ reemplazadoPor: 'Gamma' }), 'Nuevo', OTROS)
    expect(r).toMatchObject({ ok: true, datos: { reemplazadoPor: null } })
  })

  it('el ícono tiene que ser una imagen dentro del proyecto', () => {
    expect(validarEdicion(datos({ icono: 'docs\\icono.png' }), 'Nuevo', OTROS)).toMatchObject({
      ok: true,
      datos: { icono: 'docs/icono.png' },
    })
    expect(validarEdicion(datos({ icono: '../otro.png' }), 'Nuevo', OTROS).ok).toBe(false)
  })

  it('las etiquetas tienen un largo máximo', () => {
    expect(validarEdicion(datos({ etiquetas: ['x'.repeat(25)] }), 'Nuevo', OTROS).ok).toBe(false)
  })
})

describe('mezclarEdicion y serializarMetadatos', () => {
  it('conserva archivado y los campos desconocidos (RNF-3)', () => {
    const texto = JSON.stringify({ version: 1, estado: 'idea', archivado: true, grupo: 'scripts' })
    const m = mezclarEdicion(leerMetadatos(texto), texto, datos())
    expect(m).toMatchObject({ archivado: true, estado: 'en-desarrollo', otros: { grupo: 'scripts' } })
    const guardado = JSON.parse(serializarMetadatos(m))
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
  })

  it('sobre un archivo dañado rescata lo desconocido que pueda leer', () => {
    const texto = JSON.stringify({ version: 1, estado: 'terminado', nota: 'mía' })
    const m = mezclarEdicion(leerMetadatos(texto), texto, datos())
    expect(m.otros).toEqual({ nota: 'mía' })
    expect(camposDesconocidos('{ roto')).toEqual({})
  })

  it('un proyecto sin archivo arranca sin archivar', () => {
    expect(mezclarEdicion(null, null, datos())).toMatchObject({ version: 1, archivado: false, otros: {} })
  })

  it('el texto es JSON legible con salto de línea final', () => {
    const t = serializarMetadatos(mezclarEdicion(null, null, datos()))
    expect(t.endsWith('}\n')).toBe(true)
    expect(t).toContain('\n  "descripcion": "Una app.",')
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

  it('no sirve sin datos válidos ni para En rescate', () => {
    expect(typeof cambiarEstado(null, 'pausado')).toBe('string')
    expect(typeof cambiarEstado(leerMetadatos('{ roto'), 'pausado')).toBe('string')
    expect(typeof cambiarEstado(ok, 'en-rescate')).toBe('string')
  })
})

describe('cambiarArchivado (D-004)', () => {
  it('solo cambia archivado y conserva el resto', () => {
    const actual = leerMetadatos(JSON.stringify({ version: 1, estado: 'en-uso', descripcion: 'x', extra: 1 }))
    expect(cambiarArchivado(actual, true)).toMatchObject({
      archivado: true,
      estado: 'en-uso',
      descripcion: 'x',
      otros: { extra: 1 },
    })
  })

  it('un proyecto sin datos válidos se clasifica primero', () => {
    expect(typeof cambiarArchivado(null, true)).toBe('string')
    expect(typeof cambiarArchivado(leerMetadatos('{ roto'), true)).toBe('string')
  })
})
