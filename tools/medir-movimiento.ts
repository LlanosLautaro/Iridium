// Frente Pulido, calidad (diseno-tecnico.md › Pruebas): mide si el movimiento pone lenta la app. Con el motor falso y
// una carpeta de proyectos armada en una temporal (los docs de este repo como Alfa, con su Mapa que late, y doce de
// muestra para la grilla), mide cada pantalla con el movimiento y sin él (una hoja que apaga animaciones y
// transiciones): los cuadros por segundo, el cuadro más largo y el procesador de toda la app. Además anota qué
// animaciones corren y qué propiedades mueven (las que no paran tienen que mover solo `transform` y `opacity`) y que
// el Mapa deja de latir cuando no se ve. No toca los proyectos reales ni manda nada.
// Uso: node --experimental-strip-types tools/medir-movimiento.ts [ruta del .exe; sin ella, la app de `pnpm build`]
// Deja el resultado en tools/salida/medir-movimiento.json.
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, type Page } from '@playwright/test'

const exe = process.argv[2]
const resultado: Record<string, unknown> = { app: exe ?? 'pnpm build', fecha: new Date().toISOString() }
const anotar = (clave: string, valor: unknown) => {
  resultado[clave] = valor
  console.log(clave, JSON.stringify(valor))
}

const ficha = (estado: string) =>
  JSON.stringify({
    version: 1,
    descripcion: 'Un proyecto de muestra',
    estado,
    etiquetas: [],
    icono: null,
    archivado: false,
    reemplazadoPor: null,
  })
const estadoMuestra =
  '# Estado del proyecto\n\n**Última actualización:** 2026-11-26\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'
const SCRIPTS = '# Scripts\n\n## Quedarse corriendo\nComo un servidor.\n**Ejecutar:** `ping -t 127.0.0.1`\n'
const MUESTRAS = [
  'Beta',
  'Gamma',
  'Delta',
  'Epsilon',
  'Zeta',
  'Eta',
  'Theta',
  'Iota',
  'Kappa',
  'Lambda',
  'Mu',
  'Nu',
]
const ESTADOS = ['en-desarrollo', 'en-uso', 'idea', 'en-rescate', 'pausado', 'para-eliminar']

const base = await mkdtemp(join(tmpdir(), 'iridium-movimiento-'))
const raiz = join(base, 'PROYECTOS')
const datos = join(base, 'datos')

async function armar() {
  await cp('docs', join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha('en-desarrollo'))
  await writeFile(join(raiz, 'Alfa', 'docs', 'scripts.md'), SCRIPTS)
  for (const [i, nombre] of MUESTRAS.entries()) {
    await mkdir(join(raiz, nombre, 'docs'), { recursive: true })
    await writeFile(join(raiz, nombre, '.proyecto.json'), ficha(ESTADOS[i % ESTADOS.length] ?? 'idea'))
    await writeFile(join(raiz, nombre, 'docs', 'estado.md'), estadoMuestra)
  }
  await mkdir(datos, { recursive: true })
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
}

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_OCULTA: '1',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch(exe ? { executablePath: exe, env } : { args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  await win.waitForSelector('.grilla:not(.carga) .tarjeta', { timeout: 60_000 })
  return { app, win }
}

/** Cuadros por segundo y el cuadro más largo durante `ms`; con `selector`, desplazándolo en cada cuadro. */
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

/** El procesador de todos los procesos de la app durante `ms` (en % de un núcleo, como el Administrador de tareas por núcleo). */
async function procesador(app: ElectronApplication, ms: number): Promise<number> {
  const medir = () =>
    app.evaluate(({ app }) => app.getAppMetrics().reduce((s, m) => s + (m.cpu?.percentCPUUsage ?? 0), 0))
  await medir()
  await new Promise((r) => setTimeout(r, ms))
  return Math.round((await medir()) * 10) / 10
}

/** Las animaciones CSS que corren ahora: su nombre, qué mueven y si no paran. */
function animaciones(win: Page) {
  return win.evaluate(() =>
    document.getAnimations().map((a) => {
      const efecto = a.effect as KeyframeEffect | null
      const fuera = new Set(['offset', 'computedOffset', 'easing', 'composite'])
      const mueve = new Set<string>()
      for (const k of efecto?.getKeyframes() ?? [])
        for (const p of Object.keys(k)) if (!fuera.has(p)) mueve.add(p)
      return {
        nombre: (a as CSSAnimation).animationName ?? 'transición',
        mueve: [...mueve].sort(),
        sinFin: efecto?.getTiming().iterations === Number.POSITIVE_INFINITY,
        estado: a.playState,
      }
    }),
  )
}

const QUIETA = '*, *::before, *::after { animation: none !important; transition: none !important; }'

/** Mide la pantalla de ahora con el movimiento y sin él. */
async function pantalla(app: ElectronApplication, win: Page, clave: string, desplazar: string | null = null) {
  await win.waitForTimeout(500)
  const corriendo = (await animaciones(win)).filter((a) => a.estado === 'running')
  const con = { ...(await cuadros(win, 3000, desplazar)), procesador: await procesador(app, 5000) }
  const hoja = await win.addStyleTag({ content: QUIETA })
  await win.waitForTimeout(300)
  const sin = { ...(await cuadros(win, 3000, desplazar)), procesador: await procesador(app, 5000) }
  await hoja.evaluate((h) => (h as Element).remove())
  anotar(clave, { conMovimiento: con, sinMovimiento: sin, animaciones: corriendo })
}

const seccion = (win: Page, nombre: string) =>
  win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: nombre })
    .click()

