// El puente de la extensión de Claude con el navegador (PA-I5, D-189 › 4): el navegador lo abre con el Claude Code que
// trae la app (`claude.exe --chrome-native-host`) y sigue vivo mientras el navegador esté abierto, aunque Iridium se
// cierre. Corre desde la carpeta de la app, así que traba la versión nueva: en una copia instalada, el instalador no
// puede reemplazar ese archivo (T-132). En la app de uso diario lo cierra `tools/cambiar-version.ps1`.
import { execFile } from 'node:child_process'

/** El comando de PowerShell que cierra los puentes que corren desde `carpeta`. */
export function comandoCerrarPuentes(carpeta: string): string {
  const ruta = `${carpeta.replace(/[\\/]+$/, '')}\\`.replace(/'/g, "''")
  return [
    'Get-CimInstance Win32_Process -Filter "Name=\'claude.exe\'"',
    "| Where-Object { $_.CommandLine -match '--chrome-native-host' -and $_.ExecutablePath -and",
    `$_.ExecutablePath.StartsWith('${ruta}', [StringComparison]::OrdinalIgnoreCase) }`,
    '| ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $_.ProcessId }',
  ].join(' ')
}

/**
 * Cierra los puentes del navegador que corren desde `carpeta` y dice cuántos cerró. El navegador lo vuelve a abrir
 * cuando lo necesita, ya desde la versión nueva (la ruta es la misma). Si PowerShell falla, 0: la versión se intenta
 * poner igual.
 */
export function cerrarPuentesDelNavegador(carpeta: string): Promise<number> {
  return new Promise((listo) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', comandoCerrarPuentes(carpeta)],
      { windowsHide: true, timeout: 15_000 },
      (e, salida) => listo(e ? 0 : salida.split(/\r?\n/).filter((l) => l.trim()).length),
    )
  })
}
