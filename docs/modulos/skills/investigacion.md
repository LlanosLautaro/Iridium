# Investigación del módulo: Skills

**Fecha:** 2026-10-30; completa el 2026-10-31 (Proyectos atrasados, D-068)

## Dónde están las skills en esta PC
- `C:\Users\usuario\.claude\skills\`:
  - `gestor-proyectos` y `hitos-desarrollo-app`: **enlaces** a `Skills/skills/`. Son las propias.
  - `impeccable`: **carpeta real**, copia de un tercero; llega además como complemento (`impeccable:impeccable`). Es la copia doble de D-014.
  - `synced/`: las que **bajan de la cuenta**; no se copian ni se editan.
  - `.trash/`: lo que se borró; no se muestra.
- `C:\Users\usuario\.claude\plugins\`: los **complementos** (`design`, `engineering`, `impeccable`…) con sus skills adentro; el catálogo está en `plugin-catalog-cache.json`.
- Cada skill es una carpeta con `SKILL.md`, que empieza con `name` y `description`: alcanza para la lista y para «qué hace».

## Lo que da Claude Code (Agent SDK 0.3.309, el que usa Iridium)
- Al empezar una sesión, el SDK informa las skills que cargó (`skills` y `plugins` en el mensaje de inicio). Sirve para comprobar la lista que arma Iridium leyendo carpetas, y para las que llegan de la cuenta sin que haya que entender su carpeta interna.
- `reload_skills`: vuelve a leer las skills en una sesión abierta; un cambio hecho en `Skills` se ve sin reiniciar.

## Apagar una skill en un proyecto
Existe: el ajuste `skillOverrides` (por nombre de skill: `on`, `name-only`, `user-invocable-only`, `off`). Puesto en `.claude/settings.json` del proyecto, apaga o esconde una skill solo ahí. Queda anotado para cuando el usuario quiera elegir skills por proyecto (fuera de la primera tanda, Q-83).

## Proyectos atrasados
La guía no tiene un número de formato, pero sí una **fecha**: desde el 2026-10-29 cada proyecto anota `**Formato de la guía:** AAAA-MM-DD` en su `docs/README.md`, y el `SKILL.md` dice cuál es el vigente («El formato vigente de esta guía es el del **2026-10-29**», en "Formato de la documentación"). Además, un proyecto atrasado se puede marcar a mano con el bloque «Actualización de formato pendiente» en su `CLAUDE.md` (`actualizar-formato.md` de la guía).

Lo que hay en la carpeta de proyectos (2026-10-31):
| Proyecto | `docs/estado.md` | Formato en `docs/README.md` | Bloque en `CLAUDE.md` | Ficha |
|---|---|---|---|---|
| otra app | sí | 2026-10-16 | no | en desarrollo |
| otra app | sí | 2026-10-16 | no | en desarrollo |
| otro proyecto | sí | — | sí | idea |
| Centro de Desarrollo (Iridium) | sí | 2026-10-29 | no | en desarrollo |
| el gestor anterior | sí | 2026-10-16 | no | descontinuado, archivado |
| otro proyecto | sí | — | sí | reemplazado por otro proyecto |
| Ideas, otros proyectos, otro proyecto, Scripts, Skills, otro proyecto | no | — | — | — |

Opciones que se le ofrecieron al usuario (Q-89): un número de formato, comparar con la plantilla o solo el bloque a mano. Eligió el número, pero en un archivo que lea la app y no la IA al empezar. La línea de `docs/README.md` ya es eso, con una fecha en lugar de un número (D-068): sin cambiar la guía, hoy salen atrasados otras apps y otro proyecto (el Gestor y otro proyecto no, porque están archivados o reemplazados).
