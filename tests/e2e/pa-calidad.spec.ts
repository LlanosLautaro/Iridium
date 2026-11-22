// Paridad, paso 8 (calidad): los casos raros del texto pegado y que el compositor sea el mismo en todos los chats, con el
// motor falso. Un pegado de más de 1 MB no entra y lo dice; uno que no cabe en el cuadro no vuelve con Ctrl+Z; uno grande
// se guarda al cerrar Iridium; la General y la de Skills hacen lo mismo que la de un proyecto; y todo se usa con el teclado.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  type ElectronApplication,
  _electron as electron,
  expect,
  type Locator,
  type Page,
  test,
} from '@playwright/test'
import { armarCarpetaClaude } from '../muestras/carpeta-claude'

let base: string
let raiz: string
let datos: string
let claude: string
let abierta: ElectronApplication | null = null

async function proyecto(nombre: string, archivos: Record<string, string>, donde = raiz) {
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(donde, nombre, ruta, '..'), { recursive: true })
    await writeFile(join(donde, nombre, ruta), texto)
  }
}
const ficha = (estado = 'en-desarrollo') =>
  JSON.stringify({
    version: 1,
    descripcion: 'Un proyecto',
    estado,
    etiquetas: [],
    icono: null,
    archivado: false,
    reemplazadoPor: null,
  })
const estado = '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n'
/** Un registro largo, como el que se copia de una consola: 60 líneas. */
const REGISTRO = Array.from({ length: 60 }, (_, i) => `[${i}] conectando…`).join('\n')

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_CLAUDE: claude,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '60',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_VSCODE: 'falso',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

/** Pega un texto en el cuadro de un chat, como Ctrl+V; devuelve si Iridium se lo quedó. */
async function pegarTexto(chat: Locator, texto: string): Promise<boolean> {
  return chat.getByLabel('Mensaje para la IA').evaluate((el, t) => {
    const dt = new DataTransfer()
    dt.setData('text/plain', t)
    const e = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })
    el.dispatchEvent(e)
    return e.defaultPrevented
  }, texto)
}

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-pa-calidad-'))
  raiz = join(base, 'PROYECTOS')
  claude = join(base, '.claude')
  datos = join(base, 'datos')
  const iridium = join(raiz, '.iridium')
  await armarCarpetaClaude(claude, join(iridium, 'Skills'), join(base, 'afuera'))
  await proyecto('Skills', { '.proyecto.json': ficha(), 'CLAUDE.md': '# Skills\n' }, iridium)
  await proyecto('Ideas', { '.proyecto.json': ficha('idea'), 'CLAUDE.md': '# Ideas\n' }, iridium)
  await proyecto('Alfa', { '.proyecto.json': ficha(), 'docs/estado.md': estado })
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

