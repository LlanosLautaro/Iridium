# Investigación del módulo: Revisión de la app

**Fecha:** 2026-10-28

Detalle y fuentes en `research/revision-extension.md`; la prueba es S-3 (`spikes/S-3-revision/`).

## Preguntas y respuestas
| Pregunta (de D-012 y la propuesta) | Respuesta | Fuente | Estado |
|---|---|---|---|
| ¿Cómo le habla la extensión a Iridium? | El service worker de la extensión manda el comentario a Iridium en `127.0.0.1`; llega con el origen de la extensión, que Iridium puede exigir. No hace falta mensajería nativa | S-3 en Edge y Electron | respondida |
| ¿Qué marca de archivo y línea deja cada framework? | React 19 deja la pila de dónde se escribió cada elemento; con el mapa de fuentes de Vite da archivo, línea y columna exactos (S-3: `Tarjeta.jsx`, línea 6). Vue, Svelte y otros: con code-inspector (MIT), si algún proyecto los usa | S-3; React, code-inspector | respondida para React; el resto, *Should* |
| ¿Cómo se toma la captura recortada? | En Chrome y Edge, la extensión captura la pestaña y recorta. En Electron esa función no existe: la toma la app con `capturePage`, que sí recorta | S-3 | respondida |
| ¿Cómo llega «enviar ahora» a la sesión? | Por el motor de Iridium (`enviar`), a la sesión abierta del proyecto; si está trabajando, se suma al turno | `05-arquitectura.md` › Componentes | respondida |
| ¿Qué proyecto corresponde a cada dirección? (C-39) | En Electron, la app lo dice. En la web, Iridium mira qué proceso atiende el puerto y su ruta (comprobado); si no alcanza, busca el archivo entre los proyectos; lo recuerda; como último recurso, pregunta una vez | S-3 y prueba en Windows | respondida |
| ¿Cómo carga la extensión una app Electron? (Q-67) | Una línea en el proceso principal, solo en modo desarrollo: carga la extensión descomprimida en cada arranque | S-3 en Electron 44 | respondida |
| ¿Qué funciones de extensión le faltan a Electron? (Q-67) | La captura de la pestaña; lo demás que se usa anda (los dos mundos, el service worker, el envío) | S-3; documentación de Electron | respondida |

## Conocimiento del dominio
### La extensión
Tres piezas de Manifest V3: el selector en un mundo aislado, un script chico en el mundo de la página para leer lo que deja React, y el service worker que captura y envía. Se instala descomprimida en modo desarrollador.

### Archivo y línea
React 19 ya no trae el dato directo (`_debugSource`), pero la pila que deja en modo desarrollo, cruzada con el mapa de fuentes que sirve Vite, lo da exacto. Lo resuelve Iridium, no la extensión.

### Electron
La misma extensión anda en Electron 44. La pieza que la carga en modo desarrollo también hace la captura y dice el proyecto.

## Recursos reutilizables
| Recurso | Qué resuelve | Licencia | Actividad | Uso decidido |
|---|---|---|---|---|
| `@jridgewell/trace-mapping` | Leer mapas de fuentes | MIT | activa (ya viene con Vite) | Dependencia de Iridium para resolver archivo y línea |
| bippy | Leer las fibras de React, con más casos | MIT | activa | Referencia; no hace falta como dependencia |
| React Grab | Del elemento al archivo y la línea en React | MIT | activa | Referencia |
| code-inspector | Archivo y línea en Vue, Svelte, Solid y otros | MIT | activa | Para después (*Should*) |
| Agentation, stagewise | Comentar elementos | PolyForm Shield, AGPL | activas | Solo ideas (D-012) |

## Versiones soportadas
- Chrome y Edge actuales (Manifest V3); Electron 35 o más nuevo (los proyectos del usuario usan 44).
- React 19 con Vite en modo desarrollo. Sin React, o sin mapa de fuentes: sin archivo y línea, con las demás pistas.

## Muestras para pruebas
- La app de `spikes/S-3-revision/app/`; para las pruebas del módulo, una app de prueba propia dentro de sus pruebas.

## Spikes realizados
| ID | Pregunta | Resultado | Ubicación |
|---|---|---|---|
| S-3 | ¿La misma extensión anda en Edge y en Electron 44? ¿Le habla a `127.0.0.1`? ¿Da archivo y línea con React 19? ¿Captura? | Sí en todo, salvo la captura en Electron, que la hace la app con `capturePage` | `spikes/S-3-revision/` |

## Impacto en la definición
- Q-67 queda con la opción A (D-047): web y Electron desde el principio. Lo único distinto en Electron es la captura, y lo resuelve la misma línea que carga la extensión.
- Ningún *Must* resultó inviable.

## Riesgos aceptados
- La pila de React es interna y puede cambiar; sin ella, el comentario conserva el resto de las pistas.
- Edge puede avisar al abrir que hay una extensión en modo desarrollador.
