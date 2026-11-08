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
| 7. Construcción | en curso (DI-I1 hecha, espera la prueba: Q-152) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente activado el 2026-11-07 (D-102), adelante de Capacidades y del paso 8 de Orden. La dirección es **negro sin acento**, único tema (D-103, D-104). Las pantallas son **maquetas HTML** que escribe la IA en `docs/diseno/`, se miran vivas en Iridium, se comentan con `F8` y lo aprobado se pasa al código (D-105). Pasos 1 a 5 hechos: el orden es la sección (DI-I1), el rediseño de Iridium en maquetas (DI-I2), pasarlo al código (DI-I3) y Otra versión y Probar una dirección (DI-I4) (D-106). **DI-I1 está construida y probada** (el formato en el framework con su control, la sección con Pantallas, la grande, Sistema, `F8` y Pedírselo a la IA); espera la prueba del usuario (Q-152).

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
| DI-I2 | El rediseño de Iridium en maquetas: tokens en negro, las 12 piezas y sus pantallas, revisadas en la sección | pendiente |
| DI-I3 | Pasar al código: las piezas en `src/renderer/ui/`, las secciones pasadas a ellas, el negro como único tema y la app de antes y de ahora lado a lado | pendiente |
| DI-I4 | Otra versión de una pantalla y Probar una dirección, lado a lado, y quedarse con una | pendiente |

El orden es el de Q-151 (D-106). El detalle de cada una, en `diseno-tecnico.md` › Iteraciones.

## Log de iteraciones
### DI-I1 — 2026-11-08 — construida, espera la prueba (Q-152)
- **S-4 completo:** un enlace entre maquetas pasa de pantalla dentro del `webview`, `did-navigate` avisa y la extensión vuelve a entrar (con el modo comentar prendido el clic es para comentar, como en cualquier app).
- **El formato en el framework** (D-086): `SKILL.md` › Las maquetas, `referencias/06-ui.md` › Maquetas (en una app nueva las maquetas son la UI del hito 6) y `plantillas/diseno/README.md`. Lector en `core/diseno/` (índice, tokens agrupados, referencias de cada maqueta, el pedido) y la regla `diseno` del control con sus siete puntos.
- **La sección:** Diseño en la barra de los proyectos con framework, después de Revisión. Pantallas: el lienzo por sección con las miniaturas vivas (`iframe` aislado por `maqueta://`, cargan al verse), la rota con su motivo, el redibujo solo con el punto hasta mirarla (`diseno.json`), chicas o grandes, las flechas del teclado; «N comentarios» lleva a la Revisión. La grande: `webview` sin preload ni Node y solo dentro de `docs/diseno/`, los enlaces con la cabecera que los sigue, las flechas y Esc (también desde adentro; comentando, el primer Esc es de la extensión). Sistema: colores, letra, tamaños, espacios y esquinas, sombras y las piezas vivas; Abrir tokens. Sin `docs/diseno/`: el recuadro y Pedírselo a la IA con el cuadro que avisa que gasta uso.
- **F8 sobre una maqueta:** el comentario va siempre al proyecto de la maqueta (su dirección `file://` lo dice) con el campo **Maqueta**; la tarjeta de la extensión lo sabe mirando la maqueta grande con el foco (sin cambiar la extensión). El mensaje a la IA pide corregirla en la maqueta; en Revisión el enlace abre la maqueta grande o dice que ya no está.
- **Que nada salga a la red:** las miniaturas con la política de contenido sin `connect-src`; la grande, cancelando todo pedido del `webview` que no sea su `docs/diseno/` o la extensión. Probado con un servidor local que no recibe nada.
- **Pruebas:** `tests/di1-diseno.test.ts` y `tests/di1-revision-maqueta.test.ts` (Vitest); `tests/e2e/di1-diseno.spec.ts` y `tests/e2e/di1-f8-maqueta.spec.ts` (la app abierta). Capturas en `test-results/di1-*.png`.
- **Queda para después:** medir con las 30 maquetas de Iridium que la primera fila aparezca en menos de un segundo (`diseno-tecnico.md` › Riesgos) va con DI-I2, cuando existan.

## Próximo paso
Procesar Q-152 (la prueba de DI-I1): si anda, cerrar DI-I1 y empezar DI-I2, el rediseño de Iridium en maquetas (`docs/diseno/` de este repo con `negro.css` como tokens, las 12 piezas y las pantallas del inventario), midiendo de paso la carga con las 30 maquetas.
**Leer antes:** `respuestas/Q-152.md`, este archivo › Log de iteraciones › DI-I1, `diseno-tecnico.md` › Iteraciones y `ux.md` › Parte 1 (las piezas y cómo queda cada pantalla).
