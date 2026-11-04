# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Mantenerlo corto y al día.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-04
**Nivel de protección:** P2 — personal conectado (ver `perfil-proyecto.md`)

## Hito actual
10 — Operación — en curso: frente Inicio, IN-I1 construida, esperando tu prueba (Q-115)

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | completo | `00-idea.md` |
| 1 | Exploración | completo | `01-exploracion.md` |
| 2 | Definición y alcance | completo | `02-definicion.md` |
| 3 | Investigación de dominio | completo | `03-investigacion.md` |
| 4 | UX | completo | `04-ux.md` |
| 5 | Arquitectura técnica | completo | `05-arquitectura.md` |
| 6 | UI | completo | `06-ui.md` |
| 7 | Construcción | completo | `07-construccion.md` |
| 8 | Pruebas y calidad | completo (portón aprobado en Q-108, 2026-11-02) | `08-calidad.md` |
| 9 | Lanzamiento | completo (portón aprobado en Q-111, 2026-11-02) | `09-lanzamiento.md` |
| 10 | Operación | en curso | `10-operacion.md` |

Estados posibles: pendiente · en curso · completo · saltado (con motivo) · reabierto.

## Módulos
| Módulo | Tipo | Paso actual | Estado |
|---|---|---|---|
| Revisión de la app (`modulos/revision/estado.md`) | producto hermano | en operación (con el hito 10) | completo |
| Skills (`modulos/skills/estado.md`) | sección | en operación (con el hito 10) | completo |
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10) | completo |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | completo |
| Inicio (`modulos/inicio/estado.md`) | sección (frente activo, D-079) | 8. Calidad (IN-I1 construida) | en curso |

En espera, en este orden (D-079): Diseño y Capacidades (`02-definicion.md` › Módulos previstos).

## En qué estamos ahora
Hito 10, Operación: el frente activo es Inicio (D-079). Con Q-114 (A) quedó construida su única iteración, IN-I1: la sección Ideas (`Ctrl+4`) con tus ideas, la idea elegida y el chat general al lado; la grilla solo con proyectos, y **Abrir como proyecto** en Ideas y en Skills. Todas las pruebas pasan; falta que la pruebes vos. Aparte, con Q-117 la sección Git ya crea el repositorio y lo publica en GitHub (D-081); falta probarlo con tu cuenta (Q-118). Y con Q-119 (A) empezó la limpieza de D-082: el repo deja de nombrar tus otros proyectos; las pruebas y el código ya están. Con Q-120 (A) quedó construida la carpeta Iridium (D-083): Ideas y Skills aparte de los proyectos, con **Mover** para las tuyas; falta que la pruebes (Q-122).

## Pendientes del hito actual
- [ ] D-082, limpieza total: 1) pruebas, muestras y código hechos; faltan las herramientas (`recorrido.ts`, `medir.ts`, `capturas.ts`, `accesibilidad.ts` nombran proyectos, Ideas y `Skills` en la carpeta de proyectos) · 2) la carpeta Iridium (D-083): construida, falta tu prueba (Q-122) · 3) `docs/` (incluidos `docs/ui/` y `modulos/`) · 4) el repo nuevo (D-084).
- [ ] Con Q-115: cerrar el módulo Inicio (`modulos/inicio/estado.md`).
- [ ] Con D-080: si cambian los formatos que lee Iridium, cambiar también la guía de `Iridium para compartir` (parte 3).
- [ ] Poner al día la skill `gestor-proyectos` y la guía `hitos-desarrollo-app` (D-062, D-063, D-068, Defectos 13 y 14 del hito 8). Va en el chat de Skills.
- [ ] Traer a la carpeta Skills las skills que la licencia permite y sacar las copias dobles (D-014): va en el chat de Skills.
- [ ] Con Q-122, después de Mover: en el chat de Skills, poner al día las rutas que nombran la carpeta vieja (sus instrucciones globales y su `CLAUDE.md`); en el chat general, la sección «Dónde están los demás proyectos» del `CLAUDE.md` de Ideas.

