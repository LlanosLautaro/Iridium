# Estado del módulo: Orden

**Tipo:** sección (atraviesa la app y la forma de trabajar; D-091)
**Última actualización:** 2026-11-06
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | completo (el usuario abrió la operación en el chat, 2026-11-05) | `propuesta.md` |
| 2. Definición | completo (2026-11-06; Q-133 a Q-135 → D-094 a D-096) | `definicion.md` |
| 3. Investigación | completo (2026-11-05): la UX y la forma de trabajo, A-1 a A-23 | `auditoria.md` |
| 4. UX | completo (2026-11-06; Q-136 a Q-139 → D-097 a D-099): `04-ux.md` reescrito sin capas | `ux.md` (historia) y `04-ux.md` |
| 5. Diseño técnico | completo (2026-11-06): el control, `trabajo.md`, el vocabulario, los frentes del Mapa, Actualizar y cuatro iteraciones | `diseno-tecnico.md` |
| 6. UI | completo (2026-11-06; Q-140 → D-100) | `06-ui.md` › Frente Orden y `ui/vista-orden.html` |
| 7. Construcción | en curso (2026-11-06): OR-I1 | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente abierto el 2026-11-05 con prioridad máxima (D-091): las funciones nuevas esperan. Hechas la auditoría (A-1 a A-23), la definición (D-094 a D-096) y la UX: `04-ux.md` está reescrito entero, sin capas, con las pantallas aprobadas en Q-139 (W-1 a W-17) y el nombre «framework» en lugar de «marco» (D-099). El diseño técnico está escrito (`diseno-tecnico.md`): el control corre al terminar cada turno con los lectores de la pantalla y le devuelve a la IA lo mal escrito una vez por turno; `trabajo.md` se anota desde Iridium sin pisar a la sesión; un vocabulario de estados con una tabla de transición para los proyectos con framework viejo; Actualizar junta Armar y Reiniciar. Cuatro iteraciones, por riesgo: OR-I1 el modelo y el control, OR-I2 el esqueleto y la Bandeja (con Actualizar), OR-I3 Trabajo e Ideas, OR-I4 Mapa, Skills › Framework y Pasar al framework. R-13 (los dibujos en texto desalineados) se arregló con la letra completa. El paso 6 cerró con Q-140 (D-100: el ámbar solo para lo que frena, el botón principal claro). OR-I1 va por las tres cuartas partes: las reglas, la devolución, los avisos en la tarjeta y el Mapa con el vocabulario andan; faltan el framework reordenado y pasar este proyecto al framework.

## Pendientes
- [x] Auditoría de UX (`auditoria.md` › Parte 1; capturas con `tools/auditoria-ux.ts`).
- [x] El chip del frente en el Mapa muestra el primer paso sin completar en vez del que está en curso (A-5): con la primera iteración.
- [x] Auditoría de la forma de trabajo (`auditoria.md` › Parte 2).
- [x] `definicion.md`: el modelo único y el framework único (OR-1 a OR-12), con Q-133 a Q-135.
- [x] Con Q-133 a Q-135: `definicion.md` ajustada, D-094 a D-096 y el glosario de `02-definicion.md`.
- [x] `ux.md` › Parte 1, la arquitectura de información.
- [x] Con Q-136 a Q-138: `ux.md` › Parte 1 ajustada (D-097, D-098) y la Parte 2, las pantallas PO-1 a PO-10.
- [x] Con Q-139: `04-ux.md` reescrito sin capas (las PO-n pasaron a W-n) y D-099.
- [x] Paso 5, diseño técnico (`diseno-tecnico.md`).
- [x] Paso 6, UI: las piezas nuevas en `06-ui.md` y la hoja `ui/vista-orden.html` con capturas en los dos temas.
- [x] Con Q-140: las reglas de color de `DESIGN.md` y `.impeccable/design.json` (D-100); el paso 6, cerrado.
- [ ] R-12 (un solo botón Actualizar, W-1): en OR-I2.
- [ ] D-100 en el código: el botón primario claro y las cuentas en gris (OR-2), y el ⚠ de Skills en gris (OR-I4).
- [ ] Tocar «! N avisos del framework» abre la lista en Docs (W-2): hoy la tarjeta abre el proyecto y la lista se ve al pasar el mouse; la lista va con Skills › Framework, en OR-I4.
- [ ] OR-I1, lo que falta (ver Log › OR-I1): el framework reordenado (`recursos/plugins/iridium`: `SKILL.md`, `referencias/`, `plantillas/`; `tools/armar-plugins.mjs` sin la guía); pasar Iridium al framework (`docs/trabajo.md` con los pendientes e ideas, los estados al vocabulario, la tabla de frentes, `**Framework:**`) hasta que el control dé cero; una `Q-n` de prueba para el usuario.

## Preguntas abiertas
(ninguna)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `02-definicion.md` › Módulos previstos | Orden, activo y primero; Diseño y Capacidades detrás | D-091 | sí |
| `10-operacion.md` › Backlog | Orden en los frentes; los `R-n` nuevos esperan la ronda de UX | D-091 | sí |
| `04-ux.md` | Reescrito sin capas | D-091, D-097 a D-099 | sí |
| `05-arquitectura.md` | Trabajo en el modelo de datos, `anchoConversacion` y el control al terminar un turno | D-092, D-094, D-098 | sí |
| `02-definicion.md` › Glosario | «Framework» en lugar de «Marco» | D-099 | sí |
| La skill de Iridium y la guía de hitos | Un solo framework, con control | D-092 | no (paso 2 en adelante) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| OR-I1 | El modelo y el control | en curso |
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

**Pruebas:** `tests/or1-control.test.ts` (17: el vocabulario, las preguntas, `trabajo.md` y cada regla con los casos de la auditoría), `tests/or1-devolucion.test.ts` (3: corrige en el mismo turno, la terca deja el aviso sin un segundo envío, sin framework no corre) y `tests/or1-tarjeta-mapa.test.ts` (6: el framework de cada tarjeta, el vocabulario en el Mapa con y sin framework, A-5 y el `Frente:`). Playwright, `tests/e2e/or1-control.spec.ts` (2: la IA corrige y la tarjeta queda sin avisos, con Beta en «framework viejo»; la terca deja «! 1 aviso del framework» con la lista). Todas las de Vitest pasan (614). Playwright: 92 de 92 (en la corrida completa fallaron tres de la Revisión y una de teclado por la carga; solas, pasan).

**Falta:** ver Pendientes.

## Próximo paso
OR-I1: el framework reordenado (`recursos/plugins/iridium`: `SKILL.md`, `referencias/`, `plantillas/`; `tools/armar-plugins.mjs` sin la guía); después pasar Iridium al framework.
