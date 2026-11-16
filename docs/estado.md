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
| Ideas (`modulos/ideas/estado.md`) | sección | 7. Construcción (ID-I1 probada en Q-181; ID-I2 rehecha con citas, D-131, espera Q-183; sigue ID-I3) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 espera el rediseño, D-102) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (T-71) | sección | 1. Propuesta (el Mapa como una red de pasos por frente; pensarlo en el chat; orden con Capacidades a decidir) | pendiente |

## En qué estamos ahora
**Frente activo: Ideas** (D-127, T-69): la forma C (D-128), aprobar es pasar al trabajo (D-129), la UX aprobada (Q-180) y el diseño técnico cerrado (D-130): cada idea es un `T-n` de `trabajo.md` con el campo `Idea:` y la nota del usuario aparte. La construcción va en cuatro iteraciones: ID-I1 (Ideas en un proyecto) está hecha y probada (Q-181); ID-I2 (Revisar con la IA y Hablar de esta idea) se rehízo tras Q-182: ahora citan en la conversación, sin enviar (D-131), y espera la prueba del usuario (Q-183); sigue ID-I3 (la nota completa: pegar enlaces e imágenes, borrar). El bloc de notas sigue en la app hasta ID-I4.
Diseño (DI-I3) queda en pausa mientras tanto: las tandas 1 a 7 están probadas y la tanda 8 (el bloc de notas del inicio) no se prueba: el usuario la dio por descontinuada (Q-174) y la reemplaza Ideas. El Mapa se rehará como frente propio (T-71). Detalle en `modulos/diseno/estado.md`.
Orden terminó su construcción (OR-I4 probada en Q-146) y su paso 8 espera el rediseño. Compartir: el repo es público (D-132): la otra persona baja el `.zip` de la última versión y se actualiza sola, sin invitación; tu copia sigue armándose en tu PC. Falta publicar una versión al día (Q-185). Ver la IA de la otra persona desde acá queda como idea (T-74).
Actualizar al framework (antes «Pasar al framework») abre siempre una conversación nueva del proyecto, para no releer la anterior en vano (D-133); espera Q-186 junto con el verde de Ejecutar (R-78).
Chat nuevo por tamaño y tiempo, y arranque liviano (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`, que ya guardó la línea de base.

## Preguntas abiertas
- **Q-183 — Probá las citas de Revisar con la IA y Hablar de esta idea**
  Tipo: prueba · Frente: Ideas
  Contexto: lo que pediste en Q-182 (D-131). La versión entra sola cuando dejás Iridium unos 3 minutos sin usar (o tocá **Actualizar** abajo). Es en Ideas de un proyecto con el framework; detalle en `modulos/ideas/estado.md` › ID-I2.
  - [ ] En un enlace de «Enlaces», la flecha de enviar del renglón (al pasar el mouse): arriba del campo de la conversación apareció «Revisar T-n · nombre» con su ✕, sin enviarse nada, y el cursor quedó en el campo
  - [ ] Escribí lo que me interesa y envié: en la conversación se ve el pedido citado (gris, con la línea a la izquierda) y debajo lo mío; la etiqueta se fue
  - [ ] La IA propuso qué sacar; lo que elegí lo anotó como ideas con el robot y el enlace pasó a Hechas
  - [ ] Abrí una idea y toqué Hablar de esta idea: quedó citada «Idea T-n · título»; con la ✕ se va
  - [ ] En una idea cerrada, la flecha de enviar del renglón la cita igual, sin abrirla
  - [ ] La lista es más ancha que antes (R-74)
  - [ ] Con clic derecho en un renglón también están Revisar con la IA (en los enlaces) y Hablar de esta idea (en las ideas)

- **Q-184 — ¿Hacemos el arranque del período de 5 horas (T-70)?**
  Tipo: decisión
  Contexto: `trabajo.md` › T-70. Se puede: un mensaje mínimo con Claude Code a la hora que elijas abre el período antes de que llegues, sin gastar casi nada. Mueve cuándo se renueva, no da más uso, y no hay permiso escrito de Anthropic (tampoco prohibición; los «cache warmers» son de la API y no aplican).
  Opciones: A) En Iridium, en Ajustes: elegís la hora y Iridium deja la tarea programada en Windows, anda con Iridium cerrada (recomendada: se prende y apaga desde la app y avisa si falló) · B) Solo la tarea de Windows, sin pantalla en Iridium · C) No hacerlo por ahora

- **Q-185 — Publicá una versión al día y pasale el .zip a la otra persona**
  Tipo: tarea · Frente: Compartir
  Contexto: D-132. El repo ya es público: no hace falta invitarla. La última versión publicada es del 4 de noviembre; las que publiques desde ahora le llegan solas (las mira al abrir y cada seis horas, y entran al cerrar Iridium). Tu Iridium no se actualiza desde GitHub.
  - [ ] Con lo que querés compartir ya en tu Iridium (Armar), en Scripts toqué **Publicar la versión para compartir** y terminó sin error
  - [ ] Le pasé el enlace `github.com/LlanosLautaro/Iridium/releases/latest`: bajó el `.zip`, lo descomprimió y abrió `Iridiumwin-unpackedIridium.exe`
  - [ ] Abajo no le apareció ningún aviso de GitHub (ni «iniciá sesión» ni «sin acceso»)

- **Q-186 — Probá Actualizar al framework y el verde de Ejecutar**
  Tipo: prueba · Frente: Orden
  Contexto: D-133 y R-78. La versión entra sola cuando dejás Iridium unos 3 minutos sin usar (o tocá **Actualizar** abajo).
  - [ ] En Scripts de un proyecto, el botón Ejecutar se ve en verde (R-78)
  - [ ] En Skills › Framework, el botón de cada proyecto de afuera dice **Actualizar**; en el menú de la tarjeta, **Actualizar al framework**
  - [ ] Lo toqué en un proyecto que ya tenía una conversación: el pedido salió en una conversación nueva, y la anterior sigue en el historial (el reloj de arriba)

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Ideas, ID-I3: la nota completa en la idea abierta (pegar una dirección la vuelve una etiqueta, pegar una imagen la guarda con la idea) y Borrar (ID-8). ID-I2 está hecha y espera Q-183, y Q-186 espera la prueba de D-133 y R-78: si llegan, se procesan primero.
**Leer antes:** `modulos/ideas/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
