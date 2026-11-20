// Abre la app compilada con los proyectos reales (solo lectura) y saca capturas en tools/salida/.
// Uso: pnpm build && node --experimental-strip-types tools/capturas.ts [ruta del .exe empaquetado]
import { mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron } from '@playwright/test'

const SALIDA = process.argv[2] ? 'tools/salida/empaquetada' : 'tools/salida'
await mkdir(SALIDA, { recursive: true })
const exe = process.argv[2]
const env = { ...process.env } as Record<string, string>
delete env.ELECTRON_RUN_AS_NODE
env.IRIDIUM_DATOS = await mkdtemp(join(tmpdir(), 'iridium-capturas-'))
env.IRIDIUM_OCULTA = '1'

const t0 = Date.now()
const app = await electron.launch(exe ? { executablePath: exe, env } : { args: ['.'], env })
const win = await app.firstWindow()
await win.setViewportSize({ width: 1440, height: 900 })
await win.waitForSelector('.grilla:not(.carga) .tarjeta', { timeout: 60_000 })
console.log(`grilla en ${((Date.now() - t0) / 1000).toFixed(1)} s`)
await win.waitForSelector('[data-motor]:not([data-motor="verificando"])', {
  state: 'attached',
  timeout: 60_000,
})
console.log('motor:', await win.getAttribute('[data-motor]', 'data-motor'))
await win.waitForTimeout(400)
await win.screenshot({ path: `${SALIDA}/1-proyectos.png` })

await win.click('.interruptor-arch')
await win.waitForTimeout(300)
await win.screenshot({ path: `${SALIDA}/2-proyectos-archivados.png` })
await win.click('.interruptor-arch')

// Este proyecto en sus cinco secciones (D-041), con la conversación a la derecha.
const seccion = (nombre: string) =>
  win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: nombre })
    .click()
await win.click('.tarjeta[title^="Centro de Desarrollo"]')
await win.waitForSelector('[data-seccion="pendientes"] .pendientes', { timeout: 30_000 })
await win.waitForTimeout(500)
await win.screenshot({ path: `${SALIDA}/3-proyecto-entrada.png` })

// I-6: el uso real en la barra de estado con su detalle, y el contexto, el modelo y el esfuerzo de la conversación.
await win.waitForSelector('.estado-barra .uso', { timeout: 30_000 })
await win.waitForSelector('.compositor .medidor.ctx', { timeout: 30_000 }).catch(() => {})
console.log('uso:', await win.textContent('.estado-barra .uso'))
console.log('contexto:', await win.textContent('.compositor .pie-comp').catch(() => null))
await win.click('.estado-barra .uso .menu-boton')
await win.waitForTimeout(300)
await win.screenshot({ path: `${SALIDA}/8-uso-real.png` })
await win.keyboard.press('Escape')
await win.click('.compositor .elegir-ia button')
await win.waitForTimeout(300)
await win.screenshot({ path: `${SALIDA}/8-modelos-real.png` })
await win.keyboard.press('Escape')
await seccion('Mapa')
await win.waitForSelector('[data-seccion="mapa"] .hito-mapa', { timeout: 30_000 })
await win.waitForTimeout(500)
await win.screenshot({ path: `${SALIDA}/3-proyecto-mapa.png` })
// Un módulo como frente (D-063), si el proyecto tiene alguno.
const modulo = win.locator('[data-seccion="mapa"] .frente').nth(1)
if (await modulo.count()) {
  await modulo.click()
  await win.waitForTimeout(300)
  await win.screenshot({ path: `${SALIDA}/3-proyecto-mapa-frente.png` })
  await win.locator('[data-seccion="mapa"] .frente').first().click()
}
await win.locator('[data-seccion="mapa"] .hitos .pestana', { hasText: '4' }).click()
await win.waitForTimeout(300)
await win.screenshot({ path: `${SALIDA}/3-proyecto-mapa-hito-4.png` })
await win.getByRole('button', { name: 'Ver el hito actual' }).click()
await win.locator('[data-seccion="mapa"] .proximo-paso a').first().click()
await win.waitForSelector('[data-seccion="docs"] .texto-doc', { timeout: 10_000 })
await win.waitForTimeout(600)
await win.screenshot({ path: `${SALIDA}/4-proyecto-docs.png` })
await seccion('Archivos')
await win.locator('[data-seccion="archivos"] .arbol-nodo', { hasText: 'src' }).first().click()
await win.locator('[data-seccion="archivos"] .arbol-nodo', { hasText: 'main' }).first().click()
await win.locator('[data-seccion="archivos"] .arbol-nodo', { hasText: 'index.ts' }).first().click()
await win.waitForSelector('[data-seccion="archivos"] .visor-codigo', { timeout: 10_000 })
await win.waitForTimeout(300)
await win.screenshot({ path: `${SALIDA}/5-proyecto-archivos.png` })
// Git (H-16): el último commit con su primer archivo abierto. Solo se mira.
await seccion('Git')
await win.waitForSelector('[data-seccion="git"] .arbol-lista .commit', { timeout: 15_000 })
const ultimo = win
  .locator('[data-seccion="git"] .arbol-lista .commit:not(:has-text("Cambios sin guardar"))')
  .first()
