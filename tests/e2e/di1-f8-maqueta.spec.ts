// DI-I1: F8 sobre una maqueta grande (`modulos/diseno/diseno-tecnico.md` › F8 sobre una maqueta). Iridium carga el
// ayudante de la Revisión (IRIDIUM_AYUDANTE, una copia de la extensión con otro puerto); en Diseño, F8 sobre la maqueta
// grande abre el modo comentar con el proyecto de la maqueta, y el comentario llega a ese proyecto como `R-n` con su
// campo Maqueta y la captura. En Revisión, el enlace abre esa maqueta grande.
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, test } from '@playwright/test'

const PUERTO = 47393

let base: string
let raiz: string
let iridium: ElectronApplication | null = null

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})

/** Corre algo en la maqueta grande (el `webview`), desde el proceso principal. */
function enLaGrande<T>(app: ElectronApplication, js: string): Promise<T> {
  return app.evaluate(async ({ webContents }, codigo) => {
    const w = webContents.getAllWebContents().find((x) => x.getType() === 'webview')
    if (!w) throw new Error('No hay webview')
    return w.executeJavaScript(codigo)
  }, js) as Promise<T>
}

/** Lo que se le manda a la maqueta: una tecla, una letra o el ratón. */
type Evento = { type: string; keyCode?: string; x?: number; y?: number; button?: 'left'; clickCount?: number }

/** Una tecla o un clic de verdad dentro de la maqueta grande, con el foco puesto en ella. */
function enviar(app: ElectronApplication, eventos: Evento[]) {
  return app.evaluate(({ webContents }, lista) => {
    const w = webContents.getAllWebContents().find((x) => x.getType() === 'webview')
    w?.focus()
    for (const e of lista) w?.sendInputEvent(e as Electron.MouseInputEvent & Electron.KeyboardInputEvent)
  }, eventos)
}

const AVISO = `(() => { const c = document.querySelector('iridium-revision'); return c?.shadowRoot?.querySelector('.aviso')?.textContent ?? '' })()`
const TARJETA = `(() => { const c = document.querySelector('iridium-revision'); return c?.shadowRoot?.querySelector('.tarjeta')?.textContent ?? '' })()`

