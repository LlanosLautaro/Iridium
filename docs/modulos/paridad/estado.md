# Estado del módulo: Paridad

**Tipo:** sección
**Última actualización:** 2026-11-21
**Nivel de protección:** hereda P2

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (Q-237 a Q-239, D-166) | `propuesta.md` |
| 2. Definición | hecho (Q-243, Q-244, D-167) | `definicion.md` |
| 3. Investigación | hecho (spike S-5) | `investigacion.md` |
| 4. UX | en curso (espera Q-246 y Q-247) | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Definición aprobada e investigación hecha (2026-11-21): los cuatro pedidos entran como Must y todo lo del motor pasa por su frontera; la lista de «/» esconde los comandos que pisan a Iridium y los de la terminal (D-167). La ronda de UX (T-100) ya está; sus `pendiente` (T-101, T-103, T-104, T-106 a T-108, T-110) van en una tanda antes de construir Paridad.
La UX está escrita (`ux.md`, PA-1 a PA-6) con cuatro maquetas en Diseño › «Paridad (propuesta)»; espera qué pasa con un comando escondido escrito a mano (Q-246) y el visto bueno (Q-247).

## Ruta
- [x] Elegir qué del chat de Claude entra y cuándo (D-166)
- [x] Ver qué deja hacer el motor: comandos, fotos y archivos (S-5)
- [ ] Escribir «/» y elegir un comando (D-167)
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
| `04-ux.md` › W-12 — La conversación | El + en el pie, la lista de «/», las fichas de los adjuntos y cómo se ven en los mensajes | Q-247 | no (al aprobar la UX) |
| `06-ui.md` y `diseno/piezas.css` | La ficha de adjunto con miniatura, el menú arriba del compositor y el borde de soltar | Q-247 | no (paso 6) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones
- 2026-11-21 — Definición e investigación. El spike S-5 respondió lo del motor: la lista de comandos sale sin gastar, un comando es un mensaje que empieza con «/», la foto viaja dentro del mensaje y queda en el historial, el archivo como su ruta. `definicion.md` con los cuatro pedidos como Must; qué comandos esconder (Q-243) y el visto bueno (Q-244) quedan para el usuario.
- 2026-11-21 — Q-243 y Q-244 respondidas: la lista de «/» esconde los que pisan a Iridium y los de la terminal, y la definición queda aprobada (D-167).
- 2026-11-21 — UX escrita: la lista de «/» arriba del compositor, el + primero en el pie, las fichas arriba del cuadro (miniatura para las fotos), el texto pegado desde 40 líneas o 2.000 caracteres, el visor y cómo quedan en los mensajes mandados. Cuatro maquetas (`diseno/pantallas/paridad-*.html`); `piezas.js` acepta un compositor propio en una maqueta. Q-246 y Q-247.

## Próximo paso
Con Q-246 y Q-247 respondidas: registrar la UX como decisión, aplicar lo que cambie en `ux.md` y en las maquetas, y escribir el diseño técnico (`diseno-tecnico.md`): `enviar` con adjuntos y lo que sabe hacer cada motor en `05-arquitectura.md` › La interfaz `Motor`.
**Leer antes:** `respuestas/Q-246.md`, `respuestas/Q-247.md`, `ux.md` e `investigacion.md`.
