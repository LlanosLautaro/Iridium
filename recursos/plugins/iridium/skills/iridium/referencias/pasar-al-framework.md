# Pasar al framework

Un proyecto que seguía la guía de hitos (`hitos-desarrollo-app`) tiene `docs/estado.md` pero no la línea `**Framework:**` en `docs/README.md`: es de **framework viejo**. Iridium lo marca así en la tarjeta, no le corre el control y lee sus estados con la tabla de abajo. Pasarlo al framework lo deja como uno nuevo: todo lo que se sigue en un solo lugar, con su código y su estado, y el control en cero.

Una **carpeta simple** (sin `docs/estado.md`) también se pasa: se vuelve proyecto.

## Cuándo se hace
- Cuando el usuario lo pide: **Pasar al framework** en Skills › Framework, en la tarjeta o en la carpeta abierta. Iridium manda el pedido a la conversación del proyecto.
- Nunca por tu cuenta: un proyecto con framework viejo se trabaja como está hasta que el usuario lo pida.

## Reglas del turno
1. **Primero esto, nada más.** Ni código, ni hitos, ni otra tarea. Lo que haya sin commitear de antes, no lo toques.
2. **Solo forma, no contenido.** No cambies decisiones, alcance ni código. Lo que movés, movelo entero; antes de quitar algo de un documento, fijate que esté registrado en otro.
3. **Termina cuando el control da cero.** Al terminar el turno el control te devuelve lo que quedó; corregilo.

## Los estados viejos
| Antes | Ahora |
|---|---|
| `completo`, `validado`, `aprobada`, `aprobado`, `cerrado`, `terminado` | `hecho` |
| `saltado` | `descartado` (con el motivo) |
| `reabierto` | `en curso` (el motivo, en el documento del hito) |
| `bloqueado` | `en curso` con la `Q-n` que lo frena, o `en pausa` si se frenó a propósito |
| `aprobada provisional` | `en curso` con su `Q-n` |
| `por empezar` | `pendiente` |

Un hito o paso que espera la prueba del usuario sigue `en curso` con su `Q-n`.

## Checklist

**`docs/trabajo.md`** (plantilla `plantillas/trabajo.md`)
- [ ] Se crea y recibe, cada uno como `## T-n — título` con `Estado:`, `Fecha:` (la de cuando se anotó, si se sabe) y `Origen:`:
  - las ideas (`00-idea.md` › Ideas para después, `01-exploracion.md` › Ideas del brainstorming, `07-construccion.md` › Ideas nuevas), como `nueva`;
  - los pendientes («Pendientes» de `estado.md` y de cada `estado.md` de módulo, `07-construccion.md` › Pendientes reportados, el Backlog de `10-operacion.md`), como `pendiente`, `en curso` o, si ya se hizo y no está registrado en otro lado, `hecho`;
  - lo de un módulo, con su `Frente:`.
- [ ] Esas secciones se quitan de sus documentos y dejan una línea: «Las ideas y los pendientes están en `trabajo.md`.» La prioridad del Backlog (Must, Should, Could) pasa al texto de cada `T-n`.
- [ ] Los `R-n` `anotado` apuntan a su `T-n`.

**`docs/estado.md`**
- [ ] Encabezado y secciones como `plantillas/estado.md`: sin «Pendientes»; la tabla `## Módulos` con las columnas `| Frente | Tipo | Paso | Estado |` y el estado del vocabulario (el activo, `en curso`; en espera, `pendiente`; en operación, `hecho`).
- [ ] `## Hito actual`: una línea `N — Nombre — estado`.
- [ ] Toda tabla con columna «Estado», con el vocabulario (tabla de arriba). Lo que va después de la palabra queda.
- [ ] Cada `Q-n` abierta con el formato del framework (`SKILL.md` › Las preguntas): `Tipo:` con sus palabras, `Frente:` si es de un módulo, pruebas y tareas solo con casillas (sin `Opciones:`), decisiones con su recomendada. Una prueba o un pedido escrito en otra sección pasa a una `Q-n`.
- [ ] «Próximo paso» en una línea, con su **Leer antes**.

**Los `estado.md` de los módulos**
- [ ] Como `plantillas/modulo/estado.md`: estados del vocabulario en Progreso e Iteraciones, sin «Pendientes» (a `trabajo.md`) y sin preguntas (al `estado.md` general, con `Frente:`).

**Los documentos de hito**
- [ ] Las tablas de iteraciones y de propuestas, con el vocabulario.
- [ ] Cada documento de un hito `hecho` o `en curso` termina con `## Portón` (salvo `07-construccion.md` y `10-operacion.md`, que no lo llevan); si no se puede saber si algo se cumplió, queda `- [ ]` y se dice en el resumen.
- [ ] Los dibujos en texto, sin caracteres que la letra no tiene (`SKILL.md` › Los dibujos en texto).

**`docs/respuestas/`**
- [ ] Cada archivo empieza por `# Q-n — <la pregunta tal cual>`.
- [ ] Cada respuesta de una pregunta que ya no está abierta termina con `> Procesada el AAAA-MM-DD → …`. Si no se sabe adónde fue, buscá su código en `decisiones.md` y en los documentos; si no aparece, `> Procesada el <hoy> → sin rastro (pasada al framework)`. Las respuestas nuevas sin procesar se procesan después, no ahora.

**El design system**
- [ ] Si los tokens o las piezas están en otro lado (un artifact, `docs/ui/tokens.json`, un `componentes.css`, `DESIGN.md`), pasan a `docs/diseno/` como pide `SKILL.md` › Las maquetas: `tokens.css` con cada token y su uso, `piezas.css` y `piezas.html`. Los valores no cambian. Si un script generaba el CSS, `tokens.css` pasa a ser la fuente y el código lo usa o lo copia; lo de antes se quita o queda dicho como copia. Sin pantallas todavía, el índice queda con la tabla vacía.

**`docs/README.md`**
- [ ] `**Formato de la guía:** …` pasa a `**Framework:** <hoy>`.
- [ ] El índice suma `trabajo.md` (y `revision/` si existe); la tabla «Códigos» declara los prefijos propios.

**`CLAUDE.md` de la raíz**
- [ ] Dice que el proyecto se trabaja desde Iridium con el framework (`plantillas/instrucciones-ia.md`) y deja de describir el método de la guía. Las reglas propias del proyecto se conservan; las que repiten el framework se quitan.
- [ ] Ninguna mención a la guía `hitos-desarrollo-app` ni a `gestor-proyectos` como algo que se sigue.

**Una carpeta simple**
- [ ] `docs/` con las plantillas, con el hito 0 (y lo que se pueda reconstruir de 2 y 5) completado con lo que se ve en la carpeta; lo que falta, como `Q-n`.
- [ ] `CLAUDE.md`, ficha e ícono, si faltan.

## Cierre
1. Commit solo de lo que tocaste: `docs: pasado al framework de Iridium`.
2. Respuesta corta, en términos del usuario: 3 a 6 puntos con lo que cambió para él (cuántas ideas y pendientes quedaron en Trabajo, qué pasó a `Q-n`, qué se ordenó), qué le espera en la Bandeja de entrada y el Próximo paso.
