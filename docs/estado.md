# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Mantenerlo corto y al día.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-05
**Nivel de protección:** P2 — personal conectado (ver `perfil-proyecto.md`)

## Hito actual
10 — Operación — en curso: compartir Iridium, hecho y publicado; falta que invites a la otra persona (Q-126)

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

En espera, en este orden (D-079): Diseño y Capacidades (`02-definicion.md` › Módulos previstos).

## En qué estamos ahora
Hito 10, Operación. Compartir Iridium está hecho: el repo nuevo (D-084), las versiones que la copia compartida baja sola (D-085) y, con tus respuestas, el aviso para iniciar sesión en GitHub (Q-123), la skill de Iridium que se carga solo en sus conversaciones junto con la guía de hitos (D-086, Q-124) e Ideas y Skills en `.iridium` dentro de la carpeta de proyectos (D-087, Q-125). Publicada `c012989` y probada de punta a punta con GitHub; la carpeta `Iridium para compartir` del escritorio trae esa versión y su LEEME explica la invitación. Las tres pruebas de `r3-electron` volvieron a fallar juntas en la tanda completa y pasaron solas (Defecto 1, con una pista nueva). Q-127 dio todo bien: Ideas y Skills ya están en `.iridium`. Con R-9, los comentarios de la Revisión que quedan para después ahora son «anotados», no cerrados (D-088). A tu pedido se hicieron los dos anotados (D-089): R-7, el clic derecho de la tarjeta y **Nuevo proyecto**; R-8, **Ideas del proyecto** y **Skills del proyecto** en la barra del proyecto. Los dos quedaron cerrados; falta tu prueba (Q-129).

## Pendientes del hito actual
- [ ] Respaldo de `.iridium` en GitHub con un botón en Ajustes (D-087; hoy se hace con Abrir como proyecto › Git › Publicar en GitHub). En el Backlog.
- [ ] D-082: sacar de `src/main/core/carpeta-iridium.ts` el nombre viejo de tu carpeta de skills (Q-127 ya dio bien la mudanza).
- [ ] La skill `iridium` (`recursos/plugins/iridium`) se cambia junto con lo que Iridium lee (D-086). La guía de `Iridium para compartir` puesta al día con D-085 a D-087 el 2026-11-04.
- [ ] Poner al día la skill `gestor-proyectos` y la guía `hitos-desarrollo-app` (D-062, D-063, D-068, Defectos 13 y 14 del hito 8; y que las pruebas vayan solo con casillas, Q-115). Va en el chat de Skills.
- [ ] Traer a la carpeta Skills las skills que la licencia permite y sacar las copias dobles (D-014): va en el chat de Skills.
- [ ] Después de Mover (Q-127): en el chat de Skills, poner al día las rutas que nombran la carpeta vieja; en el chat general, la sección «Dónde están los demás proyectos» del `CLAUDE.md` de Ideas.

## Preguntas abiertas
- **Q-126 — Invitá a la otra persona al repo de Iridium**
  Tipo: tarea · frena
  Contexto: D-085 y Q-123 (A). Sin la invitación, su Iridium no ve las versiones nuevas (le aparece «Sin acceso a las versiones nuevas»). Si preferís, pasame su usuario de GitHub en la respuesta y la invito yo.
  - [ ] Le pasé la carpeta `Iridium para compartir` del escritorio (o el `.zip` de la última versión en GitHub)
  - [ ] En `github.com/LlanosLautaro/Iridium` › Settings › Collaborators › Add people, la invité con su usuario
  - [ ] Aceptó la invitación y en su Iridium tocó **Iniciar sesión** abajo; el aviso desapareció
- **Q-129 — Probá el clic derecho, Nuevo proyecto y las ideas y skills del proyecto**
  Tipo: prueba
  Contexto: D-089 (R-7, R-8); reemplaza a Q-128, porque R-7 y R-8 ya no están anotados. Armá la última versión (**Armar** abajo en Iridium) y abrila. Fijate:
  - [ ] Clic derecho en una tarjeta: el menú con Abrir, Abrir en VS Code, Abrir la carpeta, el estado, Archivar y Cambiar ícono…
  - [ ] **Abrir en VS Code** abre el proyecto en VS Code y **Abrir la carpeta**, el explorador
  - [ ] Cambiar el estado mueve la tarjeta a su grupo; **Archivar** la saca y **Deshacer** la devuelve
  - [ ] **Nuevo proyecto** (arriba de la grilla) con un nombre de prueba: se abre el proyecto y la IA arranca con la guía, la ficha y el ícono (después borrá la carpeta, si querés)
  - [ ] Dentro de un proyecto, el ícono de la lamparita (**Ideas del proyecto**) muestra sus ideas
  - [ ] **Skills del proyecto** sale solo en un proyecto con `.claude/skills/`
  - [ ] En Revisión, R-7, R-8 y R-9 están en Cerrados, y R-7 y R-8 dicen en su historia que antes quedaron anotados
- **Q-118 — Probá crear y publicar un repositorio con tu GitHub**
  Tipo: prueba
  Contexto: D-081 (Q-117). Armá la última versión (**Armar** abajo en Iridium) y abrila. Usá una carpeta de prueba (con **Abrir como proyecto**) o un proyecto que quieras subir. Fijate:
  - [ ] Sin git, **Inicializar repositorio** hace el primer commit sin `node_modules` ni `.env`
  - [ ] **Publicar en GitHub** muestra tu cuenta (o abre la ventana de git para iniciar sesión)
  - [ ] Privado y Publicar: aparece «En GitHub · tu-usuario/nombre», y el repositorio está en GitHub como privado

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Procesar Q-129 si llegó (lo que falle se arregla con la pista corta). Después, sacar del código el nombre viejo de la carpeta de skills (D-082, `carpeta-iridium.ts`), y con Q-126, si me pasaste el usuario, invitarlo y confirmar que su copia ve las versiones. Después, el próximo frente (Diseño, D-079).
**Leer antes:** `docs/respuestas/` (Q-126, Q-129, Q-118) y D-085 a D-089 en `decisiones.md`.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
