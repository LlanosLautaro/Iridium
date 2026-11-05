---
name: iridium
description: Cómo trabajar desde Iridium, la app de escritorio con la que el usuario dirige sus proyectos, y los formatos exactos de los archivos que Iridium lee (docs/estado.md con sus Q-n, docs/respuestas/, docs/scripts.md, los frentes de docs/modulos/, los comentarios de docs/revision/ y la ficha .proyecto.json). Usala siempre que la instrucción del sistema diga «Trabajás desde Iridium»: antes de escribir o cambiar estado.md, una pregunta, una prueba, scripts.md, un comentario de la Revisión o la ficha de un proyecto, y al cerrar cada sesión.
---

# Trabajar desde Iridium

Iridium es la app de escritorio con la que el usuario dirige sus proyectos con vos. **No tiene base de datos:** vigila los archivos de cada proyecto y redibuja la pantalla cuando cambian. Si escribís un archivo con el formato correcto, el usuario lo ve enseguida; si no, no ve nada y nadie le avisa. Esta skill la carga Iridium solo en sus conversaciones; afuera (VS Code, la terminal) no existe.

La guía de hitos (`hitos-desarrollo-app`) dice cómo se desarrolla cada proyecto. Esta dice cómo se ve eso en Iridium. Si las dos no coinciden en un formato, manda esta: es lo que Iridium lee de verdad.

## Dónde estás

- Te abre **el Claude Code que trae Iridium** (el Agent SDK con su propia CLI), con la cuenta de Claude del usuario. La sesión se inicia desde Iridium (abajo a la izquierda); vos no podés hacerlo.
- **Permisos:** sin confirmaciones (`bypassPermissions`). No toques nada fuera de la carpeta en la que trabajás sin que el usuario lo pida.
- **Configuración:** la del usuario (`%USERPROFILE%\.claude`: su `CLAUDE.md`, sus skills, sus hooks) y la del proyecto. No hay `AskUserQuestion`.
- La instrucción del sistema empieza con «Trabajás desde Iridium…» y dice en qué chat estás:

| Chat | Carpeta | Cómo hablás con el usuario |
|---|---|---|
| **De un proyecto** («Nadie mira esta sesión en vivo») | la del proyecto | **No preguntás en el chat.** Todo lo que necesitás de él va como `Q-n` en `docs/estado.md`. Cerrás con el estado al día y un Próximo paso concreto. |
| **General** (al lado de la grilla y en Ideas) | `Ideas`, en la carpeta de Iridium | En el chat: respondés y, si necesitás algo, preguntás al final, en pocas palabras. Las reglas están en el `CLAUDE.md` de esa carpeta. |
| **Skills** | `Skills`, en la carpeta de Iridium | En el chat, como en el general. |

En el chat de un proyecto el usuario lee lo que dejaste cuando vuelve: la tarjeta, Pendientes y tu última respuesta. Una pregunta escrita en el chat se pierde.

Si algo de Iridium falla (no del proyecto), no intentes arreglar la app: anotalo en `ideas.md` de la carpeta `Ideas`, en una sección «Problemas de Iridium», con la fecha y qué pasó.

## Qué muestra cada sección y de dónde lo saca

| Sección | Qué muestra | De dónde |
|---|---|---|
| **Proyectos** (la grilla) | Una tarjeta por carpeta, agrupadas por estado | `.proyecto.json`, el ícono y `docs/estado.md` |
| **Pendientes** | Las `Q-n` sin responder, con un formulario | «Preguntas abiertas» de cada `estado.md` y `docs/respuestas/` |
| **Docs** y **Mapa** | Los documentos y el avance por hitos, frentes e iteraciones | `docs/*.md` y `docs/modulos/*/estado.md` |
| **Scripts** | Un botón por script | `docs/scripts.md` |
| **Ideas del proyecto** | Las ideas para después, a un clic | `07-construccion.md` › «Ideas nuevas…» y `00-idea.md` › «Ideas para después…» (el `## ` tiene que empezar así; cada punto de la lista, una idea) |
| **Skills del proyecto** | Las skills propias del proyecto; el ícono sale solo si hay alguna | `.claude/skills/<skill>/SKILL.md` (`name` y `description`) |
| **Git** | Los commits y si está en GitHub | el repo del proyecto |
| **Revisión** | Los comentarios del usuario sobre la interfaz | `docs/revision/R-n.md` |
| **Skills** | Las skills y si cada proyecto está al día con la guía | la carpeta de skills y `**Formato de la guía:**` de `docs/README.md` |

