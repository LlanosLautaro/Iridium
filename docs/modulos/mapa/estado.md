# Estado del módulo: Mapa

**Tipo:** sección (la sección Mapa de cada proyecto, rehecha; T-71)
**Última actualización:** 2026-11-19
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
| 7. Construcción | hecho (MA-I1 a MA-I3; la última, probada en Q-204) | este archivo |
| 8. Calidad | hecho (2026-11-18: las historias contra las pruebas y dos casos límite del lector arreglados; ver Calidad) | este archivo |
| 9. Lanzamiento | hecho (entra con Armar, como cada versión) | este archivo |

## En qué estamos ahora
UX aprobada (D-144) y diseño técnico cerrado (D-145). MA-I1: la ruta es parte del framework, con su lector y su control, y cada frente de Iridium tiene la suya. MA-I2 (probada en Q-203): el Mapa nuevo reemplazó entero al de antes. MA-I3 (probada en Q-204): el error de un frente que no se puede leer y el camino de los hitos antes de operación. **Módulo completo (2026-11-18):** la calidad está en la sección Calidad.

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
- [x] Probar el Mapa nuevo con los frentes de Iridium (MA-I2)
- [x] Avisar en su pestaña cuando falta el archivo de un frente (MA-I3)
- [x] Ver el camino de los hitos en un proyecto antes de operación (MA-I3)
- [x] Repasar cada historia contra sus pruebas y los casos límite
- [x] Archivar los frentes sin nada por hacer, con «Archivados» para verlos

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
| MA-I2 | El Mapa nuevo en operación: la barra de frentes, el camino con sus marcas, ramas y plegados, «Aprobado, sin lugar», «Por empezar» y la pieza Camino | hecho (2026-11-18; probada en Q-203) |
| MA-I3 | Los bordes que quedan: el Recuadro de error de un frente que no se puede leer (MA-12), las maquetas `mapa-b.html` y `mapa-hitos.html` con la pieza Camino, y la prueba en un proyecto antes del hito 10, junto con el clic en un paso hecho que lleva a su iteración, que en Q-203 quedó sin probar (los hitos como camino, el hito 10 sin frentes, un frente sin ruta y el ancho chico ya entraron en MA-I2) | hecho (2026-11-18; probada en Q-204) |

## Log de iteraciones
### En operación — 2026-11-18 — Los frentes archivados (R-91, D-152)
- **Hecho:** `Mapa.tsx`: un frente en uso sin nada que venga en su ruta ni trabajo aprobado sin lugar sale de la barra; el interruptor «Archivados» (la pieza Campo, en la Cabecera, con su cuenta y solo si hay alguno) los muestra después de los activos, en gris (`.barra-frentes .archivado`). Se recuerda en la vista del proyecto (`mapaArchivados`). Si todos están archivados y no hay nada por empezar, una línea gris lo dice.
- **Pruebas:** `tests/e2e/ma2-mapa.spec.ts` al día (Notas, en uso y con todo hecho, está archivada; con el interruptor aparece en gris; captura `ma2-mapa-archivados.png`). Las 8 del Mapa, `pnpm test` (846), `pnpm typecheck` y `pnpm lint`, sin errores.
- **Prueba:** Q-215, probada el 2026-11-19 (las tres casillas bien).

### MA-I3 — Los bordes
- **Leer antes:** `ux.md` › MA-5, MA-12 y W-7 › Estados.
- **Hecho:** un frente cuyo `estado.md` falta (la tabla «Módulos» lo nombra y ya empezó), está vacío o no tiene ni «Ruta» ni «Progreso» muestra en su pestaña un Recuadro de error que dice qué archivo y qué le falta, en lugar del camino; las otras pestañas siguen (`FrenteMapa.error`, `app/mapa.ts`). Las maquetas `mapa-b.html` y `mapa-hitos.html` dibujan el camino con la pieza Camino de `piezas.css` (se fueron sus estilos propios) y quedan «En la app» en `diseno/README.md`.
- **Criterios verificados:** MA-12 con Vitest y Playwright (el error en su pestaña; la ruta que cambia mientras se mira se redibuja sin cambiar de pestaña ni plegar lo desplegado); las maquetas, con capturas. `pnpm test` (817), `pnpm typecheck`, `pnpm lint`, la prueba de estilos y el control, sin errores.
- **Pruebas:** `tests/ma2-mapa.test.ts` › Los bordes del Mapa; `tests/e2e/ma2-mapa.spec.ts` › MA-12 (captura `ma3-mapa-error.png`).
- **Probada:** Q-204, el 2026-11-18, las tres casillas: los hitos como camino con el portón o las iteraciones como ramas, «Te espera» en ámbar y el clic en un paso hecho que abre su iteración.

