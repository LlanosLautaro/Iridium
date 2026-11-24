# Definición del módulo: Paridad

**Fecha:** 2026-11-21
**Estado:** aprobada (Q-244, D-167)
**Base:** `propuesta.md`, D-165 y D-166 (los cuatro pedidos; Capacidades, T-28, es la segunda parte) y lo que mostró el spike S-5 (`investigacion.md`).

## Objetivo del módulo
Que el chat de Iridium tenga lo que el usuario da por sentado en el de Claude: **los comandos con «/», adjuntar archivos y fotos, pegar una captura y que un texto largo pegado vaya como archivo**, escrito contra la frontera del motor para que otro agente pueda entrar más adelante sin rehacerlo.

## Criterios de éxito
- Escribe «/» en el chat y ve la lista de comandos con su descripción; la filtra escribiendo, la recorre con las flechas y elige con Enter o un clic.
- Pega una captura con Ctrl+V: aparece como miniatura en el compositor, viaja con el mensaje y la IA la ve. Al volver a abrir la conversación, la miniatura sigue en ese mensaje.
- Adjunta un archivo con el + (o Ctrl+U) o arrastrándolo: la IA lo abre sin que el usuario escriba la ruta.
- Pega un texto largo (un error, un registro): queda como «Texto pegado, 340 líneas», se puede abrir y sacar, y viaja con el mensaje sin llenar el cuadro.
- Funciona igual en la conversación de un proyecto, en la General y en la de Skills.
- Lo que el motor no tiene, no se muestra (el motor falso de las pruebas puede no tener fotos y el + no las ofrece).

## Funcionalidades
### Must (MVP del módulo)
- **Comandos con «/»** (C-64):
  - «/» al principio del mensaje abre la lista, arriba del compositor: el comando, qué se le escribe después y para qué sirve; los de skills y complementos dicen de dónde salen.
  - Se filtra escribiendo, se recorre con las flechas, se elige con Enter, Tab o un clic; Escape la cierra. Elegido, queda escrito en el cuadro para sumarle lo que pida antes de mandar.
  - La lista la da el motor, sin gastar uso, y se refresca si cambia durante la sesión.
  - Se esconden los de Claude Code que pisan lo que maneja Iridium (el modelo, el esfuerzo, el tono, la conversación, el uso) y los que solo sirven en la terminal (D-167). Qué pasa si se escribe uno a mano, en la UX.
- **El +** (C-65): abre un menú con «Agregar archivos o fotos» (Ctrl+U) y «Comandos» (abre la misma lista de «/»).
- **Adjuntar archivos y fotos** (C-65):
  - Con el + o Ctrl+U (el selector de Windows, varios a la vez) o arrastrándolos al chat.
  - Una foto (PNG, JPEG, GIF, WebP) viaja como foto dentro del mensaje; cualquier otro archivo, como su ruta, y la IA lo abre con sus herramientas. No se copia.
  - En el compositor, cada adjunto es una ficha (miniatura para las fotos, nombre para los archivos) con una cruz para sacarlo.
- **Pegar una foto** (C-66): Ctrl+V con una imagen en el portapapeles la suma como adjunto, igual que la del +.
- **El texto largo pegado como archivo** (C-67): un pegado de más de unas 40 líneas o unos 2.000 caracteres (el número exacto, en la UX) queda como ficha «Texto pegado, N líneas»; un clic lo abre para leerlo y la cruz lo saca. Viaja dentro del mensaje como un bloque aparte, con su nombre.
- **En los mensajes ya mandados**: las fotos como miniaturas (un clic las abre grandes), los archivos con su nombre y el texto pegado plegado, también al volver a abrir una conversación.
- **Por la frontera del motor** (D-165): el compositor arma «texto + adjuntos» en palabras de Iridium; el motor dice qué comandos tiene y si acepta fotos, y traduce el mensaje a lo suyo.

### Should
- Una foto más grande de lo que acepta el motor se achica sola antes de mandarla; si no se puede, la ficha avisa por qué no va.
- En la lista de «/», los usados hace poco primero.

### Could
- Ctrl+V de un archivo copiado en el explorador lo adjunta como archivo.

### Won't (por ahora)
- Mencionar archivos con «@» — idea aparte (T-97, D-166).
- Dictar con el micrófono — idea aparte (T-57, D-166).
- Los conectores de Claude (Gmail, Drive…) — no se pidieron; el menú del + no los muestra.
- Mandar un PDF dentro del mensaje en vez de su ruta — ata el mensaje a Claude y no suma nada (`investigacion.md`).
- Comandos propios de Iridium en la lista de «/» — los comandos son del motor; lo de Iridium tiene sus botones.

## Fuera de alcance
- **Capacidades** (T-28: los complementos de Claude Code, usar la PC y el navegador desde las sesiones): es la segunda parte del frente (D-166); su definición va al final de este archivo.
- Otro motor (Codex u otros): no se programa; solo se deja la frontera lista.
- Cambiar el chat de la extensión de la Revisión o el de Pendientes.

## Impacto en el perfil
No cambia: sigue P2. Las fotos y los archivos salen de la PC hacia Claude, como hoy sale lo que el usuario escribe o lo que la IA lee del proyecto. No entra contenido de terceros nuevo: los archivos los elige el usuario.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Adjunto | Una foto, un archivo o un texto pegado que viaja con un mensaje del chat |
| Texto pegado | Un pegado largo que queda como adjunto en vez de llenar el cuadro del chat |
| Comando | Lo que se escribe con «/» al principio del mensaje: de Claude Code, de una skill o de un complemento; la lista la da el motor |

