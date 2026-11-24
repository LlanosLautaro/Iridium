# S-7 — La ventanita «Actualizando Iridium…» (T-128, D-186)

**Pregunta:** mientras se cambia la versión, Iridium está cerrado: ¿puede mostrar una ventana el ayudante de PowerShell, lanzado como hoy (`cmd start "" /min`, PowerShell con `-WindowStyle Hidden`), sin que Windows la abra minimizada ni escondida, y con el negro de `tokens.css`?

**Cómo:** `ventana.ps1` arma la ventana con WinForms (sin marco, centrada, las esquinas redondeadas y el borde de Windows 11 pedidos a DWM, la letra Segoe UI Variable), recorre los tres pasos (o el error con `-Falla`), guarda una captura del lugar de la pantalla donde quedó y cómo quedó la ventana, y se cierra.

```
start "" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ventana.ps1 -Salida <ruta> [-Falla]
```

**Resultado (2026-11-24): sí.** Las dos veces quedó visible, sin minimizar (`estado: Normal`), en el centro de la pantalla, con la letra de Iridium: `salida-pasos.png` y `salida-falla.png`. Lo que hay que cuidar al construir:
- El texto del error, largo, se corta en un renglón: va en dos, con la ventana un poco más alta.
- En PowerShell, `$Error` y `$error` son la lista de errores de PowerShell: ni parámetro ni variable con ese nombre.
- Lo que falle dentro del reloj de la ventana se pierde callado: va con `try`/`catch` que lo anota.

**Construida (2026-11-24, T-128, D-187):** `tools/ventana-actualizando.ps1`. Se relanza sola con `Start-Process` para no heredar las conexiones de Iridium; lanzada como la lanza Iridium quedó visible, sin minimizar y en el centro: `construida.png`.
