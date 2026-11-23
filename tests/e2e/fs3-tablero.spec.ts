// FS-I3 con la app abierta y el motor falso: el tablero Frentes con la forma B (D-180, D-181). Las tarjetas a la
// izquierda (el que cambió último arriba, el Núcleo debajo, lo que sigue, el robot o «apagada» y las preguntas en
// ámbar) y, al centro, el frente elegido con su interruptor, sus preguntas y su camino con el código, el tamaño y
// «sola» al pie de cada paso. Con la sección angosta, las tarjetas pasan a ser una barra arriba.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let abiertas: ElectronApplication[] = []

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
| 10 | Operación | en curso | \`10-operacion.md\` |

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Galería (\`modulos/galeria/estado.md\`) | sección | 7. Construcción | en curso |
| Avisos (\`modulos/avisos/estado.md\`) | sección | 7. Construcción | en pausa |
| Búsqueda (\`modulos/busqueda/estado.md\`) | sección | 7. Construcción | en curso |
| Exportar (T-20) | sección | 1. Propuesta | pendiente |

## Preguntas abiertas
- **Q-5 — Elegí cómo se ve la grilla**
  Tipo: decisión · frena · Frente: Galería
  Opciones: A) Cuatro columnas · B) Tres columnas
- **Q-6 — Probá la búsqueda por fecha**
  Tipo: prueba · Frente: Galería
- **Q-8 — Probá el arranque**
  Tipo: prueba

## Próximo paso
Seguir con la Galería.
`

const GALERIA = `# Estado del módulo: Galería

**Última actualización:** 2026-11-20

## Ruta
- [x] Pensar para qué sirve la galería
- [x] Importar las fotos de una carpeta (GA-I1)
- [ ] Elegir la forma de la grilla (Q-5)
- [ ] Ver las fotos en una grilla (T-11, mediano, sola)
  - [ ] Las fotos verticales sin recortar (chico)
- [ ] Borrar varias fotos a la vez (grande)

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| GA-I1 | Importar | hecho |
`

const AVISOS = `# Estado del módulo: Avisos

**Última actualización:** 2026-11-22

## Ruta
- [x] Avisar cuando termina una copia
- [ ] Sonar al terminar (chico, sola)
`

const BUSQUEDA = `# Estado del módulo: Búsqueda

**Última actualización:** 2026-11-10

## Ruta
- [ ] Buscar por nombre (mediano)
`

const TRABAJO = `# Trabajo

## T-11 — Ver las fotos en una grilla
Estado: pendiente · Frente: Galería · Fecha: 2026-11-17

## T-20 — Exportar
Estado: pendiente · Fecha: 2026-11-17

## T-21 — Exportar a PDF
Estado: pendiente · Frente: Exportar · Fecha: 2026-11-17

## T-30 — Medir cuánto tarda en abrir
Estado: en curso · Fecha: 2026-11-17
`

async function abrir(ancho = 1440): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abiertas.push(app)
  const win = await app.firstWindow()
  await win.setViewportSize({ width: ancho, height: 900 })
  return { app, win }
}

async function alTablero(win: Page) {
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Frentes' })
    .click()
  return win.locator('[data-seccion="mapa"]')
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  // El avance solo prendido (con 10 minutos sin usar no arranca durante la prueba); Avisos, apagado.
  await writeFile(
    join(datos, 'config.json'),
    JSON.stringify({
      version: 1,
      raiz,
      avanceSolo: {
        prendido: true,
        horario: null,
        minutosSinUsar: 10,
        libre: 0,
        semana: 100,
        tamanos: ['chico', 'mediano', 'grande'],
      },
      avanceApagado: { proyectos: [], frentes: [{ ruta: join(raiz, 'Alfa'), carpeta: 'avisos' }] },
    }),
  )
  const archivos: Record<string, string> = {
    '.proyecto.json': ficha,
    'docs/README.md': '# Docs\n\n**Framework:** 2026-11-17\n',
    'docs/estado.md': ESTADO,
    'docs/trabajo.md': TRABAJO,
    'docs/10-operacion.md': '# Operación\n',
    'docs/modulos/galeria/estado.md': GALERIA,
    'docs/modulos/avisos/estado.md': AVISOS,
    'docs/modulos/busqueda/estado.md': BUSQUEDA,
  }
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(raiz, 'Alfa', ruta, '..'), { recursive: true })
    await writeFile(join(raiz, 'Alfa', ruta), texto)
  }
})

