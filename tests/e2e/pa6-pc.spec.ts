// PA-I6 (frente Paridad, Capacidades, T-28; D-189 › 5 y 6) con la app abierta y el motor falso: usar la PC en Ajustes ›
// Capacidades. Sin Windows-MCP, el interruptor no se prende y la fila tiene Instalar, que corre en la consola de abajo
// (uv y después Windows-MCP; en las pruebas, un `echo` que deja un ejecutable de muestra en `IRIDIUM_PC_INICIO`); al
// terminar, dice «instalado» y queda prendido en config.json.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let local: string
let inicio: string

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '200',
    IRIDIUM_NAVEGADORES: local,
    IRIDIUM_PC_INICIO: inicio,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

const leerConfig = async () => JSON.parse(await readFile(join(datos, 'config.json'), 'utf8'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  local = await mkdtemp(join(tmpdir(), 'iridium-e2e-local-'))
  inicio = await mkdtemp(join(tmpdir(), 'iridium-e2e-inicio-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(
    join(raiz, 'Alfa', 'docs', 'estado.md'),
    '# Estado\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n',
  )
})

test.afterEach(async () => {
  for (const c of [raiz, datos, local, inicio])
    await rm(c, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

async function abrirCapacidades(win: Page) {
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Capacidades' }).click()
  return win.getByRole('dialog', { name: 'Capacidades' })
}

test('sin Windows-MCP: Instalar corre en la consola, después dice «instalado» y queda prendido', async () => {
  const { app, win } = await abrir()
  const ajustes = await abrirCapacidades(win)
  const interruptor = ajustes.getByRole('switch', { name: 'Usar la PC' })
  // Apagada de entrada (P2) y sin poder prenderse hasta instalarla.
  await expect(ajustes.getByText('Windows-MCP · falta instalarlo')).toBeVisible()
  await expect(interruptor).not.toBeChecked()
  await expect(interruptor).toBeDisabled()
  await expect(ajustes.getByText('la IA mueve el mouse y escribe', { exact: false })).toBeVisible()
  await win.screenshot({ path: 'test-results/pa6-falta.png' })

  await ajustes.getByRole('button', { name: 'Instalar' }).click()
  // uv primero (en la muestra no está) y después Windows-MCP, cada uno con su pestaña en la consola de abajo.
  await expect(win.getByText('Instalar uv').first()).toBeAttached()
  await expect(win.getByText('Instalar Windows-MCP').first()).toBeAttached({ timeout: 15_000 })
  await expect(ajustes.getByText('Windows-MCP, instalado')).toBeVisible({ timeout: 15_000 })
  await expect(interruptor).toBeChecked()
  await expect(interruptor).toBeEnabled()
  await expect.poll(async () => (await leerConfig()).capacidades?.pc).toBe(true)
  await win.screenshot({ path: 'test-results/pa6-instalada.png' })
  await app.close()

  // Al volver, sigue instalada y prendida; se apaga y queda apagada.
  const otra = await abrir()
  const deNuevo = await abrirCapacidades(otra.win)
  const otro = deNuevo.getByRole('switch', { name: 'Usar la PC' })
  await expect(deNuevo.getByText('Windows-MCP, instalado')).toBeVisible()
  await expect(otro).toBeChecked()
  await otro.click()
  await expect(otro).not.toBeChecked()
  await expect.poll(async () => (await leerConfig()).capacidades?.pc).toBe(false)
  await otra.app.close()
})
