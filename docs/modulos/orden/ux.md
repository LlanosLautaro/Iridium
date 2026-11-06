# UX del módulo: Orden

**Fecha:** 2026-11-06
**Base:** `definicion.md` (el modelo único, D-094 a D-096), `auditoria.md` › Parte 1 (A-1 a A-12) y las capturas de `tools/auditoria-ux.ts`.

El paso 4 va en dos partes: primero la **arquitectura de información** (este documento, para aprobar) y después las **pantallas** con sus wireframes y estados. Con las dos aprobadas, `04-ux.md` se reescribe entero sobre ellas, sin notas «Ajustado por…»: describe la app como queda, incluidas las secciones que hoy viven en los `ux.md` de cada módulo (esos quedan como historia de su diseño).

## Parte 1 — Arquitectura de información

### Lo que se sigue y dónde se ve
Cada una de las cuatro cosas del modelo (`definicion.md` › El modelo único) tiene **una sección que la muestra entera** y, en los demás lugares, solo su cuenta o un enlace:

| Qué | Sección que la muestra | Dónde aparece además |
|---|---|---|
| Preguntas (`Q-n`) | **Te espera** (de todos los proyectos y de cada uno) | el número del botón de inicio, la tarjeta y la pestaña; el Mapa las enlaza |
| Trabajo (`T-n`) | **Trabajo** del proyecto; las ideas nuevas de todos, en **Ideas** | el Mapa muestra lo `en curso` |
| Comentarios (`R-n`) | **Revisión** del proyecto | — |
| Decisiones (`D-n`) | **Docs** (`decisiones.md`) | como enlaces en todo el texto |

Los scripts no son algo que se sigue: son herramientas y viven solo en **Scripts** (A-3). Una pregunta que cita un script lo muestra con su botón dentro, como cualquier cita.

### El esqueleto
No cambia (`auditoria.md` › Lo que está bien): barra de íconos a la izquierda, barra de título con el botón de inicio y una pestaña por proyecto abierto, área principal, conversación a la derecha y barra de estado con la cuenta, el hito y el uso. Cambian tres cosas:

- **La conversación se achica** cuando no hay una: queda una franja angosta con su nombre y **Seguí** (en un proyecto) y se abre al tocarla o al escribir (A-6; cómo, Q-136). La conversación vacía dice en una línea qué hace **Seguí** y no repite el Próximo paso, que está en el Mapa (A-7).
- **Un patrón de cabecera para toda sección** (A-8): título y cuenta a la izquierda, acciones a la derecha, filtros debajo, siempre a la misma altura. La línea de propósito aparece solo cuando la sección está vacía. El foco del teclado entra al contenido, no al título.
- **El nombre del proyecto** sale de la ficha (`nombre`) si lo tiene, y si no, de la carpeta (A-12).

```
┌──────┬─[● Alfa · 2 ×][Beta ×]───────────────────────────────┬──[─ □ ×]┐
│ ⌂ 3! │ Título · cuenta                       [acción] [acción]│ C │
├──────┤ [filtro] [filtro] [filtro]                            │ o │
│ íconos│───────────────────────────────────────────────────────│ n │
│ de la│                                                       │ v │
│ vista│              contenido de la sección                  │ . │
│      │                                                       │   │
│  ⚙   │                                                       │[▷]│
└──────┴──────────────────── barra de estado ──────────────────┴───┘
 ⌂ 3!  el único total de lo que te espera; «!» y amarillo solo si algo frena
 Conv. la conversación plegada en una franja; se abre al tocarla
```

### Un número que manda (A-1, A-2)
- **El total** de lo que te espera está en un solo lugar: el botón de inicio, arriba a la izquierda, visible desde todas las pantallas. El ícono de Te espera de la barra no repite el número.
- **Por proyecto,** la cuenta va en su tarjeta y en su pestaña; la cabecera del proyecto no la repite.
- **Se nombra de una forma:** «3», y en el texto «3 te esperan». Desaparecen «3 preguntas», «3 sin responder» y «3 preguntas · frena».
- **El amarillo es solo para lo que frena:** una cuenta sin nada que frene es neutra; con algo que frena, amarilla y con «!» (no solo color). En Te espera, solo las preguntas que frenan llevan borde amarillo; el botón **Enviar** es el botón principal de la app, no amarillo.
- **Las preguntas en pausa** no se cuentan y se ven aparte, plegadas, al final de Te espera.

### Vista general (el botón de inicio)
Barra de íconos, en este orden (`Ctrl+1` a `Ctrl+4`):

1. **Proyectos** — la grilla. Una tarjeta por carpeta; los proyectos dicen su hito y los frentes activos, las carpetas simples dicen «carpeta» (D-095). El menú de la tarjeta suma **Pasar al marco** en las carpetas simples y en los proyectos con el marco viejo.
2. **Te espera** — las preguntas de todos los proyectos (hoy Pendientes). Una columna con los proyectos y su cuenta (primero los que tienen algo que frena) y, al elegir uno, sus preguntas con **filtros por frente** arriba («Todos 3 · Núcleo 2 · Compartir 1»), primero las que frenan; debajo, las respondidas sin procesar; al final, plegadas, las en pausa (OR-6).
3. **Ideas** — las ideas `nueva` de todos los proyectos juntas, agrupadas por proyecto, y las sueltas de `Ideas/ideas.md`. Arriba, **Anotar una idea**: un campo y a qué proyecto va (o «suelta»), sin abrir una sesión (OR-4). Una idea que pasa a `pendiente` sale de acá y sigue en el Trabajo de su proyecto. Desaparece el grupo «Integradas»: lo integrado es un `T-n` con estado.
4. **Skills** — las skills, como hoy. Su entrada deja de ser «Proyectos atrasados»: es **Marco**, con las carpetas que no lo siguen o lo siguen con una fecha vieja y **Pasar al marco** en cada una (A-9, OR-8).

