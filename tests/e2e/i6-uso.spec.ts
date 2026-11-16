// I-6 con la app abierta y el motor falso: el uso en la barra de estado con su detalle (H-12, R-1), el contexto, el
// modelo y el esfuerzo de la conversación (C-58), los errores del motor (F-5), los avisos de los proyectos que no
// están a la vista (H-13) y cerrar con sesiones trabajando (F-6).
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
const estado =
  '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nHacer la grilla.\n'

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '120',
    IRIDIUM_REVISION: 'no',
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

/** Manda un mensaje en la conversación del proyecto abierto y espera a que la IA termine. */
async function mandar(win: Page, texto: string, fin = 'Terminada') {
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill(texto)
  await campo.press('Enter')
  await expect(win.locator('.barra-proyectos .proy.elegido')).toContainText(fin)
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

test('el uso en la barra de estado, con su detalle; se actualiza con cada respuesta (H-12, R-1)', async () => {
  const { app, win } = await abrir()
  const barra = win.locator('.estado-barra .uso')
  await expect(barra).toContainText('5 h')
  await expect(barra).toContainText('34 %')
  await expect(barra).toContainText('Semana')
  await expect(barra).toContainText('61 %')

  await barra.getByRole('button').click()
  const detalle = win.locator('.detalle-uso')
  await expect(detalle).toContainText('Ventana de 5 horas')
  await expect(detalle).toContainText(/Se libera (hoy|mañana) a las/)
  await expect(detalle).toContainText('Ritmo de la semana')
  // 61 % en 4 días: unos 15 % por día; quedan 39 % para 3 días (13 % por día): no alcanza.
  await expect(detalle.locator('.ritmo')).toContainText('15 % por día')
  await expect(detalle.locator('.ritmo')).toContainText('se agota')
  await win.screenshot({ path: 'test-results/i6-uso.png' })
  await win.keyboard.press('Escape')
  await expect(detalle).toHaveCount(0)

  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await mandar(win, 'Hacé la grilla')
  await expect(barra).toContainText('36 %')
  await app.close()
})

test('el contexto de la conversación y el modelo y el esfuerzo del proyecto, que se recuerdan (C-58)', async () => {
  let { app, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '30' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await mandar(win, 'Hacé la grilla')
  // El contexto es un círculo con los tokens y lo que le queda a la caché (Q-77).
  const ctx = win.locator('.compositor .medidor-ctx')
  await expect(ctx).toContainText('50k/200k')
  await expect(ctx).toContainText('1 h')

  // Sin elegir, se ve lo que usa Claude Code: el modelo de verdad y su esfuerzo (Q-77).
  await expect(win.locator('.compositor .ajustes-ia')).toContainText('Opus')
  await expect(win.locator('.compositor .ajustes-ia')).toContainText('Medio')
  await win.locator('.compositor').getByRole('button', { name: 'Opus' }).click()
  await expect(win.getByRole('menuitemradio', { name: /Predeterminado \(Opus\)/ })).toBeVisible()
  await win.getByRole('menuitemradio', { name: /^Opus/ }).click()
  await win.locator('.compositor').getByRole('button', { name: 'Medio' }).click()
  await expect(win.getByRole('menuitemradio', { name: /Predeterminado \(Medio\)/ })).toBeVisible()
  await expect(win.getByRole('menuitemradio', { name: /Máximo/ })).toBeVisible()
  await win.getByRole('menuitemradio', { name: /^Alto/ }).click()
  await expect(win.locator('.compositor .ajustes-ia')).toContainText('Opus')
  await expect(win.locator('.compositor .ajustes-ia')).toContainText('Alto')
  // Haiku no tiene niveles de esfuerzo: el esfuerzo vuelve al de Claude Code y el selector se apaga.
  await win.locator('.compositor').getByRole('button', { name: 'Opus' }).click()
  await win.getByRole('menuitemradio', { name: /Haiku/ }).click()
  await expect(win.locator('.compositor').getByRole('button', { name: 'Esfuerzo' })).toBeDisabled()
  await win.locator('.compositor').getByRole('button', { name: 'Haiku' }).click()
  await win.getByRole('menuitemradio', { name: /^Opus/ }).click()
  await win.locator('.compositor').getByRole('button', { name: 'Medio' }).click()
  await win.getByRole('menuitemradio', { name: /^Alto/ }).click()

  // Cuatro turnos más: 170 000 de 200 000 tokens, 85 %: se marca y sugiere Nueva.
  for (const n of [1, 2, 3, 4]) await mandar(win, `Seguí ${n}`)
  await expect(ctx).toContainText('170k/200k')
  await expect(ctx).toHaveAttribute('data-nivel', 'critica')
  // Tocándolo, el detalle: los tokens, el desglose y la caché.
  await ctx.click()
  const detalle = win.locator('.detalle-ctx')
  await expect(detalle).toContainText('170.000 de 200.000 tokens')
  await expect(detalle.locator('.desglose')).toContainText('La conversación')
  await expect(detalle.locator('.desglose')).toContainText('CLAUDE.md y memoria')
  await expect(detalle.locator('.cache')).toContainText('Vence en 1 h')
  await win.waitForTimeout(300)
  await win.screenshot({ path: 'test-results/d060-contexto.png' })
  await win.keyboard.press('Escape')
  await expect(win.locator('.contexto-alto')).toContainText('85 % del contexto')
  await win.screenshot({ path: 'test-results/i6-conversacion.png' })
  await win.locator('.contexto-alto').getByRole('button', { name: 'Nueva' }).click()
  await expect(win.locator('.cab-conv')).toContainText('Conversación nueva')
  await expect(ctx).toHaveCount(0)

  // Beta no eligió nada: usa los de Claude Code.
  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(win.locator('.compositor .ajustes-ia')).toContainText('Opus')
  await expect(win.locator('.compositor .ajustes-ia')).toContainText('Medio')
  await win.keyboard.press('Control+1')
  await app.close()

  const config = JSON.parse(await readFile(join(datos, 'config.json'), 'utf8'))
  expect(config.ajustesIa[join(raiz, 'Alfa')]).toEqual({ modelo: 'opus', esfuerzo: 'high' })
  ;({ app, win } = await abrir())
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(win.locator('.compositor .ajustes-ia')).toContainText('Opus')
  await expect(win.locator('.compositor .ajustes-ia')).toContainText('Alto')
  await app.close()
})

test('con el panel angosto, Detener no tapa el medidor del contexto (DI-I3, tanda 5)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '30' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await mandar(win, 'Hacé la grilla')
  // El panel en su ancho mínimo: 300 px.
  const chat = win.locator('aside.chat')
  const divisor = win.getByRole('separator', { name: /Ancho de la conversación/ })
  const caja = await divisor.boundingBox()
  if (!caja) throw new Error('sin divisor')
  await win.mouse.move(caja.x + 2, caja.y + 200)
  await win.mouse.down()
  await win.mouse.move(caja.x + 200, caja.y + 200, { steps: 5 })
  await win.mouse.up()
  await expect(chat).toHaveJSProperty('offsetWidth', 300)

  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Algo lento')
  await campo.press('Enter')
  const detener = win.locator('.compositor').getByRole('button', { name: 'Detener' })
  await expect(detener).toBeVisible()
  const ctx = await win.locator('.compositor .medidor-ctx').boundingBox()
  const det = await detener.boundingBox()
  if (!ctx || !det) throw new Error('sin medidor o sin Detener')
  const sePisan =
    ctx.x < det.x + det.width &&
    det.x < ctx.x + ctx.width &&
    ctx.y < det.y + det.height &&
    det.y < ctx.y + ctx.height
  expect(sePisan).toBe(false)
  // Todo dentro del cuadro.
  const comp = await win.locator('.compositor').boundingBox()
  if (!comp) throw new Error('sin compositor')
  expect(det.x + det.width).toBeLessThanOrEqual(comp.x + comp.width)
  await win.locator('.compositor').screenshot({ path: 'test-results/t5-detener-angosto.png' })
  await win.screenshot({ path: 'test-results/t5-conversacion-angosta.png' })
  await detener.click()
  await app.close()
})

test('sin sesión de Claude Code no se envía nada y Reintentar lo vuelve a mandar (F-5)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_ESTADO: 'sin-sesion' })
  await expect(win.locator('.estado-barra')).toContainText('Claude sin sesión')
  await expect(win.locator('.estado-barra .uso')).toHaveCount(0)
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Hacé la grilla')
  await campo.press('Enter')
  const falla = win.locator('.falla-ia')
  await expect(falla).toContainText('Claude Code no tiene sesión iniciada')
  await expect(falla).toContainText('No se envió nada')
  await expect(falla).toContainText('«Hacé la grilla»')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).not.toContainText('Trabajando')
  await win.screenshot({ path: 'test-results/i6-sin-sesion.png' })
  await falla.getByRole('button', { name: 'Reintentar' }).click()
  await expect(falla).toHaveCount(2)
  await app.close()
})

