# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-23
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
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10; CO-I10, Iridium instalado, espera Q-270) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3 hecha el 2026-11-21; DI-I4 y el paso 8, más adelante) | en pausa |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va después de Paridad, D-166) | en pausa |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | en operación (con el hito 10; probada en Q-227, calidad el 2026-11-21) | hecho |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Paridad, Orden y Abrir, D-166; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (`modulos/abrir/estado.md`) | sección | 7. Construcción (AB-I1 a AB-I3 probadas; el paso 8 y la otra PC, T-87, después de Paridad y Orden, D-166) | en pausa |
| Paridad (`modulos/paridad/estado.md`) | sección | primera parte completa (PA-I1 a PA-I3 probadas, calidad el 2026-11-22); la segunda, Capacidades (T-28), después de Frentes (D-175) | en pausa |
| Frentes (`modulos/frentes/estado.md`) | sección | en operación (con el hito 10; el avance solo, probado una noche en Q-264) | hecho |

## En qué estamos ahora
**Ronda de UX 1 hecha** (2026-11-21, T-100) **y su tanda también**: el chat sin conversación ya no muestra un título cortado (T-101), Git con siluetas al leer (T-103), Acerca de con una frase (T-104), Este proyecto en palabras del usuario (T-106), `04-ux.md` al día con la app (T-107), la Bandeja vacía en su columna (T-108) y los avisos de la esquina medidos juntos (T-110), que encontró los botones de un aviso desarmados: arreglado. Probada en Q-248; el chat sin conversación ya dice «Nueva conversación». R-101: Mandar a la IA, desde Revisión, ahora cita el comentario en la conversación en vez de enviarlo; probado en Q-249. R-93: en la Bandeja, «Respondida, sin procesar» va en verde (T-85). Los `nueva` (T-102, T-105, T-109), en Ideas para aprobar.
**Paridad** (D-165, D-166, en pausa por Frentes): definición aprobada (Q-244, D-167). La UX está aprobada (Q-247, D-168) y el diseño técnico, cerrado (D-169): tres iteraciones, PA-I1 (comandos), PA-I2 (archivos y fotos) y PA-I3 (texto pegado). La UI también (D-170). **PA-I1 hecha**: «/» abre la lista de comandos arriba del cuadro, elegir no manda, los usados hace poco van primero y un comando escondido (`/clear`, `/model`…) no se manda y dice dónde está eso en Iridium; probada en Q-250. **PA-I2 hecha y probada** (Q-251): archivos y fotos con el +, `Ctrl+U`, arrastrándolos o pegando una captura; el + ahora lleva un clip, como pediste. **T-111 (la otra PC en negro):** CO-I9 arregló el actualizador trabado y deja rastro de las fallas de la ventana; con Q-255 (A, D-171), **CO-I10**: Iridium se instala como una app (escritorio, menú Inicio, «Aplicaciones instaladas») y se actualiza solo bajando solo lo que cambió. Probado de punta a punta acá con instaladores de verdad; la otra PC lo instala una vez a mano (Q-270). **PA-I3 hecha**: un texto largo pegado queda como ficha «Texto pegado» que se lee en el visor, y `Ctrl+Z` lo vuelve texto; «Sobre la skill» y las citas son ahora fichas como los adjuntos. Probada en Q-258. **Primera parte de Paridad completa** (2026-11-22): la calidad encontró que un pegado de más de 1 MB no se guardaba ni se mandaba, sin aviso (ahora no entra y dice qué hacer), y que al cerrar el visor se perdía el foco: arreglados. Con Q-259 (A, D-173), antes de la segunda parte va **T-114, hecha** (D-172): la sincronía con GitHub empieza a los 2 s de abrir, el proyecto al que entrás pasa primero, y mandarle algo a la IA, Arranque y Commit esperan a que ese proyecto haya traído lo del remoto (lo escrito queda en el cuadro con «Poniéndose al día con GitHub…» y sale solo; sin conexión o pasados 15 s, sale igual y lo dice). Probada en Q-260. Después: Capacidades (T-28), Orden (paso 8), **Abrir** (paso 8 y T-87) y Plantillas.
**T-117 hecha** (D-174, 2026-11-22): las ideas terminadas que seguían como Aprobadas eran un olvido de la IA, no de Iridium; T-70 (Arranque) y T-96 (el + y los comandos) pasan a Hechas, el framework dice cuándo se cierra una idea y el control avisa si la IA se olvida.
**Frentes** (Q-262, D-175), antes de Capacidades: la IA avanza sola por tamaño (chico, mediano, grande) mientras haya cuota, con interruptores por proyecto y por frente; después, el Mapa pasa a ser Frentes (tarjetas a la izquierda, el mapa de tareas al centro). Definición aprobada (Q-263, D-176): la Bandeja primero, después lo chico más viejo, después el frente en curso. UX (D-177) y diseño técnico (D-178) escritos; **FS-I1 hecha**: la IA marca en la ruta el tamaño y `sola` (el Mapa lo muestra y el control avisa si está mal escrito), Ajustes › IA › Avance solo con sus condiciones, y se apaga por proyecto (Ajustes › Este proyecto) o por frente (en el Mapa). **FS-I2 hecha** (2026-11-22): con Iridium sin usar, el motor toma de a un paso (primero tus respuestas, después lo chico más viejo, después el frente en curso), sin pisarse con nadie ni repetir lo que no pudo terminar; la conversación dice «para avanzar sola» y «Mientras no estabas», «avanzó «…» · terminó». Detalles en D-179; se prueba una noche en Q-264. **Parte 2, dibujada** (D-180): a la izquierda una tarjeta por frente (el nombre, el paso que sigue, las preguntas en ámbar y el robot si avanza sola), el Núcleo como uno más, y al centro las preguntas del frente arriba y sus tareas; A y B no convencieron (Q-265) y se dibujaron C, D y E; vistas las cinco, elegiste la **B** (Q-266, D-181). **FS-I3 hecha** (2026-11-22): el Mapa pasa a ser **Frentes**, con una tarjeta por frente a la izquierda (lo que sigue, el robot si la IA avanza sola, «apagada», las preguntas en ámbar), el Núcleo, «Por empezar» y los archivados, y al centro el frente con su interruptor, sus preguntas y su camino con el código, el tamaño y «sola» de cada paso. **Probado en Q-267**; el robot, que necesita el avance solo prendido, se mira con Q-264. **Revisión R-102 a R-105** (2026-11-22): las pestañas de proyectos se ordenan arrastrándolas, el ícono de la Bandeja lleva un punto si algo espera (ámbar si frena), en la Bandeja la más nueva va arriba y todas abiertas salvo las que plegaste (se recuerda), y en Frentes las preguntas se responden ahí mismo; probado en Q-268. T-118 (un MCP de Iridium) y T-120 (comandos de Iridium como `/consulta`), nuevas. **T-119 hecha** (2026-11-23): el Claude Notifier, ya desinstalado de VS Code, había dejado sus avisos en la configuración de Claude y seguían sonando; borrados del todo. **T-52 hecha** (D-183): Iridium suena una vez cuando la IA terminó de verdad (después de las pruebas de fondo y del control), sin avisos de Windows; Ajustes › Notificaciones lo apaga, elige entre cuatro sonidos y decide si suena con el avance solo. Probado en Q-271. **T-121 hecha** (Q-269, D-182, 2026-11-23): las versiones se numeran 1.0.x (el último número sube solo con cada commit, el del medio al cerrar un frente, el primero con tu ok) y Acerca de muestra el número sin el código; publicada `v1.0.0`, la que instala la otra PC (Q-270, en lugar de Q-256). **La calidad del motor, hecha** (2026-11-23, la tomó el avance solo): sin nada para tomar, el motor releía el uso cada minuto abriendo Claude Code cada vez (unas 60 por hora toda la noche); arreglado, con ocho casos raros nuevos en las pruebas. **La del tablero, también** (2026-11-23, el avance solo): el robot de una tarjeta ya no promete pasos que el motor no toma (sin tamaño o de un tamaño que Ajustes no deja), un frente de carpeta `nucleo` ya no se pisa con el Núcleo, y el lector de pantalla oye lo que dice cada tarjeta. **Frentes, completo** (2026-11-23): la primera noche el avance solo tomó esos dos pasos, los terminó (10 % del período cada uno), lo contó al volver y no pasó el tope de la semana (Q-264, T-113 hecha). Queda T-122 (avisar si los tamaños no coinciden con lo gastado, con más noches). **Consolas adentro** (T-116, Q-272, D-184): un panel abajo, plegado, con pestañas como VS Code y «▶ corriendo» en la barra; Scripts deja de abrir ventanas. Va después de la ronda y antes de Capacidades, probando primero que la pieza nativa arme. **R-106** (2026-11-23): mientras usás Iridium, el aviso «terminó» se va a los 4 s (con preguntas o una falla, a los 5 s, Q-273); con la ventana en segundo plano espera a que vuelvas; probado. **T-124 hecha**: el sonido que se oyó con la IA trabajando venía de las Iridium escondidas que abren las pruebas; ahora están mudas; probado en Q-274. **Ronda de UX 2 hecha** (2026-11-23, T-123): `04-ux.md` puesto al día (ya no nombra el Mapa ni la sección Trabajo), y en Frentes la cuenta de preguntas va en ámbar solo si alguna frena (T-125, probado en Q-275), «Por empezar» ya no se aplasta con la ventana angosta y un frente sin nada aprobado lo dice en palabras. T-126 (un título corto para tus ideas al evaluarlas), en Ideas para aprobar. **Las consolas adentro** (T-116): la pieza nativa de VS Code arma con Iridium (S-6); la propuesta, aprobada en Q-276 con Armar y Volver adentro (D-185). **I-9 hecha**: Scripts, Ejecutar, Armar ahora e Iniciar sesión corren en un panel abajo de la sección, con pestañas, Detener, Limpiar, plegar y «▶ N corriendo» en la barra; al cerrar Iridium no queda nada corriendo; probado también en la versión instalada y en la actualizada encima; probado en Q-277. **T-127 hecha**: al actualizar corrían dos ayudantes a la vez y cada uno abría una Iridium; ahora corren de a uno y nunca abren una segunda. Con Q-278 (A, D-186), al actualizar se verá una ventanita «Actualizando Iridium…» con su barra (T-128). **I-10 hecha**: el panel de las consolas se agranda arrastrando su borde (y lo recuerda), `Ctrl+ñ` lo pliega y lo abre, cerrar con una consola corriendo pregunta, Actualizar solo no reinicia mientras una corre, y el armado lleva solo la parte de Windows de la consola (de 9,9 a 3,8 MB); probado también con instaladores de verdad. Se prueba en Q-279.
Ideas sin evaluar: T-76, T-78, T-89, T-97 («@» en el chat), T-93 (cómo lo usa alguien sin nociones técnicas; va con Plantillas, T-81), T-94 (pantallas a medida para partes de un hito), T-95 (plugins por proyecto) y T-99 (la extensión de la Revisión, al negro). Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-279 — Probá lo que completa las consolas (I-10)**
  Tipo: prueba
  Contexto: `cambios/consolas.md` › Log y `04-ux.md` › W-18. Después de Actualizar, en Scripts de Iridium:
  - [ ] Actualizar (abajo): Iridium vuelve a abrir normal y queda una sola Iridium abierta (T-127)
  - [ ] Ejecutar un script y apretar `Ctrl+ñ`: el panel se pliega; otra vez, vuelve
  - [ ] Arrastrar el borde de arriba del panel: cambia el alto, y al cerrar y volver a abrir Iridium queda igual
  - [ ] Con «Abrir en modo desarrollo» corriendo, cerrar Iridium con la X: pregunta «1 consola corriendo»; Cancelar lo deja abierto
  - [ ] Cerrar igual: Iridium se cierra y también la de desarrollo
