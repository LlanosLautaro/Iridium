# Definición y alcance

**Fecha:** 2026-10-22
**Nivel de protección:** P2 — personal conectado (ver `perfil-proyecto.md`)

> Aprobado en el portón del hito 2 (Q-31). Es el contrato de los hitos siguientes: si algo cambia, se actualiza acá y se registra en `decisiones.md`.

## Catálogo de casos de uso
Un caso por fila, en una o dos líneas, agrupados por área. Sirven para probar que la base aguanta todas las áreas, no para especificarlas. La columna **Base** dice qué capacidades le exige cada caso (ver "Lo que la base tiene que dar"). La **prioridad** es una propuesta de la IA para armar el MVP: *Must* (primera versión), *Should* (la siguiente), *Could* (si hay lugar).

| Tanda | Áreas | Estado |
|---|---|---|
| 1 | Marco y motor; Proyectos y plan | hecho, aprobada (Q-25) |
| 2 | Pendientes del usuario; Diseño | hecho, aprobada (Q-26) |
| 3 | Revisión de la app; Puente PC–celular; Skills | hecho, aprobada (Q-27) |

### Marco y motor
| Caso | Qué hace el usuario | Base | Prioridad |
|---|---|---|---|
| C-1 | A la mañana abre el Centro y ve todos sus proyectos, con el hito y lo que espera de él en cada uno | B-1, B-3 | Must |
| C-2 | Abre un proyecto y conversa con la IA al lado del estado, los docs y el design system de ese proyecto | B-1, B-4, B-5 | Must |
| C-3 | Retoma un proyecto con "seguí": la IA arranca leyendo `estado.md`, sin repetirle contexto | B-4 | Must |
| C-4 | Ve qué está haciendo la IA en este momento (qué archivo, qué paso); frenarla pasó a C-54 | B-4 | Should |
| C-5 | La IA trabaja sin pedirle permisos ni quedarse esperándolo; lo que necesita de él lo deja como `Q-n` y cierra su iteración (D-021) | B-4 | Must |
| C-6 | Al cerrar, la app comprueba el cierre de sesión (estado al día, cambios guardados) y propone un chat nuevo | B-1, B-4 | Should |
| C-7 | Ve siempre cuánto lleva usado de la suscripción, y cuánto contexto lleva cada conversación (D-023) | B-4 | Must |
| C-8 | Busca un proyecto, una decisión o un código entre todos los proyectos | B-1 | Should |
| C-9 | Agrupa y filtra proyectos; archiva, pausa o marca uno como reemplazado (la ficha `.proyecto.json`) | B-1, B-2 | Should |
| C-10 | Crea un proyecto nuevo: carpeta, `docs/` de la guía, ficha e ícono, y arranca con el formulario | B-2, B-4, B-8 | Should |
| C-11 | Ejecuta los scripts de un proyecto (modo desarrollo, instalador) con un botón | B-8 | Must (D-043) |
| C-12 | Abre el proyecto en VS Code o su carpeta en el explorador | B-8 | Should |
| C-49 | Abre un proyecto y trabaja enfocado en él: los docs, el plan, la conversación, el diseño y los comentarios que ve son solo de ese proyecto (D-015) | B-1, B-4, B-11 | Must |
| C-50 | Vuelve a la vista general y abre otro proyecto mientras la IA del primero sigue trabajando; en la vista general ve qué proyectos tienen la IA trabajando, terminada o con error (D-015, D-021) | B-4 | Must |
| C-51 | Recibe un aviso dentro de la app cuando la IA de un proyecto que no tiene a la vista termina, deja preguntas o falla; los avisos de Windows, después (D-022) | B-4 | Must |
| C-54 | Frena a la IA en el acto con un botón «Detener» y la retoma después con «Seguí» (D-024) | B-4 | Must |
| C-55 | Mira los archivos del proyecto en un árbol y los abre en un visor de solo lectura (D-041) | B-1 | Must |
| C-56 | Mira el git del proyecto: la rama, lo que quedó sin guardar y el historial, con el antes y después de cada archivo; sin acciones, salvo crear el repositorio y publicarlo en GitHub (D-041, D-081) | B-1 | Must |
| C-57 | Vuelve a una conversación anterior del proyecto desde la barra de la conversación (D-041) | B-4 | Must |
| C-58 | Elige el modelo y el nivel de esfuerzo de la conversación de un proyecto, al lado de su contexto usado (D-045) | B-4 | Must |
| C-60 | Lo que escribe en el chat de una conversación o en una respuesta de Pendientes no se pierde al cambiar de lugar ni al cerrar Iridium, y al abrirlo vuelve al proyecto que tenía abierto (D-060) | B-1, B-4 | Must |
| C-61 | Conversa con la IA desde la vista de Proyectos: ideas que todavía no sabe dónde van, crear proyectos o hablar de varios a la vez; trabaja en la carpeta `Ideas` de la carpeta Iridium (D-060, D-083) | B-1, B-4 | Must |
| C-59 | Comparte Iridium con conocidos como beta: lo instalan desde GitHub, eligen su carpeta de proyectos, reciben la guía y las actualizaciones al cerrar (D-054) | B-1, B-4 | Must |

