# Trabajo

Las ideas y los pendientes de la IA, cada uno con su estado (framework de Iridium). Pasado al framework el 2026-11-06: juntó «Ideas para después» de `00-idea.md`, «Ideas del brainstorming» de `01-exploracion.md`, «Ideas nuevas» de `07-construccion.md`, el Backlog de `10-operacion.md` y los «Pendientes» de `estado.md` y de los frentes. La prioridad del Backlog (Must, Should, Could) va en el texto.

## T-1 — La guía según el tipo de proyecto (app, herramienta, juego)
Estado: nueva · Fecha: 2026-10-21 · Origen: `00-idea.md`, Q-13, Q-80
Para juegos (historia, arte, música, mundo, motor propio) el flujo cambia desde la raíz; el framework preguntaría al empezar si es una app o un juego. Con formularios prearmados para contestar antes de hablar con la IA (Q-13; los formularios se verían en la Bandeja de entrada).
Lo de la conversación del 2026-10-30 (Q-80): una herramienta personal no tiene lanzamiento real; el hito 9 se vuelve «ponerla en uso» (instalar, actualizar, copias de seguridad) y el 10 casi no aplica. Un juego cambia desde la raíz (documento de diseño, prueba de una porción jugable, motor y contenido como frentes paralelos sobre un motor estable); conviene escribir esa variante cuando haya un juego de verdad para probarla. La otra mitad de esa idea, los frentes en paralelo, se decidió en D-063 (el núcleo con un portón «estable», hasta dos frentes activos, el Mapa y la Bandeja por frente) y la sigue el frente Orden. Que el framework venga con Iridium ya está (D-086).

## T-2 — Un canvas para pensar una idea con la IA
Estado: nueva · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-008
Postergado por D-008. Candidato: Excalidraw dentro de la app, con los dibujos como archivos del proyecto. Variante del brainstorming: la IA dibuja en vivo en el canvas mientras se conversa (kit de agentes de tldraw, MCP de Excalidraw).

## T-3 — Vista del plan de cada proyecto
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`
Hitos, iteraciones, decisiones y módulos: es el Mapa (D-008, D-035). Lo que falta del plan completo, en T-31.

## T-4 — Bandeja única de pendientes del usuario
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-010
Las `Q-n` de todos los proyectos: es Pendientes (D-010, D-022); pasa a llamarse Bandeja de entrada con el frente Orden (D-097).

## T-5 — Biblioteca de diseño local
Estado: pendiente · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-011
Design systems, patrones y capturas de páginas de referencia; prototipos con comentarios. Es el frente Diseño, en espera detrás de Orden (D-079, D-091). Del brainstorming: que la biblioteca arranque con los design systems de los proyectos propios, y perillas en vivo dentro de los prototipos (C-34).

## T-6 — Revisión con comentarios sobre apps web y Electron
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-012, D-046
Entró al MVP por D-046 (D-012, D-047): el frente Revisión de la app. Para Android, T-17.

## T-7 — Gestor de skills
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-064
Las skills locales compartidas, verlas y administrarlas desde Iridium: el frente Skills (D-064, D-068). Elegir las skills de cada proyecto y adaptar las públicas siguen en T-33 (C-46 a C-48).

## T-8 — Puente PC–celular
Estado: pendiente · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-003, D-005
APKs, archivos, textos, notificaciones; quizás instalar desde la PC. Should: del celular a la PC y la misma pieza para otro proyecto y otra app (C-41, C-42).

## T-9 — Iridium para Linux o para el celular
Estado: nueva · Fecha: 2026-10-21 · Origen: `00-idea.md`, Q-30
Linux sale casi gratis porque Electron es multiplataforma; el celular es otra app: pantalla chica y Claude Code no corre ahí, así que hablaría con la PC.

## T-10 — Las ideas técnicas del hito 0
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`
- Usar la suscripción y no la API (para uso personal Anthropic lo permite; la API hace falta solo si la app se distribuye a otros): D-006, D-025.
- Claude Code por debajo como motor; la app es la capa de gestión y de interfaz: D-006, D-007.
- Para el puente, mirar primero lo que existe (LocalSend, KDE Connect, Syncthing, Taildrop, ADB por Wi-Fi): D-005.

## T-11 — Tareas como tarjetas que un agente toma
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md` (idea de Vibe Kanban)
Conectadas a las iteraciones del framework.

## T-12 — Un mod de Claude Code con el estado del proyecto al lado del chat
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md`
Aunque la app principal sea propia.

## T-13 — Mandar tareas desde el celular con Dispatch
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md`
Usar Dispatch en vez de construir algo propio para eso.

## T-14 — Puente: avisos y descargas de APK
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md`
Avisar con ntfy cuando termina un APK, con el enlace para bajarlo; publicar los APK en un lugar fijo y que Obtainium los actualice solo en el celular.

