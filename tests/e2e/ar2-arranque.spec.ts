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

test('al volver, el aviso con lo que hizo mientras no estabas; «y N más» despliega el resto; Listo no lo repite (AR-3, AR-4)', async () => {
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
  // No se va solo, como los otros avisos (se van a los pocos segundos).
  await win.waitForTimeout(9000)
  await expect(aviso).toBeVisible()
  await win.screenshot({ path: 'test-results/ar2-aviso.png' })

  // «y 1 más» despliega el que faltaba en el mismo aviso (R-99: el detalle del uso ya no tiene el arranque).
  await expect(aviso.locator('.renglones-arranque li')).toHaveCount(4)
  await aviso.getByRole('button', { name: 'y 1 más' }).click()
  await expect(aviso.locator('.renglones-arranque li')).toHaveCount(5)
  await expect(aviso.getByRole('button', { name: 'y 1 más' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/ar2-aviso-todas.png' })

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

test('al volver, el aviso cuenta las apps que se armaron solas: se actualizaron o con su motivo si fallaron (T-86)', async () => {
  await proyecto('Alfa')
  await proyecto('Beta')
  const alfa = join(raiz, 'Alfa')
  const beta = join(raiz, 'Beta')
  const ahora = Date.now()
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await writeFile(
    join(datos, 'arranques.json'),
    JSON.stringify({
      version: 1,
      vistoHasta: null,
      programado: null,
      momentos: [],
      armados: [
        { cuando: ahora - 3 * HORA, ruta: alfa, nombre: 'Alfa', resultado: 'ok' },
        {
          cuando: ahora - 2 * HORA,
          ruta: beta,
          nombre: 'Beta',
          resultado: 'falla',
          motivo: 'Tardó más de 10 minutos y se cortó.',
        },
      ],
    }),
  )
  const { app, win } = await abrir()
  const aviso = win.getByRole('status', { name: 'Lo que hizo Iridium mientras no estabas' })
  await expect(aviso).toBeVisible()
  await expect(aviso).toHaveAttribute('data-estado', 'error')
  const renglones = aviso.locator('.renglones-arranque li')
  await expect(renglones).toHaveCount(2)
  await expect(renglones.nth(0)).toContainText('Alfa')
  await expect(renglones.nth(0)).toContainText('se actualizó')
  await expect(renglones.nth(1)).toContainText('Beta')
  await expect(renglones.nth(1)).toContainText('no se pudo actualizar')
  await expect(renglones.nth(1).locator('.fallo')).toHaveAttribute(
    'title',
    'Tardó más de 10 minutos y se cortó.',
  )
  // La entrada del aviso termina antes de la captura.
  await win.waitForTimeout(1000)
  await win.screenshot({ path: 'test-results/t86-aviso-armados.png' })

  await aviso.getByRole('button', { name: 'Abrir Beta' }).click()
  await expect(win.getByRole('tablist', { name: 'Proyectos abiertos' })).toContainText('Beta')
  await aviso.getByRole('button', { name: 'Listo' }).click()
  await expect(aviso).toHaveCount(0)
  await expect.poll(async () => (await leerJson('arranques.json')).vistoHasta).toBe(ahora - 2 * HORA)
  await app.close()
})

test('el aviso al volver se usa con el teclado, cada botón dice qué hace y el texto se lee (paso 8)', async () => {
  await proyecto('Alfa')
  await proyecto('Beta')
  const ahora = Date.now()
  const arranco = (nombre: string, horas: number) => ({
    cuando: ahora - horas * HORA,
    momento: 'hora',
    resultado: 'arranco',
    proyecto: { ruta: join(raiz, nombre), nombre, preguntas: ['Q-1'] },
    sinUsarIridium: 6 * 3600,
  })
  await writeFile(
    join(datos, 'config.json'),
    JSON.stringify({ version: 1, raiz, arranque: { prendido: true, hora: '03:00' } }),
  )
  // Alfa terminó y dejó una pregunta; Beta no llegó a empezar (sin conversación guardada: falló, en rojo); uno no
  // arrancó por la semana (en ámbar).
  await writeFile(
    join(datos, 'arranques.json'),
    JSON.stringify({
      version: 1,
      vistoHasta: null,
      programado: null,
      momentos: [
        { cuando: ahora - 3 * HORA, momento: 'vencimiento', resultado: 'semana', sinUsarIridium: 6 * 3600 },
        arranco('Beta', 2),
        arranco('Alfa', 1),
      ],
    }),
  )
  await writeFile(
    join(datos, 'sesiones.json'),
    JSON.stringify({
      version: 1,
      conversaciones: {
        'conv-alfa': {
          ruta: join(raiz, 'Alfa'),
          empezadaEn: 'iridium',
          ultimoUso: ahora - HORA + 60_000,
          detenida: false,
          ultimoEstado: 'terminada',
          preguntas: ['Q-1'],
          arranque: ahora - HORA,
        },
      },
    }),
  )
  const { win } = await abrir()
  const aviso = win.getByRole('status', { name: 'Lo que hizo Iridium mientras no estabas' })
  await expect(aviso).toBeVisible()
  await expect(aviso.locator('.fallo')).toHaveCount(1)
  // Se mide con la entrada del aviso terminada.
  await aviso.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)))

  // Cada Abrir dice de qué proyecto es.
  await expect(aviso.getByRole('button', { name: 'Abrir Alfa' })).toBeVisible()
  await expect(aviso.getByRole('button', { name: 'Abrir Beta' })).toBeVisible()

  // Con Tab se llega a sus tres botones, con el foco a la vista.
  const visitados: string[] = []
  for (let i = 0; i < 80 && visitados.length < 3; i++) {
    await win.keyboard.press('Tab')
    const foco = await win.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el?.closest('.aviso-flotante.fijo')) return null
      const e = getComputedStyle(el)
      const visible =
        (e.outlineStyle !== 'none' && Number.parseFloat(e.outlineWidth) > 0) || e.boxShadow !== 'none'
      return { nombre: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? '', visible }
    })
    if (!foco || visitados.includes(foco.nombre)) continue
    expect(foco.visible, `foco visible en ${foco.nombre}`).toBe(true)
    visitados.push(foco.nombre)
  }
  expect(visitados).toEqual(['Abrir Beta', 'Abrir Alfa', 'Listo'])

  // El contraste de cada texto contra el fondo del aviso (WCAG AA, 4,5:1).
  const bajos = await aviso.evaluate((raizAviso) => {
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number)
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * f(r ?? 0) + 0.7152 * f(g ?? 0) + 0.0722 * f(b ?? 0)
    }
    const fondo = (el: Element | null): number[] => {
      for (let e = el; e; e = e.parentElement) {
        const c = rgb(getComputedStyle(e).backgroundColor)
        if ((c[3] ?? 1) > 0.95) return c
      }
      return [0, 0, 0]
    }
    const res: string[] = []
    for (const el of raizAviso.querySelectorAll<HTMLElement>('*')) {
      const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())
      if (!propio) continue
      const a = lum(rgb(getComputedStyle(el).color))
      const b = lum(fondo(el))
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      if (ratio < 4.5) res.push(`${el.textContent?.trim()}: ${ratio.toFixed(2)}`)
    }
    return res
  })
  expect(bajos).toEqual([])
  await aviso.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)))
  await win.screenshot({ path: 'test-results/ar-calidad-aviso.png' })
})

