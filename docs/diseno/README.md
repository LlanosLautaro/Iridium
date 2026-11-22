# Diseño

Las maquetas de la interfaz de Iridium (D-105): el rediseño en negro sin acento (D-103, D-104), frente Diseño, DI-I2. Se miran en Iridium › Diseño; cómo se arman, en el framework (`referencias/06-ui.md` › Maquetas).

## Pantallas
| Pantalla | Sección | Archivo | En la app |
|---|---|---|---|
| Proyectos | Inicio | pantallas/grilla.html | 2026-11-21 00:55 |
| Proyectos archivados | Inicio | pantallas/archivados.html | 2026-11-21 00:55 |
| Nuevo proyecto | Inicio | pantallas/nuevo-proyecto.html | 2026-11-20 22:56 |
| Eliminar un proyecto | Inicio | pantallas/eliminar.html | 2026-11-20 22:56 |
| Skills › Framework | Inicio | pantallas/skills.html | 2026-11-18 15:21 |
| Detalle de una skill | Inicio | pantallas/skill.html | 2026-11-18 15:21 |
| Ideas | Inicio | pantallas/ideas.html | — |
| Ajustes | Inicio | pantallas/ajustes.html | 2026-11-20 22:28 |
| A · Notas | Ideas de un proyecto (propuesta) | pantallas/ideas-proyecto-a.html | — |
| B · Tarjetas | Ideas de un proyecto (propuesta) | pantallas/ideas-proyecto-b.html | — |
| C · Ideas y enlaces para revisar | Ideas de un proyecto (propuesta) | pantallas/ideas-proyecto-c.html | — |
| C · Ideas del inicio (sin proyecto) | Ideas de un proyecto (propuesta) | pantallas/ideas-inicio-c.html | — |
| Un camino por frente | Mapa (propuesta) | pantallas/mapa-b.html | 2026-11-18 00:48 |
| Antes del hito 10 (los hitos) | Mapa (propuesta) | pantallas/mapa-hitos.html | 2026-11-18 00:48 |
| A · Columnas: Hecho, Ahora, Después | Frentes (propuesta) | pantallas/frentes-a.html | — |
| B · El camino de hoy, con tamaño y «sola» | Frentes (propuesta) | pantallas/frentes-b.html | — |
| C · Una fila por frente | Frentes (propuesta) | pantallas/frentes-c.html | — |
| D · Por quién lo hace | Frentes (propuesta) | pantallas/frentes-d.html | — |
| E · Grilla de frentes | Frentes (propuesta) | pantallas/frentes-e.html | — |
| Bandeja de entrada | Un proyecto | pantallas/bandeja.html | — |
| Mapa | Un proyecto | pantallas/mapa.html | — |
| Revisión | Un proyecto | pantallas/revision.html | 2026-11-18 19:45 |
| Revisión sin comentarios | Un proyecto | pantallas/revision-vacia.html | 2026-11-18 19:45 |
| Diseño | Un proyecto | pantallas/diseno.html | — |
| Diseño › una maqueta grande | Un proyecto | pantallas/diseno-grande.html | — |
| Diseño › Sistema | Un proyecto | pantallas/diseno-sistema.html | — |
| Docs | Un proyecto | pantallas/docs.html | 2026-11-18 20:15 |
| Archivos | Un proyecto | pantallas/archivos.html | 2026-11-20 15:18 |
| Git | Un proyecto | pantallas/git.html | 2026-11-20 17:30 |
| Scripts | Un proyecto | pantallas/scripts.html | 2026-11-20 20:50 |
| Conversaciones anteriores | La conversación | pantallas/conversaciones.html | 2026-11-21 08:52 |
| La IA no respondió | La conversación | pantallas/error-ia.html | — |
| Claude sin sesión | La conversación | pantallas/sin-sesion.html | — |
| Un proyecto en ancho chico | La conversación | pantallas/ancho-chico.html | — |
| La lista de «/» | Paridad (propuesta) | pantallas/paridad-comandos.html | — |
| Adjuntos en el compositor | Paridad (propuesta) | pantallas/paridad-adjuntos.html | — |
| Un comando escondido escrito a mano | Paridad (propuesta) | pantallas/paridad-escondido.html | — |
| Adjuntos en los mensajes mandados | Paridad (propuesta) | pantallas/paridad-enviado.html | — |
| Soltar archivos en la conversación | Paridad (propuesta) | pantallas/paridad-soltar.html | — |

## Cómo están hechas
- **El sistema:** `tokens.css` (la dirección negra; desde DI-I3 la app lo importa tal cual), `piezas.css` con las doce piezas (PZ-1 a PZ-12, `modulos/diseno/ux.md` › Las piezas) y `piezas.html`, que las muestra con sus variantes.
- **El marco** (la barra de proyectos, la de secciones, la conversación y la de estado) lo arma `piezas.js` en cada pantalla según `data-marco` y `data-seccion` del `<body>`: así cada maqueta tiene solo lo suyo y los íconos de la izquierda pasan de una pantalla a otra. Con `data-claude="sin-sesion"`, la barra de abajo muestra el aviso de Claude en rojo. Una pantalla trae su propia conversación en `<template id="conversacion">` y su propio compositor en `<template id="compositor">` (Paridad).
- **Los datos son de muestra:** los proyectos de la grilla se llaman Alfa, Beta, Gamma… (D-082).
- **Las reglas del rediseño** (`ux.md` › Reglas): un principal por pantalla como mucho; nunca un bloque dentro de otro; las acciones de una fila, sin fondo; un solo estilo de título de bloque; el foco, solo con el teclado; sin ruido: nada que no ayude a decidir, y un estado solo cuando falla (D-108).

## Falta
Nada de la lista de DI-I2: la tanda 2 sumó archivados, Eliminar, el detalle de una skill, Diseño › una maqueta grande y › Sistema, el menú de las conversaciones, los dos errores de la IA y el ancho chico. El detalle de una idea ya no existe: Ideas es un bloc de notas (D-112).
