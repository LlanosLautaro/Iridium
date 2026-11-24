# Propuesta: las consolas adentro de Iridium

**Estado:** en curso (aprobada en Q-276 con Armar y Volver adentro, D-185; I-9 probada en Q-277; I-10 hecha, se prueba en Q-279)
**Origen:** T-116, D-184 · **Tamaño:** grande · **Fecha:** 2026-11-23

## Por qué
Hoy cada **Ejecutar** de Scripts abre una ventana de consola aparte que queda abierta (D-043), y el inicio de sesión de Claude también. Pediste tenerlas adentro, plegadas para que no ocupen lugar, varias a la vez como en VS Code, con un indicador de que algo corre (Q-272, D-184: la consola de verdad, a la que se le escribe).

## La prueba de la pieza (S-6, 2026-11-23)
D-184 pedía probar primero que la pieza nativa (`node-pty`, la que usa VS Code) arme. Se probó con una app mínima armada igual que Iridium (archivo comprimido, los fusibles de seguridad, el instalador por usuario y la actualización encima): `spikes/S-6-consola/`.

- **Arma sin compilar nada:** la pieza trae su versión lista para Windows, que sirve para cualquier Electron. El armador intentaba recompilarla y fallaba; con `npmRebuild: false` no lo intenta.
- **Anda suelta, instalada y actualizada encima (1.0.0 → 1.0.1):** abre PowerShell, se le escribe, devuelve la respuesta en 1,3 s con sus colores y cambia de tamaño.
- **Cerrar una consola no deja nada corriendo** (un `ping -t` adentro se cierra con ella). Un hallazgo: en la app armada, el cierre normal de la pieza lanza un ayudante que los fusibles no dejan correr y deja un error en el registro. Se evita cortando el árbol de procesos desde Iridium (`taskkill /T`): cierre limpio, sin error y sin restos.
- **Pesa 8,5 MB** en la app (se pueden sacar unos 3 MB de lo que es de Mac y de procesadores ARM).

## Qué ves (ver la maqueta Diseño › Las consolas adentro)
- **Un panel abajo de la sección**, no de la conversación, que sigue entera a la derecha. Plegado no se ve; se abre con «▶ N corriendo» en la barra de abajo, con `Ctrl+ñ` (el de VS Code en un teclado en español) o al ejecutar algo. El borde de arriba se arrastra para darle alto, y el alto se recuerda.
- **Una pestaña por consola**, con el nombre del script y cómo va: ▶ en verde corriendo, ✓ terminó bien, una cruz roja si falló. La × de la pestaña la cierra (si corre, la detiene). A la derecha, **Detener**, **Limpiar** y plegar.
- **Es una consola de verdad:** se le escribe (un Enter, una respuesta, `Ctrl+C`), con colores, y se copia con el mouse. Cuando el script termina, la pestaña queda para leer lo que pasó, como hoy la ventana que queda abierta.
- **Por proyecto,** como la conversación: cada proyecto ve sus consolas. La barra de abajo cuenta las del proyecto abierto; en el inicio, todas.
- **Scripts** ejecuta ahí en lugar de abrir una ventana (los que abren un programa, un archivo o una página siguen igual, con Windows). **Iniciar sesión en Claude** (Ajustes › IA y el aviso rojo de abajo) también: si Claude pide pegar un código, se pega ahí.
- **Al cerrar Iridium** con algo corriendo, la confirmación lo dice («1 consola corriendo: se detiene al cerrar»). Lo que corre adentro se cierra con Iridium (D-184).

### Un punto que cambia D-184: Armar y Volver
D-184 dejó Armar y Volver corriendo aparte porque «cierran y reemplazan Iridium». Mirando el código, eso ya no es así desde CO-I2: con Iridium abierto, `pnpm actualizar` y `pnpm volver` solo **preparan** la versión nueva, que se pone al cerrar Iridium o con Actualizar. Correrlas en el panel tiene una sola consecuencia: si cerrás Iridium mientras arman, el armado se corta (la confirmación de cierre lo avisa, y el próximo Armar lo rehace). **Recomiendo correrlas adentro como cualquier script**: no hay una pestaña especial «aparte» y se les puede contestar (Volver pregunta qué versión). El **Actualizar** de la barra de abajo y la actualización automática de los proyectos (frente Abrir) siguen como hoy, escondidas y con su registro.

## Qué cambia en cada documento
- `04-ux.md`: W-16 (Scripts) y la barra de estado (W-1) con el panel; una pantalla nueva, W-18 (las consolas).
- `05-arquitectura.md`: el componente nuevo, la dependencia y su prueba en Spikes (S-6); el armado (`npmRebuild: false`, la pieza fuera del archivo comprimido).
- `06-ui.md` y `docs/diseno/`: la maqueta `consolas.html` pasa a «En la app» al terminar.
- `decisiones.md`: la decisión técnica (D-185) y, si se aprueba, el ajuste de D-184 (3).
- `scripts.md`: nada (los scripts son los mismos; cambia dónde corren).

