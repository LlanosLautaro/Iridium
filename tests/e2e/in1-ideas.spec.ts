// Ideas del inicio con la app abierta y el motor falso: el bloc de notas (D-112, D-126; DI-I3, tanda 8): Ctrl+3, la
// hoja con sus fechas, enlaces e imágenes, escribir y pegar que se guarda solo en `notas.md`, la hoja que cambia afuera,
// la grilla solo con proyectos (Ideas y Skills están en la carpeta Iridium, D-083) y Abrir como proyecto desde Ideas y
// Skills.
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { armarCarpetaClaude } from '../muestras/carpeta-claude'

let base: string
let raiz: string
let claude: string
let datos: string
let iridium: string
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
const FRAMEWORK = '# Docs\n\n**Framework:** 2026-11-06\n'
const TRABAJO_ALFA = `# Trabajo

## T-1 — Un atajo para la grilla
Estado: nueva · Fecha: 2026-11-01

## T-2 — Respaldo en GitHub
Estado: pendiente · Fecha: 2026-11-04

## T-3 — Exportar el plan como imagen
Estado: nueva · Fecha: 2026-11-06
`

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_CLAUDE: claude,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '60',
    IRIDIUM_REVISION: 'no',
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-ideas-'))
  raiz = join(base, 'PROYECTOS')
  claude = join(base, '.claude')
  datos = join(base, 'datos')
  iridium = join(raiz, '.iridium')
  await armarCarpetaClaude(claude, join(iridium, 'Skills'), join(base, 'afuera'))
  await proyecto('Skills', { '.proyecto.json': ficha(), 'CLAUDE.md': '# Skills\n' }, iridium)
  await proyecto('Ideas', { '.proyecto.json': ficha('idea'), 'CLAUDE.md': '# Ideas\n' }, iridium)
  await copyFile(join('tests', 'muestras', 'ideas.md'), join(iridium, 'Ideas', 'ideas.md'))
  await proyecto('Alfa', {
    '.proyecto.json': ficha(),
    'docs/estado.md': estado,
    'docs/README.md': FRAMEWORK,
    'docs/trabajo.md': TRABAJO_ALFA,
  })
  await proyecto('Delta', {
    '.proyecto.json': ficha(),
    'docs/estado.md': estado,
    'docs/README.md': FRAMEWORK,
    'docs/trabajo.md': '# Trabajo\n\n## T-1 — Modo oscuro\nEstado: nueva · Fecha: 2026-11-07\n',
  })
  await proyecto('Beta', { '.proyecto.json': ficha(), 'docs/estado.md': estado })
  await proyecto('Gamma', { '.proyecto.json': ficha(), 'docs/estado.md': estado })
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

test('la grilla solo con proyectos y el chat general al lado (IN-3)', async () => {
  const { app, win } = await abrir()
  const grilla = win.getByRole('region', { name: 'Proyectos' })
  await expect(grilla.locator('.tarjeta', { hasText: 'Gamma' })).toBeVisible()
  await expect(grilla.locator('.tarjeta', { hasText: 'Beta' })).toBeVisible()
  await expect(grilla.locator('.tarjeta', { hasText: 'Ideas' })).toHaveCount(0)
  await expect(grilla.locator('.tarjeta', { hasText: 'Skills' })).toHaveCount(0)
  await expect(grilla.locator('.cab-1 > .n')).toHaveText('4')
  await expect(win.getByRole('complementary', { name: 'Chat general' }).locator('.cab-conv')).toContainText(
    'Ideas y proyectos',
  )
  await app.close()
})

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const HOJA = `## 2026-10-29

Avisar en el celular cuando la IA termina un turno largo.

Mirar cómo arma los diagramas: [beluga](https://github.com/alfa/beluga)

![](notas/2026-10-29-1.png)
`
const dia = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const notas = async () => (await readFile(join(iridium, 'Ideas', 'notas.md'), 'utf8')).replace(/\r\n/g, '\n')

