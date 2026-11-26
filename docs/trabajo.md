# Trabajo

Las ideas y los pendientes de la IA, cada uno con su estado (framework de Iridium). Pasado al framework el 2026-11-06: juntó «Ideas para después» de `00-idea.md`, «Ideas del brainstorming» de `01-exploracion.md`, «Ideas nuevas» de `07-construccion.md`, el Backlog de `10-operacion.md` y los «Pendientes» de `estado.md` y de los frentes. La prioridad del Backlog (Must, Should, Could) va en el texto.

## T-1 — La guía según el tipo de proyecto (app, herramienta, juego)
Estado: pendiente · Idea: IA · Fecha: 2026-10-21 · Origen: `00-idea.md`, Q-13, Q-80 · Tamaño: grande
Evaluada el 2026-11-25: una variante del framework por tipo de proyecto (la herramienta personal sin lanzamiento, el juego con su propio flujo) y los formularios para contestar antes de hablar con la IA. Grande, del frente Plantillas (T-81), que ya arma piezas por tipo de app. No va directo: hace falta que elijas qué tipo va primero, y el del juego conviene escribirlo cuando haya un juego de verdad para probarlo.
Para juegos (historia, arte, música, mundo, motor propio) el flujo cambia desde la raíz; el framework preguntaría al empezar si es una app o un juego. Con formularios prearmados para contestar antes de hablar con la IA (Q-13; los formularios se verían en la Bandeja de entrada).
Lo de la conversación del 2026-10-30 (Q-80): una herramienta personal no tiene lanzamiento real; el hito 9 se vuelve «ponerla en uso» (instalar, actualizar, copias de seguridad) y el 10 casi no aplica. Un juego cambia desde la raíz (documento de diseño, prueba de una porción jugable, motor y contenido como frentes paralelos sobre un motor estable); conviene escribir esa variante cuando haya un juego de verdad para probarla. La otra mitad de esa idea, los frentes en paralelo, se decidió en D-063 (el núcleo con un portón «estable», hasta dos frentes activos, el Mapa y la Bandeja por frente) y la sigue el frente Orden. Que el framework venga con Iridium ya está (D-086).

## T-2 — Un canvas para pensar una idea con la IA
Estado: nueva · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-008
Evaluada el 2026-11-25: un lienzo (Excalidraw) dentro de Iridium, con los dibujos como archivos del proyecto y la IA dibujando en vivo con el MCP de Excalidraw. Grande, cerca del frente Diseño o como sección propia. No va directo: D-008 lo postergó, y hace falta que digas si lo querés ahora y dónde va.
Postergado por D-008. Candidato: Excalidraw dentro de la app, con los dibujos como archivos del proyecto. Variante del brainstorming: la IA dibuja en vivo en el canvas mientras se conversa (kit de agentes de tldraw, MCP de Excalidraw).

