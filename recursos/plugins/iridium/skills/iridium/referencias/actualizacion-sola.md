# Una app de escritorio que se actualiza sola en todas las PC

Para una app de escritorio de Electron que el usuario usa **instalada** y en **más de una PC**. Es la receta que usa Iridium (probada de punta a punta); hasta que sea una pieza de las plantillas, se copia de acá. Se aplica cuando el usuario la pide (no es una novedad que el proyecto deba hacer solo) y se le cuenta por sus consecuencias, no por su código.

## Cómo queda
- **En la PC del código:** cada commit con la app cerrada, Iridium la arma y la instala sola (`scripts.md` › la marca `armar`, `SKILL.md` › Los scripts). Al terminar, el mismo script la **publica** en GitHub.
- **En las otras PC:** no hace falta el código ni herramientas. La app, al abrirse, mira si hay una versión publicada más nueva, la baja sola (solo lo que cambió) y entra al cerrarla. Se instala a mano una sola vez.
- Los datos del usuario no se tocan al instalar, actualizar ni desinstalar.

## Las piezas
1. **Un número de versión que crece en cada armado.** La app solo instala un número mayor que el suyo. Lo simple: el tercer número cuenta los commits desde que cambió el del medio (`1.0.0` → `1.0.12`; lo calcula el script de armar y lo pone en el `version` del armado), y el del medio sube al cerrar algo grande. Una fecha y hora (`2026.1127.1530`) también sirve.
2. **El instalador, por usuario.** electron-builder con NSIS, sin pedir permisos de administrador (`nsis.oneClick: true`, `perMachine: false`): instala en `%LOCALAPPDATA%\Programs\<nombre>` con su acceso en el escritorio y el menú Inicio, y queda en «Aplicaciones instaladas». El nombre del instalador lleva el número (`artifactName: ${productName}-Setup-${version}.${ext}`): la app busca el `.blockmap` de la versión anterior por ese número para bajar solo lo que cambió. Sin firma de código, Windows avisa la primera vez que se instala a mano; las actualizaciones no.
3. **De dónde se actualiza.** `publish: { provider: github, owner: <dueño>, repo: <repo de las versiones> }` en la configuración de electron-builder: el instalador lleva adentro `resources/app-update.yml` con esa dirección.
4. **La pieza que se actualiza, en la app** (`electron-updater`, en el proceso principal):
   - Solo en la app instalada (`app.isPackaged`), nunca en desarrollo ni en las pruebas.
   - `autoDownload = true`, `autoInstallOnAppQuit = true`; mira unos segundos después de abrir y cada seis horas (`checkForUpdates`).
   - Al bajar una (`update-downloaded`), un aviso discreto, «Versión nueva lista · entra al cerrar», con **Reiniciar ahora** (`quitAndInstall(true, true)`).
   - Escucha `error` y lo anota en el registro de la app: sin red o sin versiones no molesta al usuario.
5. **Publicar** (un script del proyecto, p. ej. `npm run publicar`): crea en GitHub la versión `v<número>` y le sube el instalador, su `.blockmap` y `latest.yml`. Usa la sesión de GitHub de git (`git credential fill`): **nunca una clave escrita en el repo ni en la app**. Si esa versión ya está publicada, no hace nada; borra las viejas y deja las últimas 5 (cada una pesa lo que el instalador). Sin red, lo dice y termina sin error: el próximo armado la publica.
6. **El armado la encadena** después de instalar. Como el instalador lleva el número en el nombre, conviene un solo script del proyecto (`npm run actualizar`) que pone el número, arma el instalador, lo corre con `/S` (y `runAfterFinish: false`, o abriría la app en medio de la noche) y publica; la línea `**Ejecutar:**` del script con la marca `armar` es ese comando. Como publicar no falla por la red, un armado sin conexión igual queda instalado en esta PC.

## Si el repositorio es privado
electron-updater no puede leer las versiones de un repositorio privado sin una clave, y una clave dentro de la app viaja en el instalador: cualquiera que lo tenga puede sacarla. Es una decisión del usuario (una `Q-n` en ese proyecto), con estas opciones:
- **Un repositorio público solo para las versiones** (`<app>-versiones`, sin código; recomendada): el código sigue privado y `publish` apunta a ese. Lo publicado (el instalador) sí lo puede bajar cualquiera que encuentre el repositorio.
- **Hacer público el repositorio del código**, si no tiene nada que proteger (es lo que hace Iridium).
- **Bajar las versiones a mano en las otras PC**, como antes.

## Cómo se prueba
- Con instaladores de verdad, sin la otra PC: armar dos versiones con distinto número, instalar la primera, servir la segunda con un servidor local (`setFeedURL({ provider: 'generic', url })`, prendido solo por una variable de las pruebas) y ver que la baja y entra al cerrar con los datos intactos. Iridium lo hace así en su repo (`tools/probar-instalador.ts`).
- Con el usuario: un commit en la PC del código y, en la otra, abrir la app, cerrarla y volver a abrirla: tiene que ser la versión nueva (que la app muestre su número, en Acerca de o en Ajustes, ayuda a mirarlo). Va como `Q-n` de prueba.
