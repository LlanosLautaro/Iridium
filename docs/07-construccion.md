# Construcción

**Fecha:** 2026-10-23
**Stack:** Electron + TypeScript + React (D-028); estructura y capas de `05-arquitectura.md`.

> Plan aprobado por el usuario el 2026-10-23 (Q-56).

## Plan de iteraciones
Las historias *Must* de `04-ux.md` en seis iteraciones (eran cinco; D-041 sumó Archivos, Git y las conversaciones anteriores). Orden de la guía: primero el esqueleto de punta a punta, después lo más riesgoso (el motor), después lo más valioso (responder), al final el resto del MVP.

| ID | Objetivo | Historias | Estado |
|---|---|---|---|
| I-1 | Esqueleto: la app abre, muestra los proyectos y entra a uno, con el instalador probado | H-1, H-3 | aprobada por el usuario (Q-57) |
| I-2 | Conversar con la IA: Seguí, Detener y varias sesiones a la vez | H-4, H-5, H-14, H-2, H-6 | aprobada por el usuario (Q-58) |
| I-3 | Pendientes: ver y responder las `Q-n` de todos los proyectos | H-9, H-10, H-11 | aprobada por el usuario (Q-60) |
| I-4 | Marco de tres paneles (D-041), Mapa, Docs, Archivos y conversaciones anteriores; pendientes y scripts como entrada (D-043) | H-7, H-8, H-15, H-17, C-11 | aprobada por el usuario (Q-64), con los ajustes de Q-62 y Q-63 (D-044) |
| Revisión | Módulo Revisión de la app: la extensión del navegador para comentar la app en desarrollo (D-046); su plan, en `modulos/revision/estado.md` | C-36 a C-39 | completo (R-I1 y R-I3 aprobadas; R-I2 validada en Q-108) |
| I-5 | Git del proyecto, solo para mirar (D-041) | H-16 | aprobada por el usuario (Q-75), con el ajuste de D-058 (Q-76) |
| I-6 | Uso, contexto, modelo y esfuerzo (D-045), avisos y errores del motor; cerrar con sesiones trabajando | H-12, H-13, F-5, F-6, C-58 | aprobada por el usuario (Q-77: los avisos, cerrar y los colores del uso el 2026-10-30; un día completo de uso el 2026-10-31) |
| I-7 | Compartir: por ahora solo para el usuario (D-069): iniciar sesión desde Iridium, actualización al cerrar, GitHub privado con `dev` y `main`, elegir la carpeta de proyectos | C-59 | en curso: es el frente Compartir (`modulos/compartir/`; CO-I1 a CO-I4 hechas: falta probar CO-I2 y CO-I4) |
| I-8 | Frentes y Postergar: el Mapa y Pendientes muestran cada frente; el botón Postergar en las pruebas (D-063) | C-62, C-63 | aprobada por el usuario (Q-82) |

El módulo Revisión se construye antes de I-5 (D-046). Al terminar I-6 el MVP está completo. Desde D-063 el trabajo sigue por **frentes** (el núcleo o un módulo): I-8 prepara el Mapa y Pendientes para verlos, y después avanzan hasta dos a la vez, primero Skills y Apariencia y ajustes (abiertos el 2026-10-30: `modulos/skills/` y `modulos/apariencia/`). Apariencia terminó su construcción el 2026-10-31 (AP-I1) y entró Compartir (I-7). Las dos semanas de uso real de `02-definicion.md` › Criterios de éxito (hito 8) corren mientras tanto.

## Detalle de cada iteración
Cada iteración termina con capturas de la app abierta (Playwright, con el motor falso) y una prueba del usuario como `Q-n` con casillas.

### I-1 — Esqueleto de punta a punta
- **Antes de la primera pantalla:** el repo según `05-arquitectura.md` › Estructura del repo (pnpm, Biome, Vitest, Playwright, la regla de capas); los tokens de `docs/ui/tokens.css` como base de estilos; el hook de `impeccable` activado.
- **Código del Gestor (D-026):** se copian los lectores de `core/` e `infra/` con sus 217 pruebas, y tienen que pasar en el Centro.
- **Proyectos (H-1):** la grilla de W-2 con nombre, ícono, hito, estado (D-034) y el número de `Q-n` (distinguiendo las que frenan). Archivados ocultos con su interruptor. Se actualiza sola cuando cambia un `estado.md`.
- **Vista del proyecto (H-3):** el marco de W-1 y la vista de W-3 con el área de conversación todavía vacía y el panel lateral; nada de otro proyecto. Volver a Proyectos.
- **Riesgo de la arquitectura:** armar el instalador de Windows con el SDK adentro y comprobar que el motor arranca y verifica la suscripción desde la app instalada (`05-arquitectura.md` › Despliegue). Si falla, se resuelve acá, antes de construir sobre él.
- **Prueba del usuario:** instalar, abrir, ver sus proyectos reales, entrar a uno y volver; editar un `estado.md` y verlo cambiar.

### I-2 — Conversar con la IA
- **La frontera `Motor`** (D-025) con el SDK de versión fija, y el motor falso para las pruebas.
- **Seguí y Nueva (H-4):** la última conversación del proyecto (también la de VS Code, con el aviso de D-027), el campo de texto y la sesión en *bypass* con la instrucción del Centro.
- **Sin esperar al usuario (H-5):** sin preguntas con opciones; al terminar, las `Q-n` nuevas con **Responder** (lleva a Pendientes cuando exista en I-3; hasta entonces, al documento).
- **Detener (H-14)** y retomar avisándole a la IA que se la detuvo.
- **Barra de sesiones (H-2) y cambiar de proyecto sin cortar nada (H-6):** una sesión por proyecto, la vista de cada uno guardada en memoria.
- **Prueba del usuario:** Seguí en un proyecto de prueba, Detener a mitad, retomar; dos proyectos trabajando a la vez mientras se cambia entre ellos.

### I-3 — Pendientes
- **Pendientes (H-9):** W-5 con la columna de proyectos, los pendientes del elegido con sus citas adentro y **Ver entero** en el panel derecho.
- **Responder (H-10, H-11):** decisiones con opción y nota, pruebas como lista con nota por punto, guardar a medias; escritura atómica en `respuestas/Q-n.md` con el formato de la guía; preguntar antes de reemplazar una respuesta existente.
- **Seguí resaltado** cuando no queda nada sin responder (F-3).
- **Prueba del usuario:** responder pendientes reales de un proyecto y que la IA los tome con Seguí.

### I-4 — Mapa y Docs
> Ampliada por D-041 (2026-10-28): arma también el marco nuevo, Archivos y las conversaciones anteriores. Prototipo: `ui/vista-proyecto.html`.

- **Marco de tres paneles (D-041):** barra de título propia con las pestañas de sesiones y los botones de Windows; el botón de inicio con el número de preguntas; la barra de íconos que cambia entre el inicio (Proyectos, Pendientes) y el proyecto (Mapa, Docs, Archivos, Git, Scripts); la conversación a la derecha, con su ancho que se arrastra y se recuerda. Se quitan el panel desplegable y el intercambio.
- **Mapa (H-7):** el estado del proyecto de D-035: línea de hitos y, debajo, el hito actual con próximo paso, pasos, lo que espera y lo último de la IA.
- **Docs (H-8):** el lector liviano de D-035 con los códigos y las citas como enlaces, «En esta página» y volver en un paso (F-4).
- **Scripts:** `scripts.md` en el lector (los botones son C-11, después del MVP).
- **Archivos (H-15):** el árbol del proyecto sin `node_modules` ni `.git`, y el visor de solo lectura (texto con colores, imágenes, markdown) que comparte piezas con el lector.
- **Conversaciones anteriores (H-17):** la lista del proyecto (las de Iridium y las de VS Code) y abrir una para seguirla.
- **Prueba del usuario:** recorrer el mapa de dos proyectos, comprobar que coincide con su `estado.md` y saltar entre códigos; ensanchar la conversación; abrir archivos; volver a una conversación anterior.

### I-5 — Git del proyecto
- **Git (H-16):** la rama, los cambios sin guardar y el historial; al elegir un commit, sus archivos con el antes y después. Solo lectura, leído con el `git` del sistema.
- **Prueba del usuario:** mirar lo que hizo la IA en el último turno de un proyecto y encontrar un cambio en un archivo.

### I-6 — Uso, avisos y errores
- **Uso, contexto, modelo y esfuerzo (H-12, C-58, D-045):** la ventana de 5 horas y la semana, con cuándo se libera cada una, en la barra de estado, con un botón que despliega el detalle: cuándo se libera cada ventana y si el ritmo de uso alcanza para llegar al reinicio semanal (unos 14 % por día; R-1); en la barra de la conversación, el contexto (marcado pasado el 80 %) y los selectores de modelo y esfuerzo, recordados por proyecto.
- **Avisos (H-13)** dentro de la app para los proyectos que no están a la vista.
- **Errores del motor (F-5):** sin sesión iniciada, uso agotado, falla en medio.
- **Cerrar con sesiones trabajando (F-6)** y los registros diarios.
- **Prueba del usuario:** usar el MVP un día completo con dos o tres proyectos.

### I-7 — Compartir (beta)
> **Desde D-069 (Q-90) se hace en el módulo Compartir y solo para el usuario; lo de abajo que es para repartir queda en suspenso.** D-054 (Q-72). El detalle de lo que falta está en Ideas nuevas › Compartir Iridium con conocidos.
- **GitHub:** el repo con las ramas `dev` (trabajo) y `main` (lo que se reparte), con doble factor; **público** (Q-73, D-057).
- **Limpiar `docs/` antes de publicar (D-057):** que solo hable de Iridium. Lo que trata de otros proyectos (otras apps, otra app, otro proyecto, el Gestor, `Skills`) se generaliza («una app Electron del usuario») o sale del repo; las rutas de la PC del usuario y su carpeta de proyectos, también. Se revisa también el historial de git, que es público con el repo.
- **Instalador con actualización:** publicado en GitHub Releases, versiones beta; Iridium avisa y se actualiza al cerrar (resuelve armar Iridium con la app abierta).
- **Carpeta de proyectos:** elegirla al primer arranque, en vez de la fija.
- **La guía:** repartir `hitos-desarrollo-app` con Iridium o que Iridium la instale.
- **La carpeta `Ideas`:** crearla con su `CLAUDE.md` en la carpeta de proyectos de cada uno; sin ella no aparece el chat de la vista de Proyectos (D-060).
- **Antes:** confirmar las condiciones de uso de Claude Code en una app repartida y revisar el perfil y la protección.
- **Prueba del usuario:** instalar desde GitHub en otra PC (o con otra carpeta) y recibir una actualización.

