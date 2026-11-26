---
name: Iridium
description: Consola negra y tranquila para dirigir proyectos con la IA.
colors:
  fondo: "#000000"
  elevado: "#0c0c0d"
  tarjeta: "#0a0a0b"
  hover: "#111113"
  sel-fondo: "#161618"
  velo: "#000000b3"
  borde: "#1c1c1e"
  borde-suave: "#121213"
  borde-fuerte: "#2a2a2d"
  borde-control: "#3d3d42"
  texto: "#e6e6e6"
  texto-2: "#a3a3a3"
  texto-3: "#8a8a8a"
  texto-apagado: "#4d4d4d"
  principal: "#3ccf7f"
  principal-hover: "#5adb93"
  principal-fondo: "#06140c"
  sobre-principal: "#000000"
  marcado: "#4cc38a"
  espera: "#ff9f1c"
  espera-fondo: "#0d0a04"
  espera-borde: "#3a2f15"
  error: "#e5484d"
  error-fondo: "#0f0506"
  error-borde: "#3d1a1c"
  seleccion: "#ffffff2e"
  acento-cian: "#38d6ff"
  acento-verde: "#3ce08f"
  acento-azul: "#6c8cff"
  acento-violeta: "#b48cff"
  estado-uso: "#4cc38a"
  estado-desarrollo: "#5b9dff"
  estado-idea: "#c39bff"
  estado-rescate: "#ff7a59"
  bien: "#4cc38a"
  recomendada: "#f2c94c"
  enlace: "#6cb6ff"
  cod-clave: "#569cd6"
  cod-cadena: "#ce9178"
  cod-comentario: "#6a9955"
  cod-numero: "#b5cea8"
  cod-suma: "#0b1a10"
  cod-resta: "#1c0a0b"
  git-modificado: "#e2c08d"
  git-agregado: "#73c991"
  git-borrado: "#e5484d"
typography:
  documento:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
  titulo:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.35
  lectura:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  cuerpo:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.5
  boton:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 500
    lineHeight: 1
  control:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1
  rotulo:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    lineHeight: 1.5
  meta:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  codigo:
    fontFamily: "Cascadia Mono, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "8px"
  fila: "8px"
  bloque: "12px"
  tarjeta: "16px"
  pildora: "999px"
spacing:
  esp-1: "4px"
  esp-2: "8px"
  esp-3: "12px"
  esp-4: "16px"
  esp-5: "24px"
  esp-6: "32px"
  esp-7: "48px"
components:
  button-principal:
    backgroundColor: "transparent"
    textColor: "{colors.principal}"
    typography: "{typography.boton}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  button-principal-hover:
    backgroundColor: "{colors.principal-fondo}"
    textColor: "{colors.principal-hover}"
  button-secundario:
    backgroundColor: "transparent"
    textColor: "{colors.texto}"
    typography: "{typography.boton}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  button-secundario-hover:
    backgroundColor: "{colors.hover}"
  button-sin-fondo:
    backgroundColor: "transparent"
    textColor: "{colors.texto-2}"
    typography: "{typography.boton}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "30px"
  button-peligroso:
    backgroundColor: "transparent"
    textColor: "{colors.error}"
    typography: "{typography.boton}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  campo:
    backgroundColor: "transparent"
    textColor: "{colors.texto}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "32px"
  fila:
    textColor: "{colors.texto}"
    typography: "{typography.cuerpo}"
    rounded: "{rounded.fila}"
    padding: "4px 8px"
    height: "34px"
  fila-elegida:
    backgroundColor: "{colors.sel-fondo}"
  recuadro-aviso:
    backgroundColor: "{colors.espera-fondo}"
    textColor: "{colors.texto-2}"
    rounded: "{rounded.bloque}"
    padding: "12px 16px"
  recuadro-error:
    backgroundColor: "{colors.error-fondo}"
    textColor: "{colors.texto-2}"
    rounded: "{rounded.bloque}"
    padding: "12px 16px"
  ventana:
    backgroundColor: "{colors.elevado}"
    rounded: "{rounded.tarjeta}"
    width: "860px"
    height: "600px"
