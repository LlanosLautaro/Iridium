# Diseño técnico del módulo: Paridad

**Fecha:** 2026-11-21
**Estado:** cerrado (las decisiones, en D-169)
**Base:** `definicion.md` (D-167), `ux.md` (D-168), el spike S-5 (`investigacion.md`, `research/comandos-y-adjuntos-del-motor.md`) y el código de hoy: la frontera (`src/main/motor/motor.ts`, `sdk.ts`: `sinMensajes`, `textoDeUsuario`, `BLOQUE_INTERNO`), la conversación (`src/main/app/conversacion.ts` › `seguir`, `mandar`, `entradaDe`; `core/sesiones.ts` › `mensajeParaLaIa`), lo escrito sin mandar (`infra/escritos.ts`, D-060), las citas del compositor (`compartido/citas.ts`, Q-182) y el compositor (`renderer/secciones/proyecto/Conversacion.tsx`). Un historial real de Claude Code confirmó cómo guarda un comando (`<command-name>/context</command-name>` y `<command-args>`), su respuesta (`<local-command-stdout>`) y una foto (bloque `image` en base64).
> Respeta la arquitectura, el stack y las convenciones de `05-arquitectura.md`.

## Las decisiones de este paso
1. **El motor dice qué sabe hacer** con `capacidades()`, sin gastar: si tiene comandos, si recibe fotos (los tipos, el peso y el lado máximos) y la tabla de los comandos escondidos. Iridium muestra el + y la lista de «/» según eso (PA-6); el motor falso puede apagar cada cosa para las pruebas.
2. **La lista de comandos sale de `comandos(carpeta)`**: una sesión sin mensajes en la carpeta de la conversación (con los ajustes del usuario, del proyecto y el complemento de Iridium, como `abrir`), que devuelve todos con su nombre, otros nombres, qué se les escribe después, para qué sirven y de dónde salen. La app la guarda por carpeta mientras Iridium está abierta y la vuelve a pedir a los 10 minutos; una sesión abierta avisa si cambió (`commands_changed`) con un evento nuevo, `comandos`, y la ventana se pone al día sin cerrar la lista.
3. **Cuáles se esconden lo decide la frontera, por regla** (D-167): los de Claude Code (no los de skills ni complementos) que están en su tabla, cada uno con **qué pisa**: `modelo`, `esfuerzo`, `tono`, `conversacion`, `contexto`, `uso` o `terminal`. La tabla es fija dentro de `motor/` y se revisa al subir el SDK; también los nombra por sus otros nombres (`/cost` y `/stats` son `/usage`). La frontera no escribe la línea: la frase de cada uno («en Iridium, el modelo se elige abajo») y su botón son de Iridium (`compartido/comandos.ts`), porque nombran controles de Iridium. Así D-168 se cumple sin que el motor conozca la interfaz.
4. **Un comando escondido escrito a mano se frena en la ventana** con la tabla de `capacidades()`, que está siempre (aunque la lista no se haya podido leer). Y por las dudas en la app: `seguir` no manda un texto que empieza con un comando escondido.
5. **El mensaje que sale lleva texto y fotos** (`MensajeSaliente`). Lo de Iridium va dentro del texto con marcas propias, iguales para cualquier motor: el texto pegado en `<iridium-pegado lineas="340">…</iridium-pegado>` y los archivos en `<iridium-archivos>` con una ruta por renglón, antes de lo escrito. La IA ve dónde empieza y termina cada uno, y al leer el historial Iridium los reconoce sin adivinar (una ruta escrita a mano no se vuelve ficha). Las fotos van aparte: la frontera las pone como bloques de imagen antes del texto.
6. **Al leer el historial, la frontera deja pasar las marcas `iridium-*`** (hoy borra toda marca entre `<…>`, y con eso borraría el texto pegado) y traduce las de Claude Code: `<command-name>` y `<command-args>` vuelven a ser «/nombre lo escrito» en el mensaje del usuario, y `<local-command-stdout>` es un mensaje de la IA (PA-5). Las fotos del historial llegan como `fotos` del mensaje.
7. **Un comando va primero.** Con un comando, las citas y «Sobre la skill…» van después de él, como lo que se le escribe; y no se le suma el aviso de «te detuve» (`mensajeParaLaIa`), que queda para el próximo mensaje que no sea un comando. Un comando de Claude Code no lleva adjuntos (una línea lo dice); uno de una skill sí. Si la prueba real muestra que Claude Code no reconoce un comando con fotos en el mismo mensaje, la regla pasa a todos los comandos.
8. **Cada adjunto sin mandar es una ruta, salvo el texto pegado.** La foto elegida o arrastrada y el archivo, su ruta; la foto pegada se guarda en los datos de Iridium (`pegadas/`, un archivo por foto) y desde ahí es una ruta más. Lo escrito sin mandar (`escritos.json`) pasa a guardar texto y adjuntos (versión 2; la 1 se lee igual). Al abrir Iridium se borran las pegadas que ningún escrito nombra.
9. **La foto se lee y se achica en el proceso principal** (`infra/fotos.ts`), con `nativeImage` de Electron: sin dependencias nuevas. Una PNG o JPEG que pasa los límites del motor se achica (a JPEG si hace falta para el peso); una GIF o WebP no se puede achicar con `nativeImage` y, si pasa, la ficha dice por qué no va. Una que no es imagen válida, lo mismo. Las miniaturas (de 160 px) y la foto grande del visor llegan a la ventana como `data:` pedidas al puente: la ventana no lee el disco.
10. **Arrastrar da la ruta con `webUtils.getPathForFile`** desde el puente (Electron ya no pone `path` en el `File`); vale para carpetas. El selector es el de Windows (`showOpenDialog`, varios archivos).
11. **El texto largo pegado lo decide la ventana** (más de 40 líneas o 2.000 caracteres, `compartido/adjuntos.ts`), con `Ctrl+Z` que lo vuelve texto mientras no se escribió otra cosa.
12. **Los usados hace poco** (Should) son los cinco últimos comandos mandados, de todas las conversaciones, en `config.json` (`comandosRecientes`).

