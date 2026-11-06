# Estado del módulo: Orden

**Tipo:** sección (atraviesa la app y la forma de trabajar; D-091)
**Última actualización:** 2026-11-06
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | completo (el usuario abrió la operación en el chat, 2026-11-05) | `propuesta.md` |
| 2. Definición | completo (2026-11-06; Q-133 a Q-135 → D-094 a D-096) | `definicion.md` |
| 3. Investigación | completo (2026-11-05): la UX y la forma de trabajo, A-1 a A-23 | `auditoria.md` |
| 4. UX | completo (2026-11-06; Q-136 a Q-139 → D-097 a D-099): `04-ux.md` reescrito sin capas | `ux.md` (historia) y `04-ux.md` |
| 5. Diseño técnico | completo (2026-11-06): el control, `trabajo.md`, el vocabulario, los frentes del Mapa, Actualizar y cuatro iteraciones | `diseno-tecnico.md` |
| 6. UI | en curso (2026-11-06): hoja de piezas lista, espera Q-140 | `06-ui.md` › Frente Orden y `ui/vista-orden.html` |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente abierto el 2026-11-05 con prioridad máxima (D-091): las funciones nuevas esperan. Hechas la auditoría (A-1 a A-23), la definición (D-094 a D-096) y la UX: `04-ux.md` está reescrito entero, sin capas, con las pantallas aprobadas en Q-139 (W-1 a W-17) y el nombre «framework» en lugar de «marco» (D-099). El diseño técnico está escrito (`diseno-tecnico.md`): el control corre al terminar cada turno con los lectores de la pantalla y le devuelve a la IA lo mal escrito una vez por turno; `trabajo.md` se anota desde Iridium sin pisar a la sesión; un vocabulario de estados con una tabla de transición para los proyectos con framework viejo; Actualizar junta Armar y Reiniciar. Cuatro iteraciones, por riesgo: OR-I1 el modelo y el control, OR-I2 el esqueleto y la Bandeja (con Actualizar), OR-I3 Trabajo e Ideas, OR-I4 Mapa, Skills › Framework y Pasar al framework. R-13 (los dibujos en texto desalineados) se arregló con la letra completa.

## Pendientes
- [x] Auditoría de UX (`auditoria.md` › Parte 1; capturas con `tools/auditoria-ux.ts`).
- [ ] El chip del frente en el Mapa muestra el primer paso sin completar en vez del que está en curso (A-5): con la primera iteración.
- [x] Auditoría de la forma de trabajo (`auditoria.md` › Parte 2).
- [x] `definicion.md`: el modelo único y el framework único (OR-1 a OR-12), con Q-133 a Q-135.
- [x] Con Q-133 a Q-135: `definicion.md` ajustada, D-094 a D-096 y el glosario de `02-definicion.md`.
- [x] `ux.md` › Parte 1, la arquitectura de información.
- [x] Con Q-136 a Q-138: `ux.md` › Parte 1 ajustada (D-097, D-098) y la Parte 2, las pantallas PO-1 a PO-10.
- [x] Con Q-139: `04-ux.md` reescrito sin capas (las PO-n pasaron a W-n) y D-099.
- [x] Paso 5, diseño técnico (`diseno-tecnico.md`).
- [x] Paso 6, UI: las piezas nuevas en `06-ui.md` y la hoja `ui/vista-orden.html` con capturas en los dos temas.
- [ ] Con Q-140: reescribir las reglas de color de `DESIGN.md` (el ámbar solo para lo que frena, el botón principal), registrar la decisión y cerrar el paso 6.
- [ ] R-12 (un solo botón Actualizar, W-1): en OR-I2.

## Preguntas abiertas
Van en `docs/estado.md`: Q-140 (el visto bueno de las piezas y el botón principal).

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `02-definicion.md` › Módulos previstos | Orden, activo y primero; Diseño y Capacidades detrás | D-091 | sí |
| `10-operacion.md` › Backlog | Orden en los frentes; los `R-n` nuevos esperan la ronda de UX | D-091 | sí |
| `04-ux.md` | Reescrito sin capas | D-091, D-097 a D-099 | sí |
| `05-arquitectura.md` | Trabajo en el modelo de datos, `anchoConversacion` y el control al terminar un turno | D-092, D-094, D-098 | sí |
| `02-definicion.md` › Glosario | «Framework» en lugar de «Marco» | D-099 | sí |
| La skill de Iridium y la guía de hitos | Un solo framework, con control | D-092 | no (paso 2 en adelante) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| OR-I1 | El modelo y el control | pendiente |
| OR-I2 | El esqueleto y la Bandeja de entrada, con Actualizar | pendiente |
| OR-I3 | Trabajo e Ideas, anotar sin la IA | pendiente |
| OR-I4 | El Mapa con frentes, Skills › Framework, Pasar al framework | pendiente |

## Próximo paso
Con Q-140: `DESIGN.md` y la decisión, cerrar el paso 6 y empezar OR-I1 (el modelo y el control).
