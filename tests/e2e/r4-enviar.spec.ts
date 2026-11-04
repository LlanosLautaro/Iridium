// R-4: lo escrito en «Otro» o en la nota no se pierde al tocar Enviar, lo toque enseguida o justo cuando se guarda solo.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron, expect, test } from '@playwright/test'

let raiz: string
let datos: string
const DECISION = (n: number) => `- **Q-${n} — Elegí el tema ${n}**
  Tipo: decisión
  Opciones:
  A) Grafito
  B) Obsidiana`

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
  const qs = [1, 2, 3, 4, 5, 6].map(DECISION).join('\n\n')
  await writeFile(
    join(raiz, 'Alfa', 'docs', 'estado.md'),
    `# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n${qs}\n\n## Próximo paso\nAlgo.\n`,
  )
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 5 })
  await rm(datos, { recursive: true, force: true, maxRetries: 5 })
})

test('Enviar guarda lo escrito en Otro y en la nota, en cualquier momento (R-4)', async () => {
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
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  // Desde la entrada del proyecto, donde se dejó R-4.
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  // Otro proyecto cambia todo el tiempo (como una sesión trabajando): la lista se relee mientras se escribe y se envía.
  await mkdir(join(raiz, 'Beta', 'docs'), { recursive: true })
  let vuelta = 0
  const ruido = setInterval(() => {
    void writeFile(
      join(raiz, 'Beta', 'docs', 'estado.md'),
      `# Estado

## Próximo paso
Paso ${vuelta++}.
`,
    )
  }, 120)
  // Distintos momentos entre la última tecla y Enviar: antes, durante y después del guardado solo (400 ms).
  const esperas = [0, 100, 390, 420, 480, 900]
  for (const [i, espera] of esperas.entries()) {
    const n = i + 1
    const q = win.locator(`article.pend[data-q="Q-${n}"]`)
    await q
      .getByRole('textbox', { name: 'Otra respuesta' })
      .pressSequentially('A me parece la mejor', { delay: 30 })
    await q.locator('.fila-nota textarea').pressSequentially('más oscuro', { delay: 30 })
    await win.waitForTimeout(espera)
    await q.getByRole('button', { name: 'Enviar' }).click()
    await expect(q.locator('.meta')).toContainText('Respondida', { timeout: 10_000 })
    const texto = await readFile(join(raiz, 'Alfa', 'docs', 'respuestas', `Q-${n}.md`), 'utf8')
    expect(texto, `esperando ${espera} ms`).toContain('**Opción:** Otro: A me parece la mejor')
    expect(texto, `esperando ${espera} ms`).toContain('más oscuro')
    await expect(q.locator('.respuesta')).toContainText('A me parece la mejor')
  }
  clearInterval(ruido)
  await app.close()
})
