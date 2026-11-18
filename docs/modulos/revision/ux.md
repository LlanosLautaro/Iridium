# UX del módulo: Revisión de la app

**Fecha:** 2026-10-28
> Usa los principios de interacción y el design system generales (`04-ux.md` › Principios de interacción, `DESIGN.md`). Baja fidelidad: el aspecto final se ve en el paso 6, con un prototipo.

Diseña la definición aprobada (`definicion.md`, Q-68). Hay dos lugares: **la app que se revisa** (una pestaña de Chrome o Edge, o la ventana de una app Electron en modo desarrollo), donde vive la extensión, e **Iridium**, donde se ven los comentarios de cada proyecto.

## Puntos de entrada y salida
- **En la app que se revisa:** `F8` prende y apaga el modo comentar (D-049); en Chrome y Edge, también el botón de la extensión en la barra del navegador. `Esc` también sale. La tecla la escucha la propia extensión dentro de la página, porque Electron no tiene atajos de extensión: así es la misma en los tres lugares. No hay barra sobre la app: nada ocupa lugar de la página mientras se comenta.
- **En Iridium:** un ícono nuevo, **Revisión**, en la barra del proyecto abierto, después de Archivos, con el número de comentarios abiertos. Se sale como de cualquier sección. Desde un comentario, el archivo y la línea abren Archivos en esa línea, y **Atrás** vuelve.
- **En la conversación:** un comentario enviado en el momento aparece como un mensaje tuyo, con su captura chica; tocarlo abre el comentario en Revisión.

## Historias de usuario

### H-R1 — Señalar un elemento y comentarlo
- Como usuario quiero apuntar a una parte de mi app y escribir qué le pasa, para no tener que explicarle a la IA de qué elemento hablo (C-36).
  - Criterios de aceptación:
    - [ ] `F8` (o el botón de la extensión) activa el modo comentar; abajo a la derecha aparece un aviso chico («Comentando en otra app», `Alt+↑` y cómo salir) que se va solo a los dos segundos. No aparece ninguna barra sobre la app (D-049).
    - [ ] Al pasar el mouse, el elemento de abajo se resalta con un borde y una etiqueta con su componente y su etiqueta HTML («Tarjeta › button»).
    - [ ] `Alt+↑` pasa al elemento que lo contiene y `Alt+↓` vuelve, para elegir una caja entera en vez de un botón.
    - [ ] En modo comentar, un clic elige el elemento y no lo activa (no aprieta el botón de la app).
    - [ ] Al elegir, se abre al lado del elemento la tarjeta del comentario, con el campo de texto listo para escribir.
    - [ ] **Dejar** (o `Enter`) lo guarda; `Shift+Enter` hace un salto de línea; `Esc` cierra la tarjeta.
    - [ ] Después de dejar uno, el modo comentar sigue activo para dejar otro. `F8` o `Esc` salen.

### H-R2 — Enviarlo en el momento
- Como usuario quiero mandar un comentario a la IA que está trabajando en ese proyecto, para que lo resuelva ya sin escribirlo de nuevo en Iridium (C-37).
  - Criterios de aceptación:
    - [ ] **Enviar ahora** (o `Ctrl+Enter`) lo guarda igual que Dejar y además lo suma a la sesión del proyecto en Iridium; si la IA está trabajando, entra en el turno en curso.
    - [ ] En la conversación aparece como un mensaje tuyo: el texto, la captura chica y dónde está («`Tarjeta.jsx`, línea 6»).
    - [ ] Si el proyecto no tiene una sesión abierta, queda guardado y la tarjeta lo dice: «Guardado. No hay una sesión abierta en otra app: la IA lo va a ver al empezar».

### H-R3 — Que llegue al proyecto correcto
- Como usuario quiero que cada comentario vaya al proyecto de la app que estoy mirando, sin elegirlo (C-39).
  - Criterios de aceptación:
    - [ ] El aviso al entrar y la cabecera de la tarjeta muestran a qué proyecto van («Comentando en otra app»).
    - [ ] Si Iridium no lo puede saber, la primera vez la tarjeta pregunta «¿De qué proyecto es `localhost:5173`?» con la lista de proyectos; la respuesta se recuerda para esa dirección.
    - [ ] Se puede cambiar desde la tarjeta (tocar el nombre del proyecto en su cabecera), por si la dirección pasó a otro proyecto.

### H-R4 — No perder un comentario
- Como usuario quiero que lo que escribí quede guardado aunque Iridium esté cerrado o algo falle, para no tener que repetirlo.
  - Criterios de aceptación:
    - [ ] Con Iridium cerrado, **Dejar** funciona: la tarjeta dice «Iridium está cerrado: queda acá y se manda al abrirlo». **Enviar ahora** se apaga, con ese motivo.
    - [ ] En Chrome y Edge, el botón de la extensión muestra cuántos esperan; al abrir Iridium se mandan solos.
    - [ ] Si se cierra la tarjeta con texto escrito, el texto queda: al volver a elegir ese elemento, la tarjeta lo trae.
    - [ ] Si falla la captura o no hay archivo y línea, el comentario se guarda igual con las pistas que haya.

