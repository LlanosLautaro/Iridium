# Propuesta del módulo: Paridad

**Fecha:** 2026-11-21
**Tipo:** sección

## Qué problema resuelve
El chat de Iridium es donde el usuario pasa más tiempo, y le faltan cosas que da por sentadas en el de Claude (escritorio y VS Code). La captura de T-96 muestra el + del compositor de Claude:
- **Comandos con «/»:** escribir «/» abre la lista de comandos (los de Claude Code, los de las skills y los de los plugins) con su descripción; se elige con las flechas.
- **Adjuntar archivos o fotos** con el + o Ctrl+U, y arrastrándolos al chat.
- **Pegar una foto** (una captura) con Ctrl+V: queda como miniatura en el compositor y viaja con el mensaje.
- **Un texto largo pegado va como archivo:** en vez de llenar el cuadro, queda como un adjunto («Texto pegado, 340 líneas») que se puede abrir y sacar.

Lo demás del compositor (el modelo, el esfuerzo, el contexto) Iridium ya lo tiene parecido.

## Por qué ahora
Lo pidió el usuario (D-165): es lo que más se nota todos los días. El compositor ya quedó con las piezas de Diseño (DI-I3, tanda 18), así que lo nuevo se suma sin rehacer nada.

## Cómo encaja en el producto
- Es la conversación de un proyecto (`02-definicion.md`, H-2, C-58), la de la sección General y la de Skills: las tres usan el mismo compositor.
- **Sin atarse a Claude.** Más adelante podrían entrar Codex u otros agentes (no se programa ahora). Por eso todo pasa por la frontera del motor (D-007, D-025), como el modelo y el esfuerzo:
  - el compositor arma un mensaje en palabras de Iridium: **texto + adjuntos** (archivo, foto, texto pegado);
  - le pregunta al motor **qué sabe hacer**: qué comandos tiene (nombre, para qué, de dónde salen) y si acepta fotos;
  - la frontera lo traduce a Claude; otro motor lo traduciría a lo suyo. Lo que un motor no tiene, el compositor no lo muestra.
- Lo que es de Iridium y no del motor (dónde se guarda un adjunto, el texto largo convertido en archivo, la lista que se abre con «/») queda fuera de la frontera y sirve igual para cualquier agente.
- Se relaciona con **Capacidades** (T-28: plugins, usar la PC y el navegador desde las sesiones): son de las sesiones, no del chat. Si van juntos o aparte, Q-239.
- Lo que Claude tiene y no se pidió (mencionar archivos con «@», dictar con el micrófono, los conectores), Q-238.

## Por qué es un módulo y no una funcionalidad
- [x] Dominio propio que requiere investigación: qué comandos funcionan sin la terminal (algunos de Claude Code son interactivos: `/model`, `/config`) y cómo viajan las fotos y los archivos por el motor.
- [x] Flujos de UX propios: la lista de «/», el + con su menú, las miniaturas y los adjuntos en el compositor y en los mensajes ya mandados.
- [x] Ritmo de avance propio: va por partes (comandos, adjuntos, fotos, texto largo), cada una usable sola.
- [ ] Se activa, instala o distribuye por separado.

## Alternativas
- **Una funcionalidad suelta** (solo pegar fotos): resuelve una cuarta parte y deja el resto para después sin un diseño común; el + y «/» comparten el mismo menú y los adjuntos.
- **Pegar la ruta del archivo a mano en el mensaje** (lo que se hace hoy): funciona con archivos del proyecto, no con capturas ni con texto largo, y es incómodo.
- **Abrir la terminal de Claude Code** para lo que falta: rompe el «todo en un lugar» de Iridium.

## Decisión
Seguir (D-165). Cuándo empieza y qué entra: Q-237 a Q-239.
