// T-89 (D-202) — Las respuestas a las preguntas se suben solas: el commit lleva solo esas respuestas (y sus imágenes),
// no separa las dos PC, y lo que no pudo subir se reintenta. Con repositorios de verdad (un remoto en una carpeta y dos
// clones) y la fila que junta y reintenta.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SubidaDeRespuestas } from '../src/main/app/subida'
import { type SubidaRespuestas, subirRespuestas, traerDelRemoto } from '../src/main/infra/sincronia'

describe('subir las respuestas, con repositorios de verdad', { timeout: 20_000 }, () => {
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
  const commit = async (carpeta: string, ruta: string, texto: string, mensaje: string) => {
    await escribir(carpeta, ruta, texto)
    git(carpeta, 'add', '--all')
    git(carpeta, 'commit', '-q', '-m', mensaje)
  }
  const ultimoEnLaNube = () => git(nube, 'log', '-1', '--format=%s', 'main')
  const archivosDelUltimo = (carpeta: string) =>
    git(carpeta, 'show', '--name-only', '--format=', 'HEAD').split('\n').filter(Boolean).sort()

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-t89-'))
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

  it('sube solo la respuesta y sus imágenes; lo demás queda como estaba', async () => {
    await escribir(estaPc, 'docs/respuestas/Q-10.md', '# Q-10 — ¿Cómo?\n\n**Opción:** A) Así\n')
    await escribir(estaPc, 'docs/respuestas/Q-10/captura.png', 'png')
    // Otros cambios del usuario: uno sin preparar y otro preparado. Ninguno entra en el commit.
    await escribir(estaPc, 'docs/estado.md', 'a medio escribir\n')
    await escribir(estaPc, 'notas.md', 'preparado\n')
    git(estaPc, 'add', 'notas.md')

    const r = await subirRespuestas(estaPc, ['Q-10'])
    expect(r).toEqual({ resultado: 'subida', motivo: null, mensaje: 'Respuesta a Q-10' })
    expect(ultimoEnLaNube()).toBe('Respuesta a Q-10')
    expect(archivosDelUltimo(estaPc)).toEqual(['docs/respuestas/Q-10.md', 'docs/respuestas/Q-10/captura.png'])
    // (`git` recorta el espacio del principio: « M docs/estado.md».)
    expect(git(estaPc, 'status', '--porcelain')).toBe('M docs/estado.md\nA  notas.md')

    // La otra PC la trae sola.
    expect((await traerDelRemoto(otraPc))?.resultado).toBe('bajado')
    expect(existsSync(join(otraPc, 'docs', 'respuestas', 'Q-10.md'))).toBe(true)
  })

  it('varias respuestas van en un commit; lo ya guardado no hace nada', async () => {
    await escribir(estaPc, 'docs/respuestas/Q-3.md', '# Q-3 — a\n')
    await escribir(estaPc, 'docs/respuestas/Q-4.md', '# Q-4 — b\n')
    expect((await subirRespuestas(estaPc, ['Q-4', 'Q-3'])).mensaje).toBe('Respuestas a Q-3 y Q-4')
    expect(await subirRespuestas(estaPc, ['Q-3', 'Q-4'])).toEqual({ resultado: 'nada', motivo: null })
    // Corregida: otro commit.
    await escribir(estaPc, 'docs/respuestas/Q-3.md', '# Q-3 — a\n\n**Opción:** B) otra\n')
    expect((await subirRespuestas(estaPc, ['Q-3'])).resultado).toBe('subida')
    expect(git(nube, 'rev-list', '--count', 'main')).toBe('3')
  })

  it('si GitHub tiene algo nuevo que se pone encima, lo trae antes y sube', async () => {
    await commit(otraPc, 'docs/trabajo.md', 'de la otra\n', 'Desde la otra PC')
    git(otraPc, 'push', '-q')
    await escribir(estaPc, 'docs/respuestas/Q-5.md', '# Q-5 — c\n')
    expect((await subirRespuestas(estaPc, ['Q-5'])).resultado).toBe('subida')
    expect(git(nube, 'log', '--format=%s', 'main').split('\n')).toEqual([
      'Respuesta a Q-5',
      'Desde la otra PC',
      'Primero',
    ])
  })

  it('con las dos PC separadas no hace el commit: espera a Sincronizar', async () => {
    await commit(otraPc, 'docs/trabajo.md', 'de la otra\n', 'Desde la otra PC')
    git(otraPc, 'push', '-q')
    await commit(estaPc, 'docs/ideas.md', 'de esta\n', 'De esta PC')
    await escribir(estaPc, 'docs/respuestas/Q-6.md', '# Q-6 — d\n')
    const r = await subirRespuestas(estaPc, ['Q-6'])
    expect(r.resultado).toBe('esperar')
    expect(r.motivo).toContain('Sincronizar')
    expect(git(estaPc, 'log', '-1', '--format=%s')).toBe('De esta PC')
    expect(git(estaPc, 'status', '--porcelain', '--untracked-files=all')).toBe('?? docs/respuestas/Q-6.md')
  })

  it('sin remoto, sin git o con la rama fuera del remoto, no toca nada', async () => {
    const sola = join(base, 'sola')
    git(base, 'init', '-q', '-b', 'main', sola)
    await commit(sola, 'a.md', 'a\n', 'a')
    await escribir(sola, 'docs/respuestas/Q-1.md', '# Q-1 — x\n')
    expect((await subirRespuestas(sola, ['Q-1'])).resultado).toBe('sin-remoto')
    expect(git(sola, 'rev-list', '--count', 'HEAD')).toBe('1')
    expect((await subirRespuestas(join(base, 'no-existe'), ['Q-1'])).resultado).toBe('sin-remoto')
    git(estaPc, 'checkout', '-q', '-b', 'otra-rama')
    await escribir(estaPc, 'docs/respuestas/Q-1.md', '# Q-1 — x\n')
    expect((await subirRespuestas(estaPc, ['Q-1'])).resultado).toBe('sin-remoto')
  })

  it('sin conexión con el remoto, no hace el commit', async () => {
    git(estaPc, 'remote', 'set-url', 'origin', join(base, 'no-esta.git'))
    await escribir(estaPc, 'docs/respuestas/Q-7.md', '# Q-7 — e\n')
    expect((await subirRespuestas(estaPc, ['Q-7'])).resultado).toBe('esperar')
    expect(git(estaPc, 'rev-list', '--count', 'HEAD')).toBe('1')
  })
})

