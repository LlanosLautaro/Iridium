# Estado del módulo: Diseño

**Tipo:** sección (un «Claude Design» local dentro de Iridium; D-102)
**Última actualización:** 2026-11-08
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
| 7. Construcción | en curso (DI-I1 hecha y DI-I2 con su primera tanda: las dos esperan la prueba, Q-152; D-107) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente activado el 2026-11-07 (D-102), adelante de Capacidades y del paso 8 de Orden. La dirección es **negro sin acento**, único tema (D-103, D-104). Las pantallas son **maquetas HTML** que escribe la IA en `docs/diseno/`, se miran vivas en Iridium, se comentan con `F8` y lo aprobado se pasa al código (D-105). Pasos 1 a 5 hechos: el orden es la sección (DI-I1), el rediseño de Iridium en maquetas (DI-I2), pasarlo al código (DI-I3) y Otra versión y Probar una dirección (DI-I4) (D-106). **DI-I1 está construida y probada** (el formato en el framework con su control, la sección con Pantallas, la grande, Sistema, `F8` y Pedírselo a la IA). Desde D-107 se prueba sobre las maquetas de Iridium: **DI-I2 empezó** y su primera tanda (el sistema, las 12 piezas y 16 pantallas en `docs/diseno/`) se recorre en la sección con Q-152.

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
| DI-I1 | El formato `docs/diseno/` (con su lector y su control) y la sección Diseño: Pantallas con las maquetas vivas, Sistema y `F8` sobre una maqueta | en curso |
| DI-I2 | El rediseño de Iridium en maquetas: tokens en negro, las 12 piezas y sus pantallas, revisadas en la sección | en curso |
| DI-I3 | Pasar al código: las piezas en `src/renderer/ui/`, las secciones pasadas a ellas, el negro como único tema y la app de antes y de ahora lado a lado | pendiente |
| DI-I4 | Otra versión de una pantalla y Probar una dirección, lado a lado, y quedarse con una | pendiente |

El orden es el de Q-151 (D-106). El detalle de cada una, en `diseno-tecnico.md` › Iteraciones.

## Log de iteraciones
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
Procesar Q-152: corregir en las maquetas lo que comente el usuario (sus `R-n` de la Revisión dicen qué maqueta) y, si la sección anda, cerrar DI-I1. Después, la tanda 2 de DI-I2 (`docs/diseno/README.md` › Falta) y medir la carga con todas.
**Leer antes:** `respuestas/Q-152.md`, los `R-n` nuevos de la Revisión, este archivo › Log › DI-I2 y `ux.md` › Parte 1.
