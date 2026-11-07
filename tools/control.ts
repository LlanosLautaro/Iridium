// El control de Iridium (frente Orden, OR-2) sobre una carpeta, desde la terminal: lista lo que marcaría al terminar un
// turno. Corre aunque el proyecto no haya pasado al framework (para medir cuánto falta). No escribe nada en el proyecto.
// Uso: node --experimental-strip-types tools/control.ts [carpeta del proyecto]   (sin carpeta, este repo)
import { mkdtemp, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = resolve(import.meta.dirname, '..')
const proyecto = resolve(process.argv[2] ?? raiz)

// El código del control usa imports sin extensión: se arma con el esbuild que trae vite.
const desdeVite = createRequire(createRequire(join(raiz, 'package.json')).resolve('vite'))
const esbuild = desdeVite('esbuild') as { buildSync: (opciones: Record<string, unknown>) => unknown }
const temporal = await mkdtemp(join(tmpdir(), 'iridium-control-'))
const salida = join(temporal, 'control.mjs')
esbuild.buildSync({
  stdin: {
    contents:
      "export { leerArchivosControl } from './src/main/app/control'\n" +
      "export { correrControl, dondeDe, tieneFramework } from './src/main/core/control'\n",
    resolveDir: raiz,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: salida,
  logLevel: 'error',
})
const c = await import(pathToFileURL(salida).href)
await rm(temporal, { recursive: true, force: true })

const archivos = await c.leerArchivosControl(proyecto)
const avisos: { regla: string; archivo: string; linea: number | null; texto: string }[] =
  c.correrControl(archivos)
const readme = archivos.documentos.find((d: { ruta: string }) => d.ruta === 'docs/README.md')?.texto ?? null
console.log(c.tieneFramework(readme) ? 'Con framework.' : 'Framework viejo (el control no corre en la app).')
for (const a of avisos) console.log(`- [${a.regla}] ${c.dondeDe(a)} — ${a.texto}`)
console.log(`${avisos.length} aviso${avisos.length === 1 ? '' : 's'}.`)
