# Diseño técnico del módulo: Skills

**Fecha:** 2026-10-31
> Respeta la arquitectura, el stack y las convenciones de `05-arquitectura.md`. Alcance: `definicion.md` (D-064); pantalla: `ux.md` › SK-W1; decisiones: D-068.

## Contrato con el núcleo
### Qué usa del núcleo
| Función / dato / servicio | Para qué |
|---|---|
| La lista de proyectos (`listarProyectos`, con su ficha `.proyecto.json`) | Los proyectos que pueden estar atrasados, su ícono, si están archivados, descontinuados o reemplazados |
| La conversación de un proyecto (`Conversacion.tsx`, `enviar`, el estado de la sesión) | El chat de `Skills` y el pedido de Poner al día, con su ● trabajando |
| La vigilancia de la carpeta de proyectos (`infra/vigilancia.ts`) | Volver a leer cuando cambia `Skills/skills/` o el `docs/README.md` o `CLAUDE.md` de un proyecto |
| `abrirCarpeta` (`app/casos.ts`) | **Abrir carpeta** de una skill |
| Las instrucciones de sesión (`core/sesiones.ts`) | Elegir la de un chat que se mira para `Skills` |

### Qué expone
| Función / evento / dato | Quién lo usa |
|---|---|
| `skills()` por IPC: los cuatro grupos, las copias dobles y los errores de lectura | La sección Skills |
| `atrasados()` por IPC: el formato vigente y los proyectos atrasados con el suyo | La sección Skills; más adelante, el panel del módulo Inicio |
| `ponerAlDia(ruta)` por IPC | La fila de cada proyecto atrasado |
| La sección como lista + detalle + chat, sin depender del marco | El módulo Inicio, que la puede usar como panel (`propuesta.md`) |

### Para plugins
- No aplica (Iridium no tiene plugins).

## Estructura interna
- **`main/core/skills.ts` (puro):** entiende el `SKILL.md` (lo que va entre los `---` del principio: `name` y `description`, con o sin comillas, en una o varias líneas), decide el origen, encuentra las copias dobles y cuál sobra, y lee las fechas de formato. Sin disco.
- **`main/infra/skills.ts`:** recorre las carpetas de Claude (abajo) y devuelve lo crudo: carpeta, texto del `SKILL.md`, si es un enlace y adónde lleva, y el nombre del complemento. Nunca falla entera: cada carpeta que no se puede leer vuelve como error de su grupo.
- **`main/app/skills.ts`:** los casos de uso `skills()`, `atrasados()` y `ponerAlDia(ruta)`.
- **`renderer/secciones/skills/`:** `Skills.tsx` (las tres columnas), `ListaSkills.tsx` (los grupos plegables y la entrada Proyectos atrasados), `DetalleSkill.tsx`, `Atrasados.tsx` y el chat, que es `Conversacion` con la carpeta de `Skills`, como `ChatGeneral` de Proyectos.
- **La sección:** una línea más en `secciones/index.ts` (`id: 'skills'`, atajo `3`); las demás no se tocan (B-11).

