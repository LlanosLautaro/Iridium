---
name: Iridium
description: Consola de fósforo tranquila para dirigir proyectos con la IA.
colors:
  fondo: "#0a0f0e"
  lateral: "#070b0a"
  barra: "#060908"
  elevado: "#0e1513"
  hover: "#121c19"
  caja: "#0f1714"
  medidor-fondo: "#17241f"
  borde: "#18241f"
  borde-suave: "#121b18"
  borde-fuerte: "#24362f"
  borde-control: "#557068"
  texto: "#d9e6e0"
  texto-2: "#a3b8b0"
  texto-3: "#74908a"
  primario: "#3ee6a8"
  primario-texto: "#5cecb8"
  espera: "#f5b13d"
  espera-borde: "#4a3c1a"
  espera-fondo: "#12170f"
  error: "#ff5f57"
  sobre-color: "#0a0d0b"
  seleccion: "#3ee6a844"
  sel-fondo: "#0f241d"
  cod-cadena: "#c9b77a"
typography:
  titulo:
    fontFamily: "Chakra Petch, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  lectura:
    fontFamily: "Chakra Petch, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  base:
    fontFamily: "Chakra Petch, Segoe UI, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  etiqueta:
    fontFamily: "Chakra Petch, Segoe UI, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.02em"
  chico:
    fontFamily: "Chakra Petch, Segoe UI, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "JetBrains Mono, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  mono-dato:
    fontFamily: "JetBrains Mono, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
rounded:
  medidor: "3px"
  control: "5px"
  fila: "6px"
  bloque: "8px"
  tarjeta: "10px"
  pildora: "11px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "32px"
components:
  button-primario:
    backgroundColor: "{colors.texto}"
    textColor: "{colors.sobre-color}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "30px"
  button-secundario:
    backgroundColor: "transparent"
    textColor: "{colors.texto-2}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "30px"
  button-secundario-hover:
    textColor: "{colors.texto}"
  button-icono:
    backgroundColor: "transparent"
    textColor: "{colors.texto-3}"
    rounded: "{rounded.control}"
    size: "30px"
  button-icono-hover:
    backgroundColor: "{colors.hover}"
    textColor: "{colors.texto}"
  chip-trabaja:
    textColor: "{colors.primario}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.control}"
    padding: "0 7px"
    height: "20px"
  chip-espera:
    textColor: "{colors.espera}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.control}"
    padding: "0 7px"
    height: "20px"
  chip-error:
    textColor: "{colors.error}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.control}"
    padding: "0 7px"
    height: "20px"
  tarjeta-pedido:
    backgroundColor: "{colors.espera-fondo}"
    textColor: "{colors.texto}"
    rounded: "{rounded.tarjeta}"
    padding: "14px 16px"
  compositor:
    backgroundColor: "{colors.caja}"
    textColor: "{colors.texto}"
    rounded: "{rounded.tarjeta}"
    padding: "12px 14px 8px"
  pestana-sesion:
    backgroundColor: "{colors.barra}"
    textColor: "{colors.texto-3}"
    height: "40px"
    padding: "0 6px 0 14px"
  pestana-sesion-activa:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.texto}"
  nodo-mapa:
    textColor: "{colors.texto-2}"
    height: "27px"
    padding: "0 14px 0 10px"
  nodo-mapa-sel:
    backgroundColor: "{colors.sel-fondo}"
    textColor: "{colors.texto}"
    rounded: "6px"
  medidor:
    backgroundColor: "{colors.medidor-fondo}"
    rounded: "{rounded.medidor}"
    width: "72px"
    height: "6px"
---

# Design System: Iridium

> El nombre es Iridium (D-033). Fuente de los tokens: `docs/ui/vista-proyecto.html`, la primera superficie construida y revisada.

## Overview

**Creative North Star: "La consola de fósforo que se lee como un libro"**

Casi negro con tinte verde, una sola luz de fósforo y la conversación en el centro. Es una consola, pero no se disfraza de terminal: nada de mayúsculas, rayas ni brillo en las superficies. Se lee tranquilo, como un texto largo (D-029).

