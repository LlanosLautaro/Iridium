# Arma la última versión de la app de uso diario (scripts.md › Armar la última versión, CO-I2). Arma en
# `release\nueva` sin tocar la app y mueve `main` al commit armado (D-070). Con Iridium cerrado, la pone en el acto;
# abierto, la deja lista: Iridium la ve y la pone al cerrarse o con Actualizar (tools/cambiar-version.ps1, R-12). Una versión de Iridium anterior a CO-I2 no sabe hacerlo: a esa se la cierra, como antes.
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
# Mientras arma, Iridium muestra «Actualizando…» (CO-I6, R-12); si este proceso se corta, la marca queda sin él e
# Iridium lo toma como un armado que no terminó. Si no puede, deja el motivo en `armado-fallo.json`.
$armando = Join-Path $Release 'armando.json'
$falloArmado = Join-Path $Release 'armado-fallo.json'
# Desde Iridium corre con la consola escondida: lo que pasa queda en `armado.log` (Ver la consola).
$log = Join-Path $Release 'armado.log'
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

function Anotar([string]$texto) {
  [IO.File]::AppendAllText($log, "$texto`r`n", [Text.UTF8Encoding]::new($false))
}

function Decir([string]$texto, [string]$color = 'Gray') {
  Write-Host $texto -ForegroundColor $color
  Anotar $texto
}

# Corre un programa mostrando y anotando lo que escribe; devuelve su código de salida. Su stderr va al log también:
# con 'Stop', PowerShell 5.1 cortaría en la primera línea de stderr redirigida.
function Correr([scriptblock]$bloque) {
  $antes = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & $bloque 2>&1 | ForEach-Object { $t = "$_"; Write-Host $t; Anotar $t }
  $codigo = $LASTEXITCODE
  $ErrorActionPreference = $antes
  $codigo
}

function Terminar {
  if (Test-Path -LiteralPath $armando) { Remove-Item -LiteralPath $armando -Force }
}

function Fallo([string]$mensaje) {
  $motivo = [ordered]@{ fecha = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss'); motivo = $mensaje }
  [IO.File]::WriteAllText($falloArmado, ($motivo | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
  Terminar
  Decir ''
  Decir $mensaje 'Red'
  exit 1
}

if (Test-Path -LiteralPath $falloArmado) { Remove-Item -LiteralPath $falloArmado -Force }
$marca = [ordered]@{ pid = $PID; desde = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss') }
[IO.File]::WriteAllText($armando, ($marca | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText($log, "Armado del $($marca.desde)`r`n", [Text.UTF8Encoding]::new($false))

# Lo que se arma se marca recién al final: mientras falte `lista.json`, nadie toma la carpeta a medio armar.
if (Test-Path -LiteralPath $lista) { Remove-Item -LiteralPath $lista -Force }
if (-not $SinArmar) {
  if ($Codigo) {
    Decir '1/3  Armando la versión anterior (Iridium sigue abierto mientras tanto)...' 'Cyan'
  } else {
    Decir '1/3  Armando los últimos cambios (Iridium sigue abierto mientras tanto)...' 'Cyan'
  }
  if ((Correr { pnpm build }) -ne 0) { Fallo 'No se pudo armar. Iridium quedó como estaba.' }
  if (Test-Path -LiteralPath $nueva) { Remove-Item -LiteralPath $nueva -Recurse -Force }
  if ((Correr { pnpm exec electron-builder --win --config electron-builder.yml "-c.directories.output=$nueva" }) -ne 0) { Fallo 'No se pudo armar la versión nueva. Iridium quedó como estaba.' }
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

Decir ''
if ($prueba) {
  Decir '2/3  Es una prueba con otra carpeta: main queda donde estaba.' 'Cyan'
} else {
  Decir "2/3  Moviendo main a $commit (lo que está en la app de uso diario)..." 'Cyan'
  $rama = "$(& git branch --show-current)".Trim()
  if ($rama -ne 'main') { & git branch -f main HEAD }
  # Volver atrás mueve `main` a un commit anterior: GitHub lo acepta solo forzado (los commits siguen en `dev`).
  $subido = if ($Codigo) { Correr { git push --force origin HEAD:refs/heads/main } } else { Correr { git push origin HEAD:refs/heads/main } }
  if ($subido -ne 0) { Decir 'No se pudo subir main a GitHub (¿sin internet?): se sube la próxima vez.' 'Yellow' }
}

Decir ''
$abierto = (ProcesosDeLaApp).Count -gt 0
if ($abierto -and (Test-Path -LiteralPath (Join-Path $app 'resources\cambiar-version.ps1'))) {
  Decir '3/3  Listo: la versión nueva entra cuando cierres Iridium, o con «Actualizar» abajo en Iridium.' 'Green'
  Decir 'Podés cerrar esta ventana.' 'Green'
  Terminar
  exit 0
}

Terminar
$reabrir = $false
if ($abierto) {
  # La versión abierta es anterior a CO-I2: no sabe poner la nueva al cerrarse. Se la cierra como antes.
  Decir '3/3  Cerrando Iridium para poner la versión nueva...' 'Cyan'
  foreach ($p in ProcesosDeLaApp) {
    $proceso = Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue
    if ($proceso -and $proceso.MainWindowHandle -ne 0) { [void]$proceso.CloseMainWindow() }
  }
  if (-not (Esperar 30)) {
    Decir 'Iridium no terminó de cerrarse: si hay una sesión trabajando, pregunta antes (F-6).' 'Yellow'
    Decir 'Elegí «Cerrar igual» en Iridium y esto sigue solo.' 'Yellow'
    if (-not (Esperar 120)) {
      [void](Read-Host 'Enter lo cierra a la fuerza; para cancelar, cerrá esta ventana')
    }
    ProcesosDeLaApp | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    if (-not (Esperar 10)) { Fallo 'No se pudo cerrar Iridium. Cerralo a mano: la versión nueva entra la próxima vez que ejecutes esto.' }
  }
  $reabrir = $true
} else {
  Decir '3/3  Iridium está cerrado: poniendo la versión nueva...' 'Cyan'
}
if ($reabrir) { & $cambiar -Release $Release -Abrir } else { & $cambiar -Release $Release }
if ($LASTEXITCODE -ne 0) { Fallo 'No se pudo poner la versión nueva (detalle en release\actualizacion.log).' }
Decir ''
if ($reabrir) {
  Decir 'Listo: Iridium está al día y se volvió a abrir. Podés cerrar esta ventana.' 'Green'
} else {
  Decir 'Listo: Iridium está al día. Podés cerrar esta ventana.' 'Green'
}
