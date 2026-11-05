# Propuesta del módulo: Orden

**Fecha:** 2026-11-05
**Tipo:** sección (atraviesa toda la app y la forma de trabajar; D-091)

## Qué problema resuelve
Iridium creció a parches: cada pedido se volvió una decisión y un arreglo puntual (van 90), y nadie volvió a mirar el conjunto. Se nota en tres frentes:

- **La UX se degradó.** `04-ux.md` ya no describe la app: es una pila de notas («Ajustada por D-041… por D-043… por D-044… Rehecha por D-041») sobre dibujos que «quedan como historia». Cada pantalla nueva se diseñó sola, sin una arquitectura de información que la ordene.
- **El contrato entre el usuario, la IA e Iridium tiene huecos.** Las `Q-n` casi siempre llegan bien, pero cuando no, nada lo avisa: la regla es un texto que la IA puede leer mal. Las ideas viven en dos sistemas que no se hablan, sin estado ni código (`10-operacion.md` › Crítica de la gestión de ideas). Las `Q-n` de un módulo van al `estado.md` general por regla de la skill de Iridium, así que no saben de qué frente son: Q-126 es de Compartir y aparece en el núcleo.
- **Dos reglamentos.** La guía de hitos dice cómo se desarrolla y la skill de Iridium cómo se ve en Iridium; se pisan en los formatos y hay que mantener los dos.

## Cómo se ataca (el plan)
En este orden, porque la UX de Pendientes e Ideas depende del modelo:

1. **Frenar funciones nuevas.** Los comentarios de la Revisión (`R-n`) y los ajustes nuevos se anotan y se resuelven por tandas en una ronda de UX, no de a uno. Las pruebas que ya están pedidas (Q-118, Q-130) y la invitación (Q-126) siguen.
2. **Auditoría** (paso 3): la UX de la app real, pantalla por pantalla, con capturas de la app armada y las skills de diseño; y la forma de trabajo: los errores repetidos en las `Q-n` de este y los otros proyectos, dónde se pierden cosas, qué se duplica entre la guía y la skill.
3. **Un solo modelo** (paso 2, definición, con lo que dé la auditoría): todo lo que se sigue — pregunta, idea, pendiente de la IA, comentario — tiene código, frente y estado. Los frentes terminados siguen existiendo «en operación» y reciben sus pendientes. Las ideas: un formato y un lugar por proyecto que no cambia con el hito, con estado (nueva · aceptada · hecha · descartada), código propio (no `I-n`, que es de las iteraciones), anotables sin la IA y visibles todas juntas (Q-131 B).
4. **Un solo marco** (D-092): la guía de hitos, la skill de Iridium (y lo de la ficha de `gestor-proyectos`) se funden en el marco de Iridium, con **un control**: Iridium marca lo que no sigue el formato y se lo devuelve a la IA al cerrar la sesión. Cada error nuevo corrige la regla y el control, nunca un parche.
5. **La UX sobre ese modelo** (pasos 4 y 6): `04-ux.md` reescrito como la app de hoy, sin capas; primero la arquitectura de información, después las pantallas. Ya pedido: Pendientes agrupados por frente, con filtros «Todos · Núcleo · Compartir…» y su cuenta arriba (una pestaña por frente sola escondería lo que frena en otro).
6. **Construir, probar y armar** (7 → 9). La guía suma una ronda de UX cada tanto en operación, para que no vuelva a pasar.

Recién después, Diseño y Capacidades (D-079, ahora detrás de este frente).

## Por qué es un módulo y no una funcionalidad
- [x] Dominio propio que requiere investigación: la auditoría y el modelo.
- [x] Flujos de UX propios: rehace la arquitectura de información.
- [x] Ritmo de avance propio: frente con prioridad máxima.
- [ ] Se activa, instala o distribuye por separado.

## Qué no es
No es el módulo Diseño: Diseño es una herramienta para diseñar los otros proyectos (biblioteca, lienzo, prototipos). Este frente arregla la UX y la forma de trabajo de Iridium; Diseño después aprovecha lo que salga.
