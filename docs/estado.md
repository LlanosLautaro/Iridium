# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Mantenerlo corto y al día.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-04
**Nivel de protección:** P2 — personal conectado (ver `perfil-proyecto.md`)

## Hito actual
10 — Operación — en curso: compartir Iridium (repo nuevo y versiones que se bajan solas, hechos); esperando Q-123

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | completo | `00-idea.md` |
| 1 | Exploración | completo | `01-exploracion.md` |
| 2 | Definición y alcance | completo | `02-definicion.md` |
| 3 | Investigación de dominio | completo | `03-investigacion.md` |
| 4 | UX | completo | `04-ux.md` |
| 5 | Arquitectura técnica | completo | `05-arquitectura.md` |
| 6 | UI | completo | `06-ui.md` |
| 7 | Construcción | completo | `07-construccion.md` |
| 8 | Pruebas y calidad | completo (portón aprobado en Q-108, 2026-11-02) | `08-calidad.md` |
| 9 | Lanzamiento | completo (portón aprobado en Q-111, 2026-11-02) | `09-lanzamiento.md` |
| 10 | Operación | en curso | `10-operacion.md` |

Estados posibles: pendiente · en curso · completo · saltado (con motivo) · reabierto.

## Módulos
| Módulo | Tipo | Paso actual | Estado |
|---|---|---|---|
| Revisión de la app (`modulos/revision/estado.md`) | producto hermano | en operación (con el hito 10) | completo |
| Skills (`modulos/skills/estado.md`) | sección | en operación (con el hito 10) | completo |
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10) | completo |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | completo |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | completo |

En espera, en este orden (D-079): Diseño y Capacidades (`02-definicion.md` › Módulos previstos).

## En qué estamos ahora
Hito 10, Operación. Lo prioritario es compartir Iridium. Hecho hoy: la limpieza de D-082 (herramientas y `docs/` sin tus otros proyectos; las capturas de la grilla y de la Revisión, fuera del repo), el **repo nuevo** con un solo commit (D-084; el historial viejo, en `Respaldo de Iridium`, junto a tu carpeta de proyectos) y las **versiones para compartir** (D-085): `pnpm publicar` las sube a GitHub y la copia de la otra persona las baja sola y las pone al cerrar. La primera ya está publicada y probada de punta a punta con GitHub (una copia vieja la bajó en 46 s y quedó al día al cerrarse; captura en `tools/salida/compartida-aviso.png`). La carpeta `Iridium para compartir` de tu escritorio ya trae esta versión, con el LEEME y la guía al día. También: Q-115 procesada (módulo Inicio completo, sin Pedir que la integren) y R-7 y R-8 cerrados al Backlog.

## Pendientes del hito actual
- [ ] Con Q-123: si es A, invitar a la otra persona al repo y sumar a la copia compartida el aviso «Iniciá sesión en GitHub para recibir versiones nuevas», y el paso en el LEEME; si es B o C, cambiar dónde se publica.
- [ ] Con Q-124 y Q-125: lo que se elija (una skill de Iridium que se carga solo en Iridium; la carpeta como «vault»).
- [ ] D-082: queda `src/main/core/carpeta-iridium.ts` con el nombre viejo de tu carpeta de skills, que Mover necesita; se saca después de Q-122.
- [ ] Con D-080: si cambian los formatos que lee Iridium, cambiar también la guía de `Iridium para compartir` (parte 3). Puesta al día con D-083 el 2026-11-04.
- [ ] Poner al día la skill `gestor-proyectos` y la guía `hitos-desarrollo-app` (D-062, D-063, D-068, Defectos 13 y 14 del hito 8; y que las pruebas vayan solo con casillas, Q-115). Va en el chat de Skills.
- [ ] Traer a la carpeta Skills las skills que la licencia permite y sacar las copias dobles (D-014): va en el chat de Skills.
- [ ] Con Q-122, después de Mover: en el chat de Skills, poner al día las rutas que nombran la carpeta vieja; en el chat general, la sección «Dónde están los demás proyectos» del `CLAUDE.md` de Ideas.

## Preguntas abiertas
- **Q-123 — ¿Cómo le llegan las versiones a la otra persona?**
  Tipo: decisión · frena
  Contexto: D-085. Todo está listo y probado con el repo privado; falta decidir cómo accede la otra persona. En las tres, le pasás una vez la carpeta `Iridium para compartir` del escritorio; después se actualiza sola.
  Opciones: A) El repo privado, con la otra persona como colaboradora (recomendada): el código sigue privado; ella necesita una cuenta de GitHub, aceptar tu invitación e iniciar sesión en GitHub una vez desde Iridium (le sumo ese aviso) · B) El repo público: no necesita nada, pero cualquiera ve el código y los `docs/` y puede bajar la app; repartir así una app que usa la suscripción de cada uno es lo que Anthropic no permite sin aprobación (D-069) · C) Un repo público aparte, solo con las versiones: no necesita nada y el código queda privado, pero cualquiera con el enlace baja la app (la misma condición de Anthropic)
