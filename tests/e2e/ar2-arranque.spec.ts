// AR-I2 con la app abierta y el motor falso: lo que cuenta el arranque. El aviso al volver con lo que pasó mientras no
// estaba el usuario (AR-4), el detalle del uso con lo último y la semana (AR-2, AR-3) y la línea de la conversación que
// empezó Iridium (AR-2). Lo que pasó de noche se deja escrito en `arranques.json` y `sesiones.json` antes de abrir.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let abiertas: ElectronApplication[] = []

const HORA = 3_600_000

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

/** Un proyecto con framework y la respuesta del usuario a Q-1 sin procesar. */
async function proyecto(nombre: string): Promise<void> {
  const docs = join(raiz, nombre, 'docs')
  await mkdir(join(docs, 'respuestas'), { recursive: true })
  await writeFile(
    join(raiz, nombre, '.proyecto.json'),
    JSON.stringify({
      version: 1,
      descripcion: 'Un proyecto',
      estado: 'en-desarrollo',
      etiquetas: [],
      icono: null,
    }),
  )
  await writeFile(join(docs, 'README.md'), '# Docs\n\n**Framework:** 2026-11-01\n')
  await writeFile(join(docs, 'trabajo.md'), '# Trabajo\n')
  await writeFile(
    join(docs, 'estado.md'),
    '# Estado\n\n**Última actualización:** 2026-11-18\n\n## Hito actual\n7 — Construcción — en curso\n\n' +
      '## Preguntas abiertas\n- **Q-1 — ¿Va?**\n  Tipo: decisión\n  Opciones: A) Sí · B) No\n\n## Próximo paso\nSeguir.\n',
  )
  await writeFile(join(docs, 'respuestas', 'Q-1.md'), '# Q-1 — ¿Va?\n\n**Opción:** A) Sí\n')
}

const leerJson = async (archivo: string) => JSON.parse(await readFile(join(datos, archivo), 'utf8'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
})

