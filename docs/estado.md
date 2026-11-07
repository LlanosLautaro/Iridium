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
| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I2 en curso) | en curso |

En espera, detrás de Orden (D-091): Diseño (T-5) y Capacidades (T-28).

## En qué estamos ahora
Hito 10 con el frente **Orden** primero (D-091, la UX y la forma de trabajo): no se suman funciones nuevas. OR-I1 (el modelo y el control) está hecha y probada (Q-141); Iridium ya sigue el framework y el control da cero. OR-I2 va más allá de la mitad: la cuenta de la bandeja (un solo total, amarilla solo si algo frena), el botón principal claro, la Bandeja de entrada con filtros por frente y las en pausa, el nombre de la ficha, **Actualizar** (T-46: un solo botón que arma y reinicia; su prueba real en Q-142) y el esqueleto (la barra del proyecto en dos grupos; se entra a la Bandeja si hay algo, si no al Mapa). Faltan la cabecera común, el frente activo en la tarjeta y la conversación de 360 px. **Nuevo proyecto** arma solo la plantilla básica, sin la IA (R-14, D-101). Compartir está publicado; falta la invitación (Q-126).

## Preguntas abiertas
- **Q-142 — Probá Actualizar con tu Iridium**
  Tipo: prueba · Frente: Orden
  Contexto: T-46 (R-12). Tu Iridium todavía tiene los dos avisos viejos: tocá **Armar** abajo una última vez y, cuando aparezca «Versión nueva lista», **Reiniciar ahora**. Desde ahí, cuando haya algo nuevo, abajo va a aparecer un solo botón. Fijate:
  - [ ] Después de un commit nuevo aparece **Actualizar** abajo, y con el mouse encima dice qué trae
  - [ ] Al tocarlo dice «Actualizando…» con el tiempo, no se abre ninguna consola y Iridium se sigue usando
  - [ ] Al terminar (unos minutos) Iridium se reinicia solo con la versión nueva
  - [ ] Si tocás **Cancelar** mientras actualiza, vuelve a ofrecer Actualizar y la app sigue como estaba
- **Q-126 — Invitá a la otra persona al repo de Iridium**
  Tipo: tarea · frena
  Contexto: D-085 y Q-123 (A). Sin la invitación, su Iridium no ve las versiones nuevas (le aparece «Sin acceso a las versiones nuevas»). Si preferís, pasame su usuario de GitHub en la respuesta y la invito yo.
  - [ ] Le pasé la carpeta `Iridium para compartir` del escritorio (o el `.zip` de la última versión en GitHub)
  - [ ] En `github.com/LlanosLautaro/Iridium` › Settings › Collaborators › Add people, la invité con su usuario
  - [ ] Aceptó la invitación y en su Iridium tocó **Iniciar sesión** abajo; el aviso desapareció

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Orden, OR-I2: la cabecera común de las secciones (W-9: título y cuenta, acciones a la derecha, filtros abajo, la misma altura).
**Leer antes:** `modulos/orden/estado.md` › OR-I2 y Próximo paso, `modulos/orden/diseno-tecnico.md` › Iteraciones, `04-ux.md` › W-9, `06-ui.md` › Frente Orden (y Q-142, Q-126 si llegaron).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
