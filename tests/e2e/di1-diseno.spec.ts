// DI-I1 con la app abierta y el motor falso: la sección Diseño (DS-11 a DS-13) sobre la muestra `tests/muestras/diseno`
// — el lienzo con las maquetas vivas y agrupadas, la rota con su motivo, el redibujo con su punto, la grande con un
// enlace a otra maqueta, las flechas y Esc, que nada salga a la red, Sistema y Pedírselo a la IA sin `docs/diseno/`.
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let base: string
let raiz: string
let datos: string
let abierta: ElectronApplication | null = null
let servidor: Server
let pedidosAfuera: string[] = []
let puerto = 0

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
  '# Estado del proyecto\n\n**Última actualización:** 2026-11-08\n\n## Hito actual\n6 — UI — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '60',
    IRIDIUM_REVISION: 'no',
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

async function entrarADiseno(win: Page, proyecto: string) {
  await win.locator('.tarjeta', { hasText: proyecto }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Diseño' })
    .click()
  return win.locator('[data-seccion="diseno"]')
}

test.beforeAll(async () => {
  servidor = createServer((req, res) => {
    pedidosAfuera.push(req.url ?? '')
    res.end('ok')
  })
  await new Promise<void>((ok) => servidor.listen(0, '127.0.0.1', ok))
  puerto = (servidor.address() as AddressInfo).port
})
test.afterAll(() => servidor.close())

test.beforeEach(async () => {
  pedidosAfuera = []
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-di1-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  // Alfa: la muestra, con una maqueta más que intenta salir a la red de tres formas.
  await cp(join(import.meta.dirname, '..', 'muestras', 'diseno'), join(raiz, 'Alfa'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), estado)
  const afuera = `http://127.0.0.1:${puerto}`
  await writeFile(
    join(raiz, 'Alfa', 'docs', 'diseno', 'pantallas', 'red.html'),
    `<!doctype html><html><head><meta charset="utf-8"><title>Red</title><link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="${afuera}/hoja.css"></head><body><img src="${afuera}/imagen.png" alt="">
<script>fetch('${afuera}/fetch').catch(() => {}); document.title = 'Red cargada'</script></body></html>`,
  )
  const indice = join(raiz, 'Alfa', 'docs', 'diseno', 'README.md')
  await writeFile(indice, `${await readFile(indice, 'utf8')}| Red | Cuenta | pantallas/red.html | — |\n`)
  // Beta sigue el framework pero no tiene diseño.
  await mkdir(join(raiz, 'Beta', 'docs'), { recursive: true })
  await writeFile(join(raiz, 'Beta', '.proyecto.json'), ficha)
  await writeFile(join(raiz, 'Beta', 'docs', 'estado.md'), estado)
  await writeFile(join(raiz, 'Beta', 'docs', 'README.md'), '# Docs\n\n**Framework:** 2026-11-08\n')
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

test('el lienzo: las maquetas vivas por sección, la rota con su motivo y el redibujo con su punto (DS-3)', async () => {
  const { app, win } = await abrir()
  const diseno = await entrarADiseno(win, 'Alfa')
  await expect(diseno.locator('.di-grupo-t')).toHaveText(['Notas 2', 'Cuenta 2'])
  await expect(diseno.locator('.di-mini .di-nombre')).toHaveText(['Lista', 'Nota abierta', 'Ajustes', 'Red'])
  // La rota no carga: muestra el motivo en su lugar.
  await expect(diseno.locator('.di-mini[data-archivo="pantallas/ajustes.html"] .di-motivo')).toHaveText(
    'Falta ../piezas-que-falta.css',
  )
  // Las demás, vivas en su iframe con los tokens del proyecto.
  const lista = () => win.frames().find((f) => f.url().includes('pantallas/lista.html'))
  await expect.poll(() => lista()?.title()).toBe('Lista')
  expect(await lista()?.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(0, 0, 0)')
  // Ni la miniatura que pide cosas a la red las recibe (la política de contenido).
  await expect
    .poll(() =>
      win
        .frames()
        .find((f) => f.url().includes('pantallas/red.html'))
        ?.title(),
    )
    .toBe('Red cargada')
  await win.screenshot({ path: 'test-results/di1-lienzo.png' })

  // La IA cambia una maqueta: se redibuja sola y queda con el punto hasta que se mira.
  const archivo = join(raiz, 'Alfa', 'docs', 'diseno', 'pantallas', 'lista.html')
  await writeFile(
    archivo,
    (await readFile(archivo, 'utf8')).replace('<title>Lista</title>', '<title>Lista nueva</title>'),
  )
  const mini = diseno.locator('.di-mini[data-archivo="pantallas/lista.html"]')
  await expect(mini.locator('.di-punto')).toBeVisible({ timeout: 10_000 })
  await expect.poll(() => lista()?.title()).toBe('Lista nueva')
  await expect(diseno.locator('.di-punto')).toHaveCount(1)
  await win.screenshot({ path: 'test-results/di1-punto.png' })
  expect(pedidosAfuera).toEqual([])
  await app.close()
})

test('la grande: se usa, un enlace lleva a otra maqueta, las flechas y Esc; nada sale a la red (DS-4, DS-12)', async () => {
  const { app, win } = await abrir()
  const diseno = await entrarADiseno(win, 'Alfa')
  await diseno.locator('.di-mini[data-archivo="pantallas/lista.html"]').click()
  const titulo = diseno.locator('.di-grande-t')
  await expect(titulo).toHaveText('Lista · 1 de 4')
  await expect.poll(() => enLaGrande<string>(app, 'document.title').catch(() => '')).toBe('Lista')
  // Viva: el enlace de la maqueta pasa a otra pantalla y la cabecera la sigue.
  await enLaGrande(app, "document.getElementById('abrir').click()")
  await expect(titulo).toHaveText('Nota abierta · 2 de 4')
  await expect.poll(() => enLaGrande<string>(app, 'document.title').catch(() => '')).toBe('Nota abierta')
  // Un clic de la maqueta anda.
  expect(
    await enLaGrande<string>(
      app,
      "document.getElementById('marcar').click(), document.getElementById('marcar').textContent",
    ),
  ).toBe('Hecha')
  await win.screenshot({ path: 'test-results/di1-grande.png' })
  // La flecha de la derecha pasa a la siguiente (la rota se saltea en el webview: no carga, pero se muestra).
  await diseno.getByRole('button', { name: 'Siguiente' }).click()
  await expect(titulo).toHaveText('Ajustes · 3 de 4')
  await diseno.getByRole('button', { name: 'Siguiente' }).click()
  await expect(titulo).toHaveText('Red · 4 de 4')
  await expect.poll(() => enLaGrande<string>(app, 'document.title').catch(() => '')).toBe('Red cargada')
  // Las flechas del teclado también, con el foco en Iridium (R-24).
  await win.keyboard.press('ArrowLeft')
  await expect(titulo).toHaveText('Ajustes · 3 de 4')
  await win.keyboard.press('ArrowRight')
  await expect(titulo).toHaveText('Red · 4 de 4')
  expect(pedidosAfuera).toEqual([])
  // Esc desde adentro de la maqueta vuelve al lienzo.
  await app.evaluate(({ webContents }) => {
    const w = webContents.getAllWebContents().find((x) => x.getType() === 'webview')
    w?.focus()
    w?.sendInputEvent({ type: 'keyDown', keyCode: 'Escape' })
    w?.sendInputEvent({ type: 'keyUp', keyCode: 'Escape' })
  })
  await expect(diseno.locator('.di-lienzo')).toBeVisible()
  await expect(diseno.locator('.di-mini[data-archivo="pantallas/red.html"]')).toBeFocused()
  await app.close()
})

test('Sistema: los colores, la letra, los tamaños y las piezas vivas (DS-13)', async () => {
  const { app, win } = await abrir()
  const diseno = await entrarADiseno(win, 'Alfa')
  await diseno.getByRole('button', { name: 'Sistema' }).click()
  const colores = diseno.getByRole('region', { name: 'Colores' })
  await expect(colores.locator('.di-token-n')).toHaveText([
    'fondo',
    'superficie',
    'texto',
    'texto-2',
    'borde',
  ])
  await expect(colores.locator('.di-token').first().locator('.di-muestra')).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)',
  )
  await expect(diseno.getByRole('region', { name: 'Letra', exact: true })).toContainText('Aa Iridium')
  // La muestra de la letra ocupa su lugar (se veía con ancho cero).
  expect(await diseno.locator('.di-letra').evaluate((e) => e.getBoundingClientRect().width)).toBeGreaterThan(
    40,
  )
  await expect(diseno.getByRole('region', { name: 'Tamaños de letra' }).locator('.di-token')).toHaveCount(3)
  // Un estilo de texto se dibuja con su peso y su tamaño, con los tokens del proyecto (T-61).
  const estilo = diseno.getByRole('region', { name: 'Estilos de texto' }).locator('.di-estilo')
  await expect(estilo).toHaveCSS('font-weight', '600')
  await expect(estilo).toHaveCSS('font-size', '22px')
  await diseno
    .getByRole('region', { name: 'Estilos de texto' })
    .screenshot({ path: 'test-results/t61-estilos.png' })
  // Las miniaturas cargan al verse: Piezas queda abajo del todo.
  await diseno.getByRole('region', { name: 'Piezas' }).scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      win
        .frames()
        .find((f) => f.url().includes('piezas.html'))
        ?.title(),
    )
    .toBe('Piezas')
  await win.screenshot({ path: 'test-results/di1-sistema.png' })
  await app.close()
})

test('sin docs/diseno/: el recuadro y Pedírselo a la IA con el cuadro antes (DS-1)', async () => {
  const { app, win } = await abrir()
  const diseno = await entrarADiseno(win, 'Beta')
  const recuadro = diseno.locator('.recuadro-simple')
  await expect(recuadro).toContainText('Este proyecto todavía no tiene su diseño')
  await recuadro.getByRole('button', { name: 'Pedírselo a la IA' }).click()
  const cuadro = win.getByRole('dialog', { name: 'Pedirle el diseño a la IA' })
  await expect(cuadro).toContainText('Gasta uso')
  await expect(cuadro).toContainText('desde la UX del proyecto')
  await win.screenshot({ path: 'test-results/di1-pedir.png' })
  await cuadro.getByRole('button', { name: 'Pedírselo' }).click()
  await expect(win.getByRole('complementary', { name: 'Conversación' })).toContainText(
    'Armá el diseño de este proyecto en',
    { timeout: 10_000 },
  )
  // Cerrar con la IA trabajando pregunta (F-6): se espera a que termine su turno.
  await expect(win.getByRole('button', { name: 'Detener' })).toHaveCount(0, { timeout: 20_000 })
  await app.close()
})
