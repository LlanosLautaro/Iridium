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
  await expect(mapa.locator('.cabecera')).toContainText('Hito 10 · Operación')
  // El activo primero, después en el orden de la tabla y «Por empezar» con su cuenta (MA-3); Notas, en uso y con
  // todo hecho, está archivada (D-152).
  const barra = mapa.getByRole('tablist', { name: 'Frentes' })
  await expect(barra.getByRole('tab')).toHaveText(['Galería', 'Avisos', 'Por empezar3'])
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
  await expect(docs.locator('.docs-ruta')).toHaveText('modulos/galeria/estado.md')
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
  // «Archivados», arriba a la derecha, la muestra después de los activos y en gris; se recuerda (R-91, D-152).
  const archivados = mapa.getByRole('switch', { name: 'Archivados' })
  await expect(mapa.locator('.cabecera')).toContainText('Archivados 1')
  await archivados.check()
  await expect(barra.getByRole('tab')).toHaveText(['Galería', 'Avisos', 'Notas', 'Por empezar3'])
  await expect(barra.getByRole('tab', { name: 'Notas' })).toHaveClass(/archivado/)
  await win.screenshot({ path: 'test-results/ma2-mapa-archivados.png' })
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

test('MA-12: un frente sin su estado.md muestra el error en su pestaña; al cambiar la ruta se redibuja en el lugar', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const mapa = await alMapa(win)
  const barra = mapa.getByRole('tablist', { name: 'Frentes' })
  const frente = mapa.getByRole('region', { name: 'Galería' })
  const camino = frente.locator('.camino')
  await camino.getByRole('button', { name: '2 hechos antes' }).click()

  // La IA cambia la ruta mientras se mira: el camino se redibuja sin plegar lo desplegado ni cambiar de pestaña.
  await writeFile(
    join(raiz, 'Alfa', 'docs/modulos/galeria/estado.md'),
    GALERIA.replace(
      '- [ ] Buscar una foto por fecha',
      '- [ ] Buscar una foto por fecha\n- [ ] Marcar fotos favoritas',
    ),
  )
  await expect(camino.locator('.tramo.principal .nombre-tramo')).toContainText(['Marcar fotos favoritas'])
  await expect(camino.getByRole('button', { name: 'Plegar los hechos de antes' })).toBeVisible()
  await expect(barra.getByRole('tab', { name: 'Galería' })).toHaveAttribute('aria-selected', 'true')

  // Se borra el estado.md de Avisos: su pestaña sigue, con el Recuadro de error; las otras andan.
  await barra.getByRole('tab', { name: 'Avisos' }).click()
  await rm(join(raiz, 'Alfa', 'docs/modulos/avisos'), { recursive: true, force: true })
  const avisos = mapa.getByRole('region', { name: 'Avisos' })
  await expect(avisos.getByRole('alert')).toContainText('docs/modulos/avisos/estado.md')
  await expect(avisos.locator('.camino')).toHaveCount(0)
  await expect(barra.getByRole('tab', { name: 'Avisos' })).toHaveAttribute('aria-selected', 'true')
  await win.screenshot({ path: 'test-results/ma3-mapa-error.png' })
  await mapa.getByRole('switch', { name: 'Archivados' }).check()
  await barra.getByRole('tab', { name: 'Notas' }).click()
  await expect(mapa.getByRole('region', { name: 'Notas' })).toContainText('Todo hecho por ahora')
  await app.close()
})

