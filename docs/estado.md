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
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10); lo que falta de compartir Iridium (Q-126), en pausa por pedido del usuario | en pausa |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3: tandas 1 a 7 probadas; la tanda 8, el bloc de Ideas, espera Q-174 y se reemplazará por el frente Ideas, D-128) | en pausa |
| Ideas (`modulos/ideas/estado.md`) | sección | 7. Construcción (ID-I1 hecha, espera Q-181; sigue ID-I2) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 espera el rediseño, D-102) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (T-71) | sección | 1. Propuesta (el Mapa como una red de pasos por frente; pensarlo en el chat; orden con Capacidades a decidir) | pendiente |

## En qué estamos ahora
**Frente activo: Ideas** (D-127, T-69): la forma C (D-128), aprobar es pasar al trabajo (D-129), la UX aprobada (Q-180) y el diseño técnico cerrado (D-130): cada idea es un `T-n` de `trabajo.md` con el campo `Idea:` y la nota del usuario aparte. La construcción va en cuatro iteraciones: ID-I1 (Ideas en un proyecto) está hecha, con la pantalla en la barra del proyecto, y espera la prueba del usuario (Q-181); sigue ID-I2 (Revisar con la IA y Hablar de esta idea). El bloc de notas sigue en la app hasta ID-I4.
Diseño (DI-I3) queda en pausa mientras tanto: las tandas 1 a 7 están probadas y la tanda 8 (el bloc de notas del inicio) espera Q-174; el bloc se reemplazará por Ideas. El Mapa se rehará como frente propio (T-71). Detalle en `modulos/diseno/estado.md`.
Orden terminó su construcción (OR-I4 probada en Q-146) y su paso 8 espera el rediseño. Compartir queda en pausa (2026-11-16, a pedido del usuario): lo que falta para compartir Iridium por GitHub, la invitación (Q-126), se retoma cuando lo pida.
Chat nuevo por tamaño y tiempo, y arranque liviano (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`, que ya guardó la línea de base.

## Preguntas abiertas
- **Q-181 — Probá Ideas en un proyecto**
  Tipo: prueba · Frente: Ideas
  Contexto: la versión entra sola cuando dejás Iridium unos 3 minutos sin usar (o tocá **Actualizar** abajo). En un proyecto con el framework, Ideas está en la barra, entre el Mapa y la Revisión. Revisar con la IA y Hablar de esta idea llegan en la próxima iteración; pegar enlaces e imágenes dentro de una idea, después.
  - [ ] Escribí una idea arriba y Enter: quedó primera en «Ideas», sin evaluar, y el campo quedó vacío para otra
  - [ ] Pegué un enlace solo (y debajo, con Shift+Enter, de qué se trata): quedó en «Para revisar» con su nombre y su sitio; el tilde lo pasó a Hechas
  - [ ] Abrí una idea con un clic, le escribí algo debajo del título, la cerré con Esc y al volver a abrirla seguía ahí
  - [ ] Aprobar la puso en verde y Rechazar en rojo; el mismo botón otra vez la volvió a sin evaluar; con clic derecho en el renglón también se puede
  - [ ] Las ideas que anotó la IA tienen el robot y su código, y al abrirlas se lee su texto
  - [ ] Los filtros de arriba muestran cuántas hay y cada uno muestra lo suyo

- **Q-174 — Probá Ideas como bloc de notas**
  Tipo: prueba · Frente: Diseño
  Contexto: la versión entra sola cuando dejás Iridium unos 3 minutos sin usar (o tocá **Actualizar** abajo). Ideas (Ctrl+3) ya no anota en los proyectos: es una hoja libre que se guarda sola en `notas.md` de la carpeta Ideas (D-126). El bloc se reemplazará (D-128), pero pegar enlaces e imágenes vuelve en cada idea: tu prueba sirve igual. Detalle en `modulos/diseno/estado.md` › tanda 8.
  - [ ] En Ideas escribí algo debajo de «Hoy»; al salir y volver, sigue ahí
  - [ ] Pegué una dirección de internet: quedó como una etiqueta con el nombre y el sitio, y un clic la abre en el navegador
  - [ ] Pegué una captura (Win+Shift+S y Ctrl+V): quedó en su renglón y sigue al volver
  - [ ] Copié texto de una página con negritas y lo pegué: quedó como texto común
  - [ ] Mientras la IA trabaja, la pestaña del proyecto dice «Trabajando» en verde (R-71)

- **Q-126 — Invitá a la otra persona al repo de Iridium**
  Tipo: tarea · en pausa · Frente: Compartir
  Contexto: D-085 y Q-123 (A). Sin la invitación, su Iridium no ve las versiones nuevas (le aparece «Sin acceso a las versiones nuevas»). Si preferís, pasame su usuario de GitHub en la respuesta y la invito yo.
  - [ ] Le pasé la carpeta `Iridium para compartir` del escritorio (o el `.zip` de la última versión en GitHub)
  - [ ] En `github.com/LlanosLautaro/Iridium` › Settings › Collaborators › Add people, la invité con su usuario
  - [ ] Aceptó la invitación y en su Iridium tocó **Iniciar sesión** abajo; el aviso desapareció

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Ideas, ID-I2: Revisar con la IA en cada enlace y Hablar de esta idea en la idea abierta (ID-I1 está hecha y espera Q-181). Si llega Q-181 o Q-174, se procesan primero (del bloc solo se arregla lo que rompa el uso).
**Leer antes:** `modulos/ideas/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
