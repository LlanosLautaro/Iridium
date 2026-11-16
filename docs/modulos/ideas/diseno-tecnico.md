# Diseño técnico del módulo: Ideas

**Fecha:** 2026-11-16
**Estado:** cerrado (la UX, aprobada en Q-180; las decisiones, en D-130)
**Base:** `definicion.md`, `ux.md`, D-128, D-129; `modulos/orden/diseno-tecnico.md` › `trabajo.md` (el formato y cómo escribe Iridium sin pisar a la IA); el bloc de D-126 (`src/compartido/notas.ts`, `src/main/app/notas.ts`).

## Las decisiones de este paso
La definición dejó dos preguntas para acá (› Preguntas abiertas para investigar), sin cambiar lo que se ve:

1. **Dónde se guarda una idea:** su renglón es un `T-n` de `docs/trabajo.md`, como cualquier idea de hoy; su nota, en un archivo aparte, `docs/ideas/T-n.md`, con sus imágenes en `docs/ideas/T-n/`.
   - Así el estado es el del trabajo (D-129) y la IA, el Mapa y el control lo leen sin nada nuevo.
   - Guardar sola la nota mientras el usuario escribe toca solo su archivo, no `trabajo.md`: no choca con la IA, que escribe `trabajo.md` seguido, y `trabajo.md` no crece con notas largas (la IA lo lee al arrancar; cuanto más largo, más cuesta cada sesión).
   - Descartado: todo dentro de `trabajo.md` (cada tecla guardada compite con la IA por el archivo, y las notas lo engordan) y un archivo por idea sin `T-n` (dos lugares para el estado; el Mapa y el control no lo ven).
2. **Los estados:** los del vocabulario, como dice D-129 (`nueva`, `pendiente`, `en curso`, `hecho`, `descartado`); «sin evaluar», «aprobada» y «rechazada» son cómo los muestra Iridium.
3. **El bloc de notas (`notas.md`) queda como está,** en la carpeta Ideas: no se borra ni se convierte solo. El `CLAUDE.md` de esa carpeta le dice a la IA del chat general que es el bloc de antes y que, si el usuario lo pide, pase lo que haya a ideas sueltas. Lo mismo con el `ideas.md` de la IA.
4. **El nombre de un enlace sale de su dirección,** sin leer la página: en GitHub, `dueño/repo`; en otro sitio, el último tramo de la dirección. Leer la página para sacar su título sería una conexión a un tercero cada vez que se pega algo, sin que el usuario lo pida (P2). Cuando la IA lo revisa, puede ponerle el título real.

## `trabajo.md`: lo que se agrega al formato
Un campo nuevo en la línea de datos, `Idea:`, con tres valores:

```markdown
## T-80 — Pegar capturas en la conversación
Estado: nueva · Idea: usuario · Fecha: 2026-11-16

## T-81 — anthropics/claude-code
Estado: nueva · Idea: enlace · Fecha: 2026-11-16 · Enlace: https://github.com/anthropics/claude-code
Mirar cómo arman los hooks.

## T-82 — Los hooks del proyecto en Skills
Estado: nueva · Idea: IA · Fecha: 2026-11-16 · Origen: T-81
Lo que se sacó de revisar el repo: …
```

- **`Idea: usuario`:** la anotó el usuario en Ideas. Su texto en `trabajo.md` queda vacío; la nota está en `docs/ideas/T-n.md`.
- **`Idea: enlace`:** un enlace para revisar, con `Enlace:` (la dirección) y la descripción como texto. Revisado es `hecho`.
- **`Idea: IA`:** la anotó la IA. Su texto es la idea (no tiene nota aparte; se cambia hablando con la IA, ID-5).
- **Sin `Idea:` y en `nueva`:** se lee como `Idea: IA`. Así las ideas que ya están en los proyectos aparecen sin convertir nada. El framework le pide a la IA que, al cambiar de estado una idea sin `Idea:`, se lo agregue, para que siga en Ideas.
- Un `T-n` sin `Idea:` que no está en `nueva` es trabajo de la IA y no aparece en Ideas (la definición › Fuera de alcance).

