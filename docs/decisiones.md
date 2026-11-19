# Registro de decisiones

> Cada decisión relevante, con su contexto y su porqué. Las decisiones no se borran: si una cambia, se agrega una nueva que la reemplaza y se marca la anterior como "reemplazada por D-XXX".

> **Ámbito:** "general" si afecta al proyecto completo, o el nombre del módulo. Una decisión de un módulo que cambia algo del núcleo (design system, arquitectura, perfil) es de ámbito general.

## Índice
| ID | Fecha | Ámbito | Hito/paso | Decisión | Estado |
|---|---|---|---|---|---|
| D-001 | 2026-10-21 | general | 0 | Consolidar en este proyecto las ideas de desarrollo con IA | vigente |
| D-002 | 2026-10-21 | general | 0 | "Centro de Desarrollo" queda como nombre provisorio | reemplazada por D-033 |
| D-003 | 2026-10-21 | general | 0 | El puente PC–celular es un módulo de este proyecto, para que lo usen otros | reemplazada por D-005 |
| D-004 | 2026-10-21 | general | 0 | Plan de desarrollo propio: exploración y definición más a fondo | vigente |
| D-005 | 2026-10-21 | general | 1 | El puente PC–celular es LocalSend más un envío automático desde la PC | vigente |
| D-006 | 2026-10-21 | general | 1 | El Centro es una app propia para dirigir, con Claude Code (Agent SDK) como motor | vigente (ajustada por D-015) |
| D-007 | 2026-10-21 | general | 1 | El Agent SDK se usa directo, pero aislado en un solo lugar de la app | vigente |
| D-008 | 2026-10-21 | general | 1 | El plan se ve como un gráfico de fases y pasos leído de `docs/`; sin kanban ni canvas por ahora | vigente |
| D-009 | 2026-10-21 | general | 1 | La guía de hitos suma las mejoras 1 a 6 tomadas de otros métodos | vigente |
| D-010 | 2026-10-21 | general | 1 | Bandeja propia de pendientes; las `Q-n` suman tipo y si frenan; pruebas y tareas como listas | vigente (ajustada por D-022) |
| D-011 | 2026-10-21 | general | 1 | Diseño: lienzo y biblioteca propios sobre `DESIGN.md`, armados con lo que ya existe | vigente |
| D-012 | 2026-10-21 | general | 1 | Revisión de la app: extensión del navegador, comentarios en archivos planos | vigente |
| D-013 | 2026-10-22 | general | 1 | El gestor anterior queda solo con mantenimiento hasta que el Centro lo cubra | vigente |
| D-014 | 2026-10-22 | general | 1 | Skills locales donde la licencia lo permite; las de Anthropic que no se pueden copiar, desde la cuenta | vigente |
| D-015 | 2026-10-22 | general | 2 | Una sesión de IA por proyecto; varios proyectos trabajando a la vez | vigente (ajustada por D-021) |
| D-016 | 2026-10-22 | general | 2 | El MVP es dirigir proyectos conversando con la IA: cinco funcionalidades, once casos | vigente |
| D-017 | 2026-10-22 | general | 2 | El Centro y el Gestor conviven hasta que el Centro lo cubra | vigente |
| D-018 | 2026-10-22 | general | 2 | El Centro también edita las skills y la guía de hitos | vigente |
| D-019 | 2026-10-22 | general | 3 | Formato de `docs/` para el Centro: portón como lista, estados con palabras fijas, `Tipo:` en las `Q-n` y pruebas con casillas | vigente |
| D-020 | 2026-10-22 | general | 4 | Marco de la app: barra lateral de íconos, barra de sesiones arriba, conversación al centro y «Seguí» para arrancar | vigente (ajustada por D-022) |
| D-021 | 2026-10-23 | general | 4 | La IA trabaja sin pedir permisos ni quedarse esperando: lo que necesita del usuario lo deja como `Q-n` y cierra | vigente |
| D-022 | 2026-10-23 | general | 4 | Pendientes por proyecto con el contexto completo, avisos dentro de la app y Proyectos en una sola grilla | vigente (ajustada por D-034) |
| D-023 | 2026-10-23 | general | 4 | El uso de la suscripción y el contexto de cada sesión, siempre a la vista | vigente |
| D-024 | 2026-10-23 | general | 4 | El botón «Detener» la IA entra al MVP | vigente |
| D-025 | 2026-10-23 | general | 5 | La frontera con el motor: una interfaz propia, sesiones en *bypass* con la instrucción del Centro, y Detener que no cuenta como error | vigente |
| D-026 | 2026-10-23 | general | 5 | El código del Gestor se copia al Centro, no se comparte como paquete | vigente |
| D-027 | 2026-10-23 | general | 5 | Una conversación usada hace poco fuera del Centro se avisa antes de retomarla | vigente |
| D-028 | 2026-10-23 | general | 5 | El Centro se construye con Electron, TypeScript y React | vigente |
| D-029 | 2026-10-23 | general | 6 | Dirección visual: cálida y tranquila, solo tema oscuro, design system propio con `impeccable` | vigente |
| D-030 | 2026-10-23 | general | 6 | Mundo visual «Manual con pestañas»: el color es del hito y el estado se marca con la forma de la línea | reemplazada por D-031 |
| D-031 | 2026-10-23 | general | 6 | La forma de VS Code con grises cálidos; la conversación sola y el mapa en un panel desplegable | vigente (colores reemplazados por D-032) |
| D-032 | 2026-10-23 | general | 6 | Estilo «F4 Tarjetas»: casi negro con verde de fósforo, Chakra Petch y tarjetas suaves | vigente |
| D-033 | 2026-10-23 | general | 6 | La app se llama «Iridium» | vigente |
| D-034 | 2026-10-23 | general | 6 | En Proyectos, el estado de cada tarjeta va con ícono y palabra, sin color propio | vigente |
| D-035 | 2026-10-23 | general | 6 | El Mapa muestra el estado del proyecto y Docs es un lector liviano | vigente |
| D-036 | 2026-10-23 | general | 7 (I-1) | La app de uso diario es una carpeta con el ejecutable y un acceso directo, sin instalador | vigente |
| D-037 | 2026-10-24 | general | 7 (I-2) | Cada sesión de la IA se cierra al terminar su turno y se reabre con la misma conversación | vigente |
| D-038 | 2026-10-24 | general | 7 (I-2) | Sin rechazo automático de permisos: en *bypass* el SDK no los consulta | vigente |
| D-039 | 2026-10-25 | general | 7 (I-3) | Lo guardado «a medias» queda en los datos de Iridium, fuera del proyecto | vigente |
| D-040 | 2026-10-28 | general | 7 (I-3) | Nueva abre una conversación en blanco; no arranca Seguí sola | vigente |
| D-041 | 2026-10-28 | general | 7 (entre I-3 e I-4) | Tres paneles: secciones del proyecto, vista principal y conversación; barra de título propia | vigente |
| D-042 | 2026-10-28 | general | 7 (I-4) | Archivos colorea el código con un lector propio y un color nuevo del design system para las cadenas | vigente |
| D-043 | 2026-10-28 | general | 7 (I-4) | Un proyecto abre en sus pendientes y scripts; los scripts son botones (C-11 entra al MVP); las pestañas de los proyectos abiertos quedan | vigente |
| D-044 | 2026-10-28 | general | 7 (I-4) | Los scripts van en lista después de los pendientes y vuelven a tener su sección; los detalles de una pregunta, plegados | vigente (los scripts de la entrada, reemplazados por D-125) |
| D-045 | 2026-10-28 | general | 7 | La conversación muestra el contexto y elige el modelo y el esfuerzo; el uso queda en la barra de estado | vigente |
| D-046 | 2026-10-28 | general | 7 | La Revisión de la app entra al MVP, antes de I-5 e I-6, como módulo | vigente |
| D-047 | 2026-10-28 | Revisión | 7 (módulo, pasos 2 y 3) | La Revisión sirve en web y en Electron desde el principio, con la misma extensión | vigente |
| D-048 | 2026-10-28 | Revisión | 7 (módulo, paso 5) | Los comentarios viven en `docs/revision/`; la IA se entera por la instrucción y la guía | vigente |
| D-049 | 2026-10-29 | Revisión | 7 (módulo, paso 6) | El modo comentar se prende con F8, sin barra sobre la app | vigente |
| D-050 | 2026-10-29 | Revisión | 7 (R-I1) | La extensión pide permiso sobre todos los sitios, solo para la captura | vigente |
| D-051 | 2026-10-29 | Revisión | 7 (entre R-I1 y R-I2) | La Revisión es la norma en las apps Electron; el ayudante se adelanta | vigente |
| D-052 | 2026-10-29 | Revisión | 7 (después de R-I3) | La Revisión también en las versiones armadas de Iridium y otra app | vigente (punto 5, cerrado por D-053) |
| D-053 | 2026-10-29 | general | 7 (Q-70, Q-71) | otra app instalada sin Revisión; una pregunta acepta una sola opción y pasos numerados | vigente |
| D-054 | 2026-10-29 | general | 7 (Q-72) | Iridium se prepara para compartir en una iteración corta después de I-6 | vigente |
| D-055 | 2026-10-29 | general | 7 | La guía `hitos-desarrollo-app` pasa al formato 2026-10-29 con las mejoras pendientes | vigente |
| D-056 | 2026-10-29 | general | 7 (Q-74) | «Aprobada provisional»: se sigue como si funcionara y la prueba a mano queda anotada | vigente |
| D-057 | 2026-10-29 | general | 7 (Q-73) | El código de Iridium va público en GitHub, con `docs/` hablando solo de Iridium | vigente |
| D-058 | 2026-10-29 | general | 7 (Q-75) | Git como el control de código de VS Code, y si el repositorio está en GitHub | vigente |
| D-059 | 2026-10-29 | general | 7 (I-6) | El contexto de una conversación guardada se lee de su historial; el uso, el modelo, los avisos y el cierre, como se construyeron | vigente |
| D-060 | 2026-10-30 | general | 7 (Q-77, R-3) | Lo escrito no se pierde, se vuelve al último proyecto, el contexto como círculo y un chat en la vista de Proyectos | vigente |
| D-061 | 2026-10-30 | general | 7 | El chat se lee de un vistazo: lo tuyo en burbuja, el proceso de la IA aparte de su respuesta | vigente |
| D-062 | 2026-10-30 | general | 7 | Ajustes del uso diario: Responder dentro del proyecto, el nombre de la ficha, las pruebas sin quitar el foco y el Gestor descontinuado | vigente |
| D-063 | 2026-10-30 | general | 7; al procesar Q-79, Q-80 y Q-81 | Frentes en paralelo después del núcleo, y Postergar una prueba con un botón | vigente |
| D-064 | 2026-10-30 | Skills | módulo Skills, paso 2; al procesar Q-83 | Skills: ver, editar con la IA y poner al día proyectos; elegir por proyecto, después | vigente |
| D-065 | 2026-10-30 | Apariencia y ajustes | módulo Apariencia, paso 2; al procesar Q-84 | Ajustes como ventana flotante con nombre, IA, tono y tema | vigente |
| D-066 | 2026-10-30 | general | módulo Apariencia, paso 6; al procesar Q-85 y Q-86 | Dos temas oscuros: Iridium (el de siempre) y Carbón | reemplazada por D-104 (con DI-I1) |
| D-067 | 2026-10-31 | Apariencia y ajustes | módulo Apariencia, paso 7 (AP-I1) | Cómo se construyó AP-I1: los ajustes viajan con las preferencias y «Normal» es el estilo de Claude Code | vigente |
| D-068 | 2026-10-31 | Skills | módulo Skills, pasos 4 y 5; al procesar Q-89 | Skills: el chat de `Skills` al lado, y los atrasados por la fecha de formato que ya anota cada proyecto | vigente |
| D-069 | 2026-10-31 | general | módulo Compartir, paso 1; al procesar Q-90 | Compartir, por ahora solo para el usuario: GitHub privado, actualización al cerrar e iniciar sesión desde Iridium | vigente |
| D-070 | 2026-10-31 | general | módulo Compartir, paso 3; al procesar Q-91 y Q-92 | Las versiones se arman en la PC y GitHub guarda el código: `dev` para trabajar, `main` para lo que está en uso | vigente |
| D-071 | 2026-11-01 | Compartir | módulo Compartir, paso 7; al procesar Q-99 | Iridium ofrece armar la versión nueva cuando hay commits sin armar; no arma solo | vigente |
| D-072 | 2026-11-01 | general | 7, entre iteraciones; a pedido del usuario | Las pruebas abren Iridium fuera de la pantalla | vigente |
| D-073 | 2026-11-01 | Revisión | 8, entre tandas; pedido de otra app (D-086 y Q-70 A), hecho desde el proyecto de otra app a pedido del usuario | El ayudante de la Revisión entra también en una interfaz propia, sin captura ni texto si la app lo pide | vigente |
| D-074 | 2026-11-01 | general | 8, entre tandas; pedido del usuario | Una copia de prueba a mano para un conocido, sin esperar a Compartir | vigente |
| D-075 | 2026-11-01 | general | 8, tanda 6 (Defecto 20, Q-107 A) | Los radios y las sombras sueltos pasan a los tokens del design system | vigente |
| D-076 | 2026-11-02 | general | 8, tanda 6 (Defecto 6, Q-107 A) | Los fusibles de Electron: sin correr como Node ni `NODE_OPTIONS`; `--inspect` queda para las pruebas | vigente |
| D-077 | 2026-11-02 | general | 9 (Q-109) | Iridium sigue sin número de versión por ahora: fecha y commit | vigente |
| D-078 | 2026-11-02 | general | 9 (Q-110) | Volver atrás es armar la versión anterior, con `pnpm volver` | vigente |
| D-079 | 2026-11-02 | general | 10 (Q-112) | Los frentes que siguen: Inicio, después Diseño y Capacidades | vigente |
| D-080 | 2026-11-04 | general | 10 (Q-116) | La carpeta para compartir explica Iridium por dentro e instala el comprobador de preguntas | vigente |
| D-081 | 2026-11-04 | general | 10 (Q-117) | La sección Git crea el repositorio y lo publica en GitHub, con la sesión de GitHub de git | vigente |
| D-082 | 2026-11-04 | general | 10 (Q-119) | El repo de Iridium no nombra los otros proyectos del usuario | vigente |
| D-083 | 2026-11-04 | general | 10 (Q-120) | Ideas y Skills viven en una carpeta «Iridium» aparte de los proyectos | reemplazada en parte por D-087 (dónde) |
| D-084 | 2026-11-04 | general | 10 (Q-121) | Al terminar la limpieza, el repo empieza de nuevo con un solo commit | vigente |
| D-085 | 2026-11-04 | general (Compartir) | 10, a pedido del usuario | Las copias compartidas se actualizan solas desde las versiones publicadas en GitHub | vigente |
| D-087 | 2026-11-04 | general | 10 (Q-125) | Ideas y Skills viven en `.iridium`, dentro de la carpeta de proyectos, como un vault | vigente |
| D-086 | 2026-11-04 | general | 10 (Q-124) | Una skill «iridium» viaja con Iridium y se carga solo en sus conversaciones, con la guía de hitos si falta | vigente |
| D-088 | 2026-11-05 | Revisión | 10 (R-9) | Un comentario de la Revisión se cierra solo cuando está hecho; lo que queda para después es «anotado» | vigente |
| D-089 | 2026-11-05 | general | 10 (R-7, R-8), a pedido del usuario | El menú del clic derecho en la tarjeta, Nuevo proyecto, y las ideas y las skills de cada proyecto | vigente (el punto 3, reemplazado por D-101) |
| D-090 | 2026-11-05 | general | 10 (R-10) | Eliminar un proyecto desde el menú de la tarjeta, con confirmación y a la papelera | vigente |
| D-091 | 2026-11-05 | general | 10, a pedido del usuario (y Q-131) | Un frente «Orden» con prioridad máxima: auditoría, un solo modelo y la UX rehecha; las funciones nuevas esperan | vigente |
| D-092 | 2026-11-05 | general | 10, a pedido del usuario | La guía de hitos y la skill de Iridium se funden en un solo marco, el de Iridium, con un control de formato | vigente |
| D-093 | 2026-11-05 | general | 10, frente Orden (Q-132) | El marco de Iridium vive solo dentro de Iridium; afuera no hay marco | vigente |
| D-094 | 2026-11-06 | general | 10, frente Orden, paso 2 (Q-133) | Las ideas y los pendientes de la IA van en una sola lista, «Trabajo» | vigente |
| D-095 | 2026-11-06 | general | 10, frente Orden, paso 2 (Q-134) | Siguen el marco las carpetas con `docs/estado.md`; las demás son carpetas simples hasta que se sumen | vigente |
| D-096 | 2026-11-06 | general | 10, frente Orden, paso 2 (Q-135) | La ronda de UX se hace al terminar cada frente y cada cinco comentarios de la Revisión juntados | vigente |
| D-097 | 2026-11-06 | general | 10, frente Orden, paso 4 (Q-137) | Lo que espera del usuario se llama «Bandeja de entrada» | vigente |
| D-098 | 2026-11-06 | general | 10, frente Orden, paso 4 (Q-136) | La conversación queda siempre a la vista, más angosta | vigente |
| D-099 | 2026-11-06 | general | 10, frente Orden, paso 4 (Q-139) | El marco se llama «framework» | vigente |
| D-100 | 2026-11-06 | general | 10, frente Orden, paso 6 (Q-140) | El ámbar es solo para lo que frena y el botón principal es claro | vigente |
| D-101 | 2026-11-07 | general | 10 (R-14) | Nuevo proyecto arma la plantilla básica, sin la IA | vigente |
| D-102 | 2026-11-07 | general | 10, a pedido del usuario | Diseño pasa adelante, como un «Claude Design» dentro de Iridium, y la dirección visual cambia a negro | vigente |
| D-103 | 2026-11-07 | general | 10, frente Diseño, paso 1 (Q-147 y Q-148) | El mínimo de Diseño empieza por las piezas compartidas, y el negro va sin acento | vigente |
| D-104 | 2026-11-07 | general | 10, frente Diseño, paso 4 (Q-149) | Un solo tema: el negro reemplaza a Iridium y Carbón | vigente |
| D-105 | 2026-11-07 | general | 10, frente Diseño, paso 4 (Q-150) | Las pantallas de Diseño son maquetas HTML que escribe la IA, y se comentan con F8 | vigente |
| D-106 | 2026-11-08 | general | 10, frente Diseño, pasos 4 y 5 (Q-151) | Primero la sección, después el rediseño de Iridium en maquetas; miniaturas en un iframe aislado y la grande en un webview | vigente |
| D-107 | 2026-11-08 | Diseño | 10, frente Diseño, paso 7 | DI-I1 se prueba sobre las maquetas de Iridium (DI-I2), no en un proyecto aparte; el marco de las maquetas lo arma `piezas.js` | vigente |
| D-108 | 2026-11-09 | Diseño | 10, frente Diseño, paso 7 (DI-I2) | Diseño: sin ruido; lo que anda no se anuncia | vigente |
| D-109 | 2026-11-09 | Diseño | 10, frente Diseño, paso 7 (DI-I2) | Diseño: el botón principal es verde | vigente (cambia el punto «sin acento» de D-103 y D-104; ajustada por D-120) |
| D-110 | 2026-11-09 | producto | 10, frente Diseño, paso 7 (DI-I2) | Los textos de la app en español neutro | vigente |
| D-111 | 2026-11-09 | producto | 10, frente Diseño, paso 7 (DI-I2) | Sin la Bandeja de todos | vigente (deja sin efecto la vista general de D-010 y D-022) |
| D-112 | 2026-11-09 | producto | 10, frente Diseño, paso 7 (DI-I2) | Sin la sección Trabajo; Ideas es un bloc de notas | vigente |
| D-113 | 2026-11-09 | framework | 10, frente Diseño, paso 7 (DI-I2) | Las guías de impeccable, en el framework | vigente |
| D-114 | 2026-11-09 | framework | 10, frente Diseño, paso 7 (DI-I2) | Cada token con su uso, y tres ideas más del design system de claude.ai | vigente |
| D-115 | 2026-11-09 | framework | 10, frente Diseño, paso 7 (DI-I2) | Un design system guardado en otro lado pasa a `docs/diseno/` al pasar al framework | vigente |
| D-116 | 2026-11-12 | framework | 10, frente Diseño, paso 7 (T-61) | Los estilos de texto son tokens `--estilo-*` con el atajo `font` | vigente |
| D-117 | 2026-11-12 | framework | 10, frente Diseño, paso 7 (T-62) | La ficha de cada pieza va en el comentario que la encabeza en `piezas.css` | vigente |
| D-118 | 2026-11-12 | framework | 10, frente Orden (T-64) | Novedades del framework: los cambios que les piden algo a los proyectos, con fecha | vigente |
| D-119 | 2026-11-12 | framework | 10, frente Diseño, paso 7 (T-63) | Las medidas fijas son tokens `--alto-*` y `--ancho-*`, y el control avisa de una repetida a mano | vigente |
| D-120 | 2026-11-12 | Diseño | 10, frente Diseño, paso 7 (R-49) | Los botones principales van delineados: fondo negro, letra y borde en color | vigente (ajusta D-109) |
| D-121 | 2026-11-13 | Diseño | 10, frente Diseño, paso 7 (DI-I3) | La app y las maquetas comparten un solo `tokens.css`; las piezas entran a la app sección por sección | vigente |
| D-122 | 2026-11-15 | producto | 10, operación (T-67) | Actualizar arma y reinicia solo, cuando ninguna IA trabaja e Iridium no se usa | vigente (ajusta R-12 y CO-I6; ajustada por Q-167) |
| D-123 | 2026-11-15 | proceso | 10, operación (T-68) | Chat nuevo por tamaño y tiempo, y arranque liviano | vigente |
| D-124 | 2026-11-15 | Diseño | 10, frente Diseño, paso 7 (Q-171, R-56 a R-58) | Vuelve el color donde informa: medidores en verde, ámbar y rojo, enlaces azules, el código con colores y Ejecutar en verde | vigente (ajusta D-103 y D-108) |
| D-125 | 2026-11-15 | Diseño | 10, frente Diseño, paso 7 (R-62, R-65 a R-68, R-70) | La Bandeja del proyecto es solo bandeja (los scripts, en su sección); el proyecto sin cabecera propia ni el hito repetido; el inicio lleva siempre a Proyectos | vigente (ajusta D-044) |
| D-126 | 2026-11-16 | Diseño | 10, frente Diseño, paso 7 (DI-I3, tanda 8) | La hoja de Ideas es `notas.md` de la carpeta Ideas, con las imágenes en `notas/`; fuera anotar sin la IA | vigente (ajusta W-10 y H-18) |
| D-127 | 2026-11-16 | Ideas | 10, frente Ideas, paso 1 (T-69) | Las ideas de un proyecto se piensan como frente propio, con su UX y sus maquetas antes de construir | vigente |
| D-128 | 2026-11-16 | Ideas | 10, frente Ideas, paso 1 (Q-175 a Q-177) | Ideas es una lista de ideas con estado y enlaces para revisar, igual en cada proyecto y en el inicio | vigente (reemplaza a D-112 y D-126 al construirse) |
| D-129 | 2026-11-16 | Ideas | 10, frente Ideas, paso 2 (Q-179) | Aprobar una idea la pasa al trabajo de la IA como pendiente; rechazarla, a descartado | vigente |
| D-130 | 2026-11-16 | Ideas | 10, frente Ideas, paso 5 | Cada idea es un `T-n` de `trabajo.md` con el campo `Idea:`; la nota del usuario va aparte | vigente |
| D-131 | 2026-11-16 | Ideas | 10, frente Ideas, paso 7 (ID-I2, Q-182) | Revisar con la IA y Hablar de esta idea citan en la conversación, sin enviar | vigente |
| D-132 | 2026-11-16 | general (Compartir) | 10, a pedido del usuario | El repo de Iridium es público: las copias compartidas se actualizan desde GitHub sin invitación, y la del usuario sigue sin actualizarse desde ahí | vigente (precisa D-085) |
| D-133 | 2026-11-16 | Orden (Skills › Framework) | 10, a pedido del usuario | Actualizar al framework va siempre en una conversación nueva del proyecto, y el botón se llama Actualizar | vigente (precisa F-9) |
| D-134 | 2026-11-16 | Apariencia y ajustes | 10, a pedido del usuario (T-75, Q-187) | El tema propio son solo tokens, en un archivo fuera de la app, con la guía dentro de Iridium y la IA desde Ajustes | vigente |
| D-135 | 2026-11-17 | Inicio (Bandeja) y Ajustes | 10, a pedido del usuario (T-70, Q-188) | El período de 5 horas se arranca con trabajo real: Iridium abierta toca «Continúa con el proyecto» en un proyecto con respuestas sin procesar, a las 3 y al vencer cada ventana | vigente |
| D-136 | 2026-11-17 | Inicio (la grilla de Proyectos) | 10, a pedido del usuario (R-80, T-77, Q-191) | Los proyectos van por el último cambio, sin agrupar por estado | vigente; reemplaza el orden por estado de D-022 (opción 1) y de H-1 |
| D-137 | 2026-11-17 | Mapa (T-71) | 10; frente Mapa, paso 1 (Propuesta), Q-193 | El Mapa se elige entre una hoja de ruta y un camino de pasos por frente, sin kanban | vigente |
| D-138 | 2026-11-17 | Mapa (T-71) | 10; frente Mapa, paso 1 (Propuesta), Q-194 | El Mapa es un camino de pasos concretos por frente, un frente a la vez | vigente; deja atrás la hoja de ruta (opción A de D-137) |
| D-139 | 2026-11-17 | Mapa (T-71) y el framework (el estado de un frente) | 10; frente Mapa, paso 1 (Propuesta), Q-195 | La ruta de cada frente es una lista corta en su estado.md, que la IA mantiene al cerrar cada iteración | vigente |
| D-140 | 2026-11-17 | el orden de los frentes | 10, Q-197 | Después de Ideas se construye el Mapa | vigente |
| D-141 | 2026-11-17 | Mapa (T-71) | 10; frente Mapa, paso 2 (Definición), Q-199 | La definición del Mapa va como se escribió | vigente |
| D-142 | 2026-11-17 | Mapa (T-71) | 10; frente Mapa, paso 2 (Definición), Q-200 | Antes del hito 10 el camino del Mapa son los hitos | vigente |
| D-143 | 2026-11-17 | Mapa (T-71) | 10; frente Mapa, paso 2 (Definición), Q-201 | «Por empezar» sale solo de trabajo.md | vigente |
| D-144 | 2026-11-17 | Mapa (T-71) | 10; frente Mapa, paso 4 (UX), Q-202 | La UX del Mapa queda como se escribió, sin color por frente | vigente |
| D-145 | 2026-11-17 | Mapa (T-71) y el framework (el `estado.md` de un frente) | 10; frente Mapa, paso 5 (Diseño técnico) | La ruta: casillas con tres marcas, los códigos escondidos y «Por empezar» calculado al leer | vigente |
| D-146 | 2026-11-18 | Arranque (T-70), con Apariencia y ajustes (el ajuste) e Inicio (el detalle del uso) | 10; frente Arranque, paso 2 (Definición) | La definición del Arranque va como se escribió | vigente |
| D-147 | 2026-11-18 | Arranque (T-70), con Apariencia y ajustes e Inicio | 10; frente Arranque, paso 4 (UX) | La UX del Arranque, con un aviso al volver | vigente |
| D-148 | 2026-11-18 | frente nuevo Abrir (T-80), con el framework e Inicio | 10 | Abrir lo que hace cada proyecto, y después mantener al día las apps de escritorio | vigente |
| D-149 | 2026-11-18 | Arranque (T-70) | 10; frente Arranque, paso 5 (Diseño técnico) | El arranque: un temporizador recalculado, la Bandeja como fuente y lo que pasó en arranques.json | vigente |
| D-150 | 2026-11-18 | frente nuevo Plantillas (T-81), con el framework | 10 | Plantillas por tipo de app: piezas modulares que crecen, empezando por las pruebas sin ventanas | vigente |
| D-151 | 2026-11-18 | frentes Diseño, Orden y Plantillas | 10 | Primero se terminan Diseño y Orden; Plantillas espera | vigente (Abrir pasa adelante, D-153) |
| D-152 | 2026-11-18 | Mapa | 10 (R-91) | El Mapa archiva los frentes en uso sin nada por hacer | vigente |
| D-153 | 2026-11-19 | frentes Abrir, Diseño, Orden y Plantillas | 10, a pedido del usuario | Abrir pasa adelante: se hace ahora y Diseño espera | vigente (cambia el orden de D-148 y D-151) |
| D-154 | 2026-11-19 | Abrir (T-80), con el framework | 10; frente Abrir, paso 2 (Definición) | La definición de Abrir va como se escribió; la actualización automática arranca prendida y se apaga por proyecto | vigente |

---

## D-001 — Consolidar en este proyecto las ideas de desarrollo con IA

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 0
- **Estado:** vigente

**Contexto:** en `Ideas/ideas.md` se acumularon varias ideas sobre cómo desarrollar con IA (app propia sobre Claude Code, comentarios sobre la app en desarrollo, preguntas estandarizadas, Claude Design propio), que ya apuntaban a un proyecto común de "herramientas de desarrollo". El usuario pidió juntarlas en un proyecto y sumar el puente PC–celular.

**Decisión:** crear el proyecto (nombre provisorio "Centro de Desarrollo") con esas ideas en `00-idea.md`, y explorarlas antes de construir nada.

**Motivo:** pedido del usuario; las ideas se cruzan entre sí y conviene pensarlas juntas.

**Consecuencias:** las ideas pasan a "Integradas" en `Ideas/ideas.md`. Las de otra app y otro proyecto que usan el celular quedan en sus proyectos, pero dependen de lo que se decida sobre el puente (Q-3).

---

## D-002 — "Centro de Desarrollo" queda como nombre provisorio

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 0
- **Estado:** reemplazada por D-033

**Contexto:** el proyecto necesitaba una carpeta para existir; el nombre salió de las palabras del usuario (Q-2).

**Opciones consideradas:**
1. Dejarlo provisorio y decidir más adelante — no frena nada; cambiarlo es renombrar la carpeta.
2. Elegir un nombre definitivo ahora — sin información suficiente sobre qué termina siendo.

**Decisión:** queda "Centro de Desarrollo" como provisorio.

**Motivo:** el nombre se elige mejor cuando el alcance esté claro.

**Consecuencias:** revisar el nombre al cerrar el hito 2 (o el 6, con la identidad visual). Al cerrar el hito 2, el usuario eligió decidirlo en el hito 6, con la identidad visual (Q-32).

---

## D-003 — El puente PC–celular es un módulo de este proyecto, para que lo usen otros

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 0
- **Estado:** reemplazada por D-005

**Contexto:** el puente lo necesitan este proyecto, otro proyecto y otra app (Q-3).

**Opciones consideradas:**
1. Módulo de este proyecto, pensado para que lo usen otros y construible antes que el resto — hereda la documentación y las decisiones del proyecto; sale rápido.
2. Proyecto propio aparte — más independiente, pero duplica perfil, design system y decisiones.
3. Parte de otro proyecto — otro proyecto todavía está en exploración y su alcance es mucho más grande; el puente quedaría esperando.

**Decisión:** opción 1.

**Motivo:** es una herramienta de desarrollo (llevar al celular lo que se construye en la PC) y es la base que otros proyectos van a usar.

**Consecuencias:** el módulo puede empezar su ciclo reducido apenas cierre el hito 2 general (`plan-desarrollo.md` › El puente PC–celular puede ir primero). En el hito 5 se diseña con una interfaz que otro proyecto y otra app puedan usar. Si en el hito 1 aparece algo existente que alcanza, se reconsidera.

---

## D-004 — Plan de desarrollo propio: exploración y definición más a fondo

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 0
- **Estado:** vigente

**Contexto:** el proyecto es una plataforma de largo plazo con varias áreas, y el usuario quiere explorar todo antes de construir (Q-4).

**Opciones consideradas:**
1. Plan propio, como el de otro proyecto (D-003 de otro proyecto) — más trabajo en los hitos 1 a 5, menos riesgo de una base que no aguanta.
2. La guía de hitos normal — más rápido, pero pensada para apps con un caso de uso central.

**Decisión:** opción 1, en `plan-desarrollo.md`.

**Motivo:** el riesgo principal es construir una base equivocada o algo que ya existe.

**Consecuencias:** el hito 1 explora alternativas por área y repasa las herramientas propias; el hito 2 arma un catálogo de casos de uso.

---

## D-005 — El puente PC–celular es LocalSend más un envío automático desde la PC

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente (reemplaza a D-003)

**Contexto:** la exploración del puente (`01-exploracion.md` › Área: Puente PC–celular) mostró que LocalSend ya resuelve el envío, y desde la 1.18 tiene línea de comandos. El usuario ya lo usa y le alcanza (Q-5); lo único que falta es que los archivos lleguen al celular sin mandarlos a mano desde la PC; no hace falta instalar solo (Q-6).

**Opciones consideradas:**
1. Usar LocalSend tal cual y agregar solo el envío automático: que la IA o un proyecto mande un archivo al celular sin intervención — mínimo trabajo, aprovecha lo que ya funciona.
2. Módulo propio con app en el celular (D-003) — mucho más trabajo para algo que ya existe.
3. ADB por Wi-Fi para instalar solo — el usuario no lo necesita y la conexión es frágil.

**Decisión:** opción 1. El puente deja de ser un módulo: es una funcionalidad chica del Centro, que cualquier proyecto (otra app, otro proyecto) puede usar para mandar archivos al celular.

**Motivo:** lo que existe alcanza; construir solo lo que falta.

**Consecuencias:** desaparece el módulo "Puente PC–celular" previsto. En el hito 3 se hace un spike: probar que la línea de comandos de LocalSend manda un archivo sin interacción y que el celular lo acepta solo (dispositivo favorito). Si funciona, se puede usar enseguida, antes de construir el resto. Quedan para el hito 3 la verificación de desarrolladores de Android (que el APK se pueda instalar) y si hace falta Tailscale fuera de casa.

---

## D-006 — El Centro es una app propia para dirigir, con Claude Code (Agent SDK) como motor

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente (ajustada por D-015: una sesión por proyecto, varios proyectos a la vez)

**Contexto:** ninguna interfaz existente organiza el trabajo por proyecto y plan (`01-exploracion.md` › Área: Motor y marco). El usuario probó Claude Code Desktop: organiza por sesiones, y no deja ver sobre qué se trabaja, ni los docs, ni el design system sin ir al navegador (Q-8).

**Opciones consideradas:**
1. App propia para dirigir, con Claude Code como motor — un solo lugar con el proyecto, sus docs, el diseño y la conversación; más trabajo.
2. Paneles propios dentro de Claude Code Desktop (mods) — menos trabajo, pero algo muy nuevo y no resuelve ver docs y diseño al lado.
3. Hacer crecer el gestor anterior en VS Code — atado a lo que VS Code permite mostrar.

**Decisión:** opción 1 (Q-7). La conversación con la IA vive **dentro** de la app, al lado de los docs y el diseño del proyecto, usando el Agent SDK (que es el motor de Claude Code empaquetado para usarlo desde otra app). No se copian las funciones de Claude Code Desktop que no hacen falta para dirigir (sesiones en la nube, Dispatch, muchas sesiones en paralelo): para eso se sigue usando Desktop o la CLI.

**Motivo:** lo que le falta al usuario no es el chat, sino ver el proyecto mientras conversa. El Agent SDK da lo mismo que Claude Code (herramientas, skills, conectores, permisos) y deja la interfaz libre.

**Consecuencias:** la app tiene que dibujar la conversación, los pedidos de permiso y los cambios de la IA (el SDK no trae interfaz). Se usa la suscripción, no la API (ver `01-exploracion.md` › Usar la suscripción y no la API), a confirmar en el hito 3. En el hito 5 se hace un spike: una conversación con el Agent SDK dentro de una ventana propia. Si Anthropic cambia la política, la app debe poder abrir Claude Code en lugar de manejarlo.

---

## D-007 — El Agent SDK se usa directo, pero aislado en un solo lugar de la app

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente (completa a D-006)

**Contexto:** Claude Code y su SDK van a cambiar, y mañana el mejor motor puede ser otro (Codex, modelos locales). El usuario planteó que, si la IA hace la adaptación, quizás no haga falta independizarse de antemano (Q-9, Q-10). Análisis en `01-exploracion.md` › Cuánto cuesta de verdad cambiar de motor, si la IA hace la adaptación.

**Opciones consideradas:**
1. Agent SDK directo, aislado en un solo lugar ("frontera") — todas las funciones de Claude, rápido de construir; cambiar de motor es que la IA reescriba esa pieza.
2. Capa intermedia con ACP desde el principio — cambiar de motor es elegir otro, pero se pierden funciones de Claude y depende de adaptadores de terceros.
3. Agent SDK directo sin cuidar dónde se usa — lo más rápido, lo más caro de cambiar.
4. Motor propio que llama a cualquier modelo — rehacer Claude Code; descartado.

**Decisión:** opción 1.

**Motivo:** el costo de cambiar de motor es parecido en 1 y 2, y lo difícil de un cambio (funciones exclusivas, historial, comportamiento de la IA) pesa igual en las dos. La 1 da más hoy con menos piezas de terceros.

**Consecuencias:**
- En el hito 5 la arquitectura define la frontera: el único lugar de la app que habla con el SDK. Ninguna otra parte lo usa.
- Las funciones exclusivas de Claude (modos de permiso, plan, subagentes, hooks) se pueden usar, pero se listan en la arquitectura y el centro de la app no depende de ellas.
- La app guarda su propio resumen de cada sesión; no depende del historial interno de Claude.
- Si ACP madura o hace falta usar varios motores, se agrega detrás de la misma frontera.

---

## D-008 — El plan se ve como un gráfico de fases y pasos leído de `docs/`; sin kanban ni canvas por ahora

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente

**Contexto:** ninguna herramienta conoce el ciclo completo de la guía de hitos; las que funcionan guardan el plan en archivos y dibujan una vista encima (`01-exploracion.md` › Área: Proyectos y plan). El usuario respondió Q-11 y Q-12.

**Opciones consideradas:**
1. Mapa de hitos como gráfico de fases con sus pasos, cada uno enlazado a su documento — muestra dónde se está y qué falta.
2. Tablero kanban de tareas — descartado: es la IA quien interpreta lo que quiere el usuario y ubica cada tarea; al usuario no le sirve moverlas.
3. Gestor externo (Linear, Plane) — descartado: duplica el plan fuera del repo.
4. Canvas para pensar las ideas (Excalidraw, tldraw, Miro) — postergado: el usuario todavía no sabe cómo lo estructuraría.

