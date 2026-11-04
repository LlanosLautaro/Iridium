// Hito 8, tanda 5 (08-calidad.md › Accesibilidad y UI): abre Iridium en los dos temas sobre una copia de la carpeta de proyectos,
// con el motor falso y sin mandar nada, y en cada pantalla principal mide:
// - el contraste de cada texto visible contra su fondo real (WCAG AA: 4,5:1; 3:1 el texto grande);
// - los controles sin nombre (para lectores de pantalla y para el título al pasar el mouse);
// - el recorrido con Tab: a dónde va el foco, si se ve y si queda atrapado;
// - Escape en los diálogos, los atajos Ctrl+1 a 3 y Ctrl+, y agrandar la letra (Ctrl+= / Ctrl+-).
// Uso: node --experimental-strip-types tools/accesibilidad.ts <carpeta de proyectos copiada> [ruta del .exe]
// Deja capturas y registro.json en tools/salida/tanda5/.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, type Page } from '@playwright/test'

const raiz = process.argv[2]
const exe = process.argv[3]
if (!raiz) throw new Error('Falta la carpeta de proyectos copiada.')
const SALIDA = 'tools/salida/tanda5'
await rm(SALIDA, { recursive: true, force: true })
await mkdir(SALIDA, { recursive: true })

const registro: Record<string, unknown> = {}

async function abrir(tema: string) {
  const datos = await mkdtemp(join(tmpdir(), 'iridium-tanda5-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_OCULTA: '1',
    IRIDIUM_TEMA: tema,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch(exe ? { executablePath: exe, env } : { args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  await win.waitForSelector('.grilla:not(.carga) .tarjeta', { timeout: 60_000 })
  return { app, win }
}

/** Corre dentro de la página: contraste de cada texto y controles sin nombre. */
function escanear() {
  const lienzo = document.createElement('canvas')
  lienzo.width = lienzo.height = 1
  const ctx = lienzo.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  // Cualquier color de CSS (oklch, color-mix…) a sRGB con su transparencia.
  const rgba = (c: string): [number, number, number, number] => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = c
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return [d[0] ?? 0, d[1] ?? 0, d[2] ?? 0, (d[3] ?? 0) / 255]
  }
  const sobre = (a: number[], b: number[]) => {
    const al = a[3] ?? 1
    return [0, 1, 2].map((i) => (a[i] ?? 0) * al + (b[i] ?? 0) * (1 - al))
  }
  const lum = (c: number[]) => {
    const lineal = (v = 0) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * lineal(c[0]) + 0.7152 * lineal(c[1]) + 0.0722 * lineal(c[2])
  }
  const ratio = (a: number[], b: number[]) => {
    const [x, y] = [lum(a), lum(b)]
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
  }
  // El fondo real: las capas de fondo de los antepasados, de abajo hacia arriba.
  const fondo = (el: Element) => {
    const capas: number[][] = []
    let dudoso = false
    for (let e: Element | null = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e)
      if (cs.backgroundImage !== 'none') dudoso = true
      const c = rgba(cs.backgroundColor)
      if (c[3] > 0) capas.push(c)
      if (c[3] >= 1) break
      const op = Number(cs.opacity)
      if (op < 1) dudoso = true
    }
    let base = [0, 0, 0]
    for (const c of capas.reverse()) base = sobre(c, base)
    return { base, dudoso }
  }
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.right < 0) return false
    if (r.top > innerHeight || r.left > innerWidth) return false
    const cs = getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05
  }
  const opacidad = (el: Element) => {
    let o = 1
    for (let e: Element | null = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity)
    return o
  }
  const ruta = (el: Element) => {
    const partes: string[] = []
    for (let e: Element | null = el; e && partes.length < 3; e = e.parentElement) {
      const cl = [...e.classList].slice(0, 2).join('.')
      partes.unshift(e.tagName.toLowerCase() + (cl ? `.${cl}` : ''))
    }
    return partes.join(' > ')
  }
  const bajos: unknown[] = []
  const vistos = new Set<string>()
  let medidos = 0
  const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = caminante.nextNode(); n; n = caminante.nextNode()) {
    const t = n.textContent?.trim()
    const el = n.parentElement
    if (!t || !el || !visible(el)) continue
    if (el.closest('svg, .lector-codigo, pre code')) continue
    const cs = getComputedStyle(el)
    const desactivado = !!el.closest('button:disabled, [aria-disabled="true"], input:disabled')
    const color = rgba(cs.color)
    const { base, dudoso } = fondo(el)
    const op = opacidad(el)
    const texto = sobre([color[0], color[1], color[2], color[3] * op], base)
    const r = ratio(texto, base)
    const px = Number.parseFloat(cs.fontSize)
    const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700)
    const minimo = grande ? 3 : 4.5
    medidos++
    if (r < minimo) {
      const clave = `${ruta(el)}|${cs.color}|${Math.round(r * 10)}`
      if (vistos.has(clave)) continue
      vistos.add(clave)
      bajos.push({
        texto: t.slice(0, 50),
        donde: ruta(el),
        contraste: Math.round(r * 100) / 100,
        minimo,
        px,
        color: cs.color,
        opacidad: Math.round(op * 100) / 100,
        desactivado,
        dudoso,
      })
    }
  }
  // Controles sin nombre accesible.
  const sinNombre: unknown[] = []
  const controles = document.querySelectorAll(
    'button, a[href], input, textarea, select, [role="button"], [role="switch"], [role="tab"], [tabindex]:not([tabindex="-1"])',
  )
  for (const c of controles) {
    if (!visible(c)) continue
    const he = c as HTMLElement
    const etiqueta =
      he.getAttribute('aria-label') ||
      (he.getAttribute('aria-labelledby') &&
        document.getElementById(he.getAttribute('aria-labelledby') as string)?.textContent) ||
      he.innerText?.trim() ||
      he.getAttribute('title') ||
      (he.id && document.querySelector(`label[for="${he.id}"]`)?.textContent) ||
      he.closest('label')?.textContent?.trim() ||
      (he as HTMLInputElement).placeholder
    if (!etiqueta) sinNombre.push({ donde: ruta(c), html: he.outerHTML.slice(0, 160) })
  }
  const titulos = [...document.querySelectorAll('h1,h2,h3,h4')]
    .filter(visible)
    .map((h) => `${h.tagName} ${h.textContent?.trim().slice(0, 30)}`)
  const imagenes = [...document.querySelectorAll('img:not([alt])')].filter(visible).length
  return { medidos, bajos, sinNombre, titulos, imagenesSinAlt: imagenes }
}

