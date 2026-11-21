# Comandos, fotos y archivos en el motor

**Fecha:** 2026-11-21 · **Versión probada:** Agent SDK 0.3.309 (el de Iridium), modelo haiku · **Spike:** S-5 (`spikes/S-5-paridad/`, salidas en `salida-*.txt`)

Notas propias para el frente Paridad (`modulos/paridad/`): qué deja hacer el motor para tener en el chat de Iridium los comandos con «/», las fotos, los archivos y el texto largo pegado. No se copió documentación.

## 1. La lista de comandos

- **Sale sin mandar mensajes** (no gasta uso): `supportedCommands()` en una sesión que no manda nada, como ya se hace para los modelos y los estilos. Con los ajustes del usuario y del proyecto y el complemento de Iridium dio **86 comandos**.
- **Cada uno trae** su nombre (sin la barra), para qué sirve, qué se le escribe después (`<archivo>`, `[low|medium|high]`), sus otros nombres (`/cost` y `/stats` son `/usage`) y si es **de Claude Code** (`builtin`, 53) o de una skill, un complemento o un servidor MCP (33). Los de complementos llevan el complemento en el nombre (`engineering:code-review`) y en la descripción (`(engineering) …`).
- **Cambia durante la sesión:** cuando Claude Code descubre skills nuevas mientras trabaja, avisa con la lista entera (`commands_changed`); `reloadPlugins()` también la devuelve. La lista de una sesión abierta puede refrescarse sin abrir otra.

## 2. Mandar un comando

Un comando se manda como un **mensaje de texto** que empieza con «/» (`/context`, `/compact resumí lo de la UI`). Claude Code lo reconoce del otro lado. Probado:

| Comando | Qué pasó | Gasto |
|---|---|---|
| `/context` | Responde como un mensaje de la IA, en Markdown: el modelo, los tokens y una tabla por categoría | ninguno |
| `/usage` | Responde con el uso de la sesión y de la semana, y qué lo consume | ninguno |
| `/model` | Sin nombre, dice el modelo actual y cómo cambiarlo; con nombre, **cambia el modelo de la sesión** por fuera del que eligió el usuario en Iridium | ninguno |
| `/config` | Sin nada, la lista de ajustes `clave=valor`; cambia ajustes de Claude Code de la PC | ninguno |
| `/clear` | **Empieza otra conversación** en la misma sesión (evento `conversation_reset` con el id nuevo) y no responde nada | ninguno |
| una skill (`/iridium:iridium`, `/code-review`) | Carga la skill y trabaja como cualquier pedido | el de un turno |

- **Ninguno abre una pantalla interactiva:** los que en la terminal son menús (`/model`, `/config`) responden con texto. Algunos no tienen sentido fuera de la terminal (`/color`, `/focus`, `/heapdump`, `/__remote-workflow`, `/workflow-launch-exec`) y otros están retirados o renombrados (`/agents`, `/extra-usage`).
- **Los que pisan lo que Iridium ya maneja:** `/model`, `/effort`, `/fast` y `/output-style` (el modelo, el esfuerzo y el tono, C-58 y AJ-3), `/clear` (la conversación nueva, que Iridium tiene que seguir si se usa), `/context` y `/usage` (Iridium ya los muestra). Si el chat los ofrece, la barra de Iridium muestra algo que ya no es cierto.
- Ojo al probar desde Git Bash: convierte `/context` en una ruta de Windows (`C:/Program Files/Git/context`) antes de que llegue a Node. Con `MSYS_NO_PATHCONV=1` llega bien. No afecta a Iridium, que no pasa por la consola.

## 3. Fotos

- **Viajan dentro del mensaje:** el contenido del mensaje del usuario pasa de un texto a una lista de bloques: la imagen (PNG, JPEG, GIF o WebP en base64) y el texto. El modelo la vio («¿De qué color es?» → «Rojo») sin usar herramientas.
- **Quedan en el historial** tal como se mandaron (el bloque de la imagen con sus datos), así que al volver a abrir la conversación se pueden mostrar las miniaturas.
- **Límites de la API de Claude** (para el diseño técnico, a confirmar con una foto real): unos 5 MB por imagen y un lado máximo de unos 8000 px; más grande, conviene achicarla antes de mandarla.

## 4. Archivos

- **Un archivo viaja como su ruta**, dentro del texto. Claude Code lo abre con sus herramientas (lee texto, código, imágenes y PDF), en el proyecto o fuera de él (en *bypass* no pide permiso, S-2). Es lo que hace hoy el usuario a mano.
- La API también acepta un PDF dentro del mensaje (bloque de documento), pero ata el mensaje al formato de Claude y no suma nada que la ruta no dé. Queda descartado para la primera parte.
- **Una foto elegida con el + o arrastrada** se puede mandar como foto (dentro del mensaje, se ve en el historial) en vez de como ruta.

## 5. Texto largo pegado

- No es del motor: es un bloque de texto más dentro del mensaje. Se puede mandar como un bloque aparte, con un nombre («Texto pegado, 340 líneas»), para que el historial lo reconozca y lo muestre plegado.

## Qué es de Claude y qué es de Iridium

| Qué | Dónde va |
|---|---|
| La lista de comandos, cuáles sirven en Iridium y cuáles pisan sus controles | la frontera del motor (otro motor tendría otra lista) |
| Mandar fotos dentro del mensaje y si el motor las acepta | la frontera del motor |
| El archivo como ruta, el texto pegado como bloque, la lista de «/» y las miniaturas | Iridium, igual para cualquier motor |