### H-R5 — Ver los comentarios de un proyecto y reabrir uno
- Como usuario quiero ver en Iridium qué comenté, qué resolvió la IA y reabrir lo que no quedó bien (C-38).
  - Criterios de aceptación:
    - [ ] **Revisión**, en la barra del proyecto, muestra los comentarios en tres grupos: **Abiertos**, **Anotados** (quedaron en un plan sin hacer, D-088) y **Cerrados**, del más nuevo al más viejo; el ícono cuenta los abiertos. *(Desde DI-I3, tanda 10: **Nuevos**, **Anotados**, **Hechos** y **Todos**, como la maqueta `docs/diseno/pantallas/revision.html`; «Enviar ahora» de la sección se llama **Mandar a la IA** y está también en cada fila. En la tarjeta de F8 sigue «Enviar ahora».)*
    - [ ] Cada fila: la captura chica, el texto (dos líneas), dónde está (archivo y línea, o la página) y la fecha. En los cerrados, cuándo los cerró la IA y una línea de lo que hizo; en los anotados, cuándo y dónde quedaron.
    - [ ] Al elegir uno se ve entero: la captura grande, el texto, todas las pistas y su historia (dejado, enviado, cerrado, reabierto).
    - [ ] El archivo y la línea son un enlace que abre Archivos en esa línea.
    - [ ] Un abierto se puede **Enviar ahora** desde acá. Un cerrado se puede **Reabrir**, con una nota opcional de qué falta; vuelve a Abiertos.
    - [ ] No se borra nada desde la app (`04-ux.md` › Principios de interacción).

### H-R6 — Que la IA los encuentre sola
- Como usuario quiero que la IA sepa que hay comentarios abiertos sin decírselo, y que los cierre cuando los resuelve (Q-21).
  - Criterios de aceptación:
    - [ ] La IA sabe dónde están los comentarios y cómo cerrarlos: en Iridium, por la instrucción de la sesión; en VS Code, por la guía (D-048).
    - [ ] Al cerrar uno, la IA escribe una línea de lo que hizo; en Revisión pasa a Cerrados.

### H-R7 — Preparar una app Electron
- Como usuario quiero que una app Electron mía cargue la extensión en modo desarrollo sin hacerlo yo (D-047).
  - Criterios de aceptación:
    - [ ] En un proyecto Electron que todavía no la carga, Revisión lo dice y ofrece **Pedírselo a la IA**: escribe el pedido en la conversación, sin enviarlo.
    - [ ] Con la línea agregada, al abrir la app en modo desarrollo el atajo funciona igual que en el navegador, con captura.
    - [ ] La versión armada de la app no trae la extensión.

## Flujos

### FR-1 — Dejar un comentario
```
App en desarrollo ─ F8 ─▶ modo comentar (aviso abajo a la derecha, 2 s: «Comentando en otra app · F8 o Esc para salir»)
   │ pasar el mouse → resalta el elemento («Tarjeta › button»)
   │ Alt+↑ / Alt+↓ → elemento que lo contiene / volver
   ▼ clic
Tarjeta del comentario (al lado del elemento) ─ escribir ─ Dejar ─▶ «Guardado» en la tarjeta, que se cierra
   │                                                              │
   │ Esc → se cierra; el texto queda para la próxima vez          ▼
   ▼                                                    sigue el modo comentar
 F8 o Esc (sin tarjeta abierta) → sale del modo comentar
```

### FR-2 — Enviar ahora
```
Tarjeta ─ Enviar ahora ─▶ se guarda ─▶ ¿Iridium tiene una sesión abierta en el proyecto?
                                         ├─ sí, trabajando → entra en el turno en curso
                                         ├─ sí, esperando  → arranca un turno con el comentario
                                         └─ no             → queda guardado; la tarjeta lo dice
   En la conversación: mensaje tuyo con el texto, la captura chica y «Tarjeta.jsx, línea 6»
```

### FR-3 — Proyecto que Iridium no reconoce
```
Activar el modo comentar en localhost:5173 ─▶ Iridium no sabe de qué proyecto es
   ▼
El aviso dice «¿De qué proyecto es esta app? Lo elegís en la tarjeta» y, al elegir el primer elemento, la tarjeta trae la lista
   ▼ elegir «otra app»
Se recuerda localhost:5173 → otra app; la próxima vez no pregunta
```