test.afterEach(async () => {
  await Promise.all(abiertas.map((a) => a.close().catch(() => {})))
  abiertas = []
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('al volver, el aviso con lo que hizo mientras no estabas; el detalle del uso con la semana; Listo no lo repite (AR-3, AR-4)', async () => {
  await proyecto('Alfa')
  const alfa = join(raiz, 'Alfa')
  const ahora = Date.now()
  const noArranco = (horas: number, resultado: string) => ({
    cuando: ahora - horas * HORA,
    momento: 'vencimiento',
    resultado,
    sinUsarIridium: 6 * 3600,
  })
  const arranco = ahora - HORA
  await writeFile(
    join(datos, 'config.json'),
    JSON.stringify({ version: 1, raiz, arranque: { prendido: true, hora: '03:00' } }),
  )
  await writeFile(
    join(datos, 'arranques.json'),
    JSON.stringify({
      version: 1,
      vistoHasta: null,
      programado: null,
      momentos: [
        noArranco(7, 'nada-listo'),
        noArranco(6, 'periodo-abierto'),
        noArranco(5, 'semana'),
        noArranco(4, 'sin-sesion'),
        noArranco(3, 'sin-uso'),
        noArranco(2, 'semana'),
        {
          cuando: arranco,
          momento: 'hora',
          resultado: 'arranco',
          proyecto: { ruta: alfa, nombre: 'Alfa', preguntas: ['Q-1'] },
          sinUsarIridium: 5 * 3600,
        },
      ],
    }),
  )
  await writeFile(
    join(datos, 'sesiones.json'),
    JSON.stringify({
      version: 1,
      conversaciones: {
        'conv-arrancada': {
          ruta: alfa,
          empezadaEn: 'iridium',
          ultimoUso: arranco + 60_000,
          detenida: false,
          ultimoEstado: 'terminada',
          preguntas: ['Q-1'],
          arranque: arranco,
        },
      },
    }),
  )
  const { app, win } = await abrir()

  // El aviso: los cuatro últimos que dicen algo («nada listo» y «período abierto» no), y «y 1 más».
  const aviso = win.getByRole('status', { name: 'Lo que hizo Iridium mientras no estabas' })
  await expect(aviso).toBeVisible()
  await expect(aviso).toContainText('Mientras no estabas')
  await expect(aviso).toContainText('Alfa')
  await expect(aviso).toContainText('dejó 1 pregunta')
  await expect(aviso).toContainText('no arrancó: la semana pasó el 90 %')
  await expect(aviso).toContainText('no arrancó: no se pudo leer el uso')
  await expect(aviso).toContainText('no arrancó: no había sesión de Claude')
  await expect(aviso).not.toContainText('no había respuestas')
  await expect(aviso.getByRole('button', { name: 'y 1 más' })).toBeVisible()
  // No se va solo, como los otros avisos (8 segundos).
  await win.waitForTimeout(9000)
  await expect(aviso).toBeVisible()
  await win.screenshot({ path: 'test-results/ar2-aviso.png' })

  // «y 1 más» abre el detalle del uso: lo último y los anteriores de la semana.
  await aviso.getByRole('button', { name: 'y 1 más' }).click()
  const detalle = win.locator('.detalle-uso')
  await expect(detalle).toContainText(/Último arranque: Alfa, (hoy|ayer) a las/) // una hora antes: después de medianoche es «ayer»
  await detalle.getByRole('button', { name: 'Los 6 anteriores de la semana' }).click()
  await expect(detalle).toContainText('no había respuestas tuyas esperando')
  await expect(detalle).toContainText('el período ya estaba abierto')
  await win.screenshot({ path: 'test-results/ar2-detalle-uso.png' })
  await win.keyboard.press('Escape')

  // Abrir lleva al proyecto.
  await aviso.getByRole('button', { name: 'Abrir' }).click()
  await expect(win.getByRole('tablist', { name: 'Proyectos abiertos' })).toContainText('Alfa')

  // Listo lo cierra y queda anotado hasta dónde se vio.
  await aviso.getByRole('button', { name: 'Listo' }).click()
  await expect(aviso).toHaveCount(0)
  await expect.poll(async () => (await leerJson('arranques.json')).vistoHasta).toBe(arranco)
  await app.close()

  // Al volver a abrir, no aparece de nuevo.
  const otra = await abrir()
  await expect(otra.win.getByRole('tablist', { name: 'Proyectos abiertos' })).toContainText('Alfa')
  await otra.win.waitForTimeout(1500)
  await expect(otra.win.getByRole('status', { name: 'Lo que hizo Iridium mientras no estabas' })).toHaveCount(
    0,
  )
  await otra.app.close()
})

test('con el usuario delante no hay aviso: la conversación dice que la empezó Iridium y el uso, el último arranque (AR-2)', async () => {
  await proyecto('Alfa')
  await writeFile(
    join(datos, 'config.json'),
    JSON.stringify({ version: 1, raiz, arranque: { prendido: true, hora: '03:00' } }),
  )
  const { app, win } = await abrir({ IRIDIUM_ARRANQUE_EN: '3', IRIDIUM_FALSO_PERIODO: 'cerrado' })
  const pestanas = win.getByRole('tablist', { name: 'Proyectos abiertos' })
  await expect(pestanas.getByText('Alfa')).toBeVisible({ timeout: 15_000 })
  await expect(pestanas).toContainText('Terminada', { timeout: 15_000 })

  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(win.locator('.nombre-conv')).toContainText(
    /la empezó Iridium a las \d\d:\d\d para abrir el período/,
  )
  await expect(win.getByRole('status', { name: 'Lo que hizo Iridium mientras no estabas' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/ar2-conversacion.png' })

  await win.locator('.con-menu.uso > button').click()
  await expect(win.locator('.detalle-uso')).toContainText('Último arranque: Alfa, hoy a las')
  await expect(win.locator('.detalle-uso')).toContainText('terminó')
  await app.close()
})
