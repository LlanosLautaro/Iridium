// IN-I1 con la app abierta y el motor falso (modulos/inicio/diseno-tecnico.md › Pruebas): Ctrl+4, los grupos con
// Integradas plegada, el chat general con «Sobre la idea …» (sin Pedir que la integren, Q-115), los enlaces a proyectos, la lista
// que se actualiza sola, la grilla solo con proyectos (Ideas y Skills están en la carpeta Iridium, D-083) y Abrir como
// proyecto desde Ideas y Skills.
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
  iridium = join(datos, 'Iridium')
  await armarCarpetaClaude(claude, join(iridium, 'Skills'), join(base, 'afuera'))
  await proyecto('Skills', { '.proyecto.json': ficha(), 'CLAUDE.md': '# Skills\n' }, iridium)
  await proyecto('Ideas', { '.proyecto.json': ficha('idea'), 'CLAUDE.md': '# Ideas\n' }, iridium)
  await copyFile(join('tests', 'muestras', 'ideas.md'), join(iridium, 'Ideas', 'ideas.md'))
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
  await expect(grilla.locator('.cabecera .total')).toHaveText('2')
  await expect(win.getByRole('complementary', { name: 'Chat general' }).locator('.chat-cab')).toContainText(
    'Ideas y proyectos',
  )
  await app.close()
})

test('Ctrl+4: las ideas por sección, el detalle y el chat con «Sobre la idea …» (IN-1, IN-2)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+4')

  const lista = win.getByRole('navigation', { name: 'Ideas' })
  await expect(lista.getByRole('heading', { name: 'Ideas' })).toBeVisible()
  await expect(lista.getByText('7 sin integrar')).toBeVisible()
  await expect(lista.getByRole('button', { name: /Sueltas\s*3/ })).toHaveAttribute('aria-expanded', 'true')
  await expect(lista.getByRole('button', { name: /Para proyectos existentes\s*4/ })).toBeVisible()
  await expect(lista.getByRole('button', { name: /Integradas\s*5/ })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await expect(lista.getByText('Puente entre el celular y la PC')).toHaveCount(0)

  // La primera vez: la primera suelta.
  const detalle = win.getByRole('region', { name: /^La idea Planificador de comidas/ })
  await expect(detalle.getByText('Suelta · 30 de octubre de 2026')).toBeVisible()
  await expect(detalle.getByText(/^Para más adelante\./)).toBeVisible()
  const chat = win.getByRole('complementary', { name: 'Chat general' })
  await expect(chat.locator('.sobre-skill')).toBeVisible()
  await win.screenshot({ path: 'test-results/in1-ideas.png' })

  // El mensaje sale con el título de la idea.
  await win.getByLabel('Mensaje para la IA').fill('¿Esto podría ser un módulo de Iridium?')
  await win.keyboard.press('Enter')
  await expect(
    chat.locator('.propio', {
      hasText: 'Sobre la idea «Planificador de comidas de la semana»: ¿Esto',
    }),
  ).toBeVisible()
  await expect(chat.getByText('Listo: dejé el estado al día.')).toBeVisible()

  // Una para un proyecto existente: los proyectos que toca; el que no existe, sin enlace.
  await lista.getByTitle(/^Alfa y Beta como servidores/).click()
  const alfa = win.getByRole('region', { name: /^La idea Alfa y Beta/ })
  await expect(alfa.getByText('Para un proyecto existente · 16 de octubre de 2026')).toBeVisible()
  await expect(alfa.locator('span.id-proyecto', { hasText: 'Delta' })).toBeVisible()
  // Sin Pedir que la integren (Q-115): eso se le pide al chat.
  await expect(win.getByRole('button', { name: 'Pedir que la integren' })).toHaveCount(0)
  // Con la ✕, el mensaje sale tal cual.
  await lista.getByTitle(/^Control de volumen por app/).click()
  await expect(chat.locator('.sobre-skill')).toBeVisible()
  await chat.getByRole('button', { name: 'Que el mensaje no sea sobre esa idea' }).click()
  await expect(chat.locator('.sobre-skill')).toHaveCount(0)

  // Una integrada: a dónde fue.
  await lista.getByRole('button', { name: /Integradas/ }).click()
  await lista.getByTitle('Puente entre el celular y la PC').click()
  const puente = win.getByRole('region', { name: 'La idea Puente entre el celular y la PC' })
  await expect(puente.getByText('Fue a')).toBeVisible()
  await expect(puente.getByText(/pasó al proyecto nuevo/)).toBeVisible()

  // El enlace a un proyecto lo abre.
  await puente.getByRole('button', { name: 'Beta' }).click()
  await expect(win.locator('.ses.activa, .pestana.activa, [aria-current="page"]').first()).toBeVisible()
  await expect(win.getByRole('navigation', { name: 'Ideas' })).toHaveCount(0)
  await app.close()
})

