// La ventanita «Actualizando Iridium…» (T-128, D-186, D-187): Iridium la lanza al cerrarse si va a entrar una versión
// nueva, desde una copia en la carpeta temporal (la suya se va con la versión vieja), y se cierra sola. La dibuja
// `tools/ventana-actualizando.ps1`; en la app de uso diario los pasos se los escribe el ayudante en un archivo de estado
// y en una copia instalada los mira ella.
import { spawn } from 'node:child_process'
import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Dónde está la ventanita y cómo se muestra. */
export interface VentanaActualizando {
  /** `ventana-actualizando.ps1`: en la app armada, el de sus recursos. */
  script: string
  /** Fuera de la pantalla y de la barra de tareas (las pruebas, con IRIDIUM_OCULTA). */
  afuera?: boolean
  /** Solo pruebas: lo que va mostrando, renglón por renglón. */
  registro?: string
}

/**
 * Lanza un comando suelto: sigue vivo después de Iridium. Lanzado directo, PowerShell muere con Iridium (Node lo ata a
 * su proceso) y suelto, sin consola, no arranca: `start` lo abre aparte, con su consola escondida.
 */
export async function lanzarSuelto(comando: string, carpeta: string): Promise<void> {
  // Con ELECTRON_RUN_AS_NODE, el Iridium que se vuelve a abrir arrancaría como Node.
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  await new Promise<void>((listo, fallo) => {
    // `/s /c "…"`: cmd quita solo las comillas de afuera y deja el comando tal cual está escrito.
    const p = spawn('cmd.exe', ['/d', '/s', '/c', `"start "" /min ${comando}"`], {
      cwd: carpeta,
      env,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      windowsVerbatimArguments: true,
    })
    p.once('error', fallo)
    p.once('spawn', () => {
      p.unref()
      listo()
    })
  })
}

/** Un script de PowerShell escondido, con sus parámetros, para `lanzarSuelto`. */
export function comandoPowershell(script: string, parametros: (string | false | undefined)[]): string {
  return [
    'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File',
    `"${script}"`,
    ...parametros.filter((p): p is string => !!p),
  ].join(' ')
}

/**
 * Copia la ventanita a la carpeta temporal y la lanza. `carpeta` es la de Iridium.exe: «Abriendo Iridium» termina
 * cuando hay una ventana de Iridium de ahí. Con `estado`, los pasos los escribe el ayudante (empieza en «cerrando»);
 * con `instalada`, los mira ella.
 */
export async function lanzarVentana(
  v: VentanaActualizando,
  o: {
    temporal: string
    carpeta: string
    abrir: boolean
    version?: string | undefined
    estado?: string
    instalada?: { iridium: number; pendiente: string }
  },
): Promise<void> {
  const copia = join(o.temporal, 'iridium-ventana-actualizando.ps1')
  await copyFile(v.script, copia)
  if (o.estado) await writeFile(o.estado, JSON.stringify({ paso: 'cerrando', motivo: '' }))
  await lanzarSuelto(
    comandoPowershell(copia, [
      `-Carpeta "${o.carpeta}"`,
      o.estado && `-Estado "${o.estado}"`,
      o.abrir && '-Abrir',
      o.version && /^[\w.-]+$/.test(o.version) && `-Version ${o.version}`,
      o.instalada && `-Iridium ${o.instalada.iridium} -Pendiente "${o.instalada.pendiente}"`,
      v.afuera && '-Afuera',
      v.registro && `-Registro "${v.registro}"`,
    ]),
    o.temporal,
  )
}

/**
 * La carpeta de electron-updater de una copia instalada (`%LOCALAPPDATA%\<updaterCacheDirName>`, de `app-update.yml`):
 * el instalador de la versión nueva corre desde ahí.
 */
export async function carpetaDelActualizador(appUpdateYml: string, localAppData: string): Promise<string> {
  const texto = await readFile(appUpdateYml, 'utf8').catch(() => '')
  const nombre = /^updaterCacheDirName:\s*(\S+)\s*$/m.exec(texto)?.[1] ?? 'iridium-updater'
  return join(localAppData, nombre)
}
