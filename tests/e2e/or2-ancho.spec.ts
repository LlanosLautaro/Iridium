// OR-I2 con la app abierta y el motor falso: la conversación de 360 px (D-098). Cada vista recuerda su ancho (la
// general, Skills y cada proyecto), el borde no pasa de la mitad y en una ventana de menos de 1100 px arranca en 300.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { armarCarpetaClaude } from '../muestras/carpeta-claude'

let raiz: string
let datos: string
let claude: string

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})
const estado =
  '# Estado\n\n## Hito actual\n7 — Construcción — en curso\n\n## Próximo paso\nHacer la grilla.\n'

async function abrir(ancho = 1440): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_CLAUDE: claude,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: ancho, height: 900 })
  return { app, win }
}

/** Arrastra el borde de la conversación `px` hacia la izquierda (negativo: a la derecha). */
async function arrastrar(win: Page, px: number) {
  const caja = await win.getByRole('separator', { name: /Ancho de la conversación/ }).boundingBox()
  if (!caja) throw new Error('sin borde')
  await win.mouse.move(caja.x + 2, caja.y + 200)
  await win.mouse.down()
  await win.mouse.move(caja.x + 2 - px, caja.y + 200, { steps: 5 })
  await win.mouse.up()
}

const anchoChat = (win: Page) => win.locator('aside.chat').evaluate((el) => (el as HTMLElement).offsetWidth)

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  claude = join(datos, 'claude')
  await armarCarpetaClaude(claude, join(raiz, '.iridium', 'Skills'), join(datos, 'afuera'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  for (const nombre of ['Alfa', 'Beta']) {
    await mkdir(join(raiz, nombre, 'docs'), { recursive: true })
    await writeFile(join(raiz, nombre, '.proyecto.json'), ficha)
    await writeFile(join(raiz, nombre, 'docs', 'estado.md'), estado)
  }
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('360 px en cada vista; cada una recuerda el suyo y no pasa de la mitad', async () => {
  let { app, win } = await abrir()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 360)

  // Alfa más ancha; Beta sigue en 360 y la general también.
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 360)
  await arrastrar(win, 160)
  const alfa = await anchoChat(win)
  expect(alfa).toBeGreaterThan(500)
  expect(alfa).toBeLessThan(540)
  await win.getByRole('button', { name: /^Inicio/ }).click()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 360)
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(win.locator('.zona-principal .cab-proyecto h1')).toHaveText('Beta')
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 360)

  // Beta hasta el tope: la mitad de la zona de trabajo, no más.
  await arrastrar(win, 900)
  const zona = await win.locator('main.trabajo').evaluate((el) => (el as HTMLElement).offsetWidth)
  const beta = await anchoChat(win)
  expect(Math.abs(beta - Math.floor(zona / 2))).toBeLessThanOrEqual(1)
  await win.screenshot({ path: 'test-results/or2-ancho-mitad.png' })

  // Skills, con el suyo.
  await win.keyboard.press('Control+2')
  await expect(win.getByRole('complementary', { name: 'Chat de Skills' })).toHaveJSProperty(
    'offsetWidth',
    360,
  )
  await arrastrar(win, -40)
  const skills = await anchoChat(win)
  expect(Math.abs(skills - 320)).toBeLessThanOrEqual(2)
  // Ideas comparte el de la vista general.
  await win.keyboard.press('Control+3')
  await expect(win.getByRole('complementary', { name: 'Chat general' })).toHaveJSProperty('offsetWidth', 360)
  await app.close()

  // Al volver a abrir, cada vista con el suyo.
  ;({ app, win } = await abrir())
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 360)
  await win.getByRole('tab', { name: /Beta/ }).click()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', beta)
  await win.getByRole('tab', { name: /Alfa/ }).click()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', alfa)
  await win.keyboard.press('Control+2')
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', skills)
  // Doble clic, el de entrada: solo en esta vista.
  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win.getByRole('separator', { name: /Ancho de la conversación/ }).dblclick()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 360)
  await app.close()
})

test('en una ventana de menos de 1100 px arranca en 300; el ancho de antes vale para todas', async () => {
  let { app, win } = await abrir(1050)
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 300)
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 300)
  await win.screenshot({ path: 'test-results/or2-ancho-chica.png' })
  await app.close()

  // Un config.json de antes de D-098, con un solo ancho cambiado por el usuario.
  await writeFile(
    join(datos, 'config.json'),
    JSON.stringify({ version: 1, raiz, anchoConversacion: 500, pestanas: [], abierto: null }),
  )
  ;({ app, win } = await abrir())
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 500)
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 500)
  await app.close()
})
