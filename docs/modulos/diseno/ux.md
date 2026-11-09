# UX del módulo: Diseño

**Fecha:** 2026-11-07
**Base:** `definicion.md`, D-102, D-103, D-104 (un solo tema, el negro) y D-105 (las pantallas son maquetas HTML; Q-150). Mirado sobre las 30 pantallas de `tools/salida/auditoria/1440x900/` y `1440x900-negro/` (la 11, el detalle de Ideas, no salió: T-53) y sobre los 13 archivos de estilos de `src/renderer/estilos/`, con los criterios de las skills `design-critique` y `design-system`.

Este paso tiene dos partes: el **inventario** (qué arma cada sección a mano, qué pieza lo reemplaza y qué cajas y bordes sobran), que es el encargo del rediseño de Iridium (primero en maquetas, después en el código), y la **sección Diseño** (historias, flujos y pantallas), que muestra esas maquetas y las de cualquier proyecto (D-105).

## Parte 1 — Inventario

### Lo que se ve en las 30 pantallas
Con el negro los colores ya cambian desde un solo archivo, pero el ruido sigue, y es de estructura:

1. **Cajas dentro de cajas.** La Bandeja de entrada es el peor caso: la pregunta es una caja con borde, cada casilla es otra caja con borde y la nota de cada casilla, una tercera. Lo mismo, con dos niveles, en Ideas (la caja de Anotar con su selector y su botón con borde), en el compositor de la conversación, en Skills › Framework (la lista en una caja y cada fila con su botón con borde) y en el Mapa (el bloque de frentes con borde y cada hito en un cuadrado con borde).
2. **Todo lleva borde.** De las 213 reglas de estilo con borde o fondo, la mayoría dibujan un recuadro: cada script de Scripts, cada archivo cambiado de Git, cada opción de Tono en Ajustes, cada tarjeta de la grilla, cada «framework viejo» y cada «Frena» como píldora.
3. **Botones de cinco clases distintas.** Hay `btn primario`, `btn secundario`, `chip`, `btn-ic` y una docena de botones sueltos (`.cerrar`, `.actualizar`, `.atras`, `.reabrir`, `.mini-link`, `.aviso .x`, `.enlace-frente`…). Casi todos los botones visibles son secundarios con borde, así que nada se distingue: en la grilla, en la cabecera de la conversación y en cada fila de Scripts y de Framework hay botones con recuadro.
4. **Dos líneas de cabecera.** En un proyecto, la barra del proyecto («Iridium · Hito 10») y la cabecera de la sección llevan cada una su línea abajo; con los filtros, son tres franjas antes del contenido.
5. **Títulos de cuatro estilos.** «CAMBIOS», «HISTORIAL», «ARCHIVOS» e «IRIDIUM» van en mayúsculas y letra fija; «Frenan el proyecto», «En curso 1» y «Propias 2», en gris normal; «Próximo paso» del Mapa, en gris chico. Son lo mismo: el título de un bloque.
6. **Dos formas de leer markdown.** La conversación (`.md`) y Docs y la Bandeja (`.doc-texto`) tienen cada una sus estilos de tablas, citas y código; las tablas de Docs llevan borde en todas las celdas.
7. **Medidores donde alcanza un número.** El uso de 5 h y de la semana lleva barra y número; la barra repite el número.
8. **El foco se ve con el ratón.** El título de la sección («Bandeja de entrada», «Skills») queda con un recuadro blanco al entrar con un clic: el foco tiene que verse solo con el teclado.

### Las piezas (PZ-n)
El juego del rediseño, con lo que reemplaza de hoy. La regla general: **se separa con espacio y con una línea gris solo donde hace falta; el borde es del Recuadro, de los Campos y del botón secundario; la sombra, de lo que flota.**

