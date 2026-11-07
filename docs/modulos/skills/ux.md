# UX del módulo: Skills

**Fecha:** 2026-10-31
> Usa los principios de interacción y el design system generales (`04-ux.md`, `06-ui.md`). Alcance: `definicion.md` (D-064). Validada con Q-89, con el chat a la derecha y el formato en `docs/README.md` (D-068).

## Puntos de entrada y salida
- **Entrar:** un ícono **Skills** en la barra de íconos del inicio, después de Proyectos y Pendientes (`04-ux.md` › Arquitectura de información ya lo preveía, B-11); o `Ctrl+3`. Dentro de un proyecto no aparece: las skills son de toda la PC.
- **Salir:** cualquier otro ícono, el botón de inicio o una ficha de sesión. Como todas las secciones, guarda la skill elegida y lo escrito mientras Iridium está abierto (H-6).
- **Va a otro lugar:** solo «Ver la conversación» de un proyecto atrasado, que abre ese proyecto en su vista; volver es el ícono Skills. Lo demás pasa en la sección: el chat de `Skills` está a la derecha y «Poner al día» manda el pedido sin salir (D-068).
- Armada como una columna de lista, un detalle y el chat, para que más adelante pueda ir como panel del módulo Inicio sin rehacerla (`propuesta.md`).

## Historias de usuario
### SK-1 — Ver mis skills y de dónde viene cada una
Como usuario quiero ver todas las skills de la PC agrupadas por origen para saber cuáles son mías y cuáles llegan de afuera.
- [ ] La lista agrupa las skills en **Propias**, **Copias de terceros**, **De complementos** y **Desde la cuenta**, con el número de cada grupo.
- [ ] Cada skill muestra su nombre y la primera línea de qué hace; al elegirla, el detalle muestra la descripción entera, el origen en palabras y la carpeta (con **Abrir carpeta**).
- [ ] Una skill de un complemento dice de cuál (`engineering`, `design`…).
- [ ] Lo borrado (`.trash`) no aparece.

### SK-2 — Saber cuáles están dos veces
Como usuario quiero que Iridium me avise de las copias dobles y me diga cuál sobra (D-014).
- [ ] Una skill que está dos veces lleva una marca ⚠ en la lista, en las dos entradas, y el número de dobles se ve arriba de la lista.
- [ ] En el detalle, el aviso dice dónde está la otra copia y cuál sobra, con el motivo en una línea (por ejemplo: «Sobra la carpeta suelta: la del complemento es más nueva»).
- [ ] Iridium no borra nada: el aviso ofrece **Pedir que la saquen**, que escribe el pedido en el chat de la derecha; lo mando o lo cambio antes.

### SK-3 — Hablar con la IA de una skill
Como usuario quiero conversar con la IA de `Skills` al lado de la lista, para pensar y pedir cambios a mis skills sin abrir VS Code ni buscar la carpeta.
- [ ] A la derecha está la conversación de `Skills`: la misma que al entrar a ese proyecto, con su historial, su estado y Detener.
- [ ] Con una skill elegida, arriba del cuadro de escribir dice **Sobre la skill hitos-desarrollo-app** con una ✕; el mensaje sale con ese nombre al principio. Sin skill elegida (o con la ✕), el mensaje sale tal cual.
- [ ] La IA responde y pregunta en el chat (es un chat que se mira, como el de Ideas); no deja preguntas en un `estado.md`.
- [ ] El detalle de una skill que no es propia dice por qué no se edita desde la PC («Llega de la cuenta: no se puede cambiar desde la PC»); igual se puede hablar de ella en el chat.
- [ ] Cuando la IA termina un cambio, el detalle de la skill muestra la descripción nueva sin reiniciar Iridium.