---

# Design System: Iridium

> Escrito desde lo construido al cerrar DI-I3 (2026-11-21). Lo que manda es el código: los tokens de `docs/diseno/tokens.css` (la app lo importa tal cual, D-121) y las piezas de `docs/diseno/piezas.css`, que la app tiene en `src/renderer/estilos/piezas.css`, cada una con su ficha (D-117). El frontmatter y `.impeccable/design.json` salen de ahí. El sistema de antes (Iridium verde y Carbón, Chakra Petch) quedó en el historial de git; su historia, en `docs/06-ui.md`.

## Overview

**Creative North Star: «Negro, quieto, y el color solo cuando dice algo»**

Un solo tema, negro puro (D-103, D-104). Las secciones se apoyan directo en el negro, sin tarjetas de fondo: se separan con espacio y, donde hace falta, con una línea apenas visible. El texto va en tres grises neutros, sin tinte. Desde Pulido (D-197), un aire de instrumento sobre ese negro: lo activo en un acento con un brillo suave (cian, o el que se elija en Ajustes › Apariencia), los estados de los proyectos con su color y un movimiento sutil. Lo elegido en una lista va en blanco; lo prendido, en verde.

La forma es la de VS Code (D-031, D-041): arriba la barra de proyectos, a la izquierda la de secciones, a la derecha la conversación y abajo una barra de estado fina. Ajustes es la pantalla de referencia (R-34): las demás se miran contra ella.

**Key Characteristics:**
- Un solo tema oscuro, negro, con un acento elegible para lo activo (D-197). No hay tema claro ni selector de tema.
- Un solo color de acción: el verde del botón principal, uno por pantalla (D-109, D-120).
- El color informa: ámbar lo que espera al usuario, rojo un error, verde lo prendido y lo que anda, azul los enlaces, y los colores del código y de Git (D-124).
- Sin ruido: lo que anda bien no se anuncia; un estado aparece cuando falla (D-108).
- La letra del sistema (Segoe UI Variable) para todo; Cascadia Mono solo para códigos y números.
- Español neutro en todos los textos de la app (D-110).

## Colors

Negro puro, cuatro superficies casi negras, cuatro líneas y tres grises de texto. El color se usa poco y siempre dice algo.

### Primary
- **Verde de acción** (`principal`): la letra y el borde del botón principal y nada más; quieto va sobre el negro y al pasar el mouse se ilumina (`principal-hover`, `principal-fondo`). Uno por pantalla; la excepción es el Enviar de cada pregunta de la Bandeja (R-73).
- **Verde marcado** (`marcado`): lo prendido (casillas, opciones, interruptores). No es un color de acción.

### Secondary
- **El acento** (`acento`, con `acento-tenue` y `brillo-acento`; D-197): lo activo: el ícono de la sección elegida y su rayita, el paso actual de un camino (que late), la pestaña que arrastrás, el punto de lo que espera sin frenar y «corriendo». Se elige en Ajustes › Apariencia entre `acento-cian` (el que viene), `acento-verde`, `acento-azul` y `acento-violeta`; nunca en texto para leer.
- **Naranja** (`espera`, con `espera-fondo` y `espera-borde`; Q-303): lo que espera al usuario y frena: la cuenta de preguntas, una prueba pendiente, el aviso que pide algo.
- **Los estados de los proyectos** (`estado-uso`, `estado-desarrollo`, `estado-idea`, `estado-rescate`; para eliminar, `error`): el punto y la palabra del estado en cada tarjeta. Pausado, descontinuado y archivado, en gris.
- **Amarillo de la recomendada** (`recomendada`): solo la estrella de la opción recomendada en una pregunta (R-85).

### Tertiary
- **Rojo** (`error`, con `error-fondo` y `error-borde`): un error y lo que borra (el aviso de error, Eliminar).
- **Verde de lo que anda** (`bien`): los medidores con margen (se ponen ámbar y rojo al llenarse, R-56), la señal de Trabajando y el tilde de lo que funciona.
- **Azul de enlace** (`enlace`): un enlace dentro de un texto (Q-171).
- **El código y Git:** `cod-*` para un bloque de código y las diferencias; `git-*` para las letras de VS Code (M, A/U, D).

