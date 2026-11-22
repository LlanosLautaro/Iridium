// T-111: si algo se rompe al dibujar, la ventana no queda en negro. Muestra «Iridium no pudo mostrar esta pantalla»
// con Volver a cargar, y el error queda en el registro del día. Con la app abierta y el motor falso; la falla se
// provoca mandándole a la ventana una lista de proyectos rota. Captura en test-results/t111-falla.png.
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, test } from '@playwright/test'

let base: string
let abierta: ElectronApplication | null = null

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-t111-'))
  await mkdir(join(base, 'PROYECTOS', 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(base, 'PROYECTOS', 'Alfa', 'docs', 'estado.md'), '# Estado del proyecto\n')
  await mkdir(join(base, 'datos'), { recursive: true })
  await writeFile(
    join(base, 'datos', 'config.json'),
    JSON.stringify({ version: 1, raiz: join(base, 'PROYECTOS') }),
  )
})

test.afterEach(async () => {
  await abierta?.close()
  abierta = null
  await rm(base, { recursive: true, force: true }).catch(() => {})
})

test('una falla al dibujar muestra qué pasó, queda en el registro y Volver a cargar la recupera', async () => {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: join(base, 'datos'),
    IRIDIUM_CLAUDE: join(base, '.claude'),
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1280, height: 800 })
  await expect(win.getByText('Alfa', { exact: true }).first()).toBeVisible()

  // Una lista de proyectos sin sus datos: la grilla se rompe al dibujarla.
  await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send('proyectos:cambiaron', {
      tipo: 'lista',
      raiz: 'X',
      proyectos: [null],
    })
  })
  const falla = win.getByRole('alert').filter({ hasText: 'Iridium no pudo mostrar esta pantalla' })
  await expect(falla).toBeVisible()
  await win.screenshot({ path: 'test-results/t111-falla.png' })

  const registros = join(base, 'datos', 'registros')
  await expect
    .poll(async () => {
      const [hoy] = (await readdir(registros)).sort().reverse()
      return hoy ? readFile(join(registros, hoy), 'utf8') : ''
    })
    .toMatch(/Ventana: .*(TypeError|null)/)

  await falla.getByRole('button', { name: 'Volver a cargar' }).click()
  await expect(win.getByText('Alfa', { exact: true }).first()).toBeVisible()
  await expect(falla).toHaveCount(0)
})
