# Estado del módulo: Mapa

**Tipo:** sección (la sección Mapa de cada proyecto, rehecha; T-71)
**Última actualización:** 2026-11-17
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (el camino de pasos por frente, D-137, D-138; la ruta en cada `estado.md`, D-139) | `propuesta.md` |
| 2. Definición | en curso (espera Q-199 a Q-201) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros: se dibuja lo que ya escribe la IA) | — |
| 4. UX | pendiente | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente (el camino, sus marcas y sus ramas ya están en la maqueta `diseno/pantallas/mapa-b.html`; pasan a `piezas.css` al construir) | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
La propuesta se cerró en el chat (Q-193 a Q-195): un frente a la vez desde una barra arriba, un camino vertical de pasos concretos, y la ruta escrita en el `estado.md` de cada frente. La definición está escrita (`definicion.md`) y espera tres respuestas: si va así, con lo que deja de mostrar el Mapa (Q-199); qué muestra antes del hito 10 (Q-200), y de dónde sale «Por empezar» (Q-201).

## Ruta
- [x] Pensar para qué sirve el Mapa
- [x] Elegir la maqueta del camino por frente
- [x] Decidir dónde se escribe la ruta de cada frente
- [ ] Definir qué muestra el Mapa y qué deja de mostrar (Q-199)
- [ ] Dibujar cómo se usa, también antes del hito 10 y en «Por empezar»
- [ ] Enseñarle a la IA a escribir la ruta, con su control
- [ ] Dibujar el camino de un frente, con sus ramas
- [ ] Elegir el frente desde la barra de arriba
- [ ] Escribir la ruta de cada frente de Iridium
- [ ] Ubicar cada idea aprobada en la ruta de su frente

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `04-ux.md` › H-7 y W-7 (Mapa) | El Mapa pasa a ser el camino de pasos por frente | D-138 | no (con la UX del frente) |
| `05-arquitectura.md` y el framework | La sección `## Ruta` del `estado.md` de un frente, su lector y su control | D-139 | no (con la construcción) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|

## Log de iteraciones
(todavía ninguna)

## Próximo paso
Procesar Q-199 a Q-201 (cerrar `definicion.md` y registrar lo decidido) y hacer el paso 4, UX: las historias `MA-n` y cómo se ve cada caso (un frente con ramas, uno sin ruta, «Por empezar», antes del hito 10), con la maqueta `mapa-b.html` al día.
**Leer antes:** `definicion.md`; las respuestas Q-199 a Q-201; `04-ux.md` › H-7 y W-7; la maqueta `diseno/pantallas/mapa-b.html`.