Descartado: mandar el texto pegado como un bloque de contenido aparte (lo mismo con una marca, y la marca se puede leer del historial igual con cualquier motor); copiar los archivos a los datos de Iridium (la IA los abre donde están, y así lo decidió la definición); guardar las fotos pegadas dentro de `escritos.json` (en base64 lo vuelve pesado y se reescribe a cada letra); `sharp` para achicar (una dependencia nativa más para el armado, por un Should); que la frontera arme la frase de cada escondido (tendría que saber cómo se llaman los botones de Iridium); y ofrecer `/clear` traduciéndolo a «Nueva» (D-168 lo descartó).

## Contrato con el núcleo
### Qué usa del núcleo
| Función / dato / servicio | Para qué |
|---|---|
| `Motor` y `SesionMotor` (con los cambios de abajo) | La lista de comandos, qué sabe hacer el motor y mandar el mensaje con fotos |
| `Conversaciones.seguir` y `entradaDe` (`app/conversacion.ts`) | Mandar el mensaje con sus adjuntos y mostrarlo, en vivo y al leer el historial |
| `ArchivoEscritos` (`infra/escritos.ts`) | Que los adjuntos sin mandar no se pierdan al cambiar de proyecto o cerrar |
| `Preferencias` (`config.json`) | Los comandos usados hace poco |
| El visor de Archivos y `shell` | Abrir el archivo de una ficha (en el proyecto, en Archivos; afuera, con Windows) |
| Las piezas del design system | El menú (PZ-8), el cuadro del visor, la ficha con ✕ del compositor, el aviso de una línea |

