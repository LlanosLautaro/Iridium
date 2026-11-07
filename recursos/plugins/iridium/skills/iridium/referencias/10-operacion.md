# Hito 10 — Operación e iteración

**Objetivo:** mantener la app sana y decidir con información qué viene después. Este hito no termina: es el ciclo de vida del producto. Cada nueva versión vuelve a pasar por los hitos necesarios.

## Preguntas (periódicas)
1. ¿Qué usás más y qué casi nunca?
2. ¿Qué te molesta o te hace perder tiempo?
3. ¿Apareció algún error?
4. ¿Cambió algo del ecosistema? (nueva versión de un formato, de una API, de una dependencia)
5. ¿Siguen valiendo los objetivos del hito 2?

## Actividades

**1. Recoger señales.** Uso propio (notas de fricciones), comentarios de usuarios, errores registrados, métricas si las hay (según el nivel).

**2. Mantenimiento.** Actualizar dependencias, revisar vulnerabilidades, adaptarse a cambios del ecosistema (si cambia un formato, se vuelve al hito 3 para esa área).

**3. Trabajo.** Lo que podría hacerse (defectos, mejoras, ideas nuevas, deuda técnica) está en `trabajo.md`, un `T-n` por cosa, no en un Backlog aparte. Se prioriza con el mismo criterio MoSCoW del hito 2, escrito en el texto de cada `T-n`. Los errores que reporta el usuario los clasifica la IA (resolver ahora o un `T-n` `pendiente`) con el criterio de `SKILL.md`, sin preguntarle.

**4. Planificar la siguiente versión.** Elegir qué entra, y según el tamaño del cambio, decidir por qué hitos pasa:
- **Corrección o ajuste menor:** directo al hito 7 → 8 → 9.
- **Funcionalidad nueva acotada:** actualizar 02 (alcance) → 04 (UX de esa parte) → 06 si hay pantallas nuevas → 7 → 8 → 9.
- **Funcionalidad que toca otro dominio o cambia la arquitectura:** 02 → 03 → 04 → 05 → 06 → 7 → 8 → 9.
- **Cambio de rumbo del producto:** volver al hito 1.
- **Algo con vida propia** (sección grande, plugin, producto hermano): se abre como frente con su ciclo reducido. Ver `referencias/modulos.md`.

**Cambios como propuestas.** Un cambio que no es una corrección menor se escribe primero como propuesta, en la sección "Próxima versión" (o en `docs/cambios/<nombre>.md` si es grande): por qué se hace, qué cambia en cada documento (alcance, historias, arquitectura, pantallas) y sus tareas. El usuario la aprueba como `Q-n` de tipo decisión. Al terminarla, cada documento afectado queda al día con lo que se construyó y la propuesta se marca `hecho` con la fecha. Así los documentos no quedan viejos después del lanzamiento.

**5. Ronda de UX.** Al terminar cada frente y cada cinco comentarios de la Revisión juntados: `referencias/ronda-ux.md`.

**6. Revisión periódica de la documentación.** Cada tanto (por ejemplo, en cada versión mayor), revisar que `docs/` refleje la app real. Documentación desactualizada es peor que ninguna para la IA.

> **Con impeccable:** si la skill `impeccable` está instalada, en la revisión periódica usa `document` para poner `DESIGN.md` al día con la UI real. Ver `referencias/integraciones.md`.

## Señales de alerta
- `estado.md` lleva mucho tiempo sin actualizarse.
- Se agregan funcionalidades que no pasaron por la definición.
- La deuda técnica crece en cada iteración.
- Nadie (ni el autor) recuerda por qué se tomó una decisión: falta registrar en `decisiones.md`.

## Plantilla — `docs/10-operacion.md`

~~~markdown
# Operación e iteración

## Señales recogidas
| Fecha | Fuente | Observación |
|---|---|---|

## Mantenimiento
| Fecha | Qué se actualizó | Motivo |
|---|---|---|

## Rondas de UX
| Fecha | Qué la disparó | Hallazgos (`T-n`) |
|---|---|---|

## Próxima versión
- Objetivo:
- Incluye: [`T-n`, …]
- Hitos a recorrer:
- Propuestas: [por qué, qué cambia en cada documento, tareas, estado]
~~~
