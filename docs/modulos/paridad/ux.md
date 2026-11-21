# UX del módulo: Paridad

**Fecha:** 2026-11-21
**Estado:** aprobada en Q-247, con un comando escondido escrito a mano que no se manda (Q-246, D-168)
> Usa los principios de interacción y el design system generales (`04-ux.md`, `06-ui.md`). Alcance: `definicion.md` (D-167).

## Puntos de entrada y salida
- **Dónde:** el compositor de la conversación (W-12), igual en la de un proyecto, la General, la de Skills y la de Ideas (es la misma pieza). No cambia el chat de la extensión de la Revisión ni el de Pendientes.
- **Cómo se entra:** escribiendo «/» al principio del mensaje, con el **+** nuevo a la izquierda del pie del compositor, con `Ctrl+U`, pegando (`Ctrl+V`) o arrastrando archivos sobre la conversación.
- **Cómo se sale:** mandando el mensaje; `Esc` cierra la lista o el menú sin borrar lo escrito; la ✕ de cada ficha saca ese adjunto.
- **Lo escrito no se pierde** (`04-ux.md` › Principios): los adjuntos sin mandar quedan con el texto al cambiar de proyecto o de sección, como lo escrito.

## Maquetas
En Iridium › Diseño, grupo «Paridad (propuesta)»: `diseno/pantallas/paridad-comandos.html` (la lista de «/»), `paridad-adjuntos.html` (el menú del + y las fichas), `paridad-escondido.html` (un comando escondido escrito a mano, la opción A de Q-246), `paridad-enviado.html` (cómo quedan en los mensajes mandados) y `paridad-soltar.html` (arrastrando archivos sobre la conversación, paso 6).

## Historias de usuario
### PA-1 — Elegir un comando con «/»
Como usuario quiero escribir «/» y elegir de una lista, para usar los comandos de Claude sin saberlos de memoria (C-64).
- [ ] «/» como primera letra del mensaje abre la lista arriba del compositor, de su mismo ancho; cada renglón dice el comando, en gris lo que se le escribe después y, abajo, para qué sirve (en el idioma en que lo da el motor). Los de un complemento dicen de cuál, a la derecha (`design`, `engineering`).
- [ ] Lo que escribo después de «/» filtra: primero los que empiezan así (por el nombre o por otro nombre: `/review` encuentra `/code-review`), después los que lo tienen en el medio. Se ven ocho renglones; el resto, bajando.
- [ ] Las flechas recorren la lista (el primero, marcado al abrir); `Enter`, `Tab` o un clic eligen; `Esc` la cierra y deja lo escrito.
- [ ] Elegido, queda en el cuadro «/nombre » con el cursor al final, para sumarle lo que pida; el segundo `Enter` lo manda. Elegir no manda.
- [ ] La lista se cierra sola al escribir un espacio o al borrar la «/». Una «/» en el medio del texto no abre nada.
- [ ] El + › **Comandos** escribe la «/» y abre la misma lista.

### PA-2 — Adjuntar archivos y fotos
Como usuario quiero sumar archivos y fotos al mensaje sin escribir su ruta (C-65).
- [ ] El **+** abre un menú hacia arriba con «Agregar archivos o fotos» (`Ctrl+U`) y «Comandos» (`/`). «Agregar» abre el selector de Windows, con varios a la vez.
- [ ] Arrastrar archivos sobre la conversación la marca con un borde punteado y «Suelta para adjuntar»; soltarlos los suma. Una carpeta también entra, como su ruta.
- [ ] Cada adjunto es una ficha arriba del cuadro: las fotos (PNG, JPEG, GIF, WebP) como miniatura cuadrada; lo demás, con el ícono y el nombre (la ruta entera al pasar el mouse). La ✕ lo saca.
- [ ] Una ficha de foto se abre grande con un clic, en el visor (abajo, Pantallas).
- [ ] Se puede mandar solo con adjuntos, sin texto.

### PA-3 — Pegar una captura
Como usuario quiero pegar una captura con `Ctrl+V` y que la IA la vea (C-66).
- [ ] Con una imagen en el portapapeles, `Ctrl+V` en el cuadro la suma como ficha de foto («Imagen pegada» al pasar el mouse), igual que la del +.
- [ ] Si el portapapeles tiene imagen y texto (copiado de una página), se pega el texto, como hoy.

### PA-4 — Que un texto largo pegado vaya aparte
Como usuario quiero pegar un error largo sin que llene el cuadro (C-67).
- [ ] Un pegado de **más de 40 líneas o más de 2.000 caracteres** queda como ficha «Texto pegado · 340 líneas».
- [ ] Un clic en la ficha lo abre en el visor para leerlo; la ✕ lo saca.
- [ ] `Ctrl+Z` justo después de pegar lo deja como texto en el cuadro, por si lo quería ahí.
- [ ] Varios pegados largos son varias fichas.