### Qué expone
| Función / evento / dato | Quién lo usa |
|---|---|
| Puente: `comandos(ruta)` y el evento `alCambiarComandos` | El compositor (la lista de «/») |
| Puente: `capacidadesMotor()` | El compositor (el +, la lista, los escondidos) |
| Puente: `elegirAdjuntos()`, `guardarPegada(bytes, medio)`, `miniatura(ruta)`, `fotoGrande(ruta)`, `abrirAdjunto(rutaProyecto, ruta)` | El compositor y los mensajes mandados |
| `PedidoSeguir.adjuntos` | Todo lo que manda un mensaje desde la conversación |
| `Entrada` `usuario` con `adjuntos` | La conversación (las fichas sin ✕ en el mensaje) |
| `compartido/adjuntos.ts`: `esPegadoLargo`, `mensajeConAdjuntos`, `leerAdjuntos` | La ventana y la app (la regla y la marca son de Iridium) |
| `compartido/comandos.ts`: `filtrarComandos`, `lineaDeEscondido` | El compositor |

### Para plugins
- Versión del contrato de plugins que usa: no aplica (es una sección del núcleo).
- Permisos que solicita: ninguno nuevo. Los archivos los elige el usuario; Iridium solo lee las fotos elegidas o pegadas.

## Estructura interna
| Pieza | Dónde | Qué hace |
|---|---|---|
| La frontera | `main/motor/motor.ts`, `sdk.ts` | `capacidades()`, `comandos(carpeta)`, el evento `comandos`, `enviar(MensajeSaliente)`, la tabla de escondidos y el historial con comandos, su respuesta, fotos y marcas `iridium-*` |
| El motor falso | `main/motor/motor.ts` | Una lista de comandos fija (con escondidos, otros nombres y uno de complemento), comandos y fotos que se pueden apagar, y la IA falsa que dice cuántas fotos vio y qué comando recibió |
| Las reglas | `compartido/adjuntos.ts`, `compartido/comandos.ts` | El umbral del texto pegado, las marcas al mandar y al leer, el filtro de la lista (empieza con, otro nombre, contiene), la frase de cada escondido y si un texto es un comando |
| Las fotos | `main/infra/fotos.ts` | Leer, validar, achicar y dar la miniatura y la foto grande; las pegadas en `pegadas/` y su limpieza |
| Lo escrito | `main/infra/escritos.ts` | Versión 2, con adjuntos |
| La conversación | `main/app/conversacion.ts` | Arma el `MensajeSaliente` (lee las fotos, pasa a archivo lo que el motor no recibe como foto, ordena el comando primero), cuida los escondidos y guarda los recientes; la lista de comandos por carpeta |
| El puente | `preload/`, `main/ipc/puente.ts`, `compartido/puente.ts` | Los pedidos y el evento de arriba, con Zod (hasta 20 adjuntos, la foto pegada hasta 20 MB) |
| El compositor | `renderer/secciones/proyecto/Conversacion.tsx` y piezas nuevas en `renderer/ui/` | El +, la lista de «/», las fichas, el borde de soltar, el visor y la línea del escondido |

