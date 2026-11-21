// T-90: buscar un archivo del proyecto por su nombre, desde la lupa de Archivos.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buscarArchivos } from '../src/compartido/buscar-archivos'
import { listarArchivos } from '../src/main/infra/archivos'

describe('buscarArchivos', () => {
  const rutas = [
    'src/renderer/secciones/proyecto/Archivos.tsx',
    'src/main/infra/archivos.ts',
    'docs/modulos/diseno/estado.md',
    'docs/estado.md',
    'tests/app-mapa-archivos.test.ts',
    'docs/research/costo-de-contexto.md',
  ]

  it('sin mayúsculas ni tildes, primero los que empiezan con lo escrito, después los que lo tienen en el nombre', () => {
    expect(buscarArchivos(rutas, 'ARCHIVOS')).toEqual([
      'src/main/infra/archivos.ts',
      'src/renderer/secciones/proyecto/Archivos.tsx',
      'tests/app-mapa-archivos.test.ts',
    ])
    expect(buscarArchivos(rutas, 'estádo')).toEqual(['docs/estado.md', 'docs/modulos/diseno/estado.md'])
  })

  it('cada palabra tiene que estar en la ruta; las que solo están en las carpetas van al final', () => {
    expect(buscarArchivos(rutas, 'diseno estado')).toEqual(['docs/modulos/diseno/estado.md'])
    expect(buscarArchivos(rutas, 'research')).toEqual(['docs/research/costo-de-contexto.md'])
  })

  it('sin nada escrito no muestra nada, y se queda en el máximo', () => {
    expect(buscarArchivos(rutas, '   ')).toEqual([])
    expect(buscarArchivos(rutas, 's', 2)).toHaveLength(2)
  })
})

describe('listarArchivos', () => {
  let carpeta: string
  beforeEach(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'iridium-t90-'))
    for (const r of ['a.md', 'src/b.ts', 'src/c/d.ts', 'node_modules/x/e.js', '.git/HEAD']) {
      await mkdir(join(carpeta, r, '..'), { recursive: true })
      await writeFile(join(carpeta, r), 'x')
    }
  })
  afterEach(() => rm(carpeta, { recursive: true, force: true }))

  it('junta todos los archivos sin node_modules ni .git', async () => {
    const l = await listarArchivos(carpeta)
    expect(l.tipo === 'ok' && [...l.rutas].sort()).toEqual(['a.md', 'src/b.ts', 'src/c/d.ts'])
    expect(l).toMatchObject({ cortada: false })
  })

  it('una carpeta que no existe es un error, no una lista vacía', async () => {
    expect(await listarArchivos(join(carpeta, 'no-esta'))).toMatchObject({ tipo: 'error' })
  })
})
