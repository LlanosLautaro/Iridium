// PA-I4 (frente Paridad, Capacidades, T-28; D-189) con la app abierta y el motor falso: Ajustes › Capacidades muestra
// los complementos y los conectores con su estado, Conectar corre en la consola de abajo, apagar uno queda guardado
// y llega a las sesiones nuevas; con un motor sin capacidades, la sección no aparece.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '200',
    ...extra,
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
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(
    join(raiz, 'Alfa', 'docs', 'estado.md'),
    '# Estado\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n',
  )
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

async function abrirCapacidades(win: Page) {
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Capacidades' }).click()
  return win.getByRole('dialog', { name: 'Capacidades' })
}

test('Ajustes › Capacidades: complementos y conectores con su estado; apagar queda y Conectar va a la consola', async () => {
  const { app, win } = await abrir()
  const ajustes = await abrirCapacidades(win)
  // Mientras lee, las siluetas; después, los complementos con lo que suman.
  await expect(ajustes.getByText('Anthropic · 10 skills · 3 conectores')).toBeVisible()
  await expect(ajustes.getByText('de tu cuenta').first()).toBeVisible()

  const fila = (nombre: string) => ajustes.locator('.fila', { has: win.getByText(nombre, { exact: true }) })
  await expect(fila('Claude Docs')).toContainText('conectado')
  await expect(fila('Claude Docs')).toContainText('de claude.ai')
  await expect(fila('Figma')).toContainText('falta iniciar sesión')
  await expect(fila('Datadog')).toContainText('no anda')
  await expect(fila('Gmail')).toContainText('sin configurar')
  // Los que no andan, primero.
  await expect(ajustes.locator('[data-conector] .titulo-fila').first()).toHaveText('Datadog')
  await expect(ajustes.getByRole('button', { name: 'Reintentar Datadog' })).toBeVisible()
  await win.screenshot({ path: 'test-results/pa4-capacidades.png' })

  // Apagar Linear: dice «apagado», se va su Conectar y queda en config.json.
  await ajustes.getByRole('switch', { name: 'Usar Linear' }).click()
  await expect(fila('Linear')).toContainText('apagado')
  await expect(ajustes.getByRole('button', { name: 'Conectar Linear' })).toHaveCount(0)
  await expect
    .poll(async () => (await leerConfig()).capacidades?.conectoresApagados)
    .toEqual(['plugin:engineering:linear'])

  // Conectar Figma: la consola de abajo con su pestaña; al terminar, la fila dice «conectado».
  await ajustes.getByRole('button', { name: 'Conectar Figma' }).click()
  await expect(win.getByText('Conectar plugin:design:figma').first()).toBeAttached()
  await expect(fila('Figma')).toContainText('conectado', { timeout: 15_000 })
  await app.close()

  // Al volver, Linear sigue apagado.
  const otra = await abrir()
  const deNuevo = await abrirCapacidades(otra.win)
  await expect(deNuevo.getByRole('switch', { name: 'Usar Linear' })).not.toBeChecked()
  await expect(deNuevo.getByRole('switch', { name: 'Usar Figma' })).toBeChecked()
  await otra.app.close()
})

test('un motor sin complementos ni conectores: Capacidades no aparece en Ajustes', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_CAPACIDADES: 'no' })
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.keyboard.press('Control+,')
  const ajustes = win.getByRole('dialog')
  await expect(ajustes.getByRole('button', { name: 'Notificaciones' })).toBeVisible()
  await expect(ajustes.getByRole('button', { name: 'Capacidades' })).toHaveCount(0)
  await app.close()
})

test('al volver a abrir, la lista de la última vez se ve enseguida mientras se pone al día (Q-287)', async () => {
  const { app, win } = await abrir()
  const ajustes = await abrirCapacidades(win)
  await expect(ajustes.getByText('Anthropic · 10 skills · 3 conectores')).toBeVisible()
  await app.close()

  // Claude Code tarda 4 s en decir la lista nueva: la guardada aparece antes, con «Poniéndose al día…».
  const otra = await abrir({ IRIDIUM_FALSO_PASO_MS: '4000' })
  const deNuevo = await abrirCapacidades(otra.win)
  await expect(deNuevo.getByText('Anthropic · 10 skills · 3 conectores')).toBeVisible({ timeout: 2_000 })
  await expect(deNuevo.getByText('Poniéndose al día…')).toBeVisible()
  await otra.win.screenshot({ path: 'test-results/q287-guardada.png' })
  await expect(deNuevo.getByText('Poniéndose al día…')).toHaveCount(0, { timeout: 15_000 })
  await expect(deNuevo.getByText('Anthropic · 10 skills · 3 conectores')).toBeVisible()
  await otra.app.close()
})
