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
  await expect(win.locator('.hilo .texto-doc').last()).toContainText('Listo')
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' })).not.toContainText('Trabajando')
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

test('el Mapa antes del hito 10: los hitos como camino y de un paso a su sección y de vuelta (MA-5, F-4)', async () => {
  const { app, win } = await abrir()
  await expect(win.getByRole('button', { name: /^Inicio/ })).toHaveAttribute(
    'aria-label',
    /^Inicio, 1 en la bandeja/,
  )
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Frentes' })
    .click()

  const mapa = win.locator('[data-seccion="mapa"]')
  await expect(mapa.locator('.cabecera')).toContainText('Hito 7 · Construcción')
  // Sin frentes no hay barra: el camino son los hitos, lo hecho antes del último, plegado (D-142).
  await expect(mapa.getByRole('tablist')).toHaveCount(0)
  const camino = mapa.locator('.camino')
  await expect(camino.locator('.tramo .nombre-tramo')).toHaveText([
    '1 hecho antes',
    'UX',
    'Construcción',
    'Importar',
    'Galería',
    'Etiquetas',
    'Pruebas y calidad',
  ])
  // El que sigue es el hito en curso; sus iteraciones, ramas.
  await expect(camino.locator('.tramo.foco')).toHaveText('Construcción')
  await expect(camino.locator('.tramo.rama.hecho')).toHaveText('Importar')
  await win.screenshot({ path: 'test-results/i4-mapa.png' })

  // Los hechos de antes se despliegan y se pliegan.
  await camino.getByRole('button', { name: '1 hecho antes' }).click()
  await expect(camino.locator('.tramo.principal.hecho .nombre-tramo')).toHaveText([
    'Plegar los hechos de antes',
    'Idea cruda',
    'UX',
  ])
  await camino.getByRole('button', { name: 'Plegar los hechos de antes' }).click()
  await expect(camino.getByRole('button', { name: '1 hecho antes' })).toBeVisible()

  // Un paso abre su sección en Docs; Atrás vuelve al Mapa.
  await camino.getByRole('button', { name: 'Galería' }).click()
  const docs = win.locator('[data-seccion="docs"]')
  await expect(docs.locator('.docs-ruta')).toHaveText('07-construccion.md')
  await expect(docs.locator('.marcada')).toHaveText('I-2 — Galería')
  await docs.getByRole('button', { name: 'Atrás' }).click()
  await expect(mapa).toBeVisible()

  // El documento del hito, desde la cabecera.
  await mapa.getByRole('button', { name: 'Abrir 07-construccion.md' }).click()
  await expect(docs.locator('.docs-ruta')).toHaveText('07-construccion.md')
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
  await expect(docs.locator('.docs-ruta')).toHaveText('estado.md')

  // El árbol (DI-I3, tanda 11): los sueltos arriba y los de los hitos en «Hitos», cerrada hasta abrir uno suyo.
  const arbol = docs.getByRole('navigation', { name: 'Documentos' })
  await expect(arbol.locator('.nodo')).toHaveText(['estado.md', 'decisiones.md', 'scripts.md', 'Hitos'])
  await arbol.getByRole('button', { name: 'Hitos' }).click()
  await expect(arbol.locator('.nodo')).toHaveText([
    'estado.md',
    'decisiones.md',
    'scripts.md',
    'Hitos',
    '00-idea.md',
    '02-definicion.md',
    '04-ux.md',
    '07-construccion.md',
  ])
  await arbol.getByRole('button', { name: '04-ux.md' }).click()
  await expect(arbol.locator('.nodo.elegido')).toHaveText('04-ux.md')
  await docs.getByRole('button', { name: 'En esta página' }).click()
  await docs.locator('[role="menu"] button', { hasText: 'W-14 — Galería' }).click()
  await expect(docs.locator('.marcada')).toHaveText('W-14 — Galería')

  await docs.locator('.texto-doc a', { hasText: 'D-12' }).click()
  await expect(docs.locator('.docs-ruta')).toHaveText('decisiones.md')
  await win.keyboard.press('Alt+ArrowLeft')
  await expect(docs.locator('.docs-ruta')).toHaveText('04-ux.md')
  // Vuelve a donde estaba: la sección W-14 a la vista.
  await expect(docs.locator('#w-14')).toBeInViewport()

  // Mientras se lee, el documento cambia en el disco: se actualiza sin perder la posición.
  await escribir(
    'Alfa/docs/04-ux.md',
    `# UX\n\n## Historias\nVer C-3.\n\n${'Relleno.\n\n'.repeat(40)}## W-14 — Galería\nCuatro columnas (D-12), ahora con zoom.\n\n## Portón\n- [x] Historias.\n`,
  )
  await expect(docs.locator('.texto-doc')).toContainText('ahora con zoom')
  await expect(docs.locator('#w-14')).toBeInViewport()

  // Tabla de más de seis filas: arranca plegada.
  await arbol.getByRole('button', { name: '02-definicion.md' }).click()
  await expect(docs.locator('tbody tr:visible')).toHaveCount(5)
  await docs.getByRole('button', { name: 'Ver las 9 filas' }).click()
  await expect(docs.locator('tbody tr:visible')).toHaveCount(9)

  // Una sección que no está.
  await win.locator('.cab-conv').getByRole('button', { name: 'Continuar' }).click()
  await terminado(win)
  // La cita está en una nota del proceso, que al terminar queda plegado (D-061).
  await win.locator('.hilo .proceso-cab').first().click()
  await win.locator('.hilo .texto-doc a', { hasText: 'docs/estado.md' }).first().click()
  await expect(docs.locator('.docs-ruta')).toHaveText('estado.md')
  await win.screenshot({ path: 'test-results/i4-docs.png' })
  await app.close()
})

