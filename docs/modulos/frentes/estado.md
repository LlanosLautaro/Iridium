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
| 4. UX | hecho (D-177; se ajusta en la prueba) | `ux.md` |
| 5. Diseño técnico | hecho (D-178) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente (el motor no la necesita; las maquetas del tablero, en la parte 2) | — |
| 7. Construcción | en curso (FS-I1 hecha) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-22 (D-175), antes de Capacidades, para usar la cuota que queda de la semana. Primero el motor con la fila interna; después las maquetas y el tablero. Definición aprobada (Q-263, D-176). UX (D-177) y diseño técnico (D-178) del motor escritos. **FS-I1 hecha** (2026-11-22): las marcas en la ruta, el Mapa que las muestra, Ajustes › IA › Avance solo y los interruptores por proyecto y por frente. Todavía no toma pasos: eso es FS-I2.

## Ruta
- [x] Pensar cómo la IA trabaja sola y cómo se ve qué sigue
- [x] Aprobar qué hace el avance solo y qué muestra el tablero (Q-263)
- [x] Marcar en la ruta de cada frente el tamaño y si la IA sigue sola (FS-I1)
- [x] Apagar el avance solo por proyecto y por frente (FS-I1)
- [x] Elegir en Ajustes cuándo avanza sola (FS-I1)
- [ ] Que el Arranque tome pasos solo mientras haya cuota, según su tamaño (T-113, FS-I2, grande)
- [ ] Contar al volver lo que hizo sola y lo que te espera (FS-I2, chico)
- [ ] Dibujar el tablero Frentes: las tarjetas a la izquierda y el mapa de tareas al centro
- [ ] Construir el tablero, con las preguntas de cada frente en su lugar (T-112, grande)
  - [ ] Avisar si los tamaños estimados no coinciden con lo gastado (mediano, sola)
- [ ] Medir su calidad (mediano, sola)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `recursos/plugins/iridium` (framework) › La ruta | el tamaño y `sola` entre los códigos de un paso | D-175 | sí (FS-I1) |
| `05-arquitectura.md` › Modelo de datos | los ajustes y los interruptores (FS-I1); la fila y lo gastado en `arranques.json` (FS-I2) | D-175, D-178 | en parte (FS-I1) |
| `04-ux.md` | el Mapa pasa a llamarse Frentes | D-175 | no |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| FS-I1 | Las marcas en la ruta, el Mapa que las muestra, los ajustes y los interruptores (FS-1 a FS-3) | hecho |
| FS-I2 | El motor que toma pasos y el aviso al volver (FS-4, FS-5) | pendiente |

## Log de iteraciones
### FS-I1 — Las marcas, los ajustes y los interruptores (2026-11-22)
- El framework explica el tamaño (`chico`, `mediano`, `grande`) y `sola` entre los códigos de un paso; el lector los lee solo del paréntesis final (una «grande» en el texto sigue siendo texto) y los saca del texto que se muestra; el control avisa una palabra parecida (`chica`, `solo`), dos tamaños o `sola` sin tamaño.
- El Mapa muestra «mediano · sola» al lado de cada paso que viene, y un interruptor «Avanza sola» en la cabecera de cada frente que no está hecho.
- Ajustes › IA › Avance solo, apagado al principio, con sus condiciones (siempre o de una hora a otra, minutos sin usar, % libre del período, % de la semana, tamaños); un número fuera de rango vuelve al anterior. Ajustes › Este proyecto › Avance solo.
- Pruebas: Vitest (lector y control), Playwright `fs1-avance.spec.ts` (el Mapa y Ajustes, con capturas).

## Próximo paso
FS-I2: el motor que toma pasos (`core/avance.ts` y `app/avance.ts`, junto al Arranque) y el aviso al volver, antes del reinicio semanal del martes 2026-11-24 a la noche.
**Leer antes:** `modulos/frentes/diseno-tecnico.md`; `src/main/app/arranque.ts` (el Arranque, del que copia la forma).
