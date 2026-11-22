# Estado del módulo: Frentes

**Tipo:** sección (el Mapa pasa a ser Frentes y el Arranque suma el avance solo; T-112, T-113)
**Última actualización:** 2026-11-22
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (pensada en el chat; Q-262, D-175) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-263, D-176) | `definicion.md` |
| 3. Investigación | descartado (lo del límite y Anthropic ya se revisó en T-70) | — |
| 4. UX | en curso | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente (las maquetas del tablero) | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-22 (D-175), antes de Capacidades, para usar la cuota que queda de la semana. Primero el motor con la fila interna; después las maquetas y el tablero. Definición aprobada (Q-263, D-176): sigue la UX del motor.

## Ruta
- [x] Pensar cómo la IA trabaja sola y cómo se ve qué sigue
- [x] Aprobar qué hace el avance solo y qué muestra el tablero (Q-263)
- [ ] Marcar en la ruta de cada frente el tamaño y si la IA sigue sola
- [ ] Apagar el avance solo por proyecto y por frente
- [ ] Elegir en Ajustes cuándo avanza sola
- [ ] Que el Arranque tome pasos solo mientras haya cuota, según su tamaño (T-113)
- [ ] Contar al volver lo que hizo sola y lo que te espera
- [ ] Dibujar el tablero Frentes: las tarjetas a la izquierda y el mapa de tareas al centro
- [ ] Construir el tablero, con las preguntas de cada frente en su lugar (T-112)
  - [ ] Avisar si los tamaños estimados no coinciden con lo gastado
- [ ] Medir su calidad

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `recursos/plugins/iridium` (framework) › La ruta | el tamaño y `sola` entre los códigos de un paso | D-175 | no |
| `05-arquitectura.md` › Modelo de datos | la fila y lo gastado, y los interruptores por proyecto y frente | D-175 | no |
| `04-ux.md` | el Mapa pasa a llamarse Frentes | D-175 | no |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones

## Próximo paso
La UX corta del motor (Ajustes, interruptores, el aviso) y el diseño técnico, para construir el motor (FS-I1) antes del reinicio semanal.
**Leer antes:** `modulos/frentes/definicion.md`; `modulos/arranque/diseno-tecnico.md`; `recursos/plugins/iridium/skills/iridium/SKILL.md` › La ruta de un frente.
