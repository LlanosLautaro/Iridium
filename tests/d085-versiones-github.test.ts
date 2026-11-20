// D-085: la copia compartida baja de GitHub la versión publicada y la deja en `release/nueva` con su `lista.json`, como
// `tools/actualizar.ps1`; entra al cerrar con el mismo ayudante (CO-I2). Con un GitHub falso en 127.0.0.1.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { commitDeEtiqueta, etiquetaVersion } from '../src/compartido/versiones'
import { leerActualizaciones, leerPublicada, VigiaVersionGithub } from '../src/main/infra/version-github'
import { leerVersionNueva } from '../src/main/infra/version-nueva'

describe('etiquetas y respuestas', () => {
  it('la etiqueta lleva la fecha y el commit, y se lee de vuelta', () => {
    const e = etiquetaVersion(new Date(2026, 10, 4, 9, 5), 'abc1234')
    expect(e).toBe('iridium-2026-11-04-0905-abc1234')
    expect(commitDeEtiqueta(e)).toBe('abc1234')
    expect(commitDeEtiqueta('v1.0.0')).toBeNull()
  })

  it('una versión sin .zip o con otra etiqueta no cuenta', () => {
    const zip = { name: 'Iridium-abc1234.zip', url: 'https://api/x/assets/1' }
    expect(
      leerPublicada({ tag_name: 'iridium-2026-11-04-0905-abc1234', body: 'Algo\nmás', assets: [zip] }),
    ).toEqual({
      commit: 'abc1234',
      mensaje: 'Algo',
      fecha: '',
      zip: 'https://api/x/assets/1',
      piezas: null,
    })
    expect(leerPublicada({ tag_name: 'iridium-2026-11-04-0905-abc1234', assets: [] })).toBeNull()
    // D-161: con sus piezas, también la pieza de la app y las huellas.
    const conPiezas = leerPublicada({
      tag_name: 'iridium-2026-11-04-0905-abc1234',
      assets: [
        { name: 'piezas.json', url: 'https://api/x/assets/2' },
        { name: 'Iridium-abc1234-app.pieza', url: 'https://api/x/assets/3' },
        zip,
      ],
    })
    expect(conPiezas?.zip).toBe('https://api/x/assets/1')
    expect(conPiezas?.piezas).toEqual({ app: 'https://api/x/assets/3', huellas: 'https://api/x/assets/2' })
    expect(leerPublicada({ tag_name: 'otra', assets: [zip] })).toBeNull()
    expect(leerPublicada(null)).toBeNull()
  })

  it('actualizaciones.json: el repositorio tiene que ser dueño/nombre', async () => {
    const d = await mkdtemp(join(tmpdir(), 'iridium-act-'))
    const a = join(d, 'actualizaciones.json')
    await writeFile(a, JSON.stringify({ repo: 'alguien/Iridium', commit: 'abc1234' }))
    expect(await leerActualizaciones(a)).toEqual({ repo: 'alguien/Iridium', commit: 'abc1234' })
    await writeFile(a, JSON.stringify({ repo: 'https://otro.sitio', commit: 'abc1234' }))
    expect(await leerActualizaciones(a)).toBeNull()
    expect(await leerActualizaciones(join(d, 'no-esta.json'))).toBeNull()
    await rm(d, { recursive: true, force: true })
  })
})

