// T-77 (D-136, R-80): la grilla va por el último cambio de cada proyecto: el último commit o lo último escrito en su
// `docs/`, lo más reciente de los dos. Con carpetas temporales y el git del sistema.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { leerUltimoCambio } from '../src/main/infra/ultimo-cambio'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'iridium-t77-'))
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

async function archivo(ruta: string, segundos: number) {
  await mkdir(join(dir, ruta, '..'), { recursive: true })
  await writeFile(join(dir, ruta), 'x')
  await utimes(join(dir, ruta), segundos, segundos)
}

function commit(segundos: number) {
  const fecha = `${segundos} +0000`
  const env = { ...process.env, GIT_AUTHOR_DATE: fecha, GIT_COMMITTER_DATE: fecha }
  const git = (...args: string[]) => execFileSync('git', args, { cwd: dir, env, stdio: 'ignore' })
  git('init', '-q')
  git('add', '-A')
  git('-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.com', 'commit', '-q', '-m', 'uno')
}

describe('el último cambio de un proyecto (D-136)', () => {
  it('sin git, el archivo más reciente de docs/, también en sus subcarpetas; lo de afuera de docs/ no cuenta', async () => {
    await archivo('docs/estado.md', 1_700_000_000)
    await archivo('docs/modulos/ideas/estado.md', 1_700_000_500)
    await archivo('src/main.ts', 1_800_000_000)
    expect(await leerUltimoCambio(dir)).toBe(1_700_000_500_000)
  })

  it('con git, el último commit si es más reciente que docs/; si no, docs/ (lo que la IA escribió sin commitear)', async () => {
    await archivo('docs/estado.md', 1_700_000_000)
    commit(1_750_000_000)
    expect(await leerUltimoCambio(dir)).toBe(1_750_000_000_000)
    await utimes(join(dir, 'docs/estado.md'), 1_760_000_000, 1_760_000_000)
    expect(await leerUltimoCambio(dir)).toBe(1_760_000_000_000)
  })

  it('sin git ni docs/, ninguno', async () => {
    await archivo('notas.txt', 1_700_000_000)
    expect(await leerUltimoCambio(dir)).toBeNull()
  })
})
