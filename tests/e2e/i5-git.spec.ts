// I-5: Git del proyecto (H-16), con un repositorio de verdad en una carpeta temporal y el motor falso. Para mirar:
// la rama, lo sin guardar, el historial, los archivos de un commit y su antes y después al abrir uno. Lo único que
// cambia el repositorio es crearlo y publicarlo en GitHub (D-081), acá con el GitHub falso.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string

async function escribir(ruta: string, texto: string) {
  await mkdir(join(raiz, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, ruta), texto)
}

const git = (proyecto: string, ...args: string[]) =>
  execFileSync(
    'git',
    ['-c', 'core.autocrlf=false', '-c', 'user.name=Lautaro', '-c', 'user.email=l@x', ...args],
    { cwd: join(raiz, proyecto), encoding: 'utf8' },
  )

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

## Próximo paso
Terminar I-2.
`

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_GITHUB: 'falso',
    GIT_AUTHOR_NAME: 'Lautaro',
    GIT_AUTHOR_EMAIL: 'l@x',
    GIT_COMMITTER_NAME: 'Lautaro',
    GIT_COMMITTER_EMAIL: 'l@x',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

async function irAGit(win: Page, proyecto: string) {
  await win.locator('.tarjeta', { hasText: proyecto }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Git' })
    .click()
  return win.locator('[data-seccion="git"]:not([hidden])')
}

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await escribir('Alfa/.proyecto.json', ficha)
  await escribir('Alfa/docs/estado.md', ESTADO)
  await escribir('Alfa/src/galeria.ts', 'export const columnas = 3\nexport const margen = 8\n')
  git('Alfa', 'init', '-q', '-b', 'master')
  git('Alfa', 'add', '.')
  git('Alfa', 'commit', '-q', '--no-gpg-sign', '-m', 'I-1: importar fotos')
  await escribir(
    'Alfa/src/galeria.ts',
    'export const columnas = 4\nexport const margen = 8\nexport const gap = 12\n',
  )
  await escribir(
    'Alfa/docs/decisiones.md',
    '# Decisiones\n\n## D-12 — Grilla de cuatro columnas\nSe lee mejor.\n',
  )
  git('Alfa', 'add', '.')
  git(
    'Alfa',
    'commit',
    '-q',
    '--no-gpg-sign',
    '-m',
    'I-2: la galería en cuatro columnas (D-12)',
    '-m',
    'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>',
  )
  // Lo que la IA dejó sin guardar.
  await escribir('Alfa/docs/estado.md', ESTADO.replace('Terminar I-2.', 'Probar I-2 con el usuario.'))
  await escribir('Alfa/src/etiquetas.ts', 'export const etiquetas: string[] = []\n')
  await escribir('Beta/.proyecto.json', ficha)
})

test.afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('Git: la rama, lo sin guardar, el historial y el antes y después de un archivo (H-16)', async () => {
  const { app, win } = await abrir()
  const g = await irAGit(win, 'Alfa')

  // La rama, que está solo en la PC, y las secciones Cambios e Historial (Q-75, como VS Code).
  await expect(g.locator('.rama')).toContainText('master')
  await expect(g.locator('.remoto')).toContainText('Solo en esta PC')
  const seccion = (t: string) => g.locator('.plegable', { has: win.locator('h3', { hasText: t }) })
  await expect(seccion('Cambios').locator('h3')).toContainText('2')
  await expect(seccion('Cambios').locator('.fila-git')).toHaveText([
    /estado\.md\s*docs\s*M/,
    /etiquetas\.ts\s*src\s*A/,
  ])
  const commits = g.locator('.arbol-lista .commit')
  await expect(commits).toHaveCount(2)
  await expect(commits.nth(0)).toContainText('I-2: la galería en cuatro columnas (D-12)')
  await expect(commits.nth(0)).toContainText('2 archivos')
  await expect(commits.nth(0)).not.toContainText('sin subir')
  await expect(commits.nth(1)).toContainText('I-1: importar fotos')
  // De entrada, todos los cambios sin guardar: la lista, sin el antes y después hasta abrir uno (Q-61).
  await expect(g.locator('.git-det h2')).toHaveText('Cambios sin guardar')
  await expect(g.locator('.arch')).toHaveCount(2)
  await expect(g.locator('.dif')).toHaveCount(0)
  await g.locator('.arch button', { hasText: 'docs/estado.md' }).click()
  await expect(g.locator('.dif .quitada')).toContainText('Terminar I-2.')
  await expect(g.locator('.dif .agregada')).toContainText('Probar I-2 con el usuario.')
  await expect(g.locator('.dif .quitada .signo')).toHaveText('−')
  await expect(g.locator('.dif .agregada .signo')).toHaveText('+')

  // Un archivo elegido en el panel se ve solo, con su antes y después a la vista; «Ver todos» vuelve a la lista.
  await seccion('Cambios').locator('.fila-git', { hasText: 'etiquetas.ts' }).click()
  await expect(g.locator('.git-det h2')).toHaveText('etiquetas.ts')
  await expect(g.locator('.dif .agregada')).toHaveCount(1)
  await expect(seccion('Cambios').locator('.fila-git.sel')).toContainText('etiquetas.ts')
  await win.screenshot({ path: 'test-results/i5-sin-guardar.png' })
  await g.getByRole('button', { name: 'Ver todos los cambios' }).click()
  await expect(g.locator('.git-det h2')).toHaveText('Cambios sin guardar')

  // Las secciones se pliegan y se despliegan.
  await seccion('Cambios').locator('h3 button').click()
  await expect(seccion('Cambios').locator('.fila-git')).toHaveCount(0)
  await expect(seccion('Cambios').locator('h3 button')).toHaveAttribute('aria-expanded', 'false')
  await seccion('Cambios').locator('h3 button').click()
  await expect(seccion('Cambios').locator('.fila-git')).toHaveCount(2)

  // El último commit de la IA: mensaje, autor con Claude, archivos y el antes y después al abrir uno.
  await commits.nth(0).click()
  await expect(g.locator('.git-det h2')).toHaveText('I-2: la galería en cuatro columnas (D-12)')
  await expect(g.locator('.git-det .meta')).toContainText('Lautaro con Claude Opus 5.5')
  await expect(g.locator('.arch')).toHaveCount(2)
  await expect(g.locator('.arch', { hasText: 'src/galeria.ts' }).locator('.git-cuenta')).toContainText('+2')
  await expect(g.locator('.arch', { hasText: 'src/galeria.ts' }).locator('.git-cuenta')).toContainText('−1')
  await expect(g.locator('.dif')).toHaveCount(0)
  await g.locator('.arch button', { hasText: 'src/galeria.ts' }).click()
  await expect(g.locator('.dif .quitada')).toHaveText(/export const columnas = 3/)
  await expect(g.locator('.dif .agregada').first()).toContainText('export const columnas = 4')
  await win.screenshot({ path: 'test-results/i5-commit.png' })

  // Para mirar: ningún botón cambia lo guardado (los únicos son los commits, los archivos y Publicar en GitHub, D-081).
  const botones = await g.locator('button').allTextContents()
  for (const b of botones) expect(b).not.toMatch(/guardar cambios|commit$|revertir|descartar|push|pull/i)

  // Un commit nuevo hecho afuera (la IA guardando) aparece solo, sin salir de la sección.
  git('Alfa', 'add', '.')
  git('Alfa', 'commit', '-q', '--no-gpg-sign', '-m', 'I-2: estado al día')
  await expect(commits.first()).toContainText('I-2: estado al día', { timeout: 10_000 })
  await expect(seccion('Cambios').locator('h3')).toContainText('0')
  await expect(seccion('Cambios')).toContainText('Nada sin guardar: todo está en commits.')
  // Lo elegido sigue elegido.
  await expect(g.locator('.git-det h2')).toHaveText('I-2: la galería en cuatro columnas (D-12)')
  await app.close()
})

test('Git: un repositorio en GitHub lo dice y marca los commits sin subir (Q-75)', async () => {
  // Un «GitHub» de mentira: un repositorio en otra carpeta, con la dirección cambiada a la de GitHub después de subir.
  const nube = await mkdtemp(join(tmpdir(), 'iridium-e2e-nube-'))
  try {
    execFileSync('git', ['init', '-q', '--bare', nube])
    git('Alfa', 'remote', 'add', 'origin', nube)
    git('Alfa', 'push', '-q', '-u', 'origin', 'master')
    git('Alfa', 'remote', 'set-url', 'origin', 'https://github.com/LlanosLautaro/Alfa.git')
    git('Alfa', 'add', '.')
    git('Alfa', 'commit', '-q', '--no-gpg-sign', '-m', 'I-2: estado al día')
    const { app, win } = await abrir()
    const g = await irAGit(win, 'Alfa')
    await expect(g.locator('.remoto')).toContainText('En GitHub · LlanosLautaro/Alfa')
    await expect(g.locator('.remoto')).toContainText('1 commit sin subir')
    await expect(g.locator('.remoto a')).toHaveAttribute('href', 'https://github.com/LlanosLautaro/Alfa')
    const commits = g.locator('.arbol-lista .commit')
    await expect(commits.nth(0)).toContainText('sin subir')
    await expect(commits.nth(1)).not.toContainText('sin subir')
    await win.screenshot({ path: 'test-results/i5-github.png' })
    await app.close()
  } finally {
    await rm(nube, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  }
})

test('Git: un proyecto sin repositorio lo dice', async () => {
  const { app, win } = await abrir()
  const g = await irAGit(win, 'Beta')
  await expect(g).toContainText('Este proyecto no usa git')
  await win.screenshot({ path: 'test-results/i5-sin-git.png' })
  await app.close()
})

test('Git: crear el repositorio y publicarlo en GitHub (D-081)', async () => {
  await escribir('Beta/src/main.ts', 'export const x = 1\n')
  await escribir('Beta/.env', 'CLAVE=secreta\n')
  const { app, win } = await abrir()
  const g = await irAGit(win, 'Beta')
  await g.getByRole('button', { name: 'Inicializar repositorio' }).click()
  await expect(g.locator('.arbol-lista .commit').first()).toContainText('Primer commit')
  await expect(g.locator('.aviso-git')).toContainText('.env')
  await expect(g.locator('.remoto')).toContainText('Solo en esta PC')
  await win.screenshot({ path: 'test-results/d081-inicializado.png' })

  await g.getByRole('button', { name: 'Publicar en GitHub' }).click()
  const d = win.getByRole('dialog', { name: 'Publicar en GitHub' })
  await expect(d).toContainText('Con la cuenta prueba')
  await expect(d.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Beta')
  await expect(d.getByRole('radio', { name: /Privado/ })).toBeChecked()
  await win.screenshot({ path: 'test-results/d081-publicar.png' })
  // Un nombre con espacios no se puede publicar.
  await d.getByRole('textbox', { name: 'Nombre' }).fill('mi beta')
  await expect(d.getByRole('button', { name: 'Publicar' })).toBeDisabled()
  await d.getByRole('textbox', { name: 'Nombre' }).fill('Beta')
  await d.getByRole('radio', { name: /Público/ }).check()
  await d.getByRole('button', { name: 'Publicar' }).click()
  await expect(d).toBeHidden()
  await expect(g.locator('.remoto')).toContainText('En GitHub · prueba/Beta')
  await expect(g.locator('.remoto')).toContainText('Al día con GitHub')
  await win.screenshot({ path: 'test-results/d081-publicado.png' })
  await app.close()
})
