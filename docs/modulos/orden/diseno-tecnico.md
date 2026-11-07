# Diseño técnico del módulo: Orden

**Fecha:** 2026-11-06
**Base:** `definicion.md` (OR-1 a OR-12), `04-ux.md` (reescrito con el frente: H-18 a H-22, F-7 a F-9, W-1 a W-17), `05-arquitectura.md` y el código de hoy.

Orden no suma una sección aparte: cambia el núcleo. Por eso este documento dice qué piezas del núcleo cambian y cuáles se suman, y los cambios generales van a `05-arquitectura.md` (tabla «Cambios requeridos» de `estado.md`).

## Contrato con el núcleo
### Qué usa
- Los lectores de `core/` (`visor/preguntas.ts`, `visor/respuestas.ts`, `visor/codigos.ts`, `mapa.ts`, `metadatos.ts`, `ideas.ts`) y la vigilancia de archivos.
- La conversación (`app/conversacion.ts`): el fin de cada turno y `enviar`.
- Armar y la versión nueva (`infra/sin-armar.ts`, `infra/version-nueva.ts`, `infra/version-github.ts`) y el cierre de la app (F-6).
- `escribirAtomico` de `infra/escritura.ts`.

### Qué cambia del núcleo
| Pieza | Cambio | Por qué |
|---|---|---|
| `core/mapa.ts` | Lee los estados con el vocabulario único; lee los frentes de la tabla «Módulos» y el paso `en curso` de cada uno | OR-5, A-5 |
| `core/pendientes.ts` y `visor/preguntas.ts` | Leen `Frente:` y `en pausa` de cada pregunta | OR-3, OR-6 |
| `core/metadatos.ts` | Lee `nombre` de la ficha | OR-10 |
| `core/guia.ts` | Lee `**Framework:** AAAA-MM-DD` en lugar de `**Formato de la guía:**` | OR-8, D-099 |
| `app/conversacion.ts` | Al terminar un turno corre el control y, si hace falta, le devuelve la lista a la IA | OR-2 |
| `infra/sin-armar.ts` y `version-nueva.ts` | Se juntan detrás de un `Actualizador` | R-12 |
| `config.json` | `anchoConversacion` por vista (reemplaza el ancho único) | D-098 |
| `recursos/plugins/iridium` | Pasa a ser el framework entero; la guía de hitos deja de cargarse | OR-1, D-092 |

### Qué se suma
| Pieza | Capa | Qué hace |
|---|---|---|
| `core/estados.ts` | reglas puras | El vocabulario (`pendiente`, `en curso`, `en pausa`, `hecho`, `descartado`, `nueva`) y cómo se lee una palabra |
| `core/trabajo.ts` | reglas puras | Lee `docs/trabajo.md` y arma el texto de una idea nueva |
| `core/control/` | reglas puras | Las reglas del control, una por archivo, y el mensaje para la IA |
| `infra/trabajo.ts` | disco | Anota una idea sin pisar lo que escribe una sesión |
| `app/control.ts` | casos de uso | Junta lo que lee el control de un proyecto y lo corre |
| `infra/actualizar.ts` | disco y procesos | El `Actualizador` de W-1 |

## El vocabulario (`core/estados.ts`)
- `leerEstado(texto)` devuelve un estado del vocabulario o `null`. Acepta mayúsculas, acentos y las dos formas de género (`hecho`/`hecha`). Una celda con más texto («en curso: la arquitectura aprobada…») se lee por su primera palabra o par de palabras.
- **Framework viejo:** en un proyecto que no pasó al framework, las palabras de antes (`completo`, `saltado`, `reabierto`, `aprobada`…) se traducen con una tabla de transición (`completo` → `hecho`, `saltado` → `descartado`, `reabierto` → `en curso`), así su Mapa no se rompe hasta que lo pase. En un proyecto con framework, una palabra de afuera es un aviso del control y el Mapa la muestra tal cual, en gris.
- El Mapa, la tarjeta y el control usan solo este lector (A-21).

## Las preguntas
- `Frente: Compartir` va en la línea `Tipo:` (`Tipo: tarea · frena · Frente: Compartir`) o en una línea propia debajo; el lector acepta las dos y el framework enseña la primera. Sin frente, es del núcleo.
- `en pausa` es una palabra más de la línea `Tipo:`. Una pregunta en pausa no cuenta en ningún total ni aviso.
- `PreguntaNueva` suma `frente: string | null` y `enPausa: boolean`. La Bandeja arma los filtros con los frentes que aparecen.

