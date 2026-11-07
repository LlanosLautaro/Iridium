// D-086 con el Claude Code real, sin mandar mensajes (no gasta uso): abre una sesión con los complementos de
// `out/plugins` (los arma `node tools/armar-plugins.mjs`) y lista las skills que ve. Primero sin complementos, para
// comparar: lo que aparece de más es lo que trae Iridium.
// Uso: node --experimental-strip-types tools/probar-complementos.ts
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { type Options, query } from '@anthropic-ai/claude-agent-sdk'

async function skills(plugins: string[]): Promise<string[]> {
  let soltar = () => {}
  const espera = new Promise<void>((r) => {
    soltar = r
  })
  // biome-ignore lint/correctness/useYield: la entrada no manda nada a propósito; solo espera a que se cierre.
  async function* entrada(): AsyncGenerator<never> {
    await espera
  }
  const options: Options = {
    cwd: homedir(),
    settingSources: ['user'],
    plugins: plugins.map((path) => ({ type: 'local' as const, path })),
  }
  const sesion = query({ prompt: entrada(), options })
  const termino = (async () => {
    for await (const _ of sesion) {
      // nada
    }
  })().catch(() => {})
  try {
    const comandos = await sesion.supportedCommands()
    return comandos.map((c) => c.name).sort()
  } finally {
    soltar()
    await termino
  }
}

const base = resolve('out', 'plugins')
const plugins = [join(base, 'iridium')]
for (const p of plugins) if (!existsSync(p)) throw new Error(`Falta ${p}: corré node tools/armar-plugins.mjs`)

const sin = await skills([])
const con = await skills(plugins)
const nuevas = con.filter((s) => !sin.includes(s))
console.log('Lo que suman los complementos:', nuevas.length ? nuevas.join(', ') : '(nada)')
process.exit(nuevas.some((s) => s.includes('iridium')) ? 0 : 1)
