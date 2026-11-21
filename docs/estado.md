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
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3 hecha el 2026-11-21; DI-I4 y el paso 8, más adelante) | en pausa |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va después de Paridad, D-166) | en pausa |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | en operación (con el hito 10; probada en Q-227, calidad el 2026-11-21) | hecho |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Paridad, Orden y Abrir, D-166; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (`modulos/abrir/estado.md`) | sección | 7. Construcción (AB-I1 a AB-I3 probadas; el paso 8 y la otra PC, T-87, después de Paridad y Orden, D-166) | en pausa |
| Paridad (`modulos/paridad/estado.md`) | sección | 4. UX (escrita; espera Q-246 y Q-247) | en curso |

## En qué estamos ahora
**Diseño cerró DI-I3** (2026-11-21): las diecinueve tandas probadas y `DESIGN.md` y `06-ui.md` escritos desde lo construido. Q-240 pidió además que archivar no deje aviso y que el estado cambie en la tarjeta al instante: hecho y probado (Q-241, Q-242). Queda en pausa con DI-I4, el paso 8 y la extensión de la Revisión al negro (T-99).
**Ronda de UX 1 hecha** (2026-11-21, T-100): diez hallazgos, T-101 a T-110, sobre todo de un lugar y un nombre para cada cosa (`10-operacion.md` › Rondas de UX). Arreglado en el momento el aviso falso de carpeta faltante al arrancar; `scripts.md` quedó en ocho (probado en Q-245). Los `pendiente` van en una tanda antes de construir Paridad; los `nueva` (T-102, T-105, T-109), en Ideas para aprobar.
**Ahora: Paridad** (D-165, D-166): definición aprobada (Q-244, D-167). La UX está escrita (`modulos/paridad/ux.md`) con cuatro maquetas en Diseño; espera Q-246 y Q-247. Después de Paridad, Orden mide la calidad, **Abrir** hace su paso 8 y la otra PC (T-87) y sigue Plantillas (D-166).
Ideas sin evaluar: T-76, T-78, T-89, T-97 («@» en el chat), T-93 (cómo lo usa alguien sin nociones técnicas; va con Plantillas, T-81), T-94 (pantallas a medida para partes de un hito), T-95 (plugins por proyecto) y T-99 (la extensión de la Revisión, al negro). Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-246 — ¿Qué pasa si escribo a mano un comando que la lista esconde?**
  Tipo: decisión · frena · Frente: Paridad
  Contexto: `modulos/paridad/ux.md` › Estados y extremos, y la maqueta «Un comando escondido escrito a mano» en Diseño › Paridad (propuesta). La lista de «/» esconde `/model`, `/clear`, `/context`, `/usage` y los de la terminal (D-167), pero se pueden escribir igual. Si se mandan, Claude cambia el modelo o empieza otra conversación por fuera, y la barra de Iridium muestra algo que ya no es cierto.
  Opciones: A) No se manda: una línea dice dónde está eso en Iridium, con su botón si hay («/clear: otra conversación se empieza con Nueva») (recomendada: la barra nunca miente y enseña dónde está cada cosa) · B) Iridium lo hace con lo suyo: «/model sonnet» cambia el modelo de abajo, «/clear» es Nueva (más cómodo si lo escribís de memoria, pero más trabajo y algunos no tienen equivalente) · C) Se manda igual y Claude lo hace (lo más simple; la barra puede quedar mal hasta abrir otra conversación)
- **Q-247 — ¿Apruebo cómo se usan los comandos y los adjuntos en el chat?**
  Tipo: decisión · frena · Frente: Paridad
  Contexto: `modulos/paridad/ux.md` y las cuatro maquetas de Diseño › Paridad (propuesta). «/» abre la lista arriba del cuadro y filtra al escribir; elegir deja el comando escrito y el segundo Enter lo manda. El + va primero en el pie, con «Agregar archivos o fotos» (Ctrl+U) y «Comandos». Los adjuntos son fichas arriba del cuadro (miniatura para las fotos) con ✕; arrastrar y Ctrl+V también suman. Un pegado de más de 40 líneas o 2.000 caracteres queda como «Texto pegado» (Ctrl+Z lo devuelve al cuadro). En los mensajes mandados, las mismas fichas sin ✕, y se abren con un clic.
  Opciones: A) Aprobada como está (recomendada: es lo que ya conocés del chat de Claude, en las piezas de Iridium) · B) Aprobada con cambios (escribilos en Otro)

## Próximo paso
Con Q-246 y Q-247 respondidas: cerrar la UX de Paridad (decisión, `ux.md` y maquetas al día) y escribir su diseño técnico (`modulos/paridad/diseno-tecnico.md`).
**Leer antes:** `respuestas/Q-246.md`, `respuestas/Q-247.md` y `modulos/paridad/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
