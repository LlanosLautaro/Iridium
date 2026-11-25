# Estado del módulo: Pulido

**Tipo:** sección (atraviesa toda la app)
**Última actualización:** 2026-11-25
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (D-197) | `propuesta.md` |
| 2. Definición | en curso (espera Q-302) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros) | — |
| 4. UX | pendiente | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | en curso (la maqueta viva, `docs/diseno/pantallas/pulido.html`; espera Q-302 y Q-303) | `docs/diseno/pantallas/pulido.html` |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-25. Decidido en D-197 (aire de instrumento futurista sobre el negro): un acento elegible con brillo para lo activo, estados de tarjetas con color, otro color para lo que espera, movimiento sutil con dos pulsos y sin seguir las animaciones apagadas de Windows. `definicion.md` escrita; la maqueta viva (`docs/diseno/pantallas/pulido.html`, en Diseño) tiene cada efecto andando, con el acento y el color de lo que espera para elegir arriba. Espera Q-302 (mirarla) y Q-303 (el color de lo que espera).

## Ruta
- [x] Decidir cuánto color y cuánto movimiento lleva, y qué entra (Q-299, Q-300, Q-301)
- [ ] Ver las animaciones y los colores en una maqueta viva, antes de pasarlos a la app (Q-302)
- [ ] Elegir el color de lo que te espera (Q-303)
- [ ] Las pestañas se corren para dejar lugar mientras arrastrás una (chico)
- [ ] El estado de cada tarjeta de proyecto, con su color (chico)
- [ ] El nivel activo del mapa late como un radar (chico)
- [ ] Un acento para el ícono activo del panel izquierdo, elegido en Ajustes (mediano)
- [ ] «Corriendo» se mueve con las consolas plegadas (chico)
- [ ] El punto de pendientes en los íconos, con color (chico)
- [ ] Marcar la casilla de un pendiente, con una animación (chico)
- [ ] Menús, cuadros, avisos y paneles que entran en vez de aparecer de golpe (mediano)
- [ ] Se mueve aunque las animaciones de Windows estén apagadas (chico)
- [ ] Medir la calidad: la app no se pone lenta con el movimiento (chico)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `decisiones.md` | una decisión nueva que corrige D-100, D-103 y D-108 en lo que toque | D-197 | sí |
| `docs/diseno/tokens.css`, `DESIGN.md`, `06-ui.md` | el acento, los colores de estado y las duraciones como tokens | D-197 | en parte: `tokens.css` sí (los candidatos de Q-303 se van al decidir); `DESIGN.md` y `06-ui.md`, al pasarlo a la app |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones
(Todavía ninguna.)

## Próximo paso
Con Q-302 y Q-303 respondidas: corregir la maqueta con lo que diga, sacar los candidatos de `tokens.css`, y escribir `ux.md` (corto: dónde va el selector del acento en Ajustes › Apariencia) y `diseno-tecnico.md` (cómo se corren las pestañas y dónde van los tokens en la app).
**Leer antes:** las respuestas de Q-302 y Q-303; `modulos/pulido/definicion.md`.
