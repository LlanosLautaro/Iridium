# Definición del módulo: Orden

**Fecha:** 2026-11-06
**Base:** `propuesta.md`, `auditoria.md` (A-1 a A-23 y sus dos «Lo que dice…»), D-091 a D-096.

## Objetivo del módulo
Que todo lo que se sigue en un proyecto tenga **un lugar, un código, un frente y un estado**, escrito con **una sola regla** que Iridium lee y **controla**, y que la app se ordene sobre ese modelo. Al terminar, el usuario ve en un solo número lo que espera de él, sabe de qué frente es cada cosa, anota ideas sin la IA, y la IA no puede dejar una pregunta mal escrita sin que Iridium se lo devuelva.

## El modelo único
Lo que se sigue en un proyecto son cuatro cosas. Cada una vive en **un solo lugar** que no cambia con el hito:

| Qué | Código | Dónde vive | Quién lo escribe | Estados |
|---|---|---|---|---|
| **Pregunta** (lo que espera del usuario: decisión, consulta, prueba, tarea, formulario) | `Q-n` | `estado.md` › Preguntas abiertas; la respuesta en `respuestas/Q-n.md` | la IA; el usuario responde con el formulario | abierta · en pausa · respondida · procesada |
| **Trabajo** (ideas y pendientes de la IA: lo que se podría hacer y lo que se va a hacer) | `T-n` | `docs/trabajo.md` | la IA; el usuario anota ideas desde Iridium sin abrir una sesión | nueva · pendiente · en curso · en pausa · hecho · descartado |
| **Comentario** de la Revisión | `R-n` | `revision/R-n.md` | el usuario (F8); la IA lo procesa | nuevo · hecho · → `T-n` (pasó a trabajo) |
| **Decisión** | `D-n` | `decisiones.md` | la IA, con lo que decidió el usuario | vigente · reemplazada |

Las ideas y los pendientes van en una sola lista (D-094): una idea aceptada cambia de estado, no de archivo.

- **El frente** es un dato de cada cosa, no un lugar: una línea `Frente: Compartir` en la pregunta o en el trabajo; sin esa línea, es del núcleo. Así Pendientes puede agrupar y filtrar por frente (D-091.5) y las `Q-n` siguen en un solo `estado.md`. Los frentes terminados siguen existiendo **en operación** y reciben su trabajo.
- **Las preguntas en pausa:** `Tipo: consulta · en pausa`. Iridium las muestra aparte y no las cuenta (A-15).
- **Una respuesta procesada** lleva siempre su línea `> Procesada el AAAA-MM-DD → D-n` (o `T-n`, o adónde fue). El control marca las que no la tienen aunque su pregunta ya haya salido (A-17).
- **Del trabajo, el `estado.md` ya no lleva lista propia:** su Pendientes y el Backlog de `10-operacion.md` pasan a ser vistas de `trabajo.md` (lo `pendiente` y `en curso`). Se terminan las listas repetidas (A-19) y los lugares de ideas que cambian con el hito (A-18): «Ideas para después», «Ideas nuevas», «Pendientes reportados», «Ideas del brainstorming».
- **Una idea de la carpeta Ideas que toca a un proyecto** pasa a su `trabajo.md` con `Origen:`; en `Ideas/ideas.md` quedan las sueltas y la línea `→ Alfa, T-n`.

Un ítem de `trabajo.md`:

```markdown
## T-12 — Pendientes agrupados por frente
Estado: pendiente · Frente: Orden · Fecha: 2026-11-05 · Origen: D-091
Con filtros arriba («Todos · Núcleo · Compartir…» con su cuenta), no una pestaña por frente.
```

## Un vocabulario de estados
Las mismas palabras para hitos, pasos de un frente, iteraciones, frentes y trabajo (A-21). Iridium acepta las dos formas de género (hecho/hecha) como una sola:

| Estado | Quiere decir |
|---|---|
| `pendiente` | no empezó (un frente pendiente es uno en espera) |
| `en curso` | se está haciendo; un hito o paso que se reabre vuelve a `en curso` y el motivo va a su documento |
| `en pausa` | empezado y frenado a propósito |
| `hecho` | terminado; lo que espera la prueba del usuario sigue `en curso` con su `Q-n` |
| `descartado` | no se hace (un hito que se salta, una idea que no va), con el motivo |
| `nueva` | solo en el trabajo: una idea sin evaluar |

Desaparecen `completo`, `saltado`, `reabierto`, `bloqueado`, `aprobada provisional`, `validado`, `aprobada` y los sinónimos que el Mapa aceptaba sin que estuvieran escritos («cerrado», «terminado», «por empezar»). Un frente `hecho` se muestra como «en operación». El Mapa lee solo estas palabras, y el chip de un frente muestra el paso `en curso` (A-5).

