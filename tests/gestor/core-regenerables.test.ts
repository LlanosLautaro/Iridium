// Copiado de la app anterior de proyectos (D-026).
import { describe, expect, it } from 'vitest'
import { cantidadArchivos, tamanoLegible } from '../../src/compartido/tamanos'
import {
  esRegenerable,
  esRutaInterna,
  estaIgnorada,
  type HechosCarpeta,
} from '../../src/main/core/regenerables'

const hechos = (extra: Partial<HechosCarpeta>): HechosCarpeta => ({
  nombre: 'node_modules',
  archivosDelPadre: [],
  archivosPropios: [],
  ignoradaPorGit: false,
  ...extra,
})

describe('esRegenerable (D-006, research/carpetas-regenerables.md)', () => {
  it('node_modules solo con package.json al lado', () => {
    expect(esRegenerable(hechos({ archivosDelPadre: ['package.json'] }))).toBe(true)
    expect(esRegenerable(hechos({ archivosDelPadre: ['README.md'] }))).toBe(false)
  })

  it('dist, out, build… de Node solo si además el .gitignore las ignora', () => {
    const dist = hechos({ nombre: 'dist', archivosDelPadre: ['package.json'] })
    expect(esRegenerable(dist)).toBe(false)
    expect(esRegenerable({ ...dist, ignoradaPorGit: true })).toBe(true)
    expect(esRegenerable({ ...dist, archivosDelPadre: [], ignoradaPorGit: true })).toBe(false)
  })

  it('target solo con Cargo.toml; .venv solo con pyvenv.cfg adentro', () => {
    expect(esRegenerable(hechos({ nombre: 'target', archivosDelPadre: ['Cargo.toml'] }))).toBe(true)
    expect(esRegenerable(hechos({ nombre: 'target', archivosDelPadre: ['package.json'] }))).toBe(false)
    expect(esRegenerable(hechos({ nombre: '.venv', archivosPropios: ['pyvenv.cfg'] }))).toBe(true)
    expect(esRegenerable(hechos({ nombre: 'venv', archivosPropios: [] }))).toBe(false)
  })

  it('los cachés de Python siempre; las salidas de C++ con .sln, .vcxproj o CMakeLists.txt', () => {
    expect(esRegenerable(hechos({ nombre: '__pycache__' }))).toBe(true)
    expect(esRegenerable(hechos({ nombre: 'Release', archivosDelPadre: ['app.sln'] }))).toBe(true)
    expect(esRegenerable(hechos({ nombre: 'build', archivosDelPadre: ['CMakeLists.txt'] }))).toBe(true)
    expect(esRegenerable(hechos({ nombre: 'Debug' }))).toBe(false)
  })

  it('un nombre fuera de la lista nunca es regenerable, tenga lo que tenga', () => {
    expect(
      esRegenerable(hechos({ nombre: 'src', archivosDelPadre: ['package.json'], ignoradaPorGit: true })),
    ).toBe(false)
  })
})

describe('estaIgnorada', () => {
  const raiz = (texto: string) => [{ carpeta: '', texto }]

  it('nombres sueltos coinciden en cualquier nivel; con barra, solo desde su carpeta', () => {
    expect(estaIgnorada('dist', raiz('dist/'))).toBe(true)
    expect(estaIgnorada('paquetes/web/dist', raiz('dist'))).toBe(true)
    expect(estaIgnorada('paquetes/web/dist', raiz('/dist'))).toBe(false)
    expect(estaIgnorada('paquetes/web/dist', raiz('paquetes/web/dist/'))).toBe(true)
  })

  it('comodines, comentarios, negaciones y CRLF', () => {
    expect(estaIgnorada('out', raiz('# salidas\r\no*\r\n'))).toBe(true)
    expect(estaIgnorada('build', raiz('**/build/**'))).toBe(true)
    expect(estaIgnorada('dist', raiz('dist\n!dist'))).toBe(false)
    expect(estaIgnorada('dist', raiz('# dist'))).toBe(false)
  })

  it('una carpeta ignorada arrastra a sus hijas', () => {
    expect(estaIgnorada('generado/dist', raiz('generado/'))).toBe(true)
  })

  it('un .gitignore de una subcarpeta solo vale dentro de ella', () => {
    const anidado = [{ carpeta: 'web', texto: 'dist' }]
    expect(estaIgnorada('web/dist', anidado)).toBe(true)
    expect(estaIgnorada('dist', anidado)).toBe(false)
  })
})

describe('esRutaInterna', () => {
  it('rechaza rutas que salen del proyecto', () => {
    expect(esRutaInterna('node_modules')).toBe(true)
    expect(esRutaInterna('web/dist')).toBe(true)
    expect(esRutaInterna('../Otro')).toBe(false)
    expect(esRutaInterna('a/../../b')).toBe(false)
    expect(esRutaInterna('C:/Windows')).toBe(false)
    expect(esRutaInterna('/etc')).toBe(false)
    expect(esRutaInterna('')).toBe(false)
  })
})

describe('tamanoLegible y cantidadArchivos', () => {
  it('formatea en español', () => {
    expect(tamanoLegible(820)).toBe('820 bytes')
    expect(tamanoLegible(4300)).toBe('4,2 KB')
    expect(tamanoLegible(312 * 1024 * 1024)).toBe('312 MB')
    expect(tamanoLegible(1.5 * 1024 ** 3)).toBe('1,5 GB')
    expect(cantidadArchivos(1)).toBe('1 archivo')
    expect(cantidadArchivos(1234)).toBe('1.234 archivos')
  })
})
