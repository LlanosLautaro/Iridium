# Estado del módulo: Pulido

**Tipo:** sección (atraviesa toda la app)
**Última actualización:** 2026-11-26
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (D-197) | `propuesta.md` |
| 2. Definición | hecho (Q-302) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros) | — |
| 4. UX | hecho | `ux.md` |
| 5. Diseño técnico | hecho | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | hecho (la maqueta viva, probada en Q-302; el naranja, Q-303) | `docs/diseno/pantallas/pulido.html` |
| 7. Construcción | hecho (PU-I1 y PU-I2, probadas en Q-307, todo bien) | este archivo |
| 8. Calidad | hecho (2026-11-26: el movimiento no pone lenta la app; Q-307, nada se siente lento) | este archivo |
| 9. Lanzamiento | hecho (entra con Armar, como cada versión; 1.2.0, D-182) | este archivo |

## En qué estamos ahora
Frente cerrado (2026-11-26, 1.2.0): el acento con su brillo, los colores de las tarjetas, el mapa que late, «corriendo», la casilla, lo que entra, elegir el acento en Ajustes › Apariencia y las pestañas que se corren al arrastrar una. Probado en Q-307, todo bien; la calidad, medida. En operación, con el hito 10.

## Ruta
- [x] Decidir cuánto color y cuánto movimiento lleva, y qué entra (Q-299, Q-300, Q-301)
- [x] Ver las animaciones y los colores en una maqueta viva, antes de pasarlos a la app (Q-302)
- [x] Elegir el color de lo que te espera: naranja (Q-303)
- [x] Color y movimiento en toda la app: el acento en lo activo, las tarjetas, el mapa que late, «corriendo», las casillas y lo que entra (PU-I1)
- [x] Elegir el acento en Ajustes y las pestañas que se corren al arrastrar una (PU-I2)
- [x] Probarlo en la app (Q-307)
- [x] Medir la calidad: la app no se pone lenta con el movimiento

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `decisiones.md` | una decisión nueva que corrige D-100, D-103 y D-108 en lo que toque | D-197 | sí |
| `docs/diseno/tokens.css`, `DESIGN.md`, `06-ui.md` | el acento, los colores de estado y las duraciones como tokens | D-197 | sí (2026-11-26, con PU-I2; también `04-ux.md` › Ajustes) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| PU-I1 | Color y movimiento en las piezas y las secciones: el acento en lo activo, lo hecho apagado, el naranja, las tarjetas, el mapa que late, «corriendo», las casillas, lo que entra y el hover; sin seguir las animaciones apagadas de Windows | hecho (2026-11-25; probada en Q-307) |
| PU-I2 | El acento en Ajustes › Apariencia y las pestañas de la barra que se corren al arrastrar | hecho (2026-11-26; probada en Q-307) |

## Log de iteraciones
### Cierre — 2026-11-26
- Q-307 volvió con todo marcado: el acento y su brillo, los colores de las tarjetas, el radar de Frentes, «corriendo», lo que entra, elegir el acento y las pestañas que se corren; nada se siente lento ni recargado. Con la calidad ya medida, el frente queda `hecho` y la versión sube a 1.2.0 (D-182).

### Calidad: el movimiento no pone lenta la app — 2026-11-26 (el avance solo)
- **Herramienta nueva, `tools/medir-movimiento.ts`:** abre la app de `pnpm build` con el motor falso y una carpeta armada en una temporal (los docs de Iridium como Alfa y doce proyectos de muestra) y mide cada pantalla con el movimiento y sin él: cuadros por segundo, el cuadro más largo y el procesador de toda la app; anota qué animaciones corren y qué mueven.
- **Antes del arreglo:** los cuadros, iguales con y sin movimiento (144–145 por segundo, el peor de 7 ms) en el inicio, Frentes con el paso que late, Frentes con un script corriendo y Docs desplazándose. El procesador en reposo: 0 % quieta, 1 % con el radar del Mapa, 2,4–2,9 % con «corriendo». Una de las cuatro animaciones que no paran, la luz que cruza «corriendo», movía el fondo y redibujaba la barra en cada cuadro.
- **Arreglo:** la luz es ahora una franja que se corre y se desvanece (solo `transform` y `opacity`, como el radar y el punto que late), en la app y en la pieza del design system; se ve igual. Con «corriendo», el procesador bajó a 1,2 %; los cuadros, iguales.
- El radar del Mapa no corre fuera de Frentes (lo que no se ve no late). La ventana escondida o minimizada la frena Chromium.
- **Prueba nueva** en `tests/estilos.test.ts`: lo que late sin parar mueve solo `transform` y `opacity` (falla con la luz vieja). Vitest 1120 (1 omitida), Playwright de las consolas y de Frentes, typecheck y lint en verde.

