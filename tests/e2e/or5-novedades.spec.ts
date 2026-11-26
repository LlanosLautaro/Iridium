// T-64 (frente Orden, D-118, Q-311) con la app abierta y el motor falso: «N novedades del framework» en la tarjeta,
// Ponerse al día en su menú y en Skills › Framework (con el filtro Con novedades), citado sin mandar (D-196).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { armarCarpetaClaude } from '../muestras/carpeta-claude'

let base: string
let raiz: string
let datos: string
let abierta: ElectronApplication | null = null

const NOVEDADES = [
  '# Novedades del framework',
  '',
  '## 2026-11-12 — Las piezas llevan ficha',
  'Solo si: docs/ux',
  'Cada pieza de `piezas.css` empieza con su ficha.',
  '',
  '## 2026-11-20 — Cada proyecto dice cómo se abre',
  'La marca en `docs/scripts.md`.',
  '',
].join('\n')

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
const estado =
  '# Estado del proyecto\n\n**Última actualización:** 2026-11-06\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'
const conFramework = (fecha: string, ux: boolean) => ({
  '.proyecto.json': ficha,
  'docs/estado.md': estado,
  'docs/README.md': `# Docs\n\n**Framework:** ${fecha}\n`,
  'docs/trabajo.md': '# Trabajo\n',
  ...(ux ? { 'docs/ux/flujos.md': '# Flujos\n' } : {}),
})

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_CLAUDE: join(base, '.claude'),
    IRIDIUM_NOVEDADES: join(base, 'framework'),
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
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-or5-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  await armarCarpetaClaude(join(base, '.claude'), join(raiz, '.iridium', 'Skills'), join(base, 'afuera'))
  await mkdir(join(base, 'framework'), { recursive: true })
  await writeFile(join(base, 'framework', 'novedades.md'), NOVEDADES)
  // Alfa, del 2026-11-08 con docs/ux: las dos. Beta, del mismo día sin docs/ux: una. Gamma, al día.
  await proyecto('Alfa', conFramework('2026-11-08', true))
  await proyecto('Beta', conFramework('2026-11-08', false))
  await proyecto('Gamma', conFramework('2026-11-26', true))
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

test('la tarjeta y Skills › Framework muestran las novedades; Ponerse al día queda citado', async () => {
  const { app, win } = await abrir()
  const alfa = win.locator('.tarjeta', { hasText: 'Alfa' })
  await expect(alfa.locator('.novedades-t')).toHaveText('2 novedades del framework')
  await expect(win.locator('.tarjeta', { hasText: 'Beta' }).locator('.novedades-t')).toHaveText(
    '1 novedad del framework',
  )
  await expect(win.locator('.tarjeta', { hasText: 'Gamma' }).locator('.novedades-t')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/or5-tarjetas.png' })

  // Tocar la línea lleva a Skills › Framework con la lista abierta.
  await alfa.locator('.novedades-t').click()
  const framework = win.getByRole('region', { name: 'Framework' })
  const fila = framework.locator('li.fila[data-proyecto="Alfa"]')
  await expect(fila).toContainText('framework del 2026-11-08')
  await expect(fila.getByRole('button', { name: '2 novedades' })).toHaveAttribute('aria-expanded', 'true')
  const lista = framework.getByRole('list', { name: 'Novedades del framework' })
  await expect(lista.locator('li')).toHaveCount(2)
  await expect(lista).toContainText('Cada pieza de piezas.css empieza con su ficha.')
  // Los que tienen novedades, antes de los que están al día (en el orden de la grilla entre ellos).
  await expect(framework.locator('li.fila').last()).toHaveText(/Gamma.*al día · 2026-11-26/)
  await expect(framework).toContainText('2 con novedades')
  await win.screenshot({ path: 'test-results/or5-framework.png' })
  await framework.getByRole('button', { name: /Con novedades/ }).click()
  await expect(framework.locator('li.fila')).toHaveCount(2)

  // Ponerse al día desde el menú de la tarjeta: citado en una conversación nueva, sin mandar (D-196).
  await win.keyboard.press('Control+1')
  await alfa.click({ button: 'right' })
  const menu = win.getByRole('menu', { name: 'Acciones de Alfa' })
  await menu.getByRole('menuitem', { name: 'Ponerse al día · 2 novedades' }).click()
  const cita = win.locator('.compositor .citado')
  await expect(cita).toHaveText('Framework Ponerse al día · 2 novedades')
  await expect(win.getByText('· conversación nueva')).toBeVisible()
  await win.screenshot({ path: 'test-results/or5-citado.png' })
  await app.close()
})

test('Ponerse al día desde Skills › Framework', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Beta' }).locator('.novedades-t').click()
  const fila = win.getByRole('region', { name: 'Framework' }).locator('li.fila[data-proyecto="Beta"]')
  await fila.getByRole('button', { name: 'Ponerse al día' }).click()
  await expect(win.locator('.compositor .citado')).toHaveText('Framework Ponerse al día · 1 novedad')
  await app.close()
})
