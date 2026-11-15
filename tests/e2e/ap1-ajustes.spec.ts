// AP-I1 con la app abierta y el motor falso: la ventana de Ajustes (⚙ y Ctrl+,), Apariencia (un solo tema, D-104),
// los nombres en la conversación y el tono en las sesiones (modulos/apariencia/ux.md › AJ-1 a AJ-3).
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

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
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '60',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  delete env.IRIDIUM_TEMA
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

const leerConfig = async () => JSON.parse(await readFile(join(datos, 'config.json'), 'utf8'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  await writeFile(
    join(raiz, 'Alfa', 'docs', 'estado.md'),
    '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n',
  )
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('el ⚙ y Ctrl+, abren Ajustes; Esc, la ✕ y un clic afuera cierran sin perder lo escrito (AJ-W1)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('A medio escribir')

  const ajustes = win.getByRole('dialog', { name: 'Perfil' })
  await win.getByRole('button', { name: 'Ajustes' }).click()
  await expect(ajustes).toBeVisible()
  await expect(ajustes.getByRole('button', { name: 'Perfil' })).toHaveAttribute('aria-current', 'page')
  await win.keyboard.press('Escape')
  await expect(ajustes).toHaveCount(0)

  // Ctrl+, desde cualquier pantalla; recuerda la última sección mientras Iridium está abierto.
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Apariencia' }).click()
  await win.getByRole('dialog').getByRole('button', { name: 'Cerrar' }).click()
  await expect(win.getByRole('dialog')).toHaveCount(0)
  await win.keyboard.press('Control+,')
  await expect(win.getByRole('dialog', { name: 'Apariencia' })).toBeVisible()
  // Un clic fuera de la ventana la cierra.
  await win.mouse.click(30, 450)
  await expect(win.getByRole('dialog')).toHaveCount(0)

  // El foco no se escapa de la ventana con Tab.
  await win.keyboard.press('Control+,')
  for (let i = 0; i < 8; i++) await win.keyboard.press('Tab')
  expect(await win.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
  await win.keyboard.press('Escape')

  await expect(campo).toHaveValue('A medio escribir')
  await app.close()
})

test('un solo tema, el negro; Apariencia elige el ancho de lectura y sigue al volver a abrir (AJ-1, D-104)', async () => {
  let { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  // El negro de docs/diseno/tokens.css, sin atributo de tema.
  await expect(win.locator('html')).not.toHaveAttribute('data-tema', /.+/)
  const fondo = await win.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--fondo').trim(),
  )
  expect(fondo).toBe('#000000')
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Apariencia' }).click()
  await expect(win.getByRole('radiogroup', { name: 'Tema' })).toHaveCount(0)
  const anchos = win.getByRole('group', { name: 'Ancho de lectura' })
  await expect(anchos.getByRole('button', { name: 'Normal' })).toHaveAttribute('aria-pressed', 'true')
  await anchos.getByRole('button', { name: 'Ancho' }).click()
  await expect(anchos.getByRole('button', { name: 'Ancho' })).toHaveAttribute('aria-pressed', 'true')
  await win.screenshot({ path: 'test-results/ap1-apariencia.png' })
  await expect.poll(async () => (await leerConfig()).anchoHoja).toBe('ancho')
  await app.close()

  ;({ app, win } = await abrir())
  await expect(win.getByRole('heading', { name: 'Alfa', level: 1 })).toBeVisible()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'Apariencia' }).click()
  await expect(
    win.getByRole('group', { name: 'Ancho de lectura' }).getByRole('button', { name: 'Ancho' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await app.close()
})

test('los nombres aparecen en la conversación y el tono llega a la sesión (AJ-2, AJ-3)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win.keyboard.press('Control+,')
  const dialogo = win.getByRole('dialog')
  await dialogo.getByRole('textbox', { name: 'Tu nombre' }).fill('Lautaro')
  await win.screenshot({ path: 'test-results/ap1-perfil.png' })
  await dialogo.getByRole('button', { name: 'IA', exact: true }).click()
  await dialogo.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Iri')
  const tonos = dialogo.getByRole('radiogroup', { name: 'Tono' })
  await expect(tonos.getByRole('radio')).toHaveCount(3)
  await expect(tonos.locator('.tono')).toHaveText([/Normal/, /Explicativo/, /Aprendizaje/])
  await expect(tonos.getByRole('radio', { name: /Normal/ })).toBeChecked()
  await tonos.locator('.tono', { hasText: 'Explicativo' }).click()
  await expect(tonos.getByRole('radio', { name: /Explicativo/ })).toBeChecked()
  await win.screenshot({ path: 'test-results/ap1-ia.png' })
  // Se guarda solo, sin botón.
  await expect
    .poll(async () => {
      const c = await leerConfig()
      return `${c.nombreUsuario}|${c.nombreIa}|${c.tono}`
    })
    .toBe('Lautaro|Iri|Explanatory')
  await win.keyboard.press('Escape')

  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Hola')
  await campo.press('Enter')
  await expect(win.locator('.turno.usuario .mensaje-yo').first()).toHaveAttribute('title', /^Lautaro/)
  await expect(win.locator('.turno.ia .quien').first()).toContainText('Iri')
  await expect(win.locator('.turno.ia').first()).toContainText('(Estilo: Explanatory.)')
  await win.screenshot({ path: 'test-results/ap1-conversacion.png' })

  // Vacío, vuelve a «Vos» e «IA».
  await win.keyboard.press('Control+,')
  await dialogo.getByRole('button', { name: 'Perfil' }).click()
  await dialogo.getByRole('textbox', { name: 'Tu nombre' }).fill('')
  await dialogo.getByRole('button', { name: 'IA', exact: true }).click()
  await dialogo.getByRole('textbox', { name: 'Nombre', exact: true }).fill('')
  await win.keyboard.press('Escape')
  await expect(win.locator('.turno.usuario .mensaje-yo').first()).toHaveAttribute('title', /^Tú/)
  await expect(win.locator('.turno.ia .quien').first()).toContainText('IA')
  await app.close()
})

test('sin sesión de Claude Code, el tono muestra solo Normal y por qué (AJ-3)', async () => {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_ESTADO: 'sin-sesion',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  delete env.IRIDIUM_TEMA
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'IA', exact: true }).click()
  const tonos = win.getByRole('radiogroup', { name: 'Tono' })
  await expect(tonos).toContainText('Los demás estilos aparecen cuando Claude Code esté disponible.')
  await expect(tonos.getByRole('radio')).toHaveCount(1)
  await app.close()
})
