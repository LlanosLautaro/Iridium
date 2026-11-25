# UX del módulo: Pulido

**Fecha:** 2026-11-25

Pulido no agrega pantallas ni flujos: cambia cómo se ven y se mueven las que hay (D-197). Lo que se ve, en la maqueta `docs/diseno/pantallas/pulido.html`, probada en Q-302.

## Puntos de entrada y salida
- **Entrada:** ninguna nueva. El único control nuevo es el acento, en Ajustes › Apariencia.
- **Salida:** no aplica.

## Historias de usuario
- PU-H1: Como usuario, quiero ver de un vistazo en qué sección, nivel del mapa y pestaña estoy, para no buscarlo.
- PU-H2: Como usuario, quiero distinguir el estado de cada proyecto en la grilla sin leerlo.
- PU-H3: Como usuario, quiero que lo que aparece y lo que se mueve lo haga con suavidad, para seguir qué cambió.
- PU-H4: Como usuario, quiero elegir el color de lo activo.

## Flujos
- **Elegir el acento:** Ajustes › Apariencia › Acento: Cian · Verde · Azul · Violeta (Filtros, PZ-6). Cambia en el momento en toda la app y se recuerda.
- **Arrastrar una pestaña** de la barra de proyectos: la pestaña sigue al mouse con el fondo y el borde en el acento; las demás se corren para dejarle lugar; al soltar queda ahí. Con Escape vuelve a su lugar.

## Pantallas
### Ajustes › Apariencia
Arriba del ancho de lectura, el **Acento**, con una muestra de color en cada opción, como la cabecera de la maqueta.

### Todas
- **Lo activo, en el acento con su brillo:** el ícono de la sección elegida (la rayita a su izquierda también), el nivel actual del mapa (que late como un radar) y la pestaña que arrastrás.
- **Lo hecho en un camino**, en un verde apagado, para que lo vivo sea lo actual (R-111).
- **El punto de los íconos:** en el acento si algo espera sin frenar; en naranja si frena.
- **Lo que te espera**, en naranja (Q-303): las cuentas, los avisos, «Te espera».
- **Las tarjetas:** el punto y el nombre del estado en su color (en uso verde, en desarrollo azul, idea violeta, en rescate coral, para eliminar rojo; pausado y descontinuado en gris).
- **«▶ N corriendo»** con las consolas plegadas: en el acento, con un punto que late y una luz que lo cruza y se desvanece en los extremos (R-112).
- **Una casilla** se marca con un golpe corto y su texto se apaga.
- **Menús, cuadros, avisos de la esquina y paneles** entran en un cuarto de segundo; el fondo al pasar el mouse cambia en algo menos.

## Piezas de UI nuevas
Ninguna: cambian los estados de las que hay. PZ-7 (el punto en el acento), PZ-15 (el paso actual late; lo hecho apagado), PZ-8 (menú y cuadro entran), PZ-5 (la casilla) y el marco (el ícono elegido, «corriendo»).