**Decisión:** opción 1. La verdad del plan sigue en `docs/` (estado, hitos, áreas, iteraciones, decisiones, `Q-n`); el Centro la lee y la dibuja como **fases (hitos) con sus pasos** (áreas, iteraciones, pasos de un módulo), marcando lo hecho, lo que está en curso y lo pendiente. Cada fase y cada paso abre el documento o la sección que lo detalla. Los diagramas sueltos (arquitectura, flujos) los arma la IA en Mermaid dentro de los docs. No hay canvas por ahora.

**Motivo:** el usuario quiere ver con claridad dónde está y bajar al detalle cuando lo necesita; no quiere administrar tareas, porque eso lo hace la IA.

**Consecuencias:**
- La forma exacta del gráfico se elige en los hitos 4 y 6; hay una prueba con tres variantes (Q-13). El usuario prefiere cajas dentro de cajas (opción A): los módulos van como otra caja y los hitos reabiertos se marcan. Mermaid alcanza para probar; en la app puede dibujarse con componentes propios (React Flow) si hace falta tocar cada paso.
- La guía de hitos tiene que dejar los pasos de cada hito en un formato que el Centro pueda leer (tablas con estado); se revisa en el hito 3 (formato de la documentación).
- El canvas queda en "Ideas para después" de `00-idea.md`, con Excalidraw como candidato (libre, se mete en la app).

---

## D-009 — La guía de hitos suma las mejoras 1 a 6 tomadas de otros métodos

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente

**Contexto:** se comparó la guía con Spec Kit, BMAD, Kiro, OpenSpec, Task Master y Backlog.md (`01-exploracion.md` › Guía de hitos frente a otros métodos). La guía es mejor en alcance, en cómo trata a alguien que no programa y en el cuidado del contexto, pero confía en que se noten los huecos en vez de tener pasos que los busquen. El usuario respondió Q-14.

**Opciones consideradas:**
1. Las de valor alto y medio (1 a 6).
2. Solo las dos de valor alto (revisión de coherencia y verificación de iteraciones).
3. Todas, incluidas escenarios, retrospectiva y dependencias entre tareas — descartado: suma peso sin uso claro todavía.
4. Ninguna por ahora.

**Decisión:** opción 1. Se agregan a la guía: revisión de coherencia al cerrar el hito 6, verificación al cerrar cada iteración, procedimiento para corregir el rumbo, cambios como propuestas después del lanzamiento, pista corta para errores y cambios chicos, y contexto por iteración.

**Motivo:** las dos de valor alto atacan los errores más caros (plan mal armado, iteración dada por buena sin funcionar); las cuatro medias resuelven huecos que ya aparecieron en proyectos reales, como volver atrás sin saber cómo.

**Consecuencias:**
- El trabajo se hace en el proyecto `Skills`, en una sesión aparte; desde acá no se toca.
- La mejora 3 incluye el caso de Q-13: una funcionalidad que obliga a cambiar el motor y volver a un hito anterior (típico en juegos y en proyectos que pasan a plugins).
- Las mejoras 7 a 9 quedan como posibles; la 9 (dependencias entre tareas) se revisa si el Centro corre varios agentes a la vez.

---

## D-010 — Bandeja propia de pendientes; las `Q-n` suman tipo y si frenan; pruebas y tareas como listas

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente (ajustada por D-022)

**Contexto:** ninguna herramienta junta lo que espera del usuario entre proyectos; las bandejas que existen son para aprobar acciones de agentes (`01-exploracion.md` › Área: Pendientes del usuario). El usuario respondió Q-16 y Q-17, contó que la IA sigue preguntando en el chat lo que debería ser una `Q-n`, y pidió listas con un campo de texto por punto para pruebas y tareas.

**Opciones consideradas:**
1. Bandeja propia que lee los archivos de cada proyecto, con un formato de `Q-n` más rico.
2. Bandeja de terceros (Agent Inbox, HumanLayer) — descartado: son para aprobar acciones, atadas a otro marco o a la nube.
3. Seguir con el visor del Gestor, proyecto por proyecto — se queda corto: no junta todos los proyectos.

**Decisión:** opción 1.
- La verdad queda en `estado.md` y `respuestas/` de cada proyecto; el Centro los junta. Muestra primero lo que frena a un proyecto y después el resto (Q-16).
- Cada `Q-n` dice su **tipo** (decisión, consulta, prueba, tarea, formulario) y si **frena** el próximo paso.
- Pruebas y tareas son **listas**: cada punto se marca y lleva un campo de texto.
- Los formularios se usan para **arrancar un proyecto**: tipo (app, juego), plataformas y los datos del perfil; opcionales, por partes y con "no sé todavía" en cada campo (Q-17). Su forma se toma de la elicitación de MCP, escrita en los archivos: no se agrega ningún MCP ni skill.
- Las preguntas del chat que no se contestan en el momento pasan a `Q-n` (el Centro lo hace solo; mientras tanto, lo dice la guía).

**Motivo:** el usuario quiere un solo lugar donde ver qué espera de él y saber qué es urgente; las listas con nota evitan que varios problemas se mezclen en un "Otro"; y cuidar el contexto descarta un MCP o skill extra.

**Consecuencias:**
- Cambios de la guía, en `Skills`: tipos y "frena" en el formato de `Q-n`, listas con nota, regla de las preguntas del chat y formulario de arranque. El visor del gestor anterior tiene que entender el formato nuevo (proyecto aparte).
- Los formatos exactos (cómo se escribe una lista o un formulario en markdown) se fijan en el hito 3 (formato de la documentación).

## D-011 — Diseño: lienzo y biblioteca propios sobre `DESIGN.md`, armados con lo que ya existe

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente (responde Q-18 y Q-19)

**Contexto:** hoy se diseña en Claude Design, en la nube. Las alternativas locales (Open Design, Open CoDesign) generan diseños pero no tienen el lienzo con versiones lado a lado y comentarios que sirvió en otra app; las que lo tienen están en la nube. `DESIGN.md` ya es un formato abierto y es el que usa `impeccable` (`01-exploracion.md` › Área: Diseño).

**Opciones consideradas:**
1. Lienzo y biblioteca propios en el Centro; el diseño lo hace la IA con skills.
2. Usar Open Design tal cual — sin lienzo, telemetría siempre encendida, datos fuera del proyecto.
3. Seguir con Claude Design en la nube y que el Centro guarde solo la biblioteca — no es local y el producto cambia sin aviso.

**Decisión:** opción 1, elegida por el usuario, **sin construir desde cero**:
- El formato es `DESIGN.md` en cada proyecto. La biblioteca es una carpeta local: por cada estilo guardado, su captura y su `DESIGN.md` extraído de la página (Q-19).
- Los prototipos son HTML dentro del proyecto; el Centro los muestra en un lienzo, lado a lado, con comentarios pegados a elementos y guardados en archivos. La pieza de comentarios es la misma que usará Revisión de la app.
- Se toma código de Open Design (Apache-2.0) y Open CoDesign (MIT) donde sirva y la licencia lo permita, con aviso de autoría. De `impeccable` y de los tipos de Claude Design se toman las ideas y las instrucciones; el código del lienzo de Anthropic no es abierto y no se copia.
- El diseño lo sigue haciendo Claude con skills (`impeccable` y un extractor de estilos adaptado); se refinan juntando lo mejor de las que existen.

**Motivo:** el usuario quiere todo local y no reinventar lo que ya existe; lo que falta no es quién diseñe sino dónde ver, comparar, comentar y guardar.

**Consecuencias:**
- Hito 3: estudiar el código de Open Design y Open CoDesign, las skills de diseño y los tipos de Claude Design (`01-exploracion.md` › Pistas para la investigación técnica (hito 3)).
- Las skills de diseño que se adapten viven en `Skills`, como el resto (idea 7).
- Claude Design en la nube queda como respaldo mientras el Centro no exista.

---

## D-012 — Revisión de la app: extensión del navegador, comentarios en archivos planos

- **Fecha:** 2026-10-21
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente (responde Q-20 y Q-21); lo de «solo web» lo cambia D-047

**Contexto:** señalar un elemento y pasárselo a la IA ya existe (panel de Claude Code Desktop, `impeccable live`, Agentation, React Grab), pero ninguna herramienta guarda el comentario en el proyecto para la sesión siguiente (`01-exploracion.md` › Área: Revisión de la app).

**Opciones consideradas:**
1. Pieza dentro del Centro, que abre la app desde afuera (web y Electron) y suma variantes en vivo con `impeccable` — más grande; depende de que el Centro exista.
2. Agentation dentro de cada app — solo React, hay que tocar cada proyecto, notas fuera de los archivos.
3. Panel de Claude Code Desktop con `impeccable live` — no guarda nada.
4. Extensión del navegador, solo web, sin variantes — propuesta del usuario.

**Decisión:** opción 4, propuesta por el usuario:
- Una extensión del navegador: se selecciona un elemento como en Claude Design y se **deja** el comentario o se **envía en el momento** a la sesión abierta. Sin variantes.
- Solo apps web en desarrollo (y los prototipos HTML de Diseño). Sirve con cualquier framework.
- Cada comentario es un archivo plano en una carpeta del proyecto: texto, página, selector, texto visible, captura recortada y, cuando el framework lo marca en modo desarrollo, archivo y línea de origen. El `CLAUDE.md` del proyecto dice dónde están.
- Un programa chico en la PC recibe los comentarios de la extensión y los escribe en el proyecto que corresponde; cuando exista el Centro, lo hace el Centro.
- Ciclo (Q-21): la IA lo cierra al resolverlo y queda en el historial; se puede reabrir o dejar uno nuevo.

**Motivo:** más simple que la opción 1 y sirve desde ya, sin esperar al Centro; el modo desarrollo da gratis la ubicación en el código.

**Consecuencias:**
- Electron y Android quedan fuera por ahora (`00-idea.md` › Ideas para después).
- `impeccable live` sigue disponible por su cuenta; el Centro no lo integra.
- Hito 3: extensión y programa local, marcas de origen por framework, cómo llega "enviar ahora" a la sesión (`01-exploracion.md` › Pistas para la investigación técnica (hito 3)).
- El selector es el mismo que usará el lienzo de Diseño (D-011).

---

## D-013 — El gestor anterior queda solo con mantenimiento hasta que el Centro lo cubra

- **Fecha:** 2026-10-22
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente (responde Q-22)

**Contexto:** el Gestor (extensión de VS Code, 1.2.0) ya resuelve parte del Centro y su código, salvo una capa chica, no depende de VS Code (`01-exploracion.md` › Repaso de lo propio › el gestor anterior y su visor).

**Opciones consideradas:**
1. Solo mantenimiento — no se duplica trabajo; lo nuevo va al Centro.
2. Seguir sumándole funciones — mejor mientras tanto, pero es trabajo que el Centro rehace.
3. Congelarlo — dejaría de entender los formatos nuevos de la guía.

**Decisión:** opción 1, elegida por el usuario: arreglos y lo necesario para entender los formatos nuevos de la guía (D-010). Las funciones nuevas se piensan para el Centro.

**Motivo:** el Gestor es el primer pedazo del Centro; crecer en los dos lados es hacer dos veces lo mismo.

**Consecuencias:**
- La relación definitiva (incorporarlo, reemplazarlo o convivir) se decide en el hito 2; todo apunta a que el Centro lleve su código.
- Las funciones pendientes del Gestor (búsqueda, grupos, abrir en ventana nueva) pasan a ser casos de uso a considerar para el Centro en el hito 2.
- Los cambios al Gestor se hacen en su proyecto, cuando el usuario lo abra.

---

## D-014 — Skills locales donde la licencia lo permite; las de Anthropic que no se pueden copiar, desde la cuenta

- **Fecha:** 2026-10-22
- **Ámbito:** general
- **Hito o paso:** 1
- **Estado:** vigente (responde Q-23)

**Contexto:** de la cuenta de claude.ai bajan una segunda copia de `impeccable` (más nueva que la local), los plugins `design` y `engineering` y las skills de Anthropic. Las de Word, PDF, PowerPoint, Excel, navegador y control de la PC prohíben por licencia sacar copias fuera de los servicios de Anthropic (`01-exploracion.md` › Repaso de lo propio › Skills).

**Opciones consideradas:**
1. Local todo lo que la licencia permite; las que no, desde la cuenta como excepción; el resto se quita.
2. Todo local sin excepción — se pierden las skills de documentos.
3. Dejar todo como está — siguen las copias dobles.

**Decisión:** opción 1, elegida por el usuario:
- A `Skills`, con una sola copia: `impeccable` (la versión más nueva), `skill-creator` y lo que sirva de los plugins `design` y `engineering`, una vez confirmada su licencia.
- Quedan desde la cuenta, como excepción: las de documentos (Word, PDF, PowerPoint, Excel) y las del navegador y el control de la PC, que tampoco se pueden copiar.
- Se quita de la cuenta lo demás: lo que se trajo a local y lo que sin conectores no sirve en la PC (investigación, docs, Google Workspace, resumen de la mañana, importar memoria).

**Motivo:** respeta la preferencia de tener todo en la PC (`00-idea.md`, idea 7) sin perder lo que no tiene reemplazo.

**Consecuencias:**
- Trabajo en una sesión de `Skills`: traer las skills, sacar la copia vieja de `impeccable` y decidir qué de `design` y `engineering` no choca con la guía de hitos.
- Después, el usuario quita de su cuenta lo que ya no tiene que bajar.
- El gestor de skills del Centro muestra de dónde viene cada una y avisa de las copias dobles.

---

## D-015 — Una sesión de IA por proyecto; varios proyectos trabajando a la vez

- **Fecha:** 2026-10-22
- **Ámbito:** general
- **Hito o paso:** 2
- **Estado:** vigente (surge de la respuesta a Q-26; ajustada por D-021)

**Contexto:** D-006 dejaba afuera "muchas sesiones en paralelo", pensando en varias sesiones dentro de un mismo proyecto, como hace Claude Code Desktop. Al revisar el catálogo, el usuario aclaró que quiere abrir un proyecto y trabajar enfocado en él, y también volver a la vista general y trabajar en otro mientras la IA del primero sigue trabajando.

**Opciones consideradas:**
1. Una sesión por proyecto, varios proyectos a la vez — cada proyecto tiene su conversación, que sigue aunque no esté a la vista.
2. Una sola sesión a la vez en toda la app — más simple, pero obliga a esperar o cortar para cambiar de proyecto.
3. Varias sesiones dentro de un mismo proyecto (como Desktop) — sigue afuera: pide copias aisladas del proyecto y revisar cambios cruzados; para eso queda Desktop o la CLI.

**Decisión:** opción 1. La app tiene una **vista general** (todos los proyectos, la bandeja, la biblioteca de diseño, las skills) y una **vista por proyecto**, donde todo es de ese proyecto (docs, plan, conversación, diseño, comentarios). Cada proyecto tiene su propia sesión de IA, que sigue trabajando aunque se pase a otro; la vista general muestra cuáles están trabajando, esperando un permiso o terminadas.

**Motivo:** el usuario dirige varios proyectos; esperar a que la IA termine en uno para pasar a otro desperdicia su tiempo.

**Consecuencias:**
- Base: B-4 tiene que manejar varias sesiones a la vez, y B-11, las dos vistas (`02-definicion.md` › Lo que la base tiene que dar). Casos C-49 a C-51.
- Hito 3: confirmar que la suscripción permite varias sesiones del Agent SDK a la vez. Comparten el mismo límite de uso, así que varios proyectos trabajando lo gastan más rápido; la app tiene que mostrarlo (C-7).
- Un pedido de permiso en un proyecto que no está a la vista lo frena hasta que se responde: por eso la vista general lo muestra, y C-51 avisa.
- Hito 4: cómo se pasa de la vista general a la de un proyecto y cómo se ven las sesiones en marcha.

---

## D-016 — El MVP es dirigir proyectos conversando con la IA: cinco funcionalidades, once casos

- **Fecha:** 2026-10-22
- **Ámbito:** general
- **Hito o paso:** 2
- **Estado:** vigente (responde Q-28)

**Contexto:** el catálogo tiene 51 casos en siete áreas, revisado en tres tandas (Q-25 a Q-27). El riesgo mayor del proyecto es no terminar nunca (`01-exploracion.md` › Riesgos iniciales).

**Opciones consideradas:**
1. Solo los once casos *Must*: vista general, vista de proyecto con la IA, varios proyectos a la vez, mapa del plan, bandeja.
2. Sumar lo que hoy hace el Gestor (scripts, fichas) — MVP más grande sin ganar nada, porque el Gestor sigue en uso.
3. Sumar una parte de Diseño — es un área del tamaño de una app; Claude Design sigue de respaldo.

**Decisión:** opción 1 (`02-definicion.md` › MVP en un párrafo). El envío de APK al celular (C-40) va aparte y puede hacerse antes.

**Motivo:** es lo mínimo que ya cambia cómo trabaja el usuario: dirigir y responder desde un lugar, con la IA al lado del proyecto. Cinco funcionalidades está en el límite que recomienda la guía.

**Consecuencias:**
- Diseño, Revisión de la app y Skills quedan para después del MVP; cada una como módulo (`plan-desarrollo.md` › Qué cambia en cada hito).
- La base igual se diseña para todo el catálogo (B-1 a B-12), aunque el MVP use solo una parte.

---

## D-017 — El Centro y el Gestor conviven hasta que el Centro lo cubra

- **Fecha:** 2026-10-22
- **Ámbito:** general
- **Hito o paso:** 2
- **Estado:** vigente (responde Q-29; completa D-013)

**Contexto:** D-013 dejó el Gestor solo con mantenimiento y la relación para este hito. El MVP (D-016) no trae scripts, fichas ni abrir en VS Code.

**Opciones consideradas:**
1. Conviven hasta que el Centro lo cubra; después el Gestor queda como acceso rápido en VS Code o se retira.
2. El Centro lo reemplaza desde la primera versión — el MVP crece con scripts, fichas, búsqueda y grupos.
3. Conviven siempre — dos herramientas que leen lo mismo y cada cambio de formato se hace dos veces.

**Decisión:** opción 1, elegida por el usuario.

**Motivo:** mantiene chico el MVP sin que el usuario pierda nada mientras tanto.

**Consecuencias:**
- Los dos leen y escriben los mismos archivos (`.proyecto.json`, `estado.md`, `respuestas/`): el Centro no puede cambiar esos formatos sin que el Gestor los entienda (B-2).
- Cuando el Centro cubra C-8 a C-12, se decide si el Gestor queda como acceso rápido o se retira.
- En el hito 5, que el Centro pueda llevarse el código del Gestor es un argumento a favor de TypeScript y React.

---

## D-018 — El Centro también edita las skills y la guía de hitos

- **Fecha:** 2026-10-22
- **Ámbito:** general
- **Hito o paso:** 2
- **Estado:** vigente (surge de la respuesta a Q-31)

**Contexto:** la definición decía que el Centro solo lee el formato de la guía y que los cambios se hacen en `Skills`. El usuario planteó que, si desde el Centro se ven y se quitan las skills locales, también se tienen que poder editar, y que `Skills` queda absorbido por el Centro.

**Opciones consideradas:**
1. El Centro edita las skills y la guía, con la IA, igual que trabaja en cualquier proyecto.
2. El Centro solo las muestra y la edición sigue en sesiones aparte de `Skills`, desde VS Code.

