// T-52 (D-183) con la app abierta y el motor falso: Ajustes › Notificaciones elige y prueba el sonido, y suena una
// sola vez cuando la IA terminó su trabajo, no al dejar las pruebas corriendo de fondo.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '300',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  // Lo que sonó queda anotado acá (renderer/marco/sonido.ts).
  await win.evaluate(() => {
    ;(globalThis as { sonidosTocados?: string[] }).sonidosTocados = []
  })
  return { app, win }
}

const sonidos = (win: Page) =>
  win.evaluate(() => (globalThis as { sonidosTocados?: string[] }).sonidosTocados ?? [])
const leerConfig = async () => JSON.parse(await readFile(join(datos, 'config.json'), 'utf8'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(
    join(raiz, 'Alfa', 'docs', 'estado.md'),
    '# Estado\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n',
  )
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('Ajustes › Notificaciones: elegir un sonido lo hace sonar y se guarda; apagado, no se elige', async () => {
  const { app, win } = await abrir()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Notificaciones' }).click()
  const ajustes = win.getByRole('dialog', { name: 'Notificaciones' })
  await expect(ajustes.getByRole('switch', { name: 'Sonido al terminar' })).toBeChecked()
  await expect(ajustes.getByRole('button', { name: 'Campana' })).toHaveAttribute('aria-pressed', 'true')
  await expect(ajustes.getByRole('switch', { name: 'Con el avance solo' })).not.toBeChecked()
  await win.screenshot({ path: 'test-results/t52-notificaciones.png' })

  await ajustes.getByRole('button', { name: 'Gota' }).click()
  await expect(ajustes.getByRole('button', { name: 'Gota' })).toHaveAttribute('aria-pressed', 'true')
  expect(await sonidos(win)).toEqual(['gota'])
  await expect.poll(async () => (await leerConfig()).sonido?.cual).toBe('gota')

  await ajustes.getByRole('switch', { name: 'Sonido al terminar' }).click()
  await expect(ajustes.getByRole('button', { name: 'Acorde' })).toBeDisabled()
  await expect(ajustes.getByRole('switch', { name: 'Con el avance solo' })).toBeDisabled()
  await expect.poll(async () => (await leerConfig()).sonido?.prendido).toBe(false)
  await app.close()
})

test('suena una vez cuando la IA termina, no al dejar las pruebas de fondo', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Corré las pruebas de fondo')
  await campo.press('Enter')

  // Terminó el turno pero espera lo de fondo: todavía no suena.
  await expect(win.locator('.ahora.esperando')).toBeVisible()
  expect(await sonidos(win)).toEqual([])

  // La IA retoma sola y termina: ahora sí, una vez.
  await expect(win.locator('.hilo')).toContainText('Terminaron las pruebas de fondo', { timeout: 15_000 })
  await expect.poll(() => sonidos(win)).toEqual(['campana'])
  await app.close()
})

test('las Iridium de las pruebas están mudas: su sonido no se oye mientras la IA trabaja (T-124)', async () => {
  const { app } = await abrir()
  const muda = await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0]?.webContents.isAudioMuted(),
  )
  await app.close()
  expect(muda).toBe(true)
})
