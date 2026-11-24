# La ventanita «Actualizando Iridium…» (T-128, D-186, D-187): mientras se cambia la versión, Iridium está cerrado y
# esto es lo único que se ve. La lanza Iridium al cerrarse, desde una copia en la carpeta temporal, y se cierra sola.
# Tres pasos (Cerrando la versión de antes · Poniendo la versión nueva · Abriendo Iridium); sin -Abrir termina con
# «Lista: se abre la próxima vez» (Q-280); si la versión no entra, lo dice unos segundos.
#  - App de uso diario: los pasos los escribe `cambiar-version.ps1` en -Estado ({"paso":…,"motivo":…}).
#  - Copia instalada (-Iridium): los pasos salen de mirar el proceso de Iridium que se cierra y el instalador que corre
#    desde -Pendiente (la carpeta de electron-updater); la versión entró si Iridium.exe cambió.
# En los dos casos, «Abriendo Iridium» termina cuando hay una ventana de Iridium a la vista desde -Carpeta. Ninguno
# dice cuánto falta: la barra se acerca al tope de cada paso sin llegar y salta al terminarlo (S-7).
param(
  [Parameter(Mandatory = $true)][string]$Carpeta,
  [string]$Estado,
  [switch]$Abrir,
  [string]$Version,
  [int]$Iridium,
  [string]$Pendiente,
  # Pruebas: fuera de la pantalla y de la barra de tareas. -Registro anota cada cosa que muestra.
  [switch]$Afuera,
  [string]$Registro,
  [switch]$Suelta
)
$ErrorActionPreference = 'Stop'

