// Paso 8 de Capacidades (frente Paridad, T-28) con la app abierta y el motor falso: los casos raros de Ajustes ›
// Capacidades (Conectar con la lista de la última vez a la vista, Windows-MCP desinstalado con el interruptor prendido,
// el navegador y la PC prendidos juntos) y su accesibilidad (cada control con nombre, el recorrido con Tab y los avisos
// que se oyen).
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let local: string
let inicio: string

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '200',
    IRIDIUM_NAVEGADORES: local,
    IRIDIUM_PC_INICIO: inicio,
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

const leerConfig = async () => JSON.parse(await readFile(join(datos, 'config.json'), 'utf8'))
const ponerConfig = (capacidades: object) =>
  writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz, capacidades }))

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
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible({ timeout: 30_000 })
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Capacidades' }).click()
  return win.getByRole('dialog', { name: 'Capacidades' })
}

/** Windows-MCP en la carpeta de muestra, como lo deja `uv tool install`. */
async function instalarMuestra() {
  await mkdir(join(inicio, '.local', 'bin'), { recursive: true })
  await writeFile(join(inicio, '.local', 'bin', 'windows-mcp.exe'), '')
}

test('Conectar con la lista de la última vez a la vista, antes de que llegue la nueva: abre la consola', async () => {
  // La lista guardada (Q-287) y un motor lento: la nueva tarda unos segundos.
  await writeFile(
    join(datos, 'capacidades.json'),
    JSON.stringify({
      version: 1,
      complementos: [],
      conectores: [{ nombre: 'plugin:design:figma', estado: 'falta-sesion' }],
    }),
  )
  const { app, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '4000' })
  const ajustes = await abrirCapacidades(win)
  await expect(ajustes.getByText('Poniéndose al día…')).toBeVisible()
  await ajustes.getByRole('button', { name: 'Conectar Figma' }).click()
  // Antes no pasaba nada: Conectar aceptaba solo los conectores de una lista nueva.
  await expect(win.getByText('Conectar plugin:design:figma').first()).toBeAttached({ timeout: 10_000 })
  const fila = ajustes.locator('.fila', { has: win.getByText('Figma', { exact: true }) })
  await expect(fila).toContainText('conectado', { timeout: 30_000 })
  await app.close()
})

test('Windows-MCP desinstalado con el interruptor prendido: lo dice, se puede apagar y no se vuelve a prender', async () => {
  await ponerConfig({ navegador: false, pc: true, conectoresApagados: [] })
  const { app, win } = await abrir()
  const ajustes = await abrirCapacidades(win)
  const interruptor = ajustes.getByRole('switch', { name: 'Usar la PC' })
  // Se ve prendido (era lo elegido), en ámbar, con Instalar; el lector de pantalla lo oye con el interruptor.
  await expect(
    ajustes.getByRole('status').filter({ hasText: 'Windows-MCP · falta instalarlo' }),
  ).toBeVisible()
  await expect(interruptor).toBeChecked()
  await expect(interruptor).toBeEnabled()
  await expect(interruptor).toHaveAccessibleDescription('Windows-MCP · falta instalarlo')
  await expect(ajustes.getByRole('button', { name: 'Instalar' })).toBeVisible()
  await win.screenshot({ path: 'test-results/pa-capacidades-pc-falta.png' })
  await interruptor.click()
  await expect(interruptor).not.toBeChecked()
  await expect(interruptor).toBeDisabled()
  await expect.poll(async () => (await leerConfig()).capacidades?.pc).toBe(false)
  await app.close()
})

test('el navegador y la PC prendidos juntos: los dos quedan y se ven', async () => {
  await instalarMuestra()
  // La extensión «Claude» en un perfil de Brave de muestra.
  await mkdir(
    join(
      local,
      'BraveSoftware',
      'Brave-Browser',
      'User Data',
      'Default',
      'Extensions',
      'fcoeoabgfenejglbffodgkkbkcdhcgfn',
    ),
    { recursive: true },
  )
  const { app, win } = await abrir()
  const ajustes = await abrirCapacidades(win)
  await ajustes.getByRole('switch', { name: 'Usar el navegador' }).click()
  await ajustes.getByRole('switch', { name: 'Usar la PC' }).click()
  await expect(ajustes.getByText('Brave, con la extensión «Claude»')).toBeVisible()
  await expect(ajustes.getByText('Windows-MCP, instalado')).toBeVisible()
  await expect.poll(async () => (await leerConfig()).capacidades).toMatchObject({ navegador: true, pc: true })
  await app.close()
})

test('accesibilidad: cada control con nombre, Tab los recorre sin quedar atrapado y Escape cierra', async () => {
  await instalarMuestra()
  const { app, win } = await abrir()
  const ajustes = await abrirCapacidades(win)
  await expect(ajustes.getByRole('button', { name: 'Conectar Figma' })).toBeVisible()
  // Ningún botón ni interruptor sin nombre.
  const sinNombre = await ajustes.evaluate((d) =>
    [...d.querySelectorAll('button, input, a')]
      .filter((e) => !(e.getAttribute('aria-label') || e.textContent?.trim()))
      .map((e) => e.outerHTML.slice(0, 80)),
  )
  expect(sinNombre).toEqual([])
  // Con Tab desde el navegador, el foco pasa por la PC, Conectar y cada interruptor de conector, y vuelve a empezar.
  await ajustes.getByRole('switch', { name: 'Usar el navegador' }).focus()
  const recorrido: string[] = []
  for (let i = 0; i < 30; i++) {
    await win.keyboard.press('Tab')
    recorrido.push(
      await win.evaluate(() => {
        const e = document.activeElement
        return e?.getAttribute('aria-label') || e?.textContent?.trim() || e?.tagName || ''
      }),
    )
  }
  for (const nombre of ['Usar la PC', 'Conectar Figma', 'Usar Figma', 'Usar Linear', 'Reintentar Datadog'])
    expect(recorrido).toContain(nombre)
  // El foco no sale del diálogo.
  expect(await ajustes.evaluate((d) => d.contains(document.activeElement))).toBe(true)
  // Conectar se oye: la nota de abajo es una región viva.
  await expect(ajustes.locator('.nota-capacidades[aria-live="polite"]')).toHaveCount(1)
  await win.keyboard.press('Escape')
  await expect(win.getByRole('dialog')).toHaveCount(0)
  await app.close()
})
