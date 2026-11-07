// Hito 8, tanda 6 (08-calidad.md › Defectos 17, 18 y 19): agrandar la letra con Ctrl+= y que la app no se corte, los
// menús con las flechas y el foco en el título de la pantalla nueva. Con la app abierta y el motor falso.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let abiertas: ElectronApplication[] = []

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
  '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'

// Sin `setViewportSize`: la ventana de 1440 × 900 tal cual, para que el zoom cambie su ancho como con el usuario.
async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abiertas.push(app)
  const win = await app.firstWindow()
  // Vuelve a lo que estaba abierto (D-060): la barra de estado está siempre.
  await expect(win.locator('.estado-barra')).toContainText('Claude')
  return { app, win }
}

const zoomDe = (app: ElectronApplication) =>
  app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.webContents.getZoomFactor())

/** Lo que queda fuera de la ventana a la derecha (en píxeles de la página); 0 si nada se corta. */
const cortado = (win: Page) =>
  win.evaluate(() =>
    Math.max(
      0,
      ...[
        ...document.querySelectorAll('.estado-barra, main.trabajo, main.trabajo > *, main.trabajo > * > *'),
      ].map((el) => el.getBoundingClientRect().right - window.innerWidth),
    ),
  )

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  for (const nombre of ['Alfa', 'Beta']) {
    await mkdir(join(raiz, nombre, 'docs'), { recursive: true })
    await writeFile(join(raiz, nombre, '.proyecto.json'), ficha)
    await writeFile(join(raiz, nombre, 'docs', 'estado.md'), estado)
  }
})

test.afterEach(async () => {
  for (const a of abiertas) await a.close().catch(() => {})
  abiertas = []
  await rm(raiz, { recursive: true, force: true, maxRetries: 5 })
  await rm(datos, { recursive: true, force: true, maxRetries: 5 })
})

test('Ctrl+= agranda todo sin cortar la app, se recuerda al volver a abrir y Ctrl+0 lo vuelve (Defecto 17)', async () => {
  let { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(win.locator('main.trabajo h1')).toHaveText('Alfa')
  expect(await zoomDe(app)).toBeCloseTo(1)

  // 100 → 110 → 125 → 150 %.
  for (let i = 0; i < 3; i++) await win.keyboard.press('Control+Equal')
  await expect.poll(() => zoomDe(app)).toBeCloseTo(1.5)
  await expect
    .poll(() => win.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--zoom')))
    .toBe('1.5')
  // 1440 px de pantalla son 960 de la página: menos que los 1024 de antes, y nada queda afuera.
  expect(await win.evaluate(() => window.innerWidth)).toBeLessThan(1024)
  expect(await cortado(win)).toBe(0)
  // La captura de Playwright no sigue el zoom: la de la ventana, como se ve en la pantalla.
  const png = await app.evaluate(async ({ BrowserWindow }) =>
    (await BrowserWindow.getAllWindows()[0]?.capturePage())?.toPNG().toString('base64'),
  )
  await writeFile(join('test-results', 'd17-zoom-150.png'), Buffer.from(png ?? '', 'base64'))
  await expect
    .poll(async () => JSON.parse(await readFile(join(datos, 'config.json'), 'utf8')).zoom)
    .toBeCloseTo(1.5)

  await app.close()
  ;({ app, win } = await abrir())
  await expect.poll(() => zoomDe(app)).toBeCloseTo(1.5)
  await win.keyboard.press('Control+Minus')
  await expect.poll(() => zoomDe(app)).toBeCloseTo(1.25)
  await win.keyboard.press('Control+0')
  await expect.poll(() => zoomDe(app)).toBeCloseTo(1)
  await app.close()
})

test('los menús se recorren con las flechas, Esc vuelve al botón y Tab afuera los cierra (Defecto 18)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const boton = win.locator('.compositor').getByRole('button', { name: 'Opus' })
  await boton.focus()
  await win.keyboard.press('Enter')
  // Al abrir, el foco en la opción elegida: Predeterminado es la de Claude Code.
  await expect(win.getByRole('menuitemradio', { name: /^Predeterminado/ })).toBeFocused()
  await win.keyboard.press('ArrowDown')
  await expect(win.getByRole('menuitemradio', { name: /^Opus/ })).toBeFocused()
  await win.keyboard.press('End')
  await expect(win.getByRole('menuitemradio', { name: /^Haiku/ })).toBeFocused()
  await win.keyboard.press('ArrowDown')
  await expect(win.getByRole('menuitemradio', { name: /^Predeterminado/ })).toBeFocused()
  await win.keyboard.press('ArrowUp')
  await expect(win.getByRole('menuitemradio', { name: /^Haiku/ })).toBeFocused()
  await win.keyboard.press('Escape')
  await expect(win.getByRole('menu')).toHaveCount(0)
  await expect(boton).toBeFocused()

  // La flecha abajo sobre el botón también lo abre; Tab desde la última opción sale y lo cierra.
  await win.keyboard.press('ArrowDown')
  await expect(win.getByRole('menu')).toBeVisible()
  await win.keyboard.press('End')
  await win.keyboard.press('Tab')
  await expect(win.getByRole('menu')).toHaveCount(0)
  await app.close()
})

test('al cambiar de pantalla con un atajo o abrir un proyecto con Enter, el foco va al título (Defecto 19)', async () => {
  const { app, win } = await abrir()
  // Sin nada que responder, Pendientes no tiene título de columna: el foco va a «Nada te espera».
  await win.keyboard.press('Control+2')
  await expect(win.getByRole('heading', { name: 'Nada en tu bandeja' })).toBeFocused()
  await win.keyboard.press('Control+1')
  await expect(win.getByRole('heading', { name: 'Proyectos', level: 1 })).toBeFocused()

  await win.locator('.tarjeta', { hasText: 'Beta' }).focus()
  await win.keyboard.press('Enter')
  await expect(win.getByRole('heading', { name: 'Beta', level: 1 })).toBeFocused()
  // El próximo Tab sigue desde el título, no desde las pestañas de arriba.
  await win.keyboard.press('Tab')
  expect(await win.evaluate(() => !!document.activeElement?.closest('main.trabajo'))).toBe(true)
  await app.close()
})
