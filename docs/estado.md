# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-22
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
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10; CO-I10, Iridium instalado, espera Q-256) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3 hecha el 2026-11-21; DI-I4 y el paso 8, más adelante) | en pausa |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va después de Paridad, D-166) | en pausa |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | en operación (con el hito 10; probada en Q-227, calidad el 2026-11-21) | hecho |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Paridad, Orden y Abrir, D-166; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (`modulos/abrir/estado.md`) | sección | 7. Construcción (AB-I1 a AB-I3 probadas; el paso 8 y la otra PC, T-87, después de Paridad y Orden, D-166) | en pausa |
| Paridad (`modulos/paridad/estado.md`) | sección | primera parte completa (PA-I1 a PA-I3 probadas, calidad el 2026-11-22); la segunda, Capacidades (T-28), después de T-114 (D-173) | en curso |

## En qué estamos ahora
**Diseño cerró DI-I3** (2026-11-21): las diecinueve tandas probadas y `DESIGN.md` y `06-ui.md` escritos desde lo construido. Q-240 pidió además que archivar no deje aviso y que el estado cambie en la tarjeta al instante: hecho y probado (Q-241, Q-242). Queda en pausa con DI-I4, el paso 8 y la extensión de la Revisión al negro (T-99).
**Ronda de UX 1 hecha** (2026-11-21, T-100) **y su tanda también**: el chat sin conversación ya no muestra un título cortado (T-101), Git con siluetas al leer (T-103), Acerca de con una frase (T-104), Este proyecto en palabras del usuario (T-106), `04-ux.md` al día con la app (T-107), la Bandeja vacía en su columna (T-108) y los avisos de la esquina medidos juntos (T-110), que encontró los botones de un aviso desarmados: arreglado. Probada en Q-248; el chat sin conversación ya dice «Nueva conversación». R-101: Mandar a la IA, desde Revisión, ahora cita el comentario en la conversación en vez de enviarlo; probado en Q-249. R-93: en la Bandeja, «Respondida, sin procesar» va en verde (T-85). Los `nueva` (T-102, T-105, T-109), en Ideas para aprobar.
**Ahora: Paridad** (D-165, D-166): definición aprobada (Q-244, D-167). La UX está aprobada (Q-247, D-168) y el diseño técnico, cerrado (D-169): tres iteraciones, PA-I1 (comandos), PA-I2 (archivos y fotos) y PA-I3 (texto pegado). La UI también (D-170). **PA-I1 hecha**: «/» abre la lista de comandos arriba del cuadro, elegir no manda, los usados hace poco van primero y un comando escondido (`/clear`, `/model`…) no se manda y dice dónde está eso en Iridium; probada en Q-250. **PA-I2 hecha y probada** (Q-251): archivos y fotos con el +, `Ctrl+U`, arrastrándolos o pegando una captura; el + ahora lleva un clip, como pediste. **T-111 (la otra PC en negro):** CO-I9 arregló el actualizador trabado y deja rastro de las fallas de la ventana; con Q-255 (A, D-171), **CO-I10**: Iridium se instala como una app (escritorio, menú Inicio, «Aplicaciones instaladas») y se actualiza solo bajando solo lo que cambió. Probado de punta a punta acá con instaladores de verdad; la otra PC lo instala una vez a mano (Q-256). **PA-I3 hecha**: un texto largo pegado queda como ficha «Texto pegado» que se lee en el visor, y `Ctrl+Z` lo vuelve texto; «Sobre la skill» y las citas son ahora fichas como los adjuntos. Probada en Q-258. **Primera parte de Paridad completa** (2026-11-22): la calidad encontró que un pegado de más de 1 MB no se guardaba ni se mandaba, sin aviso (ahora no entra y dice qué hacer), y que al cerrar el visor se perdía el foco: arreglados. Con Q-259 (A, D-173), antes de la segunda parte va **T-114, hecha** (D-172): la sincronía con GitHub empieza a los 2 s de abrir, el proyecto al que entrás pasa primero, y mandarle algo a la IA, Arranque y Commit esperan a que ese proyecto haya traído lo del remoto (lo escrito queda en el cuadro con «Poniéndose al día con GitHub…» y sale solo; sin conexión o pasados 15 s, sale igual y lo dice). Se prueba en Q-260. Después: Capacidades (T-28), Orden (paso 8), **Abrir** (paso 8 y T-87) y Plantillas.
**T-117 hecha** (D-174, 2026-11-22): las ideas terminadas que seguían como Aprobadas eran un olvido de la IA, no de Iridium; T-70 (Arranque) y T-96 (el + y los comandos) pasan a Hechas, el framework dice cuándo se cierra una idea y el control avisa si la IA se olvida.
**T-112 y T-113 pensadas juntas** (2026-11-22, sin construir): la IA trabajando sola en lo que no te necesita; la forma, en Q-261.
Ideas sin evaluar: T-76, T-78, T-89, T-97 («@» en el chat), T-93 (cómo lo usa alguien sin nociones técnicas; va con Plantillas, T-81), T-94 (pantallas a medida para partes de un hito), T-95 (plugins por proyecto) y T-99 (la extensión de la Revisión, al negro). Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-256 — Instalá Iridium en la otra PC con el instalador**
  Tipo: tarea · Frente: Compartir
  Contexto: CO-I10 (D-171), reemplaza a Q-254. Iridium pasa a ser una app instalada que se actualiza sola; los proyectos y los datos (`%APPDATA%\Centro de Desarrollo`) no se tocan. En la otra PC:
  - [ ] Cerrar Iridium (si quedó abierto en negro, desde el Administrador de tareas)
  - [ ] Bajar `Iridium-Setup-2026.1122.1004.exe` de la versión de arriba en github.com/LlanosLautaro/Iridium/releases
  - [ ] Abrirlo; si Windows dice «Windows protegió su PC»: Más información › Ejecutar de todas formas. Se instala solo y abre Iridium
  - [ ] Iridium abre normal, con los proyectos de siempre (o muestra «Iridium no pudo mostrar esta pantalla»: anotá el texto)
  - [ ] Hay un acceso «Iridium» en el escritorio y en el menú Inicio
  - [ ] Borrar la carpeta vieja de Iridium (la que tiene `win-unpacked`) y su acceso directo viejo
  - [ ] Si sigue en negro: dejar en Otro el archivo más nuevo de `%APPDATA%\Centro de Desarrollo\registros\`
- **Q-260 — Probá que mandar algo espera a GitHub**
  Tipo: prueba
  Contexto: T-114 (D-172). Con la app armada en esta PC (`scripts.md` › Armar la última versión). En la otra PC alcanza la versión que tiene: ahí se hace el cambio.
  - [ ] En la otra PC, responder una pregunta de un proyecto y, en Git, **Commit y subir**
  - [ ] En esta PC, abrir Iridium, entrar a ese proyecto y mandarle algo a la IA enseguida: lo escrito queda en el cuadro con «Poniéndose al día con GitHub…» un momento y sale solo (si ya se había puesto al día, sale enseguida)
  - [ ] La IA ve la respuesta que diste en la otra PC (y en Git, «Trajo 1 commit»)
  - [ ] El mensaje siguiente sale enseguida, sin esperar
  - [ ] Sin internet, un mensaje a un proyecto que no se miró sale igual, con una línea que dice que no se pudo conectar
- **Q-261 — ¿Cómo se arma el trabajo que la IA hace sola (T-112 y T-113)?**
  Tipo: decisión
  Contexto: `trabajo.md` › T-113 (lo pensado en el chat el 2026-11-22). Cualquiera de las tres se abre como frente nuevo, con su propuesta; propuesto: después de Capacidades (si lo querés antes, decilo en Otro).
  Opciones: A) Una fila con marca: la IA marca «puede seguir sola» en pendientes y pasos de la ruta de cada frente, vos lo ves y lo sacás si querés, y el Arranque, más activo, la va tomando de a una mientras haya cuota que se perdería (recomendada: decidís qué entra sin mover nada, y cada frente chico queda listo sin abrir diez a la vez) · B) Solo el Arranque más activo: va pasando por los proyectos con «Continúa con el proyecto» y la IA decide sola si su Próximo paso necesita de vos (más simple, pero no elegís en qué trabaja) · C) Un tablero de frentes en paralelo, varios en curso a la vez, que la IA mueve sola (se ve todo junto, pero repite el Kanban descartado en D-137 y suma ruido)

## Próximo paso
Empezar la segunda parte de Paridad, Capacidades (T-28): la definición (qué de los complementos de Claude Code, la PC y el navegador entra) y su investigación; con Q-260 respondida, cerrar T-114 o arreglar lo que falle; con Q-256, cerrar CO-I10 o leer el registro de la otra PC; con Q-261, anotar la decisión y ubicar el frente nuevo del trabajo sin vos (T-112, T-113) en la fila.
**Leer antes:** `modulos/paridad/estado.md` › Próximo paso; para Q-256, `modulos/compartir/estado.md` › CO-I10.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
