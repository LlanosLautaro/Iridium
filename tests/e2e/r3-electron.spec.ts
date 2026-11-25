// La Revisión en una app Electron (modulos/revision/diseno-tecnico.md › Ayudante de Electron): una app de prueba con la
// línea carga la extensión; F8 comenta con captura y el comentario llega al proyecto de la app, aunque el mismo código
// esté también en otro proyecto (lo dice la carpeta de la app).
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import react from '@vitejs/plugin-react'
import { build, createServer, type ViteDevServer } from 'vite'

// Puertos propios (T-39): con los de r2-revision, que corre justo antes, la primera prueba a veces hablaba con lo que
// quedaba de aquella tanda y fallaba.
const PUERTO = 47392
const PUERTO_APP = 5294
const SALIDA = join(process.cwd(), 'tools', 'salida')

let base: string
let raiz: string
let vite: ViteDevServer
let iridium: ElectronApplication
let luna: ElectronApplication
let ventana: Page
let extension: string

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})

function sinRunAsNode(env: Record<string, string | undefined>): Record<string, string> {
  const e = { ...env } as Record<string, string>
  delete e.ELECTRON_RUN_AS_NODE
  return e
}

const capa = () => ventana.locator('iridium-revision')
const tarjeta = () => capa().locator('.tarjeta')

/** La extensión carga junto con la app (y quizá la recarga una vez): se aprieta F8 hasta que responda. */
async function esperarModoComentar(): Promise<void> {
  await expect
    .poll(
      async () => {
        await ventana.locator('#objetivo').waitFor()
        await ventana.keyboard.press('F8')
        const activo = await capa()
          .locator('.aviso')
          .waitFor({ timeout: 1000 })
          .then(() => true)
          .catch(() => false)
        if (!activo && (await capa().count())) await ventana.keyboard.press('F8')
        return activo
      },
      { timeout: 20_000 },
    )
    .toBe(true)
}

// Cada prueba sigue a la anterior (R-1, R-2, R-3 y la app armada): si una falla, las que siguen no corren, en vez de
// fallar de nuevo en una tanda limpia con un número que no es el suyo (T-39).
test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  await mkdir(join(process.cwd(), 'tests', 'e2e', '.tmp'), { recursive: true })
  base = await mkdtemp(join(process.cwd(), 'tests', 'e2e', '.tmp', 'r3-'))
  raiz = join(base, 'PROYECTOS')
  const datos = join(base, 'datos')
  await mkdir(datos, { recursive: true })
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  // El mismo `src/Tarjeta.jsx` en Alfa y en Luna: por el código no se sabría de cuál es.
  for (const nombre of ['Alfa', 'Luna']) {
    const p = join(raiz, nombre)
    await cp(join(process.cwd(), 'tests', 'e2e', 'app-revision'), p, { recursive: true })
    await writeFile(join(p, '.proyecto.json'), ficha)
  }
  await cp(join(process.cwd(), 'tests', 'e2e', 'app-electron'), join(raiz, 'Luna'), { recursive: true })

  extension = join(base, 'extension')
  await cp(join(process.cwd(), 'out', 'extension'), extension, { recursive: true })
  const sw = join(extension, 'js', 'sw.js')
  await writeFile(
    sw,
    (await readFile(sw, 'utf8')).replace('const PUERTO = 47321', `const PUERTO = ${PUERTO}`),
  )
  for (const n of ['selector', 'inyectado']) {
    const sel = join(extension, 'js', `${n}.js`)
    await writeFile(sel, (await readFile(sel, 'utf8')).replace(`mode: "closed"`, `mode: "open"`))
  }

  vite = await createServer({
    configFile: false,
    root: join(raiz, 'Luna'),
    plugins: [react()],
    server: { port: PUERTO_APP, strictPort: true },
    logLevel: 'warn',
  })
  await vite.listen()

  iridium = await electron.launch({
    args: ['.'],
    env: sinRunAsNode({
      ...process.env,
      IRIDIUM_DATOS: datos,
      IRIDIUM_MOTOR: 'falso',
      IRIDIUM_REVISION_PUERTO: String(PUERTO),
    }),
  })
  await iridium.firstWindow()
  await expect
    .poll(async () => (await fetch(`http://127.0.0.1:${PUERTO}/estado`).catch(() => null))?.status ?? 0, {
      timeout: 15_000,
    })
    .toBe(403)

  luna = await electron.launch({
    args: [join(raiz, 'Luna')],
    env: sinRunAsNode({
      ...process.env,
      IRIDIUM_AYUDANTE: join(extension, 'electron', 'ayudante.mjs'),
      IRIDIUM_REVISION_PUERTO: String(PUERTO),
      LUNA_DATOS: join(base, 'luna-datos'),
      LUNA_URL: `http://localhost:${PUERTO_APP}/`,
    }),
  })
  ventana = await luna.firstWindow()
})

