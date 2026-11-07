// CO-I2 con la app abierta y una carpeta `release` de muestra (IRIDIUM_RELEASE): con una versión lista aparece
// Actualizar (R-12), que cierra y la pone (y la abre); con sesiones trabajando pregunta antes (F-6), y Esperar reinicia
// sola cuando terminan.
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let release: string

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})
const estado = '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n'

// Un «Iridium.exe» que se puede abrir sin que se vea nada: rundll32 sin argumentos termina en el acto.
async function app(carpeta: string, archivo: string) {
  await mkdir(carpeta, { recursive: true })
  await copyFile('C:\\Windows\\System32\\rundll32.exe', join(carpeta, 'Iridium.exe'))
  await writeFile(join(carpeta, archivo), archivo)
}

async function versionLista() {
  await app(join(release, 'nueva', 'win-unpacked'), 'nueva.txt')
  await writeFile(
    join(release, 'nueva', 'lista.json'),
    JSON.stringify({ fecha: '2026-11-01T14:05:00', commit: 'abc1234', mensaje: 'CO-I2', sinGuardar: false }),
  )
}

/** Espera a que el ayudante (que sigue vivo después de Iridium) termine de poner la versión nueva. */
async function puesta(): Promise<string> {
  await expect
    .poll(async () => (await readdir(join(release, 'win-unpacked'))).sort(), { timeout: 20_000 })
    .toEqual(['Iridium.exe', 'nueva.txt'])
  return readFile(join(release, 'actualizacion.log'), 'utf8')
}

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_RELEASE: release,
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const a = await electron.launch({ args: ['.'], env })
  const win = await a.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app: a, win }
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  release = await mkdtemp(join(tmpdir(), 'iridium-e2e-release-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), estado)
  await app(join(release, 'win-unpacked'), 'vieja.txt')
})

test.afterEach(async () => {
  for (const c of [raiz, datos, release]) await rm(c, { recursive: true, force: true, maxRetries: 5 })
})

test('la versión nueva aparece sola abajo y Actualizar la pone y la abre (CO-I2)', async () => {
  const { app: a, win } = await abrir()
  await expect(win.locator('.estado-barra')).toContainText('Claude')
  await expect(win.locator('.actualizar-it')).toHaveCount(0)

  // La arma `pnpm actualizar` con Iridium abierto: Actualizar aparece en unos segundos, sin hacer nada.
  await versionLista()
  const actualizar = win.locator('.actualizar-it').getByRole('button', { name: 'Actualizar' })
  await expect(actualizar).toBeVisible({ timeout: 10_000 })
  await expect(actualizar).toHaveAttribute('title', 'Trae «CO-I2» (abc1234), armada el 1 nov 2026, 14:05')
  await win.screenshot({ path: 'test-results/co2-lista.png' })

  const cerrada = a.waitForEvent('close')
  await actualizar.click()
  await cerrada
  const log = await puesta()
  expect(log).toContain('Versión nueva puesta: abc1234')
  expect(log).toContain('Abre Iridium.')
  expect((await readdir(release)).sort()).toEqual(['actualizacion.log', 'win-unpacked'])
})

test('con una sesión trabajando, Actualizar pregunta; Cancelar no reinicia y cerrar después la pone igual', async () => {
  await versionLista()
  const { app: a, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '2000' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Algo lento')
  await campo.press('Enter')
  await expect(win.locator('.ses', { hasText: 'Alfa' })).toContainText('Trabajando')

  await win.locator('.actualizar-it').getByRole('button', { name: 'Actualizar' }).click()
  const dialogo = win.getByRole('alertdialog')
  await expect(dialogo).toContainText('Alfa está trabajando')
  await expect(dialogo).toContainText('Reiniciar la frena')
  await expect(dialogo.getByRole('button', { name: 'Reiniciar igual' })).toBeVisible()
  await expect(dialogo.getByRole('button', { name: 'Esperar' })).toBeVisible()
  await win.screenshot({ path: 'test-results/co2-reiniciar-pregunta.png' })
  await dialogo.getByRole('button', { name: 'Cancelar' }).click()
  await expect(dialogo).toHaveCount(0)
  await expect(win.locator('.actualizar-it').getByRole('button', { name: 'Actualizar' })).toBeEnabled()

  // Cerrar con la X: pregunta como siempre y, con Cerrar igual, la versión nueva entra pero no se abre.
  await a.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.close())
  await expect(dialogo.getByRole('button', { name: 'Cerrar igual' })).toBeVisible()
  await expect(dialogo.getByRole('button', { name: 'Esperar' })).toHaveCount(0)
  const cerrada = a.waitForEvent('close')
  await dialogo.getByRole('button', { name: 'Cerrar igual' }).click()
  await cerrada
  const log = await puesta()
  expect(log).toContain('Versión nueva puesta: abc1234')
  expect(log).not.toContain('Abre Iridium.')
})

test('con Esperar, Iridium se reinicia solo cuando la sesión termina (F-6, R-12)', async () => {
  await versionLista()
  const { app: a, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '1500' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Algo')
  await campo.press('Enter')
  await expect(win.locator('.ses', { hasText: 'Alfa' })).toContainText('Trabajando')

  await win.locator('.actualizar-it').getByRole('button', { name: 'Actualizar' }).click()
  const dialogo = win.getByRole('alertdialog')
  const cerrada = a.waitForEvent('close')
  await dialogo.getByRole('button', { name: 'Esperar' }).click()
  await expect(dialogo).toHaveCount(0)
  await expect(win.locator('.actualizar-it')).toContainText('se reinicia cuando terminen las sesiones')
  await win.screenshot({ path: 'test-results/r12-esperar.png' })
  // La sesión termina sola: Iridium se cierra sin volver a preguntar y abre la versión nueva.
  await cerrada
  const log = await puesta()
  expect(log).toContain('Versión nueva puesta: abc1234')
  expect(log).toContain('Abre Iridium.')
})

test('si la versión nueva no entró la vez anterior, al abrir lo dice y por qué (Defecto 3)', async () => {
  await versionLista()
  await writeFile(
    join(release, 'nueva', 'no-entro.json'),
    JSON.stringify({
      fecha: '2026-11-01T18:30:00',
      motivo: 'Windows no soltó la carpeta de la app: la versión nueva queda lista para el próximo cierre.',
    }),
  )
  const { app: a, win } = await abrir()
  const actualizar = win.locator('.actualizar-it').getByRole('button', { name: 'Actualizar' })
  await expect(actualizar).toHaveAttribute(
    'title',
    /El 1 nov 2026, 18:30 no entró: Windows no soltó la carpeta/,
  )
  await win.screenshot({ path: 'test-results/d3-no-entro.png' })
  await a.close()
})