### Proyectos y plan
| Caso | Qué hace el usuario | Base | Prioridad |
|---|---|---|---|
| C-13 | Ve el mapa de un proyecto como cajas dentro de cajas: hitos con sus pasos, marcados como hechos, en curso o pendientes (D-008) | B-1 | Must |
| C-14 | Toca una caja y abre el documento o la sección que la detalla, con los códigos como enlaces | B-1, B-5 | Must |
| C-15 | Ve las decisiones de un proyecto y cuál reemplazó a cuál | B-1 | Should |
| C-16 | Ve los módulos de un proyecto como otra caja, con su propio ciclo | B-1 | Should |
| C-17 | Un hito reabierto aparece marcado, con el motivo | B-1 | Could |
| C-18 | Ve en una sola vista dónde está cada proyecto en su plan | B-1 | Should |
| C-63 | Ve en el Mapa cada frente del proyecto (el núcleo y cada módulo) con su paso, su próximo paso y lo que espera de él, y en Pendientes de qué frente es cada pregunta (D-063) | B-1 | Must |
| C-19 | Ve dibujados los diagramas Mermaid de los docs | B-5 | Should |
| C-20 | Comenta un párrafo de un documento y se lo devuelve a la IA (idea de Plannotator) | B-2, B-6 | Could |

### Pendientes del usuario
| Caso | Qué hace el usuario | Base | Prioridad |
|---|---|---|---|
| C-21 | Abre Pendientes: las `Q-n` de todos los proyectos, agrupadas por proyecto (primero los que frenan) y con el contexto para decidir ahí (D-010, D-022) | B-1, B-3 | Must |
| C-22 | Responde una decisión eligiendo una opción, con una nota | B-2 | Must |
| C-23 | Hace una prueba como lista: marca cada punto y escribe en el que falló | B-2 | Must |
| C-62 | Posterga una prueba con un botón: queda aprobada provisional con lo que dice, y la IA le suma dónde mirar si falla (D-063) | B-2 | Must |
| C-24 | Adjunta capturas o archivos a una respuesta | B-2 | Should |
| C-25 | Completa el formulario de arranque de un proyecto por partes, con "no sé todavía" | B-2 | Should |
| C-26 | La IA toma sola sus respuestas, sin que tenga que avisarle "respondí", y Pendientes muestra que ya se procesaron | B-3, B-4 | Should |
| C-27 | Le llega un aviso cuando aparece algo que frena un proyecto | B-9 | Could |
| C-28 | Una pregunta del chat que no contestó en el momento queda sola como `Q-n` | B-2, B-4 | Should |

