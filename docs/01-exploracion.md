# Exploración

**Fecha:** 2026-10-21 al 2026-10-22 (completo)

Por el plan propio (`plan-desarrollo.md` › Qué cambia en cada hito), la exploración se hace **por área**. Cada área termina con una conclusión: alcanza lo que existe, se adapta, o vale construirlo.

| Área | Estado |
|---|---|
| Puente PC–celular | hecho, cerrada: LocalSend + envío automático (D-005) |
| Motor y marco | hecho, cerrada: app propia (D-006) con el Agent SDK aislado en un solo lugar (D-007) |
| Proyectos y plan | hecho, cerrada: gráfico de fases y pasos leído de `docs/`, sin kanban ni canvas (D-008) |
| Pendientes del usuario | hecho, cerrada: bandeja propia, `Q-n` con tipo y si frena, cinco tipos (D-010) |
| Diseño | hecho, cerrada: lienzo y biblioteca propios sobre `DESIGN.md`, armados con lo que ya existe (D-011) |
| Revisión de la app | hecho, cerrada: extensión del navegador para apps web, comentarios en archivos planos (D-012) |
| Repaso de lo propio | hecho, cerrado: guía de hitos (D-009), Gestor solo con mantenimiento (D-013), skills locales donde la licencia lo permite (D-014) |

## Área: Puente PC–celular

Lo que se le pide (`00-idea.md`, idea 8 y escena "Al celular"): que un APK que termina la IA en la PC aparezca en el celular para instalarlo, y mandar archivos y textos en los dos sentidos. Y que después lo usen otro proyecto y otra app (D-003).

### Alternativas existentes
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|
| LocalSend | Manda archivos y textos entre dispositivos de la misma red, sin cuenta ni nube | Windows, Android, Mac, Linux, iOS | Libre y gratis | Simple y rápido. Desde la 1.18 (ago. 2026) tiene **versión de línea de comandos**: la IA podría mandar el APK sola. Acepta solo lo que viene de dispositivos favoritos. "Recibir por enlace": se sube desde el navegador sin tener la app | Solo en la misma red (o VPN). No instala: el APK llega y hay que tocarlo. No hay notificaciones ni portapapeles compartido | Activo |
| KDE Connect | Enlaza celular y PC: archivos, portapapeles compartido, notificaciones del celular en la PC, control de medios, comandos remotos | Windows, Linux, Android (Mac e iOS más limitados) | Libre y gratis | El más completo: portapapeles y notificaciones en los dos sentidos. Comandos que el celular dispara en la PC | En Windows es menos pulido que en Linux. Misma red. No tiene una vía documentada para que un programa (la IA) le mande archivos | Activo (Windows 26.04, jul. 2026) |
| Taildrop (Tailscale) | Manda archivos entre tus dispositivos de tu red Tailscale, **desde cualquier lugar** | Todas | Gratis para uso personal | Funciona fuera de casa. En la PC tiene línea de comandos. Tailscale ya estaba en los planes de otro proyecto | Sigue en alfa. En Android solo se manda desde el menú Compartir, no se puede automatizar. Depende de un servicio de terceros | Activo (alfa) |
| Syncthing (Syncthing-Fork en Android) | Sincroniza carpetas entre dispositivos | Todas | Libre y gratis | "Dejo el APK en una carpeta y aparece en el celular", sin tocar nada | Pensado para sincronizar, no para mandar cosas sueltas. La app oficial de Android se abandonó; el reemplazo (Fork) se mantiene pero su futuro en Google Play es incierto | Activo con dudas |
| ADB por Wi-Fi | La herramienta de desarrollo de Android: **instala el APK directo** desde la PC | Android 11+ y la PC | Gratis (de Google) | El único que instala sin pasos en el celular. Es lo que ya usan las herramientas de desarrollo | Hay que activar opciones de desarrollador y emparejar; la conexión se cae a menudo (cambia el puerto, el celular se duerme). Solo instala; no sirve para archivos sueltos ni para mandar del celular a la PC | Activo |
| Enlace Móvil (Phone Link) | La app de Microsoft: archivos, portapapeles, notificaciones, llamadas | Windows + Android | Gratis | Viene con Windows. Portapapeles compartido desde dic. 2025 | Cerrado, no se puede automatizar. Funciones desparejas según el celular | Activo |
| Obtainium | App de Android que vigila páginas de versiones (GitHub, enlace directo a un APK) y avisa e instala actualizaciones | Android | Libre y gratis | Resuelve "hay una versión nueva de mi app, instalala" sin la PC prendida, si el APK se publica en algún lado | Necesita que el APK esté publicado (GitHub u otro). No sirve para archivos sueltos | Activo |
| ntfy | Notificaciones push propias: la PC manda un aviso (con adjunto) y llega al celular | Android, iOS, web | Libre; servidor propio o el público gratis | Muy fácil de automatizar: la IA avisa "terminó el APK" con un enlace | Solo avisos; los adjuntos piden configurar almacenamiento | Activo |

### Un cambio de Android que afecta al puente
Google exige desde 2026 que las apps instaladas fuera de Play vengan de un **desarrollador verificado**. Se aplica primero en cuatro países (Brasil, Indonesia, Singapur, Tailandia, desde el 30-09-2026) y en el resto del mundo desde 2027. Para los propios APK hay salidas: instalar por **ADB sigue permitido** sin registrarse, existe un "flujo avanzado" en el celular, y hay una **cuenta gratis para aficionados** (hasta 20 dispositivos). Hay que confirmarlo en el hito 3, porque las fuentes no coinciden en los detalles.

### Soluciones sin construir nada
Una combinación ya cubre casi toda la escena:
- **APK al celular:** LocalSend por línea de comandos (la IA lo manda y en el celular se toca "instalar") o ADB por Wi-Fi (se instala solo, pero la conexión es frágil).
- **Archivos y textos en los dos sentidos:** LocalSend o KDE Connect.
- **Fuera de casa:** Tailscale debajo de cualquiera de los anteriores.

Lo que **no** cubre ninguna: que el puente sea una pieza que **otros proyectos y la IA usen** (otro proyecto, otra app, el Centro) con una sola forma de hacerlo; que el envío quede registrado en el proyecto ("este APK es de la I-4 de otra app"), y una bandeja en el celular con lo que llegó de cada proyecto.

### Conclusión
**Adaptar: LocalSend tal cual, más un envío automático desde la PC** (D-005). El usuario ya usa LocalSend y le alcanza (Q-5); no necesita que el APK se instale solo, solo que llegue sin mandarlo a mano (Q-6). Lo único a construir es que la IA o un proyecto manden un archivo al celular por la línea de comandos de LocalSend. Deja de ser un módulo.

## Área: Motor y marco

Lo que se le pide (`00-idea.md`, ideas 1 y 7): una app propia que use Claude Code por debajo, con la gestión pensada para una persona que dirige, y skills locales compartidas entre todos los proyectos.

Se separan dos cosas: el **motor** (quién hace el trabajo: Claude Code) y el **marco** (la ventana donde el usuario dirige: ve proyectos, conversa, revisa).

### Alternativas existentes
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|
| Claude Code Desktop (pestaña Code) | La app oficial: sesiones en paralelo, cada una aislada; paneles movibles (chat, cambios, navegador, terminal, plan, tareas); vista previa de la app con capturas; comentarios sobre los cambios; mandar tareas desde el celular (Dispatch) y avisos al celular | Windows, Mac, Linux (beta) | Incluida en la suscripción | Oficial: mejora cada mes y siempre está al día con Claude Code. Ya cubre buena parte de "supervisar a la IA". Skills, conectores y plugins se instalan desde ahí | Organiza por **sesiones**, no por proyectos con un plan: no sabe de hitos, preguntas `Q-n` ni estado. Los "proyectos" que tiene son de sesiones en la nube | Activo |
| Mods de Claude Code (desde oct. 2026) | Plugins que agregan interfaz propia dentro de Claude Code: un panel al lado del chat que se mantiene visible, bandas, avisos | Terminal y Claude Code Desktop | Incluido | Permite poner vistas propias (estado del proyecto, preguntas pendientes) **al lado de la conversación**, sin hacer una app aparte | Muy nuevo (fuentes secundarias). **No se ven en la extensión de VS Code**, que es donde trabaja hoy el usuario | Nuevo |
| Extensión de Claude Code para VS Code | Lo que usa hoy el usuario: chat al costado del editor | Windows, Mac, Linux | Incluida | Convive con el gestor anterior y su visor | No muestra mods. La gestión vive en otra extensión | Activo |
| opcode (antes Claudia) | Interfaz de escritorio para Claude Code: sesiones, agentes propios, uso y consumo | Windows, Mac, Linux | Libre (AGPL), gratis | La más popular de las libres | Hay que compilarla. Pensada para sesiones y agentes, no para dirigir proyectos. Su ritmo de mantenimiento no está claro | Dudoso |
| Nimbalyst | Escritorio para Claude Code con tablero kanban de sesiones y aislamiento por sesión | Windows, Mac, Linux | Libre (MIT) | Tablero de sesiones; cerca de la idea de "ver todo en un lugar" | Información mayormente del propio fabricante | Activo |
| Conductor | Varios agentes en paralelo, cada uno en su copia del proyecto, revisados desde un lugar | Mac | Cerrado, gratis | Bueno para muchas tareas a la vez | Cerrado; foco en paralelizar, no en planificar | Activo |
| Vibe Kanban / Claude Squad | Orquestadores: tablero de tareas que reparte a agentes (Vibe Kanban) o terminal con varias sesiones (Claude Squad) | Varias | Libres | Idea útil: tareas como tarjetas que un agente toma | La empresa de Vibe Kanban cerró y queda en manos de la comunidad. Claude Squad es de terminal | Inciertos |
| CloudCLI | Interfaz web para ver y manejar sesiones de Claude Code desde el navegador o el celular | Web | Libre | Acceso desde el celular | Complementaria, no para trabajar en la PC | Activo |

### Usar la suscripción y no la API
La página de ayuda de Anthropic (actualizada el 07-10-2026) dice que el Agent SDK, `claude -p` y las apps de terceros **siguen usando los límites de la suscripción**; además, los planes Max y Team ahora traen créditos mensuales de API. Una app propia para uso personal puede funcionar con la suscripción. Si algún día se distribuye a otros, necesita claves de API. Se confirma en el hito 3: la política cambió varias veces en 2026.

