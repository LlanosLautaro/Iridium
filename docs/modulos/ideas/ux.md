# UX del módulo: Ideas

**Fecha:** 2026-11-16
**Estado:** aprobada en Q-180
**Base:** `definicion.md`, D-128 (la forma C, el inicio igual), D-129 (aprobar es pasar al trabajo de la IA). Las maquetas: `docs/diseno/pantallas/ideas-proyecto-c.html` e `ideas-inicio-c.html`.
> Usa los principios de interacción y las piezas generales (`04-ux.md`, `modulos/diseno/ux.md` › Las piezas).

## Puntos de entrada y salida
- **En un proyecto:** Ideas en la barra lateral, entre el Mapa y la Revisión. Se vuelve a cualquier otra sección con la barra; la conversación de al lado no cambia.
- **En el inicio:** Ideas (Ctrl+3), como hoy; muestra las ideas sueltas (sin proyecto). Reemplaza al bloc de notas (W-10).
- **Desde la conversación:** cuando la IA anota una idea (por ejemplo, después de Revisar con la IA), su línea de paso la nombra y lleva a ella.
- Un proyecto sin el framework no tiene Ideas en la barra (sus ideas viven en su `trabajo.md`, que no tiene).

## Historias de usuario
- **ID-1 —** Como usuario quiero anotar una idea sin salir del proyecto, para no perderla mientras hago otra cosa (T-69).
  - [ ] Escribir en el campo de arriba y Enter (o Anotar) la deja primera en «Ideas», sin evaluar, con la fecha de hoy; el campo queda vacío y con el foco.
  - [ ] Si lo escrito tiene varias líneas (Shift+Enter), la primera es el título y el resto, su nota.
  - [ ] Si lo escrito es solo una dirección de internet, va a «Enlaces» (ID-4).
- **ID-2 —** Como usuario quiero abrir una idea y escribir en ella, para pensarla con más detalle.
  - [ ] Un clic en su renglón la abre en su lugar; otro clic, Esc o abrir otra la cierra. Una abierta a la vez.
  - [ ] La nota se escribe libre: pegar una dirección la vuelve una etiqueta con el nombre y el sitio (un clic la abre en el navegador); pegar una imagen la guarda con la idea; pegar texto con formato pega solo el texto.
  - [ ] Se guarda sola un momento después de escribir; al salir y volver sigue ahí.
  - [ ] Cambiar la primera línea cambia el título del renglón.
- **ID-3 —** Como usuario quiero aprobar o rechazar una idea y ver su estado de un vistazo.
  - [ ] En la idea abierta, Aprobar la pone en verde («Aprobada») y Rechazar, en rojo con el título apagado («Rechazada»); el mismo botón otra vez la vuelve a sin evaluar.
  - [ ] Los dos también están en el menú del renglón (clic derecho).
  - [ ] Aprobada, la IA la ve en su trabajo como pendiente (D-129); al terminarla, la idea pasa a Hechas sola.
  - [ ] Los filtros de arriba (Todo, Para revisar, Sin evaluar, Aprobadas, Rechazadas, Hechas) muestran cuántas hay; «Todo» no muestra las hechas.
- **ID-4 —** Como usuario quiero guardar un enlace para que la IA lo revise, para sacar ideas de un repo o un artículo sin hacerlo yo.
  - [ ] Pegado en el campo de arriba queda en «Enlaces» con su nombre (el repo, o el título de la página) y su sitio; si escribí algo además del enlace, va como su descripción.
  - [ ] Revisar con la IA (en el renglón, el botón de enviar, el mismo que el de las ideas: R-77) lo cita arriba del campo de la conversación de al lado, sin enviar (D-131): al enviar, va «Revisá <enlace>: ¿qué podemos sacar de ahí para <proyecto>?», con la descripción, y después lo que escriba el usuario. Si la IA está trabajando, queda en cola, como cualquier mensaje.
  - [ ] La IA propone en el chat; lo que el usuario elige, la IA lo anota como idea (con el robot, sin evaluar) y marca el enlace como revisado.
  - [ ] El tilde del renglón lo marca como revisado a mano. Un enlace revisado pasa a Hechas.
  - [ ] Un clic en el renglón abre el enlace en el navegador.
- **ID-5 —** Como usuario quiero ver las ideas de la IA junto a las mías, para tener un solo lugar con lo que hay por pensar (Q-176).
  - [ ] Las ideas de la IA (los `T-n` que nacen como idea) llevan un robot en lugar de la lamparita (sin el código a la derecha: para el usuario es ruido, Q-183; la fecha sí).
  - [ ] Se aprueban y rechazan igual; su texto se lee al abrirlas, y para cambiarlo está Hablar de esta idea (no se borran: se rechazan).
