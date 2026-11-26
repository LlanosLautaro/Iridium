# Estado del módulo: Frentes

**Tipo:** sección (el Mapa pasa a ser Frentes y el Arranque suma el avance solo; T-112, T-113)
**Última actualización:** 2026-11-25
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (pensada en el chat; Q-262, D-175) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-263, D-176) | `definicion.md` |
| 3. Investigación | descartado (lo del límite y Anthropic ya se revisó en T-70) | — |
| 4. UX | hecho (el motor, D-177; el tablero, D-180, con las maquetas) | `ux.md` |
| 5. Diseño técnico | hecho (D-178) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | hecho (vistas las cinco, la B, Q-266, D-181) | `diseno/pantallas/frentes-b.html` |
| 7. Construcción | hecho (FS-I1 a FS-I3: el tablero, probado en Q-267; el motor, una noche en Q-264) | este archivo |
| 8. Calidad | hecho (la del motor y la del tablero, el 2026-11-23, las dos por el avance solo: ver Calidad) | este archivo |
| 9. Lanzamiento | hecho (entra con Armar, como cada versión) | este archivo |

## En qué estamos ahora
Abierto el 2026-11-22 (D-175), antes de Capacidades, para usar la cuota que queda de la semana. Primero el motor con la fila interna; después las maquetas y el tablero. Definición aprobada (Q-263, D-176). UX (D-177) y diseño técnico (D-178) del motor escritos. **FS-I1 hecha** (2026-11-22): las marcas en la ruta, el Mapa que las muestra, Ajustes › IA › Avance solo y los interruptores por proyecto y por frente. **FS-I2 hecha** (2026-11-22): el motor toma pasos solo y el aviso al volver cuenta qué avanzó; los detalles, en D-179. Se prueba de noche en Q-264, y el paso que la prueba deja tomar es la calidad del motor. **Parte 2:** la UX del tablero (D-180) y dos maquetas para elegir la forma del recorrido, A (columnas Hecho · Ahora · Después) y B (el camino de hoy con el tamaño y «sola»); no convencieron (Q-265) y se dibujaron tres formas nuevas: C (una fila por frente), D (por quién lo hace, con los frentes como filtro) y E (grilla de frentes); vistas las cinco, ganó la B (Q-266, D-181). **FS-I3 hecha** (2026-11-22): el Mapa pasa a ser Frentes, con las tarjetas a la izquierda y el camino del elegido al centro; probada en Q-267 (el robot, que necesita el avance solo prendido, se mira con Q-264). Con R-105, las preguntas de cada frente se responden ahí mismo, como en la Bandeja (se prueba en Q-268). **La calidad del motor, hecha** (2026-11-23, la tomó el avance solo): encontró que sin nada para tomar releía el uso cada minuto, abriendo Claude Code cada vez; arreglado (ver Calidad). **La del tablero, también** (2026-11-23, el avance solo): el robot de la tarjeta prometía pasos que el motor no toma, y un frente de carpeta `nucleo` se pisaba con el Núcleo; arreglados (ver Calidad del tablero). **Frente completo (2026-11-23):** la noche del 23 el avance solo tomó la calidad del motor y la del tablero, las terminó (10 % del período cada una), lo contó al volver y no pasó el tope de la semana; probado en Q-264. El paso 9 es el de siempre: entra con Armar. Queda la rama de los tamaños (T-122), que espera más noches, y la ronda de UX que toca al cerrar un frente (T-123).

