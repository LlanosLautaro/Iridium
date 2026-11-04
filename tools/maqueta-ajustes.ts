// Maqueta de la ventana de Ajustes (módulo Apariencia): saca de la app real, en el tema Carbón, la vista del proyecto
// que va de fondo (docs/ui/ajustes-fondo.png) y después las capturas de docs/ui/vista-ajustes.html, una por sección,
// en docs/ui/alternativas/temas/. Uso: pnpm build && node --experimental-strip-types tools/maqueta-ajustes.ts
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { _electron as electron } from '@playwright/test'

const env = { ...process.env } as Record<string, string>
delete env.ELECTRON_RUN_AS_NODE
env.IRIDIUM_DATOS = await mkdtemp(join(tmpdir(), 'iridium-maqueta-'))
env.IRIDIUM_OCULTA = '1'
const app = await electron.launch({ args: ['.'], env })
const win = await app.firstWindow()
await win.setViewportSize({ width: 1440, height: 900 })
await win.waitForSelector('.grilla:not(.carga) .tarjeta', { timeout: 60_000 })
// El bloque `data-tema="carbon"` de docs/ui/tokens.css, tal cual lo va a usar la app.
await win.evaluate(() => document.documentElement.setAttribute('data-tema', 'carbon'))
await win.click('.tarjeta[title^="Centro de Desarrollo"]')
await win.waitForSelector('[data-seccion="pendientes"] .lista-scripts', { timeout: 30_000 })
await win.waitForTimeout(600)
await win.screenshot({ path: 'docs/ui/ajustes-fondo.png' })

// La maqueta, en la misma ventana (Electron abre archivos locales).
const pagina = win
const url = pathToFileURL(resolve('docs/ui/vista-ajustes.html')).href
for (const [seccion, tema] of [
  ['perfil', 'carbon'],
  ['ia', 'carbon'],
  ['apariencia', 'carbon'],
  ['apariencia', 'iridium'],
]) {
  await pagina.goto(`${url}?tema=${tema}#${seccion}`)
  await pagina.waitForTimeout(400)
  await pagina.screenshot({
    path: `docs/ui/alternativas/temas/ajustes-${seccion}${tema === 'iridium' ? '-iridium' : ''}.png`,
  })
  console.log('listo:', seccion, tema)
}
await app.close()