- **ID-6 —** Como usuario quiero hablar de una idea con la IA.
  - [ ] Hablar de esta idea la cita arriba del campo de la conversación, con su título (sin el código, Q-183), para escribir sobre ella (D-131); la ✕ la saca.
- **ID-7 —** Como usuario quiero anotar en el inicio lo que todavía no tiene proyecto y pasarlo a uno después (Q-177).
  - [ ] En Ideas del inicio, al lado del campo, el selector de proyecto dice «Sin proyecto»; con otro elegido, la idea va directo a ese proyecto (y se avisa «Anotada en Alfa · Ver»).
  - [ ] En una idea suelta abierta, Mover a un proyecto abre la lista de proyectos con framework; al elegir uno, la idea pasa con su nota y sus imágenes, sin evaluar, y se avisa «Movida a Alfa · Ver».
  - [ ] Revisar con la IA y Hablar de esta idea usan la conversación del inicio (Ideas y proyectos).
- **ID-8 —** Como usuario quiero borrar una idea mía que anoté por error.
  - [ ] Borrar, en la idea abierta o con clic derecho, la quita después de confirmar en el cuadro del centro (PZ-8: «¿Borrar esta idea?» · No · Sí, borrar; Esc es No); con imágenes, se borran con ella. (Antes la confirmación iba en el mismo lugar; cambió en Q-189: desde el menú, en el renglón quedaba lejos de donde se eligió.)

## Flujos
**ID-9 — Revisar un enlace con la IA**
1. El usuario pega un enlace en el campo de arriba → queda en «Enlaces».
2. Revisar con la IA → queda citado en la conversación de al lado; el usuario suma lo que quiera y envía (o queda en cola) (D-131).
3. La IA lo lee y propone qué sacar. Si no puede leerlo (pide iniciar sesión, no existe, no hay red), lo dice en el chat y el enlace sigue en «Para revisar».
4. El usuario elige → la IA anota cada idea elegida (robot, sin evaluar, con el enlace en su origen) y marca el enlace como revisado. Si no elige nada, el usuario lo marca con el tilde.

**ID-10 — De idea a trabajo**
1. Sin evaluar → Aprobar → aprobada (verde): en el trabajo de la IA, pendiente.
2. La IA la toma cuando le toque → sigue verde mientras la hace.
3. La IA la termina → pasa a Hechas.
4. Rechazar, en cualquier momento antes de terminarla → rechazada (rojo): en el trabajo, descartada.

**ID-11 — Errores**
- No se pudo guardar (la carpeta no se puede escribir, el disco lleno): un Recuadro de error arriba de la lista, con lo que no se guardó copiado; la nota sigue abierta.
- La IA cambió el archivo mientras el usuario escribía: gana lo último guardado y la lista se actualiza sola cuando no se está escribiendo (como el bloc, D-126).
- Un enlace sin nombre (no se pudo leer el título): se muestra la dirección.

## Pantallas
### W-10 — Ideas (en un proyecto y en el inicio)
- Propósito: anotar y ver las ideas y los enlaces para revisar de un proyecto, o los sueltos.
- Wireframe: las maquetas `ideas-proyecto-c.html` (proyecto) e `ideas-inicio-c.html` (inicio).
- Estados:
  - **Vacío:** sin ideas ni enlaces, debajo del campo: «Todavía no hay ideas. Escribí una arriba o pegá un enlace para revisar.» Sin los títulos de grupo.
  - **Sin enlaces para revisar:** el grupo «Para revisar» no se muestra.
  - **Un filtro sin nada:** «No hay ideas aprobadas.» (o la que corresponda), en gris.
  - **Con datos:** «Para revisar» arriba (lo más nuevo primero), después «Ideas» (lo más nuevo primero).
  - **Error:** el Recuadro de error de ID-11.
  - **Extremos:** un título largo se corta con «…» en el renglón y se ve entero al abrirla; con muchas ideas la lista se desplaza y el campo de arriba queda a la vista.

## Piezas de UI nuevas
| Pieza | Por qué hace falta | Agregada al sistema |
|---|---|---|
| Etiqueta de enlace (el nombre, el sitio y el ícono de abrir, dentro del texto) | se usa en la nota de cada idea; hoy existe solo en el bloc | sí: PZ-14 (ID-I3, 2026-11-16) |
| Fila que se abre en su lugar (la idea abierta, con su nota y sus botones abajo) | ninguna pieza abre una fila sin salir de la lista | sí: PZ-13 (ID-I1, 2026-11-16) |
| Ícono robot | marca lo que anotó la IA | sí: en las maquetas (`piezas.js`) y en la app (ID-I1) |
