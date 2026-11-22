// El instalador de Iridium (D-171, modulos/compartir/diseno-tecnico.md › Iridium instalado): se arma desde una app ya
// armada (la carpeta `win-unpacked`), sin volver a compilar. Lo usan `tools/publicar.ts` y `tools/probar-instalador.ts`.
import { execFileSync } from 'node:child_process'
import { cp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { extractFile } from '@electron/asar'
import { appUpdateYml, completarLatest } from '../src/compartido/versiones.ts'

/** El número de una app armada: el `version` del `package.json` de su `app.asar`. */
export function versionDeApp(app: string): string {
  const datos = JSON.parse(extractFile(join(app, 'resources', 'app.asar'), 'package.json').toString('utf8'))
  return String(datos.version)
}

export interface Instalador {
  version: string
  /** Las rutas del instalador, su `.blockmap` y `latest.yml`. */
  exe: string
  blockmap: string
  latest: string
}

/**
 * Copia la app armada a `trabajo/app`, le escribe de dónde se actualiza y arma su instalador en `trabajo/salida`.
 * `nombre` cambia el nombre interno (la carpeta donde se instala y la de las bajadas): las pruebas usan otro para no
 * chocar con un Iridium instalado. `version` arma con otro número que el de la app (solo pruebas).
 */
export async function armarInstalador(o: {
  app: string
  trabajo: string
  repo: string
  commit: string
  mensaje: string
  nombre?: string
  version?: string
  config?: string[]
}): Promise<Instalador> {
  const copia = join(o.trabajo, 'app')
  const salida = join(o.trabajo, 'salida')
  await cp(o.app, copia, { recursive: true })
  await writeFile(join(copia, 'resources', 'app-update.yml'), appUpdateYml(o.repo, o.nombre))
  const version = o.version ?? versionDeApp(copia)
  const cli = join(import.meta.dirname, '..', 'node_modules', 'electron-builder', 'cli.js')
  execFileSync(
    process.execPath,
    [
      cli,
      '--win',
      'nsis',
      '--x64',
      '--prepackaged',
      copia,
      '--config',
      'electron-builder.yml',
      '--publish',
      'never',
      `-c.directories.output=${salida}`,
      `-c.extraMetadata.version=${version}`,
      ...(o.nombre ? [`-c.extraMetadata.name=${o.nombre}`] : []),
      ...(o.config ?? []),
    ],
    { cwd: join(import.meta.dirname, '..'), stdio: ['ignore', 'pipe', 'inherit'] },
  )
  const exe = join(salida, `Iridium-Setup-${version}.exe`)
  const latest = join(salida, 'latest.yml')
  await writeFile(latest, completarLatest(await readFile(latest, 'utf8'), o.commit, o.mensaje))
  return { version, exe, blockmap: `${exe}.blockmap`, latest }
}