test.afterAll(async () => {
  await luna?.close()
  await iridium?.close()
  await vite?.close()
  await rm(base, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('en una app Electron con la línea, F8 comenta con captura y llega al proyecto de la app', async () => {
  await esperarModoComentar()
  await expect(capa().locator('.aviso')).toContainText('Comentando en Luna')

  await ventana.click('#objetivo')
  await expect(tarjeta().locator('textarea')).toBeFocused()
  await expect(ventana.locator('#clics')).toHaveText('Clics: 0')
  await ventana.keyboard.type('el botón se ve apagado')
  await ventana.waitForTimeout(900)
  await ventana.screenshot({ path: join(SALIDA, 'revision-r3-electron.png') })
  await ventana.keyboard.press('Enter')
  await expect(tarjeta()).toContainText('Guardado en Luna')

  const carpeta = join(raiz, 'Luna', 'docs', 'revision')
  const md = await readFile(join(carpeta, 'R-1.md'), 'utf8')
  expect(md).toMatch(/\*\*Dónde:\*\* `src\/Tarjeta\.jsx`, línea \d+/)
  expect(md).toContain('**Componentes:** Tarjeta › App')
  expect(md).toContain('**Captura:** ![R-1](R-1.png)')
  expect((await stat(join(carpeta, 'R-1.png'))).size).toBeGreaterThan(500)
  await cp(join(carpeta, 'R-1.png'), join(SALIDA, 'revision-r3-captura.png'))
})

test('en la versión armada (desde un archivo, instalada fuera de los proyectos) pregunta una vez y recuerda', async () => {
  await luna.close()
  // La app compilada, sin React de desarrollo: no hay archivo ni línea, pero sí captura.
  const instalada = join(base, 'Programs', 'Luna')
  await cp(join(process.cwd(), 'tests', 'e2e', 'app-electron'), instalada, { recursive: true })
  await build({
    configFile: false,
    root: join(raiz, 'Luna'),
    base: './',
    plugins: [react()],
    logLevel: 'warn',
    build: { outDir: join(instalada, 'dist'), emptyOutDir: true },
  })
  const abrir = async () => {
    luna = await electron.launch({
      args: [instalada],
      env: sinRunAsNode({
        ...process.env,
        IRIDIUM_AYUDANTE: join(extension, 'electron', 'ayudante.mjs'),
        IRIDIUM_REVISION_PUERTO: String(PUERTO),
        LUNA_DATOS: join(base, 'luna-datos'),
        LUNA_ARCHIVO: join(instalada, 'dist', 'index.html'),
      }),
    })
    ventana = await luna.firstWindow()
    await esperarModoComentar()
  }
  await abrir()
  await expect(capa().locator('.aviso')).toContainText('¿De qué proyecto es esta app?')
  await ventana.click('#objetivo')
  await tarjeta().locator('.opciones button', { hasText: 'Luna' }).click()
  await expect(tarjeta().locator('.proy')).toHaveText('Luna')
  await ventana.keyboard.type('en la armada también')
  await ventana.keyboard.press('Enter')
  await expect(tarjeta()).toContainText('Guardado en Luna')
  await expect(tarjeta()).toContainText('R-2')
  const md = await readFile(join(raiz, 'Luna', 'docs', 'revision', 'R-2.md'), 'utf8')
  // Instalada fuera del proyecto: sin las carpetas de la PC (T-34).
  expect(md).toContain('**Página:** …/index.html')
  expect(md).not.toContain('file:///')
  expect(md).not.toContain('**Dónde:**')
  expect((await stat(join(raiz, 'Luna', 'docs', 'revision', 'R-2.png'))).size).toBeGreaterThan(500)

  // Al volver a abrirla ya sabe el proyecto.
  await luna.close()
  await abrir()
  await expect(capa().locator('.aviso')).toContainText('Comentando en Luna')
})

test('en una interfaz propia (luna-app://, como Alfa instalada) el ayudante la mete él, sin captura ni texto', async () => {
  await luna.close()
  const instalada = join(base, 'Programs', 'Luna')
  luna = await electron.launch({
    args: [instalada],
    env: sinRunAsNode({
      ...process.env,
      IRIDIUM_AYUDANTE: join(extension, 'electron', 'ayudante.mjs'),
      IRIDIUM_REVISION_PUERTO: String(PUERTO),
      LUNA_DATOS: join(base, 'luna-datos'),
      LUNA_PROPIA: join(instalada, 'dist', 'index.html'),
    }),
  })
  ventana = await luna.firstWindow()
  await expect.poll(() => ventana.url()).toMatch(/^luna-app:/)
  await esperarModoComentar()
  // La misma carpeta que la armada de la prueba anterior: ya sabe que es Luna.
  await expect(capa().locator('.aviso')).toContainText('Comentando en Luna')
  // La política de contenido de la app no frena los estilos de la capa (su mundo tiene la suya).
  await expect(capa().locator('.aviso')).toHaveCSS('position', 'fixed')

  await ventana.click('#objetivo')
  await expect(ventana.locator('#clics')).toHaveText('Clics: 0')
  await ventana.keyboard.type('en la interfaz propia')
  await ventana.waitForTimeout(900)
  await ventana.screenshot({ path: join(SALIDA, 'revision-propia.png') })
  await ventana.keyboard.press('Enter')
  await expect(tarjeta()).toContainText('Guardado en Luna')
  await expect(tarjeta()).toContainText('R-3')
  const carpeta = join(raiz, 'Luna', 'docs', 'revision')
  const md = await readFile(join(carpeta, 'R-3.md'), 'utf8')
  expect(md).toContain('**Página:** luna-app://interfaz/index.html')
  expect(md).toContain('en la interfaz propia')
  // Compilada sin conservar los nombres, el componente sale abreviado: Alfa los conserva al compilar.
  expect(md).toContain('**Componentes:** ')
  expect(md).not.toContain('**Captura:**')
  expect(md).not.toContain('Guardar')
  await expect(stat(join(carpeta, 'R-3.png'))).rejects.toThrow()

  // Apagada desde la app con el modo comentar abierto: sale, F8 no hace nada y los clics vuelven a la app.
  await expect(tarjeta()).toHaveCount(0)
  await expect(capa()).toHaveCount(1)
  await luna.evaluate(() => (globalThis as { revisionLuna?: { detener(): void } }).revisionLuna?.detener())
  await expect(capa()).toHaveCount(0)
  await ventana.keyboard.press('F8')
  await ventana.waitForTimeout(500)
  await expect(capa()).toHaveCount(0)
  await ventana.click('#objetivo')
  await expect(ventana.locator('#clics')).toHaveText('Clics: 1')
})
