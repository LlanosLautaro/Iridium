// I-5 — Git del proyecto (H-16): las reglas que entienden lo que dice git y la lectura de repositorios de verdad en
// carpetas temporales (con el `git` del sistema). Solo lectura: nada de lo que se pide cambia el repositorio.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, stat, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  archivosDe,
  diferenciaDe,
  diferenciaDeNuevo,
  dondeEsta,
  esHashValido,
  estadoDe,
  historialDe,
  lineasDeTexto,
  remotoElegido,
} from '../src/main/core/git'
import { leerCommit, leerDiferencia, leerGit } from '../src/main/infra/git'

describe('reglas de git', () => {
  it('entiende el historial con los coautores y los archivos tocados', () => {
    const salida =
      '\x1eaaaa111\x1faaaa1\x1fLautaro\x1f1761700000\x1fI-5: Git\x1fClaude Opus 5.5 <noreply@anthropic.com>\n\n 3 files changed, 10 insertions(+)\n' +
      '\x1ebbbb222\x1fbbbb2\x1fLautaro\x1f1761600000\x1fUn merge\x1f\n'
    const h = historialDe(salida)
    expect(h).toHaveLength(2)
    expect(h[0]).toMatchObject({
      corto: 'aaaa1',
      mensaje: 'I-5: Git',
      coautores: ['Claude Opus 5.5'],
      archivos: 3,
      fecha: 1761700000000,
    })
    expect(h[1]).toMatchObject({ archivos: 0, coautores: [] })
  })

  it('entiende el estado: nuevo, modificado, borrado, sin seguir', () => {
    const e = estadoDe(' M docs/estado.md\0A  nuevo.ts\0 D viejo.ts\0?? con espacio ñ.md\0')
    expect(e).toEqual([
      { ruta: 'docs/estado.md', cambio: 'modificado', sinSeguir: false, preparado: false },
      { ruta: 'nuevo.ts', cambio: 'nuevo', sinSeguir: false, preparado: true },
      { ruta: 'viejo.ts', cambio: 'borrado', sinSeguir: false, preparado: false },
      { ruta: 'con espacio ñ.md', cambio: 'nuevo', sinSeguir: true, preparado: false },
    ])
  })

  it('junta letras y números de un commit; un binario va sin números', () => {
    const a = archivosDe('M\0a.ts\0A\0img.png\0D\0b.ts\0', '3\t1\ta.ts\0-\t-\timg.png\x000\t7\tb.ts\0')
    expect(a).toEqual([
      { ruta: 'a.ts', cambio: 'modificado', mas: 3, menos: 1 },
      { ruta: 'img.png', cambio: 'nuevo', mas: null, menos: null },
      { ruta: 'b.ts', cambio: 'borrado', mas: 0, menos: 7 },
    ])
  })

  it('arma el antes y después con los números de línea', () => {
    const d = diferenciaDe(
      'diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -2,3 +2,3 @@ function f\n uno\n-dos\n+DOS\n tres\n\\ No newline at end of file\n',
    )
    expect(d).toEqual({
      tipo: 'texto',
      cortada: false,
      lineas: [
        { tipo: 'tramo', texto: 'function f', viejo: null, nuevo: null },
        { tipo: 'igual', texto: 'uno', viejo: 2, nuevo: 2 },
        { tipo: 'quitada', texto: 'dos', viejo: 3, nuevo: null },
        { tipo: 'agregada', texto: 'DOS', viejo: null, nuevo: 3 },
        { tipo: 'igual', texto: 'tres', viejo: 4, nuevo: 4 },
      ],
    })
    expect(diferenciaDe('diff --git a/i b/i\nBinary files a/i and b/i differ\n')).toEqual({ tipo: 'binario' })
    expect(diferenciaDe('')).toEqual({ tipo: 'vacia' })
  })

  it('un archivo nuevo es todo agregado', () => {
    const d = diferenciaDeNuevo('a\r\nb\n')
    expect(d.tipo === 'texto' && d.lineas.map((l) => [l.tipo, l.texto, l.nuevo])).toEqual([
      ['tramo', 'archivo nuevo', null],
      ['agregada', 'a', 1],
      ['agregada', 'b', 2],
    ])
    expect(lineasDeTexto('a\nb\n')).toBe(2)
    expect(lineasDeTexto('a\nb')).toBe(2)
    expect(lineasDeTexto('')).toBe(0)
  })

  it('reconoce GitHub sin mostrar usuario ni clave, y elige origin', () => {
    const r = remotoElegido(
      'otro\thttps://x.com/a/b.git (fetch)\norigin\thttps://LlanosLautaro:ghp_secreto@github.com/LlanosLautaro/Delta.git (fetch)\norigin\thttps://github.com/LlanosLautaro/Delta.git (push)\n',
    )
    expect(r?.nombre).toBe('origin')
    const d = dondeEsta(r?.url ?? '')
    expect(d).toEqual({
      github: true,
      nombre: 'LlanosLautaro/Delta',
      web: 'https://github.com/LlanosLautaro/Delta',
    })
    expect(JSON.stringify(d)).not.toContain('secreto')
    expect(dondeEsta('git@github.com:dueño-x/repo.git')).toMatchObject({ github: true })
    expect(dondeEsta('ssh://git@github.com/a/b.git')).toMatchObject({ github: true, nombre: 'a/b' })
    expect(dondeEsta('https://gitlab.com/a/b.git')).toEqual({
      github: false,
      nombre: 'gitlab.com/a/b',
      web: null,
    })
    expect(remotoElegido('')).toBeNull()
  })

  it('un commit pedido por la ventana solo puede ser hexadecimal', () => {
    expect(esHashValido('a1b2c3d')).toBe(true)
    expect(esHashValido('--output=x')).toBe(false)
    expect(esHashValido('HEAD')).toBe(false)
  })
})

