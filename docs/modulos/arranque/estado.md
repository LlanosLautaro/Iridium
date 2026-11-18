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
| 7. Construcción | en curso (AR-I1 hecha; sigue AR-I2) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-18 (Q-205). Definición (D-146), UX (D-147) y diseño técnico (D-149) cerrados. AR-I1 hecha el 2026-11-18: el ajuste y el motor arrancan solos; todavía no se cuenta lo que hizo. Sigue AR-I2.

## Ruta
- [x] Decidir cómo se arranca el período (con trabajo real, desde Iridium)
- [x] Aprobar qué hace y qué no
- [x] Dibujar el interruptor en Ajustes y dónde se ve lo que hizo
- [x] Decidir cómo se construye (D-149)
- [x] Arrancar el proyecto que espera hace más, a la hora elegida y al vencer el período (AR-I1)
- [ ] Contar qué arrancó o por qué no pudo: el aviso al volver, la pestaña y el detalle del uso (AR-I2)
- [ ] Probarlo una noche con Iridium abierta

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `05-arquitectura.md` › Modelo de datos | `config.json` suma `arranque`; `sesiones.json`, la marca `arranque`; los datos suman `arranques.json` | D-149 | sí (AR-I1) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| AR-I1 | El motor del arranque: el ajuste, el temporizador con la suspensión, la elección del proyecto, arrancar como Nueva y `arranques.json` | hecho (2026-11-18; la prueba del usuario va con AR-I2) |
| AR-I2 | Contar lo que hizo: la línea de la conversación, el detalle del uso y el aviso al volver | pendiente |

## Log de iteraciones
### AR-I1 — El motor del arranque (2026-11-18)
- **Ajustes › IA:** «Abrir el período de Claude», apagado al principio, con la hora (3:00 por defecto, en gris apagado) y la explicación de la maqueta. Se guarda solo en `config.json` (`arranque`); un valor roto vuelve a apagado a las 3:00. Va con las demás preferencias (no hizo falta el pedido aparte `ajustarArranque` del diseño).
- **Reglas** (`src/main/core/arranque.ts`): el próximo momento (la hora local de hoy o mañana, o 5 minutos después del vencimiento, el que llegue antes, sin repetir uno hecho), por qué no arranca (sin uso, período abierto, semana en 90 %), el que espera hace más y el momento que cayó en el reinicio de Actualizar solo (menos de 10 minutos).
- **Caso de uso** (`src/main/app/arranque.ts`): un temporizador que espera como mucho 15 minutos de una vez y se recalcula al cambiar el ajuste o el uso, y al despertar la PC (`powerMonitor`); dormida, un momento vencido se hace al despertar, una vez. Al llegar relee el uso, junta los candidatos de la Bandeja de cada proyecto (con framework, sin archivar, sin trabajar ni usado en VS Code hace menos de 10 minutos, respuestas que no son «Más tarde»; la más vieja por la fecha de su archivo), mira la sesión de Claude y abre una Nueva con «Continúa con el proyecto.». Cada momento queda en el registro del día.
- **Datos:** `arranques.json` (7 días, el momento programado y `vistoHasta` para AR-I2). Cambio sobre el diseño: el renglón no copia el id de la conversación; se encuentra por la marca `arranque` de `sesiones.json`, que es la misma hora (el id lo da Claude Code después de abrir). `perdidos` del diseño no hizo falta: con un solo momento programado, el que venció durmiendo es ese.
- **Pruebas:** Vitest `tests/ar1-arranque.test.ts` (18: reglas con fechas fijas, el caso de uso con reloj falso, la suspensión, el reinicio, `arranques.json`, el ajuste y la marca en `sesiones.json`); Playwright `tests/e2e/ar1-arranque.spec.ts` (el ajuste queda al cerrar y abrir; con `IRIDIUM_ARRANQUE_EN=3` y `IRIDIUM_FALSO_PERIODO=cerrado`, arranca Alfa, la respuesta más vieja, y no Beta ni Gamma archivado; la pestaña aparece sola y termina). Variables nuevas en `herramientas-ia.md`.
- **Queda por confirmar** (riesgo del diseño): qué informa el uso real sin un período abierto. Se supone sin vencimiento o con uno pasado; se ve en la prueba de una noche (AR-I2), con lo que anota el registro.

## Próximo paso
Construir AR-I2: la línea de la conversación arrancada (AR-2), el detalle del uso con lo último y la semana (AR-2, AR-3), el aviso al volver (AR-4, un estado de la pieza Aviso) y el evento `arranque` a la ventana; al terminar, la prueba de una noche como `Q-n`.
**Leer antes:** `diseno-tecnico.md` › Las piezas, › Las decisiones de este paso (punto 8); `ux.md` › AR-2 a AR-4 y › Pantallas; este archivo › Log de iteraciones; en el código, `src/main/app/arranque.ts`, `src/main/infra/arranques.ts`, `src/renderer/marco/Uso.tsx`, `src/renderer/marco/Avisos.tsx` y `src/renderer/secciones/proyecto/Conversacion.tsx`.
