# Propuesta del módulo: Tipos de proyecto

**Fecha:** 2026-11-27
**Tipo:** plugin (el framework, `recursos/plugins/iridium`), con lo que Iridium lee de él

## Qué problema resuelve
El framework trata a todo proyecto como una app que se lanza a sus usuarios: los once hitos son los mismos para una app pública, para una herramienta que usa solo el usuario y para un juego (T-1). Eso tiene dos costos:

1. **Una herramienta personal paga hitos que no le tocan.** El hito 9 pide versión etiquetada, `CHANGELOG.md`, guía de uso y distribución; el 10, señales periódicas y planificar la próxima versión. En una herramienta que usa solo el usuario, eso es papeleo o un hueco aceptado: el propio Iridium lo tiene (D-077, sin versión etiquetada ni `CHANGELOG.md`), y otra app de escritorio del usuario marcó el portón del 9 entero para una app que solo se abre desde un acceso directo. Lo que sí importa (que se abra con un clic, que se ponga al día, que sus datos tengan copia y que se pueda volver atrás) no está pedido con esa forma.
2. **Un juego cambia desde la raíz** (Q-13): documento de diseño, una porción jugable antes que nada, motor y contenido (historia, arte, música, mundo) como frentes en paralelo. El framework no lo contempla.

Hoy el perfil (`perfil-proyecto.md`) achica la **protección** (P1–P5), pero no la **forma** de los hitos: una herramienta P2 sigue con el mismo lanzamiento que una app P2 compartida.

## Por qué ahora
Con Plantillas cerrado, la fila de D-166 quedó hecha y Q-328 eligió esto (A), empezando por la herramienta personal: es el tipo que más usa el usuario y el que ya choca con el framework en sus proyectos. El juego se escribe cuando haya un juego de verdad para probarlo (evaluación de T-1, 2026-11-25).

## Cómo encaja en el producto
Iridium hace que la IA trabaje con un método (`02-definicion.md`) y el framework es parte del producto (OR-I1). Este frente le suma al método un dato, **el tipo de proyecto**, y variantes de los hitos que cambian según el tipo. Es otro eje que el de Plantillas: las recetas dependen de **cómo corre** la app (escritorio, página, consola, la marca de `scripts.md`); el tipo dice **para quién y para qué** se hace (una app para otros, una herramienta para uno mismo, un juego).

**Los tipos:**
| Tipo | Qué es | Cuándo |
|---|---|---|
| App | lo de hoy: algo que se usa y se lanza a sus usuarios, aunque sean pocos | por defecto; sin cambios |
| Herramienta personal | la usa solo el usuario para una tarea suya (un programa, un bot, una página local) | este frente, primero |
| Juego | historia, arte, música, mundo, motor | más adelante, con un juego real |

Un script de una tarde sigue siendo una **carpeta simple** (sin framework): la herramienta personal es para lo que el usuario va a usar y mantener.

**Qué cambia en una herramienta personal** (la propuesta; el detalle va a la definición):
| Hito | En una app (hoy) | En una herramienta personal |
|---|---|---|
| 0, 2, 3, 5, 7, 8 | — | igual (el principio 3 no cambia: definición, UX y pruebas completas) |
| 1. Exploración | ¿ya existe?, ¿vale la pena?, competencia | una tanda corta: ¿hay algo que ya lo haga tal cual (un programa, una función de Windows, una extensión)? Si lo hay, se usa y no se construye |
| 2. Definición | el perfil entero (23 preguntas) | el perfil sale casi hecho (solo el usuario, local): se confirman las preguntas que pueden subirlo (datos sensibles, internet, contenido de terceros) |
| 4. UX y 6. UI | flujos, pantallas, design system | igual si tiene ventana; si es de consola, su UX son sus comandos y sus mensajes, y el 6 se descarta con ese motivo |
| 9. Lanzamiento | build, versión, changelog, distribución, guía de uso | **Ponerla en uso**: se abre desde Iridium (su script con la marca), se arma con un clic (`armar`), sus datos tienen copia, volver atrás es volver a un commit. Sin versión etiquetada, `CHANGELOG.md` ni guía |
| 10. Operación | preguntas periódicas, ronda de UX, próxima versión | lo que molesta se anota como idea al usarla; sin preguntas periódicas; la ronda de UX, solo si el usuario la pide |

**Formularios antes de hablar con la IA** (la otra mitad de T-1, de Q-13): al crear un proyecto, **Nuevo proyecto** pregunta el tipo (una elección) y el primer chat arranca con la variante. Los formularios grandes (todo el hito 0 contestado antes de hablar) quedan para después, junto con T-93.

## Por qué es un módulo y no una funcionalidad
- [x] Dominio propio que requiere investigación (qué pide cada hito en cada tipo; cómo se trabaja un juego)
- [x] Flujos de UX propios (elegir el tipo al crear el proyecto; ver en el Mapa los hitos con su nombre según el tipo)
- [x] Ritmo de avance propio (un tipo a la vez; el juego, cuando haya uno)
- [x] Se activa, instala o distribuye por separado (va con el framework, que cada proyecto lee)

## Alternativas
- **Alcanza con el perfil** (P1–P2 ya achica): no, el perfil regula la protección, no la forma de los hitos; el hito 9 de una herramienta P2 sigue pidiendo changelog y guía.
- **Huecos aceptados en cada proyecto** (como D-077 en Iridium): funciona, pero cada proyecto lo decide de nuevo, y el portón le pide al usuario aprobar o justificar cosas que nunca le importaron.
- **Un framework aparte por tipo**: duplica todo lo que es igual (siete de los once hitos) y se desincroniza.
- **Variantes dentro de cada referencia de hito** (la propuesta): cada `referencias/NN-*.md` con una sección «En una herramienta personal» solo donde cambia; el resto, igual para todos.

## Cómo llega a los proyectos que ya existen
Un proyecto sin el tipo declarado es una **app**: nada cambia. Para los que ya son herramientas personales, una novedad del framework (D-209) que pide declararlo; como es una decisión del usuario, la IA de cada proyecto la deja como `Q-n` (Q-331).

## Decisión
Pendiente: Q-329 (la propuesta), Q-330 (dónde se dice el tipo) y Q-331 (los proyectos que ya existen).
