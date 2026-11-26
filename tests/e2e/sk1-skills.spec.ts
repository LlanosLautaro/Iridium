// SK-I1 con la app abierta y el motor falso (modulos/skills/diseno-tecnico.md › Pruebas): Ctrl+2, los grupos y la
// doble, el chat de Skills con «Sobre la skill …», Skills › Framework con Actualizar (W-13) y la falta de la
// carpeta Skills (D-083).
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
const estado =
  '# Estado\n\n**Última actualización:** 2026-11-06\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'

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
  iridium = join(raiz, '.iridium')
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
    'docs/README.md': '# Docs\n\n**Framework:** 2026-11-06\n',
    'docs/trabajo.md': '# Trabajo\n',
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

test('Ctrl+2: la lista por origen, la doble y Framework con Actualizar (SK-1, SK-2, W-13)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+2')

  const lista = win.getByRole('navigation', { name: 'Skills' })
  await expect(lista.getByRole('heading', { name: 'Skills' })).toBeVisible()
  // Sin la cuenta total ni «1 doble» (D-108): la que está dos veces lleva su señal en la fila.
  await expect(lista.getByTitle('Está dos veces').first()).toHaveText('doble')
  await expect(lista.getByRole('button', { name: /Propias\s*3/ })).toBeVisible()
  await expect(lista.getByRole('button', { name: /Copias de terceros\s*3/ })).toBeVisible()
  await expect(lista.getByRole('button', { name: /De complementos\s*3/ })).toBeVisible()
  await expect(lista.getByRole('button', { name: /Desde la cuenta\s*2/ })).toBeVisible()
  await expect(lista.getByText('borrada')).toHaveCount(0)

  // La primera vez: Framework, con Gamma fuera (framework viejo) y Alfa al día, sin botón. La cuenta, en gris.
  await expect(lista.locator('.sk-framework .cuenta')).toHaveText('1 fuera')
  const detalle = win.getByRole('region', { name: 'Framework' })
  await expect(detalle.locator('.cabecera .ruta')).toHaveText('1 fuera')
  const gamma = detalle.locator('li.fila[data-proyecto="Gamma"]')
  const alfa = detalle.locator('li.fila[data-proyecto="Alfa"]')
  await expect(gamma).toContainText('framework viejo · 2026-10-16')
  await expect(alfa).toContainText('al día · 2026-11-06')
  await expect(alfa.getByRole('button', { name: 'Actualizar' })).toHaveCount(0)
  await expect(detalle.locator('li.fila')).toHaveText([/Gamma/, /Alfa/])
  await detalle.getByRole('button', { name: /Fuera del framework/ }).click()
  await expect(detalle.locator('li.fila')).toHaveText([/Gamma/])
  await win.screenshot({ path: 'test-results/sk1-framework.png' })

  // Una ruta que no salió de la lista se rechaza, y una que ya sigue el framework también.
  const rechazos = await win.evaluate(async () => {
    const api = (window as unknown as { iridium: ApiIridium }).iridium
    const ajena = await api.pasarAlFramework('C:\\Windows').then(
      () => 'aceptó',
      () => 'rechazó',
    )
    const alDia = (await api.framework()).find((p) => p.nombre === 'Alfa')?.ruta ?? ''
    const yaSigue = await api.pasarAlFramework(alDia).then(
      () => 'aceptó',
      () => 'rechazó',
    )
    return { ajena, yaSigue }
  })
  expect(rechazos).toEqual({ ajena: 'rechazó', yaSigue: 'rechazó' })

  await gamma.getByRole('button', { name: 'Actualizar' }).click()
  await expect(gamma.getByText('Actualizando…')).toBeVisible()
  await expect(gamma.getByRole('button', { name: 'Ver la conversación' })).toBeVisible()
  await win.screenshot({ path: 'test-results/sk1-pasando.png' })
  // La IA falsa le pone la línea del framework: Gamma queda al día y no hay ninguno fuera.
  await detalle.getByRole('button', { name: /^Todos/ }).click()
  await expect(gamma).toContainText('al día')
  await expect(detalle.getByText('Todos los proyectos siguen el framework.')).toBeVisible()
  await expect(lista.locator('.sk-framework .cuenta')).toHaveCount(0)

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
  await expect(lista.locator('.sk-plegado', { hasText: 'Desde la cuenta' }).locator('.senal')).toHaveCount(0)
  // Plegado, el grupo con una doble lleva su señal (T-18).
  await lista.getByRole('button', { name: /De complementos/ }).click()
  await expect(lista.getByTitle('impeccable:impeccable', { exact: true })).toHaveCount(0)
  await expect(
    lista.locator('.sk-plegado', { hasText: 'De complementos' }).getByTitle('Una está dos veces'),
  ).toHaveText('doble')
  await win.screenshot({ path: 'test-results/sk1-plegado-doble.png' })
  await app.close()
})

