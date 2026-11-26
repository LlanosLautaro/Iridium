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
| 7. Construcción | en curso (PU-I1 y PU-I2 hechas; se prueban juntas en Q-307) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
PU-I1 (2026-11-25) y PU-I2 (2026-11-26) hechas: el acento con su brillo, los colores de las tarjetas, el mapa que late, «corriendo», la casilla, lo que entra, elegir el acento en Ajustes › Apariencia y las pestañas que se corren al arrastrar una. Las dos se prueban juntas en Q-307; después, la calidad.

## Ruta
- [x] Decidir cuánto color y cuánto movimiento lleva, y qué entra (Q-299, Q-300, Q-301)
- [x] Ver las animaciones y los colores en una maqueta viva, antes de pasarlos a la app (Q-302)
- [x] Elegir el color de lo que te espera: naranja (Q-303)
- [x] Color y movimiento en toda la app: el acento en lo activo, las tarjetas, el mapa que late, «corriendo», las casillas y lo que entra (PU-I1)
- [x] Elegir el acento en Ajustes y las pestañas que se corren al arrastrar una (PU-I2)
- [ ] Probarlo en la app (Q-307)
- [ ] Medir la calidad: la app no se pone lenta con el movimiento (chico, sola)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `decisiones.md` | una decisión nueva que corrige D-100, D-103 y D-108 en lo que toque | D-197 | sí |
| `docs/diseno/tokens.css`, `DESIGN.md`, `06-ui.md` | el acento, los colores de estado y las duraciones como tokens | D-197 | sí (2026-11-26, con PU-I2; también `04-ux.md` › Ajustes) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| PU-I1 | Color y movimiento en las piezas y las secciones: el acento en lo activo, lo hecho apagado, el naranja, las tarjetas, el mapa que late, «corriendo», las casillas, lo que entra y el hover; sin seguir las animaciones apagadas de Windows | hecho (2026-11-25; se prueba con PU-I2) |
| PU-I2 | El acento en Ajustes › Apariencia y las pestañas de la barra que se corren al arrastrar | hecho (2026-11-26; se prueba con PU-I1 en Q-307) |

## Log de iteraciones
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
Con Q-307 respondida: lo que vuelva sin marcar, primero; si no, la calidad (medir con `tools/medir.ts` que la app no se pone lenta con el movimiento) y cerrar el frente.
**Leer antes:** `modulos/pulido/diseno-tecnico.md` › Pruebas.