## Cómo se construye
- **Proceso principal:** `infra/consolas.ts` es el único que importa `node-pty`, como `motor/` con el SDK. Abre cada consola con `cmd` (el mismo intérprete que usaban las ventanas, así los scripts de `docs/scripts.md` se escriben igual; al construir se cambió PowerShell por esto, D-185) en la carpeta del proyecto (o la del script), con el entorno de Iridium sin `ELECTRON_RUN_AS_NODE` (como hoy), y corre el comando del script; manda lo que imprime a la ventana en tandas cada 16 ms y guarda las últimas 5000 líneas de cada una, para que una pestaña que se vuelve a mirar o la ventana recargada la muestren entera. Detener y cerrar cortan el árbol de procesos (S-6). Al cerrar Iridium, corta todas.
- **El puente:** pedidos `abrirConsola`, `escribirConsola`, `tamanoConsola`, `detenerConsola`, `cerrarConsola`, `consolas` (la lista con su estado) y el evento `consola` (salida, terminó con su código). Todo validado con Zod, como lo demás.
- **La ventana:** la consola se dibuja con `xterm.js` (`@xterm/xterm` y su ajuste de tamaño), la misma que usa VS Code, con los colores de `tokens.css`. El panel y la señal de la barra van en el marco (`renderer/marco/`), con lo que se ve en `piezas.css`.
- **El armado:** `node-pty` en `asarUnpack` y `npmRebuild: false`; pnpm deja correr su instalación (`onlyBuiltDependencies`).
- **Las pruebas:** Vitest para las reglas (el estado de cada pestaña, qué cuenta la barra, el recorte a 5000 líneas) y para `infra/consolas.ts` con una consola real; Playwright con la app escondida (D-072): Ejecutar abre la pestaña, se le escribe, Detener, el cierre corta todo y no queda nada corriendo; y `tools/probar-instalador.ts` con la pieza adentro, que prueba el instalador y la actualización de verdad, como pidió D-184 (5). Con `IRIDIUM_OCULTA=1`, como ahora, nada se ve.

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| I-9 | El panel con consolas de verdad: Scripts e Iniciar sesión corren adentro, pestañas, Detener, Limpiar, la barra de abajo, el cierre; con el instalador probado | hecha (probada en Q-277: todo bien, y el panel debajo del chat en el inicio no molesta) |
| I-10 | Lo que completa: el alto recordado, `Ctrl+ñ`, Armar y Volver adentro (según Q-276), la confirmación al cerrar, sacar las partes que no son de Windows | hecha el 2026-11-23; espera Q-279 |

## Log
- **2026-11-23 — I-9.** El panel con consolas de verdad (`infra/consolas.ts`, `renderer/marco/Consolas.tsx`): Scripts, Ejecutar, Armar ahora e Iniciar sesión en Claude corren adentro; pestañas con cómo va cada una, Detener, Limpiar, plegar, «▶ N corriendo» en la barra y, al cerrar Iridium, nada queda corriendo. Fuera de un proyecto el panel va abajo de toda la pantalla, también debajo del chat (se verá si molesta). Si la pieza no carga, vuelve la ventana aparte. Pruebas: Vitest (las reglas, una consola real: responde, se le escribe, falla con su código, Detener sin restos, el inicio de sesión en la consola), Playwright con la app abierta (Ejecutar, contestarle, Detener, plegar, la ×, el inicio y el cierre) y el instalador de verdad: la consola anda en la versión instalada y en la actualizada encima, y al cerrar no queda nada de la carpeta instalada.
- **2026-11-23 — I-10.** El borde de arriba del panel se arrastra (o con las flechas) y el alto se recuerda (`altoConsolas` en las preferencias, de 120 a 1200 px; 300 de entrada). `Ctrl+ñ` pliega y abre el panel, también con el foco en la consola (la consola no lo recibe). Cerrar o reiniciar con una consola corriendo pregunta («1 consola corriendo · Cerrar la detiene»; con la IA trabajando se suma al texto, y Esperar solo aparece si hay sesiones); Actualizar solo no reinicia mientras una consola corre. Armar y Volver ya corrían adentro desde I-9 (son scripts como los demás). Del armado sale lo que no es de Windows x64 de la pieza nativa (las versiones de Mac y ARM, su código fuente y lo de compilar): de 9,9 a 3,8 MB. Pruebas: Vitest (el texto de la confirmación, las preferencias), Playwright (`Ctrl+ñ`, arrastrar y flechas, el alto al volver a abrir, la confirmación con Cancelar y Cerrar igual sin dejar nada corriendo) y `tools/probar-instalador.ts` (la consola en la versión instalada y en la actualizada encima, con el armado nuevo).