### Diseño
| Caso | Qué hace el usuario | Base | Prioridad |
|---|---|---|---|
| C-29 | Guarda el estilo de una página que le gustó: captura y `DESIGN.md` extraído, en la biblioteca (D-011) | B-4, B-5, B-10 | Should |
| C-30 | Ve en la biblioteca también los design systems de sus proyectos (otras apps propias, el Gestor) | B-1, B-10 | Should |
| C-31 | Ve el design system de un proyecto (colores, tipografía, componentes) armado a partir de su `DESIGN.md` | B-5 | Should |
| C-32 | Ve una ronda de versiones de una pantalla lado a lado en el lienzo, en filas por ronda | B-5 | Should |
| C-33 | Comenta un elemento de un prototipo | B-6 | Should |
| C-34 | Usa el prototipo con clics y mueve perillas en vivo (como el acento de otra app) | B-5 | Could |
| C-35 | Aprueba una pantalla y queda como prueba aprobada en el proyecto | B-2 | Should |

### Revisión de la app
| Caso | Qué hace el usuario | Base | Prioridad |
|---|---|---|---|
| C-36 | Selecciona un elemento de su app en desarrollo, web (en Chrome o Edge) o Electron, y deja un comentario que queda en el proyecto (D-012, D-047) | B-2, B-7 | Must (D-046) |
| C-37 | Envía ese comentario en el momento a la sesión abierta | B-4, B-7 | Must (D-046) |
| C-38 | Ve los comentarios abiertos y cerrados de un proyecto y reabre uno | B-1, B-2 | Must (D-046) |
| C-39 | El comentario llega al proyecto correcto sin elegirlo (por la dirección de la app) | B-1, B-7 | Must (D-046) |

### Puente PC–celular
| Caso | Qué hace el usuario | Base | Prioridad |
|---|---|---|---|
| C-40 | La IA termina un APK y le llega solo al celular (D-005) | B-8 | Primero, aparte |
| C-41 | Manda un archivo o un texto del celular a la PC y lo encuentra en el proyecto o en una carpeta fija | B-3 | Should |
| C-42 | otro proyecto o otra app mandan algo al celular con la misma pieza | B-8 | Should |
| C-43 | Ve qué se mandó al celular desde cada proyecto | B-10 | Could |

### Skills
| Caso | Qué hace el usuario | Base | Prioridad |
|---|---|---|---|
| C-44 | Ve todas las skills instaladas y de dónde viene cada una: propia, copia local de un tercero o desde la cuenta (D-014) | B-12 | Should |
| C-45 | Recibe un aviso cuando hay dos copias de la misma skill | B-12 | Should |
| C-46 | Ve qué hace una skill y en qué proyectos se usa | B-1, B-12 | Could |
| C-47 | Pide adaptar una skill pública y se abre una sesión en `Skills` | B-4 | Could |
| C-48 | Ve cuándo cambió una skill y qué versión tiene | B-12 | Could |
| C-52 | Edita una skill o la guía de hitos desde el Centro: la abre, pide el cambio a la IA y queda instalada (D-018) | B-4, B-12 | Should |
| C-53 | Al cambiar el formato de la guía, ve qué proyectos quedaron con el formato viejo y los pone al día | B-1, B-4 | Should |

## Lo que la base tiene que dar
Las capacidades comunes que piden los casos. Son la entrada del hito 5: la arquitectura tiene que darlas a todas, aunque el MVP use pocas.