## Preguntas abiertas para investigar
Respondidas en el spike S-5 (`investigacion.md`):
- ¿Se puede tener la lista de comandos sin gastar uso? Sí.
- ¿Qué comandos funcionan sin la terminal? Todos responden con texto; algunos pisan lo que maneja Iridium (Q-243).
- ¿Cómo viajan las fotos y los archivos? La foto dentro del mensaje; el archivo, como su ruta.

## Portón
- [x] Objetivo, criterios de éxito y MoSCoW escritos
- [x] Fuera de alcance y lo que queda como idea (T-97, T-57)
- [x] Perfil revisado: sigue P2
- [x] Términos nuevos en el glosario general
- [x] ¿Requirió cambios en los documentos generales? Sí: los casos C-64 a C-67 en `02-definicion.md` › Catálogo de casos de uso y los términos en su glosario (aplicados)
- [x] Visto bueno del usuario (Q-244, D-167)

---

# Segunda parte: Capacidades (T-28)

**Fecha:** 2026-11-24
**Estado:** borrador; el navegador (Q-282) y la PC (Q-283) los decidís vos, y el visto bueno va en Q-284
**Base:** D-166 y lo que mostró el spike S-8 (`investigacion.md` › Segunda parte; `research/capacidades-del-motor.md`).

## Objetivo
Que la IA de las sesiones de Iridium tenga **los complementos con sus conectores, el navegador y, si se puede, la PC**, como en la app de Claude, y que el usuario vea en Iridium qué tiene cada sesión y qué le falta para andar. Todo por la frontera del motor, como la primera parte.

## Lo que mostró S-8
- **Los complementos ya cargan** en las sesiones (sus skills y comandos están en «/»). Lo que falla son **sus conectores** (Slack, Figma, Gmail…): piden iniciar sesión y una sesión de Iridium no puede abrir esa ventana. El usuario hoy no se entera.
- **El navegador está a una opción:** Claude in Chrome viene con Claude Code y anda en Windows; usa el Chrome del usuario con sus cuentas, con la extensión «Claude» de Chrome instalada una vez.
- **La PC no:** en Windows, Claude Code no tiene *computer use* (solo la app de escritorio de Claude). Queda esperar, un servidor de terceros o uno propio (Q-283).

## Criterios de éxito
- En Ajustes › IA ve los complementos que tiene, con sus conectores y el estado de cada uno en palabras («conectado», «falta iniciar sesión», «no anda»), sin gastar uso.
- Un conector que pide sesión se conecta desde Iridium: «Conectar» abre la consola de adentro con lo que hace falta, y al volver queda «conectado».
- Con el navegador prendido, le pide a la IA «abrí tal página y fijate…» y la IA lo hace en su Chrome; si falta la extensión, Iridium lo dice y dice cómo instalarla.
- Lo que el motor no tiene, no se muestra (el motor falso puede no tener navegador ni conectores).

## Funcionalidades
### Must
- **Ver las capacidades** (Ajustes › IA › Capacidades): los complementos (nombre, de dónde salen, qué suman) y sus conectores con su estado; los de claude.ai, aparte. Sale del motor sin gastar y se refresca al abrir la pantalla.
- **Conectar un conector** que pide sesión, desde la consola de adentro (T-116), y prender o apagar uno que no se usa (apagado, no carga en las sesiones).
- **El navegador** (según Q-282): un interruptor en Ajustes › IA y, por proyecto, en Ajustes › Este proyecto; prendido, las sesiones nuevas lo tienen. Si falta la extensión, el aviso y el enlace para instalarla.
- **Por la frontera del motor:** el motor dice qué capacidades tiene y su estado; Iridium no sabe de MCP ni de Chrome.

### Should
- En la conversación, cuando la IA usa el navegador, el paso dice «en Chrome: …» como cualquier herramienta, sin pantallas nuevas.
- Si una sesión necesita un conector que no está conectado, la línea del error lo dice con «Conectar».

### Could
- Agregar o sacar complementos desde Iridium (hoy, desde claude.ai o `claude plugin`).

### Won't (por ahora)
- La PC, salvo que Q-283 elija otra cosa.
- Conectores sueltos que no vienen en un complemento ni en claude.ai (se suman con `claude mcp add`); el MCP de Iridium es T-118.
- Un navegador dentro de Iridium.

## Fuera de alcance
- El MCP propio de Iridium (T-118) y los comandos de Iridium (T-120): ideas aparte.
- Otro motor: solo la frontera lista.

## Impacto en el perfil
Sube el cuidado, no el nivel: sigue P2. Con el navegador, la IA usa las cuentas iniciadas en el Chrome del usuario, y lo que lee de una página es contenido de terceros (una página puede traer instrucciones escondidas). Por eso el navegador va apagado hasta que el usuario lo prende, y la extensión de Chrome pide permiso por sitio. Un servidor de terceros para la PC tendría control total del escritorio (Q-283).

## Términos nuevos (van al glosario general con el visto bueno)
| Término | Significado |
|---|---|
| Complemento | Un paquete que suma skills, comandos y conectores a la IA (en Claude, *plugin*) |
| Conector | Lo que le da a la IA acceso a otro servicio (Slack, Gmail, Figma…); puede pedir iniciar sesión |
| Capacidades | Lo que la IA de una sesión puede usar además de los archivos: complementos, conectores, el navegador y la PC |

## Portón
- [x] Objetivo, criterios de éxito y MoSCoW escritos
- [x] Fuera de alcance y lo que queda como idea (T-118, T-120)
- [x] Perfil revisado: sigue P2, con el navegador apagado de entrada
- [ ] Términos nuevos en el glosario general (con el visto bueno)
- [ ] Visto bueno del usuario (Q-284)
