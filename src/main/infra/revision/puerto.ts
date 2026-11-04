// Qué programa atiende un puerto de la PC (diseno-tecnico.md › Qué proyecto es, paso 3): Windows lo dice con
// `Get-NetTCPConnection` (IPv4 e IPv6: Vite escucha en `::1`) y su línea de comandos sale de `Win32_Process`.
import { execFile } from 'node:child_process'

const ESPERA_MS = 8000

/** Las líneas de comandos de los procesos que escuchan en el puerto; vacío si no hay o si Windows no responde. */
export function lineasDeComandosDelPuerto(puerto: number): Promise<string[]> {
  if (!Number.isInteger(puerto) || puerto <= 0 || puerto > 65535) return Promise.resolve([])
  const script = [
    `$ids = Get-NetTCPConnection -LocalPort ${puerto} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`,
    'foreach ($id in $ids) { (Get-CimInstance Win32_Process -Filter "ProcessId=$id").CommandLine }',
  ].join('; ')
  return new Promise((listo) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { timeout: ESPERA_MS, windowsHide: true },
      (error, salida) => {
        if (error) return listo([])
        listo(
          String(salida)
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean),
        )
      },
    )
  })
}
