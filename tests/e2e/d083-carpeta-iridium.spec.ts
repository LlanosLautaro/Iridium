// D-083 con la app abierta y el motor falso: las carpetas de Ideas y Skills de antes, en la carpeta de proyectos, se
// siguen usando y el inicio ofrece Mover; Mover (con la confirmación reemplazada) las lleva a la carpeta Iridium con
// sus enlaces y su conversación. Con D-087 la carpeta de Iridium es `.iridium`, dentro de la carpeta de proyectos: al
// cambiar de carpeta de proyectos, Iridium ofrece traerla.
import { mkdir, mkdtemp, readdir, readFile, readlink, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let base: string
let raiz: string
let claude: string
let datos: string
let abierta: ElectronApplication | null = null

async function archivo(ruta: string, texto: string) {
  await mkdir(join(ruta, '..'), { recursive: true })
  await writeFile(ruta, texto)
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

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_CLAUDE: claude,
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

const leerConfig = async () => JSON.parse(await readFile(join(datos, 'config.json'), 'utf8'))

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-d083-'))
  raiz = join(base, 'Proyectos')
  claude = join(base, '.claude')
  datos = join(base, 'datos')
  await archivo(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  // Las de antes, como las dejaba D-060 y D-068, con su git y una skill propia enlazada.
  await archivo(join(raiz, 'Ideas', 'CLAUDE.md'), '# Ideas\n')
  await archivo(
    join(raiz, 'Ideas', 'ideas.md'),
    '# Ideas\n\n## Sueltas\n\n### Una idea vieja — 2026-10-01\nQué es.\n',
  )
  await archivo(
    join(raiz, 'Ideas', 'sueltas.md'),
    '# Ideas sueltas\n\n## T-1 — Una idea vieja\nEstado: nueva · Idea: usuario · Fecha: 2026-10-01\n',
  )
  await archivo(join(raiz, 'Ideas', '.git', 'HEAD'), 'ref: refs/heads/main\n')
  await archivo(join(raiz, 'Skills y Claude', 'CLAUDE.md'), '# Skills\n')
  await archivo(
    join(raiz, 'Skills y Claude', 'skills', 'guia', 'SKILL.md'),
    '---\nname: guia\ndescription: Una.\n---\n',
  )
  await mkdir(join(claude, 'skills'), { recursive: true })
  await symlink(join(raiz, 'Skills y Claude', 'skills', 'guia'), join(claude, 'skills', 'guia'), 'junction')
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

test('las de antes se siguen usando; Mover las lleva a .iridium con su enlace y su conversación', async () => {
  const { app, win } = await abrir()
  const grilla = win.getByRole('region', { name: 'Proyectos' })
  await expect(grilla.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  // No salen en la grilla: siguen funcionando como Ideas y Skills.
  await expect(grilla.locator('.tarjeta')).toHaveCount(1)
  const aviso = grilla.locator('.mudanza')
  await expect(aviso).toContainText('Ideas y Skills y Claude siguen donde estaban antes')
  await expect(aviso).toContainText(join(raiz, '.iridium'))
  await win.keyboard.press('Control+3')
  await expect(win.getByRole('region', { name: 'Ideas' }).locator('.idp-item')).toContainText(
    'Una idea vieja',
  )
  // Una conversación en el chat general antes de mover.
  const chat = win.getByRole('complementary', { name: 'Chat general' })
  await chat.getByRole('textbox', { name: 'Mensaje para la IA' }).fill('Hola')
  await chat.getByRole('textbox', { name: 'Mensaje para la IA' }).press('Enter')
  await expect(chat.locator('.hilo')).toContainText('Listo: dejé el estado al día.')
  await win.keyboard.press('Control+1')
  await win.screenshot({ path: 'test-results/d083-aviso.png' })

  // Cancelar no cambia nada.
  await app.evaluate(({ dialog }) => {
    dialog.showMessageBox = (async () => ({ response: 1, checkboxChecked: false })) as never
  })
  await aviso.getByRole('button', { name: 'Mover' }).click()
  await expect(aviso.getByRole('button', { name: 'Mover' })).toBeEnabled()
  expect((await readdir(raiz)).sort()).toEqual(['Alfa', 'Ideas', 'Skills y Claude'])

  await app.evaluate(({ dialog }) => {
    dialog.showMessageBox = (async () => ({ response: 0, checkboxChecked: false })) as never
  })
  await aviso.getByRole('button', { name: 'Mover' }).click()
  await expect(grilla.locator('.mudanza')).toContainText('Listo: se movieron a la carpeta de Iridium.')
  await win.screenshot({ path: 'test-results/d083-movidas.png' })
  expect((await readdir(raiz)).sort()).toEqual(['.iridium', 'Alfa'])
  const iridium = join(raiz, '.iridium')
  expect((await readdir(join(iridium, 'Ideas'))).sort()).toEqual([
    '.git',
    'CLAUDE.md',
    'ideas.md',
    'sueltas.md',
  ])
  expect(await readlink(join(claude, 'skills', 'guia'))).toMatch(
    /\.iridium[\\/]Skills[\\/]skills[\\/]guia[\\/]?$/,
  )

  // Ideas sigue, con la misma conversación.
  await win.keyboard.press('Control+3')
  await expect(win.getByRole('region', { name: 'Ideas' }).locator('.idp-item')).toContainText(
    'Una idea vieja',
  )
  await expect(chat.locator('.hilo')).toContainText('Hola')
  // Skills reconoce la propia en su lugar nuevo.
  await win.keyboard.press('Control+2')
  const skills = win.getByRole('navigation', { name: 'Skills' })
  await expect(skills.getByRole('button', { name: /Propias\s*1/ })).toBeVisible()
  await skills.getByTitle('guia', { exact: true }).click()
  const detalle = win.getByRole('region', { name: 'La skill guia' })
  await expect(detalle.getByText('Propia · enlace a la carpeta Skills')).toBeVisible()
  await app.close()

  // Al volver a abrir, no hay nada para mover.
  const otra = await abrir()
  await expect(otra.win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await expect(otra.win.locator('.mudanza')).toHaveCount(0)
  await otra.app.close()
})

test('D-087: sin las de antes crea .iridium; con otra carpeta de proyectos, ofrece traerla', async () => {
  await rm(join(raiz, 'Ideas'), { recursive: true })
  await rm(join(raiz, 'Skills y Claude'), { recursive: true })
  const { app, win } = await abrir()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  // Sin las de antes, Iridium crea las suyas en .iridium, y la grilla no la muestra.
  const primera = join(raiz, '.iridium')
  expect((await readdir(primera)).sort()).toEqual(['Ideas', 'Skills'])
  await expect(win.locator('.tarjeta')).toHaveCount(1)
  await writeFile(join(primera, 'Ideas', 'nota.md'), 'mía\n')

  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Proyectos' }).click()
  const fila = win.getByRole('dialog', { name: 'Proyectos' }).locator('.carpeta-iridium')
  await expect(fila).toContainText('Carpeta de Iridium')
  await expect(fila.locator('.ruta')).toHaveText(primera)
  await expect(fila.getByRole('button')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/d087-ajustes.png' })

  // Otra carpeta de proyectos: su .iridium no está; Iridium ofrece traer la de la anterior.
  const otra = join(base, 'Otros')
  await archivo(join(otra, 'Beta', '.proyecto.json'), ficha)
  await app.evaluate(({ dialog }, ruta) => {
    dialog.showOpenDialog = (async () => ({ canceled: false, filePaths: [ruta] })) as never
  }, otra)
  await win
    .getByRole('dialog', { name: 'Proyectos' })
    .locator('.carpeta-proyectos')
    .getByRole('button', { name: 'Cambiar…' })
    .click()
  await expect(fila.locator('.ruta')).toHaveText(join(otra, '.iridium'))
  expect((await leerConfig()).carpetaIridium).toBe(primera)
  await win.getByRole('dialog').getByRole('button', { name: 'Cerrar' }).click()
  const aviso = win.getByRole('region', { name: 'Proyectos' }).locator('.mudanza')
  await expect(aviso).toContainText('Ideas y Skills siguen donde estaban antes')
  await app.evaluate(({ dialog }) => {
    dialog.showMessageBox = (async () => ({ response: 0, checkboxChecked: false })) as never
  })
  await aviso.getByRole('button', { name: 'Mover' }).click()
  await expect(win.locator('.mudanza')).toContainText('Listo: se movieron a la carpeta de Iridium.')
  expect(await readFile(join(otra, '.iridium', 'Ideas', 'nota.md'), 'utf8')).toBe('mía\n')
  await app.close()
})
