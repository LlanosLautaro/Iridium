// T-89 (D-202): responder una pregunta en la Bandeja la sube sola a GitHub unos segundos después, en un commit con
// solo esa respuesta; lo que el usuario dejó sin guardar no entra. El remoto es un repositorio en otra carpeta.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, test } from '@playwright/test'

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
const ESTADO = `# Estado

## Hito actual
7 — Construcción — en curso

## Preguntas abiertas
- **Q-1 — ¿La galería va en tres o en cuatro columnas?**
  Tipo: decisión
  Opciones: A) Tres · B) Cuatro (recomendada: entra más)

## Próximo paso
Armar la galería.
`

const git = (cwd: string, ...args: string[]) =>
  execFileSync(
    'git',
    ['-c', 'core.autocrlf=false', '-c', 'user.name=Prueba', '-c', 'user.email=p@x', ...args],
    { cwd, encoding: 'utf8' },
  ).trim()

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-t89-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  const alfa = join(raiz, 'Alfa')
  await mkdir(join(alfa, 'docs'), { recursive: true })
  await writeFile(join(alfa, '.proyecto.json'), ficha)
  await writeFile(join(alfa, 'docs', 'estado.md'), ESTADO)
  git(alfa, 'init', '-q', '-b', 'master')
  git(alfa, 'add', '.')
  git(alfa, 'commit', '-q', '--no-gpg-sign', '-m', 'Primero')
  execFileSync('git', ['init', '-q', '--bare', '-b', 'master', join(base, 'nube')])
  git(alfa, 'remote', 'add', 'origin', join(base, 'nube'))
  git(alfa, 'push', '-q', '-u', 'origin', 'master')
  // Algo que el usuario dejó sin guardar: no tiene que entrar en el commit.
  await writeFile(join(alfa, 'notas.md'), 'a medio escribir\n')
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

test('la respuesta se sube sola a GitHub, sin lo demás', async () => {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_VSCODE: 'falso',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })

  const alfa = join(raiz, 'Alfa')
  const nube = join(base, 'nube')
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: /^Bandeja de entrada/ })
    .click()
  const q1 = win.locator('.pregunta[data-q="Q-1"]')
  await expect(q1).toBeVisible()
  await q1.locator('.opcion-q', { hasText: 'Cuatro' }).click()
  await q1.getByRole('button', { name: 'Enviar' }).click()
  await expect(q1.locator('.cab-q')).toContainText('Respondida, sin procesar')
  await win.screenshot({ path: 'test-results/t89-respondida.png' })

  // Unos segundos después (junta las que se respondan seguidas), está en GitHub.
  await expect
    .poll(() => git(nube, 'log', '-1', '--format=%s', 'master'), { timeout: 30_000, intervals: [1000] })
    .toBe('Respuesta a Q-1')
  expect(git(alfa, 'show', '--name-only', '--format=', 'HEAD')).toBe('docs/respuestas/Q-1.md')
  expect(git(alfa, 'status', '--porcelain')).toBe('?? notas.md')

  // Git lo muestra: el commit en el historial y solo notas.md sin guardar.
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Git' })
    .click()
  const g = win.locator('[data-seccion="git"]:not([hidden])')
  const seccion = (t: string) => g.locator('.git-grupo', { has: win.locator('h3', { hasText: t }) })
  await expect(seccion('Cambios').locator('.git-nodo')).toHaveText([/notas\.md/])
  await seccion('Historial').locator('h3 button').click()
  await expect(seccion('Historial')).toContainText('Respuesta a Q-1')
  await win.screenshot({ path: 'test-results/t89-en-git.png' })
  await app.close()
})
