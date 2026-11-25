// T-134 (D-195) con la app abierta y el motor falso: con el ajuste prendido, el botón de la conversación arma el apagado;
// Iridium espera a que la IA termine (también lo que dejó de fondo), cuenta y apaga. En las pruebas nunca apaga:
// IRIDIUM_APAGAR anota en un archivo lo que habría hecho.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

async function abrir(cuentaSeg: string): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '300',
    IRIDIUM_APAGAR: join(datos, 'apagado.txt'),
    IRIDIUM_APAGAR_SEG: cuentaSeg,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

const apagado = () => readFile(join(datos, 'apagado.txt'), 'utf8').catch(() => '')
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

async function prenderBoton(win: Page) {
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Notificaciones' }).click()
  const ajuste = win
    .getByRole('dialog', { name: 'Notificaciones' })
    .getByRole('switch', { name: 'Apagar la PC al terminar' })
  await expect(ajuste).not.toBeChecked()
  await ajuste.click()
  await expect.poll(async () => (await leerConfig()).botonApagar).toBe(true)
  await win.screenshot({ path: 'test-results/t134-ajuste.png' })
  await win.keyboard.press('Escape')
}

test('sin el ajuste no hay botón; prendido, arma y apaga cuando la IA termina lo de fondo', async () => {
  const { app, win } = await abrir('2')
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  const boton = win.getByRole('button', { name: 'Apagar la PC al terminar' })
  await expect(campo).toBeVisible()
  await expect(boton).toHaveCount(0)
  await prenderBoton(win)

  await campo.fill('Corré las pruebas de fondo')
  await campo.press('Enter')
  await boton.click()
  const armado = win.getByRole('button', { name: 'Se apaga al terminar' })
  await expect(armado).toHaveAttribute('aria-pressed', 'true')
  await win.screenshot({ path: 'test-results/t134-armado.png' })

  // Terminó el turno pero espera lo de fondo: no cuenta todavía.
  await expect(win.locator('.ahora.esperando')).toBeVisible()
  const aviso = win.getByRole('alert', { name: 'La PC se va a apagar' })
  await expect(aviso).toHaveCount(0)

  // La IA retoma sola y termina: ahora cuenta y apaga.
  await expect(win.locator('.hilo')).toContainText('Terminaron las pruebas de fondo', { timeout: 15_000 })
  await expect(aviso).toContainText('la PC se apaga en')
  await win.screenshot({ path: 'test-results/t134-cuenta.png' })
  await expect.poll(apagado, { timeout: 10_000 }).toContain('apagar')
  // Una sola vez, y queda desarmado.
  await expect(boton).toHaveAttribute('aria-pressed', 'false')
  expect((await apagado()).trim().split('\n')).toHaveLength(1)
  await app.close()
})

test('No apagar en la cuenta lo desarma y no apaga; tocar el botón armado también', async () => {
  const { app, win } = await abrir('30')
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await prenderBoton(win)
  const boton = win.getByRole('button', { name: 'Apagar la PC al terminar' })
  const aviso = win.getByRole('alert', { name: 'La PC se va a apagar' })

  // Q-296: con la IA quieta, armar no cuenta; espera a que trabaje y termine.
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await boton.click()
  await expect(win.getByRole('button', { name: 'Se apaga al terminar' })).toBeVisible()
  await win.waitForTimeout(1500)
  await expect(aviso).toHaveCount(0)
  await campo.fill('Algo corto')
  await campo.press('Enter')
  await expect(aviso).toBeVisible({ timeout: 30_000 })
  await aviso.getByRole('button', { name: 'No apagar' }).click()
  await expect(aviso).toHaveCount(0)
  await expect(boton).toHaveAttribute('aria-pressed', 'false')

  // Armado mientras trabaja y desarmado con el mismo botón: al terminar no cuenta.
  await campo.fill('Hacé algo lento')
  await campo.press('Enter')
  await boton.click()
  await win.getByRole('button', { name: 'Se apaga al terminar' }).click()
  await expect(boton).toHaveAttribute('aria-pressed', 'false')
  await expect(win.getByRole('button', { name: 'Detener' })).toHaveCount(0, { timeout: 30_000 })
  await expect(aviso).toHaveCount(0)
  expect(await apagado()).toBe('')
  await app.close()
})
