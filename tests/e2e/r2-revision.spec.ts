// R-I2 de la Revisión (modulos/revision/diseno-tecnico.md › Pruebas): Edge con la extensión sobre una app de prueba e
// Iridium con datos aparte y el motor falso. Enviar ahora sin sesión y con el proyecto abierto (el mensaje entra a la
// conversación como tarjeta); la sección Revisión con su contador, la lista, el detalle, el enlace a Archivos en la
// línea; la IA lo cierra y pasa a Cerrados; se reabre con una nota; un proyecto Electron sin la línea.
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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

const PUERTO = 47391
const PUERTO_APP = 5293
const SALIDA = join(process.cwd(), 'tools', 'salida')

let base: string
let raiz: string
let datos: string
let vite: ViteDevServer
let navegador: BrowserContext
let pagina: Page
let iridium: ElectronApplication
let win: Page

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})

const capa = () => pagina.locator('iridium-revision')
const tarjeta = () => capa().locator('.tarjeta')
const revisionAlfa = () => join(raiz, 'Alfa', 'docs', 'revision')
const seccion = () => win.locator('[data-seccion="revision"]')
const botonRevision = () =>
  win.getByRole('navigation', { name: 'Secciones del proyecto' }).getByRole('button', { name: /^Revisión/ })

/** Comenta el botón de la app; `enviar` usa Ctrl+Enter (Enviar ahora). */
async function comentar(texto: string, enviar: boolean): Promise<void> {
  await pagina.keyboard.press('F8')
  await pagina.click('#objetivo')
  await expect(tarjeta().locator('textarea')).toBeFocused()
  await pagina.keyboard.type(texto)
  // Como una persona: la pista de React tiene que estar lista.
  await pagina.waitForTimeout(700)
  await pagina.keyboard.press(enviar ? 'Control+Enter' : 'Enter')
}

