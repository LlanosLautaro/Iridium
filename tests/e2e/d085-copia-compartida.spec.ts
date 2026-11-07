// D-085 y Q-123 con la app abierta: una copia compartida (IRIDIUM_ACTUALIZACIONES) con un GitHub falso en la PC
// (IRIDIUM_GITHUB_API). Sin sesión de GitHub avisa abajo con Iniciar sesión; con una cuenta sin invitación, lo dice;
// con acceso, baja la versión y aparece Actualizar (R-12), que solo reinicia. Una copia compartida no ofrece Armar.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let base: string
let servidor: Server
let api: string
let zip: Buffer

async function abrir(clave: string | null): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: join(base, 'datos'),
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_RELEASE: join(base, 'Iridium-app'),
    IRIDIUM_ACTUALIZACIONES: join(base, 'actualizaciones.json'),
    IRIDIUM_GITHUB_API: api,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  delete env.IRIDIUM_GITHUB_CLAVE
  if (clave) env.IRIDIUM_GITHUB_CLAVE = clave
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

test.beforeAll(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-d085-'))
  const armado = join(base, 'armado')
  await mkdir(join(armado, 'win-unpacked'), { recursive: true })
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
  // Un repositorio privado: sin la clave de la cuenta invitada, GitHub dice 404.
  servidor = createServer((pedido, respuesta) => {
    if (pedido.headers.authorization !== 'Bearer invitada') {
      respuesta.writeHead(404).end('{"message":"Not Found"}')
      return
    }
    if (pedido.url === '/repos/alguien/Iridium/releases/latest') {
      respuesta.writeHead(200, { 'Content-Type': 'application/json' }).end(
        JSON.stringify({
          tag_name: 'iridium-2026-11-04-1200-bbb2222',
          body: 'La versión nueva',
          published_at: '2026-11-04T12:00:00Z',
          assets: [{ name: 'Iridium-bbb2222.zip', url: `${api}/repos/alguien/Iridium/releases/assets/7` }],
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

test.beforeEach(async () => {
  for (const c of ['datos', 'Iridium-app']) await rm(join(base, c), { recursive: true, force: true })
  await mkdir(join(base, 'datos', 'Proyectos', 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(base, 'datos', 'Proyectos', 'Alfa', 'docs', 'estado.md'), '# Estado\n')
  await writeFile(
    join(base, 'datos', 'config.json'),
    JSON.stringify({ version: 1, raiz: join(base, 'datos', 'Proyectos') }),
  )
  await mkdir(join(base, 'Iridium-app', 'win-unpacked'), { recursive: true })
  await writeFile(
    join(base, 'actualizaciones.json'),
    JSON.stringify({ repo: 'alguien/Iridium', commit: 'aaa1111' }),
  )
})

test.afterAll(async () => {
  await new Promise((listo) => servidor.close(listo))
  await rm(base, { recursive: true, force: true, maxRetries: 5 })
})

test('sin sesión de GitHub avisa abajo, con Iniciar sesión, y no ofrece Armar (Q-123)', async () => {
  const { app, win } = await abrir(null)
  const aviso = win.locator('.acceso-versiones')
  await expect(aviso).toContainText('Para recibir versiones nuevas, iniciá sesión en GitHub')
  await expect(aviso.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
  await expect(win.getByRole('button', { name: 'Armar' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/d085-sin-sesion.png' })
  await app.close()
})

test('con una cuenta sin invitación dice que falta el acceso (Q-123)', async () => {
  const { app, win } = await abrir('otra-cuenta')
  const aviso = win.locator('.acceso-versiones')
  await expect(aviso).toContainText('Sin acceso a las versiones nuevas')
  await expect(aviso.getByRole('button', { name: 'Probar de nuevo' })).toBeVisible()
  await win.screenshot({ path: 'test-results/d085-sin-permiso.png' })
  await app.close()
})

test('con la cuenta invitada baja la versión y avisa que entra al cerrar (D-085)', async () => {
  const { app, win } = await abrir('invitada')
  const actualizar = win.locator('.actualizar-it').getByRole('button', { name: 'Actualizar' })
  await expect(actualizar).toBeEnabled({ timeout: 20_000 })
  await expect(actualizar).toHaveAttribute('title', /^Trae «/)
  await expect(win.locator('.acceso-versiones')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/d085-bajada.png' })
  await app.close()
})