**Decisión:** opción 1. El área Skills suma editar una skill o la guía (C-52) y, cuando cambia el formato de la guía, mostrar qué proyectos quedaron atrás y ponerlos al día (C-53). Los archivos se quedan donde están (Q-33, opción A): las propias en `Skills/skills/`, instaladas como enlaces en `.claude\skills\`; el Centro las lee y edita por ahí, como hoy.

**Motivo:** ver y quitar sin poder editar obliga a salir del Centro para lo que más cambia; y poner al día el formato de los proyectos ya es trabajo que se hace a mano.

**Consecuencias:**
- `02-definicion.md` › Fuera de alcance deja de excluir los cambios a la guía; B-12 suma editar las skills propias.
- El Centro no mueve ni reinstala skills: distingue un enlace (propia, en `Skills`) de una carpeta real (copia de un tercero, como `impeccable`) o de una que baja de la cuenta (`synced`), y eso le dice de dónde viene cada una (C-44).
- Mientras el Centro no exista, todo sigue igual: los cambios a la guía se hacen en una sesión de `Skills`.
- El Centro edita skills que usan todos los proyectos: un error las rompe para todos, así que el cambio tiene que poder deshacerse (git) y probarse antes (hito 5).

---

## D-020 — Marco de la app: barra lateral de íconos, barra de sesiones arriba, conversación al centro y «Seguí» para arrancar

- **Fecha:** 2026-10-22
- **Ámbito:** general
- **Hito o paso:** 4
- **Estado:** vigente (precisa D-015 y la funcionalidad *Must* «Vista de un proyecto»; ajustada por D-022)

**Contexto:** D-015 dejó para el hito 4 cómo se pasa de la vista general a la de un proyecto y cómo se ven las sesiones en marcha. Se propusieron barra lateral con la lista de proyectos, inicio con tarjetas o pestañas; para la vista del proyecto, contenido con el chat a la derecha, chat grande o pestañas; y si la IA arranca sola al abrir un proyecto.

**Decisión** (respuestas del usuario en el chat):
- **Barra lateral compacta, solo íconos**: cada ícono es una sección de la app (Proyectos, Bandeja; después Diseño, Skills…).
- **Barra de sesiones arriba a la derecha**, como una barra de tareas: una ficha por sesión abierta con su estado; tocarla abre ese proyecto.
- **Proyectos se ve como el Gestor**: tarjetas agrupadas por estado, con el número de pendientes arriba a la derecha.
- **Vista del proyecto con la conversación grande al centro** y el mapa o los docs al costado; un botón la pasa al panel derecho.
- **Cambiar de proyecto o de sección no recarga nada.**
- **La IA arranca con el botón «Seguí»**, no sola al abrir el proyecto.

**Motivo:** los íconos dejan lugar a las áreas que vienen sin cambiar la navegación (B-11); la barra de sesiones muestra quién espera desde cualquier lugar (C-50) sin ocupar una columna; «Seguí» evita gastar uso de la suscripción al entrar solo a mirar o responder.

**Consecuencias:**
- `02-definicion.md` › Must: «que arranca sola» pasa a «que retoma con un botón «Seguí»».
- `04-ux.md` › Arquitectura de información, W-1 a W-3 y H-1 a H-6.
- Hito 5: cada proyecto abierto guarda su vista en memoria y las sesiones siguen aunque no estén a la vista.

---

## D-019 — Formato de `docs/` para el Centro: portón como lista, estados con palabras fijas, `Tipo:` en las `Q-n` y pruebas con casillas

- **Fecha:** 2026-10-22
- **Ámbito:** general
- **Hito o paso:** 3
- **Estado:** vigente (completa D-008 y D-010)

**Contexto:** D-008 y D-010 dejaron para el hito 3 cómo escribir en `docs/` los pasos del mapa, el tipo y el "frena" de las `Q-n` y las listas. La revisión de los `docs/` reales y del lector del Gestor (`research/formato-documentacion.md`) mostró que casi todo ya se puede leer; faltan los pasos de los hitos que no son de construcción, el tipo de cada pregunta y la forma de las listas.

**Opciones consideradas (pasos de los hitos 0 a 6, 8 y 9):**
1. El portón: cada documento de hito termina con su checklist de salida, marcada a medida que se cumple.
2. Una tabla de pasos propia en cada documento — más detalle, pero más trabajo y más variación entre proyectos.
3. Solo el estado del hito, sin pasos.

**Decisión:** opción 1, elegida por el usuario. Además, sin alternativas que valieran la pena:
- Los estados empiezan por una palabra fija (pendiente · en curso · reabierto · bloqueado · aprobada provisional · completo · validado · saltado); lo que sigue es libre.
- Cada `Q-n` lleva como primera línea del contexto `Tipo: <decisión · consulta · prueba · tarea · formulario>` y ` · frena` cuando no deja seguir el Próximo paso. Sin esa línea, es una consulta que no frena.
- Pruebas y tareas: puntos `- [ ]` con sangría dentro del contexto; la respuesta repite cada punto marcado o no, con una nota después de ` — `.
- El formulario de arranque se fija cuando se construya (fuera del MVP).

**Motivo:** el portón ya lo revisa la IA en cada hito, así que escribirlo no suma trabajo y muestra cuánto falta para cerrar. El resto mantiene compatible el visor del Gestor (probado con su lector): nada viejo se rompe y nada nuevo lo confunde.

**Consecuencias:**
- Cambios a la guía, en `Skills` (se suman a los de D-009 y D-010): portón como lista al final de cada documento de hito, palabras de estado, línea `Tipo:`, listas con casillas y la forma de la respuesta. Va con una fecha de formato nueva, para que la auditoría vea qué proyectos quedaron atrás.
- El Gestor no necesita cambios para convivir (D-017); mostrar el tipo o las casillas es una mejora opcional de ese proyecto.
- El Centro lee con tolerancia, como el Gestor: por títulos y nombres de columna, y lo que no entiende lo muestra como texto.
- Este proyecto ya puede escribir sus `Q-n` y sus portones así desde ahora.


---

## D-021 — La IA trabaja sin pedir permisos ni quedarse esperando: lo que necesita del usuario lo deja como `Q-n` y cierra

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 4
- **Estado:** vigente (respuesta a Q-34 › F-2; cambia C-5 y ajusta D-015)

**Contexto:** F-2 diseñaba cómo responder, en medio de una sesión, los permisos y las preguntas con opciones de la IA; mientras tanto la sesión espera sin límite (S-1). Al recorrerlo, el usuario dijo que no quiere tener la IA parada esperándolo, que no pasa nada si tiene que cerrar su iteración para preguntar, y que usa (y cree que siempre va a usar) el modo *bypass permissions*.

**Opciones consideradas:**
1. Sesiones sin pedidos de permiso (*bypass*) y sin preguntas en el chat: lo que la IA necesita del usuario lo escribe como `Q-n` y cierra su iteración.
2. Como estaba: permisos y preguntas en la ventana; la sesión espera la respuesta.
3. Un modo intermedio (acepta ediciones, o un clasificador decide): pregunta menos, pero igual puede quedar esperando.

**Decisión:** opción 1, elegida por el usuario.
- Todas las sesiones del Centro corren en modo *bypass*.
- La herramienta de preguntas con opciones queda desactivada en el Centro. Cada sesión recibe la instrucción de anotar lo que necesita como `Q-n` en `estado.md` y cerrar la iteración (estado al día y **Próximo paso**), como ya pide la guía.
- Si igual llega un pedido de permiso (Claude Code protege algunas rutas aun en este modo; se confirma en el hito 5), la sesión no espera: se rechaza solo, con un mensaje que le pide a la IA anotarlo como `Q-n`.
- Los estados de una sesión quedan en tres: trabajando · terminada · error. Ya no existe «te espera».

**Motivo:** una sesión esperando frena el proyecto sin que se note (es una de las señales de que el Centro no funciona, `02-definicion.md` › Criterios de éxito). Cerrar la iteración deja todo escrito, no gasta uso mientras el usuario no responde y se retoma con **Seguí**.

**Consecuencias:**
- C-5 pasa a «La IA trabaja sin pedir permisos ni esperarlo; lo que necesita lo deja como `Q-n`» (`02-definicion.md`). En `04-ux.md`: H-2, H-5, F-2, F-6, W-3 y W-4.
- Seguridad: la IA ejecuta y borra sin preguntar. Los resguardos son git en cada proyecto y poder frenarla, por eso Q-35 (Detener) pesa más. Cambia el requisito de permisos de `perfil-proyecto.md` (el nivel sigue en P2).
- Elegir otro modo de permisos por proyecto queda como idea para después, si algún día hace falta.
- Hito 5: cómo se pasa la instrucción a cada sesión y qué pedidos pueden llegar igual en *bypass*.

---

## D-022 — Pendientes por proyecto con el contexto completo, avisos dentro de la app y Proyectos en una sola grilla

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 4
- **Estado:** vigente, salvo el color de cada estado en Proyectos, reemplazado por D-034, y el orden por estado, reemplazado por D-136 (respuesta a Q-34 › F-3, W-2 y W-5; ajusta D-010 y D-020; la lectura de W-5, confirmada en Q-36)

**Contexto:** W-5 era una bandeja con todas las `Q-n` de todos los proyectos en una lista plana, con el detalle de una a la vez y el contexto como enlaces. W-2 agrupaba los proyectos en secciones plegables, como el Gestor. El usuario pidió, para F-3: íconos a la izquierda, al lado una columna angosta de pendientes por proyecto y, en el área grande, el detalle de cada proyecto (no de una pregunta a la vez), con todo lo necesario para decidir ahí mismo y, si hace falta, un panel a la derecha. Para W-5: que no le interesa una bandeja completa, que le alcanza con avisos dentro de la app y con moverse entre proyectos sin recargar ni cortar sesiones. Para W-2: que ahora hay más lugar y se puede agrupar sin el anidamiento de pausado, archivado y en rescate, quizás solo con colores.

**Opciones consideradas (Proyectos):**
1. Una sola grilla ordenada por estado, con el color del estado y su nombre en cada tarjeta.
2. Una columna por estado, una al lado de la otra — se ve el reparto, pero los estados con un solo proyecto desperdician una columna.
3. Grupos plegables, como estaba.

**Decisión** (respuestas del usuario en el chat):
- **Pendientes** (antes Bandeja) se arma por proyecto. Junto a los íconos, una columna angosta con los proyectos que tienen pendientes, los que frenan primero. En el área grande, todos los pendientes del proyecto elegido, uno debajo del otro, cada uno con todo lo necesario para decidir: las secciones y decisiones que cita se ven ahí mismo, sin ir a buscarlas.
- Un **panel derecho**, cerrado salvo que se pida, muestra un documento entero; más adelante, lo de Diseño (el lienzo).
- Con los pendientes respondidos, **Seguí** desde ahí arranca la sesión del proyecto sin abrirlo.
- **No hay bandeja de avisos.** Alcanzan avisos dentro de la app cuando una sesión termina, deja preguntas nuevas o falla, y la barra de sesiones para ir a cada proyecto sin recargar ni cortar nada. C-51 pasa a *Must*, solo dentro de la app; los avisos de Windows siguen para después.
- **Proyectos:** opción 1. Sin grupos plegables; cada tarjeta lleva el color de su estado y el nombre del estado (el color solo no alcanza, `04-ux.md` › Accesibilidad). Los archivados se ocultan con un interruptor.

**Motivo:** responder por proyecto mantiene en la cabeza el contexto de uno solo; ver las citas ahí evita saltar entre documentos para decidir; la ventana del Centro tiene mucho más lugar que el panel del Gestor.

**Consecuencias:**
- `02-definicion.md`: C-21 y C-51, la funcionalidad de pendientes y el glosario.
- `04-ux.md`: H-1, H-9, H-13 (nueva), F-3, W-2, W-4, W-5 y W-6.
- D-010 sigue (pendientes propios, tipo, frena, listas), pero la bandeja se ve por proyecto. D-020 sigue, salvo que Proyectos ya no se ve como el Gestor.
- Hito 5: leer las secciones citadas para mostrarlas dentro; los lectores de códigos y citas del Gestor son la base.
- Q-36 confirmó la sección propia (opción A) frente a una pestaña de pendientes en cada proyecto o las dos cosas.

---

## D-023 — El uso de la suscripción y el contexto de cada sesión, siempre a la vista

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 4
- **Estado:** vigente (respuesta a Q-34 › F-5; C-7 pasa a *Must*)

**Contexto:** F-5 mostraba el uso de la suscripción solo cuando se agotaba; C-7 (ver el uso) era *Could*. El usuario pidió que el porcentaje de uso y el de contexto estén siempre a la vista, y que el de contexto vaya con la conversación de cada sesión.

**Opciones consideradas:**
1. Siempre a la vista: el uso en la barra de arriba y el contexto en cada conversación.
2. Solo cuando se agota, como estaba.
3. En una pantalla de Ajustes.

**Decisión:** opción 1, elegida por el usuario. La barra de arriba muestra el uso de la ventana de 5 horas y de la semana (al pasar el mouse, cuándo se libera cada una). Cada conversación muestra cuánto contexto lleva usado, y se marca cuando pasa el 80 %, que es cuando conviene un chat nuevo.

**Motivo:** varias sesiones gastan el mismo límite (D-015), así que el uso importa en todo momento; el contexto dice cuándo una conversación ya rinde menos.

**Consecuencias:**
- C-7 pasa a *Must* (`02-definicion.md`). En `04-ux.md`: H-12 (nueva), F-5, W-1 y W-3.
- Hito 5: el uso ya llega con cada respuesta (S-1); falta confirmar cómo se lee el contexto de una sesión y cómo se pide el uso al abrir la app sin gastar (`/usage`).

---

## D-024 — El botón «Detener» la IA entra al MVP

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 4
- **Estado:** vigente (responde Q-35; separa de C-4 el frenar a la IA, como C-54)

**Contexto:** frenar a la IA era parte de C-4 (*Should*). Con el modo *bypass* (D-021) la IA ya no pide permisos, así que sin un botón la única forma de frenarla era cerrar la app (F-6).

**Opciones consideradas:**
1. «Detener» entra al MVP; ver qué archivo toca la IA sigue en *Should* con C-4.
2. Queda en *Should* con C-4.

**Decisión:** opción 1, elegida por el usuario. Detener frena la sesión en el acto, sin confirmación; la conversación queda y se retoma con **Seguí**.

**Motivo:** sin pedidos de permiso, es el único freno inmediato; y es poco trabajo, porque el SDK ya permite cortar una sesión.

**Consecuencias:**
- `02-definicion.md`: caso C-54 (*Must*), en la funcionalidad «Vista de un proyecto». `04-ux.md`: H-14, W-3 y Principios de interacción.
- Hito 5: confirmar que cortar una sesión deja la conversación lista para retomar.

---

## D-025 — La frontera con el motor: una interfaz propia, sesiones en *bypass* con la instrucción del Centro, y Detener que no cuenta como error

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 5
- **Estado:** vigente (concreta D-007, D-021 y D-024)

**Contexto:** D-007 pidió definir en el hito 5 el único lugar que habla con el SDK. El hito 4 dejó para acá cómo pasar la instrucción a cada sesión, qué permisos llegan en *bypass*, cómo detener y cómo leer el uso y el contexto sin gastar (`04-ux.md` › Para el hito 5). S-2 lo probó.

**Opciones consideradas:**
1. Una interfaz `Motor` propia, en palabras de la app, y una sola carpeta (`motor/`) que la cumple con el SDK.
2. Usar los tipos del SDK en toda la app — menos código hoy, pero cambiar de motor o de versión toca todo.

**Decisión:** opción 1 (`05-arquitectura.md` › La interfaz `Motor`). Cada sesión se abre en modo *bypass*, con las configuraciones del usuario y del proyecto, sin la herramienta de preguntas con opciones y con una instrucción agregada al sistema: no esperar ni preguntar en el chat, anotar lo que necesite como `Q-n` y cerrar la iteración. Detener corta el turno; la frontera lo traduce a «detenida» (el SDK lo informa como error) y el próximo Seguí le avisa a la IA que fue el usuario.

**Motivo:** S-2 mostró que todo esto funciona con el SDK actual; tenerlo en un solo lugar hace que una versión nueva del SDK o un motor distinto se resuelvan ahí.

**Consecuencias:**
- En *bypass* no llega ningún pedido de permiso: el SDK ni consulta a la app. El rechazo automático de D-021 queda solo como resguardo por si cambia.
- La IA puede escribir en `.git/` y `.claude/` sin preguntar; los resguardos siguen siendo git y Detener (`perfil-proyecto.md`).
- El uso se pide con un método experimental del SDK; si cambia, llega con cada respuesta.

---

## D-026 — El código del Gestor se copia al Centro, no se comparte como paquete

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 5
- **Estado:** vigente (resuelve el riesgo de `research/codigo-gestor.md`)

**Contexto:** el Centro se lleva los lectores de la guía del Gestor, con sus pruebas (`research/codigo-gestor.md`). Quedó para el hito 5 si se copian o se comparten en un paquete común.

**Opciones consideradas:**
1. Copiarlos, anotando de qué versión del Gestor sale cada archivo.
2. Un paquete compartido que usen los dos — un solo lector, pero obliga a reorganizar el Gestor, que solo recibe mantenimiento (D-013).

**Decisión:** opción 1.

**Motivo:** el Gestor no se toca desde acá y va a retirarse o quedar como acceso rápido (D-017); armar un paquete común es trabajo para algo que se apaga. La guía cambia de formato pocas veces y con fecha.

**Consecuencias:**
- Mientras convivan, un cambio de formato de la guía se aplica en los dos (ya previsto en D-017).
- Las 217 pruebas del Gestor se copian con el código.

---

## D-027 — Una conversación usada hace poco fuera del Centro se avisa antes de retomarla

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 5
- **Estado:** vigente (resuelve `04-ux.md` › W-3 › Extremos)

**Contexto:** el Centro y VS Code guardan las conversaciones en el mismo lugar. S-2 mostró que el SDK deja abrir la misma conversación dos veces a la vez y que las dos escriben en el mismo historial, que queda mezclado. Claude Code no tiene un candado que lo impida.

**Opciones consideradas:**
1. Dentro del Centro, una sola sesión por proyecto; y si la última conversación se tocó hace menos de 10 minutos fuera del Centro, avisar antes de retomarla y ofrecer **Nueva**.
2. Seguí siempre empieza una conversación nueva — nunca se pisan, pero se pierde el contexto de la anterior.
3. Sin aviso — lo más simple; el historial puede mezclarse sin que se note.

**Decisión:** opción 1.

**Motivo:** cubre el caso real (dejar VS Code abierto con la misma conversación) sin perder el contexto en el uso normal.

**Consecuencias:**
- El Centro guarda qué conversaciones empezó (resumen de sesión, `05-arquitectura.md` › Modelo de datos) para saber de dónde viene cada una (W-3).
- Si VS Code abre una conversación que el Centro tiene en curso, el Centro no se entera; es un riesgo aceptado.

---

## D-028 — El Centro se construye con Electron, TypeScript y React

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 5
- **Estado:** vigente (responde Q-38)

**Contexto:** el hito 5 tenía que elegir la tecnología: app de escritorio en Windows que no cierre Linux, con el Agent SDK y el código del Gestor (`05-arquitectura.md` › Opciones de stack).

**Opciones consideradas:**
1. Electron + TypeScript + React — el SDK corre adentro (S-2), se lleva el código del Gestor, misma base que otras apps; pesa ~100 MB.
2. Tauri + TypeScript + React — más liviana, pero necesita un Node aparte para el SDK y suma Rust.
3. App web local en el navegador — depende de un servidor corriendo y de lo que permita el navegador.

**Decisión:** opción 1, elegida por el usuario. Preguntó si Claude Desktop y Codex Desktop están hechas con Electron: sí, las dos.

**Motivo:** es la única donde todo lo que ya existe encaja sin piezas extra; el peso no importa en una PC personal.

**Consecuencias:**
- Resto del stack, estructura del repo y despliegue: `05-arquitectura.md` (React 19, Zustand, Zod, markdown-it, Vitest, Playwright, Biome, pnpm, electron-builder).
- En la primera iteración se prueba el SDK dentro del instalador.

---

## D-029 — Dirección visual: cálida y tranquila, solo tema oscuro, design system propio con `impeccable`

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 6
- **Estado:** vigente salvo «cálida», reemplazada por D-032 (responde Q-40, Q-41 y Q-42)

**Contexto:** primeras preguntas del hito 6, adelantadas mientras se cerraba el 5.

**Opciones consideradas:**
- Sensación: sobria y técnica · cálida y tranquila · con personalidad propia.
- Tema: los dos siguiendo a Windows · solo oscuro · solo claro.
- Base: propia con `impeccable` · partir de otra app · partir de otra app.

**Decisión** (elegida por el usuario): cálida y tranquila (como Claude Desktop), **solo tema oscuro**, design system propio armado con `impeccable`.

**Motivo:** es la app donde el usuario pasa más tiempo; un solo tema simplifica el diseño y las pruebas de contraste.

**Consecuencias:**
- El hito 6 arranca con `PRODUCT.md` desde `docs/` y la dirección visual con `impeccable`; `06-ui.md` enlaza a `DESIGN.md`.
- El contraste se verifica solo en oscuro. Un tema claro, si algún día hace falta, sería un cambio de tokens.
- No dio referencias además de Claude Desktop: se proponen en el hito 6.

## D-030 — Mundo visual «Manual con pestañas»: el color es del hito y el estado se marca con la forma de la línea

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 6
- **Estado:** reemplazada por D-031 (completaba D-029)

**Contexto:** con `PRODUCT.md` aprobado, `impeccable` propuso direcciones cálidas y oscuras para la vista de un proyecto (W-3): Tenmoku y celadón (taller de cerámica), Libro de obra (dirección de obra), Manual con pestañas, Raya de emisión, la estándar «como Claude Desktop» y cuatro descartadas (grilla de Crouwel, catálogo Factory, mapa de orientación, billetera de pasajes). Al usuario le gustaron el Manual y la Raya.

**Opciones consideradas:**
1. Manual con pestañas solo: muy claro, pero el color por hito compite con el color del estado y es poco tranquilo.
2. Raya de emisión sola: la más tranquila y accesible, pero fría.
3. Manual de base con el estado como forma de línea de la Raya (recomendada).

**Decisión** (elegida por el usuario): opción 3. El proyecto se ve como un manual abierto en su hito: fondo oscuro cálido, hojas de lectura algo más claras, y un riel de pestañas en el borde derecho con un color apagado por hito, alto según el largo del hito. El color identifica al hito; el estado (trabajando, frena, pendiente, detenido, error) se marca con la forma de la línea (llena, doble, cortada, tachada) y siempre con su palabra.

**Motivo:** la guía de hitos ya es un manual por secciones; el riel de pestañas hace del mapa del plan una navegación que se ve siempre. Separar color (hito) y forma (estado) resuelve el punto débil del Manual y cumple «el estado nunca solo por color».

**Consecuencias:**
- Contrato de dirección en el brief de superficie de `docs/ui/vista-proyecto.html` (`.impeccable/`); `DESIGN.md` se escribe al terminar la primera pantalla, desde lo construido.
- Sin generación de imágenes en esta PC: se construye directo en código (prototipo HTML en `docs/ui/`), sin bocetos previos.
- El nombre definitivo se propone después de ver la primera pantalla (Q-32).

## D-031 — La forma de VS Code con grises cálidos; la conversación sola y el mapa en un panel desplegable

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 6
- **Estado:** vigente en la disposición; los colores y la tipografía, reemplazados por D-032 (reemplaza D-030; ajusta D-020 y dónde se ve el uso de D-023; responde Q-43)

**Contexto:** el prototipo del Manual con pestañas (D-030) le gustó al usuario, pero lo sintió demasiado cargado: no conseguía enfocarse en lo importante (Q-43). Pidió probar algo más tipo VS Code.

**Opciones consideradas:**
1. La forma de VS Code con grises apenas cálidos y un solo acento suave (recomendada).
2. VS Code tal cual, con sus grises neutros y su azul.
Y para la vista de un proyecto: conversación con un mapa chico al costado · solo la conversación con el mapa desplegable · como el wireframe W-3.

**Decisión** (elegida por el usuario): opción 1, y **solo la conversación a la vista; el mapa y los docs, en un panel desplegable**. El área principal siempre es la grande y el panel derecho el angosto, aunque se intercambie qué va en cada uno; el panel se puede ensanchar.

- Marco como VS Code: barra de actividad a la izquierda (Proyectos, Pendientes, Ajustes); las sesiones abiertas como pestañas arriba (la del proyecto abierto, marcada); una barra de estado fina abajo con el estado de la sesión, el hito, el contexto y el uso (5 h y semana); los avisos abajo a la derecha.
- Casi todo gris; el color solo avisa: ámbar para lo que espera del usuario (y el foco), verde para hecho, rojo para error, siempre con ícono y palabra.
- El mapa es un árbol, como el explorador de VS Code: los hitos con su estado y el hito en curso abierto con sus pasos.
- Las herramientas que usó la IA se pliegan en una línea («Usó 4 herramientas»).
- Tipografía del sistema: Segoe UI y Cascadia Mono, como VS Code en Windows.

**Motivo:** el usuario conoce de memoria la forma de VS Code y la usa todo el día; lo que necesita es poder enfocarse en la conversación. Los grises cálidos mantienen D-029 y lo distinguen de VS Code cuando están los dos abiertos.

**Consecuencias:**
- `04-ux.md` › W-1, W-3 y W-4 ajustados: sesiones como pestañas arriba, uso en la barra de estado, panel desplegable (`Ctrl+B`).
- Segoe UI no existe en Linux: si llega una versión para Linux (Q-30), se elige una tipografía equivalente.
- El prototipo nuevo reemplaza al anterior en `docs/ui/vista-proyecto.html` (el anterior queda en el historial de git).

## D-032 — Estilo «F4 Tarjetas»: casi negro con verde de fósforo, Chakra Petch y tarjetas suaves

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 6
- **Estado:** vigente (responde Q-44 a Q-47; reemplaza los colores y la tipografía de D-031 y «cálida» de D-029)

**Contexto:** con la disposición de VS Code aprobada (D-031), al usuario no lo convencían los grises cálidos. Sumó tres referencias en `imagenes de prueba/` (consola de uso pixelada, centro de mando neón, diario en terminal) y el estilo se afinó en tres rondas (`docs/ui/alternativas/`): de las cuatro alternativas de la ronda 1 eligió partir de la síntesis (D) con la letra del centro de mando (B), por legibilidad; de la ronda 2, la versión en calma (E4) con piezas de la de paneles suaves (E3) y sin brillo de fondo; de la ronda 3, F4.

**Opciones consideradas:** ronda 1: A consola pixel, B centro de mando, C diario terminal, D síntesis. Ronda 2: E1 a E4. Ronda 3: F1 redondeada, F2 medidores finos, F3 rótulos, F4 tarjetas. El detalle está en `06-ui.md`.

**Decisión** (elegida por el usuario): **F4 Tarjetas**.
- Casi negro con un tinte verde y un solo verde de fósforo para lo activo; ámbar para lo que espera del usuario, rojo para error, siempre con ícono y palabra.
- Chakra Petch para todo lo que se lee (interfaz y conversación); JetBrains Mono solo para códigos, rutas y números.
- Rótulos, chips y botones en minúscula normal, sin efectos de brillo ni rayas.
- Esquinas redondeadas; el pedido de la IA y el campo para escribir como tarjetas suaves con un fondo apenas teñido; medidores de uso finos con un brillo leve; la fila seleccionada del mapa, redondeada.

**Motivo:** el usuario quería la estética de consola de sus referencias, pero legible para usarla todo el día: la letra de B se lee mejor que una monoespaciada, y la calma de E4 evita que todo grite.

**Consecuencias:**
- Deja de ser «cálida» (D-029): sigue siendo solo oscura, tranquila y con design system propio.
- `docs/ui/vista-proyecto.html` pasa a F4; las rondas quedan en `docs/ui/alternativas/` como registro.
- Las fuentes (OFL) se guardan en `docs/ui/fuentes/` y van empaquetadas en la app (todo local).
- Próximo: revisión final de `impeccable`, `DESIGN.md` y nombre definitivo (Q-32).

## D-033 — La app se llama «Iridium»

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 6
- **Estado:** vigente (reemplaza D-002; responde Q-48)

**Contexto:** con la vista de proyecto revisada y `DESIGN.md` escrito, tocaba elegir el nombre (D-002 lo dejó para el hito 6, con la identidad visual).

**Opciones consideradas:** Fósforo (recomendada), Mando, Bitácora, Rumbo, otro nombre o seguir con «Centro de Desarrollo».

**Decisión** (elegida por el usuario, en Otro): **Iridium**, de iridio. «Por ahora»: se puede revisar más adelante sin costo.

**Motivo:** suena bien. No describe la función, y no hace falta: es un nombre propio, corto y que no choca con los otros proyectos (de paso, hace familia de elementos con otro proyecto).

**Consecuencias:**
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, el `README.md` y la ficha del proyecto pasan a Iridium.
- La carpeta sigue siendo `Centro de Desarrollo`: renombrarla cambia la tarjeta del Gestor y las rutas de VS Code y de la memoria de Claude, así que se hace solo si el usuario lo pide.
- En la interfaz el nombre todavía no aparece (la marca de la barra de actividad es un ícono); un logo, si hace falta, se ve con las otras pantallas.

## D-034 — En Proyectos, el estado de cada tarjeta va con ícono y palabra, sin color propio

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 6
- **Estado:** vigente (ajusta D-022; responde Q-49)

**Contexto:** D-022 y el boceto de `04-ux.md` › W-2 daban a cada estado de proyecto un color de borde, con su nombre. El estilo F4 (D-032, `DESIGN.md`) tiene solo tres señales de color y las reserva para avisar: verde activo, ámbar espera al usuario, rojo error. Siete colores de estado competirían con esas señales.

**Opciones consideradas:**
1. Un color por estado, como decía D-022 — rompe las tres señales de `DESIGN.md`.
2. Ícono y palabra para cada estado; solo «en desarrollo» en verde, por ser lo activo (recomendada).

**Decisión** (aprobada por el usuario al ver `docs/ui/vista-proyectos.html`): opción 2. El ámbar de la tarjeta queda para las preguntas sin responder y el rojo para la sesión con error o la ficha dañada.

**Motivo:** el usuario mira primero qué lo espera; si los estados también tuvieran color, el ámbar de las preguntas se perdería entre los demás.

**Consecuencias:**
- `04-ux.md` › W-2: el borde de color pasa a ícono y palabra.
- `06-ui.md` › Cómo se resolvió W-2 describe la tarjeta.

## D-035 — El Mapa muestra el estado del proyecto y Docs es un lector liviano

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 6
- **Estado:** vigente (precisa D-008 y D-031 para W-7 y W-8; responde Q-51 a Q-53)

**Contexto:** el Mapa como árbol dejaba vacía el área grande; con un panel de detalle al costado repetía lo que ya está en Docs. Docs estaba demasiado cargada (las secciones de todos los documentos, enlaces verdes por todas partes). La revisión está en `06-ui.md` › Revisión del propósito de Mapa, Docs y Pendientes.

**Opciones consideradas:** Mapa: estado del proyecto (recomendada), solo el árbol, o sin pestaña. Docs: lector liviano (recomendada) o como estaba con menos ruido. Pendientes: la respuesta primero o como está.

**Decisión** (elegida por el usuario):
- **Mapa = estado del proyecto.** Responde «¿en qué va y qué sigue?». Una línea con los hitos (tocar uno lo muestra) y, debajo, el hito actual: próximo paso, pasos, lo que te espera y lo último de la IA. No muestra secciones ni decisiones: eso es Docs.
- **Docs = lector liviano.** Responde «¿qué dice tal cosa?». Elegir documento y «En esta página» son menús arriba; la hoja va centrada con su ancho elegible (Q-51); los enlaces van en el color del texto, subrayados con puntos, y el verde queda para lo activo; las tablas de más de seis filas arrancan plegadas.
- **Pendientes queda como está** (el usuario se retractó de cambiarla).

**Motivo:** cada área responde una sola pregunta; así no se repiten y cada una se lee de un vistazo.

**Consecuencias:**
- `04-ux.md` › W-7 y W-8: el árbol y la lista lateral de documentos pasan a esta forma.
- `docs/ui/vista-mapa-docs.html` se rehízo; las versiones anteriores quedan en el historial de git.

## D-036 — La app de uso diario es una carpeta con el ejecutable y un acceso directo, sin instalador

- **Fecha:** 2026-10-23
- **Ámbito:** general
- **Hito o paso:** 7 (I-1)
- **Estado:** vigente (precisa `05-arquitectura.md` › Despliegue)

**Contexto:** la arquitectura pedía «un instalador de Windows con electron-builder, como otra app». otra app en realidad no usa instalador: arma una carpeta con el ejecutable y crea un acceso directo en el escritorio. El riesgo a probar en I-1 era que el SDK, que trae su propio Claude Code (un `claude.exe` de 300 MB), funcione desde la app armada.

**Opciones consideradas:**
1. Carpeta con el ejecutable y acceso directo, como otra app (elegida) — se arma en un minuto; una versión nueva se arma encima de la anterior; nada que desinstalar.
2. Instalador clásico (NSIS) — se instala en la carpeta de programas del usuario y aparece en el menú Inicio, pero comprimir 650 MB tarda varios minutos en cada versión y no suma nada para una sola PC.

**Decisión:** opción 1. `pnpm dist` arma `release/win-unpacked/Iridium.exe`; `pnpm acceso-directo` crea el acceso en el escritorio (`scripts.md`). El `claude.exe` del SDK queda fuera del archivo comprimido de la app (`app.asar.unpacked`) y la app le indica al SDK dónde está.

**Motivo:** es lo mismo que ya funciona en otra app y cumple lo que importa: abrir la app de uso diario con doble clic y actualizarla sin pasos extra.

**Consecuencias:**
- Probado en I-1: desde la app armada, la grilla aparece en 1,8 a 2,9 s y el motor verifica la sesión y la suscripción sin mandar mensajes.
- Para actualizar hay que cerrar Iridium antes de `pnpm dist` (Windows no deja reemplazar un programa abierto).
- 2026-10-29: `pnpm actualizar` (`tools/actualizar.ps1`) lo resuelve solo: arma con Iridium abierto, lo cierra (espera también al Claude Code de sus sesiones), pone la versión nueva y lo vuelve a abrir. Se puede lanzar desde la sección Scripts de Iridium porque la consola no depende de la app.
- 2026-11-01 (CO-I2, D-070): ya no lo cierra. Arma en `release/nueva` y la versión nueva entra al cerrar Iridium o con Reiniciar ahora (`modulos/compartir/diseno-tecnico.md` › Versión nueva lista).
- Si algún día hace falta un instalador (otra PC, el menú Inicio), se agrega un destino a `electron-builder.yml` sin tocar la app.

## D-037 — Cada sesión de la IA se cierra al terminar su turno y se reabre con la misma conversación

- **Fecha:** 2026-10-24
- **Ámbito:** general
- **Hito o paso:** 7 (I-2)
- **Estado:** vigente (precisa `05-arquitectura.md` › La interfaz `Motor`)

**Contexto:** cada sesión del SDK es un Claude Code abierto (un proceso de 150 a 300 MB). Con una sesión por proyecto (D-015) y varios proyectos en el día, dejarlas abiertas entre un turno y otro llenaría la memoria de procesos que no hacen nada, porque ninguna sesión espera al usuario (D-021).

**Opciones consideradas:**
1. La sesión se cierra sola cuando termina el turno y no queda nada en cola; el próximo mensaje abre otra que retoma la misma conversación (elegida) — solo hay un Claude Code abierto por proyecto mientras trabaja.
2. La sesión queda abierta hasta cerrar la ficha o la app — el siguiente mensaje arranca un segundo antes, pero cada proyecto tocado en el día deja un proceso abierto.

**Decisión:** opción 1. Lo que el usuario escribe mientras la IA trabaja se suma al turno en curso (la sesión sigue abierta hasta terminarlo). Después de Detener, la sesión también se cierra; el próximo mensaje le avisa a la IA que fue el usuario quien la detuvo.

**Motivo:** la conversación se guarda en el historial de Claude Code y se retoma entera (probado en S-2 y en I-2 con el motor real: retomar tarda alrededor de un segundo). El costo es ese segundo; la ganancia, que una PC con cinco proyectos en el día no tenga cinco Claude Code abiertos sin hacer nada.

**Consecuencias:**
- La ficha «terminada» no tiene un proceso detrás: cerrarla o no, no cambia la memoria.
- Para saber si una conversación la tocó VS Code (D-027), Iridium anota cuándo terminó cada turno en `sesiones.json`.

## D-038 — Sin rechazo automático de permisos: en *bypass* el SDK no los consulta

- **Fecha:** 2026-10-24
- **Ámbito:** general
- **Hito o paso:** 7 (I-2)
- **Estado:** vigente (cambia `04-ux.md` › H-5 y `05-arquitectura.md` › Seguridad)

**Contexto:** H-5 pedía que, si igual llegaba un pedido de permiso, se rechazara solo con un mensaje para la IA. S-2 mostró que en *bypass* no llega ninguno. Con la versión fija del SDK (0.3.309), el propio SDK avisa al arrancar que en *bypass* nunca consulta a la app: la función que rechazaría los permisos no se llama jamás.

**Opciones consideradas:**
1. Quitar el rechazo automático (elegida) — no hay código que nunca se ejecuta ni el aviso del SDK en cada sesión.
2. Dejarlo «por si cambia» — es código muerto, y si el SDK cambia, la prueba real que se hace al actualizarlo (`05-arquitectura.md` › Convenciones) lo muestra.

**Decisión:** opción 1. El criterio de H-5 sobre los pedidos de permiso queda sin efecto mientras el SDK se comporte así.

**Motivo:** el resguardo real ya está: la IA anota lo que necesita como `Q-n` por la instrucción del Centro (probado en I-2 con el motor real: ante una decisión del usuario, escribió la `Q-n` y cerró), git en cada proyecto y Detener.

**Consecuencias:** si una versión nueva del SDK vuelve a consultar permisos, se agrega el rechazo en la frontera (`motor/sdk.ts`) sin tocar el resto.

## D-039 — Lo guardado «a medias» queda en los datos de Iridium, fuera del proyecto

- **Fecha:** 2026-10-25
- **Ámbito:** general
- **Hito o paso:** 7 (I-3)
- **Estado:** vigente (precisa `04-ux.md` › W-6 y `05-arquitectura.md` › Responder una pregunta)

**Contexto:** W-6 pide «Guardar a medias» para las pruebas largas: la respuesta queda guardada pero la IA no la procesa. La guía no tiene una forma de marcar una respuesta como borrador: todo lo que está en `docs/respuestas/Q-n.md` la IA lo toma como respondido, y el gestor anterior también.

**Opciones consideradas:**
1. Guardarlo en `borradores.json`, en la carpeta de datos de Iridium (elegida) — la IA y el Gestor no lo ven; no hace falta cambiar la guía.
2. Escribir `docs/respuestas/Q-n.md` con una marca «a medias» — viaja con el proyecto, pero hay que enseñarle la marca a la guía, a la IA y al Gestor; mientras tanto, la tomarían como respondida.

**Decisión:** opción 1. Enviar escribe la respuesta en el proyecto y borra lo guardado a medias. Si la IA cambia la pregunta, lo guardado deja de valer.

**Motivo:** es lo único que cumple «la IA no lo procesa» sin tocar otros proyectos; Iridium es local, así que lo guardado sigue ahí al volver a abrirla.

**Consecuencias:**
- Lo que está a medias solo se ve en Iridium, en esta PC; desde el Gestor esa pregunta figura sin responder.
- Lo escrito y todavía no guardado vive en la ventana: no se pierde al cambiar de proyecto o de sección, pero sí al cerrar la app.

## D-040 — Nueva abre una conversación en blanco; no arranca Seguí sola

- **Fecha:** 2026-10-28
- **Ámbito:** general
- **Hito o paso:** 7 (I-3, por Q-59)
- **Estado:** vigente (cambia `04-ux.md` › Flujo F-1 y W-3)

**Contexto:** en I-2, **Nueva** empezaba una conversación nueva que arrancaba en el acto con «Seguí». El usuario quiere abrir un chat vacío en un proyecto, como en VS Code, para dejar una idea o una consulta aparte sin que la IA haga el próximo paso.

**Opciones consideradas:**
1. Nueva muestra una conversación en blanco: empieza con el primer mensaje que se escribe o con **Seguí**; **Volver a la anterior** la descarta (elegida).
2. Dejar Nueva como estaba y sumar un tercer botón «Vacía» — dos botones casi iguales.

**Decisión:** opción 1. Nueva no manda nada al modelo hasta que el usuario escribe o toca Seguí.

**Motivo:** es lo que pidió el usuario y lo que hace VS Code; Seguí sigue a un toque en la conversación en blanco.

**Consecuencias:**
- Tocar Nueva por error no gasta uso ni corta nada.
- Mientras no se escribe, la conversación anterior sigue siendo la del proyecto: al salir y volver, la vista en blanco sigue ahí hasta que se escriba o se vuelva a la anterior (vive en la ventana, como el resto de la vista).

## D-041 — Tres paneles: secciones del proyecto, vista principal y conversación; barra de título propia

- **Fecha:** 2026-10-28
- **Ámbito:** general
- **Hito o paso:** 7 (entre I-3 e I-4)
- **Estado:** vigente (reemplaza la disposición de D-031; ajusta D-020 y `04-ux.md` › Arquitectura de información, W-1, W-3, W-7 y W-8; suma C-55 a C-57)

**Contexto:** con la conversación al centro y el Mapa y los Docs en un panel desplegable (D-031) no entraba bien lo que viene: el design system (C-31), los prototipos (C-32, C-34), los scripts (C-11). El usuario propuso darle el área grande a lo que mira y dejar la conversación al costado, como Claude en VS Code, que es como trabaja todo el día.

**Opciones consideradas:**
1. Tres paneles: la barra de íconos con las secciones del proyecto, la vista principal y la conversación a la derecha (elegida, propuesta por el usuario).
2. Mantener D-031 y sumar pestañas al panel desplegable.
Y para dar lugar a la conversación: llevarla al centro como «modo foco» o ensanchar su panel. El usuario eligió ensancharla: casi siempre está mirando otra cosa en el centro.

**Decisión:**
- **Barra de título propia** (sin el marco de Windows): las pestañas de las sesiones abiertas van en ella y se ahorra una fila. Los botones minimizar, maximizar y cerrar los dibuja Windows dentro de esa barra, así siguen el menú para acomodar ventanas y el arrastre a los bordes.
- **El botón de arriba a la izquierda** (la marca, en el cruce de la barra de título y la de íconos) abre el inicio, con el número de preguntas sin responder en ámbar.
- **La barra de íconos cambia según dónde se esté.** En el inicio: Proyectos y Pendientes (Pendientes queda como hoy, ahora como sección del inicio). Dentro de un proyecto: Mapa, Docs, Archivos, Git y Scripts; después se suman Diseño y Assets. Ajustes, abajo.
- **La vista principal** muestra la sección elegida. Scripts, en el MVP, es `scripts.md` en el lector; los botones son C-11.
- **La conversación va siempre a la derecha**, en todas las secciones del proyecto; se ensancha arrastrando su borde y la app recuerda el ancho. En su barra: **conversaciones anteriores** del proyecto (C-57), **Nueva** (D-040) y **Seguí**.
- **Archivos (C-55):** el árbol del proyecto (sin `node_modules` ni `.git`) y un visor de solo lectura: texto con colores, imágenes y markdown.
- **Git (C-56):** solo para mirar. La rama, los cambios sin guardar y el historial; cada commit (y los cambios sin guardar) con la lista de sus archivos; el antes y después de un archivo se ve solo al elegirlo, como en VS Code (Q-61). Sin botones de acción: guardar y subir lo hace la IA cuando se lo pide el usuario.

**Motivo:** cada sección nueva es un ícono más, sin rediseñar; el contenido gana el área grande y la conversación queda en el lugar al que el usuario está acostumbrado. Archivos y Git le dan control para mirar «bajo el capó» sin tener que abrir VS Code.

**Consecuencias:**
- Ya no hay intercambio de paneles ni panel desplegable (`Ctrl+B`) en la vista del proyecto.
- El plan cambia: I-4 arma el marco nuevo con Mapa, Docs, Archivos y las conversaciones anteriores; I-5 es Git; lo que era I-5 (uso, avisos y errores) pasa a I-6.
- Prototipo: `ui/vista-proyecto.html` se rehízo (el anterior queda en el historial de git); Pendientes sigue en `ui/vista-pendientes.html`.
- Una ventana sin marco necesita su zona de arrastre y no se puede mover desde las pestañas mismas; queda el espacio libre de la barra.

## D-042 — Archivos colorea el código con un lector propio y un color nuevo del design system para las cadenas

- **Fecha:** 2026-10-28
- **Ámbito:** general (design system)
- **Hito o paso:** 7 (I-4)
- **Estado:** vigente (completa D-041 › Archivos y H-15)

**Contexto:** H-15 pide ver los archivos «con colores y números de línea». El design system no tenía colores para código: The Color Avisa Rule reserva el verde, el ámbar y el rojo para el estado. El prototipo aprobado (Q-61) ya coloreaba con tres tonos: comentarios en gris, palabras clave en verde texto y cadenas en un ocre (`#c9b77a`).

**Opciones consideradas:**
1. Un lector propio, chico, que reconoce comentarios, cadenas, números y palabras clave de los lenguajes comunes (TypeScript, JSON, CSS, HTML, Markdown, Python, PowerShell, YAML), con el ocre del prototipo como token nuevo (elegida).
2. Una librería de colores (highlight.js o Shiki): más lenguajes y más fiel, pero una dependencia más (P2: cada dependencia se audita) y otro juego de colores que no sale del design system.

**Decisión:** opción 1, tomada por la IA siguiendo el prototipo aprobado. El token `--cod-cadena` se usa solo en el visor de Archivos; no es un color de estado. El lector arma el HTML de cada línea en el proceso principal y lo escapa, como el de los documentos.

**Motivo:** alcanza para leer el código «bajo el capó» sin abrir VS Code, sin dependencias nuevas y con los colores que el usuario ya aprobó.

**Consecuencias:**
- `DESIGN.md`, `.impeccable/design.json` y `ui/tokens.css` suman `cod-cadena`.
- Un lenguaje que no reconoce se ve como texto, sin colores. Si algún día hace falta más fidelidad, se cambia el lector sin tocar la ventana.

## D-043 — Un proyecto abre en sus pendientes y scripts; los scripts son botones; las pestañas de los proyectos abiertos quedan

- **Fecha:** 2026-10-28
- **Ámbito:** general
- **Hito o paso:** 7 (I-4, ajustes del usuario a la primera versión)
- **Estado:** vigente (ajusta D-041 › barra de íconos y pestañas; pasa C-11 de *Should* a *Must*)

**Contexto:** al ver I-4, el usuario pidió tres cambios: entrar a un proyecto y ver primero lo que tiene pendiente y los scripts, «para tener control de lo que tengo pendiente y decidir si debo actualizar la app»; que los scripts sean botones que los ejecuten, no texto para copiar a la consola; y que los proyectos que abre queden en las pestañas aunque no trabajen.

**Decisión** (pedida por el usuario):
- **Pendientes y scripts es la vista de entrada** de cada proyecto y el primer ícono de su barra (con el número de preguntas sin responder): a la izquierda, los pendientes del proyecto para responder ahí mismo (los de W-5); a la derecha, los scripts. Scripts deja de ser una sección aparte; `scripts.md` se sigue leyendo en Docs.
- **Los scripts son botones (C-11, ahora *Must*):** **Ejecutar** corre el comando en una ventana de consola propia, a la vista, que queda abierta para leer lo que pasó; un archivo del proyecto (un instalador, un `.exe`) o **Abrir** se abren con Windows. El comando se busca de nuevo en `docs/scripts.md` al tocar el botón: la ventana no manda comandos. Si falta un archivo o una carpeta, el botón queda apagado y lo dice.
- **Pestañas:** cada proyecto que se abre queda como pestaña, también al volver a abrir la app, hasta cerrarla con ×. Muestran si la IA trabaja, si falló, cuántas preguntas esperan al usuario, «Terminada» si terminó sin preguntas y todavía no se vio, o nada.

**Motivo:** la pregunta de todos los días al entrar a un proyecto es «¿qué me espera y qué tengo que correr?»; el Mapa responde otra («¿en qué va?») y queda a un clic.

**Consecuencias:**
- `02-definicion.md`: C-11 pasa a *Must*. `04-ux.md` › W-3 y W-4 se ajustan con una nota.
- Seguridad (P2): Iridium ejecuta lo que dice `docs/scripts.md`, que escribe la IA; siempre a la vista, en una consola, y solo al tocar el botón.
- Armar Iridium desde su propio botón no puede reemplazar la app abierta (Windows bloquea sus archivos): queda en Pendientes reportados.

## D-044 — Los scripts van en lista después de los pendientes y vuelven a tener su sección; los detalles de una pregunta, plegados

- **Fecha:** 2026-10-28
- **Ámbito:** general
- **Hito o paso:** 7 (I-4, ajustes del usuario por Q-62 y Q-63)
- **Estado:** vigente (ajusta D-043 › vista de entrada); los scripts en la vista de entrada, reemplazados por D-125

**Contexto:** al probar I-4 (Q-62), el usuario encontró que la vista de entrada en tres columnas (pendientes, scripts y conversación) no funcionaba: la de scripts le quitaba lugar a los pendientes. Y que cada pendiente mostraba demasiado texto antes de lo que hay que marcar: el contexto y el texto de cada cita, que casi nunca se leen.

**Decisión** (pedida por el usuario):
- **Scripts en lista, después de los pendientes:** en la vista de entrada, los pendientes ocupan el área entera y, a continuación, los scripts en lista: una fila por script con su nombre, la descripción en una línea y su botón, y **Ver con detalles**. (Primero fue una franja fija al pie con los botones; con siete scripts eran tres filas de botones y el usuario la descartó en Q-63.)
- **Scripts vuelve a ser una sección** (último ícono de la barra del proyecto): cada script con su descripción, su botón y, si falta el archivo, por qué está apagado. Llegando desde **Ver con detalles** tiene **Atrás**.
- **El botón lateral del mouse vuelve un paso**, como en el navegador, igual que **Atrás** y `Alt+←`, en cualquier sección del proyecto (Q-63).
- **Detalles plegados:** cada pendiente muestra su código, la pregunta y lo que hay que marcar o elegir; el contexto y las citas con su texto quedan en **Mostrar detalles (contexto y N citas)**, cerrado al entrar. Vale para Pendientes del inicio y para la vista de entrada.
- **Pestañas con el ícono del proyecto** (o su inicial, si no tiene).
- **Cuadros de texto que crecen:** el de la conversación crece con lo que se escribe (hasta un tope, después se desplaza); las notas de Pendientes se vuelven a medir cuando cambia su ancho (al arrastrar el borde de la conversación), así no se corta lo escrito.

**Motivo:** lo que se mira al entrar es «¿qué me espera?»; los scripts se usan, pero no se leen, y el contexto de una pregunta se consulta solo cuando hace falta.

**Consecuencias:**
- `04-ux.md` › W-3 suma una nota. La guía puede pedir puntos de prueba más cortos (acción y resultado), pero el formato de las `Q-n` no cambia: lo que pesaba era cómo se mostraba.

---

## D-045 — La conversación muestra el contexto y elige el modelo y el esfuerzo; el uso queda en la barra de estado

- **Fecha:** 2026-10-28
- **Ámbito:** general
- **Hito o paso:** 7 (al aprobar I-4)
- **Estado:** vigente (responde Q-65; precisa D-023 y H-12)

**Contexto:** el usuario pidió más datos en la conversación, como en la extensión de Claude Code para VS Code: el contexto usado, cuándo se libera el uso, y elegir el modelo y el nivel de esfuerzo. El contexto y el uso ya eran H-12 (I-6); elegir el modelo y el esfuerzo no estaba en la definición.

**Opciones consideradas:**
1. Todo en la barra de la conversación: contexto, uso con cuándo se libera, modelo y esfuerzo.
2. El uso en la barra de estado; la conversación con el contexto, el modelo y el esfuerzo.
3. Modelo y esfuerzo después del MVP.

**Decisión:** opción 2, elegida por el usuario («básicamente la A, pero el uso va afuera del chat porque se comparte en toda la app»):
- **Barra de la conversación:** el porcentaje de contexto usado (marcado pasado el 80 %, con la sugerencia de un chat nuevo) y los selectores de **modelo** y de **nivel de esfuerzo**. Cada proyecto recuerda los suyos; valen desde el próximo mensaje.
- **Barra de estado (al pie):** el uso de la ventana de 5 horas y de la semana, con cuándo se libera cada una (como ya había movido D-031).

**Motivo:** el contexto, el modelo y el esfuerzo son de cada conversación; el uso lo gastan todas las sesiones juntas.

**Consecuencias:**
- Nace C-58 (*Must*, `02-definicion.md`); H-12 cambia sus criterios (`04-ux.md`); entra en I-6.
- En I-6 se confirma con el SDK qué modelos y niveles de esfuerzo ofrece la suscripción y cómo se cambian en una conversación que sigue.

---

## D-046 — La Revisión de la app entra al MVP, antes de I-5 e I-6, como módulo

- **Fecha:** 2026-10-28
- **Ámbito:** general
- **Hito o paso:** 7 (al aprobar I-4)
- **Estado:** vigente (responde Q-66; cambia la prioridad de C-36 a C-39 y el orden de `07-construccion.md`)

**Contexto:** la extensión del navegador para comentar la app en desarrollo (D-012, C-36 a C-39) era *Should*, para después del MVP. El usuario la quiere pronto, para comentar dentro de sus apps en modo desarrollo, como el selector de Claude Design.

**Opciones consideradas:**
1. Como I-7, al terminar el MVP y antes de las dos semanas de uso.
2. Antes de I-5 e I-6.
3. Después de las dos semanas de uso.

**Decisión:** opción 2, elegida por el usuario. C-36 a C-39 pasan a *Must*. Como dice la arquitectura (`05-arquitectura.md` › Puntos de extensión), es un módulo de tipo producto hermano: `docs/modulos/revision/`, con su ciclo reducido (propuesta, definición, investigación, UX, diseño técnico) y sus iteraciones, que se construyen antes de I-5.

**Motivo:** el usuario la va a usar en todos sus proyectos web desde el primer día; Git e I-6 no dependen de ella.

**Consecuencias:**
- `02-definicion.md`: C-36 a C-39 a *Must*. `07-construccion.md`: el módulo va antes de I-5. `estado.md`: tabla de módulos.
- Las dos semanas de uso real siguen arrancando al terminar I-6.


---

## D-047 — La Revisión de la app sirve en web y en Electron desde el principio, con la misma extensión

- **Fecha:** 2026-10-28
- **Ámbito:** módulo Revisión de la app (cambia D-012 en lo de «solo web»)
- **Hito o paso:** 7; módulo Revisión, pasos 2 y 3
- **Estado:** vigente (responde Q-67)

**Contexto:** D-012 dejó la extensión solo para apps web, pero tres proyectos del usuario son Electron (Iridium, otra app, otro proyecto). El spike S-3 probó la misma extensión en Edge y en Electron 44: en Electron carga, lee archivo y línea y le habla a Iridium; solo le falta la captura de la pestaña (`modulos/revision/investigacion.md`).

**Opciones consideradas:**
1. Web y Electron desde el principio, con la misma extensión.
2. Primero web; Electron en una iteración después, dentro del módulo.
3. Solo web, como decía D-012.

**Decisión:** opción 1, elegida por el usuario. En cada app Electron, una línea en modo desarrollo carga la extensión; esa misma pieza saca la captura (con la función de Electron que recorta la ventana) y dice a qué proyecto pertenece la app. Nunca llega a la versión armada.

**Motivo:** la mitad de los proyectos en los que se va a usar son Electron, y S-3 mostró que el costo extra es solo la captura.

**Consecuencias:**
- `02-definicion.md` › C-36 dice «web o Electron»; `00-idea.md` › Ideas para después ya no deja Electron para después.
- El diseño técnico del módulo define esa pieza: dónde vive la extensión, cómo la encuentra cada proyecto y cómo pide la captura.


---

## D-048 — Diseño técnico de la Revisión: los comentarios viven en `docs/revision/` y la IA se entera por la instrucción y la guía

- **Fecha:** 2026-10-28
- **Ámbito:** módulo Revisión de la app; núcleo (escritura en proyectos, instrucción de la sesión, Archivos, conversación)
- **Hito o paso:** 7; módulo Revisión, paso 5
- **Estado:** vigente

**Contexto:** el diseño técnico del módulo (`modulos/revision/diseno-tecnico.md`) tenía que decidir dónde se guardan los comentarios, cómo se enteran las sesiones y cómo encaja con el núcleo. Hasta ahora Iridium solo escribía `respuestas/` en los proyectos (`05-arquitectura.md` › Seguridad), y H-R6 pedía que el `CLAUDE.md` de cada proyecto dijera dónde están.

**Opciones consideradas:**
1. Comentarios en `docs/revision/R-n.md` del proyecto; la IA se entera por la instrucción de las sesiones de Iridium y por una regla de la guía; Iridium no toca el `CLAUDE.md`.
2. Igual, pero Iridium agrega una línea al `CLAUDE.md` de cada proyecto con el primer comentario.
3. Comentarios en los datos de Iridium, fuera del proyecto, y la IA los recibe solo por mensaje.

**Decisión:** opción 1. Además: receptor en `127.0.0.1:47321` que acepta solo el origen de la extensión (id fijo); la extensión se instala desde una carpeta fija en los datos de Iridium; Enviar ahora manda un mensaje de texto que cita el `R-n` y la captura, sin cambiar la interfaz `Motor`; tres iteraciones (navegador, Revisión en Iridium, Electron).

**Motivo:** con los comentarios en el proyecto, la IA los encuentra también desde VS Code y quedan en git. Editar el `CLAUDE.md` sería escribir un archivo del usuario sin que lo pida; la guía ya llega a todos los proyectos. La opción 3 dejaba a VS Code afuera.

**Consecuencias:**
- `05-arquitectura.md`: Iridium escribe también `docs/revision/`; entidad Comentario y `revision.json`; `extension/` en el repo; filas del receptor en Seguridad.
- `modulos/revision/ux.md` › H-R6: el criterio del `CLAUDE.md` pasa a la instrucción y la guía.
- Cambios a la guía: suma la regla de `docs/revision/` (Pendientes de `estado.md`).
- Archivos abre un archivo en una línea; la conversación muestra los comentarios como tarjeta.

