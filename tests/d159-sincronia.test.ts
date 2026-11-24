// D-159 — Iridium se mantiene al día con GitHub y la sección Git hace Commit y subir y Sincronizar: las reglas, lo que
// hace con repositorios de verdad (un remoto en una carpeta y dos clones: esta PC y la otra) y la vigía que trae sola.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { SincroniaGit } from '../src/compartido/puente'
import { mensajeSugerido, textoDeSincronia } from '../src/compartido/sincronia'
import { VigiaSincronia } from '../src/main/app/sincronia'
import { ladosDe, motivoAlGuardar, motivoAlJuntar, motivoDeRed, queTraer } from '../src/main/core/sincronia'
import { leerGit } from '../src/main/infra/git'
import { guardarYSubir, sincronizar, traerDelRemoto } from '../src/main/infra/sincronia'

describe('reglas de la sincronización', () => {
  it('trae solo si esta PC no tiene commits propios', () => {
    expect(queTraer(0, 0)).toBe('al-dia')
    expect(queTraer(2, 0)).toBe('al-dia')
    expect(queTraer(0, 3)).toBe('traer')
    expect(queTraer(1, 3)).toBe('separada')
    expect(ladosDe('1\t3\n')).toEqual({ adelante: 1, atras: 3 })
    expect(ladosDe('nada')).toBeNull()
  })

  it('propone el mensaje: las respuestas por su Q-n, o los archivos', () => {
    expect(mensajeSugerido([])).toBe('')
    expect(mensajeSugerido([{ ruta: 'docs/respuestas/Q-10.md' }])).toBe('Respuesta a Q-10')
    expect(
      mensajeSugerido([
        { ruta: 'docs/respuestas/Q-12.md' },
        { ruta: 'docs/respuestas/Q-9.md' },
        { ruta: 'docs/respuestas/Q-12/captura.png' },
      ]),
    ).toBe('Respuestas a Q-9 y Q-12')
    expect(mensajeSugerido([{ ruta: 'docs/estado.md' }, { ruta: 'docs/trabajo.md' }])).toBe(
      'Cambios en estado.md y trabajo.md',
    )
    expect(mensajeSugerido(['a', 'b', 'c', 'd'].map((r) => ({ ruta: r })))).toBe('Cambios en 4 archivos')
  })

  it('dice lo que contestó git en palabras del usuario', () => {
    expect(motivoDeRed('fatal: unable to access ...: Could not resolve host: github.com').resultado).toBe(
      'sin-conexion',
    )
    expect(motivoDeRed('fatal: could not read Username for https://github.com').motivo).toContain(
      'sesión de GitHub',
    )
    expect(motivoAlJuntar('error: Your local changes to the following files would be overwritten')).toContain(
      'haz el commit primero',
    )
    expect(motivoAlJuntar('CONFLICT (content): Merge conflict in a.md')).toContain('Pídele a la IA')
    expect(motivoAlGuardar('*** Please tell me who you are.')).toContain('no sabe tu nombre')
    const s: SincroniaGit = { cuando: 0, resultado: 'bajado', bajados: 2, motivo: null }
    expect(textoDeSincronia(s, 'GitHub', 'hace 2 min')).toBe('Trajo 2 commits de GitHub hace 2 min')
    expect(textoDeSincronia({ ...s, resultado: 'al-dia' }, 'GitHub', 'recién')).toBe('Revisado recién')
  })
})

