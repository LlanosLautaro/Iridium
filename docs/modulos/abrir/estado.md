# Estado del módulo: Abrir

**Tipo:** sección (T-80)
**Última actualización:** 2026-11-20
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
| 7. Construcción | en pausa (AB-I1, AB-I2 y AB-I3 probadas; la otra PC, T-87; en pausa por D-162) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-19, adelante de Diseño (D-153). Definición aprobada (D-154): dos partes, primero **Abrir** (AB-I1) y después la **actualización automática** de las apps de escritorio, sin IA, prendida de entrada y apagable por proyecto (AB-I2). UX aprobada (D-155): el botón es **Ejecutar Alfa**, con lo que hace al pasar el mouse. Diseño técnico cerrado (D-156). AB-I1 construida: la marca en `scripts.md` (lector, control y framework) y **Ejecutar Alfa** en el menú de la tarjeta y en la barra del proyecto, con el aviso de AB-2. La prueba (Q-218) no mostró el botón porque ningún proyecto tenía la marca; cómo marcarlos, Q-219. AB-I2 construida: las apps de escritorio se arman solas, de a una y escondidas, con la Señal en la tarjeta y Ajustes › Este proyecto. Tus proyectos marcados (D-157); las dos, probadas en Q-221. AB-I3 (D-158): la app que se usa instalada se abre y se actualiza sola, con la ruta de su `.exe` empezando por una variable de Windows; probada en Q-222: en esta PC se armó e instaló sola. Falta la otra PC, que no tiene el código: se va a actualizar sola desde sus versiones publicadas (D-160, T-87). **En pausa desde el 2026-11-20 (D-162):** vuelve Diseño, a pedido del usuario; el paso 8 y T-87 siguen al cerrar DI-I3.

## Ruta
- [x] Pensar qué resuelve y por qué va primero
- [x] Definir qué abre cada proyecto y cuándo se pone al día
- [x] Dibujar dónde está Abrir y cómo se ve una app al día
- [x] Decidir cómo se marca en `scripts.md` y cómo lo lee Iridium
- [x] Enseñarle a la IA a marcar lo que abre el proyecto, con su control (AB-I1)
- [x] Ejecutar el proyecto desde la tarjeta y desde el proyecto (AB-I1)
- [x] Armar solas las apps de escritorio con cambios, cuando están cerradas (AB-I2)
- [x] Marcar tus proyectos (D-157)
- [x] Probar Ejecutar y la actualización con una app tuya (Q-221)
  - [ ] Avisar en «Mientras no estabas» las apps que se armaron de noche (T-86)
- [x] Abrir y actualizar sola tu app que se usa instalada (AB-I3)
  - [ ] Ponerla al día también en la otra PC, desde sus versiones publicadas (T-87)
- [ ] Revisar que Ejecutar y la actualización sean confiables

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| El framework (`recursos/plugins/iridium`) | La marca de lo que abre el proyecto y de cómo se arma, en `SKILL.md` › Los scripts y en la plantilla, con su lector y su control | D-148, D-156 | sí (2026-11-19, AB-I1) |
| `02-definicion.md` › Glosario | «Lo que abre el proyecto» y «Actualización automática» | D-154 | sí (2026-11-19) |
| `04-ux.md` › W-2 y W-3 | El botón en el menú de la tarjeta y en la barra del proyecto; Ajustes del proyecto suma la actualización automática | D-155 | sí (2026-11-19) |
| `05-arquitectura.md` › Modelo de datos | `armados.json` y `armados/` en los datos de Iridium; `actualizacionApagada` en Preferencias | D-156 | sí (2026-11-19, AB-I2) |
| Scripts (`core/visor/scripts.ts`) | `**Abrir:**` acepta direcciones `http(s)://` (tipo página) | D-156 | sí (2026-11-19, AB-I1) |
| El framework y Scripts | Una ruta que empieza con una variable de Windows, para la app instalada; el control marca una ruta fija | D-158 | sí (2026-11-19, AB-I3) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| AB-I1 | Abrir: la marca en `scripts.md` (framework, lector y control) y el botón en la tarjeta y en el proyecto | hecho (probada en Q-221) |
| AB-I2 | Actualización automática: armar solas, sin IA, las apps de escritorio con cambios, cerradas y sin IA trabajando | hecho (probada en Q-221) |
| AB-I3 | La app que se usa instalada: abrirla y actualizarla sola, con la ruta de su `.exe` desde una variable de Windows | hecho (probada en Q-222; la otra PC, T-87) |

