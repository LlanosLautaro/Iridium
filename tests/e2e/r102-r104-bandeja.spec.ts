// Los comentarios R-102 a R-104 con la app abierta y el motor falso: las pestañas de proyectos se ordenan
// arrastrándolas y el orden queda al volver a abrir (R-102); el ícono de la Bandeja lleva un punto si algo espera,
// ámbar si frena (R-103); en la Bandeja la pregunta más nueva va arriba, todas abiertas, y la que se pliega queda
// plegada al volver a abrir (R-104).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let abiertas: ElectronApplication[] = []

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})

const estado = (preguntas: string) => `# Estado del proyecto

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 10 | Operación | en curso | \`10-operacion.md\` |

## Preguntas abiertas
${preguntas}
## Próximo paso
Seguir.
`

const ALFA = estado(`- **Q-2 — Elegí el color del botón**
  Tipo: decisión
  Opciones: A) Verde · B) Gris
- **Q-3 — Probá la búsqueda**
  Tipo: prueba
  - [ ] Buscar «gato» muestra las fotos de gatos
- **Q-1 — Elegí el nombre**
  Tipo: decisión · frena
  Opciones: A) Alfa · B) Beta
`)

const BETA = estado(`- **Q-1 — Elegí el ícono**
  Tipo: decisión
  Opciones: A) Uno · B) Dos
`)

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abiertas.push(app)
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

async function cerrar(app: ElectronApplication) {
  await app.close()
  abiertas = abiertas.filter((a) => a !== app)
}

const pestanas = (win: Page) => win.getByRole('tablist', { name: 'Proyectos abiertos' })

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  for (const [nombre, texto] of Object.entries({ Alfa: ALFA, Beta: BETA })) {
    await mkdir(join(raiz, nombre, 'docs'), { recursive: true })
    await writeFile(join(raiz, nombre, '.proyecto.json'), ficha)
    await writeFile(join(raiz, nombre, 'docs', 'README.md'), '# Docs\n\n**Framework:** 2026-11-17\n')
    await writeFile(join(raiz, nombre, 'docs', 'estado.md'), texto)
    await writeFile(join(raiz, nombre, 'docs', '10-operacion.md'), '# Operación\n')
  }
})

test.afterEach(async () => {
  await Promise.all(abiertas.map((a) => a.close().catch(() => {})))
  abiertas = []
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('las pestañas se ordenan arrastrándolas y el orden queda al volver a abrir (R-102)', async () => {
  const { app, win } = await abrir()
  for (const nombre of ['Alfa', 'Beta']) {
    await win.locator('.tarjeta', { hasText: nombre }).click()
    await win.getByRole('button', { name: /^Inicio/ }).click()
  }
  const nombres = pestanas(win).locator('.nom')
  await expect(nombres).toHaveText(['Alfa', 'Beta'])
  // Beta, sobre la mitad izquierda de Alfa: queda antes.
  const alfa = pestanas(win).locator('.proy', { hasText: 'Alfa' })
  await pestanas(win)
    .locator('.proy', { hasText: 'Beta' })
    .dragTo(alfa, { targetPosition: { x: 8, y: 10 } })
  await expect(nombres).toHaveText(['Beta', 'Alfa'])
  await win.screenshot({ path: 'test-results/r102-pestanas.png' })
  // Pulido (D-197): mientras se arrastra, la otra se corre para dejarle lugar; Escape la vuelve a su lugar.
  const beta = pestanas(win).locator('.proy', { hasText: 'Beta' })
  const cajaBeta = await beta.boundingBox()
  const cajaAlfa = await pestanas(win).locator('.proy', { hasText: 'Alfa' }).boundingBox()
  if (!cajaBeta || !cajaAlfa) throw new Error('sin pestañas')
  await win.mouse.move(cajaBeta.x + 10, cajaBeta.y + 10)
  await win.mouse.down()
  await win.mouse.move(cajaAlfa.x + cajaAlfa.width - 4, cajaBeta.y + 10, { steps: 6 })
  await expect(beta).toHaveClass(/arrastrada/)
  await expect
    .poll(() =>
      pestanas(win)
        .locator('.proy', { hasText: 'Alfa' })
        .evaluate((x) => (x as HTMLElement).style.transform),
    )
    .toMatch(/translateX\(-/)
  await win.screenshot({ path: 'test-results/pu2-pestanas-arrastrando.png' })
  await win.keyboard.press('Escape')
  await win.mouse.up()
  await expect(beta).not.toHaveClass(/arrastrada/)
  await expect(nombres).toHaveText(['Beta', 'Alfa'])
  // Un clic sigue eligiendo la pestaña.
  await pestanas(win).locator('.proy', { hasText: 'Alfa' }).getByRole('tab').click()
  await expect(pestanas(win).locator('.proy', { hasText: 'Alfa' })).toHaveClass(/elegido/)
  await cerrar(app)

  const otra = await abrir()
  await expect(pestanas(otra.win).locator('.nom')).toHaveText(['Beta', 'Alfa'])
})

test('el ícono de la Bandeja lleva un punto si algo espera, ámbar si frena (R-103)', async () => {
  const { win } = await abrir()
  const bandeja = () =>
    win
      .getByRole('navigation', { name: 'Secciones del proyecto' })
      .getByRole('button', { name: /^Bandeja de entrada/ })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(bandeja()).toHaveAccessibleName('Bandeja de entrada, 3 sin responder')
  await expect(bandeja().locator('.punto.ambar')).toHaveCount(1)
  // Beta tiene una que no frena: el punto, gris.
  await win.getByRole('button', { name: /^Inicio/ }).click()
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(bandeja().locator('.punto')).toHaveCount(1)
  await expect(bandeja().locator('.punto.ambar')).toHaveCount(0)
})

test('la más nueva arriba, todas abiertas, y la que se pliega queda plegada al volver a abrir (R-104)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const preguntas = win.locator('.pendientes .pregunta')
  // Q-1 frena y va en su grupo, arriba; en «Sin responder», la más nueva primero.
  await expect(preguntas.locator('.cab-q .cuenta')).toHaveText(['Q-1', 'Q-3', 'Q-2'])
  const titulo = (q: string) => win.locator(`.pregunta[data-q="${q}"] .titulo-q`)
  for (const q of ['Q-1', 'Q-2', 'Q-3']) await expect(titulo(q)).toHaveAttribute('aria-expanded', 'true')
  await titulo('Q-2').click()
  await expect(titulo('Q-2')).toHaveAttribute('aria-expanded', 'false')
  await win.screenshot({ path: 'test-results/r104-bandeja.png' })
  await cerrar(app)

  // Al volver a abrir, Iridium vuelve al proyecto que estaba abierto (D-060).
  const otra = await abrir()
  const tarjeta = otra.win.locator('.tarjeta', { hasText: 'Alfa' })
  await otra.win.locator('.pendientes .pregunta').first().or(tarjeta).waitFor()
  if (await tarjeta.isVisible()) await tarjeta.click()
  const titulo2 = (q: string) => otra.win.locator(`.pregunta[data-q="${q}"] .titulo-q`)
  await expect(titulo2('Q-2')).toHaveAttribute('aria-expanded', 'false')
  await expect(titulo2('Q-3')).toHaveAttribute('aria-expanded', 'true')
  // Se vuelve a abrir desde su título.
  await titulo2('Q-2').click()
  await expect(titulo2('Q-2')).toHaveAttribute('aria-expanded', 'true')
})
