# Estado del módulo: Ideas

**Tipo:** sección (las ideas y los enlaces para revisar de cada proyecto; D-127)
**Última actualización:** 2026-11-16
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (la forma C, con estados en color, las ideas de la IA y el inicio igual: D-128) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-178; aprobar es pasar al trabajo, D-129) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros: la IA lee los enlaces con sus herramientas, como hoy; lo de Obsidian ya se usó en las maquetas) | — |
| 4. UX | hecho (aprobada en Q-180) | `ux.md` |
| 5. Diseño técnico | hecho (D-130) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | descartado (las tres piezas nuevas ya están dibujadas en las maquetas aprobadas; pasan a `piezas.css` al construir) | — |
| 7. Construcción | en curso (ID-I1) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
La forma C (D-128), aprobar es pasar al trabajo (D-129), la UX aprobada (Q-180) y el diseño técnico cerrado (D-130): cada idea es un `T-n` de `trabajo.md` con el campo `Idea:`, y la nota del usuario va en `docs/ideas/T-n.md`. Construcción en cuatro iteraciones; en curso ID-I1 (Ideas en un proyecto, con el formato en el framework).

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `04-ux.md` › W-10 (Ideas) | Ideas del inicio pasa a ser la lista de ideas sueltas, con la forma de la del proyecto | D-128 | sí (2026-11-16, como nota en W-10) |
| `05-arquitectura.md` › Trabajo (`T-n`) | El campo `Idea:`, las notas en `docs/ideas/` y `sueltas.md` | D-130 | no (al cerrar ID-I1) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| ID-I1 | Ideas en un proyecto: el formato en el framework con su lector y su control, la lista con filtros, anotar, abrir, aprobar y rechazar | en curso |
| ID-I2 | Para revisar (enlaces, Revisar con la IA) y Hablar de esta idea | pendiente |
| ID-I3 | La nota completa: enlaces e imágenes pegados, guardado solo, borrar | pendiente |
| ID-I4 | El inicio: ideas sueltas, Mover a un proyecto; se saca el bloc | pendiente |

## Log de iteraciones
(todavía ninguna)

## Próximo paso
ID-I1, por partes: (1) el formato: `Idea:` y `Enlace:` en el lector (`core/trabajo.ts`), las reglas del control y el framework (`SKILL.md` › El trabajo, la plantilla), con sus pruebas; (2) las reglas puras de la lista (`core/ideas.ts`: de los `T-n` a las ideas, filtros, armar un `T-n`, cambiar estado y título) con sus pruebas; (3) la escritura cuidada y el puente; (4) la pantalla en la barra del proyecto, con la maqueta C.
**Leer antes:** `diseno-tecnico.md`; `src/main/core/trabajo.ts` y `src/main/core/control/trabajo.ts`; `recursos/plugins/iridium/skills/iridium/SKILL.md` › El trabajo.
