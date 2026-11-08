# Definición del módulo: Diseño

**Fecha:** 2026-11-07
**Base:** `propuesta.md`, D-102 y D-103 (Q-147: A; Q-148: C, negro sin acento).

## Objetivo del módulo
Que el usuario pueda **ver toda la interfaz de un proyecto junta y cambiarla desde un solo lugar**. Para Iridium, eso empieza por rehacer su UI en negro, callada y sin ruido, sobre piezas compartidas; después, una sección **Diseño** en cada proyecto con framework que muestra el sistema (tokens y piezas) y las pantallas, y deja probar otra dirección sobre todas a la vez.

## La dirección: negro sin acento (D-103)
- **Fondo negro puro** en todas las superficies grandes (fondo, lateral, barra). Lo que flota (menús, cuadros) apenas se despega: un casi negro con una línea fina.
- **Una sola línea**, gris muy oscuro, y solo donde separa algo; el resto se separa con espacio.
- **Tres grises de texto**: el principal casi blanco, el secundario y el apagado.
- **Sin acento:** lo activo, lo elegido y el botón principal van en blanco (el botón principal, blanco con letra negra). Lo seleccionado se marca con un fondo un punto más claro, no con color.
- **Señales:** el ámbar (lo que espera del usuario) y el rojo (un error) se quedan, apagados, y son lo único con color en la pantalla.
- **Letra del sistema** (Segoe UI Variable), un tamaño de lectura y uno chico; la de ancho fijo solo para códigos y números.
- Los acentos se prueban después, muy sutiles, con Probar una dirección (DI-I3).

La muestra es `negro.css`; con DI-I1 pasa a ser `docs/ui/tokens.css`.

## Las piezas compartidas
Hoy cada sección arma las suyas (unas 6.000 líneas de estilos en 13 archivos; solo 9 piezas compartidas en `src/renderer/ui/`). De ahí salen las cajas dentro de cajas, los bordes en todo y los botones distintos. DI-I1 deja un solo juego, con sus variantes, y las secciones las usan en vez de las propias:

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

El inventario exacto (qué usa cada pantalla y qué se reemplaza) se arma en el paso 4 mirando las 30 pantallas con las skills `design-critique` y `design-system`.

## Funcionalidades
### Must (MVP del módulo)
- **DI-I1 — Piezas compartidas y el negro aplicado.** Las piezas de arriba en `src/renderer/ui/` con sus estilos en un solo archivo; las secciones pasadas a ellas, sacando cajas y bordes de más; `tokens.css` en negro sin acento; una página que muestra las 30 pantallas juntas (la de antes y la de ahora lado a lado) para mirar el cambio de una.
- **DI-I2 — La sección Diseño, con Sistema y Pantallas.** El formato `docs/diseno/` en el framework, con su lector y su control (D-086); la sección en cada proyecto con framework: **Sistema** (los tokens dibujados y cada pieza como tarjeta con sus variantes) y **Pantallas** (todas las capturas en un lienzo; tocar una la agranda).
- **DI-I3 — Probar una dirección.** Elegir otro juego de tokens (por ejemplo, el negro con un acento sutil) y volver a sacar todas las pantallas con él, lado a lado con las de hoy; aplicarla si convence.
### Should
- Comentar una pantalla o una pieza en el lienzo; el comentario llega a la IA como `T-n` (C-33).
- Rondas de versiones de una pantalla, en filas (C-32), y aprobar una (C-35).
### Could
- Perillas en vivo sobre un token (C-34).
- La biblioteca de estilos guardados y los design systems de los otros proyectos (C-29, C-30).
### Won't (por ahora)
- Prototipos con clics: Iridium se mira con sus pantallas reales.
- Subir nada a Claude Design ni a claude.ai (todo local, D-102).

## Criterios de éxito
- Cambiar un token o una pieza cambia todas las pantallas que la usan, y se ve en una sola página.
- Ninguna sección arma su propio botón, fila o recuadro: los estilos por sección quedan para lo que es solo de ella.
- En las 30 pantallas en negro no hay cajas dentro de cajas, y el único color es una señal (ámbar o rojo).
- Las pruebas de siempre (`pnpm test`, `pnpm e2e`) pasan y el contraste de la tanda 5 se mantiene en AA.

## Fuera de alcance
- Funciones nuevas en las secciones: el frente cambia cómo se ve, no qué hace. Lo que aparezca de UX va a `trabajo.md` con `Frente: Diseño`.
- Los otros proyectos del usuario: la sección los muestra, pero no se rediseñan desde acá.

## Impacto en el perfil
Ninguno: lee carpetas del propio proyecto y saca capturas en la PC; no sube nada. Las capturas con proyectos reales quedan en `tools/salida/` (D-082).

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Pieza | Un componente compartido de la interfaz (botón, fila, bloque…) con sus variantes; lo que Claude Design llama componente |
| Dirección | Un juego de tokens que se prueba sobre todas las pantallas a la vez (por ejemplo, el negro con otro acento) |
| Pantallas | Las capturas de todas las vistas de la app, juntas, para mirar el conjunto |

## Preguntas abiertas para investigar
- Ninguna de dominio: lo de Claude Design y las skills de Anthropic está en `propuesta.md`. El paso 3 se salta.