| Capacidad | Qué es | Casos que la piden |
|---|---|---|
| B-1 | Leer los `docs/` de todos los proyectos y entender el formato de la guía (estado, hitos, decisiones, `Q-n`, scripts, códigos) | casi todos |
| B-2 | Escribir en los archivos de un proyecto (respuestas, comentarios, fichas) sin pisarse con la IA ni con el Gestor | C-9, C-10, C-20, C-22 a C-25, C-28, C-35, C-36, C-38 |
| B-3 | Enterarse sola de que un archivo cambió y actualizar lo que muestra | C-1, C-21, C-26, C-41 |
| B-4 | Hablar con el motor de IA por la frontera de D-007: abrir o retomar una sesión en un proyecto, ver lo que hace, frenarla, su uso y su contexto; **varias sesiones a la vez, una por proyecto**, que siguen trabajando aunque el proyecto no esté a la vista (D-015) | C-2 a C-7, C-10, C-26, C-28, C-29, C-37, C-47, C-49 a C-51, C-54 |
| B-5 | Mostrar páginas web dentro de la app (prototipos, docs con diagramas, design systems) | C-2, C-14, C-19, C-29, C-31, C-32, C-34 |
| B-6 | Seleccionar un elemento y pegarle un comentario, la misma pieza para Diseño, Revisión y docs (D-011, D-012) | C-20, C-33 |
| B-7 | Un programa local que recibe lo que manda la extensión del navegador | C-36, C-37, C-39 |
| B-8 | Ejecutar programas y comandos de la PC (scripts, VS Code, LocalSend por línea de comandos) | C-10, C-11, C-12, C-40, C-42 |
| B-9 | Avisos del sistema | C-27 (y C-51 cuando pase a Windows) |
| B-10 | Datos propios del Centro, fuera de los proyectos (biblioteca de diseño, registro de envíos, configuración) | C-29, C-30, C-43 |
| B-11 | Sumar un área nueva sin tocar las demás, con una navegación común: una vista general (lo de todos los proyectos) y una vista por proyecto (lo de ese proyecto) | todas las áreas, C-49 |
| B-12 | Leer las carpetas de skills (locales, enlaces, las que bajan de la cuenta), saber de dónde viene cada una y editar las propias (D-018) | C-44 a C-48, C-52 |

## Objetivo
Que el usuario dirija todos sus proyectos desde un solo lugar: saber dónde está cada uno y qué espera de él, responderlo, y conversar con la IA al lado del proyecto, sin saltar entre VS Code, el navegador y el visor de docs.

## Criterios de éxito
Se comprueban con el MVP en uso real, durante dos semanas:
- El usuario conversa con la IA de sus proyectos desde el Centro, no desde VS Code. VS Code solo se abre para lo que el Gestor sigue cubriendo.
- Al abrir la vista general, en menos de diez segundos sabe qué proyecto lo espera y qué es lo que frena.
- Responder una `Q-n` desde Pendientes lleva tres pasos o menos, y la IA la toma al retomar el proyecto.
- Dos proyectos trabajan a la vez sin frenarse entre sí, y una sesión que terminó con preguntas se ve desde la vista general.
- Retomar con "seguí" funciona como hoy en Claude Code: la IA lee `estado.md` y sigue el **Próximo paso**.
- El mapa de cada proyecto coincide con su `estado.md`, y cada caja lleva a su sección.

Señales de que no funciona: el usuario vuelve a VS Code para conversar con la IA; Pendientes muestra preguntas de más o de menos; un proyecto queda frenado sin que se note.

## Usuarios
| Tipo | Necesidad principal | Contexto de uso |
|---|---|---|
| El usuario (único) | Dirigir varios proyectos con la IA: saber qué espera de él, decidir y revisar, sin programar | En la PC con Windows, con tiempo, a lo largo del día; a veces con varios proyectos trabajando a la vez |

## Funcionalidades
Salen del catálogo (las prioridades de cada caso están ahí).

