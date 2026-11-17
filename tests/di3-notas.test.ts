// El formato de las notas (nació con el bloc de notas, D-112, D-126; ID-I4 sacó el bloc y quedó para la nota de cada
// idea): de ida y vuelta, y el lado del disco: pegar una imagen sin pisar ninguna y leerla de vuelta.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { escribirNotas, esDireccion, leerNotas, nombreDelDia, verEnlace } from '../src/compartido/notas'
import { esImagenEn, guardarImagenPegada, imagenesDe } from '../src/main/app/notas'

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

describe('las imágenes de una nota en el disco', () => {
  let carpeta: string
  beforeEach(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'iridium-notas-'))
  })
  afterEach(async () => {
    await rm(carpeta, { recursive: true, force: true })
  })

  it('pega una imagen sin pisar y la lee de vuelta como data:', async () => {
    const hoy = new Date(2026, 10, 16)
    await mkdir(join(carpeta, 'T-3'))
    await writeFile(join(carpeta, 'T-3', '2026-11-16-1.png'), 'otra')
    const r = await guardarImagenPegada(carpeta, 'T-3', 'image/png', PNG.toString('base64'), hoy)
    expect(r).toMatchObject({ tipo: 'ok', ruta: 'T-3/2026-11-16-2.png' })
    expect(await readFile(join(carpeta, 'T-3', '2026-11-16-1.png'), 'utf8')).toBe('otra')
    const texto = '![](T-3/2026-11-16-2.png)\n\n![](T-3/no-esta.png)\n'
    const imagenes = await imagenesDe(carpeta, texto, (ruta) => esImagenEn('T-3', ruta))
    expect(Object.keys(imagenes)).toEqual(['T-3/2026-11-16-2.png'])
    expect(imagenes['T-3/2026-11-16-2.png']).toMatch(/^data:image\/png;base64,/)
  })

  it('no pega lo que no es imagen ni lee fuera de su carpeta', async () => {
    expect(await guardarImagenPegada(carpeta, 'T-3', 'text/plain', 'aG9sYQ==')).toMatchObject({
      tipo: 'error',
    })
    expect(await guardarImagenPegada(carpeta, 'T-3', 'image/png', '')).toMatchObject({ tipo: 'error' })
    expect(esImagenEn('T-3', 'T-3/a.png')).toBe(true)
    expect(esImagenEn('T-3', 'T-3/../../secreto.png')).toBe(false)
    expect(esImagenEn('T-3', 'C:/secreto.png')).toBe(false)
    expect(esImagenEn('T-3', 'T-3/a.exe')).toBe(false)
  })
})