// Paso 8 del frente: los criterios de MA-1 a MA-12 que no tenían su prueba con la app abierta.
test.describe('Calidad del Mapa (paso 8)', () => {
  test('antes del hito 10, el portón como ramas con «Te espera»; en el hito 10 sin frentes, la línea gris (MA-5)', async () => {
    await proyecto('Beta', {
      '.proyecto.json': ficha,
      'docs/README.md': '# Docs\n\n**Framework:** 2026-11-17\n',
      'docs/estado.md': `# Estado del proyecto

## Hito actual
4 — UX — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 3 | Investigación de dominio | hecho | \`03-investigacion.md\` |
| 4 | UX | en curso | \`04-ux.md\` |
| 5 | Arquitectura técnica | pendiente | |

## Preguntas abiertas
- **Q-7 — ¿Los flujos están bien?**
  Tipo: decisión
  Opciones: A) Sí · B) No

## Próximo paso
Esperar Q-7.
`,
      'docs/04-ux.md': '# UX\n\n## Portón\n- [x] Historias con criterios\n- [ ] Flujos aprobados (Q-7)\n',
    })
    await proyecto('Gamma', {
      '.proyecto.json': ficha,
      'docs/README.md': '# Docs\n\n**Framework:** 2026-11-17\n',
      'docs/estado.md': `# Estado del proyecto

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 9 | Lanzamiento | hecho | |
| 10 | Operación | en curso | \`10-operacion.md\` |

## Preguntas abiertas
(ninguna)

## Próximo paso
Usarla.
`,
      'docs/10-operacion.md': '# Operación\n',
    })
    const { app, win } = await abrir()
    await win.locator('.tarjeta', { hasText: 'Beta' }).click()
    let mapa = await alMapa(win)
    await expect(mapa.getByRole('tablist')).toHaveCount(0)
    const camino = mapa.locator('.camino')
    await expect(camino.locator('.tramo.foco')).toHaveText('UX')
    // La lista del portón, como ramas: lo hecho con el punto lleno, lo que falta vacío y sin el código.
    await expect(camino.locator('.tramo.rama .nombre-tramo')).toHaveText([
      'Historias con criterios',
      'Flujos aprobados',
    ])
    await expect(camino.locator('.tramo.rama.hecho')).toHaveText('Historias con criterios')
    await expect(camino.locator('.tramo.rama.espera')).toContainText('Te espera')
    await expect(mapa).not.toContainText('Q-7')
    await win.screenshot({ path: 'test-results/ma8-mapa-porton.png' })

    await win.getByRole('button', { name: /^Inicio/ }).click()
    await win.locator('.tarjeta', { hasText: 'Gamma' }).click()
    mapa = await alMapa(win)
    await expect(mapa.getByRole('tablist')).toHaveCount(0)
    await expect(mapa.locator('.camino .tramo.foco')).toHaveText('Operación')
    await expect(mapa).toContainText(
      'Todavía no hay frentes: la IA abre uno cuando haya algo grande para hacer.',
    )
    await app.close()
  })

  test('Empezar este frente: la ✕ saca la cita; al enviar va «Empieza el frente» con lo escrito (MA-7)', async () => {
    const { app, win } = await abrir()
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    const mapa = await alMapa(win)
    await mapa.getByRole('tab', { name: /Por empezar/ }).click()
    const empezar = mapa.getByRole('button', { name: 'Empezar este frente' })
    const citas = win.locator('.compositor .citado')
    await empezar.click()
    await expect(citas).toHaveCount(1)
    await win.getByRole('button', { name: 'Quitar la cita Exportar' }).click()
    await expect(citas).toHaveCount(0)
    await empezar.click()
    await expect(win.locator('.hilo')).not.toContainText('Empieza el frente Exportar')
    const mensaje = win.getByRole('textbox', { name: 'Mensaje para la IA' })
    await mensaje.fill('Primero el PDF')
    await mensaje.press('Enter')
    await expect(win.locator('.hilo')).toContainText('Empieza el frente Exportar')
    await expect(win.locator('.hilo')).toContainText('Primero el PDF')
    await expect(citas).toHaveCount(0)
    // Se cierra con la conversación quieta: después del turno, el que le devuelve el control (la muestra tiene avisos).
    await expect(win.locator('.hilo')).toContainText(
      /avisos del framework[\s\S]*Listo: dejé el estado al día\./,
    )
    await app.close()
  })

  test('muchos frentes: la barra se desplaza y la elegida queda a la vista; la pestaña que se fue vuelve al activo (MA-3)', async () => {
    const nombres = Array.from({ length: 14 }, (_, i) => `Frente con nombre largo ${i + 1}`)
    const archivos: Record<string, string> = {}
    for (const [i, n] of nombres.entries()) {
      archivos[`docs/modulos/f${i + 1}/estado.md`] = `# Estado del módulo: ${n}\n\n## Ruta\n- [ ] Un paso\n`
    }
    await proyecto('Alfa', {
      ...archivos,
      'docs/estado.md': ESTADO.replace(
        '| Exportar (T-20)',
        `${nombres.map((n, i) => `| ${n} (\`modulos/f${i + 1}/estado.md\`) | sección | 1. Propuesta | hecho |`).join('\n')}\n| Exportar (T-20)`,
      ),
    })
    const { app, win } = await abrir()
    await win.setViewportSize({ width: 1000, height: 800 })
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    const mapa = await alMapa(win)
    const barra = mapa.getByRole('tablist', { name: 'Frentes' })
    expect(await barra.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true)
    // Con las flechas hasta el último frente (Notas, archivada, no está): la barra corre y la elegida se ve.
    await barra.getByRole('tab', { name: 'Galería' }).focus()
    for (let i = 0; i < nombres.length + 1; i++) await win.keyboard.press('ArrowRight')
    const ultima = barra.getByRole('tab', { name: nombres.at(-1) ?? '' })
    await expect(ultima).toHaveAttribute('aria-selected', 'true')
    await expect(ultima).toBeInViewport({ ratio: 0.9 })
    await win.screenshot({ path: 'test-results/ma8-mapa-muchos.png' })

    // Avisos elegida; la IA lo saca de la tabla y borra su carpeta: al volver, el Mapa muestra el activo.
    await barra.getByRole('tab', { name: 'Avisos' }).click()
    await win
      .getByRole('navigation', { name: 'Secciones del proyecto' })
      .getByRole('button', { name: 'Docs' })
      .click()
    await rm(join(raiz, 'Alfa', 'docs/modulos/avisos'), { recursive: true, force: true })
    await writeFile(join(raiz, 'Alfa', 'docs/estado.md'), ESTADO.replace(/\| Avisos .*\n/, ''))
    const vuelta = await alMapa(win)
    await expect(vuelta.getByRole('tab', { name: 'Avisos' })).toHaveCount(0)
    await expect(vuelta.getByRole('tab', { name: 'Galería' })).toHaveAttribute('aria-selected', 'true')
    await app.close()
  })

  test('un estado fuera del vocabulario se muestra tal cual, en gris (MA-12)', async () => {
    await proyecto('Alfa', {
      'docs/estado.md': ESTADO.replace('| 8. Calidad | en pausa |', '| 8. Calidad | bloqueado |'),
    })
    const { app, win } = await abrir()
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    const mapa = await alMapa(win)
    await mapa.getByRole('tab', { name: 'Avisos' }).click()
    const estado = mapa.getByRole('region', { name: 'Avisos' }).locator('.estado-frente')
    await expect(estado).toHaveText('bloqueado')
    await expect(estado).toHaveClass(/fuera/)
    await app.close()
  })
})