## `docs/estado.md`

Iridium lee estos títulos y campos exactos (plantilla `templates/estado.md` de la guía):
- `**Última actualización:** AAAA-MM-DD`
- `## Hito actual` y debajo una línea `N — Nombre — estado`. Va a la tarjeta.
- `## Progreso de hitos`: una tabla con la columna Estado en palabras fijas: `pendiente`, `en curso`, `completo`, `saltado`, `reabierto`.
- `## Preguntas abiertas`: las `Q-n` (abajo). Sin preguntas: `(ninguna)`.
- `## Próximo paso`: la primera línea va a la tarjeta. Una acción concreta, en una línea.

«Pendientes» de `estado.md` es solo trabajo tuyo: lo que espera del usuario no va ahí.

## Las preguntas: `Q-n` en «Preguntas abiertas»

Todo lo que esperás del usuario es una `Q-n`: una decisión, una prueba, un material, una tarea a mano. Lo que no es `Q-n`, el usuario no lo ve como algo suyo.

```markdown
## Preguntas abiertas
- **Q-3 — ¿La pantalla principal muestra una lista o una grilla?**
  Tipo: decisión · frena
  Contexto: `04-ux.md` › Pantalla principal. La lista entra más; la grilla se ve mejor con fotos.
  Opciones: A) Lista (recomendada) · B) Grilla
- **Q-4 — Probá la primera versión**
  Tipo: prueba
  Contexto: abrila con `scripts.md` › Abrir en modo desarrollo. Fijate:
  - [ ] Se puede crear una nota
  - [ ] La nota sigue ahí al cerrar y abrir
```

- El ítem empieza con `**Q-n — título**`. El código no se repite: el siguiente es el más alto del proyecto + 1.
- `Tipo:` es `decisión`, `consulta`, `prueba`, `tarea` o `formulario`; se le suma `· frena` si sin la respuesta no podés seguir.
- `Opciones:` va en una línea propia, `A) … · B) …`, con la recomendada marcada. Si van en la misma línea que otra cosa, el formulario queda sin opciones.
- **Las pruebas y las tareas van solo con casillas**, un `- [ ]` corto por cosa a mirar, **sin** `Opciones: A) Todo bien · B) Algo falla`: la casilla sin marcar y su nota ya dicen qué falló. Juntar las dos cosas es contradictorio.
- Si cambiás el título de una `Q-n` ya respondida, la respuesta vieja deja de valer. Para otra cosa, otro código.

## Las respuestas: `docs/respuestas/Q-n.md`

El formulario de Iridium escribe:

```markdown
# Q-3 — ¿La pantalla principal muestra una lista o una grilla?

**Opción:** A) Lista

(texto libre, si escribió algo)
```

En una prueba, las casillas marcadas o no, cada una con su nota. Al empezar una sesión con preguntas abiertas, mirá esa carpeta. Por cada respuesta: aplicala (una decisión va a `docs/decisiones.md`), sacá la `Q-n` de «Preguntas abiertas» y agregá al final del archivo `> Procesada el AAAA-MM-DD → D-n` (o adónde fue). Esa línea la escribís vos, nunca Iridium; mientras falte, Pendientes la muestra como «respondida sin procesar».

## Los scripts: `docs/scripts.md`

Lo que el usuario ejecuta a mano va acá, nunca en el chat. Cada script es un botón:

```markdown
# Scripts

## Abrir en modo desarrollo
Abre la app con datos de prueba.
**Ejecutar:** `npm run dev`

## Instalar dependencias
Una vez, o cuando la IA lo pida.
**Ejecutar:** `npm install`
**Carpeta:** `app`

## Ver las capturas
**Abrir:** `docs/capturas`
```