## D-049 — El modo comentar se prende con F8 y no pone ninguna barra sobre la app

- **Fecha:** 2026-10-28
- **Ámbito:** módulo Revisión de la app (UX y UI de la extensión)
- **Hito o paso:** 7; módulo Revisión, paso 6
- **Estado:** vigente

**Contexto:** al recorrer el prototipo (Q-69), la barra fina de arriba del modo comentar aparecía y desaparecía mientras se elegía un elemento (se volvía a animar con cada movimiento del mouse) y, aunque anduviera bien, ocupa lugar de la app que se está revisando. El usuario pidió que no haya barra y que se active con una tecla F.

**Opciones consideradas:**
1. Sin barra; `F8` prende y apaga; un aviso chico abajo a la derecha al entrar, que se va solo; el proyecto y los avisos (Iridium cerrado, proyecto sin reconocer) pasan a la tarjeta.
2. Sin barra ni aviso: solo el cursor y el resaltado.
3. Otra tecla F: `F2` (renombrar en muchas apps), `F4`, `F9` (lector inmersivo en Edge).

**Decisión:** opción 1, con `F8`.

**Motivo:** `F8` no la usan Chrome, Edge, Iridium ni las apps del usuario, y solo pausa el depurador cuando el foco está en las herramientas de desarrollo, no en la página. Sin ningún aviso, al apretar F8 no queda claro si entró ni a qué proyecto va; un aviso que se va solo lo dice sin quedarse ocupando lugar.

**Consecuencias:**
- `modulos/revision/ux.md`: H-R1, H-R3, FR-1, FR-3, W-R1 y W-R2 sin barra; `Alt+Shift+C` pasa a `F8`; la pieza «Barra del modo comentar» pasa a «Aviso del modo comentar».
- `modulos/revision/diseno-tecnico.md`: la tecla y los lugares donde se decía «la barra».
- `DESIGN.md` › Revisión de la app y el prototipo `ui/vista-revision.html`.
- Se pierde el contador «N dejados» mientras se comenta; cada tarjeta confirma lo suyo.

## D-050 — La extensión de la Revisión pide permiso sobre todos los sitios, solo para poder sacar la captura

- **Fecha:** 2026-10-28
- **Ámbito:** módulo Revisión de la app (extensión, seguridad)
- **Hito o paso:** 7; módulo Revisión, R-I1
- **Estado:** vigente

**Contexto:** el diseño técnico pedía que la extensión tuviera permiso solo sobre `localhost`, `127.0.0.1` y `[::1]` (`modulos/revision/diseno-tecnico.md` › Seguridad). Al construirla, la prueba en Edge mostró que con ese permiso Chrome y Edge no dejan sacar la captura de la pestaña: `captureVisibleTab` exige el permiso sobre todos los sitios (`<all_urls>`) o el permiso de la pestaña activa, que solo se da al tocar el botón de la extensión, no con F8.

**Opciones consideradas:**
1. Permiso sobre todos los sitios. Los scripts siguen corriendo solo en las direcciones de la PC y la extensión solo le habla a `127.0.0.1`; al instalarla, Edge avisa que «puede leer y cambiar datos de todos los sitios».
2. Permiso de la pestaña activa: la captura sale solo si se entra con el botón de la extensión, no con F8.
3. Sin captura en el navegador (la sacaría Iridium de la pantalla): más frágil y más trabajo.

**Decisión:** opción 1.

**Motivo:** la captura es parte de lo aprobado (C-36) y F8 es la forma de entrar (D-049). El permiso no cambia lo que hace la extensión: sigue sin correr en otros sitios ni mandar nada afuera de la PC (el código es nuestro y está en el repo).

**Consecuencias:**
- `extension/manifest.json`: `host_permissions` pasa a `<all_urls>`; los scripts siguen limitados a las direcciones locales.
- `modulos/revision/diseno-tecnico.md` › Seguridad: la fila de la extensión lo dice.
- `scripts.md` › Instalar la extensión de Revisión avisa del cartel de Edge.

## D-051 — La Revisión es la norma en las apps Electron del usuario; el ayudante de Electron se adelanta a R-I2

- **Fecha:** 2026-10-29
- **Ámbito:** módulo Revisión de la app; otros proyectos (otras apps) y la guía `hitos-desarrollo-app`
- **Hito o paso:** 7; módulo Revisión, entre R-I1 y R-I2
- **Estado:** vigente

**Contexto:** después de R-I1, el usuario pidió sumar la Revisión a otras apps e Iridium, y que sea la norma en las apps Electron que se desarrollen y en las compatibles. En Electron hace falta el ayudante, que el plan dejaba para R-I3.

**Decisión:**
1. El ayudante de Electron (carga de la extensión, captura y carpeta de la app) se construye ahora; de R-I3 quedan para R-I2 la detección en la sección Revisión («¿esta app ya la carga?») y **Pedírselo a la IA**, que viven en esa sección.
2. La línea va en el proceso principal de cada app **solo con el servidor de desarrollo** (`ELECTRON_RENDERER_URL` con electron-vite, `OTRA_APP_URL_DESARROLLO` en otra app), no con `!app.isPackaged`: así las pruebas automáticas de cada app, que abren la versión compilada, no cargan la extensión.
3. Una app que filtra los pedidos de su sesión (otra app) deja pasar, solo en desarrollo, la extensión y `http://127.0.0.1:47321/`.
4. La norma queda en la guía (`hitos-desarrollo-app` › hito 7 › Antes de empezar), con la regla de los `R-n` (D-048). Una app web con servidor local no necesita nada: la comenta la extensión de Edge o Chrome.

**Motivo:** pedido del usuario. Lo que no se adelanta depende de la sección Revisión, que es de R-I2.

**Consecuencias:**
- `extension/electron/` (ayudante y *preload* del service worker), que se copia con la extensión a `%APPDATA%\Centro de Desarrollo\extension\`.
- La línea en Iridium, otra app (D-056 de ese proyecto) y otra app (D-085 de otra app); probado en las tres con el modo desarrollo real.
- `/estado` y `/comentarios` reciben la carpeta de la app: el proyecto que la contiene manda, y la dirección no se recuerda (varias apps Electron usan el mismo puerto).
- `modulos/revision/diseno-tecnico.md` › Ayudante de Electron y `modulos/revision/estado.md` › Iteraciones, al día.

## D-052 — La Revisión también en las versiones armadas de Iridium y otra app

- **Fecha:** 2026-10-29
- **Ámbito:** módulo Revisión de la app (ayudante, extensión, seguridad); otra app
- **Hito o paso:** 7; módulo Revisión, después de R-I3
- **Estado:** vigente (cambia D-051 punto 2 y `modulos/revision/diseno-tecnico.md` › Seguridad, «Nada de esto llega a las versiones armadas»)

**Contexto:** el usuario pidió aplicar la Revisión también a las versiones finales. Las versiones armadas de Iridium y otra app cargan la interfaz desde `file://` (dentro de `release/win-unpacked/`, en la carpeta del proyecto); la de otra app, desde `otra-app://` y se instala en `Programs`.

**Decisión:**
1. El ayudante corre también en la versión armada (sale solo con `IRIDIUM_REVISION=no`). La extensión actúa además en `file://` (en Edge y Chrome solo si se prende «Permitir acceso a URL de archivo», que viene apagado).
2. La línea, sin condición en otra app (D-057 de ese proyecto); en Iridium, salvo en las pruebas (`IRIDIUM_DATOS`).
3. Una app instalada fuera de los proyectos pregunta una vez y Iridium recuerda el proyecto por su carpeta (`revision.json` › `carpetas`).
4. El ayudante recarga una ventana solo si le faltan los scripts (una marca que deja `pagina.js`), para no recargar en cada arranque.
5. **otra app queda solo en desarrollo**, hasta que el usuario decida (Q-71): las extensiones no entran en `otra-app://`, y las capturas serían de su catálogo privado y quedarían en la carpeta del repo.

**Motivo:** pedido del usuario. En la versión armada no hay archivo ni línea (React de producción no los da), pero sí componentes, elemento, página y captura.

**Consecuencias:**
- Las versiones armadas ejecutan al arrancar el ayudante de `%APPDATA%\Centro de Desarrollo\extension\`, una carpeta que puede escribir el mismo usuario: no da más permisos que los que ya tiene un programa del usuario, pero queda escrito en Seguridad.
- `modulos/revision/diseno-tecnico.md` › Ayudante de Electron y › Seguridad; la guía (`hitos-desarrollo-app` › hito 7) con la línea sin condición.

## D-053 — otra app instalada se queda sin Revisión; una pregunta se lee con una sola opción y con pasos numerados
- **Fecha:** 2026-10-29
- **Ámbito:** general (lector de preguntas de Pendientes); módulo Revisión; otra app (una idea en su lista)
- **Hito o paso:** 7; al procesar Q-70 y Q-71
- **Estado:** vigente (cierra D-052 punto 5)

**Contexto:** en Q-71 el usuario eligió dejar la Revisión solo en otra app de desarrollo y pidió, como idea aparte, un botón en otra app instalada, junto al de bloqueo, para pasar a la de desarrollo. En Q-70 avisó que Pendientes le mostró la pregunta solo con el campo de texto: tenía una sola opción («A) Funciona») y los pasos de la prueba numerados (`1.`), y el lector pedía al menos dos opciones y puntos `- [ ]`.

**Decisión:**
1. La Revisión no se carga en otra app instalada (Q-71: A).
2. El botón para pasar de otra app instalada a la de desarrollo es de otra app: quedó en su lista de ideas (`otra app/docs/07-construccion.md` › Pendientes e ideas); es posible, porque la instalada puede abrir el modo desarrollo de la carpeta del proyecto en una consola.
3. El lector de preguntas acepta **una sola opción** (lo demás va en Otro, que siempre está) y toma los **pasos numerados** (`1.` o `1)`) como puntos de la prueba, igual que `- [ ]`.

**Motivo:** el catálogo privado no sale de otra app y no hay que abrirle su sesión blindada. Una prueba con una sola opción es justo lo que pide quitar «B) Encontré algo» (Q-59), y la IA escribe los pasos numerados con naturalidad: que el lector los entienda evita que una pregunta pierda su formulario.

**Consecuencias:**
- Un contexto con una lista numerada que no son pasos también se muestra como casillas: se acepta, porque en una `Q-n` casi siempre son pasos.
- La guía (cambios pendientes, Q-62) puede pedir pasos numerados o `- [ ]` indistintamente.

## D-054 — Iridium se prepara para compartir en una iteración corta después de I-6
- **Fecha:** 2026-10-29
- **Ámbito:** general (plan de construcción)
- **Hito o paso:** 7; al procesar Q-72
- **Estado:** vigente

**Contexto:** el usuario quiere compartir Iridium con conocidos, con ramas `dev` y `main`, un instalador y actualizaciones (`07-construccion.md` › Ideas nuevas). En Q-72 eligió cuándo.

**Decisión:** se hace al cerrar el MVP, como la iteración I-7 «Compartir (beta)», después de I-6 y antes de las dos semanas de uso real: GitHub con las ramas `dev` y `main`, el instalador publicado con actualización al cerrar, elegir la carpeta de proyectos al primer arranque y repartir la guía `hitos-desarrollo-app`. Si el código es público o privado (con un repo público solo para los instaladores) se pregunta aparte (Q-73), antes de I-7.

**Motivo:** a esa altura Iridium está completo, y la actualización al cerrar resuelve de paso el pendiente de armar Iridium con la app abierta.

**Consecuencias:**
- `02-definicion.md` suma C-59 como *Must*; el plan de `07-construccion.md` suma I-7; el pendiente «Armar Iridium no puede reemplazar la app abierta» pasa de I-6 a I-7.
- El perfil del proyecto deja de ser «solo el usuario» al llegar a I-7: se revisa la protección (doble factor en GitHub, aviso de SmartScreen) en esa iteración.
- Falta confirmar en I-7 que las condiciones de uso de Claude Code permitan usar la sesión de cada uno en una app repartida.

## D-055 — La guía `hitos-desarrollo-app` pasa al formato 2026-10-29 con las mejoras pendientes
- **Fecha:** 2026-10-29
- **Ámbito:** general (la guía, en el proyecto `Skills`)
- **Hito o paso:** 7; pendiente del hito, autorizado en Q-62
- **Estado:** vigente (aplica D-009, D-010, D-019 y D-044; cierra Q-59)

**Contexto:** desde el hito 1 quedaban cambios a la guía decididos y sin hacer. En Q-62 el usuario dijo que se pueden hacer desde acá. Se hicieron mientras R-I2 esperaba su prueba (Q-74).

**Decisión:** se aplicaron (commit `262727b` de `Skills`):
1. **Las `Q-n`:** línea `Tipo:` (decisión, consulta, prueba, tarea, formulario) con `frena`; pruebas y tareas como listas de puntos cortos, acción y resultado (D-044); una sola opción vale y no hace falta «Encontré algo», porque Otro siempre está (Q-59, D-053); la forma de la respuesta con los puntos marcados y su nota (D-019).
2. **La IA no espera en el chat:** lo que necesita del usuario va como `Q-n` (D-010, D-021).
3. **El portón** como lista `## Portón` al final de cada documento de hito, y los **estados con palabras fijas** (D-019).
4. **Las mejoras 1 a 6 de D-009:** revisión de coherencia con veredicto al cerrar el hito 6; verificación de los criterios de aceptación antes de mostrar cada iteración; «Corregir el rumbo» (con el caso de Q-13); cambios como propuestas después del lanzamiento; pista corta para errores; **Leer antes** por iteración.
5. Formato nuevo **2026-10-29**: `actualizar-formato.md` y las plantillas al día. Iridium ya lo cumplía: cambió la fecha de `docs/README.md` y dos reglas de su `CLAUDE.md`.

**Motivo:** son las formas que Iridium ya lee y usa; escribirlas en la guía hace que los otros proyectos las sigan y que sus preguntas aparezcan bien en Pendientes.

**Consecuencias:**
- Los otros proyectos quedan con el formato 2026-10-16 hasta que se retomen o se pida ponerlos al día (`actualizar-formato.md`); desde acá no se tocan.
- D-014 (traer skills a local) no era un cambio de la guía: queda como pendiente para una sesión de `Skills`.
- Las mejoras 7 a 9 de D-009 siguen como posibles.

## D-056 — «Aprobada provisional»: se sigue como si funcionara y la prueba a mano queda anotada
- **Fecha:** 2026-10-29
- **Ámbito:** general (cómo se aprueban las iteraciones)
- **Hito o paso:** 7; al procesar Q-74
- **Estado:** vigente

**Contexto:** el usuario no podía probar R-I2 como estaba pedida: no usa Edge ni sus apps en el navegador, sino en Electron. Pidió darla por aprobada provisional y dejar la prueba a mano para más adelante, y dijo que es un estado que va a usar a menudo cuando lo que falta no frena.

**Decisión:**
1. **Aprobada provisional** (palabra fija de D-019) es una iteración que se sigue como si funcionara, con las pruebas automáticas pasando y la prueba a mano pendiente.
2. Las pruebas pendientes van a `07-construccion.md` › Pruebas manuales pendientes (qué, por qué quedó, los puntos y la `Q-n` de origen). El hito 8 las recorre todas; el usuario puede hacerlas antes.
3. R-I2 queda aprobada provisional y el paso 7 del módulo Revisión, completo.

**Motivo:** que una prueba que no frena no detenga el plan, sin perderla.

**Consecuencias:**
- El Mapa la cuenta como hecha (empieza por «aprobad»).
- Una sección de Iridium que junte los aprobados provisionales de todos los proyectos quedó como idea (`07-construccion.md` › Ideas nuevas). Si la forma funciona, se suma a la guía `hitos-desarrollo-app`.

## D-057 — El código de Iridium va público en GitHub, con `docs/` hablando solo de Iridium
- **Fecha:** 2026-10-29
- **Ámbito:** general (I-7)
- **Hito o paso:** 7; al procesar Q-73
- **Estado:** vigente (completa D-054)

**Contexto:** para compartir Iridium (D-054), los instaladores tienen que estar en un repo público. Q-73 preguntaba si el código también.

**Decisión:** el repo es público (Q-73: B). Antes de publicar, en I-7, `docs/` se limpia para que solo hable de Iridium (pedido del usuario): lo que trata de otros proyectos se generaliza o sale, y también las rutas de la PC del usuario.

**Motivo:** un solo repo es lo más simple para publicar y actualizar.

**Consecuencias:**
- I-7 suma la limpieza de `docs/` y la revisión del historial de git (es público con el repo: lo que ya se commiteó de otros proyectos sigue en el historial; si hace falta, se publica un historial nuevo).
- Hasta I-7 se sigue escribiendo como ahora; la limpieza es una sola vez.

## D-058 — Git como el control de código de VS Code, y si el repositorio está en GitHub
- **Fecha:** 2026-10-29
- **Ámbito:** general (I-5, H-16)
- **Hito o paso:** 7; al procesar Q-75
- **Estado:** vigente (completa D-041 y Q-61)

**Contexto:** I-5 pasó la prueba (Q-75), y el usuario pidió que el panel de Git se parezca más al de VS Code y que diga si el repositorio está solo en la PC o también en GitHub.

**Decisión:** el panel izquierdo de Git tiene, debajo de la rama, dónde está el repositorio («Solo en esta PC» o «En GitHub · dueño/repo», con cuántos commits faltan subir o bajar) y secciones que se pliegan: **Preparados** (solo si hay), **Cambios** (los archivos sin guardar, uno por fila con su carpeta y su letra) e **Historial** (los commits que no están en GitHub dicen «sin subir»). Un archivo elegido en Cambios se ve solo, con su antes y después a la vista; **Ver todos los cambios** vuelve a la lista. Cada proyecto recuerda qué secciones están plegadas.

**Motivo:** es la forma que el usuario ya conoce de VS Code, y saber qué falta subir a GitHub es parte de controlar lo que hizo la IA.

**Consecuencias:**
- Lo de GitHub es lo que git sabe desde la última sincronización: Iridium no se conecta a internet para eso ni sube nada (sigue siendo solo para mirar). La dirección se muestra sin usuario ni clave.
- H-16 suma un criterio de aceptación (`04-ux.md` › H-16).

## D-059 — El contexto de una conversación guardada se lee de su historial; el uso, el modelo, los avisos y el cierre, como se construyeron
- **Fecha:** 2026-10-29
- **Ámbito:** general (I-6: H-12, H-13, F-5, F-6, C-58)
- **Hito o paso:** 7; al construir I-6
- **Estado:** vigente (precisa D-023, D-045, `04-ux.md` › W-4 y `05-arquitectura.md` › La interfaz `Motor`)

**Contexto:** la arquitectura leía el contexto de cualquier conversación retomándola sin mandar nada (`getContextUsage`, S-2). Probado con el Claude Code real en I-6: retomar, aun sin mensajes, **agrega líneas al historial** (el costo de la sesión) y le cambia la fecha. Iridium escribiría en las conversaciones del usuario solo por mirarlas, y una conversación recién abierta en Iridium parecería usada en VS Code (D-027). Además, al construir I-6 aparecieron detalles que el diseño no fijaba.

**Decisión:**
1. **Contexto:** en una sesión abierta, al terminar cada turno, `getContextUsage` (resumen). En una conversación guardada, **se calcula de su historial, solo leyéndolo**: lo que entró al modelo en la última respuesta (con lo que estaba en caché), que da exactamente lo mismo que Claude Code (probado: 48 127 tokens en los dos). El tamaño de la ventana de cada modelo se le pregunta una vez a una sesión nueva sin mensajes (no escribe conversaciones ni gasta) o se aprende de las sesiones.
2. **Uso:** se lee al abrir, con cada turno de cualquier sesión, cada 15 minutos y apenas se libera una ventana. *(Precisado el 2026-11-01 por el Defecto 16 de `08-calidad.md`: cada 5 minutos, cada 2 minutos mientras una sesión trabaja y al volver a la ventana si tiene más de un minuto.)* El detalle (R-1) se abre **tocando** los medidores, no al pasar el mouse como decía W-4. Desde el 90 % se marca en ámbar; agotado, en rojo con cuándo se libera.
3. **Modelo y esfuerzo:** la lista es la que da Claude Code, tal cual (incluye modelos anteriores); «Predeterminado» es no elegir nada (lo que use Claude Code). Si el modelo elegido no tiene el esfuerzo guardado, vuelve al predeterminado. Se guardan por proyecto en `config.json`.
4. **Sin sesión iniciada (F-5):** antes de abrir una sesión, si Claude Code no estaba listo se vuelve a verificar; si sigue sin sesión, no se manda nada y el aviso guarda lo escrito para **Reintentar**.
5. **Avisos (H-13):** dentro de un proyecto aparecen a la izquierda de la conversación, para no tapar el cuadro de escribir (como pedía D-032 en el prototipo).
6. **Cerrar con sesiones trabajando (F-6):** la confirmación es de Iridium (no la de Windows); **Cerrar igual** frena las sesiones y espera a que quede guardado que se las detuvo. `pnpm actualizar` la respeta: espera a que el usuario elija.

**Motivo:** mirar no escribe nada en los proyectos ni en las conversaciones (`05-arquitectura.md` › Principios); lo demás sigue el diseño y lo que pidió el usuario en R-1.

**Consecuencias:**
- `05-arquitectura.md` › La interfaz `Motor` cambia la fila de `contexto`.
- Claude Code crea una carpeta `memory` vacía en `~/.claude/projects/C--Users-<usuario>` al preguntar la ventana: no es una conversación.

## D-060 — Lo escrito no se pierde, se vuelve al último proyecto, el contexto como círculo y un chat en la vista de Proyectos
- **Fecha:** 2026-10-30
- **Ámbito:** general (C-60, C-61; ajustes de I-6 pedidos en Q-77 y R-3)
- **Hito o paso:** 7; después de I-6
- **Estado:** vigente (precisa D-039, D-045 y D-059)

**Contexto:** el usuario perdió lo que escribía en el chat al salir a Proyectos, y en Pendientes al cerrar Iridium (R-3). Pidió que Iridium abra en el proyecto que tenía abierto, un chat en la vista de Proyectos para ideas sin lugar y para hablar de varios proyectos, y, al probar I-6 (Q-77), colores para el uso, el contexto como círculo con tokens, su desglose y la caché, y el nombre del modelo y el esfuerzo que se usan en vez de «Predeterminado».

**Decisión:**
1. **Lo escrito:** el cuadro de cada conversación se guarda solo en `escritos.json` (datos de Iridium, fuera del proyecto) un momento después de dejar de escribir; al enviar se borra. En Pendientes, lo marcado y escrito se guarda a medias solo (D-039), igual que con el botón. Al cerrar, Iridium espera a que termine de guardarse.
2. **Volver al proyecto:** `config.json` recuerda el proyecto abierto; al abrir, Iridium entra en él, en su sección principal. Si se cerró en el inicio, abre en el inicio.
3. **Uso:** naranja desde el 75 % y rojo desde el 85 %, en la ventana de 5 horas y en la semana (antes, ámbar desde el 90 %).
4. **Contexto:** un círculo que se llena en el sentido del reloj (naranja desde el 60 %, rojo desde el 80 %, cuando se sugiere Nueva), los tokens («76k/224k») y lo que le queda a la caché («42 min» o «caché vencida»). Tocándolo, el detalle: los tokens, el desglose de Claude Code (instrucciones, herramientas, `CLAUDE.md`, la conversación, libre) y la caché (cuándo vence y, si venció, cuántos tokens vuelve a cargar el próximo mensaje). La duración de la caché (5 minutos o 1 hora) la dice la respuesta del modelo; corre desde el último pedido. De una conversación guardada no hay desglose hasta el próximo turno.
5. **Modelo y esfuerzo:** sin elegir, se ve el que usa Claude Code: el modelo de verdad («Opus 5.5») y el esfuerzo que guardó `/effort` en `~/.claude/settings.json` («Medio»). En la lista sigue la opción «Predeterminado (Opus 5.5)».
6. **Chat en la vista de Proyectos:** a la derecha de la grilla, con el mismo ancho que en un proyecto, es la conversación de la carpeta `Ideas` de la carpeta de proyectos (ya existía para eso, con su `CLAUDE.md` y `ideas.md`). Sin Seguí (no tiene próximo paso); su instrucción le dice que converse y pregunte en el chat, no en un `estado.md`. Mientras se ve no avisa al terminar. Si la carpeta no está, el lugar dice cómo tenerla.

**Motivo:** son pedidos del usuario; la carpeta `Ideas` ya tenía las reglas para ordenar ideas y crear proyectos, así que el chat general no necesita un lugar nuevo ni tocar la carpeta de proyectos.

**Consecuencias:**
- `02-definicion.md` suma C-60 y C-61; `05-arquitectura.md`, `escritos.json` y el desglose y la caché en `contexto`.
- I-7 (compartir) tiene que crear la carpeta `Ideas` con su `CLAUDE.md` en la carpeta de proyectos de cada uno, o el chat general no aparece.
- Desde el chat general la IA puede crear proyectos en la carpeta de proyectos; las reglas de `Ideas/CLAUDE.md` le prohíben modificar otros proyectos sin pedido explícito.

## D-061 — El chat se lee de un vistazo: lo tuyo en burbuja, el proceso de la IA aparte de su respuesta
- **Fecha:** 2026-10-30
- **Ámbito:** general (W-3; ajuste pedido por el usuario)
- **Hito o paso:** 7; después de I-6
- **Estado:** vigente (precisa W-3 y la conversación de I-2)

**Contexto:** el usuario dijo que leer a la IA era difícil: las herramientas que usa y lo que va contando en el camino se mezclaban con lo que le dice a él, y sus mensajes y los de la IA se veían iguales (solo cambiaba la etiqueta «Vos» o «IA»). Preguntó por colores o burbujas.

**Opciones:**
- A) Burbuja solo para lo tuyo, a la derecha; la IA a todo el ancho, con el proceso aparte (elegida).
- B) Burbujas para los dos: el panel del chat es angosto (≈430 px) y una burbuja para la IA le quita ancho a lo que más se lee.
- C) Solo colores de fondo distintos, sin burbujas: separa quién habla, pero no el proceso de la respuesta, que era la queja principal.

**Decisión:**
1. **Tus mensajes:** en una burbuja a la derecha, con un fondo apenas verde y su borde; arriba, «Vos» y la hora.
2. **Un turno de la IA** se parte en dos: el **proceso** (todo hasta la última herramienta: las herramientas y las notas que escribió en el camino) y la **respuesta** (lo que escribió después, en letra de lectura).
3. **El proceso** va atenuado, en letra más chica y sobre un riel a la izquierda. Mientras la IA trabaja se ve entero; al terminar con una respuesta queda plegado en una línea («Proceso · 2 herramientas · 1 nota») que se despliega con un clic.
4. Los avisos, los errores del motor y las preguntas que dejó nunca quedan plegados. Si el turno termina sin texto (por ejemplo, detenido), el proceso queda abierto.

**Motivo:** es como lo resuelven Claude y otros chats de agentes; separa lo que hay que leer de lo que se puede consultar, sin perder nada.

**Consecuencias:**
- Una cita a un documento dentro de una nota del proceso solo se toca después de desplegarlo.
- Si a la IA le queda algo importante en una nota del camino y no lo repite al final, no se ve sin desplegar.

## D-062 — Ajustes del uso diario: Responder dentro del proyecto, el nombre de la ficha, las pruebas sin quitar el foco y el Gestor descontinuado
- **Fecha:** 2026-10-30
- **Ámbito:** general (ajustes pedidos por el usuario al usar Iridium)
- **Hito o paso:** 7; después de D-061
- **Estado:** vigente (precisa H-13 y D-033)

**Contexto:** con el uso diario, el usuario pidió que el aviso de un proyecto que dejó preguntas lleve a los pendientes de ese proyecto y no a los de todos; que la tarjeta diga «Iridium» y no «Centro de Desarrollo» sin renombrar la carpeta (cambia el repositorio y el nombre todavía puede cambiar); y dio por descontinuado el gestor anterior, que Iridium reemplaza. También contó que la ventana de las pruebas automáticas se pone adelante y lo interrumpe mientras usa la PC.

**Decisión:**
1. **Responder** (en el aviso, en la conversación, en el Mapa y en el número de la cabecera del proyecto) abre la primera sección del proyecto, «Pendientes y scripts», con sus preguntas. La sección Pendientes del inicio sigue juntando las de todos.
2. **El nombre de la tarjeta** puede venir de la ficha: `"nombre"` en `.proyecto.json`. Si no está, es el de la carpeta, como hasta ahora. `reemplazadoPor` y todo lo que identifica al proyecto siguen usando la carpeta. Se guarda entre los campos que el formato del Gestor no conoce, así editar la ficha no lo pierde. La ficha de Iridium lo usa.
3. **Las pruebas con la app abierta** abren sus ventanas sin quitarle el foco a lo que el usuario está usando (`IRIDIUM_SIN_FOCO`, que pone la configuración de Playwright; también la app de prueba de la Revisión). Lo que se escribe en otra ventana ya no cae en la de la prueba.
4. **El gestor anterior** queda descontinuado y archivado en su ficha. No hay nada que rescatar: lo que servía ya se copió a Iridium (D-026).

**Motivo:** son ajustes chicos que molestaban en el uso diario; ninguno cambia el alcance.

**Consecuencias:**
- La skill `gestor-proyectos` habla del Gestor como la extensión de VS Code y no conoce `"nombre"`: hay que ponerla al día en una sesión de `Skills` (Iridium pasa a ser quien muestra las fichas).
- Las ventanas de prueba igual aparecen en la pantalla, pero sin tomar el teclado.


## D-063 — Frentes en paralelo después del núcleo, y Postergar una prueba con un botón
- **Fecha:** 2026-10-30
- **Ámbito:** general (plan de construcción, Mapa, Pendientes; C-62, C-63)
- **Hito o paso:** 7; al procesar Q-79, Q-80 y Q-81
- **Estado:** vigente (cambia el plan de D-054; precisa D-056)

**Contexto:** el usuario propuso que el núcleo sea un frente más y que los módulos compatibles avancen al mismo tiempo (`07-construccion.md` › Ideas nuevas › Frentes en paralelo). También pidió poder dejar para después una prueba sin perder lo que dice. Q-79 aprobó el chat de D-061.

**Opciones (Q-80):** A) el núcleo cerrado con I-6, una iteración corta para que el Mapa y Pendientes muestren cada frente y después hasta dos frentes a la vez (elegida, con Skills y Apariencia y ajustes); B) terminar I-7 y las dos semanas de uso, y después los frentes de a uno; C) frentes sin límite.
**Opciones (Q-81):** A) un botón **Postergar** en cada prueba (elegida); B) escribir «aprobada provisional» a mano, con la pista de la IA; C) pedir las pruebas que no frenan todas juntas al cerrar el hito.

**Decisión:**
1. **Frente** es el núcleo o un módulo de la guía (`docs/modulos/<nombre>/estado.md`). El núcleo se da por cerrado con I-6 (falta la prueba de Q-77); las dos semanas de uso real del hito 8 corren mientras se trabaja en los frentes.
2. **I-8 — Frentes y Postergar**, corta y antes que cualquier frente: el Mapa muestra cada frente con su paso, sus pasos, su próximo paso y lo que espera del usuario; Pendientes dice de qué frente es cada pregunta; y el botón **Postergar**.
3. **Hasta dos frentes activos a la vez:** primero **Skills** y **Apariencia y ajustes** (temas, configuración y perfil), que casi no tocan el núcleo. Los demás esperan: **Compartir** (lo que era I-7), **Diseño**, **Capacidades** (complementos, uso de la PC y del navegador) y el **inicio** con Ideas y Skills como paneles. Cuando uno termina, entra el siguiente.
4. **Postergar** (en las preguntas de tipo prueba): escribe `respuestas/Q-n.md` con `**Opción:** Postergada` y lo marcado y anotado hasta ese momento. La línea misma le dice a la IA qué hacer: tomarla como aprobada provisional (D-056), anotarla con sus puntos en `07-construccion.md` › Pruebas manuales pendientes y sumarle **dónde mirar si falla** (archivo, decisión, prueba automática que lo cubre). La tabla suma esa columna.

**Motivo:** el cuello de botella son las pruebas y decisiones del usuario y su cuota de uso, no la IA: dos frentes alcanzan para que siempre haya algo que avance mientras el otro espera, sin que el usuario tenga demasiadas cosas abiertas. Skills y Apariencia casi no tocan el núcleo, así que no se rompen con él. Postergar con un clic deja el contexto de la prueba para cuando haga falta.

**Consecuencias:**
- `07-construccion.md`: I-7 pasa a ser el frente Compartir (en espera; su detalle queda donde está) y se suma I-8. Una sesión por proyecto (D-015) hace que dos frentes del mismo proyecto se turnen, no que corran a la vez.
- `02-definicion.md` suma C-62 (Postergar) y C-63 (frentes en el Mapa y Pendientes), el término «Frente» y los módulos previstos nuevos (Apariencia y ajustes, Compartir, Capacidades, Inicio).
- Cambiar la guía `hitos-desarrollo-app` para que hable de frentes, de Postergar y de la columna nueva va en una sesión de `Skills`. Mientras, la línea de la respuesta explica sola lo que tiene que hacer la IA.


## D-064 — Skills: ver, editar con la IA y poner al día proyectos; elegir por proyecto, después
- **Fecha:** 2026-10-30
- **Ámbito:** módulo Skills (C-44 a C-46, C-52, C-53)
- **Hito o paso:** módulo Skills, paso 2; al procesar Q-83
- **Estado:** vigente (precisa D-018)

**Contexto:** la propuesta del módulo (`modulos/skills/propuesta.md`) ofrecía tres alcances para la primera tanda.

**Opciones (Q-83):** A) ver, editar con la IA y poner al día proyectos, en ese orden (elegida); B) solo ver y avisar de las copias dobles; C) como A y además elegir qué skills usa cada proyecto.

**Decisión:** la primera tanda es **ver** las skills con su origen y aviso de copias dobles, **pedir un cambio** a la IA desde una skill propia (abre la conversación de `Skills`) y **poner al día** los proyectos con la guía atrasada. Elegir skills por proyecto queda para después. El usuario lo resumió así: ver y editar skills, y ver cómo afectan a los proyectos para actualizarlos.

**Motivo:** lo que más cambia es la guía, y cada cambio deja proyectos atrás sin que nadie avise.

**Consecuencias:**
- `modulos/skills/definicion.md` y la primera parte de `investigacion.md`.
- Elegir skills por proyecto no pide inventar nada: Claude Code tiene `skillOverrides` por proyecto.
- Saber qué proyecto está atrasado probablemente pida un número de formato en la guía (se decide en el diseño técnico; el cambio de la guía va en una sesión de `Skills`).


## D-065 — Ajustes como ventana flotante con nombre, IA, tono y tema
- **Fecha:** 2026-10-30
- **Ámbito:** módulo Apariencia y ajustes
- **Hito o paso:** módulo Apariencia, paso 2; al procesar Q-84
- **Estado:** vigente (la parte de los temas reemplazará a D-029 cuando se elija la muestra, Q-85)

**Contexto:** la propuesta (`modulos/apariencia/propuesta.md`) sugería juntar en Ajustes lo que está suelto, un tema sobrio y un perfil con nombre y foto.

**Opciones (Q-84):** A) Ajustes con lo suelto y el tema, perfil con nombre y foto; B) como A y además editar lo que la IA sabe del usuario; C) primero solo el tema. El usuario eligió otra.

**Decisión:**
1. **Ajustes** es una ventana que flota sobre la app, como la de Obsidian o Claude Desktop: secciones a la izquierda, contenido a la derecha. Se abre con ⚙ en la barra de la izquierda y `Ctrl+,`.
2. Tiene solo: el **nombre del usuario**, el **nombre de la IA** (opcional, por ahora solo se ve en la conversación), el **tono** y el **tema**. Nada más por ahora: el modelo, el esfuerzo y el ancho de Docs siguen donde están; no hay foto.
3. **El tono** son los estilos de respuesta que ya trae Claude Code (*output styles*), porque existen; el usuario no quiere que se invente una personalidad. Vale solo para las sesiones de Iridium.
4. **El tema sobrio** se elige entre tres muestras hechas con los proyectos reales (`docs/ui/alternativas/temas/`: Grafito, Obsidiana y Arcilla).

**Motivo:** lo más chico que el usuario usa; el tono no cuesta nada porque Claude Code ya lo tiene.

**Consecuencias:**
- `modulos/apariencia/definicion.md`; la herramienta `tools/muestras-tema.ts` arma las muestras cambiando solo los tokens.
- Con la muestra elegida: `06-ui.md` y `DESIGN.md` pasan de un tema a dos, con una decisión que reemplaza esa parte de D-029.


## D-066 — Dos temas oscuros: Iridium (el de siempre) y Carbón
- **Fecha:** 2026-10-30
- **Ámbito:** general (`06-ui.md`, `DESIGN.md`, `docs/ui/tokens.css`); módulo Apariencia y ajustes
- **Hito o paso:** módulo Apariencia, paso 6; al procesar Q-85 y Q-86
- **Estado:** reemplazada por D-104 desde DI-I1 (reemplazaba «un solo tema» de D-029; sigue siendo solo oscuro)

**Contexto:** el usuario pidió un tema mucho más sobrio (D-065). De tres muestras (Grafito, Obsidiana, Arcilla) eligió Grafito, más oscuro (Q-85), y de tres escalones más oscuros, el del medio (Q-86).

**Opciones (Q-86):** A) Noche; B) Carbón, casi negro con los paneles separados por tono (elegida); C) Negro.

**Decisión:** Iridium tiene dos temas, los dos oscuros: **Iridium** (el verde con Chakra Petch, el de siempre y el que rige si no se elige otro) y **Carbón** (grises casi negros, azul apagado solo para lo activo, letra del sistema Segoe UI, esquinas apenas más suaves). Carbón es un bloque de tokens en `docs/ui/tokens.css` que se activa con `data-tema="carbon"`; las pantallas no cambian. Para cumplir el contraste, el texto más tenue y el borde de los campos quedaron un poco más claros que en la muestra.

**Motivo:** la app ya sacaba todo de los tokens, así que un tema es otro juego de valores; un segundo tema oscuro no suma pruebas de contraste nuevas más allá de su tabla.

**Consecuencias:**
- `06-ui.md` › Dirección visual y Contraste suman Carbón; `DESIGN.md` suma la sección de temas.
- La maqueta de Ajustes (`docs/ui/vista-ajustes.html`) está hecha sobre una captura real de la app con el bloque Carbón aplicado.
- Un tema claro sigue fuera hasta que haga falta.


