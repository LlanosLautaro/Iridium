# UX del módulo: Inicio

**Fecha:** 2026-11-02
> Usa los principios de interacción y el design system generales (`04-ux.md`, `06-ui.md`). Alcance: `definicion.md` (Q-113). Se arma igual que Skills (`modulos/skills/ux.md` › SK-W1): sin maqueta aparte, se aprueba con las capturas de la app real.

## Puntos de entrada y salida
- **Entrar:** el ícono **Ideas** de la barra del inicio, el cuarto, debajo de Skills; o `Ctrl+4`. Dentro de un proyecto no aparece.
- **Salir:** cualquier otro ícono, el botón de inicio o una ficha de sesión. Guarda la idea elegida y lo escrito mientras Iridium está abierto (H-6).
- **Va a otro lugar:** un proyecto que la idea toca (abre su vista) y **Abrir como proyecto** (la carpeta `Ideas` en la vista de proyecto, con Docs, Git y los demás). Volver es el ícono Ideas.

## Historias de usuario
### IN-1 — Ver mis ideas
Como usuario quiero ver las ideas anotadas en el inicio, para leerlas sin abrir la carpeta ni preguntarle al chat.
- [ ] El ícono Ideas y `Ctrl+4` abren la sección; los otros atajos no cambian.
- [ ] La lista agrupa las ideas por sección de `ideas.md`, en su orden (Sueltas, Para proyectos existentes, Integradas), con el número de cada grupo; Integradas empieza plegada.
- [ ] Cada idea muestra su título y su fecha; al elegirla, el detalle la muestra entera, con los proyectos que toca y, si está integrada, a dónde fue.
- [ ] Cuando la IA cambia `ideas.md` (desde el chat, VS Code o el celular), la lista se actualiza sola y la idea elegida sigue elegida si sigue estando.

### IN-2 — Hablar de una idea
Como usuario quiero conversar sobre una idea al lado de la lista.
- [ ] A la derecha está el chat general: la misma conversación que al lado de la grilla, con su historial, su estado y Detener.
- [ ] Con una idea elegida, arriba del cuadro dice **Sobre la idea «…»** con una ✕; el mensaje sale con ese título al principio.
- [ ] En una suelta o para un proyecto existente, **Pedir que la integren** escribe en el chat el pedido de pasarla a su proyecto; lo mando o lo cambio antes. En una integrada no está.
- [ ] Cada proyecto que toca la idea es un enlace a ese proyecto.

### IN-3 — La grilla, solo proyectos
Como usuario quiero que la grilla muestre solo mis proyectos.
- [ ] `Ideas` y `Skills` no salen en la grilla ni cuentan en su número, con o sin archivados.
- [ ] El chat general sigue a la derecha de la grilla (Q-113).
- [ ] **Abrir como proyecto**, en la cabecera del panel Ideas y en la de Skills, abre esa carpeta en la vista de proyecto, como hasta ahora desde su tarjeta.
- [ ] Si una de las dos tiene una sesión abierta, su ficha de arriba sigue llevando a su vista de proyecto.

## Flujos
```
Ícono Ideas o Ctrl+4  →  lista (última idea elegida; la primera vez, la primera suelta) + detalle + chat general
   ├─ elegir una idea              → detalle; el chat dice «Sobre la idea …»
   │     ├─ escribir en el chat    → la IA de Ideas responde ahí (y puede reescribir ideas.md)
   │     ├─ Pedir que la integren  → el pedido queda escrito en el chat
   │     └─ un proyecto que toca   → la vista de ese proyecto
   └─ Abrir como proyecto          → la carpeta Ideas en la vista de proyecto
Volver: ícono Ideas (sigue donde estaba)
```
- **Falta la carpeta `Ideas`:** el panel dice lo mismo que el chat de la grilla hoy (cómo tenerla), sin lista.
- **Falta `ideas.md`:** «Todavía no hay ideas anotadas: contáselas al chat de la derecha», con el chat.
- **`ideas.md` sin el formato** (sin `## ` ni `### `): el detalle lo muestra entero, como en Docs, y la lista dice «Sin secciones».
- **Una idea sin fecha** en el título: sale igual, sin fecha.
- **Un proyecto nombrado que no existe** (por ejemplo, uno borrado): se ve como texto, sin enlace.
- **`ideas.md` de más de 2 MB:** como Docs (Defecto 8): dice cuánto pesa y no lo lee.

## Pantallas
### IN-W1 — Ideas
- Propósito: leer las ideas, hablar de ellas y pedir que se integren (IN-1, IN-2).
- Tres columnas, como Skills: la lista (su borde se arrastra y el ancho se recuerda, aparte del de Skills), el detalle y el chat general con el ancho de siempre.
- Wireframe:

```
┌───┬──────────────────────────────────────────────────────────────────────────────────┐
│ ◆ │ Ideas · 7 sin integrar                 [Abrir como proyecto]  Uso 34 % · [● otra app] │
│───│────────────────────┬───────────────────────────┬─────────────────────────────────│
│ ▦ │ SUELTAS · 3        │ App de arquitectura       │ Chat general             18 %   │
│ ✉3│▌App de arquitect…  │ guiada por IA             │                                 │
│ ✦ │   30 oct.          │ Suelta · 30 de octubre    │        ┌──────────────────────┐ │
│ 💡│ Gestor de audio …  │                           │        │ ¿Esto podría ser un  │ │
│   │   16 oct.          │ Para más adelante. Una    │        │ módulo de Iridium?   │ │
│   │ Lanzador de juegos │ persona sin conocimientos │        └──────────────────────┘ │
│   │   16 oct.          │ habla con una IA que hace │ Podría, pero el dominio es…     │
│   │ PARA la carpeta de proyectos · 4 │ de arquitecto… (entera)   │                                 │
│   │ otra app y otro proyecto co…  │                           │ ┌─────────────────────────────┐ │
│   │   otra app · otro proyecto   │ Toca a: Centro de Desarr. │ │ Sobre la idea «App de ar… ✕ │ │
│   │ …                  │                           │ │ Escribile a la IA…          │ │
│   │ INTEGRADAS · 5     │      [Pedir que la integren]│ └─────────────────────────────┘ │
│ ⚙ │ ▸ (plegado)        │                           │                     [Enviar]    │
└───┴────────────────────┴───────────────────────────┴─────────────────────────────────┘
 💡 Ideas (ícono nuevo, el cuarto)
```
- Estados:
  - **Con datos:** lo de arriba. El orden es el del archivo (la IA pone la más nueva arriba).
  - **Primera vez:** elegida la primera suelta; si no hay, la primera idea que haya.
  - **Cargando:** siluetas en la lista, como Skills.
  - **Vacío y errores:** ver Flujos.
  - **Extremos:** título largo, se corta con «…» y se ve entero al pasar el mouse; idea larga, el detalle se desplaza; muchas integradas, empiezan plegadas.

### Proyectos (W-2), cambiada
- Sin las tarjetas de `Ideas` y `Skills`; el número de la cabecera cuenta solo los proyectos. El chat general queda a la derecha como hoy.

## Piezas de UI nuevas
| Pieza | Por qué hace falta | Agregada al sistema |
|---|---|---|
| Ícono Ideas (una lamparita) para la barra del inicio | Sección nueva del inicio | no: va con la construcción, en `docs/ui/iconos/` y `DESIGN.md` |
| Lista con grupos plegables, detalle y chat | El panel | reusa las de Skills |
| «Sobre la idea …» arriba del cuadro | Decir de qué idea se habla | reusa «Sobre la skill …» |