- Un `##` por script, una línea de para qué sirve y **una** línea de acción con el valor entre comillas invertidas: `**Ejecutar:**` (un comando, que corre en la raíz o en la `**Carpeta:**` indicada; o un archivo del proyecto, `.exe`, `.msi`, `.bat`, `.lnk`…, que Windows abre) o `**Abrir:**` (una carpeta o un archivo para ver).
- Lo más usado primero. En una `Q-n`, citá el script (`scripts.md` › Abrir en modo desarrollo) en vez de repetir el comando.
- Sin nada que ejecutar todavía: «(Todavía no hay scripts: el proyecto no tiene código.)».

## Docs, Mapa, códigos y frentes

- Los códigos (`D-n`, `Q-n`, `H-n`, `I-n`, `R-n`…) se vuelven enlaces si nacen en un título que empieza por ellos (`## D-4 — …`). Para citar una sección: `archivo.md` › Título.
- El Mapa sale de la tabla de hitos de `estado.md` y, dentro de cada hito, de su `## Portón` (en el de construcción, de la tabla de iteraciones con columna ID y filas `I-n`). No cambies los títulos ni las columnas de las plantillas.
- **Frentes:** cada módulo tiene `docs/modulos/<nombre>/estado.md`, con su tabla de pasos y sus iteraciones; el Mapa muestra una fila con el núcleo y cada módulo. En el `estado.md` general, la tabla «Módulos» dice cuál es el frente activo. Las `Q-n` de un módulo van igual en el `estado.md` general.
- `docs/README.md` lleva `**Formato de la guía:** AAAA-MM-DD`: la sección Skills marca los proyectos atrasados.

## Los comentarios de la Revisión: `docs/revision/R-n.md`

El usuario comenta la interfaz de una app con F8 y el comentario llega como `docs/revision/R-n.md` (con su captura `R-n.png`). Leelo, resolvelo y cerralo: cambiá `**Estado:** abierto` por `**Estado:** cerrado` y agregá una línea al final de «## Historia»:

```markdown
- AAAA-MM-DD HH:MM — cerrado por la IA: qué hiciste
```

**Cerrado es solo lo que quedó hecho de verdad.** Si no lo resolvés ahora (va a un plan, al Backlog, a otra iteración), no lo cierres: poné `**Estado:** anotado` y una línea que diga dónde quedó y por qué:

```markdown
- AAAA-MM-DD HH:MM — anotado por la IA: `10-operacion.md` › Backlog (Should); se hace después de compartir
```

Iridium muestra los anotados aparte (ni abiertos ni cerrados) y no te los vuelve a pedir en cada sesión. Cuando hagas lo anotado, cerralo con su línea «cerrado por la IA».

## La ficha del proyecto: `.proyecto.json`

La tarjeta sale de `.proyecto.json` en la raíz del proyecto. Sin ficha, o con el JSON roto, la tarjeta dice «sin clasificar».

```json
{
  "version": 1,
  "descripcion": "Una línea: qué es el proyecto.",
  "estado": "en-desarrollo",
  "etiquetas": [],
  "icono": ".proyecto-icono.svg",
  "archivado": false,
  "reemplazadoPor": null
}
```

- Obligatorios: `version` (1) y `estado`, uno de `idea`, `en-desarrollo`, `en-uso`, `pausado`, `descontinuado`, `en-rescate`, `para-eliminar`. El estado decide el grupo de la grilla.
- `icono`: ruta relativa dentro del proyecto (svg, png, jpg, webp, gif, ico), nunca absoluta ni con `..`; `null` es el genérico. De costumbre, un `.proyecto-icono.svg` cuadrado y simple.
- `reemplazadoPor`: el nombre de la carpeta del proyecto que lo reemplaza, o `null`. Los campos que no conozcas, dejalos como están.
- El usuario puede cambiar `estado`, `archivado` e `icono` desde el menú de la tarjeta en Iridium: releé la ficha antes de tocarla. Con **Nuevo proyecto**, Iridium crea la carpeta vacía y te manda el primer mensaje: arrancá con la guía y creá la ficha y el ícono.

## Al cerrar cada sesión de un proyecto

`estado.md` con la fecha y un Próximo paso concreto, las decisiones registradas, lo que necesitás del usuario como `Q-n`, los comentarios de la Revisión cerrados y el código commiteado.
