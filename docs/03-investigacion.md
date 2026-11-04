# Investigación de dominio y recursos

**Fecha:** 2026-10-22

Parte de `02-definicion.md` › Preguntas abiertas para el hito 3. Primero las del MVP; las de después del MVP se investigan antes de abrir cada módulo.

## Preguntas y respuestas
| Pregunta (del hito 2) | Respuesta | Fuente | Estado |
|---|---|---|---|
| ¿La suscripción permite el Agent SDK desde una app propia, y varias sesiones a la vez (D-015)? ¿Cómo se comparten los límites? | Sí, para uso personal: el SDK usa el inicio de sesión de Claude Code y los límites de la suscripción. Dos sesiones corrieron a la vez sin problema. Todas comparten la ventana de 5 horas y el tope semanal, y el SDK informa los dos porcentajes. Distribuirla a otros pediría clave de API | `research/agent-sdk-suscripcion.md` › 1 y 4; S-1 | respondida |
| ¿Cómo se ve lo que hace una sesión y cómo se le pasan los permisos (C-5, C-50)? | Tres estados (trabajando, esperando al usuario, terminada). Los permisos y las preguntas con opciones llegan a la app, que responde permitir, permitir y recordar o rechazar con un mensaje; la sesión espera sin límite de tiempo | `research/agent-sdk-suscripcion.md` › 2; S-1 | respondida |
| ¿Cómo retoma una sesión un proyecto que ya tenía conversación, y qué se guarda? | Se guarda la conversación completa en la misma carpeta que usan la CLI y VS Code; el SDK la lista y la retoma con todo el contexto. Los archivos no se guardan con la conversación | `research/agent-sdk-suscripcion.md` › 3; S-1 | respondida |
| Formato de la documentación: qué escribe la guía para que el Centro lea pasos de hitos (D-008), tipo y si frena de cada `Q-n`, pruebas como listas (D-010) | Casi todo ya se lee. Se suman: el portón como lista en cada documento de hito, palabras fijas de estado, una línea `Tipo:` (con `frena`) en cada `Q-n` y las pruebas con casillas. Compatible con el visor del Gestor, probado con su lector | `research/formato-documentacion.md`; D-019 | respondida |
| Qué del código del Gestor se puede llevar al Centro y qué condiciona en la tecnología (D-017) | Casi todo menos lo que habla con VS Code (4 archivos): los lectores de `estado.md`, `Q-n`, respuestas, códigos y markdown, el acceso al disco y sus 217 pruebas. Pesa a favor de TypeScript + React en el hito 5 | `research/codigo-gestor.md` | respondida |
| Después del MVP: puente (D-005), diseño (D-011), revisión de la app (D-012), alternativas si cambia la política (D-006, D-007), canvas | Se investigan antes de abrir cada módulo o cuando haga falta; no condicionan el MVP | `02-definicion.md` › Preguntas abiertas para el hito 3 | postergadas |

## Conocimiento del dominio
### Agent SDK y la suscripción
El Agent SDK es Claude Code usado como biblioteca: mismas herramientas, skills, `CLAUDE.md`, permisos y sesiones que en VS Code, pero la interfaz la pone la app. Con la suscripción del usuario funciona sin clave de API. Lo que el Centro necesita para el MVP (varias sesiones, su estado, los permisos, retomar y mostrar el uso) está todo disponible y probado. Detalle en `research/agent-sdk-suscripcion.md`.

### Formato de la documentación
Casi todo lo que necesitan el mapa y la bandeja ya se escribe igual en todos los proyectos. Se suman el portón como lista, palabras fijas de estado, la línea `Tipo:` en las `Q-n` y las pruebas con casillas (D-019), compatible con el visor del Gestor. Detalle en `research/formato-documentacion.md`.

### Código del Gestor
El Gestor ya resuelve leer y escribir el formato de la guía, con pruebas. El Centro lo copia y lo amplía. Detalle en `research/codigo-gestor.md`.

## Recursos reutilizables
| Recurso | Qué resuelve | Licencia | Actividad | Uso decidido |
|---|---|---|---|---|
| Agent SDK de Claude (TypeScript `@anthropic-ai/claude-agent-sdk`; también Python) | El motor de la IA: sesiones, herramientas, permisos, estados, uso | Términos comerciales de Anthropic (no es código abierto) | Muy activo: versiones casi a diario (probada la 0.3.309) | Dependencia, aislada en un solo lugar de la app (D-007). El lenguaje se decide en el hito 5 |
| Código del gestor anterior (`core/`, `infra/`, `app/` y sus pruebas) | Leer `docs/` de la guía, `.proyecto.json` y la carpeta de proyectos; escribir respuestas | Propio del usuario | Mantenimiento (D-013); 1.2.0 | Se copia y se amplía (D-019); detalle en `research/codigo-gestor.md` |
| markdown-it | Markdown a HTML seguro | MIT | Activa | Dependencia, como en el Gestor |

## Versiones soportadas
- Agent SDK: la vigente al construir. Cambia seguido; conviene fijar la versión y actualizarla a propósito, no sola.

## Muestras para pruebas
- Los propios proyectos de `la carpeta de proyectos\` y sus conversaciones guardadas sirven de casos reales (sesiones de VS Code, `docs/` con `Q-n`).

## Spikes realizados
| ID | Pregunta | Resultado | Ubicación |
|---|---|---|---|
| S-1 | ¿El Agent SDK funciona con la suscripción en esta PC, con dos sesiones a la vez, sus estados, permisos, retomar y uso? | Sí en todo. Dos sesiones pidieron permiso al mismo tiempo y siguieron al concederlo; la retomada recordó lo anterior; listó las conversaciones de VS Code; informó 7 % de la ventana de 5 horas y 19 % de la semana. Costo del spike: menos del 1 % de la ventana | `spikes/S-1-sdk-suscripcion/` (salida en `salida.txt`) |

## Impacto en la definición
- Formato de `docs/` (D-019): los cambios van a la guía, en `Skills`, junto con los de D-009 y D-010.
- Ninguno en contra: lo del MVP es factible como se definió.
- A favor: el Centro puede mostrar y retomar las conversaciones empezadas en VS Code (y al revés), sin pasos extra. Va al hito 4 (cómo se presenta) y al 5 (evitar que una misma sesión quede abierta en los dos lados a la vez).

## Riesgos aceptados
- La política de la suscripción con el SDK cambió varias veces en 2026 y puede volver a cambiar (`01-exploracion.md` › Riesgos iniciales). Mitigación ya prevista: el SDK queda aislado (D-007).

## Portón
- [x] Cada pregunta abierta del hito 2 tiene respuesta o está marcada como riesgo aceptado (las del MVP; las de después del MVP se investigan antes de cada módulo).
- [x] Inventario de recursos con licencia y decisión de uso.
- [x] Notas en `docs/research/` con fuentes, fecha y versión.
- [x] Muestras de prueba disponibles o documentado cómo obtenerlas.
- [x] Ajustes a la definición aplicados y registrados (si los hubo).

