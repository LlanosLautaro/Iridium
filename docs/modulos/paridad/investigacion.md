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
