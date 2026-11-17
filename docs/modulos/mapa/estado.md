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
| 7. Construcción | en curso (MA-I1 hecha; MA-I2 construida, espera la prueba en Q-203) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
UX aprobada (D-144) y diseño técnico cerrado (D-145). MA-I1 hecha: la ruta ya es parte del framework, con su lector y su control, y cada frente de Iridium tiene la suya. MA-I2 construida: el Mapa nuevo reemplazó entero al de antes (la barra de frentes, el camino con sus marcas y ramas, «Aprobado, sin lugar en la ruta» y «Por empezar»); espera la prueba del usuario en Q-203. Para poder sacar el Mapa viejo entero, antes del hito 10 ya se dibujan los hitos como camino: a MA-I3 le quedan los bordes.

## Ruta
- [x] Pensar para qué sirve el Mapa
- [x] Elegir la maqueta del camino por frente
- [x] Decidir dónde se escribe la ruta de cada frente
- [x] Definir qué muestra el Mapa y qué deja de mostrar
- [x] Dibujar cómo se usa, también antes del hito 10 y en «Por empezar»
- [x] Decidir cómo se escribe la ruta y cómo la lee Iridium
- [x] Enseñarle a la IA a escribir la ruta y a ubicar ahí cada idea aprobada, con su control (MA-I1)
- [x] Escribir la ruta de cada frente de Iridium (MA-I1)
- [x] Dibujar el camino de un frente, con sus ramas (MA-I2)
- [x] Elegir el frente desde la barra de arriba (MA-I2)
- [x] Ver lo que está por empezar y empezar un frente (MA-I2)
- [ ] Probar el Mapa nuevo con los frentes de Iridium (Q-203)
- [ ] Ver el camino de los hitos en un proyecto antes de operación (MA-I3)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `04-ux.md` › H-7 y W-7 (Mapa) | El Mapa pasa a ser el camino de pasos por frente: H-7 y W-7 remiten a `ux.md` | D-138, D-141 | sí (al aprobarse la UX, Q-202) |
| El framework (`recursos/plugins/iridium`) | La sección `## Ruta` en la plantilla, `SKILL.md`, `referencias/modulos.md` y `10-operacion.md`, con su lector y su control | D-139, D-145 | sí (MA-I1, 2026-11-17) |
| `05-arquitectura.md` › Modelo de datos | El Mapa lee la ruta de cada frente y arma «Por empezar» con `trabajo.md` | D-145 | sí (MA-I2, la fila «Frente y su ruta») |
| `modulos/diseno/ux.md` › Las piezas | La pieza Camino (PZ-15) | D-145 | sí (MA-I2) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| MA-I1 | La ruta en el framework, su lector y su control, y la ruta de cada frente de Iridium | hecho (2026-11-17; sin prueba del usuario: no cambia nada que se vea) |
| MA-I2 | El Mapa nuevo en operación: la barra de frentes, el camino con sus marcas, ramas y plegados, «Aprobado, sin lugar», «Por empezar» y la pieza Camino | en curso (construida; espera la prueba del usuario, Q-203) |
| MA-I3 | Los bordes que quedan: el Recuadro de error de un frente que no se puede leer (MA-12), las maquetas `mapa-b.html` y `mapa-hitos.html` con la pieza Camino, y la prueba en un proyecto antes del hito 10 (los hitos como camino, el hito 10 sin frentes, un frente sin ruta y el ancho chico ya entraron en MA-I2) | pendiente |

## Log de iteraciones
(todavía ninguna)

### MA-I2 — El Mapa nuevo en operación
- **Leer antes:** `diseno-tecnico.md` › Lo que lee Iridium; `ux.md` › MA-1 a MA-9 y W-7; la maqueta `diseno/pantallas/mapa-b.html`.
- **Hecho:** `MapaProyecto` nuevo (`compartido/puente.ts`: el hito, los frentes con su camino, «Por empezar» y, antes del hito 10 o sin frentes, los hitos como camino); `app/mapa.ts` rehecho (la ruta de cada frente o, sin ella, los pasos del método; «Te espera» con la pregunta abierta de la línea; el paso con su iteración lleva a su sección); `core/ruta.ts › listasDelMapa` («Aprobado, sin lugar en la ruta», «Por empezar» y «Sin frente», con lo abierto de `trabajo.md`; el trabajo que nombra la fila del frente o su línea **Tipo:** es el frente mismo); `Mapa.tsx` rehecho (la barra con las flechas y la pestaña recordada en la vista del proyecto, el camino con los hechos plegados, Empezar este frente con su cita); la pieza Camino (PZ-15) en `piezas.css` y en la hoja de las maquetas. Se fue lo que dejó de mostrarse (D-141). Arreglado de paso: el texto de un paso ya no pega el punto de «.zip» a la palabra de antes, y Diseño nombra su trabajo de origen (T-5) en su línea **Tipo:**.
- **Criterios verificados:** MA-1 a MA-4, MA-6 a MA-9 con Vitest y Playwright; MA-5 (antes del hito 10) en lo básico. `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm e2e` sin errores.
- **Pruebas:** `tests/ma2-mapa.test.ts` (el caso de uso con carpetas temporales: la barra, las marcas, las ramas, «Te espera», la iteración, sin lugar, «Por empezar», un frente que se abre, uno sin ruta); `tests/e2e/ma2-mapa.spec.ts` (la app con el motor falso, con capturas `ma2-mapa-*.png`: el frente activo, en pausa, todo hecho, «Te espera» a la Bandeja, «Por empezar» con Empezar este frente, el ancho chico); `i4-tres-paneles` e `i8-frentes` al día con los hitos como camino.
- **Pendiente:** la prueba del usuario (Q-203).

### MA-I1 — La ruta en el framework, su lector y su control
- **Leer antes:** `diseno-tecnico.md` › El formato y El framework y el control.
- **Hecho:** `src/main/core/ruta.ts` (lee `## Ruta`: las tres marcas, las ramas, los códigos escondidos del texto, lo que no entiende como «otro»); la regla `ruta` del control (marca o línea que no entiende, rama sin paso, `Q-n` o `T-n` que no existe, frente en curso sin ruta); el framework: la plantilla del `estado.md` de un frente, `SKILL.md` (› La ruta de un frente, El Mapa, El control), `referencias/modulos.md` y `10-operacion.md`. La ruta escrita en los nueve frentes; T-34, T-37, T-38, T-43 y T-44 con su frente (estaban sin `Frente:`).
- **Criterios verificados:** el control sobre este repo, sin avisos; `pnpm test` (805 pruebas), `pnpm typecheck` y `pnpm lint` sin errores.
- **Pruebas:** `tests/ma1-ruta.test.ts` (el lector con cada marca, ramas, códigos y líneas raras; el control con cada aviso).

- 2026-11-17 — Paso 2 cerrado: Q-199 a Q-201 → D-141 a D-143. Paso 4: `ux.md` escrita y las maquetas al día (`mapa-b.html` rehecha con los datos de hoy; `mapa-hitos.html` nueva); el control y la prueba de estilos, sin avisos.

## Próximo paso
Con Q-203 respondida: si algo falla, arreglarlo en MA-I2; si está bien, MA-I2 probada y sigue MA-I3 (el Recuadro de error de MA-12, las maquetas con la pieza Camino y la prueba en un proyecto antes del hito 10).
**Leer antes:** `respuestas/Q-203.md` (o la respuesta en el chat); para MA-I3, `ux.md` › MA-5, MA-12 y W-7 › Estados, y `src/renderer/secciones/proyecto/Mapa.tsx`.
