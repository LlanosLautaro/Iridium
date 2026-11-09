# Estado del módulo: Diseño

**Tipo:** sección (un «Claude Design» local dentro de Iridium; D-102)
**Última actualización:** 2026-11-09
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (2026-11-07; Q-147 y Q-148, D-103) | `propuesta.md` |
| 2. Definición | hecho (2026-11-07) | `definicion.md` |
| 3. Investigación | descartado (lo de Claude Design y las skills de Anthropic ya está en la propuesta) | — |
| 4. UX | hecho (2026-11-08; Q-151 → D-106) | `ux.md` |
| 5. Diseño técnico | hecho (2026-11-08; S-4, D-106) | `diseno-tecnico.md` |
| 6. UI | descartado como paso aparte: la sección se arma con las piezas de hoy en DI-I1 y su UI nueva va en las maquetas de DI-I2 (D-105, D-106) | `docs/diseno/` (DI-I2) |
| 7. Construcción | en curso (DI-I1 hecha y probada en Q-152; DI-I2 hecha y aprobada en Q-154 y Q-157; D-107 a D-115; siguen T-61 a T-63 y DI-I3) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente activado el 2026-11-07 (D-102), adelante de Capacidades y del paso 8 de Orden. La dirección es **negro sin acento**, único tema (D-103, D-104). Las pantallas son **maquetas HTML** que escribe la IA en `docs/diseno/`, se miran vivas en Iridium, se comentan con `F8` y lo aprobado se pasa al código (D-105). Pasos 1 a 5 hechos: el orden es la sección (DI-I1), el rediseño de Iridium en maquetas (DI-I2), pasarlo al código (DI-I3) y Otra versión y Probar una dirección (DI-I4) (D-106). **DI-I1 está hecha**: el usuario la probó en Q-152 sobre las maquetas de Iridium (D-107). **DI-I2 sigue**: la dirección de la tanda 1 está aprobada y sus comentarios (R-15 a R-24) están corregidos, con la regla «sin ruido» (D-108); la tanda 2 está aprobada (Q-157) y **DI-I2 queda hecha**. Con Q-159 (D-114) el sistema suma ideas de claude.ai: cada token ya lleva su uso; faltan los estilos de texto, la ficha por pieza y las medidas fijas (T-61 a T-63), antes de DI-I3.

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `estado.md` › Módulos | Diseño en curso; Orden termina con Q-146 y su paso 8 espera el rediseño | D-102 | sí |
| `02-definicion.md` › Módulos previstos | El orden nuevo de los frentes | D-102 | sí |
| `DESIGN.md`, `06-ui.md`, `ui/tokens.css` | La dirección negra sin acento como único tema y las piezas compartidas (con DI-I1) | D-102, D-103, D-104 | no |
| Ajustes › Apariencia (frente Apariencia y ajustes) | Sin el selector de tema; fuera `IRIDIUM_TEMA`, las miniaturas y la corrida en Carbón (con DI-I1) | D-104 | no |
| `docs/README.md` › Códigos | `PZ-n` (piezas) y `DS-n` (la sección Diseño) | — | sí |
| `02-definicion.md` › Glosario | Pieza, Dirección, Pantallas | D-103 | sí |
| El framework | El formato `docs/diseno/` (maquetas), con su lector y su control; `referencias/06-ui.md` dice cómo se arman las maquetas; el campo **Maqueta** del `R-n.md` (con DI-I1) | D-086, D-102, D-105 | sí |
| `05-arquitectura.md` › Spikes y › Puntos de extensión | S-4 y las páginas web dentro de la app (B-5) resueltas | D-106 | sí |
| `05-arquitectura.md` › Modelo de datos | `diseno.json` en los datos del Centro; las maquetas y el campo Maqueta del comentario (DI-I1) | D-105, D-106 | sí |
| `05-arquitectura.md` › Seguridad | Iridium escribe en `docs/diseno/` (DI-I4) | D-105 | no |
| `CLAUDE.md` | La variable `IRIDIUM_AYUDANTE` (con DI-I1) | D-106 | sí |
| `02-definicion.md` › Glosario | «Pantallas» son maquetas; suma «Maqueta» | D-105 | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| DI-I1 | El formato `docs/diseno/` (con su lector y su control) y la sección Diseño: Pantallas con las maquetas vivas, Sistema y `F8` sobre una maqueta | hecho (Q-152, 2026-11-09) |
| DI-I2 | El rediseño de Iridium en maquetas: tokens en negro, las 12 piezas y sus pantallas, revisadas en la sección | hecho (Q-157, 2026-11-09) |
| DI-I3 | Pasar al código: las piezas en `src/renderer/ui/`, las secciones pasadas a ellas, el negro como único tema y la app de antes y de ahora lado a lado | pendiente |
| DI-I4 | Otra versión de una pantalla y Probar una dirección, lado a lado, y quedarse con una | pendiente |

