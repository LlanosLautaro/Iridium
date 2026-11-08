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
| Diseño (`modulos/diseno/estado.md`) | sección | 1. Propuesta (activado en D-102) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I4, espera la prueba; el paso 8 espera el rediseño, D-102) | en curso |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |

## En qué estamos ahora
**Desde el 2026-11-07 el frente activo es Diseño** (D-102): un «Claude Design» local dentro de Iridium para ver todas las pantallas juntas y cambiar la UI desde un solo lugar, y la dirección visual pasa a negro, como X. La propuesta está escrita (`modulos/diseno/propuesta.md`) y espera Q-147 (el mínimo) y Q-148 (la muestra negra). Antes: hito 10 con el frente **Orden** (D-091, la UX y la forma de trabajo). OR-I1 (el modelo y el control) está hecha y probada (Q-141); Iridium ya sigue el framework y el control da cero. OR-I2 está hecha y probada (Q-144): la cuenta de la bandeja (un solo total, amarilla solo si algo frena), el botón principal claro, la Bandeja de entrada con filtros por frente y las en pausa, el nombre de la ficha, **Actualizar** (T-46; probado en Q-142), el esqueleto (la barra del proyecto en dos grupos; se entra a la Bandeja si hay algo, si no al Mapa), la cabecera común de las secciones (W-9), el frente activo en la tarjeta (W-2) y la conversación de 360 px, que recuerda el ancho de cada vista (D-098). OR-I3 está hecha y probada (Q-145): la sección **Trabajo** de cada proyecto, anotar una idea sin la IA e **Ideas** del inicio con las nuevas de todos. OR-I4 está construida y espera tu prueba (Q-146): el **Mapa** con el bloque de frentes (el activo grande, los que esperan y los que están en operación en una línea), **Skills › Framework** con **Pasar al framework** (también desde la tarjeta y desde una carpeta simple), los avisos de la tarjeta que llevan a su lista, la carpeta simple sin Mapa ni Trabajo, el ⚠ de Skills en gris y las tablas de Docs con el ancho de la sección. **Nuevo proyecto** arma solo la plantilla básica, sin la IA (R-14, D-101). Compartir está publicado; falta la invitación (Q-126).

## Preguntas abiertas
- **Q-147 — ¿Qué entra en el mínimo de Diseño?**
  Tipo: decisión · frena · Frente: Diseño
  Contexto: `modulos/diseno/propuesta.md` › El mínimo. La medición del 2026-11-07: los colores ya cambian desde un solo archivo, pero cada sección arma sus propios botones, filas y recuadros (13 archivos de estilos, 9 piezas compartidas), y de ahí sale el ruido. En las tres opciones la UI de Iridium se rehace en negro; cambia qué herramienta tenés para mirarla.
  Opciones: A) Primero las piezas compartidas y el negro aplicado, mirando las 30 capturas en una página; después la sección Diseño con Sistema, Pantallas y Probar una dirección (recomendada: ves el cambio en la primera iteración y la sección se hace sobre piezas ya ordenadas) · B) Primero la sección Diseño completa y con ella el rediseño (la herramienta antes, el cambio visible más tarde) · C) Solo el rediseño, sin sección: las capturas en una página HTML (lo más rápido, pero no sirve para tus otros proyectos ni para comentar)

- **Q-148 — ¿Vamos con este negro?**
  Tipo: decisión · Frente: Diseño
  Contexto: las 30 pantallas de Iridium con los tokens negros (inspirados en el modo oscuro de X), sin tocar nada más, están en `tools/salida/auditoria/1440x900-negro/`; las mismas con el tema de hoy, en `tools/salida/auditoria/1440x900/`. Compará por ejemplo `20-proyecto-mapa.png` y `02-grilla.png`. Ojo: es solo la paleta; las cajas, los bordes y las píldoras se sacan después, con las piezas compartidas.
  Opciones: A) Sí, este negro con el azul de X para lo activo y la letra del sistema (recomendada: es lo más callado y lo que pediste) · B) Negro, pero con el verde de Iridium para lo activo (conserva la identidad) · C) Negro, pero con otro acento o con Chakra Petch (contame cuál en la respuesta)

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
Diseño, paso 1: procesar Q-147 y Q-148 y escribir `modulos/diseno/definicion.md` (el formato `docs/diseno/`, las piezas compartidas y las iteraciones DI-I1 en adelante). Si llega Q-146, procesarla aparte: si anda, cerrar OR-I4; el paso 8 de Orden queda para después del rediseño (D-102).
**Leer antes:** `respuestas/Q-147.md`, `respuestas/Q-148.md`, `modulos/diseno/estado.md` y `modulos/diseno/propuesta.md` (y `respuestas/Q-146.md` o Q-126 si llegaron).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
