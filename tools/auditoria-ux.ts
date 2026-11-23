// Frente Orden, paso 3 (modulos/orden/auditoria.md): una captura de cada pantalla de Iridium con los proyectos reales,
// el motor falso y una carpeta de datos aparte. Solo mira: no manda mensajes ni toca nada de los proyectos.
// Cada paso que falla queda anotado y el recorrido sigue. Capturas en tools/salida/auditoria/ (no van al repo, D-082).
// Uso: pnpm build && node --experimental-strip-types tools/auditoria-ux.ts [ruta del .exe] [ancho] [alto] [--app-hoy]
// Con --app-hoy, las que tienen maqueta se copian también a docs/diseno/app-hoy/ con su nombre (DS-7, DI-I3): la app
// de hoy al lado de su maqueta. Esa carpeta no va al repo (son los proyectos reales, D-082).
// Con AUDITORIA_TOKENS=<archivo .css>, pone esos tokens encima de los de la app (el frente Diseño prueba así una
// dirección visual sin tocar el código) y deja las capturas en una carpeta con el nombre del archivo.
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { _electron as electron } from '@playwright/test'

const appHoy = process.argv.includes('--app-hoy')
const args = process.argv.slice(2).filter((a) => a !== '--app-hoy')
const exe = args[0] && args[0] !== '-' ? args[0] : undefined
const ancho = Number(args[1] ?? 1440)
const alto = Number(args[2] ?? 900)
const tokens = process.env.AUDITORIA_TOKENS
const SALIDA = `tools/salida/auditoria/${ancho}x${alto}${tokens ? `-${basename(tokens, '.css')}` : ''}`
await rm(SALIDA, { recursive: true, force: true })
await mkdir(SALIDA, { recursive: true })

// La carpeta de proyectos y la carpeta Iridium del usuario, de su config.json.
const real = JSON.parse(
  await readFile(join(process.env.APPDATA ?? '', 'Centro de Desarrollo', 'config.json'), 'utf8'),
) as { raiz: string; carpetaIridium?: string }
const datos = await mkdtemp(join(tmpdir(), 'iridium-auditoria-'))
await writeFile(
  join(datos, 'config.json'),
  JSON.stringify({
    version: 1,
    raiz: real.raiz,
    carpetaIridium: real.carpetaIridium ?? join(real.raiz, '.iridium'),
    nombreUsuario: 'Usuario',
  }),
)

const env = { ...process.env } as Record<string, string>
delete env.ELECTRON_RUN_AS_NODE
Object.assign(env, {
  IRIDIUM_DATOS: datos,
  IRIDIUM_MOTOR: 'falso',
  IRIDIUM_REVISION: 'no',
  IRIDIUM_OCULTA: '1',
})
env.IRIDIUM_VSCODE = 'falso'

const app = await electron.launch(exe ? { executablePath: exe, env } : { args: ['.'], env })
const win = await app.firstWindow()
await win.setViewportSize({ width: ancho, height: alto })
if (tokens) {
  const css = await readFile(tokens, 'utf8')
  await win.waitForLoadState('domcontentloaded')
  await win.addStyleTag({ content: css })
}

const fallas: string[] = []
const hechos: string[] = []
let n = 0
async function paso(nombre: string, hacer: () => Promise<unknown>) {
  n++
  const id = `${String(n).padStart(2, '0')}-${nombre}`
  try {
    await hacer()
    await win.waitForTimeout(450)
    await win.screenshot({ path: `${SALIDA}/${id}.png` })
    hechos.push(id)
    console.log('ok', id)
  } catch (e) {
    fallas.push(`${id}: ${(e as Error).message.split('\n')[0]}`)
    console.log('FALLA', id)
    await win.screenshot({ path: `${SALIDA}/${id}-falla.png` }).catch(() => {})
    await win.keyboard.press('Escape').catch(() => {})
  }
}
const delProyecto = (nombre: string) =>
  win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: nombre, exact: true })

await paso('arranque', () => win.waitForSelector('.tarjeta', { timeout: 60_000 }))
await paso('grilla', () =>
  win.waitForSelector('[data-motor]:not([data-motor="verificando"])', { state: 'attached', timeout: 30_000 }),
)
const archivados = win.getByRole('switch', { name: /Archivados/ })
await paso('grilla-archivados', () => archivados.click())
await archivados.click().catch(() => {})
await paso('tarjeta-menu', () => win.locator('.tarjeta').first().click({ button: 'right' }))
await win.keyboard.press('Escape')
await paso('nuevo-proyecto', () => win.getByRole('button', { name: 'Nuevo proyecto' }).click())
await win.keyboard.press('Escape')
await paso('ancho-chico-grilla', async () => {
  await win.setViewportSize({ width: 1024, height: 700 })
})
await win.setViewportSize({ width: ancho, height: alto })

// Las secciones de afuera de los proyectos.
for (const [nombre, atajo] of [
  ['skills', '2'],
  ['ideas', '3'],
] as const) {
  await paso(nombre, async () => {
    await win.keyboard.press(`Control+${atajo}`)
    await win.waitForTimeout(1200)
  })
}
await paso('skills-detalle', async () => {
  await win.keyboard.press('Control+2')
  // La primera skill de la lista; sin skills, el Framework (que va primero).
  const skill = win.locator('.sk-columna .fila:not(.sk-framework)')
  await ((await skill.count()) > 0 ? skill.first() : win.locator('.sk-columna .sk-framework')).click()
})
// La primera idea que se abre en el lugar (los enlaces no se abren: se revisan), T-53. Sin ideas sueltas no hay
// detalle: el del proyecto sale después, en su sección Ideas.
const abrirIdea = async () => {
  const idea = win.locator('.idp-abrir[aria-expanded]')
  await idea.first().waitFor({ timeout: 5000 })
  await idea.first().click()
}
await win.keyboard.press('Control+3')
if ((await win.locator('.idp-abrir[aria-expanded]').count()) > 0) await paso('ideas-detalle', abrirIdea)
else console.log('sin ideas sueltas: el detalle sale en el proyecto')