## Datos
- **`enviar(texto, fotos)`** (frontera; en la construcción quedó así en vez de un `MensajeSaliente`, y los que llamaban con solo el texto no cambiaron): `fotos: FotoMotor[]`, con `FotoMotor = { medio: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'; datos: string }` (base64).
- **`MensajeMotor` `usuario`** suma `fotos?: FotoMotor[]`.
- **`ComandoMotor`**: `{ nombre, otrosNombres: string[], argumentos: string | null, descripcion: string, origen: 'motor' | 'skill' | 'complemento', complemento: string | null, escondido: Pisa | null }`, con `Pisa = 'modelo' | 'esfuerzo' | 'tono' | 'conversacion' | 'contexto' | 'uso' | 'terminal'`.
- **`CapacidadesMotor`**: `{ comandos: boolean; fotos: { medios: string[]; maxBytes: number; maxLado: number } | null; escondidos: Record<string, Pisa> }`. Hoy: comandos sí, fotos PNG/JPEG/GIF/WebP de hasta 5 MB y 8000 px (a confirmar con una captura real, `investigacion.md` › Riesgos).
- **`AdjuntoPedido`** (puente): `{ tipo: 'foto' | 'archivo'; ruta: string } | { tipo: 'pegado'; texto: string }`. `PedidoSeguir` suma `adjuntos?: AdjuntoPedido[]`.
- **`AdjuntoVista`** (en la `Entrada` del usuario): `{ tipo: 'foto'; src: string; nombre: string | null } | { tipo: 'archivo'; ruta: string } | { tipo: 'pegado'; lineas: number; texto: string }`. La foto del historial llega como `data:`: una conversación con muchas fotos pesa más al abrirla (aceptado).
- **`escritos.json` versión 2**: `{ version: 2, escritos: { [ruta]: { texto, adjuntos: AdjuntoPedido[] } } }`; la versión 1 (solo texto) se lee como texto sin adjuntos.
- **`config.json`** suma `comandosRecientes: string[]` (hasta cinco).
- **Datos del Centro** suman `pegadas/` (las fotos pegadas sin mandar).

Cambios al modelo general: en `05-arquitectura.md` (La interfaz `Motor` y Modelo de datos), con D-169.

## Procesos centrales
### Elegir un comando (PA-1)
1. Al escribir «/» al principio, la ventana pide `comandos(ruta)` (la primera vez, «Buscando los comandos…»). La app contesta de su memoria si la lista tiene menos de 10 minutos; si no, `motor.comandos(carpeta)`.
2. La ventana filtra con `filtrarComandos` (empieza con, por nombre u otro nombre; después, contiene), sin los escondidos; sin nada escrito, los recientes primero.
3. Elegido, queda «/nombre ». Al mandar, si el texto empieza con un escondido (por nombre u otro nombre), la ventana muestra `lineaDeEscondido` y no manda; la app hace el mismo control.
4. Mandado, la app ordena: el comando, después las citas y «Sobre la skill…», sin el aviso de «te detuve». Suma el nombre a `comandosRecientes`.
5. Si una sesión abierta avisa `commands_changed`, la frontera emite `comandos`; la app pone al día su memoria de esa carpeta y avisa a la ventana.

### Mandar con adjuntos (PA-2 a PA-4)
1. La ventana junta las fichas: rutas de fotos y archivos (del selector, de soltar o de `guardarPegada`) y textos pegados. Cada cambio se guarda en `escritos.json` con lo escrito.
2. `seguir(ruta, { texto, adjuntos })`: la app lee cada foto con `infra/fotos.ts` contra `capacidades().fotos` (achica si hace falta). Sin fotos en el motor, la foto pasa a archivo; la pegada no llega (la ventana ya la frenó).
3. Arma el texto con `mensajeConAdjuntos`: los pegados, los archivos y lo escrito (con sus citas). Muestra la `Entrada` con sus `AdjuntoVista` y manda el `MensajeSaliente`.
4. La frontera real: sin fotos, `content` es el texto, como hoy; con fotos, los bloques de imagen y después el texto. Si mandar falla antes de salir (sin sesión, F-5), el pedido entero vuelve al cuadro con sus fichas (`reintentar` pasa a ser el pedido).
5. Al mandar, la ventana borra lo escrito y sus fichas; la pegada queda en `pegadas/` hasta la limpieza del próximo arranque (la foto ya está en el historial de Claude).

### Leer una conversación (PA-5)
1. `mensajesDeHistorial`: antes de sacar las marcas internas, `<command-name>`/`<command-args>` se vuelven «/nombre args»; `<local-command-stdout>` (si no está vacío) es un mensaje de la IA (Claude Code lo guarda en una línea de sistema que `getSessionMessages` no devuelve: se lee del `.jsonl` y va después de su comando, PA-I1); las marcas `iridium-*` se dejan; los bloques de imagen pasan a `fotos`.
2. `entradaDe` usa `leerAdjuntos` para separar los pegados y los archivos del texto, y suma las fotos como `data:`.