## D-067 — Cómo se construyó AP-I1: los ajustes viajan con las preferencias y «Normal» es el estilo de Claude Code
- **Fecha:** 2026-10-31
- **Ámbito:** módulo Apariencia y ajustes (`modulos/apariencia/diseno-tecnico.md`); `05-arquitectura.md` › Modelo de datos
- **Hito o paso:** módulo Apariencia, paso 7 (AP-I1)
- **Estado:** vigente (ajusta el diseño técnico del módulo)

**Contexto:** al construir AP-I1 aparecieron tres detalles que el diseño técnico no fijaba o fijaba distinto.

**Decisión:**
- Los cuatro ajustes (`tema`, `nombreUsuario`, `nombreIa`, `tono`) son **preferencias más**: viajan por el mismo pedido que guarda los anchos y las pestañas, en vez de un `ajustes()` / `cambiarAjustes()` aparte. El puente valida el tono contra la lista de Claude Code y avisa al motor y a la ventana de Windows cuando cambian.
- Claude Code trae cinco estilos, no tres: además de Explicativo y Aprendizaje, **Conciso** y **Proactivo** (comprobado con `tools/probar-motor.ts`). Se muestran todos, en castellano; los propios del usuario, con su nombre y su descripción.
- **Normal** no le pasa nada a la sesión: rige el estilo que el usuario tenga en Claude Code (hoy, el normal).
- Las pruebas pueden abrir con otro tema con `IRIDIUM_TEMA=carbon`, para correrlas todas en Carbón.

**Motivo:** un solo camino para lo que se guarda en `config.json` es menos código y las mismas validaciones; mostrar los estilos que de verdad hay evita que falte uno.

**Consecuencias:** `diseno-tecnico.md` del módulo queda con esta nota; el CLAUDE.md suma `IRIDIUM_TEMA` y `tools/miniaturas-tema.ts`.


## D-068 — Skills: el chat de `Skills` al lado, y los atrasados por la fecha de formato que ya anota cada proyecto
- **Fecha:** 2026-10-31
- **Ámbito:** módulo Skills (`modulos/skills/ux.md`, `diseno-tecnico.md`); `04-ux.md` › Arquitectura de información
- **Hito o paso:** módulo Skills, pasos 4 y 5; al procesar Q-89
- **Estado:** vigente (precisa D-064)

**Contexto:** el usuario aprobó la UX de Skills (Q-89) con un cambio: en vez del cuadro «Pedir un cambio», un chat a la derecha para hablar con la IA ahí. Para los proyectos atrasados eligió el número de formato, pero no en `estado.md` (lo lee la IA al empezar cada sesión) sino en un archivo que lea la app, como `.proyecto.json`.

**Opciones (Q-89):** A) número de formato en la guía y en cada proyecto (elegida, en otro archivo); B) comparar con la plantilla; C) solo el aviso a mano en `CLAUDE.md`.

**Decisión:**
1. **El chat a la derecha:** la sección Skills tiene tres columnas: la lista, el detalle y la conversación de `Skills` (la misma que al entrar a ese proyecto), como el chat de Ideas en la vista de Proyectos (D-060). Con una skill elegida, el cuadro de escribir lleva arriba «Sobre la skill <nombre>» (se quita con ✕) y el mensaje sale con ese nombre al principio. «Pedir que la saquen» y «Pedir que lo arreglen» escriben el pedido en ese chat para mandarlo o cambiarlo.
2. **La instrucción de esa sesión** es la de un chat que se mira (como la de Ideas): responde y pregunta en el chat, porque `Skills` no tiene `docs/estado.md`. Se elige por el nombre de la carpeta, así vale igual desde Skills y desde la vista del proyecto.
3. **El formato de cada proyecto** es la línea `**Formato de la guía:** AAAA-MM-DD` de su `docs/README.md`, que la guía ya pide desde el 2026-10-29 y la IA no lee al empezar. La fecha hace de número: no hay que cambiar `.proyecto.json` ni la skill `gestor-proyectos`. **El vigente** es la fecha de «Formato de la documentación» del `SKILL.md` de la guía.
4. **Atrasado** es un proyecto con `docs/estado.md`, no archivado, ni descontinuado, ni reemplazado, cuya fecha es anterior a la vigente, que no la tiene, o cuyo `CLAUDE.md` tiene el bloque «Actualización de formato pendiente». Hoy: otras apps (formato del 16 de octubre) y otro proyecto (sin fecha, con el bloque).
5. **Poner al día** manda el pedido a la conversación de ese proyecto sin salir de Skills: la fila muestra ● trabajando y un enlace «Ver la conversación»; se pueden poner al día varios seguidos.

**Motivo:** la línea ya existe en casi todos los proyectos y cumple lo que pidió el usuario (no la lee la IA al empezar, sí la app); un chat al lado deja conversar la idea antes de pedirla, en vez de un pedido de una sola vez.

**Consecuencias:**
- `modulos/skills/ux.md` cambia SK-3, SK-4 y SK-W1; `investigacion.md` › Proyectos atrasados suma lo encontrado.
- `04-ux.md` suma Skills como tercer ícono del inicio (`Ctrl+3`).
- Para la sesión pendiente de `Skills`: una línea fija `**Formato vigente:** AAAA-MM-DD` en el `SKILL.md` de la guía, para no depender de una frase; Iridium entiende las dos mientras tanto.

## D-069 — Compartir, por ahora solo para el usuario: GitHub privado, actualización al cerrar e iniciar sesión desde Iridium
- **Fecha:** 2026-10-31
- **Ámbito:** general (I-7, frente Compartir: `modulos/compartir/`)
- **Hito o paso:** módulo Compartir, paso 1; al procesar Q-90
- **Estado:** vigente (deja en suspenso lo de repartir de D-054 y todo D-057)

**Contexto:** la propuesta de Compartir encontró que, salvo aprobación de Anthropic, una app de terceros hecha con el Agent SDK no puede ofrecer el inicio de sesión de claude.ai: pide una clave de API (`modulos/compartir/propuesta.md` › Lo que cambia el plan). En Q-90 el usuario eligió A y agregó dos cosas: cree que sus conocidos podrían usar Iridium igual que él, con su propia suscripción; y cuando se le cerró la sesión de Claude, Iridium dejó de andar y tuvo que volver a entrar desde la extensión de VS Code.

**Opciones (Q-90):** A) solo para el usuario por ahora (elegida); B) repartir con clave de API; C) pausar Compartir.

**Decisión:**
1. **Alcance de Compartir ahora:** el repo en GitHub **privado** con `dev` y `main` (copia y registro), que Iridium se actualice solo al cerrar, elegir la carpeta de proyectos en Ajustes y **iniciar sesión en Claude desde Iridium**.
2. **Iniciar sesión desde Iridium:** el Claude Code que trae Iridium tiene `claude auth login`, que abre el navegador como la extensión de VS Code. Con eso, el aviso «Sin sesión de Claude» tiene un botón en vez de mandar a VS Code. Le sirve al usuario hoy y es lo que necesitaría cualquier otro.
3. **Repartir queda para después**, como cosa aparte. Técnicamente funcionaría igual para un conocido (Iridium trae Claude Code y cada uno entra con su cuenta), pero la condición de Anthropic sigue: repartirlo usando la suscripción de cada uno es lo que no permite sin aprobación. Cuando el usuario quiera repartir, se decide con eso a la vista (clave de API o pedir aprobación).
4. **D-057 queda en suspenso:** con el repo privado no hace falta limpiar `docs/` ni el historial; vuelve si se reparte.

**Motivo:** lo que el usuario usa a diario no cambia, y lo que le molesta hoy (armar con la app abierta, la sesión caída, sin copia del repo) se resuelve sin depender de Anthropic.

**Consecuencias:**
- `07-construccion.md` › I-7 se reduce a eso; repartir la guía y crear la carpeta `Ideas` en la PC de otro esperan a repartir.
- El perfil sigue en P2 («solo el usuario»); la cuenta de GitHub igual conviene con doble factor.
- La definición del módulo (`modulos/compartir/definicion.md`) parte de acá.

## D-070 — Las versiones se arman en la PC y GitHub guarda el código: `dev` para trabajar, `main` para lo que está en uso
- **Fecha:** 2026-10-31
- **Ámbito:** general (frente Compartir, CO-I2 y CO-I3)
- **Hito o paso:** módulo Compartir, paso 3; al procesar Q-91 y Q-92
- **Estado:** vigente (precisa D-069)

**Contexto:** la investigación encontró dos formas de que entre una versión nueva: armarla en la PC o bajarla de un instalador en GitHub Releases (`modulos/compartir/investigacion.md` › Actualización). El usuario eligió armarla en la PC (Q-91: A) y agregó que más adelante, para repartir, GitHub podría tener el instalador listo y el código, para que sus amigos lo bajen o lo adapten con sus propios agentes; su copia, con una opción interna para no actualizarse desde GitHub. En Q-92 creó el repo privado `LlanosLautaro/Iridium`.

**Decisión:**
1. **La versión nueva se arma en la PC** (CO-I2): como hoy, sin internet ni claves, pero sin cerrar Iridium; entra al cerrar o con Reiniciar ahora.
2. **GitHub es la copia del código:** `dev` es la rama de trabajo (antes `master`) y se sube después de cada commit; `main` marca lo que está en la app de uso diario y se mueve al armar una versión. Subido el 2026-10-31; el repo sigue privado.
3. **Para cuando se reparta** (anotado, no se hace ahora): instalador y código en GitHub; las copias de otros se actualizan desde GitHub y la del usuario, con una opción interna, desde su PC.

**Motivo:** es lo que el usuario ya usa a diario, sin pasos nuevos; lo de repartir queda pensado sin construir nada que hoy no sirve.

**Consecuencias:**
- `CLAUDE.md` del proyecto dice dónde está el repo y que se sube al commitear.
- Mover `main` va con CO-I2, dentro de «Armar la última versión».
- 2026-11-01 (CO-I2): `main` se mueve al terminar de armar, no cuando la versión entra (entre las dos cosas solo media cerrar Iridium). Si se armó con cambios sin commitear, `main` marca el commit de base; el aviso de Iridium lo dice.

## D-071 — Iridium ofrece armar la versión nueva cuando hay commits sin armar; no arma solo
- **Fecha:** 2026-11-01
- **Ámbito:** módulo Compartir (CO-I6)
- **Hito o paso:** módulo Compartir, paso 7; al procesar Q-99
- **Estado:** vigente (precisa D-070)

**Contexto:** con CO-I2, la versión nueva aparecía recién cuando alguien ejecutaba «Armar la última versión»; el usuario esperaba que Iridium avisara solo (Q-97, reporte). Q-99 ofreció que Iridium arme solo (A, recomendada), que lo ofrezca con un botón (B) o dejarlo como estaba (C).

**Decisión:** B. Cuando el código de Iridium tiene commits que la app de uso diario no tiene (el último commit no es el de `main` ni el de la versión lista), abajo aparece «Hay cambios sin armar» con **Armar**. Armar corre «Armar la última versión» en una consola a la vista, como desde Scripts; mientras arma, el aviso dice «Armando la versión nueva…», y al terminar aparece «Versión nueva lista» (CO-2). Mientras la IA de ese proyecto trabaja no se ofrece, para no armar a mitad de camino. Los cambios sin commitear no cuentan.

**Motivo:** elección del usuario: el control queda en sus manos, con un clic.

**Consecuencias:**
- `tools/actualizar.ps1` deja `release/armando.json` (con su proceso) mientras arma; si la consola se cierra, la marca deja de contar.
- Solo en la app armada (en desarrollo no hay app de uso diario); las pruebas usan `IRIDIUM_RELEASE` e `IRIDIUM_ARMAR`.

## D-072 — Las pruebas abren Iridium fuera de la pantalla
- **Fecha:** 2026-11-01
- **Ámbito:** general (pruebas y herramientas de la IA)
- **Hito o paso:** 7, entre iteraciones; a pedido del usuario
- **Estado:** vigente (amplía el punto 3 de D-062)

**Contexto:** con `IRIDIUM_SIN_FOCO` (D-062) las ventanas de las pruebas ya no robaban el foco, pero seguían apareciendo y desapareciendo, una por prueba (más de sesenta por tanda), junto con las consolas de Scripts y la app de prueba de la Revisión; el usuario no podía usar la PC mientras corrían. Preguntó por abrirlas «headless». Electron no tiene un modo sin ventana como el navegador: la ventana tiene que existir para que la prueba la use y saque capturas.

**Decisión:** `IRIDIUM_OCULTA=1` reemplaza a `IRIDIUM_SIN_FOCO`. La ventana se abre fuera de la pantalla (a 20.000 píxeles), sin botón en la barra de tareas y sin foco; para que Chromium la siga dibujando aunque la crea tapada, se le apaga el cálculo de ventanas tapadas y la pausa en segundo plano. Las consolas de Scripts corren escondidas y se cierran al terminar. La pone `playwright.config.ts` (con `IRIDIUM_OCULTA=0`, para mirar), la app de prueba de la Revisión la respeta y la usan las herramientas que abren la app (`capturas.ts`, `icono.ts`, `muestras-tema.ts`, `miniaturas-tema.ts`, `maqueta-ajustes.ts`). Fuera de las pruebas, Iridium no cambia: la consola de Armar y las de Scripts siguen a la vista.

**Motivo:** es lo más cercano a «headless» que permite Electron, sin cambiar lo que se prueba: la ventana es la de siempre, con su tamaño, y las capturas salen igual. Otras salidas (ventanas escondidas del todo, otro escritorio de Windows, una máquina virtual) o no dibujan, o no evitan que aparezcan, o son mucho más pesadas.

**Consecuencias:**
- Las pruebas no se pueden mirar mientras corren, salvo con `IRIDIUM_OCULTA=0`; lo que ve el usuario siguen siendo las capturas.
- Queda un parpadeo: la prueba del ayudante de CO-I2 (Vitest) lo lanza como en la app, con una consola minimizada que se esconde enseguida.
- Verificado por el usuario en Q-104 (2026-11-01): mientras corrían, no apareció ninguna ventana ni consola.

## D-073 — El ayudante de la Revisión entra también en una interfaz propia, sin captura ni texto si la app lo pide
- **Fecha:** 2026-11-01
- **Ámbito:** módulo Revisión (ayudante de Electron)
- **Hito o paso:** 8, entre tandas; pedido de otra app (D-086 y Q-70 A), hecho desde el proyecto de otra app a pedido del usuario
- **Estado:** vigente (amplía D-052)

**Contexto:** otra app instalada carga su interfaz desde `otra-app://`. Las extensiones no entran ahí: los `matches` de un manifiesto no aceptan esquemas propios. Además, la ventana muestra la colección privada del usuario, y los comentarios van a `docs/revision/`, que se sube a GitHub.

**Decisión:** `revision()` acepta opciones nuevas:
- `esquemas` (p. ej. `['otra-app']`): el ayudante registra un *preload* de página (`preload-marco.cjs`) que deja un puente en un mundo aislado propio (1047, con su propia política de contenido) y, en cada carga, mete ahí el mismo selector de la extensión (`js/inyectado.js`: un reemplazo de `chrome.*` sobre el puente y el selector) y `pagina.js` en el mundo de la página. Los pedidos los atiende el proceso principal de la app, que habla con el receptor como la extensión (con su origen); la página no hace ningún pedido de red, así que una sesión blindada no tiene que abrir nada. Lo que no llega con Iridium cerrado queda en `%APPDATA%\Centro de Desarrollo
evision-cola-electron.json` y sale cuando Iridium está.
- `captura: false` y `textoElemento: false`: el proceso principal borra la captura y el texto del elemento antes de mandar, aunque la página los mande.
- `extension: false`: no carga la extensión.
- Devuelve `detener()`: apaga la Revisión sin cerrar la app (F8 deja de andar, se sale del modo comentar y el puente no contesta).
- `capacidades.json` al lado del ayudante dice qué sabe hacer (`esquemas`, `sin-captura`, `sin-texto`, `detener`): la app lo lee sin ejecutar nada y no carga una versión vieja.

**Motivo:** es lo que pidió otra app y no cambia nada para las apps que usan la línea de siempre (sin opciones, igual que antes). Meter el selector desde el ayudante reusa el mismo código de la extensión.

**Consecuencias:**
- En una versión compilada sin conservar los nombres, el componente sale abreviado; otra app los conserva al compilar.
- Los borradores de la tarjeta viven mientras la app está abierta (no en `chrome.storage`).
- Prueba nueva con la app abierta: `r3-electron.spec.ts` › interfaz propia (`luna-app://` con política de contenido estricta: llega sin captura ni texto, y `detener` la apaga). Captura: `tools/salida/revision-propia.png`.


## D-074 — Una copia de prueba a mano para un conocido, sin esperar a Compartir
- **Fecha:** 2026-11-01
- **Ámbito:** general (frente Compartir)
- **Hito o paso:** 8, entre tandas; pedido del usuario
- **Estado:** vigente (adelanta una parte de lo que D-069 dejó para después)

**Contexto:** el usuario quiere pasarle Iridium a un conocido ya, y dejar para más adelante el instalador, las actualizaciones y lo demás. Se le explicó antes la condición de Anthropic (D-069, punto 3): repartir Iridium usando la suscripción de cada uno no está permitido sin aprobación. Decidió seguir igual con una copia a mano.

**Decisión:** en el escritorio del usuario queda la carpeta `Iridium para compartir`, con:
- `Iridium/`: la app armada desde `dev` (e1e7b29) en una carpeta que no se llama `win-unpacked`, así que no busca versiones nuevas ni ofrece Armar.
- `LEEME.txt`: los pasos para la persona (Git para Windows, copiar la app, crear la carpeta de proyectos con `Ideas` adentro, elegirla, iniciar sesión, pedir «Hacé la configuración inicial»).
- `Ideas/`: la carpeta del chat general, con su ficha y su `CLAUDE.md`, y `configuracion-inicial/` con las skills `hitos-desarrollo-app` y `gestor-proyectos` (esta, sin las rutas del usuario y con Iridium en lugar del Gestor), una plantilla del `CLAUDE.md` global y `GUIA-PARA-CLAUDE.md` (cómo instalar todo y qué lee Iridium de cada proyecto).

**Motivo:** el conocido puede empezar a usarlo hoy, y su Claude sabe instalar la guía y escribir con los formatos que Iridium lee, sin que el usuario le explique nada.

**Consecuencias:**
- No hay actualizaciones automáticas para esa copia: una versión nueva es otra carpeta `Iridium` que reemplaza a la vieja (los datos quedan en `%APPDATA%\Centro de Desarrollo`). Las actualizaciones desde GitHub siguen siendo de Compartir (D-070, punto 3).
- Las skills copiadas no se actualizan con las del usuario. Si la guía cambia de formato, hay que pasarle la carpeta de la skill de nuevo.
- Probado con el motor falso y una carpeta de proyectos nueva: sin carpeta, Iridium pide elegirla; con `Ideas` copiada, aparece la tarjeta con su ícono y el chat general. No se probó la configuración inicial con un Claude real: instalaría las skills en la carpeta de Claude del usuario.

## D-075 — Los radios y las sombras sueltos pasan a los tokens del design system
- **Fecha:** 2026-11-01
- **Ámbito:** general (design system)
- **Hito o paso:** 8, tanda 6 (Defecto 20, Q-107 A)
- **Estado:** vigente

**Contexto:** el detector de `impeccable` marcaba radios de 2, 4, 7 y 12 px y tres sombras escritos a mano en el CSS, que no estaban en `DESIGN.md`. `DESIGN.md` decía además que había una sola sombra, la del aviso, cuando los menús, los diálogos y Ajustes ya llevaban la suya.

**Decisión:** ningún radio ni sombra se escribe a mano. Los radios van al más cercano de `rounded`: 2 y 3 px al de medidor (las marcas finitas), 4 px al de control, 7 px (la pista del interruptor, de 14 px de alto) al de píldora, 12 px (Ajustes) al de tarjeta. Las sombras pasan a tres tokens en `docs/ui/tokens.css`: `--sombra-flotante` (el aviso), `--sombra-menu` (menús y diálogos) y `--sombra-ventana` (Ajustes). `DESIGN.md` › Elevation & Depth las nombra; los anillos de foco y de selección no cuentan como sombras.

**Motivo:** un solo lugar para cambiar el aspecto (los temas, D-065 y D-066, cambian tokens, no reglas sueltas); la diferencia a la vista es de un píxel.

**Consecuencias:** Ajustes queda con esquinas de 10 px en vez de 12; el diálogo de confirmación usa la misma sombra que los menús (era casi igual). Un tema nuevo puede cambiar las sombras.

## D-076 — Los fusibles de Electron: sin correr como Node ni `NODE_OPTIONS`; `--inspect` queda para las pruebas
- **Fecha:** 2026-11-02
- **Ámbito:** general (seguridad, armado)
- **Hito o paso:** 8, tanda 6 (Defecto 6, Q-107 A)
- **Estado:** vigente

**Contexto:** el programa armado traía todos los «fusibles» de Electron como vienen: con `ELECTRON_RUN_AS_NODE`, `NODE_OPTIONS` o `--inspect`, otro programa de la PC podía usar `Iridium.exe` para correr su propio código. Playwright y las herramientas que miden o recorren la app armada (`tools/recorrido.ts`, `medir.ts`, `accesibilidad.ts`, `capturas.ts` con la ruta del `.exe`) la abren con `--inspect`.

**Decisión:** `electron-builder.yml` › `electronFuses` apaga `runAsNode` y `enableNodeOptionsEnvironmentVariable`, y prende `onlyLoadAppFromAsar` (solo carga la app de su `app.asar`). `enableNodeCliInspectArguments` queda prendido.

**Motivo:** los dos que se apagan son los que se usan para colar código sin que se note (una variable de entorno). `--inspect` necesita lanzar Iridium con ese argumento, lo mismo que haría falta para lanzar cualquier otro programa; apagarlo dejaría sin pruebas a la app de uso diario.

**Consecuencias:** Iridium no usa ninguna de las dos cosas (Claude Code es su propio `claude.exe`; las consolas y el ayudante de la versión nueva ya sacaban `ELECTRON_RUN_AS_NODE` del entorno). Si algún día no hacen falta las pruebas sobre la app armada, se puede apagar `--inspect` también.

## D-077 — Iridium sigue sin número de versión por ahora: fecha y commit
- **Fecha:** 2026-11-02
- **Ámbito:** general (lanzamiento)
- **Hito o paso:** 9 (Q-109)
- **Estado:** vigente

**Contexto:** el hito 9 pide versión etiquetada y `CHANGELOG.md`. Hoy Ajustes › Acerca de y el aviso de la versión nueva muestran cuándo se armó y su commit (CO-I5).

**Decisión:** por ahora queda así: sin número, sin etiquetas en git y sin `CHANGELOG.md`. Más adelante será la opción A de Q-109 (1.0.0 y sube sola con cada armado, `CHANGELOG.md` en palabras del usuario, el número en Acerca de y en el aviso).

**Motivo:** el usuario lo eligió (Q-109): con una sola persona usándolo, la fecha y el commit alcanzan para saber qué está puesto.

**Consecuencias:** el punto «Versión etiquetada y `CHANGELOG.md`» del portón del hito 9 queda como hueco aceptado. Lo que se puso y cuándo queda en `release\actualizacion.log` (cada «Versión nueva puesta»), y la tabla de `09-lanzamiento.md` › Historial de lanzamientos anota las que marcan algo (un hito, una vuelta atrás). `package.json` sigue en 0.1.0 sin que nadie lo lea.

## D-078 — Volver atrás es armar la versión anterior, con `pnpm volver`
- **Fecha:** 2026-11-02
- **Ámbito:** general (lanzamiento)
- **Hito o paso:** 9 (Q-110)
- **Estado:** vigente

**Contexto:** la versión anterior se borra apenas entra la nueva (`tools/cambiar-version.ps1`). Guardarla costaba unos 670 MB más; el usuario eligió no guardarla (Q-110, B).

**Decisión:** `pnpm volver` (`tools/volver.ps1`, `scripts.md` › Volver a la versión anterior) arma un commit anterior y lo pone igual que una versión nueva. Sin decirle cuál, toma la versión que se puso antes que la de ahora, de `release\actualizacion.log`; con `-Commit <commit>`, la que se le diga. Arma en una copia aparte del código (un `git worktree` en `release\volver`, que se borra al terminar), así `dev` y los cambios sin commitear no se tocan. `main` vuelve a ese commit, también en GitHub (empujado a la fuerza: los commits siguen en `dev`).

**Motivo:** no ocupa disco y reusa todo el camino de la actualización (armar al lado, entrar al cerrar, el aviso si no entra). Que `main` vuelva atrás mantiene lo que dice D-070 (`main` es lo que está en la app) y hace que Iridium ofrezca «Hay cambios sin armar» con lo que quedó afuera.

**Consecuencias:** volver tarda lo que un armado más instalar las dependencias de esa versión (unos minutos) y necesita que ese commit arme bien. Mientras la versión mala no se arregle, no hay que tocar **Armar**: volvería a ponerla. Si la app no abre, se corre desde una consola en la carpeta del proyecto (o desde VS Code), no desde Iridium.

## D-079 — Los frentes que siguen: Inicio, después Diseño y Capacidades
- **Fecha:** 2026-11-02
- **Ámbito:** general (plan de frentes, D-063; hito 10)
- **Hito o paso:** 10 (Q-112)
- **Estado:** vigente (cambia el orden de D-063)

**Contexto:** con el hito 9 cerrado, el Backlog (`10-operacion.md`) tiene tres frentes en espera, que D-063 dejó en el orden Inicio, Capacidades y Diseño.

**Opciones (Q-112):** A) Inicio (elegida); B) Capacidades; C) Diseño; D) ningún frente por ahora, solo mantenimiento.

**Decisión:** primero Inicio, después Diseño y después Capacidades.

**Motivo:** lo eligió el usuario.

**Consecuencias:** se abre el módulo Inicio (`modulos/inicio/`), que es la próxima versión de `10-operacion.md`. `02-definicion.md` › Módulos previstos cambia el orden de los que esperan.

## D-080 — La carpeta para compartir explica Iridium por dentro e instala el comprobador de preguntas
- **Fecha:** 2026-11-04
- **Ámbito:** general (la carpeta `Iridium para compartir`, D-074; hito 10)
- **Hito o paso:** 10 (Q-116)
- **Estado:** vigente (amplía D-074)

**Contexto:** el Claude de la persona que recibió Iridium no sabía que trabajaba desde Iridium ni cómo escribir `docs/scripts.md`. La guía de la carpeta (`Ideas/configuracion-inicial/GUIA-PARA-CLAUDE.md`) solo la leía el chat general, una vez; en los proyectos, Iridium agrega una sola línea, y las instrucciones globales casi no hablaban de Iridium. Además, la configuración no instalaba el hook `Stop` que corre `comprobar-preguntas.mjs`, que el usuario tiene en su `settings.json`.

**Opciones (Q-116):** A) solo la carpeta: una guía más completa y lo esencial en las instrucciones globales (elegida); B) solo la app: la línea que agrega Iridium nombra la skill y `scripts.md`; C) las dos. Se descartó también que Iridium instale las skills al abrirse.

**Decisión:** A. La guía tiene tres partes: cómo funciona Iridium por dentro (el SDK con su propia CLI, `bypassPermissions`, qué configuración carga, los tres chats, de dónde sale cada sección), la configuración inicial en nueve pasos con una lista de comprobación final (suma Node y el hook del comprobador), y los formatos que lee Iridium con ejemplos. La plantilla del `CLAUDE.md` global suma «Trabajar desde Iridium», que llega a todos los chats. `Ideas/CLAUDE.md` revisa también esa sección, y el `LEEME.txt` pide Node y explica cómo repetir la revisión.

**Motivo:** lo eligió el usuario: es más simple y no hay que armar la app de nuevo.

**Consecuencias:**
- Las memorias y el resto del `CLAUDE.md` del usuario no viajan: son personales. Lo único que faltaba de su configuración era el hook del comprobador; sus avisos de Windows (los otros hooks) no hacen falta en Iridium.
- La carpeta solo está en el escritorio, no en el repo: si cambian los formatos que lee Iridium (`src/main/core/visor/`), hay que cambiar también la parte 3 de la guía.
- Quien ya hizo la configuración copia `configuracion-inicial` y `CLAUDE.md` nuevos y pide «Revisá la configuración inicial».
- El comprobador se probó con la copia de la carpeta: pasa con `Ideas` y con este proyecto, y marca una pregunta mal escrita. La configuración con un Claude real sigue sin probarse.

## D-081 — La sección Git crea el repositorio y lo publica en GitHub, con la sesión de GitHub de git
- **Fecha:** 2026-11-04
- **Ámbito:** general (la sección Git, H-16; hito 10)
- **Hito o paso:** 10 (Q-117)
- **Estado:** vigente (ajusta D-041 y C-56: la sección Git deja de ser solo para mirar en estas dos acciones)

**Contexto:** el usuario preguntó si Iridium hace lo que la extensión de git de VS Code: con una carpeta sin repositorio, ofrecer crearlo; con un repositorio solo local, ofrecer publicarlo en GitHub como privado o público; y que se pueda ignorar. La sección Git era solo para mirar (D-041) y para eso había que pedírselo a Claude.

**Opciones (Q-117):** A) dos botones en Git: **Inicializar repositorio** y **Publicar en GitHub** (elegida); B) un botón que deja el pedido escrito en el chat; C) dejarlo como está. El usuario sumó: «facilitar la operación para que haga pocas cosas», y dejó a la IA decidir cómo se inicia la sesión de GitHub.

**Cómo se inicia la sesión de GitHub** (lo decidió la IA, como pidió el usuario):
1. **La sesión de git, con el Administrador de credenciales que trae Git para Windows (elegida).** Si no hay sesión, git abre su ventana para iniciarla; si hay, no pide nada. Es la misma que usan los `push` de la IA: una sola sesión para todo. No hace falta instalar nada más ni registrar una app en GitHub. Probado en esta PC: la sesión guardada tiene el permiso `repo`, que alcanza para crear repositorios.
2. Una sesión propia de Iridium (el inicio con código de GitHub, como hace con Claude): hay que registrar una app de GitHub y guardar la clave; los `push` de la IA igual usan la de git, así que serían dos sesiones.
3. El programa `gh` de GitHub: no viene instalado (tampoco en esta PC) y sería un paso más para quien recibe Iridium.

**Decisión:**
- **Inicializar repositorio**, en el lugar del aviso «Este proyecto no usa git»: crea el repositorio con la rama `main` y un primer commit («Primer commit») con todo lo que hay. Antes agrega al `.gitignore` `node_modules/` (si existe y no está ignorada) y los archivos que suelen tener claves (`.env` y parecidos, menos los de ejemplo; `.pem`, `.key`, `.pfx`, `.p12`, llaves SSH), y avisa cuáles quedaron afuera.
- **Publicar en GitHub**, debajo de «Solo en esta PC» (solo con commits): un cuadro con la cuenta, el nombre (el de la carpeta, sin espacios ni acentos) y **Privado** (de entrada) o **Público**. Crea el repositorio en GitHub, lo pone como `origin` y sube la rama.
- Nada más cambia el repositorio desde Iridium: los commits, ramas y `push` siguen siendo de la IA.

**Motivo:** el usuario hace dos clics en lugar de explicar el pedido; la sesión es la que git ya usa.

**Consecuencias:**
- La clave de GitHub solo pasa por el proceso principal, en memoria: no se guarda, no se registra ni llega a la ventana. Si GitHub la rechaza, se le pide a git que la olvide, y la próxima vez se vuelve a iniciar.
- Sin Git para Windows (o con otro git sin el Administrador de credenciales), Publicar avisa que hace falta.
- Si GitHub crea el repositorio pero falla la subida, el aviso da la dirección y sugiere pedírselo a Claude.
- Para las pruebas, `IRIDIUM_GITHUB=falso`: la cuenta «prueba» y repositorios en una carpeta temporal.

## D-082 — El repo de Iridium no nombra los otros proyectos del usuario
- **Fecha:** 2026-11-04
- **Ámbito:** general
- **Hito o paso:** 10 (Q-119)
- **Estado:** vigente

**Contexto:** el usuario notó que el repo nombra sus otros proyectos (un proyecto de catálogo, otro de juego, el gestor anterior, la carpeta de skills…) en las pruebas, el código, las herramientas y los documentos. «Una cosa es la app en uso y otra el proyecto de Iridium»: los proyectos que Iridium muestra son datos de quien lo usa, no parte del producto. Además confunden a la IA que trabaja en Iridium (no sabe si un nombre es una muestra o un proyecto real) y se filtran a quien recibe Iridium (D-080).

**Opciones (Q-119):** A) limpieza total (elegida); B) solo código y pruebas, los documentos como historial; C) solo lo que ve quien recibe Iridium.

**Decisión:** ningún archivo del repo nombra un proyecto del usuario ni su carpeta de proyectos.
1. **Pruebas y muestras:** proyectos con nombres neutros (Alfa, Beta, Gamma, Delta…); las muestras copiadas de archivos reales (`tests/muestras/`) se reemplazan por textos inventados con el mismo formato.
2. **Código y herramientas:** comentarios con ejemplos neutros; las herramientas que corren sobre una copia de los proyectos (`recorrido.ts`, `medir.ts`) eligen los proyectos de la copia sin nombrarlos.
3. **Dependencias reales:** la carpeta de proyectos por defecto (hoy la ruta de esta PC) y las carpetas de Ideas y de Skills dejan de estar escritas en el código; dónde van se decide en Q-120.
4. **Documentos:** donde se nombra otro proyecto se habla de «otra app» o se dice lo que importa para Iridium; lo que fue de otro proyecto (un pedido, una prueba en él) queda resumido en una línea o se mueve a ese proyecto. Es la única excepción a «las decisiones no se borran»: se cambian los nombres y se acorta el contexto ajeno, no lo que se decidió.
5. **Lo que sí se nombra:** las skills que Iridium usa (la guía de hitos, la de la ficha del proyecto) son parte del método del producto, no proyectos.

**Motivo:** el producto se entiende sin saber qué proyectos tiene su autor; la IA no mezcla muestras con datos reales; compartir Iridium no comparte la lista de proyectos.

**Consecuencias:**
- Se hace por etapas: pruebas y código, después las dependencias (con Q-120), después `docs/`.
- `CLAUDE.md` suma la regla, y las pruebas nuevas usan nombres neutros.
- El historial de git sigue teniendo los nombres viejos; qué hacer con él, en Q-121.

## D-083 — Ideas y Skills viven en una carpeta «Iridium» aparte de los proyectos
- **Fecha:** 2026-11-04
- **Ámbito:** general (ajusta D-060, D-068 e IN-3)
- **Hito o paso:** 10 (Q-120)
- **Estado:** reemplazada en parte por D-087: la carpeta pasa a ser `.iridium`, dentro de la carpeta de proyectos; la mudanza y lo demás siguen

**Contexto:** las carpetas del chat general (`Ideas`) y de la sección Skills estaban dentro de la carpeta de proyectos, con nombres fijos, y la grilla las escondía por nombre. El usuario pidió que no sean carpetas de proyecto: no se usan igual ni para lo mismo, y quien recibe Iridium no las tiene. Además, la carpeta de proyectos por defecto era la ruta de esta PC (D-082).

**Opciones (Q-120):** A) una carpeta «Iridium» aparte con `Ideas` y `Skills`, que se cambia en Ajustes, y la mudanza de las del usuario una vez, con confirmación (elegida); B) dentro de los datos de Iridium (`AppData`); C) cada carpeta por separado en Ajustes.