### PA-5 — Ver lo mandado
Como usuario quiero ver en la conversación qué mandé con cada mensaje, también al volver a abrirla.
- [ ] En mi mensaje, arriba del texto, las mismas fichas sin la ✕: la foto un poco más grande (un clic la abre en el visor), el archivo con su nombre (un clic lo abre: dentro del proyecto, en Archivos; fuera, con el programa de Windows) y el texto pegado plegado (un clic lo abre en el visor).
- [ ] Un comando mandado se ve con el comando en la letra de los códigos: «`/compact` conserva lo del instalador». La respuesta llega como cualquier mensaje de la IA.
- [ ] Al abrir una conversación anterior desde ◔, los adjuntos se ven igual (las fotos vienen del historial de Claude; el archivo, de su ruta; el texto pegado, de su bloque).

### PA-6 — Que no se ofrezca lo que el motor no tiene
- [ ] Un motor sin comandos: «/» no abre nada y el + no tiene «Comandos».
- [ ] Un motor sin fotos: el + dice «Agregar archivos»; una foto elegida o arrastrada va como archivo (su ruta) y una imagen pegada no se pega: una línea arriba del cuadro dice «Este motor no recibe fotos pegadas».

## Flujos
```
«/» al principio ─→ ¿lista leída? ─ no ─→ «Buscando los comandos…» (un renglón) ─→ la lista
                                   ─ sí ─→ la lista
la lista ─ escribir ─→ filtra ─ sin coincidencias ─→ «Ningún comando empieza con /xyz» (Enter lo manda como texto)
         ─ ↑↓ · Enter/Tab/clic ─→ «/nombre » en el cuadro ─ escribir lo que pide ─ Enter ─→ se manda
         ─ Esc · espacio · borrar la «/» ─→ se cierra, lo escrito queda
un comando escondido escrito a mano ─→ Q-246 (abajo, Estados)

+ ─→ menú ─ Agregar archivos o fotos (Ctrl+U) ─→ selector de Windows ─→ fichas
          ─ Comandos ─→ «/» y la lista
arrastrar sobre la conversación ─→ borde punteado ─ soltar ─→ fichas
Ctrl+V ─ imagen ─→ ficha de foto
       ─ texto > 40 líneas o > 2.000 caracteres ─→ ficha «Texto pegado» (Ctrl+Z: vuelve a texto)
       ─ texto corto ─→ en el cuadro, como siempre
Enter con fichas ─→ el mensaje con sus adjuntos ─→ las fichas en mi mensaje, sin ✕
```
- **El motor y los adjuntos:** las fotos viajan dentro del mensaje; los archivos, como su ruta en el texto; el texto pegado, como un bloque aparte con su nombre (`investigacion.md`). Para el usuario es lo mismo: fichas.

## Pantallas
### La lista de «/» (`paridad-comandos.html`)
```
┌───────────────────────────────────────────────┐
│ /recap                                        │  ← marcado
│ Generate a one-line session recap now         │
│ /reload-plugins [--force]                     │
│ Activate pending plugin changes in the cur…   │
│ /rename [name]                                │
│ Rename the current conversation               │
│ /design:research-synthesis <res…      design  │
│ Synthesize user research into themes, insi…   │
└───────────────────────────────────────────────┘
┌───────────────────────────────────────────────┐
│ /re                                           │
│ +  Opus  Medio                            [↑] │
└───────────────────────────────────────────────┘
```
- El menú de siempre (PZ-8, en lista), pegado arriba del compositor y de su ancho; la descripción en un renglón, cortada.
- Sin nada después de la «/»: todos, por orden alfabético; con el Should de la definición, primero «Usados hace poco» (hasta cinco) y después los demás.
- **Cargando** (la primera vez, mientras el motor da la lista): un renglón «Buscando los comandos…». **Error al leerla:** «No se pudieron leer los comandos»; lo escrito se manda igual.
- **Cambió la lista** durante la sesión (una skill nueva): la lista abierta se pone al día sin cerrarse.

### El + y los adjuntos en el compositor (`paridad-adjuntos.html`)
```
┌ Agregar archivos o fotos   Ctrl+U ┐
│ /  Comandos                     / │
└───────────────────────────────────┘
┌───────────────────────────────────────────────┐
│ [foto ✕] [foto ✕]                             │
│ [archivo registro-instalador.log ✕]           │
│ [Texto pegado 340 líneas ✕]                   │
│ Ahí va el error y la captura del instalador.  │
│ +  Opus  Medio                            [↑] │
└───────────────────────────────────────────────┘
```
- El **+** va primero en el pie, antes del modelo; el menú se abre hacia arriba.
- Las fichas van arriba del cuadro, donde ya están «Sobre la skill…» y las citas de Ideas y del Mapa: la misma pieza (la ficha con ✕), con la miniatura como variante para las fotos.
- **Arrastrando:** toda la conversación con un borde punteado y «Suelta para adjuntar» en el medio; los mensajes, atenuados.

