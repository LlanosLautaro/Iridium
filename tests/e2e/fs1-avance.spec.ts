// FS-I1 con la app abierta y el motor falso: las marcas de la ruta en el Mapa (FS-1), Ajustes › IA › Avance solo con
// sus condiciones (FS-2) y los interruptores del proyecto y del frente (FS-3), que quedan en `config.json`.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, expect, type Page, test } from '@playwright/test'

let raiz: string
let datos: string
let abiertas: ElectronApplication[] = []

const ficha = JSON.stringify({
  version: 1,
  descripcion: 'Un proyecto',
  estado: 'en-desarrollo',
  etiquetas: [],
  icono: null,
  archivado: false,
  reemplazadoPor: null,
})

const ESTADO = `# Estado del proyecto

## Hito actual
10 — Operación — en curso

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Galería (\`modulos/galeria/estado.md\`) | sección | 7. Construcción | en curso |

## Preguntas abiertas
(ninguna)

## Próximo paso
Seguir con la Galería.
`

const GALERIA = `# Estado del módulo: Galería

**Última actualización:** 2026-11-20

## Ruta
- [x] Importar las fotos de una carpeta (chico, sola)
- [ ] Ver las fotos en una grilla (mediano, sola)
- [ ] Elegir con el usuario cómo se ordenan (chico)
- [ ] Hacer la versión grande de la grilla
`

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abiertas.push(app)
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

const config = async () => JSON.parse(await readFile(join(datos, 'config.json'), 'utf8'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))
  const archivos: Record<string, string> = {
    '.proyecto.json': ficha,
    'docs/README.md': '# Docs\n\n**Framework:** 2026-11-17\n',
    'docs/estado.md': ESTADO,
    'docs/trabajo.md': '# Trabajo\n',
    'docs/10-operacion.md': '# Operación\n',
    'docs/modulos/galeria/estado.md': GALERIA,
  }
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(raiz, 'Alfa', ruta, '..'), { recursive: true })
    await writeFile(join(raiz, 'Alfa', ruta), texto)
  }
})

test.afterEach(async () => {
  await Promise.all(abiertas.map((a) => a.close().catch(() => {})))
  abiertas = []
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  await rm(datos, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
})

test('el Mapa muestra el tamaño y sola de lo que viene, y apaga el frente (FS-1, FS-3)', async () => {
  const { win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: 'Mapa' })
    .click()
  const mapa = win.locator('[data-seccion="mapa"]')
  await expect(mapa.getByText('Ver las fotos en una grilla', { exact: true })).toBeVisible()
  // Los códigos y las marcas no están en el texto; lo hecho no muestra marcas; «grande» en el texto sigue ahí.
  await expect(mapa.locator('.marcas-paso')).toHaveText(['mediano · sola', 'chico'])
  await expect(mapa.getByText('Hacer la versión grande de la grilla', { exact: true })).toBeVisible()

  const interruptor = mapa.getByRole('switch', { name: 'Avanza sola' })
  await expect(interruptor).toBeChecked()
  await win.screenshot({ path: 'test-results/fs1-mapa.png' })
  await interruptor.uncheck()
  await expect(mapa.getByRole('switch', { name: 'No avanza sola' })).not.toBeChecked()
  await expect
    .poll(async () => (await config()).avanceApagado?.frentes)
    .toEqual([{ ruta: join(raiz, 'Alfa'), carpeta: 'galeria' }])
})

test('Ajustes: el avance solo, apagado al principio, con sus condiciones; y el del proyecto (FS-2, FS-3)', async () => {
  const { app, win } = await abrir()
  await win.locator('.tarjeta', { hasText: 'Alfa' }).click()
  await win.keyboard.press('Control+,')
  const dialogo = win.getByRole('dialog')
  await dialogo.getByRole('button', { name: 'IA', exact: true }).click()
  const interruptor = dialogo.getByRole('switch', { name: 'Avance solo' })
  const minutos = dialogo.getByLabel('Minutos sin usar Iridium')
  await expect(interruptor).not.toBeChecked()
  await expect(minutos).toBeDisabled()
  await expect(minutos).toHaveValue('10')

  await interruptor.check()
  await expect(minutos).toBeEnabled()
  await minutos.fill('5')
  await minutos.press('Enter')
  // Fuera de rango no se guarda: vuelve al anterior.
  const semana = dialogo.getByLabel('Porcentaje de la semana')
  await semana.fill('300')
  await semana.press('Enter')
  await expect(semana).toHaveValue('100')
  await dialogo.getByRole('radio', { name: 'De una hora a otra' }).check()
  await dialogo.getByRole('checkbox', { name: 'Grandes' }).uncheck()
  await expect
    .poll(async () => (await config()).avanceSolo)
    .toEqual({
      prendido: true,
      horario: { desde: '23:00', hasta: '07:00' },
      minutosSinUsar: 5,
      libre: 0,
      semana: 100,
      tamanos: ['chico', 'mediano'],
    })
  await interruptor.scrollIntoViewIfNeeded()
  await win.screenshot({ path: 'test-results/fs1-ajustes.png' })

  await dialogo.getByRole('button', { name: 'Este proyecto', exact: true }).click()
  const delProyecto = dialogo.getByRole('switch', { name: 'Avance solo' })
  await expect(delProyecto).toBeChecked()
  await delProyecto.uncheck()
  await expect.poll(async () => (await config()).avanceApagado?.proyectos).toEqual([join(raiz, 'Alfa')])
  await win.screenshot({ path: 'test-results/fs1-este-proyecto.png' })
  await app.close()

  // Queda al cerrar y abrir.
  const otra = await abrir()
  await expect(otra.win.getByRole('tablist', { name: 'Proyectos abiertos' })).toContainText('Alfa')
  await otra.win.keyboard.press('Control+,')
  await otra.win.getByRole('dialog').getByRole('button', { name: 'IA', exact: true }).click()
  await expect(otra.win.getByRole('switch', { name: 'Avance solo' })).toBeChecked()
  await expect(otra.win.getByLabel('Minutos sin usar Iridium')).toHaveValue('5')
})
