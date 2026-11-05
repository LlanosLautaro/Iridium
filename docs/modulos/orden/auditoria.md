# Auditoría del frente Orden

**Fecha:** 2026-11-05
**Paso:** 3, Investigación (D-091). Parte 1, la UX; Parte 2, la forma de trabajo.

## Parte 1 — La UX de la app de hoy

### Cómo se hizo
`tools/auditoria-ux.ts` abre la app de `pnpm build` (commit `e38ead2` más los cambios de esta sesión) con los proyectos reales, el motor falso y una carpeta de datos aparte, y saca una captura de cada pantalla: la grilla, el menú de la tarjeta, Nuevo proyecto, Pendientes, Skills, Ideas, cada sección de Ajustes, este proyecto en sus ocho secciones, otro proyecto, el tema Carbón y la ventana chica (1024 × 700). Corre en 1440 × 900 y en 1280 × 720. No manda nada ni toca los proyectos. Las capturas quedan en `tools/salida/auditoria/` (no van al repo: muestran los proyectos del usuario, D-082).

Se miró cada captura contra `04-ux.md` (las historias, la arquitectura de información y W-1 a W-8) y `06-ui.md`, con los criterios de las skills de diseño: jerarquía, carga cognitiva, consistencia, un solo lugar para cada cosa.

**Severidad:** alta = confunde o esconde algo que el usuario tiene que hacer; media = ruido o incoherencia que se nota todos los días; baja = detalle.

### Lo que está bien y se conserva
- **El esqueleto:** barra de íconos a la izquierda, barra de título con pestañas, barra de estado con el uso, conversación a la derecha. Es estable entre pantallas y se aprende rápido.
- **Las tarjetas de la grilla:** ícono, estado, descripción y hito se leen de un vistazo; el chip de preguntas se ve sin buscarlo.
- **El formulario de una prueba:** una casilla y una nota por cosa, «Guardar a medias» y la ruta de la respuesta. Es lo mejor de la app.
- **Git** y **Revisión:** claros, con su propósito dicho arriba y sin ruido.
- **El menú de la tarjeta (D-089, D-090):** ordenado en grupos, con Eliminar aparte y en rojo.
- **El tema:** contraste correcto en los dos temas (tanda 5 del hito 8) y la misma familia de componentes en todas las pantallas.

### Hallazgos

#### A-1 — El mismo número, cuatro veces en una pantalla (media)
Con un proyecto abierto, las preguntas sin responder aparecen en el botón de inicio (arriba a la izquierda), en la pestaña del proyecto, en el ícono de Pendientes de la barra y en la cabecera del proyecto. Afuera, el botón de inicio y el ícono de Pendientes muestran el mismo total, uno arriba del otro. Y se nombra de tres formas: «3 preguntas», «3 preguntas · frena» y «3 sin responder».
**Por qué importa:** el ojo no sabe cuál es el que manda, y el amarillo pierde fuerza de tanto repetirse. **Contra `04-ux.md`:** W-1 pide el número en el botón de inicio; los demás se fueron sumando con cada decisión.

#### A-2 — Todo es urgente: el amarillo está en todos lados (media)
Las tarjetas de preguntas de Pendientes tienen borde y fondo amarillos sean o no «frena», el botón Enviar es amarillo, los chips son amarillos. «Frena» se distingue solo por una etiqueta chica.
**Por qué importa:** lo que frena tiene que saltar a la vista y lo demás no; hoy la página entera grita. **Contra `06-ui.md`:** el amarillo es el color de aviso, no el de cualquier pregunta.

#### A-3 — Scripts en dos lugares (media)
La sección «Pendientes y scripts» muestra los scripts debajo de las preguntas (en versión corta) y además hay una sección **Scripts** con los mismos scripts en versión larga.
**Por qué importa:** dos lugares para lo mismo; el nombre «Pendientes y scripts» mezcla lo que el usuario tiene que hacer con herramientas. **Contra `04-ux.md`:** W-3 nació así y Scripts se sumó después sin sacar lo otro.