## `trabajo.md`
### Formato
```markdown
# Trabajo

## T-12 — Bandeja agrupada por frente
Estado: pendiente · Frente: Orden · Fecha: 2026-11-05 · Origen: D-091
Con filtros arriba, no una pestaña por frente.
```
- Un ítem por `## T-n — título`; la primera línea, sus datos separados por `·`; lo demás, su texto. El orden del archivo no importa: Iridium ordena por estado y fecha.
- `T-n` nace en un título, así que el índice de códigos de Docs ya lo reconoce (`visor/codigos.ts` acepta de una a cuatro letras) y un `T-n` en cualquier texto es un enlace. El enlace lleva a Trabajo en lugar de a Docs (F-4): `resolverCodigo` mira el prefijo.

### Leer (`core/trabajo.ts`)
- `leerTrabajo(texto)` devuelve los ítems con código, título, estado (del vocabulario o `null`), frente, fecha, origen y texto, y la lista de lo que no se pudo leer (para el control).
- Ideas (W-10) junta los ítems `nueva` de cada proyecto con framework; el Mapa, los `en curso` del frente activo.

### Anotar sin la IA (`infra/trabajo.ts`)
El riesgo es que Iridium y una sesión escriban `trabajo.md` a la vez (`definicion.md` › Preguntas abiertas para investigar). Se resuelve así:
1. Iridium lee el archivo y la fecha de modificación, arma el ítem (`T-n` = el más alto + 1) y lo agrega **al final**.
2. Escribe con `escribirAtomico` solo si la fecha de modificación no cambió desde que leyó; si cambió, vuelve a 1 (hasta tres veces) y si no, devuelve el error y W-10 deja el texto en el campo con **Reintentar**.
3. Del lado de la IA, las herramientas de edición de Claude Code se niegan a escribir un archivo que cambió desde que lo leyeron: vuelven a leer. Ninguna de las dos pisa a la otra.
4. Si las dos sacan el mismo `T-n` en el mismo segundo, el control marca el código repetido y la IA lo renumera al terminar su turno.

Sin `trabajo.md`, Iridium lo crea con su título. Una idea suelta se escribe en `Ideas/ideas.md` con el formato que ya lee `core/ideas.ts`, con el mismo cuidado.

## El control (`core/control/` y `app/control.ts`)
### Qué lee
`estado.md` (y los `estado.md` de `docs/modulos/*`), `trabajo.md`, `docs/respuestas/`, `docs/README.md` y los bloques de código de `docs/**/*.md` (la regla de los dibujos, R-13). Lo lee con los mismos lectores que la pantalla: no hay un segundo lector (A-16).

### Las reglas
Una función pura por regla, `(archivos) => Aviso[]`, con `Aviso = { regla, archivo, linea, texto }`, donde `texto` le dice a la IA qué arreglar en una línea. Las reglas son las de `definicion.md` › El control. Cada caso de la auditoría (A-13 a A-17) es una prueba de su regla.

### Cuándo corre
- **Solo en proyectos con framework** (`docs/README.md` con `**Framework:**`). En uno con framework viejo, el control no corre: sería una lista enorme; lo que se ve es «framework viejo» y Pasar al framework.
- **Al terminar cada turno** con resultado `ok` de una sesión de proyecto (no en el chat general ni en el de Skills). No corre si el usuario detuvo a la IA.
- **Al leer la tarjeta:** los avisos que se ven («! 2 avisos del framework») son el resultado del control en ese momento, no algo guardado. Se recalcula cuando la vigilancia ve un cambio en `docs/`, como hoy la tarjeta. Corre sobre texto ya leído: medido sobre este proyecto, tiene que tardar menos de 50 ms (se mide en la iteración).

### Cómo se le devuelve a la IA
Cada sesión se cierra al terminar el turno y se reabre con la misma conversación (D-037). En `terminarTurno`, con resultado `ok`:
1. Si el turno no fue a su vez una devolución del control, corre el control.
2. Si encontró algo, en lugar de dejar la pestaña en «terminada», manda a la misma conversación un mensaje con origen `control`: «El control de Iridium encontró esto mal escrito; corregilo y no hagas nada más:» y la lista. La pestaña sigue «trabajando».
3. La conversación lo muestra como una entrada nueva, `control`, plegable («El control encontró 2 cosas mal escritas; la IA las corrige», W-12), no como un mensaje del usuario.
4. Al terminar ese turno, no se vuelve a devolver (una vez por turno, sin ciclos). Lo que quede, queda como aviso en la tarjeta y en Skills › Framework.
5. Las preguntas nuevas y el aviso de H-13 se calculan al terminar la devolución, no antes, para que el usuario vea las preguntas ya corregidas.

