# Scripts

> Lo que el usuario ejecuta a mano. Lo mantiene la IA (ver la skill › Scripts del usuario). Cada script: título `##`, una línea de para qué sirve y una línea **Ejecutar:** (un comando, en la raíz del proyecto salvo que una línea **Carpeta:** diga otra, o un instalador o programa del proyecto, que se ejecuta con Windows) o **Abrir:** (una carpeta o un archivo para ver, relativa a la raíz). Lo más usado primero.

## Abrir Iridium
La app de uso diario, la última versión armada.
**Ejecutar:** `release/win-unpacked/Iridium.exe`

## Crear el acceso directo
Pone «Iridium» en el escritorio, apuntando a la app armada. Alcanza con hacerlo una vez.
**Ejecutar:** `pnpm acceso-directo`

## Armar la última versión
Pone los últimos cambios en la app de uso diario (tarda un minuto). Sirve con Iridium cerrado o abierto, también desde su sección Scripts. Con Iridium abierto no lo cierra: al terminar, abajo aparece **Actualizar**, y la versión entra la próxima vez que lo cerrás o ya, tocándolo. Lo más simple es no correr esto a mano: cuando hay commits sin armar, Iridium arma solo (D-122) en cuanto la IA de Iridium queda libre, sin consola a la vista («Actualizando…», con **Cancelar**), y se reinicia solo cuando ninguna IA trabaja y no usás la PC unos minutos; **Actualizar**, abajo, lo hace ya. Con Iridium cerrado, la pone en el acto. También mueve `main` en GitHub a lo que se armó. Lo que pasó al armar queda en `release/armado.log` (**Ver la consola**, si falla) y lo de poner la versión en `release/actualizacion.log`.
**Ejecutar:** `pnpm actualizar`

## Publicar la versión para compartir
Sube a GitHub la versión que tenés en uso (la última que armaste) para las copias de otras personas: la bajan solas y entra cuando cierran Iridium (D-085). Armá antes si hay cambios sin armar. Tarda unos minutos (sube unos 280 MB). Si dice que esa versión ya está publicada, no hay nada nuevo que mandar.
**Ejecutar:** `pnpm publicar`

## Volver a la versión anterior
Si una versión nueva falla, pone la que estaba antes (D-078). Dice cuál va a poner y espera un Enter; tarda unos minutos, porque la arma de nuevo. Como Armar la última versión: con Iridium abierto entra al cerrarlo, cerrado entra en el acto. Después Iridium muestra **Actualizar** con lo que quedó afuera: no lo arma solo hasta que haya un commit nuevo (D-122), y no lo toques hasta que la IA lo arregle, porque volvería a poner la versión que falla. Si Iridium no abre, ejecutalo desde una terminal en la carpeta del proyecto (o la de VS Code). Para volver a una versión precisa, agregá `-Commit` y el commit (el que muestra Acerca de).
**Ejecutar:** `pnpm volver`

## Abrir en modo desarrollo
La app con los cambios en vivo, sin armarla.
**Ejecutar:** `pnpm dev`

## Cerrar la sesión de Claude (para probar)
Cierra la sesión de Claude en esta PC, para probar **Iniciar sesión** de Iridium (Q-93). Vale también para VS Code: comparten la sesión, y al volver a entrar desde Iridium queda para los dos. `pnpm claude auth status` dice con qué cuenta estás.
**Ejecutar:** `pnpm claude auth logout`

## Instalar dependencias
Hace falta una vez, o cuando la IA lo pida.
**Ejecutar:** `pnpm install`

## Instalar la extensión de Revisión
Una vez, en Edge o Chrome. Deja la extensión al día en su carpeta, la abre y copia su ruta. En Edge escribí `edge://extensions` en la barra de direcciones (Edge no deja abrirla desde un script), prendé **Modo de desarrollador**, tocá **Cargar descomprimida** y pegá la ruta o elegí la carpeta que se abrió. Edge avisa que puede leer datos de todos los sitios: lo pide solo para la captura y solo corre en las apps de tu PC (D-050). Si un día Iridium dice «Hay una versión nueva de la extensión», ejecutá esto otra vez y tocá **Recargar** en esa página. Las apps Electron (Iridium, otras apps) la cargan solas en modo desarrollo.
**Ejecutar:** `pnpm extension`

## Ver las piezas nuevas de Orden
La hoja con las piezas nuevas del frente Orden, cada una con sus estados. Arriba a la derecha cambia entre Iridium y Carbón; en el control de la conversación, tocá la línea para plegarla.
**Abrir:** `docs/ui/vista-orden.html`

## Ver las capturas de Orden
Las mismas piezas como imágenes, una por pieza y por tema (`todo-…` es la hoja entera).
**Abrir:** `docs/ui/capturas-orden`

## Ver el prototipo de la vista de proyecto
Los tres paneles de D-041 en el navegador: la barra de íconos del proyecto, la vista grande y la conversación a la derecha, con su borde que se arrastra y las conversaciones anteriores en el botón del reloj.
**Abrir:** `docs/ui/vista-proyecto.html`

## Ver el prototipo de la Revisión de la app
El módulo Revisión en el navegador: arriba a la izquierda del selector, **En la app** (una app de ejemplo con el modo comentar) y **En Iridium** (la sección Revisión y la conversación). En la app: pasá el mouse, `Alt+↑` para la caja que lo contiene, clic para comentar, `Enter` deja, `Ctrl+Enter` envía, `Esc` cierra la tarjeta o sale y `F8` entra y sale.
**Abrir:** `docs/ui/vista-revision.html`

## Ver las rondas de estilo
Las versiones que se probaron hasta elegir F4, lado a lado (la última ronda; las anteriores están enlazadas arriba).
**Abrir:** `docs/ui/alternativas/index.html`