test('Iniciar sesión desde Iridium: el chip y el aviso abren el login y después Reintentar manda (CO-I1)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_ESTADO: 'sin-sesion', IRIDIUM_FALSO_PASO_MS: '600' })
  const chip = win.locator('.estado-barra').getByRole('button', { name: /Claude sin sesión/ })
  await expect(chip).toContainText('Iniciar sesión')
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Hacé la grilla')
  await campo.press('Enter')
  const falla = win.locator('.falla-ia')
  await expect(falla).toContainText('se abre el navegador')
  await win.screenshot({ path: 'test-results/co1-sin-sesion.png' })

  await falla.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(falla.getByRole('button', { name: 'Esperando el navegador…' })).toBeDisabled()
  await expect(win.locator('.estado-barra')).toContainText('Esperando el navegador…')
  await win.screenshot({ path: 'test-results/co1-esperando.png' })

  // El motor falso «inicia sesión» en dos pasos: el marco y el aviso se enteran solos.
  await expect(win.locator('[data-motor="listo"]')).toHaveCount(1)
  await expect(falla).toHaveAttribute('data-tipo', 'resuelta')
  await expect(falla).toContainText('Ya tienes sesión en Claude')
  await expect(falla.getByRole('button', { name: 'Iniciar sesión' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/co1-con-sesion.png' })
  await falla.getByRole('button', { name: 'Reintentar' }).click()
  await expect(win.locator('.barra-proyectos .proy.elegido')).toContainText('Terminada', { timeout: 15_000 })
  await expect(win.locator('.falla-ia')).toHaveCount(1)
  await app.close()
})

test('si un turno dice que no hay sesión, el chip y el aviso lo muestran y Ajustes ofrece entrar (R-5, Q-93)', async () => {
  const { app, win } = await abrir()
  await expect(win.locator('[data-motor="listo"]')).toHaveCount(1)
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await mandar(win, 'Algo sin sesión', 'Error')
  const falla = win.locator('.falla-ia')
  await expect(falla).toContainText('Claude Code no tiene sesión iniciada')
  await expect(falla.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
  await expect(win.locator('.estado-barra')).toContainText('Claude sin sesión · Iniciar sesión')

  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'IA', exact: true }).click()
  const cuenta = win.locator('.cuenta-claude')
  await expect(cuenta).toContainText('Sin sesión: la IA no puede responder')
  await win.screenshot({ path: 'test-results/r5-ajustes-sin-sesion.png' })
  await cuenta.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(cuenta).toContainText('Sesión iniciada · max', { timeout: 10_000 })
  await expect(cuenta.getByRole('button', { name: 'Cambiar de cuenta' })).toBeVisible()
  await win.screenshot({ path: 'test-results/r5-ajustes-con-sesion.png' })
  await app.close()
})

test('el uso agotado dice cuándo se libera y queda marcado; una falla deja la ficha en error (F-5)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await mandar(win, 'Algo que deja el uso agotado', 'Error')
  const falla = win.locator('.falla-ia[data-tipo="uso"]')
  await expect(falla).toContainText('Se agotó el uso de tu suscripción')
  await expect(falla).toContainText(/Se libera (hoy|mañana) a las/)
  await expect(win.locator('.estado-barra .uso')).toContainText(/agotado\s*· se libera (hoy|mañana) a las/)
  await win.screenshot({ path: 'test-results/i6-agotado.png' })

  await mandar(win, 'Ahora una falla', 'Error')
  await expect(win.locator('.linea-aviso.error')).toContainText('error de prueba')
  await expect(win.locator('.linea-aviso.error')).toContainText('Con Continuar se retoma')
  await app.close()
  const registros = await readdir(join(datos, 'registros'))
  const hoy = await readFile(join(datos, 'registros', registros[0] ?? ''), 'utf8')
  expect(hoy).toContain('Arranca Iridium')
  expect(hoy).toContain('Error del motor en Alfa: uso-agotado')
  expect(hoy).toContain('Error del motor en Alfa: falla')
  expect(hoy).not.toContain('Ahora una falla')
})

