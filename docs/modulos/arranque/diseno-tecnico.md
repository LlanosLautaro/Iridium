# Diseño técnico del módulo: Arranque

**Fecha:** 2026-11-18
**Estado:** cerrado (las decisiones, en D-149)
**Base:** `definicion.md` (D-146), `ux.md` (D-147), D-135; el código de hoy: el uso (`src/main/core/uso.ts`, `src/main/app/uso.ts`), la Bandeja de cada proyecto (`src/main/app/pendientes.ts`), las sesiones (`src/main/core/sesiones.ts`, `src/main/app/conversacion.ts`, `src/main/infra/sesiones.ts`) y el rato sin usar Iridium (`src/main/core/uso-iridium.ts`, T-67).

## Las decisiones de este paso
1. **Un solo temporizador, recalculado.** Iridium calcula el próximo momento (la hora elegida o 5 minutos después de que venza el período, el que llegue antes) y espera hasta ahí. Lo recalcula al prender o cambiar el ajuste, cada vez que cambia el uso (cambia cuándo vence el período) y al despertar la PC. No mira cada minuto.
2. **La suspensión se ve con el aviso de Windows** (`powerMonitor`, «se suspendió» y «volvió»): si un momento cayó mientras la PC dormía, se hace al despertar, una vez. Un momento que pasó con Iridium cerrada no se hace (D-146: «no lo hace tarde»), salvo el reinicio de Actualizar solo (D-122), que dura unos minutos: si un momento cayó en ese hueco, se hace al volver a abrir.
3. **Antes de decidir, el uso se lee de nuevo** (`motor.uso()`, sin gastar). «Período abierto» es que la ventana de 5 horas tiene un vencimiento futuro; «semana al 90 %» es `semana.usado ≥ 90`. Si no se puede leer, no arranca.
4. **El trabajo listo sale de la misma lectura que la Bandeja** (`Pendientes.de`): una pregunta con estado `respondida`, que no sea «Más tarde» (la postergada no es trabajo). Cuenta la respuesta más vieja por la fecha de su archivo `respuestas/Q-n.md`. El proyecto tiene que seguir el framework, no estar archivado, no tener una sesión trabajando en Iridium y no haberse usado en VS Code en los últimos 10 minutos (D-027).
5. **Arranca como Nueva** (`Conversaciones.seguir(ruta, { nueva: true })`), con el modelo y el esfuerzo del proyecto y «Continúa con el proyecto.»: lo mismo que el botón, así que el control, la ficha y la pestaña funcionan igual. Antes mira que haya sesión de Claude (`motorListo`): sin ella, no arranca y lo anota.
6. **Lo que pasó va a `arranques.json`**, en los datos de Iridium: un renglón por momento (cuándo, cuál de los dos, qué pasó, y si arrancó, el proyecto y la conversación), solo de los últimos 7 días. Cómo terminó la sesión no se copia: sale de `sesiones.json` al leer, por la conversación. Además, `vistoHasta`: hasta cuándo ya se mostró en el aviso al volver.
7. **La conversación arrancada se marca en su resumen** (`sesiones.json`, el campo nuevo `arranque`, la hora): de ahí sale la línea de debajo del título («la empezó Iridium a las 3:02 para abrir el período»). No se manda al motor.
8. **El aviso al volver** se dispara con lo mismo que ya marca el uso de Iridium (tomar el foco o tocar el teclado o el mouse en su ventana, T-67). Solo entran los arranques que pasaron con Iridium **sin usar hace 5 minutos o más**: si el usuario estaba delante, lo ve en la pestaña, como cualquier sesión, y no hace falta el «Mientras no estabas». Entran los que arrancaron y los que no pudieron por la semana, la sesión de Claude o el uso sin leer; «no había nada listo» y «el período ya estaba abierto» van solo al detalle del uso (avisarlos cada 5 horas sería ruido).

Descartado: una tarea programada de Windows (D-135: necesita Iridium cerrada y abierta a la vez), mirar cada minuto (gasta sin necesidad y no ve la suspensión mejor que el aviso de Windows) y guardar el resultado de cada sesión en `arranques.json` (dos lugares para lo mismo).

## Los datos
**`config.json`** (Preferencias), un campo nuevo, apagado si falta o está roto:
```
arranque: { prendido: false, hora: "03:00" }
```

**`arranques.json`** (datos de Iridium, se puede rehacer: si falta o está roto, vacío):
```
{ version: 1, vistoHasta: <ms | null>,
  momentos: [ { cuando, momento: "hora" | "vencimiento",
                resultado: "arranco" | "periodo-abierto" | "nada-listo" | "semana" | "sin-uso" | "sin-sesion",
                proyecto?: { ruta, nombre, conversacion, preguntas: ["Q-12", "Q-13"] },
                sinUsarIridium: <segundos> } ] }
```

**`sesiones.json`**: el resumen suma `arranque: <ms> | null` (falta en las de antes).

