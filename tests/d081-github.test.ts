// D-081 — Crear el repositorio y publicarlo en GitHub desde la sección Git: las reglas (el nombre, qué queda afuera)
// y lo que hace con repositorios de verdad en carpetas temporales. GitHub es el falso: un repositorio en otra carpeta.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { esNombreRepo, nombreRepoDe } from '../src/compartido/github'
import { agregarAGitignore, avisoDeAfuera, bloqueGitignore, tieneClaves } from '../src/main/core/github'
import { leerGit } from '../src/main/infra/git'
import { githubFalso, inicializarRepo, publicarRepo } from '../src/main/infra/github'

describe('reglas para crear y publicar', () => {
  it('propone un nombre que GitHub acepta a partir de la carpeta', () => {
    expect(nombreRepoDe('Centro de Desarrollo')).toBe('Centro-de-Desarrollo')
    expect(nombreRepoDe('Canción  ñandú')).toBe('Cancion-nandu')
    expect(nombreRepoDe('  ¿?  ')).toBe('proyecto')
    expect(esNombreRepo('Alfa')).toBe(true)
    expect(esNombreRepo('mi repo')).toBe(false)
    expect(esNombreRepo('..')).toBe(false)
    expect(esNombreRepo('a'.repeat(101))).toBe(false)
  })

  it('reconoce los archivos con claves, menos los de ejemplo', () => {
    for (const r of ['.env', 'api/.env.local', 'cert.pem', 'firma.key', 'x.pfx', '.ssh/id_ed25519'])
      expect(tieneClaves(r), r).toBe(true)
    for (const r of ['.env.example', '.env.sample', 'key.ts', 'docs/env.md', 'id_rsa.pub'])
      expect(tieneClaves(r), r).toBe(false)
  })

  it('arma el bloque del .gitignore y el aviso', () => {
    expect(bloqueGitignore(false, [])).toBeNull()
    const b = bloqueGitignore(true, ['.env'])
    expect(b).toContain('node_modules/\n/.env\n')
    expect(agregarAGitignore('dist', b ?? '')).toMatch(/^dist\n\n# Lo agregó Iridium/)
    expect(avisoDeAfuera([])).toBeNull()
    expect(avisoDeAfuera(['a', 'b', 'c', 'd', 'e'])).toContain('a, b, c y 2 más')
  })
})

describe('crear el repositorio y publicarlo', () => {
  let raiz: string
  let nube: string
  const git = (...args: string[]) => execFileSync('git', args, { cwd: raiz, encoding: 'utf8' }).trim()

  beforeEach(async () => {
    raiz = await mkdtemp(join(tmpdir(), 'iridium-d081-'))
    nube = await mkdtemp(join(tmpdir(), 'iridium-d081-nube-'))
    // El primer commit necesita un nombre: el de la PC de prueba puede no tenerlo.
    process.env.GIT_AUTHOR_NAME = 'Prueba'
    process.env.GIT_AUTHOR_EMAIL = 'p@x'
    process.env.GIT_COMMITTER_NAME = 'Prueba'
    process.env.GIT_COMMITTER_EMAIL = 'p@x'
    await mkdir(join(raiz, 'src'), { recursive: true })
    await mkdir(join(raiz, 'node_modules', 'react'), { recursive: true })
    await writeFile(join(raiz, 'src', 'app.ts'), 'export const a = 1\n')
    await writeFile(join(raiz, 'node_modules', 'react', 'index.js'), '//\n')
    await writeFile(join(raiz, '.env'), 'CLAVE=secreta\n')
    await writeFile(join(raiz, '.env.example'), 'CLAVE=\n')
  })
  afterEach(async () => {
    for (const k of ['GIT_AUTHOR_NAME', 'GIT_AUTHOR_EMAIL', 'GIT_COMMITTER_NAME', 'GIT_COMMITTER_EMAIL'])
      delete process.env[k]
    await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
    await rm(nube, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  })

  it('crea el repositorio con un primer commit, sin dependencias ni claves', async () => {
    const r = await inicializarRepo(raiz)
    expect(r).toEqual({
      tipo: 'ok',
      aviso: 'Quedaron afuera porque suelen tener claves: .env (están en el .gitignore).',
      web: null,
    })
    expect(git('branch', '--show-current')).toBe('main')
    expect(git('log', '--format=%s')).toBe('Primer commit')
    const guardados = git('ls-files').split('\n')
    expect(guardados).toEqual(expect.arrayContaining(['.env.example', '.gitignore', 'src/app.ts']))
    expect(guardados).not.toContain('.env')
    expect(guardados.some((x) => x.startsWith('node_modules'))).toBe(false)
    expect(await readFile(join(raiz, '.gitignore'), 'utf8')).toContain('node_modules/\n/.env\n')
    expect(git('status', '--porcelain')).toBe('')
    // Si ya tiene repositorio, no hace nada.
    expect(await inicializarRepo(raiz)).toMatchObject({ tipo: 'error' })
  })

  it('respeta el .gitignore que ya había y no lo toca si no hace falta', async () => {
    await rm(join(raiz, '.env'))
    await writeFile(join(raiz, '.gitignore'), 'node_modules\n')
    expect(await inicializarRepo(raiz)).toEqual({ tipo: 'ok', aviso: null, web: null })
    expect(await readFile(join(raiz, '.gitignore'), 'utf8')).toBe('node_modules\n')
  })

  it('publica: crea el repositorio en GitHub, lo pone como origin y sube la rama', async () => {
    await inicializarRepo(raiz)
    const github = githubFalso(nube)
    expect(await github.cuenta()).toEqual({ tipo: 'ok', usuario: 'prueba' })
    const r = await publicarRepo(raiz, { nombre: 'Alfa', privado: true }, github)
    expect(r).toEqual({ tipo: 'ok', aviso: null, web: 'https://github.com/prueba/Alfa' })
    expect(git('remote', 'get-url', 'origin')).toBe('https://github.com/prueba/Alfa.git')
    expect(git('rev-parse', '--abbrev-ref', '@{u}')).toBe('origin/main')
    const subido = execFileSync('git', ['--git-dir', join(nube, 'Alfa.git'), 'log', '--format=%s', 'main'], {
      encoding: 'utf8',
    })
    expect(subido.trim()).toBe('Primer commit')
    // La sección Git lo muestra en GitHub y al día.
    const g = await leerGit(raiz)
    expect(g.tipo === 'ok' && g.remoto).toMatchObject({ tipo: 'remoto', github: true, nombre: 'prueba/Alfa' })
    expect(g.tipo === 'ok' && g.remoto.tipo === 'remoto' && g.remoto.sinSubir).toBe(0)
    // Ya publicado, no se vuelve a publicar.
    expect(await publicarRepo(raiz, { nombre: 'Otro', privado: true }, github)).toMatchObject({
      tipo: 'error',
      mensaje: 'El repositorio ya está publicado en otro lado.',
    })
  })

  it('no publica sin repositorio, sin commits, con un nombre inválido o uno que ya existe', async () => {
    const github = githubFalso(nube)
    expect(await publicarRepo(raiz, { nombre: 'Alfa', privado: true }, github)).toMatchObject({
      mensaje: 'El proyecto no tiene repositorio.',
    })
    git('init', '-q', '-b', 'main')
    expect(await publicarRepo(raiz, { nombre: 'Alfa', privado: true }, github)).toMatchObject({
      mensaje: 'Todavía no tiene commits: no hay nada para publicar.',
    })
    git('commit', '-q', '--allow-empty', '--no-gpg-sign', '-m', 'uno')
    expect(await publicarRepo(raiz, { nombre: 'mi repo', privado: true }, github)).toMatchObject({
      tipo: 'error',
    })
    expect(await publicarRepo(raiz, { nombre: 'existe', privado: false }, github)).toMatchObject({
      mensaje: 'Ya tenés un repositorio que se llama «existe» en GitHub.',
    })
    // Lo que falló no dejó un remoto a medias.
    expect(git('remote')).toBe('')
  })
})
