// PA-I1 (frente Paridad): los comandos con «/» en la conversación, con el motor falso. La lista arriba del compositor,
// el filtro, elegir sin mandar, mandar, los usados hace poco, un escondido escrito a mano, el + › Comandos, la lista
// que se pone al día con una skill nueva y un motor sin comandos (PA-1, PA-5, PA-6).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})
const estado =
  '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nHacer la grilla.\n'

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_FALSO_PASO_MS: '100',
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  return { app, win }
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', '.proyecto.json'), ficha)
  await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), estado)
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 5 })
  await rm(datos, { recursive: true, force: true, maxRetries: 5 })
})

test('«/» abre la lista, filtra, elegir no manda y el segundo Enter sí (PA-1, PA-5)', async () => {
  const { app, win } = await abrir()
  const cuadro = win.getByLabel('Mensaje para la IA')
  const lista = win.getByRole('listbox', { name: 'Comandos' })
  await cuadro.click()
  await cuadro.pressSequentially('/')
  await expect(lista).toBeVisible()
  // Sin los escondidos: ni /clear ni /model ni /context.
  await expect(lista.getByRole('option', { name: /\/compact/ })).toBeVisible()
  await expect(lista.getByRole('option', { name: /\/clear/ })).toHaveCount(0)
  await expect(lista.getByRole('option', { name: /\/model/ })).toHaveCount(0)
  // Los de un complemento dicen de cuál, a la derecha.
  await expect(lista.getByRole('option', { name: /\/engineering:debug/ }).locator('.meta')).toHaveText(
    'engineering',
  )
  await win.screenshot({ path: 'test-results/pa1-lista.png' })

  await cuadro.pressSequentially('re')
  await expect(lista.getByRole('option')).toHaveText([/^\/recap/, /^\/rename/, /^\/code-review/])
  await expect(lista.getByRole('option', { selected: true })).toContainText('/recap')
  await cuadro.press('ArrowDown')
  await expect(lista.getByRole('option', { selected: true })).toContainText('/rename')
  await win.screenshot({ path: 'test-results/pa1-filtro.png' })
  await cuadro.press('Enter')
  // Elegir no manda: queda «/rename » con el cursor al final y la lista cerrada.
  await expect(cuadro).toHaveValue('/rename ')
  await expect(lista).toHaveCount(0)
  await expect(win.locator('.turno')).toHaveCount(0)

  await cuadro.pressSequentially('el instalador')
  await cuadro.press('Enter')
  await expect(win.locator('.turno.usuario code.cmd')).toHaveText('/rename')
  await expect(win.locator('.turno.usuario')).toContainText('el instalador')
  await expect(win.locator('.hilo .texto-doc').last()).toContainText(
    'Recibí el comando /rename con: el instalador',
  )
  await expect(win.locator('.ahora')).toHaveCount(0)
  await win.screenshot({ path: 'test-results/pa1-mandado.png' })

  // Usado hace poco: va primero.
  await cuadro.pressSequentially('/')
  await expect(lista.locator('.titulo-menu').first()).toHaveText('Usados hace poco')
  await expect(lista.getByRole('option').first()).toContainText('/rename')
  // Esc la cierra y deja lo escrito; un espacio también la cierra.
  await cuadro.press('Escape')
  await expect(lista).toHaveCount(0)
  await expect(cuadro).toHaveValue('/')
  await cuadro.pressSequentially('xyz')
  await expect(lista).toContainText('Ningún comando empieza con /xyz')
  await cuadro.press('Space')
  await expect(lista).toHaveCount(0)
  await app.close()
})

test('un escondido escrito a mano no se manda y dice dónde está eso en Iridium (D-168)', async () => {
  const { app, win } = await abrir()
  const cuadro = win.getByLabel('Mensaje para la IA')
  await cuadro.click()
  await cuadro.pressSequentially('/model')
  await expect(win.locator('.linea-cmd')).toHaveText('/model: en Iridium, el modelo se elige abajo')
  await cuadro.press('Enter')
  await expect(win.locator('.turno')).toHaveCount(0)
  await expect(win.getByRole('button', { name: 'Enviar' })).toBeDisabled()

  await cuadro.fill('/clear')
  const linea = win.locator('.linea-cmd')
  await expect(linea).toContainText('/clear: en Iridium, otra conversación se empieza con')
  await win.screenshot({ path: 'test-results/pa1-escondido.png' })
  await cuadro.press('Enter')
  await expect(win.locator('.turno')).toHaveCount(0)
  // Nueva borra lo escrito y abre la conversación en blanco.
  await linea.getByRole('button', { name: 'Nueva' }).click()
  await expect(cuadro).toHaveValue('')
  await expect(win.locator('.cab-conv')).toContainText('Conversación nueva')
  // Al cambiar lo escrito, la línea se va.
  await cuadro.pressSequentially('/stats')
  await expect(linea).toContainText('el uso está en la barra de abajo')
  await cuadro.press('Backspace')
  await expect(linea).toHaveCount(0)
  await app.close()
})

test('el + › Comandos escribe la «/» y abre la lista; una skill nueva la pone al día (PA-1)', async () => {
  const { app, win } = await abrir()
  const cuadro = win.getByLabel('Mensaje para la IA')
  const lista = win.getByRole('listbox', { name: 'Comandos' })
  await win.locator('.compositor').getByRole('button', { name: 'Agregar archivos, fotos o comandos' }).click()
  await win.screenshot({ path: 'test-results/pa1-mas.png' })
  await win.getByRole('menuitem', { name: /Comandos/ }).click()
  await expect(cuadro).toHaveValue('/')
  await expect(cuadro).toBeFocused()
  await expect(lista).toBeVisible()
  await expect(lista.getByRole('option', { name: /skill-nueva/ })).toHaveCount(0)
  await cuadro.press('Escape')

  await cuadro.fill('Armá una skill nueva')
  await cuadro.press('Enter')
  await expect(win.locator('.ahora')).toHaveCount(0, { timeout: 10_000 })
  await cuadro.pressSequentially('/skill-n')
  await expect(lista.getByRole('option')).toHaveText([/^\/skill-nueva/])
  await app.close()
})

test('un motor sin comandos: «/» no abre nada y el + no tiene Comandos (PA-6)', async () => {
  const { app, win } = await abrir({ IRIDIUM_FALSO_COMANDOS: 'no' })
  const cuadro = win.getByLabel('Mensaje para la IA')
  await cuadro.click()
  await cuadro.pressSequentially('/cle')
  await expect(win.getByRole('listbox', { name: 'Comandos' })).toHaveCount(0)
  await win.locator('.compositor').getByRole('button', { name: 'Agregar archivos o fotos' }).click()
  await expect(win.getByRole('menuitem', { name: /Agregar archivos o fotos/ })).toBeVisible()
  await expect(win.getByRole('menuitem', { name: /Comandos/ })).toHaveCount(0)
  await app.close()
})
