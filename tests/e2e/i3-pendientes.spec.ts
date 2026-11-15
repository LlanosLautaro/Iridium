// I-3: la Bandeja de entrada de cada proyecto con el motor falso (sin la Bandeja de todos, D-111): responder una
// decisión y una prueba (también a medias), «Ver entero» en Docs, cambiar algo afuera mientras se responde y Responder
// desde la conversación (H-9, H-10, H-11, F-3).
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { abrirPregunta } from './pregunta'

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
const estado = (preguntas: string) =>
  `# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n${preguntas}\n\n## Próximo paso\nSeguir.\n`

const ALFA = `- **Q-7 — ¿La miniatura muestra el modelo 3D o la textura plana?**
  Tipo: decisión · frena
  Contexto: D-032 (miniaturas), \`04-ux.md\` › W-14. Opciones: A) 3D (recomendada) · B) plana.
- **Q-8 — ¿I-4 (clasificar) funciona como esperabas?**
  Tipo: prueba
  Contexto: instalá la última versión (\`scripts.md\` › Abrir Iridium).
  - [ ] Abre la app sin errores
  - [ ] Clasifica en Pendientes
  - [ ] El número baja al responder`

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

/** La Bandeja de entrada de un proyecto, desde la grilla. */
async function bandeja(win: Page, nombre: string) {
  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: nombre }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: /^Bandeja de entrada/ })
    .click()
  await expect(win.locator('.zona-principal > .cab-proyecto h1')).toHaveText(nombre)
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await proyecto('Alfa', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado(ALFA),
    'docs/decisiones.md':
      '# Decisiones\n\n## D-032 — Miniaturas en la galería\nLas miniaturas se generan al importar, en segundo plano.\n',
    'docs/04-ux.md':
      '# UX\n\n## Pantallas\n\n### W-13 — Inicio\nLa portada.\n\n### W-14 — Galería\nGrilla de cuatro columnas con la miniatura de cada modelo.\n',
    'docs/scripts.md': '# Scripts\n\n## Abrir Iridium\nPara usarlo.\n\n**Ejecutar:** `x.exe`\n',
  })
  await proyecto('Beta', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado('- **Q-2 — ¿Por qué área empezamos?**\n  Opciones: A) Archivos · B) Notas.'),
  })
  await proyecto('Gestor', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado('- **Q-3 — ¿La 1.2.0 anda?**'),
    'docs/respuestas/Q-3.md': '# Q-3 — ¿La 1.2.0 anda?\n\nSí.\n',
  })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 5 })
  await rm(datos, { recursive: true, force: true, maxRetries: 5 })
})

test('los pendientes del proyecto con lo que citan y «Ver entero» en Docs (H-9)', async () => {
  const { app, win } = await abrir()
  // Alfa tiene preguntas: se entra por su Bandeja.
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(win.locator('.act.elegida')).toHaveAttribute('aria-label', /^Bandeja de entrada/)

  const q7 = win.locator('.pregunta[data-q="Q-7"]')
  await expect(q7.locator('.cab-q')).toContainText('decisión')
  await expect(q7.locator('.cab-q')).toContainText('Frena')
  // El contexto y las citas, plegados en «Mostrar detalles» (Q-62).
  await expect(q7.locator('.cita')).toHaveCount(0)
  await q7.getByRole('button', { name: 'Mostrar detalles · contexto y 2 citas' }).click()
  await expect(q7.locator('.cita').first()).toContainText('Las miniaturas se generan al importar')
  await expect(q7.locator('.cita').nth(1)).toContainText('Grilla de cuatro columnas')
  await expect(q7.locator('.opcion-q').first()).toContainText('recomendada')
  await expect(win.locator('.grupo-q .bloque-titulo')).toHaveText([/^Frenan el proyecto/, /^Sin responder/])
  await win.screenshot({ path: 'test-results/i3-pendientes.png' })

  // «Ver entero» abre el documento en Docs, en su sección; Atrás vuelve a la Bandeja.
  await q7.locator('.cita').nth(1).getByRole('button', { name: 'Ver entero' }).click()
  const docs = win.locator('[data-seccion="docs"]')
  await expect(docs.locator('.barra-doc .nom')).toHaveText('04-ux.md')
  await expect(docs.locator('[id="w-14"]')).toBeInViewport()
  await win.screenshot({ path: 'test-results/i3-ver-entero.png' })
  await win.keyboard.press('Alt+ArrowLeft')
  await expect(q7).toBeVisible()

  // Los códigos del contexto también llevan a su documento.
  await q7.locator('.contexto a', { hasText: 'D-032' }).click()
  await expect(docs.locator('.barra-doc .nom')).toHaveText('decisiones.md')
  await app.close()
})

