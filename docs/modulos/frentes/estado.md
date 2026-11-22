# Estado del módulo: Frentes

**Tipo:** sección (el Mapa pasa a ser Frentes y el Arranque suma el avance solo; T-112, T-113)
**Última actualización:** 2026-11-22
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
| 7. Construcción | en curso (FS-I1 a FS-I3 hechas: el motor y el tablero; falta probarlos, Q-264 y Q-267) | este archivo |
| 8. Calidad | pendiente (la del motor, marcada `sola`; la del tablero, al terminarlo) | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-22 (D-175), antes de Capacidades, para usar la cuota que queda de la semana. Primero el motor con la fila interna; después las maquetas y el tablero. Definición aprobada (Q-263, D-176). UX (D-177) y diseño técnico (D-178) del motor escritos. **FS-I1 hecha** (2026-11-22): las marcas en la ruta, el Mapa que las muestra, Ajustes › IA › Avance solo y los interruptores por proyecto y por frente. **FS-I2 hecha** (2026-11-22): el motor toma pasos solo y el aviso al volver cuenta qué avanzó; los detalles, en D-179. Se prueba de noche en Q-264, y el paso que la prueba deja tomar es la calidad del motor. **Parte 2:** la UX del tablero (D-180) y dos maquetas para elegir la forma del recorrido, A (columnas Hecho · Ahora · Después) y B (el camino de hoy con el tamaño y «sola»); no convencieron (Q-265) y se dibujaron tres formas nuevas: C (una fila por frente), D (por quién lo hace, con los frentes como filtro) y E (grilla de frentes); vistas las cinco, ganó la B (Q-266, D-181). **FS-I3 hecha** (2026-11-22): el Mapa pasa a ser Frentes, con las tarjetas a la izquierda y el camino del elegido al centro; se prueba en Q-267.

## Ruta
- [x] Pensar cómo la IA trabaja sola y cómo se ve qué sigue
- [x] Aprobar qué hace el avance solo y qué muestra el tablero (Q-263)
- [x] Marcar en la ruta de cada frente el tamaño y si la IA sigue sola (FS-I1)
- [x] Apagar el avance solo por proyecto y por frente (FS-I1)
- [x] Elegir en Ajustes cuándo avanza sola (FS-I1)
- [x] Que el Arranque tome pasos solo mientras haya cuota, según su tamaño (T-113, FS-I2, grande)
- [x] Contar al volver lo que hizo sola y lo que te espera (FS-I2, chico)
- [ ] Probar el avance solo una noche (T-113, Q-264)
- [ ] Medir la calidad del motor (mediano, sola)
- [x] Dibujar el tablero Frentes: las tarjetas a la izquierda y el mapa de tareas al centro (Q-266)
- [x] Construir el tablero, con las preguntas de cada frente en su lugar (FS-I3)
- [ ] Probar el tablero con los frentes de verdad (T-112, Q-267)
  - [ ] Avisar si los tamaños estimados no coinciden con lo gastado, cuando haya varias noches anotadas (mediano)
- [ ] Medir la calidad del tablero (mediano)

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
| FS-I2 | El motor que toma pasos y el aviso al volver (FS-4, FS-5) | hecho (se prueba en Q-264) |
| FS-I3 | El tablero Frentes con la forma B (FS-6 a FS-8) | hecho (se prueba en Q-267) |

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

## Próximo paso
Con Q-267, arreglar lo que no se vea bien del tablero; con Q-264, ver qué hizo el motor de noche (`arranques.json`, la conversación) y arreglar lo que falle. Después, medir la calidad del motor y la del tablero (paso 8).
**Leer antes:** `modulos/frentes/ux.md` › Parte 2; D-181; `src/renderer/secciones/proyecto/Mapa.tsx`.