## Seguridad
- **P2, sin superficie nueva hacia afuera:** las fotos y los archivos salen hacia Claude como hoy sale lo que el usuario escribe (`definicion.md` › Impacto en el perfil).
- **El puente valida todo** con Zod: hasta 20 adjuntos, rutas absolutas, la foto pegada hasta 20 MB y con un tipo de imagen. `miniatura` y `fotoGrande` solo leen archivos de imagen (por su contenido, no por el nombre).
- **Abrir un archivo de una ficha:** dentro del proyecto, en Archivos; afuera, con Windows, salvo los que se ejecutan (`.exe`, `.bat`, `.cmd`, `.ps1`, `.msi`, `.lnk`, `.vbs`, `.js`), que se muestran en su carpeta: un clic en una ficha nunca ejecuta un programa.
- **Las pegadas** viven en los datos de Iridium, fuera de los proyectos, y se borran solas.

## Pruebas
- **Lógica del módulo (Vitest):** el filtro y los escondidos por otro nombre; el umbral del pegado; las marcas ida y vuelta (`mensajeConAdjuntos` y `leerAdjuntos`, con una ruta escrita a mano que no se vuelve ficha y un pegado con HTML que no se borra); el historial con un comando, su respuesta y una foto (muestras sacadas de un `.jsonl` real, sin datos del usuario); la frontera real con el SDK simulado (`content` con imagen y texto); `escritos.json` 1 → 2; `infra/fotos.ts` con una PNG grande, una GIF grande y un archivo que no es imagen; el orden del comando con citas; la limpieza de `pegadas/`.
- **Con la app abierta (Playwright, motor falso):** «/» abre la lista y elegir no manda; un escondido escrito a mano muestra su línea; el + con Agregar y Comandos; pegar una imagen y un texto largo; mandar y ver las fichas en el mensaje y al reabrir desde ◔; el motor falso sin fotos y sin comandos (PA-6). Arrastrar desde el explorador no se puede automatizar: va a la prueba del usuario.
- **Prueba real a mano, con un modelo barato:** una captura de verdad (los límites de la foto), un comando con una foto (la decisión 7) y `commands_changed` con una skill nueva.
- **Que no rompa el resto:** la conversación sin adjuntos manda `content` como texto, igual que hoy; las suites de la conversación, Ideas y Skills siguen en verde.

## Cambios requeridos en el núcleo
| Cambio | Motivo | Decisión |
|---|---|---|
| `05-arquitectura.md` › La interfaz `Motor`: `enviar` con fotos, `capacidades`, `comandos` y el evento `comandos` | La frontera tiene que decir qué sabe hacer y llevar fotos (D-165) | D-169 (aplicado) |
| `05-arquitectura.md` › Modelo de datos: `escritos.json` con adjuntos, `comandosRecientes` en `config.json`, `pegadas/` en los datos | Lo escrito no se pierde, con sus adjuntos | D-169 (aplicado) |
| `06-ui.md` y `diseno/piezas.css`: la ficha de adjunto, el menú arriba del compositor y el borde de soltar | Piezas nuevas (`ux.md` › Piezas de UI nuevas) | paso 6 |

## Iteraciones
| ID | Objetivo | Qué entra |
|---|---|---|
| PA-I1 | Los comandos con «/» | `capacidades`, `comandos` y su evento; la lista; los escondidos y su línea; el comando primero; el comando y su respuesta al leer el historial; los recientes |
| PA-I2 | Archivos y fotos | El + y `Ctrl+U`, arrastrar, pegar una foto, las fichas y el visor; `enviar` con fotos; `infra/fotos.ts` (achicar); `escritos.json` 2 y `pegadas/`; las fichas en los mensajes y al reabrir; el motor sin fotos |
| PA-I3 | El texto largo pegado | La ficha «Texto pegado», `Ctrl+Z`, el visor de texto y la marca `iridium-pegado` ida y vuelta |

