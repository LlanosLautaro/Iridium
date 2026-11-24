// S-8 (PA-I4): el estado de cada conector con su error, su alcance y su origen, como lo pide Iridium. No gasta uso.
// Uso: node --experimental-strip-types spikes/S-8-capacidades/estado.ts
import { homedir } from 'node:os'
import { query } from '@anthropic-ai/claude-agent-sdk'

let soltar = () => {}
const espera = new Promise<void>((r) => {
  soltar = r
})
// biome-ignore lint/correctness/useYield: no manda nada; solo espera a que se cierre.
async function* entrada(): AsyncGenerator<never> {
  await espera
}
const q = query({ prompt: entrada(), options: { cwd: homedir(), settingSources: ['user', 'project', 'local'] } })
const termino = (async () => {
  for await (const _ of q) {
    // nada
  }
})().catch(() => {})
try {
  const inicio = Date.now()
  let lista = await q.mcpServerStatus()
  while (lista.some((s) => s.status === 'pending') && Date.now() - inicio < 15_000) {
    await new Promise((r) => setTimeout(r, 500))
    lista = await q.mcpServerStatus()
  }
  console.log(`a los ${Date.now() - inicio} ms`)
  for (const s of lista)
    console.log(JSON.stringify({ n: s.name, e: s.status, err: s.error, scope: s.scope, source: s.source, t: s.tools?.length }))
} finally {
  soltar()
  await termino
}
