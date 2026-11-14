// I-3: Pendientes con el motor falso: la columna de proyectos, responder una decisión y una prueba (también a
// medias), «Ver entero» en el panel, cambiar algo afuera mientras se responde, Seguí resaltado y Responder desde la
// conversación (H-9, H-10, H-11, F-3).
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
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

test('la columna, los pendientes con lo que citan y «Ver entero» en el panel (H-9)', async () => {
  const { app, win } = await abrir()
  await win
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('button', { name: /^Bandeja de entrada/ })
    .click()
  const columna = win.locator('.columna')
  // Primero el que tiene alguno que frena; aparte, el que solo tiene respondidas sin procesar.
  await expect(columna.locator('.proy')).toHaveText([/Alfa.*2/, /Beta.*1/, /Gestor.*1/])
  await expect(columna.locator('.seccion')).toHaveText('Respondidas, sin procesar')
  await expect(columna.locator('.titulo .n')).toHaveText('3')
  await expect(win.locator('.principal-pend .cab-seccion h2')).toHaveText('Alfa')

  const q7 = win.locator('.pend[data-q="Q-7"]')
  await expect(q7.locator('.meta')).toContainText('decisión')
  await expect(q7.locator('.meta')).toContainText('Frena')
  // El contexto y las citas, plegados en «Mostrar detalles» (Q-62).
  await expect(q7.locator('.cita')).toHaveCount(0)
  await q7.getByRole('button', { name: 'Mostrar detalles (contexto y 2 citas)' }).click()
  await expect(q7.locator('.cita').first()).toContainText('Las miniaturas se generan al importar')
  await expect(q7.locator('.cita').nth(1)).toContainText('Grilla de cuatro columnas')
  await expect(q7.locator('.opcion-radio').first()).toContainText('recomendada')
  await expect(win.locator('.grupo')).toHaveText(['Frenan el proyecto', 'Sin responder'])
  await win.screenshot({ path: 'test-results/i3-pendientes.png' })

  await q7.locator('.cita').nth(1).getByRole('button', { name: 'Ver entero' }).click()
  const panel = win.locator('.panel-doc')
  await expect(panel.locator('.ruta')).toHaveText('04-ux.md')
  await expect(panel.locator('.marcada')).toHaveText('W-14 — Galería')
  await expect(panel).toContainText('W-13 — Inicio')
  await win.screenshot({ path: 'test-results/i3-ver-entero.png' })
  await win.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)

  // Los códigos del contexto también abren el panel.
  await q7.locator('.contexto a', { hasText: 'D-032' }).click()
  await expect(panel.locator('.ruta')).toHaveText('decisiones.md')
  await app.close()
})

