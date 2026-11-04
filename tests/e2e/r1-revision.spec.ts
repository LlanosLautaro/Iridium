// R-I1 de la Revisión (modulos/revision/diseno-tecnico.md › Pruebas): Edge con la extensión sobre una app de prueba con
// React y Vite, e Iridium con datos aparte y el motor falso. Activar con F8, resaltar, Alt+↑, dejar, ver `R-1.md` con
// archivo, línea y captura; borradores; Iridium cerrado → cola → llega al abrirlo; si no sabe el proyecto, pregunta.
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  type BrowserContext,
  chromium,
  type ElectronApplication,
  _electron as electron,
  expect,
  type Page,
  test,
} from '@playwright/test'
import react from '@vitejs/plugin-react'
import { createServer, type ViteDevServer } from 'vite'

const PUERTO = 47390
const PUERTO_APP = 5291
// La misma app copiada en otro proyecto (Sol) y servida en otra dirección: Iridium no puede saber de cuál es.
const PUERTO_SOL = 5292
const SALIDA = join(process.cwd(), 'tools', 'salida')

let base: string
let raiz: string
let datos: string
let extension: string
let vite: ViteDevServer
let viteSol: ViteDevServer
let navegador: BrowserContext
let pagina: Page
let iridium: ElectronApplication | null = null

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})

async function abrirIridium(): Promise<void> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION_PUERTO: String(PUERTO),
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  iridium = await electron.launch({ args: ['.'], env })
  await iridium.firstWindow()
  // El receptor arranca después de la ventana: se espera a que responda (con cualquier origen da 403).
  await expect
    .poll(async () => (await fetch(`http://127.0.0.1:${PUERTO}/estado`).catch(() => null))?.status ?? 0, {
      timeout: 15_000,
    })
    .toBe(403)
}

async function cerrarIridium(): Promise<void> {
  await iridium?.close()
  iridium = null
}

const capa = () => pagina.locator('iridium-revision')
const tarjeta = () => capa().locator('.tarjeta')

async function colaDeLaExtension(): Promise<number> {
  const sw = navegador.serviceWorkers()[0] ?? (await navegador.waitForEvent('serviceworker'))
  return sw.evaluate(async () => {
    const { cola } = await (
      globalThis as unknown as {
        chrome: { storage: { local: { get(k: string): Promise<{ cola?: unknown[] }> } } }
      }
    ).chrome.storage.local.get('cola')
    return Array.isArray(cola) ? cola.length : 0
  })
}

