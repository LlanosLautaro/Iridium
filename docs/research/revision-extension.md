# Revisión de la app: extensión en Chrome, Edge y Electron, y archivo y línea en React 19

**Fecha:** 2026-10-28 · **Versiones probadas:** Electron 44.9.1, Edge 156, Vite 7.3.7 con `@vitejs/plugin-react` 5.2, React 19.3 · **Spike:** S-3 (`spikes/S-3-revision/`, salida en `salida.txt`)

Notas propias para el módulo Revisión de la app (`modulos/revision/`). No se copió documentación.

## 1. La extensión y el programa local

- **Una extensión de Manifest V3** con tres piezas: un script en el **mundo de la página** (el único que ve lo que React cuelga de cada elemento), otro en el **mundo aislado** (el selector y el cuadro del comentario, sin mezclarse con la app) y el **service worker** (captura y envío). Se hablan con `postMessage` y `chrome.runtime.sendMessage`.
- **Comprobado en S-3:** desde el mundo aislado no se ve la fibra de React (`reactVisibleDesdeAislado: false`); desde el de la página, sí. Hace falta el script en `"world": "MAIN"`.
- **El envío a Iridium:** el service worker hace un `POST` a `http://127.0.0.1:<puerto>`, con `host_permissions` para `127.0.0.1`. Llegó con el origen `chrome-extension://<id>`, en Edge y en Electron. Iridium puede aceptar solo ese origen y rechazar el resto, para que una página web cualquiera no le escriba comentarios.
- **Acceso a la red local de Chrome (desde la 142):** pide permiso cuando una página pública quiere hablarle a la PC. Acá no aplica: el pedido sale de la extensión con permiso de host, y la app en desarrollo también es local. Si alguna versión lo pidiera, se ve en la construcción.
- **Instalación:** sin tienda, como extensión **descomprimida en modo desarrollador** (Chrome y Edge: `chrome://extensions` › Cargar descomprimida). Desde Chrome 137 la opción `--load-extension` de la línea de comandos ya no anda en Chrome con marca; en Edge sí (S-3 la usó). Edge puede mostrar al abrir un aviso de «extensiones en modo desarrollador»: es una molestia, no un bloqueo.
- **Mensajería nativa** (la otra forma de hablar con un programa de la PC) no hace falta: obliga a registrar el programa en el registro de Windows y lo arranca el navegador. Con Iridium ya escuchando en `127.0.0.1`, alcanza con `fetch`.

## 2. Archivo y línea en React 19

- React 19 **quitó `_debugSource`** (lo que leían LocatorJS y las versiones viejas de React Grab). En modo desarrollo deja, en cada elemento, **`_debugStack`**: la pila del lugar donde se escribió el JSX.
- **Comprobado en S-3:** el primer renglón de esa pila fuera de `node_modules` apunta a `http://localhost:5199/src/Tarjeta.jsx`, línea 9 del código ya transformado. Con el mapa de fuentes que Vite pega a cada módulo, queda **`Tarjeta.jsx`, línea 6, columna 6**: justo donde está el `<button>`. Además, subiendo por las fibras salen los componentes que lo contienen (`Tarjeta` › `App`).
- **Dónde se resuelve:** la extensión solo manda la pila; Iridium (que tiene Node) baja el módulo, lee el mapa y calcula archivo y línea. Así la extensión queda chica.
- **Riesgo:** `_debugStack` es interno de React y puede cambiar entre versiones. Si un día falta, el comentario igual guarda el selector, el texto visible, los componentes y la captura.
- **Bibliotecas:** bippy (MIT, la que usa React Grab) hace lo mismo con más casos; no hace falta para lo que se usa. code-inspector (MIT) marca archivo y línea en Vue, Svelte, Solid y otros con un plugin de Vite o Webpack: sirve si algún proyecto deja React. Hoy todos los proyectos del usuario usan React 19 con Vite.

## 3. Electron

- **Cargar la extensión:** `session.defaultSession.extensions.loadExtension(<carpeta>)` en el proceso principal, después de `ready`, en cada arranque (Electron no la recuerda). Solo descomprimida. Se pone dentro de `if (!app.isPackaged)`, así nunca llega a la versión armada.
- **Comprobado en S-3 (Electron 44):** la extensión carga; los dos scripts corren (también el del mundo de la página); el service worker de MV3 corre y envía a `127.0.0.1`.
- **Lo que falta:** **`chrome.tabs.captureVisibleTab` no existe** en Electron. Tampoco `chrome.storage.sync` (sí `local`) ni varias funciones de `chrome.tabs`; ninguna hace falta, salvo la captura.
- **La captura en Electron:** `webContents.capturePage(rect)` del proceso principal de la app recorta el elemento (S-3: 69 × 35, el tamaño del botón). Como Electron 35 deja poner un *preload* al service worker de la extensión (`session.registerPreloadScript`) y hablar con el proceso principal, la misma pieza que carga la extensión puede ofrecerle la captura. Se diseña en el diseño técnico del módulo.
- **Lo mismo para el proyecto:** esa pieza sabe en qué carpeta corre la app (`app.getAppPath()`), así que el comentario de una app Electron llega con su proyecto puesto.

## 4. Qué proyecto corresponde a cada dirección (C-39)

- **Por el proceso:** Windows dice qué proceso atiende un puerto (`Get-NetTCPConnection`) y su línea de comandos (`Win32_Process`). **Comprobado:** un Vite levantado en `localhost:5198` mostró `node "D:\…\Centro de Desarrollo\node_modules\vite\bin\vite.js"`: la ruta dice el proyecto. Ojo: Vite escucha en `::1` (IPv6), no en `127.0.0.1`.
- **Por el código:** el mapa de fuentes trae el contenido de cada archivo (`/src/Tarjeta.jsx`); Iridium puede buscarlo entre los proyectos que conoce.
- **Recordar:** una vez resuelto, Iridium recuerda dirección → proyecto. Si nada lo resuelve, se pregunta una sola vez.

## 5. «Enviar ahora»

- Iridium ya tiene `enviar(sesión, texto)` en el motor: si el proyecto tiene una sesión abierta, el comentario se suma a ella (si está trabajando, al turno en curso); si no, queda guardado y se ve en el proyecto. El comentario se guarda siempre, se envíe o no.
- Las sesiones abiertas en VS Code no las maneja Iridium. Un *hook* de Claude Code (`UserPromptSubmit`) podría sumar los comentarios nuevos al próximo mensaje; queda para después.

## Fuentes
- [Electron: soporte de extensiones de Chrome y APIs disponibles](https://www.electronjs.org/docs/latest/api/extensions)
- [Electron: `session.extensions`](https://www.electronjs.org/docs/latest/api/extensions-api)
- [Electron 35: *preload* para service workers](https://www.electronjs.org/blog/electron-35-0)
- [Chrome: acceso a la red local](https://developer.chrome.com/blog/local-network-access)
- [Guía de actualización a React 19](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) y [bippy](https://github.com/aidenybai/bippy) (MIT)
- [React Grab](https://github.com/aidenybai/react-grab) (MIT) y [code-inspector](https://github.com/zh-lx/code-inspector) (MIT)