| Pieza | Variantes | Reemplaza (clases de hoy) | Dónde se usa |
|---|---|---|---|
| PZ-1 — Botón | principal (blanco, letra negra), secundario (con línea), sin fondo, peligroso; normal y chico; con ícono o solo ícono | `btn primario`, `btn secundario`, `chip`, `btn-ic`, `btn peligro`, `.cerrar`, `.actualizar`, `.atras`, `.reabrir`, `.mini-link`, `.aviso .x`, `.estado-barra button.chip`, `.principal > .cabecera button.chip` | todas las secciones, la conversación, los cuadros |
| PZ-2 — Fila | simple, con detalle debajo, elegida, con acciones (se ven al pasar o con el foco; la principal, siempre) | `.sk-fila`, `.sk-proy`, `.tb-fila`, `.fila-com`, `.commit`, `.arch`, `.script-fila`/`.script`, `.proy`, `.mapa .fila`, `.fila-git`, filas de Ideas | Skills, Framework, Trabajo, Ideas, Revisión, Git, Scripts, Bandeja (columna de proyectos), Mapa |
| PZ-3 — Bloque | con título o sin título; el título con cuenta | `.columna`, `.sk-grupo`, `.bloque-frentes`, `.hito-card`, `.proximo`, `.remoto`, `.plegable`, `.git-det .cuerpo`, `.panel-doc`, `.respuesta`, `.pend` (la caja de cada pregunta), los títulos en mayúsculas de Git, Archivos y Skills | Bandeja, Mapa, Git, Skills, Trabajo, Ideas |
| PZ-4 — Recuadro | aviso (ámbar), error (rojo), vacío, punteado (lo que falta) | `.mensaje`, `.aviso`, `.aviso-doc`, `.aviso-detalle`, `.aviso-git`, `.aviso-grilla`, `.aviso-afuera`, `.sin-guia`, `.recuadro-simple`, `.falla-motor`, `.ajustes-error`, `.rev-vacio`, `.mudanza`, `.sk-avisos`, `.falla` | avisos de toda la app y los vacíos con acción |
| PZ-5 — Campo | texto, área de texto, selector, casilla, opción (radio), interruptor | `.campo-ajuste input`, `.anotar input`, `.campo`, `.reabrir textarea`, `.tono`, `.opcion`, `.gp-casilla`, `.interruptor`, `.cab-2 .filtro.menu`, `.destino .menu-boton` | Ajustes, Bandeja, Ideas, Trabajo, Revisión, Nuevo proyecto |
| PZ-6 — Filtros | con cuenta; como pestañas de texto (el elegido en blanco con una línea debajo) | `.filtros`/`.filtro` (hoy píldoras con borde), `.ancho-lectura` (Angosto · Normal · Ancho) | Bandeja, Trabajo, Revisión, Skills › Framework, Docs |
| PZ-7 — Cuenta y señal | número gris, número ámbar (frena), punto ámbar, punto rojo, etiqueta de texto (sin píldora) | `.cuenta-bandeja`, `.badge`, `.frena-punto`, `.aviso-punto`, `.tarjeta .aviso-fw`, la píldora «framework viejo», «Frena» y el frente de cada pregunta (`.frente-q`), `.medidor` | grilla, Bandeja, Mapa, Skills, barra de estado |
| PZ-8 — Menú y cuadro | menú, menú contextual, cuadro (confirmar, Nuevo proyecto, Eliminar), ventana (Ajustes) | `.menu-lista`, `.menu-contextual`, `.dialogo` y `.velo`, `.ajustes` | menús de la tarjeta, de las conversaciones y de Ideas; los cuadros |
| PZ-9 — Cabecera de sección | título con cuenta, acciones (una principal como mucho), filtros debajo | `Cabecera` (W-9) y las cabeceras propias de Docs (`.barra-doc`), del detalle de Skills (`.sk-detalle .cab`) y de la conversación (`.chat-cab`, `.cab-panel`) | todas las secciones |
| PZ-10 — Pestañas | de la barra lateral (íconos), de los proyectos abiertos, de una ventana (Ajustes), de una vista (Resumen · Archivos en Skills) | `.act`, `.ses`, `.ajustes nav button`, la navegación del detalle de Skills, la fila de hitos del Mapa (`.h`) | el marco, Ajustes, Skills, Mapa |
| PZ-11 — Árbol | carpeta, archivo, elegido, con marca a la derecha (M, A) | `.arbol`/`.nodo` de Archivos, los archivos del detalle de Skills, la lista de cambios de Git | Archivos, Skills, Git |
| PZ-12 — Texto de documento | lectura (Docs, Bandeja) y conversación; tablas con línea solo entre filas, citas, código | `.md` (conversación) y `.doc-texto` (Docs, Bandeja, panel de documento) | Docs, Bandeja, conversación, Mapa |

