// T-110 (ronda de UX 1): los avisos de la esquina a la vez — el de Arranque (AR-4), el de Ejecutar (AB-2) y el de una
// conversación que terminó en otro proyecto (H-13) — se apilan sin taparse, dentro de la ventana y sin tapar la
// conversación de al lado. Con la app abierta y el motor falso; capturas en test-results/t110-*.png.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { armarCarpetaClaude } from '../muestras/carpeta-claude'

let base: string
let raiz: string
let datos: string
let abierta: ElectronApplication | null = null

const HORA = 3_600_000
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
  '# Estado del proyecto\n\n**Última actualización:** 2026-11-21\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'
const SCRIPTS =
  '# Scripts\n\n## Abrir la app\nLa versión armada.\n**Ejecutar:** `dist/Alfa.exe`\n**Marca:** ejecutar · escritorio\n\n' +
  '## Armar la app\nArma la versión de uso.\n**Ejecutar:** `echo armada`\n**Marca:** armar\n'

async function proyecto(nombre: string, archivos: Record<string, string>) {
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(raiz, nombre, ruta, '..'), { recursive: true })
    await writeFile(join(raiz, nombre, ruta), texto)
  }
}

async function abrir(ancho: number, alto: number): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_CLAUDE: join(base, '.claude'),
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '60',
    IRIDIUM_FALSO_PREGUNTA: '1',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: ancho, height: alto })
  return { app, win }
}

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-t110-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  await armarCarpetaClaude(join(base, '.claude'), join(raiz, '.iridium', 'Skills'), join(base, 'afuera'))
  await proyecto('Alfa', { '.proyecto.json': ficha, 'docs/estado.md': estado, 'docs/scripts.md': SCRIPTS })
  await proyecto('Beta', { '.proyecto.json': ficha, 'docs/estado.md': estado })
  await mkdir(datos, { recursive: true })
  await writeFile(
    join(datos, 'config.json'),
    JSON.stringify({ version: 1, raiz, arranque: { prendido: true, hora: '03:00' } }),
  )
  // Lo que hizo el arranque de noche: empezó Beta y dejó una pregunta (el aviso al volver).
  const arranco = Date.now() - HORA
  await writeFile(
    join(datos, 'arranques.json'),
    JSON.stringify({
      version: 1,
      vistoHasta: null,
      programado: null,
      momentos: [
        {
          cuando: arranco,
          momento: 'hora',
          resultado: 'arranco',
          proyecto: { ruta: join(raiz, 'Beta'), nombre: 'Beta', preguntas: ['Q-1'] },
          sinUsarIridium: 5 * 3600,
        },
      ],
    }),
  )
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

type Caja = { x: number; y: number; width: number; height: number }
const seTocan = (a: Caja, b: Caja) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

/** Los avisos no se tapan entre sí, entran en la ventana y no tapan la conversación de al lado. */
async function revisarEsquina(win: Page, ancho: number, alto: number, esperados: number) {
  const avisos = win.locator('.aviso-flotante')
  await expect(avisos).toHaveCount(esperados)
  const cajas: Caja[] = []
  for (let i = 0; i < esperados; i++) {
    const c = await avisos.nth(i).boundingBox()
    expect(c).not.toBeNull()
    cajas.push(c as Caja)
  }
  for (const [i, c] of cajas.entries()) {
    expect(c.y, `el aviso ${i + 1} empieza dentro de la ventana`).toBeGreaterThanOrEqual(0)
    expect(c.y + c.height, `el aviso ${i + 1} termina dentro de la ventana`).toBeLessThanOrEqual(alto)
    expect(c.x + c.width).toBeLessThanOrEqual(ancho)
    for (const otra of cajas.slice(i + 1)) expect(seTocan(c, otra), 'dos avisos se pisan').toBe(false)
  }
  const chat = await win.locator('aside.chat').boundingBox()
  expect(chat).not.toBeNull()
  for (const c of cajas) expect(seTocan(c, chat as Caja), 'un aviso tapa la conversación').toBe(false)
}

for (const [ancho, alto] of [
  [1440, 900],
  [1024, 700],
] as const) {
  test(`los avisos de Arranque, Ejecutar y una conversación, juntos en la esquina (${ancho}×${alto})`, async () => {
    const { app, win } = await abrir(ancho, alto)
    await expect(win.getByRole('status', { name: 'Lo que hizo Iridium mientras no estabas' })).toBeVisible()

    // Alfa trabaja y se deja de mirar: al terminar, avisa (H-13).
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
    await campo.fill('Algo lento en Alfa')
    await campo.press('Enter')
    await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Trabajando')
    await win.keyboard.press('Control+1')

    // Ejecutar Alfa sin armar (AB-2): su aviso queda hasta cerrarlo.
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click({ button: 'right' })
    await win
      .getByRole('menu', { name: 'Acciones de Alfa' })
      .getByRole('menuitem', { name: 'Ejecutar Alfa' })
      .click()
    await expect(win.locator('.aviso-flotante', { hasText: 'Alfa todavía no está armada' })).toBeVisible()

    // El de la conversación se va solo a los 8 s: con el mouse encima, queda.
    const deAlfa = win.locator('.aviso-flotante', { hasText: 'Alfa terminó' })
    await expect(deAlfa).toBeVisible({ timeout: 15_000 })
    await deAlfa.hover()
    await win.screenshot({ path: `test-results/t110-grilla-${ancho}.png` })
    await revisarEsquina(win, ancho, alto, 3)
    // Los botones del pie, en una fila a la derecha (antes caían en la columna del ícono, uno debajo del otro).
    const abrirAlfa = await deAlfa.getByRole('button', { name: 'Abrir', exact: true }).boundingBox()
    const responder = await deAlfa.getByRole('button', { name: 'Responder en Alfa' }).boundingBox()
    expect(abrirAlfa?.y).toBe(responder?.y)
    expect((abrirAlfa?.x ?? 0) + (abrirAlfa?.width ?? 0)).toBeLessThan(responder?.x ?? 0)

    // Dentro de un proyecto, a la izquierda de su conversación.
    await win.locator('.tarjeta', { hasText: 'Beta' }).click()
    await expect(win.locator('[data-seccion]')).toBeVisible()
    // T-101: Beta no tiene conversación; la cabecera del chat va sin título, en una línea, con sus botones.
    await expect(win.locator('.cab-conv .nombre-conv b')).toHaveCount(0)
    await expect(win.locator('.cab-conv').getByRole('button', { name: 'Continuar' })).toBeVisible()
    expect((await win.locator('.cab-conv').boundingBox())?.height).toBe(48)
    await deAlfa.hover()
    await win.screenshot({ path: `test-results/t110-proyecto-${ancho}.png` })
    await revisarEsquina(win, ancho, alto, 3)
    await app.close()
  })
}
