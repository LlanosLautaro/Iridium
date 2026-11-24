# S-7 (T-128, D-186): ¿una ventanita de WinForms lanzada como hoy el ayudante (cmd start /min, PowerShell escondido)
# se ve normal, sin minimizarse, con los colores de tokens.css? Recorre los tres pasos (o el error con -Falla), guarda
# una captura de la pantalla donde quedó y cómo quedó la ventana en `salida-*.json`, y se cierra.
param([string]$Salida, [switch]$Falla)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
Add-Type @'
using System; using System.Runtime.InteropServices;
public static class Dwm {
  [DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(IntPtr h, int a, ref int v, int s);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
}
'@
[Windows.Forms.Application]::EnableVisualStyles()

function Color([string]$hex) { [Drawing.ColorTranslator]::FromHtml($hex) }
$fondo = Color '#0c0c0d'; $texto = Color '#e6e6e6'; $texto3 = Color '#8a8a8a'
$pista = Color '#1c1c1e'; $bien = Color '#4cc38a'; $rojo = Color '#e5484d'
$familia = if ((New-Object Drawing.Text.InstalledFontCollection).Families.Name -contains 'Segoe UI Variable Text') { 'Segoe UI Variable Text' } else { 'Segoe UI' }

$f = New-Object Windows.Forms.Form
$f.Text = 'Actualizando Iridium'
$f.FormBorderStyle = 'None'
$f.StartPosition = 'CenterScreen'
$f.ClientSize = New-Object Drawing.Size(380, 112)
$f.BackColor = $fondo
$f.ShowInTaskbar = $true
$f.TopMost = $false

$titulo = New-Object Windows.Forms.Label
$titulo.Text = 'Actualizando Iridium…'
$titulo.ForeColor = $texto
$titulo.Font = New-Object Drawing.Font($familia, 11.5, [Drawing.FontStyle]::Bold)
$titulo.SetBounds(24, 22, 332, 24)
$f.Controls.Add($titulo)

$paso = New-Object Windows.Forms.Label
$paso.Text = 'Cerrando la versión de antes'
$paso.ForeColor = $texto3
$paso.Font = New-Object Drawing.Font($familia, 9.5)
$paso.SetBounds(24, 48, 332, 20)
$f.Controls.Add($paso)

$barra = New-Object Windows.Forms.Panel
$barra.BackColor = $pista
$barra.SetBounds(24, 80, 332, 4)
$f.Controls.Add($barra)
$lleno = New-Object Windows.Forms.Panel
$lleno.BackColor = $bien
$lleno.SetBounds(0, 0, 0, 4)
$barra.Controls.Add($lleno)

$f.Add_HandleCreated({
  $redondo = 2; $borde = 0x002d2a2a  # COLORREF de #2a2a2d (--borde-fuerte)
  [void][Dwm]::DwmSetWindowAttribute($f.Handle, 33, [ref]$redondo, 4)
  [void][Dwm]::DwmSetWindowAttribute($f.Handle, 34, [ref]$borde, 4)
})

$pasos = @(@{ t = 'Cerrando la versión de antes'; hasta = 0.3 }, @{ t = 'Poniendo la versión nueva'; hasta = 0.8 }, @{ t = 'Abriendo Iridium'; hasta = 1.0 })
$script:i = 0; $script:p = 0.0; $script:ticks = 0; $script:capturado = $false
$reloj = New-Object Windows.Forms.Timer
$reloj.Interval = 50
$reloj.Add_Tick({ try {
  $script:ticks++
  # La barra se acerca al tope del paso en curso sin llegar: avanza siempre, y salta cuando el paso termina.
  $tope = $pasos[$script:i].hasta
  $script:p += ($tope - $script:p) * 0.04
  $lleno.Width = [int]($barra.Width * $script:p)
  if ($script:ticks % 25 -eq 0 -and $script:i -lt 2) {
    if ($Falla -and $script:i -eq 1) {
      $titulo.Text = 'La versión nueva no entró'
      $paso.Text = 'Windows no soltó la carpeta de la app. Se abre la de antes.'
      $lleno.BackColor = $rojo
      $script:i = 9
    } else { $script:i++; $paso.Text = $pasos[$script:i].t }
  }
  if ($script:i -eq 9) { $script:i = 1 }
  if ($script:ticks -eq 70 -and -not $script:capturado) {
    $script:capturado = $true
    $r = $f.Bounds
    $bmp = [Drawing.Bitmap]::new($r.Width + 40, $r.Height + 40)
    $g = [Drawing.Graphics]::FromImage($bmp)
    $g.CopyFromScreen($r.X - 20, $r.Y - 20, 0, 0, $bmp.Size)
    $bmp.Save("$Salida.png", [Drawing.Imaging.ImageFormat]::Png)
    @{
      visible = [Dwm]::IsWindowVisible($f.Handle); minimizada = [Dwm]::IsIconic($f.Handle)
      estado = "$($f.WindowState)"; x = $r.X; y = $r.Y; ancho = $r.Width; alto = $r.Height; fuente = $familia
    } | ConvertTo-Json | Set-Content -LiteralPath "$Salida.json" -Encoding utf8
  }
  if ($script:ticks -ge 90) { $f.Close() }
 } catch { Add-Content -LiteralPath "$Salida.err" -Value "$_ $($_.InvocationInfo.PositionMessage)"; $f.Close() } })
$f.Add_Shown({ $f.Activate(); $reloj.Start() })
[Windows.Forms.Application]::Run($f)
