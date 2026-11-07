# Estado del módulo: Orden

**Tipo:** sección (atraviesa la app y la forma de trabajar; D-091)
**Última actualización:** 2026-11-06
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (el usuario abrió la operación en el chat, 2026-11-05) | `propuesta.md` |
| 2. Definición | hecho (2026-11-06; Q-133 a Q-135 → D-094 a D-096) | `definicion.md` |
| 3. Investigación | hecho (2026-11-05): la UX y la forma de trabajo, A-1 a A-23 | `auditoria.md` |
| 4. UX | hecho (2026-11-06; Q-136 a Q-139 → D-097 a D-099): `04-ux.md` reescrito sin capas | `ux.md` (historia) y `04-ux.md` |
| 5. Diseño técnico | hecho (2026-11-06): el control, `trabajo.md`, el vocabulario, los frentes del Mapa, Actualizar y cuatro iteraciones | `diseno-tecnico.md` |
| 6. UI | hecho (2026-11-06; Q-140 → D-100) | `06-ui.md` › Frente Orden y `ui/vista-orden.html` |
| 7. Construcción | en curso (2026-11-06): OR-I1 espera la prueba (Q-141); sigue OR-I2 | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente abierto el 2026-11-05 con prioridad máxima (D-091): las funciones nuevas esperan. Hechas la auditoría (A-1 a A-23), la definición (D-094 a D-096) y la UX: `04-ux.md` está reescrito entero, sin capas, con las pantallas aprobadas en Q-139 (W-1 a W-17) y el nombre «framework» en lugar de «marco» (D-099). El diseño técnico está escrito (`diseno-tecnico.md`): el control corre al terminar cada turno con los lectores de la pantalla y le devuelve a la IA lo mal escrito una vez por turno; `trabajo.md` se anota desde Iridium sin pisar a la sesión; un vocabulario de estados con una tabla de transición para los proyectos con framework viejo; Actualizar junta Armar y Reiniciar. Cuatro iteraciones, por riesgo: OR-I1 el modelo y el control, OR-I2 el esqueleto y la Bandeja (con Actualizar), OR-I3 Trabajo e Ideas, OR-I4 Mapa, Skills › Framework y Pasar al framework. R-13 (los dibujos en texto desalineados) se arregló con la letra completa. El paso 6 cerró con Q-140 (D-100: el ámbar solo para lo que frena, el botón principal claro). OR-I1 está hecha y espera tu prueba (Q-141): las reglas, la devolución, los avisos en la tarjeta, el Mapa con el vocabulario y el framework reordenado andan, e Iridium ya pasó al framework (el control da cero). Lo que queda del frente está en `trabajo.md` (T-46 a T-49).

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `02-definicion.md` › Módulos previstos | Orden, activo y primero; Diseño y Capacidades detrás | D-091 | sí |
| `10-operacion.md` › Backlog | Orden en los frentes; los `R-n` nuevos esperan la ronda de UX | D-091 | sí |
| `04-ux.md` | Reescrito sin capas | D-091, D-097 a D-099 | sí |
| `05-arquitectura.md` | Trabajo en el modelo de datos, `anchoConversacion` y el control al terminar un turno | D-092, D-094, D-098 | sí |
| `02-definicion.md` › Glosario | «Framework» en lugar de «Marco» | D-099 | sí |
| La skill de Iridium y la guía de hitos | Un solo framework, con control | D-092 | sí (OR-I1, 2026-11-06; borrar las skills viejas va en el chat de Skills) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| OR-I1 | El modelo y el control | en curso (hecha; espera Q-141) |
| OR-I2 | El esqueleto y la Bandeja de entrada, con Actualizar | pendiente |
| OR-I3 | Trabajo e Ideas, anotar sin la IA | pendiente |
| OR-I4 | El Mapa con frentes, Skills › Framework, Pasar al framework | pendiente |

