# UX del módulo: Orden

**Fecha:** 2026-11-06
**Base:** `definicion.md` (el modelo único, D-094 a D-096), `auditoria.md` › Parte 1 (A-1 a A-12) y las capturas de `tools/auditoria-ux.ts`.

El paso 4 va en dos partes: primero la **arquitectura de información** (aprobada en Q-138, con Q-136 y Q-137: D-097 y D-098) y después las **pantallas** con sus wireframes y estados. Con las dos aprobadas, `04-ux.md` se reescribe entero sobre ellas, sin notas «Ajustado por…»: describe la app como queda, incluidas las secciones que hoy viven en los `ux.md` de cada módulo (esos quedan como historia de su diseño).

## Parte 1 — Arquitectura de información

### Lo que se sigue y dónde se ve
Cada una de las cuatro cosas del modelo (`definicion.md` › El modelo único) tiene **una sección que la muestra entera** y, en los demás lugares, solo su cuenta o un enlace:

| Qué | Sección que la muestra | Dónde aparece además |
|---|---|---|
| Preguntas (`Q-n`) | **Bandeja de entrada** (de todos los proyectos y de cada uno) | el número del botón de inicio, la tarjeta y la pestaña; el Mapa las enlaza |
| Trabajo (`T-n`) | **Trabajo** del proyecto; las ideas nuevas de todos, en **Ideas** | el Mapa muestra lo `en curso` |
| Comentarios (`R-n`) | **Revisión** del proyecto | — |
| Decisiones (`D-n`) | **Docs** (`decisiones.md`) | como enlaces en todo el texto |

Los scripts no son algo que se sigue: son herramientas y viven solo en **Scripts** (A-3). Una pregunta que cita un script lo muestra con su botón dentro, como cualquier cita.

### El esqueleto
No cambia (`auditoria.md` › Lo que está bien): barra de íconos a la izquierda, barra de título con el botón de inicio y una pestaña por proyecto abierto, área principal, conversación a la derecha y barra de estado con la cuenta, el hito y el uso. Cambian tres cosas:

- **La conversación queda siempre a la vista, más angosta** (A-6, D-098): 360 px en vez de 440, se ensancha o se angosta arrastrando su borde y la app recuerda el ancho de cada vista. La conversación vacía dice en una línea qué hace **Seguí** y no repite el Próximo paso, que está en el Mapa (A-7).
- **Un patrón de cabecera para toda sección** (A-8): título y cuenta a la izquierda, acciones a la derecha, filtros debajo, siempre a la misma altura. La línea de propósito aparece solo cuando la sección está vacía. El foco del teclado entra al contenido, no al título.
- **El nombre del proyecto** sale de la ficha (`nombre`) si lo tiene, y si no, de la carpeta (A-12).

```
┌──────┬─[● Alfa · 2 ×][Beta ×]───────────────────────────────┬──[─ □ ×]┐
│ ⌂ 3! │ Título · cuenta          [acción] [acción]│ Conversación   │
├──────┤ [filtro] [filtro] [filtro]               │                │
│ íconos│──────────────────────────────────────────│                │
│ de la│                                          │                │
│ vista│        contenido de la sección           │                │
│      │                                          │ [Escribile…]   │
│  ⚙   │                                          │                │
└──────┴──────────────────── barra de estado ─────┴────────────────┘
 ⌂ 3!  el único total de lo que está en tu bandeja; «!» y amarillo solo si algo frena
 Conv. siempre a la vista, 360 px; se arrastra su borde
```

### Un número que manda (A-1, A-2)
- **El total** de lo que está en tu bandeja está en un solo lugar: el botón de inicio, arriba a la izquierda, visible desde todas las pantallas. El ícono de la Bandeja de entrada de la barra no repite el número.
- **Por proyecto,** la cuenta va en su tarjeta y en su pestaña; la cabecera del proyecto no la repite.
- **Se nombra de una forma:** «3», y en el texto «3 en la bandeja». Desaparecen «3 preguntas», «3 sin responder» y «3 preguntas · frena».
- **El amarillo es solo para lo que frena:** una cuenta sin nada que frene es neutra; con algo que frena, amarilla y con «!» (no solo color). En la Bandeja de entrada, solo las preguntas que frenan llevan borde amarillo; el botón **Enviar** es el botón principal de la app, no amarillo.
- **Las preguntas en pausa** no se cuentan y se ven aparte, plegadas, al final de la Bandeja de entrada.