test('sin red dice que reintenta mientras trabaja y termina con un aviso en castellano (Defecto 10)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '700' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Probá sin red')
  await campo.press('Enter')
  const reintento = win.locator('.ahora.reintentando')
  await expect(reintento).toContainText('Sin conexión con Claude: reintento 1 de 3')
  await expect(win.locator('.ahora', { hasText: 'Trabajando' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/d10-reintentando.png' })
  await expect(reintento).toContainText('reintento 2 de 3')
  await expect(win.locator('.barra-proyectos .proy.elegido')).toContainText('Error')
  await expect(reintento).toHaveCount(0)
  const aviso = win.locator('.linea-aviso.error')
  await expect(aviso).toContainText('No hay conexión con Claude: revisa internet.')
  await expect(aviso).not.toContainText('Connection refused')
  await win.screenshot({ path: 'test-results/d10-sin-conexion.png' })

  // Detener mientras reintenta frena en el acto.
  await campo.fill('Otra vez sin red')
  await campo.press('Enter')
  await expect(reintento).toContainText('reintento 1 de 3')
  await win.getByRole('button', { name: 'Detener' }).click()
  await expect(win.locator('.barra-proyectos .proy.elegido')).toContainText('Terminada')
  await expect(win.locator('.linea-aviso', { hasText: 'Detuviste a la IA.' })).toBeVisible()
  await app.close()
})

test('un proyecto que no está a la vista avisa cuando termina, con Responder (H-13)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_PREGUNTA: '1' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Algo lento en Alfa')
  await campo.press('Enter')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Trabajando')
  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()

  const aviso = win.locator('.aviso-flotante')
  await expect(aviso).toContainText('Alfa terminó y dejó 1 pregunta', { timeout: 15_000 })
  await expect(aviso).toContainText('Frena')
  await win.screenshot({ path: 'test-results/i6-aviso.png' })
  await aviso.getByRole('button', { name: 'Responder en Alfa' }).click()
  // Lleva a los pendientes de Alfa, dentro del proyecto (no a los de todos).
  await expect(win.locator('.zona-principal')).toHaveAttribute('aria-label', 'Alfa')
  await expect(win.locator('.resumen')).toContainText('Q-1')
  await expect(aviso).toHaveCount(0)

  // En el proyecto a la vista no hay aviso: se ve en la conversación.
  await win.locator('.barra-proyectos .proy', { hasText: 'Beta' }).getByRole('tab').click()
  const campo2 = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo2.fill('Hacé algo en Beta')
  await campo2.press('Enter')
  // Al terminar, la pestaña lleva su cuenta de la bandeja (04-ux.md › Un número que manda).
  await expect(win.locator('.barra-proyectos .proy.elegido .cuenta')).toHaveText('1')
  await expect(win.locator('.pedido')).toContainText('Dejó 1 pregunta')
  await expect(win.locator('.aviso-flotante')).toHaveCount(0)
  await app.close()
})

test('cerrar con sesiones trabajando pregunta; Cerrar igual las frena y quedan para Seguí (F-6)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '2000' })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Algo lento')
  await campo.press('Enter')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Trabajando')

  const cerrar = () => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.close())
  await cerrar()
  const dialogo = win.getByRole('alertdialog')
  await expect(dialogo).toContainText('Alfa está trabajando')
  await expect(dialogo).toContainText('Cerrar la frena')
  await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused()
  await win.screenshot({ path: 'test-results/i6-cerrar.png' })
  await dialogo.getByRole('button', { name: 'Cancelar' }).click()
  await expect(dialogo).toHaveCount(0)
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).toContainText('Trabajando')

  await cerrar()
  const cerrada = app.waitForEvent('close')
  await win.getByRole('alertdialog').getByRole('button', { name: 'Cerrar igual' }).click()
  await cerrada
  const sesiones = JSON.parse(await readFile(join(datos, 'sesiones.json'), 'utf8'))
  const resumenes = Object.values(sesiones.conversaciones) as { detenida?: boolean }[]
  expect(resumenes.some((r) => r.detenida === true)).toBe(true)
})