**Decisión:**
1. **La carpeta Iridium** (`carpetaIridium` en `config.json`): de entrada `Documentos\Iridium`. Adentro, `Ideas` (el chat general y `ideas.md`) y `Skills` (el chat de Skills y las skills propias en `skills\`).
2. **Al abrir**, si falta alguna de las dos, Iridium la crea con su `CLAUDE.md` y lo mínimo (`ideas.md`, `skills\`). No la crea si hay una para mudar.
3. **La mudanza:** si en la carpeta de proyectos están las de antes (`Ideas`, `Skills`), el inicio avisa y ofrece **Mover**, con confirmación. Mover las lleva a la carpeta Iridium con su git, rehace los enlaces de `.claude\skills` que apuntaban a las skills propias, lleva las conversaciones de Claude Code de esas carpetas y cambia su ruta en lo que Iridium recuerda (sesiones, borradores, ajustes). Si algo falla, avisa y deja todo donde estaba.
4. **Ajustes › General** muestra la carpeta Iridium y permite cambiarla: Cambiar mueve las dos carpetas a la elegida con la misma mudanza.
5. **La grilla** muestra solo las carpetas de la carpeta de proyectos; Ideas y Skills llegan aparte en la lista y se abren con **Abrir como proyecto**, como hasta ahora.
6. **La carpeta de proyectos por defecto** pasa a ser `Documentos\Proyectos`; ya no se lee de la configuración de otra app. Si no existe, el inicio ofrece elegirla, como antes.

**Motivo:** lo que es de Iridium queda junto y aparte de los proyectos; quien recibe Iridium tiene las dos carpetas desde el primer día; el código no conoce rutas ni nombres del usuario.

**Consecuencias:**
- Las pruebas ponen la carpeta Iridium en su carpeta temporal (sin `carpetaIridium`, con `IRIDIUM_DATOS` va dentro de esa carpeta: nunca en Documentos).
- La carpeta de skills del usuario deja de estar en la carpeta de proyectos: lo que la nombra fuera de Iridium (sus instrucciones globales, sus scripts) se pone al día en una sesión de esa carpeta.

## D-084 — Al terminar la limpieza, el repo empieza de nuevo con un solo commit
- **Fecha:** 2026-11-04
- **Ámbito:** general
- **Hito o paso:** 10 (Q-121)
- **Estado:** vigente (ajusta D-078 hasta que haya versiones nuevas)

**Contexto:** después de D-082 los archivos quedan limpios, pero los commits viejos siguen nombrando los otros proyectos.

**Opciones (Q-121):** A) dejar el historial; B) reescribirlo; C) repo nuevo con un solo commit (elegida).

**Decisión:** cuando terminen las tres etapas de D-082 y D-083, el repo arranca de nuevo: un commit «Iridium» con todo lo de ese momento, en `main` y en `dev`, subido a `LlanosLautaro/Iridium` reemplazando lo que había (no se puede borrar el repo de GitHub con la sesión de git, que no tiene ese permiso). Antes se guarda un respaldo del historial viejo en un solo archivo (`git bundle`) fuera del repo, en la carpeta Iridium; se borra cuando el usuario quiera.

**Motivo:** el usuario prefiere un repo sin rastros de sus otros proyectos.

**Consecuencias:**
- Volver atrás (`pnpm volver`, D-078) no tiene a qué volver hasta la próxima versión armada.
- Las referencias a commits viejos en `docs/` dejan de servir: la etapa 3 de D-082 las saca.
- Hecho el 2026-11-04: commit «Iridium» (`1a2386a`) en `dev` y `main`, subido forzado. El respaldo quedó en `Respaldo de Iridium\historial-iridium-hasta-2026-11-04.bundle`, junto a la carpeta de proyectos ( no en la carpeta Iridium: todavía no está elegida, Q-125), con las capturas que salieron del repo. GitHub puede seguir guardando un tiempo los commits viejos por su número, aunque ya no los muestra.

## D-085 — Las copias compartidas se actualizan solas desde las versiones publicadas en GitHub
- **Fecha:** 2026-11-04
- **Ámbito:** general (frente Compartir; precisa D-070 punto 3 y D-074)
- **Hito o paso:** 10, a pedido del usuario («compartir Iridium lo antes posible y asegurarnos de poder hacerle llegar actualizaciones bien a la otra persona»)
- **Estado:** vigente (Q-123: A, el repo privado con la otra persona como colaboradora; desde D-132 el repo es público y la invitación no hace falta)

**Contexto:** la copia que el usuario le pasó a otra persona (D-074) no se actualizaba: cada versión era otra carpeta para reemplazar a mano. D-070 ya había dejado pensado que, al repartir, las copias de otros se actualicen desde GitHub y la del usuario siga armándose en su PC.

**Decisión:** lo que eligió la IA para cumplir el pedido, reusando lo que ya funciona en la copia del usuario (CO-I2):
1. **Publicar** (`pnpm publicar`, `tools/publicar.ts`): sube la app de uso diario (lo que marca `main`) como versión de GitHub, un `.zip` con la carpeta `win-unpacked` y, adentro, `resources/actualizaciones.json` con el repositorio y el commit. La etiqueta es `iridium-AAAA-MM-DD-HHMM-<commit>`. Con `--desde`, publica una versión armada en otra carpeta sin tocar la app del usuario. Lo decide el usuario: no se publica solo.
2. **La copia compartida** es la que trae ese archivo. Al abrir (a los 20 s) y cada seis horas mira la última versión publicada; si es otra, la baja a `release/nueva` con su `lista.json`, y desde ahí es lo de siempre: abajo dice «Versión nueva lista · entra al cerrar», y entra al cerrar Iridium o con **Reiniciar ahora**. No ofrece Armar (no tiene el código).
3. **Acceso:** primero pregunta sin clave (sirve si el repositorio es público); si GitHub no lo deja ver, usa la sesión de GitHub que ya tiene git, sin abrir ninguna ventana. Sin acceso o sin internet, lo anota en el registro y vuelve a probar en la próxima vuelta.
4. **La copia del usuario** no trae el archivo: se sigue armando en su PC (D-070, D-071).

**Motivo:** la otra persona no hace nada para actualizarse, y el cambio de carpeta al cerrar ya está probado en el uso diario (CO-I2, Defecto 3).

**Consecuencias:**
- La primera vez, la otra persona necesita una copia que ya traiga `actualizaciones.json`: el `.zip` de la primera versión publicada, descomprimido de modo que quede `…\Iridium\win-unpacked\Iridium.exe`.
- Con el repositorio privado, la otra persona necesita acceso (colaboradora) y la sesión de GitHub en su git. **Q-123: A** (2026-11-04): repo privado y colaboradora. Para eso, la copia compartida avisa abajo cuando no ve las versiones: sin sesión, «Para recibir versiones nuevas, iniciá sesión en GitHub» con **Iniciar sesión** (la ventana de git, como Publicar en GitHub, D-081); con una cuenta sin invitación, «Sin acceso a las versiones nuevas» con **Probar de nuevo**. Al iniciar sesión vuelve a mirar enseguida. Con otra API (las pruebas) nunca usa la clave de git: solo `IRIDIUM_GITHUB_CLAVE`.
- Pruebas: `tests/d085-versiones-github.test.ts`, con un GitHub falso en la PC (misma versión, otra, una privada con y sin clave, sin internet). Las pruebas con la app usan `IRIDIUM_ACTUALIZACIONES` e `IRIDIUM_GITHUB_API`.

## D-086 — Una skill «iridium» viaja con Iridium y se carga solo en sus conversaciones, con la guía de hitos si falta
- **Fecha:** 2026-11-04
- **Ámbito:** general (motor; reemplaza parte de la configuración inicial de D-080)
- **Hito o paso:** 10 (Q-124)
- **Estado:** vigente; la parte de la guía de hitos (cargarla si la PC no la tiene) la reemplaza D-092: desde OR-I1 (2026-11-06) Iridium carga solo el framework

**Contexto:** el Claude que trabaja desde Iridium no siempre escribía los formatos que Iridium lee (Q-115: pruebas con casillas y además «A) Todo bien»), y el de la persona que recibe Iridium dependía de una configuración inicial a mano (D-080). El usuario preguntó si una skill de Iridium interferiría con el Claude de afuera, porque las skills se instalan en la carpeta de Claude.

**Opciones (Q-124):** A) una skill «iridium» que viaja con Iridium y se carga solo dentro de Iridium (elegida); B) varias skills chicas; C) como antes, skills globales y configuración inicial.

**Decisión:**
1. **Complementos de la sesión:** el SDK carga «plugins» por sesión. Iridium pasa los suyos en cada conversación; el Claude de VS Code o de la terminal no los ve.
2. **`iridium`** (`recursos/plugins/iridium`): la skill `iridium:iridium` con cómo trabajar desde Iridium (los tres chats) y los formatos que lee: `estado.md`, las `Q-n` (las pruebas y tareas, **solo con casillas**), las respuestas, `scripts.md`, códigos y frentes, los comentarios de la Revisión y la ficha `.proyecto.json`.
3. **`guia`**: la guía de hitos (`hitos-desarrollo-app`), copiada al armar de la carpeta de skills de quien arma (`tools/armar-plugins.mjs`). Se carga solo si la PC no la tiene instalada: así no aparece dos veces para el usuario y llega sola a quien recibe Iridium.
4. **La de la ficha (`gestor-proyectos`) no viaja tal cual:** está escrita para la PC del usuario (sus rutas y sus proyectos). Lo que Iridium necesita de la ficha va en la skill `iridium`.

**Motivo:** el formato lo pone Iridium, que es quien lo lee; el Claude de afuera queda como estaba; quien recibe Iridium no instala nada para que su Claude trabaje bien.

**Consecuencias:**
- Si la guía cambia, entra en la próxima versión armada (y publicada). La skill `iridium` se cambia junto con lo que Iridium lee (`src/main/core/visor/`, pendientes, scripts): reemplaza al pendiente de D-080 sobre la guía de la carpeta para compartir.
- La configuración inicial de la carpeta para compartir se achica: ya no hace falta instalar la guía.
- Probado: `tests/d086-complementos.test.ts` y `tools/probar-complementos.ts` con el Claude Code real, sin mandar mensajes: suma `iridium:iridium` e `iridium-guia:hitos-desarrollo-app`.

## D-087 — Ideas y Skills viven en `.iridium`, dentro de la carpeta de proyectos, como un vault
- **Fecha:** 2026-11-04
- **Ámbito:** general (reemplaza el lugar de D-083)
- **Hito o paso:** 10 (Q-125)
- **Estado:** vigente

**Contexto:** con Q-115 el usuario propuso que la carpeta que se elige para Iridium funcione como un vault de Obsidian: adentro, una carpeta `.iridium` con lo de Iridium (las skills y los datos internos, como las ideas) y la opción de respaldarla en GitHub. D-083 había puesto Ideas y Skills en una carpeta aparte, que se elegía en Ajustes.

**Opciones (Q-125):** A) `.iridium` dentro de la carpeta de proyectos; los proyectos no se mueven; respaldo opcional (elegida); B) una carpeta con `.iridium` y al lado `projects`, moviendo todos los proyectos; C) dejar D-083 y sumar solo el respaldo.

**Decisión:**
1. **La carpeta de Iridium es `<carpeta de proyectos>\.iridium`**, con `Ideas` y `Skills` adentro. No se elige aparte: va con la carpeta de proyectos. La grilla no la muestra (empieza con punto).
2. **Ajustes › Proyectos** muestra dónde está, sin **Cambiar…**: para moverla se cambia la carpeta de proyectos.
3. **Mover** trae Ideas y Skills desde donde estén: sueltas en la carpeta de proyectos (`Ideas`, la carpeta de skills de antes), en la carpeta Iridium aparte de D-083 (la elegida o la de Documentos), o en el `.iridium` de la carpeta de proyectos anterior. Al cambiar la carpeta de proyectos, el `.iridium` de la anterior queda anotado (`carpetaIridium` en `config.json`) para que Mover lo traiga. La mudanza es la de D-083: con su git, los enlaces de las skills y las conversaciones.
4. Si la carpeta de proyectos no existe, `.iridium` no se crea (crearla de rebote escondía que faltaba; lo encontró la prueba de CO-4).

**Motivo:** todo lo de Iridium queda junto a lo que maneja, como en Obsidian, sin mover ningún proyecto; elegir una sola carpeta alcanza.

**Consecuencias:**
- Los datos internos (`%APPDATA%\Centro de Desarrollo`: ajustes, sesiones, borradores) siguen donde estaban: `config.json` dice cuál es la carpeta de proyectos, así que no puede vivir adentro de ella. Llevar a `.iridium` lo que no depende de la PC queda para después.
- **Respaldo en GitHub:** hoy ya se puede con lo que hay: Ideas y Skills son repos git; **Abrir como proyecto** › Git › **Publicar en GitHub** (D-081) sube cada una como repo privado. Un botón único en Ajustes queda en el Backlog.
- Q-122 (probar Mover) se reescribe para `.iridium`. La carpeta para compartir copia `Ideas` adentro de la carpeta de proyectos y Mover la lleva a `.iridium`.
- Pruebas: `tests/d083-carpeta-iridium.test.ts` (traer de una carpeta anterior) y `tests/e2e/d083-carpeta-iridium.spec.ts` (Mover a `.iridium`; cambiar la carpeta de proyectos y traerla).

## D-088 — Un comentario de la Revisión se cierra solo cuando está hecho; lo que queda para después es «anotado»
- **Fecha:** 2026-11-05
- **Ámbito:** módulo Revisión (`modulos/revision/diseno-tecnico.md` › Datos)
- **Hito o paso:** 10 (R-9)
- **Estado:** vigente

**Contexto:** R-9: la IA cerraba los comentarios que solo dejaba anotados en el Backlog (R-7, R-8, con «cerrado por la IA: anotado en…»), porque la skill `iridium` decía «si no lo resolvés ahora, igual lo cerrás». Para el usuario, cerrado tiene que querer decir arreglado.

**Decisión:** un tercer estado, `anotado`. La IA cierra un comentario solo cuando lo hizo; si lo deja para un plan, escribe **Estado** `anotado` y en la Historia «anotado por la IA: <dónde y por qué>». Iridium lo muestra en un grupo aparte (Abiertos · Anotados · Cerrados), con el chip gris «anotado» y dónde quedó; no lo cuenta entre los abiertos (no se le pide a la IA en cada sesión); se puede **Enviar ahora** para que se haga. Cuando se hace, la IA lo cierra.

**Motivo:** el usuario distingue de un vistazo lo arreglado de lo prometido, sin que los anotados vuelvan a cada sesión como si fueran nuevos.

**Consecuencias:**
- La skill `iridium`, la instrucción de las sesiones y el mensaje de Enviar ahora dicen la regla. R-7 y R-8 pasan a `anotado`.
- Pruebas: `tests/revision-core.test.ts` (leer `anotado`) y `tests/e2e/r2-revision.spec.ts` (el grupo Anotados).

## D-089 — El menú del clic derecho en la tarjeta, Nuevo proyecto, y las ideas y las skills de cada proyecto
- **Fecha:** 2026-11-05
- **Ámbito:** general (Proyectos y la vista del proyecto; C-9, C-10, C-12)
- **Hito o paso:** 10 (R-7 y R-8, anotados en D-088; el usuario pidió hacerlos)
- **Estado:** vigente; el punto 3 (Nuevo proyecto), reemplazado por D-101

**Contexto:** R-7 pedía el clic derecho de la tarjeta con las opciones que tenía el Gestor y un botón para crear proyectos; R-8, un ícono con las ideas del proyecto y otro con sus skills, este solo si existen. Hasta ahora Iridium solo leía las fichas (`05-arquitectura.md` › Modelo de datos: «el Centro solo lee en el MVP»).

**Decisión:**
1. **Clic derecho** (o la tecla de menú, o Mayús+F10) en una tarjeta: **Abrir**, **Abrir en VS Code**, **Abrir la carpeta**; el **Estado** (todos menos En rescate, que necesita decir qué proyecto lo reemplaza: eso se le pide a la IA), **Archivar** / **Desarchivar** (con **Deshacer** en el aviso) y **Cambiar ícono…** (una imagen de la carpeta del proyecto). Elegir un estado en un proyecto sin ficha la crea; archivar y el ícono esperan a que tenga una. Con la ficha dañada, solo abrir.
2. **Iridium escribe la ficha** solo en esos tres campos, con el código del Gestor (D-026): de forma atómica y conservando lo que no conoce. Descripción, etiquetas y reemplazo siguen siendo de la IA.
3. **Nuevo proyecto**, arriba de la grilla (y en la carpeta vacía): el nombre y, si se quiere, la idea. Iridium crea la carpeta, la abre y le manda a la IA el primer mensaje: que lo arranque con la guía (hito 0) y haga la ficha y el ícono. No hay formulario de la ficha: lo hace la IA, como en el resto.
4. **VS Code** se abre lanzando `Code.exe` directo (se busca al lado del `code` del PATH y en las dos instalaciones de siempre), sin consola.
5. **En la barra del proyecto**, **Ideas del proyecto** (siempre) muestra las secciones de la guía donde se anotan las ideas: `07-construccion.md` › Ideas nuevas y `00-idea.md` › Ideas para después, como en Docs y con un botón a su documento. **Skills del proyecto** aparece solo si el proyecto tiene alguna en `.claude/skills/` (Claude Code las carga solo ahí; es lo de «elegir por proyecto» que D-064 dejó para después, solo para verlas): nombre, descripción y **Ver** en Archivos.

**Motivo:** lo del Gestor que más se usa, sin salir de Iridium; las ideas, a un clic en vez de buscarlas en Docs; las skills del proyecto, a la vista solo donde las hay.

**Consecuencias:**
- `05-arquitectura.md` › Modelo de datos y Seguridad: Iridium escribe estado, archivado e ícono de `.proyecto.json` y crea la carpeta de un proyecto nuevo.
- La skill `iridium` dice que el usuario puede cambiar esos campos desde Iridium y qué muestran las dos secciones nuevas.
- Sigue pendiente de C-8 y C-9: buscar entre proyectos, agruparlos y filtrarlos (`10-operacion.md` › Backlog).
- Pruebas: `tests/r7-r8-proyectos.test.ts`, `tests/gestor/core-edicion.test.ts`, `tests/gestor/app-edicion.test.ts` y `tests/e2e/r7-r8-proyectos.spec.ts` (capturas `tools/salida/r7-*.png` y `r8-*.png`). `IRIDIUM_VSCODE=falso` hace que las pruebas no abran VS Code ni el explorador.

## D-090 — Eliminar un proyecto desde el menú de la tarjeta, con confirmación y a la papelera
- **Fecha:** 2026-11-05
- **Ámbito:** general (Proyectos; C-12)
- **Hito o paso:** 10 (R-10)
- **Estado:** vigente

**Contexto:** R-10: el menú del clic derecho (D-089) tenía que poder eliminar el proyecto, con confirmación. El caso de uso Eliminar del Gestor (D-006 de esa app, copiado con D-026) ya estaba en el código y probado, sin usar.

**Decisión:**
1. **Eliminar…** va al final del menú de la tarjeta, en rojo, también con la ficha dañada o sin ficha.
2. Antes de tocar nada, Iridium mira la carpeta y muestra la confirmación: cuántos archivos van a la **papelera de Windows** (y si va el historial de Git) y qué carpetas regenerables (`node_modules`, `out`, `.venv`… con su marcador al lado) se borran definitivamente, con su tamaño. El foco empieza en **Cancelar**: Enter o Esc no borran.
3. Con **Eliminar**, se ejecuta el plan que armó el proceso principal (la ventana no dice qué borrar). Si la IA de ese proyecto está trabajando, no se elimina. Un aviso dice «está en la papelera de Windows».

**Motivo:** lo que se pide sin salir de Iridium, sin perder nada por un clic de más: todo lo que no se regenera se puede recuperar de la papelera.

**Consecuencias:**
- `05-arquitectura.md` › Seguridad: Iridium manda un proyecto a la papelera cuando el usuario lo confirma.
- `IRIDIUM_PAPELERA` (una carpeta): en las pruebas, lo que iría a la papelera se mueve ahí.
- Pruebas: `tests/e2e/r7-r8-proyectos.spec.ts` (Eliminar, captura `tools/salida/r10-eliminar.png`) y las del caso de uso en `tests/gestor/`.

## D-091 — Un frente «Orden» con prioridad máxima: auditoría, un solo modelo y la UX rehecha; las funciones nuevas esperan
- **Fecha:** 2026-11-05
- **Ámbito:** general
- **Hito o paso:** 10, a pedido del usuario; responde también Q-131 (en el chat)
- **Estado:** vigente (el punto 3 lo cambia D-102: Diseño pasa adelante)

**Contexto:** el usuario notó una caída de la UX a medida que avanzó la app, `Q-n` que a veces llegan mal escritas, ideas que no se pueden citar (Q-131) y frentes mal mostrados (Q-126 es de Compartir y aparece en el núcleo). La causa común: todo creció a parches, una decisión por pedido, sin que nadie mire el conjunto (`modulos/orden/propuesta.md`).

**Decisión:**
1. Un frente nuevo, **Orden** (`modulos/orden/`), activo y primero. Va en este orden: auditoría (la UX de la app real y la forma de trabajo), un solo modelo (todo lo que se sigue tiene código, frente y estado; los frentes terminados siguen «en operación»), un solo marco (D-092), la UX sobre ese modelo (`04-ux.md` reescrito sin capas) y construir.
2. **Se frenan las funciones nuevas** mientras dure: los `R-n` y los ajustes nuevos se anotan y se resuelven por tandas en una ronda de UX. Siguen las pruebas pedidas (Q-118, Q-130) y la invitación (Q-126).
3. **Diseño no se adelanta:** es una herramienta para diseñar otros proyectos, no arregla la UX de Iridium. Diseño y Capacidades quedan detrás de Orden (cambia el orden de D-079).
4. **Q-131 queda adentro** con su opción B ampliada: las ideas con un formato y un lugar por proyecto, estado, código propio, anotables sin la IA y todas juntas.
5. Pedido del usuario que ya entra: **Pendientes agrupados por frente**, con filtros arriba («Todos · Núcleo · Compartir…» con su cuenta) en vez de una pestaña por frente que escondería lo que frena en otro. Primero hace falta el dato: que cada `Q-n` sepa su frente.

**Motivo:** seguir sumando funciones sobre un modelo y una UX desordenados agranda el problema; ordenar primero hace que lo que venga después (Diseño, Capacidades) caiga en un lugar claro.

**Consecuencias:**
- `02-definicion.md` › Módulos previstos y `10-operacion.md` › Backlog: Orden primero.
- La guía suma una ronda de UX periódica en operación (va con D-092).

## D-092 — La guía de hitos y la skill de Iridium se funden en un solo marco, el de Iridium, con un control de formato
- **Fecha:** 2026-11-05
- **Ámbito:** general
- **Hito o paso:** 10, a pedido del usuario
- **Estado:** vigente

**Contexto:** hay dos reglamentos: la guía `hitos-desarrollo-app` (cómo se desarrolla un proyecto) y la skill `iridium` (cómo lo lee Iridium, D-086); se pisan en los formatos y la skill dice «si no coinciden, manda esta». Las reglas de la ficha están además en `gestor-proyectos`. El usuario: la guía queda reemplazada por el marco de Iridium y esas skills se eliminan.

**Decisión:**
1. **Un solo marco**, el de Iridium: el método por hitos, los formatos que Iridium lee y la ficha. Su fuente está en el repo de Iridium (`recursos/plugins/`), viaja con cada versión y la copia compartida lo recibe sola.
2. **Liviano:** lo que se usa en cada sesión, en la skill; el detalle de cada hito, en referencias que se leen cuando hacen falta, para no cargar todo en cada conversación.
3. **Un control:** Iridium ya lee las `Q-n` y el resto de los formatos; marca lo que no los cumple y, al cerrar la sesión, se lo devuelve a la IA para que lo corrija. Cada error nuevo corrige la regla del marco y lo que revisa el control, nunca un parche suelto.
4. **Las skills viejas** (`hitos-desarrollo-app`, `gestor-proyectos`) se eliminan cuando el marco funcione, en el chat de Skills; las instrucciones globales y los `CLAUDE.md` de los proyectos pasan a citar el marco.

**Motivo:** una sola fuente de verdad: nada que se contradiga ni que mantener dos veces, y el formato se corrige en un solo lugar.

**Consecuencias:**
- Reemplaza la parte de D-086 que carga la guía de hitos aparte, cuando el marco esté hecho.
- Los pendientes de «poner al día la guía y `gestor-proyectos`» (D-062, D-063, D-068, Defectos 13 y 14, Q-115) pasan al marco.
- Fuera de Iridium no hay marco (D-093, Q-132).


## D-093 — El marco de Iridium vive solo dentro de Iridium; afuera no hay marco
- **Fecha:** 2026-11-05
- **Ámbito:** general
- **Hito o paso:** 10, frente Orden (Q-132)
- **Estado:** vigente

**Contexto:** D-092 funde la guía de hitos y la skill de Iridium en un solo marco, que hoy Iridium carga solo en sus conversaciones. Al eliminar la guía, una sesión en VS Code o en la terminal se queda sin método. Opciones: A) Iridium además instala el marco como skill en la carpeta de Claude del usuario · B) todo se trabaja desde Iridium.

**Decisión:** B. El marco se carga solo en las conversaciones de Iridium; no se instala en `%USERPROFILE%\.claude` ni se mantiene una versión para afuera.

**Motivo:** el usuario: Iridium tiene que reemplazar a las otras apps; VS Code ya no tiene sentido para él y Claude Code a secas le queda chico para un flujo de trabajo propio como este.

**Consecuencias:**
- El marco puede dar por hecho lo que Iridium ofrece (Pendientes, el control de formato, Scripts): no necesita explicar cómo se trabaja sin la app.
- Las instrucciones globales y los `CLAUDE.md` de los proyectos dejan de describir el método: dicen que el proyecto se trabaja desde Iridium (paso 2 de Orden).
- Una sesión abierta fuera de Iridium no tiene método; no es un caso que se cuide. «Abrir en VS Code» (D-089) sigue para mirar archivos.


## D-094 — Las ideas y los pendientes de la IA van en una sola lista, «Trabajo»
- **Fecha:** 2026-11-06
- **Ámbito:** general
- **Hito o paso:** 10, frente Orden, paso 2 (Q-133)
- **Estado:** vigente

**Contexto:** las ideas viven en hasta ocho lugares por proyecto y los pendientes de la IA en cinco, repetidos y sin estado (A-18, A-19). Opciones: A) una sola lista con estados · B) dos listas, ideas y pendientes.

**Decisión:** A. Cada proyecto tiene `docs/trabajo.md`, con un ítem `T-n` por idea o pendiente y un estado del vocabulario único (`nueva · pendiente · en curso · en pausa · hecho · descartado`). Una idea aceptada no se mueve: cambia su estado.

**Motivo:** nada se copia de un lado a otro, lo hecho no queda mezclado con lo que falta y una sola lista se lee, se filtra y se controla con una regla.

**Consecuencias:**
- «Ideas para después» (`00-idea.md`), «Ideas del brainstorming» (`01-exploracion.md`), «Ideas nuevas» y «Pendientes reportados» (`07-construccion.md`), el Pendientes de `estado.md` y el Backlog de `10-operacion.md` dejan de ser listas propias: pasan a `trabajo.md` al pasar al marco.
- «Ideas del proyecto» se vuelve la sección **Trabajo** del proyecto (OR-4).
- Q-131 (B) queda resuelta acá.

## D-095 — Siguen el marco las carpetas con `docs/estado.md`; las demás son carpetas simples hasta que se sumen
- **Fecha:** 2026-11-06
- **Ámbito:** general
- **Hito o paso:** 10, frente Orden, paso 2 (Q-134)
- **Estado:** vigente

**Contexto:** de las catorce carpetas de la grilla, ocho no siguen la guía: scripts sueltos y carpetas personales (A-23). Las instrucciones globales dicen que todo proyecto la sigue, y no se cumple. Opciones: A) todas pasan al marco · B) solo las que tienen `docs/estado.md` · C) esas, y las demás se suman con un botón.

**Decisión:** C. Una carpeta con `docs/estado.md` es un **proyecto**: sigue el marco y Iridium le muestra todo. Una sin él es una **carpeta simple**: tarjeta, Archivos, Git, Scripts y la conversación, sin Mapa, sin Trabajo y sin preguntas. **Pasar al marco** (desde la tarjeta o la carpeta abierta) la convierte en proyecto cuando el usuario quiera.

**Motivo:** no obliga a documentar un script suelto y deja el camino abierto con un clic.

**Consecuencias:**
- La regla «todo proyecto se desarrolla con la guía» de las instrucciones globales se cambia por esta, en el chat de Skills (D-092.4).
- El control no corre sobre las carpetas simples.
- La grilla las muestra igual que a los proyectos, con «carpeta» en lugar del hito.

## D-096 — La ronda de UX se hace al terminar cada frente y cada cinco comentarios de la Revisión juntados
- **Fecha:** 2026-11-06
- **Ámbito:** general
- **Hito o paso:** 10, frente Orden, paso 2 (Q-135)
- **Estado:** vigente

**Contexto:** D-091 pide una ronda de UX periódica en operación para que la interfaz no vuelva a crecer a parches. Opciones: A) cada dos semanas · B) al terminar cada frente y cada cinco comentarios de la Revisión juntados · C) solo cuando la pida el usuario.

**Decisión:** B. La ronda toca cuando un frente pasa a `hecho` o cuando se juntan cinco `R-n` anotados para la ronda (D-091). Revisa toda la interfaz con capturas (`tools/auditoria-ux.ts`) contra `04-ux.md` y deja sus hallazgos en `trabajo.md`.

**Motivo:** se hace cuando algo cambió de verdad, no por calendario, y no depende de que el usuario se acuerde.

**Consecuencias:**
- El marco lo dice en su referencia de operación (OR-9) y el control lo avisa: «toca la ronda de UX».
- La ronda gasta una sesión; no se hace en medio de una iteración.

## D-097 — Lo que espera del usuario se llama «Bandeja de entrada»
- **Fecha:** 2026-11-06
- **Ámbito:** general
- **Hito o paso:** 10, frente Orden, paso 4 (Q-137)
- **Estado:** vigente

**Contexto:** con D-094, «pendiente» es un estado del trabajo de la IA, y la sección Pendientes muestra lo que espera del usuario: la misma palabra para dos cosas. Se propuso «Te espera»; el usuario la encontró demasiado informal y dijo que «Bandeja de entrada» o «Pendientes» le van bien.

**Decisión:** «Bandeja de entrada». La sección (general y de cada proyecto) se llama así; la cuenta se dice «3 en la bandeja»; el bloque del Mapa, «En tu bandeja». El estado `pendiente` del trabajo no cambia.

**Motivo:** de las dos que propuso el usuario, es la que no choca con el vocabulario de estados ya decidido (D-094): con «Pendientes» habría que cambiar `pendiente` por «por hacer» en todos los estados. Si prefiere «Pendientes», se cambia antes de construir.

**Consecuencias:**
- `modulos/orden/ux.md` › Parte 1 y Parte 2 (PO-4) usan «Bandeja de entrada»; `04-ux.md` y el glosario lo toman al reescribirse.

## D-098 — La conversación queda siempre a la vista, más angosta
- **Fecha:** 2026-11-06
- **Ámbito:** general
- **Hito o paso:** 10, frente Orden, paso 4 (Q-136)
- **Estado:** vigente

**Contexto:** la conversación ocupa un tercio del ancho aunque esté vacía (A-6). Opciones: A) una franja que se abre al tocarla · B) se esconde y la abre un botón · C) como hoy, más angosta.

**Decisión:** C. La conversación sigue a la derecha, siempre a la vista, con 360 px en vez de 440 (300 px en ventanas de menos de 1100 px). Su borde se arrastra entre 300 px y la mitad de la ventana, y la app recuerda el ancho de la vista general, de Skills y de cada proyecto. Vacía, dice en una línea qué hace Seguí (A-7).

**Motivo:** el usuario la quiere a mano, sin un paso más para abrirla; achicarla devuelve el espacio a la sección.

**Consecuencias:**
- `modulos/orden/ux.md` › PO-9.

## D-099 — El marco se llama «framework»
- **Fecha:** 2026-11-06
- **Ámbito:** general
- **Hito o paso:** 10, frente Orden, paso 4 (Q-139)
- **Estado:** vigente

**Contexto:** D-092 llamó «marco» a las reglas para trabajar un proyecto desde Iridium (el método, los formatos y la ficha). Al aprobar las pantallas (Q-139, A), el usuario preguntó si «marco» era «framework» y dijo que prefiere «framework». Además, «marco» ya nombraba el esqueleto de la app (W-1, «Marco de la app»).

**Decisión:** se llama **framework**, en la app y en los documentos: Skills › **Framework**, **Pasar al framework**, «framework viejo», «avisos del framework», y en `docs/README.md` la línea `**Framework:** AAAA-MM-DD`. El esqueleto de la app (W-1) pasa a llamarse «esqueleto». El control conserva su nombre.

**Motivo:** es la palabra que el usuario usa y reconoce, y saca la doble lectura de «marco».

**Consecuencias:**
- `modulos/orden/definicion.md`, `modulos/orden/ux.md`, `04-ux.md` y el glosario de `02-definicion.md` dicen «framework». D-092 a D-096 y los documentos anteriores quedan como se escribieron: donde dicen «marco», es el framework.

## D-100 — El ámbar es solo para lo que frena y el botón principal es claro
- **Fecha:** 2026-11-06
- **Ámbito:** general
- **Hito o paso:** 10, frente Orden, paso 6 (Q-140)
- **Estado:** vigente

**Contexto:** hasta ahora el ámbar marcaba todo lo que espera al usuario y el botón que lo responde iba en ámbar lleno (`DESIGN.md` › The Ámbar Llama Rule). Con la Bandeja de entrada (D-097) casi todo espera algo del usuario, y el ámbar en todas partes dejó de distinguir lo urgente (`modulos/orden/auditoria.md` › A-2). La hoja de piezas (`ui/vista-orden.html`) propuso dejar el ámbar solo para lo que frena y dos opciones para el botón principal: claro, sin color, o del color de lo activo.

**Decisión:** el usuario eligió la A en Q-140. El ámbar es solo para lo que frena (el chip «Frena», la cuenta con «!» cuando algo frena, la pregunta que frena con el borde entero en ámbar al 55 % y el fondo de pedido, y el medidor cerca del límite). Las cuentas y lo que espera sin frenar van en gris. El botón principal (**Enviar**, **Responder**) es claro: fondo del texto principal y tinta sobre color, en los dos temas. Las demás piezas de la hoja van como están.

**Motivo:** el color sigue siendo solo para avisar, y el aviso vuelve a significar algo. Un botón verde o azul rompía «el verde marca, no pide».

**Consecuencias:**
- `DESIGN.md` (y `.impeccable/design.json`): The Ámbar Llama Rule pasa a The Ámbar Frena Rule y The Botón Claro Rule; el botón primario, los contadores, el chip de la cabecera y la tarjeta del pedido, al día.
- El código cambia con las iteraciones del frente: el botón primario y las cuentas en OR-I2 (el esqueleto y la Bandeja). Hasta entonces la app sigue con el ámbar de antes.
- El ⚠ ámbar de Skills (lo que está dos veces o con el enlace roto) no frena: pasa a gris con OR-I4 (Skills › Framework).

## D-101 — Nuevo proyecto arma la plantilla básica, sin la IA
- **Fecha:** 2026-11-07
- **Ámbito:** general (Proyectos, C-10, y el framework)
- **Hito o paso:** 10 (R-14)
- **Estado:** vigente

**Contexto:** con D-089, **Nuevo proyecto** pedía el nombre y, opcional, la idea, y le mandaba a la IA un primer mensaje para que arrancara el proyecto. R-14: crear un proyecto en blanco no debería ponerla a trabajar sobre datos que todavía no tiene; tiene que armar solo una plantilla básica, y lo demás se avanza en la conversación.

**Decisión:** el cuadro pide solo el nombre. Iridium crea la carpeta con la plantilla básica del framework, sacada de sus `plantillas/`: `CLAUDE.md`, `docs/` (`README.md` con la fecha del framework, `estado.md` en el hito 0 con su próximo paso, `trabajo.md`, `decisiones.md`, `perfil-proyecto.md`, `scripts.md`) y la ficha en `idea`, sin descripción ni ícono. Lo abre, y la IA no arranca: el usuario le cuenta la idea cuando quiere, y la IA completa ahí el hito 0, el `CLAUDE.md`, la descripción y el ícono.

**Motivo:** no gasta uso ni inventa nada sin datos; el proyecto queda con el framework desde el principio (la tarjeta muestra el hito 0 y el control no marca nada), y la conversación sigue siendo donde se decide todo.

**Consecuencias:**
- La skill `iridium` › Cómo empezar dice qué deja Iridium y qué completa la IA; la de Ideas, que el proyecto nuevo se crea con el botón y la idea se cuenta después.
- Si las plantillas no están (una app mal armada), no se crea nada y se avisa.
- Pruebas: `tests/r7-r8-proyectos.test.ts` (la plantilla, el control en cero y la tarjeta) y `tests/e2e/r7-r8-proyectos.spec.ts` (capturas `tools/salida/r7-nuevo*.png`).

## D-102 — Diseño pasa adelante, como un «Claude Design» dentro de Iridium, y la dirección visual cambia a negro
- **Fecha:** 2026-11-07
- **Ámbito:** general (frentes, D-079 y D-091; design system)
- **Hito o paso:** 10, a pedido del usuario (en el chat)
- **Estado:** vigente

**Contexto:** con OR-I1 a OR-I4 hechas, el usuario sigue viendo mal el estilo y el orden visual, y no tiene una vista de conjunto para dirigirlo: cada cambio grande de la interfaz es lento porque hay que recorrer la app pantalla por pantalla. D-091 había dejado Diseño detrás de Orden porque «no arregla la UX de Iridium»; ahora la necesidad es justo esa herramienta para mirar y cambiar la UI de Iridium.

**Decisión:**
1. El frente **Diseño** (T-5) se activa ya, como un «Claude Design» local dentro de Iridium: los tokens en un lugar, las piezas (componentes) a la vista, las **pantallas** de la app en un lienzo, comentarios sobre ellas y el pase a la IA que construye. Se toma como modelo Claude Design y las skills de diseño de Anthropic que hay en la PC (`design-system`, `design-critique`, `design-handoff`, `ux-copy`, `accessibility-review`); `impeccable` queda como apoyo, no como base. Todo local (sin `/design-sync` ni proyectos en claude.ai).
2. Primero lo mínimo para tener la vista de conjunto y que un cambio grande sea fácil; el resto (biblioteca de referencias, rondas de versiones, perillas) después. El alcance exacto se elige en Q-147.
3. **La dirección visual cambia a negro**, como el modo oscuro de X: fondo negro puro, una sola línea gris, dos grises de texto, un solo color para lo activo, menos cajas y menos bordes. La primera muestra es `modulos/diseno/negro.css`; se aprueba en Q-148.
4. Orden termina con la prueba de OR-I4 (Q-146). Sus pasos 8 y 9 (Calidad y lanzamiento) se hacen **después** del rediseño: medir la accesibilidad y las capturas de una interfaz que va a cambiar entera sería trabajo tirado. Lo que quede de UX del frente Orden pasa a Diseño.

**Motivo:** el problema que queda es de forma y de jerarquía, no de modelo; para dirigirlo hace falta ver toda la app de un vistazo y poder cambiarla desde un solo lugar. La muestra del 2026-11-07 (las 30 pantallas con los tokens negros, `tools/salida/auditoria/1440x900-negro/`) mostró que los colores ya cambian desde un solo archivo, pero el ruido sigue: cajas dentro de cajas, muchos bordes y píldoras. Eso es estructura, y se arregla con piezas compartidas y una vista de todas las pantallas.

**Consecuencias:**
- `estado.md` › Módulos: Diseño en curso; Orden sigue en curso hasta Q-146 y después espera el rediseño para su paso 8.
- `02-definicion.md` › Módulos previstos y `10-operacion.md`: el orden nuevo (Diseño antes que Capacidades y que el paso 8 de Orden).
- Cambia D-091 punto 3 («Diseño no se adelanta») y el orden de D-079.
- Cuando se apruebe la dirección, `DESIGN.md`, `docs/06-ui.md` y `docs/ui/tokens.css` se reescriben (probablemente un tema nuevo que reemplaza a los dos de hoy; se decide con Q-148).

## D-103 — El mínimo de Diseño empieza por las piezas compartidas, y el negro va sin acento
- **Fecha:** 2026-11-07
- **Ámbito:** general (design system y frente Diseño)
- **Hito o paso:** 10; frente Diseño, paso 1 (Q-147 y Q-148)
- **Estado:** vigente

**Contexto:** D-102 activó Diseño y dejó dos cosas para decidir: qué entra en el mínimo (Q-147) y si la muestra negra, con el azul de X para lo activo, era la dirección (Q-148).

**Decisión:**
1. **Q-147, A:** primero las piezas compartidas y el negro aplicado, mirando las 30 pantallas juntas en una página (DI-I1); después la sección Diseño con Sistema y Pantallas (DI-I2) y Probar una dirección (DI-I3).
2. **Q-148, C:** negro **sin acento** y lo más oscuro posible. Lo activo, lo elegido y el botón principal van en blanco y grises, no en un color. Con color quedan solo las dos señales que ya existían, apagadas: ámbar para lo que espera del usuario y rojo para un error. La letra es la del sistema (Segoe UI), no Chakra Petch.
3. Los acentos se prueban después, muy sutiles, como otras direcciones sobre el mismo negro (DI-I3 es la herramienta para eso).

**Motivo:** el usuario no tiene un acento definido y quiere ver primero la app callada; las piezas compartidas antes que la sección hacen visible el cambio en la primera iteración y la sección se arma sobre piezas ya ordenadas.

**Consecuencias:**
- `modulos/diseno/negro.css` pasa a la versión sin acento; sus 30 pantallas, en `tools/salida/auditoria/1440x900-negro/`.
- `modulos/diseno/definicion.md`: el alcance, las piezas y DI-I1 a DI-I3.
- Con DI-I1, `docs/ui/tokens.css`, `DESIGN.md` y `06-ui.md` se reescriben en negro. Qué pasa con los temas Iridium y Carbón de Ajustes › Apariencia, en Q-149.

## D-104 — Un solo tema: el negro reemplaza a Iridium y Carbón
- **Fecha:** 2026-11-07
- **Ámbito:** general (design system, `docs/ui/tokens.css`, frentes Diseño y Apariencia y ajustes)
- **Hito o paso:** 10; frente Diseño, paso 4 (Q-149)
- **Estado:** vigente

**Contexto:** con D-103 el negro sin acento pasa a ser el tema de Iridium en DI-I1. Ajustes › Apariencia ofrece hoy dos temas, Iridium (verde) y Carbón (gris con azul) (D-066), y cada tema que se queda obliga a que cada pieza nueva se vea bien y pase el contraste en todos.

**Opciones (Q-149):** A) Solo el negro; los acentos vuelven después como variantes del negro (elegida) · B) El negro por defecto y los otros dos como opción · C) El negro y Carbón.

**Decisión:** con DI-I1 queda **un solo tema, el negro sin acento**. Ajustes › Apariencia deja de ofrecer Iridium y Carbón. Los acentos sutiles vuelven más adelante como **variantes del negro**, probadas con Probar una dirección (DI-I3); si alguna se queda, se ofrece entonces como opción.

**Motivo:** un solo tema que mantener y probar, y es la dirección que el usuario pidió.

**Consecuencias:**
- Reemplaza a D-066 desde DI-I1: `tokens.css` pierde el bloque de Carbón; el tema verde se va con la fuente Chakra Petch (D-103).
- Ajustes › Apariencia: sin el selector de tema (y sin sus miniaturas, `tools/miniaturas-tema.ts`); queda lo demás que ya tenga. Quien tenía guardado Iridium o Carbón abre en negro.
- `IRIDIUM_TEMA` y la corrida de las pruebas en Carbón (D-067) dejan de tener sentido; los colores que Windows dibuja (`src/main/index.ts`) quedan los del negro.
- `DESIGN.md` y `06-ui.md` describen un solo tema; la tabla de contraste se rehace para el negro.

## D-105 — Las pantallas de Diseño son maquetas HTML que escribe la IA, y se comentan con F8
- **Fecha:** 2026-11-07
- **Ámbito:** general (frente Diseño, el framework, la Revisión)
- **Hito o paso:** 10; frente Diseño, paso 4 (Q-150)
- **Estado:** vigente

**Contexto:** la UX escrita en el paso 4 armaba **Pantallas** con capturas de la app real y preguntaba cómo sacarlas en cada proyecto (un script o la IA cada vez). El usuario respondió con otro modelo, el de Claude Design: la interfaz se arma **aparte, en HTML**, se mira ahí y se comenta con la herramienta de la Revisión (`F8`). Así se prueban otras UX y UI con poco esfuerzo, sirve tanto para un cambio grande en una app ya armada (Iridium) como para las primeras pantallas de una app nueva, y ya le dio buen resultado en otro proyecto suyo diseñado solo con Claude Design.

**Opciones (Q-150):** A) Capturas con un script de capturas por proyecto · B) Capturas que saca la IA cada vez · Otro: maquetas HTML, como Claude Design (elegida).

**Decisión:**
1. Las pantallas de Diseño son **maquetas HTML** que escribe la IA en `docs/diseno/` del proyecto, sobre los tokens y las piezas del proyecto (también en HTML). No son capturas de la app.
2. Iridium las muestra **vivas** en un lienzo; una agrandada se puede tocar (los clics que la maqueta tenga) y se comenta con **`F8`**: el comentario llega a la Revisión del proyecto como `R-n`, con la maqueta y el lugar, y la IA corrige la maqueta.
3. **Probar otra cosa es pedir otra versión**: de una pantalla (versiones lado a lado) o de todas a la vez (otra dirección: otro juego de tokens sobre las mismas maquetas). Se elige una y la otra se borra o se guarda.
4. Lo aprobado **se pasa al código** después, como el pase de Claude Design a Claude Code. En una app nueva, las maquetas son la UI del hito 6.
5. Las capturas de la app real quedan solo como referencia para comparar, donde ya existan (en Iridium, `tools/auditoria-ux.ts`); no hace falta un script de capturas por proyecto.

**Motivo:** es el modelo que ya le funcionó al usuario y separa decidir la interfaz de construirla: probar una dirección o una versión cuesta escribir HTML, no tocar la app. Iridium ya lo hacía a mano con las maquetas de `docs/ui/vista-*.html`.

**Consecuencias:**
- Cambia la parte 2 de `modulos/diseno/ux.md` y el Won't de `definicion.md` («prototipos con clics» entra en lo que la maqueta tenga). El orden de las iteraciones de Diseño se decide en Q-151.
- El ayudante de la Revisión tiene que andar dentro de una maqueta abierta en Iridium (paso 5 de Diseño).
- El framework suma el formato `docs/diseno/` (tokens, piezas, pantallas, versiones y direcciones) con su lector y su control (D-086); `referencias/06-ui.md` pasa a decir cómo se arman las maquetas.
- El glosario cambia «Pantallas» y suma «Maqueta».


## D-106 — Diseño: primero la sección, después el rediseño de Iridium en maquetas; las maquetas se muestran en un iframe aislado y la grande en un webview
- **Fecha:** 2026-11-08
- **Ámbito:** general (frente Diseño, la ventana de Iridium, la Revisión)
- **Hito o paso:** 10; frente Diseño, pasos 4 y 5 (Q-151)
- **Estado:** vigente

**Contexto:** con D-105 la UX de Diseño quedó rehecha alrededor de las maquetas HTML, y faltaba elegir el orden (Q-151) y cómo mostrar dentro de Iridium un HTML que escribe la IA sin que toque la app ni salga a internet, con `F8` andando sobre él.

**Opciones (Q-151):** A) Primero la sección (mirar, usar y comentar maquetas), después el rediseño de Iridium en maquetas, pasarlo al código y al final Otra versión y Probar una dirección (elegida) · B) La sección completa primero, después el rediseño · C) Primero las maquetas del rediseño en el navegador y la sección después.

**Decisión:**
1. **Q-151, A:** DI-I1 la sección Diseño (Pantallas, la grande, Sistema, `F8` y empezar el diseño), DI-I2 el rediseño de Iridium en maquetas, DI-I3 pasarlo al código, DI-I4 Otra versión y Probar una dirección. Con esto el paso 4 queda aprobado.
2. **Cómo se muestran (S-4):** las miniaturas, en un `iframe` con `sandbox` y un protocolo propio (`maqueta:`) que solo sirve `docs/diseno/` del proyecto y no deja salir a la red; la grande, en un `webview` con `file://` donde la extensión de la Revisión entra sola, con sus opciones y su navegación fijadas por Iridium. Lo que ya se miró se guarda en `diseno.json` (datos del Centro).
3. **`F8` sobre una maqueta:** el comentario va al proyecto de la maqueta (antes que la carpeta que dice el ayudante) y el `R-n.md` suma el campo **Maqueta**.
4. El paso 6 (UI) no va aparte: la sección se arma con las piezas de hoy en DI-I1 y se rediseña con las demás en las maquetas de DI-I2 (D-105: las maquetas son la UI).

**Motivo:** el rediseño de Iridium se revisa ya con la herramienta y llega antes a la app. S-4 mostró que la extensión solo entra en el marco principal de una página `file://` o local, así que la grande necesita su propia vista; las miniaturas, que son muchas y no se comentan, van en algo más liviano y más cerrado.

**Consecuencias:**
- `modulos/diseno/diseno-tecnico.md` escrito; `05-arquitectura.md` suma S-4 y resuelve las páginas web dentro de la app (B-5).
- La ventana de Iridium pasa a tener `webviewTag`, con reglas que rechazan cualquier dirección que no sea una maqueta (DI-I1).
- Variable nueva para las pruebas, `IRIDIUM_AYUDANTE=1`, con DI-I1.

## D-107 — Diseño: DI-I1 se prueba sobre las maquetas de Iridium; el marco de las maquetas lo arma `piezas.js`
- **Fecha:** 2026-11-08
- **Ámbito:** Diseño
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I1 y DI-I2)
- **Estado:** vigente

