// Sin la sección Trabajo (D-112, DI-I3 tanda 4), con la app abierta: `docs/trabajo.md` se lee en Docs y un `T-n` de un
// enlace lo abre en ese ítem. Lo de antes (OR-I3: filtros, plegados, anotar en el proyecto) se fue con la sección;
// anotar una idea sigue en Ideas (in1-ideas.spec.ts).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

const ESTADO = `# Estado del proyecto

**Última actualización:** 2026-11-07

## Hito actual
7 — Construcción — en curso

## Preguntas abiertas
(ninguna)

## Próximo paso
Hacer T-2.
`

const TRABAJO = `# Trabajo

## T-1 — Bandeja agrupada por frente
Estado: en curso · Frente: Orden · Fecha: 2026-11-05 · Origen: D-2
Con filtros arriba, no una pestaña por frente.

## T-2 — Respaldo en GitHub
Estado: pendiente · Fecha: 2026-11-04

## T-3 — Exportar el plan como imagen
Estado: nueva · Fecha: 2026-11-06

## T-4 — La grilla
Estado: hecho · Fecha: 2026-10-30
Hecho en la I-3.

## T-5 — Algo mal escrito
Estado: completo · Fecha: 2026-11-01
`

async function escribir(ruta: string, texto: string) {
  await mkdir(join(raiz, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, ruta), texto)
}

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await escribir('Alfa/docs/estado.md', ESTADO)
  await escribir('Alfa/docs/README.md', '# Docs\n\n**Framework:** 2026-11-06\n')
  await escribir('Alfa/docs/decisiones.md', '# Decisiones\n\n## D-2 — Filtros arriba\nVer T-3.\n')
  await escribir('Alfa/docs/trabajo.md', TRABAJO)
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('sin Trabajo en la barra: un T-n abre trabajo.md en Docs, en ese ítem, y Atrás vuelve (D-112)', async () => {
  const { app, win } = await abrir()
  try {
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
    await expect(barra.getByRole('button', { name: 'Frentes' })).toBeVisible()
    await expect(barra.getByRole('button', { name: 'Trabajo' })).toHaveCount(0)

    // El «Hacer T-2» del Próximo paso de estado.md lleva a trabajo.md con T-2 a la vista.
    await barra.getByRole('button', { name: 'Docs' }).click()
    const docs = win.locator('[data-seccion="docs"]')
    await docs.locator('a.gp-codigo-enlace', { hasText: 'T-2' }).first().click()
    await expect(docs.locator('.docs-ruta')).toHaveText('trabajo.md')
    await expect(docs.locator('[id="t-2"]')).toBeInViewport()
    await win.screenshot({ path: 'test-results/or3-trabajo-en-docs.png' })
    await win.keyboard.press('Alt+ArrowLeft')
    await expect(docs.locator('.docs-ruta')).toHaveText('estado.md')
  } finally {
    await app.close()
  }
})