/** Corre dentro de la página: describe el elemento con foco y si su foco se ve. */
function conFoco() {
  const el = document.activeElement as HTMLElement | null
  if (!el || el === document.body) return { cuerpo: true }
  const cs = getComputedStyle(el)
  const huella = (c: CSSStyleDeclaration) =>
    [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.backgroundColor].join('|')
  // Lo que cambia al tener foco: el elemento o, si no, su caja (los campos sin borde propio).
  const caja = el.closest('.caja') as HTMLElement | null
  const conF = huella(cs) + (caja ? huella(getComputedStyle(caja)) : '')
  const r = el.getBoundingClientRect()
  const nombre = (
    el.getAttribute('aria-label') ||
    el.innerText?.trim() ||
    el.getAttribute('title') ||
    (el as HTMLInputElement).placeholder ||
    ''
  )
    .replace(/\s+/g, ' ')
    .slice(0, 60)
  return {
    tag: el.tagName.toLowerCase(),
    clase: [...el.classList].slice(0, 2).join('.'),
    rol: el.getAttribute('role'),
    nombre,
    dentro: r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0,
    huella: conF,
    contorno: `${cs.outlineStyle} ${cs.outlineWidth}`,
  }
}

/** Tab hasta volver al principio (o N veces) y anota por dónde pasa el foco y si se ve. */
async function recorrerConTab(win: Page, n = 70) {
  await win.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  const pasos: Record<string, unknown>[] = []
  for (let i = 0; i < n; i++) {
    await win.keyboard.press('Tab')
    const f = (await win.evaluate(conFoco)) as Record<string, unknown>
    if (f.cuerpo) {
      pasos.push({ i, cuerpo: true })
      continue
    }
    // ¿Se ve el foco? Se compara con el mismo elemento sin foco.
    const sin = await win.evaluate(() => {
      const el = document.activeElement as HTMLElement
      el.blur()
      const cs = getComputedStyle(el)
      const caja = el.closest('.caja') as HTMLElement | null
      const h = (c: CSSStyleDeclaration) =>
        [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.backgroundColor].join(
          '|',
        )
      const r = h(cs) + (caja ? h(getComputedStyle(caja)) : '')
      el.focus()
      return r
    })
    const clave = `${f.tag}.${f.clase}|${f.nombre}`
    if (pasos.some((p) => p.clave === clave) && i > 3) {
      pasos.push({ i, clave, vuelta: true })
      break
    }
    pasos.push({ i, clave, rol: f.rol, dentro: f.dentro, seVe: sin !== f.huella, contorno: f.contorno })
  }
  return pasos
}

const resumenTab = (pasos: Record<string, unknown>[]) => ({
  paradas: pasos.filter((p) => p.clave && !p.vuelta).length,
  vuelve: pasos.some((p) => p.vuelta),
  sinFocoVisible: pasos.filter((p) => p.clave && !p.vuelta && !p.seVe).map((p) => p.clave),
  fueraDeLaVista: pasos.filter((p) => p.clave && p.dentro === false).map((p) => p.clave),
  alCuerpo: pasos.filter((p) => p.cuerpo).length,
})

