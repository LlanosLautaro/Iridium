# Diseño técnico del módulo: Inicio

**Fecha:** 2026-11-02
> Respeta la arquitectura, el stack y las convenciones de `05-arquitectura.md`. Alcance: `definicion.md`; pantalla: `ux.md` › IN-W1. Se apoya en lo que ya hizo Skills (`modulos/skills/diseno-tecnico.md`).

## Contrato con el núcleo
### Qué usa del núcleo
| Función / dato / servicio | Para qué |
|---|---|
| La lista de proyectos y `CARPETA_GENERAL` (`compartido/puente.ts`) | Encontrar la carpeta `Ideas`, saber qué nombres de proyecto existen (los enlaces) y filtrar la grilla |
| La conversación (`Conversacion.tsx` con `chat="ideas"` y `sobre`) | El chat general, igual que en la grilla, con «Sobre la idea …» |
| La vigilancia de la carpeta de proyectos (`documentoAfectado`) | Volver a leer cuando cambia `Ideas/ideas.md`: ya avisa por los `.md` de la raíz de un proyecto |
| El render de markdown de Docs (`core/visor/markdown.ts`) | El cuerpo de cada idea, con sus enlaces y códigos |
| `abrirProyecto` y `escribirEnCampo` (`renderer/estado.ts`) | Abrir como proyecto, los enlaces a proyectos y Pedir que la integren |
| La lista con grupos plegables y el divisor de Skills | La columna de la izquierda |

### Qué expone
| Función / evento / dato | Quién lo usa |
|---|---|
| `ideas()` por IPC: las secciones con sus ideas, o por qué no hay | La sección Ideas |
| `esCarpetaDeSeccion(nombre)` | La grilla, para no mostrar `Ideas` ni `Skills` |

## Estructura interna
- **`main/core/ideas.ts` (puro):** `leerIdeas(texto)`. Cada `## ` es una sección (con la línea que la explica, si hay); cada `### ` dentro, una idea. Del título de la idea sale la fecha si termina en `— AAAA-MM-DD` (con raya, guion o sin espacios). La línea `Toca a:` da los proyectos: los nombres entre comillas invertidas. Una línea que empieza con `→` es a dónde fue (integradas). Lo demás es el cuerpo, tal cual. Si no hay ningún `## ` ni `### `, devuelve el texto entero como «sin secciones». Sin disco.
- **`main/infra`:** la lectura de `Ideas/ideas.md` con el tope de 2 MB de Docs (Defecto 8).
- **`main/app/ideas.ts`:** el caso de uso `ideas()`: `{ tipo: 'ideas', secciones }`, `{ tipo: 'sin-secciones', html }`, `{ tipo: 'sin-carpeta' }`, `{ tipo: 'sin-archivo' }` o `{ tipo: 'grande', bytes }`. El cuerpo de cada idea va ya renderizado con el markdown de Docs; los proyectos que toca se marcan como existentes o no con la lista de proyectos.
- **`renderer/secciones/ideas/`:** `Ideas.tsx` (las tres columnas, como `Skills.tsx`), `ListaIdeas.tsx` y `DetalleIdea.tsx`. El chat es el `ChatGeneral` de Proyectos, que pasa a `secciones/inicio/ChatGeneral.tsx` para que lo usen los dos.
- **La sección:** una línea más en `secciones/index.ts` (`id: 'ideas'`, atajo `4`, ícono `ideas`); las demás no se tocan (B-11).
- **La grilla:** `Proyectos.tsx` deja afuera las tarjetas cuya carpeta es `CARPETA_GENERAL` o `CARPETA_SKILLS`. Solo la grilla: la lista de proyectos sigue entera para las sesiones, Pendientes, Skills y los chats.
- **«Sobre …» del chat:** hoy `Conversacion` dice siempre «Sobre la skill»; `sobre` pasa a traer también qué es (skill o idea), y Skills no cambia.
- **Abrir como proyecto:** un botón en la cabecera de Ideas y de Skills que llama a `abrirProyecto` con la ruta de esa carpeta.

## Datos
Nada nuevo en disco salvo `anchoListaIdeas` en `config.json` (como `anchoListaSkills`; si falta, el de siempre). La idea elegida, los grupos plegados y si se quitó «Sobre la idea …» se recuerdan en memoria mientras Iridium está abierto (H-6). La idea elegida se recuerda por su título: si la IA la cambia de sección, sigue elegida.

## Mensajes que escribe en el chat
- **Sobre la idea:** `Sobre la idea «<título>»: <lo escrito>`.
- ~~**Pedir que la integren:**~~ sacado con Q-115. Era: `Integrá la idea «<título>» donde corresponda, con las reglas de CLAUDE.md › Cuando una idea madura.` Queda escrito en el cuadro, sin mandar.

## Seguridad
P2 sin cambios: lee un archivo de la carpeta de proyectos. La ruta de `ideas.md` la arma el proceso principal (la ventana no manda rutas). El cuerpo se muestra con el mismo render que Docs, que no deja pasar HTML del archivo.

## Pruebas
- **`tests/in1-ideas.test.ts` (Vitest):** `leerIdeas` con el `ideas.md` real copiado como muestra (3, 4 y 5 ideas; las fechas; `Toca a:`; el `→`); sin fecha; con guion en vez de raya; sin secciones; vacío; el caso de uso sin carpeta, sin archivo y grande.
- **`tests/e2e/in1-ideas.spec.ts` (Playwright, motor falso):** `Ctrl+4` abre Ideas; los grupos con su número e Integradas plegada; elegir una idea y mandar un mensaje con «Sobre la idea …»; Pedir que la integren deja el pedido en el cuadro; un enlace a un proyecto lo abre; cambiar `ideas.md` desde afuera actualiza la lista; la grilla sin `Ideas` ni `Skills` y con el chat; Abrir como proyecto desde Ideas y desde Skills. También en Carbón.
- **Con las carpetas reales:** `tools/capturas.ts` suma la sección Ideas y la grilla nueva.

## Iteraciones
| ID | Objetivo | Historias |
|---|---|---|
| IN-I1 | La sección Ideas, la grilla solo con proyectos y Abrir como proyecto | IN-1 a IN-3 |

Una sola: es chica y casi todo reusa piezas de Skills.
