# Operación e iteración

> Iridium está en uso diario desde I-6 y lanzado desde el hito 9 (Q-111, 2026-11-02). Este hito no termina: junta lo que se ve en el uso, lo que hay que mantener y lo que podría venir, y de ahí sale cada versión nueva, que vuelve a pasar por los hitos que correspondan (tabla de rutas de la guía; los cambios grandes, como módulo o propuesta).

## Cómo se trabaja en operación
- **Errores y ajustes que reportás:** la IA los clasifica sola. Si rompen el uso o son de lo que está en curso, se arreglan en el momento (qué pasa, qué tendría que pasar, causa, arreglo y una prueba) y se arma; si no, van al Backlog. Se reportan en el chat del proyecto, en una `Q-n` o con la Revisión (F8) sobre la misma Iridium.
- **Qué se mira en el uso diario:** las preguntas periódicas de la guía (qué usás más y qué casi nunca, qué molesta, qué errores aparecieron, qué cambió del ecosistema, si siguen valiendo los objetivos) y las señales de que algo no funciona de `02-definicion.md` › Criterios de éxito: volver a VS Code para conversar con la IA, Pendientes con preguntas de más o de menos, un proyecto frenado sin que se note.
- **Cada versión:** se arma con **Armar** o `pnpm actualizar` y entra al cerrar Iridium; si sale mal, `pnpm volver` (`09-lanzamiento.md` › Vuelta atrás). Las que marcan algo van a `09-lanzamiento.md` › Historial de lanzamientos.
- **Mantenimiento:** en cada sesión de operación, `pnpm audit` y `pnpm outdated`. Los parches de la misma versión se suben con las pruebas completas; las versiones mayores (Electron, Vite) van como tarea propia del Backlog. Si cambia algo de Claude Code o del SDK que rompe el motor, se vuelve al hito 3 para esa área.
- **Revisión de la documentación:** con cada módulo nuevo o cambio grande, que `docs/` diga lo que hace la app (y `DESIGN.md`, con `impeccable` › document).

## Señales recogidas
| Fecha | Fuente | Observación |
|---|---|---|
| 2026-11-02 | Hito 8 (Q-108) | Tu recorrido completo sin problemas; los defectos que quedan abiertos son los dos menores de abajo |
| 2026-11-04 | Q-117 | Faltaba lo de VS Code para crear el repositorio y publicarlo en GitHub: ajuste chico (D-081), construido; falta probarlo con GitHub de verdad (Q-118) |
| 2026-11-04 | Q-119, Q-120, Q-121 | El repo nombraba los otros proyectos del usuario: limpieza total (D-082); Ideas y Skills pasan a una carpeta Iridium aparte (D-083, construida; falta Q-122); el repo empieza de nuevo al terminar (D-084) |

## Mantenimiento
| Fecha | Qué se actualizó | Motivo |
|---|---|---|
| 2026-11-02 | Nada: revisado. `pnpm audit`: las 4 moderadas de `minimatch` dentro de `electron-builder` (Defecto 4). `pnpm outdated`: parches de React, Zustand, Vitest y el SDK de Claude Code (0.3.309 → 0.3.316); versiones mayores de Electron (45), Vite (8) y electron-vite (6) | Primera revisión del hito 10. Los parches van al Backlog (Should); las mayores, cuando haga falta |

## Backlog
Una sola lista; se prioriza con el criterio del hito 2. Las funcionalidades que faltan del alcance están en `02-definicion.md` › Funcionalidades (Should y Could) y se agrupan en los frentes en espera de D-063.

### Must
- (nada: no hay defectos bloqueantes ni graves abiertos)

