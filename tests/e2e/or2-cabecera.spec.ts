// OR-I2 con la app abierta y el motor falso: la cabecera común de las secciones (04-ux.md › W-9). Cada sección del
// proyecto la lleva con su título, a la misma altura y en el mismo lugar; los filtros van en su segunda fila, fijos
// arriba; vacía, una línea de para qué es. En el inicio, Proyectos usa la misma.
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

const estado = (preguntas: string) => `# Estado del proyecto

**Última actualización:** 2026-11-07

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 10 | Operación | en curso | \`10-operacion.md\` |

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Compartir (\`modulos/compartir/estado.md\`) | sección | 7. Construcción | en curso |

## Preguntas abiertas
${preguntas}

## Próximo paso
Hacer la grilla.
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
    'docs/estado.md': estado(`- **Q-1 — ¿Lista o grilla?**
  Tipo: decisión
  Contexto: la pantalla principal.
  Opciones: A) Lista (recomendada: entra más) · B) Grilla
- **Q-2 — Probá el enlace**
  Tipo: prueba · Frente: Compartir
  Contexto: el enlace nuevo.
  - [ ] Abre la copia`),
    'docs/scripts.md': '# Scripts\n\n## Abrir la app\nLa abre.\n**Ejecutar:** `echo hola`\n',
  })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

const SECCIONES: [boton: string, titulo: string][] = [
  ['Bandeja de entrada', 'Bandeja de entrada'],
  ['Frentes', 'Frentes'],
  ['Ideas', 'Ideas'],
  ['Revisión', 'Revisión'],
  ['Diseño', 'Diseño'],
  ['Archivos', 'Archivos'],
  ['Git', 'Git'],
  ['Scripts', 'Scripts'],
]

/** La altura de la Cabecera de sección (PZ-9): el relleno, la fila de un campo y su línea; con los Filtros (PZ-6), más
 * (con fracciones de píxel por la letra: se redondea). */
const ALTO = 61
const ALTO_CON_FILTROS = 89

test('cada sección del proyecto lleva la misma cabecera, a la misma altura, con los filtros abajo', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
  const cajas: { top: number; height: number; filtros: boolean }[] = []
  for (const [boton, titulo] of SECCIONES) {
    await barra.getByRole('button', { name: new RegExp(`^${boton}`) }).click()
    const cab = win.locator('.seccion-vista:not([hidden]) .cabecera')
    await expect(cab.locator('.fila-cab h1')).toHaveText(new RegExp(`^${titulo}`))
    const caja = await cab.boundingBox()
    if (!caja) throw new Error(`sin cabecera en ${boton}`)
    cajas.push({ top: caja.y, height: caja.height, filtros: (await cab.locator('> .filtros').count()) > 0 })
  }
  // Todas en el mismo lugar y con la misma altura: la de la pieza (PZ-9), más alta con los filtros. La de la
  // conversación, la de las maquetas.
  const chat = await win.locator('.cab-conv').boundingBox()
  expect(chat?.height).toBe(48)
  for (const c of cajas) {
    expect(c.top).toBe(cajas[0]?.top)
    expect(Math.round(c.height)).toBe(c.filtros ? ALTO_CON_FILTROS : ALTO)
  }

  // La Bandeja: la cuenta junto al título y los filtros por frente en la segunda fila, fijos al desplazar.
  await barra.getByRole('button', { name: /^Bandeja de entrada/ }).click()
  const bandeja = win.locator('[data-seccion="pendientes"]')
  await expect(bandeja.locator('.fila-cab h1 > .cuenta')).toHaveText('2')
  const filtros = bandeja.locator('.cabecera > .filtros').getByRole('group', { name: 'Filtrar por frente' })
  await expect(filtros).toContainText('Todos 2')
  await expect(filtros).toContainText('Compartir 1')
  await filtros.getByRole('button', { name: /^Compartir/ }).click()
  await expect(bandeja.locator('.pregunta')).toHaveCount(1)
  await win.screenshot({ path: 'test-results/or2-cabecera-bandeja.png' })

  // Revisión: los grupos son los filtros de la cabecera.
  await barra.getByRole('button', { name: /^Revisión/ }).click()
  await win.screenshot({ path: 'test-results/or2-cabecera-revision.png' })

  // Scripts: la cuenta.
  await barra.getByRole('button', { name: 'Scripts' }).click()
  await expect(win.locator('[data-seccion="scripts"] .fila-cab h1 > .cuenta')).toHaveText('1')
  await app.close()
})

test('en el inicio, Proyectos usa la misma cabecera', async () => {
  const { app, win } = await abrir()
  const proyectos = win.locator('.grilla-proyectos .cabecera')
  await expect(proyectos.locator('h1')).toHaveText('Proyectos')
  await expect(proyectos.locator('.fila-cab h1 > .cuenta')).toHaveText('1')
  await expect(proyectos.getByRole('button', { name: 'Nuevo proyecto' })).toBeVisible()
  expect((await proyectos.boundingBox())?.height).toBe(ALTO)
  await app.close()
})