---

# Segunda parte: Capacidades (T-28)

**Fecha:** 2026-11-24
**Estado:** cerrado (las decisiones, en D-189)
**Base:** `definicion.md` y `ux.md` › Segunda parte (D-188, Q-285, Q-286), el spike S-8 (`spikes/S-8-capacidades/`, `research/capacidades-del-motor.md`) y el código de hoy: la frontera (`main/motor/sdk.ts`: `sinMensajes`, `abrir` con `settingSources` y `plugins`), Ajustes (`renderer/marco/Ajustes.tsx`, `ajustes/*.tsx`), las preferencias (`config.json`) y las consolas de adentro (T-116).

## Las decisiones de este paso
1. **El motor dice sus capacidades con su estado**, sin gastar: `capacidadesSesion()` abre una sesión sin mensajes (como `comandos`), con los ajustes del usuario y el complemento de Iridium, y devuelve los complementos (nombre, autor, de dónde salen, cuántas skills y conectores) y los conectores (nombre, de qué complemento o de claude.ai, estado: `conectado`, `falta-sesion`, `falla`). Sale de `mcpServerStatus()` y de los `plugin.json` de `.claude\plugins\synced` (la misma lectura que ya hace Skills). Se espera hasta que ningún conector esté «conectando», con un tope de 15 s.
2. **Apagar un conector es de Iridium, no de Claude Code.** S-8 mostró que `toggleMcpServer` queda guardado en la configuración de Claude Code de esa carpeta (`~/.claude.json`): apagaría el conector también en VS Code y habría que hacerlo carpeta por carpeta. En su lugar, Iridium guarda los apagados en `config.json` (`conectoresApagados: string[]`) y cada sesión los recibe como `managedSettings: { deniedMcpServers }`, que vale solo para esa sesión y no escribe nada (probado: el conector no aparece y `~/.claude.json` no cambia). La lista de Capacidades se pide sin esa negación, así se ven también los apagados.
3. **Conectar va por la consola de adentro** (T-116), con el Claude Code que trae Iridium: `claude "/mcp"` en una pestaña «Conectar Figma», con la carpeta de Iridium como lugar de trabajo. Al cerrarse la pestaña, Capacidades vuelve a pedir el estado. Los conectores de claude.ai (Gmail, Drive…) no se conectan así: **Conectar** abre `claude.ai/settings/connectors` en el navegador. Que `/mcp` termine bien un inicio de sesión desde la consola de adentro se prueba primero en la construcción; si no, la pestaña abre `claude` sin más y la línea dice «escribí /mcp».
4. **El navegador es una opción de la sesión:** con el interruptor prendido, `abrir` suma `extraArgs: { chrome: null }` (Claude in Chrome); Claude Code encuentra solo el navegador con la extensión (Brave en esta PC). Para la fila «Brave, con la extensión «Claude»», Iridium busca la extensión (`fcoeoabgfenejglbffodgkkbkcdhcgfn`) en las carpetas de perfiles de Chrome, Brave y Edge; sin encontrarla, el aviso de la UX.
5. **La PC es Windows-MCP como conector de Iridium** (Q-285, A): con el interruptor prendido, `abrir` suma `mcpServers: { pc: { type: 'stdio', command: <windows-mcp.exe>, args: ['serve', '--exclude-tools', 'PowerShell,FileSystem,Registry'], env: { ANONYMIZED_TELEMETRY: 'false' } } }`. No se registra en Claude Code: solo lo tienen las sesiones de Iridium con el interruptor prendido. Se sacan PowerShell, archivos y registro porque Claude Code ya los tiene (y son lo que más daño hace por error); su aviso de uso a PostHog, apagado, como pide «todo local».
6. **Instalar Windows-MCP lo guía Iridium**, una vez: si no está `%USERPROFILE%\.local\bin\windows-mcp.exe`, la fila dice «Falta instalarlo» con **Instalar**, que corre en la consola de adentro `winget install --id astral-sh.uv -e` (si falta uv) y `uv tool install windows-mcp` (uv baja el Python que pide, 3.14, sin tocar el de la PC). Se instala como herramienta y no con `uvx` porque el primer arranque con `uvx` pasa los 30 s que espera Claude Code. Al terminar, la fila se pone al día.
7. **Todo vale para las sesiones nuevas.** Una conversación abierta sigue como estaba; la línea de abajo de Capacidades lo dice. Las sesiones de fondo (el avance solo, el arranque) usan lo mismo que las otras.

