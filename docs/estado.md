# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-18
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
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10); repo público (D-132), falta publicar una versión al día (Q-185) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3: tandas 1 a 7 y 9 probadas; la 10, Revisión, espera Q-213; sigue Docs; D-151) | en curso |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va al cerrar Diseño, D-102, D-151) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; MA-I3 probada en Q-204, calidad el 2026-11-18) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | 7. Construcción (AR-I1 y AR-I2 hechas; espera la prueba de una noche, Q-210) | en curso |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Diseño y Orden, D-151; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (T-80) | sección | 1. Propuesta (detrás de Plantillas, D-148) | pendiente |

## En qué estamos ahora
**Frente activo: Arranque** (T-70, elegido en Q-205): Iridium abre sola el período de 5 horas con trabajo listo (D-135). AR-I1 y AR-I2 hechas el 2026-11-18: arranca solo y cuenta lo que hizo (el aviso «Mientras no estabas», el detalle del uso y la línea de la conversación). Espera tu prueba de una noche (Q-210). Mientras, se terminan Diseño y Orden (D-151, Q-211): **Diseño** pasó Skills (probada en Q-212) y Revisión (DI-I3, tanda 10; espera Q-213) y sigue sección por sección; al cerrar, Orden mide la calidad sobre la interfaz negra. Plantillas y Abrir, después.
El Mapa terminó el 2026-11-18. Ideas, el 2026-11-17; T-76 (miniatura de un enlace) y T-78 (el estado «implementada») siguen sin evaluar; T-80 aprobada (D-148): frente Abrir, detrás de Arranque. T-81 aprobada (D-150): frente Plantillas, detrás de Diseño y Orden (D-151). Los avisos de `pnpm audit`, en T-79.
En pausa: Orden (su paso 8 va al cerrar Diseño). Compartir: falta publicar una versión al día (Q-185).
Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-185 — Publicá una versión al día y pasale el .zip a la otra persona**
  Tipo: tarea · Frente: Compartir
  Contexto: D-132. El repo ya es público: no hace falta invitarla. La última versión publicada es del 4 de noviembre; las que publiques desde ahora le llegan solas (las mira al abrir y cada seis horas, y entran al cerrar Iridium). Tu Iridium no se actualiza desde GitHub.
  - [ ] Con lo que querés compartir ya en tu Iridium (Armar), en Scripts toqué **Publicar la versión para compartir** y terminó sin error
  - [ ] Le pasé el enlace `github.com/LlanosLautaro/Iridium/releases/latest`: bajó el `.zip`, lo descomprimió y abrió `Iridium\win-unpacked\Iridium.exe`
  - [ ] Abajo no le apareció ningún aviso de GitHub (ni «iniciá sesión» ni «sin acceso»)
- **Q-210 — Probá el arranque una noche**
  Tipo: prueba · Frente: Arranque
  Contexto: `modulos/arranque/estado.md` › Log de iteraciones (AR-I1, AR-I2). Antes, que tu Iridium tenga la versión de hoy (Actualizar). La PC no tiene que suspenderse: si se suspende, lo hace al despertar.
  - [ ] En Ajustes › IA prendí «Abrir el período de Claude» con la hora que elegí y dejé Iridium abierta toda la noche, con al menos un proyecto con respuestas mías sin procesar
  - [ ] A la mañana, al volver, estaba el aviso «Mientras no estabas» con el proyecto y la hora; Abrir me llevó al proyecto y Listo lo cerró
  - [ ] La conversación de ese proyecto empieza con «Continúa con el proyecto.» y debajo del título dice «la empezó Iridium a las…» (entero al pasar el mouse)
  - [ ] Tocando el uso (abajo a la derecha) dice «Último arranque: …» y, si hubo otros, se ven con «Los N anteriores de la semana»
  - [ ] Al cerrar y abrir Iridium, el aviso no vuelve a aparecer
- **Q-213 — Probá Revisión con el diseño nuevo**
  Tipo: prueba · Frente: Diseño
  Contexto: `modulos/diseno/estado.md` › Log de iteraciones (DI-I3, tanda 10). Antes, Actualizar para tener la versión de hoy. Comparala con la maqueta en Diseño › Pantallas › Revisión. Los filtros cambian de nombre: Nuevos, Anotados, Hechos y Todos.
  - [ ] En un proyecto con comentarios, Revisión muestra cada uno como en la maqueta: la captura, «R-n · fecha», lo que dijiste y dónde
  - [ ] Al pasar el mouse por uno nuevo aparece «Mandar a la IA», y al tocarlo la fila dice cómo salió
  - [ ] La «i» de arriba muestra la ayuda de F8 y cuándo se conectó la extensión
  - [ ] Un clic en un comentario abre el detalle con la captura grande, Dónde e Historia; Atrás vuelve a la lista
  - [ ] En uno hecho, Reabrir deja escribir qué falta y lo pasa a Nuevos
  - [ ] En un proyecto sin comentarios dice «Sin comentarios» con «Pulsa F8…»
Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Diseño, DI-I3 tanda 11: pasar Docs a la maqueta y a las piezas.
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso y lo que pide.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