## T-3 — Vista del plan de cada proyecto
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`
Hitos, iteraciones, decisiones y módulos: es el Mapa (D-008, D-035). Lo que falta del plan completo, en T-31.

## T-4 — Bandeja única de pendientes del usuario
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-010
Las `Q-n` de todos los proyectos: es Pendientes (D-010, D-022); pasa a llamarse Bandeja de entrada con el frente Orden (D-097).

## T-5 — Biblioteca de diseño local
Estado: en curso · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-011 · Tamaño: grande
Design systems, patrones y capturas de páginas de referencia; prototipos con comentarios. Es el frente Diseño, activo desde el 2026-11-07 como un «Claude Design» local (D-102, `modulos/diseno/`). Del brainstorming: que la biblioteca arranque con los design systems de los proyectos propios, y perillas en vivo dentro de los prototipos (C-34).

## T-6 — Revisión con comentarios sobre apps web y Electron
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-012, D-046
Entró al MVP por D-046 (D-012, D-047): el frente Revisión de la app. Para Android, T-17.

## T-7 — Gestor de skills
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-064
Las skills locales compartidas, verlas y administrarlas desde Iridium: el frente Skills (D-064, D-068). Elegir las skills de cada proyecto y adaptar las públicas siguen en T-33 (C-46 a C-48).

## T-8 — Puente PC–celular
Estado: pendiente · Fecha: 2026-10-21 · Origen: `00-idea.md`, D-003, D-005 · Tamaño: grande
APKs, archivos, textos, notificaciones; quizás instalar desde la PC. Should: del celular a la PC y la misma pieza para otro proyecto y otra app (C-41, C-42).

## T-9 — Iridium para Linux o para el celular
Estado: pendiente · Idea: IA · Fecha: 2026-10-21 · Origen: `00-idea.md`, Q-30 · Tamaño: grande
Evaluada el 2026-11-25: Linux es mediano (Electron arma para Linux, pero hay que revisar lo que hoy es de Windows: el instalador, las rutas con variables, la consola de abajo y Usar la PC) y necesita una PC con Linux para probarlo. El celular es otra app que habla con la PC: grande, va con el Puente (T-8). Necesita que digas si alguna de las dos te sirve hoy.
Linux sale casi gratis porque Electron es multiplataforma; el celular es otra app: pantalla chica y Claude Code no corre ahí, así que hablaría con la PC.

## T-10 — Las ideas técnicas del hito 0
Estado: hecho · Fecha: 2026-10-21 · Origen: `00-idea.md`
- Usar la suscripción y no la API (para uso personal Anthropic lo permite; la API hace falta solo si la app se distribuye a otros): D-006, D-025.
- Claude Code por debajo como motor; la app es la capa de gestión y de interfaz: D-006, D-007.
- Para el puente, mirar primero lo que existe (LocalSend, KDE Connect, Syncthing, Taildrop, ADB por Wi-Fi): D-005.

## T-11 — Tareas como tarjetas que un agente toma
Estado: hecho · Idea: IA · Fecha: 2026-10-22 · Origen: `01-exploracion.md` (idea de Vibe Kanban)
Hecho el 2026-11-25: es Frentes con el avance solo (FS-I1 a FS-I4): los pasos de cada frente son las tarjetas y la IA los toma sola por tamaño. Mover tarjetas a mano no se pidió; si hace falta, va como idea nueva.
Evaluada el 2026-11-25: buena parte ya está: Frentes muestra los pasos como tareas y el avance solo los toma por tamaño (FS-I1 a FS-I4). Lo que quedaría (mover las tareas a mano o dárselas a la IA desde el tablero) es mediano, del frente Frentes. Necesita que digas si falta algo o si se cierra como hecha.
Conectadas a las iteraciones del framework.

## T-12 — Un mod de Claude Code con el estado del proyecto al lado del chat
Estado: descartado · Idea: IA · Fecha: 2026-10-22 · Origen: `01-exploracion.md`
Aunque la app principal sea propia.

## T-13 — Mandar tareas desde el celular con Dispatch
Estado: pendiente · Idea: IA · Fecha: 2026-10-22 · Origen: `01-exploracion.md` · Tamaño: chico
Evaluada el 2026-11-25: usar Dispatch (mandarle tareas a Claude desde el celular) en vez de construir algo propio. Investigar si esas tareas llegan a Claude Code en esta PC y cómo las vería Iridium es chico, del Puente (T-8); usarlo necesita tu cuenta y tu celular, así que no va directo.
Usar Dispatch en vez de construir algo propio para eso.

## T-14 — Puente: avisos y descargas de APK
Estado: pendiente · Idea: IA · Fecha: 2026-10-22 · Origen: `01-exploracion.md` · Tamaño: mediano
Evaluada el 2026-11-25: avisar con ntfy cuando se arma un APK y publicarlo en un lugar fijo para que Obtainium lo actualice en el celular. Mediano, del Puente (T-8), y se apoya en Abrir, que ya arma las apps solas. No va directo: necesita una app Android tuya que se arme y tu celular para probarlo.
Avisar con ntfy cuando termina un APK, con el enlace para bajarlo; publicar los APK en un lugar fijo y que Obtainium los actualice solo en el celular.

## T-15 — Puente: «Recibir por enlace» de LocalSend
Estado: nueva · Fecha: 2026-10-22 · Origen: `01-exploracion.md`
Evaluada el 2026-11-25: «Recibir por enlace» es una función de LocalSend, casi no hay que construir: a lo sumo un acceso desde Iridium y explicar cómo se usa. Chico, del Puente (T-8). Necesita que tengas LocalSend y lo pruebes con un celular ajeno.
Para mandar algo desde un celular ajeno sin instalar nada.

## T-16 — Comentar un documento párrafo por párrafo
Estado: descartado · Idea: IA · Fecha: 2026-10-22 · Origen: `01-exploracion.md` (idea de Plannotator), C-20
Evaluada el 2026-11-25: hoy se comenta la app en Revisión, y los documentos solo se leen en Docs. Faltaría comentar un párrafo en Docs y que el comentario le llegue a la IA como los de Revisión. Mediano, del Núcleo (Docs, con la pieza de Revisión). Hace falta que apruebes dónde se ve el comentario; después puede ir sola.
Comentar un documento del plan y devolvérselo a la IA. Could en `02-definicion.md`.

## T-17 — Revisión para las apps Android
Estado: descartado · Idea: IA · Fecha: 2026-10-22 · Origen: `01-exploracion.md`, D-012
Evaluada el 2026-11-25: comentar capturas de una app Android como hoy se comenta Iridium en Revisión (subir la captura, o sacarla del celular conectado, y marcar sobre ella). Mediano a grande, del frente Revisión. No va directo: necesita una app Android tuya en uso y tu celular para probarlo.
Comentarios sobre capturas, más adelante.

## T-18 — Avisar cuando hay dos copias de la misma skill
Estado: pendiente · Idea: IA · Fecha: 2026-10-22 · Origen: `01-exploracion.md` · Tamaño: chico, sola
Evaluada el 2026-11-25: en Skills, avisar cuando la misma skill está en dos lugares (la carpeta de Skills, un plugin, la configuración global). Chico, del frente Skills, junto con T-44 (sacar las copias dobles). Puede ir directo a hacerse.
En la sección Skills.

## T-19 — El Gestor como acceso rápido dentro de VS Code
Estado: descartado · Fecha: 2026-10-22 · Origen: `01-exploracion.md`
El Gestor se descontinuó (D-062).

## T-20 — Tareas de cada iteración como archivos con un tablero encima
Estado: descartado · Idea: IA · Fecha: 2026-10-22 · Origen: `01-exploracion.md` (idea de Backlog.md)
Para el hito 7. En parte lo cubre `trabajo.md` (D-094).

## T-21 — Una sección de aprobados provisionales
Estado: descartado · Idea: IA · Fecha: 2026-10-29 · Origen: Q-74
Could. Ver en Iridium, de todos los proyectos, lo que quedó aprobado provisional con sus pruebas a mano pendientes, y poder marcarlas cuando se hacen.

## T-22 — Un atajo a las ideas en la barra de la izquierda
Estado: hecho · Fecha: 2026-10-29 · Origen: Q-74
Hecho en D-089, «Ideas del proyecto». Con el frente Orden pasa a leer `trabajo.md` (OR-I3).

## T-23 — Compartir Iridium con conocidos, con actualizaciones
Estado: hecho · Fecha: 2026-10-29 · Origen: Q-72, D-054
El frente Compartir (D-069, D-070) y las versiones publicadas en GitHub (D-084, D-085). Falta solo invitar a la otra persona (Q-126), en pausa desde el 2026-11-16 a pedido del usuario. Lo que se anotó al principio:
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
Estado: hecho · Frente: Paridad · Fecha: 2026-10-30
Los complementos (plugins) de Claude Code, usar la PC (*computer use*) y el navegador desde las sesiones de Iridium. Era el frente Capacidades (D-102); desde D-166 es la segunda parte de Paridad.
2026-11-24: definición en borrador e investigación (S-8, `modulos/paridad/definicion.md` › Segunda parte). Se decide en Q-282 a Q-284.
2026-11-24: PA-I4 (ver y apagar los conectores) probada en Q-287; siguen PA-I5 (el navegador) y PA-I6 (la PC).
2026-11-24: PA-I5 (el navegador) probada en Q-288; sigue PA-I6 (la PC).
2026-11-24: PA-I6 (la PC, con Windows-MCP) construida; se prueba en Q-292.
Hecho el 2026-11-25: PA-I6 probada en Q-292 y la calidad (paso 8) hecha: Conectar con la lista de la última vez a la vista no hacía nada (arreglado), la PC y el navegador juntos, Windows-MCP roto o desinstalado, la accesibilidad de la sección y la seguridad de la PC (`modulos/paridad/estado.md` › Calidad). Paridad completa, 1.1.0.

## T-29 — Mantenimiento: subir los parches
Estado: pendiente · Fecha: 2026-11-02 · Origen: `10-operacion.md` › Mantenimiento · Tamaño: mediano, sola
Should. React 19.3.1, Zustand, Vitest, Playwright 1.64 y el SDK de Claude Code 0.3.316, con las pruebas completas y armar.

## T-30 — Lo del Gestor que falta en Iridium
Estado: pendiente · Origen: C-8, C-9 · Tamaño: grande
Should. Búsqueda entre proyectos, grupos y filtros. El menú del clic derecho y Nuevo proyecto ya están (D-089).

## T-31 — Plan completo
Estado: pendiente · Origen: C-15, C-16, C-18, C-19 · Tamaño: grande
Should. Decisiones, módulos como caja, todos los planes en una vista, diagramas.

## T-32 — Respaldo de `.iridium` en GitHub
Estado: pendiente · Fecha: 2026-11-04 · Origen: D-087 · Tamaño: mediano
Should. Un botón en Ajustes › Proyectos que publique Ideas y Skills como repos privados y los suba solo; hoy se hace con Abrir como proyecto › Git › Publicar en GitHub.

## T-33 — Las Could de la definición
Estado: pendiente · Origen: `02-definicion.md` › Funcionalidades · Tamaño: grande
Could. C-17, C-20, C-27, C-34, C-43, C-46 a C-48 (entre ellas, elegir las skills de cada proyecto y adaptar las públicas, D-064).

## T-34 — Revisión: la línea «Página» con la ruta relativa
Estado: hecho (2026-11-20) · Frente: Revisión de la app · Origen: D-082
Should. La línea «Página» de un comentario guarda la ruta entera de la app (con la carpeta de proyectos); en el repo de Iridium conviene que quede relativa al proyecto. Hecho el 2026-11-20: dentro del proyecto queda relativa (`docs/diseno/pantallas/grilla.html`); fuera, sin las carpetas de la PC (`…/app.asar/out/renderer/index.html`); los 94 comentarios de este repo, pasados.

## T-35 — Seguir a la IA, el cierre con comprobación y los avisos de Windows
Estado: pendiente · Origen: C-4, C-6, C-51 · Tamaño: mediano
Should.

## T-36 — Pendientes completos
Estado: pendiente · Origen: C-24 a C-26, C-28 · Tamaño: mediano
Should. Adjuntos, formulario de arranque, respuestas que la IA toma sola, preguntas del chat que pasan a `Q-n`.

## T-37 — El `.zip` de `pnpm publicar`, más chico
Estado: hecho · Frente: Compartir · Origen: D-085
Could. Pesa unos 280 MB: probar a comprimirlo más. Hecho el 2026-11-20 con D-161 (CO-I8): las copias bajan solo la pieza de la app (2 MB) cuando Electron y Claude Code no cambian; el `.zip` completo, 271 MB sin los idiomas que no se usan. La prueba al publicar, Q-225.

## T-38 — Número de versión y `CHANGELOG.md`
Estado: hecho · Frente: Compartir · Origen: D-077, Q-109
Hecho el 2026-11-25: la lista de cambios quedó resuelta de otra forma con D-192 (Q-290): cada versión nueva dice qué trae en el aviso de la esquina, sacado de sus commits, sin un `CHANGELOG.md` aparte.
Could. La opción A de Q-109, cuando quieras. El número ya está (T-121, D-182): queda la lista de cambios.

## T-39 — Defecto 1: una prueba que falla a veces en la tanda completa
Estado: hecho (2026-11-25, el avance solo) · Origen: `08-calidad.md` › Defectos · Tamaño: chico, sola
Las veces que volvió fueron las tres de `r3-electron` (Defecto 7), con dos causas. Una, de la prueba: la app de muestra «Luna» guardaba sus datos en una carpeta fija de Windows que pasaba de una tanda a otra (la extensión con el puerto y el código de cuando se guardó, y lo que recuerda) y usaba los mismos puertos que `r2-revision`, que corre justo antes; ahora tiene carpeta de datos por tanda y puertos propios, y las tres van en serie: si una falla, las otras no corren en vez de fallar con un número que no es el suyo (el «R-1 donde esperaba R-2»). La otra, **del ayudante de Electron, que va en las apps de tus proyectos**: si la extensión terminaba de cargar con la página de la app a mitad de carga, la página recibía la capa de comentar pero no la parte que lee los componentes, y el comentario salía sin «Dónde» ni componentes. Ahora el ayudante lo mira cuando la página termina de cargar y, si le falta, la recarga una vez. La tanda completa también encontró que `pa1-comandos` cerraba la app con la IA a mitad de un turno (Iridium pregunta antes de cerrar y la prueba se quedaba esperando): ahora espera a que la IA termine. La de `d060` (Defecto 1 original) no se repitió desde el 2026-11-01; si vuelve, va en un T-n nuevo con su `error-context`.

## T-40 — Defecto 4: `minimatch` vulnerable dentro de `electron-builder`
Estado: descartado · Origen: `08-calidad.md` › Defectos
Descartado el 2026-11-25: repetido, lo sigue T-79 (los avisos de `pnpm audit`, que incluyen este `minimatch`).
No viaja en la app. Se cierra cuando `electron-builder` lo actualice (se mira en cada mantenimiento).

## T-41 — Deuda: lo copiado del Gestor sin usar y la ventana sin minificar
Estado: hecho (2026-11-26) · Origen: `07-construccion.md` › Deuda técnica · Tamaño: chico, sola
Lo copiado se usa con C-9 y C-10, o se borra; la ventana se minifica si el arranque pasa de 2 s.
Hecho el 2026-11-26: se borró lo del Gestor que nada usaba (la lista por secciones, el formulario de edición, la última actividad vieja y sus pruebas; unas 800 líneas); los casos límite de la lista (nombres raros, fichas rotas, 300 proyectos en menos de 2 s) ahora prueban la lista de la grilla. El arranque tarda 1,1 s hasta ver las tarjetas: la ventana sigue sin minificar (`07-construccion.md` › Deuda técnica).

## T-42 — Sacar de `carpeta-iridium.ts` el nombre viejo de la carpeta de skills
Estado: hecho (2026-11-26) · Origen: D-082, Q-127 · Tamaño: chico, sola
Q-127 ya dio bien la mudanza.
Hecho el 2026-11-26: Iridium ya no busca las carpetas de Ideas y Skills de antes sueltas en la carpeta de proyectos (con su nombre viejo): se mudaron en Q-127. La mudanza desde otra carpeta de Iridium (D-087) sigue igual. De paso, una carpeta que se llame `Ideas` entre tus proyectos ahora sale como un proyecto más, en vez de tomarse por la de las ideas. Sin cambios a la vista.

## T-43 — El framework reemplaza a la guía y a `gestor-proyectos`
Estado: hecho (2026-11-20) · Frente: Skills · Origen: D-092, D-095
Lo pendiente de las dos (D-062, D-063, D-068, Defectos 13 y 14, Q-115) ya estaba en el framework, salvo cómo se llena la ficha y el repaso de todos los proyectos: pasaron a `referencias/ficha.md`. Se borraron las dos skills (de la carpeta Skills, con git) y sus enlaces en la carpeta de Claude, y el hook `comprobar-preguntas.mjs` de la configuración global (lo revisa el control). Las instrucciones globales y el `CLAUDE.md` de Ideas dicen que los proyectos se trabajan desde Iridium (D-093, D-095) y apuntan a la carpeta Skills, no a la vieja. Los `CLAUDE.md` de los demás proyectos se ponen al día con Pasar al framework, uno por uno.

## T-44 — Chat de Skills: traer las skills que la licencia permite
Estado: pendiente · Frente: Skills · Origen: D-014
Traer a la carpeta Skills las skills que la licencia permite y sacar las copias dobles.

## T-45 — Las rutas que nombran la carpeta vieja, después de Mover
Estado: hecho (2026-11-20, con T-43) · Origen: Q-127
Las instrucciones globales y el `CLAUDE.md` de Skills apuntan a la carpeta Skills de Iridium, y el de Ideas dice que la raíz está dos niveles arriba. En la configuración de Claude no quedan rutas a la carpeta vieja.

## T-46 — Un solo botón Actualizar
Estado: hecho · Frente: Orden · Fecha: 2026-11-06 · Origen: R-12
Arma y reinicia, con sus estados (W-1). Hecho en OR-I2 (2026-11-06); probado con la app de uso diario en Q-142 (2026-11-07), las cuatro casillas bien.

## T-47 — D-100 en el código
Estado: hecho · Frente: Orden · Fecha: 2026-11-06 · Origen: D-100
El botón primario claro y las cuentas en gris (OR-2, en OR-I2: hecho), y el ⚠ de Skills en gris (OR-I4, 2026-11-07: la cuenta de Framework, las dobles, el enlace roto y el aviso del detalle de una skill).

## T-48 — Tocar «! N avisos del framework» abre la lista
Estado: hecho · Frente: Orden · Fecha: 2026-11-06 · Origen: W-2
Hecho en OR-I4 (2026-11-07): tocar los avisos de la tarjeta (o «Ver los avisos del framework» en su menú) abre Skills › Framework con la lista de ese proyecto desplegada.

## T-49 — Pasar al framework desde Skills cita la referencia nueva
Estado: hecho · Frente: Orden · Fecha: 2026-11-06 · Origen: OR-I4
El pedido cita `referencias/pasar-al-framework.md` del framework en vez de `actualizar-formato.md` de la guía, y el motor falso lo reconoce (OR-I4, 2026-11-07).

## T-50 — Pasar Iridium al framework
Estado: hecho · Frente: Orden · Fecha: 2026-11-06 · Origen: OR-I1
Con `referencias/pasar-al-framework.md`, hasta que el control dio cero (`modulos/orden/estado.md` › OR-I1).

## T-51 — «Ver en Framework» en Ideas
Estado: hecho · Frente: Orden · Fecha: 2026-11-07 · Origen: W-10
La línea del final de Ideas («Las ideas de N proyectos no aparecen…») lleva **Ver en Framework**, que abre Skills › Framework. Hecho en OR-I4 (2026-11-07). Se fue con Ideas como bloc de notas (D-126, 2026-11-16).

## T-52 — Un sonido para cuando el agente termine de trabajar (cuidado de que no suene cuando el aente simplemente está esperando mientras hace pruebas)
Estado: hecho · Idea: IA · Fecha: 2026-11-07
Hecho el 2026-11-23 (D-183), a pedido del usuario al sacar el Claude Notifier (T-119): suena una vez cuando la IA terminó de verdad (después de lo de fondo y del control), no si se la detuvo o falló; sin avisos de Windows. Ajustes › Notificaciones: prendido, cuál de cuatro y si suena con el avance solo (apagado al principio). Pruebas: `tests/t52-sonido.test.ts`, `tests/e2e/t52-sonido.spec.ts`. Se prueba en Q-271.

## T-53 — La captura del detalle de Ideas no sale en auditoria-ux.ts
Estado: hecho · Frente: Diseño · Fecha: 2026-11-07 · Origen: DI-I1
`11-ideas-detalle` se queda esperando un clic (30 s) y no saca la pantalla, en los dos temas. Se arregla con la página de antes y después de DI-I1, que necesita las 30. Hecho el 2026-11-21 con la tanda 19: el detalle sale del proyecto y los selectores viejos de la herramienta, al día (31 pantallas sin fallas).

## T-54 — Cinco pruebas con la app abierta quedaron viejas
Estado: hecho · Frente: Orden · Fecha: 2026-11-08 · Origen: DI-I1 (`test-results/e2e-completo.log`)
Fallan igual en el commit anterior a DI-I1 (79d8c59), así que no son de Diseño (DI-I3 tanda 4: `r7-r8` y la primera de `in1-ideas` se pusieron al día y pasan; quedan las otras tres): `in1-ideas.spec.ts` (las dos: la línea de los que no pasaron ahora suma «Ver en Framework», T-51), `or4-mapa.spec.ts` › la tabla ancha en Docs no se desplaza en su recuadro (A-10), `r2-revision.spec.ts` › un proyecto Electron sin la línea (no encuentra el botón de Revisión) y `r7-r8-proyectos.spec.ts` › sus ideas y sus skills (no hay Trabajo en la barra). Ver en cada una si cambió la app a propósito (se corrige la prueba) o si es un error (se corrige la app); la de la tabla puede ser el criterio de Q-146.
Hecho el 2026-11-15 con DI-I3 tanda 7: dos pruebas al día (sin framework no hay Docs ni Revisión, D-095) y un error de la app corregido (las palabras de una tabla se cortaban por letra y la tabla nunca se desplazaba, A-10). Detalle en `modulos/diseno/estado.md` › tanda 7.

## T-55 — Diagramas que dibuja la IA, con recorrido paso a paso
Estado: nueva · Frente: Paridad · Fecha: 2026-11-09 · Origen: Q-153, `research/referentes-agentes.md` (Beluga)
Evaluada el 2026-11-26: el bloque de datos (nodos, flechas, pasos) y el dibujo con el recorrido en el chat y en Docs. Grande, de Paridad (o un frente propio). No va directo: hace falta que elijas dónde se ve primero (el chat o los documentos) y si alcanza con un diagrama quieto antes del recorrido.
La IA escribe un bloque de datos (nodos, flechas, pasos) y Iridium dibuja un diagrama: pasar el mouse resalta lo conectado, un clic muestra el detalle y un recorrido explica una cosa por vez. En el chat, en los documentos y en los resúmenes de hito. Solo datos, sin código.

## T-56 — La prueba visible de lo hecho
Estado: pendiente · Idea: IA · Frente: Paridad · Fecha: 2026-11-09 · Origen: Q-153, `research/referentes-agentes.md` (Beluga)
Lo que la IA produce mientras trabaja (capturas, resultados de pruebas) aparece en vivo y lo mejor queda adjunto a la iteración o a la `Q-n` de prueba como evidencia.

## T-57 — Dictado
Estado: descartado · Idea: IA · Frente: Paridad · Fecha: 2026-11-09 · Origen: Q-153, `research/referentes-agentes.md` (Orca)
Un atajo y se habla: el texto entra al mensaje para la IA. Para dirigir con ideas sueltas.

## T-58 — Lo que DI-I3 cambia en la app además de pasar las piezas
Estado: hecho · Frente: Diseño · Fecha: 2026-11-09 · Origen: R-28, R-29, R-38, D-108 a D-111
Sacar la sección Bandeja de todos (D-111; Skills pasa a Ctrl+2 e Ideas a Ctrl+3), la sección Trabajo de un proyecto, Ideas como bloc de notas (D-112) y «Guardar a medias» (lo escrito ya se guarda solo); pasar todos los textos de la app a español neutro, también los que no están en las maquetas (errores, avisos, cuadros; D-110); la barra de abajo sin Claude, sesiones ni hora (D-108). Va con DI-I3 porque ahí se rehacen esas pantallas. La barra de abajo quedó hecha en la tanda 3 (2026-11-14); la Bandeja de todos y Trabajo salieron en la tanda 4 (2026-11-14). «Guardar a medias» y «Se guarda en respuestas/…» salieron con la Bandeja en la tanda 6 (2026-11-15). Ideas como bloc de notas quedó en la tanda 8 (2026-11-16, D-126). Queda el español neutro, con la tanda de cada sección. De la grilla (tanda 17, 2026-11-21), lo que la maqueta suma y la app no tiene: el botón ⋯ de la tarjeta al pasar el mouse y «archivado el …» con la fecha. Hecho el 2026-11-21 con la tanda 19: el ⋯, «archivado el …» (con `archivadoEl` en la ficha) y el español neutro en los errores y avisos que faltaban.

## T-59 — Rehacer Trabajo e Ideas
Estado: hecho · Frente: Diseño · Fecha: 2026-11-09 · Origen: R-40, Q-155
La pestaña Trabajo es una lista larga de texto sin un uso claro. El usuario propone Ideas como un bloc de notas libre (pegar enlaces y lo que sea; después se pide en el chat) y algo gráfico para ver qué se está haciendo y qué está anotado. Q-155 (B, D-112): Trabajo sale de la vista e Ideas es un bloc de notas; maquetas hechas el 2026-11-09. En la app, con T-58.

## T-61 — Estilos de texto con nombre en el sistema
Estado: hecho · Frente: Diseño · Fecha: 2026-11-09 · Origen: Q-159, D-114
Título, cuerpo, rótulo, código…: cada estilo con tamaño, interlineado y peso, y un ejemplo en Diseño › Sistema. Definir cómo se escriben en `tokens.css` (o en `piezas.css`), con el lector, el control y las pruebas en el mismo cambio. Antes de DI-I3. Hecho el 2026-11-12 (D-116).

## T-62 — Una ficha por pieza en el sistema
Estado: hecho · Frente: Diseño · Fecha: 2026-11-09 · Origen: Q-159, D-114
Las piezas agrupadas (acciones, navegación, avisos, del dominio), cada una con para qué sirve, sus estados y qué tokens usa; Diseño › Sistema las muestra junto a `piezas.html`. Con el lector, el control y las pruebas. Antes de DI-I3. Hecho el 2026-11-12 (D-117).

## T-63 — Las medidas fijas como tokens
Estado: hecho · Frente: Diseño · Fecha: 2026-11-09 · Origen: Q-159, D-114
La altura de la barra, de los controles y de las filas, los anchos de los paneles: tokens con su uso en lugar de números sueltos en `piezas.css`. Sistema las muestra; el control puede avisar de una medida repetida escrita a mano. Antes de DI-I3. Hecho el 2026-11-12 (D-119).

## T-65 — Ver que la IA sigue trabajando aunque espere algo de fondo
Estado: hecho · Frente: Diseño · Fecha: 2026-11-14 · Origen: R-53
Cuando la IA deja algo corriendo de fondo (por ejemplo, las pruebas con la app abierta, que tardan diez minutos) y espera el aviso, la conversación se ve terminada: no hay nada que diga que sigue trabajando ni cuánto falta. El usuario pide un indicador de que está trabajando o esperando; un porcentaje sería ideal, pero alcanza con eso. Ver qué avisa Claude Code de las tareas de fondo y de las esperas, y mostrarlo en la cabecera de la conversación y en la pestaña del proyecto. Va con la tanda del marco de DI-I3. Hecho el 2026-11-14 (DI-I3, tanda 3): Claude Code avisa la lista de lo que corre de fondo, no cuánto falta; la conversación lo nombra con Detener, la pestaña dice «Esperando», la sesión queda abierta y la IA retoma sola (también arregló R-54).

## T-64 — Que un proyecto sepa cuándo el framework le pide algo
Estado: pendiente · Frente: Orden · Fecha: 2026-11-12 · Origen: Q-160
Con D-115 el usuario tuvo que pedirle a mano a otro proyecto que pasara su design system: «ese proyecto no sabía que debía hacer eso». Propuso que Iridium le avise al proyecto (por ejemplo, con una línea en su `estado.md`). Cada proyecto ya tiene la fecha de su framework (`**Framework:** AAAA-MM-DD` en `docs/README.md`). Q-161 (A, D-118): novedades del framework con fecha, «N novedades» en la tarjeta y en Skills › Framework, y **Ponerse al día**. Detrás de Diseño; las primeras novedades, las fichas de las piezas (D-117) y las medidas fijas (D-119).

## T-60 — Reciclar las guías de impeccable en el framework
Estado: hecho · Frente: Diseño · Fecha: 2026-11-09 · Origen: pregunta del usuario, Q-156
impeccable (licencia Apache 2.0) trae guías para limpiar una pantalla (quitar lo que sobra, bajar el ruido, aclarar los textos, la tipografía) y un piso de calidad con comprobaciones (contraste, espacios, letra). Se pueden pasar en nuestras palabras a `referencias/06-ui.md` del framework, con la atribución que pide la licencia. Q-156 (A, D-113): hecho el 2026-11-09 en `referencias/06-ui.md` › Repaso antes de mostrar una maqueta.

## T-66 — La ventana vuelve como quedó
Estado: hecho · Fecha: 2026-11-15 · Origen: pedido del usuario
Que Iridium recuerde si estaba maximizada o en ventana y vuelva así al abrir. Hecho el 2026-11-15: al cerrar se guardan en `config.json` (`ventana`) el lugar y el tamaño sin maximizar y si estaba maximizada; al abrir vuelve igual. Si ese lugar ya no se ve (se desconectó un monitor), abre con el tamaño de siempre, maximizada si lo estaba. Las pruebas (ventana oculta) no lo guardan ni lo usan. Pruebas: `tests/t66-ventana.test.ts`.

## T-67 — Actualizar solo, sin cortar a la IA
Estado: hecho · Fecha: 2026-11-15 · Origen: pedido del usuario
Que las actualizaciones locales sean automáticas, sin hacerse mientras la IA trabaja o espera. Hecho el 2026-11-15 (D-122): con commits sin armar, ningún archivo a medio cambiar y la IA de Iridium libre un minuto, arma sola; con la versión lista, se reinicia sola cuando ninguna IA trabaja ni espera lo que dejó de fondo y la PC lleva 3 minutos sin usarse. El botón sigue para hacerlo ya. No reintenta solo un armado que falló ni arma lo que `pnpm volver` dejó afuera (`release/retenido.json`) hasta que haya otro commit; una versión que no entró tampoco se reintenta sola. Pruebas: `tests/or2-actualizar.test.ts`, `tests/co6-sin-armar.test.ts` y `co6-sin-armar.spec.ts` › solo.
Q-167 (2026-11-15): la ventana y el reinicio con la PC quieta andan, pero tras un commit de la IA no apareció «Actualizando…» solo. El usuario pide que la espera sea por Iridium sin usar (minimizada, de fondo o sin actividad en su ventana) y no por la PC, porque la sigue usando para otras cosas. Se corrigen las dos cosas antes de la tanda 6 de Diseño; cambia D-122.
Corregido el 2026-11-15: el armado solo sí andaba (los registros muestran que cada commit posterior se armó solo entre 1 y 2 minutos después: 13:03→13:05, 13:22→13:24, 13:29→13:30); armar tarda unos 20 segundos y lo que no pasaba era el reinicio, que esperaba a la PC quieta. Ahora espera a Iridium sin usar 3 minutos y, si no estaba al frente, la versión nueva abre minimizada sin quitar el foco (D-122 al día). Pruebas: `or2-actualizar.test.ts` › Iridium sin usar y `co6-sin-armar.spec.ts` › solo. Q-169 (2026-11-15): probado por el usuario; arma solo tras el commit, no se reinicia mientras la usa, con 3 minutos sin usarla se reinicia y vuelve minimizada, en el mismo proyecto y maximizada si lo estaba.

## T-68 — Medir si conviene un chat nuevo o seguir en el mismo
Estado: en curso · Fecha: 2026-11-15 · Origen: pregunta del usuario, Q-168 · Tamaño: chico
Tamaño sin «sola» hasta el 2026-11-29: antes no hay dos semanas para comparar.
Con los registros de Claude Code se midió cuánto cuesta arrancar un chat y cuánto cuesta cada paso según el contexto (`research/costo-de-contexto.md`). Chat nuevo conviene cuando el viejo pasó ~200 mil o la caché venció (más de una hora); no para tareas chicas. Volver a medir hacia el 2026-11-29 con el ajuste que elija el usuario en Q-168 y comparar el costo por iteración cerrada.
Q-168 (A, D-123): aplicada el 2026-11-15 la regla por tamaño y tiempo (framework e instrucciones globales) y el arranque liviano (`estado.md` corto, `CLAUDE.md` sin la lista de herramientas, que pasa a `herramientas-ia.md`). Para medir: `tools/medir-uso.ts`, que guarda el resumen en `research/uso/sesiones.json` (hecho el 2026-11-15, con la línea de base de las 115 conversaciones). Pendiente: correrlo hacia el 2026-11-29 (`--dias 14`); si el `estado.md` largo se repite, que el control marque «En qué estamos ahora» de más de cinco líneas o muy largo.

## T-69 — Un lugar donde anotar las ideas del proyecto sin salir de la tab del proyecto, ahora debo irme al panel general
Estado: hecho · Frente: Ideas · Fecha: 2026-11-15
Pasó a ser el frente Ideas (D-127): sumado a guardar enlaces de repos para revisar y a ver cada idea por separado. Forma elegida en D-128 (la C); se construye después de su UX.
Hecho el 2026-11-17: el frente Ideas terminó (ID-I1 a ID-I4 probadas, la última en Q-198; la calidad, en `modulos/ideas/estado.md` › Calidad).

## T-70 — es posible un "session usage starter"? es decir, una pequeña herramienta que inicie con casi 0 tokens el periodo de 5hs de uso, de este modo se podría iniciar siempre cada 5hs independientemente de si y escribí algo o no, para aprovechar mejor los periodos de tiempo de 5hs, creo que esto es similar a los caché warmers que según entiendo anthropic los permite, quizás deberíamos echar un ojo antes de hacerlo
Estado: hecho · Frente: Arranque · Idea: usuario · Fecha: 2026-11-15 · Origen: D-135
Decidido en Q-188 (D-135): con trabajo real y desde la misma Iridium abierta, a eso de las 3 y unos 5 minutos después de que venza cada ventana. Va después de Ideas.
Revisada con la IA el 2026-11-16 (espera Q-184):
- **Cómo anda el límite:** en Pro y Max, el período de 5 horas empieza con el primer mensaje (en claude.ai o en Claude Code, que comparten el uso) y se renueva 5 horas después; aparte está el límite semanal, que no cambia con esto.
- **Se puede:** una tarea programada de Windows que a la hora elegida corre `claude -p` con un mensaje mínimo (con Haiku: casi nada del límite semanal) abre el período aunque no estés. Es el Claude Code oficial, en su modo sin ventana, que Anthropic ofrece para automatizar; otros ya lo hacen («session warmer», «window primer»).
- **Qué gana y qué no:** no da más uso, solo mueve cuándo se renueva. Sirve si se alinea con tu día: por ejemplo, abrirlo a las 7 si arrancás a las 9 hace que se renueve a las 12, en medio de la mañana, y tenés dos períodos en vez de uno. Mal elegida la hora, empeora: si se abre y no llegás, se renueva cuando estás en lo mejor.
- **Lo de Anthropic:** las condiciones prohíben usar el servicio «por medios automáticos» salvo con clave de API o donde Anthropic lo permita; Claude Code sin ventana sí está pensado para eso, pero no hay nada escrito sobre arrancar el período a propósito. Riesgo bajo con un mensaje por día; no usar herramientas de terceros que imiten a Claude Code (eso sí lo cortaron). Los «cache warmers» son otra cosa: mantienen la caché de la API, que se paga por uso, y no aplican a la suscripción.
- **Cómo sería en Iridium:** en Ajustes, «Abrir el período de Claude a las HH:MM» (una o más horas, días de semana), que crea o borra la tarea de Windows; anda con Iridium cerrada y la PC prendida, y si falló (sin red, sesión vencida) lo dice la próxima vez que abras Iridium. Chico: una o dos iteraciones, después del frente Ideas.
- **Q-184, la propuesta del usuario (2026-11-16):** en vez de un mensaje vacío, arrancar el período con trabajo real: tocar solo «Continúa con el proyecto» en un proyecto con la Bandeja lista (respuestas sin procesar, que no dependen de él), a eso de las 3 si la PC está prendida y unos minutos después de que venza cada ventana; sin bandeja lista, no hace nada. Revisado: es mejor que el mensaje vacío (no hay nada que parezca abuso: es el uso normal de Claude Code, que Iridium ya hace) y Iridium ya sabe cuándo vence la ventana (la barra de uso la lee del motor). Cómo sería: uno solo por vez, el proyecto cuyas respuestas esperan hace más; en una conversación nueva (a esa hora la caché venció, y retomar una larga es lo más caro); no si ya hay una sesión trabajando en él; la Bandeja dice qué arrancó y cuándo. Necesita Iridium abierta (es la que corre las sesiones), salvo que una tarea de Windows la abra. Espera Q-188.

Hecho el 2026-11-21: es el frente Arranque (`modulos/arranque/estado.md`), construido, probado una noche (Q-227) y con su calidad medida. Quedó `en curso` al cerrar el frente; corregido el 2026-11-22 (T-117).

## T-71 — El Mapa como una red de pasos, uno por frente
Estado: hecho · Frente: Mapa · Fecha: 2026-11-15 · Origen: R-59, Q-171
El usuario quiere rehacer el Mapa como un frente propio: arriba, un mapa por frente, cada uno una red (un gráfico) de sus pasos, más fácil de leer, con un color por frente. Posibles motores: Mermaid, o un formato JSON propio con un motor a medida. Hay que pensarlo en el chat antes de construir (paso 1, Propuesta, del frente nuevo). Mientras tanto, lo que falla del Mapa de hoy no se pule (Q-171: el bloque del frente activo queda como está).
- **Repensado en el chat (2026-11-17):** el usuario se pregunta para qué es el Mapa. Lo que le falta no es ver los pasos de un frente sino **qué viene después de lo que hay en Pendientes**, sin leer texto, y saber si una idea suya ya está en el plan: una hoja de ruta (roadmap). No busca controlar a mano (mover tarjetas), sino ver. Tiene que servir en los hitos 0 a 9 (el camino son los hitos) y después del 10 (el camino son los frentes, y la app puede cambiar mucho). Hoy `trabajo.md` tiene 77 ítems, 45 abiertos (20 nuevas, 25 pendientes) y ningún orden entre ellos: por eso se pierde el foco.
- **Formas pensadas:** (A) **Ahora / Después / Más adelante** por frente: tres columnas, una fila por frente, cada cosa una línea con su título; las ideas aprobadas sin lugar caen en «Sin ubicar» hasta que la IA las ubica; la IA mantiene el orden y el usuario solo lo corrige si quiere; desde una cosa de «Más adelante», «Empezar este frente» le pide a la IA abrirlo. Antes del hito 10, «Ahora» es el hito en curso. Los pasos del frente activo se ven como una línea chica dentro de su fila (lo que pedía R-59, sin un gráfico aparte). (B) **La red de pasos por frente** (R-59): linda, pero responde «dónde estoy en este frente», no «qué viene»; con 45 cosas abiertas un gráfico se vuelve una maraña. (C) **Kanban** (nueva, pendiente, en curso, hecho): son los estados de hoy; muestra en qué estado está cada cosa pero no el orden, y pide mover tarjetas a mano. Recomendada: A. Espera Q-193.
- **Q-193 (2026-11-17) → D-137:** el kanban queda descartado; A y B siguen, en maquetas (`diseno/pantallas/mapa-a.html` y `mapa-b.html`). B es un camino de pasos por frente, con ramas y el foco cerca del último hecho. Espera Q-194.
- **Q-194 (2026-11-17) → D-138:** queda el camino por frente, un frente a la vez desde una barra arriba, con pasos concretos y sin ruido. Falta decidir cómo se escribe y mantiene la ruta de cada frente sin gastar de más (Q-195).
- **Q-195 (2026-11-17) → D-139:** la ruta de cada frente es una lista «Ruta» en su `estado.md`, un paso por línea (las ramas con sangría), que la IA escribe al abrir el frente y pone al día al cerrar cada iteración. La propuesta del Mapa queda cerrada; la construcción (el formato en el framework, su lector, el control y la pantalla) va después de Ideas.
- **2026-11-17:** se abrió el frente Mapa (`modulos/mapa/`, D-140); la definición espera Q-199 a Q-201.
- **2026-11-18:** hecho. El Mapa nuevo está en uso (probado en Q-203 y Q-204) y con su calidad (`modulos/mapa/estado.md` › Calidad).


## T-72 — La imagen y el color de cada IA en la conversación
Estado: pendiente · Idea: IA · Fecha: 2026-11-15 · Origen: R-64 · Tamaño: mediano
El nombre de la IA en la conversación («Claudio») llevaría una imagen de perfil por fuente de IA (Claude, en este caso), elegida por el usuario, y un color también a elección. Va con Ajustes › Perfil (AJ-2, donde ya se elige el nombre) y con el color donde informa (D-124): hay que decidir si el color es libre o de una lista acotada para que no choque con el verde, el ámbar y el rojo, que ya dicen algo. Es una función nueva, no un arreglo: después de DI-I3.

## T-73 — ckryptickunal/OpenDesigner
Estado: nueva · Idea: enlace · Fecha: 2026-11-16 · Enlace: https://github.com/ckryptickunal/OpenDesigner
Evaluada el 2026-11-26: leer el repositorio y proponer qué ideas de diseño copiar al frente Diseño o al framework (06-ui) es chico. No va directo: según el método, lo que se saca de un enlace lo elegís vos en el chat; se hace en una conversación con vos.
una skill de diseño para ver si podemos copiar ideas

## T-74 — Ver desde acá si la IA de la otra persona trabaja bien con Iridium
Estado: nueva · Idea: usuario · Fecha: 2026-11-16 · Origen: pedido del usuario al hacer público el repo (D-132)
Evaluada el 2026-11-26: lo más simple, «Mandar un informe» (versión, avisos del control y errores del registro, sin el contenido de los proyectos) que la otra persona envía, es mediano y de Compartir. El canal entre las dos IA o el acceso remoto de la nota es grande y toca la protección (P2). No va directo: hay que conversarlo y elegir el alcance.
Una forma de depurar la copia compartida: saber si su IA escribe los formatos que Iridium lee (lo que marca el control), si las sesiones fallan y con qué versión. Lo más simple y respetuoso: un botón en su Iridium, «Mandar un informe», que arma un resumen sin el contenido de sus proyectos (los avisos del control, los errores del registro y la versión) para que ella lo envíe; mandarlo solo, sin que lo pida, sería una conexión a un tercero que no eligió (P2) y necesita su permiso. Pensarlo en el chat antes de construir.

## T-75 — La opcion de poder hacer theming local, independiente de las actualizaciones. Supongo que en esa opcion habría que dejar una pequea referencia para que la IA vaya a buscar la guia de como hacerlo a github, donde está el codigo fuente y puede hacer las ediciones sin equivocarse
Estado: pendiente · Frente: Apariencia y ajustes · Idea: usuario · Fecha: 2026-11-16 · Origen: Q-187
Decidido en Q-187 (D-134): solo tokens, la guía dentro de la app y la IA desde Ajustes. Va después de Ideas.
Revisada con la IA el 2026-11-16:
- **Se puede, y sin tocar el código:** todos los colores, líneas y letras de Iridium salen de una lista de tokens (`docs/diseno/tokens.css`, D-104), y cada uno ya dice para qué se usa (D-114). Un tema propio es un archivo que pisa algunos de esos tokens; Iridium lo carga al abrir, después de los suyos.
- **Independiente de las actualizaciones:** una versión nueva reemplaza solo la carpeta de la app (`win-unpacked`, D-085); el archivo del tema vive en los datos de quien la usa (la carpeta Iridium, D-083), así que sobrevive. Si una versión suma un token nuevo, el tema no lo pisa y se ve el de siempre: no se rompe.
- **Por qué tokens y no CSS libre:** con reglas sueltas sobre las piezas, la IA podría cambiar cualquier cosa, pero cada versión que renombre una pieza rompería el tema en silencio. Con tokens, lo que puede salir mal es un color feo o poco legible, y eso se controla (contraste).
- **La guía para la IA:** mejor dentro de la app que solo en GitHub: anda sin internet, coincide con la versión instalada (en GitHub está la última de `dev`, que puede tener tokens que esa copia no tiene) y respeta lo local. La guía se arma sola de `tokens.css` al armar, así no queda vieja; el enlace a GitHub va igual, como referencia al código.
- **Cómo sería:** una carpeta `Tema` en la carpeta Iridium (como `Ideas` y `Skills`), con `tema.css`, la guía y un `CLAUDE.md` que le dice a la IA qué puede tocar. En Ajustes › Apariencia: «Tema propio: activo», **Editar con la IA** (abre su conversación ahí), **Quitar** (vuelve al negro) y un aviso si un color no pasa el contraste. El cambio se ve al guardar, sin reiniciar. Chico a mediano: una o dos iteraciones, en el frente Apariencia y ajustes, después de Ideas.

## T-76 — La miniatura del sitio en un enlace pegado
Estado: pendiente · Frente: Ideas · Idea: usuario · Fecha: 2026-11-17 · Origen: Q-189
Al pegar una dirección en una idea (y en el campo de arriba), además de la Etiqueta de enlace, una tarjeta con la imagen, el título y la descripción del sitio, como en WhatsApp o Reddit. Para eso Iridium tiene que bajar la página que se pegó (su vista previa: `og:image`, `og:title`) y guardar la imagen con la idea, para que se vea sin internet. Es una conexión al sitio que el usuario pegó, nada más (P2). Una iteración, después de ID-I4.

## T-77 — Los proyectos ordenados por el último cambio
Estado: hecho · Frente: Inicio · Fecha: 2026-11-17 · Origen: R-80
El usuario quiere la grilla de Proyectos ordenada por el último con cambios (hoy: por estado y, dentro de cada uno, por nombre; D-022). El último cambio sería el último commit o, sin git, lo último escrito en `docs/`. Espera Q-191 (si se sigue agrupando por estado). Chico.
Hecho el 2026-11-17 con Q-191 (A, D-136): todos juntos por el último cambio (lo más reciente entre el último commit y lo último escrito en `docs/`), los archivados al final; con sus pruebas (`tests/t77-ultimo-cambio.test.ts`, `tests/core-grilla.test.ts` y `tests/e2e/i1-esqueleto.spec.ts`).

## T-78 — un nuevo estado "implementada" para las ideas
Estado: hecho · Idea: usuario · Fecha: 2026-11-17
Hecho el 2026-11-22 (T-117, D-174): las ideas terminadas se ven como «Hechas» en Ideas, aparte de las aprobadas.

## T-79 — Paquetes con avisos de seguridad (hono, picomatch, minimatch)
Estado: pendiente · Fecha: 2026-11-17 · Tamaño: chico, sola
Visto en el paso 8 de Ideas: `pnpm audit` da 10 avisos (1 alto): `hono` y `@hono/node-server` llegan con el SDK de Claude Code (0.3.309; hay 0.3.326) y `picomatch` y `minimatch`, con `electron-builder` (solo al armar). Ninguno en lo que Iridium expone. Subir el SDK con las pruebas completas y ver si `electron-builder` ya trae las versiones arregladas. Menor.

## T-80 — Ofrecer la capacidad a los proyectos de mantener las aplicaciones acualizadas si se cuplen ciertas condiciones, que la app no esté abierta y que esté instalada, esto solo si corresponde para el tipo de app. En el caso actual serviría tanto para Moon como para bedrock studio
Estado: en curso · Frente: Abrir · Idea: usuario · Fecha: 2026-11-17 · Origen: Q-208
Evaluada el 2026-11-18; aprobada en Q-208 (D-148), frente Abrir, detrás de Arranque. Son dos problemas: **saber cómo se abre** lo que hace un proyecto (lo que hoy les cuesta a otras personas) y **mantenerlo al día**. El primero vale para casi todo (una app de escritorio se abre con su `.exe`, una página con su dirección, una herramienta de consola con un comando; un proyecto sin nada que usar no lleva botón); el segundo, solo para las apps de escritorio que se arman en la PC. Propuesta: que la IA declare en `scripts.md` cuál es el script que abre lo que el proyecto hace y de qué tipo es, y que Iridium lo muestre como **Abrir** en la tarjeta y la pestaña; después, para el tipo escritorio, armar solo cuando hay cambios y la app está cerrada, como Iridium hace consigo mismo (D-122). Es un cambio de formato: va con el lector, el control y el framework (D-086). Pasada adelante el 2026-11-19 (D-153): frente abierto en `modulos/abrir/`, definición esperando Q-216.

## T-81 — Tengo otro problema con algunas apps, especificamente con los tests, Moon usa los tests ocupando la pantalla, mientras que iridium los hace sin aparecer pestañas a cada rato, eso mismo queremos lograr en todas las apps compatibles, no s´pe si esto es una guia para el framework, creo que conecta con lo de las plantillas de TIPO de apps (muy genéricas o modulares quizás ¿? )
Estado: pendiente · Frente: Plantillas · Idea: usuario · Fecha: 2026-11-18 · Origen: Q-209
Evaluada el 2026-11-18; aprobada en Q-209 (D-150): frente Plantillas, piezas modulares por tipo de app; la primera, las pruebas sin ventanas. Detrás de Arranque, antes de Abrir. La app de la que habla también es de Electron, como Iridium, y abre la ventana de cada prueba a la vista. Electron no tiene un modo «sin ventana»: lo que hace Iridium (D-072) es una receta en su propio código, que se prende solo durante las pruebas (`IRIDIUM_OCULTA`): la ventana fuera de la pantalla, sin botón en la barra de tareas y sin foco, y las consolas escondidas. Se puede llevar a cualquier proyecto, pero cambia según el tipo de app: una página que se prueba con Playwright ya corre sin ventana con solo pedirlo; una app de escritorio de Electron necesita la receta; una herramienta de consola no abre ventanas; otras apps de escritorio, lo que su motor permita. Propuesta: una regla en el framework («las pruebas no ocupan la pantalla del usuario») con la receta por tipo en `referencias/08-calidad.md` y `07-construccion.md`, que la IA aplica al armar las pruebas de cualquier proyecto y al retomar uno que ya las tiene. El tipo de app es el mismo dato que va a declarar el frente Abrir (D-148); unas plantillas por tipo de app son una idea más grande, aparte.

## T-82 — una demo en vivo para cuando se instala la app por primera vez, muestra paso a paso qué hacer y como hacerlo, quizás con un proyecto pequeño de prueba y un modelo de los más baratos, haiku para Claude, luna para ChatGPT, etc
Estado: pendiente · Idea: usuario · Fecha: 2026-11-18

## T-83 — Enter guarda la nota de una idea y cierra el cuadro; Ctrl+Enter, salto de línea
Estado: pendiente · Frente: Ideas · Fecha: 2026-11-18 · Origen: R-90
En las ideas de un proyecto, al escribir la nota de una idea: Enter guarda lo escrito y cierra el cuadro, sin cambiar el estado de la idea; Ctrl+Enter hace el salto de línea. Hoy Enter salta de línea.

## T-84 — La pestaña no muestra «esperando» mientras la IA espera algo de fondo
Estado: pendiente · Fecha: 2026-11-19 · Origen: R-92
En la conversación de un proyecto, la IA terminó su turno con algo corriendo de fondo («Quedo a la espera del resultado de las pruebas») y la pestaña no la marcó «esperando lo que dejó de fondo» (T-65); al rato retomó sola. Parece que Iridium perdió el rastro de lo que corría de fondo. Reproducir con el motor falso («de fondo») y con un caso real: varias tareas de fondo, o una que se corta.

## T-85 — «Respondida, sin procesar» en verde
Estado: hecho · Fecha: 2026-11-19 · Origen: R-93
En la Bandeja de entrada, la Señal «Respondida, sin procesar» de una pregunta va en verde (`--bien`), como lo que ya está hecho del lado del usuario. Revisar que no choque con D-108 (sin ruido) ni con la Señal en la tarjeta. Hecho el 2026-11-21: la Señal va en verde, también «Postergada, sin procesar» (el usuario ya hizo su parte); sin ruido, porque es una sola Señal por pregunta.

## T-86 — El aviso «Mientras no estabas» suma las apps que se armaron solas
Estado: hecho · Frente: Abrir · Fecha: 2026-11-19 · Origen: D-156
Lo que el diseño técnico dejó como «Should, más adelante»: al volver, el aviso del Arranque dice también qué apps se armaron de noche y cuáles fallaron.
Hecho el 2026-11-26: el aviso «Mientras no estabas» suma un renglón por app que se armó sola mientras no estabas («se actualizó» o, en rojo, «no se pudo actualizar» con el motivo al pasar el mouse); se prueba en Q-308.

## T-87 — Que la app instalada en otra PC también se ponga al día
Estado: pendiente · Frente: Abrir · Fecha: 2026-11-19 · Origen: Q-222 · Idea: IA
La actualización automática arma e instala en la PC donde está el código; en otra PC sin el código la versión nueva se publicó y se bajó a mano. Aprobada en Q-223 (D-160): la app se actualiza sola al abrirse desde sus versiones publicadas en GitHub, como Iridium (D-085), y su armado la publica después de instalarla.

## T-88 — Iridium al día con GitHub, y Commit y subir en Git
Estado: hecho · Fecha: 2026-11-20 · Origen: D-159
Pedido del usuario: un proyecto mostraba lo de antes de lo que se hizo en la otra PC, y Git no tenía cómo guardar y subir las respuestas. Iridium trae sola lo del remoto (al abrir, cada cinco minutos y al entrar a un proyecto) y Git suma Commit y subir y Sincronizar. Prueba en Q-224.

## T-89 — Subir solas las respuestas a las preguntas
Estado: pendiente · Idea: IA · Fecha: 2026-11-20 · Origen: D-159
Al responder una `Q-n` desde Iridium, que la respuesta se guarde en un commit y se suba sola (si el proyecto está en GitHub y la IA no trabaja en él), para que la otra PC la vea sin tocar Commit y subir.

## T-90 — Buscar un archivo en Archivos
Estado: hecho · Frente: Diseño · Fecha: 2026-11-20 · Origen: DI-I3 (tanda 12) · Idea: IA
La maqueta de Archivos (`docs/diseno/pantallas/archivos.html`) tiene una lupa en la cabecera: buscar un archivo del proyecto por su nombre. Es una función nueva (hoy no hay cómo buscar), así que la tanda 12 pasó la sección sin ella; va al cerrar DI-I3, con lo que el rediseño cambia además de las piezas (T-58). Hecho el 2026-11-21 con la tanda 19: la lupa cambia el árbol por la búsqueda.

## T-91 — Las pruebas corren solas después de cada turno
Estado: descartado (D-163: la verificación final encuentra algo casi la mitad de las veces) · Idea: usuario · Fecha: 2026-11-20 · Origen: el chat del 2026-11-20
Que Iridium corra las pruebas al terminar cada turno de la IA y solo le avise si algo falla, para ahorrar los pasos y la espera de la verificación final. Medido en `research/costo-de-pruebas.md`: las pruebas son el 14 % de los pasos, pero la verificación final encuentra algo casi la mitad de las veces. Decisión en Q-230.

## T-92 — Ordenar cómo corre las pruebas la IA
Estado: descartado · Idea: IA · Fecha: 2026-11-20 · Origen: D-163
Sin cambiar cuándo se verifica: un solo comando de cierre que corre todo y muestra solo lo que falla, Playwright nunca en segundo plano con sondeos, y probar si puede correr de a varias ventanas (hoy va de a una). Ahorra pasos y minutos de espera (`research/costo-de-pruebas.md`).

## T-93 — Al comparti Iridium sucedió un problema, la otra persona no tenía ni idea de como usarlo, quizás una demo programada sirva, como un recorrido de la app, es una idea ya mencionada, la otra cosa es que tampoco tenía ni la más de las palidas ideas sobre desarrollo, no tenia ni nocion de lo que es una app web, de lo que es una nativa, electron, rust, nada de nada. Como enfrentamos este segundo desafío? es que en realidad hay que hacerle saber estas cosas? definir plantillas predefinidas para ciertos tipos de apps dependiendo de algunos requisitos? como por ejemplo sincronizacion celular/desktop, etc.
Estado: nueva · Idea: usuario · Fecha: 2026-11-20
Evaluada el 2026-11-26: dos partes: un recorrido guiado de la app (mediano, Inicio o Compartir) y que la IA guíe a alguien sin nociones técnicas con plantillas por requisitos (sincronía celular, web o escritorio), que es grande y va con Plantillas (T-81). No va directo: hay que decidir con vos cuánto se le explica y cuánto se le esconde a esa persona.

## T-94 — Pantallas a medida para algunas partes de los hitos
Estado: nueva · Idea: usuario · Fecha: 2026-11-21 · Origen: una respuesta del usuario en otro proyecto
Evaluada el 2026-11-26: un frente nuevo de pantallas por hito; la primera, el tablero MoSCoW del hito 2 (arrastrar casos entre columnas y que quede escrito en 02-definicion.md), es mediana; el frente entero, grande. No va directo: necesita su propuesta y que elijas qué pantalla va primero.
Hoy un documento largo (como la clasificación MoSCoW de un hito 2) solo se puede leer y contestar con una pregunta: no hay forma cómoda de revisarlo y corregirlo. La idea es sumar cuestionarios o pantallas específicas para ciertas partes de ciertos hitos: por ejemplo, un tablero de decisiones del MVP con columnas (Must, Should, Could, Won't, postergar como idea) donde se arrastran los casos, o una pantalla de métricas para las fases de rendimiento. El usuario lo ve como un frente de mejora grande y casi sin costo.

## T-95 — plugins por proyecto, similares a los mods de claude desktop
Estado: pendiente · Idea: usuario · Fecha: 2026-11-21

## T-96 — una muestra de como se ve el chat de Claude desktop, el + despliega esas opciones, el resto nosotros lo tenemos parecido.
Estado: hecho · Frente: Paridad · Idea: usuario · Fecha: 2026-11-21 · Origen: D-165
Es la base del frente Paridad: el + del compositor con Agregar archivos o fotos (Ctrl+U) y Comandos de barra, y «/» para los comandos (`modulos/paridad/propuesta.md`).

Hecho el 2026-11-22: la primera parte de Paridad (PA-I1 a PA-I3, probadas en Q-250, Q-251 y Q-258): «/» con los comandos, el + con archivos y fotos, pegar fotos y el texto largo pegado como ficha. Lo que sigue del frente, Capacidades, es T-28. Quedó `pendiente` al cerrar esa parte; corregido el 2026-11-22 (T-117).

## T-97 — Mencionar un archivo con «@» en el chat
Estado: descartado · Frente: Paridad · Idea: IA · Fecha: 2026-11-21 · Origen: Q-238
Como en Claude para VS Code: escribir «@» abre la lista de archivos del proyecto y el elegido viaja con el mensaje. Quedó fuera de la primera parte de Paridad (D-166).

## T-98 — Dictar un mensaje con el micrófono
Estado: descartado · Frente: Paridad · Idea: IA · Fecha: 2026-11-21 · Origen: Q-238
Repetida: el dictado ya estaba como T-57 (de Capacidades, que ahora es Paridad, D-166).

## T-99 — La extensión de la Revisión, al negro
Estado: descartado · Frente: Diseño · Idea: IA · Fecha: 2026-11-21 · Origen: cierre de DI-I3
Lo que la extensión dibuja sobre otra app (el aviso del modo comentar, el resaltado, la tarjeta del comentario) sigue con el aspecto de antes: Chakra Petch, JetBrains Mono y el verde con tinte (`extension/src/selector/estilos.ts`, con las fuentes en `extension/fuentes/`). Pasarlo a los tokens del negro y a la letra del sistema, con el paso 8 de Diseño.

## T-100 — Ronda de UX al cerrar Arranque
Estado: hecho · Frente: Orden · Fecha: 2026-11-21 · Origen: D-096 (Arranque pasó a `hecho`)
Toda la interfaz con capturas (`tools/auditoria-ux.ts`) contra `04-ux.md` y los principios de `06-ui.md`, como dice `referencias/ronda-ux.md`. DI-I3 acaba de pasar cada pantalla al negro, así que la ronda mira sobre todo lo que no es aspecto: un solo lugar para cada cosa, los mismos nombres, avisos que se pisan (el de Arranque, el de Ejecutar y los de las conversaciones comparten la esquina). Va antes de construir Paridad (su definición y el spike pueden ir antes). Se registra en `10-operacion.md` › Rondas de UX.
Hecha el 2026-11-21 (ronda 1): T-101 a T-110; el aviso falso del chat general al arrancar se arregló en el momento.

## T-101 — El título de la conversación se corta
Estado: hecho · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
La cabecera del chat junta el título, el historial, Nueva y Continuar en 360 px: «Sin conversación todavía» queda «Sin conversaci…» y, en una ventana de 1024, «Sin c…». Se lee como algo roto. Que el título entre (otra línea, o sin título cuando no hay conversación, porque el cuerpo ya lo explica).

Hecho el 2026-11-21: sin conversación, la cabecera va sin título (el cuerpo ya explica qué hace Continuar). Bajar los botones a otra línea se probó y no va: la cabecera del chat tiene que medir lo mismo que la de la sección.

Q-248 pidió que diga «Nueva conversación» (2026-11-21): dice eso, y sin conversación no muestra el botón Nueva, que no hacía nada (el chat ya está en blanco); así el título entra entero a 1440 y a 1024.

## T-102 — El ancho de lectura, en un solo lugar
Estado: pendiente · Idea: IA · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
Angosto · Normal · Ancho está en la cabecera de Docs y en Ajustes › Apariencia, que queda con solo eso desde que hay un tema (D-104). Propuesta: dejarlo en Docs, donde se usa, y sacar Apariencia de Ajustes hasta que tenga algo propio.

## T-103 — Git en blanco mientras lee
Estado: hecho · Frente: Orden · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
En un repo grande (este, unos 3 s) la sección Git queda vacía debajo del título hasta que llega todo. Las demás secciones muestran siluetas mientras cargan (W-2, W-5, W-13): Git también, con la forma de la rama, Cambios e Historial.

Hecho el 2026-11-21: mientras lee, la forma del panel (la rama, Cambios e Historial) con líneas grises, como las demás secciones.

## T-104 — Acerca de muestra el commit entero
Estado: hecho · Frente: Apariencia y ajustes · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
Ajustes › Acerca de copia el mensaje completo del último commit (doce líneas con códigos). CO-5 pide la versión, su commit y cuándo se armó: la fecha y la primera frase del mensaje, con el resto al pasar el mouse.

Hecho el 2026-11-21: la fecha y la primera frase del mensaje (cortada en una palabra si es muy larga); el mensaje entero, al pasar el mouse.

## T-105 — Docs: los archivos de la raíz mezclados con los de docs/
Estado: pendiente · Idea: IA · Frente: Diseño · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
La lista de Docs pone `CLAUDE.md`, `DESIGN.md`, `PRODUCT.md` y el `README.md` de la raíz entre los de `docs/`: quedan dos «README.md» iguales. Además, unas carpetas tienen nombre para el usuario (Hitos, Frentes) y otras el de la carpeta (diseno, ideas, research, revision). Propuesta: los de la raíz en un grupo aparte («Del proyecto») y todas las carpetas con nombre (Diseño, Ideas, Investigación, Revisión).

## T-106 — «Este proyecto no marca cómo se arma»
Estado: hecho · Frente: Abrir · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
Ajustes › Este proyecto, en uno sin la marca `armar`, dice solo «Este proyecto no marca cómo se arma.»: es la palabra del framework, no la del usuario. Que diga para qué es la actualización automática (las apps de escritorio que la IA dejó listas para armarse solas) y que la IA del proyecto lo puede preparar.

Hecho el 2026-11-21: «Para las apps de escritorio: Iridium las arma solas cuando tienen cambios y están cerradas. Este proyecto todavía no está preparado; pídeselo a su IA».

## T-107 — 04-ux.md se quedó atrás de la app
Estado: hecho · Frente: Orden · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
Lo que el documento dice y la app ya no hace: W-1 (la barra de estado con la cuenta y el hito; hoy solo el uso, D-108), W-2 (los filtros por estado, Carpetas y Abrir como proyecto en la cabecera; la tarjeta con el hito), W-5 y W-12 con voseo y «Seguí» (hoy «Continuar», en español neutro, D-110), W-17 (Apariencia con los temas; hoy uno solo, D-104, y el ancho de lectura) y los atajos. Corregirlo desde lo construido, como se hizo con `06-ui.md` al cerrar DI-I3.

Hecho el 2026-11-21: `04-ux.md` corregido desde la app: W-1 (la barra sin ruido), W-2 (la cabecera, la tarjeta y el orden de D-136), W-4 (los avisos juntos), W-5, W-12 y W-14 en español neutro y con «Continuar», W-17 (Apariencia, Acerca de y Este proyecto) y los atajos que existen (`Ctrl+F` no estaba).

## T-108 — La Bandeja vacía empieza en otro lugar que la llena
Estado: hecho · Frente: Orden · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
Con preguntas, la lista de la Bandeja va en la columna centrada (como el Mapa y Scripts); vacía, «Nada en tu bandeja…» queda pegado a la izquierda, debajo del título. En Revisión, el vacío sí va en la columna. Que el vacío de la Bandeja use la misma columna.

Hecho el 2026-11-21: el vacío va en la columna de las preguntas, como el de Revisión.

## T-109 — «Rechazada» en rojo, que es el color de los errores
Estado: pendiente · Idea: IA · Frente: Ideas · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
En Ideas, una idea rechazada lleva «Rechazada» en rojo (Q-175). `06-ui.md` deja el rojo para un error, y en una lista larga las rechazadas llaman más la atención que las que esperan. Propuesta: la palabra en gris, con el título apagado como ahora; el verde de Aprobada queda.

## T-110 — Mirar los avisos juntos en la esquina
Estado: hecho · Frente: Orden · Fecha: 2026-11-21 · Origen: T-100 (ronda de UX 1)
La ronda no pudo ver si los avisos de Arranque, de Ejecutar y de las conversaciones se pisan: `tools/auditoria-ux.ts` no los provoca. Sumarle un paso que los muestre a la vez (con el motor falso y `IRIDIUM_ARRANQUE_EN`) y mirar que se apilen sin taparse ni taparle el cuadro al chat.
Hecho el 2026-11-21: una prueba con la app abierta (`tests/e2e/t110-avisos-juntos.spec.ts`) provoca los tres a la vez y mide que no se pisen, entren en la ventana y no tapen la conversación, a 1440×900 y 1024×700. Se apilan bien. Encontró que los botones del aviso de una conversación caían uno debajo del otro (el estilo apuntaba a un nombre viejo): arreglado.

## T-111 — hay un problema gordo con la ultima actualizacion de iridium en la otra computadora que lo descarga del repo, se queda congelado en negro y solo carga los botones de control de pestaña, es de alta relevancia olucionar eso, quizas un instalador y gestor de actualizaciones real ¿? como un electron builder o algo de eso ¿? esto pasa a ser la prioridad numero 1.
Estado: hecho · Idea: usuario · Fecha: 2026-11-22 · Frente: Compartir
Hecho el 2026-11-24: la otra PC instaló Iridium 1.0.0 con el instalador y abre normal, con sus proyectos (Q-270); de acá en adelante se actualiza sola.
Antes, el 2026-11-22 (CO-I9, `modulos/compartir/estado.md`): la versión publicada (d1d1750) abre bien en esta PC, con datos limpios, con una copia de los datos de uso y con otro idioma, así que la ventana negra depende de esa PC y Iridium no dejaba rastro. Encontrado y arreglado: el actualizador de las copias compartidas no podía bajar una versión desde CO-I8 (veía adentro de `app.asar` y se trababa al borrar), así que esa copia ya no se actualiza sola; probado de punta a punta contra GitHub. Además, una falla de la ventana ahora queda en el registro del día y muestra «Iridium no pudo mostrar esta pantalla» con Volver a cargar en vez de quedar en negro. Con Q-255 (A, D-171), CO-I10 el 2026-11-22: Iridium se instala como una app y se actualiza solo con electron-updater, bajando solo lo que cambió; probado de punta a punta en esta PC con instaladores de verdad. Falta: instalarlo en la otra PC y ver que abre (Q-256, reemplaza a Q-254).

## T-112 — dejar tareas en cola ya sea para un chat o en un "pendientes"
Estado: hecho · Frente: Frentes · Idea: usuario · Fecha: 2026-11-22 · Origen: D-175
Pensada en el chat con T-113 el 2026-11-22: son una sola cosa, una fila de trabajo que la IA puede hacer sola (esta idea) y un motor que la consume cuando hay cuota que se perdería (T-113). Ver T-113; es el frente Frentes (D-175).
Hecho el 2026-11-22: la fila de lo que la IA puede hacer sola son los pasos marcados `sola` en la ruta de cada frente, y se ve en el tablero Frentes (una tarjeta por frente con lo que sigue y el robot; al centro, el camino con el tamaño y «sola»), probado en Q-267. El motor que la consume es T-113.

## T-113 — hacer que elsistema que activa el uso de cuota se pueda configurar más activo, por ejemplo ir atacando uno a uno los pendientes de todos los proyectos siempre que haya cuota disponible y no se esté usando, esto sería especiamente util durante la mañana, claro podria amancer con un 0% de mi cuota de 5hs pero habría obtenido progreso que en caso de no usarlo y llegar el reset semanal sería cuota de uso perdida
Estado: hecho · Frente: Frentes · Idea: usuario · Fecha: 2026-11-22 · Origen: D-175
Pensada en el chat con T-112 el 2026-11-22 (sin construir nada):
- **Qué falta no es un estado más:** de 117 ítems, 35 son `nueva` sin evaluar y 24 `pendiente`, pero ninguno dice si la IA puede hacerlo sola. Esa es la dimensión que falta. Mezclar ideas con pedidos y errores no es el problema (el framework ya anota los errores como `T-n`); el problema es que no hay una señal de «listo para que la IA siga sola». T-78 («implementada») ya quedó cubierta por `hecho` (T-117).
- **No es un Kanban:** mover tarjetas a mano ya se descartó (D-137), y lo que se busca es lo contrario, que la IA tome cosas sin que muevas nada.
- **La fila:** una marca en lo que ya existe, no una lista nueva. Un `T-n` `pendiente` o un paso de la `## Ruta` de un frente pueden marcarse «la IA puede seguir sola» (lo marca la IA al planear y vos lo ves y lo sacás si no querés). Cada frente chico (temas T-75, el instalador, esto mismo) aporta su próximo paso marcado; así no hace falta abrir 10 frentes «en curso» a la vez: quedan listos y la fila los va tomando.
- **La regla para frenar ya existe:** la IA trabaja hasta que necesita algo tuyo; ahí deja la `Q-n`, cierra la iteración y el motor pasa a lo siguiente de la fila (así se trabaja hoy desde Iridium sin nadie mirando).
- **El motor (el Arranque, más activo):** además de abrir el período, mientras no estés usando Iridium y quede cuota en las 5 horas, toma de a uno lo siguiente de la fila de cualquier proyecto, un proyecto a la vez (dos sesiones en el mismo repo se pisan) y esperando a GitHub (D-172).
- **La cuota semanal manda:** solo vale gastar la que se perdería. Regla propuesta: trabaja sola si el uso de la semana va por debajo de lo que pasó de la semana (ej. martes a la noche, 30 % usado de un 40 % transcurrido), con un margen y un tope que elegís; así nunca te come lo que vas a necesitar el viernes. La mañana con el período en 0 % es una elección tuya: un «hasta las HH:MM» o un «dejar al menos N % del período».
- **El cuello pasa a ser tuyo:** si trabaja toda la noche en 5 cosas, a la mañana tenés 5 pruebas y decisiones. El aviso «Mientras no estabas» (AR-4) es el lugar para eso, y la fila tendría que no tomar más de un frente nuevo si ya dejó muchas `Q-n` esperando.
Segunda vuelta en el chat (2026-11-22); Q-261 quedó sin responder y la reemplaza Q-262:
- **Lo que dijo el usuario:** el Mapa no cumple «ver qué sigue» (sigue costando entenderlo); que pase a ser **Frentes**, un tablero con todos los frentes (también los no empezados), su selector, sus pendientes y si puede seguir sola; Pendientes queda igual, como atajo a todo. Los frentes chicos se van haciendo apenas surgen y los muy chicos van al núcleo (la consola integrada, T-116, no sería un frente aparte). El uso, sin piedad: drenar la cuota, con las condiciones configurables. Cada frente (o su próximo paso) se estima a ojo en chico, mediano o grande, para no empezar uno grande con 10 % del período.
- **Evaluado:** el tablero vuelve a lo que pedía T-71 (la opción A de D-137, «qué viene») sin perder el camino de hoy (D-138), que pasa a ser el detalle al tocar un frente. Cada fila: el nombre, el próximo paso en una línea, el tamaño, «sigue sola» o «te espera» (con la `Q-n`) y cuántos pendientes tiene. Grupos: en curso, listos para seguir solos, te esperan, por empezar; los archivados, aparte como hoy. El núcleo es una fila más, con sus `T-n` sin frente.
- **Tamaño y cuota:** el tamaño es del próximo paso (una iteración), no del frente entero, porque eso es lo que se corta. Grande solo con el período recién abierto (o casi entero); mediano con la mitad; chico rellena lo que queda. Al terminar, Iridium anota cuánto del período gastó cada uno y avisa si la estimación anda mal, así deja de ser a ojo con el tiempo. Los chicos del mismo proyecto van juntos en una sesión: el arranque de cada sesión cuesta.
- **Si volvés mientras trabaja:** termina la iteración que tiene en la mano (cortarla a medias es lo más caro) y no toma otra hasta que dejes de usar Iridium.
- **Condiciones que se eligen:** horario (ej. de 1 a 9), minutos sin usar Iridium, cuánto del período deja (0 % si se drena), tope de la semana (100 % si se drena) y qué tamaños acepta.
- **A tener en cuenta:** usar Claude Code sin ventana para trabajo propio está previsto por Anthropic, pero el uso continuo toda la noche es justo lo que motivó el límite semanal; con trabajo real y dentro de los límites, el riesgo es bajo.
Q-262 respondida en el chat (D-175): se abre el frente Frentes antes de Capacidades; primero el motor, con la fila interna, y después las maquetas del tablero (tarjetas a la izquierda, el mapa de tareas al centro, las preguntas aparte), con interruptores por proyecto y por frente. Sigue en `modulos/frentes/`.
Construida el 2026-11-22 (FS-I1 y FS-I2, D-179): el motor toma de a un paso marcado `sola` mientras Iridium no se usa y queda cuota, y el aviso al volver cuenta qué avanzó. Se cierra con la prueba de una noche (Q-264).
Hecho el 2026-11-23: la primera noche tomó solo «Medir la calidad del motor» y «Medir la calidad del tablero» de Frentes (10 % del período cada uno, 1 % de la semana), los terminó, contó lo que hizo al volver y no pasó el tope de la semana (Q-264). Avisar si los tamaños no coinciden con lo gastado queda en T-122.