// T-129: con toda la suite en paralelo, cada git tarda más; solas pasan en 1–2 s.
describe('con repositorios de verdad', { timeout: 20_000 }, () => {
  let base: string
  let nube: string
  let estaPc: string
  let otraPc: string
  const git = (cwd: string, ...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
  const escribir = async (carpeta: string, ruta: string, texto: string) => {
    const real = join(carpeta, ...ruta.split('/'))
    await mkdir(join(real, '..'), { recursive: true })
    await writeFile(real, texto)
  }
  /** El `estado.md` de esta PC, sin los fines de línea de Windows que pone git al traerlo. */
  const estado = async () =>
    (await readFile(join(estaPc, 'docs', 'estado.md'), 'utf8')).replace(/\r\n/g, '\n')
  const commit = async (carpeta: string, ruta: string, texto: string, mensaje: string) => {
    await escribir(carpeta, ruta, texto)
    git(carpeta, 'add', '--all')
    git(carpeta, 'commit', '-q', '-m', mensaje)
  }

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-d159-'))
    nube = join(base, 'nube.git')
    estaPc = join(base, 'esta')
    otraPc = join(base, 'otra')
    process.env.GIT_AUTHOR_NAME = 'Prueba'
    process.env.GIT_AUTHOR_EMAIL = 'p@x'
    process.env.GIT_COMMITTER_NAME = 'Prueba'
    process.env.GIT_COMMITTER_EMAIL = 'p@x'
    git(base, 'init', '-q', '--bare', '-b', 'main', nube)
    git(base, 'clone', '-q', nube, estaPc)
    git(estaPc, 'checkout', '-q', '-b', 'main')
    await commit(estaPc, 'docs/estado.md', 'uno\n', 'Primero')
    git(estaPc, 'push', '-q', '-u', 'origin', 'main')
    git(base, 'clone', '-q', nube, otraPc)
  })
  afterEach(async () => {
    for (const k of ['GIT_AUTHOR_NAME', 'GIT_AUTHOR_EMAIL', 'GIT_COMMITTER_NAME', 'GIT_COMMITTER_EMAIL'])
      delete process.env[k]
    await rm(base, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  })

  it('trae sola lo que se subió desde la otra PC', async () => {
    await commit(otraPc, 'docs/estado.md', 'dos\n', 'Desde la otra PC')
    git(otraPc, 'push', '-q')
    const r = await traerDelRemoto(estaPc, 5)
    expect(r).toEqual({ cuando: 5, resultado: 'bajado', bajados: 1, motivo: null })
    expect(await estado()).toBe('dos\n')
    expect((await traerDelRemoto(estaPc, 6))?.resultado).toBe('al-dia')
  })

  it('no toca nada si esta PC tiene commits propios o cambios sin guardar en lo que viene', async () => {
    await commit(otraPc, 'docs/estado.md', 'dos\n', 'Desde la otra PC')
    git(otraPc, 'push', '-q')
    // Cambios sin guardar en el mismo archivo: no se pisan.
    await escribir(estaPc, 'docs/estado.md', 'mío sin guardar\n')
    const choca = await traerDelRemoto(estaPc)
    expect(choca?.resultado).toBe('choca')
    expect(await estado()).toBe('mío sin guardar\n')
    // Un commit propio: se avisa, no se junta solo.
    git(estaPc, 'checkout', '--', '.')
    await commit(estaPc, 'docs/trabajo.md', 'x\n', 'De esta PC')
    expect((await traerDelRemoto(estaPc))?.resultado).toBe('separada')
    expect(git(estaPc, 'log', '-1', '--format=%s')).toBe('De esta PC')
  })

  it('sin remoto, o con la rama fuera del remoto, no hay nada que traer', async () => {
    const sola = join(base, 'sola')
    git(base, 'init', '-q', '-b', 'main', sola)
    await commit(sola, 'a.md', 'a\n', 'a')
    expect(await traerDelRemoto(sola)).toBeNull()
    git(estaPc, 'checkout', '-q', '-b', 'otra-rama')
    expect(await traerDelRemoto(estaPc)).toBeNull()
    expect(await traerDelRemoto(join(base, 'no-existe'))).toBeNull()
  })

  it('Commit y subir guarda todo y lo sube; lo ve la otra PC al traer', async () => {
    await escribir(otraPc, 'docs/respuestas/Q-10.md', '# Q-10 — ¿Cómo?\n\n**Opción:** A)\n')
    const r = await guardarYSubir(otraPc, 'Respuesta a Q-10', true)
    expect(r).toEqual({ tipo: 'ok', aviso: 'Commit hecho. Sincronizado: subió 1 commit.', web: null })
    expect(git(nube, 'log', '-1', '--format=%s', 'main')).toBe('Respuesta a Q-10')
    const g = await leerGit(otraPc)
    expect(g.tipo === 'ok' && g.cambios.length).toBe(0)
    expect((await traerDelRemoto(estaPc))?.resultado).toBe('bajado')
    expect(existsSync(join(estaPc, 'docs', 'respuestas', 'Q-10.md'))).toBe(true)
  })

  it('con archivos preparados, el commit lleva solo esos (como VS Code)', async () => {
    await escribir(estaPc, 'a.md', 'a\n')
    await escribir(estaPc, 'b.md', 'b\n')
    git(estaPc, 'add', 'a.md')
    expect((await guardarYSubir(estaPc, 'Solo a', false)).tipo).toBe('ok')
    expect(git(estaPc, 'show', '--name-only', '--format=', 'HEAD')).toBe('a.md')
    expect(git(estaPc, 'status', '--porcelain')).toBe('?? b.md')
    expect((await guardarYSubir(estaPc, '   ', false)).tipo).toBe('error')
  })

  it('Sincronizar junta los commits de las dos PC y sube', async () => {
    await commit(otraPc, 'docs/trabajo.md', 'de la otra\n', 'Otra')
    git(otraPc, 'push', '-q')
    await commit(estaPc, 'docs/ideas.md', 'de esta\n', 'Esta')
    const r = await sincronizar(estaPc)
    expect(r).toEqual({ tipo: 'ok', aviso: 'Sincronizado: trajo 1 commit y subió 2 commits.', web: null })
    expect(git(nube, 'show', 'main:docs/trabajo.md')).toBe('de la otra')
    expect(git(nube, 'show', 'main:docs/ideas.md')).toBe('de esta')
    expect(await sincronizar(estaPc)).toEqual({ tipo: 'ok', aviso: null, web: null })
  })

  it('si las dos PC cambiaron las mismas líneas, no deja nada a medias', async () => {
    await commit(otraPc, 'docs/estado.md', 'de la otra\n', 'Otra')
    git(otraPc, 'push', '-q')
    await commit(estaPc, 'docs/estado.md', 'de esta\n', 'Esta')
    const r = await sincronizar(estaPc)
    expect(r.tipo).toBe('error')
    expect(r.tipo === 'error' && r.mensaje).toContain('Pídele a la IA')
    expect(existsSync(join(estaPc, '.git', 'MERGE_HEAD'))).toBe(false)
    expect(git(estaPc, 'status', '--porcelain')).toBe('')
    expect(await estado()).toBe('de esta\n')
  })

  it('una rama que no está en el remoto se sube y queda siguiéndolo', async () => {
    git(estaPc, 'checkout', '-q', '-b', 'nueva')
    await commit(estaPc, 'n.md', 'n\n', 'Nueva')
    expect(await sincronizar(estaPc)).toEqual({ tipo: 'ok', aviso: 'La rama nueva quedó subida.', web: null })
    expect(git(estaPc, 'rev-parse', '--abbrev-ref', '@{u}')).toBe('origin/nueva')
  })
})

