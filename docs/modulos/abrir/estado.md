# Estado del módulo: Abrir

**Tipo:** sección (T-80)
**Última actualización:** 2026-11-19
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (aprobada en Q-208, D-148; pasada adelante en D-153) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-216, D-154) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros: lo que falta saber va al diseño técnico) | — |
| 4. UX | hecho (aprobada en Q-217, D-155) | `ux.md` |
| 5. Diseño técnico | hecho (D-156) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | descartado (el menú, la Señal, el Campo y el Aviso ya existen, D-156) | — |
| 7. Construcción | en curso (AB-I1 hecha, espera la prueba Q-218; sigue AB-I2) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-19, adelante de Diseño (D-153). Definición aprobada (D-154): dos partes, primero **Abrir** (AB-I1) y después la **actualización automática** de las apps de escritorio, sin IA, prendida de entrada y apagable por proyecto (AB-I2). UX aprobada (D-155): el botón es **Ejecutar Alfa**, con lo que hace al pasar el mouse. Diseño técnico cerrado (D-156). AB-I1 construida: la marca en `scripts.md` (lector, control y framework) y **Ejecutar Alfa** en el menú de la tarjeta y en la barra del proyecto, con el aviso de AB-2; espera tu prueba (Q-218). Sigue AB-I2.

## Ruta
- [x] Pensar qué resuelve y por qué va primero
- [x] Definir qué abre cada proyecto y cuándo se pone al día
- [x] Dibujar dónde está Abrir y cómo se ve una app al día
- [x] Decidir cómo se marca en `scripts.md` y cómo lo lee Iridium
- [x] Enseñarle a la IA a marcar lo que abre el proyecto, con su control (AB-I1)
- [ ] Ejecutar el proyecto desde la tarjeta y desde el proyecto (AB-I1, Q-218)
- [ ] Armar solas las apps de escritorio con cambios, cuando están cerradas (AB-I2)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| El framework (`recursos/plugins/iridium`) | La marca de lo que abre el proyecto y de cómo se arma, en `SKILL.md` › Los scripts y en la plantilla, con su lector y su control | D-148, D-156 | sí (2026-11-19, AB-I1) |
| `02-definicion.md` › Glosario | «Lo que abre el proyecto» y «Actualización automática» | D-154 | sí (2026-11-19) |
| `04-ux.md` › W-2 y W-3 | El botón en el menú de la tarjeta y en la barra del proyecto; Ajustes del proyecto suma la actualización automática | D-155 | sí (2026-11-19) |
| `05-arquitectura.md` › Modelo de datos | `armados.json` y `armados/` en los datos de Iridium; `actualizacionApagada` en Preferencias | D-156 | no (AB-I2) |
| Scripts (`core/visor/scripts.ts`) | `**Abrir:**` acepta direcciones `http(s)://` (tipo página) | D-156 | sí (2026-11-19, AB-I1) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| AB-I1 | Abrir: la marca en `scripts.md` (framework, lector y control) y el botón en la tarjeta y en el proyecto | en curso (hecha; espera la prueba Q-218) |
| AB-I2 | Actualización automática: armar solas, sin IA, las apps de escritorio con cambios, cerradas y sin IA trabajando | pendiente |

## Log de iteraciones
### AB-I1 — Ejecutar — 2026-11-19
- **Leer antes:** `diseno-tecnico.md` (todo), `ux.md` › AB-1 y AB-2.
- **Hecho:** `core/visor/scripts.ts` lee `**Marca:**` (sin comillas; `página` con o sin acento) y la saca de la descripción, y `**Abrir:**` acepta una dirección `http(s)://`, que abre el navegador (también desde Scripts). `core/abrir.ts`: qué ejecuta el proyecto y su detalle («Abre la app.» + la descripción, sin Markdown) y si puede armarse. La regla `scripts` del control (`core/control/scripts.ts`): una marca que no se entiende o en una sección sin acción, más de un `ejecutar` o `armar`, el tipo que no va con su acción, una dirección con **Ejecutar:** y `armar` sin un `ejecutar · escritorio`. La tarjeta suma `ejecutar`; **Ejecutar Alfa** en el menú de la tarjeta (debajo de Abrir la carpeta, como dice AB-1) y en la barra del proyecto (abajo, encima de Ajustes), con el detalle al pasar el mouse; `proyecto:ejecutar` y `proyecto:armar-ahora`. AB-2 sin el armado solo: el aviso «Alfa todavía no está armada» con **Armar ahora** (corre su script de armar en una consola a la vista) o «Pedile a la IA del proyecto que la arme». El framework: `SKILL.md` › Los scripts y El control, la plantilla `scripts.md`, `referencias/07-construccion.md` y `pasar-al-framework.md` piden escribir la marca una vez.
- **Arreglado de paso:** los avisos de abajo a la derecha se corren a la izquierda del chat general y del de Skills (solo lo hacían dentro de un proyecto) y ya no tapan su cuadro para escribir.
- **Criterios verificados:** AB-1 (los cuatro) y AB-2 (el primero) con Vitest (`tests/ab1-ejecutar.test.ts`, 11) y Playwright (`tests/e2e/ab1-ejecutar.spec.ts`, 3, con capturas `ab1-menu.png`, `ab1-sin-armar.png`, `ab1-barra.png`); abrir un programa de verdad queda para tu prueba. El segundo criterio de AB-2 (abre al terminar de armarse) es de AB-I2. `pnpm test` (857), `pnpm typecheck`, `pnpm lint` y `pnpm e2e` (141), sin errores; el control sobre este repo, 0 avisos.
- **Prueba:** Q-218.

## Próximo paso
Construir AB-I2: la actualización automática (`armados.json`, el vigía, la Señal, Ajustes del proyecto, la espera de AB-2 y Armar ahora escondido). La prueba de AB-I1 (Q-218) puede llegar mientras tanto.
**Leer antes:** `diseno-tecnico.md` › Las decisiones (3 a 8), Datos y Procesos centrales; `ux.md` › AB-3, AB-4 y Ajustes del proyecto; `src/main/infra/sin-armar.ts` (el armado de Iridium, D-122) y `src/main/infra/actividad.ts` (la actividad de VS Code, como el Arranque).
