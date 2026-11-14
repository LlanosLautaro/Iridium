// I-2: conversar con la IA con el motor falso: Seguí, las preguntas que deja, Detener y retomar, y dos proyectos
// trabajando a la vez mientras se cambia entre ellos (H-4, H-5, H-14, H-2, H-6).
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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
  '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nHacer la grilla.\n'

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '150',
    ...extra,
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
  await proyecto('Alfa', { '.proyecto.json': ficha, 'docs/estado.md': estado })
  await proyecto('Beta', { '.proyecto.json': ficha, 'docs/estado.md': estado })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 5 })
  await rm(datos, { recursive: true, force: true, maxRetries: 5 })
})

test('Seguí trabaja, termina y muestra las preguntas que dejó con Responder (H-4, H-5)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_PREGUNTA: '1' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win.locator('.chat-cab').getByRole('button', { name: 'Seguí' }).click()

  const pestana = win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })
  await expect(pestana).toContainText('Trabajando')
  await expect(win.locator('.ahora')).toContainText('Trabajando')
  await expect(win.locator('.turno').first()).toContainText('Seguí con el proyecto.')
  await expect(win.locator('.hilo .md').first()).toContainText('Leí docs/estado.md')

  await expect(win.locator('.pedido')).toContainText('Dejó 1 pregunta')
  await expect(win.locator('.pedido')).toContainText('Q-1')
  await expect(win.locator('.pedido')).toContainText('prueba · frena')
  await expect(win.locator('.pedido').getByRole('button', { name: 'Responder' })).toBeVisible()
  // La IA escribió la pregunta en el estado.md del proyecto; la pestaña la cuenta, en amarillo porque frena.
  expect(await readFile(join(raiz, 'Alfa', 'docs', 'estado.md'), 'utf8')).toContain('- **Q-1 — ')
  await expect(pestana.locator('.cuenta')).toHaveText('1')
  await expect(pestana.locator('.cuenta')).toHaveClass(/frena/)
  await expect(win.locator('.chat-cab')).toContainText('empezada en Iridium')
  await win.screenshot({ path: 'test-results/i2-terminada.png' })
  await app.close()
})

test('Detener frena a la IA en el acto y se retoma con Seguí (H-14)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Hacé algo lento')
  await campo.press('Enter')
  await expect(campo).toHaveValue('')
  await expect(win.locator('.turno').first()).toContainText('Hacé algo lento')

  await win.getByRole('button', { name: 'Detener' }).click()
  await expect(win.locator('.linea-aviso.detenida')).toHaveText('Detuviste a la IA.')
  await expect(win.getByRole('button', { name: 'Detener' })).toHaveCount(0)
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Terminada')
  await win.screenshot({ path: 'test-results/i2-detenida.png' })

  await win.locator('.chat-cab').getByRole('button', { name: 'Seguí' }).click()
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Trabajando')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Terminada')
  await expect(win.locator('.hilo .md').last()).toContainText('Listo')
  await app.close()
})

test('dos proyectos trabajan a la vez y cambiar entre ellos no corta nada (H-2, H-6)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Algo lento en Alfa')
  await campo.press('Enter')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Trabajando')

  await win.keyboard.press('Control+1')
  // En la grilla, la tarjeta muestra el mismo estado que la ficha (H-2).
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' }).locator('.sesion')).toContainText('Trabajando')
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(win.locator('.turno')).toHaveCount(0)
  await campo.fill('Algo lento en Beta')
  await campo.press('Enter')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Beta' })).toContainText('Trabajando')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Trabajando')
  await expect(win.locator('.barra-proyectos .proy.elegido')).toContainText('Beta')
  await win.screenshot({ path: 'test-results/i2-dos-sesiones.png' })

  // La ficha de Alfa lleva a Alfa, con su conversación como estaba.
  await win.locator('.barra-proyectos .proy', { hasText: 'Alfa' }).getByRole('tab').click()
  await expect(win.locator('.zona-principal > .cab-proyecto h1')).toHaveText('Alfa')
  await expect(win.locator('.turno').first()).toContainText('Algo lento en Alfa')
  await expect(win.locator('.hilo')).not.toContainText('Beta')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Terminada', {
    timeout: 15_000,
  })
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Beta' })).toContainText('Terminada', {
    timeout: 15_000,
  })

  // La ficha de una sesión terminada se cierra con × y la conversación queda.
  await win.getByRole('button', { name: 'Cerrar Beta' }).click()
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Beta' })).toHaveCount(0)
  await app.close()
})

test('Nueva abre una conversación en blanco que empieza con lo que se escribe, sin Seguí', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Primera charla')
  await campo.press('Enter')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Terminada')

  // Nueva no manda nada: muestra la conversación en blanco y se puede volver a la anterior.
  await win.locator('.chat-cab').getByRole('button', { name: 'Nueva' }).click()
  await expect(win.locator('.turno')).toHaveCount(0)
  await expect(win.locator('.sin-conversacion')).toContainText('conversación nueva')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Terminada')
  await win.getByRole('button', { name: 'Volver a la anterior' }).click()
  await expect(win.locator('.turno').first()).toContainText('Primera charla')

  // El primer mensaje en blanco empieza la conversación nueva con ese texto.
  await win.locator('.chat-cab').getByRole('button', { name: 'Nueva' }).click()
  // El cursor queda en el campo para escribir de una (R-52).
  await expect(campo).toBeFocused()
  await campo.fill('Una idea aparte')
  await campo.press('Enter')
  await expect(win.locator('.turno').first()).toContainText('Una idea aparte')
  await expect(win.locator('.hilo')).not.toContainText('Primera charla')
  await expect(win.locator('.hilo')).not.toContainText('Seguí con el proyecto.')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Terminada')
  await win.screenshot({ path: 'test-results/i3-nueva-en-blanco.png' })
  await app.close()
})

test('lo que la IA deja de fondo se ve mientras lo espera, y retoma sola cuando termina (T-65)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '300' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Corré las pruebas de fondo')
  await campo.press('Enter')

  // Terminó el turno, pero espera lo de fondo: lo dice la conversación y la pestaña, y Detener sigue a mano.
  const pestana = win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })
  await expect(win.locator('.ahora.esperando')).toContainText(
    'Esperando lo que dejó de fondo · Pruebas con la app abierta',
  )
  await expect(pestana).toContainText('Esperando')
  await expect(win.getByRole('button', { name: 'Detener' })).toBeVisible()
  await win.screenshot({ path: 'test-results/t65-esperando.png' })

  // Cuando termina, la IA retoma sola y cierra.
  await expect(win.locator('.hilo')).toContainText('Terminaron las pruebas de fondo', { timeout: 15_000 })
  await expect(pestana).toContainText('Terminada')
  await expect(win.locator('.ahora')).toHaveCount(0)
  await app.close()
})
