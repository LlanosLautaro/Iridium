// Frente Orden, paso 3 (modulos/orden/auditoria.md): una captura de cada pantalla de Iridium con los proyectos reales,
// el motor falso y una carpeta de datos aparte. Solo mira: no manda mensajes ni toca nada de los proyectos.
// Cada paso que falla queda anotado y el recorrido sigue. Capturas en tools/salida/auditoria/ (no van al repo, D-082).
// Uso: pnpm build && node --experimental-strip-types tools/auditoria-ux.ts [ruta del .exe] [ancho] [alto]
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron } from '@playwright/test'

const exe = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : undefined
const ancho = Number(process.argv[3] ?? 1440)
const alto = Number(process.argv[4] ?? 900)
const SALIDA = `tools/salida/auditoria/${ancho}x${alto}`
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

const fallas: string[] = []
let n = 0
async function paso(nombre: string, hacer: () => Promise<unknown>) {
  n++
  const id = `${String(n).padStart(2, '0')}-${nombre}`
  try {
    await hacer()
    await win.waitForTimeout(450)
    await win.screenshot({ path: `${SALIDA}/${id}.png` })
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
  win.waitForSelector('[data-motor]:not([data-motor="verificando"])', { timeout: 30_000 }),
)
await paso('grilla-archivados', () => win.click('.interruptor'))
await win.click('.interruptor').catch(() => {})
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
  ['pendientes', '2'],
  ['skills', '3'],
  ['ideas', '4'],
] as const) {
  await paso(nombre, async () => {
    await win.keyboard.press(`Control+${atajo}`)
    await win.waitForTimeout(1200)
  })
}
await paso('skills-detalle', async () => {
  await win.keyboard.press('Control+3')
  await win.locator('.sk-columna .sk-fila').first().click()
})
await paso('ideas-detalle', async () => {
  await win.keyboard.press('Control+4')
  await win.locator('.id-columna .sk-fila').first().click()
})

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
  await win.waitForSelector('[data-seccion="pendientes"]', { timeout: 30_000 })
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
await paso('otro-proyecto-mapa', () => delProyecto('Mapa').click())

// El tema Carbón en la grilla y en un proyecto.
await paso('carbon-grilla', async () => {
  await win.keyboard.press('Control+,')
  await win
    .getByRole('navigation', { name: 'Secciones de Ajustes' })
    .getByRole('button', { name: 'Apariencia' })
    .click()
  await win.getByText('Carbón', { exact: false }).first().click()
  await win.keyboard.press('Escape')
  await win.keyboard.press('Control+1')
})
await app.close()
await writeFile(`${SALIDA}/fallas.txt`, fallas.join('\n'))
console.log(fallas.length ? `Fallaron ${fallas.length}:\n${fallas.join('\n')}` : 'Sin fallas.')
