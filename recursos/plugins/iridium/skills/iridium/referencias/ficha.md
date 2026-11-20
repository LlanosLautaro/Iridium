# La ficha de un proyecto

El formato de `.proyecto.json` está en `SKILL.md` › La ficha. Acá, cómo se llena y cómo se repasa. El ícono, en `iconos.md`.

## Los campos

| Campo | Regla |
|---|---|
| `descripcion` | Qué hace el proyecto y para qué, en una o dos frases y hasta **180 caracteres** (Iridium no acepta más). No cómo está hecho, sin repetir el nombre al principio. |
| `etiquetas` | De 1 a 4, en minúscula y singular, hasta 24 caracteres cada una. Ver «Etiquetas». |
| `estado` | Ver «El estado». |
| `archivado` | `true` la saca de la grilla a «Archivados». No cambia el estado ni toca la carpeta. |
| `reemplazadoPor` | Solo con `en-rescate`: la carpeta del proyecto que lo reemplaza, que tiene que existir. Con cualquier otro estado, `null`. |

Al editar, cambiá solo lo necesario: conservá los campos que no conozcas y el orden. JSON válido, con 2 espacios de sangría, UTF-8 sin BOM; después de escribirlo, comprobá que se lee.

## El estado

| Estado | Quiere decir |
|---|---|
| `idea` | anotado; todavía no arrancó (hitos 0 y 1) |
| `en-desarrollo` | se está construyendo (hitos 2 a 9) |
| `en-uso` | se usa de verdad (lanzado, o en operación) y se mantiene cuando hace falta |
| `pausado` | se dejó por un tiempo, con intención de retomarlo |
| `descontinuado` | abandonado; no se retoma ni le sirve a otro |
| `en-rescate` | abandonado, pero tiene algo útil para el proyecto que lo reemplaza (`reemplazadoPor`) |
| `para-eliminar` | ya no aporta nada (o ya se rescató lo útil) |

- `idea`, `en-desarrollo` y `en-uso` siguen al hito: al pasar un portón, si no corresponde, cambialo y decilo en una línea.
- `pausado`, `descontinuado`, `en-rescate`, `para-eliminar` y `archivado` **los decide el usuario** (desde el menú de la tarjeta o con una `Q-n`). Podés sugerirlos, por ejemplo si un proyecto lleva meses quieto; nunca los aplicás solo.
- Una carpeta simple (sin `docs/estado.md`) también lleva ficha; su estado sale de cómo se usa.

## Etiquetas

- Dicen **tecnología o plataforma** (`electron`, `python`, `web`) o **familia** (los proyectos de una misma familia comparten su etiqueta).
- Antes de inventar una, mirá las fichas de las otras carpetas de la grilla (solo leerlas): mismo concepto, misma palabra (no `react` en una y `reactjs` en otra).
- Con tildes si las lleva (`extensión`). Nada de estados ni prioridades: para eso está `estado`.

## Cuándo se toca

- **Proyecto nuevo:** la ficha la crea Iridium en `idea`; en la primera conversación completás la descripción, las etiquetas y el ícono.
- **Al cerrar un hito:** ¿el estado sigue al hito? ¿La descripción sigue siendo cierta (sobre todo al cerrar el 1 y el 2)? ¿Hay tecnologías nuevas que merezcan etiqueta (al cerrar el 5)? Lo que cambie el sentido, proponelo; lo mecánico, aplicalo y avisalo.

## Repaso de todos los proyectos

Cuando el usuario lo pida (desde el chat general):
1. Recorré las carpetas de la grilla (las que no empiezan con `.`): su ficha, su `docs/estado.md` si tiene, y la fecha del último cambio (sin `.git`, `node_modules` ni lo armado).
2. Buscá: sin ficha o con el JSON roto; sin ícono o con uno fuera del estilo; un estado que no sigue al hito o a la actividad (`en-desarrollo` sin cambios hace meses); `reemplazadoPor` a una carpeta que no existe o sin `en-rescate`; una descripción larga o vieja; etiquetas repetidas con otro nombre.
3. Mostralo en una tabla corta (proyecto · estado · problema · propuesta), separando lo que corregís vos (formato, rutas, etiquetas equivalentes, el estado que sigue al hito) de lo que decide el usuario (pausar, descontinuar, rescatar, archivar, eliminar).
4. Aplicá lo aprobado. En un repaso no se tocan el código ni los `docs/` de los proyectos; nunca se mueve ni se borra una carpeta.