### Must (MVP)
- Vista general de los proyectos, con lo que espera del usuario y el estado de cada IA (C-1, C-50).
- Vista de un proyecto con la conversación con la IA, que retoma con un botón «Seguí», trabaja sin pedir permisos, se puede detener y deja sus preguntas como `Q-n` (C-2, C-3, C-5, C-49, C-54; D-020, D-021, D-024).
- Varios proyectos trabajando a la vez, una sesión por proyecto, con avisos dentro de la app y el uso de la suscripción siempre a la vista (C-7, C-50, C-51; D-015, D-022, D-023).
- Mapa del plan como cajas dentro de cajas y docs del proyecto con los códigos como enlaces (C-13, C-14).
- Archivos y git del proyecto, solo para mirar (git, salvo crear el repositorio y publicarlo en GitHub, D-081), y las conversaciones anteriores del proyecto (C-55 a C-57; D-041).
- Modelo y esfuerzo de cada conversación, al lado de su contexto (C-58; D-045).
- Lo escrito y no enviado se guarda solo, y al abrir se vuelve al último proyecto (C-60; D-060).
- Un chat en la vista de Proyectos para ideas sueltas y lo que toca a varios proyectos (C-61; D-060).
- Revisión de la app con la extensión del navegador, como módulo (C-36 a C-39; D-046).
- Compartir como beta, con instalador y actualizaciones, al cerrar el MVP (C-59; D-054).
- Pendientes de todos los proyectos, agrupados por proyecto y con su contexto, con respuestas a decisiones y pruebas como listas (C-21, C-22, C-23; D-022).
- Frentes en el Mapa y Pendientes, y postergar una prueba con un botón (C-62, C-63; D-063).

### Should
- Lo que hoy hace el Gestor: scripts, fichas, abrir en VS Code, más búsqueda y grupos (C-8 a C-12).
- Seguir a la IA y cerrar la sesión con comprobación (C-4, C-6); avisos de Windows de las sesiones en segundo plano (C-51).
- Plan completo: decisiones, módulos, vista de todos los planes, diagramas (C-15, C-16, C-18, C-19).
- Pendientes completos: adjuntos, formulario de arranque, respuestas que la IA toma sola, preguntas del chat que pasan a `Q-n` (C-24 a C-26, C-28).
- Diseño: biblioteca, design systems, lienzo con rondas, comentarios y aprobaciones (C-29 a C-33, C-35).
- Puente: del celular a la PC y la misma pieza para otro proyecto y otra app (C-41, C-42).
- Skills: de dónde viene cada una, aviso de copias dobles, editar skills y la guía, y poner al día el formato de los proyectos (C-44, C-45, C-52, C-53).

### Could
- Hitos reabiertos marcados (C-17), comentar párrafos de un documento (C-20), avisos de lo que frena (C-27), prototipos con perillas en vivo (C-34), registro de envíos al celular (C-43), detalle y adaptación de skills (C-46 a C-48).

### Aparte, puede ir primero
- Envío automático de APK al celular (C-40, D-005): no depende de la app.

### Won't (por ahora)
- Kanban de tareas — la IA ubica las tareas; al usuario no le sirve moverlas (D-008).
- Canvas para pensar ideas — el usuario todavía no sabe cómo lo usaría (D-008; queda en `trabajo.md` › T-2).
- Varias sesiones dentro de un mismo proyecto — para eso está Claude Code Desktop o la CLI (D-015).
- Sesiones en la nube y mandar tareas desde el celular (Dispatch) — no hacen falta para dirigir (D-006).
- Revisión de apps Electron y Android — después de las web (D-012).
- Motor de IA propio o varios motores a la vez — se cambia de motor reescribiendo la frontera, si hace falta (D-007).

## MVP en un párrafo
> Aprobado por el usuario (Q-28, D-016); ajustado en el hito 4 (D-021 a D-024).

La primera versión del Centro sirve para **dirigir proyectos conversando con la IA**. Al abrirla, la vista general muestra todos los proyectos con su hito, lo que espera del usuario en cada uno y si su IA está trabajando, terminada o con error; el uso de la suscripción está siempre a la vista. Al abrir un proyecto, todo es de ese proyecto: su mapa de hitos como cajas dentro de cajas, que lleva a cada documento, y la conversación con la IA al lado, que arranca leyendo `estado.md`, trabaja sin pedir permisos, se puede detener con un botón y deja lo que necesita del usuario como `Q-n`. Se puede pasar a otro proyecto mientras la IA del primero sigue, y un aviso dentro de la app dice cuándo terminó. Pendientes junta las `Q-n` de todos los proyectos, agrupadas por proyecto y con el contexto para decidir ahí, y deja responder decisiones y pruebas con una lista. Todo lo demás (scripts, fichas, abrir en VS Code) lo sigue haciendo el gestor anterior mientras tanto.

