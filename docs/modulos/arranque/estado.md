# Estado del módulo: Arranque

**Tipo:** sección (el arranque del período de 5 horas; T-70)
**Última actualización:** 2026-11-18
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (D-135; elegido en Q-205) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-206, D-146) | `definicion.md` |
| 3. Investigación | descartado (lo de Anthropic y cómo anda el límite ya se revisó en T-70) | — |
| 4. UX | hecho (aprobada en Q-207 con el aviso al volver, D-147) | `ux.md` |
| 5. Diseño técnico | hecho (D-149) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | descartado (sin piezas nuevas: el aviso fijo es un estado de la pieza Aviso, D-149) | — |
| 7. Construcción | en curso (AR-I1) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-18 (Q-205). Definición (D-146), UX (D-147) y diseño técnico (D-149) cerrados. Sigue la construcción: AR-I1, el motor del arranque y su ajuste.

## Ruta
- [x] Decidir cómo se arranca el período (con trabajo real, desde Iridium)
- [x] Aprobar qué hace y qué no
- [x] Dibujar el interruptor en Ajustes y dónde se ve lo que hizo
- [x] Decidir cómo se construye (D-149)
- [ ] Arrancar el proyecto que espera hace más, a la hora elegida y al vencer el período (AR-I1)
- [ ] Contar qué arrancó o por qué no pudo: el aviso al volver, la pestaña y el detalle del uso (AR-I2)
- [ ] Probarlo una noche con Iridium abierta

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| AR-I1 | El motor del arranque: el ajuste, el temporizador con la suspensión, la elección del proyecto, arrancar como Nueva y `arranques.json` | pendiente |
| AR-I2 | Contar lo que hizo: la línea de la conversación, el detalle del uso y el aviso al volver | pendiente |

## Log de iteraciones
(todavía ninguna)

## Próximo paso
Construir AR-I1: el ajuste en `config.json` y Ajustes › IA, `core/arranque.ts`, `app/arranque.ts` con `powerMonitor`, `infra/arranques.ts` y la marca en `sesiones.json`; primero, leer qué informa el uso sin un período abierto.
**Leer antes:** `diseno-tecnico.md`; `ux.md` › AR-1; en el código, `src/main/app/uso.ts`, `src/main/app/conversacion.ts` › seguir, `src/main/app/pendientes.ts`, `src/main/infra/sesiones.ts`, `src/main/infra/config.ts` y `src/main/index.ts`.