### Skills locales compartidas (idea 7)
Ya está resuelto con lo propio: las skills viven en `Skills` y se instalan en local como enlaces, así que todos los proyectos usan la misma versión. Claude Code además permite empaquetarlas como plugin. **Alcanza lo que existe** para instalarlas; el usuario sumó después que el Centro sea el **gestor de skills**, todas locales y nada desde la nube (se explora en "Repaso de lo propio" › Skills).

### Qué encontramos
Las interfaces que existen resuelven bien **conversar con la IA y supervisar sesiones**: en eso Claude Code Desktop ya es mejor que cualquier alternativa y mejora sola. **Ninguna** organiza el trabajo como lo hace el usuario: por proyecto, con un plan de hitos, un estado, decisiones y preguntas que esperan respuesta. Ese es el hueco.

### Conclusión provisoria
**No rehacer la conversación con la IA; construir la capa de gestión.** El motor es Claude Code con la suscripción. El marco a construir es lo que falta arriba: proyectos, plan, bandeja de pendientes. Falta decidir **dónde vive esa capa** (Q-7):
- **A) App propia** (escritorio) que muestra la gestión y abre o maneja Claude Code por debajo (Agent SDK). Control total y un solo lugar, pero rehace partes que Claude Code Desktop ya da (chat, cambios, vista previa) o convive con él en otra ventana.
- **B) Dentro de Claude Code** con mods: un panel al lado del chat con el estado y las preguntas del proyecto. Mucho menos trabajo y siempre al día, pero depende de algo muy nuevo y obliga a pasar de VS Code a Claude Code Desktop o a la terminal.
- **C) Seguir en VS Code**, haciendo crecer el gestor anterior. Lo que ya funciona, pero queda atado a VS Code y a sus límites de interfaz (canvas, diseño).

Recomendación provisoria: **A con un límite claro**: la app propia es el lugar para dirigir (proyectos, plan, pendientes, diseño), y para conversar y supervisar el código abre Claude Code Desktop o lo maneja por debajo, sin copiarlo. Se confirma en el hito 2 y se valida con un spike en el hito 5.

### Conclusión
**Construir: app propia para dirigir, con la conversación adentro** (D-006). El usuario eligió A (Q-7) y, tras probar Claude Code Desktop, señaló lo que le falta: ver sobre qué trabaja, sus docs y el design system sin ir al navegador (Q-8). Por eso la conversación va dentro de la app, al lado del proyecto, con el Agent SDK como motor. Lo que Desktop hace y el Centro no necesita (nube, Dispatch, muchas sesiones en paralelo) no se copia.

### ¿Atado a Claude o independiente de la IA?
El usuario planteó que Claude Code y su SDK van a cambiar, y que mañana el mejor motor puede ser otro (Codex, modelos locales). Lo que encontramos:
- **Lo propio ya es independiente:** la documentación (`docs/`, la guía de hitos, las `Q-n`) son archivos que cualquier IA lee. Las skills usan el formato `SKILL.md`, que Anthropic abrió como estándar (agentskills.io, dic. 2025) y ya adoptaron Codex, Gemini CLI, OpenCode y más de 30 herramientas.
- **Existe un estándar para hablar con agentes:** el Agent Client Protocol (ACP), creado por Zed en 2025: una misma forma de que una app converse con Claude Code, Codex, Gemini CLI u otros. Tiene un registro de agentes desde marzo de 2026. Si el Centro habla ACP, cambiar de motor sería elegir otro de la lista.
- Opciones: A) atado a Claude (Agent SDK directo) · B) semi-independiente: la app habla con "un motor" por una capa intermedia (ACP o una propia) y el primero es Claude Code · C) totalmente independiente: un motor propio que llama a cualquier modelo (rehacer Claude Code). C se descarta: es rehacer Claude Code o Codex y saldría peor.

#### Cuánto cuesta de verdad cambiar de motor, si la IA hace la adaptación
El usuario planteó que, si la IA escribe el código, quizás adaptar la app a otro motor sea tan fácil que no valga la pena independizarse de antemano. Es cierto **para el código**, con una condición: que todo lo que habla con el SDK de Claude esté en **un solo lugar** de la app (una "frontera"). Así, cambiar de motor es reescribir esa pieza: trabajo de días para la IA, no de semanas. Si el SDK se usa desparramado por toda la app, la adaptación toca todo y es riesgosa.

Lo que **no** se resuelve con escribir código, y es lo que hace difícil un cambio:
| Qué | Por qué cuesta | Cómo se previene sin independizarse |
|---|---|---|
| Funciones que solo tiene Claude (modos de permiso, plan, subagentes, hooks, mods) | Si la interfaz del Centro se diseña alrededor de ellas, con otro motor esas pantallas quedan sin equivalente y hay que rediseñarlas | Usarlas, pero sabiendo cuáles son y sin que el centro de la app dependa de ellas |
| El historial de conversaciones | Cada motor guarda sus sesiones en su propio formato; no se pasan de uno a otro | Lo importante ya queda en `docs/` (decisiones, estado); la app guarda su propio resumen de cada sesión |
| La configuración (`CLAUDE.md`, ubicación de skills, conectores) | Codex y otros leen `AGENTS.md` y buscan las skills en otro lado | Las skills ya son estándar; el resto es renombrar o duplicar archivos, poco trabajo |
| Cómo se comporta la IA (sigue o no la guía de hitos, el formato de `Q-n`) | No es código: hay que probarlo con uso real, y eso lleva tiempo del usuario | Nada lo evita; es igual con o sin capa intermedia |

#### Pros y contras
| | A con frontera: Agent SDK directo, aislado en un solo lugar | B: capa intermedia con ACP |
|---|---|---|
| Velocidad para construir | Más rápido: se usa el SDK oficial con su documentación | Más lento: una pieza más que aprender y probar |
| Funciones de Claude | Todas, apenas salen | Solo las que ACP sabe transmitir; las nuevas llegan tarde o nunca |
| Quién mantiene la pieza | Anthropic | El adaptador de Claude para ACP lo mantiene Zed u otros; puede atrasarse o abandonarse |
| Suscripción | Confirmada por Anthropic para uso personal | Por debajo es el mismo SDK, pero hay que confirmarlo |
| Cambiar a otro motor | Reescribir la frontera (la hace la IA, días) + lo de la tabla anterior | Elegir otro agente de la lista + lo de la tabla anterior |
| Probar varios motores a la vez | Hay que escribir cada adaptador | Viene casi gratis |
| Riesgo propio | Quedar atado si la frontera no se respeta | ACP es joven: puede cambiar o perder adopción |

#### Conclusión de esta comparación
La diferencia real entre A con frontera y B es chica en costo de cambio, y lo difícil de un cambio (funciones exclusivas, historial, comportamiento) es igual en las dos. A con frontera da más funciones y menos piezas de terceros hoy. Recomendación: **A con frontera**, y si ACP madura o aparece la necesidad de usar varios motores, se suma ACP detrás de la misma frontera. Aceptada (Q-10, D-007).

## Área: Proyectos y plan

Lo que se le pide (`00-idea.md`, ideas 2 y 3, y escena "Una idea nueva"): ver todos los proyectos y, en cada uno, **en qué etapa está, a dónde va y qué falta**, con la guía de hitos llevada a algo visual; y un canvas tipo Miro para ordenar una idea con la IA. La lista de proyectos ya la da el gestor anterior; cómo se relaciona con el Centro se ve en "Repaso de lo propio" y se decide en el hito 2.

Se separan tres cosas: **dónde vive el plan** (quién guarda hitos, tareas y decisiones), **cómo se ve** (la vista del plan) y **el canvas** (pensar en el espacio, sobre todo al principio).

### Alternativas existentes

**Gestores de proyectos y tareas**
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|
| Linear | Gestor de tareas para equipos de software: issues, proyectos, hitos, iniciativas | Web y escritorio (nube) | Gratis con límites; pago por persona | Conector oficial (MCP): Claude Code crea y toma tareas solo; desde feb. 2026 maneja hitos e iniciativas | Piensa en **tareas sueltas**, no en un ciclo idea → operación con decisiones y preguntas. En la nube: el plan queda fuera del repo y de `docs/` | Activo |
| Plane | Alternativa libre a Linear/Jira que se puede instalar en casa | Web (propio o nube) | Libre (AGPL); IA en la versión paga | Se instala local; tableros, epics, conector MCP desde jul. 2026 | Pesado para una persona (servidor, base de datos). Mismo modelo de tareas que Linear | Activo |
| GitHub Projects | Tableros y cronogramas sobre los issues de GitHub | Web | Gratis | Cerca del código | Atado a GitHub; los proyectos del usuario son locales | Activo |

**Métodos de plan para trabajar con IA** (los "competidores" de la guía de hitos)
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|
| Spec Kit (GitHub) | Flujo fijo en markdown: principios → especificación → plan → tareas → implementación | Cualquier agente (≈30) | Libre (MIT) | Archivos en el repo que cualquier IA lee, igual que `docs/` | Por **funcionalidad**, no por producto entero; críticas por exceso de markdown. Sin vista visual | Activo |
| BMAD Method (v6) | Roles con nombre (analista, PM, arquitecto…) que llevan el proyecto por fases; desde ago. 2026 un ciclo automático por historias | Cualquier agente | Libre (MIT) | Lo más parecido a la guía de hitos: de la idea a la construcción, con documentos por fase | Pensado para equipos simulados; mucha ceremonia. Sin vista visual propia | Activo |
| Kiro (AWS) | Editor que trabaja por especificación: requisitos → diseño → tareas, con trazabilidad | Editor propio | Pago | Cada tarea sabe de qué requisito sale | Atado a su editor y a AWS; críticas por precio | Activo |
| Backlog.md | Tareas como archivos markdown en el repo, con un **tablero kanban** en la terminal y en el navegador | Cualquier agente; web local | Libre (MIT) | La idea más cercana a lo buscado: **los archivos son la verdad y la vista se dibuja encima**. Conector MCP y criterios de aceptación | Solo tareas; no conoce hitos, decisiones ni preguntas | Activo |
| Plannotator | Abre el plan que propone Claude Code en el navegador para comentarlo, corregirlo y devolverlo | Plugin de Claude Code | Libre | Revisar un plan como documento, con comentarios por párrafo y diferencias entre versiones | Solo el plan de una tarea, no el del proyecto. (Útil también para "Pendientes del usuario") | Activo |