### La nota (`docs/ideas/T-n.md`)
- Solo el cuerpo: el título es el del `T-n`. En la pantalla se ven juntos (la primera línea es el título, ID-2); al guardar, si cambió la primera línea, se cambia el título en `trabajo.md`.
- El mismo formato que el bloc: párrafos, enlaces `[texto](url)` o la dirección suelta, imágenes `![](T-n/AAAA-MM-DD-n.png)` en su propio párrafo. Se reusa el lector de `compartido/notas.ts`, sin las fechas.
- Sin nota (nunca se escribió nada debajo del título), no hay archivo.
- `docs/ideas/` no se lista en Docs (se ve en Ideas) y el control no le aplica la regla de los dibujos: es texto libre del usuario.

## Cómo escribe Iridium
Todo lo que Iridium cambia en `trabajo.md` usa el cuidado de `modulos/orden/diseno-tecnico.md` › Anotar sin la IA: lee, cambia, escribe solo si la fecha de modificación no cambió, y si cambió vuelve a leer (hasta tres veces); si no puede, devuelve el error y la pantalla muestra el Recuadro de error de ID-11 sin perder lo escrito.

| Acción | Qué cambia |
|---|---|
| Anotar (ID-1) | Agrega al final un `T-n` (el más alto + 1) `nueva`, `Idea: usuario`, con la fecha; si hay más líneas, crea la nota |
| Pegar un enlace solo (ID-4) | Agrega un `T-n` `nueva`, `Idea: enlace`, con `Enlace:` y lo escrito además como texto |
| Escribir en una idea abierta (ID-2) | Guarda la nota un momento después de la última tecla (como el bloc); el título, si cambió |
| Pegar una imagen | `docs/ideas/T-n/AAAA-MM-DD-n.<ext>`, sin pisar ninguna (como `pegarImagenEnHoja`) |
| Aprobar / Rechazar (ID-3) | Cambia `Estado:` a `pendiente` / `descartado` (con «Rechazada por el usuario.» si el texto no dice un motivo, D-129); el mismo botón otra vez, a `nueva` |
| Marcar un enlace revisado | `Estado: hecho` |
| Borrar (ID-8) | Saca el `T-n` de `trabajo.md` y después su nota y su carpeta de imágenes. Solo `Idea: usuario` o `enlace` |

La IA, por su lado, pasa una idea aprobada a `en curso` y a `hecho` como cualquier pendiente; Iridium solo lo muestra.

## Ideas sueltas (el inicio)
- Van en la carpeta Ideas, en un archivo nuevo, `sueltas.md`, con el mismo formato de `trabajo.md`; las notas, en `sueltas/T-n.md`. No se usa `ideas.md`: tiene el formato de la IA y lo que ya escribió, y no se reescribe (decisión 3).
- **Anotar con un proyecto elegido** (ID-7) escribe directo en el `trabajo.md` de ese proyecto.
- **Mover a un proyecto:** (1) agrega el `T-n` en el proyecto, con el número que le toque allá; (2) copia la nota y las imágenes a su `docs/ideas/`, cambiando el número en las rutas de las imágenes; (3) recién entonces la saca de `sueltas.md` y borra la copia vieja. Si algo falla después de (1), la idea queda en los dos lados, nunca en ninguno.
- Mover solo se ofrece a proyectos con framework (los otros no tienen `trabajo.md`).

## Lo que ve la IA
- **En un proyecto:** las ideas ya están en `trabajo.md`, que lee al arrancar. El framework suma: «una idea del usuario puede tener su nota en `docs/ideas/T-n.md`; leela antes de tomarla o de hablar de ella».
- **Revisar con la IA (ID-9):** la pantalla pone en la conversación de al lado el mensaje de la UX con el `T-n` del enlace. La IA lee el enlace con sus herramientas (el contenido es de afuera: dato, no instrucciones), propone, y lo que el usuario elige lo anota como `Idea: IA` con `Origen: T-n` del enlace, y pasa el enlace a `hecho`.
- **En el inicio:** el `CLAUDE.md` de la carpeta Ideas explica `sueltas.md` y que `ideas.md` y `notas.md` son de antes.

