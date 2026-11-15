// Ideas del inicio con la app abierta y el motor falso (frente Orden, 04-ux.md › W-10; antes IN-I1): Ctrl+3, las ideas
// nuevas de cada proyecto con framework y las sueltas, anotar con el selector de proyecto, Hablar de esta idea en el
// chat general, una de un proyecto que abre su trabajo.md, la lista que se actualiza sola, la grilla solo con proyectos
// (Ideas y Skills están en la carpeta Iridium, D-083) y Abrir como proyecto desde Ideas y Skills.
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

test('Ctrl+3: las nuevas de cada proyecto y las sueltas, anotar con el selector y Hablar de esta idea (W-10)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')

  const ideas = win.getByRole('region', { name: 'Ideas' })
  await expect(ideas.getByRole('heading', { name: 'Ideas', level: 1 })).toBeVisible()
  // Delta tiene la más reciente: va primero. Las pendientes y las integradas no salen.
  await expect(ideas.locator('.tb-grupo-t')).toHaveText(['Delta 1', 'Alfa 2', 'Sueltas 7'])
  await expect(ideas.locator('.cab-1 > .n')).toHaveText('10')
  await expect(ideas.getByText('Respaldo en GitHub')).toHaveCount(0)
  await expect(ideas.getByText('Puente entre el celular y la PC')).toHaveCount(0)
  await expect(ideas.locator('.id-viejos')).toContainText(
    'Las ideas de 2 proyectos no aparecen: todavía no pasaron al framework.',
  )
  await expect(ideas.locator('.id-viejos').getByRole('button', { name: 'Ver en Framework' })).toBeVisible()

  // El selector: los proyectos con framework y, separada, Suelta. Empieza en el primero.
  const selector = ideas.locator('.destino .menu-boton')
  await expect(selector.locator('.nom')).toHaveText('Alfa')
  await selector.click()
  const menu = ideas.getByRole('menu')
  await expect(menu.locator('.op-destino .nom')).toHaveText(['Alfa', 'Delta', 'Suelta'])
  await expect(menu).toContainText('Solo los proyectos que siguen el framework')
  await win.screenshot({ path: 'test-results/w10-selector.png' })
  await menu.getByRole('menuitemradio', { name: 'Delta' }).click()

  // Anotar en Delta: un T-n nueva al final de su trabajo.md, arriba de su grupo y marcada.
  const campo = ideas.getByLabel('Anotar una idea en Delta')
  await campo.fill('Un atajo para Seguí')
  await campo.press('Enter')
  await expect(campo).toHaveValue('')
  await expect(ideas.locator('.tb-grupo-t').first()).toHaveText('Delta 2')
  await expect(ideas.locator('.tb-item.recien')).toContainText('Un atajo para Seguí')
  await expect(ideas.locator('.tb-item').first()).toContainText('T-2')
  expect(await readFile(join(raiz, 'Delta', 'docs', 'trabajo.md'), 'utf8')).toMatch(
    /## T-2 — Un atajo para Seguí\r?\nEstado: nueva · Fecha: \d{4}-\d\d-\d\d\r?\n$/,
  )
  await win.screenshot({ path: 'test-results/w10-anotada.png' })

  // Suelta: arriba de Sueltas en ideas.md.
  await selector.click()
  await ideas.getByRole('menuitemradio', { name: 'Suelta' }).click()
  await ideas.getByLabel('Anotar una idea suelta').fill('Una app de recetas con fotos')
  await ideas.getByLabel('Anotar una idea suelta').press('Enter')
  await expect(ideas.locator('.tb-grupo-t').last()).toHaveText('Sueltas 8')
  await expect(ideas.locator('.tb-item.recien')).toContainText('Una app de recetas con fotos')
  expect((await readFile(join(iridium, 'Ideas', 'ideas.md'), 'utf8')).replace(/\r\n/g, '\n')).toContain(
    'Ideas que todavía no tienen proyecto.\n\n### Una app de recetas con fotos — ',
  )

  // Una suelta se despliega con Hablar de esta idea, que la pone arriba del cuadro del chat general.
  await ideas.getByRole('button', { name: /Planificador de comidas de la semana/ }).click()
  await expect(ideas.getByText(/^Para más adelante\./)).toBeVisible()
  const chat = win.getByRole('complementary', { name: 'Chat general' })
  await expect(chat.locator('.sobre-skill')).toHaveCount(0)
  await ideas.getByRole('button', { name: 'Hablar de esta idea' }).click()
  await expect(chat.locator('.sobre-skill')).toBeVisible()
  await win.screenshot({ path: 'test-results/w10-hablar.png' })
  await win.getByLabel('Mensaje para la IA').fill('¿Esto podría ser un proyecto?')
  await win.keyboard.press('Enter')
  await expect(
    chat.locator('.mensaje-yo', { hasText: 'Sobre la idea «Planificador de comidas de la semana»: ¿Esto' }),
  ).toBeVisible()
  await expect(chat.getByText('Listo: dejé el estado al día.')).toBeVisible()

  // Una de un proyecto abre su trabajo.md en Docs, en ese ítem (sin la sección Trabajo, D-112).
  await ideas.getByRole('button', { name: /T-3\s*Exportar el plan como imagen/ }).click()
  const docs = win.locator('[data-seccion="docs"]')
  await expect(docs.locator('.barra-doc .nom')).toHaveText('trabajo.md')
  await expect(docs.locator('[id="t-3"]')).toBeInViewport()

  // De vuelta, el selector sigue en el último elegido.
  await win.keyboard.press('Control+3')
  await expect(win.getByRole('region', { name: 'Ideas' }).locator('.destino .menu-boton')).toHaveText(
    'Suelta',
  )
  await app.close()
})