### Vista general (el botón de inicio)
Barra de íconos, en este orden (`Ctrl+1` a `Ctrl+4`):

1. **Proyectos** — la grilla. Una tarjeta por carpeta; los proyectos dicen su hito y los frentes activos, las carpetas simples dicen «carpeta» (D-095). El menú de la tarjeta suma **Pasar al marco** en las carpetas simples y en los proyectos con el marco viejo.
2. **Bandeja de entrada** — las preguntas de todos los proyectos (hoy Pendientes). Una columna con los proyectos y su cuenta (primero los que tienen algo que frena) y, al elegir uno, sus preguntas con **filtros por frente** arriba («Todos 3 · Núcleo 2 · Compartir 1»), primero las que frenan; debajo, las respondidas sin procesar; al final, plegadas, las en pausa (OR-6).
3. **Ideas** — las ideas `nueva` de todos los proyectos juntas, agrupadas por proyecto, y las sueltas de `Ideas/ideas.md`. Arriba, **Anotar una idea**: un campo y a qué proyecto va (o «suelta»), sin abrir una sesión (OR-4). Una idea que pasa a `pendiente` sale de acá y sigue en el Trabajo de su proyecto. Desaparece el grupo «Integradas»: lo integrado es un `T-n` con estado.
4. **Skills** — las skills, como hoy. Su entrada deja de ser «Proyectos atrasados»: es **Marco**, con las carpetas que no lo siguen o lo siguen con una fecha vieja y **Pasar al marco** en cada una (A-9, OR-8).

Abajo, **Ajustes**, como hoy (A-11 espera a OR-12).

La conversación de la vista general es el chat general, salvo en Skills, que tiene el suyo.

### Vista de un proyecto
Barra de íconos en dos grupos. Arriba, **lo que se sigue**; abajo, separado, **el proyecto por dentro**:

| Sección | Qué muestra | Reemplaza |
|---|---|---|
| **Bandeja de entrada** | Las preguntas de este proyecto, como en la general pero sin la columna; con filtros por frente | «Pendientes y scripts», sin los scripts |
| **Mapa** | En qué está el proyecto: los hitos y, en operación, **los frentes**: el activo arriba con su paso `en curso`, su Próximo paso y su trabajo `en curso`; los `hecho` en una fila corta, «en operación» (A-5) | el Mapa de hoy, que en operación queda vacío |
| **Trabajo** | `trabajo.md`: los `T-n` con filtros por estado («Ideas · Pendiente · En curso · En pausa · Hecho») y por frente; **Anotar una idea** arriba | «Ideas del proyecto» |
| **Revisión** | Los comentarios `R-n`, como hoy | — |
| **Docs** (abajo, separado) | Los documentos, con tablas que usan el ancho (A-10) | — |
| **Archivos** | El árbol del proyecto, como hoy | — |
| **Git** | Como hoy | — |
| **Scripts** | Un botón por script, con su descripción; el único lugar de los scripts | la lista corta de «Pendientes y scripts» |

Abajo, **Ajustes del proyecto**, como hoy.

- **Se entra** a la Bandeja de entrada si hay algo sin responder y, si no, al Mapa: lo primero que se ve es lo que hay que hacer.
- **Una carpeta simple** (D-095) muestra solo el segundo grupo y la conversación; en el lugar del primero, un recuadro: «Esta carpeta no sigue el marco» con **Pasar al marco**.
- **La cabecera** del proyecto (ícono, nombre, hito) no repite la cuenta: la tiene la pestaña.

### Cómo se va de un lado a otro
- Botón de inicio → la vista general, en la última sección elegida.
- Tarjeta → el proyecto. Pestaña → el proyecto, como se lo dejó.
- Bandeja de entrada general → **Abrir** → el proyecto, en su Bandeja de entrada.
- Mapa → una pregunta de «En tu bandeja» → la Bandeja de entrada, en esa pregunta; un trabajo `en curso` → Trabajo, en ese ítem; un frente → su `estado.md` en Docs.
- Ideas (general) → una idea → el Trabajo de su proyecto, en ese ítem.
- Un código en cualquier texto → donde nace: `Q-n` a la Bandeja de entrada, `T-n` a Trabajo, `R-n` a Revisión, el resto a Docs.
- Aviso de una sesión que terminó → **Responder** (la Bandeja de entrada, en ese proyecto) o **Abrir**.
- Cambiar de sección o de proyecto no corta ni recarga nada (H-6, sin cambios).

