# Operación e iteración

> Iridium está en uso diario desde I-6 y lanzado desde el hito 9 (Q-111, 2026-11-02). Este hito no termina: junta lo que se ve en el uso, lo que hay que mantener y lo que podría venir, y de ahí sale cada versión nueva, que vuelve a pasar por los hitos que correspondan (tabla de rutas de la guía; los cambios grandes, como módulo o propuesta).

## Cómo se trabaja en operación
- **Errores y ajustes que reportás:** la IA los clasifica sola. Si rompen el uso o son de lo que está en curso, se arreglan en el momento (qué pasa, qué tendría que pasar, causa, arreglo y una prueba) y se arma; si no, van a `trabajo.md` como `T-n` `pendiente`. Se reportan en el chat del proyecto, en una `Q-n` o con la Revisión (F8) sobre la misma Iridium.
- **Qué se mira en el uso diario:** las preguntas periódicas de la guía (qué usás más y qué casi nunca, qué molesta, qué errores aparecieron, qué cambió del ecosistema, si siguen valiendo los objetivos) y las señales de que algo no funciona de `02-definicion.md` › Criterios de éxito: volver a VS Code para conversar con la IA, Pendientes con preguntas de más o de menos, un proyecto frenado sin que se note.
- **Cada versión:** Iridium la arma y la pone solo cuando nadie la usa (D-122), o ya con **Actualizar** o `pnpm actualizar`; si sale mal, `pnpm volver` (`09-lanzamiento.md` › Vuelta atrás). Las que marcan algo van a `09-lanzamiento.md` › Historial de lanzamientos.
- **Mantenimiento:** en cada sesión de operación, `pnpm audit` y `pnpm outdated`. Los parches de la misma versión se suben con las pruebas completas; las versiones mayores (Electron, Vite) van como un `T-n` propio. Si cambia algo de Claude Code o del SDK que rompe el motor, se vuelve al hito 3 para esa área.
- **Revisión de la documentación:** con cada módulo nuevo o cambio grande, que `docs/` diga lo que hace la app (y `DESIGN.md`, con `impeccable` › document).