PZ-11 y PZ-12 no estaban en la tabla de `definicion.md`: aparecieron al mirar las pantallas (el árbol se arma tres veces y el markdown, dos) y se suman ahí.

**Se quedan como propias de su sección** (no se repiten en otro lado): la **tarjeta de proyecto** de la grilla (sin borde: un fondo un punto más claro que el negro, y «framework viejo» como texto gris), el **compositor** de la conversación (una sola línea alrededor, sin la caja de adentro), el **divisor** (`Divisor`, ya compartido), el **visor de código y de diferencias** (Archivos y Git) y las **capturas** de la Revisión.

### Cómo queda cada pantalla
| # | Pantalla | Lo que sobra hoy | Con las piezas |
|---|---|---|---|
| 01–03, 06 | Proyectos (grilla, archivados, ancho chico) | borde en cada tarjeta; «framework viejo» en píldora; «Nuevo proyecto» con recuadro; el interruptor de Archivados con pista | tarjeta sin borde; etiqueta de texto (PZ-7); «Nuevo proyecto» botón principal (es la acción de la pantalla); interruptor (PZ-5) |
| 04 | Menú de la tarjeta | ya va bien: es lo único con sombra | menú contextual (PZ-8), sin cambios de forma |
| 05 | Nuevo proyecto | el campo con borde blanco grueso; «Crear» gris aunque es el principal | cuadro (PZ-8); campo (PZ-5); «Crear» principal, apagado hasta que haya nombre |
| 07, 19 | Bandeja de entrada | tres niveles de caja: pregunta, casilla y nota; «Frena» en píldora ámbar con borde ámbar alrededor de toda la pregunta; el frente en píldora | cada pregunta es un bloque (PZ-3) con su código, el título y la señal ámbar al lado (PZ-7), sin borde; las casillas son filas (PZ-2) con la nota como campo a la derecha; una línea gris entre preguntas; «Enviar» principal |
| 08 | Skills › Framework | la lista en una caja con borde; «Pasar al framework» con recuadro en cada fila | filas sobre el fondo (PZ-2) con «Pasar al framework» como botón sin fondo, a la vista |
| 09 | Ideas | la caja de Anotar con su selector y su botón adentro | campo de una línea (PZ-5) con el destino y «Anotar» como botón chico; filas (PZ-2) |
| 10 | Detalle de una skill | dos cabeceras propias; «ARCHIVOS» en mayúsculas; «Abrir carpeta» con recuadro | cabecera de sección (PZ-9); pestañas Resumen · Archivos (PZ-10); árbol (PZ-11) |
| 11 | Detalle de una idea | (no salió la captura, T-53) | se revisa en su maqueta |
| 12–17, 27 | Ajustes | la ventana con su barra con borde; cada opción de Tono en una caja; «Cambiar de cuenta» con recuadro; el foco visible al abrir | ventana (PZ-8) con pestañas (PZ-10); opciones (PZ-5) como filas con su punto; Apariencia sin el selector de tema (D-104) |
| 18, 20, 30 | Mapa | el bloque de frentes con borde; cada hito en un cuadrado con borde; «Abrir 10-operacion.md» y «Abrir estado.md» con recuadro | hitos como pestañas de números (PZ-10); el frente activo como bloque (PZ-3) sin borde; las líneas de abajo como filas; «Abrir» como botones sin fondo |
| 21 | Trabajo | «Anotar una idea» y el selector de frente con recuadro; filtros en píldora | filtros (PZ-6); el frente como selector sin borde dentro de los filtros; filas (PZ-2) como hoy |
| 22 | Revisión | filtros en píldora; el vacío como texto suelto | filtros (PZ-6); vacío (PZ-4) con lo que hay que hacer (F8) |
| 23 | Docs | tablas con borde en cada celda; el ancho del texto en un grupo con recuadro | texto de documento (PZ-12) con línea solo entre filas; el ancho como filtros (PZ-6) |
| 24 | Archivos | «IRIDIUM» en mayúsculas; el vacío centrado sin recuadro | árbol (PZ-11) con el título como bloque; el vacío como texto gris, sin caja |
| 25 | Git | cada archivo cambiado en una caja; «CAMBIOS» e «HISTORIAL» en mayúsculas | árbol y filas (PZ-11, PZ-2); los títulos como bloques (PZ-3) |
| 26 | Scripts | cada script en una caja con «Ejecutar» con recuadro | filas con detalle debajo (PZ-2), una línea gris entre scripts y «Ejecutar» como botón sin fondo |
| 28 | Un proyecto en ancho chico | las mismas cajas, más apretadas | lo mismo que cada sección |
| 29 | Otro proyecto | — | igual que su sección |
| todas | El marco | la barra del proyecto y la cabecera de la sección con una línea cada una; «Nueva» y «Seguí» con recuadro; «Claude · max» con recuadro; medidores de uso | una sola línea, debajo de la cabecera de la sección; «Seguí» principal (es la acción de la conversación), «Nueva» sin fondo; el uso como números (PZ-7) |