## Log de iteraciones
### AB-I1 — Ejecutar — 2026-11-19
- **Leer antes:** `diseno-tecnico.md` (todo), `ux.md` › AB-1 y AB-2.
- **Hecho:** `core/visor/scripts.ts` lee `**Marca:**` (sin comillas; `página` con o sin acento) y la saca de la descripción, y `**Abrir:**` acepta una dirección `http(s)://`, que abre el navegador (también desde Scripts). `core/abrir.ts`: qué ejecuta el proyecto y su detalle («Abre la app.» + la descripción, sin Markdown) y si puede armarse. La regla `scripts` del control (`core/control/scripts.ts`): una marca que no se entiende o en una sección sin acción, más de un `ejecutar` o `armar`, el tipo que no va con su acción, una dirección con **Ejecutar:** y `armar` sin un `ejecutar · escritorio`. La tarjeta suma `ejecutar`; **Ejecutar Alfa** en el menú de la tarjeta (debajo de Abrir la carpeta, como dice AB-1) y en la barra del proyecto (abajo, encima de Ajustes), con el detalle al pasar el mouse; `proyecto:ejecutar` y `proyecto:armar-ahora`. AB-2 sin el armado solo: el aviso «Alfa todavía no está armada» con **Armar ahora** (corre su script de armar en una consola a la vista) o «Pedile a la IA del proyecto que la arme». El framework: `SKILL.md` › Los scripts y El control, la plantilla `scripts.md`, `referencias/07-construccion.md` y `pasar-al-framework.md` piden escribir la marca una vez.
- **Arreglado de paso:** los avisos de abajo a la derecha se corren a la izquierda del chat general y del de Skills (solo lo hacían dentro de un proyecto) y ya no tapan su cuadro para escribir.
- **Criterios verificados:** AB-1 (los cuatro) y AB-2 (el primero) con Vitest (`tests/ab1-ejecutar.test.ts`, 11) y Playwright (`tests/e2e/ab1-ejecutar.spec.ts`, 3, con capturas `ab1-menu.png`, `ab1-sin-armar.png`, `ab1-barra.png`); abrir un programa de verdad queda para tu prueba. El segundo criterio de AB-2 (abre al terminar de armarse) es de AB-I2. `pnpm test` (857), `pnpm typecheck`, `pnpm lint` y `pnpm e2e` (141), sin errores; el control sobre este repo, 0 avisos.
- **Prueba:** Q-218 (2026-11-19): no se vio el botón en ningún lado. La causa: ningún proyecto tenía la marca, tampoco este. Marcado «Abrir Iridium» (`ejecutar · escritorio`) y comprobado en la app con los proyectos reales: el menú de su tarjeta muestra «Ejecutar Iridium» debajo de Abrir la carpeta. Cómo se marcan los demás, Q-219: desde acá, una vez (D-157). Marcada la app de escritorio que se arma en su carpeta (control: 0 avisos; el lector da «Ejecutar» con su detalle y que se arma sola); la prueba otra vez, junto con AB-I2, en Q-221: bien.

### AB-I2 — Actualización automática — 2026-11-19
- **Leer antes:** `diseno-tecnico.md` › Las decisiones (3 a 8), Datos y Procesos centrales; `ux.md` › AB-3, AB-4 y Ajustes del proyecto.
- **Hecho:** `core/abrir.ts` suma `porQueNoArma` (la regla de D-156 › 5, cada condición como dato) y `armadoSupuesto` (la primera vez, el `.exe` más nuevo que el último commit cuenta como armado). `infra/armados.ts`: `armados.json` (roto, vacío), el `.exe` trabado (`abiertaAhora`), el último commit y si hay cambios a medias, y el armado escondido y suelto: un `armar.cmd` en `armados/<carpeta>-<hash>/` corre el comando con `call`, escribe `armado.log` y deja la marca de fin; lo abre `Start-Process` con la ventana escondida, así lo que lance comparte esa consola y no aparece ninguna. `app/abrir.ts` › `VigiaArmados`: mira cada minuto (cada 3 segundos mientras arma, solo la marca de fin), al terminar un turno de la IA y cuando cambia la lista de proyectos; arma de a uno, primero lo pedido a mano; cierra el que terminó (`ok` guarda el commit; `falla` no se reintenta con ese commit; `falla` con la app abierta es `ocupada` y se reintenta al cerrarla; sin proceso ni marca, «se cortó»; a los 10 minutos lo corta); la carpeta del código de Iridium queda afuera (D-122). En la ventana: la Señal «Actualizando…» y «No se pudo actualizar» (con el motivo al pasar el mouse) en el pie de la tarjeta; Ejecutar mientras se arma responde `esperando`, avisa «Alfa se está armando: abre en cuanto termine» y la abre al terminar (si falló, la versión anterior); Armar ahora arma escondido y la abre al terminar. **Ajustes del proyecto** es la sección **Este proyecto** de la ventana de Ajustes, primera y solo dentro de un proyecto (el ⚙ de la barra del proyecto abre ahí): el interruptor (en `config.json` › `actualizacionApagada`), la última vez («Actualizada hoy a las 14:02», «Falló… · Ver la consola», «Actualizándose…») y **Actualizar ahora**; sin script de armar, la línea gris. La actualización viaja a la ventana con su propio evento (`actualizacion:cambio`), no dentro de la tarjeta: cambia sin releer los proyectos.
- **Criterios verificados:** AB-2 (el segundo), AB-3 (los cuatro) y AB-4 (los cuatro) con Vitest (`tests/ab2-armados.test.ts`, 16: las reglas, el vigía con un disco de mentira, el `.exe` trabado con un programa que corre y un armado escondido de verdad que termina bien y mal) y Playwright (`tests/e2e/ab2-actualizacion.spec.ts`, 2, con repos git y armados de prueba: las Señales de a una, el interruptor que se recuerda al reabrir y la línea gris; capturas `ab2-actualizando.png`, `ab2-fallo.png`, `ab2-ajustes.png`). Una app de verdad armándose sola queda para tu prueba. `pnpm test` (873), `pnpm typecheck`, `pnpm lint` y `pnpm e2e` (143; `ap1-ajustes` ahora espera que el ⚙ del proyecto abra en Este proyecto), sin errores; el control, 0 avisos.
- **Prueba:** Q-221 (2026-11-19), junto con la de AB-I1, con tu app de escritorio: las seis casillas bien (Ejecutar desde la tarjeta y la barra, «Actualizando…» sin consola, Ajustes › Este proyecto, Ejecutar mientras se arma y el interruptor que se recuerda).