### El visor
- Una foto: grande, centrada sobre el velo (PZ-8, cuadro), con su nombre y su tamaño abajo; `Esc` o un clic afuera la cierran.
- Un texto pegado: el mismo cuadro, más ancho, con el texto en la letra de los códigos y su cuenta de líneas; se puede seleccionar y copiar. En el compositor, abajo, **Sacar**.

### En los mensajes mandados (`paridad-enviado.html`)
```
            ┌──────────────────────────────────┐
            │ [foto]  [archivo registro-insta…]│
            │ [Texto pegado 340 líneas]        │
            │ Ahí va el error y la captura…    │
            └──────────────────────────────────┘
                 ┌─────────────────────────────┐
                 │ /compact conserva lo del …  │
                 └─────────────────────────────┘
```

## Estados y extremos
- **Un comando escondido escrito a mano** (`/model`, `/effort`, `/fast`, `/output-style`, `/clear`, `/context`, `/usage` y los de la terminal, D-167): lo decide Q-246. No se manda (Q-246, D-168): una línea arriba del cuadro dice dónde está eso en Iridium y, si hay, el botón que lo hace: «`/clear`: en Iridium, otra conversación se empieza con [Nueva]», «`/model`: en Iridium, el modelo se elige abajo», «`/context`: el contexto está abajo, al lado del modelo», «`/usage`: el uso está en la barra de abajo», «`/color`: solo sirve en la terminal». `Enter` no hace nada mientras está la línea; se va al cambiar lo escrito.
- **La IA trabajando:** el compositor funciona igual («Suma algo a lo que está haciendo…»): se pueden sumar adjuntos y comandos; los de Claude Code se responden cuando el motor los toma.
- **Una foto demasiado grande** (más de unos 5 MB o 8000 px por lado): se achica sola antes de mandarla (Should). Si no se puede (un archivo dañado), la ficha queda con el borde rojo y «No se puede mandar: no es una imagen válida» al pasar el mouse, y el mensaje no sale hasta sacarla.
- **Muchos adjuntos:** hasta 20 por mensaje; el 21 no entra y una línea arriba del cuadro lo dice. Las fichas se acomodan en varios renglones; el cuadro no se achica por debajo de dos líneas.
- **Un archivo que ya no está** al abrir su ficha en un mensaje viejo: «Ya no está en D:\…»; la conversación no cambia.
- **Mandar falla** (sin red, F-5): el mensaje vuelve al cuadro con sus fichas, como lo escrito hoy.
- **Ancho chico** (300 px): la lista de «/» usa el ancho del compositor y corta lo que se le escribe después; las fichas de archivo cortan el nombre.

## Accesibilidad y teclado
- La lista de «/» es una lista con su opción marcada para el lector de pantalla; el foco se queda en el cuadro mientras las flechas la recorren.
- Cada ✕ dice qué saca («Sacar registro-instalador.log»); cada ficha de foto dice su nombre.
- `Ctrl+U` abre el selector desde el cuadro; el + y su menú se recorren con `Tab` y las flechas; `Esc` cierra el menú, la lista y el visor.
- Arrastrar tiene su camino con teclado: el + o `Ctrl+U`.

## Piezas de UI nuevas
| Pieza | Por qué hace falta | Agregada al sistema |
|---|---|---|
| La ficha de adjunto (variante de la ficha con ✕ del compositor: miniatura para fotos, ícono y nombre para archivos y texto pegado; sin ✕ en un mensaje mandado) | La ficha de hoy («Sobre la skill», las citas) no tiene miniatura | sí: Ficha (PZ-16); al construir, las citas y «Sobre la skill» pasan a ella |
| El menú arriba del compositor (PZ-8, en lista, pegado al compositor y de su ancho) | El menú de siempre se abre debajo del botón; en el compositor no entra | sí: PZ-8, `.menu.arriba` y `.ancho` |
| El borde de soltar (la conversación con borde punteado y «Suelta para adjuntar») | No hay nada que se arrastre sobre la conversación | sí: un estado de la conversación (`soltando`, de la sección, no pieza), con su maqueta `paridad-soltar.html` |

El visor es el cuadro de siempre (PZ-8) con una foto o un texto adentro.
