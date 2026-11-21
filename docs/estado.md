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
| Paridad (`modulos/paridad/estado.md`) | sección | 7. Construcción (UI hecha, D-170; sigue PA-I1) | en curso |

## En qué estamos ahora
**Diseño cerró DI-I3** (2026-11-21): las diecinueve tandas probadas y `DESIGN.md` y `06-ui.md` escritos desde lo construido. Q-240 pidió además que archivar no deje aviso y que el estado cambie en la tarjeta al instante: hecho y probado (Q-241, Q-242). Queda en pausa con DI-I4, el paso 8 y la extensión de la Revisión al negro (T-99).
**Ronda de UX 1 hecha** (2026-11-21, T-100) **y su tanda también**: el chat sin conversación ya no muestra un título cortado (T-101), Git con siluetas al leer (T-103), Acerca de con una frase (T-104), Este proyecto en palabras del usuario (T-106), `04-ux.md` al día con la app (T-107), la Bandeja vacía en su columna (T-108) y los avisos de la esquina medidos juntos (T-110), que encontró los botones de un aviso desarmados: arreglado. Tu prueba, Q-248 (la tanda de la ronda). Los `nueva` (T-102, T-105, T-109), en Ideas para aprobar.
**Ahora: Paridad** (D-165, D-166): definición aprobada (Q-244, D-167). La UX está aprobada (Q-247, D-168) y el diseño técnico, cerrado (D-169): tres iteraciones, PA-I1 (comandos), PA-I2 (archivos y fotos) y PA-I3 (texto pegado). La UI también (D-170): la Ficha (PZ-16) y el menú arriba del compositor entran al design system. Sigue PA-I1. Después de Paridad, Orden mide la calidad, **Abrir** hace su paso 8 y la otra PC (T-87) y sigue Plantillas (D-166).
Ideas sin evaluar: T-76, T-78, T-89, T-97 («@» en el chat), T-93 (cómo lo usa alguien sin nociones técnicas; va con Plantillas, T-81), T-94 (pantallas a medida para partes de un hito), T-95 (plugins por proyecto) y T-99 (la extensión de la Revisión, al negro). Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-248 — Probá la tanda de la ronda de UX**
  Tipo: prueba · Frente: Orden
  Contexto: `10-operacion.md` › Rondas de UX; los cambios, en `trabajo.md` › T-101 a T-110. Con la app armada (`scripts.md` › Armar la última versión) o en modo desarrollo:
  - [ ] En un proyecto sin conversación, la cabecera del chat no muestra un título cortado: solo el historial, Nueva y Continuar
  - [ ] Git de este proyecto muestra líneas grises con la forma del panel mientras lee, no un hueco
  - [ ] Ajustes › Acerca de muestra la fecha y una frase del commit; el mensaje entero aparece al pasar el mouse
  - [ ] En un proyecto sin la marca de armar, Ajustes › Este proyecto explica para qué sirve y que su IA lo prepara
  - [ ] La Bandeja de un proyecto sin preguntas dice «Nada en tu bandeja» en la columna del medio, no pegado a la izquierda
  - [ ] El aviso de un proyecto que terminó en otra pestaña tiene Abrir y Responder en una fila, a la derecha

## Próximo paso
Construir PA-I1, los comandos con «/» (Paridad).
**Leer antes:** `modulos/paridad/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
