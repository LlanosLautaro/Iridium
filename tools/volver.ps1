# Vuelve a la versión anterior de la app de uso diario (scripts.md › Volver a la versión anterior, D-078): arma un
# commit anterior en una copia aparte del código (un `git worktree` en `release\volver`) y lo pone como cualquier
# versión nueva (`tools/actualizar.ps1 -Codigo`): con Iridium cerrado, en el acto; abierto, al cerrarlo. `main` vuelve
# a ese commit, así Iridium ofrece Armar los cambios que quedaron afuera. Sin -Commit, la versión que se puso antes que
# la de ahora, según `release\actualizacion.log`. -Release y -SinPreguntar son para probar con otra carpeta.
param(
  [string]$Commit,
  [string]$Release,
  [switch]$SinPreguntar
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz

function Fallo([string]$mensaje) {
  Write-Host ''
  Write-Host $mensaje -ForegroundColor Red
  exit 1
}

if (-not $Commit) {
  # Las versiones que se pusieron, en orden; la de ahora es la última que coincide con `main`.
  $log = Join-Path $raiz 'release\actualizacion.log'
  if (-not (Test-Path -LiteralPath $log)) { Fallo 'No hay registro de versiones anteriores: decí cuál con -Commit.' }
  $puestas = @(Get-Content -LiteralPath $log -Encoding utf8 | ForEach-Object {
      if ($_ -match 'Versión nueva puesta: ([0-9a-f]+) ') { $Matches[1] }
    })
  $actual = "$(& git rev-parse --short main)".Trim()
  $hasta = [Array]::LastIndexOf($puestas, $actual)
  if ($hasta -lt 0) { $hasta = $puestas.Count }
  for ($i = $hasta - 1; $i -ge 0; $i--) {
    if ($puestas[$i] -ne $actual) { $Commit = $puestas[$i]; break }
  }
  if (-not $Commit) { Fallo 'No hay una versión anterior en el registro: decí cuál con -Commit.' }
}
$completo = "$(& git rev-parse --verify --quiet "$Commit^{commit}")".Trim()
if (-not $completo) { Fallo "No existe el commit $Commit." }
$corto = "$(& git rev-parse --short $completo)".Trim()
$mensaje = "$(& git log -1 --format=%s $completo)".Trim()
$fecha = "$(& git log -1 --format=%cd --date=format:%Y-%m-%d $completo)".Trim()

Write-Host "Vuelve a la versión $corto del $fecha" -ForegroundColor Cyan
Write-Host "  $mensaje"
Write-Host 'Lo que vino después sigue en el código: Iridium lo va a ofrecer con «Actualizar».'
if (-not $SinPreguntar) {
  [void](Read-Host 'Enter para seguir; para cancelar, cerrá esta ventana')
}

# En el mismo disco que el depósito de pnpm: así las dependencias se enlazan en vez de copiarse.
$copia = Join-Path $raiz 'release\volver'
function QuitarCopia {
  # Las rutas de `node_modules` pasan el largo que aceptan git y Remove-Item: `rd` con `\\?\` las borra igual.
  if (Test-Path -LiteralPath $copia) { & cmd /c rd /s /q "\\?\$copia" }
  & git worktree prune
}
QuitarCopia
Write-Host ''
Write-Host "Preparando una copia del código en $corto..." -ForegroundColor Cyan
& git worktree add --quiet --detach $copia $completo
if ($LASTEXITCODE -ne 0) { Fallo 'No se pudo preparar la copia del código. Iridium quedó como estaba.' }
Push-Location $copia
& pnpm install --frozen-lockfile --prefer-offline
$instalado = $LASTEXITCODE -eq 0
# pnpm no siempre corre la instalación de Electron en una copia nueva: sin `dist` no se puede armar. La baja de su
# caché, si ya se usó esa versión.
if ($instalado -and -not (Test-Path -LiteralPath 'node_modules\electron\dist\electron.exe')) {
  & node node_modules\electron\install.js
  $instalado = $LASTEXITCODE -eq 0
}
Pop-Location
if (-not $instalado) { QuitarCopia; Fallo 'No se pudieron instalar las dependencias de esa versión. Iridium quedó como estaba.' }

$argumentos = @{ Codigo = $copia }
if ($Release) { $argumentos.Release = $Release }
& (Join-Path $PSScriptRoot 'actualizar.ps1') @argumentos
$resultado = $LASTEXITCODE
Set-Location $raiz
# Lo que quedó afuera es lo que falla: Iridium no lo vuelve a armar solo (T-67) hasta que haya un commit nuevo.
if ($resultado -eq 0) {
  $retenido = [ordered]@{ commit = "$(& git rev-parse --short HEAD)".Trim(); desde = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss') }
  $carpetaRelease = if ($Release) { $Release } else { Join-Path $raiz 'release' }
  [IO.File]::WriteAllText((Join-Path $carpetaRelease 'retenido.json'), ($retenido | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
}
QuitarCopia
exit $resultado