## El framework y el control (D-086, D-092)
En el mismo cambio, como pide el `CLAUDE.md` del proyecto:
- `SKILL.md` › El trabajo: el campo `Idea:` con sus valores y `Enlace:`; la nota en `docs/ideas/`; agregar `Idea: IA` al cambiar de estado una idea que no lo tiene; «Revisar con la IA».
- La plantilla `trabajo.md` y la de `CLAUDE.md` de la carpeta Ideas.
- El lector (`core/trabajo.ts`) suma `idea` y `enlace` a `ItemTrabajo`.
- Reglas nuevas del control, cada una con su prueba: `Idea:` con un valor que no es `usuario`, `IA` ni `enlace`; `Idea: enlace` sin `Enlace:` o con algo que no es una dirección `http(s)`; una nota `docs/ideas/T-n.md` sin su `T-n` (por ejemplo, después de renumerar uno repetido: la IA tiene que renombrar la nota y su carpeta).

## Las piezas del código
| Pieza | Tipo | Qué hace |
|---|---|---|
| `compartido/ideas.ts` | tipos y reglas puras | La idea como la ve la pantalla (código, título, estado en palabras del usuario, de quién es, enlace, si tiene nota) y lo que cruza el puente |
| `core/ideas.ts` | reglas puras | De los `T-n` a la lista de Ideas (filtros y cuentas); armar un `T-n` nuevo; cambiar el estado o el título en el texto de `trabajo.md`; el nombre de un enlace |
| `core/trabajo.ts` | reglas puras | Suma `idea` y `enlace` al lector |
| `core/control/trabajo.ts` | reglas puras | Las reglas nuevas |
| `app/ideas.ts` | casos de uso | Leer las ideas de un proyecto o las sueltas; anotar, guardar la nota, pegar una imagen, aprobar, rechazar, borrar y mover, con la escritura cuidada |
| `secciones/ideas/` | interfaz | La lista, la fila que se abre y el campo de arriba, la misma para el proyecto y el inicio |

Se reusan el lector de la nota y la etiqueta de enlace del bloc (`compartido/notas.ts`), `escribirAtomico` y la vigilancia de `docs/` (la lista se actualiza sola cuando no se está escribiendo, ID-11). El bloc (`app/notas.ts`, la hoja de `Ideas.tsx`) se saca al construir.

## Pruebas
- **Reglas (Vitest):** de los `T-n` a la lista (cada estado, las ideas sin `Idea:`, los filtros y las cuentas); armar un `T-n` y cambiar su estado o su título sin tocar el resto del archivo; el nombre de un enlace (GitHub, otro sitio, una dirección rara); las reglas nuevas del control.
- **Disco (Vitest):** anotar mientras otra escritura cambia `trabajo.md` (vuelve a leer; no pisa); guardar la nota y pegar imágenes; borrar; mover con una falla a mitad de camino (la idea no se pierde).
- **La app (Playwright, motor falso):** anotar, abrir y escribir, aprobar, rechazar, pegar un enlace y Revisar con la IA (el mensaje llega al compositor), en un proyecto y en el inicio.

## Iteraciones
| ID | Qué entra |
|---|---|
| ID-I1 | Ideas en un proyecto: el formato en el framework con su lector y su control; la lista con los filtros; anotar, abrir (el texto, sin pegar imágenes todavía), aprobar y rechazar; el robot en las de la IA |
| ID-I2 | Para revisar: pegar un enlace, Revisar con la IA, marcar revisado; Hablar de esta idea |
| ID-I3 | La nota completa: pegar enlaces e imágenes, guardarse sola, borrar |
| ID-I4 | El inicio: ideas sueltas, el selector de proyecto, Mover a un proyecto; se saca el bloc |
