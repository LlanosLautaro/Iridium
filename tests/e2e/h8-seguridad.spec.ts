// Hito 8, tanda 2 (08-calidad.md › Seguridad): la ventana no tiene Node ni Electron, solo el puente; no navega a otra
// página, no abre ventanas, no carga nada de internet, y el puente rechaza lo que no es de la carpeta de proyectos.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let app: ElectronApplication
let win: Page

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  await mkdir(join(raiz, 'Alfa', 'docs'), { recursive: true })
  await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
  await writeFile(join(raiz, 'secreto.txt'), 'secreto')
  const env = { ...process.env, IRIDIUM_DATOS: datos, IRIDIUM_MOTOR: 'falso' } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  app = await electron.launch({ args: ['.'], env })
  win = await app.firstWindow()
  await expect(win.getByText('Alfa')).toBeVisible()
})

test.afterEach(async () => {
  await app.close()
  await rm(raiz, { recursive: true, force: true })
  await rm(datos, { recursive: true, force: true })
})

test('la ventana no ve Node ni Electron; el puente solo tiene sus funciones', async () => {
  const r = await win.evaluate(() => {
    const w = window as unknown as Record<string, unknown>
    const api = w.iridium as Record<string, unknown>
    return {
      require: typeof w.require,
      process: typeof w.process,
      module: typeof w.module,
      buffer: typeof w.Buffer,
      electron: typeof w.electron,
      tipos: [...new Set(Object.entries(api).map(([k, v]) => (k === 'version' ? 'version' : typeof v)))],
      // Lo que devuelve el puente es una copia: cambiarlo no toca nada del proceso principal.
      congelado: Object.isFrozen(api) || !Object.getOwnPropertyDescriptor(api, 'listarProyectos')?.writable,
    }
  })
  expect(r).toMatchObject({
    require: 'undefined',
    process: 'undefined',
    module: 'undefined',
    buffer: 'undefined',
  })
  expect(r.electron).toBe('undefined')
  expect(r.tipos.sort()).toEqual(['function', 'version'])
  expect(r.congelado).toBe(true)
})

/**
 * Corre el código como la página (desde el proceso principal). `win.evaluate` de Playwright se salta la política de
 * contenido y, después de una navegación cancelada, se queda esperándola.
 */
const enLaPagina = (codigo: string) =>
  app.evaluate(
    ({ BrowserWindow }, c) => BrowserWindow.getAllWindows()[0]?.webContents.executeJavaScript(c),
    codigo,
  )
const direccion = () =>
  app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.webContents.getURL())

test('no navega a otra página ni abre ventanas', async () => {
  const antes = await direccion()
  const abiertas = await enLaPagina(
    `[window.open('https://example.com') === null, window.open('file:///C:/Windows/win.ini') === null]`,
  )
  expect(abiertas).toEqual([true, true])
  await enLaPagina(`location.href = 'file:///C:/Windows/win.ini'; true`)
  await enLaPagina(`location.href = 'https://example.com'; true`)
  await new Promise((r) => setTimeout(r, 1000))
  expect(await direccion()).toBe(antes)
  expect(app.windows()).toHaveLength(1)
  expect(await enLaPagina('document.body.innerText')).toContain('Alfa')
  // Los de internet van al navegador (con IRIDIUM_NAVEGADOR=falso, solo se anotan); los de archivo, a ningún lado.
  const afuera = await app.evaluate(() => (globalThis as { enlacesAfuera?: string[] }).enlacesAfuera ?? [])
  expect(afuera.map((u) => new URL(u).host)).toEqual(['example.com', 'example.com'])
})

test('la política de contenido no deja cargar ni ejecutar nada de afuera', async () => {
  const r = await enLaPagina(`(async () => {
    const bloqueado = (f) => { try { f(); return false } catch { return true } }
    const s = document.createElement('script')
    s.textContent = 'window.__inyectado = true'
    document.body.append(s)
    const red = await fetch('https://example.com').then(() => true, () => false)
    return {
      eval: bloqueado(() => eval('1')),
      funcion: bloqueado(() => new Function('return 1')),
      enLinea: Boolean(window.__inyectado),
      red,
    }
  })()`)
  expect(r).toEqual({ eval: true, funcion: true, enLinea: false, red: false })
})

test('el puente no lee fuera de la carpeta de proyectos', async () => {
  const r = await win.evaluate(
    async ({ raiz }) => {
      type Pedido = (...a: unknown[]) => Promise<unknown>
      const api = (window as unknown as { iridium: { archivo: Pedido; documento: Pedido } }).iridium
      const intentar = (p: Promise<unknown>) =>
        p.then(
          (v) => JSON.stringify(v),
          () => 'rechazado',
        )
      return {
        // Un «proyecto» que es la carpeta de arriba, una ruta con `..` y una que no existe.
        arriba: await intentar(api.archivo(raiz, 'secreto.txt')),
        conPuntos: await intentar(api.archivo(`${raiz}\\Alfa\\..`, 'secreto.txt')),
        sistema: await intentar(api.archivo('C:\\Windows', 'win.ini')),
        // Dentro de un proyecto, salir con `..` o una ruta absoluta.
        salir: await intentar(api.archivo(`${raiz}\\Alfa`, '../secreto.txt')),
        absoluta: await intentar(api.archivo(`${raiz}\\Alfa`, `${raiz}\\secreto.txt`)),
        documento: await intentar(api.documento(`${raiz}\\Alfa`, '../secreto.md')),
        // Un pedido con otro tipo de dato.
        tipo: await intentar(api.archivo({ ruta: raiz }, 1)),
      }
    },
    { raiz },
  )
  for (const [caso, v] of Object.entries(r)) expect(v, caso).not.toContain('secreto')
  expect(r.arriba).toBe('rechazado')
  expect(r.conPuntos).toBe('rechazado')
  expect(r.sistema).toBe('rechazado')
  expect(r.tipo).toBe('rechazado')
})
