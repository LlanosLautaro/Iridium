// FS-I2 con la app abierta y el motor falso: el avance solo toma el paso marcado `sola` de Alfa (FS-4), la conversación
// lo dice debajo del título, y el aviso al volver cuenta qué avanzó (FS-5). IRIDIUM_AVANCE_SIN_USAR cambia los minutos
// sin usar por segundos y mira cada segundo; IRIDIUM_FALSO_PERIODO=cerrado, el uso sin un período abierto.
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
`

const avance = {
  prendido: true,
  horario: null,
  minutosSinUsar: 10,
  libre: 0,
  semana: 100,
  tamanos: ['chico', 'mediano', 'grande'],
}

async function abrir(): Promise<{ app: ElectronApplication; win: Page }> {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_FALSO_PASO_MS: '60',
    IRIDIUM_FALSO_PERIODO: 'cerrado',
    IRIDIUM_AVANCE_SIN_USAR: '2',
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ args: ['.'], env })
  abiertas.push(app)
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  return { app, win }
}

const leerJson = async (archivo: string) => JSON.parse(await readFile(join(datos, archivo), 'utf8'))

test.beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-e2e-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-e2e-datos-'))
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

test('prendido y sin usar Iridium, toma el paso sola de Alfa, lo dice en la conversación y en el aviso (FS-4, FS-5)', async () => {
  await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz, avanceSolo: avance }))
  const { app, win } = await abrir()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()

  // La pestaña de Alfa aparece arriba sola, como con el Arranque.
  const pestanas = win.getByRole('tablist', { name: 'Proyectos abiertos' })
  await expect(pestanas.getByText('Alfa')).toBeVisible({ timeout: 20_000 })
  await expect
    .poll(async () => (await leerJson('arranques.json').catch(() => ({ momentos: [] }))).momentos)
    .toEqual([
      expect.objectContaining({
        momento: 'avance',
        resultado: 'arranco',
        proyecto: { ruta: join(raiz, 'Alfa'), nombre: 'Alfa', preguntas: [] },
        paso: {
          frente: 'Galería',
          carpeta: 'galeria',
          texto: 'Ver las fotos en una grilla',
          tamano: 'mediano',
          linea: 7,
        },
      }),
    ])
  const marca = (await leerJson('arranques.json')).momentos[0].cuando
  await expect
    .poll(async () =>
      Object.values((await leerJson('sesiones.json').catch(() => ({ conversaciones: {} }))).conversaciones),
    )
    .toEqual([expect.objectContaining({ ruta: join(raiz, 'Alfa'), arranque: marca, motivo: 'avance' })])
  // Terminada, anota el uso de después: lo gastado.
  await expect(pestanas).toContainText('Terminada', { timeout: 15_000 })
  await expect
    .poll(async () => (await leerJson('arranques.json')).momentos[0].uso.despues)
    .toEqual({ periodo: expect.any(Number), semana: expect.any(Number) })

  // El aviso al volver cuenta qué avanzó, con cómo terminó y Abrir.
  const aviso = win.getByRole('status', { name: 'Lo que hizo Iridium mientras no estabas' })
  await expect(aviso).toBeVisible()
  await expect(aviso).toContainText('Alfa')
  await expect(aviso).toContainText('avanzó «Ver las fotos en una grilla»')
  await win.screenshot({ path: 'test-results/fs2-aviso.png' })

  // La conversación empieza con el paso y lo dice debajo del título.
  await aviso.getByRole('button', { name: 'Abrir Alfa' }).click()
  await expect(
    win
      .getByText('Avance solo: seguí con «Ver las fotos en una grilla» del frente Galería', { exact: false })
      .first(),
  ).toBeVisible()
  await expect(win.getByText('para avanzar sola', { exact: false })).toBeVisible()
  await win.screenshot({ path: 'test-results/fs2-conversacion.png' })

  // No repite el mismo paso: sigue sin hacer (el motor falso no lo marca) y no hay otro, así que no toma nada más.
  await win.waitForTimeout(4000)
  expect((await leerJson('arranques.json')).momentos).toHaveLength(1)
  await app.close()
})

test('con el frente apagado no toma nada', async () => {
  await writeFile(
    join(datos, 'config.json'),
    JSON.stringify({
      version: 1,
      raiz,
      avanceSolo: avance,
      avanceApagado: { proyectos: [], frentes: [{ ruta: join(raiz, 'Alfa'), carpeta: 'galeria' }] },
    }),
  )
  const { app, win } = await abrir()
  await expect(win.locator('.tarjeta', { hasText: 'Alfa' })).toBeVisible()
  await win.waitForTimeout(6000)
  await expect(win.getByRole('tablist', { name: 'Proyectos abiertos' }).getByText('Alfa')).toHaveCount(0)
  expect((await leerJson('arranques.json').catch(() => ({ momentos: [] }))).momentos).toEqual([])
  await app.close()
})
