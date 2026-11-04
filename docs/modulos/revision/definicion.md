# Definición del módulo: Revisión de la app

**Fecha:** 2026-10-28

## Objetivo del módulo
Que el usuario pueda señalar cualquier elemento de su app en desarrollo, web o Electron, y dejarle un comentario que la IA encuentre después en el código, sin explicar en el chat de qué elemento habla (D-012, D-046, D-047).

## Criterios de éxito
- Dejar un comentario lleva menos de 15 segundos: atajo, clic en el elemento, escribir, Dejar.
- En una app React con Vite, la IA llega al archivo y la línea del elemento sin buscar.
- Ningún comentario se pierde: si Iridium está cerrado, la extensión lo guarda y lo manda después.
- Al empezar una sesión, la IA sabe que hay comentarios abiertos sin que el usuario se lo diga.

## Funcionalidades
### Must (MVP del módulo)
- **Seleccionar y comentar (C-36):** un atajo o el botón de la extensión activa el selector; al pasar, se resalta el elemento; al hacer clic, un cuadro para escribir con **Dejar** y **Enviar ahora**. En Chrome, Edge y en las apps Electron en modo desarrollo (D-047).
- **Un archivo por comentario** en una carpeta del proyecto: el texto, la página, el selector, el texto visible, los componentes que lo contienen, el archivo y la línea cuando hay React con Vite, y una captura recortada del elemento.
- **Al proyecto correcto sin elegirlo (C-39):** por la dirección de la app; la elección se recuerda, y solo si no se puede resolver se pregunta una vez.
- **Enviar ahora (C-37):** además de guardarlo, lo suma a la sesión abierta del proyecto en Iridium; si no hay, queda guardado y se avisa.
- **Ver y reabrir (C-38):** en la vista del proyecto, los comentarios abiertos y cerrados, con su captura; un contador de abiertos; reabrir uno cerrado.
- **La IA los lee y los cierra:** el `CLAUDE.md` de cada proyecto dice dónde están; la IA los cierra al resolverlos y quedan en el historial (Q-21).
- **Electron:** la línea de modo desarrollo que carga la extensión, saca la captura y dice el proyecto. La IA la agrega a un proyecto Electron cuando el usuario lo pide.
- **Sin Iridium abierto:** la extensión guarda el comentario y lo manda cuando Iridium vuelve.

### Should
- Archivo y línea en Vue, Svelte y otros (code-inspector), si algún proyecto los usa.
- Ver sobre la app, con la extensión, dónde hay comentarios abiertos.
- Sumar los comentarios nuevos a una sesión abierta en VS Code (un *hook* de Claude Code).

### Could
- El mismo selector en el lienzo de Diseño (D-011), cuando exista ese módulo.

### Won't (por ahora)
- Variantes en vivo — D-012; para eso está `impeccable live`.
- Apps Android y extensiones de VS Code — no tienen una página que se recorra igual.
- Publicar la extensión en la tienda de Chrome o de Edge — es de uso personal.

## Fuera de alcance
- Comentar sitios que no son proyectos del usuario.
- Editar el código desde la extensión.

## Impacto en el perfil
Iridium abre un puerto solo en `127.0.0.1` y acepta pedidos solo de la extensión (por su origen). La extensión lee las páginas de `localhost` y de las apps en desarrollo; no manda nada a internet. **No sube el nivel:** sigue en P2.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Extensión de revisión | La extensión de Chrome y Edge (y de las apps Electron en desarrollo) con la que se comenta la app |
| Pistas | Lo que guarda un comentario para encontrar el elemento: selector, texto visible, componentes, archivo y línea, captura |

## Preguntas abiertas para investigar
Respondidas en `investigacion.md`.
