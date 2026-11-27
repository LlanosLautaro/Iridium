# Estado del módulo: Plantillas

**Tipo:** plugin (el framework)
**Última actualización:** 2026-11-27
**Nivel de protección:** hereda P2

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (Q-324 y Q-325, D-208 y D-209) | `propuesta.md` |
| 2. Definición | en curso (escrita; espera Q-326) | `definicion.md` |
| 3. Investigación | hecho (S-9: la receta anda en otra app) | `investigacion.md` |
| 4. UX | descartado (no tiene pantallas: lo lee la IA) | — |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | descartado (sin interfaz) | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Propuesta aprobada (Q-324 A, D-208): recetas sueltas del framework; una nueva llega como novedad (Q-325 A, D-209). La definición está escrita y espera Q-326. La prueba de la receta sin ventanas en una app de muestra, fuera de Iridium, anduvo (S-9).

## Ruta
- [x] Aprobar la propuesta: qué es una receta y las dos primeras (Q-324, Q-325)
- [x] Probar la receta sin ventanas en una app de Electron de muestra, fuera de Iridium (S-9)
- [ ] Aprobar la definición de las dos primeras recetas (Q-326)
- [ ] Escribir la receta «Pruebas sin ventanas», mudar la actualización sola a `recetas/` y avisar con la novedad (T-81, mediano)
- [ ] Probarla en una de tus apps, a pedido tuyo desde su conversación (T-81)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `02-definicion.md` › Glosario | Receta | D-208 | sí |
| `05-arquitectura.md` › Spikes | S-9 | — | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones
(Todavía no hay iteraciones.)

## Próximo paso
Con Q-326 respondida: escribir la receta «Pruebas sin ventanas», mudar la actualización sola a `recetas/` y sumar la novedad con `Solo si:` de varias rutas (lector, control y pruebas).
**Leer antes:** `definicion.md`, `investigacion.md`, `respuestas/Q-326.md` y `src/main/core/novedades-framework.ts`.
