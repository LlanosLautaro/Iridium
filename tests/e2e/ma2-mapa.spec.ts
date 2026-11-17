// MA-I2 con la app abierta y el motor falso: el Mapa en operación (D-141, D-144, D-145). La barra de frentes, el
// camino con sus marcas y ramas, «Te espera» que lleva a la Bandeja, «En pausa», lo aprobado sin lugar en la ruta y
// «Por empezar» con Empezar este frente, que lo cita en la conversación sin enviar.
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
| 9 | Lanzamiento | hecho | |
| 10 | Operación | en curso | \`10-operacion.md\` |

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Notas (\`modulos/notas/estado.md\`) | sección | en operación | hecho |
| Galería (\`modulos/galeria/estado.md\`) | sección | 7. Construcción | en curso |
| Avisos (\`modulos/avisos/estado.md\`) | sección | 8. Calidad | en pausa |
| Exportar (T-20) | sección | 1. Propuesta | pendiente |

## Preguntas abiertas
- **Q-5 — ¿La grilla se ve bien?**
  Tipo: prueba · Frente: Galería

## Próximo paso
Seguir con la Galería.
`

const GALERIA = `# Estado del módulo: Galería

**Tipo:** sección (las fotos en una grilla; T-10)

## En qué estamos ahora
Construyendo la grilla.

## Ruta
- [x] Pensar para qué sirve la galería
- [x] Decidir cómo se ordenan las fotos
- [x] Importar las fotos de una carpeta (GA-I1)
- [ ] Ver las fotos en una grilla de cuatro columnas, con las miniaturas que se cargan de a poco mientras bajás (Q-5)
  - [ ] Las fotos verticales sin recortar
  - [-] Un modo mosaico
- [ ] Buscar una foto por fecha
- [ ] Borrar varias fotos a la vez

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| GA-I1 | Importar | hecho |

### GA-I1 — Importar
Hecha.
`

const AVISOS = `# Estado del módulo: Avisos

## Ruta
- [x] Avisar cuando termina una copia
- [ ] Sonar al terminar
- [ ] Avisar en el celular
`

const NOTAS = `# Estado del módulo: Notas

## Ruta
- [x] Crear una nota
- [x] Buscar entre las notas
- [x] Exportar una nota
`

