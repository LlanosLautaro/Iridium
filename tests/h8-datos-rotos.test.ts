// Hito 8 (08-calidad.md › Defectos 5): los archivos de datos de Iridium que guardan lo que el usuario escribió o eligió.
// Si uno está roto, Iridium arranca sin él pero lo aparta en `<archivo>.roto` antes de pisarlo con el próximo guardado;
// si solo una entrada está rota, se pierde esa y no las demás.
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ArchivoBorradores, type BorradorGuardado } from '../src/main/infra/borradores'
import { ArchivoConfig } from '../src/main/infra/config'
import { ArchivoEscritos } from '../src/main/infra/escritos'
import { ArchivoSesiones, type ResumenSesion } from '../src/main/infra/sesiones'

let carpeta: string

beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'iridium-h8-rotos-'))
})

afterEach(async () => {
  await rm(carpeta, { recursive: true, force: true })
})

const ROTO = '{"version": 1, "borradores": {'

const borrador: BorradorGuardado = {
  pregunta: '¿A o B?',
  borrador: { opcion: 'A', otro: '', nota: 'nota', marcas: [], notas: [] },
  guardado: 1,
}

const resumen: ResumenSesion = {
  ruta: 'D:/P',
  empezadaEn: 'iridium',
  ultimoUso: 1,
  detenida: false,
  ultimoEstado: 'terminada',
  preguntas: [],
}

describe('un archivo roto se aparta antes de pisarlo', () => {
  it('borradores.json', async () => {
    const archivo = join(carpeta, 'borradores.json')
    await writeFile(archivo, ROTO)
    const b = new ArchivoBorradores(archivo)
    expect(await b.de('D:/P', 'Q-1')).toBeNull()
    await b.guardar('D:/P', 'Q-1', borrador)
    expect(await readFile(`${archivo}.roto`, 'utf8')).toBe(ROTO)
    expect(JSON.parse(await readFile(archivo, 'utf8')).version).toBe(1)
  })

  it('escritos.json', async () => {
    const archivo = join(carpeta, 'escritos.json')
    await writeFile(archivo, 'no es JSON')
    const e = new ArchivoEscritos(archivo)
    expect((await e.todos()).size).toBe(0)
    await e.guardar('D:/P', 'hola')
    expect(await readFile(`${archivo}.roto`, 'utf8')).toBe('no es JSON')
    await expect(new ArchivoEscritos(archivo).todos()).resolves.toEqual(new Map([['D:/P', 'hola']]))
  })

  it('sesiones.json', async () => {
    const archivo = join(carpeta, 'sesiones.json')
    await writeFile(archivo, '{"version": 2}')
    const s = new ArchivoSesiones(archivo)
    expect(await s.de('a')).toBeNull()
    await s.guardar('a', resumen)
    expect(await readFile(`${archivo}.roto`, 'utf8')).toBe('{"version": 2}')
  })

  it('config.json: los valores de siempre, y la carpeta y el tema anteriores quedan en el .roto', async () => {
    const archivo = join(carpeta, 'config.json')
    const anterior = '{"raiz": "D:/Mis proyectos", "tema": "carbon",'
    await writeFile(archivo, anterior)
    const c = new ArchivoConfig(archivo)
    expect((await c.leer()).raiz).toBeUndefined()
    await c.guardar({ nombreUsuario: 'Lau' })
    expect(await readFile(`${archivo}.roto`, 'utf8')).toBe(anterior)
  })

  it('sin archivo no deja ningún .roto', async () => {
    const archivo = join(carpeta, 'borradores.json')
    await new ArchivoBorradores(archivo).guardar('D:/P', 'Q-1', borrador)
    await expect(readFile(`${archivo}.roto`, 'utf8')).rejects.toThrow()
  })
})

describe('una entrada rota no se lleva a las demás', () => {
  it('borradores: se pierde solo la rota', async () => {
    const archivo = join(carpeta, 'borradores.json')
    await writeFile(
      archivo,
      JSON.stringify({ version: 1, borradores: { 'D:/P|Q-1': borrador, 'D:/P|Q-2': { pregunta: 3 } } }),
    )
    const b = new ArchivoBorradores(archivo)
    expect(await b.de('D:/P', 'Q-1')).not.toBeNull()
    expect(await b.de('D:/P', 'Q-2')).toBeNull()
  })

  it('sesiones: se pierde solo la rota', async () => {
    const archivo = join(carpeta, 'sesiones.json')
    await writeFile(archivo, JSON.stringify({ version: 1, conversaciones: { a: resumen, b: { ruta: 1 } } }))
    const s = new ArchivoSesiones(archivo)
    expect(await s.de('a')).toEqual(resumen)
    expect(await s.de('b')).toBeNull()
  })
})
