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
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va al cerrar Diseño, D-102, D-151) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | 8. Calidad (AR-I1 y AR-I2 probadas en Q-227; el paso 8 va al cerrar DI-I3, D-162) | en pausa |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Diseño y Orden, D-151; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (`modulos/abrir/estado.md`) | sección | 7. Construcción (AB-I1 a AB-I3 probadas; el paso 8 y la otra PC, T-87, al cerrar DI-I3, D-162) | en pausa |
| Paridad (`modulos/paridad/estado.md`) | sección | 1. Propuesta (el chat como el de Claude, D-165; espera Q-237 a Q-239) | pendiente |

## En qué estamos ahora
**Frente activo: Diseño** (vuelve por D-162, a tu pedido): las secciones pasaron a las piezas, tanda por tanda; los menús de la barra y del uso quedaron probados (Q-236) y no queda nada del estilo de antes; el detalle del uso, sin el arranque ni la nota (R-99, R-100, D-164). Falta lo que no son piezas (T-58, T-90, T-53) y cerrar DI-I3.
**Frente nuevo: Paridad** (D-165, T-96): el chat con «/», adjuntos, fotos pegadas y el texto largo como archivo, escrito contra la frontera del motor para que más adelante entre otro agente. Cuándo y qué entra, Q-237 a Q-239.
**Arranque** (D-135) anduvo la segunda noche (Q-227); su paso 8 va al cerrar DI-I3, junto con el de **Abrir** (T-87, D-160). Después de Diseño, Orden mide la calidad y sigue Plantillas (D-151, D-150).
Ideas sin evaluar: T-76, T-78, T-89, T-93 (cómo lo usa alguien sin nociones técnicas; va con Plantillas, T-81), T-94 (pantallas a medida para partes de un hito) y T-95 (plugins por proyecto). Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-237 — ¿Cuándo empieza el frente Paridad (el chat como el de Claude)?**
  Tipo: decisión · Frente: Paridad
  Contexto: `modulos/paridad/propuesta.md`. Diseño está por cerrar DI-I3; después venían el paso 8 de Orden, el de Abrir y Plantillas (D-151, D-162).
  Opciones: A) Al cerrar DI-I3, antes que Orden, Abrir y Plantillas (recomendada: es lo que más usás todos los días y el compositor ya quedó con las piezas) · B) Ahora, con Diseño en pausa · C) Después de Orden y Plantillas, en la fila
- **Q-238 — ¿Qué entra del chat de Claude, además de lo que pediste?**
  Tipo: decisión · Frente: Paridad
  Contexto: pediste comandos con «/», adjuntar con el +, pegar fotos y el texto largo como archivo (`modulos/paridad/propuesta.md` › Qué problema resuelve). Claude tiene además mencionar un archivo con «@» (VS Code) y dictar con el micrófono.
  Opciones: A) Solo esos cuatro; lo demás, como ideas (recomendada: el frente queda chico y sale antes) · B) Los cuatro y mencionar archivos con «@» · C) Los cuatro, «@» y dictar con el micrófono
- **Q-239 — Capacidades (plugins, usar la PC, el navegador): ¿junto con Paridad o aparte?**
  Tipo: decisión · Frente: Paridad
  Contexto: Capacidades (T-28) es otro frente en espera desde D-102: lo que pueden hacer las sesiones, no el chat.
  Opciones: A) Aparte, como está (recomendada: Paridad queda chica y se prueba por partes) · B) Dentro de Paridad, como su segunda parte
Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Diseño, DI-I3: lo que queda además de las piezas (T-58, T-90, T-53) y cerrar la iteración; si llegaron Q-237 a Q-239, procesarlas y ubicar Paridad en la fila.
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso y lo que pide.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
