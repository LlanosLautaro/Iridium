# Estado del módulo: Plantillas

**Tipo:** plugin (el framework)
**Última actualización:** 2026-11-27
**Nivel de protección:** hereda P2

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (Q-324 y Q-325, D-208 y D-209) | `propuesta.md` |
| 2. Definición | hecho (Q-326, A) | `definicion.md` |
| 3. Investigación | hecho (S-9: la receta anda en otra app) | `investigacion.md` |
| 4. UX | descartado (no tiene pantallas: lo lee la IA) | — |
| 5. Diseño técnico | descartado (el cambio de `Solo si:` es chico; va en el log de PL-I1) | — |
| 6. UI (solo si hay piezas nuevas) | descartado (sin interfaz) | — |
| 7. Construcción | hecho (PL-I1, probada en Q-327) | este archivo |
| 8. Calidad | hecho (2026-11-27) | este archivo |
| 9. Lanzamiento | hecho (va con Iridium 1.6.0) | este archivo |

## En qué estamos ahora
**Cerrado el 2026-11-27 (1.6.0).** PL-I1 probada en Q-327, todo bien: en tu app de Electron, Ponerse al día aplicó la receta y sus pruebas corren sin verse. La calidad sumó a la receta lo que la app recuerda de su ventana y lo que la trae al frente, con su novedad. T-81 hecha; sigue recibiendo recetas nuevas (T-1, la guía por tipo de proyecto, es la candidata).

## Ruta
- [x] Aprobar la propuesta: qué es una receta y las dos primeras (Q-324, Q-325)
- [x] Probar la receta sin ventanas en una app de Electron de muestra, fuera de Iridium (S-9)
- [x] Aprobar la definición de las dos primeras recetas (Q-326)
- [x] Escribir la receta «Pruebas sin ventanas», mudar la actualización sola a `recetas/` y avisar con la novedad (PL-I1)
- [x] Ponerse al día en tu app de Electron y ver que sus pruebas no se ven (T-81, Q-327)
- [x] La calidad de las recetas y cerrar el frente

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `02-definicion.md` › Glosario | Receta | D-208 | sí |
| `05-arquitectura.md` › Spikes | S-9 | — | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| PL-I1 | Las dos primeras recetas y la novedad de las pruebas sin ventanas | hecho |

## Log de iteraciones
### PL-I1 — Las dos primeras recetas y la novedad de las pruebas sin ventanas
**Leer antes:** `definicion.md`, `investigacion.md`.
**Hecho (2026-11-27):**
- `recetas/pruebas-sin-ventanas.md`: página (Playwright sin ventana), escritorio de Electron (la variable que prenden solo las pruebas, la ventana fuera de la pantalla, sin barra de tareas, sin foco y muda, sin dejar de dibujarse, las consolas escondidas, lo que no se esconde cambiado por algo que la prueba mira) y consola (no le toca); cómo se prueba, con la `Q-n` del usuario.
- `recetas/actualizacion-sola.md`: la guía de D-207 mudada desde `referencias/`, con su **Para:** y **Se aplica:** (solo a pedido, sin novedad).
- `SKILL.md` › Las recetas, con la regla «las pruebas no ocupan la pantalla del usuario»; `referencias/07-construccion.md` y `08-calidad.md` la nombran donde se arman y se revisan las pruebas.
- `Solo si:` de las novedades acepta varias rutas separadas por ` · ` (le toca al que tiene alguna): el lector, el tipo compartido, `SKILL.md` y la cabecera de `novedades.md` (D-086). La novedad del 2026-11-27 va a las seis ubicaciones comunes de la configuración de Playwright.

**Criterios verificados:**
- Simulado con el lector real sobre tu carpeta de proyectos (sin tocarlos): la novedad le toca a uno solo, tu app de Electron con Playwright en `app/`; a los otros, nada. Iridium ya la cumple (D-072) y su fecha es la de hoy.
- La receta sale de lo probado en S-9.

**Pruebas:** `tests/pl-recetas.test.ts` (cada receta con su título, **Para:**, **Se aplica:** y Cómo se prueba; `SKILL.md` las nombra todas y ninguna de más; la guía ya no está en `referencias/`) y `tests/or-novedades.test.ts` (varias rutas, una mala marca la línea, le toca con cualquiera). Vitest entero, 1180 en verde; typecheck y lint sin errores.

**Encontrado de paso:** una novedad con la misma fecha que el `**Framework:**` de un proyecto no le llega (T-145).

### Calidad (paso 8, 2026-11-27)
- Q-327, todo bien: la novedad le llegó solo a tu app de Electron, Ponerse al día aplicó la receta, sus pruebas pasan y no se ven, no roban el foco ni suenan.
- La receta comparada con el código de Iridium (D-072): le faltaban dos cosas que Iridium sí hace. **Lo que la app recuerda de su ventana**: con la variable, no lo lee ni lo guarda (si no, después de las pruebas el usuario la abriría fuera de la pantalla o maximizada a la vista). **Lo que la trae al frente** (`focus()`, `maximize()`, avisos de Windows) y lo que corre solo instalada (actualizar, publicar): con la variable, no va. Sumados como puntos 5 y 6 de Escritorio, con la novedad «Las pruebas sin ventanas no tocan lo que la app recuerda» (mismo `Solo si:`), que llega aunque te hayas puesto al día hoy (T-145). Iridium ya lo cumple: su `**Framework:**` pasa a esa.
- La actualización sola, revisada: sin cambios.
- Pruebas: `or-novedades` con la novedad nueva; Vitest 1182 en verde; typecheck y lint sin errores.

## Próximo paso
Frente cerrado. Una receta nueva entra como un paso nuevo de la ruta, con su novedad si les pide algo a los proyectos que ya existen (D-209).
**Leer antes:** `recetas/` del framework.