**Canvas**
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|
| Miro | Pizarra infinita en la nube | Web, escritorio | Gratis con límites; pago | Conector MCP desde feb. 2026; Claude Code y Claude Desktop son el 65 % de su uso: **la IA dibujando y leyendo pizarras ya es un uso real** | En la nube, cuenta aparte; no se puede meter dentro de la app; el canvas no queda en el proyecto | Activo |
| tldraw | Pizarra que se mete como componente dentro de una app | Componente web | **Licencia propia**: gratis para desarrollo; en uso real, licencia de aficionado gratis (a pedido, con marca de agua) o comercial | El mejor para **agentes sobre el canvas**: kit oficial con chat al costado que dibuja y mueve cosas | La licencia: no está claro si una app de escritorio local cuenta como "uso real"; depende de que aprueben el pedido | Activo |
| Excalidraw | Pizarra a mano alzada, también como componente | Componente web | Libre (MIT), gratis | Se mete en la app sin permisos ni marcas. Conector MCP oficial y uno libre que dibuja **en vivo** en un canvas local. Archivos `.excalidraw` que la IA puede leer y escribir | Estilo boceto (no prolijo); menos pensado para agentes que tldraw | Activo |
| JSON Canvas (Obsidian) | Formato abierto de canvas: tarjetas, notas y flechas en un archivo | Formato | Libre (MIT) | Un canvas que es **un archivo en el proyecto**, fácil de leer para la IA; las tarjetas pueden ser notas markdown | Solo el formato; versión 1.0 conservadora, sin novedades desde 2024 | Estable |

**Diagramas**
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|
| Mermaid | Diagramas escritos como texto dentro del markdown (flujos, cronogramas, secuencias) | Componente web | Libre (MIT) | La IA los escribe muy bien y quedan en `docs/`; se ven en VS Code y GitHub | Poco control del aspecto; no se editan con el mouse | Activo |
| React Flow | Componente para dibujar diagramas interactivos de nodos y flechas | Componente web | Libre (MIT) | Base para un **mapa del plan propio** (hitos, iteraciones, decisiones conectadas) con el aspecto que se quiera | Es una pieza para construir, no una herramienta lista | Activo |

### Qué encontramos
- **Nadie conoce el ciclo completo.** Los gestores (Linear, Plane) manejan tareas; los métodos para IA (Spec Kit, Kiro) manejan una funcionalidad a la vez; BMAD es el más parecido a la guía de hitos, pero no tiene vista. Ninguno muestra "estoy en el hito 1, área 3 de 7; esto espera de mí; esto se decidió".
- **El patrón que funciona: archivos como verdad, vista encima.** Backlog.md lo hace con tareas, Spec Kit y BMAD con documentos. Es lo mismo que ya hace la guía con `docs/`: el Centro no necesita su propia base de datos de planes, sino **leer y dibujar** `estado.md`, las tablas de hitos, `decisiones.md` y las `Q-n`. Así la IA y el usuario miran lo mismo, y sigue sirviendo con cualquier motor (D-007).
- **El canvas con IA ya es real** (Miro lo prueba con números), y se puede tener **dentro de la app y en el proyecto** con Excalidraw o tldraw, sin cuenta ni nube.
- **Para la vista del plan no hace falta una herramienta**: con React Flow o Mermaid se dibuja lo que la guía ya tiene escrito.

### Conclusión provisoria
**Construir la vista del plan; adaptar el canvas.**
- **Plan:** construir. La verdad sigue en `docs/`; el Centro la lee y la muestra como un mapa del proyecto (hitos, en cuál estamos, qué falta, decisiones y preguntas colgando de cada uno). Nada de Linear ni Plane: duplicarían el plan fuera del repo.
- **Canvas:** adaptar, metiendo Excalidraw dentro de la app (libre, sin cuenta), con los dibujos guardados como archivos del proyecto para que la IA los lea y los modifique. tldraw queda como alternativa si su licencia de aficionado sirve para una app local (a confirmar en el hito 3). Miro se descarta como base: nube y cuenta aparte.
- **Diagramas sueltos** (arquitectura, flujos) en Mermaid dentro de los docs, como hasta ahora.

Falta lo que solo decide el usuario: qué quiere ver al abrir el plan (Q-11) y para qué usaría el canvas (Q-12).

### Conclusión
**Construir la vista del plan como un gráfico de fases y pasos; sin kanban ni canvas por ahora** (D-008). El usuario eligió el mapa de hitos dibujado como fases con sus pasos, cada uno enlazado a su documento (Q-11). Descartó el kanban: es la IA quien ubica las tareas. Para el canvas eligió la opción B (diagramas en Mermaid que arma la IA) y lo deja para más adelante (Q-12).

Mermaid no tiene listas reales dentro de una caja, pero el gráfico de fases y pasos se puede armar de tres maneras: cajas dentro de cajas, una caja por hito con sus pasos en renglones, o una línea de tiempo. Se armó una prueba con el plan de este proyecto ([Mapa del plan del Centro](https://claude.ai/artifact/RdKN5aCBEWsU7L8Q3iE2ok)); la forma se elige en los hitos 4 y 6 (Q-13).

El usuario prefiere **cajas dentro de cajas** (Q-13, opción A), y planteó que muchos proyectos no avanzan en línea: otra app cambió de forma, otro proyecto pasará a plugins, y en los juegos es típico que una funcionalidad nueva obligue a cambiar el motor y retroceder. La guía ya tiene dos piezas para eso: los **módulos** (un sub-plan con su ciclo reducido, como los plugins de otro proyecto) y el estado **reabierto** de un hito. Le falta el cómo, que es la mejora 3 aprobada en D-009 (corregir el rumbo). Para el mapa, la forma A lo acompaña bien: un módulo es otra caja con sus pasos, y un hito reabierto se marca como tal en vez de borrar lo hecho.

## Área: Pendientes del usuario

Lo que se le pide (`00-idea.md`, idea 4): que **todo lo que espera del usuario, en cualquier proyecto, llegue a un solo lugar**, con un formato único y opciones para responder. Ya existe una primera versión: las `Q-n` de `estado.md`, las respuestas en `docs/respuestas/` y el visor del gestor anterior, que cuenta las abiertas y les muestra un campo de respuesta. Se suma la idea de Q-13: **formularios prearmados** para contestar antes de hablar con la IA.

Se separan tres cosas: **el formato** (cómo se escribe lo que se pide), **la bandeja** (dónde se junta y se responde) y **los formularios** (varias preguntas juntas, por ejemplo al arrancar un proyecto).

### Alternativas existentes
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|
| AskUserQuestion (Claude Code) | La IA frena y pregunta en el chat con opciones (una, varias u "Otro"), con vista previa por opción | Claude Code y Agent SDK | Incluido | Es lo más cómodo en el momento. **Con el Agent SDK, la app propia recibe la pregunta y la dibuja como quiera** (D-007) | Vive solo en el chat: si no se contesta en el momento o se cierra la sesión, se pierde. No hay registro | Activo |
| Elicitación de MCP | Estándar para que una herramienta le pida al usuario un **formulario** (campos de texto, número, sí/no, opciones) y reciba aceptar, rechazar o cancelar | Protocolo (versión 2026-07-28); ACP lo adopta | Abierto | **Un formato de formulario ya definido**, que entienden varias IA y apps. Prohíbe pedir contraseñas o claves por formulario | Formularios planos (sin secciones ni pasos); pensado para el momento, no para que esperen días | Activo |
| Agent Inbox (LangChain) | Bandeja donde caen las pausas de agentes que corren solos: aceptar, editar, responder o ignorar | Web | Libre (MIT) | El patrón de **bandeja para agentes en segundo plano**, con cuatro respuestas fijas | Atado a LangGraph; pensado para aprobar acciones, no para decisiones de un plan | Activo |
| HumanLayer | La IA pide aprobaciones o ayuda por Slack o mail, con tiempos de espera y a quién escalar | API y SDK | Libre, con servicio pago | Llega donde el usuario ya está (también el celular) | Para equipos y en la nube; aprobaciones de acciones, no preguntas de plan | Activo |
| Plannotator | Abre un plan en el navegador para comentarlo párrafo por párrafo y devolverlo | Plugin de Claude Code | Libre | Responder **sobre un documento**, no solo elegir una opción | Solo el plan de una tarea | Activo |
| Spec Kit › aclaraciones | Hasta 5 preguntas antes de planear; las respuestas se escriben en la especificación | Cualquier agente | Libre (MIT) | Lo mismo que las `Q-n`: lo respondido queda en los documentos | Solo en ese paso, sin bandeja | Activo |
| Formularios web (Tally, Typeform) | Formularios armados de antemano | Web (nube) | Gratis con límites | Cómodos para contestar | En la nube y fuera del proyecto: descartados por la preferencia de tener todo local | Activo |
| el gestor anterior (propio) | Cuenta las `Q-n` abiertas de cada proyecto y les muestra un campo de respuesta que escribe `docs/respuestas/Q-n.md` | Extensión de VS Code | Propio | Ya funciona y usa los archivos como verdad | Proyecto por proyecto, no una bandeja de todos; solo en VS Code | En uso |

### Qué encontramos
- **Nadie junta lo que espera del usuario entre proyectos.** Las bandejas que existen (Agent Inbox, HumanLayer) son para aprobar acciones de agentes que corren solos, no para decisiones de un plan. La `Q-n` con sus respuestas archivadas ya es mejor que lo que hacen los métodos para IA (ver "Guía de hitos frente a otros métodos").
- **Hay dos tipos de pregunta que hoy no se tocan:** las del chat (AskUserQuestion), cómodas pero que se pierden, y las `Q-n`, que esperan días y quedan registradas. Con el Agent SDK el Centro recibe las del chat y puede **mostrarlas igual que una `Q-n`**: si no se contestan en el momento, se guardan como `Q-n` y pasan a la bandeja.
- **Para los formularios no hay que inventar un formato:** el de la elicitación de MCP (campos simples y opciones) es abierto y alcanza para un formulario de arranque. Las secciones o pasos serían lo único propio.
- **Lo que se le pide al usuario es de varios tipos** (decidir, probar, juntar material, ejecutar algo a mano, contestar un formulario), y una `Q-n` hoy no dice cuál es ni si frena al proyecto (en Q-13 había que leer "No es urgente" en el contexto).

### Conclusión provisoria
**Construir la bandeja; adaptar el formato.**
- **Bandeja:** construir. Igual que con el plan (D-008), la verdad queda en los archivos de cada proyecto (`estado.md`, `respuestas/`) y el Centro los lee y los junta. Responder desde la bandeja escribe el mismo `respuestas/Q-n.md` que hoy escribe el Gestor, así que nada cambia para la IA.
- **Preguntas del chat:** el Centro las muestra con el mismo aspecto que una `Q-n` y, si quedan sin contestar, las guarda como `Q-n`.
- **Formato:** sumar a la `Q-n` dos datos que la bandeja usa para ordenar: el **tipo** (decisión, prueba, material, acción, formulario) y si **frena** el próximo paso. Es un cambio de la guía, en `Skills`.
- **Formularios:** una `Q-n` de tipo formulario, con sus campos en el formato de la elicitación de MCP. Para qué se usan lo decide el usuario (Q-17).
- **Celular:** responder desde el celular no entra por ahora; con D-005 se puede avisar de una pregunta nueva (ntfy), y se ve en la definición.

Falta lo que solo decide el usuario: cómo quiere ver la bandeja (Q-16) y para qué quiere los formularios (Q-17).

### Lo que sumó el usuario
- **La IA sigue preguntando en el chat lo que debería ser una `Q-n`.** La guía permite preguntar en el chat lo que se contesta en el momento, pero no dice qué pasa si no se contesta, y la pregunta se pierde. Mientras no exista el Centro, la regla de la guía tiene que ser explícita: una pregunta del chat que no se contestó al cerrar la sesión pasa a `Q-n`.
- **Hay pendientes que son listas, no preguntas:** guías de prueba y tareas a mano. Cada punto se marca (sí o no, hecho o no) y lleva un **campo de texto** para contar un problema o remarcar algo. Hoy una prueba es una sola pregunta con A) funciona o B) encontré algo, y todo lo que falla se mezcla en un "Otro" (ver Q-58 de otra app).
- **Temor a otro MCP o skill que cargue el contexto.** No hace falta ninguno: del estándar de MCP se toma solo **la forma de escribir un formulario**, dentro de los archivos del proyecto. El Centro los lee y los dibuja; a la IA solo le llega la regla del formato en la guía (unas líneas más). Un MCP haría falta solo para abrir un formulario en vivo en medio del chat, y para eso ya está AskUserQuestion.

