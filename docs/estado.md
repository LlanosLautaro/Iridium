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
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3: tandas 1 a 7 y 9 a 17 probadas; la 18, los menús, espera Q-236; vuelve por D-162) | en curso |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va al cerrar Diseño, D-102, D-151) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | 8. Calidad (AR-I1 y AR-I2 probadas en Q-227; el paso 8 va al cerrar DI-I3, D-162) | en pausa |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Diseño y Orden, D-151; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (`modulos/abrir/estado.md`) | sección | 7. Construcción (AB-I1 a AB-I3 probadas; el paso 8 y la otra PC, T-87, al cerrar DI-I3, D-162) | en pausa |

## En qué estamos ahora
**Frente activo: Diseño** (vuelve por D-162, a tu pedido): las secciones pasaron a las piezas, tanda por tanda; la grilla de Proyectos quedó probada (Q-235). **Los menús de la barra y del uso** (el uso, las conversaciones anteriores, el modelo, el esfuerzo, «En esta página») ya son el Menú de la maqueta y esperan Q-236; con ellos no queda nada del estilo de antes. Falta lo que no son piezas (T-58, T-90, T-53) y cerrar DI-I3.
**Arranque** (D-135) anduvo la segunda noche (Q-227); su paso 8 va al cerrar DI-I3, junto con el de **Abrir** (T-87, D-160). Después de Diseño, Orden mide la calidad y sigue Plantillas (D-151, D-150).
Ideas sin evaluar: T-76, T-78, T-89, T-93 (cómo lo usa alguien sin nociones técnicas; va con Plantillas, T-81), T-94 (pantallas a medida para partes de un hito) y T-95 (plugins por proyecto). Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-236 — Probá los menús de la barra y del uso**
  Tipo: prueba · Frente: Diseño
  Contexto: la tanda 18 (`modulos/diseno/estado.md` › DI-I3, tanda 18). Antes, Actualizar. Los menús quedan sin borde, con sombra y el título en gris, como el del clic derecho.
  - [ ] Tocando el uso (abajo a la derecha) se abre el detalle hacia arriba, con sus barras de color y el último arranque
  - [ ] El reloj de la conversación abre las anteriores: cada una con su título, de dónde es y la fecha a la derecha; la abierta, resaltada
  - [ ] El modelo y el esfuerzo (abajo del compositor) abren la lista con la descripción en gris y el elegido resaltado; elegir otro lo cambia
  - [ ] El contexto (el círculo) abre su detalle y en Docs «En esta página» lleva a una sección
  - [ ] Las flechas recorren cada menú y Esc lo cierra
Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Diseño, DI-I3: lo que queda además de las piezas (T-58, T-90, T-53) y cerrar la iteración (procesar Q-236 si llegó).
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso y lo que pide.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