async function pantalla(win: Page, tema: string, id: string, conTab = true) {
  await win.waitForTimeout(500)
  await win.screenshot({ path: join(SALIDA, `${tema}-${id}.png`) })
  const esc = await win.evaluate(escanear)
  const tab = conTab ? await recorrerConTab(win) : []
  registro[`${tema}/${id}`] = { ...esc, tab: conTab ? resumenTab(tab) : null, recorrido: tab }
  const bajos = (esc.bajos as unknown[]).length
  console.log(
    `${tema}/${id}: ${esc.medidos} textos, ${bajos} bajos, ${(esc.sinNombre as unknown[]).length} sin nombre` +
      (conTab ? `, tab ${JSON.stringify(resumenTab(tab))}` : ''),
  )
}

for (const tema of ['iridium', 'carbon']) {
  let app: ElectronApplication | undefined
  try {
    const abierta = await abrir(tema)
    app = abierta.app
    const win = abierta.win
    await pantalla(win, tema, 'proyectos')
    await win.keyboard.press('Control+2')
    await win.waitForSelector('.pend, .pendientes, h1', { timeout: 10_000 }).catch(() => {})
    await pantalla(win, tema, 'pendientes')
    await win.keyboard.press('Control+3')
    await win.waitForSelector('.sk-columna .sk-fila', { timeout: 30_000 })
    await pantalla(win, tema, 'skills')
    // Ajustes, con Ctrl+, y cada pestaña; Escape cierra y devuelve el foco.
    await win.keyboard.press('Control+1')
    await win.waitForSelector('.grilla:not(.carga) .tarjeta')
    await win.keyboard.press('Control+,')
    const d = win.getByRole('dialog')
    await d.waitFor()
    for (const s of ['Perfil', 'IA', 'Apariencia', 'Proyectos', 'Acerca de']) {
      await d.getByRole('button', { name: s, exact: true }).first().click()
      await pantalla(win, tema, `ajustes-${s.replace(/ /g, '-')}`, s === 'Perfil' || s === 'Apariencia')
    }
    await win.keyboard.press('Escape')
    registro[`${tema}/ajustes-escape`] = await d
      .waitFor({ state: 'detached', timeout: 3000 })
      .then(() => true)
      .catch(() => false)
    // Un proyecto con todas sus secciones.
    await win.locator('.tarjeta[title^="Centro de Desarrollo"]').click()
    await win.waitForSelector('.principal > .cabecera h1')
    const nav = win.getByRole('navigation', { name: 'Secciones del proyecto' })
    const nombres = await nav
      .locator('button')
      .evaluateAll((bs) =>
        bs.map((b) => (b.getAttribute('aria-label') || b.getAttribute('title') || '').split(' ·')[0]),
      )
    for (let i = 0; i < nombres.length; i++) {
      const nom = nombres[i]
      if (!nom || /^Ajustes/.test(nom)) continue
      await nav.locator('button').nth(i).click()
      await win.waitForTimeout(700)
      await pantalla(
        win,
        tema,
        `proyecto-${i}-${nom.replace(/[^\wáéíóúñ]+/gi, '-')}`,
        i < 3 || /Revisi/.test(nom),
      )
    }
    // Agrandar la letra con el teclado (04-ux.md › Accesibilidad).
    if (tema === 'iridium') {
      const zoom = () =>
        abierta.app.evaluate(({ BrowserWindow }) =>
          BrowserWindow.getAllWindows()[0]?.webContents.getZoomFactor(),
        )
      const z0 = await zoom()
      await win.keyboard.press('Control+=')
      await win.keyboard.press('Control+Equal')
      await win.waitForTimeout(300)
      const z1 = await zoom()
      registro['zoom-teclado'] = { antes: z0, despues: z1 }
      // Y a 150 % forzado: ¿se rompe la pantalla?
      await abierta.app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0]?.webContents.setZoomFactor(1.5),
      )
      await win.waitForTimeout(600)
      await win.screenshot({ path: join(SALIDA, `${tema}-zoom150-proyecto.png`) })
      registro['zoom150-desborde'] = await win.evaluate(() => ({
        anchoDoc: document.documentElement.scrollWidth,
        anchoVista: innerWidth,
      }))
      await win.keyboard.press('Control+1')
      await win.waitForTimeout(600)
      await win.screenshot({ path: join(SALIDA, `${tema}-zoom150-proyectos.png`) })
      await abierta.app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0]?.webContents.setZoomFactor(1),
      )
    }
  } catch (e) {
    registro[`${tema}/error`] = String(e).slice(0, 1000)
    console.log('✘', tema, String(e).slice(0, 400))
  } finally {
    await app?.close()
  }
}

await writeFile(join(SALIDA, 'registro.json'), JSON.stringify(registro, null, 2))
console.log('Listo:', SALIDA)