### Tipos de pendiente, según los casos reales
Se repasaron las ~90 `Q-n` respondidas de otras apps, el gestor anterior y este proyecto. Entran en cinco tipos:

| Tipo | Qué se pide | Cómo se responde | Casos reales |
|---|---|---|---|
| Decisión | Elegir entre opciones, también una dirección visual o aceptar un costo | Opciones, con vista previa si es visual, y "Otro" | otra app Q-42 (stack), Q-47 (dirección visual); otra app Q-7 (aceptar 1,4 s); Q-10, Q-13 |
| Consulta | Contar cómo hacés algo hoy o qué te pasó | Texto libre (y adjuntos) | otra app Q-1 (uso típico), Q-10, Q-12; Q-5, Q-8 |
| Prueba | Probar una iteración, una versión o un arreglo siguiendo una guía | **Lista**: cada punto sí o no, con nota; al final, aprobada o no | otra app Q-53 a Q-62; otra app Q-3 (ya no se traba), Q-5, Q-8 |
| Tarea | Hacer algo a mano: instalar, borrar, juntar material | **Lista**: cada punto hecho o no, con nota | Q-15 (borrar las skills de la nube) |
| Formulario | Varios datos juntos, como al arrancar un proyecto | Campos (texto, opciones, sí o no), cada uno con "no sé todavía" | todavía ninguno (Q-17) |

Cada pendiente dice además si **frena** el próximo paso. Una prueba de un solo punto ("¿ya no se traba?") es una prueba con un punto, no un tipo aparte.

### Formulario de arranque (Q-17)
El usuario lo ve como una guía general para la IA: si es un juego o una app, y para qué plataformas (escritorio, Android, Windows, Linux, web, servidor…). **Vale la pena si no es un trámite aparte:** esos datos ya son los que pide el hito 0 y `perfil-proyecto.md` (plataformas, quién la usa, datos). El formulario es esa misma información para completar antes del chat, **opcional y por partes**: lo que se sabe se contesta, y cada campo admite "no sé todavía". Lo que quedó en "no sé" lo afina la IA con el usuario en los hitos 0 a 2. Si es un juego, el mismo formulario abre la rama de la guía por género (`trabajo.md` › T-1).

### Conclusión
**Construir la bandeja; las `Q-n` suman tipo y si frenan; pruebas y tareas como listas** (D-010). La bandeja muestra primero lo que frena a un proyecto y después el resto (Q-16). Los formularios se usan para arrancar un proyecto, opcionales y con "no sé todavía" (Q-17). Los cambios de formato se hacen en la guía, en `Skills`.

## Área: Diseño

Lo que se le pide (`00-idea.md`, idea 5): un **Claude Design propio y local**, en dos partes. Una **biblioteca**: design systems y colecciones de referencias tomadas de páginas que el usuario encuentre. Y **prototipos con comentarios en el lienzo**, como se trabajaron las direcciones visuales de otra app (Q-47 de otra app).

### Cómo se diseña hoy
Todo el diseño de los proyectos se hizo en **Claude Design dentro de Claude**, en la nube: el lienzo y el design system de otra app, las pantallas del gestor anterior, las de otra app y el mapa del plan de este proyecto son artifacts de claude.ai. En el repo de cada proyecto queda el resumen para la skill `impeccable`: `PRODUCT.md` (qué es el producto), `DESIGN.md` (tokens y reglas) y `.impeccable/` (lo que no entra en `DESIGN.md`). Funcionó bien: el usuario comentó cada pantalla en el lienzo y la IA las ajustó (su `06-ui.md`). Lo que falta es que sea local y que lo visto en otras páginas quede guardado en algún lado.

### Alternativas existentes
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|
| Claude Design (en Claude) | Chat y lienzo: prototipos en HTML vivo, design systems, comentarios sobre el lienzo, ajustes con controles; pasa a Claude Code | Web (claude.ai) | Incluido en el plan | Es lo que ya se usa y anda bien; el mejor resultado visual | **En la nube.** El sitio aparte de Claude Design cierra el 14-12-2026 y sus chats y comentarios se borran: muestra que el producto cambia de forma sin aviso. Los proyectos del usuario ya son artifacts y no se ven afectados | Activo (vista previa) |
| Open Design | "Alternativa abierta a Claude Design": prototipos, presentaciones y tableros; 150 design systems en `DESIGN.md`; elige entre 5 direcciones | Escritorio (Electron, Windows) o web local | Libre (Apache-2.0) | Local; **usa como motor el Claude Code instalado** (no necesita API); muy usado (~100 mil estrellas) | Sin lienzo con variantes lado a lado; comentarios a medio hacer; guarda los proyectos en su propia base de datos; **telemetría siempre encendida**; cambia muy rápido | Activo |
| Open CoDesign | Lo mismo, más chico: prototipos, presentaciones; modo comentario (clic en un elemento, alfiler, la IA rehace esa parte) | Escritorio (Windows) | Libre (MIT) | Local; comentarios pegados a elementos; `DESIGN.md` | Pide clave de API (se paga aparte de la suscripción); proyecto chico (v0.2) | Activo |
| `impeccable` (skill) | Diseña, critica y pule interfaces; `document` y `extract` arman el design system desde el código; **modo `live`**: en el navegador se elige un elemento y aparecen variantes para elegir | Skill local de Claude Code | Libre (Apache-2.0) | **Ya está instalada** y es la que se usa; trabaja sobre los archivos del proyecto; `DESIGN.md` | Sin lienzo ni biblioteca: trabaja de a una pantalla real | En uso |
| Superdesign | Agente de diseño con lienzo infinito y variantes en ramas | Web (nube) | Gratis con límites | El lienzo de variantes que falta en las locales | La extensión local quedó archivada; hoy es solo nube | Activo |
| Google Stitch | Diseño con IA de Google; creó el formato `DESIGN.md` | Web (nube) | Gratis | **Liberó `DESIGN.md` como formato abierto** (Apache-2.0, en alfa), con una herramienta para validarlo y pasarlo a Tailwind o tokens W3C | En la nube | Activo |
| Penpot | Figma libre, instalable en la PC; servidor MCP para que la IA lea y edite diseños | Web autoalojada (Docker) | Libre (MPL) | Comentarios, componentes, tokens; todo propio | Pensado para diseñar a mano; un servidor que mantener; el usuario no diseña a mano | Activo |
| Extractores de estilo (extract-design-system, Source Design, StyleKit) | Leen una página y sacan colores, tipografías, espaciados y sombras como `DESIGN.md` o tokens | Skill, web o extensión | Varía | Justo lo que pide "tomar un estilo de una página"; el primero es una skill local | Las páginas muy dinámicas salen incompletas; los otros son nube o extensiones de terceros | Activos |
| Mobbin | Biblioteca de ~600 mil pantallas reales de apps y webs, con colecciones y MCP | Web (nube) | Pago (~10 USD/mes) | Referencias ya clasificadas por patrón | Nube y pago; son pantallas ajenas, no lo que el usuario encuentra | Activo |
| Eagle, TagStudio, PureRef | Organizadores locales de imágenes de referencia (etiquetas, tableros) | Escritorio | Eagle pago; TagStudio libre; PureRef gratis | Locales | Guardan imágenes, no estilos; la IA no los lee | Activos |

