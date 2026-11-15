// Hito 8, tanda 3 (08-calidad.md › Rendimiento): mide la app con una copia de la carpeta de proyectos y el motor falso.
// No toca los proyectos reales ni gasta uso: la carpeta de datos es temporal y la de proyectos, la copia que se pasa.
// Uso: node --experimental-strip-types tools/medir.ts <carpeta de proyectos copiada> [ruta del .exe; sin ella, la app de `pnpm build`]
// Deja el resultado en tools/salida/medir.json.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, type Page } from '@playwright/test'
import { elegirProyectos } from './proyectos-copia.ts'

const raiz = process.argv[2]
const exe = process.argv[3]
if (!raiz) throw new Error('Falta la carpeta de proyectos copiada.')
// Los proyectos se eligen por lo que tienen, sin nombrarlos (D-082).
const { iridium: IRIDIUM, trabajo: B, conPrueba } = elegirProyectos(raiz)
const C = conPrueba.nombre
const resultado: Record<string, unknown> = { raiz, app: exe ?? 'pnpm build', fecha: new Date().toISOString() }
const anotar = (clave: string, valor: unknown) => {
  resultado[clave] = valor
  console.log(clave, JSON.stringify(valor))
}

async function abrir(datos: string, extra: Record<string, string> = {}) {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_OCULTA: '1',
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const t0 = Date.now()
  const app = await electron.launch(exe ? { executablePath: exe, env } : { args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  await win.waitForSelector('.grilla:not(.carga) .tarjeta', { timeout: 60_000 })
  return { app, win, ms: Date.now() - t0 }
}

/** Cuadros por segundo y el cuadro más largo durante `ms`, haciendo `paso` en cada cuadro (por ejemplo, desplazar). */
function cuadros(win: Page, ms: number, selector: string | null): Promise<{ fps: number; peorMs: number }> {
  return win.evaluate(
    ([ms, selector]) =>
      new Promise((listo) => {
        const el = selector ? document.querySelector(selector) : null
        const t0 = performance.now()
        let ultimo = t0
        let peor = 0
        let n = 0
        const cuadro = (ahora: number) => {
          peor = Math.max(peor, ahora - ultimo)
          ultimo = ahora
          n++
          if (el) {
            el.scrollTop += 120
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) el.scrollTop = 0
          }
          if (ahora - t0 < ms) requestAnimationFrame(cuadro)
          else listo({ fps: Math.round(n / (ms / 1000)), peorMs: Math.round(peor) })
        }
        requestAnimationFrame(cuadro)
      }),
    [ms, selector] as const,
  )
}

/** Memoria de todos los procesos de la app (MB). */
async function memoria(app: ElectronApplication): Promise<number> {
  const kb = await app.evaluate(({ app }) =>
    app.getAppMetrics().reduce((s, m) => s + (m.memory?.workingSetSize ?? 0), 0),
  )
  return Math.round(kb / 1024)
}

/** Escribe 42 letras en el campo y mide, por tecla, cuánto pasa desde que se aprieta hasta que la ventana se pinta. */
async function escribir(win: Page): Promise<{ promedioMs: number; peorMs: number }> {
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('')
  await win.evaluate(() => {
    const w = window as unknown as { demoras: number[] }
    w.demoras = []
    document.addEventListener(
      'keydown',
      (e) => {
        const t = e.timeStamp
        requestAnimationFrame(() => setTimeout(() => w.demoras.push(performance.now() - t)))
      },
      true,
    )
  })
  await campo.pressSequentially('escribiendo con quinientos mensajes arriba', { delay: 30 })
  await win.waitForTimeout(300)
  const d = await win.evaluate(() => (window as unknown as { demoras: number[] }).demoras)
  await campo.fill('')
  return {
    promedioMs: Math.round(d.reduce((a, b) => a + b, 0) / Math.max(d.length, 1)),
    peorMs: Math.round(Math.max(...d)),
  }
}

const seccion = (win: Page, nombre: string) =>
  win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: nombre })
    .click()

/**
 * Abre un proyecto desde el inicio: con su tarjeta, o Ideas y Skills, que están en la carpeta Iridium (D-083), con
 * Abrir como proyecto desde su sección.
 */
async function entrar(win: Page, nombre: string) {
  const atajo = nombre === 'Ideas' ? 'Control+4' : nombre === 'Skills' ? 'Control+3' : null
  if (atajo) {
    await win.keyboard.press(atajo)
    await win.getByRole('button', { name: 'Abrir como proyecto' }).click()
    return
  }
  await win.keyboard.press('Control+1')
  await win.locator(`.tarjeta[title^="${nombre}"]`).click()
}

async function enviar(win: Page, texto: string) {
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill(texto)
  await campo.press('Enter')
}

