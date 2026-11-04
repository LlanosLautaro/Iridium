// S-1 — Spike descartable: Agent SDK con la suscripción, dos sesiones a la vez,
// estados de sesión, pedidos de permiso, retomar una sesión y ver el uso.
// No es código de producto.
import { query } from "@anthropic-ai/claude-agent-sdk";
import { mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

process.env.CLAUDE_CODE_EMIT_SESSION_STATE_EVENTS = "1";
const MODEL = "haiku";
const t0 = Date.now();
const log = (who, ...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${who}:`, ...a);

async function run(who, cwd, prompt, extra = {}) {
  mkdirSync(cwd, { recursive: true });
  let sessionId;
  const q = query({
    prompt,
    options: {
      cwd,
      model: MODEL,
      permissionMode: "default",
      settingSources: [],
      canUseTool: async (toolName, input) => {
        log(who, `PERMISO pedido: ${toolName}`, JSON.stringify(input).slice(0, 80));
        await new Promise((r) => setTimeout(r, 4000)); // simula a la persona pensando
        log(who, "PERMISO concedido");
        return { behavior: "allow", updatedInput: input };
      },
      ...extra,
    },
  });
  for await (const m of q) {
    if (m.type === "system" && m.subtype === "init") {
      sessionId = m.session_id;
      log(who, `init — apiKeySource=${m.apiKeySource} session=${m.session_id.slice(0, 8)}`);
    } else if (m.type === "system" && m.subtype === "session_state_changed") {
      log(who, `estado → ${m.state}`);
    } else if (m.type === "rate_limit_event") {
      log(who, "rate_limit_event", JSON.stringify(m.rate_limit_info));
    } else if (m.type === "assistant") {
      for (const b of m.message?.content ?? []) if (b.type === "text") log(who, "texto:", b.text.slice(0, 300));
    } else if (m.type === "result") {
      log(who, `resultado: ${m.subtype}, turnos=${m.num_turns}, costo equivalente API=$${m.total_cost_usd?.toFixed(4)}`);
    }
  }
  return sessionId;
}

const A = join(process.cwd(), "sandbox-a");
const B = join(process.cwd(), "sandbox-b");
const tarea = (n) => `Creá un archivo ${n}.txt con el texto "hola desde ${n}". Después respondé solo "listo".`;

console.log("== 1) Dos sesiones a la vez ==");
const [idA] = await Promise.all([run("A", A, tarea("proyecto-a")), run("B", B, tarea("proyecto-b"))]);
console.log("archivos:", existsSync(join(A, "proyecto-a.txt")) && readFileSync(join(A, "proyecto-a.txt"), "utf8"),
  "|", existsSync(join(B, "proyecto-b.txt")) && readFileSync(join(B, "proyecto-b.txt"), "utf8"));

console.log("\n== 2) Retomar la sesión A en otro proceso lógico ==");
await run("A2", A, "¿Qué archivo creaste antes y con qué texto? Respondé en una línea.", { resume: idA });

console.log("\n== 3) Uso de la suscripción (/usage) ==");
await run("U", A, "/usage");