### Qué encontramos
- **El formato ya existe y coincide con lo que se usa.** `DESIGN.md` es lo que escribe `impeccable` en cada proyecto, lo que leen Open Design y Open CoDesign y lo que Google publicó como formato abierto. Es para el diseño lo que `CLAUDE.md` es para el código. Una biblioteca de design systems puede ser una carpeta de `DESIGN.md`, sin formato propio.
- **Las alternativas locales generan, pero no tienen el lienzo.** Open Design y Open CoDesign hacen prototipos en la PC, pero ninguna tiene lo que hizo útil a Claude Design en otra app: **varias versiones lado a lado con comentarios sobre cada una**. Las que tienen lienzo (Claude Design, Superdesign, Stitch) están en la nube.
- **Comentar un prototipo y comentar la app en desarrollo son lo mismo.** En los dos casos se elige un elemento de una página HTML y se le pega un comentario que la IA lee después. Es la idea 6 (Revisión de la app). Si el Centro lo construye una vez, sirve para las dos áreas.
- **Tomar un estilo de una página se resuelve con una skill.** Leer una página y escribir su `DESIGN.md` ya lo hacen varios extractores; uno es una skill local. Lo que no existe es **dónde se guarda**: hoy lo visto se pierde.
- **La IA ya diseña bien con `impeccable`.** Construir otro generador de diseños no aporta: el trabajo de diseño lo sigue haciendo Claude con esa skill. Lo que falta es el **lugar** donde se ve, se compara y se comenta.

### Conclusión provisoria
**No construir un generador de diseños. Construir el lienzo y la biblioteca; el diseño lo sigue haciendo la IA con `impeccable`.**
- **Formato:** `DESIGN.md` (el abierto de Google, el que ya usa `impeccable`) en cada proyecto. La biblioteca es una carpeta local con un `DESIGN.md` por design system o estilo guardado, más sus capturas.
- **Biblioteca:** el Centro la muestra (colores, tipografías, componentes, capturas) y al arrancar el diseño de un proyecto se elige una como punto de partida.
- **Capturas de páginas:** el usuario pega una dirección (o la manda desde el navegador) y la IA, con una skill extractora adaptada, guarda la captura y el `DESIGN.md` de ese estilo en la biblioteca.
- **Prototipos:** archivos HTML dentro del proyecto. El Centro los muestra en un lienzo, varios lado a lado, y los comentarios se pegan a elementos y se guardan en archivos del proyecto. Es la misma pieza que la Revisión de la app.
- **Claude Design en la nube:** queda como respaldo mientras el Centro no exista; lo ya hecho (otras apps, el Gestor) sigue ahí.

Lo descartado como herramienta para usar tal cual: **Open Design** (sin lienzo, telemetría siempre encendida, sus propios datos fuera del proyecto), **Open CoDesign** (pide API), **Penpot** (para diseñar a mano) y **Mobbin** (nube y pago).

### Lo que sumó el usuario
- **No construir desde cero.** Open Design es de código abierto: no se usa tal cual, pero es una **fuente de código** para la versión propia. Su licencia (Apache-2.0) permite tomar partes con aviso de autoría; las skills y los design systems que trae conservan su propia licencia, que hay que mirar una por una. Lo mismo vale para Open CoDesign (MIT).
- **Recorrer las skills que ya existen** para sacar algo más refinado: `impeccable` (Apache-2.0) y lo que usa Claude Design.
- **¿Claude Design se basa en skills?** En parte. Dentro de Claude, un diseño es un artifact hecho desde un **tipo** ("Design": lienzo con mesas de trabajo; "Design System": tokens, componentes con vista previa y guía). Cada tipo trae una página ya hecha (el lienzo) y sus instrucciones para la IA, y Claude Code suma una skill de diseño de artifacts. Las instrucciones y la forma de los archivos se pueden leer y estudiar; el código del lienzo es de Anthropic y no tiene licencia abierta: se toman las ideas, no el código.

### Conclusión
**Lienzo y biblioteca propios sobre `DESIGN.md`, armados con lo que ya existe; el diseño lo hace la IA con skills** (D-011). La biblioteca guarda, por cada página que le gusta al usuario, la captura y el estilo extraído (Q-19). Antes de diseñar el área se estudian Open Design, Open CoDesign, `impeccable`, los extractores y los tipos de Claude Design (hito 3), para tomar código donde la licencia lo permite e ideas donde no.

## Área: Revisión de la app

Lo que se le pide (`00-idea.md`, idea 6): en las apps Electron y web en desarrollo, un atajo abre un selector de elementos (como el inspector) para dejar comentarios pegados a ellos. Se guardan en una carpeta del proyecto con la referencia de cada elemento, y basta con decirle a Claude "dejé comentarios en la app". Por D-011, es la misma pieza que comenta los prototipos de Diseño.

### Cómo se revisa hoy
El usuario prueba la app y cuenta en el chat lo que ve ("el botón de arriba está muy apretado"), a veces con una captura. La IA tiene que adivinar de qué elemento habla, y lo que no se dijo en esa sesión se pierde.

### Alternativas existentes
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|
| Panel de navegador de Claude Code Desktop | Muestra la app web en desarrollo; "Seleccionar elemento" suma al mensaje el selector y una captura | App de escritorio de Claude | Incluido en el plan | Ya existe; no hay que instalar nada | El comentario va al chat de ese momento, no se guarda; solo páginas web, no apps Electron; atado a la app de Claude | Activo |
| `impeccable`, modo `live` | Se elige un elemento en el navegador, se deja un comentario y la IA propone tres variantes; la elegida se escribe en el código | Skill local; web con servidor de desarrollo o HTML suelto | Libre (Apache-2.0) | **Ya está instalada**; variantes de verdad distintas; guarda un diario de la sesión en `.impeccable/live/` | **Necesita a la IA atendiendo en ese momento**; está en alfa; es para rediseñar una parte, no para dejar notas; no menciona Electron | En uso (alfa) |
| Agentation | Barra en la página: clic en un elemento, nota; sale en markdown con selector y posición; servidor MCP y hook que lleva las notas a Claude Code | Componente que se instala en cada app (React 18+) | PolyForm Shield (código visible, pero prohíbe usarlo para hacer algo que compita) | **Lo más parecido a la idea**; la IA puede marcar las notas como resueltas | Hay que meterlo dentro de cada app; solo React; las notas viven en su servidor, no en archivos; sin capturas; licencia que no deja tomar código | Activo |
| React Grab | Apuntar a un elemento y Ctrl+C copia el archivo, la línea y el componente que lo dibuja | Se instala en cada app (React) | Libre (MIT) | Lleva del elemento al **archivo y la línea exactos** | Solo React; copia para pegar en el chat, no guarda comentarios | Activo |
| stagewise | Barra para comentar elementos y mandar a la IA el elemento y una captura | Empezó como barra; hoy es un editor propio con su agente | Libre (AGPL-3.0) | Comentarios con captura | Se convirtió en otro editor con su propia IA; la AGPL obliga a publicar lo que se derive | Activo |
| Marker.io, BugHerd | Widgets para que clientes de agencias reporten sobre una web: captura, consola, red; ahora con MCP | Web (nube) | Pago | Reportes muy completos | Nube y pago; pensados para equipos y clientes | Activos |
| Herramientas para Electron (electron-driver, Electron Debug MCP, guía electron-live-annotations) | La IA maneja y mira una app Electron por el puerto de depuración de Chromium; la guía describe justo la idea: modo anotación, nota, captura y registro local | MCP y receta | Libres | Confirman que en Electron se puede, sin tocar la app, por el puerto de depuración que todas traen | Los MCP son para que mire la IA, no para que comente el usuario; la guía es una receta, no una herramienta | Activos |

### Qué encontramos
- **Señalar un elemento y pasárselo a la IA ya está resuelto; guardarlo, no.** Todas mandan el comentario al chat del momento, a su servidor o a su nube. Ninguna deja archivos en el proyecto que la IA lea en la sesión siguiente, que es lo que pide la idea 6.
- **Hay dos formas de revisar, y se complementan.** En diferido: el usuario prueba la app, deja notas y la IA las resuelve después. En vivo: la IA está atendiendo, el usuario elige un elemento y recibe variantes para elegir (`impeccable live`). La primera sirve para probar; la segunda, para pulir una pantalla.
- **El selector lo puede poner el Centro desde afuera, sin tocar cada app.** Las apps web se abren en el navegador interno del Centro; las Electron se abren en modo desarrollo con el puerto de depuración de Chromium y el Centro se conecta por ahí. En los dos casos el Centro pone el selector, toma la captura y guarda, sin instalar nada en la app y sin depender de React. Las que se instalan dentro (Agentation, React Grab) obligan a tocar cada proyecto.
- **La referencia necesita varias pistas.** Un selector solo se rompe apenas la IA cambia el código. Guardar el selector, el texto visible, la ubicación, una captura recortada y, cuando se puede, el archivo y la línea (como React Grab) deja que la IA encuentre el elemento aunque la página haya cambiado.
- **Es la pieza de Diseño.** Un prototipo HTML es una página más: el mismo selector y el mismo formato de comentario sirven para los dos (D-011).
- **Quedan afuera, por ahora:** las apps Android (no tienen un árbol de elementos que se recorra igual; serían comentarios sobre capturas) y las extensiones de VS Code como el gestor anterior, que se ven en el hito 3.

### Conclusión provisoria
**Pieza propia de comentarios en el Centro, que trabaja desde afuera de la app y guarda en archivos; las variantes en vivo, con `impeccable`.**
- **Abrir la app:** las web, en el navegador interno del Centro; las Electron, en modo desarrollo con el puerto de depuración. Un atajo activa el selector.
- **Guardar:** un archivo por comentario en una carpeta del proyecto, con el texto, las pistas del elemento, la página y la captura. El `CLAUDE.md` dice dónde están, y el Centro muestra cuántos quedan abiertos en cada proyecto.
- **Ciclo:** abierto → la IA lo resuelve y lo marca → el usuario lo aprueba o lo reabre (Q-21).
- **En vivo:** desde el mismo selector, "pedir variantes" arranca `impeccable live`. Se usa la skill, no se rehace.
- **De dónde sacar código e ideas:** React Grab (MIT) para llegar al archivo y la línea; el modo comentario de Open CoDesign (MIT); de Agentation y del panel de Claude, solo ideas, por la licencia.

Lo descartado como herramienta para usar tal cual: **Agentation** (dentro de cada app, solo React, notas fuera del proyecto, licencia restrictiva), **stagewise** (ahora es otro editor) y **Marker.io y BugHerd** (nube y pago). El **panel de Claude Code Desktop** sigue sirviendo mientras el Centro no exista.

