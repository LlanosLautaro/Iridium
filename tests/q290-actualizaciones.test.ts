// Q-290 (D-192) — Lo que siguió a T-132: lo nuevo de cada versión, las versiones viejas que se borran de GitHub, y que
// una respuesta sin commitear en `docs/` ya no frene la publicación sola (D-191).
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { type CambioArmado, novedadesDesde } from '../src/compartido/novedades'
import { VERSIONES_PUBLICADAS, versionesParaBorrar } from '../src/compartido/versiones'
import { archivoNovedades } from '../src/main/infra/novedades'
import { armado } from '../tools/armado'

const carpetas: string[] = []
afterEach(async () => {
  for (const c of carpetas.splice(0)) await rm(c, { recursive: true, force: true, maxRetries: 5 })
})

async function temporal(): Promise<string> {
  const c = await mkdtemp(join(tmpdir(), 'iridium-q290-'))
  carpetas.push(c)
  return c
}

/** Cinco commits, del más nuevo (e5) al más viejo (a1), uno por día. */
const CAMBIOS: CambioArmado[] = ['e5', 'd4', 'c3', 'b2', 'a1'].map((c, i) => ({
  commit: `${c}00000`,
  fecha: Date.UTC(2026, 10, 20 - i),
  mensaje: `Cambio ${c}. Con más detalle.`,
}))

describe('lo que trae una versión', () => {
  it('trae los commits más nuevos que el último visto', () => {
    const n = novedadesDesde({ version: '1.0.5', cambios: CAMBIOS, visto: { commit: 'c300000', fecha: 0 } })
    expect(n?.cambios.map((c) => c.commit)).toEqual(['e500000', 'd400000'])
    expect(n?.mas).toBe(false)
  })

  it('reconoce el commit aunque su código corto tenga otro largo', () => {
    const n = novedadesDesde({ version: '1.0.5', cambios: CAMBIOS, visto: { commit: 'd40000012', fecha: 0 } })
    expect(n?.cambios).toHaveLength(1)
  })

  it('la primera vez en una PC, o con la misma versión, no avisa nada', () => {
    expect(novedadesDesde({ version: '1.0.5', cambios: CAMBIOS, visto: null })).toBeNull()
    expect(
      novedadesDesde({ version: '1.0.5', cambios: CAMBIOS, visto: { commit: 'e500000', fecha: 0 } }),
    ).toBeNull()
  })

  it('si el visto quedó más atrás que la lista, trae todos y dice que hay más', () => {
    const n = novedadesDesde({
      version: '1.0.5',
      cambios: CAMBIOS,
      visto: { commit: 'ffff', fecha: Date.UTC(2026, 9, 1) },
    })
    expect(n?.cambios).toHaveLength(5)
    expect(n?.mas).toBe(true)
  })

  it('una versión más vieja que la vista (pnpm volver) no avisa nada', () => {
    const visto = { commit: 'f600000', fecha: Date.UTC(2026, 10, 21) }
    expect(novedadesDesde({ version: '1.0.4', cambios: CAMBIOS, visto })).toBeNull()
  })

  it('novedades.json: la primera vez se anota sin avisar; con otra versión avisa hasta Listo', async () => {
    const archivo = join(await temporal(), 'datos', 'novedades.json')
    const vieja = archivoNovedades(archivo, { version: '1.0.3', cambios: CAMBIOS.slice(2) })
    expect(await vieja.pendientes()).toBeNull()
    expect(JSON.parse(await readFile(archivo, 'utf8')).commit).toBe('c300000')

    const nueva = archivoNovedades(archivo, { version: '1.0.5', cambios: CAMBIOS })
    expect((await nueva.pendientes())?.cambios).toHaveLength(2)
    // Sin Listo (cerró Iridium antes), vuelve a aparecer.
    expect((await nueva.pendientes())?.cambios).toHaveLength(2)
    await nueva.vistas()
    expect(await nueva.pendientes()).toBeNull()
  })

  it('un novedades.json roto se toma como la primera vez', async () => {
    const archivo = join(await temporal(), 'novedades.json')
    await writeFile(archivo, '{ roto')
    const n = archivoNovedades(archivo, { version: '1.0.5', cambios: CAMBIOS })
    expect(await n.pendientes()).toBeNull()
    expect(JSON.parse(await readFile(archivo, 'utf8')).commit).toBe('e500000')
  })
})

describe('las versiones viejas de GitHub', () => {
  const version = (n: number, draft = false) => ({
    tag_name: `v1.0.${n}`,
    draft,
    published_at: new Date(Date.UTC(2026, 10, 1, n)).toISOString(),
  })

  it(`quedan las ${VERSIONES_PUBLICADAS} publicadas más nuevas; las de antes de D-182 también se van`, () => {
    const lista = [
      ...Array.from({ length: VERSIONES_PUBLICADAS + 2 }, (_, i) => version(i + 1)),
      // De antes de D-182: su número parece más alto, pero se publicó antes.
      { tag_name: 'v2026.1122.1004', draft: false, published_at: '2026-10-22T10:04:00Z' },
      { tag_name: 'iridium-2026-11-04-1908-c012989', draft: false, published_at: '2026-10-04T19:08:00Z' },
    ]
    const borrar = versionesParaBorrar(lista).map((v) => v.tag_name)
    expect(borrar).toEqual(['v1.0.2', 'v1.0.1', 'v2026.1122.1004', 'iridium-2026-11-04-1908-c012989'])
  })

  it('un borrador (la que se está subiendo) no se toca ni cuenta', () => {
    const lista = [...Array.from({ length: VERSIONES_PUBLICADAS }, (_, i) => version(i + 1)), version(VERSIONES_PUBLICADAS + 1, true)]
    expect(versionesParaBorrar(lista)).toEqual([])
  })
})

describe('cambios sin commitear', () => {
  const git = (carpeta: string, ...args: string[]) =>
    execFileSync('git', args, { cwd: carpeta, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })

  it('lo de docs/ no cuenta (no va en la app); lo demás sí', async () => {
    const repo = await temporal()
    git(repo, 'init', '-q')
    git(repo, 'config', 'user.email', 'a@b.c')
    git(repo, 'config', 'user.name', 'Alfa')
    await writeFile(join(repo, 'a.ts'), 'export {}\n')
    git(repo, 'add', '.')
    git(repo, 'commit', '-q', '-m', 'Primero. Con detalle.')
    await mkdir(join(repo, 'docs', 'respuestas'), { recursive: true })
    await writeFile(join(repo, 'docs', 'respuestas', 'Q-1.md'), '# Q-1\n')
    const a = armado(repo)
    expect(a.sinGuardar).toBe(false)
    expect(a.cambios).toEqual([
      { commit: a.commit, fecha: expect.any(Number), mensaje: 'Primero. Con detalle.' },
    ])
    await writeFile(join(repo, 'a.ts'), 'export const x = 1\n')
    expect(armado(repo).sinGuardar).toBe(true)
  })
})