## T-114 — Otro problema es que la app al abrirse debe esperar a que los repos estén sincronizados, el stop puede hacerse global o por proyecto dependiendo el tiempo de espera, creo que por proyecto debería ser lo ideal
Estado: hecho · Idea: usuario · Fecha: 2026-11-22 · Origen: Q-257
Evaluada el 2026-11-22: hoy (D-159) la primera vuelta empieza a los 20 s de abrir y va de a un proyecto (unos 1,6 s cada uno; medido: 7 con remoto, 11 s en total), y nada frena mandarle algo a la IA antes: en la otra PC la IA puede trabajar sobre archivos viejos y después las dos PC quedan separadas. Arranque (y T-113) tiene el mismo hueco. Con Q-257 (A, D-172): por proyecto; con Q-259 (D-173), antes de Capacidades.
Hecha el 2026-11-22: la primera vuelta empieza a los 2 s de abrir y el proyecto al que se entra o al que se le manda algo pasa primero en la fila. Mandarle algo a la IA (también desde Revisión), Arranque y Commit esperan a que ese proyecto se haya mirado desde que abrió Iridium, hasta 15 s; lo ya mirado no espera. En el chat lo escrito queda en el cuadro con «Poniéndose al día con GitHub…» (en Git, el botón lo dice) y sale solo; sin conexión, sin sesión, con commits distintos de cada lado o pasados los 15 s, sale igual y una línea dice por qué. Pruebas: `tests/d172-al-dia.test.ts` y `tests/e2e/d172-al-dia.spec.ts`. Probada por el usuario en Q-260 (2026-11-23): todo bien, también sin internet.

