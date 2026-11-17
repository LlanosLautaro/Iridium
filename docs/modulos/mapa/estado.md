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
| 4. UX | hecho (aprobada en Q-202, D-144) | `ux.md` |
| 5. Diseño técnico | hecho (D-145) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | hecho (el camino, sus marcas y sus ramas ya están en las maquetas `diseno/pantallas/mapa-b.html` y `mapa-hitos.html`; pasan a `piezas.css` al construir) | — |
| 7. Construcción | en curso (MA-I1 hecha; sigue MA-I2) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
UX aprobada (D-144) y diseño técnico cerrado (D-145). MA-I1 hecha: la ruta ya es parte del framework, con su lector y su control, y cada frente de Iridium tiene la suya. Sigue MA-I2, el Mapa nuevo en la app.

## Ruta
- [x] Pensar para qué sirve el Mapa
- [x] Elegir la maqueta del camino por frente
- [x] Decidir dónde se escribe la ruta de cada frente
- [x] Definir qué muestra el Mapa y qué deja de mostrar
- [x] Dibujar cómo se usa, también antes del hito 10 y en «Por empezar»
- [x] Decidir cómo se escribe la ruta y cómo la lee Iridium
- [x] Enseñarle a la IA a escribir la ruta y a ubicar ahí cada idea aprobada, con su control (MA-I1)
- [x] Escribir la ruta de cada frente de Iridium (MA-I1)
- [ ] Dibujar el camino de un frente, con sus ramas (MA-I2)
- [ ] Elegir el frente desde la barra de arriba (MA-I2)
- [ ] Ver lo que está por empezar y empezar un frente (MA-I2)
- [ ] Ver el camino de los hitos en un proyecto antes de operación (MA-I3)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `04-ux.md` › H-7 y W-7 (Mapa) | El Mapa pasa a ser el camino de pasos por frente: H-7 y W-7 remiten a `ux.md` | D-138, D-141 | no (al aprobarse la UX, Q-202) |
| El framework (`recursos/plugins/iridium`) | La sección `## Ruta` en la plantilla, `SKILL.md`, `referencias/modulos.md` y `10-operacion.md`, con su lector y su control | D-139, D-145 | sí (MA-I1, 2026-11-17) |
| `05-arquitectura.md` › Modelo de datos | El Mapa lee la ruta de cada frente y arma «Por empezar» con `trabajo.md` | D-145 | no (con MA-I2, al cambiar el Mapa) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| MA-I1 | La ruta en el framework, su lector y su control, y la ruta de cada frente de Iridium | hecho (2026-11-17; sin prueba del usuario: no cambia nada que se vea) |
| MA-I2 | El Mapa nuevo en operación: la barra de frentes, el camino con sus marcas, ramas y plegados, «Aprobado, sin lugar», «Por empezar» y la pieza Camino | pendiente |
| MA-I3 | Antes del hito 10 y los bordes: los hitos como camino, el hito 10 sin frentes, un frente sin ruta, errores, ancho chico | pendiente |

## Log de iteraciones
(todavía ninguna)

### MA-I1 — La ruta en el framework, su lector y su control
- **Leer antes:** `diseno-tecnico.md` › El formato y El framework y el control.
- **Hecho:** `src/main/core/ruta.ts` (lee `## Ruta`: las tres marcas, las ramas, los códigos escondidos del texto, lo que no entiende como «otro»); la regla `ruta` del control (marca o línea que no entiende, rama sin paso, `Q-n` o `T-n` que no existe, frente en curso sin ruta); el framework: la plantilla del `estado.md` de un frente, `SKILL.md` (› La ruta de un frente, El Mapa, El control), `referencias/modulos.md` y `10-operacion.md`. La ruta escrita en los nueve frentes; T-34, T-37, T-38, T-43 y T-44 con su frente (estaban sin `Frente:`).
- **Criterios verificados:** el control sobre este repo, sin avisos; `pnpm test` (805 pruebas), `pnpm typecheck` y `pnpm lint` sin errores.
- **Pruebas:** `tests/ma1-ruta.test.ts` (el lector con cada marca, ramas, códigos y líneas raras; el control con cada aviso).

- 2026-11-17 — Paso 2 cerrado: Q-199 a Q-201 → D-141 a D-143. Paso 4: `ux.md` escrita y las maquetas al día (`mapa-b.html` rehecha con los datos de hoy; `mapa-hitos.html` nueva); el control y la prueba de estilos, sin avisos.

## Próximo paso
MA-I2: el Mapa nuevo en operación. Cambiar `MapaProyecto` y `mapaDe` (frentes con su ruta, «Aprobado, sin lugar», «Por empezar»), rehacer `Mapa.tsx` con la barra y el camino, pasar la pieza Camino a `piezas.css`, y sacar lo que deja de mostrarse (D-141). Con sus pruebas, capturas y la prueba del usuario como `Q-n`.
**Leer antes:** `diseno-tecnico.md` › Lo que lee Iridium; `ux.md` › MA-1 a MA-4, MA-6 a MA-9 y W-7; la maqueta `diseno/pantallas/mapa-b.html`; `src/main/app/mapa.ts` y `src/renderer/secciones/proyecto/Mapa.tsx`.
