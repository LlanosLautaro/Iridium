// PA-I2 (frente Paridad): archivos y fotos en la conversación, con el motor falso. El + › Agregar y Ctrl+U (con el
// selector de Windows reemplazado), pegar una captura, las fichas y el visor, mandar y ver las fichas en el mensaje, lo
// que no se pierde al cerrar, el borde de soltar y un motor sin fotos (PA-2, PA-3, PA-5, PA-6). Soltar archivos desde el
// explorador no se puede automatizar (la ruta la da Electron solo para archivos de verdad): va a la prueba del usuario.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { crc32, deflateSync } from 'node:zlib'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let afuera: string

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
/** Una PNG de verdad (64×40, un degradé), que Electron puede achicar para la miniatura. */
function png(ancho: number, alto: number): Buffer {
  const trozo = (tipo: string, datos: Buffer) => {
    const largo = Buffer.alloc(4)
    largo.writeUInt32BE(datos.length)
    const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(cuerpo))
    return Buffer.concat([largo, cuerpo, crc])
  }
  const cabecera = Buffer.alloc(13)
  cabecera.writeUInt32BE(ancho, 0)
  cabecera.writeUInt32BE(alto, 4)
  cabecera[8] = 8
  cabecera[9] = 2
  const fila = ancho * 3 + 1
  const crudo = Buffer.alloc(fila * alto)
  for (let y = 0; y < alto; y++)
    for (let x = 0; x < ancho; x++) crudo.set([40 + x * 2, 60 + y * 3, 140], y * fila + 1 + x * 3)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', cabecera),
    trozo('IDAT', deflateSync(crudo)),
    trozo('IEND', Buffer.alloc(0)),
  ])
}
const PNG = png(64, 40)

/** Abre Iridium y entra a Alfa; `vuelve`: Iridium ya vuelve solo al proyecto que estaba abierto (D-060). */
async function abrir(
  extra: Record<string, string> = {},
  vuelve = false,
): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '100',
    IRIDIUM_VSCODE: 'falso',
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  if (!vuelve) await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  return { app, win }
}

/** El selector de Windows no se puede manejar: devuelve estas rutas. */
async function elegirAl(app: ElectronApplication, rutas: string[]): Promise<void> {
  await app.evaluate(({ dialog }, r) => {
    dialog.showOpenDialog = (async () => ({ canceled: false, filePaths: r })) as typeof dialog.showOpenDialog
  }, rutas)
}

/** Pega una imagen en el cuadro, como Ctrl+V con una captura en el portapapeles. */
async function pegarImagen(win: Page): Promise<void> {
  await win.getByLabel('Mensaje para la IA').evaluate((el, b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const dt = new DataTransfer()
    dt.items.add(new File([bytes], 'image.png', { type: 'image/png' }))
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }))
  }, PNG.toString('base64'))
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  afuera = await mkdtemp(join(tmpdir(), 'iridium-e2e-afuera-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), estado)
  await writeFile(join(afuera, 'captura-instalador.png'), PNG)
  await writeFile(join(afuera, 'registro-instalador.log'), 'Error: falta una dll\n')
})

test.afterEach(async () => {
  for (const c of [raiz, datos, afuera]) await rm(c, { recursive: true, force: true, maxRetries: 5 })
})

test('el + › Agregar suma fichas, la foto se ve grande y al mandar quedan en el mensaje (PA-2, PA-5)', async () => {
  const { app, win } = await abrir()
  const cuadro = win.getByLabel('Mensaje para la IA')
  const fichas = win.locator('.compositor .fichas')
  await elegirAl(app, [join(afuera, 'captura-instalador.png'), join(afuera, 'registro-instalador.log')])
  await win.locator('.compositor').getByRole('button', { name: 'Agregar archivos, fotos o comandos' }).click()
  await expect(win.getByRole('menuitem', { name: /Agregar archivos o fotos/ })).toContainText('Ctrl+U')
  await win.screenshot({ path: 'test-results/pa2-mas.png' })
  await win.getByRole('menuitem', { name: /Agregar archivos o fotos/ }).click()
  await expect(fichas.locator('.ficha')).toHaveCount(2)
  // La foto, como miniatura; el archivo, con su nombre (la ruta entera al pasar el mouse).
  await expect(fichas.locator('.ficha.foto img')).toHaveAttribute('src', /^data:image\/png;base64,/)
  await expect(fichas.locator('.ficha', { hasText: 'registro-instalador.log' })).toHaveAttribute(
    'title',
    join(afuera, 'registro-instalador.log'),
  )
  // Ctrl+U con lo mismo no repite.
  await cuadro.click()
  await cuadro.press('Control+u')
  await expect(fichas.locator('.ficha')).toHaveCount(2)

  // Un clic en la foto la abre en el visor; Esc lo cierra.
  await fichas.getByRole('button', { name: 'Ver captura-instalador.png' }).click()
  const visor = win.getByRole('dialog', { name: 'captura-instalador.png' })
  await expect(visor.locator('img')).toBeVisible()
  await expect(visor).toContainText('64×40')
  await win.screenshot({ path: 'test-results/pa2-visor.png' })
  await win.keyboard.press('Escape')
  await expect(visor).toHaveCount(0)

  await cuadro.fill('Ahí va el error y la captura del instalador.')
  await win.screenshot({ path: 'test-results/pa2-fichas.png' })
  await cuadro.press('Enter')
  const mio = win.locator('.turno.usuario').first()
  await expect(mio.locator('.fichas.enviadas .ficha')).toHaveCount(2)
  await expect(mio).toContainText('Ahí va el error')
  await expect(fichas).toHaveCount(0)
  await expect(win.locator('.hilo .respuesta-ia').last()).toContainText('Vi 1 foto, 1 archivo.', {
    timeout: 10_000,
  })
  await win.screenshot({ path: 'test-results/pa2-enviado.png' })
  // La foto del mensaje también se abre grande.
  await mio.getByRole('button', { name: 'Ver captura-instalador.png' }).click()
  await expect(win.getByRole('dialog').locator('img')).toBeVisible()
  await win.keyboard.press('Escape')

  // Al reabrir la conversación desde ◔, las fichas siguen.
  await win.getByRole('button', { name: 'Nueva', exact: true }).click()
  await win.getByRole('button', { name: 'Conversaciones anteriores' }).click()
  await win.getByRole('menuitem', { name: /Ahí va el error/ }).click()
  await expect(win.locator('.turno.usuario').first().locator('.fichas.enviadas .ficha')).toHaveCount(2)
  await app.close()
})