#### A-4 — Las ideas: tres lugares, ningún estado (alta)
Hay ideas en la sección Ideas (las de la carpeta Ideas, sueltas o para proyectos), en «Ideas del proyecto» (un texto largo sacado de `07-construccion.md` y `00-idea.md`) y en el chat general. En «Ideas del proyecto» de este proyecto, la mitad de los puntos dicen «hecho en D-089» o «decidido en Q-81»: siguen en la lista porque no hay estado. No se puede anotar una idea sin la IA («contásela en la conversación»).
**Por qué importa:** es la crítica de `10-operacion.md` › Crítica de la gestión de ideas, vista en pantalla: lo hecho y lo pendiente se mezclan y nada dice qué falta. Confirma Q-131 (B).

#### A-5 — El Mapa no sabe qué hacer en operación (alta)
En el hito 10, de este y de otro proyecto, el Mapa muestra «Pasos: su documento no tiene portón ni plan de iteraciones»: el bloque principal queda vacío justo en el hito en el que más tiempo se pasa. Los frentes salen como chips en dos filas, pero los terminados («hecho») ocupan lo mismo que el activo.
Además, el chip de Orden dice «2. Definición» cuando el paso en curso es el 3: muestra el primer paso sin completar, no el que está en curso (Orden tiene la definición pendiente a propósito, después de la auditoría).
**Por qué importa:** el Mapa es la respuesta a «¿en qué estamos?» y en operación no la da. **Contra `04-ux.md`:** W-7 se pensó para los hitos 0 a 9, con portón; la operación quedó sin forma.

#### A-6 — La conversación ocupa un tercio aunque no haya conversación (media)
En la grilla, Pendientes, Skills, Ideas y cada sección del proyecto, el panel de la derecha toma ~30 % del ancho. Sin conversación, casi todo es vacío con un saludo al pie. En 1024 de ancho, la grilla queda en una columna y el título «Proyectos» se corta («Pr…»).
**Por qué importa:** la parte de trabajo (Pendientes, Docs, Mapa) es la que más se lee y es la que se achica. **Contra `04-ux.md`:** D-041 puso la conversación siempre a la derecha en el proyecto; afuera se sumó el chat general (D-060) y el de Skills, cada uno ocupando lo mismo.

#### A-7 — «Sin conversación todavía» repite el Próximo paso (baja)
La conversación vacía muestra el Próximo paso entero, que también está en el Mapa y en la tarjeta. La cabecera dice «Sin conversación todavía · Seguí lee estado.md y hace el próxim…» cortado.

#### A-8 — Cada sección se presenta distinto (media)
Unas tienen título grande y una línea que explica (Scripts, Ideas del proyecto), otras un título con filtros (Revisión), otras arrancan sin título (Pendientes, Mapa) y Docs y Git tienen su propia barra. Las columnas de Skills e Ideas tienen el título subrayado con un recuadro (el foco del teclado queda en el título al entrar).
**Por qué importa:** cada pantalla se diseñó sola (`propuesta.md`); falta un patrón de cabecera de sección.

#### A-9 — Skills sigue organizada alrededor de la guía de hitos (media)
La entrada de Skills es «Proyectos atrasados» respecto del formato de la guía, con «Poner al día» por proyecto. Con D-092 la guía deja de existir como skill aparte.
**Por qué importa:** la pantalla más visible de Skills se queda sin sentido cuando el marco sea de Iridium; hay que decidir qué es «estar al día» con el marco (paso 2).

#### A-10 — Docs: tablas angostas y texto partido (baja)
En el visor, las tablas de `estado.md` no usan el ancho: «completo» se corta en «comple / to» con el lector en ancho Normal y la columna libre a la derecha.

#### A-11 — Ajustes casi vacío (baja)
Perfil tiene un solo campo; Apariencia, dos miniaturas. El cuadro es grande para lo que tiene. No molesta, pero cuando lleguen el respaldo (D-087) y lo que salga del marco, conviene pensar qué va acá y qué en cada sección.