### Neutral
- **Fondo** (`fondo`, `#000`): toda la app.
- **Elevado** (`elevado`): lo que flota o se separa: menús, cuadros, ventanas, el ícono de una fila.
- **Tarjeta** (`tarjeta`): un bloque de código.
- **Hover** y **Elegido** (`hover`, `sel-fondo`): el fondo al pasar el mouse y el de la fila, la pestaña o la opción elegida.
- **Velo** (`velo`): detrás de un cuadro abierto.
- **Líneas:** `borde` (la común), `borde-suave` (entre filas), `borde-fuerte` (lo que tiene que verse sobre el negro: el compositor, las citas, la barra de desplazamiento) y `borde-control` (lo que se toca: campos, casillas, el botón secundario).
- **Texto:** `texto` (lo que se lee), `texto-2` (lo secundario, los íconos, los botones sin fondo), `texto-3` (lo de apoyo: fechas, cuentas, títulos de bloque; el más tenue que pasa AA) y `texto-apagado` (lo deshabilitado; nunca texto que haya que leer).

### Named Rules
**The Un Verde Rule.** El verde del botón principal es el único color de acción, y hay uno por pantalla como mucho (D-109). Lo activo va en el acento (D-197) y lo elegido en una lista, en blanco; ninguno en el verde de acción.

**The Color Informa Rule.** El color está donde informa: lo activo, los estados, medidores, enlaces, código, Git, naranja y rojo (D-124, D-197). El texto para leer no lleva color nuevo ni brillo.

**The Sin Ruido Rule.** No se muestra lo que no ayuda a decidir: ni la cuenta total al lado de un título, ni la hora, ni «todo bien». La cuenta que queda es la de lo que espera al usuario (D-108).

**The Ningún Color Escrito Rule.** Las secciones solo usan `var(--…)`; el control de estilos (`tests/estilos.test.ts`) marca un color escrito o una pieza rehecha en una sección.

## Typography

**Body Font:** Segoe UI Variable Text (con Segoe UI y system-ui): la del sistema, sin fuentes propias.
**Mono Font:** Cascadia Mono (con Consolas): solo códigos (D-n, Q-n), rutas, valores y números en columna.

**Character:** la letra de Windows, para que Iridium se lea como una herramienta de la PC y no como un disfraz. Cinco tamaños y nueve estilos con nombre (`--estilo-*`, D-116), que se usan con `font: var(--estilo-…)`.

### Hierarchy
- **Documento** (600, 22 px, 1,25): el título de un documento, uno por página.
- **Título** (600, 17 px, 1,35): el título de una sección o un cuadro y los subtítulos de un documento.
- **Lectura** (400, 15 px, 1,65): el cuerpo de un documento, hasta 760 px de ancho.
- **Cuerpo** (400, 13,5 px, 1,5): el texto de la interfaz: filas, mensajes, el compositor.
- **Botón** (500, 13,5 px) y **Control** (400, 13,5 px): botones; campos, opciones de menú y pestañas.
- **Rótulo** (500, 12,5 px): los títulos de bloque, en el gris de apoyo, con la cuenta al lado.
- **Meta** (400, 12,5 px): lo que acompaña: el detalle de una fila, fechas, la barra de abajo.
- **Código** (400, 12,5 px, mono): códigos, cuentas y números en columna.

### Named Rules
**The Sin Mayúsculas Rule.** Nada en mayúsculas sostenidas. Un solo estilo de título de bloque: gris, chico, con la cuenta al lado.

**The Mono Es Dato Rule.** La mono es para lo que es dato; la prosa, nunca.

## Layout

App de escritorio sin scroll de página; cada zona desplaza lo suyo. Las medidas que se repiten son tokens (`--alto-*`, `--ancho-*`, D-119), y el control avisa de una repetida a mano.

