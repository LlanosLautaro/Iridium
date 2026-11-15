import { defineConfig } from '@playwright/test'

// La app abierta con el motor falso (05-arquitectura.md › Estrategia de pruebas). Antes: pnpm build.
// Las ventanas se abren fuera de la pantalla y de la barra de tareas, y las consolas de Scripts escondidas: el usuario
// puede seguir usando la PC mientras corren (D-072). Para mirarlas: IRIDIUM_OCULTA=0.
process.env.IRIDIUM_OCULTA ??= '1'
// Los enlaces a internet no abren el navegador del usuario: la app los anota y la prueba los mira.
process.env.IRIDIUM_NAVEGADOR = 'falso'
// Actualizar no arma ni reinicia solo (T-67): las pruebas que lo miran lo prenden con una espera corta.
process.env.IRIDIUM_ACTUALIZAR_SOLO ??= 'no'
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  reporter: 'list',
})