// Ajustes, cada sección.
await paso('ajustes', () => win.keyboard.press('Control+,'))
const seccionesAjustes = await win
  .getByRole('navigation', { name: 'Secciones de Ajustes' })
  .getByRole('button')
  .allTextContents()
  .catch(() => [] as string[])
for (const s of seccionesAjustes) {
  await paso(`ajustes-${s.trim().toLowerCase().replace(/\s+/g, '-')}`, () =>
    win
      .getByRole('navigation', { name: 'Secciones de Ajustes' })
      .getByRole('button', { name: s.trim(), exact: true })
      .click(),
  )
}
await win.keyboard.press('Escape')

// Un proyecto, este, en cada una de sus secciones. Su tarjeta lleva el nombre de la ficha (OR-10) o el de la carpeta.
const ESTE = '.tarjeta[title^="Iridium ·"], .tarjeta[title^="Centro de Desarrollo"]'
await win.keyboard.press('Control+1')
await paso('proyecto-entrada', async () => {
  await win.locator(ESTE).first().click()
  // Abre en la última sección que se miró (Frentes, la Bandeja…).
  await win.waitForSelector('[data-seccion]', { timeout: 30_000 })
  await win.waitForTimeout(1000)
})
const secciones = await win
  .getByRole('navigation', { name: 'Secciones del proyecto' })
  .getByRole('button')
  .evaluateAll((bs) =>
    bs.map((b) => b.getAttribute('aria-label') ?? b.getAttribute('title') ?? b.textContent ?? ''),
  )
  .catch(() => [] as string[])
console.log('secciones del proyecto:', secciones)
for (const s of secciones) {
  const corto = (s.split(',')[0] ?? s).trim()
  await paso(`proyecto-${corto.toLowerCase().replace(/\s+/g, '-')}`, async () => {
    await delProyecto(s).click()
    await win.waitForTimeout(1000)
  })
}
// El chat del proyecto: la lista de «/» y el + (Paridad, PA-I1 y PA-I2).
const cuadro = win.getByRole('textbox', { name: 'Mensaje para la IA' })
await paso('chat-comandos', async () => {
  await win.keyboard.press('Escape')
  await cuadro.click()
  await cuadro.fill('/')
  await win.waitForTimeout(600)
})
await cuadro.fill('').catch(() => {})
await paso('chat-mas', () => win.getByRole('button', { name: /^Agregar/ }).click())
await win.keyboard.press('Escape')
// Frentes con el segundo frente elegido (el primero es el que abre).
await paso('proyecto-frentes-otro', async () => {
  await delProyecto('Frentes').click()
  await win.getByRole('tablist', { name: 'Frentes' }).getByRole('tab').nth(1).click()
})
await paso('proyecto-ideas-detalle', async () => {
  await win.keyboard.press('Escape') // la última sección puede ser un cuadro (Ajustes)
  await delProyecto('Ideas').click()
  await abrirIdea()
})
await paso('proyecto-ancho-chico', async () => {
  await win.keyboard.press('Escape')
  await delProyecto(secciones[0] ?? 'Pendientes y scripts').click()
  await win.setViewportSize({ width: 1024, height: 700 })
  await win.waitForTimeout(600)
})
await win.setViewportSize({ width: ancho, height: alto })

// Otro proyecto cualquiera (el segundo de la grilla), para ver uno que no es Iridium.
await paso('otro-proyecto', async () => {
  await win.keyboard.press('Control+1')
  await win
    .locator(`.tarjeta:not(${ESTE.split(', ').join('):not(')})`)
    .first()
    .click()
  await win.waitForTimeout(1500)
})
await paso('otro-proyecto-frentes', () => delProyecto('Frentes').click())

await app.close()
await writeFile(`${SALIDA}/fallas.txt`, fallas.join('\n'))
console.log(fallas.length ? `Fallaron ${fallas.length}:\n${fallas.join('\n')}` : 'Sin fallas.')

// La app de hoy con el nombre de su maqueta (DS-7). Los pasos sin maqueta (el menú de la tarjeta) no van.
if (appHoy) {
  const MAQUETA: Record<string, string> = {
    grilla: 'grilla',
    'grilla-archivados': 'archivados',
    'nuevo-proyecto': 'nuevo-proyecto',
    skills: 'skills',
    'skills-detalle': 'skill',
    ideas: 'ideas',
    ajustes: 'ajustes',
    'proyecto-entrada': 'bandeja',
    'proyecto-bandeja-de-entrada': 'bandeja',
    'proyecto-frentes': 'mapa',
    'proyecto-revision': 'revision',
    'proyecto-diseno': 'diseno',
    'proyecto-docs': 'docs',
    'proyecto-archivos': 'archivos',
    'proyecto-git': 'git',
    'proyecto-scripts': 'scripts',
    'proyecto-ancho-chico': 'ancho-chico',
  }
  const destino = 'docs/diseno/app-hoy'
  await rm(destino, { recursive: true, force: true })
  await mkdir(destino, { recursive: true })
  let copiadas = 0
  for (const id of hechos) {
    const sinAcentos = id.replace(/^\d+-/, '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    const maqueta = MAQUETA[sinAcentos]
    if (!maqueta) continue
    await copyFile(`${SALIDA}/${id}.png`, `${destino}/${maqueta}.png`)
    copiadas++
  }
  console.log(`${copiadas} capturas en ${destino}/`)
}