let abierta: ElectronApplication | null = null
try {
  await armar()
  const { app, win } = await abrir()
  abierta = app

  // 1. El inicio: las tarjetas con el estado en su color.
  await pantalla(app, win, 'inicio')

  // 2. Frentes de Alfa (el Mapa): el paso que sigue late (el radar).
  await win.locator('.tarjeta', { hasText: 'Alfa' }).first().click()
  await seccion(win, 'Frentes')
  await win.waitForSelector('[data-seccion="mapa"] .camino .foco .punto-camino', { timeout: 30_000 })
  await pantalla(app, win, 'mapa')

  // 3. El Mapa con un script corriendo y las consolas plegadas: laten el radar y «corriendo» (su punto y su luz).
  await seccion(win, 'Scripts')
  await win
    .locator('[data-seccion="scripts"]')
    .getByRole('button', { name: 'Ejecutar «Quedarse corriendo»' })
    .click()
  const panel = win.getByRole('region', { name: 'Consolas' })
  await panel.waitFor()
  await panel.getByRole('button', { name: 'Plegar las consolas' }).click()
  await panel.waitFor({ state: 'detached' })
  await seccion(win, 'Frentes')
  await win.waitForSelector('[data-seccion="mapa"] .camino .foco .punto-camino')
  await pantalla(app, win, 'mapaConCorriendo')

  // 4. Docs, desplazando decisiones.md, con «corriendo» latiendo abajo.
  await seccion(win, 'Docs')
  await win.waitForSelector('[data-seccion="docs"] .texto-doc', { timeout: 30_000 })
  await win
    .getByRole('navigation', { name: 'Documentos' })
    .getByRole('button', { name: 'decisiones.md' })
    .click()
  await win.waitForFunction(
    () => (document.querySelector('[data-seccion="docs"] .texto-doc')?.textContent ?? '').includes('D-070'),
    null,
    { timeout: 30_000 },
  )
  await pantalla(app, win, 'docsDesplazandoseConCorriendo', '[data-seccion="docs"] .lectura')

  // La luz de «corriendo» en tres momentos de su vuelta, para mirarla.
  const senal = win.locator('.senal-consolas.corriendo')
  for (const [i, momento] of [0.3, 0.5, 0.7].entries()) {
    await win.evaluate((m) => {
      for (const a of document.getAnimations())
        if ((a as CSSAnimation).animationName === 'barrido')
          a.currentTime = m * Number(a.effect?.getComputedTiming().duration ?? 0)
    }, momento)
    await senal.screenshot({ path: `tools/salida/movimiento-corriendo-${i + 1}.png` })
  }

  // 5. Fuera del Mapa, el radar no corre (lo que no se ve no late).
  const radar = (await animaciones(win)).filter((a) => a.nombre === 'radar' && a.estado === 'running')
  anotar('radarFueraDelMapa', radar.length)

  // Lo que no para tiene que mover solo transform y opacity (se dibuja sin rehacer la pantalla).
  const sinFin = Object.values(resultado)
    .flatMap(
      (v) =>
        (v as { animaciones?: { nombre: string; mueve: string[]; sinFin: boolean }[] }).animaciones ?? [],
    )
    .filter((a) => a.sinFin)
  const malas = [
    ...new Set(
      sinFin.filter((a) => a.mueve.some((p) => p !== 'transform' && p !== 'opacity')).map((a) => a.nombre),
    ),
  ]
  anotar('sinFinQueRedibujan', malas)
  // Con el script corriendo, cerrar pregunta (I-10): Cerrar igual lo detiene junto con Iridium.
  const cerrada = app.waitForEvent('close')
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.close())
  await win.getByRole('alertdialog').getByRole('button', { name: 'Cerrar igual' }).click()
  await cerrada
  abierta = null
} finally {
  try {
    abierta?.process().kill()
  } catch {
    // Ya estaba cerrada.
  }
  await mkdir('tools/salida', { recursive: true })
  await writeFile('tools/salida/medir-movimiento.json', `${JSON.stringify(resultado, null, 2)}\n`)
  await rm(base, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
}