## Log de iteraciones
### OR-I1 — El modelo y el control (en curso desde 2026-11-06)
**Hecho:**
- `core/estados.ts`: el vocabulario (`pendiente`, `en curso`, `en pausa`, `hecho`, `descartado`, `nueva`) y la tabla de transición de las palabras viejas.
- Las preguntas leen `Frente:` (en la línea `Tipo:` o en una propia) y `en pausa`; las en pausa no cuentan ni avisan.
- `core/trabajo.ts`: lee `docs/trabajo.md` y arma el texto de una idea nueva.
- `core/control/`: una regla por archivo (preguntas, respuestas sin «Procesada», `trabajo.md`, estados y campos de `estado.md`, dibujos con caracteres que la letra no tiene, sacados de la letra misma) y el mensaje para la IA. Sobre este proyecto tarda 10 ms con 201 documentos (el tope era 50) y marca 132 cosas: las que va a limpiar pasarlo al framework.
- `app/control.ts` y la conversación: al terminar un turno bien, en un proyecto con framework, el control le devuelve a la IA lo mal escrito en la misma conversación, una sola vez; la pestaña sigue trabajando y las preguntas nuevas se avisan ya corregidas. No corre en el chat general ni en el de Skills, ni si el usuario detuvo a la IA.
- La entrada «control» en la conversación (W-12): plegable, en gris, con ✓ por lo corregido y «!» por lo que quedó; al volver a abrir la conversación se ve igual, no como un mensaje del usuario.
- El motor falso con `IRIDIUM_FALSO_MAL=1` (corrige) y `=terco` (no corrige).
- La tarjeta (W-2): «! N avisos del framework» al pie, en gris, con la lista al pasar el mouse, calculado por el control al leer la grilla (no se guarda); «framework viejo», etiqueta punteada junto al hito, en los proyectos con `estado.md` que no pasaron.
- El Mapa con `core/estados.ts`: con framework, solo el vocabulario (lo de afuera se ve tal cual); con el viejo, la tabla de transición. Suma `en pausa`. El paso de cada frente es el `en curso` y, si ninguno lo dice, el primero sin hacer (A-5).
- Una pregunta va al frente de su `Frente:` (en Pendientes y en el Mapa); sin esa línea, al del `estado.md` donde está escrita. Un frente que no existe queda en el núcleo.
- **El framework (OR-1):** `recursos/plugins/iridium/skills/iridium/` es el framework entero. `SKILL.md` (cada sesión: dónde estás, los principios, el modelo con el vocabulario, los hitos y su protocolo, cómo empezar, cada formato una sola vez, el control, las reglas y el cierre); `referencias/` (los once hitos, `modulos.md` con los frentes, `perfil-proyecto.md`, `integraciones.md`, `iconos.md` sin los proyectos del usuario, `ronda-ux.md` y `pasar-al-framework.md`, que reemplaza a `actualizar-formato.md`); `plantillas/` (`estado.md` sin Pendientes y con la tabla de frentes, `trabajo.md`, `README-docs.md` con `**Framework:**`, el `CLAUDE.md` que cita el framework y las del frente). Sin listas de ideas ni Backlog: todo es un `T-n`. `tools/armar-plugins.mjs` ya no copia la guía y `core/complementos.ts` carga solo el framework. Nuevo proyecto y la carpeta Ideas citan el framework. Con el Claude Code real (`tools/probar-complementos.ts`), la sesión ve `iridium:iridium`.

**Pruebas:** `tests/or1-control.test.ts` (17: el vocabulario, las preguntas, `trabajo.md` y cada regla con los casos de la auditoría), `tests/or1-devolucion.test.ts` (3: corrige en el mismo turno, la terca deja el aviso sin un segundo envío, sin framework no corre) y `tests/or1-tarjeta-mapa.test.ts` (6: el framework de cada tarjeta, el vocabulario en el Mapa con y sin framework, A-5 y el `Frente:`). Playwright, `tests/e2e/or1-control.spec.ts` (2: la IA corrige y la tarjeta queda sin avisos, con Beta en «framework viejo»; la terca deja «! 1 aviso del framework» con la lista). `tests/d086-complementos.test.ts` (9: carga solo el framework; cada referencia y plantilla citada existe, una por hito; ningún archivo nombra proyectos; las plantillas sin estados ni listas de antes; un proyecto armado con las plantillas y el ejemplo de preguntas del `SKILL.md` pasan el control sin avisos). Todas las de Vitest pasan (617). Playwright: 92 de 92 (en la corrida completa fallaron tres de la Revisión y una de teclado por la carga; solas, pasan); con el framework, `or1-control`, `r7-r8-proyectos` y `d083-carpeta-iridium`, 8 de 8.

- **Iridium pasado al framework** (`referencias/pasar-al-framework.md`): `docs/trabajo.md` con T-1 a T-50 (las ideas de `00-idea.md`, `01-exploracion.md` y `07-construccion.md`, el Backlog de `10-operacion.md` y los pendientes de `estado.md` y de los frentes); los estados de las tablas, con el vocabulario; `estado.md` con la tabla de frentes y sin Pendientes; los `estado.md` de los frentes sin Pendientes ni preguntas; 34 respuestas viejas con su «Procesada»; los dibujos de cuatro `ux.md` sin caracteres de otra letra; el portón de los hitos 0 a 2; `**Framework:** 2026-11-06` y los códigos propios en `docs/README.md`; el `CLAUDE.md` de la raíz cita el framework. Las tablas de `07-construccion.md` con los errores reportados y las pruebas aprobadas provisionales quedaron como historial (todo resuelto). R-12 apunta a T-46.
- `tools/control.ts`: el control sobre una carpeta desde la terminal, aunque no haya pasado al framework. Sobre Iridium, de 119 avisos a 0.
- En el framework, `pasar-al-framework.md`: `10-operacion.md` tampoco lleva portón (su plantilla no lo tiene).

**Criterios verificados** (con la app armada, los proyectos reales y el motor falso, `tools/auditoria-ux.ts`): la tarjeta de Iridium sin «framework viejo» ni avisos; las de los otros proyectos con `docs/`, con «framework viejo»; el Mapa de Iridium con los hitos 0 a 9 hechos, el 10 en curso, los frentes hechos y Orden en «7. Construcción» con Q-141. Vitest 617 de 617 y typecheck limpio.

**Falta:** la prueba del usuario (Q-141).

## Próximo paso
OR-I2: el esqueleto y la Bandeja de entrada, con Actualizar (T-46) y D-100 en el código (T-47).
**Leer antes:** `diseno-tecnico.md` › Iteraciones y › Actualizar, `04-ux.md` › W-1, W-5 y W-9, `06-ui.md` › Frente Orden.
