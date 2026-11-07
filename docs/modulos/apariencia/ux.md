# UX del módulo: Apariencia y ajustes

**Fecha:** 2026-10-30
> Usa los principios de interacción y el design system generales (`04-ux.md`, `06-ui.md`). Alcance: `definicion.md` (D-065).

## Puntos de entrada y salida
- **Entrar:** el ⚙ abajo en la barra de íconos de la izquierda (estaba en `04-ux.md` › W-1 y no se había construido), en cualquier pantalla; o `Ctrl+,`.
- **Salir:** `Esc`, la ✕ de arriba a la derecha o un clic fuera de la ventana. Se vuelve a lo que estaba a la vista, sin moverlo (la conversación y lo escrito siguen igual).
- La ventana recuerda la última sección abierta mientras Iridium está abierto; al abrir Iridium de nuevo empieza por Perfil.

## Historias de usuario
### AJ-1 — Cambiar el tema
Como usuario quiero elegir el tema de Iridium para trabajar con el que me resulta más cómodo.
- [ ] En Apariencia veo los temas como tarjetas con una miniatura de la app en ese tema y su nombre; el actual está marcado.
- [ ] Al tocar uno, toda la app cambia en el momento, también lo que está detrás de la ventana.
- [ ] Cierro y abro Iridium: sigue el tema elegido, sin un parpadeo del anterior al arrancar.

### AJ-2 — Mi nombre y el de la IA
Como usuario quiero que la conversación diga mi nombre y, si quiero, uno para la IA.
- [ ] En Perfil escribo mi nombre; en la conversación, mis mensajes dicen ese nombre en lugar de «Vos».
- [ ] En IA escribo un nombre opcional; la respuesta de la IA lo muestra en lugar de «IA». Vacío, vuelve a «IA».
- [ ] Se guarda solo mientras escribo; no hay botón Guardar.

### AJ-3 — El tono de la IA
Como usuario quiero elegir cómo me responde la IA en Iridium.
- [ ] En IA veo los estilos que trae Claude Code (normal, Explicativo, Aprendizaje) y los que haya en `~/.claude/output-styles/`, cada uno con una línea de qué cambia.
- [ ] El elegido vale para los mensajes siguientes de las sesiones de Iridium (si hace falta conversación nueva, la ventana lo dice).
- [ ] VS Code y la terminal siguen con su estilo.

## Flujos
```
◇ o Ctrl+,  →  ventana de Ajustes (última sección)
                 ├─ Perfil      → escribir nombre → se ve en la conversación
                 ├─ IA          → nombre (opcional) · tono → mensajes siguientes
                 └─ Apariencia  → tocar un tema → toda la app cambia
Esc · ✕ · clic afuera  →  vuelve a donde estaba
```
- **Error al guardar** (la carpeta de datos no se puede escribir): aviso chico abajo en la ventana, «No se pudo guardar; sigue como antes», y el cambio se deshace en pantalla.
- **No se pueden leer los estilos de Claude Code** (sin sesión iniciada, motor caído): la lista muestra solo «Normal» y una línea gris «Los demás estilos aparecen cuando Claude Code esté disponible».

## Pantallas
### AJ-W1 — Ventana de Ajustes
- Propósito: elegir lo poco que se configura, sin salir de lo que se está haciendo.
- Referencia: la de Obsidian y la de Claude Desktop (Q-84).
- Wireframe (sobre la app oscurecida; unos 860 × 600, centrada):

```
┌───┬────────────────────────────────────────────────────────────────┐
│   │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ■ │░░░┌──────────────────┬────────────────────────────────────┐░░░░│
│ □ │░░░│ Ajustes          │ Apariencia                      ✕  │░░░░│
│   │░░░│                  │                                    │░░░░│
│   │░░░│  Perfil          │ Tema                               │░░░░│
│   │░░░│  IA              │ ┌────────┐ ┌────────┐ ┌────────┐   │░░░░│
│   │░░░│ ▌Apariencia      │ │▒▒ ▒▒▒▒ │ │▓▓ ▓▓▓▓ │ │▓▓ ▓▓▓▓ │   │░░░░│
│   │░░░│                  │ │▒▒ ▒▒▒▒ │ │▓▓ ▓▓▓▓ │ │▓▓ ▓▓▓▓ │   │░░░░│
│   │░░░│                  │ └────────┘ └────────┘ └────────┘   │░░░░│
│   │░░░│                  │  Iridium    ✓ Grafito  …           │░░░░│
│   │░░░│                  │                                    │░░░░│
│   │░░░│                  │                                    │░░░░│
│ ◇ │░░░└──────────────────┴────────────────────────────────────┘░░░░│
└───┴────────────────────────────────────────────────────────────────┘
```

  Las otras secciones, en la misma columna derecha:

```
 Perfil                               IA
 Tu nombre                            Nombre (opcional)
 [                            ]       [                         ]  «IA» si queda vacío
 Se ve en la conversación             Tono
 en lugar de «Vos».                   (●) Normal       Responde directo
                                      ( ) Explicativo  Suma por qué hizo cada cosa
                                      ( ) Aprendizaje  Te deja partes para hacer vos
                                      Vale para las sesiones de Iridium.
```
- Estados:
  - **Con datos:** lo de arriba.
  - **Primera vez:** nombre vacío con la sugerencia «Cómo querés que te llame»; la conversación sigue diciendo «Vos».
  - **Cargando estilos:** la lista de tono con una línea en gris hasta que llegan (no tapa lo demás).
  - **Error:** ver Flujos.
  - **Extremos:** nombre largo, se corta con «…» en la conversación (entero al pasar el mouse); muchos estilos propios, la lista se desplaza dentro de la sección; ventana chica de Iridium, la ventana de Ajustes ocupa casi todo con márgenes de 24 px.

## Piezas de UI nuevas
| Pieza | Por qué hace falta | Agregada al sistema |
|---|---|---|
| Ventana flotante con fondo oscurecido | No había ninguna ventana encima de la app (todo es panel o desplegable) | sí: `06-ui.md` › Tema Carbón; maqueta `ui/vista-ajustes.html` |
| Navegación de secciones a la izquierda dentro de la ventana | Como Obsidian y Claude Desktop (Q-84) | sí: maqueta `ui/vista-ajustes.html` |
| Tarjeta de tema con miniatura | Elegir un tema viéndolo | sí: maqueta `ui/vista-ajustes.html` |
| Varios temas | Iridium y Carbón (D-066) | sí: `docs/ui/tokens.css`, `DESIGN.md` › Themes |
