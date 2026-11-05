# Auditoría del frente Orden

**Fecha:** 2026-11-05
**Paso:** 3, Investigación (D-091). Primero la UX; la forma de trabajo va después, en este mismo archivo.

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
(pendiente: las `Q-n` mal escritas de este y los otros proyectos, dónde se pierden ideas y pendientes, qué repiten la guía y la skill de Iridium)
