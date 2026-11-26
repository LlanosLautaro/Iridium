# Arma la última versión de la app de uso diario (scripts.md › Armar la última versión, CO-I2). Arma en
# `release\nueva` sin tocar la app y mueve `main` al commit armado (D-070). Con Iridium cerrado, la pone en el acto;
# abierto, la deja lista: Iridium la ve y la pone al cerrarse o con Actualizar (tools/cambiar-version.ps1, R-12). Una versión de Iridium anterior a CO-I2 no sabe hacerlo: a esa se la cierra, como antes.
# Desde D-198 (Q-304 A) la app de uso diario está instalada como en la otra PC: cada armado deja también su instalador
# en `release\instalador`. Con el Iridium instalado cerrado, lo instala en el acto; abierto, Iridium lo baja de ahí y
# entra al cerrarlo o con Actualizar. `win-unpacked` sigue al día (de ahí se publica) y, abierta, pasa a la instalada.
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

# Todo lo que corre desde la carpeta de la app (Iridium y el Claude Code de sus sesiones) la bloquea. El puente del
# navegador (PA-I5) no cuenta como Iridium abierto: sigue vivo con el navegador y `cambiar-version.ps1` lo cierra.
function ProcesosDeLaApp {
  @(Get-CimInstance Win32_Process | Where-Object {
      $_.ExecutablePath -and $_.ExecutablePath.StartsWith("$app\", [StringComparison]::OrdinalIgnoreCase) -and
      $_.CommandLine -notmatch '--chrome-native-host'
    })
}

function Esperar([int]$segundos) {
  $limite = (Get-Date).AddSeconds($segundos)
  while (@(ProcesosDeLaApp).Count -gt 0 -and (Get-Date) -lt $limite) { Start-Sleep -Milliseconds 500 }
  @(ProcesosDeLaApp).Count -eq 0
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

# Un solo armado a la vez por carpeta `release` (T-133): el 2026-11-24 dos armaron juntos en `nueva`, uno borró lo
# que el otro copiaba y quedó puesta una app sin los archivos de Electron, que no abría. El segundo espera al primero
# y después arma (así lleva también lo último). El nombre sale de la ruta: los nombres de Windows no aceptan «\».
$sha = [Security.Cryptography.SHA256]::Create()
$huella = [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Release.ToLowerInvariant()))).Replace('-', '').Substring(0, 16)
$turno = New-Object Threading.Mutex($false, "Local\IridiumArmar-$huella")
try {
  if (-not $turno.WaitOne(0)) {
    Write-Host 'Ya se está armando otra versión: esta espera a que termine...' -ForegroundColor Yellow
    if (-not $turno.WaitOne([TimeSpan]::FromMinutes(15))) {
      Write-Host 'El otro armado no terminó en 15 minutos: este no hace nada.' -ForegroundColor Red
      exit 1
    }
  }
} catch [Threading.AbandonedMutexException] {
  # El anterior se cortó sin soltar el turno: el turno queda de este.
}

# Lo que tiene que estar en una app armada para que abra: sin alguno, Electron no arranca (T-133).
function AppCompleta([string]$carpeta) {
  foreach ($f in @('Iridium.exe', 'icudtl.dat', 'resources.pak', 'v8_context_snapshot.bin', 'ffmpeg.dll', 'resources\app.asar')) {
    if (-not (Test-Path -LiteralPath (Join-Path $carpeta $f))) { return $false }
  }
  $true
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
  # El número de la versión, 1.0.x (Q-269, D-182): el que compara electron-updater en las copias instaladas.
  $version = "$(& node --experimental-strip-types (Join-Path $PSScriptRoot 'version.ts'))".Trim()
  if ($version -notmatch '^\d+\.\d+\.\d+$') { Fallo "No se pudo calcular el número de la versión ($version)." }
  if ((Correr { pnpm exec electron-builder --win --config electron-builder.yml "-c.directories.output=$nueva" "-c.extraMetadata.version=$version" }) -ne 0) { Fallo 'No se pudo armar la versión nueva. Iridium quedó como estaba.' }
}
if (-not (Test-Path -LiteralPath (Join-Path $nueva 'win-unpacked\Iridium.exe'))) { Fallo "No está la versión nueva en $nueva." }
if (-not (AppCompleta (Join-Path $nueva 'win-unpacked'))) { Fallo 'La versión nueva quedó incompleta (le faltan archivos de Electron). Iridium quedó como estaba.' }
# El instalador de la versión, para el Iridium instalado de esta PC (D-198). Las pruebas con otra carpeta no lo arman.
$instalador = Join-Path $Release 'instalador'
if (-not $SinArmar -and -not $prueba) {
  Decir 'Armando el instalador...' 'Cyan'
  if ((Correr { node --experimental-strip-types (Join-Path $PSScriptRoot 'instalador-local.ts') --app (Join-Path $nueva 'win-unpacked') --salida $instalador }) -ne 0) { Fallo 'No se pudo armar el instalador. Iridium quedó como estaba.' }
}