El orden es el de Q-151 (D-106). El detalle de cada una, en `diseno-tecnico.md` › Iteraciones.

## Log de iteraciones
### DI-I2 — 2026-11-09 — Q-157 a Q-159: la tanda 2 aprobada y cada token con su uso
- **Q-157:** todo bien (archivados y Eliminar, el detalle de una skill, Diseño › grande y › Sistema, las conversaciones y los errores, el ancho chico), sin comentarios nuevos. **DI-I2 queda hecha.**
- **Q-159 (A, D-114), la idea 1:** cada token de `tokens.css` en su línea con su uso en un comentario después del `;`. El lector lo lee, Diseño › Sistema lo muestra (debajo de la muestra o a la derecha) y el control avisa de los que no lo tienen, en un solo aviso. Los 55 tokens de Iridium tienen su uso; la muestra de pruebas también. Las ideas 2 a 4, en T-61 a T-63.
- **Q-158 (A, D-115):** `referencias/pasar-al-framework.md` suma el design system guardado en otro lado. Ese proyecto lo pasa su IA: Q-160.
- **De paso:** la curva de movimiento (`--sale`) caía en «Letra» por tener comas (ahora en «Otras»); la maqueta de Sistema mostraba los ámbar en «Espacios y esquinas» y se rearmó desde `tokens.css`; la conversación de las maquetas nombraba Trabajo.
- **Verificado:** `pnpm test` (699 pasan), el control en 0 avisos; capturas de la maqueta de Sistema en el navegador, sin errores (`tools/salida/d114/`).
- **Queda:** medir la carga de las miniaturas con las 23 maquetas (`diseno-tecnico.md` › Riesgos), con DI-I3.

### DI-I2 — 2026-11-09 — Q-156 y la tanda 2
- **Q-156 (A, D-113):** las guías de impeccable, en nuestras palabras y con la atribución, en `referencias/06-ui.md` › Repaso antes de mostrar una maqueta; `SKILL.md` › Las maquetas apunta ahí (T-60 hecho).
- **Las 9 maquetas de la tanda 2:** Proyectos archivados (apagados, con «archivado el…» y Desarchivar en el menú; el interruptor pasa de una a otra), Eliminar un proyecto (el cuadro dice qué va a la papelera y qué se borra para siempre; el botón rojo nombra el proyecto), el detalle de una skill (Resumen · Archivos como pestañas, el aviso «Está dos veces»), Diseño › una maqueta grande (la maqueta viva achicada sin deformarse, Volver, «9 de 23», Comentar que queda apretado) y › Sistema (sale de `tokens.css`, con las piezas vivas), el menú de las conversaciones (vivo en todas las maquetas, desde el reloj), la IA no respondió, Claude sin sesión (sin Continuar; aviso rojo abajo) y un proyecto en ancho chico (1024×720: Nueva queda solo con su ícono). El índice suma el grupo «La conversación». El detalle de una idea ya no va (D-112).
- **El repaso** encontró y se corrigió: los íconos de los errores no salían (la conversación propia se armaba después de ponerlos), las dos vistas del detalle de skill a la vez (`[hidden]` no ganaba a `display: grid`), la maqueta grande estirada y el «Seguí» que quedaba en el marco.
- **Verificado:** el control, 0 avisos; capturas de las nueve en el navegador, sin errores de la página (`tools/salida/tanda2/`).

### DI-I2 — 2026-11-09 — Q-154 y Q-155: la tanda 1 aprobada
- **Q-154:** todo bien (la grande, sin relleno, el marco, las tarjetas, el verde, la Bandeja, Git, Docs, Scripts y el español neutro). La tanda 1 queda aprobada.
- **Q-155 (B, D-112):** Trabajo sale de las maquetas de un proyecto (el Mapa muestra lo que está en curso) e Ideas pasa a ser un bloc de notas libre (`pantallas/ideas.html`).
- **R-46 a R-48:** grises del texto neutros y un poco más claros (los de antes tiraban a morado sobre negro); la letra de los botones llenos, seminegrita.
- **Verificado:** el control, 0 avisos; capturas de Ideas y del Mapa en el navegador.

