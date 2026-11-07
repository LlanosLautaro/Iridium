// OR-I3, W-11 y H-18 con la app abierta: Trabajo muestra los `T-n` con filtros por estado y por frente, deja plegados
// los hechos, despliega cada ítem con su origen, abre un `T-n` desde un enlace y anota una idea sin la IA (con
// Reintentar si no pudo escribir).
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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
  await chmod(join(raiz, 'Alfa', 'docs', 'trabajo.md'), 0o666).catch(() => {})
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('Trabajo: filtros, hechos plegados, el ítem desplegado y un T-n desde un enlace', async () => {
  const { app, win } = await abrir()
  try {
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
    await barra.getByRole('button', { name: 'Trabajo' }).click()
    const trabajo = win.locator('[data-seccion="trabajo"]')
    await expect(trabajo.locator('.cab-1 > .n')).toHaveText('5')
    const filtros = trabajo.getByRole('group', { name: 'Filtrar por estado' })
    await expect(filtros.getByRole('button')).toHaveText([
      'Todos 4',
      'En curso 1',
      'Pendientes 1',
      'Nuevas 1',
      'Hechos 1',
      'Sin estado 1',
    ])
    // Dos frentes (Orden y el núcleo): aparece el menú.
    await expect(trabajo.getByRole('combobox', { name: 'Filtrar por frente' })).toBeVisible()

    // Todos: lo que falta por grupo; los hechos, plegados al final.
    await expect(trabajo.locator('.tb-grupo-t')).toHaveText([
      'En curso 1',
      'Pendientes 1',
      'Nuevas 1',
      'Hechos 1',
      'Sin estado 1',
    ])
    await expect(trabajo.locator('.tb-item')).toHaveCount(4)
    await trabajo.locator('.tb-grupo-t.plegable', { hasText: 'Hechos' }).click()
    await expect(trabajo.locator('.tb-item[data-codigo="T-4"]')).toBeVisible()

    // El ítem se despliega con su texto y su origen enlazado.
    await trabajo.locator('.tb-item[data-codigo="T-1"] .tb-fila').click()
    const t1 = trabajo.locator('.tb-item[data-codigo="T-1"]')
    await expect(t1).toContainText('Con filtros arriba')
    await expect(t1.locator('.tb-datos a', { hasText: 'D-2' })).toBeVisible()
    await win.screenshot({ path: 'test-results/or3-trabajo.png' })

    // Del origen a D-2 en Docs, y de su T-3 de vuelta a Trabajo, desplegado.
    await t1.locator('.tb-datos a', { hasText: 'D-2' }).click()
    await expect(win.locator('[data-seccion="docs"] .barra-doc .nom')).toHaveText('decisiones.md')
    await win.locator('[data-seccion="docs"] a.gp-codigo-enlace', { hasText: 'T-3' }).click()
    await expect(trabajo).toBeVisible()
    await expect(trabajo.locator('.tb-item[data-codigo="T-3"]')).toHaveClass(/abierto/)

    // El filtro por estado.
    await filtros.getByRole('button', { name: /^Hechos/ }).click()
    await expect(trabajo.locator('.tb-item')).toHaveCount(1)
  } finally {
    await app.close()
  }
})

test('anotar una idea sin la IA: aparece marcada; si no puede escribir, el texto queda con Reintentar', async () => {
  const { app, win } = await abrir()
  try {
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
    await barra.getByRole('button', { name: 'Trabajo' }).click()
    const trabajo = win.locator('[data-seccion="trabajo"]')
    await trabajo.getByRole('button', { name: 'Anotar una idea' }).click()
    const campo = trabajo.getByRole('textbox', { name: 'Anotar una idea' })
    await expect(campo).toBeFocused()
    await campo.fill('Un atajo para Seguí')
    await campo.press('Enter')
    await expect(campo).toHaveValue('')
    const nueva = trabajo.locator('.tb-item[data-codigo="T-6"]')
    await expect(nueva).toHaveClass(/recien/)
    await expect(nueva).toContainText('Un atajo para Seguí')
    await win.screenshot({ path: 'test-results/or3-anotar.png' })
    const archivo = join(raiz, 'Alfa', 'docs', 'trabajo.md')
    expect(await readFile(archivo, 'utf8')).toMatch(
      /## T-6 — Un atajo para Seguí\nEstado: nueva · Fecha: \d{4}-\d{2}-\d{2}\n$/,
    )

    // Solo lectura: no se puede escribir; el texto queda en el campo.
    await chmod(archivo, 0o444)
    await campo.fill('Otra idea')
    await campo.press('Enter')
    await expect(trabajo.getByRole('alert')).toContainText('No se pudo escribir en docs/trabajo.md')
    await expect(campo).toHaveValue('Otra idea')
    await win.screenshot({ path: 'test-results/or3-anotar-error.png' })
    await chmod(archivo, 0o666)
    await trabajo.getByRole('button', { name: 'Reintentar' }).click()
    await expect(campo).toHaveValue('')
    await expect(trabajo.locator('.tb-item[data-codigo="T-7"]')).toContainText('Otra idea')
  } finally {
    await app.close()
  }
})
