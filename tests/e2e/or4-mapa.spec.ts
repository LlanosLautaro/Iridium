// OR-I4 con la app abierta y el motor falso: el Mapa de un proyecto en operación con frentes (W-7, A-5). Manda el
// frente activo (su paso, su Próximo paso, su trabajo en curso y sus preguntas); debajo, los que esperan y los que
// están en operación, cada uno a su `estado.md`; un T-n lleva a Trabajo.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

async function proyecto(nombre: string, archivos: Record<string, string>) {
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(raiz, nombre, ruta, '..'), { recursive: true })
    await writeFile(join(raiz, nombre, ruta), texto)
  }
}
const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})

const ESTADO = `# Estado del proyecto

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 8 | Pruebas | hecho | |
| 9 | Lanzamiento | hecho | |
| 10 | Operación | en curso | \`10-operacion.md\` |

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Revisión (\`modulos/revision/estado.md\`) | producto hermano | en operación | hecho |
| Orden (\`modulos/orden/estado.md\`) | sección | 4. UX | en curso |
| Diseño (T-5) | sección | 1. Propuesta | pendiente |
| Capacidades (T-6) | sección | 1. Propuesta | pendiente |

## Preguntas abiertas
- **Q-139 — ¿Las pantallas van así?**
  Tipo: decisión · frena · Frente: Orden
  Opciones: A) Sí · B) Cambiar algo

## Próximo paso
Seguir con Orden.
`

// Una tabla más ancha que la sección: se desplaza dentro de su recuadro (A-10).
const columnas = Array.from({ length: 9 }, (_, i) => `Columna ${i + 1}`)
const TABLA_ANCHA = [
  `| ${columnas.join(' | ')} |`,
  `|${'---|'.repeat(9)}`,
  `| ${columnas.map(() => 'una celda con bastante texto').join(' | ')} |`,
  '',
].join('\n')

const ORDEN = `# Estado del módulo: Orden

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho | \`propuesta.md\` |
| 4. UX | en curso | |

## Próximo paso
Con las pantallas aprobadas, reescribir 04-ux.md sin capas.
`

const REVISION = `# Estado del módulo: Revisión

## Progreso
| Paso | Estado |
|---|---|
| 1. Propuesta | hecho |
`

const TRABAJO = `# Trabajo

## T-5 — Diseño
Estado: pendiente · Fecha: 2026-11-01

## T-6 — Capacidades
Estado: pendiente · Fecha: 2026-11-01

## T-12 — Bandeja agrupada por frente
Estado: en curso · Frente: Orden · Fecha: 2026-11-06
Con filtros arriba, no una pestaña por frente.
`

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
  await proyecto('Alfa', {
    '.proyecto.json': ficha,
    'docs/README.md': '# Docs\n\n**Framework:** 2026-11-06\n',
    'docs/estado.md': ESTADO,
    'docs/trabajo.md': TRABAJO,
    'docs/10-operacion.md': `# Operación\n\nEn marcha.\n\n${TABLA_ANCHA}`,
    'docs/modulos/orden/estado.md': ORDEN,
    'docs/modulos/revision/estado.md': REVISION,
  })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('el Mapa en operación: el frente activo, los que esperan y los que están en operación (W-7)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Mapa' })
    .click()
  const mapa = win.locator('[data-seccion="mapa"]')
  await expect(mapa.locator('.hitos .tot')).toHaveText('2 de 3 hechos')
  await expect(mapa.getByRole('button', { name: 'Abrir 10-operacion.md' })).toBeVisible()

  const bloque = mapa.getByRole('region', { name: 'Frentes' })
  await expect(bloque.locator('.fr-cab h3')).toHaveText('Orden')
  await expect(bloque.locator('.fr-paso')).toHaveText('4. UX · en curso')
  await expect(bloque.locator('.fr-texto')).toContainText('reescribir 04-ux.md sin capas')
  await expect(bloque.locator('button.fila-mapa', { hasText: 'T-12' })).toContainText(
    'Bandeja agrupada por frente',
  )
  await expect(bloque.locator('.espera-fila')).toHaveText([/Q-139.*¿Las pantallas van así\?.*!/])
  const otros = bloque.locator('.fr-otros')
  await expect(otros.locator('.rot')).toHaveText(['En espera', 'En operación'])
  await expect(otros).toContainText('En esperaDiseño·Capacidades')
  await expect(otros).toContainText('En operaciónRevisión')
  await win.screenshot({ path: 'test-results/or4-mapa.png' })

  // Un frente en operación abre su estado.md; Atrás vuelve.
  await otros.getByRole('button', { name: 'Revisión' }).click()
  const docs = win.locator('[data-seccion="docs"]')
  await expect(docs.locator('.barra-doc .nom')).toHaveText('modulos/revision/estado.md')
  await docs.getByRole('button', { name: 'Atrás' }).click()

  // Un T-n en curso abre Trabajo con ese ítem desplegado.
  await bloque.locator('button.fila-mapa', { hasText: 'T-12' }).click()
  const trabajo = win.locator('[data-seccion="trabajo"]')
  await expect(trabajo).toBeVisible()
  await expect(trabajo).toContainText('Con filtros arriba, no una pestaña por frente.')

  // Una pregunta lleva a la Bandeja de entrada.
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Mapa' })
    .click()
  await bloque.locator('.espera-fila').click()
  await expect(win.locator('[data-seccion="pendientes"]')).toBeVisible()
  await app.close()
})

test('Docs: una tabla usa el ancho de la sección y se desplaza dentro de su recuadro (A-10)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Mapa' })
    .click()
  await win.locator('[data-seccion="mapa"]').getByRole('button', { name: 'Abrir 10-operacion.md' }).click()
  const docs = win.locator('[data-seccion="docs"]')
  await expect(docs.locator('.gp-tabla-caja')).toBeVisible()
  const medidas = await docs.evaluate((d) => {
    const caja = d.querySelector<HTMLElement>('.gp-tabla-caja')
    const lectura = d.querySelector<HTMLElement>('.lectura')
    return {
      caja: caja?.getBoundingClientRect().width ?? 0,
      parrafo: d.querySelector('.doc-texto p')?.getBoundingClientRect().width ?? 0,
      lectura: lectura?.clientWidth ?? 0,
      seDesplaza: (caja?.scrollWidth ?? 0) > (caja?.clientWidth ?? 0),
      paginaQuieta: (lectura?.scrollWidth ?? 0) <= (lectura?.clientWidth ?? 0),
    }
  })
  // Más ancha que el texto y no más que la sección; se desplaza ella, no la página.
  expect(medidas.caja).toBeGreaterThan(medidas.parrafo + 40)
  expect(medidas.caja).toBeLessThanOrEqual(medidas.lectura)
  expect(medidas.seDesplaza).toBe(true)
  expect(medidas.paginaQuieta).toBe(true)
  await win.screenshot({ path: 'test-results/or4-tabla.png' })
  await app.close()
})