## El framework único (D-092, D-093)
- **Una fuente:** la skill de Iridium (`recursos/plugins/iridium`) pasa a ser el framework entero: el método por hitos y frentes, los formatos que Iridium lee y la ficha. La guía `hitos-desarrollo-app` y `gestor-proyectos` dejan de cargarse; se eliminan en el chat de Skills cuando el framework funcione.
- **Liviano:** `SKILL.md` con lo de cada sesión (dónde estás, el modelo, los formatos, el cierre); una referencia por hito y por tipo de trabajo (módulo, operación, ronda de UX) que se lee cuando toca; las plantillas al lado.
- **Cada formato se escribe una vez.** Lo que hoy repiten la guía y la skill con otras palabras (A-22) queda en un solo párrafo.
- **Da por hecho Iridium** (D-093): no explica cómo trabajar sin la app; cita Pendientes, Scripts y el control.
- **Ronda de UX:** el framework la pide en operación, para que la app no vuelva a crecer a parches (D-091): al terminar cada frente y cada cinco comentarios de la Revisión juntados (D-096). El control avisa cuando toca.
- **Los proyectos dicen que se trabajan desde Iridium:** el `CLAUDE.md` de cada proyecto y las instrucciones globales dejan de describir el método y citan el framework. `docs/README.md` cambia `**Formato de la guía:**` por `**Framework:** AAAA-MM-DD`.

## El control
- **Vive en Iridium y lee con el mismo código** que la pantalla (no una copia, A-16). Reemplaza el hook `comprobar-preguntas.mjs` de la carpeta de Claude, que se saca.
- **Revisa reglas, no solo si se puede leer:**
  - todo lo que está en Preguntas abiertas empieza con `**Q-n — título**` (nada de preguntas sueltas ni títulos `### Q-n`, A-14, A-15);
  - `Tipo:` está y lleva solo sus palabras; `Frente:`, si está, nombra un frente que existe;
  - pruebas y tareas, con casillas y sin `Opciones:`; decisiones, con `Opciones:` en su línea y una recomendada (A-13);
  - ninguna prueba o pedido al usuario fuera de Preguntas abiertas (secciones como «Verificación manual…» o «Pruebas manuales pendientes», A-14);
  - cada respuesta de una pregunta que ya salió tiene su línea «Procesada» (A-17);
  - `trabajo.md`: cada ítem con código, `Estado:` del vocabulario y `Frente:` válido; ningún código repetido;
  - las tablas de estados usan solo el vocabulario;
  - `estado.md` tiene sus campos (fecha, hito actual, Próximo paso de una línea);
  - los dibujos en texto (bloques de código con líneas de cuadro) usan solo caracteres que tiene la letra de ancho fijo de Iridium; uno de afuera desarma el cuadro (R-13).
- **Al terminar cada turno** de una sesión de proyecto, si el control encuentra algo, Iridium se lo devuelve a la IA en un mensaje (una vez por turno, para no entrar en un ciclo) y la IA lo corrige. Lo que quede sin corregir se ve en la tarjeta del proyecto.
- **Cada error nuevo** que llegue mal se arregla en la regla del framework y en el control, nunca suelto.

## Pasar al framework (A-9, A-23)
- «Poner al día» de Skills se vuelve **Pasar al framework**: una pasada guiada por proyecto que mueve las ideas y pendientes a `trabajo.md`, cambia los estados al vocabulario, arregla lo que marque el control y pone la fecha del framework. Termina con el control en cero.
- Iridium es el primero, al construir. Los demás proyectos se pasan cuando el usuario los abra o lo pida; antes no se tocan.
- **Proyecto o carpeta simple (D-095):** una carpeta con `docs/estado.md` es un proyecto y sigue el framework. Una sin él es una carpeta simple: tarjeta, Archivos, Git, Scripts (si tiene `scripts.md`) y la conversación, sin Mapa, Trabajo ni preguntas, y el control no corre sobre ella. **Pasar al framework** la vuelve proyecto cuando el usuario quiera.