test('con el usuario delante no hay aviso y la conversación dice que la empezó Iridium (AR-2)', async () => {
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

  // R-99, R-100: el detalle del uso es solo el uso, sin el arranque ni la nota de abajo.
  await win.locator('.con-menu.uso > button').click()
  await expect(win.locator('.detalle-uso')).toContainText('Ventana de 5 horas')
  await expect(win.locator('.detalle-uso')).not.toContainText('arranque')
  await expect(win.locator('.detalle-uso')).not.toContainText('Lo usan todas las sesiones')
  await app.close()
})

test('con muchas sesiones de noche, la lista se desplaza y Listo queda a la vista; la cortada por el uso no dice «falló» (R-108, D-194)', async () => {
  await proyecto('Alfa')
  const alfa = join(raiz, 'Alfa')
  const ahora = Date.now()
  const avance = (i: number, agotado = false) => ({
    cuando: ahora - (20 - i) * 60_000,
    momento: 'avance',
    resultado: 'arranco',
    proyecto: { ruta: alfa, nombre: 'Alfa', preguntas: [] },
    sinUsarIridium: 3600,
    paso: {
      frente: 'Núcleo',
      carpeta: '',
      texto: `Un paso largo de la noche, el número ${i}`,
      tamano: 'chico',
      linea: i,
    },
    ...(agotado ? { agotado: true } : {}),
  })
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await writeFile(
    join(datos, 'arranques.json'),
    JSON.stringify({
      version: 1,
      vistoHasta: null,
      programado: null,
      momentos: [...Array.from({ length: 13 }, (_, i) => avance(i)), avance(13, true)],
    }),
  )
  // Las trece primeras terminaron; la última no llegó a guardar su conversación.
  const conversaciones = Object.fromEntries(
    Array.from({ length: 13 }, (_, i) => [
      `conv-${i}`,
      {
        ruta: alfa,
        empezadaEn: 'iridium',
        ultimoUso: avance(i).cuando + 30_000,
        detenida: false,
        ultimoEstado: 'terminada',
        preguntas: [],
        arranque: avance(i).cuando,
      },
    ]),
  )
  await writeFile(join(datos, 'sesiones.json'), JSON.stringify({ version: 1, conversaciones }))
  const { win } = await abrir()
  await win.setViewportSize({ width: 1280, height: 640 })
  const aviso = win.getByRole('status', { name: 'Lo que hizo Iridium mientras no estabas' })
  await expect(aviso).toBeVisible()
  // Sin conversación guardada sería «falló»; cortada por el uso, dice que sigue y el aviso va en ámbar.
  await expect(aviso).toContainText('se quedó sin uso, sigue cuando se libere')
  await expect(aviso).toHaveAttribute('data-estado', 'espera')
  await aviso.getByRole('button', { name: /^y \d+ más$/ }).click()
  await expect(aviso.locator('.renglones-arranque li')).toHaveCount(14)
  const lista = aviso.locator('.renglones-arranque')
  const medidas = await lista.evaluate((el) => ({ alto: el.clientHeight, todo: el.scrollHeight }))
  expect(medidas.todo).toBeGreaterThan(medidas.alto)
  // El aviso entero entra en la ventana: el título arriba y Listo abajo.
  const caja = await aviso.boundingBox()
  expect(caja?.y ?? -1).toBeGreaterThanOrEqual(0)
  expect((caja?.y ?? 0) + (caja?.height ?? 0)).toBeLessThanOrEqual(640)
  await expect(aviso.getByRole('button', { name: 'Listo' })).toBeInViewport()
  await win.screenshot({ path: 'test-results/r108-aviso-largo.png' })
  await lista.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect(aviso.getByText('se quedó sin uso, sigue cuando se libere')).toBeInViewport()
  await win.screenshot({ path: 'test-results/r108-aviso-largo-abajo.png' })
})