- **Q-270 — Instalá Iridium 1.0.0 en la otra PC con el instalador**
  Tipo: tarea · Frente: Compartir
  Contexto: CO-I10 (D-171), reemplaza a Q-256: ahora con el número nuevo (D-182), así se actualiza sola de acá en adelante. Iridium pasa a ser una app instalada; los proyectos y los datos (`%APPDATA%\Centro de Desarrollo`) no se tocan. Si ya instalaste la `2026.1122.1004`, instalá esta encima igual. En la otra PC:
  - [ ] Cerrar Iridium (si quedó abierto en negro, desde el Administrador de tareas)
  - [ ] Bajar `Iridium-Setup-1.0.0.exe` de la versión `v1.0.0` (la de arriba) en github.com/LlanosLautaro/Iridium/releases
  - [ ] Abrirlo; si Windows dice «Windows protegió su PC»: Más información › Ejecutar de todas formas. Se instala solo y abre Iridium
  - [ ] Iridium abre normal, con los proyectos de siempre (o muestra «Iridium no pudo mostrar esta pantalla»: anotá el texto)
  - [ ] Hay un acceso «Iridium» en el escritorio y en el menú Inicio
  - [ ] Borrar la carpeta vieja de Iridium (la que tiene `win-unpacked`) y su acceso directo viejo
  - [ ] Si sigue en negro: dejar en Otro el archivo más nuevo de `%APPDATA%\Centro de Desarrollo\registros\`

## Próximo paso
Construir T-128 (D-186): la ventanita «Actualizando Iridium…» con su barra mientras se cambia la versión, en la app de uso diario (el ayudante `tools/cambiar-version.ps1`) y en las copias instaladas (el instalador de electron-updater); primero ver qué muestra cada uno hoy y proponer cómo se ve, con su maqueta si hace falta. Con Q-279, cerrar las consolas (T-116 a hecho, `cambios/consolas.md` terminado). Con Q-270, cerrar CO-I10 o leer el registro de la otra PC. Después, Capacidades (T-28).
**Leer antes:** `trabajo.md` › T-128; `decisiones.md` › D-186; `tools/cambiar-version.ps1`, `src/main/infra/version-nueva.ts` y `src/main/infra/actualizador.ts`; `respuestas/Q-279.md` (si llegó).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
