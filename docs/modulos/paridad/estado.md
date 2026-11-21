# Estado del módulo: Paridad

**Tipo:** sección
**Última actualización:** 2026-11-21
**Nivel de protección:** hereda P2

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (Q-237 a Q-239, D-166) | `propuesta.md` |
| 2. Definición | pendiente | `definicion.md` |
| 3. Investigación | pendiente (qué deja hacer el motor: comandos, imágenes, archivos) | `investigacion.md` |
| 4. UX | pendiente | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente abierto el 2026-11-21 a pedido del usuario (D-165, T-96): el chat de Iridium con lo que tiene el de Claude, escrito contra la frontera del motor para que más adelante pueda entrar otro agente. La propuesta está hecha (D-166): empieza al cerrar DI-I3, con los cuatro pedidos; «@» y el micrófono quedan como ideas (T-97, T-98) y Capacidades (T-28) es su segunda parte.

## Ruta
- [x] Elegir qué del chat de Claude entra y cuándo (D-166)
- [ ] Ver qué deja hacer el motor: comandos, fotos y archivos
- [ ] Escribir «/» y elegir un comando
- [ ] Adjuntar archivos y fotos con el + o arrastrándolos (T-96)
- [ ] Pegar una foto en el chat
- [ ] Que un texto largo pegado vaya como archivo
- [ ] Usar los plugins de Claude Code desde las sesiones (T-28)
- [ ] Usar la PC y el navegador desde las sesiones (T-28)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `05-arquitectura.md` › La interfaz `Motor` | `enviar` con adjuntos y lo que sabe hacer cada motor (comandos, imágenes) | D-165 | no (paso 5) |
| `02-definicion.md` › Catálogo de casos de uso | Los casos de uso del chat que entren | D-165 | no (paso 2) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones
(Todavía ninguna.)

## Próximo paso
Ahora (DI-I3 y Arranque, cerrados; D-166): la definición (`definicion.md`) con lo que entra y la investigación de lo que deja hacer el motor (un spike).
**Leer antes:** `propuesta.md` y `05-arquitectura.md` › La interfaz `Motor`.