describe('la vigía que trae sola', () => {
  const estado = (resultado: SincroniaGit['resultado'], cuando = 0): SincroniaGit => ({
    cuando,
    resultado,
    bajados: resultado === 'bajado' ? 1 : 0,
    motivo: null,
  })

  it('mira de a uno, salta los ocupados y avisa cuando trajo algo', async () => {
    const mirados: string[] = []
    const trajo: string[] = []
    let ahora = 1000
    const v = new VigiaSincronia({
      proyectos: async () => ['Alfa', 'Beta', 'Gamma'],
      traer: async (r) => {
        mirados.push(r)
        return r === 'Gamma' ? null : estado(r === 'Alfa' ? 'bajado' : 'al-dia', ahora)
      },
      ocupado: async (r) => r === 'Beta',
      ahora: () => ahora,
      registrar: () => {},
      alTraer: (r) => trajo.push(r),
    })
    await v.vuelta()
    expect(mirados).toEqual(['Alfa', 'Gamma'])
    expect(trajo).toEqual(['Alfa'])
    expect(v.de('Alfa')?.resultado).toBe('bajado')
    expect(v.de('Gamma')).toBeNull()
    // Al entrar a Alfa enseguida no se vuelve a mirar; pasado un minuto, sí.
    await v.revisar('Alfa')
    expect(mirados).toEqual(['Alfa', 'Gamma'])
    ahora += 61_000
    await v.revisar('Alfa')
    expect(mirados).toEqual(['Alfa', 'Gamma', 'Alfa'])
    v.cerrar()
  })
})