test.afterEach(async () => {
  await Promise.all(abiertas.map((a) => a.close().catch(() => {})))
  abiertas = []
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('las tarjetas: el que cambió último arriba, lo que sigue, el robot o «apagada» y las preguntas (FS-6, FS-8)', async () => {
  const { win } = await abrir()
  const tablero = await alTablero(win)
  await expect(tablero.locator('.cabecera h1')).toHaveText('Frentes')
  const columna = tablero.getByRole('tablist', { name: 'Frentes' })
  const tarjetas = columna.getByRole('tab')
  // Avisos cambió el 22, Galería el 20 y Búsqueda el 10; el Núcleo, debajo del primero; Exportar, por empezar.
  await expect(tarjetas.locator('.titulo-fila')).toHaveText([
    'Avisos',
    'Núcleo',
    'Galería',
    'Búsqueda',
    'Exportar',
  ])
  await expect(columna.locator('.grupo-frentes .bloque-titulo')).toHaveText(['Por empezar 1'])
  await expect(tarjetas.locator('.detalle')).toHaveText([
    'Sonar al terminar',
    'Medir cuánto tarda en abrir',
    'Ver las fotos en una grilla',
    'Buscar por nombre',
    '1 aprobado',
  ])
  const tarjeta = (nombre: string) => columna.getByRole('tab', { name: nombre, exact: true })
  // Galería: dos preguntas y la IA sigue sola; Avisos, apagado; Búsqueda no tiene nada para hacer sola.
  await expect(tarjeta('Galería').locator('.cuenta.frena')).toHaveText('2')
  await expect(tarjeta('Galería').locator('.senal svg')).toHaveCount(1)
  await expect(tarjeta('Avisos').locator('.marcas-tarjeta')).toHaveText('apagada')
  await expect(tarjeta('Búsqueda').locator('.marcas-tarjeta')).toHaveCount(0)
  // El ámbar, solo si algo frena (T-125): Galería tiene una que frena; la del Núcleo no, y va en gris.
  await expect(tarjeta('Núcleo').locator('.cuenta')).toHaveText('1')
  await expect(tarjeta('Núcleo').locator('.cuenta.frena')).toHaveCount(0)
  // Las diez tarjetas entrarían: la columna no se desplaza.
  expect(await columna.evaluate((e) => e.scrollHeight <= e.clientHeight)).toBe(true)
  await expect(tarjeta('Avisos')).toHaveAttribute('aria-selected', 'true')
})

test('el centro: el interruptor, las preguntas arriba y el camino con el código, el tamaño y «sola» (FS-7)', async () => {
  const { win } = await abrir()
  const tablero = await alTablero(win)
  const columna = tablero.getByRole('tablist', { name: 'Frentes' })
  await columna.getByRole('tab', { name: 'Galería', exact: true }).click()
  const frente = tablero.getByRole('region', { name: 'Galería' })
  await expect(frente.locator('.estado-frente')).toHaveText('En curso')
  await expect(frente.locator('.preguntas-frente .bloque-titulo')).toHaveText('Te esperan 2')
  await expect(frente.locator('.preguntas-frente .bloque-titulo .cuenta.frena')).toHaveText('2')
  // Se responden ahí mismo, como en la Bandeja (R-105): la más nueva arriba, con sus opciones, sin repetir el frente.
  const preguntas = frente.locator('.preguntas-frente .pregunta')
  await expect(preguntas.locator('.cab-q .cuenta')).toHaveText(['Q-6', 'Q-5'])
  await expect(preguntas.locator('.frente-pregunta')).toHaveCount(0)
  await expect(frente.getByRole('radiogroup', { name: 'Opciones de Q-5' }).getByRole('radio')).toHaveCount(3)
  const camino = frente.locator('.camino')
  await expect(camino.locator('.tramo.hecho .pie-paso')).toHaveText('GA-I1')
  await expect(camino.locator('.tramo.espera .pie-paso')).toHaveText('Te espera · Q-5')
  await expect(camino.locator('.tramo.foco .nombre-tramo')).toHaveText('Ver las fotos en una grilla')
  await expect(camino.locator('.tramo.foco .pie-paso')).toHaveText(/^T-11\s*mediano\s*sola$/)
  await expect(camino.locator('.tramo.rama .pie-paso')).toHaveText('chico')
  await win.screenshot({ path: 'test-results/fs3-tablero.png' })

  // Apagar el frente cambia la tarjeta: «apagada» en lugar del robot.
  await frente.getByRole('switch', { name: 'Avanza sola' }).uncheck()
  await expect(
    columna.getByRole('tab', { name: 'Galería', exact: true }).locator('.marcas-tarjeta'),
  ).toHaveText(/apagada\s*2/)

  // Las flechas pasan de una tarjeta a otra.
  await columna.getByRole('tab', { name: 'Galería', exact: true }).press('ArrowDown')
  await expect(columna.getByRole('tab', { name: 'Búsqueda' })).toBeFocused()
  await expect(tablero.getByRole('region', { name: 'Búsqueda' })).toBeVisible()

  // El Núcleo: la pregunta sin frente y lo aprobado sin frente.
  await columna.getByRole('tab', { name: 'Núcleo' }).click()
  const nucleo = tablero.getByRole('region', { name: 'Núcleo' })
  await expect(nucleo.locator('.preguntas-frente .pregunta .cab-q .cuenta')).toHaveText(['Q-8'])
  await expect(nucleo.locator('.preguntas-frente .bloque-titulo .cuenta.frena')).toHaveCount(0)
  await expect(nucleo.locator('.lista-mapa .fila')).toHaveText([
    /T-30\s*Medir cuánto tarda en abrir\s*En curso/,
  ])
  await win.screenshot({ path: 'test-results/fs3-nucleo.png' })
})

test('con la sección angosta las tarjetas pasan a ser una barra arriba, solo con los nombres (FS-6)', async () => {
  const { win } = await abrir(1000)
  const tablero = await alTablero(win)
  const columna = tablero.getByRole('tablist', { name: 'Frentes' })
  const avisos = columna.getByRole('tab', { name: 'Avisos' })
  const galeria = columna.getByRole('tab', { name: 'Galería', exact: true })
  await expect(avisos.locator('.detalle')).toBeHidden()
  const [a, g] = await Promise.all([avisos.boundingBox(), galeria.boundingBox()])
  expect(Math.abs((a?.y ?? 0) - (g?.y ?? 0))).toBeLessThan(4)
  await win.screenshot({ path: 'test-results/fs3-angosto.png' })
})

test('calidad (paso 8): diez frentes y uno por empezar entran sin desplazar; un frente «nucleo» no se pisa con el Núcleo; lo que dice la tarjeta, para el lector', async () => {
  // Diez frentes (los tres de la muestra, seis más y uno de carpeta `nucleo`), el Núcleo y Exportar por empezar.
  const extra = Array.from({ length: 6 }, (_, i) => `Frente ${i + 1}`)
  const filas = [
    ...extra.map(
      (n, i) => `| ${n} (\`modulos/f${i + 1}/estado.md\`) | sección | 7. Construcción | en curso |`,
    ),
    '| Nucleo de datos (`modulos/nucleo/estado.md`) | sección | 7. Construcción | en curso |',
  ]
  await writeFile(
    join(raiz, 'Alfa', 'docs/estado.md'),
    ESTADO.replace('| Exportar (T-20)', `${filas.join('\n')}\n| Exportar (T-20)`),
  )
  for (const [i, n] of extra.entries()) {
    await mkdir(join(raiz, 'Alfa', `docs/modulos/f${i + 1}`), { recursive: true })
    await writeFile(
      join(raiz, 'Alfa', `docs/modulos/f${i + 1}/estado.md`),
      `# Estado del módulo: ${n}\n\n**Última actualización:** 2026-11-0${i + 1}\n\n## Ruta\n- [ ] Un paso con un nombre bastante largo para la tarjeta (grande, sola)\n`,
    )
  }
  await mkdir(join(raiz, 'Alfa', 'docs/modulos/nucleo'), { recursive: true })
  await writeFile(
    join(raiz, 'Alfa', 'docs/modulos/nucleo/estado.md'),
    '# Estado del módulo: Nucleo de datos\n\n**Última actualización:** 2026-11-01\n\n## Ruta\n- [ ] Guardar las fotos\n',
  )
  const { win } = await abrir()
  const tablero = await alTablero(win)
  const columna = tablero.getByRole('tablist', { name: 'Frentes' })
  await expect(columna.getByRole('tab')).toHaveCount(12)
  expect(await columna.evaluate((e) => e.scrollHeight <= e.clientHeight)).toBe(true)
  await win.screenshot({ path: 'test-results/fs3-muchos.png' })

  // El frente de carpeta `nucleo` y el Núcleo son dos tarjetas distintas, y cada una abre lo suyo.
  await columna.getByRole('tab', { name: 'Nucleo de datos' }).click()
  await expect(tablero.getByRole('region', { name: 'Nucleo de datos' })).toBeVisible()
  await expect(columna.getByRole('tab', { name: 'Núcleo' })).toHaveAttribute('aria-selected', 'false')
  await columna.getByRole('tab', { name: 'Núcleo' }).click()
  await expect(tablero.getByRole('region', { name: 'Núcleo' })).toBeVisible()
  await expect(columna.getByRole('tab', { name: 'Nucleo de datos' })).toHaveAttribute(
    'aria-selected',
    'false',
  )

  // El lector de pantalla oye lo que sigue, las preguntas y el robot; el centro es el panel de la tarjeta elegida.
  const galeria = columna.getByRole('tab', { name: 'Galería', exact: true })
  await expect(galeria).toHaveAccessibleDescription(
    'Ver las fotos en una grilla; 2 preguntas te esperan; la IA avanza sola',
  )
  await expect(columna.getByRole('tab', { name: 'Avisos' })).toHaveAccessibleDescription(
    'Sonar al terminar; avance solo apagado',
  )
  await galeria.click()
  await expect(tablero.getByRole('tabpanel', { name: 'Galería' })).toBeVisible()
})