const TRABAJO = `# Trabajo

## T-10 — Una galería de fotos
Estado: en curso · Frente: Galería · Fecha: 2026-11-17

## T-12 — Compartir una foto por enlace
Estado: pendiente · Frente: Galería · Fecha: 2026-11-17

## T-20 — Exportar
Estado: pendiente · Fecha: 2026-11-17

## T-21 — Exportar a PDF
Estado: pendiente · Frente: Exportar · Fecha: 2026-11-17

## T-30 — Medir cuánto tarda en abrir
Estado: en curso · Fecha: 2026-11-17

## T-31 — Un sonido para cuando termina de copiar, que no suene mientras sigue esperando a que lleguen las fotos
Estado: pendiente · Fecha: 2026-11-17
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
    'docs/README.md': '# Docs\n\n**Framework:** 2026-11-17\n',
    'docs/estado.md': ESTADO,
    'docs/trabajo.md': TRABAJO,
    'docs/10-operacion.md': '# Operación\n\nEn marcha.\n',
    'docs/modulos/galeria/estado.md': GALERIA,
    'docs/modulos/avisos/estado.md': AVISOS,
    'docs/modulos/notas/estado.md': NOTAS,
  })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

async function alMapa(win: Page) {
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Mapa' })
    .click()
  return win.locator('[data-seccion="mapa"]')
}

test('el Mapa en operación: la barra, el camino del activo y lo que espera (MA-1 a MA-4, MA-8)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const mapa = await alMapa(win)
  await expect(mapa.locator('.cab-seccion')).toContainText('Hito 10 · Operación')
  // El activo primero, después en el orden de la tabla y «Por empezar» con su cuenta (MA-3).
  const barra = mapa.getByRole('tablist', { name: 'Frentes' })
  await expect(barra.getByRole('tab')).toHaveText(['Galería', 'Notas', 'Avisos', 'Por empezar3'])
  await expect(barra.getByRole('tab', { name: 'Galería' })).toHaveAttribute('aria-selected', 'true')

  const frente = mapa.getByRole('region', { name: 'Galería' })
  await expect(frente.locator('.estado-frente')).toHaveText('En curso')
  const camino = frente.locator('.camino')
  // Los hechos antes del último, plegados; sin códigos a la vista (MA-1, MA-4).
  await expect(camino.locator('.tramo.principal .nombre-tramo')).toHaveText([
    '2 hechos antes',
    'Importar las fotos de una carpeta',
    'Ver las fotos en una grilla de cuatro columnas, con las miniaturas que se cargan de a poco mientras bajás',
    'Buscar una foto por fecha',
    'Borrar varias fotos a la vez',
  ])
  await expect(frente).not.toContainText('Q-5')
  await expect(frente).not.toContainText('GA-I1')
  // El que sigue nombra una pregunta abierta: «Te espera» en lugar del resalte (MA-2).
  const espera = camino.locator('.tramo.espera').first()
  await expect(espera).toContainText('Te espera')
  await expect(camino.locator('.tramo.foco')).toHaveCount(0)
  // Sus ramas: lo que viene y lo descartado, tachado.
  await expect(camino.locator('.tramo.rama .nombre-tramo')).toHaveText([
    'Las fotos verticales sin recortar',
    'Un modo mosaico',
  ])
  await expect(camino.locator('.tramo.rama.descartado')).toHaveText('Un modo mosaico')
  // Lo aprobado sin lugar en la ruta; no lo que la originó (T-10) (MA-8).
  await expect(frente.locator('.aparte-mapa .titulo-fila')).toHaveText(['Compartir una foto por enlace'])
  await win.screenshot({ path: 'test-results/ma2-mapa-frente.png' })

  // Un paso que nombra su iteración abre su sección en Docs; Atrás vuelve al Mapa en la misma pestaña.
  await camino.getByRole('button', { name: 'Importar las fotos de una carpeta' }).click()
  const docs = win.locator('[data-seccion="docs"]')
  await expect(docs.locator('.barra-doc .nom')).toHaveText('modulos/galeria/estado.md')
  await expect(docs.locator('.marcada')).toHaveText('GA-I1 — Importar')
  await docs.getByRole('button', { name: 'Atrás' }).click()

  // Los hechos de antes se despliegan.
  await camino.getByRole('button', { name: '2 hechos antes' }).click()
  await expect(camino.locator('.tramo.principal.hecho .nombre-tramo')).toHaveText([
    'Plegar los hechos de antes',
    'Pensar para qué sirve la galería',
    'Decidir cómo se ordenan las fotos',
    'Importar las fotos de una carpeta',
  ])

  // Un frente en pausa: el que sigue lleva «En pausa»; uno con todo hecho, la línea gris.
  await barra.getByRole('tab', { name: 'Avisos' }).click()
  const avisos = mapa.getByRole('region', { name: 'Avisos' })
  await expect(avisos.locator('.estado-frente')).toHaveText('En pausa')
  await expect(avisos.locator('.tramo.pausa')).toHaveText(/Sonar al terminar\s*En pausa/)
  await barra.getByRole('tab', { name: 'Notas' }).click()
  const notas = mapa.getByRole('region', { name: 'Notas' })
  await expect(notas.locator('.estado-frente')).toHaveText('En uso')
  await expect(notas).toContainText('Todo hecho por ahora. Lo que venga, la IA lo suma a la ruta.')

  // «Te espera» lleva a la Bandeja.
  await barra.getByRole('tab', { name: 'Galería' }).click()
  await frente.getByRole('button', { name: 'Te espera' }).click()
  await expect(win.locator('[data-seccion="pendientes"]')).toBeVisible()
  await app.close()
})

test('«Por empezar»: el frente que espera, lo aprobado sin frente y Empezar este frente (MA-6, MA-7)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const mapa = await alMapa(win)
  await mapa.getByRole('tab', { name: /Por empezar/ }).click()
  const lista = mapa.getByRole('region', { name: 'Por empezar' })
  // El frente que espera, con su trabajo aprobado; el que lo nombra (T-20) es el frente mismo.
  const exportar = lista.locator('.bloque').filter({ hasText: 'Exportar' }).first()
  await expect(exportar.locator('.titulo-fila')).toHaveText(['Exportar a PDF'])
  // Sin frente: lo que la IA está haciendo, primero; los títulos largos bajan de renglón.
  const sinFrente = lista.locator('.bloque').filter({ hasText: 'Sin frente' })
  await expect(sinFrente.locator('.bloque-titulo .cuenta')).toHaveText('2')
  await expect(sinFrente.locator('.titulo-fila')).toHaveText([
    'Medir cuánto tarda en abrir',
    'Un sonido para cuando termina de copiar, que no suene mientras sigue esperando a que lleguen las fotos',
  ])
  await expect(sinFrente.locator('.fila').first()).toContainText('En curso')
  const largo = await sinFrente
    .locator('.titulo-fila')
    .nth(1)
    .evaluate((e) => e.scrollWidth <= e.clientWidth)
  expect(largo).toBe(true)
  await win.screenshot({ path: 'test-results/ma2-mapa-por-empezar.png' })

  // Empezar este frente lo cita arriba del campo de la conversación, sin enviar (D-131).
  await exportar.getByRole('button', { name: 'Empezar este frente' }).click()
  await expect(win.locator('.compositor .citado')).toContainText('Exportar')
  await app.close()
})

test('en ancho chico el camino ocupa todo y «Te espera» baja debajo del nombre', async () => {
  const { app, win } = await abrir()
  await win.setViewportSize({ width: 1000, height: 800 })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const mapa = await alMapa(win)
  const espera = mapa.locator('.camino .tramo.espera').first()
  await expect(espera).toContainText('Te espera')
  const [nombre, senal] = await Promise.all([
    espera.locator('.nombre-tramo').boundingBox(),
    espera.getByRole('button', { name: 'Te espera' }).boundingBox(),
  ])
  expect(senal?.y ?? 0).toBeGreaterThan((nombre?.y ?? 0) + 4)
  await win.screenshot({ path: 'test-results/ma2-mapa-angosto.png' })
  await app.close()
})