test('responder una decisión y una prueba, también a medias; Seguí resaltado al final (H-10, H-11, F-3)', async () => {
  const { app, win } = await abrir()
  await win
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('button', { name: /^Bandeja de entrada/ })
    .click()
  const q7 = win.locator('.pend[data-q="Q-7"]')
  const enviar7 = q7.getByRole('button', { name: 'Enviar' })
  await expect(enviar7).toBeDisabled()
  await q7.getByText('plana', { exact: true }).click()
  await q7.getByRole('textbox', { name: 'Nota' }).fill('Más liviana.')
  await enviar7.click()
  await expect(q7.locator('.meta')).toContainText('Respondida, sin procesar')
  expect(await readFile(join(raiz, 'Alfa', 'docs', 'respuestas', 'Q-7.md'), 'utf8')).toBe(
    '# Q-7 — ¿La miniatura muestra el modelo 3D o la textura plana?\n\n**Opción:** B) plana\n\nMás liviana.\n',
  )
  // Baja el total del inicio y el número de la columna, que se reordena; la vista sigue en Alfa.
  await expect(win.getByRole('button', { name: /^Inicio/ }).locator('.cuenta-bandeja')).toHaveText('2')
  await expect(win.locator('.proy', { hasText: 'Alfa' })).toContainText('1')
  await expect(win.locator('.principal-pend .cab-seccion h2')).toHaveText('Alfa')

  // La prueba: lo escrito sigue al ir a otro proyecto y volver.
  const q8 = win.locator('.pend[data-q="Q-8"]')
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
  await win.locator('.proy', { hasText: 'Beta' }).click()
  await expect(win.locator('.principal-pend .cab-seccion h2')).toHaveText('Beta')
  await win.locator('.proy', { hasText: 'Alfa' }).click()
  await expect(q8.getByRole('checkbox', { name: 'Abre la app sin errores' })).toBeChecked()

  // A medias: queda en Iridium, no en el proyecto.
  await q8.getByRole('button', { name: 'Guardar a medias' }).click()
  await expect(q8.locator('.meta')).toContainText('A medias')
  await expect(win.locator('.grupo')).toHaveText(['A medias', 'Respondidas, sin procesar'])
  expect(await readdir(join(raiz, 'Alfa', 'docs', 'respuestas'))).toEqual(['Q-7.md'])
  await win.screenshot({ path: 'test-results/i3-a-medias.png' })

  await q8.getByRole('checkbox', { name: 'El número baja al responder' }).check()
  await q8.getByRole('button', { name: 'Enviar' }).click()
  await expect(q8.locator('.meta')).toContainText('Respondida, sin procesar')
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

  // Nada sin responder: Seguí resaltado; arranca la sesión sin abrir el proyecto.
  const segui = win.locator('.principal-pend .cab-seccion').getByRole('button', { name: 'Seguí' })
  await expect(segui).toHaveClass(/principal/)
  await expect(win.locator('.principal-pend .cab-seccion .cuenta-bandeja')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/i3-todo-respondido.png' })
  await segui.click()
  await expect(win.locator('.principal-pend .cab-seccion')).toContainText('La IA trabaja')
  await expect(win.locator('.ses', { hasText: 'Alfa' })).toContainText('Trabajando')
  await expect(win.locator('.principal-pend .cab-seccion h2')).toHaveText('Alfa')

  // Corregir una respondida.
  await q7.getByRole('button', { name: 'Corregir' }).click()
  await q7.getByText('3D', { exact: true }).click()
  await q7.getByRole('button', { name: 'Enviar' }).click()
  await expect(q7.locator('.respuesta')).toContainText('3D')
  expect(await readFile(join(raiz, 'Alfa', 'docs', 'respuestas', 'Q-7.md'), 'utf8')).toContain('A) 3D')
  // Con la IA trabajando, cerrar pregunta (F-6): se espera a que termine.
  await expect(win.locator('.ses', { hasText: 'Alfa' })).not.toContainText('Trabajando')
  await app.close()
})

test('si la respuesta cambió afuera, pregunta antes de reemplazarla', async () => {
  const { app, win } = await abrir()
  await win
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('button', { name: /^Bandeja de entrada/ })
    .click()
  await win.locator('.proy', { hasText: 'Beta' }).click()
  const q2 = win.locator('.pend[data-q="Q-2"]')
  await q2.getByText('Notas', { exact: true }).click()
  // Mientras tanto, alguien la responde desde el Gestor.
  await mkdir(join(raiz, 'Beta', 'docs', 'respuestas'), { recursive: true })
  await writeFile(
    join(raiz, 'Beta', 'docs', 'respuestas', 'Q-2.md'),
    '# Q-2 — ¿Por qué área empezamos?\n\n**Opción:** A) Archivos\n',
  )
  await q2.getByRole('button', { name: 'Enviar' }).click()
  await expect(q2.locator('.falla.cambio')).toContainText('La respuesta cambió fuera de Iridium')
  await expect(q2.locator('.falla.cambio')).toContainText('Archivos')
  await win.screenshot({ path: 'test-results/i3-cambio-afuera.png' })
  await q2.getByRole('button', { name: 'Reemplazar con la mía' }).click()
  await expect(q2.locator('.meta')).toContainText('Respondida, sin procesar')
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
  await expect(win.locator('.resumen .pend').first()).toBeVisible()

  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: 'Gestor' }).click()
  await win.locator('.chat-cab').getByRole('button', { name: 'Seguí' }).click()
  await win.locator('.pedido').getByRole('button', { name: 'Responder' }).click()
  await expect(win.locator('.zona-principal > .cab-proyecto h1')).toHaveText('Gestor')
  await expect(win.locator('.resumen .pend[data-q="Q-4"]')).toContainText(
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
  await win
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('button', { name: /^Bandeja de entrada/ })
    .click()
  await expect(win.locator('.mensaje h2')).toHaveText('Nada en tu bandeja')
  await app.close()
})