describe('leer el git de un proyecto', () => {
  let carpeta: string
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'core.autocrlf=false', ...args], {
      cwd: carpeta,
      encoding: 'utf8',
      env: { ...process.env, LC_ALL: 'C' },
    })
  const escribir = async (ruta: string, texto: string | Buffer) => {
    await mkdir(join(carpeta, ruta, '..'), { recursive: true })
    await writeFile(join(carpeta, ruta), texto)
  }
  const commit = (mensaje: string) =>
    git('-c', 'user.name=Lautaro', '-c', 'user.email=l@x', 'commit', '-q', '--no-gpg-sign', '-m', mensaje)

  beforeEach(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'iridium-git-'))
  })
  afterEach(async () => {
    await rm(carpeta, { recursive: true, force: true })
  })

  it('una carpeta sin repositorio propio lo dice', async () => {
    expect(await leerGit(carpeta)).toEqual({ tipo: 'sin-git' })
  })

  it('un repositorio sin commits muestra los archivos nuevos', async () => {
    git('init', '-q', '-b', 'main')
    await escribir('a.md', 'uno\ndos\n')
    const g = await leerGit(carpeta)
    expect(g).toMatchObject({ tipo: 'ok', rama: 'main', sinRama: false, historial: [], hayMas: false })
    expect(g.tipo === 'ok' && g.cambios).toEqual([
      { ruta: 'a.md', cambio: 'nuevo', mas: 2, menos: 0, preparado: false },
    ])
    const d = await leerDiferencia(carpeta, 'sin-guardar', 'a.md')
    expect(d.tipo === 'texto' && d.lineas.filter((l) => l.tipo === 'agregada').map((l) => l.texto)).toEqual([
      'uno',
      'dos',
    ])
  })

  it('muestra la rama, el historial, los cambios sin guardar y el antes y después', async () => {
    git('init', '-q', '-b', 'master')
    await escribir('docs/estado.md', 'uno\ndos\ntres\n')
    await escribir('src/viejo.ts', 'x\n')
    await escribir('img.png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 1, 2, 3]))
    git('add', '.')
    commit('I-1: esqueleto')
    await escribir('docs/estado.md', 'uno\nDOS\ntres\ncuatro\n')
    await escribir('con espacio ñ.md', 'hola\n')
    git('add', '.')
    git(
      '-c',
      'user.name=Lautaro',
      '-c',
      'user.email=l@x',
      'commit',
      '-q',
      '--no-gpg-sign',
      '-m',
      'I-5: Git del proyecto',
      '-m',
      'El detalle del cambio.',
      '-m',
      'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>',
    )
    // Sin guardar: uno cambiado, uno borrado y uno nuevo.
    await escribir('docs/estado.md', 'uno\nDOS\ntres\ncuatro\ncinco\n')
    await unlink(join(carpeta, 'src/viejo.ts'))
    await escribir('nuevo.ts', 'a\nb\nc\n')

    const g = await leerGit(carpeta)
    if (g.tipo !== 'ok') throw new Error(g.tipo)
    expect(g.rama).toBe('master')
    expect(g.historial.map((c) => [c.mensaje, c.archivos, c.coautores])).toEqual([
      ['I-5: Git del proyecto', 2, ['Claude Opus 5.5']],
      ['I-1: esqueleto', 3, []],
    ])
    expect(g.cambios).toEqual([
      { ruta: 'docs/estado.md', cambio: 'modificado', mas: 1, menos: 0, preparado: false },
      { ruta: 'src/viejo.ts', cambio: 'borrado', mas: 0, menos: 1, preparado: false },
      { ruta: 'nuevo.ts', cambio: 'nuevo', mas: 3, menos: 0, preparado: false },
    ])

    const ultimo = g.historial[0]?.hash ?? ''
    const c = await leerCommit(carpeta, ultimo)
    expect(c).toMatchObject({ tipo: 'ok' })
    if (c.tipo !== 'ok') return
    expect(c.mensajeCompleto).toContain('El detalle del cambio.')
    expect(c.archivos).toEqual([
      { ruta: 'con espacio ñ.md', cambio: 'nuevo', mas: 1, menos: 0 },
      { ruta: 'docs/estado.md', cambio: 'modificado', mas: 2, menos: 1 },
    ])

    const d = await leerDiferencia(carpeta, ultimo, 'docs/estado.md')
    if (d.tipo !== 'texto') throw new Error(d.tipo)
    expect(d.lineas.filter((l) => l.tipo !== 'igual' && l.tipo !== 'tramo')).toEqual([
      { tipo: 'quitada', texto: 'dos', viejo: 2, nuevo: null },
      { tipo: 'agregada', texto: 'DOS', viejo: null, nuevo: 2 },
      { tipo: 'agregada', texto: 'cuatro', viejo: null, nuevo: 4 },
    ])
    expect(await leerDiferencia(carpeta, ultimo, 'con espacio ñ.md')).toMatchObject({ tipo: 'texto' })

    // El primer commit (sin padre) y un binario.
    const primero = g.historial[1]?.hash ?? ''
    expect(await leerDiferencia(carpeta, primero, 'img.png')).toEqual({ tipo: 'binario' })

    // Sin guardar: el cambiado y el borrado.
    const sg = await leerDiferencia(carpeta, 'sin-guardar', 'docs/estado.md')
    expect(sg.tipo === 'texto' && sg.lineas.filter((l) => l.tipo === 'agregada').map((l) => l.texto)).toEqual(
      ['cinco'],
    )
    const borrado = await leerDiferencia(carpeta, 'sin-guardar', 'src/viejo.ts')
    expect(borrado.tipo === 'texto' && borrado.lineas.map((l) => l.tipo)).toEqual(['tramo', 'quitada'])
  })

  it('solo da archivos que git nombra: ni rutas de afuera ni commits inventados', async () => {
    git('init', '-q', '-b', 'master')
    await escribir('a.md', 'a\n')
    git('add', '.')
    commit('uno')
    const g = await leerGit(carpeta)
    const hash = g.tipo === 'ok' ? (g.historial[0]?.hash ?? '') : ''
    expect(await leerDiferencia(carpeta, hash, '../../secreto.txt')).toMatchObject({ tipo: 'error' })
    expect(await leerDiferencia(carpeta, 'sin-guardar', '../../secreto.txt')).toMatchObject({ tipo: 'error' })
    expect(await leerDiferencia(carpeta, 'abcdef1234', 'a.md')).toMatchObject({ tipo: 'error' })
    expect(await leerCommit(carpeta, 'abcdef1234')).toEqual({ tipo: 'no-esta' })
    expect(await leerCommit(carpeta, '--all')).toEqual({ tipo: 'no-esta' })
  })

  it('mirar no cambia el repositorio (no toca el índice)', async () => {
    git('init', '-q', '-b', 'master')
    await escribir('a.md', 'a\n')
    git('add', '.')
    commit('uno')
    await escribir('a.md', 'b\n')
    const antes = (await stat(join(carpeta, '.git/index'))).mtimeMs
    await new Promise((r) => setTimeout(r, 30))
    await leerGit(carpeta)
    await leerDiferencia(carpeta, 'sin-guardar', 'a.md')
    expect((await stat(join(carpeta, '.git/index'))).mtimeMs).toBe(antes)
    expect(git('status', '--porcelain')).toContain(' M a.md')
  })

  it('un repositorio sin remoto es solo local; con remoto, marca lo que falta subir', async () => {
    git('init', '-q', '-b', 'main')
    await escribir('a.md', 'a\n')
    git('add', '.')
    commit('uno')
    const local = await leerGit(carpeta)
    expect(local).toMatchObject({ tipo: 'ok', remoto: { tipo: 'local' } })
    expect(local.tipo === 'ok' && local.historial[0]?.subido).toBeNull()

    // Un «GitHub» de mentira: otro repositorio en una carpeta, con la dirección cambiada a la de GitHub.
    const nube = await mkdtemp(join(tmpdir(), 'iridium-git-nube-'))
    try {
      execFileSync('git', ['init', '-q', '--bare', nube])
      git('remote', 'add', 'origin', nube)
      git('push', '-q', '-u', 'origin', 'main')
      git('remote', 'set-url', 'origin', 'https://github.com/LlanosLautaro/Alfa.git')
      await escribir('b.md', 'b\n')
      git('add', '.')
      commit('dos')
      const g = await leerGit(carpeta)
      if (g.tipo !== 'ok') throw new Error(g.tipo)
      expect(g.remoto).toEqual({
        tipo: 'remoto',
        github: true,
        nombre: 'LlanosLautaro/Alfa',
        web: 'https://github.com/LlanosLautaro/Alfa',
        sigue: 'origin/main',
        sinSubir: 1,
        sinBajar: 0,
        sincronia: null,
      })
      expect(g.historial.map((c) => [c.mensaje, c.subido])).toEqual([
        ['dos', false],
        ['uno', true],
      ])
      // Una rama que no está en el remoto.
      git('checkout', '-q', '-b', 'prueba')
      const r = await leerGit(carpeta)
      expect(r).toMatchObject({ tipo: 'ok', remoto: { tipo: 'remoto', sigue: null, sinSubir: 1 } })
    } finally {
      await rm(nube, { recursive: true, force: true })
    }
  })

  it('un commit suelto (sin rama) lo dice', async () => {
    git('init', '-q', '-b', 'master')
    await escribir('a.md', 'a\n')
    git('add', '.')
    commit('uno')
    git('checkout', '-q', '--detach')
    const g = await leerGit(carpeta)
    expect(g).toMatchObject({ tipo: 'ok', sinRama: true })
    expect(g.tipo === 'ok' && g.rama).toMatch(/^[0-9a-f]{7}$/)
  })
})
