# Novedades del framework

Los cambios del framework que les piden algo a los proyectos que ya lo siguen (D-118), del más viejo al más nuevo. Iridium compara cada fecha con la de `**Framework:**` del `docs/README.md` de un proyecto: las más nuevas son sus novedades («N novedades del framework» en la tarjeta y en Skills › Framework) y **Ponerse al día** se las pide a su IA, que las hace y adelanta esa línea a la fecha y el título de la última (`**Framework:** AAAA-MM-DD · Qué cambió`): las del mismo día que vienen después siguen siendo nuevas.

Cómo se escribe una (formato en `SKILL.md` › Las novedades del framework):

- `## AAAA-MM-DD — Qué cambió`, en una línea; la fecha es la del cambio en el framework y el título no se repite en el mismo día.
- `Solo si: <ruta>` (opcional, la línea siguiente): solo les toca a los proyectos que tienen ese archivo o carpeta; con varias separadas por ` · `, a los que tienen alguna.
- Debajo, qué tiene que hacer el proyecto, corto y concreto.

Va acá solo lo que le pide algo a un proyecto que ya sigue el framework; lo que el control ya marca se anota igual si hay que hacer algo más que corregir el aviso.

## 2026-11-12 — Las piezas del design system llevan ficha
Solo si: docs/diseno/piezas.css
Cada pieza de `docs/diseno/piezas.css` empieza con su ficha: el comentario que la encabeza suma `Grupo:`, `Para qué:` y `Estados:` (separados por comas), como dice `SKILL.md` › Las maquetas. Así Diseño › Sistema las muestra por grupo. No cambia ninguna regla de las piezas.

## 2026-11-12 — Las medidas fijas son tokens
Solo si: docs/diseno/piezas.css
La altura de la barra, de los controles y de las filas y el ancho de los paneles van como tokens `--alto-<nombre>` y `--ancho-<nombre>` en `docs/diseno/tokens.css` (una sola medida y su uso), y `piezas.css` los usa en lugar del número escrito a mano. Las maquetas se tienen que ver igual que antes.

## 2026-11-26 — Lo aprobado de un frente va en su ruta
Solo si: docs/modulos
Cada `T-n` `pendiente` o `en curso` de `docs/trabajo.md` con `Frente:` tiene que estar nombrado en un paso de la `## Ruta` de ese frente, también si el frente está `hecho`: sumá un paso `[ ]` donde le toca, con su tamaño (y `sola` si va sin el usuario). Si ya no va, pasalo a `descartado` con el motivo. Sin eso, la tarjeta del frente dice «Todo hecho» y el avance solo no lo toma; el control ahora lo marca.

## 2026-11-27 — Las ideas del usuario llevan un título corto
Solo si: docs/trabajo.md
Cada idea `Idea: usuario` ya evaluada (con «Evaluada el …») o aprobada, y sin terminar, cuyo título sea un párrafo (más de unas ocho palabras) lleva un título corto en sus palabras, y su texto pasa tal cual al principio de su nota `docs/ideas/T-n.md` (creala si no tiene), como dice `SKILL.md` › El trabajo. El control marca las de más de 80 letras.

## 2026-11-27 — Las pruebas no ocupan la pantalla del usuario
Solo si: playwright.config.ts · playwright.config.js · playwright.config.mjs · app/playwright.config.ts · app/playwright.config.js · tests/playwright.config.ts
Aplicá `recetas/pruebas-sin-ventanas.md` según el tipo de la app (la marca del script que la abre): en una página, que Playwright corra sin ventana; en una de Electron, la variable que solo prenden las pruebas, con la ventana fuera de la pantalla, sin foco ni sonido, y las consolas escondidas. Las pruebas tienen que pasar igual que antes, y la prueba del usuario va como `Q-n` con casillas (la receta › Cómo se prueba). Si ya no abren nada a la vista, decilo y no cambies nada.