La forma es la de VS Code (D-031): barra de actividad a la izquierda, sesiones como pestañas, área principal grande, panel que se despliega y barra de estado abajo. Casi todo es gris verdoso. El color aparece solo para avisar algo, y siempre con ícono y palabra.

El estilo es F4 (D-032): esquinas redondeadas, tarjetas suaves con fondo apenas teñido y medidores finos. Los medidores son lo único que brilla.

**Key Characteristics:**
- Solo oscuro. No hay tema claro. Dos temas: este, **Iridium**, y **Carbón** (abajo, «Themes»; D-066).
- Tres señales y nada más: verde (activo, hecho, foco), ámbar (frena: sin el usuario no se sigue), rojo (error). Lo que espera al usuario sin frenar va en gris (D-100).
- Chakra Petch para todo lo que se lee; JetBrains Mono solo para códigos y números.
- Densidad de herramienta de escritorio: base de 13,5 px, lectura de 15 px.
- Profundidad por tono, no por sombra.

## Themes

Los tokens de este documento son los del tema **Iridium**, el de siempre. **Carbón** (D-066) es el mismo sistema con otros valores, en `docs/ui/tokens.css` bajo `:root[data-tema="carbon"]`:
- Neutros casi negros sin tinte (fondo `#111113`, lateral `#0d0d0f`, barra `#0a0a0b`, elevado `#18181b`); texto `#e4e4e7`, `#a9aab1` y `#8b8c94`.
- Lo activo y el foco en **Azul Apagado** (`#6c9eff`) en lugar del Verde Fósforo; «hecho» en verde suave (`#5fbf8a`); ámbar `#e0a84a` y rojo `#ef6a62`.
- Letra del sistema (Segoe UI) para leer, base de 13 px y lectura de 14,5 px; JetBrains Mono igual.
- Las mismas reglas: tres señales, color solo para avisar, profundidad por tono.
Un tema nuevo es otro bloque de tokens con su tabla de contraste en `06-ui.md`; ninguna pantalla usa colores sueltos.

## Colors

Una familia de casi negros verdosos, grises salvia para el texto y tres señales saturadas que se usan poco.

### Primary
- **Verde Fósforo** (primario): lo activo y el foco. Pestaña activa, ícono activo de la barra, miga actual, nombre de la IA, chip «Trabajando», «hecho» en el mapa, borde del compositor con foco, contorno de foco, el tirador al arrastrar y el relleno de los medidores. Nunca es fondo de un botón.
- **Fósforo Claro** (primario-texto): solo el código en línea dentro de la conversación.

### Secondary
- **Ámbar de Espera** (espera): solo lo que frena (D-100). Chip «Frena», la cuenta con «!» cuando algo frena y el medidor que se acerca al límite. Las cuentas que no frenan van en gris y ningún botón es ámbar.
- **Ámbar Hundido** (espera-borde): borde del aviso flotante. La pregunta que frena lleva el borde entero en ámbar al 55 %.
- **Fondo de Pedido** (espera-fondo): fondo apenas teñido de la pregunta que frena.

### Tertiary
- **Rojo Señal** (error): solo errores, en chip con ícono y palabra.

### Neutral
- **Negro Fósforo** (fondo): la conversación y la pestaña activa.
- **Negro Lateral** (lateral): barra de actividad y panel derecho; un paso más oscuro que el fondo.
- **Negro Barra** (barra): barra de sesiones y barra de estado, lo más oscuro.
- **Superficie Elevada** (elevado): el aviso flotante y el fondo del código en línea.
- **Fondo del Compositor** (caja): la tarjeta donde se escribe.
- **Velo de Hover** (hover): fondo de hover en pestañas, botones de ícono y nodos.
- **Fondo de Selección** (sel-fondo): el nodo seleccionado del mapa.
- **Canal del Medidor** (medidor-fondo): la pista vacía de los medidores.
- **Borde Verdoso** (borde): divisiones del marco (actividad, pestañas, barra de estado, tirador).
- **Borde Susurro** (borde-suave): divisiones internas (migas, cabecera del panel, entre turnos).
- **Borde Firme** (borde-fuerte): botones secundarios, compositor, barra de scroll y subrayado de enlaces de código.
- **Borde de Campo** (borde-control): el borde de los campos de texto chicos (notas, «Otro»), que tiene que verse como campo: 3,4:1 sobre el fondo.
- **Blanco Ceniza Verde** (texto): texto principal.
- **Gris Salvia** (texto-2): texto secundario, autor «Vos», nodos del mapa, docs.
- **Gris Liquen** (texto-3): lo terciario: horas, íconos en reposo, ayudas, placeholder.
- **Tinta sobre Color** (sobre-color): texto sobre un fondo lleno: el botón principal claro.
- **Selección Fósforo** (seleccion): la selección de texto, verde al 27 %.
- **Cadena de Código** (cod-cadena): solo en el visor de Archivos, las cadenas y los números del código (D-042). Los comentarios van en gris liquen y las palabras clave en verde texto; no es un color de estado.

