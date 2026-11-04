// Programa local de prueba: recibe el comentario en 127.0.0.1 y resuelve la pila de React a archivo y línea con el mapa de fuentes de Vite.
import http from 'node:http'
import { TraceMap, originalPositionFor } from '../../node_modules/.pnpm/@jridgewell+trace-mapping@0.3.31/node_modules/@jridgewell/trace-mapping/dist/trace-mapping.mjs'

export const PUERTO = 47321

async function resolver(pila) {
  if (!pila) return null
  const marcos = [...pila.matchAll(/(?:at (\S+) \()?(https?:\/\/[^\s)]+):(\d+):(\d+)/g)]
    .map((m) => ({ funcion: m[1], url: m[2], linea: +m[3], columna: +m[4] }))
    .filter((m) => !m.url.includes('/node_modules/') && !m.url.includes('/@'))
  const m = marcos[0]
  if (!m) return { marcos }
  const codigo = await (await fetch(m.url)).text()
  const b64 = codigo.match(/sourceMappingURL=data:application\/json;(?:charset=utf-8;)?base64,([A-Za-z0-9+/=]+)/)
  if (!b64) return { marco: m, sinMapa: true }
  const mapa = new TraceMap(JSON.parse(Buffer.from(b64[1], 'base64').toString('utf8')))
  const o = originalPositionFor(mapa, { line: m.linea, column: m.columna - 1 })
  return { marco: m, original: o }
}

export function arrancarReceptor(alRecibir) {
  const s = http.createServer(async (req, res) => {
    const origen = req.headers.origin ?? '(sin origen)'
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }
    let cuerpo = ''
    for await (const c of req) cuerpo += c
    const datos = JSON.parse(cuerpo)
    let fuente
    try { fuente = await resolver(datos.pista?.pila) } catch (e) { fuente = { error: String(e) } }
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end('guardado')
    alRecibir({ origen, ...datos, fuente })
  })
  return new Promise((r) => s.listen(PUERTO, '127.0.0.1', () => r(s)))
}