### I-8 — Frentes y Postergar
> D-063 (Q-80 y Q-81). Un frente es el núcleo o un módulo (`docs/modulos/<nombre>/estado.md`).
- **Mapa por frente (C-63):** arriba, una fila con los frentes del proyecto: el núcleo (con su hito) y cada módulo (con el paso en que está y cuántas preguntas tiene). Tocar un módulo muestra su tarjeta: sus pasos del ciclo reducido, sus iteraciones si tiene, en qué está, su próximo paso y lo que espera del usuario. El núcleo se ve como hasta ahora, con solo sus preguntas.
- **Pendientes por frente (C-63):** cada pregunta de un módulo lleva el nombre de su frente.
- **Postergar (C-62):** en las pruebas, un botón que escribe la respuesta como `**Postergada**` con lo marcado y anotado; se ve como «Postergada» hasta que la IA la procesa.
- **Prueba del usuario:** mirar el Mapa y Pendientes de Iridium con el módulo Revisión y los frentes nuevos; postergar una prueba.

## Log de iteraciones

### I-1 — Esqueleto de punta a punta (2026-10-23)
**Qué se hizo**
- El repo según `05-arquitectura.md` › Estructura del repo: Electron 44, React 19, electron-vite, pnpm, Biome (con la regla de capas: `core` no toca disco ni Electron; solo `motor/` importa el SDK; la ventana no toca Electron ni el disco), Vitest y Playwright. Los estilos importan `docs/ui/tokens.css` tal cual. El hook de `impeccable` ya estaba activo y revisó cada archivo de estilos y pantallas.
- Código del Gestor (D-026): se copiaron `core/`, `infra/`, `app/` y `shared/` (este último como `src/compartido/`) del Gestor 1.2.0 con sus 18 archivos de pruebas; cada archivo dice de qué versión sale. Las 217 pruebas pasan en el Centro.
- **Proyectos (H-1):** la grilla de W-2 con nombre, ícono, estado con ícono y palabra (D-034), hito, descripción y el número de `Q-n` sin responder, con «· frena» cuando alguna frena (lee la línea `Tipo:` de D-019). Orden de H-1; los sin ficha después, los archivados al final con su interruptor (se recuerda) y las fichas dañadas últimas. Estados de carga, carpeta vacía y carpeta que no se puede leer. Se actualiza sola: vigila la carpeta de proyectos y relee cuando cambia un `.proyecto.json`, un ícono, un `estado.md` (también de módulos) o una respuesta. El ícono de Pendientes muestra el total sin responder.
- **Vista del proyecto (H-3):** el marco de W-1 y la vista de W-3: migas con el hito y las preguntas, la conversación vacía con lo que hará Seguí (el próximo paso del proyecto) y el panel derecho con Mapa y Docs todavía vacíos. `Ctrl+B` abre y cierra el panel, el borde se arrastra o se mueve con las flechas, el botón de flechas intercambia conversación y panel (se recuerda) y cada proyecto guarda en memoria si tenía el panel abierto. Se vuelve con Proyectos (migas, ícono o `Ctrl+1`).
- **Motor:** la frontera `Motor` con `verificar` (y un motor falso para las pruebas). Al abrir, comprueba sin mandar mensajes que Claude Code tenga sesión iniciada y use la suscripción; la barra de estado lo muestra («Claude · Pro», o el aviso si no hay sesión o hay una clave de API).
- **Riesgo de la arquitectura, resuelto:** la app armada (`pnpm dist`, D-036) deja el `claude.exe` del SDK fuera del archivo comprimido; desde ella la grilla aparece en 1,8 s (2,9 s con la PC ocupada armando otra cosa) y el motor verifica la suscripción en 1 s.
- `pnpm audit`: `markdown-it` 15.0.2 y `zod` 4.6.5 tenían avisos de seguridad; se subieron a 15.0.3 y 4.6.7 (sin avisos). El gestor anterior usa el mismo `markdown-it` 15.0.2: queda para una sesión de ese proyecto.

**Pruebas:** 253 automáticas (217 del Gestor y 36 del Centro: grilla, preguntas que frenan, vigilancia, configuración, lectura de la carpeta, verificación del motor) y 4 con la app abierta (Playwright, motor falso): grilla y archivados, actualización sola, entrar y volver con el panel, carpeta que no existe.

**Capturas:** `tools/capturas.ts` (proyectos reales, solo lectura) deja en `tools/salida/` la grilla, los archivados, la vista del proyecto con y sin panel, intercambiada y Pendientes.

**Prueba del usuario:** Q-57, aprobada el 2026-10-24.
- [ ] Abrir Iridium (`scripts.md` › Abrir Iridium) y ver los proyectos reales con su hito y sus preguntas.
- [ ] Prender y apagar «Archivados».
- [ ] Entrar a un proyecto, abrir el panel con `Ctrl+B`, intercambiar con el botón de flechas y volver a Proyectos.
- [ ] Con Iridium abierto, editar el `docs/estado.md` de algún proyecto (por ejemplo, cambiar el nombre del hito) y ver que la tarjeta cambia sola.
- [ ] Abajo a la izquierda dice «Claude · Pro».

### I-2 — Conversar con la IA (2026-10-24)
**Qué se hizo**
- **La frontera `Motor` completa** (D-025): abrir una sesión nueva o retomando una conversación, mandar mensajes, Detener, cerrar, listar las conversaciones guardadas del proyecto y leerlas. Las sesiones van en modo *bypass*, con las configuraciones del usuario y del proyecto (skills, `CLAUDE.md`), sin la herramienta de preguntas con opciones y con la instrucción del Centro. Cada sesión se cierra sola al terminar su turno y la siguiente retoma la misma conversación (D-037). El motor falso imita todo eso para las pruebas.
- **Seguí y Nueva (H-4):** al abrir un proyecto se ve su última conversación, también la de VS Code (se lee en unos 40 ms y no manda nada al modelo), con su fecha y de dónde viene, y los botones **Seguí** y **Nueva**; sin conversación, la vista de I-1 con **Seguí**. El campo de texto manda un mensaje propio (Enter; Shift+Enter, salto de línea); mientras trabaja, lo que se escribe se suma a lo que está haciendo. Si la conversación se usó fuera de Iridium hace menos de 10 minutos, un aviso lo dice y sugiere **Nueva** (D-027). Las conversaciones muy largas muestran las últimas 150 entradas y **Ver mensajes anteriores**.
- **La conversación:** los turnos de «Vos» y de la IA; el texto de la IA con formato (Markdown seguro, sin HTML); las herramientas que usó en una línea («Leyó `docs/estado.md`», «Usó 5 herramientas», que se despliega); «Trabajando · Editó …» mientras trabaja.
- **Sin esperar al usuario (H-5):** al terminar, las `Q-n` nuevas que dejó aparecen en un recuadro con su tipo, si frenan y **Responder**, que por ahora abre `docs/estado.md` (Pendientes llega en I-3). Los pedidos de permiso no llegan en *bypass*: el criterio de rechazarlos queda sin efecto (D-038).
- **Detener (H-14):** junto al campo mientras trabaja; frena en el acto, la conversación dice «Detuviste a la IA.» y el próximo mensaje se lo avisa a la IA (si no, cree que le rechazaron un comando).
- **Barra de sesiones (H-2) y varios proyectos a la vez (H-6):** una pestaña por sesión abierta con su estado (Trabajando · Terminada · N preguntas · Error); tocarla abre el proyecto; × cierra la que no trabaja. La tarjeta del proyecto muestra el mismo estado. Una sesión terminada sin error se cierra sola al salir de su proyecto después de verla (W-4: «queda hasta que se abre el proyecto»); la que falló queda hasta Seguí o ×. Cada proyecto guarda su conversación y su posición en memoria: cambiar de proyecto o de sección no corta ni recarga nada.
- **Datos del Centro:** `sesiones.json` guarda el resumen de cada conversación que usó Iridium (dónde empezó, cuándo terminó su último turno, si se detuvo, qué preguntas dejó).
- **Prueba con el motor real** (`tools/probar-conversacion.ts`, modelo barato, proyecto descartable): Seguí en una conversación nueva (la IA, ante una decisión del usuario, escribió la `Q-1` en `estado.md` y cerró); la conversación guardada se lee; Detener corta en 1,4 s; al retomar, la IA sabe que la detuvo el usuario. Desde la app armada, un mensaje al Claude Code real se respondió en 9,5 s.
- `pnpm audit`: Vite 7.3.6 y Electron 44.5.1 tenían avisos; se subieron a 7.3.7 y 44.9.1 (sin avisos).

**Pruebas:** 269 automáticas (16 nuevas: reglas de sesión, traducción de lo que dice Claude Code y los casos de uso con el motor falso) y 7 con la app abierta (3 nuevas: Seguí con las preguntas que deja, Detener y retomar, dos proyectos trabajando mientras se cambia entre ellos).

**Capturas:** `test-results/i2-terminada.png`, `i2-detenida.png` e `i2-dos-sesiones.png` (motor falso); `tools/salida/3-proyecto.png` (la conversación real de este proyecto, empezada en VS Code, con el aviso de D-027) y `7-real-armada.png`.

