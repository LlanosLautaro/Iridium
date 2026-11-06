# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Mantenerlo corto y al día.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-06
**Nivel de protección:** P2 — personal conectado (ver `perfil-proyecto.md`)

## Hito actual
10 — Operación — en curso: frente Orden con prioridad máxima (D-091), en la UX

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
| **Orden** (`modulos/orden/estado.md`), activo | sección | 7. Construcción (OR-I1) | en curso |

En espera, detrás de Orden (D-091): Diseño y Capacidades (`02-definicion.md` › Módulos previstos).

## En qué estamos ahora
Hito 10, Operación, con el frente **Orden** primero (D-091): la UX se degradó y la forma de trabajo tiene huecos; no se suman funciones nuevas y Diseño y Capacidades esperan. La guía de hitos y la skill de Iridium se funden en un solo **framework** con un control (D-092, D-093; el nombre, D-099). Hechas la auditoría, la definición (D-094 a D-096) y la UX: `04-ux.md` está reescrito entero, sin capas, con las pantallas que aprobaste en Q-139. El diseño técnico está escrito (`modulos/orden/diseno-tecnico.md`), con cuatro iteraciones: el modelo y el control, el esqueleto y la Bandeja de entrada (con Actualizar, R-12), Trabajo e Ideas, y el Mapa con Skills › Framework. El paso 6 cerró con Q-140 (D-100: el amarillo solo para lo que frena y el botón principal claro). OR-I1 va por la mitad: el control ya revisa lo que escribe la IA al terminar cada turno y se lo devuelve para que lo corrija. Compartir está publicado (`c012989`); falta la invitación (Q-126).

## Pendientes del hito actual
- [ ] Respaldo de `.iridium` en GitHub con un botón en Ajustes (D-087; hoy se hace con Abrir como proyecto › Git › Publicar en GitHub). En el Backlog.
- [ ] D-082: sacar de `src/main/core/carpeta-iridium.ts` el nombre viejo de tu carpeta de skills (Q-127 ya dio bien la mudanza).
- [ ] La skill `iridium` (`recursos/plugins/iridium`) se cambia junto con lo que Iridium lee (D-086). La guía de `Iridium para compartir` puesta al día con D-085 a D-087 el 2026-11-04.
- [ ] Frente Orden: terminar OR-I1 y después OR-I2 a OR-I4 (`modulos/orden/estado.md` › Pendientes).
- [ ] En el chat de Skills, cuando el control funcione: sacar el hook `comprobar-preguntas.mjs` de la configuración global (D-092.4).
- [ ] En el chat de Skills: la regla global «todo proyecto sigue la guía» pasa a la de D-095.
- [ ] Lo pendiente de la guía y `gestor-proyectos` (D-062, D-063, D-068, Defectos 13 y 14, Q-115) pasa al marco único (D-092); las dos se eliminan cuando funcione, en el chat de Skills.
- [ ] Traer a la carpeta Skills las skills que la licencia permite y sacar las copias dobles (D-014): va en el chat de Skills.
- [ ] Después de Mover (Q-127): en el chat de Skills, poner al día las rutas que nombran la carpeta vieja; en el chat general, la sección «Dónde están los demás proyectos» del `CLAUDE.md` de Ideas.

## Preguntas abiertas
- **Q-126 — Invitá a la otra persona al repo de Iridium**
  Tipo: tarea · frena
  Contexto: D-085 y Q-123 (A). Sin la invitación, su Iridium no ve las versiones nuevas (le aparece «Sin acceso a las versiones nuevas»). Si preferís, pasame su usuario de GitHub en la respuesta y la invito yo.
  - [ ] Le pasé la carpeta `Iridium para compartir` del escritorio (o el `.zip` de la última versión en GitHub)
  - [ ] En `github.com/LlanosLautaro/Iridium` › Settings › Collaborators › Add people, la invité con su usuario
  - [ ] Aceptó la invitación y en su Iridium tocó **Iniciar sesión** abajo; el aviso desapareció
- **Q-118 — Probá crear y publicar un repositorio con tu GitHub**
  Tipo: prueba
  Contexto: D-081 (Q-117). Armá la última versión (**Armar** abajo en Iridium) y abrila. Usá una carpeta de prueba (con **Abrir como proyecto**) o un proyecto que quieras subir. Fijate:
  - [ ] Sin git, **Inicializar repositorio** hace el primer commit sin `node_modules` ni `.env`
  - [ ] **Publicar en GitHub** muestra tu cuenta (o abre la ventana de git para iniciar sesión)
  - [ ] Privado y Publicar: aparece «En GitHub · tu-usuario/nombre», y el repositorio está en GitHub como privado

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Orden, OR-I1: los avisos del framework en la tarjeta y el Mapa con el vocabulario único; después el framework reordenado y pasar Iridium al framework.
**Leer antes:** `modulos/orden/estado.md` › Log de iteraciones y Pendientes, `modulos/orden/diseno-tecnico.md` (y Q-126, Q-118 si llegaron).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