### Named Rules
**The Color Avisa Rule.** El color solo señala estado: verde activo, ámbar frena, rojo error. Todo lo demás es gris verdoso (D-031, D-100).

**The Ícono y Palabra Rule.** Ningún estado va solo con color: cada chip y cada nodo lleva ícono y palabra («Trabajando», «2 preguntas», «Error», «pendiente»).

**The Ámbar Frena Rule.** El ámbar es solo para lo que frena: sin la respuesta del usuario, la IA no sigue. Lo que espera sin frenar (una cuenta, una pregunta, una prueba) va en gris (D-100).

**The Botón Claro Rule.** El botón principal es claro y sin color (fondo del texto principal, tinta sobre color): pide sin avisar. Ni ámbar, que avisa, ni verde, que marca (D-100).

## Typography

**Display Font:** no hay. El título más grande mide 16 px.
**Body Font:** Chakra Petch (con Segoe UI, sans-serif), autoalojada en 400, 500, 600 y 700.
**Label/Mono Font:** JetBrains Mono (con Consolas, monospace), variable 100–800.

**Character:** Chakra Petch da el aire de centro de mando sin gritar; en minúscula y a buen interlineado se lee como prosa. JetBrains Mono queda para lo que es dato: códigos, horas, porcentajes, rutas.

### Hierarchy
- **Título** (600, 16 px, 1,4): la pregunta de la tarjeta del pedido y los títulos de un doc.
- **Lectura** (400, 15 px, 1,65): el texto de la conversación, máximo 72ch.
- **Base** (400, 13,5 px, 1,5): todo el marco; nodos del mapa y docs del panel. Números tabulares en todo el body.
- **Etiqueta** (600, 12,5 px, 0,02em): chips, botones (13 px), pestañas del panel, autor del turno (13 px), sección del mapa. Sin mayúsculas.
- **Chico** (400, 12,5 px): migas, barra de estado, ayudas, lista de herramientas.
- **Mono** (400, 12,5 px): código en línea y citas como `archivo.md › Título`.
- **Mono dato** (500, 12 px, 1): horas, porcentajes, numeración del mapa, códigos Q-n (700), contador (700, 11 px).

### Named Rules
**The Dos Letras Rule.** Chakra Petch para leer, JetBrains Mono solo para códigos y números. No se suma otra familia.

**The Minúscula Rule.** Nada en mayúsculas sostenidas. Las etiquetas se distinguen por peso (600) y un tracking leve (0,02em), no por versalitas.

## Layout

Grilla de app de escritorio fija en la ventana, sin scroll de página. Ancho mínimo 1024 px; probada de 1280 a 1920.

- Columnas: barra de actividad de 52 px y el resto.
- Filas: barra de sesiones de 40 px, trabajo, barra de estado de 28 px (ocupa todo el ancho).
- Migas y cabecera del panel: 38 px.
- La conversación va centrada a 780 px como máximo, con 32 px a los costados. El último turno se apoya sobre el compositor: el hilo arranca abajo.
- El panel derecho mide 340 px por defecto; se arrastra entre 260 px y el 60 %, también con flechas (20 px, 60 px con Shift). Se abre y cierra con Ctrl+B y se intercambia con la conversación sin cambiar la jerarquía.
- El área principal no baja de 420 px.
- Con el panel cerrado y un aviso a la vista, la columna se corre para dejarle 340 px libres al aviso.