- **Q-124 — ¿Cómo aprende el Claude de Iridium sus formatos?**
  Tipo: decisión
  Contexto: tu nota en Q-115. No hace falta instalarlas en la carpeta de Claude: Iridium puede cargar sus propias skills solo en las conversaciones que abre él (el SDK lo permite, como un complemento de esa sesión); el Claude de VS Code o de la terminal no las ve. Así el Claude de la otra persona también trabaja bien desde el primer día, sin configuración inicial.
  Opciones: A) Una skill «iridium» que viaja con Iridium y se carga solo dentro de Iridium (recomendada): los formatos que lee (las preguntas, con las pruebas solo con casillas; `scripts.md`; frentes; Revisión) y cómo trabajar desde ahí; la guía de hitos y la de la ficha siguen aparte, también cargadas por Iridium · B) Varias skills chicas (preguntas, listas, scripts, frentes…), también solo en Iridium: más finas, pero más piezas para mantener y para que Claude elija bien · C) Como hoy: skills globales en la carpeta de Claude y la configuración inicial de la carpeta para compartir (D-080)
- **Q-125 — ¿La carpeta de Iridium como un «vault»?**
  Tipo: decisión
  Contexto: tu idea en Q-115 y D-083. Mientras tanto, no hagas Q-122 (Mover), para no mover dos veces.
  Opciones: A) Como Obsidian: elegís tu carpeta de proyectos y adentro Iridium guarda `.iridium` con Ideas, Skills y sus datos internos; tus proyectos no se mueven; respaldo opcional de `.iridium` en GitHub, desde Ajustes (recomendada) · B) Como lo planteaste: una carpeta con `.iridium` y al lado `projects` con todos los proyectos; más ordenado, pero hay que mover todos tus proyectos y lo que los nombra (VS Code, accesos directos, scripts) · C) Dejar D-083 como está (la carpeta Iridium aparte) y sumar solo el respaldo en GitHub
- **Q-118 — Probá crear y publicar un repositorio con tu GitHub**
  Tipo: prueba
  Contexto: D-081 (Q-117). Armá la última versión (**Armar** abajo en Iridium) y abrila. Usá una carpeta de prueba (con **Abrir como proyecto**) o un proyecto que quieras subir. Fijate:
  - [ ] Sin git, **Inicializar repositorio** hace el primer commit sin `node_modules` ni `.env`
  - [ ] **Publicar en GitHub** muestra tu cuenta (o abre la ventana de git para iniciar sesión)
  - [ ] Privado y Publicar: aparece «En GitHub · tu-usuario/nombre», y el repositorio está en GitHub como privado
- **Q-122 — Probá Mover tus carpetas Ideas y Skills a la carpeta Iridium**
  Tipo: prueba
  Contexto: D-083 (Q-120). **En espera de Q-125: no la hagas todavía.** Antes de Mover, que la IA no esté trabajando en el chat general ni en el de Skills. Fijate:
  - [ ] Arriba de la grilla aparece el aviso con **Mover**; antes de tocarlo, en Ajustes › Proyectos › Carpeta Iridium, **Cambiar…** y elegí (o creá) la carpeta que quieras: el aviso pasa a nombrar esa carpeta
  - [ ] Mover pide confirmación y después dice «Listo»; en la carpeta de proyectos ya no están `Ideas` ni la de skills
  - [ ] Ideas (`Ctrl+4`) muestra tus ideas y el chat general sigue con la conversación de antes
  - [ ] Skills (`Ctrl+3`) muestra tus propias como «Propia · enlace a la carpeta Skills», sin enlaces rotos
  - [ ] En un chat nuevo de Claude Code (fuera de Iridium) tus skills siguen apareciendo

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Con Q-123: si es A, sumar a la copia compartida el aviso para iniciar sesión en GitHub (con la ventana de git, D-081), publicar esa versión (`pnpm publicar` después de Armar) y escribir en el LEEME de `Iridium para compartir` cómo aceptar la invitación; si es B o C, cambiar el repo de `pnpm publicar` y publicar ahí. Después, con Q-124 y Q-125, lo que elijas.
**Leer antes:** D-085 en `decisiones.md` y `docs/respuestas/` (Q-123 a Q-125).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
