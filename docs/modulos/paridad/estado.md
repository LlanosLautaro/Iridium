# Estado del módulo: Paridad

**Tipo:** sección
**Última actualización:** 2026-11-22
**Nivel de protección:** hereda P2

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (Q-237 a Q-239, D-166) | `propuesta.md` |
| 2. Definición | hecho (Q-243, Q-244, D-167) | `definicion.md` |
| 3. Investigación | hecho (spike S-5) | `investigacion.md` |
| 4. UX | hecho (Q-246, Q-247, D-168) | `ux.md` |
| 5. Diseño técnico | hecho (D-169) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | hecho (D-170) | `06-ui.md` y `diseno/piezas.css` |
| 7. Construcción | en curso (PA-I1 y PA-I2 probadas en Q-250 y Q-251; PA-I3 hecha, espera Q-258) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Definición aprobada e investigación hecha (2026-11-21): los cuatro pedidos entran como Must y todo lo del motor pasa por su frontera; la lista de «/» esconde los comandos que pisan a Iridium y los de la terminal (D-167). La ronda de UX (T-100) y su tanda ya están (2026-11-21).
La UX está aprobada (`ux.md`, PA-1 a PA-6, D-168): un comando escondido escrito a mano no se manda y dice dónde está en Iridium. Diseño técnico cerrado (D-169): el motor dice qué sabe hacer (comandos, fotos, escondidos), los adjuntos viajan con marcas de Iridium que el historial reconoce y las fotos pegadas se guardan en los datos de Iridium. Piezas en el sistema (D-170): la Ficha (PZ-16), el menú arriba del compositor y el estado de soltar, con su maqueta.
**PA-I1 hecha** (2026-11-21): «/» abre la lista arriba del compositor, elegir no manda, los usados hace poco van primero, un escondido escrito a mano no se manda y dice dónde está eso en Iridium, el + tiene Comandos y la lista se pone al día cuando la IA descubre una skill. Probada en Q-250: todo bien.
**PA-I2 hecha** (2026-11-22): el + (y `Ctrl+U`) suma archivos y fotos con el selector de Windows, arrastrarlos sobre la conversación también, y una captura pegada con `Ctrl+V` es una foto. Cada adjunto es una ficha arriba del cuadro (la foto, miniatura; un clic la abre grande), se guarda con lo escrito y sale con el mensaje: la foto dentro, el archivo como su ruta; en el hilo, las fichas quedan arriba de lo escrito, también al reabrir. Probada con el Claude Code real: vio la foto y abrió el archivo. Probada en Q-251, todo bien; pediste un clip en vez de la hoja en «Agregar archivos o fotos»: hecho. Sigue PA-I3, el texto largo pegado.
**PA-I3 hecha** (2026-11-22): un texto pegado de más de 40 líneas o 2.000 caracteres queda como ficha «Texto pegado · 340 líneas»; un clic lo abre en el visor, la ✕ lo saca y `Ctrl+Z` justo después lo vuelve texto en el cuadro, donde se pegó. Va con el mensaje y queda en él, también al reabrir. «Sobre la skill» y las citas (Revisar, Idea…) pasaron a la Ficha, con su ícono, en la misma fila que los adjuntos. Q-258: la prueba.

