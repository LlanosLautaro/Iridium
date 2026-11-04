// SK-I1 con la app abierta y el motor falso (modulos/skills/diseno-tecnico.md › Pruebas): Ctrl+3, los grupos y la
// doble, el chat de Skills con «Sobre la skill …», Poner al día y la falta de la carpeta Skills (D-083).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import type { ApiIridium } from '../../src/compartido/puente'
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
const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
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
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-skills-'))
  raiz = join(base, 'PROYECTOS')
  claude = join(base, '.claude')
  datos = join(base, 'datos')
  iridium = join(datos, 'Iridium')
  await armarCarpetaClaude(claude, join(iridium, 'Skills'), join(base, 'afuera'))
  await proyecto('Skills', { '.proyecto.json': ficha, 'CLAUDE.md': '# Skills\n' }, iridium)
  await proyecto('Gamma', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado,
    'docs/README.md': '# Docs\n\n**Formato de la guía:** 2026-10-16\n',
  })
  await proyecto('Alfa', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado,
    'docs/README.md': '# Docs\n\n**Formato de la guía:** 2026-10-29\n',
  })
  await mkdir(datos, { recursive: true })
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
})

test.afterEach(async () => {
  // Si la prueba falló a mitad, la app sigue abierta y no deja borrar la carpeta.
  try {
    abierta?.process().kill()
  } catch {
    // Ya estaba cerrada.
  }
  abierta = null
  await rm(base, { recursive: true, force: true, maxRetries: 5 })
})

test('Ctrl+3: la lista por origen, la doble, los atrasados y Poner al día (SK-1, SK-2, SK-4)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')

  const lista = win.getByRole('navigation', { name: 'Skills' })
  await expect(lista.getByRole('heading', { name: 'Skills' })).toBeVisible()
  await expect(lista.getByText('1 doble')).toBeVisible()
  await expect(lista.getByRole('button', { name: /Propias\s*3/ })).toBeVisible()
  await expect(lista.getByRole('button', { name: /Copias de terceros\s*3/ })).toBeVisible()
  await expect(lista.getByRole('button', { name: /De complementos\s*3/ })).toBeVisible()
  await expect(lista.getByRole('button', { name: /Desde la cuenta\s*2/ })).toBeVisible()
  await expect(lista.getByText('borrada')).toHaveCount(0)

  // La primera vez: Proyectos atrasados, con el vigente y Gamma (Alfa está al día).
  const detalle = win.getByRole('region', { name: 'Proyectos atrasados' })
  await expect(detalle.getByText('La guía va por el formato del 29 de octubre')).toBeVisible()
  await expect(detalle.getByText('formato del 16 de octubre')).toBeVisible()
  await expect(detalle.getByText('Alfa')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/sk1-atrasados.png' })

  // Una ruta que no salió de la lista se rechaza.
  const rechazo = await win.evaluate(() =>
    (window as unknown as { iridium: ApiIridium }).iridium.ponerAlDia('C:\\Windows').then(
      () => 'aceptó',
      () => 'rechazó',
    ),
  )
  expect(rechazo).toBe('rechazó')

  await detalle.getByRole('button', { name: 'Poner al día' }).click()
  await expect(detalle.getByText('trabajando')).toBeVisible()
  await expect(detalle.getByRole('button', { name: 'Ver la conversación' })).toBeVisible()
  await win.screenshot({ path: 'test-results/sk1-trabajando.png' })
  // La IA falsa escribe la fecha nueva: Gamma sale de la lista.
  await expect(detalle.getByText('Ningún proyecto tiene un formato viejo de la guía.')).toBeVisible()
  await expect(lista.getByText('Todos al día')).toBeVisible()

  // La doble: el aviso y Pedir que la saquen, que deja el pedido escrito en el chat.
  await lista.getByTitle('impeccable', { exact: true }).click()
  const impeccable = win.getByRole('region', { name: 'La skill impeccable' })
  await expect(impeccable.getByText('Está dos veces')).toBeVisible()
  await expect(impeccable.getByText(/Sobra esta carpeta: la del complemento se actualiza sola/)).toBeVisible()
  await expect(
    impeccable.getByText('No se edita desde Iridium: es de un tercero.', { exact: false }),
  ).toBeVisible()
  await impeccable.getByRole('button', { name: 'Pedir que la saquen' }).click()
  await expect(win.getByLabel('Mensaje para la IA')).toHaveValue(
    /^Está dos veces: también llega del complemento impeccable/,
  )
  await win.screenshot({ path: 'test-results/sk1-doble.png' })

  // El enlace roto y el SKILL.md sin descripción.
  await lista.getByTitle('vieja', { exact: true }).click()
  await expect(win.getByText('El enlace no lleva a ningún lado')).toBeVisible()
  await lista.getByTitle('sin-descripcion', { exact: true }).click()
  await expect(win.getByText('El archivo SKILL.md no tiene descripción.')).toBeVisible()

  // Los grupos se pliegan.
  await lista.getByRole('button', { name: /Desde la cuenta/ }).click()
  await expect(lista.getByTitle('pdf', { exact: true })).toHaveCount(0)
  await app.close()
})

