// Capturas de docs/ui/vista-orden.html (frente Orden, paso 6): una por pieza y por tema, en docs/ui/capturas-orden/.
// Uso: node --experimental-strip-types tools/maqueta-orden.ts (usa el Chromium de Playwright, o Edge si no está).
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

const navegador = await chromium.launch().catch(() => chromium.launch({ channel: 'msedge' }))
const pagina = await navegador.newPage({
  viewport: { width: 1240, height: 900 },
  deviceScaleFactor: 1.5,
})
const url = pathToFileURL(resolve('docs/ui/vista-orden.html')).href
const piezas = [
  'principal',
  'cuentas',
  'cabecera',
  'anotar',
  'control',
  'tarjeta',
  'carpeta',
  'frentes',
  'actualizar',
  'bandeja',
]
for (const tema of ['iridium', 'carbon']) {
  await pagina.goto(`${url}?tema=${tema}`)
  await pagina.evaluate(() => document.fonts.ready)
  await pagina.screenshot({
    path: `docs/ui/capturas-orden/todo-${tema}.png`,
    fullPage: true,
  })
  for (const [i, pieza] of piezas.entries()) {
    const n = String(i + 1).padStart(2, '0')
    await pagina.locator(`#${pieza}`).screenshot({ path: `docs/ui/capturas-orden/${n}-${pieza}-${tema}.png` })
  }
  console.log('listo:', tema)
}
await navegador.close()
