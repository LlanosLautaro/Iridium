// Copiado de la app anterior de proyectos (D-026).
// Escritura atómica del `.proyecto.json` (RNF-3) cuando Windows tiene el archivo tomado o no deja escribir (hito 8).
import * as fs from 'node:fs/promises'
import { chmod, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs/promises', async (original) => {
  const real = await original<typeof import('node:fs/promises')>()
  return { ...real, rename: vi.fn(real.rename) }
})

const { escribirMetadatos } = await import('../../src/main/infra/escritura')
const { cambiarEstadoProyecto } = await import('../../src/main/app/edicion')

let raiz: string
let carpeta: string
const renombrar = vi.mocked(fs.rename)
const renombrarReal = (await vi.importActual<typeof fs>('node:fs/promises')).rename
const errorCon = (code: string) => Object.assign(new Error(code), { code })

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'gestor-escritura-'))
  carpeta = join(raiz, 'Alfa')
  await fs.mkdir(carpeta)
  await writeFile(join(carpeta, '.proyecto.json'), 'ORIGINAL')
})
afterEach(async () => {
  renombrar.mockReset()
  renombrar.mockImplementation(renombrarReal)
  await chmod(join(carpeta, '.proyecto.json'), 0o666).catch(() => {})
  await rm(raiz, { recursive: true, force: true })
})

describe('escribirMetadatos', () => {
  it('si el archivo está tomado un instante, reintenta y termina guardando', async () => {
    renombrar.mockRejectedValueOnce(errorCon('EBUSY')).mockRejectedValueOnce(errorCon('EPERM'))
    await escribirMetadatos(carpeta, 'NUEVO')
    expect(await readFile(join(carpeta, '.proyecto.json'), 'utf8')).toBe('NUEVO')
    expect(await readdir(carpeta)).toEqual(['.proyecto.json'])
  })

  it('si sigue tomado, se rinde: el archivo original queda intacto y no queda el temporal', async () => {
    renombrar.mockRejectedValue(errorCon('EBUSY'))
    await expect(escribirMetadatos(carpeta, 'NUEVO')).rejects.toMatchObject({ code: 'EBUSY' })
    renombrar.mockImplementation(renombrarReal)
    expect(await readFile(join(carpeta, '.proyecto.json'), 'utf8')).toBe('ORIGINAL')
    expect(await readdir(carpeta)).toEqual(['.proyecto.json'])
  })

  it('un error que no es de archivo tomado no se reintenta', async () => {
    renombrar.mockRejectedValueOnce(errorCon('ENOSPC'))
    await expect(escribirMetadatos(carpeta, 'NUEVO')).rejects.toMatchObject({ code: 'ENOSPC' })
    expect(renombrar).toHaveBeenCalledTimes(1)
    expect(await readFile(join(carpeta, '.proyecto.json'), 'utf8')).toBe('ORIGINAL')
  })
})

describe('cambiar el estado con el archivo de solo lectura', () => {
  it('avisa con un mensaje claro y no cambia el archivo', async () => {
    await writeFile(join(carpeta, '.proyecto.json'), '{"version":1,"estado":"idea"}')
    await chmod(join(carpeta, '.proyecto.json'), 0o444)
    const r = await cambiarEstadoProyecto(raiz, carpeta, 'pausado')
    expect(r).toEqual({
      ok: false,
      mensaje: 'No se pudo guardar: la carpeta es de solo lectura o está en uso.',
    })
    expect(await readFile(join(carpeta, '.proyecto.json'), 'utf8')).toBe('{"version":1,"estado":"idea"}')
    expect(await readdir(carpeta)).toEqual(['.proyecto.json'])
  })
})
