# Referentes: apps de escritorio para dirigir agentes (2026-11-09)

Cinco repos que pasó el usuario, mirados por sus README y documentos de diseño, para ver qué ideas sirven a Iridium. No se instaló ni se corrió ninguno.

## Qué es cada uno

| Repo | Qué es | Licencia | Parecido con Iridium |
|---|---|---|---|
| `kayraucklnc/beluga` | App de escritorio con cada proyecto y su agente (Claude Code por el Agent SDK, como Iridium), tareas, planes, diagramas, app para el celular y agentes de amigos | MIT | **Alto**: el más cercano |
| `stablyai/orca` | Orquestador de muchos agentes de código en paralelo (Claude Code, Codex…), cada uno en su worktree; escritorio, celular y nube | MIT | Medio: pensado para quien lee código |
| `rsaryev/localix` | «Entorno de desarrollo con agentes»: editor, terminales, navegador, subagentes, cualquier modelo, mini apps | MIT | Medio-bajo |
| `robritacca-dotcom/rift-ds` | Sistema de diseño de React pensado para que la IA lo use bien | MIT | Para la sección Diseño |
| `open-webui/desktop` | Instalador y lanzador de Open WebUI (un chat con modelos) | AGPL-3.0 | Bajo: solo instala y actualiza |

**La diferencia de fondo:** Orca, Beluga y Localix son para alguien que lee código (diffs, terminales, worktrees, pull requests). Iridium es para alguien que dirige sin leer código: documentos, decisiones, preguntas, pruebas con capturas. Esa diferencia es lo que distingue a Iridium; conviene tomar lo que sirve a quien dirige y dejar lo centrado en el código.

## Ideas que encajan con Iridium

Ordenadas por cuánto sirven a quien dirige sin leer código.

1. **Diagramas que dibuja la IA** (Beluga, «Graphs»). La IA escribe un bloque de datos (nodos, flechas, pasos) y la app dibuja un diagrama interactivo: pasar el mouse resalta lo conectado, clic muestra el detalle, y un **recorrido paso a paso** explica una cosa por vez. Sirve en el chat, en los documentos y en los resúmenes de hito. Encaja con «explicame por consecuencias y mostrámelo». No ejecuta código: es solo datos, validados.
2. **Prueba visible de lo hecho** (Beluga, «Scratch» y «proof»). Lo que la IA produce mientras trabaja (capturas, resultados de pruebas, registros) aparece en vivo en una pestaña, y lo mejor queda adjunto a la tarea como prueba. En Iridium: las Q-n de prueba y los cierres de iteración con sus capturas al lado.
3. **El brief con historia** (Beluga, «Tasks»). Cada tarea tiene secciones fijas (objetivo, contexto, criterios con casillas, decisiones, preguntas abiertas, **notas para el próximo agente**) y cada cambio guarda quién lo hizo y por qué, con «Restaurar». Iridium ya tiene casi todo esto en su framework; lo nuevo serían la historia por sección y las notas para la próxima sesión.
4. **Lo que te necesita, en el celular, con aviso** (Beluga y Orca). Una app del celular que muestra solo lo que espera al usuario (preguntas, aprobaciones, pruebas) y avisa con una notificación. Iridium dejó afuera el celular (D-006, Q-30); queda como idea grande para más adelante.
5. **Trabajo programado con informe** (Beluga «Sentinel», Orca «Automations»). Una tarea descrita en una frase que corre sola (a una hora, o cuando algo pasa) y deja un informe. Nace pausada y nada se fusiona sin aprobación. En Iridium: por ejemplo, pasar el control del framework por todos los proyectos cada mañana.
6. **Dictado** (Orca). Un atajo y se habla: el texto entra al mensaje. Útil para dirigir con ideas sueltas.
7. **Copiar un elemento de la pantalla al chat** (Orca, «Design Mode»). Clic sobre un elemento y se pega en el chat con su HTML, estilos y ubicación. Es pariente de `F8` de la Revisión; se podría sumar a la Revisión y a Diseño.
8. **Uso y disco** (Beluga). Límites del plan, tokens y costo por día, y **cuánto disco ocupa cada proyecto** con limpieza en un clic. Iridium ya muestra el uso; lo del disco sería nuevo.
9. **Archivar sin perder** (Beluga). Se borra la carpeta pesada y queda la rama y la conversación.
10. **Paleta de comandos** (Beluga, `⌘K`; Orca, «Jump anywhere»). Un atajo para ir a cualquier proyecto, pantalla o acción. Iridium no la tiene.
11. **Modelos chicos para decisiones rápidas** (Localix). Un modelo barato pone títulos, clasifica o resume, y el grande queda para el trabajo. Ahorra uso.
12. **Búsqueda por significado** (Localix). Encontrar conversaciones, documentos o skills por lo que dicen, no por la palabra exacta.

## Para la sección Diseño: Rift DS

- **Contratos por pieza para la IA**: cada componente tiene su ficha en Markdown y en JSON, los tokens en el formato estándar DTCG y un `AGENTS.md` con las reglas, para que la IA use las piezas tal como son. Iridium podría generar lo mismo desde su **Sistema** (DI-I1) y dárselo a la IA de cada proyecto.
- **Playground de temas que exporta un `AGENTS.md`** con el tema en palabras y su CSS: es casi «Probar una dirección» (DI-I4).
- **Lista de piezas de chat con IA** como checklist de lo que puede faltar: llamada a herramienta, razonamiento, plan del agente, tarjeta de pregunta, tarjeta de interrupción, tarjeta de uso, sugerencias de mensaje.
- Usarlo tal cual no conviene: tiene su propia estética y Iridium ya eligió la suya (negro sin acento, D-103 y D-104).

## Lo que no conviene

- Worktrees y agentes en paralelo, revisar diffs línea por línea, terminales y editor: son para quien lee código.
- Agentes de amigos, servidores remotos, cualquier modelo: lejos del alcance actual.
- El código de Open WebUI Desktop: AGPL obliga a abrir el código de Iridium si se copia. De los otros cuatro (MIT) se puede tomar código citando la licencia.
