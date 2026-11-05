# Estado del módulo: Orden

**Tipo:** sección (atraviesa la app y la forma de trabajar; D-091)
**Última actualización:** 2026-11-05
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | completo (el usuario abrió la operación en el chat, 2026-11-05) | `propuesta.md` |
| 2. Definición | pendiente: el modelo único (códigos, frentes, estados) y el marco único (D-092), con lo que dé la auditoría | — |
| 3. Investigación | en curso: la auditoría de la UX y de la forma de trabajo | — |
| 4. UX | pendiente: `04-ux.md` reescrito como la app de hoy | — |
| 5. Diseño técnico | pendiente | — |
| 6. UI | pendiente | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente abierto el 2026-11-05 con prioridad máxima (D-091): las funciones nuevas quedan frenadas y Diseño espera. La guía de hitos y la skill de Iridium se funden en un solo marco (D-092). Q-131 (ideas) queda adentro de este frente. La auditoría (paso 3) va antes que la definición: el modelo sale de lo que encuentre.

## Pendientes
- [ ] Auditoría de UX: capturas de la app armada en cada pantalla (`tools/capturas.ts`) y crítica con las skills de diseño; qué se rompió respecto de `04-ux.md` y `06-ui.md`.
- [ ] Auditoría de la forma de trabajo: las `Q-n` mal escritas de este y los otros proyectos (sin nombrarlos en el repo, D-082), dónde se pierden ideas y pendientes, qué repiten la guía y la skill de Iridium.
- [ ] Con las dos, `definicion.md`: el modelo único y el marco único, con sus preguntas al usuario.

## Preguntas abiertas
Van en `docs/estado.md` (Q-132).

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
La auditoría de UX: capturas de la app armada en cada pantalla y su crítica, en `auditoria.md`.
