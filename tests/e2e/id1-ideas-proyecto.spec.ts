// ID-I1 (frente Ideas, `modulos/ideas/ux.md` › W-10), con la app abierta y el motor falso: la sección Ideas de un
// proyecto lee los `T-n` con `Idea:` de `trabajo.md`; se anota una idea y un enlace, se abre una idea y se escribe en
// ella, se aprueba y se rechaza (también con el clic derecho), y todo queda en `trabajo.md` y en `docs/ideas/`.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

const ESTADO = `# Estado del proyecto

**Última actualización:** 2026-11-16

## Hito actual
7 — Construcción — en curso

## Preguntas abiertas
(ninguna)

## Próximo paso
Seguir.
`

const TRABAJO = `# Trabajo

## T-1 — Un sonido cuando la IA termina
Estado: nueva · Idea: usuario · Fecha: 2026-11-07

## T-2 — El Mapa como una red de pasos
Estado: nueva · Idea: IA · Fecha: 2026-11-15
Un paso por frente, con flechas entre ellos.

## T-3 — Dictado
Estado: pendiente · Idea: usuario · Fecha: 2026-11-09

## T-4 — Revisión para apps Android
Estado: descartado · Idea: usuario · Fecha: 2026-10-22
Rechazada por el usuario.

## T-5 — Respaldo en GitHub
Estado: pendiente · Fecha: 2026-11-04
`

async function escribir(ruta: string, texto: string) {
  await mkdir(join(raiz, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, ruta), texto)
}