## Ruta
- [x] Pensar cómo la IA trabaja sola y cómo se ve qué sigue
- [x] Aprobar qué hace el avance solo y qué muestra el tablero (Q-263)
- [x] Marcar en la ruta de cada frente el tamaño y si la IA sigue sola (FS-I1)
- [x] Apagar el avance solo por proyecto y por frente (FS-I1)
- [x] Elegir en Ajustes cuándo avanza sola (FS-I1)
- [x] Que el Arranque tome pasos solo mientras haya cuota, según su tamaño (T-113, FS-I2, grande)
- [x] Contar al volver lo que hizo sola y lo que te espera (FS-I2, chico)
- [x] Probar el avance solo una noche (T-113, Q-264)
- [x] Medir la calidad del motor
- [x] Dibujar el tablero Frentes: las tarjetas a la izquierda y el mapa de tareas al centro (Q-266)
- [x] Construir el tablero, con las preguntas de cada frente en su lugar (FS-I3)
- [x] Probar el tablero con los frentes de verdad (T-112, Q-267)
  - [ ] Avisar si los tamaños estimados no coinciden con lo gastado, cuando haya varias noches anotadas (T-122, mediano)
- [x] Medir la calidad del tablero
- [x] Que el avance solo revise ideas y frentes, y tome el Núcleo (T-135, T-136, FS-I4)
- [x] Probar la revisión una noche (T-135, T-136, Q-294)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `recursos/plugins/iridium` (framework) › La ruta | el tamaño y `sola` entre los códigos de un paso | D-175 | sí (FS-I1) |
| `05-arquitectura.md` › Modelo de datos | los ajustes y los interruptores (FS-I1); la fila y lo gastado en `arranques.json` (FS-I2) | D-175, D-178 | sí (FS-I1, FS-I2) |
| `04-ux.md` | el Mapa pasa a llamarse Frentes | D-175, D-181 | sí (FS-I3) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| FS-I1 | Las marcas en la ruta, el Mapa que las muestra, los ajustes y los interruptores (FS-1 a FS-3) | hecho |
| FS-I2 | El motor que toma pasos y el aviso al volver (FS-4, FS-5) | hecho (probado una noche en Q-264) |
| FS-I3 | El tablero Frentes con la forma B (FS-6 a FS-8) | hecho (probado en Q-267) |
| FS-I4 | La revisión de ideas y frentes, el Núcleo y los frentes en pausa (D-193) | hecho (probado una noche en Q-294) |

## Log de iteraciones
### FS-I1 — Las marcas, los ajustes y los interruptores (2026-11-22)
- El framework explica el tamaño (`chico`, `mediano`, `grande`) y `sola` entre los códigos de un paso; el lector los lee solo del paréntesis final (una «grande» en el texto sigue siendo texto) y los saca del texto que se muestra; el control avisa una palabra parecida (`chica`, `solo`), dos tamaños o `sola` sin tamaño.
- El Mapa muestra «mediano · sola» al lado de cada paso que viene, y un interruptor «Avanza sola» en la cabecera de cada frente que no está hecho.
- Ajustes › IA › Avance solo, apagado al principio, con sus condiciones (siempre o de una hora a otra, minutos sin usar, % libre del período, % de la semana, tamaños); un número fuera de rango vuelve al anterior. Ajustes › Este proyecto › Avance solo.
- Pruebas: Vitest (lector y control), Playwright `fs1-avance.spec.ts` (el Mapa y Ajustes, con capturas).

### FS-I2 — El motor y el aviso al volver (2026-11-22)
- `core/avance.ts`: lo disponible del período (menos lo que deja libre; nada con una ventana agotada o la semana en su tope), si un tamaño cabe, el horario (también cruzando la medianoche), las condiciones baratas y la fila: la Bandeja, lo chico del frente más viejo, el frente en curso; nada repetido en 12 horas.
- `app/avance.ts` (`AvanceSolo`): mira cada minuto; con todo listo lee el uso, arma la fila, anota en `arranques.json` (momento `avance`, el paso, el uso de antes) y abre la conversación como el Arranque. Al terminar la sesión anota el uso de después y mira si sigue con otro. `app/mapa.ts` › `pasosSolos` saca de cada proyecto sus pasos `sola`.
- La conversación guarda `motivo: "avance"` y dice «la empezó Iridium a las … para avanzar sola»; el aviso «Mientras no estabas» dice «Alfa · avanzó «…» · terminó». El framework (`SKILL.md` › Cómo empezar) dice qué hace la IA con ese mensaje: solo ese paso, la `Q-n` si necesita algo, y las marcas al día al cerrar.
- Los detalles que el diseño no decía, en D-179. `IRIDIUM_AVANCE_SIN_USAR` para las pruebas.
- Pruebas: Vitest `fs2-avance.test.ts` (19: las reglas, los pasos de un proyecto, el motor con reloj falso, el aviso), Playwright `fs2-avance.spec.ts` (toma el paso de Alfa, la conversación y el aviso, con capturas; con el frente apagado no toma nada).