Si el usuario manda un mensaje mientras corre la devolución, se suma al turno como cualquier mensaje en cola.

### Lo que se saca
El hook `comprobar-preguntas.mjs` de la guía (en la configuración global de Claude Code) deja de hacer falta: se saca en el chat de Skills cuando el control funcione, junto con la guía (D-092.4).

## El Mapa con frentes (A-5)
- La tabla «Módulos» de `estado.md` cambia de columnas: `| Frente | Tipo | Paso | Estado |`, con el estado del vocabulario: `en curso` es el activo, `pendiente` está en espera, `hecho` está en operación. El framework enseña esta tabla; Pasar al framework la convierte.
- El paso de cada frente sale de su `docs/modulos/<nombre>/estado.md` › Progreso: el que está `en curso` (no el primero sin hacer). Su Próximo paso, de su `## Próximo paso`.
- El bloque «En tu bandeja» del frente filtra las preguntas por `Frente:`; «En curso», los `T-n` `en curso` de ese frente.

## Actualizar (R-12, `compartido/actualizar.ts` e `infra/sin-armar.ts`)
Una función junta lo que eran dos chips y da un solo estado a la barra (`estadoActualizar`, con lo que leen las dos vigías):

| Estado | Sale de |
|---|---|
| `al-dia` | ni cambios sin armar ni versión lista |
| `disponible` (con el detalle) | `VigiaSinArmar` dice que falta armar, o `VigiaVersionNueva` (o la de GitHub en una copia compartida) dice que hay una lista |
| `armando` (con desde cuándo) | `release/armando.json` con su proceso vivo |
| `fallo` (con el motivo) | el armado terminó sin versión nueva: `actualizar.ps1` deja `release/armado-fallo.json` con el motivo |
| `bloqueado` | la IA de Iridium está trabajando (como hoy, CO-I6) |

- **Actualizar** con una versión lista llama al mismo camino que «Reiniciar ahora» (F-6 si hay sesiones; F-6 suma **Esperar**). Sin versión lista, arma y la barra recuerda el pedido (con la versión que había); cuando aparece otra versión lista y el armado terminó (el script todavía sube `main` después de dejarla), sigue igual que con una lista. El pedido vive en la ventana: si Iridium se cierra mientras arma, la versión entra al cerrar, como siempre.
- El armado corre suelto y con la consola escondida (`start /min` y PowerShell oculto): sin eso, cada programa de consola abre su ventana. `actualizar.ps1` anota todo en `release/armado.log`, escribe `desde` en `armando.json` y deja `armado-fallo.json` con el motivo si no pudo; una marca sin su proceso es un armado cortado (falló).
- **Cancelar** corta el árbol de procesos del armado (`taskkill /T /F` con el `pid` de `armando.json`) y borra la marca; `actualizar.ps1` limpia lo que dejó a medias al arrancar la próxima vez.
- **Ver la consola** abre `release/armado.log` (`actualizacion.log` sigue siendo el de poner la versión).
- Las pruebas usan `IRIDIUM_ARMAR` (un comando falso que escribe una versión de muestra) e `IRIDIUM_RELEASE`, como hoy.

## Lo demás
- **Un número que manda:** el total de la bandeja ya se calcula para el ícono de Pendientes; pasa al botón de inicio y el ícono queda sin número. La regla del amarillo es una función de `core/` (`colorDeCuenta(cuenta, frena)`) que usan el botón, la tarjeta y la pestaña.
- **La conversación de 360 px:** `config.json` guarda `anchoConversacion` como `{ general, skills, proyectos: { [ruta]: px } }`; el valor viejo se usa para todas las vistas la primera vez.
- **Carpetas simples (D-095):** la grilla ya sabe si una carpeta tiene `estado.md`; la tarjeta y la vista de proyecto cambian con eso (W-2, W-3). El control no corre sobre ellas.
- **Pasar al framework:** es el «Poner al día» de Skills con otro mensaje: lee la fecha del framework de `recursos/plugins/iridium` y manda a la conversación del proyecto el pedido de pasar al framework (mover ideas y pendientes a `trabajo.md`, cambiar los estados, la tabla de frentes y `**Framework:**`). Termina cuando el control da cero.
- **Docs (A-10):** las tablas, dentro de un recuadro con desplazamiento propio y el ancho de la sección; el texto conserva su ancho de lectura.
- **El framework (OR-1):** `recursos/plugins/iridium/skills/iridium/` con `SKILL.md` (cada sesión: dónde estás, el modelo, los formatos, el cierre), `referencias/` (un archivo por hito y por tipo de trabajo: módulo, operación, ronda de UX) y `plantillas/`. `tools/armar-plugins.mjs` deja de copiar la guía de hitos; el motor carga solo el complemento de Iridium.