**Contexto:** Q-152 pedía probar DI-I1 creando un proyecto «Prueba de diseño» y pidiéndole las maquetas a su IA. Al retomar, el usuario propuso hacer el diseño de prueba sobre Iridium mismo: probar la sección a la vez que se diseña de verdad.

**Decisión:**
1. DI-I2 empieza sin esperar la prueba de DI-I1: las maquetas de Iridium se escriben en `docs/diseno/` de este repo y **Q-152 pasa a probar las dos cosas** recorriéndolas en Iridium › Diseño. Lo de DI-I1 que solo se ve mientras la IA escribe (el redibujo y el punto) se prueba pidiéndole a la IA un cambio en una maqueta de Iridium; Pedírselo a la IA queda probado por las pruebas con la app abierta.
2. **El marco** (la barra de proyectos, la de secciones, la conversación y la de estado) no se copia en cada maqueta: lo arma `docs/diseno/piezas.js` según `data-marco` y `data-seccion` del `<body>`. Cada maqueta tiene solo lo suyo y los íconos de la izquierda pasan de una pantalla a otra.
3. Las maquetas usan datos de muestra (Alfa, Beta, Gamma…; D-082).

**Motivo:** las maquetas de Iridium son pantallas reales con su contenido y su navegación: prueban la sección mejor que un proyecto de juguete y no gastan uso en una prueba descartable. El marco en `piezas.js` evita repetir lo mismo en cada maqueta (y que se desparejen).

**Consecuencias:**
- Q-152 reescrita; DI-I1 se cierra con ella y DI-I2 sigue con lo que se comente.
- En DI-I3 el marco pasa al código como piezas de `src/renderer/ui/`, no como `piezas.js`: las maquetas lo usan para mostrarse.

## D-108 — Diseño: sin ruido; lo que anda no se anuncia
- **Fecha:** 2026-11-09
- **Ámbito:** Diseño
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I2)
- **Estado:** vigente

**Contexto:** con Q-152 el usuario recorrió las maquetas y marcó con `F8` como «ruido visual» la cuenta al lado de «Proyectos», la ruta de la carpeta, el detalle y la bienvenida de la conversación de Inicio, «Sin sesiones abiertas», la hora y «Claude · max» (R-15 a R-21), y pidió para Claude «un indicador en caso de fallo».

**Decisión:**
1. No se muestra lo que no ayuda a decidir nada: la cuenta total al lado del título de una pantalla, la ruta de una carpeta, la hora, las sesiones, el plan de Claude.
2. Lo que anda bien no se anuncia: un estado aparece cuando falla (Claude sin sesión, en rojo en la barra de abajo, lleva a iniciarla).
3. La cuenta que queda es la de lo que espera del usuario (la Bandeja, en ámbar) y la de un título de bloque.

**Motivo:** son los comentarios del usuario, y van con la dirección negra: menos cosas en pantalla para que se vea lo que importa.

**Consecuencias:**
- Las maquetas de la tanda 1 corregidas y la regla escrita en `modulos/diseno/ux.md` › Reglas; el control de estilos de DI-I3 no la mira (es de contenido), la miran las maquetas.
- En DI-I3 la barra de abajo de la app pierde Claude, las sesiones y la hora, y gana el aviso cuando Claude falla.

## D-109 — Diseño: el botón principal es verde
- **Fecha:** 2026-11-09
- **Ámbito:** Diseño
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I2)
- **Estado:** vigente (cambia el punto «sin acento» de D-103 y D-104; ajustada por D-120: el verde va en la letra y el borde, no de fondo)

**Contexto:** con `F8` sobre las maquetas el usuario marcó que el blanco de Enviar «es molesto» y pidió verde, «típico de enviar», también para Seguí (R-35, R-36).

**Decisión:** el fondo sigue negro y lo activo y lo marcado (la pestaña elegida, las casillas, los interruptores) siguen en blanco; el **botón principal** es verde (`--principal: #3ccf7f`) con letra negra. Es el único color que no es una señal.

**Motivo:** el pedido del usuario; un solo color, solo en la acción, mantiene la pantalla tranquila.

**Consecuencias:** `docs/diseno/tokens.css` suma `--marcado` para lo marcado; en DI-I3 pasa a `docs/ui/tokens.css`, `DESIGN.md` y `06-ui.md`.

## D-110 — Los textos de la app en español neutro
- **Fecha:** 2026-11-09
- **Ámbito:** producto
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I2)
- **Estado:** vigente

**Contexto:** al usuario le pidieron que los textos de Iridium sean menos argentinos (R-29): «pide» o «pídeme» en lugar de «pedime».

**Decisión:** la interfaz trata de «tú», sin voseo («Pídele», «Escribe a la IA…», «Continuar» en lugar de «Seguí»). Lo que escribe la IA de cada proyecto (sus `Q-n`, sus documentos) sigue el idioma de quien lo usa.

**Motivo:** Iridium se comparte (D-085); un texto neutro sirve a cualquiera.

**Consecuencias:** las maquetas ya están en neutro; los textos de la app se pasan en DI-I3 (T-58).

## D-111 — Sin la Bandeja de todos
- **Fecha:** 2026-11-09
- **Ámbito:** producto
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I2)
- **Estado:** vigente (deja sin efecto la vista general de D-010 y D-022)

**Contexto:** el usuario: «en la práctica solo se usa la bandeja del proyecto, ya que cuenta con más detalle, docs y demás» (R-28).

**Decisión:** Inicio queda con Proyectos, Skills e Ideas. Lo que espera de cada proyecto se ve en su Bandeja de entrada y, desde la grilla, en la cuenta ámbar de su tarjeta.

**Motivo:** el uso real; una sección menos.

**Consecuencias:** fuera de las maquetas ya; de la app, con DI-I3 (T-58): Skills pasa a Ctrl+2 e Ideas a Ctrl+3.

## D-112 — Sin la sección Trabajo; Ideas es un bloc de notas
- **Fecha:** 2026-11-09
- **Ámbito:** producto
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I2)
- **Estado:** vigente

**Contexto:** el usuario sentía que Trabajo era una lista compleja sin un propósito claro (R-40). Q-155, opción B.

**Decisión:**
1. Un proyecto ya no muestra la sección Trabajo. `docs/trabajo.md` sigue siendo la lista de la IA (se lee en Docs) y lo que está en curso se ve en el Mapa.
2. Ideas es un bloc de notas libre: una sola hoja, se escribe y se pegan enlaces e imágenes, sin estados ni destinos. Lo que se quiera hacer se le pide a la IA en el chat.

**Motivo:** menos texto y menos secciones; pensar (el bloc) queda separado de seguir el trabajo (el Mapa).

**Consecuencias:** las maquetas ya están; la app cambia con DI-I3 (T-58). El formato de `trabajo.md` del framework no cambia.


## D-113 — Las guías de impeccable, en el framework
- **Fecha:** 2026-11-09
- **Ámbito:** framework
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I2)
- **Estado:** vigente

**Contexto:** impeccable (licencia Apache 2.0) trae guías para limpiar una pantalla y un piso de calidad; su revisor automático ya corría en esta PC al escribir maquetas (T-60). Q-156, opción A.

**Decisión:** sus guías pasan, en nuestras palabras y con la atribución que pide la licencia, a `referencias/06-ui.md` › Repaso antes de mostrar una maqueta: lo que sobra, el ruido, los textos, la letra, los espacios, el piso (contraste, estados, largos reales) y lo que no va. La IA repasa cada maqueta con esa lista antes de mostrarla. No se suma su revisor al control ni su forma de trabajar: lo nuestro son las maquetas y `F8`.

**Motivo:** llega a todos los proyectos con el framework y no depende de otra herramienta.

**Consecuencias:** `SKILL.md` › Las maquetas apunta al repaso; la salida del hito 6 pide las maquetas repasadas. El formato y el control no cambian.

## D-114 — Cada token con su uso, y tres ideas más del design system de claude.ai
- **Fecha:** 2026-11-09
- **Ámbito:** framework
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I2)
- **Estado:** vigente

**Contexto:** cómo arma claude.ai un design system dejó cuatro ideas para el formato `docs/diseno/` (Q-159, opción A: las cuatro, empezando por la 1).

**Decisión:**
1. Cada token de `tokens.css` va en su línea con su uso en un comentario después del `;`. Iridium lo lee, Diseño › Sistema lo muestra y el control avisa de los que no lo tienen (hecho el 2026-11-09).
2. Estilos de texto con nombre (título, cuerpo, rótulo…) con tamaño, interlineado y peso (T-61).
3. Una ficha por pieza, agrupada, con para qué sirve, sus estados y qué tokens usa (T-62).
4. Las medidas fijas (la barra, la altura de los controles) como tokens (T-63).

**Motivo:** la IA elige un color por lo que dice el uso, no por cómo se ve; el sistema se explica solo en Sistema.

**Consecuencias:** cada idea cambia el framework, el lector y el control en el mismo cambio (D-086). Los proyectos con `docs/diseno/` sin usos reciben un aviso del control. Van antes de DI-I3, porque DI-I3 pasa el sistema al código.

## D-115 — Un design system guardado en otro lado pasa a `docs/diseno/` al pasar al framework
- **Fecha:** 2026-11-09
- **Ámbito:** framework
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I2)
- **Estado:** vigente

**Contexto:** un proyecto del usuario tiene su design system en un artifact de claude.ai, con una copia en `tokens.json`; Diseño no lo muestra (Q-158, opción A).

**Decisión:** `referencias/pasar-al-framework.md` suma el design system: tokens y piezas que estén en otro lado pasan a `docs/diseno/` (`tokens.css` con su uso, `piezas.css`, `piezas.html`) sin cambiar valores, y `tokens.css` queda como la fuente. Ese proyecto lo pasa su propia IA cuando el usuario lo pide.

**Motivo:** una sola fuente que Iridium muestra y controla; el arreglo va en el framework, no en un proyecto (regla de este repo).

**Consecuencias:** no cambia el lector ni el control (el formato de destino ya existe).

## D-116 — Los estilos de texto son tokens `--estilo-*` con el atajo `font`
- **Fecha:** 2026-11-12
- **Ámbito:** framework
- **Hito o paso:** 10; frente Diseño, paso 7 (T-61)
- **Estado:** vigente

**Contexto:** D-114, idea 2: los estilos de texto con nombre (título, cuerpo, rótulo…). Había que elegir cómo se escriben en `docs/diseno/`.

**Decisión:** cada estilo es un token más de `tokens.css`, `--estilo-<nombre>`, con el valor del atajo `font` de CSS (`peso tamaño/interlineado letra`, con los tokens de tamaño y de letra: `--estilo-titulo: 600 var(--tam-titulo)/1.35 var(--ui);`) y su uso, como todos. Las piezas lo usan con `font: var(--estilo-…)`. Iridium los muestra en Diseño › Sistema como «Estilos de texto», cada uno escrito en ese estilo; el control avisa de uno que no se entiende o que nombra un token que no existe. No son obligatorios.

**Motivo:** una sola línea por estilo que la maqueta y el código usan tal cual (pasar al código es copiar, D-105), sin un archivo ni un formato nuevo; descartado escribirlos como tres tokens sueltos (tamaño, interlineado y peso), que se pueden mezclar mal.

**Consecuencias:** Iridium tiene nueve (documento, título, lectura, cuerpo, botón, control, rótulo, meta, código) y `piezas.css` los usa donde ya coincidían; los títulos pasan de interlineado 1.5 a 1.35. El atajo `font` no lleva el espaciado entre letras: si una pieza lo necesita, lo suma aparte.

## D-117 — La ficha de cada pieza va en el comentario que la encabeza en `piezas.css`
- **Fecha:** 2026-11-12
- **Ámbito:** framework
- **Hito o paso:** 10; frente Diseño, paso 7 (T-62)
- **Estado:** vigente

**Contexto:** D-114, idea 3: una ficha por pieza, agrupada, con para qué sirve, sus estados y qué tokens usa. Había que elegir dónde se escribe.

**Decisión:** el comentario que ya encabeza cada pieza en `piezas.css` suma tres líneas: `Grupo:`, `Para qué:` y `Estados:` (separados por comas). Un comentario es ficha si tiene `Para qué:`; el título puede traer el código (`PZ-1 · Botón`). Los tokens que usa no se escriben: Iridium los saca de las reglas de la pieza, hasta el próximo comentario que empiece una línea. Diseño › Sistema muestra las fichas por grupo arriba de `piezas.html`, con los tokens que no existen tachados en rojo. El control avisa si `piezas.css` no tiene ninguna ficha, si una no tiene grupo y si `piezas.css` nombra un token que no está en `tokens.css`.

**Motivo:** la ficha queda pegada a las reglas que describe, en el archivo que pasa al código tal cual (D-105), y los tokens no pueden quedar viejos porque nadie los copia a mano. Descartados un `piezas.md` aparte (dos lugares que se desincronizan) y marcas en `piezas.html` (la maqueta es para mirar, no para leer).

**Consecuencias:** los proyectos con `docs/diseno/` reciben un aviso del control hasta que sus piezas tengan ficha. Iridium tiene quince: las doce piezas, el marco, la conversación y la «i», en cinco grupos (Acciones, Contenido, Avisos, Navegación, Del dominio). `referencias/06-ui.md` ya no pide las tablas de componentes: remite a las fichas.

## D-118 — Novedades del framework: los cambios que les piden algo a los proyectos, con fecha
- **Fecha:** 2026-11-12
- **Ámbito:** framework
- **Hito o paso:** 10; frente Orden (T-64)
- **Estado:** vigente

**Contexto:** con D-115 un proyecto tuvo que enterarse por el usuario de que el framework le pedía pasar su design system (Q-160). Q-161, opción A.

**Decisión:** el framework anota con fecha los cambios que les piden algo a los proyectos. Iridium compara esa lista con la fecha del framework de cada proyecto (`**Framework:**` de su `docs/README.md`) y marca «N novedades» en la tarjeta y en Skills › Framework; **Ponerse al día** se lo manda a la IA del proyecto, que lo hace y adelanta la fecha. Nada cambia en un proyecto hasta que el usuario lo toca.

**Motivo:** sirve para cualquier cambio futuro y no toca los proyectos sin pedirlo; descartado que Iridium escriba en el `estado.md` de cada uno (cambia proyectos sin permiso y les deja tareas que quizás no les aplican).

**Consecuencias:** es trabajo del frente Orden (T-64), detrás de Diseño. Mientras tanto, los cambios así se avisan como hasta ahora; la primera novedad a anotar son las fichas de las piezas (D-117).

## D-119 — Las medidas fijas son tokens `--alto-*` y `--ancho-*`, y el control avisa de una repetida a mano
- **Fecha:** 2026-11-12
- **Ámbito:** framework
- **Hito o paso:** 10; frente Diseño, paso 7 (T-63)
- **Estado:** vigente

**Contexto:** D-114, idea 4: la altura de la barra, de los controles y de las filas y el ancho de los paneles estaban escritos como números sueltos en `piezas.css` (el alto de los controles, `30px`, en cinco lugares). Había que elegir cómo se reconocen, cómo se dibujan en Sistema y qué revisa el control.

**Decisión:** una medida fija es un token de `tokens.css` que empieza con `--alto-` o `--ancho-`, con una sola medida (`--alto-control: 30px;`) y su uso, como todos; las piezas la usan en lugar del número. Diseño › Sistema las muestra como «Medidas fijas»: un alto en su tamaño real (hasta 48px; uno más alto, una ventana, se desvanece) y un ancho como barra proporcional al más ancho del grupo. El control avisa de una medida fija que no es una sola medida y, en `piezas.css`, de una medida de 20px o más escrita a mano en el tamaño (ancho, alto, columnas de una grilla) de tres reglas o más; si ya hay un token con ese valor, lo nombra. Lo más chico (íconos, el tilde de una casilla) y las medidas propias de una maqueta siguen escritos a mano.

**Motivo:** el nombre dice qué es sin un formato nuevo y se dibuja sin adivinar. Con tres reglas el control encuentra lo que es del sistema sin avisar de casualidades (el ícono de una fila y el interruptor miden los dos 28px sin ser lo mismo); descartado avisar de todo número escrito (llenaría de avisos a cualquier proyecto) y desde dos reglas.

**Consecuencias:** Iridium tiene 22 medidas fijas y `piezas.css` las usa en 24 lugares; las 24 maquetas se ven idénticas al píxel. Los proyectos con `docs/diseno/` que repiten una medida reciben el aviso; es la segunda novedad del framework para T-64, después de las fichas (D-117).

## D-120 — Los botones principales van delineados: fondo negro, letra y borde en color
- **Fecha:** 2026-11-12
- **Ámbito:** Diseño
- **Hito o paso:** 10; frente Diseño, paso 7 (R-49)
- **Estado:** vigente (ajusta D-109)

**Contexto:** con `F8` sobre `piezas.html` el usuario marcó que los botones llenos de color (el verde de Nuevo proyecto, Continuar y Crear, y el rojo de Eliminar «Gamma») «son casi ilegibles», y pidió que sean como el Eliminar común: fondo negro, letra y borde en color (R-49).

**Decisión:** el botón principal va sobre el negro con la letra y el borde en `--principal` (verde); al pasar el mouse, los dos más claros (`--principal-hover`) y un fondo verde casi negro (`--principal-fondo`, nuevo). El principal peligroso, igual en rojo: letra y borde en `--error`, y `--error-fondo` al pasar el mouse; se distingue del peligroso común porque su borde es el rojo entero. Sigue habiendo un principal como mucho por pantalla, y el verde sigue siendo solo suyo.

**Motivo:** lo pidió el usuario después de verlo; letra clara sobre negro se lee mejor que letra negra sobre un color saturado, y el botón sigue destacando por ser el único verde.

**Consecuencias:** cambia `piezas.css`, así que cambian todas las maquetas a la vez; `--sobre-principal` queda solo para lo que va sobre lo marcado en blanco (el tilde de una casilla, la perilla de un interruptor). En la app llega con DI-I3.

## D-121 — La app y las maquetas comparten un solo `tokens.css`; las piezas entran a la app sección por sección
- **Fecha:** 2026-11-13
- **Ámbito:** Diseño (DI-I3)
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I3, tanda 1)
- **Estado:** vigente (ajusta `modulos/diseno/diseno-tecnico.md` › Pasar al código en Iridium)

**Contexto:** el diseño técnico decía que `docs/ui/tokens.css` «pasa a ser» el `tokens.css` de las maquetas, es decir, dos archivos iguales que había que mantener a la par. Y que `piezas.css` entraba a la app en la base; pero nueve hojas de sección usan hoy los mismos nombres de clase que las piezas para otra cosa (`.fila`, `.menu`, `.filtro`, `.cabecera`…), y `.menu` de las piezas, por ejemplo, está escondido hasta que se abre: sumarlo así rompía los menús de hoy.

**Decisión:** la app importa `docs/diseno/tokens.css` tal cual: es el único archivo de tokens, el mismo que ven las maquetas. `docs/ui/tokens.css` queda como un enlace a él para las vistas viejas de `docs/ui/`. Los nombres de los tokens de antes van en `src/renderer/estilos/tokens-viejos.css`, apuntando a los nuevos (lo verde de antes, a blanco: el verde es solo del principal), hasta que las secciones pasen. `src/renderer/estilos/piezas.css` tiene las piezas copiadas bloque por bloque de las maquetas, y se suma a la app con la primera tanda que pasa una sección. El control de estilos (`tests/estilos.test.ts`) compara las piezas con las de las maquetas y lleva la cuenta de lo que falta pasar (choques de nombres, clases viejas, usos de los tokens de antes), que solo puede bajar.

**Motivo:** un solo archivo no se desfasa: cambiar un token en Diseño cambia la app y las maquetas a la vez. Pasar las piezas por sección evita romper lo que todavía no se rehízo.

**Consecuencias:** desde esta tanda la app ya es negra (fondo, letra del sistema, grises), aunque con las formas de antes; el principal se ve blanco hasta que su sección pase a la pieza Botón. Al terminar DI-I3 se borra `tokens-viejos.css` y las listas del control quedan vacías.

## D-122 — Actualizar arma y reinicia solo, cuando ninguna IA trabaja e Iridium no se usa
- **Fecha:** 2026-11-15
- **Ámbito:** producto (Actualizar, R-12 y CO-I6)
- **Hito o paso:** 10, operación (T-67)
- **Estado:** vigente (ajusta R-12 y CO-I6: el botón sigue, para hacerlo ya; ajustada el 2026-11-15 por Q-167)

**Contexto:** el usuario pidió que las actualizaciones locales sean automáticas, con cuidado de que no pasen mientras la IA trabaja o espera. Hasta ahora, con commits sin armar aparecía **Actualizar** y había que tocarlo: armaba y reiniciaba en el acto.

**Decisión:** Iridium arma solo cuando hay commits sin armar, ningún archivo seguido por git está modificado sin commitear (los nuevos sin seguir, como las respuestas, no cuentan) y la IA del código de Iridium lleva un minuto sin trabajar ni esperar algo de fondo. Con la versión lista, se reinicia solo cuando ninguna IA de ningún proyecto trabaja ni espera lo que dejó de fondo e Iridium lleva 3 minutos sin usarse: sin teclado ni mouse en su ventana (minimizada o detrás de otra cuenta como sin usar; usar la PC para otra cosa no la frena). Si al reiniciar Iridium no estaba al frente, la versión nueva vuelve minimizada, sin tapar lo que se esté usando ni quitarle el foco. Si no se da, entra al cerrar, como siempre. No reintenta solo un armado que falló hasta que haya otro commit, no arma lo que `pnpm volver` dejó afuera (`release/retenido.json`) hasta que haya otro commit, y no reintenta sola una versión que no entró. **Actualizar** sigue para hacerlo ya. Las pruebas lo apagan (`IRIDIUM_ACTUALIZAR_SOLO=no`) o lo aceleran (un número).

**Motivo:** armar no corta nada (la app sigue abierta), pero tomar el código a mitad de un cambio sí: por eso espera a que no haya cambios sin commitear y a que la IA de Iridium esté libre, lo que también cubre una IA que trabaje desde fuera de Iridium. Reiniciar corta las sesiones y la vista: solo pasa cuando nadie trabaja ni espera y nadie usa Iridium; tres minutos sin tocarla es la señal de que el usuario no la está mirando (al principio se pedía la PC quieta, pero el usuario la sigue usando para otras cosas y la versión no entraba nunca, Q-167), y la vista vuelve igual (el proyecto abierto, la ventana y los borradores se guardan).

**Consecuencias:** las versiones entran solas, sin tocar nada. Con una versión lista, entra al rato de dejar de usar Iridium (aunque se siga usando la PC) o al cerrarla, casi sin notarlo. Si sale mal, `pnpm volver` sigue igual y la versión que falla ya no se vuelve a armar sola. La copia compartida también se reinicia sola con la versión bajada de GitHub, con las mismas condiciones.

## D-123 — Chat nuevo por tamaño y tiempo, y arranque liviano
- **Fecha:** 2026-11-15
- **Ámbito:** proceso (framework, instrucciones globales y este proyecto)
- **Hito o paso:** 10, operación (T-68)
- **Estado:** vigente

**Contexto:** la regla era proponer un chat nuevo al terminar cada iteración. El usuario dudó de que conviniera por el costo de arrancar. Medido sobre 115 conversaciones (`research/costo-de-contexto.md`): releer la conversación es el 62 % del gasto, cada paso cuesta más del doble pasados los 300 mil tokens y arrancar cuesta lo mismo que unos 8–10 pasos de un chat cargado.

**Decisión:** Q-168 (A). Un chat nuevo se propone cuando la conversación pasa unos 200 mil tokens o se compactó, cuando cambia el tema, después de más de una hora sin mensajes (la caché venció) o al cerrar una iteración si lo que sigue es largo y el contexto ya pesa. Con la conversación liviana y una tarea chica, se sigue en el mismo chat. El arranque se aliviana: «En qué estamos ahora» en cinco líneas cortas (la historia, en el documento del frente) y el `CLAUDE.md` sin la lista de herramientas y variables, que pasa a `docs/herramientas-ia.md` y se lee cuando hace falta.

**Motivo:** lo que más gasta es releer, y crece con el largo del chat; lo que se lee al arrancar se paga en cada paso de cada chat.

**Consecuencias:** cambia `SKILL.md` › Al cerrar cada sesión, `referencias/07-construccion.md` y las instrucciones globales (`.iridium/Skills/instrucciones/CLAUDE-global.md`). Se vuelve a medir hacia el 2026-11-29 (T-68).

## D-124 — Vuelve el color donde informa
- **Fecha:** 2026-11-15
- **Ámbito:** Diseño
- **Hito o paso:** 10; frente Diseño, paso 7 (Q-171, R-56 a R-58)
- **Estado:** vigente (ajusta D-103 y D-108)

**Contexto:** con el negro sin acento (D-103) y «lo que anda bien no se anuncia» (D-108), los medidores de uso quedaron blancos, los enlaces del color del texto y el código de Archivos en grises. Al probar el Mapa (Q-171) el usuario pidió que los enlaces vuelvan a ser azules y notó que el código no tiene color; con F8 pidió el verde, naranja y rojo de los medidores (R-56) y color en el botón de los scripts (R-58).

**Decisión:** el negro sigue sin acento, pero el color vuelve donde dice algo: los medidores (uso de la suscripción y contexto) en verde (`--bien`) que pasa a ámbar y rojo al llenarse; los enlaces dentro de un texto en azul (`--enlace`); el código con los colores de VS Code (`--cod-clave`, `--cod-cadena`, `--cod-comentario`, `--cod-numero`); y Ejecutar de un script con la letra en verde (no es el botón principal: el borde sigue gris). Son tokens de `docs/diseno/tokens.css`, así que valen para la app y las maquetas.

**Motivo:** el color que distingue (cuánto queda, qué se puede tocar, qué es cada cosa en el código) ayuda a leer; el que decora sigue fuera.

**Consecuencias:** `tokens.css` suma `--bien`, `--enlace` y `--cod-numero`, y cambia los tres colores del código. Los enlaces de las maquetas se ven azules dentro del Texto de documento (PZ-12). Con R-60 (2026-11-15) también lo prendido: `--marcado` pasa del blanco al verde de los medidores, así que las casillas marcadas, las opciones elegidas y los interruptores prendidos son verdes; los usos de antes de `--primario` (los focos y lo elegido) siguen en blanco.

## D-125 — La Bandeja del proyecto es solo bandeja y el proyecto no repite su nombre ni su hito
- **Fecha:** 2026-11-15
- **Ámbito:** Diseño
- **Hito o paso:** 10; frente Diseño, paso 7 (R-62, R-65 a R-68, R-70)
- **Estado:** vigente (ajusta D-044)

**Contexto:** con la Revisión, el usuario marcó como ruido («slop») el nombre del proyecto y «Hito 10 · Operación» arriba de las secciones, el mismo hito en la cabecera del Mapa y en la barra de abajo (R-65 a R-68). Pidió sacar los scripts de la Bandeja, porque la sección Scripts ya anda bien sola (R-70), y que el botón de inicio lleve siempre a Proyectos, aunque se viniera de Skills o Ideas (R-62).

**Decisión:** la vista de entrada de un proyecto es solo la Bandeja: sus preguntas, sin la lista de scripts (están en su sección). El proyecto no tiene cabecera propia: el nombre lo dice su pestaña de arriba y el hito, las pestañas del Mapa; fuera también de la barra de abajo. El botón de arriba a la izquierda lleva siempre a Proyectos.

**Motivo:** «sin ruido» (D-108): cada cosa se dice en un solo lugar.

**Consecuencias:** las secciones del proyecto ganan los 40 px de la cabecera. `04-ux.md` › W-3 y D-044 quedan ajustados por esta.

## D-126 — La hoja de Ideas es `notas.md` de la carpeta Ideas; fuera anotar sin la IA
- **Fecha:** 2026-11-16
- **Ámbito:** Diseño
- **Hito o paso:** 10; frente Diseño, paso 7 (DI-I3, tanda 8)
- **Estado:** vigente (ajusta `04-ux.md` › W-10 y H-18)

**Contexto:** D-112 hizo de Ideas un bloc de notas: una sola hoja libre, sin estados ni destinos. Faltaba decidir dónde se guarda y qué pasa con lo que Ideas mostraba hasta ahora: anotar una idea en el `trabajo.md` de un proyecto o suelta en `ideas.md`, y la lista de las ideas nuevas de todos los proyectos.

**Decisión:**
1. La hoja es `notas.md` en la carpeta Ideas (la del chat general, D-083), un markdown que se lee solo: lo de cada día debajo de su fecha (`## AAAA-MM-DD`), el día más nuevo arriba; los enlaces como `[texto](url)` o la dirección suelta; las imágenes pegadas, en `notas/AAAA-MM-DD-n.png` y en la hoja como `![](notas/…)`. Se guarda sola un momento después de escribir. Al abrirla, arriba está «Hoy» para escribir; si no se escribe nada, no se guarda.
2. Pegar una dirección la vuelve un enlace (una etiqueta con el nombre y el sitio, que se abre con un clic en el navegador); pegar texto con formato pega solo el texto; pegar o soltar una imagen la guarda en `notas/`.
3. Fuera de Ideas: anotar sin la IA (con el selector de proyecto), la lista de las ideas `nueva` de todos los proyectos, las sueltas de `ideas.md` con Hablar de esta idea y la línea de los proyectos que no pasaron al framework («Ver en Framework», T-51). Las ideas de un proyecto siguen en su `trabajo.md` (Docs) y lo que está en curso, en el Mapa; `ideas.md` sigue siendo el archivo de la IA del chat general (se ve con Abrir como proyecto).
4. La IA del chat general lee `notas.md` cuando el usuario le habla de sus ideas y no la reescribe sin que lo pida (lo dice el `CLAUDE.md` que Iridium deja en la carpeta Ideas al crearla).

**Motivo:** un archivo de texto que se puede abrir en cualquier lado y que la IA lee sin nada especial; separado de `ideas.md` porque ese archivo tiene el formato de la IA y la hoja es del usuario.

**Consecuencias:** si la IA cambia `notas.md` mientras el usuario escribe, gana lo último guardado (la hoja se actualiza sola cuando no se está escribiendo). Las sueltas que ya había en `ideas.md` no pasan a la hoja: siguen en ese archivo. Sale el código de anotar sin la IA (`Anotar`, los canales `anotarTrabajo`, `anotarSuelta`, `ideasNuevas` e `ideas`) y sus pruebas.

## D-127 — Las ideas de un proyecto se piensan como frente propio, antes de construir
- **Fecha:** 2026-11-16
- **Ámbito:** Ideas
- **Hito o paso:** 10; frente Ideas, paso 1 (T-69)
- **Estado:** vigente

