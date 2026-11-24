// S-8 (T-28): ¿apagar un conector con toggleMcpServer queda guardado en la configuración de Claude Code (~/.claude.json)
// o solo vale para esa sesión? Apaga «plugin:design:intercom», mira, y lo vuelve a prender. No gasta uso.
// Uso: node --experimental-strip-types spikes/S-8-capacidades/apagar.ts <carpeta>
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { query } from '@anthropic-ai/claude-agent-sdk'

const carpeta = process.argv[2] ?? homedir()
const NOMBRE = 'plugin:design:intercom'
const config = () => readFileSync(join(homedir(), '.claude.json'), 'utf8')

async function sesion<T>(hacer: (q: ReturnType<typeof query>) => Promise<T>): Promise<T> {
  let soltar = () => {}
  const espera = new Promise<void>((r) => {
    soltar = r
  })
  // biome-ignore lint/correctness/useYield: no manda nada; solo espera a que se cierre.
  async function* entrada(): AsyncGenerator<never> {
    await espera
  }
  const q = query({ prompt: entrada(), options: { cwd: carpeta, settingSources: ['user', 'project', 'local'] } })
  const termino = (async () => {
    for await (const _ of q) {
      // nada
    }
  })().catch(() => {})
  try {
    await q.supportedCommands()
    return await hacer(q)
  } finally {
    soltar()
    await termino
  }
}

const antes = config()
await sesion(async (q) => {
  await q.toggleMcpServer(NOMBRE, false)
  console.log('en la sesión:', (await q.mcpServerStatus()).find((s) => s.name === NOMBRE)?.status)
})
const despues = config()
console.log('¿cambió ~/.claude.json?', antes !== despues)
console.log('¿lo nombra como apagado?', /disabledMcpServers[^\]]*intercom/.test(despues))
const otra = await sesion(async (q) => (await q.mcpServerStatus()).find((s) => s.name === NOMBRE)?.status)
console.log('en una sesión nueva:', otra)
if (otra === 'disabled') {
  await sesion((q) => q.toggleMcpServer(NOMBRE, true))
  console.log('vuelto a prender; ¿igual que antes?', config() === antes)
}
