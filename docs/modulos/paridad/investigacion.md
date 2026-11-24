# Investigación del módulo: Paridad

**Fecha:** 2026-11-21
**Spike:** S-5 (`spikes/S-5-paridad/`); las notas, en `research/comandos-y-adjuntos-del-motor.md`

## Preguntas y respuestas
| Pregunta (de `definicion.md`) | Respuesta |
|---|---|
| ¿Se puede tener la lista de comandos sin gastar uso? | Sí: sale de una sesión sin mensajes, con nombre, para qué sirve, qué se le escribe después, otros nombres y si es de Claude Code o de una skill o complemento (86 en esta PC) |
| ¿Cómo se manda un comando? | Como un mensaje que empieza con «/». Los de Claude Code responden al instante, como un mensaje de la IA, sin gastar; los de skills trabajan como un pedido |
| ¿Hay comandos que no sirven fuera de la terminal? | Ninguno abre un menú: los que lo hacen en la terminal responden con texto. Algunos no tienen sentido en Iridium (`/color`, `/focus`, `/heapdump`) y algunos pisan lo que Iridium maneja: modelo, esfuerzo, tono, conversación nueva, contexto y uso (Q-243) |
| ¿Cómo viaja una foto? | Dentro del mensaje, como un bloque de imagen junto al texto; el modelo la ve sin herramientas y queda en el historial con sus datos |
| ¿Cómo viaja un archivo? | Como su ruta en el texto: Claude Code lo abre con sus herramientas (texto, código, imágenes, PDF). Las fotos elegidas o arrastradas, mejor como foto |
| ¿Y el texto largo pegado? | Es de Iridium: un bloque de texto aparte, con nombre, dentro del mismo mensaje |

## Lo que es del motor y lo que es de Iridium
- **Del motor** (la frontera, D-025): la lista de comandos y cuáles sirven en Iridium, y si acepta fotos y de qué tamaño.
- **De Iridium**, igual para cualquier motor: la lista que se abre con «/», el +, las miniaturas, el archivo como ruta y el texto pegado como bloque.

## Impacto en la definición
- `/clear` empieza otra conversación dentro de la sesión: si se ofrece, Iridium tiene que seguirla como si el usuario hubiera tocado «Nueva». Si se esconde (Q-243, A), no hace falta.
- Las fotos se guardan solas en el historial de Claude Code: Iridium no necesita guardarlas aparte.
- Un archivo no se copia: si después se mueve o se borra, el historial queda con la ruta vieja. Se acepta.

## Riesgos aceptados
- Los límites de tamaño de las fotos son los de la API (unos 5 MB y 8000 px por lado): se confirman con una captura real en la construcción.
- La lista de comandos cambia con cada versión de Claude Code: cuáles se esconden se decide por regla (los de Claude Code que pisan a Iridium o no sirven fuera de la terminal), no comando por comando, y se revisa al subir el SDK.

## Portón
- [x] Las preguntas de la definición tienen respuesta
- [x] Las notas están en `research/`, con el spike
- [x] ¿Requirió cambios en los documentos generales? Sí: el spike S-5 en `05-arquitectura.md` › Spikes (aplicado)

---

# Segunda parte: Capacidades (T-28)

**Fecha:** 2026-11-24
**Spike:** S-8 (`spikes/S-8-capacidades/`); las notas, en `research/capacidades-del-motor.md`

## Preguntas y respuestas
| Pregunta | Respuesta |
|---|---|
| ¿Los complementos andan en las sesiones de Iridium? | Sí: los de la cuenta cargan solos y sus skills y comandos están en «/». Sus conectores, no: piden iniciar sesión (Slack, Figma…) o fallan (Gmail, Calendar) |
| ¿Se sabe el estado de cada conector sin gastar? | Sí: una sesión sin mensajes da cada uno con su estado, y deja prenderlos, apagarlos y reconectarlos |
| ¿Cómo se inicia sesión en un conector? | Desde Claude Code interactivo (`/mcp`), que abre el navegador; en Iridium, en la consola de adentro (falta probarlo de punta a punta) |
| ¿Se puede usar el navegador? | Sí: Claude in Chrome viene con Claude Code (22 herramientas, anda en Windows); necesita la extensión «Claude» de Chrome, que en esta PC no está instalada |
| ¿Se puede usar la PC? | En Windows, Claude Code no: es solo de Mac; en Windows lo tiene la app de escritorio de Claude. Quedan servidores de terceros o uno propio (Q-283) |

## La PC: ¿va a llegar a Claude Code en Windows? (Q-283, 2026-11-24)
- **Cuánto lleva:** Claude Code puede usar la PC en Mac desde fines de marzo de 2026 (vista previa), y la app de escritorio de Claude en Windows desde abril. Ocho meses después, la documentación sigue diciendo «Computer use in the CLI is not available on Linux or Windows. On Windows, use computer use in Desktop instead», sin planes anunciados, y el `claude.exe` de Windows lo corta («Computer control is macOS-only»). Los pedidos para que llegue a Windows siguen abiertos; uno se cerró solo por viejo.
- **Y aunque llegara:** la documentación dice que pide una sesión interactiva y que no está con `-p`. Las sesiones de Iridium son del Agent SDK, que no son interactivas en ese sentido: ni en Mac lo tendrían. Es lo más claro de que no está pensado para el SDK.
- **Conclusión:** esperar no tiene fecha y probablemente no llegue al SDK. Lo que anda hoy es un servidor de terceros.
- **Windows-MCP** (CursorTouch, MIT): Windows 7 a 11, capturas, mouse, teclado, leer las ventanas y abrir programas. Se suma como cualquier conector (`claude mcp add … uv … windows-mcp`) y pide Python 3.13 y uv. Dice tener más de 2 millones de usuarios en las extensiones de la app de escritorio de Claude. En Reddit no se encontraron opiniones; el riesgo es el de siempre con esto: control total del escritorio.

## Impacto en la definición
- Los complementos no hay que «sumarlos»: lo que falta es verlos, conectar sus conectores y saber cuándo no andan.
- El navegador es una opción de la sesión: prenderlo es cambiar cómo se abre, no programar herramientas.
- La PC queda fuera salvo que el usuario elija otra cosa en Q-283.

## Riesgos aceptados
- Claude in Chrome y el estado de los conectores son de Claude Code y pueden cambiar con cada versión: se revisan al subir el SDK, con `spikes/S-8-capacidades/mirar.ts`.
- Con el navegador, una página puede traer instrucciones escondidas para la IA: el interruptor va apagado de entrada y la extensión pide permiso por sitio.

## Portón
- [x] Las preguntas de la definición tienen respuesta
- [x] Las notas están en `research/`, con el spike
- [x] ¿Requirió cambios en los documentos generales? Sí: el spike S-8 en `05-arquitectura.md` › Spikes (aplicado)
