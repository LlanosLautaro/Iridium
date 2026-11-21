# Estado del módulo: Arranque

**Tipo:** sección (el arranque del período de 5 horas; T-70)
**Última actualización:** 2026-11-21
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (D-135; elegido en Q-205) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-206, D-146) | `definicion.md` |
| 3. Investigación | descartado (lo de Anthropic y cómo anda el límite ya se revisó en T-70) | — |
| 4. UX | hecho (aprobada en Q-207 con el aviso al volver, D-147) | `ux.md` |
| 5. Diseño técnico | hecho (D-149) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | descartado (sin piezas nuevas: el aviso fijo es un estado de la pieza Aviso, D-149) | — |
| 7. Construcción | hecho (AR-I1 y AR-I2; la primera noche no arrancó, arreglado; la segunda, probada en Q-227) | este archivo |
| 8. Calidad | hecho (2026-11-21: los casos raros del uso con prueba y el aviso con el teclado y el lector de pantalla; ver Calidad) | este archivo |
| 9. Lanzamiento | hecho (entra con Armar, como cada versión) | este archivo |

## En qué estamos ahora
Abierto el 2026-11-18 (Q-205). Definición (D-146), UX (D-147) y diseño técnico (D-149) cerrados. AR-I1 y AR-I2 hechas el 2026-11-18: arranca solo y cuenta lo que hizo (el aviso al volver, el detalle del uso y la línea de la conversación). La primera noche (Q-210, 2026-11-20) no arrancó: a las 03:00 el período seguía abierto y, al vencer, el momento de 5 minutos después se perdía. Arreglado ese día; la segunda noche anduvo (Q-227, 2026-11-21). **Frente completo (2026-11-21):** la calidad está en la sección Calidad.

## Ruta
- [x] Decidir cómo se arranca el período (con trabajo real, desde Iridium)
- [x] Aprobar qué hace y qué no
- [x] Dibujar el interruptor en Ajustes y dónde se ve lo que hizo
- [x] Decidir cómo se construye (D-149)
- [x] Arrancar el proyecto que espera hace más, a la hora elegida y al vencer el período (AR-I1)
- [x] Contar qué arrancó o por qué no pudo: el aviso al volver, la pestaña y el detalle del uso (AR-I2)
- [x] Arrancar también al vencer el período que estaba abierto a la hora elegida (Q-210)
- [x] Probarlo una noche con Iridium abierta (Q-227)
- [x] Medir su calidad (paso 8)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `05-arquitectura.md` › Modelo de datos | `config.json` suma `arranque`; `sesiones.json`, la marca `arranque`; los datos suman `arranques.json` | D-149 | sí (AR-I1) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| AR-I1 | El motor del arranque: el ajuste, el temporizador con la suspensión, la elección del proyecto, arrancar como Nueva y `arranques.json` | hecho (2026-11-18; la prueba del usuario va con AR-I2) |
| AR-I2 | Contar lo que hizo: la línea de la conversación, el detalle del uso y el aviso al volver | hecho (2026-11-18; la prueba de una noche, en Q-210) |