## Ruta
- [x] Elegir qué del chat de Claude entra y cuándo (D-166)
- [x] Ver qué deja hacer el motor: comandos, fotos y archivos (S-5)
- [x] Escribir «/» y elegir un comando (D-167; PA-I1)
- [x] Adjuntar archivos y fotos con el + o arrastrándolos (T-96; PA-I2)
- [x] Pegar una foto en el chat (PA-I2)
- [x] Que un texto largo pegado vaya como archivo (PA-I3)
- [ ] Usar los plugins de Claude Code desde las sesiones (T-28)
- [ ] Usar la PC y el navegador desde las sesiones (T-28)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `05-arquitectura.md` › La interfaz `Motor` | `enviar` con fotos, `capacidades`, `comandos` y su evento; el historial con comandos y fotos | D-165, D-169 | sí |
| `05-arquitectura.md` › Modelo de datos | `escritos.json` con adjuntos, `pegadas/` y `comandosRecientes` | D-169 | sí |
| `02-definicion.md` › Catálogo de casos de uso y Glosario | C-64 a C-67; adjunto, texto pegado y comando | D-165 | sí |
| `05-arquitectura.md` › Spikes | S-5 | D-165 | sí |
| `04-ux.md` › W-12 — La conversación | El + en el pie, la lista de «/», las fichas de los adjuntos y cómo se ven en los mensajes | D-168 | sí |
| `06-ui.md`, `DESIGN.md` y `diseno/piezas.css` | La Ficha (PZ-16), el menú arriba del compositor y el estado de soltar | Q-247, D-170 | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| PA-I1 | Los comandos con «/» | hecha (probada en Q-250) |
| PA-I2 | Archivos y fotos | hecho (probada en Q-251) |
| PA-I3 | El texto largo pegado | hecha (espera Q-258) |

## Log de iteraciones
- 2026-11-21 — Definición e investigación. El spike S-5 respondió lo del motor: la lista de comandos sale sin gastar, un comando es un mensaje que empieza con «/», la foto viaja dentro del mensaje y queda en el historial, el archivo como su ruta. `definicion.md` con los cuatro pedidos como Must; qué comandos esconder (Q-243) y el visto bueno (Q-244) quedan para el usuario.
- 2026-11-21 — Q-243 y Q-244 respondidas: la lista de «/» esconde los que pisan a Iridium y los de la terminal, y la definición queda aprobada (D-167).
- 2026-11-21 — UX escrita: la lista de «/» arriba del compositor, el + primero en el pie, las fichas arriba del cuadro (miniatura para las fotos), el texto pegado desde 40 líneas o 2.000 caracteres, el visor y cómo quedan en los mensajes mandados. Cuatro maquetas (`diseno/pantallas/paridad-*.html`); `piezas.js` acepta un compositor propio en una maqueta. Q-246 y Q-247.
- 2026-11-21 — Q-246 y Q-247 respondidas: la UX aprobada como está, y un comando escondido escrito a mano no se manda (D-168).
- 2026-11-21 — Diseño técnico (D-169): `capacidades`, `comandos` y `enviar` con fotos en la frontera; las marcas `iridium-*` para el texto pegado y los archivos; el historial traduce los comandos y su respuesta (visto en un historial real); `escritos.json` 2 y `pegadas/`; las fotos se achican con `nativeImage`. Tres iteraciones, PA-I1 a PA-I3.
- 2026-11-21 — Paso 6 (D-170): la Ficha (PZ-16) en las dos hojas de piezas, el menú arriba del compositor en PZ-8 y el estado de soltar en la conversación, con la maqueta `paridad-soltar.html`; las maquetas de Paridad, sin estilos propios. Capturas de las cinco revisadas; pruebas, lint y control en verde.
- 2026-11-21 — La tanda de la ronda de UX hecha (T-101 a T-110, en `trabajo.md`), con su prueba en Q-248: la construcción queda libre.
- 2026-11-21 — PA-I1 construida. La frontera dice qué sabe hacer (`capacidades`), da la lista sin gastar (`comandos`, con el real: 86 en 2 s, los escondidos de D-167) y avisa `commands_changed`; la app la recuerda 10 minutos por carpeta y guarda los cinco usados hace poco. La ventana: la lista arriba del compositor (filtro por nombre, otro nombre y después de los dos puntos de un complemento; flechas, Enter, Tab, Esc), la línea de un escondido con Nueva cuando corresponde, el + con Comandos y el comando mandado en la letra de los códigos. Un comando va primero, con lo citado después, y sin el aviso de «te detuve», que queda para el próximo mensaje (la prueba encontró que se perdía al terminar el turno del comando: arreglado). Al reabrir, el comando vuelve a ser «/nombre lo escrito» y su respuesta, que Claude Code guarda en una línea que el SDK no devuelve, se lee del `.jsonl`. El motor falso tiene comandos (y `IRIDIUM_FALSO_COMANDOS=no`). Vitest (20 nuevas) y Playwright (4 nuevas) en verde. Q-250: la prueba.
- 2026-11-21 — Q-250 respondida: PA-I1 probada, todo bien.
- 2026-11-22 — PA-I2 construida. La frontera manda las fotos antes del texto (`enviar(texto, fotos)`; sin fotos, el texto como siempre) y al leer el historial devuelve las fotos y deja las marcas `iridium-*`. Las reglas (`compartido/adjuntos.ts`): las marcas ida y vuelta (con un comando, después de él), el umbral del pegado y hasta 20. Las fotos (`infra/fotos.ts`): el tipo y el tamaño por el contenido, achicar con `nativeImage` lo que pasa los límites (a JPEG si pesa), la GIF o WebP grande no va; las pegadas en `pegadas/` y su limpieza al abrir; la miniatura y la foto grande por el puente. `escritos.json` 2 con los adjuntos (la 1 se lee igual). La ventana: el + con «Agregar archivos o fotos» (`Ctrl+U`) y Comandos, pegar, arrastrar con el borde de soltar, las fichas (PZ-16) con su ✕, el visor, las fichas en el mensaje mandado (el archivo se abre en Archivos si es del proyecto; afuera, con Windows, y un programa solo se muestra en su carpeta), la línea de los que no entraron, la de un comando de Claude Code con adjuntos (no se manda) y la de una foto pegada en un motor sin fotos. Una foto que no se puede leer va como archivo. El motor falso dice qué vio e `IRIDIUM_FALSO_FOTOS=no`. Prueba real (`tools/probar-fotos.ts`, Haiku): la IA vio la foto y leyó el archivo por su ruta, y la conversación guardada devolvió las dos. Vitest (21 nuevas) y Playwright (5 nuevas) en verde. Quedan para PA-I3: la ficha del texto pegado y pasar las citas y «Sobre la skill» a la Ficha (`ux.md` › Piezas). Sin probar con el real: un comando de una skill con una foto (D-169 › 7). Q-251: la prueba.