#### A-12 — El nombre del proyecto es el de la carpeta (baja)
La tarjeta, la pestaña y la cabecera muestran el nombre de la carpeta; en este proyecto, «Centro de Desarrollo» en lugar de Iridium (D-033). La ficha no tiene un nombre visible propio.

### Lo que dice de la arquitectura de información
1. **Falta una idea de qué es cada cosa.** Pregunta, idea, script, pendiente de la IA y comentario de la Revisión son lo que se sigue en un proyecto, y hoy cada uno vive en una sección distinta con su propia forma (A-3, A-4). Es el «un solo modelo» de `propuesta.md`: con código, frente y estado, todos pueden mostrarse igual.
2. **La operación no tiene forma.** El Mapa (A-5) y el Próximo paso se pensaron para los hitos con portón; casi todos los proyectos vivos están en operación. El modelo tiene que darle a la operación frentes con estado y un «qué sigue» que el Mapa pueda dibujar.
3. **Un solo número que manda** (A-1, A-2): lo que espera del usuario se cuenta en un lugar, y lo que frena se distingue de verdad.
4. **El espacio es para el trabajo, no para el chat vacío** (A-6, A-7): la conversación tiene que poder achicarse o salir cuando no hay una.
5. **Un patrón de sección** (A-8): cabecera, propósito y acciones siempre en el mismo lugar.

Esto alimenta el paso 2 (el modelo) y el 4 (`04-ux.md` reescrito). Nada se arregla suelto ahora (D-091): los hallazgos se resuelven en la ronda de UX, salvo el chip de Orden en el Mapa (A-5), que es un error de lectura y va con la primera iteración.

## Parte 2 — La forma de trabajo

### Cómo se hizo
Se leyeron, sin tocarlos, los `estado.md` (el general y los de sus módulos) de los seis proyectos de la carpeta que siguen la guía, sus `docs/respuestas/` y los títulos de todos sus documentos; se corrió sobre cada uno el comprobador de preguntas de la guía (`scripts/comprobar-preguntas.mjs`, el hook `Stop` de la carpeta de Claude del usuario), y se compararon la guía `hitos-desarrollo-app`, la skill de Iridium (`recursos/plugins/iridium`) y `gestor-proyectos` con lo que Iridium lee de verdad (`src/main/core/visor/preguntas.ts`, `pendientes.ts`, `mapa.ts`). Los otros proyectos no se nombran (D-082): son Alfa, Beta, Gamma, Delta y Épsilon; este, Iridium.

### Hallazgos

#### A-13 — Dos reglas contrarias para las pruebas (alta)
La guía pide terminar cada prueba con `Opciones: A) Funciona`; la skill de Iridium dice que las pruebas y tareas van **solo** con casillas y que juntar las dos cosas es contradictorio. Las IA que trabajan fuera de Iridium leen solo la guía: de las cuatro pruebas abiertas de los otros proyectos, las tres que tienen formato llevan `Opciones:` (dos en Beta, una en Delta). La de Delta ni siquiera tiene casillas: «Opciones: A) Funciona, se aprueba · B) Encontré algo» va pegado al final del `Contexto:`, con la opción «Encontré algo» que la misma guía dice que sobra.
**Por qué importa:** es el caso típico de dos reglamentos: el usuario recibe pruebas con dos formas de responder y la IA no sabe cuál vale.

#### A-14 — Preguntas que Iridium no ve (alta)
- En Gamma y en Épsilon, «Preguntas abiertas» tiene preguntas sueltas, sin código (`- ¿Se sigue congelando al volver con Alt+Tab…?`): Iridium no las cuenta ni les da formulario; para el usuario no existen.
- En Épsilon, un módulo tiene una sección «Verificación manual de T3 (pendiente del usuario)» con cuatro cosas para probar: una prueba entera fuera de «Preguntas abiertas».
- En Iridium, `07-construccion.md` › Pruebas manuales pendientes (aprobadas provisionales) es una tabla de pruebas del usuario (D-056, D-063). Hoy no tiene nada abierto, pero la guía todavía la ofrece como lugar.