Ritmo: 4, 8, 14, 20 y 32 px. Los turnos separan 14 px arriba y abajo con una línea suave entre ellos. Los grupos internos usan 6 a 10 px.

## Elevation & Depth

Plana y por tono. La profundidad sale de tres negros escalonados (barra, lateral, fondo) y de bordes verdosos de un píxel. Solo lleva sombra lo que flota sobre la interfaz (el aviso, los menús y diálogos, la ventana de Ajustes), y hay un solo brillo, el de los medidores.

### Shadow Vocabulary
- **Flotante** (`--sombra-flotante`, `0 6px 14px oklch(0 0 0 / .5)`): el aviso abajo a la derecha y lo que la Revisión pone sobre una app ajena.
- **Menú** (`--sombra-menu`, `0 10px 28px oklch(0 0 0 / .55)`): los menús que se despliegan y los diálogos de confirmación.
- **Ventana** (`--sombra-ventana`, `0 24px 64px oklch(0 0 0 / .6)`): la ventana de Ajustes, sobre el fondo velado.
- **Brillo de medidor** (`box-shadow: 0 0 8px <color del medidor>`): el relleno de cada medidor de la barra de estado, en el color de su señal.
- Los anillos de foco y de selección (`0 0 0 1px` o `3px` de color) no son sombras: marcan, no elevan.

Radios: siempre uno de `rounded` (`--radio-…`). Las marcas finitas (la línea de la pestaña activa, la del Mapa) usan el de medidor; un círculo, 50 %.

### Named Rules
**The Solo los Medidores Brillan Rule.** Ningún fondo, tarjeta, texto ni botón lleva brillo. El resplandor es exclusivo del relleno de los medidores (D-032).

## Shapes

Esquinas redondeadas y discretas. Controles a 5 px (botones, chips, botón de ícono, contador). Tarjetas a 10 px (pedido, compositor, aviso). Medidores a 3 px. El chip de las migas pasa a píldora (11 px) y el nodo seleccionado del mapa a 6 px, con margen de 6 px a los lados. Bordes de 1 px; los indicadores de activo son barras de 2 px (a la izquierda en la actividad, arriba en la pestaña de sesión, abajo en las pestañas del panel). Íconos de trazo, 1,6 de grosor, puntas redondas, de 12 a 21 px.

## Components

### Buttons
Compactos y de escritorio.
- **Shape:** control (5 px), 30 px de alto, 14 px a los costados, etiqueta de 13 px.
- **Primario:** claro, sin color: fondo del texto principal con tinta sobre color (D-100). Es la acción principal de la pantalla («Enviar», «Responder», «Responder en otra app»). Hover: brillo al 110 %.
- **Secundario:** sin fondo, borde firme, texto gris salvia. Hover: texto principal y borde gris liquen. «Detener» es secundario con ícono cuadrado relleno.
- **Botón de ícono:** 30 × 30, gris liquen; hover con velo y texto principal; presionado, en verde.
- **Foco:** contorno de 1 px en verde, hacia adentro.

### Chips
- **Style:** sin fondo, 20 px de alto, borde de 1 px del color del texto al 45 %, ícono de 12 px más palabra, etiqueta de 12,5 px.
- **Estados:** trabaja (verde, ícono que gira), espera (gris), frena (ámbar), error (rojo), ok (verde). En las migas el chip es píldora y es un botón que lleva a Pendientes.

### Cards / Containers
- **Pedido (Q-n):** tarjeta (10 px), con borde firme; la que frena, con el fondo de pedido y el borde entero en ámbar al 55 % (D-100); 14 × 16 px de relleno, máximo 72ch. Adentro: código Q-n en mono 700 con su chip, la pregunta en título, el contexto citado en chico y las acciones.
- **Aviso:** 320 px, fijo abajo a la derecha, superficie elevada, borde ámbar hundido, sombra flotante. Entra subiendo 8 px en 0,3 s con medio segundo de demora. Se cierra con Esc.

