// Arma la extensión de la Revisión en `out/extension/` (diseno-tecnico.md › Estructura interna). Corre dentro de
// `pnpm build`: cada script queda en un solo archivo, sin módulos, como los pide una extensión.
import { createHash } from 'node:crypto'
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const salida = join(raiz, 'out', 'extension')

await rm(salida, { recursive: true, force: true })
for (const [nombre, entrada] of [
  ['pagina', 'extension/src/pagina.ts'],
  ['selector', 'extension/src/selector/index.ts'],
  ['sw', 'extension/src/sw.ts'],
  // Lo que el ayudante mete en una interfaz propia de una app Electron, donde la extensión no entra.
  ['inyectado', 'extension/src/inyectado.ts'],
]) {
  await build({
    configFile: false,
    root: raiz,
    logLevel: 'warn',
    build: {
      outDir: join(salida, 'js'),
      emptyOutDir: false,
      minify: false,
      target: 'chrome120',
      lib: {
        entry: join(raiz, entrada),
        formats: ['iife'],
        name: `iridium_${nombre}`,
        fileName: () => `${nombre}.js`,
      },
    },
  })
}
await cp(join(raiz, 'extension', 'manifest.json'), join(salida, 'manifest.json'))
await cp(join(raiz, 'extension', 'fuentes'), join(salida, 'fuentes'), { recursive: true })
// El ayudante de Electron va tal cual: lo carga la línea de cada app con `import()`.
await cp(join(raiz, 'extension', 'electron'), join(salida, 'electron'), { recursive: true })
await cp(join(raiz, 'build', 'icon.png'), join(salida, 'icono.png'))

// La marca de compilación: Iridium copia la extensión a su carpeta fija solo si cambió.
const hash = createHash('sha256')
for (const n of (await readdir(salida, { recursive: true })).sort()) {
  try {
    hash.update(n).update(await readFile(join(salida, n)))
  } catch {
    // Carpeta.
  }
}
await mkdir(salida, { recursive: true })
await writeFile(join(salida, 'compilacion.txt'), `${hash.digest('hex').slice(0, 16)}\n`)
console.log(`Extensión armada en ${salida}`)
