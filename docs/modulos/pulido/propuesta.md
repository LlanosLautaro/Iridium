# Propuesta del módulo: Pulido

**Fecha:** 2026-11-25
**Tipo:** sección (atraviesa toda la app: el marco, Inicio, Frentes, la Bandeja, las consolas y Ajustes)

## Qué problema resuelve
Iridium funciona, pero se siente quieta: las cosas cambian de lugar o de estado de golpe, y lo que está activo o vivo (la pestaña que arrastrás, el nivel del mapa en el que estás, un comando corriendo con la barra plegada) no se nota de un vistazo. El usuario pidió un frente de calidad de UI/UX: movimiento que acompañe lo que pasa y algo de color donde hoy todo es gris.

## Lo que pidió el usuario (2026-11-25)
1. **Pestañas:** una animación mientras se arrastran (las demás se corren para dejarle lugar, en vez de saltar al soltar).
2. **Tarjetas de proyectos:** un color para el estado («en uso», «en desarrollo», «idea»…).
3. **Mapa (Frentes):** el nivel activo late, como un punto de radar.
4. **Panel de la izquierda:** un color de acento para el ícono activo, que se elige en Ajustes.
5. **Consolas plegadas:** «▶ N corriendo» con una animación mientras algo corre.
6. **El punto de pendientes en los íconos:** con color.
7. **Las casillas de los pendientes:** una animación al marcarlas.

## Lo que suma la IA (para aprobar, Q-301)
8. **Lo que aparece de golpe:** menús, cuadros, avisos de la esquina y paneles que se abren o se pliegan, con una entrada corta.
9. **Pasar el mouse:** filas, botones y pestañas que cambian de fondo con una transición, no de un salto.
10. **Las animaciones de Windows apagadas:** si están apagadas en Windows, Iridium no mueve nada (hoy lo cumplen solo cinco hojas de estilo).

## Por qué choca con decisiones vigentes
Tres decisiones dejaron la app callada a propósito, y este frente las toca:
- **D-103 y D-104:** el negro va **sin acento**; los acentos volverían «muy sutiles, como variantes del negro». Un acento elegible es justamente esa vuelta.
- **D-100:** el color es solo para avisar; el ámbar, solo para lo que frena, y lo que espera sin frenar va en gris (el punto de los íconos hoy es gris, y ámbar si algo frena).
- **D-108:** lo que anda no se anuncia. Un estado de tarjeta con color o un pulso permanente pueden volverse ruido.

Por eso la primera pregunta (Q-299) es cuánto color entra, y la segunda (Q-300), cuánto movimiento. Lo que se decida queda como decisión nueva que corrige a esas, con `DESIGN.md`, `06-ui.md` y `tokens.css` al día.

## Cómo encaja en el producto
- **Design system** (`docs/diseno/tokens.css`, `piezas.css`): los colores y las duraciones nuevas son tokens (`--acento`, `--dur-…`), no números sueltos; el control de estilos (`tests/estilos.test.ts`) los exige igual que hoy.
- **Diseño** (la sección): antes de tocar la app se arma una maqueta viva con cada animación y cada color, para verlos en Diseño y comentarlos con F8.
- **Apariencia y ajustes:** el selector del acento va en Ajustes › Apariencia, que hoy no tiene selector de tema (D-104).

## Por qué es un módulo y no una funcionalidad
- [ ] Dominio propio que requiere investigación
- [ ] Flujos de UX propios
- [x] Ritmo de avance propio (muchas piezas chicas, en tandas)
- [ ] Se activa, instala o distribuye por separado

Es un frente porque toca casi todas las secciones y cambia reglas del design system: hecho como tareas sueltas, cada sección terminaría animando a su manera.

## Alternativas
- **Tareas sueltas en el Núcleo:** más rápido de empezar, pero sin una regla común de duraciones y colores cada pieza queda distinta.
- **Una ronda de UX** (`referencias/ronda-ux.md`): mira problemas de uso, no suma movimiento ni color.
- **Una librería de animaciones** (Framer Motion u otra): para pestañas que se corren al arrastrar puede ayudar; el resto alcanza con CSS. Se decide en el diseño técnico, por peso y por lo que cuesta mantener.

## Decisión
Espera a Q-299 (el color), Q-300 (el movimiento) y Q-301 (la lista).
