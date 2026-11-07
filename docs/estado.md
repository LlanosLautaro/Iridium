# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-07
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
| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I3 en curso) | en curso |

En espera, detrás de Orden (D-091): Diseño (T-5) y Capacidades (T-28).

## En qué estamos ahora
Hito 10 con el frente **Orden** primero (D-091, la UX y la forma de trabajo): no se suman funciones nuevas. OR-I1 (el modelo y el control) está hecha y probada (Q-141); Iridium ya sigue el framework y el control da cero. OR-I2 está hecha y probada (Q-144): la cuenta de la bandeja (un solo total, amarilla solo si algo frena), el botón principal claro, la Bandeja de entrada con filtros por frente y las en pausa, el nombre de la ficha, **Actualizar** (T-46; probado en Q-142), el esqueleto (la barra del proyecto en dos grupos; se entra a la Bandeja si hay algo, si no al Mapa), la cabecera común de las secciones (W-9), el frente activo en la tarjeta (W-2) y la conversación de 360 px, que recuerda el ancho de cada vista (D-098). OR-I3 está construida y espera tu prueba (Q-145): la sección **Trabajo** de cada proyecto (los `T-n` con filtros), anotar una idea sin la IA e **Ideas** del inicio, con las ideas nuevas de todos los proyectos, las sueltas y el selector de a qué proyecto va. **Nuevo proyecto** arma solo la plantilla básica, sin la IA (R-14, D-101). Compartir está publicado; falta la invitación (Q-126).

## Preguntas abiertas
- **Q-145 — Probá OR-I3: Trabajo, Ideas y anotar sin la IA**
  Tipo: prueba · Frente: Orden
  Contexto: tocá **Actualizar** abajo para tener esta versión. Detalle en `modulos/orden/estado.md` › OR-I3. Por ahora solo Iridium sigue el framework: en Ideas vas a ver sus ideas nuevas, tus sueltas y la línea de cuántos proyectos todavía no pasaron.
  - [ ] En un proyecto, **Trabajo** muestra los `T-n` con filtros por estado y deja plegados al final los hechos
  - [ ] Tocar un `T-n` lo despliega con su texto y su origen; un enlace a un `T-n` (en Docs o en la conversación) abre Trabajo en ese ítem
  - [ ] **Anotar una idea** en Trabajo la suma como nueva, marcada un momento, sin abrir una sesión
  - [ ] En **Ideas** (Ctrl+4) están las nuevas de Iridium agrupadas, tus sueltas al final y la línea de los proyectos que no aparecen
  - [ ] El selector de al lado del campo ofrece Iridium y «Suelta»; una idea suelta aparece arriba de Sueltas
  - [ ] Tocar una idea de Iridium abre su Trabajo en esa idea; una suelta se despliega y **Hablar de esta idea** la pone arriba del cuadro del chat general

- **Q-126 — Invitá a la otra persona al repo de Iridium**
  Tipo: tarea · frena
  Contexto: D-085 y Q-123 (A). Sin la invitación, su Iridium no ve las versiones nuevas (le aparece «Sin acceso a las versiones nuevas»). Si preferís, pasame su usuario de GitHub en la respuesta y la invito yo.
  - [ ] Le pasé la carpeta `Iridium para compartir` del escritorio (o el `.zip` de la última versión en GitHub)
  - [ ] En `github.com/LlanosLautaro/Iridium` › Settings › Collaborators › Add people, la invité con su usuario
  - [ ] Aceptó la invitación y en su Iridium tocó **Iniciar sesión** abajo; el aviso desapareció

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Orden, OR-I3: procesar la prueba (Q-145). Si algo falla, arreglarlo; si anda, cerrar OR-I3 y empezar OR-I4 (el Mapa con frentes, Skills › Framework y Pasar al framework).
**Leer antes:** `respuestas/Q-145.md` y `modulos/orden/estado.md` › Próximo paso (y Q-126 si llegó).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
