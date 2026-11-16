# Estado del módulo: Ideas

**Tipo:** sección (las ideas y los enlaces para revisar de cada proyecto; D-127)
**Última actualización:** 2026-11-16
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (la forma C, con estados en color, las ideas de la IA y el inicio igual: D-128) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-178; aprobar es pasar al trabajo, D-129) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros: la IA lee los enlaces con sus herramientas, como hoy; lo de Obsidian ya se usó en las maquetas) | — |
| 4. UX | hecho (aprobada en Q-180) | `ux.md` |
| 5. Diseño técnico | hecho (D-130) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | descartado (las tres piezas nuevas ya están dibujadas en las maquetas aprobadas; pasan a `piezas.css` al construir) | — |
| 7. Construcción | en curso (ID-I1 probada; ID-I2 hecha, espera Q-182; sigue ID-I3) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
La forma C (D-128), aprobar es pasar al trabajo (D-129), la UX aprobada (Q-180) y el diseño técnico cerrado (D-130): cada idea es un `T-n` de `trabajo.md` con el campo `Idea:`, y la nota del usuario va en `docs/ideas/T-n.md`. Construcción en cuatro iteraciones; ID-I1 (Ideas en un proyecto) está hecha y probada (Q-181); ID-I2 (Revisar con la IA y Hablar de esta idea) está hecha y espera la prueba del usuario (Q-182); sigue ID-I3.

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `04-ux.md` › W-10 (Ideas) | Ideas del inicio pasa a ser la lista de ideas sueltas, con la forma de la del proyecto | D-128 | sí (2026-11-16, como nota en W-10) |
| `05-arquitectura.md` › Trabajo (`T-n`) | El campo `Idea:`, las notas en `docs/ideas/` y `sueltas.md` | D-130 | sí (2026-11-16, al cerrar ID-I1) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| ID-I1 | Ideas en un proyecto: el formato en el framework con su lector y su control, la lista con filtros, anotar, abrir, aprobar y rechazar | hecha y probada (Q-181) |
| ID-I2 | Para revisar (enlaces, Revisar con la IA) y Hablar de esta idea | hecha; espera la prueba del usuario (Q-182) |
| ID-I3 | La nota completa: enlaces e imágenes pegados, guardado solo, borrar | pendiente |
| ID-I4 | El inicio: ideas sueltas, Mover a un proyecto; se saca el bloc | pendiente |

