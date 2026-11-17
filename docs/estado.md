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
| Mapa (`modulos/mapa/estado.md`) | sección | 7. Construcción (MA-I1 hecha; MA-I2 construida, espera Q-203) | en curso |

## En qué estamos ahora
**Frente activo: Mapa** (D-140, T-71). La UX quedó aprobada (Q-202 → D-144) y el diseño técnico, cerrado (D-145: la ruta es una lista de casillas con tres marcas, y lo que está por empezar se calcula con `trabajo.md`). MA-I1 hecha: la ruta entró al framework con su lector y su control, y cada frente de Iridium tiene la suya. MA-I2 construida: el Mapa nuevo reemplazó al de antes (una pestaña por frente, el camino de cada uno con lo que sigue resaltado, lo aprobado sin lugar en la ruta y «Por empezar»); antes del hito 10, los hitos como camino. Espera tu prueba en Q-203; después, MA-I3 (los bordes).
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

- **Q-203 — Probá el Mapa nuevo con los frentes de Iridium**
  Tipo: prueba · Frente: Mapa
  Contexto: MA-I2 (D-141, D-144). Primero Armar. El Mapa ya no muestra el Próximo paso ni la fila de hitos: muestra el camino de pasos de cada frente. Lo que no anda, contalo en tus palabras o con una captura.
  - [ ] En el Mapa de Iridium (Ctrl+2) arriba dice «Hito 10 · Operación», y debajo hay una pestaña por frente, con Mapa primero y «Por empezar» con su número a la derecha
  - [ ] En Mapa se ven el último paso hecho, lo que sigue y lo que viene; «Probar el Mapa nuevo…» lleva «Te espera» en ámbar y un clic ahí me llevó a la Bandeja
  - [ ] Un clic en «N hechos antes» desplegó lo de antes y otro clic lo plegó
  - [ ] Un clic en «Enseñarle a la IA a escribir la ruta…» abrió su sección en Docs; con Atrás volví al Mapa en la misma pestaña
  - [ ] En Diseño y en Orden el paso que sigue dice «En pausa» en ámbar; en Diseño se ven las ramas con su codo, y al desplegar lo de antes, una tachada (lo descartado)
  - [ ] Con un clic en una pestaña y después las flechas ← → del teclado pasé de un frente a otro
  - [ ] En «Por empezar» está Capacidades con «Empezar este frente» y debajo «Sin frente», con los títulos largos completos; «Empezar este frente» lo dejó citado arriba del campo de la conversación, sin enviar, y la ✕ lo sacó
  - [ ] Pasé a otra sección del proyecto y volví: el Mapa seguía en la pestaña que dejé

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Frente **Mapa**: espera Q-203 (la prueba de MA-I2). Con la respuesta, lo que falle se arregla en MA-I2; si está bien, sigue MA-I3 (los bordes).
**Leer antes:** `modulos/mapa/estado.md` › Próximo paso (dice qué leer).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
