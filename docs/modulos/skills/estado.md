# Estado del módulo: Skills

**Tipo:** sección
**Última actualización:** 2026-11-20
**Nivel de protección:** hereda P2. Editar una skill la cambia para todos los proyectos: cada cambio va con git y se puede deshacer (D-018).

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (Q-83) | `propuesta.md` |
| 2. Definición | hecho (D-064) | `definicion.md` |
| 3. Investigación | hecho | `investigacion.md` |
| 4. UX | hecho (Q-89, con el chat a la derecha; D-068) | `ux.md` |
| 5. Diseño técnico | hecho (con precisiones al construir) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | hecho: las cuatro piezas, construidas sobre la columna de Pendientes y el chat de Ideas | `06-ui.md` › Pantallas, `DESIGN.md` › Skills |
| 7. Construcción | hecho (SK-I1 aprobada, Q-95; los archivos de cada skill, Q-96; la lista cambia de ancho, R-6) | este archivo |
| 8. Calidad | hecho (con el hito 8, `08-calidad.md`; portón aprobado en Q-108) | este archivo |
| 9. Lanzamiento | hecho (con el hito 9, `09-lanzamiento.md`; portón aprobado en Q-111) | este archivo |

## En qué estamos ahora
La construcción del módulo está completa: SK-I1 aprobada (Q-95) y los archivos de cada skill probados (Q-96, sin cambios). Con tu comentario R-6, la lista de skills cambia de ancho arrastrando su borde derecho, y lo recuerda. La calidad pasó con el hito 8 (Q-108). Lanzado con el hito 9 (Q-111, 2026-11-02): el módulo está en uso y sigue con la operación del proyecto (hito 10). Desde el 2026-11-20 el framework reemplaza a la guía vieja y a `gestor-proyectos` (T-43): las dos skills y el hook viejo ya no están.

## Ruta
- [x] Ver y poner al día las skills
- [x] Que el framework reemplace a la guía vieja y a gestor-proyectos (T-43)
- [ ] Traer las skills que la licencia permite (T-44, mediano; se hace en la carpeta de Skills, fuera de este repo, y qué skills traer lo elegís vos)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `04-ux.md` › Arquitectura de información y Principios de interacción | Skills como tercer ícono del inicio y `Ctrl+3` | D-068 | sí |
| `05-arquitectura.md` › Estructura del repo y Seguí | La sección `skills/`, la instrucción de `Skills` por nombre de carpeta y la variable `IRIDIUM_CLAUDE` | D-068 | sí (SK-I1) |
| `06-ui.md`, `DESIGN.md` | Las cuatro piezas nuevas | — | sí (paso 6) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| SK-I1 | La sección completa: ícono y `Ctrl+3`, lista por origen con las dobles, detalle, chat de `Skills` y Poner al día (SK-1 a SK-4) | hecho, aprobada (Q-95); con los archivos de cada skill (Q-96) y la lista que cambia de ancho (R-6) |

