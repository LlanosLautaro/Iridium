# Pone la versión nueva lista (CO-I2, modulos/compartir/diseno-tecnico.md › Versión nueva lista): espera a que nada
# corra desde la app de uso diario, cambia `win-unpacked` por `nueva\win-unpacked` y, con -Abrir, la abre. Lo lanza
# Iridium al cerrarse (desde una copia en la carpeta temporal: la suya se va con la versión vieja) y
# `tools/actualizar.ps1` cuando Iridium está cerrado. Deja lo que hizo en `release\actualizacion.log`. Con -Estado
# escribe ahí cada paso para la ventanita «Actualizando Iridium…» (T-128, `tools/ventana-actualizando.ps1`).
param(
  [Parameter(Mandatory = $true)][string]$Release,
  [switch]$Abrir,
  [string]$Estado
)
$ErrorActionPreference = 'Stop'
$Release = [IO.Path]::GetFullPath($Release).TrimEnd('\')
$app = Join-Path $Release 'win-unpacked'
$nueva = Join-Path $Release 'nueva'
$lista = Join-Path $nueva 'lista.json'
# La versión vieja va cada vez a una carpeta con otro nombre: una anterior trabada no frena el cambio.
$anterior = Join-Path $Release "anterior-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$exe = Join-Path $app 'Iridium.exe'
$log = Join-Path $Release 'actualizacion.log'

function Anotar([string]$texto) {
  $linea = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $texto"
  Write-Host $linea
  Add-Content -LiteralPath $log -Value $linea -Encoding utf8
}

# El paso en curso para la ventanita: cerrando (lo que dice al abrirse), poniendo, abriendo, abierta, lista, fallo o
# nada (se cierra sin decir nada). Si no se puede escribir, la versión se pone igual.
$script:fallo = ''
function Paso([string]$paso, [string]$motivo = '') {
  if (-not $Estado) { return }
  $datos = @{ paso = $paso; motivo = $motivo } | ConvertTo-Json -Compress
  try { [IO.File]::WriteAllText($Estado, $datos, (New-Object Text.UTF8Encoding $false)) } catch { }
}

# No entró: además del registro, `nueva\no-entro.json`, que Iridium muestra al abrir (Defecto 3). Se va con la carpeta
# `nueva` cuando por fin entra o cuando se arma otra.
function NoEntro([string]$texto) {
  Anotar $texto
  $script:fallo = $texto
  Paso 'fallo' $texto
  if (-not (Test-Path -LiteralPath $nueva)) { return }
  $datos = @{ fecha = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'); motivo = $texto } | ConvertTo-Json -Compress
  [IO.File]::WriteAllText((Join-Path $nueva 'no-entro.json'), $datos, (New-Object Text.UTF8Encoding $false))
}

# Algunos procesos de Electron no dejan leer su ruta (ExecutablePath vacío): también cuenta la línea de comando.
function DeLaCarpeta($proceso, [string]$carpeta) {
  $ruta = $proceso.ExecutablePath
  if (-not $ruta -and $proceso.CommandLine) { $ruta = $proceso.CommandLine.TrimStart('"') }
  $ruta -and $ruta.StartsWith("$carpeta\", [StringComparison]::OrdinalIgnoreCase)
}

# Se cuenta siempre como `@(ProcesosDeLaApp).Count`: con un solo proceso, PowerShell devuelve el proceso suelto y su
# `.Count` sale vacío. Así, con Iridium terminando de cerrarse (queda solo él), el ayudante no lo esperaba y Windows no
# soltaba la carpeta (T-132).
function ProcesosDeLaApp([string]$carpeta = $app) {
  @(Get-CimInstance Win32_Process | Where-Object { DeLaCarpeta $_ $carpeta })
}

# El puente de la extensión de Claude con el navegador (PA-I5): lo abre el navegador con el Claude Code de la app y
# sigue vivo mientras el navegador esté abierto, aunque Iridium se cierre. Se cierra: el navegador lo vuelve a abrir
# cuando lo necesita, ya desde la versión nueva (la ruta es la misma).
function CerrarAnfitriones([string]$carpeta) {
  foreach ($p in @(ProcesosDeLaApp $carpeta | Where-Object { $_.CommandLine -match '--chrome-native-host' })) {
    Anotar "Cierra el puente del navegador ($($p.ProcessId))."
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

# Los procesos internos de Electron (`--type=…`) que quedaron sin su Iridium: sin él no hacen nada y traban la carpeta.
function CerrarHuerfanos([string]$carpeta) {
  CerrarAnfitriones $carpeta
  $todos = @(ProcesosDeLaApp $carpeta)
  if (@($todos | Where-Object { $_.CommandLine -notmatch '--type=' }).Count -gt 0) { return }
  foreach ($p in $todos) {
    Anotar "Cierra un proceso suelto de una versión anterior ($($p.ProcessId))."
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
  if ($todos.Count -gt 0) { Start-Sleep -Milliseconds 500 }
}

# Borra las versiones viejas (`anterior` y `anterior-…`) que se puedan; la que siga trabada queda para la próxima.
function QuitarAnteriores {
  Get-ChildItem -LiteralPath $Release -Directory | Where-Object { $_.Name -like 'anterior*' } | ForEach-Object {
    CerrarHuerfanos $_.FullName
    Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath $_.FullName) { Anotar "$($_.Name) sigue trabada: se borra la próxima vez." }
  }
}

# Mover una carpeta falla mientras Windows no suelta los archivos de un proceso que recién terminó: se reintenta.
# Con `Directory.Move`, que la cambia de nombre entera o no la toca: `Move-Item`, si un archivo está trabado, mueve
# los demás de a uno y deja la app partida en dos, sin su Iridium.exe (Defecto 3). Hasta 20 s: la publicación sola
# (T-132) copia la app y la tiene unos segundos.
function Mover([string]$desde, [string]$hasta) {
  for ($i = 0; $i -lt 40; $i++) {
    try { [IO.Directory]::Move($desde, $hasta); return $true } catch { Start-Sleep -Milliseconds 500 }
  }
  $false
}

# Con una Iridium ya abierta desde la app no se abre otra (T-127): dos arrancando juntas se saltean la ventana única
# de Electron y queda una segunda, sin conversaciones, que traba el próximo cambio de versión.
function AbrirSiCorresponde {
  if (-not $Abrir -or -not (Test-Path -LiteralPath $exe)) { return }
  if (@(ProcesosDeLaApp | Where-Object { $_.CommandLine -notmatch '--type=' }).Count -gt 0) {
    Anotar 'Iridium ya está abierto: no se abre otro.'
    if (-not $script:fallo) { Paso 'abierta' }
    return
  }
  Anotar 'Abre Iridium.'
  if ($script:fallo) { Paso 'fallo' "$($script:fallo) Se abre la de antes." } else { Paso 'abriendo' }
  Start-Process -FilePath $exe -WorkingDirectory $app
}

# Un solo ayudante a la vez por carpeta `release` (T-127): dos juntos se pisaban (uno ponía la versión y abría Iridium,
# el otro no podía mover la carpeta y abría otro). El segundo espera a que el primero termine y sigue: ya sin versión
# lista, no cambia nada. El nombre sale de la ruta: los nombres de Windows no aceptan «\».
$sha = [Security.Cryptography.SHA256]::Create()
$huella = [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Release.ToLowerInvariant()))).Replace('-', '').Substring(0, 16)
$turno = New-Object Threading.Mutex($false, "Local\IridiumCambiarVersion-$huella")
try {
  if (-not $turno.WaitOne([TimeSpan]::FromMinutes(3))) {
    Anotar 'Otro cambio de versión sigue en curso: este no hace nada.'
    Paso 'nada'
    exit 1
  }
} catch [Threading.AbandonedMutexException] {
  # El anterior se cortó sin soltar el turno: el turno queda de este.
}

# Cualquier error que no se esperaba queda anotado y, si había que abrir Iridium, se abre igual: nunca falla en silencio.
trap {
  NoEntro "Falló al poner la versión nueva: $($_.Exception.Message)"
  AbrirSiCorresponde
  exit 1
}

if (-not (Test-Path -LiteralPath $lista) -or -not (Test-Path -LiteralPath (Join-Path $nueva 'win-unpacked\Iridium.exe'))) {
  Anotar 'No hay una versión nueva lista: nada que cambiar.'
  if ($Abrir) { AbrirSiCorresponde } else { Paso 'nada' }
  exit 0
}

# Una versión a la que le faltan los archivos de Electron no abre (T-133): no se pone, sigue la de antes.
foreach ($f in @('Iridium.exe', 'icudtl.dat', 'resources.pak', 'v8_context_snapshot.bin', 'ffmpeg.dll', 'resources\app.asar')) {
  if (-not (Test-Path -LiteralPath (Join-Path $nueva "win-unpacked\$f"))) {
    NoEntro "La versión nueva está incompleta (falta $f): sigue la de antes; se arma de nuevo."
    Remove-Item -LiteralPath $lista -Force -ErrorAction SilentlyContinue
    AbrirSiCorresponde
    exit 1
  }
}

# Iridium se está cerrando: termina en un momento. Si en un minuto sigue algo abierto, se deja para el próximo cierre.
$limite = (Get-Date).AddSeconds(60)
while (@(ProcesosDeLaApp).Count -gt 0 -and (Get-Date) -lt $limite) {
  CerrarHuerfanos $app
  Start-Sleep -Milliseconds 300
}
if (@(ProcesosDeLaApp).Count -gt 0) {
  NoEntro 'Iridium sigue abierto (¿otra ventana de Iridium?): la versión nueva queda lista para cuando lo cierres del todo.'
  exit 1
}

Paso 'poniendo'
QuitarAnteriores
if ((Test-Path -LiteralPath $app) -and -not (Mover $app $anterior)) {
  NoEntro 'Windows no soltó la carpeta de la app: la versión nueva queda lista para el próximo cierre.'
  AbrirSiCorresponde
  exit 1
}
if (-not (Mover (Join-Path $nueva 'win-unpacked') $app)) {
  if (Test-Path -LiteralPath $anterior) { [void](Mover $anterior $app) }
  NoEntro 'No se pudo poner la versión nueva: sigue la de antes y la nueva queda lista para el próximo cierre.'
  AbrirSiCorresponde
  exit 1
}
$datos = Get-Content -LiteralPath $lista -Raw -Encoding utf8 | ConvertFrom-Json
Remove-Item -LiteralPath $nueva -Recurse -Force
Anotar "Versión nueva puesta: $($datos.commit) del $($datos.fecha)."
if ($Abrir) { AbrirSiCorresponde } else { Paso 'lista' }
# La versión vieja se borra al final: Iridium ya está abriéndose.
QuitarAnteriores
exit 0
