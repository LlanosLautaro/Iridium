// CO-I6 y R-12 con la app abierta: el código de Iridium es un proyecto de muestra con git y su carpeta `release`
// (IRIDIUM_RELEASE). Con commits que `main` no tiene aparece Actualizar; tocarlo arma (IRIDIUM_ARMAR: un comando que no
// arma) y muestra «Actualizando…» con Cancelar; cuando aparece la versión lista, Iridium se reinicia solo. Si el armado
// falla, «No se pudo actualizar» con Reintentar y Ver la consola. Mientras la IA de ese proyecto trabaja, Actualizar
// queda deshabilitado.
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let codigo: string
let release: string

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'El código de Iridium',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})
const estado = '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n(ninguna)\n'

function git(...args: string[]): string {
  return execFileSync('git', args, {
    cwd: codigo,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
}

async function commit(mensaje: string) {
  await writeFile(join(codigo, 'cambio.txt'), mensaje)
  git('add', '.')
  git('-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo', 'commit', '-qm', mensaje)
}

async function abrir(extra: Record<string, string> = {}): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_RELEASE: release,
    // La consola se abre y se cierra sola: no arma nada.
    IRIDIUM_ARMAR: 'exit',
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const a = await electron.launch({ args: ['.'], env })
  const win = await a.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app: a, win }
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  codigo = join(raiz, 'Iridium')
  release = join(codigo, 'release')
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(codigo, 'docs'), { recursive: true })
  await mkdir(join(release, 'win-unpacked'), { recursive: true })
  await writeFile(join(codigo, '.proyecto.json'), ficha)
  await writeFile(join(codigo, 'docs', 'estado.md'), estado)
  await writeFile(join(codigo, '.gitignore'), 'release/\n')
  git('init', '-q', '-b', 'dev')
  await commit('CO-I4')
  git('branch', 'main')
})

test.afterEach(async () => {
  for (const c of [raiz, datos]) await rm(c, { recursive: true, force: true, maxRetries: 5 })
})

// Un «Iridium.exe» que se puede abrir sin que se vea nada: rundll32 sin argumentos termina en el acto.
async function versionLista(commit: string) {
  await mkdir(join(release, 'nueva', 'win-unpacked'), { recursive: true })
  await copyFile('C:\\Windows\\System32\\rundll32.exe', join(release, 'nueva', 'win-unpacked', 'Iridium.exe'))
  await writeFile(
    join(release, 'nueva', 'lista.json'),
    JSON.stringify({
      fecha: new Date().toISOString().slice(0, 19),
      commit,
      mensaje: 'R-12',
      sinGuardar: false,
    }),
  )
}

test('con commits sin armar aparece Actualizar; arma, se puede cancelar y, con la versión lista, reinicia solo (R-12)', async () => {
  test.setTimeout(120_000)
  const { app: a, win } = await abrir()
  await expect(win.locator('.estado-barra')).toContainText('Claude')
  const barra = win.locator('.actualizar-it')
  await expect(barra).toHaveCount(0)

  // La IA commitea: en unos segundos aparece, sin hacer nada.
  await commit('R-12: Actualizar desde la barra')
  const hash = git('rev-parse', '--short', 'HEAD')
  const actualizar = barra.getByRole('button', { name: 'Actualizar' })
  await expect(actualizar).toBeVisible({ timeout: 15_000 })
  await expect(actualizar).toHaveAttribute(
    'title',
    `Trae «R-12: Actualizar desde la barra» (${hash}) y lo anterior que falte`,
  )
  await expect(win.getByRole('button', { name: 'Armar' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/r12-disponible.png' })

  // Arma y se arrepiente: vuelve a ofrecer Actualizar.
  await actualizar.click()
  await expect(barra).toContainText('Actualizando…')
  await win.screenshot({ path: 'test-results/r12-armando.png' })
  await barra.getByRole('button', { name: 'Cancelar' }).click()
  await expect(actualizar).toBeVisible()

  // Ahora sí: el «script» deja la versión lista con ese commit e Iridium se reinicia solo con ella.
  await actualizar.click()
  await expect(barra).toContainText('Actualizando…')
  const cerrada = a.waitForEvent('close', { timeout: 70_000 })
  await versionLista(hash)
  await cerrada
  await expect
    .poll(async () => readdir(join(release, 'win-unpacked')).catch(() => []), { timeout: 20_000 })
    .toEqual(['Iridium.exe'])
  const log = await readFile(join(release, 'actualizacion.log'), 'utf8')
  expect(log).toContain(`Versión nueva puesta: ${hash}`)
  expect(log).toContain('Abre Iridium.')
})

test('si el armado falla: «No se pudo actualizar» con el motivo, Reintentar y Ver la consola (R-12)', async () => {
  await commit('R-12')
  const { app: a, win } = await abrir()
  const barra = win.locator('.actualizar-it')
  await barra.getByRole('button', { name: 'Actualizar' }).click({ timeout: 15_000 })
  await expect(barra).toContainText('Actualizando…')
  // Lo que deja `actualizar.ps1` cuando no pudo; la marca del armado ya no está.
  await writeFile(
    join(release, 'armado-fallo.json'),
    JSON.stringify({ fecha: '2026-11-06T14:05:00', motivo: 'No se pudo armar. Iridium quedó como estaba.' }),
  )
  await barra.getByRole('button', { name: 'Cancelar' }).click()
  await expect(barra.locator('.chip.error')).toContainText('No se pudo actualizar', { timeout: 15_000 })
  await expect(barra.locator('.chip.error')).toHaveAttribute(
    'title',
    'No se pudo armar. Iridium quedó como estaba.',
  )
  await expect(barra.getByRole('button', { name: 'Ver la consola' })).toBeVisible()
  await win.screenshot({ path: 'test-results/r12-fallo.png' })
  // Reintentar borra el fallo y vuelve a armar.
  await barra.getByRole('button', { name: 'Reintentar' }).click()
  await expect(barra).toContainText('Actualizando…')
  await a.close()
})

test('mientras la IA del código de Iridium trabaja, Actualizar queda deshabilitado', async () => {
  test.setTimeout(90_000)
  await commit('CO-I6')
  const { app: a, win } = await abrir({ IRIDIUM_FALSO_PASO_MS: '3000' })
  const actualizar = win.locator('.actualizar-it').getByRole('button', { name: 'Actualizar' })
  await expect(actualizar).toBeEnabled({ timeout: 15_000 })

  await win.locator('.tarjeta', { hasText: 'Iridium' }).click()
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill('Seguí')
  await campo.press('Enter')
  await expect(win.locator('.ses', { hasText: 'Iridium' })).toContainText('Trabajando')
  await expect(actualizar).toBeDisabled()
  await expect(actualizar).toHaveAttribute('title', 'Espera a que la IA de Iridium termine')
  await expect(win.locator('.actualizar-it')).toContainText('espera a que la IA de Iridium termine')
  await win.screenshot({ path: 'test-results/r12-bloqueado.png' })
  await expect(actualizar).toBeEnabled({ timeout: 40_000 })
  await a.close()
})