test('Ctrl+3: la hoja con sus fechas, enlaces e imágenes; escribir y pegar se guarda solo (D-112)', async () => {
  await writeFile(join(iridium, 'Ideas', 'notas.md'), HOJA)
  await mkdir(join(iridium, 'Ideas', 'notas'))
  await writeFile(join(iridium, 'Ideas', 'notas', '2026-10-29-1.png'), Buffer.from(PNG, 'base64'))
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')

  const ideas = win.getByRole('region', { name: 'Ideas' })
  await expect(ideas.getByRole('heading', { name: 'Ideas', level: 1 })).toBeVisible()
  const hoja = ideas.getByRole('textbox', { name: 'Ideas' })
  // Arriba, Hoy para escribir; lo de antes debajo de su fecha, con el enlace como etiqueta y la imagen.
  await expect(hoja.locator('.fecha')).toHaveText(['Hoy', '2026-10-29'])
  await expect(hoja.locator('.nota-enlace')).toHaveText('belugagithub.com')
  await expect(hoja.locator('.nota-imagen img')).toBeVisible()
  // Lo de antes ya no está: ni anotar con destino ni Hablar de esta idea.
  await expect(ideas.getByText('Anotar una idea')).toHaveCount(0)
  await expect(ideas.getByRole('button', { name: 'Hablar de esta idea' })).toHaveCount(0)

  // Escribir debajo de Hoy: se guarda solo, con la fecha de hoy arriba de lo anterior.
  await hoja.locator('p').nth(1).click()
  await win.keyboard.type('Un modo foco que esconda todo menos la conversación.')
  await expect
    .poll(notas)
    .toBe(`## ${dia()}\n\nUn modo foco que esconda todo menos la conversación.\n\n${HOJA}`)

  // Pegar una dirección la vuelve un enlace; algo con formato se pega como texto.
  await win.keyboard.press('Enter')
  await app.evaluate(({ clipboard }) => clipboard.writeText('https://ejemplo.com/recetas'))
  await win.keyboard.press('Control+V')
  await expect(hoja.locator('.nota-enlace').first()).toHaveText('recetasejemplo.com')
  await expect.poll(notas).toContain('conversación.\n\nhttps://ejemplo.com/recetas\n\n## 2026-10-29')
  await win.keyboard.press('Enter')
  await app.evaluate(({ clipboard, ClipboardItem }) =>
    clipboard.write([new ClipboardItem({ 'text/html': '<b>Negrita</b>' })]),
  )
  await win.keyboard.press('Control+V')
  await expect(hoja.locator('b')).toHaveCount(0)
  await expect.poll(notas).toContain('recetas\n\nNegrita\n\n## 2026-10-29')

  // Pegar una imagen: va a notas/ con la fecha de hoy y queda en su renglón.
  await app.evaluate(({ clipboard, ClipboardItem, nativeImage }) => {
    // Una captura gris de 320 × 180, para verla en la captura de la prueba.
    const gris = nativeImage.createFromBitmap(Buffer.alloc(320 * 180 * 4, 0x40), { width: 320, height: 180 })
    const blob = new Blob([new Uint8Array(gris.toPNG())], { type: 'image/png' })
    return clipboard.write([new ClipboardItem({ 'image/png': blob })])
  })
  await win.keyboard.press('Control+V')
  await expect(hoja.locator('.nota-imagen img')).toHaveCount(2)
  await expect.poll(notas).toContain(`Negrita\n\n![](notas/${dia()}-1.png)\n\n## 2026-10-29`)
  expect((await readFile(join(iridium, 'Ideas', 'notas', `${dia()}-1.png`))).length).toBeGreaterThan(0)
  await win.screenshot({ path: 'test-results/di3-t8-ideas.png' })

  // Un clic en un enlace no lo edita (lo abre afuera): la hoja no cambia.
  const antes = await notas()
  await hoja.locator('.nota-enlace', { hasText: 'beluga' }).click()
  await expect
    .poll(() => app.evaluate(() => (globalThis as { enlacesAfuera?: string[] }).enlacesAfuera ?? []))
    .toContain('https://github.com/alfa/beluga')
  expect(await notas()).toBe(antes)
  await app.close()
})

