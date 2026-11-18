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
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3: tandas 1 a 7 probadas; la tanda 8, el bloc de Ideas, sin probar: lo reemplaza el frente Ideas, D-128, Q-174) | en pausa |
| Ideas (`modulos/ideas/estado.md`) | sección | en operación (con el hito 10; ID-I4 probada en Q-198, calidad el 2026-11-17) | hecho |
| Orden (`modulos/orden/estado.md`) | sección | 8. Calidad (OR-I4 probada en Q-146; el paso 8 espera el rediseño, D-102) | en pausa |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |
| Mapa (`modulos/mapa/estado.md`) | sección | en operación (con el hito 10; MA-I3 probada en Q-204, calidad el 2026-11-18) | hecho |
| Arranque (`modulos/arranque/estado.md`) | sección | 7. Construcción (AR-I1 y AR-I2 hechas; espera la prueba de una noche, Q-210) | en curso |
| Plantillas (T-81) | plugin (el framework) | 1. Propuesta (detrás de Arranque, D-150; la primera pieza, las pruebas sin ventanas, y queda en pausa) | pendiente |
| Abrir (T-80) | sección | 1. Propuesta (detrás de Plantillas, D-148) | pendiente |

## En qué estamos ahora
**Frente activo: Arranque** (T-70, elegido en Q-205): Iridium abre sola el período de 5 horas con trabajo listo (D-135). AR-I1 y AR-I2 hechas el 2026-11-18: arranca solo y cuenta lo que hizo (el aviso «Mientras no estabas», el detalle del uso y la línea de la conversación). Espera tu prueba de una noche (Q-210). Qué frente a medio cerrar va primero (Diseño, Orden o seguir con Plantillas), en Q-211.
El Mapa terminó el 2026-11-18. Ideas, el 2026-11-17; T-76 (miniatura de un enlace) y T-78 (el estado «implementada») siguen sin evaluar; T-80 aprobada (D-148): frente Abrir, detrás de Arranque. T-81 aprobada (D-150): frente Plantillas, piezas por tipo de app que empiezan por las pruebas sin ventanas; va antes de Abrir. Los avisos de `pnpm audit`, en T-79.
En pausa: Diseño (DI-I3, tandas 1 a 7 probadas; la 8 la reemplazó Ideas) y Orden (su paso 8 espera el rediseño). Compartir: falta publicar una versión al día (Q-185).
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
- **Q-211 — ¿Qué frente a medio cerrar atacamos primero?**
  Tipo: decisión · frena
  Contexto: pediste atacar los frentes a medio cerrar. Arranque (Q-210) y Compartir (Q-185) solo esperan tu prueba o tarea. Diseño está a medio pasar al código (DI-I3: faltan Skills, Revisión, Docs, Archivos, Git, Scripts y Ajustes, más T-58, T-53 y DI-I4), y Orden solo espera su paso 8 (Calidad), que D-102 dejó detrás del rediseño para no medir una interfaz que va a cambiar. Terminar Diseño destraba Orden: cierra dos frentes de una.
  Opciones: A) Diseño completo: las secciones que faltan, de a una tanda (Skills primero), y después Orden mide todo (recomendada: cierra los dos frentes y la app queda pareja) · B) Diseño recortado: Skills y T-58, DI-I3 por hecha, DI-I4 en pausa, y enseguida Orden (más rápido; las secciones de uso raro quedan con el estilo de antes) · C) Seguir el plan: Plantillas primero (D-150), Diseño y Orden después

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Según Q-211: con A o B, Diseño retoma DI-I3 por la tanda 9 (Skills: `docs/diseno/pantallas/skills.html` al código); con C, Plantillas (T-81) y su propuesta (paso 1). Arranque espera Q-210.
**Leer antes:** con A o B, `modulos/diseno/estado.md` › Próximo paso y lo que pide; con C, `decisiones.md` › D-150 y D-072, `trabajo.md` › T-81.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