### Lo que cambia de nombre
| Hoy | Queda | Por qué |
|---|---|---|
| Pendientes | **Bandeja de entrada** (Q-137, D-097) | «pendiente» es un estado del trabajo de la IA (D-094); «Te espera» sonaba informal. El bloque del Mapa pasa a «En tu bandeja» |
| Pendientes y scripts | **Bandeja de entrada** | los scripts van solo en Scripts |
| Ideas del proyecto | **Trabajo** | D-094 |
| Proyectos atrasados (Skills) | **Marco** | D-092; «atrasado» es una forma de no seguir el marco |
| Poner al día | **Pasar al marco** | `definicion.md` › Pasar al marco |

### Cómo queda cada hallazgo
| Hallazgo | Cómo se resuelve |
|---|---|
| A-1 El mismo número cuatro veces | Un total en el botón de inicio; por proyecto, tarjeta y pestaña |
| A-2 Todo amarillo | Amarillo y «!» solo para lo que frena |
| A-3 Scripts en dos lugares | Solo en Scripts; la Bandeja de entrada sin scripts |
| A-4 Las ideas en tres lugares | Trabajo por proyecto, Ideas para las nuevas de todos; anotar sin la IA |
| A-5 El Mapa en operación | Los frentes con su paso en curso, su Próximo paso y su trabajo en curso |
| A-6 La conversación ocupa un tercio | Queda a la vista, más angosta (360 px) y con el ancho de cada vista recordado (D-098) |
| A-7 La conversación vacía repite el Próximo paso | Una línea con qué hace Seguí |
| A-8 Cada sección distinta | Un patrón de cabecera |
| A-9 Skills alrededor de la guía | La entrada es Marco, con Pasar al marco |
| A-10 Tablas angostas | Las tablas de Docs usan el ancho (en las pantallas) |
| A-11 Ajustes casi vacío | Sin cambios ahora: OR-12, cuando llegue el respaldo |
| A-12 El nombre es el de la carpeta | `nombre` en la ficha |

## Parte 2 — Pantallas
Cada pantalla con su wireframe y sus estados. Los wireframes dicen qué va y dónde, no cómo se ve: los colores y las medidas salen de `06-ui.md` (la UI del frente es el paso 6). Las que no figuran (Archivos, Git, Revisión, Ajustes) quedan como hoy, con la cabecera común (PO-2). Cuando se aprueben, estas pantallas pasan a `04-ux.md` › Pantallas como W-n.

### PO-1 — El marco de la app
```
┌────┬─[Alfa · 2 ×][Beta · 1! ×]──────────────────────────────────[─ □ ×]┐
│⌂ 3!│                                                                   │
├────┤                                                                   │
│ ▦  │             área principal              │   conversación (PO-9)   │
│ ✉  │                                         │                         │
│ ✧  │                                         │                         │
│ ◇  │                                         │                         │
│ ⚙  │                                         │                         │
├────┴─────────────────────────────────────────┴─────────────────────────┤
│ ✓ Claude · Pro  Hito 10 · Operación   [↻ Actualizar]  5 h 15 %  Semana 22 % │
└────────────────────────────────────────────────────────────────────────┘
```
- **Botón de inicio** (`⌂`): lleva a la vista general y tiene el único total de la bandeja. Sin nada, sin número; con algo que frena, amarillo y «!».
- **Pestañas:** el nombre del proyecto y su cuenta, con la misma regla de color. La pestaña activa se marca con la línea de abajo, nunca en amarillo.
- **Barra de estado,** de izquierda a derecha: la cuenta de Claude (como hoy: con un error, el chip rojo inicia sesión), el hito del proyecto abierto, **Actualizar** cuando hay algo (abajo), el uso y las sesiones.
- **Actualizar (R-12):** un solo botón reemplaza a «Hay cambios sin armar · Armar» y a «Versión nueva lista · Reiniciar ahora». Arma la versión si hace falta y, al terminar, reinicia Iridium con ella:

