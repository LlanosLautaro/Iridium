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
| 4. UX | hecho (Q-246, Q-247, D-168) | `ux.md` |
| 5. Diseño técnico | hecho (D-169) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | hecho (D-170) | `06-ui.md` y `diseno/piezas.css` |
| 7. Construcción | en curso (sigue PA-I1) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Definición aprobada e investigación hecha (2026-11-21): los cuatro pedidos entran como Must y todo lo del motor pasa por su frontera; la lista de «/» esconde los comandos que pisan a Iridium y los de la terminal (D-167). La ronda de UX (T-100) y su tanda ya están (2026-11-21).
La UX está aprobada (`ux.md`, PA-1 a PA-6, D-168): un comando escondido escrito a mano no se manda y dice dónde está en Iridium. Diseño técnico cerrado (D-169): el motor dice qué sabe hacer (comandos, fotos, escondidos), los adjuntos viajan con marcas de Iridium que el historial reconoce y las fotos pegadas se guardan en los datos de Iridium. Piezas en el sistema (D-170): la Ficha (PZ-16), el menú arriba del compositor y el estado de soltar, con su maqueta. Sigue PA-I1, los comandos con «/».

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
| `05-arquitectura.md` › La interfaz `Motor` | `enviar` con fotos, `capacidades`, `comandos` y su evento; el historial con comandos y fotos | D-165, D-169 | sí |
| `05-arquitectura.md` › Modelo de datos | `escritos.json` con adjuntos, `pegadas/` y `comandosRecientes` | D-169 | sí |
| `02-definicion.md` › Catálogo de casos de uso y Glosario | C-64 a C-67; adjunto, texto pegado y comando | D-165 | sí |
| `05-arquitectura.md` › Spikes | S-5 | D-165 | sí |
| `04-ux.md` › W-12 — La conversación | El + en el pie, la lista de «/», las fichas de los adjuntos y cómo se ven en los mensajes | D-168 | sí |
| `06-ui.md`, `DESIGN.md` y `diseno/piezas.css` | La Ficha (PZ-16), el menú arriba del compositor y el estado de soltar | Q-247, D-170 | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| PA-I1 | Los comandos con «/» | pendiente |
| PA-I2 | Archivos y fotos | pendiente |
| PA-I3 | El texto largo pegado | pendiente |

## Log de iteraciones
- 2026-11-21 — Definición e investigación. El spike S-5 respondió lo del motor: la lista de comandos sale sin gastar, un comando es un mensaje que empieza con «/», la foto viaja dentro del mensaje y queda en el historial, el archivo como su ruta. `definicion.md` con los cuatro pedidos como Must; qué comandos esconder (Q-243) y el visto bueno (Q-244) quedan para el usuario.
- 2026-11-21 — Q-243 y Q-244 respondidas: la lista de «/» esconde los que pisan a Iridium y los de la terminal, y la definición queda aprobada (D-167).
- 2026-11-21 — UX escrita: la lista de «/» arriba del compositor, el + primero en el pie, las fichas arriba del cuadro (miniatura para las fotos), el texto pegado desde 40 líneas o 2.000 caracteres, el visor y cómo quedan en los mensajes mandados. Cuatro maquetas (`diseno/pantallas/paridad-*.html`); `piezas.js` acepta un compositor propio en una maqueta. Q-246 y Q-247.
- 2026-11-21 — Q-246 y Q-247 respondidas: la UX aprobada como está, y un comando escondido escrito a mano no se manda (D-168).
- 2026-11-21 — Diseño técnico (D-169): `capacidades`, `comandos` y `enviar` con fotos en la frontera; las marcas `iridium-*` para el texto pegado y los archivos; el historial traduce los comandos y su respuesta (visto en un historial real); `escritos.json` 2 y `pegadas/`; las fotos se achican con `nativeImage`. Tres iteraciones, PA-I1 a PA-I3.
- 2026-11-21 — Paso 6 (D-170): la Ficha (PZ-16) en las dos hojas de piezas, el menú arriba del compositor en PZ-8 y el estado de soltar en la conversación, con la maqueta `paridad-soltar.html`; las maquetas de Paridad, sin estilos propios. Capturas de las cinco revisadas; pruebas, lint y control en verde.
- 2026-11-21 — La tanda de la ronda de UX hecha (T-101 a T-110, en `trabajo.md`), con su prueba en Q-248: la construcción queda libre.

## Próximo paso
Construir PA-I1, los comandos con «/» (`diseno-tecnico.md` › Iteraciones y Procesos centrales › Elegir un comando).
**Leer antes:** `diseno-tecnico.md` y `ux.md` › PA-1 y PA-6.
