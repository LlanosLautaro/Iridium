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
| Diseño (`modulos/diseno/estado.md`) | sección | 4. UX (escrito; espera Q-150) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I4, espera la prueba; el paso 8 espera el rediseño, D-102) | en curso |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |

## En qué estamos ahora
**Desde el 2026-11-07 el frente activo es Diseño** (D-102): un «Claude Design» local dentro de Iridium para ver todas las pantallas juntas y cambiar la UI desde un solo lugar, en negro sin acento como único tema (D-103, D-104). Primero las piezas compartidas y el negro aplicado (DI-I1), después la sección con Sistema y Pantallas (DI-I2) y Probar una dirección (DI-I3). La UX está escrita (`modulos/diseno/ux.md`): 12 piezas que reemplazan las cajas y los botones que hoy arma cada sección, cómo queda cada pantalla y la sección Diseño; espera tu visto bueno (Q-150).
Antes, el frente **Orden** (D-091): OR-I1 a OR-I3 hechas y probadas; OR-I4 (el Mapa con frentes y Skills › Framework) construida, espera tu prueba (Q-146). **Nuevo proyecto** arma solo la plantilla básica, sin la IA (D-101).
Compartir está publicado; falta la invitación (Q-126).

## Preguntas abiertas
- **Q-150 — ¿Va la UX de Diseño, y cómo se sacan las pantallas de cada proyecto?**
  Tipo: decisión · frena · Frente: Diseño
  Contexto: `modulos/diseno/ux.md`. La Parte 1 es el rediseño de Iridium: 12 piezas (botón, fila, bloque, recuadro…) y la tabla «Cómo queda cada pantalla»; la Parte 2, la sección Diseño (Sistema, Pantallas y Probar una dirección, con sus dibujos). Lo que falta elegir: en tus otros proyectos, **Sacar de nuevo** las pantallas puede correr un script que la IA deja armado una vez (no gasta uso y siempre saca las mismas) o pedírselo a la IA cada vez (no hay que armar nada, pero gasta uso y puede variar).
  Opciones: A) Va así, con un script de capturas por proyecto que la IA arma la primera vez (recomendada: sacarlas es gratis y repetible, y Probar una dirección lo necesita para comparar igual con igual) · B) Va así, pero que las saque la IA cada vez

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
Diseño, paso 5: con Q-150, cerrar el paso 4 y escribir `modulos/diseno/diseno-tecnico.md` (las piezas en `src/renderer/ui/`, cómo se pasan las secciones, la página de antes y después, el formato `docs/diseno/`); después, DI-I1. Si llega Q-146, procesarla aparte: si anda, cerrar OR-I4; el paso 8 de Orden queda para después del rediseño (D-102).
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso, `modulos/diseno/ux.md` y `respuestas/Q-150.md` (y Q-146 o Q-126 si llegaron).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