**Por qué importa:** «todo lo que espera del usuario es una `Q-n`» se rompe en silencio; nadie avisa.

#### A-15 — Preguntas como títulos, sin tipo ni casillas (media)
Alfa escribe sus dos preguntas como títulos (`### Q-14 — …`) con rótulos propios («Qué pasa», «Qué probar», «Respuesta»). Iridium las lee (lo tolera desde el Defecto 13), pero sin `Tipo:` quedan como consultas que no frenan y sin casillas; una dice «(en pausa)» en el título, porque no hay un estado para una pregunta en pausa. Están además en orden inverso (Q-14 antes que Q-13).

#### A-16 — El control dice que todo está bien (alta)
El comprobador, corrido sobre los seis proyectos, responde en todos «Las preguntas abiertas tienen el formato de la guía», con A-13, A-14 y A-15 a la vista. Mira solo que Iridium pueda leer la línea de la pregunta y las opciones; no mira las reglas: las pruebas con opciones, la falta de casillas, las preguntas sin código o escritas como títulos, el `Tipo:` con texto de más («prueba · no frena (I-16 sigue; hace falta antes de cerrar E-4)»).
Además:
- **Es una copia:** repite las expresiones de `preguntas.ts` con un aviso «si cambia uno, cambiar el otro». Ya se separaron: Iridium acepta preguntas como título y el control no las mira.
- **Vive afuera:** es un hook de la carpeta de Claude del usuario que apunta a la carpeta de la guía. Corre en toda sesión de Claude Code, dentro o fuera de Iridium (contra D-093), y deja de funcionar el día que se borre la guía (D-092.4).

**Por qué importa:** el control de D-092.3 no se puede construir sobre este; tiene que leer con el mismo código que Iridium y revisar las reglas, no solo si se puede leer.

#### A-17 — Respuestas procesadas sin rastro (media)
En Iridium, 34 de los 123 archivos de `respuestas/` no tienen la línea `> Procesada el …`; en Beta, 20 de 72; en Alfa, 2. Sus `Q-n` ya salieron de «Preguntas abiertas», así que Pendientes no las muestra como «respondida sin procesar»: ese aviso solo funciona mientras la pregunta sigue en `estado.md`. Hay casos recientes (Q-120 y Q-121, que sí terminaron en D-083 y D-084). Con lo que hay, no se puede saber si una respuesta vieja se aplicó.
**Por qué importa:** la respuesta es el registro de lo que dijo el usuario; si no dice adónde fue, una decisión suya puede haberse perdido sin que nadie lo note.

#### A-18 — Las ideas viven en hasta ocho lugares (alta)
Por proyecto: `00-idea.md` › Ideas para después, `01-exploracion.md` › Ideas del brainstorming, `04-ux.md` › Ideas registradas (Alfa), `07-construccion.md` › Ideas nuevas, `07-construccion.md` › Pendientes e ideas (Beta), `10-operacion.md` › Backlog; y afuera, `.iridium/Ideas/ideas.md` y un `.iridium/Ideas/proyectos/<proyecto>.md` por proyecto (también de los que no tienen `docs/`). «Ideas del proyecto» en Iridium lee dos de esos lugares. Ninguna idea tiene código ni estado: en Iridium, 3 de los 10 puntos de Ideas nuevas ya están hechos o decididos y siguen en la lista. Es A-4 visto desde los archivos y la base de Q-131.

#### A-19 — Los pendientes de la IA, repetidos y sin fuente (media)
El trabajo de la IA está en `estado.md` › Pendientes, en los Pendientes de cada módulo, en `07-construccion.md` › Pendientes reportados, en `09-lanzamiento.md` › Pendientes del hito y en `10-operacion.md` › Backlog. En Iridium hay cosas en dos lugares a la vez: el respaldo de `.iridium` (D-087) y lo de traer skills a la carpeta Skills (D-014) están en Pendientes de `estado.md` y en el Backlog. Nada dice cuál es la lista que manda ni cuándo algo pasa de una a otra.

