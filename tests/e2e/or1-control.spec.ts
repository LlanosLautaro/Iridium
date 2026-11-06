// OR-I1 con la app abierta y el motor falso: el control le devuelve a la IA lo mal escrito al terminar el turno
// (OR-2, W-12) y lo que quedó se ve en la tarjeta como aviso del framework (W-2); sin framework, «framework viejo».
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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

**Última actualización:** 2026-11-06

## Hito actual
7 — Construcción — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 6 | UI | hecho | |
| 7 | Construcción | en curso | |

## Preguntas abiertas
(ninguna)

## Próximo paso
Seguir.
`

async function abrir(mal: '1' | 'terco'): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '40',
    IRIDIUM_FALSO_MAL: mal,
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
    'docs/README.md': '# Docs\n\n**Framework:** 2026-11-06\n',
    'docs/trabajo.md': '# Trabajo\n',
  })
  await proyecto('Beta', {
    '.proyecto.json': ficha,
    'docs/estado.md': ESTADO.replace('| hecho |', '| completo |'),
  })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

async function conversar(win: Page) {
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Anotá una pregunta')
  await campo.press('Enter')
  await expect(campo).toHaveValue('')
}

test('la IA corrige lo que le devuelve el control y la tarjeta queda sin avisos', async () => {
  const { app, win } = await abrir('1')
  await conversar(win)
  const control = win.locator('.control-ia')
  await expect(control).toContainText('El control encontró 1 cosa mal escrita; la IA la corrigió', {
    timeout: 20_000,
  })
  await expect(control).toHaveClass(/ok/)
  expect(await readFile(join(raiz, 'Alfa', 'docs', 'estado.md'), 'utf8')).toContain('Tipo: consulta')
  await win.screenshot({ path: 'test-results/or1-corrigio.png' })

  await win.getByRole('button', { name: /^Inicio/ }).click()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' }).locator('.aviso-fw')).toHaveCount(0)
  // Beta no pasó al framework: lo dice junto al hito, y el control no corre.
  await expect(win.locator('.tarjeta', { hasText: 'Beta' }).locator('.viejo')).toHaveText('framework viejo')
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' }).locator('.viejo')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/or1-grilla.png' })
  await app.close()
})

test('si la IA no corrige, queda como aviso del framework en la tarjeta, sin un segundo envío', async () => {
  const { app, win } = await abrir('terco')
  await conversar(win)
  await expect(win.locator('.control-ia')).toContainText('Corrigió 0 de 1; queda 1 aviso del framework', {
    timeout: 20_000,
  })
  await expect(win.locator('.control-ia')).toHaveCount(1)

  await win.getByRole('button', { name: /^Inicio/ }).click()
  const aviso = win.locator('.tarjeta', { hasText: 'Alfa' }).locator('.aviso-fw')
  await expect(aviso).toHaveText('!1 aviso del framework')
  await expect(aviso).toHaveAttribute('title', /docs\/estado\.md:\d+ — Q-1: falta la línea «Tipo:»/)
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toHaveAttribute(
    'aria-label',
    /1 aviso del framework/,
  )
  await win
    .locator('.tarjeta', { hasText: 'Alfa' })
    .screenshot({ path: 'test-results/or1-tarjeta-aviso.png' })
  await app.close()
})
