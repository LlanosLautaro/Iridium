// OR-I2, W-2, con la app abierta: cada tarjeta dice en qué anda, el frente en curso y su paso («Orden · 4. UX») o, sin
// frentes, el Próximo paso.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron, expect, test } from '@playwright/test'

let raiz: string
let datos: string

async function proyecto(nombre: string, estado: string) {
  await mkdir(join(raiz, nombre, 'docs'), { recursive: true })
  await writeFile(
    join(raiz, nombre, '.proyecto.json'),
    JSON.stringify({
      version: 1,
      descripcion: 'Un proyecto',
      estado: 'en-desarrollo',
      etiquetas: [],
      icono: null,
      archivado: false,
      reemplazadoPor: null,
    }),
  )
  await writeFile(join(raiz, nombre, 'docs', 'estado.md'), estado)
  await writeFile(join(raiz, nombre, 'docs', 'README.md'), '# Docs\n\n**Framework:** 2026-11-06\n')
}

const ESTADO = (hito: string, modulos: string) => `# Estado del proyecto

**Última actualización:** 2026-11-07

## Hito actual
${hito}

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
${modulos}

## Preguntas abiertas
(ninguna)

## Próximo paso
Probar la I-3 con la grilla de muestra.
`

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await proyecto(
    'Alfa',
    ESTADO(
      '10 — Operación — en curso',
      '| Skills (`modulos/skills/estado.md`) | sección | en operación | hecho |\n| Orden (`modulos/orden/estado.md`) | sección | 4. UX (la ronda) | en curso |',
    ),
  )
  await proyecto('Beta', ESTADO('7 — Construcción — en curso', ''))
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('la tarjeta muestra el frente en curso; sin frentes, nada (el Próximo paso no va en la tarjeta, R-84)', async () => {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  try {
    const win = await app.firstWindow()
    await win.setViewportSize({ width: 1440, height: 900 })

    const alfa = win.locator('.tarjeta', { hasText: 'Alfa' })
    await expect(alfa.locator('.en-que')).toHaveText('Orden · 4. UX')
    await expect(alfa.locator('.en-que .fr')).toHaveText('Orden')
    await expect(alfa).toHaveAttribute('aria-label', /Orden · 4\. UX/)

    const beta = win.locator('.tarjeta', { hasText: 'Beta' })
    await expect(beta.locator('.en-que')).toHaveCount(0)
    await expect(beta).not.toContainText('Próximo')

    // Una línea: lo largo se corta con «…» y la tarjeta no crece.
    const alto = await alfa.locator('.en-que').evaluate((e) => e.getBoundingClientRect().height)
    expect(alto).toBeLessThan(24)
    await win.locator('.grilla').screenshot({ path: 'test-results/or2-frente.png' })
  } finally {
    await app.close()
  }
})