### AB-I3 — La app que se usa instalada — 2026-11-19
- **Leer antes:** D-158; `diseno-tecnico.md` › Las decisiones.
- **Hecho:** `core/visor/scripts.ts` reconoce una ruta que empieza con una variable de Windows (`rutaConVariable`) y una ruta fija (`esRutaFija`); `app/visor.ts` › `rutaDeScript` da la ruta completa (la variable, sin distinguir mayúsculas, o la carpeta del proyecto) y la usan Scripts, Ejecutar y el plan de armado (`app/abrir.ts`), así la actualización vigila el `.exe` instalado. El control avisa una ruta fija en `ejecutar · escritorio`. El framework (`SKILL.md` › Los scripts) dice cómo se marca una app instalada y su `armar` (armar el instalador y correrlo con `/S`). Marcada tu app instalada (en su repo, solo `docs/scripts.md`, con su commit): «Abrir» con la ruta instalada y «Actualizar» que arma el instalador y lo instala sin ventanas; quedaron ocho scripts (los dos que hacían la mitad de eso se sacaron). El lector, con los archivos reales, da el `.exe` instalado de esta PC y el comando.
- **De paso:** **Abrir:** con una variable (la carpeta de una extensión instalada) decía «No se encuentra»; ahora abre.
- **Criterios verificados:** `tests/ab3-instalada.test.ts` (8: la variable, la ruta fija, la ruta completa, el control, el plan de armado con el `.exe` instalado, Ejecutar sin instalar y ya instalada, Abrir con variable). `pnpm test` (881), `pnpm typecheck`, `pnpm lint` y `pnpm e2e` (143) sin errores; el control, 0 avisos aquí y en los dos proyectos marcados. Instalar de verdad queda para tu prueba.
- **Prueba:** Q-222 (2026-11-19): Ejecutar, Abrir la carpeta de la extensión y la versión nueva con los datos y la extensión, bien. «Actualizando…» quedó sin marcar: la versión nueva se publicó y se bajó a mano en la otra PC. En esta PC sí anduvo: el registro de armados dice que Iridium armó el instalador y lo instaló sin ventanas de 19:46 a 19:50, dos minutos después del commit de las 19:44, y Windows tiene instalada esa versión. El instalador tiene siempre el mismo nombre, así que acá no se acumulan copias. Lo que falta es la otra PC, que no tiene el código: T-87, con la decisión en Q-223.
- **Arreglado de paso:** con un comando encadenado (`armar el instalador && correrlo`), `armado.log` guardaba solo la salida del último; ahora el comando va en su propio `comando.cmd` y el log tiene todo (`tests/ab2-armados.test.ts`, que falla sin el arreglo).

## Próximo paso
Cuando vuelva (D-162): el paso 8 (calidad) del frente: AB-I1, AB-I2 y AB-I3 están probadas. T-87 (la otra PC, D-160) queda en la ruta para después de la calidad.
**Leer antes:** `referencias/08-calidad.md` del framework y `ux.md` › AB-1 a AB-4.
