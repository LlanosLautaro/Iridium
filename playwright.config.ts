import { defineConfig } from '@playwright/test'

// La app abierta con el motor falso (05-arquitectura.md › Estrategia de pruebas). Antes: pnpm build.
// Las ventanas se abren fuera de la pantalla y de la barra de tareas, y las consolas de Scripts escondidas: el usuario
// puede seguir usando la PC mientras corren (D-072). Para mirarlas: IRIDIUM_OCULTA=0.
process.env.IRIDIUM_OCULTA ??= '1'
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  reporter: 'list',
})
