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

## En qué estamos ahora
**Sin frente activo:** espera Q-205 (qué sigue). El Mapa terminó (2026-11-18): el camino de pasos por frente reemplazó al de antes, probado (Q-203, Q-204) y con su calidad (`modulos/mapa/estado.md` › Calidad); T-71 hecho.
Ideas terminó el 2026-11-17; T-76 (miniatura de un enlace) y T-78 (el estado «implementada») siguen sin evaluar. Los avisos de `pnpm audit`, en T-79.
En pausa: Diseño (DI-I3, tandas 1 a 7 probadas; la 8 la reemplazó Ideas) y Orden (su paso 8 espera el rediseño). Compartir: falta publicar una versión al día (Q-185).
Chat nuevo por tamaño y tiempo (D-123, T-68): se compara hacia el 2026-11-29 con `tools/medir-uso.ts`.

## Preguntas abiertas
- **Q-185 — Publicá una versión al día y pasale el .zip a la otra persona**
  Tipo: tarea · Frente: Compartir
  Contexto: D-132. El repo ya es público: no hace falta invitarla. La última versión publicada es del 4 de noviembre; las que publiques desde ahora le llegan solas (las mira al abrir y cada seis horas, y entran al cerrar Iridium). Tu Iridium no se actualiza desde GitHub.
  - [ ] Con lo que querés compartir ya en tu Iridium (Armar), en Scripts toqué **Publicar la versión para compartir** y terminó sin error
  - [ ] Le pasé el enlace `github.com/LlanosLautaro/Iridium/releases/latest`: bajó el `.zip`, lo descomprimió y abrió `Iridium\win-unpacked\Iridium.exe`
  - [ ] Abajo no le apareció ningún aviso de GitHub (ni «iniciá sesión» ni «sin acceso»)

- **Q-205 — ¿Qué hacemos ahora que el Mapa terminó?**
  Tipo: decisión · frena
  Contexto: las dos van después del Mapa, sin orden entre ellas, y cada una es de una o dos iteraciones. T-70 (D-135): Iridium arranca el período de 5 horas con trabajo real, a eso de las 3 y al vencer cada ventana, con un proyecto que tenga respuestas tuyas esperando. T-75 (D-134): un tema propio, solo colores y letras, que las actualizaciones no pisan, editado con la IA desde Ajustes.
  Opciones: A) El arranque del período de 5 horas, T-70 (recomendada: rinde todos los días y es chico) · B) El tema propio, T-75 · C) Retomar Diseño, en pausa desde que Ideas reemplazó su tanda 8

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Con Q-205 respondida: abrir lo elegido (T-70 como frente nuevo, T-75 en el frente Apariencia y ajustes, o Diseño desde su DI-I3) con su ruta.
**Leer antes:** `respuestas/Q-205.md`; según lo elegido, `trabajo.md` › T-70 y `decisiones.md` › D-135, o `trabajo.md` › T-75 y `decisiones.md` › D-134, o `modulos/diseno/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