## Log de iteraciones
### ID-I2 — Revisar con la IA y Hablar de esta idea (hecha; espera Q-182)
- **2026-11-16:** pegar un enlace y marcarlo revisado ya venían de ID-I1. **Revisar con la IA**, en cada enlace sin revisar (en el renglón y en el clic derecho), manda a la conversación de al lado «Revisá <dirección> (T-n): ¿qué podemos sacar de ahí para <proyecto>?» con la descripción debajo; si la IA trabaja, se suma a lo que hace, como cualquier mensaje; el botón pasa a «Pedido a la IA». El código del enlace va en el pedido para que la IA anote lo que salga con ese `Origen:` y lo pase a `hecho` (el framework ya lo enseña). **Hablar de esta idea**, en la idea abierta (también en las hechas) y en el clic derecho, deja escrito en la conversación «Hablemos de la idea T-n «título»: », sin enviar y con el cursor ahí; si la nota esperaba guardarse, se guarda antes, para que la IA la lea como está. El ícono `comentar` de las maquetas pasa a la app. Las reglas de los dos textos, en `compartido/ideas.ts`, con sus pruebas en `tests/id1-ideas.test.ts`; la prueba de Playwright de ID-I1 suma los dos botones (captura `test-results/id2-revisar.png`).
- **Verificado:** `pnpm test` (760 pasan), `pnpm typecheck`, `pnpm lint`, el control del framework sin avisos y `tests/e2e/id1-ideas-proyecto.spec.ts` (2 de 2).
### ID-I1 — Ideas en un proyecto (hecha y probada)
- **2026-11-16, Q-181:** todo bien: anotar con Enter, pegar un enlace con su descripción y marcarlo revisado, la idea abierta que guarda lo escrito, Aprobar y Rechazar (también con clic derecho), las ideas de la IA con el robot y los filtros con sus cuentas.
- **2026-11-16, parte 1 (el formato):** `Idea:` (`usuario`, `IA`, `enlace`) y `Enlace:` en el lector de `trabajo.md` (una dirección se lee tal cual, con sus `_`); el control marca un `Idea:` desconocido, un enlace sin dirección y una nota de `docs/ideas/` sin su `T-n`, y la regla de los dibujos no mira las notas; el framework (`SKILL.md` › El trabajo y la plantilla) enseña el campo, la nota y Revisar un enlace. Pruebas en `tests/or1-control.test.ts`.
- **2026-11-16, parte 2 (las reglas de la lista):** `core/ideas.ts` y los tipos en `compartido/ideas.ts`: de los `T-n` a la lista (los `nueva` sin `Idea:` como de la IA), los filtros con sus cuentas, leer lo escrito en el campo (idea o enlace), el nombre de un enlace, agregar una idea, cambiar el estado (con «Rechazada por el usuario.» al rechazar sin motivo), el título y sacar una idea, sin tocar el resto del archivo ni sus fines de línea. Pruebas en `tests/id1-ideas.test.ts`.
- **2026-11-16, parte 3 (la escritura y el puente):** `infra/trabajo.ts` escribe `trabajo.md` solo si sigue igual que al leerlo (texto y fecha), si no vuelve a leer, hasta tres veces, y si no puede lo dice; sin cambios, no escribe. `app/ideas.ts` lee las ideas de un proyecto (con cuáles tienen nota), anota (idea con su nota en `docs/ideas/T-n.md`, o enlace con su nombre sacado de la dirección), aprueba, rechaza, vuelve a sin evaluar, marca revisado un enlace, lee la nota y guarda una idea abierta (la primera línea es el título; sin nada debajo, la nota se borra). Cinco canales nuevos en el puente, con lo que llega validado. Las pruebas de disco encontraron que una idea de la IA sin `Idea:`, al aprobarla, dejaba de estar en Ideas: Iridium ahora le agrega `Idea: IA` al cambiarle el estado (como ya le pide el framework a la IA). Pruebas en `tests/id1-escritura.test.ts`.
- **2026-11-16, parte 4 (la pantalla):** Ideas en la barra del proyecto, entre el Mapa y la Revisión (solo en los que siguen el framework). La lista con los filtros y sus cuentas, «Para revisar» arriba e «Ideas» debajo; el campo de arriba (Enter anota, Shift+Enter baja de renglón; queda a la vista al desplazar); la idea abierta en su lugar con su texto (la primera línea es el título; se guarda sola un momento después de escribir; sin título no se cierra); Aprobar y Rechazar abajo y en el clic derecho (el mismo otra vez vuelve a sin evaluar); el robot y el código en las de la IA, que se leen sin escribir en ellas; el tilde de un enlace lo marca revisado. Si algo no se guarda, el Recuadro de error arriba y lo escrito sigue ahí y queda copiado. La Fila que se abre pasó al sistema como PZ-13 (`piezas.css`, en las maquetas y en la app); la Etiqueta de enlace pasa en ID-I3, que es cuando se usa. Las reglas de los filtros y el nombre de un enlace pasaron a `compartido/ideas.ts` para que la pantalla las use. Prueba en `tests/e2e/id1-ideas-proyecto.spec.ts` (con capturas).

## Próximo paso
ID-I3: la nota completa. Pegar una dirección en una idea abierta la vuelve una etiqueta con el nombre y el sitio (la Etiqueta de enlace pasa a `piezas.css`), pegar una imagen la guarda en `docs/ideas/T-n/`, el texto con formato se pega como texto, y Borrar una idea del usuario o un enlace con la confirmación en el lugar (ID-8). Si llega Q-182, se procesa primero.
**Leer antes:** `ux.md` › ID-2 y ID-8; `diseno-tecnico.md` › La nota y Cómo escribe Iridium; cómo pega el bloc (la hoja de `src/renderer/secciones/ideas/Ideas.tsx`, `compartido/notas.ts` y `pegarImagenEnHoja` en `app/notas.ts`), que se reusa en la idea abierta de `IdeasProyecto.tsx`; la Etiqueta de enlace en `docs/diseno/pantallas/ideas-proyecto-c.html`.