test('el chat de Skills con «Sobre la skill …» (SK-3)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  const lista = win.getByRole('navigation', { name: 'Skills' })
  await lista.getByTitle('gestor-proyectos', { exact: true }).click()
  const detalle = win.getByRole('region', { name: 'La skill gestor-proyectos' })
  await expect(detalle.getByText('Propia · enlace a la carpeta Skills')).toBeVisible()
  await expect(detalle.getByText('Reglas para mantener la ficha de cada proyecto.')).toBeVisible()

  const chat = win.getByRole('complementary', { name: 'Chat de Skills' })
  await expect(chat.getByText('Skills y configuración de Claude')).toBeVisible()
  await expect(chat.getByText('Sobre la skill')).toBeVisible()
  await expect(chat.getByRole('button', { name: 'Seguí' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/sk1-skill.png' })
  await win.getByLabel('Mensaje para la IA').fill('¿Qué hace?')
  await win.keyboard.press('Enter')
  await expect(
    chat.locator('.propio', { hasText: 'Sobre la skill gestor-proyectos: ¿Qué hace?' }),
  ).toBeVisible()
  await expect(chat.getByText('Listo: dejé el estado al día.')).toBeVisible()

  // Con la ✕, el mensaje sale tal cual.
  await chat.getByRole('button', { name: 'Que el mensaje no sea sobre esa skill' }).click()
  await expect(chat.getByText('Sobre la skill', { exact: true })).toHaveCount(0)
  await win.getByLabel('Mensaje para la IA').fill('Y en general?')
  await win.keyboard.press('Enter')
  await expect(chat.locator('.propio', { hasText: /^Y en general\?$/ })).toBeVisible()
  // Con la IA trabajando, cerrar Iridium pregunta (F-6): se espera a que termine.
  await expect(chat.getByText('Listo: dejé el estado al día.')).toHaveCount(2)

  // La guía dice cuántos proyectos están atrasados y lleva a la lista.
  await lista.getByTitle('hitos-desarrollo-app', { exact: true }).click()
  await win.getByRole('button', { name: /1 proyecto atrasado/ }).click()
  await expect(win.getByRole('region', { name: 'Proyectos atrasados' })).toBeVisible()
  await app.close()
})

test('los archivos de una skill con el árbol y el visor de Archivos (Q-95)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  const lista = win.getByRole('navigation', { name: 'Skills' })
  await lista.getByTitle('hitos-desarrollo-app', { exact: true }).click()
  const detalle = win.getByRole('region', { name: 'La skill hitos-desarrollo-app' })
  const arbol = detalle.getByRole('navigation', { name: 'Archivos de hitos-desarrollo-app' })
  // Empieza en el Resumen: la descripción y los atrasados.
  await expect(arbol.getByRole('button', { name: 'Resumen' })).toHaveAttribute('aria-current', 'true')
  await expect(detalle.getByRole('button', { name: /1 proyecto atrasado/ })).toBeVisible()

  await arbol.getByRole('button', { name: 'SKILL.md' }).click()
  await expect(detalle.locator('.visor-cab')).toContainText('SKILL.md')
  await expect(detalle.locator('.visor-cab')).toContainText('solo lectura')
  await expect(detalle.locator('.codigo')).toContainText('Formato vigente')
  await expect(detalle.getByRole('button', { name: 'Ver en Docs' })).toHaveCount(0)

  await arbol.getByRole('button', { name: 'references' }).click()
  await arbol.getByRole('button', { name: 'actualizar-formato.md' }).click()
  await expect(detalle.locator('.codigo')).toContainText('Pasos para poner al día un proyecto.')
  await win.screenshot({ path: 'test-results/sk1-archivos.png' })

  // Otra skill tiene su propio lugar; al volver, sigue en el archivo que se miraba.
  await lista.getByTitle('gestor-proyectos', { exact: true }).click()
  await expect(
    win
      .getByRole('navigation', { name: 'Archivos de gestor-proyectos' })
      .getByRole('button', { name: 'Resumen' }),
  ).toHaveAttribute('aria-current', 'true')
  await lista.getByTitle('hitos-desarrollo-app', { exact: true }).click()
  await expect(detalle.locator('.codigo')).toContainText('Pasos para poner al día un proyecto.')

  // Solo carpetas de la lista, y sin salir de la de la skill.
  const intentos = await win.evaluate(async () => {
    const api = (window as unknown as { iridium: ApiIridium }).iridium
    const ajena = await api.carpetaSkill('C:\\Windows', '').then(
      () => 'aceptó',
      () => 'rechazó',
    )
    const { skills } = await api.skills()
    const guia = skills.find((x) => x.nombre === 'hitos-desarrollo-app')?.id ?? ''
    const afuera = await api.archivoSkill(guia, '../gestor-proyectos/SKILL.md')
    return { ajena, afuera: afuera.tipo }
  })
  expect(intentos).toEqual({ ajena: 'rechazó', afuera: 'error' })
  await app.close()
})

test('en Carbón y sin la carpeta Skills (no se pudo crear), el aviso en lugar del chat', async () => {
  // Un archivo con su nombre: Iridium no puede crear la carpeta.
  await rm(join(iridium, 'Skills'), { recursive: true })
  await writeFile(join(iridium, 'Skills'), '')
  const { app, win } = await abrir({ IRIDIUM_TEMA: 'carbon' })
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  await expect(win.getByText('no pudo crearla')).toBeVisible()
  // Sin la carpeta, las propias quedan con el enlace roto y no se sabe el formato vigente.
  await expect(win.getByText('No sé qué formato pide la guía', { exact: false })).toBeVisible()
  await win.screenshot({ path: 'test-results/sk1-carbon-sin-chat.png' })
  await app.close()
})

test('la lista de skills cambia de ancho arrastrando su borde y lo recuerda (R-6)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+3')
  const lista = win.locator('nav.sk-columna')
  await expect(lista.getByTitle('hitos-desarrollo-app', { exact: true })).toBeVisible()
  expect(Math.round((await lista.boundingBox())?.width ?? 0)).toBe(264)

  const borde = win.getByRole('separator', { name: /lista de skills/ })
  const b = await borde.boundingBox()
  if (!b) throw new Error('sin borde')
  await win.mouse.move(b.x + b.width / 2, b.y + 200)
  await win.mouse.down()
  await win.mouse.move(b.x + 160, b.y + 220, { steps: 6 })
  await win.mouse.up()
  const ancho = Math.round((await lista.boundingBox())?.width ?? 0)
  expect(ancho).toBeGreaterThan(380)
  await win.screenshot({ path: 'test-results/sk1-lista-ancha.png' })

  // Con las flechas también; y no se achica de más.
  await borde.focus()
  for (let i = 0; i < 30; i++) await win.keyboard.press('Shift+ArrowLeft')
  await expect(borde).toHaveAttribute('aria-valuenow', '200')

  // Se guarda: al volver a abrir, la lista sale con el último ancho.
  await borde.press('Shift+ArrowRight')
  await app.close()
  const otra = await abrir()
  await expect(otra.win.getByText('Gamma').first()).toBeVisible()
  await otra.win.keyboard.press('Control+3')
  await expect(otra.win.getByRole('separator', { name: /lista de skills/ })).toHaveAttribute(
    'aria-valuenow',
    '260',
  )
  await otra.app.close()
})