- **El marco:** la barra de proyectos arriba (36 px, con el inicio y los botones de Windows a la derecha), la barra de secciones a la izquierda (48 px), la conversación a la derecha (360 px de entrada, con un divisor que la ensancha) y la barra de estado abajo (26 px).
- **Una sección:** la Cabecera (PZ-9) arriba y el contenido con su margen. Lo que se lee va centrado hasta 760 px; las listas centradas, hasta 820 px; las de renglones largos, hasta 1080 px.
- **Con columna:** Docs y Archivos llevan el árbol a la izquierda (240 px); Git, su panel de 340 px, como VS Code.
- **Ajustes:** una ventana de 860 × 600 px con las pestañas a la izquierda (200 px).

Ritmo: 4, 8, 12, 16, 24, 32 y 48 px (`--esp-1` a `--esp-7`), cada uno con su uso escrito en `tokens.css`.

## Elevation & Depth

Plana. No hay fondos de tarjeta ni tonos escalonados: todo se apoya en el negro, y lo que separa es el espacio y una línea de 1 px. Solo lleva sombra lo que flota.

### Shadow Vocabulary
- **Menú** (`--sombra-menu`): menús y listas que se abren, con un anillo de `borde-fuerte`.
- **Ventana** (`--sombra-ventana`): cuadros y la ventana de Ajustes, sobre el velo.
- **Brillo del medidor:** el relleno de cada medidor del uso, en su color. Es el único brillo.

### Named Rules
**The Solo Flota Rule.** La sombra es de lo que flota; el borde, del Recuadro, de los Campos y del botón secundario. Nunca un bloque dentro de otro ni una caja dentro de un recuadro.

## Shapes

Esquinas de 8 px en controles y filas, 12 px en recuadros, menús, el compositor y los bloques de código, y 16 px en cuadros y ventanas; lo redondo (interruptores, la «i», la barra de desplazamiento), en píldora. Bordes de 1 px. Íconos de trazo, propios (`src/renderer/ui/Icono.tsx`).

## Components

Las dieciséis piezas, con su ficha (Grupo, Para qué, Estados) en el comentario que las encabeza en `piezas.css`; Diseño › Sistema las muestra con sus variantes. En la app, las que tienen comportamiento son componentes de `src/renderer/ui/`.

### Acciones
- **Botón (PZ-1):** principal (verde delineado, uno por pantalla), secundario (con el borde de control), sin fondo (las acciones de una fila), peligroso (rojo, solo lo que no se deshace), chico (24 px, en una fila o un recuadro) y solo ícono (30 × 30).
- **Campo (PZ-5):** texto, área, selector, casilla, opción e interruptor; 32 px (26 el chico). Con el foco, el borde se aclara; lo marcado, en verde. Lo escrito se guarda solo.
- **Menú, cuadro y ventana (PZ-8):** lo que flota. El menú (también con clic derecho y con el ⋯ de una tarjeta), el menú en lista (con título y detalle, la elegida resaltada), el cuadro que confirma o pide un dato (440 px) y la ventana de Ajustes. Arriba del compositor, el menú se abre hacia arriba y, en lista, toma su ancho (el + y la lista de «/»).

### Contenido
- **Fila (PZ-2):** un elemento de una lista; sus acciones aparecen al pasar el mouse o con el foco, y la que se viene a hacer está siempre.
- **Bloque (PZ-3):** agrupa bajo un título gris y chico, con la cuenta. Nunca uno dentro de otro.
- **Texto de documento (PZ-12):** un markdown para leer (Docs, la Bandeja, las respuestas de la IA); tablas con línea solo entre filas y enlaces en azul.
- **Fila que se abre (PZ-13):** se abre en su lugar, con su contenido y sus botones (una idea).
- **Etiqueta de enlace (PZ-14):** un enlace dentro de un texto que se escribe: ícono, nombre y sitio en gris, con borde.
- **Camino (PZ-15):** los pasos en orden con sus ramas (el Mapa): un carril con un punto por paso y la señal a la derecha.
- **Ficha (PZ-16):** lo que va con un mensaje, arriba del cuadro de escribir: la foto como miniatura cuadrada (56 px; 72 en un mensaje mandado), el archivo o el texto pegado con su ícono y su nombre, con borde y la ✕ para sacarlo; con borde rojo, lo que no se puede mandar.

