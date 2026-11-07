# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-06
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
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I2 en curso) | en curso |

En espera, detrás de Orden (D-091): Diseño (T-5) y Capacidades (T-28).

## En qué estamos ahora
Hito 10 con el frente **Orden** primero (D-091, la UX y la forma de trabajo): no se suman funciones nuevas. OR-I1 (el modelo y el control) está hecha y probada (Q-141); Iridium ya sigue el framework y el control da cero. OR-I2 va por la mitad: la cuenta de la bandeja (un solo total, amarilla solo si algo frena), el botón principal claro, la Bandeja de entrada con filtros por frente y las en pausa, y el nombre de la ficha. Faltan Actualizar (T-46), el esqueleto, la cabecera común y la conversación de 360 px. Compartir está publicado; falta la invitación (Q-126).

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
Orden, OR-I2: Actualizar (T-46), un solo botón que arma y reinicia.
**Leer antes:** `modulos/orden/estado.md` › OR-I2 y Próximo paso, `modulos/orden/diseno-tecnico.md` › Actualizar, `04-ux.md` › W-1 y F-7, `06-ui.md` › Frente Orden (Actualizar), `trabajo.md` › T-46 (y Q-126, Q-118 si llegaron).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