## Datos
| Qué | Dónde | Quién escribe |
|---|---|---|
| Trabajo (`T-n`) | `docs/trabajo.md` de cada proyecto | la IA; Iridium agrega ideas `nueva` |
| Fecha del framework | `docs/README.md`, `**Framework:** AAAA-MM-DD` | la IA, al pasar al framework |
| Nombre visible | `.proyecto.json`, `nombre` (opcional) | la IA |
| Ancho de la conversación por vista | `config.json`, `anchoConversacion` | Iridium |
| Avisos del control | no se guardan: se calculan | — |

No hay datos nuevos de terceros ni nada que salga de la PC: el perfil sigue en P2.

## Pruebas
- **Vitest:** cada regla del control con los casos de la auditoría (una pregunta suelta, `### Q-n`, una prueba con opciones, una respuesta sin «Procesada», un estado fuera del vocabulario, un dibujo con `⚙`); `leerTrabajo` y el texto de una idea; el vocabulario con la tabla de transición; anotar con una escritura en el medio (la fecha cambia y reintenta); los estados del `Actualizador`.
- **Con el motor falso:** `IRIDIUM_FALSO_MAL=1` deja una pregunta mal escrita en el turno; la prueba ve la entrada `control`, la pregunta corregida y la tarjeta sin avisos. Sin corregir (`IRIDIUM_FALSO_MAL=terco`), la tarjeta muestra el aviso y no hay un segundo envío.
- **Playwright:** la Bandeja con filtros por frente y las en pausa; anotar una idea desde Ideas y desde Trabajo; el Mapa en operación de un proyecto de muestra; Actualizar con `IRIDIUM_ARMAR` (disponible → armando → reinicio pedido; y fallo).
- **Sobre este proyecto:** el control da cero después de pasarlo al framework (criterio de éxito).

## Iteraciones
| ID | Objetivo | Historias |
|---|---|---|
| OR-I1 | El modelo y el control: el vocabulario, las preguntas con frente y en pausa, `trabajo.md` (leer), el control con su devolución al terminar el turno y los avisos en la tarjeta, el framework reordenado y este proyecto pasado al framework | H-21, OR-1 a OR-3, OR-5 |
| OR-I2 | El esqueleto y la Bandeja: un número que manda y el amarillo solo para lo que frena, la cabecera común, la conversación de 360 px por vista, Actualizar, la Bandeja de entrada con filtros por frente y en pausa, el nombre de la ficha | H-1, H-9, H-22, OR-6, OR-10 |
| OR-I3 | Trabajo e Ideas: la sección Trabajo, Ideas con las nuevas de todos y anotar sin la IA | H-18, H-19, OR-4 |
| OR-I4 | El Mapa con frentes, Skills › Framework y Pasar al framework, las carpetas simples, las tablas de Docs y la ronda de UX en el framework | H-7, H-20, OR-8, OR-9, OR-11 |

El orden va por riesgo: OR-I1 es lo nuevo de verdad (que la IA reciba y corrija en el mismo turno) y todo lo demás lee lo que ella define. OR-I2 lleva Actualizar porque R-12 está reportado y es chico. Antes de OR-I2, el paso 6 suma al design system las piezas nuevas (abajo).

## Para el paso 6 (UI)
Piezas que la interfaz no tiene todavía: los filtros con cuenta de una cabecera (W-9), el campo de anotar con su selector (W-10), la entrada `control` de la conversación (W-12), la línea de avisos de la tarjeta, el recuadro de la carpeta simple (W-3), el bloque de frentes del Mapa (W-7), el botón Actualizar con sus estados (W-1) y la regla del amarillo aplicada a cuentas, pestañas y bordes.

## Riesgos
- **La IA no corrige lo que le devuelve el control.** Queda como aviso a la vista y no se reintenta solo; si pasa seguido, la regla del framework está mal escrita y se arregla ahí (`definicion.md` › El control).
- **Una devolución gasta uso** en cada turno con errores. Es chico (un mensaje corto con la conversación en caché) y baja a cero cuando el framework enseña bien.
- **Cambiar la tabla «Módulos»** rompe el Mapa de los proyectos con framework viejo: la tabla de transición lee también las columnas de antes.
