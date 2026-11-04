// Corre el spike: Vite con React 19, el receptor y la app en Electron 44 (y en Edge, si se puede cargar la extensión).
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { arrancarReceptor } from './receptor.mjs'

const aqui = path.dirname(fileURLToPath(import.meta.url))
const recibidos = []
const receptor = await arrancarReceptor((d) => recibidos.push(d))
const vite = await createServer({ root: path.join(aqui, 'app'), plugins: [react()], server: { port: 5199, strictPort: true }, logLevel: 'warn' })
await vite.listen()
const URL_APP = 'http://localhost:5199/'

function resumen(d) {
  return { origen: d.origen, url: d.url, texto: d.texto, rect: d.rect, hayFibra: d.pista?.hayFibra, componentes: d.pista?.componentes,
    reactVisibleDesdeAislado: d.reactVisibleDesdeAislado, informeSw: d.informe, fuente: d.fuente }
}

// Electron
const electron = path.join(aqui, '../../node_modules/electron/dist/electron.exe')
const env = { ...process.env, S3_URL: URL_APP }
delete env.ELECTRON_RUN_AS_NODE
await new Promise((r) => {
  const p = spawn(electron, [path.join(aqui, 'electron-main.cjs')], { env })
  p.stdout.on('data', (b) => { for (const l of String(b).split('\n')) if (l.startsWith('S3-ELECTRON')) console.log('\n== Electron 44 ==\n' + JSON.stringify(JSON.parse(l.slice(12)), null, 2)) })
  p.stderr.on('data', () => {})
  p.on('exit', r)
})
console.log('\n== Recibido en el receptor desde Electron ==\n' + JSON.stringify(recibidos.map(resumen), null, 2))

// Edge con la extensión (Playwright, canal msedge)
recibidos.length = 0
try {
  const { chromium } = await import('@playwright/test')
  const ctx = await chromium.launchPersistentContext('', { channel: process.env.S3_CANAL ?? 'msedge', headless: false,
    args: [`--disable-extensions-except=${path.join(aqui, 'extension')}`, `--load-extension=${path.join(aqui, 'extension')}`] })
  const page = await ctx.newPage()
  const llego = new Promise((r) => page.on('console', (m) => { if (m.text().startsWith('S3-RESULTADO')) r(JSON.parse(m.text().slice(13))) }))
  await page.goto(URL_APP)
  const r = await Promise.race([llego, new Promise((res) => setTimeout(() => res({ tiempoAgotado: true }), 15000))])
  console.log('\n== Navegador (' + (process.env.S3_CANAL ?? 'msedge') + ') ==\n' + JSON.stringify(r, null, 2))
  console.log('\n== Recibido en el receptor desde el navegador ==\n' + JSON.stringify(recibidos.map(resumen), null, 2))
  await ctx.close()
} catch (e) { console.log('\n== Navegador: no se pudo ==\n' + e.message.split('\n')[0]) }

await vite.close(); receptor.close()