test.beforeAll(async () => {
  // Adentro del repo, para que Vite encuentre React en su `node_modules`.
  await mkdir(join(process.cwd(), 'tests', 'e2e', '.tmp'), { recursive: true })
  base = await mkdtemp(join(process.cwd(), 'tests', 'e2e', '.tmp', 'r1-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  await mkdir(datos, { recursive: true })
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  const alfa = join(raiz, 'Alfa')
  await cp(join(process.cwd(), 'tests', 'e2e', 'app-revision'), alfa, { recursive: true })
  await writeFile(join(alfa, '.proyecto.json'), ficha)
  await mkdir(join(alfa, 'docs'), { recursive: true })
  await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Hito actual\n7 — Construcción\n')
  await mkdir(join(raiz, 'Beta', 'src'), { recursive: true })
  await writeFile(join(raiz, 'Beta', '.proyecto.json'), ficha)

  // La extensión armada, con el puerto de la prueba y el Shadow DOM abierto para poder mirarlo.
  extension = join(base, 'extension')
  await cp(join(process.cwd(), 'out', 'extension'), extension, { recursive: true })
  const sw = join(extension, 'js', 'sw.js')
  await writeFile(
    sw,
    (await readFile(sw, 'utf8')).replace('const PUERTO = 47321', `const PUERTO = ${PUERTO}`),
  )
  const sel = join(extension, 'js', 'selector.js')
  await writeFile(sel, (await readFile(sel, 'utf8')).replace(`mode: "closed"`, `mode: "open"`))

  vite = await createServer({
    configFile: false,
    root: alfa,
    plugins: [react()],
    server: { port: PUERTO_APP, strictPort: true },
    logLevel: 'warn',
  })
  await vite.listen()

  navegador = await chromium.launchPersistentContext('', {
    channel: 'msedge',
    headless: true,
    viewport: { width: 1280, height: 800 },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  })
  pagina = navegador.pages()[0] ?? (await navegador.newPage())
  await abrirIridium()
})

test.afterAll(async () => {
  await cerrarIridium()
  await navegador?.close()
  await vite?.close()
  await viteSol?.close()
  await rm(base, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('dejar un comentario: F8, resaltado, Alt+↑, el clic no llega a la app, R-1 con archivo, línea y captura', async () => {
  await pagina.goto(`http://localhost:${PUERTO_APP}/`)
  await expect(pagina.locator('#objetivo')).toBeVisible()
  await pagina.waitForTimeout(400) // los scripts de la extensión corren en document_idle

  await pagina.keyboard.press('F8')
  // La primera vez Iridium todavía no sabe el proyecto (lo busca por el proceso y por el código), pero está abierto.
  await expect(capa().locator('.aviso')).toContainText(/Comentando(?! · Iridium está cerrado)/)
  // No hay barra sobre la app (D-049): el aviso se va solo.
  await expect(capa().locator('.aviso')).toHaveCount(0, { timeout: 4000 })

  await pagina.hover('#objetivo')
  await expect(capa().locator('.etiqueta')).toHaveText(/Tarjeta\s*›\s*button/)
  await pagina.keyboard.press('Alt+ArrowUp')
  await expect(capa().locator('.etiqueta')).toHaveText(/Tarjeta\s*›\s*section/)
  await pagina.keyboard.press('Alt+ArrowDown')
  await expect(capa().locator('.etiqueta')).toHaveText(/Tarjeta\s*›\s*button/)

  await pagina.click('#objetivo')
  await expect(tarjeta().locator('textarea')).toBeFocused()
  await expect(pagina.locator('#clics')).toHaveText('Clics: 0')
  // Por el código: `src/Tarjeta.jsx` está solo en Alfa. El primero ya sabe el proyecto (lo resolvió /estado o el código).
  await pagina.keyboard.type('el botón queda muy pegado al título; separalo')
  await pagina.screenshot({ path: join(SALIDA, 'revision-r1-tarjeta.png') })
  // Como una persona, tarda en escribir: la pista de React tiene que seguir ahí pasada la espera del selector (600 ms).
  await pagina.waitForTimeout(900)
  await pagina.keyboard.press('Enter')
  await expect(tarjeta()).toContainText('Guardado en Alfa')
  await pagina.screenshot({ path: join(SALIDA, 'revision-r1-guardado.png') })

  const carpeta = join(raiz, 'Alfa', 'docs', 'revision')
  const md = await readFile(join(carpeta, 'R-1.md'), 'utf8')
  expect(md).toContain('# R-1 — el botón queda muy pegado al título; separalo')
  expect(md).toMatch(/\*\*Dónde:\*\* `src\/Tarjeta\.jsx`, línea \d+/)
  expect(md).toContain('**Componentes:** Tarjeta › App')
  expect(md).toContain('**Elemento:** `button` · texto «Guardar»')
  expect(md).toContain('**Captura:** ![R-1](R-1.png)')
  expect((await stat(join(carpeta, 'R-1.png'))).size).toBeGreaterThan(500)
  await cp(join(carpeta, 'R-1.png'), join(SALIDA, 'revision-r1-captura.png'))
  // La línea es la del <button> en Tarjeta.jsx.
  const lineas = (await readFile(join(raiz, 'Alfa', 'src', 'Tarjeta.jsx'), 'utf8')).split('\n')
  const n = Number(/línea (\d+)/.exec(md)?.[1])
  expect(lineas[n - 1]).toContain('<button')

  // Sigue en modo comentar; F8 sale y la app vuelve a recibir clics.
  await expect(tarjeta()).toHaveCount(0, { timeout: 3000 })
  await pagina.keyboard.press('F8')
  await expect(capa()).toHaveCount(0)
  await pagina.click('#objetivo')
  await expect(pagina.locator('#clics')).toHaveText('Clics: 1')
})

test('lo escrito queda si se cierra la tarjeta', async () => {
  await pagina.keyboard.press('F8')
  await pagina.click('h2')
  await expect(tarjeta().locator('textarea')).toBeFocused()
  await pagina.keyboard.type('a medio escribir')
  await pagina.keyboard.press('Escape')
  await expect(tarjeta()).toHaveCount(0)
  await pagina.click('h2')
  await expect(tarjeta().locator('textarea')).toHaveValue('a medio escribir')
  await pagina.keyboard.press('Escape')
  await pagina.keyboard.press('Escape')
  await expect(capa()).toHaveCount(0)
})

test('con Iridium cerrado queda en la cola de la extensión y llega al abrirlo', async () => {
  await cerrarIridium()
  await pagina.keyboard.press('F8')
  await expect(capa().locator('.aviso')).toContainText('Iridium está cerrado')
  await pagina.click('#objetivo')
  await expect(tarjeta()).toContainText('Iridium está cerrado')
  await expect(tarjeta().locator('textarea')).toBeFocused()
  await pagina.keyboard.type('el color del botón no se lee bien')
  await pagina.keyboard.press('Enter')
  await expect(tarjeta()).toContainText('Queda acá')
  await pagina.screenshot({ path: join(SALIDA, 'revision-r1-cola.png') })
  expect(await colaDeLaExtension()).toBe(1)

  await abrirIridium()
  // Al volver a entrar, /estado responde y la extensión vacía la cola.
  await pagina.keyboard.press('Escape')
  await pagina.keyboard.press('F8')
  await pagina.keyboard.press('F8')
  const r2 = join(raiz, 'Alfa', 'docs', 'revision', 'R-2.md')
  await expect
    .poll(async () => (await readFile(r2, 'utf8').catch(() => '')).includes('el color del botón'), {
      timeout: 10_000,
    })
    .toBe(true)
  await expect.poll(colaDeLaExtension).toBe(0)
})

test('si no sabe de qué proyecto es, pregunta; sin elegir lo busca por el código y, si no alcanza, vuelve a preguntar', async () => {
  // Recién ahora aparece Sol: antes, `src/Tarjeta.jsx` estaba solo en Alfa.
  const sol = join(raiz, 'Sol')
  await cp(join(process.cwd(), 'tests', 'e2e', 'app-revision'), sol, { recursive: true })
  await writeFile(join(sol, '.proyecto.json'), ficha)
  viteSol = await createServer({
    configFile: false,
    root: sol,
    plugins: [react()],
    server: { port: PUERTO_SOL, strictPort: true },
    logLevel: 'warn',
  })
  await viteSol.listen()

  await pagina.goto(`http://localhost:${PUERTO_SOL}/`)
  await expect(pagina.locator('#objetivo')).toBeVisible()
  await pagina.waitForTimeout(400)

  await pagina.keyboard.press('F8')
  await expect(capa().locator('.aviso')).toContainText('¿De qué proyecto es esta app?')
  await pagina.click('#objetivo')
  await expect(tarjeta().locator('.elegir')).toContainText(`¿De qué proyecto es localhost:${PUERTO_SOL}?`)
  await expect(tarjeta().locator('.opciones button')).toHaveText(['Alfa', 'Beta', 'Sol'])
  await pagina.keyboard.type('falta un margen abajo')
  await pagina.screenshot({ path: join(SALIDA, 'revision-r1-preguntar.png') })

  // Sin elegir: `src/Tarjeta.jsx` está en Alfa y en Sol, así que Iridium no adivina y la tarjeta lo vuelve a pedir.
  await pagina.keyboard.press('Enter')
  await expect(tarjeta()).toContainText('Iridium no sabe de qué proyecto es')
  await expect(tarjeta().locator('textarea')).toHaveValue('falta un margen abajo')

  await tarjeta().locator('.opciones button', { hasText: 'Sol' }).click()
  await expect(tarjeta().locator('.proy')).toHaveText('Sol')
  await tarjeta().locator('[data-accion="dejar"]').click()
  await expect(tarjeta()).toContainText('Guardado en Sol')
  const md = await readFile(join(raiz, 'Sol', 'docs', 'revision', 'R-1.md'), 'utf8')
  expect(md).toContain('falta un margen abajo')
  expect(md).toMatch(/\*\*Dónde:\*\* `src\/Tarjeta\.jsx`, línea \d+/)

  // La próxima vez ya lo sabe.
  await expect(tarjeta()).toHaveCount(0, { timeout: 3000 })
  await pagina.keyboard.press('F8')
  await pagina.keyboard.press('F8')
  await expect(capa().locator('.aviso')).toContainText('Comentando en Sol')
  await pagina.keyboard.press('F8')
})