### Lo que sumó el usuario
- **Más sencillo: una extensión del navegador.** Se selecciona un elemento como en Claude Design y se deja el comentario guardado o se envía en el momento. **Sin variantes.**
- **Solo apps web**, y no atado a React.
- **Aprovechar el modo desarrollo** para guardar, en un archivo plano, el comentario, el selector y de dónde sale lo que se ve (archivo y línea).

Lo que se comprobó al respecto:
- **No hace falta React.** En modo desarrollo, cada framework puede marcar qué archivo y qué línea dibujan cada elemento: React, Preact y Solid lo traen (es lo que leen LocatorJS y React Grab); Svelte y Vue tienen sus inspectores oficiales; y code-inspector hace lo mismo para casi todos desde Vite o Webpack. La extensión lee esa marca cuando está; si no está (HTML suelto, un prototipo), quedan el selector, el texto visible y la captura.
- **Una extensión no puede escribir archivos del proyecto por sí sola.** Necesita un programa chico en la PC que reciba el comentario y lo guarde en la carpeta del proyecto correcto. Se instala una vez y sirve para todos los proyectos; cuando exista el Centro, ese papel lo hace el Centro.
- **"Enviar ahora"** guarda el comentario igual y además lo hace llegar a la sesión de Claude Code abierta en ese proyecto. Cómo (un hook que lo sume al próximo mensaje, o el Centro pasándolo) se ve en el hito 3.

### Conclusión
**Extensión del navegador para comentar apps web en desarrollo; cada comentario es un archivo plano en el proyecto** (D-012). Se deja o se envía en el momento; no hay variantes. Al resolverlo, la IA lo cierra y queda en el historial; se puede reabrir o dejar uno nuevo (Q-21). Electron y Android quedan para después.

## Repaso de lo propio
el gestor anterior y su visor, skills y diseño de otra app repasados (D-013, D-014).

### el gestor anterior y su visor
**Qué es hoy** (versión 1.2.0, en uso a diario, hito 10 de su propio proyecto): una extensión de VS Code con dos botones.
- **Gestor:** una tarjeta por carpeta de la carpeta de proyectos con ícono, descripción, estado, etiquetas, y el hito y el próximo paso leídos de `estado.md`. Abre, archiva, crea y manda a la papelera. La ficha de cada proyecto es su `.proyecto.json`.
- **Visor de documentación**, del proyecto abierto: lee `docs/` con los códigos como enlaces y vista previa, responde las `Q-n` con texto e imágenes en `docs/respuestas/`, muestra los scripts de `scripts.md` con botón, se actualiza solo y cuenta las preguntas abiertas.

**Qué encontramos:**
- **Ya resuelve una parte del Centro.** Leer el `estado.md` de todos los proyectos es la base del plan (D-008); responder `Q-n` es la base de la bandeja (D-010); las fichas y los scripts también están. Le falta lo que no entra en VS Code: juntar las preguntas de todos los proyectos, el mapa del plan, el diseño, la revisión, el motor de IA y el puente.
- **Su código está separado de VS Code.** Solo una capa de cuatro archivos habla con VS Code. Lo demás (leer `estado.md`, armar el índice de códigos, preguntas, respuestas, scripts y fichas) es TypeScript común con 217 pruebas, y la interfaz es React. Si el Centro se hace con TypeScript y React, ese código se lleva casi entero y ya probado: es un argumento fuerte para el hito 5.
- **La verdad son los archivos, no la extensión.** `.proyecto.json`, `estado.md`, `respuestas/` y `scripts.md` los leen y escriben los dos, así que el Gestor y el Centro pueden convivir sin pisarse. Los cambios de formato (como el de D-010) los tienen que entender los dos.
- **Su diseño está atado al tema de VS Code.** Las tarjetas de proyecto, de pregunta y de script sirven de punto de partida, pero el Centro necesita su propia identidad (hito 6).

**Conclusión provisoria:** el Gestor es el **primer pedazo del Centro**, no algo que se descarta. La relación se decide en el hito 2, pero todo apunta a que el Centro lleve su código y, cuando cubra lo mismo, el Gestor quede como acceso rápido dentro de VS Code o se retire. Mientras tanto sigue en uso.

**Decisión del usuario (Q-22):** solo mantenimiento: arreglos y lo necesario para entender los formatos nuevos de la guía; las funciones nuevas se piensan para el Centro (D-013).

### Skills
El usuario quiere que el Centro sea también el gestor de skills, usando solo las instaladas en local (2026-10-21). Primer hallazgo, a completar en la exploración:
- Las propias (`hitos-desarrollo-app`, `gestor-proyectos`) están bien instaladas en local, como enlaces a `Skills`.
- Pero Claude Code también baja de claude.ai una copia de las skills de la cuenta (`.claude/skills/synced/`), y ahí siguen **copias viejas de esas dos**, de cuando se subían a la nube. En cada sesión aparecen las dos versiones, y la IA podría usar la vieja. El usuario las borró de claude.ai (Q-15) y se verificó que ya no bajan: en la copia de la nube quedan solo las de Anthropic.
- De esa copia de la nube vienen también las skills generales de Anthropic (Word, PDF, PowerPoint, Excel, investigación, navegador y otras). Algunas están publicadas y se pueden traer a `Skills` como copia local; otras dependen de funciones de la app de Claude. Qué traer y qué dejar se ve en esta exploración.

**Lo que se encontró al repasarlas** (2026-10-21):
| Qué | De dónde viene | Licencia | Situación |
|---|---|---|---|
| `hitos-desarrollo-app`, `gestor-proyectos` | Local, enlace a `Skills` | Propias | Bien |
| `impeccable` | **Dos copias:** una instalada a mano en la PC (versión 4.5.0) y otra que baja de la cuenta de claude.ai como plugin (4.7.0, con cuatro agentes y un hook) | Libre (Apache-2.0) | Cada sesión ve las dos y puede usar la vieja: el mismo problema que hubo con las propias (Q-15) |
| Plugins `design` y `engineering` de Anthropic (17 skills: crítica de diseño, design system, arquitectura, pruebas, documentación…) | Bajan de la cuenta de claude.ai | Publicados por Anthropic como libres (a confirmar en su repositorio) | Se cruzan con la guía de hitos y con `impeccable`: dos formas de hacer lo mismo |
| `skill-creator` | Baja de la cuenta | Libre (Apache-2.0) | Se puede traer a `Skills` |
| Word, PDF, PowerPoint, Excel, navegador, Chrome, control de la PC | Bajan de la cuenta | **De Anthropic, con todos los derechos reservados:** prohíbe sacar copias fuera de sus servicios o hacer versiones propias | **No se pueden traer como copia local** |
| Investigación, docs, Google Workspace, resumen de la mañana, importar memoria | Bajan de la cuenta | Sin licencia (todos los derechos reservados) | Dependen de conectores o de la app de Claude; sin ellos no sirven en local |

- El "todo local" tiene un límite: las mejores skills de documentos de Anthropic **no se pueden copiar**. O se aceptan desde la cuenta como excepción, o se dejan de lado (Q-23).
- Las que sí se pueden traer conviene juntarlas en `Skills` con una sola copia cada una; eso se hace en una sesión de ese proyecto.
- El gestor de skills del Centro tiene que mostrar **de dónde viene cada una** (propia, copia local de un tercero, desde la cuenta) y avisar cuando hay dos copias de la misma.

**Decisión del usuario (Q-23):** local todo lo que la licencia permite, con una sola copia en `Skills`; las de Anthropic que no se pueden copiar quedan desde la cuenta como excepción; el resto se quita de la cuenta (D-014).

### Diseño de otra app
Cómo se diseñó otra app (su `06-ui.md`), lo que funcionó y lo que pide al lienzo del Centro (D-011):
- **Rondas sobre una sola pantalla.** Sin referencias claras, se probaron estilos sobre la misma pantalla con el mismo contenido y los mismos estados, cuatro versiones lado a lado, una de ellas "lo típico de la categoría" como comparación. Tres rondas hasta cerrar la dirección. El lienzo tiene que permitir **filas de rondas** y repetir el contenido en cada versión.
- **Prototipos que se usan, no solo se miran.** La ronda 3 era interactiva (botón Play): el selector se deslizaba y lo elegido se marcaba con un clic.
- **Controles en el lienzo.** El color de acento se probaba con tres perillas (tono, luminosidad, intensidad) que cambiaban toda la pantalla; de ahí salieron los límites del design system. El lienzo tiene que dejar que la IA ponga **ajustes en vivo** en un prototipo.
- **Estilos propios como referencia.** El punto de partida fue el estilo de la otra app en otro proyecto y el acento salió de otro proyecto: **la biblioteca tiene que guardar también los design systems de los proyectos propios**, no solo páginas ajenas.
- **Aprobar pantalla por pantalla.** El usuario aprobó cada una en el lienzo, con sus cambios: esas aprobaciones son pendientes del tipo "prueba" de la bandeja (D-010).
- **Lo que queda en el repo:** `DESIGN.md`, `.impeccable/design.json` y el contrato de la pantalla de referencia en `.impeccable/surfaces/`. El design system en Claude Design tenía además el libro de marca y los componentes en vivo; en el Centro, eso se muestra a partir de esos archivos.

### Guía de hitos frente a otros métodos
El usuario pidió comparar la guía con los métodos de plan para IA (Spec Kit, BMAD, Kiro, OpenSpec, Task Master, Backlog.md), porque la guía se armó sin un desarrollo profesional detrás. Las mejoras se harían en el proyecto `Skills`, que no se toca desde acá sin que el usuario lo pida (Q-14).