$commit = (& git rev-parse --short HEAD).Trim()
$datos = [ordered]@{
  fecha   = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss')
  commit  = $commit
  mensaje = (& git log -1 --format=%s).Trim()
  # Lo armado incluye los cambios sin commitear, si los había; los de `docs/` no van en la app (D-191).
  sinGuardar = [bool](& git status --porcelain -- . ':(exclude)docs')
}
# El número, para la ventanita «Actualizando Iridium…» (T-128); con -SinArmar no se calculó.
if ($version) { $datos.version = $version }
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
if (-not $prueba) {
  # Dónde está el código: el Iridium instalado de esta PC baja de acá sus versiones (D-198).
  $datosIridium = Join-Path $env:APPDATA 'Centro de Desarrollo'
  New-Item -ItemType Directory -Force -Path $datosIridium | Out-Null
  [IO.File]::WriteAllText((Join-Path $datosIridium 'codigo.json'), (@{ carpeta = $raiz } | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
  $instalada = Join-Path $env:LOCALAPPDATA 'Programs\iridium'
  $deAntes = @(ProcesosDeLaApp).Count -gt 0
  # Con la app de antes abierta (la de `win-unpacked`), la versión queda lista ahí: entra al cerrarla y, al abrirse,
  # pasa a la instalada. Si no, `win-unpacked` se pone al día ya.
  if (-not $deAntes) {
    & $cambiar -Release $Release
    if ($LASTEXITCODE -ne 0) { Decir 'No se pudo poner al día release\win-unpacked (detalle en releasectualizacion.log); sigue igual.' 'Yellow' }
  }
  $abierta = @(Get-CimInstance Win32_Process | Where-Object {
      $_.ExecutablePath -and $_.ExecutablePath.StartsWith("$instalada\", [StringComparison]::OrdinalIgnoreCase) -and
      $_.CommandLine -notmatch '--chrome-native-host'
    }).Count -gt 0
  if ($abierta) {
    Decir '3/3  Listo: la versión nueva entra cuando cierres Iridium, o con «Actualizar» abajo en Iridium.' 'Green'
  } else {
    if ($deAntes) { Decir '3/3  Instalando Iridium...' 'Cyan' } else { Decir '3/3  Iridium está cerrado: instalando la versión nueva...' 'Cyan' }
    $setup = Get-ChildItem -LiteralPath $instalador -Filter 'Iridium-Setup-*.exe' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $setup) { Fallo "No está el instalador en $instalador." }
    $proceso = Start-Process -FilePath $setup.FullName -ArgumentList '/S' -Wait -PassThru
    if ($proceso.ExitCode -ne 0 -or -not (Test-Path -LiteralPath (Join-Path $instalada 'Iridium.exe'))) {
      Fallo "No se pudo instalar la versión nueva (el instalador terminó con $($proceso.ExitCode))."
    }
    if ($deAntes) {
      Decir 'Listo: Iridium quedó instalado. Al cerrar el de ahora, se abre el instalado.' 'Green'
    } else {
      Decir 'Listo: Iridium está al día.' 'Green'
    }
  }
  Decir 'Podés cerrar esta ventana.' 'Green'
  Terminar
  exit 0
}
$abierto = @(ProcesosDeLaApp).Count -gt 0
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