### Reglas que quedan escritas para el rediseño
- **Un principal por pantalla como mucho.** En un proyecto es «Seguí»; en la grilla, «Nuevo proyecto»; en un cuadro, el que confirma.
- **Nunca un bloque dentro de otro, ni una caja dentro de un recuadro.** Lo que hoy es una caja dentro de otra pasa a ser filas.
- **Las acciones de una fila** son botones sin fondo. Si la fila tiene una sola acción que es lo que se viene a hacer (Ejecutar, Pasar al framework), está siempre a la vista; si son varias, aparecen al pasar el ratón o con el foco.
- **Un solo estilo de título de bloque**: gris, tamaño chico, con la cuenta al lado. Nada en mayúsculas.
- **Sin ruido (D-108).** No se muestra lo que no ayuda a decidir nada: la cuenta total al lado del título de una pantalla, la ruta de una carpeta, la hora, «Sin sesiones abiertas», «Claude · max». Lo que anda bien no se anuncia; un estado aparece cuando falla (Claude sin sesión, en rojo abajo). La cuenta que queda es la de lo que espera del usuario.
- **Ajustes es la pantalla de referencia (R-34):** el usuario la marcó como la de mejor UX/UI; las demás se miran contra ella.
- **Un solo color de acción (D-109):** el botón principal es verde con letra negra; lo activo y lo marcado, blanco; ámbar y rojo, solo señales. «Un principal por pantalla» cuenta la sección; el «Continuar» de la conversación es del marco.
- **Español neutro (D-110):** los textos de la app tratan de «tú» («Pídele», «Escribe a la IA…», «Continuar»), sin voseo.
- **El foco se dibuja solo con el teclado** (`:focus-visible`); con el ratón, nada.
- **Los estilos por sección** quedan para lo que es solo de ella (la tarjeta, el compositor, el visor de código, las capturas). Un botón, una fila o un recuadro escritos en un archivo de sección es un error que el control de estilos del pase al código marca.

## Parte 2 — La sección Diseño

Con D-105 la sección es un «Claude Design» local: **las pantallas son maquetas HTML** que escribe la IA en `docs/diseno/` del proyecto, sobre sus tokens y sus piezas, y no capturas de la app. Iridium las muestra vivas, se comentan con `F8` como cualquier app en la Revisión, y probar otra cosa es pedir otra versión. Lo aprobado se pasa al código después.

### Historias (DS-n)
#### DS-1 — Empezar el diseño de un proyecto
- Como usuario quiero pedirle a la IA el diseño de un proyecto que todavía no lo tiene para tener sus pantallas a la vista sin armar nada.
  - Criterios de aceptación:
    - [ ] Sin `docs/diseno/`, la sección lo dice con un recuadro punteado y ofrece **Pedírselo a la IA** (gasta uso, lo dice).
    - [ ] En una app ya armada, la IA dibuja las pantallas como están hoy (sale de su código y de su `06-ui.md`); en una app nueva, sale de su `04-ux.md`. El pedido lo dice.
    - [ ] Mientras la IA escribe, cada maqueta aparece en el lienzo al quedar guardada.