## T-115 — añadir la seleccion de modo de permisossi viene con claude cli o agent sdk, no crear una funcion personalizada
Estado: nueva · Idea: usuario · Fecha: 2026-11-22
Evaluada el 2026-11-26: el SDK ya tiene el modo de permisos (hoy Iridium lo fija en «sin confirmaciones»); elegir entre ese y el de solo planificar es chico, pero los modos que piden permiso necesitan mostrar los pedidos en la conversación: mediano. De Paridad, junto con T-120. No va directo: elegí qué modos querés tener.

## T-116 — que las consolas vengan dentro de iridium, podríamos colocar un algo que la haga aparecer como hero o como colapsable en algún lugar que no ocupe espacio, admitiría multiples consolas como vscode, podría también estar en la barra inferior o allí simplemente poner el indicador de que está running. De este modo nos ahorramos también que los scripts de iridium estén desplegando consolas en nuevas ventanas
Estado: hecho · Idea: usuario · Fecha: 2026-11-22
Evaluada el 2026-11-23: se puede, y es lo que hace VS Code. Hoy cada **Ejecutar** de Scripts abre una ventana de consola aparte que queda abierta (D-043), igual que el inicio de sesión de Claude; Armar ya corre sin ventana y muestra su registro (D-122). Adentro iría un panel abajo, plegado por defecto, con una pestaña por consola, **Detener** y **Limpiar**, y en la barra de abajo «▶ 2 corriendo» que lo abre. Dos maneras: una consola de verdad (se le puede escribir, con colores, como la de VS Code, con la misma pieza que usa VS Code, que es nativa y hay que probar que arme bien) o solo la salida (se lee lo que imprime pero no se le escribe; sin piezas nativas, la mitad de trabajo). Límites de las dos: una consola de adentro muere al cerrar Iridium (un `pnpm dev` lanzado desde ahí se cierra con él), y Armar y Volver tienen que seguir corriendo aparte porque cierran y reemplazan Iridium: en el panel se ve su avance leyendo su registro. Tamaño: mediano (solo la salida) o grande (la consola de verdad); es más que «muy chico», así que no va al núcleo sin más. Se decide en Q-272.
Con Q-272 (A, D-184): la consola de verdad, como VS Code. Primero se prueba que la pieza nativa arme (la app, el instalador y la actualización); va después de la ronda de UX 2 (T-123) y antes de Capacidades (T-28). Grande.
2026-11-23: la pieza nativa arma (S-6: suelta, instalada y actualizada encima); la propuesta con el dibujo, en `cambios/consolas.md`, se aprueba en Q-276.
2026-11-23: I-9 hecha y probada (Q-277); I-10 hecha (el alto, `Ctrl+ñ`, la confirmación al cerrar, el armado sin lo que no es de Windows), se prueba en Q-279. Con eso queda hecha.
Hecha el 2026-11-24: Q-279, todo bien (`cambios/consolas.md`, hecho).
Con Q-276 (A, D-185): Armar y Volver corren adentro como cualquier script. I-9 hecha el 2026-11-23 (el panel, Scripts e Iniciar sesión adentro, el instalador probado); se prueba en Q-277. Falta I-10 (el alto recordado, `Ctrl+ñ`, la confirmación al cerrar, sacar lo que no es de Windows).