Descartado: `toggleMcpServer` (queda en la configuración de Claude Code, decisión 2); registrar Windows-MCP con `claude mcp add` (lo tendrían también VS Code y la terminal, siempre prendido); un navegador con Playwright (Q-282); correr Windows-MCP con `uvx` en cada sesión (tarda en arrancar, decisión 6).

## Contrato con el núcleo
### Qué usa del núcleo
| Función / dato / servicio | Para qué |
|---|---|
| `Motor` (con `capacidadesSesion` y las opciones nuevas de `abrir`) | La lista con su estado y las sesiones con el navegador, la PC y los apagados |
| `Preferencias` (`config.json`) | Los interruptores y los conectores apagados |
| Las consolas de adentro (T-116) | Conectar e Instalar |
| `shell.openExternal` | Conectar un conector de claude.ai y «Cómo instalarla» |
| Las piezas del design system | Ajuste, Fila, Señal e Interruptor (sin piezas nuevas, `ux.md`) |

### Qué expone
| Función / evento / dato | Quién lo usa |
|---|---|
| Puente: `capacidades()` (la lista con su estado, el navegador y la PC encontrados) | Ajustes › Capacidades |
| Puente: `cambiarCapacidad({ navegador? , pc?, conector?: { nombre, prendido } })` | Ajustes › Capacidades |
| Puente: `conectar(nombre)` e `instalarPc()` (abren su consola) | Ajustes › Capacidades |

## Estructura interna
| Pieza | Dónde | Qué hace |
|---|---|---|
| La frontera | `main/motor/motor.ts`, `sdk.ts` | `capacidadesSesion()`; `abrir` con `navegador`, `pc` y `apagados` |
| El motor falso | `main/motor/motor.ts` | Dos complementos y cuatro conectores con los cuatro estados; `IRIDIUM_FALSO_CAPACIDADES=no` (la sección no aparece) |
| Las reglas | `compartido/capacidades.ts` | El estado en palabras, el orden (los que fallan primero), qué botón lleva cada fila, si un conector es de claude.ai |
| Buscar en la PC | `main/infra/capacidades.ts` | La extensión en los perfiles de Chrome, Brave y Edge; `windows-mcp.exe` y uv |
| La app | `main/app/capacidades.ts` | Junta todo, guarda los cambios en `config.json` y arma los comandos de Conectar e Instalar |
| La ventana | `renderer/marco/ajustes/Capacidades.tsx` | La sección, con las siluetas mientras carga |

## Datos
- **`CapacidadesSesion`** (frontera): `{ complementos: { nombre, autor, origen: 'cuenta' | 'iridium', skills: number, conectores: number }[]; conectores: { nombre, de: string, estado: 'conectado' | 'falta-sesion' | 'falla' }[] }`.
- **`abrir`** suma `navegador?: boolean`, `pc?: { ejecutable: string } | null` y `apagados?: string[]`.
- **`config.json`** suma `capacidades: { navegador: boolean; pc: boolean; conectoresApagados: string[] }` (de entrada, todo apagado y la lista vacía).