test('la hoja cambia afuera: se ve sin abrirla de nuevo (D-126)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  const hoja = win.getByRole('region', { name: 'Ideas' }).getByRole('textbox', { name: 'Ideas' })
  // Sin notas.md: solo Hoy, vacía; nada se escribe hasta que haya algo.
  await expect(hoja.locator('.fecha')).toHaveText(['Hoy'])
  await writeFile(join(iridium, 'Ideas', 'notas.md'), '## 2026-10-29\n\nLa anotó la IA.\n')
  await expect(hoja).toContainText('La anotó la IA.')
  await expect(hoja.locator('.fecha')).toHaveText(['Hoy', '2026-10-29'])
  await app.close()
})

test('Abrir como proyecto desde Ideas y desde Skills (IN-3)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  await win
    .getByRole('region', { name: 'Ideas' })
    .getByRole('button', { name: 'Abrir como proyecto' })
    .click()
  // La vista de proyecto de Ideas, con sus íconos (Archivos, Git…); sin framework, sin Docs (D-095).
  await expect(win.getByRole('button', { name: /^Archivos/ })).toBeVisible()
  await expect(win.locator('.barra-proyectos .proy').filter({ hasText: 'Ideas' }).first()).toBeVisible()
  await win.screenshot({ path: 'test-results/in1-abrir-ideas.png' })

  await win.keyboard.press('Control+2')
  await win
    .getByRole('navigation', { name: 'Skills' })
    .getByRole('button', { name: 'Abrir como proyecto' })
    .click()
  await expect(win.getByRole('button', { name: /^Archivos/ })).toBeVisible()
  await expect(win.locator('.barra-proyectos .proy').filter({ hasText: 'Skills' }).first()).toBeVisible()

  // De vuelta en Ideas.
  await win.keyboard.press('Control+3')
  await expect(win.getByRole('region', { name: 'Ideas' })).toBeVisible()
  await win.screenshot({ path: 'test-results/in1-ideas-abrir.png' })
  await app.close()
})

test('sin la carpeta Ideas se crea; si no se puede, lo dice', async () => {
  // Sin la carpeta, Iridium la crea con su CLAUDE.md y un ideas.md vacío (D-083); la hoja está para escribir.
  await rm(join(iridium, 'Ideas'), { recursive: true })
  const nueva = await abrir()
  await expect(nueva.win.getByText('Gamma').first()).toBeVisible()
  await nueva.win.keyboard.press('Control+3')
  const hoja = nueva.win.getByRole('region', { name: 'Ideas' }).getByRole('textbox', { name: 'Ideas' })
  await expect(hoja.locator('.fecha')).toHaveText(['Hoy'])
  await expect(nueva.win.locator('.cab-conv').first()).toContainText('Ideas y proyectos')
  expect(await readFile(join(iridium, 'Ideas', 'CLAUDE.md'), 'utf8')).toContain('notas.md')
  await nueva.app.close()

  // Un archivo con su nombre: no la puede crear.
  await rm(join(iridium, 'Ideas'), { recursive: true })
  await writeFile(join(iridium, 'Ideas'), '')
  const otra = await abrir()
  await expect(otra.win.getByText('Gamma').first()).toBeVisible()
  await otra.win.keyboard.press('Control+3')
  await expect(otra.win.getByText(/no pudo crearla/).first()).toBeVisible()
  await expect(otra.win.locator('.chat-falta')).toContainText('Chat general')
  await expect(otra.win.getByRole('button', { name: 'Abrir como proyecto' })).toHaveCount(0)
  await otra.app.close()
})
