# Diseño

Las maquetas de la interfaz de Iridium (D-105): el rediseño en negro sin acento (D-103, D-104), frente Diseño, DI-I2. Se miran en Iridium › Diseño; cómo se arman, en el framework (`referencias/06-ui.md` › Maquetas).

## Pantallas
| Pantalla | Sección | Archivo | En la app |
|---|---|---|---|
| Proyectos | Inicio | pantallas/grilla.html | — |
| Nuevo proyecto | Inicio | pantallas/nuevo-proyecto.html | — |
| Skills › Framework | Inicio | pantallas/skills.html | — |
| Ideas | Inicio | pantallas/ideas.html | — |
| Ajustes | Inicio | pantallas/ajustes.html | — |
| Bandeja de entrada | Un proyecto | pantallas/bandeja.html | — |
| Mapa | Un proyecto | pantallas/mapa.html | — |
| Revisión | Un proyecto | pantallas/revision.html | — |
| Revisión sin comentarios | Un proyecto | pantallas/revision-vacia.html | — |
| Diseño | Un proyecto | pantallas/diseno.html | — |
| Docs | Un proyecto | pantallas/docs.html | — |
| Archivos | Un proyecto | pantallas/archivos.html | — |
| Git | Un proyecto | pantallas/git.html | — |
| Scripts | Un proyecto | pantallas/scripts.html | — |

## Cómo están hechas
- **El sistema:** `tokens.css` (la dirección negra, que en DI-I3 pasa a ser `docs/ui/tokens.css`), `piezas.css` con las doce piezas (PZ-1 a PZ-12, `modulos/diseno/ux.md` › Las piezas) y `piezas.html`, que las muestra con sus variantes.
- **El marco** (la barra de proyectos, la de secciones, la conversación y la de estado) lo arma `piezas.js` en cada pantalla según `data-marco` y `data-seccion` del `<body>`: así cada maqueta tiene solo lo suyo y los íconos de la izquierda pasan de una pantalla a otra. Con `data-claude="sin-sesion"`, la barra de abajo muestra el aviso de Claude en rojo.
- **Los datos son de muestra:** los proyectos de la grilla se llaman Alfa, Beta, Gamma… (D-082).
- **Las reglas del rediseño** (`ux.md` › Reglas): un principal por pantalla como mucho; nunca un bloque dentro de otro; las acciones de una fila, sin fondo; un solo estilo de título de bloque; el foco, solo con el teclado; sin ruido: nada que no ayude a decidir, y un estado solo cuando falla (D-108).

## Falta (siguiente tanda de DI-I2)
Detalle de una skill, detalle de una idea, los proyectos archivados, el menú de las conversaciones, Eliminar, el ancho chico, Diseño › una maqueta grande y Diseño › Sistema, y los estados con error (la IA no respondió, sin sesión de Claude).
