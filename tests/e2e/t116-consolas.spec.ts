// T-116 (D-184, D-185) con la app abierta y el motor falso: Ejecutar de Scripts abre el panel de abajo en la pestaña
// del script, en lugar de una ventana; se le escribe, Detener corta lo que corre, plegar y la señal de la barra, la ×
// y, al cerrar Iridium, no queda nada corriendo. Con IRIDIUM_OCULTA, nada se ve en la pantalla.
import { execSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { armarCarpetaClaude } from '../muestras/carpeta-claude'

let base: string
let raiz: string
let datos: string
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
  '# Estado del proyecto\n\n**Última actualización:** 2026-11-23\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'
const SCRIPTS = `# Scripts

## Preguntar el nombre
Espera una respuesta.
**Ejecutar:** \`set /p R=nombre? && call echo recibido-%R%\`

## Quedarse corriendo
Como un servidor.
**Ejecutar:** \`ping -t 127.0.0.1\`
`

/** Cuántos `ping` hay corriendo en la PC. */
const pings = () =>
  execSync('tasklist /FI "IMAGENAME eq PING.EXE" /FO CSV /NH')
    .toString()
    .split('\n')
    .filter((l) => l.includes('PING')).length

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
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-t116-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  await armarCarpetaClaude(join(base, '.claude'), join(raiz, '.iridium', 'Skills'), join(base, 'afuera'))
  for (const [ruta, texto] of Object.entries({
    '.proyecto.json': ficha,
    'docs/estado.md': estado,
    'docs/scripts.md': SCRIPTS,
  })) {
    await mkdir(join(raiz, 'Alfa', ruta, '..'), { recursive: true })
    await writeFile(join(raiz, 'Alfa', ruta), texto)
  }
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

test('Ejecutar abre la consola adentro: se le escribe, Detener, plegar, la × y al cerrar no queda nada (T-116)', async () => {
  const antes = pings()
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Scripts' })
    .click()
  const scripts = win.locator('[data-seccion="scripts"]')
  const panel = win.getByRole('region', { name: 'Consolas' })
  const barra = win.locator('.estado-barra')
  // Sin nada corriendo, ni el panel ni la señal.
  await expect(panel).toHaveCount(0)
  await expect(barra.locator('.senal-consolas')).toHaveCount(0)

  // Ejecutar abre el panel en su pestaña, corriendo; la barra lo cuenta.
  await scripts.getByRole('button', { name: 'Ejecutar «Preguntar el nombre»' }).click()
  await expect(panel).toBeVisible()
  const pestana = panel.getByRole('tab', { name: /Preguntar el nombre/ })
  await expect(pestana).toHaveAttribute('aria-selected', 'true')
  await expect(pestana.locator('.corre')).toBeVisible()
  await expect(barra.locator('.senal-consolas')).toHaveText('1 corriendo')
  // El panel va abajo de la sección: la conversación sigue entera a la derecha.
  const cajaPanel = await panel.boundingBox()
  const cajaChat = await win.getByRole('complementary', { name: 'Conversación' }).boundingBox()
  expect((cajaPanel?.x ?? 0) + (cajaPanel?.width ?? 0)).toBeLessThanOrEqual((cajaChat?.x ?? 0) + 1)

  // Es una consola de verdad: pregunta, se le contesta y sigue.
  const pantalla = panel.locator('.pantalla-consola')
  await expect(pantalla.locator('.xterm-rows')).toContainText('nombre?', { timeout: 15_000 })
  await pantalla.click()
  await win.keyboard.type('Alfa')
  await win.keyboard.press('Enter')
  await expect(pantalla.locator('.xterm-rows')).toContainText('recibido-Alfa', { timeout: 15_000 })
  await expect(pestana.locator('.termino')).toBeVisible()
  await expect(barra.locator('.senal-consolas')).toHaveText('1 consola')
  await win.screenshot({ path: 'test-results/t116-consola-respondida.png' })

  // Algo que se queda corriendo: Detener lo corta y la pestaña queda para leer.
  await scripts.getByRole('button', { name: 'Ejecutar «Quedarse corriendo»' }).click()
  const ping = panel.getByRole('tab', { name: /Quedarse corriendo/ })
  await expect(ping).toHaveAttribute('aria-selected', 'true')
  await expect(pantalla.locator('.xterm-rows')).toContainText('127.0.0.1', { timeout: 15_000 })
  expect(pings()).toBeGreaterThan(antes)
  await expect(barra.locator('.senal-consolas')).toHaveText('1 corriendo')
  await win.screenshot({ path: 'test-results/t116-consolas.png' })
  await panel.getByRole('button', { name: 'Detener' }).click()
  await expect(ping.locator('.termino')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Detener' })).toBeDisabled()
  await expect.poll(pings, { timeout: 10_000 }).toBe(antes)

  // Plegar lo esconde; la señal de la barra lo vuelve a abrir, en la misma pestaña.
  await panel.getByRole('button', { name: 'Plegar las consolas' }).click()
  await expect(panel).toHaveCount(0)
  await barra.locator('.senal-consolas').click()
  await expect(panel.getByRole('tab', { name: /Quedarse corriendo/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  // La pestaña vuelta a mirar muestra lo que había.
  await expect(pantalla.locator('.xterm-rows')).toContainText('127.0.0.1')

  // La × la saca; con la última, el panel se va.
  await panel.getByRole('button', { name: 'Cerrar Quedarse corriendo' }).click()
  await expect(panel.getByRole('tab')).toHaveCount(1)
  await panel.getByRole('button', { name: 'Cerrar Preguntar el nombre' }).click()
  await expect(panel).toHaveCount(0)
  await expect(barra.locator('.senal-consolas')).toHaveCount(0)

  // Lo que corre adentro se cierra con Iridium (D-184 › 4).
  await scripts.getByRole('button', { name: 'Ejecutar «Quedarse corriendo»' }).click()
  await expect.poll(pings, { timeout: 10_000 }).toBeGreaterThan(antes)
  // En el inicio, el panel va abajo de toda la pantalla, con las consolas de todos los proyectos.
  await win.getByRole('button', { name: 'Inicio' }).first().click()
  await expect(panel.getByRole('tab', { name: /Quedarse corriendo/ })).toBeVisible()
  await expect(barra.locator('.senal-consolas')).toHaveText('1 corriendo')
  await win.screenshot({ path: 'test-results/t116-consolas-inicio.png' })
  await app.close()
  abierta = null
  await expect.poll(pings, { timeout: 10_000 }).toBe(antes)
})