test('la lista se actualiza sola y la idea elegida sigue elegida (IN-1)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+4')
  const lista = win.getByRole('navigation', { name: 'Ideas' })
  await lista.getByTitle('Lanzador de juegos propio').click()
  await expect(win.getByRole('region', { name: 'La idea Lanzador de juegos propio' })).toBeVisible()

  // La IA suma una idea arriba y pasa la elegida a otra sección.
  const archivo = join(iridium, 'Ideas', 'ideas.md')
  const texto = (await readFile(archivo, 'utf8'))
    .replace(
      '## Sueltas\nIdeas que todavía no tienen proyecto.\n',
      '## Sueltas\nIdeas que todavía no tienen proyecto.\n\n### Una idea nueva — 2026-11-02\nRecién anotada.\n',
    )
    .replace(/### Lanzador de juegos propio — 2026-10-16\n[^\n]*\n/, '')
    .replace(
      '## Integradas\n',
      '## Integradas\n\n### Lanzador de juegos propio — 2026-10-16\nUn launcher.\n→ 2026-11-02: pasó a `Beta`.\n',
    )
  await writeFile(archivo, texto)

  await expect(lista.getByTitle('Una idea nueva')).toBeVisible()
  await expect(lista.getByText('7 sin integrar')).toBeVisible()
  const detalle = win.getByRole('region', { name: 'La idea Lanzador de juegos propio' })
  await expect(detalle.getByText(/^Integrada/)).toBeVisible()
  await expect(detalle.getByText('Un launcher.')).toBeVisible()
  await app.close()
})

test('Abrir como proyecto desde Ideas y desde Skills (IN-3), en Carbón', async () => {
  const { app, win } = await abrir({ IRIDIUM_TEMA: 'carbon' })
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+4')
  await win
    .getByRole('navigation', { name: 'Ideas' })
    .getByRole('button', { name: 'Abrir como proyecto' })
    .click()
  // La vista de proyecto de Ideas, con sus íconos (Docs, Git…).
  await expect(win.getByRole('button', { name: /^Docs/ })).toBeVisible()
  await expect(win.locator('.ses, .pestana').filter({ hasText: 'Ideas' }).first()).toBeVisible()
  await win.screenshot({ path: 'test-results/in1-abrir-ideas.png' })

  await win.keyboard.press('Control+3')
  await win
    .getByRole('navigation', { name: 'Skills' })
    .getByRole('button', { name: 'Abrir como proyecto' })
    .click()
  await expect(win.getByRole('button', { name: /^Docs/ })).toBeVisible()
  await expect(win.locator('.ses, .pestana').filter({ hasText: 'Skills' }).first()).toBeVisible()

  // De vuelta en Ideas, en Carbón.
  await win.keyboard.press('Control+4')
  await expect(win.getByRole('navigation', { name: 'Ideas' })).toBeVisible()
  await win.screenshot({ path: 'test-results/in1-ideas-carbon.png' })
  await app.close()
})

test('sin ideas.md; sin la carpeta Ideas se crea; si no se puede, lo dice', async () => {
  await rm(join(iridium, 'Ideas', 'ideas.md'))
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+4')
  await expect(win.getByText('Todavía no hay ideas anotadas').first()).toBeVisible()
  await app.close()

  // Sin la carpeta, Iridium la crea con su CLAUDE.md y un ideas.md vacío (D-083).
  await rm(join(iridium, 'Ideas'), { recursive: true })
  const nueva = await abrir()
  await expect(nueva.win.getByText('Gamma').first()).toBeVisible()
  await nueva.win.keyboard.press('Control+4')
  await expect(nueva.win.getByText('Todavía no hay ideas anotadas').first()).toBeVisible()
  await expect(nueva.win.locator('.chat-cab').first()).toContainText('Ideas y proyectos')
  expect(await readFile(join(iridium, 'Ideas', 'CLAUDE.md'), 'utf8')).toContain('## Cuando una idea madura')
  await nueva.app.close()

  // Un archivo con su nombre: no la puede crear.
  await rm(join(iridium, 'Ideas'), { recursive: true })
  await writeFile(join(iridium, 'Ideas'), '')
  const otra = await abrir()
  await expect(otra.win.getByText('Gamma').first()).toBeVisible()
  await otra.win.keyboard.press('Control+4')
  await expect(otra.win.getByText('No está la carpeta Ideas')).toBeVisible()
  await expect(otra.win.locator('.chat-falta')).toContainText('Chat general')
  await expect(otra.win.getByRole('button', { name: 'Abrir como proyecto' })).toHaveCount(0)
  await otra.app.close()
})
