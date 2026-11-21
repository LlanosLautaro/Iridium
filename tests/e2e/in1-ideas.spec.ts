// Ideas del inicio con la app abierta y el motor falso: las ideas sueltas (ID-I4, que reemplazó al bloc de notas):
// Ctrl+3, anotar sin proyecto y en uno elegido, Mover a un proyecto con la nota y la imagen, la lista que cambia afuera,
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
  await expect(grilla.locator('.fila-cab h1 > .cuenta')).toHaveText('4')
  await expect(win.getByRole('complementary', { name: 'Chat general' }).locator('.cab-conv')).toContainText(
    'Ideas y proyectos',
  )
  await app.close()
})

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const SUELTAS = `# Ideas sueltas

## T-1 — Avisar en el celular cuando la IA termina
Estado: nueva · Idea: usuario · Fecha: 2026-10-29
`
const texto = async (...r: string[]) => (await readFile(join(...r), 'utf8')).replace(/\r\n/g, '\n')
const sueltas = () => texto(iridium, 'Ideas', 'sueltas.md')

/** Las ideas sueltas con T-1, su nota y su imagen. */
async function conSueltas() {
  await writeFile(join(iridium, 'Ideas', 'sueltas.md'), SUELTAS)
  await mkdir(join(iridium, 'Ideas', 'sueltas', 'T-1'), { recursive: true })
  await writeFile(
    join(iridium, 'Ideas', 'sueltas', 'T-1.md'),
    'Un aviso corto.\n\n![](T-1/2026-10-29-1.png)\n',
  )
  await writeFile(join(iridium, 'Ideas', 'sueltas', 'T-1', '2026-10-29-1.png'), Buffer.from(PNG, 'base64'))
}

test('Ctrl+3: las ideas sueltas, anotar sin proyecto y en un proyecto elegido (ID-I4, ID-7)', async () => {
  await conSueltas()
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')

  const ideas = win.getByRole('region', { name: 'Ideas' })
  await expect(ideas.getByRole('heading', { name: 'Ideas', level: 1 })).toBeVisible()
  // La misma lista que en un proyecto; el bloc ya no está.
  await expect(ideas.locator('.idp-item', { hasText: 'Avisar en el celular' })).toBeVisible()
  await expect(ideas.locator('.hoja-notas')).toHaveCount(0)
  // El selector: «Sin proyecto» y los proyectos con framework (Beta y Gamma no lo siguen).
  const selector = ideas.getByRole('combobox', { name: 'En qué proyecto' })
  await expect(selector.locator('option')).toHaveText(['Sin proyecto', 'Alfa', 'Delta'])

  // Sin proyecto: va a sueltas.md, primera en la lista.
  const campo = ideas.getByRole('textbox', { name: 'Anotar una idea o un enlace' })
  await campo.fill('Un modo foco')
  await campo.press('Enter')
  await expect(ideas.locator('.idp-item').first()).toContainText('Un modo foco')
  await expect.poll(sueltas).toContain('## T-2 — Un modo foco\nEstado: nueva · Idea: usuario')

  // Con Alfa elegido: va directo a su trabajo.md y se avisa con Ver.
  await selector.selectOption({ label: 'Alfa' })
  await campo.fill('Sonar al terminar')
  await campo.press('Enter')
  await expect(ideas.getByRole('status')).toContainText('Anotada en Alfa')
  await expect.poll(() => texto(raiz, 'Alfa', 'docs', 'trabajo.md')).toContain('## T-4 — Sonar al terminar')
  expect(await sueltas()).not.toContain('Sonar al terminar')
  await expect(ideas.locator('.idp-item', { hasText: 'Sonar al terminar' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/id4-inicio.png' })

  // Ver lleva a las Ideas de Alfa, con la idea ahí.
  await ideas.getByRole('status').getByRole('button', { name: 'Ver' }).click()
  await expect(win.locator('.barra-proyectos .proy.elegido')).toContainText('Alfa')
  await expect(win.locator('.idp-item', { hasText: 'Sonar al terminar' })).toBeVisible()
  await app.close()
})

test('Mover a un proyecto: la idea pasa con su nota y su imagen (ID-7)', async () => {
  await conSueltas()
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  const ideas = win.getByRole('region', { name: 'Ideas' })

  // Abierta, con su nota y su imagen; Hablar de esta idea la cita en el chat general.
  await ideas.locator('.idp-item', { hasText: 'Avisar en el celular' }).locator('.idp-abrir').click()
  await expect(ideas.locator('.cuerpo-fila .nota-imagen img')).toBeVisible()
  await ideas.locator('.cuerpo-fila').getByRole('button', { name: 'Hablar de esta idea' }).click()
  const chat = win.getByRole('complementary', { name: 'Chat general' })
  await expect(chat.locator('.compositor .citado')).toContainText('Avisar en el celular')

  await ideas.locator('.cuerpo-fila').getByRole('button', { name: 'Mover a un proyecto' }).click()
  const menu = win.getByRole('menu', { name: 'Mover a un proyecto' })
  await expect(menu.getByRole('menuitem')).toHaveText(['Alfa', 'Delta'])
  await win.screenshot({ path: 'test-results/id4-mover.png' })
  await menu.getByRole('menuitem', { name: 'Delta' }).click()

  await expect(ideas.getByRole('status')).toContainText('Movida a Delta')
  await expect(ideas.locator('.idp-item', { hasText: 'Avisar en el celular' })).toHaveCount(0)
  const delta = (...r: string[]) => texto(raiz, 'Delta', 'docs', ...r)
  await expect
    .poll(() => delta('trabajo.md'))
    .toContain(
      '## T-2 — Avisar en el celular cuando la IA termina\nEstado: nueva · Idea: usuario · Fecha: 2026-10-29',
    )
  expect(await delta('ideas', 'T-2.md')).toBe('Un aviso corto.\n\n![](T-2/2026-10-29-1.png)\n')
  expect(
    (await readFile(join(raiz, 'Delta', 'docs', 'ideas', 'T-2', '2026-10-29-1.png'))).length,
  ).toBeGreaterThan(0)
  expect(await sueltas()).not.toContain('Avisar en el celular')
  await app.close()
})

test('sueltas.md cambia afuera: la lista se pone al día sola', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  const ideas = win.getByRole('region', { name: 'Ideas' })
  await expect(ideas.locator('.idp-vacio')).toContainText('Todavía no hay ideas')
  await writeFile(
    join(iridium, 'Ideas', 'sueltas.md'),
    '# Ideas sueltas\n\n## T-1 — La anotó la IA\nEstado: nueva · Idea: IA · Fecha: 2026-10-29\n',
  )
  await expect(ideas.locator('.idp-item', { hasText: 'La anotó la IA' })).toBeVisible()
  await expect(ideas.getByRole('img', { name: 'Anotada por la IA' })).toBeVisible()
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
  // Sin la carpeta, Iridium la crea con su CLAUDE.md y un sueltas.md vacío (D-083, ID-I4); la lista está para anotar.
  await rm(join(iridium, 'Ideas'), { recursive: true })
  const nueva = await abrir()
  await expect(nueva.win.getByText('Gamma').first()).toBeVisible()
  await nueva.win.keyboard.press('Control+3')
  const ideas = nueva.win.getByRole('region', { name: 'Ideas' })
  await expect(ideas.locator('.idp-vacio')).toContainText('Todavía no hay ideas')
  await expect(nueva.win.locator('.cab-conv').first()).toContainText('Ideas y proyectos')
  expect(await readFile(join(iridium, 'Ideas', 'CLAUDE.md'), 'utf8')).toContain('sueltas.md')
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