| Funcionalidad del MVP | Casos |
|---|---|
| Vista general de los proyectos | C-1, C-50 |
| Vista de un proyecto con la conversación con la IA | C-2, C-3, C-5, C-49, C-54 |
| Varios proyectos trabajando a la vez | C-7, C-50, C-51 |
| Mapa del plan y docs del proyecto | C-13, C-14 |
| Pendientes y respuestas | C-21, C-22, C-23 |

Aparte del MVP, y antes si hace falta: el envío automático de APK al celular (C-40, D-005), que no depende de la app.

## Fuera de alcance
Además de lo que está en *Won't*:
- No es un editor de código: para eso sigue VS Code.
- No tiene cuentas, usuarios ni nube propia; no se publica (`perfil-proyecto.md`).
- No hay versión para el celular ni para Linux por ahora (Q-30).
- No toca otros proyectos (el gestor anterior, otro proyecto, otra app) salvo que el usuario lo pida en una sesión de ese proyecto. `Skills` es la excepción: el Centro edita sus skills y la guía (D-018).

## Relación con el gestor anterior
**Conviven hasta que el Centro lo cubra** (D-017). Mientras tanto, el Gestor sigue haciendo lo que el MVP no trae (scripts, fichas, abrir en VS Code) y solo recibe mantenimiento (D-013). Cuando el Centro cubra eso (casos *Should* C-8 a C-12), el Gestor queda como acceso rápido dentro de VS Code que abre el Centro, o se retira. Si el stack lo permite (hito 5), el Centro se lleva su código de lectura de `docs/`, ya probado.

## Restricciones
- Windows; la tecnología tiene que dejar abierta una versión para Linux más adelante (Q-30).
- Usa la suscripción de Claude que ya paga el usuario, sin gastos extra; a confirmar en el hito 3.
- Todo en la PC: datos, skills y herramientas locales; la única excepción son las conversaciones con la IA y las skills de Anthropic que no se pueden copiar (D-014).
- El Agent SDK, aislado en un solo lugar (D-007).
- Los archivos que comparte con el Gestor (`.proyecto.json`, `estado.md`, `respuestas/`) no cambian de formato sin que el Gestor los entienda (D-017).
- Código de terceros solo con licencias que lo permitan, con aviso de autoría (D-011, D-014).
- La IA escribe el 100 % del código; el usuario verifica con pruebas y demos.

