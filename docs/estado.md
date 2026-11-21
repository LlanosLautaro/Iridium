# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-21
**Nivel de protección:** P2 — personal conectado (ver `perfil-proyecto.md`)

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | hecho | `00-idea.md` |
| 1 | Exploración | hecho | `01-exploracion.md` |
| 2 | Definición y alcance | hecho | `02-definicion.md` |
| 3 | Investigación de dominio | hecho | `03-investigacion.md` |
| 4 | UX | hecho | `04-ux.md` |
| 5 | Arquitectura técnica | hecho | `05-arquitectura.md` |
| 6 | UI | hecho | `06-ui.md` |
| 7 | Construcción | hecho | `07-construccion.md` |
| 8 | Pruebas y calidad | hecho (portón aprobado en Q-108, 2026-11-02) | `08-calidad.md` |
| 9 | Lanzamiento | hecho (portón aprobado en Q-111, 2026-11-02) | `09-lanzamiento.md` |
| 10 | Operación | en curso | `10-operacion.md` |

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Revisión de la app (`modulos/revision/estado.md`) | producto hermano | en operación (con el hito 10) | hecho |
| Skills (`modulos/skills/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10; CO-I8, las piezas de cada versión, probada en Q-225) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3: tandas 1 a 7 y 9 a 18 probadas; vuelve por D-162) | en curso |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va después de Paridad, D-166) | en pausa |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | 8. Calidad (AR-I1 y AR-I2 probadas en Q-227; el paso 8 va al cerrar DI-I3, D-162) | en pausa |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Paridad, Orden y Abrir, D-166; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (`modulos/abrir/estado.md`) | sección | 7. Construcción (AB-I1 a AB-I3 probadas; el paso 8 y la otra PC, T-87, después de Paridad y Orden, D-166) | en pausa |
| Paridad (`modulos/paridad/estado.md`) | sección | 2. Definición (empieza al cerrar DI-I3; Capacidades, T-28, es su segunda parte, D-166) | pendiente |

## En qué estamos ahora
**Frente activo: Diseño** (vuelve por D-162, a tu pedido): las secciones pasaron a las piezas, tanda por tanda; los menús de la barra y del uso quedaron probados (Q-236) y no queda nada del estilo de antes; el detalle del uso, sin el arranque ni la nota (R-99, R-100, D-164). Falta lo que no son piezas (T-58, T-90, T-53) y cerrar DI-I3.
**Sigue Paridad** (D-165; D-166, después de DI-I3): el chat con «/», adjuntos, fotos pegadas y el texto largo como archivo, contra la frontera del motor; su segunda parte es Capacidades (T-28).
**Arranque** (D-135) anduvo la segunda noche (Q-227); su paso 8 va al cerrar DI-I3. Después de Paridad, Orden mide la calidad, **Abrir** hace su paso 8 y la otra PC (T-87) y sigue Plantillas (D-166).
Ideas sin evaluar: T-76, T-78, T-89, T-97 y T-98 («@» y el micrófono), T-93 (cómo lo usa alguien sin nociones técnicas; va con Plantillas, T-81), T-94 (pantallas a medida para partes de un hito) y T-95 (plugins por proyecto). Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
(ninguna)

## Próximo paso
Diseño, DI-I3: lo que queda además de las piezas (T-58, T-90, T-53) y cerrar la iteración; después, Paridad (D-166).
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso y lo que pide.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
