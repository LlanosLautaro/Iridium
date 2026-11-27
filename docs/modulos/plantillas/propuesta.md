# Propuesta del módulo: Plantillas

**Fecha:** 2026-11-27
**Tipo:** plugin (el framework, `recursos/plugins/iridium`)

## Qué problema resuelve
Cada proyecto del usuario resuelve de nuevo problemas que Iridium ya resolvió en su propio código, y a veces no los resuelve:
1. **Las pruebas ocupan la pantalla** (T-81, Q-209). Una app de Electron que se prueba con Playwright abre una ventana por prueba, a la vista y robando el foco: mientras corren, el usuario no puede usar la PC. Iridium lo resolvió para sí (D-072, `IRIDIUM_OCULTA`), pero eso vive en su código y ninguna otra app lo hereda.
2. **Una app instalada que se pone al día sola en todas las PC** (D-207). Ya está escrita como guía (`referencias/actualizacion-sola.md`), suelta, a la espera de un lugar.
3. Lo que venga: cada vez que Iridium resuelve algo que le sirve a cualquier app de un tipo (escritorio, página, consola), hoy no hay dónde dejarlo para que la IA de otro proyecto lo use tal cual.

## Por qué ahora
Es el último de la fila de D-166 (Paridad, Orden, Abrir, Plantillas): todo lo de antes está cerrado. La primera pieza es chica y el usuario la sufre en otra app cada vez que se corren sus pruebas. Abrir ya dejó escrito el dato que hacía falta, el tipo de app (D-148).

## Cómo encaja en el producto
Iridium hace que la IA trabaje con un método (`02-definicion.md`); el framework es ese método y es parte del producto (OR-I1). Las plantillas son la parte del framework que no es método sino **receta probada**: lo que ya anduvo en Iridium, contado para que la IA de cualquier proyecto lo aplique en el suyo.

**Qué es una pieza.** Un archivo del framework, `piezas/<nombre>.md`, que resuelve un problema para uno o más tipos de app:
- **Para qué tipos** (escritorio de Electron, página, consola…) y **cuándo se aplica** (al armar las pruebas, al instalar la app, cuando el usuario lo pide).
- **La receta por tipo**: qué se cambia en el proyecto, con los fragmentos de código que ya andan en Iridium, para copiar o adaptar.
- **Cómo se prueba** que quedó bien, con algo que el usuario pueda ver (una `Q-n` de prueba con casillas).

**El tipo de app sale de un solo lugar:** la marca del script que abre el proyecto en `scripts.md` (`ejecutar · escritorio`, `ejecutar · página`, `ejecutar · consola`, D-148). No se declara otra vez: la pieza dice para qué marca vale. Un proyecto sin ese script todavía no tiene qué probar ni qué instalar.

**Las primeras piezas:**
| Pieza | Para qué tipos | Qué trae |
|---|---|---|
| Pruebas sin ventanas | escritorio (Electron), página | En una página, Playwright sin ventana (ya lo hace con pedirlo). En Electron, la receta de D-072: una variable que solo prenden las pruebas, la ventana fuera de la pantalla, sin botón en la barra de tareas, sin foco y sin dejar de dibujar; las consolas que abre la app, escondidas; y una forma de mirarlas si hace falta. Una herramienta de consola no abre ventanas: no le toca. |
| La actualización sola | escritorio (instalada) | La guía de D-207, que pasa a ser pieza tal cual (`referencias/actualizacion-sola.md` → `piezas/`). |

Más adelante, candidatas (no entran ahora): el armado que no se pisa (T-137), las pruebas que no suenan (T-124), las plantillas por requisitos para alguien sin nociones técnicas (T-93, que todavía no aprobaste).

## Por qué es un módulo y no una funcionalidad
- [x] Dominio propio que requiere investigación (cómo se esconde una ventana en cada motor)
- [ ] Flujos de UX propios
- [x] Ritmo de avance propio (crece de a una pieza, cuando aparece un caso)
- [x] Se activa, instala o distribuye por separado (va con el framework, que cada proyecto lee)

## Alternativas
- **Una regla suelta en `08-calidad.md`** («las pruebas no ocupan la pantalla») con la receta adentro: resuelve la primera pieza, pero cada pieza nueva engorda las referencias de los hitos, que la IA lee enteras.
- **Un paquete de código** (npm) con lo de Iridium: se actualiza solo, pero obliga a publicarlo y versionarlo, ata cada app a la forma de Iridium y no sirve para lo que no es código (cómo se prueba, qué se le pregunta al usuario).
- **Plantillas de proyecto enteras** (una app vacía por tipo, lista para arrancar): es lo que pide T-93 y es mucho más grande; las piezas son el paso previo y después se pueden juntar en una.

## Cómo llega a los proyectos que ya existen
Una pieza nueva se cita desde `SKILL.md` (la IA la ve en cada proyecto). Para los que ya tienen pruebas que abren ventanas, hay dos caminos y es la pregunta de Q-325 (cómo llega a los proyectos):
- **Como novedad del framework** (D-118): la tarjeta dice «1 novedad», **Ponerse al día** la deja citada y la IA del proyecto la aplica.
- **Sin novedad**: la IA la aplica la próxima vez que toque las pruebas de ese proyecto, o cuando el usuario se lo pida.

## Decisión
Espera Q-324 (la propuesta y la forma de las piezas) y Q-325 (cómo llega a los proyectos).