### Should
- **Frentes, en el orden de D-079:** Inicio (en curso, `modulos/inicio/`), después Diseño y Capacidades (`02-definicion.md` › Módulos previstos).
- **Mantenimiento:** subir los parches (React 19.3.1, Zustand, Vitest, Playwright 1.64 y el SDK de Claude Code 0.3.316) con las pruebas completas y armar.
- **Lo del Gestor que falta en Iridium:** primero lo de R-7: el clic derecho en la tarjeta (abrir en VS Code y en el explorador, estado, archivar, ícono; C-9, C-12) y **Nuevo proyecto** arriba de la grilla (C-10). Después, búsqueda entre proyectos y grupos y filtros (C-8, C-9).
- **Ideas y skills del proyecto (R-8):** un ícono en la barra del proyecto con sus ideas sueltas (`00-idea.md` › Ideas para después y `07-construccion.md` › Ideas nuevas); y las skills del proyecto (`.claude/skills/` de cada uno), con su ícono solo si tiene alguna (lo de «elegir por proyecto» de D-064).
- **Revisión:** la línea «Página» de un comentario guarda la ruta entera de la app (con la carpeta de proyectos); en el repo de Iridium conviene que quede relativa al proyecto (D-082).
- **Seguir a la IA y el cierre de sesión con comprobación** (C-4, C-6); avisos de Windows (C-51).
- **Plan completo:** decisiones, módulos como caja, todos los planes en una vista, diagramas (C-15, C-16, C-18, C-19).
- **Pendientes completos:** adjuntos, formulario de arranque, respuestas que la IA toma sola, preguntas del chat que pasan a `Q-n` (C-24 a C-26, C-28).
- **Puente:** del celular a la PC y la misma pieza para otro proyecto y otra app (C-41, C-42).

### Could
- Las Could de `02-definicion.md` (C-17, C-20, C-27, C-34, C-43, C-46 a C-48).
- Las ideas de `07-construccion.md` › Ideas nuevas que no tienen frente: la sección de aprobados provisionales y el atajo a las ideas.
- Número de versión y `CHANGELOG.md` (D-077: la opción A de Q-109, cuando quieras).

### Defectos y deuda abiertos
- **Defecto 1** (`08-calidad.md` › Defectos): una prueba que falló una vez en la tanda completa. En observación: si vuelve, se guarda su `error-context` y se investiga. 2026-11-04: las tres de `r3-electron` fallaron juntas en una tanda completa; pasaron solas y en la tanda siguiente (81 de 81).
- **Defecto 4:** `minimatch` vulnerable dentro de `electron-builder`; no viaja en la app. Se cierra cuando `electron-builder` lo actualice (se mira en cada mantenimiento).
- **Deuda** (`07-construccion.md` › Deuda técnica): lo copiado del Gestor sin usar (se usa con C-9 y C-10, o se borra) y la ventana sin minificar (si el arranque pasa de 2 s).

### Fuera de este proyecto
- Poner al día `gestor-proyectos` y la guía `hitos-desarrollo-app` (D-062, D-063, D-068, Defectos 13 y 14) y traer a `Skills` las skills que la licencia permite (D-014): van en sesiones de `Skills`.

## Próxima versión
- **Objetivo:** el frente Inicio (Q-112, D-079): Ideas como sección del inicio y la grilla solo con proyectos. Después, Diseño y Capacidades.
- **Incluye:** `modulos/inicio/propuesta.md` › Propuesta de alcance.
- **Hitos a recorrer:** el ciclo reducido del módulo (`modulos/inicio/estado.md`); un ajuste chico va directo a 7 → 8 → 9.
- **Ajuste mediano (D-083):** la carpeta Iridium con Ideas y Skills, Mover y Cambiar en Ajustes, construido (7 → 8); falta tu prueba con tus carpetas (Q-122).
- **Ajuste chico (D-081):** Inicializar repositorio y Publicar en GitHub en la sección Git, construido (7 → 8); falta tu prueba con GitHub de verdad (Q-118).
- **Propuestas:** módulo Inicio: propuesta (Q-113: B) y definición, UX y diseño (Q-114: A) aprobados; IN-I1 construida, esperando la prueba del usuario (Q-115).
