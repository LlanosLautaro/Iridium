// PA-I5 (frente Paridad, Capacidades, T-28; D-189 › 4) con la app abierta y el motor falso: el navegador en Ajustes ›
// Capacidades. Con la extensión en Brave, la fila lo dice; sin ella, al prender, el aviso con «Cómo instalarla». El
// interruptor queda en config.json. Los perfiles son de muestra (`IRIDIUM_NAVEGADORES`).
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

const ID = 'fcoeoabgfenejglbffodgkkbkcdhcgfn'
let raiz: string
let datos: string
let local: string

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '200',
    IRIDIUM_NAVEGADORES: local,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

const leerConfig = async () => JSON.parse(await readFile(join(datos, 'config.json'), 'utf8'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  local = await mkdtemp(join(tmpdir(), 'iridium-e2e-local-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(
    join(raiz, 'Alfa', 'docs', 'estado.md'),
    '# Estado\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n',
  )
})

test.afterEach(async () => {
  for (const c of [raiz, datos, local])
    await rm(c, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

async function abrirCapacidades(win: Page) {
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Capacidades' }).click()
  return win.getByRole('dialog', { name: 'Capacidades' })
}

test('con la extensión en Brave: la fila lo dice, se prende y queda guardado', async () => {
  await mkdir(join(local, 'BraveSoftware', 'Brave-Browser', 'User Data', 'Default', 'Extensions', ID), {
    recursive: true,
  })
  const { app, win } = await abrir()
  const ajustes = await abrirCapacidades(win)
  const interruptor = ajustes.getByRole('switch', { name: 'Usar el navegador' })
  // Apagado de entrada (P2), arriba de todo, y ya dice con qué navegador va.
  await expect(interruptor).not.toBeChecked()
  await expect(ajustes.getByText('Brave, con la extensión «Claude»')).toBeVisible()
  await expect(
    ajustes.getByText('Una página puede traer instrucciones escondidas', { exact: false }),
  ).toBeVisible()

  await interruptor.click()
  await expect(interruptor).toBeChecked()
  await expect(ajustes.getByText('Prendido', { exact: true })).toBeVisible()
  await expect.poll(async () => (await leerConfig()).capacidades?.navegador).toBe(true)
  await expect(ajustes.getByText('No encontré la extensión', { exact: false })).toHaveCount(0)
  // La lista de abajo sigue como siempre.
  await expect(ajustes.getByText('Anthropic · 10 skills · 3 conectores')).toBeVisible()
  await win.screenshot({ path: 'test-results/pa5-navegador.png' })
  await app.close()

  const otra = await abrir()
  const deNuevo = await abrirCapacidades(otra.win)
  await expect(deNuevo.getByRole('switch', { name: 'Usar el navegador' })).toBeChecked()
  await otra.app.close()
})

test('sin la extensión: al prender, el aviso con «Cómo instalarla», y el interruptor queda prendido', async () => {
  const { app, win } = await abrir()
  const ajustes = await abrirCapacidades(win)
  const interruptor = ajustes.getByRole('switch', { name: 'Usar el navegador' })
  await expect(ajustes.getByText('Anthropic · 10 skills · 3 conectores')).toBeVisible()
  // Apagado, no hay aviso: no frena nada.
  await expect(ajustes.getByText('No encontré la extensión', { exact: false })).toHaveCount(0)

  await interruptor.click()
  await expect(ajustes.getByText('No encontré la extensión «Claude»', { exact: true })).toBeVisible()
  await expect(ajustes.getByText('La busqué en Chrome, Brave y Edge', { exact: false })).toBeVisible()
  await expect(interruptor).toBeChecked()
  await win.screenshot({ path: 'test-results/pa5-sin-extension.png' })
  await ajustes.getByRole('link', { name: 'Cómo instalarla' }).click()
  await expect
    .poll(() => app.evaluate(() => (globalThis as { enlacesAfuera?: string[] }).enlacesAfuera ?? []))
    .toEqual([`https://chromewebstore.google.com/detail/${ID}`])
  await app.close()
})
