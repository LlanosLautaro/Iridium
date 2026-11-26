// DI-I4 con la app abierta y el motor falso: Probar una dirección (DS-5, DS-9, DS-11) sobre la muestra
// `tests/muestras/diseno` — la guardada se pone sobre todo el lienzo y sobre la grande, Hoy · Dirección · Lado a lado
// alterna, Elegir (con su cuadro) la vuelve los tokens y guarda los de hoy, Descartar la manda a la papelera, y una
// nueva queda citada en la conversación (D-196) y se pone sola cuando la IA la escribe.
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let base: string
let raiz: string
let datos: string
let papelera: string
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
const estado =
  '# Estado del proyecto\n\n**Última actualización:** 2026-11-26\n\n## Hito actual\n6 — UI — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'

/** El fondo de la muestra con la dirección azul apagado (`--fondo: #05070d`) y como está hoy (`#000000`). */
const AZUL = 'rgb(5, 7, 13)'
const NEGRO = 'rgb(0, 0, 0)'

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '60',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_PAPELERA: papelera,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

/** El fondo de la página de la maqueta grande (el `webview`). */
function fondoGrande(app: ElectronApplication): Promise<string> {
  return app
    .evaluate(async ({ webContents }) => {
      const w = webContents.getAllWebContents().find((x) => x.getType() === 'webview')
      if (!w) throw new Error('No hay webview')
      return w.executeJavaScript('getComputedStyle(document.body).backgroundColor') as Promise<string>
    })
    .catch(() => '')
}

/** El fondo de la miniatura que carga ese archivo por esa base (`/~azul-apagado/pantallas/lista.html` o sin ella). */
async function fondoMini(
  win: Page,
  conDireccion: boolean,
  archivo = 'pantallas/lista.html',
): Promise<string> {
  const f = win
    .frames()
    .find(
      (x) =>
        x.url().startsWith('maqueta:') &&
        x.url().includes(archivo) &&
        x.url().includes('/~azul-apagado/') === conDireccion,
    )
  return f ? f.evaluate(() => getComputedStyle(document.body).backgroundColor).catch(() => '') : ''
}

async function entrarADiseno(win: Page) {
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Diseño' })
    .click()
  return win.locator('[data-seccion="diseno"]')
}

