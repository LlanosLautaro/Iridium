// S-5 — Paridad: qué deja hacer el motor (comandos, fotos, archivos). Descartable.
// Correr con SANDBOX=<carpeta fuera del repo> PLUGIN=<ruta del plugin iridium> node spike.mjs [comandos|foto|barra]
import { query, getSessionMessages } from '@anthropic-ai/claude-agent-sdk'
import { deflateSync } from 'node:zlib'

const sandbox = process.env.SANDBOX
const plugin = process.env.PLUGIN
const que = process.argv[2] ?? 'comandos'
const log = (...a) => console.log(...a)

function png(ancho, alto, [r, g, b]) {
  const crc = (buf) => {
    let c, crcT = []
    for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0 }
    let x = 0xffffffff
    for (const v of buf) x = crcT[(x ^ v) & 0xff] ^ (x >>> 8)
    return (x ^ 0xffffffff) >>> 0
  }
  const trozo = (tipo, datos) => {
    const t = Buffer.from(tipo); const l = Buffer.alloc(4); l.writeUInt32BE(datos.length)
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, datos])))
    return Buffer.concat([l, t, datos, c])
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(ancho, 0); ihdr.writeUInt32BE(alto, 4); ihdr[8] = 8; ihdr[9] = 2
  const filas = []
  for (let y = 0; y < alto; y++) { filas.push(0); for (let x = 0; x < ancho; x++) filas.push(r, g, b) }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), trozo('IHDR', ihdr), trozo('IDAT', deflateSync(Buffer.from(filas))), trozo('IEND', Buffer.alloc(0))])
}

const base = {
  cwd: sandbox,
  settingSources: ['user', 'project', 'local'],
  permissionMode: 'bypassPermissions',
  allowDangerouslySkipPermissions: true,
  disallowedTools: ['AskUserQuestion'],
  model: 'haiku',
  ...(plugin ? { plugins: [{ type: 'local', path: plugin }] } : {}),
}

async function conMensajes(mensajes) {
  const cola = [...mensajes]
  let soltar
  async function* entrada() {
    for (const m of cola) {
      yield m
      await new Promise((r) => { soltar = r })
    }
  }
  const s = query({ prompt: entrada(), options: base })
  let id = null
  for await (const m of s) {
    if (m.type === 'system' && m.subtype === 'init') { id = m.session_id; log('init: slash_commands', m.slash_commands?.length) }
    else if (m.type === 'assistant') log('ia:', JSON.stringify(m.message.content).slice(0, 400))
    else if (m.type === 'user') log('usuario (eco):', JSON.stringify(m.message.content).slice(0, 400))
    else if (m.type === 'result') { log('result:', m.subtype, m.is_error, JSON.stringify(m.result ?? m.errors).slice(0, 400), 'costo', m.total_cost_usd); soltar?.() ; if (!cola.length) break }
    else log('otro:', m.type, m.subtype ?? '', JSON.stringify(m).slice(0, 300))
  }
  return id
}

const usuario = (content) => ({ type: 'user', message: { role: 'user', content }, parent_tool_use_id: null })

if (que === 'comandos') {
  let soltar
  async function* nada() { await new Promise((r) => { soltar = r }) }
  const s = query({ prompt: nada(), options: base })
  const leer = (async () => { for await (const _ of s) {} })().catch(() => {})
  const cmds = await s.supportedCommands()
  const init = await s.initializationResult()
  soltar(); await leer
  log('comandos:', cmds.length, 'de Claude Code:', cmds.filter((c) => c.builtin).length)
  for (const c of cmds) log(`${c.builtin ? 'CC ' : '   '}/${c.name}${c.argumentHint ? ' ' + c.argumentHint : ''}${c.aliases?.length ? ' (= ' + c.aliases.join(', ') + ')' : ''} — ${c.description.slice(0, 90)}`)
  log('claves del init:', Object.keys(init).join(', '))
} else if (que === 'foto') {
  const data = png(64, 64, [220, 30, 30]).toString('base64')
  const id = await conMensajes([usuario([
    { type: 'image', source: { type: 'base64', media_type: 'image/png', data } },
    { type: 'text', text: '¿De qué color es esta imagen? Respondé con una sola palabra, sin usar herramientas.' },
  ])])
  const hist = await getSessionMessages(id, { dir: sandbox })
  for (const m of hist) log('historial:', m.type, JSON.stringify(m.message?.content ?? m).slice(0, 200))
} else if (que === 'barra') {
  for (const c of (process.argv[3] ?? '/context').split(',')) {
    log('\n=== ', c)
    await conMensajes([usuario(c)])
  }
}
