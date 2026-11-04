// Copiado de la app anterior de proyectos (D-026).
import { mkdir, mkdtemp, rm, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { calcularUltimaActividad } from '../../src/main/infra/actividad'

let carpeta: string
const fecha = (iso: string) => new Date(iso)

beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'actividad-'))
})
afterEach(async () => {
  await rm(carpeta, { recursive: true, force: true })
})

async function archivo(ruta: string, iso: string) {
  const completa = join(carpeta, ruta)
  await mkdir(dirname(completa), { recursive: true })
  await writeFile(completa, 'x')
  await utimes(completa, fecha(iso), fecha(iso))
}

describe('calcularUltimaActividad (D-013)', () => {
  it('toma el archivo más reciente, también en subcarpetas', async () => {
    await archivo('a.txt', '2026-01-01T00:00:00Z')
    await archivo('src/profundo/b.ts', '2026-05-01T00:00:00Z')
    expect(await calcularUltimaActividad(carpeta)).toBe(fecha('2026-05-01T00:00:00Z').getTime())
  })

  it('no cuenta .git, carpetas regenerables ni los archivos del gestor', async () => {
    await archivo('a.txt', '2026-01-01T00:00:00Z')
    await archivo('.git/index', '2026-09-01T00:00:00Z')
    await archivo('node_modules/x/index.js', '2026-09-01T00:00:00Z')
    await archivo('dist/app.js', '2026-09-01T00:00:00Z')
    await archivo('.proyecto.json', '2026-09-01T00:00:00Z')
    await archivo('.proyecto-icono.svg', '2026-09-01T00:00:00Z')
    expect(await calcularUltimaActividad(carpeta)).toBe(fecha('2026-01-01T00:00:00Z').getTime())
  })

  it('una carpeta vacía o inexistente no tiene actividad', async () => {
    expect(await calcularUltimaActividad(carpeta)).toBeNull()
    expect(await calcularUltimaActividad(join(carpeta, 'no-existe'))).toBeNull()
  })

  it('no entra en las carpetas que ignora el .gitignore, como contenido de terceros (D-022)', async () => {
    await archivo('src/a.ts', '2026-01-01T00:00:00Z')
    await archivo('biblioteca/pack/textura.png', '2026-06-01T00:00:00Z')
    await archivo('sub/datos/x.bin', '2026-06-01T00:00:00Z')
    const viejo = fecha('2025-01-01T00:00:00Z')
    await writeFile(join(carpeta, '.gitignore'), 'biblioteca/\n')
    await writeFile(join(carpeta, 'sub', '.gitignore'), '/datos/\n')
    await utimes(join(carpeta, '.gitignore'), viejo, viejo)
    await utimes(join(carpeta, 'sub', '.gitignore'), viejo, viejo)
    expect(await calcularUltimaActividad(carpeta)).toBe(fecha('2026-01-01T00:00:00Z').getTime())
  })
})
