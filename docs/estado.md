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
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10; CO-I8, las piezas de cada versión, probada en Q-225) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3 hecha el 2026-11-21; DI-I4 y el paso 8, más adelante) | en pausa |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va después de Paridad, D-166) | en pausa |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | en operación (con el hito 10; probada en Q-227, calidad el 2026-11-21) | hecho |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Paridad, Orden y Abrir, D-166; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (`modulos/abrir/estado.md`) | sección | 7. Construcción (AB-I1 a AB-I3 probadas; el paso 8 y la otra PC, T-87, después de Paridad y Orden, D-166) | en pausa |
| Paridad (`modulos/paridad/estado.md`) | sección | 7. Construcción (PA-I1 probada en Q-250; PA-I2 hecha, prueba en Q-251; sigue PA-I3) | en curso |

## En qué estamos ahora
**Diseño cerró DI-I3** (2026-11-21): las diecinueve tandas probadas y `DESIGN.md` y `06-ui.md` escritos desde lo construido. Q-240 pidió además que archivar no deje aviso y que el estado cambie en la tarjeta al instante: hecho y probado (Q-241, Q-242). Queda en pausa con DI-I4, el paso 8 y la extensión de la Revisión al negro (T-99).
**Ronda de UX 1 hecha** (2026-11-21, T-100) **y su tanda también**: el chat sin conversación ya no muestra un título cortado (T-101), Git con siluetas al leer (T-103), Acerca de con una frase (T-104), Este proyecto en palabras del usuario (T-106), `04-ux.md` al día con la app (T-107), la Bandeja vacía en su columna (T-108) y los avisos de la esquina medidos juntos (T-110), que encontró los botones de un aviso desarmados: arreglado. Probada en Q-248; el chat sin conversación ya dice «Nueva conversación». R-101: Mandar a la IA, desde Revisión, ahora cita el comentario en la conversación en vez de enviarlo; probado en Q-249. R-93: en la Bandeja, «Respondida, sin procesar» va en verde (T-85). Los `nueva` (T-102, T-105, T-109), en Ideas para aprobar.
**Ahora: Paridad** (D-165, D-166): definición aprobada (Q-244, D-167). La UX está aprobada (Q-247, D-168) y el diseño técnico, cerrado (D-169): tres iteraciones, PA-I1 (comandos), PA-I2 (archivos y fotos) y PA-I3 (texto pegado). La UI también (D-170). **PA-I1 hecha**: «/» abre la lista de comandos arriba del cuadro, elegir no manda, los usados hace poco van primero y un comando escondido (`/clear`, `/model`…) no se manda y dice dónde está eso en Iridium; probada en Q-250. **PA-I2 hecha** (2026-11-22): archivos y fotos con el +, `Ctrl+U`, arrastrándolos o pegando una captura; van como fichas arriba del cuadro, no se pierden al cerrar y quedan en el mensaje mandado; probado también con el Claude Code real. Tu prueba, Q-251. PA-I3 (el texto largo pegado) espera: **T-111 pasa primero** (lo pediste como prioridad número 1). **Hecho el 2026-11-22 (CO-I9):** la versión publicada abre bien acá, así que la ventana negra depende de esa PC; encontré y arreglé que desde CO-I8 una copia compartida no puede bajar ninguna versión (se traba con el archivo de la app, `app.asar`), y ahora una falla de la ventana queda en el registro del día y muestra «Iridium no pudo mostrar esta pantalla» con Volver a cargar en vez de quedar en negro. La otra PC tiene que instalar a mano una vez la versión con el arreglo (Q-254); el instalador con actualizaciones, en Q-255. Después de Paridad, Orden mide la calidad, **Abrir** hace su paso 8 y la otra PC (T-87) y sigue Plantillas (D-166).
Ideas sin evaluar: T-112 (dejar tareas en cola), T-113 (que el arranque vaya atacando pendientes mientras haya cuota), T-114 (esperar a que cada proyecto esté sincronizado al abrir), T-115 (es de otro proyecto tuyo: Q-253), T-76, T-78, T-89, T-97 («@» en el chat), T-93 (cómo lo usa alguien sin nociones técnicas; va con Plantillas, T-81), T-94 (pantallas a medida para partes de un hito), T-95 (plugins por proyecto) y T-99 (la extensión de la Revisión, al negro). Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-251 — Probá los archivos y las fotos en el chat**
  Tipo: prueba · Frente: Paridad
  Contexto: PA-I2. Con la app armada (`scripts.md` › Armar la última versión) o en modo desarrollo, en el chat de un proyecto:
  - [ ] El + del pie tiene «Agregar archivos o fotos» (y `Ctrl+U` en el cuadro): abre el selector de Windows y se pueden elegir varios; cada uno queda como ficha arriba del cuadro (la foto como miniatura, el archivo con su nombre)
  - [ ] Arrastrar archivos desde el explorador sobre la conversación la marca con un borde punteado y «Suelta para adjuntar»; al soltarlos se suman
  - [ ] Una captura copiada (`Win+Shift+S`) y pegada con `Ctrl+V` en el cuadro queda como foto
  - [ ] Un clic en una foto la abre grande; `Esc` la cierra. La ✕ de una ficha la saca
  - [ ] Cambiar de proyecto o cerrar Iridium no pierde las fichas
  - [ ] Al mandar, la IA ve la foto y abre el archivo; en tu mensaje quedan las fichas arriba de lo escrito, y siguen al reabrir la conversación desde ◔
  - [ ] Un clic en un archivo de un mensaje mandado lo abre (si es del proyecto, en Archivos)
