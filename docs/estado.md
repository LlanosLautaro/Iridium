# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-17
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
| Ideas (`modulos/ideas/estado.md`) | sección | 7. Construcción (ID-I1 e ID-I2 probadas; ID-I3 probada con dos ajustes, que esperan Q-190; sigue ID-I4) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 espera el rediseño, D-102) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (T-71) | sección | 1. Propuesta (el Mapa como una red de pasos por frente; pensarlo en el chat; orden con Capacidades a decidir) | pendiente |

## En qué estamos ahora
**Frente activo: Ideas** (D-127, T-69): la forma C (D-128), aprobar es pasar al trabajo (D-129), la UX aprobada (Q-180) y el diseño técnico cerrado (D-130): cada idea es un `T-n` de `trabajo.md` con el campo `Idea:` y la nota del usuario aparte. La construcción va en cuatro iteraciones: ID-I1 (Ideas en un proyecto) e ID-I2 (Revisar con la IA y Hablar de esta idea, que citan en la conversación, D-131) están hechas y probadas (Q-181, Q-183; tras Q-183, el ícono de compartir y sin el `T-n` a la vista). ID-I3 (la nota de una idea con enlaces e imágenes pegados, y Borrar) se probó en Q-189: Ctrl+V con una imagen no andaba (ahora, si la ventana no la ve, Iridium la busca en el portapapeles de Windows y, si no hay, dice qué trae) y la confirmación de Borrar pasó al cuadro del centro; esperan Q-190. Sigue ID-I4 (las ideas sueltas del inicio, que reemplazan al bloc). La miniatura del sitio al pegar un enlace queda como T-76.
Diseño (DI-I3) queda en pausa mientras tanto: las tandas 1 a 7 están probadas y la tanda 8 (el bloc de notas del inicio) no se prueba: el usuario la dio por descontinuada (Q-174) y la reemplaza Ideas. El Mapa se rehará como frente propio (T-71). Detalle en `modulos/diseno/estado.md`.
Orden terminó su construcción (OR-I4 probada en Q-146) y su paso 8 espera el rediseño. Compartir: el repo es público (D-132): la otra persona baja el `.zip` de la última versión y se actualiza sola, sin invitación; tu copia sigue armándose en tu PC. Falta publicar una versión al día (Q-185). Ver la IA de la otra persona desde acá queda como idea (T-74).
R-79 (el texto de las tarjetas que se salía) quedó probado en Q-189. Actualizar al framework abre siempre una conversación nueva (D-133) y Ejecutar volvió al verde (R-78): probados (Q-186). El tema propio (T-75) se hará solo con tokens, editado con la IA desde Ajustes (D-134), después de Ideas. El arranque del período de 5 horas (T-70) se hará con trabajo real de una bandeja lista, desde la misma Iridium abierta, a las 3 y al vencer cada ventana (D-135, Q-188), después de Ideas. Ordenar la grilla de Proyectos por el último cambio (R-80) quedó en T-77 y espera Q-191.
Chat nuevo por tamaño y tiempo, y arranque liviano (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`, que ya guardó la línea de base.

## Preguntas abiertas
- **Q-185 — Publicá una versión al día y pasale el .zip a la otra persona**
  Tipo: tarea · Frente: Compartir
  Contexto: D-132. El repo ya es público: no hace falta invitarla. La última versión publicada es del 4 de noviembre; las que publiques desde ahora le llegan solas (las mira al abrir y cada seis horas, y entran al cerrar Iridium). Tu Iridium no se actualiza desde GitHub.
  - [ ] Con lo que querés compartir ya en tu Iridium (Armar), en Scripts toqué **Publicar la versión para compartir** y terminó sin error
  - [ ] Le pasé el enlace `github.com/LlanosLautaro/Iridium/releases/latest`: bajó el `.zip`, lo descomprimió y abrió `Iridium\win-unpacked\Iridium.exe`
  - [ ] Abajo no le apareció ningún aviso de GitHub (ni «iniciá sesión» ni «sin acceso»)

- **Q-190 — Probá pegar una imagen con Ctrl+V y Borrar en el cuadro del centro**
  Tipo: prueba · Frente: Ideas
  Contexto: los dos ajustes de Q-189 (`modulos/ideas/estado.md` › ID-I3). La versión entra sola cuando dejás Iridium unos 3 minutos sin usar (o tocá **Actualizar** abajo). Es en Ideas de un proyecto con el framework.
  - [ ] Copié una captura (Win+Shift+S) y la pegué con Ctrl+V en una idea abierta: quedó en su renglón
  - [ ] Hice lo mismo con lo que copié la vez anterior (si fue otra cosa, anotá de dónde): quedó la imagen o, si no, el aviso de arriba dice qué trae lo copiado (copiá ese texto acá)
  - [ ] Borrar, abajo en la idea abierta y con clic derecho en un enlace: la pregunta apareció en el centro de la pantalla; No (o Esc) la dejó y «Sí, borrar» la sacó

- **Q-191 — ¿Cómo ordeno la grilla de Proyectos por el último cambio (R-80)?**
  Tipo: decisión · Frente: Inicio
  Contexto: T-77. Hoy van por estado (en desarrollo, en uso, idea, pausado…) y, dentro de cada uno, por nombre (D-022). El último cambio sería el último commit del proyecto o, sin git, lo último escrito en su `docs/`. Los archivados siguen al final.
  Opciones: A) Todos por el último cambio, sin agrupar por estado: el estado sigue en cada tarjeta (recomendada: lo que estás tocando queda siempre arriba, que es lo que pediste) · B) Por estado como hoy, y dentro de cada estado por el último cambio (lo pausado nunca sube, pero un proyecto en uso que tocás queda debajo de todos los en desarrollo) · C) Un selector arriba de la grilla: «Por estado» o «Por último cambio» (las dos, con un control más en la pantalla)

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Ideas, ID-I4: las ideas sueltas del inicio (`sueltas.md`), anotar con un proyecto elegido y Mover a un proyecto; se saca el bloc. Si llegan Q-190 o Q-191, se procesan primero (Q-191 es una decisión: va a `decisiones.md`, T-77 a `pendiente`, y R-80 se cierra cuando T-77 esté hecho).
**Leer antes:** `modulos/ideas/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
