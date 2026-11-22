// AR-I1 con la app abierta y el motor falso: el ajuste en Ajustes › IA (AR-1) y el arranque, que abre una conversación
// nueva en el proyecto que espera hace más (D-149). IRIDIUM_ARRANQUE_EN pone el primer momento a unos segundos de abrir;
// IRIDIUM_FALSO_PERIODO=cerrado, el uso sin un período abierto.
import { mkdir, mkdtemp, readFile, rm, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
/** Las apps abiertas: se cierran aunque la prueba falle, para poder borrar las carpetas. */
let abiertas: ElectronApplication[] = []

const ficha = (archivado = false) =>
  JSON.stringify({
    version: 1,
    descripcion: 'Un proyecto',
    estado: 'en-desarrollo',
    etiquetas: [],
    icono: null,
    archivado,
    reemplazadoPor: null,
  })

async function abrir(env: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const todo = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '60',
    ...env,
  } as Record<string, string>
  delete todo.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env: todo })
  abiertas.push(app)
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

/** Un proyecto con framework y la respuesta del usuario a Q-1 sin procesar, escrita hace `horas`. */
async function proyecto(nombre: string, horas: number, archivado = false): Promise<void> {
  const docs = join(raiz, nombre, 'docs')
  await mkdir(join(docs, 'respuestas'), { recursive: true })
  await writeFile(join(raiz, nombre, '.proyecto.json'), ficha(archivado))
  await writeFile(join(docs, 'README.md'), '# Docs\n\n**Framework:** 2026-11-01\n')
  await writeFile(join(docs, 'trabajo.md'), '# Trabajo\n')
  await writeFile(
    join(docs, 'estado.md'),
    '# Estado\n\n**Última actualización:** 2026-11-18\n\n## Hito actual\n7 — Construcción — en curso\n\n' +
      '## Preguntas abiertas\n- **Q-1 — ¿Va?**\n  Tipo: decisión\n  Opciones: A) Sí · B) No\n\n## Próximo paso\nSeguir.\n',
  )
  const respuesta = join(docs, 'respuestas', 'Q-1.md')
  await writeFile(respuesta, '# Q-1 — ¿Va?\n\n**Opción:** A) Sí\n')
  const cuando = new Date(Date.now() - horas * 3_600_000)
  await utimes(respuesta, cuando, cuando)
}

const leerJson = async (archivo: string) => JSON.parse(await readFile(join(datos, archivo), 'utf8'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
})

test.afterEach(async () => {
  await Promise.all(abiertas.map((a) => a.close().catch(() => {})))
  abiertas = []
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('Ajustes › IA: abrir el período, apagado al principio; prendido, la hora se elige y queda (AR-1)', async () => {
  await proyecto('Alfa', 1)
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win.keyboard.press('Control+,')
  await win.getByRole('dialog').getByRole('button', { name: 'IA', exact: true }).click()
  const interruptor = win.getByRole('switch', { name: 'Abrir el período de Claude' })
  const hora = win.getByLabel('Hora del primer arranque')
  await expect(interruptor).not.toBeChecked()
  await expect(hora).toBeDisabled()
  await expect(hora).toHaveValue('03:00')
  await expect(win.getByText('Sigue el proyecto que espera hace más', { exact: false })).toBeVisible()

  await interruptor.check()
  await expect(hora).toBeEnabled()
  await hora.fill('04:30')
  await expect
    .poll(async () => (await leerJson('config.json')).arranque)
    .toEqual({
      prendido: true,
      hora: '04:30',
    })
  await win.getByRole('switch', { name: 'Abrir el período de Claude' }).scrollIntoViewIfNeeded()
  await win.screenshot({ path: 'test-results/ar1-ajuste.png' })
  await app.close()

  // Queda al cerrar y abrir Iridium.
  const otra = await abrir()
  // Vuelve al proyecto que estaba abierto (D-060).
  await expect(otra.win.getByRole('tablist', { name: 'Proyectos abiertos' })).toContainText('Alfa')
  await otra.win.keyboard.press('Control+,')
  await otra.win.getByRole('dialog').getByRole('button', { name: 'IA', exact: true }).click()
  await expect(otra.win.getByRole('switch', { name: 'Abrir el período de Claude' })).toBeChecked()
  await expect(otra.win.getByLabel('Hora del primer arranque')).toHaveValue('04:30')
  await otra.app.close()
})

test('al llegar el momento arranca como Nueva el que espera hace más, no el archivado (D-149)', async () => {
  await proyecto('Alfa', 5)
  await proyecto('Beta', 1)
  await proyecto('Gamma', 30, true)
  await writeFile(
    join(datos, 'config.json'),
    JSON.stringify({ version: 1, raiz, arranque: { prendido: true, hora: '03:00' } }),
  )
  const { app, win } = await abrir({ IRIDIUM_ARRANQUE_EN: '3', IRIDIUM_FALSO_PERIODO: 'cerrado' })
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()

  // La pestaña de Alfa aparece arriba sola, como cualquier sesión.
  const pestanas = win.getByRole('tablist', { name: 'Proyectos abiertos' })
  await expect(pestanas.getByText('Alfa')).toBeVisible({ timeout: 15_000 })
  await expect(pestanas.getByText('Beta')).toHaveCount(0)

  await expect
    .poll(async () => (await leerJson('arranques.json').catch(() => ({ momentos: [] }))).momentos)
    .toEqual([
      expect.objectContaining({
        resultado: 'arranco',
        proyecto: { ruta: join(raiz, 'Alfa'), nombre: 'Alfa', preguntas: ['Q-1'] },
      }),
    ])
  const { momentos } = await leerJson('arranques.json')
  const marca = momentos[0].cuando
  await expect
    .poll(async () =>
      Object.values((await leerJson('sesiones.json').catch(() => ({ conversaciones: {} }))).conversaciones),
    )
    .toEqual([expect.objectContaining({ ruta: join(raiz, 'Alfa'), empezadaEn: 'iridium', arranque: marca })])

  // Al abrirla, la conversación nueva empieza con el mensaje de siempre, como si se hubiera tocado Nueva.
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(win.getByText('Continúa con el proyecto.').first()).toBeVisible()
  // Termina como cualquier sesión (si siguiera trabajando, cerrar Iridium preguntaría, F-6).
  await expect(pestanas).toContainText('Terminada', { timeout: 15_000 })
  await win.screenshot({ path: 'test-results/ar1-arranco.png' })
  await app.close()
})