### SK-4 — Poner al día los proyectos atrasados
Como usuario quiero ver qué proyectos quedaron con un formato viejo de la guía y ponerlos al día uno por uno sin escribir el pedido.
- [ ] Arriba de la lista hay una entrada fija **Proyectos atrasados** con el número; en cero dice «Todos al día».
- [ ] Al elegirla, el detalle lista los proyectos atrasados con su ícono, su nombre y qué formato tienen («formato del 16 de octubre», «sin formato» o «marcado a mano»), y arriba el vigente («La guía va por el formato del 29 de octubre»).
- [ ] Los archivados, descontinuados o reemplazados por otro no aparecen.
- [ ] Cada proyecto tiene **Poner al día**: manda a su conversación el pedido de actualizar el formato (`actualizar-formato.md` de la guía) sin salir de Skills. Gasta uso solo cuando lo toco.
- [ ] Mientras la IA lo actualiza, la fila muestra ● trabajando y **Ver la conversación**; cuando termina y el proyecto ya tiene el formato vigente, sale de la lista.
- [ ] Si su IA ya está trabajando en otra cosa, el botón queda apagado con «Trabajando en otra cosa».
- [ ] El detalle de `hitos-desarrollo-app` también dice «3 proyectos atrasados» con un enlace a esta lista.

## Flujos
```
Ícono Skills o Ctrl+3  →  lista (última skill elegida; la primera vez, Proyectos atrasados) + chat de Skills
   ├─ elegir una skill           → detalle; el chat dice «Sobre la skill …»
   │     ├─ escribir en el chat  → la IA de Skills responde ahí
   │     ├─ con ! doble          → Pedir que la saquen → el pedido queda escrito en el chat
   │     └─ Abrir carpeta        → el explorador de Windows
   └─ Proyectos atrasados        → lista de proyectos
         └─ Poner al día         → el pedido sale en la conversación de ese proyecto (● trabajando)
               ├─ Ver la conversación → la vista de ese proyecto
               └─ al terminar con el formato vigente, sale de la lista
Volver: ícono Skills (sigue donde estaba)
```
- **No se puede leer la carpeta de skills** (`.claude\skills` no existe o no se puede abrir): el grupo afectado dice «No se pudo leer `C:\Users\…\.claude\skills`» con **Reintentar**; los demás grupos se muestran igual.
- **Un `SKILL.md` roto** (sin `name` o sin `description`): la skill aparece con el nombre de su carpeta, «Sin descripción» y una línea gris «El archivo SKILL.md no tiene descripción».
- **Un enlace roto** (la propia apunta a una carpeta de `Skills` que ya no existe): aparece en Propias con ⚠ «El enlace no lleva a ningún lado» y **Pedir que lo arreglen** (escribe el pedido en el chat).
- **Falta el proyecto `Skills`** en la carpeta de proyectos: en lugar del chat, «No encuentro el proyecto Skills en la carpeta de proyectos», como el chat de Ideas cuando falta su carpeta.
- **Claude Code sin sesión o caído:** el chat y la fila del proyecto muestran su error de siempre (F-5); el pedido queda escrito en el cuadro de esa conversación para mandarlo después.
- **No se sabe cuál es el formato vigente** (el `SKILL.md` de la guía no lo dice): la entrada dice «No sé qué formato pide la guía» y no lista ninguno.
- **Un proyecto sin `docs/estado.md`:** no aparece como atrasado; no sigue la guía y eso es otra cosa.

## Pantallas
### SK-W1 — Skills
- Propósito: ver las skills por origen, hablar de ellas con la IA y poner al día los proyectos (SK-1 a SK-4).
- Tres columnas: la lista (como la de Pendientes, W-5; su borde derecho se arrastra o se mueve con las flechas, y el ancho se recuerda, R-6), el detalle y el chat de `Skills` con el mismo ancho que en un proyecto (se mueve con su divisor). Con la ventana al mínimo (1024 px), el detalle se angosta primero.
- El detalle tiene, debajo de la cabecera, el árbol de la carpeta de la skill y el visor de Archivos (Q-95): **Resumen** (avisos y descripción) es la primera entrada y la que se ve al elegir una skill; cada archivo se lee ahí mismo, sin ir a la carpeta. Solo lectura: los cambios se piden en el chat (D-018).
- Wireframe (eligiendo una propia):