const datos = await mkdtemp(join(tmpdir(), 'iridium-medir-'))
await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
try {
  // 1. Abrir hasta ver la grilla, tres veces (la primera, con la caché de Windows fría para esta copia).
  const aperturas: number[] = []
  for (let i = 0; i < 3; i++) {
    const { app, win, ms } = await abrir(datos)
    aperturas.push(ms)
    if (i === 2) anotar('tarjetas', await win.locator('.grilla .tarjeta').count())
    await app.close()
  }
  anotar('abrirHastaLaGrillaMs', aperturas)

  const { app, win } = await abrir(datos, { IRIDIUM_FALSO_PASO_MS: '5' })
  anotar('memoriaAlAbrirMB', await memoria(app))

  // 2. Iridium: el Mapa y decisiones.md en Docs, desplazándose.
  let t = Date.now()
  await win.click(`.tarjeta[title^="${IRIDIUM}"]`)
  await seccion(win, 'Mapa')
  await win.waitForSelector('[data-seccion="mapa"] .hito-mapa', { timeout: 30_000 })
  anotar('mapaDeIridiumMs', Date.now() - t)
  await seccion(win, 'Docs')
  await win.waitForSelector('[data-seccion="docs"] .doc-texto', { timeout: 30_000 })
  t = Date.now()
  await win.locator('[data-seccion="docs"] .barra-doc .menu-boton').first().click()
  await win
    .getByRole('menuitem', { name: /^decisiones/ })
    .first()
    .click()
  await win.waitForFunction(
    () => (document.querySelector('[data-seccion="docs"] .doc-texto')?.textContent ?? '').includes('D-070'),
    null,
    { timeout: 30_000 },
  )
  anotar('decisionesEnDocsMs', Date.now() - t)
  anotar('decisionesDesplazandose', await cuadros(win, 3000, '[data-seccion="docs"] .lectura'))

  // 3. Una conversación de 500 mensajes (250 tuyos y 250 de la IA), en otro proyecto.
  await entrar(win, 'Ideas')
  anotar('escribirSinConversacion', await escribir(win))
  t = Date.now()
  for (let i = 1; i <= 250; i++) {
    await enviar(win, `Mensaje ${i}: ${'texto de relleno '.repeat(i % 7 === 0 ? 40 : 3)}`)
    await win.waitForFunction(
      (n) =>
        !document.querySelector('.barra-proyectos .proy.elegido')?.textContent?.includes('Trabajando') &&
        (document.querySelector('.hilo')?.textContent ?? '').includes(`Mensaje ${n}:`),
      i,
      { timeout: 30_000 },
    )
  }
  anotar('enviar250Ms', Date.now() - t)
  anotar('turnosALaVista', await win.locator('.turno').count())
  anotar('conversacion500Desplazandose', await cuadros(win, 3000, '.hilo'))
  // Escribir en el campo con la conversación larga.
  anotar('escribirCon500', await escribir(win))
  // Salir y volver a la conversación.
  await win.keyboard.press('Control+1')
  t = Date.now()
  await entrar(win, 'Ideas')
  await win.waitForFunction(() =>
    (document.querySelector('.hilo')?.textContent ?? '').includes('Mensaje 250:'),
  )
  anotar('volverALaConversacion500Ms', Date.now() - t)

  // 4. Tres proyectos trabajando a la vez («lento»: cada paso tarda diez veces más).
  const tres = [C, B, 'Skills']
  for (const nombre of tres) {
    await entrar(win, nombre)
    await enviar(win, 'Algo lento para medir')
  }
  anotar('memoriaConTresTrabajandoMB', await memoria(app))
  anotar('cuadrosConTresTrabajando', await cuadros(win, 2000, null))
  t = Date.now()
  await win.keyboard.press('Control+1')
  await win.waitForSelector('.grilla:not(.carga) .tarjeta')
  await win.locator(`.tarjeta[title^="${B}"]`).click()
  await seccion(win, 'Mapa')
  await win.waitForSelector('[data-seccion="mapa"] .hito-mapa, [data-seccion="mapa"] .vacia', {
    timeout: 30_000,
  })
  anotar('cambiarDeProyectoConTresTrabajandoMs', Date.now() - t)

  // 5. Un día de uso en minutos: 150 vueltas por proyectos y secciones; la memoria antes y después.
  const proyectos = [IRIDIUM, B, C, 'Ideas', 'Skills']
  const secciones = ['Mapa', 'Docs', 'Archivos', 'Git']
  const antes = await memoria(app)
  const serie: number[] = []
  for (let i = 0; i < 150; i++) {
    await entrar(win, proyectos[i % proyectos.length] ?? B)
    await seccion(win, secciones[i % secciones.length] ?? 'Mapa')
    await win.waitForTimeout(80)
    if (i % 30 === 29) {
      await win.keyboard.press('Control+2')
      await win.waitForTimeout(150)
      await win.keyboard.press('Control+3')
      await win.waitForTimeout(150)
      serie.push(await memoria(app))
    }
  }
  anotar('memoriaUnDia', { antes, cada30Vueltas: serie })
  await app.close()
} finally {
  await mkdir('tools/salida', { recursive: true })
  await writeFile('tools/salida/medir.json', `${JSON.stringify(resultado, null, 2)}\n`)
  await rm(datos, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
}
