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
| Paridad (`modulos/paridad/estado.md`) | sección | primera parte completa (PA-I1 a PA-I3 probadas, calidad el 2026-11-22); la segunda, Capacidades (T-28), espera Q-259 | en curso |

## En qué estamos ahora
**Diseño cerró DI-I3** (2026-11-21): las diecinueve tandas probadas y `DESIGN.md` y `06-ui.md` escritos desde lo construido. Q-240 pidió además que archivar no deje aviso y que el estado cambie en la tarjeta al instante: hecho y probado (Q-241, Q-242). Queda en pausa con DI-I4, el paso 8 y la extensión de la Revisión al negro (T-99).
**Ronda de UX 1 hecha** (2026-11-21, T-100) **y su tanda también**: el chat sin conversación ya no muestra un título cortado (T-101), Git con siluetas al leer (T-103), Acerca de con una frase (T-104), Este proyecto en palabras del usuario (T-106), `04-ux.md` al día con la app (T-107), la Bandeja vacía en su columna (T-108) y los avisos de la esquina medidos juntos (T-110), que encontró los botones de un aviso desarmados: arreglado. Probada en Q-248; el chat sin conversación ya dice «Nueva conversación». R-101: Mandar a la IA, desde Revisión, ahora cita el comentario en la conversación en vez de enviarlo; probado en Q-249. R-93: en la Bandeja, «Respondida, sin procesar» va en verde (T-85). Los `nueva` (T-102, T-105, T-109), en Ideas para aprobar.
**Ahora: Paridad** (D-165, D-166): definición aprobada (Q-244, D-167). La UX está aprobada (Q-247, D-168) y el diseño técnico, cerrado (D-169): tres iteraciones, PA-I1 (comandos), PA-I2 (archivos y fotos) y PA-I3 (texto pegado). La UI también (D-170). **PA-I1 hecha**: «/» abre la lista de comandos arriba del cuadro, elegir no manda, los usados hace poco van primero y un comando escondido (`/clear`, `/model`…) no se manda y dice dónde está eso en Iridium; probada en Q-250. **PA-I2 hecha y probada** (Q-251): archivos y fotos con el +, `Ctrl+U`, arrastrándolos o pegando una captura; el + ahora lleva un clip, como pediste. **T-111 (la otra PC en negro):** CO-I9 arregló el actualizador trabado y deja rastro de las fallas de la ventana; con Q-255 (A, D-171), **CO-I10**: Iridium se instala como una app (escritorio, menú Inicio, «Aplicaciones instaladas») y se actualiza solo bajando solo lo que cambió. Probado de punta a punta acá con instaladores de verdad; la otra PC lo instala una vez a mano (Q-256). **PA-I3 hecha**: un texto largo pegado queda como ficha «Texto pegado» que se lee en el visor, y `Ctrl+Z` lo vuelve texto; «Sobre la skill» y las citas son ahora fichas como los adjuntos. Probada en Q-258. **Primera parte de Paridad completa** (2026-11-22): la calidad encontró que un pegado de más de 1 MB no se guardaba ni se mandaba, sin aviso (ahora no entra y dice qué hacer), y que al cerrar el visor se perdía el foco: arreglados. Queda la segunda parte, Capacidades (T-28); cuándo, en Q-259. Después de Paridad, Orden mide la calidad, **Abrir** hace su paso 8 y la otra PC (T-87) y sigue Plantillas (D-166). T-114 (con Q-257, D-172): lo que cambia archivos espera a que su proyecto esté al día con GitHub; va después de Paridad.
Ideas sin evaluar: T-112 (dejar tareas en cola), T-113 (que el arranque vaya atacando pendientes mientras haya cuota), T-76, T-78, T-89, T-97 («@» en el chat), T-93 (cómo lo usa alguien sin nociones técnicas; va con Plantillas, T-81), T-94 (pantallas a medida para partes de un hito), T-95 (plugins por proyecto) y T-99 (la extensión de la Revisión, al negro). Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

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
- **Q-259 — ¿Cuándo va la segunda parte de Paridad, Capacidades?**
  Tipo: decisión · Frente: Paridad
  Contexto: la primera parte (comandos, adjuntos, fotos y texto pegado) está completa. D-166 dejó Capacidades (T-28: los complementos de Claude Code, usar la PC y el navegador desde las sesiones) como segunda parte; después siguen Orden (paso 8), Abrir (paso 8 y la otra PC) y Plantillas. T-114 (esperar a estar al día con GitHub antes de cambiar archivos, D-172) quedó para después de Paridad.
  Opciones: A) Primero T-114, después Capacidades (recomendada: T-114 es corta y, con Iridium instalado en la otra PC, evita que las dos trabajen sobre archivos distintos; Capacidades es larga, con su definición e investigación) · B) Capacidades ahora, como dice D-166 (T-114 espera a que termine todo Paridad) · C) Capacidades al final de la fila, después de Orden, Abrir y Plantillas (Paridad queda en pausa con la primera parte y T-114 va ahora)

## Próximo paso
Con Q-259 respondida, seguir lo elegido: T-114 (`trabajo.md` › T-114 y D-172) o la definición de Capacidades (`modulos/paridad/estado.md` › Próximo paso); con Q-256 respondida, cerrar CO-I10 o, si la otra PC sigue en negro, leer su registro y arreglar la causa.
**Leer antes:** para T-114, `trabajo.md` › T-114 y D-172; para Capacidades, `modulos/paridad/estado.md` › Próximo paso; para Q-256, `modulos/compartir/estado.md` › CO-I10.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
