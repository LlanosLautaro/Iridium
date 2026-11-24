# Capacidades del motor: complementos, navegador y la PC

**Fecha:** 2026-11-24 · **Para:** Paridad, segunda parte (T-28) · **Spike:** S-8 (`spikes/S-8-capacidades/`)

Con el Claude Code que trae Iridium (SDK 0.3.309, Claude Code 2.1.309, Windows 11) y las mismas fuentes de configuración que una sesión de Iridium (`user`, `project`, `local`).

## 1. Complementos (plugins)
- **Ya cargan.** Los complementos de la cuenta de Claude (los que se suman en claude.ai y Claude Code copia a `.claude\plugins\synced`) entran en cada sesión de Iridium sin hacer nada: sus skills y sus comandos están en la lista de «/» desde PA-I1. Hoy son tres: `engineering`, `design` e `impeccable`. El de Iridium (el framework) se suma aparte (D-086).
- **Lo que no anda: sus conectores.** Un complemento puede traer conectores (servidores MCP): `engineering` trae Slack, Linear, Notion, Atlassian, Datadog, Gmail y Calendar; `design`, Figma e Intercom. En una sesión de Iridium quedan «piden iniciar sesión» o «fallaron»: iniciar sesión abre una ventana del navegador, y Claude Code solo lo hace desde su pantalla interactiva (`/mcp`). Lo mismo los conectores de claude.ai (Gmail, Drive, Calendar); Claude Docs ya está conectado.
- **Se puede saber sin gastar.** La sesión dice el estado de cada conector (`mcpServerStatus`: conectado, pide sesión, falló, apagado) y deja prenderlos, apagarlos y reconectarlos (`toggleMcpServer`, `reconnectMcpServer`). Agregar o sacar complementos es `claude plugin install/uninstall` o desde claude.ai.
- **Para iniciar sesión en un conector** alcanza con abrir Claude Code en una consola y entrar a `/mcp`: desde T-116 Iridium tiene consolas de verdad adentro (es lo que hace «Iniciar sesión en Claude»). Falta probar que el inicio de sesión de un conector termine bien desde ahí.

## 2. El navegador
- **Claude in Chrome** viene dentro de Claude Code: con la opción `--chrome` (en el SDK, `extraArgs: { chrome: null }`) la sesión suma `claude-in-chrome`, conectado, con 22 herramientas (abrir pestañas, leer la página, hacer clic, escribir, capturas, la consola). Anda en Windows.
- Maneja **el navegador del usuario**, con sus cuentas iniciadas, a través de la extensión «Claude» (de Anthropic), con la misma cuenta. Claude Code reconoce Chrome, Brave, Edge, Chromium, Arc, Vivaldi y Opera. En esta PC la extensión está en Brave (perfil «Lautaro») y el puente de Brave está registrado; en Chrome, no.
- **La otra manera:** un navegador aparte manejado por Playwright (el servidor MCP de Microsoft). No usa las cuentas del usuario ni pide extensión, pero tampoco ve lo que el usuario tiene abierto ni sus sesiones, y es un navegador más para instalar.
- No gasta más por estar prendido; las herramientas solo se cargan cuando la IA las busca.

## 3. Usar la PC (*computer use*)
- **En Windows, Claude Code no lo tiene.** El `claude.exe` de Windows dice «Computer control is macOS-only» y la documentación de Claude Code, «Computer use in the CLI is not available on Linux or Windows. On Windows, use Desktop instead». En Windows lo tiene la app de escritorio de Claude (desde abril de 2026, en vista previa), que Iridium no puede usar desde sus sesiones. Hay pedidos abiertos para que llegue a Claude Code en Windows, sin fecha. Además, pide una sesión interactiva (no anda con `-p`), así que el Agent SDK no lo tendría ni en Mac (`modulos/paridad/investigacion.md` › La PC).
- **Servidores de terceros:** Windows-MCP (CursorTouch, MIT, el más usado: Python 3.13 y uv), `windows-computer-use-mcp` (npm) y `mcp-windows` (.NET 8). Dan capturas, mouse, teclado y leer las ventanas. Son código de otros con control total del escritorio: en P2, se instalan solo con el ok explícito del usuario.
- **Uno propio de Iridium:** Iridium ya saca capturas (Electron) y podría servir mouse y teclado con una pieza nativa, como un servidor MCP suyo (va con la idea de T-118, el MCP de Iridium). Es el trabajo más grande y lo que hace con la PC queda a cargo de Iridium.

## Fuentes
- `spikes/S-8-capacidades/` (las salidas de la sesión real).
- [Claude Code: computer use](https://code.claude.com/docs/en/computer-use) y el pedido [anthropics/claude-code#64381](https://github.com/anthropics/claude-code/issues/64381).
- [Anthropic brings Claude computer use to Windows](https://www.thurrott.com/a-i/anthropic/334498/anthropic-brings-claude-computer-use-to-windows).
- [CursorTouch/Windows-MCP](https://raw.githubusercontent.com/CursorTouch/Windows-MCP/main/README.md), [sbroenne/mcp-windows](https://github.com/sbroenne/mcp-windows).