**Prueba del usuario:** Q-58, aprobada el 2026-10-24.
- [ ] Abrir Iridium (`scripts.md` › Abrir Iridium; la versión nueva ya está armada) y entrar a un proyecto con conversación en VS Code y ver la última, con «empezada en VS Code».
- [ ] En un proyecto que quieras avanzar, tocar **Seguí** y ver a la IA trabajar hasta que termina (la pestaña pasa a «Terminada» o a «N preguntas»).
- [ ] Mandar un mensaje que la ponga a trabajar un rato, tocar **Detener** a mitad y retomar con **Seguí**.
- [ ] Con un proyecto trabajando, ir a otro y ponerlo a trabajar también; cambiar entre los dos con las pestañas de arriba.

### I-3 — Pendientes (2026-10-25)
**Qué se hizo**
- **Pendientes (H-9, W-5):** la columna con los proyectos que esperan algo (primero los que tienen alguno que frena; después, en el orden de la grilla) y, aparte, «Respondidas, sin procesar». Al elegir uno, todos sus pendientes en los grupos de W-5: frenan, sin responder, a medias y respondidas sin procesar. Cada uno muestra código, tipo, si frena, la pregunta (plegada si es muy larga) y su contexto con los códigos como enlaces.
- **Contexto dentro (D-022):** cada código y cada cita `archivo.md` › Sección del contexto aparece con el comienzo de su sección, plegado si es largo; las citas anidadas (`07-construccion.md` › I-2 — … › Prueba del usuario) llegan hasta el subtítulo. Una cita que no se encuentra lo dice. **Ver entero** abre el documento en un panel a la derecha, bajado y marcado en esa sección; los enlaces de adentro abren su documento en el mismo panel; se cierra con × o `Esc`. Es una versión angosta del lector: el completo es Docs (I-4).
- **Responder (H-10, H-11, W-6):** decisiones con opción (la recomendada marcada), «Otro» y nota; pruebas y tareas con una casilla y una nota por punto, nota general y, si la pregunta también trae opciones, las opciones; consultas con texto libre. **Enviar** se habilita cuando hay algo para mandar y escribe `docs/respuestas/Q-n.md` de forma atómica con el formato de la guía y las casillas de D-019. Las respondidas muestran lo elegido y se pueden **Corregir** hasta que la IA las procesa.
- **Guardar a medias** (D-039): queda en `borradores.json` de los datos de Iridium, no en el proyecto; la IA no lo ve. Lo escrito sin guardar no se pierde al cambiar de proyecto o de sección.
- **No pisar lo de afuera:** si la respuesta cambió desde que se leyó (el Gestor, a mano), no se escribe: el pendiente muestra lo que dice ahora y ofrece **Dejar la de afuera** o **Reemplazar con la mía**. Una respuesta ya procesada no se cambia.
- **Seguí** en la cabecera del proyecto arranca la sesión sin abrirlo (o dice «La IA trabaja»); se resalta cuando no queda nada sin responder (F-3). Al responder, la columna se reordena pero la vista se queda en el proyecto elegido.
- **Responder** de la conversación (H-5) y el número de preguntas de las migas llevan a Pendientes con ese proyecto.
- Del código del Gestor se reutilizaron los lectores de preguntas, respuestas, códigos y secciones; se les sumó lo que pide Iridium (las preguntas con su archivo de respuesta, las citas, y ver un documento sin los lugares de tarjeta del visor).
- `pnpm audit`: sin avisos.

**Precisiones al diseño:** la columna no ordena «por el pendiente más viejo» (W-5): las `Q-n` no tienen fecha; después de las que frenan va el orden de la grilla. Un proyecto que no se puede leer se marca «Error» en la columna después de elegirlo.

**Pruebas:** 297 automáticas (28 nuevas: armar y leer de vuelta las respuestas, las citas, y los casos de uso con un proyecto de verdad: orden, responder, cambio afuera, procesada, a medias fuera del proyecto, Ver entero) y 12 con la app abierta (5 nuevas: la columna con lo que cita cada pendiente y Ver entero; responder una decisión y una prueba, también a medias, Corregir y Seguí resaltado; el cambio afuera; Responder desde la conversación; «Nada te espera»).

**Capturas:** `test-results/i3-pendientes.png`, `i3-ver-entero.png`, `i3-a-medias.png`, `i3-todo-respondido.png` e `i3-cambio-afuera.png` (motor falso); `tools/salida/6-pendientes*.png` (las preguntas reales del Gestor y de otra app, con Ver entero) y `tools/salida/empaquetada/` (la app armada).

**Prueba del usuario:** Q-59.
- [ ] Abrir Iridium y entrar a Pendientes (el ícono de la bandeja o `Ctrl+2`): ver los proyectos que esperan algo y, al elegir uno, sus pendientes con lo que citan.
- [ ] En una cita, tocar «Ver entero»: el documento se abre a la derecha en esa sección; cerrarlo con `Esc`.
- [ ] Responder una pregunta real y fijarse que pasa a «Respondida, sin procesar».
- [ ] En ese proyecto, cuando no quede nada sin responder, tocar **Seguí** y ver que la IA toma la respuesta (la pregunta sale de Pendientes al terminar).

**Ajustes por la prueba (Q-59, 2026-10-28):** el usuario probó los cuatro puntos y funcionaron; pidió tres ajustes, resueltos en el momento:
- Las casillas de una prueba se marcan solo al tocar la casilla, no el texto del punto.
- Las notas (de cada punto, «Otro» y la nota general) crecen hacia abajo con lo que se escribe, en vez de correrse a un costado.
- **Nueva** abre una conversación en blanco en vez de arrancar con Seguí (D-040): empieza con lo que se le escriba o con **Seguí**, y **Volver a la anterior** la descarta.

Las otras dos observaciones van a «Pendientes reportados» (los scripts con botones) y a los cambios de la guía (la opción «B) Encontré algo»). Pruebas: 297 automáticas y 13 con la app abierta (una nueva: Nueva en blanco; la de responder suma la casilla y la nota que crece). Captura: `test-results/i3-nueva-en-blanco.png`. Prueba del usuario de los ajustes: Q-60, aprobada el 2026-10-28.

Después de la prueba, el usuario rediseñó la vista del proyecto en tres paneles (D-041; prototipo aprobado en Q-61 con un ajuste en Git): I-4 se amplía y el plan pasa a seis iteraciones.

### I-4 — Marco de tres paneles, Mapa, Docs, Archivos y conversaciones anteriores (2026-10-28)
**Qué se hizo**
- **Marco (D-041):** la ventana no tiene el marco de Windows: la barra de título es propia (36 px) y Windows dibuja ahí sus tres botones, del color de la barra, así siguen el menú para acomodar ventanas y el arrastre a los bordes; la ventana se mueve desde el espacio libre de la barra. A la izquierda, el botón de inicio con las preguntas sin responder en ámbar; después, una pestaña por sesión y la del proyecto abierto aunque no tenga sesión (× la cierra y vuelve al inicio). La barra de íconos cambia: en el inicio, Proyectos y Pendientes (`Ctrl+1`, `Ctrl+2`); en un proyecto, Mapa, Docs, Archivos, Git y Scripts. El reloj y la cantidad de sesiones pasaron a la barra de estado. Se quitaron el panel desplegable (`Ctrl+B`) y el intercambio.
- **Vista del proyecto:** la cabecera (nombre, hito y el chip de preguntas que lleva a Pendientes), la sección elegida y la conversación siempre a la derecha. Su borde se arrastra (o se mueve con las flechas), doble clic vuelve a 440 px, y la app recuerda el ancho. Cada proyecto recuerda su sección, el documento y el archivo abiertos; las secciones ya abiertas quedan cargadas al cambiar.
- **Mapa (H-7, D-035):** la línea de hitos de la tabla «Progreso de hitos» (completo, en curso, pendiente, reabierto, saltado; lo que no se entiende, tal cual) con «N de M completos»; tocar un hito muestra su tarjeta y «Ver el hito actual» vuelve. El hito actual muestra el Próximo paso entero con sus códigos y citas como enlaces, los pasos (las iteraciones del plan en el hito 7, el portón en los demás; la iteración que nombra «Hito actual» va en curso) con «+N anteriores» si son más de ocho, lo que te espera (cada `Q-n` lleva a Pendientes) y lo último de la IA. Sin `estado.md`: «no sigue la guía todavía» con sus documentos. Se relee solo cuando cambia un documento del proyecto.
- **Docs (H-8, W-8):** el lector liviano. Arriba, el documento y «En esta página» como menús, el ancho del texto (Angosto, Normal, Ancho; se recuerda) y **Atrás** (también `Alt+←`). Los enlaces van en el color del texto, subrayados con puntos; las tablas de más de seis filas arrancan con cinco y «Ver las N filas». Una sección que no está lo avisa; si el documento cambia en el disco mientras se lee, se actualiza sin perder la posición. **Atrás** recuerda de dónde se vino (el Mapa, otro documento con su posición o un archivo): del Mapa a una sección y de vuelta es un paso (F-4).
- **Enlaces en todas partes (F-4, Q-59):** los códigos y las citas de los mensajes de la IA abren Docs en su sección (y un archivo del proyecto, Archivos); los puntos de las pruebas en Pendientes también tienen sus citas como enlaces.
- **Scripts:** `scripts.md` en el lector, con el aviso de que los botones son C-11.
- **Archivos (H-15):** el árbol del proyecto sin `node_modules` ni `.git` (carpetas primero, se abren y se cierran) y el visor de solo lectura: texto con colores y números de línea (D-042), imágenes, y un archivo binario o de más de 1 MB lo dice. Un `.md` de los documentos tiene **Ver en Docs**. Nunca sale de la carpeta del proyecto, tampoco por un enlace simbólico.
- **Conversaciones anteriores (H-17):** el botón del reloj en la barra de la conversación lista las del proyecto, la más nueva arriba, con su título (el que les da Claude Code), fecha y si vienen de Iridium o de VS Code; la abierta va marcada. Elegir una la muestra y lo que se escribe la continúa; mientras la IA trabaja no se cambia. **Nueva** y **Seguí** pasaron a esa barra.
- `pnpm audit`: sin avisos.