| Estado | Qué se ve | Qué hace |
|---|---|---|
| Al día | nada | — |
| Hay cambios sin armar, o una versión nueva lista (armada, o bajada de GitHub en una copia compartida) | **↻ Actualizar**, con el detalle en el título («Trae «…» (abc123) y lo anterior que falte») | Arma si hace falta y reinicia |
| Armando | «Actualizando… · 1 min» con el ícono girando y **Cancelar** | La app se sigue usando; al terminar, reinicia sola |
| Hay sesiones trabajando al reiniciar | La confirmación de F-6, con **Esperar** y **Reiniciar igual** | Esperar deja la versión lista y reinicia sola cuando terminan |
| Falló el armado | chip rojo «No se pudo actualizar», el motivo en el título, **Reintentar** y **Ver la consola** | — |
| La IA de Iridium está trabajando | **Actualizar** deshabilitado: «Espera a que la IA de Iridium termine» | No arma a mitad de camino (como hoy) |

Si el usuario cierra Iridium con una versión lista, entra al cerrar, como hoy. Desaparecen los chips «Versión nueva lista · entra al cerrar» y «Hay cambios sin armar».

### PO-2 — La cabecera de una sección
```
┌──────────────────────────────────────────────────────────────┐
│ Trabajo · 34                       [+ Anotar una idea]  [⋯] │
│ (Todos 25) (Nuevas 6) (Pendientes 9) (En curso 2) … Frente ▾ │
├──────────────────────────────────────────────────────────────┤
```
- Título y cuenta a la izquierda, una o dos acciones a la derecha (lo demás en `⋯`), filtros en la segunda fila. La misma altura en todas las secciones.
- **Vacía:** debajo de la cabecera, una línea de para qué es y la acción principal («Acá van las ideas y lo que la IA va a hacer. **Anotar una idea**»). Con contenido, esa línea no está.
- El foco del teclado entra al primer elemento del contenido; `Ctrl+F` va al primer filtro donde lo hay.

### PO-3 — Proyectos (la grilla)
```
Proyectos · 14                        [+ Nuevo proyecto] [Abrir como proyecto]
(En desarrollo 5) (En uso 3) (Carpetas 6) (Archivados)
┌─────────────────────────┐ ┌─────────────────────────┐ ┌────────────────────┐
│ ◈ Alfa               2! │ │ ◈ Beta                1 │ │ ▢ Gamma            │
│ Hito 10 · Operación     │ │ Hito 7 · Construcción   │ │ carpeta            │
│ Orden · 4. UX           │ │ Próximo: probar la I-3  │ │                    │
│ ● Trabajando · 2 min    │ │                         │ │ [Pasar al marco]   │
│ ⚠ 2 avisos del marco    │ │                         │ │                    │
└─────────────────────────┘ └─────────────────────────┘ └────────────────────┘
```
- **Tarjeta de proyecto:** ícono, nombre (de la ficha o de la carpeta), la cuenta de la bandeja arriba a la derecha (neutra, o amarilla con «!»), el hito, la línea del frente activo («Orden · 4. UX») o, sin frentes, la del Próximo paso, y el estado de su sesión si tiene una.
- **Avisos del marco:** lo que el control no logró que la IA corrigiera queda en la tarjeta, «⚠ 2 avisos del marco»; al tocarlo se abre el proyecto en Docs con la lista. Sin avisos, la línea no está.
- **Tarjeta de carpeta simple (D-095):** ícono, nombre y «carpeta»; **Pasar al marco** aparece al pasar el mouse o con el foco. Van en su propio grupo, después de los proyectos.
- **Marco viejo:** un proyecto con `docs/estado.md` que todavía no pasó al marco dice «marco viejo» junto al hito, y el menú de la tarjeta tiene **Pasar al marco**.
- **Estados:** cargando (las tarjetas con su forma, sin texto); sin carpeta de proyectos (el recuadro de hoy para elegirla); ficha rota («sin clasificar», como hoy); sin proyectos («Todavía no hay proyectos. **Nuevo proyecto**»).

