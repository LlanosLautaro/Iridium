// OR-I4 con la app abierta y el motor falso: Docs con una tabla ancha (A-10), abierta desde el Mapa de un proyecto en
// operación. El Mapa en operación se prueba en ma2-mapa.spec.ts (MA-I2).
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

// Una tabla más ancha que la sección: se desplaza dentro de su recuadro (A-10). Las celdas llevan palabras que no se
// cortan: con palabras sueltas (o rutas, que se cortan en las barras) la tabla se aprieta y entra.
const columnas = Array.from({ length: 9 }, (_, i) => `Columna ${i + 1}`)
const TABLA_ANCHA = [
  `| ${columnas.join(' | ')} |`,
  `|${'---|'.repeat(9)}`,
  `| ${columnas.map(() => '`estado_del_modulo_de_revision`').join(' | ')} |`,
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