test.beforeAll(async () => {
  await mkdir(join(process.cwd(), 'tests', 'e2e', '.tmp'), { recursive: true })
  base = await mkdtemp(join(process.cwd(), 'tests', 'e2e', '.tmp', 'r2-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  await mkdir(datos, { recursive: true })
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  const alfa = join(raiz, 'Alfa')
  await cp(join(process.cwd(), 'tests', 'e2e', 'app-revision'), alfa, { recursive: true })
  await writeFile(join(alfa, '.proyecto.json'), ficha)
  await mkdir(join(alfa, 'docs'), { recursive: true })
  await writeFile(
    join(alfa, 'docs', 'estado.md'),
    '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n',
  )
  // Un proyecto Electron que todavía no carga la línea de la Revisión.
  const gamma = join(raiz, 'Gamma')
  await mkdir(join(gamma, 'src'), { recursive: true })
  await writeFile(join(gamma, '.proyecto.json'), ficha)
  await writeFile(join(gamma, 'package.json'), JSON.stringify({ devDependencies: { electron: '44.0.0' } }))
  await writeFile(join(gamma, 'src', 'main.ts'), "import { app } from 'electron'\n")

  const extension = join(base, 'extension')
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

  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '150',
    IRIDIUM_REVISION_PUERTO: String(PUERTO),
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  iridium = await electron.launch({ args: ['.'], env })
  win = await iridium.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  await expect
    .poll(async () => (await fetch(`http://127.0.0.1:${PUERTO}/estado`).catch(() => null))?.status ?? 0, {
      timeout: 15_000,
    })
    .toBe(403)

  await pagina.goto(`http://localhost:${PUERTO_APP}/`)
  await expect(pagina.locator('#objetivo')).toBeVisible()
  await pagina.waitForTimeout(400)
})

test.afterAll(async () => {
  await iridium?.close()
  await navegador?.close()
  await vite?.close()
  await rm(base, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('Enviar ahora sin el proyecto abierto en Iridium: queda guardado y la tarjeta lo dice', async () => {
  await comentar('el botón queda muy pegado al título; separalo', true)
  await expect(tarjeta()).toContainText('Guardado como R-1')
  await expect(tarjeta()).toContainText('No hay una sesión abierta en Alfa')
  await pagina.screenshot({ path: join(SALIDA, 'revision-r2-sin-sesion.png') })
  const md = await readFile(join(revisionAlfa(), 'R-1.md'), 'utf8')
  expect(md).not.toContain('enviado a la sesión')
  await pagina.keyboard.press('Escape')
  await pagina.keyboard.press('F8')
  await expect(capa()).toHaveCount(0)
})

test('Revisión en Iridium: el contador en gris, la lista con la captura y el detalle', async () => {
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(botonRevision().locator('.badge')).toHaveText('1')
  await expect(botonRevision().locator('.badge')).toHaveClass(/neutro/)
  await botonRevision().click()
  const fila = seccion().locator('.fila-com', { hasText: 'R-1' })
  await expect(fila).toContainText('el botón queda muy pegado')
  await expect(fila).toContainText('Tarjeta.jsx:')
  await expect(fila.locator('.cap img')).toBeVisible()
  await expect(seccion().locator('.grupos')).toContainText('Abiertos 1')
  await expect(seccion().locator('.ext-est')).toContainText('conectada por última vez hoy')
  await win.screenshot({ path: join(SALIDA, 'revision-r2-lista.png') })

  await fila.click()
  await expect(seccion().locator('.det-barra')).toContainText('R-1')
  await expect(seccion().locator('.det-barra')).toContainText('abierto')
  await expect(seccion().locator('.historia li')).toHaveCount(1)
  await expect(seccion().locator('.historia')).toContainText('dejado')
  await win.screenshot({ path: join(SALIDA, 'revision-r2-detalle.png') })

  // El archivo y la línea abren Archivos con esa línea marcada; Atrás vuelve al comentario.
  await seccion().locator('.enlace-archivo').click()
  const archivos = win.locator('[data-seccion="archivos"]')
  await expect(archivos.locator('.visor-cab .ruta')).toHaveText('src/Tarjeta.jsx')
  await expect(archivos.locator('.codigo .marcada')).toContainText('<button')
  await win.screenshot({ path: join(SALIDA, 'revision-r2-archivo.png') })
  await archivos.getByRole('button', { name: 'Atrás' }).click()
  await expect(seccion().locator('.det-barra')).toContainText('R-1')
})

test('Enviar ahora desde la app con el proyecto abierto: entra a la conversación como tarjeta', async () => {
  await comentar('el título tiene que ir en negrita', true)
  await expect(tarjeta()).toContainText('Enviado a la sesión de Alfa')
  await pagina.screenshot({ path: join(SALIDA, 'revision-r2-enviado.png') })
  await expect(tarjeta()).toHaveCount(0, { timeout: 3000 })
  await pagina.keyboard.press('F8')

  const com = win.locator('.hilo .msg-com')
  await expect(com).toHaveCount(1)
  await expect(com.locator('.cab')).toContainText('Comentario R-2')
  await expect(com.locator('.cab')).toContainText('Tarjeta.jsx:')
  await expect(com).toContainText('el título tiene que ir en negrita')
  await expect(com.locator('.cap img')).toBeVisible()
  const md = await readFile(join(revisionAlfa(), 'R-2.md'), 'utf8')
  expect(md).toMatch(/— enviado a la sesión/)
  // La IA (falsa) terminó su turno.
  await expect(win.locator('.ses', { hasText: 'Alfa' })).not.toContainText('Trabajando', { timeout: 15_000 })
  await expect(botonRevision().locator('.badge')).toHaveText('2')
  await win.screenshot({ path: join(SALIDA, 'revision-r2-conversacion.png') })

  // Tocar la tarjeta abre el comentario en Revisión.
  await com.click()
  await expect(seccion().locator('.det-barra')).toContainText('R-2')
  await expect(seccion().locator('.historia')).toContainText('enviado a la sesión')
})

test('Enviar ahora desde Revisión, la IA lo cierra y pasa a Cerrados; se reabre con una nota', async () => {
  // Atrás vuelve un paso: de R-2 (abierto desde la conversación) a R-1, que se miraba antes.
  await seccion().getByRole('button', { name: 'Atrás' }).click()
  await expect(seccion().locator('.det-barra .cod-r')).toHaveText('R-1')
  await seccion().getByRole('button', { name: 'Enviar ahora' }).click()
  await expect(seccion().locator('.det-barra')).toContainText('enviado a la sesión de Alfa')
  await expect(win.locator('.hilo .msg-com')).toHaveCount(2)
  await expect(win.locator('.ses', { hasText: 'Alfa' })).not.toContainText('Trabajando', { timeout: 15_000 })

  // La IA lo cierra en el archivo, como le pide la instrucción.
  const r1 = join(revisionAlfa(), 'R-1.md')
  const md = await readFile(r1, 'utf8')
  await writeFile(
    r1,
    `${md
      .replace('**Estado:** abierto', '**Estado:** cerrado')
      .trimEnd()}\n- 2026-10-29 15:05 — cerrado por la IA: separó el título con 12 px\n`,
  )
  await expect(seccion().locator('.det-barra')).toContainText('cerrado')
  await expect(seccion().locator('.historia li.cerro')).toContainText('separó el título con 12 px')
  await expect(botonRevision().locator('.badge')).toHaveText('1')

  await seccion().getByRole('button', { name: 'Atrás' }).click()
  await seccion()
    .getByRole('button', { name: /^Cerrados/ })
    .click()
  const cerrado = seccion().locator('.fila-com', { hasText: 'R-1' })
  await expect(cerrado.locator('.chip.ok')).toContainText('cerrado')
  await expect(cerrado.locator('.hizo')).toContainText('separó el título con 12 px')
  await win.screenshot({ path: join(SALIDA, 'revision-r2-cerrados.png') })

  await cerrado.click()
  await seccion().getByRole('button', { name: 'Reabrir' }).click()
  await seccion().locator('.reabrir textarea').fill('en el celular sigue chico')
  await win.screenshot({ path: join(SALIDA, 'revision-r2-reabrir.png') })
  await seccion().locator('.reabrir').getByRole('button', { name: 'Reabrir' }).click()
  await expect(seccion().locator('.det-barra')).toContainText('abierto')
  await expect(seccion().locator('.historia')).toContainText('reabierto: en el celular sigue chico')
  await expect(botonRevision().locator('.badge')).toHaveText('2')
  expect(await readFile(r1, 'utf8')).toMatch(
    /\*\*Estado:\*\* abierto[\s\S]*— reabierto: en el celular sigue chico/,
  )
  await seccion().getByRole('button', { name: 'Atrás' }).click()
  await seccion()
    .getByRole('button', { name: /^Abiertos/ })
    .click()
  await expect(seccion().locator('.fila-com', { hasText: 'R-1' }).locator('.reab')).toContainText('reabierto')
})

test('un proyecto Electron sin la línea: Revisión lo dice y Pedírselo a la IA escribe el pedido sin enviarlo', async () => {
  await win.getByRole('button', { name: /^Inicio/ }).click()
  await win.locator('.tarjeta', { hasText: 'Gamma' }).click()
  await botonRevision().click()
  await expect(seccion().locator('.rev-vacio h2')).toHaveText('Todavía no hay comentarios')
  await expect(seccion().locator('.electron')).toContainText('Esta app es Electron')
  await seccion().getByRole('button', { name: 'Pedírselo a la IA' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await expect(campo).toHaveValue(/Agregá al proceso principal de la app la línea de la Revisión de Iridium/)
  await expect(campo).toBeFocused()
  await win.screenshot({ path: join(SALIDA, 'revision-r2-electron.png') })
  // No se envió: no hay conversación ni sesión trabajando.
  await expect(win.locator('.hilo .turno')).toHaveCount(0)
})