### PO-4 — Bandeja de entrada
Vista general:
```
┌ Bandeja de entrada ─┬────────────────────────────────────────────────────────┐
│ ◈ Alfa         2!   │ Alfa · 2                             [Abrir] [▷ Seguí] │
│ ◈ Beta         1    │ (Todos 2) (Núcleo 1) (Compartir 1)                     │
│ ◈ Delta        1    │ ┃ Q-126 tarea · Compartir · Frena                     │
│                     │ ┃ Invitá a la otra persona al repo de Iridium          │
│                     │ ┃ › Mostrar detalles                                   │
│                     │ ┃ [ ] Le pasé la carpeta…       [Nota, si falló     ]  │
│                     │ ┃                     [Guardar a medias] [Enviar]     │
│                     │   Q-130 prueba                                         │
│                     │   …                                                    │
│                     │ Respondidas sin procesar · 1                           │
│                     │ › En pausa · 2                                         │
└─────────────────────┴────────────────────────────────────────────────────────┘
```
- **La columna:** los proyectos con algo en la bandeja, primero los que tienen algo que frena, cada uno con su cuenta. Elegir uno muestra sus preguntas. Desaparece la referencia de colores de abajo: el «!» se explica en su título («frena el proyecto»).
- **Las preguntas:** primero las que frenan (borde amarillo y chip **Frena**), después las demás; cada una dice su frente si no es del núcleo. **Enviar** es el botón principal de la app, no amarillo.
- **Filtros por frente,** solo si el proyecto tiene preguntas de más de uno: «Todos · Núcleo · Compartir», con su cuenta.
- **Respondidas sin procesar:** debajo, con lo elegido y **Corregir**, como hoy. **En pausa:** al final, plegadas, sin contar en ningún total.
- **El formulario** queda como hoy (opciones, Otro, nota, casillas con su nota, Guardar a medias, Postergar, Enviar). «Otro» con texto y sin nota ya es una respuesta (R-11).
- **En un proyecto:** la misma lista, sin la columna; la cabecera dice «Bandeja de entrada · 2».
- **Estados:** vacía («Nada en tu bandeja. Cuando la IA necesite algo de vos, aparece acá»); la respuesta cambió afuera mientras se respondía (el aviso de hoy); no se pudo guardar (el aviso con Reintentar de hoy); una pregunta mal escrita («La IA la corrige al terminar el turno», sin formulario hasta entonces).

### PO-5 — Ideas (vista general)
```
Ideas · 12
┌───────────────────────────────────────────────────────────────────────┐
│ [Una idea…                                        ] [Alfa ▾] [Anotar] │
└───────────────────────────────────────────────────────────────────────┘
Alfa · 5
  T-41  Exportar el plan como imagen                  2026-11-05
  T-38  Un atajo para Seguí desde la grilla           2026-11-02
Beta · 3
  …
Sueltas · 4
  Una app de recetas con fotos                        2026-10-30
```
- **Anotar una idea:** el campo, a qué proyecto va (los que pasaron al marco y «Suelta»; empieza en el último elegido) y **Anotar** (o `Enter`). Iridium la escribe como un `T-n` `nueva` en el `trabajo.md` del proyecto (o en `Ideas/ideas.md` si es suelta), sin abrir una sesión. Aparece arriba de su grupo y el campo se vacía.
- **La lista:** solo las ideas `nueva`, agrupadas por proyecto (el de la idea más reciente primero) y las sueltas al final. Tocar una abre el Trabajo de su proyecto, en ese ítem. Una idea que la IA pasa a `pendiente` sale de acá.
- **Proyectos con marco viejo:** al final, una línea: «Las ideas de 3 proyectos no aparecen: todavía no pasaron al marco. **Ver en Marco**».
- **Estados:** vacía («Todavía no hay ideas nuevas»); no se pudo anotar (el texto queda en el campo, con el motivo y **Reintentar**).

