# Diseño técnico del módulo: Abrir

**Fecha:** 2026-11-19
**Estado:** cerrado (las decisiones, en D-156)
**Base:** `definicion.md` (D-154), `ux.md` (D-155), D-122 (Iridium se arma sola); el código de hoy: los scripts (`src/main/core/visor/scripts.ts`, `DocumentosProyecto.prepararScript` en `src/main/app/visor.ts`, `src/main/infra/ejecutar.ts`), el armado de Iridium (`src/main/infra/sin-armar.ts`), la tarjeta (`src/main/app/proyectos.ts` › `tarjetaDe`), las sesiones en marcha (`enMarcha`) y el uso desde VS Code (D-027).
> Respeta la arquitectura, el stack y las convenciones de `05-arquitectura.md`.

## Las decisiones de este paso
1. **La marca es una línea más del script**, como `**Carpeta:**`: `**Marca:** ejecutar · escritorio` (o `página`, `consola`) en el script que abre el proyecto, y `**Marca:** armar` en el que lo arma. Una sola clave para las dos, sin comillas, así la plantilla y el control la reconocen igual que las otras líneas. La descripción del script es el detalle del botón (D-155): la marca no se muestra.
2. **Qué hace cada tipo**, con lo que Scripts ya sabe hacer:
   - **escritorio:** `**Ejecutar:**` con un archivo del proyecto (el `.exe`); se abre con Windows (`modo: 'lanzar'`). Si no existe, es el caso «todavía no está armada» (AB-2), no un error.
   - **página:** `**Abrir:**` con un archivo del proyecto (un `.html`) o con una dirección `http://` o `https://`; el archivo se abre con Windows y la dirección en el navegador (`shell.openExternal`). Las direcciones son nuevas en `**Abrir:**` y solo valen ahí.
   - **consola:** `**Ejecutar:**` con un comando; corre en una consola a la vista, como cualquier botón de Scripts.
   - **armar:** `**Ejecutar:**` con un comando, en un proyecto cuyo `ejecutar` es de tipo escritorio. Sin una de las dos cosas, la actualización automática no existe para ese proyecto.
3. **La app está abierta si Windows no deja escribir su `.exe`.** Un programa que corre tiene su archivo trabado: Iridium intenta abrirlo para escribir (sin cambiar nada) y, si Windows lo niega (`EBUSY` o `EPERM`), está abierta. No hace falta listar los procesos de la PC (lento) ni que la haya abierto Iridium: vale también para la que se abrió con su acceso directo.
4. **La versión armada se recuerda en los datos de Iridium**, no en el proyecto (Iridium escribe lo mínimo en las carpetas del usuario): `armados.json` guarda por proyecto el commit con que se armó la última vez y cómo terminó. Sin ese dato (la primera vez), cuenta como armada si el `.exe` es más nuevo que el último commit.
5. **Cuándo se arma solo:** el último commit no es el armado, no hay archivos con seguimiento a medio cambiar (`git status --untracked-files=no`), ninguna IA trabaja en ese proyecto (ni una sesión de Iridium en marcha ni actividad en VS Code en los últimos 10 minutos, como el Arranque), la app está cerrada, la actualización está prendida en ese proyecto y no falló ya con ese mismo commit. Se arma **de a uno**: los demás esperan su turno.
6. **Cómo se arma:** el comando corre escondido y suelto (como Actualizar de Iridium: sigue si Iridium se cierra), con lo que escribe en un log de los datos de Iridium y una marca de fin (`ok` o `falla`) que deja el mismo comando al terminar. Con Iridium abierta, a los 10 minutos se corta (con todo lo que lanzó) y cuenta como falla. Al volver a abrir Iridium, un armado cuya marca de fin está escrita se cierra con ese resultado; uno sin marca y sin su proceso, como falla («se cortó antes de terminar»).
7. **Se mira cada minuto**, solo en los proyectos con la marca `armar`: tres comandos de git cortos y un intento de abrir el `.exe`. Además, enseguida al terminar un turno de la IA en ese proyecto (es cuando suele haber un commit nuevo). Iridium misma queda afuera: tiene su propio armado (D-122) y el vigía de Abrir saltea su carpeta de código.
8. **Si la app se abre mientras se arma** (Ejecutar), Iridium espera el fin y la abre sola si salió bien; si falló, abre la versión anterior y la tarjeta dice el fallo. Si el usuario la abrió por fuera y el armado no pudo reemplazar el `.exe`, cuenta como «ocupada», no como falla: se reintenta cuando la cierre.