### FS-I3 — El tablero Frentes (2026-11-22)
- Q-266: la B (D-181). La sección se llama Frentes (antes Mapa), mismo ícono y lugar.
- `app/mapa.ts`: cada frente suma sus preguntas abiertas (por la línea `Frente:`, con el nombre de la tabla o la carpeta) y su fecha de `**Última actualización:**`; cada paso, su código (la iteración o el primer `T-n`); el mapa suma `nucleo`, las preguntas sin frente o con uno que no está; las de un frente por empezar van a él.
- `Mapa.tsx`: la columna de tarjetas (pestañas, con las flechas), el que cambió último arriba y el Núcleo debajo; el robot solo si la IA va a tomar algo de ese frente, «apagada» con el frente apagado; al centro, la cabecera con el interruptor, «Te esperan N» y el camino con el código, el tamaño y «sola» al pie. El resaltado del camino es el mismo paso que dice la tarjeta (el primero que la IA puede hacer, camino o rama). Con la sección de menos de 900 px, las tarjetas son una barra arriba con los nombres. `frentes.ts`: lo que sigue, sin la interfaz.
- Pruebas: Vitest `fs3-tablero.test.ts` (4), Playwright `fs3-tablero.spec.ts` (3, con capturas) y las del Mapa pasadas a las tarjetas (`ma2-mapa`, `fs1-avance`, `i8-frentes` y los nombres de la sección en las demás).
- Q-267: probado, salvo el robot (necesita el avance solo prendido; pasa a Q-264). R-105: «Te esperan N» muestra cada pregunta como en la Bandeja (opciones o casillas, nota, Enviar), la más nueva arriba y sin repetir el frente; mientras la Bandeja no se leyó, las filas de antes.

### FS-I4 — La revisión, el Núcleo y lo en pausa (2026-11-25, D-193)
- `core/avance.ts`: la fila suma la revisión de un proyecto (después de la Bandeja, antes de lo chico, como un paso chico) si tiene ideas `nueva` sin evaluar, pasos `[ ]` sin tamaño o `T-n` del Núcleo sin tamaño; lo mediano y lo grande sale de cualquier frente (el en curso primero). Una revisión lleva hasta 10 ideas y 10 trabajos del Núcleo (con los 36 y 16 de este proyecto, era demasiado para algo chico). El mensaje: «Avance solo: revisión. Revisá, sin hacer el trabajo, …» con lo que hay.
- `app/mapa.ts`: `revisionDe` lee lo que hay para revisar (una idea con «Evaluada el AAAA-MM-DD» ya está revisada; un paso con tamaño, también); `pasosSolos` y `revisionDe` no tocan un frente en pausa y sí uno hecho al que le queda algo en la ruta (Apariencia, Compartir, Skills) y suma los `T-n` del Núcleo con `Tamaño: …, sola` («seguí con T-n «…» del Núcleo»).
- `app/avance.ts`: la revisión se anota en `arranques.json` como un paso «Revisar las ideas y los frentes» sin carpeta, y no se repite en el día. El tablero no muestra el robot en un frente en pausa.
- `core/trabajo.ts` y el control: `Tamaño:` en la línea de datos de un `T-n` (`chico`, `mediano, sola`…); el control avisa uno mal escrito y uno con `Frente:` (va en su ruta). El framework explica la revisión, el `Tamaño:` del Núcleo y que solo el usuario pausa un frente.
- Pruebas: Vitest `fs4-revision.test.ts` (11) y `fs2-avance.test.ts` al día.