## Las piezas
**Reglas puras (`src/main/core/arranque.ts`, nuevo):**
- `proximoMomento(ajuste, uso, ahora)` → `{ cuando, momento } | null`: la próxima hora elegida (hoy o mañana, en la hora local) y el vencimiento del período + 5 minutos, el que llegue antes; null apagado.
- `perdidos(desde, hasta, ajuste, usoAntes)`: los momentos que cayeron mientras la PC dormía (se hace uno solo, el último).
- `decidir(uso, candidatos)` → el resultado: `periodo-abierto`, `semana`, `sin-uso`, `nada-listo` o `{ arranca: candidato }`.
- `elegir(candidatos)`: el que tiene la respuesta más vieja; a igual fecha, por nombre.
- `paraElAviso(momentos, vistoHasta)`: los renglones del aviso, con las reglas del punto 8.

**Caso de uso (`src/main/app/arranque.ts`, nuevo):** la clase `Arranque`, con el uso, la lista de proyectos, la Bandeja, las conversaciones, `arranques.json` y el reloj como dependencias (así se prueba con un reloj falso y carpetas temporales). Programa el temporizador, junta los candidatos, decide, arranca y anota. Avisa a la ventana con el evento nuevo `arranque` (`EstadoArranque`: prendido, el próximo momento, lo último que pasó, los de la semana y los renglones pendientes del aviso).

**Disco (`src/main/infra/arranques.ts`, nuevo):** lee y escribe `arranques.json` sin dejarlo a medias, como `sesiones.json`.

**`src/main/index.ts`:** crea `Arranque`, le pasa `powerMonitor` (`suspend` y `resume`) y el «volvió» que ya existe (`uso.marcar`).

**Puente:** el evento `arranque` y dos pedidos: `ajustarArranque({ prendido, hora })` y `arranqueVisto(hasta)` (Listo del aviso).

**La ventana:**
- Ajustes › IA (`marco/ajustes/`): el interruptor y la hora (`type="time"`), con la maqueta `diseno/pantallas/ajustes.html`.
- El detalle del uso (`marco/Uso.tsx`): la línea «Último arranque: …» o por qué no arrancó, con Abrir, y los de la semana al tocarla.
- El aviso al volver (`marco/Avisos.tsx`): la variante que no se va sola, con un renglón por arranque (Abrir en cada uno, la cuenta en ámbar si dejó una pregunta que frena) y Listo; con más de cuatro, «y N más», que abre el detalle del uso. Es un estado de la pieza Aviso: se suma a su ficha en `piezas.css` (por eso el paso 6, UI, se descarta).
- La conversación (`secciones/proyecto/Conversacion.tsx`): la línea de debajo del título con «la empezó Iridium a las 3:02 para abrir el período».

## Probar sin esperar a las 3
- **Vitest:** las reglas con fechas fijas (cambio de día, la hora ya pasada, el vencimiento antes que la hora, la suspensión que cruza un momento); el caso de uso con un reloj falso, carpetas temporales (Alfa con una respuesta de ayer, Beta con una de hoy, Gamma archivado) y el motor falso.
- **Playwright** con el motor falso (`IRIDIUM_MOTOR=falso`) y una variable nueva, `IRIDIUM_ARRANQUE_EN=<segundos>`, que pone el próximo momento a esos segundos de abrir la app (solo para pruebas; se anota en `docs/herramientas-ia.md`).
- **El usuario**, una noche con Iridium abierta, como `Q-n` de prueba al terminar AR-I2.

## Las iteraciones
| ID | Qué se construye | Cómo se prueba |
|---|---|---|
| AR-I1 | El motor del arranque: el ajuste en `config.json` y en Ajustes › IA (AR-1), las reglas, el temporizador con la suspensión, la elección del proyecto, arrancar como Nueva, `arranques.json` y la marca en `sesiones.json` | Vitest de las reglas y del caso de uso; Playwright: prenderlo y que arranque Alfa con el motor falso a los pocos segundos |
| AR-I2 | Contar lo que hizo: la línea de la conversación (AR-2), el detalle del uso con la semana (AR-2, AR-3) y el aviso al volver (AR-4) | Vitest de `paraElAviso`; Playwright con el motor falso y capturas; la prueba de una noche como `Q-n` |

## Riesgos
- **Qué dice el uso sin un período abierto:** se supone que la ventana de 5 horas llega sin vencimiento (o con uno ya pasado). Se confirma en AR-I1 leyendo el uso real a la mañana, antes de usarlo; si llega distinto, la regla de «período abierto» se ajusta en `core/arranque.ts`.
- **Windows no despierta la PC para esto:** si la PC duerme toda la noche, el momento se hace al despertar (D-146). Lo dice la explicación del ajuste («Necesita Iridium abierta»).
- **Actualizar solo reinicia de noche** (D-122): espera a que ninguna IA trabaje, así que no corta un arranque; el hueco del reinicio lo cubre el punto 2.
- **La hora local cambia** (horario de verano, viajar): la próxima hora se calcula con la hora local cada vez, nunca sumando 24 horas.