- 2026-11-22 — Q-251: las siete casillas bien. Pediste cambiar el ícono de adjuntar por un clip: «Agregar archivos o fotos» del + lleva ahora un clip (`ui/Icono.tsx` › clip); las fichas de archivo siguen con la hoja.
- 2026-11-22 — PA-I3 construida. Pegar un texto largo (`esPegadoLargo`) lo deja como ficha en vez de en el cuadro; la ficha dice sus líneas (`textoLineas`: «1 línea», «340 líneas»), se abre en el visor de texto y tiene su ✕. `Ctrl+Z` mientras no se escribió otra cosa la saca y pone el texto donde estaba el cursor (o lo elegido). La marca `iridium-pegado` ya iba y volvía desde PA-I2: el mensaje mandado y el reabierto muestran la ficha. «Sobre la skill» y las citas son ahora la Ficha (PZ-16, `FichaCita`), con ícono por lo que citan, en la fila de las fichas; se fueron sus estilos propios de `skills.css` (el de la fila no se aplicaba: tenía mal el nombre). PZ-16 suma la ficha que se abre con un clic (`.abrir-ficha` fuera de la foto) y el nombre cortado. Vitest (1 nueva) y Playwright (`pa3-pegado.spec.ts`, 2 nuevas) en verde. Q-258: la prueba.

## Próximo paso
Con Q-258 respondida, cerrar la construcción de Paridad (PA-I1 a PA-I3) y pasar al paso 8, la calidad del frente (`referencias/08-calidad.md` del framework). Los dos puntos de la Ruta que quedan (los plugins y la PC y el navegador desde las sesiones, T-28) no son de estas tres iteraciones: proponer si van como PA-I4 o quedan para después.
**Leer antes:** `definicion.md` (qué entra) y este archivo.
