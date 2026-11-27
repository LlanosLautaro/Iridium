// App de muestra (spike de Plantillas): la receta de las pruebas sin ventanas, prendida con MUESTRA_OCULTA=1.
// MUESTRA_PARCIAL=1 aplica solo la posición fuera de la pantalla, sin lo que hace que se siga dibujando.
import { spawn } from 'node:child_process'
import { app, BrowserWindow } from 'electron'

const oculta = process.env.MUESTRA_OCULTA === '1'
const parcial = process.env.MUESTRA_PARCIAL === '1'
if (oculta && !parcial) app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

app.whenReady().then(() => {
  const v = new BrowserWindow({
    width: 800, height: 600, show: false, title: 'MUESTRA-VENTANA', backgroundColor: '#c81e1e',
    ...(oculta ? { x: -20_000, y: -20_000, skipTaskbar: true } : {}),
    webPreferences: { backgroundThrottling: !(oculta && !parcial) },
  })
  v.loadURL('data:text/html,<title>MUESTRA-VENTANA</title><body style="margin:0;background:%23c81e1e"><h1 id=n style="color:white">0</h1><script>let n=0;setInterval(()=>{n++;document.getElementById("n").textContent=n},10)</script>')
  v.once('ready-to-show', () => {
    if (oculta) { v.showInactive(); v.setAudioMuted?.(true); v.webContents.setAudioMuted(true) } else v.show()
  })
  // Una consola que abre la app, como Scripts: escondida con la receta.
  spawn('cmd.exe', ['/d', '/c', 'title MUESTRA-CONSOLA & ping -n 30 127.0.0.1'], {
    windowsHide: oculta, detached: !oculta, stdio: 'ignore',
  })
})
