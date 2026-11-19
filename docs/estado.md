# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-19
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
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10); repo público (D-132), versión al día publicada (Q-185) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3: tandas 1 a 7 y 9 a 11 probadas; retoma con Archivos al cerrar Abrir, D-153) | en pausa |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 va al cerrar Diseño, D-102, D-151) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; los frentes archivados, R-91, probados en Q-215) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | 7. Construcción (AR-I1 y AR-I2 hechas; espera la prueba de una noche, Q-210) | en curso |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Diseño y Orden, D-151; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (`modulos/abrir/estado.md`) | sección | 7. Construcción (AB-I1 y AB-I2 hechas; las pruebas esperan cómo marcar tus proyectos, Q-219) | en curso |

## En qué estamos ahora
**Frente activo: Abrir** (T-80, D-153): **Ejecutar Alfa** en la tarjeta y en el proyecto (AB-I1) y las apps de escritorio que se arman solas, sin IA, de a una y escondidas, con «Actualizando…» o «No se pudo actualizar» en la tarjeta y la sección **Este proyecto** en Ajustes (AB-I2). La prueba de AB-I1 (Q-218) no mostró el botón porque ningún proyecto tenía la marca en `scripts.md`; Iridium ya la tiene. Cómo marcar los tuyos, Q-219; después, una sola prueba de las dos.
**Arranque** (D-135) espera tu prueba de una noche (Q-210). **Diseño** quedó en pausa entre tandas (Skills, Revisión y Docs probadas): retoma con Archivos al cerrar Abrir; después Orden mide la calidad y sigue Plantillas (D-151, D-150).
El Mapa archiva los frentes sin nada por hacer (D-152, probado en Q-215). Ideas sin evaluar: T-76 y T-78. Los avisos de `pnpm audit`, en T-79. Compartir: versión al día publicada y abierta por la otra persona (Q-185).
Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-210 — Probá el arranque una noche**
  Tipo: prueba · Frente: Arranque
  Contexto: `modulos/arranque/estado.md` › Log de iteraciones (AR-I1, AR-I2). Antes, que tu Iridium tenga la versión de hoy (Actualizar). La PC no tiene que suspenderse: si se suspende, lo hace al despertar.
  - [ ] En Ajustes › IA prendí «Abrir el período de Claude» con la hora que elegí y dejé Iridium abierta toda la noche, con al menos un proyecto con respuestas mías sin procesar
  - [ ] A la mañana, al volver, estaba el aviso «Mientras no estabas» con el proyecto y la hora; Abrir me llevó al proyecto y Listo lo cerró
  - [ ] La conversación de ese proyecto empieza con «Continúa con el proyecto.» y debajo del título dice «la empezó Iridium a las…» (entero al pasar el mouse)
  - [ ] Tocando el uso (abajo a la derecha) dice «Último arranque: …» y, si hubo otros, se ven con «Los N anteriores de la semana»
  - [ ] Al cerrar y abrir Iridium, el aviso no vuelve a aparecer
- **Q-219 — ¿Cómo se marca en tus proyectos lo que abre cada uno?**
  Tipo: decisión · Frente: Abrir
  Contexto: la prueba Q-218 falló porque ningún proyecto tenía la marca en su `scripts.md` (ni Iridium: ya la tiene y en la app aparece «Ejecutar Iridium»). Sin la marca, el botón no se muestra. En las apps de escritorio la marca dice también cómo se arman, y con eso se actualizan solas (AB-I2, prendida de entrada, D-154).
  Opciones: A) La IA de Iridium, desde este proyecto, marca ahora los tuyos que ya tienen algo para usar, y después te pido la prueba de nuevo (recomendada: se hace una vez y queda; los nuevos los marca su IA) · B) Un ítem «Marcar qué ejecuta» en el menú de la tarjeta, que se lo pide a la IA de ese proyecto (gasta un poco de uso cada vez) · C) Como está: cada proyecto lo marca su IA la próxima vez que trabaje en él
Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Abrir: con la respuesta de Q-219 (marcar tus proyectos), marcarlos y pedir una sola prueba de AB-I1 y AB-I2; sin respuesta todavía, el paso 8 (calidad) del frente.
**Leer antes:** `modulos/abrir/estado.md` › Próximo paso y lo que pide.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
