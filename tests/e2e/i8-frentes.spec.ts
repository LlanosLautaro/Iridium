// I-8 con la app abierta y el motor falso: los frentes (D-063) en el Mapa y en Pendientes, y Postergar una prueba.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { abrirPregunta } from './pregunta'

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

const ESTADO = `# Estado

## Hito actual
7 — Construcción — I-8 en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 6 | UI | completo | |
| 7 | Construcción | en curso | \`07-construccion.md\` |

## Preguntas abiertas
- **Q-3 — ¿Funciona la galería?**
  Tipo: prueba
  1. Abre la galería.
  2. Las miniaturas se ven.

## Próximo paso
Terminar I-8.
`

const SKILLS = `# Estado del módulo: Skills

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | completo | \`propuesta.md\` |
| 2. Definición | en curso | \`definicion.md\` |
| 3. UX | pendiente | \`ux.md\` |

## En qué estamos ahora
Definiendo qué se ve de cada skill.

## Preguntas abiertas
- **Q-4 — ¿Qué entra en el MVP de Skills?**
  Tipo: decisión · frena
  Opciones: A) Solo verlas · B) Verlas y editarlas

## Próximo paso
Cerrar la definición con Q-4.
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
    'docs/estado.md': ESTADO,
    'docs/07-construccion.md':
      '# Construcción\n\n| ID | Objetivo | Estado |\n|---|---|---|\n| I-8 | Frentes | en curso |\n\n### I-8 — Frentes\nEso.\n',
    'docs/modulos/skills/estado.md': SKILLS,
    'docs/modulos/skills/propuesta.md': '# Propuesta\n\nVer las skills.\n',
  })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('el Mapa: manda el frente activo con su paso, su Próximo paso y sus preguntas; un hito muestra su detalle (W-7)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Mapa' })
    .click()
  const mapa = win.locator('[data-seccion="mapa"]')
  // Skills no está en ninguna tabla, pero tiene un paso en curso: es el frente activo.
  const bloque = mapa.getByRole('region', { name: 'Frentes' })
  await expect(bloque.locator('.fr-cab h3')).toHaveText('Skills')
  await expect(bloque.locator('.fr-paso')).toHaveText('2. Definición · en curso')
  await expect(bloque.locator('.fr-texto')).toContainText('Cerrar la definición con Q-4.')
  await expect(bloque.locator('.espera-fila')).toHaveText([/Q-4.*!/])
  // La pregunta del núcleo no se pierde: «Sin frente».
  await expect(bloque.locator('.fr-otros')).toContainText('Sin frenteQ-3 en tu bandeja')
  await expect(mapa.locator('.hito-card')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/i8-mapa-frente.png' })

  // Un hito muestra su detalle en lugar del bloque; Volver lo saca.
  await mapa.locator('.h', { hasText: '7' }).click()
  const tarjeta = mapa.locator('.hito-card')
  await expect(tarjeta.locator('h3')).toHaveText('Construcción')
  await expect(tarjeta.locator('.espera-fila')).toHaveText([/Q-3/])
  await expect(bloque).toHaveCount(0)
  await tarjeta.getByRole('button', { name: 'Volver' }).click()
  await expect(bloque).toBeVisible()

  // Abrir estado.md lleva a su estado en Docs.
  await bloque.getByRole('button', { name: 'Abrir estado.md' }).click()
  await expect(win.locator('[data-seccion="docs"] .barra-doc .nom')).toHaveText('modulos/skills/estado.md')
  await expect(win.locator('[data-seccion="docs"]')).toContainText('Definiendo qué se ve de cada skill.')
  await app.close()
})

test('Pendientes dice de qué frente es cada pregunta, y Postergar deja la prueba para después (C-62, C-63)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const q4 = win.locator('.resumen .pregunta[data-q="Q-4"]')
  const q3 = win.locator('.resumen .pregunta[data-q="Q-3"]')
  await abrirPregunta(q4)
  await abrirPregunta(q3)
  await expect(q4.locator('.frente-pregunta')).toHaveText('Skills')
  await expect(q3.locator('.frente-pregunta')).toHaveCount(0)
  // Solo las pruebas tienen Postergar.
  await expect(q4.getByRole('button', { name: 'Postergar' })).toHaveCount(0)
  await q3.getByRole('checkbox').first().check()
  await win.screenshot({ path: 'test-results/i8-pendientes.png' })

  await q3.getByRole('button', { name: 'Postergar' }).click()
  await expect(q3.locator('.cab-q')).toContainText('Postergada, sin procesar')
  await abrirPregunta(q3)
  await expect(q3.locator('.resumen-q')).toContainText('Postergada:')
  const texto = await readFile(join(raiz, 'Alfa', 'docs', 'respuestas', 'Q-3.md'), 'utf8')
  expect(texto).toContain('**Opción:** Postergada: tomala como aprobada provisional')
  expect(texto).toContain('- [x] Abre la galería.')
  expect(texto).toContain('- [ ] Las miniaturas se ven.')
  await win.screenshot({ path: 'test-results/i8-postergada.png' })
  await app.close()
})
