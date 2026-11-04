import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Medir la cobertura frena el código: las pruebas de tiempo se saltean (IRIDIUM_COBERTURA).
    env: process.argv.includes('--coverage') ? { IRIDIUM_COBERTURA: '1' } : {},
    // `pnpm cobertura` (hito 8): cuánto de la lógica del proceso principal recorren las pruebas.
    coverage: {
      provider: 'v8',
      include: ['src/main/**/*.ts', 'src/compartido/**/*.ts'],
      reporter: ['text-summary', 'json-summary', 'json', 'html'],
      reportsDirectory: 'test-results/cobertura',
    },
  },
})
