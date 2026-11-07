// I-4: el marco de tres paneles (D-041), el Mapa (H-7), Docs con Atrás (H-8, F-4), Scripts, Archivos (H-15), el ancho
// de la conversación que se recuerda y las conversaciones anteriores (H-17). Con el motor falso.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

async function escribir(ruta: string, texto: string | Buffer) {
  await mkdir(join(raiz, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, ruta), texto)
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
7 — Construcción — I-2 (galería), en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | completo | \`00-idea.md\` |
| 4 | UX | completo | \`04-ux.md\` |
| 7 | Construcción | en curso | \`07-construccion.md\` |
| 8 | Pruebas y calidad | pendiente | \`08-calidad.md\` |

## Preguntas abiertas
- **Q-3 — ¿La galería se ve bien?**
  Tipo: prueba · frena

## Próximo paso
Terminar I-2 según D-12 y \`04-ux.md\` › W-14.
`

const filas = Array.from({ length: 9 }, (_, i) => `| C-${i + 1} | Cosa ${i + 1} |`).join('\n')

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '60',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

/** Terminó el turno: la pestaña ya no dice «Trabajando» y la IA cerró con «Listo» (D-043: con preguntas, la pestaña
 * las muestra en vez de «Terminada»). */
async function terminado(win: Page) {
  await expect(win.locator('.hilo .md').last()).toContainText('Listo')
  await expect(win.locator('.ses', { hasText: 'Alfa' })).not.toContainText('Trabajando')
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await escribir('Alfa/.proyecto.json', ficha)
  await escribir('Alfa/docs/estado.md', ESTADO)
  await escribir('Alfa/docs/00-idea.md', '# Idea\n\nUna galería.\n\n## Portón\n- [x] La idea escrita.\n')
  await escribir(
    'Alfa/docs/04-ux.md',
    `# UX\n\n## Historias\nVer C-3.\n\n${'Relleno.\n\n'.repeat(40)}## W-14 — Galería\nCuatro columnas (D-12).\n\n## Portón\n- [x] Historias.\n- [ ] Flujos.\n`,
  )
  await escribir(
    'Alfa/docs/07-construccion.md',
    '# Construcción\n\n## Plan\n| ID | Objetivo | Estado |\n|---|---|---|\n| I-1 | Importar | aprobada |\n| I-2 | Galería | pendiente |\n| I-3 | Etiquetas | pendiente |\n\n### I-1 — Importar\nHecha.\n\n### I-2 — Galería\nLa grilla de W-14.\n',
  )
  await escribir(
    'Alfa/docs/02-definicion.md',
    `# Definición\n\n## Alcance\n| Código | Qué |\n|---|---|\n${filas}\n`,
  )
  await escribir(
    'Alfa/docs/decisiones.md',
    '# Decisiones\n\n## D-12 — Grilla de cuatro columnas\nSe lee mejor.\n',
  )
  await escribir(
    'Alfa/docs/scripts.md',
    '# Scripts\n\n## Dejar una marca\nEscribe `marca.txt` (ver D-12).\n**Ejecutar:** `echo listo> marca.txt && exit`\n\n## Instalar\n**Ejecutar:** `dist/Instalador.exe`\n',
  )
  await escribir('Alfa/src/app.ts', '// La app\nexport const n = 42\n')
  await escribir('Alfa/node_modules/x/index.js', 'no se ve')
  await escribir('Alfa/icono.png', Buffer.from('89504e470d0a1a0a', 'hex'))
  await escribir('Beta/.proyecto.json', ficha)
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('el Mapa: la línea de hitos, el hito actual y de un paso a su sección y de vuelta (H-7, F-4)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByRole('button', { name: /^Inicio/ }).locator('.cuenta-bandeja')).toHaveText('1')
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Mapa' })
    .click()

  const mapa = win.locator('[data-seccion="mapa"]')
  await expect(mapa.locator('.h')).toHaveText(['0', '4', '7', '8'])
  await expect(mapa.locator('.hitos .tot')).toHaveText('2 de 4 hechos')
  const tarjeta = mapa.locator('.hito-card')
  await expect(tarjeta.locator('h3')).toHaveText('Construcción')
  await expect(tarjeta.locator('.proximo')).toContainText('Terminar I-2 según D-12')
  await expect(tarjeta.locator('.fila', { hasText: 'I-1 — Importar' })).toContainText('hecho')
  await expect(tarjeta.locator('.fila', { hasText: 'I-2 — Galería' })).toContainText('en curso')
  await expect(tarjeta.locator('.espera-fila')).toContainText('Q-3')
  await win.screenshot({ path: 'test-results/i4-mapa.png' })

  // Otro hito: su portón.
  await mapa.locator('.h', { hasText: '4' }).click()
  await expect(tarjeta.locator('h3')).toHaveText('UX')
  await expect(tarjeta.locator('.fila')).toHaveText([/Historias\..*hecho/, /Flujos\..*pendiente/])
  await tarjeta.getByRole('button', { name: 'Volver' }).click()

  // Un paso abre su sección en Docs; Atrás vuelve al Mapa.
  await tarjeta.locator('.fila', { hasText: 'I-2 — Galería' }).click()
  const docs = win.locator('[data-seccion="docs"]')
  await expect(docs.locator('.barra-doc .nom')).toHaveText('07-construccion.md')
  await expect(docs.locator('.marcada')).toHaveText('I-2 — Galería')
  await docs.getByRole('button', { name: 'Atrás' }).click()
  await expect(mapa).toBeVisible()

  // Un código del próximo paso también.
  await tarjeta.locator('.proximo a', { hasText: 'D-12' }).click()
  await expect(docs.locator('.marcada')).toHaveText('D-12 — Grilla de cuatro columnas')
  await app.close()
})

test('Docs: códigos que saltan, Atrás con Alt+←, «En esta página», tablas plegadas y el documento que cambia (H-8)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Docs' })
    .click()
  const docs = win.locator('[data-seccion="docs"]')
  await expect(docs.locator('.barra-doc .nom')).toHaveText('estado.md')

  await docs.locator('.barra-doc .menu-boton', { hasText: 'estado.md' }).click()
  await expect(docs.locator('.menu-lista button')).toHaveText([
    'estado.md',
    '00-idea.md',
    '02-definicion.md',
    '04-ux.md',
    '07-construccion.md',
    'decisiones.md',
    'scripts.md',
  ])
  await docs.locator('.menu-lista button', { hasText: '04-ux.md' }).click()
  await docs.locator('.menu-boton', { hasText: 'En esta página' }).click()
  await docs.locator('.menu-lista button', { hasText: 'W-14 — Galería' }).click()
  await expect(docs.locator('.marcada')).toHaveText('W-14 — Galería')

  await docs.locator('.doc-texto a', { hasText: 'D-12' }).click()
  await expect(docs.locator('.barra-doc .nom')).toHaveText('decisiones.md')
  await win.keyboard.press('Alt+ArrowLeft')
  await expect(docs.locator('.barra-doc .nom')).toHaveText('04-ux.md')
  // Vuelve a donde estaba: la sección W-14 a la vista.
  await expect(docs.locator('#w-14')).toBeInViewport()

  // Mientras se lee, el documento cambia en el disco: se actualiza sin perder la posición.
  await escribir(
    'Alfa/docs/04-ux.md',
    `# UX\n\n## Historias\nVer C-3.\n\n${'Relleno.\n\n'.repeat(40)}## W-14 — Galería\nCuatro columnas (D-12), ahora con zoom.\n\n## Portón\n- [x] Historias.\n`,
  )
  await expect(docs.locator('.doc-texto')).toContainText('ahora con zoom')
  await expect(docs.locator('#w-14')).toBeInViewport()

  // Tabla de más de seis filas: arranca plegada.
  await docs.locator('.barra-doc .menu-boton', { hasText: '04-ux.md' }).click()
  await docs.locator('.menu-lista button', { hasText: '02-definicion.md' }).click()
  await expect(docs.locator('tbody tr:visible')).toHaveCount(5)
  await docs.getByRole('button', { name: 'Ver las 9 filas' }).click()
  await expect(docs.locator('tbody tr:visible')).toHaveCount(9)

  // Una sección que no está.
  await win.locator('.chat-cab').getByRole('button', { name: 'Seguí' }).click()
  await terminado(win)
  // La cita está en una nota del proceso, que al terminar queda plegado (D-061).
  await win.locator('.hilo .proceso-cab').first().click()
  await win.locator('.hilo .md a', { hasText: 'docs/estado.md' }).first().click()
  await expect(docs.locator('.barra-doc .nom')).toHaveText('estado.md')
  await win.screenshot({ path: 'test-results/i4-docs.png' })
  await app.close()
})