const alfa = (...p: string[]) => join(raiz, 'Alfa', 'docs', 'diseno', ...p)
const hoy = () => {
  const d = new Date()
  const n = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${n(d.getMonth() + 1)}-${n(d.getDate())}`
}

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-di4d-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  papelera = join(base, 'papelera')
  await cp(join(import.meta.dirname, '..', 'muestras', 'diseno'), join(raiz, 'Alfa'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), estado)
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
  await rm(base, { recursive: true, force: true, maxRetries: 5 })
})

test('una guardada sobre todo el lienzo y la grande, Hoy · Dirección · Lado a lado, y Elegir', async () => {
  const { app, win } = await abrir()
  const diseno = await entrarADiseno(win)
  await expect.poll(() => fondoMini(win, false), { timeout: 10_000 }).toBe(NEGRO)

  // El menú ofrece la guardada, con su frase, y una nueva.
  await diseno.getByRole('button', { name: 'Probar una dirección' }).click()
  const opcion = win.getByRole('menuitemradio', { name: /azul apagado/ })
  await expect(opcion).toContainText('Negro con azul apagado.')
  await expect(win.getByRole('menuitem', { name: /Una nueva/ })).toBeVisible()
  await win.screenshot({ path: 'test-results/di4-direcciones-menu.png' })
  await opcion.click()

  // Todo el lienzo con la dirección, y la línea que lo dice.
  const linea = diseno.getByRole('status', { name: 'Probando la dirección azul apagado' })
  await expect(linea).toContainText('Probando: azul apagado')
  await expect.poll(() => fondoMini(win, true), { timeout: 10_000 }).toBe(AZUL)
  await expect.poll(() => fondoMini(win, true, 'pantallas/nota.html'), { timeout: 10_000 }).toBe(AZUL)
  await win.screenshot({ path: 'test-results/di4-direccion-lienzo.png' })

  // Hoy: como está; Lado a lado: cada una con la de hoy al lado.
  await linea.getByRole('button', { name: 'Hoy' }).click()
  await expect(diseno.locator('.di-mini')).toHaveCount(3)
  await expect.poll(() => fondoMini(win, false), { timeout: 10_000 }).toBe(NEGRO)
  await linea.getByRole('button', { name: 'Lado a lado' }).click()
  await expect(diseno.locator('.di-par')).toHaveCount(3)
  await expect(diseno.locator('.di-mini')).toHaveCount(6)
  await expect.poll(() => fondoMini(win, true), { timeout: 10_000 }).toBe(AZUL)
  await expect.poll(() => fondoMini(win, false), { timeout: 10_000 }).toBe(NEGRO)
  await win.screenshot({ path: 'test-results/di4-direccion-lado.png' })

  // La grande, con la dirección encima (y lo dice); la de hoy, agrandada desde Lado a lado, sin ella.
  await diseno.locator('.di-par').first().locator('.di-mini').nth(1).click()
  const titulo = diseno.locator('.di-grande-t')
  await expect(titulo).toContainText('con «azul apagado»')
  await expect.poll(() => fondoGrande(app), { timeout: 10_000 }).toBe(AZUL)
  await win.screenshot({ path: 'test-results/di4-direccion-grande.png' })
  await win.keyboard.press('Escape')
  await diseno.locator('.di-par').first().locator('.di-mini').first().click()
  await expect(titulo).not.toContainText('con «')
  await expect.poll(() => fondoGrande(app), { timeout: 10_000 }).toBe(NEGRO)
  await win.keyboard.press('Escape')

  // Elegir: el cuadro dice qué cambia; los tokens pasan a ser los de la dirección y los de hoy quedan guardados.
  const tokensHoy = await readFile(alfa('tokens.css'), 'utf8')
  const azul = await readFile(alfa('direcciones', 'azul-apagado.css'), 'utf8')
  await linea.getByRole('button', { name: 'Elegir' }).click()
  const cuadro = win.getByRole('dialog', { name: 'Elegir «azul apagado»' })
  await expect(cuadro).toContainText('todas las maquetas')
  await win.screenshot({ path: 'test-results/di4-direccion-elegir.png' })
  await cuadro.getByRole('button', { name: 'Elegir' }).click()
  await expect(diseno.getByText('Elegida «azul apagado»')).toBeVisible()
  await expect(linea).toHaveCount(0)
  expect(await readFile(alfa('tokens.css'), 'utf8')).toBe(azul)
  const anterior = await readFile(alfa('direcciones', `anterior-${hoy()}.css`), 'utf8')
  expect(anterior).toContain(tokensHoy)
  expect((await readdir(papelera)).map((n) => n.replace(/^\d+-/, ''))).toEqual(['azul-apagado.css'])
  // Ya sin dirección puesta, el lienzo es azul: son sus tokens.
  await expect.poll(() => fondoMini(win, false), { timeout: 10_000 }).toBe(AZUL)
  // Y la de antes se ofrece para volver.
  await diseno.getByRole('button', { name: 'Probar una dirección' }).click()
  await expect(win.getByRole('menuitemradio', { name: new RegExp(`anterior ${hoy()}`) })).toContainText(
    'La de antes de elegir «azul apagado»',
  )
  await app.close()
})

test('Descartar: su archivo va a la papelera y el lienzo queda como está', async () => {
  const { app, win } = await abrir()
  const diseno = await entrarADiseno(win)
  await diseno.getByRole('button', { name: 'Probar una dirección' }).click()
  await win.getByRole('menuitemradio', { name: /azul apagado/ }).click()
  const linea = diseno.getByRole('status', { name: 'Probando la dirección azul apagado' })
  await linea.getByRole('button', { name: 'Descartar' }).click()
  await expect(diseno.getByText('Descartada «azul apagado»')).toBeVisible()
  await expect(linea).toHaveCount(0)
  expect((await readdir(papelera)).map((n) => n.replace(/^\d+-/, ''))).toEqual(['azul-apagado.css'])
  expect(await readdir(alfa('direcciones'))).toEqual([])
  await expect.poll(() => fondoMini(win, false), { timeout: 10_000 }).toBe(NEGRO)
  await app.close()
})

test('Una nueva: queda citada en la conversación y se pone sola cuando la IA la escribe', async () => {
  const { app, win } = await abrir()
  const diseno = await entrarADiseno(win)
  await diseno.getByRole('button', { name: 'Probar una dirección' }).click()
  await win.getByRole('menuitem', { name: /Una nueva/ }).click()
  // D-196: sin cuadro propio, citada arriba del campo de la conversación, sin mandar.
  await expect(win.getByRole('dialog')).toHaveCount(0)
  const cita = win.locator('.compositor .citado')
  await expect(cita).toHaveCount(1)
  await expect(cita).toContainText('Dirección nueva')
  await expect(diseno.getByText('Citada en la conversación: escribí qué dirección probar')).toBeVisible()
  await expect(win.locator('.hilo .turno')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/di4-direccion-nueva.png' })

  // Mandada con lo que se prueba: mientras la IA trabaja, lo dice; el motor falso no la escribe y al terminar se dice.
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('el negro con un verde apagado')
  await campo.press('Enter')
  await expect(cita).toHaveCount(0)
  await expect(diseno.getByText('La IA está escribiendo la dirección…')).toBeVisible()
  await expect(win.getByRole('complementary', { name: 'Conversación' })).toContainText(
    'Escribí una dirección nueva para todas las maquetas',
    { timeout: 10_000 },
  )
  await expect(win.getByRole('button', { name: 'Detener' })).toHaveCount(0, { timeout: 20_000 })
  await expect(diseno.getByText('La IA terminó sin escribir la dirección')).toBeVisible()

  // Pedida otra vez: cuando aparece el archivo (la escribe la IA), se pone sobre el lienzo.
  await diseno.getByRole('button', { name: 'Probar una dirección' }).click()
  await win.getByRole('menuitem', { name: /Una nueva/ }).click()
  const azul = await readFile(alfa('direcciones', 'azul-apagado.css'), 'utf8')
  await writeFile(
    alfa('direcciones', 'verde-apagado.css'),
    azul
      .replace('/* Negro con azul apagado. */', '/* Negro con un verde apagado. */')
      .replace('#05070d', '#050d07'),
  )
  const linea = diseno.getByRole('status', { name: 'Probando la dirección verde apagado' })
  await expect(linea).toContainText('Negro con un verde apagado.', { timeout: 10_000 })
  await expect(diseno.getByText('Citada en la conversación: escribí qué dirección')).toHaveCount(0)
  await app.close()
})