## Log de iteraciones
### AR-I1 — El motor del arranque (2026-11-18)
- **Ajustes › IA:** «Abrir el período de Claude», apagado al principio, con la hora (3:00 por defecto, en gris apagado) y la explicación de la maqueta. Se guarda solo en `config.json` (`arranque`); un valor roto vuelve a apagado a las 3:00. Va con las demás preferencias (no hizo falta el pedido aparte `ajustarArranque` del diseño).
- **Reglas** (`src/main/core/arranque.ts`): el próximo momento (la hora local de hoy o mañana, o 5 minutos después del vencimiento, el que llegue antes, sin repetir uno hecho), por qué no arranca (sin uso, período abierto, semana en 90 %), el que espera hace más y el momento que cayó en el reinicio de Actualizar solo (menos de 10 minutos).
- **Caso de uso** (`src/main/app/arranque.ts`): un temporizador que espera como mucho 15 minutos de una vez y se recalcula al cambiar el ajuste o el uso, y al despertar la PC (`powerMonitor`); dormida, un momento vencido se hace al despertar, una vez. Al llegar relee el uso, junta los candidatos de la Bandeja de cada proyecto (con framework, sin archivar, sin trabajar ni usado en VS Code hace menos de 10 minutos, respuestas que no son «Más tarde»; la más vieja por la fecha de su archivo), mira la sesión de Claude y abre una Nueva con «Continúa con el proyecto.». Cada momento queda en el registro del día.
- **Datos:** `arranques.json` (7 días, el momento programado y `vistoHasta` para AR-I2). Cambio sobre el diseño: el renglón no copia el id de la conversación; se encuentra por la marca `arranque` de `sesiones.json`, que es la misma hora (el id lo da Claude Code después de abrir). `perdidos` del diseño no hizo falta: con un solo momento programado, el que venció durmiendo es ese.
- **Pruebas:** Vitest `tests/ar1-arranque.test.ts` (18: reglas con fechas fijas, el caso de uso con reloj falso, la suspensión, el reinicio, `arranques.json`, el ajuste y la marca en `sesiones.json`); Playwright `tests/e2e/ar1-arranque.spec.ts` (el ajuste queda al cerrar y abrir; con `IRIDIUM_ARRANQUE_EN=3` y `IRIDIUM_FALSO_PERIODO=cerrado`, arranca Alfa, la respuesta más vieja, y no Beta ni Gamma archivado; la pestaña aparece sola y termina). Variables nuevas en `herramientas-ia.md`.
- **Queda por confirmar** (riesgo del diseño): qué informa el uso real sin un período abierto. Se supone sin vencimiento o con uno pasado; se ve en la prueba de una noche (AR-I2), con lo que anota el registro.

### AR-I2 — Contar lo que hizo (2026-11-18)
- **La conversación arrancada (AR-2):** debajo del título, «Hoy a las 03:40 · la empezó Iridium a las 03:02 para abrir el período», en lugar de «empezada en VS Code». Sale de la marca `arranque` de `sesiones.json` al abrirla, y al arrancar llega con el cambio de la conversación (`arrancada`). Una Nueva del usuario no la lleva.
- **El detalle del uso (AR-2, AR-3):** con el arranque prendido, debajo de la ventana de 5 horas, lo último que pasó («Último arranque: Alfa, hoy a las 03:02 · dejó 1 pregunta» con Abrir, o «Hoy a las 03:00 no había respuestas tuyas esperando»); sin nada todavía, «Arranque prendido: el próximo, hoy a las 03:00». Cambio sobre la UX: los de la semana se despliegan con un botón aparte («Los 6 anteriores de la semana») en vez de tocar la línea, que ya tiene Abrir.
- **El aviso al volver (AR-4):** «Mientras no estabas», abajo a la derecha, con un renglón por arranque (el proyecto, la hora, qué dejó con la cuenta en ámbar si frena, y Abrir) y los que no pudieron; no se va solo; los cuatro últimos y «y N más», que abre el detalle del uso; Listo guarda `vistoHasta` y no vuelve. Cambio sobre el diseño: no espera al primer foco, aparece en cuanto pasa (solo entran los arranques con Iridium sin usar hace 5 minutos o más, así que el usuario no estaba): el efecto es el mismo y no hace falta otra señal. Sus estilos van con los del aviso flotante en `uso.css`: el aviso de W-4 no es una pieza de `piezas.css`, así que no cambia ninguna ficha.
- **Reglas y caso de uso:** `paraElAviso` (`core/arranque.ts`); `Arranque.estado()` arma lo que va a la ventana (la semana y el aviso, con cómo va cada conversación según `sesiones.json` y la Bandeja), `visto()` y el evento `arranque:cambio` al hacer un momento, al cambiar el próximo, con Listo y cuando termina la conversación de un arranque.
- **Pruebas:** Vitest `tests/ar2-arranque.test.ts` (6: qué entra al aviso, la semana, cómo va cada conversación, Listo que queda, el aviso a la ventana y la marca de la conversación); Playwright `tests/e2e/ar2-arranque.spec.ts` (el aviso con lo de la noche escrito antes de abrir, que no se va solo, «y 1 más», el detalle con la semana, Abrir, Listo que no vuelve al reabrir; y con el usuario delante, sin aviso, con la línea de la conversación y el último arranque en el uso). Capturas: `test-results/ar2-aviso.png`, `ar2-detalle-uso.png`, `ar2-conversacion.png`.
- **Queda:** la línea de la conversación se corta en la cabecera angosta (como «empezada en VS Code»); entera al pasar el mouse.

