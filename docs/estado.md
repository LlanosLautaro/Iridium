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
| Ideas (`modulos/ideas/estado.md`) | sección | 2. Definición (la forma C elegida, D-128; espera Q-178 y Q-179) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 espera el rediseño, D-102) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (T-71) | sección | 1. Propuesta (el Mapa como una red de pasos por frente; pensarlo en el chat; orden con Capacidades a decidir) | pendiente |

## En qué estamos ahora
**Frente activo: Ideas** (D-127, T-69): elegida la forma C (D-128): cada idea en su renglón, con su estado en color, las de la IA con un robot, «Para revisar» para los enlaces, y la misma forma en el inicio para las ideas sueltas. La Definición está escrita (`modulos/ideas/definicion.md`); las maquetas corregidas, en Diseño › «Ideas de un proyecto (propuesta)».
Diseño (DI-I3) queda en pausa mientras tanto: las tandas 1 a 7 están probadas y la tanda 8 (el bloc de notas del inicio) espera Q-174; el bloc se reemplazará por Ideas. El Mapa se rehará como frente propio (T-71). Detalle en `modulos/diseno/estado.md`.
Orden terminó su construcción (OR-I4 probada en Q-146) y su paso 8 espera el rediseño. Compartir queda en pausa (2026-11-16, a pedido del usuario): lo que falta para compartir Iridium por GitHub, la invitación (Q-126), se retoma cuando lo pida.
Chat nuevo por tamaño y tiempo, y arranque liviano (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`, que ya guardó la línea de base.

## Preguntas abiertas
- **Q-178 — ¿Va la definición de Ideas con las maquetas corregidas?**
  Tipo: decisión · frena · Frente: Ideas
  Contexto: en Diseño › «Ideas de un proyecto (propuesta)», «C · Ideas y enlaces para revisar» (con los colores y el robot) y «C · Ideas del inicio (sin proyecto)». Lo que entra y lo que no, en `modulos/ideas/definicion.md` › Funcionalidades.
  Opciones: A) Sí, seguí con cómo se usa (recomendada: las maquetas ya muestran lo que pediste en Q-175 a Q-177) · B) Cambiá algo (decime qué en el texto libre)

- **Q-179 — ¿Qué pasa cuando apruebo una idea?**
  Tipo: decisión · Frente: Ideas
  Contexto: la IA tiene su lista de trabajo (`trabajo.md`), donde una idea aprobada pasaría a «pendiente» y una rechazada a «descartado». La IA mira esa lista cuando arranca algo nuevo.
  Opciones: A) Queda en verde y pasa al trabajo de la IA como pendiente: la toma cuando le toque, en el orden del plan (recomendada: aprobar ya dice «hacela», sin otro paso) · B) Solo queda en verde: nada cambia hasta que yo hable de ella con la IA · C) Queda en verde y además la IA me pregunta en qué hito o frente va

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
Ideas: con Q-178 y Q-179, cerrar la Definición y escribir la UX del frente (los recorridos de anotar, aprobar, revisar un enlace con la IA y mover una idea suelta). Si llega antes Q-174, se procesa (del bloc solo se arregla lo que rompa el uso o lo que vuelve en cada idea: pegar enlaces e imágenes).
**Leer antes:** `modulos/ideas/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