#### DS-2 — Ver el sistema
- Como usuario quiero ver los tokens y las piezas del proyecto en un solo lugar para saber de qué está hecha su interfaz sin abrir el código.
  - Criterios de aceptación:
    - [ ] **Sistema** muestra los colores como muestras con su nombre, las letras con un ejemplo de cada tamaño, los espacios y las esquinas dibujados.
    - [ ] Cada pieza se ve viva con sus variantes (la maqueta de piezas del proyecto) y se comenta con `F8` como una pantalla.

#### DS-3 — Ver todas las pantallas juntas
- Como usuario quiero ver todas las maquetas en un lienzo para juzgar el conjunto de un vistazo.
  - Criterios de aceptación:
    - [ ] **Pantallas** muestra todas las maquetas vivas y achicadas, agrupadas por sección, con su nombre debajo.
    - [ ] Cuando la IA cambia una maqueta, se redibuja sola y queda marcada con un punto hasta que la mirás.
    - [ ] Una maqueta rota (no carga o le falta un archivo) muestra su lugar con el motivo; las demás se ven igual.

#### DS-4 — Usar y comentar una pantalla
- Como usuario quiero agrandar una maqueta, tocarla y comentar sobre ella para que la IA la corrija donde señalo.
  - Criterios de aceptación:
    - [ ] Tocar una maqueta la agranda a todo el lienzo y anda: los clics que tenga (abrir un menú, pasar a otra pantalla) funcionan. Las flechas del costado pasan a la anterior y la siguiente; Esc vuelve.
    - [ ] `F8` prende el modo comentar sobre la maqueta, igual que en una app: el comentario llega a la Revisión del proyecto como `R-n` con el nombre de la maqueta, el lugar y la captura.
    - [ ] **Enviar a la IA** (el de la Revisión) le pasa los comentarios; las maquetas corregidas se redibujan solas.

#### DS-5 — Pedir otra versión o probar una dirección
- Como usuario quiero pedir otra versión de una pantalla, o cambiar el aspecto de todas a la vez, para comparar dos ideas mirándolas.
  - Criterios de aceptación:
    - [ ] En una maqueta agrandada, **Otra versión** pide a la IA una alternativa con una frase («la bandeja como una sola lista»); gasta uso y lo dice.
    - [ ] Las versiones de una pantalla se ven lado a lado; **Quedarme con esta** deja esa y borra las otras, o **Guardar para después** las deja guardadas.
    - [ ] **Probar una dirección** cambia los tokens de todas las maquetas a la vez: una guardada en `docs/diseno/direcciones/` o una nueva pedida con una frase («el negro con un azul muy apagado»). Se ve todo el lienzo con la dirección, y **Hoy · Dirección** alterna o pone las dos lado a lado.
    - [ ] **Elegir** una dirección la vuelve los tokens de las maquetas, con un cuadro que dice qué cambia.

#### DS-6 — Pasar al código
- Como usuario quiero pasar a la app lo que aprobé en las maquetas para que la interfaz real quede igual.
  - Criterios de aceptación:
    - [ ] **Pasar al código** (en la cabecera de Pantallas) manda a la IA del proyecto el pedido con las maquetas cambiadas desde el último pase; gasta uso y lo dice.
    - [ ] Cada maqueta pasada queda marcada como «en la app» con la fecha; una que cambió después vuelve a contarse como pendiente.

#### DS-7 — Comparar con la app de hoy (donde haya capturas)
- Como usuario quiero ver una maqueta al lado de cómo se ve hoy la app para medir el cambio.
  - Criterios de aceptación:
    - [ ] Si el proyecto tiene capturas de la app real (en Iridium, las de `tools/auditoria-ux.ts`), una maqueta agrandada ofrece **La app hoy** y las pone lado a lado. Sin capturas, la opción no aparece: no hace falta un script de capturas por proyecto (D-105).

