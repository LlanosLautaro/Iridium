# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-28
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
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10; CO-I11, tu Iridium instalado, probada en Q-306) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | en operación (con el hito 10; lo nuevo probado en Q-314, el borde como hueco aceptado en Q-313; cerrado el 2026-11-27, 1.4.0) | hecho |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | en operación (con el hito 10; OR-I5, las novedades del framework, probada en Q-312; cerrado el 2026-11-26, 1.3.0) | hecho |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | en operación (con el hito 10; probada en Q-227, calidad el 2026-11-21) | hecho |
| Plantillas (`modulos/plantillas/estado.md`) | plugin (el framework) | en operación (con el hito 10; PL-I1 probada en Q-327; cerrado el 2026-11-27, 1.6.0) | hecho |
| Tipos de proyecto (`modulos/tipos/estado.md`) | plugin (el framework) | 1. Propuesta (espera Q-329 a Q-331) | en curso |
| Abrir (`modulos/abrir/estado.md`) | sección | en operación (con el hito 10; T-87, la guía del framework, D-207; cerrado el 2026-11-27, 1.5.0) | hecho |
| Paridad (`modulos/paridad/estado.md`) | sección | en operación (con el hito 10; las dos partes probadas y con su calidad, la última el 2026-11-25) | hecho |
| Frentes (`modulos/frentes/estado.md`) | sección | en operación (con el hito 10; FS-I4, la revisión del avance solo, probada en Q-294; D-194 confirmado en Q-298) | hecho |
| Pulido (`modulos/pulido/estado.md`) | sección | en operación (con el hito 10; PU-I1 y PU-I2 probadas en Q-307, cerrado el 2026-11-26, 1.2.0) | hecho |

## En qué estamos ahora
**2026-11-27, Tipos de proyecto abierto** (Q-328 A, D-210): la guía según el tipo de proyecto (T-1), empezando por la herramienta personal. La propuesta (`modulos/tipos/propuesta.md`): un dato nuevo, el tipo (app, herramienta personal, juego), y los hitos que cambian en una herramienta: la exploración más corta, el lanzamiento pasa a «Ponerla en uso» y la operación sin preguntas periódicas. Espera Q-329 a Q-331.
**2026-11-28, arreglo de Compartir:** la publicación sola de la versión en uso (D-191) no había corrido nunca: al armar, el empaquetador (Rollup 4.65) dejaba la regla de publicar en «nunca». Arreglado, con una prueba que arma el proceso principal y mira la regla; entra con el próximo armado y publica cinco minutos después de abrir (queda en `release/publicar.log`).
**Antes, el 2026-11-27:** Plantillas (1.6.0), Abrir (1.5.0) y Diseño (1.4.0) cerrados; la fila de D-166 quedó hecha. El resumen de lo anterior pasó a `10-operacion.md` › Lo hecho, resumido.
Mientras, el avance solo sigue con lo chico. Ideas sin evaluar y evaluadas que esperan tu aprobación: en Ideas.

## Preguntas abiertas
- **Q-329 — ¿Seguimos con la propuesta de Tipos de proyecto?**
  Tipo: decisión · frena · Frente: Tipos de proyecto
  Contexto: `modulos/tipos/propuesta.md` › Cómo encaja en el producto. Los hitos 0, 2, 3, 5, 7 y 8 quedan iguales; la exploración es una tanda corta (¿algo ya lo hace?), el perfil sale casi hecho, el lanzamiento pasa a «Ponerla en uso» (se abre con un clic, se arma con un clic, sus datos con copia, volver atrás es volver a un commit; sin changelog ni guía) y la operación no tiene preguntas periódicas. El juego, cuando haya uno.
  Opciones: A) Seguir así (recomendada: saca el papeleo que hoy se salta a mano y no toca lo que protege la calidad) · B) Seguir, pero cambiando solo los hitos 9 y 10 (menos trabajo; la exploración y el perfil quedan largos) · C) No hace falta: seguir con los huecos aceptados en cada proyecto
- **Q-330 — ¿Dónde se dice de qué tipo es un proyecto?**
  Tipo: decisión · Frente: Tipos de proyecto
  Contexto: `modulos/tipos/propuesta.md` › Cómo encaja en el producto. Sin decirlo, un proyecto es una app y nada cambia.
  Opciones: A) Al crearlo, en Nuevo proyecto, y queda en la ficha: la tarjeta lo muestra y se cambia desde su menú (recomendada: lo elegís vos, una vez, y Iridium lo lee de un solo lugar) · B) En `perfil-proyecto.md`, como una pregunta más del perfil en el hito 2 (lo decide la conversación; hasta el hito 2 no se sabe) · C) Que la IA lo deduzca del perfil (solo yo y local es herramienta; sin pregunta, pero puede errar)
- **Q-331 — ¿Qué pasa con tus proyectos que ya son herramientas personales?**
  Tipo: decisión · Frente: Tipos de proyecto
  Contexto: `modulos/tipos/propuesta.md` › Cómo llega a los proyectos que ya existen.
  Opciones: A) Una novedad del framework: al ponerte al día, la IA de cada uno te pregunta el tipo con una pregunta (recomendada: es como llegan hoy los cambios y decidís proyecto por proyecto) · B) Solo los nuevos; a los otros se lo decís vos cuando quieras · C) La IA lo marca sola en cada uno según su perfil

## Próximo paso
Con Q-329 a Q-331 respondidas: registrar las decisiones y escribir la definición de Tipos de proyecto (la herramienta personal hito por hito).
**Leer antes:** `modulos/tipos/estado.md`, `modulos/tipos/propuesta.md` y las respuestas de Q-329 a Q-331.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
