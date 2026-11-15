// I-1: la app abre, muestra los proyectos, entra a uno y vuelve; la grilla se actualiza sola (H-1, H-3).
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
const ficha = (estado: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    version: 1,
    descripcion: `Un proyecto ${estado}`,
    estado,
    etiquetas: [],
    icono: null,
    archivado: false,
    reemplazadoPor: null,
    ...extra,
  })
const estado = (hito: string, preguntas = '(ninguna)') =>
  `# Estado\n\n## Hito actual\n${hito}\n\n## Preguntas abiertas\n${preguntas}\n\n## Próximo paso\nHacer la grilla.\n`

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = { ...process.env, IRIDIUM_DATOS: datos, IRIDIUM_MOTOR: 'falso' } as Record<string, string>
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
    '.proyecto.json': ficha('en-desarrollo'),
    'docs/estado.md': estado(
      '7 — Construcción',
      '- **Q-3 — ¿Seguimos?**\n  Tipo: decisión · frena\n- **Q-4 — ¿Probaste?**\n  Tipo: prueba',
    ),
  })
  await proyecto('Archivo', { '.proyecto.json': ficha('en-uso', { archivado: true }) })
  await proyecto('Beta', { '.proyecto.json': ficha('idea'), 'docs/estado.md': estado('1 — Exploración') })
  await proyecto('Gestor', { '.proyecto.json': ficha('en-uso') })
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true })
  await rm(datos, { recursive: true, force: true })
})

test('la grilla muestra los proyectos en orden, con hito y preguntas; los archivados con su interruptor', async () => {
  const { app, win } = await abrir()
  const nombres = win.locator('.grilla .tarjeta .nombre')
  await expect(nombres).toHaveText(['Alfa', 'Gestor', 'Beta'])
  const alfa = win.locator('.tarjeta', { hasText: 'Alfa' })
  await expect(alfa).toContainText('Hito 7 · Construcción')
  // La cuenta arriba a la derecha, amarilla y con «!» porque una frena (D-100); el total, solo en el inicio.
  await expect(alfa.locator('.cuenta')).toHaveText('2')
  await expect(alfa.locator('.cuenta')).toHaveClass(/frena/)
  await expect(win.locator('.tarjeta', { hasText: 'Gestor' })).toContainText('Sin estado')
  await expect(win.getByRole('button', { name: /^Inicio/ })).toHaveAttribute(
    'aria-label',
    /^Inicio, 2 en la bandeja/,
  )
  // Sin la Bandeja de todos (D-111): en el inicio, Proyectos, Skills e Ideas.
  const secciones = win.getByRole('navigation', { name: 'Secciones' }).getByRole('button')
  await expect(secciones).toHaveCount(4)
  await expect(secciones.nth(1)).toHaveAttribute('title', 'Skills (Ctrl+2)')
  await expect(secciones.nth(2)).toHaveAttribute('title', 'Ideas (Ctrl+3)')
  await expect(win.getByRole('button', { name: /^Bandeja de entrada/ })).toHaveCount(0)
  // Claude abajo solo cuando falla (D-108): con sesión, nada.
  await expect(win.locator('[data-motor="listo"]')).toHaveText('')

  await win.getByRole('switch', { name: /Archivados/ }).click()
  await expect(nombres).toHaveText(['Alfa', 'Gestor', 'Beta', 'Archivo'])
  await app.close()

  // La app recuerda el interruptor.
  const otra = await abrir()
  await expect(otra.win.locator('.grilla .tarjeta .nombre')).toHaveText(['Alfa', 'Gestor', 'Beta', 'Archivo'])
  await otra.app.close()
})

