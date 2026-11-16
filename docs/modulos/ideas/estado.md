# Estado del módulo: Ideas

**Tipo:** sección (las ideas y los enlaces para revisar de cada proyecto; D-127)
**Última actualización:** 2026-11-16
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (la forma C, con estados en color, las ideas de la IA y el inicio igual: D-128) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-178; aprobar es pasar al trabajo, D-129) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros: la IA lee los enlaces con sus herramientas, como hoy; lo de Obsidian ya se usó en las maquetas) | — |
| 4. UX | en curso (escrita; espera Q-180) | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente abierto el 2026-11-16 a pedido del usuario (T-69, D-127). Con Q-175 a Q-177 la Propuesta se cerró (D-128): la forma C, cada idea con su estado en color (sin evaluar, aprobada en verde, rechazada en rojo, hecha), las ideas de la IA en la misma lista con un robot y su código, e Ideas del inicio con la misma forma para las ideas sueltas («Sin proyecto» por defecto, Mover a un proyecto). La maqueta C está corregida y hay una del inicio (`ideas-inicio-c.html`). La Definición quedó aprobada (Q-178) y aprobar una idea la pasa al trabajo de la IA como pendiente (D-129). La UX está escrita (`ux.md`: ID-1 a ID-11) y espera el visto bueno (Q-180).

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `04-ux.md` › W-10 (Ideas) | Ideas del inicio pasa a ser la lista de ideas sueltas, con la forma de la del proyecto | D-128 | no (al cerrar la UX del frente) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones
(todavía ninguna)

## Próximo paso
Con Q-180: cerrar la UX y escribir el diseño técnico (`diseno-tecnico.md`): dónde se guarda una idea del usuario con su nota y sus imágenes, cómo se leen las de la IA de `trabajo.md`, el formato nuevo en el framework con su lector y su control (D-086, D-092), y qué pasa con `notas.md` del bloc. El paso 6 (UI) se salta si las tres piezas nuevas de `ux.md` entran como variantes.
**Leer antes:** `ux.md`; `respuestas/Q-180.md`; `05-arquitectura.md`; `src/main/core/` donde se lee `trabajo.md`.