### Inputs / Fields
- **Compositor:** tarjeta (10 px), fondo del compositor, borde firme. Adentro, un signo `>` en mono verde, el área de texto de 14 px con cursor verde y una fila con la ayuda y las acciones (Detener, Enviar).
- **Foco:** todo el borde de la tarjeta pasa a verde. El área de texto no tiene contorno propio.

### Navigation
- **Barra de actividad:** íconos de 21 px en gris liquen; el activo en verde con barra de 2 px a la izquierda; contador abajo a la derecha del ícono, en gris, y en ámbar con «!» cuando algo frena (D-100).
- **Barra de título (D-041):** 36 px en negro barra, sin el marco de Windows. A la izquierda, el botón de inicio (la marca en verde, con el contador: gris, o ámbar con «!» si algo frena); después las pestañas; el espacio libre arrastra la ventana; a la derecha, los tres botones que dibuja Windows del mismo color.
- **Pestañas de sesión:** sobre negro barra, nombre en 600 y chip de estado. La activa toma el fondo y una barra verde de 2 px arriba. Botón de cerrar de 20 px. El proyecto abierto sin sesión también tiene su pestaña, sin chip.
- **Cabecera del proyecto:** 40 px; el nombre en 600, el hito en gris liquen y el chip de las preguntas (gris, o ámbar si alguna frena), que lleva a Pendientes.
- **Divisor de la conversación:** 5 px entre la vista y la conversación; al pasar, arrastrar o enfocarlo se tiñe de verde.
- **Menús (Docs, conversaciones anteriores):** superficie elevada, borde firme, sombra y radio de bloque; la opción actual en verde.
- **Barra de estado:** chico, gris salvia; el estado de la IA a la izquierda, los medidores a la derecha.

### Medidor
Pista de 72 × 6 px en canal del medidor, relleno en verde (o ámbar cerca del límite) con su brillo, y el porcentaje en mono dato. Contexto, ventana de 5 horas y semana.

### Mapa del plan
Nodos de 27 px en base 13 px: chevron, número en mono (dos cifras), nombre y, a la derecha, la palabra de estado con su ícono. El hito actual en 600. El nodo en que trabaja la IA va seleccionado. El chevron gira 90° en 0,12 s al abrir.

### Turno de conversación
Autor en etiqueta de 13 px («Vos» gris salvia, «IA» verde) con la hora en mono a la derecha. Las herramientas usadas quedan plegadas en una línea chica con chevron. Lo que hace ahora la IA va en verde con el ícono que gira.

