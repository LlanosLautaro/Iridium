// R-7 y R-8 (D-089): el menú del clic derecho en la tarjeta, Nuevo proyecto y las ideas y las skills del proyecto.
import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

const SALIDA = join(process.cwd(), 'tools', 'salida')
let raiz: string
let datos: string

async function escribir(relativa: string, texto: string) {
  await mkdir(join(raiz, relativa, '..'), { recursive: true })
  await writeFile(join(raiz, relativa), texto)
}
const ficha = (estado: string, descripcion: string) =>
  JSON.stringify({
    version: 1,
    descripcion,
    estado,
    etiquetas: [],
    icono: null,
    archivado: false,
    reemplazadoPor: null,
  })
const leerFicha = async (nombre: string) =>
  JSON.parse(await readFile(join(raiz, nombre, '.proyecto.json'), 'utf8')) as Record<string, unknown>

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_VSCODE: 'falso',
    IRIDIUM_PAPELERA: join(datos, 'papelera'),
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-r7-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-r7-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await escribir('Alfa/.proyecto.json', ficha('en-desarrollo', 'Una app de prueba'))
  await escribir(
    'Alfa/logo.svg',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8"/></svg>',
  )
  await escribir(
    'Alfa/docs/estado.md',
    '# Estado\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n(ninguna)\n',
  )
  await escribir(
    'Alfa/docs/00-idea.md',
    '# Idea\n\n## Ideas para después (sin compromiso)\n- Un **canvas** para pensar.\n\n## Otra\nNada.\n',
  )
  await escribir(
    'Alfa/docs/07-construccion.md',
    '# Construcción\n\n## Ideas nuevas (pendientes de evaluar)\n- Exportar a PDF.\n- Modo oscuro.\n\n## Deuda técnica\n- x\n',
  )
  await escribir(
    'Alfa/.claude/skills/publicar-alfa/SKILL.md',
    '---\nname: publicar-alfa\ndescription: Cómo publicar una versión de Alfa.\n---\n\n# Publicar\n',
  )
  await escribir('Beta/.proyecto.json', ficha('idea', 'Otra app'))
  await mkdir(join(raiz, 'Gamma'))
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true })
  await rm(datos, { recursive: true, force: true })
})

