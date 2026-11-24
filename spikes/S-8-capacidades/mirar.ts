// S-8 (T-28): qué complementos, servidores MCP y herramientas del navegador ve una sesión como las de Iridium,
// con el Claude Code real y sin mandar mensajes (no gasta uso). Con `--chrome`, lo mismo con Claude in Chrome.
// Uso: node --experimental-strip-types spikes/S-8-capacidades/mirar.ts [--chrome]
import { writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { type Options, query } from '@anthropic-ai/claude-agent-sdk'

const chrome = process.argv.includes('--chrome')
let soltar = () => {}
const espera = new Promise<void>((r) => {
  soltar = r
})
// biome-ignore lint/correctness/useYield: no manda nada; solo espera a que se cierre.
async function* entrada(): AsyncGenerator<never> {
  await espera
}
const options: Options = {
  cwd: homedir(),
  settingSources: ['user', 'project', 'local'],
  ...(chrome ? { extraArgs: { chrome: null } } : {}),
}
const sesion = query({ prompt: entrada(), options })
let inicio: unknown
const termino = (async () => {
  for await (const m of sesion) {
    if (m.type === 'system' && m.subtype === 'init') inicio = m
  }
})().catch(() => {})
try {
  const comandos = await sesion.supportedCommands()
  const init = await sesion.initializationResult()
  await new Promise((r) => setTimeout(r, 8000))
  const mcp = await sesion.mcpServerStatus()
  const salida = {
    chrome,
    comandos: comandos.length,
    complementos: (init as { plugins_applied?: unknown }).plugins_applied ?? null,
    mcp: mcp.map((s) => ({ nombre: s.name, estado: s.status, herramientas: s.tools?.length ?? null })),
    inicio,
  }
  writeFileSync(join(import.meta.dirname, chrome ? 'salida-chrome.json' : 'salida.json'), JSON.stringify(salida, null, 2))
  console.log(JSON.stringify({ ...salida, inicio: undefined }, null, 2))
} finally {
  soltar()
  await termino
}