## T-117 — Parece que las Ideas anotadas aqui no siempre se mueven correctamente entre sus estados de "aprobada" y "implementada"
Estado: hecho · Idea: usuario · Fecha: 2026-11-22
Revisada el 2026-11-22: Iridium muestra bien el estado que lee; el problema era la IA. Aprobar pasa la idea a `pendiente` (Aprobada), pero nada le pedía a la IA pasarla a `hecho` (Hecha) al terminarla, y dos ideas tuyas ya construidas seguían como Aprobadas: T-70 (el Arranque, terminado el 2026-11-21) y T-96 (el + y los comandos del chat, la primera parte de Paridad). Ninguna idea perdió su marca de idea ni cambió sola de estado.
Hecho el 2026-11-22 (D-174): las dos pasan a Hechas, el framework dice cuándo se cierra una idea (al marcar hecho el último paso de la ruta que la nombra y al cerrar el frente que nació de ella) y el control lo avisa al terminar cada turno si la IA se olvida. Pruebas: `tests/ma1-ruta.test.ts`.

## T-118 — skill de iridium incluye un MCP iridium? tendrpia algún sentido si todo es local?
Estado: nueva · Idea: usuario · Fecha: 2026-11-22
Evaluada el 2026-11-26: un MCP de Iridium tendría sentido aunque todo sea local: le daría a la IA herramientas para leer y escribir preguntas, trabajos y rutas con el formato ya validado, en vez de editar los archivos y esperar al control. Mediano, del framework (Plantillas). La recomendación es esperar: el control ya corrige casi todo. Necesita tu decisión.

