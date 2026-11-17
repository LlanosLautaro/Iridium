# Estado del módulo: Mapa

**Tipo:** sección (la sección Mapa de cada proyecto, rehecha; T-71)
**Última actualización:** 2026-11-17
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (el camino de pasos por frente, D-137, D-138; la ruta en cada `estado.md`, D-139) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-199, D-141; antes del hito 10, D-142; «Por empezar», D-143) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros: se dibuja lo que ya escribe la IA) | — |
| 4. UX | en curso (espera Q-202) | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente (el camino, sus marcas y sus ramas ya están en las maquetas `diseno/pantallas/mapa-b.html` y `mapa-hitos.html`; pasan a `piezas.css` al construir) | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
La definición quedó aprobada (Q-199 a Q-201 → D-141 a D-143). La UX está escrita (`ux.md`, MA-1 a MA-12) con las maquetas al día: `mapa-b.html` con los frentes de hoy, un frente sin ruta (Revisión), uno con algo aprobado sin lugar en la ruta (Diseño) y «Por empezar» sacado de `trabajo.md`; `mapa-hitos.html`, un proyecto en el hito 7. Espera Q-202 (si la UX va así).

## Ruta
- [x] Pensar para qué sirve el Mapa
- [x] Elegir la maqueta del camino por frente
- [x] Decidir dónde se escribe la ruta de cada frente
- [x] Definir qué muestra el Mapa y qué deja de mostrar
- [ ] Dibujar cómo se usa, también antes del hito 10 y en «Por empezar» (Q-202)
- [ ] Enseñarle a la IA a escribir la ruta, con su control
- [ ] Dibujar el camino de un frente, con sus ramas
- [ ] Elegir el frente desde la barra de arriba
- [ ] Escribir la ruta de cada frente de Iridium
- [ ] Ubicar cada idea aprobada en la ruta de su frente

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `04-ux.md` › H-7 y W-7 (Mapa) | El Mapa pasa a ser el camino de pasos por frente: H-7 y W-7 remiten a `ux.md` | D-138, D-141 | no (al aprobarse la UX, Q-202) |
| `05-arquitectura.md` y el framework | La sección `## Ruta` del `estado.md` de un frente, su lector y su control | D-139 | no (con la construcción) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones
(todavía ninguna)

- 2026-11-17 — Paso 2 cerrado: Q-199 a Q-201 → D-141 a D-143. Paso 4: `ux.md` escrita y las maquetas al día (`mapa-b.html` rehecha con los datos de hoy; `mapa-hitos.html` nueva); el control y la prueba de estilos, sin avisos.

## Próximo paso
Con la UX aprobada (Q-202): pasar H-7 y W-7 de `04-ux.md` a `ux.md` y hacer el paso 5, diseño técnico: el formato exacto de `## Ruta` (las marcas, las ramas, la `Q-n` y el `T-n` en la línea), el lector, el control y lo que lee «Por empezar» de `trabajo.md`.
**Leer antes:** `ux.md`; `definicion.md` › Cómo se escribiría la ruta; `05-arquitectura.md` (los lectores de `estado.md` y el control); la respuesta Q-202.