- **Q-254 — Instalá a mano la versión nueva en la otra PC**
  Tipo: tarea · Frente: Compartir
  Contexto: T-111, `modulos/compartir/estado.md` › CO-I9. La versión que tiene esa PC no puede actualizarse sola (el arreglo es justamente eso), así que va una vez a mano; los proyectos y los datos (`%APPDATA%\Centro de Desarrollo`) no se tocan. En la otra PC:
  - [ ] Cerrar Iridium (si quedó abierto en negro, desde el Administrador de tareas)
  - [ ] Bajar el `.zip` de la última versión de github.com/LlanosLautaro/Iridium/releases (la de arriba, «Iridium · 22/11/2026 · a2b8991»: el archivo `Iridium-a2b8991.zip`, no la «.pieza»)
  - [ ] Cambiarle el nombre a la carpeta de Iridium de esa PC (por ejemplo, «Iridium viejo») y descomprimir el `.zip` en su lugar, con la misma carpeta `win-unpacked` adentro
  - [ ] Abrir `win-unpacked\Iridium.exe`: abre normal, o muestra «Iridium no pudo mostrar esta pantalla» (anotá el texto del recuadro)
  - [ ] Si sigue en negro o muestra ese mensaje: dejar en Otro el archivo más nuevo de `%APPDATA%\Centro de Desarrollo\registros\` (ahora anota lo que le pasa a la ventana)
- **Q-255 — ¿Iridium pasa a instalarse como una app, con su actualizador?**
  Tipo: decisión · Frente: Compartir
  Contexto: `ideas/T-111.md` (preferís una app instalada antes que la carpeta suelta). Hoy la otra PC usa la carpeta `win-unpacked` y un actualizador hecho para Iridium, que es lo que se trabó. Con un instalador de Windows (electron-builder lo arma) Iridium queda en el menú Inicio y en «Aplicaciones instaladas», con su desinstalador. Sin una firma de código paga, la primera vez Windows avisa «Windows protegió su PC» (Más información › Ejecutar de todas formas). Tu PC puede seguir armando desde el código como hoy.
  Opciones: A) Instalador y su actualizador estándar (electron-updater, desde las mismas versiones de GitHub): baja solo lo que cambió y reemplaza el actualizador propio y su ayudante (recomendada: es lo que usan casi todas las apps de Electron, probado por miles; menos código propio que se pueda trabar) · B) Instalador solo para instalar, y seguir con el actualizador propio ya arreglado (menos cambio ahora; el actualizador sigue siendo nuestro) · C) Seguir con la carpeta suelta y el arreglo (nada nuevo; no queda instalada)
- **Q-253 — T-115 habla de otro proyecto tuyo: ¿la paso allá?**
  Tipo: decisión · Frente: Orden
  Contexto: la idea T-115 (`trabajo.md`) pide armar algo en otro de tus proyectos, y el repo de Iridium no nombra tus otros proyectos (D-082). Desde acá no toco otros proyectos sin que lo pidas.
  Opciones: A) Pasarla al `trabajo.md` de ese proyecto y sacarla de acá (recomendada: queda donde se va a hacer y el repo no lo nombra) · B) Dejarla acá como idea de Iridium, reescrita sin el nombre (si lo que querés es un canal dentro de Iridium) · C) Dejarla como está

## Próximo paso
T-111: con Q-255 respondida, armar el instalador (A o B) como CO-I10 en `modulos/compartir/` (diseño técnico corto y después la construcción); con Q-254, ver qué dice la otra PC y arreglar la causa de la ventana negra si aparece. Mientras Q-255 no esté, sigue PA-I3 (`modulos/paridad/estado.md` › Próximo paso).
**Leer antes:** `modulos/compartir/estado.md` › CO-I9 y, si va el instalador, `05-arquitectura.md` › Despliegue.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
