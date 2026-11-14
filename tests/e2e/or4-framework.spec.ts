// OR-I4 con la app abierta y el motor falso: Pasar al framework desde la tarjeta y desde una carpeta simple (OR-8,
// W-3), los avisos de la tarjeta que llevan a su lista en Skills › Framework (T-48) e Ideas con Ver en Framework (T-51).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { armarCarpetaClaude } from '../muestras/carpeta-claude'

let base: string
let raiz: string
let datos: string
let abierta: ElectronApplication | null = null

async function proyecto(nombre: string, archivos: Record<string, string>) {
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(raiz, nombre, ruta, '..'), { recursive: true })
    await writeFile(join(raiz, nombre, ruta), texto)
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
const estado = (preguntas = '(ninguna)') =>
  `# Estado del proyecto\n\n**Última actualización:** 2026-11-06\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n${preguntas}\n\n## Próximo paso\nSeguir.\n`

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_CLAUDE: join(base, '.claude'),
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

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-or4-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  await armarCarpetaClaude(join(base, '.claude'), join(raiz, '.iridium', 'Skills'), join(base, 'afuera'))
  // Alfa sigue el framework, con una pregunta sin tipo: un aviso del control.
  await proyecto('Alfa', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado('- **Q-1 — ¿Sin tipo?**\n  Contexto: le falta el tipo.'),
    'docs/README.md': '# Docs\n\n**Framework:** 2026-11-06\n',
    'docs/trabajo.md': '# Trabajo\n',
  })
  // Beta es una carpeta simple; Gamma, de framework viejo.
  await proyecto('Beta', { '.proyecto.json': ficha, 'notas.txt': 'Unas notas.\n' })
  await proyecto('Gamma', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado(),
    'docs/README.md': '# Docs\n\n**Formato de la guía:** 2026-10-16\n',
  })
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

test('los avisos de la tarjeta llevan a su lista en Framework; Ideas lleva a Framework (T-48, T-51)', async () => {
  const { app, win } = await abrir()
  const alfa = win.locator('.tarjeta', { hasText: 'Alfa' })
  await expect(alfa.locator('.aviso-fw')).toHaveText('!1 aviso del framework')
  await alfa.locator('.aviso-fw').click()
  const framework = win.getByRole('region', { name: 'Framework' })
  const fila = framework.locator('.sk-proy[data-proyecto="Alfa"]')
  await expect(fila.getByRole('button', { name: /1 aviso del framework/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  await expect(fila.locator('.sk-lista-avisos')).toContainText('docs/estado.md')
  await expect(framework.locator('.sk-proy')).toHaveText([
    /Gamma.*framework viejo/,
    /Alfa/,
    /Beta.*carpeta simple/,
  ])
  await win.screenshot({ path: 'test-results/or4-framework.png' })

  // Ideas: la línea de los que no pasaron lleva a Framework.
  await win.keyboard.press('Control+1')
  await win.keyboard.press('Control+3')
  await expect(win.locator('.id-viejos')).toContainText('Las ideas de Gamma no aparecen')
  await win.locator('.id-viejos').getByRole('button', { name: 'Ver en Framework' }).click()
  await expect(framework).toBeVisible()
  await app.close()
})

test('una carpeta simple: sin Mapa ni Docs, el recuadro en Archivos y Pasar al framework (W-3, OR-8)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
  await expect(barra.getByRole('button', { name: 'Mapa' })).toHaveCount(0)
  await expect(barra.getByRole('button', { name: 'Docs' })).toHaveCount(0)
  // Sin estado.md no hay próximo paso: el chat no ofrece Seguí.
  await expect(win.getByRole('button', { name: 'Seguí' })).toHaveCount(0)
  await expect(win.getByText('Esta carpeta no sigue el framework: no hay un próximo paso.')).toBeVisible()
  const archivos = win.locator('[data-seccion="archivos"]')
  const recuadro = archivos.locator('.recuadro-simple')
  await expect(recuadro).toContainText('Esta carpeta no sigue el framework')
  await win.screenshot({ path: 'test-results/or4-carpeta-simple.png' })

  // La IA falsa le arma el estado.md y la línea del framework: deja de ser una carpeta simple.
  await recuadro.getByRole('button', { name: 'Pasar al framework' }).click()
  await expect(recuadro).toHaveCount(0, { timeout: 15_000 })
  await expect(barra.getByRole('button', { name: 'Mapa' })).toBeVisible()
  await expect(win.getByRole('button', { name: 'Seguí' })).toBeVisible()
  await app.close()
})

test('Pasar al framework desde el menú de la tarjeta (OR-8)', async () => {
  const { app, win } = await abrir()
  const gamma = win.locator('.tarjeta', { hasText: 'Gamma' })
  await expect(gamma).toContainText('framework viejo')
  await gamma.click({ button: 'right' })
  const menu = win.getByRole('menu', { name: 'Acciones de Gamma' })
  await expect(menu.getByRole('menuitem', { name: 'Ver los avisos del framework' })).toHaveCount(0)
  await menu.getByRole('menuitem', { name: 'Pasar al framework' }).click()
  await expect(win.getByText('La IA de «Gamma» lo está pasando al framework.')).toBeVisible()
  await expect(gamma).not.toContainText('framework viejo', { timeout: 15_000 })

  // Una con avisos ofrece verlos; una que ya sigue el framework no ofrece pasarla.
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click({ button: 'right' })
  const menuAlfa = win.getByRole('menu', { name: 'Acciones de Alfa' })
  await expect(menuAlfa.getByRole('menuitem', { name: 'Pasar al framework' })).toHaveCount(0)
  await menuAlfa.getByRole('menuitem', { name: 'Ver los avisos del framework' }).click()
  await expect(win.getByRole('region', { name: 'Framework' })).toBeVisible()
  await app.close()
})