**Qué hace cada uno**, en lo que importa para comparar:
- **Spec Kit:** principios del proyecto → especificación → aclaraciones (hasta 5 preguntas, que se escriben en la especificación) → plan → tareas → implementación. Suma tres controles: listas que funcionan como "tests de los requisitos", un **análisis de coherencia** entre especificación, plan y tareas (no cambia nada, solo reporta huecos y contradicciones), y una **convergencia** después de construir que compara el código con la especificación y agrega las tareas que faltaron. Tiene una extensión para evaluar ideas (sigue, faltan datos o se descarta) y otra para errores.
- **BMAD:** roles (analista, PM, arquitecto, scrum master, desarrollador, QA). Divide los documentos grandes en **historias que traen todo su contexto** (porqué, restricciones, pruebas, enlaces). Antes de construir hace un **control de preparación** con veredicto (pasa, con reparos, no pasa). A mitad de camino tiene un procedimiento para **corregir el rumbo** (decide si hay que rehacer la definición, la arquitectura o solo las historias) y una **retrospectiva** al cerrar cada bloque. Tiene una pista corta para cambios chicos.
- **Kiro:** requisitos → diseño → tareas, con **cada tarea atada a su requisito**. Para errores usa un formato propio: comportamiento actual, esperado y lo que no debe cambiar. Ordena las tareas por dependencias y corre en paralelo las que pueden ir juntas. Los archivos de contexto se cargan según el archivo en que se trabaja.
- **OpenSpec:** los requisitos se escriben como escenarios "cuando… entonces…". Cada **cambio es una carpeta** con su propuesta, lo que agrega, cambia o quita de los requisitos, el diseño y las tareas; al terminarlo, se archiva y la especificación general queda actualizada. Pensado para proyectos que ya existen.
- **Task Master y Backlog.md:** desarman un documento en tareas con dependencias, eligen la siguiente y la ofrecen a la IA. Solo tareas.

**En qué la guía es mejor**
| Qué | La guía | Los otros |
|---|---|---|
| Alcance | De la idea a la operación: exploración, dominio, UX, design system, lanzamiento, operación | Casi todos empiezan en "especificar una funcionalidad" y terminan al implementarla. Solo BMAD cubre algo parecido |
| Para quién | Alguien que no programa: todo se verifica viendo (capturas, demos, criterios cumplidos) | Suponen un desarrollador que lee el código |
| Lo que espera del usuario | `Q-n` con opciones, visibles en el visor y con las respuestas archivadas | Las preguntas se hacen en el chat y se pierden |
| Decisiones | Registro único con el porqué de cada una | Repartidas en planes y diseños |
| Cuidado del contexto | Reglas de cuándo cortar el chat y cómo retomar | Ninguno lo trata (BMAD es conocido por gastar mucho) |
| Proporción | El perfil escala la protección según el proyecto; liviana | BMAD tarda meses en dominarse y es lento en tareas chicas; Spec Kit es criticado por exceso de markdown |

**Lo que los otros tienen y a la guía le falta**

La diferencia de fondo: la guía confía en que la IA y el usuario noten los huecos; los otros tienen **pasos que los buscan**. Ordenadas por valor:

| # | Qué agregar | De dónde sale | Por qué sirve | Valor |
|---|---|---|---|---|
| 1 | **Revisión de coherencia antes de construir:** al cerrar el hito 6, la IA cruza definición, UX, arquitectura y UI y da un veredicto (pasa, con reparos, no pasa): funcionalidad sin historia, historia sin criterios, pantalla sin flujo, decisión que contradice un documento | Spec Kit (análisis), BMAD (preparación) | Los errores de plan cuestan más cuando ya hay código | Alta |
| 2 | **Verificación al cerrar cada iteración:** antes de mostrarla, la IA recorre los criterios de aceptación contra lo construido y anota lo que falta | Spec Kit (convergencia), OpenSpec (verificación) | Evita "marcado como terminado pero no funciona", la crítica más repetida a BMAD | Alta |
| 3 | **Corregir el rumbo:** un procedimiento para cuando algo grande cambia a mitad de camino: qué documentos tocar y desde qué hito retomar | BMAD | La guía dice "se puede volver atrás", pero no cómo | Media |
| 4 | **Cambios como propuestas después del lanzamiento:** cada cambio grande con por qué, qué cambia en cada documento y tareas; al terminar, los documentos quedan al día | OpenSpec | En el hito 10 los documentos tienden a quedar viejos | Media |
| 5 | **Pista corta para errores y cambios chicos:** comportamiento actual, esperado y lo que no debe cambiar; causa; arreglo; prueba | Kiro, Spec Kit, BMAD | Hoy un error se clasifica pero no tiene un formato propio | Media |
| 6 | **Contexto por iteración:** cada I-n dice qué secciones leer y qué restricciones aplican, como el **Leer antes** de `estado.md` | BMAD (historias con contexto) | Un chat nuevo arranca sin leer de más | Media |
| 7 | **Criterios de aceptación como escenarios** "cuando… entonces…" | OpenSpec, Kiro | Se convierten directo en pruebas automáticas | Baja |
| 8 | **Retrospectiva corta** al cerrar cada hito: qué funcionó de la forma de trabajar | BMAD | Alimenta las mejoras de la propia guía | Baja |
| 9 | **Dependencias entre tareas** para trabajar con varios agentes a la vez | Kiro, Task Master | Solo sirve si el Centro corre agentes en paralelo | Baja (por ahora) |

**Conclusión:** se llevan a la guía las mejoras 1 a 6, las de valor alto y medio (Q-14, D-009). Se hacen en el proyecto `Skills`, en una sesión aparte. La 3 (corregir el rumbo) suma el caso que planteó el usuario en Q-13: una funcionalidad que obliga a cambiar el motor y volver a un hito anterior.

**Relación con el Centro:** varias de estas mejoras son también funciones del Centro: el gráfico de fases (D-008) puede marcar una fase "con reparos" según la revisión de coherencia, y la verificación de una iteración puede generar la `Q-n` de prueba para el usuario.

## Diferencial
Es el único lugar que conoce el **ciclo completo** de cada proyecto (la guía de hitos: plan, decisiones, lo que espera del usuario) y lo muestra para **dirigir**, no para programar. Trabaja sobre los archivos de cada proyecto, todo en la PC, con Claude Code como motor, y **junta lo que ya existe** (LocalSend, `impeccable`, el código del Gestor, Open Design) en vez de rehacerlo.

## Ideas del brainstorming
Las ideas y los pendientes están en `trabajo.md`.

## Riesgos iniciales
| Riesgo | Impacto | Cómo mitigarlo |
|---|---|---|
| Verificación de desarrolladores de Android bloquea instalar los APK propios | Alto para el puente, otra app y otro proyecto | ADB sigue permitido; cuenta gratis de aficionado; confirmar en el hito 3 |
| Depender de herramientas de terceros (LocalSend, Tailscale) que cambian o se abandonan | Medio | El puente se diseña con el transporte intercambiable |
| ADB por Wi-Fi se desconecta seguido | Medio (molesto, no bloquea) | Usarlo solo para instalar, con LocalSend como respaldo |
| Anthropic cambia otra vez la política de la suscripción con apps propias | Alto para el motor | Que la app no dependa de un único modo: puede abrir Claude Code en vez de manejarlo por debajo |
| Claude Code Desktop suma lo mismo que el Centro (proyectos, planes) y lo vuelve redundante | Medio | Construir solo lo propio (hitos, `Q-n`, diseño) y revisar en cada hito qué sumó Claude Code |
| Rehacer la conversación con la IA y quedar atrás de la app oficial | Alto | No copiar el chat: abrirlo o manejarlo por debajo |
| El Centro es enorme: siete áreas, cada una del tamaño de una app | Alto: no terminar nunca | MVP chico en el hito 2; cada área se apoya en algo que ya existe; el Gestor sigue en uso mientras tanto (D-013) |
| Tomar código de terceros con licencias que no lo permiten | Medio | Mirar la licencia pieza por pieza en el hito 3 (D-011, D-012); de Agentation y de Claude Design, solo ideas |
| Las skills de documentos de Anthropic no se pueden tener en local | Bajo | Quedan desde la cuenta como excepción (D-014) |

## Pistas para la investigación técnica (hito 3)
- Política de uso de la suscripción con el Agent SDK y `claude -p` (fuente: ayuda de Anthropic, 07-10-2026).
- Mods de Claude Code: qué pueden mostrar, dónde se ven, documentación oficial.
- Claude Code Desktop: si se puede abrir en un proyecto o una sesión desde otra app.
- ACP: qué agentes lo soportan de verdad (Claude Code, Codex, Gemini CLI, modelos locales), qué se pierde frente al Agent SDK directo y si usa la suscripción.
- Spike: línea de comandos de LocalSend 1.18 mandando un archivo sin interacción, y el celular aceptándolo solo como favorito (D-005).
- Estado real de la verificación de Android en Argentina y cómo instalar los APK propios.
- ADB por Wi-Fi: cómo mantener la conexión estable.
- Taildrop por línea de comandos en Windows.
- Licencia de tldraw para una app de escritorio local: si cuenta como producción y qué da la licencia de aficionado.
- Excalidraw como componente: guardar y abrir archivos del proyecto, y que la IA los escriba (MCP en vivo).
- Diseño (D-011): qué partes de Open Design y Open CoDesign se pueden tomar (vista previa aislada, modo comentario, selector de direcciones, sus `DESIGN.md`) y la licencia de cada una; qué skills de diseño conviene juntar o adaptar (`impeccable`, extractores de estilo, las de Open Design); cómo arman el lienzo y el design system los tipos de Claude Design (instrucciones y archivos); la versión vigente del formato `DESIGN.md` de Google.
- Revisión de la app (D-012): extensión para Chrome y Edge con un programa local que escriba los archivos (mensajería nativa o servidor en la PC); qué marca de archivo y línea deja cada framework en modo desarrollo (LocatorJS, React Grab, code-inspector, inspectores de Svelte y Vue) y sus licencias; cómo hacer llegar "enviar ahora" a la sesión abierta de Claude Code (hook al enviar un mensaje); que el mismo selector sirva en el lienzo de Diseño.

