# S-4 — Las maquetas vivas dentro de Iridium y F8 sobre ellas

**Fecha:** 2026-11-08 · **Frente:** Diseño, paso 5 (`docs/modulos/diseno/diseno-tecnico.md`) · Prototipo descartable.

## Pregunta
¿Una maqueta HTML de `docs/diseno/` se puede mostrar viva dentro de una ventana de Electron 44, sin acceso a Iridium ni a la red, y el modo comentar de la Revisión (`F8`, con la extensión que carga el ayudante) anda sobre ella con su captura?

## Cómo
`main.mjs` abre una ventana fuera de la pantalla (como `IRIDIUM_OCULTA`) con dos formas de mostrar `diseno/pantallas/bandeja.html`:
1. **Miniatura:** un `<iframe sandbox="allow-scripts">` con un protocolo propio, `maqueta://`, que sirve solo la carpeta `diseno/` con una política de contenido sin red.
2. **Grande:** un `<webview>` con la dirección `file://` en la sesión de siempre, donde el ayudante de la Revisión (`%APPDATA%\Centro de Desarrollo\extension\electron\ayudante.mjs`) cargó la extensión.

Correr: `node_modules/.bin/electron spikes/S-4-maquetas/main.mjs` desde la raíz del repo.

## Resultado
| Qué | Resultado |
|---|---|
| La miniatura carga la maqueta y sus tokens (`../tokens.css`) por `maqueta://` | Sí: fondo negro de los tokens |
| La miniatura llega a la página de Iridium | No: `parent.document` bloqueado (sandbox sin `allow-same-origin`) |
| El `<webview>` con `file://` recibe los scripts de la extensión | Sí: la marca de `pagina.js` está |
| Los clics de la maqueta andan | Sí (`onclick` cambió el botón) |
| `F8` abre el modo comentar | Sí: aparece el elemento `IRIDIUM-REVISION` del selector |
| La captura del `webview` (`capturePage`, lo que usa el ayudante con el id de la pestaña) | Sí, 200×100; fuera de la pantalla hace falta apagar `CalculateNativeWinOcclusion`, como ya hacen las pruebas |
| Pasar a otra maqueta con un enlace dentro del `webview` | No se midió: queda para el primer paso de DI-I1 |

## Conclusión
Las dos formas sirven y se usan juntas: **miniaturas en `<iframe>` con `maqueta://`** (livianas, aisladas, sin red) y **la grande en un `<webview>` con `file://`** (la extensión solo entra en el marco principal de una página `file://` o local, por eso no alcanza un `iframe`). El modo comentar no necesita cambios en la extensión; lo que cambia es del lado de Iridium: reconocer que el comentario es de una maqueta y de qué proyecto (`diseno-tecnico.md` › F8 sobre una maqueta).
