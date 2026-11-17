# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-16
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
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10); repo público (D-132), falta publicar una versión al día (Q-185) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3: tandas 1 a 7 probadas; la tanda 8, el bloc de Ideas, sin probar: lo reemplaza el frente Ideas, D-128, Q-174) | en pausa |
| Ideas (`modulos/ideas/estado.md`) | sección | 7. Construcción (ID-I1 e ID-I2 probadas, Q-181 y Q-183; sigue ID-I3) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 espera el rediseño, D-102) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (T-71) | sección | 1. Propuesta (el Mapa como una red de pasos por frente; pensarlo en el chat; orden con Capacidades a decidir) | pendiente |

## En qué estamos ahora
**Frente activo: Ideas** (D-127, T-69): la forma C (D-128), aprobar es pasar al trabajo (D-129), la UX aprobada (Q-180) y el diseño técnico cerrado (D-130): cada idea es un `T-n` de `trabajo.md` con el campo `Idea:` y la nota del usuario aparte. La construcción va en cuatro iteraciones: ID-I1 (Ideas en un proyecto) e ID-I2 (Revisar con la IA y Hablar de esta idea, que citan en la conversación, D-131) están hechas y probadas (Q-181, Q-183; tras Q-183, el ícono de compartir y sin el `T-n` a la vista); sigue ID-I3 (la nota completa: pegar enlaces e imágenes, borrar). El bloc de notas sigue en la app hasta ID-I4.
Diseño (DI-I3) queda en pausa mientras tanto: las tandas 1 a 7 están probadas y la tanda 8 (el bloc de notas del inicio) no se prueba: el usuario la dio por descontinuada (Q-174) y la reemplaza Ideas. El Mapa se rehará como frente propio (T-71). Detalle en `modulos/diseno/estado.md`.
Orden terminó su construcción (OR-I4 probada en Q-146) y su paso 8 espera el rediseño. Compartir: el repo es público (D-132): la otra persona baja el `.zip` de la última versión y se actualiza sola, sin invitación; tu copia sigue armándose en tu PC. Falta publicar una versión al día (Q-185). Ver la IA de la otra persona desde acá queda como idea (T-74).
Actualizar al framework abre siempre una conversación nueva (D-133) y Ejecutar volvió al verde (R-78): probados (Q-186). El tema propio (T-75) se hará solo con tokens, editado con la IA desde Ajustes (D-134), después de Ideas. El arranque del período de 5 horas (T-70) cambió con tu propuesta: arrancarlo con trabajo real de una bandeja lista; se decide en Q-188.
Chat nuevo por tamaño y tiempo, y arranque liviano (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`, que ya guardó la línea de base.

## Preguntas abiertas
- **Q-185 — Publicá una versión al día y pasale el .zip a la otra persona**
  Tipo: tarea · Frente: Compartir
  Contexto: D-132. El repo ya es público: no hace falta invitarla. La última versión publicada es del 4 de noviembre; las que publiques desde ahora le llegan solas (las mira al abrir y cada seis horas, y entran al cerrar Iridium). Tu Iridium no se actualiza desde GitHub.
  - [ ] Con lo que querés compartir ya en tu Iridium (Armar), en Scripts toqué **Publicar la versión para compartir** y terminó sin error
  - [ ] Le pasé el enlace `github.com/LlanosLautaro/Iridium/releases/latest`: bajó el `.zip`, lo descomprimió y abrió `Iridiumwin-unpackedIridium.exe`
  - [ ] Abajo no le apareció ningún aviso de GitHub (ni «iniciá sesión» ni «sin acceso»)

- **Q-188 — ¿Va así el arranque del período con trabajo real (T-70)?**
  Tipo: decisión
  Contexto: tu propuesta de Q-184, revisada en `trabajo.md` › T-70. Me parece mejor que el mensaje vacío: es uso normal de Iridium, no un truco, y si no hay nada listo no gasta nada. Iridium ya sabe cuándo vence la ventana (la barra de uso). Arranca «Continúa con el proyecto» en una conversación nueva de un solo proyecto con respuestas sin procesar (el que espera hace más), si no hay una sesión trabajando ahí, y la Bandeja dice qué arrancó. Se prende y apaga en Ajustes.
  Opciones: A) Con Iridium abierta: a eso de las 3 (si la PC está prendida) y unos 5 minutos después de que venza cada ventana (recomendada: lo corre la misma Iridium que ves al volver, sin tareas de Windows) · B) Igual que A, y además una tarea de Windows abre Iridium a las 3 si estaba cerrada (anda aunque la cierres, pero la app se abre sola de noche) · C) Solo a las 3, no después de cada ventana (más prudente con el límite semanal)

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Ideas, ID-I3: la nota completa en la idea abierta (pegar una dirección la vuelve una etiqueta, pegar una imagen la guarda con la idea) y Borrar (ID-8). Si llega Q-188, se procesa primero (es una decisión: va a `decisiones.md` y T-70 a `pendiente` u otro estado).
**Leer antes:** `modulos/ideas/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