## T-15 — Puente: «Recibir por enlace» de LocalSend
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md`
Para mandar algo desde un celular ajeno sin instalar nada.

## T-16 — Comentar un documento párrafo por párrafo
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md` (idea de Plannotator), C-20
Comentar un documento del plan y devolvérselo a la IA. Could en `02-definicion.md`.

## T-17 — Revisión para las apps Android
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md`, D-012
Comentarios sobre capturas, más adelante.

## T-18 — Avisar cuando hay dos copias de la misma skill
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md`
En la sección Skills.

## T-19 — El Gestor como acceso rápido dentro de VS Code
Estado: descartado · Fecha: 2026-10-22 · Origen: `01-exploracion.md`
El Gestor se descontinuó (D-062).

## T-20 — Tareas de cada iteración como archivos con un tablero encima
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md` (idea de Backlog.md)
Para el hito 7. En parte lo cubre `trabajo.md` (D-094).

## T-21 — Una sección de aprobados provisionales
Estado: nueva · Fecha: 2026-10-29 · Origen: Q-74
Could. Ver en Iridium, de todos los proyectos, lo que quedó aprobado provisional con sus pruebas a mano pendientes, y poder marcarlas cuando se hacen.

## T-22 — Un atajo a las ideas en la barra de la izquierda
Estado: hecho · Fecha: 2026-10-29 · Origen: Q-74
Hecho en D-089, «Ideas del proyecto». Con el frente Orden pasa a leer `trabajo.md` (OR-I3).

## T-23 — Compartir Iridium con conocidos, con actualizaciones
Estado: hecho · Fecha: 2026-10-29 · Origen: Q-72, D-054
El frente Compartir (D-069, D-070) y las versiones publicadas en GitHub (D-084, D-085). Falta solo invitar a la otra persona (Q-126). Lo que se anotó al principio:
- **GitHub:** el repo era solo local. Si el código es privado, los conocidos no pueden bajar las actualizaciones sin una clave; la salida habitual es un repo público solo con los instaladores, o hacer público el código.
- **Carpeta de proyectos:** estaba fija; hay que dejar elegirla al primer arranque.
- **La forma de trabajar:** sin la guía instalada, los proyectos de otros se ven casi vacíos: repartirla con Iridium o que Iridium la instale.
- **Claude Code:** la app trae el suyo y usa la sesión de cada uno; falta confirmar que las condiciones de uso lo permitan en una app repartida.
- **Perfil y protección:** la actualización automática es un canal para meter código en PCs ajenas, con una IA que ejecuta comandos sin pedir permiso (D-021): la cuenta de GitHub necesita doble factor, y el instalador sin firma muestra el aviso de SmartScreen.
- De paso, la actualización al cerrar resuelve «Armar Iridium no puede reemplazar la app abierta».

## T-24 — Postergar una prueba sin perderla
Estado: hecho · Fecha: 2026-10-30 · Origen: Q-81
El botón **Postergar**, en I-8 (D-063).

## T-25 — Ideas y Skills como paneles del inicio
Estado: hecho · Fecha: 2026-10-30 · Origen: D-068, D-079
Skills, en D-068; Ideas es el frente Inicio (D-079).

## T-26 — Temas
Estado: hecho · Fecha: 2026-10-30
Iridium y Carbón (D-066), en el frente Apariencia y ajustes.

## T-27 — Ajustes y perfil
Estado: hecho · Fecha: 2026-10-30
La ventana de Ajustes (D-065).

## T-28 — Más capacidades de Claude
Estado: pendiente · Fecha: 2026-10-30
Los complementos (plugins) de Claude Code, usar la PC (*computer use*) y el navegador desde las sesiones de Iridium. Es el frente Capacidades, en espera detrás de Orden (D-079, D-091).

## T-29 — Mantenimiento: subir los parches
Estado: pendiente · Fecha: 2026-11-02 · Origen: `10-operacion.md` › Mantenimiento
Should. React 19.3.1, Zustand, Vitest, Playwright 1.64 y el SDK de Claude Code 0.3.316, con las pruebas completas y armar.

## T-30 — Lo del Gestor que falta en Iridium
Estado: pendiente · Origen: C-8, C-9
Should. Búsqueda entre proyectos, grupos y filtros. El menú del clic derecho y Nuevo proyecto ya están (D-089).

## T-31 — Plan completo
Estado: pendiente · Origen: C-15, C-16, C-18, C-19
Should. Decisiones, módulos como caja, todos los planes en una vista, diagramas.

## T-32 — Respaldo de `.iridium` en GitHub
Estado: pendiente · Fecha: 2026-11-04 · Origen: D-087
Should. Un botón en Ajustes › Proyectos que publique Ideas y Skills como repos privados y los suba solo; hoy se hace con Abrir como proyecto › Git › Publicar en GitHub.

## T-33 — Las Could de la definición
Estado: pendiente · Origen: `02-definicion.md` › Funcionalidades
Could. C-17, C-20, C-27, C-34, C-43, C-46 a C-48 (entre ellas, elegir las skills de cada proyecto y adaptar las públicas, D-064).

## T-34 — Revisión: la línea «Página» con la ruta relativa
Estado: pendiente · Origen: D-082
Should. La línea «Página» de un comentario guarda la ruta entera de la app (con la carpeta de proyectos); en el repo de Iridium conviene que quede relativa al proyecto.

## T-35 — Seguir a la IA, el cierre con comprobación y los avisos de Windows
Estado: pendiente · Origen: C-4, C-6, C-51
Should.

## T-36 — Pendientes completos
Estado: pendiente · Origen: C-24 a C-26, C-28
Should. Adjuntos, formulario de arranque, respuestas que la IA toma sola, preguntas del chat que pasan a `Q-n`.

## T-37 — El `.zip` de `pnpm publicar`, más chico
Estado: pendiente · Origen: D-085
Could. Pesa unos 280 MB: probar a comprimirlo más.

## T-38 — Número de versión y `CHANGELOG.md`
Estado: pendiente · Origen: D-077, Q-109
Could. La opción A de Q-109, cuando quieras.

## T-39 — Defecto 1: una prueba que falla a veces en la tanda completa
Estado: pendiente · Origen: `08-calidad.md` › Defectos
En observación: si vuelve, se guarda su `error-context` y se investiga. 2026-11-04: las tres de `r3-electron` fallaron juntas en una tanda completa; pasaron solas y en la tanda siguiente (81 de 81). 2026-11-04 (otra vez, en la tanda de D-087): las mismas tres; la tarjeta mostraba «Guardado en … R-1» cuando esperaba R-2, como si el número de comentario viniera de una prueba anterior. Pasaron solas. Pista: algo de la Revisión que queda entre una prueba y otra en la tanda completa.

## T-40 — Defecto 4: `minimatch` vulnerable dentro de `electron-builder`
Estado: pendiente · Origen: `08-calidad.md` › Defectos
No viaja en la app. Se cierra cuando `electron-builder` lo actualice (se mira en cada mantenimiento).

## T-41 — Deuda: lo copiado del Gestor sin usar y la ventana sin minificar
Estado: pendiente · Origen: `07-construccion.md` › Deuda técnica
Lo copiado se usa con C-9 y C-10, o se borra; la ventana se minifica si el arranque pasa de 2 s.

## T-42 — Sacar de `carpeta-iridium.ts` el nombre viejo de la carpeta de skills
Estado: pendiente · Origen: D-082, Q-127
Q-127 ya dio bien la mudanza.

## T-43 — Chat de Skills: el framework reemplaza a la guía y a `gestor-proyectos`
Estado: pendiente · Origen: D-092, D-095
En el chat de Skills, no acá: lo pendiente de las dos (D-062, D-063, D-068, Defectos 13 y 14, Q-115) pasa al framework y se eliminan cuando funcione; la regla global «todo proyecto sigue la guía» pasa a la de D-095; cuando el control funcione, se saca el hook `comprobar-preguntas.mjs` de la configuración global (D-092.4).

## T-44 — Chat de Skills: traer las skills que la licencia permite
Estado: pendiente · Origen: D-014
Traer a la carpeta Skills las skills que la licencia permite y sacar las copias dobles.

## T-45 — Las rutas que nombran la carpeta vieja, después de Mover
Estado: pendiente · Origen: Q-127
En el chat de Skills, poner al día las rutas que nombran la carpeta vieja; en el chat general, la sección «Dónde están los demás proyectos» del `CLAUDE.md` de Ideas.

## T-46 — Un solo botón Actualizar
Estado: pendiente · Frente: Orden · Fecha: 2026-11-06 · Origen: R-12
Arma y reinicia, con sus estados (W-1). En OR-I2.

## T-47 — D-100 en el código
Estado: pendiente · Frente: Orden · Fecha: 2026-11-06 · Origen: D-100
El botón primario claro y las cuentas en gris (OR-2, en OR-I2), y el ⚠ de Skills en gris (OR-I4).

## T-48 — Tocar «! N avisos del framework» abre la lista en Docs
Estado: pendiente · Frente: Orden · Fecha: 2026-11-06 · Origen: W-2
Hoy la tarjeta abre el proyecto y la lista se ve al pasar el mouse; la lista va con Skills › Framework, en OR-I4.

## T-49 — Pasar al framework desde Skills cita la referencia nueva
Estado: pendiente · Frente: Orden · Fecha: 2026-11-06 · Origen: OR-I4
El pedido de Skills cita `referencias/pasar-al-framework.md` en vez de `actualizar-formato.md` de la guía, y el motor falso lo reconoce.

## T-50 — Pasar Iridium al framework
Estado: hecho · Frente: Orden · Fecha: 2026-11-06 · Origen: OR-I1
Con `referencias/pasar-al-framework.md`, hasta que el control dio cero (`modulos/orden/estado.md` › OR-I1).
