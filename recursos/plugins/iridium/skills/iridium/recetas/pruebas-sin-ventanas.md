# Las pruebas no ocupan la pantalla del usuario

**Para:** escritorio (Electron) · página · consola (no le toca)
**Se aplica:** al armar las pruebas de un proyecto, al retomar uno que ya las tiene, y con la novedad del framework.

Mientras corren las pruebas, el usuario sigue usando la PC: no aparece ninguna ventana ni consola, no pierde el foco ni oye nada. Las capturas de las pruebas salen igual que antes. Es la receta de Iridium (probada también en una app de muestra que no es Iridium) y se le cuenta al usuario por eso, no por su código.

## Página (Playwright con el navegador)
Playwright ya abre el navegador sin ventana si no se le pide otra cosa. No pongas `headless: false` ni `--headed` en la configuración ni en el script de las pruebas; para mirarlas una vez, `--headed` a mano. Si la prueba levanta un servidor (`webServer`), que corra sin abrir el navegador del usuario (nada de `open` ni `BROWSER`).

## Escritorio (Electron)
Electron no tiene un modo sin ventana: la ventana tiene que existir para que la prueba la use y saque capturas. Se abre donde no se ve, con una variable de la app que **solo prenden las pruebas** (`<APP>_OCULTA`, con el nombre de la app). Fuera de las pruebas, la app no cambia.

1. **La configuración de Playwright la prende**, y deja mirarlas con `=0`:
   ```ts
   // playwright.config.ts, antes de defineConfig
   process.env.ALFA_OCULTA ??= '1'
   ```
   Las herramientas que abren la app para sacar capturas la prenden igual.
2. **En el proceso principal**, antes de `app.whenReady()`: Chromium deja de dibujar una ventana que cree tapada, y fuera de la pantalla la daría por tapada.
   ```ts
   const oculta = process.env.ALFA_OCULTA === '1'
   if (oculta) app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')
   ```
3. **La ventana**: fuera de la pantalla, sin botón en la barra de tareas, sin pausa en segundo plano, muda, y se muestra sin activarse (así no roba el foco).
   ```ts
   const v = new BrowserWindow({
     show: false,
     ...(oculta ? { x: -20_000, y: -20_000, skipTaskbar: true } : {}),
     webPreferences: { backgroundThrottling: !oculta /* , lo que ya tenía */ },
   })
   if (oculta) v.webContents.setAudioMuted(true)
   v.once('ready-to-show', () => (oculta ? v.showInactive() : v.show()))
   ```
   Cada ventana que abra la app (un aviso, una ventanita de progreso) va igual. Si la app usaba `show: true`, pasa a `show: false` con el `ready-to-show`.
4. **Las consolas y los programas que abre la app** (un script, un ayudante), escondidos y sin quedarse abiertos:
   ```ts
   spawn('cmd.exe', ['/d', '/s', oculta ? '/c' : '/k', comando], { windowsHide: oculta })
   ```
5. **Lo que no se puede esconder** (abrir el navegador, VS Code, el explorador) no se hace en las pruebas: una variable de las pruebas lo cambia por algo que la prueba puede mirar.

Si las pruebas no son de Playwright, lo mismo: la variable la prende su herramienta.

## Consola
Una herramienta de consola no abre ventanas: no le toca. Si abre algo (un navegador, un archivo), va como el punto 5.

## Cómo se prueba
- La IA corre las pruebas enteras y mira que pasen igual que antes, con las capturas iguales (no en blanco).
- Con el usuario, una `Q-n` de prueba con casillas: con las pruebas corriendo (la IA las larga o le dice qué script usar), seguir usando la PC: que no aparezca ninguna ventana ni consola, que no pierda el foco de lo que está escribiendo y que no suene nada.