test('al entrar, pendientes y scripts: un botón ejecuta el script; Archivos sin node_modules, con colores e imágenes (D-043, H-15)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
  const entrada = win.locator('[data-seccion="pendientes"]')
  await expect(entrada.locator('.pend')).toHaveText([/Q-3/])
  // La pestaña lleva el ícono del proyecto (la inicial, si no tiene) (Q-62).
  await expect(win.locator('.ses', { hasText: 'Alfa' }).locator('.ico-proy')).toHaveText('A')
  // El cuadro de la conversación crece con lo que se escribe y no lo pierde al dejar de escribir (Q-62).
  const cuadro = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  const alto = async () => (await cuadro.boundingBox())?.height ?? 0
  const alto1 = await alto()
  await cuadro.fill('una línea\notra\notra más\ny otra')
  const alto4 = await alto()
  expect(alto4).toBeGreaterThan(alto1 + 40)
  await win.locator('.cabecera h1').click()
  expect(await alto()).toBe(alto4)
  await cuadro.fill('')
  expect(await alto()).toBe(alto1)
  // Los detalles de la pregunta, plegados (Q-62); los scripts, en lista después de los pendientes (Q-63).
  await expect(entrada.locator('.pend .detalles')).toHaveCount(0)
  const lista = entrada.locator('.pendientes .lista-scripts')
  // El botón lleva el nombre, a la izquierda (R-2).
  await expect(lista.locator('.script-fila > button')).toHaveText(['Dejar una marca', 'Instalar'])
  await expect(lista.locator('.script-fila', { hasText: 'Instalar' }).getByRole('button')).toBeDisabled()
  await win.screenshot({ path: 'test-results/i4-entrada.png' })
  await lista.getByRole('button', { name: 'Dejar una marca' }).click()
  await expect(lista.locator('.script-msg.ok')).toContainText('consola')
  await expect
    .poll(async () => (await readFile(join(raiz, 'Alfa', 'marca.txt'), 'utf8').catch(() => '')).trim(), {
      timeout: 15_000,
    })
    .toBe('listo')

  // La sección Scripts, con su descripción y lo que falta; Atrás vuelve a los pendientes.
  await lista.getByRole('button', { name: 'Ver con detalles' }).click()
  const scripts = win.locator('[data-seccion="scripts"]')
  await expect(scripts.locator('.script h4')).toHaveText(['Dejar una marca', 'Instalar'])
  await expect(scripts.locator('.script', { hasText: 'Instalar' })).toContainText('No se encuentra')
  await expect(scripts.locator('.script', { hasText: 'Instalar' }).getByRole('button')).toBeDisabled()
  await win.screenshot({ path: 'test-results/i4-scripts.png' })
  await scripts.getByRole('button', { name: 'Atrás' }).click()
  await expect(entrada).toBeVisible()
  // El botón lateral del mouse también vuelve (Q-63).
  await lista.getByRole('button', { name: 'Ver con detalles' }).click()
  await expect(scripts).toBeVisible()
  await win.evaluate(() => {
    window.dispatchEvent(new MouseEvent('mousedown', { button: 3 }))
    window.dispatchEvent(new MouseEvent('mouseup', { button: 3 }))
  })
  await expect(entrada).toBeVisible()
  await expect(scripts).toBeHidden()

  await barra.getByRole('button', { name: 'Archivos' }).click()
  const archivos = win.locator('[data-seccion="archivos"]')
  await expect(archivos.locator('.arbol > .nodo, .arbol > div > .nodo')).toHaveText([
    'docs',
    'src',
    '.proyecto.json',
    'icono.png',
    'marca.txt',
  ])
  await archivos.locator('.nodo', { hasText: 'src' }).click()
  await archivos.locator('.nodo', { hasText: 'app.ts' }).click()
  await expect(archivos.locator('.visor-cab')).toContainText('2 líneas · TypeScript · solo lectura')
  await expect(archivos.locator('.codigo .c')).toHaveText('// La app')
  await expect(archivos.locator('.codigo .k').first()).toHaveText('export')
  await win.screenshot({ path: 'test-results/i4-archivos.png' })

  await archivos.locator('.nodo', { hasText: 'icono.png' }).click()
  await expect(archivos.locator('.imagen img')).toBeVisible()

  // Un .md de los documentos se abre en Docs; Atrás vuelve al archivo.
  await archivos.locator('.nodo', { hasText: 'docs' }).first().click()
  await archivos.locator('.nodo', { hasText: 'decisiones.md' }).click()
  await archivos.getByRole('button', { name: 'Ver en Docs' }).click()
  await expect(win.locator('[data-seccion="docs"] .barra-doc .nom')).toHaveText('decisiones.md')
  await win.keyboard.press('Alt+ArrowLeft')
  await expect(archivos.locator('.visor-cab .ruta')).toHaveText('docs/decisiones.md')
  await app.close()
})