test('el chat de Skills con «Sobre la skill …» (SK-3)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+2')
  const lista = win.getByRole('navigation', { name: 'Skills' })
  await lista.getByTitle('gestor-proyectos', { exact: true }).click()
  const detalle = win.getByRole('region', { name: 'La skill gestor-proyectos' })
  await expect(detalle.getByText('Propia · enlace a la carpeta Skills')).toBeVisible()
  await expect(detalle.getByText('Reglas para mantener la ficha de cada proyecto.')).toBeVisible()

  const chat = win.getByRole('complementary', { name: 'Chat de Skills' })
  await expect(chat.getByText('Skills y configuración de Claude')).toBeVisible()
  await expect(chat.getByText('Sobre la skill')).toBeVisible()
  await expect(chat.getByRole('button', { name: 'Continuar' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/sk1-skill.png' })
  await win.getByLabel('Mensaje para la IA').fill('¿Qué hace?')
  await win.keyboard.press('Enter')
  await expect(
    chat.locator('.mensaje-yo', { hasText: 'Sobre la skill gestor-proyectos: ¿Qué hace?' }),
  ).toBeVisible()
  await expect(chat.getByText('Listo: dejé el estado al día.')).toBeVisible()

  // Con la ✕, el mensaje sale tal cual.
  await chat.getByRole('button', { name: 'Que el mensaje no sea sobre esa skill' }).click()
  await expect(chat.getByText('Sobre la skill', { exact: true })).toHaveCount(0)
  await win.getByLabel('Mensaje para la IA').fill('Y en general?')
  await win.keyboard.press('Enter')
  await expect(chat.locator('.mensaje-yo', { hasText: /^Y en general\?$/ })).toBeVisible()
  // Con la IA trabajando, cerrar Iridium pregunta (F-6): se espera a que termine.
  await expect(chat.getByText('Listo: dejé el estado al día.')).toHaveCount(2)

  // Framework vuelve a estar a un clic.
  await lista.getByRole('button', { name: /^Framework/ }).click()
  await expect(win.getByRole('region', { name: 'Framework' })).toBeVisible()
  await app.close()
})

test('los archivos de una skill con el árbol y el visor de Archivos (Q-95)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+2')
  const lista = win.getByRole('navigation', { name: 'Skills' })
  await lista.getByTitle('hitos-desarrollo-app', { exact: true }).click()
  const detalle = win.getByRole('region', { name: 'La skill hitos-desarrollo-app' })
  const arbol = detalle.getByRole('navigation', { name: 'Archivos de hitos-desarrollo-app' })
  // Empieza en el Resumen; Archivos abre el SKILL.md.
  await expect(detalle.getByRole('tab', { name: 'Resumen' })).toHaveAttribute('aria-selected', 'true')
  await win.screenshot({ path: 'test-results/sk1-resumen.png' })
  await detalle.getByRole('tab', { name: 'Archivos' }).click()
  await expect(arbol.getByRole('button', { name: 'SKILL.md' })).toHaveAttribute('aria-current', 'true')
  // Con las flechas se vuelve al Resumen y otra vez a Archivos, al mismo archivo.
  await detalle.getByRole('tab', { name: 'Archivos' }).press('ArrowLeft')
  await expect(detalle.getByRole('tab', { name: 'Resumen' })).toBeFocused()
  await detalle.getByRole('tab', { name: 'Resumen' }).press('ArrowRight')

  await arbol.getByRole('button', { name: 'SKILL.md' }).click()
  await expect(arbol.getByRole('button', { name: 'SKILL.md' })).toHaveAttribute('aria-current', 'true')
  await expect(detalle.locator('.visor-codigo')).toContainText('Formato vigente')
  await expect(detalle.getByRole('button', { name: 'Ver en Docs' })).toHaveCount(0)

  await arbol.getByRole('button', { name: 'references' }).click()
  await arbol.getByRole('button', { name: 'actualizar-formato.md' }).click()
  await expect(detalle.locator('.visor-codigo')).toContainText('Pasos para poner al día un proyecto.')
  await win.screenshot({ path: 'test-results/sk1-archivos.png' })

  // Otra skill tiene su propio lugar; al volver, sigue en el archivo que se miraba.
  await lista.getByTitle('gestor-proyectos', { exact: true }).click()
  await expect(
    win.getByRole('region', { name: 'La skill gestor-proyectos' }).getByRole('tab', { name: 'Resumen' }),
  ).toHaveAttribute('aria-selected', 'true')
  await lista.getByTitle('hitos-desarrollo-app', { exact: true }).click()
  await expect(detalle.locator('.visor-codigo')).toContainText('Pasos para poner al día un proyecto.')

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

test('sin la carpeta Skills (no se pudo crear), el aviso en lugar del chat', async () => {
  // Un archivo con su nombre: Iridium no puede crear la carpeta.
  await rm(join(iridium, 'Skills'), { recursive: true })
  await writeFile(join(iridium, 'Skills'), '')
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+2')
  await expect(win.getByText('no pudo crearla')).toBeVisible()
  // Sin la carpeta, Framework se ve igual: no depende de las skills.
  await expect(win.getByRole('region', { name: 'Framework' })).toContainText('framework viejo')
  await win.screenshot({ path: 'test-results/sk1-sin-chat.png' })
  await app.close()
})

test('la lista de skills cambia de ancho arrastrando su borde y lo recuerda (R-6)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByText('Gamma').first()).toBeVisible()
  await win.keyboard.press('Control+2')
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
  await otra.win.keyboard.press('Control+2')
  await expect(otra.win.getByRole('separator', { name: /lista de skills/ })).toHaveAttribute(
    'aria-valuenow',
    '260',
  )
  await otra.app.close()
})
