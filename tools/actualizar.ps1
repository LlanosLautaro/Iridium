# Arma la última versión de la app de uso diario (scripts.md › Armar la última versión, CO-I2). Arma en
# `release\nueva` sin tocar la app y mueve `main` al commit armado (D-070). Con Iridium cerrado, la pone en el acto;
# abierto, la deja lista: Iridium la ve, avisa abajo y la pone al cerrarse o con Reiniciar ahora
# (tools/cambiar-version.ps1). Una versión de Iridium anterior a CO-I2 no sabe hacerlo: a esa se la cierra, como antes.
# -Release y -SinArmar son para probar con otra carpeta (no mueve `main`): -SinArmar usa la `nueva\win-unpacked` que
# ya esté. -Codigo arma otra copia del código (un commit anterior, `tools/volver.ps1`, D-078) y mueve `main` hacia atrás.
param(
  [string]$Release,
  [switch]$SinArmar,
  [string]$Codigo
)
$ErrorActionPreference = 'Stop'
# La salida de git llega en UTF-8: con la página de códigos de la consola, los acentos del mensaje se rompen.
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$raiz = Split-Path -Parent $PSScriptRoot
$prueba = [bool]$Release
if (-not $Release) { $Release = Join-Path $raiz 'release' }
$Release = [IO.Path]::GetFullPath($Release).TrimEnd('\')
$app = Join-Path $Release 'win-unpacked'
$nueva = Join-Path $Release 'nueva'
$lista = Join-Path $nueva 'lista.json'
$cambiar = Join-Path $PSScriptRoot 'cambiar-version.ps1'
# Mientras arma, Iridium lo muestra en vez de ofrecer Armar (CO-I6); si esta ventana se cierra, el proceso ya no está
# y la marca deja de contar.
$armando = Join-Path $Release 'armando.json'
if ($Codigo) { Set-Location $Codigo } else { Set-Location $raiz }

# Todo lo que corre desde la carpeta de la app (Iridium y el Claude Code de sus sesiones) la bloquea.
function ProcesosDeLaApp {
  @(Get-CimInstance Win32_Process | Where-Object {
      $_.ExecutablePath -and $_.ExecutablePath.StartsWith("$app\", [StringComparison]::OrdinalIgnoreCase)
    })
}

function Esperar([int]$segundos) {
  $limite = (Get-Date).AddSeconds($segundos)
  while ((ProcesosDeLaApp).Count -gt 0 -and (Get-Date) -lt $limite) { Start-Sleep -Milliseconds 500 }
  (ProcesosDeLaApp).Count -eq 0
}

function Terminar {
  if (Test-Path -LiteralPath $armando) { Remove-Item -LiteralPath $armando -Force }
}

function Fallo([string]$mensaje) {
  Terminar
  Write-Host ''
  Write-Host $mensaje -ForegroundColor Red
  exit 1
}

[IO.File]::WriteAllText($armando, (@{ pid = $PID } | ConvertTo-Json), [Text.UTF8Encoding]::new($false))

# Lo que se arma se marca recién al final: mientras falte `lista.json`, nadie toma la carpeta a medio armar.
if (Test-Path -LiteralPath $lista) { Remove-Item -LiteralPath $lista -Force }
if (-not $SinArmar) {
  if ($Codigo) {
    Write-Host '1/3  Armando la versión anterior (Iridium sigue abierto mientras tanto)...' -ForegroundColor Cyan
  } else {
    Write-Host '1/3  Armando los últimos cambios (Iridium sigue abierto mientras tanto)...' -ForegroundColor Cyan
  }
  & pnpm build
  if ($LASTEXITCODE -ne 0) { Fallo 'No se pudo armar. Iridium quedó como estaba.' }
  if (Test-Path -LiteralPath $nueva) { Remove-Item -LiteralPath $nueva -Recurse -Force }
  & pnpm exec electron-builder --win --config electron-builder.yml "-c.directories.output=$nueva"
  if ($LASTEXITCODE -ne 0) { Fallo 'No se pudo armar la versión nueva. Iridium quedó como estaba.' }
}
if (-not (Test-Path -LiteralPath (Join-Path $nueva 'win-unpacked\Iridium.exe'))) { Fallo "No está la versión nueva en $nueva." }

$commit = (& git rev-parse --short HEAD).Trim()
$datos = [ordered]@{
  fecha   = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss')
  commit  = $commit
  mensaje = (& git log -1 --format=%s).Trim()
  # Lo armado incluye los cambios sin commitear, si los había.
  sinGuardar = [bool](& git status --porcelain)
}
[IO.File]::WriteAllText($lista, ($datos | ConvertTo-Json), [Text.UTF8Encoding]::new($false))

Write-Host ''
if ($prueba) {
  Write-Host '2/3  Es una prueba con otra carpeta: main queda donde estaba.' -ForegroundColor Cyan
} else {
  Write-Host "2/3  Moviendo main a $commit (lo que está en la app de uso diario)..." -ForegroundColor Cyan
  $rama = "$(& git branch --show-current)".Trim()
  if ($rama -ne 'main') { & git branch -f main HEAD }
  # Volver atrás mueve `main` a un commit anterior: GitHub lo acepta solo forzado (los commits siguen en `dev`).
  if ($Codigo) { & git push --force origin HEAD:refs/heads/main } else { & git push origin HEAD:refs/heads/main }
  if ($LASTEXITCODE -ne 0) { Write-Host 'No se pudo subir main a GitHub (¿sin internet?): se sube la próxima vez.' -ForegroundColor Yellow }
}

Write-Host ''
$abierto = (ProcesosDeLaApp).Count -gt 0
if ($abierto -and (Test-Path -LiteralPath (Join-Path $app 'resources\cambiar-version.ps1'))) {
  Write-Host '3/3  Listo: la versión nueva entra cuando cierres Iridium, o con «Reiniciar ahora» abajo en Iridium.' -ForegroundColor Green
  Write-Host 'Podés cerrar esta ventana.' -ForegroundColor Green
  Terminar
  exit 0
}

Terminar
$reabrir = $false
if ($abierto) {
  # La versión abierta es anterior a CO-I2: no sabe poner la nueva al cerrarse. Se la cierra como antes.
  Write-Host '3/3  Cerrando Iridium para poner la versión nueva...' -ForegroundColor Cyan
  foreach ($p in ProcesosDeLaApp) {
    $proceso = Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue
    if ($proceso -and $proceso.MainWindowHandle -ne 0) { [void]$proceso.CloseMainWindow() }
  }
  if (-not (Esperar 30)) {
    Write-Host 'Iridium no terminó de cerrarse: si hay una sesión trabajando, pregunta antes (F-6).' -ForegroundColor Yellow
    Write-Host 'Elegí «Cerrar igual» en Iridium y esto sigue solo.' -ForegroundColor Yellow
    if (-not (Esperar 120)) {
      [void](Read-Host 'Enter lo cierra a la fuerza; para cancelar, cerrá esta ventana')
    }
    ProcesosDeLaApp | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    if (-not (Esperar 10)) { Fallo 'No se pudo cerrar Iridium. Cerralo a mano: la versión nueva entra la próxima vez que ejecutes esto.' }
  }
  $reabrir = $true
} else {
  Write-Host '3/3  Iridium está cerrado: poniendo la versión nueva...' -ForegroundColor Cyan
}
if ($reabrir) { & $cambiar -Release $Release -Abrir } else { & $cambiar -Release $Release }
if ($LASTEXITCODE -ne 0) { Fallo 'No se pudo poner la versión nueva (detalle en release\actualizacion.log).' }
Write-Host ''
if ($reabrir) {
  Write-Host 'Listo: Iridium está al día y se volvió a abrir. Podés cerrar esta ventana.' -ForegroundColor Green
} else {
  Write-Host 'Listo: Iridium está al día. Podés cerrar esta ventana.' -ForegroundColor Green
}