## Dónde se leen las skills
Con la carpeta de Claude (`%USERPROFILE%\.claude`; en las pruebas, `IRIDIUM_CLAUDE`):
| Grupo | Carpeta | Cómo se reconoce |
|---|---|---|
| Propias | `skills\<nombre>\` | Es un enlace (junction) que lleva a una carpeta dentro de `Skills\skills\`. Si lleva a otro lado, es copia de un tercero; si no lleva a ningún lado, propia con ⚠ enlace roto (el nombre dice de quién era) |
| Copias de terceros | `skills\<nombre>\` | Una carpeta real con `SKILL.md` |
| Desde la cuenta | `skills\synced\<cuenta>\<nombre>\` | Todas las de adentro |
| De complementos | `plugins\synced\<cuenta>\<complemento>\skills\<nombre>\` | El nombre del complemento sale de `.claude-plugin\plugin.json` (`name`); el de la skill, como lo muestra Claude Code: `complemento:skill` |

Se saltan `.trash`, `.in_use` y las carpetas sin `SKILL.md`. Las carpetas de `synced` tienen nombres internos de Claude Code que pueden cambiar: se recorren sin suponer cuántas hay, y si dejan de existir el grupo queda vacío, no da error. La lista que informa el SDK al empezar una sesión (`skills` y `plugins`) sirve para comprobar esto en `tools/probar-motor.ts`, no para armar la lista (pediría abrir una sesión).

## Copias dobles
Una skill está dos veces si el mismo nombre aparece en dos lugares, comparando el nombre sin el complemento (`impeccable` y `impeccable:impeccable`). Cuál sobra, en este orden: la carpeta suelta sobra frente a un complemento (el complemento se actualiza solo, D-014); una copia de un tercero sobra frente a una propia; entre dos de la cuenta o de complementos, no se elige y el aviso solo dice dónde está cada una.

## Proyectos atrasados (D-068)
1. **El formato vigente:** en el `SKILL.md` de la guía (la propia `hitos-desarrollo-app`; si no está, la que haya con ese nombre), primero una línea `**Formato vigente:** AAAA-MM-DD`; si no, la fecha en negrita de la frase «El formato vigente de esta guía es el del **AAAA-MM-DD**». Sin ninguna: «No sé qué formato pide la guía».
2. **El de cada proyecto:** la línea `**Formato de la guía:** AAAA-MM-DD` de `docs/README.md` (con la lectura tolerante de `core/guia.ts`: con o sin los dos puntos adentro, sin acentos).
3. **Atrasado:** tiene `docs/estado.md`; su ficha no está archivada, ni descontinuada, ni reemplazada; y su fecha es anterior a la vigente, no la tiene, o su `CLAUDE.md` tiene el bloque «Actualización de formato pendiente». Se muestra «formato del 16 de octubre», «sin formato» o «marcado a mano» (este gana si tiene el bloque).
4. **Poner al día:** `ponerAlDia(ruta)` manda a la conversación del proyecto, como un mensaje del usuario: «Poné al día el formato de la documentación de este proyecto: seguí `references/actualizar-formato.md` de la guía `hitos-desarrollo-app`.» Si la sesión está trabajando, el puente lo rechaza (el botón ya está apagado). Al terminar, la vigilancia ve el `docs/README.md` nuevo y el proyecto sale de la lista.

## El chat de `Skills`
- Es la conversación del proyecto `Skills` de la carpeta de proyectos (la ruta se busca por el nombre de la carpeta, `CARPETA_SKILLS`, como `CARPETA_GENERAL` para Ideas). La misma sesión se ve en Skills y en la vista de ese proyecto.
- **Instrucción:** `INSTRUCCION_SKILLS` en `core/sesiones.ts`, como la de Ideas: el usuario mira y conversa sobre sus skills y la configuración de Claude, las reglas están en el `CLAUDE.md` de esa carpeta, responde y pregunta en el chat. El puente la elige por el nombre de la carpeta, igual que hoy elige la de Ideas (`ipc/puente.ts`).
- **Sin Seguí**, como el chat de Ideas (no tiene `estado.md`).
- **«Sobre la skill …»:** solo en la ventana. Al enviar, el texto sale como `Sobre la skill <nombre>: <lo escrito>`. «Pedir que la saquen» y «Pedir que lo arreglen» escriben su pedido en el cuadro de esa conversación (lo escrito sin enviar se guarda como todo, D-060).

## Datos
No guarda nada nuevo: todo se lee de las carpetas de Claude y de los proyectos cada vez. Lo único que recuerda es la skill elegida y qué grupos están plegados, en memoria mientras Iridium está abierto (H-6).

## Actualizar lo que se ve
- Al entrar a la sección se vuelve a leer todo (cuesta poco: unas 35 carpetas).
- Con la sección abierta, la vigilancia de la carpeta de proyectos avisa cuando cambia algo en `Skills\skills\` (la lista) o en `docs/README.md` o `CLAUDE.md` de un proyecto (los atrasados). La carpeta de Claude no se vigila: los cambios de la cuenta y los complementos se ven al volver a entrar.

## Seguridad
P2 sin cambios: solo lee carpetas de la PC y manda mensajes a sesiones como cualquier proyecto. Las rutas que llegan por el puente (`ponerAlDia`, `abrirCarpeta`) se validan contra la lista que armó el proceso principal: no se abre ni se escribe en una ruta que no salió de ahí. El texto de un `SKILL.md` se muestra como texto, nunca como HTML.

## Pruebas
- **`tests/sk1-skills.test.ts` (Vitest):** el `SKILL.md` con comillas, en varias líneas, roto; los cuatro orígenes en una carpeta temporal con un enlace real (junction), uno roto y uno que lleva afuera; `.trash` y `.in_use` afuera; las dobles y cuál sobra; las dos formas del formato vigente; los atrasados con fecha vieja, sin fecha, con el bloque, archivado, reemplazado y sin `estado.md`; el puente rechaza una ruta que no está en la lista.
- **`tests/e2e/sk1-skills.spec.ts` (Playwright, motor falso, `IRIDIUM_CLAUDE` con una carpeta de muestra):** `Ctrl+3` abre la sección; los grupos y la doble; el chat con «Sobre la skill …» manda el mensaje con el nombre; Poner al día deja la fila en ● trabajando y, cuando el motor falso escribe la fecha nueva, sale de la lista; sin `Skills`, el aviso. Todo también en Carbón.
- **Con las carpetas reales:** `tools/capturas.ts` suma la sección; se comprueba que salgan las 34 skills de esta PC y los tres atrasados.

## Iteraciones
| ID | Objetivo | Historias |
|---|---|---|
| SK-I1 | La sección Skills completa: el ícono y `Ctrl+3`, la lista por origen con las dobles, el detalle, el chat de `Skills` y los proyectos atrasados con Poner al día | SK-1 a SK-4 |

Una sola: el chat reusa el de Ideas y los atrasados son una lista más; partirla sumaría una prueba del usuario sin bajar el riesgo. Antes, el paso 6 suma al design system las cuatro piezas nuevas de `ux.md` › Piezas de UI nuevas.

## Precisiones al construir (SK-I1, 2026-10-31)
- **Generaciones de un complemento:** Claude Code deja la versión anterior al lado de la nueva (`impeccable` e `impeccable~g3`). Se lee solo la generación más alta; si no, `impeccable` aparecía tres veces.
- **Las propias:** un enlace (junction) cuyo destino está dentro de `<carpeta de proyectos>\Skills\skills\`. La guía que da el formato vigente es la propia; si no hay, la primera con ese nombre.
- **El aviso de la doble** se dice desde la skill elegida: «Sobra esta carpeta: …» en la suelta y «Sobra la carpeta suelta: …» en la del complemento.
- **La instrucción de Skills** vale para toda conversación de `Skills`, también desde la vista de ese proyecto (el puente la elige por el nombre de la carpeta, como la de Ideas).
- **Sin Claude Code** (sin sesión o caído), Poner al día no manda nada: deja el pedido escrito en la conversación del proyecto y lo dice en la fila.
- **Los archivos de la skill (Q-95):** dos pedidos más del puente, `carpetaSkill` y `archivoSkill`, con el mismo control que Abrir carpeta (solo carpetas de la última lectura) y la lectura de Archivos (`infra/archivos.ts`), que no deja salir de la carpeta ni siguiendo enlaces. El árbol y el visor de `Archivos.tsx` reciben de dónde leer, así los usan la vista del proyecto y la sección Skills.
- **La primera elección queda fija:** si al entrar estaba Proyectos atrasados y se ponen todos al día, el detalle muestra «Ningún proyecto tiene un formato viejo» en vez de saltar a otra skill.