const trabajo = () => readFile(join(raiz, 'Alfa/docs/trabajo.md'), 'utf8')

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
  await escribir('Alfa/docs/estado.md', ESTADO)
  await escribir('Alfa/docs/README.md', '# Docs\n\n**Framework:** 2026-11-16\n')
  await escribir('Alfa/docs/trabajo.md', TRABAJO)
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('Ideas en un proyecto: la lista, anotar, abrir y escribir, aprobar y rechazar (ID-I1); Revisar con la IA y Hablar de esta idea (ID-I2)', async () => {
  const { app, win } = await abrir()
  try {
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
    await barra.getByRole('button', { name: 'Ideas' }).click()
    const ideas = win.locator('[data-seccion="ideas"]')

    // La lista: las ideas, sin el T-5 (es trabajo, no idea); la de la IA con el robot y su código; los estados en color.
    const filtros = ideas.getByRole('group', { name: 'Filtrar ideas' })
    await expect(filtros.getByRole('button', { name: 'Todo 4' })).toBeVisible()
    await expect(filtros.getByRole('button', { name: 'Aprobadas 1' })).toBeVisible()
    const fila = (titulo: string) => ideas.locator('.idp-item', { hasText: titulo })
    await expect(fila('Respaldo en GitHub')).toHaveCount(0)
    await expect(
      fila('El Mapa como una red de pasos').getByRole('img', { name: 'Anotada por la IA' }),
    ).toBeVisible()
    // Sin el código: para el usuario es ruido (Q-183); la fecha sí.
    await expect(fila('El Mapa como una red de pasos')).not.toContainText('T-2')
    await expect(fila('Dictado')).toContainText('Aprobada')
    await expect(fila('Revisión para apps Android')).toContainText('Rechazada')
    // Rechazada en gris, no en rojo, que es el color de los errores (T-109, D-201); Aprobada sigue en verde.
    const colorDe = (l: import('@playwright/test').Locator) => l.evaluate((e) => getComputedStyle(e).color)
    const gris = await colorDe(fila('Revisión para apps Android').locator('.senal', { hasText: 'Rechazada' }))
    const texto3 = await win.evaluate(() => {
      const s = document.createElement('span')
      s.style.color = 'var(--texto-3)'
      document.body.append(s)
      const c = getComputedStyle(s).color
      s.remove()
      return c
    })
    expect(gris).toBe(texto3)
    expect(await colorDe(fila('Revisión para apps Android').locator('.icono-fila'))).toBe(texto3)
    await win.screenshot({ path: 'test-results/id1-ideas-lista.png' })

    // Anotar: Enter la deja primera en Ideas, sin evaluar; el campo queda vacío y con el foco.
    const campo = ideas.getByRole('textbox', { name: 'Anotar una idea o un enlace' })
    await campo.fill('Atajos para los filtros')
    await campo.press('Enter')
    await expect(campo).toHaveValue('')
    await expect(campo).toBeFocused()
    await expect(ideas.locator('section[aria-label="Ideas"] .idp-item').first()).toContainText(
      'Atajos para los filtros',
    )
    await expect.poll(trabajo).toMatch(/## T-6 — Atajos para los filtros\nEstado: nueva · Idea: usuario/)

    // Un enlace va a «Enlaces», con su nombre y su sitio; el tilde lo marca revisado y pasa a Hechas.
    await campo.fill('https://github.com/tldraw/tldraw\nCómo arma las flechas')
    await campo.press('Enter')
    const revisar = ideas.locator('section[aria-label="Enlaces"]')
    await expect(revisar.locator('.idp-item')).toContainText('tldraw/tldraw')
    await expect(revisar.locator('.idp-item')).toContainText('github.com · Cómo arma las flechas')
    // Enviar a la conversación (ID-I2, Q-182, R-77): el pedido de revisarlo queda citado arriba del campo de la conversación, sin enviar; tocarlo otra vez
    // no lo repite. Al enviar, sale como cita con lo escrito, y la cita se va.
    const mensaje = win.getByRole('textbox', { name: 'Mensaje para la IA' })
    const citas = win.locator('.compositor .citado')
    await expect(revisar.getByRole('button', { name: 'Revisar con la IA' })).toHaveCount(0)
    await revisar.getByRole('button', { name: 'Enviar a la conversación' }).click()
    await revisar.getByRole('button', { name: 'Enviar a la conversación' }).click()
    await expect(citas).toHaveCount(1)
    await expect(citas).toContainText('Revisar tldraw/tldraw')
    await expect(citas).not.toContainText('T-7')
    await expect(mensaje).toBeFocused()
    await expect(win.locator('.hilo')).not.toContainText('Revisá https://github.com/tldraw/tldraw')
    await win.screenshot({ path: 'test-results/id2-revisar.png' })
    await mensaje.fill('Me interesan las flechas')
    await mensaje.press('Enter')
    // Q-309: en el hilo, la cita va como una ficha corta; el pedido entero le llega a la IA.
    await expect(win.locator('.hilo .turno.usuario .ficha.citado')).toContainText('Revisar tldraw/tldraw')
    await expect(win.locator('.hilo')).not.toContainText('Revisá https://github.com/tldraw/tldraw')
    await expect(win.locator('.hilo')).toContainText('Me interesan las flechas')
    await expect(citas).toHaveCount(0)
    await revisar.getByRole('button', { name: 'Marcar como revisado' }).click()
    await expect(revisar).toHaveCount(0)
    await expect(filtros.getByRole('button', { name: 'Hechas 1' })).toBeVisible()

    // Abrir una idea: la primera línea es el título; lo que va debajo es su nota, y se guarda solo.
    await fila('Un sonido cuando la IA termina').getByRole('button').first().click()
    const nota = ideas.getByRole('textbox', { name: /Idea Un sonido/ })
    await expect(nota).toBeFocused()
    await nota.press('End')
    await nota.pressSequentially(' (bajito)\nQue no suene si estoy mirando la ventana.')
    await expect
      .poll(() => readFile(join(raiz, 'Alfa/docs/ideas/T-1.md'), 'utf8').catch(() => ''))
      .toContain('Que no suene si estoy mirando la ventana.')
    await expect.poll(trabajo).toContain('## T-1 — Un sonido cuando la IA termina (bajito)')

    // Hablar de esta idea (ID-I2, Q-182): queda citada en la conversación, sin enviar, con su título (sin el código,
    // Q-183); la ✕ la saca.
    await ideas.locator('.cuerpo-fila').getByRole('button', { name: 'Hablar de esta idea' }).click()
    await expect(citas).toContainText('Idea Un sonido cuando la IA termina (bajito)')
    await expect(mensaje).toHaveValue('')
    await expect(mensaje).toBeFocused()
    await win.screenshot({ path: 'test-results/id2-hablar.png' })
    await win.getByRole('button', { name: /Quitar la cita Un sonido/ }).click()
    await expect(citas).toHaveCount(0)
    // El botón de enviar de cada renglón (R-75) la cita igual, sin abrirla.
    await fila('El Mapa como una red de pasos').hover()
    await fila('El Mapa como una red de pasos')
      .getByRole('button', { name: 'Enviar a la conversación' })
      .click()
    await expect(citas).toContainText('Idea El Mapa como una red de pasos')
    await win.screenshot({ path: 'test-results/r75-enviar.png' })
    await win.getByRole('button', { name: /Quitar la cita/ }).click()
    await expect(citas).toHaveCount(0)
    await ideas.getByRole('textbox', { name: /Idea Un sonido/ }).click()
    await win.screenshot({ path: 'test-results/id1-ideas-abierta.png' })

    // Aprobar desde la idea abierta: verde, y en trabajo.md pasa a pendiente; el mismo botón la vuelve a sin evaluar.
    const abierta = ideas.locator('.cuerpo-fila')
    await abierta.getByRole('button', { name: 'Aprobar' }).click()
    await expect(fila('Un sonido cuando la IA termina')).toContainText('Aprobada')
    await expect.poll(trabajo).toMatch(/## T-1 — [^\n]+\nEstado: pendiente/)
    await abierta.getByRole('button', { name: 'Aprobar' }).click()
    await expect(fila('Un sonido cuando la IA termina')).not.toContainText('Aprobada')
    await expect.poll(trabajo).toMatch(/## T-1 — [^\n]+\nEstado: nueva/)

    // Esc la cierra; la nota sigue al volver a abrirla.
    await win.keyboard.press('Escape')
    await expect(abierta).toHaveCount(0)
    await fila('Un sonido cuando la IA termina').getByRole('button').first().click()
    await expect(ideas.getByRole('textbox', { name: /Idea Un sonido/ }).locator('p')).toHaveText([
      'Un sonido cuando la IA termina (bajito)',
      'Que no suene si estoy mirando la ventana.',
    ])
    await win.keyboard.press('Escape')

    // La de la IA se lee al abrirla, sin escribir en ella; se rechaza con el clic derecho.
    await fila('El Mapa como una red de pasos').getByRole('button').first().click()
    await expect(ideas.locator('.cuerpo-fila')).toContainText('Un paso por frente, con flechas entre ellos.')
    await expect(ideas.locator('.cuerpo-fila [contenteditable]')).toHaveCount(0)
    await expect(ideas.locator('.cuerpo-fila').getByRole('button', { name: 'Borrar' })).toHaveCount(0)
    await win.keyboard.press('Escape')
    await fila('El Mapa como una red de pasos').getByRole('button').first().click({ button: 'right' })
    await win.getByRole('menu').getByRole('menuitemcheckbox', { name: 'Rechazar' }).click()
    await expect(fila('El Mapa como una red de pasos')).toContainText('Rechazada')
    await expect.poll(trabajo).toMatch(/## T-2 — [^\n]+\nEstado: descartado/)

    // Los filtros: Rechazadas muestra las dos; Aprobadas, solo Dictado.
    await filtros.getByRole('button', { name: /^Rechazadas/ }).click()
    await expect(ideas.locator('.idp-item')).toHaveCount(2)
    await filtros.getByRole('button', { name: /^Aprobadas/ }).click()
    await expect(ideas.locator('.idp-item')).toHaveCount(1)
    await expect(ideas.locator('.idp-item')).toContainText('Dictado')

    // ID-I3: la nota completa. Pegar una dirección la vuelve una Etiqueta de enlace; una imagen, se guarda con la idea.
    await filtros.getByRole('button', { name: /^Todo/ }).click()
    await fila('Un sonido cuando la IA termina').getByRole('button').first().click()
    const hoja = ideas.getByRole('textbox', { name: /Idea Un sonido/ })
    await hoja.locator('p').nth(1).click()
    await win.keyboard.press('End')
    await win.keyboard.press('Enter')
    await app.evaluate(({ clipboard }) => clipboard.writeText('https://github.com/alfa/sonidos'))
    await win.keyboard.press('Control+V')
    await expect(hoja.locator('.nota-enlace')).toHaveText('sonidosgithub.com')
    await app.evaluate(({ clipboard, ClipboardItem, nativeImage }) => {
      const gris = nativeImage.createFromBitmap(Buffer.alloc(320 * 180 * 4, 0x40), {
        width: 320,
        height: 180,
      })
      const blob = new Blob([new Uint8Array(gris.toPNG())], { type: 'image/png' })
      return clipboard.write([new ClipboardItem({ 'image/png': blob })])
    })
    await win.keyboard.press('Control+V')
    await expect(hoja.locator('.nota-imagen img')).toBeVisible()
    const notaT1 = () => readFile(join(raiz, 'Alfa/docs/ideas/T-1.md'), 'utf8').catch(() => '')
    await expect
      .poll(notaT1)
      .toMatch(/ventana\.\n\nhttps:\/\/github\.com\/alfa\/sonidos\n\n!\[\]\(T-1\/\d{4}-\d{2}-\d{2}-1\.png\)/)
    await win.screenshot({ path: 'test-results/id3-nota.png' })
    // Al cerrarla y volver a abrirla, la etiqueta y la imagen siguen ahí.
    await win.keyboard.press('Escape')
    await fila('Un sonido cuando la IA termina').getByRole('button').first().click()
    await expect(hoja.locator('.nota-enlace')).toHaveText('sonidosgithub.com')
    await expect(hoja.locator('.nota-imagen img')).toBeVisible()

    // Q-189: si el pegado no trae la imagen a la ventana, Iridium la busca en el portapapeles de Windows.
    const pegarSinNada = () =>
      hoja.evaluate((h) => {
        h.dispatchEvent(new ClipboardEvent('paste', { clipboardData: new DataTransfer(), bubbles: true }))
      })
    await hoja.locator('p').last().click()
    await pegarSinNada()
    await expect(hoja.locator('.nota-imagen img')).toHaveCount(2)
    await expect.poll(notaT1).toMatch(/!\[\]\(T-1\/\d{4}-\d{2}-\d{2}-2\.png\)/)
    // Sin ninguna imagen, lo dice en vez de quedarse callada.
    await app.evaluate(({ clipboard }) => clipboard.clear())
    await pegarSinNada()
    await expect(ideas.locator('.recuadro.error')).toContainText('El portapapeles está vacío')
    await expect(hoja.locator('.nota-imagen img')).toHaveCount(2)

    // Borrar (ID-8) pide confirmar en el cuadro del centro (Q-189): No la deja; Sí la saca con su nota y su imagen.
    const abiertaAhora = ideas.locator('.cuerpo-fila')
    const cuadro = win.getByRole('alertdialog')
    await abiertaAhora.getByRole('button', { name: 'Borrar' }).click()
    await expect(cuadro).toContainText('¿Borrar esta idea?')
    await expect(cuadro.getByRole('button', { name: 'No' })).toBeFocused()
    await win.screenshot({ path: 'test-results/id3-borrar.png' })
    await cuadro.getByRole('button', { name: 'No' }).click()
    await expect(cuadro).toHaveCount(0)
    await expect(abiertaAhora.getByRole('button', { name: 'Aprobar' })).toBeVisible()
    // Esc es No, y la idea sigue abierta.
    await abiertaAhora.getByRole('button', { name: 'Borrar' }).click()
    await win.keyboard.press('Escape')
    await expect(cuadro).toHaveCount(0)
    await expect(abiertaAhora.getByRole('button', { name: 'Aprobar' })).toBeVisible()
    await abiertaAhora.getByRole('button', { name: 'Borrar' }).click()
    await cuadro.getByRole('button', { name: 'Sí, borrar' }).click()
    await expect(fila('Un sonido cuando la IA termina')).toHaveCount(0)
    await expect.poll(trabajo).not.toContain('## T-1 —')
    await expect.poll(notaT1).toBe('')
    // Un enlace se borra desde el clic derecho, con la confirmación en el mismo cuadro.
    await filtros.getByRole('button', { name: /^Hechas/ }).click()
    await fila('tldraw/tldraw').getByRole('button').first().click({ button: 'right' })
    await win.getByRole('menu').getByRole('menuitem', { name: 'Borrar' }).click()
    await expect(cuadro).toContainText('¿Borrar este enlace?')
    await win.screenshot({ path: 'test-results/id3-borrar-enlace.png' })
    await cuadro.getByRole('button', { name: 'Sí, borrar' }).click()
    await expect(fila('tldraw/tldraw')).toHaveCount(0)
    await expect.poll(trabajo).not.toContain('tldraw')
  } finally {
    await app.close()
  }
})

test('Ideas vacía: la línea de para qué es, sin grupos', async () => {
  await escribir(
    'Alfa/docs/trabajo.md',
    '# Trabajo\n\n## T-1 — Algo\nEstado: pendiente · Fecha: 2026-11-04\n',
  )
  const { app, win } = await abrir()
  try {
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    await win
      .getByRole('navigation', { name: 'Secciones del proyecto' })
      .getByRole('button', { name: 'Ideas' })
      .click()
    const ideas = win.locator('[data-seccion="ideas"]')
    await expect(ideas).toContainText(
      'Todavía no hay ideas. Escribe una arriba o pega un enlace para revisar.',
    )
    await expect(ideas.locator('.bloque-titulo')).toHaveCount(0)
  } finally {
    await app.close()
  }
})

test('Pegar una imagen en el campo de arriba (R-87, R-88): queda debajo, se saca con ✕ y va a la nota al anotar', async () => {
  const { app, win } = await abrir()
  try {
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    await win
      .getByRole('navigation', { name: 'Secciones del proyecto' })
      .getByRole('button', { name: 'Ideas' })
      .click()
    const ideas = win.locator('[data-seccion="ideas"]')
    const campo = ideas.getByRole('textbox', { name: 'Anotar una idea o un enlace' })
    const pegadas = ideas.getByRole('list', { name: 'Imágenes para la idea' }).locator('img')
    const copiarImagen = () =>
      app.evaluate(({ clipboard, ClipboardItem, nativeImage }) => {
        const gris = nativeImage.createFromBitmap(Buffer.alloc(320 * 180 * 4, 0x40), {
          width: 320,
          height: 180,
        })
        const blob = new Blob([new Uint8Array(gris.toPNG())], { type: 'image/png' })
        return clipboard.write([new ClipboardItem({ 'image/png': blob })])
      })

    // Escribir, pegar dos capturas con Ctrl+V y sacar una con ✕.
    await campo.fill('Un botón como este\nEl de la captura')
    await copiarImagen()
    await campo.press('Control+V')
    await expect(pegadas).toHaveCount(1)
    await campo.press('Control+V')
    await expect(pegadas).toHaveCount(2)
    await expect(campo).toHaveValue('Un botón como este\nEl de la captura')
    await win.screenshot({ path: 'test-results/r87-campo-con-imagen.png' })
    await ideas.getByRole('button', { name: 'Sacar la imagen 2' }).click()
    await expect(pegadas).toHaveCount(1)

    // Enter anota: la idea con su nota y la imagen; el campo y las imágenes quedan vacíos.
    await campo.press('Enter')
    await expect(campo).toHaveValue('')
    await expect(pegadas).toHaveCount(0)
    await expect.poll(trabajo).toMatch(/## T-6 — Un botón como este\nEstado: nueva · Idea: usuario/)
    await expect
      .poll(() => readFile(join(raiz, 'Alfa/docs/ideas/T-6.md'), 'utf8').catch(() => ''))
      .toMatch(/^El de la captura\n\n!\[\]\(T-6\/\d{4}-\d{2}-\d{2}-1\.png\)\n$/)
    // Abierta, la imagen está en su renglón.
    await ideas.locator('.idp-item', { hasText: 'Un botón como este' }).getByRole('button').first().click()
    await expect(ideas.locator('.idp-nota .nota-imagen img')).toBeVisible()
    await win.screenshot({ path: 'test-results/r87-anotada.png' })
    await win.keyboard.press('Escape')

    // Solo la imagen, sin nada escrito: se anota como «Imagen pegada».
    await campo.press('Control+V')
    await expect(pegadas).toHaveCount(1)
    await expect(ideas.getByRole('button', { name: 'Anotar', exact: true })).toBeEnabled()
    await campo.press('Enter')
    await expect.poll(trabajo).toMatch(/## T-7 — Imagen pegada/)
  } finally {
    await app.close()
  }
})

test('Calidad (paso 8): Shift+Enter, una idea abierta a la vez, pegar con formato y abrir un enlace (ID-1, ID-2, ID-4)', async () => {
  const { app, win } = await abrir()
  try {
    await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
    await win
      .getByRole('navigation', { name: 'Secciones del proyecto' })
      .getByRole('button', { name: 'Ideas' })
      .click()
    const ideas = win.locator('[data-seccion="ideas"]')
    const fila = (titulo: string) => ideas.locator('.idp-item', { hasText: titulo })
    const campo = ideas.getByRole('textbox', { name: 'Anotar una idea o un enlace' })

    // ID-1: Shift+Enter baja de renglón sin anotar; con Enter, la primera línea es el título y el resto, su nota.
    await campo.fill('Atajos para los filtros')
    await campo.press('Shift+Enter')
    await campo.pressSequentially('Con las teclas 1 a 6.')
    await expect(campo).toHaveValue('Atajos para los filtros\nCon las teclas 1 a 6.')
    await campo.press('Enter')
    await expect(campo).toHaveValue('')
    await expect.poll(trabajo).toMatch(/## T-6 — Atajos para los filtros\nEstado: nueva · Idea: usuario/)
    await expect
      .poll(() => readFile(join(raiz, 'Alfa/docs/ideas/T-6.md'), 'utf8').catch(() => ''))
      .toContain('Con las teclas 1 a 6.')

    // ID-2: una abierta a la vez. Abrir otra cierra la primera; un clic en la abierta la cierra.
    const abiertas = ideas.locator('.cuerpo-fila')
    await fila('Un sonido cuando la IA termina').getByRole('button').first().click()
    await expect(ideas.getByRole('textbox', { name: /Idea Un sonido/ })).toBeVisible()
    await fila('Dictado').getByRole('button').first().click()
    await expect(abiertas).toHaveCount(1)
    await expect(ideas.getByRole('textbox', { name: /Idea Dictado/ })).toBeVisible()
    await expect(ideas.getByRole('textbox', { name: /Idea Un sonido/ })).toHaveCount(0)
    await fila('Dictado').getByRole('button').first().click()
    await expect(abiertas).toHaveCount(0)

    // ID-2: lo que trae formato se pega como texto; cambiar la primera línea cambia el título del renglón.
    await fila('Un sonido cuando la IA termina').getByRole('button').first().click()
    const hoja = ideas.getByRole('textbox', { name: /Idea Un sonido/ })
    await expect(hoja).toBeFocused()
    await win.keyboard.press('End')
    await win.keyboard.press('Enter')
    await app.evaluate(({ clipboard, ClipboardItem }) =>
      clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob(['Negrita y normal'], { type: 'text/plain' }),
          'text/html': new Blob(['<b>Negrita</b> y <i>normal</i>'], { type: 'text/html' }),
        }),
      ]),
    )
    expect(
      await app.evaluate(async ({ clipboard }) => (await clipboard.read()).flatMap((i) => i.types)),
    ).toContain('text/html')
    await win.keyboard.press('Control+V')
    await expect(hoja).toContainText('Negrita y normal')
    await expect(hoja.locator('b, i, strong, em')).toHaveCount(0)
    await expect
      .poll(() => readFile(join(raiz, 'Alfa/docs/ideas/T-1.md'), 'utf8').catch(() => ''))
      .toContain('Negrita y normal')
    await hoja.locator('p').first().click()
    await win.keyboard.press('End')
    await win.keyboard.type(' al terminar')
    await expect(fila('Un sonido cuando la IA termina al terminar').locator('.titulo-fila')).toBeVisible()
    await expect.poll(trabajo).toContain('## T-1 — Un sonido cuando la IA termina al terminar')
    await win.screenshot({ path: 'test-results/id8-calidad-pegar.png' })
    await win.keyboard.press('Escape')

    // ID-4: un clic en el renglón de un enlace lo abre en el navegador (en la prueba, se anota en vez de abrirse).
    await campo.fill('https://github.com/tldraw/tldraw')
    await campo.press('Enter')
    await fila('tldraw/tldraw').getByRole('button').first().click()
    await expect
      .poll(() => app.evaluate(() => (globalThis as { enlacesAfuera?: string[] }).enlacesAfuera ?? []))
      .toEqual(['https://github.com/tldraw/tldraw'])
    await expect(abiertas).toHaveCount(0)
  } finally {
    await app.close()
  }
})
