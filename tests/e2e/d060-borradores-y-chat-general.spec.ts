// D-060 con la app abierta y el motor falso: lo escrito en el chat y en Pendientes no se pierde al cambiar de lugar ni
// al cerrar Iridium (R-3), al abrir se vuelve al proyecto que estaba abierto, y el chat de la vista de Proyectos.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

async function proyecto(nombre: string, archivos: Record<string, string>) {
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(raiz, nombre, ruta, '..'), { recursive: true })
    await writeFile(join(raiz, nombre, ruta), texto)
  }
}
const ficha = (descripcion: string) =>
  JSON.stringify({
    version: 1,
    descripcion,
    estado: 'en-desarrollo',
    etiquetas: [],
    icono: null,
    archivado: false,
    reemplazadoPor: null,
  })
const estado = (preguntas = '(ninguna)') =>
  `# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n${preguntas}\n\n## Próximo paso\nHacer la grilla.\n`
const PRUEBA = `- **Q-4 — Usá la grilla**
  Tipo: prueba
  Contexto: la grilla nueva.
  - [ ] Se ven todas las tarjetas
  - [ ] Se ordenan por fecha`

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '40',
    IRIDIUM_REVISION: 'no',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await proyecto('Alfa', { '.proyecto.json': ficha('Un proyecto'), 'docs/estado.md': estado(PRUEBA) })
  await proyecto('Beta', { '.proyecto.json': ficha('Otro proyecto'), 'docs/estado.md': estado() })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 5 })
  await rm(datos, { recursive: true, force: true, maxRetries: 5 })
})

test('lo escrito en el chat queda al cambiar de proyecto y al cerrar; al abrir, vuelve al proyecto', async () => {
  let { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = () => win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo().fill('Quiero que la grilla\nse ordene por fecha')
  // Al inicio y de vuelta: sigue escrito.
  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(campo()).toHaveValue('')
  await win.locator('.barra-proyectos .proy', { hasText: 'Alfa' }).getByRole('tab').click()
  await expect(campo()).toHaveValue('Quiero que la grilla\nse ordene por fecha')
  // Se cierra Iridium con Alfa a la vista, enseguida: lo escrito llega igual al disco.
  await app.close()

  ;({ app, win } = await abrir())
  // Abre directo en Alfa, en su sección principal, con lo escrito.
  await expect(win.locator('.zona-principal .cab-proyecto h1')).toHaveText('Alfa')
  await expect(win.locator('.act.elegida')).toHaveAttribute('aria-label', /Bandeja de entrada/)
  await expect(campo()).toHaveValue('Quiero que la grilla\nse ordene por fecha')
  await win.screenshot({ path: 'test-results/d060-vuelve.png' })
  // Al enviar se borra, también del disco.
  await campo().press('Enter')
  await expect(win.locator('aside.chat .hilo')).toContainText('Listo: dejé el estado al día.')
  await expect(campo()).toHaveValue('')
  // En el inicio al cerrar: abre en el inicio.
  await win.keyboard.press('Control+1')
  await app.close()

  ;({ app, win } = await abrir())
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(campo()).toHaveValue('')
  await app.close()
})

test('lo marcado y escrito en una prueba de la Bandeja queda aunque se cierre Iridium (R-3)', async () => {
  let { app, win } = await abrir()
  // Alfa tiene preguntas: se entra por su Bandeja de entrada (sin la Bandeja de todos, D-111).
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const q4 = () => win.locator('article.pend[data-q="Q-4"]')
  await q4().getByRole('checkbox', { name: 'Se ven todas las tarjetas' }).check()
  await q4().getByRole('textbox', { name: 'Nota de: Se ordenan por fecha' }).fill('se ordenan al revés')
  // Sin tocar Guardar a medias ni Enviar: se guarda solo apenas se deja de escribir.
  await win.waitForTimeout(600)
  await app.close()

  // Abre de vuelta en Alfa (D-060), en su Bandeja.
  ;({ app, win } = await abrir())
  await expect(q4().getByRole('checkbox', { name: 'Se ven todas las tarjetas' })).toBeChecked()
  await expect(q4().getByRole('textbox', { name: 'Nota de: Se ordenan por fecha' })).toHaveValue(
    'se ordenan al revés',
  )
  await expect(q4().locator('.meta')).toContainText('A medias')
  await app.close()
})

test('el chat de la vista de Proyectos conversa en la carpeta Ideas, sin Seguí ni avisos', async () => {
  // La carpeta Ideas la crea Iridium en su carpeta (D-083): el chat está desde la primera vez.
  const { app, win } = await abrir()
  const chat = win.locator('aside.chat')
  await expect(chat.locator('.cab-conv')).toContainText('Ideas y proyectos')
  await expect(chat).toContainText('ideas.md')
  await expect(chat.getByRole('button', { name: 'Continuar' })).toHaveCount(0)
  await chat.getByRole('textbox', { name: 'Mensaje para la IA' }).fill('Una idea: un lanzador de juegos')
  await chat.getByRole('textbox', { name: 'Mensaje para la IA' }).press('Enter')
  await expect(chat.locator('.hilo')).toContainText('Una idea: un lanzador de juegos')
  await expect(chat.locator('.hilo')).toContainText('Listo: dejé el estado al día.')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Ideas' })).toContainText('Terminada')
  // Se ve en el chat: no hay aviso.
  await expect(win.locator('.aviso-flotante')).toHaveCount(0)
  // La grilla sigue a la izquierda.
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.screenshot({ path: 'test-results/d060-chat-general.png' })
  await app.close()
})