### Flujos
#### DS-8 — Entrar a Diseño, mirar y comentar
```mermaid
flowchart TD
  A[Barra del proyecto: Diseño] --> B{¿Hay docs/diseno/?}
  B -- No --> C[Recuadro punteado: «Este proyecto todavía no tiene su diseño» + Pedírselo a la IA]
  C --> D[Manda el pedido a la conversación del proyecto] --> E[La IA escribe tokens, piezas y maquetas; aparecen de a una]
  E --> F
  B -- Sí --> F[Pantallas: el lienzo con las maquetas vivas]
  F -- pestaña --> S[Sistema: tokens y piezas]
  F -- tocar una --> G[La maqueta grande, se puede usar] -- Esc --> F
  G -- F8 --> H[Modo comentar: el comentario va a la Revisión como R-n]
  H --> I[Enviar a la IA] --> J[La IA corrige la maqueta; se redibuja sola]
```

#### DS-9 — Otra versión y otra dirección
```mermaid
flowchart TD
  A[Maqueta grande: Otra versión] --> B[Una frase a la IA; avisa que gasta uso] --> C[Las versiones lado a lado]
  C -- Quedarme con esta --> D[Las otras se borran]
  C -- Guardar para después --> E[Quedan guardadas]
  F[Pantallas: Probar una dirección] --> G{¿Cuál?}
  G -- Una guardada --> I
  G -- Una nueva --> H[Una frase a la IA] --> H2[La IA escribe direcciones/nombre.css] --> I
  I[El lienzo entero con la dirección; Hoy · Dirección] -- Elegir --> J[Cuadro: «Cambia los colores de todas las maquetas» Elegir / Cancelar] --> K[Los tokens de las maquetas pasan a ser esos]
  I -- Descartar --> L[Se borra y vuelve a Pantallas]
```

#### DS-10 — Pasar al código
```mermaid
flowchart TD
  A[Pantallas: Pasar al código · 6] --> B[Cuadro: qué maquetas pasan y que gasta uso] --> C[El pedido va a la conversación del proyecto]
  C --> D[La IA construye y marca las maquetas como «en la app»]
  D -- algo queda distinto --> E[Se comenta la app con F8, como siempre]
```

### Arquitectura de información
- **Diseño** es una sección más de la barra de cada proyecto **con framework**, después de Revisión y antes de Docs: es de mirar y decidir, como el Mapa y la Revisión; Docs, Archivos, Git y Scripts son las herramientas. No aparece en una carpeta simple.
- Adentro, dos pestañas (PZ-10): **Pantallas** (la primera: es lo que se viene a mirar) y **Sistema**. Otra versión, Probar una dirección y Pasar al código son acciones, no pestañas: se hacen mirando pantallas.
- Lo que lee, en el proyecto: `docs/diseno/` — los tokens (CSS), las piezas (una maqueta), las maquetas de pantallas agrupadas por sección, sus versiones, las direcciones guardadas y qué se pasó al código y cuándo. El formato exacto lo define el paso 5 con su lector y su control (D-086).
- Los comentarios con `F8` viven en la Revisión del proyecto, como los de la app: una sola bandeja de comentarios para la IA.
- La conversación sigue al lado, como en todas las secciones: lo que se ve se comenta ahí también.

### Pantallas
#### DS-11 — Diseño › Pantallas
- Propósito: ver todas las maquetas juntas.
- Elementos: la cabecera (Diseño, las pestañas, «Probar una dirección», «Pasar al código · N» y, si hay comentarios sin enviar, «3 comentarios», que lleva a la Revisión); el lienzo, agrupado por sección, con cada maqueta viva y su nombre; arriba a la derecha, el tamaño de las miniaturas (chico · grande).
- Estados: sin `docs/diseno/` (recuadro punteado con Pedírselo a la IA); la IA escribiendo (las maquetas aparecen de a una); una cambiada sin mirar (punto junto al nombre); una rota (su lugar con el motivo); una dirección puesta (una línea arriba: «Probando: negro con azul · Hoy · Elegir · Descartar»); muchas (el lienzo se desplaza y los grupos quedan como títulos).

