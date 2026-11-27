# Novedades del framework

Los cambios del framework que les piden algo a los proyectos que ya lo siguen (D-118), del más viejo al más nuevo. Iridium compara cada fecha con la de `**Framework:**` del `docs/README.md` de un proyecto: las más nuevas son sus novedades («N novedades del framework» en la tarjeta y en Skills › Framework) y **Ponerse al día** se las pide a su IA, que las hace y adelanta esa fecha a la de la última.

Cómo se escribe una (formato en `SKILL.md` › Las novedades del framework):

- `## AAAA-MM-DD — Qué cambió`, en una línea; la fecha es la del cambio en el framework.
- `Solo si: <ruta>` (opcional, la línea siguiente): solo les toca a los proyectos que tienen ese archivo o carpeta.
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