Descartado: listar los procesos de Windows para saber si está abierta (tarda un segundo por consulta y el `.exe` trabado dice lo mismo), guardar el commit armado en un archivo del proyecto (ensucia el repo del usuario o pide un `.gitignore`), una clave distinta por marca (`**Abre:**`, `**Arma:**`: dos formatos que aprender y controlar) y mirar cada 10 segundos como el armado de Iridium (eso es una sola carpeta; acá pueden ser varias).

## El formato en `scripts.md`
```markdown
## Abrir la app
La versión armada, con los últimos cambios.
**Ejecutar:** `dist/win-unpacked/Alfa.exe`
**Marca:** ejecutar · escritorio

## Armar la app
Arma la versión de uso con el código de ahora. Cerrala antes.
**Ejecutar:** `npm run armar`
**Marca:** armar
```
**El control** (nuevo, `core/control/scripts.ts`) marca: más de un script con `ejecutar` o con `armar`; un tipo que no es escritorio, página ni consola; una marca en una sección sin línea de acción; un tipo que no va con su acción (escritorio o consola con `**Abrir:**`, página con un comando); `armar` sin un `ejecutar · escritorio`, o con `**Abrir:**`. Solo mira `docs/scripts.md`, y solo en proyectos con framework.

## Contrato con el núcleo
### Qué usa del núcleo
| Función / dato / servicio | Para qué |
|---|---|
| `leerScripts` (`core/visor/scripts.ts`) | Leer las marcas junto con cada script |
| `prepararScript` y `ejecutarPlan` | Ejecutar lo que abre el proyecto, igual que un botón de Scripts |
| `shell.openPath` y `shell.openExternal` | Abrir el `.exe` o el archivo, y la dirección en el navegador |
| Las sesiones en marcha (`enMarcha`) y la actividad de VS Code (D-027) | No armar con una IA trabajando |
| El fin de turno de una conversación | Mirar enseguida si hay algo para armar |
| `config.json` (Preferencias) | Recordar los proyectos con la actualización apagada |

### Qué expone
| Función / evento / dato | Quién lo usa |
|---|---|
| `TarjetaProyecto.ejecutar`: `{ id, tipo, detalle } \| null` | El menú de la tarjeta y la barra del proyecto (el botón y su detalle) |
| `TarjetaProyecto.actualizacion`: `{ estado: 'armando' \| 'fallo', … } \| null` | La Señal de la tarjeta (AB-3, AB-4) |
| `proyecto:ejecutar` (pedido) | Ejecutar Alfa; responde `ok`, `sin-armar` (AB-2), `esperando` (se abre al terminar) o el error |
| `proyecto:armar-ahora`, `proyecto:actualizacion` (pedidos) | Armar ahora (AB-2, AB-4) y el interruptor de Ajustes del proyecto |
| `actualizacion:cambio` (evento) | Redibujar la tarjeta y Ajustes del proyecto al empezar y terminar un armado |
| Los armados de la noche (`armados` en `arranques.json`, T-86) | El aviso «Mientras no estabas» del Arranque: un renglón por app que se armó con Iridium sin usar 5 minutos o más |

### Para plugins
- No aplica: es una sección del núcleo.

## Estructura interna
- **`core/visor/scripts.ts`:** `leerScripts` lee también `**Marca:**` (`marca: { tipo: 'ejecutar'; como: 'escritorio' | 'pagina' | 'consola' } | { tipo: 'armar' } | null`) y la saca de la descripción. `**Abrir:**` acepta una dirección `http(s)://`.
- **`core/abrir.ts` (nuevo, reglas puras):** `queEjecuta(scripts)` (el script marcado y su detalle: «Abre la app.» + la descripción), `puedeArmarse(scripts)` (el par ejecutar escritorio + armar) y `tocaArmar(estado)` (la regla de la decisión 5, con cada condición como dato para probarla sola).
- **`core/control/scripts.ts` (nuevo):** los avisos del formato.
- **`infra/armados.ts` (nuevo):** `armados.json`, el `.exe` trabado (`abiertaAhora`), lanzar el armado escondido con su log y su marca de fin, cortarlo a los 10 minutos y leer cómo terminó.
- **`app/abrir.ts` (nuevo):** `Ejecutar` (el pedido de la ventana, con la espera de AB-2) y `VigiaArmados` (cada minuto y al fin de turno, la fila de a uno, los eventos).
- **Ventana:** el ítem en `MenuTarjeta`, el botón en la barra del proyecto, la Señal en `Tarjeta.tsx`, la sección en Ajustes del proyecto y el aviso de AB-2 (piezas que ya existen).