### FR-4 — Iridium cerrado o sin respuesta
```
Dejar ─▶ Iridium no responde ─▶ queda en la extensión («Iridium está cerrado: queda acá y se manda al abrirlo»)
                                  (botón de la extensión: «2») ── al abrir Iridium ──▶ se mandan solos
Enviar ahora ─▶ apagado mientras Iridium no responde
```

### FR-5 — Ciclo del comentario
```
Abierto ──(la IA lo resuelve y lo cierra, con una línea de lo que hizo)──▶ Cerrado
   ▲                                                                       │
   └──────────────(Reabrir en Revisión, con una nota opcional)─────────────┘
```

### FR-6 — Lo que puede faltar
| Situación | Qué pasa |
|---|---|
| Sin React, o sin mapa de fuentes | La etiqueta del resaltado muestra solo la etiqueta HTML; el comentario no trae archivo y línea, sí las demás pistas |
| La captura falla | Se guarda sin captura; en Revisión, la fila muestra «sin captura» en vez de la imagen |
| Una página que no es de desarrollo (no es `localhost` ni una app Electron con la línea) | La extensión no hace nada: el atajo no se escucha |
| El elemento ya no existe cuando la IA lo busca | Sigue teniendo el texto, la captura y el archivo y la línea; eso alcanza para encontrarlo (`investigacion.md`) |
| Mucho texto | La tarjeta crece hasta la mitad de la ventana y después hace scroll |

## Pantallas

### W-R1 — Modo comentar, en la app que se revisa
- Propósito: elegir el elemento sin tocar la app.
- Wireframe:

```
┌────────────────────────────────────────────────────────────────────┐
│  App de prueba                                                     │
│  ┌──────────────────────────┐                                      │
│  │ Primera                  │                                      │
│  │ ┏━━━━━━━━━┓              │                                      │
│  │ ┃ Guardar ┃ ← resaltado  │                                      │
│  │ ┗━━━━━━━━━┛              │                                      │
│  │  Tarjeta › button        │ ← etiqueta del resaltado             │
│  └──────────────────────────┘                                      │
│                         ┌──────────────────────────────────────┐   │
│                         │● Comentando en otra app                  │   │ ← aviso, 2 s
│                         │  Alt+↑ la caja · F8 o Esc para salir │   │
│                         └──────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```
- Estados: **activo** (como arriba) · **proyecto sin reconocer** (el aviso dice «¿De qué proyecto es esta app? Lo elegís en la tarjeta») · **Iridium cerrado** (el aviso dice «Iridium está cerrado: los comentarios quedan acá») · **sobre un elemento sin componente** (la etiqueta muestra solo `button`).
- El aviso no se repinta mientras se mueve el mouse: aparece una vez al entrar y se va solo (Q-69).

### W-R2 — Tarjeta del comentario
- Propósito: escribir el comentario y elegir entre dejarlo o enviarlo.
- Wireframe:

```
 ┏━━━━━━━━━┓  ┌ Tarjeta › button · Tarjeta.jsx:6 ──── otra app ▾ × ┐
 ┃ Guardar ┃  │ > el botón queda muy pegado al título; separalo │
 ┗━━━━━━━━━┛  │                                                 │
              │ Enter deja · Ctrl+Enter envía   [Enviar ahora] [Dejar] │
              └─────────────────────────────────────────────────┘
```
- Se ubica al lado del elemento, del lado donde entra; si no entra, abajo. El elemento elegido queda resaltado mientras la tarjeta está abierta.
- **Dejar** es el botón principal (lo más común); **Enviar ahora**, secundario (llega en R-I2).
- La cabecera muestra el componente y la etiqueta; el archivo y la línea los resuelve Iridium al guardar, y la confirmación dice el `R-n` («Guardado en otra app · R-3 · docs/revision/R-3.md»).
- Estados:
  - **Proyecto sin reconocer:** arriba del campo, «¿De qué proyecto es `localhost:5173`?» y la lista. Se puede Dejar sin elegir: Iridium lo busca por el código; si no lo encuentra, la tarjeta vuelve a pedirlo con lo escrito intacto (R-I1).
  - **Guardado:** la tarjeta muestra «Guardado en otra app» un segundo y se cierra.
  - **Enviado:** «Enviado a la sesión de otra app». **Sin sesión:** «Guardado. No hay una sesión abierta en otra app: la IA lo va a ver al empezar» (se queda hasta tocar o `Esc`).
  - **Iridium cerrado:** «Iridium está cerrado: queda acá y se manda al abrirlo»; Enviar ahora apagado.
  - **Texto a medio escribir:** al volver al mismo elemento, la tarjeta lo trae.

### W-R3 — Revisión, en la vista del proyecto
> Desde DI-I3 (tanda 10) la pantalla es la maqueta `docs/diseno/pantallas/revision.html`; este dibujo queda como historia.
- Propósito: ver los comentarios del proyecto, su estado y reabrir (H-R5).
- Wireframe:

```
┌──┬─[● otra app ×]──────────────────────────────────────────────────[─ □ ×]┐
│◆ │ otra app · Hito 7 · I-3                    │ Conversación              │
├──┤────────────────────────────────────────┼───────────────────────────│
│■ │ Revisión     [Abiertos 3] [Cerrados 12]│ …                         │
│◈ │ ┌────┐ el botón queda muy pegado al    │                           │
│□ │ │cap.│ título; separalo                │                           │
│▪ │ └────┘ Tarjeta.jsx:6 · hoy 14:32       │                           │
│● │ ┌────┐ el menú no se cierra al tocar   │                           │
│3 │ │cap.│ afuera                          │                           │
│◇ │ └────┘ Menu.tsx:41 · ayer              │                           │
│▶ │                                        │ [ escribir…             ] │
└──┴──────────────────── barra de estado ─────────────────────────────────┘
 ●  Revisión (3 abiertos; el número no va en ámbar: esperan a la IA, no al usuario)
```
- Comentario elegido (reemplaza la lista; **Atrás** vuelve):

```
│ ← Atrás   R-14 · abierto                       [Enviar ahora]   │
│ ┌──────────────────────────────┐                                │
│ │        captura grande        │  el botón queda muy pegado al  │
│ └──────────────────────────────┘  título; separalo              │
│ Dónde: Tarjeta.jsx, línea 6 (enlace) · Tarjeta › App             │
│ Página: localhost:5173/ajustes · texto «Guardar» · selector …    │
│ Historia: dejado hoy 14:32 · enviado 14:33                       │
```
- En un cerrado, en lugar de **Enviar ahora**: **Reabrir**, que despliega una nota opcional («qué falta») y **Reabrir** para confirmar. La historia suma «cerrado por la IA ayer: separó el título con 12 px».
- Estados:
  - **Vacío:** «Todavía no hay comentarios. Abrí la app en modo desarrollo y apretá `F8`», con cómo instalar la extensión (`docs/scripts.md`) y «Extensión: conectada por última vez hoy 14:32» o «nunca conectada».
  - **Electron sin la línea:** además, «Esta app es Electron y todavía no carga la extensión» con **Pedírselo a la IA** (H-R7).
  - **Cargando:** siluetas de filas.
  - **Sin cerrados / sin abiertos:** el grupo vacío dice «Ninguno»; los botones de grupo muestran 0.
  - **Error:** un comentario que no se puede leer va al final, como texto, con «No se pudo leer este comentario»; el resto se muestra.
  - **Extremos:** muchos comentarios → la lista se desplaza; captura que falta → «sin captura»; archivo que ya no existe → el enlace dice «ya no está» y no abre.

### W-R4 — Comentario en la conversación
- Propósito: que se vea qué se le mandó a la IA (H-R2).
```
 Vos                                                  14:33
 ┌ Comentario R-14 · Tarjeta.jsx:6 ──────────────────────┐
 │ [cap.] el botón queda muy pegado al título; separalo  │
 └───────────────────────────────────────────────────────┘
```
- Tocarlo abre el comentario en Revisión.

## Piezas de UI nuevas
Se diseñan en el paso 6 con un prototipo y se agregan a `DESIGN.md` (`06-ui.md` las cita).

| Pieza | Por qué hace falta | Agregada al sistema |
|---|---|---|
| Resaltado de elemento con su etiqueta | Mostrar qué se va a comentar sobre una app ajena, sin confundirse con ella | sí (`DESIGN.md` › Revisión de la app) |
| Aviso del modo comentar (reemplaza la barra, D-049) | Decir que se está comentando, en qué proyecto y cómo salir, sin ocupar lugar de la app | sí (`DESIGN.md` › Revisión de la app) |
| Tarjeta del comentario | El campo para escribir dentro de otra app; parte del compositor | sí (`DESIGN.md` › Revisión de la app) |
| Fila de comentario con captura | La lista de Revisión | sí (`DESIGN.md` › Revisión de la app) |
| Ícono Revisión | La barra del proyecto | sí (`DESIGN.md` › Revisión de la app) |

Lo que va dentro de la app que se revisa tiene que verse igual en cualquier app: lleva sus propios estilos y letras (las de Iridium) aislados de los de la página.

## Para el diseño técnico
- Dónde vive la extensión, cómo la instala el usuario y cómo la encuentra la línea de cada app Electron.
- El formato y la carpeta de los comentarios (`R-n`), cómo se cierran y se reabren, y qué le dice el `CLAUDE.md` a la IA.
- Cómo sabe la extensión si Iridium está abierto y a qué proyecto va cada dirección; la cola de la extensión.
- Cómo entra un comentario a la sesión (mensaje con la captura) y cómo se muestra en la conversación.
- Cómo sabe Iridium que un proyecto es Electron y si ya carga la extensión (H-R7).
