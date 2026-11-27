# Definición del módulo: Ideas

**Fecha:** 2026-11-16

## Objetivo del módulo
Un solo lugar, dentro de cada proyecto y en el inicio, para anotar ideas sin salir de donde se está, ver cada una por separado con su estado y dejar enlaces «para revisar» que la IA lee y convierte en ideas (D-128, con Q-175 a Q-177).

## Criterios de éxito
- Anotar una idea en un proyecto lleva un clic y una línea, sin salir de su pestaña (T-69).
- Se ve de un vistazo qué ideas están sin evaluar, cuáles se aprobaron y cuáles se rechazaron, por el color.
- Un enlace pegado no se pierde: queda en «Para revisar» hasta que la IA lo revisa o se marca como revisado.
- Las ideas que anota la IA y las del usuario están en la misma lista, y se distinguen por el robot.
- En el inicio se anota igual que en un proyecto; lo que todavía no tiene proyecto queda como idea suelta y se mueve a uno cuando haga falta.

## Funcionalidades
### Must (MVP del módulo)
- **Ideas en la barra de cada proyecto**, con la forma C (`docs/diseno/pantallas/ideas-proyecto-c.html`): un campo arriba para anotar o pegar; «Para revisar» con los enlaces; «Ideas», cada una en su renglón.
- **Una idea es una nota chica:** su primera línea es el título; un clic la abre en su lugar y se escribe libre, con enlaces (pegar una dirección la vuelve una etiqueta) e imágenes pegadas. Se guarda sola.
- **Estado de una idea, en color** (Q-175): sin evaluar (sin color), **aprobada** (verde) y **rechazada** (rojo, el título apagado), y **hecha** cuando lo que salió de ella se terminó. Aprobar y Rechazar están en la idea abierta.
- **Las ideas de la IA en la misma lista** (Q-176): son los `T-n` del proyecto que nacen como idea, con el robot en lugar de la lamparita y su código al lado; el mismo color de estado.
- **Para revisar:** pegar una dirección en el campo de arriba la deja ahí, con su nombre y su sitio. **Revisar con la IA** le pide en el chat de al lado que la lea y proponga qué sacar; lo que el usuario elige queda como idea y el enlace pasa a revisado. También se marca como revisado a mano.
- **Hablar de esta idea:** le pasa la idea al chat de al lado.
- **Filtros arriba:** Todo, Para revisar, Sin evaluar, Aprobadas, Rechazadas y Hechas.
- **Ideas del inicio con la misma forma** (Q-177, `ideas-inicio-c.html`): para lo que no tiene proyecto. Al anotar, un selector elige el proyecto; por defecto, «Sin proyecto» (ideas sueltas). **Mover a un proyecto**, en la idea abierta, la pasa a uno con sus notas e imágenes.
- **Reemplaza el bloc de notas** del inicio (D-112, D-126): lo que el usuario ya escribió en `notas.md` no se pierde (se decide en el diseño técnico si pasa a ideas sueltas o queda como archivo).

### Should
- Buscar entre las ideas por texto.
- Las ideas hechas y las rechazadas, fuera de «Todo» después de un tiempo, para que la lista no crezca sin fin.
- Arrastrar una imagen o un enlace sobre la sección lo anota.

### Could
- Ideas del inicio con las ideas de todos los proyectos juntas, con el proyecto al lado.
- Etiquetas libres en una idea.

### Won't (por ahora)
- Enlazar ideas entre sí escribiendo su nombre (como Obsidian) — suma reglas sin una necesidad clara.
- Tarjetas o vista de tablero (forma B) — descartada en Q-175.
- Que la IA revise los enlaces sola, sin que se le pida — gasta uso sin que el usuario lo decida.

## Fuera de alcance
- Las preguntas (`Q-n`), los comentarios de la Revisión (`R-n`) y los pendientes de la IA que no nacen como idea: siguen en la Bandeja, la Revisión y Docs.
- Leer enlaces que piden iniciar sesión (repos privados de otros, páginas con cuenta): la IA dice que no pudo.

## Impacto en el perfil
Sigue en P2. Los enlaces se abren en el navegador (como hoy) y la IA los lee con sus herramientas, solo cuando se le pide: el contenido de afuera es de terceros, y la IA lo trata como dato, no como instrucciones. No hay datos nuevos fuera de la carpeta de cada proyecto y la carpeta Ideas.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Idea | Algo por pensar de un proyecto (o suelto): una nota chica con su estado; la anota el usuario o la IA |
| Para revisar | Un enlace guardado para que la IA lo lea y proponga qué sacar de ahí |
| Idea suelta | Una idea del inicio que todavía no tiene proyecto |

## Preguntas abiertas para investigar
- Dónde se guarda una idea del usuario con su nota y sus imágenes: un `T-n` en `trabajo.md` con su nota en un archivo aparte, o un archivo por idea. Se decide en el diseño técnico (paso 5), sin cambiar lo que se ve.
- Cómo se nombran los estados en `trabajo.md`: el vocabulario del framework ya tiene `nueva`, `pendiente`, `hecho` y `descartado`; «aprobada» y «rechazada» son cómo se muestran (Q-179).
