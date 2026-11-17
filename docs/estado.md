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
| Ideas (`modulos/ideas/estado.md`) | sección | 7. Construcción (ID-I1 a ID-I3 probadas; ID-I4 hecha, espera Q-196) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 espera el rediseño, D-102) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (T-71) | sección | 1. Propuesta cerrada (un camino de pasos concretos por frente, D-138; la ruta, en el estado de cada frente, D-139); se construye después de Ideas | pendiente |

## En qué estamos ahora
**Frente activo: Ideas** (D-127, T-69): la forma C (D-128), aprobar es pasar al trabajo (D-129), la UX aprobada (Q-180) y el diseño técnico cerrado (D-130): cada idea es un `T-n` de `trabajo.md` con el campo `Idea:` y la nota del usuario aparte. La construcción va en cuatro iteraciones: ID-I1 (Ideas en un proyecto) e ID-I2 (Revisar con la IA y Hablar de esta idea, que citan en la conversación, D-131) están hechas y probadas (Q-181, Q-183; tras Q-183, el ícono de compartir y sin el `T-n` a la vista). ID-I3 (la nota de una idea con enlaces e imágenes pegados, y Borrar) está probada (Q-189, Q-190). ID-I4 está hecha: Ideas del inicio es la misma lista, con las ideas sueltas en `sueltas.md` de la carpeta Ideas, el selector para anotar directo en un proyecto y Mover a un proyecto; el bloc se sacó (su `notas.md` estaba vacío). Espera su prueba (Q-196). Qué frente sigue después de Ideas, en Q-197. La miniatura del sitio al pegar un enlace queda como T-76.
Diseño (DI-I3) queda en pausa mientras tanto: las tandas 1 a 7 están probadas y la tanda 8 (el bloc de notas del inicio) no se prueba: el usuario la dio por descontinuada (Q-174) y la reemplaza Ideas. El Mapa se rehará como frente propio (T-71). Detalle en `modulos/diseno/estado.md`.
Orden terminó su construcción (OR-I4 probada en Q-146) y su paso 8 espera el rediseño. Compartir: el repo es público (D-132): la otra persona baja el `.zip` de la última versión y se actualiza sola, sin invitación; tu copia sigue armándose en tu PC. Falta publicar una versión al día (Q-185). Ver la IA de la otra persona desde acá queda como idea (T-74).
R-79 (el texto de las tarjetas que se salía) quedó probado en Q-189. Actualizar al framework abre siempre una conversación nueva (D-133) y Ejecutar volvió al verde (R-78): probados (Q-186). El tema propio (T-75) se hará solo con tokens, editado con la IA desde Ajustes (D-134), después de Ideas. El arranque del período de 5 horas (T-70) se hará con trabajo real de una bandeja lista, desde la misma Iridium abierta, a las 3 y al vencer cada ventana (D-135, Q-188), después de Ideas. La grilla de Proyectos va toda por el último cambio (D-136, Q-191, T-77) y la tarjeta marca cuando todo está respondido o la bandeja está vacía (R-81) y ya no muestra el hito ni el Próximo paso (R-83, R-84); el título de la Bandeja ya no se recuadra al abrir (R-82): probados en Q-192. El Mapa (T-71) es un camino de pasos concretos por frente, uno a la vez desde una barra arriba (D-138, maqueta `diseno/pantallas/mapa-b.html`); la ruta de cada frente es una lista «Ruta» en su `estado.md` que la IA pone al día al cerrar cada iteración (D-139, Q-195): el formato entra al framework con su lector y su control al construir el Mapa, después de Ideas. La estrella de «recomendada» va en amarillo (R-85) y «Otro» ya no pisa su campo (R-86).
Chat nuevo por tamaño y tiempo, y arranque liviano (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`, que ya guardó la línea de base.

## Preguntas abiertas
- **Q-185 — Publicá una versión al día y pasale el .zip a la otra persona**
  Tipo: tarea · Frente: Compartir
  Contexto: D-132. El repo ya es público: no hace falta invitarla. La última versión publicada es del 4 de noviembre; las que publiques desde ahora le llegan solas (las mira al abrir y cada seis horas, y entran al cerrar Iridium). Tu Iridium no se actualiza desde GitHub.
  - [ ] Con lo que querés compartir ya en tu Iridium (Armar), en Scripts toqué **Publicar la versión para compartir** y terminó sin error
  - [ ] Le pasé el enlace `github.com/LlanosLautaro/Iridium/releases/latest`: bajó el `.zip`, lo descomprimió y abrió `Iridium\win-unpacked\Iridium.exe`
  - [ ] Abajo no le apareció ningún aviso de GitHub (ni «iniciá sesión» ni «sin acceso»)

- **Q-196 — Probá Ideas del inicio: anotar, anotar en un proyecto y Mover**
  Tipo: prueba · Frente: Ideas
  Contexto: ID-I4. Primero Armar, para tenerla en tu Iridium. Ideas del inicio (Ctrl+3) ya no es el bloc: es la misma lista que la de un proyecto, con las ideas que no tienen proyecto (`sueltas.md` de la carpeta Ideas). Tu `notas.md` estaba vacío: no se perdió nada.
  - [ ] Escribí una idea en el campo de arriba con «Sin proyecto» y Enter: quedó primera en la lista
  - [ ] Elegí un proyecto al lado del campo y anoté otra: arriba dijo «Anotada en …», y Ver me llevó a las Ideas de ese proyecto, con la idea ahí
  - [ ] Abrí una idea suelta, le pegué una captura con Ctrl+V y después la pasé con «Mover a un proyecto»: dijo «Movida a …» y en ese proyecto está con su nota y la captura
  - [ ] Abrí una idea de un proyecto (desde su barra, Ideas) y le pegué una captura con Ctrl+V: quedó en su renglón (si apareció un aviso, copiá acá lo que dice)

- **Q-197 — ¿Qué frente sigue después de Ideas?**
  Tipo: decisión
  Contexto: los tres quedaron para «después de Ideas». El Mapa (T-71) tiene la propuesta cerrada (D-138, D-139) y la maqueta aprobada; el tema propio (T-75, D-134) es editar los colores con la IA desde Ajustes; el arranque del período de 5 horas (T-70, D-135) hace que Iridium empiece a trabajar sola a las 3 y al vencer cada ventana.
  Opciones: A) El Mapa (recomendada: ataca lo que más te cuesta hoy, perder el foco entre tantas cosas abiertas, y su diseño está fresco) · B) El arranque del período de 5 horas (aprovecha el uso que hoy se pierde de noche) · C) El tema propio

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Si llegan Q-196 o Q-197, procesarlas primero. Si no: Ideas, paso 8 (Calidad): repasar las historias ID-1 a ID-8 contra las pruebas que hay y cubrir lo que falte.
**Leer antes:** `modulos/ideas/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
