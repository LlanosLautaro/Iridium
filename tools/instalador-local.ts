// El instalador de cada armado, para el Iridium instalado de esta PC (Q-304 A, D-198): lo llama `tools/actualizar.ps1`
// con la app recién armada. Es el mismo instalador que se publica (se actualiza desde GitHub); la copia de esta PC lo
// baja de `release/instalador`, que sirve ella misma (`src/main/infra/versiones-locales.ts`).
// Deja el instalador nuevo, su `.blockmap` y, último, `latest.yml` (así nadie ve una versión sin su instalador). Borra
// los instaladores viejos y deja los `.blockmap` de las últimas versiones: con el de la versión instalada, electron-updater
// baja solo lo que cambió.
// Uso: node --experimental-strip-types tools/instalador-local.ts --app <win-unpacked> --salida <release/instalador>
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readdir, rename, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { armarInstalador } from './instalador.ts'

/** Cuántos `.blockmap` viejos quedan: las versiones que puede tener instaladas esta PC. */
const BLOCKMAPS = 5

const opcion = (nombre: string) => {
  const i = process.argv.indexOf(nombre)
  return i > 0 ? (process.argv[i + 1] ?? null) : null
}
const app = opcion('--app')
const salida = opcion('--salida')
if (!app || !salida) throw new Error('Uso: instalador-local.ts --app <win-unpacked> --salida <carpeta>')

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const origin = git('remote', 'get-url', 'origin')
const repo = /github\.com[/:]([\w.-]+\/[\w.-]+?)(\.git)?$/.exec(origin)?.[1]
if (!repo) throw new Error(`origin no es un repositorio de GitHub: ${origin}`)

const trabajo = await mkdtemp(join(tmpdir(), 'iridium-instalador-local-'))
try {
  const i = await armarInstalador({
    app,
    trabajo,
    repo,
    commit: git('rev-parse', '--short', 'HEAD'),
    mensaje: git('log', '-1', '--format=%s'),
  })
  await mkdir(salida, { recursive: true })
  await copyFile(i.exe, join(salida, basename(i.exe)))
  await copyFile(i.blockmap, join(salida, basename(i.blockmap)))
  await copyFile(i.latest, join(salida, 'latest.yml.nuevo'))
  await rename(join(salida, 'latest.yml.nuevo'), join(salida, 'latest.yml'))

  const archivos = await readdir(salida)
  for (const a of archivos)
    if (a.endsWith('.exe') && a !== basename(i.exe))
      await rm(join(salida, a), { force: true }).catch(() => {})
  const blockmaps = await Promise.all(
    archivos
      .filter((a) => a.endsWith('.blockmap'))
      .map(async (a) => ({ a, t: (await stat(join(salida, a))).mtimeMs })),
  )
  blockmaps.sort((x, y) => y.t - x.t)
  for (const { a } of blockmaps.slice(BLOCKMAPS)) await rm(join(salida, a), { force: true }).catch(() => {})
  console.log(`Instalador ${i.version} listo en ${salida}`)
} finally {
  await rm(trabajo, { recursive: true, force: true }).catch(() => {})
}
