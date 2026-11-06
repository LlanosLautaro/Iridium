# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Mantenerlo corto y al día.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-06
**Nivel de protección:** P2 — personal conectado (ver `perfil-proyecto.md`)

## Hito actual
10 — Operación — en curso: frente Orden con prioridad máxima (D-091), en la definición

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | completo | `00-idea.md` |
| 1 | Exploración | completo | `01-exploracion.md` |
| 2 | Definición y alcance | completo | `02-definicion.md` |
| 3 | Investigación de dominio | completo | `03-investigacion.md` |
| 4 | UX | completo | `04-ux.md` |
| 5 | Arquitectura técnica | completo | `05-arquitectura.md` |
| 6 | UI | completo | `06-ui.md` |
| 7 | Construcción | completo | `07-construccion.md` |
| 8 | Pruebas y calidad | completo (portón aprobado en Q-108, 2026-11-02) | `08-calidad.md` |
| 9 | Lanzamiento | completo (portón aprobado en Q-111, 2026-11-02) | `09-lanzamiento.md` |
| 10 | Operación | en curso | `10-operacion.md` |

Estados posibles: pendiente · en curso · completo · saltado (con motivo) · reabierto.

## Módulos
| Módulo | Tipo | Paso actual | Estado |
|---|---|---|---|
| Revisión de la app (`modulos/revision/estado.md`) | producto hermano | en operación (con el hito 10) | completo |
| Skills (`modulos/skills/estado.md`) | sección | en operación (con el hito 10) | completo |
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10) | completo |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | completo |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | completo |
| **Orden** (`modulos/orden/estado.md`), activo | sección | 2. Definición (escrita; esperan Q-133 a Q-135) | en curso |

En espera, detrás de Orden (D-091): Diseño y Capacidades (`02-definicion.md` › Módulos previstos).

## En qué estamos ahora
Hito 10, Operación, con el frente **Orden** primero (D-091): la UX se degradó y la forma de trabajo tiene huecos; no se suman funciones nuevas y Diseño y Capacidades esperan. La guía de hitos y la skill de Iridium se funden en un solo marco con un control (D-092), solo dentro de Iridium (D-093). Hechas la auditoría (A-1 a A-23, `modulos/orden/auditoria.md`) y la definición (`modulos/orden/definicion.md`): cada cosa que se sigue con un lugar, código, frente y estado; un vocabulario de estados; el marco y su control. Esperan tus decisiones Q-133 a Q-135. Compartir está publicado (`c012989`); falta la invitación (Q-126).

## Pendientes del hito actual
- [ ] Respaldo de `.iridium` en GitHub con un botón en Ajustes (D-087; hoy se hace con Abrir como proyecto › Git › Publicar en GitHub). En el Backlog.
- [ ] D-082: sacar de `src/main/core/carpeta-iridium.ts` el nombre viejo de tu carpeta de skills (Q-127 ya dio bien la mudanza).
- [ ] La skill `iridium` (`recursos/plugins/iridium`) se cambia junto con lo que Iridium lee (D-086). La guía de `Iridium para compartir` puesta al día con D-085 a D-087 el 2026-11-04.
- [ ] Frente Orden: procesar Q-133 a Q-135 y seguir con la UX (`modulos/orden/estado.md` › Pendientes).
- [ ] Lo pendiente de la guía y `gestor-proyectos` (D-062, D-063, D-068, Defectos 13 y 14, Q-115) pasa al marco único (D-092); las dos se eliminan cuando funcione, en el chat de Skills.
- [ ] Traer a la carpeta Skills las skills que la licencia permite y sacar las copias dobles (D-014): va en el chat de Skills.
- [ ] Después de Mover (Q-127): en el chat de Skills, poner al día las rutas que nombran la carpeta vieja; en el chat general, la sección «Dónde están los demás proyectos» del `CLAUDE.md` de Ideas.

