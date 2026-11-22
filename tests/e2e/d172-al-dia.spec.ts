// D-172 (T-114): mandarle algo a la IA espera a que su proyecto esté al día con GitHub. El remoto es un repositorio en
// otra carpeta y «la otra PC», un clon que subió un commit antes de abrir Iridium; cada traer tarda 2,5 s de más
// (`IRIDIUM_TRAER_MS`) para ver la espera. Lo escrito queda en el cuadro con «Poniéndose al día con GitHub…» y sale
// solo; sin poder llegar al remoto, sale igual y lo dice.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let base: string
let raiz: string
let datos: string
let abierta: ElectronApplication | null = null

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})
const ESTADO = '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n'

const git = (cwd: string, ...args: string[]) =>
  execFileSync(
    'git',
    ['-c', 'core.autocrlf=false', '-c', 'user.name=Lautaro', '-c', 'user.email=l@x', ...args],
    { cwd, encoding: 'utf8' },
  )

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '60',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_VSCODE: 'falso',
    IRIDIUM_TRAER_MS: '2500',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-d172-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  const alfa = join(raiz, 'Alfa')
  await mkdir(join(alfa, 'docs'), { recursive: true })
  await writeFile(join(alfa, '.proyecto.json'), ficha)
  await writeFile(join(alfa, 'docs', 'estado.md'), ESTADO)
  git(alfa, 'init', '-q', '-b', 'master')
  git(alfa, 'add', '.')
  git(alfa, 'commit', '-q', '--no-gpg-sign', '-m', 'Primero')
  await mkdir(datos, { recursive: true })
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
})

test.afterEach(async () => {
  try {
    abierta?.process().kill()
  } catch {
    // Ya estaba cerrada.
  }
  abierta = null
  await rm(base, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('lo escrito espera a que el proyecto traiga lo de la otra PC, y sale solo', async () => {
  const alfa = join(raiz, 'Alfa')
  const nube = join(base, 'nube')
  const otra = join(base, 'otra')
  execFileSync('git', ['init', '-q', '--bare', '-b', 'master', nube])
  git(alfa, 'remote', 'add', 'origin', nube)
  git(alfa, 'push', '-q', '-u', 'origin', 'master')
  execFileSync('git', ['clone', '-q', nube, otra])
  await writeFile(
    join(otra, 'docs', 'trabajo.md'),
    '# Trabajo\n\n## T-1 — Desde la otra PC\nEstado: pendiente\n',
  )
  git(otra, 'add', '.')
  git(otra, 'commit', '-q', '--no-gpg-sign', '-m', 'Desde la otra PC')
  git(otra, 'push', '-q')

  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const chat = win.getByRole('complementary', { name: 'Conversación' })
  const cuadro = chat.getByLabel('Mensaje para la IA')
  // La conversación se termina de abrir (y el cuadro se vuelve a armar) apenas se entra.
  await expect(chat.locator('.sin-conversacion')).toBeVisible()
  await cuadro.fill('Seguí con T-1')
  await cuadro.press('Enter')
  // Mientras trae: lo escrito sigue en el cuadro y la línea dice qué pasa.
  await expect(chat.getByRole('status').filter({ hasText: 'Poniéndose al día con GitHub…' })).toBeVisible()
  await expect(cuadro).toHaveValue('Seguí con T-1')
  await win.screenshot({ path: 'test-results/d172-esperando.png' })
  // Al terminar sale solo, y la IA trabaja con lo que trajo.
  await expect(cuadro).toHaveValue('', { timeout: 15_000 })
  await expect(chat.locator('.turno.usuario').last()).toContainText('Seguí con T-1')
  await expect(chat.getByText('Poniéndose al día con GitHub…')).toHaveCount(0)
  await expect(chat.getByText('Se mandó sin estar al día')).toHaveCount(0)
  expect(git(alfa, 'log', '-1', '--format=%s').trim()).toBe('Desde la otra PC')
  expect(await readFile(join(alfa, 'docs', 'trabajo.md'), 'utf8')).toContain('Desde la otra PC')
  await win.screenshot({ path: 'test-results/d172-salio.png' })

  // Ya mirado, el siguiente no espera.
  await cuadro.fill('Otra cosa')
  await cuadro.press('Enter')
  await expect(cuadro).toHaveValue('', { timeout: 1_500 })
  // Que la IA termine antes de cerrar (si no, Iridium pregunta si cerrar igual).
  await expect(chat.locator('.hilo .respuesta-ia')).toHaveCount(2, { timeout: 15_000 })
  await expect(win.getByRole('tab', { name: /Alfa Terminada/ })).toBeVisible({ timeout: 15_000 })
  await app.close()
})

test('sin llegar al remoto, lo escrito sale igual y lo dice', async () => {
  // El remoto existió (la rama lo sigue) y ya no está: traer falla.
  const nube = join(base, 'nube')
  const alfa = join(raiz, 'Alfa')
  execFileSync('git', ['init', '-q', '--bare', '-b', 'master', nube])
  git(alfa, 'remote', 'add', 'origin', nube)
  git(alfa, 'push', '-q', '-u', 'origin', 'master')
  await rm(nube, { recursive: true, force: true })

  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const chat = win.getByRole('complementary', { name: 'Conversación' })
  const cuadro = chat.getByLabel('Mensaje para la IA')
  await expect(chat.locator('.sin-conversacion')).toBeVisible()
  await cuadro.fill('Hola')
  await cuadro.press('Enter')
  await expect(cuadro).toHaveValue('', { timeout: 15_000 })
  await expect(chat.locator('.turno.usuario').last()).toContainText('Hola')
  await expect(
    chat.getByRole('note').filter({ hasText: 'Se mandó sin estar al día con GitHub' }),
  ).toContainText('El repositorio ya no está en el remoto')
  await win.screenshot({ path: 'test-results/d172-sin-remoto.png' })
  await expect(win.getByRole('tab', { name: /Alfa Terminada/ })).toBeVisible({ timeout: 15_000 })
  await app.close()
})
