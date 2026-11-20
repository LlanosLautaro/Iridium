# Estado del módulo: Revisión de la app

**Tipo:** producto hermano (extensión del navegador; la recibe Iridium)
**Última actualización:** 2026-11-20
**Nivel de protección:** hereda P2. Iridium escucha a la extensión solo en `127.0.0.1:47321` y solo con su origen (`diseno-tecnico.md` › Seguridad).

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (D-012, D-046) | `propuesta.md` |
| 2. Definición | hecho (D-047; aprobada en Q-68) | `definicion.md` |
| 3. Investigación | hecho (S-3) | `investigacion.md` |
| 4. UX | hecho (Q-69, D-049) | `ux.md` |
| 5. Diseño técnico | hecho (D-048) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | hecho (Q-69, D-049) | `ui/vista-revision.html` + `DESIGN.md` › Revisión de la app |
| 7. Construcción | hecho (R-I1 y R-I3 aprobadas en Q-70; R-I2 validada en Q-108) | este archivo; log en `07-construccion.md` › R-I1, R-I2 y R-I3 |
| 8. Calidad | hecho (con el hito 8, `08-calidad.md`; portón aprobado en Q-108) | este archivo |
| 9. Lanzamiento | hecho (con el hito 9, `09-lanzamiento.md`; portón aprobado en Q-111) | este archivo |

## En qué estamos ahora
Construcción y calidad completas: R-I2 quedó validada con tu recorrido (Q-108) y la prueba intermitente de Electron era un caso real, arreglado (Defecto 7: con la PC ocupada un comentario podía salir sin archivo ni línea). Lanzado con el hito 9 (Q-111, 2026-11-02): el módulo está en uso y sigue con la operación del proyecto (hito 10). 2026-11-05: tercer estado «anotado» para lo que queda en un plan sin hacer (R-9, D-088). 2026-11-20: la línea «Página» se guarda corta, sin las carpetas de la PC (T-34, D-082); los comentarios viejos de este repo, pasados.

## Ruta
- [x] Comentar la app con F8 y recibirlo en Iridium
- [x] Guardar la página del comentario con su ruta corta (T-34)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `02-definicion.md` | C-36 a C-39 pasan a *Must* | D-046 | sí |
| `07-construccion.md` | El módulo va antes de I-5 | D-046 | sí |
| `02-definicion.md` | C-36: web o Electron; dos términos nuevos en el glosario | D-047 | sí |
| `00-idea.md` | Electron deja de ir a «Ideas para después» | D-047 | sí |
| `05-arquitectura.md` | Spike S-3; requisito de seguridad del puerto | D-047 | sí |
| `04-ux.md` | Ícono Revisión en la barra del proyecto | D-046 | sí |
| `05-arquitectura.md` | Comentario y `revision.json` en el modelo; `docs/revision/` en Seguridad; `extension/` en el repo; `trace-mapping` en el stack | D-048 | sí |
| `ux.md` (del módulo) | H-R6: la IA se entera por la instrucción y la guía, no por el `CLAUDE.md` | D-048 | sí |
| `ux.md`, `diseno-tecnico.md`, `DESIGN.md` (del módulo) | Sin barra; F8; aviso al entrar | D-049 | sí |
| `diseno-tecnico.md` (del módulo) | Permiso de la extensión sobre todos los sitios, solo para la captura; `/estado` por `POST` | D-050 | sí |
| Guía `hitos-desarrollo-app` | Regla y línea de `CLAUDE.md` sobre `docs/revision/` | D-048 | sí (2026-10-29) |
| Guía `hitos-desarrollo-app` | La línea del ayudante en las apps Electron, desde el hito 7 | D-051 | sí |
| otras apps | La línea en su proceso principal (D-085 y D-056 de cada uno) | D-051 | sí |
| otra app, guía, `diseno-tecnico.md` › Seguridad | La línea también en la versión armada (D-057 de otra app) | D-052 | sí |
| `diseno-tecnico.md` (del módulo) | R-I2: el mensaje en `compartido/`, con la línea de cómo cerrarlo; «enviado» antes de mandarlo; contador sin evento propio; volver a preguntar a Iridium al abrir la tarjeta | — (precisiones) | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| R-I1 | Comentar en el navegador: extensión, receptor, `R-n` con archivo, línea y captura, proyecto, cola | hecho, aprobada (2026-10-29, Q-70) |
| R-I2 | Revisión en Iridium (con la detección y Pedírselo a la IA de R-I3), Enviar ahora, mensaje en la conversación, instrucción a la IA | hecho, validada (2026-11-02, Q-108) |
| R-I3 | Electron: ayudante, captura, proyecto y la línea en las apps (adelantada, D-051) | hecho, aprobada (2026-10-29, Q-70) |

## Próximo paso
Nada propio: el módulo está en operación con el proyecto. Sus errores y mejoras van a `trabajo.md`.
**Leer antes:** nada.