test('el ancho de la conversación se arrastra y se recuerda; las conversaciones anteriores se retoman (H-17)', async () => {
  let { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const chat = win.locator('aside.chat')
  await expect(chat).toHaveJSProperty('offsetWidth', 360)
  const divisor = win.getByRole('separator', { name: /Ancho de la conversación/ })
  const caja = await divisor.boundingBox()
  if (!caja) throw new Error('sin divisor')
  await win.mouse.move(caja.x + 2, caja.y + 200)
  await win.mouse.down()
  await win.mouse.move(caja.x - 200, caja.y + 200, { steps: 5 })
  await win.mouse.up()
  const ancho = await chat.evaluate((el) => (el as HTMLElement).offsetWidth)
  expect(ancho).toBeGreaterThan(540)
  expect(ancho).toBeLessThan(580)

  // Dos conversaciones: la primera y una Nueva.
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Primera charla')
  await campo.press('Enter')
  await terminado(win)
  await win.locator('.chat-cab').getByRole('button', { name: 'Nueva' }).click()
  await campo.fill('Segunda charla')
  await campo.press('Enter')
  await terminado(win)
  await expect(win.locator('.chat-cab .tit b')).toHaveText('Segunda charla')

  await win.getByRole('button', { name: 'Conversaciones anteriores', exact: true }).click()
  const lista = win.locator('.anteriores .menu-lista')
  await expect(lista.locator('.conv b')).toHaveText(['Segunda charla', 'Primera charla'])
  await expect(lista.locator('.conv').first()).toContainText('la que está abierta')
  await win.screenshot({ path: 'test-results/i4-anteriores.png' })
  await lista.locator('.conv', { hasText: 'Primera charla' }).click()
  await expect(win.locator('.chat-cab .tit b')).toHaveText('Primera charla')
  await expect(win.locator('.turno').first()).toContainText('Primera charla')
  await expect(win.locator('.hilo')).not.toContainText('Segunda charla')
  await campo.fill('Sigo en la primera')
  await campo.press('Enter')
  await terminado(win)
  await expect(win.locator('.hilo')).toContainText('Sigo en la primera')
  await expect(win.locator('.hilo')).toContainText('Primera charla')
  await app.close()

  // Al volver a abrir la app, vuelve a Alfa (D-060) y el ancho es el que se dejó.
  ;({ app, win } = await abrir())
  await expect(win.locator('.principal .cabecera h1')).toHaveText('Alfa')
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', ancho)
  await win.getByRole('separator', { name: /Ancho de la conversación/ }).dblclick()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 360)
  await app.close()
})
