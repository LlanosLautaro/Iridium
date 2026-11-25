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
| 7. Construcción | en curso (PU-I1) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Decidido en D-197 y aprobado en Q-302: la maqueta viva (`docs/diseno/pantallas/pulido.html`) tiene todo; lo que te espera pasa a naranja (Q-303, ya en `tokens.css`: la app lo toma al armarse). Con R-111 lo hecho en un camino va en verde apagado, y con R-112 la luz de «corriendo» se desvanece en los extremos. `ux.md` y `diseno-tecnico.md` escritos; sigue la construcción en dos iteraciones.

## Ruta
- [x] Decidir cuánto color y cuánto movimiento lleva, y qué entra (Q-299, Q-300, Q-301)
- [x] Ver las animaciones y los colores en una maqueta viva, antes de pasarlos a la app (Q-302)
- [x] Elegir el color de lo que te espera: naranja (Q-303)
- [ ] Color y movimiento en toda la app: el acento en lo activo, las tarjetas, el mapa que late, «corriendo», las casillas y lo que entra (PU-I1, mediano, sola)
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
| PU-I1 | Color y movimiento en las piezas y las secciones: el acento en lo activo, lo hecho apagado, el naranja, las tarjetas, el mapa que late, «corriendo», las casillas, lo que entra y el hover; sin seguir las animaciones apagadas de Windows | pendiente |
| PU-I2 | El acento en Ajustes › Apariencia y las pestañas de la barra que se corren al arrastrar | pendiente |

## Log de iteraciones
(Todavía ninguna.)

## Próximo paso
Construir PU-I1: pasar a `piezas.css` (maqueta y app) y a las hojas de las secciones lo de la maqueta, según `diseno-tecnico.md` › Estructura interna.
**Leer antes:** `modulos/pulido/diseno-tecnico.md`; `modulos/pulido/ux.md` › Pantallas; el `<style>` de `docs/diseno/pantallas/pulido.html`.
