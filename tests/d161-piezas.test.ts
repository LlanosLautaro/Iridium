// D-161 (T-37): las versiones publicadas traen sus piezas. Una copia compartida que ya tiene el mismo Electron y el
// mismo Claude Code baja solo la pieza de la app y copia el resto de la versión que está usando; si cambió alguno, o
// lo armado no da las huellas publicadas, baja el `.zip` completo. Con un GitHub falso en 127.0.0.1.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { archivosDe, huellasDe, leerHuellas, piezaDe, ponerIntegridad } from '../src/main/infra/piezas'
import { VigiaVersionGithub } from '../src/main/infra/version-github'
import { leerVersionNueva } from '../src/main/infra/version-nueva'

/** Un programa con la integridad de `app.asar` grabada, como el que arma electron-builder. */
const programa = (valor: string) =>
  `MZ…[{"file":"resources\\\\app.asar","alg":"SHA256","value":"${valor.repeat(64)}"}]…fin`

const tar = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe')

describe('las piezas', () => {
  it('cada archivo va a su pieza; lo propio de la versión, a ninguna', () => {
    expect(piezaDe('Iridium.exe')).toBe('electron')
    expect(piezaDe('locales/es.pak')).toBe('electron')
    expect(piezaDe('resources/default_app.asar')).toBe('electron')
    expect(piezaDe('resources/app.asar.unpacked/node_modules/x/claude.exe')).toBe('claude')
    expect(piezaDe('resources/app.asar')).toBe('app')
    expect(piezaDe('resources/plugins/iridium/SKILL.md')).toBe('app')
    expect(piezaDe('resources/actualizaciones.json')).toBeNull()
    expect(piezaDe('resources/piezas.json')).toBeNull()
  })

  it('la huella cambia solo en la pieza que cambió, y no por lo propio de la versión', async () => {
    const d = await mkdtemp(join(tmpdir(), 'iridium-d161-'))
    await escribir(d, {
      'Iridium.exe': 'e',
      'resources/app.asar': 'a1',
      'resources/app.asar.unpacked/c.exe': 'c',
    })
    const antes = await huellasDe(d)
    await escribir(d, { 'resources/app.asar': 'a2', 'resources/actualizaciones.json': '{}' })
    const despues = await huellasDe(d)
    expect(despues.electron).toBe(antes.electron)
    expect(despues.claude).toBe(antes.claude)
    expect(despues.app).not.toBe(antes.app)
    // Un archivo nuevo también cuenta.
    await escribir(d, { 'locales/es.pak': 'l' })
    expect((await huellasDe(d)).electron).not.toBe(antes.electron)
    expect(leerHuellas(despues)).toEqual(despues)
    expect(despues.integridad).toBeNull()
    expect(leerHuellas({ electron: 'x', claude: 'y', app: 'z' })).toBeNull()
    await rm(d, { recursive: true, force: true })
  })

  it('el programa cuenta con su integridad en ceros: otra integridad no cambia la huella de Electron', async () => {
    const d = await mkdtemp(join(tmpdir(), 'iridium-d161-'))
    await escribir(d, { 'Iridium.exe': programa('a') })
    const antes = await huellasDe(d)
    expect(antes.integridad).toBe('a'.repeat(64))
    await escribir(d, { 'Iridium.exe': programa('b') })
    const despues = await huellasDe(d)
    expect(despues.electron).toBe(antes.electron)
    expect(despues.integridad).toBe('b'.repeat(64))
    // Escribirle la de otra versión lo deja igual a esa versión.
    await ponerIntegridad(join(d, 'Iridium.exe'), 'a'.repeat(64))
    expect(await readFile(join(d, 'Iridium.exe'), 'utf8')).toBe(programa('a'))
    await rm(d, { recursive: true, force: true })
  })
})

async function escribir(carpeta: string, archivos: Record<string, string>): Promise<void> {
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(dirname(join(carpeta, ruta)), { recursive: true })
    await writeFile(join(carpeta, ruta), texto)
  }
}