test('un pegado enorme: de más de 1 MB no entra; uno grande se guarda al cerrar y no vuelve al cuadro con Ctrl+Z', async () => {
  let { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  let chat = win.getByRole('complementary', { name: 'Conversación' })
  const fichas = () => chat.locator('.compositor .fichas .ficha')
  await chat.getByLabel('Mensaje para la IA').click()

  // Más de 1 MB: no se pega como texto (llenaría el cuadro) ni como ficha; la línea dice qué hacer.
  expect(await pegarTexto(chat, 'x'.repeat(1024 * 1024 + 1))).toBe(true)
  await expect(fichas()).toHaveCount(0)
  await expect(chat.getByRole('note')).toContainText('Pasa de 1 MB')
  await win.screenshot({ path: 'test-results/pa-calidad-enorme.png' })
  await expect(chat.getByLabel('Mensaje para la IA')).toHaveValue('')

  // Medio mega: es una ficha; con Ctrl+Z no cabe en el cuadro y queda como ficha.
  const grande = Array.from({ length: 5000 }, (_, i) => `${i} ${'y'.repeat(95)}`).join('\n')
  expect(await pegarTexto(chat, grande)).toBe(true)
  await expect(fichas()).toHaveCount(1)
  await expect(fichas().first()).toContainText('5000 líneas')
  await chat.getByLabel('Mensaje para la IA').press('Control+z')
  await expect(fichas()).toHaveCount(1)
  await expect(chat.getByRole('note')).toContainText('demasiado largo para el cuadro')
  await chat.getByLabel('Mensaje para la IA').fill('Lo de arriba')
  await win.waitForTimeout(1500)
  await app.close()

  // Al volver a abrir Iridium (vuelve al proyecto que quedó abierto), la ficha y lo escrito siguen.
  ;({ app, win } = await abrir())
  chat = win.getByRole('complementary', { name: 'Conversación' })
  await expect(fichas()).toHaveCount(1)
  await expect(chat.getByLabel('Mensaje para la IA')).toHaveValue('Lo de arriba')
  await chat.getByLabel('Mensaje para la IA').press('Enter')
  const mio = chat.locator('.turno.usuario').first()
  await expect(mio.locator('.fichas.enviadas .ficha')).toContainText('5000 líneas')
  await expect(chat.locator('.hilo .respuesta-ia').last()).toContainText('1 texto pegado', {
    timeout: 10_000,
  })
  await app.close()
})

for (const [nombre, ir] of [
  ['Chat general', async (win: Page) => win.keyboard.press('Control+1')],
  ['Chat de Skills', async (win: Page) => win.keyboard.press('Control+2')],
] as const) {
  test(`${nombre}: el texto pegado es una ficha, como en un proyecto, y se usa con el teclado`, async () => {
    const { app, win } = await abrir()
    await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
    await ir(win)
    const chat = win.getByRole('complementary', { name: nombre })
    const cuadro = chat.getByLabel('Mensaje para la IA')
    await cuadro.click()
    expect(await pegarTexto(chat, REGISTRO)).toBe(true)
    const fichas = chat.locator('.compositor .fichas .ficha')
    await expect(fichas).toHaveCount(1)
    await expect(fichas.first()).toContainText('60 líneas')

    // Con el teclado: la ficha se abre con Enter, Esc la cierra y la ✕ sigue con Tab. Se mira el elemento con el foco
    // dentro de la página: el foco de la ventana de Windows depende de las otras pruebas abiertas.
    const abrirFicha = chat.getByRole('button', { name: /Texto pegado/ })
    const conFoco = () =>
      win.evaluate(
        () =>
          document.activeElement?.getAttribute('aria-label') ??
          document.activeElement?.getAttribute('title') ??
          '',
      )
    // Después de pegar, el foco vuelve al cuadro en el próximo cuadro de la pantalla: se espera a que llegue.
    await expect.poll(conFoco).toBe('Mensaje para la IA')
    await abrirFicha.press('Enter')
    const visor = win.getByRole('dialog', { name: 'Texto pegado' })
    await expect(visor).toContainText('[59] conectando…')
    await win.screenshot({
      path: `test-results/pa-calidad-${nombre === 'Chat general' ? 'general' : 'skills'}.png`,
    })
    // Esc lo cierra aunque el foco se haya ido del visor (al cuadro, de atrás), y el foco vuelve a la ficha.
    await cuadro.evaluate((el) => el.focus())
    await win.keyboard.press('Escape')
    await expect(visor).toHaveCount(0)
    await expect.poll(conFoco).toBe('Abrir para leerlo')
    await abrirFicha.press('Tab')
    expect(await conFoco()).toBe('Sacar el texto pegado')

    await cuadro.fill('Mirá esto')
    await cuadro.press('Enter')
    const mio = chat.locator('.turno.usuario').first()
    await expect(mio.locator('.fichas.enviadas .ficha')).toContainText('60 líneas')
    await expect(mio).toContainText('Mirá esto')
    await expect(chat.locator('.hilo .respuesta-ia').last()).toContainText('1 texto pegado', {
      timeout: 10_000,
    })
    await app.close()
  })
}
