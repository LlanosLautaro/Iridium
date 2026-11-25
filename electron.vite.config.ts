import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'
import { armado } from './tools/armado'

// El mismo para la ventana y para el proceso principal, que lo usa para publicar la versión en uso (T-132).
const ARMADO = JSON.stringify(armado())

export default defineConfig({
  main: {
    define: { __ARMADO__: ARMADO },
    build: {
      rollupOptions: {
        input: { index: resolve('src/main/index.ts') },
        // El SDK queda fuera del paquete: trae su propio Claude Code (05-arquitectura.md › Despliegue).
        // La consola nativa (T-116) también: su .node y OpenConsole.exe van fuera del archivo comprimido.
        external: ['@anthropic-ai/claude-agent-sdk', 'node-pty'],
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: { index: resolve('src/preload/index.ts') },
        // Con sandbox: true el preload tiene que ser CommonJS.
        output: { format: 'cjs', entryFileNames: '[name].cjs' },
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react()],
    define: { __ARMADO__: ARMADO },
    build: {
      rollupOptions: { input: { index: resolve('src/renderer/index.html') } },
    },
  },
})
