# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-20
**Nivel de protección:** P2 — personal conectado (ver `perfil-proyecto.md`)

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | hecho | `00-idea.md` |
| 1 | Exploración | hecho | `01-exploracion.md` |
| 2 | Definición y alcance | hecho | `02-definicion.md` |
| 3 | Investigación de dominio | hecho | `03-investigacion.md` |
| 4 | UX | hecho | `04-ux.md` |
| 5 | Arquitectura técnica | hecho | `05-arquitectura.md` |
| 6 | UI | hecho | `06-ui.md` |
| 7 | Construcción | hecho | `07-construccion.md` |
| 8 | Pruebas y calidad | hecho (portón aprobado en Q-108, 2026-11-02) | `08-calidad.md` |
| 9 | Lanzamiento | hecho (portón aprobado en Q-111, 2026-11-02) | `09-lanzamiento.md` |
| 10 | Operación | en curso | `10-operacion.md` |

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Revisión de la app (`modulos/revision/estado.md`) | producto hermano | en operación (con el hito 10) | hecho |
| Skills (`modulos/skills/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10; CO-I8, las piezas de cada versión, probada en Q-225) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3: tandas 1 a 7 y 9 a 11 probadas; la 12, Archivos, espera Q-228; vuelve por D-162) | en curso |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va al cerrar Diseño, D-102, D-151) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | 7. Construcción (AR-I1 y AR-I2 hechas; la primera noche falló, arreglado; espera otra, Q-227) | en curso |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Diseño y Orden, D-151; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (`modulos/abrir/estado.md`) | sección | 7. Construcción (AB-I1 a AB-I3 probadas; el paso 8 y la otra PC, T-87, al cerrar DI-I3, D-162) | en pausa |

## En qué estamos ahora
**Frente activo: Diseño** (vuelve por D-162, a tu pedido): las secciones pasan a las piezas, tanda por tanda. Con la tanda 12 Archivos es la de la maqueta: el árbol con las letras de Git, la ruta arriba y **Abrir en VS Code** (Q-228). Siguen Git, Scripts y Ajustes; la lupa para buscar un archivo, en T-90.
**Abrir** (D-153) queda en pausa con sus tres iteraciones probadas: el paso 8 y la otra PC (T-87, D-160) vuelven al cerrar DI-I3. **Git al día con GitHub** (D-159, T-88): tu prueba en las dos PC, Q-224.
**Arranque** (D-135): la primera noche no arrancó; arreglado, espera otra noche (Q-227). Después de Diseño, Orden mide la calidad y sigue Plantillas (D-151, D-150).
Ideas sin evaluar: T-76, T-78 y T-89. Los avisos de `pnpm audit`, en T-79. Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-224 — Probá Git al día entre tus dos PC**
  Tipo: prueba
  Contexto: D-159 (Git al día con GitHub). Antes, Iridium con la versión de hoy en las dos PC: acá, Actualizar; en la otra, la versión publicada (`scripts.md` › Publicar la versión para compartir).
  - [ ] En la otra PC respondí una pregunta de un proyecto y en Git toqué «Commit y subir» sin escribir mensaje: el commit se llamó «Respuesta a Q-…» y quedó subido
  - [ ] En esta PC, al entrar a ese proyecto, la respuesta ya estaba y Git decía «Trajo 1 commit de GitHub»
  - [ ] El proyecto que mostraba cosas viejas muestra lo último
  - [ ] Sincronizar, con todo al día, dijo «Ya estaba al día.»
- **Q-227 — Probá el arranque otra noche**
  Tipo: prueba · Frente: Arranque
  Contexto: la primera noche (Q-210) no arrancó porque a las 3 el período seguía abierto y se perdía el intento de cuando vence; ya está arreglado (`modulos/arranque/estado.md` › Arreglo tras Q-210). Antes, Actualizar. Si a la hora elegida el período está abierto, arranca 5 minutos después de que venza.
  - [ ] Dejé Iridium abierta toda la noche con el arranque prendido y al menos un proyecto con una respuesta mía sin procesar
  - [ ] A la mañana estaba el aviso «Mientras no estabas» con el proyecto y la hora; Abrir me llevó al proyecto y Listo lo cerró
  - [ ] La conversación de ese proyecto empieza con «Continúa con el proyecto.» y debajo del título dice «la empezó Iridium a las…»
  - [ ] Tocando el uso (abajo a la derecha) dice «Último arranque: …»
  - [ ] Al cerrar y abrir Iridium, el aviso no vuelve a aparecer
- **Q-228 — Probá Archivos con su forma nueva**
  Tipo: prueba · Frente: Diseño
  Contexto: DI-I3, tanda 12 (`modulos/diseno/estado.md` › tanda 12: Archivos). Antes, Actualizar. Entrá a Archivos de este proyecto.
  - [ ] El árbol se ve como la maqueta: el nombre del proyecto arriba, las carpetas con su flecha que gira al abrirlas
  - [ ] Los archivos cambiados sin commit tienen una letra a la derecha: A verde los nuevos, M amarilla los modificados
  - [ ] Al elegir un archivo, su ruta aparece arriba en gris junto a «Archivos» y al pasar el mouse dice cuántas líneas tiene
  - [ ] «Abrir en VS Code» abre VS Code con ese archivo
  - [ ] Desde un comentario de Revisión con archivo y línea, Archivos marca esa línea y «Abrir en VS Code» va a esa línea
  - [ ] En Skills, el detalle de una skill › Archivos se ve igual de limpio
Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Diseño, DI-I3 tanda 13: Git como la maqueta (procesar Q-228 si llegó).
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso y lo que pide.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