## Señales recogidas
| Fecha | Fuente | Observación |
|---|---|---|
| 2026-11-25 | Pedido del usuario | La actualización se quedaba en «Cerrando la versión de antes»: un Iridium escondido de una prueba de la IA (`tools/auditoria-ux.ts`, con sus datos aparte) quedó abierto desde la app de uso diario y el ayudante esperaba un minuto y se rendía cada vez. Cerrado ese proceso; el ayudante ahora cierra a la fuerza lo que quede abierto unos segundos después de que termina el Iridium que se cierra, con su prueba. Cómo dejar de tener problemas con las actualizaciones, en Q-304 |
| 2026-11-18 | Q-204 | El frente Mapa terminó: probado antes de operación y con su calidad (`modulos/mapa/estado.md` › Calidad); el lector de la ruta acepta una rama con tabulación y salta un bloque de código con aviso. Espera Q-205 (qué sigue) |
| 2026-11-18 | R-89, Q-203 | El desglose del contexto se guarda con la conversación y sigue al volver a abrir Iridium (R-89); el Mapa nuevo probado (MA-I2, Q-203) |
| 2026-11-17 | Q-196, Q-198 | El frente Ideas terminó: las ideas de cada proyecto y las sueltas del inicio en una sola forma, con imágenes también en el campo de arriba (R-87, R-88) y Mover a un proyecto; probado y con su calidad (`modulos/ideas/estado.md` › Calidad). Sigue el Mapa (D-140) |
| 2026-11-17 | R-80 a R-84, Q-191 | La grilla va toda por el último cambio (D-136, T-77); la tarjeta marca todo respondido (tilde blanco) y bandeja vacía o sin empezar (círculo), y deja de mostrar el hito y el Próximo paso (R-83, R-84); el título de la pantalla ya no se recuadra al recibir el foco (R-82). Hechos con sus pruebas; probados en Q-192 |
| 2026-11-15 | Pedido del usuario | La ventana vuelve maximizada o como estaba (T-66) y las actualizaciones locales son automáticas sin cortar a la IA (T-67, D-122): hechas; Q-167: T-66 anda; T-67 sí armaba solo y lo que esperaba era el reinicio: ahora espera a Iridium sin usar y vuelve minimizada si no estaba al frente (corregido; Q-169: probado, anda) |
| 2026-11-02 | Hito 8 (Q-108) | Tu recorrido completo sin problemas; los defectos que quedan abiertos son los dos menores de abajo |
| 2026-11-04 | Q-117 | Faltaba lo de VS Code para crear el repositorio y publicarlo en GitHub: ajuste chico (D-081), construido; falta probarlo con GitHub de verdad (Q-118) |
| 2026-11-04 | Pedido del usuario | Compartir Iridium ya y que las versiones nuevas le lleguen a la otra persona: repo nuevo (D-084, hecho), versiones en GitHub que la copia baja sola (D-085, hecho y probado); dónde publicar, en Q-123 |
| 2026-11-04 | Q-115 | La sección Ideas, bien; sin Pedir que la integren. Dos ideas del usuario: la carpeta de Iridium como «vault» (Q-125) y una skill de Iridium que se carga solo en Iridium (Q-124). Las preguntas de prueba traían casillas y además «A) Todo bien»: desde ahora, las pruebas van solo con casillas |
| 2026-11-05 | R-7, R-8 | El clic derecho de la tarjeta, Nuevo proyecto y las ideas y skills de cada proyecto: hechos a pedido (D-089); falta tu prueba (Q-129, que reemplaza a Q-128: ya no quedan anotados para mirar) |
| 2026-11-05 | Q-129 | El clic derecho, Nuevo proyecto y las ideas y skills del proyecto: todo bien |
| 2026-11-05 | R-10 | Eliminar desde el menú de la tarjeta, con confirmación: hecho (D-090); falta probarlo con la papelera de verdad (Q-130) |
| 2026-11-06 | Q-130 | Eliminar desde el clic derecho, con la papelera de verdad: todo bien |
| 2026-11-06 | R-11 | «Otro» escrito sin nota volvía a aparecer como sin responder (el archivo se guardaba bien, pero Iridium no lo contaba como respuesta): arreglado, con su prueba |
| 2026-11-07 | Q-118 | Inicializar repositorio y Publicar en GitHub con tu cuenta de verdad: todo bien (D-081 probado) |
| 2026-11-07 | Q-147, Q-148 | El mínimo de Diseño empieza por las piezas compartidas y el negro aplicado; el negro va sin acento, con el blanco para lo activo (D-103); qué pasa con los temas de hoy, en Q-149 |
| 2026-11-07 | Pedido del usuario | El estilo y el orden visual siguen mal: Diseño pasa adelante como un «Claude Design» local y la dirección visual cambia a negro (D-102); qué entra en el mínimo y la muestra negra, en Q-147 y Q-148 |
| 2026-11-07 | R-14 | Nuevo proyecto ya no pone a la IA a trabajar sin datos: arma solo la plantilla básica y la idea va en la conversación (D-101), hecho y probado |
| 2026-11-06 | R-12 | Un solo botón «Actualizar» que arma y reinicia: anotado en el frente Orden (`modulos/orden/ux.md` › PO-1), se construye con sus iteraciones (D-091) |
| 2026-11-05 | Pedido del usuario | Una crítica de la gestión de ideas: `10-operacion.md` › Crítica de la gestión de ideas; qué hacer, en Q-131 |
| 2026-11-05 | Pedido del usuario (y Q-131) | La UX se degradó y la forma de trabajo tiene huecos: frente Orden con prioridad máxima (D-091); la guía de hitos y la skill de Iridium, un solo marco (D-092); las funciones nuevas esperan |
| 2026-11-04 | Q-119, Q-120, Q-121 | El repo nombraba los otros proyectos del usuario: limpieza total (D-082); Ideas y Skills pasan a una carpeta Iridium aparte (D-083, construida; falta Q-122); el repo empieza de nuevo al terminar (D-084) |