## Procesos centrales
### Ver (PA-7)
1. Al abrir la sección, la ventana pide `capacidades()`. La app pregunta al motor (sin la negación) y busca en la PC la extensión y `windows-mcp.exe`; marca como «apagado» los de `conectoresApagados`.
2. La ventana ordena con `compartido/capacidades.ts` y muestra; si pasan 15 s, el error con Reintentar.

### Conectar (PA-8)
1. Un conector de complemento: `conectar(nombre)` abre una consola «Conectar <nombre>» con `claude "/mcp"` del Claude Code de Iridium. Uno de claude.ai: abre la página de conectores de claude.ai.
2. Al cerrarse la consola (o al volver a la ventana, para los de claude.ai), la sección vuelve a pedir `capacidades()`.

### Abrir una sesión (todas)
`abrir` lee `capacidades` de `config.json`: con el navegador, `extraArgs: { chrome: null }`; con la PC y el ejecutable encontrado, `mcpServers.pc`; siempre, `managedSettings.deniedMcpServers` con los apagados.

## Seguridad
- **P2.** El navegador y la PC van **apagados de entrada** y valen solo para las sesiones de Iridium. La extensión de Claude pide permiso por sitio; Windows-MCP no pide nada: por eso el interruptor, y se le sacan PowerShell, archivos y registro.
- **Contenido de terceros:** lo que la IA lee de una página o de una ventana puede traer instrucciones. El modo de permisos de Iridium no cambia: el interruptor es el límite, y la línea de la UX lo dice.
- **Instalar** corre solo los dos comandos fijos de la decisión 6, con su texto visible en la consola; nada que llegue de la ventana se pasa como comando (el puente acepta solo el nombre de un conector de la lista).
- **Sin datos afuera de más:** el aviso de uso de Windows-MCP, apagado.

## Pruebas
- **Lógica (Vitest):** las reglas de `compartido/capacidades.ts`; la frontera con el SDK simulado: `abrir` con y sin navegador, con la PC y con apagados (las opciones que llegan a `query`); `capacidadesSesion` de un `mcpServerStatus` de muestra (con uno «conectando» que pasa a «falta-sesion»); buscar la extensión y `windows-mcp.exe` en carpetas de muestra; los cambios en `config.json`.
- **Con la app abierta (Playwright, motor falso):** la sección con los cuatro estados, apagar uno (queda apagado al volver), Conectar abre la consola, los interruptores; sin capacidades, la sección no aparece.
- **Real, sin gastar:** `spikes/S-8-capacidades/mirar.ts` con los apagados (no aparecen).
- **Real, gastando poco (a mano, con Haiku):** una sesión con el navegador que abre una página en Brave; una con la PC que saca una captura. Y el usuario, en su prueba.

## Cambios requeridos en el núcleo
| Cambio | Motivo | Decisión |
|---|---|---|
| `05-arquitectura.md` › La interfaz `Motor`: `capacidadesSesion` y las opciones de `abrir` (navegador, PC, apagados) | La frontera dice qué tiene la IA y lo prende por sesión | D-189 (aplicado) |
| `05-arquitectura.md` › Modelo de datos: `capacidades` en `config.json` | Los interruptores y los apagados | D-189 (aplicado) |
| `04-ux.md` › W-17 — Ajustes: la sección Capacidades | Una sección nueva de Ajustes | Q-286 (aplicado) |

## Iteraciones
| ID | Objetivo | Qué entra |
|---|---|---|
| PA-I4 | Ver y apagar | `capacidadesSesion`, la sección con complementos y conectores, apagar con `deniedMcpServers`, Conectar en la consola (y la prueba de `/mcp`) |
| PA-I5 | El navegador | El interruptor, `--chrome` en `abrir`, buscar la extensión y su aviso; prueba real con Brave |
| PA-I6 | La PC | El interruptor, Instalar en la consola, `mcpServers.pc` en `abrir`; prueba real con una captura |
