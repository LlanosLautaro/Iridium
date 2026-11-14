// OR-I2 con la app abierta y el motor falso: un número que manda (gris, o amarillo con «!» solo si algo frena) y la
// Bandeja de entrada con filtros por frente y las preguntas en pausa al final (04-ux.md › W-1, W-2, W-5; D-100).
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

**Última actualización:** 2026-11-06

## Hito actual
10 — Operación — en curso

## Preguntas abiertas
${preguntas}

## Próximo paso
Seguir.
`

const ALFA = estado(`- **Q-1 — ¿Lista o grilla?**
  Tipo: decisión
  Contexto: la pantalla principal.
  Opciones: A) Lista (recomendada: entra más) · B) Grilla
- **Q-2 — Invitá a la otra persona al repo**
  Tipo: tarea · frena · Frente: Compartir
  Contexto: sin la invitación no ve las versiones.
  - [ ] La invité
- **Q-3 — ¿Lo vemos más adelante?**
  Tipo: consulta · en pausa
  Contexto: cuando termine Orden.
- **Q-4 — Probá la tarjeta**
  Tipo: prueba · Frente: Compartir
  Contexto: con la última versión.
  - [ ] Se ve la cuenta`)

const BETA = estado(`- **Q-1 — ¿Qué nombre le ponemos?**
  Tipo: consulta
  Contexto: para la ficha.`)

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
  await proyecto('Alfa', { '.proyecto.json': ficha, 'docs/estado.md': ALFA })
  await proyecto('Beta', { '.proyecto.json': ficha, 'docs/estado.md': BETA })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('un número que manda: el total en el inicio, la cuenta de cada tarjeta y pestaña; amarillo solo si frena', async () => {
  const { app, win } = await abrir()
  // El total de los dos proyectos, sin la en pausa (3 de Alfa y 1 de Beta); amarillo porque una de Alfa frena.
  const inicio = win.getByRole('button', { name: /^Inicio/ })
  await expect(inicio).toHaveAttribute('aria-label', /^Inicio, 4 en la bandeja; una frena/)
  await expect(inicio.locator('.punto')).toHaveClass(/ambar/)
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' }).locator('.cuenta')).toHaveClass(/frena/)
  const beta = win.locator('.tarjeta', { hasText: 'Beta' }).locator('.cuenta')
  await expect(beta).toHaveText('1')
  await expect(beta).not.toHaveClass(/frena/)
  // Los íconos de la barra no repiten el número.
  await expect(win.getByRole('navigation', { name: 'Secciones' }).locator('.punto')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/or2-proyectos.png' })

  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  const pestana = win.locator('.barra-proyectos .proy', { hasText: 'Beta' }).locator('.cuenta')
  await expect(pestana).toHaveText('1')
  await expect(pestana).not.toHaveClass(/frena/)
  await app.close()
})

test('la Bandeja: filtros por frente con su cuenta, solo lo que frena en ámbar y las en pausa al final, plegadas', async () => {
  const { app, win } = await abrir()
  // Alfa tiene preguntas: se entra por su Bandeja (sin la Bandeja de todos, D-111).
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await expect(win.locator('[data-seccion="pendientes"] .cab-seccion h2')).toHaveText('Bandeja de entrada')

  const filtros = win.getByRole('group', { name: 'Filtrar por frente' }).getByRole('button')
  await expect(filtros).toHaveText(['Todos 3', 'Núcleo 1', 'Compartir 2'])
  await expect(filtros.first()).toHaveAttribute('aria-pressed', 'true')

  // Solo la que frena lleva el ámbar.
  await expect(win.locator('.pend.frena')).toHaveCount(1)
  await expect(win.locator('.pend.frena')).toHaveAttribute('data-q', 'Q-2')
  // La en pausa, al final y plegada.
  const pausa = win.locator('.en-pausa')
  await expect(pausa.locator('summary')).toHaveText(/En pausa\s*1/)
  await expect(pausa.locator('.pend[data-q="Q-3"]')).toBeHidden()
  await win.screenshot({ path: 'test-results/or2-bandeja.png' })

  await win.getByRole('button', { name: 'Compartir 2' }).click()
  await expect(win.locator('.grupo-pend:not(.en-pausa) .pend')).toHaveCount(2)
  await expect(win.locator('.pend[data-q="Q-1"]')).toHaveCount(0)
  await win.getByRole('button', { name: 'Núcleo 1' }).click()
  await expect(win.locator('.grupo-pend:not(.en-pausa) .pend')).toHaveCount(1)
  await expect(win.locator('.pend[data-q="Q-1"]')).toBeVisible()

  await pausa.locator('summary').click()
  await expect(pausa.locator('.pend[data-q="Q-3"]')).toBeVisible()
  await win.screenshot({ path: 'test-results/or2-bandeja-pausa.png' })

  // Beta, con un solo frente: sin filtros.
  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(win.locator('.zona-principal > .cab-proyecto h1')).toHaveText('Beta')
  await expect(win.locator('[data-seccion="pendientes"] .pend').first()).toBeVisible()
  await expect(win.getByRole('group', { name: 'Filtrar por frente' })).toHaveCount(0)
  await app.close()
})

test('R-55: el frente elegido en la Bandeja queda al cambiar de proyecto y al cerrar Iridium', async () => {
  let { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win.getByRole('button', { name: 'Compartir 2' }).click()
  await expect(win.locator('.grupo-pend:not(.en-pausa) .pend')).toHaveCount(2)

  // A Beta y de vuelta a Alfa por su pestaña: sigue en Compartir.
  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(win.locator('.zona-principal > .cab-proyecto h1')).toHaveText('Beta')
  await win.locator('.barra-proyectos .proy', { hasText: 'Alfa' }).getByRole('tab').click()
  await expect(win.getByRole('button', { name: 'Compartir 2' })).toHaveAttribute('aria-pressed', 'true')
  await expect(win.locator('.grupo-pend:not(.en-pausa) .pend')).toHaveCount(2)
  await app.close()

  // Al abrir de nuevo, Alfa vuelve en Compartir.
  ;({ app, win } = await abrir())
  await expect(win.locator('.zona-principal > .cab-proyecto h1')).toHaveText('Alfa')
  await expect(win.getByRole('button', { name: 'Compartir 2' })).toHaveAttribute('aria-pressed', 'true')
  await expect(win.locator('.pend[data-q="Q-1"]')).toHaveCount(0)
  // Todos no se guarda: es lo de siempre.
  await win.getByRole('button', { name: 'Todos 3' }).click()
  await expect(win.locator('.pend[data-q="Q-1"]')).toBeVisible()
  await app.close()
})

test('Q-165: entre varias pestañas, la elegida se distingue (su fondo y su nombre en blanco)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win.keyboard.press('Control+1')
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  const fondo = (n: string) =>
    win.locator('.barra-proyectos .proy', { hasText: n }).evaluate((e) => {
      const c = getComputedStyle(e)
      return { fondo: c.backgroundColor, letra: c.color }
    })
  const elegida = await fondo('Beta')
  const otra = await fondo('Alfa')
  expect(elegida.fondo).not.toBe(otra.fondo)
  expect(elegida.letra).not.toBe(otra.letra)
  await win.locator('.barra-proyectos').screenshot({ path: 'test-results/q165-pestanas.png' })
  await app.close()
})