### Revisión de la app (módulo, D-046)
Lo que dibuja la extensión vive dentro de una app ajena (en un shadow root): lleva sus propias letras y colores, los de Iridium, y no hereda nada de la página. Prototipo: `docs/ui/vista-revision.html`.
- **Sin barra sobre la app (D-049):** nada fijo ocupa lugar de la página mientras se comenta.
- **Aviso del modo comentar:** abajo a la derecha, negro barra, borde firme, radio de tarjeta y sombra flotante. Un punto verde (gris liquen si Iridium no responde o no sabe el proyecto), «Comentando en otra app» en 600 y abajo, en chico gris liquen, `Alt+↑` y «F8 o Esc para salir». Aparece al entrar, sube 6 px y se va solo a los 2,2 s; no se repinta con el mouse y no recibe clics.
- **Resaltado de elemento:** borde de 1,5 px en verde con radio de 4 px y un velo verde al 9 %, a 3 px del elemento; sigue al mouse en 0,09 s. Elegido: 2 px y velo al 5 %. Es el único lugar donde el verde va sobre otra interfaz.
- **Etiqueta del resaltado:** 22 px, negro barra, borde verde al 45 %, mono 12 px: componente en gris salvia, `›` en gris liquen y la etiqueta HTML en fósforo claro 600. Arriba del elemento; abajo si no entra.
- **Tarjeta del comentario:** 380 px, fondo del compositor, borde firme, radio de tarjeta y la sombra flotante (la segunda cosa que flota: se apoya sobre una app ajena). Cabecera en mono 12 px (componente › etiqueta · archivo:línea), a la derecha el proyecto como botón chico en 600 con chevron (cambia de proyecto) y × para cerrar; el campo como el del compositor (`>` verde, 14 px, cursor verde); pie con la ayuda en chico y dos botones chicos: **Enviar ahora** secundario con flecha y **Dejar** con el estilo de **Seguí** (borde y texto verdes), porque es la acción común y no responde a una pregunta (no va en ámbar). Con foco, el borde se tiñe de verde. Confirmación: ícono verde, el resultado en 600 y el detalle en chico; se cierra sola al segundo salvo «sin sesión». Entra subiendo 4 px en 0,18 s.
- **Botón de la extensión:** la marca de Iridium en verde; la cola es un número en mono 700 sobre gris salvia (no ámbar: espera a Iridium, no al usuario).
- **Fila de comentario:** botón de ancho completo, radio de fila, hover con velo. Captura de 112 × 70 con radio de control y borde; el texto en 14 px a dos líneas; abajo, archivo y línea en mono gris salvia; a la derecha la fecha y `R-n` en mono dato. Los cerrados llevan el chip verde «cerrado» con cuándo y una línea de lo que hizo la IA con ícono verde. Los anotados (D-088), el chip gris «anotado» con ícono de documento, cuándo, y la línea de dónde quedó con el ícono en gris salvia. Reabierto: ícono y palabra en gris salvia. Sin captura: recuadro punteado con ícono y «sin captura». Ilegible: fila punteada con el aviso en rojo.
- **Ícono Revisión:** globo de comentario con un punto de mira en la esquina, mismo trazo que los demás. Su contador va en gris (borde firme con texto principal), no en ámbar: los abiertos esperan a la IA.
- **Grupos Abiertos y Cerrados:** dos botones en un marco de borde firme; el elegido con fondo de selección; el número en mono.
- **Comentario en la conversación:** dentro del turno de «Vos», un bloque con borde firme y radio de bloque; cabecera en fondo del compositor con el ícono, `R-n` en mono 700 y archivo:línea; abajo la captura de 72 × 46 y el texto en 14 px. Todo el bloque es un botón que abre el comentario.

### Skills (módulo, D-068)
Pantalla SK-W1 (`docs/modulos/skills/ux.md`): la columna de Pendientes (264 px de entrada; su borde derecho se arrastra entre 200 y 640 px y se recuerda, R-6), el detalle y el chat de `Skills` con su divisor. Estilos en `src/renderer/estilos/skills.css`.
- **Ícono Skills:** un destello de cuatro puntas (✦), mismo trazo que los demás; tercero de la barra del inicio, `Ctrl+3`, sin contador.
- **Grupo plegable:** título de 30 px en 600 chico gris liquen, con el chevrón de 12 px (gira 90° al abrir, en la curva de salida; quieto con movimiento reducido) y el número en mono a la derecha; una línea suave arriba lo separa del anterior. Los de afuera empiezan plegados si pasan de 10. Cada fila tiene dos líneas: el nombre en 13 px y la primera línea de qué hace en 12 px gris liquen, las dos cortadas con «…»; elegida, fondo de selección y radio de fila. Lo que está dos veces o tiene el enlace roto lleva el ⚠ gris de 13 px antes del nombre (no frena nada: el ámbar es solo para lo que frena, D-100).
- **Aviso del detalle:** bloque (8 px) en la caja con el borde fuerte, 12 × 14 px de relleno y máximo 68ch: arriba el ⚠ y el título en 600 del color del texto, el texto en 13 px gris salvia (rutas en mono) y a la derecha un botón secundario chico («Pedir que la saquen», «Pedir que lo arreglen») que escribe el pedido en el chat sin enviarlo. No flota ni se va solo: es parte del detalle.
- **«Sobre la skill …»:** etiqueta de 22 px arriba del área de texto del compositor, borde firme, superficie elevada y radio de control, texto chico gris liquen con el nombre en 600 gris salvia y una ✕ de 18 px. El mensaje sale con «Sobre la skill nombre:» al principio; con la ✕, tal cual.
- **Archivos de la skill (Q-95):** debajo de la cabecera del detalle, el árbol y el visor de Archivos (H-15) sin cambios, con el árbol más angosto (170–210 px). Arriba del árbol, la entrada **Resumen** (✦, o ⚠ si la skill tiene un aviso) muestra los avisos y la descripción; abajo, el título ARCHIVOS y la carpeta de la skill. El visor es de solo lectura y sin «Ver en Docs». Cada skill recuerda su archivo y sus carpetas abiertas mientras Iridium está abierto.
- **Framework (W-13):** la primera entrada de la columna, con la cuenta de los de afuera en mono gris (no ámbar). Su panel lleva la cabecera común con los filtros Todos, Fuera del framework y Carpetas.
- **Fila de proyecto de Framework:** reusa la tarjeta chica de proyecto: en una lista con borde y radio de tarjeta, el ícono de 26 px, el nombre en 600 y cómo está en chico gris liquen («framework viejo · fecha», «carpeta simple», «al día · fecha»); con avisos, «! N avisos del framework» subrayado de puntos, con el «!» en un círculo gris como en la tarjeta, que despliega debajo la lista en mono 12 px sobre la caja. A la derecha **Pasar al framework** (secundario chico; su título dice que gasta uso) o, mientras pasa, el chip «Pasando al framework…» con el ícono que gira y **Ver la conversación**. Con la IA ocupada, el botón apagado. Los que están al día no llevan botón.

