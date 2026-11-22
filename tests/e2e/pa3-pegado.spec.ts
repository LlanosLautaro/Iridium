// PA-I3 (frente Paridad): el texto largo pegado, con el motor falso. Pegar más de 40 líneas o 2.000 caracteres deja la
// ficha «Texto pegado» (uno corto queda en el cuadro), un clic la abre en el visor, Ctrl+Z justo después la vuelve
// texto donde se pegó, varios son varias fichas, y al mandar quedan en el mensaje, también al reabrir (PA-4, PA-5).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
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
  '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nHacer la grilla.\n'
/** Un error largo, como el que se copia de una consola: 340 líneas. */
const ERROR = Array.from({ length: 340 }, (_, i) => `    at paso${i} (C:\\app\\main.js:${i + 1}:7)`).join(
  '\n',
)

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '100',
    IRIDIUM_VSCODE: 'falso',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  return { app, win }
}

/** Pega un texto en el cuadro, como Ctrl+V; devuelve si Iridium se lo quedó (no lo dejó pegar como texto). */
async function pegarTexto(win: Page, texto: string): Promise<boolean> {
  return win.getByLabel('Mensaje para la IA').evaluate((el, t) => {
    const dt = new DataTransfer()
    dt.setData('text/plain', t)
    const e = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })
    el.dispatchEvent(e)
    return e.defaultPrevented
  }, texto)
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), estado)
})

test.afterEach(async () => {
  for (const c of [raiz, datos]) await rm(c, { recursive: true, force: true, maxRetries: 5 })
})

test('un texto largo pegado es una ficha: se lee en el visor y Ctrl+Z lo vuelve texto (PA-4)', async () => {
  const { app, win } = await abrir()
  const cuadro = win.getByLabel('Mensaje para la IA')
  const fichas = win.locator('.compositor .fichas .ficha')
  // Uno corto queda en el cuadro, como siempre.
  await cuadro.click()
  expect(await pegarTexto(win, 'una línea')).toBe(false)
  await expect(fichas).toHaveCount(0)

  await cuadro.fill('Mirá este error: ')
  expect(await pegarTexto(win, ERROR)).toBe(true)
  await expect(fichas).toHaveCount(1)
  await expect(fichas.first()).toContainText('Texto pegado')
  await expect(fichas.first()).toContainText('340 líneas')
  await expect(cuadro).toHaveValue('Mirá este error: ')
  await win.screenshot({ path: 'test-results/pa3-ficha.png' })

  // Un clic la abre en el visor para leerla.
  await win.getByRole('button', { name: /Texto pegado/ }).click()
  const visor = win.getByRole('dialog', { name: 'Texto pegado' })
  await expect(visor).toContainText('at paso0')
  await expect(visor).toContainText('Texto pegado · 340 líneas')
  await win.screenshot({ path: 'test-results/pa3-visor.png' })
  await win.keyboard.press('Escape')
  await expect(visor).toHaveCount(0)

  // Ctrl+Z justo después: vuelve al cuadro, donde se pegó, y la ficha se va.
  await cuadro.press('Control+z')
  await expect(fichas).toHaveCount(0)
  await expect(cuadro).toHaveValue(`Mirá este error: ${ERROR}`)
  await app.close()
})

test('varios pegados son varias fichas; escribir después deja la ficha; al mandar quedan en el mensaje (PA-4, PA-5)', async () => {
  const { app, win } = await abrir()
  const cuadro = win.getByLabel('Mensaje para la IA')
  const fichas = win.locator('.compositor .fichas .ficha')
  await cuadro.click()
  await pegarTexto(win, ERROR)
  await pegarTexto(win, 'x'.repeat(2500))
  await expect(fichas).toHaveCount(2)
  await expect(fichas.nth(1)).toContainText('1 línea')
  // Escribió otra cosa: Ctrl+Z ya no saca la ficha.
  await cuadro.pressSequentially('Esto se rompe al abrir.')
  await cuadro.press('Control+z')
  await expect(fichas).toHaveCount(2)
  // La ✕ saca una.
  await win.getByRole('button', { name: 'Sacar el texto pegado' }).last().click()
  await expect(fichas).toHaveCount(1)

  await cuadro.fill('Esto se rompe al abrir.')
  await cuadro.press('Enter')
  const mio = win.locator('.turno.usuario').first()
  await expect(mio.locator('.fichas.enviadas .ficha')).toHaveCount(1)
  await expect(mio.locator('.fichas.enviadas .ficha')).toContainText('340 líneas')
  await expect(mio).toContainText('Esto se rompe al abrir.')
  await expect(mio).not.toContainText('at paso0')
  await expect(win.locator('.hilo .respuesta-ia').last()).toContainText('1 texto pegado', { timeout: 10_000 })
  await win.screenshot({ path: 'test-results/pa3-enviado.png' })

  // Al reabrir la conversación desde ◔, la ficha sigue y se abre.
  await win.getByRole('button', { name: 'Nueva', exact: true }).click()
  await win.getByRole('button', { name: 'Conversaciones anteriores' }).click()
  await win.getByRole('menuitem', { name: /Esto se rompe al abrir/ }).click()
  const reabierto = win.locator('.turno.usuario').first()
  await expect(reabierto.locator('.fichas.enviadas .ficha')).toContainText('340 líneas')
  await reabierto.getByRole('button', { name: /Texto pegado/ }).click()
  await expect(win.getByRole('dialog', { name: 'Texto pegado' })).toContainText('at paso339')
  await app.close()
})