```
┌─────────────────────────────────────────────────────────────┐
│ Diseño  Pantallas · Sistema    [Probar…] [Pasar al código 6]│
├─────────────────────────────────────────────────────────────┤
│ Proyectos                                                   │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                         │
│ │      │ │      │ │      │ │      │                         │
│ └──────┘ └──────┘ └──────┘ └──────┘                         │
│ Grilla   Archiv.  Menú •   Nuevo                            │
│ Un proyecto                                                 │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │
│ │      │ │      │ │      │ │      │ │      │                │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                │
│ Bandeja  Mapa     Trabajo  Revisión Docs                    │
└─────────────────────────────────────────────────────────────┘
```

#### DS-12 — Una maqueta grande
- Propósito: usar la pantalla y comentarla.
- Elementos: arriba, una línea con **Volver**, el nombre y el número («Bandeja · 7 de 30»), **Otra versión** y **La app hoy** (si hay capturas); la maqueta a todo el lienzo, viva; las flechas a los costados.
- Estados: comentando (el aviso chico de la Revisión abajo a la derecha, D-049); con versiones (lado a lado, cada una con **Quedarme con esta**); pidiendo una versión (su lugar con «La IA está escribiendo la versión…»).

```
┌─────────────────────────────────────────────────────────────┐
│ ‹ Volver  Bandeja · 7 de 30      [Otra versión] [La app hoy]│
├─────────────────────────────────────────────────────────────┤
│ ‹ ┌───────────────────────────────────────────────────┐ ›   │
│   │                 la maqueta, viva                  │     │
│   │                                                   │     │
│   └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

#### DS-13 — Diseño › Sistema
- Propósito: ver de qué está hecha la interfaz.
- Elementos: el bloque **Colores** (muestras en fila, nombre y valor); **Letra** (cada tamaño con un ejemplo); **Espacios y esquinas**; **Piezas** (la maqueta de piezas, viva, con cada pieza y sus variantes); «Abrir tokens» sin fondo.
- Estados: sin piezas («Las piezas todavía no están dibujadas» con Pedírselo a la IA); un archivo dañado (recuadro de error con el archivo y la línea).

### Principios de interacción
- **Lo que gasta uso lo dice antes**: empezar el diseño, otra versión, una dirección nueva y pasar al código. Mirar, usar y comentar no gastan.
- **Nada cambia sin un cuadro** cuando toca más de una maqueta (elegir una dirección, pasar al código). Todo queda en `docs/`, así que Git lo deshace.
- **Las maquetas no tocan la app**: son archivos de `docs/diseno/`; la app cambia solo con Pasar al código.
- **Comentar es igual en todos lados**: `F8` en una maqueta, en Iridium o en la app de un proyecto, y todo llega a la Revisión.
- Teclado: en el lienzo, las flechas mueven entre maquetas, Enter agranda y Esc vuelve.

### Accesibilidad
- El contraste del negro se mide con la tanda 5 (`tools/accesibilidad.ts`) al pasar el rediseño al código: texto principal y secundario en AA sobre el negro y sobre el elevado.
- Cada maqueta del lienzo lleva su nombre como texto alternativo; la grande se anuncia con su nombre y su número («7 de 30»).

## Portón
- [x] Inventario de piezas sobre las 30 pantallas, con lo que reemplaza cada una.
- [x] Historias con criterios de aceptación para todo el mínimo (rehechas con D-105: maquetas HTML).
- [x] Flujos principales, con los de error.
- [x] Arquitectura de información: dónde entra la sección y qué lee.
- [x] Wireframes de Pantallas, la maqueta grande y Sistema; estados de cada pantalla.
- [x] Principios de interacción y accesibilidad.
- [x] ¿Cambia algo de los documentos generales? Sí: PZ-11 y PZ-12 en `definicion.md`; los códigos `PZ-n` y `DS-n` en `docs/README.md` (aplicado).
- [x] El usuario recorrió los flujos y los aprobó (Q-150 cambió el modelo, D-105; la parte 2 rehecha, aprobada con Q-151, D-106).