test('el clic derecho en una tarjeta cambia el estado, archiva con Deshacer, cambia el ícono y abre afuera (R-7)', async () => {
  const { app, win } = await abrir()
  const beta = win.locator('.tarjeta', { hasText: 'Beta' })
  await beta.click({ button: 'right' })
  const menu = win.getByRole('menu', { name: 'Acciones de Beta' })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitemradio', { name: 'Idea' })).toHaveAttribute('aria-checked', 'true')
  await expect(menu.getByRole('menuitemradio', { name: 'En rescate' })).toHaveCount(0)
  await win.screenshot({ path: join(SALIDA, 'r7-menu.png') })

  await menu.getByRole('menuitemradio', { name: 'Pausado' }).click()
  await expect(menu).toHaveCount(0)
  await expect(beta).toContainText('pausado')
  expect(await leerFicha('Beta')).toMatchObject({ estado: 'pausado', descripcion: 'Otra app' })

  // Archivar: sale de la grilla y el aviso deja deshacerlo.
  await beta.click({ button: 'right' })
  await menu.getByRole('menuitem', { name: 'Archivar' }).click()
  await expect(beta).toHaveCount(0)
  await expect(win.locator('.aviso-grilla')).toContainText('«Beta» archivado.')
  expect(await leerFicha('Beta')).toMatchObject({ archivado: true })
  await win.locator('.aviso-grilla').getByRole('button', { name: 'Deshacer' }).click()
  await expect(beta).toBeVisible()
  await expect.poll(async () => (await leerFicha('Beta')).archivado).toBe(false)

  // Sin ficha: archivar e ícono esperan a que tenga estado; elegir uno la crea.
  const gamma = win.locator('.tarjeta', { hasText: 'Gamma' })
  await gamma.click({ button: 'right' })
  const menuGamma = win.getByRole('menu', { name: 'Acciones de Gamma' })
  await expect(menuGamma.getByRole('menuitem', { name: 'Archivar' })).toBeDisabled()
  await expect(menuGamma.getByRole('menuitem', { name: 'Cambiar ícono…' })).toBeDisabled()
  await menuGamma.getByRole('menuitemradio', { name: 'En desarrollo' }).click()
  await expect(gamma).toContainText('en desarrollo')
  expect(await leerFicha('Gamma')).toMatchObject({ version: 1, estado: 'en-desarrollo', descripcion: '' })

  // Cambiar ícono: el cuadro de Windows se reemplaza por uno que elige el logo del proyecto.
  const logo = join(raiz, 'Alfa', 'logo.svg')
  await app.evaluate(({ dialog }, ruta) => {
    dialog.showOpenDialog = (async () => ({
      canceled: false,
      filePaths: [ruta],
    })) as typeof dialog.showOpenDialog
  }, logo)
  const alfa = win.locator('.tarjeta', { hasText: 'Alfa' })
  await expect(alfa.locator('.icono img')).toHaveCount(0)
  await alfa.click({ button: 'right' })
  await win
    .getByRole('menu', { name: 'Acciones de Alfa' })
    .getByRole('menuitem', { name: 'Cambiar ícono…' })
    .click()
  await expect(alfa.locator('.icono img')).toHaveCount(1)
  expect(await leerFicha('Alfa')).toMatchObject({ icono: 'logo.svg' })

  // Con el teclado: Mayús+F10 abre el menú en la tarjeta con el foco; Esc lo cierra y el foco vuelve a la tarjeta.
  await alfa.focus()
  await win.keyboard.press('Shift+F10')
  const menuAlfa = win.getByRole('menu', { name: 'Acciones de Alfa' })
  await expect(menuAlfa.getByRole('menuitem', { name: 'Abrir', exact: true })).toBeFocused()
  await win.keyboard.press('ArrowDown')
  await expect(menuAlfa.getByRole('menuitem', { name: 'Abrir en VS Code' })).toBeFocused()
  await win.keyboard.press('Escape')
  await expect(menuAlfa).toHaveCount(0)
  await expect(alfa).toBeFocused()

  // VS Code y el explorador (con IRIDIUM_VSCODE=falso no se abre nada): sin error.
  await alfa.click({ button: 'right' })
  await menuAlfa.getByRole('menuitem', { name: 'Abrir en VS Code' }).click()
  await expect(menuAlfa).toHaveCount(0)
  await expect(win.locator('.aviso-grilla.error')).toHaveCount(0)
  await app.close()
})

test('Eliminar pide confirmación, borra lo regenerable y manda el resto a la papelera (R-10)', async () => {
  await escribir('Alfa/package.json', '{ "name": "alfa" }\n')
  await escribir('Alfa/node_modules/libreria/index.js', 'module.exports = 1\n')
  const { app, win } = await abrir()
  const alfa = win.locator('.tarjeta', { hasText: 'Alfa' })
  const menu = win.getByRole('menu', { name: 'Acciones de Alfa' })
  const dialogo = win.getByRole('alertdialog', { name: '¿Eliminar «Alfa»?' })

  // Cancelar (y Enter, que empieza en Cancelar) no toca nada.
  await alfa.click({ button: 'right' })
  await menu.getByRole('menuitem', { name: 'Eliminar…' }).click()
  await expect(dialogo).toContainText('papelera de Windows')
  await expect(dialogo).toContainText('node_modules')
  await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused()
  await win.screenshot({ path: join(SALIDA, 'r10-eliminar.png') })
  await win.keyboard.press('Enter')
  await expect(dialogo).toHaveCount(0)
  await expect(alfa).toBeVisible()
  expect((await stat(join(raiz, 'Alfa'))).isDirectory()).toBe(true)

  await alfa.click({ button: 'right' })
  await menu.getByRole('menuitem', { name: 'Eliminar…' }).click()
  await dialogo.getByRole('button', { name: 'Eliminar', exact: true }).click()
  await expect(dialogo).toHaveCount(0)
  await expect(alfa).toHaveCount(0)
  await expect(win.locator('.aviso-grilla')).toContainText('«Alfa» está en la papelera de Windows.')
  await expect(stat(join(raiz, 'Alfa'))).rejects.toThrow()
  // En la papelera, todo menos lo regenerable.
  const [enPapelera] = await readdir(join(datos, 'papelera'))
  expect(enPapelera).toMatch(/-Alfa$/)
  const carpeta = join(datos, 'papelera', enPapelera ?? '')
  expect(JSON.parse(await readFile(join(carpeta, '.proyecto.json'), 'utf8'))).toMatchObject({
    descripcion: 'Una app de prueba',
  })
  await expect(stat(join(carpeta, 'node_modules'))).rejects.toThrow()
  await app.close()
})

