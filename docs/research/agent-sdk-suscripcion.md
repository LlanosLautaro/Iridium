# Agent SDK con la suscripción: sesiones, estados, permisos y uso

**Fecha:** 2026-10-22 · **Versiones probadas:** Agent SDK de TypeScript 0.3.309 (trae su propio Claude Code), Node 24.13 · **Spike:** S-1 (`spikes/S-1-sdk-suscripcion/`, salida en `salida.txt`)

Responde las tres primeras preguntas del MVP (`02-definicion.md` › Preguntas abiertas para el hito 3). Notas propias con enlaces; no se copió documentación.

## 1. ¿La suscripción sirve para una app propia, con varias sesiones a la vez?

**Sí, para uso personal.** Probado en la PC del usuario.

- La ayuda de Anthropic (última novedad del 07-10-2026) dice que el Agent SDK, `claude -p` y las apps de terceros **siguen usando los límites de la suscripción**. Un cambio anunciado para el SDK quedó en pausa el 15-06-2026. Los planes Max y Team suman además créditos mensuales de API, que también sirven para el SDK.
- El SDK es Claude Code como biblioteca: usa el mismo inicio de sesión que la CLI y VS Code (`%USERPROFILE%\.claude\.credentials.json`). Sin clave de API en el entorno, usa la suscripción. En el spike, la sesión arrancó con `apiKeySource=none`, y `/usage` respondió "You are currently using your subscription".
- **Límite de la política:** la documentación del SDK aclara que Anthropic no permite que un desarrollador *ofrezca a otros* el inicio de sesión de claude.ai en su producto. Para el Centro, que es personal (P2), no aplica. Si algún día se distribuye, cada usuario tendría que poner su clave de API.
- **Varias sesiones:** no hay un tope publicado de sesiones en paralelo. En el spike, dos sesiones en dos carpetas corrieron a la vez sin problema, cada una con su permiso pendiente al mismo tiempo.
- **Límites compartidos:** todas las sesiones (y las de VS Code, la CLI y Desktop) gastan la misma ventana de 5 horas y el mismo tope semanal. Varios proyectos trabajando a la vez la gastan más rápido.
- **Cuidado:** si `ANTHROPIC_API_KEY` está en el entorno, Claude Code la usa antes que la suscripción. El Centro tiene que verificar al arrancar que usa la suscripción (`apiKeySource`) y avisar si no.

## 2. ¿Cómo se ve lo que hace cada sesión y cómo se le dan los permisos?

**Estado de la sesión.** Con la variable `CLAUDE_CODE_EMIT_SESSION_STATE_EVENTS=1`, el SDK avisa tres estados, que son justo los que pide D-015 para la vista general:

| Estado del SDK | En el Centro |
|---|---|
| `running` | trabajando |
| `requires_action` | esperando al usuario (un permiso o una pregunta) |
| `idle` | terminó, espera el próximo mensaje |

Además llegan, mientras trabaja: el texto de la IA, cada herramienta que usa, el progreso de subagentes y tareas en segundo plano, reintentos por errores de la API y el resultado de cada turno (con su costo equivalente en API, a modo informativo).

**Permisos.** Cada vez que la IA quiere hacer algo que no está aprobado de antemano, el SDK llama a la app con el nombre de la herramienta y lo que quiere hacer (por ejemplo, el comando o el archivo y su contenido). La app responde:
- permitir (tal cual, o con cambios),
- permitir y recordar (escribe la regla en `.claude/settings.local.json` del proyecto, como hace VS Code),
- rechazar con un mensaje, que la IA lee y usa para cambiar de enfoque.

La respuesta **puede esperar todo lo que haga falta**: la sesión queda en pausa en `requires_action` hasta que el usuario conteste. Si el Centro se cierra con un permiso pendiente, la sesión se retoma después (punto 3).

**Preguntas de la IA.** Cuando la IA pregunta con opciones (la herramienta `AskUserQuestion`, la misma que en VS Code), llegan por el mismo camino: de 1 a 4 preguntas, de 2 a 4 opciones cada una, con texto libre posible. Opcionalmente, con una vista previa en HTML o markdown por opción. El Centro las puede mostrar como tarjetas propias.

**Modos de permiso** iguales a los de Claude Code: `default` (pregunta), `acceptEdits` (acepta ediciones), `plan`, `auto` (un clasificador decide), `bypassPermissions` y `dontAsk`. Se cambian en medio de la sesión. Las reglas de `.claude/settings.json` de cada proyecto se respetan si se cargan las configuraciones del proyecto.

## 3. ¿Cómo se retoma un proyecto que ya tenía conversación y qué se guarda?

- Cada sesión se guarda como un archivo `.jsonl` en `%USERPROFILE%\.claude\projects\<carpeta del proyecto codificada>\`: el pedido, cada herramienta usada, cada resultado y cada respuesta. **Es el mismo lugar que usan la CLI y VS Code.**
- El SDK lista las sesiones de una carpeta (`listSessions`: identificador, título, primer mensaje, rama de git, fechas) y lee sus mensajes. En el spike, listó las conversaciones de este proyecto hechas en VS Code, incluida esta.
- Retomar por identificador (`resume`) devuelve todo el contexto: en el spike, la sesión retomada recordó qué archivo había creado. También se puede seguir la más reciente (`continue`) o bifurcar una conversación (`fork`).
- Se guarda la **conversación**, no los archivos: para deshacer cambios en archivos hay puntos de control aparte (`enableFileCheckpointing`).
- Las sesiones se pueden renombrar y etiquetar desde el SDK.

**Consecuencia para el Centro:** puede mostrar y retomar las conversaciones que el usuario empezó en VS Code, y al revés. Riesgo a resolver en el hito 5: que la misma sesión quede abierta a la vez en el Centro y en VS Code (dos procesos escribiendo el mismo historial).

## 4. Mostrar el uso de la suscripción (C-7)

- En cada respuesta llega un aviso de límites (`rate_limit_event`) con el porcentaje usado de la ventana de 5 horas y de la semana, y cuándo se reinicia cada una. En el spike: 6–7 % de la ventana de 5 horas y 19 % de la semana.
- Si se agota, el aviso dice `rejected`; si la suscripción se quedó sin uso incluido, `credits_required`.
- `/usage` mandado como mensaje responde el resumen completo sin gastar uso del modelo.

## Fuentes
- [Agent SDK con el plan de Claude (ayuda de Anthropic, novedad del 07-10-2026)](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)
- [Agent SDK: introducción, política de inicio de sesión y licencia](https://code.claude.com/docs/en/agent-sdk/overview)
- [Agent SDK: sesiones](https://code.claude.com/docs/en/agent-sdk/sessions)
- [Agent SDK: permisos](https://code.claude.com/docs/en/agent-sdk/permissions)
- [Agent SDK: aprobaciones y preguntas al usuario](https://code.claude.com/docs/en/agent-sdk/user-input)
- [Agent SDK: referencia de TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript) (`SDKSessionStateChangedMessage`, `SDKRateLimitEvent`, `listSessions`)
- [Claude Code: autenticación y orden de credenciales](https://code.claude.com/docs/en/authentication)
- Sesiones en paralelo y límites (fuentes de terceros, sin tope oficial): [MindStudio](https://www.mindstudio.ai/blog/claude-code-usage-limits-parallel-sessions) · [ClaudeLog](https://claudelog.com/claude-code-limits/)