### Arreglo: las sesiones que fallaban sin uso (2026-11-25, D-194)
- Visto la noche del 2026-11-25: con el período al 95 y 99 %, el avance solo abrió tres pasos chicos que fallaron por el uso agotado; uno, 21 segundos después de la falla anterior (al terminar una sesión mira enseguida, y el uso leído seguía diciendo 99 %, no agotado). Los tres quedaban «tomados» por 12 horas y el aviso decía «falló».
- `core/avance.ts`: lo chico pide más de 10 libre. `app/avance.ts`: `sinUso(ruta, libera)` frena el motor hasta que se libera y marca el renglón `agotado`; la fila no lo cuenta como tomado. `conversacion.ts` avisa en `alTerminar` si el turno se cortó por el uso.
- Encontrado al probar: al abrir Iridium, el registro de conversaciones (`infra/sesiones.ts`) le contestaba vacío a las que se pedían mientras se leía; el aviso al volver podía decir «falló» de una sesión terminada. Ahora esperan la misma lectura.
- R-108: la lista de «Mientras no estabas» se desplaza cuando no entra.
- Pruebas: Vitest `fs2-avance.test.ts` (2 nuevas y el límite de lo chico), `ar2-arranque.test.ts` (1); Playwright `ar2-arranque.spec.ts` (1).

## Calidad del motor (paso 8, 2026-11-23)
La tomó el avance solo. Cubre el motor (FS-1 a FS-5); el tablero (FS-6 a FS-8) tiene su paso aparte.

**Historias.** Cada criterio de FS-1 a FS-5 tiene su prueba: las marcas en la ruta y en Frentes (`fs1-avance`, Vitest del lector y del control), los ajustes y los interruptores (`fs1-avance.spec.ts`), la fila, el horario, lo disponible y el motor con reloj falso (`fs2-avance.test.ts`), y la conversación y el aviso al volver (`fs2-avance.spec.ts`, `ar2-arranque.spec.ts`). Lo que solo se ve con el uso real (que tome de verdad de noche y el robot en la tarjeta) lo prueba el usuario en Q-264.

**Encontrado y arreglado (grave).** Prendido, sin usar Iridium y sin nada para tomar (todo hecho, apagado o tomado hace menos de 12 horas), el motor releía el uso **cada minuto**, y cada lectura abre un proceso de Claude Code y consulta la cuenta: toda una noche, unas 60 por hora. Ahora arma primero la fila con el uso que ya conoce (Iridium lo relee sola cada tanto y cuando se libera una ventana) y solo relee el uso si hay algo para tomar; el uso releído sigue mandando antes de arrancar.

**Casos raros.** `tests/fs2-avance.test.ts` › los casos raros (paso 8) suma ocho: sin nada para tomar no lee el uso (falla sin el arreglo: 5 lecturas en 5 minutos); sin el uso conocido lo lee una vez y arranca; si el uso no se puede leer, no toma ni anota nada y prueba al minuto siguiente; si el uso releído está más gastado de lo que se sabía, lo mediano no arranca; si el usuario vuelve mientras arma la fila, no arranca; tres miradas a la vez abren una sola conversación; si abrir la conversación falla, lo dice el registro, el aviso lo cuenta como «falló» y no insiste con ese paso (sigue con otro); la semana que llega a su tope mientras trabaja frena el siguiente; y con el horario de 23:00 a 7:00, a las 7 no toma otro.

**Menor, queda así.** Si se cierra Iridium mientras trabaja un paso, lo gastado de ese paso queda sin anotar (`despues: null`): para comparar los tamaños (la rama de la ruta) cuenta como desconocido, no como cero.

**Accesibilidad y UI.** Ajustes › IA › Avance solo: el interruptor es un `switch` con nombre, cada campo dice qué es para el lector («Minutos sin usar Iridium», «Desde qué hora»…), las condiciones se apagan juntas con el interruptor y todo se usa con Tab. El aviso al volver es el del Arranque, ya revisado en su paso 8.