test('la lista se actualiza sola: una idea que la IA pasa a pendiente sale (W-10)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  const ideas = win.getByRole('region', { name: 'Ideas' })
  await expect(ideas.locator('.tb-grupo-t')).toHaveText(['Delta 1', 'Alfa 2', 'Sueltas 7'])

  const archivo = join(raiz, 'Alfa', 'docs', 'trabajo.md')
  const texto = await readFile(archivo, 'utf8')
  await writeFile(
    archivo,
    texto.replace('Estado: nueva · Fecha: 2026-11-06', 'Estado: pendiente · Fecha: 2026-11-06'),
  )
  await expect(ideas.locator('.tb-grupo-t')).toHaveText(['Delta 1', 'Alfa 1', 'Sueltas 7'])
  await expect(ideas.getByText('Exportar el plan como imagen')).toHaveCount(0)
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

test('sin ideas.md; sin la carpeta Ideas se crea; si no se puede, lo dice', async () => {
  await rm(join(iridium, 'Ideas', 'ideas.md'))
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  await expect(win.getByRole('region', { name: 'Ideas' }).locator('.tb-grupo-t')).toHaveText([
    'Delta 1',
    'Alfa 2',
  ])
  await app.close()

  // Sin la carpeta, Iridium la crea con su CLAUDE.md y un ideas.md vacío (D-083).
  await rm(join(iridium, 'Ideas'), { recursive: true })
  const nueva = await abrir()
  await expect(nueva.win.getByText('Gamma').first()).toBeVisible()
  await nueva.win.keyboard.press('Control+3')
  await expect(nueva.win.getByRole('region', { name: 'Ideas' }).locator('.tb-grupo-t')).toHaveText([
    'Delta 1',
    'Alfa 2',
  ])
  await expect(nueva.win.locator('.cab-conv').first()).toContainText('Ideas y proyectos')
  expect(await readFile(join(iridium, 'Ideas', 'CLAUDE.md'), 'utf8')).toContain('## Cuando una idea madura')
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