## T-119 — actualmente creo que tenemos rastros de un "claude notifer" que suena cuando claude termina de trabajar, eso yo lo desinstalé, creo que quedo como vestigio de un complemento de vscode, deberíamos quitarlo ya que hay una idea para que Iridiuj tenga su propia implementación de ello con algo más de control para eviatar justamente esto de q queda como vestigio
Estado: hecho · Idea: usuario · Fecha: 2026-11-22
Hecho el 2026-11-23: la extensión de VS Code estaba desinstalada, pero dejó cinco hooks en la configuración de usuario de Claude Code (al terminar, al pedir permiso, al preguntar, al mandar un mensaje y al terminar un subagente) que seguían sonando en cada sesión, también en las de Iridium. Se sacaron, y sus archivos y lo que quedaba de la extensión se borraron del todo, sin respaldo, a pedido del usuario. El sonido propio de Iridium es T-52 (D-183).

## T-120 — comandos iridium, por ejemplo /consulta sería para hablar con la IA pero que no haga cambios de código, puede leer y todo pero no escribir (no estricto, por ejemplo sí pod´ria escribir en pendientes o en ideas etc)
Estado: nueva · Idea: usuario · Fecha: 2026-11-22
Evaluada el 2026-11-26: se puede con los comandos del plugin de Iridium (los muestra la lista de «/» de PA-I1) y el modo de solo planificar del SDK: /consulta lee todo y escribe solo en trabajo.md y estado.md. Chico a mediano, de Paridad, junto con T-115 y T-133. No va directo: elegí qué comandos van primero.