test('al entrar, la bandeja sin scripts; en Scripts un botón ejecuta el script; Archivos sin node_modules, con colores e imágenes (D-043, H-15)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
  const entrada = win.locator('[data-seccion="pendientes"]')
  await expect(entrada.locator('.pregunta')).toHaveText([/Q-3/])
  // La pestaña lleva el ícono del proyecto (la inicial, si no tiene) (Q-62).
  await expect(win.locator('.barra-proyectos .proy', { hasText: 'Alfa' }).locator('.ico-proy')).toHaveText(
    'A',
  )
  // El cuadro de la conversación crece con lo que se escribe y no lo pierde al dejar de escribir (Q-62).
  const cuadro = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  const alto = async () => (await cuadro.boundingBox())?.height ?? 0
  const alto1 = await alto()
  await cuadro.fill('una línea\notra\notra más\ny otra')
  const alto4 = await alto()
  expect(alto4).toBeGreaterThan(alto1 + 30)
  await win.locator('.seccion-vista:not([hidden]) .cabecera h1').first().click()
  expect(await alto()).toBe(alto4)
  await cuadro.fill('')
  expect(await alto()).toBe(alto1)
  // Los detalles de la pregunta, plegados (Q-62); la Bandeja es solo bandeja: sin los scripts (R-70).
  await expect(entrada.locator('.pregunta .detalles')).toHaveCount(0)
  await expect(entrada.locator('.lista-scripts')).toHaveCount(0)
  await expect(entrada).not.toContainText('Ver con detalles')
  await win.screenshot({ path: 'test-results/i4-entrada.png' })

  // Los scripts, en su sección, como la maqueta (DI-I3, tanda 14): una Fila por script con Ejecutar a la izquierda,
  // lo que corre y para qué debajo, y lo que falta a la derecha; tocándola se abre con su descripción entera.
  await barra.getByRole('button', { name: 'Scripts' }).click()
  const scripts = win.locator('[data-seccion="scripts"]')
  await expect(scripts.locator('[data-script] .titulo-fila')).toHaveText(['Dejar una marca', 'Instalar'])
  const instalar = scripts.locator('[data-script]', { hasText: 'Instalar' })
  await expect(instalar.locator('.senal.rojo')).toHaveText('No se encuentra')
  await expect(instalar.getByRole('button', { name: /^Ejecutar/ })).toBeDisabled()
  await instalar.locator('.abrir-script').click()
  await expect(scripts.locator('.cuerpo-fila .recuadro.error')).toContainText('No se encuentra')
  // Ejecutar va en verde (R-58, R-78): el color de lo que funciona, no el del texto.
  const ejecutar = scripts.getByRole('button', { name: 'Ejecutar «Dejar una marca»' })
  await expect(
    scripts.locator('[data-script]', { hasText: 'Dejar una marca' }).locator('.detalle'),
  ).toContainText(' · ')
  const verde = await win.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bien').trim(),
  )
  expect(verde).not.toBe('')
  await expect(ejecutar).toHaveCSS(
    'color',
    await win.evaluate((v) => {
      const s = document.createElement('span')
      s.style.color = v
      document.body.append(s)
      const c = getComputedStyle(s).color
      s.remove()
      return c
    }, verde),
  )
  await ejecutar.click()
  await expect(scripts.locator('[data-script] .senal.verde')).toContainText('consola')
  await scripts.locator('[data-script]', { hasText: 'Dejar una marca' }).locator('.abrir-script').click()
  await expect(scripts.locator('.cuerpo-fila .texto-doc')).toContainText('Escribe marca.txt')
  await expect
    .poll(async () => (await readFile(join(raiz, 'Alfa', 'marca.txt'), 'utf8').catch(() => '')).trim(), {
      timeout: 15_000,
    })
    .toBe('listo')
  await win.screenshot({ path: 'test-results/i4-scripts.png' })

  await barra.getByRole('button', { name: 'Archivos' }).click()
  const archivos = win.locator('[data-seccion="archivos"]')
  await expect(archivos.locator('nav .arbol > .nodo, nav .arbol > div > .nodo')).toHaveText([
    'docs',
    'src',
    '.proyecto.json',
    'icono.png',
    'marca.txt',
  ])
  await archivos.locator('.nodo', { hasText: 'src' }).click()
  await archivos.locator('.nodo', { hasText: 'app.ts' }).click()
  await expect(archivos.locator('.archivos-ruta')).toHaveText('src/app.ts')
  await expect(archivos.locator('.archivos-ruta')).toHaveAttribute(
    'title',
    '2 líneas · TypeScript · solo lectura',
  )
  await expect(archivos.locator('.visor-codigo .c')).toHaveText('// La app')
  await expect(archivos.locator('.visor-codigo .k').first()).toHaveText('export')
  await win.screenshot({ path: 'test-results/i4-archivos.png' })

  await archivos.locator('.nodo', { hasText: 'icono.png' }).click()
  await expect(archivos.locator('.imagen img')).toBeVisible()

  // Un .md de los documentos se abre en Docs; Atrás vuelve al archivo.
  await archivos.locator('.nodo', { hasText: 'docs' }).first().click()
  await archivos.locator('.nodo', { hasText: 'decisiones.md' }).click()
  await archivos.getByRole('button', { name: 'Ver en Docs' }).click()
  await expect(win.locator('[data-seccion="docs"] .docs-ruta')).toHaveText('decisiones.md')
  await win.keyboard.press('Alt+ArrowLeft')
  await expect(archivos.locator('.archivos-ruta')).toHaveText('docs/decisiones.md')

  // La lupa busca un archivo por su nombre (T-90): Enter abre el primero y lo deja a la vista en el árbol.
  await archivos.locator('.nodo', { hasText: 'docs' }).first().click()
  await archivos.locator('.nodo', { hasText: 'src' }).click()
  await archivos.getByRole('button', { name: 'Buscar un archivo' }).click()
  const buscar = archivos.getByRole('textbox', { name: 'Buscar un archivo por su nombre' })
  await expect(buscar).toBeFocused()
  await expect(archivos.locator('.archivos-buscar')).toContainText('Escribe parte del nombre.')
  await buscar.fill('APP')
  await expect(archivos.getByRole('option')).toHaveText(['app.tssrc'])
  await win.screenshot({ path: 'test-results/t90-buscar.png' })
  await buscar.fill('no hay tal cosa')
  await expect(archivos.locator('.archivos-buscar')).toContainText('Ningún archivo se llama así.')
  await buscar.fill('app')
  await buscar.press('Enter')
  await expect(archivos.locator('.archivos-ruta')).toHaveText('src/app.ts')
  await expect(archivos.locator('.nodo.elegido')).toHaveText('app.ts')
  // Esc vuelve al árbol sin elegir.
  await archivos.getByRole('button', { name: 'Buscar un archivo' }).click()
  await archivos.getByRole('textbox', { name: 'Buscar un archivo por su nombre' }).press('Escape')
  await expect(archivos.locator('.archivos-buscar')).toHaveCount(0)
  // La consola del script terminó: cerrar no pregunta (I-10).
  await expect(win.locator('.senal-consolas')).toHaveText('1 consola')
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
  await win.locator('.cab-conv').getByRole('button', { name: 'Nueva' }).click()
  await campo.fill('Segunda charla')
  await campo.press('Enter')
  await terminado(win)
  await expect(win.locator('.cab-conv .nombre-conv b')).toHaveText('Segunda charla')

  await win.getByRole('button', { name: 'Conversaciones anteriores', exact: true }).click()
  const lista = win.locator('.anteriores [role="menu"]')
  await expect(lista.locator('.titulo-fila')).toHaveText(['Segunda charla', 'Primera charla'])
  await expect(lista.getByRole('menuitem').first()).toContainText('abierta')
  await win.screenshot({ path: 'test-results/i4-anteriores.png' })
  await lista.getByRole('menuitem', { name: /Primera charla/ }).click()
  await expect(win.locator('.cab-conv .nombre-conv b')).toHaveText('Primera charla')
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
  await expect(win.locator('.zona-principal')).toHaveAttribute('aria-label', 'Alfa')
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', ancho)
  await win.getByRole('separator', { name: /Ancho de la conversación/ }).dblclick()
  await expect(win.locator('aside.chat')).toHaveJSProperty('offsetWidth', 360)
  await app.close()
})
