// Q-290 (D-192) con la app abierta: la primera vez que se abre una versión, el aviso de la esquina dice qué trae desde
// la última vista en esta PC; Listo lo cierra hasta la próxima. La primera vez en una PC no avisa nada.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron, expect, test } from '@playwright/test'

let raiz: string
let datos: string

async function abrir() {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_NOVEDADES: 'si',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  return { app, win }
}

/** Los commits que lleva la app armada (`out/`), del más nuevo al más viejo. */
const commits = () =>
  execFileSync('git', ['log', '-5', '--format=%h%x09%ct%x09%s'], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .map((l) => l.split('\t'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), '# Estado\n\n## Próximo paso\nSeguir.\n')
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('una versión nueva dice qué trae; Listo la cierra y no vuelve', async () => {
  const [, , , [visto = '', fecha = '0'] = []] = commits()
  await writeFile(
    join(datos, 'novedades.json'),
    JSON.stringify({ version: 1, commit: visto, fecha: Number(fecha) * 1000 }),
  )
  let { app, win } = await abrir()
  const aviso = win.getByRole('status', { name: 'Lo nuevo de Iridium' })
  await expect(aviso.getByText(/^Iridium se actualizó a \d+\.\d+\.\d+$/)).toBeVisible()
  // Los tres commits posteriores al visto, el más nuevo primero, con su primera frase.
  await expect(aviso.locator('li')).toHaveCount(3)
  const [primero] = commits()
  await expect(aviso.locator('li').first()).toHaveAttribute('title', primero?.[2] ?? '')
  await win.screenshot({ path: 'test-results/q290-novedades.png' })
  await aviso.getByRole('button', { name: 'Listo' }).click()
  await expect(aviso).toHaveCount(0)
  expect(JSON.parse(await readFile(join(datos, 'novedades.json'), 'utf8')).commit).toBe(primero?.[0])
  await app.close()

  ;({ app, win } = await abrir())
  await win.waitForTimeout(1000)
  await expect(win.getByRole('status', { name: 'Lo nuevo de Iridium' })).toHaveCount(0)
  await app.close()
})

test('la primera vez en una PC no avisa nada y queda anotada', async () => {
  const { app, win } = await abrir()
  await win.waitForTimeout(1000)
  await expect(win.getByRole('status', { name: 'Lo nuevo de Iridium' })).toHaveCount(0)
  expect(JSON.parse(await readFile(join(datos, 'novedades.json'), 'utf8')).commit).toBe(commits()[0]?.[0])
  await app.close()
})
