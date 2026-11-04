# Estado del módulo: Inicio

**Tipo:** sección
**Última actualización:** 2026-11-02
**Nivel de protección:** hereda P2 (solo lee `Ideas/ideas.md`; no suma nada que salga de la PC).

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | completo (Q-113: B, el chat queda también al lado de la grilla) | `propuesta.md` |
| 2. Definición | completo (Q-114: A) | `definicion.md` |
| 3. Investigación | saltado (`ideas.md` ya tiene formato fijo, el de `Ideas/CLAUDE.md`) | — |
| 4. UX | completo (Q-114: A) | `ux.md` |
| 5. Diseño técnico | completo (Q-114: A) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | saltado: se arma con las piezas de Skills; el ícono nuevo va con la construcción | — |
| 7. Construcción | completo (IN-I1) | este archivo |
| 8. Calidad | en curso: pruebas pasan; falta tu prueba (Q-115) | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Q-114 aprobada (A). IN-I1 construida: el ícono Ideas (`Ctrl+4`) con la lista por sección, el detalle y el chat general con «Sobre la idea …»; Pedir que la integren; los proyectos que toca como enlaces; la lista que se actualiza sola; la grilla sin `Ideas` ni `Skills`, y **Abrir como proyecto** en Ideas y en Skills.

Verificado: `pnpm test` (543, con `tests/in1-ideas.test.ts` sobre una copia del `ideas.md` real), `pnpm e2e` (78, con `tests/e2e/in1-ideas.spec.ts`, también en Carbón), typecheck y lint. Capturas con las carpetas reales en `tools/salida/10-*.png`. Un ajuste propio: al tocar Pedir que la integren se saca «Sobre la idea …», porque el pedido ya la nombra. `tools/medir.ts` entra a `Ideas` y `Skills` con Abrir como proyecto.

## Pendientes
- [ ] Con Q-115: cerrar Calidad y Lanzamiento del módulo y el frente en `10-operacion.md`.

## Preguntas abiertas
(en `docs/estado.md`: Q-115)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `02-definicion.md` › Módulos previstos | Inicio activo; el orden de los que esperan | D-079 | sí |
| `04-ux.md` › Arquitectura de información | Ideas como cuarto ícono del inicio (`Ctrl+4`); la grilla sin `Ideas` ni `Skills` | Q-113 | sí |
| `02-definicion.md` › Glosario | Idea suelta; Chat general | — | sí |
| `05-arquitectura.md` › Modelo de datos | `anchoListaIdeas` en `config.json` | — | sí |
| `DESIGN.md`, `docs/ui/iconos/` | El ícono Ideas | — | sí (`DESIGN.md` › Ideas; es de la barra, no de un proyecto: no va a `docs/ui/iconos/`) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| IN-I1 | La sección Ideas (`Ctrl+4`), la grilla solo con proyectos y Abrir como proyecto (IN-1 a IN-3) | construida; esperando tu prueba (Q-115) |

## Próximo paso
Con Q-115: si está bien, cerrar los pasos 8 y 9 del módulo y el frente Inicio en `10-operacion.md`, y proponer el próximo frente (Diseño, D-079); si algo falla, arreglarlo con la pista corta.
**Leer antes:** `docs/respuestas/Q-115.md`.
