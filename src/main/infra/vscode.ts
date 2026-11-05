// Abrir un proyecto en VS Code (C-12, R-7). Se lanza `Code.exe` directo, sin consola ni `cmd`: la carpeta va como
// argumento y no se interpreta. Se busca donde lo deja `code` en el PATH y en los dos lugares donde se instala.
import { execFile, spawn } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'

/**
 * Dónde puede estar `Code.exe`, en orden: al lado de cada `bin\code.cmd` que encuentra `where code`, en la instalación
 * del usuario y en la de todos.
 */
export function candidatosVsCode(enPath: readonly string[], env: NodeJS.ProcessEnv): string[] {
  const deCmd = enPath
    .map((l) => l.trim())
    .filter((l) => /[\\/]bin[\\/]code\.cmd$/i.test(l))
    .map((l) => join(dirname(dirname(l)), 'Code.exe'))
  const fijos = [
    env.LOCALAPPDATA && join(env.LOCALAPPDATA, 'Programs', 'Microsoft VS Code', 'Code.exe'),
    env.ProgramFiles && join(env.ProgramFiles, 'Microsoft VS Code', 'Code.exe'),
  ].filter((r): r is string => Boolean(r))
  return [...new Set([...deCmd, ...fijos])]
}

function dondeEsta(): Promise<string[]> {
  return new Promise((listo) => {
    execFile('where.exe', ['code'], { windowsHide: true, timeout: 5000 }, (error, salida) =>
      listo(error ? [] : salida.split(/\r?\n/).filter(Boolean)),
    )
  })
}

async function existe(ruta: string): Promise<boolean> {
  return (await stat(ruta).catch(() => null))?.isFile() ?? false
}

export async function abrirEnVsCode(
  carpeta: string,
): Promise<{ tipo: 'ok' } | { tipo: 'error'; mensaje: string }> {
  let exe: string | null = null
  for (const c of candidatosVsCode(await dondeEsta(), process.env))
    if (await existe(c)) {
      exe = c
      break
    }
  if (!exe) return { tipo: 'error', mensaje: 'No encontré VS Code en esta PC.' }
  // VS Code es otra app de Electron: no tiene que heredar lo de Iridium.
  const env = { ...process.env }
  for (const k of Object.keys(env)) if (k.startsWith('ELECTRON_') || k === 'NODE_OPTIONS') delete env[k]
  try {
    await new Promise<void>((listo, fallo) => {
      const p = spawn(exe, [carpeta], { detached: true, stdio: 'ignore', env })
      p.once('error', fallo)
      p.once('spawn', () => {
        p.unref()
        listo()
      })
    })
    return { tipo: 'ok' }
  } catch (e) {
    return {
      tipo: 'error',
      mensaje: `No se pudo abrir VS Code: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
}