### DI-I2 — 2026-11-09 — la segunda ronda de comentarios (R-25 a R-45)
- **Sin texto de relleno:** fuera la nota de Skills › Framework, el detalle y la bienvenida de la conversación de Skills, «Se guarda en…» y «Guardar a medias» de la Bandeja (lo escrito ya se guarda solo), la cabecera de Git y el renglón de ayuda de Revisión (ahora una «i» con el texto al pasar el mouse, pieza `.info`). En la app, el texto que había sumado junto a **Comentar** (R-25). La regla quedó en el framework (`referencias/06-ui.md`): era un error que se repetía, no algo del sistema de diseño.
- **El marco:** líneas en la barra de proyectos y en la de secciones (R-26, R-27); Inicio sin la Bandeja de todos (D-111).
- **Verde para lo principal (D-109):** `--principal` verde con letra negra; lo marcado pasa a `--marcado` (blanco).
- **Español neutro (D-110):** «Pídele», «Escribe a la IA…» y «Continuar» en lugar de «Seguí».
- **Pantallas:** Skills con los grupos que dicen «Skills…» y la conversación «Skills»; la Bandeja con preguntas plegables; Docs desplaza todo el ancho y centra el texto; Scripts con ▷ a la izquierda; Git rehecho como el panel de VS Code (con `--git-modificado`, `--git-agregado` y `--git-borrado`).
- **Para después:** Trabajo e Ideas esperan Q-155 (T-59); lo que cambia en la app además de las piezas, en T-58 (DI-I3). Ajustes queda como pantalla de referencia (R-34).
- **Verificado:** el control del framework, 0 avisos; capturas de las maquetas en el navegador; las pruebas de la grande con la app abierta.

### DI-I2 — 2026-11-09 — Q-152 y los comentarios de la tanda 1
- **Q-152:** todo anda y la dirección (negro, sin cajas dentro de cajas, un solo botón blanco) va bien para seguir. DI-I1 queda hecha.
- **Sin ruido (D-108, R-15 a R-21):** fuera la cuenta total junto al título y las rutas de carpeta (Proyectos, Nuevo proyecto, Ideas, Scripts, Trabajo, Revisión, Bandeja de todos), el detalle y la bienvenida de la conversación de Inicio, y de la barra de abajo Claude, las sesiones y la hora. Claude aparece abajo solo cuando falla (`data-claude="sin-sesion"`). Regla nueva en `ux.md` › Reglas.
- **Inicio con una casa (R-22)** en lugar de las tres rayas.
- **Las tarjetas de Proyectos (R-23):** el usuario las sentía claras y que «no cuadraban». Lo que veía: un relleno gris por tarjeta (una pared de bloques), el ícono en otra caja adentro y tres señales distintas arriba a la derecha. Ahora: línea fina sin relleno que se aclara al pasar el mouse, el ícono sin caja, arriba solo la cuenta ámbar, los avisos abajo como señal, el pie sin negritas y sin «Sin estado», los tres puntos al pasar el mouse. Se confirma en Q-154.
- **En la app (R-24 y Q-152):** en la maqueta grande ← y → pasan de maqueta con el foco en Iridium o en la maqueta, también comentando (salvo escribiendo), y el modo comentar sigue prendido en la nueva. **Comentar**, arriba a la derecha, prende `F8` en la maqueta y no en Iridium (lo que se mezclaba en Q-152), y se ve apretado mientras está prendido. Iridium mira en la página si sigue comentando: Esc con la tarjeta del comentario abierta solo la cierra.
- **Verificado:** el control del framework, 0 avisos; `di1-diseno.spec.ts` y `di1-f8-maqueta.spec.ts` pasan con las flechas y el botón (captura `test-results/di1-f8-flechas.png`); capturas de las maquetas en el navegador.

