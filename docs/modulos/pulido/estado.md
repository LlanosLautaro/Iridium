# Estado del módulo: Pulido

**Tipo:** sección (atraviesa toda la app)
**Última actualización:** 2026-11-25
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | en curso (espera Q-299 a Q-301) | `propuesta.md` |
| 2. Definición | pendiente | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros) | — |
| 4. UX | pendiente | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente (la maqueta viva con las animaciones y los colores) | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-25 a pedido del usuario: movimiento y color donde hoy la app es quieta y gris. La propuesta junta sus siete pedidos y tres que suma la IA, y marca las decisiones que toca (D-100, D-103, D-104, D-108). Espera Q-299 (cuánto color), Q-300 (cuánto movimiento) y Q-301 (la lista).

## Ruta
- [ ] Decidir cuánto color y cuánto movimiento lleva, y qué entra (Q-299, Q-300, Q-301)
- [ ] Ver las animaciones y los colores en una maqueta viva, antes de pasarlos a la app (mediano)
- [ ] Las pestañas se corren para dejar lugar mientras arrastrás una (chico)
- [ ] El estado de cada tarjeta de proyecto, con su color (chico)
- [ ] El nivel activo del mapa late como un radar (chico)
- [ ] Un acento para el ícono activo del panel izquierdo, elegido en Ajustes (mediano)
- [ ] «Corriendo» se mueve con las consolas plegadas (chico)
- [ ] El punto de pendientes en los íconos, con color (chico)
- [ ] Marcar la casilla de un pendiente, con una animación (chico)
- [ ] Menús, cuadros, avisos y paneles que entran en vez de aparecer de golpe (mediano)
- [ ] Medir la calidad: nada se mueve con las animaciones de Windows apagadas, y la app no se pone lenta (chico)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `decisiones.md` | una decisión nueva que corrige D-100, D-103, D-104 y D-108 en lo que toque | según Q-299 y Q-300 | no |
| `docs/diseno/tokens.css`, `DESIGN.md`, `06-ui.md` | el acento, los colores de estado y las duraciones como tokens | según Q-299 y Q-300 | no |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones
(Todavía ninguna.)

## Próximo paso
Con Q-299 a Q-301 respondidas: registrar la decisión, escribir `definicion.md` y armar la maqueta viva en `docs/diseno/` para verla en Diseño.
**Leer antes:** `modulos/pulido/propuesta.md`; `docs/diseno/tokens.css`; las respuestas de Q-299 a Q-301.
