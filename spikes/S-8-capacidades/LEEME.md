# S-8 — Qué capacidades ve una sesión de Iridium (T-28)

**Pregunta:** con el Claude Code que trae Iridium (SDK 0.3.309, Claude Code 2.1.309) y las mismas fuentes de configuración que una sesión de Iridium, ¿qué complementos, conectores, navegador y uso de la PC tiene la IA? ¿Se puede saber sin gastar uso?

**Cómo:** `mirar.ts` abre una sesión sin mandar mensajes (no gasta), pide los comandos y, a los 8 s, el estado de cada servidor MCP. Con `--chrome`, lo mismo prendiendo Claude in Chrome (`extraArgs: { chrome: null }`). Lo de la PC, en las cadenas del `claude.exe` de Windows y en la documentación.

**Resultado (2026-11-24):**
- **Complementos:** los de la cuenta (`engineering`, `design`, `impeccable`, en `.claude\plugins\synced`) ya cargan en cada sesión: sus skills y comandos están en la lista de «/» (85 comandos). Sus conectores (Slack, Linear, Figma, Notion…) quedan en `needs-auth` o `failed`: necesitan iniciar sesión, y una sesión de Iridium no puede abrir esa ventana. Los conectores de claude.ai también aparecen (Claude Docs conectado; Gmail, Drive y Calendar piden sesión). `mcpServerStatus()` da el estado de cada uno sin gastar (`salida.json`).
- **Navegador:** con `--chrome` aparece `claude-in-chrome` conectado con 22 herramientas, en Windows (`salida-chrome.json`). Maneja el Chrome del usuario, con sus sesiones iniciadas, a través de la extensión «Claude» de Chrome. En esta PC el puente de Chrome está registrado pero la extensión no está instalada: hay que instalarla una vez e iniciar sesión con la misma cuenta.
- **La PC:** en Windows no. El `claude.exe` dice «Computer control is macOS-only» y la documentación, «On Windows, use Desktop instead»: en Windows solo lo tiene la app de escritorio de Claude, no Claude Code. Hay servidores MCP de terceros que lo hacen (el más usado, Windows-MCP: Python 3.13 y uv, licencia MIT).
