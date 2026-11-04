// S-2 — ¿El Agent SDK corre dentro del proceso principal de Electron? Sin ventana; sale al terminar.
import { app } from "electron";
import { query } from "@anthropic-ai/claude-agent-sdk";
app.whenReady().then(async () => {
  console.log("electron", process.versions.electron, "node", process.versions.node);
  try {
    for await (const m of query({ prompt: "Respondé solo 'hola desde electron'.", options: { cwd: process.env.SANDBOX, model: "haiku", settingSources: [] } })) {
      if (m.type === "system" && m.subtype === "init") console.log("init apiKeySource=" + m.apiKeySource);
      if (m.type === "assistant") for (const b of m.message.content) if (b.type === "text") console.log("texto:", b.text);
      if (m.type === "result") console.log("resultado:", m.subtype);
    }
  } catch (e) { console.log("ERROR", e.message); }
  app.quit();
});
