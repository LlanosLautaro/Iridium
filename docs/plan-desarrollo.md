# Plan de desarrollo del Centro de Desarrollo

> Adaptación de la guía `hitos-desarrollo-app` **solo para este proyecto** (ver D-004). La guía sigue valiendo entera; esto agrega trabajo a algunos hitos. Si algo de acá contradice la guía, manda este documento.

**Última actualización:** 2026-10-21

## Por qué hace falta
El Centro no es una app con un caso de uso central, sino una **plataforma** de largo plazo que junta varias áreas (proyectos, plan, preguntas, diseño, comentarios sobre la app, skills, puente con el celular) y con la que se va a desarrollar todo lo demás. El riesgo no es construir mal un área, sino una base que no aguante las áreas de mañana, o construir algo que ya existe y alcanzaba. Por eso se explora y se define a fondo antes de construir.

## La idea en una línea
Explorar a lo ancho, construir a lo angosto: muchas ideas pensadas y comparadas, pocas construidas al principio, y el puente PC–celular como primera pieza útil.

## Áreas
Las ocho ideas de `00-idea.md` se agrupan en áreas. Sirven para ordenar la exploración y la definición; cuáles terminan siendo módulos se decide en los hitos 2 y 5.

| Área | Ideas de `00-idea.md` |
|---|---|
| Motor y marco | 1 (app sobre Claude Code), 7 (skills locales) |
| Proyectos y plan | 2 (gestión de proyectos), 3 (control del plan) |
| Pendientes del usuario | 4 (formato de preguntas) |
| Diseño | 5 (Claude Design propio) |
| Revisión de la app | 6 (comentarios sobre la app en desarrollo) |
| Puente PC–celular | 8 (funcionalidad chica sobre LocalSend, D-005) |

## Qué cambia en cada hito

| Hito | Qué se agrega |
|---|---|
| 1 — Exploración | **Alternativas por área**, no solo del producto entero: interfaces para Claude Code y agentes (GUIs de escritorio, orquestadores), herramientas de plan y canvas (Miro, tldraw, Excalidraw), Claude Design y herramientas de design systems, inspectores con comentarios para apps web, y para el puente LocalSend, KDE Connect, Taildrop, Syncthing y ADB por Wi-Fi. Además, un **repaso de lo propio**: el gestor anterior y su visor, la guía de hitos, las skills, y cómo se trabajó el diseño en otra app. Para cada área: ¿alcanza lo que existe, se adapta, o vale construirlo? |
| 2 — Definición | Un **catálogo de casos de uso** amplio (30–50), agrupado por área. Para cada uno, qué le exige a la base. Se decide la relación con el gestor anterior (incorporarlo, reemplazarlo o convivir). El MVP sigue siendo chico. |
| 3 — Investigación | Lo que condiciona a la base: cómo se maneja Claude Code desde otra app (Agent SDK, `claude -p`, la política de uso con la suscripción), el formato de la documentación de la guía de hitos, y lo necesario para el puente (red local, VPN, instalar APK en Android). |
| 4 — UX | La UX del **marco**: cómo conviven los proyectos, el plan, la bandeja de pendientes, el chat con la IA y el celular. La de cada área va en su módulo. |
| 5 — Arquitectura | La base y cómo se le suman áreas se validan contra el catálogo. Spikes en los puntos de riesgo (manejar Claude Code desde la app). El envío al celular (D-005) queda disponible para que otro proyecto y otra app lo usen. |
| 6 — UI | Design system pensado para muchas áreas distintas que se sientan una sola app. |
| 7 en adelante | Cada área como **módulo** (ciclo reducido de la guía, en `docs/modulos/`). |

## El puente PC–celular puede ir primero
Por D-005 el puente ya no es un módulo: es LocalSend más un envío automático desde la PC. Se prueba con un spike en el hito 3 y, si funciona, se usa enseguida, sin esperar al resto de la plataforma. (Antes, D-003 lo preveía como módulo.)

## Cómo se evita el exceso de planificación
- El catálogo sirve para probar la base, no para especificar cada área: una o dos líneas por caso.
- Ningún área se diseña en detalle antes de que le toque construirse.
- Si un hito de planificación se estira sin decisiones nuevas, se cierra con huecos aceptados y se sigue.