```
┌───┬──────────────────────────────────────────────────────────────────────────────────┐
│ ◆ │ Skills · 34 · ! 1 doble                                 Uso 34 % · 61 %  [● otra app]│
│───│────────────────────┬───────────────────────────┬─────────────────────────────────│
│ ■ │ ○ Proyectos atrasa-│ hitos-desarrollo-app      │ Skills          18 %   │
│ □3│   dos · 3          │ Propia · enlace a Skills  │                                 │
│ ✶ │────────────────────│ y Claude  [Abrir carpeta] │        ┌──────────────────────┐ │
│   │ PROPIAS · 2        │                           │        │ ¿Se puede hacer que  │ │
│   │▌hitos-desarrollo-… │ Guía de hitos para llevar │        │ la guía pida…?       │ │
│   │   Guía de hitos p… │ una app desde la idea     │        └──────────────────────┘ │
│   │ gestor-proyectos   │ vaga hasta el lanzamiento │ Sí: en «Formato de la documen-  │
│   │   Reglas para ma…  │ y la operación… (entera)  │ tación» se puede sumar…         │
│   │ COPIAS DE TERC.· 1 │                           │                                 │
│   │ ! impeccable       │ ○ 3 proyectos con un      │ ┌─────────────────────────────┐ │
│   │ DE COMPLEMENTOS·21 │   formato viejo → Ver     │ │ Sobre la skill hitos-desa… ✕│ │
│   │ ▸ (plegado)        │                           │ │ Escribile a la IA…          │ │
│   │ DESDE LA CUENTA·10 │                           │ └─────────────────────────────┘ │
│ ◇ │ ▸ (plegado)        │                           │                     [Enviar]    │
└───┴────────────────────┴───────────────────────────┴─────────────────────────────────┘
 ✶ Skills (ícono nuevo) · ○ proyectos atrasados · ! está dos veces
```

  El detalle de una copia doble y la lista de atrasados, en la columna del medio:

```
 impeccable                                Proyectos atrasados · 3
 Copia de un tercero · carpeta suelta      La guía va por el formato del 29 de octubre
 [Abrir carpeta]                           ┌──────────────────────────────────────┐
 ┌ ! Está dos veces ──────────────────┐    │ [ícono] otra app               │
 │ También llega del complemento      │    │  formato del 16 de octubre           │
 │ impeccable (impeccable:impeccable).│    │                      [Poner al día]  │
 │ Sobra esta carpeta: la del         │    │ [ícono] otro proyecto  marcado a mano       │
 │ complemento es más nueva (D-014).  │    │                      [Poner al día]  │
 │            [Pedir que la saquen]   │    │ [ícono] otra app   formato del 16 oct.  │
 └────────────────────────────────────┘    │  ● trabajando  Ver la conversación   │
 Use when the user wants to design…        └──────────────────────────────────────┘
 No se edita desde Iridium: es de          El pedido sale en la conversación de
 un tercero.                               cada proyecto; seguís acá.
```
- Estados:
  - **Con datos:** lo de arriba. El orden dentro de cada grupo es por nombre.
  - **Primera vez:** elegida la entrada Proyectos atrasados (o la primera propia si están todos al día).
  - **Cargando:** siluetas de filas en la lista; el detalle, vacío hasta que llega. El chat carga como en un proyecto.
  - **Vacío:** un grupo sin skills no se muestra; sin ninguna skill, «No hay skills en esta PC» con la ruta que se miró.
  - **Todos al día:** la entrada dice «Todos al día» con ✓ y el detalle, «Ningún proyecto tiene un formato viejo de la guía».
  - **Error:** ver Flujos.
  - **Extremos:** nombre largo, se corta con «…» y se ve entero al pasar el mouse; descripción larga, el detalle se desplaza; muchas skills de complementos, cada grupo se puede plegar (los de afuera empiezan plegados si pasan de 10); un cambio hecho afuera de Iridium (VS Code), la lista se actualiza sola.

## Piezas de UI nuevas
| Pieza | Por qué hace falta | Agregada al sistema |
|---|---|---|
| Ícono Skills para la barra del inicio | Sección nueva del inicio | no: va en el paso 6 del módulo (con `docs/ui/iconos/`) |
| Grupo plegable con título y número en una lista | Pendientes no agrupa; acá hay cuatro orígenes y uno puede tener 20 o más | no: paso 6 |
| Aviso dentro del detalle (⚠ con texto y un botón) | Las copias dobles y los enlaces rotos | no: paso 6; se apoya en el color de espera de `06-ui.md` |
| «Sobre la skill …» arriba del cuadro de escribir | Decir de qué skill se habla sin escribirlo | no: paso 6; una etiqueta chica con ✕, como las de Archivos |
| Fila de proyecto con estado de sesión y botón | La lista de atrasados | reusa la tarjeta chica de proyecto de Pendientes y el estado de W-4 |
| El chat al lado | La conversación de `Skills` | reusa el chat de Ideas de la vista de Proyectos (D-060) |