### Ideas (módulo Inicio)
Pantalla IN-W1 (`docs/modulos/inicio/ux.md`): se arma con las piezas de Skills (la columna con grupos plegables, su borde que se arrastra con su propio ancho, el detalle y el chat general con su divisor). Estilos propios en `src/renderer/estilos/ideas.css`.
- **Ícono Ideas:** una lamparita con tres rayos cortos arriba, mismo trazo que los demás; cuarto de la barra del inicio, `Ctrl+4`, sin contador. (La lamparita sin rayos sigue siendo el estado «idea» de una tarjeta.)
- **Título de la columna:** «Ideas» y, en mono gris liquen, «N sin integrar»; a la derecha, **Abrir como proyecto** como botón de ícono de 26 px (la flecha que sale de un cuadro), el mismo que lleva la columna de Skills.
- **Fila de idea:** la de Skills: el título en 13 px y, debajo, la fecha corta y los proyectos que toca en 12 px gris liquen. Integradas empieza plegada.
- **Detalle:** el título entero en 600 17 px (corta en varias líneas, no con «…»), debajo la sección en singular y la fecha larga; el cuerpo como en Docs en gris salvia, a 68ch. Abajo, separadas por una línea suave, las filas **Toca a** (los proyectos como enlaces en verde con subrayado punteado; el que no existe, texto común) y **Fue a**.
- **«Sobre la idea «…»»:** la etiqueta de «Sobre la skill …», con el título entre comillas.

### Movimiento
Una sola curva de salida, `cubic-bezier(.16, 1, .3, 1)`. El panel entra en 0,2 s desde 12 px a la derecha. El ícono de trabajo gira cada 1,4 s. Con movimiento reducido, todo queda quieto.

## Do's and Don'ts

### Do:
- **Do** usar el verde fósforo solo para lo activo, lo hecho y el foco.
- **Do** poner en ámbar solo lo que frena, y en gris lo que espera sin frenar; el botón principal, claro (D-100).
- **Do** acompañar cada estado con ícono y palabra.
- **Do** separar superficies por tono (barra, lateral, fondo) y bordes de 1 px.
- **Do** escribir códigos, horas y porcentajes en JetBrains Mono, y todo lo demás en Chakra Petch.
- **Do** mantener la lectura a 15 px con interlineado 1,65 y no más de 72ch.
- **Do** dejar foco visible en todo: contorno verde de 1 px.

### Don't:
- **Don't** poner brillo en fondos, tarjetas, textos ni botones: solo en el relleno de los medidores (D-032).
- **Don't** usar mayúsculas sostenidas, rayas de monitor ni otros disfraces de terminal.
- **Don't** usar el color como decoración ni como único portador de un estado (D-031).
- **Don't** agregar un tema claro (D-029).
- **Don't** sumar familias tipográficas ni usar la mono para la prosa.
- **Don't** usar sombras para dar profundidad: solo las tres de Shadow Vocabulary, en lo que flota.