describe('la fila que junta y reintenta', () => {
  const ok = (mensaje: string): SubidaRespuestas => ({ resultado: 'subida', motivo: null, mensaje })

  it('junta las respuestas seguidas en una sola subida', async () => {
    vi.useFakeTimers()
    try {
      const subidas: string[][] = []
      const alSubir: string[] = []
      const f = new SubidaDeRespuestas(
        {
          subir: async (_r, qs) => {
            subidas.push([...qs])
            return ok('x')
          },
          ocupado: async () => false,
          registrar: () => {},
          alSubir: (r) => alSubir.push(r),
        },
        100,
        1000,
      )
      f.anotar('Alfa', 'Q-1')
      await vi.advanceTimersByTimeAsync(60)
      f.anotar('Alfa', 'Q-2')
      await vi.advanceTimersByTimeAsync(60)
      expect(subidas).toEqual([])
      await vi.advanceTimersByTimeAsync(60)
      expect(subidas).toEqual([['Q-1', 'Q-2']])
      expect(alSubir).toEqual(['Alfa'])
      expect(f.pendientes('Alfa')).toEqual([])
      f.cerrar()
    } finally {
      vi.useRealTimers()
    }
  })

  it('con la IA trabajando o sin poder subir, reintenta; al terminar el turno, enseguida', async () => {
    vi.useFakeTimers()
    try {
      let ocupado = true
      let resultado: SubidaRespuestas = { resultado: 'esperar', motivo: 'sin conexión' }
      const subidas: string[][] = []
      const f = new SubidaDeRespuestas(
        {
          subir: async (_r, qs) => {
            subidas.push([...qs])
            return resultado
          },
          ocupado: async () => ocupado,
          registrar: () => {},
        },
        100,
        1000,
      )
      f.anotar('Alfa', 'Q-1')
      await vi.advanceTimersByTimeAsync(150)
      expect(subidas).toEqual([])
      // Terminó el turno de la IA: prueba enseguida, pero sin conexión queda para después.
      ocupado = false
      f.reintentar('Alfa')
      await vi.advanceTimersByTimeAsync(150)
      expect(subidas).toEqual([['Q-1']])
      expect(f.pendientes('Alfa')).toEqual(['Q-1'])
      resultado = ok('Respuesta a Q-1')
      await vi.advanceTimersByTimeAsync(1000)
      expect(subidas).toEqual([['Q-1'], ['Q-1']])
      expect(f.pendientes('Alfa')).toEqual([])
      // Sin nada pendiente, terminar el turno no sube nada.
      f.reintentar('Alfa')
      await vi.advanceTimersByTimeAsync(1000)
      expect(subidas.length).toBe(2)
      f.cerrar()
    } finally {
      vi.useRealTimers()
    }
  })

  it('una respuesta corregida mientras sube la anterior se sube después', async () => {
    vi.useFakeTimers()
    try {
      const subidas: string[][] = []
      let soltar = () => {}
      const f = new SubidaDeRespuestas(
        {
          subir: async (_r, qs) => {
            subidas.push([...qs])
            if (subidas.length === 1) await new Promise<void>((c) => (soltar = c))
            return ok('x')
          },
          ocupado: async () => false,
          registrar: () => {},
        },
        100,
        1000,
      )
      f.anotar('Alfa', 'Q-1')
      await vi.advanceTimersByTimeAsync(150)
      f.anotar('Alfa', 'Q-1')
      soltar()
      await vi.advanceTimersByTimeAsync(150)
      expect(subidas).toEqual([['Q-1'], ['Q-1']])
      f.cerrar()
    } finally {
      vi.useRealTimers()
    }
  })

  it('al cerrar Iridium sube lo que esperaba juntarse', async () => {
    const subidas: string[][] = []
    const f = new SubidaDeRespuestas(
      {
        subir: async (_r, qs) => {
          subidas.push([...qs])
          return ok('x')
        },
        ocupado: async () => false,
        registrar: () => {},
      },
      60_000,
      60_000,
    )
    f.anotar('Alfa', 'Q-1')
    f.anotar('Beta', 'Q-2')
    await f.subirTodo()
    expect(subidas).toEqual([['Q-1'], ['Q-2']])
    f.cerrar()
  })
})
