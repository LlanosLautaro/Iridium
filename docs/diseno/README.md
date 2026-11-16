# Diseño

Las maquetas de la interfaz de Iridium (D-105): el rediseño en negro sin acento (D-103, D-104), frente Diseño, DI-I2. Se miran en Iridium › Diseño; cómo se arman, en el framework (`referencias/06-ui.md` › Maquetas).

## Pantallas
| Pantalla | Sección | Archivo | En la app |
|---|---|---|---|
| Proyectos | Inicio | pantallas/grilla.html | — |
| Proyectos archivados | Inicio | pantallas/archivados.html | — |
| Nuevo proyecto | Inicio | pantallas/nuevo-proyecto.html | — |
| Eliminar un proyecto | Inicio | pantallas/eliminar.html | — |
| Skills › Framework | Inicio | pantallas/skills.html | — |
| Detalle de una skill | Inicio | pantallas/skill.html | — |
| Ideas | Inicio | pantallas/ideas.html | — |
| Ajustes | Inicio | pantallas/ajustes.html | — |
| A · Notas | Ideas de un proyecto (propuesta) | pantallas/ideas-proyecto-a.html | — |
| B · Tarjetas | Ideas de un proyecto (propuesta) | pantallas/ideas-proyecto-b.html | — |
| C · Ideas y enlaces para revisar | Ideas de un proyecto (propuesta) | pantallas/ideas-proyecto-c.html | — |
| Bandeja de entrada | Un proyecto | pantallas/bandeja.html | — |
| Mapa | Un proyecto | pantallas/mapa.html | — |
| Revisión | Un proyecto | pantallas/revision.html | — |
| Revisión sin comentarios | Un proyecto | pantallas/revision-vacia.html | — |
| Diseño | Un proyecto | pantallas/diseno.html | — |
| Diseño › una maqueta grande | Un proyecto | pantallas/diseno-grande.html | — |
| Diseño › Sistema | Un proyecto | pantallas/diseno-sistema.html | — |
| Docs | Un proyecto | pantallas/docs.html | — |
| Archivos | Un proyecto | pantallas/archivos.html | — |
| Git | Un proyecto | pantallas/git.html | — |
| Scripts | Un proyecto | pantallas/scripts.html | — |
| Conversaciones anteriores | La conversación | pantallas/conversaciones.html | — |
| La IA no respondió | La conversación | pantallas/error-ia.html | — |
| Claude sin sesión | La conversación | pantallas/sin-sesion.html | — |
| Un proyecto en ancho chico | La conversación | pantallas/ancho-chico.html | — |

## Cómo están hechas
- **El sistema:** `tokens.css` (la dirección negra; desde DI-I3 la app lo importa tal cual), `piezas.css` con las doce piezas (PZ-1 a PZ-12, `modulos/diseno/ux.md` › Las piezas) y `piezas.html`, que las muestra con sus variantes.
- **El marco** (la barra de proyectos, la de secciones, la conversación y la de estado) lo arma `piezas.js` en cada pantalla según `data-marco` y `data-seccion` del `<body>`: así cada maqueta tiene solo lo suyo y los íconos de la izquierda pasan de una pantalla a otra. Con `data-claude="sin-sesion"`, la barra de abajo muestra el aviso de Claude en rojo.
- **Los datos son de muestra:** los proyectos de la grilla se llaman Alfa, Beta, Gamma… (D-082).
- **Las reglas del rediseño** (`ux.md` › Reglas): un principal por pantalla como mucho; nunca un bloque dentro de otro; las acciones de una fila, sin fondo; un solo estilo de título de bloque; el foco, solo con el teclado; sin ruido: nada que no ayude a decidir, y un estado solo cuando falla (D-108).

## Falta
Nada de la lista de DI-I2: la tanda 2 sumó archivados, Eliminar, el detalle de una skill, Diseño › una maqueta grande y › Sistema, el menú de las conversaciones, los dos errores de la IA y el ancho chico. El detalle de una idea ya no existe: Ideas es un bloc de notas (D-112).