test.beforeAll(async () => {
  await mkdir(join(process.cwd(), 'tests', 'e2e', '.tmp'), { recursive: true })
  base = await mkdtemp(join(process.cwd(), 'tests', 'e2e', '.tmp', 'di1-f8-'))
  raiz = join(base, 'PROYECTOS')
  const datos = join(base, 'datos')
  await mkdir(datos, { recursive: true })
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await cp(join(process.cwd(), 'tests', 'muestras', 'diseno'), join(raiz, 'Alfa'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  await writeFile(
    join(raiz, 'Alfa', 'docs', 'estado.md'),
    '# Estado del proyecto\n\n**Última actualización:** 2026-11-08\n\n## Hito actual\n6 — UI — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n',
  )
  // La extensión con el puerto de la prueba y la capa abierta (para leerla desde afuera).
  const extension = join(base, 'extension')
  await cp(join(process.cwd(), 'out', 'extension'), extension, { recursive: true })
  const sw = join(extension, 'js', 'sw.js')
  await writeFile(
    sw,
    (await readFile(sw, 'utf8')).replace('const PUERTO = 47321', `const PUERTO = ${PUERTO}`),
  )
  for (const n of ['selector', 'inyectado']) {
    const sel = join(extension, 'js', `${n}.js`)
    await writeFile(sel, (await readFile(sel, 'utf8')).replace(`mode: "closed"`, `mode: "open"`))
  }
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION_PUERTO: String(PUERTO),
    IRIDIUM_AYUDANTE: join(extension, 'electron', 'ayudante.mjs'),
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  iridium = await electron.launch({ args: ['.'], env })
})

test.afterAll(async () => {
  await iridium?.close()
  await rm(base, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('F8 sobre una maqueta grande: el comentario llega a su proyecto con la maqueta y la captura', async () => {
  const app = iridium as ElectronApplication
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Diseño' })
    .click()
  await win.locator('.di-mini[data-archivo="pantallas/lista.html"]').click()
  await expect.poll(() => enLaGrande<string>(app, 'document.title').catch(() => '')).toBe('Lista')

  // La extensión entra con la página (y quizá la recarga una vez): F8 hasta que aparezca el modo comentar.
  await expect
    .poll(
      async () => {
        await enviar(app, [
          { type: 'keyDown', keyCode: 'F8' },
          { type: 'keyUp', keyCode: 'F8' },
        ])
        // El aviso aparece cuando Iridium responde y se va solo al terminar su animación: se mira seguido.
        for (let i = 0; i < 15; i++) {
          const aviso = await enLaGrande<string>(app, AVISO).catch(() => '')
          if (aviso) return aviso
          await win.waitForTimeout(100)
        }
        if (await enLaGrande<boolean>(app, "!!document.querySelector('iridium-revision')").catch(() => false))
          await enviar(app, [
            { type: 'keyDown', keyCode: 'F8' },
            { type: 'keyUp', keyCode: 'F8' },
          ])
        return ''
      },
      { timeout: 25_000 },
    )
    .toContain('Comentando en Alfa')

  // Un clic sobre la tarjeta «Comprar pan» abre el cuadro del comentario.
  const r = await enLaGrande<{ x: number; y: number }>(
    app,
    `(() => { const r = document.querySelectorAll('.tarjeta')[0].getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) } })()`,
  )
  await enviar(app, [
    { type: 'mouseMove', x: r.x, y: r.y },
    { type: 'mouseDown', x: r.x, y: r.y, button: 'left', clickCount: 1 },
    { type: 'mouseUp', x: r.x, y: r.y, button: 'left', clickCount: 1 },
  ])
  await expect.poll(() => enLaGrande<string>(app, TARJETA).catch(() => '')).toContain('Alfa')
  await enviar(
    app,
    [...'la tarjeta necesita más aire'].map((c) => ({ type: 'char', keyCode: c }) as Evento),
  )
  await win.waitForTimeout(900)
  await win.screenshot({ path: 'test-results/di1-f8.png' })
  await enviar(app, [
    { type: 'keyDown', keyCode: 'Return' },
    { type: 'keyUp', keyCode: 'Return' },
  ])
  await expect
    .poll(() => enLaGrande<string>(app, TARJETA).catch(() => ''), { timeout: 15_000 })
    .toContain('Guardado en Alfa')

  const carpeta = join(raiz, 'Alfa', 'docs', 'revision')
  const md = await readFile(join(carpeta, 'R-1.md'), 'utf8')
  expect(md).toContain('**Maqueta:** `docs/diseno/pantallas/lista.html`')
  expect(md).toContain('la tarjeta necesita más aire')
  expect(md).toContain('**Captura:** ![R-1](R-1.png)')
  expect((await stat(join(carpeta, 'R-1.png'))).size).toBeGreaterThan(300)

  // Esc no sale de la grande mientras está comentando.
  await enviar(app, [
    { type: 'keyDown', keyCode: 'Escape' },
    { type: 'keyUp', keyCode: 'Escape' },
  ])
  await win.waitForTimeout(300)
  await expect(win.locator('.di-grande')).toBeVisible()

  // El primer Esc cerró la tarjeta del comentario: el botón muestra que sigue comentando. El segundo apaga el modo.
  const comentar = win.locator('.di-grande-cab').getByRole('button', { name: /^Coment/ })
  await expect(comentar).toHaveAttribute('aria-pressed', 'true')
  await enviar(app, [
    { type: 'keyDown', keyCode: 'Escape' },
    { type: 'keyUp', keyCode: 'Escape' },
  ])
  await expect(comentar).toHaveAttribute('aria-pressed', 'false')
  await expect(win.locator('.di-grande')).toBeVisible()

  // El botón Comentar prende el modo comentar en la maqueta, no en Iridium (Q-152), y lo muestra apretado.
  await comentar.click()
  await expect(comentar).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => enLaGrande<boolean>(app, "!!document.querySelector('iridium-revision')")).toBe(true)
  // Comentando, → pasa a la siguiente y sigue comentando en ella (R-24).
  await enviar(app, [
    { type: 'keyDown', keyCode: 'Right' },
    { type: 'keyUp', keyCode: 'Right' },
  ])
  await expect(win.locator('.di-grande-t')).toHaveText('Nota abierta · 2 de 3')
  await expect
    .poll(() => enLaGrande<boolean>(app, "!!document.querySelector('iridium-revision')").catch(() => false), {
      timeout: 10_000,
    })
    .toBe(true)
  await expect(comentar).toHaveAttribute('aria-pressed', 'true')
  await win.screenshot({ path: 'test-results/di1-f8-flechas.png' })
  // ← vuelve; con el botón se apaga.
  await enviar(app, [
    { type: 'keyDown', keyCode: 'Left' },
    { type: 'keyUp', keyCode: 'Left' },
  ])
  await expect(win.locator('.di-grande-t')).toHaveText('Lista · 1 de 3')
  await expect(comentar).toHaveAttribute('aria-pressed', 'true')
  await comentar.click()
  await expect(comentar).toHaveAttribute('aria-pressed', 'false')
  await expect
    .poll(() => enLaGrande<boolean>(app, "!!document.querySelector('iridium-revision')"))
    .toBe(false)

  // En Revisión, el enlace del comentario abre la maqueta grande.
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Revisión' })
    .click()
  await win.locator('.fila-com', { hasText: 'la tarjeta necesita más aire' }).click()
  await win.getByRole('button', { name: /la maqueta docs\/diseno\/pantallas\/lista\.html/ }).click()
  await expect(win.locator('[data-seccion="diseno"] .di-grande-t')).toHaveText('Lista · 1 de 3')
  await win.screenshot({ path: 'test-results/di1-f8-revision.png' })
})