## Criterios de éxito
- Ningún formato está escrito en dos lugares: una regla, en el framework; un lector, en Iridium.
- El control corre sobre Iridium y sobre cada proyecto pasado al framework y no marca nada; sobre los casos de la auditoría (pruebas con opciones, preguntas sueltas, `### Q-n`, respuestas sin rastro) marca cada uno.
- Una pregunta mal escrita en una sesión llega corregida al final del turno, sin que el usuario la vea mal.
- Cada idea y pendiente de un proyecto está en un solo lugar, con código y estado; nada «hecho» aparece entre lo pendiente.
- El usuario anota una idea desde Iridium sin abrir una sesión, y ve las de todos los proyectos juntas.
- Pendientes muestra un número que manda y se filtra por frente; Q-126 aparece en Compartir.
- El Mapa de un proyecto en operación dice en qué está cada frente.
- `04-ux.md` describe la app tal como es, sin capas, y los A-1 a A-12 están resueltos o anotados con motivo.

## Funcionalidades
### Must (MVP del módulo)
- **OR-1** El framework único en `recursos/plugins/iridium`: `SKILL.md`, referencias y plantillas; deja de cargarse la guía aparte (D-086 en esa parte).
- **OR-2** El control: las reglas de arriba con el lector de Iridium, devuelto a la IA al terminar el turno, visible en la tarjeta; se saca el hook viejo.
- **OR-3** Preguntas con `Frente:` y `en pausa`; respuestas con rastro.
- **OR-4** `trabajo.md`: el lector, la sección del proyecto que lo muestra (reemplaza Ideas del proyecto), anotar una idea sin la IA y la vista de todas juntas.
- **OR-5** Un vocabulario de estados, que es el único que lee el Mapa; el chip del frente muestra el paso en curso (A-5).
- **OR-6** Pendientes agrupados por frente, con filtros y su cuenta (D-091.5).
- **OR-7** La UX rehecha: `04-ux.md` sin capas, primero la arquitectura de información y después las pantallas, resolviendo A-1 a A-8 (un número que manda, el amarillo solo para lo que frena, Scripts en un lugar, el Mapa en operación, la conversación que se achica, una cabecera de sección).
- **OR-8** Pasar al framework desde Skills, desde la tarjeta y desde una carpeta simple abierta (D-095), y este proyecto pasado al framework.
- **OR-9** La ronda de UX en el framework.

### Should
- **OR-10** Un nombre visible en la ficha (`nombre`), para que este proyecto se vea como Iridium y no como su carpeta (A-12).
- **OR-11** Docs: tablas que usan el ancho (A-10).

### Could
- **OR-12** Repensar qué va en Ajustes cuando lleguen el respaldo (D-087) y lo que salga del framework (A-11).

### Won't (por ahora)
- Un framework para trabajar fuera de Iridium — D-093.
- Pasar los otros proyectos al framework sin que el usuario los abra o lo pida — no se tocan desde acá (CLAUDE.md, A-23).
- Funciones nuevas que no salgan de la auditoría — D-091.2; esperan en `trabajo.md`.

## Fuera de alcance
- El módulo Diseño y Capacidades (D-091.3).
- Borrar las skills viejas y poner al día las instrucciones globales: se hace en el chat de Skills cuando el framework funcione (D-092.4).

## Impacto en el perfil
Sin cambios: P2. No hay datos nuevos ni contenido de terceros. El control lee archivos del proyecto que Iridium ya lee. Lo único que cambia es que, cuando el control encuentra algo, Iridium manda un mensaje más a la IA en la misma sesión: gasta un poco de uso, solo cuando hubo un error.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Framework | Las reglas para trabajar un proyecto desde Iridium: el método, los formatos y la ficha; reemplaza la guía de hitos (D-092) |
| Control | Lo que Iridium revisa de los archivos de un proyecto contra el framework; le devuelve a la IA lo mal escrito |
| Trabajo | Las ideas y los pendientes de la IA de un proyecto, con código `T-n`, en `docs/trabajo.md` |
| En operación | Un frente terminado que sigue recibiendo trabajo |
| Ronda de UX | Una revisión de toda la interfaz al terminar un frente o cada cinco comentarios de la Revisión, para que no crezca a parches (D-096) |
| Carpeta simple | Una carpeta de la grilla sin `docs/estado.md`: se ve y se conversa, pero no sigue el framework (D-095) |
| Pasar al framework | La pasada que pone un proyecto en el formato del framework; reemplaza «Poner al día» |

## Preguntas abiertas para investigar
Para el diseño técnico (paso 5):
- Cómo sabe Iridium que terminó un turno y cómo le manda la corrección a la IA sin que se mezcle con lo que el usuario escribe.
- Cómo se lee `trabajo.md` sin romper Docs, el Mapa y los códigos (`T-n` nace en un título).
- Cómo escribe Iridium una idea en `trabajo.md` mientras una sesión puede estar escribiendo el mismo archivo.
- Qué se hace con los 34 archivos de `respuestas/` de este proyecto sin línea «Procesada»: se revisan una vez al pasar al framework.
