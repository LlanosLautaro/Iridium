# Definición del módulo: Diseño

**Fecha:** 2026-11-07
**Base:** `propuesta.md`, D-102 y D-103 (Q-147: A; Q-148: C, negro sin acento). Con D-105 (Q-150) las pantallas pasan a ser maquetas HTML: cambian el objetivo, el mínimo y el Won't.

## Objetivo del módulo
Que el usuario pueda **ver toda la interfaz de un proyecto junta y cambiarla desde un solo lugar**, como en Claude Design: una sección **Diseño** en cada proyecto con framework donde la IA dibuja la interfaz como **maquetas HTML** (tokens, piezas y pantallas), que se miran vivas, se comentan con `F8` y se prueban en otras versiones antes de tocar la app (D-105). Para Iridium, la primera tarea es su rediseño en negro, callado y sin ruido, sobre piezas compartidas: primero en maquetas y después en el código.

## La dirección: negro sin acento (D-103)
- **Fondo negro puro** en todas las superficies grandes (fondo, lateral, barra). Lo que flota (menús, cuadros) apenas se despega: un casi negro con una línea fina.
- **Una sola línea**, gris muy oscuro, y solo donde separa algo; el resto se separa con espacio.
- **Tres grises de texto**: el principal casi blanco, el secundario y el apagado.
- **Sin acento:** lo activo, lo elegido y el botón principal van en blanco (el botón principal, blanco con letra negra). Lo seleccionado se marca con un fondo un punto más claro, no con color.
- **Señales:** el ámbar (lo que espera del usuario) y el rojo (un error) se quedan, apagados, y son lo único con color en la pantalla.
- **Letra del sistema** (Segoe UI Variable), un tamaño de lectura y uno chico; la de ancho fijo solo para códigos y números.
- Los acentos se prueban después, muy sutiles, con Probar una dirección (DI-I3).

La muestra es `negro.css`; pasa a ser los tokens de las maquetas de Iridium y, con el pase al código, `docs/ui/tokens.css`.

## Las piezas compartidas
Hoy cada sección arma las suyas (unas 6.000 líneas de estilos en 13 archivos; solo 9 piezas compartidas en `src/renderer/ui/`). De ahí salen las cajas dentro de cajas, los bordes en todo y los botones distintos. El rediseño deja un solo juego, con sus variantes (primero en la maqueta de piezas, después en el código), y las secciones las usan en vez de las propias:

| Pieza | Variantes | Regla |
|---|---|---|
| Botón | principal (blanco), secundario (con línea), sin fondo, peligroso; normal y chico | Un principal por pantalla como mucho |
| Fila | simple, con detalle debajo, elegida, con acciones al pasar | Las listas son filas sobre el fondo, sin caja alrededor |
| Bloque | con título o sin título | Un bloque separa con espacio y un título; no lleva borde ni fondo propio. Nunca un bloque dentro de otro |
| Recuadro | aviso, vacío, punteado (lo que falta) | El único con borde; para lo que tiene que destacarse |
| Campo | texto, área de texto, selector, casilla | Mismo alto y la misma línea en todos |
| Filtros | con cuenta | Texto con subrayado o fondo leve en el elegido, no píldoras con borde |
| Cuenta y señal | gris, ámbar, rojo | Un número o un punto; nada de medidores donde alcanza un número |
| Menú y cuadro | menú, menú contextual, cuadro de confirmación | Lo único con sombra |
| Cabecera de sección | título, cuenta, acciones | La que ya existe (W-9), con las reglas nuevas |
| Pestañas | de sección, de vista | Texto; la elegida en blanco, las demás en gris |
| Árbol | carpeta, archivo, elegido, con marca | El mismo en Archivos, Skills y Git (sumada en el paso 4) |
| Texto de documento | lectura y conversación | Un solo markdown; las tablas con línea solo entre filas (sumada en el paso 4) |

El inventario exacto (qué usa cada pantalla y qué se reemplaza) está en `ux.md` › Parte 1, con cada pieza como `PZ-n`.

## Funcionalidades
### Must (MVP del módulo)
El orden de las iteraciones se decide en Q-151; este es el recomendado.
- **DI-I1 — La sección Diseño con las maquetas.** El formato `docs/diseno/` en el framework, con su lector y su control (D-086); la sección en cada proyecto con framework: **Pantallas** (las maquetas vivas en un lienzo; tocar una la agranda y se puede usar), **Sistema** (los tokens dibujados y la maqueta de piezas) y `F8` sobre una maqueta, con el comentario en la Revisión (C-33). Empezar el diseño con Pedírselo a la IA.
- **DI-I2 — El rediseño de Iridium en maquetas.** Los tokens en negro sin acento, la maqueta de las 12 piezas y las pantallas de Iridium en su `docs/diseno/`, revisadas por el usuario en la sección.
- **DI-I3 — Pasar al código.** Pasar al código en la sección y, con él, el rediseño de Iridium: las piezas en `src/renderer/ui/` con sus estilos en un solo archivo, las secciones pasadas a ellas, `tokens.css` en negro como único tema (D-104) y la app de antes y la de ahora lado a lado (las capturas reales).
- **DI-I4 — Otra versión y Probar una dirección.** Versiones de una pantalla lado a lado (C-32) y quedarse con una (C-35); otro juego de tokens sobre todas las maquetas a la vez, y elegirlo.
### Should
- La app de hoy al lado de una maqueta, donde haya capturas (DS-7).
### Could
- Perillas en vivo sobre un token (C-34).
- La biblioteca de estilos guardados y los design systems de los otros proyectos (C-29, C-30).
### Won't (por ahora)
- Prototipos que guarden datos o hablen con la app: una maqueta tiene los clics que la IA le ponga, nada más.
- Subir nada a Claude Design ni a claude.ai (todo local, D-102).

## Criterios de éxito
- Cambiar un token o una pieza cambia todas las maquetas que la usan, y se ve en un solo lienzo.
- Probar otra versión o dirección cuesta un pedido a la IA y se mira sin tocar la app.
- Ninguna sección arma su propio botón, fila o recuadro: los estilos por sección quedan para lo que es solo de ella.
- En las 30 pantallas en negro no hay cajas dentro de cajas, y el único color es una señal (ámbar o rojo).
- Las pruebas de siempre (`pnpm test`, `pnpm e2e`) pasan y el contraste de la tanda 5 se mantiene en AA.

## Fuera de alcance
- Funciones nuevas en las secciones: el frente cambia cómo se ve, no qué hace. Lo que aparezca de UX va a `trabajo.md` con `Frente: Diseño`.
- Los otros proyectos del usuario: la sección los muestra, pero no se rediseñan desde acá.

## Impacto en el perfil
Ninguno: lee carpetas del propio proyecto y muestra sus maquetas en la PC; no sube nada. Las capturas con proyectos reales quedan en `tools/salida/` (D-082).

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Pieza | Un componente compartido de la interfaz (botón, fila, bloque…) con sus variantes; lo que Claude Design llama componente |
| Dirección | Un juego de tokens que se prueba sobre todas las pantallas a la vez (por ejemplo, el negro con otro acento) |
| Pantallas | Las maquetas de todas las vistas de la app, juntas en un lienzo, para mirar el conjunto (D-105) |
| Maqueta | Una pantalla de la app dibujada en HTML por la IA, en `docs/diseno/`, que se mira viva y se comenta con `F8` antes de pasarla al código (D-105) |

## Preguntas abiertas para investigar
- Ninguna de dominio: lo de Claude Design y las skills de Anthropic está en `propuesta.md`. El paso 3 se salta.