describe.runIf(process.platform === 'win32')('VigiaVersionGithub', () => {
  let base: string
  let release: string
  let servidor: Server
  let api: string
  let zip: Buffer
  /** Si el GitHub falso pide clave (un repositorio privado). */
  let privado = false
  let commitPublicado = 'bbb2222'
  const anotado: string[] = []

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-d085-'))
    release = join(base, 'Iridium')
    await mkdir(join(release, 'win-unpacked'), { recursive: true })
    // El .zip publicado: la carpeta win-unpacked con su Iridium.exe.
    const armado = join(base, 'armado')
    await mkdir(join(armado, 'win-unpacked', 'resources'), { recursive: true })
    await writeFile(join(armado, 'win-unpacked', 'Iridium.exe'), 'nueva')
    const archivo = join(base, 'Iridium.zip')
    execFileSync(join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe'), [
      '-a',
      '-c',
      '-f',
      archivo,
      '-C',
      armado,
      'win-unpacked',
    ])
    zip = await readFile(archivo)
    privado = false
    commitPublicado = 'bbb2222'
    anotado.length = 0
    servidor = createServer((pedido, respuesta) => {
      if (privado && pedido.headers.authorization !== 'Bearer clave-de-prueba') {
        respuesta.writeHead(404).end('{"message":"Not Found"}')
        return
      }
      if (pedido.url === '/repos/alguien/Iridium/releases/latest') {
        respuesta.writeHead(200, { 'Content-Type': 'application/json' }).end(
          JSON.stringify({
            tag_name: `iridium-2026-11-04-1200-${commitPublicado}`,
            body: 'La versión nueva',
            published_at: '2026-11-04T12:00:00Z',
            assets: [
              {
                name: `Iridium-${commitPublicado}.zip`,
                url: `${api}/repos/alguien/Iridium/releases/assets/7`,
              },
            ],
          }),
        )
        return
      }
      if (pedido.url === '/repos/alguien/Iridium/releases/assets/7') {
        respuesta.writeHead(200, { 'Content-Type': 'application/octet-stream' }).end(zip)
        return
      }
      respuesta.writeHead(404).end()
    })
    await new Promise<void>((listo) => servidor.listen(0, '127.0.0.1', listo))
    api = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`
  })

  afterEach(async () => {
    await new Promise((listo) => servidor.close(listo))
    await rm(base, { recursive: true, force: true })
  })

  const vigia = (commit: string, clave: string | null = null) =>
    new VigiaVersionGithub({
      release,
      actualizaciones: { repo: 'alguien/Iridium', commit },
      anotar: (t) => anotado.push(t),
      api,
      clave: async () => clave,
    })

  it('con la misma versión no baja nada', async () => {
    expect(await vigia('bbb2222').mirar()).toBe('al-dia')
    expect(existsSync(join(release, 'nueva'))).toBe(false)
  })

  it('con otra, la baja y la deja lista para el cierre; la segunda vez no la vuelve a bajar', async () => {
    const v = vigia('aaa1111')
    expect(await v.mirar()).toBe('bajada')
    expect(await readFile(join(release, 'nueva', 'win-unpacked', 'Iridium.exe'), 'utf8')).toBe('nueva')
    expect(await leerVersionNueva(release)).toEqual({
      fecha: '2026-11-04T12:00:00',
      commit: 'bbb2222',
      mensaje: 'La versión nueva',
      sinGuardar: false,
      noEntro: null,
    })
    // Lo que se bajó no queda tirado.
    expect(existsSync(join(release, 'bajando.zip'))).toBe(false)
    expect(existsSync(join(release, 'bajando'))).toBe(false)
    expect(await v.mirar()).toBe('lista')
    // Si se publica otra antes de cerrar, reemplaza a la lista.
    commitPublicado = 'ccc3333'
    expect(await v.mirar()).toBe('bajada')
    expect((await leerVersionNueva(release))?.commit).toBe('ccc3333')
  })

  it('un repositorio privado se mira con la sesión de GitHub de git; sin ella, avisa en el registro', async () => {
    privado = true
    expect(await vigia('aaa1111', null).mirar()).toBe('sin-acceso')
    expect(anotado.join('\n')).toMatch(/respondió 404/)
    expect(await vigia('aaa1111', 'clave-de-prueba').mirar()).toBe('bajada')
    expect((await leerVersionNueva(release))?.commit).toBe('bbb2222')
  })

  it('Q-123: sin sesión o sin invitación lo avisa; al iniciar sesión vuelve a mirar y baja', async () => {
    privado = true
    let clave: string | null = null
    const cambios: string[] = []
    const v = new VigiaVersionGithub({
      release,
      actualizaciones: { repo: 'alguien/Iridium', commit: 'aaa1111' },
      anotar: (t) => anotado.push(t),
      api,
      clave: async () => clave,
    })
    v.vigilarAcceso((a) => cambios.push(a))
    expect(v.ultimoAcceso()).toBe('ok')
    await v.mirar()
    expect(v.ultimoAcceso()).toBe('sin-sesion')
    // Con una cuenta que no está invitada.
    clave = 'otra-cuenta'
    expect(await v.iniciarSesion(async () => ({ tipo: 'ok' }))).toEqual({
      tipo: 'error',
      mensaje: expect.stringMatching(/no tiene acceso/),
    })
    expect(v.ultimoAcceso()).toBe('sin-permiso')
    // Si la ventana de git no inicia la sesión, se dice y no se mira.
    expect(
      await v.iniciarSesion(async () => ({ tipo: 'error', mensaje: 'No se inició la sesión en GitHub.' })),
    ).toEqual({
      tipo: 'error',
      mensaje: 'No se inició la sesión en GitHub.',
    })
    // Con la cuenta invitada.
    clave = 'clave-de-prueba'
    expect(await v.iniciarSesion(async () => ({ tipo: 'ok' }))).toEqual({ tipo: 'ok' })
    expect(v.ultimoAcceso()).toBe('ok')
    expect((await leerVersionNueva(release))?.commit).toBe('bbb2222')
    expect(cambios).toEqual(['sin-sesion', 'sin-permiso', 'ok'])
  })

  it('sin internet no rompe: lo intenta en la próxima vuelta', async () => {
    const v = new VigiaVersionGithub({
      release,
      actualizaciones: { repo: 'alguien/Iridium', commit: 'aaa1111' },
      anotar: (t) => anotado.push(t),
      api: 'http://127.0.0.1:9',
      clave: async () => null,
    })
    expect(await v.mirar()).toBe('falla')
    expect(existsSync(join(release, 'nueva'))).toBe(false)
  })
})