test('responder una decisión y una prueba, también a medias (H-10, H-11, F-3)', async () => {
  const { app, win } = await abrir()
  await bandeja(win, 'Alfa')
  const q7 = win.locator('.pregunta[data-q="Q-7"]')
  const enviar7 = q7.getByRole('button', { name: 'Enviar' })
  await expect(enviar7).toBeDisabled()
  await q7.getByText('plana', { exact: true }).click()
  await q7.getByRole('textbox', { name: 'Nota' }).fill('Más liviana.')
  await enviar7.click()
  await expect(q7.locator('.cab-q')).toContainText('Respondida, sin procesar')
  expect(await readFile(join(raiz, 'Alfa', 'docs', 'respuestas', 'Q-7.md'), 'utf8')).toBe(
    '# Q-7 — ¿La miniatura muestra el modelo 3D o la textura plana?\n\n**Opción:** B) plana\n\nMás liviana.\n',
  )
  // Baja el total del inicio y la cuenta de la pestaña.
  await expect(win.getByRole('button', { name: /^Inicio/ })).toHaveAttribute(
    'aria-label',
    /^Inicio, 2 en la bandeja/,
  )
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' }).locator('.cuenta')).toHaveText('1')

  // La prueba: lo escrito sigue al ir a otro proyecto y volver.
  const q8 = win.locator('.pregunta[data-q="Q-8"]')
  await abrirPregunta(q8)
  // Tocar el texto del punto no lo marca: solo la casilla.
  await q8.getByText('Abre la app sin errores', { exact: true }).click()
  await expect(q8.getByRole('checkbox', { name: 'Abre la app sin errores' })).not.toBeChecked()
  await q8.getByRole('checkbox', { name: 'Abre la app sin errores' }).check()
  // Una nota larga crece hacia abajo en vez de correrse a un costado.
  const nota = q8.getByRole('textbox', { name: 'Nota general' })
  const alto = (await nota.boundingBox())?.height ?? 0
  await nota.fill('Una nota larga '.repeat(30))
  expect((await nota.boundingBox())?.height ?? 0).toBeGreaterThan(alto * 2)
  await nota.fill('')
  await q8.getByRole('textbox', { name: 'Nota de: Clasifica en Pendientes' }).fill('no aparece la tarjeta')
  await bandeja(win, 'Beta')
  await bandeja(win, 'Alfa')
  await expect(q8.getByRole('checkbox', { name: 'Abre la app sin errores' })).toBeChecked()

  // A medias: se guarda solo (sin «Guardar a medias», T-58) y queda en Iridium, no en el proyecto.
  await expect(q8.getByRole('button', { name: 'Guardar a medias' })).toHaveCount(0)
  await expect(q8).not.toContainText('Se guarda en respuestas/')
  expect(await readdir(join(raiz, 'Alfa', 'docs', 'respuestas'))).toEqual(['Q-7.md'])
  await win.screenshot({ path: 'test-results/i3-a-medias.png' })

  await q8.getByRole('checkbox', { name: 'El número baja al responder' }).check()
  await q8.getByRole('button', { name: 'Enviar' }).click()
  await expect(q8.locator('.cab-q')).toContainText('Respondida, sin procesar')
  expect(await readFile(join(raiz, 'Alfa', 'docs', 'respuestas', 'Q-8.md'), 'utf8')).toBe(
    [
      '# Q-8 — ¿I-4 (clasificar) funciona como esperabas?',
      '',
      '- [x] Abre la app sin errores',
      '- [ ] Clasifica en Pendientes — no aparece la tarjeta',
      '- [x] El número baja al responder',
      '',
    ].join('\n'),
  )

  // Corregir una respondida (plegada al pasar a Respondidas).
  await abrirPregunta(q7)
  await q7.getByRole('button', { name: 'Corregir' }).click()
  await q7.getByText('3D', { exact: true }).click()
  await q7.getByRole('button', { name: 'Enviar' }).click()
  await expect(q7.locator('.resumen-q')).toContainText('3D')
  expect(await readFile(join(raiz, 'Alfa', 'docs', 'respuestas', 'Q-7.md'), 'utf8')).toContain('A) 3D')
  await app.close()
})