## Fuentes
- [LocalSend 1.18.0 con línea de comandos (Ubuntu Handbook, ago. 2026)](https://ubuntuhandbook.org/index.php/2026/08/the-airdrop-alternative-localsend-1-18-0-released-with-cli-support/)
- [KDE Connect (apps.kde.org)](https://apps.kde.org/en/kdeconnect/) · [F-Droid](https://f-droid.org/en/packages/org.kde.kdeconnect_tp/)
- [Taildrop (documentación de Tailscale)](https://tailscale.com/docs/features/taildrop.md) · [CLI de Tailscale](https://tailscale.com/kb/1080/cli)
- [Syncthing-Fork (GitHub)](https://github.com/Catfriend1/syncthing-android) · [F-Droid](https://f-droid.org/en/packages/com.github.catfriend1.syncthingfork)
- [adb (Android Developers)](https://developer.android.com/tools/help/adb.html)
- [Phone Link: portapapeles y archivos (Windows Latest, dic. 2025)](https://windowslatest.com/2025/12/17/you-can-now-lock-windows-11-from-android-remotely-send-files-to-pc-share-clipboard-mirror-screen-and-more/)
- [Obtainium (F-Droid)](https://f-droid.org/en/packages/dev.imranr.obtainium.fdroid/)
- [ntfy autoalojado (guía)](https://akashrajpurohit.com/blog/selfhost-ntfy-for-push-notifications)
- [Claude Code Desktop (documentación oficial)](https://code.claude.com/docs/en/desktop)
- [Agent SDK con el plan de Claude (ayuda de Anthropic)](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)
- [Mods de Claude Code (Better Stack)](https://betterstack.com/community/guides/ai/claude-code-mods/)
- [Interfaces para Claude Code 2026 (Sticky for Claude)](https://stickyforclaude.com/blog/best-claude-code-gui-2026/) · [Nimbalyst](https://nimbalyst.com/blog/best-claude-code-gui-tools-2026/) · [opcode (GitHub)](https://github.com/winfunc/opcode)
- [Orquestadores de agentes 2026 (crystl)](https://crystl.dev/blog/best-ai-agent-orchestration-tools/) · [Vibe Kanban (VirtusLab)](https://virtuslab.com/blog/ai/vibe-kanban/)
- [Agent Client Protocol (novedades)](https://agentclientprotocol.com/updates) · [Qué es ACP (Morph)](https://www.morphllm.com/agent-client-protocol)
- [SKILL.md como estándar abierto (noqta, 2026)](https://noqta.tn/en/news/skill-md-open-standard-30-ai-coding-tools-adoption-2026)
- [Verificación de desarrolladores de Android (Android Developers Blog, mar. 2026)](https://android-developers.googleblog.com/2026/03/android-developer-verification-rolling-out-to-all-developers.html) · [Android Authority](https://www.androidauthority.com/android-app-verification-impact-3650447/)

- [Linear MCP con Claude Code (Unblocked)](https://getunblocked.com/blog/linear-mcp/) · [Plane AI en instalaciones propias](https://plane.so/blog/plane-ai-is-coming-to-self-hosted-deployments)
- [Spec Kit: referencia de comandos](https://github.github.io/spec-kit/reference/agentic-sdd.html) · [Spec Kit (GitHub)](https://github.com/github/spec-kit) · [OpenSpec (GitHub)](https://github.com/Fission-AI/OpenSpec) · [Kiro: specs](https://kiro.dev/docs/specs/) · [Kiro: steering](https://kiro.dev/docs/steering/) · [Task Master (GitHub)](https://github.com/eyaltoledano/claude-task-master) · [BMAD: mapa de flujos v6](https://docs.bmad-method.org/reference/workflow-map/)
- [Herramientas de desarrollo por especificación 2026 (codemyspec)](https://codemyspec.com/blog/best-spec-driven-development-tools) · [Spec Kit vs Kiro](https://codemyspec.com/blog/spec-kit-vs-kiro) · [BMAD Method explicado](https://codemyspec.com/blog/bmad-method-explained)
- [Backlog.md (README)](https://cdn.jsdelivr.net/gh/MrLesk/Backlog.md@main/README.md) · [Plannotator](https://plannotator.ai/)
- [Miro MCP: uso a sept. 2026 (Miro)](https://miro.com/newsroom/momentum-grows-for-miro-mcp-as-users-embrace-the-canvas-for-ai-collaboration/)
- [Licencia de tldraw](https://tldraw.dev/sdk-features/license-key) · [Kit de agentes de tldraw](https://tldraw.dev/starter-kits/agent)
- [MCP de Excalidraw en vivo (yctimlin)](https://mcpservers.org/servers/yctimlin/mcp_excalidraw) · [Conector oficial de Excalidraw](https://claude.com/de/connectors/excalidraw-app-demo)
- [JSON Canvas (Obsidian)](https://obsidian.md/blog/json-canvas/) · [React Flow (GitHub)](https://github.com/xyflow/xyflow) · [Mermaid](https://docsearch.algolia.com/mcp/docs/repo/mermaid-js/mermaid)

- [AskUserQuestion en el Agent SDK (Anthropic)](https://code.claude.com/docs/en/agent-sdk/approvals) · [Guía de AskUserQuestion (claudelog)](https://claudelog.com/faqs/what-is-ask-user-question-tool-in-claude-code/)
- [Elicitación de MCP: formulario y URL (Vercel)](https://vercel.com/i/mcp-elicitation-form-vs-url-mode) · [Conceptos del cliente MCP 2026-07-28](https://modelcontextprotocol.io/docs/2026-07-28/learn/client-concepts.md) · [Elicitación en ACP](https://agentclientprotocol.com/protocol/v2/elicitation.md)
- [Agent Inbox y agentes en segundo plano (LangChain)](https://www.langchain.com/blog/introducing-ambient-agents) · [interrupt de LangGraph](https://blog.langchain.com/making-it-easier-to-build-human-in-the-loop-agents-with-interrupt)
- [HumanLayer (PyPI)](https://pypi.org/project/humanlayer)

- [Pasar de Claude Design aparte a Claude (ayuda de Anthropic)](https://support.claude.com/en/articles/17440474-migrate-from-standalone-claude-design-to-claude) · [Empezar con Claude Design](https://support.claude.com/en/articles/14604416-get-started-with-claude-design) · [Claude Design (DataCamp)](https://www.datacamp.com/blog/claude-design)
- [Open Design (GitHub)](https://github.com/nexu-io/open-design) · [Open CoDesign (GitHub)](https://github.com/OpenCoworkAI/open-codesign) · [Alternativas a Claude Design (Banani)](https://www.banani.co/blog/claude-design-alternatives-free)
- [Superdesign (GitHub, archivado)](https://github.com/superdesigndev/superdesign) · [Superdesign: extraer un design system de una web](https://www.superdesign.dev/blog/extract-design-system-from-website)
- [DESIGN.md abierto por Google Stitch (The Decoder)](https://the-decoder.com/googles-open-source-design-md-gives-ai-agents-a-prompt-ready-blueprint-for-brand-consistent-design/) · [Especificación de DESIGN.md (dsebastien)](https://www.dsebastien.net/design-md-specification/)
- [extract-design-system (README)](https://cdn.jsdelivr.net/gh/arvindrk/extract-design-system@main/README.md) · [Source Design (Product Hunt)](https://www.producthunt.com/products/source-design)
- [Penpot y MCP (Smashing Magazine, ene. 2026)](https://smashingmagazine.com/2026/01/penpot-experimenting-mcp-servers-ai-powered-design-workflows/) · [penpot-mcp-server (GitHub)](https://github.com/ancrz/penpot-mcp-server)
- [Mobbin en 2026 (UX Magic)](https://uxmagic.ai/blog/mobbin-review-2026) · [Alternativas a Eagle (AlternativeTo)](https://www.alternativeto.net/software/eagle-cool/?p=2)

- [Panel de navegador de Claude Code Desktop (documentación)](https://code.claude.com/docs/en/desktop) · [Vista previa y selección de elementos (Anthropic)](https://claude.com/blog/preview-review-and-merge-with-claude-code) · [Cómo se usa (azukiazusa)](https://azukiazusa.dev/en/blog/claude-code-preview)
- [Modo live de impeccable](https://www.impeccable.style/docs/live)
- [Agentation (README)](https://cdn.jsdelivr.net/npm/agentation/README.md) · [React Grab (documentación)](https://www.mintlify.com/aidenybai/react-grab/introduction) · [stagewise (documentación)](https://stagewise.io/docs) · [stagewise pasa a editor propio (Yespress)](https://yespress.io/glenn-toews)
- [Marker.io con MCP](https://marker.io/blog/mcp-server-auto-resolve-issues) · [BugHerd suma IA y MCP (ago. 2026)](https://www.cantechletter.com/newswires/bugherd-launches-ai-features-for-faster-website-bug-fixes/)
- [Guía electron-live-annotations (TomeVault)](https://tomevault.io/tome/danialhasan/electron-live-annotations) · [Ver la interfaz de apps Electron con Claude Code (juri.dev)](https://www.juri.dev/articles/visual-feedback-loop-electron-apps-claude-code) · [Electron Driver MCP](https://mcpservers.org/zh-CN/servers/mesomya/electron-driver)
- [code-inspector](https://docsearch.algolia.com/mcp/docs/repo/zh-lx/code-inspector) · [Inspector de Svelte](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/inspector.md) · [Inspector de Vue](https://classic.yarnpkg.com/en/package/vite-plugin-vue-inspector) · [LocatorJS](https://docsearch.algolia.com/mcp/docs/repo/infi-pc/locatorjs) · [Source Inspector de TanStack](https://tanstack.com/devtools/latest/docs/source-inspector)

## Decisión
**Construir, con foco en dirigir y sin rehacer lo que existe** (2026-10-22). El Centro es una app propia (D-006) que se apoya en piezas ya hechas:

| Área | Qué se hace |
|---|---|
| Puente PC–celular | LocalSend más un envío automático desde la PC (D-005) |
| Motor y marco | App propia, con el Agent SDK de Claude Code aislado en un solo lugar (D-006, D-007) |
| Proyectos y plan | Gráfico de fases y pasos leído de `docs/` (D-008) |
| Pendientes del usuario | Bandeja propia de todas las `Q-n`, con tipo y si frenan (D-010) |
| Diseño | Lienzo y biblioteca propios sobre `DESIGN.md`; el diseño lo hace la IA con skills (D-011) |
| Revisión de la app | Extensión del navegador, comentarios en archivos planos (D-012) |
| Repaso de lo propio | La guía suma mejoras (D-009); el Gestor, solo mantenimiento hasta que el Centro lo cubra (D-013); skills locales donde la licencia lo permite (D-014) |

Motivo: ninguna herramienta junta el ciclo completo de los proyectos, y cada área tiene algo que se puede usar o adaptar, así que construir es sobre todo unir.

## Portón
- [x] Hay al menos 3 alternativas analizadas (o una explicación de por qué no existen): una tabla por área.
- [x] El diferencial está escrito en una o dos frases.
- [x] Los riesgos principales están listados.
- [x] Hay una decisión explícita de seguir, con el enfoque elegido.
