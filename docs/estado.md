# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-17
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
| Mapa (`modulos/mapa/estado.md`) | sección | 2. Definición (espera Q-199 a Q-201) | en curso |

## En qué estamos ahora
**Frente activo: Mapa** (D-140, T-71). Se abrió su carpeta (`modulos/mapa/`) con la propuesta cerrada en el chat (D-137 a D-139) y la definición escrita: el camino de pasos concretos de un frente a la vez, «Por empezar» al final, la ruta en el `estado.md` de cada frente y lo que deja de mostrar el Mapa de hoy. Esperan tus respuestas: Q-199 (si la definición va así), Q-200 (qué muestra antes del hito 10) y Q-201 (de dónde sale «Por empezar»). El estado del Mapa ya tiene su propia «Ruta», como muestra del formato.
Ideas terminó (2026-11-17): probada y con su calidad hecha; T-76 (miniatura de un enlace) y T-78 (el estado «implementada») siguen sin evaluar. Los avisos de `pnpm audit`, en T-79.
En pausa: Diseño (DI-I3, tandas 1 a 7 probadas; la 8 la reemplazó Ideas) y Orden (su paso 8 espera el rediseño). Compartir: falta publicar una versión al día (Q-185). Después del Mapa, sin orden entre ellos: el tema propio (T-75, D-134) y el arranque del período de 5 horas (T-70, D-135).
Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-185 — Publicá una versión al día y pasale el .zip a la otra persona**
  Tipo: tarea · Frente: Compartir
  Contexto: D-132. El repo ya es público: no hace falta invitarla. La última versión publicada es del 4 de noviembre; las que publiques desde ahora le llegan solas (las mira al abrir y cada seis horas, y entran al cerrar Iridium). Tu Iridium no se actualiza desde GitHub.
  - [ ] Con lo que querés compartir ya en tu Iridium (Armar), en Scripts toqué **Publicar la versión para compartir** y terminó sin error
  - [ ] Le pasé el enlace `github.com/LlanosLautaro/Iridium/releases/latest`: bajó el `.zip`, lo descomprimió y abrió `Iridium\win-unpacked\Iridium.exe`
  - [ ] Abajo no le apareció ningún aviso de GitHub (ni «iniciá sesión» ni «sin acceso»)

- **Q-199 — ¿La definición del Mapa va así?**
  Tipo: decisión · frena · Frente: Mapa
  Contexto: `modulos/mapa/definicion.md` › Must. Un frente a la vez desde la barra de arriba, el camino de pasos con sus marcas (hecho, el que sigue, «Te espera», en pausa, descartado), los hechos de antes plegados y «Empezar este frente», que lo cita en la conversación sin enviar. Un frente sin ruta todavía muestra los pasos del método con un aviso gris. En operación deja de mostrar la fila de hitos, el bloque del frente activo (Próximo paso, «En curso», «En tu bandeja»), las líneas «En espera» y «En operación» y «Lo último de la IA»: lo tuyo sigue en la Bandeja y en el «Te espera» de su paso.
  Opciones: A) Sí, va así (recomendada: es la maqueta que elegiste, sin el ruido que marcaste) · B) Sí, pero el Próximo paso del frente queda arriba del camino, en una línea · C) Sí, pero «Lo último de la IA» queda abajo
- **Q-200 — ¿Qué muestra el Mapa antes del hito 10?**
  Tipo: decisión · frena · Frente: Mapa
  Contexto: un proyecto que todavía no está en operación no tiene frentes: su camino son los hitos (0 a 9), que tienen nombres del método («Exploración», «Construcción»).
  Opciones: A) El camino son los hitos, sin pestañas: el actual es el que sigue y debajo, como rama, sus pasos o iteraciones con su objetivo (recomendada: sale de lo que ya existe, no gasta y en la construcción ya dice qué se hace) · B) Lo mismo, pero la IA escribe también una «Ruta» de pasos concretos para el hito en curso (más claro, unas líneas más en cada sesión) · C) Antes del hito 10 queda el Mapa de hoy; el nuevo, solo en operación
- **Q-201 — ¿De dónde sale «Por empezar»?**
  Tipo: decisión · frena · Frente: Mapa
  Contexto: un frente que espera y no tiene carpeta todavía no tiene `estado.md` donde escribir su ruta, y lo aprobado sin frente tampoco. Hoy serían Capacidades (T-28), el Puente PC–celular (T-8) y unas 20 cosas `pendiente` sin frente.
  Opciones: A) Sale solo de `trabajo.md`: cada frente que espera, con sus `T-n` abiertos como pasos; en «Sin frente», los `T-n` pendientes que no tienen frente, con su título (recomendada: no gasta y nunca queda vieja; los títulos largos bajan de renglón) · B) La IA escribe una lista «Por empezar» en `docs/modulos/README.md`, con nombres concretos y en orden (más clara, pero hay que mantenerla) · C) A ahora, y la IA repasa una vez esas 20 cosas para darles frente o descartarlas

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Frente **Mapa**: procesar Q-199 a Q-201 (cerrar `definicion.md` y registrar lo decidido) y hacer el paso 4, UX: las historias `MA-n` y cómo se ve cada caso, con la maqueta `mapa-b.html` al día, para que la apruebes en una `Q-n`.
**Leer antes:** `modulos/mapa/estado.md` y `modulos/mapa/definicion.md`; las respuestas Q-199 a Q-201; `04-ux.md` › H-7 y W-7.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
