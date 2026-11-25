# Estado del módulo: Pulido

**Tipo:** sección (atraviesa toda la app)
**Última actualización:** 2026-11-25
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
| 7. Construcción | en curso (PU-I1 hecha; sigue PU-I2) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
PU-I1 hecha (2026-11-25): el acento cian, los colores de las tarjetas, el mapa que late, «corriendo», la casilla y lo que entra ya están en la app. Sigue PU-I2 (elegir el acento y las pestañas que se corren); las dos se prueban juntas.

## Ruta
- [x] Decidir cuánto color y cuánto movimiento lleva, y qué entra (Q-299, Q-300, Q-301)
- [x] Ver las animaciones y los colores en una maqueta viva, antes de pasarlos a la app (Q-302)
- [x] Elegir el color de lo que te espera: naranja (Q-303)
- [x] Color y movimiento en toda la app: el acento en lo activo, las tarjetas, el mapa que late, «corriendo», las casillas y lo que entra (PU-I1)
- [ ] Elegir el acento en Ajustes y las pestañas que se corren al arrastrar una (PU-I2, mediano, sola)
- [ ] Probarlo en la app
- [ ] Medir la calidad: la app no se pone lenta con el movimiento (chico, sola)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `decisiones.md` | una decisión nueva que corrige D-100, D-103 y D-108 en lo que toque | D-197 | sí |
| `docs/diseno/tokens.css`, `DESIGN.md`, `06-ui.md` | el acento, los colores de estado y las duraciones como tokens | D-197 | en parte: `tokens.css` sí (los candidatos de Q-303 se van al decidir); `DESIGN.md` y `06-ui.md`, al pasarlo a la app |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| PU-I1 | Color y movimiento en las piezas y las secciones: el acento en lo activo, lo hecho apagado, el naranja, las tarjetas, el mapa que late, «corriendo», las casillas, lo que entra y el hover; sin seguir las animaciones apagadas de Windows | hecho (2026-11-25; se prueba con PU-I2) |
| PU-I2 | El acento en Ajustes › Apariencia y las pestañas de la barra que se corren al arrastrar | pendiente |

## Log de iteraciones
### PU-I1 — 2026-11-25 (el avance solo)
- **Piezas** (`docs/diseno/piezas.css` y la copia de la app, iguales): el punto en el acento (`.punto.acento`) y el naranja con brillo; `.punto.del-color` para el estado de una tarjeta; la casilla con su golpe y `.casilla.por-hacer`, que apaga el texto al marcarla (las casillas de la Bandeja); el menú, el cuadro y la ventana entran en un cuarto de segundo; filas, botones, pestañas y menús cambian de fondo con `--dur-hover`; en el Camino, lo hecho en verde apagado (R-111) y el paso que sigue en el acento con su radar.
- **Marco:** la sección elegida en el acento con su brillo (también la rayita); el punto de la Bandeja y el del inicio en el acento si algo espera sin frenar, naranja si frena; el de la Revisión sigue gris (espera a la IA).
- **Tarjetas:** el estado y su punto en su color (en uso, en desarrollo, idea, en rescate, para eliminar); pausado, descontinuado y archivado en gris. En rescate ahora también lleva su punto.
- **«▶ N corriendo»** en el acento; con las consolas plegadas, el punto que late y la luz que cruza y se desvanece (R-112). Los avisos de la esquina entran desde la derecha.
- **Sin seguir las animaciones apagadas de Windows:** fuera los cinco `prefers-reduced-motion`. Dos pruebas nuevas en `tests/estilos.test.ts`: ninguna hoja lo vuelve a poner y ninguna escribe una duración a mano.
- La maqueta `pulido.html` usa ahora las piezas (solo le queda lo propio de la muestra). En `.impeccable/config.json`, el brillo, el pulso y la luz quedan permitidos en las piezas, el marco y las consolas, como en la maqueta (Q-299, Q-300).

## Próximo paso
Construir PU-I2: el acento en Ajustes › Apariencia (la preferencia `acento` y la variable en la raíz) y el arrastre propio de las pestañas de la barra de proyectos (`Marco.tsx`), como `pulido.js`.
**Leer antes:** `modulos/pulido/diseno-tecnico.md` › Estructura interna y › Pruebas; `docs/diseno/pantallas/pulido.js` (el arrastre).