## T-121 — cambiar como se nueran las versiones de iridium, usar 1.0.x etc en lugar de codigos alfanumericos
Estado: hecho · Idea: usuario · Fecha: 2026-11-23 · Frente: Compartir · Origen: D-171
Hoy la versión es la fecha y la hora del armado (`2026.1123.1404`) y Acerca de le suma el código del commit (`ef5ed5c`). Evaluada el 2026-11-23: se puede, y conviene antes de que la otra PC instale (Q-256), porque el actualizador solo baja números más altos y 1.0 es más bajo que 2026. Va con T-38 (el número y la lista de cambios). Se decide en Q-269.
Hecho el 2026-11-23: con Q-269 (A, D-182), cada versión se numera 1.0.x: el último número sube solo con cada cambio, el del medio al cerrar un frente y el primero con tu ok. Acerca de muestra el número y cuándo se armó, sin el código. La lista de cambios sigue en T-38.

## T-122 — Avisar si los tamaños estimados no coinciden con lo gastado
Estado: pendiente · Frente: Frentes · Fecha: 2026-11-23 · Origen: D-175
El avance solo anota en `arranques.json` cuánto del período gastó cada paso (el uso de antes y de después). Con varias noches anotadas, avisar cuando un tamaño no se corresponde con lo gastado (un «mediano» que se come el período entero, un «grande» que gasta como uno chico), así la IA deja de estimar a ojo. La primera noche (Q-264): dos pasos medianos gastaron 10 % del período cada uno. Es la rama que quedó en la ruta de Frentes; espera más noches.

## T-123 — Ronda de UX al cerrar Frentes
Estado: hecho · Frente: Orden · Fecha: 2026-11-23 · Origen: D-096 (Frentes pasó a `hecho`)
Toda la interfaz con capturas (`tools/auditoria-ux.ts`) contra `04-ux.md` y los principios de `06-ui.md`, como dice `referencias/ronda-ux.md`. Desde la ronda 1 cambiaron sobre todo Frentes (el Mapa pasó a ser un tablero), Ajustes › IA › Avance solo, el + y los comandos del chat (Paridad), la Bandeja (R-104) y las pestañas que se arrastran (R-102): mirar que los nombres sean los mismos en todos lados («Frentes» y no «Mapa», «avance solo») y que el tablero y la Bandeja no repitan lo mismo de dos formas. Va antes de Capacidades. Se registra en `10-operacion.md` › Rondas de UX.
Hecha el 2026-11-23 (ronda 2): T-125 y T-126; `04-ux.md` puesto al día y dos arreglos chicos en el momento (`10-operacion.md` › Rondas de UX).

## T-124 — La notifiacion iridium sonó mientras claude estaba trabajando
Estado: hecho · Idea: usuario · Fecha: 2026-11-23
Hecho el 2026-11-23: no era la conversación. Sonó entre las 11:45 y las 11:47, mientras la IA corría las pruebas de los avisos (R-106): esas pruebas abren Iridium escondidas, con una IA de mentira que termina enseguida, y cada una tocaba la campana. Ahora las Iridium de las pruebas (y de las capturas) están mudas: el sonido se sigue probando, sin oírse. Probado en Q-274: no sonó mientras la IA corría las pruebas y sonó una sola vez al terminar.

## T-125 — En Frentes, la cuenta de preguntas en ámbar aunque no frene
Estado: hecho · Fecha: 2026-11-23 · Origen: T-123 (ronda de UX 2)
La tarjeta de un frente y su «Te espera» iban siempre en ámbar (D-180), aunque la pregunta no frenara (una tarea, una prueba): la grilla y las pestañas siguen «el amarillo es solo para lo que frena» (`04-ux.md` › Un número que manda) y Frentes decía otra cosa con el mismo número.
Hecho el 2026-11-23: en Frentes la cuenta va en gris y pasa a ámbar solo si alguna de esas preguntas frena, como en la grilla. Con su prueba (Playwright del tablero y del Mapa). Se mira en Q-275.

## T-126 — Un título corto para las ideas del usuario al evaluarlas
Estado: pendiente · Idea: IA · Fecha: 2026-11-23 · Origen: T-123 (ronda de UX 2)
Una idea que anotás queda con tu texto entero como título, y lo sigue teniendo al aprobarla: en Frentes, T-116 (las consolas adentro) ocupa cinco renglones en el Núcleo, y en Ideas varias se cortan a la mitad. Propuesta: al evaluarla, la IA le pone un título corto («Las consolas adentro de Iridium») y tu texto queda tal cual debajo, como «Tu idea: …», así no se pierde nada de lo que escribiste. Es un cambio del framework (cómo se escribe una idea evaluada) con su control; Iridium no cambia. Si no, se deja como está.

## T-127 — Una segunda Iridium abierta trabó la actualización
Estado: hecho · Fecha: 2026-11-23 · Origen: el usuario en el chat («parece que ya no se actualiza»)
Desde las 15:41 había dos Iridium de uso diario abiertas: la segunda, sin conversaciones, quedó de un cambio de versión en el que el ayudante corrió dos veces y abrió Iridium dos veces (`release/actualizacion.log`). Con ella abierta, cada Actualizar terminaba en «Iridium sigue abierto» y volvía la versión vieja. Se cerró a mano el 2026-11-23. Falta: que el ayudante no abra Iridium si ya hay una abierta, averiguar por qué la segunda no se cerró sola (debería: una sola ventana) y que Actualizar diga por qué no entró en vez de volver callado.
Hecho el 2026-11-23: la causa fue que, al cerrar, corrieron dos ayudantes de cambio de versión a la vez; uno puso la versión y abrió Iridium, el otro no pudo mover la carpeta y abrió otra, y dos Iridium arrancando juntas se saltean la ventana única. Ahora el ayudante corre de a uno (el segundo espera su turno y no toca nada), nunca abre Iridium si ya hay una abierta, y si no entra por una Iridium abierta el aviso de Actualizar lo dice («¿otra ventana de Iridium?»). Probado con dos ayudantes juntos y con una Iridium abierta.

## T-128 — Ver el progreso al actualizar o instalar
Estado: hecho · Idea: usuario · Fecha: 2026-11-23 · Origen: el usuario en el chat, D-186
«¿Y si incluimos un instalador con interfaz? Aunque sea para ver el progreso, nada más.» Hoy la actualización corre escondida: Iridium se cierra y vuelve a abrir sin mostrar nada en el medio (en la app de uso diario y en las copias instaladas). Decidido en Q-278 (A, D-186): una ventanita «Actualizando Iridium…» con su barra, acá y en la otra PC.
Propuesta del 2026-11-24 (maqueta Diseño › Actualizando Iridium; se aprueba en Q-280). Hoy no se ve nada: en la app de uso diario el ayudante (`tools/cambiar-version.ps1`) corre escondido, y en las copias instaladas el instalador también (electron-updater lo corre callado). La ventanita es la misma en las dos: Iridium la lanza justo antes de cerrarse, va en el centro de la pantalla con el negro de Iridium y su ícono en la barra de tareas, y muestra tres pasos (Cerrando la versión de antes · Poniendo la versión nueva · Abriendo Iridium); se cierra sola cuando aparece la ventana de Iridium nueva, que le avisa. Si la versión no entra, lo dice unos segundos y abre la de antes. No se usa la ventana propia del instalador: es gris de Windows y no se parece a Iridium. Un límite: ni Windows ni el instalador dicen cuánto falta, así que la barra avanza por pasos (avanza sola dentro de cada uno y salta al terminarlo), no con un porcentaje real. Que se pueda se probó en S-7 (`spikes/S-7-ventana-actualizando/`): lanzada escondida como hoy el ayudante, se ve entera y sin minimizar. Tamaño: mediano.
Construida el 2026-11-24 (Q-280 A, D-187): la ventanita sale al actualizar y también al cerrar con la X (termina en «Lista: se abre la próxima vez»), en la app de uso diario y en las copias instaladas; si la versión no entra, lo dice. Probada con la ventanita de verdad y con instaladores de verdad; falta verla con tus ojos (Q-281).
Hecha el 2026-11-24: Q-281, todo bien (la ventanita con sus tres pasos al actualizar, «Lista: se abre la próxima vez» al cerrar con la X, y la versión nueva al abrir).

## T-129 — Las pruebas de git se pasan de 5 s con la suite completa
Estado: hecho · Idea: IA · Fecha: 2026-11-24 · Origen: T-128
Con toda la suite de Vitest corriendo, tres pruebas de repositorios de verdad (`git.test.ts` y `d159-sincronia.test.ts`) se pasan de los 5 s y fallan; solas, o con menos archivos a la vez, pasan. Pasó también sin los cambios de T-128. Darles más tiempo o correrlas sin tanto en paralelo.
Hecha el 2026-11-24: las pruebas con repositorios de verdad de esos dos archivos tienen 20 s; la suite entera pasó (1042).

## T-130 — Se retomó una sesión interrumpida porque se acabó la cuota, al retomarla manualmente esta hizo sonar el sonido de notifiacion de cuando termina de trabajar, pero estaba trabajando, además la tab de iridium no mostraba el texto de "trabajando"
Estado: hecho · Idea: usuario · Fecha: 2026-11-24
Hecho el 2026-11-25: ya resuelto, como confirmaste al revisar las ideas. Va con D-194: una sesión que se queda sin uso ya no se da por terminada ni fallada, se retoma cuando se libera el período, y Iridium espera a leer el registro de conversaciones antes de decidir cómo terminó.

