# Estado del módulo: Orden

**Tipo:** sección (atraviesa la app y la forma de trabajar; D-091)
**Última actualización:** 2026-11-06
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | completo (el usuario abrió la operación en el chat, 2026-11-05) | `propuesta.md` |
| 2. Definición | en curso: escrita (2026-11-06); faltan tus respuestas (Q-133 a Q-135) | `definicion.md` |
| 3. Investigación | completo (2026-11-05): la UX y la forma de trabajo, A-1 a A-23 | `auditoria.md` |
| 4. UX | pendiente: `04-ux.md` reescrito como la app de hoy | — |
| 5. Diseño técnico | pendiente | — |
| 6. UI | pendiente | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente abierto el 2026-11-05 con prioridad máxima (D-091): las funciones nuevas quedan frenadas y Diseño espera. La guía de hitos y la skill de Iridium se funden en un solo marco (D-092). Q-131 (ideas) queda adentro de este frente. La auditoría (paso 3) va antes que la definición: el modelo sale de lo que encuentre. La auditoría está hecha: la UX (`auditoria.md` › Parte 1, A-1 a A-12) y la forma de trabajo (Parte 2, A-13 a A-23: reglas contrarias entre la guía y la skill, preguntas que Iridium no ve, un control que no ve nada de eso, ideas en hasta ocho lugares, tres vocabularios de estados), cada una con sus conclusiones para el modelo. Fuera de Iridium no hay marco (D-093). La definición está escrita: cuatro cosas que se siguen (preguntas, trabajo, comentarios, decisiones), cada una en un lugar con código, frente y estado; un vocabulario de estados; el marco único con su control, que le devuelve a la IA lo mal escrito al terminar el turno; y «Pasar al marco» en lugar de «Poner al día». Esperan tus decisiones: ideas y pendientes en una sola lista (Q-133), qué carpetas siguen el marco (Q-134) y cada cuánto la ronda de UX (Q-135).

## Pendientes
- [x] Auditoría de UX (`auditoria.md` › Parte 1; capturas con `tools/auditoria-ux.ts`).
- [ ] El chip del frente en el Mapa muestra el primer paso sin completar en vez del que está en curso (A-5): con la primera iteración.
- [x] Auditoría de la forma de trabajo (`auditoria.md` › Parte 2).
- [x] `definicion.md`: el modelo único y el marco único (OR-1 a OR-12), con Q-133 a Q-135.
- [ ] Con Q-133 a Q-135: ajustar `definicion.md`, registrar las decisiones y sumar los términos nuevos al glosario de `02-definicion.md`.

## Preguntas abiertas
Van en `docs/estado.md`: Q-133 (frena), Q-134 y Q-135.

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `02-definicion.md` › Módulos previstos | Orden, activo y primero; Diseño y Capacidades detrás | D-091 | sí |
| `10-operacion.md` › Backlog | Orden en los frentes; los `R-n` nuevos esperan la ronda de UX | D-091 | sí |
| `04-ux.md` | Reescrito sin capas | D-091 | no (paso 4) |
| La skill de Iridium y la guía de hitos | Un solo marco, con control | D-092 | no (paso 2 en adelante) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| (todavía ninguna) | | |

## Próximo paso
Procesar Q-133 a Q-135 (ajustar `definicion.md`, decisiones y glosario) y pasar al paso 4: reescribir `04-ux.md` sin capas, primero la arquitectura de información, sobre el modelo de `definicion.md`.
