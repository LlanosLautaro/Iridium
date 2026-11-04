---
version: 1
slug: "docs-ui-vista-proyecto-html"
primary_target: "docs/ui/vista-proyecto.html"
related_targets: []
---

# Vista de un proyecto (W-3, con el marco W-1 y W-4)

Scope: primera superficie del Centro, prototipo HTML de alta fidelidad. Modo: Operate.
Audiencia y tarea: el usuario único conversa con la IA de un proyecto; ve qué espera de él y lo responde. Contenido: el propio Centro en el hito 6, datos de muestra.
Restricciones: solo oscuro y tranquilo (D-029); disposición de VS Code (D-031); estilo F4 (D-032); estado con ícono y palabra; teclado; español rioplatense; escritorio Windows, 1280–1920.
Historial: Manual con pestañas (D-030) descartado por cargado; grises cálidos (D-031) descartados por color; tres rondas desde `imagenes de prueba/` en `docs/ui/alternativas/` (generador `generar.py`).

## Direction contract

THESIS: La conversación es lo único a la vista, en una consola de fósforo que se lee como un libro. Rechaza la terminal disfrazada (mayúsculas, rayas, brillo) y el tablero cargado.

OWN-WORLD: Casi negro con tinte verde (#0a0f0e, laterales #070b0a, bordes #18241f); un verde de fósforo #3ee6a8 para lo activo y el foco; ámbar #f5b13d para lo que espera del usuario; rojo #ff5f57 para error. Chakra Petch para todo lo que se lee, JetBrains Mono solo para códigos y números. Esquinas redondeadas, tarjetas suaves con fondo apenas teñido, medidores finos con brillo leve.

STORY: Al abrir un proyecto el usuario lee la conversación sin distracciones, ve en la pestaña y en la barra de estado si la IA trabaja, y responde la Q-n desde su tarjeta ámbar; despliega el mapa solo cuando lo necesita.

FIRST VIEWPORT: Actividad 52 px a la izquierda; pestañas de sesión con chip de estado; migas con «1 pendiente» ámbar y, a la derecha, intercambiar y panel. Conversación centrada a 780 px, herramientas plegadas, la Q-n en tarjeta ámbar con Responder lleno; compositor en tarjeta con Detener. Barra de estado: Trabajando, hito, contexto y uso en medidores finos. Aviso de otra app abajo a la derecha.

FORM: Síntesis de tres referencias del usuario (consola pixel, centro de mando, diario terminal) con la letra del centro de mando, afinada en tres rondas hasta F4. La tirada de conceptos no quedó registrada (el seed 40a04633 no tiene respaldo): la dirección sale de las tres rondas del usuario, no de la tirada. Interacción firma: el panel que se despliega con Ctrl+B, se ensancha arrastrando y se intercambia sin cambiar la jerarquía.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
