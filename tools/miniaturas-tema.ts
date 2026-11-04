// Las miniaturas de los temas para Ajustes › Apariencia (AJ-1): abre la app compilada con los proyectos reales (solo
// lectura) y el motor falso, una vez con cada tema, y guarda la vista de este proyecto achicada en
// src/renderer/assets/temas/. Uso: pnpm build && node --experimental-strip-types tools/miniaturas-tema.ts
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron } from '@playwright/test'

const ANCHO = 640

for (const tema of ['iridium', 'carbon']) {
  const env = { ...process.env } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  env.IRIDIUM_DATOS = await mkdtemp(join(tmpdir(), 'iridium-miniaturas-'))
  env.IRIDIUM_MOTOR = 'falso'
  env.IRIDIUM_REVISION = 'no'
  env.IRIDIUM_TEMA = tema
  env.IRIDIUM_OCULTA = '1'
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  await win.waitForSelector('.grilla:not(.carga) .tarjeta', { timeout: 60_000 })
  await win.click('.tarjeta[title^="Centro de Desarrollo"]')
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Mapa' })
    .click()
  await win.waitForSelector('[data-seccion="mapa"] .hito-card', { timeout: 30_000 })
  await win.waitForTimeout(600)
  const captura = (await win.screenshot()).toString('base64')
  // Se achica en la misma página (un canvas) para no sumar dependencias.
  const jpg = await win.evaluate(
    async ({ png, ancho }) => {
      const img = new Image()
      img.src = `data:image/png;base64,${png}`
      await img.decode()
      const c = document.createElement('canvas')
      c.width = ancho
      c.height = Math.round((img.height * ancho) / img.width)
      const g = c.getContext('2d')
      if (!g) throw new Error('Sin canvas')
      g.imageSmoothingQuality = 'high'
      g.drawImage(img, 0, 0, c.width, c.height)
      return c.toDataURL('image/jpeg', 0.85).split(',')[1] ?? ''
    },
    { png: captura, ancho: ANCHO },
  )
  await writeFile(`src/renderer/assets/temas/${tema}.jpg`, Buffer.from(jpg, 'base64'))
  console.log(`${tema}.jpg`)
  await app.close()
}