**Precisiones al diseño:**
- «Lo último de la IA» son los últimos mensajes de la conversación abierta del proyecto (y lo que hace ahora, si trabaja): no hay otro registro de lo que hizo.
- Una conversación que Claude Code todavía no nombró se titula con su primer mensaje, como hace él.
- En Archivos, un `.md` se ve como texto con colores (H-15); para leerlo con enlaces está **Ver en Docs**.
- Los enlaces de internet en los mensajes de la IA solo se abren si están escritos como enlace (antes también se reconocían las direcciones sueltas).

**Pruebas:** 322 automáticas (24 nuevas: la tabla de hitos, el portón y las iteraciones; los colores; las rutas que no salen del proyecto; el Mapa, Archivos y las conversaciones anteriores con un proyecto de verdad y el motor falso) y 17 con la app abierta (4 nuevas: el Mapa y de un paso a su sección y de vuelta; Docs con códigos, Atrás, «En esta página», tablas plegadas y el documento que cambia; Scripts y Archivos; el ancho que se recuerda y las conversaciones anteriores). Las de I-1 a I-3 se adaptaron al marco nuevo.

**Capturas:** `test-results/i4-mapa.png`, `i4-docs.png`, `i4-archivos.png` e `i4-anteriores.png` (motor falso); `tools/salida/3-proyecto-mapa.png`, `4-proyecto-docs.png`, `5-proyecto-archivos.png`, `5-proyecto-scripts.png` y `5-proyecto-anteriores.png` (este proyecto, real); `tools/salida/empaquetada/` (la app armada) con `0-barra-de-titulo.png`, la barra real con los botones de Windows.

**Ajustes del usuario a la primera versión (2026-10-28, D-043):** lo resolví en el momento.
- Al entrar a un proyecto se ve **Pendientes y scripts** (primer ícono, con el número de preguntas): sus pendientes para responder ahí mismo y, a la derecha, un botón por cada script de `docs/scripts.md`. **Ejecutar** abre una ventana de consola con el comando, que queda abierta; un instalador o **Abrir** lo abre Windows; si falta el archivo, el botón queda apagado y lo dice. Scripts dejó de ser una sección aparte.
- Las pestañas de los proyectos abiertos quedan, también al volver a abrir la app, hasta cerrarlas con ×; muestran si trabaja, si falló, cuántas preguntas esperan, «Terminada» sin ver, o nada.
- Pruebas: 323 automáticas (una nueva: un comando real que corre en su consola, un archivo que se abre, uno que falta) y 17 con la app abierta (adaptadas: entrar a pendientes y scripts y ejecutar un script; las pestañas que quedan al volver a abrir). Captura: `test-results/i4-entrada.png`.

**Ajustes del usuario por Q-62 (2026-10-28, D-044):** lo resolví en el momento.
- La vista de entrada pasa a dos zonas: los pendientes en el área entera y los scripts en una franja al pie, siempre a la vista (un botón por script; la descripción al pasar el mouse) con **Ver con detalles**, que lleva a la sección **Scripts** (vuelve como último ícono, con las descripciones).
- Cada pendiente muestra la pregunta y lo que hay que marcar; el contexto y las citas, en **Mostrar detalles (contexto y N citas)**.
- Las pestañas llevan el ícono del proyecto (o su inicial).
- El cuadro de la conversación crece con lo que se escribe (antes tenía alto fijo) y las notas de Pendientes se vuelven a medir al cambiar su ancho (al arrastrar el borde de la conversación se cortaba lo escrito).
- Pruebas: las 17 con la app abierta, adaptadas (el pie de scripts y la sección Scripts; los detalles plegados; el ícono de la pestaña; el cuadro que crece y no pierde el alto). Capturas: `test-results/i4-entrada.png`, `i4-scripts.png`; `tools/salida/3-proyecto-entrada.png` (este proyecto, real).

**Ajustes del usuario por Q-63 (2026-10-28, D-044):** lo resolví en el momento.
- La franja de scripts al pie (tres filas de botones con siete scripts) pasó a una lista después de los pendientes: una fila por script con nombre, descripción en una línea y botón.
- Scripts tiene **Atrás** cuando se llega desde **Ver con detalles**, y el botón lateral del mouse vuelve un paso en todo el proyecto, como **Atrás** y `Alt+←`.
- Pruebas: 323 automáticas y 17 con la app abierta (adaptadas: la lista de scripts, Atrás desde Scripts y el botón del mouse). Captura: `tools/salida/3-proyecto-entrada.png`.

**Prueba del usuario:** Q-62 y Q-63 (respondidas: ajustes de arriba) y Q-64 (2026-10-28: los scripts en lista, **Atrás** desde Scripts y el botón lateral del mouse funcionan; I-4 aprobada).
- [ ] Abrir Iridium (`scripts.md` › Abrir Iridium; la versión nueva ya está armada) y entrar a dos proyectos: el Mapa de cada uno coincide con su `estado.md` (hito actual, próximo paso, pasos, lo que espera).
- [ ] En el Mapa, tocar un paso o un código del próximo paso: se abre Docs en esa sección. Saltar a otro código y volver con **Atrás** hasta el Mapa.
- [ ] Arrastrar el borde de la conversación para ensancharla, cerrar Iridium, abrirlo y ver que quedó igual.
- [ ] En Archivos, abrir carpetas y algún archivo de código y una imagen.
- [ ] Con el botón del reloj de la conversación, abrir una conversación anterior y escribirle algo.
- [ ] Mover la ventana desde la barra de arriba y usar los botones de minimizar, maximizar y cerrar.

### R-I1 (módulo Revisión) — Comentar en el navegador (2026-10-29)
**Qué se hizo**
- **La extensión** (`extension/`, Chrome y Edge): solo actúa en las direcciones de la PC. `F8` o su botón prenden el modo comentar, con un aviso chico que se va solo (D-049); el mouse resalta cada parte con su componente (`Tarjeta › button`); `Alt+↑` y `Alt+↓` suben y bajan de caja; el clic elige y no le llega a la app. La tarjeta: **Dejar** con `Enter`, lo escrito queda si se cierra, la captura del elemento con un poco de aire y sin la capa de la extensión.
- **El proyecto:** Iridium lo saca de lo recordado, del programa que atiende el puerto o del código (el archivo está en un solo proyecto). Si nada alcanza, la tarjeta pregunta con la lista; lo elegido se recuerda.
- **El receptor** en `127.0.0.1:47321`, solo con el origen de la extensión: guarda `docs/revision/R-n.md` y `R-n.png` con el archivo y la línea del JSX (por el mapa de fuentes), los componentes, el elemento y la página.
- **La cola:** con Iridium cerrado el comentario queda en la extensión (el botón cuenta cuántos) y se manda al abrirlo, sin duplicarse.
- Iridium copia la extensión a `%APPDATA%\Centro de Desarrollo\extension` al arrancar (`scripts.md` › Instalar la extensión de Revisión).
- `pnpm audit`: sin avisos.

**Precisiones al diseño:** la extensión pide permiso sobre todos los sitios, solo para la captura (D-050); `/estado` es `POST` porque Chrome y Edge no mandan el origen en un `GET`; **Enviar ahora** llega en R-I2; se puede Dejar sin elegir proyecto y, si Iridium no lo encuentra por el código, la tarjeta lo vuelve a pedir con lo escrito intacto (`modulos/revision/ux.md`).

**Error encontrado y corregido:** la espera de la extensión para leer el componente (0,6 s) pisaba la respuesta ya recibida; un comentario escrito sin apuro se guardaba sin archivo, línea ni componentes. La prueba de punta a punta ahora espera como una persona.

**Pruebas:** 358 automáticas (34 nuevas: el formato de `R-n.md`, la numeración y los simultáneos, la pila de React y el mapa de fuentes, el proyecto por cada camino y los empates, el receptor con orígenes y pedidos malos) y 21 con la app abierta (4 nuevas, en Edge con la extensión sobre una app de React y Vite: dejar con archivo, línea y captura; el borrador; la cola con Iridium cerrado; preguntar el proyecto).

**Capturas:** `tools/salida/revision-r1-tarjeta.png`, `revision-r1-guardado.png`, `revision-r1-captura.png` (la que queda en `R-1.png`), `revision-r1-cola.png` y `revision-r1-preguntar.png`.

**Prueba del usuario:** Q-70.

### R-I3 (módulo Revisión) — Electron, adelantada (2026-10-29, D-051)
**Qué se hizo**
- **El ayudante de Electron** (`extension/electron/`): una línea en el proceso principal de la app lo carga solo en modo desarrollo; carga la extensión, saca la captura de la ventana y le dice a Iridium la carpeta de la app, así el comentario llega al proyecto correcto sin preguntar (aunque el mismo código esté en otro proyecto).
- **La línea en tres apps:** Iridium, otra app (D-056 de ese proyecto) y otra app (D-085 de otra app; su sesión blindada deja pasar, solo en desarrollo, a la extensión y a Iridium). Cada una, con su propio commit.
- **La norma:** la guía `hitos-desarrollo-app` pide la línea en las apps Electron desde el hito 7 y suma la regla de los `R-n` (D-048); las web con servidor local no necesitan nada.
- **Instalar la extensión:** `pnpm extension` la deja al día en `%APPDATA%\Centro de Desarrollo\extension`, abre la carpeta y copia la ruta. El script anterior abría «Documentos»: la carpeta no existía porque el Iridium instalado es anterior a R-I1.

**Precisiones al diseño:** la línea va solo con el servidor de desarrollo (no con «no está armada»), para que las pruebas de cada app no carguen la extensión; en Electron no hay botón de la extensión ni alarmas (la cola se vacía con cada `/estado`); la detección y **Pedírselo a la IA** pasan a R-I2, con la sección Revisión.

**Pruebas:** 359 automáticas (1 nueva: el proyecto por la carpeta de la app, sin recordar la dirección) y 22 con la app abierta (1 nueva: una app Electron de prueba con la línea; el comentario llega al proyecto de la app con captura). **A mano, con las apps de verdad** en modo desarrollo y datos aparte: otra app (`PrimeraVez.tsx`, la línea del botón), otra app (`BarraTitulo.tsx`) e Iridium (`Icono.tsx`), cada una con captura; los comentarios de prueba se borraron.