### MA-I2 — El Mapa nuevo en operación
- **Leer antes:** `diseno-tecnico.md` › Lo que lee Iridium; `ux.md` › MA-1 a MA-9 y W-7; la maqueta `diseno/pantallas/mapa-b.html`.
- **Hecho:** `MapaProyecto` nuevo (`compartido/puente.ts`: el hito, los frentes con su camino, «Por empezar» y, antes del hito 10 o sin frentes, los hitos como camino); `app/mapa.ts` rehecho (la ruta de cada frente o, sin ella, los pasos del método; «Te espera» con la pregunta abierta de la línea; el paso con su iteración lleva a su sección); `core/ruta.ts › listasDelMapa` («Aprobado, sin lugar en la ruta», «Por empezar» y «Sin frente», con lo abierto de `trabajo.md`; el trabajo que nombra la fila del frente o su línea **Tipo:** es el frente mismo); `Mapa.tsx` rehecho (la barra con las flechas y la pestaña recordada en la vista del proyecto, el camino con los hechos plegados, Empezar este frente con su cita); la pieza Camino (PZ-15) en `piezas.css` y en la hoja de las maquetas. Se fue lo que dejó de mostrarse (D-141). Arreglado de paso: el texto de un paso ya no pega el punto de «.zip» a la palabra de antes, y Diseño nombra su trabajo de origen (T-5) en su línea **Tipo:**.
- **Criterios verificados:** MA-1 a MA-4, MA-6 a MA-9 con Vitest y Playwright; MA-5 (antes del hito 10) en lo básico. `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm e2e` sin errores.
- **Pruebas:** `tests/ma2-mapa.test.ts` (el caso de uso con carpetas temporales: la barra, las marcas, las ramas, «Te espera», la iteración, sin lugar, «Por empezar», un frente que se abre, uno sin ruta); `tests/e2e/ma2-mapa.spec.ts` (la app con el motor falso, con capturas `ma2-mapa-*.png`: el frente activo, en pausa, todo hecho, «Te espera» a la Bandeja, «Por empezar» con Empezar este frente, el ancho chico); `i4-tres-paneles` e `i8-frentes` al día con los hitos como camino.
- **Probada:** Q-203, el 2026-11-18. Siete de ocho casillas; la del clic en un paso con su iteración quedó sin marcar porque ese paso estaba entre los hechos plegados y la prueba no decía desplegarlos (lo verifica `ma2-mapa` en Playwright; se vuelve a pedir en MA-I3).

### MA-I1 — La ruta en el framework, su lector y su control
- **Leer antes:** `diseno-tecnico.md` › El formato y El framework y el control.
- **Hecho:** `src/main/core/ruta.ts` (lee `## Ruta`: las tres marcas, las ramas, los códigos escondidos del texto, lo que no entiende como «otro»); la regla `ruta` del control (marca o línea que no entiende, rama sin paso, `Q-n` o `T-n` que no existe, frente en curso sin ruta); el framework: la plantilla del `estado.md` de un frente, `SKILL.md` (› La ruta de un frente, El Mapa, El control), `referencias/modulos.md` y `10-operacion.md`. La ruta escrita en los nueve frentes; T-34, T-37, T-38, T-43 y T-44 con su frente (estaban sin `Frente:`).
- **Criterios verificados:** el control sobre este repo, sin avisos; `pnpm test` (805 pruebas), `pnpm typecheck` y `pnpm lint` sin errores.
- **Pruebas:** `tests/ma1-ruta.test.ts` (el lector con cada marca, ramas, códigos y líneas raras; el control con cada aviso).

- 2026-11-17 — Paso 2 cerrado: Q-199 a Q-201 → D-141 a D-143. Paso 4: `ux.md` escrita y las maquetas al día (`mapa-b.html` rehecha con los datos de hoy; `mapa-hitos.html` nueva); el control y la prueba de estilos, sin avisos.

## Calidad (paso 8, 2026-11-18)
**Historias.** Cada criterio de MA-1 a MA-12 tiene su prueba. A la app le faltaban cinco, que suma `tests/e2e/ma2-mapa.spec.ts` › Calidad del Mapa: antes del hito 10, la lista del portón como ramas con «Te espera» y, en el hito 10 sin frentes, la línea gris (MA-5, captura `ma8-mapa-porton.png`); Empezar este frente con la ✕ que saca la cita y el mensaje que sale con lo escrito (MA-7); con catorce frentes, la barra que se desplaza con las flechas y deja la elegida a la vista, y la pestaña recordada de un frente que se fue, que vuelve al activo (MA-3, captura `ma8-mapa-muchos.png`); un estado fuera del vocabulario, tal cual y en gris (MA-12). Lo demás ya lo cubrían `ma2-mapa` (Vitest y Playwright), `i4-tres-paneles` e `i8-frentes`. Que la IA ubique en la ruta una idea aprobada al cerrar su iteración (MA-8, MA-10) depende de la IA: lo pide el framework y el control avisa de un frente en curso sin ruta. Las pruebas del usuario: Q-203 y Q-204.

**Casos límite.** Probados: un `estado.md` borrado, vacío o sin ruta ni progreso (el error en su pestaña), la ruta que cambia mientras se mira, un frente que espera sin carpeta, fines de línea de Windows, una marca rara, una rama sin paso, una línea suelta. **Encontrado y arreglado** (`core/ruta.ts`, con su prueba en `tests/ma1-ruta.test.ts`): una rama con sangría de tabulación se leía como un paso más de la línea principal, sin aviso; ahora es una rama. Y un bloque de código dentro de «Ruta» sumaba sus líneas como pasos y mostraba las comillas como pasos raros; ahora se salta entero y el control avisa una vez. Ninguna ruta de Iridium los tenía.

**Seguridad (P2).** El Mapa solo lee: los `estado.md`, `trabajo.md` y las preguntas abiertas del proyecto. Lo único que hace es citar «Empezá el frente…» en la conversación, sin enviar. Sin dependencias nuevas.

**Accesibilidad y UI.** La barra es una lista de pestañas con su nombre («Frentes»), las flechas pasan de una a otra y el foco la sigue; «Te espera», los hechos plegados y cada paso son botones con su nombre; el error es un `alert`. La pieza Camino (PZ-15) está en `piezas.css` y el control de estilos pasa. Rendimiento: el Mapa de este proyecto (nueve frentes, 18 cosas en «Por empezar») se arma en unos 0,2 s.

**Verificado:** `pnpm test` (819), `pnpm typecheck`, `pnpm lint` y `pnpm e2e` (134 pasan).

## Próximo paso
Módulo completo. Lo que salga del uso va a `trabajo.md` con `Frente: Mapa`.