/** Arma lo que sube `tools/publicar.ts`: el `.zip` completo, la pieza de la app y las huellas. */
async function publicar(armado: string): Promise<{ zip: Buffer; pieza: Buffer; huellas: string }> {
  const app = join(armado, 'win-unpacked')
  const huellas = JSON.stringify(await huellasDe(app))
  await writeFile(join(app, 'resources', 'piezas.json'), huellas)
  execFileSync(tar, ['-a', '-c', '-f', join(armado, 'v.zip'), '-C', armado, 'win-unpacked'])
  const lista = join(armado, 'lista.txt')
  const deLaApp = (await archivosDe(app)).filter((r) => piezaDe(r) !== 'electron' && piezaDe(r) !== 'claude')
  await writeFile(lista, deLaApp.map((r) => `win-unpacked/${r}`).join('\n'))
  execFileSync(tar, ['--format', 'zip', '-c', '-f', join(armado, 'v.pieza'), '-C', armado, '-T', lista])
  return {
    zip: await readFile(join(armado, 'v.zip')),
    pieza: await readFile(join(armado, 'v.pieza')),
    huellas,
  }
}

describe.runIf(process.platform === 'win32')('la copia compartida baja solo lo que cambió', () => {
  let base: string
  let release: string
  let servidor: Server
  let api: string
  let publicada: { zip: Buffer; pieza: Buffer; huellas: string }
  let pedidos: string[]
  const anotado: string[] = []

  const instalada = {
    'Iridium.exe': programa('a'),
    'locales/es.pak': 'textos',
    'resources/default_app.asar': 'de electron',
    'resources/app.asar.unpacked/node_modules/claude.exe': 'claude 1',
    'resources/app.asar': 'app vieja',
    'resources/plugins/iridium/SKILL.md': 'framework viejo',
    'resources/viejo.txt': 'lo que la versión nueva ya no trae',
  }

  /** La versión que está usando la copia, con sus huellas (como la dejó una versión publicada con piezas). */
  async function instalar(conHuellas = true): Promise<void> {
    const app = join(release, 'win-unpacked')
    await escribir(app, instalada)
    if (conHuellas)
      await writeFile(join(app, 'resources', 'piezas.json'), JSON.stringify(await huellasDe(app)))
  }

  /** La versión nueva: la instalada con la app cambiada y, si se pide, otro Electron o Claude Code. */
  async function nueva(cambios: Record<string, string> = {}): Promise<void> {
    const armado = join(base, 'armado')
    await rm(armado, { recursive: true, force: true })
    await escribir(join(armado, 'win-unpacked'), instalada)
    await rm(join(armado, 'win-unpacked', 'resources', 'viejo.txt'))
    await escribir(join(armado, 'win-unpacked'), {
      'Iridium.exe': programa('b'),
      'resources/app.asar': 'app nueva',
      'resources/plugins/iridium/SKILL.md': 'framework nuevo',
      'resources/actualizaciones.json': '{"repo":"alguien/Iridium","commit":"bbb2222"}',
      ...cambios,
    })
    publicada = await publicar(armado)
  }

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-d161-'))
    release = join(base, 'Iridium')
    pedidos = []
    anotado.length = 0
    servidor = createServer((pedido, respuesta) => {
      pedidos.push(pedido.url ?? '')
      const a = (n: number) => `${api}/repos/alguien/Iridium/releases/assets/${n}`
      if (pedido.url === '/repos/alguien/Iridium/releases/latest') {
        respuesta.writeHead(200, { 'Content-Type': 'application/json' }).end(
          JSON.stringify({
            tag_name: 'iridium-2026-11-20-1200-bbb2222',
            body: 'La versión nueva',
            published_at: '2026-11-20T12:00:00Z',
            assets: [
              { name: 'piezas.json', url: a(1) },
              { name: 'Iridium-bbb2222-app.pieza', url: a(2) },
              { name: 'Iridium-bbb2222.zip', url: a(3) },
            ],
          }),
        )
        return
      }
      const cuerpo = {
        '/repos/alguien/Iridium/releases/assets/1': publicada.huellas,
        '/repos/alguien/Iridium/releases/assets/2': publicada.pieza,
        '/repos/alguien/Iridium/releases/assets/3': publicada.zip,
      }[pedido.url ?? '']
      if (cuerpo) respuesta.writeHead(200, { 'Content-Type': 'application/octet-stream' }).end(cuerpo)
      else respuesta.writeHead(404).end()
    })
    await new Promise<void>((listo) => servidor.listen(0, '127.0.0.1', listo))
    api = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`
  })

  afterEach(async () => {
    await new Promise((listo) => servidor.close(listo))
    await rm(base, { recursive: true, force: true })
  })

  const vigia = () =>
    new VigiaVersionGithub({
      release,
      actualizaciones: { repo: 'alguien/Iridium', commit: 'aaa1111' },
      anotar: (t) => anotado.push(t),
      api,
      clave: async () => null,
    })

  const bajados = () => pedidos.filter((p) => p.includes('/assets/')).map((p) => p.split('/').pop())

  /** Lo que quedó en `release/nueva` es exactamente la versión publicada. */
  async function esLaPublicada(): Promise<void> {
    const puesta = join(release, 'nueva', 'win-unpacked')
    const armada = join(base, 'armado', 'win-unpacked')
    expect(await archivosDe(puesta)).toEqual(await archivosDe(armada))
    for (const ruta of await archivosDe(armada))
      expect(await readFile(join(puesta, ruta), 'utf8')).toBe(await readFile(join(armada, ruta), 'utf8'))
    expect((await leerVersionNueva(release))?.commit).toBe('bbb2222')
  }

  it('con el mismo Electron y el mismo Claude Code, baja solo la pieza de la app', async () => {
    await instalar()
    await nueva()
    const v = vigia()
    expect(await v.mirar()).toBe('bajada')
    expect(v.ultimaBajada).toBe('solo-app')
    expect(bajados()).toEqual(['1', '2'])
    await esLaPublicada()
    // Lo que la versión nueva ya no trae no pasa; y lo bajado no queda tirado.
    expect(existsSync(join(release, 'nueva', 'win-unpacked', 'resources', 'viejo.txt'))).toBe(false)
    expect(existsSync(join(release, 'bajando'))).toBe(false)
    expect(existsSync(join(release, 'bajando.zip'))).toBe(false)
    expect(anotado.join('\n')).toMatch(/bajada bbb2222 \(solo la app\)/)
  })

  it('si cambió Claude Code (o Electron), baja el .zip completo', async () => {
    await instalar()
    await nueva({ 'resources/app.asar.unpacked/node_modules/claude.exe': 'claude 2' })
    const v = vigia()
    expect(await v.mirar()).toBe('bajada')
    expect(v.ultimaBajada).toBe('completa')
    expect(bajados()).toEqual(['1', '3'])
    await esLaPublicada()
  })

  it('una copia de antes, sin huellas, baja el .zip completo sin preguntar por las piezas', async () => {
    await instalar(false)
    await nueva()
    const v = vigia()
    expect(await v.mirar()).toBe('bajada')
    expect(v.ultimaBajada).toBe('completa')
    expect(bajados()).toEqual(['3'])
    await esLaPublicada()
  })

  it('si lo armado no da las huellas publicadas (una pieza rota), lo anota y baja el .zip completo', async () => {
    await instalar()
    await nueva()
    // La versión instalada dice tener el mismo Claude Code, pero su archivo se dañó.
    await writeFile(
      join(release, 'win-unpacked', 'resources', 'app.asar.unpacked', 'node_modules', 'claude.exe'),
      'roto',
    )
    const v = vigia()
    expect(await v.mirar()).toBe('bajada')
    expect(v.ultimaBajada).toBe('completa')
    expect(bajados()).toEqual(['1', '2', '3'])
    expect(anotado.join('\n')).toMatch(/no coincide con lo publicado.*\.zip completo/)
    await esLaPublicada()
  })
})
