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
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3: tandas 1 a 7 probadas; la tanda 8, Ideas como bloc de notas, espera Q-174 y lo que decida el frente Ideas, D-127) | en pausa |
| Ideas (`modulos/ideas/estado.md`) | sección | 1. Propuesta (tres formas en maquetas; espera Q-175 a Q-177) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 espera el rediseño, D-102) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (T-71) | sección | 1. Propuesta (el Mapa como una red de pasos por frente; pensarlo en el chat; orden con Capacidades a decidir) | pendiente |

## En qué estamos ahora
**Frente activo: Ideas** (D-127, T-69): antes de construir, decidir qué es Ideas dentro de un proyecto. Tres formas en maquetas (Diseño › «Ideas de un proyecto (propuesta)»): A notas, B tarjetas y C ideas y enlaces para revisar (la recomendada); comparadas en `modulos/ideas/propuesta.md`.
Diseño (DI-I3) queda en pausa mientras tanto: las tandas 1 a 7 están probadas y la tanda 8, Ideas del inicio como bloc de notas (D-126), espera Q-174 y lo que se decida en Q-177. El Mapa se rehará como frente propio (T-71). Detalle en `modulos/diseno/estado.md`.
Orden terminó su construcción (OR-I4 probada en Q-146) y su paso 8 espera el rediseño. Compartir queda en pausa (2026-11-16, a pedido del usuario): lo que falta para compartir Iridium por GitHub, la invitación (Q-126), se retoma cuando lo pida.
Chat nuevo por tamaño y tiempo, y arranque liviano (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`, que ya guardó la línea de base.

## Preguntas abiertas
- **Q-175 — ¿Qué forma toma Ideas dentro de un proyecto?**
  Tipo: decisión · frena · Frente: Ideas
  Contexto: las tres maquetas están en Diseño › «Ideas de un proyecto (propuesta)»; ventajas y desventajas en `modulos/ideas/propuesta.md` › Las tres formas. Podés mezclar: decime qué tomás de cada una en el texto libre.
  Opciones: A) Notas, un mini Obsidian: la lista a la izquierda y la nota abierta · B) Tarjetas chicas con lo que tiene cada idea · C) Cada idea en su renglón, que se abre como nota chica, y los enlaces en «Para revisar» con Revisar con la IA (recomendada: conserva cada idea separada y le da a los enlaces un fin)

- **Q-176 — ¿Las ideas que anota la IA aparecen junto a las tuyas?**
  Tipo: decisión · Frente: Ideas
  Contexto: la IA anota ideas del proyecto como `T-n` nuevos en `trabajo.md` (por ejemplo T-69 y T-70). La Ideas de antes las mostraba; el bloc de hoy, no.
  Opciones: A) Sí, en la misma lista, cada una con su código (recomendada: un solo lugar para mirar qué hay por pensar) · B) No: Ideas es solo lo que anoto yo, y lo de la IA sigue en Docs

- **Q-177 — ¿Qué pasa con Ideas del inicio (el bloc de notas)?**
  Tipo: decisión · Frente: Ideas
  Contexto: con Ideas dentro de cada proyecto, la del inicio queda para lo que todavía no tiene proyecto (D-126). Tu prueba de Q-174 sirve igual para cualquiera de las tres.
  Opciones: A) La misma forma que la del proyecto, para las ideas sin proyecto, con «Mover a un proyecto» (recomendada: una sola manera de anotar en toda la app) · B) Queda como bloc libre, distinto del proyecto · C) Se va: toda idea va en un proyecto

- **Q-174 — Probá Ideas como bloc de notas**
  Tipo: prueba · Frente: Diseño
  Contexto: la versión entra sola cuando dejás Iridium unos 3 minutos sin usar (o tocá **Actualizar** abajo). Ideas (Ctrl+3) ya no anota en los proyectos: es una hoja libre que se guarda sola en `notas.md` de la carpeta Ideas (D-126). Detalle en `modulos/diseno/estado.md` › tanda 8.
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
Ideas: con Q-175 a Q-177, cerrar la Propuesta y escribir la Definición, con la maqueta elegida corregida. Si llega antes Q-174, se procesa (lo que falle del bloc se arregla solo si Q-177 lo mantiene).
**Leer antes:** `modulos/ideas/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