### PO-6 — Skills › Marco
```
┌ Skills ────────────┬──────────────────────────────────────────────────────────┐
│ ◇ Marco        3   │ Marco · 3 fuera                                          │
│ ─────────────      │ (Todos 14) (Fuera del marco 3) (Carpetas simples 6)      │
│ Propias       12   │ ◈ Beta     marco viejo · 2026-10-20    [Pasar al marco]  │
│ De plugins     8   │ ◈ Delta    marco viejo · sin fecha     [Pasar al marco]  │
│                    │ ◈ Épsilon  2 avisos del marco          [Pasar al marco]  │
│                    │ ▢ Gamma    carpeta simple              [Pasar al marco]  │
│                    │ ◈ Alfa     al día · 2026-11-06                           │
└────────────────────┴──────────────────────────────────────────────────────────┘
```
- La primera entrada de Skills es **Marco** (reemplaza a «Proyectos atrasados»), con la cuenta de los proyectos fuera del marco (marco viejo o con avisos). Las carpetas simples no cuentan: no tienen por qué seguirlo.
- Cada fila: el proyecto, cómo está («marco viejo», «2 avisos del marco», «carpeta simple», «al día» con la fecha) y **Pasar al marco**, que manda el pedido a la conversación de ese proyecto (gasta uso; lo dice el título del botón). Mientras pasa, la fila dice «Pasando al marco…».
- El resto de Skills queda como hoy.
- **Estados:** todo al día («Todos los proyectos siguen el marco»); la IA de ese proyecto ocupada (el botón deshabilitado, «Su IA está trabajando»).

### PO-7 — El Mapa de un proyecto
En operación:
```
Alfa · Hito 10 · Operación                               [Abrir 10-operacion.md]
Hitos  0 1 2 3 4 5 6 7 8 9 ▣10                                9 de 10 hechos
┌ Frente activo ──────────────────────────────────────────────────────────────┐
│ Orden   4. UX · en curso                                    [Abrir estado.md]│
│ Próximo paso                                                                 │
│ Con PO-1 a PO-10 aprobadas, reescribir 04-ux.md sin capas.                   │
│ En curso                          │ En tu bandeja · 1                        │
│ T-12 Bandeja agrupada por frente  │ Q-139 ¿Las pantallas van así? frena    › │
├──────────────────────────────────────────────────────────────────────────────┤
│ En espera      Diseño · Capacidades                                          │
│ En operación   Compartir · Skills · Inicio · Apariencia · Revisión           │
└──────────────────────────────────────────────────────────────────────────────┘
Lo último de la IA: «Escribí las pantallas de Orden…» · hace 10 min [Ver la conversación]
```
- **Hitos:** una fila corta. Tocar uno abre su detalle debajo (lo de hoy: portón, iteraciones).
- **En operación** (o con frentes): manda el bloque de **frentes**. El activo, grande, con su paso `en curso` (no el primero sin completar, A-5), su Próximo paso, su trabajo `en curso` y las preguntas de ese frente. Debajo, una línea para los `pendiente` («En espera») y otra para los `hecho` («En operación»). Tocar un frente abre su `estado.md` en Docs.
- **Antes de operación:** el detalle del hito actual, como hoy, con su Próximo paso, sus iteraciones y «En tu bandeja».
- **Estados:** sin frentes en operación (el detalle del hito 10 en lugar del bloque); una tabla con un estado fuera del vocabulario (el chip dice la palabra tal cual, en gris, y hay un aviso del marco).

### PO-8 — Trabajo de un proyecto
```
Trabajo · 34                                                [+ Anotar una idea]
(Todos 25) (Nuevas 6) (Pendientes 9) (En curso 2) (En pausa 1) (Hechos 7) (Descartados 2)  Frente ▾
En curso · 2
  T-12  Bandeja agrupada por frente              Orden    2026-11-05   ›
  T-15  El control de las preguntas              Orden    2026-11-06   ›
Pendientes · 9
  T-07  Respaldo de .iridium en GitHub           Núcleo   2026-11-04   ›
  …
Nuevas · 6
  …
› Hechos · 7     › Descartados · 2
```
- **Filtros por estado** con su cuenta; «Todos» muestra lo que falta (nuevas, pendientes, en curso, en pausa) y deja plegados al final los hechos y los descartados. **Frente** filtra cuando hay más de uno.
- **Cada ítem:** código, título, frente y fecha. Tocarlo lo despliega con su texto, su origen enlazado (`D-n`, `R-n`…) y lo que lo cerró si está hecho. Desde acá no se editan: los cambia la IA.
- **Anotar una idea:** el mismo campo que en Ideas, ya con este proyecto.
- **Estados:** vacío (PO-2); un proyecto con marco viejo («Este proyecto todavía no pasó al marco: sus ideas y pendientes están repartidos en sus documentos. **Pasar al marco**»); un ítem mal escrito (al final, «Sin estado», con el aviso del marco).

