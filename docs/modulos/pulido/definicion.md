# Definición del módulo: Pulido

**Fecha:** 2026-11-25

## Objetivo del módulo
Que Iridium se sienta viva y tecnológica, como el tablero de un aparato de un juego futurista, sin perder la legibilidad del negro: lo activo se ve de un vistazo, lo que pasa se acompaña con movimiento y nada aparece de golpe (D-197).

## Criterios de éxito
- De un vistazo se ve en qué sección, en qué nivel del mapa y en qué pestaña estás, por el acento.
- El estado de cada proyecto se distingue en la grilla sin leerlo.
- Lo que te espera tiene su color, distinto del de cualquier estado y del acento.
- Ningún menú, cuadro, aviso o panel aparece ni desaparece de golpe.
- Solo laten dos cosas: el nivel activo del mapa y «corriendo».
- La app no se pone lenta: abrir, cambiar de sección y escribir tardan lo mismo que antes (los tiempos del hito 8).

## Funcionalidades
### Must (MVP del módulo)
- **El acento** (`--acento`, con su brillo) en lo activo: el ícono de la sección elegida, el nivel del mapa en el que estás, la pestaña que arrastrás y el punto de pendientes cuando nada frena.
- **Elegir el acento** en Ajustes › Apariencia: cian (el que viene), verde, azul o violeta. Se guarda y se aplica enseguida.
- **Los estados de las tarjetas, con color**: en uso, en desarrollo, idea, en rescate y para eliminar con el suyo; pausado y descontinuado en gris.
- **El color de lo que te espera**, el que se elija en Q-303, en lugar del ámbar en toda la app.
- **Las pestañas se corren** para dejarle lugar a la que arrastrás.
- **El nivel activo del mapa late** como un radar.
- **«Corriendo» se mueve** con las consolas plegadas: un punto que late y una luz que cruza.
- **Marcar una casilla** de un pendiente, con un golpe y el texto que se apaga.
- **Lo que entra**: menús, cuadros, avisos de la esquina y paneles que se pliegan, con una entrada de un cuarto de segundo.
- **Al pasar el mouse**, el fondo de filas, botones y pestañas cambia con una transición.
- **Sin seguir las animaciones apagadas de Windows**: se sacan las cinco reglas que hoy las respetan.
### Should
- El brillo del acento también en el foco con el teclado.
### Could
- Que el acento se elija también por proyecto.
### Won't (por ahora)
- «Glitch», líneas de barrido de pantalla, anillos que giran y números que corren — distraen mientras se lee; van al catálogo de estilos (T-143).
- Un interruptor para apagar el movimiento — el usuario eligió el sutil sin interruptor (Q-300).

## Fuera de alcance
- Cambiar la letra, los tamaños o el lugar de las cosas: Pulido cambia color y movimiento, no la distribución.
- Llevar el lenguaje de movimiento al framework para los otros proyectos: es T-143.

## Impacto en el perfil
Ninguno: no maneja datos nuevos ni abre nada de afuera. Sigue en P2. Quien tenga apagadas las animaciones de Windows por mareo las va a ver igual (decisión del usuario, D-197).

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Acento | El color que marca lo activo, elegido en Ajustes › Apariencia. No es el verde del botón principal. |
| Brillo | El halo suave alrededor de lo activo, en el color del acento. Nunca en texto para leer. |
| Pulso | Algo que late sin parar mientras dura un estado. Solo el nivel activo del mapa y «corriendo». |

## Preguntas abiertas para investigar
- Las pestañas que se corren: si alcanza con lo que ya usa la app para arrastrar o hace falta una librería (se decide en el diseño técnico, por peso).