## Preguntas abiertas
- **Q-133 — ¿Las ideas y los pendientes de la IA van en una sola lista?**
  Tipo: decisión · frena
  Contexto: `modulos/orden/definicion.md` › El modelo único (A-18, A-19). Hoy las ideas están en hasta ocho lugares y los pendientes en cinco, repetidos. Una idea aceptada ya es un pendiente: en una sola lista (`docs/trabajo.md`, código `T-n`) cambia solo su estado (nueva → pendiente → en curso → hecho, o descartado) y nada se copia de un lado a otro. Separadas, cada una es más corta, pero pasar una idea a pendiente es moverla de archivo.
  Opciones: A) Una sola lista, «Trabajo» (recomendada) · B) Dos listas: ideas y pendientes
- **Q-134 — ¿Qué carpetas de la grilla siguen el marco?**
  Tipo: decisión
  Contexto: `modulos/orden/auditoria.md` › A-23. De las catorce carpetas, ocho no siguen la guía (scripts sueltos, carpetas personales). Tus instrucciones globales dicen que todo proyecto la sigue, y no se cumple. Con C, Iridium las muestra como carpetas simples (tarjeta, Git, Scripts, sin Mapa ni Pendientes) y un botón las suma cuando quieras.
  Opciones: A) Todas: las que no lo siguen se pasan al marco · B) Solo las que ya tienen `docs/estado.md` · C) Las que tienen `docs/estado.md`, y las demás se suman con un botón cuando quieras (recomendada)
- **Q-135 — ¿Cada cuánto se hace la ronda de UX?**
  Tipo: decisión
  Contexto: `modulos/orden/definicion.md` › El marco único (D-091). La ronda revisa toda la interfaz con capturas para que no vuelva a crecer a parches; gasta una sesión. Con B se hace cuando algo cambió de verdad y no por calendario.
  Opciones: A) Cada dos semanas en operación · B) Al terminar cada frente y cada cinco comentarios de la Revisión juntados (recomendada) · C) Solo cuando la pidas
- **Q-126 — Invitá a la otra persona al repo de Iridium**
  Tipo: tarea · frena
  Contexto: D-085 y Q-123 (A). Sin la invitación, su Iridium no ve las versiones nuevas (le aparece «Sin acceso a las versiones nuevas»). Si preferís, pasame su usuario de GitHub en la respuesta y la invito yo.
  - [ ] Le pasé la carpeta `Iridium para compartir` del escritorio (o el `.zip` de la última versión en GitHub)
  - [ ] En `github.com/LlanosLautaro/Iridium` › Settings › Collaborators › Add people, la invité con su usuario
  - [ ] Aceptó la invitación y en su Iridium tocó **Iniciar sesión** abajo; el aviso desapareció
- **Q-130 — Probá Eliminar desde el clic derecho**
  Tipo: prueba
  Contexto: D-090 (R-10). Armá la última versión (**Armar** abajo en Iridium) y abrila. Usá un proyecto de prueba (con **Nuevo proyecto**, por ejemplo). Fijate:
  - [ ] Clic derecho en su tarjeta › **Eliminar…** abre la confirmación con cuántos archivos van a la papelera
  - [ ] **Cancelar** (o Esc) no toca nada
  - [ ] **Eliminar** saca la tarjeta y el aviso dice que está en la papelera
  - [ ] La carpeta está en la papelera de Windows y **Restaurar** la devuelve a la grilla
- **Q-118 — Probá crear y publicar un repositorio con tu GitHub**
  Tipo: prueba
  Contexto: D-081 (Q-117). Armá la última versión (**Armar** abajo en Iridium) y abrila. Usá una carpeta de prueba (con **Abrir como proyecto**) o un proyecto que quieras subir. Fijate:
  - [ ] Sin git, **Inicializar repositorio** hace el primer commit sin `node_modules` ni `.env`
  - [ ] **Publicar en GitHub** muestra tu cuenta (o abre la ventana de git para iniciar sesión)
  - [ ] Privado y Publicar: aparece «En GitHub · tu-usuario/nombre», y el repositorio está en GitHub como privado

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Orden: procesar Q-133 a Q-135 en `modulos/orden/definicion.md` y pasar al paso 4, reescribir `04-ux.md` sin capas sobre ese modelo.
**Leer antes:** `respuestas/` (Q-133 a Q-135, y Q-126, Q-130, Q-118 si llegaron), `modulos/orden/estado.md`, `modulos/orden/definicion.md`, `modulos/orden/auditoria.md` › Parte 1, `04-ux.md`.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