# Lanzada desde Iridium, hereda las conexiones que Iridium tenía abiertas (las de quien lo abrió, como las pruebas):
# vuelve a lanzarse con Start-Process, que abre el programa sin pasárselas, y esta termina enseguida.
if (-not $Suelta) {
  $argumentos = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', "`"$PSCommandPath`"", '-Suelta')
  foreach ($p in $PSBoundParameters.GetEnumerator()) {
    if ($p.Value -is [switch]) { if ($p.Value) { $argumentos += "-$($p.Key)" } }
    else { $argumentos += "-$($p.Key)"; $argumentos += "`"$($p.Value)`"" }
  }
  Start-Process -FilePath 'powershell.exe' -ArgumentList $argumentos -WindowStyle Hidden
  exit 0
}
$Carpeta = [IO.Path]::GetFullPath($Carpeta).TrimEnd('\')
$exe = Join-Path $Carpeta 'Iridium.exe'

function Anotar([string]$texto) {
  if (-not $Registro) { return }
  try { Add-Content -LiteralPath $Registro -Value "$(Get-Date -Format 'HH:mm:ss.fff')  $texto" -Encoding utf8 } catch { }
}

# Lo que se cuente como una falla de la ventana no frena nada: se anota y se cierra (la versión entra igual).
trap {
  Anotar "falla: $($_.Exception.Message)"
  exit 1
}

Add-Type -AssemblyName System.Windows.Forms, System.Drawing
Add-Type @'
using System; using System.Runtime.InteropServices;
public static class DwmIridium {
  [DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(IntPtr h, int a, ref int v, int s);
}
'@
[Windows.Forms.Application]::EnableVisualStyles()

# Los colores de docs/diseno/tokens.css: --elevado, --texto, --texto-3, --borde, --bien, --error y --borde-fuerte.
function Color([string]$hex) { [Drawing.ColorTranslator]::FromHtml($hex) }
$elevado = Color '#0c0c0d'; $texto = Color '#e6e6e6'; $texto3 = Color '#8a8a8a'
$pista = Color '#1c1c1e'; $bien = Color '#4cc38a'; $rojo = Color '#e5484d'
$familia = if ((New-Object Drawing.Text.InstalledFontCollection).Families.Name -contains 'Segoe UI Variable Text') { 'Segoe UI Variable Text' } else { 'Segoe UI' }

# Cómo estaba Iridium.exe al empezar: en la copia instalada, la versión entró si cambió.
function Huella {
  try { $i = Get-Item -LiteralPath $exe; "$($i.VersionInfo.ProductVersion)|$($i.LastWriteTimeUtc.Ticks)" } catch { '' }
}
$huellaAntes = Huella

$f = New-Object Windows.Forms.Form
$f.Text = 'Actualizando Iridium'
$f.FormBorderStyle = 'None'
$f.ClientSize = New-Object Drawing.Size(380, 112)
$f.BackColor = $elevado
$f.TopMost = $false
try { $f.Icon = [Drawing.Icon]::ExtractAssociatedIcon($exe) } catch { }
if ($Afuera) {
  $f.StartPosition = 'Manual'
  $f.Location = New-Object Drawing.Point(-32000, -32000)
  $f.ShowInTaskbar = $false
} else {
  $f.StartPosition = 'CenterScreen'
  $f.ShowInTaskbar = $true
}

$titulo = New-Object Windows.Forms.Label
$titulo.ForeColor = $texto
$titulo.Font = New-Object Drawing.Font($familia, 11.5, [Drawing.FontStyle]::Bold)
$titulo.SetBounds(24, 22, 332, 24)
$f.Controls.Add($titulo)

$detalle = New-Object Windows.Forms.Label
$detalle.ForeColor = $texto3
$detalle.Font = New-Object Drawing.Font($familia, 9.5)
$detalle.AutoEllipsis = $true
$detalle.SetBounds(24, 48, 332, 20)
$f.Controls.Add($detalle)

$barra = New-Object Windows.Forms.Panel
$barra.BackColor = $pista
$barra.SetBounds(24, 80, 332, 4)
$f.Controls.Add($barra)
$lleno = New-Object Windows.Forms.Panel
$lleno.BackColor = $bien
$lleno.SetBounds(0, 0, 0, 4)
$barra.Controls.Add($lleno)

# Las esquinas redondeadas y el borde de Windows 11 (en Windows 10 no hacen nada).
$f.Add_HandleCreated({
  $redondo = 2; $borde = 0x002d2a2a  # COLORREF de #2a2a2d (--borde-fuerte)
  [void][DwmIridium]::DwmSetWindowAttribute($f.Handle, 33, [ref]$redondo, 4)
  [void][DwmIridium]::DwmSetWindowAttribute($f.Handle, 34, [ref]$borde, 4)
})

# Cada paso: lo que dice y hasta dónde llega la barra mientras dura.
$pasos = @{
  cerrando = @{ t = 'Cerrando la versión de antes'; tope = 0.3 }
  poniendo = @{ t = $(if ($Version) { "Poniendo la versión nueva · $Version" } else { 'Poniendo la versión nueva' }); tope = 0.8 }
  abriendo = @{ t = 'Abriendo Iridium'; tope = 0.97 }
}
$script:paso = ''; $script:motivo = ''; $script:desde = Get-Date; $script:cerrarEn = $null
$script:p = 0.0; $script:tope = 0.0; $script:vioInstalador = $false; $script:ticks = 0

function Mostrar([string]$paso, [string]$motivo = '') {
  if ($paso -eq $script:paso -and $motivo -eq $script:motivo) { return }
  # Lo que ya terminó (falla, lista, abierta) no cambia más: el que escribe después no lo pisa. A una falla solo se le
  # suma después que se abre la de antes.
  if ($script:cerrarEn -and -not ($paso -eq 'fallo' -and $script:paso -eq 'fallo')) { return }
  $script:paso = $paso; $script:motivo = $motivo; $script:desde = Get-Date
  switch ($paso) {
    { $pasos.ContainsKey($_) } {
      $titulo.Text = 'Actualizando Iridium…'
      $detalle.Text = $pasos[$paso].t
      if ($script:p -lt $script:tope) { $script:p = $script:tope }
      $script:tope = $pasos[$paso].tope
    }
    'abierta' { $script:p = 1.0; $script:cerrarEn = (Get-Date).AddMilliseconds(400) }
    'lista' {
      $titulo.Text = 'Iridium está actualizado'
      $detalle.Text = 'Lista: se abre la próxima vez.'
      $script:p = 1.0
      $script:cerrarEn = (Get-Date).AddSeconds(4)
    }
    'fallo' {
      # El motivo es largo: va en hasta tres renglones, con la ventana más alta.
      $titulo.Text = 'La versión nueva no entró'
      $detalle.Text = $motivo
      $detalle.Height = 50
      $barra.Top = 110
      $f.ClientSize = New-Object Drawing.Size(380, 140)
      if (-not $Afuera) { $f.CenterToScreen() }
      $lleno.BackColor = $rojo
      $script:cerrarEn = (Get-Date).AddSeconds(7)
    }
    default { $script:cerrarEn = Get-Date }
  }
  Anotar "$paso | $($titulo.Text) | $($detalle.Text)"
}

function LeerEstado {
  if (-not $Estado) { return $null }
  try { [IO.File]::ReadAllText($Estado) | ConvertFrom-Json } catch { $null }
}

function IridiumAbierto {
  @(Get-Process -Name Iridium -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowHandle -ne 0 -and $_.Path -and $_.Path.StartsWith("$Carpeta\", [StringComparison]::OrdinalIgnoreCase)
  }).Count -gt 0
}

function Instalando {
  if (-not $Pendiente) { return $false }
  $p = [IO.Path]::GetFullPath($Pendiente).TrimEnd('\')
  @(Get-Process -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -and $_.Path.StartsWith("$p\", [StringComparison]::OrdinalIgnoreCase)
  }).Count -gt 0
}

# Una vuelta de la copia instalada: no hay quien escriba los pasos, se miran.
function MirarInstalada {
  $segundos = ((Get-Date) - $script:desde).TotalSeconds
  switch ($script:paso) {
    'cerrando' { if (-not (Get-Process -Id $Iridium -ErrorAction SilentlyContinue)) { Mostrar 'poniendo' } }
    'poniendo' {
      if (IridiumAbierto) { Mostrar 'abierta'; return }
      if (Instalando) { $script:vioInstalador = $true; return }
      # Terminó el instalador (o nunca se vio, después de un rato): la versión entró si Iridium.exe cambió.
      if (-not $script:vioInstalador -and $segundos -lt 20) { return }
      if ((Huella) -and (Huella) -ne $huellaAntes) {
        if ($Abrir) { Mostrar 'abriendo' } else { Mostrar 'lista' }
      } else {
        $motivo = 'Se va a probar de nuevo la próxima vez que cierres Iridium.'
        if ($Abrir -and (Test-Path -LiteralPath $exe)) {
          $motivo += ' Se abre la de antes.'
          Start-Process -FilePath $exe -WorkingDirectory $Carpeta
        }
        Mostrar 'fallo' $motivo
      }
    }
    'abriendo' { if (IridiumAbierto) { Mostrar 'abierta' } }
  }
}

function MirarDiaria {
  $e = LeerEstado
  if ($e -and $e.paso) { Mostrar "$($e.paso)" "$($e.motivo)" }
  if ($script:paso -eq 'abriendo' -and (IridiumAbierto)) { Mostrar 'abierta' }
}

# Si algo nunca llega (el ayudante se cortó, Iridium no abre), se cierra igual.
$topes = @{ cerrando = 150; poniendo = 180; abriendo = 60 }

$reloj = New-Object Windows.Forms.Timer
$reloj.Interval = 50
$reloj.Add_Tick({
  try {
    $script:ticks++
    $script:p += ($script:tope - $script:p) * 0.04
    if ($script:cerrarEn -and $script:paso -ne 'fallo') { $script:p = 1.0 }
    $lleno.Width = [int]($barra.Width * [Math]::Min(1.0, $script:p))
    if ($script:ticks % 10 -eq 0 -and (-not $script:cerrarEn -or $script:paso -eq 'fallo')) {
      if ($Iridium -gt 0) { MirarInstalada } else { MirarDiaria }
      if (-not $script:cerrarEn -and $topes.ContainsKey($script:paso) -and ((Get-Date) - $script:desde).TotalSeconds -gt $topes[$script:paso]) {
        Anotar "tope: $($script:paso) no terminó"
        $script:cerrarEn = Get-Date
      }
    }
    if ($script:cerrarEn -and (Get-Date) -ge $script:cerrarEn) {
      $reloj.Stop()
      Anotar 'cierra'
      $f.Close()
    }
  } catch {
    Anotar "falla: $($_.Exception.Message) $($_.InvocationInfo.PositionMessage)"
    $reloj.Stop()
    $f.Close()
  }
})

Mostrar 'cerrando'
$f.Add_Shown({ if (-not $Afuera) { $f.Activate() }; $reloj.Start() })
[Windows.Forms.Application]::Run($f)
