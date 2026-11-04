# Estado del módulo: Inicio

**Tipo:** sección
**Última actualización:** 2026-11-04
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
| 8. Calidad | completo (Q-115: bien, salvo Pedir que la integren, que se sacó) | este archivo |
| 9. Lanzamiento | completo (entra con Armar, como cada versión) | este archivo |

## En qué estamos ahora
Módulo completo (2026-11-04). Con Q-115 probaste IN-I1: todo bien menos **Pedir que la integren**, que no querías (para eso está el chat): se sacó. **Abrir como proyecto** te llevó a pensar la carpeta de Iridium como un «vault» (`.iridium` con Ideas, Skills y los datos internos, y respaldo opcional en GitHub): eso es Q-125, en `docs/estado.md`. Las ideas y las skills de cada proyecto (R-8) quedaron en el Backlog de `10-operacion.md`.

Verificado: `pnpm test` (564), `pnpm e2e` (81), typecheck y lint.

## Pendientes
(ninguno)

## Preguntas abiertas
(ninguna)

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
| IN-I1 | La sección Ideas (`Ctrl+4`), la grilla solo con proyectos y Abrir como proyecto (IN-1 a IN-3) | aprobada (Q-115), sin Pedir que la integren |

## Próximo paso
Ninguno: el módulo está completo. Lo que sigue del frente está en `docs/estado.md` (Q-125) y en el Backlog de `10-operacion.md`.
