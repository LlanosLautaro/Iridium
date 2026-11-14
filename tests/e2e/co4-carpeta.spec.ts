// CO-I4 con la app abierta y el motor falso: Ajustes › Proyectos muestra la carpeta de proyectos y la cambia con el
// cuadro de Windows (acá reemplazado), también cuando falta; mientras la IA trabaja no se puede (modulos/compartir/ux.md › CO-4).
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let otra: string
let datos: string

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

async function proyecto(carpeta: string, nombre: string) {
  await mkdir(join(carpeta, nombre, 'docs'), { recursive: true })
  await writeFile(join(carpeta, nombre, '.proyecto.json'), ficha)
  await writeFile(join(carpeta, nombre, 'docs', 'estado.md'), estado)
}

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '60',
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

/** El cuadro de Windows contesta solo: con esa carpeta, o cancelado si es null. */
async function cuadro(app: ElectronApplication, elegida: string | null) {
  await app.evaluate(({ dialog }, ruta) => {
    dialog.showOpenDialog = (async () =>
      ruta ? { canceled: false, filePaths: [ruta] } : { canceled: true, filePaths: [] }) as never
  }, elegida)
}

const leerConfig = async () => JSON.parse(await readFile(join(datos, 'config.json'), 'utf8'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  otra = await mkdtemp(join(tmpdir(), 'iridium-e2e-otra-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await proyecto(raiz, 'Alfa')
  await proyecto(otra, 'Beta')
})

test.afterEach(async () => {
  for (const c of [raiz, otra, datos])
    await rm(c, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('Ajustes › Proyectos muestra la carpeta y la cambia; Cancelar no cambia nada; queda al volver a abrir', async () => {
  const { app, win } = await abrir()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Proyectos' }).click()
  const seccion = win.getByRole('dialog', { name: 'Proyectos' })
  const fila = seccion.locator('.carpeta-proyectos')
  await expect(fila).toContainText('Carpeta de proyectos')
  await expect(fila.locator('.ruta')).toHaveText(raiz)
  await win.screenshot({ path: 'test-results/co4-ajustes.png' })

  await cuadro(app, null)
  await fila.getByRole('button', { name: 'Cambiar…' }).click()
  await expect(fila.getByRole('button', { name: 'Cambiar…' })).toBeEnabled()
  await expect(fila.locator('.ruta')).toHaveText(raiz)

  await cuadro(app, otra)
  await fila.getByRole('button', { name: 'Cambiar…' }).click()
  await expect(fila.locator('.ruta')).toHaveText(otra)
  await win.screenshot({ path: 'test-results/co4-cambiada.png' })
  expect((await leerConfig()).raiz).toBe(otra)
  await win.keyboard.press('Escape')
  await expect(win.locator('.tarjeta', { hasText: 'Beta' })).toBeVisible()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toHaveCount(0)
  await app.close()

  const { app: otraVez, win: w } = await abrir()
  await expect(w.locator('.tarjeta', { hasText: 'Beta' })).toBeVisible()
  await otraVez.close()
})

test('si la carpeta falta, la fila lo dice y Cambiar… es el principal', async () => {
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz: join(raiz, 'no-existe') }))
  const { app, win } = await abrir()
  await expect(win.getByText('No encuentro la carpeta de proyectos')).toBeVisible()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Proyectos' }).click()
  const fila = win.locator('.carpeta-proyectos')
  await expect(fila).toContainText('No se encuentra')
  await expect(fila.getByRole('button', { name: 'Cambiar…' })).toHaveClass(/principal/)
  await win.screenshot({ path: 'test-results/co4-falta.png' })
  await cuadro(app, otra)
  await fila.getByRole('button', { name: 'Cambiar…' }).click()
  await expect(fila).toContainText('cada carpeta que está adentro')
  await app.close()
})

test('mientras la IA trabaja no se puede cambiar; al terminar, sí', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '300' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Algo lento')
  await campo.press('Enter')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Trabajando')

  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Proyectos' }).click()
  const fila = win.locator('.carpeta-proyectos')
  await expect(fila).toContainText('Esperá a que termine la IA')
  await expect(fila.getByRole('button', { name: 'Cambiar…' })).toBeDisabled()
  await win.screenshot({ path: 'test-results/co4-trabajando.png' })
  await expect(fila.getByRole('button', { name: 'Cambiar…' })).toBeEnabled({ timeout: 30_000 })
  await app.close()
})

test('en Acerca de, la versión de Iridium con cuándo se armó y su commit (CO-I5, Q-103)', async () => {
  const { app, win } = await abrir()
  const { version } = JSON.parse(await readFile('package.json', 'utf8'))
  const commit = execFileSync('git', ['log', '-1', '--format=%h'], { encoding: 'utf8' }).trim()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Acerca de' }).click()
  const fila = win.getByRole('dialog', { name: 'Acerca de' }).locator('.version-iridium')
  await expect(fila).toContainText('Versión de Iridium')
  // `pnpm e2e` la arma recién: el día de hoy y el último commit.
  const hoy = new Date().toLocaleDateString('es-AR', { day: 'numeric' })
  await expect(fila.locator('.d')).toContainText(new RegExp(`^Armada el ${hoy} `))
  await expect(fila.locator('.valor')).toHaveText(`${version} · ${commit}`)
  await win.screenshot({ path: 'test-results/co5-version.png' })
  await app.close()
})