**Capturas:** `tools/salida/revision-r3-electron.png`, `revision-r3-captura.png`, `revision-otra-tarjeta.png`, `revision-otra-captura.png` y `revision-otra-tarjeta.png`.

**También en las versiones armadas (2026-10-29, D-052):** a pedido del usuario. La extensión actúa también en `file://`; el ayudante corre en la versión armada de Iridium y otra app (las dos se armaron de nuevo) y recarga una ventana solo si le faltan los scripts. Una app instalada fuera de los proyectos pregunta una vez y se recuerda por su carpeta. En la armada el comentario llega sin archivo ni línea. otra app instalada queda afuera hasta Q-71. Pruebas: 360 automáticas (1 nueva: la carpeta recordada) y 23 con la app abierta (1 nueva: la app de prueba compilada, desde un archivo e instalada fuera de los proyectos). A mano: `otra app.exe` armado, con datos aparte; el comentario de prueba se borró. Captura: `tools/salida/revision-otra-armada.png`.

**Prueba del usuario:** Q-70 y Q-71.

**Resultado de la prueba (Q-70 y Q-71, 2026-10-29):** funciona en Edge y en Electron; R-I1 y R-I3 aprobadas. otra app instalada queda sin Revisión (D-053). Sus dos comentarios sobre Iridium se resolvieron: R-2 (la fila de scripts) en el momento y R-1 (el detalle del uso) en I-6. La sección para ver los comentarios en Iridium es R-I2.

### R-I2 (módulo Revisión) — Revisión en Iridium (2026-10-29)
**Qué se hizo**
- **La sección Revisión** en la barra del proyecto (entre Archivos y Git): el ícono cuenta los abiertos en gris (esperan a la IA, no a vos). Adentro, **Abiertos** y **Cerrados** del más nuevo al más viejo, cada fila con la captura chica, el texto, archivo y línea y la fecha; los cerrados, con lo que hizo la IA. Vacía, explica cómo empezar y cuándo se conectó la extensión por última vez. Un `R-n.md` que no se puede leer se muestra al final, avisado.
- **El comentario entero:** captura grande, texto, dónde (archivo y línea, componentes, página, elemento) y la historia. El archivo y la línea abren **Archivos** con esa línea marcada; Atrás vuelve.
- **Enviar ahora:** desde la tarjeta de la extensión (botón o `Ctrl+Enter`) y desde el comentario en Iridium. Si el proyecto tiene su pestaña en Iridium, el comentario entra a su conversación (si la IA trabaja, en su turno) y en la conversación se ve como una tarjeta con la captura, que abre el comentario. Si no, queda guardado y la tarjeta lo dice. Lo que espera en la cola de la extensión nunca se envía a la sesión.
- **Reabrir** un cerrado con una nota opcional: vuelve a Abiertos y la historia lo dice.
- **Que la IA los cierre (H-R6):** la sesión de Iridium se abre avisándole cuántos comentarios abiertos hay y cómo cerrarlos; cada mensaje de Enviar ahora también se lo recuerda. Cuando la IA lo cierra, la lista y el contador cambian solos.
- **Apps Electron (H-R7):** si el proyecto es Electron y su código todavía no carga la línea, Revisión lo dice y **Pedírselo a la IA** deja el pedido escrito en la conversación, sin enviarlo.
- **La extensión pasa a 0.2.0** (el botón Enviar ahora): hay que tocar **Recargar** en `edge://extensions` (`scripts.md` › Instalar la extensión de Revisión).

**Precisiones al diseño:** el mensaje para la IA vive en `src/compartido/mensaje-revision.ts` (lo leen los dos lados) y suma una línea de cómo cerrarlo; la historia «enviado a la sesión» se escribe antes de mandarlo; el contador sale de la lista de proyectos, sin un evento nuevo; si al entrar al modo comentar Iridium no respondió, la tarjeta le vuelve a preguntar (lo encontró la prueba: con la primera respuesta lenta, Enviar ahora quedaba apagado). Detalle en `modulos/revision/diseno-tecnico.md`.

**Pruebas:** 379 automáticas (17 nuevas: cerrar y reabrir el `R-n.md`, el mensaje y su lectura, la instrucción, listar con lo que falta, la captura solo del comentario, Enviar ahora con y sin sesión, el contador, la detección de Electron, el receptor con Enviar ahora y la sesión abierta con los comentarios en la instrucción) y 28 con la app abierta (5 nuevas, Edge con la extensión e Iridium con el motor falso: Enviar ahora sin sesión; Revisión con su contador, lista, detalle y el archivo en su línea; Enviar ahora con la sesión y la tarjeta en la conversación; la IA lo cierra, pasa a Cerrados y se reabre; un proyecto Electron sin la línea).

**Capturas:** `tools/salida/revision-r2-lista.png`, `revision-r2-detalle.png`, `revision-r2-archivo.png`, `revision-r2-conversacion.png`, `revision-r2-cerrados.png`, `revision-r2-reabrir.png`, `revision-r2-electron.png`, `revision-r2-enviado.png` y `revision-r2-sin-sesion.png`.

**Prueba del usuario:** Q-74.

**Resultado de la prueba (Q-74, 2026-10-29):** **aprobada provisional** (D-056). El usuario no usa Edge ni sus apps en el navegador, sino en Electron: las pruebas a mano quedan en «Pruebas manuales pendientes», para más adelante. Avisó que F8 dejó de andar en Iridium instalado: lo arreglé en el momento (ver Pendientes reportados). Sus dos ideas, en Ideas nuevas.

### I-5 — Git del proyecto (2026-10-29)
**Qué se hizo**
- **La sección Git** (el ícono de las ramas, entre Revisión y Scripts), como el prototipo `ui/vista-proyecto.html`. A la izquierda, la rama (o «sin rama» si se mira un commit suelto), **Sin guardar** con cuántos archivos y **Historial** con los últimos 200 commits: mensaje, código corto, cuándo («hace 30 min») y cuántos archivos tocó.
- **Lo elegido, a la derecha:** de entrada, los cambios sin guardar (o el último commit si no hay). Un commit muestra su mensaje entero, la fecha exacta, quién lo hizo («Lautaro con Claude Opus 5.5», de la línea `Co-Authored-By`) y sus archivos con una letra (A nuevo, M modificado, D borrado) y las líneas agregadas y quitadas.
- **El antes y después** aparece solo al abrir un archivo (Q-61): las líneas con su número antes y después, lo agregado en verde con «+» y lo quitado en rojo con «−»; solo los tramos que cambiaron. Un binario lo dice; uno enorme se corta y lo dice.
- **Se actualiza sola** mientras se mira (cada 4 s con la ventana activa, al cambiar la sesión y al cambiar un documento): un commit que guarda la IA aparece sin salir de la sección, y lo elegido sigue elegido.
- **Solo para mirar:** no hay botones que cambien el repositorio (en el hito 10 se sumaron crearlo y publicarlo en GitHub, D-081). Un proyecto sin repositorio propio lo dice; sin `git` instalado, también.

**Precisiones al diseño:** se usa el `git` del sistema sin consola, con comandos que solo leen y sin tomar el candado del índice (la IA puede estar trabajando en el mismo repo); la ventana solo puede pedir un commit por su código y un archivo que git nombra en ese commit o en los cambios sin guardar. Un repositorio de una carpeta de más arriba no cuenta: el proyecto tiene que tener el suyo.

**De paso:** una prueba de R-I2 esperaba un texto viejo de **Pedírselo a la IA** y fallaba; quedó al día (la app no cambió).

**Pruebas:** 394 automáticas (12 nuevas: entender lo que dice git, y repositorios de verdad: sin repositorio, sin commits, rama, historial con coautores, cambios sin guardar, antes y después de un commit, del primero y de un binario, que no se pueda pedir nada de afuera, que mirar no cambie el índice y un commit suelto) y 30 con la app abierta (2 nuevas: Git con un repositorio de prueba, incluido un commit hecho afuera que aparece solo; un proyecto sin git). `pnpm audit`: sin avisos.

**Capturas:** `test-results/i5-sin-guardar.png`, `i5-commit.png`, `i5-sin-git.png` (repositorio de prueba); `tools/salida/5-proyecto-git.png` (este proyecto, real).

**Prueba del usuario:** Q-75 (2026-10-29: los cinco puntos funcionan; I-5 aprobada) y Q-76 (2026-10-29: los cuatro puntos del ajuste funcionan).

**Ajustes del usuario por Q-75 (2026-10-29, D-058):** lo resolví en el momento.
- El panel de Git como el de VS Code: debajo de la rama, **Solo en esta PC** o **En GitHub · dueño/repo** (con enlace a la página) y cuántos commits faltan subir o bajar, o «Al día con GitHub»; según la última sincronización, sin conectarse a internet.
- Secciones que se pliegan: **Preparados** (si hay), **Cambios** (un archivo por fila: nombre, carpeta tenue y la letra) e **Historial** (los commits que no están en GitHub dicen «sin subir»). Cada proyecto recuerda cuáles están plegadas.
- Un archivo elegido en Cambios se ve solo con su antes y después; **Ver todos los cambios** vuelve a la lista.
- Pruebas: 396 automáticas (2 nuevas: reconocer GitHub sin mostrar usuario ni clave; un repositorio local y uno con remoto, con los commits sin subir y una rama que no está en el remoto) y 31 con la app abierta (1 nueva: GitHub con un commit sin subir; la de Git, adaptada a las secciones). Capturas: `test-results/i5-sin-guardar.png`, `i5-github.png`; `tools/salida/5-proyecto-git.png` (este proyecto, real).

