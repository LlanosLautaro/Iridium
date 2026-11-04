# Product

<!-- impeccable:product-schema 1 -->

> Armado desde `docs/` (hito 6, aprobado por el usuario el 2026-10-23). La fuente es `docs/`: si cambia `docs/02-definicion.md`, `docs/04-ux.md` o `docs/perfil-proyecto.md`, se actualiza este archivo.

## Platform

web

App de escritorio para Windows hecha con Electron: la interfaz es web (React) dentro de una ventana propia. Debe sentirse una app de escritorio de Windows, no una página. Linux, quizás más adelante.

## Users

Un solo usuario: el dueño de la PC. Dirige varios proyectos de software propios que desarrolla la IA (Claude Code); él no programa ni revisa código, aunque tiene nociones. Usa el Centro en su PC, con tiempo, a lo largo de todo el día, a veces con varios proyectos trabajando a la vez. Su trabajo es decidir: saber qué proyecto lo espera, responder preguntas y pruebas, y conversar con la IA de cada proyecto.

## Product Purpose

Que el usuario dirija todos sus proyectos desde un solo lugar, sin saltar entre VS Code, el navegador y el visor de docs. Éxito: en menos de diez segundos sabe qué proyecto lo espera y qué lo frena; responde un pendiente en tres pasos o menos; conversa con la IA desde el Centro y no desde VS Code. Ver `docs/02-definicion.md` › Objetivo y › Criterios de éxito.

## Positioning

La IA desarrolla y el usuario dirige. La IA trabaja sola, sin pedir permisos ni quedarse esperando; lo que necesita del usuario lo deja escrito como pendiente (`Q-n`) y cierra su trabajo. El Centro gira alrededor de eso: lo que espera del usuario siempre está a la vista y se responde con el contexto adentro, sin buscar. Cada proyecto sigue una guía de hitos (de la idea a la operación) que el Centro dibuja como un mapa.

## Operating Context

- Proyectos: carpetas en la carpeta de proyectos, cada una con `docs/` (estado, decisiones, documentos por hito), una ficha `.proyecto.json` y un ícono SVG.
- La conversación con la IA de cada proyecto arranca con «Seguí»: la IA lee `estado.md` y sigue el **Próximo paso**.
- Varias sesiones de IA a la vez; el usuario cambia de proyecto sin cortarlas.
- Convive con el gestor anterior (extensión de VS Code del usuario), que sigue cubriendo scripts, fichas y abrir en VS Code durante el MVP.
- Códigos que aparecen en todo: `D-n` decisión, `Q-n` pendiente, `H-n` historia, `W-n` pantalla, `I-n` iteración; citas como `archivo.md` › Título.

## Capabilities and Constraints

MVP (`docs/02-definicion.md` › MVP en un párrafo):
- Vista general de proyectos: tarjetas con hito, estado del proyecto, pendientes y estado de la sesión de IA (trabajando, terminada, error).
- Vista de un proyecto: conversación con la IA al lado del mapa del plan y de los docs; **Seguí**, **Detener**, **Nueva**.
- Barra de sesiones y uso de la suscripción (ventana de 5 horas y semana) siempre a la vista; contexto usado de cada conversación.
- Avisos dentro de la app cuando una sesión que no está a la vista termina, deja preguntas o falla.
- Pendientes: las `Q-n` de todos los proyectos, agrupadas por proyecto, con el contexto citado adentro; responder decisiones con opciones y pruebas como lista.
- Mapa del plan: hitos como cajas dentro de cajas; cada caja lleva a su documento.

Pantallas y estados: `docs/04-ux.md` › Pantallas (W-1 a W-8). Arquitectura: `docs/05-arquitectura.md`.

Después del MVP: biblioteca de diseño, lienzo de prototipos, revisión de la app con comentarios, skills, puente con el celular.

Vocabulario de la interfaz: Proyectos, Pendientes, Seguí, Detener, Nueva, Responder, Abrir, Enviar, Guardar a medias, frena, uso, contexto.

## Brand Commitments

- Nombre: **Iridium**, de iridio (D-033). La carpeta del proyecto sigue llamándose «Centro de Desarrollo».
- Sensación tranquila (D-029); ya no «cálida»: casi negro con verde de fósforo, Chakra Petch y tarjetas suaves, a partir de las referencias de `imagenes de prueba/` (D-032).
- La forma de VS Code, la herramienta que usa todo el día: barra de actividad, sesiones como pestañas, área principal grande, panel desplegable y barra de estado; casi todo gris y el color solo para avisar (D-031). La vara de calidad es VS Code. Los colores de D-031 los reemplazó D-032.
- Solo tema oscuro (D-029).
- Design system propio, no heredado de otras apps (D-029).
- Todo en español rioplatense, con textos cortos.

## Evidence on Hand

- Contenido de muestra: proyectos con nombres neutros (Alfa, Beta, Gamma…), nunca los proyectos reales de quien usa Iridium (D-082).
- Wireframes de todas las pantallas del MVP en `docs/04-ux.md`.
- Íconos de proyecto existentes: `.proyecto-icono.svg` en cada carpeta.
- No hay logo, marca ni capturas de la app: todavía no hay código.

## Product Principles

- Lo que espera del usuario siempre está a la vista.
- Para decidir no hace falta buscar: cada pendiente trae dentro lo que cita.
- Cambiar de lugar no corta nada: ninguna navegación frena ni recarga una sesión.
- La IA no gasta uso sin que el usuario lo pida, y se la puede detener al instante.
- Lo escrito no se pierde.

## Accessibility & Inclusion

Sin necesidades especiales declaradas. Lo básico: todo con teclado y foco visible; el estado nunca solo por color (lleva palabra o símbolo); íconos con nombre; el texto se agranda sin romper la pantalla; contraste WCAG AA en el tema oscuro. Ver `docs/04-ux.md` › Accesibilidad.
