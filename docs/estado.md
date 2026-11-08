# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-08
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
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I1 hecha y DI-I2 con su primera tanda; esperan la prueba: Q-152) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I4, espera la prueba; el paso 8 espera el rediseño, D-102) | en curso |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |

## En qué estamos ahora
**Desde el 2026-11-07 el frente activo es Diseño** (D-102): un «Claude Design» local dentro de Iridium, en negro sin acento como único tema (D-103, D-104). Las pantallas son **maquetas HTML** que escribe la IA, se miran vivas, se comentan con `F8` y lo aprobado se pasa al código (D-105). Con Q-151 (D-106) va primero la sección (DI-I1), después el rediseño de Iridium en maquetas (DI-I2), su pase al código (DI-I3) y al final Otra versión y Probar una dirección (DI-I4). DI-I1 (la sección) está construida y probada. Con D-107 se prueba sobre Iridium mismo: **DI-I2 empezó** y las primeras 16 maquetas del rediseño (el sistema, las 12 piezas y las pantallas de Inicio y de un proyecto) están en `docs/diseno/`; las recorrés en Diseño y las comentás con `F8` (Q-152).
Antes, el frente **Orden** (D-091): OR-I1 a OR-I3 hechas y probadas; OR-I4 (el Mapa con frentes y Skills › Framework) construida, espera tu prueba (Q-146). **Nuevo proyecto** arma solo la plantilla básica, sin la IA (D-101).
Compartir está publicado; falta la invitación (Q-126).

## Preguntas abiertas
- **Q-152 — Recorré el rediseño de Iridium en Diseño y comentalo con F8**
  Tipo: prueba · Frente: Diseño
  Contexto: tocá **Actualizar** abajo para tener esta versión. Probás DI-I1 (la sección) con las maquetas de Iridium mismo (D-107): 16 pantallas en negro, con datos de muestra (Alfa, Beta…). Lo que no te guste, comentalo con `F8` sobre la maqueta: es parte de la prueba. Detalle en `modulos/diseno/estado.md` › Log › DI-I2.
  - [ ] En Iridium, **Diseño** (en la barra, debajo de Revisión) muestra las maquetas vivas en **Pantallas**, en dos grupos, Inicio y Un proyecto, con su nombre debajo
  - [ ] Tocar una la agranda y se puede usar: los íconos de la izquierda pasan a otra pantalla y cambia el nombre de arriba; las flechas de los costados van a la anterior y la siguiente; Esc vuelve
  - [ ] En **Proyectos**, los tres puntos de la tarjeta de Iridium (o el clic derecho en cualquier tarjeta) abren el menú; en **Ajustes**, las pestañas de la izquierda cambian de página
  - [ ] Con una grande, **F8** prende el modo comentar; el comentario aparece en la Revisión de Iridium y tocar «la maqueta …» la abre grande otra vez
  - [ ] Pedile a la IA que cambie algo de una maqueta (por ejemplo, desde tu comentario): se redibuja sola y queda con un punto hasta que la agrandás
  - [ ] **Sistema** muestra los colores, la letra, los tamaños, los espacios y las piezas vivas
  - [ ] La dirección en general (negro, sin cajas dentro de cajas, un solo botón blanco por pantalla) va bien para seguir con las demás pantallas

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
Diseño: procesar Q-152 y los comentarios de la Revisión sobre las maquetas; corregirlas, cerrar DI-I1 si la sección anda y seguir con la tanda 2 de DI-I2. Si llega Q-146, procesarla aparte: si anda, cerrar OR-I4; el paso 8 de Orden queda para después del rediseño (D-102).
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso (y Q-146 o Q-126 si llegaron).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
