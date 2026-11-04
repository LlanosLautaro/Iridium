# Definición del módulo: Skills

**Fecha:** 2026-10-30 (Q-83, D-064)

## Objetivo del módulo
Ver desde Iridium todas las skills de la PC y de dónde viene cada una, cambiar las propias pidiéndoselo a la IA sin salir de Iridium, y saber qué proyectos quedaron atrás cuando cambia la guía `hitos-desarrollo-app`, para ponerlos al día con un botón.

## Criterios de éxito
- Para cambiar la guía o una skill propia, el usuario no abre VS Code ni busca la carpeta: lo pide desde la skill.
- Después de un cambio de formato de la guía, el usuario ve en un lugar qué proyectos están atrasados y los pone al día uno por uno sin escribir el pedido.
- Las copias dobles (D-014) se ven con un aviso y se sabe cuál sobra.

## Funcionalidades
### Must (MVP del módulo)
- **Ver (C-44, C-45, C-46):** la lista de skills con su origen —propia (enlace a `Skills`), copia de un tercero, desde la cuenta o de un complemento— y qué hace cada una (su descripción). Aviso en las que están dos veces.
- **Editar con la IA (C-52):** en una skill propia, «Pedir un cambio» abre la conversación de `Skills` con la skill nombrada y lo que el usuario escribe. El cambio queda en git y ya está instalado (son enlaces).
- **Poner al día (C-53):** qué proyectos tienen la guía con un formato más viejo que el actual, y por cada uno un botón que abre su conversación con el pedido de actualizar el formato (`actualizar-formato.md` de la guía).

### Should
- En qué proyectos se usa una skill (C-46, segunda mitad): por ahora, la guía y la ficha se usan en todos; las demás, según lo que diga la investigación.

### Could
- Versión y fecha del último cambio de cada skill, del git de `Skills` (C-48).
- Adaptar una skill pública (C-47): copiarla a `Skills` y abrir la conversación para cambiarla.

### Won't (por ahora)
- **Elegir qué skills usa cada proyecto** — el usuario la dejó para después (Q-83). Claude Code lo permite (`investigacion.md` › Apagar una skill en un proyecto), así que no hay que inventar nada cuando llegue.
- Editar a mano el texto de una skill dentro de Iridium — los cambios los hace la IA (D-018).

## Fuera de alcance
- Instalar o desinstalar complementos de la cuenta: eso es del frente Capacidades.
- Las instrucciones globales (`CLAUDE-global.md`): viven en `Skills` pero no son una skill; si hace falta, se suman después como una entrada más.

## Impacto en el perfil
No suma datos ni conexiones: lee carpetas de la PC y abre conversaciones como cualquier proyecto. Editar una skill cambia cómo trabaja la IA en todos los proyectos; por eso todo cambio va con git y se puede deshacer (D-018). Sigue en P2.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Origen (de una skill) | De dónde viene: propia, copia de un tercero, desde la cuenta o de un complemento |
| Formato de la guía | La forma de los documentos que pide `hitos-desarrollo-app`; cuando cambia, los proyectos hechos antes quedan «atrasados» |

## Preguntas abiertas para investigar
- Cómo saber qué formato de la guía tiene un proyecto: hoy no hay número de versión (`investigacion.md` › Proyectos atrasados).
- Cómo listar las skills que llegan de la cuenta y de los complementos sin depender de carpetas internas que pueden cambiar.