**Contexto:** con la tanda 8 de DI-I3, Ideas pasó a ser un bloc de notas del inicio (D-112, D-126). El usuario quiere anotar ideas sin salir del proyecto (T-69) y guardar enlaces, sobre todo de repos, para revisar qué se puede sacar de ellos; y extraña de la Ideas de antes ver cada idea por separado. Sintió que el bloc se hizo apurado y pidió primero definir qué se quiere y después cómo, sin cargar la interfaz.

**Decisión:** se abre el frente Ideas (sección), con el ciclo reducido desde la Propuesta. Las maquetas de las tres formas posibles (`docs/diseno/pantallas/ideas-proyecto-a.html` a `-c.html`) sirven para elegir; nada se construye hasta cerrar su UX.

**Motivo:** es la tercera vez que Ideas cambia de forma (la lista de T-n, el bloc, ahora dentro del proyecto); decidirlo con las maquetas cuesta menos que rehacer código.

**Consecuencias:** el frente Diseño queda en pausa mientras tanto (la tanda 8 puede cambiar según lo que se elija); su Q-174 sigue abierta. Las maquetas nuevas suman Ideas a la barra de un proyecto solo en ellas (`piezas.js`).


## D-128 — Ideas es una lista de ideas con estado y enlaces para revisar, igual en cada proyecto y en el inicio
- **Fecha:** 2026-11-16
- **Ámbito:** Ideas
- **Hito o paso:** 10; frente Ideas, paso 1 (Q-175 a Q-177)
- **Estado:** vigente (reemplaza a D-112 y a D-126 cuando se construya; ajustará `04-ux.md` › W-10)

**Contexto:** D-127 abrió el frente para decidir, con tres maquetas, qué es Ideas dentro de un proyecto y qué pasa con el bloc de notas del inicio.

**Decisión:**
1. La forma C (Q-175): cada idea en su renglón, que se abre en su lugar como una nota chica; los enlaces pegados van a «Para revisar», con Revisar con la IA. Además, cada idea tiene un estado en color: sin evaluar, aprobada (verde), rechazada (rojo) y hecha.
2. Las ideas que anota la IA (los `T-n` que nacen como idea) aparecen en la misma lista, con un robot y su código (Q-176).
3. Ideas del inicio tiene la misma forma, para lo que no tiene proyecto: al anotar, el proyecto por defecto es «Sin proyecto» (ideas sueltas), y Mover a un proyecto la pasa a uno (Q-177). El bloc de notas se va.

**Motivo:** una sola manera de anotar en toda la app; cada idea separada, como la Ideas de antes, y el enlace con un fin.

**Consecuencias:** la tanda 8 de DI-I3 (el bloc) no se pule: queda hasta que Ideas se construya; pegar enlaces e imágenes se reusa en la nota de cada idea. Dónde se guarda una idea se decide en el diseño técnico del frente.

## D-129 — Aprobar una idea la pasa al trabajo de la IA como pendiente; rechazarla, a descartado
- **Fecha:** 2026-11-16
- **Ámbito:** Ideas
- **Hito o paso:** 10; frente Ideas, paso 2 (Q-179)
- **Estado:** vigente

**Contexto:** D-128 le dio a cada idea un estado en color (sin evaluar, aprobada, rechazada, hecha). Faltaba qué hace Aprobar.

**Decisión:** el estado de una idea es el de su trabajo, con el vocabulario del framework: sin evaluar es `nueva`, aprobada es `pendiente` (la IA la toma cuando le toque, en el orden del plan, sin otro paso), rechazada es `descartado` y hecha es `hecho`; una idea que la IA está haciendo (`en curso`) se ve aprobada. Iridium muestra las palabras del usuario; el archivo guarda las del framework.

**Motivo:** aprobar ya dice «hacela»; y con los estados de siempre, el control y el Mapa no necesitan nada nuevo.

**Consecuencias:** al rechazar, el motivo es opcional (el framework pide uno en `descartado`: si no se escribe, queda «rechazada por el usuario»). La IA, al arrancar algo nuevo, mira los `pendiente` como hasta ahora.


## D-130 — Cada idea es un `T-n` de `trabajo.md` con el campo `Idea:`; la nota del usuario va aparte
- **Fecha:** 2026-11-16
- **Ámbito:** Ideas
- **Hito o paso:** 10; frente Ideas, paso 5
- **Estado:** vigente

**Contexto:** la definición del frente dejó para el diseño técnico dónde se guarda una idea con su nota y sus imágenes, y qué pasa con el bloc (`notas.md`). Q-180 aprobó la UX.

**Decisión:**
1. El renglón de una idea es un `T-n` de `docs/trabajo.md` con un campo nuevo en su línea de datos, `Idea:` (`usuario`, `IA` o `enlace`; un enlace lleva además `Enlace:` con la dirección). Un `T-n` `nueva` sin `Idea:` se lee como `Idea: IA`.
2. La nota que el usuario escribe en una idea va en `docs/ideas/T-n.md`, con sus imágenes en `docs/ideas/T-n/`; el título queda en `trabajo.md`.
3. Las ideas sueltas van en `sueltas.md` de la carpeta Ideas, con el mismo formato (las notas, en `sueltas/`). `notas.md` (el bloc) e `ideas.md` (de la IA del chat general) quedan como están; la IA los pasa a sueltas si el usuario lo pide.
4. El nombre de un enlace sale de su dirección (en GitHub, `dueño/repo`), sin que Iridium lea la página.

**Motivo:** el estado es el del trabajo (D-129) y la IA, el Mapa y el control lo leen sin nada nuevo; guardar la nota mientras se escribe no compite con la IA por `trabajo.md` ni lo alarga. Leer la página al pegar sería una conexión a un tercero que el usuario no pidió (P2).

**Consecuencias:** el framework, el lector de `trabajo.md` y el control cambian juntos (D-086, D-092): reglas para `Idea:`, `Enlace:` y las notas sin su `T-n`. Detalle en `modulos/ideas/diseno-tecnico.md`.

## D-131 — Revisar con la IA y Hablar de esta idea citan en la conversación, sin enviar
- **Fecha:** 2026-11-16
- **Ámbito:** Ideas (y el campo de la conversación)
- **Hito o paso:** 10; frente Ideas, paso 7 (ID-I2)
- **Estado:** vigente

**Contexto:** en la prueba de ID-I2 (Q-182), Revisar con la IA mandaba el pedido directo, como una orden; con la conversación cargada eso puede salir caro, y el usuario no podía sumar lo que le interesa.

**Decisión:**
1. Revisar con la IA y Hablar de esta idea dejan una **cita** arriba del campo de la conversación de al lado: una etiqueta chica («Revisar T-7 · tldraw/tldraw», «Idea T-1 · …») con ✕ para sacarla. No se envía nada.
2. Al enviar, cada cita va al principio del mensaje como cita de Markdown (el pedido de revisión con su enlace, su código y el proyecto; «Sobre la idea T-n «título»»), y después lo escrito. Sin nada escrito, salen solas. Citar lo mismo otra vez no la repite.
3. En el hilo, lo citado se ve como cita (gris, con la línea a la izquierda), arriba de lo escrito.

**Motivo:** el usuario decide cuándo y con qué contexto va el pedido, y la referencia le llega a la IA siempre igual de prolija.

**Consecuencias:** cambian ID-4 e ID-6 de `modulos/ideas/ux.md`. Las citas viven mientras Iridium está abierto (no se guardan al cerrarlo, como sí lo escrito). Sirve para citar otras cosas más adelante (las ideas sueltas del inicio, ID-I4).

## D-132 — El repo de Iridium es público: las copias compartidas se actualizan desde GitHub sin invitación
- **Fecha:** 2026-11-16
- **Ámbito:** general (frente Compartir; precisa D-085 y deja sin efecto la parte privada de D-069, D-070 y Q-123)
- **Hito o paso:** 10, a pedido del usuario
- **Estado:** vigente

**Contexto:** el usuario hizo público `LlanosLautaro/Iridium` para pasarle Iridium a otra persona sin invitarla (Q-126). Quiere que se actualice sola desde GitHub, seguir con `dev` y `main` separadas, y que la copia de quien desarrolla no reciba esas versiones; propuso una variable o una opción para apagarlas.

**Decisión:**
1. No hace falta nada nuevo: D-085 ya lo hace. La copia compartida pregunta primero sin clave, y con el repo público GitHub le contesta (comprobado el 2026-11-16: la API y la bajada del `.zip` responden sin sesión). El aviso «Iniciá sesión en GitHub» ya no aparece.
2. **La copia del usuario no se actualiza desde GitHub**, sin variable nueva: solo se actualiza desde GitHub la copia que trae `resources/actualizaciones.json`, y ese archivo lo pone `pnpm publicar` únicamente en el `.zip` que sube (una copia aparte); la app que se arma en la PC nunca lo trae. Una variable sería algo más que recordar, y si faltara, la copia del usuario se reemplazaría por la publicada.
3. Las ramas siguen igual (D-070): se trabaja en `dev`, `main` es la app de uso diario, y lo que se publica sale de `main` cuando el usuario corre Publicar.
4. Q-126 (invitar a la otra persona) queda sin efecto.

**Motivo:** la otra persona baja el `.zip` de la última versión, lo descomprime y listo; el resto ya está probado (CO-I7).

**Consecuencias:**
- El código y `docs/` (decisiones, respuestas, trabajo) se ven en GitHub. Revisado el 2026-11-16: sin claves ni datos de acceso; los otros proyectos no se nombran (D-082).
- Una versión llega a la otra persona solo cuando el usuario publica; la última publicada es del 2026-11-04 (Q-185).
- Ver si la IA de la otra persona trabaja bien con Iridium queda como idea (T-74).

## D-133 — Actualizar al framework va siempre en una conversación nueva
- **Fecha:** 2026-11-16
- **Ámbito:** Orden y Skills › Framework (precisa F-9 de `04-ux.md`)
- **Hito o paso:** 10, a pedido del usuario
- **Estado:** vigente

**Contexto:** el botón «Pasar al framework» (Skills › Framework, el menú de la tarjeta y el recuadro de una carpeta simple) mandaba el pedido a la última conversación del proyecto. Retomarla hace que la IA relea todo ese historial, que no sirve para pasar al framework: gasta uso en vano.

**Decisión:**
1. El pedido va siempre a una conversación nueva del proyecto, como Nueva en la conversación. La anterior queda guardada y se puede volver a ella.
2. El botón se llama **Actualizar** (en el menú de la tarjeta, **Actualizar al framework**, porque ahí no hay contexto); mientras trabaja, «Actualizando…».

**Motivo:** pedido del usuario; el pedido trae todo lo que la IA necesita (la referencia `pasar-al-framework.md`), así que la charla anterior no aporta.

**Consecuencias:** sin Claude disponible, el pedido sigue quedando escrito en el cuadro de su conversación, sin abrir una nueva. Lo prueba `tests/e2e/or4-framework.spec.ts` (una charla previa no aparece en la conversación del pedido).

## D-134 — El tema propio son solo tokens, en un archivo fuera de la app, editado con la IA desde Ajustes
- **Fecha:** 2026-11-16
- **Ámbito:** Apariencia y ajustes
- **Hito o paso:** 10, a pedido del usuario (T-75, Q-187)
- **Estado:** vigente

**Contexto:** el usuario quiere un tema propio que las actualizaciones no pisen, y que la IA sepa hacerlo sin equivocarse (T-75). Se podía dejar a la IA solo los tokens o cualquier regla de estilo, y la guía dentro de la app o solo en GitHub.

**Decisión:**
1. El tema pisa **solo tokens** (colores, líneas, letras) de `tokens.css` (D-104); nada de reglas sueltas sobre las piezas.
2. Vive en los datos de quien usa Iridium (una carpeta `Tema` en la carpeta Iridium, D-083), no en la carpeta de la app: una versión nueva no lo toca. Un token nuevo que el tema no pisa se ve como siempre.
3. La guía para la IA va **dentro de la app**, armada de `tokens.css` al armar (coincide con la versión instalada y anda sin internet), con el enlace a GitHub como referencia al código.
4. Se edita con la IA desde Ajustes › Apariencia (su conversación abre en la carpeta `Tema`), con Quitar (vuelve al negro) y un aviso si un color no pasa el contraste.

**Motivo:** con tokens, una versión nueva no rompe el tema en silencio; lo peor que puede salir es un color poco legible, y eso se controla.

**Consecuencias:** T-75 pasa a `pendiente`, en el frente Apariencia y ajustes, después de Ideas (una o dos iteraciones).

## D-135 — El período de 5 horas se arranca con trabajo real, desde la misma Iridium
- **Fecha:** 2026-11-17
- **Ámbito:** Inicio (Bandeja) y Apariencia y ajustes
- **Hito o paso:** 10, a pedido del usuario (T-70, Q-184, Q-188)
- **Estado:** vigente

**Contexto:** el período de uso de 5 horas de Claude empieza con el primer mensaje. Arrancarlo cuando el usuario no está aprovecha mejor el día (T-70). Se podía con un mensaje vacío desde una tarea de Windows o, como propuso el usuario, con trabajo real; y correrlo con Iridium abierta, con una tarea de Windows que la abra, o solo una vez por noche.

**Decisión:**
1. Se arranca con **trabajo real**: «Continúa con el proyecto» en una conversación nueva de un solo proyecto con respuestas sin procesar (el que espera hace más), si no hay una sesión trabajando ahí. Sin nada listo, no hace nada ni gasta.
2. Lo corre **la misma Iridium, abierta**: a eso de las 3 (si la PC está prendida) y unos 5 minutos después de que venza cada ventana (Iridium ya la lee del motor, la barra de uso). Sin tareas de Windows.
3. La Bandeja dice qué arrancó y cuándo; se prende y se apaga en Ajustes.

**Motivo:** es uso normal de Iridium (lo mismo que hace el usuario al tocar Continuar), no un mensaje para abrir el período; y sin tareas de Windows, nada se abre solo de noche.

**Consecuencias:**
- Con Iridium cerrada no arranca nada.
- Cuenta para el límite semanal como cualquier sesión; por eso solo trabaja lo que el usuario ya respondió.
- T-70 pasa a `pendiente`, después de Ideas.

## D-136 — Los proyectos van por el último cambio, sin agrupar por estado
- **Fecha:** 2026-11-17
- **Ámbito:** Inicio (la grilla de Proyectos)
- **Hito o paso:** 10, a pedido del usuario (R-80, T-77, Q-191)
- **Estado:** vigente; reemplaza el orden por estado de D-022 (opción 1) y de H-1

**Contexto:** la grilla iba por estado (en desarrollo, en uso, idea…) y, dentro de cada uno, por nombre. El usuario quiere ver arriba lo que está tocando. Se podía ordenar todo por el último cambio, mantener los estados y ordenar dentro de cada uno, o sumar un selector.

**Decisión:** opción A de Q-191. Todos los proyectos van juntos, el último cambio primero; el estado sigue en cada tarjeta. El último cambio es lo más reciente entre el último commit y el último archivo escrito en `docs/` (lo que la IA toca en cada sesión, aunque no haya commiteado). Sin ninguno de los dos, al final y por nombre. Los archivados siguen al final y, después, las fichas dañadas.

**Motivo:** lo que se está tocando queda siempre arriba, que es lo que se pidió; con los estados, un proyecto en uso que se toca quedaría debajo de todos los en desarrollo. Un selector suma un control para algo que no se va a alternar.

**Consecuencias:** H-1 (`04-ux.md`) cambia su primer criterio; el orden de la grilla cambia solo cuando la IA trabaja en un proyecto.

## D-137 — El Mapa se elige entre una hoja de ruta y un camino de pasos por frente, sin kanban
- **Fecha:** 2026-11-17
- **Ámbito:** Mapa (T-71)
- **Hito o paso:** 10; frente Mapa, paso 1 (Propuesta), Q-193
- **Estado:** vigente

**Contexto:** el Mapa de hoy muestra dónde se está, pero no qué viene después de Pendientes; con 45 cosas abiertas y sin orden, el usuario pierde el foco. Se pensaron tres formas: una hoja de ruta Ahora / Después / Más adelante (A), una red de pasos por frente (B) y un kanban por estado (C).
**Decisión:** el kanban queda descartado. A y B siguen y se comparan en maquetas (`diseno/pantallas/mapa-a.html` y `mapa-b.html`). B, como la pidió el usuario: un camino por frente, un paso después del otro, con ramas cuando las hay, y el foco siempre cerca del último hecho (los hechos de antes, plegados).

**Motivo:** el usuario quiere ver una secuencia (el paso 1, después el 2, después el 3), no cosas juntadas en un estado, y no busca mover tarjetas a mano.

**Consecuencias:** las dos maquetas usan los datos reales de Iridium; se elige con Q-194. El color por frente (R-59) no está en las maquetas: pediría tokens nuevos.

## D-138 — El Mapa es un camino de pasos concretos por frente, un frente a la vez
- **Fecha:** 2026-11-17
- **Ámbito:** Mapa (T-71)
- **Hito o paso:** 10; frente Mapa, paso 1 (Propuesta), Q-194
- **Estado:** vigente; deja atrás la hoja de ruta (opción A de D-137)

**Contexto:** con las dos maquetas a la vista, el usuario prefirió el camino por frente, pero marcó tres problemas: demasiados frentes en una pantalla, ruido (el botón Abrir, el detalle de cada paso) y pasos genéricos («Construcción», «Calidad») que no dicen qué se va a hacer ni cuándo llega una idea suya.
**Decisión:** el Mapa muestra un frente a la vez, elegido en una barra de pestañas arriba; los frentes sin empezar y las ideas sin frente van juntos en la última, «Por empezar», con «Empezar este frente». Cada frente es un camino vertical de pasos con nombre concreto, de una acción («Mover las ideas sueltas del inicio a un proyecto», «Sonar cuando Iridium termina una tarea»), sin códigos ni pasos del método; las ramas salen del paso del que nacen y los hechos de antes van plegados para que el foco quede cerca del último hecho. Sin botón Abrir ni línea de detalle. La maqueta es `diseno/pantallas/mapa-b.html`; la de la hoja de ruta se borró.

**Motivo:** ver qué se va a hacer y en qué orden, sin leer documentos; con nombres concretos se ve cuándo llega cada idea. El camino vertical deja leer nombres largos, que de costado se cortaban.

**Consecuencias:** cada frente necesita una ruta escrita con esos pasos concretos; cómo se escribe y se mantiene sin gastar uso de más, en Q-195. Los nombres de la maqueta los escribió la IA desde lo que hay hoy en los frentes y en `trabajo.md`.

## D-139 — La ruta de cada frente es una lista corta en su estado.md, que la IA mantiene al cerrar cada iteración
- **Fecha:** 2026-11-17
- **Ámbito:** Mapa (T-71) y el framework (el estado de un frente)
- **Hito o paso:** 10; frente Mapa, paso 1 (Propuesta), Q-195
- **Estado:** vigente

**Contexto:** el Mapa (D-138) necesita, por frente, sus pasos concretos en orden. Lo que cuesta uso es que la IA lea mucho; dibujar lo escrito lo hace Iridium sin costo. Se podía escribir la ruta en el estado de cada frente (A), mantenerla con una skill que se dispare al cambiar el trabajo (B) o que la IA arme el Mapa a pedido leyendo todo (C).
**Decisión:** opción A de Q-195. El `estado.md` de cada frente lleva una sección «Ruta»: un paso concreto por línea, en orden, con su marca de hecho; las ramas, con sangría bajo el paso del que salen. La IA la escribe al abrir el frente y la pone al día al cerrar cada iteración (ya toca ese archivo); al aprobar una idea, la ubica con una línea en la ruta de su frente, o en «Por empezar» si no tiene frente. Iridium la lee y dibuja el Mapa.
**Motivo:** cuesta unas líneas por iteración, queda escrita (no se rearma cada vez) y vale para todos los proyectos porque va en el framework. Una skill se carga entera cada vez y no siempre se dispara cuando debe; armarla a pedido es lo más caro y no queda escrita.
**Consecuencias:** el formato de «Ruta» entra al framework en el mismo cambio que su lector en Iridium, el control y sus pruebas (D-086, D-092), con la construcción del Mapa (T-71), después de Ideas. Los frentes que ya existen reciben su ruta la primera vez que se tocan después de ese cambio; la de los frentes de Iridium la escribe la IA al construirlo, desde la maqueta `diseno/pantallas/mapa-b.html`.

## D-140 — Después de Ideas se construye el Mapa
- **Fecha:** 2026-11-17
- **Ámbito:** el orden de los frentes
- **Hito o paso:** 10, Q-197
- **Estado:** vigente

**Contexto:** tres frentes esperaban «después de Ideas»: el Mapa (T-71, D-138, D-139), el arranque del período de 5 horas (T-70, D-135) y el tema propio (T-75, D-134).
**Decisión:** opción A de Q-197: cuando Ideas cierre sus pasos 8 y 9, sigue el Mapa.
**Motivo:** ataca lo que más le cuesta hoy al usuario, perder el foco entre tantas cosas abiertas, y su diseño está fresco.
**Consecuencias:** el arranque del período de 5 horas y el tema propio quedan después del Mapa, sin orden entre ellos todavía.

## D-141 — La definición del Mapa va como se escribió
- **Fecha:** 2026-11-17
- **Ámbito:** Mapa (T-71)
- **Hito o paso:** 10; frente Mapa, paso 2 (Definición), Q-199
- **Estado:** vigente

**Contexto:** la definición (`modulos/mapa/definicion.md`) juntó la maqueta elegida (D-138) con la ruta escrita en cada frente (D-139) y listó lo que el Mapa de hoy deja de mostrar.
**Decisión:** opción A de Q-199: un frente a la vez desde la barra de arriba, el camino de pasos con sus marcas (hecho, el que sigue, «Te espera», en pausa, descartado), los hechos de antes plegados, «Por empezar» con «Empezar este frente» (cita sin enviar) y, para un frente sin ruta, los pasos del método con un aviso gris. En operación el Mapa deja de mostrar la fila de hitos, el bloque del frente activo (Próximo paso, «En curso», «En tu bandeja»), las líneas «En espera» y «En operación» y «Lo último de la IA».
**Motivo:** es la maqueta que eligió el usuario, sin el ruido que marcó en Q-194. Lo que lo espera sigue en la Bandeja y en el «Te espera» de su paso; el Próximo paso, en `estado.md`.
**Consecuencias:** H-7 y W-7 (`04-ux.md`) se reescriben con la UX del frente (`modulos/mapa/ux.md`).

## D-142 — Antes del hito 10 el camino del Mapa son los hitos
- **Fecha:** 2026-11-17
- **Ámbito:** Mapa (T-71)
- **Hito o paso:** 10; frente Mapa, paso 2 (Definición), Q-200
- **Estado:** vigente

**Contexto:** un proyecto que todavía no está en operación no tiene frentes; sus pasos son los hitos (0 a 9), con nombres del método.
**Decisión:** opción A de Q-200: antes del hito 10 el Mapa no tiene pestañas y su camino son los hitos; el actual es el que sigue y debajo, como rama, sus pasos (la lista del portón) o, en la construcción, sus iteraciones con su objetivo.
**Motivo:** sale de lo que la IA ya escribe, no gasta uso y en la construcción ya dice qué se hace.
**Consecuencias:** la IA no escribe una «Ruta» para los hitos. Si un proyecto abre un frente antes del hito 10, la barra aparece con «Hitos» primero (`modulos/mapa/ux.md` › MA-5).

## D-143 — «Por empezar» sale solo de trabajo.md
- **Fecha:** 2026-11-17
- **Ámbito:** Mapa (T-71)
- **Hito o paso:** 10; frente Mapa, paso 2 (Definición), Q-201
- **Estado:** vigente

**Contexto:** un frente que espera sin carpeta no tiene `estado.md` donde escribir su ruta, y lo aprobado sin frente tampoco.
**Decisión:** opción A de Q-201: «Por empezar» lo arma Iridium con `trabajo.md`: cada frente que espera (`pendiente` en la tabla `## Módulos`, sin carpeta), con sus `T-n` abiertos como pasos, y «Sin frente», los `T-n` `pendiente` o `en curso` que no tienen frente, con su título (los largos bajan de renglón). Las ideas sin evaluar (`nueva`) siguen solo en Ideas.
**Motivo:** no gasta uso y nunca queda vieja.
**Consecuencias:** los títulos de `trabajo.md` se leen tal cual; repasar esas cosas para darles frente queda fuera del Mapa (`definicion.md` › Fuera de alcance).

## D-144 — La UX del Mapa queda como se escribió, sin color por frente
- **Fecha:** 2026-11-17
- **Ámbito:** Mapa (T-71)
- **Hito o paso:** 10; frente Mapa, paso 4 (UX), Q-202
- **Estado:** vigente

**Contexto:** `modulos/mapa/ux.md` (MA-1 a MA-12) y las maquetas `mapa-b.html` y `mapa-hitos.html`. Quedaban dos variantes: un color por frente (R-59) y mandar lo aprobado sin lugar en la ruta solo a «Por empezar».
**Decisión:** opción A de Q-202: la UX va así. Sin color por frente; lo aprobado con frente que la IA todavía no ubicó queda debajo del camino de ese frente, en «Aprobado, sin lugar en la ruta».
**Motivo:** cumple la definición sin ruido de más; con un frente a la vez, el nombre de arriba ya dice cuál es.
**Consecuencias:** H-7 y W-7 de `04-ux.md` remiten a `modulos/mapa/ux.md`. Sigue el diseño técnico.

## D-145 — La ruta: casillas con tres marcas, los códigos escondidos y «Por empezar» calculado al leer
- **Fecha:** 2026-11-17
- **Ámbito:** Mapa (T-71) y el framework (el `estado.md` de un frente)
- **Hito o paso:** 10; frente Mapa, paso 5 (Diseño técnico)
- **Estado:** vigente

**Contexto:** D-139 dejó la ruta en el `estado.md` de cada frente y su formato exacto para el diseño técnico.
**Decisión:** `## Ruta` es una lista de casillas: `[x]` hecho, `[ ]` lo que viene, `[-]` descartado; una rama, un nivel de sangría. El que sigue y la pausa los calcula Iridium (el primer `[ ]`; el estado del frente). Los códigos van en la línea y no se muestran: una `Q-n` sin responder hace «Te espera», un `T-n` dice qué trabajo es y una iteración da el destino en Docs. «Por empezar», «Sin frente» y «Aprobado, sin lugar en la ruta» se calculan con `trabajo.md` al leer. La pestaña elegida se recuerda en memoria. El control avisa de una marca o una línea que no entiende, una rama sin paso, un código que no existe y un frente `en curso` sin ruta. Se construye en tres iteraciones (MA-I1 a MA-I3). Detalle: `modulos/mapa/diseno-tecnico.md`.
**Motivo:** es lo más corto de escribir para la IA (una línea por paso, sin mover marcas) y lo que no se escribe no se desactualiza.
**Consecuencias:** la plantilla del `estado.md` de un frente, `SKILL.md`, `referencias/modulos.md` y `referencias/10-operacion.md` cambian en MA-I1 junto con el lector y el control.

## D-146 — La definición del Arranque va como se escribió
- **Fecha:** 2026-11-18
- **Ámbito:** Arranque (T-70), con Apariencia y ajustes (el ajuste) e Inicio (el detalle del uso)
- **Hito o paso:** 10; frente Arranque, paso 2 (Definición)
- **Estado:** vigente

**Contexto:** D-135 dijo cómo se arranca el período de 5 horas. La definición sumó dos cosas que D-135 no decía: no arrancar si la semana pasó el 90 % y que venga apagado.
**Decisión:** opción A de Q-206: `modulos/arranque/definicion.md` como está. Con Iridium abierta, a la hora elegida (por defecto las 3:00) y unos 5 minutos después de que venza cada período, si no hay uno abierto: una conversación nueva en el proyecto con la respuesta sin procesar más vieja, sin una sesión trabajando, con «Continúa con el proyecto.». No arranca si la semana pasó el 90 %. Si la PC estaba suspendida, lo hace al despertar. Apagado hasta que el usuario lo prenda en Ajustes.
**Motivo:** cumple D-135 y cuida la semana, que es lo único que el arranque gasta.
**Consecuencias:** donde la definición dice «la Bandeja», va lo que la UX decida: desde D-111 no hay una Bandeja de todos los proyectos.

## D-147 — La UX del Arranque, con un aviso al volver
- **Fecha:** 2026-11-18
- **Ámbito:** Arranque (T-70), con Apariencia y ajustes e Inicio
- **Hito o paso:** 10; frente Arranque, paso 4 (UX)
- **Estado:** vigente

**Contexto:** la UX ponía lo que hizo el arranque donde ya se mira (la pestaña del proyecto, la línea de debajo del título de la conversación y el detalle del uso), porque desde D-111 no hay una Bandeja de todos.
**Decisión:** opción B de Q-207: `modulos/arranque/ux.md` como está y, además, un aviso con lo que hizo mientras el usuario no estaba (AR-4). Como el arranque necesita Iridium abierta, «al abrir Iridium» es al volver a la PC: la primera vez que la ventana toma el foco o recibe el mouse después de uno o más arranques. Es el aviso de W-4, con un renglón por arranque (y lo que no pudo), Abrir en cada uno y Listo; no se va solo y sale una vez por tanda.
**Motivo:** lo primero que ve el usuario al sentarse es lo que se hizo de noche, sin buscarlo.
**Consecuencias:** el aviso de W-4 suma una variante que no se va sola.

## D-148 — Abrir lo que hace cada proyecto, y después mantener al día las apps de escritorio
- **Fecha:** 2026-11-18
- **Ámbito:** frente nuevo Abrir (T-80), con el framework e Inicio
- **Hito o paso:** 10
- **Estado:** vigente

**Contexto:** T-80 pedía mantener al día las apps instaladas de los proyectos cuando están cerradas. Al evaluarla salió un problema más amplio: otras personas que usan Iridium no saben cómo se abre lo que hace cada proyecto, y no todos los proyectos son apps ni todas se instalan.
**Decisión:** opción A de Q-208: un frente nuevo, en dos partes y en ese orden. Primero **Abrir**: la IA declara en `scripts.md` cuál script abre lo que el proyecto hace y de qué tipo es, e Iridium lo muestra como botón; el usuario lo quiere en el menú del clic derecho de la tarjeta y dentro del proyecto (pensó en la barra lateral, abierto a un lugar mejor, que se decide en la UX del frente). Después, solo para las apps de escritorio, armarlas solas cuando hay cambios y la app está cerrada, como Iridium consigo mismo (D-122).
**Motivo:** Abrir resuelve ya lo que les pasa a otras personas y vale para casi todo tipo de proyecto; la actualización se apoya en la misma declaración.
**Consecuencias:** cambia el formato de `scripts.md`: va con el lector, el control y el framework (D-086). El frente entra detrás de Arranque.

## D-149 — El arranque: un temporizador recalculado, la Bandeja como fuente y lo que pasó en arranques.json
- **Fecha:** 2026-11-18
- **Ámbito:** Arranque (T-70)
- **Hito o paso:** 10; frente Arranque, paso 5 (Diseño técnico)
- **Estado:** vigente

**Contexto:** la definición (D-146) y la UX (D-147) estaban aprobadas; faltaba cómo se construye.
**Decisión:** un solo temporizador hasta el próximo momento, recalculado al cambiar el ajuste o el uso y al despertar la PC (el aviso de Windows de suspensión); antes de decidir se relee el uso sin gastar. El trabajo listo sale de la lectura de la Bandeja (respondidas, sin las «Más tarde»), la más vieja por la fecha de su archivo. Arranca como Nueva, con el modelo y el esfuerzo del proyecto. Lo que pasó va a `arranques.json` (7 días, y hasta dónde se mostró) y la conversación queda marcada en `sesiones.json`. El aviso al volver junta solo lo que pasó con Iridium sin usar hace 5 minutos o más, y no muestra «nada listo» ni «período abierto». El paso 6 (UI) se descarta: el aviso fijo es un estado de la pieza Aviso. Dos iteraciones: AR-I1 (el motor y el ajuste) y AR-I2 (contar lo que hizo). Detalle: `modulos/arranque/diseno-tecnico.md`.
**Motivo:** reusa lo que ya funciona (Nueva, la Bandeja, el uso, el rato sin usar Iridium) y no guarda dos veces lo mismo.
**Consecuencias:** `config.json` suma `arranque`; los datos de Iridium suman `arranques.json`; el resumen de sesión suma `arranque`. Se confirma en AR-I1 qué informa el uso sin un período abierto.

## D-150 — Plantillas por tipo de app: piezas modulares que crecen, empezando por las pruebas sin ventanas
- **Fecha:** 2026-11-18
- **Ámbito:** frente nuevo Plantillas (T-81), con el framework
- **Hito o paso:** 10
- **Estado:** vigente

**Contexto:** las pruebas de otra app de Electron del usuario abren sus ventanas a la vista y no lo dejan usar la PC; Iridium lo resolvió en su propio código (D-072). No se puede prender desde afuera: cada proyecto lo necesita en su código y cambia según el tipo de app.
**Decisión:** opción B de Q-209, con lo que agregó el usuario: un frente nuevo de **plantillas por tipo de app**, modulares y genéricas, con configuraciones básicas, que crecen con el tiempo y con los casos de uso. Además de las reglas, pueden traer código probado de Iridium (como su sistema de pruebas) para que la IA de otro proyecto lo use tal cual o lo adapte. La primera pieza: las pruebas no ocupan la pantalla del usuario, con la receta por tipo. Se define el frente, se resuelve al menos esa pieza y queda en pausa.
**Motivo:** una pieza por problema se puede sumar sin rehacer nada y cada proyecto toma solo las que le sirven; el código que ya funciona en Iridium ahorra reinventarlo en cada proyecto.
**Consecuencias:** las piezas viven en el framework (`recursos/plugins/iridium`) y no nombran otros proyectos (D-082); si Iridium llega a leerlas o mostrarlas, va con el lector y el control (D-086). El tipo de app es el mismo dato que declara el frente Abrir (D-148): la propuesta del frente define dónde se escribe una sola vez. El frente entra detrás de Arranque y antes de Abrir, porque su primera parte es chica.

## D-151 — Primero se terminan Diseño y Orden; Plantillas espera
- **Fecha:** 2026-11-18
- **Ámbito:** frentes Diseño, Orden y Plantillas
- **Hito o paso:** 10, a pedido del usuario (Q-211)
- **Estado:** vigente (cambia el orden de D-150)

**Contexto:** el usuario pidió atacar los frentes a medio cerrar. Arranque y Compartir solo esperan su prueba o tarea (Q-210, Q-185); Diseño quedó con DI-I3 a medio pasar y Orden espera el rediseño para su paso 8 (D-102).
**Decisión:** opción A de Q-211: Diseño se reactiva y termina completo (DI-I3 sección por sección, Skills primero, con T-58, T-53 y DI-I4); al cerrarlo, Orden hace su paso 8 (Calidad) sobre la interfaz negra. Plantillas y Abrir quedan detrás.
**Motivo:** terminar Diseño destraba Orden y cierra los dos frentes; la calidad se mide sobre la app definitiva.
**Consecuencias:** Diseño pasa a `en curso`; Plantillas (D-150) y Abrir (D-148) esperan a que cierre Orden. Abrir pasó adelante el 2026-11-19 (D-153).

## D-152 — El Mapa archiva los frentes en uso sin nada por hacer
- **Fecha:** 2026-11-18
- **Ámbito:** frente Mapa
- **Hito o paso:** 10, a pedido del usuario (R-91)
- **Estado:** vigente (suma a MA-3 y D-141)

**Contexto:** con once frentes, la barra del Mapa se llenaba de frentes terminados que no tienen nada para hacer y escondía los que sí.
**Decisión:** un frente está **archivado** cuando está en uso (`hecho` en la tabla «Módulos»), su ruta no tiene nada que venga y no tiene trabajo aprobado sin lugar en la ruta. Los archivados no están en la barra; el interruptor «Archivados», arriba a la derecha y con su cuenta, los muestra después de los activos y en gris. Se recuerda por proyecto, como la pestaña elegida (D-145). En cuanto un archivado tiene algo que hacer (un paso nuevo en su ruta o una idea aprobada), vuelve solo a la barra. No se escribe nada en los documentos: es una forma de mirar.
**Motivo:** el pedido del usuario; la barra muestra lo que tiene trabajo y lo terminado queda a un clic.
**Consecuencias:** MA-3 suma su criterio; la prueba del Mapa (`ma2-mapa.spec.ts`) lo recorre con su captura.

## D-153 — Abrir pasa adelante: se hace ahora y Diseño espera
- **Fecha:** 2026-11-19
- **Ámbito:** frentes Abrir, Diseño, Orden y Plantillas
- **Hito o paso:** 10, a pedido del usuario
- **Estado:** vigente (cambia el orden de D-148 y D-151)

**Contexto:** el usuario preguntó si ya estaba la actualización automática de sus otras apps de escritorio (T-80). Estaba aprobada como frente Abrir (D-148), detrás de Plantillas, que esperaba a Diseño y Orden (D-151). Se le ofreció pasarla adelante y respondió «adelante».
**Decisión:** Abrir se abre ahora, con sus dos partes (Abrir y mantener al día las apps de escritorio). Diseño queda en pausa entre tandas: DI-I3 retoma con la tanda 12 (Archivos) cuando Abrir cierre. Después sigue el orden de D-151: Orden (paso 8) y Plantillas.
**Motivo:** el pedido del usuario; además, Abrir define el tipo de app que Plantillas necesita (D-150). Diseño se corta limpio: la tanda 11 está probada (Q-214).
**Consecuencias:** Abrir pasa a `en curso` con su carpeta (`modulos/abrir/`, iteraciones `AB-In`); Diseño, a `en pausa`. Si el usuario quería solo adelantarlo a Plantillas (y no a Diseño), se vuelve a cambiar el orden sin pérdida: nada de Diseño quedó a medio hacer.

## D-154 — La definición de Abrir va como se escribió; la actualización automática arranca prendida
- **Fecha:** 2026-11-19
- **Ámbito:** Abrir (T-80), con el framework
- **Hito o paso:** 10; frente Abrir, paso 2 (Definición)
- **Estado:** vigente

**Contexto:** la definición (`modulos/abrir/definicion.md`) tenía dos partes: el botón para abrir lo que hace cada proyecto y la actualización automática de las apps de escritorio. El usuario preguntó si la actualización gasta uso: no, Iridium corre el script de armar sin IA; la IA solo marca una vez, en `scripts.md`, el tipo de app y cómo se arma.
**Decisión:** opción A de Q-216: la definición va como está, y la actualización automática se prende sola en cada app que marca cómo se arma, apagable por proyecto.
**Motivo:** es lo que pedía T-80 y no hay que acordarse de prenderlo en cada proyecto.
**Consecuencias:** el glosario suma «Lo que abre el proyecto» y «Actualización automática». Sigue la UX (`modulos/abrir/ux.md`); el paso 3 (investigación) se descarta.
