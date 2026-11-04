# Pone la versión nueva lista (CO-I2, modulos/compartir/diseno-tecnico.md › Versión nueva lista): espera a que nada
# corra desde la app de uso diario, cambia `win-unpacked` por `nueva\win-unpacked` y, con -Abrir, la abre. Lo lanza
# Iridium al cerrarse (desde una copia en la carpeta temporal: la suya se va con la versión vieja) y
# `tools/actualizar.ps1` cuando Iridium está cerrado. Deja lo que hizo en `release\actualizacion.log`.
param(
  [Parameter(Mandatory = $true)][string]$Release,
  [switch]$Abrir
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

# No entró: además del registro, `nueva\no-entro.json`, que Iridium muestra al abrir (Defecto 3). Se va con la carpeta
# `nueva` cuando por fin entra o cuando se arma otra.
function NoEntro([string]$texto) {
  Anotar $texto
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

function ProcesosDeLaApp([string]$carpeta = $app) {
  @(Get-CimInstance Win32_Process | Where-Object { DeLaCarpeta $_ $carpeta })
}

# Los procesos internos de Electron (`--type=…`) que quedaron sin su Iridium: sin él no hacen nada y traban la carpeta.
function CerrarHuerfanos([string]$carpeta) {
  $todos = ProcesosDeLaApp $carpeta
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
# los demás de a uno y deja la app partida en dos, sin su Iridium.exe (Defecto 3).
function Mover([string]$desde, [string]$hasta) {
  for ($i = 0; $i -lt 20; $i++) {
    try { [IO.Directory]::Move($desde, $hasta); return $true } catch { Start-Sleep -Milliseconds 500 }
  }
  $false
}

function AbrirSiCorresponde {
  if ($Abrir -and (Test-Path -LiteralPath $exe)) {
    Anotar 'Abre Iridium.'
    Start-Process -FilePath $exe -WorkingDirectory $app
  }
}

# Cualquier error que no se esperaba queda anotado y, si había que abrir Iridium, se abre igual: nunca falla en silencio.
trap {
  NoEntro "Falló al poner la versión nueva: $($_.Exception.Message)"
  AbrirSiCorresponde
  exit 1
}

if (-not (Test-Path -LiteralPath $lista) -or -not (Test-Path -LiteralPath (Join-Path $nueva 'win-unpacked\Iridium.exe'))) {
  Anotar 'No hay una versión nueva lista: nada que cambiar.'
  AbrirSiCorresponde
  exit 0
}

# Iridium se está cerrando: termina en un momento. Si en un minuto sigue algo abierto, se deja para el próximo cierre.
$limite = (Get-Date).AddSeconds(60)
while ((ProcesosDeLaApp).Count -gt 0 -and (Get-Date) -lt $limite) {
  CerrarHuerfanos $app
  Start-Sleep -Milliseconds 300
}
if ((ProcesosDeLaApp).Count -gt 0) {
  NoEntro 'Iridium sigue abierto: la versión nueva queda lista para el próximo cierre.'
  exit 1
}

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
AbrirSiCorresponde
# La versión vieja se borra al final: Iridium ya está abriéndose.
QuitarAnteriores
exit 0