### PO-9 — La conversación
```
┌ Sin conversación todavía ───── [◷] [+ Nueva] [▷ Seguí] ┐
│                                                        │
│  Seguí lee el estado del proyecto y hace el próximo    │
│  paso (está en el Mapa). O escribile lo que quieras.   │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ > Escribile a la IA…                               │ │
│ │ Opus · Medio                                   [↑] │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```
- Siempre a la vista, a la derecha, **360 px** (D-098). Su borde se arrastra entre 300 px y la mitad de la ventana; la app recuerda el ancho de la vista general, de Skills y de cada proyecto.
- **Vacía:** una línea con qué hace **Seguí**, sin repetir el Próximo paso (A-7). En la vista general: «Preguntale lo que quieras sobre tus proyectos».
- **Con una conversación:** como hoy (los mensajes, el contexto, Detener).
- En una ventana angosta (menos de 1100 px) arranca en 300 px.

### PO-10 — Un proyecto por dentro y la carpeta simple
```
Proyecto                          Carpeta simple
┌────┐                            ┌────┐
│ ✉  │ Bandeja de entrada         │ ▣  │ Archivos  ┌ Esta carpeta no sigue el marco ─┐
│ ◫  │ Mapa                       │ ⑂  │ Git       │ Se ve y se conversa, sin Mapa,  │
│ ☰  │ Trabajo                    │ ▶  │ Scripts   │ Trabajo ni preguntas.           │
│ ⚑  │ Revisión                   │    │           │                [Pasar al marco] │
│ ── │                            │ ⚙  │           └─────────────────────────────────┘
│ ▤  │ Docs                       └────┘
│ ▣  │ Archivos
│ ⑂  │ Git
│ ▶  │ Scripts
│ ⚙  │ Ajustes del proyecto
└────┘
```
- **Dos grupos** en la barra de íconos, separados por una línea: lo que se sigue arriba, el proyecto por dentro abajo. El ícono de la Bandeja de entrada no lleva número (lo tiene la pestaña).
- **Se entra** a la Bandeja de entrada si hay algo y, si no, al Mapa. Una carpeta simple entra a Archivos, con el recuadro arriba; Scripts aparece solo si tiene `scripts.md`.
- **Docs (A-10):** el texto mantiene su ancho de lectura; las tablas usan el ancho de la sección y, si no entran, se desplazan de costado dentro de su recuadro, no la página entera.
- **La cabecera del proyecto** (ícono, nombre, hito) no repite la cuenta.

### Cómo queda cada pantalla de hoy
| Hoy | Queda |
|---|---|
| W-1 Marco de la app | PO-1, con Actualizar (R-12) y el total en el botón de inicio |
| W-2 Proyectos | PO-3 |
| W-3 Vista de un proyecto | PO-10, con el Mapa (PO-7) y el Trabajo (PO-8) |
| W-4 Fichas de sesión, uso y avisos | sin cambios, con la regla del amarillo |
| W-5 Pendientes | PO-4 |
| W-6 Responder una prueba | PO-4 (el formulario no cambia) |
| W-7 Mapa del plan | PO-7 |
| W-8 Docs del proyecto | PO-10 › Docs |
| Ideas | PO-5 y PO-8 |
| Skills › Proyectos atrasados | PO-6 |

### Para el diseño técnico (paso 5)
- Actualizar une dos piezas que ya existen (Armar y Reiniciar ahora): Iridium tiene que saber que el armado lo pidió Actualizar para reiniciar al terminar, y Cancelar tiene que cortar la consola.
- Anotar una idea escribe `trabajo.md` desde Iridium mientras una sesión puede estar escribiéndolo (`definicion.md` › Preguntas abiertas para investigar).
- Los avisos del marco de la tarjeta, de la Bandeja y de Skills › Marco salen del control (OR-2), con el mismo lector.
- El ancho de la conversación de cada vista se guarda con la configuración de la ventana.

