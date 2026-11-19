// AB-I1 con la app abierta y el motor falso (frente Abrir, AB-1, AB-2): Ejecutar Alfa en el menú de la tarjeta y en la
// barra del proyecto solo con la marca, su detalle al pasar el mouse y el aviso de una app que todavía no está armada,
// con Armar ahora (escondido, AB-I2). No se abre ningún programa de verdad.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { armarCarpetaClaude } from '../muestras/carpeta-claude'

let base: string
let raiz: string
let datos: string
let abierta: ElectronApplication | null = null

async function proyecto(nombre: string, archivos: Record<string, string>) {
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(raiz, nombre, ruta, '..'), { recursive: true })
    await writeFile(join(raiz, nombre, ruta), texto)
  }
}
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
  '# Estado del proyecto\n\n**Última actualización:** 2026-11-19\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'

const SCRIPTS = `# Scripts

## Abrir la app
La versión armada, con los últimos cambios.
**Ejecutar:** \`dist/Alfa.exe\`
**Marca:** ejecutar · escritorio

## Armar la app
Arma la versión de uso.
**Ejecutar:** \`echo armada\`
**Marca:** armar
`

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_CLAUDE: join(base, '.claude'),
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_OCULTA: '1',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-ab1-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  await armarCarpetaClaude(join(base, '.claude'), join(raiz, '.iridium', 'Skills'), join(base, 'afuera'))
  await proyecto('Alfa', { '.proyecto.json': ficha, 'docs/estado.md': estado, 'docs/scripts.md': SCRIPTS })
  await proyecto('Beta', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado,
    'docs/scripts.md': '# Scripts\n\n## Correr\n**Ejecutar:** `npm start`\n',
  })
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

test('Ejecutar Alfa en el menú de la tarjeta, con su detalle, y el aviso de una app sin armar (AB-1, AB-2)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Beta' }).click({ button: 'right' })
  const menuBeta = win.getByRole('menu', { name: 'Acciones de Beta' })
  await expect(menuBeta.getByRole('menuitem', { name: 'Abrir la carpeta' })).toBeVisible()
  await expect(menuBeta.getByRole('menuitem', { name: /Ejecutar/ })).toHaveCount(0)
  await win.keyboard.press('Escape')

  await win.locator('.tarjeta', { hasText: 'Alfa' }).click({ button: 'right' })
  const menu = win.getByRole('menu', { name: 'Acciones de Alfa' })
  const ejecutar = menu.getByRole('menuitem', { name: 'Ejecutar Alfa' })
  await expect(ejecutar).toHaveAttribute('title', 'Abre la app. La versión armada, con los últimos cambios.')
  await win.screenshot({ path: 'test-results/ab1-menu.png' })
  await ejecutar.click()

  const aviso = win.locator('.aviso-flotante', { hasText: 'Alfa todavía no está armada' })
  await expect(aviso).toBeVisible()
  await win.screenshot({ path: 'test-results/ab1-sin-armar.png' })
  await aviso.getByRole('button', { name: 'Armar ahora' }).click()
  await expect(
    win.locator('.aviso-flotante', { hasText: 'Alfa se está armando: abre en cuanto termine' }),
  ).toBeVisible()
  await app.close()
})

test('Ejecutar Alfa en la barra del proyecto, encima de los ajustes, solo con la marca (AB-1)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
  const boton = barra.getByRole('button', { name: 'Ejecutar Alfa' })
  await expect(boton).toHaveAttribute('title', /^Ejecutar Alfa · Abre la app\./)
  const [y, yAjustes] = await Promise.all([
    boton.boundingBox(),
    barra.getByRole('button', { name: 'Ajustes' }).boundingBox(),
  ])
  expect((y?.y ?? 0) < (yAjustes?.y ?? 0)).toBe(true)
  await win.screenshot({ path: 'test-results/ab1-barra.png' })
  await app.close()
})

test('una carpeta sin la marca no muestra el botón en la barra (AB-1)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
  await expect(barra.getByRole('button', { name: 'Scripts' })).toBeVisible()
  await expect(barra.getByRole('button', { name: /Ejecutar/ })).toHaveCount(0)
  await app.close()
})
