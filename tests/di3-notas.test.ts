// DI-I3, tanda 8: Ideas como bloc de notas (D-112, D-126). La hoja `notas.md` de ida y vuelta, y el lado del disco:
// leerla con sus imágenes, guardarla y pegar una imagen sin pisar ninguna.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  conHoy,
  escribirNotas,
  esDireccion,
  leerNotas,
  nombreDelDia,
  verEnlace,
} from '../src/compartido/notas'
import { esImagenDeNotas, guardarHoja, leerHoja, pegarImagenEnHoja } from '../src/main/app/notas'

const HOJA = `## 2026-11-16

Un modo foco que esconda todo menos la conversación.

Mirar cómo arma los diagramas este repo: [beluga](https://github.com/alfa/beluga)

![](notas/2026-11-16-1.png)

Dos renglones
en el mismo párrafo.

## 2026-11-15

Pasar las recetas a algo que se pueda buscar: https://ejemplo.com/recetas.
`

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

describe('la hoja de notas', () => {
  it('lee las fechas, los párrafos, los enlaces y las imágenes', () => {
    const b = leerNotas(HOJA)
    expect(b.map((x) => x.tipo)).toEqual([
      'fecha',
      'parrafo',
      'parrafo',
      'imagen',
      'parrafo',
      'fecha',
      'parrafo',
    ])
    expect(b[2]).toEqual({
      tipo: 'parrafo',
      partes: [
        { tipo: 'texto', texto: 'Mirar cómo arma los diagramas este repo: ' },
        { tipo: 'enlace', texto: 'beluga', url: 'https://github.com/alfa/beluga' },
      ],
    })
    expect(b[3]).toEqual({ tipo: 'imagen', ruta: 'notas/2026-11-16-1.png' })
    expect(b[4]).toEqual({
      tipo: 'parrafo',
      partes: [{ tipo: 'texto', texto: 'Dos renglones\nen el mismo párrafo.' }],
    })
    // La dirección suelta, sin el punto que cierra la oración.
    expect(b[6]).toMatchObject({
      partes: [
        { tipo: 'texto' },
        { tipo: 'enlace', texto: null, url: 'https://ejemplo.com/recetas' },
        { tipo: 'texto', texto: '.' },
      ],
    })
  })

  it('escribe lo mismo que leyó', () => {
    expect(escribirNotas(leerNotas(HOJA))).toBe(HOJA)
  })

  it('el día de hoy arriba para escribir; vacío no se guarda', () => {
    const hoy = new Date(2026, 10, 17)
    const b = conHoy(leerNotas(HOJA), hoy)
    expect(b[0]).toEqual({ tipo: 'fecha', fecha: '2026-11-17' })
    expect(b[1]).toEqual({ tipo: 'parrafo', partes: [] })
    expect(escribirNotas(b)).toBe(HOJA)
    // Si hoy ya está arriba, no se repite.
    expect(conHoy(leerNotas(HOJA), new Date(2026, 10, 16))[0]).toEqual({ tipo: 'fecha', fecha: '2026-11-16' })
    // Una hoja nueva con algo escrito queda con la fecha de hoy.
    const nueva = conHoy([], hoy)
    nueva[1] = { tipo: 'parrafo', partes: [{ tipo: 'texto', texto: 'Primera idea  ' }] }
    expect(escribirNotas(nueva)).toBe('## 2026-11-17\n\nPrimera idea\n')
  })

  it('Hoy, Ayer o la fecha', () => {
    const hoy = new Date(2026, 10, 1)
    expect(nombreDelDia('2026-11-01', hoy)).toBe('Hoy')
    expect(nombreDelDia('2026-10-31', hoy)).toBe('Ayer')
    expect(nombreDelDia('2026-10-29', hoy)).toBe('2026-10-29')
  })

  it('un enlace se ve con su nombre y el sitio', () => {
    expect(verEnlace({ texto: 'beluga', url: 'https://github.com/alfa/beluga' })).toEqual({
      nombre: 'beluga',
      sitio: 'github.com',
    })
    expect(verEnlace({ texto: null, url: 'https://www.ejemplo.com/recetas/' })).toEqual({
      nombre: 'recetas',
      sitio: 'ejemplo.com',
    })
    expect(verEnlace({ texto: null, url: 'https://ejemplo.com' })).toEqual({
      nombre: 'ejemplo.com',
      sitio: null,
    })
    expect(esDireccion(' https://ejemplo.com/a ')).toBe(true)
    expect(esDireccion('mira https://ejemplo.com')).toBe(false)
  })
})

describe('la hoja en el disco', () => {
  let carpeta: string
  beforeEach(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'iridium-notas-'))
  })
  afterEach(async () => {
    await rm(carpeta, { recursive: true, force: true })
  })

  it('sin notas.md, una hoja vacía; sin la carpeta, lo dice', async () => {
    expect(await leerHoja(carpeta)).toEqual({ tipo: 'ok', texto: '', imagenes: {} })
    expect(await leerHoja(join(carpeta, 'no-esta'))).toEqual({ tipo: 'sin-carpeta' })
    expect(await guardarHoja(join(carpeta, 'no-esta'), 'algo')).toMatchObject({ tipo: 'error' })
  })

  it('guarda, pega una imagen sin pisar y la lee de vuelta como data:', async () => {
    const hoy = new Date(2026, 10, 16)
    await mkdir(join(carpeta, 'notas'))
    await writeFile(join(carpeta, 'notas', '2026-11-16-1.png'), 'otra')
    const r = await pegarImagenEnHoja(carpeta, 'image/png', PNG.toString('base64'), hoy)
    expect(r).toMatchObject({ tipo: 'ok', ruta: 'notas/2026-11-16-2.png' })
    expect(await readFile(join(carpeta, 'notas', '2026-11-16-1.png'), 'utf8')).toBe('otra')
    const texto = '## 2026-11-16\n\n![](notas/2026-11-16-2.png)\n\n![](notas/no-esta.png)\n'
    expect(await guardarHoja(carpeta, texto)).toEqual({ tipo: 'ok' })
    expect(await readFile(join(carpeta, 'notas.md'), 'utf8')).toBe(texto)
    const h = await leerHoja(carpeta)
    expect(h.tipo === 'ok' && Object.keys(h.imagenes)).toEqual(['notas/2026-11-16-2.png'])
    expect(h.tipo === 'ok' && h.imagenes['notas/2026-11-16-2.png']).toMatch(/^data:image\/png;base64,/)
  })

  it('no pega lo que no es imagen ni lee fuera de notas/', async () => {
    expect(await pegarImagenEnHoja(carpeta, 'text/plain', 'aG9sYQ==')).toMatchObject({ tipo: 'error' })
    expect(await pegarImagenEnHoja(carpeta, 'image/png', '')).toMatchObject({ tipo: 'error' })
    expect(esImagenDeNotas('notas/a.png')).toBe(true)
    expect(esImagenDeNotas('notas/../../secreto.png')).toBe(false)
    expect(esImagenDeNotas('C:/secreto.png')).toBe(false)
    expect(esImagenDeNotas('notas/a.exe')).toBe(false)
  })
})