test('la grilla se actualiza sola cuando cambia un estado.md o llega una respuesta', async () => {
  const { app, win } = await abrir()
  const beta = win.locator('.tarjeta', { hasText: 'Beta' })
  await expect(beta).toContainText('Hito 1 · Exploración')
  await writeFile(join(raiz, 'Beta', 'docs', 'estado.md'), estado('2 — Definición', '- **Q-1 — ¿Nombre?**'))
  await expect(beta).toContainText('Hito 2 · Definición')
  await expect(beta.locator('.cuenta')).toHaveText('1')
  await expect(beta.locator('.cuenta')).not.toHaveClass(/frena/)

  await mkdir(join(raiz, 'Beta', 'docs', 'respuestas'))
  await writeFile(join(raiz, 'Beta', 'docs', 'respuestas', 'Q-1.md'), '# Q-1 — ¿Nombre?\n\nBeta.\n')
  await expect(beta.locator('.cuenta')).toHaveCount(0)

  await proyecto('Nuevo', { '.proyecto.json': ficha('idea') })
  await expect(win.locator('.tarjeta', { hasText: 'Nuevo' })).toBeVisible()
  await app.close()
})

test('entrar a un proyecto: sus secciones a la izquierda, la conversación a la derecha; volver al inicio', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const cabecera = win.locator('.zona-principal > .cab-proyecto')
  await expect(cabecera.locator('h1')).toHaveText('Alfa')
  await expect(cabecera).toContainText('Hito 7 · Construcción')
  // La cabecera no repite la cuenta: la tiene la pestaña (W-3).
  await expect(cabecera.locator('.cuenta')).toHaveCount(0)
  await expect(win.locator('.sin-conversacion')).toContainText('Hacer la grilla.')
  // La barra de íconos es la del proyecto; nada de otro proyecto.
  const secciones = win.getByRole('navigation', { name: 'Secciones del proyecto' })
  for (const nombre of ['Bandeja de entrada', 'Mapa', 'Docs', 'Archivos', 'Git', 'Scripts'])
    await expect(secciones.getByRole('button', { name: new RegExp(`^${nombre}`) })).toBeVisible()
  // Se entra a su Bandeja de entrada (D-043).
  await expect(secciones.getByRole('button', { name: /^Bandeja de entrada/ })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(win.locator('[data-seccion="pendientes"] .pregunta')).toHaveCount(2)
  await expect(win.locator('.trabajo')).not.toContainText('Beta')
  await expect(win.locator('.barra-proyectos .proy.elegido')).toContainText('Alfa')
  await expect(win.locator('.chat .compositor')).toBeVisible()

  // Las pestañas de los proyectos abiertos quedan (D-043), con sus preguntas; también al volver a abrir la app.
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' }).locator('.cuenta')).toHaveText('2')
  await win.getByRole('button', { name: /^Inicio/ }).click()
  await expect(win.locator('.grilla')).toBeVisible()
  await win.locator('.tarjeta', { hasText: 'Beta' }).click()
  await expect(win.locator('.barra-proyectos .nom')).toHaveText(['Alfa', 'Beta'])
  await app.close()
  const otra = await abrir()
  await expect(otra.win.locator('.barra-proyectos .nom')).toHaveText(['Alfa', 'Beta'])
  await otra.win.locator('.barra-proyectos .proy', { hasText: 'Alfa' }).getByRole('tab').click()
  await expect(otra.win.locator('.zona-principal > .cab-proyecto h1')).toHaveText('Alfa')
  // × la saca de la barra; si era la abierta, se vuelve al inicio.
  await otra.win.getByRole('button', { name: 'Cerrar Alfa' }).click()
  await expect(otra.win.locator('.grilla')).toBeVisible()
  await expect(otra.win.locator('.barra-proyectos .nom')).toHaveText(['Beta'])
  await otra.app.close()
})

test('una carpeta de proyectos que no existe muestra el error con su ruta', async () => {
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz: join(raiz, 'no-existe') }))
  const { app, win } = await abrir()
  await expect(win.locator('.mensaje.error')).toContainText('No encuentro la carpeta de proyectos')
  await expect(win.locator('.mensaje .ruta')).toHaveText(join(raiz, 'no-existe'))
  await app.close()
})
