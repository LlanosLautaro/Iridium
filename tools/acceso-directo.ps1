# Crea (o actualiza) el acceso directo "Iridium" en el escritorio, apuntando a la app armada con pnpm dist.
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$exe = Join-Path $raiz 'release\win-unpacked\Iridium.exe'
if (-not (Test-Path $exe)) { throw "No encontré $exe. Corré primero: pnpm dist" }
$escritorio = [Environment]::GetFolderPath('Desktop')
$lnk = Join-Path $escritorio 'Iridium.lnk'
$shell = New-Object -ComObject WScript.Shell
$acceso = $shell.CreateShortcut($lnk)
$acceso.TargetPath = $exe
$acceso.WorkingDirectory = Split-Path -Parent $exe
$acceso.IconLocation = "$exe,0"
$acceso.Description = 'Iridium: tus proyectos y la IA en un solo lugar'
$acceso.Save()
Write-Output "Acceso directo listo: $lnk"