await ultimo.click()
await win.waitForSelector('[data-seccion="git"] .arch button', { timeout: 15_000 })
await win.locator('[data-seccion="git"] .arch button').first().click()
await win.waitForSelector('[data-seccion="git"] .dif, [data-seccion="git"] .dif-msg', { timeout: 15_000 })
await win.waitForTimeout(300)
await win.screenshot({ path: `${SALIDA}/5-proyecto-git.png` })
await seccion('Mapa')
await win.getByRole('button', { name: 'Conversaciones anteriores', exact: true }).click()
await win.waitForSelector('.anteriores .conv', { timeout: 15_000 })
await win.waitForTimeout(300)
await win.screenshot({ path: `${SALIDA}/5-proyecto-anteriores.png` })
await win.keyboard.press('Escape')

// Skills con las carpetas reales de Claude (SK-I1): solo se mira; Pasar al framework no se toca (gasta uso).
await win.keyboard.press('Control+2')
await win.waitForSelector('.sk-columna .sk-fila', { timeout: 30_000 })
await win.waitForTimeout(800)
console.log('skills:', await win.textContent('.sk-columna .titulo'))
console.log('framework:', await win.locator('.sk-proy .datos b').allTextContents())
await win.screenshot({ path: `${SALIDA}/9-skills-framework.png` })
await win.getByTitle('impeccable', { exact: true }).click()
await win.waitForTimeout(400)
await win.screenshot({ path: `${SALIDA}/9-skills-impeccable.png` })
// Los archivos de una skill (Q-95): su carpeta de referencias abierta y el SKILL.md en el visor.
const arbolSkill = win.getByRole('navigation', { name: 'Archivos de impeccable' })
await arbolSkill.getByRole('button', { name: 'reference' }).click()
await arbolSkill.getByRole('button', { name: 'SKILL.md' }).click()
await win.waitForSelector('.sk-detalle .visor-codigo', { timeout: 10_000 })
await win.waitForTimeout(400)
await win.screenshot({ path: `${SALIDA}/9-skills-archivos.png` })
// Ideas con el ideas.md real (IN-I1): solo se mira; no se manda nada al chat.
await win.keyboard.press('Control+3')
await win.waitForSelector('.id-columna .sk-fila', { timeout: 30_000 })
await win.waitForTimeout(600)
console.log('ideas:', await win.textContent('.id-columna .titulo'))
await win.screenshot({ path: `${SALIDA}/10-ideas.png` })
const columnaIdeas = win.getByRole('navigation', { name: 'Ideas' })
await columnaIdeas.locator('.sk-grupo').nth(1).locator('.sk-fila').first().click()
await win.waitForTimeout(400)
await win.screenshot({ path: `${SALIDA}/10-ideas-para-proyectos.png` })
await columnaIdeas.getByRole('button', { name: /^Integradas/ }).click()
await columnaIdeas.locator('.sk-grupo').last().locator('.sk-fila').first().click()
await win.waitForTimeout(400)
await win.screenshot({ path: `${SALIDA}/10-ideas-integrada.png` })
await win.keyboard.press('Control+1')
await win.waitForTimeout(400)
await win.screenshot({ path: `${SALIDA}/10-grilla-sin-secciones.png` })
await app.close()
