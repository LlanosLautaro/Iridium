// DI-I4 con la app abierta y el motor falso: las versiones de una maqueta (DS-5, DS-9, DS-12) sobre la muestra
// `tests/muestras/diseno` — el lienzo dice cuántas tiene, la grande las pone lado a lado, una versión se agranda (en el
// `webview`, para comentarla) y vuelve, Quedarme con esta la vuelve la maqueta con lo de antes en la papelera, y Otra
// versión pide una frase, dice que gasta uso y muestra su lugar mientras la IA la escribe.
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let base: string
let raiz: string
let datos: string
let papelera: string
let abierta: ElectronApplication | null = null

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
  '# Estado del proyecto\n\n**Última actualización:** 2026-11-25\n\n## Hito actual\n6 — UI — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'

/** Una versión de la lista, como la escribiría la IA: las hojas a dos carpetas y la frase en su `<meta>`. */
const version = (titulo: string, frase: string) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${titulo}</title>
<meta name="descripcion" content="${frase}">
<link rel="stylesheet" href="../../tokens.css"><link rel="stylesheet" href="../../piezas.css"></head>
<body>
<header class="cabecera"><strong>Notas</strong> <a class="boton" id="abrir" href="../../pantallas/nota.html">Abrir</a></header>
<div class="tarjeta" style="padding: 48px">Comprar pan <div class="segundo">hoy</div></div>
<div class="tarjeta" style="padding: 48px">Llamar a Beta <div class="segundo">ayer</div></div>
</body></html>
`

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '60',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_PAPELERA: papelera,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

/** Corre algo en la página de la maqueta grande (el `webview`), desde el proceso principal. */
function enLaGrande<T>(app: ElectronApplication, js: string): Promise<T> {
  return app.evaluate(async ({ webContents }, codigo) => {
    const w = webContents.getAllWebContents().find((x) => x.getType() === 'webview')
    if (!w) throw new Error('No hay webview')
    return w.executeJavaScript(codigo)
  }, js) as Promise<T>
}

async function entrarADiseno(win: Page) {
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Diseño' })
    .click()
  return win.locator('[data-seccion="diseno"]')
}

const alfa = (...p: string[]) => join(raiz, 'Alfa', 'docs', 'diseno', ...p)

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-di4-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  papelera = join(base, 'papelera')
  await cp(join(import.meta.dirname, '..', 'muestras', 'diseno'), join(raiz, 'Alfa'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), estado)
  await mkdir(alfa('versiones', 'lista'), { recursive: true })
  await writeFile(
    alfa('versiones', 'lista', 'b.html'),
    version('Lista en tarjetas', 'la lista como tarjetas grandes'),
  )
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

test('lado a lado: el lienzo las cuenta, se agranda una versión y Quedarme con esta la vuelve la maqueta', async () => {
  const { app, win } = await abrir()
  const diseno = await entrarADiseno(win)
  const mini = diseno.locator('.di-mini[data-archivo="pantallas/lista.html"]')
  await expect(mini.locator('.di-nversiones')).toHaveText('1 versión')
  await mini.click()
  const titulo = diseno.locator('.di-grande-t')
  await expect(titulo).toHaveText('Lista · 1 de 3')
  await diseno.getByRole('button', { name: 'Versiones · 1' }).click()

  // La de hoy y la versión B, vivas y con su frase.
  await expect(titulo).toHaveText('Lista · 1 versión')
  const hoy = diseno.getByRole('region', { name: 'Hoy' })
  const b = diseno.getByRole('region', { name: 'Versión B' })
  await expect(hoy.locator('.di-version-frase')).toHaveText('La maqueta como está')
  await expect(b.locator('.di-version-frase')).toHaveText('la lista como tarjetas grandes')
  const marco = (archivo: string) => win.frames().find((f) => f.url().includes(archivo))
  await expect.poll(() => marco('versiones/lista/b.html')?.title()).toBe('Lista en tarjetas')
  await expect.poll(() => marco('pantallas/lista.html')?.title()).toBe('Lista')
  // Lado a lado, con el mismo ancho.
  const [ah, ab] = await Promise.all([hoy.boundingBox(), b.boundingBox()])
  expect(ah && ab && ab.x > ah.x + ah.width - 1).toBe(true)
  expect(Math.abs((ah?.width ?? 0) - (ab?.width ?? 0))).toBeLessThan(2)
  await win.screenshot({ path: 'test-results/di4-lado-a-lado.png' })

  // Agrandar la versión la pasa al webview (para usarla y comentarla); las flechas van entre la de hoy y ella.
  await b.getByRole('button', { name: 'Agrandar' }).click()
  await expect(titulo).toHaveText('Lista · versión B · 2 de 2')
  await expect.poll(() => enLaGrande<string>(app, 'document.title').catch(() => '')).toBe('Lista en tarjetas')
  await win.screenshot({ path: 'test-results/di4-version-grande.png' })
  await win.keyboard.press('ArrowRight')
  await expect(titulo).toHaveText('Lista · 1 de 2')
  // Esc vuelve a las versiones, no al lienzo.
  await win.keyboard.press('Escape')
  await expect(diseno.getByRole('region', { name: 'Versión B' })).toBeVisible()

  // Quedarme con esta: el cuadro dice qué pasa; la versión pasa a ser la maqueta y anda desde su carpeta.
  await b.getByRole('button', { name: 'Quedarme con esta' }).click()
  const cuadro = win.getByRole('dialog', { name: 'Quedarme con la versión B' })
  await expect(cuadro).toContainText('pasa a ser la maqueta «Lista»')
  await expect(cuadro).toContainText('papelera de Windows')
  await win.screenshot({ path: 'test-results/di4-quedarme.png' })
  await cuadro.getByRole('button', { name: 'Quedarme con esta' }).click()
  await expect(titulo).toHaveText('Lista · 1 de 3')
  await expect(diseno.getByRole('button', { name: /^Versiones/ })).toHaveCount(0)
  await expect.poll(() => enLaGrande<string>(app, 'document.title').catch(() => '')).toBe('Lista en tarjetas')
  // Sus hojas cargan: el fondo negro de los tokens.
  expect(await enLaGrande<string>(app, 'getComputedStyle(document.body).backgroundColor')).toBe(
    'rgb(0, 0, 0)',
  )
  const ahora = await readFile(alfa('pantallas', 'lista.html'), 'utf8')
  expect(ahora).toContain('href="../tokens.css"')
  expect(ahora).toContain('href="nota.html"')
  expect(ahora).not.toContain('descripcion')
  // Lo de antes, en la papelera: la maqueta vieja y la carpeta de las versiones.
  expect((await readdir(papelera)).map((n) => n.replace(/^\d+-/, '')).sort()).toEqual(['lista', 'lista.html'])
  await win.keyboard.press('Escape')
  await expect(mini.locator('.di-nversiones')).toHaveCount(0)
  await app.close()
})

test('Otra versión: la frase, el aviso de uso, su lugar mientras la IA escribe y la versión cuando llega', async () => {
  const { app, win } = await abrir()
  const diseno = await entrarADiseno(win)
  await diseno.locator('.di-mini[data-archivo="pantallas/nota.html"]').click()
  await expect(diseno.locator('.di-grande-t')).toHaveText('Nota abierta · 2 de 3')
  await expect(diseno.getByRole('button', { name: /^Versiones/ })).toHaveCount(0)
  await diseno.getByRole('button', { name: 'Otra versión' }).click()
  const cuadro = win.getByRole('dialog', { name: 'Otra versión de Nota abierta' })
  await expect(cuadro).toContainText('Gasta uso')
  await expect(cuadro.getByRole('button', { name: 'Pedírsela' })).toBeDisabled()
  // Esc cierra el cuadro, no la grande.
  await win.keyboard.press('Escape')
  await expect(cuadro).toHaveCount(0)
  await expect(diseno.locator('.di-grande-t')).toHaveText('Nota abierta · 2 de 3')
  await diseno.getByRole('button', { name: 'Otra versión' }).click()
  await cuadro.getByLabel('Qué probar').fill('la nota con el texto más grande')
  await win.screenshot({ path: 'test-results/di4-otra-version.png' })
  await cuadro.getByRole('button', { name: 'Pedírsela' }).click()

  // Lado a lado, con el lugar de la versión A mientras la IA trabaja; el pedido llegó a la conversación.
  const nueva = diseno.getByRole('region', { name: 'Versión nueva' })
  await expect(nueva).toContainText('La IA está escribiendo la versión…')
  await expect(nueva).toContainText('Versión A')
  await expect(nueva).toContainText('la nota con el texto más grande')
  // La de hoy, viva al lado.
  await expect
    .poll(() =>
      win
        .frames()
        .find((f) => f.url().includes('pantallas/nota.html'))
        ?.evaluate(() => document.body.innerText.length),
    )
    .toBeGreaterThan(0)
  await expect(win.getByRole('complementary', { name: 'Conversación' })).toContainText(
    'Escribí otra versión de la maqueta',
    { timeout: 10_000 },
  )
  await win.screenshot({ path: 'test-results/di4-escribiendo.png' })
  // El motor falso no la escribe: al terminar su turno, se dice.
  await expect(win.getByRole('button', { name: 'Detener' })).toHaveCount(0, { timeout: 20_000 })
  await expect(diseno.getByText('La IA terminó sin escribir la versión A')).toBeVisible()
  // Cuando aparece (la escribe la IA en otro turno), se suma con su frase y el aviso se va.
  await mkdir(alfa('versiones', 'nota'), { recursive: true })
  await writeFile(
    alfa('versiones', 'nota', 'a.html'),
    version('Nota grande', 'la nota con el texto más grande'),
  )
  const a = diseno.getByRole('region', { name: 'Versión A' })
  await expect(a.locator('.di-version-frase')).toHaveText('la nota con el texto más grande', {
    timeout: 10_000,
  })
  await expect(diseno.getByText('La IA terminó sin escribir')).toHaveCount(0)
  // Guardar para después: vuelve a la grande y las versiones quedan.
  await diseno.getByRole('button', { name: 'Guardar para después' }).click()
  await expect(diseno.locator('.di-grande-t')).toHaveText('Nota abierta · 2 de 3')
  await expect(diseno.getByRole('button', { name: 'Versiones · 1' })).toBeVisible()
  expect(await readdir(alfa('versiones', 'nota'))).toEqual(['a.html'])
  await app.close()
})
