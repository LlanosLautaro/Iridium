Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices;
public class W { public delegate bool P(IntPtr h, IntPtr l);
[DllImport("user32.dll")] public static extern bool EnumWindows(P f, IntPtr l);
[DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
[DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out R r);
public struct R { public int L, T, Ri, B; } }
"@
$fg = [W]::GetForegroundWindow(); $sb = New-Object Text.StringBuilder 256; [void][W]::GetWindowText($fg, $sb, 256)
$res = @()
[W]::EnumWindows({ param($h, $l) $s = New-Object Text.StringBuilder 256; [void][W]::GetWindowText($h, $s, 256)
  $t = $s.ToString(); if ($t -like '*MUESTRA-*' -and [W]::IsWindowVisible($h)) { $r = New-Object W+R; [void][W]::GetWindowRect($h, [ref]$r)
  $script:res += "$t @ $($r.L),$($r.T)" }; $true }, [IntPtr]::Zero) | Out-Null
"adelante=" + $sb.ToString()
$res