### I-6 — Uso, avisos y errores (2026-10-29)
**Qué se hizo**
- **Uso (H-12, R-1):** en la barra de estado, la ventana de 5 horas y la semana con medidores finos y su porcentaje; desde el 90 % en ámbar y agotado en rojo con cuándo se libera. Tocándolos se despliega el detalle: cuándo se libera cada ventana y el ritmo de la semana («vas usando unos 18 % por día; el parejo es 14 %; a este ritmo se agota el lunes a las 07:55; para llegar, hasta 13 % por día»). Se lee al abrir sin gastar, con cada turno de cualquier sesión, cada 15 minutos y apenas se libera una ventana.
- **Contexto (H-12):** en el cuadro de la conversación, un medidor con el porcentaje (los tokens al pasar el mouse); pasado el 80 % se marca y una línea sugiere **Nueva**. Llega al terminar cada turno y, en una conversación guardada, se calcula de su historial sin escribir nada (D-059).
- **Modelo y esfuerzo (C-58, D-045):** dos selectores en el cuadro de la conversación con los modelos que ofrece la suscripción (Predeterminado, Opus 5.5, Sonnet 5.5, Fable 5.1, Haiku 5.5…) y los esfuerzos de cada uno (Bajo a Máximo). Cada proyecto recuerda los suyos; valen desde el próximo mensaje, también con la sesión trabajando.
- **Errores del motor (F-5):** sin sesión iniciada no se manda nada: un recuadro dice cómo iniciarla y **Reintentar** lo vuelve a mandar (lo verifica de nuevo). Uso agotado: cuándo se libera, la conversación queda para Seguí y el medidor queda en rojo. Cualquier otra falla: la ficha en error con el motivo y Seguí retoma (como antes).
- **Avisos (H-13):** cuando la IA de un proyecto que no está a la vista termina, deja preguntas o falla, un aviso abajo a la derecha («otra app terminó y dejó 1 pregunta · Frena») con **Abrir** y **Responder en otra app**; se va solo a los 8 segundos (no con el mouse encima) o con `Esc`. Dentro de un proyecto, a la izquierda de la conversación. Sin lista de avisos: queda la pestaña.
- **Cerrar con sesiones trabajando (F-6):** «otra app está trabajando. Cerrar la frena…» con **Cancelar** (el foco) y **Cerrar igual**, que frena las sesiones, espera a que quede guardado que se las detuvo (el próximo Seguí se lo avisa a la IA) y cierra. `pnpm actualizar` espera a que se elija.
- **Registro del día:** `registros/AAAA-MM-DD.log` en los datos de Iridium, con los arranques, el estado de Claude Code, los errores del motor y las fallas de lectura; nunca el texto de las conversaciones. Se borran los de más de 14 días.

**Precisiones al diseño (D-059):** el contexto de una conversación guardada se lee del historial (retomarla agregaba líneas y le cambiaba la fecha: lo encontró la prueba con el motor real); el detalle del uso se abre tocando, no al pasar el mouse; los avisos no tapan el cuadro de escribir.

**Prueba con el motor real** (`tools/probar-conversacion.ts`, Haiku, carpeta descartable): al terminar cada turno llegan el contexto (5 % de 1 000 000) y el uso; el contexto de la conversación guardada da lo mismo (48 127 tokens) sin tocar el historial; Detener y retomar siguen bien; el esfuerzo bajo funciona. Con los proyectos reales (`tools/capturas.ts`): 5 h al 71 %, semana al 37 %, el contexto de esta conversación y la lista de modelos de la suscripción.

**Pruebas:** 414 automáticas (18 nuevas: el ritmo de la semana, cuándo releer el uso, lo que dice Claude Code del uso, el contexto y los modelos, el contexto desde el historial, el modelo y el esfuerzo en `config.json`, el registro, y con el motor falso: contexto y uso al terminar, el contexto de una guardada, el modelo y el esfuerzo al abrir y mientras trabaja, sin sesión, uso agotado, la sesión que pierde el inicio de sesión, otra falla y cerrar igual) y 37 con la app abierta (6 nuevas: el uso con su detalle; el contexto, el modelo y el esfuerzo que se recuerdan, el contexto alto y Nueva; sin sesión y Reintentar; uso agotado, otra falla y el registro; el aviso con Responder; cerrar con Cancelar y Cerrar igual). Una de I-3 se adaptó: cerraba la app con la IA trabajando y ahora Iridium pregunta.

**Capturas:** `test-results/i6-uso.png`, `i6-conversacion.png`, `i6-sin-sesion.png`, `i6-agotado.png`, `i6-aviso.png` e `i6-cerrar.png` (motor falso); `tools/salida/8-uso-real.png` y `8-modelos-real.png` (este proyecto, con Claude Code de verdad).

**Prueba del usuario:** Q-77. El 2026-10-30 aprobó el aviso con **Responder** en los pendientes del proyecto, cerrar con una sesión trabajando (Cancelar, Cerrar igual y Seguí) y los colores del uso; el 2026-10-31, un día completo con dos o tres proyectos: **funciona**. I-6 aprobada: el núcleo (el MVP) está completo.

### Ajustes después de I-6 (2026-10-30, D-060)
Pedidos del usuario al probar I-6 (Q-77, puntos 1 y 2), el comentario R-3 y tres cambios chicos.

**Qué se hizo**
- **Lo escrito no se pierde (C-60, R-3):** el cuadro de cada conversación se guarda solo (`escritos.json`, fuera del proyecto) y sigue ahí al cambiar de proyecto y al cerrar Iridium; al enviar se borra. En Pendientes, lo marcado y escrito queda a medias solo, sin tocar el botón. Al cerrar, Iridium espera a terminar de guardar.
- **Vuelve al último proyecto (C-60):** al abrir, Iridium entra en el proyecto que estaba abierto, en su sección principal; si se cerró en el inicio, abre en el inicio.
- **Uso (Q-77):** naranja desde el 75 % y rojo desde el 85 %, en las dos ventanas.
- **Contexto (Q-77):** un círculo que se llena en el sentido del reloj y cambia de color, con los tokens («170k/200k») y lo que le queda a la caché («1 h», «42 min» o «caché vencida»). Tocándolo: los tokens, el desglose (instrucciones, herramientas, `CLAUDE.md` y memoria, la conversación, libre) y la caché, con cuántos tokens vuelve a cargar el próximo mensaje si venció.
- **Modelo y esfuerzo (Q-77):** sin elegir se ven los que usa Claude Code: «Opus 5.5» y «Medio» (probado con el Claude Code real).
- **Chat en la vista de Proyectos (C-61):** a la derecha de la grilla, la conversación de la carpeta `Ideas` (ideas sueltas, proyectos nuevos, lo que toca a varios), sin Seguí y con su propia instrucción; mientras se ve, no avisa. Sin la carpeta, dice cómo tenerla.

**Pruebas:** 421 automáticas (7 nuevas: lo escrito en disco, el proyecto abierto en `config.json`, la instrucción del chat general, la caché del historial, el desglose y el esfuerzo de `/effort`) y 40 con la app abierta (3 nuevas: lo escrito y volver al proyecto tras cerrar; lo marcado en Pendientes tras cerrar; el chat de la vista de Proyectos). Se adaptaron la de I-6 del contexto y el modelo, y la de I-4 del ancho (al reabrir ya entra en el proyecto).

**Capturas:** `test-results/d060-contexto.png`, `d060-chat-general.png` y `d060-vuelve.png` (motor falso).

**Prueba del usuario:** Q-78.

### Chat legible (2026-10-30, D-061)
Pedido del usuario: leer a la IA era difícil porque el proceso (herramientas y notas del camino) se mezclaba con su respuesta, y los mensajes de los dos se veían iguales.

**Qué se hizo**
- Tus mensajes van en una burbuja a la derecha, con fondo y borde propios.
- Cada turno de la IA separa el **proceso** (atenuado, más chico, sobre un riel) de la **respuesta** (letra de lectura). Mientras trabaja, el proceso se ve entero; al terminar queda plegado en «Proceso · N herramientas · N notas», que se despliega con un clic. Avisos, errores y preguntas nunca quedan plegados.

**Pruebas:** 421 automáticas sin cambios y una nueva con la app abierta (`d061-chat-legible`: la burbuja, el proceso entero mientras trabaja, plegado al terminar, la respuesta aparte y desplegarlo). Se adaptó la de I-4 de Docs: la cita que toca está en una nota del proceso y antes lo despliega.

**Capturas:** `test-results/d061-chat.png`, `d061-trabajando.png` y `d061-proceso-abierto.png` (motor falso).

**Prueba del usuario:** Q-79, aprobada.

### Ajustes del uso diario (2026-10-30, D-062)
Pedidos del usuario al usar Iridium todos los días.

**Qué se hizo**
- **Responder** lleva a los pendientes del proyecto (su primera sección), no a los de todos: desde el aviso, la conversación, el Mapa y el número de la cabecera.
- La tarjeta dice **Iridium**: la ficha admite `"nombre"` y la carpeta sigue igual.
- Las pruebas con la app abierta **no te quitan el foco**: sus ventanas aparecen sin tomar el teclado.
- El **el gestor anterior** queda descontinuado y archivado.

**Pruebas:** una automática nueva (el nombre de la ficha, con `reemplazadoPor` siguiendo la carpeta); las de Responder (I-3 e I-6) ahora esperan los pendientes del proyecto.

**Prueba del usuario:** la vuelta del aviso entra en Q-77 (punto 3, otra vez).

### I-8 — Frentes y Postergar (2026-10-30, D-063)
**Qué se hizo**
- **Mapa por frente (C-63):** arriba, una fila con el **Núcleo** (con su hito) y cada módulo (con el paso en que está), y cuántas preguntas tiene cada uno (en naranja si alguna frena). Tocar un módulo muestra su tarjeta: en qué está, su próximo paso, sus pasos del ciclo reducido (cada uno abre su documento), sus iteraciones (`R-I1`…) y lo que te espera de ese módulo. El núcleo muestra solo sus propias preguntas. Reemplaza la línea «Módulos:» de antes.
- **Pendientes por frente (C-63):** las preguntas de un módulo llevan su nombre a la derecha.
- **Postergar (C-62):** en las pruebas, al lado de Guardar a medias. Escribe la respuesta con `**Opción:** Postergada: …` (la misma línea le dice a la IA qué hacer) y lo marcado y anotado hasta ese momento; queda como «Postergada, sin procesar». La tabla de Pruebas manuales pendientes suma «Dónde mirar si falla».
- **De paso, el pendiente de D-060:** lo escrito en el chat se perdía si Iridium se cerraba «desde afuera» (las pruebas, otro programa) apenas después de escribir: ese cierre no pasaba por donde se espera a terminar de guardar. Ahora todo cierre espera. Con la **X** ya funcionaba.