**Seguridad (P2).** Nada nuevo sale de la PC: la cuenta y el motor de siempre; los ajustes que llegan de la ventana pasan por su esquema estricto y un `config.json` roto vuelve a «apagado».

**Verificado:** `pnpm test` (1009 pasan), `pnpm typecheck`, `pnpm lint` y Playwright de lo tocado (`fs1-avance`, `fs2-avance`, `ar2-arranque`: 7 pasan).

## Calidad del tablero (paso 8, 2026-11-23)
La tomó el avance solo. Cubre el tablero (FS-6 a FS-8).

**Historias.** FS-6: las tarjetas, su orden, lo que sigue, el robot, «apagada» y las preguntas (`fs3-tablero.spec.ts`), «Por empezar», los archivados y la elegida que se recuerda (`ma2-mapa.spec.ts`), y ahora sí diez frentes, el Núcleo y uno por empezar a 1440×900 sin desplazar (antes la prueba tenía cinco tarjetas y lo decía en un comentario). FS-7: el interruptor, «Te esperan N» para responder ahí, el camino con código, tamaño y «sola» (`fs3-tablero.spec.ts`), lo hecho plegado, la rama y lo descartado tachado (`ma2-mapa.spec.ts`). FS-8: el Núcleo y Empezar este frente (`ma2-mapa.spec.ts`, `fs3-tablero.spec.ts`). Lo que sigue en la tarjeta y las preguntas de cada frente, en `fs3-tablero.test.ts`.

**Encontrado y arreglado.** (1) El robot aparecía con un paso `sola` que el motor no toma: uno sin tamaño o de un tamaño que Ajustes › Avance solo no deja (por ejemplo, solo «chico» y el paso es mediano). Contradecía D-181 › 4 («solo si la IA de verdad va a tomar algo»). Ahora la tarjeta usa la misma regla que el motor (`frentes.ts` › `tieneParaSola`). (2) Un proyecto con un frente en `modulos/nucleo/` (o `hitos/`) tenía dos tarjetas con la misma clave que el Núcleo: tocar una elegía las dos y ese frente no se podía ver. Las claves del Núcleo y de los Hitos llevan ahora «:», que una carpeta no puede tener. (3) `ux.md` › FS-8 decía que el Núcleo tiene interruptor; D-181 › 3 dice que no (el avance solo no toma nada de él): corregido el documento.

**Accesibilidad.** El lector de pantalla solo oía el nombre de cada tarjeta: ahora oye también lo que sigue, cuántas preguntas te esperan y si la IA avanza sola o está apagada; el centro es el panel de la tarjeta elegida. Las flechas, el interruptor con nombre y Tab ya estaban probados. **Menor, queda así:** los títulos «Por empezar» y «Archivados» quedan dentro de la lista de pestañas; el lector los lee, pero no son pestañas.

**Seguridad (P2).** El tablero solo lee los documentos del proyecto y guarda la tarjeta elegida y los interruptores, como el Mapa.

**Verificado:** `pnpm test` (1010 pasan), `pnpm typecheck`, `pnpm lint`, el control (0 avisos) y Playwright de lo tocado (`fs3-tablero`, con la prueba nueva y su captura `fs3-muchos.png`; `ma2-mapa`, `fs1-avance`, `i8-frentes`, `or4-mapa`: 17 pasan).

## Próximo paso
FS-I4 hecha (Q-294, 2026-11-25): la revisión evaluó las ideas, marcó los pasos y después el avance solo tomó pasos de esos frentes y del Núcleo, sin pausar ninguno. Las sesiones en «falló» de esa noche fueron con la 1.1.2, antes de D-194: el arreglo, mirado otra noche en Q-298: ninguna sesión en «falló» por el uso. En operación, con el hito 10. Con varias noches anotadas en `arranques.json`, T-122 (avisar si los tamaños no coinciden con lo gastado). Lo que falle del avance solo o del tablero se anota como `T-n` con `Frente: Frentes`.
**Leer antes:** `modulos/frentes/estado.md` › Calidad del motor; D-179.