test('Nuevo proyecto crea la carpeta con la plantilla básica y la abre, sin la IA (R-7, C-10, R-14)', async () => {
  const { app, win } = await abrir()
  await win.getByRole('button', { name: 'Nuevo proyecto' }).click()
  const cuadro = win.getByRole('dialog', { name: 'Nuevo proyecto' })
  await expect(cuadro.getByRole('textbox', { name: 'Nombre' })).toBeFocused()
  await expect(cuadro.getByRole('textbox')).toHaveCount(1)
  await cuadro.getByRole('textbox', { name: 'Nombre' }).fill('alfa')
  await cuadro.getByRole('button', { name: 'Crear' }).click()
  await expect(cuadro.getByRole('alert')).toHaveText('Ya hay una carpeta con ese nombre.')

  await cuadro.getByRole('textbox', { name: 'Nombre' }).fill('Delta')
  await win.screenshot({ path: join(SALIDA, 'r7-nuevo.png') })
  await cuadro.getByRole('button', { name: 'Crear' }).click()
  await expect(cuadro).toHaveCount(0)
  await expect(win.locator('.zona-principal')).toHaveAttribute('aria-label', 'Delta')
  expect(await readFile(join(raiz, 'Delta', 'docs', 'estado.md'), 'utf8')).toContain(
    '0 — Idea cruda — en curso',
  )
  expect((await stat(join(raiz, 'Delta', 'CLAUDE.md'))).isFile()).toBe(true)
  // La IA no arranca: la conversación queda vacía, esperando lo que le cuente el usuario.
  await expect(win.locator('.turno')).toHaveCount(0)
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Delta' })).not.toContainText('Trabajando')
  await win.screenshot({ path: join(SALIDA, 'r7-nuevo-abierto.png') })
  await app.close()
})

test('el proyecto muestra sus skills, si tiene (R-8); sus ideas ya no tienen sección propia (D-112)', async () => {
  const { app, win } = await abrir()
  const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })

  // Beta no tiene skills: su barra no muestra el ícono.
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(barra.getByRole('button', { name: 'Archivos' })).toBeVisible()
  await expect(barra.getByRole('button', { name: 'Trabajo' })).toHaveCount(0)
  await expect(barra.getByRole('button', { name: 'Skills del proyecto' })).toHaveCount(0)

  // Una skill nueva en Beta hace aparecer el ícono solo.
  await escribir('Beta/.claude/skills/probar/SKILL.md', '---\nname: probar\ndescription: Prueba.\n---\n')
  await expect(barra.getByRole('button', { name: 'Skills del proyecto' })).toBeVisible()

  await win.locator('button.boton-menu').click()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await barra.getByRole('button', { name: 'Skills del proyecto' }).click()
  const skills = win.locator('[data-seccion="skills"]')
  await expect(skills.locator('.skill-proyecto h4')).toHaveText(['publicar-alfa'])
  await expect(skills).toContainText('Cómo publicar una versión de Alfa.')
  await win.screenshot({ path: join(SALIDA, 'r8-skills.png') })
  await skills.getByRole('button', { name: 'Ver' }).click()
  await expect(win.locator('[data-seccion="archivos"]')).toContainText('SKILL.md')
  await app.close()
})