**Pruebas:** 424 automáticas (3 nuevas: el frente en el Mapa con sus pasos, iteraciones y preguntas; Postergar; de qué frente es cada pregunta) y 43 con la app abierta (2 nuevas en `i8-frentes`: el Mapa por frente y Postergar). La de D-060 que fallaba pasa 3 de 3 veces.

**Capturas:** `test-results/i8-mapa-frente.png`, `i8-pendientes.png` e `i8-postergada.png` (motor falso); `tools/salida/3-proyecto-mapa-frente.png` (Iridium de verdad, con el módulo Revisión).

**Prueba del usuario:** Q-82, aprobada (2026-10-30).

### AP-I1 (módulo Apariencia y ajustes) — La ventana de Ajustes (2026-10-31, D-067)
**Qué se hizo**
- **La ventana (AJ-W1):** el ⚙ abajo en la barra de íconos (en el inicio y dentro de un proyecto) o `Ctrl+,` la abren sobre la app oscurecida, con Perfil, IA y Apariencia a la izquierda. `Esc`, la ✕ o un clic afuera la cierran y se vuelve a lo que estaba, con lo escrito en el chat intacto; el foco no se escapa de la ventana con Tab. Recuerda la última sección mientras Iridium está abierto.
- **Tema (AJ-1):** dos tarjetas con una miniatura de la app real en cada tema (Iridium y Carbón). Al tocar una, toda la app cambia en el momento, también la barra de título y los botones de Windows. Al volver a abrir, la ventana ya nace con el tema elegido: no se ve el otro ni un instante.
- **Nombres (AJ-2):** «Tu nombre» en Perfil y un nombre opcional para la IA en IA; la conversación los muestra en lugar de «Vos» e «IA» (uno largo se corta con «…» y se ve entero al pasar el mouse). Se guardan solos mientras se escribe.
- **Tono (AJ-3):** los estilos de respuesta de Claude Code en castellano (Normal, Conciso, Proactivo, Explicativo, Aprendizaje) y los propios de `~/.claude/output-styles/`, cada uno con una línea de qué cambia. Vale para las sesiones de Iridium desde el mensaje siguiente; VS Code y la terminal siguen con el suyo. Sin sesión de Claude Code, solo Normal y una línea de por qué.
- **Si no se puede guardar:** un aviso abajo en la ventana («No se pudo guardar; sigue como antes») y el cambio vuelve atrás.

**Precisiones al diseño (D-067):** los ajustes viajan con las demás preferencias; Claude Code trae cinco estilos, no tres; «Normal» deja el de Claude Code.

**Prueba con el motor real** (`tools/probar-motor.ts`, sin gastar): Claude Code informa `default`, `Proactive`, `Concise`, `Explanatory` y `Learning`, y una sesión abierta con el tono `Explanatory` lo confirma.

**Pruebas:** 433 automáticas (9 nuevas en `ap1-ajustes`: los ajustes en `config.json` con valores rotos y sin poder escribir, lo que acepta el puente, el tono en las sesiones abiertas y nuevas, los estilos) y 48 con la app abierta (4 nuevas en `ap1-ajustes`: abrir y cerrar; Carbón en el momento y al volver a abrir; nombres y tono en la conversación; sin sesión). Las 48 pasan también con toda la app en Carbón (`IRIDIUM_TEMA=carbon`).

**Capturas:** `test-results/ap1-perfil.png`, `ap1-ia.png`, `ap1-apariencia-iridium.png`, `ap1-apariencia-carbon.png`, `ap1-proyecto-carbon.png` y `ap1-conversacion.png` (motor falso). Miniaturas de los temas con `tools/miniaturas-tema.ts`.

**Prueba del usuario:** Q-88, aprobada el 2026-10-31: todo funciona como se pedía, también las descripciones de Conciso y Proactivo.

### Pruebas fuera de la pantalla (2026-11-01, D-072)
- El usuario no podía usar la PC mientras corrían las pruebas: más de sesenta ventanas por tanda aparecían y desaparecían, con consolas y la app de prueba de la Revisión. Preguntó por abrirlas «headless».
- `IRIDIUM_OCULTA=1` (en lugar de `IRIDIUM_SIN_FOCO`): la ventana se abre a 20.000 píxeles fuera de la pantalla, sin botón en la barra de tareas y sin foco, y Chromium la sigue dibujando; las consolas de Scripts corren escondidas. La ponen Playwright y las herramientas que abren la app.
- Verificado: la ventana queda en (−20000, −20000), visible para Electron y sin foco; las capturas salen completas (`co6-armando.png`). Pasan 462 de Vitest y 63 de Playwright. **Prueba:** Q-104.

## Pruebas manuales pendientes (aprobadas provisionales)
Lo que se aprobó provisionalmente (D-056) o se postergó con el botón de Pendientes (D-063): se sigue como si funcionara y la prueba a mano queda acá, con dónde mirar si falla. El hito 8 (Pruebas y calidad) las recorre todas; antes, si el usuario quiere.

| Qué | Por qué quedó para después | Pruebas | Dónde mirar si falla | Origen |
|---|---|---|---|---|
| R-I2 — Revisión en Iridium | El usuario no usa Edge ni apps en el navegador; las automáticas pasan (R-I2 en el log) | 1. En una app (Electron o en Edge) cuyo proyecto está como pestaña: `F8`, clic, escribir y `Ctrl+Enter`: la tarjeta dice «Enviado a la sesión de…» y el comentario aparece como tarjeta en la conversación. 2. La IA lo cierra: baja el número del ícono Revisión y pasa a Cerrados con lo que hizo. 3. El archivo y la línea de un comentario abren Archivos con la línea marcada; Atrás vuelve. 4. Reabrir un cerrado con una nota: vuelve a Abiertos. 5. En un proyecto sin pestaña, Enviar ahora lo guarda y avisa que no hay sesión | El receptor y el envío a la sesión: `src/main/infra/revision/receptor.ts` y `src/main/app/revision/`; D-048 y D-049; lo cubre `tests/e2e/r2-revision.spec.ts` | Q-74; **validada** en Q-108 (2026-11-02): el punto 1 con el archivo y la línea, a mano en una app Electron; lo demás, `r2-revision` en la tanda completa del hito 8 |

## Ideas nuevas (pendientes de evaluar en la definición)
- **Una sección de aprobados provisionales (2026-10-29, Q-74).** Ver en Iridium, de todos los proyectos, lo que quedó aprobado provisional con sus pruebas a mano pendientes, y poder marcarlas cuando se hacen. Hoy viven en la tabla «Pruebas manuales pendientes» de cada `07-construccion.md`.
- **Un atajo a las ideas en la barra de la izquierda (2026-10-29, Q-74; hecho en D-089, «Ideas del proyecto»).** Un ícono que abre las ideas del proyecto (`07-construccion.md` › Ideas nuevas; antes del hito 2, `00-idea.md` › Ideas para después) sin buscarlas en Docs.
- **Compartir Iridium con conocidos, con actualizaciones (2026-10-29, Q-72 → I-7, D-054).** Subir el repo a GitHub con dos ramas (`dev` para trabajar, `main` para lo que se reparte), versiones marcadas como beta (hoy 0.1.0), un instalador publicado en GitHub Releases y que Iridium se actualice solo o avise («hay una versión nueva, ¿instalar al cerrar?»). Lo que hoy no está y haría falta:
  - **GitHub:** el repo es solo local (no tiene remoto). Si el código es privado, los conocidos no pueden bajar las actualizaciones sin una clave; la salida habitual es un repo público solo con los instaladores, o hacer público el código (incluye `docs/`, con tus notas y decisiones).
  - **Carpeta de proyectos:** está fija en la tuya (`RAIZ_DEL_GESTOR`); hay que dejar elegirla al primer arranque.
  - **La forma de trabajar:** Iridium lee `docs/estado.md`, las `Q-n` y `scripts.md` con el formato de la guía `hitos-desarrollo-app`. Sin la guía instalada, los proyectos de otros se ven casi vacíos: habría que repartirla con Iridium (es tuya, de `Skills`) o que Iridium la instale.
  - **Claude Code:** la app trae el suyo y usa la sesión iniciada de cada uno, con su propia suscripción; no necesitan nada extra. Falta confirmar que las condiciones de uso lo permitan en una app repartida (`01-exploracion.md` › Usar la suscripción y no la API).
  - **Perfil y protección:** deja de ser «solo el usuario». La actualización automática es un canal para meter código en PCs ajenas, con una IA que ejecuta comandos sin pedir permiso (D-021): la cuenta de GitHub necesita doble factor, y el instalador sin firma muestra el aviso de Windows SmartScreen.
  - **De paso**, el instalador con actualización al cerrar resuelve el pendiente de I-6 «Armar Iridium no puede reemplazar la app abierta».

- **Postergar una prueba sin perderla (2026-10-30).** Decidido en Q-81: el botón **Postergar**, en I-8 (D-063).
- **Ideas y Skills como paneles del inicio (2026-10-30; Skills hecho en D-068, Ideas es el módulo Inicio, D-079).** Que `Ideas` y `Skills` dejen de verse como proyectos y sean íconos de la barra de la izquierda en el inicio, junto a Proyectos y Pendientes. Toca D-060 (el chat de la vista de Proyectos trabaja en la carpeta `Ideas`) y el módulo Skills (`02-definicion.md` › Módulos previstos), que ya absorbe el trabajo de `Skills` (D-018).
- **Temas (2026-10-30).** Poder cambiar la apariencia: probar uno mucho más sobrio, como macOS, Claude Code Desktop u Obsidian. D-029 dejó un solo tema oscuro; un tema más sería un juego de tokens (`06-ui.md`).
- **Ajustes y perfil (2026-10-30).** Una pantalla de configuración y opciones de perfil (hoy no hay ninguna).
- **Skills: verlas, elegirlas y gestionarlas (2026-10-30).** Ver las skills instaladas en la PC, elegir cuáles usa cada proyecto y gestionarlas. Es el módulo Skills (C-44 a C-48, C-52, C-53).
- **Más capacidades de Claude (2026-10-30).** Los complementos (plugins) de Claude Code, usar la PC (*computer use*) y el navegador desde las sesiones de Iridium.

