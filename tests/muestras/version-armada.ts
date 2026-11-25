// Una versión armada de muestra para las pruebas del ayudante que la pone (`tools/cambiar-version.ps1`): desde T-137 no
// pone una a la que le faltan los archivos de Electron, así que cada muestra los lleva vacíos.
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

/** Los que mira `cambiar-version.ps1` antes de poner una versión (T-137). */
export const ARCHIVOS_ELECTRON = [
  'Iridium.exe',
  'icudtl.dat',
  'resources.pak',
  'v8_context_snapshot.bin',
  'ffmpeg.dll',
  join('resources', 'app.asar'),
]

/** Una versión en `carpeta` con los archivos de Electron (vacíos) y `archivo`, que dice cuál es. */
export async function armarVersion(carpeta: string, archivo?: string): Promise<void> {
  for (const f of ARCHIVOS_ELECTRON) {
    await mkdir(dirname(join(carpeta, f)), { recursive: true })
    await writeFile(join(carpeta, f), '')
  }
  if (archivo) await writeFile(join(carpeta, archivo), archivo)
}

/** Lo que hay en la carpeta sin los archivos de Electron (salvo Iridium.exe), ordenado. */
export async function propios(carpeta: string): Promise<string[]> {
  const electron = new Set([
    'icudtl.dat',
    'resources.pak',
    'v8_context_snapshot.bin',
    'ffmpeg.dll',
    'resources',
  ])
  return (await readdir(carpeta)).filter((n) => !electron.has(n)).sort()
}