## Log de iteraciones
### SK-I1 — La sección Skills (2026-10-31)
- **Paso 6:** las cuatro piezas nuevas (ícono ✦, grupo plegable, aviso del detalle y «Sobre la skill …») van en `DESIGN.md` › Skills; sin maqueta aparte, porque se arman sobre la columna de Pendientes y el chat de Ideas, ya aprobados.
- **Lectura:** las skills se leen de `%USERPROFILE%\.claude` cada vez que se entra (propias, copias de terceros, de la cuenta y de complementos, con la generación más nueva de cada complemento); las copias dobles, con cuál sobra; el formato vigente sale del `SKILL.md` de la guía y el de cada proyecto, de su `docs/README.md` o del bloque en su `CLAUDE.md`. La vigilancia avisa cuando cambia una skill propia o el formato de un proyecto.
- **Pantalla:** lista, detalle y el chat de `Skills` (sin Seguí, con su propia instrucción: responde y pregunta en el chat). Poner al día manda el pedido a la conversación de ese proyecto sin salir de Skills; el puente solo acepta proyectos de la lista de atrasados y carpetas de la lista de skills.
- **Encontrado al probar:** al quedar todos al día, el detalle saltaba solo a otra skill; ahora se queda en Proyectos atrasados y dice que no queda ninguno.
- **Verificado con tus carpetas reales** (`tools/capturas.ts`, sin enviar nada): 34 skills, 1 doble (`impeccable`), atrasados otras apps y otro proyecto. Capturas en `tools/salida/9-skills-*.png`.
- **Pruebas:** 448 de Vitest (14 nuevas en `sk1-skills.test.ts`, con enlaces reales en una carpeta temporal) y 53 de Playwright (3 nuevas en `sk1-skills.spec.ts`, una en Carbón; capturas `test-results/sk1-*.png`).
- **Aprobada** con tu prueba (Q-95): todo funcionó. Pediste ver los archivos de cada skill sin ir a la carpeta, con el explorador que ya usan los proyectos.
- **Los archivos de la skill (Q-95, 2026-10-31):** el detalle suma, debajo de la cabecera, el árbol de su carpeta y el visor de Archivos: **Resumen** (avisos y descripción) arriba y elegido al entrar; cada skill recuerda su archivo y sus carpetas abiertas. Solo lectura y sin salir de la carpeta de la skill (ni con `../` ni con una carpeta que no sea de la lista). El árbol y el visor ahora reciben de dónde leer, así los comparten Archivos y Skills.
  - **Verificado** con tus carpetas reales (`tools/salida/9-skills-archivos.png`: la guía con `references` abierta y `SKILL.md`, 247 líneas) y con una prueba nueva de Playwright (`sk1-skills.spec.ts` › los archivos de una skill). Pruebas: 448 de Vitest y 54 de Playwright, todas pasan.
  - **Probado por vos** (Q-96, 2026-11-01): los tres puntos funcionaron y no pediste cambios.
- **R-6 (2026-11-01), la lista de skills cambia de ancho:** su borde derecho se arrastra o se mueve con las flechas (Shift, de a más; doble clic, el de entrada), entre 200 y 640 px y sin dejar el detalle por debajo de 360 px; el ancho se guarda en `config.json` (`anchoListaSkills`). El borde de la conversación y este comparten el mismo componente. Prueba nueva en `sk1-skills.spec.ts` (arrastrar, flechas, el mínimo y que se recuerde al volver a abrir; captura `test-results/sk1-lista-ancha.png`). Pruebas: 448 de Vitest y 55 de Playwright, todas pasan.

### T-43 — El framework reemplaza a la guía vieja y a `gestor-proyectos` (2026-11-20)
- **Comparado** el contenido de las dos skills con el framework: todo estaba, salvo cómo se llena la ficha (descripción de hasta 180 caracteres, etiquetas, qué estado sigue al hito y cuáles decide el usuario) y el repaso de todos los proyectos. Pasaron a `referencias/ficha.md`, citada desde `SKILL.md` › La ficha.
- **Borradas** las dos skills de la carpeta Skills (con git: se pueden recuperar), sus enlaces en la carpeta de Claude y el hook `comprobar-preguntas.mjs` de la configuración global: el control de Iridium revisa lo mismo y más. La sección Skills deja de mostrarlas.
- **Instrucciones globales:** ya no describen el método; dicen que los proyectos se trabajan desde Iridium (D-093) y qué es un proyecto y qué una carpeta simple (D-095), y apuntan a la carpeta Skills de Iridium en lugar de la vieja. El `CLAUDE.md` de Ideas, igual.
- **No tocado:** los `CLAUDE.md` de los demás proyectos (se ponen al día con Pasar al framework) ni las fichas.

## Próximo paso
Lo que sigue en la ruta: traer las skills que la licencia permite (T-44), cuando se elija. Sus errores y mejoras van a `trabajo.md`.
**Leer antes:** nada.