## Datos
**`armados.json`** (datos de Iridium; se puede rehacer: si falta o está roto, vacío y vuelve a la regla del `.exe` más nuevo):
```
{ version: 1,
  proyectos: { "<ruta>": { commit: "<hash del último armado bueno>" | null,
                           ultimo: { cuando, commit, resultado: "ok" | "falla" | "ocupada", motivo? } | null,
                           enCurso: { pid, desde, commit } | null } } }
```
Los logs y la marca de fin, en `armados/<nombre de la carpeta>-<hash corto de la ruta>/` (`armado.log`, `fin`), dentro de los datos de Iridium: Ver la consola abre ese log.

**`config.json`** suma `actualizacionApagada: string[]` (las rutas de los proyectos con el interruptor apagado; si falta o está roto, ninguna: arranca prendida, D-154).

## Procesos centrales
### Ejecutar Alfa
1. La ventana pide `proyecto:ejecutar` con la ruta; Iridium relee `scripts.md` y busca el script marcado.
2. Escritorio: si se está armando, responde `esperando` y la abre al terminar; si el `.exe` no existe, `sin-armar` (con o sin script de armar, para el texto de AB-2); si no, lo abre con Windows.
3. Página y consola: igual que el botón de Scripts.

### La actualización automática
1. Cada minuto, y al terminar un turno de la IA en un proyecto, `VigiaArmados` mira los proyectos con `ejecutar · escritorio` + `armar`, la actualización prendida y fuera de la carpeta de código de Iridium.
2. Si `tocaArmar`, lo pone en la fila; si nadie está armando, lanza el primero y lo anota `enCurso` en `armados.json`, y avisa a la ventana.
3. Al terminar: `ok` guarda el commit; `falla` lo deja como `ultimo` (no se reintenta con ese commit); si el log dice que no pudo reemplazar el `.exe` y la app está abierta, `ocupada` (se reintenta al cerrarla). Avisa a la ventana.

## Seguridad
Nivel P2. Iridium solo corre el comando de un script que la IA de ese proyecto marcó `armar` en su `scripts.md`, solo con commits del usuario, con la actualización apagable por proyecto (definición › Impacto en el perfil). Nada sale de la PC: las direcciones de una página las abre el navegador, como un enlace.

## Pruebas
- **Lógica (Vitest):** `leerScripts` con marcas bien y mal escritas; el control con cada aviso; `queEjecuta` y `puedeArmarse`; `tocaArmar` con cada condición en contra; `armados.json` roto o viejo; el `.exe` trabado (un proceso de prueba que lo tiene abierto); un armado de prueba (un comando que escribe y termina bien, uno que falla, uno que se pasa del tiempo, con un tiempo corto para la prueba).
- **Que no rompa el resto (Playwright, con el motor falso):** el ítem del menú y el botón de la barra aparecen solo con la marca; Ejecutar abre (con `IRIDIUM_OCULTA` y un `.exe` de prueba que no es un programa: se ve el pedido, no la ventana); AB-2 con el `.exe` faltante; la Señal «Actualizando…» y «No se pudo actualizar» con un comando de armar de prueba; el interruptor se recuerda.
- **Lo que solo se ve de verdad** (una app de escritorio real armándose sola): la prueba del usuario al cerrar AB-I2.

## Cambios requeridos en el núcleo
| Cambio | Motivo | Decisión |
|---|---|---|
| El framework: `SKILL.md` › Los scripts y la plantilla `scripts.md` explican `**Marca:**`; la referencia de la construcción y `pasar-al-framework.md` piden escribirla una vez (al empezar a armar la app, o al retomar); el control, con sus pruebas | La marca la escribe la IA de cada proyecto (D-086, D-092) | D-148, D-156 |
| `05-arquitectura.md` › Modelo de datos: `armados.json` y `actualizacionApagada` en Preferencias | Datos nuevos de Iridium | D-156 |
| `**Abrir:**` acepta direcciones `http(s)://` en Scripts | El tipo página | D-156 |

## Iteraciones
- **AB-I1 — Ejecutar:** la marca (lector, control, framework), Ejecutar en el menú y en la barra, con su detalle, y AB-2 sin el armado (dice «Pedile a la IA del proyecto que la arme» o corre el script de armar a la vista, como Scripts).
- **AB-I2 — Actualización automática:** `armados.json`, el vigía, la Señal, Ajustes del proyecto, la espera de AB-2 y Armar ahora escondido.
