# Idea

**Fecha:** 2026-10-21
**Estado:** borrador para validar (Q-1 en `estado.md`)

## En una frase
Una plataforma de desarrollo para mí, pensada a largo plazo, donde yo dirijo con mis ideas y la IA es quien desarrolla de verdad y me orienta, y que junta en un solo lugar los proyectos, el plan de cada uno, el diseño, las preguntas pendientes y el puente con el celular.

## La idea contada libremente
"Quiero armar todo mi centro de desarrollo completo, con las cosas que ya hablamos sobre diseño, control del plan, formato de preguntas, etc., bien a fondo. Es una plataforma de desarrollo grande y completa, pensada a largo plazo para el desarrollo humano + IA, donde el humano dirige con su idea, pero el desarrollador real y quien orienta al humano es la IA." (2026-10-21)

Antes de construir nada, el proyecto sirve para **seguir explorando estas ideas** y ordenarlas.

Ideas que se juntan acá (anotadas en `Ideas/ideas.md` entre el 2026-10-13 y el 2026-10-21):

1. **App propia para dirigir el desarrollo con IA, sobre Claude Code** (2026-10-16). Programar con IA ya es más supervisar que escribir, y ni VS Code ni Claude Code o Codex en el escritorio dan control sobre la gestión de proyectos: los "proyectos" de Claude son un hilo que reparte hilos. Una app propia que use Claude Code por debajo (skills, conectores) pero con la gestión pensada para una persona. Ejemplo visto: una GUI de Claude Code hecha en Electron (r/electronjs).
2. **Gestión de proyectos.** El gestor anterior (extensión de VS Code) ya muestra las tarjetas, el estado, el hito y el próximo paso; el centro lo incorporaría o se apoyaría en él.
3. **Control del plan.** La guía de hitos llevada a algo visual: en qué etapa estoy, a dónde voy, qué falta. Diagramas y un canvas tipo Miro para la etapa de idea.
4. **Formato de preguntas estandarizado** (2026-10-16). Que lo que queda esperando de mí en cualquier proyecto llegue a un solo lugar, con un formato único y opciones para responder. Ya hay una primera versión: la guía de hitos usa `Q-n` en `estado.md` con respuestas en `docs/respuestas/`, y el visor del gestor anterior les muestra un campo de respuesta (formato del 2026-10-16). El centro lo llevaría más lejos.
5. **Diseño: un Claude Design propio y local**, en dos partes: una para crear patrones de diseño y guardar colecciones (design systems, ejemplos tomados de páginas que encuentre) y otra para prototipos, con comentarios en el lienzo (como se hizo con las direcciones visuales de otra app, Q-47 de otra app).
6. **Comentarios sobre la app en desarrollo** (2026-10-13). Para apps Electron y web: un atajo abre un panel con un selector de elementos (como el inspector) para dejar comentarios pegados a ellos. Se guardan en una carpeta del proyecto con la referencia de cada elemento (y quizás una captura), y el `CLAUDE.md` dice dónde están: basta con decirle a Claude "dejé comentarios en la app".
7. **Skills solo locales, compartidas entre todos los proyectos**, y adaptar skills públicas de Anthropic cuando valga la pena. El Centro es también el **gestor de skills** (2026-10-21): mientras se trabaje solo con Claude, se usan las skills generales instaladas en local, nada desde la nube; el usuario prefiere tener todo en la PC.
8. **Puente entre el celular y la PC** (nuevo, 2026-10-21). Algo sencillo, más que nada comunicación bidireccional: descargar en el celular los APK que se generan en la PC, mandar archivos y cosas de un lado al otro. Sería la base para después desarrollar mejores apps en la PC y enviarlas al celular.

## Problema que resuelve
Hoy el desarrollo está repartido: VS Code, Claude Code, la extensión del gestor anterior, las skills, la documentación en markdown de cada proyecto, Claude Design en la nube y los chats de claude.ai. La IA hace el trabajo, pero no hay un lugar pensado para que yo **dirija**: ver el plan de cada proyecto, saber qué espera de mí, responder, diseñar y revisar lo construido. Y no hay una forma simple de pasar lo que se construye en la PC al celular (un APK, un archivo) ni de mandar cosas del celular a la PC.

## Para quién
Para mí (uso personal). Es de largo plazo: la herramienta con la que voy a desarrollar todo lo demás.

## Por qué ahora
Ya hay varios proyectos en marcha con la guía de hitos, el gestor anterior funciona y el formato de preguntas existe: las piezas aparecieron por separado y empiezan a pedir un lugar común. Además, proyectos como otra app y otro proyecto necesitan hablar con el celular, y conviene que esa base exista antes.

## Escenas de uso
Para confirmar o corregir (son la reformulación de la IA):
- **A la mañana**: abro el centro, veo mis proyectos y, de un vistazo, todo lo que espera de mí (preguntas, pruebas, validaciones). Respondo ahí mismo, con opciones claras.
- **Una idea nueva**: la hablo con la IA sobre un canvas, ella propone cómo ordenarla y queda claro en qué etapa está y qué sigue.
- **Diseño**: guardo un estilo que vi en una página; la IA arma prototipos con mis colecciones y yo comento sobre el lienzo.
- **Revisar lo construido**: pruebo la app en desarrollo, señalo un botón y dejo "esto está muy apretado"; en la siguiente sesión la IA lo lee y lo arregla.
- **Al celular**: la IA termina un APK en la PC y me aparece en el celular para instalarlo; desde el celular mando un archivo o un texto a la PC.

## Relación con otros proyectos
- el gestor anterior: el centro lo incorpora, lo reemplaza o convive con él (a decidir en el hito 2).
- `Skills`: la guía de hitos, el formato de preguntas y las skills locales viven ahí; el centro los usa y los muestra.
- otro proyecto: también prevé hablar con el celular (la PC como servidor, VPN tipo Tailscale) y conectores por dispositivo. El puente PC–celular se superpone con eso (Q-3).
- otra app: "Compartir con otra app" desde el celular y otra app como servidor usarían el mismo puente.

## Ideas y pendientes
Las ideas y los pendientes están en `trabajo.md`.

## Portón
- [x] Hay una frase que resume la idea y el usuario la reconoce como suya (Q-1).
- [x] Está claro el problema que resuelve y para quién.
- [x] Las ideas sueltas quedaron registradas sin compromiso (hoy en `trabajo.md`).