test('pegar una captura la suma como foto; las fichas no se pierden al cerrar Iridium (PA-3)', async () => {
  let { app, win } = await abrir()
  const fichas = () => win.locator('.compositor .fichas .ficha')
  await win.getByLabel('Mensaje para la IA').click()
  await pegarImagen(win)
  await expect(fichas()).toHaveCount(1)
  await expect(fichas().first()).toHaveAttribute('title', 'Imagen pegada')
  await expect(win.getByLabel('Mensaje para la IA')).toHaveValue('')
  await elegirAl(app, [join(afuera, 'registro-instalador.log')])
  await win.getByLabel('Mensaje para la IA').press('Control+u')
  await expect(fichas()).toHaveCount(2)
  // Se guardan con lo escrito: al volver a abrir Iridium siguen ahí.
  await win.waitForTimeout(800)
  await app.close()
  ;({ app, win } = await abrir({}, true))
  await expect(fichas()).toHaveCount(2)
  // La ✕ saca una.
  await win.getByRole('button', { name: 'Sacar registro-instalador.log' }).click()
  await expect(fichas()).toHaveCount(1)
  // Solo con la foto, sin texto, se manda.
  await win.getByLabel('Mensaje para la IA').press('Enter')
  await expect(win.locator('.hilo .respuesta-ia').last()).toContainText('Vi 1 foto.', { timeout: 10_000 })
  await app.close()
})

test('arrastrar archivos sobre la conversación la marca para soltar (PA-2)', async () => {
  const { app, win } = await abrir()
  await win.locator('.chat .hilo').evaluate((el) => {
    const dt = new DataTransfer()
    dt.items.add(new File(['x'], 'a.txt', { type: 'text/plain' }))
    el.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true, cancelable: true }))
  })
  await expect(win.locator('.chat.soltando .soltar')).toBeVisible()
  await expect(win.locator('.chat .soltar')).toHaveText('Suelta para adjuntar')
  await win.screenshot({ path: 'test-results/pa2-soltar.png' })
  await win.locator('.chat .hilo').evaluate((el) => {
    el.dispatchEvent(new DragEvent('dragleave', { bubbles: true, relatedTarget: null }))
  })
  await expect(win.locator('.chat.soltando')).toHaveCount(0)
  await app.close()
})

test('un comando de Claude Code con adjuntos no se manda y lo dice (D-169 › 7)', async () => {
  const { app, win } = await abrir()
  await elegirAl(app, [join(afuera, 'registro-instalador.log')])
  const cuadro = win.getByLabel('Mensaje para la IA')
  await cuadro.click()
  await cuadro.press('Control+u')
  await cuadro.fill('/compact ')
  await expect(win.locator('.linea-cmd')).toContainText('los comandos de Claude Code no llevan adjuntos')
  await expect(win.getByRole('button', { name: 'Enviar' })).toBeDisabled()
  // El de una skill sí los lleva.
  await cuadro.fill('/mi-skill revisalo')
  await expect(win.locator('.linea-cmd')).toHaveCount(0)
  await cuadro.press('Enter')
  await expect(win.locator('.hilo .texto-doc').last()).toContainText('Vi 1 archivo.', { timeout: 10_000 })
  await app.close()
})

test('un motor sin fotos: el + dice «Agregar archivos» y una imagen pegada no se pega (PA-6)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_FOTOS: 'no' })
  await win.locator('.compositor').getByRole('button', { name: 'Agregar archivos o comandos' }).click()
  await expect(win.getByRole('menuitem', { name: /^Agregar archivos/ })).not.toContainText('fotos')
  await win.keyboard.press('Escape')
  await win.getByLabel('Mensaje para la IA').click()
  await pegarImagen(win)
  await expect(win.locator('.compositor .linea-cmd')).toHaveText('Este motor no recibe fotos pegadas.')
  await expect(win.locator('.compositor .fichas')).toHaveCount(0)
  // Una foto elegida va como archivo.
  await elegirAl(app, [join(afuera, 'captura-instalador.png')])
  await win.getByLabel('Mensaje para la IA').press('Control+u')
  await expect(win.locator('.compositor .ficha')).toHaveCount(1)
  await expect(win.locator('.compositor .ficha.foto')).toHaveCount(0)
  await app.close()
})
