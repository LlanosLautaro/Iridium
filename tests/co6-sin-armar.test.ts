// CO-I6 — Cambios sin armar: el último commit del código de Iridium contra `main` y la versión lista, y la marca de
// `tools/actualizar.ps1` mientras arma, con un repositorio de muestra de verdad.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { armandoAhora, leerSinArmar, VigiaSinArmar } from '../src/main/infra/sin-armar'

let codigo: string
let release: string

function git(...args: string[]): string {
  return execFileSync('git', args, {
    cwd: codigo,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
}

async function commit(mensaje: string) {
  await writeFile(join(codigo, 'cambio.txt'), mensaje)
  git('add', '.')
  git('-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo', 'commit', '-qm', mensaje)
}

beforeEach(async () => {
  codigo = await mkdtemp(join(tmpdir(), 'iridium-codigo-'))
  release = join(codigo, 'release')
  await mkdir(join(release, 'win-unpacked'), { recursive: true })
  await writeFile(join(codigo, '.gitignore'), 'release/\n')
  git('init', '-q', '-b', 'dev')
  await commit('CO-I4')
  git('branch', 'main')
})
afterEach(async () => {
  await rm(codigo, { recursive: true, force: true })
})

describe('qué falta armar', () => {
  it('nada si el último commit es el de `main` (lo que está en la app)', async () => {
    expect(await leerSinArmar(codigo, release)).toEqual({ carpeta: codigo, pendiente: null, limpio: true })
  })

  it('limpio solo sin archivos seguidos modificados: los nuevos sin seguir (las respuestas) no cuentan (T-67)', async () => {
    await commit('T-67')
    await writeFile(join(codigo, 'respuesta.md'), 'nueva, sin seguir')
    expect((await leerSinArmar(codigo, release)).limpio).toBe(true)
    await writeFile(join(codigo, 'cambio.txt'), 'a medias')
    expect((await leerSinArmar(codigo, release)).limpio).toBe(false)
  })

  it('con commits nuevos, el último y su primera línea', async () => {
    await commit('CO-I6: Armar')
    const r = await leerSinArmar(codigo, release)
    expect(r.pendiente).toEqual({ commit: git('rev-parse', '--short', 'HEAD'), mensaje: 'CO-I6: Armar' })
  })

  it('nada si la versión lista ya trae ese commit (entra al cerrar)', async () => {
    await commit('CO-I6: Armar')
    await mkdir(join(release, 'nueva', 'win-unpacked'), { recursive: true })
    await writeFile(join(release, 'nueva', 'win-unpacked', 'Iridium.exe'), '')
    const lista = {
      fecha: '2026-11-01T14:05:00',
      commit: git('rev-parse', '--short', 'HEAD'),
      mensaje: 'CO-I6',
    }
    await writeFile(join(release, 'nueva', 'lista.json'), JSON.stringify(lista))
    expect((await leerSinArmar(codigo, release)).pendiente).toBeNull()
    // Una lista vieja no alcanza.
    await commit('Otro')
    expect((await leerSinArmar(codigo, release)).pendiente?.mensaje).toBe('Otro')
  })

  it('fuera de un repositorio o sin `main`, nada', async () => {
    const suelta = await mkdtemp(join(tmpdir(), 'iridium-suelta-'))
    try {
      expect((await leerSinArmar(suelta, join(suelta, 'release'))).pendiente).toBeNull()
    } finally {
      await rm(suelta, { recursive: true, force: true })
    }
    git('branch', '-D', 'main')
    await commit('Sin main')
    expect((await leerSinArmar(codigo, release)).pendiente).toBeNull()
  })
})

describe('armando', () => {
  it('cuenta la marca solo mientras su proceso sigue vivo', async () => {
    expect(await armandoAhora(release)).toBe(false)
    await writeFile(join(release, 'armando.json'), `﻿${JSON.stringify({ pid: process.pid })}`)
    expect(await armandoAhora(release)).toBe(true)
    // La consola se cerró a mitad de camino: la marca quedó, el proceso no.
    const muerto = execFileSync('node', ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }).trim()
    await writeFile(join(release, 'armando.json'), JSON.stringify({ pid: Number(muerto) }))
    expect(await armandoAhora(release)).toBe(false)
    await writeFile(join(release, 'armando.json'), '{ roto')
    expect(await armandoAhora(release)).toBe(false)
  })
})

describe('lo que `pnpm volver` dejó afuera (T-67)', () => {
  it('la vigía lo lee de `release/retenido.json`; sin el archivo, nada', async () => {
    await commit('Lo que falla')
    const vigia = new VigiaSinArmar(codigo, release, 'exit')
    await vigia.mirar()
    expect(vigia.ultimo().retenido).toBeNull()
    const hash = git('rev-parse', '--short', 'HEAD')
    await writeFile(
      join(release, 'retenido.json'),
      `﻿${JSON.stringify({ commit: hash, desde: '2026-11-15T12:00:00' })}`,
    )
    await vigia.mirar()
    expect(vigia.ultimo()).toMatchObject({ pendiente: { commit: hash }, retenido: hash, limpio: true })
  })
})