## T-131 — Pruebas que se pasan de tiempo con la suite entera
Estado: pendiente · Frente: Núcleo · Idea: IA · Fecha: 2026-11-24
Con `pnpm test` entero y la PC ocupada, a veces fallan por tiempo `d081-github.test.ts` (publicar), `gestor/calidad-casos-limite.test.ts` (300 proyectos), `t128-ventana-actualizando.test.ts` (Reiniciar ahora) y, una vez el 2026-11-25, `ar1-arranque.test.ts` (el arranque después del vencimiento: no arrancó a tiempo); solas pasan. Como T-129: darles el tiempo que necesitan o medir sin competir con el resto. Tamaño: chico.

## T-132 — Las actualizaciones: el botón que seguía, «Actualizando…» antes de tiempo y la otra PC
Estado: hecho · Frente: Núcleo · Idea: usuario · Fecha: 2026-11-24 · Origen: el usuario en el chat
«Ahora supuestamente está actualizado pero aún aparece el botón de actualizar», «suele aparecer "actualizando" pero en realidad estaba esperando que yo deje de trabajar», «revisar si las actualizaciones llegarán bien a la otra computadora» y «que siempre se suba a GitHub lo último, tal como lo que yo uso».
Hecho el 2026-11-24:
- **El botón que seguía:** la versión armada a las 21:15 no entró dos veces («Windows no soltó la carpeta de la app») y quedó lista con el mismo commit que la que estaba en uso. Dos causas: con un solo proceso de Iridium terminando de cerrarse, el ayudante lo contaba como ninguno (una rareza de PowerShell) y movía la carpeta sin esperarlo; y la app armada arrancaba parada en su propia carpeta, así que un VS Code o una consola que abriera y siguiera abierta también la trababa. Ahora el ayudante espera de verdad y la app arranca parada en la carpeta del usuario. Si igual no entra, al lado del botón dice «la última vez no entró».
- **«Actualizando…»:** mientras Iridium prepara solo la versión nueva, la barra muestra **Actualizar** (tocarlo la pone apenas esté); «Actualizando…» sale solo al tocarlo o al reiniciarse.
- **El navegador (PA-I5) y las actualizaciones:** el puente de la extensión de Claude corre desde la carpeta de la app y sigue vivo con Brave abierto: habría trabado cada actualización acá («Iridium sigue abierto») y el instalador en la otra PC. Se cierra antes de poner la versión nueva (Brave lo vuelve a abrir cuando lo necesita).
- **La otra PC:** revisado el camino entero (el repo es público, `latest.yml` y los `.blockmap` responden, los números crecen); lo que faltaba es que se publicara: la publicada era la 1.0.14 y la tuya, la 1.0.24. Con D-191, la versión en uso se publica sola.
Pruebas nuevas en `t132-actualizaciones.test.ts` (las dos del ayudante fallan con el de antes) y la barra en `co6-sin-armar.spec.ts`. Se prueba en Q-289.
2026-11-24, probada en Q-289. Con Q-290 (D-192): en GitHub quedan las últimas 10 versiones y cada versión nueva dice qué trae en el aviso de la esquina. Y la publicación sola no había corrido nunca: los archivos de `docs/` sin commitear (tus respuestas) hacían que la versión se viera «con cambios sin commitear»; ya no cuentan. Se ve en Q-291.

## T-133 — unn nuevo tipo de sesiones, quizás una skill o un comando, un tipo de sesion de trabajodonde el foco no es avanzar, sino resolver dudas y consultas para que luego la IA pueda trabajar sola por más tiempo, estas sesiones pueden ser un poco más largas supongo, incluso hasta gastar toda la cuota de 5hs, con eso listo, las siguientes 5hs o 10hs claude podrá trabajar solo, como un programador real que le rinde cuentas al cliente
Estado: nueva · Idea: usuario · Fecha: 2026-11-24
Evaluada el 2026-11-26: un comando o modo de sesión que recorre los frentes y lo que viene, junta todas las dudas en una conversación y deja los pasos con tamaño y «sola» para que el avance solo siga horas. Mediano, de Frentes, junto con T-120 (/consulta). No va directo: hay que definir con vos cómo termina la sesión y qué deja escrito.

## T-134 — un modo de "apagar al finalizar". En configuraciones podríamos determinar una opcion que habilite el display o no de un botón en un chat, al tocar ese botón se configura que la computadora se apagará al terminar la tarea, esto sería independiente de la IA y podría reutilizar el mismo sistema de deteccion de tarea finalizada que usamos para las actualizaciones automáticas, de este modo podemos dejar a claude trabajando e irnos de la casa. Esto trae una ventaja, yo antes le pedía textualmente a claude que apague la pc al acabar cuando debía irme, pero si quería hacer que la apague y estaba a mitad de trabajo ya no tenía forma de hacerlo(ahora recuero que podemos añadir la funcionalidad de "en cola" para los mensajes, promts que van luego de que termine de hacer lo que est´ahora, es parte de paridad creo) e interrumpirla o pasarle otro prompt en cola pues cagaría contexto innecesario, esta funcionalidad evita todo eso, no gasta uso en lo más minimo tampoco
Estado: hecho · Idea: usuario · Fecha: 2026-11-24 · Origen: D-195
Construido el 2026-11-25 (D-195): el botón al lado de Enviar, la cuenta de un minuto con No apagar y el apagado sin pasar por la IA. Los mensajes «en cola», aparte en T-138.
Hecho el 2026-11-25: probado apagando de verdad (Q-296). Con lo que dijiste ahí, armado con la IA quieta ya no apaga al minuto: espera a que una IA trabaje y termine, así lo armás antes de escribir el pedido (se mira en Q-297).

## T-135 — que iridium le avice a claude cuando haya ideas nuevas ¿? si es que no lo hace ahora
Estado: hecho · Frente: Frentes · Idea: usuario · Fecha: 2026-11-25 · Origen: Q-293
Hecho el 2026-11-25: la revisión del avance solo le pasa a la IA las ideas nuevas y les deja «Evaluada el …» (FS-I4, probada una noche en Q-294).
Revisado el 2026-11-25: hoy no le avisa. Una idea que anotás queda en `trabajo.md` como `nueva` y la IA solo se entera si abre ese archivo o si una sesión anterior la sumó a mano a «Ideas sin evaluar» de `estado.md`; ni la conversación nueva, ni el Arranque, ni el avance solo nombran las ideas nuevas. Va junto con T-136 (Q-293): la revisión le pasa las ideas nuevas.

## T-136 — que así como claude ahora puede atacar algunos frentes cuando iridium está idle, pueda también revisar ideas, auditarlas, ver cuales pueden pasar directo a implemntación, anotarlo para no revisar las mismas una y otra vez, etc, lo mismo con los frentes, hay varios frentes que están algo estancados pero que la IA podría estarlos avanzando sola pero parece que no son candidatos pq no empiezan
Estado: hecho · Frente: Frentes · Idea: usuario · Fecha: 2026-11-25 · Origen: Q-293
Hecho el 2026-11-25: el avance solo revisa las ideas y los frentes una vez por día, les pone tamaño y `sola`, y después tomó pasos de esos frentes y del Núcleo (FS-I4, probada en Q-294).
Revisado el 2026-11-25. Por qué los frentes parados no son candidatos:
- El avance solo toma únicamente pasos marcados con su tamaño y `sola`, y de los 8 pasos que esperan en las rutas (Abrir, Apariencia, Compartir, Diseño, Orden con dos, Skills) **ninguno está marcado**. La regla de D-175 es marcarlos «al pasar», sin reescribir una ruta solo para eso: un frente que nadie toca nunca se marca y nunca se toma.
- Los 24 `T-n` pendientes del Núcleo (por ejemplo T-131, que ya dice «Tamaño: chico») no están en ninguna ruta, así que el motor no los ve.
- Lo mediano y lo grande solo se toma del frente en curso, y hoy no hay ninguno en curso (Orden, el Próximo paso, figura en pausa).
- Las ideas `nueva` no entran a la fila: nadie las evalúa sin vos (T-135).
La propuesta y sus opciones, en Q-293. Se relaciona con T-133 (sesiones para resolver dudas antes de que la IA trabaje sola).
Construido el 2026-11-25 (Q-293 A, D-193; FS-I4): con el avance solo prendido, una vez por día y proyecto, si hay ideas sin evaluar, pasos sin tamaño o trabajos del Núcleo sin tamaño, la IA los revisa sin hacer el trabajo: deja cada idea con «Evaluada el …» (qué haría falta, tamaño, si puede ir directo; aprobarla sigue siendo tuyo), marca los pasos y los trabajos del Núcleo que puede hacer sola y suma pasos a los frentes vacíos. Los trabajos del Núcleo con «Tamaño: chico, sola» ya entran al avance solo, lo mediano y lo grande sale de cualquier frente, y un frente en pausa es solo el que pausaste vos (Orden, Abrir y Diseño salieron de pausa). Se prueba en Q-294.

## T-137 — Iridium no arrancaba
Estado: hecho · Frente: Núcleo · Idea: IA · Fecha: 2026-11-24
Dos armados corrieron juntos en `release/nueva` y quedó puesta una app sin los archivos de Electron (Iridium.exe se cerraba al abrir). Ahora `actualizar.ps1` arma de a uno por carpeta y `cambiar-version.ps1` no pone una versión incompleta (sigue la de antes). En los commits del 2026-11-24 figura como T-133, número que ya tenía una idea tuya. El 2026-11-25, la suite entera mostró 10 pruebas de las actualizaciones en rojo por ese cambio (sus versiones de muestra no tenían los archivos de Electron): ahora los tienen, y una prueba nueva mira que una versión incompleta no se pone.

## T-138 — Mensajes en cola: lo que escribís mientras la IA trabaja sale cuando termina
Estado: nueva · Idea: IA · Fecha: 2026-11-25 · Origen: T-134
Evaluada el 2026-11-26: lo escrito con la IA trabajando queda en el cuadro como «en cola» y sale solo al terminar el turno, con forma de sacarlo o editarlo antes. Mediano, de Paridad. Puede ir directo a hacerse una vez aprobada.
Lo mencionaste en T-134: escribir el próximo pedido con la IA a mitad de un trabajo y que Iridium lo mande solo al terminar el turno, sin interrumpirla. Sería parte de Paridad (Claude Code lo tiene).

## T-139 — Pasar al framework también queda citado en la conversación
Estado: pendiente · Idea: IA · Fecha: 2026-11-25 · Origen: D-196 · Tamaño: chico, sola
Desde el menú de la tarjeta, Skills › Framework y Archivos, Pasar al framework todavía manda el pedido solo, en una conversación nueva. Con D-196 tendría que abrir el proyecto y dejar el pedido citado en su conversación, con «conviene una conversación nueva» dicho al lado.

## T-140 — Los mensajes intermedios de la IA, con otra letra que la respuesta final
Estado: nueva · Idea: usuario · Fecha: 2026-11-25 · Origen: R-110 · Tamaño: chico
Hoy lo que la IA dice mientras trabaja («Ahora edito…») se ve igual que su respuesta final. Como en Claude Code o Codex, los intermedios irían más chicos o apagados, como si fuera respondiendo a medida que avanza; la respuesta final queda como está. Se prueba primero en una maqueta de la conversación.

## T-141 — Decir en vivo qué hace la IA («Buscando», «Leyendo», «Editando código»)
Estado: nueva · Idea: usuario · Fecha: 2026-11-25 · Origen: R-110 · Tamaño: mediano
Primero Iridium anota, en todas las sesiones, qué herramientas y qué comandos usa la IA (`cd`, `grep`, escribir un archivo…). En unos días se revisa lo más usado y a cada cosa se le pone un texto según su uso más probable; mientras trabaja, el paso dice «Buscando» o «Editando código» en vez de «Usó N herramientas», y al terminar queda como hoy.

## T-142 — El control avisa de una línea **Ejecutar:** que no se lee como script
Estado: nueva · Idea: IA · Fecha: 2026-11-25 · Origen: MI PC › Q-1 · Tamaño: chico, sola
En MI PC, `docs/scripts.md` tenía `**Ejecutar:** \`powershell … compactar-wsl.ps1\` (en una terminal de administrador)`: el texto después del comando hace que el lector no lo tome como script (pide que la línea termine en la comilla), y Scripts dijo «no tiene scripts con una línea Ejecutar:» sin que el control avisara. Fallé yo al escribirla (la explicación iba en la descripción), pero el framework no lo dice y el control solo revisa los scripts que ya se leyeron. Qué haría falta: que el control marque una línea que empieza con **Ejecutar:**/**Abrir:** y no se lee («lo que sigue al comando va en la descripción»), y una frase en `SKILL.md` › Los scripts: la línea de acción lleva solo el comando, nada después. Aparte: un script que necesita administrador no tiene forma de pedirlo desde el botón; en MI PC lo resolví con un script que se vuelve a abrir pidiendo permiso.

## T-143 — Un catálogo de estilos y de movimiento para los design systems
Estado: nueva · Idea: usuario · Fecha: 2026-11-25 · Origen: Q-299
Una colección que crece con el tiempo y que cualquier proyecto puede usar: estilos visuales (vidrio esmerilado y sus variantes, entre otros) y un lenguaje de movimiento de interfaces futuristas (FUI): pulso, brillo, parpadeo, barrido de radar, luz que cruza, anillos que giran, líneas de pantalla, «glitch», datos que corren, entradas y salidas, como tokens y piezas reutilizables, no atados a un componente. Pulido (D-197) es el primer uso: sus tokens de acento, brillo y duraciones serían la base. Iría en el framework (`referencias/06-ui.md` y sus plantillas), para que la IA lo use en los otros proyectos.

## T-144 — La prueba de las tarjetas falla a veces al borrar sus datos
Estado: pendiente · Fecha: 2026-11-26 · Origen: T-86 · Tamaño: chico, sola
Con la suite entera de Playwright, `r7-r8-proyectos.spec.ts` › el clic derecho en una tarjeta (R-7) falló una vez: al leer la ficha, el borrado de la carpeta de datos temporal chocó con un archivo que Electron todavía tenía abierto (EBUSY). Sola, pasa. Que la prueba espere a poder borrarla, como la del ayudante de CO-I2.
