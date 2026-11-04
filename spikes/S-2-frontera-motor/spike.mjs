// S-2 — Spike descartable: lo que el hito 4 dejó para la frontera con el motor.
// 1) bypass: ¿qué pedidos de permiso llegan igual? (rechazo automático)
// 2) instrucción propia (append al system prompt) y AskUserQuestion desactivada
// 3) Detener (interrupt) y retomar
// 4) contexto y uso de la suscripción sin mandar un mensaje
// 5) la misma conversación abierta dos veces a la vez
// No es código de producto.
import { query } from "@anthropic-ai/claude-agent-sdk";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

process.env.CLAUDE_CODE_EMIT_SESSION_STATE_EVENTS = "1";
const MODEL = "haiku";
const t0 = Date.now();
const log = (who, ...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${who}:`, ...a);
const INSTRUCCION =
  "Trabajás dentro del Centro de Desarrollo. Nunca esperes al usuario ni le hagas preguntas en el chat: " +
  "si necesitás algo de él, anotalo como Q-n en 'Preguntas abiertas' de docs/estado.md y cerrá la iteración.";

// Fuera del repo del Centro: dentro, la sesión cargaba el CLAUDE.md del Centro y se confundía de proyecto.
const P = process.env.SANDBOX ?? join(process.cwd(), "sandbox-p");
mkdirSync(join(P, "docs"), { recursive: true });
writeFileSync(join(P, "docs", "estado.md"), "# Estado\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nElegir el color del logo.\n");
if (!existsSync(join(P, ".git"))) execSync("git init -q", { cwd: P });

const permisos = [];
function opciones(extra = {}) {
  return {
    cwd: P,
    model: MODEL,
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
    disallowedTools: ["AskUserQuestion"],
    systemPrompt: { type: "preset", preset: "claude_code", append: INSTRUCCION },
    settingSources: ["project"],
    canUseTool: async (tool, input, { blockedPath }) => {
      permisos.push({ tool, blockedPath, input: JSON.stringify(input).slice(0, 100) });
      log("permiso", `PEDIDO en bypass: ${tool} ${blockedPath ?? ""} ${JSON.stringify(input).slice(0, 100)} → rechazado`);
      return { behavior: "deny", message: "El Centro no responde permisos. Anotalo como Q-n en docs/estado.md y seguí con otra cosa." };
    },
    ...extra,
  };
}

async function correr(who, q, { cortarA } = {}) {
  let id;
  let cortado = false;
  try {
  for await (const m of q) {
    if (m.type === "system" && m.subtype === "init") {
      id = m.session_id;
      log(who, `init session=${id.slice(0, 8)} modo=${m.permissionMode} tools(AskUserQuestion)=${m.tools.includes("AskUserQuestion")}`);
    } else if (m.type === "system" && m.subtype === "session_state_changed") {
      log(who, `estado → ${m.state}`);
    } else if (m.type === "assistant") {
      for (const b of m.message?.content ?? []) {
        if (b.type === "text") log(who, "texto:", b.text.slice(0, 200).replace(/\n/g, " "));
        if (b.type === "tool_use") {
          log(who, "herramienta:", b.name, JSON.stringify(b.input).slice(0, 90));
          if (cortarA && !cortado && b.name === cortarA) {
            cortado = true;
            log(who, ">>> DETENER");
            await q.interrupt();
          }
        }
      }
    } else if (m.type === "result") {
      log(who, `resultado: ${m.subtype} turnos=${m.num_turns}`);
    } else if (m.type === "system" && m.subtype !== "init" && m.subtype !== "session_state_changed") {
      if (m.subtype !== "thinking_tokens") log(who, `system/${m.subtype}`);
    }
  }
  } catch (e) {
    log(who, "EXCEPCIÓN del SDK:", String(e.message).slice(0, 160));
  }
  return id;
}

console.log("== 1+2) bypass, rutas protegidas, instrucción y sin AskUserQuestion ==");
const id1 = await correr("A", query({
  prompt:
    "Seguí con el proyecto. " +
    "El Próximo paso de docs/estado.md pide elegir el color del logo: eso lo decide el usuario, resolvelo como corresponde.",
  options: opciones(),
}));
console.log("permisos pedidos en bypass:", permisos.length, JSON.stringify(permisos));
console.log("estado.md después:\n" + readFileSync(join(P, "docs", "estado.md"), "utf8"));
// console.log(".git/hooks/pre-commit existe:", existsSync(join(P, ".git/hooks/pre-commit")), "| .claude/settings.json existe:", existsSync(join(P, ".claude/settings.json")));

console.log("\n== 3) Detener en medio y retomar ==");
const id3 = await correr("B", query({
  prompt: "Corré con Bash el comando: powershell -Command \"Start-Sleep 20; 'fin'\" y después creá lento.txt con 'terminé'.",
  options: opciones(),
}), { cortarA: "Bash" });
console.log("lento.txt existe tras detener:", existsSync(join(P, "lento.txt")));
await correr("B2", query({ prompt: "¿Qué te pedí en el mensaje anterior y llegaste a terminarlo? Una línea.", options: opciones({ resume: id3 }) }));

console.log("\n== 4) Contexto y uso sin mandar mensajes ==");
let soltar;
const espera = new Promise((r) => (soltar = r));
async function* sinMensajes() { await espera; }
const q4 = query({ prompt: sinMensajes(), options: opciones({ resume: id1 }) });
const lector = correr("C", q4);
const tc = Date.now();
const ctx = await q4.getContextUsage({ detail: "summary" });
log("C", `contexto: ${ctx.percentage ?? "?"} % (${ctx.totalTokens ?? ctx.total_tokens} de ${ctx.rawMaxTokens ?? ctx.raw_max_tokens ?? ctx.maxTokens}) en ${Date.now() - tc} ms`);
const tu = Date.now();
const uso = await q4.usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET({ skipBehaviors: true });
log("C", `uso en ${Date.now() - tu} ms:`, JSON.stringify(uso.rate_limits ?? uso).slice(0, 600));
soltar();
await lector;

console.log("\n== 5) La misma conversación abierta dos veces a la vez ==");
const r5 = await Promise.allSettled([
  correr("D1", query({ prompt: "Respondé solo 'uno'.", options: opciones({ resume: id1 }) })),
  correr("D2", query({ prompt: "Respondé solo 'dos'.", options: opciones({ resume: id1 }) })),
]);
console.log("resultado:", r5.map((x) => x.status + (x.reason ? " " + String(x.reason).slice(0, 200) : "")));
