# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-15
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
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3 en curso: tandas 1 a 7 y D-124 probadas; las pestañas y las casillas verdes esperan Q-173) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 espera el rediseño, D-102) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (T-71) | sección | 1. Propuesta (el Mapa como una red de pasos por frente; pensarlo en el chat; orden con Capacidades a decidir) | pendiente |

## En qué estamos ahora
**Frente activo: Diseño** (D-102): el rediseño negro pasa al código por tandas (DI-I3); las tandas 1 a 7 y el color donde informa (D-124) están probados; las pestañas con borde y las casillas verdes (R-60) esperan tu prueba (Q-173). El Mapa se rehará como frente propio (T-71). Historia y detalle en `modulos/diseno/estado.md`.
Orden terminó su construcción (OR-I4 probada en Q-146) y su paso 8 espera el rediseño; Compartir, la invitación (Q-126).
Chat nuevo por tamaño y tiempo, y arranque liviano (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`, que ya guardó la línea de base.

## Preguntas abiertas
- **Q-173 — Probá las pestañas y las casillas verdes**
  Tipo: prueba · Frente: Diseño
  Contexto: la versión entra sola cuando dejás Iridium unos 3 minutos sin usar (o tocá **Actualizar** abajo). Detalle en `modulos/diseno/estado.md` › Q-172 y R-60.
  - [ ] Arriba, con varios proyectos abiertos, cada pestaña tiene su borde; la elegida se ve como antes (fondo gris, sin la línea blanca)
  - [ ] En la Bandeja, una casilla marcada es verde con el tilde negro
  - [ ] Una opción elegida (A, B u Otro) y el interruptor **Archivados** de Proyectos (Ctrl+1) prendido también son verdes

- **Q-126 — Invitá a la otra persona al repo de Iridium**
  Tipo: tarea · frena
  Contexto: D-085 y Q-123 (A). Sin la invitación, su Iridium no ve las versiones nuevas (le aparece «Sin acceso a las versiones nuevas»). Si preferís, pasame su usuario de GitHub en la respuesta y la invito yo.
  - [ ] Le pasé la carpeta `Iridium para compartir` del escritorio (o el `.zip` de la última versión en GitHub)
  - [ ] En `github.com/LlanosLautaro/Iridium` › Settings › Collaborators › Add people, la invité con su usuario
  - [ ] Aceptó la invitación y en su Iridium tocó **Iniciar sesión** abajo; el aviso desapareció

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Diseño: DI-I3, tanda 8 — Ideas como bloc de notas (D-112) pasa a las piezas. Si llega Q-173, procesarla antes (lo que falle de las pestañas o las casillas se corrige primero).
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