## Mantenimiento
| Fecha | Qué se actualizó | Motivo |
|---|---|---|
| 2026-11-17 | Nada: revisado. `pnpm audit`: 10 avisos (1 alto, `picomatch`; 8 moderados; 1 bajo), de `hono` por el SDK de Claude Code y de `minimatch` y `picomatch` por `electron-builder` (T-79). `pnpm outdated`: parches de React, Vitest, Zustand, Playwright, Biome y el SDK (0.3.309 → 0.3.326); mayores de Electron (45), Vite (8), electron-vite (6) y el plugin de React (6) | El paso 8 de Ideas |
| 2026-11-02 | Nada: revisado. `pnpm audit`: las 4 moderadas de `minimatch` dentro de `electron-builder` (Defecto 4). `pnpm outdated`: parches de React, Zustand, Vitest y el SDK de Claude Code (0.3.309 → 0.3.316); versiones mayores de Electron (45), Vite (8) y electron-vite (6) | Primera revisión del hito 10. Los parches van al Backlog (Should); las mayores, cuando haga falta |

## Crítica de la gestión de ideas
2026-11-05, a pedido del usuario. Lo que hay: la sección **Ideas** (el chat general y `.iridium/Ideas/ideas.md`, con un formato rico: grupos, fecha, `Toca a:` y la línea `→` cuando pasa a un proyecto) e **Ideas del proyecto** (D-089: lee `07-construccion.md` › Ideas nuevas y `00-idea.md` › Ideas para después). Bien: todo en archivos legibles sin la app, y en `ideas.md` se ve de dónde vino cada idea y a dónde fue.

Problemas, de más a menos grave:
1. **Dos sistemas que no se hablan.** Una idea con `Toca a: Alfa` en `ideas.md` no aparece en **Ideas del proyecto** de Alfa; y lo que se anota en Alfa no aparece en Ideas. Pasar de una a otra lo hace la IA a mano, y nada avisa si quedó a medias.
2. **El lugar depende del hito, y en operación se pierde.** Antes del hito 2, `00-idea.md`; en la construcción, `07-construccion.md`; en operación (este proyecto), las ideas nuevas van a `10-operacion.md` › Backlog, que Ideas del proyecto no lee. Ideas del proyecto muestra justo lo que ya no se usa.
3. **Las ideas no tienen estado.** «Ideas nuevas (pendientes de evaluar)» junta las ya hechas («hecho en D-089»), las que pasaron a una iteración y las sin mirar; el número de la insignia las cuenta a todas. Nadie las evalúa: la guía no tiene un momento después del hito 2 en que se repasen.
4. **No se puede anotar una idea sin la IA.** «Para sumar una, contásela en la conversación»: arranca una sesión (gasta uso) y la IA puede ponerse a trabajar en ella. Anotar una idea tendría que ser instantáneo y gratis, como una nota.
5. **Sin vista de todos los proyectos.** Pendientes junta las `Q-n` de todos; las ideas de cada proyecto solo se ven entrando de a uno.
6. **Sin identidad.** Una idea de proyecto es un punto de una lista, sin código ni fecha fija: no se puede citar («la idea X pasó a D-n») ni seguir.

Qué haría falta (Q-131; desde D-091, dentro del frente Orden): un solo formato (el de `ideas.md`: título con fecha, `Toca a`, `→`, y un estado: nueva · aceptada · hecha · descartada), un solo lugar por proyecto que no cambie con el hito, anotar sin la IA y ver las de todos juntas.

## Rondas de UX
Cada ronda revisa toda la interfaz con capturas (`tools/auditoria-ux.ts`) contra `04-ux.md` y los principios de `06-ui.md` (D-096, `referencias/ronda-ux.md`).

| Fecha | Qué la disparó | Hallazgos |
|---|---|---|
| 2026-11-21 | Arranque pasó a `hecho` (T-100) | T-101 a T-110. Arreglado en el momento: al arrancar, el chat general, Ideas y el chat de Skills decían que no se pudo crear su carpeta mientras se leía la carpeta de proyectos. Probado en Q-245 (todo bien, también `scripts.md` en ocho). La tanda de los `pendiente` (T-101, T-103, T-104, T-106 a T-108, T-110), hecha el mismo día; T-110 encontró los botones del aviso de una conversación desarmados y se arregló. Probada en Q-248: todo bien; el chat sin conversación dice «Nueva conversación» (T-101). Los `nueva` (T-102, T-105, T-109) esperan en Ideas. |
| 2026-11-23 | Frentes pasó a `hecho` (T-123) | T-125 y T-126. Arreglado en el momento: `04-ux.md` seguía nombrando el Mapa y la sección Trabajo, y no listaba Ideas ni Diseño dentro del proyecto; con la ventana angosta, «Por empezar» se aplastaba en la barra de Frentes; un frente por empezar sin nada aprobado decía «0 aprobados» (ahora «Nada aprobado todavía»); la herramienta de capturas buscaba el Mapa y ahora suma la lista de «/», el + y un segundo frente. T-125, hecha el mismo día; se mira en Q-275. T-126 (`nueva`) espera en Ideas. |