Abajo, **Ajustes**, como hoy (A-11 espera a OR-12).

La conversación de la vista general es el chat general, salvo en Skills, que tiene el suyo. Las dos empiezan plegadas.

### Vista de un proyecto
Barra de íconos en dos grupos. Arriba, **lo que se sigue**; abajo, separado, **el proyecto por dentro**:

| Sección | Qué muestra | Reemplaza |
|---|---|---|
| **Te espera** | Las preguntas de este proyecto, como en la general pero sin la columna; con filtros por frente | «Pendientes y scripts», sin los scripts |
| **Mapa** | En qué está el proyecto: los hitos y, en operación, **los frentes**: el activo arriba con su paso `en curso`, su Próximo paso y su trabajo `en curso`; los `hecho` en una fila corta, «en operación» (A-5) | el Mapa de hoy, que en operación queda vacío |
| **Trabajo** | `trabajo.md`: los `T-n` con filtros por estado («Ideas · Pendiente · En curso · En pausa · Hecho») y por frente; **Anotar una idea** arriba | «Ideas del proyecto» |
| **Revisión** | Los comentarios `R-n`, como hoy | — |
| **Docs** (abajo, separado) | Los documentos, con tablas que usan el ancho (A-10) | — |
| **Archivos** | El árbol del proyecto, como hoy | — |
| **Git** | Como hoy | — |
| **Scripts** | Un botón por script, con su descripción; el único lugar de los scripts | la lista corta de «Pendientes y scripts» |

Abajo, **Ajustes del proyecto**, como hoy.

- **Se entra** a Te espera si hay algo sin responder y, si no, al Mapa: lo primero que se ve es lo que hay que hacer.
- **Una carpeta simple** (D-095) muestra solo el segundo grupo y la conversación; en el lugar del primero, un recuadro: «Esta carpeta no sigue el marco» con **Pasar al marco**.
- **La cabecera** del proyecto (ícono, nombre, hito) no repite la cuenta: la tiene la pestaña.

### Cómo se va de un lado a otro
- Botón de inicio → la vista general, en la última sección elegida.
- Tarjeta → el proyecto. Pestaña → el proyecto, como se lo dejó.
- Te espera general → **Abrir** → el proyecto, en su Te espera.
- Mapa → una pregunta de «Te espera» → la sección Te espera, en esa pregunta; un trabajo `en curso` → Trabajo, en ese ítem; un frente → su `estado.md` en Docs.
- Ideas (general) → una idea → el Trabajo de su proyecto, en ese ítem.
- Un código en cualquier texto → donde nace: `Q-n` a Te espera, `T-n` a Trabajo, `R-n` a Revisión, el resto a Docs.
- Aviso de una sesión que terminó → **Responder** (Te espera, en ese proyecto) o **Abrir**.
- Cambiar de sección o de proyecto no corta ni recarga nada (H-6, sin cambios).

### Lo que cambia de nombre
| Hoy | Queda | Por qué |
|---|---|---|
| Pendientes | **Te espera** (Q-137) | «pendiente» pasa a ser un estado del trabajo de la IA; el Mapa ya dice «Te espera» |
| Pendientes y scripts | **Te espera** | los scripts van solo en Scripts |
| Ideas del proyecto | **Trabajo** | D-094 |
| Proyectos atrasados (Skills) | **Marco** | D-092; «atrasado» es una forma de no seguir el marco |
| Poner al día | **Pasar al marco** | `definicion.md` › Pasar al marco |

### Cómo queda cada hallazgo
| Hallazgo | Cómo se resuelve |
|---|---|
| A-1 El mismo número cuatro veces | Un total en el botón de inicio; por proyecto, tarjeta y pestaña |
| A-2 Todo amarillo | Amarillo y «!» solo para lo que frena |
| A-3 Scripts en dos lugares | Solo en Scripts; Te espera sin scripts |
| A-4 Las ideas en tres lugares | Trabajo por proyecto, Ideas para las nuevas de todos; anotar sin la IA |
| A-5 El Mapa en operación | Los frentes con su paso en curso, su Próximo paso y su trabajo en curso |
| A-6 La conversación ocupa un tercio | Se pliega en una franja (Q-136) |
| A-7 La conversación vacía repite el Próximo paso | Una línea con qué hace Seguí |
| A-8 Cada sección distinta | Un patrón de cabecera |
| A-9 Skills alrededor de la guía | La entrada es Marco, con Pasar al marco |
| A-10 Tablas angostas | Las tablas de Docs usan el ancho (en las pantallas) |
| A-11 Ajustes casi vacío | Sin cambios ahora: OR-12, cuando llegue el respaldo |
| A-12 El nombre es el de la carpeta | `nombre` en la ficha |

## Parte 2 — Pantallas
(Pendiente: con la Parte 1 aprobada. Los wireframes y los estados de la grilla, Te espera, Ideas, Skills › Marco, el Mapa en operación, Trabajo y la conversación plegada.)