## Glosario
| Término | Significado en esta app |
|---|---|
| Proyecto | Una carpeta de la carpeta de proyectos con `docs/estado.md` y su ficha; sigue el framework (D-095) |
| Carpeta simple | Una carpeta de la grilla sin `docs/estado.md`: se ve y se conversa, pero no sigue el framework; **Pasar al framework** la vuelve proyecto (D-095) |
| Bandeja de entrada | La sección con lo que espera del usuario: las `Q-n` de todos los proyectos o de uno; reemplaza el nombre «Pendientes» (D-097) |
| Framework | Las reglas para trabajar un proyecto desde Iridium: el método, los formatos y la ficha; reemplaza la guía de hitos (D-092, D-093; el nombre, D-099) |
| Control | Lo que Iridium revisa de los archivos de un proyecto contra el framework; le devuelve a la IA lo mal escrito al terminar el turno (D-092) |
| Trabajo | Las ideas y los pendientes de la IA de un proyecto, con código `T-n` y un estado, en `docs/trabajo.md` (D-094) |
| En operación | Un frente terminado que sigue recibiendo trabajo |
| Ronda de UX | Una revisión de toda la interfaz al terminar un frente o cada cinco comentarios de la Revisión (D-096) |
| Pasar al framework | La pasada que pone un proyecto en el formato del framework; reemplaza «Poner al día» de Skills |
| Vista general | La pantalla con lo de todos los proyectos: la lista, los pendientes, la biblioteca de diseño, las skills (D-015) |
| Vista de proyecto | La pantalla de un proyecto abierto, donde todo es de ese proyecto (D-015) |
| Sesión | La conversación con la IA de un proyecto; hay una por proyecto y sigue aunque no esté a la vista |
| Idea suelta | Una idea anotada en `Ideas/ideas.md` que todavía no pasó a un proyecto (módulo Inicio) |
| Chat general | La conversación de la carpeta `Ideas` de la carpeta Iridium (D-083); se ve al lado de la grilla y en la sección Ideas (D-060, Q-113) |
| Carpeta Iridium | La carpeta de Iridium aparte de los proyectos, con `Ideas` y `Skills`; de entrada `Documentos\Iridium`, se cambia en Ajustes › Proyectos (D-083) |
| Motor | Lo que hace el trabajo de IA: hoy Claude Code, por el Agent SDK |
| Frontera | El único lugar de la app que habla con el motor (D-007) |
| Mapa | El dibujo del plan de un proyecto como cajas dentro de cajas: hitos con sus pasos (D-008) |
| Paso | Una parte de un hito que el mapa muestra: un área, una iteración, un paso de un módulo |
| Frente | Una línea de trabajo del proyecto con su propio estado: el núcleo o un módulo. Avanzan hasta dos a la vez (D-063) |
| Origen (de una skill) | De dónde viene: propia, copia de un tercero, desde la cuenta o de un complemento (módulo Skills, D-064) |
| Formato de la guía | La forma de los documentos que pide `hitos-desarrollo-app` (D-064); con el framework pasa a ser la fecha del framework (D-092) |
| Tema | El juego de colores, letra y esquinas de toda la app, los tokens de `docs/ui/tokens.css` (módulo Apariencia, D-065) |
| Tono | El estilo de respuesta de Claude Code (*output style*) que usan las sesiones de Iridium (D-065) |
| Pendiente | Lo que espera del usuario; se escribe como `Q-n` en `estado.md` (D-010) |
| Frena | Un pendiente que no deja seguir el **Próximo paso** del proyecto |
| Pendientes (sección) | Donde se responden las `Q-n` de todos los proyectos, agrupadas por proyecto, con su contexto (D-022); antes se llamaba Bandeja |
| Aviso | Un mensaje dentro de la app cuando una sesión que no está a la vista termina, deja preguntas o falla |
| Uso | Cuánto se gastó de la suscripción: la ventana de 5 horas y la semana |
| Contexto | Cuánto lleva ocupado una conversación de lo que la IA puede tener presente; muy lleno, conviene un chat nuevo |
| Prueba | Un pendiente en forma de lista: cada punto se marca y lleva una nota |
| Formulario de arranque | Las preguntas para empezar un proyecto, opcionales y con "no sé todavía" |
| Ficha | El `.proyecto.json` y el ícono de un proyecto, los mismos que usa el Gestor |
| Área | Un grupo de funciones del Centro (marco, plan, pendientes, diseño, revisión, puente, skills) |
| Base | Lo común que da la app a todas las áreas (capacidades `B-n`) |
| Biblioteca de diseño | La carpeta local con los estilos guardados: captura y `DESIGN.md` de cada uno (D-011) |
| Lienzo | Donde se ven los prototipos lado a lado, en rondas, con comentarios |
| Comentario | Una nota pegada a un elemento de un prototipo o de la app en desarrollo, guardada como archivo en el proyecto (D-012) |
| Extensión de revisión | La extensión de Chrome y Edge, que también cargan las apps Electron en desarrollo, con la que se comenta la app (D-047) |
| Pistas | Lo que guarda un comentario para encontrar el elemento: selector, texto visible, componentes, archivo y línea, captura |
| Versión nueva lista | Una versión de Iridium armada que espera a que se cierre Iridium para entrar (módulo Compartir, CO-I2) |
| Puente | El envío de archivos entre la PC y el celular con LocalSend (D-005) |