- **Frentes en paralelo y la guía según el tipo de proyecto (2026-10-30, Q-80).** Los frentes se decidieron en Q-80 (D-063: I-8 y después Skills y Apariencia y ajustes); la guía según el tipo de proyecto sigue como idea. El usuario propone que el núcleo (el MVP) sea un frente más y que los módulos compatibles avancen al mismo tiempo, cada uno con sus pendientes y su mapa; que la guía cambie según lo que se hace (herramienta personal sin lanzamiento real, producto, juego: `00-idea.md` › Ideas para después y Q-13) y que venga con Iridium. Lo pesado, en la conversación del 2026-10-30:
  - **Ya existe en parte:** la guía tiene módulos con su ciclo y su `estado.md`, y uno de sus motivos es «avanza en paralelo»; Revisión se construyó en medio del MVP. Lo que falta está en Iridium: el Mapa y Pendientes no distinguen módulos (todo se ve como un solo plan).
  - **Límites reales:** el cuello de botella son las pruebas y decisiones del usuario y su cuota de uso, no la IA; una sesión por proyecto (D-015) hace que dos frentes del mismo repo se turnen en vez de correr a la vez (correr a la vez pediría copias de trabajo aparte de git); y un módulo sobre un núcleo que todavía cambia se rompe con él.
  - **Propuesta:** el núcleo tiene un portón «estable» (arquitectura y design system cerrados, en uso diario); pasado ese portón, hasta dos frentes activos a la vez, cada uno con su estado y sus `Q-n`, y los demás en espera. Iridium muestra el Mapa y Pendientes por frente. Compartir (I-7) deja de ser parte del núcleo: es un frente.
  - **La guía:** una herramienta personal no tiene lanzamiento real; el hito 9 se vuelve «ponerla en uso» (instalar, actualizar, copias de seguridad) y el 10 casi no aplica. Un juego cambia desde la raíz (documento de diseño, prueba de una porción jugable, motor y contenido como frentes paralelos sobre un motor estable); conviene escribir esa variante cuando haya un juego de verdad para probarla. Los cambios de la guía se hacen en `Skills`; que venga con Iridium ya está en I-7.

## Pendientes reportados (errores y ajustes que no se resolvieron en el momento)
| Fecha | Qué | Tipo (defecto / ajuste) | Iteración o hito donde se resuelve |
|---|---|---|---|
| 2026-10-28 | Las citas a `scripts.md` (p. ej. «`scripts.md` › Abrir Iridium») son solo texto: la sección de scripts debería mostrar botones que los ejecuten, solo con los que usa el usuario (modo desarrollo, armar el instalador, armar e instalar o actualizar) (Q-59) | ajuste | Resuelto en I-4: las citas son enlaces y los scripts, botones (D-043) |
| 2026-10-28 | En Pendientes, las opciones escritas una por línea (`Opciones:` y debajo `A) …`) o con «(recomendada: motivo)» no se mostraban (Q-65, Q-66) | defecto | Resuelto en el momento: el lector las acepta (prueba nueva) |
| 2026-10-29 | Q-70 se mostró solo con el campo de texto: tenía una sola opción y los pasos numerados (`1.`), y el lector pedía dos opciones y puntos `- [ ]` | defecto | Resuelto en el momento: acepta los dos (D-053, pruebas nuevas) |
| 2026-10-29 | R-2: en la lista de scripts, el botón a la izquierda con el nombre, y la descripción a la derecha | ajuste | Resuelto en el momento |
| 2026-10-29 | F8 no andaba en Iridium instalado (Q-74): al arrancar, la carpeta de la extensión se copiaba al mismo tiempo que la cargaba el ayudante, y con una extensión nueva la tomaba a medias. Pasaba la primera vez que se abría cada versión con la extensión cambiada | defecto | Resuelto en el momento: primero se copia y después se carga (prueba nueva; con la app abierta, 3 de 3 aperturas sin F8 antes y 3 de 3 con F8 después) |
| 2026-10-29 | R-1: en la barra de estado, el uso con un botón que despliega cuándo se libera y si el ritmo diario alcanza | ajuste | Resuelto en I-6 |
| 2026-10-30 | R-3: lo escrito en una prueba de Pendientes se perdía al cerrar Iridium (solo se guardaba con «Guardar a medias»); lo mismo con el chat al salir del proyecto | defecto | Resuelto en el momento: se guarda solo (D-060, pruebas nuevas) |
| 2026-10-30 | El chat se leía mal: el proceso de la IA se confundía con su respuesta y los mensajes de los dos se veían iguales | ajuste | Resuelto en el momento (D-061) |
| 2026-10-30 | La prueba con la app abierta de D-060 «lo escrito en el chat queda… al cerrar» falla en esta PC (al reabrir, el cuadro está vacío), también sin los cambios de D-061; a mano funciona (Q-78, punto 1). Puede ser que cierre antes de que llegue a guardarse | defecto | Resuelto en I-8: el cierre «desde afuera» no esperaba a terminar de guardar (D-063) |
| 2026-10-30 | R-4: lo escrito en «Otro» o en la nota a veces se borra al tocar Enviar (Revisión) | defecto | No reproducido y no volvió a pasar (Q-87): la prueba nueva `tests/e2e/r4-enviar.spec.ts` envía en seis momentos distintos, desde la entrada del proyecto, con la pregunta en un módulo y la lista recargándose, y siempre guarda todo. Dónde mirar: `Pendiente.tsx` (borrador en memoria, `enviar`) y `app/pendientes.ts` (`responder`) |
| 2026-10-30 | El aviso de un proyecto con preguntas llevaba a los pendientes de todos, no a los de ese proyecto | ajuste | Resuelto en el momento (D-062) |
| 2026-10-30 | La tarjeta de Iridium decía «Centro de Desarrollo» | ajuste | Resuelto en el momento: `"nombre"` en la ficha (D-062) |
| 2026-10-30 | La ventana de las pruebas automáticas se ponía adelante y tomaba el teclado mientras el usuario usaba la PC | ajuste | Resuelto en el momento (D-062) |
| 2026-10-31 | Con la sesión de Claude cerrada, Iridium seguía diciendo «Claude» y el aviso no ofrecía Iniciar sesión (R-5, Q-93) | defecto | Resuelto en el momento (CO-I1): la verificación pregunta `claude auth status` (Claude Code seguía dando el email de antes) y un turno sin sesión cambia el chip y el aviso en el acto |
| 2026-10-31 | Una pregunta con «frena (motivo)» en su línea `Tipo:` (Q-89, Q-90) no se marcaba como que frena en Pendientes ni en la tarjeta | defecto | Resuelto en el momento: el lector acepta el motivo al lado (prueba nueva en `core-grilla`) |
| 2026-10-28 | Armar Iridium con su propio botón («Armar la última versión») no puede reemplazar la app abierta: Windows bloquea sus archivos y el armado falla | defecto | Resuelto el 2026-10-29: `pnpm actualizar` arma, cierra Iridium, pone la versión nueva y lo vuelve a abrir (D-036); la actualización automática sigue en I-7 |
| 2026-10-31 | Pedido de otra app (D-086, Q-70 A): la Revisión en otra app instalada, con un interruptor de otra app. Del ayudante: que actúe en `otra-app://` (los `matches` de la extensión no alcanzan esquemas propios: los scripts los tendría que poner el ayudante), opciones para no capturar y no guardar el texto visible del elemento (solo componente y tipo de elemento) que la extensión respete, y algo que diga qué soporta (p. ej. `capacidades` exportado) para que otra app no cargue una versión vieja. Ojo: la interfaz de otra app tiene política de contenido estricta (`pagina.js` corre en el mundo de la página) | ajuste (pedido de otro proyecto) | Resuelto el 2026-11-01 (D-073): `esquemas`, `captura: false`, `textoElemento: false`, `detener()` y `capacidades.json`; avisado en otra app (D-089) |

## Deuda técnica
| Qué | Por qué se aceptó | Cuándo resolverla |
|---|---|---|
| Del Gestor se copió también lo que el Centro todavía no usa (editar con el formulario y eliminar proyectos; la lista por secciones de `app/casos.ts`). Crear, cambiar el estado, archivar y el ícono ya se usan (D-089) | Las pruebas del Gestor se cruzan entre esas partes; copiarlo entero deja las 217 pasando sin reescribir pruebas. Nada de eso está conectado a la ventana | Cuando el Centro edite fichas (después del MVP) se usa; si no, se borra al cerrar el MVP |
| ~~La prueba del receptor de la Revisión elige un puerto al azar (47400 a 47899) y falló una vez en la corrida completa (pasa sola)~~ | Pasó en cuatro corridas seguidas; no afecta a la app | Resuelta en el hito 8, tanda 1: el receptor acepta el puerto 0 y dice cuál tomó (`08-calidad.md` › Defectos 2) |
| La ventana no se minifica (680 KB) | Es una app local que carga de disco; no cambia nada para el usuario | Si el arranque pasa de 2 s |

## Checklist de salida (del MVP)
Cerrado el 2026-11-01; la verificación integral sigue en `08-calidad.md`.
- [x] Todas las historias *Must* cumplen sus criterios de aceptación, verificados al cerrar cada iteración (I-1 a I-8; I-6 aprobada en Q-77). La única prueba a mano que quedó es R-I2 (Pruebas manuales pendientes), que recorre el hito 8.
- [x] Tests de la lógica central pasando: 462 de Vitest y 63 de Playwright.
- [x] Documentación sincronizada con el código (D-072 fue el último cambio).
- [x] Deuda técnica registrada (Deuda técnica, arriba).
- [x] El usuario usó el MVP y lo considera funcional: es su herramienta de uso diario desde I-6, y los cuatro módulos terminaron su construcción (Revisión, Skills en Q-96, Apariencia en Q-88, Compartir en Q-102).
