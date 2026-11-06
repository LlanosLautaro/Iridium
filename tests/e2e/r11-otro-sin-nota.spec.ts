// R-11: «Otro» con lo escrito en su campo (con un Enter en el medio) y sin nota queda respondida: antes el archivo se
// guardaba, pero al releerlo la pregunta volvía a aparecer vacía.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron, expect, test } from '@playwright/test'

let raiz: string
let datos: string

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(
    join(raiz, 'Alfa', '.proyecto.json'),
    JSON.stringify({
      version: 1,
      descripcion: 'x',
      estado: 'en-desarrollo',
      etiquetas: [],
      icono: null,
      archivado: false,
      reemplazadoPor: null,
    }),
  )
  await writeFile(
    join(raiz, 'Alfa', 'docs', 'estado.md'),
    `# Estado

## Hito actual
7 — Construcción

## Preguntas abiertas
- **Q-1 — Elegí el tema**
  Tipo: decisión
  Opciones: A) Grafito (recomendada) · B) Obsidiana

## Próximo paso
Algo.
`,
  )
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 5 })
  await rm(datos, { recursive: true, force: true, maxRetries: 5 })
})

test('Otro sin nota, con un Enter en el medio, queda respondida con lo escrito (R-11)', async () => {
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
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const q = win.locator('article.pend[data-q="Q-1"]')
  const campo = q.getByRole('textbox', { name: 'Otra respuesta' })
  await campo.pressSequentially('Algo como bandeja', { delay: 20 })
  await campo.press('Enter')
  await campo.pressSequentially('de entrada', { delay: 20 })
  await q.getByRole('button', { name: 'Enviar' }).click()
  await expect(q.locator('.meta')).toContainText('Respondida', { timeout: 10_000 })
  await expect(q.locator('.respuesta')).toContainText('Algo como bandeja de entrada')
  const texto = await readFile(join(raiz, 'Alfa', 'docs', 'respuestas', 'Q-1.md'), 'utf8')
  expect(texto).toContain('**Opción:** Otro: Algo como bandeja de entrada')
  // Corregir la trae de vuelta con lo escrito.
  await q.getByRole('button', { name: 'Corregir' }).click()
  await expect(q.getByRole('textbox', { name: 'Otra respuesta' })).toHaveValue('Algo como bandeja de entrada')
  await app.close()
})