### PU-I2 — 2026-11-26
- **El acento en Ajustes › Apariencia**, arriba del ancho de lectura: Cian (el que viene), Verde, Azul y Violeta, cada uno con su muestra de color (la muestra es un estado nuevo de los Filtros, PZ-6, en la maqueta y en la app). Cambia en el momento en toda la app y se recuerda (la preferencia `acento`; una rota vuelve a cian). La app pone `--acento` en la raíz; el brillo y el fondo tenue salen de ahí.
- **Las pestañas de la barra de proyectos se corren** al arrastrar una, como en la maqueta: la arrastrada sigue al mouse en el acento con su brillo, sin salirse de la barra; las que pasa se corren a dejarle lugar; al soltar queda ahí y el orden se guarda como antes (R-102). Escape la vuelve a su lugar. Arrastra recién pasados 5 px, así un clic sigue eligiendo la pestaña, y el clic al soltar no la abre. Reemplaza al arrastre de Windows, que mostraba una copia fantasma y una raya.
- `DESIGN.md`, `06-ui.md` y `04-ux.md` › Ajustes, al día con el acento, los estados, el naranja y el movimiento.
- **Pruebas:** dos de Playwright nuevas o ampliadas (`ap1-ajustes`: elegir Violeta cambia el color de la sección elegida y sigue al volver a abrir; `r102-r104-bandeja`: mientras arrastrás la otra se corre, Escape la vuelve, y un clic sigue eligiendo). Capturas `pu2-acento.png` y `pu2-pestanas-arrastrando.png`.

### PU-I1 — 2026-11-25 (el avance solo)
- **Piezas** (`docs/diseno/piezas.css` y la copia de la app, iguales): el punto en el acento (`.punto.acento`) y el naranja con brillo; `.punto.del-color` para el estado de una tarjeta; la casilla con su golpe y `.casilla.por-hacer`, que apaga el texto al marcarla (las casillas de la Bandeja); el menú, el cuadro y la ventana entran en un cuarto de segundo; filas, botones, pestañas y menús cambian de fondo con `--dur-hover`; en el Camino, lo hecho en verde apagado (R-111) y el paso que sigue en el acento con su radar.
- **Marco:** la sección elegida en el acento con su brillo (también la rayita); el punto de la Bandeja y el del inicio en el acento si algo espera sin frenar, naranja si frena; el de la Revisión sigue gris (espera a la IA).
- **Tarjetas:** el estado y su punto en su color (en uso, en desarrollo, idea, en rescate, para eliminar); pausado, descontinuado y archivado en gris. En rescate ahora también lleva su punto.
- **«▶ N corriendo»** en el acento; con las consolas plegadas, el punto que late y la luz que cruza y se desvanece (R-112). Los avisos de la esquina entran desde la derecha.
- **Sin seguir las animaciones apagadas de Windows:** fuera los cinco `prefers-reduced-motion`. Dos pruebas nuevas en `tests/estilos.test.ts`: ninguna hoja lo vuelve a poner y ninguna escribe una duración a mano.
- La maqueta `pulido.html` usa ahora las piezas (solo le queda lo propio de la muestra). En `.impeccable/config.json`, el brillo, el pulso y la luz quedan permitidos en las piezas, el marco y las consolas, como en la maqueta (Q-299, Q-300).

## Próximo paso
En operación, con el hito 10. Lo que falle o haga falta ajustar del color o del movimiento se anota como `T-n` con `Frente: Pulido`; T-143 (el catálogo de estilos y movimiento para el framework) espera tu aprobación en Ideas.
**Leer antes:** este archivo › Log de iteraciones › Calidad.
