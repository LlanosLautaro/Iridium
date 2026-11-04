# Definición del módulo: Apariencia y ajustes

**Fecha:** 2026-10-30 (Q-84, D-065)

## Objetivo del módulo
Una ventana de Ajustes, como la de Obsidian o Claude Desktop, con lo poco que el usuario quiere elegir: cómo se llama él, cómo se llama la IA, el tono con que le habla y el tema de la app. Y un segundo tema, sobrio.

## Criterios de éxito
- El usuario cambia el tema y lo ve aplicado al instante en toda la app, y al volver a abrir Iridium sigue igual.
- Su nombre y el de la IA aparecen donde hoy dice «Vos» e «IA» en la conversación.
- El tono elegido se nota en las respuestas de la IA en las sesiones de Iridium.

## Funcionalidades
### Must (MVP del módulo)
- **La ventana de Ajustes:** flota sobre la app (el resto queda oscurecido detrás), con las secciones a la izquierda y su contenido a la derecha. Se abre con un ⚙ abajo en la barra de la izquierda y con `Ctrl+,`; se cierra con `Esc` o la ✕. Lo que se cambia se guarda solo, sin botón Guardar.
- **Perfil:** el nombre del usuario. Se ve en la conversación en lugar de «Vos».
- **IA:**
  - Su nombre, opcional (sin nombre sigue diciendo «IA»). Por ahora solo se ve en la conversación; no cambia nada de cómo trabaja.
  - **Tono:** los estilos de respuesta que ya trae Claude Code (*output styles*: el normal, «Explicativo», «Aprendizaje» y los que haya en `~/.claude/output-styles/`). No se inventa nada propio (Q-84). Vale solo para las sesiones de Iridium: VS Code y la terminal siguen con el suyo.
- **Apariencia:** elegir el tema entre el de siempre (Iridium, verde) y el sobrio. El elegido se aplica en el momento.
- **El tema sobrio:** uno de los de `docs/ui/alternativas/temas/`, elegido por el usuario (Q-85), aplicado a todas las pantallas.

### Should
- Que el tono se pueda probar: una línea que explica qué cambia cada estilo.

### Could
- Un tema claro.

### Won't (por ahora)
- Foto o avatar del usuario — no lo pidió (Q-84).
- Que la IA use su nombre o una personalidad propia más allá de los estilos de Claude Code — habría que inventarla (Q-84).
- Mover a Ajustes el modelo y el esfuerzo por defecto o el ancho del texto de Docs — «nada más por ahora» (Q-84); siguen donde están.
- Editar los colores de un tema a mano — más trabajo y fácil de dejar algo ilegible (propuesta).

## Fuera de alcance
- La carpeta de proyectos y las actualizaciones: las suma el frente Compartir a esta misma ventana, como secciones nuevas.
- Lo que la IA sabe del usuario (las instrucciones globales): sigue en `Skills`.

## Impacto en el perfil
Nada sale de la PC: los ajustes se guardan en la carpeta de datos de Iridium. El tono es un ajuste que Claude Code ya tiene. Sigue en P2.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Tema | El juego de colores, letra y esquinas de toda la app (los tokens de `docs/ui/tokens.css`) |
| Tono | El estilo de respuesta de Claude Code (*output style*) que usan las sesiones de Iridium |

## Preguntas abiertas para investigar
- Cómo se le pasa el tono a una sesión sin tocar los ajustes de Claude Code de la PC (diseño técnico: el SDK acepta ajustes propios por sesión).
- Si al cambiar de tono una conversación ya empezada lo toma en el mensaje siguiente o hace falta una conversación nueva.