#### A-20 — Nada sabe de qué frente es (media)
Las `Q-n` de los módulos van todas en el `estado.md` general (la regla de la guía y de la skill), sin decir de qué frente son: Q-126 es de Compartir y se ve como del núcleo. Lo mismo los Pendientes de `estado.md`, que mezclan frentes. Es el dato que le falta a «Pendientes agrupados por frente» (D-091.5).

#### A-21 — Tres vocabularios de estados (media)
La guía da diez palabras fijas (`pendiente`, `en curso`, `reabierto`, `bloqueado`, `aprobada provisional`, `completo`, `validado`, `saltado`, y en las iteraciones `hecha` y `aprobada`); la skill de Iridium nombra cinco para los hitos; el Mapa lee las de los hitos con un juego y las de las iteraciones con otro, con sinónimos que no están en ningún documento («cerrado», «terminado», «por empezar»). No hay estado para una pregunta en pausa (A-15), una idea o un pendiente.

#### A-22 — La guía y la skill repiten lo mismo con otras palabras (media)
Las dos explican los códigos, el formato de las `Q-n` y sus respuestas, `scripts.md`, los campos de `estado.md` y los frentes; `gestor-proyectos` y la skill, la ficha. La skill zanja los choques con «si no coinciden, manda esta», pero fuera de Iridium nadie la lee (A-13). La guía, además, sigue nombrando como lector al visor del Gestor de Proyectos, y su comprobador apunta a la carpeta de un proyecto de esta PC. Tamaño: la guía, 248 líneas más unas 1500 de referencias y plantillas; la skill, 161; `gestor-proyectos`, 113. Lo que se usa en cada sesión (formatos) está repartido entre las tres; lo que se usa una vez por hito (las referencias), solo en la guía.

#### A-23 — Proyectos atrasados o fuera del método (baja)
Tres de los cuatro proyectos con `docs/README.md` siguen en el formato 2026-10-16 (Iridium está en el 2026-10-29); dos proyectos con `estado.md` no tienen `docs/README.md`; de las catorce carpetas de la grilla, ocho no siguen la guía: dos tienen `docs/` sin `estado.md` (una con sus propios documentos de cierre) y seis no tienen `docs/`. Todas tienen ficha. El global «todo proyecto se desarrolla con la guía» no se cumple y no se sabe si debe (scripts sueltos, carpetas personales). Varios `estado.md` no se tocan desde hace semanas, con preguntas abiertas viejas.

### Lo que dice para el modelo y el marco
1. **Una regla, un lugar, un lector.** Cada formato se escribe una vez, en el marco (D-092), y lo revisa el mismo código con que Iridium lo lee (no una copia). El control nace dentro de Iridium, no como hook de la carpeta de Claude (A-16, D-093).
2. **El control revisa reglas, no solo si se puede leer:** todo en «Preguntas abiertas» con código; `Tipo:` siempre y solo con sus palabras; pruebas y tareas con casillas y sin opciones; decisiones con opciones; cada respuesta con su línea «Procesada» cuando su pregunta ya salió (A-13 a A-17).
3. **Cada cosa que se sigue, un solo lugar por proyecto, con código, frente y estado:** preguntas, ideas, pendientes de la IA y comentarios de la Revisión (A-18 a A-20). Las secciones viejas («Ideas para después», «Ideas nuevas», «Pendientes reportados», el Backlog) se funden o pasan a ser vistas de esa lista.
4. **Un vocabulario de estados para todo**, con «en pausa», y que el Mapa lea solo esas palabras (A-21).
5. **Poner al día es pasar al marco:** los proyectos atrasados (A-23) se migran con una sola pasada guiada, que reemplaza el «Poner al día» de Skills (A-9).

Con la Parte 1, esto alimenta el paso 2 (`definicion.md`). Nada se arregla suelto ahora (D-091); tampoco se tocan los otros proyectos: se ponen al día cuando exista el marco.
