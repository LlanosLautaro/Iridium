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
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3 en curso: tandas 1 a 7 probadas; D-124 espera Q-172) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I4, espera la prueba; el paso 8 espera el rediseño, D-102) | en curso |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (T-71) | sección | 1. Propuesta (el Mapa como una red de pasos por frente; pensarlo en el chat; orden con Capacidades a decidir) | pendiente |

## En qué estamos ahora
**Frente activo: Diseño** (D-102): el rediseño negro pasa al código por tandas (DI-I3); las tandas 1 a 7 están probadas; el color vuelve donde informa (D-124) y F8 responde ya: esperan tu prueba (Q-172). El Mapa se rehará como frente propio (T-71). Historia y detalle en `modulos/diseno/estado.md`.
Orden espera tu prueba de OR-I4 (Q-146); Compartir, la invitación (Q-126).
Chat nuevo por tamaño y tiempo, y arranque liviano (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`, que ya guardó la línea de base.

## Preguntas abiertas
- **Q-172 — Probá los colores, los scripts y F8**
  Tipo: prueba · Frente: Diseño
  Contexto: la versión entra sola cuando dejás Iridium unos 3 minutos sin usar (o tocá **Actualizar** abajo). Detalle en `modulos/diseno/estado.md` › Q-171 y los comentarios R-56 a R-59.
  - [ ] Abajo a la derecha, los medidores de uso van en verde (y en ámbar o rojo cuando se llenan); el círculo del contexto en la conversación, también
  - [ ] Los enlaces (en el Próximo paso, la Bandeja, la conversación y Docs) son azules
  - [ ] En Archivos, un archivo de código tiene colores: palabras clave en azul, textos entre comillas en naranja, comentarios en verde
  - [ ] Arriba, el proyecto elegido se distingue de las otras pestañas abiertas: línea blanca arriba y borde
  - [ ] En la entrada de un proyecto, los scripts son filas con el nombre, la descripción en dos líneas y **Ejecutar** en verde a la derecha; tocarlo lo corre
  - [ ] F8 muestra «Comentando» apenas lo apretás, y al dejar un comentario con Enter la tarjeta dice «Guardando…» enseguida
  - [ ] F8 ya no se siente lento (si sigue, contame en qué momento: al apretarlo, al elegir algo o al dejar el comentario)

- **Q-146 — Probá OR-I4: el Mapa con frentes y Skills › Framework**
  Tipo: prueba · Frente: Orden
  Contexto: tocá **Actualizar** abajo para tener esta versión. Detalle en `modulos/orden/estado.md` › OR-I4. No toques **Pasar al framework** en un proyecto tuyo salvo que quieras pasarlo de verdad: manda el pedido a su IA y gasta uso.
  - [ ] El **Mapa** de Iridium muestra arriba la fila de hitos y, debajo, Orden como frente activo con su paso, su Próximo paso, lo que está en curso y lo de tu bandeja; abajo, «En espera: Diseño · Capacidades» y «En operación» con los demás
  - [ ] Tocar un hito muestra su detalle y **Volver** trae el bloque; un frente de las líneas de abajo abre su `estado.md`
  - [ ] En **Skills** (Ctrl+3), **Framework** es la primera entrada, con la cuenta en gris; ahí están tus proyectos con cómo está cada uno y los filtros
  - [ ] En la grilla, tocar «! N avisos del framework» de una tarjeta (si alguna tiene) abre esa lista en Framework; con clic derecho, el menú ofrece **Pasar al framework** en los de framework viejo
  - [ ] Una carpeta sin `docs/estado.md` entra a Archivos con el recuadro punteado «Esta carpeta no sigue el framework» y sin Mapa ni Trabajo en su barra
  - [ ] En Docs, una tabla ancha (por ejemplo la de Módulos de `estado.md` con el ancho de lectura más angosto) ocupa el ancho de la sección y se desplaza de costado dentro de su recuadro

- **Q-126 — Invitá a la otra persona al repo de Iridium**
  Tipo: tarea · frena
  Contexto: D-085 y Q-123 (A). Sin la invitación, su Iridium no ve las versiones nuevas (le aparece «Sin acceso a las versiones nuevas»). Si preferís, pasame su usuario de GitHub en la respuesta y la invito yo.
  - [ ] Le pasé la carpeta `Iridium para compartir` del escritorio (o el `.zip` de la última versión en GitHub)
  - [ ] En `github.com/LlanosLautaro/Iridium` › Settings › Collaborators › Add people, la invité con su usuario
  - [ ] Aceptó la invitación y en su Iridium tocó **Iniciar sesión** abajo; el aviso desapareció

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Diseño: DI-I3, tanda 8 — Ideas como bloc de notas (D-112) pasa a las piezas. Si llega Q-172 o Q-146, procesarlas antes (lo que falle de los colores, los scripts o F8 se corrige primero; si F8 sigue lento, que el ayudante meta el selector en Iridium sin pasar por la extensión).
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