## Preguntas abiertas
- **Q-115 — Probá la sección Ideas**
  Tipo: prueba · frena
  Contexto: `modulos/inicio/ux.md` (IN-1 a IN-3). Antes, armá la última versión (`scripts.md` › Armar la última versión, o **Armar** abajo en Iridium) y abrila. Fijate:
  - [ ] El ícono nuevo (la lamparita, debajo de Skills) y `Ctrl+4` abren Ideas, con tus ideas por sección e Integradas plegada
  - [ ] Elegir una idea la muestra entera al medio, con los proyectos que toca como enlaces que los abren
  - [ ] En el chat de la derecha dice «Sobre la idea …» y es la misma conversación que al lado de la grilla
  - [ ] **Pedir que la integren** deja el pedido escrito en el chat, sin mandarlo
  - [ ] La grilla ya no muestra `Ideas` ni `Skills`, y el número de arriba cuenta solo proyectos
  - [ ] **Abrir como proyecto** (arriba de la lista, en Ideas y en Skills) abre esa carpeta con Docs, Git y lo demás
  - [ ] Nada se ve raro en los dos temas
  Opciones: A) Todo bien · B) Algo falla o no me gusta (decime qué)
- **Q-118 — Probá crear y publicar un repositorio con tu GitHub**
  Tipo: prueba
  Contexto: D-081 (Q-117). Armá la última versión (`scripts.md` › Armar la última versión) y abrila. Usá una carpeta de prueba (con **Abrir como proyecto**) o un proyecto que quieras subir. Fijate:
  - [ ] Sin git, **Inicializar repositorio** hace el primer commit sin `node_modules` ni `.env`
  - [ ] **Publicar en GitHub** muestra tu cuenta (o abre la ventana de git para iniciar sesión)
  - [ ] Privado y Publicar: aparece «En GitHub · tu-usuario/nombre», y el repositorio está en GitHub como privado
  Opciones: A) Todo bien · B) Algo falla o no me gusta (decime qué)

- **Q-122 — Probá Mover tus carpetas Ideas y Skills a la carpeta Iridium**
  Tipo: prueba
  Contexto: D-083 (Q-120). Armá la última versión (`scripts.md` › Armar la última versión, o **Armar** abajo en Iridium) y abrila. Antes de Mover, que la IA no esté trabajando en el chat general ni en el de Skills. Fijate:
  - [ ] Arriba de la grilla aparece el aviso con **Mover**; antes de tocarlo, en Ajustes › Proyectos › Carpeta Iridium, **Cambiar…** y elegí (o creá) `C:\Iridium`: el aviso pasa a nombrar esa carpeta
  - [ ] Mover pide confirmación y después dice «Listo»; en la carpeta de proyectos ya no están `Ideas` ni `Skills`
  - [ ] Ideas (`Ctrl+4`) muestra tus ideas y el chat general sigue con la conversación de antes
  - [ ] Skills (`Ctrl+3`) muestra tus propias como «Propia · enlace a la carpeta Skills», sin enlaces rotos
  - [ ] En un chat nuevo de Claude Code (fuera de Iridium) tus skills siguen apareciendo
  Opciones: A) Todo bien · B) Algo falla o no me gusta (decime qué)

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Con Q-115: cerrar el módulo Inicio (`modulos/inicio/estado.md` › Próximo paso).
**Leer antes:** `docs/respuestas/Q-115.md` y `modulos/inicio/estado.md`.
D-082, etapa 1: que las herramientas de `tools/` elijan los proyectos de la copia sin nombrarlos y busquen Ideas y Skills en la carpeta Iridium (D-083); probarlas. Después, la etapa 3 (`docs/`) y, al final, el repo nuevo (D-084).
Con Q-122: si salió bien, cerrar la etapa 2 de D-082 y hacer las puestas al día de las rutas (Pendientes); si no, arreglarlo.
Con Q-118: si salió bien, anotarlo en `10-operacion.md` › Próxima versión; si no, arreglarlo (D-081).

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).