**Ronda 1 (2026-11-21).** 31 capturas a 1440×900 y 1024×700, con los proyectos reales y el motor falso. Lo que más se repite no es de aspecto, que DI-I3 acaba de dejar parejo, sino de **un lugar y un nombre para cada cosa**: el ancho de lectura en dos lugares (T-102), las carpetas de Docs con dos clases de nombre (T-105), textos con la palabra del framework (T-106) y `04-ux.md` atrasado frente a la app (T-107). Después, estados de carga y vacío que no siguen a los demás (T-103, T-108) y textos que se cortan o sobran (T-101, T-104). El rojo de «Rechazada» choca con la regla del color (T-109). Los cuatro comentarios anotados (R-64, R-90, R-92, R-93) no forman un patrón: son ajustes sueltos que ya tienen su `T-n`. No se pudo mirar si los avisos de la esquina se pisan (T-110). La crítica se hizo a mano contra los principios, sin correr `impeccable`.

**Ronda 2 (2026-11-23).** 35 capturas a 1440×900 y 1024×700, con los proyectos reales y el motor falso. Los nombres quedaron parejos en la app: ningún «Mapa» a la vista, «avance solo» igual en Ajustes › IA, Este proyecto, Notificaciones y Frentes. Lo atrasado era `04-ux.md` (corregido). La Bandeja y Frentes muestran la misma pregunta con la misma pieza, no de dos formas: es lo que pidió R-105, y la tabla de «Lo que se sigue y dónde se ve» ahora lo dice. El único choque con los principios fue el color de la cuenta en Frentes (T-125). Lo que más se nota al mirar los datos es el título de las ideas del usuario, que queda como el texto entero (T-126). Sin comentarios `R-n` juntados para la ronda. La crítica, a mano contra los principios, sin `impeccable`.

## Trabajo
Las ideas y los pendientes están en `trabajo.md`. La prioridad (Must, Should, Could) va en el texto de cada `T-n`; los frentes en espera, Diseño y Capacidades, son T-5 y T-28.

## Próxima versión
- **Objetivo:** compartir Iridium (D-084 a D-087): hecho; falta invitar a la otra persona (Q-126). Después, Diseño y Capacidades (D-079).
- **Incluye:** `modulos/inicio/propuesta.md` › Propuesta de alcance.
- **Hitos a recorrer:** el ciclo reducido del módulo (`modulos/inicio/estado.md`); un ajuste chico va directo a 7 → 8 → 9.
- **Ajuste mediano (D-085, Q-123):** versiones para compartir, con el aviso para iniciar sesión en GitHub; construido y probado con GitHub (7 → 8). Publicadas `aca3668` y `c012989` (2026-11-04).
- **Ajustes medianos (D-086, D-087):** la skill de Iridium y la guía como complementos de las conversaciones; Ideas y Skills en `.iridium`. Construidos y probados (7 → 8); falta tu prueba (Q-127).
- **Ajuste mediano (D-083):** la carpeta Iridium con Ideas y Skills y Mover; desde D-087, en `.iridium` (Q-127).
- **Ajuste chico (D-081):** Inicializar repositorio y Publicar en GitHub en la sección Git, construido y probado con GitHub de verdad (Q-118, todo bien).
- **Ajuste mediano (D-089, R-7 y R-8):** el menú de la tarjeta, Nuevo proyecto, Ideas y Skills del proyecto; construido y probado (7 → 8); falta tu prueba (Q-129).
- **Propuestas:** módulo Inicio completo (Q-115, 2026-11-04).
- **Propuesta (T-116, D-184, D-185):** las consolas adentro de Iridium, `cambios/consolas.md`; la pieza nativa probada en S-6; aprobada en Q-276 (Armar y Volver adentro). I-9 hecha el 2026-11-23: el panel, Scripts e Iniciar sesión adentro y el instalador probado con la pieza; se prueba en Q-277. Sigue I-10.
