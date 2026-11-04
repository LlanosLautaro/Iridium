// CO-I6 con la app abierta: el código de Iridium es un proyecto de muestra con git y su carpeta `release`
// (IRIDIUM_RELEASE). Con commits que `main` no tiene aparece «Hay cambios sin armar» con Armar; Armar corre el comando
// (IRIDIUM_ARMAR: uno que no arma) y muestra «Armando…»; con la versión lista, el aviso pasa a «Versión nueva lista».
// Mientras la IA de ese proyecto trabaja, no se ofrece.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let codigo: string
let release: string

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'El código de Iridium',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})
const estado = '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n'

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

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_RELEASE: release,
    // La consola se abre y se cierra sola: no arma nada.
    IRIDIUM_ARMAR: 'exit',
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const a = await electron.launch({ args: ['.'], env })
  const win = await a.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app: a, win }
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  codigo = join(raiz, 'Iridium')
  release = join(codigo, 'release')
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(codigo, 'docs'), { recursive: true })
  await mkdir(join(release, 'win-unpacked'), { recursive: true })
  await writeFile(join(codigo, '.proyecto.json'), ficha)
  await writeFile(join(codigo, 'docs', 'estado.md'), estado)
  await writeFile(join(codigo, '.gitignore'), 'release/\n')
  git('init', '-q', '-b', 'dev')
  await commit('CO-I4')
  git('branch', 'main')
})

test.afterEach(async () => {
  for (const c of [raiz, datos]) await rm(c, { recursive: true, force: true, maxRetries: 5 })
})

test('con commits sin armar se ofrece Armar; armando y, con la versión lista, el aviso de siempre (CO-I6)', async () => {
  const { app: a, win } = await abrir()
  await expect(win.locator('.estado-barra')).toContainText('Claude')
  const aviso = win.locator('.sin-armar')
  await expect(aviso).toHaveCount(0)

  // La IA commitea: en unos segundos aparece, sin hacer nada.
  await commit('CO-I6: Armar desde la barra')
  const hash = git('rev-parse', '--short', 'HEAD')
  await expect(aviso).toContainText('Hay cambios sin armar', { timeout: 15_000 })
  await expect(aviso).toHaveAttribute('title', new RegExp(`«CO-I6: Armar desde la barra» \\(${hash}\\)`))
  await win.screenshot({ path: 'test-results/co6-sin-armar.png' })

  await aviso.getByRole('button', { name: 'Armar' }).click()
  await expect(aviso).toContainText('Armando la versión nueva…')
  await expect(aviso.getByRole('button', { name: 'Armar' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/co6-armando.png' })

  // El script termina: deja la versión lista con ese commit (y movería `main`).
  await mkdir(join(release, 'nueva', 'win-unpacked'), { recursive: true })
  await writeFile(join(release, 'nueva', 'win-unpacked', 'Iridium.exe'), '')
  await writeFile(
    join(release, 'nueva', 'lista.json'),
    JSON.stringify({ fecha: '2026-11-01T14:05:00', commit: hash, mensaje: 'CO-I6', sinGuardar: false }),
  )
  await expect(win.locator('.version-nueva')).toContainText('Versión nueva lista', { timeout: 15_000 })
  await expect(aviso).toHaveCount(0, { timeout: 15_000 })
  await a.close()
})

test('mientras la IA del código de Iridium trabaja, no se ofrece Armar', async () => {
  test.setTimeout(90_000)
  await commit('CO-I6')
  const { app: a, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '3000' })
  const aviso = win.locator('.sin-armar')
  await expect(aviso).toContainText('Hay cambios sin armar', { timeout: 15_000 })

  await win.locator('.tarjeta', { hasText: 'Iridium' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Seguí')
  await campo.press('Enter')
  await expect(win.locator('.ses', { hasText: 'Iridium' })).toContainText('Trabajando')
  await expect(aviso).toHaveCount(0)
  await expect(aviso).toContainText('Hay cambios sin armar', { timeout: 40_000 })
  await a.close()
})