test('si la respuesta cambió afuera, pregunta antes de reemplazarla', async () => {
  const { app, win } = await abrir()
  await bandeja(win, 'Beta')
  const q2 = win.locator('.pregunta[data-q="Q-2"]')
  await q2.getByText('Notas', { exact: true }).click()
  // Mientras tanto, alguien la responde desde el Gestor.
  await mkdir(join(raiz, 'Beta', 'docs', 'respuestas'), { recursive: true })
  await writeFile(
    join(raiz, 'Beta', 'docs', 'respuestas', 'Q-2.md'),
    '# Q-2 — ¿Por qué área empezamos?\n\n**Opción:** A) Archivos\n',
  )
  await q2.getByRole('button', { name: 'Enviar' }).click()
  await expect(q2.locator('.recuadro.aviso')).toContainText('La respuesta cambió fuera de Iridium')
  await expect(q2.locator('.recuadro.aviso')).toContainText('Archivos')
  await win.screenshot({ path: 'test-results/i3-cambio-afuera.png' })
  await q2.getByRole('button', { name: 'Reemplazar con la mía' }).click()
  await expect(q2.locator('.cab-q')).toContainText('Respondida, sin procesar')
  expect(await readFile(join(raiz, 'Beta', 'docs', 'respuestas', 'Q-2.md'), 'utf8')).toContain('B) Notas')
  await app.close()
})

test('Responder en la conversación y la Bandeja de entrada llevan a las preguntas del proyecto', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_PREGUNTA: '1' })
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  const secciones = win.getByRole('navigation', { name: 'Secciones del proyecto' })
  await secciones.getByRole('button', { name: 'Mapa' }).click()
  await secciones.getByRole('button', { name: /^Bandeja de entrada/ }).click()
  await expect(win.locator('.zona-principal > .cab-proyecto h1')).toHaveText('Beta')
  await expect(win.locator('.resumen .pregunta').first()).toBeVisible()

  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: 'Gestor' }).click()
  await win.locator('.cab-conv').getByRole('button', { name: 'Continuar' }).click()
  await win.locator('.pedido').getByRole('button', { name: 'Responder' }).click()
  await expect(win.locator('.zona-principal > .cab-proyecto h1')).toHaveText('Gestor')
  await expect(win.locator('.resumen .pregunta[data-q="Q-4"]')).toContainText(
    '¿La prueba del motor falso funciona?',
  )
  await app.close()
})

test('sin nada que responder: «Nada en tu bandeja»', async () => {
  await rm(join(raiz, 'Alfa'), { recursive: true })
  await rm(join(raiz, 'Beta'), { recursive: true })
  await rm(join(raiz, 'Gestor'), { recursive: true })
  await proyecto('Alfa', { '.proyecto.json': ficha, 'docs/estado.md': estado('(ninguna)') })
  const { app, win } = await abrir()
  await bandeja(win, 'Alfa')
  await expect(win.locator('[data-seccion="pendientes"]')).toContainText('Nada en tu bandeja')
  await app.close()
})
