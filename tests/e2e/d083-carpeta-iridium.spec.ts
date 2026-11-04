// D-083 con la app abierta y el motor falso: las carpetas de Ideas y Skills de antes, en la carpeta de proyectos, se
// siguen usando y el inicio ofrece Mover; Mover (con la confirmación reemplazada) las lleva a la carpeta Iridium con
// sus enlaces y su conversación; Ajustes › Proyectos cambia la carpeta Iridium de lugar.
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

test('las de antes se siguen usando; Mover las lleva a la carpeta Iridium con su enlace y su conversación', async () => {
  const { app, win } = await abrir()
  const grilla = win.getByRole('region', { name: 'Proyectos' })
  await expect(grilla.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  // No salen en la grilla: siguen funcionando como Ideas y Skills.
  await expect(grilla.locator('.tarjeta')).toHaveCount(1)
  const aviso = grilla.locator('.mudanza')
  await expect(aviso).toContainText('Ideas y Skills y Claude están en la carpeta de proyectos')
  await expect(aviso).toContainText(join(datos, 'Iridium'))
  await win.keyboard.press('Control+4')
  await expect(win.getByRole('navigation', { name: 'Ideas' }).getByTitle('Una idea vieja')).toBeVisible()
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
  await expect(grilla.locator('.mudanza')).toContainText('Listo: se movieron a la carpeta Iridium.')
  await win.screenshot({ path: 'test-results/d083-movidas.png' })
  expect(await readdir(raiz)).toEqual(['Alfa'])
  const iridium = join(datos, 'Iridium')
  expect((await readdir(join(iridium, 'Ideas'))).sort()).toEqual(['.git', 'CLAUDE.md', 'ideas.md'])
  expect(await readlink(join(claude, 'skills', 'guia'))).toMatch(
    /Iridium[\\/]Skills[\\/]skills[\\/]guia[\\/]?$/,
  )

  // Ideas sigue, con la misma conversación.
  await win.keyboard.press('Control+4')
  await expect(win.getByRole('navigation', { name: 'Ideas' }).getByTitle('Una idea vieja')).toBeVisible()
  await expect(chat.locator('.hilo')).toContainText('Hola')
  // Skills reconoce la propia en su lugar nuevo.
  await win.keyboard.press('Control+3')
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

test('Ajustes › Proyectos cambia la carpeta Iridium y lleva Ideas y Skills', async () => {
  await rm(join(raiz, 'Ideas'), { recursive: true })
  await rm(join(raiz, 'Skills y Claude'), { recursive: true })
  const { app, win } = await abrir()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  // Sin las de antes, Iridium crea las suyas.
  const primera = join(datos, 'Iridium')
  expect((await readdir(primera)).sort()).toEqual(['Ideas', 'Skills'])
  await writeFile(join(primera, 'Ideas', 'nota.md'), 'mía\n')

  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Proyectos' }).click()
  const fila = win.getByRole('dialog', { name: 'Proyectos' }).locator('.carpeta-iridium')
  await expect(fila).toContainText('Carpeta Iridium')
  await expect(fila.locator('.ruta')).toHaveText(primera)
  const segunda = join(base, 'Otra')
  await app.evaluate(({ dialog }, ruta) => {
    dialog.showOpenDialog = (async () => ({ canceled: false, filePaths: [ruta] })) as never
  }, segunda)
  await fila.getByRole('button', { name: 'Cambiar…' }).click()
  await expect(fila.locator('.ruta')).toHaveText(segunda)
  await win.screenshot({ path: 'test-results/d083-ajustes.png' })
  expect((await leerConfig()).carpetaIridium).toBe(segunda)
  expect(await readFile(join(segunda, 'Ideas', 'nota.md'), 'utf8')).toBe('mía\n')
  expect(await readdir(primera)).toEqual([])
  await app.close()
})