## Preguntas abiertas para el hito 3
Ordenadas por lo que necesita el MVP primero. El detalle y las fuentes de partida están en `01-exploracion.md` › Pistas para la investigación técnica (hito 3).

**Para el MVP**
- ¿La suscripción permite el Agent SDK desde una app propia, y varias sesiones a la vez (D-015)? ¿Cómo se comparten los límites de uso?
- ¿Cómo se ve desde el SDK lo que hace una sesión (trabajando, esperando un permiso, terminada) y cómo se le pasan los permisos (C-5, C-50)?
- ¿Cómo retoma una sesión un proyecto que ya tenía conversación, y qué se guarda de cada una?
- Formato de la documentación: qué tiene que escribir la guía para que el Centro lea los pasos de cada hito (D-008), el tipo y si frena de cada `Q-n`, y las pruebas como listas (D-010).
- Qué del código del gestor anterior se puede llevar al Centro y qué condiciona en la tecnología (D-017).

**Para después del MVP**
- Puente: LocalSend por línea de comandos sin intervención, verificación de Android en Argentina, ADB por Wi-Fi (D-005). Va primero, aparte.
- Diseño: qué tomar de Open Design, Open CoDesign y las skills de diseño, y la versión vigente de `DESIGN.md` (D-011).
- Revisión de la app: extensión y programa local, marcas de origen por framework, "enviar ahora" a la sesión (D-012).
- Si la política de la suscripción cambia: abrir Claude Code Desktop en un proyecto desde otra app, y si ACP sirve como alternativa (D-006, D-007).
- Canvas (fuera del MVP, D-008): licencias de tldraw y Excalidraw como componente.

## Módulos previstos
El núcleo es lo del MVP: marco, plan y pendientes. Las demás áreas se construyen después, cada una como módulo (`plan-desarrollo.md` › Qué cambia en cada hito):

| Módulo | Tipo | Por qué es módulo |
|---|---|---|
| Diseño | sección | Dominio propio (estilos, prototipos, lienzo) y del tamaño de una app |
| Revisión de la app | sección más producto hermano | La extensión del navegador se instala aparte y sirve antes de que exista el Centro (D-012) |
| Skills | sección | Dominio propio (orígenes, copias, licencias, edición de skills y de la guía), ritmo propio; absorbe el trabajo de `Skills` (D-018) |
| Apariencia y ajustes | sección | Temas (D-029 dejó uno solo), la pantalla de configuración y el perfil; casi no toca el núcleo (D-063) |
| Compartir | sección | Lo que era I-7 (D-054, D-057): GitHub, instalador con actualización, carpeta de proyectos, la guía; ritmo propio (D-063) |
| Capacidades | sección | Complementos de Claude Code, uso de la PC y del navegador desde las sesiones (D-063) |
| Inicio | sección | Ideas y Skills como paneles del inicio, junto a Proyectos y Pendientes (D-063) |
| Orden | sección | Atraviesa la app: auditoría, un solo modelo de lo que se sigue, un solo marco de trabajo y la UX rehecha (D-091, D-092) |

Desde D-063 cada módulo es un **frente**: avanzan hasta dos a la vez. Skills, Compartir y Apariencia y ajustes están terminados y en uso (hito 9). Inicio, terminado (2026-11-04). Orden, desde el 2026-11-05 (D-091), termina con OR-I4; desde el 2026-11-07 el activo es Diseño (D-102), y el paso 8 de Orden espera el rediseño. En espera: Capacidades.

El puente no es módulo: es LocalSend más un envío automático (D-005). No hay plugins de terceros previstos.

## Portón
- [x] `perfil-proyecto.md` completo, con nivel de protección asignado y justificado (P2).
- [x] Objetivo y criterios de éxito comprobables.
- [x] Funcionalidades clasificadas en MoSCoW.
- [x] MVP descrito en un párrafo.
- [x] Lista de «fuera de alcance».
- [x] Glosario inicial.
- [x] Preguntas abiertas para el hito 3.
- [x] Módulos previstos identificados.
