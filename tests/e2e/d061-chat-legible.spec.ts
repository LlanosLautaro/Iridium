// D-061 con la app abierta y el motor falso: el chat se lee de un vistazo. Lo tuyo en una burbuja a la derecha; de la
// IA, el proceso (herramientas y notas del camino) aparte y plegado al terminar, y la respuesta en letra de lectura.
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
  await proyecto('Alfa', { '.proyecto.json': ficha('Un proyecto'), 'docs/estado.md': estado() })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 5 })
  await rm(datos, { recursive: true, force: true, maxRetries: 5 })
})

test('lo tuyo en burbuja; de la IA, el proceso aparte (plegado al terminar) y la respuesta', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  const hilo = win.locator('.hilo')

  // Mientras trabaja, el proceso se ve entero y sin plegar.
  await campo.fill('Algo lento: ordená la grilla por fecha')
  await campo.press('Enter')
  await expect(hilo.locator('.turno.usuario .mensaje-yo')).toHaveText(
    'Algo lento: ordená la grilla por fecha',
  )
  await expect(hilo.locator('.turno.ia .proceso-ia').first()).toContainText('Leyó docs/estado.md')
  await expect(hilo.locator('.turno.ia .proceso-ia.plegado')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/d061-trabajando.png' })

  // Al terminar: el proceso queda en una línea y la respuesta, aparte.
  await expect(hilo.locator('.respuesta-ia')).toHaveText('Listo: dejé el estado al día.', {
    timeout: 20_000,
  })
  const proceso = hilo.locator('.proceso-ia.plegado')
  await expect(proceso.locator('.proceso-cab')).toContainText('Proceso2 herramientas · 1 nota')
  await expect(proceso).not.toContainText('Leyó')

  await campo.fill('Ahora sumale un filtro por etiqueta, y contame qué cambiaste')
  await campo.press('Enter')
  await expect(hilo.locator('.respuesta-ia')).toHaveCount(2)
  await expect(hilo.locator('.turno.usuario')).toHaveCount(2)
  await win.screenshot({ path: 'test-results/d061-chat.png' })

  // Se despliega para ver qué hizo y qué fue contando.
  await proceso.first().locator('.proceso-cab').click()
  await expect(proceso.first()).toContainText('Leyó docs/estado.md')
  await expect(proceso.first().locator('.nota-ia')).toContainText('Sigo con el próximo paso.')
  await win.screenshot({ path: 'test-results/d061-proceso-abierto.png' })
  await app.close()
})
