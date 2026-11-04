import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'

/** Con qué se armó la ventana (CO-I5): Ajustes › Proyectos lo muestra. Sin git, sin commit. */
function armado() {
  const git = (comando: string) => {
    try {
      return execSync(`git ${comando}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    } catch {
      return ''
    }
  }
  const [commit = '', mensaje = ''] = git('log -1 --format=%h%n%s').split('\n')
  return { fecha: Date.now(), commit, mensaje, sinGuardar: git('status --porcelain') !== '' }
}

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: { index: resolve('src/main/index.ts') },
        // El SDK queda fuera del paquete: trae su propio Claude Code (05-arquitectura.md › Despliegue).
        external: ['@anthropic-ai/claude-agent-sdk'],
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
    define: { __ARMADO__: JSON.stringify(armado()) },
    build: {
      rollupOptions: { input: { index: resolve('src/renderer/index.html') } },
    },
  },
})
