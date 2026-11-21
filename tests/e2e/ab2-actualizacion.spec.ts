// AB-I2 con la app abierta y el motor falso (frente Abrir, AB-3, AB-4): dos proyectos con git y commits sin armar se
// arman solos, de a uno y escondidos; la tarjeta dice «Actualizando…» mientras tanto y «No se pudo actualizar» si
// falló. Ajustes › Este proyecto: el interruptor se recuerda, y un proyecto sin script de armar lo dice en gris. Los
// armados son comandos de prueba (`ping` para tardar, `exit 1` para fallar): no se arma ninguna app de verdad.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'
import { armarCarpetaClaude } from '../muestras/carpeta-claude'

let base: string
let raiz: string
let datos: string
let abierta: ElectronApplication | null = null

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
  '# Estado del proyecto\n\n**Última actualización:** 2026-11-19\n\n## Hito actual\n7 — Construcción — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nSeguir.\n'

const scripts = (armar: string) => `# Scripts

## Abrir la app
La versión armada.
**Ejecutar:** \`dist/App.exe\`
**Marca:** ejecutar · escritorio

## Armar la app
Arma la versión de uso.
**Ejecutar:** \`${armar}\`
**Marca:** armar
`

/** Un proyecto con su repositorio y un commit (la app nunca se armó: hay commits sin armar). */
async function proyecto(nombre: string, archivos: Record<string, string>, conGit = true) {
  const carpeta = join(raiz, nombre)
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(carpeta, ruta, '..'), { recursive: true })
    await writeFile(join(carpeta, ruta), texto)
  }
  if (!conGit) return
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.com', ...args], {
      cwd: carpeta,
      stdio: 'ignore',
      windowsHide: true,
    })
  git('init', '-q')
  git('add', '-A')
  git('commit', '-q', '-m', 'Primero')
}

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_CLAUDE: join(base, '.claude'),
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_OCULTA: '1',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abierta = app
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

test.beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-e2e-ab2-'))
  raiz = join(base, 'PROYECTOS')
  datos = join(base, 'datos')
  await armarCarpetaClaude(join(base, '.claude'), join(raiz, '.iridium', 'Skills'), join(base, 'afuera'))
  await proyecto('Alfa', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado,
    'docs/scripts.md': scripts('ping -n 4 127.0.0.1'),
  })
  await proyecto('Beta', {
    '.proyecto.json': ficha,
    'docs/estado.md': estado,
    'docs/scripts.md': scripts('cmd /c exit 1'),
  })
  await proyecto(
    'Gamma',
    {
      '.proyecto.json': ficha,
      'docs/estado.md': estado,
      'docs/scripts.md':
        '# Scripts\n\n## Abrir\n**Abrir:** `https://ejemplo.com`\n**Marca:** ejecutar · página\n',
    },
    false,
  )
  await mkdir(datos, { recursive: true })
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
})

test.afterEach(async () => {
  try {
    abierta?.process().kill()
  } catch {
    // Ya estaba cerrada.
  }
  abierta = null
  await rm(base, { recursive: true, force: true, maxRetries: 5 })
})

test('se arman solas, de a una: «Actualizando…» y, si falla, «No se pudo actualizar» (AB-3, AB-4)', async () => {
  const { app, win } = await abrir()
  const alfa = win.locator('.tarjeta', { hasText: 'Alfa' })
  const beta = win.locator('.tarjeta', { hasText: 'Beta' })
  await expect(alfa.locator('.senal', { hasText: 'Actualizando…' })).toBeVisible({ timeout: 15_000 })
  // De a una: Beta espera a que termine Alfa.
  await expect(beta.locator('.senal', { hasText: 'Actualizando…' })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/ab2-actualizando.png' })
  // Alfa termina bien: al día no se dice nada. Beta falla.
  await expect(beta.locator('.senal', { hasText: 'No se pudo actualizar' })).toBeVisible({ timeout: 30_000 })
  await expect(alfa.locator('.senal', { hasText: /Actualizando|No se pudo/ })).toHaveCount(0)
  await win.screenshot({ path: 'test-results/ab2-fallo.png' })
  await app.close()
})

test('Ajustes › Este proyecto: el interruptor se recuerda y sin script de armar lo dice en gris (AB-4)', async () => {
  let { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  const barra = win.getByRole('navigation', { name: 'Secciones del proyecto' })
  await barra.getByRole('button', { name: 'Ajustes' }).click()
  const dialogo = win.getByRole('dialog', { name: 'Este proyecto' })
  await expect(dialogo.getByText('Actualización automática')).toBeVisible()
  const interruptor = dialogo.getByRole('switch', { name: 'Actualización automática' })
  await expect(interruptor).toBeChecked()
  // Termina el primer armado y dice cuándo.
  await expect(dialogo.getByText(/^Actualizada hoy a las/)).toBeVisible({ timeout: 20_000 })
  await interruptor.uncheck()
  await expect(dialogo.getByText('Apagada')).toBeVisible()
  await expect(dialogo.getByRole('button', { name: 'Actualizar ahora' })).toBeEnabled()
  await win.screenshot({ path: 'test-results/ab2-ajustes.png' })
  await app.close()

  // Iridium vuelve al proyecto que estaba abierto (D-060).
  ;({ app, win } = await abrir())
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Ajustes' })
    .click()
  await expect(
    win
      .getByRole('dialog', { name: 'Este proyecto' })
      .getByRole('switch', { name: 'Actualización automática' }),
  ).not.toBeChecked()
  await win.keyboard.press('Escape')

  await win.getByRole('button', { name: 'Inicio' }).first().click()
  await win.locator('.tarjeta', { hasText: 'Gamma' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Ajustes' })
    .click()
  await expect(
    win
      .getByRole('dialog', { name: 'Este proyecto' })
      .getByText('Este proyecto todavía no está preparado', { exact: false }),
  ).toBeVisible()
  await app.close()
})
