// S-1 — lista las sesiones guardadas del proyecto (incluidas las de VS Code / CLI)
import { listSessions } from "@anthropic-ai/claude-agent-sdk";
const dir = process.argv[2];
const s = await listSessions({ dir });
console.log(`${s.length} sesiones en ${dir}`);
for (const x of s.slice(0, 5)) console.log(new Date(x.lastModified).toISOString().slice(0,16), x.sessionId.slice(0,8), "|", (x.customTitle || x.summary || x.firstPrompt || "").slice(0, 70));