### Avisos
- **Recuadro (PZ-4):** lo que hay que ver aunque no se busque: aviso (ámbar), error (rojo), vacío y punteado (lo que todavía falta), con su acción si la tiene.
- **Cuenta y señal (PZ-7):** un número o una marca chica, sin píldora: ámbar lo que frena, rojo lo que falla, verde lo que anda, blanco lo que está listo. Si nada falla, no se muestra.

### Navegación
- **Cabecera de sección (PZ-9):** el título con su cuenta, sus acciones a la derecha (una principal como mucho) y los filtros debajo.
- **Filtros (PZ-6):** acotan una lista; cada uno con su cuenta.
- **Pestañas (PZ-10):** entre vistas de un mismo lugar; también verticales (Ajustes) y con números (los hitos del Mapa).
- **Árbol (PZ-11):** carpetas y archivos con la letra de Git a la derecha; los nodos, de 26 px.

### De una sección
Lo que es solo de una sección va en su hoja de estilos y se arma con los tokens; un botón, una fila o un recuadro rehechos ahí son un error que marca el control.
- **Tarjeta de proyecto** (Proyectos): sin relleno, con una línea que se aclara al pasar el mouse; el ícono redondo, el nombre y el estado con su punto; al pie, el frente, los avisos del framework en rojo y las Señales. Al pasar el mouse, el ⋯ con el menú del clic derecho. Una archivada va más tenue y dice desde cuándo («archivado el 12 oct»). El estado y archivar se ven en la tarjeta al instante y vuelven atrás solo si fallan (Q-240).
- **La conversación:** la cabecera con su nombre, las anteriores, Nueva y Continuar; los mensajes con el Texto de documento y el compositor con una sola línea alrededor.
- **Medidores del uso** (barra de estado): finos, en verde, ámbar o rojo según cuánto queda, con su brillo; su detalle es un Menú.
- **El visor de código** (Archivos, Git): los números de línea apagados, los colores `cod-*` y las diferencias con fondo verde o rojo.
- **La Revisión sobre otra app** (la extensión): todavía con el aspecto de antes (Chakra Petch y el verde con tinte); pasarla al negro es T-99.

### Movimiento
Una sola curva de salida, `--sale` (`cubic-bezier(.16, 1, .3, 1)`), para todo lo que aparece o se mueve, con tres duraciones (D-197): `--dur-hover` (el fondo al pasar el mouse), `--dur-entrada` (menús, cuadros, avisos, paneles, la casilla al marcarse y las pestañas que se corren cuando arrastrás una) y `--dur-pulso` (lo único que late: el paso actual de un camino, como un radar, y «corriendo» con las consolas plegadas). Iridium no sigue el ajuste de animaciones apagadas de Windows (Q-301): ninguna hoja usa `prefers-reduced-motion` y el control de estilos lo marca.

## Do's and Don'ts

### Do:
- **Do** usar un solo botón principal por pantalla; las acciones de una fila, sin fondo.
- **Do** separar con espacio y, donde haga falta, con una línea; el borde, solo del Recuadro, los Campos y el botón secundario.
- **Do** poner el color solo donde informa (lo activo en el acento, los estados, medidores, enlaces, código, Git, naranja y rojo).
- **Do** elegir un token por lo que dice su uso en `tokens.css`, no por cómo se ve.
- **Do** dibujar el foco solo con el teclado (`:focus-visible`).
- **Do** escribir los textos en español neutro, de «tú» (D-110).

### Don't:
- **Don't** escribir un color ni rehacer una pieza en una sección: el control lo marca.
- **Don't** poner un bloque dentro de otro ni una caja dentro de un recuadro.
- **Don't** anunciar lo que anda bien ni mostrar cuentas que no esperan al usuario (D-108).
- **Don't** usar mayúsculas sostenidas ni la mono para la prosa.
- **Don't** poner sombra a lo que no flota ni brillo fuera de lo activo, lo que espera y los medidores.
- **Don't** sumar un tema ni un segundo color de acción (D-104, D-109).
