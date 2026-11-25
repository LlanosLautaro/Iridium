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
