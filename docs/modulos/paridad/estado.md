# Estado del módulo: Paridad

**Tipo:** sección
**Última actualización:** 2026-11-21
**Nivel de protección:** hereda P2

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (Q-237 a Q-239, D-166) | `propuesta.md` |
| 2. Definición | en curso (escrita; espera Q-243 y Q-244) | `definicion.md` |
| 3. Investigación | hecho (spike S-5) | `investigacion.md` |
| 4. UX | pendiente | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Definición escrita e investigación hecha (2026-11-21, spike S-5): los cuatro pedidos entran como Must y todo lo del motor pasa por su frontera. Esperan Q-243 (qué comandos muestra «/») y Q-244 (el visto bueno). Mientras, va la ronda de UX (T-100), que tiene que estar antes de construir.

## Ruta
- [x] Elegir qué del chat de Claude entra y cuándo (D-166)
- [x] Ver qué deja hacer el motor: comandos, fotos y archivos (S-5)
- [ ] Escribir «/» y elegir un comando (Q-243)
- [ ] Adjuntar archivos y fotos con el + o arrastrándolos (T-96)
- [ ] Pegar una foto en el chat
- [ ] Que un texto largo pegado vaya como archivo
- [ ] Usar los plugins de Claude Code desde las sesiones (T-28)
- [ ] Usar la PC y el navegador desde las sesiones (T-28)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `05-arquitectura.md` › La interfaz `Motor` | `enviar` con adjuntos y lo que sabe hacer cada motor (comandos, imágenes) | D-165 | no (paso 5) |
| `02-definicion.md` › Catálogo de casos de uso y Glosario | C-64 a C-67; adjunto, texto pegado y comando | D-165 | sí |
| `05-arquitectura.md` › Spikes | S-5 | D-165 | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones
- 2026-11-21 — Definición e investigación. El spike S-5 respondió lo del motor: la lista de comandos sale sin gastar, un comando es un mensaje que empieza con «/», la foto viaja dentro del mensaje y queda en el historial, el archivo como su ruta. `definicion.md` con los cuatro pedidos como Must; qué comandos esconder (Q-243) y el visto bueno (Q-244) quedan para el usuario.

## Próximo paso
Con Q-243 y Q-244 respondidas: la UX (`ux.md`), con la lista de «/», el menú del +, las fichas de los adjuntos y cómo se ven en los mensajes mandados.
**Leer antes:** `definicion.md`, `investigacion.md` y `04-ux.md` › W-12 — La conversación.
