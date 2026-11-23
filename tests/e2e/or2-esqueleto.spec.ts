// OR-I2 con la app abierta y el motor falso: el esqueleto de un proyecto (04-ux.md › W-3). La barra en dos grupos, lo
// que se sigue y el proyecto por dentro, y por dónde se entra: a la Bandeja si hay algo, si no al Mapa, y una carpeta
// sin docs/estado.md, a Archivos. Después, como se lo dejó.
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

**Última actualización:** 2026-11-07

## Hito actual
7 — Construcción — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 7 | Construcción | en curso | \`07-construccion.md\` |

## Preguntas abiertas
${preguntas}

## Próximo paso
Hacer la grilla.
`

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
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
  await proyecto('Alfa', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado(`- **Q-1 — ¿Lista o grilla?**
  Tipo: decisión
  Contexto: la pantalla principal.
  Opciones: A) Lista (recomendada: entra más) · B) Grilla`),
  })
  await proyecto('Beta', { '.proyecto.json': ficha, 'docs/estado.md': estado('(ninguna)') })
  await proyecto('Gamma', { '.proyecto.json': ficha, 'notas.txt': 'Una carpeta sin documentos.' })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

/** Lo que tiene la barra del proyecto, en orden: el nombre de cada botón y «—» por la línea. */
async function barra(win: Page): Promise<string[]> {
  return win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .locator(':scope > *')
    .evaluateAll((els) =>
      els.map((e) => (e.classList.contains('sep') ? '—' : (e.getAttribute('aria-label') ?? ''))),
    )
}

test('la barra en dos grupos y se entra a la Bandeja si hay algo, si no al Mapa; después, como se lo dejó', async () => {
  const { app, win } = await abrir()
  const actual = win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .locator('[aria-current="page"]')

  // Alfa tiene una pregunta: entra a su Bandeja.
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(actual).toHaveAttribute('aria-label', /^Bandeja de entrada/)
  await expect(win.locator('[data-seccion="pendientes"] .pregunta')).toHaveCount(1)
  // El ícono de la Bandeja dice cuántas esperan (R-103).
  expect(await barra(win)).toEqual([
    'Bandeja de entrada, 1 sin responder',
    'Frentes',
    'Ideas',
    'Revisión',
    'Diseño',
    '—',
    'Docs',
    'Archivos',
    'Git',
    'Scripts',
    'Ajustes',
  ])
  await win.screenshot({ path: 'test-results/or2-esqueleto-alfa.png' })

  // Beta no tiene nada en la bandeja: entra al Mapa.
  await win.locator('button.boton-menu').click()
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(actual).toHaveAttribute('aria-label', 'Frentes')
  await expect(win.locator('[data-seccion="mapa"]')).toBeVisible()
  await win.screenshot({ path: 'test-results/or2-esqueleto-beta.png' })

  // Se va a Docs, se vuelve al inicio y a Beta: sigue en Docs.
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Docs' })
    .click()
  await win.locator('button.boton-menu').click()
  await win.locator('.barra-proyectos .proy', { hasText: 'Beta' }).getByRole('tab').click()
  await expect(actual).toHaveAttribute('aria-label', 'Docs')
  await app.close()
})

test('el botón de inicio lleva siempre a Proyectos, aunque se viniera de Skills (R-62)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await win.keyboard.press('Control+2')
  await expect(win.getByRole('navigation', { name: 'Skills' })).toBeVisible()
  await win.locator('.barra-proyectos .proy', { hasText: 'Beta' }).getByRole('tab').click()
  await win.locator('button.boton-menu').click()
  await expect(win.locator('.tarjeta', { hasText: 'Beta' })).toBeVisible()
  await expect(win.locator('button.boton-menu')).toHaveAttribute('aria-current', 'page')
  await app.close()
})

test('una carpeta sin docs/estado.md entra a Archivos', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Gamma' }).click()
  await expect(
    win.getByRole('navigation', { name: 'Secciones del proyecto' }).locator('[aria-current="page"]'),
  ).toHaveAttribute('aria-label', 'Archivos')
  await expect(win.locator('[data-seccion="archivos"]')).toContainText('notas.txt')
  await app.close()
})