### Arreglo tras Q-210 (2026-11-20)
- **Qué pasó:** el usuario dejó Iridium abierta con respuestas sin procesar y no arrancó nada. El registro dice `03:00:01 Arranque (hora): periodo-abierto`: había usado Claude hasta pasadas las 2, así que el período seguía abierto. Eso está bien (D-146); lo que falló fue lo siguiente: el arranque programó «5 minutos después del vencimiento», pero el uso se relee justo al liberarse la ventana y el período cerrado ya no trae vencimiento, así que el próximo momento volvió a ser la hora elegida del día siguiente. La PC no se suspendió (el registro de Windows no tiene suspensiones esa noche). Una sola respuesta sí alcanza para arrancar.
- **Arreglo:** el arranque recuerda el último vencimiento que vio y lo usa mientras el uso no traiga otro. Además, después de cada momento el registro del día anota el próximo («Arranque: el próximo, … (vencimiento)»), para ver en la próxima noche qué programó.
- **Pruebas:** Vitest `tests/ar1-arranque.test.ts` suma «con el período abierto a la hora elegida, arranca al vencer aunque el uso releído ya no lo traiga» (falla sin el arreglo: quedaba para el día siguiente a las 03:00). Vitest (902), typecheck y lint en verde.

### Q-227 — la segunda noche (2026-11-21)
- **Q-227:** todo bien: el aviso «Mientras no estabas», Abrir y Listo, la línea de la conversación, «Último arranque» en el uso y el aviso que no vuelve.
- **El registro** (`arranques.json`) lo confirma: a la hora elegida el período estaba abierto y arrancó 5 minutos después del vencimiento, con el proyecto que esperaba. El paso 7 queda hecho.

## Calidad (paso 8, 2026-11-21)
**Historias.** Cada criterio de la definición tiene su prueba: los dos momentos, el que espera hace más, Nueva con «Continúa con el proyecto.», el tope de la semana, la PC dormida, lo que cuenta (el aviso al volver, el detalle del uso y la línea de la conversación) y apagado sin nada programado. Lo que solo se ve con el uso real (qué informa el uso sin un período abierto y que arranque de verdad de noche) lo probó el usuario en Q-210 y Q-227.

**Casos raros.** `tests/ar1-arranque.test.ts` › los casos raros (paso 8) suma cinco: sin período (el uso sin ventana de 5 horas o con un vencimiento pasado) arranca a la hora; si no pudo, no reintenta en bucle (un solo intento y el próximo es el del día siguiente); dormida a la hora y al vencimiento, al despertar uno solo, aunque el aviso de despertar llegue dos veces; al despertar con un período que abrió el usuario en otro lado, no arranca; y una suspensión que Windows no avisó se nota en 15 minutos como mucho. Todos pasaron sin cambiar el motor.

**Accesibilidad y UI.** El aviso «Mientras no estabas» es una región de estado con nombre (el lector lo anuncia sin interrumpir) y no se va solo. **Encontrado y arreglado:** sus botones Abrir se llamaban todos igual para el lector de pantalla; ahora dicen de qué proyecto son («Abrir Alfa»). Con Tab se llega a Abrir de cada renglón y a Listo, con el foco a la vista; todo su texto pasa el contraste AA, también el rojo de «falló» y el ámbar. Cosmético, arreglado: en un renglón que no arrancó la hora no usaba la letra de las demás. Lo comprueba `tests/e2e/ar2-arranque.spec.ts` › el aviso al volver se usa con el teclado (captura `test-results/ar-calidad-aviso.png`).

**Seguridad (P2).** Nada nuevo sale de la PC: usa la cuenta y el motor de siempre; desde la ventana solo llega una hora válida (`HH:MM`) y `arranques.json` roto se lee vacío.

**Verificado:** `pnpm test` (915 pasan), `pnpm typecheck`, `pnpm lint` y `pnpm e2e` entero (146 pasan).

## Próximo paso
Frente completo. Lo que salga del uso va a `trabajo.md` con `Frente: Arranque`.