### DI-I2 — 2026-11-08 — tanda 1: el sistema, las piezas y 16 pantallas
- **Por qué ahora (D-107):** el usuario propuso probar DI-I1 con el diseño de Iridium en lugar de un proyecto de prueba; Q-152 prueba las dos cosas.
- **El sistema:** `docs/diseno/tokens.css` sale de `negro.css` ordenado por roles (superficies, líneas, tres grises de texto, lo principal en blanco, ámbar y rojo para las señales, código, letra, tamaños, espacios, esquinas, sombras). El gris más tenue subió a `#7c7c82` para llegar a AA sobre negro. `piezas.css` tiene las 12 piezas con las variantes de `ux.md`; `piezas.html` las muestra.
- **El marco** lo arma `piezas.js` (D-107), con los íconos, los menús (también con clic derecho), los filtros, las pestañas y los plegables.
- **Las pantallas:** Inicio (Proyectos con su menú, Nuevo proyecto, Bandeja de todos, Skills › Framework, Ideas, Ajustes con sus cinco pestañas) y Un proyecto (Bandeja de entrada, Mapa, Trabajo, Revisión y su vacío, Diseño, Docs, Archivos, Git, Scripts). Con las reglas de `ux.md`: sin cajas dentro de cajas, títulos de bloque de un solo estilo, señales como texto y un principal por pantalla.
- **Verificado:** el control del framework, 0 avisos (y marca un color escrito puesto a propósito); capturas de cada maqueta en el navegador, sin errores de la página; y en la app armada (`tools/auditoria-ux.ts`) Diseño muestra las 16 vivas, agrupadas en Inicio y Un proyecto.
- **Dos choques de nombres** salieron en las capturas y se corrigieron: el área del marco y el botón principal compartían `.principal`, y el panel y el texto de la conversación, `.conversacion`. En DI-I3 el control de estilos tiene que mirar que una clase del marco no pise la de una pieza.
- **Queda para la tanda 2:** detalle de una skill, detalle de una idea, archivados, el menú de las conversaciones, Eliminar, el ancho chico, Diseño › una maqueta grande y › Sistema, los errores (la IA no respondió, sin sesión) y lo que se comente en Q-152. La medición de la carga va con las 30.

### DI-I1 — 2026-11-08 — construida, espera la prueba (Q-152)
- **S-4 completo:** un enlace entre maquetas pasa de pantalla dentro del `webview`, `did-navigate` avisa y la extensión vuelve a entrar (con el modo comentar prendido el clic es para comentar, como en cualquier app).
- **El formato en el framework** (D-086): `SKILL.md` › Las maquetas, `referencias/06-ui.md` › Maquetas (en una app nueva las maquetas son la UI del hito 6) y `plantillas/diseno/README.md`. Lector en `core/diseno/` (índice, tokens agrupados, referencias de cada maqueta, el pedido) y la regla `diseno` del control con sus siete puntos.
- **La sección:** Diseño en la barra de los proyectos con framework, después de Revisión. Pantallas: el lienzo por sección con las miniaturas vivas (`iframe` aislado por `maqueta://`, cargan al verse), la rota con su motivo, el redibujo solo con el punto hasta mirarla (`diseno.json`), chicas o grandes, las flechas del teclado; «N comentarios» lleva a la Revisión. La grande: `webview` sin preload ni Node y solo dentro de `docs/diseno/`, los enlaces con la cabecera que los sigue, las flechas y Esc (también desde adentro; comentando, el primer Esc es de la extensión). Sistema: colores, letra, tamaños, espacios y esquinas, sombras y las piezas vivas; Abrir tokens. Sin `docs/diseno/`: el recuadro y Pedírselo a la IA con el cuadro que avisa que gasta uso.
- **F8 sobre una maqueta:** el comentario va siempre al proyecto de la maqueta (su dirección `file://` lo dice) con el campo **Maqueta**; la tarjeta de la extensión lo sabe mirando la maqueta grande con el foco (sin cambiar la extensión). El mensaje a la IA pide corregirla en la maqueta; en Revisión el enlace abre la maqueta grande o dice que ya no está.
- **Que nada salga a la red:** las miniaturas con la política de contenido sin `connect-src`; la grande, cancelando todo pedido del `webview` que no sea su `docs/diseno/` o la extensión. Probado con un servidor local que no recibe nada.
- **Pruebas:** `tests/di1-diseno.test.ts` y `tests/di1-revision-maqueta.test.ts` (Vitest); `tests/e2e/di1-diseno.spec.ts` y `tests/e2e/di1-f8-maqueta.spec.ts` (la app abierta). Capturas en `test-results/di1-*.png`.
- **Queda para después:** medir con las 30 maquetas de Iridium que la primera fila aparezca en menos de un segundo (`diseno-tecnico.md` › Riesgos) va con DI-I2, cuando existan.

## Próximo paso
T-61: los estilos de texto con nombre (título, cuerpo, rótulo, código) en el formato `docs/diseno/`: decidir cómo se escriben, sumarlos al lector, a Diseño › Sistema, al control y al framework en el mismo cambio, y pasar los de Iridium. Después T-62, T-63 y DI-I3 (con T-58).
**Leer antes:** `trabajo.md` › T-61 a T-63, `decisiones.md` › D-114 y `diseno-tecnico.md` › Sistema y › El control.
