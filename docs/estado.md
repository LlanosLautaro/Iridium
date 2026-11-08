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
| Diseño (`modulos/diseno/estado.md`) | sección | 4. UX (rehecho con D-105; espera Q-151) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I4, espera la prueba; el paso 8 espera el rediseño, D-102) | en curso |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |

## En qué estamos ahora
**Desde el 2026-11-07 el frente activo es Diseño** (D-102): un «Claude Design» local dentro de Iridium para ver todas las pantallas juntas y cambiar la UI desde un solo lugar, en negro sin acento como único tema (D-103, D-104). Con tu respuesta a Q-150 (D-105), **las pantallas son maquetas HTML** que escribe la IA: se miran vivas en la sección, se comentan con `F8` y se prueban en otras versiones antes de tocar la app; lo aprobado se pasa al código. El rediseño de Iridium (las 12 piezas del inventario) se hace así: primero en maquetas, después en el código. La UX quedó rehecha (`modulos/diseno/ux.md`); espera tu visto bueno y el orden (Q-151).
Antes, el frente **Orden** (D-091): OR-I1 a OR-I3 hechas y probadas; OR-I4 (el Mapa con frentes y Skills › Framework) construida, espera tu prueba (Q-146). **Nuevo proyecto** arma solo la plantilla básica, sin la IA (D-101).
Compartir está publicado; falta la invitación (Q-126).

## Preguntas abiertas
- **Q-151 — ¿Va la sección Diseño con maquetas, y en qué orden?**
  Tipo: decisión · frena · Frente: Diseño
  Contexto: tomé tu idea tal cual (D-105): la IA dibuja las pantallas en HTML en `docs/diseno/`, Iridium las muestra vivas en un lienzo, una agrandada se puede usar, `F8` la comenta y el comentario va a la Revisión; **Otra versión** y **Probar una dirección** ponen dos ideas lado a lado; **Pasar al código** le pide a la IA que la app quede igual. Detalle y dibujos en `modulos/diseno/ux.md` › Parte 2. Las capturas de la app real quedan solo para comparar (no hace falta un script por proyecto). Lo que falta elegir es el orden.
  Opciones: A) Primero la sección (mirar, usar y comentar maquetas), después el rediseño de Iridium en maquetas, pasarlo al código y al final Otra versión y Probar una dirección (recomendada: el rediseño de Iridium ya se revisa con la herramienta, y llega a la app antes porque el negro ya está elegido) · B) Primero la sección completa, con Otra versión y Probar una dirección, y después el rediseño de Iridium (la herramienta entera antes, pero la app cambia más tarde) · C) Primero las maquetas del rediseño de Iridium, mirándolas en el navegador con la extensión, pasarlas al código y la sección después (la app cambia antes, pero se revisa sin la herramienta y sin lienzo)

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
Diseño, paso 5: con Q-151, cerrar el paso 4, ordenar las iteraciones y escribir `modulos/diseno/diseno-tecnico.md` (el formato `docs/diseno/` con las maquetas, mostrarlas vivas en Iridium, `F8` dentro de una maqueta, el pase al código); después, la primera iteración. Si llega Q-146, procesarla aparte: si anda, cerrar OR-I4; el paso 8 de Orden queda para después del rediseño (D-102).
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso, `modulos/diseno/ux.md` › Parte 2, D-105 y `respuestas/Q-151.md` (y Q-146 o Q-126 si llegaron).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
